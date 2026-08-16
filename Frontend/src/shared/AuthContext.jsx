import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

const AuthContext = createContext(null);

const SESSION_KEY = "library-auth-session";
const TOKEN_KEY = "library-auth-token";

const API_BASE_URL = "http://localhost:5000/api/auth";

const defaultAccounts = [];

// ============================================
// MAP BACKEND USER TO FRONTEND USER
// ============================================

const mapUserToFrontend = (user) => {
  if (!user) return null;

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    department: user.department || "General",
    stream: user.stream || "General",
    academicYear: user.year || "1st Year",
    semester: user.semester || "Semester 1",
    rollNumber: user.rollNo || "",
    studentId:
      user.studentId ||
      `ST-${user._id ? user._id.slice(-6) : "000000"}`,
    createdAt: user.createdAt,
  };
};

// ============================================
// AUTH PROVIDER
// ============================================

export const AuthProvider = ({ children }) => {
  const [accounts, setAccounts] = useState(defaultAccounts);
  const [currentUser, setCurrentUser] = useState(null);
  const [ready, setReady] = useState(false);

  // ==========================================
  // FETCH REGISTERED USERS - ADMIN
  // ==========================================

  const fetchRegisteredUsers = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.users)) {
        const fetchedAccounts = data.users
          .map(mapUserToFrontend)
          .sort(
            (a, b) =>
              new Date(b.createdAt ?? 0).getTime() -
              new Date(a.createdAt ?? 0).getTime()
          );

        setAccounts(() => {
          const merged = [...fetchedAccounts];

          defaultAccounts.forEach((account) => {
            const exists = merged.some(
              (item) =>
                item.email?.toLowerCase() ===
                account.email?.toLowerCase()
            );

            if (!exists) {
              merged.push(account);
            }
          });

          return merged;
        });
      }
    } catch (error) {
      console.error(
        "Error fetching users from backend:",
        error
      );
    }
  };

  // ==========================================
  // INITIALIZE AUTH
  // ==========================================

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const session = localStorage.getItem(SESSION_KEY);

      if (token && session) {
        try {
          const response = await fetch(`${API_BASE_URL}/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();

            if (data.success && data.user) {
              const mappedUser = mapUserToFrontend(
                data.user
              );

              setCurrentUser(mappedUser);

              localStorage.setItem(
                SESSION_KEY,
                JSON.stringify(mappedUser)
              );

              if (mappedUser.role === "admin") {
                await fetchRegisteredUsers(token);
              }
            } else {
              logout();
            }
          } else {
            logout();
          }
        } catch (error) {
          console.error(
            "Backend auth initialization failed:",
            error
          );

          try {
            setCurrentUser(JSON.parse(session));
          } catch {
            logout();
          }
        }
      } else {
        setCurrentUser(null);
      }

      setReady(true);
    };

    initializeAuth();
  }, []);

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async ({
    email,
    password,
    role,
  }) => {
    try {
      console.log(
        "AuthContext: Sending login request to backend..."
      );

      const response = await fetch(
        `${API_BASE_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "AuthContext: Backend login response:",
        {
          status: response.status,
          data,
        }
      );

      if (!response.ok) {
        return {
          ok: false,
          error:
            data.message ||
            "Invalid credentials. Please try again.",
        };
      }

      if (
        data.success &&
        data.token &&
        data.user
      ) {
        const mappedUser = mapUserToFrontend(
          data.user
        );

        // Check role
        if (
          role &&
          mappedUser.role !== role
        ) {
          return {
            ok: false,
            error:
              role === "admin"
                ? "This account is not an admin account."
                : "This account is not a student account.",
          };
        }

        localStorage.setItem(
          TOKEN_KEY,
          data.token
        );

        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify(mappedUser)
        );

        setCurrentUser(mappedUser);

        if (mappedUser.role === "admin") {
          await fetchRegisteredUsers(
            data.token
          );
        }

        return {
          ok: true,
          user: mappedUser,
        };
      }

      return {
        ok: false,
        error: "Authentication failed",
      };
    } catch (error) {
      console.error(
        "AuthContext: Login API error:",
        error
      );

      return {
        ok: false,
        error:
          "Server connection failed. Please ensure the backend is running on http://localhost:5000",
      };
    }
  };

  // ==========================================
  // FORGOT PASSWORD
  // SEND RESET LINK THROUGH BACKEND
  // ==========================================

  const forgotPassword = async (email) => {
    try {
      const normalizedEmail = email
        .trim()
        .toLowerCase();

      if (!normalizedEmail) {
        return {
          ok: false,
          error: "Email is required.",
        };
      }

      console.log(
        "AuthContext: Sending forgot password request:",
        normalizedEmail
      );

      const response = await fetch(
        `${API_BASE_URL}/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "AuthContext: Forgot password response:",
        {
          status: response.status,
          data,
        }
      );

      if (!response.ok) {
        return {
          ok: false,
          error:
            data.message ||
            "Failed to send password reset link.",
        };
      }

      if (data.success) {
        return {
          ok: true,
          message:
            data.message ||
            "Password reset link has been sent to your email.",
        };
      }

      return {
        ok: false,
        error:
          data.message ||
          "Failed to send password reset link.",
      };
    } catch (error) {
      console.error(
        "Forgot Password API Error:",
        error
      );

      return {
        ok: false,
        error:
          "Failed to connect to authentication server.",
      };
    }
  };

  // ==========================================
  // RESET PASSWORD USING LINK
  // ==========================================

  const resetPassword = async (
    token,
    newPassword
  ) => {
    try {
      if (!token) {
        return {
          ok: false,
          error: "Invalid or missing reset token.",
        };
      }

      if (!newPassword) {
        return {
          ok: false,
          error: "New password is required.",
        };
      }

      if (newPassword.length < 6) {
        return {
          ok: false,
          error:
            "Password must be at least 6 characters.",
        };
      }

      const response = await fetch(
        `${API_BASE_URL}/reset-password/${token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPassword,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "AuthContext: Reset password response:",
        {
          status: response.status,
          data,
        }
      );

      if (!response.ok) {
        return {
          ok: false,
          error:
            data.message ||
            "Failed to reset password.",
        };
      }

      return {
        ok: true,
        message:
          data.message ||
          "Password reset successfully.",
      };
    } catch (error) {
      console.error(
        "Reset Password API Error:",
        error
      );

      return {
        ok: false,
        error:
          "Failed to connect to authentication server.",
      };
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);

    setCurrentUser(null);
  };

  // ==========================================
  // REGISTER STUDENT
  // SEND OTP
  // ==========================================

  const registerStudent = async ({
    name,
    email,
    phone,
    password,
  }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error:
            data.message ||
            "Registration failed",
        };
      }

      return {
        ok: true,
        message: data.message,
      };
    } catch (error) {
      console.error(
        "Register API error:",
        error
      );

      return {
        ok: false,
        error:
          "Failed to connect to authentication server.",
      };
    }
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const verifyOtpCode = async ({
    email,
    otp,
  }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error:
            data.message ||
            "OTP verification failed",
        };
      }

      return {
        ok: true,
        message: data.message,
      };
    } catch (error) {
      console.error(
        "OTP API error:",
        error
      );

      return {
        ok: false,
        error:
          "Failed to connect to authentication server.",
      };
    }
  };

  // ==========================================
  // COMPLETE PROFILE
  // ==========================================

  const completeProfileData = async ({
    email,
    department,
    stream,
    semester,
    academicYear,
    rollNumber,
  }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/complete-profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            department,
            stream,
            semester,
            year: academicYear,
            rollNo: rollNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error:
            data.message ||
            "Profile completion failed",
        };
      }

      return {
        ok: true,
        message: data.message,
      };
    } catch (error) {
      console.error(
        "Complete Profile API error:",
        error
      );

      return {
        ok: false,
        error:
          "Failed to connect to authentication server.",
      };
    }
  };

  // ==========================================
  // SIGNUP
  // ==========================================

  const signup = async (form) => {
    return completeProfileData(form);
  };

  // ==========================================
  // ACCOUNT EXISTS
  // ==========================================

  const accountExists = async (email) => {
    return accounts.some(
      (item) =>
        item.email?.toLowerCase() ===
        email.trim().toLowerCase()
    );
  };

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const updateProfile = async (updates) => {
    const token =
      localStorage.getItem(TOKEN_KEY);

    if (!token) {
      return {
        ok: false,
        error: "No active token found.",
      };
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: updates.name,
            email: updates.email,
            phone: updates.phone,
            department: updates.department,
            stream: updates.stream,
            semester: updates.semester,
            academicYear:
              updates.academicYear,
            rollNumber:
              updates.rollNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error:
            data.message ||
            "Profile update failed",
        };
      }

      if (
        data.success &&
        data.user
      ) {
        const mappedUser =
          mapUserToFrontend(data.user);

        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify(mappedUser)
        );

        setCurrentUser(mappedUser);

        setAccounts((current) =>
          current.map((item) =>
            item.email ===
            mappedUser.email
              ? mappedUser
              : item
          )
        );

        return {
          ok: true,
          user: mappedUser,
        };
      }

      return {
        ok: false,
        error:
          "Failed to update profile details",
      };
    } catch (error) {
      console.error(
        "Update Profile API error:",
        error
      );

      return {
        ok: false,
        error:
          "Failed to connect to authentication server.",
      };
    }
  };

  // ==========================================
  // PROVIDER
  // ==========================================

  return (
    <AuthContext.Provider
      value={{
        accounts,
        currentUser,
        ready,

        login,
        logout,

        registerStudent,
        verifyOtpCode,

        completeProfileData,
        signup,

        accountExists,
        updateProfile,

        // IMPORTANT
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// USE AUTH
// ============================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
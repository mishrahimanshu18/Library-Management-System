import React, {
  useEffect,
  useState,
} from "react";

import {
  LockKeyhole,
  Mail,
  UserRound,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { loginStyles as s } from "../assets/dummyStyles";
import { useAuth } from "../shared/AuthContext";


// ==========================================
// BACKEND URL
// ==========================================

const API_BASE_URL =
  "https://library-management-system-4x8a.onrender.com/api/auth";


// ==========================================
// ROLES
// ==========================================

const roleChoices = [
  {
    value: "user",
    label: "Student",
    icon: UserRound,
  },
  {
    value: "admin",
    label: "Admin",
    icon: ShieldCheck,
  },
];


// ==========================================
// LOGIN
// ==========================================

const Login = () => {
  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();


  // ==========================================
  // LOGIN STATES
  // ==========================================

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "user",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);


  // ==========================================
  // RESET PASSWORD STATES
  // ==========================================

  const [showResetModal, setShowResetModal] =
    useState(false);

  const [resetStep, setResetStep] =
    useState("email");

  const [resetEmail, setResetEmail] =
    useState("");

  const [resetOtp, setResetOtp] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [resetLoading, setResetLoading] =
    useState(false);

  const [resetError, setResetError] =
    useState("");

  const [resetSuccess, setResetSuccess] =
    useState("");


  // ==========================================
  // GET SIGNUP DATA
  // ==========================================

  useEffect(() => {
    if (
      location.state?.signupEmail ||
      location.state?.signupPassword
    ) {
      setForm((current) => ({
        ...current,

        email:
          location.state?.signupEmail || "",

        password:
          location.state?.signupPassword || "",
      }));
    }
  }, [location.state]);


  // ==========================================
  // LOGIN INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setError("");
    setSuccess("");

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };


  // ==========================================
  // OPEN RESET MODAL
  // ==========================================

  const openResetModal = () => {
    setError("");
    setSuccess("");

    setResetError("");
    setResetSuccess("");

    setResetStep("email");

    setResetOtp("");

    setNewPassword("");

    setConfirmPassword("");

    setResetEmail(
      form.email.trim().toLowerCase()
    );

    setShowResetModal(true);
  };


  // ==========================================
  // CLOSE RESET MODAL
  // ==========================================

  const closeResetModal = () => {
    if (resetLoading) {
      return;
    }

    setShowResetModal(false);

    setResetStep("email");

    setResetEmail("");

    setResetOtp("");

    setNewPassword("");

    setConfirmPassword("");

    setResetError("");

    setResetSuccess("");
  };


  // ==========================================
  // STEP 1
  // SEND OTP
  // ==========================================

  const handleSendResetOtp = async (
    event
  ) => {
    event.preventDefault();

    setResetError("");
    setResetSuccess("");

    const email =
      resetEmail
        .trim()
        .toLowerCase();

    if (!email) {
      setResetError(
        "Please enter your email address."
      );

      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/forgot-password`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setResetError(
          data.message ||
            "Failed to send OTP."
        );

        return;
      }

      setResetSuccess(
        "OTP sent successfully. Check your email."
      );

      setResetStep("otp");

    } catch (error) {
      console.error(
        "Send OTP Error:",
        error
      );

      setResetError(
        "Unable to connect to backend. Make sure backend is running on port 5000."
      );

    } finally {
      setResetLoading(false);
    }
  };


  // ==========================================
  // STEP 2
  // VERIFY OTP
  // ==========================================

  const handleVerifyResetOtp = async (
    event
  ) => {
    event.preventDefault();

    setResetError("");
    setResetSuccess("");

    const cleanOtp =
      resetOtp
        .replace(/\D/g, "")
        .slice(0, 6);

    setResetOtp(cleanOtp);

    if (!cleanOtp) {
      setResetError(
        "Please enter the OTP."
      );

      return;
    }

    if (cleanOtp.length !== 6) {
      setResetError(
        "OTP must be exactly 6 digits."
      );

      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/verify-reset-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              resetEmail
                .trim()
                .toLowerCase(),

            otp: cleanOtp,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setResetError(
          data.message ||
            "Invalid or expired OTP."
        );

        return;
      }

      setResetSuccess(
        "OTP verified successfully."
      );

      setResetStep("password");

    } catch (error) {
      console.error(
        "Verify OTP Error:",
        error
      );

      setResetError(
        "Unable to connect to backend."
      );

    } finally {
      setResetLoading(false);
    }
  };


  // ==========================================
  // STEP 3
  // RESET PASSWORD
  // ==========================================

  const handleResetPassword = async (
    event
  ) => {
    event.preventDefault();

    setResetError("");
    setResetSuccess("");

    if (!newPassword) {
      setResetError(
        "Please enter new password."
      );

      return;
    }

    if (!confirmPassword) {
      setResetError(
        "Please confirm your password."
      );

      return;
    }

    if (newPassword.length < 6) {
      setResetError(
        "Password must be at least 6 characters."
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setResetError(
        "Passwords do not match."
      );

      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/reset-password`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              resetEmail
                .trim()
                .toLowerCase(),

            otp: resetOtp,

            newPassword,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setResetError(
          data.message ||
            "Failed to reset password."
        );

        return;
      }

      setResetSuccess(
        "Password reset successfully!"
      );

      setNewPassword("");

      setConfirmPassword("");

      setTimeout(() => {
        setShowResetModal(false);

        setResetStep("email");

        setResetEmail("");

        setResetOtp("");

        setForm((current) => ({
          ...current,

          email:
            resetEmail
              .trim()
              .toLowerCase(),

          password: "",
        }));

        setSuccess(
          "Password reset successfully. Please login with your new password."
        );
      }, 1200);

    } catch (error) {
      console.error(
        "Reset Password Error:",
        error
      );

      setResetError(
        "Unable to connect to backend."
      );

    } finally {
      setResetLoading(false);
    }
  };


  // ==========================================
  // LOGIN SUBMIT
  // ==========================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    setLoading(true);

    try {
      const result =
        await login(form);

      if (!result?.ok) {
        setError(
          result?.error ||
            "Login failed."
        );

        setLoading(false);

        return;
      }

      const fallbackPath =
        form.role === "admin"
          ? "/admin/dashboard"
          : "/user/dashboard";

      let target =
        location.state?.from ||
        fallbackPath;

      if (
        form.role === "user" &&
        typeof target ===
          "string" &&
        target.startsWith(
          "/admin"
        )
      ) {
        target = fallbackPath;
      }

      if (
        form.role === "admin" &&
        typeof target ===
          "string" &&
        target.startsWith(
          "/user"
        )
      ) {
        target = fallbackPath;
      }

      setLoading(false);

      navigate(target, {
        replace: true,
      });

    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

      setLoading(false);

      setError(
        "An unexpected connection error occurred."
      );
    }
  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <>
      <div
        className={
          s.pageContainer
        }
      >
        <div
          className={
            s.mainCard
          }
        >

          {/* LEFT PANEL */}

          <section
            className={
              s.infoPanel
            }
          >
            <span
              className={
                s.roleBadge
              }
            >
              College role login
            </span>

            <h1
              className={
                s.infoBoxTitle
              }
            >
              Choose student or admin first,
              then open the correct library panel.
            </h1>

            <p
              className={
                s.infoDescription
              }
            >
              Select the role you want to enter,
              then login with the matching college
              library account credentials.
            </p>

            <div
              className={
                s.infoBoxesContainer
              }
            >

              <div
                className={
                  s.infoBox
                }
              >
                <p
                  className={
                    s.infoBoxTitle
                  }
                >
                  <UserRound
                    size={16}
                  />

                  Student Sign In
                </p>

                <p
                  className={
                    s.infoBoxText
                  }
                >
                  Register a new student account
                  using the "Create Account" link.
                </p>
              </div>


              <div
                className={
                  s.infoBox
                }
              >
                <p
                  className={
                    s.infoBoxTitle
                  }
                >
                  <ShieldCheck
                    size={16}
                  />

                  Admin Access
                </p>

                <p
                  className={
                    s.infoBoxText
                  }
                >
                  Login using your registered
                  admin account.
                </p>
              </div>

            </div>
          </section>


          {/* LOGIN FORM */}

          <section
            className={
              s.formPanel
            }
          >
            <div
              className={
                s.formInner
              }
            >

              <Link
                to="/"
                className={
                  s.backLink
                }
              >
                Back to Home
              </Link>

              <h2
                className={
                  s.formTitle
                }
              >
                Login Account
              </h2>

              <p
                className={
                  s.formSubtitle
                }
              >
                Select your role and use your
                college library account credentials.
              </p>


              <form
                className={s.form}
                onSubmit={
                  handleSubmit
                }
              >

                {/* ROLE */}

                <div
                  className={
                    s.roleContainer
                  }
                >
                  <p
                    className={
                      s.roleLabel
                    }
                  >
                    Choose login role
                  </p>

                  <div
                    className={
                      s.roleGrid
                    }
                  >
                    {roleChoices.map(
                      (choice) => {
                        const Icon =
                          choice.icon;

                        return (
                          <label
                            key={
                              choice.value
                            }
                            className={`${s.roleOption} ${
                              form.role ===
                              choice.value
                                ? s.roleOptionSelected
                                : s.roleOptionUnselected
                            }`}
                          >
                            <input
                              type="radio"
                              name="role"
                              value={
                                choice.value
                              }
                              checked={
                                form.role ===
                                choice.value
                              }
                              onChange={
                                handleChange
                              }
                              className={
                                s.roleRadio
                              }
                            />

                            <span
                              className={
                                s.roleIconLabel
                              }
                            >
                              <Icon
                                size={16}
                              />

                              {
                                choice.label
                              }
                            </span>
                          </label>
                        );
                      }
                    )}
                  </div>
                </div>


                {/* EMAIL */}

                <label className="block">

                  <span
                    className={
                      s.fieldLabel
                    }
                  >
                    <Mail
                      size={15}
                    />

                    Email Address
                  </span>

                  <input
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="student@campus.edu"
                    className={
                      s.input
                    }
                    autoComplete="email"
                  />

                </label>


                {/* PASSWORD */}

                <label className="block">

                  <span
                    className={
                      s.fieldLabel
                    }
                  >
                    <LockKeyhole
                      size={15}
                    />

                    Password
                  </span>

                  <div
                    className={
                      s.passwordWrapper
                    }
                  >

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={
                        form.password
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter Password"
                      className={
                        s.passwordInput
                      }
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current
                        )
                      }
                      className={
                        s.togglePasswordButton
                      }
                    >
                      {showPassword ? (
                        <EyeOff
                          size={17}
                        />
                      ) : (
                        <Eye
                          size={17}
                        />
                      )}
                    </button>

                  </div>

                </label>


                {/* FORGOT PASSWORD */}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "flex-end",
                    marginTop: "-8px",
                    marginBottom: "8px",
                  }}
                >
                  <button
                    type="button"
                    onClick={
                      openResetModal
                    }
                    style={{
                      border: "none",
                      background:
                        "transparent",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      padding: "4px 0",
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>


                {/* ERROR */}

                {error && (
                  <div
                    className={
                      s.errorMessage
                    }
                  >
                    {error}
                  </div>
                )}


                {/* SUCCESS */}

                {success && (
                  <div
                    style={{
                      marginTop: "8px",
                      padding:
                        "10px 12px",
                      borderRadius:
                        "8px",
                      fontSize: "14px",
                      lineHeight: "1.4",
                      background:
                        "#ecfdf5",
                      color:
                        "#047857",
                      border:
                        "1px solid #a7f3d0",
                    }}
                  >
                    {success}
                  </div>
                )}


                {/* FOOTER */}

                <div
                  className={
                    s.footerFlex
                  }
                >
                  <span
                    className={
                      s.footerText
                    }
                  >
                    {form.role ===
                    "admin"
                      ? "Admin accounts use existing credentials"
                      : "Student signup is available below"}
                  </span>

                  {form.role ===
                    "user" && (
                    <Link
                      to="/signup"
                      className={
                        s.signupLink
                      }
                    >
                      Create Account
                    </Link>
                  )}
                </div>


                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className={
                    s.submitButton
                  }
                >
                  {loading
                    ? "Logging in..."
                    : "Login now"}

                  {!loading && (
                    <ArrowRight
                      size={15}
                    />
                  )}
                </button>

              </form>

            </div>
          </section>

        </div>
      </div>


      {/* ==========================================
          RESET PASSWORD MODAL
      ========================================== */}

      {showResetModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            padding: "20px",
            zIndex: 9999,
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "450px",
              background: "#fff",
              borderRadius: "18px",
              padding: "30px",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.25)",
              position: "relative",
            }}
          >

            {/* CLOSE */}

            <button
              type="button"
              onClick={
                closeResetModal
              }
              style={{
                position:
                  "absolute",
                right: "18px",
                top: "18px",
                border: "none",
                background:
                  "transparent",
                cursor:
                  "pointer",
              }}
            >
              <X size={20} />
            </button>


            {/* HEADER */}

            <div
              style={{
                marginBottom:
                  "22px",
              }}
            >

              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius:
                    "50%",
                  background:
                    "#ecfdf5",
                  color:
                    "#143d2e",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  marginBottom:
                    "14px",
                }}
              >
                <KeyRound
                  size={22}
                />
              </div>

              <h2
                style={{
                  margin: 0,
                  color:
                    "#143d2e",
                  fontSize:
                    "26px",
                }}
              >
                Reset Password
              </h2>

              <p
                style={{
                  color: "#777",
                  marginTop:
                    "8px",
                  lineHeight: 1.5,
                }}
              >
                {resetStep ===
                  "email" &&
                  "Enter your registered email to receive a 6-digit OTP."}

                {resetStep ===
                  "otp" &&
                  "Enter the 6-digit OTP sent to your email."}

                {resetStep ===
                  "password" &&
                  "Create a new password for your account."}
              </p>

            </div>


            {/* ERROR */}

            {resetError && (
              <div
                style={{
                  background:
                    "#fff1f2",
                  color:
                    "#be123c",
                  border:
                    "1px solid #fecdd3",
                  padding:
                    "11px 12px",
                  borderRadius:
                    "8px",
                  marginBottom:
                    "15px",
                  fontSize:
                    "14px",
                }}
              >
                {resetError}
              </div>
            )}


            {/* SUCCESS */}

            {resetSuccess && (
              <div
                style={{
                  background:
                    "#ecfdf5",
                  color:
                    "#047857",
                  border:
                    "1px solid #a7f3d0",
                  padding:
                    "11px 12px",
                  borderRadius:
                    "8px",
                  marginBottom:
                    "15px",
                  fontSize:
                    "14px",
                }}
              >
                {resetSuccess}
              </div>
            )}


            {/* ==================================
                STEP 1 - EMAIL
            ================================== */}

            {resetStep ===
              "email" && (
              <form
                onSubmit={
                  handleSendResetOtp
                }
              >

                <label
                  style={{
                    display:
                      "block",
                    fontWeight:
                      "600",
                    marginBottom:
                      "8px",
                  }}
                >
                  Email Address
                </label>

                <input
                  type="email"
                  value={
                    resetEmail
                  }
                  onChange={(e) => {
                    setResetEmail(
                      e.target.value
                    );

                    setResetError(
                      ""
                    );
                  }}
                  placeholder="Enter your email"
                  autoComplete="email"
                  style={{
                    width:
                      "100%",
                    padding:
                      "14px",
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "10px",
                    boxSizing:
                      "border-box",
                    fontSize:
                      "15px",
                    marginBottom:
                      "18px",
                  }}
                />

                <button
                  type="submit"
                  disabled={
                    resetLoading
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      "14px",
                    border:
                      "none",
                    borderRadius:
                      "10px",
                    background:
                      "#143d2e",
                    color:
                      "#fff",
                    fontSize:
                      "16px",
                    fontWeight:
                      "600",
                    cursor:
                      "pointer",
                    opacity:
                      resetLoading
                        ? 0.7
                        : 1,
                  }}
                >
                  {resetLoading
                    ? "Sending OTP..."
                    : "Send OTP"}
                </button>

              </form>
            )}


            {/* ==================================
                STEP 2 - OTP
            ================================== */}

            {resetStep ===
              "otp" && (
              <form
                onSubmit={
                  handleVerifyResetOtp
                }
              >

                <label
                  style={{
                    display:
                      "block",
                    fontWeight:
                      "600",
                    marginBottom:
                      "8px",
                  }}
                >
                  Enter 6-digit OTP
                </label>

                <input
                  type="text"
                  value={
                    resetOtp
                  }
                  onChange={(e) => {

                    // ONLY NUMBERS
                    const value =
                      e.target.value
                        .replace(
                          /\D/g,
                          ""
                        )
                        .slice(
                          0,
                          6
                        );

                    setResetOtp(
                      value
                    );

                    setResetError(
                      ""
                    );
                  }}
                  placeholder="Enter 6-digit OTP"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  style={{
                    width:
                      "100%",
                    padding:
                      "14px",
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "10px",
                    boxSizing:
                      "border-box",
                    fontSize:
                      "22px",
                    letterSpacing:
                      "8px",
                    textAlign:
                      "center",
                    marginBottom:
                      "18px",
                  }}
                />

                <button
                  type="submit"
                  disabled={
                    resetLoading
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      "14px",
                    border:
                      "none",
                    borderRadius:
                      "10px",
                    background:
                      "#143d2e",
                    color:
                      "#fff",
                    fontSize:
                      "16px",
                    fontWeight:
                      "600",
                    cursor:
                      "pointer",
                    opacity:
                      resetLoading
                        ? 0.7
                        : 1,
                  }}
                >
                  {resetLoading
                    ? "Verifying..."
                    : "Verify OTP"}
                </button>


                <button
                  type="button"
                  disabled={
                    resetLoading
                  }
                  onClick={() => {
                    setResetStep(
                      "email"
                    );

                    setResetOtp("");

                    setResetError(
                      ""
                    );

                    setResetSuccess(
                      ""
                    );
                  }}
                  style={{
                    width:
                      "100%",
                    marginTop:
                      "10px",
                    padding:
                      "10px",
                    border:
                      "none",
                    background:
                      "transparent",
                    color:
                      "#143d2e",
                    cursor:
                      "pointer",
                    fontWeight:
                      "600",
                  }}
                >
                  Change Email
                </button>

              </form>
            )}


            {/* ==================================
                STEP 3 - PASSWORD
            ================================== */}

            {resetStep ===
              "password" && (
              <form
                onSubmit={
                  handleResetPassword
                }
              >

                <label
                  style={{
                    display:
                      "block",
                    fontWeight:
                      "600",
                    marginBottom:
                      "8px",
                  }}
                >
                  New Password
                </label>

                <input
                  type="password"
                  value={
                    newPassword
                  }
                  onChange={(e) => {
                    setNewPassword(
                      e.target.value
                    );

                    setResetError(
                      ""
                    );
                  }}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  style={{
                    width:
                      "100%",
                    padding:
                      "14px",
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "10px",
                    boxSizing:
                      "border-box",
                    fontSize:
                      "15px",
                    marginBottom:
                      "15px",
                  }}
                />


                <label
                  style={{
                    display:
                      "block",
                    fontWeight:
                      "600",
                    marginBottom:
                      "8px",
                  }}
                >
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={
                    confirmPassword
                  }
                  onChange={(e) => {
                    setConfirmPassword(
                      e.target.value
                    );

                    setResetError(
                      ""
                    );
                  }}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  style={{
                    width:
                      "100%",
                    padding:
                      "14px",
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "10px",
                    boxSizing:
                      "border-box",
                    fontSize:
                      "15px",
                    marginBottom:
                      "18px",
                  }}
                />


                <button
                  type="submit"
                  disabled={
                    resetLoading
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      "14px",
                    border:
                      "none",
                    borderRadius:
                      "10px",
                    background:
                      "#143d2e",
                    color:
                      "#fff",
                    fontSize:
                      "16px",
                    fontWeight:
                      "600",
                    cursor:
                      "pointer",
                    opacity:
                      resetLoading
                        ? 0.7
                        : 1,
                  }}
                >
                  {resetLoading
                    ? "Resetting..."
                    : "Reset Password"}
                </button>

              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
};


export default Login;

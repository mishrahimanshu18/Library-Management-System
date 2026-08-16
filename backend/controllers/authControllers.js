import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generate } from "otp-generator";
import { v4 as uuidv4 } from "uuid";
import sendOtp from "../utils/sendOtp.js";

// ======================================================
// 1. STUDENT REGISTER - SEND OTP
// ======================================================

export async function registerUser(req, res) {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const cleanPhone = phone
      .toString()
      .replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be exactly 10 digits",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      await User.deleteOne({
        _id: existingUser._id,
      });
    }

    // ==================================================
    // REGISTRATION OTP - ONLY NUMBERS
    // ==================================================

    const otp = generate(6, {
      upperAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      numbers: true,
    });

    console.log("Registration OTP:", otp);

    try {
      await sendOtp(normalizedEmail, otp);
    } catch (emailError) {
      console.error("OTP Email Error:", emailError);

      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const otpExpiry = new Date(
      Date.now() + 5 * 60 * 1000
    );

    const studentId = `ST-${uuidv4()
      .slice(0, 8)
      .toUpperCase()}`;

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: cleanPhone,
      password: hashedPassword,
      otp,
      otpExpiry,
      studentId,
      role: "user",
      isVerified: false,
      isProfileComplete: false,
    });

    const userResponse = user.toObject();

    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpiry;

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. OTP sent to your email.",
      user: userResponse,
    });
  } catch (error) {
    console.error(
      "Error registering student:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error registering student",
      error: error.message,
    });
  }
}


// ======================================================
// 2. VERIFY REGISTRATION OTP
// ======================================================

export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not found. Please register again.",
      });
    }

    if (user.otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      new Date() >
      new Date(user.otpExpiry)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please register again.",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error(
      "Error verifying OTP:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error verifying OTP",
      error: error.message,
    });
  }
}


// ======================================================
// 3. COMPLETE STUDENT PROFILE
// ======================================================

export async function completeProfile(req, res) {
  try {
    const {
      email,
      department,
      stream,
      semester,
      year,
      rollNo,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email first",
      });
    }

    user.department = department || "";
    user.stream = stream || "";
    user.semester = semester || "";
    user.year = year || "";
    user.rollNo = rollNo || "";
    user.isProfileComplete = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Profile completed successfully",
      user,
    });
  } catch (error) {
    console.error(
      "Error completing profile:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error completing profile",
      error: error.message,
    });
  }
}


// ======================================================
// 4. LOGIN - STUDENT / ADMIN
// ======================================================

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and Password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Student verification
    if (
      user.role !== "admin" &&
      !user.isVerified
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email with OTP before login",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message:
          "JWT_SECRET is missing in .env",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const userResponse = user.toObject();

    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpiry;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error(
      "Error during login:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error during login",
      error: error.message,
    });
  }
}


// ======================================================
// 5. GET CURRENT USER
// ======================================================

export async function getProfile(req, res) {
  try {
    const user =
      await User.findById(req.user.id).select(
        "-password -otp -otpExpiry"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Error fetching profile:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error fetching user profile",
      error: error.message,
    });
  }
}


// ======================================================
// 6. UPDATE PROFILE
// ======================================================

export async function updateProfile(req, res) {
  try {
    const {
      name,
      email,
      phone,
      department,
      stream,
      semester,
      academicYear,
      rollNumber,
    } = req.body;

    const user =
      await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Students cannot change email
    if (email) {
      const normalizedEmail =
        email.trim().toLowerCase();

      if (
        normalizedEmail !==
        user.email.toLowerCase()
      ) {
        if (user.role === "user") {
          return res.status(400).json({
            success: false,
            message:
              "Students are not allowed to change their email",
          });
        }

        const emailExists =
          await User.findOne({
            email: normalizedEmail,
            _id: { $ne: user._id },
          });

        if (emailExists) {
          return res.status(400).json({
            success: false,
            message:
              "Email already in use",
          });
        }

        user.email = normalizedEmail;
      }
    }

    if (phone) {
      const cleanPhone = phone
        .toString()
        .replace(/\D/g, "");

      if (cleanPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          message:
            "Mobile number must be exactly 10 digits",
        });
      }

      user.phone = cleanPhone;
    }

    if (name) user.name = name;
    if (department)
      user.department = department;
    if (stream) user.stream = stream;
    if (semester)
      user.semester = semester;
    if (academicYear)
      user.year = academicYear;
    if (rollNumber)
      user.rollNo = rollNumber;

    await user.save();

    const userResponse =
      user.toObject();

    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpiry;

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error(
      "Error updating profile:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
}


// ======================================================
// 7. GET ALL STUDENTS - ADMIN
// ======================================================

export async function getUsers(req, res) {
  try {
    const users = await User.find({
      role: "user",
      isVerified: true,
      isProfileComplete: true,
    }).select(
      "-password -otp -otpExpiry"
    );

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(
      "Error fetching students:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error fetching students",
      error: error.message,
    });
  }
}


// ======================================================
// 8. REGISTER ADMIN
// ======================================================

export async function registerAdmin(req, res) {
  try {
    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter all required fields",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists with this email",
      });
    }

    const cleanPhone = phone
      .toString()
      .replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message:
          "Mobile number must be exactly 10 digits",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        phone: cleanPhone,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        isProfileComplete: true,
      });

    const userResponse =
      user.toObject();

    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpiry;

    return res.status(201).json({
      success: true,
      message:
        "Admin registered successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error(
      "Error registering admin:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error registering admin",
      error: error.message,
    });
  }
}

// ======================================================
// 9. FORGOT PASSWORD - SEND NUMERIC OTP
// ======================================================

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // ==========================================
    // ALWAYS GENERATE 6 DIGIT NUMERIC OTP
    // ==========================================

    const resetOtp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Save OTP
    user.otp = resetOtp;

    // OTP valid for 5 minutes
    user.otpExpiry = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await user.save();

    // Send OTP to email
    await sendOtp(
      normalizedEmail,
      resetOtp
    );

    console.log(
      `Password reset OTP sent to ${normalizedEmail}: ${resetOtp}`
    );

    return res.status(200).json({
      success: true,
      message:
        "Password reset OTP sent to your email",
    });

  } catch (error) {
    console.error(
      "Forgot Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to send password reset OTP",
      error: error.message,
    });
  }
}


// ======================================================
// 10. VERIFY RESET OTP
// ======================================================

export async function verifyResetOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const cleanOtp = otp
      .toString()
      .replace(/\D/g, "");

    if (cleanOtp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "OTP must be exactly 6 digits",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message:
          "Reset OTP not found. Please request a new OTP.",
      });
    }

    // Check OTP
    if (
      user.otp.toString() !==
      cleanOtp.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Check expiry
    if (
      new Date() >
      new Date(user.otpExpiry)
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Reset OTP verified successfully",
    });

  } catch (error) {
    console.error(
      "Verify Reset OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error verifying reset OTP",
      error: error.message,
    });
  }
}


// ======================================================
// 11. RESET PASSWORD
// ======================================================

export async function resetPassword(req, res) {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const cleanOtp = otp
      .toString()
      .replace(/\D/g, "");

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message:
          "Reset OTP not found. Please request a new OTP.",
      });
    }

    // Check OTP again
    if (
      user.otp.toString() !==
      cleanOtp.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Check expiry
    if (
      new Date() >
      new Date(user.otpExpiry)
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Hash new password
    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    user.password = hashedPassword;

    // OTP can be used only once
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login.",
    });

  } catch (error) {
    console.error(
      "Reset Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error resetting password",
      error: error.message,
    });
  }
}
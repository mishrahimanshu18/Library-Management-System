import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    // =========================
    // OTP VERIFICATION
    // =========================

    otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // =========================
    // STUDENT PROFILE
    // =========================

    department: {
      type: String,
      default: "",
    },

    stream: {
      type: String,
      default: "",
    },

    semester: {
      type: String,
      default: "",
    },

    year: {
      type: String,
      default: "",
    },

    rollNo: {
      type: String,
      default: "",
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    // =========================
    // STUDENT ID
    // =========================

    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // =========================
    // ROLE
    // =========================

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // =========================
    // PASSWORD RESET
    // =========================

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "User",
  userSchema
);
import express from "express";

import {
  registerUser,
  verifyOtp,
  completeProfile,
  loginUser,
  registerAdmin,
  getProfile,
  updateProfile,
  getUsers,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../controllers/authControllers.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const authrouter = express.Router();

// ==========================================
// AUTH
// ==========================================

authrouter.post("/register", registerUser);

authrouter.post("/verify-otp", verifyOtp);

authrouter.post("/complete-profile", completeProfile);

authrouter.post("/login", loginUser);

authrouter.post("/register-admin", registerAdmin);

// ==========================================
// FORGOT PASSWORD - OTP FLOW
// ==========================================

// 1. Send OTP to email
authrouter.post(
  "/forgot-password",
  forgotPassword
);

// 2. Verify OTP
authrouter.post(
  "/verify-reset-otp",
  verifyResetOtp
);

// 3. Reset password
authrouter.post(
  "/reset-password",
  resetPassword
);

// ==========================================
// PROTECTED ROUTES
// ==========================================

authrouter.get(
  "/me",
  authenticateToken,
  getProfile
);

authrouter.put(
  "/update-profile",
  authenticateToken,
  updateProfile
);

authrouter.get(
  "/users",
  authenticateToken,
  authorizeRoles("admin"),
  getUsers
);

export default authrouter;
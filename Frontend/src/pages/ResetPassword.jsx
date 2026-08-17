import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  "https://library-management-system-4x8a.onrender.com/api/auth";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !otp) {
      setError("Email and OTP are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/verify-reset-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid OTP.");
        return;
      }

      setSuccess("OTP verified successfully.");
      setStep(2);
    } catch (error) {
      console.error("Verify OTP Error:", error);
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("Please enter both passwords.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to reset password.");
        return;
      }

      setSuccess(
        "Password reset successfully. Redirecting to login..."
      );

      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset Password Error:", error);
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f0e5",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "#fff",
          padding: "35px",
          borderRadius: "18px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            color: "#143d2e",
            marginBottom: "10px",
          }}
        >
          Reset Password
        </h1>

        <p style={{ color: "#777", marginBottom: "25px" }}>
          {step === 1
            ? "Enter your email and OTP."
            : "Enter your new password."}
        </p>

        {step === 1 ? (
          <form onSubmit={verifyOtp}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Enter registered email"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                marginBottom: "18px",
                boxSizing: "border-box",
              }}
            />

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              OTP
            </label>

            <input
              type="text"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                marginBottom: "20px",
                boxSizing: "border-box",
                letterSpacing: "4px",
              }}
            />

            {error && (
              <div
                style={{
                  background: "#fff1f2",
                  color: "#be123c",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  background: "#ecfdf5",
                  color: "#047857",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "10px",
                background: "#143d2e",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Verifying OTP..." : "Verify OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter new password"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                marginBottom: "18px",
                boxSizing: "border-box",
              }}
            />

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              placeholder="Confirm new password"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                marginBottom: "20px",
                boxSizing: "border-box",
              }}
            />

            {error && (
              <div
                style={{
                  background: "#fff1f2",
                  color: "#be123c",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  background: "#ecfdf5",
                  color: "#047857",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "10px",
                background: "#143d2e",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading
                ? "Resetting Password..."
                : "Reset Password"}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => navigate("/login")}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "15px",
            padding: "12px",
            border: "none",
            background: "transparent",
            color: "#143d2e",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;

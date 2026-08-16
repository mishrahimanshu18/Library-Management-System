import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = "https://library-management-system-4x8a.onrender.com/api/auth";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Check reset token
    if (!token) {
      setError("Invalid or missing password reset link.");
      return;
    }

    // Check password fields
    if (!password || !confirmPassword) {
      setError("Please enter both passwords.");
      return;
    }

    // Minimum password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Match passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPassword: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to reset password."
        );
        return;
      }

      setSuccess(
        "Password reset successfully. Redirecting to login..."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error("Reset Password Error:", error);

      setError(
        "Unable to connect to server. Please try again."
      );
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
          background: "#ffffff",
          padding: "35px",
          borderRadius: "18px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        {/* Heading */}

        <h1
          style={{
            marginBottom: "10px",
            color: "#143d2e",
            fontSize: "30px",
          }}
        >
          Reset Password
        </h1>

        <p
          style={{
            color: "#777",
            marginBottom: "28px",
          }}
        >
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit}>

          {/* New Password */}

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
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Enter new password"
            autoComplete="new-password"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              marginBottom: "18px",
              fontSize: "15px",
              boxSizing: "border-box",
              outline: "none",
            }}
          />

          {/* Confirm Password */}

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
            autoComplete="new-password"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              marginBottom: "20px",
              fontSize: "15px",
              boxSizing: "border-box",
              outline: "none",
            }}
          />

          {/* Error */}

          {error && (
            <div
              style={{
                background: "#fff1f2",
                color: "#be123c",
                border: "1px solid #fecdd3",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "15px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {/* Success */}

          {success && (
            <div
              style={{
                background: "#ecfdf5",
                color: "#047857",
                border: "1px solid #a7f3d0",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "15px",
                fontSize: "14px",
              }}
            >
              {success}
            </div>
          )}

          {/* Reset Button */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: "#143d2e",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Resetting Password..."
              : "Reset Password"}
          </button>
        </form>

        {/* Back to Login */}

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

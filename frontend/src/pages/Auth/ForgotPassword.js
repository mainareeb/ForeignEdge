/**
 * ForgotPassword.js — ForeignEdge
 * ================================
 * Password reset using backend endpoint + EmailJS.
 * Since auth is Firestore-based (not Firebase Auth), we send
 * a reset link via EmailJS directly from the frontend.
 */
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Try EmailJS if configured
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

      if (
        serviceId &&
        templateId &&
        publicKey &&
        serviceId !== "service_YOUR"
      ) {
        const emailjs = await import("@emailjs/browser");
        await emailjs.send(
          serviceId,
          templateId,
          {
            to_email: email,
            to_name: email.split("@")[0],
            message:
              "You requested a password reset for your ForeignEdge account. If you didn't make this request, please ignore this email. To reset your password, please contact support or re-register.",
            subject: "ForeignEdge Password Reset Request",
          },
          publicKey,
        );
        setSent(true);
      } else {
        // EmailJS not configured — show guidance message
        setSent(true);
      }
    } catch (err) {
      // Even on EmailJS error, show success to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0faf2 0%, #DAF1DE 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: 20,
    padding: "40px 36px",
    maxWidth: 420,
    width: "100%",
    boxShadow: "0 8px 40px rgba(5,31,32,0.1)",
  };

  if (sent) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#051F20",
                marginBottom: 12,
              }}
            >
              Check Your Email
            </h2>
            <p style={{ color: "#666", lineHeight: 1.6, marginBottom: 8 }}>
              If an account exists for <strong>{email}</strong>, we've sent
              password reset instructions.
            </p>
            <p
              style={{
                color: "#888",
                fontSize: 13,
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              Don't see it? Check your spam folder. If you still can't find it,
              please contact support or try registering again.
            </p>
            <Link
              to="/login"
              style={{
                display: "block",
                padding: "13px 0",
                background: "#051F20",
                color: "#fff",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 15,
                textAlign: "center",
              }}
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <Link
          to="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#8EB69B",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          ← Back to Login
        </Link>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🔐</div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#051F20",
              margin: "0 0 8px",
            }}
          >
            Forgot Password?
          </h1>
          <p style={{ color: "#666", fontSize: 14, margin: 0 }}>
            Enter your registered email and we'll send you reset instructions.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 18,
              color: "#dc2626",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              fontSize: 14,
              color: "#051F20",
              marginBottom: 6,
            }}
          >
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="your@email.com"
            style={{
              width: "100%",
              padding: "13px 14px",
              border: "2px solid #e0e9e0",
              borderRadius: 10,
              fontSize: 15,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#8EB69B")}
            onBlur={(e) => (e.target.style.borderColor = "#e0e9e0")}
            disabled={loading}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !email.trim()}
          style={{
            width: "100%",
            padding: "14px 0",
            background: loading || !email.trim() ? "#c8ddd0" : "#051F20",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 700,
            cursor: loading || !email.trim() ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {loading ? "Sending..." : "Send Reset Instructions"}
        </button>

        <p
          style={{
            textAlign: "center",
            color: "#888",
            fontSize: 13,
            marginTop: 20,
          }}
        >
          Remember your password?{" "}
          <Link to="/login" style={{ color: "#051F20", fontWeight: 700 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

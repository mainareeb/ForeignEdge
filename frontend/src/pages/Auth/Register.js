import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/api";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await registerUser(formData);
      navigate("/academic-profile");
    } catch (err) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="fe-page">
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <h1 style={styles.brandName}>ForeignEdge</h1>
          <p style={styles.brandTagline}>
            Join thousands of students achieving their dream of studying abroad
          </p>
          <div style={styles.stepsSection}>
            <p style={styles.stepsTitle}>Get started in 3 easy steps:</p>
            <div style={styles.stepItem}>
              <div style={styles.stepNum}>1</div>
              <p style={styles.stepText}>Create your free account</p>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNum}>2</div>
              <p style={styles.stepText}>Complete your academic profile</p>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNum}>3</div>
              <p style={styles.stepText}>Get AI-powered recommendations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSubtitle}>Join ForeignEdge for free today</p>
          </div>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          <div style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>👤</span>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>📧</span>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password (min 6 chars)"
                  value={formData.password}
                  onChange={handleChange}
                  style={styles.input}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              style={loading ? styles.registerBtnLoading : styles.registerBtn}
              disabled={loading}
            >
              {loading ? "⏳ Creating Account..." : "Create Account →"}
            </button>

            <p style={styles.loginText}>
              Already have an account?{" "}
              <Link to="/login" style={styles.loginLink}>
                Login here →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Segoe UI, sans-serif",
  },
  leftPanel: {
    flex: 1,
    background:
      "linear-gradient(135deg, #051F20 0%, #051F20 50%, #0B2B26 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 40px",
  },
  leftContent: { maxWidth: "400px" },
  brandName: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#8EB69B",
    marginBottom: "10px",
  },
  brandTagline: {
    fontSize: "17px",
    color: "#8EB69B",
    marginBottom: "40px",
    lineHeight: "1.6",
  },
  stepsSection: { display: "flex", flexDirection: "column", gap: "18px" },
  stepsTitle: {
    fontSize: "15px",
    color: "#8EB69B",
    marginBottom: "5px",
    fontWeight: "600",
  },
  stepItem: { display: "flex", alignItems: "center", gap: "15px" },
  stepNum: {
    width: "32px",
    height: "32px",
    backgroundColor: "#8EB69B",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
    color: "#ffffff",
    flexShrink: 0,
  },
  stepText: {
    fontSize: "15px",
    color: "#ffffff",
    fontWeight: "500",
    margin: 0,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 40px",
  },
  formCard: {
    backgroundColor: "#ffffff",
    padding: "50px 45px",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "420px",
  },
  formHeader: { marginBottom: "30px" },
  formTitle: {
    fontSize: "30px",
    fontWeight: "800",
    color: "#051F20",
    marginBottom: "8px",
  },
  formSubtitle: { fontSize: "15px", color: "#888" },
  errorBox: {
    backgroundColor: "#fff0f0",
    border: "1px solid #ffb3b3",
    color: "#cc0000",
    padding: "12px 15px",
    borderRadius: "10px",
    fontSize: "14px",
    marginBottom: "20px",
  },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#051F20" },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    border: "1.5px solid #e0e9f0",
    borderRadius: "10px",
    overflow: "hidden",
  },
  inputIcon: { padding: "0 12px", fontSize: "16px" },
  input: {
    flex: 1,
    padding: "13px 10px",
    border: "none",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "transparent",
    color: "#333",
  },
  eyeBtn: {
    padding: "0 12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  registerBtn: {
    backgroundColor: "#051F20",
    color: "#ffffff",
    padding: "15px",
    borderRadius: "10px",
    border: "none",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    letterSpacing: "0.5px",
  },
  registerBtnLoading: {
    backgroundColor: "#888",
    color: "#ffffff",
    padding: "15px",
    borderRadius: "10px",
    border: "none",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "not-allowed",
    letterSpacing: "0.5px",
  },
  loginText: { textAlign: "center", fontSize: "14px", color: "#666" },
  loginLink: { color: "#8EB69B", textDecoration: "none", fontWeight: "700" },
};

export default Register;

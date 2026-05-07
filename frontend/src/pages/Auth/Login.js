import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await loginUser({ email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div style={styles.container} className="fe-page">
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <h1 style={styles.brandName}>ForeignEdge</h1>
          <p style={styles.brandTagline}>Your Gateway to Global Education</p>
          <div style={styles.featureList}>
            <div style={styles.featureItem}>✅ 500+ Universities Worldwide</div>
            <div style={styles.featureItem}>
              ✅ 1000+ Scholarships Available
            </div>
            <div style={styles.featureItem}>✅ AI-Powered Recommendations</div>
            <div style={styles.featureItem}>✅ AES-256 Secure Platform</div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome Back</h2>
            <p style={styles.formSubtitle}>Login to your ForeignEdge account</p>
          </div>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          <div style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>📧</span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
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

            <div style={styles.forgotRow}>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>

            <button
              onClick={handleSubmit}
              style={loading ? styles.loginBtnLoading : styles.loginBtn}
              disabled={loading}
            >
              {loading ? "⏳ Logging in..." : "Login →"}
            </button>

            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>or</span>
              <span style={styles.dividerLine}></span>
            </div>

            <p style={styles.registerText}>
              Don't have an account?{" "}
              <Link to="/register" style={styles.registerLink}>
                Create one free →
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
    fontSize: "18px",
    color: "#8EB69B",
    marginBottom: "40px",
    lineHeight: "1.5",
  },
  featureList: { display: "flex", flexDirection: "column", gap: "15px" },
  featureItem: { fontSize: "16px", color: "#ffffff", fontWeight: "500" },
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
  form: { display: "flex", flexDirection: "column", gap: "20px" },
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
  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-10px",
  },
  forgotLink: {
    fontSize: "13px",
    color: "#8EB69B",
    textDecoration: "none",
    fontWeight: "500",
  },
  loginBtn: {
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
  loginBtnLoading: {
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
  divider: { display: "flex", alignItems: "center", gap: "10px" },
  dividerLine: { flex: 1, height: "1px", backgroundColor: "#e0e9f0" },
  dividerText: { fontSize: "13px", color: "#aaa" },
  registerText: { textAlign: "center", fontSize: "14px", color: "#666" },
  registerLink: { color: "#8EB69B", textDecoration: "none", fontWeight: "700" },
};

export default Login;

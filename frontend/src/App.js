import React, { Component } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import AcademicProfile from "./pages/Profile/AcademicProfile";
import Universities from "./pages/Universities/Universities";
import Scholarships from "./pages/Scholarships/Scholarships";
import Visa from "./pages/Visa/Visa";
import CountryComparison from "./pages/Compare/CountryComparison";
import Accommodation from "./pages/Accommodation/Accommodation";
import Dashboard from "./pages/Dashboard/Dashboard";
import Chatbot from "./pages/Chatbot/Chatbot";
import UserProfile from "./pages/UserProfile/UserProfile";
import ApplicationTracker from "./pages/Tracker/ApplicationTracker";
import DeadlineReminders from "./pages/Reminders/DeadlineReminders";
import SOPHelper from "./pages/SOP/SOPHelper";
import Recommendations from "./pages/Recommendations/Recommendations";
import AdminPanel from "./pages/Admin/AdminPanel";
import RateLimitToast from "./components/RateLimitToast";

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#f4f7fa",
            padding: 24,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#1a2e4a",
              margin: "0 0 12px",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: "#555",
              maxWidth: 440,
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            An unexpected error occurred. Please refresh the page.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 24px",
                background: "#1a2e4a",
                color: "#fff",
                border: "none",
                borderRadius: 9,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Refresh Page
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = "/";
              }}
              style={{
                padding: "10px 24px",
                background: "#fff",
                color: "#1a2e4a",
                border: "2px solid #1a2e4a",
                borderRadius: 9,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#f4f7fa,#e8f4fd)",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 80, marginBottom: 16 }}>🔭</div>
      <h1
        style={{
          fontSize: 36,
          fontWeight: 800,
          color: "#1a2e4a",
          margin: "0 0 12px",
        }}
      >
        404 — Page Not Found
      </h1>
      <p
        style={{ color: "#555", fontSize: 16, maxWidth: 400, marginBottom: 32 }}
      >
        This page doesn't exist. Use the links below to get back on track.
      </p>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { to: "/", label: "🏠 Home" },
          { to: "/universities", label: "🎓 Universities" },
          { to: "/scholarships", label: "💰 Scholarships" },
          { to: "/visa", label: "📋 Visa" },
          { to: "/dashboard", label: "📊 Dashboard" },
        ].map((l) => (
          <Link
            key={l.to}
            to={l.to}
            style={{
              padding: "10px 20px",
              background: "#fff",
              border: "1.5px solid #d0dde8",
              borderRadius: 10,
              textDecoration: "none",
              color: "#1a2e4a",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <GlobalErrorBoundary>
      <RateLimitToast />
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/academic-profile" element={<AcademicProfile />} />
          <Route path="/universities" element={<Universities />} />
          <Route path="/scholarships" element={<Scholarships />} />
          <Route path="/visa" element={<Visa />} />
          <Route path="/compare" element={<CountryComparison />} />
          <Route path="/accommodation" element={<Accommodation />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <PrivateRoute>
                <Chatbot />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/tracker"
            element={
              <PrivateRoute>
                <ApplicationTracker />
              </PrivateRoute>
            }
          />
          <Route
            path="/reminders"
            element={
              <PrivateRoute>
                <DeadlineReminders />
              </PrivateRoute>
            }
          />
          <Route
            path="/sop"
            element={
              <PrivateRoute>
                <SOPHelper />
              </PrivateRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <PrivateRoute>
                <Recommendations />
              </PrivateRoute>
            }
          />
          <Route path="/admin" element={<AdminPanel />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </GlobalErrorBoundary>
  );
}

export default App;

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(u?.name?.split(" ")[0] || "");
    } catch {
      setUserName("");
    }
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("");
    navigate("/login");
  };

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const HAMBURGER_ITEMS = [
    {
      to: "/recommendations",
      icon: "🤖",
      title: "AI Recommendations",
      desc: "ML-powered personalized picks",
    },
    {
      to: "/compare",
      icon: "⚖️",
      title: "Compare",
      desc: "Compare countries side by side",
    },
    {
      to: "/chatbot",
      icon: "💬",
      title: "AI Chat",
      desc: "Ask our AI assistant",
    },
    {
      to: "/accommodation",
      icon: "🏠",
      title: "Housing",
      desc: "Accommodation costs & tips",
    },
    {
      to: "/tracker",
      icon: "📋",
      title: "Application Tracker",
      desc: "Track your applications",
    },
    {
      to: "/reminders",
      icon: "⏰",
      title: "Reminders",
      desc: "Deadline reminders",
    },
    {
      to: "/sop",
      icon: "✍️",
      title: "SOP Builder",
      desc: "Write your statement of purpose",
    },
  ];

  return (
    <>
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-link:hover      { color: #fff !important; }
        .dropdown-item:hover { background: #f0f7ff !important; }
        .hamburger-btn:hover { background: rgba(255,255,255,0.18) !important; }
      `}</style>

      <nav style={S.nav}>
        <Link to="/" style={S.logoText}>
          ForeignEdge
        </Link>

        <div style={S.links}>
          {[
            { to: "/", label: "Home" },
            { to: "/universities", label: "Universities" },
            { to: "/scholarships", label: "Scholarships" },
            { to: "/visa", label: "Visa" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="nav-link"
              style={isActive(to) ? S.linkActive : S.link}
            >
              {label}
            </Link>
          ))}

          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                style={isActive("/dashboard") ? S.dashBtnActive : S.dashBtn}
              >
                Dashboard
              </Link>

              {userName && (
                <Link to="/profile" style={S.profileBtn}>
                  👤 {userName}
                </Link>
              )}

              <button onClick={handleLogout} style={S.logoutBtn}>
                Logout
              </button>

              <div style={S.hamburgerWrapper} ref={menuRef}>
                <button
                  className="hamburger-btn"
                  onClick={() => setMenuOpen((o) => !o)}
                  style={S.hamburgerBtn}
                  aria-label="More tools"
                >
                  <div
                    style={{ ...S.bar, ...(menuOpen ? S.barTopOpen : {}) }}
                  />
                  <div
                    style={{ ...S.bar, ...(menuOpen ? S.barMidOpen : {}) }}
                  />
                  <div
                    style={{ ...S.bar, ...(menuOpen ? S.barBotOpen : {}) }}
                  />
                </button>

                {menuOpen && (
                  <div style={S.dropdown}>
                    <p style={S.dropdownLabel}>Tools</p>
                    {HAMBURGER_ITEMS.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="dropdown-item"
                        style={{
                          ...S.dropdownItem,
                          ...(isActive(item.to) ? S.dropdownItemActive : {}),
                        }}
                        onClick={() => setMenuOpen(false)}
                      >
                        <span style={S.dropdownIcon}>{item.icon}</span>
                        <div>
                          <p style={S.dropdownItemTitle}>{item.title}</p>
                          <p style={S.dropdownItemDesc}>{item.desc}</p>
                        </div>
                        {isActive(item.to) && (
                          <span
                            style={{
                              marginLeft: "auto",
                              color: "#4a9eda",
                              fontSize: 18,
                            }}
                          >
                            ●
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={S.loginBtn}>
                Login
              </Link>
              <Link to="/register" style={S.registerBtn}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

const S = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 40px",
    backgroundColor: "#1a2e4a",
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    flexWrap: "wrap",
    gap: "10px",
  },
  logoText: {
    color: "#4a9eda",
    fontSize: "24px",
    fontWeight: "bold",
    textDecoration: "none",
    letterSpacing: "1px",
    flexShrink: 0,
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  link: {
    color: "rgba(255,255,255,0.82)",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "500",
    transition: "color 0.2s",
  },
  linkActive: {
    color: "#4a9eda",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "700",
    borderBottom: "2px solid #4a9eda",
    paddingBottom: "2px",
  },
  dashBtn: {
    color: "#4a9eda",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    border: "1px solid #4a9eda",
    padding: "7px 16px",
    borderRadius: "6px",
  },
  dashBtnActive: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#4a9eda",
    padding: "7px 16px",
    borderRadius: "6px",
  },
  profileBtn: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "14px",
    padding: "7px 12px",
    borderRadius: "6px",
    border: "1px solid rgba(255,255,255,0.25)",
  },
  logoutBtn: {
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    padding: "7px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  loginBtn: {
    color: "#4a9eda",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "600",
    border: "1px solid #4a9eda",
    padding: "7px 18px",
    borderRadius: "6px",
  },
  registerBtn: {
    backgroundColor: "#4a9eda",
    color: "#fff",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "600",
    padding: "7px 18px",
    borderRadius: "6px",
  },
  hamburgerWrapper: { position: "relative" },
  hamburgerBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "8px",
    padding: "8px 10px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    alignItems: "center",
    justifyContent: "center",
    width: "42px",
    height: "42px",
    transition: "background 0.2s",
  },
  bar: {
    width: "20px",
    height: "2px",
    backgroundColor: "#fff",
    borderRadius: "2px",
    transition: "all 0.3s ease",
    transformOrigin: "center",
  },
  barTopOpen: { transform: "translateY(7px) rotate(45deg)" },
  barMidOpen: { opacity: 0, transform: "scaleX(0)" },
  barBotOpen: { transform: "translateY(-7px) rotate(-45deg)" },
  dropdown: {
    position: "absolute",
    top: "52px",
    right: 0,
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
    padding: "12px",
    minWidth: "270px",
    zIndex: 2000,
    border: "1px solid #e0e9f0",
    animation: "dropIn 0.2s ease",
  },
  dropdownLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#bbb",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "0 0 8px 10px",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "10px",
    textDecoration: "none",
    transition: "background 0.2s",
    cursor: "pointer",
    marginBottom: "4px",
  },
  dropdownItemActive: { backgroundColor: "#f0f7ff" },
  dropdownIcon: {
    fontSize: "20px",
    width: "40px",
    height: "40px",
    backgroundColor: "#f0f4f8",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    textAlign: "center",
    lineHeight: "40px",
  },
  dropdownItemTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1a2e4a",
    margin: 0,
  },
  dropdownItemDesc: {
    fontSize: "12px",
    color: "#888",
    margin: "2px 0 0",
  },
};

export default Navbar;

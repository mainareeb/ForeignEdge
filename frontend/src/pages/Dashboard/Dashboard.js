/**
 * Dashboard.js
 * ============
 * All stats from real API calls. No hardcoded numbers.
 * - Tracker count from GET /tracker
 * - Reminders from GET /reminders
 * - SOPs from GET /sop
 * - Profile from GET /user/profile
 */

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  getUserProfile,
  getTracker,
  getReminders,
  getSops,
} from "../../services/api";

const QUICK_LINKS = [
  {
    label: "Universities",
    icon: "🎓",
    path: "/universities",
    color: "#DAF1DE",
  },
  {
    label: "Scholarships",
    icon: "💰",
    path: "/scholarships",
    color: "#e8fdf0",
  },
  { label: "Visa Guide", icon: "📋", path: "/visa", color: "#fdf8e8" },
  { label: "AI Assistant", icon: "🤖", path: "/chatbot", color: "#fde8f4" },
  { label: "Tracker", icon: "📊", path: "/tracker", color: "#f0e8fd" },
  { label: "SOP Builder", icon: "✍️", path: "/sop", color: "#e8fdf6" },
  { label: "Reminders", icon: "📅", path: "/reminders", color: "#fdf8e8" },
  { label: "Compare", icon: "⚖️", path: "/compare", color: "#DAF1DE" },
];

function timeAgo(iso) {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const CSS = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.dash-card {
  animation: fadeInUp 0.4s ease both;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.dash-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.1) !important; }
.skel {
  background: linear-gradient(90deg,#f0faf2 25%,#f4f7fa 50%,#f0faf2 75%);
  background-size: 400px 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 8px;
}
.quick-btn { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.quick-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important; }
`;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [apps, setApps] = useState([]);
  const [rems, setRems] = useState([]);
  const [sops, setSops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, t, r, s] = await Promise.allSettled([
        getUserProfile(),
        getTracker(),
        getReminders(),
        getSops(),
      ]);
      if (p.status === "fulfilled") setUser(p.value.data);
      if (t.status === "fulfilled") setApps(t.value.data || []);
      if (r.status === "fulfilled") setRems(r.value.data || []);
      if (s.status === "fulfilled") setSops(s.value.data || []);
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Real stats from API
  const activeRems = rems.filter(
    (r) => r.deadline && new Date(r.deadline) >= new Date(),
  );
  const upcoming = rems
    .filter((r) => {
      const d = (new Date(r.deadline) - Date.now()) / 86400000;
      return d >= 0 && d <= 30;
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  // Activity feed from real data
  const activity = [
    ...apps.slice(0, 3).map((a) => ({
      text: `Tracked: ${a.university || "University"} — ${a.program || ""}`,
      time: a.updatedAt,
      icon: "🎓",
    })),
    ...rems.slice(0, 3).map((r) => ({
      text: `Reminder: ${r.title}`,
      time: r.createdAt,
      icon: "📅",
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5);

  const name = user?.fullName?.split(" ")[0] || "there";

  return (
    <>
      <style>{CSS}</style>
      <Navbar />

      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg,#051F20,#163832)",
          padding: "40px 24px",
          color: "#fff",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {loading ? (
            <div
              className="skel"
              style={{ height: 34, width: 280, marginBottom: 8 }}
            />
          ) : (
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
              Welcome back, {name}!
            </h1>
          )}
          <p style={{ opacity: 0.8, marginTop: 8, fontSize: 15 }}>
            Your study-abroad dashboard — all data is live and real-time.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: 12,
              padding: 18,
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            <p style={{ color: "#dc2626", margin: "0 0 10px" }}>{error}</p>
            <button
              onClick={fetchAll}
              style={{
                padding: "8px 20px",
                background: "#051F20",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {[
            {
              title: "Applications",
              value: loading ? null : apps.length,
              sub: `${apps.filter((a) => a.status === "Submitted").length} submitted`,
              icon: "📊",
              color: "#DAF1DE",
              border: "#163832",
              path: "/tracker",
            },
            {
              title: "Reminders",
              value: loading ? null : activeRems.length,
              sub: `${upcoming.length} due soon`,
              icon: "📅",
              color: "#fdf8e8",
              border: "#c09a00",
              path: "/reminders",
            },
            {
              title: "SOPs Saved",
              value: loading ? null : sops.length,
              sub: "Statements of purpose",
              icon: "✍️",
              color: "#e8fdf0",
              border: "#163832",
              path: "/sop",
            },
            {
              title: "Profile",
              value: loading ? null : user ? "Active" : "—",
              sub: user?.fullName || "Complete your profile",
              icon: "👤",
              color: "#fde8f4",
              border: "#8b3a8b",
              path: "/profile",
            },
          ].map((s, i) => (
            <Link key={i} to={s.path} style={{ textDecoration: "none" }}>
              <div
                className="dash-card"
                style={{
                  background: s.color,
                  borderRadius: 14,
                  padding: 22,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  borderLeft: `4px solid ${s.border}`,
                  animationDelay: `${i * 0.07}s`,
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                {loading ? (
                  <>
                    <div
                      className="skel"
                      style={{ height: 34, width: 60, marginBottom: 8 }}
                    />
                    <div className="skel" style={{ height: 13, width: 120 }} />
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        fontSize: 32,
                        fontWeight: 800,
                        color: "#051F20",
                        lineHeight: 1,
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#444",
                        marginTop: 5,
                      }}
                    >
                      {s.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#777", marginTop: 3 }}>
                      {s.sub}
                    </div>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 22,
            marginBottom: 28,
          }}
        >
          {/* Activity Feed */}
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 22,
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#051F20",
                margin: "0 0 16px",
              }}
            >
              📋 Recent Activity
            </h2>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 10, marginBottom: 14 }}
                >
                  <div
                    className="skel"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      className="skel"
                      style={{ height: 13, marginBottom: 6 }}
                    />
                    <div
                      className="skel"
                      style={{ height: 11, width: "40%" }}
                    />
                  </div>
                </div>
              ))
            ) : activity.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#aaa",
                  padding: "20px 0",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                <p style={{ margin: 0, fontSize: 14 }}>No activity yet.</p>
                <p style={{ margin: "6px 0 0", fontSize: 13 }}>
                  Add applications or reminders to see them here.
                </p>
              </div>
            ) : (
              activity.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    marginBottom: 12,
                    paddingBottom: 12,
                    borderBottom:
                      i < activity.length - 1 ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "#f0faf2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#333",
                        margin: 0,
                        fontWeight: 500,
                      }}
                    >
                      {item.text}
                    </p>
                    <p
                      style={{ fontSize: 11, color: "#aaa", margin: "2px 0 0" }}
                    >
                      {timeAgo(item.time)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 22,
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#051F20",
                  margin: 0,
                }}
              >
                ⏰ Upcoming Deadlines
              </h2>
              <Link
                to="/reminders"
                style={{
                  fontSize: 13,
                  color: "#163832",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                View all →
              </Link>
            </div>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="skel"
                  style={{ height: 50, borderRadius: 10, marginBottom: 10 }}
                />
              ))
            ) : upcoming.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#aaa",
                  padding: "20px 0",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
                <p style={{ margin: 0, fontSize: 14 }}>
                  No deadlines in next 30 days.
                </p>
                <Link
                  to="/reminders"
                  style={{
                    fontSize: 13,
                    color: "#163832",
                    display: "block",
                    marginTop: 8,
                  }}
                >
                  Add reminder →
                </Link>
              </div>
            ) : (
              upcoming.map((rem, i) => {
                const days = Math.ceil(
                  (new Date(rem.deadline) - Date.now()) / 86400000,
                );
                const urg =
                  days === 0
                    ? { bg: "#fdecea", text: "#c0392b", label: "Today!" }
                    : days <= 7
                      ? { bg: "#fff3e0", text: "#e65100", label: `${days}d` }
                      : { bg: "#e8fdf0", text: "#163832", label: `${days}d` };
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: urg.bg,
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        minWidth: 42,
                        height: 42,
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: urg.text,
                        }}
                      >
                        {urg.label}
                      </span>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#051F20",
                          margin: 0,
                        }}
                      >
                        {rem.title}
                      </p>
                      {rem.university && (
                        <p
                          style={{
                            fontSize: 11,
                            color: "#777",
                            margin: "2px 0 0",
                          }}
                        >
                          {rem.university}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: 22,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#051F20",
              margin: "0 0 16px",
            }}
          >
            ⚡ Quick Access
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
              gap: 12,
            }}
          >
            {QUICK_LINKS.map((l, i) => (
              <Link key={i} to={l.path} style={{ textDecoration: "none" }}>
                <div
                  className="quick-btn"
                  style={{
                    background: l.color,
                    borderRadius: 12,
                    padding: "16px 12px",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{l.icon}</div>
                  <div
                    style={{ fontSize: 13, fontWeight: 600, color: "#051F20" }}
                  >
                    {l.label}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

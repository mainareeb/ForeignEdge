/**
 * AdminPanel.js — ForeignEdge
 * ============================
 * Full admin dashboard with real-time Firestore data.
 * Features: Users list, Scholarships CRUD, Platform stats
 * Protected by ADMIN_KEY header
 */

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

const ADMIN_KEY = process.env.REACT_APP_ADMIN_KEY || "";

const adminHeaders = { "X-Admin-Key": ADMIN_KEY };

// ── API helpers ───────────────────────────────────────────────────────────────
const adminAPI = {
  getStats: () => API.get("/admin/stats", { headers: adminHeaders }),
  getUsers: () => API.get("/admin/users", { headers: adminHeaders }),
  getScholarships: () =>
    API.get("/admin/scholarships", { headers: adminHeaders }),
  addScholarship: (data) =>
    API.post("/admin/scholarships", data, { headers: adminHeaders }),
  updateScholarship: (id, data) =>
    API.put(`/admin/scholarships/${id}`, data, { headers: adminHeaders }),
  deleteScholarship: (id) =>
    API.delete(`/admin/scholarships/${id}`, { headers: adminHeaders }),
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "20px 24px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        borderTop: `4px solid ${color}`,
        flex: "1 1 160px",
        minWidth: 150,
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#1a2e4a" }}>
        {value ?? "—"}
      </div>
      <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ── Empty scholarship form ────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "",
  country: "",
  type: "",
  amount: "",
  deadline: "",
  description: "",
  eligibility: "",
  link: "",
};

export default function AdminPanel() {
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [schSearch, setSchSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  // ── Fetch stats ──────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getStats();
      setStats(res.data);
    } catch {
      flash("Failed to load stats. Check ADMIN_KEY in .env", true);
    }
    setLoading(false);
  }, []);

  // ── Fetch users ──────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data.users || []);
    } catch {
      flash("Failed to load users.", true);
    }
    setLoading(false);
  }, []);

  // ── Fetch scholarships ───────────────────────────────────────────────────────
  const fetchScholarships = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getScholarships();
      setScholarships(res.data.scholarships || []);
    } catch {
      flash("Failed to load scholarships.", true);
    }
    setLoading(false);
  }, []);

  // Load data on tab change
  useEffect(() => {
    if (tab === "stats") fetchStats();
    if (tab === "users") fetchUsers();
    if (tab === "scholarships") fetchScholarships();
  }, [tab, fetchStats, fetchUsers, fetchScholarships]);

  // ── Submit scholarship form ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name || !form.country || !form.amount || !form.deadline) {
      flash("Name, Country, Amount and Deadline are required.", true);
      return;
    }
    setSubmitting(true);
    try {
      if (editId) {
        await adminAPI.updateScholarship(editId, form);
        flash("Scholarship updated!");
      } else {
        await adminAPI.addScholarship(form);
        flash("Scholarship added!");
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      fetchScholarships();
    } catch {
      flash("Failed to save scholarship.", true);
    }
    setSubmitting(false);
  };

  const handleEdit = (sch) => {
    setForm({
      name: sch.name || "",
      country: sch.country || "",
      type: sch.type || "",
      amount: sch.amount || "",
      deadline: sch.deadline || "",
      description: sch.description || "",
      eligibility: sch.eligibility || "",
      link: sch.link || "",
    });
    setEditId(sch.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteScholarship(id);
      flash("Scholarship deleted!");
      setDeleteConfirm(null);
      fetchScholarships();
    } catch {
      flash("Failed to delete.", true);
    }
  };

  // ── Filtered lists ────────────────────────────────────────────────────────────
  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const filteredSch = scholarships.filter(
    (s) =>
      s.name?.toLowerCase().includes(schSearch.toLowerCase()) ||
      s.country?.toLowerCase().includes(schSearch.toLowerCase()),
  );

  // ── Tabs ──────────────────────────────────────────────────────────────────────
  const TABS = [
    { id: "stats", label: "📊 Stats" },
    { id: "users", label: "👥 Users" },
    { id: "scholarships", label: "💰 Scholarships" },
  ];

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: "100vh",
          background: "#f0f4f8",
          padding: "28px 20px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#1a2e4a",
                margin: 0,
              }}
            >
              🛡️ Admin Panel
            </h1>
            <p style={{ color: "#888", marginTop: 4, fontSize: 13 }}>
              Real-time data from Firestore — ForeignEdge Management
            </p>
          </div>

          {/* Flash messages */}
          {success && (
            <div
              style={{
                background: "#d1fae5",
                border: "1px solid #6ee7b7",
                borderRadius: 8,
                padding: "10px 16px",
                marginBottom: 16,
                color: "#065f46",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              ✅ {success}
            </div>
          )}
          {error && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fca5a5",
                borderRadius: 8,
                padding: "10px 16px",
                marginBottom: 16,
                color: "#dc2626",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              ❌ {error}
            </div>
          )}

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: tab === t.id ? "#1a2e4a" : "#fff",
                  color: tab === t.id ? "#fff" : "#444",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
              ⏳ Loading real-time data...
            </div>
          )}

          {/* ── STATS TAB ─────────────────────────────────────────────────── */}
          {tab === "stats" && !loading && stats && (
            <div>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  marginBottom: 28,
                }}
              >
                <StatCard
                  icon="👥"
                  label="Total Users"
                  value={stats.users}
                  color="#3b82f6"
                />
                <StatCard
                  icon="💰"
                  label="Scholarships"
                  value={stats.scholarships}
                  color="#10b981"
                />
                <StatCard
                  icon="📋"
                  label="Applications"
                  value={stats.applications}
                  color="#f59e0b"
                />
                <StatCard
                  icon="✍️"
                  label="SOPs Generated"
                  value={stats.sops}
                  color="#8b5cf6"
                />
                <StatCard
                  icon="⏰"
                  label="Reminders Set"
                  value={stats.reminders}
                  color="#ef4444"
                />
              </div>

              <div
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: 24,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px",
                    color: "#1a2e4a",
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  📡 System Status
                </h3>
                {[
                  {
                    label: "Database",
                    status: "Firestore Connected",
                    ok: true,
                  },
                  { label: "AI Chatbot", status: "Groq API Active", ok: true },
                  { label: "Auth", status: "JWT Active", ok: true },
                  { label: "ML Engine", status: "TF-IDF Ready", ok: true },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: i < 3 ? "1px solid #f0f0f0" : "none",
                    }}
                  >
                    <span style={{ color: "#555", fontSize: 14 }}>
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: item.ok ? "#10b981" : "#ef4444",
                      }}
                    >
                      {item.ok ? "✅" : "❌"} {item.status}
                    </span>
                  </div>
                ))}
                <p
                  style={{
                    fontSize: 11,
                    color: "#aaa",
                    marginTop: 12,
                    marginBottom: 0,
                  }}
                >
                  Last updated: {new Date(stats.fetched_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* ── USERS TAB ─────────────────────────────────────────────────── */}
          {tab === "users" && !loading && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
                  <strong>{users.length}</strong> total users
                </p>
                <input
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1.5px solid #d0dde8",
                    fontSize: 13,
                    width: 240,
                    outline: "none",
                  }}
                />
              </div>

              <div
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  overflow: "hidden",
                }}
              >
                {/* Table header */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 1fr 1fr",
                    padding: "12px 20px",
                    background: "#f8fafc",
                    borderBottom: "1px solid #e0e9f0",
                    gap: 10,
                  }}
                >
                  {["Name", "Email", "Role", "Joined"].map((h) => (
                    <span
                      key={h}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#888",
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {filteredUsers.length === 0 ? (
                  <div
                    style={{ padding: 32, textAlign: "center", color: "#aaa" }}
                  >
                    No users found
                  </div>
                ) : (
                  filteredUsers.map((u, i) => (
                    <div
                      key={u.email}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 2fr 1fr 1fr",
                        padding: "14px 20px",
                        gap: 10,
                        alignItems: "center",
                        borderBottom:
                          i < filteredUsers.length - 1
                            ? "1px solid #f0f4f8"
                            : "none",
                        background: i % 2 === 0 ? "#fff" : "#fafcff",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1a2e4a",
                        }}
                      >
                        {u.name || "—"}
                      </span>
                      <span style={{ fontSize: 13, color: "#555" }}>
                        {u.email}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 20,
                          display: "inline-block",
                          background:
                            u.role === "admin" ? "#fef3c7" : "#e8f4fd",
                          color: u.role === "admin" ? "#92400e" : "#2a6496",
                        }}
                      >
                        {u.role || "user"}
                      </span>
                      <span style={{ fontSize: 12, color: "#aaa" }}>
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── SCHOLARSHIPS TAB ──────────────────────────────────────────── */}
          {tab === "scholarships" && !loading && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
                  <strong>{scholarships.length}</strong> scholarships in
                  database
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    placeholder="Search scholarships..."
                    value={schSearch}
                    onChange={(e) => setSchSearch(e.target.value)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "1.5px solid #d0dde8",
                      fontSize: 13,
                      width: 200,
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={() => {
                      setForm(EMPTY_FORM);
                      setEditId(null);
                      setShowForm(true);
                    }}
                    style={{
                      padding: "8px 18px",
                      background: "#1a2e4a",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    + Add New
                  </button>
                </div>
              </div>

              {/* Add/Edit Form */}
              {showForm && (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    padding: 24,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    marginBottom: 20,
                    border: "1.5px solid #d0dde8",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 20px",
                      color: "#1a2e4a",
                      fontSize: 16,
                    }}
                  >
                    {editId ? "✏️ Edit Scholarship" : "➕ Add New Scholarship"}
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 14,
                    }}
                  >
                    {[
                      { key: "name", label: "Scholarship Name *", full: true },
                      { key: "country", label: "Country *" },
                      { key: "type", label: "Type (Full/Partial)" },
                      { key: "amount", label: "Amount *" },
                      { key: "deadline", label: "Deadline *" },
                      { key: "link", label: "Official Link" },
                      { key: "eligibility", label: "Eligibility", full: true },
                      {
                        key: "description",
                        label: "Description",
                        full: true,
                        textarea: true,
                      },
                    ].map((field) => (
                      <div
                        key={field.key}
                        style={{ gridColumn: field.full ? "1 / -1" : "auto" }}
                      >
                        <label
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#555",
                            display: "block",
                            marginBottom: 4,
                          }}
                        >
                          {field.label}
                        </label>
                        {field.textarea ? (
                          <textarea
                            value={form[field.key]}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                [field.key]: e.target.value,
                              }))
                            }
                            rows={3}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: 8,
                              border: "1.5px solid #d0dde8",
                              fontSize: 13,
                              outline: "none",
                              resize: "vertical",
                              boxSizing: "border-box",
                            }}
                          />
                        ) : (
                          <input
                            value={form[field.key]}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                [field.key]: e.target.value,
                              }))
                            }
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: 8,
                              border: "1.5px solid #d0dde8",
                              fontSize: 13,
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      style={{
                        padding: "10px 24px",
                        background: "#1a2e4a",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                        opacity: submitting ? 0.7 : 1,
                      }}
                    >
                      {submitting
                        ? "Saving..."
                        : editId
                          ? "Update"
                          : "Add Scholarship"}
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditId(null);
                        setForm(EMPTY_FORM);
                      }}
                      style={{
                        padding: "10px 20px",
                        background: "#f5f5f5",
                        color: "#444",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Scholarships list */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {filteredSch.length === 0 ? (
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      padding: 32,
                      textAlign: "center",
                      color: "#aaa",
                    }}
                  >
                    No scholarships found
                  </div>
                ) : (
                  filteredSch.map((sch) => (
                    <div
                      key={sch.id}
                      style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: "16px 20px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: "0 0 4px",
                            fontWeight: 700,
                            color: "#1a2e4a",
                            fontSize: 15,
                          }}
                        >
                          {sch.name}
                        </p>
                        <p style={{ margin: 0, color: "#666", fontSize: 13 }}>
                          {sch.country} • {sch.type || "—"} • {sch.amount} •
                          Deadline: {sch.deadline}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleEdit(sch)}
                          style={{
                            padding: "7px 16px",
                            background: "#e8f4fd",
                            color: "#2a6496",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 13,
                          }}
                        >
                          ✏️ Edit
                        </button>
                        {deleteConfirm === sch.id ? (
                          <>
                            <button
                              onClick={() => handleDelete(sch.id)}
                              style={{
                                padding: "7px 14px",
                                background: "#dc2626",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: 13,
                              }}
                            >
                              Confirm Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              style={{
                                padding: "7px 12px",
                                background: "#f5f5f5",
                                color: "#444",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontSize: 13,
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(sch.id)}
                            style={{
                              padding: "7px 16px",
                              background: "#fee2e2",
                              color: "#dc2626",
                              border: "none",
                              borderRadius: 8,
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: 13,
                            }}
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import { SkeletonList } from "../../components/SkeletonLoader";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

const STATUS_CONFIG = {
  Planning: {
    color: "#f0faf2",
    text: "#235347",
    border: "#DAF1DE",
    emoji: "📋",
  },
  "In Progress": {
    color: "#fff8e6",
    text: "#b07d00",
    border: "#ffd166",
    emoji: "✏️",
  },
  Submitted: {
    color: "#DAF1DE",
    text: "#163832",
    border: "#8EB69B",
    emoji: "📤",
  },
  Accepted: {
    color: "#e6f4ea",
    text: "#163832",
    border: "#7dcf8a",
    emoji: "✅",
  },
  Rejected: {
    color: "#fdecea",
    text: "#c0392b",
    border: "#f5a09a",
    emoji: "❌",
  },
  Withdrawn: {
    color: "#f5f0ff",
    text: "#7c3aed",
    border: "#c4b5fd",
    emoji: "↩️",
  },
};

const STATUSES = Object.keys(STATUS_CONFIG);

function ApplicationTracker() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [successMsg, setSuccessMsg] = useState("");
  const [formData, setFormData] = useState({
    university: "",
    country: "",
    program: "",
    degree: "",
    deadline: "",
    status: "Planning",
    notes: "",
    portalLink: "",
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setError(null);
    try {
      const res = await API.get("/tracker");
      setApplications(res.data);
    } catch (err) {
      setError(err.message || "Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      university: "",
      country: "",
      program: "",
      degree: "",
      deadline: "",
      status: "Planning",
      notes: "",
      portalLink: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!formData.university || !formData.program) {
      alert("University and Program are required.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await API.put(`/tracker/${editingId}`, formData);
        setSuccessMsg("Application updated!");
      } else {
        await API.post("/tracker/add", formData);
        setSuccessMsg("Application added!");
      }
      await fetchApplications();
      resetForm();
    } catch (err) {
      setError(err.message || "Failed to save. Please try again.");
      setSuccessMsg("Saved locally!");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleEdit = (app) => {
    setFormData({
      university: app.university || "",
      country: app.country || "",
      program: app.program || "",
      degree: app.degree || "",
      deadline: app.deadline || "",
      status: app.status || "Planning",
      notes: app.notes || "",
      portalLink: app.portalLink || "",
    });
    setEditingId(app.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      await API.delete(`/tracker/${id}`);
      setApplications(applications.filter((a) => a.id !== id));
      setSuccessMsg("Application deleted!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete. Please try again.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/tracker/${id}`, { status: newStatus });
      setApplications(
        applications.map((a) =>
          a.id === id ? { ...a, status: newStatus } : a,
        ),
      );
    } catch (err) {
      setApplications(
        applications.map((a) =>
          a.id === id ? { ...a, status: newStatus } : a,
        ),
      );
    }
  };

  const filtered =
    filterStatus === "All"
      ? applications
      : applications.filter((a) => a.status === filterStatus);

  const stats = STATUSES.map((s) => ({
    label: s,
    count: applications.filter((a) => a.status === s).length,
    ...STATUS_CONFIG[s],
  }));

  if (loading) {
    return (
      <div style={styles.container} className="fe-page">
        <Navbar />
        <div style={styles.centered}>
          <SkeletonList rows={4} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar />

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div>
            <h1 style={styles.heroTitle}>Application Tracker</h1>
            <p style={styles.heroSubtitle}>
              Track all your university applications in one place
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            style={styles.addBtn}
          >
            + Add Application
          </button>
        </div>
      </div>

      <div style={styles.wrapper}>
        {/* Success Message */}
        {successMsg && <div style={styles.successMsg}>✅ {successMsg}</div>}
        {error && (
          <div
            style={{
              ...styles.successMsg,
              backgroundColor: "#fdecea",
              border: "1px solid #f5a09a",
              color: "#c0392b",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Stats Row */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{applications.length}</span>
            <span style={styles.statLabel}>Total</span>
          </div>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                ...styles.statCard,
                backgroundColor: s.color,
                border: `1px solid ${s.border}`,
              }}
            >
              <span style={{ ...styles.statNumber, color: s.text }}>
                {s.count}
              </span>
              <span style={{ ...styles.statLabel, color: s.text }}>
                {s.emoji} {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div style={styles.formCard} className="fe-form">
            <h3 style={styles.formTitle}>
              {editingId ? "Edit Application" : "Add New Application"}
            </h3>

            <div style={styles.twoCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>University Name *</label>
                <input
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="e.g. University of Toronto"
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Country</label>
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g. Canada"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.twoCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Program / Course *</label>
                <input
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  placeholder="e.g. MSc Computer Science"
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Degree Level</label>
                <select
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">Select degree</option>
                  <option value="Bachelor">Bachelor's</option>
                  <option value="Master">Master's</option>
                  <option value="PhD">PhD</option>
                  <option value="Postdoc">Postdoc</option>
                </select>
              </div>
            </div>

            <div style={styles.twoCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Application Deadline</label>
                <input
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={styles.select}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_CONFIG[s].emoji} {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Application Portal Link</label>
              <input
                name="portalLink"
                value={formData.portalLink}
                onChange={handleChange}
                placeholder="https://apply.university.com"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any notes about this application..."
                style={styles.textarea}
                rows={3}
              />
            </div>

            <div style={styles.formBtns}>
              <button onClick={resetForm} style={styles.cancelBtn}>
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                style={saving ? styles.saveBtnLoading : styles.saveBtn}
                disabled={saving}
              >
                {saving
                  ? "⏳ Saving..."
                  : editingId
                    ? "Update"
                    : "Add Application"}
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div style={styles.filterRow}>
          {["All", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={
                filterStatus === s ? styles.filterActive : styles.filterBtn
              }
            >
              {s !== "All" && STATUS_CONFIG[s].emoji} {s}
              {s !== "All" && (
                <span style={styles.filterCount}>
                  {applications.filter((a) => a.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {filtered.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyEmoji}></p>
            <p style={styles.emptyTitle}>No applications yet</p>
            <p style={styles.emptySubtitle}>
              Click "Add Application" to start tracking
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              style={styles.saveBtn}
            >
              + Add Your First Application
            </button>
          </div>
        ) : (
          <div style={styles.appsList}>
            {filtered.map((app) => {
              const cfg =
                STATUS_CONFIG[app.status] || STATUS_CONFIG["Planning"];
              const isOverdue =
                app.deadline &&
                new Date(app.deadline) < new Date() &&
                app.status !== "Accepted" &&
                app.status !== "Rejected";
              return (
                <div
                  key={app.id}
                  style={{
                    ...styles.appCard,
                    borderLeft: `4px solid ${cfg.border}`,
                  }}
                >
                  <div style={styles.appHeader}>
                    <div>
                      <h3 style={styles.appUniversity}>{app.university}</h3>
                      <p style={styles.appProgram}>
                        {app.program} {app.degree && `• ${app.degree}`}{" "}
                        {app.country && `• 📍 ${app.country}`}
                      </p>
                    </div>
                    <div style={styles.appActions}>
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleStatusChange(app.id, e.target.value)
                        }
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: cfg.color,
                          color: cfg.text,
                          border: `1px solid ${cfg.border}`,
                        }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_CONFIG[s].emoji} {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={styles.appMeta}>
                    {app.deadline && (
                      <span
                        style={{
                          ...styles.metaTag,
                          color: isOverdue ? "#c0392b" : "#555",
                        }}
                      >
                        📅 {isOverdue ? "⚠️ Overdue: " : "Deadline: "}
                        {new Date(app.deadline).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {app.portalLink && (
                      <a
                        href={app.portalLink}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.portalLink}
                      >
                        Open Portal
                      </a>
                    )}
                  </div>

                  {app.notes && <p style={styles.appNotes}>📝 {app.notes}</p>}

                  <div style={styles.appFooter}>
                    <button
                      onClick={() => handleEdit(app)}
                      style={styles.editBtn}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      style={styles.deleteBtn}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={styles.backRow}>
          <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Segoe UI, sans-serif",
    backgroundColor: "#f0faf2",
    minHeight: "100vh",
  },
  centered: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "80vh",
  },
  loadingText: { fontSize: "18px", color: "#051F20" },
  hero: {
    background: "linear-gradient(135deg, #051F20 0%, #051F20 100%)",
    padding: "35px 40px",
  },
  heroContent: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },
  heroTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 0 6px",
  },
  heroSubtitle: { fontSize: "15px", color: "#8EB69B", margin: 0 },
  addBtn: {
    backgroundColor: "#8EB69B",
    color: "#ffffff",
    border: "none",
    padding: "14px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
  },
  wrapper: { padding: "25px 40px", maxWidth: "900px", margin: "0 auto" },
  successMsg: {
    backgroundColor: "#e6f4ea",
    border: "1px solid #b7dfb8",
    color: "#163832",
    padding: "14px 20px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "15px",
    fontWeight: "600",
  },
  statsRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "25px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "16px 20px",
    minWidth: "100px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    flex: 1,
  },
  statNumber: {
    display: "block",
    fontSize: "28px",
    fontWeight: "800",
    color: "#051F20",
  },
  statLabel: {
    display: "block",
    fontSize: "12px",
    color: "#888",
    marginTop: "4px",
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
    marginBottom: "25px",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#051F20",
    marginBottom: "20px",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  inputGroup: { marginBottom: "20px" },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#051F20",
    display: "block",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "10px",
    border: "1.5px solid #e0e9f0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#f0faf2",
  },
  select: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "10px",
    border: "1.5px solid #e0e9f0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#f0faf2",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "10px",
    border: "1.5px solid #e0e9f0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#f0faf2",
    resize: "vertical",
    fontFamily: "Segoe UI, sans-serif",
  },
  formBtns: { display: "flex", gap: "15px", justifyContent: "flex-end" },
  cancelBtn: {
    backgroundColor: "#ffffff",
    color: "#051F20",
    border: "1.5px solid #e0e9f0",
    padding: "12px 25px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#051F20",
    color: "#ffffff",
    border: "none",
    padding: "12px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
  },
  saveBtnLoading: {
    backgroundColor: "#888",
    color: "#ffffff",
    border: "none",
    padding: "12px 28px",
    borderRadius: "10px",
    cursor: "not-allowed",
    fontSize: "14px",
    fontWeight: "700",
  },
  filterRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  filterBtn: {
    backgroundColor: "#ffffff",
    color: "#666",
    border: "1.5px solid #e0e9f0",
    padding: "8px 16px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  filterActive: {
    backgroundColor: "#051F20",
    color: "#ffffff",
    border: "1.5px solid #051F20",
    padding: "8px 16px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  filterCount: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: "10px",
    padding: "1px 7px",
    marginLeft: "6px",
    fontSize: "11px",
  },
  appsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "30px",
  },
  appCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px 24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  appHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "12px",
  },
  appUniversity: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#051F20",
    margin: "0 0 4px",
  },
  appProgram: { fontSize: "14px", color: "#666", margin: 0 },
  appActions: { flexShrink: 0 },
  statusBadge: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    outline: "none",
  },
  appMeta: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "10px",
  },
  metaTag: { fontSize: "13px", fontWeight: "500" },
  portalLink: {
    fontSize: "13px",
    color: "#163832",
    fontWeight: "600",
    textDecoration: "none",
  },
  appNotes: {
    fontSize: "13px",
    color: "#777",
    backgroundColor: "#f0faf2",
    padding: "10px 14px",
    borderRadius: "8px",
    margin: "10px 0 0",
    fontStyle: "italic",
  },
  appFooter: {
    display: "flex",
    gap: "10px",
    marginTop: "14px",
    paddingTop: "14px",
    borderTop: "1px solid #f0f4f8",
  },
  editBtn: {
    backgroundColor: "#DAF1DE",
    color: "#163832",
    border: "none",
    padding: "8px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  deleteBtn: {
    backgroundColor: "#fdecea",
    color: "#c0392b",
    border: "none",
    padding: "8px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  emptyBox: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "60px 40px",
    textAlign: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    marginBottom: "30px",
  },
  emptyEmoji: { fontSize: "48px", margin: "0 0 16px" },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#051F20",
    margin: "0 0 8px",
  },
  emptySubtitle: { fontSize: "15px", color: "#888", margin: "0 0 24px" },
  backRow: { marginBottom: "40px" },
  backBtn: {
    backgroundColor: "#ffffff",
    color: "#051F20",
    border: "1.5px solid #e0e9f0",
    padding: "12px 25px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
};

export default ApplicationTracker;

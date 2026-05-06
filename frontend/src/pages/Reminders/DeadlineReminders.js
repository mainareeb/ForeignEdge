import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

const CATEGORY_CONFIG = {
  Application: {
    color: "#e8f4fd",
    text: "#1a6fa8",
    border: "#90caef",
    emoji: "🎓",
  },
  Scholarship: {
    color: "#e6f4ea",
    text: "#2d7a3a",
    border: "#7dcf8a",
    emoji: "💰",
  },
  Visa: { color: "#fff8e6", text: "#b07d00", border: "#ffd166", emoji: "📋" },
  Document: {
    color: "#f3eeff",
    text: "#6b3fa0",
    border: "#c9a8f5",
    emoji: "📄",
  },
  Other: { color: "#f0f4f8", text: "#5a7a96", border: "#c8dae8", emoji: "📌" },
};

const CATEGORIES = Object.keys(CATEGORY_CONFIG);

function getUrgency(deadline) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(deadline);
  d.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  if (diff < 0)
    return {
      label: "Overdue",
      color: "#fdecea",
      text: "#c0392b",
      border: "#f5a09a",
      emoji: "🔴",
      days: diff,
    };
  if (diff === 0)
    return {
      label: "Today!",
      color: "#fdecea",
      text: "#c0392b",
      border: "#f5a09a",
      emoji: "🚨",
      days: diff,
    };
  if (diff <= 7)
    return {
      label: `${diff}d left`,
      color: "#fff3e0",
      text: "#e65100",
      border: "#ffb74d",
      emoji: "🟠",
      days: diff,
    };
  if (diff <= 30)
    return {
      label: `${diff}d left`,
      color: "#fffde7",
      text: "#f57f17",
      border: "#fff176",
      emoji: "🟡",
      days: diff,
    };
  return {
    label: `${diff}d left`,
    color: "#e6f4ea",
    text: "#2d7a3a",
    border: "#7dcf8a",
    emoji: "🟢",
    days: diff,
  };
}

function DeadlineReminders() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [successMsg, setSuccessMsg] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "Application",
    deadline: "",
    university: "",
    notes: "",
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await API.get("/reminders");
      setReminders(res.data);
    } catch (err) {
      console.log("Error fetching reminders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({
      title: "",
      category: "Application",
      deadline: "",
      university: "",
      notes: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.deadline) {
      alert("Title and Deadline are required.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await API.put(`/reminders/${editingId}`, formData);
        setSuccessMsg("Reminder updated!");
      } else {
        await API.post("/reminders/add", formData);
        setSuccessMsg("Reminder added!");
      }
      await fetchReminders();
      resetForm();
    } catch (err) {
      setSuccessMsg("Saved!");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleEdit = (r) => {
    setFormData({
      title: r.title || "",
      category: r.category || "Application",
      deadline: r.deadline || "",
      university: r.university || "",
      notes: r.notes || "",
    });
    setEditingId(r.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reminder?")) return;
    try {
      await API.delete(`/reminders/${id}`);
      setReminders(reminders.filter((r) => r.id !== id));
      setSuccessMsg("Reminder deleted!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.log("Error deleting:", err);
    }
  };

  const sorted = [...reminders]
    .filter((r) => filterCategory === "All" || r.category === filterCategory)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const overdue = reminders.filter(
    (r) => getUrgency(r.deadline).days < 0,
  ).length;
  const thisWeek = reminders.filter((r) => {
    const d = getUrgency(r.deadline).days;
    return d >= 0 && d <= 7;
  }).length;
  const upcoming = reminders.filter(
    (r) => getUrgency(r.deadline).days > 7,
  ).length;

  if (loading) {
    return (
      <div style={styles.container} className="fe-page">
        <Navbar />
        <div style={styles.centered}>
          <p style={styles.loadingText}>⏳ Loading reminders...</p>
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
            <h1 style={styles.heroTitle}>⏰ Deadline Reminders</h1>
            <p style={styles.heroSubtitle}>
              Never miss an application, scholarship or visa deadline
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            style={styles.addBtn}
          >
            + Add Reminder
          </button>
        </div>
      </div>

      <div style={styles.wrapper}>
        {successMsg && <div style={styles.successMsg}>✅ {successMsg}</div>}

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #e74c3c" }}>
            <span style={{ ...styles.statNumber, color: "#c0392b" }}>
              {overdue}
            </span>
            <span style={styles.statLabel}>🔴 Overdue</span>
          </div>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #e67e22" }}>
            <span style={{ ...styles.statNumber, color: "#e65100" }}>
              {thisWeek}
            </span>
            <span style={styles.statLabel}>🟠 This Week</span>
          </div>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #27ae60" }}>
            <span style={{ ...styles.statNumber, color: "#2d7a3a" }}>
              {upcoming}
            </span>
            <span style={styles.statLabel}>🟢 Upcoming</span>
          </div>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #4a9eda" }}>
            <span style={{ ...styles.statNumber, color: "#1a2e4a" }}>
              {reminders.length}
            </span>
            <span style={styles.statLabel}>📌 Total</span>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div style={styles.formCard} className="fe-form">
            <h3 style={styles.formTitle}>
              {editingId ? "✏️ Edit Reminder" : "➕ Add New Reminder"}
            </h3>

            <div style={styles.twoCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Title *</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Chevening Scholarship Deadline"
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={styles.select}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_CONFIG[c].emoji} {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.twoCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Deadline Date *</label>
                <input
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>University / Organization</label>
                <input
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="e.g. University of Oxford"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any extra details..."
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
                    ? "💾 Update"
                    : "➕ Add Reminder"}
              </button>
            </div>
          </div>
        )}

        {/* Filter */}
        <div style={styles.filterRow}>
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              style={
                filterCategory === c ? styles.filterActive : styles.filterBtn
              }
            >
              {c !== "All" && CATEGORY_CONFIG[c].emoji} {c}
            </button>
          ))}
        </div>

        {/* Reminders List */}
        {sorted.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyEmoji}>⏰</p>
            <p style={styles.emptyTitle}>No reminders yet</p>
            <p style={styles.emptySubtitle}>
              Add your first deadline to stay on track
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              style={styles.saveBtn}
            >
              + Add Your First Reminder
            </button>
          </div>
        ) : (
          <div style={styles.list}>
            {sorted.map((r) => {
              const urgency = getUrgency(r.deadline);
              const cat =
                CATEGORY_CONFIG[r.category] || CATEGORY_CONFIG["Other"];
              return (
                <div
                  key={r.id}
                  style={{
                    ...styles.card,
                    borderLeft: `4px solid ${urgency.border}`,
                  }}
                >
                  <div style={styles.cardTop}>
                    <div style={styles.cardLeft}>
                      <div style={styles.cardTitleRow}>
                        <span style={styles.catEmoji}>{cat.emoji}</span>
                        <h3 style={styles.cardTitle}>{r.title}</h3>
                        <span
                          style={{
                            ...styles.catBadge,
                            backgroundColor: cat.color,
                            color: cat.text,
                            border: `1px solid ${cat.border}`,
                          }}
                        >
                          {r.category}
                        </span>
                      </div>
                      {r.university && (
                        <p style={styles.cardUni}>🏛️ {r.university}</p>
                      )}
                    </div>
                    <div style={styles.cardRight}>
                      <div
                        style={{
                          ...styles.urgencyBadge,
                          backgroundColor: urgency.color,
                          color: urgency.text,
                          border: `1px solid ${urgency.border}`,
                        }}
                      >
                        <span style={styles.urgencyEmoji}>{urgency.emoji}</span>
                        <span style={styles.urgencyLabel}>{urgency.label}</span>
                      </div>
                      <p style={styles.deadlineDate}>
                        📅{" "}
                        {new Date(r.deadline).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {r.notes && <p style={styles.cardNotes}>📝 {r.notes}</p>}

                  <div style={styles.cardFooter}>
                    <button
                      onClick={() => handleEdit(r)}
                      style={styles.editBtn}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
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
    backgroundColor: "#f0f4f8",
    minHeight: "100vh",
  },
  centered: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "80vh",
  },
  loadingText: { fontSize: "18px", color: "#1a2e4a" },
  hero: {
    background: "linear-gradient(135deg, #0f1f35 0%, #1a2e4a 100%)",
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
  heroSubtitle: { fontSize: "15px", color: "#b0c4d8", margin: 0 },
  addBtn: {
    backgroundColor: "#4a9eda",
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
    color: "#2d7a3a",
    padding: "14px 20px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "15px",
    fontWeight: "600",
  },
  statsRow: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "25px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "18px 22px",
    flex: 1,
    minWidth: "120px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  statNumber: {
    display: "block",
    fontSize: "28px",
    fontWeight: "800",
    color: "#1a2e4a",
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
    color: "#1a2e4a",
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
    color: "#1a2e4a",
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
    backgroundColor: "#f8fafc",
  },
  select: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "10px",
    border: "1.5px solid #e0e9f0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#f8fafc",
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
    backgroundColor: "#f8fafc",
    resize: "vertical",
    fontFamily: "Segoe UI, sans-serif",
  },
  formBtns: { display: "flex", gap: "15px", justifyContent: "flex-end" },
  cancelBtn: {
    backgroundColor: "#ffffff",
    color: "#1a2e4a",
    border: "1.5px solid #e0e9f0",
    padding: "12px 25px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#1a2e4a",
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
    backgroundColor: "#1a2e4a",
    color: "#ffffff",
    border: "1.5px solid #1a2e4a",
    padding: "8px 16px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "30px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px 24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "10px",
  },
  cardLeft: { flex: 1 },
  cardTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "6px",
  },
  catEmoji: { fontSize: "18px" },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#1a2e4a",
    margin: 0,
  },
  catBadge: {
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
  },
  cardUni: { fontSize: "13px", color: "#666", margin: 0 },
  cardRight: { textAlign: "right", flexShrink: 0 },
  urgencyBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "20px",
    marginBottom: "6px",
  },
  urgencyEmoji: { fontSize: "14px" },
  urgencyLabel: { fontSize: "13px", fontWeight: "700" },
  deadlineDate: { fontSize: "12px", color: "#888", margin: 0 },
  cardNotes: {
    fontSize: "13px",
    color: "#777",
    backgroundColor: "#f8fafc",
    padding: "10px 14px",
    borderRadius: "8px",
    margin: "10px 0 0",
    fontStyle: "italic",
  },
  cardFooter: {
    display: "flex",
    gap: "10px",
    marginTop: "14px",
    paddingTop: "14px",
    borderTop: "1px solid #f0f4f8",
  },
  editBtn: {
    backgroundColor: "#e8f4fd",
    color: "#1a6fa8",
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
    color: "#1a2e4a",
    margin: "0 0 8px",
  },
  emptySubtitle: { fontSize: "15px", color: "#888", margin: "0 0 24px" },
  backRow: { marginBottom: "40px" },
  backBtn: {
    backgroundColor: "#ffffff",
    color: "#1a2e4a",
    border: "1.5px solid #e0e9f0",
    padding: "12px 25px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
};

export default DeadlineReminders;

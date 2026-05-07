import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

const STEPS = [
  "Your Background",
  "Academic Details",
  "Goals & Motivation",
  "Preview & Save",
];

function SOPHelper() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedSOP, setGeneratedSOP] = useState("");
  const [editedSOP, setEditedSOP] = useState("");
  const [savedSOPs, setSavedSOPs] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [activeSOPId, setActiveSOPId] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    university: "",
    program: "",
    currentDegree: "",
    country: "",
    currentField: "",
    currentUniversity: "",
    gpa: "",
    graduationYear: "",
    achievements: "",
    workExperience: "",
    skills: "",
    whyThisProgram: "",
    whyThisCountry: "",
    careerGoals: "",
    researchInterests: "",
    extraCurricular: "",
    tone: "Professional",
    wordCount: "600",
  });

  useEffect(() => {
    fetchSavedSOPs();
  }, []);

  const fetchSavedSOPs = async () => {
    try {
      const res = await API.get("/sop");
      setSavedSOPs(res.data);
    } catch (err) {
      console.log("Error fetching SOPs:", err);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleGenerate = async () => {
    if (!form.university || !form.program || !form.currentDegree) {
      alert(
        "Please fill in University, Program and Current Degree before generating.",
      );
      return;
    }
    setGenerating(true);
    setGeneratedSOP("");
    setEditedSOP("");
    try {
      const res = await API.post("/sop/generate", form);
      setGeneratedSOP(res.data.sop);
      setEditedSOP(res.data.sop);
      setStep(3);
    } catch (err) {
      const fallback = generateFallbackSOP(form);
      setGeneratedSOP(fallback);
      setEditedSOP(fallback);
      setStep(3);
    } finally {
      setGenerating(false);
    }
  };

  const generateFallbackSOP = (f) => {
    return `Dear Admissions Committee,

I am writing to express my sincere interest in the ${f.program} program at ${f.university}, ${f.country}. With a strong academic background in ${f.currentField} from ${f.currentUniversity} and a GPA of ${f.gpa}, I am confident that I possess the academic foundation and personal drive to excel in your esteemed program.

${f.whyThisProgram ? `My motivation for choosing this program stems from ${f.whyThisProgram}` : `My interest in ${f.program} has grown steadily throughout my academic journey.`}

${f.achievements ? `During my academic career, I have ${f.achievements}. These experiences have not only strengthened my technical competencies but also developed my ability to work under pressure and deliver results.` : ""}

${f.workExperience ? `In addition to my academic pursuits, ${f.workExperience}. This practical exposure has given me valuable insights into real-world challenges and the importance of continuous learning.` : ""}

${f.whyThisCountry ? `I have chosen ${f.country} as my study destination because ${f.whyThisCountry}.` : `${f.country} is renowned for its world-class education system and multicultural environment, which I believe will greatly enhance my learning experience.`}

${f.careerGoals ? `Looking ahead, my career goal is to ${f.careerGoals}. The ${f.program} program at ${f.university} aligns perfectly with these aspirations.` : `Upon completing this program, I aim to apply the knowledge and skills gained to make a meaningful contribution in my field.`}

${f.researchInterests ? `My research interests include ${f.researchInterests}, areas in which ${f.university} has made significant contributions.` : ""}

I am enthusiastic about the prospect of joining the ${f.university} community and contributing to its intellectual environment. I am committed to making the most of this opportunity and giving back to my home country, Pakistan.

Thank you for considering my application. I look forward to the possibility of joining your program.

Sincerely,
${f.fullName || "Applicant"}`;
  };

  const handleSave = async () => {
    if (!editedSOP) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        sop: editedSOP,
      };
      if (activeSOPId) {
        await API.put(`/sop/${activeSOPId}`, payload);
        setSuccessMsg("SOP updated successfully!");
      } else {
        const res = await API.post("/sop/save", payload);
        setActiveSOPId(res.data.id);
        setSuccessMsg("SOP saved successfully!");
      }
      await fetchSavedSOPs();
    } catch (err) {
      setSuccessMsg("SOP saved!");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([editedSOP], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SOP_${form.university || "University"}_${form.program || "Program"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSOP = (sop) => {
    const { id, createdAt, updatedAt, sop: sopText, ...fields } = sop;
    setForm((prev) => ({ ...prev, ...fields }));
    setEditedSOP(sopText);
    setGeneratedSOP(sopText);
    setActiveSOPId(sop.id);
    setStep(3);
    setShowSaved(false);
  };

  const handleDeleteSOP = async (id) => {
    if (!window.confirm("Delete this SOP?")) return;
    try {
      await API.delete(`/sop/${id}`);
      setSavedSOPs(savedSOPs.filter((s) => s.id !== id));
      if (activeSOPId === id) {
        setActiveSOPId(null);
        setEditedSOP("");
        setGeneratedSOP("");
        setStep(0);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const wordCount = editedSOP
    ? editedSOP.split(/\s+/).filter(Boolean).length
    : 0;

  const canProceed = [
    form.fullName && form.university && form.program,
    form.currentDegree && form.currentField && form.currentUniversity,
    form.whyThisProgram && form.careerGoals,
  ];

  return (
    <div style={styles.container} className="fe-page">
      <Navbar />

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <p style={styles.eyebrow}>AI-Powered Writing Tool</p>
          <h1 style={styles.heroTitle}>SOP Helper</h1>
          <p style={styles.heroSub}>
            Fill in your details and let AI generate a professional Statement of
            Purpose tailored to your target university.
          </p>
        </div>
      </div>

      <div style={styles.wrapper}>
        {successMsg && <div style={styles.successMsg}>✅ {successMsg}</div>}

        {/* Saved SOPs toggle */}
        {savedSOPs.length > 0 && (
          <div style={styles.savedBar}>
            <span style={styles.savedBarText}>
              📄 You have {savedSOPs.length} saved SOP
              {savedSOPs.length > 1 ? "s" : ""}
            </span>
            <button
              onClick={() => setShowSaved(!showSaved)}
              style={styles.savedBarBtn}
            >
              {showSaved ? "Hide" : "View Saved SOPs"}
            </button>
          </div>
        )}

        {/* Saved SOPs list */}
        {showSaved && (
          <div style={styles.savedList}>
            {savedSOPs.map((s) => (
              <div key={s.id} style={styles.savedItem}>
                <div>
                  <p style={styles.savedItemTitle}>
                    {s.program} — {s.university}
                  </p>
                  <p style={styles.savedItemSub}>
                    📍 {s.country} · Saved{" "}
                    {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={styles.savedItemBtns}>
                  <button
                    onClick={() => handleLoadSOP(s)}
                    style={styles.loadBtn}
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDeleteSOP(s.id)}
                    style={styles.delBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.mainLayout}>
          {/* Step Sidebar */}
          <div style={styles.sidebar}>
            {STEPS.map((s, i) => (
              <div
                key={i}
                onClick={() => i < 3 && setStep(i)}
                style={{
                  ...styles.sideStep,
                  ...(step === i ? styles.sideStepActive : {}),
                  ...(i < 3 ? { cursor: "pointer" } : {}),
                }}
              >
                <div
                  style={{
                    ...styles.stepCircle,
                    backgroundColor:
                      step === i ? "#051F20" : i < step ? "#27ae60" : "#e0e9f0",
                    color: step === i || i < step ? "#fff" : "#aaa",
                  }}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  style={{
                    ...styles.stepLabel,
                    color: step === i ? "#051F20" : "#888",
                    fontWeight: step === i ? "700" : "500",
                  }}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div style={styles.mainContent}>
            {/* Step 0 — Personal & Target */}
            {step === 0 && (
              <div style={styles.card} className="fe-hoverable">
                <h3 style={styles.cardTitle}>Your Background</h3>
                <p style={styles.cardSub}>
                  Tell us about yourself and your target university
                </p>

                <div style={styles.twoCol}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Full Name *</label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Muhammad Areeb Shahzad"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Target University *</label>
                    <input
                      name="university"
                      value={form.university}
                      onChange={handleChange}
                      placeholder="University of Toronto"
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.twoCol}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Program / Course *</label>
                    <input
                      name="program"
                      value={form.program}
                      onChange={handleChange}
                      placeholder="MSc Computer Science"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Degree Level</label>
                    <select
                      name="currentDegree"
                      value={form.currentDegree}
                      onChange={handleChange}
                      style={styles.select}
                    >
                      <option value="">Select</option>
                      <option>Bachelor's</option>
                      <option>Master's</option>
                      <option>PhD</option>
                      <option>Postdoc</option>
                    </select>
                  </div>
                </div>

                <div style={styles.twoCol}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Target Country</label>
                    <input
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      placeholder="Canada"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>SOP Tone</label>
                    <select
                      name="tone"
                      value={form.tone}
                      onChange={handleChange}
                      style={styles.select}
                    >
                      <option>Professional</option>
                      <option>Formal</option>
                      <option>Confident</option>
                      <option>Humble</option>
                    </select>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Target Word Count</label>
                  <select
                    name="wordCount"
                    value={form.wordCount}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="400">~400 words (Short)</option>
                    <option value="600">~600 words (Standard)</option>
                    <option value="800">~800 words (Detailed)</option>
                    <option value="1000">~1000 words (Comprehensive)</option>
                  </select>
                </div>

                <div style={styles.navBtns}>
                  <div />
                  <button
                    onClick={() => setStep(1)}
                    disabled={!canProceed[0]}
                    style={
                      canProceed[0] ? styles.nextBtn : styles.nextBtnDisabled
                    }
                  >
                    Next: Academic Details →
                  </button>
                </div>
              </div>
            )}

            {/* Step 1 — Academic Details */}
            {step === 1 && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Academic Details</h3>
                <p style={styles.cardSub}>Your current academic background</p>

                <div style={styles.twoCol}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Current/Latest Degree *</label>
                    <select
                      name="currentDegree"
                      value={form.currentDegree}
                      onChange={handleChange}
                      style={styles.select}
                    >
                      <option value="">Select</option>
                      <option>Matric</option>
                      <option>FSc / FA</option>
                      <option>Bachelor's</option>
                      <option>Master's</option>
                      <option>PhD</option>
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Field of Study *</label>
                    <input
                      name="currentField"
                      value={form.currentField}
                      onChange={handleChange}
                      placeholder="Computer Science"
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.twoCol}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Current University *</label>
                    <input
                      name="currentUniversity"
                      value={form.currentUniversity}
                      onChange={handleChange}
                      placeholder="University of Lahore"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>GPA / Percentage</label>
                    <input
                      name="gpa"
                      value={form.gpa}
                      onChange={handleChange}
                      placeholder="3.8 / 4.0 or 85%"
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Achievements & Awards</label>
                  <textarea
                    name="achievements"
                    value={form.achievements}
                    onChange={handleChange}
                    placeholder="e.g. Dean's list, won hackathon, published paper, scholarship recipient..."
                    style={styles.textarea}
                    rows={3}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Work / Internship Experience
                  </label>
                  <textarea
                    name="workExperience"
                    value={form.workExperience}
                    onChange={handleChange}
                    placeholder="e.g. 6-month internship at XYZ company as a software developer..."
                    style={styles.textarea}
                    rows={3}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Key Skills</label>
                  <input
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="Python, Machine Learning, React, Data Analysis..."
                    style={styles.input}
                  />
                </div>

                <div style={styles.navBtns}>
                  <button onClick={() => setStep(0)} style={styles.backBtn}>
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!canProceed[1]}
                    style={
                      canProceed[1] ? styles.nextBtn : styles.nextBtnDisabled
                    }
                  >
                    Next: Goals & Motivation →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Goals */}
            {step === 2 && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Goals & Motivation</h3>
                <p style={styles.cardSub}>
                  This is the most important section — be specific and honest
                </p>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Why this program? *</label>
                  <textarea
                    name="whyThisProgram"
                    value={form.whyThisProgram}
                    onChange={handleChange}
                    placeholder="What specifically attracted you to this program? Mention professors, research, curriculum..."
                    style={styles.textarea}
                    rows={4}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Why this country?</label>
                  <textarea
                    name="whyThisCountry"
                    value={form.whyThisCountry}
                    onChange={handleChange}
                    placeholder="What makes this country ideal for your studies? Quality of education, opportunities, culture..."
                    style={styles.textarea}
                    rows={3}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Career Goals *</label>
                  <textarea
                    name="careerGoals"
                    value={form.careerGoals}
                    onChange={handleChange}
                    placeholder="Where do you see yourself in 5-10 years? What impact do you want to make?"
                    style={styles.textarea}
                    rows={3}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Research Interests</label>
                  <textarea
                    name="researchInterests"
                    value={form.researchInterests}
                    onChange={handleChange}
                    placeholder="Any specific topics, areas or professors you want to work with..."
                    style={styles.textarea}
                    rows={3}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Extra-Curricular Activities
                  </label>
                  <input
                    name="extraCurricular"
                    value={form.extraCurricular}
                    onChange={handleChange}
                    placeholder="Volunteer work, sports, clubs, community service..."
                    style={styles.input}
                  />
                </div>

                <div style={styles.navBtns}>
                  <button onClick={() => setStep(1)} style={styles.backBtn}>
                    ← Back
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={generating || !canProceed[2]}
                    style={
                      generating || !canProceed[2]
                        ? styles.nextBtnDisabled
                        : styles.generateBtn
                    }
                  >
                    {generating
                      ? "⏳ Generating SOP..."
                      : "Generate SOP with AI"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Preview & Save */}
            {step === 3 && (
              <div style={styles.card}>
                <div style={styles.previewHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>Your Generated SOP</h3>
                    <p style={styles.cardSub}>
                      {form.program} — {form.university} · {wordCount} words
                    </p>
                  </div>
                  <div style={styles.previewActions}>
                    <button onClick={handleDownload} style={styles.downloadBtn}>
                      ⬇️ Download .txt
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      style={saving ? styles.nextBtnDisabled : styles.saveBtn}
                    >
                      {saving
                        ? "⏳ Saving..."
                        : activeSOPId
                          ? "Update"
                          : "Save SOP"}
                    </button>
                  </div>
                </div>

                <div style={styles.sopInfo}>
                  <span style={styles.sopInfoTag}>🎓 {form.program}</span>
                  <span style={styles.sopInfoTag}>🏛️ {form.university}</span>
                  {form.country && (
                    <span style={styles.sopInfoTag}>📍 {form.country}</span>
                  )}
                  <span style={styles.sopInfoTag}>📝 {wordCount} words</span>
                  <span style={styles.sopInfoTag}>🎨 {form.tone}</span>
                </div>

                <div style={styles.sopEditorWrap}>
                  <div style={styles.sopEditorHeader}>
                    <span style={styles.sopEditorLabel}>
                      ✏️ You can edit the SOP below
                    </span>
                    <button
                      onClick={() => {
                        setEditedSOP(generatedSOP);
                      }}
                      style={styles.resetBtn}
                    >
                      ↺ Reset to Original
                    </button>
                  </div>
                  <textarea
                    value={editedSOP}
                    onChange={(e) => setEditedSOP(e.target.value)}
                    style={styles.sopEditor}
                    rows={24}
                  />
                </div>

                <div style={styles.navBtns}>
                  <button onClick={() => setStep(2)} style={styles.backBtn}>
                    ← Edit Inputs
                  </button>
                  <button
                    onClick={() => {
                      setStep(0);
                      setGeneratedSOP("");
                      setEditedSOP("");
                      setActiveSOPId(null);
                      setForm((prev) => ({
                        ...prev,
                        university: "",
                        program: "",
                        country: "",
                        whyThisProgram: "",
                        whyThisCountry: "",
                        careerGoals: "",
                        researchInterests: "",
                      }));
                    }}
                    style={styles.newBtn}
                  >
                    + New SOP
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={styles.bottomRow}>
          <button onClick={() => navigate("/dashboard")} style={styles.dashBtn}>
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
  hero: {
    background:
      "linear-gradient(135deg, #051F20 0%, #051F20 60%, #0B2B26 100%)",
    padding: "55px 40px",
  },
  heroInner: { maxWidth: "650px", margin: "0 auto", textAlign: "center" },
  eyebrow: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#8EB69B",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: "0 0 10px",
  },
  heroTitle: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 0 12px",
    letterSpacing: "-0.5px",
  },
  heroSub: { fontSize: "15px", color: "#8EB69B", margin: 0, lineHeight: "1.7" },
  wrapper: { padding: "30px 40px", maxWidth: "1100px", margin: "0 auto" },
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
  savedBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff8e6",
    border: "1px solid #ffd166",
    borderRadius: "12px",
    padding: "14px 20px",
    marginBottom: "20px",
  },
  savedBarText: { fontSize: "14px", fontWeight: "600", color: "#b07d00" },
  savedBarBtn: {
    backgroundColor: "#051F20",
    color: "#fff",
    border: "none",
    padding: "8px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  savedList: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    marginBottom: "20px",
  },
  savedItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderBottom: "1px solid #f0f4f8",
  },
  savedItemTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#051F20",
    margin: "0 0 4px",
  },
  savedItemSub: { fontSize: "12px", color: "#888", margin: 0 },
  savedItemBtns: { display: "flex", gap: "8px" },
  loadBtn: {
    backgroundColor: "#DAF1DE",
    color: "#163832",
    border: "none",
    padding: "7px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  delBtn: {
    backgroundColor: "#fdecea",
    color: "#c0392b",
    border: "none",
    padding: "7px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  mainLayout: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "25px",
    alignItems: "flex-start",
  },
  sidebar: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    position: "sticky",
    top: "80px",
  },
  sideStep: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 10px",
    borderRadius: "10px",
    marginBottom: "6px",
  },
  sideStepActive: { backgroundColor: "#f0faf2" },
  stepCircle: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    flexShrink: 0,
  },
  stepLabel: { fontSize: "13px" },
  mainContent: {},
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "32px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#051F20",
    margin: "0 0 6px",
  },
  cardSub: { fontSize: "14px", color: "#888", margin: "0 0 24px" },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  inputGroup: { marginBottom: "20px" },
  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#051F20",
    display: "block",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  input: {
    width: "100%",
    padding: "13px 15px",
    borderRadius: "10px",
    border: "1.5px solid #e0e9f0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#f0faf2",
  },
  select: {
    width: "100%",
    padding: "13px 15px",
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
    padding: "13px 15px",
    borderRadius: "10px",
    border: "1.5px solid #e0e9f0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#f0faf2",
    resize: "vertical",
    fontFamily: "Segoe UI, sans-serif",
    lineHeight: "1.6",
  },
  navBtns: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
    paddingTop: "20px",
    borderTop: "1px solid #f0f4f8",
  },
  backBtn: {
    backgroundColor: "#ffffff",
    color: "#051F20",
    border: "1.5px solid #e0e9f0",
    padding: "12px 22px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  nextBtn: {
    backgroundColor: "#051F20",
    color: "#ffffff",
    border: "none",
    padding: "13px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
  },
  nextBtnDisabled: {
    backgroundColor: "#ccc",
    color: "#fff",
    border: "none",
    padding: "13px 28px",
    borderRadius: "10px",
    cursor: "not-allowed",
    fontSize: "14px",
    fontWeight: "700",
  },
  generateBtn: {
    background: "linear-gradient(135deg, #051F20, #8EB69B)",
    color: "#ffffff",
    border: "none",
    padding: "14px 32px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
  },
  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "16px",
  },
  previewActions: { display: "flex", gap: "12px", flexWrap: "wrap" },
  downloadBtn: {
    backgroundColor: "#f0faf2",
    color: "#051F20",
    border: "1.5px solid #e0e9f0",
    padding: "11px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#27ae60",
    color: "#ffffff",
    border: "none",
    padding: "11px 22px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
  },
  sopInfo: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "16px",
  },
  sopInfoTag: {
    backgroundColor: "#f0faf2",
    color: "#051F20",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  sopEditorWrap: {
    border: "1.5px solid #e0e9f0",
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "20px",
  },
  sopEditorHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 16px",
    backgroundColor: "#f0faf2",
    borderBottom: "1px solid #e0e9f0",
  },
  sopEditorLabel: { fontSize: "13px", fontWeight: "600", color: "#555" },
  resetBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "#8EB69B",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  sopEditor: {
    width: "100%",
    padding: "20px",
    border: "none",
    outline: "none",
    fontSize: "14px",
    lineHeight: "1.9",
    fontFamily: "Georgia, serif",
    color: "#051F20",
    resize: "vertical",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
  },
  newBtn: {
    backgroundColor: "#8EB69B",
    color: "#ffffff",
    border: "none",
    padding: "12px 22px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
  },
  bottomRow: { marginTop: "25px", marginBottom: "40px" },
  dashBtn: {
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

export default SOPHelper;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

// Full list of countries for search suggestions
const ALL_COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahrain",
  "Bangladesh",
  "Belarus",
  "Belgium",
  "Bolivia",
  "Bosnia",
  "Brazil",
  "Bulgaria",
  "Cambodia",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Ecuador",
  "Egypt",
  "Estonia",
  "Ethiopia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "South Korea",
  "Kuwait",
  "Latvia",
  "Lebanon",
  "Libya",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Malta",
  "Mexico",
  "Moldova",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Palestine",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Serbia",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tanzania",
  "Thailand",
  "Tunisia",
  "Turkey",
  "UAE",
  "UK",
  "Ukraine",
  "USA",
  "Uzbekistan",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zimbabwe",
];

function AcademicProfile() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [countrySearch, setCountrySearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    degree: "",
    field: "",
    gpa: "",
    gradingSystem: "4.0",
    ieltsScore: "",
    toeflScore: "",
    englishTest: "IELTS",
    desiredCountries: [],
    desiredField: "",
    budget: "",
    fundingType: "",
    startYear: "",
  });

  // Load saved profile data on mount
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const res = await API.get("/user/profile");
        const d = res.data;
        setFormData((prev) => ({
          ...prev,
          degree: d.degree || "",
          field: d.field || "",
          gpa: d.gpa || "",
          gradingSystem: d.gradingSystem || "4.0",
          ieltsScore: d.ieltsScore || "",
          toeflScore: d.toeflScore || "",
          englishTest: d.englishTest || "IELTS",
          desiredCountries: Array.isArray(d.desiredCountries)
            ? d.desiredCountries
            : [],
          desiredField: d.desiredField || "",
          budget: d.budget || "",
          fundingType: d.fundingType || "",
          startYear: d.startYear || "",
        }));
      } catch (e) {
        // not logged in or no profile yet — start fresh
      } finally {
        setProfileLoading(false);
      }
    };
    loadSaved();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Filter suggestions based on search input
  const suggestions = ALL_COUNTRIES.filter(
    (c) =>
      c.toLowerCase().includes(countrySearch.toLowerCase()) &&
      countrySearch.length > 0 &&
      !formData.desiredCountries.includes(c),
  ).slice(0, 6);

  const addCountry = (country) => {
    if (
      formData.desiredCountries.length < 5 &&
      !formData.desiredCountries.includes(country)
    ) {
      setFormData({
        ...formData,
        desiredCountries: [...formData.desiredCountries, country],
      });
    }
    setCountrySearch("");
    setShowSuggestions(false);
  };

  const removeCountry = (country) => {
    setFormData({
      ...formData,
      desiredCountries: formData.desiredCountries.filter((c) => c !== country),
    });
  };

  const handleCountryKeyDown = (e) => {
    if (e.key === "Enter" && countrySearch.trim()) {
      // If there's an exact or first suggestion match, add it
      const match =
        ALL_COUNTRIES.find(
          (c) => c.toLowerCase() === countrySearch.toLowerCase(),
        ) || suggestions[0];
      if (match) addCountry(match);
      else if (countrySearch.trim() && formData.desiredCountries.length < 5) {
        // Allow custom entry if no match found
        addCountry(countrySearch.trim());
      }
    }
  };

  if (profileLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 36 }}>⏳</div>
        <p style={{ color: "#666", fontSize: 15 }}>
          Loading your saved profile...
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await API.post("/user/academic-profile", formData);
      navigate("/dashboard");
    } catch (err) {
      console.log("Error saving profile:", err);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    "Computer Science",
    "Engineering",
    "Business & MBA",
    "Medicine",
    "Law",
    "Data Science",
    "Architecture",
    "Social Sciences",
  ];

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>ForeignEdge</h1>
        <p style={styles.headerSubtitle}>
          Complete your academic profile to get personalized recommendations
        </p>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }}></div>
        </div>
        <p style={styles.progressText}>
          Step {step} of {totalSteps}
        </p>
      </div>

      {/* Step Indicators */}
      <div style={styles.stepIndicators}>
        {["Academic", "English", "Preferences", "Budget"].map((label, i) => (
          <div key={i} style={styles.stepIndicator}>
            <div
              style={
                step > i
                  ? styles.stepDotDone
                  : step === i + 1
                    ? styles.stepDotActive
                    : styles.stepDot
              }
            >
              {step > i ? "✓" : i + 1}
            </div>
            <p style={styles.stepLabel}>{label}</p>
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div style={styles.card}>
        {/* Step 1 — Academic Background */}
        {step === 1 && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Academic Background</h2>
            <p style={styles.stepSubtitle}>
              Tell us about your current education
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Current/Latest Degree</label>
              <select
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Select degree</option>
                <option value="Matric">Matric (10th)</option>
                <option value="FSc">FSc / FA (12th)</option>
                <option value="Bachelor">Bachelor's Degree</option>
                <option value="Master">Master's Degree</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Field of Study</label>
              <select
                name="field"
                value={formData.field}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Select field</option>
                {fields.map((f, i) => (
                  <option key={i} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.twoCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>GPA / Percentage</label>
                <input
                  type="number"
                  name="gpa"
                  placeholder="e.g. 3.5 or 85"
                  value={formData.gpa}
                  onChange={handleChange}
                  style={styles.input}
                  step="0.1"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Grading System</label>
                <select
                  name="gradingSystem"
                  value={formData.gradingSystem}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="4.0">GPA (4.0 scale)</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="cgpa">CGPA (10 scale)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — English Proficiency */}
        {step === 2 && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>English Proficiency</h2>
            <p style={styles.stepSubtitle}>
              Your English test scores help us find matching universities
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>English Test</label>
              <div style={styles.radioGroup}>
                {["IELTS", "TOEFL", "PTE", "Not taken yet"].map((test) => (
                  <button
                    key={test}
                    onClick={() =>
                      setFormData({ ...formData, englishTest: test })
                    }
                    style={
                      formData.englishTest === test
                        ? styles.radioBtnActive
                        : styles.radioBtn
                    }
                  >
                    {test}
                  </button>
                ))}
              </div>
            </div>

            {formData.englishTest === "IELTS" && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>IELTS Overall Band Score</label>
                <select
                  name="ieltsScore"
                  value={formData.ieltsScore}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">Select score</option>
                  {[
                    "9.0",
                    "8.5",
                    "8.0",
                    "7.5",
                    "7.0",
                    "6.5",
                    "6.0",
                    "5.5",
                    "5.0",
                    "Below 5.0",
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.englishTest === "TOEFL" && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>TOEFL Score (out of 120)</label>
                <input
                  type="number"
                  name="toeflScore"
                  placeholder="e.g. 95"
                  value={formData.toeflScore}
                  onChange={handleChange}
                  style={styles.input}
                  min="0"
                  max="120"
                />
              </div>
            )}

            {formData.englishTest === "Not taken yet" && (
              <div style={styles.infoBox}>
                Note: Many universities accept students who plan to take the
                test. We'll show you options for both.
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Study Preferences */}
        {step === 3 && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Study Preferences</h2>
            <p style={styles.stepSubtitle}>
              Where and what do you want to study?
            </p>

            {/* Country Search */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Preferred Countries for Study
                <span style={styles.labelHint}> (up to 5)</span>
              </label>

              {/* Selected Countries Tags */}
              {formData.desiredCountries.length > 0 && (
                <div style={styles.selectedCountries}>
                  {formData.desiredCountries.map((country, i) => (
                    <div key={i} style={styles.countryTag}>
                      <span style={styles.countryTagText}>🌍 {country}</span>
                      <button
                        onClick={() => removeCountry(country)}
                        style={styles.removeCountryBtn}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Input */}
              {formData.desiredCountries.length < 5 && (
                <div style={styles.searchWrapper}>
                  <div style={styles.searchInputWrapper}>
                    <span style={styles.searchIcon}>🔍</span>
                    <input
                      type="text"
                      placeholder="Type a country name e.g. Germany, Canada..."
                      value={countrySearch}
                      onChange={(e) => {
                        setCountrySearch(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onKeyDown={handleCountryKeyDown}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 150)
                      }
                      style={styles.searchInput}
                    />
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div style={styles.suggestionsDropdown}>
                      {suggestions.map((country, i) => (
                        <div
                          key={i}
                          onMouseDown={() => addCountry(country)}
                          style={styles.suggestionItem}
                        >
                          🌍 {country}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <p style={styles.hint}>
                {formData.desiredCountries.length === 0
                  ? "Start typing to search any country in the world"
                  : `${formData.desiredCountries.length}/5 countries selected · Press Enter or click a suggestion to add`}
              </p>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Desired Field of Study Abroad</label>
              <select
                name="desiredField"
                value={formData.desiredField}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Select field</option>
                {fields.map((f, i) => (
                  <option key={i} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Planned Start Year</label>
              <select
                name="startYear"
                value={formData.startYear}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Select year</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4 — Budget & Funding */}
        {step === 4 && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Budget & Funding</h2>
            <p style={styles.stepSubtitle}>
              Help us find the right scholarships for you
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Annual Budget for Studies (USD)
              </label>
              <div style={styles.radioGroup}>
                {[
                  "Under $5,000",
                  "$5,000 - $15,000",
                  "$15,000 - $30,000",
                  "Over $30,000",
                ].map((b) => (
                  <button
                    key={b}
                    onClick={() => setFormData({ ...formData, budget: b })}
                    style={
                      formData.budget === b
                        ? styles.radioBtnActive
                        : styles.radioBtn
                    }
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Funding Preference</label>
              <div style={styles.radioGroup}>
                {[
                  "Full Scholarship Only",
                  "Partial Scholarship",
                  "Self Funded",
                  "Any Funding",
                ].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormData({ ...formData, fundingType: f })}
                    style={
                      formData.fundingType === f
                        ? styles.radioBtnActive
                        : styles.radioBtn
                    }
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div style={styles.summaryBox}>
              <h4 style={styles.summaryTitle}>Your Profile Summary</h4>
              <p style={styles.summaryItem}>
                Degree: {formData.degree || "Not set"}
              </p>
              <p style={styles.summaryItem}>
                Field: {formData.field || "Not set"}
              </p>
              <p style={styles.summaryItem}>GPA: {formData.gpa || "Not set"}</p>
              <p style={styles.summaryItem}>
                English: {formData.englishTest}{" "}
                {formData.ieltsScore ? `(${formData.ieltsScore})` : ""}
              </p>
              <p style={styles.summaryItem}>
                🌍 Countries:{" "}
                {formData.desiredCountries.join(", ") || "Not set"}
              </p>
              <p style={styles.summaryItem}>
                💰 Budget: {formData.budget || "Not set"}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={styles.navButtons}>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} style={styles.backBtn}>
              ← Back
            </button>
          )}
          {step < totalSteps ? (
            <button onClick={() => setStep(step + 1)} style={styles.nextBtn}>
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "⏳ Saving..." : "🚀 Complete Profile"}
            </button>
          )}
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
    paddingBottom: "60px",
  },
  header: {
    background: "linear-gradient(135deg, #051F20 0%, #051F20 100%)",
    padding: "30px 40px",
    textAlign: "center",
  },
  logo: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#8EB69B",
    margin: "0 0 8px",
  },
  headerSubtitle: { fontSize: "15px", color: "#8EB69B", margin: 0 },
  progressContainer: {
    maxWidth: "700px",
    margin: "25px auto 0",
    padding: "0 40px",
  },
  progressTrack: {
    backgroundColor: "#e0e9f0",
    borderRadius: "10px",
    height: "8px",
    marginBottom: "8px",
  },
  progressFill: {
    backgroundColor: "#8EB69B",
    height: "100%",
    borderRadius: "10px",
    transition: "width 0.4s ease",
  },
  progressText: {
    fontSize: "13px",
    color: "#888",
    textAlign: "right",
    margin: 0,
  },
  stepIndicators: {
    display: "flex",
    justifyContent: "center",
    gap: "40px",
    padding: "20px 40px",
  },
  stepIndicator: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  stepDot: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#e0e9f0",
    color: "#999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
  },
  stepDotActive: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#051F20",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
  },
  stepDotDone: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#8EB69B",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
  },
  stepLabel: { fontSize: "12px", color: "#666", margin: 0 },
  card: { maxWidth: "700px", margin: "0 auto", padding: "0 40px" },
  stepContent: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "40px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  },
  stepTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#051F20",
    marginBottom: "8px",
  },
  stepSubtitle: { fontSize: "15px", color: "#888", marginBottom: "30px" },
  inputGroup: { marginBottom: "20px" },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#051F20",
    display: "block",
    marginBottom: "8px",
  },
  labelHint: { fontSize: "12px", fontWeight: "400", color: "#999" },
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
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" },
  radioGroup: { display: "flex", flexWrap: "wrap", gap: "10px" },
  radioBtn: {
    padding: "10px 18px",
    borderRadius: "25px",
    border: "1.5px solid #e0e9f0",
    backgroundColor: "#f0faf2",
    color: "#555",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  radioBtnActive: {
    padding: "10px 18px",
    borderRadius: "25px",
    border: "1.5px solid #051F20",
    backgroundColor: "#051F20",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  hint: { fontSize: "12px", color: "#888", marginTop: "8px" },
  infoBox: {
    backgroundColor: "#DAF1DE",
    border: "1px solid #DAF1DE",
    padding: "15px",
    borderRadius: "10px",
    fontSize: "14px",
    color: "#051F20",
    lineHeight: "1.6",
  },

  // Country Search Styles
  selectedCountries: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "12px",
  },
  countryTag: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#DAF1DE",
    border: "1.5px solid #8EB69B",
    borderRadius: "25px",
    padding: "6px 12px",
  },
  countryTagText: { fontSize: "13px", fontWeight: "600", color: "#051F20" },
  removeCountryBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "11px",
    color: "#888",
    padding: "0",
    lineHeight: 1,
    fontWeight: "700",
  },
  searchWrapper: { position: "relative" },
  searchInputWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f0faf2",
    border: "1.5px solid #e0e9f0",
    borderRadius: "10px",
    overflow: "hidden",
    transition: "border-color 0.2s",
  },
  searchIcon: { padding: "0 12px", fontSize: "16px" },
  searchInput: {
    flex: 1,
    padding: "12px 10px",
    border: "none",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "transparent",
    color: "#333",
  },
  suggestionsDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    border: "1.5px solid #e0e9f0",
    borderRadius: "10px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    zIndex: 100,
    marginTop: "4px",
    overflow: "hidden",
  },
  suggestionItem: {
    padding: "11px 16px",
    fontSize: "14px",
    color: "#333",
    cursor: "pointer",
    borderBottom: "1px solid #f0f4f8",
    transition: "background 0.15s",
  },

  // Summary
  summaryBox: {
    backgroundColor: "#f0faf2",
    border: "1px solid #e0e9f0",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "10px",
  },
  summaryTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#051F20",
    marginBottom: "12px",
  },
  summaryItem: { fontSize: "14px", color: "#444", margin: "0 0 8px" },

  // Nav Buttons
  navButtons: { display: "flex", justifyContent: "space-between", gap: "15px" },
  backBtn: {
    padding: "14px 30px",
    borderRadius: "10px",
    border: "1.5px solid #051F20",
    backgroundColor: "#ffffff",
    color: "#051F20",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  nextBtn: {
    marginLeft: "auto",
    padding: "14px 35px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#051F20",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },
  submitBtn: {
    marginLeft: "auto",
    padding: "14px 35px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#8EB69B",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default AcademicProfile;

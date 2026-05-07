import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getUserProfile, updateProfile } from "../../services/api";

function UserProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newCertification, setNewCertification] = useState({
    name: "",
    issuer: "",
    year: "",
  });
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    country: "Pakistan",
    bio: "",
    dateOfBirth: "",
    gender: "",
    nationality: "Pakistani",
    degree: "",
    field: "",
    university: "",
    gpa: "",
    graduationYear: "",
    ieltsScore: "",
    toeflScore: "",
    desiredCountries: "",
    budget: "",
    studyLevel: "",
    linkedin: "",
    github: "",
    twitter: "",
    website: "",
    skills: [],
    languages: [],
    certifications: [],
    savedUniversities: [],
    savedScholarships: [],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile();
        setFormData((prev) => ({
          ...prev,
          fullName: res.data.fullName || "",
          email: res.data.email || "",
        }));
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const addLanguage = () => {
    if (
      newLanguage.trim() &&
      !formData.languages.includes(newLanguage.trim())
    ) {
      setFormData({
        ...formData,
        languages: [...formData.languages, newLanguage.trim()],
      });
      setNewLanguage("");
    }
  };

  const removeLanguage = (lang) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((l) => l !== lang),
    });
  };

  const addCertification = () => {
    if (newCertification.name.trim()) {
      setFormData({
        ...formData,
        certifications: [
          ...formData.certifications,
          { ...newCertification, id: Date.now() },
        ],
      });
      setNewCertification({ name: "", issuer: "", year: "" });
    }
  };

  const removeCertification = (id) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((c) => c.id !== id),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
      setSuccessMsg("Profile updated successfully!");
    } catch (err) {
      setError(
        err.message ||
          "Failed to save profile. Please check your connection and try again.",
      );
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const getInitials = () => {
    return formData.fullName
      ? formData.fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "U";
  };

  const completionItems = [
    formData.fullName,
    formData.phone,
    formData.city,
    formData.bio,
    formData.degree,
    formData.field,
    formData.gpa,
    formData.ieltsScore,
    formData.linkedin,
    formData.skills.length > 0,
    formData.languages.length > 0,
  ];
  const completion = Math.round(
    (completionItems.filter(Boolean).length / completionItems.length) * 100,
  );

  const tabs = [
    { id: "personal", label: "Personal" },
    { id: "academic", label: "Academic" },
    { id: "skills", label: "Skills" },
    { id: "achievements", label: "Achievements" },
    { id: "social", label: "Social" },
    { id: "saved", label: "Saved" },
  ];

  if (loading) {
    return (
      <div style={styles.container}>
        <Navbar />
        <div style={styles.loadingWrapper}>
          <p style={styles.loadingText}>⏳ Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar />

      {/* Hero Banner */}
      <div style={styles.hero}>
        <div style={styles.heroBg}></div>
        <div style={styles.heroContent}>
          {/* Photo Upload */}
          <div style={styles.photoWrapper}>
            <div
              style={styles.photoCircle}
              onClick={() => fileInputRef.current.click()}
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" style={styles.photoImg} />
              ) : (
                <span style={styles.photoInitials}>{getInitials()}</span>
              )}
              <div style={styles.photoOverlay}>📷</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
            />
          </div>

          <div style={styles.heroInfo}>
            <h2 style={styles.heroName}>{formData.fullName || "Your Name"}</h2>
            <p style={styles.heroDegree}>
              {formData.degree && formData.field
                ? `${formData.degree} in ${formData.field}`
                : "Add your degree"}
            </p>
            <p style={styles.heroLocation}>
              📍 {formData.city || "City"}, {formData.country}
            </p>
            <div style={styles.heroTags}>
              {formData.skills.slice(0, 3).map((skill, i) => (
                <span key={i} style={styles.heroTag}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Completion Card */}
          <div style={styles.completionCard}>
            <p style={styles.completionLabel}>Profile Completion</p>
            <div style={styles.completionCircle}>
              <span style={styles.completionValue}>{completion}%</span>
            </div>
            <div style={styles.completionBar}>
              <div
                style={{ ...styles.completionFill, width: `${completion}%` }}
              ></div>
            </div>
            <p style={styles.completionHint}>
              {completion < 100
                ? "Complete your profile for better recommendations!"
                : "Profile Complete!"}
            </p>
          </div>
        </div>
      </div>

      <div style={styles.wrapper}>
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: 10,
              padding: "14px 18px",
              margin: "16px 0",
              color: "#dc2626",
              fontSize: 14,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#dc2626",
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Success Message */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 12,
              color: "#dc2626",
              fontSize: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#dc2626",
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>
        )}
        {successMsg && <div style={styles.successMsg}>✅ {successMsg}</div>}

        {/* Tabs */}
        <div style={styles.tabsWrapper}>
          <div style={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={activeTab === tab.id ? styles.tabActive : styles.tab}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Personal Info Tab */}
        {activeTab === "personal" && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Personal Information</h3>
            <p style={styles.cardSubtitle}>Update your personal details</p>

            <div style={styles.twoCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Muhammad Areeb Shahzad"
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  value={formData.email}
                  style={styles.inputDisabled}
                  disabled
                />
              </div>
            </div>

            <div style={styles.twoCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+92 300 1234567"
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Date of Birth</label>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.twoCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nationality</label>
                <select
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="Pakistani">Pakistani</option>
                  <option value="Indian">Indian</option>
                  <option value="Bangladeshi">Bangladeshi</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={styles.twoCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Lahore"
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="Pakistan">🇵🇰 Pakistan</option>
                  <option value="India">🇮🇳 India</option>
                  <option value="Bangladesh">🇧🇩 Bangladesh</option>
                  <option value="Other">🌍 Other</option>
                </select>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself, your goals and aspirations..."
                style={styles.textarea}
                rows={4}
              />
              <p style={styles.charCount}>
                {formData.bio.length}/300 characters
              </p>
            </div>
          </div>
        )}

        {/* Academic Info Tab */}
        {activeTab === "academic" && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Academic Information</h3>
            <p style={styles.cardSubtitle}>
              Your academic background for better recommendations
            </p>

            <div style={styles.twoCol}>
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
                  <option value="Computer Science">Computer Science</option>
                  <option value="Software Engineering">
                    Software Engineering
                  </option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business & MBA</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Law">Law</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Social Sciences">Social Sciences</option>
                </select>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Current University / Institution
              </label>
              <input
                name="university"
                value={formData.university}
                onChange={handleChange}
                placeholder="University of Lahore"
                style={styles.input}
              />
            </div>

            <div style={styles.twoCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>GPA / Percentage</label>
                <input
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  placeholder="e.g. 3.8 or 85%"
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Graduation Year</label>
                <select
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">Select year</option>
                  {[2024, 2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.twoCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>IELTS Score</label>
                <input
                  name="ieltsScore"
                  value={formData.ieltsScore}
                  onChange={handleChange}
                  placeholder="e.g. 7.0"
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>TOEFL Score</label>
                <input
                  name="toeflScore"
                  value={formData.toeflScore}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.twoCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Desired Study Level</label>
                <select
                  name="studyLevel"
                  value={formData.studyLevel}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">Select level</option>
                  <option value="Bachelor">Bachelor's</option>
                  <option value="Master">Master's</option>
                  <option value="PhD">PhD</option>
                  <option value="Postdoc">Postdoc</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Annual Budget</label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">Select budget</option>
                  <option value="Under $5,000">Under $5,000</option>
                  <option value="$5,000 - $15,000">$5,000 - $15,000</option>
                  <option value="$15,000 - $30,000">$15,000 - $30,000</option>
                  <option value="Over $30,000">Over $30,000</option>
                  <option value="Full Scholarship Only">
                    Full Scholarship Only
                  </option>
                </select>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Preferred Countries to Study</label>
              <input
                name="desiredCountries"
                value={formData.desiredCountries}
                onChange={handleChange}
                placeholder="e.g. UK, Germany, Canada, Australia"
                style={styles.input}
              />
            </div>
          </div>
        )}

        {/* Skills & Languages Tab */}
        {activeTab === "skills" && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Skills & Languages</h3>
            <p style={styles.cardSubtitle}>
              Add your technical skills and languages you know
            </p>

            {/* Skills */}
            <div style={styles.sectionBlock}>
              <h4 style={styles.sectionBlockTitle}>🛠️ Technical Skills</h4>
              <div style={styles.addRow}>
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. Python, React, Machine Learning..."
                  style={styles.input}
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                />
                <button onClick={addSkill} style={styles.addBtn}>
                  + Add
                </button>
              </div>
              <div style={styles.tagsList}>
                {formData.skills.length === 0 && (
                  <p style={styles.emptyHint}>
                    No skills added yet. Add your first skill!
                  </p>
                )}
                {formData.skills.map((skill, i) => (
                  <div key={i} style={styles.tag}>
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkill(skill)}
                      style={styles.removeTagBtn}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Skills */}
            <div style={styles.sectionBlock}>
              <h4 style={styles.sectionBlockTitle}>⚡ Suggested Skills</h4>
              <div style={styles.suggestedTags}>
                {[
                  "Python",
                  "React",
                  "JavaScript",
                  "Machine Learning",
                  "Data Analysis",
                  "SQL",
                  "Java",
                  "C++",
                  "Node.js",
                  "Flutter",
                  "Firebase",
                  "Docker",
                ].map(
                  (skill, i) =>
                    !formData.skills.includes(skill) && (
                      <button
                        key={i}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            skills: [...formData.skills, skill],
                          })
                        }
                        style={styles.suggestedTag}
                      >
                        + {skill}
                      </button>
                    ),
                )}
              </div>
            </div>

            {/* Languages */}
            <div style={styles.sectionBlock}>
              <h4 style={styles.sectionBlockTitle}>🌐 Languages</h4>
              <div style={styles.addRow}>
                <input
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="e.g. English, Urdu, German..."
                  style={styles.input}
                  onKeyPress={(e) => e.key === "Enter" && addLanguage()}
                />
                <button onClick={addLanguage} style={styles.addBtn}>
                  + Add
                </button>
              </div>
              <div style={styles.tagsList}>
                {formData.languages.length === 0 && (
                  <p style={styles.emptyHint}>No languages added yet.</p>
                )}
                {formData.languages.map((lang, i) => (
                  <div key={i} style={styles.tagGreen}>
                    <span>{lang}</span>
                    <button
                      onClick={() => removeLanguage(lang)}
                      style={styles.removeTagBtn}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Suggested Languages */}
              <div style={styles.suggestedTags}>
                {[
                  "English",
                  "Urdu",
                  "Arabic",
                  "German",
                  "French",
                  "Chinese",
                  "Spanish",
                ].map(
                  (lang, i) =>
                    !formData.languages.includes(lang) && (
                      <button
                        key={i}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            languages: [...formData.languages, lang],
                          })
                        }
                        style={styles.suggestedTagGreen}
                      >
                        + {lang}
                      </button>
                    ),
                )}
              </div>
            </div>
          </div>
        )}

        {/* Achievements & Certifications Tab */}
        {activeTab === "achievements" && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Achievements & Certifications</h3>
            <p style={styles.cardSubtitle}>
              Add your certifications, awards and achievements
            </p>

            {/* Add Certification */}
            <div style={styles.sectionBlock}>
              <h4 style={styles.sectionBlockTitle}>➕ Add New Certification</h4>
              <div style={styles.certForm}>
                <input
                  value={newCertification.name}
                  onChange={(e) =>
                    setNewCertification({
                      ...newCertification,
                      name: e.target.value,
                    })
                  }
                  placeholder="Certification name e.g. AWS Cloud Practitioner"
                  style={styles.input}
                />
                <div style={styles.twoCol}>
                  <input
                    value={newCertification.issuer}
                    onChange={(e) =>
                      setNewCertification({
                        ...newCertification,
                        issuer: e.target.value,
                      })
                    }
                    placeholder="Issuer e.g. Amazon, Google, Cisco"
                    style={styles.input}
                  />
                  <input
                    value={newCertification.year}
                    onChange={(e) =>
                      setNewCertification({
                        ...newCertification,
                        year: e.target.value,
                      })
                    }
                    placeholder="Year e.g. 2024"
                    style={styles.input}
                  />
                </div>
                <button onClick={addCertification} style={styles.addCertBtn}>
                  🏆 Add Certification
                </button>
              </div>
            </div>

            {/* Certifications List */}
            <div style={styles.sectionBlock}>
              <h4 style={styles.sectionBlockTitle}>📜 Your Certifications</h4>
              {formData.certifications.length === 0 && (
                <div style={styles.emptyBox}>
                  <p style={styles.emptyText}>
                    No certifications added yet. Add your first one!
                  </p>
                </div>
              )}
              <div style={styles.certsList}>
                {formData.certifications.map((cert, i) => (
                  <div key={cert.id} style={styles.certCard}>
                    <div style={styles.certIcon}>🏆</div>
                    <div style={styles.certInfo}>
                      <h4 style={styles.certName}>{cert.name}</h4>
                      <p style={styles.certIssuer}>
                        {cert.issuer} · {cert.year}
                      </p>
                    </div>
                    <button
                      onClick={() => removeCertification(cert.id)}
                      style={styles.removeCertBtn}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Social Links Tab */}
        {activeTab === "social" && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Social & Professional Links</h3>
            <p style={styles.cardSubtitle}>
              Connect your professional profiles
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>LinkedIn Profile</label>
              <div style={styles.inputWithIcon}>
                <span style={styles.inputPrefix}>🔗</span>
                <input
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  style={styles.inputWithPrefixField}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>GitHub Profile</label>
              <div style={styles.inputWithIcon}>
                <span style={styles.inputPrefix}>💻</span>
                <input
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                  style={styles.inputWithPrefixField}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Twitter / X Profile</label>
              <div style={styles.inputWithIcon}>
                <span style={styles.inputPrefix}>🐦</span>
                <input
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/yourusername"
                  style={styles.inputWithPrefixField}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Personal Website / Portfolio</label>
              <div style={styles.inputWithIcon}>
                <span style={styles.inputPrefix}>🌐</span>
                <input
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                  style={styles.inputWithPrefixField}
                />
              </div>
            </div>

            {/* Profile Preview */}
            <div style={styles.profilePreview}>
              <h4 style={styles.previewTitle}>👁️ Profile Preview</h4>
              <div style={styles.previewCard}>
                <div style={styles.previewAvatar}>
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      style={styles.previewPhoto}
                    />
                  ) : (
                    getInitials()
                  )}
                </div>
                <div style={styles.previewInfo}>
                  <p style={styles.previewName}>
                    {formData.fullName || "Your Name"}
                  </p>
                  <p style={styles.previewDegree}>
                    {formData.degree && formData.field
                      ? `${formData.degree} in ${formData.field}`
                      : "Add your degree"}
                  </p>
                  <p style={styles.previewLocation}>
                    📍 {formData.city || "City"}, {formData.country}
                  </p>
                  <div style={styles.previewSkills}>
                    {formData.skills.slice(0, 4).map((skill, i) => (
                      <span key={i} style={styles.previewSkillTag}>
                        {skill}
                      </span>
                    ))}
                  </div>
                  {formData.bio && (
                    <p style={styles.previewBio}>
                      {formData.bio.slice(0, 100)}...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saved Items Tab */}
        {activeTab === "saved" && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Saved Items</h3>
            <p style={styles.cardSubtitle}>
              Universities and scholarships you have saved
            </p>

            <div style={styles.savedSection}>
              <h4 style={styles.sectionBlockTitle}>🎓 Saved Universities</h4>
              <div style={styles.emptyBox}>
                <p style={styles.emptyText}>No universities saved yet.</p>
                <button
                  onClick={() => navigate("/universities")}
                  style={styles.goBtn}
                >
                  Browse Universities →
                </button>
              </div>
            </div>

            <div style={styles.savedSection}>
              <h4 style={styles.sectionBlockTitle}>💰 Saved Scholarships</h4>
              <div style={styles.emptyBox}>
                <p style={styles.emptyText}>No scholarships saved yet.</p>
                <button
                  onClick={() => navigate("/scholarships")}
                  style={styles.goBtn}
                >
                  Browse Scholarships →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div style={styles.saveRow}>
          <button
            onClick={() => navigate("/dashboard")}
            style={styles.cancelBtn}
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={handleSave}
            style={saving ? styles.saveBtnLoading : styles.saveBtn}
            disabled={saving}
          >
            {saving ? "⏳ Saving..." : "💾 Save Profile"}
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
  loadingWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "80vh",
  },
  loadingText: { fontSize: "18px", color: "#051F20" },
  hero: {
    background: "linear-gradient(135deg, #051F20 0%, #051F20 100%)",
    padding: "40px",
    position: "relative",
  },
  heroBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  heroContent: {
    display: "flex",
    alignItems: "center",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
    flexWrap: "wrap",
  },
  photoWrapper: { position: "relative", flexShrink: 0 },
  photoCircle: {
    width: "100px",
    height: "100px",
    backgroundColor: "#8EB69B",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "800",
    color: "#ffffff",
    cursor: "pointer",
    overflow: "hidden",
    border: "4px solid rgba(255,255,255,0.3)",
    position: "relative",
  },
  photoImg: { width: "100%", height: "100%", objectFit: "cover" },
  photoInitials: { fontSize: "32px", fontWeight: "800" },
  photoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    textAlign: "center",
    padding: "4px",
    fontSize: "16px",
  },
  heroInfo: { flex: 1 },
  heroName: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 0 6px",
  },
  heroDegree: {
    fontSize: "15px",
    color: "#8EB69B",
    margin: "0 0 6px",
    fontWeight: "600",
  },
  heroLocation: { fontSize: "14px", color: "#8EB69B", margin: "0 0 12px" },
  heroTags: { display: "flex", gap: "8px", flexWrap: "wrap" },
  heroTag: {
    backgroundColor: "rgba(74,158,218,0.3)",
    color: "#ffffff",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  completionCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "20px",
    minWidth: "180px",
    textAlign: "center",
  },
  completionLabel: {
    fontSize: "12px",
    color: "#8EB69B",
    margin: "0 0 10px",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  completionCircle: {
    width: "70px",
    height: "70px",
    backgroundColor: "#8EB69B",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 10px",
  },
  completionValue: { fontSize: "20px", fontWeight: "800", color: "#ffffff" },
  completionBar: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: "10px",
    height: "6px",
    marginBottom: "8px",
  },
  completionFill: {
    backgroundColor: "#8EB69B",
    height: "100%",
    borderRadius: "10px",
    transition: "width 0.5s ease",
  },
  completionHint: { fontSize: "11px", color: "#8EB69B", margin: 0 },
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
  tabsWrapper: { overflowX: "auto", marginBottom: "20px" },
  tabs: {
    display: "flex",
    gap: "5px",
    backgroundColor: "#ffffff",
    padding: "5px",
    borderRadius: "12px",
    width: "fit-content",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    minWidth: "max-content",
  },
  tab: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "transparent",
    color: "#666",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },
  tabActive: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#051F20",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "35px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#051F20",
    marginBottom: "8px",
  },
  cardSubtitle: { fontSize: "14px", color: "#888", marginBottom: "25px" },
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
  inputDisabled: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "10px",
    border: "1.5px solid #e0e9f0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#f0faf2",
    color: "#999",
    cursor: "not-allowed",
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
  charCount: {
    fontSize: "12px",
    color: "#aaa",
    textAlign: "right",
    margin: "5px 0 0",
  },
  sectionBlock: {
    marginBottom: "25px",
    paddingBottom: "25px",
    borderBottom: "1px solid #f0f4f8",
  },
  sectionBlockTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#051F20",
    marginBottom: "15px",
  },
  addRow: { display: "flex", gap: "12px", marginBottom: "15px" },
  addBtn: {
    backgroundColor: "#051F20",
    color: "#ffffff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  tagsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    minHeight: "40px",
  },
  tag: {
    backgroundColor: "#DAF1DE",
    color: "#163832",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tagGreen: {
    backgroundColor: "#e6f4ea",
    color: "#163832",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  removeTagBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    color: "#888",
    padding: 0,
  },
  suggestedTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
  },
  suggestedTag: {
    backgroundColor: "#f0faf2",
    color: "#051F20",
    border: "1.5px solid #e0e9f0",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "500",
  },
  suggestedTagGreen: {
    backgroundColor: "#f0faf2",
    color: "#163832",
    border: "1.5px solid #b7dfb8",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "500",
  },
  emptyHint: { fontSize: "14px", color: "#aaa", fontStyle: "italic" },
  certForm: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    backgroundColor: "#f0faf2",
    padding: "20px",
    borderRadius: "12px",
  },
  addCertBtn: {
    backgroundColor: "#051F20",
    color: "#ffffff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  certsList: { display: "flex", flexDirection: "column", gap: "12px" },
  certCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    backgroundColor: "#f0faf2",
    padding: "15px 20px",
    borderRadius: "12px",
    border: "1px solid #e0e9f0",
  },
  certIcon: { fontSize: "28px", flexShrink: 0 },
  certInfo: { flex: 1 },
  certName: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#051F20",
    margin: "0 0 4px",
  },
  certIssuer: { fontSize: "13px", color: "#666", margin: 0 },
  removeCertBtn: {
    background: "#fff0f0",
    border: "1px solid #ffb3b3",
    color: "#cc0000",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "13px",
    flexShrink: 0,
  },
  inputWithIcon: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f0faf2",
    border: "1.5px solid #e0e9f0",
    borderRadius: "10px",
    overflow: "hidden",
  },
  inputPrefix: { padding: "0 12px", fontSize: "16px" },
  inputWithPrefixField: {
    flex: 1,
    padding: "12px 10px",
    border: "none",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "transparent",
  },
  profilePreview: {
    marginTop: "25px",
    backgroundColor: "#f0faf2",
    borderRadius: "12px",
    padding: "20px",
  },
  previewTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#051F20",
    marginBottom: "15px",
  },
  previewCard: { display: "flex", alignItems: "center", gap: "20px" },
  previewAvatar: {
    width: "60px",
    height: "60px",
    backgroundColor: "#051F20",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
    color: "#ffffff",
    flexShrink: 0,
    overflow: "hidden",
  },
  previewPhoto: { width: "100%", height: "100%", objectFit: "cover" },
  previewInfo: { flex: 1 },
  previewName: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#051F20",
    margin: "0 0 4px",
  },
  previewDegree: {
    fontSize: "14px",
    color: "#8EB69B",
    margin: "0 0 4px",
    fontWeight: "600",
  },
  previewLocation: { fontSize: "13px", color: "#888", margin: "0 0 8px" },
  previewSkills: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginBottom: "8px",
  },
  previewSkillTag: {
    backgroundColor: "#DAF1DE",
    color: "#163832",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
  },
  previewBio: {
    fontSize: "13px",
    color: "#555",
    margin: 0,
    lineHeight: "1.5",
    fontStyle: "italic",
  },
  savedSection: { marginBottom: "25px" },
  emptyBox: {
    backgroundColor: "#f0faf2",
    borderRadius: "12px",
    padding: "30px",
    textAlign: "center",
  },
  emptyText: { fontSize: "15px", color: "#888", marginBottom: "15px" },
  goBtn: {
    backgroundColor: "#051F20",
    color: "#ffffff",
    border: "none",
    padding: "12px 25px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  saveRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "40px",
  },
  cancelBtn: {
    backgroundColor: "#ffffff",
    color: "#051F20",
    border: "1.5px solid #e0e9f0",
    padding: "14px 25px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#051F20",
    color: "#ffffff",
    border: "none",
    padding: "14px 35px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
  },
  saveBtnLoading: {
    backgroundColor: "#888",
    color: "#ffffff",
    border: "none",
    padding: "14px 35px",
    borderRadius: "10px",
    cursor: "not-allowed",
    fontSize: "15px",
    fontWeight: "700",
  },
};

export default UserProfile;

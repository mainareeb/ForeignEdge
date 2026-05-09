/**
 * Recommendations.js — ForeignEdge
 * ==================================
 * AI-powered personalized recommendations via GET /recommendations
 * Backend returns: { scholarships: [...], universities: [...], profile_used: {...} }
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

const CSS = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
.rec-card {
  animation: fadeInUp 0.35s ease both;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.rec-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.10) !important;
}
.skel {
  background: linear-gradient(90deg, #f0faf2 25%, #e8f5ec 50%, #f0faf2 75%);
  background-size: 400px 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 10px;
}
.match-bar-fill {
  transition: width 1s ease;
}
.ai-badge {
  animation: pulse 2.5s ease-in-out infinite;
}
`;

function SkeletonCard() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "20px 22px",
        marginBottom: 12,
        border: "1px solid #e8f0e8",
      }}
    >
      <div
        className="skel"
        style={{ height: 18, width: "60%", marginBottom: 10 }}
      />
      <div
        className="skel"
        style={{ height: 13, width: "40%", marginBottom: 8 }}
      />
      <div className="skel" style={{ height: 8, width: "100%" }} />
    </div>
  );
}

function MatchBar({ value }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value || 0), 300);
    return () => clearTimeout(t);
  }, [value]);
  const color = value >= 85 ? "#16a34a" : value >= 70 ? "#d97706" : "#6366f1";
  return (
    <div style={{ marginTop: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
          fontSize: 12,
          color: "#666",
        }}
      >
        <span>Match score</span>
        <span style={{ fontWeight: 700, color }}>{value || 0}%</span>
      </div>
      <div
        style={{
          background: "#f0f0f0",
          borderRadius: 20,
          height: 6,
          overflow: "hidden",
        }}
      >
        <div
          className="match-bar-fill"
          style={{
            width: `${width}%`,
            height: "100%",
            background: color,
            borderRadius: 20,
          }}
        />
      </div>
    </div>
  );
}

function ScholarshipCard({ item, index }) {
  return (
    <div
      className="rec-card"
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "18px 22px",
        border: "1px solid #e0f2e9",
        borderLeft: "4px solid #059669",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        animationDelay: `${index * 0.07}s`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 18 }}>💰</span>
            <p
              style={{
                fontWeight: 700,
                color: "#051F20",
                margin: 0,
                fontSize: 15,
              }}
            >
              {item.name}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 12,
                background: "#e0f2e9",
                color: "#059669",
                padding: "2px 10px",
                borderRadius: 20,
                fontWeight: 600,
              }}
            >
              {item.country}
            </span>
            {item.type && (
              <span
                style={{
                  fontSize: 12,
                  background: "#fef3c7",
                  color: "#d97706",
                  padding: "2px 10px",
                  borderRadius: 20,
                  fontWeight: 600,
                }}
              >
                {item.type} Funding
              </span>
            )}
            {item.deadline && (
              <span
                style={{
                  fontSize: 12,
                  background: "#f0f0f0",
                  color: "#555",
                  padding: "2px 10px",
                  borderRadius: 20,
                }}
              >
                📅 {item.deadline}
              </span>
            )}
          </div>
          {item.reason && (
            <p
              style={{
                color: "#555",
                fontSize: 13,
                margin: "6px 0 0",
                lineHeight: 1.5,
              }}
            >
              {item.reason}
            </p>
          )}
        </div>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "8px 16px",
              background: "#059669",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Apply →
          </a>
        )}
      </div>
      <MatchBar value={item.match} />
    </div>
  );
}

function UniversityCard({ item, index }) {
  return (
    <div
      className="rec-card"
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "18px 22px",
        border: "1px solid #e0e9f8",
        borderLeft: "4px solid #3b82f6",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        animationDelay: `${index * 0.07}s`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 18 }}>🎓</span>
            <p
              style={{
                fontWeight: 700,
                color: "#051F20",
                margin: 0,
                fontSize: 15,
              }}
            >
              {item.name}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 12,
                background: "#eff6ff",
                color: "#3b82f6",
                padding: "2px 10px",
                borderRadius: 20,
                fontWeight: 600,
              }}
            >
              {item.country}
            </span>
            {item.deadline && (
              <span
                style={{
                  fontSize: 12,
                  background: "#f0f0f0",
                  color: "#555",
                  padding: "2px 10px",
                  borderRadius: 20,
                }}
              >
                📅 {item.deadline}
              </span>
            )}
          </div>
          {item.reason && (
            <p
              style={{
                color: "#555",
                fontSize: 13,
                margin: "6px 0 0",
                lineHeight: 1.5,
              }}
            >
              {item.reason}
            </p>
          )}
        </div>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "8px 16px",
              background: "#3b82f6",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Visit →
          </a>
        )}
      </div>
      <MatchBar value={item.match} />
    </div>
  );
}

export default function Recommendations() {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const fetchRecs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/recommendations");
      const d = res.data;

      // Support both response shapes:
      // {scholarships:[...], universities:[...]} OR {recommendations:[...]}
      if (d.scholarships !== undefined) {
        setScholarships(d.scholarships || []);
        setUniversities(d.universities || []);
      } else if (Array.isArray(d.recommendations)) {
        setScholarships(
          d.recommendations.filter(
            (r) => String(r.type || "").toLowerCase() === "scholarship",
          ),
        );
        setUniversities(
          d.recommendations.filter(
            (r) => String(r.type || "").toLowerCase() === "university",
          ),
        );
      }

      setProfile(d.profile_used || d.profile || null);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Could not load recommendations.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  const totalResults = scholarships.length + universities.length;

  const displayedScholarships =
    activeTab === "universities" ? [] : scholarships;
  const displayedUniversities =
    activeTab === "scholarships" ? [] : universities;

  return (
    <>
      <style>{CSS}</style>
      <Navbar />
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f7fa",
          padding: "28px 20px",
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#e0faf0",
                border: "1px solid #a7f3d0",
                borderRadius: 20,
                padding: "5px 16px",
                marginBottom: 14,
                fontSize: 13,
                color: "#059669",
                fontWeight: 600,
              }}
            >
              <span className="ai-badge">✨</span>
              AI-Powered · Real-time Analysis
            </div>
            <h1
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: "#051F20",
                margin: "0 0 8px",
              }}
            >
              Your Personalized Recommendations
            </h1>
            <p style={{ color: "#666", fontSize: 15, margin: 0 }}>
              Based on your academic profile — updated instantly by AI
            </p>
          </div>

          {/* Profile Summary */}
          {profile && !loading && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e0ede4",
                borderRadius: 12,
                padding: "14px 20px",
                marginBottom: 20,
                display: "flex",
                gap: 20,
                flexWrap: "wrap",
                fontSize: 13,
              }}
            >
              <span>
                🎓 <strong>Degree:</strong> {profile.degree || "—"}
              </span>
              <span>
                📚 <strong>Field:</strong> {profile.field || "—"}
              </span>
              <span>
                📊 <strong>GPA:</strong> {profile.gpa || "—"}
              </span>
              {profile.ielts && (
                <span>
                  🗣️ <strong>IELTS:</strong> {profile.ielts}
                </span>
              )}
              {Array.isArray(profile.countries) &&
                profile.countries.length > 0 && (
                  <span>
                    🌍 <strong>Countries:</strong>{" "}
                    {profile.countries.join(", ")}
                  </span>
                )}
              <button
                onClick={fetchRecs}
                style={{
                  marginLeft: "auto",
                  background: "#051F20",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "5px 14px",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ↻ Refresh
              </button>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div>
              <div
                style={{
                  textAlign: "center",
                  padding: "30px 0 20px",
                  color: "#059669",
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>🤖</div>
                Analyzing your profile with AI...
              </div>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                borderRadius: 14,
                padding: 32,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
              <p
                style={{
                  color: "#dc2626",
                  fontWeight: 600,
                  fontSize: 15,
                  marginBottom: 16,
                }}
              >
                {error}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={fetchRecs}
                  style={{
                    padding: "10px 24px",
                    background: "#051F20",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/academic-profile")}
                  style={{
                    padding: "10px 24px",
                    background: "#fff",
                    color: "#051F20",
                    border: "2px solid #051F20",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Complete Your Profile
                </button>
              </div>
              <p style={{ color: "#888", fontSize: 13, marginTop: 14 }}>
                Fill in your academic profile to get AI-powered recommendations.
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && !error && totalResults > 0 && (
            <>
              {/* Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 20,
                  flexWrap: "wrap",
                }}
              >
                {[
                  { key: "all", label: `All (${totalResults})` },
                  {
                    key: "scholarships",
                    label: `💰 Scholarships (${scholarships.length})`,
                  },
                  {
                    key: "universities",
                    label: `🎓 Universities (${universities.length})`,
                  },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    style={{
                      padding: "8px 18px",
                      background: activeTab === t.key ? "#051F20" : "#fff",
                      color: activeTab === t.key ? "#fff" : "#444",
                      border: `1.5px solid ${activeTab === t.key ? "#051F20" : "#ddd"}`,
                      borderRadius: 20,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      transition: "all 0.2s",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Scholarships Section */}
              {displayedScholarships.length > 0 && (
                <div style={{ marginBottom: 30 }}>
                  {activeTab === "all" && (
                    <h2
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#051F20",
                        marginBottom: 14,
                      }}
                    >
                      💰 Recommended Scholarships
                    </h2>
                  )}
                  {displayedScholarships.map((sch, i) => (
                    <ScholarshipCard key={i} item={sch} index={i} />
                  ))}
                </div>
              )}

              {/* Universities Section */}
              {displayedUniversities.length > 0 && (
                <div>
                  {activeTab === "all" && (
                    <h2
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#051F20",
                        marginBottom: 14,
                      }}
                    >
                      🎓 Recommended Universities
                    </h2>
                  )}
                  {displayedUniversities.map((uni, i) => (
                    <UniversityCard key={i} item={uni} index={i} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && !error && totalResults === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "50px 24px",
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #e8f0e8",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 14 }}>📋</div>
              <h3 style={{ color: "#051F20", marginBottom: 10 }}>
                No recommendations yet
              </h3>
              <p style={{ color: "#666", marginBottom: 20 }}>
                Complete your academic profile to get personalized AI
                recommendations.
              </p>
              <button
                onClick={() => navigate("/academic-profile")}
                style={{
                  padding: "12px 28px",
                  background: "#051F20",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                Complete Profile →
              </button>
            </div>
          )}

          {/* Footer note */}
          {!loading && totalResults > 0 && (
            <p
              style={{
                textAlign: "center",
                color: "#aaa",
                fontSize: 12,
                marginTop: 24,
              }}
            >
              Recommendations are AI-generated based on your academic profile.
              Verify details at official websites before applying.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

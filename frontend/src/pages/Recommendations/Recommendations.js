/**
 * Recommendations.js — ForeignEdge
 * ==================================
 * ML-powered personalized recommendations based on user academic profile.
 * Calls GET /recommendations (backend ML engine).
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import API from "../../services/api";

export default function Recommendations() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get("/recommendations")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.data?.error || "Could not load recommendations.",
        );
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f7fa",
          padding: "32px 24px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🤖</div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#1a2e4a",
                margin: 0,
              }}
            >
              Personalized Recommendations
            </h1>
            <p style={{ color: "#666", marginTop: 8, fontSize: 15 }}>
              Based on your academic profile — ML-powered suggestions
            </p>
          </div>

          {/* Profile used */}
          {data?.profile_used && (
            <div
              style={{
                background: "#e8f4fd",
                border: "1px solid #b8d8f0",
                borderRadius: 12,
                padding: "14px 20px",
                marginBottom: 28,
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                fontSize: 13,
                color: "#1a2e4a",
              }}
            >
              <span>
                📚 <strong>Field:</strong> {data.profile_used.field || "—"}
              </span>
              <span>
                🎓 <strong>Degree:</strong> {data.profile_used.degree || "—"}
              </span>
              <span>
                📊 <strong>GPA:</strong> {data.profile_used.gpa || "—"}
              </span>
              <span>
                🗣️ <strong>IELTS:</strong> {data.profile_used.ielts || "—"}
              </span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⚙️</div>
              <p style={{ color: "#666", fontSize: 15 }}>
                Analyzing your profile...
              </p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                borderRadius: 12,
                padding: 28,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
              <p
                style={{ color: "#dc2626", fontWeight: 600, marginBottom: 16 }}
              >
                {error}
              </p>
              {error.includes("profile") && (
                <button
                  onClick={() => navigate("/academic-profile")}
                  style={{
                    padding: "10px 24px",
                    background: "#1a2e4a",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Complete Profile →
                </button>
              )}
            </div>
          )}

          {/* Results */}
          {data && !loading && (
            <>
              {/* Scholarships */}
              <div style={{ marginBottom: 36 }}>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#1a2e4a",
                    marginBottom: 16,
                  }}
                >
                  💰 Recommended Scholarships
                </h2>
                {data.scholarships?.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {data.scholarships.map((sch, i) => (
                      <div
                        key={i}
                        style={{
                          background: "#fff",
                          borderRadius: 12,
                          padding: "16px 20px",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                          borderLeft: "4px solid #2a6496",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 10,
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontWeight: 700,
                              color: "#1a2e4a",
                              margin: "0 0 4px",
                              fontSize: 15,
                            }}
                          >
                            {sch.name}
                          </p>
                          <p style={{ color: "#666", margin: 0, fontSize: 13 }}>
                            {sch.country} • {sch.type} •{" "}
                            {sch.amount || "Amount varies"}
                          </p>
                        </div>
                        <span
                          style={{
                            background: "#e8f4fd",
                            color: "#2a6496",
                            padding: "4px 12px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          Match #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#888" }}>
                    No scholarship matches found for your profile.
                  </p>
                )}
              </div>

              {/* Universities */}
              <div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#1a2e4a",
                    marginBottom: 16,
                  }}
                >
                  🎓 Recommended Universities
                </h2>
                {data.universities?.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {data.universities.map((uni, i) => (
                      <div
                        key={i}
                        style={{
                          background: "#fff",
                          borderRadius: 12,
                          padding: "16px 20px",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                          borderLeft: "4px solid #27ae60",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 10,
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontWeight: 700,
                              color: "#1a2e4a",
                              margin: "0 0 4px",
                              fontSize: 15,
                            }}
                          >
                            {uni.name}
                          </p>
                          <p style={{ color: "#666", margin: 0, fontSize: 13 }}>
                            {uni.country} •{" "}
                            {uni.website ? (
                              <a
                                href={uni.website}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#2a6496" }}
                              >
                                Visit Website
                              </a>
                            ) : (
                              "No website"
                            )}
                          </p>
                        </div>
                        <span
                          style={{
                            background: "#e8f8f0",
                            color: "#27ae60",
                            padding: "4px 12px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          Match #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#888" }}>
                    No university matches found for your profile.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

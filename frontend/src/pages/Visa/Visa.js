/**
 * Visa.js
 * =======
 * Fetches real visa data from GET /visa?country=XX (backend).
 * Reads ?country= URL param for cross-page navigation.
 * Falls back gracefully if backend is unavailable.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getVisaInfo } from "../../services/api";

const COUNTRIES = [
  "UK",
  "USA",
  "Canada",
  "Australia",
  "Germany",
  "Netherlands",
  "Sweden",
  "Japan",
];
const FLAGS = {
  UK: "🇬🇧",
  USA: "🇺🇸",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  Germany: "🇩🇪",
  Netherlands: "🇳🇱",
  Sweden: "🇸🇪",
  Japan: "🇯🇵",
};

const CSS = `
@keyframes fadeInUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
@keyframes shimmer  { 0%{background-position:-400px 0}100%{background-position:400px 0} }
.vis-card { animation:fadeInUp 0.4s ease both; }
.skel { background:linear-gradient(90deg,#e8eef4 25%,#f4f7fa 50%,#e8eef4 75%); background-size:400px 100%; animation:shimmer 1.4s infinite; border-radius:8px; }
.ctry-btn { transition:all 0.2s; cursor:pointer; }
.ctry-btn:hover { transform:translateY(-2px); }
`;

export default function Visa() {
  const [searchParams] = useSearchParams();
  const urlCountry = searchParams.get("country");

  const [selected, setSelected] = useState(
    COUNTRIES.includes(urlCountry) ? urlCountry : "UK",
  );
  const [visa, setVisa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync URL param changes
  useEffect(() => {
    if (urlCountry && COUNTRIES.includes(urlCountry)) setSelected(urlCountry);
  }, [urlCountry]);

  const fetchVisa = useCallback(async () => {
    setLoading(true);
    setError(null);
    setVisa(null);
    try {
      const res = await getVisaInfo(selected);
      setVisa(res.data);
    } catch (err) {
      setError(err.message || "Failed to load visa information.");
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => {
    fetchVisa();
  }, [fetchVisa]);

  const color = visa?.color || "#2a6496";

  return (
    <>
      <style>{CSS}</style>
      <Navbar />

      <div
        style={{
          background: "linear-gradient(135deg,#1a2e4a,#2a6496)",
          padding: "50px 20px",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0 }}>
          📋 Visa Guide
        </h1>
        <p
          style={{
            opacity: 0.85,
            marginTop: 10,
            fontSize: 15,
            maxWidth: 520,
            margin: "10px auto 0",
          }}
        >
          Visa requirements sourced from official government portals. Always
          verify at the official link before applying.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
        {/* Country selector */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 28,
          }}
        >
          {COUNTRIES.map((c) => (
            <button
              key={c}
              className="ctry-btn"
              onClick={() => setSelected(c)}
              style={{
                padding: "10px 20px",
                borderRadius: 24,
                border:
                  selected === c ? `2px solid #2a6496` : "1.5px solid #d0dde8",
                background: selected === c ? "#2a6496" : "#fff",
                color: selected === c ? "#fff" : "#444",
                fontWeight: selected === c ? 700 : 400,
                fontSize: 14,
              }}
            >
              {FLAGS[c]} {c}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && !loading && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: 12,
              padding: 24,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            <p
              style={{ color: "#dc2626", fontWeight: 600, margin: "0 0 10px" }}
            >
              {error}
            </p>
            <p style={{ color: "#555", fontSize: 14 }}>
              Make sure the backend is running on port 5000.
            </p>
            <button
              onClick={fetchVisa}
              style={{
                marginTop: 10,
                padding: "8px 20px",
                background: "#2a6496",
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

        {/* Skeleton */}
        {loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: 20,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
                }}
              >
                <div
                  className="skel"
                  style={{
                    height: 32,
                    width: 32,
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                />
                <div
                  className="skel"
                  style={{ height: 12, width: "60%", marginBottom: 8 }}
                />
                <div className="skel" style={{ height: 18, width: "70%" }} />
              </div>
            ))}
          </div>
        )}

        {/* Visa data */}
        {!loading && !error && visa && (
          <>
            {/* Source badge */}
            <div
              style={{
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 22,
                fontSize: 13,
                color: "#0369a1",
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span>
                📡 <strong>Source:</strong> {visa.source}
              </span>
              {visa.is_live && (
                <span
                  style={{
                    background: "#22c55e",
                    color: "#fff",
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 10,
                    fontWeight: 700,
                  }}
                >
                  🟢 LIVE
                </span>
              )}
              {visa.official_link && (
                <a
                  href={visa.official_link}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#0369a1", marginLeft: "auto" }}
                >
                  Official site →
                </a>
              )}
            </div>

            {/* Overview cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))",
                gap: 14,
                marginBottom: 26,
              }}
            >
              {[
                { label: "Visa Type", value: visa.visa_type, icon: "📄" },
                {
                  label: "Processing Time",
                  value: visa.processing_time,
                  icon: "⏱️",
                },
                { label: "Fee", value: visa.fee, icon: "💰" },
                {
                  label: "Health Cover",
                  value: visa.health_surcharge,
                  icon: "🏥",
                },
                { label: "Difficulty", value: visa.difficulty, icon: "📊" },
                { label: "Success Rate", value: visa.success_rate, icon: "✅" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="vis-card"
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "16px 18px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
                    borderTop: `3px solid #2a6496`,
                    animationDelay: `${i * 0.06}s`,
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 6 }}>
                    {item.icon}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#888",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.4px",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#1a2e4a",
                      marginTop: 4,
                    }}
                  >
                    {item.value || "N/A"}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 22,
                marginBottom: 22,
              }}
            >
              {/* Requirements */}
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
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#1a2e4a",
                    margin: "0 0 14px",
                  }}
                >
                  📋 Requirements
                </h2>
                <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
                  {(visa.requirements || []).map((r, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: 14,
                        color: "#444",
                        marginBottom: 8,
                        lineHeight: 1.5,
                      }}
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              <div
                style={{
                  background: "#f0f9ff",
                  borderRadius: 14,
                  padding: 22,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                }}
              >
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#1a2e4a",
                    margin: "0 0 14px",
                  }}
                >
                  💡 Tips for Pakistani Applicants
                </h2>
                <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
                  {(visa.tips || []).map((t, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: 14,
                        color: "#374151",
                        marginBottom: 10,
                        lineHeight: 1.6,
                      }}
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Steps */}
            {visa.steps && visa.steps.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: 22,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  marginBottom: 22,
                }}
              >
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#1a2e4a",
                    margin: "0 0 18px",
                  }}
                >
                  🗺️ Application Steps
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
                    gap: 12,
                  }}
                >
                  {visa.steps.map((step, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                        background: "#f8fafc",
                        borderRadius: 10,
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: "#2a6496",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        {step.num || step.step || i + 1}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: "#1a2e4a",
                          }}
                        >
                          {step.title}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#666",
                            marginTop: 3,
                            lineHeight: 1.5,
                          }}
                        >
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div
              style={{
                background: "#e8f4fd",
                border: "1.5px solid #90caef",
                borderRadius: 12,
                padding: 20,
                display: "flex",
                gap: 14,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1 }}>
                <strong style={{ color: "#1a2e4a" }}>
                  ⚠️ Always verify at the official source
                </strong>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#555" }}>
                  Visa rules, fees and requirements change. Verify current
                  information before applying.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {visa.official_link && (
                  <a
                    href={visa.official_link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "10px 18px",
                      background: "#2a6496",
                      color: "#fff",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Official Info →
                  </a>
                )}
                {visa.apply_link && (
                  <a
                    href={visa.apply_link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "10px 18px",
                      background: "#fff",
                      color: "#2a6496",
                      border: "2px solid #2a6496",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Apply Now →
                  </a>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

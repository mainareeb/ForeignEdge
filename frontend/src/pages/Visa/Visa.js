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
  "France",
  "Japan",
  "South Korea",
  "China",
  "Turkey",
  "Malaysia",
  "Singapore",
  "New Zealand",
  "Switzerland",
  "Finland",
  "Norway",
  "Ireland",
  "Italy",
  "Denmark",
  "Austria",
  "Belgium",
  "Portugal",
  "Spain",
  "Czech Republic",
  "Poland",
  "Hungary",
  "Greece",
  "Romania",
  "Slovakia",
  "Croatia",
  "Slovenia",
  "Estonia",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Cyprus",
  "Iceland",
  "Liechtenstein",
];

const FLAGS = {
  UK: "🇬🇧",
  USA: "🇺🇸",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  Germany: "🇩🇪",
  Netherlands: "🇳🇱",
  Sweden: "🇸🇪",
  France: "🇫🇷",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  China: "🇨🇳",
  Turkey: "🇹🇷",
  Malaysia: "🇲🇾",
  Singapore: "🇸🇬",
  "New Zealand": "🇳🇿",
  Switzerland: "🇨🇭",
  Finland: "🇫🇮",
  Norway: "🇳🇴",
  Ireland: "🇮🇪",
  Italy: "🇮🇹",
  Denmark: "🇩🇰",
  Austria: "🇦🇹",
  Belgium: "🇧🇪",
  Portugal: "🇵🇹",
  Spain: "🇪🇸",
  "Czech Republic": "🇨🇿",
  Poland: "🇵🇱",
  Hungary: "🇭🇺",
  Greece: "🇬🇷",
  Romania: "🇷🇴",
  Slovakia: "🇸🇰",
  Croatia: "🇭🇷",
  Slovenia: "🇸🇮",
  Estonia: "🇪🇪",
  Latvia: "🇱🇻",
  Lithuania: "🇱🇹",
  Luxembourg: "🇱🇺",
  Malta: "🇲🇹",
  Cyprus: "🇨🇾",
  Iceland: "🇮🇸",
  Liechtenstein: "🇱🇮",
};

const CSS = `
@keyframes fadeInUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
@keyframes shimmer  { 0%{background-position:-400px 0}100%{background-position:400px 0} }
.vis-card { animation:fadeInUp 0.4s ease both; }
.skel { background:linear-gradient(90deg,#f0faf2 25%,#f4f7fa 50%,#f0faf2 75%); background-size:400px 100%; animation:shimmer 1.4s infinite; border-radius:8px; }
.ctry-btn { transition:all 0.2s; cursor:pointer; }
.ctry-btn:hover { transform:translateY(-2px); }
`;

export default function Visa() {
  const [searchParams] = useSearchParams();
  const urlCountry = searchParams.get("country");

  const [searchQuery, setSearchQuery] = useState("");
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

  return (
    <>
      <style>{CSS}</style>
      <Navbar />

      <div
        style={{
          background: "linear-gradient(135deg,#051F20,#163832)",
          padding: "50px 20px",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0 }}>Visa Guide</h1>
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
        {/* Country search bar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ position: "relative", maxWidth: 500 }}>
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 18,
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search country (e.g. Germany, UK, Canada...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px 12px 44px",
                borderRadius: 12,
                border: "1.5px solid #8EB69B",
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            />
          </div>

          {/* Search results dropdown */}
          {searchQuery && (
            <div
              style={{
                background: "#fff",
                border: "1.5px solid #8EB69B",
                borderRadius: 12,
                marginTop: 8,
                maxHeight: 280,
                overflowY: "auto",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                maxWidth: 500,
              }}
            >
              {COUNTRIES.filter((c) =>
                c.toLowerCase().includes(searchQuery.toLowerCase()),
              ).length === 0 ? (
                <p style={{ padding: "12px 16px", color: "#888", margin: 0 }}>
                  No country found
                </p>
              ) : (
                COUNTRIES.filter((c) =>
                  c.toLowerCase().includes(searchQuery.toLowerCase()),
                ).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelected(c);
                      setSearchQuery("");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "10px 16px",
                      background: selected === c ? "#DAF1DE" : "#fff",
                      border: "none",
                      borderBottom: "1px solid #f0f0f0",
                      cursor: "pointer",
                      fontSize: 14,
                      textAlign: "left",
                      fontWeight: selected === c ? 700 : 400,
                      color: selected === c ? "#163832" : "#333",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{FLAGS[c] || "🌍"}</span>
                    {c}
                    {selected === c && (
                      <span style={{ marginLeft: "auto", color: "#163832" }}>
                        ✓
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
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
                background: "#163832",
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
                background: "#f0faf2",
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
                <strong>Source:</strong>{" "}
                {typeof visa.source === "object"
                  ? visa.source?.name || ""
                  : visa.source || ""}
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
                  LIVE
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
                    borderTop: `3px solid #163832`,
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
                      color: "#051F20",
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
                    color: "#051F20",
                    margin: "0 0 14px",
                  }}
                >
                  Requirements
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
                  background: "#f0faf2",
                  borderRadius: 14,
                  padding: 22,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                }}
              >
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#051F20",
                    margin: "0 0 14px",
                  }}
                >
                  Tips for Pakistani Applicants
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
                    color: "#051F20",
                    margin: "0 0 18px",
                  }}
                >
                  Application Steps
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
                        background: "#f0faf2",
                        borderRadius: 10,
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: "#163832",
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
                            color: "#051F20",
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
                background: "#DAF1DE",
                border: "1.5px solid #8EB69B",
                borderRadius: 12,
                padding: 20,
                display: "flex",
                gap: 14,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1 }}>
                <strong style={{ color: "#051F20" }}>
                  Always verify at the official source
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
                      background: "#163832",
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
                      color: "#163832",
                      border: "2px solid #163832",
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

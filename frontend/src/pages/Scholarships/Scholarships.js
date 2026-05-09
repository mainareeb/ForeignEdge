/**
 * Scholarships.js
 * ===============
 * Fetches real data from GET /scholarships (Firestore via backend).
 * Reads ?country= URL param for cross-page navigation from Universities.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getScholarships } from "../../services/api";

const FLAGS = {
  UK: "🇬🇧",
  USA: "🇺🇸",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  Germany: "🇩🇪",
  Netherlands: "🇳🇱",
  Sweden: "🇸🇪",
  France: "🇫🇷",
  Pakistan: "🇵🇰",
  Various: "🌍",
  All: "🌐",
};

const CSS = `
@keyframes fadeInUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
@keyframes shimmer  { 0%{background-position:-400px 0}100%{background-position:400px 0} }
.sch-card { animation:fadeInUp 0.4s ease both; transition:transform 0.25s,box-shadow 0.25s; }
.sch-card:hover { transform:translateY(-6px); box-shadow:0 18px 40px rgba(0,0,0,0.12)!important; }
.skel { background:linear-gradient(90deg,#f0faf2 25%,#f4f7fa 50%,#f0faf2 75%); background-size:400px 100%; animation:shimmer 1.4s infinite; border-radius:8px; }
.chip { transition:all 0.2s; cursor:pointer; }
.chip:hover { transform:translateY(-2px); }
`;

function SkeletonCard() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: 22,
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
      }}
    >
      <div
        className="skel"
        style={{ height: 16, width: "75%", marginBottom: 10 }}
      />
      <div
        className="skel"
        style={{ height: 13, width: "40%", marginBottom: 8 }}
      />
      <div
        className="skel"
        style={{ height: 13, width: "60%", marginBottom: 18 }}
      />
      <div className="skel" style={{ height: 34, borderRadius: 8 }} />
    </div>
  );
}

export default function Scholarships() {
  const [searchParams] = useSearchParams();
  const urlCountry = searchParams.get("country");

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [policy, setPolicy] = useState(null);

  const [country, setCountry] = useState(urlCountry || "All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sort, setSort] = useState("deadline");
  const [limit, setLimit] = useState(71);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  // Sync URL param
  useEffect(() => {
    if (urlCountry) setCountry(urlCountry);
  }, [urlCountry]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(input), 400);
    return () => clearTimeout(t);
  }, [input]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getScholarships({
        country: country !== "All" ? country : undefined,
        search: search || undefined,
        type: typeFilter !== "All" ? typeFilter : undefined,
        sort,
        limit,
      });
      setData(res.data.results || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
      setPolicy(res.data.data_policy || null);
    } catch (err) {
      setError(err.message || "Failed to load scholarships.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [country, search, typeFilter, sort, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0 }}>
          Scholarship Finder
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
          Real scholarships sourced from official program websites. Every entry
          has a verified official link.
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
        {/* Search + Sort */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="🔍 Search scholarships, fields, countries..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              minWidth: 220,
              padding: "12px 16px",
              borderRadius: 10,
              border: "1.5px solid #8EB69B",
              fontSize: 15,
              outline: "none",
            }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: "1.5px solid #8EB69B",
              fontSize: 15,
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <option value="deadline">Sort: Deadline</option>
            <option value="name">Sort: Name A–Z</option>
            <option value="amount">Sort: Full Funding First</option>
          </select>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: "1.5px solid #8EB69B",
              fontSize: 15,
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <option value={10}>Show 10</option>
            <option value={20}>Show 20</option>
            <option value={50}>Show 50</option>
            <option value={71}>Show All (71)</option>
          </select>
        </div>

        {/* Type chips */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 22,
          }}
        >
          {["All", "Full", "Partial"].map((t) => (
            <button
              key={t}
              className="chip"
              onClick={() => setTypeFilter(t)}
              style={{
                padding: "5px 14px",
                borderRadius: 16,
                border:
                  typeFilter === t
                    ? "2px solid #16a34a"
                    : "1.5px solid #8EB69B",
                background: typeFilter === t ? "#16a34a" : "#fff",
                color: typeFilter === t ? "#fff" : "#444",
                fontWeight: typeFilter === t ? 700 : 400,
                fontSize: 13,
              }}
            >
              {t === "Full"
                ? "Full Funding"
                : t === "Partial"
                  ? "Partial"
                  : "All Types"}
            </button>
          ))}
        </div>

        <div style={{ color: "#555", fontSize: 14, marginBottom: 20 }}>
          {loading
            ? "Loading..."
            : `Showing ${data.length} of ${total} scholarships`}
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
            <button
              onClick={fetchData}
              style={{
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

        {/* Skeletons */}
        {loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
              gap: 18,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              marginTop: 32,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "1.5px solid #8EB69B",
                background: page === 1 ? "#f5f5f5" : "#fff",
                color: page === 1 ? "#bbb" : "#163832",
                fontWeight: 600,
                cursor: page === 1 ? "not-allowed" : "pointer",
                fontSize: 14,
              }}
            >
              ← Prev
            </button>

            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              let p;
              if (pages <= 7) p = i + 1;
              else if (page <= 4) p = i + 1;
              else if (page >= pages - 3) p = pages - 6 + i;
              else p = page - 3 + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    border: "1.5px solid",
                    borderColor: p === page ? "#163832" : "#8EB69B",
                    background: p === page ? "#163832" : "#fff",
                    color: p === page ? "#fff" : "#444",
                    fontWeight: p === page ? 700 : 400,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "1.5px solid #8EB69B",
                background: page === pages ? "#f5f5f5" : "#fff",
                color: page === pages ? "#bbb" : "#163832",
                fontWeight: 600,
                cursor: page === pages ? "not-allowed" : "pointer",
                fontSize: 14,
              }}
            >
              Next →
            </button>
          </div>
        )}

        {/* Cards */}
        {!loading &&
          !error &&
          (data.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "50px 20px",
                color: "#777",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔭</div>
              <h3 style={{ fontWeight: 700 }}>No scholarships found</h3>
              <p>Try a different country filter or search term.</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                gap: 18,
              }}
            >
              {data.map((sch, i) => (
                <div
                  key={sch.id || i}
                  className="sch-card"
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    padding: 22,
                    boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    borderTop:
                      sch.type?.toLowerCase() === "full"
                        ? "3px solid #163832"
                        : "3px solid #8EB69B",
                    animationDelay: `${i * 0.04}s`,
                  }}
                >
                  {/* ── Header ── */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#051F20",
                        margin: 0,
                        flex: 1,
                        lineHeight: 1.3,
                      }}
                    >
                      {sch.name}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexShrink: 0,
                        marginLeft: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      {sch.type?.toLowerCase() === "full" && (
                        <span
                          style={{
                            background: "#163832",
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 10,
                          }}
                        >
                          FULL FUNDING
                        </span>
                      )}
                      {sch.type?.toLowerCase() === "partial" && (
                        <span
                          style={{
                            background: "#DAF1DE",
                            color: "#163832",
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 10,
                          }}
                        >
                          PARTIAL
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Key Info Row ── */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span
                      style={{
                        background: "#f0faf2",
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        color: "#444",
                        fontWeight: 600,
                      }}
                    >
                      {FLAGS[sch.country] || "🌍"} {sch.country}
                    </span>
                    {sch.amount && (
                      <span
                        style={{
                          background: "#e8fdf0",
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 12,
                          color: "#163832",
                          fontWeight: 600,
                        }}
                      >
                        {sch.amount}
                      </span>
                    )}
                    {sch.deadline && (
                      <span
                        style={{
                          background: "#fff8e6",
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 12,
                          color: "#b07d00",
                          fontWeight: 600,
                        }}
                      >
                        {sch.deadline}
                      </span>
                    )}
                    {sch.field && (
                      <span
                        style={{
                          background: "#DAF1DE",
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 12,
                          color: "#235347",
                          fontWeight: 600,
                        }}
                      >
                        {sch.field}
                      </span>
                    )}
                  </div>

                  {/* ── Description ── */}
                  {sch.description && (
                    <p
                      style={{
                        fontSize: 13,
                        color: "#555",
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {sch.description.length > 150
                        ? sch.description.slice(0, 150) + "…"
                        : sch.description}
                    </p>
                  )}

                  {/* ── Details Grid ── */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      background: "#f0faf2",
                      borderRadius: 10,
                      padding: 12,
                    }}
                  >
                    {sch.coverage && (
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#888",
                            margin: "0 0 2px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          Coverage
                        </p>
                        <p style={{ fontSize: 12, color: "#333", margin: 0 }}>
                          {sch.coverage}
                        </p>
                      </div>
                    )}
                    {sch.duration && (
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#888",
                            margin: "0 0 2px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          Duration
                        </p>
                        <p style={{ fontSize: 12, color: "#333", margin: 0 }}>
                          {sch.duration}
                        </p>
                      </div>
                    )}
                    {sch.gpa_requirement && (
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#888",
                            margin: "0 0 2px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          Min GPA
                        </p>
                        <p style={{ fontSize: 12, color: "#333", margin: 0 }}>
                          {sch.gpa_requirement}
                        </p>
                      </div>
                    )}
                    {sch.ielts_requirement && (
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#888",
                            margin: "0 0 2px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          Min IELTS
                        </p>
                        <p style={{ fontSize: 12, color: "#333", margin: 0 }}>
                          {sch.ielts_requirement}
                        </p>
                      </div>
                    )}
                    {sch.age_limit && (
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#888",
                            margin: "0 0 2px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          Age Limit
                        </p>
                        <p style={{ fontSize: 12, color: "#333", margin: 0 }}>
                          {sch.age_limit}
                        </p>
                      </div>
                    )}
                    {sch.success_rate && (
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#888",
                            margin: "0 0 2px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          Success Rate
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: "#27ae60",
                            margin: 0,
                            fontWeight: 700,
                          }}
                        >
                          {sch.success_rate}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ── Eligibility ── */}
                  {sch.eligibility && (
                    <div
                      style={{
                        background: "#f0faf2",
                        borderRadius: 8,
                        padding: "8px 12px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          color: "#888",
                          margin: "0 0 4px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        Eligibility
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#444",
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {sch.eligibility}
                      </p>
                    </div>
                  )}

                  {/* ── Required Documents ── */}
                  {sch.documents && sch.documents.length > 0 && (
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          color: "#888",
                          margin: "0 0 6px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        Required Documents
                      </p>
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                      >
                        {sch.documents.map((doc, i) => (
                          <span
                            key={i}
                            style={{
                              background: "#fff3cd",
                              color: "#856404",
                              fontSize: 11,
                              padding: "2px 8px",
                              borderRadius: 10,
                              fontWeight: 600,
                            }}
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {sch.bond_required && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "#dc2626",
                        margin: 0,
                        fontWeight: 600,
                      }}
                    >
                      Bond/Return Service Required: {sch.bond_required}
                    </p>
                  )}

                  <div style={{ marginTop: "auto" }}>
                    {sch.link && (
                      <a
                        href={sch.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "block",
                          padding: "10px 14px",
                          background: "#163832",
                          color: "#fff",
                          borderRadius: 9,
                          textDecoration: "none",
                          fontWeight: 700,
                          fontSize: 14,
                          textAlign: "center",
                        }}
                      >
                        Apply / Learn More →
                      </a>
                    )}
                  </div>

                  {sch.source && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        margin: 0,
                        borderTop: "1px solid #f0f0f0",
                        paddingTop: 8,
                      }}
                    >
                      {typeof sch.source === "object"
                        ? sch.source?.name || ""
                        : sch.source || ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}

        {policy && !loading && (
          <div
            style={{
              marginTop: 36,
              padding: 16,
              borderRadius: 10,
              background: "#f0fdf4",
              border: "1px solid #86efac",
              fontSize: 13,
              color: "#374151",
            }}
          >
            ✅ <strong>Data Policy:</strong> {policy}
          </div>
        )}
      </div>
    </>
  );
}

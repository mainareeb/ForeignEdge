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

const COUNTRIES = [
  "All",
  "UK",
  "USA",
  "Canada",
  "Australia",
  "Germany",
  "Netherlands",
  "Sweden",
  "France",
  "Pakistan",
  "Various",
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
  Pakistan: "🇵🇰",
  Various: "🌍",
  All: "🌐",
};

const CSS = `
@keyframes fadeInUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
@keyframes shimmer  { 0%{background-position:-400px 0}100%{background-position:400px 0} }
.sch-card { animation:fadeInUp 0.4s ease both; transition:transform 0.25s,box-shadow 0.25s; }
.sch-card:hover { transform:translateY(-6px); box-shadow:0 18px 40px rgba(0,0,0,0.12)!important; }
.skel { background:linear-gradient(90deg,#e8eef4 25%,#f4f7fa 50%,#e8eef4 75%); background-size:400px 100%; animation:shimmer 1.4s infinite; border-radius:8px; }
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
  const [limit, setLimit] = useState(20);
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
          background: "linear-gradient(135deg,#1a2e4a,#2a6496)",
          padding: "50px 20px",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0 }}>
          🏆 Scholarship Finder
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
              border: "1.5px solid #d0dde8",
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
              border: "1.5px solid #d0dde8",
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
              border: "1.5px solid #d0dde8",
              fontSize: 15,
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <option value={10}>Show 10</option>
            <option value={20}>Show 20</option>
            <option value={50}>Show 50</option>
          </select>
        </div>

        {/* Country chips */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          {COUNTRIES.map((c) => (
            <button
              key={c}
              className="chip"
              onClick={() => setCountry(c)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border:
                  country === c ? "2px solid #2a6496" : "1.5px solid #d0dde8",
                background: country === c ? "#2a6496" : "#fff",
                color: country === c ? "#fff" : "#444",
                fontWeight: country === c ? 700 : 400,
                fontSize: 13,
              }}
            >
              {FLAGS[c] || "🌍"} {c}
            </button>
          ))}
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
                    : "1.5px solid #d0dde8",
                background: typeFilter === t ? "#16a34a" : "#fff",
                color: typeFilter === t ? "#fff" : "#444",
                fontWeight: typeFilter === t ? 700 : 400,
                fontSize: 13,
              }}
            >
              {t === "Full"
                ? "🎯 Full Funding"
                : t === "Partial"
                  ? "📝 Partial"
                  : "🌐 All Types"}
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
                border: "1.5px solid #d0dde8",
                background: page === 1 ? "#f5f5f5" : "#fff",
                color: page === 1 ? "#bbb" : "#2a6496",
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
                    borderColor: p === page ? "#2a6496" : "#d0dde8",
                    background: p === page ? "#2a6496" : "#fff",
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
                border: "1.5px solid #d0dde8",
                background: page === pages ? "#f5f5f5" : "#fff",
                color: page === pages ? "#bbb" : "#2a6496",
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
                        ? "3px solid #2a6496"
                        : "3px solid #d0dde8",
                    animationDelay: `${i * 0.04}s`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#1a2e4a",
                        margin: 0,
                        flex: 1,
                        lineHeight: 1.3,
                      }}
                    >
                      {sch.name}
                    </h3>
                    {sch.type?.toLowerCase() === "full" && (
                      <span
                        style={{
                          background: "#2a6496",
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 10,
                          marginLeft: 8,
                          flexShrink: 0,
                        }}
                      >
                        FULL
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      fontSize: 13,
                      color: "#555",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>
                      {FLAGS[sch.country] || "🌍"} {sch.country}
                    </span>
                    <span>💰 {sch.amount}</span>
                    {sch.deadline && <span>📅 {sch.deadline}</span>}
                  </div>

                  {sch.field && (
                    <span
                      style={{
                        display: "inline-block",
                        background: "#e8f4fd",
                        color: "#1a6ca8",
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 10,
                        alignSelf: "flex-start",
                      }}
                    >
                      🎯 {sch.field}
                    </span>
                  )}

                  {sch.description && (
                    <p
                      style={{
                        fontSize: 13,
                        color: "#555",
                        margin: 0,
                        lineHeight: 1.55,
                      }}
                    >
                      {sch.description.length > 130
                        ? sch.description.slice(0, 130) + "…"
                        : sch.description}
                    </p>
                  )}

                  {sch.eligibility && (
                    <p style={{ fontSize: 12, color: "#777", margin: 0 }}>
                      <strong>Eligibility:</strong> {sch.eligibility}
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
                          background: "#2a6496",
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
                      📡 {sch.source}
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

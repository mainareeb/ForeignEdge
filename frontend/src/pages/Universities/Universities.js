/**
 * Universities.js
 * ===============
 * Fetches real data from GET /universities (HiPolabs API via backend).
 * Loading skeletons, error state with retry, search, filter, pagination.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getUniversities, getPlatformStats } from "../../services/api";

const FLAGS = {
  UK: "🇬🇧",
  USA: "🇺🇸",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  Germany: "🇩🇪",
  Netherlands: "🇳🇱",
  Sweden: "🇸🇪",
  France: "🇫🇷",
  All: "🌍",
};

const CSS = `
@keyframes fadeInUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
@keyframes shimmer  { 0%{background-position:-400px 0}100%{background-position:400px 0} }
.uni-card { animation:fadeInUp 0.4s ease both; transition:transform 0.25s,box-shadow 0.25s; }
.uni-card:hover { transform:translateY(-6px); box-shadow:0 18px 40px rgba(0,0,0,0.13)!important; }
.skel { background:linear-gradient(90deg,#e8eef4 25%,#f4f7fa 50%,#e8eef4 75%); background-size:400px 100%; animation:shimmer 1.4s infinite; border-radius:8px; }
.filter-btn { transition:all 0.2s; cursor:pointer; }
.filter-btn:hover { transform:translateY(-2px); }
`;

function SkeletonCard() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 22,
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
      }}
    >
      <div
        className="skel"
        style={{ height: 18, width: "70%", marginBottom: 12 }}
      />
      <div
        className="skel"
        style={{ height: 13, width: "40%", marginBottom: 8 }}
      />
      <div className="skel" style={{ height: 13, width: "55%" }} />
    </div>
  );
}

export default function Universities() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [country] = useState("All");
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [source, setSource] = useState(null);
  const [countriesCount, setCountriesCount] = useState(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(input);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => {
    setPage(1);
  }, [country, sort]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUniversities({
        country: country !== "All" ? country : undefined,
        search: search || undefined,
        sort,
        page,
        per_page: 18,
      });
      setData(res.data.results || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
      setSource(res.data.data_source || null);
    } catch (err) {
      setError(err.message || "Failed to load universities.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [country, search, sort, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch real-time countries count from scholarships
  useEffect(() => {
    getPlatformStats()
      .then((res) => {
        if (res.data?.countries) {
          setCountriesCount(res.data.countries);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <Navbar />

      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg,#1a2e4a,#2a6496)",
          padding: "50px 20px",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0 }}>
          🎓 University Directory
        </h1>
        <p
          style={{
            opacity: 0.85,
            marginTop: 10,
            fontSize: 15,
            maxWidth: 540,
            margin: "10px auto 0",
          }}
        >
          Live data from the HiPolabs Universities API — real, verified
          universities worldwide.
        </p>
        {source && (
          <p style={{ fontSize: 12, opacity: 0.65, marginTop: 8 }}>
            📡{" "}
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#7ec8e3" }}
            >
              {source.name}
            </a>
          </p>
        )}

        {/* Real-time stats */}
        <div
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "center",
            marginTop: 20,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "10px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800 }}>
              {total ? total.toLocaleString() + "+" : "…"}
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
              Universities
            </div>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "10px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800 }}>
              {countriesCount ? countriesCount + "+" : "…"}
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
              Countries (Scholarships)
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
        {/* Search + Sort */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="🔍 Search universities..."
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
            <option value="name">Sort: Name A–Z</option>
            <option value="country">Sort: Country</option>
          </select>
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#555",
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          <span>
            {loading
              ? "Fetching..."
              : `Showing ${data.length} of ${total} universities`}
          </span>
          {pages > 1 && (
            <span>
              Page {page} of {pages}
            </span>
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
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <p style={{ color: "#dc2626", fontWeight: 600, margin: 0 }}>
              {error}
            </p>
            <p style={{ color: "#555", marginTop: 8, fontSize: 14 }}>
              Make sure the backend server is running on port 5000.
            </p>
            <button
              onClick={fetchData}
              style={{
                marginTop: 14,
                padding: "9px 22px",
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
              gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
              gap: 18,
            }}
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Results */}
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
              <h3 style={{ fontWeight: 700 }}>No universities found</h3>
              <p>Try a different country or search term.</p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                  gap: 18,
                }}
              >
                {data.map((uni, i) => (
                  <div
                    key={`${uni.name}-${i}`}
                    className="uni-card"
                    style={{
                      background: "#fff",
                      borderRadius: 14,
                      padding: 22,
                      boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      animationDelay: `${i * 0.04}s`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: "linear-gradient(135deg,#e8f4fd,#d0e9f8)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          flexShrink: 0,
                        }}
                      >
                        🎓
                      </div>
                      <div>
                        <h3
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#1a2e4a",
                            margin: 0,
                            lineHeight: 1.3,
                          }}
                        >
                          {uni.name}
                        </h3>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: 13,
                            color: "#555",
                          }}
                        >
                          {FLAGS[uni.country] || "🌍"} {uni.country}
                          {uni.state_province && ` · ${uni.state_province}`}
                        </p>
                      </div>
                    </div>

                    {uni.domains?.[0] && (
                      <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
                        🌐 {uni.domains[0]}
                      </p>
                    )}

                    <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                      {uni.website && (
                        <a
                          href={uni.website}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            background: "#2a6496",
                            color: "#fff",
                            borderRadius: 8,
                            textDecoration: "none",
                            fontSize: 13,
                            fontWeight: 600,
                            textAlign: "center",
                            display: "block",
                          }}
                        >
                          Visit Website
                        </a>
                      )}
                      <button
                        onClick={() =>
                          navigate(
                            `/scholarships?country=${encodeURIComponent(uni.country)}`,
                          )
                        }
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          background: "#e8fdf0",
                          border: "1.5px solid #2d7a3a",
                          color: "#2d7a3a",
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        💰 Scholarships
                      </button>
                    </div>

                    {uni.source && (
                      <p
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          margin: 0,
                          borderTop: "1px solid #f0f0f0",
                          paddingTop: 8,
                        }}
                      >
                        📡 {uni.source}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 8,
                    marginTop: 36,
                  }}
                >
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "1.5px solid #d0dde8",
                      background: page === 1 ? "#f5f5f5" : "#fff",
                      color: page === 1 ? "#bbb" : "#444",
                      cursor: page === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    ← Prev
                  </button>
                  {Array.from(
                    { length: Math.min(pages, 7) },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        border:
                          p === page
                            ? "2px solid #2a6496"
                            : "1.5px solid #d0dde8",
                        background: p === page ? "#2a6496" : "#fff",
                        color: p === page ? "#fff" : "#444",
                        cursor: "pointer",
                        fontWeight: p === page ? 700 : 400,
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "1.5px solid #d0dde8",
                      background: page === pages ? "#f5f5f5" : "#fff",
                      color: page === pages ? "#bbb" : "#444",
                      cursor: page === pages ? "not-allowed" : "pointer",
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ))}
      </div>
    </>
  );
}

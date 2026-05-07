import { SkeletonGrid } from "../../components/SkeletonLoader";
import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import { getAccommodation } from "../../services/api";

const COUNTRY_META = {
  UK: { flag: "🇬🇧", name: "United Kingdom", color: "#051F20" },
  USA: { flag: "🇺🇸", name: "United States", color: "#bf0a30" },
  Canada: { flag: "🇨🇦", name: "Canada", color: "#d52b1e" },
  Australia: { flag: "🇦🇺", name: "Australia", color: "#00008b" },
  Germany: { flag: "🇩🇪", name: "Germany", color: "#333" },
  Netherlands: { flag: "🇳🇱", name: "Netherlands", color: "#ae1c28" },
  Sweden: { flag: "🇸🇪", name: "Sweden", color: "#163832" },
  Japan: { flag: "🇯🇵", name: "Japan", color: "#bc002d" },
};

const PLATFORMS = {
  UK: [
    {
      name: "Rightmove",
      url: "https://www.rightmove.co.uk/student-accommodation/",
      icon: "🏠",
    },
    { name: "SpareRoom", url: "https://www.spareroom.co.uk/", icon: "🛏️" },
    {
      name: "Zoopla",
      url: "https://www.zoopla.co.uk/student-accommodation/",
      icon: "🔍",
    },
    { name: "Uniplaces", url: "https://www.uniplaces.com/", icon: "🎓" },
  ],
  USA: [
    { name: "Zillow", url: "https://www.zillow.com/", icon: "🏠" },
    { name: "Apartments.com", url: "https://www.apartments.com/", icon: "🔍" },
    {
      name: "Off-Campus Partners",
      url: "https://www.offcampuspartners.com/",
      icon: "🎓",
    },
    { name: "Craigslist", url: "https://www.craigslist.org/", icon: "📋" },
  ],
  Canada: [
    { name: "Kijiji", url: "https://www.kijiji.ca/", icon: "🏠" },
    { name: "PadMapper", url: "https://www.padmapper.com/", icon: "🗺️" },
    { name: "Rentals.ca", url: "https://rentals.ca/", icon: "🔍" },
    {
      name: "Facebook Marketplace",
      url: "https://www.facebook.com/marketplace/",
      icon: "📘",
    },
  ],
  Australia: [
    { name: "Domain", url: "https://www.domain.com.au/", icon: "🏠" },
    {
      name: "realestate.com.au",
      url: "https://www.realestate.com.au/",
      icon: "🔍",
    },
    { name: "Student.com", url: "https://www.student.com/au/", icon: "🎓" },
    { name: "Gumtree", url: "https://www.gumtree.com.au/", icon: "📋" },
  ],
  Germany: [
    { name: "WG-Gesucht", url: "https://www.wg-gesucht.de/", icon: "🏠" },
    {
      name: "ImmobilienScout24",
      url: "https://www.immobilienscout24.de/",
      icon: "🔍",
    },
    {
      name: "HousingAnywhere",
      url: "https://housinganywhere.com/de",
      icon: "🌍",
    },
    {
      name: "Studentenwerk",
      url: "https://www.studentenwerke.de/en",
      icon: "🎓",
    },
  ],
  Netherlands: [
    { name: "Kamernet", url: "https://kamernet.nl/en", icon: "🏠" },
    {
      name: "HousingAnywhere",
      url: "https://housinganywhere.com/nl",
      icon: "🌍",
    },
    { name: "Pararius", url: "https://www.pararius.com/", icon: "🔍" },
    { name: "Student.com NL", url: "https://www.student.com/nl/", icon: "🎓" },
  ],
  Sweden: [
    { name: "Blocket Bostad", url: "https://bostad.blocket.se/", icon: "🏠" },
    { name: "SSCO (Stockholm)", url: "https://www.ssco.se/en/", icon: "🎓" },
    {
      name: "AF Bostäder (Lund)",
      url: "https://www.afbostader.se/en/",
      icon: "🏘️",
    },
    { name: "Boplats", url: "https://www.boplats.se/", icon: "🔍" },
  ],
  Japan: [
    {
      name: "GaijinPot Housing",
      url: "https://housing.gaijinpot.com/",
      icon: "🏠",
    },
    { name: "Sakura House", url: "https://www.sakura-house.com/", icon: "🌸" },
    {
      name: "HousingAnywhere JP",
      url: "https://housinganywhere.com/jp",
      icon: "🌍",
    },
    { name: "Suumo", url: "https://suumo.jp/", icon: "🔍" },
  ],
};

const CSS = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.country-tab { transition: all 0.2s ease; cursor: pointer; }
.country-tab:hover { transform: translateY(-2px); }
.accom-card {
  animation: fadeInUp 0.4s ease both;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.accom-card:hover { transform: translateY(-5px); box-shadow: 0 16px 36px rgba(0,0,0,0.12) !important; }
.platform-btn { transition: all 0.2s ease; }
.platform-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.15) !important; }
`;

export default function Accommodation() {
  const [sel, setSel] = useState("UK");
  const [city, setCity] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (country, cityName) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAccommodation(country, cityName || undefined);
      setData(res.data);
    } catch (e) {
      setError("Could not load accommodation data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCity(null);
    setData(null);
    fetchData(sel, null);
  }, [sel, fetchData]);

  const meta = COUNTRY_META[sel] || {};
  const color = meta.color || "#0B2B26";
  const cities = data?.cities || [];
  const costs = data?.costs || {};
  const platforms = PLATFORMS[sel] || [];

  const openPlatform = (p) => {
    let url = p.url;
    if (city) {
      const enc = encodeURIComponent(city);
      if (p.name === "Rightmove") url += `?searchLocation=${enc}`;
      else if (p.name === "Zillow") url += `homes/for_rent/${enc}_rb/`;
      else if (p.name === "Domain") url += `rent/?q=${enc}`;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCityChange = (c) => {
    const newCity = c === city ? null : c;
    setCity(newCity);
    fetchData(sel, newCity);
  };

  return (
    <>
      <style>{CSS}</style>
      <Navbar />

      <div
        style={{
          background: "linear-gradient(135deg,#0B2B26,#163832)",
          padding: "52px 20px",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>
          🏠 Accommodation Guide
        </h1>
        <p
          style={{
            opacity: 0.88,
            marginTop: 10,
            fontSize: 16,
            maxWidth: 600,
            margin: "10px auto 0",
          }}
        >
          Live cost-of-living data from Numbeo and official study portals. "Find
          Listings" links open real platforms.
        </p>
      </div>

      <div style={{ maxWidth: 1150, margin: "0 auto", padding: "32px 20px" }}>
        {/* Country tabs */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 28,
          }}
        >
          {Object.entries(COUNTRY_META).map(([id, m]) => (
            <button
              key={id}
              className="country-tab"
              onClick={() => setSel(id)}
              style={{
                padding: "10px 20px",
                borderRadius: 24,
                border:
                  sel === id ? `2px solid ${m.color}` : "1.5px solid #8EB69B",
                background: sel === id ? m.color : "#fff",
                color: sel === id ? "#fff" : "#444",
                fontWeight: sel === id ? 700 : 400,
                fontSize: 14,
              }}
            >
              {m.flag} {id}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
            <SkeletonGrid count={3} columns={1} />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div
            style={{
              background: "#fdecea",
              border: "1px solid #f5a09a",
              borderRadius: 10,
              padding: "14px 18px",
              marginBottom: 20,
              color: "#c0392b",
            }}
          >
            {error}
          </div>
        )}

        {data && !loading && (
          <>
            {/* Source attribution */}
            <div
              style={{
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: 10,
                padding: "12px 18px",
                marginBottom: 24,
                fontSize: 13,
                color: "#0369a1",
              }}
            >
              <strong>📡 Data source:</strong>{" "}
              <a
                href={data.source_url}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#0369a1" }}
              >
                {data.source}
              </a>
              {data.is_fallback && (
                <span
                  style={{
                    marginLeft: 8,
                    background: "#fff8e6",
                    color: "#b07d00",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  ⚠️ Using cached data — live API unavailable
                </span>
              )}
            </div>

            {/* City filter */}
            {cities.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p
                  style={{
                    fontSize: 13,
                    color: "#666",
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  Filter by city:
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => {
                      setCity(null);
                      fetchData(sel, null);
                    }}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 20,
                      border: !city
                        ? `2px solid ${color}`
                        : "1.5px solid #8EB69B",
                      background: !city ? color : "#fff",
                      color: !city ? "#fff" : "#666",
                      fontSize: 13,
                      cursor: "pointer",
                      fontWeight: !city ? 700 : 400,
                    }}
                  >
                    All Cities
                  </button>
                  {cities.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleCityChange(c)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: 20,
                        border:
                          city === c
                            ? `2px solid ${color}`
                            : "1.5px solid #8EB69B",
                        background: city === c ? color : "#fff",
                        color: city === c ? "#fff" : "#666",
                        fontSize: 13,
                        cursor: "pointer",
                        fontWeight: city === c ? 700 : 400,
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Accommodation types */}
            <h2
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: "#0B2B26",
                margin: "0 0 16px",
              }}
            >
              🏡 Accommodation Types &amp; Costs
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                gap: 18,
                marginBottom: 32,
              }}
            >
              {Object.entries(costs).map(([type, info], i) => (
                <div
                  key={type}
                  className="accom-card"
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    padding: 22,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                    borderTop: `4px solid ${color}`,
                    animationDelay: `${i * 0.08}s`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
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
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#0B2B26",
                        margin: 0,
                      }}
                    >
                      {type}
                    </h3>
                    <span
                      style={{
                        background: "#f0f9ff",
                        color: "#0369a1",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 10,
                      }}
                    >
                      /month
                    </span>
                  </div>

                  {/* ── Price Range ── */}
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 10,
                      padding: "12px 14px",
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
                      Price Range
                    </p>
                    <div style={{ fontSize: 22, fontWeight: 800, color }}>
                      {info.range}
                    </div>
                    <p
                      style={{ fontSize: 13, color: "#555", margin: "4px 0 0" }}
                    >
                      Average:{" "}
                      <strong>
                        {data.symbol}
                        {info.avg?.toLocaleString()}/mo
                      </strong>
                    </p>
                  </div>

                  {/* ── Monthly Budget Breakdown ── */}
                  {(info.utilities || info.internet || info.transport) && (
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
                        Monthly Extras
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        {info.utilities && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 12,
                            }}
                          >
                            <span style={{ color: "#555" }}>⚡ Utilities</span>
                            <span style={{ fontWeight: 600, color: "#333" }}>
                              {data.symbol}
                              {info.utilities}/mo
                            </span>
                          </div>
                        )}
                        {info.internet && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 12,
                            }}
                          >
                            <span style={{ color: "#555" }}>📶 Internet</span>
                            <span style={{ fontWeight: 600, color: "#333" }}>
                              {data.symbol}
                              {info.internet}/mo
                            </span>
                          </div>
                        )}
                        {info.transport && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 12,
                            }}
                          >
                            <span style={{ color: "#555" }}>🚌 Transport</span>
                            <span style={{ fontWeight: 600, color: "#333" }}>
                              {data.symbol}
                              {info.transport}/mo
                            </span>
                          </div>
                        )}
                        {info.avg && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 13,
                              borderTop: "1px solid #e0e9f0",
                              paddingTop: 4,
                              marginTop: 2,
                            }}
                          >
                            <span style={{ color: "#051F20", fontWeight: 700 }}>
                              📊 Total Estimate
                            </span>
                            <span style={{ fontWeight: 800, color }}>
                              {data.symbol}
                              {(
                                info.avg +
                                (info.utilities || 0) +
                                (info.internet || 0) +
                                (info.transport || 0)
                              ).toLocaleString()}
                              /mo
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Includes ── */}
                  {info.includes && (
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
                        Typically Includes
                      </p>
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                      >
                        {info.includes.map((item, j) => (
                          <span
                            key={j}
                            style={{
                              background: "#e8fdf0",
                              color: "#163832",
                              fontSize: 11,
                              padding: "2px 8px",
                              borderRadius: 10,
                              fontWeight: 600,
                            }}
                          >
                            ✓ {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Halal Food Note ── */}
                  {data.halal_food_note && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "#163832",
                        margin: 0,
                        fontWeight: 600,
                        background: "#e8fdf0",
                        padding: "6px 10px",
                        borderRadius: 8,
                      }}
                    >
                      🕌 {data.halal_food_note}
                    </p>
                  )}

                  {/* ── Numbeo Source ── */}
                  {data.source_url && (
                    <a
                      href={data.source_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 11,
                        color: "#0369a1",
                        textDecoration: "none",
                        textAlign: "right",
                      }}
                    >
                      📊 View on Numbeo →
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
                marginBottom: 32,
              }}
            >
              {/* Platforms */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: 24,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                }}
              >
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#0B2B26",
                    margin: "0 0 12px",
                  }}
                >
                  🔍 Find Real Listings
                </h2>
                <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>
                  Opens official rental platforms with live listings.
                  {city && ` Filtered for: ${city}.`}
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {platforms.map((p, i) => (
                    <button
                      key={i}
                      className="platform-btn"
                      onClick={() => openPlatform(p)}
                      style={{
                        padding: "12px 18px",
                        background: "#f8fafc",
                        border: `1.5px solid ${color}33`,
                        borderRadius: 10,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#0B2B26",
                        textAlign: "left",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{p.icon}</span>
                      <span>{p.name}</span>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 13,
                          color: "#888",
                        }}
                      >
                        → Real listings
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly budget */}
              <div
                style={{
                  background: `${color}0f`,
                  border: `1.5px solid ${color}33`,
                  borderRadius: 14,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#0B2B26",
                    marginBottom: 4,
                  }}
                >
                  Estimated Monthly Budget
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color,
                    marginBottom: 8,
                  }}
                >
                  {data.monthly_total}
                </div>
                <p style={{ fontSize: 12, color: "#777", margin: 0 }}>
                  Includes accommodation + groceries + transport + utilities.
                  Varies by city and lifestyle.
                </p>
                <a
                  href={data.source_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    marginTop: 16,
                    padding: "10px 20px",
                    background: color,
                    color: "#fff",
                    borderRadius: 9,
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: 13,
                    alignSelf: "flex-start",
                  }}
                >
                  Full Cost Data →
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

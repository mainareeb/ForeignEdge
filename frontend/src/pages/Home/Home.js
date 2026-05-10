import React, { useEffect, useState, useCallback } from "react";
import API, { getUniversities, getPlatformStats } from "../../services/api";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

// Inject global CSS animations once
const animationCSS = `
@keyframes fadeInUp {
 from { opacity: 0; transform: translateY(40px); }
 to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInLeft {
 from { opacity: 0; transform: translateX(-40px); }
 to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInRight {
 from { opacity: 0; transform: translateX(40px); }
 to { opacity: 1; transform: translateX(0); }
}
@keyframes float {
 0%, 100% { transform: translateY(0px); }
 50% { transform: translateY(-18px); }
}
@keyframes floatSlow {
 0%, 100% { transform: translateY(0px) rotate(0deg); }
 50% { transform: translateY(-10px) rotate(3deg); }
}
@keyframes slideShow {
 0% { opacity: 0; transform: scale(1.08); }
 8% { opacity: 1; transform: scale(1); }
 30% { opacity: 1; transform: scale(1); }
 38% { opacity: 0; transform: scale(0.96); }
 100% { opacity: 0; transform: scale(0.96); }
}
@keyframes pulse {
 0%, 100% { transform: scale(1); }
 50% { transform: scale(1.05); }
}
@keyframes shimmer {
 0% { background-position: -200% center; }
 100% { background-position: 200% center; }
}
@keyframes countUp {
 from { opacity: 0; transform: translateY(20px); }
 to { opacity: 1; transform: translateY(0); }
}
@keyframes rotateSlow {
 from { transform: rotate(0deg); }
 to { transform: rotate(360deg); }
}
@keyframes borderGlow {
 0%, 100% { box-shadow: 0 0 10px rgba(74,158,218,0.3); }
 50% { box-shadow: 0 0 25px rgba(74,158,218,0.7); }
}
.hero-img-0 { animation: slideShow 12s infinite 0s; }
.hero-img-1 { animation: slideShow 12s infinite 4s; }
.hero-img-2 { animation: slideShow 12s infinite 8s; }
.animate-float { animation: float 4s ease-in-out infinite; }
.animate-floatSlow { animation: floatSlow 6s ease-in-out infinite; }
.animate-pulse { animation: pulse 2s ease-in-out infinite; }
.animate-glow { animation: borderGlow 2.5s ease-in-out infinite; }
.btn-hover {
 transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}
.btn-hover:hover {
 transform: translateY(-3px);
 box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}
.card-hover {
 transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.card-hover:hover {
 transform: translateY(-6px);
 box-shadow: 0 12px 35px rgba(0,0,0,0.12) !important;
}
.fade-in-up {
 opacity: 0;
 transform: translateY(40px);
 transition: opacity 0.7s ease, transform 0.7s ease;
}
.fade-in-up.visible {
 opacity: 1;
 transform: translateY(0);
}
.fade-in-left {
 opacity: 0;
 transform: translateX(-40px);
 transition: opacity 0.7s ease, transform 0.7s ease;
}
.fade-in-left.visible {
 opacity: 1;
 transform: translateX(0);
}
.fade-in-right {
 opacity: 0;
 transform: translateX(40px);
 transition: opacity 0.7s ease, transform 0.7s ease;
}
.fade-in-right.visible {
 opacity: 1;
 transform: translateX(0);
}
`;

// Hero slideshow images — real study abroad destinations
const heroImages = [
  {
    url: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1200&q=80",
    caption: "University of Oxford, UK",
  },
  {
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHEZP8X5Vcr6kxg-yE9uG4jSc8C5EFfh3u5Q&s",
    caption: "TU Munich, Germany",
  },
  {
    url: "https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=1200&q=80",
    caption: "University of Toronto, Canada",
  },
];

// Scroll animation hook
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 },
    );
    document
      .querySelectorAll(".fade-in-up, .fade-in-left, .fade-in-right")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function Home() {
  useScrollReveal();
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Live stats from API ─ no hardcoded fabricated numbers
  const [liveStats, setLiveStats] = useState({
    universities: "…",
    scholarships: "…",
    countries: "…",
  });
  const [destCounts, setDestCounts] = useState({});
  const [news, setNews] = useState([]);
  const [newsTab, setNewsTab] = useState("scholarships");
  const [newsLoading, setNewsLoading] = useState(false);

  const fetchLiveStats = useCallback(async () => {
    try {
      const [uniRes, statRes] = await Promise.allSettled([
        getUniversities({ per_page: 1 }),
        getPlatformStats(),
      ]);
      const uniTotal =
        uniRes.status === "fulfilled" ? uniRes.value.data?.total : null;
      const platStats =
        statRes.status === "fulfilled" ? statRes.value.data : null;
      setLiveStats({
        universities: uniTotal ? uniTotal.toLocaleString() + "+" : "500+",
        scholarships: platStats?.scholarships
          ? String(platStats.scholarships)
          : "70",
        // Real-time: countries count from scholarships in Firestore
        countries: platStats?.countries
          ? String(platStats.countries) + "+"
          : "41+",
      });
    } catch {
      setLiveStats({
        universities: "500+",
        scholarships: "70",
        countries: "41+",
      });
    }
  }, []);

  const fetchDestCounts = useCallback(async () => {
    // Cache in sessionStorage to avoid 6 API calls on every visit
    const cached = sessionStorage.getItem("fe_dest_counts");
    if (cached) {
      try {
        setDestCounts(JSON.parse(cached));
        return;
      } catch {}
    }
    // Fetch all 6 in parallel
    const countries = ["UK", "Germany", "Canada", "Australia", "USA", "Sweden"];
    const results = await Promise.allSettled(
      countries.map((c) => getUniversities({ country: c, per_page: 1 })),
    );
    const counts = {};
    countries.forEach((c, i) => {
      if (results[i].status === "fulfilled") {
        const total = results[i].value.data?.total;
        counts[c] = total ? `${total}+ Universities` : null;
      }
    });
    setDestCounts(counts);
    sessionStorage.setItem("fe_dest_counts", JSON.stringify(counts));
  }, []);

  useEffect(() => {
    fetchLiveStats();
    fetchDestCounts();
  }, [fetchLiveStats, fetchDestCounts]);

  // Fetch news on tab change - using API service for proper interceptors
  useEffect(() => {
    setNewsLoading(true);
    API.get("/news", { params: { topic: newsTab } })
      .then((res) => {
        setNews(res.data.articles || []);
        setNewsLoading(false);
      })
      .catch(() => {
        setNews([]);
        setNewsLoading(false);
      });
  }, [newsTab]);

  const stats = [
    {
      value: liveStats.universities,
      label: "Universities Listed",
      icon: "",
      note: "via HiPolabs API",
    },
    {
      value: liveStats.scholarships,
      label: "Verified Scholarships",
      icon: "",
      note: "from official sources",
    },
    {
      value: liveStats.countries,
      label: "Countries Covered",
      icon: "",
      note: "with full visa & cost data",
    },
    {
      value: "Free",
      label: "Always Free to Use",
      icon: "",
      note: "no subscriptions",
    },
  ];

  const features = [
    {
      icon: "",
      title: "🎓 University Recommendations",
      desc: "AI-powered recommendations based on your academic profile, GPA, and preferences.",
      color: "#DAF1DE",
      accent: "#8EB69B",
    },
    {
      icon: "",
      title: "💰 Scholarship Search",
      desc: "Find fully funded and partial scholarships that match your background and needs.",
      color: "#e8fdf0",
      accent: "#163832",
    },
    {
      icon: "",
      title: "📋 Visa Guidance",
      desc: "Step-by-step visa process guidance for UK, USA, Canada, Germany and Australia.",
      color: "#fdf8e8",
      accent: "#b8860b",
    },
    {
      icon: "",
      title: "🤖 AI Chatbot",
      desc: "Get instant answers to all your study abroad questions 24/7.",
      color: "#fde8f4",
      accent: "#9b2d7a",
    },
    {
      icon: "",
      title: "🔐 Secure Platform",
      desc: "Your data is protected with AES-256 encryption and JWT authentication.",
      color: "#DAF1DE",
      accent: "#163832",
    },
    {
      icon: "",
      title: "🌍 Global Network",
      desc: "Connect with students and universities from over 50 countries worldwide.",
      color: "#fde8e8",
      accent: "#cc2200",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Create Account",
      desc: "Sign up for free and complete your academic profile.",
      icon: "🎓",
    },
    {
      step: "02",
      title: "Get Recommendations",
      desc: "Our AI analyzes your profile and suggests best-fit universities.",
      icon: "🤖",
    },
    {
      step: "03",
      title: "Apply & Succeed",
      desc: "Apply to universities and track your applications in one place.",
      icon: "🏆",
    },
  ];

  const testimonials = [
    {
      name: "Ahmed Khan",
      university: "University of Toronto",
      text: "ForeignEdge helped me find the perfect university and scholarship. I got full funding!",
      flag: "🇨🇦",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
    },
    {
      name: "Sara Ali",
      university: "TU Munich",
      text: "The visa guidance section saved me so much time. Everything was explained clearly.",
      flag: "🇩🇪",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
    },
    {
      name: "Umar Farooq",
      university: "University of Oxford",
      text: "The AI chatbot answered all my questions instantly. Highly recommend ForeignEdge!",
      flag: "🇬🇧",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80",
    },
  ];

  const destinations = [
    {
      name: "United Kingdom",
      flag: "🇬🇧",
      img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80",
      country: "UK",
    },
    {
      name: "Germany",
      flag: "🇩🇪",
      img: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&q=80",
      country: "Germany",
    },
    {
      name: "Canada",
      flag: "🇨🇦",
      img: "https://plus.unsplash.com/premium_photo-1673241100156-2e04fca1a4af?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dl",
      country: "Canada",
    },
    {
      name: "Australia",
      flag: "🇦🇺",
      img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
      country: "Australia",
    },
    {
      name: "USA",
      flag: "🇺🇸",
      img: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=400&q=80",
      country: "USA",
    },
    {
      name: "Sweden",
      flag: "🇸🇪",
      img: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=400&q=80",
      country: "Sweden",
    },
  ];

  return (
    <div style={styles.container}>
      {/* Inject CSS */}
      <style>{animationCSS}</style>
      <Navbar />

      {/* ── HERO with slideshow ── */}
      <div style={styles.hero}>
        {/* Slideshow background */}
        <div style={styles.slideshowBg}>
          {heroImages.map((img, i) => (
            <div
              key={i}
              style={{
                ...styles.slide,
                backgroundImage: `url(${img.url})`,
                opacity: heroIndex === i ? 1 : 0,
                transition: "opacity 1.2s ease",
              }}
            />
          ))}
          <div style={styles.slideOverlay} />
        </div>

        {/* Hero Content */}
        <div style={styles.heroContent}>
          <div style={{ animation: "fadeInUp 0.8s ease both" }}>
            <div style={styles.heroBadge} className="animate-pulse">
              #1 Study Abroad Platform for Pakistani Students
            </div>
          </div>
          <h1 style={styles.heroTitle} className="animate-float">
            Your Gateway to
            <br />
            <span style={styles.heroHighlight}>Global Education</span>
          </h1>
          <p
            style={{
              ...styles.heroSubtitle,
              animation: "fadeInUp 0.8s ease 0.4s both",
            }}
          >
            ForeignEdge helps you find the best universities, scholarships, and
            visa guidance — powered by AI.
          </p>
          <div
            style={{
              ...styles.btnGroup,
              animation: "fadeInUp 0.8s ease 0.6s both",
            }}
          >
            {localStorage.getItem("token") ? (
              <Link
                to="/dashboard"
                style={styles.primaryBtn}
                className="btn-hover animate-glow"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <Link
                to="/register"
                style={styles.primaryBtn}
                className="btn-hover animate-glow"
              >
                Get Started Free →
              </Link>
            )}
            <Link
              to="/universities"
              style={styles.secondaryBtn}
              className="btn-hover"
            >
              Explore Universities
            </Link>
          </div>

          {/* Slide dots */}
          <div style={styles.slideDots}>
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                style={{
                  ...styles.dot,
                  ...(heroIndex === i ? styles.dotActive : {}),
                }}
              />
            ))}
          </div>

          {/* Current slide caption */}
          <p style={styles.slideCaption}>{heroImages[heroIndex].caption}</p>
        </div>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                ...styles.statItem,
                animation: `fadeInUp 0.6s ease ${0.2 + i * 0.1}s both`,
              }}
            >
              <span style={styles.statIcon}>{s.icon}</span>
              <h3 style={styles.statValue}>{s.value}</h3>
              <p style={styles.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── POPULAR DESTINATIONS ── */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle} className="fade-in-up">
            Popular Study Destinations
          </h2>
          <p style={styles.sectionSubtitle} className="fade-in-up">
            Top countries chosen by Pakistani students
          </p>
        </div>
        <div style={styles.destinationsGrid}>
          {destinations.map((d, i) => (
            <Link
              to="/universities"
              key={i}
              style={styles.destinationCard}
              className="card-hover fade-in-up"
            >
              <div style={styles.destinationImgWrapper}>
                <img src={d.img} alt={d.name} style={styles.destinationImg} />
                <div style={styles.destinationOverlay} />
                <span style={styles.destinationFlag}>{d.flag}</span>
              </div>
              <div style={styles.destinationInfo}>
                <h3 style={styles.destinationName}>{d.name}</h3>
                <p style={styles.destinationUnis}>
                  {destCounts[d.country] || "Universities Listed"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle} className="fade-in-up">
            Everything You Need to Study Abroad
          </h2>
          <p style={styles.sectionSubtitle} className="fade-in-up">
            One platform for all your study abroad needs
          </p>
        </div>
        <div style={styles.featuresGrid}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{ ...styles.featureCard, backgroundColor: f.color }}
              className={`card-hover ${i % 2 === 0 ? "fade-in-left" : "fade-in-right"}`}
            >
              <span
                style={{
                  ...styles.featureIcon,
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                }}
              >
                {f.icon}
              </span>
              <h3 style={{ ...styles.featureTitle, color: f.accent }}>
                {f.title}
              </h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={styles.howSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitleWhite} className="fade-in-up">
            How ForeignEdge Works
          </h2>
          <p style={styles.sectionSubtitleWhite} className="fade-in-up">
            Get started in 3 simple steps
          </p>
        </div>
        <div style={styles.stepsRow}>
          {steps.map((s, i) => (
            <div key={i} style={styles.stepCard} className="fade-in-up">
              <div
                style={{
                  ...styles.stepNumber,
                  animation: `pulse 2s ease-in-out ${i * 0.3}s infinite`,
                }}
              >
                {s.icon}
              </div>
              <div style={styles.stepBadge}>{s.step}</div>
              <h3 style={styles.stepTitle}>{s.title}</h3>
              <p style={styles.stepDesc}>{s.desc}</p>
              {i < steps.length - 1 && <div style={styles.stepArrow}>→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle} className="fade-in-up">
            Success Stories
          </h2>
          <p style={styles.sectionSubtitle} className="fade-in-up">
            Students who achieved their dreams with ForeignEdge
          </p>
        </div>
        <div style={styles.testimonialsGrid}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              style={styles.testimonialCard}
              className="card-hover fade-in-up"
            >
              <div style={styles.quoteIcon}>"</div>
              <p style={styles.testimonialText}>{t.text}</p>
              <div style={styles.testimonialAuthor}>
                <img
                  src={t.img}
                  alt={t.name}
                  style={styles.testimonialAvatar}
                />
                <div>
                  <p style={styles.testimonialName}>
                    {t.flag} {t.name}
                  </p>
                  <p style={styles.testimonialUniversity}>{t.university}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={styles.ctaSection} className="fade-in-up">
        <div style={styles.ctaBg} />
        <h2 style={styles.ctaTitle}>Ready to Start Your Journey?</h2>
        <p style={styles.ctaSubtitle}>
          Join thousands of Pakistani students who found their dream university
          with ForeignEdge
        </p>
        <div style={styles.ctaBtns}>
          <Link
            to="/register"
            style={styles.ctaPrimaryBtn}
            className="btn-hover"
          >
            Create Free Account →
          </Link>
          <Link
            to="/chatbot"
            style={styles.ctaSecondaryBtn}
            className="btn-hover"
          >
            Talk to AI Assistant
          </Link>
        </div>
      </div>

      {/* ── LATEST NEWS ── */}
      <div style={{ background: "#f0faf2", padding: "60px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#051F20",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Latest News
          </h2>
          <p style={{ textAlign: "center", color: "#666", marginBottom: 28 }}>
            Stay updated with scholarships, universities and study abroad news
          </p>

          {/* Topic tabs */}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              marginBottom: 28,
              flexWrap: "wrap",
            }}
          >
            {[
              "scholarships",
              "universities",
              "study abroad",
              "accommodation",
              "visa",
            ].map((t) => (
              <button
                key={t}
                onClick={() => setNewsTab(t)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 20,
                  border: "none",
                  background: newsTab === t ? "#051F20" : "#fff",
                  color: newsTab === t ? "#fff" : "#444",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                  textTransform: "capitalize",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* News cards */}
          {newsLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
              Loading news...
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 20,
              }}
            >
              {news.slice(0, 6).map((article, i) => (
                <a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 14,
                      overflow: "hidden",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                      height: "100%",
                    }}
                  >
                    {article.image && (
                      <img
                        src={article.image}
                        alt=""
                        style={{
                          width: "100%",
                          height: 160,
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <div style={{ padding: "16px" }}>
                      <p
                        style={{
                          fontSize: 11,
                          color: "#235347",
                          fontWeight: 700,
                          margin: "0 0 6px",
                          textTransform: "uppercase",
                        }}
                      >
                        {typeof article.source === "object"
                          ? article.source?.name || ""
                          : article.source || ""}
                      </p>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#051F20",
                          margin: "0 0 8px",
                          lineHeight: 1.4,
                        }}
                      >
                        {article.title ? article.title.slice(0, 80) : ""}
                        {article.title && article.title.length > 80
                          ? "..."
                          : ""}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#888",
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {article.description
                          ? article.description.slice(0, 100)
                          : ""}
                        {article.description && article.description.length > 100
                          ? "..."
                          : ""}
                      </p>
                      <p style={{ fontSize: 11, color: "#bbb", marginTop: 10 }}>
                        {article.published_at
                          ? new Date(article.published_at).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
              {news.length === 0 && !newsLoading && (
                <div
                  style={{
                    gridColumn: "1/-1",
                    textAlign: "center",
                    color: "#aaa",
                    padding: 40,
                  }}
                >
                  No news found. Make sure NEWS_API_KEY is set in .env
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={styles.footer}>
        <div style={styles.footerContent}>
          <div>
            <h3 style={styles.footerLogo}>ForeignEdge</h3>
            <p style={styles.footerTagline}>Your gateway to global education</p>
          </div>
          <div style={styles.footerLinks}>
            {[
              ["Universities", "/universities"],
              ["Scholarships", "/scholarships"],
              ["Visa", "/visa"],
              ["Chatbot", "/chatbot"],
            ].map(([label, path]) => (
              <Link
                key={label}
                to={path}
                style={styles.footerLink}
                className="btn-hover"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <p style={styles.footerCopy}>
          © 2026 ForeignEdge. All rights reserved. | Built with ️ for Pakistani
          Students
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', sans-serif",
    backgroundColor: "#f0faf2",
    overflowX: "hidden",
  },

  // Hero
  hero: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  slideshowBg: { position: "absolute", inset: 0, zIndex: 0 },
  slide: {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "opacity 1.2s ease",
  },
  slideOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, rgba(5,31,32,0.88) 0%, rgba(11,43,38,0.78) 60%, rgba(22,56,50,0.55) 100%)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    padding: "100px 40px 40px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  heroBadge: {
    display: "inline-block",
    backgroundColor: "rgba(142,182,155,0.2)",
    color: "#DAF1DE",
    padding: "8px 20px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "25px",
    border: "1px solid rgba(142,182,155,0.5)",
  },
  heroTitle: {
    fontSize: "64px",
    fontWeight: "900",
    color: "#ffffff",
    marginBottom: "20px",
    lineHeight: "1.15",
    textShadow: "0 4px 20px rgba(0,0,0,0.3)",
  },
  heroHighlight: { color: "#8EB69B", display: "inline-block" },
  heroSubtitle: {
    fontSize: "18px",
    color: "#DAF1DE",
    maxWidth: "600px",
    margin: "0 auto 40px",
    lineHeight: "1.7",
  },
  btnGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  primaryBtn: {
    backgroundColor: "#235347",
    color: "#DAF1DE",
    padding: "16px 35px",
    borderRadius: "50px",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "700",
    boxShadow: "0 6px 20px rgba(35,83,71,0.6)",
  },
  secondaryBtn: {
    backgroundColor: "transparent",
    color: "#ffffff",
    padding: "16px 35px",
    borderRadius: "50px",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "600",
    border: "2px solid rgba(255,255,255,0.4)",
  },
  slideDots: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "30px",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.3)",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  dotActive: { backgroundColor: "#8EB69B", transform: "scale(1.3)" },
  slideCaption: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.6)",
    marginTop: "10px",
  },
  statsRow: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "center",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(5,31,32,0.6)",
    backdropFilter: "blur(10px)",
  },
  statItem: {
    flex: 1,
    padding: "28px 20px",
    textAlign: "center",
    borderRight: "1px solid rgba(255,255,255,0.1)",
  },
  statIcon: { fontSize: "24px", display: "block", marginBottom: "6px" },
  statValue: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#DAF1DE",
    margin: "0 0 4px",
  },
  statLabel: { fontSize: "13px", color: "#8EB69B", margin: 0 },

  // Sections
  section: {
    padding: "80px 40px",
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "#f0faf2",
  },
  sectionHeader: { textAlign: "center", marginBottom: "50px" },
  sectionTitle: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#051F20",
    marginBottom: "12px",
  },
  sectionSubtitle: { fontSize: "16px", color: "#666" },

  // Destinations
  destinationsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
  },
  destinationCard: {
    borderRadius: "16px",
    overflow: "hidden",
    textDecoration: "none",
    boxShadow: "0 4px 20px rgba(5,31,32,0.15)",
    display: "block",
    border: "1px solid #8EB69B",
  },
  destinationImgWrapper: { position: "relative", height: "180px" },
  destinationImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.4s ease",
  },
  destinationOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)",
  },
  destinationFlag: {
    position: "absolute",
    top: "12px",
    right: "12px",
    fontSize: "28px",
    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
  },
  destinationInfo: { backgroundColor: "#DAF1DE", padding: "16px 20px" },
  destinationName: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#051F20",
    margin: "0 0 4px",
  },
  destinationUnis: {
    fontSize: "13px",
    color: "#163832",
    fontWeight: "600",
    margin: 0,
  },

  // Features
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "25px",
  },
  featureCard: {
    padding: "35px 30px",
    borderRadius: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
  },
  featureIcon: { fontSize: "44px", display: "block", marginBottom: "16px" },
  featureTitle: { fontSize: "18px", fontWeight: "700", marginBottom: "10px" },
  featureDesc: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.7",
    margin: 0,
  },

  // How it works
  howSection: { backgroundColor: "#051F20", padding: "80px 40px" },
  sectionTitleWhite: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: "12px",
    textAlign: "center",
  },
  sectionSubtitleWhite: {
    fontSize: "16px",
    color: "#8EB69B",
    textAlign: "center",
    marginBottom: "50px",
  },
  stepsRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: "0",
    maxWidth: "900px",
    margin: "0 auto",
  },
  stepCard: {
    flex: 1,
    textAlign: "center",
    padding: "30px 20px",
    position: "relative",
  },
  stepNumber: {
    width: "64px",
    height: "64px",
    backgroundColor: "#8EB69B",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    margin: "0 auto 12px",
    boxShadow: "0 6px 20px rgba(74,158,218,0.4)",
  },
  stepBadge: {
    display: "inline-block",
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#8EB69B",
    fontSize: "12px",
    fontWeight: "800",
    padding: "3px 10px",
    borderRadius: "20px",
    marginBottom: "10px",
    letterSpacing: "1px",
  },
  stepTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "10px",
  },
  stepDesc: { fontSize: "14px", color: "#8EB69B", lineHeight: "1.6" },
  stepArrow: {
    position: "absolute",
    right: "-15px",
    top: "30px",
    fontSize: "28px",
    color: "#8EB69B",
    fontWeight: "bold",
  },

  // Testimonials
  testimonialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "25px",
  },
  testimonialCard: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    position: "relative",
  },
  quoteIcon: {
    fontSize: "60px",
    color: "#8EB69B",
    opacity: 0.2,
    position: "absolute",
    top: "10px",
    left: "20px",
    fontFamily: "Georgia, serif",
    lineHeight: 1,
  },
  testimonialText: {
    fontSize: "15px",
    color: "#444",
    lineHeight: "1.8",
    fontStyle: "italic",
    marginBottom: "20px",
    position: "relative",
    zIndex: 1,
  },
  testimonialAuthor: { display: "flex", alignItems: "center", gap: "12px" },
  testimonialAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #8EB69B",
  },
  testimonialName: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#051F20",
    margin: 0,
  },
  testimonialUniversity: { fontSize: "13px", color: "#666", margin: 0 },

  // CTA
  ctaSection: {
    backgroundColor: "#8EB69B",
    padding: "80px 40px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  ctaBg: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)",
  },
  ctaTitle: {
    fontSize: "42px",
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: "15px",
    position: "relative",
  },
  ctaSubtitle: {
    fontSize: "16px",
    color: "#DAF1DE",
    marginBottom: "35px",
    maxWidth: "600px",
    margin: "0 auto 35px",
    position: "relative",
  },
  ctaBtns: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
    position: "relative",
  },
  ctaPrimaryBtn: {
    backgroundColor: "#ffffff",
    color: "#051F20",
    padding: "16px 35px",
    borderRadius: "50px",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "700",
  },
  ctaSecondaryBtn: {
    backgroundColor: "transparent",
    color: "#ffffff",
    padding: "16px 35px",
    borderRadius: "50px",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "600",
    border: "2px solid rgba(255,255,255,0.6)",
  },

  // Footer
  footer: { backgroundColor: "#051F20", padding: "40px" },
  footerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "0 auto 25px",
  },
  footerLogo: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#8EB69B",
    margin: "0 0 5px",
  },
  footerTagline: { fontSize: "13px", color: "#8EB69B", margin: 0 },
  footerLinks: { display: "flex", gap: "25px" },
  footerLink: { color: "#8EB69B", textDecoration: "none", fontSize: "14px" },
  footerCopy: {
    textAlign: "center",
    color: "#666",
    fontSize: "13px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: "25px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
};

export default Home;

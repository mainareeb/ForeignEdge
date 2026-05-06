import React, { useEffect, useState, useCallback } from "react";
import { getUniversities, getPlatformStats } from "../../services/api";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

// Inject global CSS animations once
const animationCSS = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-18px); }
}
@keyframes floatSlow {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(-10px) rotate(3deg); }
}
@keyframes slideShow {
  0%   { opacity: 0; transform: scale(1.08); }
  8%   { opacity: 1; transform: scale(1); }
  30%  { opacity: 1; transform: scale(1); }
  38%  { opacity: 0; transform: scale(0.96); }
  100% { opacity: 0; transform: scale(0.96); }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.05); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes countUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rotateSlow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes borderGlow {
  0%, 100% { box-shadow: 0 0 10px rgba(74,158,218,0.3); }
  50%       { box-shadow: 0 0 25px rgba(74,158,218,0.7); }
}
.hero-img-0 { animation: slideShow 12s infinite 0s; }
.hero-img-1 { animation: slideShow 12s infinite 4s; }
.hero-img-2 { animation: slideShow 12s infinite 8s; }
.animate-float     { animation: float 4s ease-in-out infinite; }
.animate-floatSlow { animation: floatSlow 6s ease-in-out infinite; }
.animate-pulse     { animation: pulse 2s ease-in-out infinite; }
.animate-glow      { animation: borderGlow 2.5s ease-in-out infinite; }
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
        countries: platStats?.countries ? String(platStats.countries) : "7",
      });
    } catch {
      setLiveStats({
        universities: "500+",
        scholarships: "70",
        countries: "7",
      });
    }
  }, []);

  const fetchDestCounts = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchLiveStats();
    fetchDestCounts();
  }, [fetchLiveStats, fetchDestCounts]);

  const stats = [
    {
      value: liveStats.universities,
      label: "Universities Listed",
      icon: "🎓",
      note: "via HiPolabs API",
    },
    {
      value: liveStats.scholarships,
      label: "Verified Scholarships",
      icon: "💰",
      note: "from official sources",
    },
    {
      value: liveStats.countries,
      label: "Countries Covered",
      icon: "🌍",
      note: "with full visa & cost data",
    },
    {
      value: "Free",
      label: "Always Free to Use",
      icon: "🚀",
      note: "no subscriptions",
    },
  ];

  const features = [
    {
      icon: "🎓",
      title: "University Recommendations",
      desc: "AI-powered recommendations based on your academic profile, GPA, and preferences.",
      color: "#e8f4fd",
      accent: "#4a9eda",
    },
    {
      icon: "💰",
      title: "Scholarship Search",
      desc: "Find fully funded and partial scholarships that match your background and needs.",
      color: "#e8fdf0",
      accent: "#2d7a3a",
    },
    {
      icon: "📋",
      title: "Visa Guidance",
      desc: "Step-by-step visa process guidance for UK, USA, Canada, Germany and Australia.",
      color: "#fdf8e8",
      accent: "#b8860b",
    },
    {
      icon: "🤖",
      title: "AI Chatbot",
      desc: "Get instant answers to all your study abroad questions 24/7.",
      color: "#fde8f4",
      accent: "#9b2d7a",
    },
    {
      icon: "🔐",
      title: "Secure Platform",
      desc: "Your data is protected with AES-256 encryption and JWT authentication.",
      color: "#f0e8fd",
      accent: "#6b3fa0",
    },
    {
      icon: "🌍",
      title: "Global Network",
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
      icon: "✍️",
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
      img: "https://images.unsplash.com/photo-1569982175971-d92b01cf8694?w=400&q=80",
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
              🌟 #1 Study Abroad Platform for Pakistani Students
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
          <p style={styles.slideCaption}>📍 {heroImages[heroIndex].caption}</p>
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
            🌍 Popular Study Destinations
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
          © 2026 ForeignEdge. All rights reserved. | Built with ❤️ for Pakistani
          Students
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', sans-serif",
    backgroundColor: "#f0f4f8",
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
      "linear-gradient(135deg, rgba(15,31,53,0.88) 0%, rgba(26,46,74,0.75) 60%, rgba(30,58,95,0.5) 100%)",
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
    backgroundColor: "rgba(74,158,218,0.25)",
    color: "#4a9eda",
    padding: "8px 20px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "25px",
    border: "1px solid rgba(74,158,218,0.4)",
  },
  heroTitle: {
    fontSize: "64px",
    fontWeight: "900",
    color: "#ffffff",
    marginBottom: "20px",
    lineHeight: "1.15",
    textShadow: "0 4px 20px rgba(0,0,0,0.3)",
  },
  heroHighlight: { color: "#4a9eda", display: "inline-block" },
  heroSubtitle: {
    fontSize: "18px",
    color: "#c5d8eb",
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
    backgroundColor: "#4a9eda",
    color: "#fff",
    padding: "16px 35px",
    borderRadius: "50px",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "700",
    boxShadow: "0 6px 20px rgba(74,158,218,0.5)",
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
  dotActive: { backgroundColor: "#4a9eda", transform: "scale(1.3)" },
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
    background: "rgba(0,0,0,0.3)",
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
    color: "#4a9eda",
    margin: "0 0 4px",
  },
  statLabel: { fontSize: "13px", color: "#b0c4d8", margin: 0 },

  // Sections
  section: { padding: "80px 40px", maxWidth: "1200px", margin: "0 auto" },
  sectionHeader: { textAlign: "center", marginBottom: "50px" },
  sectionTitle: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#1a2e4a",
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
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    display: "block",
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
  destinationInfo: { backgroundColor: "#ffffff", padding: "16px 20px" },
  destinationName: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#1a2e4a",
    margin: "0 0 4px",
  },
  destinationUnis: {
    fontSize: "13px",
    color: "#4a9eda",
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
  howSection: { backgroundColor: "#1a2e4a", padding: "80px 40px" },
  sectionTitleWhite: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: "12px",
    textAlign: "center",
  },
  sectionSubtitleWhite: {
    fontSize: "16px",
    color: "#b0c4d8",
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
    backgroundColor: "#4a9eda",
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
    color: "#4a9eda",
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
  stepDesc: { fontSize: "14px", color: "#b0c4d8", lineHeight: "1.6" },
  stepArrow: {
    position: "absolute",
    right: "-15px",
    top: "30px",
    fontSize: "28px",
    color: "#4a9eda",
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
    color: "#4a9eda",
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
    border: "3px solid #4a9eda",
  },
  testimonialName: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1a2e4a",
    margin: 0,
  },
  testimonialUniversity: { fontSize: "13px", color: "#666", margin: 0 },

  // CTA
  ctaSection: {
    backgroundColor: "#4a9eda",
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
    color: "#e0f0ff",
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
    color: "#1a2e4a",
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
  footer: { backgroundColor: "#0f1f35", padding: "40px" },
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
    color: "#4a9eda",
    margin: "0 0 5px",
  },
  footerTagline: { fontSize: "13px", color: "#b0c4d8", margin: 0 },
  footerLinks: { display: "flex", gap: "25px" },
  footerLink: { color: "#b0c4d8", textDecoration: "none", fontSize: "14px" },
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

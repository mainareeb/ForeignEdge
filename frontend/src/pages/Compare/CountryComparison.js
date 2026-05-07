import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { compareCountries } from "../../services/api";

const COUNTRIES = {
  "United Kingdom": {
    flag: "🇬🇧",
    tuition: "£15,000 – £35,000/year",
    tuitionScore: 2,
    living: "£12,000 – £18,000/year",
    livingScore: 2,
    visaDifficulty: "Moderate",
    visaScore: 3,
    visaFee: "£363",
    processingTime: "3–4 weeks",
    workDuringStudy: "20 hrs/week",
    postStudyWork: "Graduate Route Visa (2 years)",
    language: "English",
    languageBarrier: "None",
    languageScore: 5,
    ieltsRequired: "6.0 – 7.0",
    jobProspects: "Excellent",
    jobScore: 5,
    topUniversities: [
      "University of Oxford",
      "University of Cambridge",
      "Imperial College London",
      "UCL",
      "University of Edinburgh",
    ],
    popularFields: ["Business", "Law", "Medicine", "Engineering", "Finance"],
    climate: "Mild & Rainy",
    currency: "GBP (£)",
    scholarships: ["Chevening", "Commonwealth", "Gates Cambridge"],
    color: "#163832",
  },
  "United States": {
    flag: "🇺🇸",
    tuition: "$20,000 – $60,000/year",
    tuitionScore: 1,
    living: "$15,000 – $25,000/year",
    livingScore: 1,
    visaDifficulty: "Moderate",
    visaScore: 3,
    visaFee: "$185",
    processingTime: "2–4 weeks",
    workDuringStudy: "20 hrs/week (on campus)",
    postStudyWork: "OPT (1–3 years)",
    language: "English",
    languageBarrier: "None",
    languageScore: 5,
    ieltsRequired: "6.5 – 7.5",
    jobProspects: "Excellent",
    jobScore: 5,
    topUniversities: [
      "MIT",
      "Harvard University",
      "Stanford University",
      "Yale University",
      "Princeton University",
    ],
    popularFields: [
      "Computer Science",
      "Business",
      "Engineering",
      "Medicine",
      "Data Science",
    ],
    climate: "Varies by state",
    currency: "USD ($)",
    scholarships: ["Fulbright", "Hubert Humphrey", "AAUW"],
    color: "#b22234",
  },
  Canada: {
    flag: "🇨🇦",
    tuition: "CAD $15,000 – $35,000/year",
    tuitionScore: 3,
    living: "CAD $12,000 – $18,000/year",
    livingScore: 3,
    visaDifficulty: "Easy",
    visaScore: 4,
    visaFee: "CAD $150",
    processingTime: "4–8 weeks",
    workDuringStudy: "20 hrs/week",
    postStudyWork: "PGWP (up to 3 years)",
    language: "English / French",
    languageBarrier: "None",
    languageScore: 5,
    ieltsRequired: "6.0 – 7.0",
    jobProspects: "Very Good",
    jobScore: 4,
    topUniversities: [
      "University of Toronto",
      "McGill University",
      "UBC",
      "University of Waterloo",
      "University of Alberta",
    ],
    popularFields: [
      "Computer Science",
      "Engineering",
      "Business",
      "Medicine",
      "Data Science",
    ],
    climate: "Cold winters",
    currency: "CAD ($)",
    scholarships: ["Vanier CGS", "IDRC", "Ontario Trillium"],
    color: "#cc0000",
  },
  Germany: {
    flag: "🇩🇪",
    tuition: "€0 – €3,000/year",
    tuitionScore: 5,
    living: "€10,000 – €14,000/year",
    livingScore: 4,
    visaDifficulty: "Moderate",
    visaScore: 3,
    visaFee: "€75",
    processingTime: "4–6 weeks",
    workDuringStudy: "120 full days/year",
    postStudyWork: "18-month job seeker visa",
    language: "German (English programs available)",
    languageBarrier: "Moderate",
    languageScore: 3,
    ieltsRequired: "6.0 – 6.5",
    jobProspects: "Very Good",
    jobScore: 4,
    topUniversities: [
      "TU Munich",
      "Heidelberg University",
      "Humboldt University",
      "LMU Munich",
      "KIT Karlsruhe",
    ],
    popularFields: [
      "Engineering",
      "Computer Science",
      "Medicine",
      "Architecture",
      "Sciences",
    ],
    climate: "Cold winters, mild summers",
    currency: "EUR (€)",
    scholarships: ["DAAD", "Deutschlandstipendium", "Heinrich Böll"],
    color: "#2d2d2d",
  },
  Australia: {
    flag: "🇦🇺",
    tuition: "AUD $20,000 – $45,000/year",
    tuitionScore: 2,
    living: "AUD $18,000 – $24,000/year",
    livingScore: 2,
    visaDifficulty: "Easy",
    visaScore: 5,
    visaFee: "AUD $650",
    processingTime: "1–4 weeks",
    workDuringStudy: "48 hrs/fortnight",
    postStudyWork: "PSW Visa (2–4 years)",
    language: "English",
    languageBarrier: "None",
    languageScore: 5,
    ieltsRequired: "6.0 – 7.0",
    jobProspects: "Very Good",
    jobScore: 4,
    topUniversities: [
      "University of Melbourne",
      "University of Sydney",
      "ANU",
      "University of Queensland",
      "Monash University",
    ],
    popularFields: ["Business", "Engineering", "Medicine", "IT", "Hospitality"],
    climate: "Warm & Sunny",
    currency: "AUD ($)",
    scholarships: ["Australia Awards", "Endeavour", "RTP"],
    color: "#00693e",
  },
  Sweden: {
    flag: "🇸🇪",
    tuition: "€8,000 – €18,000/year",
    tuitionScore: 4,
    living: "€10,000 – €14,000/year",
    livingScore: 4,
    visaDifficulty: "Easy",
    visaScore: 4,
    visaFee: "SEK 1,500",
    processingTime: "1–3 months",
    workDuringStudy: "Unlimited hrs",
    postStudyWork: "6-month job seeker permit",
    language: "Swedish (English widely spoken)",
    languageBarrier: "Low",
    languageScore: 4,
    ieltsRequired: "6.5",
    jobProspects: "Good",
    jobScore: 3,
    topUniversities: [
      "Lund University",
      "KTH Royal Institute",
      "Stockholm University",
      "Uppsala University",
      "Chalmers University",
    ],
    popularFields: [
      "Engineering",
      "Computer Science",
      "Design",
      "Sustainability",
      "Business",
    ],
    climate: "Cold, long winters",
    currency: "SEK (kr)",
    scholarships: ["SISGP", "Erasmus+", "SIDA"],
    color: "#163832",
  },
  France: {
    flag: "🇫🇷",
    tuition: "€170 – €15,000/year",
    tuitionScore: 5,
    living: "€12,000 – £18,000/year",
    livingScore: 3,
    visaDifficulty: "Moderate",
    visaScore: 3,
    visaFee: "€99",
    processingTime: "3–5 weeks",
    workDuringStudy: "964 hrs/year",
    postStudyWork: "APS Visa (1–2 years)",
    language: "French (some English programs)",
    languageBarrier: "High",
    languageScore: 2,
    ieltsRequired: "6.0 – 6.5",
    jobProspects: "Good",
    jobScore: 3,
    topUniversities: [
      "Paris Sciences et Lettres",
      "Sorbonne University",
      "Ecole Polytechnique",
      "Sciences Po",
      "University of Paris",
    ],
    popularFields: ["Fashion", "Business", "Engineering", "Arts", "Culinary"],
    climate: "Mild, warm summers",
    currency: "EUR (€)",
    scholarships: ["Eiffel Excellence", "Erasmus+", "MOPGA"],
    color: "#0055a4",
  },
  Netherlands: {
    flag: "🇳🇱",
    tuition: "€8,000 – £20,000/year",
    tuitionScore: 3,
    living: "€11,000 – €16,000/year",
    livingScore: 3,
    visaDifficulty: "Easy",
    visaScore: 4,
    visaFee: "€192",
    processingTime: "2–4 weeks",
    workDuringStudy: "16 hrs/week",
    postStudyWork: "Orientation Year Visa (1 year)",
    language: "Dutch (many English programs)",
    languageBarrier: "Low",
    languageScore: 4,
    ieltsRequired: "6.0 – 7.0",
    jobProspects: "Very Good",
    jobScore: 4,
    topUniversities: [
      "University of Amsterdam",
      "TU Delft",
      "Leiden University",
      "Utrecht University",
      "Erasmus University",
    ],
    popularFields: [
      "Business",
      "Engineering",
      "Computer Science",
      "Law",
      "Social Sciences",
    ],
    climate: "Mild & Rainy",
    currency: "EUR (€)",
    scholarships: ["Holland Scholarship", "Erasmus+", "Orange Tulip"],
    color: "#ae1c28",
  },
  Norway: {
    flag: "🇳🇴",
    tuition: "Free (semester fee ~NOK 600)",
    tuitionScore: 5,
    living: "NOK 120,000 – 160,000/year",
    livingScore: 2,
    visaDifficulty: "Easy",
    visaScore: 4,
    visaFee: "NOK 5,900",
    processingTime: "3–5 weeks",
    workDuringStudy: "20 hrs/week",
    postStudyWork: "1-year job seeker visa",
    language: "Norwegian (English programs available)",
    languageBarrier: "Low",
    languageScore: 4,
    ieltsRequired: "6.0 – 6.5",
    jobProspects: "Good",
    jobScore: 3,
    topUniversities: [
      "University of Oslo",
      "NTNU",
      "University of Bergen",
      "UiT",
      "BI Norwegian",
    ],
    popularFields: [
      "Engineering",
      "Marine Sciences",
      "Energy",
      "Business",
      "Medicine",
    ],
    climate: "Very cold",
    currency: "NOK (kr)",
    scholarships: ["Quota Scheme", "Erasmus+", "Research Council"],
    color: "#ef2b2d",
  },
  Japan: {
    flag: "🇯🇵",
    tuition: "$5,000 – $12,000/year",
    tuitionScore: 4,
    living: "$10,000 – $15,000/year",
    livingScore: 3,
    visaDifficulty: "Easy",
    visaScore: 4,
    visaFee: "¥3,000",
    processingTime: "1–3 months",
    workDuringStudy: "28 hrs/week",
    postStudyWork: "Job change visa (up to 2 years)",
    language: "Japanese (some English programs)",
    languageBarrier: "High",
    languageScore: 2,
    ieltsRequired: "5.5 – 6.5",
    jobProspects: "Good",
    jobScore: 3,
    topUniversities: [
      "University of Tokyo",
      "Kyoto University",
      "Osaka University",
      "Tohoku University",
      "Tokyo Institute of Technology",
    ],
    popularFields: [
      "Engineering",
      "Technology",
      "Medicine",
      "Robotics",
      "Business",
    ],
    climate: "4 seasons, humid summers",
    currency: "JPY (¥)",
    scholarships: ["MEXT", "JASSO", "ADB-JSP"],
    color: "#bc002d",
  },
  Malaysia: {
    flag: "🇲🇾",
    tuition: "$3,000 – $8,000/year",
    tuitionScore: 5,
    living: "$5,000 – $9,000/year",
    livingScore: 5,
    visaDifficulty: "Easy",
    visaScore: 5,
    visaFee: "MYR 500",
    processingTime: "2–4 weeks",
    workDuringStudy: "20 hrs/week",
    postStudyWork: "Employment pass available",
    language: "English & Malay",
    languageBarrier: "None",
    languageScore: 5,
    ieltsRequired: "5.5 – 6.0",
    jobProspects: "Moderate",
    jobScore: 3,
    topUniversities: [
      "University of Malaya",
      "Universiti Putra Malaysia",
      "UTM",
      "UKM",
      "Sunway University",
    ],
    popularFields: ["Business", "Engineering", "IT", "Medicine", "Hospitality"],
    climate: "Tropical, hot & humid",
    currency: "MYR (RM)",
    scholarships: ["MIS", "KPT Scholarship", "Commonwealth"],
    color: "#cc0001",
  },
  Turkey: {
    flag: "🇹🇷",
    tuition: "$1,000 – $6,000/year",
    tuitionScore: 5,
    living: "$6,000 – $10,000/year",
    livingScore: 5,
    visaDifficulty: "Easy",
    visaScore: 5,
    visaFee: "$50",
    processingTime: "2–3 weeks",
    workDuringStudy: "Limited (permit needed)",
    postStudyWork: "Work permit available",
    language: "Turkish (some English programs)",
    languageBarrier: "Moderate",
    languageScore: 3,
    ieltsRequired: "5.5 – 6.5",
    jobProspects: "Moderate",
    jobScore: 2,
    topUniversities: [
      "METU",
      "Bogazici University",
      "Istanbul Technical University",
      "Bilkent University",
      "Sabanci University",
    ],
    popularFields: [
      "Engineering",
      "Medicine",
      "Business",
      "Architecture",
      "Social Sciences",
    ],
    climate: "Varies, hot summers",
    currency: "TRY (₺)",
    scholarships: ["Türkiye Bursları", "YTB Scholarship", "TÜBA"],
    color: "#e30a17",
  },
  China: {
    flag: "🇨🇳",
    tuition: "$2,000 – $10,000/year",
    tuitionScore: 5,
    living: "$5,000 – $9,000/year",
    livingScore: 5,
    visaDifficulty: "Moderate",
    visaScore: 3,
    visaFee: "$140",
    processingTime: "4–6 weeks",
    workDuringStudy: "Limited (permit needed)",
    postStudyWork: "Work permit available",
    language: "Mandarin (some English programs)",
    languageBarrier: "High",
    languageScore: 2,
    ieltsRequired: "5.5 – 6.5",
    jobProspects: "Good",
    jobScore: 3,
    topUniversities: [
      "Tsinghua University",
      "Peking University",
      "Fudan University",
      "Zhejiang University",
      "Shanghai Jiao Tong",
    ],
    popularFields: [
      "Engineering",
      "Business",
      "Medicine",
      "Technology",
      "Arts",
    ],
    climate: "Varies widely by region",
    currency: "CNY (¥)",
    scholarships: [
      "CSC Scholarship",
      "HSK Scholarship",
      "Provincial Scholarships",
    ],
    color: "#de2910",
  },
  Italy: {
    flag: "🇮🇹",
    tuition: "€900 – €5,000/year",
    tuitionScore: 5,
    living: "€9,000 – £14,000/year",
    livingScore: 4,
    visaDifficulty: "Moderate",
    visaScore: 3,
    visaFee: "€50",
    processingTime: "3–5 weeks",
    workDuringStudy: "20 hrs/week",
    postStudyWork: "1-year job seeker visa",
    language: "Italian (some English programs)",
    languageBarrier: "High",
    languageScore: 2,
    ieltsRequired: "5.5 – 6.5",
    jobProspects: "Moderate",
    jobScore: 3,
    topUniversities: [
      "University of Bologna",
      "Sapienza University",
      "Politecnico di Milano",
      "University of Milan",
      "University of Padua",
    ],
    popularFields: [
      "Architecture",
      "Fashion",
      "Engineering",
      "Arts",
      "Medicine",
    ],
    climate: "Mediterranean, warm",
    currency: "EUR (€)",
    scholarships: ["DSU Scholarships", "Erasmus+", "Italian Government"],
    color: "#009246",
  },
  Singapore: {
    flag: "🇸🇬",
    tuition: "$15,000 – $30,000/year",
    tuitionScore: 3,
    living: "$18,000 – $25,000/year",
    livingScore: 2,
    visaDifficulty: "Easy",
    visaScore: 5,
    visaFee: "SGD $90",
    processingTime: "1–2 weeks",
    workDuringStudy: "16 hrs/week",
    postStudyWork: "Employment pass available",
    language: "English",
    languageBarrier: "None",
    languageScore: 5,
    ieltsRequired: "6.0 – 7.0",
    jobProspects: "Excellent",
    jobScore: 5,
    topUniversities: ["NUS", "NTU", "SMU", "SUTD", "SIM"],
    popularFields: [
      "Business",
      "Engineering",
      "Finance",
      "Computer Science",
      "Medicine",
    ],
    climate: "Tropical, hot & humid",
    currency: "SGD ($)",
    scholarships: ["ASEAN Scholarship", "NUS Merit", "MOE Scholarship"],
    color: "#ef3340",
  },
};

const COUNTRY_NAMES = Object.keys(COUNTRIES).sort();

function ScoreBar({ score, color }) {
  return (
    <div style={styles.scoreBarBg}>
      <div
        style={{
          ...styles.scoreBarFill,
          width: `${score * 20}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

function SearchBar({ label, value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 1) {
      const filtered = COUNTRY_NAMES.filter((c) =>
        c.toLowerCase().includes(val.toLowerCase()),
      ).slice(0, 6);
      setSuggestions(filtered);
      setOpen(true);
    } else {
      setSuggestions([]);
      setOpen(false);
      onChange(null);
    }
  };

  const handleSelect = (country) => {
    setQuery(country);
    setOpen(false);
    onChange(country);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    onChange(null);
  };

  const selected = COUNTRIES[value];

  return (
    <div style={styles.searchWrapper} ref={ref}>
      <label style={styles.searchLabel}>{label}</label>
      <div
        style={{
          ...styles.searchInputWrap,
          borderColor: selected ? selected.color : "#e0e9f0",
        }}
      >
        {selected && <span style={styles.searchFlag}>{selected.flag}</span>}
        <input
          value={query}
          onChange={handleInput}
          onFocus={() => query.length >= 1 && setOpen(true)}
          placeholder={placeholder}
          style={styles.searchInput}
        />
        {query && (
          <button onClick={handleClear} style={styles.clearBtn}>
            ✕
          </button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div style={styles.dropdown}>
          {suggestions.map((c) => (
            <div
              key={c}
              onClick={() => handleSelect(c)}
              style={styles.dropdownItem}
            >
              <span style={styles.dropdownFlag}>{COUNTRIES[c].flag}</span>
              <span style={styles.dropdownName}>{c}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CountryComparison() {
  const navigate = useNavigate();
  const [selections, setSelections] = useState([null, null, null]);
  const [liveData, setLiveData] = useState({});

  const fetchLive = useCallback(async (countries) => {
    const valid = countries.filter(Boolean);
    if (valid.length === 0) return;
    // Map display names to backend keys
    const keyMap = {
      "United Kingdom": "UK",
      "United States": "USA",
      Canada: "Canada",
      Germany: "Germany",
      Australia: "Australia",
      Sweden: "Sweden",
      France: "France",
      Netherlands: "Netherlands",
      Japan: "Japan",
      Malaysia: "Malaysia",
      Turkey: "Turkey",
      China: "China",
      Singapore: "Singapore",
      Norway: "Norway",
      Italy: "Italy",
    };
    const backendKeys = valid.map((c) => keyMap[c]).filter(Boolean);
    if (backendKeys.length === 0) return;
    try {
      const res = await compareCountries(backendKeys);
      setLiveData(res.data.comparison || {});
    } catch (e) {
      // silently keep static data
    }
  }, []);

  useEffect(() => {
    if (selections.some(Boolean)) fetchLive(selections);
  }, [selections, fetchLive]);

  // Merge live data into static COUNTRIES entry
  const getMergedData = (key) => {
    const base = COUNTRIES[key];
    if (!base) return null;
    const keyMap = {
      "United Kingdom": "UK",
      "United States": "USA",
      Canada: "Canada",
      Germany: "Germany",
      Australia: "Australia",
      Sweden: "Sweden",
      Japan: "Japan",
      Netherlands: "Netherlands",
    };
    const bk = keyMap[key];
    const live = bk && liveData[bk];
    if (!live) return base;
    return {
      ...base,
      visaFee: live.visa_fee || base.visaFee,
      processingTime: live.visa_processing || base.processingTime,
      living: live.monthly_living_cost
        ? `${live.accommodation_currency} ${live.monthly_living_cost}/mo`
        : base.living,
    };
  };

  const setCountry = (index, country) => {
    const updated = [...selections];
    updated[index] = country;
    setSelections(updated);
  };

  const cols = selections
    .filter(Boolean)
    .map((k) => ({ key: k, data: getMergedData(k) }))
    .filter((c) => c.data);

  const rows = [
    {
      label: "Annual Tuition",
      key: "tuition",
      scoreKey: "tuitionScore",
      icon: "🎓",
    },
    {
      label: "Cost of Living",
      key: "living",
      scoreKey: "livingScore",
      icon: "🏠",
    },
    {
      label: "Visa Difficulty",
      key: "visaDifficulty",
      scoreKey: "visaScore",
      icon: "📋",
    },
    { label: "Visa Fee", key: "visaFee", scoreKey: null, icon: "💳" },
    {
      label: "Processing Time",
      key: "processingTime",
      scoreKey: null,
      icon: "⏱️",
    },
    {
      label: "Work During Study",
      key: "workDuringStudy",
      scoreKey: null,
      icon: "💼",
    },
    {
      label: "Post-Study Work",
      key: "postStudyWork",
      scoreKey: null,
      icon: "🌍",
    },
    {
      label: "Language",
      key: "language",
      scoreKey: "languageScore",
      icon: "🗣️",
    },
    {
      label: "Language Barrier",
      key: "languageBarrier",
      scoreKey: null,
      icon: "🚧",
    },
    {
      label: "IELTS Required",
      key: "ieltsRequired",
      scoreKey: null,
      icon: "📝",
    },
    {
      label: "Job Prospects",
      key: "jobProspects",
      scoreKey: "jobScore",
      icon: "💰",
    },
    { label: "Currency", key: "currency", scoreKey: null, icon: "💵" },
    { label: "Climate", key: "climate", scoreKey: null, icon: "🌤️" },
  ];

  const colCount = Math.max(cols.length, 1);
  const gridCols = `220px repeat(${colCount}, 1fr)`;

  return (
    <div style={styles.container} className="fe-page">
      <Navbar />

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <p style={styles.heroEyebrow}>Study Abroad Tool</p>
          <h1 style={styles.heroTitle}>Country Comparison</h1>
          <p style={styles.heroSubtitle}>
            Search and compare up to 3 study destinations side by side —
            tuition, visa, living costs, job prospects and more.
          </p>
        </div>
      </div>

      <div style={styles.wrapper}>
        {/* Search Section */}
        <div style={styles.searchCard}>
          <div style={styles.searchCardHeader}>
            <span style={styles.searchCardIcon}>🔍</span>
            <div>
              <h3 style={styles.searchCardTitle}>Search Countries</h3>
              <p style={styles.searchCardSub}>
                Type a country name in each field below — 15+ countries
                available
              </p>
            </div>
          </div>
          <div style={styles.searchRow}>
            <SearchBar
              label="Country 1"
              value={selections[0]}
              onChange={(v) => setCountry(0, v)}
              placeholder="e.g. Germany"
            />
            <SearchBar
              label="Country 2"
              value={selections[1]}
              onChange={(v) => setCountry(1, v)}
              placeholder="e.g. Canada"
            />
            <SearchBar
              label="Country 3"
              value={selections[2]}
              onChange={(v) => setCountry(2, v)}
              placeholder="e.g. Australia"
            />
          </div>
        </div>

        {/* Empty state */}
        {cols.length === 0 && (
          <div style={styles.emptyBox}>
            <p style={styles.emptyEmoji}>🌍</p>
            <p style={styles.emptyTitle}>
              Search for countries above to compare
            </p>
            <p style={styles.emptySub}>
              Available: UK, USA, Canada, Germany, Australia, Sweden, France,
              Netherlands, Norway, Japan, Malaysia, Turkey, China, Italy,
              Singapore
            </p>
          </div>
        )}

        {/* Comparison Table */}
        {cols.length > 0 && (
          <>
            <div style={styles.tableWrap}>
              {/* Table Header */}
              <div
                style={{ ...styles.tableHeader, gridTemplateColumns: gridCols }}
              >
                <div style={styles.thLabel}>Category</div>
                {cols.map(({ key, data }) => (
                  <div
                    key={key}
                    style={{
                      ...styles.thCol,
                      borderTop: `4px solid ${data.color}`,
                    }}
                  >
                    <span style={styles.thFlag}>{data.flag}</span>
                    <span style={{ ...styles.thName, color: data.color }}>
                      {key}
                    </span>
                    {liveData[
                      {
                        "United Kingdom": "UK",
                        "United States": "USA",
                        Canada: "Canada",
                        Germany: "Germany",
                        Australia: "Australia",
                        Sweden: "Sweden",
                        Japan: "Japan",
                        Netherlands: "Netherlands",
                      }[key]
                    ] && (
                      <span
                        style={{
                          fontSize: 10,
                          background: "#e6f4ea",
                          color: "#163832",
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontWeight: 600,
                          marginTop: 4,
                          display: "inline-block",
                        }}
                      >
                        ● Live
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Data Rows */}
              {rows.map((row, ri) => (
                <div
                  key={ri}
                  style={{
                    ...styles.tableRow,
                    gridTemplateColumns: gridCols,
                    backgroundColor: ri % 2 === 0 ? "#ffffff" : "#f8fafc",
                  }}
                >
                  <div style={styles.rowLabel}>
                    <span style={styles.rowIcon}>{row.icon}</span>
                    <span style={styles.rowText}>{row.label}</span>
                  </div>
                  {cols.map(({ key, data }) => (
                    <div key={key} style={styles.rowCell}>
                      <span style={styles.cellVal}>{data[row.key]}</span>
                      {row.scoreKey && (
                        <ScoreBar
                          score={data[row.scoreKey]}
                          color={data.color}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* Top Universities */}
              <div
                style={{
                  ...styles.tableRow,
                  gridTemplateColumns: gridCols,
                  backgroundColor: "#f0faf2",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ ...styles.rowLabel, paddingTop: "18px" }}>
                  <span style={styles.rowIcon}>🏛️</span>
                  <span style={styles.rowText}>Top Universities</span>
                </div>
                {cols.map(({ key, data }) => (
                  <div key={key} style={{ ...styles.rowCell, gap: "4px" }}>
                    {data.topUniversities.map((u, i) => (
                      <div key={i} style={styles.listItem}>
                        <span
                          style={{
                            ...styles.listDot,
                            backgroundColor: data.color,
                          }}
                        />
                        {u}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Popular Fields */}
              <div
                style={{
                  ...styles.tableRow,
                  gridTemplateColumns: gridCols,
                  backgroundColor: "#ffffff",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ ...styles.rowLabel, paddingTop: "18px" }}>
                  <span style={styles.rowIcon}>📚</span>
                  <span style={styles.rowText}>Popular Fields</span>
                </div>
                {cols.map(({ key, data }) => (
                  <div
                    key={key}
                    style={{
                      ...styles.rowCell,
                      flexWrap: "wrap",
                      flexDirection: "row",
                      gap: "6px",
                    }}
                  >
                    {data.popularFields.map((f, i) => (
                      <span
                        key={i}
                        style={{
                          ...styles.fieldPill,
                          backgroundColor: data.color + "18",
                          color: data.color,
                          border: `1px solid ${data.color}40`,
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                ))}
              </div>

              {/* Scholarships */}
              <div
                style={{
                  ...styles.tableRow,
                  gridTemplateColumns: gridCols,
                  backgroundColor: "#f8fafc",
                  alignItems: "flex-start",
                  borderBottom: "none",
                }}
              >
                <div style={{ ...styles.rowLabel, paddingTop: "18px" }}>
                  <span style={styles.rowIcon}>🏆</span>
                  <span style={styles.rowText}>Key Scholarships</span>
                </div>
                {cols.map(({ key, data }) => (
                  <div key={key} style={{ ...styles.rowCell, gap: "6px" }}>
                    {data.scholarships.map((s, i) => (
                      <div key={i} style={styles.schItem}>
                        🏅 {s}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={styles.backRow}>
          <button onClick={() => navigate("/")} style={styles.backBtn}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Segoe UI, sans-serif",
    backgroundColor: "#f0f4f8",
    minHeight: "100vh",
  },
  hero: {
    background:
      "linear-gradient(135deg, #051F20 0%, #051F20 60%, #0B2B26 100%)",
    padding: "60px 40px",
  },
  heroInner: { maxWidth: "700px", margin: "0 auto", textAlign: "center" },
  heroEyebrow: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#8EB69B",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: "0 0 12px",
  },
  heroTitle: {
    fontSize: "38px",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 0 14px",
    letterSpacing: "-0.5px",
  },
  heroSubtitle: {
    fontSize: "16px",
    color: "#8EB69B",
    margin: 0,
    lineHeight: "1.7",
  },
  wrapper: { padding: "35px 40px", maxWidth: "1100px", margin: "0 auto" },
  searchCard: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "28px 32px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
    marginBottom: "28px",
  },
  searchCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "22px",
  },
  searchCardIcon: { fontSize: "28px" },
  searchCardTitle: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#051F20",
    margin: "0 0 3px",
  },
  searchCardSub: { fontSize: "13px", color: "#888", margin: 0 },
  searchRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "20px",
  },
  searchWrapper: { position: "relative" },
  searchLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: "700",
    color: "#051F20",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  searchInputWrap: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    border: "2px solid #e0e9f0",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "border-color 0.2s",
  },
  searchFlag: { padding: "0 10px", fontSize: "20px", flexShrink: 0 },
  searchInput: {
    flex: 1,
    padding: "13px 14px",
    border: "none",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "transparent",
    color: "#051F20",
  },
  clearBtn: {
    background: "none",
    border: "none",
    padding: "0 12px",
    fontSize: "14px",
    color: "#aaa",
    cursor: "pointer",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    border: "1.5px solid #e0e9f0",
    borderRadius: "12px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
    zIndex: 100,
    overflow: "hidden",
    marginTop: "4px",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 16px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#051F20",
    transition: "background 0.15s",
  },
  dropdownFlag: { fontSize: "18px" },
  dropdownName: { fontWeight: "500" },
  emptyBox: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "70px 40px",
    textAlign: "center",
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    marginBottom: "30px",
  },
  emptyEmoji: { fontSize: "52px", margin: "0 0 16px" },
  emptyTitle: {
    fontSize: "19px",
    fontWeight: "800",
    color: "#051F20",
    margin: "0 0 10px",
  },
  emptySub: {
    fontSize: "14px",
    color: "#888",
    maxWidth: "520px",
    margin: "0 auto",
    lineHeight: "1.6",
  },
  tableWrap: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
    overflow: "hidden",
    marginBottom: "30px",
  },
  tableHeader: { display: "grid", borderBottom: "2px solid #f0faf2" },
  thLabel: {
    padding: "20px 22px",
    backgroundColor: "#f8fafc",
    fontSize: "12px",
    fontWeight: "700",
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  thCol: {
    padding: "18px 20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#fafcff",
  },
  thFlag: { fontSize: "34px" },
  thName: { fontSize: "15px", fontWeight: "800" },
  tableRow: { display: "grid", borderBottom: "1px solid #f0f4f8" },
  rowLabel: {
    padding: "15px 20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderRight: "1px solid #f0f4f8",
  },
  rowIcon: { fontSize: "16px", flexShrink: 0 },
  rowText: { fontSize: "13px", fontWeight: "600", color: "#051F20" },
  rowCell: {
    padding: "14px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    justifyContent: "center",
  },
  cellVal: {
    fontSize: "13px",
    color: "#333",
    fontWeight: "500",
    lineHeight: "1.5",
  },
  scoreBarBg: {
    height: "5px",
    backgroundColor: "#f0f4f8",
    borderRadius: "3px",
    overflow: "hidden",
  },
  scoreBarFill: { height: "100%", borderRadius: "3px" },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#444",
    lineHeight: "1.9",
  },
  listDot: { width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0 },
  fieldPill: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  schItem: { fontSize: "12px", color: "#555", lineHeight: "1.9" },
  backRow: { marginBottom: "40px" },
  backBtn: {
    backgroundColor: "#ffffff",
    color: "#051F20",
    border: "1.5px solid #e0e9f0",
    padding: "12px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
};

export default CountryComparison;

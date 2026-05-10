/**
 * AppContext.js
 * =============
 * Global shared state for ForeignEdge.
 * Connects all 10 pages so data flows between them:
 *
 *   Universities page  → select a university → auto-populates:
 *     - ApplicationTracker (pre-filled university/country)
 *     - Scholarships (filtered to same country)
 *     - Visa (country pre-selected)
 *     - Accommodation (country pre-selected)
 *
 *   Scholarships page → select a scholarship → auto-populates:
 *     - DeadlineReminders (deadline pre-filled)
 *     - ApplicationTracker (scholarship name + country)
 *
 *   SOP Builder → uses saved profile data + selected university
 *
 *   Compare page → reads live data for selected countries
 *
 * All data loaded from real APIs — no hardcoded content in context.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { getUniversities, getUserProfile } from "../services/api";
import API from "../services/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── Selected country (drives cross-page filtering) ───────────────────────
  const [selectedCountry, setSelectedCountry] = useState("All");

  // ── Selected university (clicked from Universities page) ─────────────────
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  // { name, country, website, source, scholarships_url, visa_url, accommodation_url }

  // ── Selected scholarship (clicked from Scholarships page) ────────────────
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  // { name, country, amount, deadline, link, tracker_prefill }

  // ── User profile (loaded once on login) ─────────────────────────────────
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Quick add intents (cross-page pre-fill) ──────────────────────────────
  // When user clicks "Track This Application" on a university card,
  // this gets set and Tracker page reads it to pre-fill the form.
  const [trackerPrefill, setTrackerPrefill] = useState(null);

  // When user clicks "Set Reminder" on a scholarship card,
  // this gets set and Reminders page reads it to pre-fill.
  const [reminderPrefill, setReminderPrefill] = useState(null);

  // When user clicks "Write SOP" on a university card,
  // this pre-fills the SOP builder.
  const [sopPrefill, setSopPrefill] = useState(null);

  // ── Global data counts (for dashboard + home) ────────────────────────────
  const [globalStats, setGlobalStats] = useState({
    universities: null,
    scholarships: null,
    countries: null,
  });

  // ── Exchange rates (shared across accommodation + compare pages) ─────────
  const [exchangeRates, setExchangeRates] = useState(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Load user profile when token present
  // ─────────────────────────────────────────────────────────────────────────
  const loadUserProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    // Use sessionStorage cache to avoid re-fetching on every navigation
    const cachedProfile = sessionStorage.getItem("fe_user_profile");
    if (cachedProfile) {
      try {
        setUserProfile(JSON.parse(cachedProfile));
        setProfileLoading(false);
        return;
      } catch {}
    }
    setProfileLoading(true);
    try {
      const res = await getUserProfile();
      setUserProfile(res.data);
      sessionStorage.setItem("fe_user_profile", JSON.stringify(res.data));
    } catch {
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []); // removed profileLoading dep to prevent infinite loop

  // Clear cache on logout
  const clearProfileCache = () => {
    sessionStorage.removeItem("fe_user_profile");
    sessionStorage.removeItem("fe_global_stats");
    sessionStorage.removeItem("fe_exchange_rates");
  };

  useEffect(() => {
    loadUserProfile();
  }, []); // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────────────
  // Load global stats (universities count, scholarships count)
  // ─────────────────────────────────────────────────────────────────────────
  const loadGlobalStats = useCallback(async () => {
    try {
      const [uniRes, statsRes] = await Promise.allSettled([
        getUniversities({ per_page: 1 }),
        API.get("/stats"),
      ]);
      const uniTotal =
        uniRes.status === "fulfilled" ? uniRes.value.data?.total : null;
      const platStats =
        statsRes.status === "fulfilled" ? statsRes.value.data : null;
      const stats = {
        universities: uniTotal ? uniTotal : null,
        scholarships: platStats?.scholarships ? platStats.scholarships : null,
        countries: platStats?.countries ? platStats.countries : null,
      };
      setGlobalStats(stats);
      sessionStorage.setItem("fe_global_stats", JSON.stringify(stats));
    } catch {
      // Non-critical — page still works without stats
    }
  }, []);

  useEffect(() => {
    // Only load if not already cached in sessionStorage
    const cached = sessionStorage.getItem("fe_global_stats");
    if (cached) {
      try {
        const d = JSON.parse(cached);
        setGlobalStats(d);
        return;
      } catch {}
    }
    loadGlobalStats();
  }, []); // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────────────
  // Load exchange rates once
  // ─────────────────────────────────────────────────────────────────────────
  const loadExchangeRates = useCallback(async () => {
    const cachedRates = sessionStorage.getItem("fe_exchange_rates");
    if (cachedRates) {
      try {
        setExchangeRates(JSON.parse(cachedRates));
        return;
      } catch {}
    }
    try {
      const res = await API.get("/exchange-rates?base=USD");
      setExchangeRates(res.data);
      sessionStorage.setItem("fe_exchange_rates", JSON.stringify(res.data));
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    loadExchangeRates();
  }, []); // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────────────
  // Cross-page actions
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Called when user clicks "Track Application" on a university card.
   * Navigates to /tracker with pre-filled form data.
   */
  const trackUniversity = useCallback((university, navigate) => {
    setTrackerPrefill({
      university: university.name,
      country: university.country,
      portalLink: university.website || "",
      status: "Planning",
    });
    setSelectedUniversity(university);
    navigate("/tracker");
  }, []);

  /**
   * Called when user clicks "Set Reminder" on a scholarship card.
   * Navigates to /reminders with pre-filled deadline.
   */
  const remindScholarship = useCallback((scholarship, navigate) => {
    setReminderPrefill({
      title: `Apply: ${scholarship.name}`,
      deadline: scholarship.deadline_iso || "",
      scholarshipName: scholarship.name,
      country: scholarship.country,
      link: scholarship.link,
      notes: `Amount: ${scholarship.amount} | ${scholarship.link}`,
    });
    setSelectedScholarship(scholarship);
    navigate("/reminders");
  }, []);

  /**
   * Called when user clicks "Write SOP" on a university card.
   * Navigates to /sop with pre-filled university details.
   */
  const writeSopForUniversity = useCallback(
    (university, navigate) => {
      setSopPrefill({
        university: university.name,
        country: university.country,
        fullName: userProfile?.fullName || "",
        currentDegree: userProfile?.degree || "",
        currentField: userProfile?.field || "",
        currentUniversity: userProfile?.university || "",
        gpa: userProfile?.gpa || "",
      });
      navigate("/sop");
    },
    [userProfile],
  );

  /**
   * Select a country — all pages filter to this country.
   */
  const selectCountry = useCallback((country) => {
    setSelectedCountry(country);
  }, []);

  /**
   * Clear all cross-page prefill state (call after consuming)
   */
  const clearPrefills = useCallback(() => {
    setTrackerPrefill(null);
    setReminderPrefill(null);
    setSopPrefill(null);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Context value
  // ─────────────────────────────────────────────────────────────────────────
  const value = {
    // State
    selectedCountry,
    selectedUniversity,
    selectedScholarship,
    userProfile,
    profileLoading,
    trackerPrefill,
    reminderPrefill,
    sopPrefill,
    globalStats,
    exchangeRates,

    // Setters
    setSelectedCountry: selectCountry,
    setSelectedUniversity,
    setSelectedScholarship,
    setUserProfile,

    // Actions (cross-page navigation)
    trackUniversity,
    remindScholarship,
    writeSopForUniversity,
    clearPrefills,
    loadUserProfile,
    loadGlobalStats,
    clearProfileCache,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Hook to consume the app context in any page component */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export default AppContext;

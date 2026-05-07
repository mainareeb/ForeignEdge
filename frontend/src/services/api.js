/**
 * api.js — ForeignEdge API Service
 * ==================================
 * Single source of truth for all backend communication.
 * Base URL: http://127.0.0.1:5000
 *
 * - Attaches JWT token to every request automatically
 * - On 401: clears token + redirects to /login
 * - On network failure: returns clear error message
 * - 15 second timeout on all requests
 */

import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

const API = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Attach token to every request ──────────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Normalise errors + handle 401 + 429 ─────────────────────────────────────
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // ── 401 Unauthorized — logout ──────────────────────────────────────────
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      // ── 429 Too Many Requests — rate limit ────────────────────────────────
      if (status === 429) {
        return Promise.reject(
          new Error(
            "⏱️ Too many requests! Please wait a moment and try again.",
          ),
        );
      }

      // ── 500 Server Error ───────────────────────────────────────────────────
      if (status === 500) {
        return Promise.reject(
          new Error("🔧 Server error. Please try again in a moment."),
        );
      }

      // ── 403 Forbidden ──────────────────────────────────────────────────────
      if (status === 403) {
        return Promise.reject(
          new Error("🚫 Access denied. You don't have permission for this."),
        );
      }

      return Promise.reject(
        new Error(data?.error || data?.message || "Request failed"),
      );
    }
    if (error.code === "ECONNABORTED") {
      return Promise.reject(
        new Error("⏰ Request timed out. Please try again."),
      );
    }
    return Promise.reject(
      new Error(
        "📡 Cannot connect to server. Make sure the backend is running on port 5000.",
      ),
    );
  },
);

// ── Auth ───────────────────────────────────────────────────────────────────
export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);

// ── User Profile ───────────────────────────────────────────────────────────
export const getUserProfile = () => API.get("/user/profile");
export const updateProfile = (data) => API.post("/user/update-profile", data);
export const saveAcademicProfile = (data) =>
  API.post("/user/academic-profile", data);

// ── Universities ───────────────────────────────────────────────────────────
export const getUniversities = (params = {}) =>
  API.get("/universities", { params });

// ── Scholarships ───────────────────────────────────────────────────────────
export const getScholarships = (params = {}) =>
  API.get("/scholarships", { params });

// ── Visa ───────────────────────────────────────────────────────────────────
export const getVisaInfo = (country) =>
  API.get("/visa", { params: { country } });
export const getAllVisaInfo = () => API.get("/visa/all");

// ── Accommodation ──────────────────────────────────────────────────────────
export const getAccommodation = (country, city) =>
  API.get("/accommodation", { params: city ? { country, city } : { country } });

// ── Exchange Rates ─────────────────────────────────────────────────────────
export const getExchangeRates = (base = "USD") =>
  API.get("/exchange-rates", { params: { base } });

// ── Country (integrated all-in-one) ───────────────────────────────────────
export const getCountryData = (country) => API.get(`/country/${country}`);

// ── Compare ────────────────────────────────────────────────────────────────
export const compareCountries = (countries) =>
  API.get("/compare", { params: { countries: countries.join(",") } });

// ── Application Tracker ────────────────────────────────────────────────────
export const getTracker = () => API.get("/tracker");
export const addTracker = (data) => API.post("/tracker/add", data);
export const updateTracker = (id, data) => API.put(`/tracker/${id}`, data);
export const deleteTracker = (id) => API.delete(`/tracker/${id}`);

// ── Reminders ──────────────────────────────────────────────────────────────
export const getReminders = () => API.get("/reminders");
export const addReminder = (data) => API.post("/reminders/add", data);
export const updateReminder = (id, data) => API.put(`/reminders/${id}`, data);
export const deleteReminder = (id) => API.delete(`/reminders/${id}`);

// ── SOP Helper ─────────────────────────────────────────────────────────────
export const getSops = () => API.get("/sop");
export const generateSop = (data) => API.post("/sop/generate", data);
export const saveSop = (data) => API.post("/sop/save", data);
export const updateSop = (id, data) => API.put(`/sop/${id}`, data);
export const deleteSop = (id) => API.delete(`/sop/${id}`);

// ── Chatbot ────────────────────────────────────────────────────────────────
export const chatQuery = (data) =>
  API.post("/chat/query", typeof data === "string" ? { message: data } : data);
export const getCountryInfo = (country) =>
  API.get("/country-info", { params: { country } });

// ── Stats ──────────────────────────────────────────────────────────────────
export const getPlatformStats = () => API.get("/stats");

// ── Health ─────────────────────────────────────────────────────────────────
export const healthCheck = () => API.get("/health");

export default API;

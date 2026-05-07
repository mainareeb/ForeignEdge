/**
 * RateLimitToast.js — ForeignEdge
 * =================================
 * Global toast notification for rate limit errors.
 * Add this to App.js to show friendly messages for:
 * - 429 Too Many Requests
 * - Network errors
 * - Server errors
 *
 * USAGE in App.js:
 *   import RateLimitToast from "./components/RateLimitToast";
 *   <RateLimitToast />
 */

import React, { useState, useEffect } from "react";
import API from "../services/api";

const TOAST_TYPES = {
  rate_limit: {
    bg: "#fff3cd",
    border: "#ffc107",
    color: "#856404",
    icon: "⏱️",
    title: "Slow Down!",
  },
  server_error: {
    bg: "#fdecea",
    border: "#f5c6cb",
    color: "#721c24",
    icon: "🔧",
    title: "Server Error",
  },
  network: {
    bg: "#f8d7da",
    border: "#f5c6cb",
    color: "#721c24",
    icon: "📡",
    title: "Connection Error",
  },
  forbidden: {
    bg: "#fdecea",
    border: "#f5c6cb",
    color: "#721c24",
    icon: "🚫",
    title: "Access Denied",
  },
};

export default function RateLimitToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Intercept API errors and show toast
    const interceptor = API.interceptors.response.use(
      (res) => res,
      (error) => {
        const msg = error.message || "";
        let type = null;

        if (msg.includes("Too many requests") || msg.includes("⏱️")) {
          type = "rate_limit";
        } else if (msg.includes("Server error") || msg.includes("🔧")) {
          type = "server_error";
        } else if (msg.includes("Cannot connect") || msg.includes("📡")) {
          type = "network";
        } else if (msg.includes("Access denied") || msg.includes("🚫")) {
          type = "forbidden";
        }

        if (type) {
          const id = Date.now();
          setToasts((prev) => [...prev, { id, type, message: msg }]);
          // Auto remove after 4 seconds
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
          }, 4000);
        }

        return Promise.reject(error);
      },
    );

    return () => API.interceptors.response.eject(interceptor);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 360,
      }}
    >
      {toasts.map((toast) => {
        const config = TOAST_TYPES[toast.type] || TOAST_TYPES.server_error;
        return (
          <div
            key={toast.id}
            style={{
              background: config.bg,
              border: `1.5px solid ${config.border}`,
              borderRadius: 12,
              padding: "14px 18px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              animation: "slideIn 0.3s ease",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 22, flexShrink: 0 }}>{config.icon}</span>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: "0 0 4px",
                  fontWeight: 700,
                  color: config.color,
                  fontSize: 14,
                }}
              >
                {config.title}
              </p>
              <p
                style={{
                  margin: 0,
                  color: config.color,
                  fontSize: 13,
                  opacity: 0.85,
                }}
              >
                {toast.message.replace(/[⏱️🔧📡🚫]/g, "").trim()}
              </p>
            </div>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              style={{
                background: "transparent",
                border: "none",
                color: config.color,
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
                flexShrink: 0,
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

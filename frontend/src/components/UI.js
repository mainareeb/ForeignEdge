import React from "react";

/* ─── CSS injected once ─────────────────────────────────── */
const uiCSS = `
@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.sk {
  background: linear-gradient(90deg, #e8eef4 25%, #f4f7fa 50%, #e8eef4 75%);
  background-size: 600px 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 8px;
}
.ui-spinner {
  width: 40px; height: 40px;
  border: 4px solid #e0e9f0;
  border-top-color: #1a2e4a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.ui-fade { animation: fadeIn 0.4s ease both; }
`;

let cssInjected = false;
function injectCSS() {
  if (cssInjected) return;
  const s = document.createElement("style");
  s.innerHTML = uiCSS;
  document.head.appendChild(s);
  cssInjected = true;
}

/* ─── Skeleton block ─────────────────────────────────────── */
export function Skeleton({ width = "100%", height = 16, style = {} }) {
  injectCSS();
  return (
    <div
      className="sk"
      style={{ width, height, borderRadius: 8, ...style }}
    />
  );
}

/* ─── Card skeleton (generic) ───────────────────────────── */
export function CardSkeleton({ count = 6, cols = 3 }) {
  injectCSS();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 20,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <Skeleton height={140} style={{ borderRadius: 12 }} />
          <Skeleton height={18} width="70%" />
          <Skeleton height={13} width="50%" />
          <Skeleton height={13} width="90%" />
          <Skeleton height={36} style={{ marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

/* ─── Stat card skeleton ────────────────────────────────── */
export function StatSkeleton({ count = 4 }) {
  injectCSS();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${count}, 1fr)`,
        gap: 20,
        marginBottom: 25,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 25,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Skeleton width={36} height={36} style={{ borderRadius: "50%" }} />
            <Skeleton width={60} height={30} />
          </div>
          <Skeleton height={14} width="80%" />
          <Skeleton height={12} width="55%" />
        </div>
      ))}
    </div>
  );
}

/* ─── Spinner ────────────────────────────────────────────── */
export function Spinner({ size = 40, label = "Loading..." }) {
  injectCSS();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 48,
      }}
    >
      <div
        className="ui-spinner"
        style={{ width: size, height: size, borderWidth: size / 10 }}
      />
      {label && (
        <p style={{ color: "#666", fontSize: 15, margin: 0 }}>{label}</p>
      )}
    </div>
  );
}

/* ─── Full-page loading ──────────────────────────────────── */
export function PageLoader({ label = "Loading..." }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <Spinner label={label} />
    </div>
  );
}

/* ─── Error state ────────────────────────────────────────── */
export function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}) {
  injectCSS();
  return (
    <div
      className="ui-fade"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        gap: 16,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 48 }}>⚠️</div>
      <h3 style={{ color: "#1a2e4a", fontSize: 18, fontWeight: 700, margin: 0 }}>
        Unable to Load Data
      </h3>
      <p style={{ color: "#666", fontSize: 14, maxWidth: 400, margin: 0 }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: 8,
            padding: "10px 28px",
            backgroundColor: "#1a2e4a",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────── */
export function EmptyState({
  icon = "🔍",
  title = "No results found",
  subtitle = "Try adjusting your search or filters.",
}) {
  injectCSS();
  return (
    <div
      className="ui-fade"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        gap: 12,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 52 }}>{icon}</div>
      <h3 style={{ color: "#1a2e4a", fontSize: 18, fontWeight: 700, margin: 0 }}>
        {title}
      </h3>
      <p style={{ color: "#888", fontSize: 14, maxWidth: 360, margin: 0 }}>
        {subtitle}
      </p>
    </div>
  );
}
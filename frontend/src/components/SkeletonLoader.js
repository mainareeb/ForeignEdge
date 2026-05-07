/**
 * SkeletonLoader.js — ForeignEdge
 * =================================
 * Reusable skeleton loading components.
 * Use these instead of spinners for better UX.
 *
 * USAGE:
 *   import { SkeletonCard, SkeletonList, SkeletonStat, SkeletonText } from "../../components/SkeletonLoader";
 *
 *   {loading && <SkeletonCard />}
 *   {loading && <SkeletonList rows={5} />}
 */

import React from "react";

// ── Shimmer animation style ───────────────────────────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: 8,
};

const globalCSS = `
@keyframes shimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}
`;

function InjectCSS() {
  return <style>{globalCSS}</style>;
}

// ── Base block ────────────────────────────────────────────────────────────────
function SkeletonBlock({ width = "100%", height = 16, style = {} }) {
  return (
    <div
      style={{ ...shimmerStyle, width, height, borderRadius: 8, ...style }}
    />
  );
}

// ── Card skeleton — for university/scholarship cards ──────────────────────────
export function SkeletonCard() {
  return (
    <>
      <InjectCSS />
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 20,
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        }}
      >
        <SkeletonBlock height={20} width="70%" style={{ marginBottom: 12 }} />
        <SkeletonBlock height={14} width="50%" style={{ marginBottom: 8 }} />
        <SkeletonBlock height={14} width="90%" style={{ marginBottom: 8 }} />
        <SkeletonBlock height={14} width="60%" style={{ marginBottom: 16 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <SkeletonBlock height={32} width={80} style={{ borderRadius: 20 }} />
          <SkeletonBlock height={32} width={80} style={{ borderRadius: 20 }} />
        </div>
      </div>
    </>
  );
}

// ── Grid of skeleton cards ────────────────────────────────────────────────────
export function SkeletonGrid({ count = 6, columns = 3 }) {
  return (
    <>
      <InjectCSS />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 20,
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </>
  );
}

// ── List skeleton — for tracker/reminders rows ───────────────────────────────
export function SkeletonList({ rows = 5 }) {
  return (
    <>
      <InjectCSS />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "16px 20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <SkeletonBlock
              width={40}
              height={40}
              style={{ borderRadius: "50%", flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <SkeletonBlock
                height={16}
                width="60%"
                style={{ marginBottom: 8 }}
              />
              <SkeletonBlock height={12} width="40%" />
            </div>
            <SkeletonBlock
              width={80}
              height={30}
              style={{ borderRadius: 20 }}
            />
          </div>
        ))}
      </div>
    </>
  );
}

// ── Stat skeleton — for dashboard stat cards ──────────────────────────────────
export function SkeletonStat() {
  return (
    <>
      <InjectCSS />
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: "20px 24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          flex: "1 1 160px",
        }}
      >
        <SkeletonBlock
          width={40}
          height={40}
          style={{ borderRadius: "50%", marginBottom: 12 }}
        />
        <SkeletonBlock height={32} width="60%" style={{ marginBottom: 8 }} />
        <SkeletonBlock height={14} width="80%" />
      </div>
    </>
  );
}

// ── Text skeleton — for paragraphs ───────────────────────────────────────────
export function SkeletonText({ lines = 3 }) {
  const widths = ["100%", "85%", "70%", "90%", "60%"];
  return (
    <>
      <InjectCSS />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBlock
            key={i}
            height={14}
            width={widths[i % widths.length]}
          />
        ))}
      </div>
    </>
  );
}

// ── Hero skeleton — for page headers ─────────────────────────────────────────
export function SkeletonHero() {
  return (
    <>
      <InjectCSS />
      <div
        style={{
          background: "linear-gradient(135deg, #1a2e4a, #2a4a7a)",
          borderRadius: 16,
          padding: "40px 32px",
          marginBottom: 28,
        }}
      >
        <SkeletonBlock
          height={36}
          width="50%"
          style={{ marginBottom: 16, background: "rgba(255,255,255,0.15)" }}
        />
        <SkeletonBlock
          height={18}
          width="70%"
          style={{ marginBottom: 8, background: "rgba(255,255,255,0.1)" }}
        />
        <SkeletonBlock
          height={18}
          width="50%"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />
      </div>
    </>
  );
}

// ── Full page skeleton — generic fallback ─────────────────────────────────────
export function SkeletonPage() {
  return (
    <>
      <InjectCSS />
      <div style={{ padding: "32px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <SkeletonHero />
        <SkeletonGrid count={6} columns={3} />
      </div>
    </>
  );
}

export default SkeletonCard;

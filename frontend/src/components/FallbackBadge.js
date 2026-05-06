import React, { useState } from "react";

export default function FallbackBadge({
  reason,
  sourceDate,
  sourceUrl,
  compact,
}) {
  var date = sourceDate || "2024-25";
  var [expanded, setExpanded] = useState(false);

  if (compact) {
    return <span style={S.chip}>📊 Estimated</span>;
  }

  return (
    <div style={S.banner}>
      <div style={S.left}>
        <span style={S.icon}>📊</span>
        <div>
          <strong style={S.title}>Showing Estimated Data</strong>

          <p style={S.subtitle}>
            Live data source is temporarily unavailable. Figures are based on
            researched data from {date} and may not reflect current prices.
          </p>

          {reason ? (
            <p style={S.reason}>
              <strong>Reason:</strong> {reason}
            </p>
          ) : null}

          {sourceUrl ? (
            <p style={S.reason}>
              <strong>Source:</strong>{" "}
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={S.link}
              >
                View Source
              </a>
            </p>
          ) : null}

          <button onClick={() => setExpanded(!expanded)} style={S.toggle}>
            {expanded ? "Hide" : "Details"}
          </button>
        </div>
      </div>

      <div style={S.indicator}>
        <span style={S.dot}></span>
        <span style={S.offlineText}>Offline</span>
      </div>
    </div>
  );
}

var S = {
  banner: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    background: "linear-gradient(135deg, #fff8ec, #fff3d6)",
    border: "1.5px solid #f0c060",
    borderRadius: "12px",
    padding: "16px 20px",
    marginBottom: "20px",
    gap: "12px",
  },
  left: {
    display: "flex",
    gap: "14px",
    flex: 1,
  },
  icon: {
    fontSize: "28px",
    flexShrink: 0,
    lineHeight: 1,
    marginTop: "2px",
  },
  title: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#7a4a00",
    display: "block",
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#9a6a10",
    margin: "0 0 6px",
    lineHeight: 1.5,
  },
  reason: {
    fontSize: "12px",
    color: "#7a4a00",
    margin: "4px 0",
  },
  link: {
    color: "#b96a00",
  },
  toggle: {
    background: "transparent",
    border: "none",
    color: "#b96a00",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline",
    marginTop: "6px",
  },
  indicator: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0,
    marginTop: "4px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#ccc",
    display: "inline-block",
  },
  offlineText: {
    fontSize: "12px",
    color: "#999",
  },
  chip: {
    display: "inline-block",
    background: "#fff3d6",
    border: "1px solid #f0c060",
    borderRadius: "20px",
    padding: "2px 10px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#9a6a10",
    cursor: "default",
    whiteSpace: "nowrap",
  },
};

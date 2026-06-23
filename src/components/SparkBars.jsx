import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { colors } from "../constants/theme";

// ── Bar data builders ─────────────────────────────────────────────

/** Rain bars — blue shades, relative to maxP. dayView adds 1px baseline for dry hours. */
export function buildRainBars(values, maxP, { dayView = false } = {}) {
  return values.map((p) => ({
    height: p >= 0.1 ? Math.max(25, (p / maxP) * 100) : 0,
    minHeight: dayView && p < 0.1 ? 1 : 0,
    color: p >= 0.1
      ? (p >= 2 ? "#3B82F6" : p >= 0.5 ? "#60A5FA" : "#93C5FD")
      : `${colors.surfaceBorder}20`,
  }));
}

/** Wind bars — teal/orange by speed thresholds, relative to maxP. */
export function buildWindBars(values, maxP) {
  return values.map((w) => ({
    height: w > 0 ? Math.max(15, (w / maxP) * 100) : 0,
    minHeight: 0,
    color: w >= 25 ? "#F97316" : w >= 15 ? "#34D399" : w >= 8 ? "#6EE7B7" : "#4B5563",
  }));
}

/** Temp bars — colour-coded by value.
 *  Pass range = { min, max } for relative (day overview) scale;
 *  omit for absolute 0-35 °C scale (per-slot). */
export function buildTempBars(values, range) {
  const color = (t) =>
    t >= 30 ? "#EF4444" : t >= 22 ? "#F97316" : t >= 16 ? "#FCD34D" : t >= 8 ? "#6EE7B7" : "#93C5FD";

  if (range) {
    const span = Math.max(range.max - range.min, 1);
    return values.map((t) => ({
      height: t != null ? Math.max(15, ((t - range.min) / span) * 100) : 0,
      minHeight: 0,
      color: t != null ? color(t) : "transparent",
    }));
  }

  return values.map((t) => ({
    height: t != null ? Math.max(15, (Math.max(0, t) / 35) * 100) : 0,
    minHeight: 0,
    color: t != null ? color(t) : "transparent",
  }));
}

// ── Tooltip ───────────────────────────────────────────────────────

/**
 * tooltip rows: { label, primary, color?, extra?: [{ emoji, text }] }
 * Hovering a row expands its `extra` items inline (level 2).
 */
function SparkTooltip({ title, rows, anchor, onEnter, onLeave }) {
  const [expandedRow, setExpandedRow] = useState(null);

  const above = anchor.bottom + 240 > window.innerHeight;
  const left = Math.min(Math.max(8, anchor.left), window.innerWidth - 216);

  return createPortal(
    <div
      style={{
        position: "fixed",
        zIndex: 9999,
        left,
        ...(above
          ? { bottom: window.innerHeight - anchor.top + 6 }
          : { top: anchor.bottom + 6 }),
        background: "#0A1628",
        border: `1px solid ${colors.surfaceBorder}`,
        borderRadius: 10,
        padding: "10px 12px",
        minWidth: 160,
        maxWidth: 216,
        maxHeight: 220,
        overflowY: "auto",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        fontSize: 11,
        color: colors.text,
        pointerEvents: "auto",
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {title && (
        <div style={{
          fontWeight: 700, fontSize: 11, marginBottom: 7,
          paddingBottom: 6, borderBottom: `1px solid ${colors.surfaceBorder}`,
        }}>
          {title}
        </div>
      )}
      {rows.map((row, i) => (
        <div
          key={i}
          onMouseEnter={() => setExpandedRow(i)}
          onMouseLeave={() => setExpandedRow(null)}
          style={{
            padding: "3px 5px",
            borderRadius: 5,
            background: expandedRow === i ? "rgba(255,255,255,0.04)" : "transparent",
            marginBottom: 1,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <span style={{ color: colors.textMuted, fontVariantNumeric: "tabular-nums", fontSize: 10 }}>
              {row.label}
            </span>
            <span style={{ fontWeight: 700, color: row.color ?? colors.text }}>
              {row.primary}
            </span>
          </div>
          {expandedRow === i && row.extra?.length > 0 && (
            <div style={{
              marginTop: 4, paddingTop: 4,
              borderTop: `1px solid ${colors.surfaceBorder}`,
              display: "flex", gap: 10, flexWrap: "wrap",
            }}>
              {row.extra.map((e, j) => (
                <span key={j} style={{ fontSize: 10, color: colors.textMuted, display: "flex", alignItems: "center", gap: 3 }}>
                  {e.emoji} {e.text}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>,
    document.body
  );
}

// ── Component ─────────────────────────────────────────────────────

/**
 * Tiny sparkline bar chart.
 *
 * bars: Array of { height: 0-100, minHeight?: px, color: string }
 *   — produced by buildRainBars / buildWindBars / buildTempBars
 *
 * tooltip: { title: string, rows: [...] } — optional hover popover.
 *   Each row: { label, primary, color?, extra?: [{ emoji, text }] }
 *   Hovering a row expands extra details (level 2).
 *
 * showLabels + startH: renders hour numbers below the bars (one per 2 bars).
 */
export default function SparkBars({
  bars,
  height = 8,
  barWidth = 3,
  showLabels = false,
  startH,
  tooltip,
}) {
  const containerRef = useRef(null);
  const [anchor, setAnchor] = useState(null);
  const hideTimer = useRef(null);

  const show = useCallback(() => {
    clearTimeout(hideTimer.current);
    if (containerRef.current && tooltip) {
      setAnchor(containerRef.current.getBoundingClientRect());
    }
  }, [tooltip]);

  const scheduleHide = useCallback(() => {
    hideTimer.current = setTimeout(() => setAnchor(null), 150);
  }, []);

  const cancelHide = useCallback(() => {
    clearTimeout(hideTimer.current);
  }, []);

  const numLabels = Math.floor(bars.length / 2);

  return (
    <div
      ref={containerRef}
      onMouseEnter={tooltip ? show : undefined}
      onMouseLeave={tooltip ? scheduleHide : undefined}
      style={{ display: "inline-block", cursor: tooltip ? "default" : undefined }}
    >
      <div style={{ display: "flex", gap: 1, height, alignItems: "flex-end" }}>
        {bars.map((bar, i) => (
          <div
            key={i}
            style={{
              width: barWidth,
              flexShrink: 0,
              height: bar.height > 0 ? `${bar.height}%` : 0,
              minHeight: bar.minHeight > 0 ? bar.minHeight : undefined,
              background: bar.color,
              borderRadius: "1px 1px 0 0",
            }}
          />
        ))}
      </div>
      {showLabels && startH != null && (
        <div style={{ display: "flex", gap: 1, marginTop: 1 }}>
          {Array.from({ length: numLabels }, (_, i) => (
            <div
              key={i}
              style={{
                width: 7,
                flexShrink: 0,
                textAlign: "center",
                fontSize: 6,
                lineHeight: 1,
                color: colors.textMuted,
                opacity: 0.55,
              }}
            >
              {startH + i}
            </div>
          ))}
        </div>
      )}
      {anchor && tooltip && (
        <SparkTooltip
          title={tooltip.title}
          rows={tooltip.rows}
          anchor={anchor}
          onEnter={cancelHide}
          onLeave={scheduleHide}
        />
      )}
    </div>
  );
}

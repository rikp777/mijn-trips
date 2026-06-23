import { useState, useEffect, useMemo, useRef } from "react";
import { colors } from "../constants/theme";
import SparkBars, { buildRainBars, buildWindBars, buildTempBars } from "./SparkBars";
import { days as dkDays, scheduleTypeColor as dkTypeColor } from "../data/schedule";
import { days as rtDays, scheduleTypeColor as rtTypeColor } from "../data/schedule-roadtrip-2026";
import { locations as dkLocations, locationCategories as dkCategories } from "../data/locations";
import { locations as rtLocations, roadtripCategories as rtCategories } from "../data/locations-roadtrip-2026";
import { useTrip } from "../context/TripContext";
import { useJournal } from "../hooks/useJournal";
import { useWeatherForecast, windVerdict } from "../hooks/useWeatherForecast";
import { useSlotNotes } from "../hooks/useSlotNotes";

// ── Helpers ──────────────────────────────────────────────────────

function parseMin(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function fmtHHMM(min) {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

function formatRelTime(min) {
  if (min < 1)  return "zo meteen";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}u ${m}m` : `${h}u`;
}

// ── Now separator — the live "you are here" marker ────────────────

function NowSeparator({ nowMin, nextSlotMin }) {
  const until = Math.max(0, nextSlotMin - nowMin);
  const urgentColor = until < 5 ? "#EF4444" : until < 20 ? "#F59E0B" : "#34D399";

  return (
    <div style={{ display: "flex", gap: 12 }}>
      {/* Rail */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 44, flexShrink: 0, paddingTop: 4 }}>
        <div style={{
          width: 14, height: 14, borderRadius: "50%",
          background: "#34D399",
          boxShadow: "0 0 0 4px rgba(52,211,153,0.22), 0 0 0 9px rgba(52,211,153,0.08)",
          flexShrink: 0,
        }} />
        <div style={{ flex: 1, width: 2, background: colors.surfaceBorder, marginTop: 4, minHeight: 8 }} />
      </div>
      {/* Bar */}
      <div style={{
        flex: 1,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        background: "rgba(52,211,153,0.06)",
        border: "1px solid rgba(52,211,153,0.22)",
        borderRadius: 10,
        padding: "7px 12px",
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#34D399", whiteSpace: "nowrap" }}>
          ⏱ {fmtHHMM(nowMin)} — nu
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: urgentColor, whiteSpace: "nowrap" }}>
          Volgende over {formatRelTime(until)} →
        </span>
      </div>
    </div>
  );
}


function SlotNote({ date, time, getNote, setNote }) {
  const [editing, setEditing] = useState(false);
  const note = getNote(date, time);

  const handleChange = (e) => setNote(date, time, e.target.value);
  const handleBlur = () => setEditing(false);

  if (editing) {
    return (
      <textarea
        autoFocus
        value={note}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Notitie…"
        rows={2}
        style={{
          width: "100%", marginTop: 8, resize: "none",
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${colors.surfaceBorder}`,
          borderRadius: 7, padding: "5px 8px",
          fontSize: 11, color: colors.textMuted, lineHeight: 1.5,
          outline: "none", boxSizing: "border-box",
        }}
      />
    );
  }

  if (note.trim()) {
    return (
      <div
        onClick={() => setEditing(true)}
        style={{
          marginTop: 8, fontSize: 11, color: colors.textMuted,
          lineHeight: 1.5, cursor: "text",
          borderLeft: `2px solid ${colors.surfaceBorder}`,
          paddingLeft: 7, opacity: 0.75,
        }}
      >
        {note}
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      style={{
        marginTop: 6, background: "none", border: "none",
        color: colors.textMuted, fontSize: 10, opacity: 0.4,
        cursor: "pointer", padding: "2px 0",
      }}
    >
      + notitie
    </button>
  );
}

function slotWeatherInfo(date, startTime, endTime, hourlyData) {
  const startH = parseInt(startTime.slice(0, 2));
  const rawEnd = endTime ? parseInt(endTime.slice(0, 2)) : startH + 2;
  const endH = Math.min(Math.max(rawEnd, startH + 1), startH + 8, 24);
  const buckets = [];
  for (let h = startH; h < endH; h++) {
    const key = `${date}T${String(h).padStart(2, "0")}:00`;
    const d = hourlyData?.[key];
    buckets.push({ precip: d?.precip ?? 0, wind: d?.wind ?? 0, temp: d?.temp ?? null });
  }
  const totalMm = Math.round(buckets.reduce((s, b) => s + b.precip, 0) * 10) / 10;
  const rainBars = buckets.flatMap((b) => [b.precip, b.precip]);
  const windBars = buckets.flatMap((b) => [b.wind, b.wind]);
  const tempBars = buckets.flatMap((b) => [b.temp, b.temp]);
  return {
    totalMm, bars: rainBars, maxP: Math.max(...rainBars, 0.5), startH,
    hasRain: totalMm >= 0.1,
    windBars, maxWind: Math.max(...windBars, 15),
    peakWind: Math.max(...buckets.map((b) => b.wind), 0),
    hasWind: buckets.some((b) => b.wind > 0),
    tempBars, hasTemp: buckets.some((b) => b.temp != null),
  };
}

// ── Tooltip row builders ──────────────────────────────────────────

const tempColor = (t) =>
  t >= 30 ? "#EF4444" : t >= 22 ? "#F97316" : t >= 16 ? "#FCD34D" : t >= 8 ? "#6EE7B7" : "#93C5FD";
const windColor = (w) =>
  w >= 25 ? "#F97316" : w >= 15 ? "#34D399" : w >= 8 ? "#6EE7B7" : colors.textMuted;
const rainColor = (p) =>
  p >= 2 ? "#3B82F6" : p >= 0.5 ? "#60A5FA" : "#93C5FD";

function slotTooltipRows(wx2, variant) {
  const rains = wx2.bars.filter((_, i) => i % 2 === 0);
  const winds = wx2.windBars.filter((_, i) => i % 2 === 0);
  const temps = wx2.tempBars.filter((_, i) => i % 2 === 0);

  const maxRain = Math.max(...rains, 0.1);
  const maxWind = Math.max(...winds, 1);
  const validTemps = temps.filter((t) => t != null);
  const minT = validTemps.length ? Math.min(...validTemps) : 0;
  const maxT = validTemps.length ? Math.max(...validTemps) : 35;
  const tRange = Math.max(maxT - minT, 1);

  return rains.map((rain, idx) => {
    const h = wx2.startH + idx;
    const label = `${String(h).padStart(2, "0")}:00`;
    const wind = winds[idx] ?? 0;
    const temp = temps[idx] ?? null;

    const extra = [
      ...(variant !== "temp" && temp != null ? [{ emoji: "🌡", text: `${temp}°` }] : []),
      ...(variant !== "rain" && rain >= 0.1 ? [{ emoji: "💧", text: `${rain}mm` }] : []),
      ...(variant !== "wind" && wind > 0 ? [{ emoji: "💨", text: `${wind}kn` }] : []),
    ];

    if (variant === "temp") {
      return {
        label, extra,
        primary: temp != null ? `${temp}°` : "–",
        color: temp != null ? tempColor(temp) : colors.textMuted,
        barPct: temp != null ? Math.max(5, ((temp - minT) / tRange) * 100) : 0,
      };
    } else if (variant === "rain") {
      return {
        label, extra,
        primary: `${rain}mm`,
        color: rain >= 0.1 ? rainColor(rain) : colors.textMuted,
        barPct: rain >= 0.1 ? Math.max(5, (rain / maxRain) * 100) : 0,
      };
    } else {
      return {
        label, extra,
        primary: `${wind}kn`,
        color: wind > 0 ? windColor(wind) : colors.textMuted,
        barPct: wind > 0 ? Math.max(5, (wind / maxWind) * 100) : 0,
      };
    }
  });
}

function dayTooltipRows(hours, variant) {
  const maxRain = Math.max(...hours.map((h) => h.precip), 0.1);
  const maxWind = Math.max(...hours.map((h) => h.wind), 1);
  const validTemps = hours.map((h) => h.temp).filter((t) => t != null);
  const minT = validTemps.length ? Math.min(...validTemps) : 0;
  const maxT = validTemps.length ? Math.max(...validTemps) : 35;
  const tRange = Math.max(maxT - minT, 1);

  // For rain/wind day views, skip empty hours to keep the list short
  const filtered = variant === "rain"
    ? hours.filter((h) => h.precip >= 0.1)
    : variant === "wind"
    ? hours.filter((h) => h.wind > 0)
    : hours;

  return filtered.map(({ h, precip, wind, temp }) => {
    const label = `${String(h).padStart(2, "0")}:00`;
    const extra = [
      ...(variant !== "temp" && temp != null ? [{ emoji: "🌡", text: `${temp}°` }] : []),
      ...(variant !== "rain" && precip >= 0.1 ? [{ emoji: "💧", text: `${precip}mm` }] : []),
      ...(variant !== "wind" && wind > 0 ? [{ emoji: "💨", text: `${wind}kn` }] : []),
    ];

    if (variant === "temp") {
      return {
        label, extra,
        primary: temp != null ? `${temp}°` : "–",
        color: temp != null ? tempColor(temp) : colors.textMuted,
        barPct: temp != null ? Math.max(5, ((temp - minT) / tRange) * 100) : 0,
      };
    } else if (variant === "rain") {
      return {
        label, extra,
        primary: `${precip}mm`,
        color: rainColor(precip),
        barPct: Math.max(5, (precip / maxRain) * 100),
      };
    } else {
      return {
        label, extra,
        primary: `${wind}kn`,
        color: windColor(wind),
        barPct: Math.max(5, (wind / maxWind) * 100),
      };
    }
  });
}

// ── Day weather strip ─────────────────────────────────────────────

const NL_MONTHS = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
function fmtDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return `${d.getDate()} ${NL_MONTHS[d.getMonth()]}`;
}

function DaySparklines({ date, hourlyData, highlightStartMin, highlightEndMin }) {
  const hours = Array.from({ length: 24 }, (_, h) => {
    const key = `${date}T${String(h).padStart(2, "0")}:00`;
    const d = hourlyData?.[key];
    return { h, precip: d?.precip ?? 0, wind: d?.wind ?? 0, temp: d?.temp ?? null };
  });

  const anyRain = hours.some((h) => h.precip >= 0.1);
  const anyWind = hours.some((h) => h.wind > 0);
  const temps   = hours.map((h) => h.temp).filter((t) => t != null);
  const anyTemp = temps.length > 0;
  if (!anyRain && !anyWind && !anyTemp) return null;

  const maxRain = Math.max(...hours.map((h) => h.precip), 0.5);
  const maxWind = Math.max(...hours.map((h) => h.wind), 15);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);

  const totalMm = Math.round(hours.reduce((s, h) => s + h.precip, 0) * 10) / 10;

  const hlRange = highlightStartMin != null
    ? { start: Math.floor(highlightStartMin / 60), end: Math.floor((highlightEndMin - 1) / 60) }
    : undefined;

  const row = (bars, tooltip, height, label) => (
    <div style={{ position: "relative", marginBottom: 2 }}>
      <SparkBars fillWidth height={height} bars={bars} tooltip={tooltip} highlightRange={hlRange} />
      <span style={{
        position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)",
        fontSize: 7, color: "rgba(255,255,255,0.45)", lineHeight: 1,
        background: "rgba(0,0,0,0.35)", padding: "1px 4px", borderRadius: 3,
        pointerEvents: "none", whiteSpace: "nowrap",
      }}>{label}</span>
    </div>
  );

  return (
    <>
      {anyTemp && row(
        buildTempBars(hours.map((h) => h.temp), { min: minTemp, max: maxTemp }),
        { title: "🌡 Temperatuur", meta: `${minTemp}°–${maxTemp}°`, rows: dayTooltipRows(hours, "temp") },
        14, `🌡 ${minTemp}–${maxTemp}°`
      )}
      {anyRain && row(
        buildRainBars(hours.map((h) => h.precip), maxRain, { dayView: true }),
        { title: "💧 Regen", meta: `${totalMm}mm totaal`, rows: dayTooltipRows(hours, "rain") },
        8, `💧 ${totalMm}mm`
      )}
      {anyWind && row(
        buildWindBars(hours.map((h) => h.wind), maxWind),
        { title: "💨 Wind", meta: `max ${maxWind}kn`, rows: dayTooltipRows(hours, "wind") },
        8, `💨 ${maxWind}kn`
      )}
    </>
  );
}

// ── Sunrise / sunset ─────────────────────────────────────────────

function getSunTimes(lat, lon, dateStr) {
  const date = new Date(dateStr + "T00:00:00Z");
  const JD = date / 86400000 + 2440587.5;
  const n = JD - 2451545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * (Math.PI / 180);
  const λ = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * (Math.PI / 180);
  const ε = 23.439 * (Math.PI / 180);
  const sinδ = Math.sin(ε) * Math.sin(λ);
  const φ = lat * (Math.PI / 180);
  const cosH = (Math.sin(-0.0145) - Math.sin(φ) * sinδ) / (Math.cos(φ) * Math.cos(Math.asin(sinδ)));
  if (Math.abs(cosH) > 1) return null;
  const H = Math.acos(cosH) * (12 / Math.PI);
  const EqT = (L - (Math.atan2(Math.cos(ε) * Math.sin(λ), Math.cos(λ)) * (180 / Math.PI))) / 15;
  const noon = 12 - EqT - lon / 15; // UTC solar noon

  // Convert UTC → local civil time (DST-aware heuristic for European locations)
  const month = date.getUTCMonth(); // 0-indexed
  const baseTzH = Math.round(lon / 15); // e.g. lon 8 → CET+1
  const dstH = (lon > -15 && lon < 45 && month >= 2 && month <= 9) ? 1 : 0;
  const tzOffsetMin = (baseTzH + dstH) * 60; // CEST = 120 min for DK in summer

  const toMin = (h) => Math.round((((h % 24) + 24) % 24) * 60) + tzOffsetMin;
  return { sunriseMin: toMin(noon - H), sunsetMin: toMin(noon + H) };
}

// ── Day timeline strip ────────────────────────────────────────────

function DayTimeline({ day, scheduleTypeColor, nowMin, sunTimes, activeSlotId, onSlotClick }) {
  const slots = day.slots;
  if (!slots?.length) return null;

  const firstMin = parseMin(slots[0].time);
  const lastMin  = parseMin(slots[slots.length - 1].time);
  const fmt = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`;

  // Full 24-hour view so unplanned time is visible in context
  const viewStart = 0;
  const viewEnd   = 1440;
  const span      = 1440;

  const pct  = (min) => `${(Math.max(0, Math.min(span, min - viewStart)) / span * 100).toFixed(2)}%`;
  const wPct = (dur) => `${(Math.min(span, Math.max(0, dur)) / span * 100).toFixed(2)}%`;

  // Background: solid day colour if fully within daylight, else gradient showing night edges
  const clamp = (v) => Math.max(0, Math.min(1, v));
  let bg = "#162B44";
  if (sunTimes) {
    const srF = clamp((sunTimes.sunriseMin - viewStart) / span);
    const ssF = clamp((sunTimes.sunsetMin  - viewStart) / span);
    if (srF > 0.01 || ssF < 0.99) {
      bg = `linear-gradient(90deg,
        #0A1628 0%, #0A1628 ${(srF * 100).toFixed(1)}%,
        #162B44 ${Math.min((srF + 0.05) * 100, 100).toFixed(1)}%,
        #162B44 ${Math.max((ssF - 0.05) * 100, 0).toFixed(1)}%,
        #0A1628 ${(ssF * 100).toFixed(1)}%, #0A1628 100%)`;
    }
  }

  // Each slot stretches to the next slot's start — gaps only appear before/after the day's schedule
  const srInView = sunTimes && sunTimes.sunriseMin > viewStart && sunTimes.sunriseMin < viewEnd;
  const ssInView = sunTimes && sunTimes.sunsetMin  > viewStart && sunTimes.sunsetMin  < viewEnd;

  return (
    <>
      {/* ── Bar ── */}
      <div style={{ position: "relative", height: 10, borderRadius: 0, background: bg, overflow: "hidden" }}>

        {slots.map((slot, i) => {
          const next      = slots[i + 1];
          const start     = parseMin(slot.time);
          const nextStart = next ? parseMin(next.time) : null;
          const end = slot.endTime
            ? parseMin(slot.endTime)
            : (nextStart ?? Math.min(start + 90, viewEnd));
          const accent   = scheduleTypeColor[slot.type] || colors.sky;
          const isActive = activeSlotId === slot.id;
          const isDimmed = activeSlotId && !isActive;
          return (
            <div
              key={slot.id}
              onClick={() => onSlotClick?.(isActive ? null : slot.id)}
              style={{
                position: "absolute",
                left: pct(start), width: wPct(end - start),
                height: "100%", background: accent,
                opacity: isDimmed ? 0.25 : isActive ? 1 : 0.78,
                cursor: "pointer",
                transition: "opacity 0.2s",
                outline: isActive ? `2px solid ${accent}` : "none",
                outlineOffset: 1,
              }}
            />
          );
        })}

        {/* Sunrise tick inside bar */}
        {srInView && (
          <div style={{
            position: "absolute", left: pct(sunTimes.sunriseMin),
            top: 0, height: "100%", width: 1,
            background: "#FCD34DAA", transform: "translateX(-50%)", zIndex: 2,
          }} />
        )}
        {/* Sunset tick inside bar */}
        {ssInView && (
          <div style={{
            position: "absolute", left: pct(sunTimes.sunsetMin),
            top: 0, height: "100%", width: 1,
            background: "#FB923CAA", transform: "translateX(-50%)", zIndex: 2,
          }} />
        )}

        {/* Now marker */}
        {nowMin != null && nowMin >= viewStart && nowMin <= viewEnd && (
          <div style={{
            position: "absolute", left: pct(nowMin),
            top: 0, height: "100%", width: 2,
            background: "#34D399", transform: "translateX(-50%)",
            boxShadow: "0 0 6px #34D399", zIndex: 3,
          }} />
        )}
      </div>

      {/* ── Hour labels ── */}
      {(() => {
        const hourStep = 120; // every 2h across a 24h bar
        const firstH = Math.ceil(viewStart / hourStep) * hourStep;
        const hours = [];
        for (let m = firstH; m <= viewEnd; m += hourStep) hours.push(m);
        return (
          <div style={{ position: "relative", height: 11, marginTop: 2 }}>
            {hours.map((m) => (
              <span key={m} style={{
                position: "absolute", left: pct(m), transform: "translateX(-50%)",
                fontSize: 7, color: colors.textMuted, opacity: 0.4,
                lineHeight: 1, whiteSpace: "nowrap",
              }}>
                {Math.floor(m / 60)}
              </span>
            ))}
          </div>
        );
      })()}

      {/* ── Sun labels — pinned to edge if outside view, positioned if inside ── */}
      {sunTimes && (
        <div style={{ position: "relative", height: 11 }}>
          <div style={{
            position: "absolute",
            ...(srInView ? { left: pct(sunTimes.sunriseMin), transform: "translateX(-50%)" } : { left: 0 }),
            fontSize: 7.5, color: "#FCD34D", opacity: 0.6, whiteSpace: "nowrap", lineHeight: 1,
          }}>
            🌅 {fmt(sunTimes.sunriseMin)}
          </div>
          <div style={{
            position: "absolute",
            ...(ssInView ? { left: pct(sunTimes.sunsetMin), transform: "translateX(-50%)" } : { right: 0 }),
            fontSize: 7.5, color: "#FB923C", opacity: 0.6, whiteSpace: "nowrap", lineHeight: 1,
          }}>
            🌇 {fmt(sunTimes.sunsetMin)}
          </div>
        </div>
      )}
    </>
  );
}

// ── Day packing summary ───────────────────────────────────────────

function DayPackingSummary({ slots, packMap, onFocusPack }) {
  const [expanded, setExpanded] = useState(false);
  const allGear = [...new Set(slots.flatMap((s) => s.gear ?? []))];
  if (!allGear.length) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setExpanded((e) => !e)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: `${colors.sky}12`,
          border: `1px solid ${colors.sky}30`,
          borderRadius: 10, padding: "6px 12px",
          color: colors.textMuted, fontSize: 11, cursor: "pointer",
          width: "100%", justifyContent: "space-between",
        }}
      >
        <span>🎒 {allGear.length} items vandaag</span>
        <span style={{ fontSize: 9, opacity: 0.6 }}>{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div style={{
          marginTop: 8, padding: "8px 12px",
          background: colors.surface,
          border: `1px solid ${colors.surfaceBorder}`,
          borderRadius: 10,
          display: "flex", flexWrap: "wrap", gap: 5,
        }}>
          {allGear.map((id) => {
            const item = packMap[id];
            if (!item) return null;
            return (
              <span key={id} style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                background: `${item.catColor}18`,
                border: `1px solid ${item.catColor}38`,
                borderRadius: 8, padding: "2px 7px",
                fontSize: 10.5, color: colors.textMuted,
              }}>
                {item.catEmoji} {item.text}
              </span>
            );
          })}
          {onFocusPack && (
            <button onClick={onFocusPack} style={{
              background: "none", border: "none",
              color: colors.sky, fontSize: 11, fontWeight: 700,
              cursor: "pointer", padding: "2px 6px",
            }}>
              paklijst →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DayWeather({ date, wxStatus, wxDays, availableFrom }) {
  if (wxStatus === "loading") return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${colors.surfaceBorder}`, fontSize: 11, color: colors.textMuted }}>
      🌤 Weerdata laden…
    </div>
  );

  if (wxStatus === "too-early") return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${colors.surfaceBorder}`, fontSize: 11, color: colors.textMuted }}>
      📅 Weerdata beschikbaar vanaf {availableFrom ? fmtDate(availableFrom) : "…"}
    </div>
  );

  const wx = (wxDays ?? []).find((d) => d.date === date);
  if (!wx) return null;

  const rainColor = wx.precipProb >= 60 ? "#60A5FA" : wx.precipProb >= 30 ? "#93C5FD" : colors.textMuted;

  return (
    <div style={{
      marginTop: 10, paddingTop: 10, borderTop: `1px solid ${colors.surfaceBorder}`,
      display: "flex", flexWrap: "wrap", gap: "6px 14px", alignItems: "center",
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>
        {wx.emoji} {wx.label}
      </span>
      <span style={{ fontSize: 12, color: colors.textMuted }}>
        🌡 {wx.tempMax}° / {wx.tempMin}°
      </span>
      <span style={{ fontSize: 12, color: colors.textMuted }}>
        💨 {wx.windKn} kn {wx.windDir}
      </span>
      <span style={{ fontSize: 12, color: wx.precipProb >= 40 ? rainColor : colors.textMuted }}>
        🌧 {wx.precipProb}%{wx.precipMm > 0 ? ` · ${wx.precipMm}mm` : ""}
      </span>
    </div>
  );
}

// ── Day journal ───────────────────────────────────────────────────

function DayJournal({ date }) {
  const { getNote, setNote } = useJournal();
  const [text, setText] = useState(() => getNote(date));
  const [editing, setEditing] = useState(false);

  useEffect(() => { setText(getNote(date)); setEditing(false); }, [date]);

  useEffect(() => {
    const t = setTimeout(() => setNote(date, text), 600);
    return () => clearTimeout(t);
  }, [text, date]);

  const handleBlur = () => setEditing(false);

  if (editing) {
    return (
      <div style={{ marginBottom: 12 }}>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          placeholder="Dagnotitie…"
          rows={3}
          style={{
            width: "100%", resize: "none", boxSizing: "border-box",
            background: colors.surface,
            border: `1px solid ${colors.surfaceBorder}`,
            borderRadius: 10, padding: "8px 12px",
            color: colors.text, fontSize: 12, lineHeight: 1.5,
            fontFamily: "inherit", outline: "none",
          }}
        />
      </div>
    );
  }

  if (text.trim()) {
    return (
      <div
        onClick={() => setEditing(true)}
        style={{
          marginBottom: 12, fontSize: 11, color: colors.textMuted,
          lineHeight: 1.5, cursor: "text",
          background: colors.surface,
          border: `1px solid ${colors.surfaceBorder}`,
          borderRadius: 10, padding: "8px 12px",
        }}
      >
        <span style={{ opacity: 0.5, marginRight: 5 }}>📝</span>{text}
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      style={{
        display: "block", background: "none", border: "none",
        padding: "2px 0", marginBottom: 12,
        color: colors.textMuted, fontSize: 11, opacity: 0.4, cursor: "pointer",
      }}
    >
      + dagnotitie
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────

export default function DaySchedule({ onFocusMap, onFocusPack }) {
  const { activeTrip } = useTrip();
  const isRoadtrip = activeTrip?.id === "europe-roadtrip-2026";
  const days              = isRoadtrip ? rtDays     : dkDays;
  const scheduleTypeColor = isRoadtrip ? rtTypeColor : dkTypeColor;
  const locations         = isRoadtrip ? rtLocations : dkLocations;
  const locationCategories = isRoadtrip ? rtCategories : dkCategories;

  const { status: wxStatus, days: wxDays, availableFrom, hourlyData } = useWeatherForecast(activeTrip);
  const { getNote: getSlotNote, setNote: setSlotNote } = useSlotNotes();

  // For each slot, look up the hourly weather at the slot's date+hour
  function slotHourly(date, timeStr) {
    const hour = timeStr.slice(0, 2);
    return hourlyData?.[`${date}T${hour}:00`] ?? null;
  }

  // Build item-id → {text, catColor, catEmoji} lookup from the active trip's packing list
  const packMap = useMemo(() => {
    const map = {};
    (activeTrip?.packingCategories ?? []).forEach((cat) => {
      cat.items.forEach((item) => {
        map[item.id] = { text: item.text, catColor: cat.color, catEmoji: cat.emoji };
      });
    });
    return map;
  }, [activeTrip?.packingCategories]);

  const todayISO = new Date().toISOString().slice(0, 10);
  const todayIdx = days.findIndex((d) => d.date === todayISO);
  const [selectedIdx, setSelectedIdx] = useState(todayIdx >= 0 ? todayIdx : 0);

  useEffect(() => {
    const idx = days.findIndex((d) => d.date === todayISO);
    setSelectedIdx(idx >= 0 ? idx : 0);
  }, [activeTrip?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const day = days[selectedIdx];
  const isLiveDay = day.date === todayISO;

  const [activeSlotId, setActiveSlotId] = useState(null);
  const [windTooltipIdx, setWindTooltipIdx] = useState(null);
  const slotRefs = useRef({});

  // Clear highlight + wind tooltip when day changes
  useEffect(() => { setActiveSlotId(null); setWindTooltipIdx(null); }, [selectedIdx]);

  // Compute active slot time range for weather highlight
  const activeSlot = activeSlotId ? day.slots.find((s) => s.id === activeSlotId) : null;
  const activeSlotIdx = activeSlot ? day.slots.indexOf(activeSlot) : -1;
  const activeSlotEndTime = activeSlot
    ? (activeSlot.endTime ?? day.slots[activeSlotIdx + 1]?.time ?? null)
    : null;
  const activeSlotStartMin = activeSlot ? parseMin(activeSlot.time) : null;
  const activeSlotEndMin   = activeSlotEndTime ? parseMin(activeSlotEndTime) : activeSlot ? activeSlotStartMin + 90 : null;

  // Live clock — ticks every 30 s, only runs when today's day is open
  const [nowMin, setNowMin] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  useEffect(() => {
    if (!isLiveDay) return;
    const tick = () => {
      const n = new Date();
      setNowMin(n.getHours() * 60 + n.getMinutes());
    };
    tick(); // sync immediately when this day becomes active
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [isLiveDay]);

  // Index of the slot currently in progress (last one whose time ≤ now).
  // -1 means we're before the first event.
  const activeIdx = isLiveDay
    ? day.slots.reduce((best, slot, i) => (parseMin(slot.time) <= nowMin ? i : best), -1)
    : -1;

  // Build a flat render list so we can inject the "now" separator inline.
  const renderItems = [];
  if (isLiveDay && activeIdx === -1 && day.slots.length > 0) {
    renderItems.push({ type: "now", nextSlotMin: parseMin(day.slots[0].time) });
  }
  day.slots.forEach((slot, i) => {
    const slotStatus = !isLiveDay        ? "upcoming"
                     : i < activeIdx     ? "past"
                     : i === activeIdx   ? "active"
                     :                    "upcoming";
    const endTime = slot.endTime ?? day.slots[i + 1]?.time ?? null;
    renderItems.push({ type: "slot", slot, i, slotStatus, isLast: i === day.slots.length - 1, endTime });
    if (isLiveDay && i === activeIdx && i < day.slots.length - 1) {
      renderItems.push({ type: "now", nextSlotMin: parseMin(day.slots[i + 1].time) });
    }
  });

  return (
    <div>

      {/* ── Day picker ────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 14, WebkitOverflowScrolling: "touch" }}>
        {days.map((d, i) => {
          const selected  = i === selectedIdx;
          const isToday   = d.date === todayISO;
          const hasKite   = d.slots.some((s) => s.type === "kite");
          const wxDay     = wxDays?.find((w) => w.date === d.date);
          const kiteWind  = wxDay?.windKitingAvg ?? null;
          const verdict   = kiteWind != null ? windVerdict(kiteWind) : null;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedIdx(i)}
              style={{
                flexShrink: 0, padding: "10px 12px", borderRadius: 12,
                border: `1px solid ${selected ? colors.sky : colors.surfaceBorder}`,
                background: selected ? `${colors.sky}22` : colors.surface,
                cursor: "pointer", textAlign: "center", minWidth: 68, minHeight: 52,
                position: "relative",
              }}
            >
              {isToday && (
                <span style={{
                  position: "absolute", top: -7, left: "50%", transform: "translateX(-50%)",
                  background: colors.success, color: "#fff", fontSize: 8, fontWeight: 800,
                  borderRadius: 8, padding: "1px 5px", letterSpacing: 0.5, whiteSpace: "nowrap",
                }}>
                  VANDAAG
                </span>
              )}
              <div style={{ fontSize: 20, marginBottom: 2 }}>{d.emoji}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: selected ? colors.text : colors.textBody }}>
                {d.short}
              </div>
              <div style={{ fontSize: 9, color: selected ? colors.textMuted : colors.textMuted, marginTop: 1, lineHeight: 1.3 }}>
                {d.title}
              </div>
              {hasKite && verdict && (
                <div
                  onClick={(e) => { e.stopPropagation(); setWindTooltipIdx((p) => p === i ? null : i); }}
                  style={{
                    marginTop: 4, fontSize: 9, fontWeight: 700, color: verdict.color, lineHeight: 1,
                    background: windTooltipIdx === i ? `${verdict.color}22` : "transparent",
                    borderRadius: 4, padding: "1px 3px",
                  }}
                >
                  {kiteWind}kn
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Wind tooltip card ────────────────────────────────────── */}
      {windTooltipIdx != null && (() => {
        const td = days[windTooltipIdx];
        const txDay = wxDays?.find((w) => w.date === td.date);
        if (!txDay) return null;
        const v = windVerdict(txDay.windKitingAvg);
        return (
          <div
            onClick={() => setWindTooltipIdx(null)}
            style={{
              background: colors.surface, border: `1px solid ${v.color}55`,
              borderRadius: 10, padding: "9px 13px", marginBottom: 10, marginTop: -6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: colors.text }}>{td.short}</span>
              <span style={{ fontSize: 11, color: v.color, fontWeight: 700 }}>{v.emoji} {v.label}</span>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 11, color: colors.textMuted, flexWrap: "wrap" }}>
              <span>💨 {txDay.windKitingAvg}kn gem. · {txDay.windKitingMax}kn max</span>
              <span>🧭 {txDay.windDir}</span>
              <span>🌡️ {txDay.tempMax}°</span>
              {txDay.precipMm > 0 && <span>🌧️ {txDay.precipMm}mm</span>}
            </div>
          </div>
        );
      })()}

      {/* ── Day header ───────────────────────────────────────────── */}
      <div style={{
        background: colors.surface, border: `1px solid ${colors.surfaceBorder}`,
        borderRadius: 14, padding: "14px 16px", marginBottom: 16,
      }}>
        <div style={{ color: colors.text, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
          {day.emoji} {day.short} — {day.title}
        </div>
        <div style={{ color: colors.textMuted, fontSize: 13, lineHeight: 1.5 }}>{day.note}</div>
        <DayWeather date={day.date} wxStatus={wxStatus} wxDays={wxDays} availableFrom={availableFrom} />

        {/* ── Unified weather + timeline panel ── */}
        <div style={{
          position: "relative",
          marginTop: 10,
          background: "#091520",
          borderRadius: 8,
          padding: "6px 0 6px",
          overflow: "hidden",
        }}>
          {/* Guide lines at 6 / 12 / 18h — zIndex:3 so they show through the timeline bar */}
          {[25, 50, 75].map((p) => (
            <div key={p} style={{
              position: "absolute", left: `${p}%`,
              top: 0, bottom: 0, width: 1,
              background: `${colors.surfaceBorder}55`,
              pointerEvents: "none", zIndex: 3,
            }} />
          ))}

          {/* Vertical highlight strip for active slot */}
          {activeSlot && (
            <div style={{
              position: "absolute", zIndex: 1, pointerEvents: "none",
              left:  `${(activeSlotStartMin / 1440 * 100).toFixed(2)}%`,
              width: `${((activeSlotEndMin - activeSlotStartMin) / 1440 * 100).toFixed(2)}%`,
              top: 0, bottom: 0,
              background: `${scheduleTypeColor[activeSlot.type] || colors.sky}22`,
              borderLeft:  `1px solid ${scheduleTypeColor[activeSlot.type] || colors.sky}55`,
              borderRight: `1px solid ${scheduleTypeColor[activeSlot.type] || colors.sky}55`,
            }} />
          )}

          <DaySparklines
            date={day.date}
            hourlyData={hourlyData}
            highlightStartMin={activeSlotStartMin}
            highlightEndMin={activeSlotEndMin}
          />

          {activeTrip?.lat && <div style={{ height: 1, background: `${colors.surfaceBorder}40`, margin: "4px 0 0" }} />}

          {activeTrip?.lat && (
            <DayTimeline
              day={day}
              scheduleTypeColor={scheduleTypeColor}
              nowMin={isLiveDay ? nowMin : null}
              sunTimes={getSunTimes(activeTrip.lat, activeTrip.lon, day.date)}
              activeSlotId={activeSlotId}
              onSlotClick={(id) => {
                setActiveSlotId(id);
                slotRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }}
            />
          )}
        </div>
      </div>

      {/* ── Day packing summary ───────────────────────────────────── */}
      <DayPackingSummary slots={day.slots} packMap={packMap} onFocusPack={onFocusPack} />

      {/* ── Journal ──────────────────────────────────────────────── */}
      <DayJournal date={day.date} />

      {/* ── Timeline ─────────────────────────────────────────────── */}
      <div style={{ position: "relative", paddingLeft: 4 }}>
        {renderItems.map((item, idx) => {

          // ── Now separator ──────────────────────────────────────
          if (item.type === "now") {
            return (
              <NowSeparator key="now-sep" nowMin={nowMin} nextSlotMin={item.nextSlotMin} />
            );
          }

          // ── Slot ───────────────────────────────────────────────
          const { slot, slotStatus, isLast, endTime } = item;
          const isPast   = slotStatus === "past";
          const isActive = slotStatus === "active";
          const accent   = scheduleTypeColor[slot.type] || colors.sky;

          // Pre-compute slot weather and duration for title row use
          const slotH  = slotHourly(day.date, slot.time);
          const slotWx = wxDays?.find((d) => d.date === day.date);
          const wx2    = (slotH && slotWx && !isPast) ? slotWeatherInfo(day.date, slot.time, endTime, hourlyData) : null;
          const durationMin = endTime ? parseMin(endTime) - parseMin(slot.time) : null;
          const durationLabel = durationMin
            ? durationMin >= 60
              ? `${Math.floor(durationMin / 60)}u${durationMin % 60 > 0 ? durationMin % 60 + "m" : ""}`
              : `${durationMin}m`
            : null;
          const linkedLoc = slot.locationId
            ? locations.find((l) => l.id === slot.locationId)
            : null;
          const locColor = linkedLoc ? locationCategories[linkedLoc.category].color : null;

          const isHighlighted = activeSlotId === slot.id;

          return (
            <div
              key={slot.id}
              ref={(el) => { slotRefs.current[slot.id] = el; }}
              onClick={() => setActiveSlotId(isHighlighted ? null : slot.id)}
              style={{ display: "flex", gap: 12, opacity: isPast ? 0.38 : 1, transition: "opacity 0.4s", cursor: "pointer" }}
            >
              {/* Rail */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 44, flexShrink: 0 }}>
                <span style={{ color: colors.textBody, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  {slot.time}
                </span>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: `${accent}22`,
                  border: `2px solid ${accent}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0,
                  boxShadow: isActive ? `0 0 0 5px ${accent}20` : "none",
                }}>
                  {slot.emoji}
                </div>
                {!isLast && (
                  <div style={{
                    flex: 1, width: 2,
                    background: isPast ? `${colors.sky}50` : colors.surfaceBorder,
                    marginTop: 2, minHeight: 18,
                  }} />
                )}
              </div>

              {/* Card */}
              <div style={{
                flex: 1,
                background: isHighlighted ? `${accent}14` : isActive ? `${accent}08` : colors.surface,
                border: `1px solid ${isHighlighted ? `${accent}70` : isActive ? `${accent}45` : colors.surfaceBorder}`,
                borderLeft: `3px solid ${accent}`,
                borderRadius: 12,
                padding: "10px 14px",
                marginBottom: 12,
                boxShadow: isHighlighted ? `0 0 0 2px ${accent}30` : "none",
                transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
              }}>
                {/* ── Title row ────────────────────────────────── */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ color: colors.text, fontWeight: 700, fontSize: 14, flex: 1 }}>
                    {slot.title}
                  </div>
                  {durationLabel && !isPast && (
                    <span style={{
                      fontSize: 9, color: colors.textMuted, opacity: 0.55,
                      flexShrink: 0, whiteSpace: "nowrap",
                    }}>
                      {durationLabel}
                    </span>
                  )}
                  {wx2?.totalMm >= 2 && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: "#60A5FA",
                      background: "#60A5FA18", border: "1px solid #60A5FA30",
                      borderRadius: 6, padding: "1px 5px", flexShrink: 0,
                    }}>
                      💧 {wx2.totalMm}mm
                    </span>
                  )}
                  {wx2?.peakWind >= 22 && (
                    <span style={{
                      fontSize: 9, fontWeight: 700,
                      color: wx2.peakWind >= 28 ? "#EF4444" : "#F97316",
                      background: wx2.peakWind >= 28 ? "#EF444418" : "#F9731618",
                      border: `1px solid ${wx2.peakWind >= 28 ? "#EF444430" : "#F9731630"}`,
                      borderRadius: 6, padding: "1px 5px", flexShrink: 0,
                    }}>
                      💨 {wx2.peakWind}kn
                    </span>
                  )}
                  {isActive && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, color: accent,
                      background: `${accent}20`, borderRadius: 8,
                      padding: "2px 7px", whiteSpace: "nowrap", letterSpacing: "0.03em",
                      flexShrink: 0,
                    }}>
                      ▶ NU
                    </span>
                  )}
                </div>

                {/* ── Weather subtitle — one compact line ──────── */}
                {(() => {
                  const h = slotH;
                  if (!h || h.temp == null || !slotWx || !wx2) return null;
                  return (
                    <div style={{
                      display: "flex", alignItems: "flex-end", flexWrap: "wrap",
                      gap: "3px 10px", marginTop: 4, marginBottom: 2,
                    }}>
                      <span style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.4 }}>
                        {slotWx.emoji} {slotH.temp}°
                      </span>
                      {wx2.hasTemp && (() => {
                        const ts = wx2.tempBars.filter((t) => t != null);
                        const tMeta = ts.length ? `${Math.min(...ts)}°–${Math.max(...ts)}°` : null;
                        return (
                          <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
                            <span style={{ fontSize: 8, opacity: 0.65 }}>🌡</span>
                            <SparkBars
                              bars={buildTempBars(wx2.tempBars)}
                              showLabels startH={wx2.startH}
                              tooltip={{ title: "🌡 Temperatuur", meta: tMeta, rows: slotTooltipRows(wx2, "temp") }}
                            />
                          </div>
                        );
                      })()}
                      {wx2.hasRain && (
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                          <span style={{ fontSize: 10, color: "#60A5FA", fontWeight: 700, lineHeight: 1 }}>
                            💧 {wx2.totalMm}mm
                          </span>
                          <SparkBars
                            bars={buildRainBars(wx2.bars, wx2.maxP)}
                            showLabels startH={wx2.startH}
                            tooltip={{ title: "💧 Regen", meta: `${wx2.totalMm}mm · ${slot.time}–${endTime ?? ""}`, rows: slotTooltipRows(wx2, "rain") }}
                          />
                        </div>
                      )}
                      {wx2.hasWind && (
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, lineHeight: 1,
                            color: slotH.wind >= 25 ? "#F97316" : slotH.wind >= 15 ? "#34D399" : slotH.wind >= 8 ? "#6EE7B7" : colors.textMuted,
                          }}>
                            💨 {slotH.wind}kn
                          </span>
                          <SparkBars
                            bars={buildWindBars(wx2.windBars, wx2.maxWind)}
                            showLabels startH={wx2.startH}
                            tooltip={{ title: "💨 Wind", meta: `max ${wx2.maxWind}kn`, rows: slotTooltipRows(wx2, "wind") }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ── Description ──────────────────────────────── */}
                <div style={{ color: colors.textMuted, fontSize: 12.5, lineHeight: 1.5, marginTop: 2 }}>
                  {slot.desc}
                </div>

                {/* ── Location link ─────────────────────────────── */}
                {linkedLoc && onFocusMap && !isPast && (
                  <button
                    onClick={() => onFocusMap(slot.locationId)}
                    style={{
                      marginTop: 4, background: "none", border: "none",
                      color: locColor, fontSize: 12, fontWeight: 700,
                      cursor: "pointer", padding: "8px 0",
                      minHeight: 44, display: "flex", alignItems: "center", gap: 4,
                    }}
                  >
                    📍 {linkedLoc.emoji} {linkedLoc.name}
                  </button>
                )}

                {/* ── Gear chips ────────────────────────────────── */}
                {!isPast && (slot.gear ?? []).length > 0 && (
                  <div style={{ marginTop: 9, display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
                    {(slot.gear ?? []).map((id) => {
                      const item = packMap[id];
                      if (!item) return null;
                      return (
                        <span key={id} style={{
                          display: "inline-flex", alignItems: "center", gap: 3,
                          background: `${item.catColor}18`,
                          border: `1px solid ${item.catColor}38`,
                          borderRadius: 8, padding: "2px 7px",
                          fontSize: 10.5, color: colors.textMuted,
                          maxWidth: 170, overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {item.catEmoji} {item.text}
                        </span>
                      );
                    })}
                    {onFocusPack && (
                      <button onClick={onFocusPack} style={{
                        background: "none", border: "none",
                        color: colors.sky, fontSize: 11, fontWeight: 700,
                        cursor: "pointer", padding: "6px 8px", minHeight: 36,
                      }}>
                        🎒 paklijst →
                      </button>
                    )}
                  </div>
                )}

                {/* ── Slot note ─────────────────────────────────── */}
                <SlotNote
                  date={day.date}
                  time={slot.time}
                  getNote={getSlotNote}
                  setNote={setSlotNote}
                />
              </div>
            </div>
          );
        })}

        {/* All-done footer */}
        {isLiveDay && activeIdx === day.slots.length - 1 && (
          <div style={{
            textAlign: "center", padding: "4px 0 8px",
            fontSize: 12, color: "#34D399", fontWeight: 700,
          }}>
            ✓ Dagprogramma afgerond
          </div>
        )}
      </div>

    </div>
  );
}

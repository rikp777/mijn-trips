import { useState, useEffect } from "react";
import { colors } from "../constants/theme";
import { days as dkDays, scheduleTypeColor as dkTypeColor } from "../data/schedule";
import { days as rtDays, scheduleTypeColor as rtTypeColor } from "../data/schedule-roadtrip-2026";
import { locations as dkLocations, locationCategories as dkCategories } from "../data/locations";
import { locations as rtLocations, roadtripCategories as rtCategories } from "../data/locations-roadtrip-2026";
import { useTrip } from "../context/TripContext";
import { useJournal } from "../hooks/useJournal";

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

// ── Day journal ───────────────────────────────────────────────────

function DayJournal({ date }) {
  const { getNote, setNote } = useJournal();
  const [text, setText] = useState(() => getNote(date));
  const [saved, setSaved] = useState(false);

  useEffect(() => { setText(getNote(date)); }, [date]);

  useEffect(() => {
    const t = setTimeout(() => {
      setNote(date, text);
      if (text.trim()) setSaved(true);
    }, 600);
    return () => clearTimeout(t);
  }, [text, date]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  return (
    <div style={{
      background: colors.surface,
      border: `1px solid ${colors.surfaceBorder}`,
      borderRadius: 14,
      padding: "14px 16px",
      marginBottom: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: colors.textMuted }}>📝 Dagnotitie</span>
        {saved && <span style={{ fontSize: 10, color: colors.success }}>✓ Opgeslagen</span>}
      </div>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setSaved(false); }}
        placeholder="Wat heb je vandaag geleerd? Bijzonderheden? Tips voor jezelf…"
        rows={3}
        style={{
          width: "100%",
          background: colors.bg,
          border: `1px solid ${colors.surfaceBorder}`,
          borderRadius: 8,
          padding: "10px 12px",
          color: colors.text,
          fontSize: 13,
          lineHeight: 1.55,
          resize: "vertical",
          fontFamily: "inherit",
          boxSizing: "border-box",
          outline: "none",
        }}
      />
      <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 5 }}>
        Opgeslagen in je browser · ook offline beschikbaar
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────

export default function DaySchedule({ onFocusMap }) {
  const { activeTrip } = useTrip();
  const isRoadtrip = activeTrip?.id === "europe-roadtrip-2026";
  const days              = isRoadtrip ? rtDays     : dkDays;
  const scheduleTypeColor = isRoadtrip ? rtTypeColor : dkTypeColor;
  const locations         = isRoadtrip ? rtLocations : dkLocations;
  const locationCategories = isRoadtrip ? rtCategories : dkCategories;

  const todayISO = new Date().toISOString().slice(0, 10);
  const todayIdx = days.findIndex((d) => d.date === todayISO);
  const [selectedIdx, setSelectedIdx] = useState(todayIdx >= 0 ? todayIdx : 0);

  useEffect(() => {
    const idx = days.findIndex((d) => d.date === todayISO);
    setSelectedIdx(idx >= 0 ? idx : 0);
  }, [activeTrip?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const day = days[selectedIdx];
  const isLiveDay = day.date === todayISO;

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
    renderItems.push({ type: "slot", slot, i, slotStatus, isLast: i === day.slots.length - 1 });
    if (isLiveDay && i === activeIdx && i < day.slots.length - 1) {
      renderItems.push({ type: "now", nextSlotMin: parseMin(day.slots[i + 1].time) });
    }
  });

  return (
    <div>

      {/* ── Day picker ────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 14, WebkitOverflowScrolling: "touch" }}>
        {days.map((d, i) => {
          const selected = i === selectedIdx;
          const isToday  = d.date === todayISO;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedIdx(i)}
              style={{
                flexShrink: 0, padding: "8px 12px", borderRadius: 12,
                border: `1px solid ${selected ? colors.sky : colors.surfaceBorder}`,
                background: selected ? `${colors.sky}22` : colors.surface,
                cursor: "pointer", textAlign: "center", minWidth: 68, position: "relative",
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
              <div style={{ fontSize: 10, fontWeight: 700, color: selected ? colors.sky : colors.textBody }}>
                {d.short}
              </div>
              <div style={{ fontSize: 9, color: selected ? colors.sky : colors.textMuted, marginTop: 1, lineHeight: 1.3 }}>
                {d.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Day header ───────────────────────────────────────────── */}
      <div style={{
        background: colors.surface, border: `1px solid ${colors.surfaceBorder}`,
        borderRadius: 14, padding: "14px 16px", marginBottom: 16,
      }}>
        <div style={{ color: colors.text, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
          {day.emoji} {day.short} — {day.title}
        </div>
        <div style={{ color: colors.textMuted, fontSize: 13, lineHeight: 1.5 }}>{day.note}</div>
      </div>

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
          const { slot, slotStatus, isLast } = item;
          const isPast   = slotStatus === "past";
          const isActive = slotStatus === "active";
          const accent   = scheduleTypeColor[slot.type] || colors.sky;
          const linkedLoc = slot.locationId
            ? locations.find((l) => l.id === slot.locationId)
            : null;
          const locColor = linkedLoc ? locationCategories[linkedLoc.category].color : null;

          return (
            <div
              key={slot.id}
              style={{ display: "flex", gap: 12, opacity: isPast ? 0.38 : 1, transition: "opacity 0.4s" }}
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
                background: isActive ? `${accent}08` : colors.surface,
                border: `1px solid ${isActive ? `${accent}45` : colors.surfaceBorder}`,
                borderLeft: `3px solid ${accent}`,
                borderRadius: 12,
                padding: "10px 14px",
                marginBottom: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ color: colors.text, fontWeight: 700, fontSize: 14, flex: 1 }}>
                    {slot.title}
                  </div>
                  {isActive && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, color: accent,
                      background: `${accent}20`, borderRadius: 8,
                      padding: "2px 7px", whiteSpace: "nowrap", letterSpacing: "0.03em",
                    }}>
                      ▶ NU
                    </span>
                  )}
                </div>
                <div style={{ color: colors.textMuted, fontSize: 12.5, lineHeight: 1.5, marginTop: 2 }}>
                  {slot.desc}
                </div>
                {linkedLoc && onFocusMap && !isPast && (
                  <button
                    onClick={() => onFocusMap(slot.locationId)}
                    style={{
                      marginTop: 8, background: "none", border: "none",
                      color: locColor, fontSize: 12, fontWeight: 700,
                      cursor: "pointer", padding: 0,
                      display: "flex", alignItems: "center", gap: 4,
                    }}
                  >
                    📍 {linkedLoc.emoji} {linkedLoc.name}
                  </button>
                )}
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

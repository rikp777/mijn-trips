import { useState, useEffect } from "react";
import { colors } from "../constants/theme";
import { days, scheduleTypeColor } from "../data/schedule";
import { locations, locationCategories } from "../data/locations";
import { useJournal } from "../hooks/useJournal";

function DayJournal({ date }) {
  const { getNote, setNote } = useJournal();
  const [text, setText] = useState(() => getNote(date));
  const [saved, setSaved] = useState(false);

  // Sync text when the selected day changes
  useEffect(() => { setText(getNote(date)); }, [date]);

  // Debounced save
  useEffect(() => {
    const t = setTimeout(() => {
      setNote(date, text);
      if (text.trim()) setSaved(true);
    }, 600);
    return () => clearTimeout(t);
  }, [text, date]);

  // Reset saved indicator after 2s
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
        {saved && (
          <span style={{ fontSize: 10, color: colors.success }}>✓ Opgeslagen</span>
        )}
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

/**
 * Per-day timeline for the full camp week (4–11 juli 2026).
 * A horizontal day-picker at the top switches between days.
 * Auto-selects today if the device date falls within the camp dates.
 * `onFocusMap(locationId)` switches the app to the map tab and flies there.
 */
export default function DaySchedule({ onFocusMap }) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const todayIdx = days.findIndex((d) => d.date === todayISO);
  const [selectedIdx, setSelectedIdx] = useState(todayIdx >= 0 ? todayIdx : 0);

  const day = days[selectedIdx];

  return (
    <div>
      {/* ── Day picker ────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 6,
          marginBottom: 14,
          // hide scrollbar on webkit
          WebkitOverflowScrolling: "touch",
        }}
      >
        {days.map((d, i) => {
          const selected = i === selectedIdx;
          const isToday = d.date === todayISO;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedIdx(i)}
              style={{
                flexShrink: 0,
                padding: "8px 12px",
                borderRadius: 12,
                border: `1px solid ${selected ? colors.sky : colors.surfaceBorder}`,
                background: selected ? colors.sky + "22" : colors.surface,
                cursor: "pointer",
                textAlign: "center",
                minWidth: 68,
                position: "relative",
              }}
            >
              {isToday && (
                <span
                  style={{
                    position: "absolute",
                    top: -7,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: colors.success,
                    color: "#fff",
                    fontSize: 8,
                    fontWeight: 800,
                    borderRadius: 8,
                    padding: "1px 5px",
                    letterSpacing: 0.5,
                    whiteSpace: "nowrap",
                  }}
                >
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

      {/* ── Selected day header ───────────────────────────────────── */}
      <div
        style={{
          background: colors.surface,
          border: `1px solid ${colors.surfaceBorder}`,
          borderRadius: 14,
          padding: "14px 16px",
          marginBottom: 16,
        }}
      >
        <div style={{ color: colors.text, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
          {day.emoji} {day.short} — {day.title}
        </div>
        <div style={{ color: colors.textMuted, fontSize: 13, lineHeight: 1.5 }}>{day.note}</div>
      </div>

      {/* ── Journal ──────────────────────────────────────────────── */}
      <DayJournal date={day.date} />

      {/* ── Timeline ─────────────────────────────────────────────── */}
      <div style={{ position: "relative", paddingLeft: 4 }}>
        {day.slots.map((slot, i) => {
          const accent = scheduleTypeColor[slot.type] || colors.sky;
          const isLast = i === day.slots.length - 1;
          const linkedLoc = slot.locationId
            ? locations.find((l) => l.id === slot.locationId)
            : null;
          const locColor = linkedLoc ? locationCategories[linkedLoc.category].color : null;

          return (
            <div key={slot.id} style={{ display: "flex", gap: 12 }}>
              {/* Rail */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 44, flexShrink: 0 }}>
                <span style={{ color: colors.textBody, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  {slot.time}
                </span>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: accent + "22",
                    border: `2px solid ${accent}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {slot.emoji}
                </div>
                {!isLast && (
                  <div
                    style={{
                      flex: 1,
                      width: 2,
                      background: colors.surfaceBorder,
                      marginTop: 2,
                      minHeight: 18,
                    }}
                  />
                )}
              </div>

              {/* Card */}
              <div
                style={{
                  flex: 1,
                  background: colors.surface,
                  border: `1px solid ${colors.surfaceBorder}`,
                  borderLeft: `3px solid ${accent}`,
                  borderRadius: 12,
                  padding: "10px 14px",
                  marginBottom: 12,
                }}
              >
                <div style={{ color: colors.text, fontWeight: 700, fontSize: 14 }}>{slot.title}</div>
                <div style={{ color: colors.textMuted, fontSize: 12.5, lineHeight: 1.5, marginTop: 2 }}>
                  {slot.desc}
                </div>
                {linkedLoc && onFocusMap && (
                  <button
                    onClick={() => onFocusMap(slot.locationId)}
                    style={{
                      marginTop: 8,
                      background: "none",
                      border: "none",
                      color: locColor,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    📍 {linkedLoc.emoji} {linkedLoc.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

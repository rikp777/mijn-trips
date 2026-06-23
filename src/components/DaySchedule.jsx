import { useState, useEffect, useMemo } from "react";
import { colors } from "../constants/theme";
import SparkBars, { buildRainBars, buildWindBars, buildTempBars } from "./SparkBars";
import { days as dkDays, scheduleTypeColor as dkTypeColor } from "../data/schedule";
import { days as rtDays, scheduleTypeColor as rtTypeColor } from "../data/schedule-roadtrip-2026";
import { locations as dkLocations, locationCategories as dkCategories } from "../data/locations";
import { locations as rtLocations, roadtripCategories as rtCategories } from "../data/locations-roadtrip-2026";
import { useTrip } from "../context/TripContext";
import { useJournal } from "../hooks/useJournal";
import { useWeatherForecast } from "../hooks/useWeatherForecast";

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
  const rows = [];
  for (let i = 0; i < wx2.bars.length; i += 2) {
    const h = wx2.startH + i / 2;
    const label = `${String(h).padStart(2, "0")}:00`;
    const rain = wx2.bars[i];
    const wind = wx2.windBars[i];
    const temp = wx2.tempBars[i];
    if (variant === "temp") {
      rows.push({
        label, primary: temp != null ? `${temp}°` : "–", color: temp != null ? tempColor(temp) : colors.textMuted,
        extra: [...(rain >= 0.1 ? [{ emoji: "💧", text: `${rain}mm` }] : []), ...(wind > 0 ? [{ emoji: "💨", text: `${wind}kn` }] : [])],
      });
    } else if (variant === "rain") {
      rows.push({
        label, primary: rain >= 0.1 ? `${rain}mm` : "droog", color: rain >= 0.1 ? rainColor(rain) : colors.textMuted,
        extra: [...(temp != null ? [{ emoji: "🌡", text: `${temp}°` }] : []), ...(wind > 0 ? [{ emoji: "💨", text: `${wind}kn` }] : [])],
      });
    } else {
      rows.push({
        label, primary: wind > 0 ? `${wind}kn` : "kalm", color: wind > 0 ? windColor(wind) : colors.textMuted,
        extra: [...(temp != null ? [{ emoji: "🌡", text: `${temp}°` }] : []), ...(rain >= 0.1 ? [{ emoji: "💧", text: `${rain}mm` }] : [])],
      });
    }
  }
  return rows;
}

function dayTooltipRows(hours, variant) {
  return hours.map(({ h, precip, wind, temp }) => {
    const label = `${String(h).padStart(2, "0")}:00`;
    if (variant === "temp") {
      return {
        label, primary: temp != null ? `${temp}°` : "–", color: temp != null ? tempColor(temp) : colors.textMuted,
        extra: [...(precip >= 0.1 ? [{ emoji: "💧", text: `${precip}mm` }] : []), ...(wind > 0 ? [{ emoji: "💨", text: `${wind}kn` }] : [])],
      };
    } else if (variant === "rain") {
      return {
        label, primary: precip >= 0.1 ? `${precip}mm` : "droog", color: precip >= 0.1 ? rainColor(precip) : colors.textMuted,
        extra: [...(temp != null ? [{ emoji: "🌡", text: `${temp}°` }] : []), ...(wind > 0 ? [{ emoji: "💨", text: `${wind}kn` }] : [])],
      };
    } else {
      return {
        label, primary: wind > 0 ? `${wind}kn` : "kalm", color: wind > 0 ? windColor(wind) : colors.textMuted,
        extra: [...(temp != null ? [{ emoji: "🌡", text: `${temp}°` }] : []), ...(precip >= 0.1 ? [{ emoji: "💧", text: `${precip}mm` }] : [])],
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

function DaySparklines({ date, hourlyData }) {
  const hours = Array.from({ length: 24 }, (_, h) => {
    const key = `${date}T${String(h).padStart(2, "0")}:00`;
    const d = hourlyData?.[key];
    return { h, precip: d?.precip ?? 0, wind: d?.wind ?? 0, temp: d?.temp ?? null };
  });

  const anyRain = hours.some((h) => h.precip >= 0.1);
  const anyWind = hours.some((h) => h.wind > 0);
  const temps = hours.map((h) => h.temp).filter((t) => t != null);
  const anyTemp = temps.length > 0;
  if (!anyRain && !anyWind && !anyTemp) return null;

  const maxRain = Math.max(...hours.map((h) => h.precip), 0.5);
  const maxWind = Math.max(...hours.map((h) => h.wind), 15);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = Math.max(maxTemp - minTemp, 1);

  const barRow = (emoji, element) => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 3 }}>
      <span style={{ fontSize: 9, lineHeight: 1, width: 12, flexShrink: 0 }}>{emoji}</span>
      {element}
    </div>
  );

  const hourLabels = (
    <div style={{ display: "flex", justifyContent: "space-between", width: 95, marginTop: 1, paddingLeft: 16 }}>
      {[0, 6, 12, 18].map((h) => (
        <span key={h} style={{ fontSize: 6, lineHeight: 1, color: colors.textMuted, opacity: 0.5 }}>{h}</span>
      ))}
    </div>
  );

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${colors.surfaceBorder}` }}>
      {anyTemp && barRow("🌡", (
        <SparkBars height={6}
          bars={buildTempBars(hours.map((h) => h.temp), { min: minTemp, max: maxTemp })}
          tooltip={{ title: "🌡 Temperatuur", rows: dayTooltipRows(hours, "temp") }}
        />
      ))}
      {anyRain && barRow("💧", (
        <SparkBars height={6}
          bars={buildRainBars(hours.map((h) => h.precip), maxRain, { dayView: true })}
          tooltip={{ title: "💧 Regen", rows: dayTooltipRows(hours, "rain") }}
        />
      ))}
      {anyWind && barRow("💨", (
        <SparkBars height={6}
          bars={buildWindBars(hours.map((h) => h.wind), maxWind)}
          tooltip={{ title: "💨 Wind", rows: dayTooltipRows(hours, "wind") }}
        />
      ))}
      {hourLabels}
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

export default function DaySchedule({ onFocusMap, onFocusPack }) {
  const { activeTrip } = useTrip();
  const isRoadtrip = activeTrip?.id === "europe-roadtrip-2026";
  const days              = isRoadtrip ? rtDays     : dkDays;
  const scheduleTypeColor = isRoadtrip ? rtTypeColor : dkTypeColor;
  const locations         = isRoadtrip ? rtLocations : dkLocations;
  const locationCategories = isRoadtrip ? rtCategories : dkCategories;

  const { status: wxStatus, days: wxDays, availableFrom, hourlyData } = useWeatherForecast(activeTrip);

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
    const endTime = day.slots[i + 1]?.time ?? null;
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
          const selected = i === selectedIdx;
          const isToday  = d.date === todayISO;
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
        <DayWeather date={day.date} wxStatus={wxStatus} wxDays={wxDays} availableFrom={availableFrom} />
        <DaySparklines date={day.date} hourlyData={hourlyData} />
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
          const { slot, slotStatus, isLast, endTime } = item;
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
                {/* ── Title row ────────────────────────────────── */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ color: colors.text, fontWeight: 700, fontSize: 14, flex: 1 }}>
                    {slot.title}
                  </div>
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
                  const h = slotHourly(day.date, slot.time);
                  const wx = wxDays?.find((d) => d.date === day.date);
                  if (!h || h.temp == null || !wx) return null;
                  const wx2 = slotWeatherInfo(day.date, slot.time, endTime, hourlyData);
                  return (
                    <div style={{
                      display: "flex", alignItems: "flex-end", flexWrap: "wrap",
                      gap: "3px 10px", marginTop: 4, marginBottom: 2,
                    }}>
                      <span style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.4 }}>
                        {wx.emoji} {h.temp}°
                      </span>
                      {wx2.hasTemp && (
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
                          <span style={{ fontSize: 8, opacity: 0.65 }}>🌡</span>
                          <SparkBars
                            bars={buildTempBars(wx2.tempBars)}
                            tooltip={{ title: "🌡 Temperatuur", rows: slotTooltipRows(wx2, "temp") }}
                          />
                        </div>
                      )}
                      {wx2.hasRain && (
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                          <span style={{ fontSize: 10, color: "#60A5FA", fontWeight: 700, lineHeight: 1 }}>
                            💧 {wx2.totalMm}mm
                          </span>
                          <SparkBars
                            bars={buildRainBars(wx2.bars, wx2.maxP)}
                            tooltip={{ title: "💧 Regen", rows: slotTooltipRows(wx2, "rain") }}
                          />
                        </div>
                      )}
                      {wx2.hasWind && (
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, lineHeight: 1,
                            color: h.wind >= 25 ? "#F97316" : h.wind >= 15 ? "#34D399" : h.wind >= 8 ? "#6EE7B7" : colors.textMuted,
                          }}>
                            💨 {h.wind}kn
                          </span>
                          <SparkBars
                            bars={buildWindBars(wx2.windBars, wx2.maxWind)}
                            tooltip={{ title: "💨 Wind", rows: slotTooltipRows(wx2, "wind") }}
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

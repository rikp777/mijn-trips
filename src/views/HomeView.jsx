import { useState } from "react";
import { colors } from "../constants/theme";
import { useWeatherForecast, sessionVerdict } from "../hooks/useWeatherForecast";
import { useTrip } from "../context/TripContext";
import PageHero from "../components/PageHero";
import WindWidget from "../components/WindWidget";

// ── Helpers ──────────────────────────────────────────────────────

const NL_DAYS = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

function formatDateRange(startDate, endDate) {
  const s = new Date(startDate + "T12:00:00");
  const e = new Date(endDate   + "T12:00:00");
  const months = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear())
    return `${s.getDate()}–${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
  return `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]} ${s.getFullYear()}`;
}

function useTripPhase(startDate, endDate) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const todayStr = now.toISOString().slice(0, 10);
  if (todayStr < startDate) {
    return { phase: "before", daysUntil: Math.round((new Date(startDate + "T00:00:00") - now) / 86400000) };
  }
  if (todayStr <= endDate) {
    const totalDays = Math.round((new Date(endDate + "T00:00:00") - new Date(startDate + "T00:00:00")) / 86400000) + 1;
    return { phase: "during", dayOfTrip: Math.round((now - new Date(startDate + "T00:00:00")) / 86400000) + 1, totalDays };
  }
  return { phase: "after" };
}

function getTripDates(startDate, endDate) {
  const dates = [];
  const cur = new Date(startDate + "T12:00:00");
  const end = new Date(endDate + "T12:00:00");
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

// ── Trip overview card ───────────────────────────────────────────

const NL_MONTHS = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
function fmtDate(isoStr) {
  const d = new Date(isoStr + "T12:00:00");
  return `${d.getDate()} ${NL_MONTHS[d.getMonth()]}`;
}

function TripOverviewCard({ trip, isActive, onSelect }) {
  const { status, days, isPastTrip, availableFrom } = useWeatherForecast(trip);
  const phase = useTripPhase(trip.startDate, trip.endDate);
  const [activeDate, setActiveDate] = useState(null);

  const tripDates = getTripDates(trip.startDate, trip.endDate);
  const dayMap = Object.fromEntries(
    days.filter((d) => d.isTripDay).map((d) => [d.date, d])
  );
  const tripDaysWithData = tripDates.map((date) => dayMap[date]).filter(Boolean);

  const avgWind = tripDaysWithData.length
    ? Math.round(tripDaysWithData.reduce((s, d) => s + (d.windKitingAvg || 0), 0) / tripDaysWithData.length) : null;
  const avgTemp = tripDaysWithData.length
    ? Math.round(tripDaysWithData.reduce((s, d) => s + d.tempMax, 0) / tripDaysWithData.length) : null;
  const verdicts    = tripDaysWithData.map((d) => sessionVerdict(d));
  const goodCount   = verdicts.filter((v) => v.status === "go").length;
  const cancelCount = verdicts.filter((v) => v.status === "cancel").length;
  const outOfWindow = tripDates.length - tripDaysWithData.length;

  let badge;
  if (phase.phase === "during")
    badge = { label: `Dag ${phase.dayOfTrip}/${phase.totalDays}`, bg: "#34D39922", color: "#34D399" };
  else if (phase.phase === "before")
    badge = { label: `Aankomend · ${phase.daysUntil}d`, bg: `${colors.sky}22`, color: colors.sky };
  else
    badge = { label: "Afgerond ✓", bg: `${colors.textMuted}18`, color: colors.textMuted };

  const handleBubble = (date, e) => {
    e.stopPropagation();
    setActiveDate((prev) => (prev === date ? null : date));
  };

  const activeDay = activeDate ? dayMap[activeDate] : null;
  const activeDateObj = activeDate ? new Date(activeDate + "T12:00:00") : null;

  return (
    <div
      onClick={() => onSelect(trip.id)}
      style={{
        background: isActive ? `${colors.sky}0A` : colors.surface,
        border: `1.5px solid ${isActive ? colors.sky : colors.surfaceBorder}`,
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        marginBottom: 10,
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      {/* Header */}
      <div style={{ padding: "12px 14px 10px", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>
          {trip.flag ?? trip.emoji}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: isActive ? colors.sky : colors.text }}>
              {trip.name}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, background: badge.bg, color: badge.color, borderRadius: 20, padding: "2px 8px" }}>
              {badge.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
            {trip.subtitle} · {formatDateRange(trip.startDate, trip.endDate)}
          </div>
        </div>
      </div>

      {/* Weather content */}
      {status === "loading" && (
        <div style={{ padding: "0 14px 12px", fontSize: 12, color: colors.textMuted }}>
          {isPastTrip ? "📜 Historisch weer laden…" : "☁️ Weerdata laden…"}
        </div>
      )}

      {status === "ready" && (
        <>
          {/* Day verdict dots — all expected trip days */}
          <div style={{ display: "flex", gap: 3, padding: "0 14px 4px" }}>
            {tripDates.map((date) => {
              const day = dayMap[date];
              const d = new Date(date + "T12:00:00");
              const isSelected = activeDate === date;

              if (day) {
                const v = sessionVerdict(day);
                return (
                  <div
                    key={date}
                    onClick={(e) => handleBubble(date, e)}
                    onMouseEnter={() => setActiveDate(date)}
                    onMouseLeave={() => setActiveDate((prev) => (prev === date ? null : prev))}
                    style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer" }}
                  >
                    <div style={{
                      width: "100%", height: 28, borderRadius: 6,
                      background: isSelected ? `${v.color}40` : `${v.color}28`,
                      border: `1px solid ${isSelected ? v.color : `${v.color}50`}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13,
                      transition: "background 0.1s, border-color 0.1s",
                    }}>
                      {v.emoji}
                    </div>
                    <span style={{ fontSize: 8, color: isSelected ? colors.accentLight : colors.textMuted, fontWeight: 600 }}>
                      {NL_DAYS[d.getDay()]}
                    </span>
                  </div>
                );
              }

              // No forecast data yet — outside 16-day window
              return (
                <div key={date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{
                    width: "100%", height: 28, borderRadius: 6,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px dashed rgba(255,255,255,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: "rgba(255,255,255,0.2)",
                  }}>
                    ·
                  </div>
                  <span style={{ fontSize: 8, color: colors.textMuted, fontWeight: 600, opacity: 0.4 }}>
                    {NL_DAYS[d.getDay()]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Hover / tap detail panel */}
          {activeDay && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                margin: "4px 14px 6px",
                padding: "9px 11px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 8,
                border: `1px solid ${sessionVerdict(activeDay).color}50`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>
                  {NL_DAYS[activeDateObj.getDay()]} {activeDateObj.getDate()}/{activeDateObj.getMonth() + 1}
                </span>
                <span style={{ fontSize: 11, color: colors.textMuted }}>
                  {activeDay.emoji} {activeDay.label}
                </span>
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 11, color: colors.textMuted, flexWrap: "wrap" }}>
                <span>💨 {activeDay.windKitingAvg}kn gem. · {activeDay.windKitingMax}kn max ({activeDay.windDir})</span>
                <span>🌡️ {activeDay.tempMax}°C</span>
                {activeDay.precipMm > 0 && <span>🌧️ {activeDay.precipMm}mm</span>}
              </div>
              <div style={{ marginTop: 5, fontSize: 11, fontWeight: 700, color: sessionVerdict(activeDay).color }}>
                {sessionVerdict(activeDay).short}
              </div>
            </div>
          )}

          {/* Out-of-window notice */}
          {outOfWindow > 0 && !activeDay && (
            <div style={{ padding: "2px 14px 6px", fontSize: 11, color: colors.textMuted, opacity: 0.6 }}>
              {outOfWindow} dag{outOfWindow > 1 ? "en vallen" : " valt"} nog buiten het 16-daagse voorspellingsvenster
            </div>
          )}

          {/* Stats */}
          {tripDaysWithData.length > 0 && (
            <div style={{
              display: "flex", gap: 20, padding: "8px 14px 12px",
              borderTop: `1px solid ${colors.surfaceBorder}`,
              flexWrap: "wrap",
            }}>
              {avgWind != null && (
                <div>
                  <div style={{ fontSize: 10, color: colors.textMuted }}>💨 Gem. wind</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: colors.text }}>{avgWind} kn</div>
                </div>
              )}
              {avgTemp != null && (
                <div>
                  <div style={{ fontSize: 10, color: colors.textMuted }}>🌡️ Gem. max temp</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: colors.text }}>{avgTemp}°C</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: 10, color: colors.textMuted }}>
                  🪁 {isPastTrip ? "Goede kitedagen" : "Verwacht goed"}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: goodCount > 0 ? "#34D399" : colors.textMuted }}>
                  {goodCount}/{tripDaysWithData.length}{outOfWindow > 0 ? ` +${outOfWindow}?` : ""}
                </div>
              </div>
              {cancelCount > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: colors.textMuted }}>
                    {isPastTrip ? "Geannuleerd" : "Kans op ann."}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#EF4444" }}>{cancelCount}</div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {status === "too-early" && (
        <div style={{ padding: "4px 14px 12px" }}>
          <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.5 }}>
            📅 Weersverwachting beschikbaar vanaf <strong style={{ color: colors.textBody }}>{fmtDate(availableFrom)}</strong>
            <span style={{ opacity: 0.6 }}> — buiten het 16-daagse voorspellingsvenster</span>
          </div>
        </div>
      )}

      {status === "error" && (
        <div style={{ padding: "0 14px 12px", fontSize: 12, color: colors.textMuted }}>
          ⚠️ Weerdata niet beschikbaar
        </div>
      )}
    </div>
  );
}

// ── Main view ────────────────────────────────────────────────────

export default function HomeView({ onOpenTrip }) {
  const { trips, activeTrip, setActiveTripId } = useTrip();

  const handleSelect = (id) => {
    setActiveTripId(id);
    onOpenTrip(id);
  };

  return (
    <>
      <PageHero eyebrow="🪁 Kite Trips" title="Dashboard" subtitle="Jouw kitesurf planner">
        <WindWidget />
      </PageHero>

      <div className="page-content">
        <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
          Mijn kite trips
        </div>

        {trips.map((trip) => (
          <TripOverviewCard
            key={trip.id}
            trip={trip}
            isActive={trip.id === activeTrip.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </>
  );
}

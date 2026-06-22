import { colors } from "../constants/theme";
import { useWeatherForecast, sessionVerdict } from "../hooks/useWeatherForecast";
import { useTrip } from "../context/TripContext";
import PageHero from "../components/PageHero";
import WindWidget from "../components/WindWidget";

// ── Helpers ──────────────────────────────────────────────────────

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

// ── Trip overview card ───────────────────────────────────────────

function TripOverviewCard({ trip, isActive, onSelect }) {
  const { status, days, isPastTrip } = useWeatherForecast(trip);
  const phase = useTripPhase(trip.startDate, trip.endDate);
  const tripDays = days.filter((d) => d.isTripDay);

  const avgWind = tripDays.length
    ? Math.round(tripDays.reduce((s, d) => s + (d.windKitingAvg || 0), 0) / tripDays.length) : null;
  const avgTemp = tripDays.length
    ? Math.round(tripDays.reduce((s, d) => s + d.tempMax, 0) / tripDays.length) : null;
  const verdicts   = tripDays.map((d) => sessionVerdict(d));
  const goodCount  = verdicts.filter((v) => v.status === "go").length;
  const cancelCount = verdicts.filter((v) => v.status === "cancel").length;

  let badge;
  if (phase.phase === "during")
    badge = { label: `Dag ${phase.dayOfTrip}/${phase.totalDays}`, bg: "#34D39922", color: "#34D399" };
  else if (phase.phase === "before")
    badge = { label: `Aankomend · ${phase.daysUntil}d`, bg: `${colors.sky}22`, color: colors.sky };
  else
    badge = { label: "Afgerond ✓", bg: `${colors.textMuted}18`, color: colors.textMuted };

  const NL = ["Zo","Ma","Di","Wo","Do","Vr","Za"];

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

      {status === "ready" && tripDays.length === 0 && (
        <div style={{ padding: "0 14px 12px", fontSize: 12, color: colors.textMuted }}>
          ❓ Voorspelling nog niet beschikbaar — te ver in de toekomst
        </div>
      )}

      {status === "ready" && tripDays.length > 0 && (
        <>
          {/* Day verdict dots */}
          <div style={{ display: "flex", gap: 3, padding: "0 14px 8px" }}>
            {tripDays.map((day) => {
              const v = sessionVerdict(day);
              const d = new Date(day.date + "T12:00:00");
              return (
                <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{
                    width: "100%", height: 28, borderRadius: 6,
                    background: `${v.color}28`, border: `1px solid ${v.color}50`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13,
                  }}>
                    {v.emoji}
                  </div>
                  <span style={{ fontSize: 8, color: colors.textMuted, fontWeight: 600 }}>
                    {NL[d.getDay()]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Stats */}
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
                {goodCount}/{tripDays.length}
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
        </>
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

export default function HomeView() {
  const { trips, activeTrip, setActiveTripId } = useTrip();

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
            onSelect={setActiveTripId}
          />
        ))}
      </div>
    </>
  );
}

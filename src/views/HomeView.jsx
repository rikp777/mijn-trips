import { colors } from "../constants/theme";
import PageHero from "../components/PageHero";
import WindWidget from "../components/WindWidget";
import WeatherForecast from "../components/WeatherForecast";

const TRIP_START_STR = "2026-07-04";
const TRIP_END_STR   = "2026-07-11";

function useTripStatus() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const tripStart = new Date(TRIP_START_STR + "T00:00:00");
  const tripEnd   = new Date(TRIP_END_STR   + "T00:00:00");
  const todayStr  = new Date().toISOString().slice(0, 10);

  if (todayStr < TRIP_START_STR) {
    const daysUntil = Math.round((tripStart - now) / 86400000);
    return { phase: "before", daysUntil };
  }
  if (todayStr <= TRIP_END_STR) {
    const dayOfTrip = Math.round((now - tripStart) / 86400000) + 1;
    return { phase: "during", dayOfTrip };
  }
  return { phase: "after" };
}

function TripCountdownCard() {
  const status = useTripStatus();

  let headline, sub;
  if (status.phase === "before") {
    headline = status.daysUntil === 1
      ? "Morgen vertrek je! 🚗"
      : `Nog ${status.daysUntil} dagen tot vertrek`;
    sub = "4–11 juli 2026 · Ringkøbing Fjord, Denemarken";
  } else if (status.phase === "during") {
    headline = `Dag ${status.dayOfTrip} van het kamp! 🪁`;
    sub = "Je kitet nu bij Ringkøbing Fjord — geniet ervan!";
  } else {
    headline = "Kamp afgerond — tot volgend jaar! 🏄";
    sub = "4–11 juli 2026 · Ringkøbing Fjord";
  }

  return (
    <div style={{
      background: colors.surface,
      border: `1px solid ${colors.surfaceBorder}`,
      borderRadius: 14,
      padding: "14px 16px",
      marginBottom: 14,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: colors.text, lineHeight: 1.25, marginBottom: 3 }}>
          {headline}
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted }}>{sub}</div>
      </div>

      {status.phase === "before" && (
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: colors.sky, lineHeight: 1 }}>
            {status.daysUntil}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color: colors.textMuted, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            dagen
          </div>
        </div>
      )}

      {status.phase === "during" && (
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#34D399", lineHeight: 1 }}>
            {status.dayOfTrip}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color: colors.textMuted, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            van 8
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomeView() {
  return (
    <>
      <PageHero
        eyebrow="🪁 Ripstar · Denemarken"
        title="Dashboard"
        subtitle="Jouw kitesurf tripplanner"
      >
        <WindWidget />
      </PageHero>

      <div className="page-content">
        <TripCountdownCard />
        <WeatherForecast />
      </div>
    </>
  );
}

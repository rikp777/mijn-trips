import { colors } from "../constants/theme";
import { TABS } from "./BottomNav";
import { useTrip } from "../context/TripContext";

function formatDateRange(startDate, endDate) {
  const s = new Date(startDate + "T12:00:00");
  const e = new Date(endDate   + "T12:00:00");
  const months = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear())
    return `${s.getDate()}–${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
  return `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]} ${s.getFullYear()}`;
}

export default function SideNav({ active, onChange }) {
  const { trips, activeTrip, setActiveTripId } = useTrip();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <nav style={{
      width: 210,
      flexShrink: 0,
      height: "100vh",
      position: "sticky",
      top: 0,
      background: "rgba(10,22,40,0.98)",
      borderRight: `1px solid ${colors.surfaceBorder}`,
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
    }}>
      {/* Brand */}
      <div style={{ padding: "24px 20px 18px", borderBottom: `1px solid ${colors.surfaceBorder}` }}>
        <div style={{ fontSize: 22 }}>🪁</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 5, lineHeight: 1.2 }}>
          Kite Trips
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 3 }}>
          Jouw kitesurf planner
        </div>
      </div>

      {/* Trip list */}
      <div style={{ padding: "12px 10px 4px", borderBottom: `1px solid ${colors.surfaceBorder}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 6px 8px" }}>
          Trips
        </div>
        {trips.map((trip) => {
          const isActive = trip.id === activeTrip.id;
          const isPast   = trip.endDate < today;
          const isDuring = today >= trip.startDate && today <= trip.endDate;

          let statusDot = null;
          if (isDuring) statusDot = { color: "#34D399", label: "Nu" };
          else if (!isPast) statusDot = { color: colors.sky, label: "Aankomend" };

          return (
            <button
              key={trip.id}
              onClick={() => setActiveTripId(trip.id)}
              style={{
                width: "100%",
                background: isActive ? `${colors.sky}18` : "none",
                border: isActive ? `1px solid ${colors.sky}33` : "1px solid transparent",
                borderRadius: 10,
                cursor: "pointer",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 3,
                textAlign: "left",
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              {/* Flag / emoji */}
              <span style={{ fontSize: 20, flexShrink: 0 }}>{trip.flag ?? trip.emoji}</span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  color: isActive ? colors.accentLight : colors.textBody,
                  lineHeight: 1.2,
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  {trip.name}
                  {statusDot && (
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: statusDot.color, flexShrink: 0 }} />
                  )}
                </div>
                <div style={{ fontSize: 10, color: isPast ? colors.textMuted : colors.textMuted, marginTop: 2, lineHeight: 1.3 }}>
                  {formatDateRange(trip.startDate, trip.endDate)}
                  {isPast && <span style={{ marginLeft: 4, opacity: 0.6 }}>✓</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Nav tabs */}
      <div style={{ padding: "12px 10px", flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 6px 8px" }}>
          Navigatie
        </div>
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              style={{
                width: "100%",
                background: isActive ? `${colors.sky}18` : "none",
                border: isActive ? `1px solid ${colors.sky}33` : "1px solid transparent",
                borderRadius: 10,
                cursor: "pointer",
                padding: "11px 14px",
                display: "flex",
                alignItems: "center",
                gap: 11,
                marginBottom: 3,
                color: isActive ? colors.accentLight : colors.textMuted,
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                textAlign: "left",
                transition: "background 0.15s, border-color 0.15s, color 0.15s",
              }}
            >
              <span style={{ fontSize: 18, filter: isActive ? "none" : "grayscale(0.3)", flexShrink: 0 }}>
                {tab.emoji}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

import { colors } from "../constants/theme";
import { useTrip } from "../context/TripContext";

export const TABS = [
  { id: "home",    label: "Home",    emoji: "🏠" },
  { id: "journal", label: "Reislog", emoji: "📸" },
  { id: "pack",    label: "Pakken",  emoji: "🎒" },
  { id: "day",     label: "Dag",     emoji: "📅" },
  { id: "map",     label: "Kaart",   emoji: "🗺️" },
];

const ALL_TAB_IDS = TABS.map((t) => t.id);

/** Fixed bottom tab bar — shows only tabs relevant to the active trip. */
export default function BottomNav({ active, onChange }) {
  const { activeTrip } = useTrip();
  const allowed = activeTrip.tabs ?? ALL_TAB_IDS;
  const visible = TABS.filter((t) => allowed.includes(t.id));

  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        background: "rgba(12,26,46,0.92)",
        backdropFilter: "blur(10px)",
        borderTop: `1px solid ${colors.surfaceBorder}`,
        display: "flex",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {visible.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? "page" : undefined}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "10px 4px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              color: isActive ? colors.accentLight : colors.textMuted,
              fontWeight: isActive ? 700 : 500,
            }}
          >
            <span style={{ fontSize: 20, filter: isActive ? "none" : "grayscale(0.4)" }}>{tab.emoji}</span>
            <span style={{ fontSize: 11 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

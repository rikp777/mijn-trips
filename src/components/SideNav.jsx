import { colors } from "../constants/theme";
import { TABS } from "./BottomNav";

export default function SideNav({ active, onChange }) {
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
      <div style={{
        padding: "24px 20px 18px",
        borderBottom: `1px solid ${colors.surfaceBorder}`,
      }}>
        <div style={{ fontSize: 22 }}>🪁</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 5, lineHeight: 1.2 }}>
          Kitecamp DK
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 3 }}>
          Ripstar · 4–11 juli 2026
        </div>
      </div>

      {/* Nav items */}
      <div style={{ padding: "12px 10px", flex: 1 }}>
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

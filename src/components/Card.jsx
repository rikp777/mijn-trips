import { colors } from "../constants/theme";

export function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: colors.surface,
        border: `1px solid ${colors.surfaceBorder}`,
        borderRadius: 14,
        padding: "14px 16px",
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardTitle({ emoji, children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: colors.textMuted,
      letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10,
    }}>
      {emoji} {children}
    </div>
  );
}

export function StatRow({ emoji, label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 1 }}>
        {emoji} {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, color: color || colors.text }}>
        {value}
      </div>
    </div>
  );
}

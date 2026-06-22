import { colors } from "../constants/theme";

const badge = (bg, color) => ({
  marginLeft: 6,
  fontSize: 10,
  background: bg,
  color,
  borderRadius: 4,
  padding: "1px 6px",
  fontWeight: 600,
  verticalAlign: "middle",
});

function weatherBadge(item, profile) {
  if (!profile || !item.climate) return null;
  if (item.climate === "cold" && profile.profile === "hot")
    return { label: "☀️ WAARSCHIJNLIJK NIET NODIG", bg: "#F9731620", color: "#F97316" };
  if (item.climate === "cold" && profile.profile === "warm")
    return { label: "🌤️ CHECK — WARM WEER", bg: "#F59E0B20", color: "#F59E0B" };
  if (item.climate === "rain" && profile.heavyRainDays === 0 && profile.lightRainDays === 0)
    return { label: "🌤️ GEEN REGEN VERWACHT", bg: "#34D39920", color: "#34D399" };
  if (item.climate === "rain" && profile.heavyRainDays === 0 && profile.lightRainDays > 0)
    return { label: "🌦️ ALLEEN LICHTE BUIEN", bg: "#F59E0B20", color: "#F59E0B" };
  return null;
}

/** A single packable item: checkbox, label, badges and its photo button. */
export default function ChecklistItem({ item, color, checked, photoCount, onToggle, onOpenPhotos, weatherProfile }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "8px 0", borderBottom: "1px solid #1E2F4740" }}>
      <div
        onClick={onToggle}
        role="checkbox"
        aria-checked={checked}
        aria-label={item.text}
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          flexShrink: 0,
          marginTop: 1,
          cursor: "pointer",
          background: checked ? color : "transparent",
          border: `2px solid ${checked ? color : colors.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
        }}
      >
        {checked && <span style={{ color: "#fff", fontSize: 13 }}>✓</span>}
      </div>

      <span
        onClick={onToggle}
        style={{
          color: checked ? colors.textDim : colors.textBody,
          fontSize: 14,
          lineHeight: 1.5,
          textDecoration: checked ? "line-through" : "none",
          flex: 1,
          cursor: "pointer",
        }}
      >
        {item.text}
        {item.included && <span style={badge("#0EA5E920", "#38BDF8")}>INBEGREPEN</span>}
        {item.note === "nieuw" && <span style={badge("#F9731620", "#F97316")}>NIEUW</span>}
        {(() => { const wb = weatherBadge(item, weatherProfile); return wb ? <span style={badge(wb.bg, wb.color)}>{wb.label}</span> : null; })()}
      </span>

      <button
        onClick={onOpenPhotos}
        aria-label={`Bewijsfoto's voor ${item.text}`}
        style={{
          flexShrink: 0,
          background: photoCount > 0 ? color + "20" : "transparent",
          border: `1px solid ${photoCount > 0 ? color + "60" : colors.border}`,
          color: photoCount > 0 ? color : colors.textMuted,
          borderRadius: 8,
          padding: "3px 8px",
          fontSize: 11,
          cursor: "pointer",
          fontWeight: 600,
          marginTop: 1,
        }}
      >
        📷{photoCount > 0 && ` ${photoCount}`}
      </button>
    </div>
  );
}

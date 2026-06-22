import { colors } from "../constants/theme";

/** Compact gradient page header for the Day & Map tabs. */
export default function PageHero({ eyebrow, title, subtitle, children, onBack, backLabel = "← Terug" }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0EA5E9 0%, #0369A1 60%, #0C1A2E 100%)",
        padding: "calc(env(safe-area-inset-top, 0px) + 28px) 20px 56px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0, opacity: 0.07, backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }} />
      <div className="page-inner" style={{ position: "relative" }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 20,
              color: "#fff",
              fontSize: 12, fontWeight: 700,
              padding: "5px 12px",
              cursor: "pointer",
              marginBottom: 12,
            }}
          >
            {backLabel}
          </button>
        )}
        {eyebrow && (
          <div style={{ fontSize: 13, color: colors.accentLight, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{eyebrow}</div>
        )}
        <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: "0 0 4px", lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <div style={{ color: colors.accentSofter, fontSize: 15, marginBottom: children ? 18 : 0 }}>{subtitle}</div>}
        {children}
      </div>
    </div>
  );
}

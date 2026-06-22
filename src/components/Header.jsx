import { colors } from "../constants/theme";
import WindWidget from "./WindWidget";

const pill = {
  border: "1px solid rgba(255,255,255,0.3)",
  background: "rgba(255,255,255,0.15)",
  borderRadius: 20,
  padding: "6px 14px",
  color: "#fff",
  fontSize: 12,
  cursor: "pointer",
};

/**
 * Hero header: branding, live progress bar and the action pills.
 * Receives everything via props — it owns no state (presentational).
 */
export default function Header({
  innerRef,
  progress,
  showIncluded,
  onToggleIncluded,
  onExport,
  exportLoading,
  onShare,
  onReset,
  installable,
  onInstall,
}) {
  return (
    <div
      ref={innerRef}
      style={{
        background: "linear-gradient(135deg, #0EA5E9 0%, #0369A1 60%, #0C1A2E 100%)",
        padding: "calc(env(safe-area-inset-top, 0px) + 32px) 20px 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.07,
          backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="page-inner" style={{ position: "relative" }}>
        <div style={{ fontSize: 13, color: colors.accentLight, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
          🪁 Ripstar · 4 juli · Solo roadtrip
        </div>
        <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 4px", lineHeight: 1.2 }}>
          Paklijst Kitesurfen
        </h1>
        <div style={{ color: colors.accentSofter, fontSize: 15, marginBottom: 20 }}>Denemarken • Beginnerscursus</div>

        <WindWidget />

        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "14px 18px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
              {progress.done} / {progress.total} ingepakt
            </span>
            <span style={{ color: colors.accentLight, fontWeight: 800, fontSize: 18 }}>{progress.pct}%</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, height: 8 }}>
            <div
              style={{
                background: progress.complete ? colors.success : "#38BDF8",
                borderRadius: 99,
                height: 8,
                width: `${progress.pct}%`,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={onToggleIncluded} style={pill}>
            {showIncluded ? "✅ Inbegrepen zichtbaar" : "🙈 Inbegrepen verborgen"}
          </button>
          <button onClick={onShare} style={pill}>📤 Deel voortgang</button>
          <button onClick={onExport} disabled={exportLoading} style={pill}>
            {exportLoading ? "⏳ Laden..." : "📸 Screenshot"}
          </button>
          {installable && (
            <button onClick={onInstall} style={{ ...pill, background: "rgba(52,211,153,0.25)", borderColor: "rgba(52,211,153,0.5)" }}>
              ⬇️ Installeer app
            </button>
          )}
          <button
            onClick={onReset}
            style={{ ...pill, background: "rgba(239,68,68,0.2)", borderColor: "rgba(239,68,68,0.4)", color: colors.dangerSoft }}
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
}

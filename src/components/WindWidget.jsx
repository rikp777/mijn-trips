import { colors } from "../constants/theme";
import { useWindForecast, windDirLabel, windVerdict } from "../hooks/useWindForecast";
import { useTrip } from "../context/TripContext";

/** Live wind at the active trip's kite spot. */
export default function WindWidget() {
  const { activeTrip } = useTrip();
  const { status, data } = useWindForecast(activeTrip);

  const shell = (children) => (
    <div
      style={{
        background: "rgba(255,255,255,0.15)",
        borderRadius: 12,
        padding: "12px 16px",
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
        gap: 12,
        minHeight: 56,
      }}
    >
      {children}
    </div>
  );

  if (status === "loading") {
    return shell(<span style={{ color: colors.accentSofter, fontSize: 13 }}>🌬️ Wind ophalen…</span>);
  }

  if (status === "error" || !data) {
    return shell(
      <span style={{ color: colors.accentSofter, fontSize: 13 }}>
        🌬️ Wind offline — check je wind-app voor {activeTrip.windSpotName}
      </span>
    );
  }

  const verdict = windVerdict(data.windKn);

  return shell(
    <>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: "rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 16, lineHeight: 1 }}>{data.windKn}</span>
        <span style={{ color: colors.accentSofter, fontSize: 9 }}>kn</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
          {verdict.emoji} {verdict.label}
        </div>
        <div style={{ color: colors.accentSofter, fontSize: 12 }}>
          {activeTrip.windSpotName} · {windDirLabel(data.dir)} wind · {data.temp}°C
        </div>
      </div>
      <div style={{ width: 8, height: 8, borderRadius: 99, background: verdict.color, flexShrink: 0 }} />
    </>
  );
}

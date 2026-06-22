import { useState, useMemo } from "react";
import { colors } from "../constants/theme";
import { useWeatherForecast, windVerdict, sessionVerdict } from "../hooks/useWeatherForecast";
import { useTrip } from "../context/TripContext";

const TODAY = new Date().toISOString().slice(0, 10);
const NL_DAYS_SHORT = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

function getTripDates(startDate, endDate) {
  const dates = [];
  const d = new Date(startDate + "T12:00:00");
  const end = new Date(endDate + "T12:00:00");
  while (d <= end) { dates.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1); }
  return dates;
}

function formatDateRange(startDate, endDate) {
  const s = new Date(startDate + "T12:00:00");
  const e = new Date(endDate   + "T12:00:00");
  const months = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear())
    return `${s.getDate()}–${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
  return `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]} ${s.getFullYear()}`;
}

function weekdayShort(dateStr) {
  return NL_DAYS_SHORT[new Date(dateStr + "T12:00:00").getDay()];
}

function windColor(kn) { return windVerdict(kn).color; }

function precipColor(prob) {
  if (prob < 20) return colors.textMuted;
  if (prob < 50) return "#60A5FA";
  if (prob < 75) return "#3B82F6";
  return "#2563EB";
}

function rainIntensityLabel(mmPerHour) {
  if (mmPerHour < 0.5)  return null;
  if (mmPerHour < 2.5)  return "licht";
  if (mmPerHour < 7.6)  return "matig";
  if (mmPerHour < 50)   return "zwaar";
  return "zeer zwaar";
}

// ── Sub-components ───────────────────────────────────────────────

function Chip({ children, color, bold }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: bold ? 700 : 600,
      background: `${color}20`, color,
      borderRadius: 8, padding: "2px 7px",
    }}>
      {children}
    </span>
  );
}

function TripDayBubble({ date, day }) {
  const d = new Date(date + "T12:00:00");
  const dayNum = d.getDate();
  const month  = d.getMonth() + 1;
  const wd = weekdayShort(date);

  if (!day) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          width: "100%", borderRadius: 8, padding: "5px 2px",
          background: colors.surfaceBorder, border: `1px solid ${colors.surfaceBorder}`,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
        }}>
          <span style={{ fontSize: 14 }}>❓</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: colors.textMuted }}>{wd}</span>
          <span style={{ fontSize: 9, color: colors.textMuted }}>{dayNum}/{month}</span>
        </div>
      </div>
    );
  }

  const v = sessionVerdict(day);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        width: "100%", borderRadius: 8, padding: "5px 2px",
        background: `${v.color}18`, border: `1.5px solid ${v.color}55`,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
      }}>
        <span style={{ fontSize: 15 }}>{v.emoji}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: v.color }}>{wd}</span>
        <span style={{ fontSize: 9, color: colors.textMuted }}>{dayNum}/{month}</span>
      </div>
    </div>
  );
}

function TripWeekSummary({ days, trip, isPastTrip }) {
  const tripDates = getTripDates(trip.startDate, trip.endDate);
  const dayMap = useMemo(() => {
    const m = {};
    days.forEach((d) => { m[d.date] = d; });
    return m;
  }, [days]);

  const dateLabel = formatDateRange(trip.startDate, trip.endDate);

  return (
    <div style={{ padding: "10px 12px 12px", borderBottom: `1px solid ${colors.surfaceBorder}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {isPastTrip ? "📜" : "🗓️"} Kampweek — {dateLabel}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {tripDates.map((date) => (
          <TripDayBubble key={date} date={date} day={dayMap[date] ?? null} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
        <LegendDot color="#34D399" label={isPastTrip ? "Goede kitedag" : "Goede kitedag"} />
        <LegendDot color="#F59E0B" label="Onzeker" />
        <LegendDot color="#EF4444" label={isPastTrip ? "Geannuleerd" : "Kans op annulering"} />
        {!isPastTrip && <LegendDot color={colors.surfaceBorder} label="Nog niet bekend" />}
      </div>
    </div>
  );
}

function DayCard({ day, isSelected, onClick }) {
  const isToday = day.date === TODAY;
  const { label: windLabel, color: wColor } = windVerdict(day.windKn);
  const hasRain = day.precipMm > 0;
  const verdict = day.isTripDay ? sessionVerdict(day) : null;

  const borderColor = isSelected
    ? colors.sky
    : day.isTripDay
    ? "#F59E0B"
    : colors.surfaceBorder;

  const bg = isSelected
    ? `${colors.sky}18`
    : day.isTripDay
    ? "#F59E0B0A"
    : "transparent";

  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        width: 70,
        background: bg,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 12,
        padding: "8px 5px 0",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        overflow: "hidden",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.03em",
        color: isToday ? colors.sky : day.isTripDay ? "#F59E0B" : colors.textMuted,
      }}>
        {isToday ? "Vandaag" : day.weekday}
      </span>
      <span style={{ fontSize: 10, color: colors.textMuted, marginBottom: 3 }}>
        {day.dayMonth}
      </span>
      <span style={{ fontSize: 24, lineHeight: 1, marginBottom: 4 }}>{day.emoji}</span>
      <div style={{ display: "flex", gap: 3, marginBottom: 3 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{day.tempMax}°</span>
        <span style={{ fontSize: 12, color: colors.textMuted }}>{day.tempMin}°</span>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: wColor, marginBottom: 2 }}>
        🌬️ {day.windKn}kn
      </span>
      <span style={{ fontSize: 10, fontWeight: 600, color: precipColor(day.precipProb), marginBottom: hasRain ? 0 : 6 }}>
        💧 {day.precipProb}%
      </span>
      {hasRain && (
        <span style={{
          marginTop: 4, marginBottom: verdict ? 0 : 6,
          background: "#3B82F625", color: "#60A5FA",
          borderRadius: 6, padding: "1px 5px", fontSize: 9, fontWeight: 700,
        }}>
          {day.precipMm}mm
        </span>
      )}
      {verdict && (
        <div style={{
          width: "100%", marginTop: 5,
          background: `${verdict.color}22`,
          borderTop: `1.5px solid ${verdict.color}44`,
          padding: "3px 2px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 3,
        }}>
          <span style={{ fontSize: 11 }}>{verdict.emoji}</span>
          <span style={{ fontSize: 8, fontWeight: 800, color: verdict.color, textAlign: "center", lineHeight: 1.2 }}>
            {verdict.status === "go" ? (day.isPastTrip ? "Was goed!" : "Kiten!") :
             verdict.status === "cancel" ? (day.isPastTrip ? "Was slecht" : "Risico") :
             (day.isPastTrip ? "Was matig" : "Onzeker")}
          </span>
        </div>
      )}
    </button>
  );
}

function RainWindow({ w }) {
  const intensity = rainIntensityLabel(w.maxMm);
  return (
    <div style={{
      background: "#1D4ED808", border: "1px solid #3B82F625",
      borderLeft: "3px solid #3B82F6", borderRadius: 8, padding: "8px 12px", marginBottom: 6,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>
          🕐 {w.startLabel} – {w.endLabel}
        </span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Chip color="#60A5FA">{w.durationHours}u</Chip>
          <Chip color="#93C5FD" bold>{w.totalMm} mm</Chip>
          {intensity && (
            <Chip color={intensity === "zwaar" || intensity === "zeer zwaar" ? "#FCA5A5" : "#FCD34D"}>
              {intensity}
            </Chip>
          )}
          {w.maxMm > 0 && <Chip color={colors.textMuted}>max {w.maxMm} mm/u</Chip>}
        </div>
      </div>
    </div>
  );
}

function SessionVerdictCard({ day }) {
  const v = sessionVerdict(day);
  return (
    <div style={{
      background: `${v.color}12`, border: `1.5px solid ${v.color}44`,
      borderRadius: 10, padding: "10px 12px", marginBottom: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <span style={{ fontSize: 22 }}>{v.emoji}</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: v.color }}>{v.short}</div>
          <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 1 }}>
            Wind 09–18u: gem. {day.windKitingAvg}kn · max {day.windKitingMax}kn
          </div>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: colors.text, lineHeight: 1.55 }}>
        {v.reason}
      </p>
      {!day.isPastTrip && (
        <div style={{ marginTop: 7, fontSize: 10, color: colors.textMuted, fontStyle: "italic" }}>
          Schatting op basis van uurdata. Definitief besluit door instructeur ter plaatse.
        </div>
      )}
    </div>
  );
}

function DayDetail({ day, onClose }) {
  const verdict = windVerdict(day.windKn);
  const hasRain = day.rainWindows.length > 0;

  return (
    <div style={{
      background: colors.surface,
      border: `1px solid ${colors.surfaceBorder}`,
      borderTop: `3px solid ${day.isTripDay ? "#F59E0B" : colors.sky}`,
      borderRadius: "0 0 14px 14px",
      padding: "12px 14px", marginTop: -2, marginBottom: 14,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 800, color: colors.text }}>
            {day.emoji} {day.weekday} {day.dayMonth}
          </span>
          {day.isTripDay && (
            <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, background: "#F59E0B22", color: "#F59E0B", borderRadius: 8, padding: "2px 7px" }}>
              {day.isPastTrip ? "Was kampdag" : "Kampdag"}
            </span>
          )}
          <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>{day.label}</div>
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: colors.textMuted, cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 2px" }}
          aria-label="Sluiten"
        >
          ×
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${colors.surfaceBorder}` }}>
        <StatPill emoji="🌡️" label={`${day.tempMax}° / ${day.tempMin}°C`} />
        <StatPill emoji={verdict.emoji} label={`${day.windKn} kn ${day.windDir}`} color={verdict.color} />
        <StatPill emoji="💨" label={`gusts ${day.windGust} kn`} color={verdict.color} />
        <StatPill emoji="💧" label={`${day.precipProb}% kans`} color={precipColor(day.precipProb)} />
      </div>

      {day.isTripDay && <SessionVerdictCard day={day} />}

      {!day.isTripDay && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: `${verdict.color}18`, border: `1px solid ${verdict.color}44`,
          borderRadius: 8, padding: "5px 10px", marginBottom: 12, fontSize: 12, fontWeight: 700, color: verdict.color,
        }}>
          {verdict.emoji} Kitewind: {verdict.label}
        </div>
      )}

      {hasRain ? (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#60A5FA", marginBottom: 8 }}>
            🌧️ Regenperiodes — {day.precipMm} mm totaal over {day.precipHours}u
          </div>
          {day.rainWindows.map((w, i) => <RainWindow key={i} w={w} />)}
        </>
      ) : (
        <div style={{ fontSize: 13, color: colors.textMuted, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>✅</span>
          {day.isPastTrip ? "Geen neerslag gevallen" : "Geen neerslag verwacht"}
        </div>
      )}
    </div>
  );
}

function StatPill({ emoji, label, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: color || colors.textBody }}>
      <span>{emoji}</span>
      <span>{label}</span>
    </div>
  );
}

// ── Multi-stop weather ───────────────────────────────────────────

function StopWeatherStrip({ stop, days, selectedDate, onToggle }) {
  const s = new Date(stop.startDate + "T12:00:00");
  const e = new Date(stop.endDate   + "T12:00:00");
  const months = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
  const dateStr = `${s.getDate()}–${e.getDate()} ${months[s.getMonth()]}`;

  return (
    <div style={{ borderTop: `1px solid ${colors.surfaceBorder}` }}>
      <div style={{ padding: "8px 14px 4px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>{stop.flag}</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: colors.text }}>{stop.name}</span>
        <span style={{ fontSize: 11, color: colors.textMuted, marginLeft: "auto" }}>{dateStr}</span>
      </div>
      {days.length > 0 ? (
        <div className="wx-strip" style={{ display: "flex", gap: 6, overflowX: "auto", padding: "4px 10px 8px" }}>
          {days.map((day) => (
            <DayCard key={day.date} day={day} isSelected={day.date === selectedDate} onClick={() => onToggle(day.date)} />
          ))}
        </div>
      ) : (
        <div style={{ padding: "4px 14px 10px", fontSize: 12, color: colors.textMuted }}>
          Geen weerdata voor deze stop
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────

export default function WeatherForecast({ stopForecasts: stopForecastsProp, wxStatus: wxStatusProp } = {}) {
  const { activeTrip } = useTrip();
  const fetched = useWeatherForecast(activeTrip.stops?.length && stopForecastsProp != null ? null : activeTrip);
  const status       = stopForecastsProp != null ? wxStatusProp  : fetched.status;
  const days         = fetched.days;
  const isPastTrip   = fetched.isPastTrip;
  const stopForecasts = stopForecastsProp ?? fetched.stopForecasts;
  const [selectedDate, setSelectedDate] = useState(null);

  const selectedDay = days.find((d) => d.date === selectedDate) ?? null;
  const toggle = (date) => setSelectedDate((prev) => (prev === date ? null : date));

  // ── Multi-stop trip ──────────────────────────────────────────────
  if (activeTrip.stops?.length) {
    const anyData = stopForecasts?.some((sf) => sf.days.length > 0);

    const cardBase = { background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, borderRadius: 14, overflow: "hidden", marginBottom: 14 };
    const header = (
      <div style={{ padding: "11px 14px 8px", borderBottom: `1px solid ${colors.surfaceBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: colors.text, fontWeight: 700, fontSize: 14 }}>☁️ Weersvoorspelling per stop</span>
      </div>
    );

    if (status === "loading") {
      return (
        <div style={cardBase}>
          {header}
          <div style={{ padding: "12px 14px" }}>
            <span style={{ color: colors.textMuted, fontSize: 13 }}>Weersdata laden…</span>
          </div>
        </div>
      );
    }

    if (!anyData) {
      const avail = new Date(activeTrip.startDate + "T00:00:00");
      avail.setDate(avail.getDate() - 14);
      const months = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
      const availStr = `${avail.getDate()} ${months[avail.getMonth()]}`;
      return (
        <div style={cardBase}>
          {header}
          <div style={{ padding: "12px 14px" }}>
            <span style={{ color: colors.textMuted, fontSize: 13 }}>
              ⏳ Weersdata beschikbaar vanaf ca. <strong style={{ color: colors.text }}>{availStr}</strong> — de voorspelling gaat 14 dagen vooruit.
            </span>
          </div>
        </div>
      );
    }

    return (
      <>
        <style>{`.wx-strip { scrollbar-width: none; } .wx-strip::-webkit-scrollbar { display: none; }`}</style>
        <div style={{ ...cardBase, marginBottom: selectedDate ? 0 : 14, borderRadius: selectedDate ? "14px 14px 0 0" : 14 }}>
          {header}
          {stopForecasts.map(({ stop, days: stopDays }) => (
            <StopWeatherStrip key={stop.name} stop={stop} days={stopDays} selectedDate={selectedDate} onToggle={toggle} />
          ))}
          <div style={{ padding: "4px 14px 10px" }}>
            <LegendDot color={colors.sky} label="Tik dag voor details" />
          </div>
        </div>
        {selectedDay && <DayDetail day={selectedDay} onClose={() => setSelectedDate(null)} />}
      </>
    );
  }

  // ── Single-location trip ─────────────────────────────────────────
  const tripDaysInForecast = days.filter((d) => d.isTripDay);

  if (status === "loading") {
    return (
      <div style={{ background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
        <span style={{ color: colors.textMuted, fontSize: 13 }}>
          {isPastTrip ? "📜 Historisch weer laden…" : "☁️ Weersvoorspelling laden…"}
        </span>
      </div>
    );
  }

  if (status === "error" || !days.length) {
    return (
      <div style={{ background: colors.surface, border: `1px solid ${colors.surfaceBorder}`, borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
        <span style={{ color: colors.textMuted, fontSize: 13 }}>
          ☁️ Weerdata niet beschikbaar — check Windguru of Windy
        </span>
      </div>
    );
  }

  const locationLabel = activeTrip.subtitle.split(",")[0];

  return (
    <>
      <style>{`
        .wx-strip { scrollbar-width: none; }
        .wx-strip::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{
        background: colors.surface,
        border: `1px solid ${colors.surfaceBorder}`,
        borderRadius: selectedDate ? "14px 14px 0 0" : 14,
        overflow: "hidden",
        marginBottom: selectedDate ? 0 : 14,
      }}>
        <div style={{
          padding: "11px 14px 8px",
          borderBottom: `1px solid ${colors.surfaceBorder}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ color: colors.text, fontWeight: 700, fontSize: 14 }}>
            {isPastTrip ? "📜 Historisch weer" : "☁️ Weersvoorspelling"}
          </span>
          <span style={{ color: colors.textMuted, fontSize: 11 }}>
            {locationLabel} · {days.length} {isPastTrip ? "kampdag" : "dag"}{days.length !== 1 ? "en" : ""}
          </span>
        </div>

        {tripDaysInForecast.length > 0 && (
          <TripWeekSummary days={days} trip={activeTrip} isPastTrip={isPastTrip} />
        )}

        <div className="wx-strip" style={{ display: "flex", gap: 6, overflowX: "auto", padding: "10px 10px 8px" }}>
          {days.map((day) => (
            <DayCard
              key={day.date}
              day={day}
              isSelected={day.date === selectedDate}
              onClick={() => toggle(day.date)}
            />
          ))}
        </div>

        <div style={{ padding: "4px 14px 10px", display: "flex", gap: 16, flexWrap: "wrap" }}>
          {tripDaysInForecast.length > 0 && (
            <LegendDot color="#F59E0B" label={`Kampdagen (${formatDateRange(activeTrip.startDate, activeTrip.endDate)})`} />
          )}
          <LegendDot color={colors.sky} label="Tik dag voor details" />
        </div>
      </div>

      {selectedDay && (
        <DayDetail day={selectedDay} onClose={() => setSelectedDate(null)} />
      )}
    </>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: colors.textMuted }}>
      <span style={{ width: 8, height: 8, background: color, borderRadius: 2, flexShrink: 0 }} />
      {label}
    </div>
  );
}

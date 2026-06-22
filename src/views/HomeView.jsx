import { useState } from "react";
import { colors } from "../constants/theme";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { usePackingList } from "../hooks/usePackingList";
import { useRiseSet } from "../hooks/useRiseSet";
import { useMarineData } from "../hooks/useMarineData";
import { useTrip } from "../context/TripContext";
import { todoItems } from "../data/todoItems";
import PageHero from "../components/PageHero";
import WindWidget from "../components/WindWidget";
import WeatherForecast from "../components/WeatherForecast";

// ── Helpers ──────────────────────────────────────────────────────

function formatDateRange(startDate, endDate) {
  const s = new Date(startDate + "T12:00:00");
  const e = new Date(endDate   + "T12:00:00");
  const months = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear())
    return `${s.getDate()}–${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
  return `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]} ${s.getFullYear()}`;
}

function useTripPhase(startDate, endDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const todayStr = now.toISOString().slice(0, 10);
  if (todayStr < startDate) {
    const daysUntil = Math.round((new Date(startDate + "T00:00:00") - now) / 86400000);
    return { phase: "before", daysUntil };
  }
  if (todayStr <= endDate) {
    const dayOfTrip = Math.round((now - new Date(startDate + "T00:00:00")) / 86400000) + 1;
    const totalDays = Math.round((new Date(endDate + "T00:00:00") - new Date(startDate + "T00:00:00")) / 86400000) + 1;
    return { phase: "during", dayOfTrip, totalDays };
  }
  return { phase: "after" };
}

// ── Shared helpers ───────────────────────────────────────────────

function Card({ children, style, onClick }) {
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

function CardTitle({ emoji, children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>
      {emoji} {children}
    </div>
  );
}

// ── Trip switcher ────────────────────────────────────────────────

function TripSwitcher() {
  const { trips, activeTrip, setActiveTripId } = useTrip();
  if (trips.length <= 1) return null;

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
      {trips.map((t) => {
        const isActive = t.id === activeTrip.id;
        const today = new Date().toISOString().slice(0, 10);
        const isPast = t.endDate < today;
        return (
          <button
            key={t.id}
            onClick={() => setActiveTripId(t.id)}
            style={{
              flexShrink: 0,
              padding: "6px 14px",
              borderRadius: 20,
              border: `1.5px solid ${isActive ? colors.sky : colors.surfaceBorder}`,
              background: isActive ? `${colors.sky}18` : colors.surface,
              color: isActive ? colors.sky : colors.textBody,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {t.flag} {t.name}
            <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? colors.sky : colors.textMuted }}>
              {isPast ? "✓" : new Date(t.startDate).getFullYear()}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── 1. Trip countdown ────────────────────────────────────────────

function TripCountdownCard() {
  const { activeTrip } = useTrip();
  const status = useTripPhase(activeTrip.startDate, activeTrip.endDate);
  const dateStr = formatDateRange(activeTrip.startDate, activeTrip.endDate);

  let headline, sub;
  if (status.phase === "before") {
    headline = status.daysUntil === 1 ? "Morgen vertrek je! 🚗" : `Nog ${status.daysUntil} dagen tot vertrek`;
    sub = `${dateStr} · ${activeTrip.subtitle}`;
  } else if (status.phase === "during") {
    headline = `Dag ${status.dayOfTrip} van het kamp! ${activeTrip.emoji}`;
    sub = `Je kitet nu bij ${activeTrip.subtitle} — geniet ervan!`;
  } else {
    headline = `Kamp afgerond ${activeTrip.emoji}`;
    sub = `${dateStr} · ${activeTrip.subtitle}`;
  }

  return (
    <Card style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: colors.text, lineHeight: 1.25, marginBottom: 3 }}>{headline}</div>
        <div style={{ fontSize: 12, color: colors.textMuted }}>{sub}</div>
      </div>
      {status.phase === "before" && (
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: colors.sky, lineHeight: 1 }}>{status.daysUntil}</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: colors.textMuted, letterSpacing: "0.05em", textTransform: "uppercase" }}>dagen</div>
        </div>
      )}
      {status.phase === "during" && (
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#34D399", lineHeight: 1 }}>{status.dayOfTrip}</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: colors.textMuted, letterSpacing: "0.05em", textTransform: "uppercase" }}>van {status.totalDays}</div>
        </div>
      )}
    </Card>
  );
}

// ── 2. Packing progress ──────────────────────────────────────────

function PackingProgressCard({ onNavigate }) {
  const { progress } = usePackingList(true);
  const remaining = progress.total - progress.done;
  const barColor = progress.complete ? "#34D399" : progress.pct > 60 ? "#F59E0B" : colors.sky;

  return (
    <Card onClick={() => onNavigate("pack")}>
      <CardTitle emoji="🎒">Paklijst</CardTitle>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: colors.text }}>{progress.pct}%</span>
        <span style={{ fontSize: 12, color: colors.textMuted }}>{progress.done}/{progress.total} items</span>
      </div>
      <div style={{ background: colors.surfaceBorder, borderRadius: 99, height: 7, marginBottom: 8 }}>
        <div style={{ background: barColor, borderRadius: 99, height: 7, width: `${progress.pct}%`, transition: "width 0.4s ease" }} />
      </div>
      <div style={{ fontSize: 12, color: progress.complete ? "#34D399" : colors.textMuted }}>
        {progress.complete ? "✅ Alles ingepakt!" : `Nog ${remaining} item${remaining !== 1 ? "s" : ""} te doen →`}
      </div>
    </Card>
  );
}

// ── 3. Sunrise / sunset + water temperature ──────────────────────

function SunWaterCard() {
  const { activeTrip } = useTrip();
  const { status: riseStatus, today: sun } = useRiseSet(activeTrip);
  const { status: marineStatus, todayTemp, tripAvg } = useMarineData(activeTrip);
  const loading = riseStatus === "loading" || marineStatus === "loading";

  const today = new Date().toISOString().slice(0, 10);
  const isPast = activeTrip.endDate < today;
  const tripDateLabel = formatDateRange(activeTrip.startDate, activeTrip.endDate);

  return (
    <Card>
      <CardTitle emoji="🌅">Zon & water</CardTitle>
      {loading ? (
        <span style={{ fontSize: 12, color: colors.textMuted }}>Laden…</span>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
          <StatRow emoji="🌄" label={isPast ? `Zonsopgang (${activeTrip.startDate.slice(8)} ${["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"][parseInt(activeTrip.startDate.slice(5,7))-1]})` : "Zonsopgang"} value={sun?.rise ?? "–"} />
          <StatRow emoji="🌊" label="Watertemp nu" value={todayTemp != null ? `${todayTemp}°C` : "–"} color="#60A5FA" />
          <StatRow emoji="🌇" label="Zonsondergang" value={sun?.set ?? "–"} />
          <StatRow emoji="🏕️" label={`Gem. trip (${tripDateLabel.slice(0, 5)})`} value={tripAvg != null ? `${tripAvg}°C` : "–"} color="#60A5FA" />
          {sun?.daylight && (
            <StatRow emoji="☀️" label="Daglicht" value={sun.daylight} color="#F59E0B" />
          )}
        </div>
      )}
    </Card>
  );
}

function StatRow({ emoji, label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 1 }}>{emoji} {label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: color || colors.text }}>{value}</div>
    </div>
  );
}

// ── 4. Pre-trip checklist ────────────────────────────────────────

const TODO_KEY = "kite_todo_v1";

function PreTripTodoCard() {
  const [checked, setChecked] = useLocalStorage(TODO_KEY, {});
  const [showAll, setShowAll] = useState(false);

  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const done = todoItems.filter((t) => checked[t.id]).length;
  const total = todoItems.length;
  const allDone = done === total;

  const visible = showAll ? todoItems : todoItems.filter((t) => !checked[t.id]).slice(0, 5);
  const hiddenDone = !showAll ? todoItems.filter((t) => checked[t.id]).length : 0;

  return (
    <Card style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <CardTitle emoji="✅">Voor vertrek</CardTitle>
        <span style={{ fontSize: 11, fontWeight: 700, color: allDone ? "#34D399" : colors.textMuted }}>
          {done}/{total}
        </span>
      </div>
      <div style={{ background: colors.surfaceBorder, borderRadius: 99, height: 4, marginBottom: 12 }}>
        <div style={{ background: allDone ? "#34D399" : colors.sky, borderRadius: 99, height: 4, width: `${Math.round((done / total) * 100)}%`, transition: "width 0.3s" }} />
      </div>
      {allDone && !showAll ? (
        <div style={{ fontSize: 13, color: "#34D399", textAlign: "center", padding: "6px 0" }}>
          🎉 Alles geregeld — je bent klaar voor vertrek!
        </div>
      ) : (
        <>
          {visible.map((item) => (
            <TodoRow key={item.id} item={item} isChecked={!!checked[item.id]} onToggle={toggle} />
          ))}
          {hiddenDone > 0 && (
            <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, marginBottom: 6 }}>
              + {hiddenDone} afgeronde taak{hiddenDone !== 1 ? "en" : ""} verborgen
            </div>
          )}
        </>
      )}
      <button
        onClick={() => setShowAll((v) => !v)}
        style={{ background: "none", border: "none", cursor: "pointer", color: colors.sky, fontSize: 12, fontWeight: 600, padding: "6px 0 0", display: "block" }}
      >
        {showAll ? "Minder tonen ↑" : `Alles tonen (${total}) ↓`}
      </button>
    </Card>
  );
}

function TodoRow({ item, isChecked, onToggle }) {
  return (
    <div
      onClick={() => onToggle(item.id)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        padding: "7px 0", borderBottom: `1px solid ${colors.surfaceBorder}`,
        cursor: "pointer",
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
        border: isChecked ? "none" : `1.5px solid ${colors.border}`,
        background: isChecked ? "#34D399" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.15s",
      }}>
        {isChecked && <span style={{ fontSize: 11, color: "#0C1A2E", fontWeight: 900 }}>✓</span>}
      </div>
      <span style={{ fontSize: 13, color: isChecked ? colors.textMuted : colors.text, textDecoration: isChecked ? "line-through" : "none", lineHeight: 1.4 }}>
        {item.text}
      </span>
    </div>
  );
}

// ── 5. Drive info ────────────────────────────────────────────────

const CAMP_MAPS = "https://maps.google.com/?daddr=55.89222,8.36444";

const ROUTES = [
  {
    emoji: "🛣️", label: "Via E45 Jutland", tag: "Aanbevolen", tagColor: "#34D399",
    lines: ["~970 km · ~9.5u", "Geen tol · Geen ferry", "Hamburg → Flensburg → Kolding → Ringkøbing"],
  },
  {
    emoji: "⛴️", label: "Via Puttgarden ferry", tag: "Kortste", tagColor: "#F59E0B",
    lines: ["~810 km + 45 min ferry", "Ferry ~€70–100 · Geen brug-tol", "Hamburg → Puttgarden → Rødby → Ringkøbing"],
  },
];

function DriveInfoCard() {
  return (
    <Card>
      <CardTitle emoji="🚗">Rijroute</CardTitle>
      {ROUTES.map((r) => (
        <div key={r.label} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span>{r.emoji}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{r.label}</span>
            <span style={{ fontSize: 9, fontWeight: 700, background: `${r.tagColor}22`, color: r.tagColor, borderRadius: 6, padding: "2px 6px" }}>{r.tag}</span>
          </div>
          {r.lines.map((l, i) => (
            <div key={i} style={{ fontSize: 11, color: i === 0 ? colors.textBody : colors.textMuted, marginLeft: 22, lineHeight: 1.5 }}>{l}</div>
          ))}
        </div>
      ))}
      <a
        href={CAMP_MAPS}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block", textAlign: "center",
          background: `${colors.sky}18`, border: `1px solid ${colors.sky}44`,
          borderRadius: 8, padding: "8px 12px", marginTop: 4,
          fontSize: 12, fontWeight: 700, color: colors.sky, textDecoration: "none",
        }}
      >
        🗺️ Open kamp in Google Maps
      </a>
    </Card>
  );
}

// ── 6. Emergency & camp info ─────────────────────────────────────

const EMERGENCY_ITEMS = [
  { emoji: "🚨", label: "Europees alarm", value: "112", href: "tel:112", bold: true },
  { emoji: "👮", label: "Politie (niet-spoed DK)", value: "114", href: "tel:114" },
  { emoji: "🏕️", label: "Kamp navigatie", value: "Skaven Strand Put & Take\nFiskesøvej 10, Hvide Sande", href: CAMP_MAPS },
  { emoji: "🏥", label: "Ziekenhuis (~45 min)", value: "Regionshospitalet Gødstrup\nHospitalsparken 15, Herning", href: "https://maps.google.com/?q=Regionshospitalet+G%C3%B8dstrup" },
  { emoji: "💊", label: "Apotheek Ringkøbing", value: "Ringkøbing Apotek\nTorvet 1, Ringkøbing", href: "https://maps.google.com/?q=Ringk%C3%B8bing+Apotek" },
];

function EmergencyInfoCard() {
  return (
    <Card>
      <CardTitle emoji="🚨">Noodinfo & kamp</CardTitle>
      {EMERGENCY_ITEMS.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target={item.href.startsWith("tel") ? undefined : "_blank"}
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "7px 0", borderBottom: `1px solid ${colors.surfaceBorder}`,
            textDecoration: "none",
          }}
        >
          <span style={{ fontSize: 16, flexShrink: 0 }}>{item.emoji}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 1 }}>{item.label}</div>
            <div style={{ fontSize: item.bold ? 18 : 12, fontWeight: item.bold ? 900 : 600, color: item.bold ? "#EF4444" : colors.textBody, whiteSpace: "pre-line", lineHeight: 1.4 }}>
              {item.value}
            </div>
          </div>
        </a>
      ))}
    </Card>
  );
}

// ── 7. Danish phrases ─────────────────────────────────────────────

const PHRASES = [
  { nl: "Hallo / Hoi",          dk: "Hej",                    uit: "Hai" },
  { nl: "Dank je",              dk: "Tak",                    uit: "Tak" },
  { nl: "Alsjeblieft",          dk: "Værsgo",                 uit: "Vairsgoo" },
  { nl: "Sorry / Pardon",       dk: "Undskyld",               uit: "Oon-skyld" },
  { nl: "Lekker!",              dk: "Lækkert!",               uit: "Lekert" },
  { nl: "Hoeveel kost dit?",    dk: "Hvad koster det?",       uit: "Va kosta de" },
  { nl: "Kan ik pinnen?",       dk: "Kan jeg betale m. kort?",uit: "Kan yai betaale me kort" },
  { nl: "Waar is het toilet?",  dk: "Hvor er toilettet?",     uit: "Vor air to-ee-lettet" },
  { nl: "Ik ben beginner",      dk: "Jeg er nybegynder",      uit: "Yai air ny-be-gyner" },
  { nl: "Wind te hard vandaag", dk: "For meget vind i dag",   uit: "For miyit vin ee dai" },
  { nl: "Ideale wind!",         dk: "Perfekte kiteforhold!",  uit: "Per-fekte kite-for-hol" },
  { nl: "Het is heel koud!",    dk: "Det er meget koldt!",    uit: "De air miyit kolt" },
];

function DanishPhrasesCard() {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? PHRASES : PHRASES.slice(0, 5);

  return (
    <Card style={{ marginBottom: 14 }}>
      <CardTitle emoji="🇩🇰">Handig Deens</CardTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", marginBottom: 8 }}>
        {["Nederlands", "Deens / Uitspraak"].map((h) => (
          <div key={h} style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, padding: "0 0 6px", letterSpacing: "0.03em" }}>{h}</div>
        ))}
        {shown.map((p) => (
          <>
            <div key={p.nl + "nl"} style={{ fontSize: 12, color: colors.textBody, padding: "5px 8px 5px 0", borderTop: `1px solid ${colors.surfaceBorder}`, lineHeight: 1.3 }}>{p.nl}</div>
            <div key={p.nl + "dk"} style={{ fontSize: 12, padding: "5px 0 5px 0", borderTop: `1px solid ${colors.surfaceBorder}`, lineHeight: 1.3 }}>
              <span style={{ color: colors.text, fontWeight: 600 }}>{p.dk}</span>
              <span style={{ display: "block", fontSize: 10, color: colors.textMuted, marginTop: 1, fontStyle: "italic" }}>{p.uit}</span>
            </div>
          </>
        ))}
      </div>
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{ background: "none", border: "none", cursor: "pointer", color: colors.sky, fontSize: 12, fontWeight: 600, padding: "4px 0 0" }}
      >
        {expanded ? "Minder tonen ↑" : `Meer zinnen (${PHRASES.length - shown.length} meer) ↓`}
      </button>
    </Card>
  );
}

// ── Main view ────────────────────────────────────────────────────

export default function HomeView({ onNavigate }) {
  const { activeTrip } = useTrip();
  // Show Denmark-specific content only for the DK trip
  const isDKTrip = activeTrip.id === "ripstar-dk-2026";

  return (
    <>
      <PageHero eyebrow={`${activeTrip.emoji} ${activeTrip.name}`} title="Dashboard" subtitle={activeTrip.subtitle}>
        <WindWidget />
      </PageHero>

      <div className="page-content">
        <TripSwitcher />
        <TripCountdownCard />

        <div className="home-grid-2">
          <PackingProgressCard onNavigate={onNavigate} />
          <SunWaterCard />
        </div>

        <PreTripTodoCard />

        <WeatherForecast />

        {isDKTrip && (
          <>
            <div className="home-grid-2" style={{ marginTop: 14 }}>
              <DriveInfoCard />
              <EmergencyInfoCard />
            </div>
            <div style={{ marginTop: 14 }}>
              <DanishPhrasesCard />
            </div>
          </>
        )}
      </div>
    </>
  );
}

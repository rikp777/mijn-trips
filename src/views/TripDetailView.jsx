import { useState } from "react";
import { colors } from "../constants/theme";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { usePackingList } from "../hooks/usePackingList";
import { useRiseSet } from "../hooks/useRiseSet";
import { useMarineData } from "../hooks/useMarineData";
import { useWeatherForecast } from "../hooks/useWeatherForecast";
import { useTrip } from "../context/TripContext";
import { getTodoItems } from "../data/todoItems";
import {
  routes as roadtripRoutes,
  internalRoutes as roadtripInternalRoutes,
  mapsUrl as roadtripMapsUrl,
  emergencyItems as roadtripEmergency,
  phraseSections as roadtripPhrases,
} from "../data/tripinfo/europe-roadtrip-2026";
import PageHero from "../components/PageHero";
import WindWidget from "../components/WindWidget";
import WeatherForecast from "../components/WeatherForecast";
import { Card, CardTitle, StatRow } from "../components/Card";

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
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const todayStr = now.toISOString().slice(0, 10);
  if (todayStr < startDate) {
    return { phase: "before", daysUntil: Math.round((new Date(startDate + "T00:00:00") - now) / 86400000) };
  }
  if (todayStr <= endDate) {
    const totalDays = Math.round((new Date(endDate + "T00:00:00") - new Date(startDate + "T00:00:00")) / 86400000) + 1;
    return { phase: "during", dayOfTrip: Math.round((now - new Date(startDate + "T00:00:00")) / 86400000) + 1, totalDays };
  }
  return { phase: "after" };
}

// ── Countdown ────────────────────────────────────────────────────

function TripCountdownCard() {
  const { activeTrip } = useTrip();
  const status = useTripPhase(activeTrip.startDate, activeTrip.endDate);
  const dateStr = formatDateRange(activeTrip.startDate, activeTrip.endDate);
  const isKite = activeTrip.activities?.includes("kite") ?? true;

  let headline, sub;
  if (status.phase === "before") {
    headline = status.daysUntil === 1 ? "Morgen vertrek je! 🚗" : `Nog ${status.daysUntil} dagen tot vertrek`;
    sub = `${dateStr} · ${activeTrip.subtitle}`;
  } else if (status.phase === "during") {
    headline = `Dag ${status.dayOfTrip} van de trip! ${activeTrip.emoji}`;
    sub = isKite
      ? `Je kitet nu bij ${activeTrip.subtitle} — geniet ervan!`
      : `Je bent nu bij ${activeTrip.subtitle} — geniet ervan!`;
  } else {
    headline = `Trip afgerond ${activeTrip.emoji}`;
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

// ── Packing progress ─────────────────────────────────────────────

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

// ── Sun & water ──────────────────────────────────────────────────

function SunWaterCard() {
  const { activeTrip } = useTrip();
  const { status: riseStatus, today: sun } = useRiseSet(activeTrip);
  const { status: marineStatus, todayTemp, tripAvg } = useMarineData(activeTrip);
  const loading = riseStatus === "loading" || marineStatus === "loading";
  const months = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
  const today = new Date().toISOString().slice(0, 10);
  const isPast = activeTrip.endDate < today;

  return (
    <Card>
      <CardTitle emoji="🌅">Zon & water</CardTitle>
      {loading ? (
        <span style={{ fontSize: 12, color: colors.textMuted }}>Laden…</span>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
          <StatRow emoji="🌄"
            label={isPast ? `Zonsopgang (${parseInt(activeTrip.startDate.slice(8))} ${months[parseInt(activeTrip.startDate.slice(5,7))-1]})` : "Zonsopgang"}
            value={sun?.rise ?? "–"} />
          <StatRow emoji="🌊" label="Watertemp nu" value={todayTemp != null ? `${todayTemp}°C` : "–"} color="#60A5FA" />
          <StatRow emoji="🌇" label="Zonsondergang" value={sun?.set ?? "–"} />
          <StatRow emoji="🏕️" label="Gem. trip" value={tripAvg != null ? `${tripAvg}°C` : "–"} color="#60A5FA" />
          {sun?.daylight && <StatRow emoji="☀️" label="Daglicht" value={sun.daylight} color="#F59E0B" />}
        </div>
      )}
    </Card>
  );
}

// ── Pre-trip checklist ───────────────────────────────────────────

const TODO_KEY = "kite_todo_v1";

function PreTripTodoCard() {
  const { activeTrip } = useTrip();
  const todoItems = getTodoItems(activeTrip.id);
  const [checked, setChecked] = useLocalStorage(TODO_KEY, {});
  const [showAll, setShowAll] = useState(false);
  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const done = todoItems.filter((t) => checked[t.id]).length;
  const total = todoItems.length;
  const allDone = done === total && total > 0;
  const visible = showAll ? todoItems : todoItems.filter((t) => !checked[t.id]).slice(0, 5);
  const hiddenDone = !showAll ? todoItems.filter((t) => checked[t.id]).length : 0;

  if (total === 0) return null;

  return (
    <Card style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <CardTitle emoji="✅">Voor vertrek</CardTitle>
        <span style={{ fontSize: 11, fontWeight: 700, color: allDone ? "#34D399" : colors.textMuted }}>{done}/{total}</span>
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
      <button onClick={() => setShowAll((v) => !v)}
        style={{ background: "none", border: "none", cursor: "pointer", color: colors.sky, fontSize: 12, fontWeight: 600, padding: "6px 0 0", display: "block" }}>
        {showAll ? "Minder tonen ↑" : `Alles tonen (${total}) ↓`}
      </button>
    </Card>
  );
}

function TodoRow({ item, isChecked, onToggle }) {
  return (
    <div onClick={() => onToggle(item.id)} style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 0", minHeight: 44,
      borderBottom: `1px solid ${colors.surfaceBorder}`, cursor: "pointer",
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
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

// ── Drive info ───────────────────────────────────────────────────

const CAMP_MAPS = "https://maps.google.com/?daddr=55.89222,8.36444";

const DK_ROUTES = [
  { emoji: "🛣️", label: "Via E45 Jutland", tag: "Aanbevolen", tagColor: "#34D399",
    lines: ["~970 km · ~9.5u", "Geen tol · Geen ferry", "Hamburg → Flensburg → Kolding → Ringkøbing"] },
  { emoji: "⛴️", label: "Via Puttgarden ferry", tag: "Kortste", tagColor: "#F59E0B",
    lines: ["~810 km + 45 min ferry", "Ferry ~€70–100 · Geen brug-tol", "Hamburg → Puttgarden → Rødby → Ringkøbing"] },
];

function DriveInfoCard({ routes, mapsUrl, mapsLabel, internalRoutes }) {
  return (
    <Card>
      <CardTitle emoji="🚗">Rijroute</CardTitle>
      {routes.map((r) => (
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
      {internalRoutes && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, margin: "8px 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Interne ritten</div>
          {internalRoutes.map((r) => (
            <div key={r.from} style={{ display: "flex", gap: 8, padding: "5px 0", borderTop: `1px solid ${colors.surfaceBorder}`, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: colors.text, flex: 1 }}>{r.from} → {r.to}</span>
              <span style={{ fontSize: 11, color: colors.textMuted, flexShrink: 0 }}>{r.km} · {r.duration}</span>
            </div>
          ))}
        </>
      )}
      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{
        display: "block", textAlign: "center",
        background: `${colors.sky}18`, border: `1px solid ${colors.sky}44`,
        borderRadius: 8, padding: "8px 12px", marginTop: 8,
        fontSize: 12, fontWeight: 700, color: colors.sky, textDecoration: "none",
      }}>
        🗺️ {mapsLabel ?? "Open in Google Maps"}
      </a>
    </Card>
  );
}

const DK_EMERGENCY_ITEMS = [
  { emoji: "🚨", label: "Europees alarm", value: "112", href: "tel:112", bold: true },
  { emoji: "👮", label: "Politie (niet-spoed DK)", value: "114", href: "tel:114" },
  { emoji: "🏕️", label: "Kamp navigatie", value: "Skaven Strand Put & Take\nFiskesøvej 10, Hvide Sande", href: CAMP_MAPS },
  { emoji: "🏥", label: "Ziekenhuis (~45 min)", value: "Regionshospitalet Gødstrup\nHospitalsparken 15, Herning", href: "https://maps.google.com/?q=Regionshospitalet+G%C3%B8dstrup" },
  { emoji: "💊", label: "Apotheek Ringkøbing", value: "Ringkøbing Apotek\nTorvet 1, Ringkøbing", href: "https://maps.google.com/?q=Ringk%C3%B8bing+Apotek" },
];

function EmergencyInfoCard({ items, title }) {
  return (
    <Card>
      <CardTitle emoji="🚨">{title ?? "Noodinfo"}</CardTitle>
      {items.map((item) => (
        item.href ? (
          <a key={item.label} href={item.href}
            target={item.href.startsWith("tel") ? undefined : "_blank"}
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderBottom: `1px solid ${colors.surfaceBorder}`, textDecoration: "none" }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.emoji}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 1 }}>{item.label}</div>
              <div style={{ fontSize: item.bold ? 18 : 12, fontWeight: item.bold ? 900 : 600, color: item.bold ? "#EF4444" : colors.textBody, whiteSpace: "pre-line", lineHeight: 1.4 }}>
                {item.value}
              </div>
            </div>
          </a>
        ) : (
          <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderBottom: `1px solid ${colors.surfaceBorder}` }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.emoji}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 1 }}>{item.label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.textBody }}>{item.value}</div>
            </div>
          </div>
        )
      ))}
    </Card>
  );
}

// ── Phrases cards ────────────────────────────────────────────────

const DK_PHRASES = [
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

function SingleLanguagePhrasesCard({ flag, title, phrases }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? phrases : phrases.slice(0, 5);
  return (
    <Card style={{ marginBottom: 14 }}>
      <CardTitle emoji={flag}>{title}</CardTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", marginBottom: 8 }}>
        {["Nederlands", `${title} / Uitspraak`].map((h) => (
          <div key={h} style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, padding: "0 0 6px", letterSpacing: "0.03em" }}>{h}</div>
        ))}
        {shown.map((p) => (
          <>
            <div key={p.nl + "nl"} style={{ fontSize: 12, color: colors.textBody, padding: "5px 8px 5px 0", borderTop: `1px solid ${colors.surfaceBorder}`, lineHeight: 1.3 }}>{p.nl}</div>
            <div key={p.nl + "tgt"} style={{ fontSize: 12, padding: "5px 0 5px 0", borderTop: `1px solid ${colors.surfaceBorder}`, lineHeight: 1.3 }}>
              <span style={{ color: colors.text, fontWeight: 600 }}>{p.dk ?? p.target}</span>
              <span style={{ display: "block", fontSize: 10, color: colors.textMuted, marginTop: 1, fontStyle: "italic" }}>{p.uit}</span>
            </div>
          </>
        ))}
      </div>
      <button onClick={() => setExpanded((v) => !v)}
        style={{ background: "none", border: "none", cursor: "pointer", color: colors.sky, fontSize: 12, fontWeight: 600, padding: "4px 0 0" }}>
        {expanded ? "Minder tonen ↑" : `Meer zinnen (${phrases.length - shown.length} meer) ↓`}
      </button>
    </Card>
  );
}

function MultiLanguagePhrasesCard({ sections }) {
  const [activeSection, setActiveSection] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const section = sections[activeSection];
  const shown = expanded ? section.phrases : section.phrases.slice(0, 5);

  return (
    <Card style={{ marginBottom: 14 }}>
      <CardTitle emoji="💬">Handige zinnen</CardTitle>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {sections.map((s, i) => (
          <button key={s.language} onClick={() => { setActiveSection(i); setExpanded(false); }}
            style={{
              background: i === activeSection ? `${s.color}22` : "transparent",
              border: `1px solid ${i === activeSection ? s.color : colors.surfaceBorder}`,
              borderRadius: 20, padding: "4px 10px", cursor: "pointer",
              fontSize: 11, fontWeight: 700, color: i === activeSection ? s.color : colors.textMuted,
            }}>
            {s.flag} {s.language}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", marginBottom: 8 }}>
        {["Nederlands", `${section.language} / Uitspraak`].map((h) => (
          <div key={h} style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, padding: "0 0 6px", letterSpacing: "0.03em" }}>{h}</div>
        ))}
        {shown.map((p) => (
          <>
            <div key={p.nl + "nl"} style={{ fontSize: 12, color: colors.textBody, padding: "5px 8px 5px 0", borderTop: `1px solid ${colors.surfaceBorder}`, lineHeight: 1.3 }}>{p.nl}</div>
            <div key={p.nl + "tgt"} style={{ fontSize: 12, padding: "5px 0 5px 0", borderTop: `1px solid ${colors.surfaceBorder}`, lineHeight: 1.3 }}>
              <span style={{ color: colors.text, fontWeight: 600 }}>{p.target}</span>
              <span style={{ display: "block", fontSize: 10, color: colors.textMuted, marginTop: 1, fontStyle: "italic" }}>{p.uit}</span>
            </div>
          </>
        ))}
      </div>
      <button onClick={() => setExpanded((v) => !v)}
        style={{ background: "none", border: "none", cursor: "pointer", color: colors.sky, fontSize: 12, fontWeight: 600, padding: "4px 0 0" }}>
        {expanded ? "Minder tonen ↑" : `Meer zinnen (${section.phrases.length - shown.length} meer) ↓`}
      </button>
    </Card>
  );
}

// ── Multi-stop itinerary ─────────────────────────────────────────

function StopsCard({ stopForecasts, wxStatus }) {
  const { activeTrip } = useTrip();
  const status = wxStatus;
  const months = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];

  return (
    <Card style={{ marginBottom: 14 }}>
      <CardTitle emoji="🗺️">Reisroute</CardTitle>
      {activeTrip.stops.map((stop, i) => {
        const sf = stopForecasts?.find((s) => s.stop === stop);
        const sp = sf?.days.length ? sf.days : null;
        const avgMax = sp ? Math.round(sp.reduce((s, d) => s + d.tempMax, 0) / sp.length) : null;
        const rainDays = sp ? sp.filter((d) => d.precipMm >= 1).length : null;
        const s = new Date(stop.startDate + "T12:00:00");
        const e = new Date(stop.endDate   + "T12:00:00");
        const nights = Math.round((e - s) / 86400000);
        const dateStr = `${s.getDate()}–${e.getDate()} ${months[s.getMonth()]}`;

        return (
          <div key={stop.name} style={{ display: "flex", gap: 12, padding: "10px 0", borderTop: i === 0 ? "none" : `1px solid ${colors.surfaceBorder}` }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32, flexShrink: 0 }}>
              <span style={{ fontSize: 20 }}>{stop.flag}</span>
              {i < activeTrip.stops.length - 1 && (
                <div style={{ width: 2, flex: 1, background: colors.surfaceBorder, margin: "4px 0", minHeight: 16 }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: colors.text }}>{stop.name}</div>
              <div style={{ fontSize: 12, color: colors.textMuted }}>{stop.country} · {dateStr} · {nights} nacht{nights !== 1 ? "en" : ""}</div>
              {avgMax != null ? (
                <div style={{ fontSize: 12, color: colors.textBody, marginTop: 3 }}>
                  {avgMax > 28 ? "🌡️" : avgMax > 18 ? "☀️" : avgMax > 10 ? "🌤️" : "❄️"} {avgMax}°C
                  {rainDays > 0 && <span style={{ marginLeft: 6, color: colors.textMuted }}>{rainDays}d regen</span>}
                  {rainDays === 0 && <span style={{ marginLeft: 6, color: "#34D399" }}>droog</span>}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 3 }}>
                  {status === "loading" ? "Weer laden…" : "Weer nog niet beschikbaar"}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </Card>
  );
}

// ── Main ─────────────────────────────────────────────────────────

export default function TripDetailView({ onBack, onNavigate }) {
  const { activeTrip } = useTrip();
  const { status: wxStatus, stopForecasts } = useWeatherForecast(activeTrip);
  const isDKTrip       = activeTrip.id === "ripstar-dk-2026";
  const isRoadtrip     = activeTrip.id === "europe-roadtrip-2026";
  const isKite         = activeTrip.activities?.includes("kite") ?? true;

  return (
    <>
      <PageHero
        eyebrow={`${activeTrip.flag ?? activeTrip.emoji} ${activeTrip.subtitle}`}
        title={activeTrip.name}
        subtitle={formatDateRange(activeTrip.startDate, activeTrip.endDate)}
        onBack={onBack}
        backLabel="← Alle trips"
      >
        {isKite && <WindWidget />}
      </PageHero>

      <div className="page-content">
        <TripCountdownCard />

        <div className="home-grid-2">
          <PackingProgressCard onNavigate={onNavigate} />
          <SunWaterCard />
        </div>

        {activeTrip.stops && <StopsCard stopForecasts={stopForecasts} wxStatus={wxStatus} />}
        <PreTripTodoCard />
        <WeatherForecast stopForecasts={stopForecasts} wxStatus={wxStatus} />

        {isDKTrip && (
          <>
            <div className="home-grid-2" style={{ marginTop: 14 }}>
              <DriveInfoCard routes={DK_ROUTES} mapsUrl={CAMP_MAPS} mapsLabel="Open kamp in Google Maps" />
              <EmergencyInfoCard items={DK_EMERGENCY_ITEMS} title="Noodinfo & kamp" />
            </div>
            <div style={{ marginTop: 14 }}>
              <SingleLanguagePhrasesCard flag="🇩🇰" title="Handig Deens" phrases={DK_PHRASES} />
            </div>
          </>
        )}

        {isRoadtrip && (
          <>
            <div className="home-grid-2" style={{ marginTop: 14 }}>
              <DriveInfoCard
                routes={roadtripRoutes}
                internalRoutes={roadtripInternalRoutes}
                mapsUrl={roadtripMapsUrl}
                mapsLabel="Open Dienten in Google Maps"
              />
              <EmergencyInfoCard items={roadtripEmergency} title="Noodinfo per land" />
            </div>
            <div style={{ marginTop: 14 }}>
              <MultiLanguagePhrasesCard sections={roadtripPhrases} />
            </div>
          </>
        )}
      </div>
    </>
  );
}

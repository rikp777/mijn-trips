import { useState } from "react";
import { colors } from "../constants/theme";
import { journalEntries } from "../data/journal";
import { trips } from "../data/trips";
import PageHero from "../components/PageHero";

const NL_DAYS = ["zo","ma","di","wo","do","vr","za"];
const MONTHS  = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];

function formatDate(dateStr, time) {
  const d = new Date(dateStr + "T12:00:00");
  const base = `${NL_DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  return time ? `${base} · ${time}` : base;
}

function tripFor(id) {
  return trips.find((t) => t.id === id);
}

// ── Lightbox ─────────────────────────────────────────────────────

function Lightbox({ src, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)", zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <img
        src={src}
        alt=""
        style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 10, objectFit: "contain" }}
      />
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 20, right: 20,
          background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 99,
          color: "#fff", fontSize: 18, width: 36, height: 36, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ── Single entry ─────────────────────────────────────────────────

function JournalEntry({ entry, showTripBadge, isLast }) {
  const [lightbox, setLightbox] = useState(null);
  const trip = tripFor(entry.tripId);

  return (
    <>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      <div style={{ display: "flex", gap: 14, paddingBottom: isLast ? 0 : 24 }}>
        {/* Timeline column */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 14 }}>
          <div style={{
            width: 12, height: 12, borderRadius: 99, background: colors.sky,
            border: `2px solid #0C1A2E`, flexShrink: 0, zIndex: 1,
          }} />
          {!isLast && (
            <div style={{ flex: 1, width: 2, background: colors.surfaceBorder, marginTop: 4, minHeight: 20 }} />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: colors.textMuted }}>
              {formatDate(entry.date, entry.time)}
            </span>
            {showTripBadge && trip && (
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: `${colors.sky}20`, color: colors.sky,
                borderRadius: 20, padding: "2px 8px",
              }}>
                {trip.flag} {trip.name}
              </span>
            )}
          </div>

          {/* Card */}
          <div style={{
            background: colors.surface,
            border: `1px solid ${colors.surfaceBorder}`,
            borderRadius: 12,
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{ padding: "12px 14px", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{entry.emoji}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: colors.text, lineHeight: 1.3 }}>
                  {entry.title}
                </div>
                {entry.location && (
                  <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 3 }}>
                    📍 {entry.location}
                  </div>
                )}
              </div>
            </div>

            {/* Text */}
            {entry.text && (
              <div style={{
                padding: "0 14px 12px",
                fontSize: 13, color: colors.textBody, lineHeight: 1.65,
              }}>
                {entry.text}
              </div>
            )}

            {/* Images */}
            {entry.images?.length > 0 && (
              <div style={{
                display: "flex", gap: 8,
                overflowX: "auto", padding: "4px 14px 14px",
                scrollbarWidth: "none",
              }}>
                {entry.images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    onClick={() => setLightbox(src)}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                    style={{
                      width: 130, height: 95, borderRadius: 8,
                      objectFit: "cover", flexShrink: 0,
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Empty state ───────────────────────────────────────────────────

function EmptyState({ tripId }) {
  const trip = tripId ? tripFor(tripId) : null;
  return (
    <div style={{ textAlign: "center", padding: "48px 20px" }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>📸</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 8 }}>
        {trip ? `Nog geen berichten voor ${trip.flag} ${trip.name}` : "Nog geen reisberichten"}
      </div>
      <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.7 }}>
        Voeg je eerste bericht toe in{" "}
        <code style={{ background: colors.surface, padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>
          src/data/journal.js
        </code>
        <br />
        {trip && (
          <>
            Foto's horen in{" "}
            <code style={{ background: colors.surface, padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>
              public/journal/{tripId}/
            </code>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────

export default function JournalView() {
  const [filterTripId, setFilterTripId] = useState(null);

  const sorted = [...journalEntries].sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return (b.time || "").localeCompare(a.time || "");
  });

  const filtered = filterTripId
    ? sorted.filter((e) => e.tripId === filterTripId)
    : sorted;

  const tripsWithEntries = trips.filter((t) =>
    journalEntries.some((e) => e.tripId === t.id)
  );

  // eyebrow changes based on active filter
  const activeTripObj = filterTripId ? tripFor(filterTripId) : null;
  const eyebrow = activeTripObj
    ? `${activeTripObj.flag} ${activeTripObj.subtitle}`
    : "📸 Reisberichten & foto's";

  return (
    <>
      <PageHero eyebrow={eyebrow} title="Reislog" subtitle={activeTripObj ? activeTripObj.name : "Alle trips"} />

      <div className="page-content">
        {/* Trip filter chips */}
        {tripsWithEntries.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            <FilterChip
              label="Alle trips"
              active={!filterTripId}
              onClick={() => setFilterTripId(null)}
            />
            {tripsWithEntries.map((trip) => (
              <FilterChip
                key={trip.id}
                label={`${trip.flag} ${trip.name}`}
                active={filterTripId === trip.id}
                onClick={() => setFilterTripId(trip.id)}
              />
            ))}
          </div>
        )}

        {/* Timeline */}
        {filtered.length === 0 ? (
          <EmptyState tripId={filterTripId} />
        ) : (
          <div>
            {filtered.map((entry, i) => (
              <JournalEntry
                key={entry.id}
                entry={entry}
                showTripBadge={!filterTripId}
                isLast={i === filtered.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `${colors.sky}22` : "none",
        border: `1px solid ${active ? colors.sky : colors.surfaceBorder}`,
        borderRadius: 20, padding: "5px 13px",
        color: active ? colors.accentLight : colors.textMuted,
        fontSize: 12, fontWeight: 700, cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
      }}
    >
      {label}
    </button>
  );
}

// ── Reislog ──────────────────────────────────────────────────────
//
// Voeg een nieuw bericht toe door een object aan dit array toe te voegen.
// De app leest dit bestand direct — na een git push is het live op GitHub Pages.
//
// Velden:
//   id        — unieke string, bijv. "dk2026-dag1"
//   tripId    — moet overeenkomen met een id in trips.js
//   date      — "YYYY-MM-DD"
//   time      — optioneel, "HH:MM"
//   emoji     — sfeer-emoji voor het bericht (✈️ 🪁 🏕️ 🌊 🍺 🚗 ...)
//   title     — korte koptekst
//   text      — optioneel, langere beschrijving (meerdere regels OK)
//   location  — optioneel, naam van de locatie
//   images    — optioneel, array van paden naar /public/journal/[tripId]/bestand.jpg
//
// Foto's toevoegen:
//   1. Zet de foto's in public/journal/[tripId]/   (maak de map aan als die er niet is)
//   2. Refereer ernaar als "/journal/tarifa-test-2025/strand.jpg"
//
// Volgorde: nieuwste bovenaan — de app sorteert dit zelf ook, maar het helpt
// voor leesbaarheid.

export const journalEntries = [

  // ── Tarifa Test Trip 2025 (voorbeeldberichten) ───────────────────

  {
    id: "tarifa-dag8",
    tripId: "tarifa-test-2025",
    date: "2025-06-14",
    time: "08:15",
    emoji: "✈️",
    title: "Tot ziens, Tarifa",
    text: "Laatste ochtend aan het strand voor de terugvlucht. Nog één keer de zon zien opkomen boven de Middellandse Zee. De hele week waaide het perfect — gemiddeld zo'n 17 knopen. Volgend jaar zeker weer!",
    location: "Playa de Los Lances, Tarifa",
    images: [],
  },

  {
    id: "tarifa-dag5",
    tripId: "tarifa-test-2025",
    date: "2025-06-11",
    time: "17:30",
    emoji: "🪁",
    title: "Eerste echte water-starts gelukt!",
    text: "Wind stond de hele dag op 18 knopen uit het westen — ideaal. Vandaag voor het eerst echt omhoog gekomen en een paar slagen gemaakt. Gevoel is niet meer te beschrijven. De instructeur stond te juichen op de kant.",
    location: "Playa de Los Lances, Tarifa",
    images: [],
  },

  {
    id: "tarifa-dag2",
    tripId: "tarifa-test-2025",
    date: "2025-06-08",
    time: "11:00",
    emoji: "🌊",
    title: "Eerste vliegles op het strand",
    text: "Vandaag voor het eerst op het echte strand met een 9m² vlieger. Wind constant op 14 knopen — perfect voor beginners. Bodydrag in het water en de eerste board-starts geprobeerd. De Atlantische Oceaan is koud maar dat merk je niet eens.",
    location: "Playa de Los Lances, Tarifa",
    images: [],
  },

  {
    id: "tarifa-dag1",
    tripId: "tarifa-test-2025",
    date: "2025-06-07",
    time: "16:00",
    emoji: "🚗",
    title: "Gearriveerd in Tarifa!",
    text: "Na een vlucht naar Málaga en ruim een uur langs de Spaanse kust gereden zijn we eindelijk in Tarifa. Het is heerlijk warm, 28°C, en het waait al stevig — dit wordt een topweek.",
    location: "Tarifa, Spanje",
    images: [],
  },

  // ── Ripstar Kitecamp DK 2026 ─────────────────────────────────────
  // Voeg hieronder berichten toe tijdens de trip (4–11 juli 2026)
  //
  // Voorbeeld:
  // {
  //   id: "dk2026-dag1",
  //   tripId: "ripstar-dk-2026",
  //   date: "2026-07-04",
  //   time: "15:00",
  //   emoji: "🛣️",
  //   title: "Aangekomen bij het kamp!",
  //   text: "Na ~10 uur rijden door Duitsland en Denemarken zijn we er eindelijk.",
  //   location: "Hvide Sande, Denemarken",
  //   images: ["/journal/ripstar-dk-2026/aankomst.jpg"],
  // },

];

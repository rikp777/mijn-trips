// Confirmed: Ripstar uses Skaven Strand Camping, Skavenvej 32, 6880 Tarm.
// Coordinates: 55.892°N 8.366°E (source: pincamp.com GPS data).
// Kite spot is 5 min walk west along the fjord beach from the camping.
//
// driveMin = estimated drive from the camp (null = this IS the camp, 0 = walking).
// category drives the marker colour, legend and filter chips.

export const FJORD_CENTER = { lat: 55.95, lon: 8.25, zoom: 11 };

export const locationCategories = {
  camp:       { label: "Kitecamp",           color: "#0EA5E9" },
  kite:       { label: "Kitespot",           color: "#34D399" },
  food:       { label: "Eten & drinken",     color: "#EC4899" },
  restaurant: { label: "Restaurant",         color: "#F97316" },
  sight:      { label: "Bezienswaardigheid", color: "#F59E0B" },
  nature:     { label: "Natuur & strand",    color: "#10B981" },
  nightlife:  { label: "Uitgaan & bars",     color: "#A855F7" },
  practical:  { label: "Praktisch",          color: "#94A3B8" },
};

const mapsLink = (lat, lon, name) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lon}(${encodeURIComponent(name)})`;

const make = (loc) => ({ ...loc, maps: mapsLink(loc.lat, loc.lon, loc.name) });

export const locations = [
  // ── Camp ───────────────────────────────────────────────────────────
  make({
    id: "camp",
    name: "Ripstar Kitecamp — Skaven Strand",
    emoji: "🏕️",
    category: "camp",
    lat: 55.892,
    lon: 8.366,
    driveMin: null,
    desc: "Skaven Strand Camping, Skavenvej 32, 6880 Tarm. Glamping lodges, tipi's, bar, sauna, buitenzwembad & vuurplaats. Dit is je thuisbasis voor de week.",
  }),

  // ── Kitespots ──────────────────────────────────────────────────────
  make({
    id: "fjord",
    name: "Kitespot — Skaven Fjord Beach",
    emoji: "🪁",
    category: "kite",
    lat: 55.895,
    lon: 8.345,
    driveMin: 0,
    desc: "Vlak, ondiep fjordwater — ideaal voor beginners. 5 minuten lopen van het kamp. Wind waait ~62% van de zomertijd. Hier vinden alle lessen plaats.",
  }),
  make({
    id: "bork",
    name: "Bork Havn — kitespot & Viking haven",
    emoji: "⛵",
    category: "kite",
    lat: 55.854,
    lon: 8.272,
    driveMin: 20,
    desc: "Bekende kitespot in de zuidhoek van het fjord. Ook een authentieke Viking haven om te bezoeken — mooie combinatie.",
  }),
  make({
    id: "kabelpark",
    name: "Kabelparken Hvide Sande",
    emoji: "🏄",
    category: "kite",
    lat: 56.006,
    lon: 8.136,
    driveMin: 45,
    desc: "Wakeboarden & waterski aan de kabelbaan. Perfecte afwisseling als de kitewind wegvalt of je wil variëren.",
  }),

  // ── Eten & drinken ─────────────────────────────────────────────────
  make({
    id: "hvide_sande",
    name: "Hvide Sande haven",
    emoji: "🐟",
    category: "food",
    lat: 55.9989,
    lon: 8.1264,
    driveMin: 45,
    desc: "Pittoresk vissersstadje met water aan twee kanten. Verse vis & friet bij de sluis. Gezellig avondje uit.",
  }),
  make({
    id: "ringkobing",
    name: "Ringkøbing stadje",
    emoji: "🏘️",
    category: "food",
    lat: 56.0939,
    lon: 8.2446,
    driveMin: 30,
    desc: "Gezellige oude steegjes, terrasjes en ijs. Leuk voor een avondje shoppen en buiten eten.",
  }),

  // ── Bezienswaardigheid ─────────────────────────────────────────────
  make({
    id: "lyngvig",
    name: "Lyngvig Fyr (vuurtoren)",
    emoji: "🗼",
    category: "sight",
    lat: 56.0497,
    lon: 8.1186,
    driveMin: 50,
    desc: "228 treden voor een 360°-panorama over Noordzee, fjord en duinen. Toppertje bij zonsondergang.",
  }),
  make({
    id: "abelines",
    name: "Abelines Gaard",
    emoji: "🏚️",
    category: "sight",
    lat: 56.0436,
    lon: 8.1242,
    driveMin: 50,
    desc: "Authentieke klitgaard (duinboerderij) — een uniek kijkje in het oude West-Jutlandse boerenbestaan.",
  }),
  make({
    id: "ringkoebing_museum",
    name: "Ringkøbing Museum",
    emoji: "🏛️",
    category: "sight",
    lat: 56.0911,
    lon: 8.2435,
    driveMin: 30,
    desc: "Lokaal museum over de West-Jutlandse geschiedenis: visserij, ambacht en de eeuwige strijd tegen het water. Compact maar verrassend diepgaand.",
  }),
  make({
    id: "stauning_airport",
    name: "Stauning Lufthavn — Vintage Aircraft Museum",
    emoji: "✈️",
    category: "sight",
    lat: 55.9897,
    lon: 8.3539,
    driveMin: 25,
    desc: "Historisch vliegveld met een indrukwekkende collectie WWII-vliegtuigen en klassieke propellermachines. Uniek in Scandinavië — een echte aanrader.",
  }),
  make({
    id: "nymindegab",
    name: "Nymindegab — historisch vissersdorp",
    emoji: "⚓",
    category: "sight",
    lat: 55.8186,
    lon: 8.1794,
    driveMin: 35,
    desc: "Een van de oudste bewoonde kustplaatsen van Denemarken. Eeuwenlang bewoond door vissers die de Noordzee trotseerden. Unieke sfeer en architectuur.",
  }),

  // ── Restaurant ────────────────────────────────────────────────────
  make({
    id: "hvide_sande_roegeri",
    name: "Hvide Sande Røgeri",
    emoji: "🐠",
    category: "restaurant",
    lat: 56.0003,
    lon: 8.1267,
    driveMin: 45,
    desc: "Iconische visrokerij aan het kanaal. Gerookte makreel, rejer (garnalen) en verse lokale vangst. Absoluut een must-eat in West-Jutland — altijd druk, terecht.",
  }),
  make({
    id: "nymindegab_kro",
    name: "Nymindegab Kro",
    emoji: "🍽️",
    category: "restaurant",
    lat: 55.8190,
    lon: 8.1802,
    driveMin: 35,
    desc: "Historische kro (herberg) die al eeuwen reizigers en vissers bedient aan het Noordzeepad. Traditionele Deense keuken in een unieke, authentieke sfeer.",
  }),
  make({
    id: "cafe_biografen",
    name: "Café Biografen — Ringkøbing",
    emoji: "☕",
    category: "restaurant",
    lat: 56.0924,
    lon: 8.2418,
    driveMin: 30,
    desc: "Populair café-restaurant in het historische centrum van Ringkøbing. Perfect voor lunch of een vroeg diner na een dag op het water.",
  }),
  make({
    id: "stauning_whisky_bar",
    name: "Stauning Whisky Destilleri & Bar",
    emoji: "🥃",
    category: "restaurant",
    lat: 55.9930,
    lon: 8.4830,
    driveMin: 30,
    desc: "Bekroonde Deense whisky-destilleerderij met proeverijen en rondleidingen. Uniek avonduitje — de lokale rogge-whisky is wereldberoemd.",
  }),

  // ── Uitgaan & bars ─────────────────────────────────────────────────
  make({
    id: "ringkoebing_bars",
    name: "Ringkøbing — kroegen & terrasjes",
    emoji: "🍺",
    category: "nightlife",
    lat: 56.0939,
    lon: 8.2446,
    driveMin: 30,
    desc: "Ringkøbing heeft meerdere gezellige kroegen en terrasjes rondom het historische centrum en de haven. De levendigste uitgaansplek in de regio.",
  }),
  make({
    id: "hvide_sande_bar",
    name: "Hvide Sande — haven & strandbar",
    emoji: "🎶",
    category: "nightlife",
    lat: 55.9989,
    lon: 8.1264,
    driveMin: 45,
    desc: "Rond de vissershaven van Hvide Sande vind je bars en terrassen die 's avonds gezellig worden, zeker in het zomerseizoen. Combineer met verse vis.",
  }),
  make({
    id: "skjern_nightlife",
    name: "Skjern — cafés & avondleven",
    emoji: "🌙",
    category: "nightlife",
    lat: 55.9508,
    lon: 8.4967,
    driveMin: 35,
    desc: "Skjern is de grootste stad in de buurt en heeft meer avondkeuze dan Ringkøbing. Goed voor een echte avond uit met bar-hoppen.",
  }),

  // ── Natuur & strand ────────────────────────────────────────────────
  make({
    id: "sondervig",
    name: "Søndervig strand",
    emoji: "🏖️",
    category: "nature",
    lat: 56.1156,
    lon: 8.1186,
    driveMin: 55,
    desc: "Breed Noordzeestrand met hoge duinen. Perfect voor een strandwandeling op een windstille dag.",
  }),
  make({
    id: "tipperne",
    name: "Tipperne vogelreservaat",
    emoji: "🦅",
    category: "nature",
    lat: 55.8786,
    lon: 8.22,
    driveMin: 30,
    desc: "Uitgestrekt natuurreservaat aan de zuidpunt van het fjord met een rijke vogelpopulatie.",
  }),

  // ── Praktisch ──────────────────────────────────────────────────────
  make({
    id: "rema_tarm",
    name: "Rema 1000 Tarm",
    emoji: "🛒",
    category: "practical",
    lat: 55.908,
    lon: 8.516,
    driveMin: 20,
    desc: "Dichtstbijzijnde grote supermarkt (~20 min). Goed gesorteerd voor boodschappen, Deense snacks en dranken.",
  }),
  make({
    id: "netto_hvide",
    name: "Netto Hvide Sande",
    emoji: "🛒",
    category: "practical",
    lat: 55.997,
    lon: 8.119,
    driveMin: 45,
    desc: "Supermarkt in Hvide Sande. Handig combineren met een bezoekje aan het vissersstadje of de vuurtoren.",
  }),
];

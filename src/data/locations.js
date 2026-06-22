// Ripstar camp: navigate to "Skaven Strand Put & Take" (Fiskesøvej 10) — NOT the camping entrance.
// Park at the pond. Coordinates confirmed via fishingindenmark.info.
// Kite spot is 5 min walk west along the fjord beach from the camping.
//
// driveMin = estimated drive from the camp (null = this IS the camp, 0 = walking).
// category drives the marker colour, legend and filter chips.

export const FJORD_CENTER = { lat: 53.8, lon: 7.5, zoom: 6 };

// Route line: exact stop coordinates are used as waypoints so the line passes through them
export const ROUTE_STOPS = [
  { lat: 51.3288, lon:  5.9819 }, // Panningen
  { lat: 51.3703, lon:  6.1724 }, // Venlo (DE grens)
  { lat: 51.4704, lon:  6.8516 }, // Oberhausen
  { lat: 51.5136, lon:  7.4653 }, // Dortmund
  { lat: 51.9822, lon:  7.7754 }, // STOP 1: Shell Münster (~205 km)
  { lat: 52.2703, lon:  8.0473 }, // Osnabrück
  { lat: 53.0793, lon:  8.8017 }, // Bremen
  { lat: 53.4724, lon:  9.8479 }, // STOP 2: Shell Hamburg-Süd (~497 km)
  { lat: 54.7778, lon:  9.4151 }, // STOP 3: Shell Flensburg - laatste Duitse benzine (~665 km)
  { lat: 55.4945, lon:  9.4718 }, // Kolding (routepunt)
  { lat: 55.7256, lon:  9.5380 }, // Vejle
  { lat: 56.1342, lon:  8.9798 }, // Herning
  { lat: 55.8922, lon:  8.3644 }, // Ringkøbing camp
];

// Local bike day-trip: Camp → Stauning Airport → Ringkøbing (~37 km)
export const DK_BIKE_ROUTE_STOPS = [
  { lat: 55.89222, lon: 8.36444 }, // Ripstar kamp
  { lat: 55.9923,  lon: 8.3463  }, // Stauning Airport
  { lat: 56.0939,  lon: 8.2446  }, // Ringkøbing centrum
];

export const locationCategories = {
  home:       { label: "Thuis",              color: "#6366F1" },
  camp:       { label: "Kitecamp",           color: "#0EA5E9" },
  reststop:   { label: "Rustpauze & tanken", color: "#EF4444" },
  bike:       { label: "Fietsroute",         color: "#22C55E" },
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
  // ── Thuis ──────────────────────────────────────────────────────────
  make({
    id: "home",
    name: "Thuis — Panningen",
    emoji: "🏠",
    category: "home",
    lat: 51.3288, lon: 5.9819,
    driveMin: null,
    desc: "Vertrekpunt in Panningen, Limburg. ~970 km naar het kamp via E45 Jutland (~9.5u) of ~810 km + ferry via Puttgarden (~8.5u).",
  }),

  // ── Camp ───────────────────────────────────────────────────────────
  make({
    id: "camp",
    name: "Ripstar Kitecamp — Skaven Strand",
    emoji: "🏕️",
    category: "camp",
    lat: 55.89222,
    lon: 8.36444,
    driveMin: null,
    desc: "Skaven Strand Put & Take, Fiskesøvej 10. Navigeer op naam 'Skaven Strand Put & Take' — het Ripstar-terrein zit NIET bij de campingingang. Parkeren aan de vijver.",
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
    lat: 55.8371,
    lon: 8.26609,
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

  // ── Rustpauzes & tanken (Ford Puma 2020, 48L tank, ~6.5L/100km) ────
  make({
    id: "stop-munster",
    name: "Stop 1 — Münster (A1)",
    emoji: "☕",
    category: "reststop",
    lat: 51.9822, lon: 7.7754,
    stop: "~195 km · ~2u rijden · STOP 1",
    desc: "Eerste pauze. Toilet, koffie, uitrekken. Ford Puma: ~12.7L verbruikt, nog ~35L over (~540 km range). Benzine hier goedkoper dan in NL — optioneel alvast bijvullen.",
  }),
  make({
    id: "stop-hamburg",
    name: "Stop 2 — Hamburg (A1/A7) — TANK HIER",
    emoji: "⛽",
    category: "reststop",
    lat: 53.4724, lon: 9.8479,
    stop: "~502 km · ~5u rijden · TANK VERPLICHT",
    desc: "Middagpauze + verplichte tankstop. Ford Puma: ~32.6L verbruikt, nog maar ~15L over (~230 km). Dit is NIET genoeg voor de rest van de rit (405 km). Vol tanken! Deens benzine is ~20ct/L duurder. Gebruik 95 E10 (benzine).",
  }),
  make({
    id: "stop-flensburg",
    name: "Stop 3 — Shell Flensburg — VOL TANKEN!",
    emoji: "⛽",
    category: "reststop",
    lat: 54.7778, lon: 9.4151,
    stop: "~665 km · ~6.5u rijden · LAATSTE DUITSE BENZINE",
    desc: "LAATSTE KANS voor goedkope benzine! Na de grens is Deens benzine ~20ct/L duurder. Vul hier de tank HELEMAAL VOL, ook als je nog genoeg hebt. Ford Puma: van hier naar kamp is maar 249 km = 16L. Vol tanken = geen stop meer nodig in Denemarken.",
  }),

  // ── Fietsroute ──────────────────────────────────────────────────────
  make({
    id: "fietstrip",
    name: "Fietsdag: kamp → Ringkøbing",
    emoji: "🚲",
    category: "bike",
    lat: 55.9923, lon: 8.3463,
    driveMin: 25,
    desc: "Dagtrip op de fiets vanuit het kamp: langs de fjordoever → Stauning Vliegtuigmuseum → Ringkøbing (~37 km, 1 kant). Rustige wegen door polderland. Verhuur: vraag bij de kampstaf of Tourist Info Ringkøbing.",
  }),
  make({
    id: "fiets-ringkobing",
    name: "Ringkøbing — fietseindpunt",
    emoji: "🏁",
    category: "bike",
    lat: 56.0939, lon: 8.2446,
    driveMin: 30,
    desc: "Eindpunt van de fietsdag (~37 km). Beloon jezelf: ijs in de Østergade, verse vis aan de haven of een koffie op een terrasje. Daarna dezelfde weg terug of je laten ophalen.",
  }),

  // ── Bezienswaardigheid ─────────────────────────────────────────────
  make({
    id: "lyngvig",
    name: "Lyngvig Fyr (vuurtoren)",
    emoji: "🗼",
    category: "sight",
    lat: 56.0497,
    lon: 8.1036,
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
    lat: 56.0808,
    lon: 8.2439,
    driveMin: 30,
    desc: "Lokaal museum over de West-Jutlandse geschiedenis: visserij, ambacht en de eeuwige strijd tegen het water. Compact maar verrassend diepgaand.",
  }),
  make({
    id: "stauning_airport",
    name: "Danmarks Flymuseum — Stauning Lufthavn",
    emoji: "✈️",
    category: "sight",
    lat: 55.9923,
    lon: 8.3463,
    driveMin: 25,
    desc: "Historisch vliegveld met een indrukwekkende collectie WWII-vliegtuigen en klassieke propellermachines. Uniek in Scandinavië — een echte aanrader.",
  }),
  make({
    id: "nymindegab",
    name: "Nymindegab — historisch vissersdorp",
    emoji: "⚓",
    category: "sight",
    lat: 55.8170,
    lon: 8.1925,
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
    lat: 55.8170,
    lon: 8.1925,
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
    lat: 55.9531,
    lon: 8.4036,
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

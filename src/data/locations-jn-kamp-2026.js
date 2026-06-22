const mapsLink = (lat, lon, name) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lon}(${encodeURIComponent(name)})`;
const make = (loc) => ({ ...loc, maps: mapsLink(loc.lat, loc.lon, loc.name) });

// Route zoomed out a bit to show the full Peel loop (slightly west via Middenpeelweg)
export const JN_CENTER = { lat: 51.420, lon: 5.972, zoom: 10 };

// Via-points for OSRM cycling routing (~30 km)
// Route: Panningen -> Blokhut -> west via Maasbreeseweg -> Middenpeelweg door de Peel ->
//        Kronenberg -> Americaanseweg -> America -> Lorbaan -> Leunen -> Ysselsteyn
export const JN_ROUTE_STOPS = [
  { lat: 51.3288, lon: 5.9819 }, // Thuis Panningen
  { lat: 51.3262, lon: 5.9912 }, // Blokhut JN
  { lat: 51.4158, lon: 5.9995 }, // Kronenberg
  { lat: 51.4371, lon: 5.9799 }, // America
  { lat: 51.5082, lon: 5.9798 }, // Leunen
  { lat: 51.5270, lon: 5.9790 }, // Kampterrein De Paardekop
];
export const JN_ROUTE_MODE = "bike";

export const jnCategories = {
  home:      { label: "Thuis / Blokhut",     color: "#6366F1" },
  camp:      { label: "Kamp",                color: "#0EA5E9" },
  waypoint:  { label: "Tussenstop",          color: "#F59E0B" },
  nature:    { label: "Natuur & activiteit", color: "#10B981" },
  practical: { label: "Praktisch",           color: "#94A3B8" },
};

export const locations = [
  make({
    id: "home",
    name: "Thuis — Panningen",
    emoji: "🏠",
    category: "home",
    lat: 51.3288, lon: 5.9819,
    stop: "Vertrekpunt · ~30 km fietsen",
    desc: "Vertrekpunt. Eerst naar de blokhut (bagage), dan via Maasbreeseweg en de Middenpeelweg door de Peel naar het kamp. Reken op 2-2.5 uur.",
  }),

  make({
    id: "blokhut",
    name: "Blokhut Jong Nederland Panningen",
    emoji: "🏚️",
    category: "home",
    lat: 51.3262, lon: 5.9912,
    stop: "18 novemberring 60A · bagage afzetten",
    desc: "Clubgebouw van Jong Nederland. Bagage hier afzetten voordat je het avontuur in fietst. ~1 km van thuis.",
  }),

  make({
    id: "kronenberg",
    name: "Kronenberg",
    emoji: "🌾",
    category: "waypoint",
    lat: 51.4158, lon: 5.9995,
    stop: "~14 km · halverwege de Peel",
    desc: "Klein Limburgs dorp aan het einde van de Middenpeelweg. Je rijdt hier via de Americaanseweg de laatste kilometers naar America. Gezellig rustpunt.",
  }),

  make({
    id: "america",
    name: "America — ja, een echt dorp!",
    emoji: "🌎",
    category: "waypoint",
    lat: 51.4371, lon: 5.9799,
    stop: "~18 km · perfecte rustpauze",
    desc: "America is een echt bestaand dorp in Noord-Limburg, vernoemd door 19e-eeuwse veenarbeiders die droomden van een nieuw begin. Je rijdt er letterlijk via de Americaanseweg in. Welkom in Amerika!",
  }),

  make({
    id: "leunen",
    name: "Leunen",
    emoji: "🏘️",
    category: "waypoint",
    lat: 51.5082, lon: 5.9798,
    stop: "~26 km · bijna er!",
    desc: "Rustig dorp in de gemeente Venray. Na Leunen is het nog maar 2.5 km via de Leunseweg naar het kampterrein. Finish lijn in zicht!",
  }),

  make({
    id: "camp",
    name: "Kampterrein De Paardekop",
    emoji: "⛺",
    category: "camp",
    lat: 51.5270, lon: 5.9790,
    stop: "Jong Nederland Panningen · 18-21 jul",
    desc: "Scouting kampterrein De Paardekop, Paardekopweg 40, Ysselsteyn. Bosrijke omgeving aan de rand van De Peel. Faciliteiten: sanitair, keuken, kampvuurplaats.",
  }),

  make({
    id: "de-peel",
    name: "Nationaal Park De Peel",
    emoji: "🌿",
    category: "nature",
    lat: 51.4500, lon: 5.9300,
    stop: "Langs de route",
    desc: "Je fietst langs de rand van dit unieke veengebied via de Middenpeelweg. Uitgestrekte moerassen en heide, uniek in Nederland. Natura 2000-gebied.",
  }),

  make({
    id: "zwembad-venray",
    name: "Zwembad De Waterpeul — Venray",
    emoji: "🏊",
    category: "nature",
    lat: 51.5267, lon: 5.9729,
    stop: "~15 min vanaf kamp",
    desc: "Buitenzwembad in Venray. Goed voor activiteiten met de groep op warme dagen. Openlucht glijbanen en peuterbad.",
  }),

  make({
    id: "supermarkt-venray",
    name: "Albert Heijn — Venray",
    emoji: "🛒",
    category: "practical",
    lat: 51.5273, lon: 5.9742,
    stop: "~15 min vanaf kamp",
    desc: "Dichtstbijzijnde supermarkt voor eventuele inkopen. Openingstijden: ma-za 8:00-21:00, zo 10:00-18:00.",
  }),

  make({
    id: "ehbo-venray",
    name: "VieCuri Medisch Centrum — Venray",
    emoji: "🏥",
    category: "practical",
    lat: 51.5297, lon: 6.0000,
    stop: "~15 min vanaf kamp",
    desc: "Dichtstbijzijnde ziekenhuis voor noodgevallen. Spoedeisende hulp aanwezig. Adres: Meldersloweg 11, Venray.",
  }),
];

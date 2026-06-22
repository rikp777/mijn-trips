const mapsLink = (lat, lon, name) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lon}(${encodeURIComponent(name)})`;
const make = (loc) => ({ ...loc, maps: mapsLink(loc.lat, loc.lon, loc.name) });

export const ROADTRIP_CENTER = { lat: 50.5, lon: 12.0, zoom: 5 };

export const roadtripCategories = {
  home:     { label: "Thuis",                color: "#6366F1" },
  stop:     { label: "Overnachting",         color: "#0EA5E9" },
  reststop: { label: "Rustpauze & tanken",   color: "#EF4444" },
  sight:    { label: "Bezienswaardigheid",   color: "#F59E0B" },
  nature:   { label: "Natuur & wandelen",    color: "#10B981" },
  daytrip:  { label: "Daguitstap",           color: "#8B5CF6" },
  food:     { label: "Eten & drinken",       color: "#EC4899" },
};

// Route line: volledige lus met realistische tussenhaltes
export const ROUTE_STOPS = [
  // NL → AT (via Köln, Frankfurt, München, Salzburg)
  { lat: 51.3288, lon:  5.9819 }, // Panningen
  { lat: 51.0504, lon:  6.8728 }, // Köln
  { lat: 50.1109, lon:  8.6821 }, // Frankfurt
  { lat: 49.4521, lon: 11.0767 }, // Nürnberg
  { lat: 48.1351, lon: 11.5820 }, // München
  { lat: 47.8095, lon: 13.0550 }, // Salzburg
  { lat: 47.4753, lon: 13.1497 }, // Dienten am Hochkönig ①

  // AT → CZ (via Linz, Passau, Plzeň, Praha)
  { lat: 47.8095, lon: 13.0550 }, // Salzburg
  { lat: 48.3069, lon: 14.2858 }, // Linz
  { lat: 48.5742, lon: 13.4588 }, // Passau
  { lat: 49.7477, lon: 13.3776 }, // Plzeň
  { lat: 50.0755, lon: 14.4378 }, // Praha
  { lat: 49.9480, lon: 15.2689 }, // Kutná Hora ②

  // CZ → PL (via Brno, Ostrava, Katowice)
  { lat: 49.1951, lon: 16.6068 }, // Brno
  { lat: 49.8209, lon: 18.2625 }, // Ostrava
  { lat: 50.2596, lon: 19.0216 }, // Katowice
  { lat: 50.0614, lon: 19.9366 }, // Kraków ③

  // PL → DE (via Wrocław, Dresden, Leipzig)
  { lat: 50.2596, lon: 19.0216 }, // Katowice
  { lat: 51.1079, lon: 17.0385 }, // Wrocław
  { lat: 51.0504, lon: 13.7373 }, // Dresden
  { lat: 51.3397, lon: 12.3731 }, // Leipzig
  { lat: 51.7906, lon: 11.1489 }, // Quedlinburg ④

  // DE → NL (via Hannover, Osnabrück, Arnhem)
  { lat: 52.3759, lon:  9.7320 }, // Hannover
  { lat: 52.2703, lon:  8.0473 }, // Osnabrück
  { lat: 51.8453, lon:  5.8718 }, // Nijmegen
  { lat: 51.3288, lon:  5.9819 }, // Panningen (thuis)
];

export const locations = [
  // ── Rustpauzes & tanken (Ford Puma 2020, 48L, ~6.5L/100km highway) ─
  make({
    id: "rt-stop-venlo",
    name: "Stop 1 — Eerste German fuel (A61, Kaldenkirchen)",
    emoji: "⛽",
    category: "reststop",
    lat: 51.310, lon: 6.280,
    stop: "~50 km · net over NL/DE grens",
    desc: "Direct na de grens bijvullen. Duits benzine is ~20-25 ct/L goedkoper dan Nederlands. Gebruik 95 E10 (Benzin). Ford Puma: bijna vol vertrekken = goed plan, maar eerste stop in DE = besparing.",
  }),
  make({
    id: "rt-stop-muenchen",
    name: "Stop 2 — München (A8) — voor de Alpen",
    emoji: "⛽",
    category: "reststop",
    lat: 48.137, lon: 11.375,
    stop: "~750 km · voor de Oostenrijkse grens",
    desc: "Vul op voor je Oostenrijk in rijdt. Oostenrijkse benzine is iets duurder dan Duits. Let op: Oostenrijk verplicht autobahn vignette (~9€ voor 10 dagen). Ford Puma: vanaf Panningen ~750 km = bijna leeg, zeker bijvullen!",
  }),
  make({
    id: "rt-stop-plzen",
    name: "Stop 3 — Plzeň (CZ) — goedkoop tanken",
    emoji: "⛽",
    category: "reststop",
    lat: 49.748, lon: 13.377,
    stop: "~1.200 km · Tsjechische benzine ~1.45€/L",
    desc: "Tsjechische benzine is ~15% goedkoper dan Duits. Betaal met PIN-pas of cash (CZK). Na Tsjechië wordt het nog goedkoper in Polen — maar zeker hier bijvullen voor de route naar Praha/Kutná Hora.",
  }),
  make({
    id: "rt-stop-krakow-fuel",
    name: "Stop 4 — Kraków (PL) — goedkoopste benzine",
    emoji: "⛽",
    category: "reststop",
    lat: 50.040, lon: 19.870,
    stop: "~1.750 km · Poolse benzine ~1.35-1.40€/L",
    desc: "Goedkoopste benzine van de hele roadtrip! Vul hier de tank HELEMAAL VOL voor je Polen verlaat. Van Kraków terug naar NL via Wrocław/Dresden = ~1.500 km. Je hebt minimaal 2 tankbeurten nodig — zeker de goedkoopste Poolse niet missen.",
  }),

  // ── Thuis ────────────────────────────────────────────────────────
  make({
    id: "home",
    name: "Thuis — Panningen",
    emoji: "🏠",
    category: "home",
    lat: 51.3288, lon: 5.9819,
    stop: "Vertrek & aankomst · Limburg, NL",
    desc: "Vertrekpunt in Panningen, Limburg. Naar Dienten: ~1.380 km, ~13u via A2 → A3 → A8 → A10 Tauernautobahn. Terug vanuit Quedlinburg: ~570 km, ~5.5u via A2.",
  }),

  // ── Overnachtingen ────────────────────────────────────────────────

  make({
    id: "stop-dienten",
    name: "Dienten am Hochkönig",
    emoji: "🇦🇹",
    category: "stop",
    lat: 47.4753, lon: 13.1497,
    stop: "Oostenrijk · 10–12 aug · 2 nachten",
    desc: "Rustig Alpenplaatsje aan de voet van de Hochkönig (2941m). Startpunt voor bergwandelingen, gondels en Alpenbeleving. Tol: vignette + Tauernautobahn vereist.",
  }),
  make({
    id: "stop-kutna",
    name: "Kutná Hora",
    emoji: "🇨🇿",
    category: "stop",
    lat: 49.9480, lon: 15.2689,
    stop: "Tsjechië · 12–14 aug · 2 nachten",
    desc: "UNESCO-stad van zilver, 70 km van Praag. Middeleeuwse kathedralen, de beroemde Beenderkerk en een koninklijke munt. Betalen met CZK — pinnen werkt overal.",
  }),
  make({
    id: "stop-krakow",
    name: "Kraków",
    emoji: "🇵🇱",
    category: "stop",
    lat: 50.0614, lon: 19.9366,
    stop: "Polen · 14–20 aug · 6 nachten",
    desc: "Historische hoofdstad van Polen met een van de mooiste middeleeuwse pleinen van Europa. Basis voor uitstapjes naar de Wieliczka Zoutmijn en Auschwitz. Betalen met PLN.",
  }),
  make({
    id: "stop-quedlinburg",
    name: "Quedlinburg",
    emoji: "🇩🇪",
    category: "stop",
    lat: 51.7906, lon: 11.1489,
    stop: "Duitsland · 20–21 aug · 1 nacht",
    desc: "UNESCO-vakwerkstad aan de voet van de Harz, gesticht in de 10e eeuw door de Ottonen. Meer dan 2000 vakwerkhuizen uit acht eeuwen. Perfecte laatste stop voor de rit naar huis.",
  }),

  // ── Dienten – Natuur & wandelen ──────────────────────────────────

  make({
    id: "hochkonig-summit",
    name: "Hochkönig (2941m)",
    emoji: "⛰️",
    category: "nature",
    lat: 47.4203, lon: 13.0593,
    stop: "Dienten",
    desc: "Het hoogste punt van de Berchtesgadener Alpen. Te bereiken via meerdaagse trekkingpaden of gondel + wandeling. Panoramisch uitzicht over Salzburg en de Alpen.",
  }),
  make({
    id: "prinzensee",
    name: "Prinzensee (Bergmeer)",
    emoji: "🏔️",
    category: "nature",
    lat: 47.4629, lon: 13.1345,
    stop: "Dienten",
    desc: "Schilderachtig Alpenmeer bereikbaar met de Natrun-gondel vanaf Dienten + korte wandeling. Rustpunt met uitzicht op de omliggende pieken. Ideaal voor picknick.",
  }),
  make({
    id: "triefen-waterfall",
    name: "Triefen Waterval",
    emoji: "💧",
    category: "nature",
    lat: 47.4550, lon: 13.1150,
    stop: "Dienten",
    desc: "Spectaculaire waterval omgeven door Alpenbossen, bereikbaar via een wandelpad vanuit Dienten. Beschermd natuurmonument. Breng goede schoenen mee.",
  }),
  make({
    id: "karbachalmbahn",
    name: "Karbachalmbahn Gondel",
    emoji: "🚡",
    category: "nature",
    lat: 47.4539, lon: 13.1254,
    stop: "Dienten",
    desc: "Gondel vanaf Mühlbach am Hochkönig naar boven. Boven liggen Alpine weiden, een houten kugelracebaan (langste van de Alpen) en meerdere berghutten voor maaltijden.",
  }),

  // ── Kutná Hora – Bezienswaardigheden ─────────────────────────────

  make({
    id: "sedlec-ossuary",
    name: "Beenderkerk (Sedlec Ossarium)",
    emoji: "💀",
    category: "sight",
    lat: 49.9622, lon: 15.2813,
    stop: "Kutná Hora",
    desc: "Unieke kapel versierd met de botten van meer dan 40.000 mensen, inclusief een beroemde kroonluchter van schedels. UNESCO-erfgoed. Niet voor de schrikachtigen — absoluut de moeite waard!",
  }),
  make({
    id: "st-barbara",
    name: "St.-Barbarakathedraal",
    emoji: "⛪",
    category: "sight",
    lat: 49.9444, lon: 15.2654,
    stop: "Kutná Hora",
    desc: "Iconische gotische kathedraal gewijd aan de beschermheilige van mijnwerkers, gebouwd in 1388. Schitterende gewelfschilderingen en een uitzichttoren met panorama over de stad.",
  }),
  make({
    id: "italian-court",
    name: "Italiaans Hof (Vlašský dvůr)",
    emoji: "🏛️",
    category: "sight",
    lat: 49.9490, lon: 15.2622,
    stop: "Kutná Hora",
    desc: "Voormalige koninklijke munt waar de Praagse groschen geslagen werden — ooit de belangrijkste munt van Centraal-Europa. Rondleidingen beschikbaar, inclusief je eigen munt slaan.",
  }),
  make({
    id: "silver-mines",
    name: "Middeleeuwse Zilvermijnen",
    emoji: "⛏️",
    category: "sight",
    lat: 49.9456, lon: 15.2688,
    stop: "Kutná Hora",
    desc: "Ondergrondse rondleiding door het tunnelstelsel van het Hrádek-complex. Leer over de erbarmelijke omstandigheden van 14e-eeuwse mijnwerkers. Verplichte mijnwerkerskleding inbegrepen.",
  }),

  // ── Kraków – Bezienswaardigheden ──────────────────────────────────

  make({
    id: "wawel-castle",
    name: "Wawel Kasteel & Kathedraal",
    emoji: "🏰",
    category: "sight",
    lat: 50.0542, lon: 19.9354,
    stop: "Kraków",
    desc: "Zetel van de Poolse koningen, hoog boven de Wisła. Het 16e-eeuwse Renaissance-paleis, de gotische kathedraal en de koninklijke crypte zijn verplichte kost. Boek tickets online van tevoren!",
  }),
  make({
    id: "rynek-glowny",
    name: "Rynek Główny (Marktplein)",
    emoji: "🏟️",
    category: "sight",
    lat: 50.0618, lon: 19.9368,
    stop: "Kraków",
    desc: "Het grootste middeleeuwse marktplein van Europa (10 hectare), omgeven door kleurrijke gevels. Centraal staat de 16e-eeuwse Renaissance Lakenhal (Sukiennice). Levendig dag en nacht.",
  }),
  make({
    id: "st-mary-basilica",
    name: "St.-Mariakerk (Mariacki)",
    emoji: "⛪",
    category: "sight",
    lat: 50.0617, lon: 19.9389,
    stop: "Kraków",
    desc: "Gotische basiliek aan het Marktplein met een van de spectaculairste interieurs van Europa. Elk uur speelt de trompetter het Hejnał-signaal vanuit de toren. Schilderijen van Jan Matejko.",
  }),
  make({
    id: "kazimierz",
    name: "Kazimierz (Joods kwartier)",
    emoji: "🕍",
    category: "sight",
    lat: 50.0498, lon: 19.9436,
    stop: "Kraków",
    desc: "Historisch Joods kwartier met synagogen uit de 15e eeuw, Schindler's apotheek, hipster cafés en nachtleven. Levend verleden en modern Kraków tegelijk. Flaneren en eten hier.",
  }),
  make({
    id: "schindlers-factory",
    name: "Schindler's Fabriek (Museum)",
    emoji: "🏭",
    category: "sight",
    lat: 50.0487, lon: 19.9445,
    stop: "Kraków",
    desc: "Indrukwekkend WWII-museum in de voormalige geëmailleerde fabriek van Oskar Schindler. Interactieve tentoonstelling over de Joodse bezetting van Kraków 1939–1945. Boek tickets ruim van tevoren.",
  }),
  make({
    id: "rynek-underground",
    name: "Ondergronds Museum Rynek",
    emoji: "🏺",
    category: "sight",
    lat: 50.0618, lon: 19.9366,
    stop: "Kraków",
    desc: "Ondergronds museum direct onder het Marktplein met middeleeuwse funderingen en interactieve tijdlijn. Toont hoe het Kraków van de 10e–13e eeuw eruitzag.",
  }),

  // ── Kraków – Daguitstappen ────────────────────────────────────────

  make({
    id: "wieliczka",
    name: "Wieliczka Zoutmijn",
    emoji: "🧂",
    category: "daytrip",
    lat: 49.9839, lon: 20.0543,
    stop: "Daguitstap vanuit Kraków · ~30 min",
    desc: "UNESCO-ondergronds labyrint van gangen en zalen op 9 niveaus. Highlights: kapellen volledig uitgehouwen in zout, een ondergronds meer en immense zalen. Bus 304 of tour. Niet te missen!",
  }),
  make({
    id: "auschwitz",
    name: "Auschwitz-Birkenau",
    emoji: "🕯️",
    category: "daytrip",
    lat: 50.0268, lon: 19.2036,
    stop: "Daguitstap vanuit Kraków · ~1.5u",
    desc: "UNESCO-herdenkingssite en museum. Reserveer geleid bezoek ruim van tevoren — individueel bezoek is beperkt. Emotioneel en essentieel. Reken op minstens 3 uur voor beide kampen.",
  }),

  // ── Quedlinburg – Bezienswaardigheden ────────────────────────────

  make({
    id: "st-servatius",
    name: "Stiftskerk St. Servaas & Kasteel",
    emoji: "⛪",
    category: "sight",
    lat: 51.7909, lon: 11.1477,
    stop: "Quedlinburg",
    desc: "Romaanse stiftskerk uit de 10e eeuw, kroonjuweel van de UNESCO-site. Bevat de crypte met de graven van de Ottoonse koningen. Kasteel naast de kerk is ook vrij te betreden.",
  }),
  make({
    id: "quedlinburg-altstadt",
    name: "Vakwerkstad (Altstadt)",
    emoji: "🏡",
    category: "sight",
    lat: 51.7898, lon: 11.1483,
    stop: "Quedlinburg",
    desc: "Meer dan 2000 vakwerkhuizen uit acht eeuwen, waarvan velen perfect gerestaureerd. De Finkenherd en Marktplatz met 13e-eeuws stadhuis zijn het mooiste. Flaneren en fotograferen.",
  }),
  make({
    id: "harz-bode",
    name: "Bodetal (Harz natuur)",
    emoji: "🌲",
    category: "nature",
    lat: 51.7254, lon: 10.9580,
    stop: "Daguitstap vanuit Quedlinburg · ~45 min",
    desc: "Indrukwekkende kloof door de Harz met de rivier de Bode. Wandelpad langs rotswanden, uitkijkpunten en de bekende Teufelsmauer (Duivelsmuur). Prachtige natuur aan het einde van de trip.",
  }),

  // ── Kraków – Daguitstappen (extra) ───────────────────────────────

  make({
    id: "nowa-huta",
    name: "Nowa Huta (Sovjet wijk)",
    emoji: "🏙️",
    category: "daytrip",
    lat: 50.0693, lon: 20.0364,
    stop: "Daguitstap vanuit Kraków · tram 4/15 (~25 min)",
    desc: "Stalin-era modelbouwplaats uit 1949 met grote boulevards, arbeiderswijk en een uniek plein. Contrast met het historische centrum van Kraków. Tram 4 of 15 vanuit de stad. Sovjet-kitsch te koop als souvenir.",
  }),

  // ── Kutná Hora – Daguitstap ───────────────────────────────────────

  make({
    id: "stop-praha-daytrip",
    name: "Praag (dagtrip vanuit KH)",
    emoji: "🏰",
    category: "daytrip",
    lat: 50.0755, lon: 14.4378,
    stop: "Daguitstap vanuit Kutná Hora · ~70 km · ~45 min",
    desc: "Karelsbrug, Oude Stad (Staré Město), Praagse burcht en Josefov (Joods kwartier). Vanuit Kutná Hora is het maar 70 km. Parkeren buiten het centrum en metro/tram naar binnenstad. Druk in augustus — vroeg vertrekken.",
  }),

  // ── Wrocław – Korte stop op terugweg ─────────────────────────────

  make({
    id: "wroclaw-stop",
    name: "Wrocław (Rynek & kabouters)",
    emoji: "🏛️",
    category: "sight",
    lat: 51.1079, lon: 17.0385,
    stop: "Korte stop dag 11 · op de route PL→DE",
    desc: "Mooiste stad van Silezië: kleurrijke gevels rondom het grote Rynek, gotische kathedraaleilanden in de Oder en het beroemde Gnomy-project — meer dan 350 kleine kabouter-beeldjes verstopt door de hele stad. Perfecte 30-min stretch op de lange rit naar Quedlinburg.",
  }),

  // ── Eten & drinken ────────────────────────────────────────────────

  make({
    id: "food-krakow-kazimierz",
    name: "Kazimierz restaurantbuurt",
    emoji: "🍽️",
    category: "food",
    lat: 50.0500, lon: 19.9430,
    stop: "Kraków",
    desc: "Leukste eetbuurt van Kraków: authentieke Poolse keuken (pierogi, bigos, żurek) én internationale opties. Plafita Street, Szeroka Street en de omgeving zijn het centrum hiervan.",
  }),
  make({
    id: "food-kutna-coffee",
    name: "Staré Město Kutná Hora",
    emoji: "☕",
    category: "food",
    lat: 49.9488, lon: 15.2670,
    stop: "Kutná Hora",
    desc: "Kleine maar levendige centrum van Kutná Hora met koffietentjes, pizzazaken en terrasjes. Paleček en de omgeving van de Palackého náměstí zijn het meest bezocht.",
  }),
];

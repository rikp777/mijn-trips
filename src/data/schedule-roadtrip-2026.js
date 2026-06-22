// Day-by-day schedule for the Europa Roadtrip, 10–21 augustus 2026.
// NL → AT (Dienten) → CZ (Kutná Hora) → PL (Kraków ×6) → DE (Quedlinburg) → NL
//
// Each slot links to a locationId in locations-roadtrip-2026.js where relevant.

export const scheduleTypeColor = {
  travel:  "#94A3B8",
  food:    "#10B981",
  sight:   "#F59E0B",
  nature:  "#34D399",
  free:    "#8B5CF6",
  rest:    "#6366F1",
  evening: "#EC4899",
};

const s = (id, time, emoji, title, desc, type, locationId = null) => ({
  id, time, emoji, title, desc, type, locationId,
});

export const days = [

  // ── Dag 1 — Ma 10 aug: Vertrekdag ───────────────────────────────
  {
    id: "rt-day0",
    date: "2026-08-10",
    short: "Ma 10/8",
    title: "Vertrekdag",
    emoji: "🚗",
    note: "~1.380 km · ~13u rijden. De langste rit van de trip. Vroeg vertrekken! Navigeer via A2 → A3 Keulen → A5 Frankfurt → A8 München → A10 Tauernautobahn → Dienten.",
    slots: [
      s("rt-d0s1", "06:00", "🚗", "Vertrek Panningen", "Auto vol geladen, banden gecheckt en koffie voor onderweg. Op naar Oostenrijk!", "travel", "home"),
      s("rt-d0s2", "07:30", "⛽", "Eerste tankstop — Venlo (DE)", "Direct over de grens bijvullen. Duits benzine is ~20-25 ct/L goedkoper dan NL. Vol tanken!", "travel", "rt-stop-venlo"),
      s("rt-d0s3", "09:30", "🌉", "Keulen (A1/A3 knoop)", "Stretch stop bij Keulen. Nog ~900 km te gaan.", "travel"),
      s("rt-d0s4", "12:00", "⛽", "München — lunch + tanken!", "Laatste goedkope DE benzine voor Oostenrijk. Vul de tank HELEMAAL VOL. Lunch in de buurt van de snelweg.", "food", "rt-stop-muenchen"),
      s("rt-d0s5", "14:00", "🛂", "Grens DE/AT — vignette!", "Tauernautobahn: let op vignetcontrole. Kosten: ~9€ voor 10 dagen. Plakker op de voorruit.", "travel"),
      s("rt-d0s6", "15:30", "🇦🇹", "Aankomst Dienten am Hochkönig", "Check-in en auto uitladen. De Hochkönig (2941m) is al zichtbaar vanuit het dorp. Welkom in de Alpen!", "travel", "stop-dienten"),
      s("rt-d0s7", "17:00", "🏘️", "Dorp verkennen", "Wandel door de Hauptstraße, zoek de beste wandelroute voor morgen uit en huur eventueel wandelschoenen.", "free", "stop-dienten"),
      s("rt-d0s8", "19:30", "🍽️", "Avondeten — lokale Gasthof", "Traditioneel Oostenrijks diner: Wiener Schnitzel, Tiroler Knödel of Käsespätzle.", "evening", "stop-dienten"),
    ],
  },

  // ── Dag 2 — Di 11 aug: Dienten — Alpenbeleving ──────────────────
  {
    id: "rt-day1",
    date: "2026-08-11",
    short: "Di 11/8",
    title: "Alpendag",
    emoji: "⛰️",
    note: "Hele dag in de bergen. De Karbachalmbahn gondel vertrekt vanuit Mühlbach am Hochkönig (5 min rijden van Dienten). Trek stevige schoenen aan en neem water mee!",
    slots: [
      s("rt-d1s1", "08:00", "🍳", "Ontbijt", "Uitgebreid Alpensontbijt met lokale kaas, roggebrood en berglucht.", "food", "stop-dienten"),
      s("rt-d1s2", "09:30", "🚡", "Karbachalmbahn gondel", "Gondel omhoog naar de Alpine weiden. Boven: houten kugelracebaan (langste van de Alpen!), berghutten en wandelpaden.", "nature", "karbachalmbahn"),
      s("rt-d1s3", "10:30", "⛰️", "Wandeling richting Hochkönig", "Panoramaroute met uitzicht over Salzburg, de Berchtesgadener Alpen en het Steinernes Meer. ~2u heen-terug.", "nature", "hochkonig-summit"),
      s("rt-d1s4", "13:00", "🏠", "Lunch in berghut", "Authentieke Almenküche boven. Probeer Kaiserschmarrn of Brettljause.", "food", "karbachalmbahn"),
      s("rt-d1s5", "15:00", "🏔️", "Prinzensee bergmeer", "Schilderachtig Alpenmeer, bereikbaar via korte wandeling vanuit de gondelbovenkant. Ideaal voor een picknick.", "nature", "prinzensee"),
      s("rt-d1s6", "16:30", "💧", "Triefen Waterval", "Spectaculaire waterval langs het wandelpad terug naar Dienten. Verkoeling gegarandeerd.", "nature", "triefen-waterfall"),
      s("rt-d1s7", "18:30", "🛁", "Terug in Dienten — rusten", "Douchen, uitrusten en de spieren bijkomen. Morgen vroeg vertrek naar Tsjechië.", "rest", "stop-dienten"),
      s("rt-d1s8", "20:00", "🍺", "Heuriger — Tyrols avond", "Traditionele Oostenrijkse Heuriger (wijnkroeg) met geöffnete wijn, kaasplank en live accordeonmuziek.", "evening", "stop-dienten"),
    ],
  },

  // ── Dag 3 — Wo 12 aug: Dienten → Kutná Hora ─────────────────────
  {
    id: "rt-day2",
    date: "2026-08-12",
    short: "Wo 12/8",
    title: "Dienten → KH",
    emoji: "🚗",
    note: "~400 km · ~4.5u rijden. Via Linz, Passau (grens AT/DE en dan DE/CZ) en Plzeň naar Kutná Hora. Tsjechische benzine is ~15% goedkoper dan Duits — bijvullen in Plzeň!",
    slots: [
      s("rt-d2s1", "08:00", "🍳", "Ontbijt + check-out", "Laatste ontbijt in de Alpen. Koffers inpakken en auto laden.", "food", "stop-dienten"),
      s("rt-d2s2", "09:00", "🚗", "Vertrek richting Linz", "Via Salzburg → Linz over de A1/A8. Mooie Donauvallei.", "travel"),
      s("rt-d2s3", "10:30", "🌉", "Linz (Donau)", "Korte stretch stop bij de Donau brug in Linz. Nog ~300 km te gaan.", "free"),
      s("rt-d2s4", "11:30", "🛂", "Passau — grens AT/DE en DE/CZ", "Twee grenzen kort na elkaar. Bij Passau de Donau over, dan richting Tsjechië via de A3.", "travel"),
      s("rt-d2s5", "12:30", "⛽", "Plzeň — lunch + tanken!", "Tsjechische benzine is ~15% goedkoper. Pilsner Urquell Museum is hier als je tijd hebt. Vol tanken!", "food", "rt-stop-plzen"),
      s("rt-d2s6", "14:15", "🚗", "Laatste stuk naar Kutná Hora", "~90 km via D5 → D1 richting Praha, dan afslag Kutná Hora.", "travel"),
      s("rt-d2s7", "15:30", "🇨🇿", "Aankomst Kutná Hora", "Check-in. De Sedlec Ossarium is op 3 km van het centrum — perfect voor een eerste bezoek.", "travel", "stop-kutna"),
      s("rt-d2s8", "16:30", "💀", "Eerste bezoek: Beenderkerk", "Sedlec Ossarium inwijken voor de drukte van morgen. Een kapel volledig versierd met 40.000 botten.", "sight", "sedlec-ossuary"),
      s("rt-d2s9", "19:00", "☕", "Avondeten centrum", "Restaurants rondom de Palackého náměstí. Probeer svíčková (rundvlees met room) of svítidla soup.", "evening", "food-kutna-coffee"),
    ],
  },

  // ── Dag 4 — Do 13 aug: Kutná Hora ────────────────────────────────
  {
    id: "rt-day3",
    date: "2026-08-13",
    short: "Do 13/8",
    title: "Kutná Hora",
    emoji: "💀",
    note: "Volledige dag in de UNESCO-zilverstad. Begin vroeg bij de Beenderkerk (minder druk) en werk je door alle highlights heen. Optioneel: dagtripje naar Praag (~70 km, ~45 min).",
    slots: [
      s("rt-d3s1", "09:00", "💀", "Sedlec Ossarium (vroeg!)", "De Beenderkerk is 's ochtends vroeg het rustigst. Kroonluchter van schedels, botten van 40.000 mensen — unieks.", "sight", "sedlec-ossuary"),
      s("rt-d3s2", "10:30", "⛪", "St.-Barbarakathedraal", "Iconische gotische kathedraal (1388). Beklim de toren voor panorama over de stad en omliggende heuvels.", "sight", "st-barbara"),
      s("rt-d3s3", "12:00", "🏛️", "Italiaans Hof — munt slaan", "Voormalige koninklijke munt. Rondleiding + je eigen Praagse groschen slaan. Unieke herinnering.", "sight", "italian-court"),
      s("rt-d3s4", "13:30", "☕", "Lunch Staré Město", "Lunch in het historisch centrum — rustig terras, goed koffie en local food.", "food", "food-kutna-coffee"),
      s("rt-d3s5", "15:00", "⛏️", "Middeleeuwse Zilvermijnen", "Ondergrondse rondleiding in mijnwerkerskleding door het 14e-eeuwse tunnelstelsel. Boeien en verplichte helm.", "sight", "silver-mines"),
      s("rt-d3s6", "17:00", "🚗", "Optioneel: Praag dagtrip", "~70 km heen. Karelsbrug, Oude Stad, Praagse burcht. Terug voor avonden in KH. Of: rustdag in het centrum.", "free", "stop-praha-daytrip"),
      s("rt-d3s7", "20:00", "🍽️", "Avondeten + afscheid KH", "Morgen vroeg vertrek naar Polen. Lekker uitgebreid avondeten in de Staré Město.", "evening", "food-kutna-coffee"),
    ],
  },

  // ── Dag 5 — Vr 14 aug: Kutná Hora → Kraków ───────────────────────
  {
    id: "rt-day4",
    date: "2026-08-14",
    short: "Vr 14/8",
    title: "KH → Kraków",
    emoji: "🚗",
    note: "~420 km · ~4.5u rijden. Via Brno, Ostrava (grens CZ/PL) en Katowice. Let op: in Tsjechië geldt nultolerantie voor alcohol. Poolse benzine is nog goedkoper — bijvullen in Kraków.",
    slots: [
      s("rt-d4s1", "08:00", "🍳", "Ontbijt + check-out", "Vroeg ontbijt en koffers inpakken. Check-out Kutná Hora.", "food", "stop-kutna"),
      s("rt-d4s2", "09:00", "🚗", "Vertrek via Brno", "D1/E65 richting Brno (~200 km). Rijden door Moravisch heuvelland.", "travel"),
      s("rt-d4s3", "11:00", "☕", "Brno — koffie stop", "Tweede stad van Tsjechië. Vila Tugendhat (Mies van der Rohe) als je modernisme kent. Of gewoon koffie.", "free"),
      s("rt-d4s4", "12:00", "🛂", "Grens CZ/PL bij Ostrava", "Grens oversteek. CZK kun je hier nog omwisselen. In Polen betaal je met PLN.", "travel"),
      s("rt-d4s5", "13:00", "🥩", "Katowice — lunchstop", "Industriestad met goede eetgelegenheden langs de snelweg. Probeer żurek (zuurdesemsoep) eerste kennismaking!", "food"),
      s("rt-d4s6", "14:30", "🚗", "Laatste ~100 km naar Kraków", "A4 richting Kraków. Skyline verschijnt aan de horizon.", "travel"),
      s("rt-d4s7", "15:30", "🇵🇱", "Aankomst Kraków", "Check-in. Parkeren: buiten de Ring (Stare Miasto is autoluw). Taxi of tram naar centrum.", "travel", "stop-krakow"),
      s("rt-d4s8", "17:00", "🕍", "Eerste wandeling Kazimierz", "Joods kwartier verkennen: synagogen, street art, hipster cafés en historisch straatwerk.", "sight", "kazimierz"),
      s("rt-d4s9", "20:00", "🥟", "Eerste Poolse diner — pierogi!", "Authentieke pierogi ruskie (aardappel-kaas), bigos of żurek in het Kazimierz kwartier.", "evening", "food-krakow-kazimierz"),
    ],
  },

  // ── Dag 6 — Za 15 aug: Kraków — Historisch Centrum ───────────────
  {
    id: "rt-day5",
    date: "2026-08-15",
    short: "Za 15/8",
    title: "Kraków centrum",
    emoji: "🏰",
    note: "Wawel vroeg in de ochtend bezoeken — kaartjes voor het interieur zijn beperkt en raken op! Boek ONLINE van tevoren via wawel.krakow.pl. Augustus = hoogseizoen = druk.",
    slots: [
      s("rt-d5s1", "09:00", "🏰", "Wawel Kasteel", "Vroeg gaan! Kaartjes zijn gelimiteerd. Kasteel, kathedraal én de koninklijke crypte met graven van de Poolse koningen.", "sight", "wawel-castle"),
      s("rt-d5s2", "11:30", "🏟️", "Rynek Główny — koffie & rondkijken", "Grootste middeleeuwse marktplein van Europa. 16e-eeuwse Lakenhal in het midden. Levendige sfeer.", "sight", "rynek-glowny"),
      s("rt-d5s3", "12:30", "🥪", "Lunch", "Lunch op het plein of in een zijstraat. Obwarzanki (ringbroodjes van straatverkopers) — typisch Kraków!", "food", "food-krakow-kazimierz"),
      s("rt-d5s4", "14:00", "⛪", "St.-Mariakerk (Mariacki)", "Binnenin: spectaculaire gotische muurschilderingen en het houten altaarstuk van Veit Stoss. Elk heel uur: hejnał van de toren.", "sight", "st-mary-basilica"),
      s("rt-d5s5", "15:30", "🏺", "Ondergronds museum Rynek", "3 niveaus onder het marktplein. Interactieve tijdlijn van Kraków 10e–13e eeuw. Bijzonder en klimaatgecontroleerd.", "sight", "rynek-underground"),
      s("rt-d5s6", "18:00", "🕍", "Flaneren Kazimierz", "Beste time om door het Joodse kwartier te dwalen: winkels open, restaurantterrassen gevuld.", "free", "kazimierz"),
      s("rt-d5s7", "20:00", "🍽️", "Avondeten Kazimierz", "Restaurant in de Szeroka Street of Plac Nowy. Probeer gołąbki (koolrolletjes) of oscypek (gerookte schapenkaas).", "evening", "food-krakow-kazimierz"),
    ],
  },

  // ── Dag 7 — Zo 16 aug: Wieliczka Zoutmijn ────────────────────────
  {
    id: "rt-day6",
    date: "2026-08-16",
    short: "Zo 16/8",
    title: "Wieliczka",
    emoji: "🧂",
    note: "Bus 304 vanaf Kraków Centraal naar Wieliczka (~30 min, ~2 PLN). Rondleiding duurt 2.5–3u. NIET missen! In de middag terug voor een relaxte namiddag in de stad.",
    slots: [
      s("rt-d6s1", "09:00", "🚌", "Bus 304 naar Wieliczka", "Vanuit Kraków Centraal Busstaton. Frequentie elke 20 min. Kaartje kopen bij de chauffeur (cash PLN).", "travel", "wieliczka"),
      s("rt-d6s2", "10:00", "🧂", "Wieliczka Zoutmijn rondleiding", "9 niveaus diep. Highlights: Kapel van St. Kinga (volledig uitgehouwen in zout), ondergronds meer en immense zalen. ~3u.", "sight", "wieliczka"),
      s("rt-d6s3", "13:30", "🥙", "Lunch in Wieliczka", "Er zijn restaurants vlakbij de ingang. Of meenemen vanuit Kraków.", "food", "wieliczka"),
      s("rt-d6s4", "14:30", "🚌", "Terug naar Kraków", "Bus 304 terug, dezelfde route.", "travel"),
      s("rt-d6s5", "15:30", "🛍️", "Vrij — souvenirs & markt", "Sukiennice (Lakenhal) bovenverdieping: souvenirmarkt met handgemaakte sieraden, amber en houten kunstwerk.", "free", "rynek-glowny"),
      s("rt-d6s6", "17:30", "🌳", "Wisła rivier wandeling", "Rivier ten zuiden van Wawel. Stadspark langs het water, uitzicht op het kasteel van de andere oever.", "nature"),
      s("rt-d6s7", "20:00", "🥟", "Avondeten — żurek en bigos", "Klassieke Poolse winterkeuken in de zomer: probeer de zure roggebroodsoep żurek en jachtsoep bigos.", "evening", "food-krakow-kazimierz"),
    ],
  },

  // ── Dag 8 — Ma 17 aug: Schindler + Nowa Huta ─────────────────────
  {
    id: "rt-day7",
    date: "2026-08-17",
    short: "Ma 17/8",
    title: "WWII & Communisme",
    emoji: "🏭",
    note: "Schindler's Fabriek is het beste WWII-museum in Kraków. Boek tickets RUIM van tevoren via mhk.pl — loopt altijd snel vol. Nowa Huta 's middags is een verrassend interessante Sovjet-stadswijk.",
    slots: [
      s("rt-d7s1", "09:30", "🏭", "Schindler's Fabriek Museum", "Interactief museum in de echte fabriek van Oskar Schindler. Bezetting van Kraków 1939–1945. Emotioneel en goed gemaakt. Boek vooraf!", "sight", "schindlers-factory"),
      s("rt-d7s2", "12:00", "🕍", "Kazimierz — Joodse erfenis", "Stara Synagoga (oudste in Polen), Remuh begraafplaats en het WWII-verhaal verder laten bezinken.", "sight", "kazimierz"),
      s("rt-d7s3", "13:30", "🥙", "Lunch Kazimierz", "Traditioneel Joods-Pools restaurant of modern eetcafé in het kwartier.", "food", "food-krakow-kazimierz"),
      s("rt-d7s4", "14:30", "🏙️", "Nowa Huta — Sovjet stadsplan", "Tram 4 of 15 (25 min). Stalin-era modelbouwplaats met enorme boulevards, arbeiderswijk en iconisch plein. Verrassend fascinerend.", "sight", "nowa-huta"),
      s("rt-d7s5", "17:30", "🚋", "Terug naar centrum", "Tram terug. Nowa Huta souvenir: Sovjet-badges of communistische kitsch.", "travel"),
      s("rt-d7s6", "19:00", "🍺", "Avondborrel Kazimierz", "Beste uitgangsbuurt van Kraków. Jazzbar, bruine kroeg of cocktailbar naar keuze.", "evening", "kazimierz"),
      s("rt-d7s7", "21:00", "🌙", "Avondwandeling Marktplein", "Het Rynek by night is bijzonder: verlicht, muzikanten, toeristen van overal. Ijsje kopen en genieten.", "free", "rynek-glowny"),
    ],
  },

  // ── Dag 9 — Di 18 aug: Vrije dag Kraków ──────────────────────────
  {
    id: "rt-day8",
    date: "2026-08-18",
    short: "Di 18/8",
    title: "Vrije dag",
    emoji: "🏙️",
    note: "Inhaaltijd voor alles wat je nog wilt zien. Dinsdag is er een grote markt op het Plac Nowy in Kazimierz (ochtend). Perfecte dag voor lamlendige koffie, boekwinkels en wandelen.",
    slots: [
      s("rt-d8s1", "09:00", "🛒", "Markt Plac Nowy (Kazimierz)", "Dinsdag ochtendmarkt: tweedehands kleding, vinyl, streekproducten. Hét lokale marktje van Kraków.", "free", "kazimierz"),
      s("rt-d8s2", "11:00", "☕", "Koffie & boekenkwartier", "Tralala Cafe of Massolit Books (de beste boekenwinkel-café van Kraków). Ontspannen ochtend.", "rest", "food-krakow-kazimierz"),
      s("rt-d8s3", "13:00", "🥙", "Lunch — eigen keuze", "Nog iets niet geprobeerd? Barszcz (rode bietensoep), kopytka (aardappelknoedels) of zapiekanka (Poolse pizza-baguette).", "food", "food-krakow-kazimierz"),
      s("rt-d8s4", "14:30", "🏛️", "Nationaal Museum of Galicia Museum", "Galicia Jüdisches Museum (Kazimierz) als alternatief voor Schindler. Of het Nationaal Museum op het Matejkoplein.", "sight", "schindlers-factory"),
      s("rt-d8s5", "17:00", "🌊", "Wisła fietsen of wandelen", "Fietsen langs de rivier richting Bielany of Tyniecki klooster (~12 km heen). Fiets te huur via Wavelo-stations.", "nature"),
      s("rt-d8s6", "20:00", "🎶", "Jazzavond Kazimierz", "Harris Piano Jazz Bar of Alchemia: live jazz, goed bier en de sfeer van het beroemde Kraków Jazz Festival.", "evening", "kazimierz"),
    ],
  },

  // ── Dag 10 — Wo 19 aug: Auschwitz-Birkenau ───────────────────────
  {
    id: "rt-day9",
    date: "2026-08-19",
    short: "Wo 19/8",
    title: "Auschwitz",
    emoji: "🕯️",
    note: "Vroeg vertrekken — individueel bezoek aan Auschwitz I is beperkt na 10:00. Boek een geleid bezoek via auschwitz.org (VERPLICHT in augustus). Reken minimaal 3.5u voor beide kampen. Emotionele maar essentiële dag.",
    slots: [
      s("rt-d9s1", "07:30", "🚗", "Vroeg vertrek naar Auschwitz", "~1.5u rijden vanuit Kraków. Parkeren bij het museum (betaald). Reservering checken.", "travel", "auschwitz"),
      s("rt-d9s2", "09:00", "🕯️", "Auschwitz I — geleid bezoek", "Geleide rondleiding door het kamp. Baraken, appelplaats, Blok 11 en de beruchte gasingang. Spreek zacht.", "sight", "auschwitz"),
      s("rt-d9s3", "11:30", "🚌", "Shuttle naar Birkenau", "Gratis shuttle (3 km) of lopen. Het uitgestrekte Birkenau-kamp geeft de schaal van de genocide echt weer.", "travel", "auschwitz"),
      s("rt-d9s4", "12:00", "🕯️", "Birkenau (Auschwitz II)", "Eigen rondleiding door de grote vernietigingsplaats. Monument, ruïnes van de crematoria en de spoorlijn.", "sight", "auschwitz"),
      s("rt-d9s5", "14:30", "🚗", "Terug naar Kraków", "Rijden in stilte. De dag even laten bezinken.", "travel"),
      s("rt-d9s6", "17:00", "🛁", "Rust en reflectie", "Douchen, rusten. Schrijf je indrukken op in de dagnotitie — deze dag vergeet je niet snel.", "rest", "stop-krakow"),
      s("rt-d9s7", "19:30", "🍽️", "Rustig avondeten", "Simpel, goed eten. Geen toeristisch restaurant vanavond — kleine zaak in Kazimierz.", "evening", "food-krakow-kazimierz"),
    ],
  },

  // ── Dag 11 — Do 20 aug: Kraków → Quedlinburg ─────────────────────
  {
    id: "rt-day10",
    date: "2026-08-20",
    short: "Do 20/8",
    title: "Kraków → QDB",
    emoji: "🚗",
    note: "~970 km · ~9u rijden. De op een na langste rit. Vroeg vertrekken! Tanken in Kraków (laatste goedkope Poolse benzine). Wrocław is een korte stop waard. Quedlinburg is klein — aankomst vóór donker.",
    slots: [
      s("rt-d10s1", "07:00", "🚗", "Vroeg vertrek Kraków", "Koffers ingepakt en op weg. Wrocław-route: A4 westwaarts.", "travel", "stop-krakow"),
      s("rt-d10s2", "07:15", "⛽", "Tanken Kraków — laatste PL benzine", "Laatste kans goedkoop Poolse benzine. Vul de tank HELEMAAL VOL. ~1.35-1.40€/L.", "travel", "rt-stop-krakow-fuel"),
      s("rt-d10s3", "09:30", "🏛️", "Wrocław — korte stop (30 min)", "Mooiste stad van Silezië. Parkeer bij de Rynek, zoek de 350+ gnoom-beeldjes (kabouters) en bewonder de gotische kathedraaleilanden.", "sight", "wroclaw-stop"),
      s("rt-d10s4", "11:00", "🛂", "Grens PL/DE bij Görlitz/Zgorzelec", "Oder-Neisse rivier = PL/DE grens. DE tanken op de snelweg (A4 → A4).", "travel"),
      s("rt-d10s5", "12:30", "🌉", "Dresden — lunchstop", "Brug over de Elbe met zicht op de Frauenkirche en het Saksische landschap. Lunch aan de Elbe.", "food"),
      s("rt-d10s6", "14:00", "🏭", "Leipzig — doorreden", "A9 richting Halle/Magdeburg, dan afslagen naar Quedlinburg.", "travel"),
      s("rt-d10s7", "15:30", "🇩🇪", "Aankomst Quedlinburg", "Check-in. Kleine, bijzonder goed bewaarde vakwerkstad. De Stiftsberg met het kasteel is direct zichtbaar.", "travel", "stop-quedlinburg"),
      s("rt-d10s8", "17:00", "🏡", "Eerste verkenning Altstadt", "Wandel door meer dan 2000 vakwerkhuizen — acht eeuwen bouwstijlen op elkaar gestapeld. Ongelooflijk bewaard.", "sight", "quedlinburg-altstadt"),
      s("rt-d10s9", "20:00", "🍽️", "Laatste avondeten vakwerkstad", "Rustig diner in een Quedlinburgs restaurant. Morgen vroeg vertrukken voor het laatste stuk naar huis.", "evening", "stop-quedlinburg"),
    ],
  },

  // ── Dag 12 — Vr 21 aug: Quedlinburg → Thuis ─────────────────────
  {
    id: "rt-day11",
    date: "2026-08-21",
    short: "Vr 21/8",
    title: "Naar huis",
    emoji: "🏠",
    note: "~570 km · ~5.5u rijden. Rustig ochtend — Quedlinburg verdient nog een paar uur. Dan via Hannover → Osnabrück → Grens DE/NL bij Oldenzaal of Enschede → Panningen. Welkom thuis! 🎉",
    slots: [
      s("rt-d11s1", "07:30", "🍳", "Vroeg ontbijt", "Laatste ontbijt. Koffers ingepakt — check-out voor vertrek.", "food", "stop-quedlinburg"),
      s("rt-d11s2", "08:30", "⛪", "St. Servatius kathedraal & kasteel", "Romaanse kathedraal uit de 10e eeuw op de Stiftsberg. Crypte met graven Ottoonse koningen. 30 min.", "sight", "st-servatius"),
      s("rt-d11s3", "09:30", "🏡", "Laatste Altstadt wandeling", "Finkenherd, Marktplatz met 13e-eeuws stadhuis. Souvenirwinkelitje voor specerijen of Harz-honing.", "sight", "quedlinburg-altstadt"),
      s("rt-d11s4", "10:30", "🚗", "Vertrek naar Nederland", "A395 → A36 → A2 richting Hannover → Osnabrück → grens NL. Via A1 naar Limburg.", "travel"),
      s("rt-d11s5", "11:30", "🌲", "Optioneel: Bodetal kloof (Harz)", "~45 min omrijden. Spectaculaire wandelkloof door de Harz met de rivier de Bode. 1u wandeling. Uitzicht Rosstrappe.", "nature", "harz-bode"),
      s("rt-d11s6", "13:00", "🌉", "Hannover — lunchstop", "A2 richting het westen. Lunch bij Hannover. Nog ~350 km en ~3u te gaan.", "food"),
      s("rt-d11s7", "14:30", "🛂", "Grens DE/NL", "Terug op Nederlands grondgebied. Radio op Dutch FM.", "travel"),
      s("rt-d11s8", "17:30", "🏠", "Thuiskomst Panningen!", "12 landen, 4 steden, ~3.300 km. Verhalen voor jaren. Welkom thuis!", "travel", "home"),
    ],
  },

];

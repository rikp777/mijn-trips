// Per-day schedule for the Ripstar kitecamp Denmark, 4–11 juli 2026.
// Camp runs Saturday to Saturday (confirmed via Ripstar website).
// Arrival: za 4/7 (rijdag). Check-out: za 11/7 voor 10:00.
//
// Each slot has an optional locationId that links to a pin in locations.js
// so the day-schedule can navigate to the map tab.

export const scheduleTypeColor = {
  kite:    "#0EA5E9",
  food:    "#10B981",
  free:    "#F59E0B",
  rest:    "#8B5CF6",
  evening: "#6366F1",
  travel:  "#94A3B8",
};

const s = (id, time, emoji, title, desc, type, locationId = null, gear = [], endTime = null) => ({
  id, time, emoji, title, desc, type, locationId, gear, endTime,
});

export const days = [
  // ── Za 4 juli — Rijdag ───────────────────────────────────────────
  {
    id: "day0",
    date: "2026-07-04",
    short: "Za 4/7",
    title: "Rijdag",
    emoji: "🚗",
    note: "~780 km · ca. 8 uur rijden vanuit Utrecht. Navigeer naar: Skavenvej 32, 6880 Tarm, DK. Check bandenspanning voor vertrek!",
    slots: [
      s("d0s1", "07:00", "🚗", "Vertrek Nederland", "Auto laden en op weg! Koffie voor onderweg en bandenspanning gecheckt?", "travel", "home", ["d1", "d2", "a1", "a2", "a4"]),
      s("d0s2", "09:30", "⛽", "Tankstop Duitsland", "Benzine bijvullen richting Hamburg — een stuk goedkoper dan in Denemarken.", "travel", "stop-munster", [], "09:50"),
      s("d0s3", "11:00", "🌉", "Grens Denemarken", "Welkom in DK bij Kruså/Flensburg. Tijdzone is gelijk. Let op nieuwe snelheidslimieten!", "travel", "stop-flensburg", [], "11:10"),
      s("d0s4", "12:30", "🍔", "Lunch stop — Jutland", "Pauzeren in Kolding of Vejle. Nog ~130 km en ~1,5 uur rijden.", "food", "stop-lunch", [], "13:30"),
      s("d0s5", "15:30", "🏕️", "Aankomst kamp!", "Check-in bij Skaven Strand Camping. Lodge of tipi zoeken en uitpakken.", "travel", "camp"),
      s("d0s6", "17:00", "🚶", "Kamp verkennen", "Bar, sauna, fjord-strand, sanitair bekijken en alvast kennismaken met medekiters.", "free", "camp"),
      s("d0s7", "19:00", "🍽️", "Welkomstdiner", "Eerste 3-gangen diner met de hele groep. Even bijkomen en kennismaken!", "food", "camp"),
      s("d0s8", "21:00", "🔥", "Vuurplaats & borrel", "Eerste avond bij het kampvuur onder de Deense sterren. Genieten.", "evening", "camp"),
    ],
  },

  // ── Zo 5 juli — Introductie ──────────────────────────────────────
  {
    id: "day1",
    date: "2026-07-05",
    short: "Zo 5/7",
    title: "Introductie",
    emoji: "💨",
    note: "Eerste echte kitedag! Focus op veiligheid en kite control op het land. Nog geen water in vandaag.",
    slots: [
      s("d1s1", "08:00", "🍳", "Ontbijt", "Uitgebreid ontbijt aan de bar. Check de wind-widget voor de voorspelling vandaag!", "food", "camp"),
      s("d1s2", "09:30", "📋", "Kick-off briefing", "Groepsintro, programma van de week, veiligheidsregels en materiaaluitleg.", "kite", "camp"),
      s("d1s3", "10:30", "💨", "Kite setup & safety", "Lines uitleggen, safety release oefenen en het windvenster begrijpen.", "kite", "fjord", ["k4", "k5", "k7", "k10", "v1"]),
      s("d1s4", "11:30", "🪁", "Eerste kite in de lucht!", "Land-kite control: sturen, poweren en de powerzone voelen. Dit is het fundament.", "kite", "fjord", ["k3", "k4", "k5", "k13", "s1", "s12"]),
      s("d1s5", "13:00", "🥪", "Lunch", "Bijtanken bij het kamp.", "food", "camp"),
      s("d1s6", "14:00", "🪁", "Middag: kite control", "Turns, depoweren en kite stabiliseren. Bodypositie en bar-gevoel opbouwen.", "kite", "fjord"),
      s("d1s7", "17:00", "🧘", "Yoga of zwembad", "Optionele yoga-sessie of afkoelen in het buitenzwembad.", "rest", "camp"),
      s("d1s8", "19:00", "🍽️", "3-gangen diner", "Avondeten en eerste dag bespreken.", "food", "camp"),
      s("d1s9", "20:30", "📚", "Theorie-avond", "Windvenster, windrichting en kitegedrag. Vragen heel welkom.", "evening", "camp"),
    ],
  },

  // ── Ma 6 juli — Bodydrag ─────────────────────────────────────────
  {
    id: "day2",
    date: "2026-07-06",
    short: "Ma 6/7",
    title: "Bodydrag",
    emoji: "🌊",
    note: "Het water in! Bodydrag is het fundament van kitesurfen — voelen hoe de kite jou trekt.",
    slots: [
      s("d2s1", "08:00", "🍳", "Ontbijt + windcheck", "Samen met de instructeur kijken naar de wind van vandaag.", "food", "camp"),
      s("d2s2", "09:30", "📋", "Briefing", "Plan voor de dag: kite control verfijnen en dan het water in.", "kite", "camp"),
      s("d2s3", "10:00", "🪁", "Sessie 1: kite control", "Kite perfectioneren, bar-handling en relaunch vanuit het water oefenen.", "kite", "fjord"),
      s("d2s4", "12:30", "🥪", "Lunch", "Bijtanken.", "food", "camp"),
      s("d2s5", "13:30", "🌊", "Sessie 2: bodydrag!", "Eerste keer het koude fjordwater in! De kite sleept jou — voelt geweldig.", "kite", "fjord", ["k4", "k5", "k7", "k8", "k11", "w1", "w4", "s1"]),
      s("d2s6", "17:00", "🔥", "Sauna", "Lekker opwarmen na het koude fjordwater. Goed verdiend.", "rest", "camp"),
      s("d2s7", "19:00", "🍽️", "Diner", "Avondeten met de groep.", "food", "camp"),
      s("d2s8", "20:30", "✨", "Borrel & kampvuur", "Relaxen na een drukke dag op het water.", "evening", "camp"),
    ],
  },

  // ── Di 7 juli — Board ────────────────────────────────────────────
  {
    id: "day3",
    date: "2026-07-07",
    short: "Di 7/7",
    title: "Board",
    emoji: "🏄",
    note: "Het board gaat mee het water in! Waterstart oefenen — veel vallen is normaal en hoort erbij.",
    slots: [
      s("d3s1", "08:00", "🍳", "Ontbijt + windcheck", "Windcheck: bepaalt hoe intensief de sessie wordt.", "food", "camp"),
      s("d3s2", "09:30", "📋", "Briefing: waterstart", "Theorie: lichaamspositie, board-feeling en edging uitgelegd.", "kite", "camp"),
      s("d3s3", "10:00", "🌊", "Sessie 1: bodydrag + board", "Board vasthouden tijdens bodydrag, boardgevoel opbouwen.", "kite", "fjord"),
      s("d3s4", "12:30", "🥪", "Lunch", "Bijtanken.", "food", "camp"),
      s("d3s5", "13:30", "🌊", "Sessie 2: waterstart!", "Eerste pogingen om overeind te komen op het board. Veel vallen = veel leren!", "kite", "fjord", ["k4", "k5", "k7", "k8", "k11", "w1", "s6", "s9"]),
      s("d3s6", "17:00", "🧘", "Yoga-sessie", "Optionele yoga voor herstel en balans.", "rest", "camp"),
      s("d3s7", "19:00", "🍽️", "Diner", "Avondeten.", "food", "camp"),
      s("d3s8", "20:30", "🏘️", "Optioneel: avonduitje Ringkøbing", "Gezellig avondtripje naar het stadje — terrasje, ijs en steegjes.", "evening", "ringkobing"),
    ],
  },

  // ── Wo 8 juli — Waterstart ───────────────────────────────────────
  {
    id: "day4",
    date: "2026-07-08",
    short: "Wo 8/7",
    title: "Waterstart",
    emoji: "🚀",
    note: "Dé dag om je eerste meters te rijden. Lukt de waterstart? Dan vlieg je écht! 🎉 Bij weinig wind: uitje naar het kabelpark.",
    slots: [
      s("d4s1", "08:00", "🍳", "Ontbijt + windcheck", "Goede wind: volle bak lessen. Weinig wind: leuk uitje gepland.", "food", "camp"),
      s("d4s2", "09:30", "📋", "Briefing", "Analyse van gisteren. Persoonlijke doelen voor vandaag.", "kite", "camp"),
      s("d4s3", "10:00", "🌊", "Sessie 1: waterstart", "Focus op consistente waterstarts en eerste meters rijden!", "kite", "fjord", ["k4", "k5", "k7", "k8", "k11", "w1", "s6", "s9"]),
      s("d4s4", "12:30", "🥪", "Lunch", "Bijtanken.", "food", "camp"),
      s("d4s5", "13:30", "🏄", "Vrije middag / kabelpark", "SUP, slackline of een uitje naar het kabelpark als afwisseling.", "free", "kabelpark"),
      s("d4s6", "15:30", "🌊", "Sessie 2 (indien wind)", "Extra watersessie als de wind het toelaat.", "kite", "fjord", ["k4", "k5", "k7", "k8", "k11", "w1", "s6"]),
      s("d4s7", "17:30", "🔥", "Sauna", "Goed verdiend!", "rest", "camp"),
      s("d4s8", "19:00", "🍽️", "Diner", "Avondeten.", "food", "camp"),
      s("d4s9", "20:30", "🐟", "Optioneel: Hvide Sande", "Avondwandeling naar het vissersstadtje. Verse vis & friet bij de haven.", "evening", "hvide_sande"),
    ],
  },

  // ── Do 9 juli — Zelfstandig rijden ──────────────────────────────
  {
    id: "day5",
    date: "2026-07-09",
    short: "Do 9/7",
    title: "Zelfstandig rijden",
    emoji: "🪁",
    note: "Consolideren en op eigen tempo verder. Iedereen op zijn eigen niveau, instructeur in de buurt.",
    slots: [
      s("d5s1", "08:00", "🍳", "Ontbijt", "Uitgebreid ontbijt.", "food", "camp"),
      s("d5s2", "09:30", "📋", "Briefing", "Persoonlijke doelen voor vandaag stellen.", "kite", "camp"),
      s("d5s3", "10:00", "🪁", "Sessie 1: free ride", "Zelfstandig rijden of specifieke skills met de instructeur.", "kite", "fjord", ["k4", "k5", "k7", "k10", "w1", "s6", "s9", "s12"]),
      s("d5s4", "12:30", "🥪", "Lunch", "Bijtanken.", "food", "camp"),
      s("d5s5", "13:30", "🌊", "Sessie 2: techniek", "Edging, snelheid controleren, richtingverandering. Voortgang vastleggen.", "kite", "fjord", ["k4", "k5", "k7", "k10", "w1", "s6", "s4"]),
      s("d5s6", "15:30", "⛵", "Optioneel: Bork Havn", "Verken de kitespot in de zuidhoek én de Viking haven — mooie combinatie.", "free", "bork"),
      s("d5s7", "19:00", "🍽️", "Diner", "Avondeten.", "food", "camp"),
      s("d5s8", "20:30", "📚", "Theorie: wind & apps", "Windguru, Windy, Open-Meteo — leer zelf de beste momenten te spotten.", "evening", "camp"),
    ],
  },

  // ── Vr 10 juli — Laatste les dag ────────────────────────────────
  {
    id: "day6",
    date: "2026-07-10",
    short: "Vr 10/7",
    title: "Laatste les dag",
    emoji: "🏆",
    note: "Laatste volledige dag op het water — alles geven! Vanavond afscheidsavond met de groep.",
    slots: [
      s("d6s1", "08:00", "🍳", "Ontbijt", "Uitgebreid ontbijt. Morgen vroeg weg dus geniet van vandaag.", "food", "camp"),
      s("d6s2", "09:30", "📋", "Briefing", "Laatste kans voor begeleide sessies — wat wil je nog oefenen?", "kite", "camp"),
      s("d6s3", "10:00", "🪁", "Sessie 1: laatste les", "Alles geven op het fjord.", "kite", "fjord", ["k4", "k5", "k7", "k10", "k13", "w1", "s6", "s9", "v1"]),
      s("d6s4", "12:30", "🥪", "Lunch", "Bijtanken.", "food", "camp"),
      s("d6s5", "13:30", "🌊", "Sessie 2: free ride", "Geniet van de laatste uren op het water.", "kite", "fjord", ["k4", "k5", "k7", "k10", "w1", "s6", "s4", "s12"]),
      s("d6s6", "16:00", "🧘", "Yoga & sauna", "Afsluiten met een yoga-sessie en de sauna.", "rest", "camp"),
      s("d6s7", "19:00", "🍽️", "Afscheidsavond 🎉", "Speciaal afscheidsdiner. Herinneringen ophalen en namen uitwisselen!", "food", "camp"),
      s("d6s8", "21:00", "🔥", "Laatste kampvuur", "Afscheid van medekiters onder de Deense sterren.", "evening", "camp"),
    ],
  },

  // ── Za 11 juli — Vertrekdag ──────────────────────────────────────
  {
    id: "day7",
    date: "2026-07-11",
    short: "Za 11/7",
    title: "Vertrekdag",
    emoji: "🏠",
    note: "Check-out voor 10:00! Pak alles in en koers op Nederland. ~780 km · ca. 8 uur rijden.",
    slots: [
      s("d7s1", "07:00", "🍳", "Vroeg ontbijt", "Vroeg opstaan voor de terugreis. Snel maar goed ontbijt aan de bar.", "food", "camp"),
      s("d7s2", "08:00", "🧹", "Inpakken & schoonmaken", "Lodge of tipi netjes achterlaten zoals je het aantrof.", "free", "camp"),
      s("d7s3", "09:30", "🏕️", "Check-out voor 10:00", "Sleutel inleveren en laatste groetjes. Foto's maken bij het kamp!", "travel", "camp"),
      s("d7s4", "10:00", "🚗", "Op weg naar Nederland!", "Navigeer richting huis. ~780 km · ca. 8 uur rijden.", "travel", "camp", ["d1", "a1", "a2"]),
      s("d7s5", "12:30", "🍔", "Lunch stop", "Pauzeren en bijtanken ergens in Jutland of Noord-Duitsland.", "food", "stop-lunch"),
      s("d7s6", "14:00", "🌉", "Grens terug", "Terug over de grens richting Nederland via Flensburg.", "travel", "stop-flensburg"),
      s("d7s7", "18:00", "🏠", "Thuiskomst!", "Welkom thuis — met een kitesurf-diploma en een hoofd vol verhalen. 🪁", "travel", "home"),
    ],
  },
];

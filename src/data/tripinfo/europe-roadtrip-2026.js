export const routes = [
  {
    emoji: "🛣️",
    label: "Via Keulen & München",
    tag: "Aanbevolen",
    tagColor: "#34D399",
    lines: ["~1.380 km · ~13u rijden", "A2 → A3 → A8 → A10 Tauernautobahn", "Tol: AT Vignette + Tauernautobahn (~€20)"],
  },
  {
    emoji: "🏨",
    label: "Met stop in München",
    tag: "Comfortabel",
    tagColor: "#F59E0B",
    lines: ["Dag 1: NL → München (~850 km, ~8u)", "Dag 2: München → Dienten (~160 km, ~1.5u)", "Bonus: Neuschwanstein op de route!"],
  },
];

export const internalRoutes = [
  { from: "🇦🇹 Dienten", to: "🇨🇿 Kutná Hora", km: "~640 km", duration: "~6.5u", via: "Salzburg → Linz → Passau → Plzeň" },
  { from: "🇨🇿 Kutná Hora", to: "🇵🇱 Kraków", km: "~370 km", duration: "~4u", via: "Ostrava → grens PL" },
  { from: "🇵🇱 Kraków", to: "🇩🇪 Quedlinburg", km: "~780 km", duration: "~8u", via: "Wrocław → Dresden → Leipzig" },
  { from: "🇩🇪 Quedlinburg", to: "🇳🇱 Thuis", km: "~570 km", duration: "~5.5u", via: "Hannover → A2 → NL" },
];

export const mapsUrl = "https://maps.google.com/?daddr=47.4753,13.1497";

export const emergencyItems = [
  { emoji: "🚨", label: "Europees alarm (alle landen)", value: "112", href: "tel:112", bold: true },
  { emoji: "👮", label: "Politie Oostenrijk", value: "133", href: "tel:133" },
  { emoji: "👮", label: "Politie Tsjechië", value: "158", href: "tel:158" },
  { emoji: "👮", label: "Politie Polen", value: "997", href: "tel:997" },
  { emoji: "👮", label: "Politie Duitsland", value: "110", href: "tel:110" },
  { emoji: "🏥", label: "Ambulance Oostenrijk", value: "144", href: "tel:144" },
  { emoji: "🏥", label: "Ambulance Tsjechië", value: "155", href: "tel:155" },
  { emoji: "🏥", label: "Ambulance Polen", value: "999", href: "tel:999" },
  { emoji: "🏥", label: "Ambulance Duitsland", value: "112", href: "tel:112" },
  { emoji: "📞", label: "Alarmcentrale reisverzekering", value: "Staat op je polis", href: null },
];

export const phraseSections = [
  {
    flag: "🇩🇪🇦🇹",
    language: "Duits (AT & DE)",
    color: "#F59E0B",
    phrases: [
      { nl: "Hallo / Hoi",          target: "Hallo / Hej",                 uit: "Hallo / Hey" },
      { nl: "Dank je wel",          target: "Danke schön",                  uit: "Dankuh shurn" },
      { nl: "Alsjeblieft",          target: "Bitte",                        uit: "Bittuh" },
      { nl: "Sorry",                target: "Entschuldigung",               uit: "Entshuldigoong" },
      { nl: "Hoeveel kost dit?",    target: "Was kostet das?",              uit: "Vas kostet das" },
      { nl: "Kan ik pinnen?",       target: "Kann ich mit Karte zahlen?",   uit: "Kan ick mit Kartuh tsaalen" },
      { nl: "Waar is het toilet?",  target: "Wo ist die Toilette?",         uit: "Vo ist dee Toyletuh" },
      { nl: "Ik ben verdwaald",     target: "Ich habe mich verlaufen",      uit: "Ick haabuh mich ferlaufen" },
      { nl: "Help!",                target: "Hilfe!",                       uit: "Hilfuh!" },
    ],
  },
  {
    flag: "🇨🇿",
    language: "Tsjechisch",
    color: "#0EA5E9",
    phrases: [
      { nl: "Hallo",                target: "Ahoj / Dobrý den",             uit: "Ahoy / Dobree den" },
      { nl: "Dank je",              target: "Děkuji",                       uit: "Dyekuyee" },
      { nl: "Alsjeblieft",          target: "Prosím",                       uit: "Proseem" },
      { nl: "Sorry",                target: "Promiňte",                     uit: "Prominye" },
      { nl: "Hoeveel kost dit?",    target: "Kolik to stojí?",              uit: "Kolik to stoyee" },
      { nl: "Kan ik pinnen?",       target: "Mohu platit kartou?",          uit: "Mohoo platit kartow" },
      { nl: "Waar is het toilet?",  target: "Kde je toaleta?",              uit: "Kdeh ye toaleta" },
      { nl: "Help!",                target: "Pomoc!",                       uit: "Pomots!" },
    ],
  },
  {
    flag: "🇵🇱",
    language: "Pools",
    color: "#EF4444",
    phrases: [
      { nl: "Hallo",                target: "Cześć / Dzień dobry",          uit: "Cheshch / Djen dobry" },
      { nl: "Dank je",              target: "Dziękuję",                     uit: "Djenkuyeh" },
      { nl: "Alsjeblieft",          target: "Proszę",                       uit: "Prosheh" },
      { nl: "Sorry",                target: "Przepraszam",                  uit: "Pshe-prasharm" },
      { nl: "Hoeveel kost dit?",    target: "Ile to kosztuje?",             uit: "Eeleh to koshtuyeh" },
      { nl: "Kan ik pinnen?",       target: "Czy mogę płacić kartą?",       uit: "Chi mogeh pwacheech kartow" },
      { nl: "Waar is het toilet?",  target: "Gdzie jest toaleta?",          uit: "Gdjeh yest toaleta" },
      { nl: "Help!",                target: "Pomocy!",                      uit: "Pomoci!" },
    ],
  },
];

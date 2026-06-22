const byTrip = {
  "ripstar-dk-2026": [
    { id: "td1",  text: "Ripstar cursusbevestiging opgeslagen / afgedrukt" },
    { id: "td2",  text: "Storebælt brug online betalen — brobizz.com (rijrichting DK)" },
    { id: "td3",  text: "EHIC-kaart (EU zorgpas) + reisverzekering checken" },
    { id: "td4",  text: "Deense kroon opnemen of contactloos betalen testen" },
    { id: "td5",  text: "Offline kaarten downloaden (Google Maps · Ringkøbing area)" },
    { id: "td6",  text: "Windguru of Windy instellen op locatie Hvide Sande" },
    { id: "td7",  text: "GoPro geladen + SD-kaart leeggemaakt" },
    { id: "td8",  text: "Iemand thuis op de hoogte gesteld van route + aankomst" },
    { id: "td9",  text: "Auto gecheckt: olie, koelvloeistof, banden" },
    { id: "td10", text: "Ripstar WhatsApp-groep of contactpersoon in de mail opgeslagen" },
  ],

  "europe-roadtrip-2026": [
    { id: "rt1",  text: "Oostenrijks vignette besteld (asfinag.at) of kopen bij grens" },
    { id: "rt2",  text: "EHIC-kaart (EU zorgpas) + reisverzekering checken" },
    { id: "rt3",  text: "Tsjechische kroon + Poolse zloty opnemen" },
    { id: "rt4",  text: "Wawel Kasteel tickets besteld (wawel.krakow.pl — snel vol!)" },
    { id: "rt5",  text: "Auschwitz rondleiding geboekt (auschwitz.org — verplicht reserveren)" },
    { id: "rt6",  text: "Schindler's Fabriek tickets besteld (online)" },
    { id: "rt7",  text: "Wieliczka Zoutmijn tickets besteld (wieliczka-saltmine.com)" },
    { id: "rt8",  text: "Accommodaties voor alle stops bevestigd" },
    { id: "rt9",  text: "Offline kaarten gedownload (AT, CZ, PL, DE)" },
    { id: "rt10", text: "Auto gecheckt: olie, koelvloeistof, banden, gevarendriehoek" },
    { id: "rt11", text: "Iemand thuis op de hoogte van route + aankomsttijden" },
  ],

  "jn-kamp-2026": [
    { id: "jn1", text: "Programma afgerond + gedeeld met mede-leiding" },
    { id: "jn2", text: "Noodcontacten van alle deelnemers verzameld" },
    { id: "jn3", text: "EHBO-koffer gecheckt + aangevuld" },
    { id: "jn4", text: "Activiteitsmaterialen ingepakt en gecontroleerd" },
    { id: "jn5", text: "Kampterrein bevestigd (Paardekopweg 40, Ysselsteyn)" },
    { id: "jn6", text: "Dieetbehoeften / allergieën deelnemers gecheckt" },
    { id: "jn7", text: "Eigen paklijst volledig doorlopen" },
    { id: "jn8", text: "Thuis op de hoogte gesteld van data + contactnummer kamp" },
  ],
};

export function getTodoItems(tripId) {
  return byTrip[tripId] ?? [];
}

// Legacy export for backwards compatibility
export const todoItems = byTrip["ripstar-dk-2026"];

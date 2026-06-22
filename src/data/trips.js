import { categories as dkCategories } from './packing/ripstar-dk-2026';
import { categories as roadtripCategories } from './packing/europe-roadtrip-2026';
import { categories as jnKampCategories } from './packing/jn-kamp-2026';

export const trips = [
  {
    id: "ripstar-dk-2026",
    name: "Ripstar Kitecamp",
    subtitle: "Ringkøbing Fjord, Denemarken",
    emoji: "🪁",
    flag: "🇩🇰",
    activities: ["kite"],
    tabs: ["home", "journal", "pack", "day", "map"],
    lat: 55.892,
    lon: 8.364,
    startDate: "2026-07-04",
    endDate: "2026-07-11",
    windSpotName: "Hvide Sande, DK",
    windLat: 56.0,
    windLon: 8.13,
    packingCategories: dkCategories,
  },

  {
    id: "jn-kamp-2026",
    name: "Jong Nederland Kamp",
    subtitle: "Scouting De Paardekop, Ysselsteyn",
    emoji: "⛺",
    flag: "🇳🇱",
    activities: ["camp"],
    tabs: ["home", "journal", "pack", "map"],
    lat: 51.5270,
    lon: 5.9790,
    startDate: "2026-07-18",
    endDate: "2026-07-21",
    packingCategories: jnKampCategories,
  },

  {
    id: "europe-roadtrip-2026",
    name: "Europa Roadtrip",
    subtitle: "Oostenrijk · Tsjechië · Polen · Duitsland",
    emoji: "🚗",
    flag: "🇪🇺",
    activities: ["travel"],
    tabs: ["home", "journal", "pack", "day", "map"],
    lat: 50.06,
    lon: 19.94,
    startDate: "2026-08-10",
    endDate: "2026-08-21",
    stops: [
      { name: "Dienten am Hochkönig", country: "Oostenrijk", flag: "🇦🇹", lat: 47.4753, lon: 13.1497, startDate: "2026-08-10", endDate: "2026-08-12" },
      { name: "Kutná Hora",           country: "Tsjechië",   flag: "🇨🇿", lat: 49.9480, lon: 15.2689, startDate: "2026-08-12", endDate: "2026-08-14" },
      { name: "Kraków",               country: "Polen",      flag: "🇵🇱", lat: 50.0614, lon: 19.9366, startDate: "2026-08-14", endDate: "2026-08-20" },
      { name: "Quedlinburg",          country: "Duitsland",  flag: "🇩🇪", lat: 51.7906, lon: 11.1489, startDate: "2026-08-20", endDate: "2026-08-21" },
    ],
    packingCategories: roadtripCategories,
  },

];

export function getDefaultTrip() {
  const today = new Date().toISOString().slice(0, 10);
  const active = trips.find((t) => today >= t.startDate && today <= t.endDate);
  if (active) return active;
  const upcoming = trips
    .filter((t) => t.startDate > today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (upcoming.length) return upcoming[0];
  return trips.slice().sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
}

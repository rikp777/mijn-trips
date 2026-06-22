// Add a new trip by appending an object to this array.
// All weather/wind/marine/sunrise hooks auto-adapt to the coordinates and dates.
// The app defaults to the upcoming or active trip; past trips show historical weather.
//
// windLat/windLon: the best nearby kite-spot for the live wind widget
//   (often slightly offset from the camp — e.g. the open beach rather than the fjord).

export const trips = [
  {
    id: "ripstar-dk-2026",
    name: "Ripstar Kitecamp",
    subtitle: "Ringkøbing Fjord, Denemarken",
    emoji: "🪁",
    flag: "🇩🇰",
    // Camp / weather location
    lat: 55.892,
    lon: 8.364,
    startDate: "2026-07-04",
    endDate: "2026-07-11",
    // Live-wind widget spot (Hvide Sande beach — more open than the fjord)
    windSpotName: "Hvide Sande, DK",
    windLat: 56.0,
    windLon: 8.13,
  },

  // ── Template for future trips ────────────────────────────────────────────────
  // {
  //   id: "tarifa-2027",
  //   name: "Tarifa Kite School",
  //   subtitle: "Tarifa, Spanje",
  //   emoji: "🪁",
  //   flag: "🇪🇸",
  //   lat: 36.014,
  //   lon: -5.603,
  //   startDate: "2027-06-01",
  //   endDate: "2027-06-08",
  //   windSpotName: "Tarifa, ES",
  //   windLat: 36.014,
  //   windLon: -5.603,
  // },
];

// Returns the most relevant trip to show by default:
//   1. A trip currently in progress
//   2. The next upcoming trip
//   3. The most recently completed trip
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

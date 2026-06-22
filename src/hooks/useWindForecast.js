import { useState, useEffect } from "react";

/** Live wind at the given spot. `trip.windLat/windLon` are used so each
 *  destination shows wind at its own kite beach. */
export function useWindForecast(trip) {
  const [state, setState] = useState({ status: "loading", data: null });

  useEffect(() => {
    if (!trip) return;
    setState({ status: "loading", data: null });
    const endpoint =
      `https://api.open-meteo.com/v1/forecast?latitude=${trip.windLat}` +
      `&longitude=${trip.windLon}&current=wind_speed_10m,wind_direction_10m,temperature_2m` +
      `&wind_speed_unit=kn&timezone=auto`;

    let active = true;
    fetch(endpoint)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => {
        if (!active) return;
        const c = json.current;
        setState({
          status: "ready",
          data: {
            windKn: Math.round(c.wind_speed_10m),
            dir:    c.wind_direction_10m,
            temp:   Math.round(c.temperature_2m),
          },
        });
      })
      .catch(() => active && setState({ status: "error", data: null }));
    return () => { active = false; };
  }, [trip?.id]);

  return state;
}

/** Compass label for a wind direction in degrees, e.g. 200° → "ZW". */
export function windDirLabel(deg) {
  const dirs = ["N", "NO", "O", "ZO", "Z", "ZW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

/** Beginner-friendly verdict on whether the live wind is kiteable. */
export function windVerdict(kn) {
  if (kn < 8)   return { label: "Te weinig wind", color: "#64748B", emoji: "😴" };
  if (kn < 12)  return { label: "Marginaal",      color: "#F59E0B", emoji: "🌬️" };
  if (kn <= 22) return { label: "Prima om te kiten!", color: "#34D399", emoji: "🪁" };
  if (kn <= 28) return { label: "Stevig — pas op",   color: "#F97316", emoji: "💨" };
  return          { label: "Te hard / gevaarlijk",   color: "#EF4444", emoji: "⚠️" };
}

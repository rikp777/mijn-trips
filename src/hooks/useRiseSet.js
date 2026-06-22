import { useState, useEffect } from "react";

function parseTime(isoStr) {
  return isoStr ? isoStr.slice(11, 16) : null;
}

function diffHM(rise, set) {
  if (!rise || !set) return null;
  const [rh, rm] = rise.split(":").map(Number);
  const [sh, sm] = set.split(":").map(Number);
  const totalMin = (sh * 60 + sm) - (rh * 60 + rm);
  if (totalMin <= 0) return null;
  return `${Math.floor(totalMin / 60)}u ${totalMin % 60}m`;
}

function buildEndpoint(trip) {
  const { lat, lon } = trip;
  const today = new Date().toISOString().slice(0, 10);
  const isPast = trip.endDate < today;
  const tz = "Europe%2FCopenhagen";

  if (isPast) {
    // Use archive API for past trips
    return (
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}` +
      `&daily=sunrise,sunset&timezone=${tz}` +
      `&start_date=${trip.startDate}&end_date=${trip.endDate}`
    );
  }
  // Forecast API: covers upcoming trips and the current forecast window
  return (
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=sunrise,sunset&timezone=${tz}&forecast_days=16`
  );
}

export function useRiseSet(trip) {
  const [state, setState] = useState({ status: "loading", today: null });

  useEffect(() => {
    if (!trip) return;
    setState({ status: "loading", today: null });
    let active = true;

    fetch(buildEndpoint(trip))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        if (!active) return;
        const today = new Date().toISOString().slice(0, 10);
        const times = json.daily.time;

        // During the trip: show today. Otherwise show the trip start day.
        const refDate =
          today >= trip.startDate && today <= trip.endDate ? today : trip.startDate;

        const idx = times.findIndex((d) => d === refDate);
        if (idx < 0) { setState({ status: "ready", today: null }); return; }
        const rise = parseTime(json.daily.sunrise[idx]);
        const set  = parseTime(json.daily.sunset[idx]);
        setState({ status: "ready", today: { rise, set, daylight: diffHM(rise, set) } });
      })
      .catch(() => active && setState({ status: "error", today: null }));

    return () => { active = false; };
  }, [trip?.id]);

  return state;
}

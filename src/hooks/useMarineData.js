import { useState, useEffect } from "react";

function buildEndpoint(trip) {
  const { lat, lon, startDate, endDate } = trip;
  const today = new Date().toISOString().slice(0, 10);
  // Span the request to cover both today and the trip window in one call
  const from = today < startDate ? today : startDate;
  const to   = today > endDate   ? today : endDate;
  const tz   = "Europe%2FCopenhagen";
  return (
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
    `&daily=sea_surface_temperature_max&timezone=${tz}&start_date=${from}&end_date=${to}`
  );
}

export function useMarineData(trip) {
  const [state, setState] = useState({ status: "loading", todayTemp: null, tripAvg: null });

  useEffect(() => {
    if (!trip) return;
    setState({ status: "loading", todayTemp: null, tripAvg: null });
    let active = true;

    fetch(buildEndpoint(trip))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        if (!active) return;
        const times = json.daily.time;
        const temps = json.daily.sea_surface_temperature_max;
        const today = new Date().toISOString().slice(0, 10);

        const todayIdx  = times.findIndex((t) => t === today);
        const todayTemp = todayIdx >= 0 && temps[todayIdx] != null
          ? Math.round(temps[todayIdx] * 10) / 10 : null;

        const tripVals = times
          .map((t, i) => ({ t, v: temps[i] }))
          .filter(({ t, v }) => t >= trip.startDate && t <= trip.endDate && v != null)
          .map(({ v }) => v);

        const tripAvg = tripVals.length
          ? Math.round((tripVals.reduce((a, b) => a + b, 0) / tripVals.length) * 10) / 10
          : null;

        setState({ status: "ready", todayTemp, tripAvg });
      })
      .catch(() => active && setState({ status: "error", todayTemp: null, tripAvg: null }));

    return () => { active = false; };
  }, [trip?.id]);

  return state;
}

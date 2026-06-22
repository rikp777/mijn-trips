import { useState, useEffect } from "react";

const DAILY =
  "weathercode,temperature_2m_max,temperature_2m_min," +
  "precipitation_sum,precipitation_hours," +
  "wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant";

// Forecast API also carries precipitation probability; archive API does not.
const DAILY_FORECAST = DAILY + ",precipitation_probability_max";

const DIRS = ["N", "NO", "O", "ZO", "Z", "ZW", "W", "NW"];
const NL_DAYS = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

function buildEndpoint(trip) {
  const today = new Date().toISOString().slice(0, 10);
  const isPast = trip.endDate < today;
  const { lat, lon } = trip;
  const tz = "Europe%2FCopenhagen";

  if (isPast) {
    return (
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}` +
      `&daily=${DAILY}&hourly=precipitation,wind_speed_10m` +
      `&wind_speed_unit=kn&timezone=${tz}` +
      `&start_date=${trip.startDate}&end_date=${trip.endDate}`
    );
  }
  return (
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=${DAILY_FORECAST}&hourly=precipitation,wind_speed_10m` +
    `&wind_speed_unit=kn&timezone=${tz}&forecast_days=16`
  );
}

function buildStopEndpoint(stop, isPast) {
  const { lat, lon, startDate, endDate } = stop;
  const tz = "Europe%2FBerlin";
  if (isPast) {
    return (
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}` +
      `&daily=${DAILY}&hourly=precipitation,wind_speed_10m` +
      `&wind_speed_unit=kn&timezone=${tz}&start_date=${startDate}&end_date=${endDate}`
    );
  }
  return (
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=${DAILY_FORECAST}&hourly=precipitation,wind_speed_10m` +
    `&wind_speed_unit=kn&timezone=${tz}&forecast_days=16`
  );
}

function parseDays(json, isPastTrip, startDate, endDate) {
  const d = json.daily;
  const h = json.hourly;
  return d.time.map((date, i) => {
    const { weekday, dayMonth } = dayLabels(date);
    const kiting = parseKitingWind(h.time, h.wind_speed_10m, date);
    return {
      date,
      isPastTrip,
      isTripDay: date >= startDate && date <= endDate,
      weekday, dayMonth,
      code:          d.weathercode[i],
      emoji:         weatherEmoji(d.weathercode[i]),
      label:         weatherLabel(d.weathercode[i]),
      tempMax:       Math.round(d.temperature_2m_max[i]),
      tempMin:       Math.round(d.temperature_2m_min[i]),
      windKn:        Math.round(d.wind_speed_10m_max[i]),
      windGust:      Math.round(d.wind_gusts_10m_max[i]),
      windDir:       windDir(d.wind_direction_10m_dominant[i]),
      windKitingAvg: kiting.avg,
      windKitingMax: kiting.max,
      precipProb:    d.precipitation_probability_max?.[i] ?? 0,
      precipMm:      Math.round((d.precipitation_sum[i] || 0) * 10) / 10,
      precipHours:   d.precipitation_hours[i] || 0,
      rainWindows:   parseRainWindows(h.time, h.precipitation, date),
    };
  });
}

export function weatherEmoji(code) {
  if (code === 0)  return "☀️";
  if (code <= 1)   return "🌤️";
  if (code <= 2)   return "⛅";
  if (code <= 3)   return "☁️";
  if (code <= 48)  return "🌫️";
  if (code <= 55)  return "🌦️";
  if (code <= 65)  return "🌧️";
  if (code <= 77)  return "❄️";
  if (code <= 82)  return "🌦️";
  if (code <= 86)  return "🌨️";
  return "⛈️";
}

export function weatherLabel(code) {
  if (code === 0)  return "Helder";
  if (code <= 1)   return "Overwegend helder";
  if (code <= 2)   return "Halfbewolkt";
  if (code <= 3)   return "Bewolkt";
  if (code <= 48)  return "Mist";
  if (code <= 55)  return "Motregen";
  if (code <= 65)  return "Regen";
  if (code <= 77)  return "Sneeuw";
  if (code <= 82)  return "Buien";
  if (code <= 86)  return "Sneeuwbuien";
  return "Onweer";
}

export function windVerdict(kn) {
  if (kn < 8)   return { label: "Te weinig",  color: "#64748B", emoji: "😴" };
  if (kn < 12)  return { label: "Marginaal",  color: "#F59E0B", emoji: "🌬️" };
  if (kn <= 22) return { label: "Prima! 🪁",  color: "#34D399", emoji: "🪁" };
  if (kn <= 28) return { label: "Stevig",     color: "#F97316", emoji: "💨" };
  return          { label: "Gevaarlijk",      color: "#EF4444", emoji: "⚠️" };
}

export function sessionVerdict(day) {
  const { windKitingAvg: avg, windKitingMax: max, windGust, code, windDir, isPastTrip } = day;
  const past = isPastTrip;

  if (code >= 95) {
    return {
      status: "cancel", emoji: "⛈️", color: "#EF4444",
      short: past ? "Was: onweer" : "Waarschijnlijk geannuleerd",
      reason: past
        ? `Er was onweer — lessen zijn die dag niet doorgegaan.`
        : `Onweer verwacht — kiten bij een bui is levensgevaarlijk. Les wordt door Ripstar geannuleerd.`,
    };
  }
  if (avg < 8) {
    return {
      status: "cancel", emoji: "😴", color: "#64748B",
      short: past ? `Was: te weinig wind (${avg}kn)` : "Kans op annulering — te weinig wind",
      reason: past
        ? `Gemiddeld slechts ${avg}kn tijdens lesuren. Lessen zijn waarschijnlijk omgezet naar theorie of vrije dag.`
        : `Gemiddeld slechts ${avg}kn tijdens lesuren (09–18u). Verwacht theorieavond of vrije dag.`,
    };
  }
  if (max > 30 || windGust > 38) {
    return {
      status: "cancel", emoji: "🌀", color: "#EF4444",
      short: past ? `Was: te hard (${max}kn)` : "Kans op annulering — wind te hard",
      reason: past
        ? `Piekwind van ${max}kn (gusts ${windGust}kn). Te gevaarlijk voor beginners — lessen waarschijnlijk niet doorgegaan.`
        : `Piekwind van ${max}kn (gusts ${windGust}kn) tijdens lesuren. Instructeur beslist — verwacht geen waterles.`,
    };
  }
  if (avg < 12) {
    return {
      status: "marginal", emoji: "🌬️", color: "#F59E0B",
      short: past ? `Was: weinig wind (${avg}kn)` : "Onzeker — weinig wind",
      reason: past
        ? `Gemiddeld ${avg}kn tijdens lesuren. Grensgebied — mogelijk was er alleen landtraining.`
        : `Gemiddeld ${avg}kn tijdens lesuren. Grensgebied: mogelijk landtraining of bodydrag. Instructeur beslist.`,
    };
  }
  if (max > 24) {
    return {
      status: "marginal", emoji: "💨", color: "#F97316",
      short: past ? `Was: stevig (${max}kn)` : "Stevig — instructeur beslist",
      reason: past
        ? `Piekwind ${max}kn ${windDir} tijdens lesuren. Aan de stevige kant — instructeur heeft mogelijk activiteiten beperkt.`
        : `Piekwind ${max}kn ${windDir} tijdens lesuren. Les gaat door maar activiteiten kunnen worden aangepast. Gusts: ${windGust}kn.`,
    };
  }
  return {
    status: "go", emoji: "🪁", color: "#34D399",
    short: past ? `Was: goede kitedag (${avg}kn)` : "Goede kitedag!",
    reason: past
      ? `Gemiddeld ${avg}kn ${windDir} tijdens lesuren — ideale omstandigheden voor beginners.`
      : `Gemiddeld ${avg}kn ${windDir} tijdens lesuren (09–18u) — ideaal voor beginners. Veel plezier!`,
  };
}

function windDir(deg) {
  return DIRS[Math.round(deg / 45) % 8];
}

function dayLabels(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return {
    weekday: NL_DAYS[d.getDay()],
    dayMonth: `${d.getDate()}/${d.getMonth() + 1}`,
  };
}

function parseKitingWind(hourlyTimes, hourlyWind, date) {
  const vals = [];
  for (let i = 0; i < hourlyTimes.length; i++) {
    if (!hourlyTimes[i].startsWith(date)) continue;
    const h = parseInt(hourlyTimes[i].slice(11, 13));
    if (h >= 9 && h < 19) vals.push(hourlyWind[i] ?? 0);
  }
  if (!vals.length) return { avg: 0, max: 0 };
  return {
    avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
    max: Math.round(Math.max(...vals)),
  };
}

function parseRainWindows(hourlyTimes, hourlyPrecip, date) {
  const hours = [];
  for (let i = 0; i < hourlyTimes.length; i++) {
    if (hourlyTimes[i].startsWith(date))
      hours.push({ h: parseInt(hourlyTimes[i].slice(11, 13)), mm: hourlyPrecip[i] ?? 0 });
  }
  const windows = [];
  let cur = null;
  for (const { h, mm } of hours) {
    if (mm >= 0.1) {
      if (!cur) cur = { startH: h, endH: h, totalMm: 0, maxMm: 0, count: 0 };
      cur.endH = h; cur.totalMm += mm; cur.maxMm = Math.max(cur.maxMm, mm); cur.count++;
    } else if (cur) { windows.push(cur); cur = null; }
  }
  if (cur) windows.push(cur);
  return windows.map((w) => ({
    startLabel:    `${String(w.startH).padStart(2, "0")}:00`,
    endLabel:      `${String(w.endH + 1).padStart(2, "0")}:00`,
    durationHours: w.count,
    totalMm:       Math.round(w.totalMm * 10) / 10,
    maxMm:         Math.round(w.maxMm   * 10) / 10,
  }));
}

const FORECAST_WINDOW = 16;

// Returns the earliest ISO date on which Open-Meteo will have data for a given start date.
function forecastAvailableFrom(startDate) {
  const d = new Date(startDate + "T00:00:00");
  d.setDate(d.getDate() - FORECAST_WINDOW);
  return d.toISOString().slice(0, 10);
}

export function useWeatherForecast(trip) {
  const [state, setState] = useState({ status: "loading", days: [], isPastTrip: false, stopForecasts: null, availableFrom: null });

  useEffect(() => {
    if (!trip) return;
    setState({ status: "loading", days: [], isPastTrip: false, stopForecasts: null, availableFrom: null });
    const today = new Date().toISOString().slice(0, 10);
    const isPastTrip = trip.endDate < today;

    // Trip starts outside the 16-day forecast window — no point calling the API.
    const windowEnd = new Date();
    windowEnd.setDate(windowEnd.getDate() + FORECAST_WINDOW);
    const windowEndStr = windowEnd.toISOString().slice(0, 10);
    if (!isPastTrip && trip.startDate > windowEndStr) {
      setState({
        status: "too-early", days: [], isPastTrip: false, stopForecasts: null,
        availableFrom: forecastAvailableFrom(trip.startDate),
      });
      return;
    }

    let active = true;

    if (trip.stops?.length) {
      Promise.all(
        trip.stops.map((stop) => {
          const isPastStop = stop.endDate < today;
          return fetch(buildStopEndpoint(stop, isPastStop))
            .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
            .then((json) => {
              const all = parseDays(json, isPastStop, stop.startDate, stop.endDate);
              const days = all.filter((d) => d.date >= stop.startDate && d.date <= stop.endDate);
              return { stop, days, status: "ready" };
            })
            .catch(() => ({ stop, days: [], status: "error" }));
        })
      ).then((stopForecasts) => {
        if (!active) return;
        const days = stopForecasts.flatMap((sf) => sf.days);
        const anyReady = stopForecasts.some((sf) => sf.days.length > 0);
        setState({ status: anyReady ? "ready" : "error", days, isPastTrip, stopForecasts });
      });
    } else {
      fetch(buildEndpoint(trip))
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((json) => {
          if (!active) return;
          const days = parseDays(json, isPastTrip, trip.startDate, trip.endDate);
          setState({ status: "ready", days, isPastTrip, stopForecasts: null });
        })
        .catch(() => active && setState({ status: "error", days: [], isPastTrip, stopForecasts: null }));
    }

    return () => { active = false; };
  }, [trip?.id]);

  return state;
}

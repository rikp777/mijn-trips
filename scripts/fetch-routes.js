#!/usr/bin/env node
// scripts/fetch-routes.js
// Dev-time tool: fetches OSRM road/cycling geometry for all trip routes and writes
// to src/data/routes-generated.js so the live app needs no runtime OSRM calls.
//
// Usage: node scripts/fetch-routes.js
// Requires Node 18+ (uses built-in fetch)

const fs = require('fs');
const path = require('path');

// All routes used across any trip in the app.
// profile: "driving" | "cycling"
// stops: [{ lat, lon }, ...] — same arrays as in src/data/locations*.js
// maxPoints: thin the geometry to at most this many [lat,lon] pairs.
// At Europe zoom (~5) you need ≤1 point/km; at regional zoom (~8) ≤0.1 point/km is fine.
const ROUTES = [
  {
    key: 'DK_DRIVE',
    profile: 'driving',
    maxPoints: 1500,
    note: 'Panningen → Ringkøbing kitecamp (DK trip main drive)',
    stops: [
      { lat: 51.3288, lon:  5.9819 }, // Panningen
      { lat: 51.3703, lon:  6.1724 }, // Venlo (DE grens)
      { lat: 51.4704, lon:  6.8516 }, // Oberhausen
      { lat: 51.5136, lon:  7.4653 }, // Dortmund
      { lat: 51.9822, lon:  7.7754 }, // Stop 1: Shell Münster
      { lat: 52.2703, lon:  8.0473 }, // Osnabrück
      { lat: 53.0793, lon:  8.8017 }, // Bremen
      { lat: 53.4724, lon:  9.8479 }, // Stop 2: Shell Hamburg
      { lat: 54.7778, lon:  9.4151 }, // Stop 3: Shell Flensburg
      { lat: 55.4945, lon:  9.4718 }, // Kolding
      { lat: 55.7256, lon:  9.5380 }, // Vejle
      { lat: 56.1342, lon:  8.9798 }, // Herning
      { lat: 55.8922, lon:  8.3644 }, // Ringkøbing camp
    ],
  },
  {
    key: 'DK_BIKE',
    profile: 'cycling',
    maxPoints: 800,
    note: 'Camp → Stauning Airport → Ringkøbing (DK trip bike day)',
    stops: [
      { lat: 55.89222, lon: 8.36444 }, // Ripstar kamp
      { lat: 55.9923,  lon: 8.3463  }, // Stauning Airport
      { lat: 56.0939,  lon: 8.2446  }, // Ringkøbing centrum
    ],
  },
  {
    key: 'ROADTRIP_DRIVE',
    profile: 'driving',
    maxPoints: 2500,
    note: 'Panningen → AT → CZ → PL → DE → Panningen (Europa roadtrip loop)',
    stops: [
      // NL → AT
      { lat: 51.3288, lon:  5.9819 }, // Panningen
      { lat: 51.0504, lon:  6.8728 }, // Köln
      { lat: 50.1109, lon:  8.6821 }, // Frankfurt
      { lat: 49.4521, lon: 11.0767 }, // Nürnberg
      { lat: 48.1351, lon: 11.5820 }, // München
      { lat: 47.8095, lon: 13.0550 }, // Salzburg
      { lat: 47.4753, lon: 13.1497 }, // Dienten am Hochkönig ①
      // AT → CZ
      { lat: 47.8095, lon: 13.0550 }, // Salzburg
      { lat: 48.3069, lon: 14.2858 }, // Linz
      { lat: 48.5742, lon: 13.4588 }, // Passau
      { lat: 49.7477, lon: 13.3776 }, // Plzeň
      { lat: 50.0755, lon: 14.4378 }, // Praha
      { lat: 49.9480, lon: 15.2689 }, // Kutná Hora ②
      // CZ → PL
      { lat: 49.1951, lon: 16.6068 }, // Brno
      { lat: 49.8209, lon: 18.2625 }, // Ostrava
      { lat: 50.2596, lon: 19.0216 }, // Katowice
      { lat: 50.0614, lon: 19.9366 }, // Kraków ③
      // PL → DE
      { lat: 50.2596, lon: 19.0216 }, // Katowice
      { lat: 51.1079, lon: 17.0385 }, // Wrocław
      { lat: 51.0504, lon: 13.7373 }, // Dresden
      { lat: 51.3397, lon: 12.3731 }, // Leipzig
      { lat: 51.7906, lon: 11.1489 }, // Quedlinburg ④
      // DE → NL
      { lat: 52.3759, lon:  9.7320 }, // Hannover
      { lat: 52.2703, lon:  8.0473 }, // Osnabrück
      { lat: 51.8453, lon:  5.8718 }, // Nijmegen
      { lat: 51.3288, lon:  5.9819 }, // Panningen
    ],
  },
  {
    key: 'JN_BIKE',
    profile: 'cycling',
    maxPoints: 800,
    note: 'Panningen → kampterrein De Paardekop Ysselsteyn (JN kamp fietsroute)',
    stops: [
      { lat: 51.3288, lon: 5.9819 }, // Thuis Panningen
      { lat: 51.3262, lon: 5.9912 }, // Blokhut JN
      { lat: 51.4158, lon: 5.9995 }, // Kronenberg
      { lat: 51.4371, lon: 5.9799 }, // America
      { lat: 51.5082, lon: 5.9798 }, // Leunen
      { lat: 51.5270, lon: 5.9790 }, // Kampterrein De Paardekop
    ],
  },
];

const OSRM_BASE = 'https://router.project-osrm.org/route/v1';

// Round to 5 decimal places (~1 m precision) — sufficient for route display
function r5(n) { return Math.round(n * 100000) / 100000; }

// Uniform-stride thinning: keep every Nth point, always keep first and last.
function thin(coords, maxPoints) {
  if (!maxPoints || coords.length <= maxPoints) return coords;
  const step = Math.ceil(coords.length / maxPoints);
  return coords.filter((_, i) => i % step === 0 || i === coords.length - 1);
}

async function fetchRoute({ key, profile, stops, note, maxPoints }) {
  const coordStr = stops.map((s) => `${s.lon},${s.lat}`).join(';');
  const url = `${OSRM_BASE}/${profile}/${coordStr}?overview=full&geometries=geojson`;
  console.log(`\nFetching ${key} — ${note}`);
  console.log(`  Profile: ${profile}, ${stops.length} waypoints`);

  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  if (data.code !== 'Ok' || !data.routes?.[0]?.geometry?.coordinates) {
    throw new Error(`OSRM error: ${data.code} — ${data.message ?? ''}`);
  }

  const raw = data.routes[0].geometry.coordinates;
  // OSRM returns [lon, lat] — convert to [lat, lon] for Leaflet
  const full = raw.map(([lon, lat]) => [r5(lat), r5(lon)]);
  const coords = thin(full, maxPoints);
  const distKm = (data.routes[0].distance / 1000).toFixed(0);
  const durMin = Math.round(data.routes[0].duration / 60);
  const thinned = coords.length < full.length ? ` → thinned to ${coords.length}` : '';
  console.log(`  ✓ ${full.length} points${thinned}, ~${distKm} km, ~${durMin} min`);
  return { key, coords };
}

async function main() {
  if (!globalThis.fetch) {
    console.error('Node 18+ required (built-in fetch). Run: node --version');
    process.exit(1);
  }

  const results = {};
  for (const route of ROUTES) {
    try {
      const { key, coords } = await fetchRoute(route);
      results[key] = coords;
    } catch (e) {
      console.error(`  FAILED ${route.key}:`, e.message);
      results[route.key] = [];
    }
    // Be polite to the public OSRM instance
    await new Promise((r) => setTimeout(r, 800));
  }

  const date = new Date().toISOString().slice(0, 10);
  const outPath = path.join(__dirname, '../src/data/routes-generated.js');
  const content =
`// Auto-generated on ${date} by scripts/fetch-routes.js — do not edit manually.
// Re-run to refresh: node scripts/fetch-routes.js
// Source: OSRM public API (router.project-osrm.org).
// Coordinates rounded to 5 decimal places (~1 m), [lat, lon] pairs for Leaflet.

export const ROUTES = ${JSON.stringify(results)};
`;

  fs.writeFileSync(outPath, content);
  const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`\nWritten: ${outPath} (${kb} KB)`);
  console.log('Run "npm run dev" and MapView will use the pre-baked routes immediately.');
}

main().catch((e) => { console.error(e); process.exit(1); });

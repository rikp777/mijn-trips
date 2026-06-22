#!/usr/bin/env node
// scripts/fetch-borders.js
// Dev-time tool: fetches national border geometry from Natural Earth and writes to
// src/data/border-lines-generated.js so the live app needs no runtime API calls.
//
// Source: Natural Earth 1:10m Admin-0 boundary lines (public domain, no auth required)
// Usage: node scripts/fetch-borders.js
// Requires Node 18+ (uses built-in fetch)

const fs = require('fs');
const path = require('path');

// 10m resolution boundary lines — detailed enough for zoom 6-10
const NE_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_boundary_lines_land.geojson';

// Each border is clipped to a tight bbox so we only keep the relevant section.
// bbox: [minLat, minLon, maxLat, maxLon]
const BORDERS = [
  { key: 'NL-DE',  bbox: [51.2,  5.7,  52.2,  7.2],  note: 'NL/DE near Venlo' },
  { key: 'DE-DK',  bbox: [54.4,  7.8,  55.3, 10.6],  note: 'DE/DK full land border' },
  { key: 'DE-AT',  bbox: [47.2, 12.1,  48.8, 14.3],  note: 'DE/AT Salzburg + Passau area' },
  { key: 'DE-CZ',  bbox: [48.8, 12.2,  50.6, 13.9],  note: 'DE/CZ Bohemian Forest' },
  { key: 'CZ-PL',  bbox: [49.5, 17.7,  50.6, 19.3],  note: 'CZ/PL Ostrava area' },
  { key: 'PL-DE',  bbox: [50.7, 14.4,  52.6, 16.1],  note: 'PL/DE Oder-Neisse' },
  { key: 'DE-NL',  bbox: [51.4,  5.4,  52.3,  7.1],  note: 'DE/NL near Nijmegen' },
];

// Round to 4 decimal places (~11 m precision)
function r4(n) { return Math.round(n * 10000) / 10000; }

// Clip a GeoJSON coordinate array ([lon, lat] order) to a bbox.
// Returns an array of segments (each a run of consecutive in-bbox points).
function clipToBbox(coords, [minLat, minLon, maxLat, maxLon]) {
  const inside = ([lon, lat]) =>
    lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
  const segments = [];
  let cur = [];
  for (const pt of coords) {
    if (inside(pt)) {
      cur.push([r4(pt[1]), r4(pt[0])]); // GeoJSON [lon,lat] → Leaflet [lat,lon]
    } else {
      if (cur.length >= 2) segments.push(cur);
      cur = [];
    }
  }
  if (cur.length >= 2) segments.push(cur);
  return segments;
}

function extractSegments(geojson, bbox) {
  const segments = [];
  for (const feature of geojson.features) {
    const { type, coordinates } = feature.geometry;
    const rings = type === 'LineString'      ? [coordinates]
                : type === 'MultiLineString' ? coordinates
                : [];
    for (const ring of rings) {
      segments.push(...clipToBbox(ring, bbox));
    }
  }
  return segments;
}

async function main() {
  if (!globalThis.fetch) {
    console.error('Node 18+ required (built-in fetch). Run: node --version');
    process.exit(1);
  }

  console.log('Downloading Natural Earth 10m boundary lines…');
  console.log(`  ${NE_URL}`);

  let geojson;
  try {
    const res = await fetch(NE_URL, { signal: AbortSignal.timeout(60000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    geojson = await res.json();
    console.log(`  ✓ ${geojson.features.length} features loaded\n`);
  } catch (e) {
    console.error('  ✗ Download failed:', e.message);
    process.exit(1);
  }

  const results = {};
  for (const { key, bbox, note } of BORDERS) {
    const segments = extractSegments(geojson, bbox);
    const totalPts = segments.reduce((s, seg) => s + seg.length, 0);
    console.log(`${key.padEnd(6)} ${note}`);
    console.log(`       ${segments.length} segments, ${totalPts} points`);
    results[key] = segments;
  }

  const date = new Date().toISOString().slice(0, 10);
  const outPath = path.join(__dirname, '../src/data/border-lines-generated.js');
  const content =
`// Auto-generated on ${date} by scripts/fetch-borders.js — do not edit manually.
// Re-run to refresh: node scripts/fetch-borders.js
// Source: Natural Earth 1:10m Admin-0 boundary lines (public domain).
// Coordinates rounded to 4 decimal places (~11 m), [lat, lon] pairs for Leaflet.

export const BORDER_LINES = ${JSON.stringify(results)};
`;

  fs.writeFileSync(outPath, content);
  const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`\nWritten: ${outPath} (${kb} KB)`);
}

main().catch(e => { console.error(e); process.exit(1); });

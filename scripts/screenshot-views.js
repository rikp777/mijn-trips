#!/usr/bin/env node
// scripts/screenshot-views.js
// Captures screenshots of every view for the README.
// Usage: node scripts/screenshot-views.js
// Saves to: docs/screenshots/

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:5173/mijn-trips/';
const OUT  = path.join(__dirname, '../docs/screenshots');

fs.mkdirSync(OUT, { recursive: true });

const MOBILE  = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

async function go(page, hash, waitMs = 500) {
  await page.goto(BASE + hash);
  await page.waitForTimeout(waitMs);
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
  console.log(`  ✓ ${name}.png`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // ── Mobile screenshots ──────────────────────────────────────────
  console.log('\n── Mobile (390×844) ──');
  {
    const page = await browser.newPage();
    await page.setViewportSize(MOBILE);

    await go(page, '#?tab=home&trip=ripstar-dk-2026');
    await shot(page, 'mobile-home');

    await go(page, '#?tab=home&detail=1&trip=ripstar-dk-2026');
    await shot(page, 'mobile-trip-detail');

    await go(page, '#?tab=pack&trip=ripstar-dk-2026');
    await shot(page, 'mobile-pack');

    await go(page, '#?tab=map&trip=ripstar-dk-2026', 1500);
    await shot(page, 'mobile-map');

    await go(page, '#?tab=journal&trip=ripstar-dk-2026');
    await shot(page, 'mobile-journal');

    await go(page, '#?tab=day&trip=ripstar-dk-2026');
    await shot(page, 'mobile-day');

    await page.close();
  }

  // ── Desktop screenshots ─────────────────────────────────────────
  console.log('\n── Desktop (1280×800) ──');
  {
    const page = await browser.newPage();
    await page.setViewportSize(DESKTOP);

    await go(page, '#?tab=home&trip=ripstar-dk-2026');
    await shot(page, 'desktop-home');

    await go(page, '#?tab=home&detail=1&trip=ripstar-dk-2026');
    await shot(page, 'desktop-trip-detail');

    await go(page, '#?tab=map&trip=ripstar-dk-2026', 1500);
    await shot(page, 'desktop-map-dk');

    await go(page, '#?tab=map&trip=europe-roadtrip-2026', 1500);
    await shot(page, 'desktop-map-roadtrip');

    await go(page, '#?tab=pack&trip=ripstar-dk-2026');
    await shot(page, 'desktop-pack');

    await go(page, '#?tab=day&trip=ripstar-dk-2026');
    await shot(page, 'desktop-day');

    await page.close();
  }

  await browser.close();
  console.log(`\nAll screenshots saved to: ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

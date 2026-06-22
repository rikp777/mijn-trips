// scripts/debug-nav.js
// Run: node scripts/debug-nav.js
// Tests trip switching and map tab persistence with Playwright

const { chromium } = require('playwright');

const BASE = 'http://localhost:5173/mijn-trips/';

async function log(page, label) {
  const url = page.url();
  const hash = url.split('#')[1] ?? '(no hash)';
  console.log(`[${label}]  ${hash}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', m => {
    const t = m.text();
    if (m.type() === 'error') return; // skip noisy errors
    if (t.includes('[navigate]') || t.includes('[patchUrlTrip]') || t.includes('[auto-redirect]')) {
      console.log(' ', t.replace(/\n.*/s, ''));
    }
  });

  console.log('\n=== Test: trip chip on map tab stays on map ===\n');

  // 1. Load the app
  await page.goto(BASE);
  await page.waitForTimeout(600);
  await log(page, 'after load');

  // 2. Navigate to map tab
  const mapBtn = page.locator('button', { hasText: 'Kaart' }).first();
  await mapBtn.click();
  await page.waitForTimeout(400);
  await log(page, 'after clicking Kaart tab');

  // 3. Click a different trip chip (Europa Roadtrip)
  const europaChip = page.locator('button', { hasText: 'Europa Roadtrip' }).first();
  const europaVisible = await europaChip.isVisible().catch(() => false);
  if (europaVisible) {
    await europaChip.click();
    await page.waitForTimeout(400);
    await log(page, 'after clicking Europa Roadtrip chip');
  } else {
    console.log('  Europa chip not visible');
    const chips = await page.locator('button').allTextContents();
    console.log('  All buttons:', chips.filter(t => t.trim()).join(' | '));
  }

  // 4. Click another trip chip (Jong Nederland)
  const jnChip = page.locator('button', { hasText: 'Jong Nederland' }).first();
  const jnVisible = await jnChip.isVisible().catch(() => false);
  if (jnVisible) {
    await jnChip.click();
    await page.waitForTimeout(400);
    await log(page, 'after clicking Jong Nederland chip');
  }

  console.log('\n=== Test: switch trip via Home tab → trip card ===\n');

  // 5. Go to Home tab
  const homeBtn = page.locator('button', { hasText: 'Home' }).last();
  await homeBtn.click();
  await page.waitForTimeout(400);
  await log(page, 'after clicking Home tab');

  // 6. Click a trip card
  const tripCard = page.locator('div[style*="cursor: pointer"]').first();
  const tripCardVisible = await tripCard.isVisible().catch(() => false);
  if (tripCardVisible) {
    await tripCard.click();
    await page.waitForTimeout(500);
    await log(page, 'after clicking trip card on home');
  } else {
    console.log('  No trip card found — checking page content...');
    const heading = await page.locator('h1').first().textContent().catch(() => '');
    console.log('  h1:', heading);
  }

  // 7. Final URL
  await log(page, 'FINAL');

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });

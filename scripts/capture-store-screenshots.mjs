// Store screenshot capture script
// Usage: bun dev (in another shell), then: node scripts/capture-store-screenshots.mjs
// Requires: bun add -D playwright && bunx playwright install chromium

import { chromium, devices } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = process.env.BASE_URL || 'http://localhost:8080';
const OUT = './store-screenshots';
mkdirSync(OUT, { recursive: true });

const shots = [
  { path: '/', name: '01-today', caption: 'Your family, briefed at 6am' },
  { path: '/ask', name: '02-ask', caption: 'Natural language for anything family' },
  { path: '/inbox', name: '03-inbox', caption: "Forward it. We'll handle it." },
  { path: '/autopilot', name: '04-autopilot', caption: 'Set it once. Runs forever.' },
  { path: '/calendar', name: '05-calendar', caption: 'Every kid. Every activity. One view.' },
  { path: '/security', name: '06-security', caption: 'Bank-level encryption. Zero data selling.' },
];

const targets = [
  { label: 'iphone-6.7', viewport: { width: 1290, height: 2796 }, deviceScaleFactor: 3 },
  { label: 'iphone-6.5', viewport: { width: 1242, height: 2688 }, deviceScaleFactor: 3 },
  { label: 'android-phone', viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 3 },
  { label: 'ipad-13', viewport: { width: 2064, height: 2752 }, deviceScaleFactor: 2 },
];

for (const target of targets) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 13 Pro Max'],
    viewport: target.viewport,
    deviceScaleFactor: target.deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  for (const shot of shots) {
    await page.goto(BASE + shot.path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const filename = `${OUT}/${target.label}-${shot.name}.png`;
    await page.screenshot({ path: filename });
    console.log('✓', filename);
  }
  await browser.close();
}
console.log('\nAll screenshots saved to', OUT);
console.log('Add captions in Figma/Sketch before uploading to App Store Connect / Play Console.');

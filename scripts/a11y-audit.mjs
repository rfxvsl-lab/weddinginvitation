/**
 * Audit aksesibilitas dengan axe-core (WCAG 2.1 A/AA) via Chromium.
 *
 *   node scripts/a11y-audit.mjs http://localhost:3000/ http://localhost:3000/rian-salsa
 *   node scripts/a11y-audit.mjs <url> --detail      # tampilkan elemen yang melanggar
 *
 * Halaman undangan dirender di dalam iframe; frame itu ikut diaudit.
 */

import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const chromium = (() => {
  for (const n of ['playwright-core', 'playwright']) {
    try { return require(n).chromium; } catch { /* berikutnya */ }
  }
  throw new Error('Butuh playwright-core dan Chromium.');
})();
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const args = process.argv.slice(2);
const detail = args.includes('--detail');
const urls = args.filter((a) => !a.startsWith('--'));

async function auditFrame(frame) {
  await frame.evaluate(axeSource);
  return frame.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, iframes: false });
    return r.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      count: v.nodes.length,
      targets: v.nodes.slice(0, 4).map((n) => `${n.target.join(' ')} :: ${n.html.slice(0, 110)}`),
    }));
  });
}

const browser = await chromium.launch();
let total = 0;
for (const url of urls) {
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })).newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const merged = new Map();
  for (const frame of page.frames()) {
    if (frame.url() === 'about:blank' && frame !== page.mainFrame() && !(await frame.$('body *'))) continue;
    for (const v of await auditFrame(frame).catch(() => [])) {
      const prev = merged.get(v.id);
      if (prev) { prev.count += v.count; prev.targets.push(...v.targets); } else merged.set(v.id, v);
    }
  }
  const list = [...merged.values()].sort((a, b) => b.count - a.count);
  const n = list.reduce((s, v) => s + v.count, 0);
  total += n;
  console.log(`\n${new URL(url).pathname}  — ${list.length} aturan dilanggar, ${n} elemen`);
  for (const v of list) {
    console.log(`  ${String(v.count).padStart(3)}  ${v.impact?.padEnd(8)} ${v.id}: ${v.help}`);
    if (detail) v.targets.slice(0, 4).forEach((t) => console.log(`         ${t}`));
  }
}
await browser.close();
console.log(`\nTotal elemen bermasalah: ${total}`);

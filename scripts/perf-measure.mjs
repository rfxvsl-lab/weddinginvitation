/**
 * Ukur performa halaman dengan Chromium pada profil HP kelas menengah:
 * viewport 390x844, CPU diperlambat 4x, jaringan "Slow 4G"
 * (1,6 Mbps turun, 750 kbps naik, RTT 150 ms — sama dengan preset Lighthouse).
 *
 *   node scripts/perf-measure.mjs http://localhost:3000/ http://localhost:3000/rian-salsa
 *
 * Keluaran: LCP, FCP, jumlah request, dan ukuran transfer per jenis aset.
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
function loadChromium() {
  for (const name of ['playwright-core', 'playwright']) {
    try {
      return require(name).chromium;
    } catch {
      /* coba berikutnya */
    }
  }
  throw new Error('Butuh playwright-core dan Chromium (npx playwright-core install chromium).');
}

const urls = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const asJson = process.argv.includes('--json');
if (urls.length === 0) {
  console.error('Pemakaian: node scripts/perf-measure.mjs <url> [url...] [--json]');
  process.exit(1);
}

const kb = (n) => Math.round(n / 1024);

async function measure(browser, url) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  const types = new Map();
  const sizes = { script: 0, image: 0, font: 0, stylesheet: 0, document: 0, media: 0, other: 0 };
  let requests = 0;
  cdp.on('Network.responseReceived', (e) => types.set(e.requestId, e.type));
  cdp.on('Network.loadingFinished', (e) => {
    requests += 1;
    const type = (types.get(e.requestId) || 'Other').toLowerCase();
    const key = type in sizes ? type : 'other';
    sizes[key] += e.encodedDataLength;
  });

  await page.addInitScript(() => {
    window.__perf = { lcp: 0, fcp: 0, cls: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__perf.lcp = entry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') window.__perf.fcp = entry.startTime;
      }
    }).observe({ type: 'paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__perf.cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });

  const started = Date.now();
  await page.goto(url, { waitUntil: 'load', timeout: 180000 });
  const loadMs = Date.now() - started;
  // Beri waktu untuk aset susulan dan LCP final.
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const perf = await page.evaluate(() => window.__perf);
  await context.close();

  const total = Object.values(sizes).reduce((a, b) => a + b, 0);
  return {
    url,
    lcpMs: Math.round(perf.lcp),
    fcpMs: Math.round(perf.fcp),
    cls: Number(perf.cls.toFixed(3)),
    loadMs,
    requests,
    totalKb: kb(total),
    scriptKb: kb(sizes.script),
    imageKb: kb(sizes.image),
    fontKb: kb(sizes.font),
    cssKb: kb(sizes.stylesheet),
    mediaKb: kb(sizes.media),
    htmlKb: kb(sizes.document),
  };
}

const browser = await loadChromium().launch();
const results = [];
for (const url of urls) results.push(await measure(browser, url));
await browser.close();

if (asJson) {
  console.log(JSON.stringify(results, null, 2));
} else {
  console.table(results.map(({ url, ...rest }) => ({ halaman: new URL(url).pathname, ...rest })));
}

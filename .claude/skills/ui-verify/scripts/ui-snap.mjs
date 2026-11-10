#!/usr/bin/env node
/**
 * ui-snap — screenshot halaman dan bandingkan dua versi piksel per piksel.
 *
 * Ambil screenshot:
 *   node .claude/skills/ui-verify/scripts/ui-snap.mjs shoot http://localhost:3000 ./shots/before
 *   node .claude/skills/ui-verify/scripts/ui-snap.mjs shoot http://localhost:3000 ./shots/after \
 *        --pages "/,/auth,/preview" --login demo@local.test:demo12345
 *
 * Bandingkan:
 *   node .claude/skills/ui-verify/scripts/ui-snap.mjs diff ./shots/before ./shots/after ./shots/diff
 *
 * `shoot` memotret tiap halaman di desktop (1366) dan HP (390), full page, animasi dimatikan.
 * Dengan --login, /dashboard ikut dipotret setelah masuk. `diff` mencetak % piksel berbeda dan
 * menulis gambar diff (merah = berbeda) serta potongan per 1500 px untuk dibaca.
 */

import { createRequire } from 'node:module';
import { mkdirSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const root = process.cwd();
const req = (name) => require(require.resolve(name, { paths: [root] }));
const chromium = (() => {
  for (const n of ['playwright-core', 'playwright']) {
    try { return req(n).chromium; } catch { /* berikutnya */ }
  }
  throw new Error('Butuh playwright-core (npm install) dan Chromium.');
})();
const sharp = req('sharp');

const [cmd, ...rest] = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : fallback;
};

const VIEWPORTS = { desktop: { width: 1366, height: 900 }, mobile: { width: 390, height: 844 } };

async function settle(page) {
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' }).catch(() => {});
  // Tunggu font, lalu gambar non-lazy di semua frame (undangan dirender di dalam iframe).
  await Promise.race([page.evaluate(() => document.fonts.ready), page.waitForTimeout(5000)]);
  for (const frame of page.frames()) {
    await Promise.race([
      frame.evaluate(() => Promise.all([...document.images].filter((i) => !i.complete && i.loading !== 'lazy')
        .map((i) => new Promise((r) => { i.onload = i.onerror = r; })))).catch(() => {}),
      page.waitForTimeout(8000),
    ]);
  }
  await page.waitForTimeout(800);
}

async function shoot(base, outDir) {
  const pages = (opt('pages', '/,/auth,/auth?mode=register,/preview,/kharis-lia,/halaman-yang-tidak-ada/x')).split(',').map((s) => s.trim()).filter(Boolean);
  const login = opt('login', '');
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const name = (p, vp) => `${vp}${p === '/' ? '-home' : p.replace(/[^a-z0-9]+/gi, '-').replace(/-$/, '')}.png`;
  for (const [vp, size] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1, reducedMotion: 'reduce', isMobile: vp === 'mobile', hasTouch: vp === 'mobile' });
    const page = await ctx.newPage();
    for (const p of pages) {
      await page.goto(base + p, { waitUntil: 'networkidle' }).catch(() => {});
      await settle(page);
      await page.screenshot({ path: path.join(outDir, name(p, vp)), fullPage: true });
      console.log('  ', name(p, vp));
    }
    if (login) {
      const [email, password] = login.split(':');
      await page.goto(base + '/auth', { waitUntil: 'networkidle' });
      await page.fill('#signin-email', email);
      await page.fill('#signin-password', password);
      await page.click('#signin-submit');
      await page.waitForURL('**/dashboard', { timeout: 20000 }).catch(() => {});
      await page.waitForLoadState('networkidle').catch(() => {});
      await settle(page);
      await page.screenshot({ path: path.join(outDir, `${vp}-dashboard.png`), fullPage: false });
      console.log('  ', `${vp}-dashboard.png`);
    }
    await ctx.close();
  }
  await browser.close();
}

async function diff(dirA, dirB, outDir) {
  mkdirSync(outDir, { recursive: true });
  const files = readdirSync(dirA).filter((f) => f.endsWith('.png') && existsSync(path.join(dirB, f)));
  for (const f of files) {
    const a = sharp(path.join(dirA, f)), b = sharp(path.join(dirB, f));
    const [ma, mb] = [await a.metadata(), await b.metadata()];
    const width = Math.max(ma.width, mb.width), height = Math.max(ma.height, mb.height);
    const pad = (img, m) => img.extend({ right: width - m.width, bottom: height - m.height, background: '#ff00ff' }).removeAlpha().raw().toBuffer();
    const [A, B] = [await pad(sharp(path.join(dirA, f)), ma), await pad(sharp(path.join(dirB, f)), mb)];
    const out = Buffer.alloc(width * height * 3);
    let changed = 0;
    for (let i = 0; i < width * height; i++) {
      const o = i * 3;
      const d = Math.abs(A[o] - B[o]) + Math.abs(A[o + 1] - B[o + 1]) + Math.abs(A[o + 2] - B[o + 2]);
      if (d > 48) { changed++; out[o] = 255; out[o + 1] = 0; out[o + 2] = 0; } else { out[o] = out[o + 1] = out[o + 2] = B[o] >> 2; }
    }
    await sharp(out, { raw: { width, height, channels: 3 } }).png().toFile(path.join(outDir, f));
    const pct = ((100 * changed) / (width * height)).toFixed(2);
    const size = ma.height === mb.height ? `${ma.height}px` : `${ma.height} → ${mb.height}px`;
    console.log(`${f.padEnd(40)} ${pct.padStart(6)}% piksel berbeda   tinggi ${size}`);
  }
}

if (cmd === 'shoot' && rest[0] && rest[1]) await shoot(rest[0].replace(/\/$/, ''), rest[1]);
else if (cmd === 'diff' && rest[2]) await diff(rest[0], rest[1], rest[2]);
else {
  console.error('Pemakaian:\n  ui-snap.mjs shoot <baseUrl> <outDir> [--pages "/,/auth"] [--login email:password]\n  ui-snap.mjs diff <dirSebelum> <dirSesudah> <outDir>');
  process.exit(1);
}

/**
 * Buat ulang thumbnail tema (public/assets/themes/<id>.webp) dari halaman demo.
 *
 *   npm run build && npx next start -p 3000
 *   node scripts/theme-thumbnails.mjs http://localhost:3000 [--only=id1,id2] [--force]
 *
 * Memotret sampul setiap tema di /demo/<id> pada 375×812 (2×), lalu menyimpannya
 * sebagai WebP 400×866. Dengan begitu thumbnail selalu cocok dengan tampilan tema
 * saat ini, termasuk tema baru.
 */

import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const root = process.cwd();
const load = (n) => require(require.resolve(n, { paths: [root] }));
const chromium = (() => { for (const n of ['playwright-core', 'playwright']) { try { return load(n).chromium; } catch { /* */ } } throw new Error('Butuh playwright-core.'); })();
const sharp = load('sharp');

const argv = process.argv.slice(2);
const force = argv.includes('--force');
const onlyArg = argv.find((a) => a.startsWith('--only='));
const base = (argv.find((a) => !a.startsWith('--')) || 'http://localhost:3000').replace(/\/$/, '');
let skipped = 0;
const src = readFileSync(path.join(root, 'src/data/defaultData.ts'), 'utf8');
const block = src.slice(src.indexOf('DEFAULT_THEMES'), src.indexOf('];', src.indexOf('DEFAULT_THEMES')));
const ids = [...block.matchAll(/^\s{4}id:\s*'([^']+)'/gm)].map((m) => m[1]);

const only = onlyArg ? onlyArg.slice(7).split(',') : null;
const browser = await chromium.launch();
for (const id of ids) {
  if (only && !only.includes(id)) continue;
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  // ?thumbnail=true: mode bawaan halaman demo tanpa tombol kembali dan label demo.
  await page.goto(`${base}/demo/${id}?thumbnail=true`, { waitUntil: 'networkidle' });
  await Promise.race([page.evaluate(() => document.fonts.ready), page.waitForTimeout(5000)]);
  await page.waitForTimeout(4500); // halaman demo membekukan animasi setelah 4 detik
  // Jangan simpan thumbnail yang memuat gambar rusak (mis. foto contoh gagal diunduh).
  let broken = 0;
  for (const frame of page.frames()) {
    broken += await frame
      .evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).length)
      .catch(() => 0);
  }
  if (broken > 0 && !force) {
    console.warn(`  ! ${id}: ${broken} gambar gagal dimuat — dilewati (pakai --force untuk tetap menyimpan)`);
    skipped += 1;
    await ctx.close();
    continue;
  }
  const png = await page.screenshot();
  const out = path.join(root, 'public/assets/themes', `${id}.webp`);
  await sharp(png).resize({ width: 400 }).webp({ quality: 78 }).toFile(out);
  console.log('  ', path.relative(root, out));
  await ctx.close();
}
await browser.close();
if (skipped) process.exitCode = 1;

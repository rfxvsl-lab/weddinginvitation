#!/usr/bin/env node
/**
 * slop-scan — temukan pola "AI slop" yang bisa dideteksi dari kode.
 *
 *   node .claude/skills/ui-no-slop/scripts/slop-scan.mjs            # laporan
 *   node .claude/skills/ui-no-slop/scripts/slop-scan.mjs --json     # JSON
 *   node .claude/skills/ui-no-slop/scripts/slop-scan.mjs --fail-on K,A   # exit 1 bila ada temuan K/A
 *   node .claude/skills/ui-no-slop/scripts/slop-scan.mjs --include-templates
 *
 * Kode kategori mengikuti references/criteria.md. Pemindai ini sengaja hanya
 * menangkap pola yang jelas; tetap lihat screenshot untuk penilaian visual.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const includeTemplates = args.includes('--include-templates');
const failOnArg = args.find((a) => a.startsWith('--fail-on'));
const failOn = failOnArg ? (failOnArg.split('=')[1] || args[args.indexOf(failOnArg) + 1] || '').split(',').filter(Boolean) : [];

const rel = (p) => path.relative(ROOT, p);

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx|ts|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

const UI_FILES = walk(path.join(ROOT, 'src')).filter((f) => {
  const r = rel(f);
  if (r.startsWith('src/server/') || r.startsWith('src/app/api/')) return false;
  if (/src\/app\/(robots|sitemap)\.ts$/.test(r)) return false; // path di sini bukan tautan UI
  // Template undangan adalah produk yang dijual; InvitationPreview memuat tema bawaan.
  if (!includeTemplates && (r.startsWith('src/components/templates/') || r === 'src/components/InvitationPreview.tsx')) return false;
  return true;
});

/** Buang komentar supaya catatan pengembang tidak ikut terhitung. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:"'`])\/\/.*$/gm, (m, pre) => pre + ' '.repeat(m.length - pre.length));
}

const findings = [];
/**
 * Pengecualian yang disengaja: tulis komentar `slop-ok: <alasan>` di baris yang
 * sama atau tepat di atasnya. Alasannya wajib supaya pengecualian bisa ditinjau.
 */
const RAW_LINES = new Map();
function allowed(file, line) {
  if (!RAW_LINES.has(file)) RAW_LINES.set(file, readFileSync(file, 'utf8').split('\n'));
  const lines = RAW_LINES.get(file);
  return /slop-ok:\s*\S/.test(lines[line - 1] || '') || /slop-ok:\s*\S/.test(lines[line - 2] || '');
}

function add(code, file, line, message, snippet) {
  if (allowed(file, line)) return;
  findings.push({ code, category: code[0], file: rel(file), line, message, snippet: (snippet || '').trim().slice(0, 140) });
}

function eachMatch(file, text, re, fn) {
  const lines = text.split('\n');
  lines.forEach((ln, i) => {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(ln))) {
      fn(i + 1, m, ln);
      if (!re.global) break;
    }
  });
}

// ---------- Rute yang ada (untuk A3) ----------
function collectRoutes() {
  const appDir = path.join(ROOT, 'src/app');
  const statics = new Set(['/']);
  for (const f of walk(appDir).concat(readdirSync(appDir, { recursive: true }).map((x) => path.join(appDir, String(x))))) {
    if (!/[/\\](page|route)\.tsx?$/.test(f) && !/[/\\](robots|sitemap)\.ts$/.test(f)) continue;
    let r = '/' + path.relative(appDir, path.dirname(f)).split(path.sep).filter((s) => !/^\(.*\)$/.test(s)).join('/');
    if (/[/\\]robots\.ts$/.test(f)) r = '/robots.txt';
    if (/[/\\]sitemap\.ts$/.test(f)) r = '/sitemap.xml';
    statics.add(r.replace(/\/$/, '') || '/');
  }
  return statics;
}
const ROUTES = collectRoutes();
function routeExists(href) {
  const clean = href.split(/[?#]/)[0].replace(/\/$/, '') || '/';
  if (ROUTES.has(clean)) return true;
  const segs = clean.split('/').filter(Boolean);
  // Cocok dengan rute dinamis SELAIN /[slug] (yang menelan semua path satu segmen
  // dan akan menampilkan "Undangan Tidak Ditemukan").
  for (const r of ROUTES) {
    const rs = r.split('/').filter(Boolean);
    if (rs.length !== segs.length || r === '/[slug]') continue;
    if (rs.every((s, i) => s.startsWith('[') || s === segs[i])) return true;
  }
  return false;
}

// ---------- Tema & aset (untuk A1/K5) ----------
const defaultData = readFileSync(path.join(ROOT, 'src/data/defaultData.ts'), 'utf8');
const themesBlock = defaultData.slice(defaultData.indexOf('DEFAULT_THEMES'), defaultData.indexOf('];', defaultData.indexOf('DEFAULT_THEMES')));
const THEME_IDS = [...themesBlock.matchAll(/^\s{4}id:\s*'([^']+)'/gm)].map((m) => m[1]);

// id elemen yang ada di kode (untuk memeriksa tautan jangkar #id)
const ANCHOR_IDS = new Set(
  UI_FILES.flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/\bid=["'{`]+([\w-]+)["'}`]/g)].map((m) => m[1]))
);

const GENERIC = [
  'impian', 'istimewa', 'eksklusif', 'sekali seumur hidup', 'tak terlupakan', 'wujudkan', 'bukan sekadar',
  'momen sakral', 'revolusioner', 'seamless', 'elevate', 'unleash', 'next-level', 'effortless', 'game-changer',
];
// Emoji bergambar (🎉 👋 🔒 ✨ ✅ ❌). Simbol teks seperti ✓ ✕ ⚠ tidak dihitung.
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F2FF}\u{2728}\u{2B50}\u{2705}\u{274C}]️?/u;

for (const file of UI_FILES) {
  const raw = readFileSync(file, 'utf8');
  const text = stripComments(raw);
  const r = rel(file);
  const isCss = file.endsWith('.css');

  if (!isCss) {
    // K1: angka besar bertitik ribuan di dekat kata pengguna/aktivitas
    eachMatch(file, text, /\b\d{1,3}(?:\.\d{3})+\+?\s*(?:<[^>]*>\s*)*(pasangan|undangan|pengguna|tamu|ulasan|review|users?|terkirim|terdaftar)/gi,
      (l, m, ln) => add('K1', file, l, `Statistik pengguna: "${m[0]}"`, ln));
    eachMatch(file, text, /value:\s*["'`]\d{1,3}(?:\.\d{3})+["'`]/g, (l, m, ln) => add('K1', file, l, 'Angka statistik di data', ln));
    // K2: rating x/5
    eachMatch(file, text, /\b[0-5][,.]\d\s*\/\s*5(?:[,.]0)?\b/g, (l, m, ln) => add('K2', file, l, `Rating: "${m[0]}"`, ln));
    eachMatch(file, text, /reviewCount\s*:\s*\d+/g, (l, m, ln) => add('K2', file, l, 'Jumlah ulasan di data', ln));
    // K4: persentase berdesimal / nominal "jt" / "N terverifikasi"
    // Satu-dua desimal di teks (98,4%), bukan nilai CSS (33.333333%, width: 12.5%;)
    eachMatch(file, text, /\b\d{1,3}[,.]\d{1,2}\s*%(?!\s*[;,)])/g, (l, m, ln) => {
      if (/\b(width|height|flex|left|right|top|bottom|translate|inset|basis)\b/.test(ln)) return;
      add('K4', file, l, `Persentase dekoratif: "${m[0]}"`, ln);
    });
    eachMatch(file, text, /Rp\s*\d+[,.]\d+\s*(jt|juta|rb)/gi, (l, m, ln) => add('K4', file, l, `Nominal dekoratif: "${m[0]}"`, ln));
    eachMatch(file, text, /\b\d+\s+terverifikasi/gi, (l, m, ln) => add('K4', file, l, `"${m[0]}"`, ln));
    eachMatch(file, text, /\b\d+[,.]\d+\s*(?:detik|dtk)\b/gi, (l, m, ln) => add('K4', file, l, `Waktu dekoratif: "${m[0]}"`, ln));
    // K5: "N+ tema" / "N tema eksklusif" yang tidak sama dengan jumlah tema sebenarnya.
    // ("2 tema" sebagai batas paket bukan klaim, jadi butuh "+" atau kata sifat.)
    eachMatch(file, text, /\b(\d+)(?:\+\s*(?:<[^>]*>\s*)*tema|\s+tema\s+(?:eksklusif|premium|pilihan))\b/gi, (l, m, ln) => {
      if (Number(m[1]) !== THEME_IDS.length) add('K5', file, l, `"${m[0]}" — tema sebenarnya: ${THEME_IDS.length}`, ln);
    });
    eachMatch(file, text, />\s*(\d+)\+\s*</g, (l, m, ln) => add('K5', file, l, `Angka "${m[1]}+" tanpa sumber`, ln));
    // K6: janji layanan berangka
    // JSX menulis "<" sebagai &lt; atau {'<'}
    eachMatch(file, text, /(?:[<≤]|&lt;|\{\s*['"]<['"]\s*\})\s*\d+\s*(?:menit|jam|detik)|rata-rata\s*(?:[<≤]|&lt;)?\s*\d+\s*(?:menit|jam)/gi, (l, m, ln) => add('K6', file, l, `Janji layanan: "${m[0]}"`, ln));
    // K3: testimoni & flag verifikasi
    eachMatch(file, text, /export const VERIFIED\s*=\s*true/g, (l, m, ln) => add('K3', file, l, 'VERIFIED = true: pastikan semua angka & testimoni berasal dari data nyata', ln));
    eachMatch(file, text, /^\s*venue:\s*["']/g, (l, m, ln) => add('K3', file, l, 'Testimoni dengan venue — butuh izin pelanggan nyata', ln));

    // A3: tautan internal ke halaman yang tidak ada
    eachMatch(file, text, /href=\{?["'`](\/[A-Za-z0-9\-_/]*)(?:[?#][^"'`]*)?["'`]\}?/g, (l, m, ln) => {
      if (m[1].startsWith('/_next') || m[1].startsWith('/api/') || /\.\w+$/.test(m[1])) return;
      if (!routeExists(m[1])) add('A3', file, l, `Tautan ke halaman yang tidak ada: ${m[1]}`, ln);
    });
    // A3: tautan yang ditulis sebagai data, mis. ["Tentang", "/about"] atau { href: "/x" }
    eachMatch(file, text, /(?:\[\s*["'`][^"'`\n]{1,40}["'`]\s*,\s*|\bhref:\s*)["'`](\/[A-Za-z0-9\-_/]*)(#[\w-]+)?["'`]/g, (l, m, ln) => {
      if (m[1].startsWith('/api/') || /\.\w+$/.test(m[1])) return;
      if (!routeExists(m[1])) add('A3', file, l, `Tautan ke halaman yang tidak ada: ${m[1]}`, ln);
    });
    // A3: tautan jangkar /#id harus menuju id yang ada di halaman
    // Hanya "/#id" atau href="#id" — bukan warna hex seperti "#fff".
    eachMatch(file, text, /(?:["'`]\/#|href=["'`]#)([A-Za-z][\w-]*)["'`]/g, (l, m, ln) => {
      if (!ANCHOR_IDS.has(m[1])) add('A3', file, l, `Jangkar #${m[1]} tidak ada di halaman mana pun`, ln);
    });
    // A1: aset statis yang tidak ada
    eachMatch(file, text, /["'`(](\/(?:assets\/[^"'`)\s]+|[\w\-]+\.(?:png|jpe?g|webp|svg|mp3|gif)))["'`)]/g, (l, m, ln) => {
      const p = decodeURIComponent(m[1]);
      if (p.includes('${')) return;
      if (!existsSync(path.join(ROOT, 'public', p))) add('A1', file, l, `Aset tidak ada: ${p}`, ln);
    });
    eachMatch(file, text, /\/assets\/themes\/\$\{[^}]+\}\.(\w+)/g, (l, m, ln) => {
      for (const id of THEME_IDS) {
        if (!existsSync(path.join(ROOT, 'public/assets/themes', `${id}.${m[1]}`))) add('A1', file, l, `Thumbnail tema tidak ada: /assets/themes/${id}.${m[1]}`, ln);
      }
    });

    // V7: nama pasangan placeholder dipakai sebagai pengganti aset nyata
    eachMatch(file, text, /Rina\s*&(?:amp;)?\s*Budi/g, (l, m, ln) => add('V7', file, l, 'Placeholder "Rina & Budi" — gunakan screenshot tema nyata', ln));
    // V8: emoji
    eachMatch(file, text, new RegExp(EMOJI.source, 'gu'), (l, m, ln) => {
      if (/\bconsole\.(log|warn|error|info|debug)\(/.test(ln)) return; // log debug, bukan UI
      add('V8', file, l, `Emoji di UI: ${m[0]}`, ln);
    });
    // C3: kata miring beraksen di judul
    eachMatch(file, text, /<span[^>]*saas-serif-i[^>]*>/g, (l, m, ln) => add('C3', file, l, 'Aksen kata miring di judul', ln));
    // C1/C2: frasa generik (hanya di teks/string yang tampil)
    eachMatch(file, text, new RegExp(`\\b(${GENERIC.map((g) => g.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'gi'), (l, m, ln) => {
      if (/className|import|const [A-Z_]+\s*=|label:\s*'[a-z]/.test(ln) && !/>[^<]*\b/.test(ln)) return;
      add('C1', file, l, `Frasa generik: "${m[0]}"`, ln);
    });
    // V2: ikon dalam kotak tinted berulang
    eachMatch(file, text, /className="[^"]*\b(h-(?:9|10|11|12) w-(?:9|10|11|12)|w-(?:9|10|11|12) h-(?:9|10|11|12))\b[^"]*\brounded-(?:xl|2xl|full)\b[^"]*\bbg-[a-z]+-(?:50|100)\b/g,
      (l, m, ln) => add('V2', file, l, 'Ikon di kotak pastel', ln));
  }

  // V1: gradien dan glow berwarna (CSS & TSX)
  eachMatch(file, text, /linear-gradient\([^)]*(?:rgba\(\s*(?!0\s*,\s*0\s*,\s*0)\d+|#[0-9a-f]{3,6})/gi, (l, m, ln) => {
    if (/saas-btn|button|btn/i.test(ln) || /btn/.test(text.split('\n').slice(Math.max(0, l - 6), l).join('\n'))) add('V1', file, l, 'Gradien pada tombol', ln);
  });
  eachMatch(file, text, /bg-gradient-to-[a-z]+[^"']*(?:from-[a-z]+-\d{3})/g, (l, m, ln) => add('V1', file, l, 'Kelas gradien Tailwind', ln));
  // Glow = bayangan berwarna. Bayangan netral (hitam/abu/putih, selisih kanal < 30) bukan glow.
  const tinted = (m) => Math.max(+m[1], +m[2], +m[3]) - Math.min(+m[1], +m[2], +m[3]) >= 30;
  eachMatch(file, text, /box-shadow:[^;]*?rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*0?\.(?:[2-9])/gi, (l, m, ln) => {
    if (tinted(m)) add('V1', file, l, 'Glow berwarna (box-shadow)', ln);
  });
  eachMatch(file, text, /shadow-\[[^\]]*?rgba\(\s*(\d+),(\d+),(\d+),0?\.[2-9]/g, (l, m, ln) => {
    if (tinted(m)) add('V1', file, l, 'Glow berwarna (kelas shadow)', ln);
  });
  // V5: blob blur dekoratif
  // Blob = elemen yang dikaburkan ≥ 40px. backdrop-filter (kaca) bukan blob.
  eachMatch(file, text, /blur-\[(\d{2,})px\]|(?<!backdrop-)filter:\s*blur\(\s*(\d{2,})px/g, (l, m, ln) => {
    if (Number(m[1] || m[2]) >= 40) add('V5', file, l, 'Blob blur dekoratif', ln);
  });
  // V6: gradien ungu/indigo generik
  eachMatch(file, text, /from-(?:indigo|purple|violet|fuchsia)-\d{3}/g, (l, m, ln) => add('V6', file, l, 'Gradien ungu/indigo generik', ln));
  // A2: mojibake
  eachMatch(file, text, /â€|Ã[\u0080-¿]|Â[ -¿]/g, (l, m, ln) => add('A2', file, l, 'Mojibake', ln));
}

// A2: mojibake yang terpanggang di nama file aset tidak bisa dibaca dari kode — catat sebagai pengingat.
const byCode = {};
for (const f of findings) byCode[f.code] = (byCode[f.code] || 0) + 1;
const byCat = {};
for (const f of findings) byCat[f.category] = (byCat[f.category] || 0) + 1;

if (asJson) {
  console.log(JSON.stringify({ total: findings.length, byCategory: byCat, byCode, themes: THEME_IDS.length, findings }, null, 2));
} else {
  const names = { K: 'Klaim', C: 'Copy', V: 'Visual', S: 'Konsistensi', A: 'Aset & integritas' };
  console.log(`slop-scan — ${UI_FILES.length} file UI${includeTemplates ? ' (termasuk template)' : ''}, ${THEME_IDS.length} tema terdaftar\n`);
  for (const cat of ['K', 'A', 'C', 'V', 'S']) {
    const list = findings.filter((f) => f.category === cat);
    if (!list.length) continue;
    console.log(`${cat} — ${names[cat]}: ${list.length}`);
    for (const f of list) console.log(`  ${f.code}  ${f.file}:${f.line}  ${f.message}`);
    console.log('');
  }
  console.log('Ringkasan:', Object.entries(byCode).sort().map(([k, v]) => `${k}=${v}`).join(' ') || 'tidak ada temuan');
}

if (failOn.length && findings.some((f) => failOn.includes(f.category))) process.exit(1);

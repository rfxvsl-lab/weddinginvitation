---
name: ui-verify
description: Membuktikan perubahan UI di RuangHadir dengan bukti, bukan klaim — screenshot sebelum/sesudah, pixel diff, audit aksesibilitas (axe-core), dan ukur performa pada profil HP 4G — termasuk membandingkan dengan versi lama lewat git worktree. Gunakan setiap kali selesai mengubah tampilan, CSS, aset gambar, font, komponen, atau template undangan; sebelum mengatakan "tampilan tidak berubah", "lebih cepat", atau "sudah diperbaiki"; dan saat diminta mengecek, membandingkan, atau mengaudit UI.
---

# Verifikasi UI dengan bukti

Klaim tentang UI ("tidak ada yang berubah", "lebih ringan", "sudah terbaca") hanya boleh disampaikan
setelah dibuktikan. Skill ini berisi alat dan urutan kerjanya, serta jebakan yang pernah membuat
pengukuran di repo ini salah.

## Alat

| Tujuan | Perintah |
| --- | --- |
| Screenshot banyak halaman (desktop + HP) | `node .claude/skills/ui-verify/scripts/ui-snap.mjs shoot <url> <dir> [--pages "/,/auth"] [--login email:pass]` |
| Bandingkan dua set screenshot | `node .claude/skills/ui-verify/scripts/ui-snap.mjs diff <sebelum> <sesudah> <outDiff>` |
| Audit aksesibilitas WCAG 2.1 AA (ikut memeriksa iframe undangan) | `npm run a11y -- <url> [url…] [--detail]` |
| Ukur performa (390×844, CPU 4×, Slow 4G) | `npm run perf -- <url> [url…] [--json]` |
| Cek pola slop di kode | `node .claude/skills/ui-no-slop/scripts/slop-scan.mjs` |

## Alur standar

1. **Siapkan data lokal** (sekali): `.env.local` berisi `TURSO_DATABASE_URL=file:<path>.db` dan
   `SESSION_SECRET`, lalu `npm run migrate` dan `npx tsx scripts/seed-local.ts`
   (akun `demo@local.test` / `demo12345`, undangan `/rian-salsa`).
2. **Versi lama sebagai pembanding.** Jangan mengandalkan ingatan tentang tampilan lama:
   ```bash
   git worktree add /tmp/wt-before <commit-lama>
   cp -al node_modules /tmp/wt-before/node_modules   # hardlink; Turbopack menolak symlink
   cp .env.local /tmp/wt-before/ && (cd /tmp/wt-before && npx next build && npx next start -p 3101)
   ```
   Jika commit lama butuh paket yang sudah dihapus, pasang di worktree itu saja
   (`npm install --no-save <paket>`), jangan di repo utama.
3. **Build versi baru** (`npx next build && npx next start -p 3100`). Ukur build produksi, bukan `next dev`.
   Matikan server lama dulu (`pkill -f next-server`): build saat server di port yang sama masih hidup
   pernah gagal dengan error acak.
4. **Potret keduanya** dengan data yang sama, lalu `diff`. Baca gambar diff dan potongan halamannya.
   Perbedaan kecil di tepi gambar/teks (≤ 0,3%) biasanya anti-aliasing; perbesar untuk memastikan.
5. **Audit a11y dan ukur performa** di kedua versi. Ulangi pengukuran performa minimal dua kali.
6. **Laporkan angka sebelum → sesudah**, termasuk yang memburuk dan yang tidak bisa diukur.

## Jebakan yang pernah terjadi di repo ini

- **Gambar Google (lh3.googleusercontent.com) bisa diblokir dari sandbox** (`ERR_BLOCKED_BY_ORB`)
  setelah banyak request. Gambar yang gagal tercatat 0 KB, sehingga hasil "lebih ringan" palsu.
  Untuk mengukur, ganti URL gambar di data seed dengan gambar yang stabil (mis. Cloudinary demo)
  dan pastikan jumlah gambar yang *berhasil* dimuat sama di kedua versi.
- **Undangan dirender di dalam iframe** (`IframePreview`). Selector, `document.fonts`, dan audit harus
  menargetkan `page.frames()`, bukan hanya halaman utama.
- **`document.elementsFromPoint` melewatkan elemen `pointer-events: none`.** Untuk mencari lapisan yang
  menutupi konten, cari elemen `position: fixed` yang kotaknya menutupi target.
- **axe menghitung kontras hanya dari elemen leluhur.** Latar dari lapisan `fixed` saudara tidak
  dihitung, jadi hasil "latar #999999" bisa salah; selalu cek dengan screenshot sebelum mengubah warna.
- **Token `--saas-*` hanya terdefinisi di dalam `.saas-scope`.** Halaman auth (`AuthGate`) memakai
  kelas `saas-btn-*` di luar scope itu. Mengganti warna hex dengan `var(--saas-…)` tanpa fallback
  pernah membuat tombol "Masuk" transparan. Selalu tulis `var(--saas-wine, #8E2F45)` dan potret
  `/auth` setelah mengubah kelas `saas-*`.
- **Font: periksa apa yang benar-benar termuat** (`[...document.fonts].filter(f => f.status === 'loaded')`),
  bukan apa yang tertulis di CSS. `@import url()` di `index.css` dibuang saat bundling; mengaktifkan
  font yang selama ini tidak termuat akan mengubah tampilan seluruh situs.
- **Skrip yang menggulir lewat `scrollTop` bisa gagal** di template dengan container scroll sendiri.
  Untuk meniru tamu, gunakan `page.mouse.wheel` berulang dan cek apakah target masuk viewport.
- **`waitUntil: 'networkidle'` + menunggu semua gambar bisa menggantung** karena gambar `loading="lazy"`
  yang belum terlihat tidak pernah dimuat. Batasi waktu tunggu (ui-snap sudah melakukannya).

## Bentuk laporan

```
Halaman        Sebelum → Sesudah      Bukti
/              4.697 → 835 KB         perf, 2 run
/rian-salsa    0,22% piksel berbeda   ui-snap diff (anti-aliasing logo)
a11y           66 → 33 elemen         npm run a11y, 12 halaman
Tidak terukur: instalasi Chromium di CI (sudah terpasang di sandbox).
```

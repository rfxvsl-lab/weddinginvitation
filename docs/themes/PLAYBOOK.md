# Playbook — menambah tema undangan (Theme Kit)

Dokumen ini dipakai oleh sesi otomatis harian **dan** manusia. Satu tema = satu file.
Semua fitur (sampul, musik, hitung mundur, acara + peta + kalender, kisah, galeri,
amplop digital, RSVP, tiket tamu) sudah disediakan `src/themes/kit/KitLayout.tsx`.
Tugas tema hanya menentukan **rasa**: palet, font, ornamen, varian tiap bagian, dan teks.

## Langkah

1. **Pilih brief.** Buka `docs/themes/BACKLOG.md`, ambil baris teratas berstatus `todo`.
   Jika id sudah ada di `src/themes/catalog/`, tandai `done` lalu ambil berikutnya.
2. **Rancang sebelum menulis kode** (tulis singkat di pesan commit):
   - palet 6–9 warna (cek kontras teks vs bg ≥ 4.5:1, tombol `onPrimary` vs `primary` ≥ 4.5:1)
   - pasangan font Google (display + body; `script` opsional). Jangan pakai font yang
     sudah dipakai 3 tema terakhir.
   - kombinasi varian: `cover`, `hero`, `frame`, `couple`, `events`, `gallery`, `countdown`,
     `ambient`, `reveal`, `divider`. **Wajib berbeda** dari tema sebelumnya minimal di
     `cover` + `hero` + satu lainnya. Lihat tabel "Kombinasi terpakai" di BACKLOG.
   - satu **elemen khas** (Signature/CoverArt/cornerSvg/dividerSvg) yang membuat tema
     dikenali — motif budaya, tekstur, ilustrasi garis. SVG digambar sendiri, ringan (< 4 KB).
3. **Tulis** `src/themes/catalog/<id>.tsx` meniru `sage-garden.tsx`:
   `export default defineTheme({ ... addedAt: '<tanggal hari ini, Asia/Jakarta>' })`.
   - `id` kebab-case, unik. `category` salah satu: `classic` (adat), `modern`, `floral`,
     `minimalist`, `storybook`. Brief bertanda **special** → baca bagian "Tema Spesial" di bawah.
   - Teks `copy` Bahasa Indonesia, hangat, sesuai tema. Sapaan Islami hanya bila temanya Islami/adat yang pas.
   - Tanpa gambar eksternal baru; foto berasal dari data pengguna.
4. **Daftarkan** di `src/themes/catalog/index.ts`: impor dan letakkan **paling depan** `KIT_THEMES`.
5. **Verifikasi**
   ```bash
   npx tsc --noEmit
   TURSO_DATABASE_URL=file:./local.db SESSION_SECRET=dev-secret-dev-secret-0123456789 npx next dev -p 3000 &
   python3 scripts/theme_shots.py <id>      # menulis public/assets/themes/shots/<id>.webp
   ```
   Skrip harus keluar dengan kode 0 (tidak ada error konsol, semua fitur ditemukan).
   Lihat `/tmp/theme-qa/<id>/1-cover.png`, `2-opened.png`, `4-sheet.png` dan periksa
   checklist kualitas di bawah. Perbaiki lalu ulangi sampai lolos.
6. **Build** `TURSO_DATABASE_URL=file:./local.db npx next build` harus sukses.
7. **Catat & kirim**
   - BACKLOG: ubah status brief menjadi `done (YYYY-MM-DD)` dan tambah baris di "Kombinasi terpakai".
   - `CHANGELOG.md`: tambah baris di bagian "Tema baru".
   - `git add` hanya file tema, index katalog, shot `.webp`, BACKLOG, CHANGELOG.
   - Commit `feat(theme): <Nama Tema>` lalu `git push origin main` (Vercel deploy otomatis).
   - Jika gagal di langkah mana pun dan tidak bisa diperbaiki: **jangan push**; tulis
     alasannya di BACKLOG pada brief tsb (`blocked: ...`) dan commit hanya perubahan BACKLOG.

## Tema Spesial (2D / 2.5D paralaks)

Brief bertanda **special** dibuat sebagai adegan berlapis, bukan halaman satu lembar.
Contoh lengkap: `catalog/lembayung.tsx` (2.5D, dolly, waktu berjalan) dan
`catalog/taman-kertas.tsx` (2D pop-up kertas). Mesin: `src/themes/kit/scene.tsx`.

- Set `tier: 'special'`, `cover: 'scene'`, `hero: 'scene'`, dan `scene: { Backdrop, intro, heroText, closingText, panel }`.
- `Backdrop` disusun dari **5–9 `<Layer depth>`** (0 = jauh, 1 = dekat). Kedalaman harus
  menyebar (mis. 0.05, 0.15, 0.3, 0.45, 0.6, 0.8, 1). Lapisan langit/matahari pakai `noIntro`.
- Semua gambar adalah SVG yang digambar sendiri. Gunakan `ridgePath`/`ridgeY` untuk bukit,
  ombak, bukit pasir; `seeded()` untuk posisi acak yang stabil. Tanpa gambar eksternal.
- **Perspektif udara**: warna lapisan jauh dicampur ke warna cakrawala (`mix(near, horizon, haze)`).
- **Cerita saat digulir**: minimal satu perubahan yang terikat progres gulir lewat `useScene`
  + `keyframeColors` (waktu berganti, kabut menipis, lampu menyala, kedalaman laut, dsb.).
- `intro`: `dolly` (kamera maju), `popup` (lapisan berdiri — cocok gaya kertas/wayang),
  atau `rise` (lapisan naik bergantian). Jangan pakai intro yang sama dengan tema spesial sebelumnya.
- Kontras: `heroText` harus terbaca di langit awal (progres 0), `closingText` di langit akhir (progres 1).
- Kinerja: ≤ 9 lapisan, ≤ 1 `filter` per lapisan, animasi CSS hanya `transform`/`opacity`,
  partikel ≤ 80. Dengan "kurangi gerakan", adegan tetap tampil tanpa gerak (sudah ditangani mesin).
- QA tambahan: `4-sheet.png` harus menunjukkan perubahan adegan dari awal ke akhir; panel konten
  tetap terbaca di atas adegan pada setiap titik.

## Checklist kualitas (wajib lolos semua)

- [ ] Sampul: nama, tanggal, nama tamu, tombol terbaca; tidak ada garis/ornamen memotong teks.
- [ ] Animasi buka berjalan dan konten tampil (2-opened bukan sampul lagi).
- [ ] Hero menampilkan foto/nama dengan jelas di layar 390×844 tanpa terpotong.
- [ ] Teks body ≥ 12.5px, kontras cukup di semua kartu.
- [ ] Ornamen tidak menutupi tombol/form (Signature `pointerEvents: none`, zIndex 1).
- [ ] Tidak ada scroll horizontal; ambient tidak berlebihan (≤ 14 partikel bawaan).
- [ ] Tema terasa **berbeda** dari 5 tema terakhir saat thumbnail dijajarkan.
- [ ] Tidak meniru merek/karakter berhak cipta (Netflix, Disney, dll.) atau logo nyata.

## Aturan keamanan untuk sesi otomatis

- Hanya ubah file yang disebut di langkah 7. Jangan sentuh auth, API, DB, payment, env.
- Jangan menambah dependency npm.
- Jangan menghapus atau mengubah tema yang sudah ada.
- Maksimal satu tema per sesi.

# Playbook — menambah tema undangan (Theme Kit)

**Pembaruan pemilik 24 November 2026:** baca [QUALITY-V2.md](QUALITY-V2.md) dan
[COLLABORATION.md](../../COLLABORATION.md). Keduanya mengatur pengembangan berikutnya.
Preview/tema existing tidak diubah oleh redesign aplikasi. Jangan menghasilkan SVG/ilustrasi AI
atau menyalin aset kompetitor. Brief `todo` belum berarti siap rilis; sumber seni dan QA harus jelas.

Dokumen ini dipakai oleh sesi otomatis harian **dan** manusia. Satu tema = satu file.
Semua fitur (sampul, musik, hitung mundur, acara + peta + kalender, kisah, galeri,
amplop digital, RSVP, tiket tamu) sudah disediakan `src/themes/kit/KitLayout.tsx`.
Tugas tema hanya menentukan **rasa**: palet, font, ornamen, varian tiap bagian, dan teks.

## Standar tema (wajib dibaca dulu)

Tema reguler memakai alur bagian standar kompetitor di `docs/themes/STANDARD.md`
(`kit/standardSections.tsx`). Jangan menulis ulang bagian; bedakan tema lewat seni, warna,
huruf, `cover`, `Stage`/`hero`, `couple`, `events`, `gallery`, `ornament` (+ `floraArt`/`cornerSvg`).
Tema Spesial tetap memakai bab adegan (bagian di bawah).

## Standar kualitas (gaya & teknik)

Acuan kualitas: template premium (mis. Vitopia "Royal Garden"). Yang ditiru adalah **tekniknya**,
diterapkan **sesuai konsep masing-masing tema**. Setiap tema WAJIB punya alur dan tampilan
bagian sendiri — jangan membuat semua tema menjadi satu halaman dengan urutan bagian yang sama.

Teknik yang dapat dipilih sesuai konsep (tidak wajib ditumpuk pada setiap tema):
1. **Pembuka berlapis 2.5D** setelah sampul dibuka (kamera bergerak, lapisan masuk dengan
   kedalaman berbeda), lalu nama mempelai masuk bertahap.
2. **Ornamen yang digerakkan gulir** (masuk dari samping, bergoyang/bergeser mengikuti posisi
   gulir) — ornamennya khas tema (bunga, gunungan, lentera, pita film, dll.).
3. **Animasi masuk per elemen** dari arah berbeda, bukan semua fade yang sama.
4. **Seni artistik**: aset existing yang dikurasi atau karya desainer dengan sumber dan lisensi
   tercatat. Jangan generate SVG, pola flora, atau ilustrasi AI untuk mengejar jumlah tema.
5. Fitur wajib tetap lengkap (mempelai, acara + peta + kalender, hitung mundur, galeri,
   tanda kasih, RSVP + ucapan, penutup), tetapi **urutan, bentuk, dan jumlah layar bebas**
   sesuai konsep (bab layar penuh, halaman buku, slide, tiket, playlist, dsb.). Atur lewat
   `sections`, `scene.Chapter`, varian bagian, atau komponen kustom.
6. Menu navigasi & tombol musik disediakan mesin.

Sebelum menulis kode, tulis 3 kalimat konsep: alur bagian, bentuk tampilan utama, dan apa yang
membuat tema ini berbeda dari 5 tema terakhir.

## Langkah

1. **Pilih brief.** Buka `docs/themes/BACKLOG.md`, ambil baris teratas berstatus `todo`.
   Jika id sudah ada di `src/themes/catalog/`, tandai `done` lalu ambil berikutnya.
2. **Rancang sebelum menulis kode** (tulis singkat di pesan commit):
   - palet 6–9 warna (cek kontras teks vs bg ≥ 4.5:1, tombol `onPrimary` vs `primary` ≥ 4.5:1)
   - pasangan font tema (display + body; `script` opsional) dipilih karena cocok dengan konsep,
     bukan rotasi acak. Font aplikasi Manrope tidak diubah.
   - kombinasi varian: `cover`, `hero`, `frame`, `couple`, `events`, `gallery`, `countdown`,
     `ambient`, `reveal`, `divider`. **Wajib berbeda** dari tema sebelumnya minimal di
     `cover` + `hero` + satu lainnya. Lihat tabel "Kombinasi terpakai" di BACKLOG.
   - satu **elemen khas** yang membuat tema dikenali — komposisi foto, bingkai, seni atau motif
     dengan sumber terverifikasi. Tidak wajib SVG. Jika aset belum siap, catat `blocked: art review`;
     jangan menggantinya dengan SVG generik atau menyalin gambar vendor.
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
   - Kerjakan di branch terpisah. `git add` hanya file tema baru, index katalog, shot `.webp`,
     BACKLOG, CHANGELOG dan catatan sumber aset/QA. Perubahan mesin/shared preview memerlukan
     lingkup kerja tersendiri; jangan memasukkannya sebagai efek samping tema baru.
   - Commit `feat(theme): <Nama Tema>`, push branch kerja, lalu buat draft PR untuk review pemilik
     dan koordinasi Claude/GPT. Jangan langsung push `main` atau memicu produksi dari sesi tema.
   - Jika gagal di langkah mana pun dan tidak bisa diperbaiki: **jangan push**; tulis
     alasannya di BACKLOG pada brief tsb (`blocked: ...`) dan commit hanya perubahan BACKLOG.

## Tema Spesial (2D / 2.5D paralaks bab per bab)

Tema Spesial **bukan** latar paralaks di belakang kartu. Gayanya seperti situs naratif
paralaks: **setiap bagian undangan adalah satu bab adegan layar penuh**, teks berada di
dalam adegan (ada lapisan di belakang DAN di depan teks), dan lapisan bergerak dengan
kecepatan berbeda saat bab masuk, ditahan, lalu keluar. Tiap bab punya tempat/waktu/
komposisi sendiri — jangan mengulang komposisi yang sama di semua bab.

Contoh lengkap: `catalog/lembayung.chapters.tsx` (2.5D, senja → malam, 10 bab) dan
`catalog/taman-kertas.chapters.tsx` (2D pop-up kertas, 10 bab). Mesin: `kit/chapters.tsx`
(+ `kit/scene.tsx` untuk `Px`, `ridgePath`, `mix`, dll.).

- File tema `<id>.tsx` (tanpa hook) + `<id>.chapters.tsx` (`'use client'`) yang mengekspor
  `default function Chapter({ id, layer })` dan objek `INK`.
- `tier: 'special'`, `cover: 'scene'`, `hero: 'scene'`, `scene: { Chapter, ink, intro, heroText, closingText, panel }`.
- Untuk tiap `SectionId`: `layer === 'back'` → `<Sky>` + 3–6 `<ArtLayer depth>` di belakang teks;
  `layer === 'front'` → 1–3 `<ArtLayer>` di depan teks (bingkai, rumput, daun, partikel) yang
  menutupi **tepi** saja — jangan menutupi nomor rekening, form, atau tombol.
- Bab pembuka: lapisan pakai `hero order={n}` (ikut intro). Bab lain: `popup order={n}` untuk gaya
  kertas/wayang, atau tanpa popup untuk gaya lanskap. `exitX` untuk lapisan yang membelah ke samping.
- `ink[id]` = warna teks + bayangan teks di atas langit bab itu; cek kontras tiap bab.
- Gunakan aset seni terkurasi dan berlisensi; jangan menjadikan `ridgePath`, `ridgeY`, `seeded`
  atau siluet SVG generik sebagai pengganti arahan seni. Kode vektor existing boleh tetap dipakai
  oleh tema existing; tidak ada migrasi otomatis dari pembaruan panduan ini.
- Kinerja: ≤ 7 `ArtLayer` per bab, animasi CSS hanya `transform`/`opacity`, partikel ≤ 30 per bab.
- QA: `5-chapters.png` (tiap bab saat sejajar layar) harus memperlihatkan 10 adegan yang berbeda,
  teks terbaca, dan tidak ada ornamen depan yang menutupi isi penting.

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
- Jangan menghapus atau mengubah tema yang sudah ada. Label brief `migrate` sendiri bukan izin;
  cocokkan dengan arahan pemilik dan lingkup PR sebelum menyentuh preview yang dilindungi.
- Maksimal satu tema per sesi.

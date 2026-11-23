# Playbook — menambah tema undangan (Theme Kit)

Dokumen ini dipakai oleh sesi otomatis harian **dan** manusia. Satu tema = satu file.
Semua fitur (sampul, musik, hitung mundur, acara + peta + kalender, kisah, galeri,
amplop digital, RSVP, tiket tamu) sudah disediakan `src/themes/kit/KitLayout.tsx`.
Tugas tema hanya menentukan **rasa**: palet, font, ornamen, varian tiap bagian, dan teks.

## Standar undangan (WAJIB untuk semua tema)

Konsep mengikuti template premium (acuan: Vitopia "Royal Garden"). Mesin KitLayout sudah
menyediakan semuanya — tema hanya mengisi rasa. Jangan menghapus bagian standar.

1. **Sampul**: nama, tanggal, **kartu tamu** (Kepada Yth. / nama / Di Tempat), tombol buka.
2. **Panggung pembuka 2.5D** (bab `hero`): setelah sampul dibuka kamera turun dari langit dan
   lapisan naik satu per satu (intro `descend`), kupu-kupu terbang, lalu nama mempelai masuk dari
   kiri/kanan, `&` membesar, tanggal dari bawah. Default `GardenStage` (taman prosedural dari palet);
   tema boleh memberi `Stage` sendiri dari `<ArtLayer hero order>` — sangat dianjurkan agar khas.
3. **Rangkaian bunga paralaks**: mengapit foto & panel, masuk dari samping lalu bergoyang
   mengikuti gulir. WAJIB lukisan, bukan SVG generik: pilih `floraArt` (blush, ivory, burgundy,
   peach, lavender, dustyblue, coral, rose, gold) dari `public/assets/art/`.
3b. **Seni harus artistik.** Dilarang bentuk SVG generik (lingkaran-bunga, bukit datar polos).
   Gunakan lukisan di `public/assets/art/` (buket, cat air `wc-*`, `gunungan`, `leaves`) untuk
   panggung/ornamen, atau gambar SVG yang benar-benar dirancang (gradien, lipatan, cahaya,
   tekstur) seperti `grand-ballroom.stage.tsx` dan `royal-arabian.stage.tsx`. Aset baru dapat
   ditambahkan lewat `scripts/build_art.py` (mis. buket dengan warna baru).
4. **Urutan bagian**: hero → kutipan (foto + nama + ayat) → mempelai (panel lengkung) → tayangan foto
   (slideshow) → Save the Date (hitung mundur) → acara (panel lengkung + buket) → tanda kasih →
   galeri → kisah → RSVP → ucapan (daftar dengan avatar & waktu) → terima kasih (foto penuh +
   keluarga besar kedua mempelai).
5. **Menu navigasi** (☰ kanan atas) dan **piringan musik** (kiri bawah) — otomatis.
6. **Varian warna**: isi `variants` (3–4 varian) agar pemilik bisa memilih di dashboard.

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
4b. **Migrasi tema lama** (brief bertanda `migrate`): bangun ulang tema lama di Theme Kit dengan
   **id yang sama** (agar undangan yang sudah memakainya ikut berubah), pertahankan karakter
   aslinya (warna, font, motif), tambahkan standar di atas, lalu hapus entrinya dari `LEGACY_THEMES`
   di `src/data/defaultData.ts` dan cabangnya di `InvitationPreview.tsx` hanya bila tidak dipakai lagi.
   Contoh: `catalog/dark-luxury-cinematic.tsx` (id `rfx-dark`).
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
   - `git add` hanya file tema, index katalog, shot `.webp`, BACKLOG, CHANGELOG
     (untuk migrasi juga `defaultData.ts` / `InvitationPreview.tsx`).
   - Commit `feat(theme): <Nama Tema>` lalu `git push origin main` (Vercel deploy otomatis).
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
- Semua gambar SVG buatan sendiri (`ridgePath`, `ridgeY`, `seeded`); tanpa gambar eksternal.
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
- Jangan menghapus atau mengubah tema yang sudah ada, kecuali brief `migrate`.
- Maksimal satu tema per sesi.

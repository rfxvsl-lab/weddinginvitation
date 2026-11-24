# Standar tema undangan RuangHadir

Acuan: pola yang dipakai template premium di pasar Indonesia (Katsudoto, Satu Momen,
Viding/Invitato). Tamu sudah terbiasa dengan alur ini, jadi semua tema reguler mengikutinya.
Pembeda antartema ada di **seni, warna, huruf, ornamen, sampul, panggung pembuka, dan varian
bagian**, bukan di urutan bagian. Tema Spesial (adegan 2D/2.5D) tetap memakai bab adegan sendiri.

Kode: `src/themes/kit/standardSections.tsx` (bagian), `Cover.tsx` (sampul),
`standard.tsx` (navigasi bawah, tombol musik, lightbox, ornamen tepi, panel desktop),
`src/components/layout/DesktopInvitationWrapper.tsx` (tata letak desktop).

## Alur bagian (tema reguler)

| # | Bagian | Isi wajib |
|---|---|---|
| 1 | Sampul | foto berbingkai bentuk tema, judul kecil, nama mempelai, tanggal, "Kepada Yth." + nama tamu di antara dua garis, catatan salah tulis nama, tombol buka dengan ikon |
| 2 | Pembuka (hero) | panggung 2.5D tema, nama masuk bertahap setelah kamera turun |
| 3 | Kutipan | foto berbingkai + ayat/kutipan + sumber |
| 4 | Mempelai | foto berbingkai, nama panggilan (skrip), nama lengkap, "Putra/Putri dari" + orang tua, tombol Instagram |
| 5 | Save the date | pita foto layar penuh, hitung mundur 4 kotak kaca, tombol simpan tanggal |
| 6 | Acara | per acara: nama, baris tanggal klasik (HARI · tanggal besar · BULAN TAHUN), jam, tempat, alamat, tombol lokasi + kalender; siaran langsung bila ada |
| 7 | Kisah | garis waktu: chip tahun, foto (bila ada), judul, cerita |
| 8 | Galeri | masonry / kisi dengan foto utama / pita geser; lightbox dengan sebelumnya/berikutnya, penghitung, geser |
| 9 | Amplop digital | kartu rekening (nama bank, chip, nomor, pemilik) + tombol salin; alamat kado terpisah |
| 10 | RSVP | nama, kehadiran (radio), jumlah tamu, ucapan; validasi di tempat dengan pesan yang jelas |
| 11 | Ucapan | ringkasan Hadir / Tidak hadir / Masih ragu + daftar ucapan |
| 12 | Penutup | pita foto layar penuh, terima kasih, "Kami yang berbahagia", nama, keluarga |
| — | Tiket tamu, footer | di dalam kolom undangan |

Navigasi: pil mengambang di bawah (Beranda, Mempelai, Acara, Galeri, Hadiah, Ucapan) yang
menandai bagian aktif; tombol musik bundar di kanan bawah.

Desktop (≥ 1024px): foto pasangan berganti pelan di kiri dengan nama + tanggal memakai huruf
tema, undangan 430px di kanan.

## Aturan visual

- Skala huruf: label 12px huruf kapital renggang · isi 15/1.75 · judul skrip 46 (display 34) ·
  nama 48–56 · tidak ada teks isi < 12.5px.
- Jarak bagian 88px, lebar isi maks 400px, kartu radius = `radius` tema, tombol ≥ 44px.
- Ornamen hanya di **tepi bagian** (`ornament`: `flora` lukisan bunga, `line` = `cornerSvg`,
  `none`). Dilarang menempel bunga di kartu, foto, atau di atas teks.
- Pita latar `surface` untuk Acara & Amplop agar ritme halaman berselang-seling.
- Tombol: ikon garis + teks, keadaan hover/aktif/fokus (`.kit-press`), kontras ≥ 4.5:1.
  Tombol sampul otomatis memakai warna kedua bila warna utama terlalu dekat dengan latar sampul.
- Foto selalu `object-fit: cover` dengan fokus wajah (`center 25–30%`).
- Gerak: hanya `transform`/`opacity`, kurva `cubic-bezier(.22,1,.36,1)`, hormati
  `prefers-reduced-motion`.

## Pembeda tiap tema (wajib diisi)

`palette` + `variants`, `fonts`, `cover`, `frame`, `hero`/`Stage`, `couple`
(`cards`/`split`), `events` (`cards`/`timeline`/`ticket`), `gallery`
(`masonry`/`grid`/`film`), `ornament` + `floraArt`/`cornerSvg`, `ambient`, `pattern`, `copy`.
Dua tema yang berurutan di katalog tidak boleh sama di `cover` + `hero` + satu varian lain.

## Aplikasi (landing, auth, dashboard)

Mengikuti `elayadesign/ai-design-skills` → `landing-page-design` Part B: satu typeface
(Manrope), heading semibold tanpa italic, judul hero bergradasi teks #000 → #666, kalimat inti
yang menyala kata per kata, tanpa tanda hubung di copy, latar datar, kurva gerak
`cubic-bezier(0.22,1,0.36,1)`. Token ada di bagian akhir `src/index.css`.

## Mode kamera (tema Spesial gaya "undangan seret")

`ThemeSpec.camera` → satu dunia memanjang berlapis (0 = jauh, 1 = dekat) yang dilewati kamera.
Isi bagian = panel kertas melayang; di jeda antarbagian kamera berjalan ke stasiun berikutnya.
Wajib: semua posisi kamera di antara stasiun tetap berupa dunia yang utuh (tidak ada ruang kosong
atau ganti latar), karakter 2.5D digerakkan dari posisi kamera (bukan waktu) sehingga setiap posisi
gulir punya pose pasti. QA: lembar kontak ≥ 30 posisi gulir merata, bukan hanya stasiun.
Contoh: `catalog/storybook.tsx` + `storybook.world.tsx` + `storybook.couple.tsx`.

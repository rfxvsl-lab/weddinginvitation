# B — perbaikan navigasi Sehari, Selamanya

## Asal dan keadaan yang diamati

26 November 2026 (WIB). Pemilik sebelumnya mengotorisasi satu tema baru dan mempertahankan tema lama. Pemeriksaan GitHub: PR20 digabung pada 23:40:53 WIB, main `7fcb1aecef81d8edec10f90213b3f16557211ee6`; B tidak melakukan merge/deploy. Head496b61c memiliki Vercel success dan komentar Ready (22:59:43 WIB). Kegagalan preview lama tidak lagi status terbaru. Preview branch tetap meminta login Vercel; halaman publik `https://www.ruanghadir.net/preview/sehari-selamanya` sudah menampilkan tema.

## Reproduksi browser nyata

CUA Chrome desktop 1363×936, kolom iframe 430px. Sampul terlihat, foto dan CSS termuat. Klik Buka menampilkan hero dan menu Mempelai/Acara/Kehadiran; fokus berpindah ke hero. Klik Mempelai ternyata menavigasi iframe dari about:srcdoc ke URL halaman induk dengan #sehari-couple. Snapshot berikutnya memperlihatkan wrapper halaman dan iframe baru bersarang, sampul muncul ulang. Screenshot terlihat tombol Kembali kedua di kolom kanan. Ini FAIL nyata, bukan asumsi visual dari build.

Percobaan membaca contentDocument dari halaman induk menghasilkan null dan frameLocator target timeout setelah navigasi; tidak memakai nilai tersebut sebagai bukti overflow0. Tidak ada QA mobile fisik atau rekaman scroll lengkap. Screenshot diamati pada hasil tool, belum disimpan sebagai artefak repo. Tidak mengubah data produksi atau mengirim RSVP saat reproduksi.

## Perubahan yang dibatasi

Scope diumumkan di room182. Branch `codex/sehari-frame-navigation` dari main7fcb1ae. Hanya renderer tema Sehari, tesnya, dan catatan ini.

Semua tiga tautan bagian kini memanggil handler yang mencegah navigasi default dan mencari target pada **ownerDocument milik tautan yang diklik**, lalu scrollIntoView dengan behavior auto/block start. Tidak memakai document halaman induk, tidak mengubah hash/URL/frame src, tidak mengubah wrapper iframe atau tema lain. Bagian existing sudah mempunyai scroll-margin agar tidak tertutup menu sticky. Target yang tidak ditemukan tetap tidak menavigasi ulang iframe. Gerak instant juga tidak menambah masalah reduced motion.

## QA

- Tes regresi baru menjalankan handler komponen React sebenarnya untuk ketiga link dengan ownerDocument uji yang berbeda dari parent; memastikan preventDefault, ID target benar, scroll target, dan target hilang aman.
- RED pada renderer sebelum fix: `fragment links must intercept srcdoc navigation` (handler undefined), exit1 Node22.23.5.
- GREEN setelah fix: script check-sehari-theme.mjs lulus, termasuk tes RSVP/data/kontras sebelumnya. `npm run lint` lulus.
- Build standar Next16.2.9 Turbopack pada Node22.23.5 PASS exit0; TypeScript/generasi halaman lulus. Warning payment belum dikonfigurasi dan sitemap DB lokal tanpa tabel tetap seperti putaran sebelumnya. Generated next-env dipulihkan; manifest/lockfile dan konfigurasi tetap.
- Tes handler dengan document stub bukan browser iframe nyata. Verifikasi klik ketiga menu pada deployment perbaikan tetap diperlukan; jangan mengklaim perbaikan sudah live atau lulus browser hanya karena tes hijau.

Tidak menggabungkan PR sendiri, tidak deploy produksi. Main yang sudah dirilis oleh aktor lain hanya dibaca. Kualitas visual seluruh bagian serta ukuran mobile/reduced motion/gesture tetap backlog pengujian nyata, bukan dianggap selesai dari perbaikan navigasi ini.

## QA publik lanjutan — 27 November 2026

Repo/main tetap7fcb1ae; PR21 head6fa694a masih open/draft dan komentar Vercel
menyatakan Ready. Ini bukan bukti PR21 sudah dirilis ke halaman publik. B memakai
halaman demo publik versi main untuk melanjutkan QA fitur yang tidak diubah oleh
fix navigasi. Menu anchor tidak diklik ulang; tidak menganggap hasil ini sebagai
QA browser atas handler PR21.

Lingkungan CUA Chrome desktop1363×936, iframe430px. Pemeriksaan nyata:

- Buka sampul, lalu scroll biasa ke profil, acara, galeri, RSVP, dan penutup. Screenshot
  diamati pada tool untuk profil/acara/galeri/modal/RSVP/penutup; tidak disimpan
  sebagai artefak repo dan bukan rekaman penuh alur scroll.
- Galeri foto1 terbuka; Berikutnya mengubah foto/counter menjadi2/9; Sebelumnya
  kembali1/9. Tombol Tutup berfungsi. Escape pada pembukaan terpisah menutup
  dialog dan fokus kembali ke tombol Lihat foto1, tanpa kembali ke sampul.
- Disclosure tanda kasih terbuka dan memperlihatkan dua rekening serta alamat;
  klik Salin nomor menampilkan status Nomor berhasil disalin. Isi clipboard tidak
  dibaca kembali, jadi status UI dibuktikan, bukan perbandingan byte clipboard.
- Isi nama QA RuangHadir dan ucapan uji pada halaman demo, Kirim ucapan menampilkan
  status penerusan serta item ucapan, lalu mengosongkan textarea. Reload dan buka
  lagi membuktikan ucapan uji hilang. Ini state demo React, bukan bukti simpan
  RSVP ke DB produksi. Tidak memanggil validasi tiket atau mengirim data tamu nyata.
- Pembacaan DOM lewat frameLocator pada iframe berjudul Undangan pernikahan:
  width430, body.scrollWidth−clientWidth=0. Foto Salsa complete=true, naturalWidth1600,
  kotak180.703125×280. Tidak ada img complete dengan naturalWidth0 pada pemeriksaan
  setelah interaksi. Ruang foto yang sempat kosong tidak diklaim bug CSS permanen.
- Penutup terlihat; GuestPass existing masih membawa gaya visualnya sendiri.
  Keselarasan visual tambahan tersebut perlu review terpisah, bukan dinyatakan
  tuntas hanya karena tema baru terbaca.

Batas tersisa: browser pada deployment PR21, seluruh ukuran mobile/fisik, gesture
ZoomLock, reduced-motion, data ekstrem di browser, screenshot tersimpan, rekaman
scroll penuh, kegagalan clipboard di browser, dan jalur RSVP backend. Tidak ada
perubahan source untuk hasil QA ini; build/tes kode tidak diulang. Tidak merge/deploy.

## Perbaikan CSS berdasarkan bukti tersimpan — 27 November 2026

Scope awal room186, perluasan room187 setelah bug nyata terlihat. Main tetap7fcb1ae,
marketing-refinement2de4d84; PR21 masih draft head23d7a43 sebelum putaran ini.
A belum mengirim pesan baru. Tidak menganggap tidak ada balasan sebagai review A.

Delapan screenshot asli disimpan pada [indeks bukti](evidence/sehari-2026-11-27/README.md),
beserta ukuran dan hash. Ini versi publik sebelum fix; menutup kekurangan bukti
tersimpan, belum menutup kebutuhan rekaman seluruh alur atau viewport mobile.

Temuan browser: tombol Validasi dalam GuestPass lebar92px, padding12px20px dan
font15px/26.25px, padahal kelas komponennya meminta text11px dan px4. Teks terbelah
Validas/i. Selector `.theme button` dan reset font/headings yang mempunyai specificity
lebih tinggi daripada utility class masuk ke subtree extras. Screenshot RSVP juga
membuktikan tombol musik fixed menutupi sisi kanan tombol Kirim ucapan; pada profil
kontrol yang sama menutupi narasi. Ini bukan dianggap masalah warna saja.

Perbaikan terbatas pada renderer/CSS tema Sehari dan tesnya:

- Reset elemen generik mengecualikan `.extras` dan seluruh turunannya memakai
  `:not(:where(...))`; utility styling GuestPass tetap memiliki kontrol terhadap
  padding, font, heading dan gambar. File GuestPassSection tidak diedit.
- Musik berada dalam flow bar navigasi sticky bersama tiga link, menggantikan
  floating fixed di bawah. Handler audio dan teks putar/jeda tetap; tidak menambah
  ikon. Area form tidak lagi menjadi tempat overlay kontrol musik dalam kode.
- Tes React memastikan kontrol musik benar-benar ada di nav, dengan aria-pressed
  dan labelnya. Tes navigasi ownerDocument serta RSVP sebelumnya tetap dijalankan.

QA selector terpisah memakai PostCSS existing dan linkedom0.18.15 dari registry npm,
dipasang hanya ke `/tmp/ruanghadir-selector-qa`, tanpa manifest/lockfile produk.
Fixture berisi own form serta subtree extras dengan h3/p/input/button/img. Sebelum:
20 pasangan rule/elemen extras cocok; sesudah:0. Tujuh rule reset tetap cocok ke
own tombol form. Engine tidak mendukung pseudo focus-visible; percobaan pertama
berhenti pada unsupported pseudo, lalu uji scope dijalankan dengan pseudo state
focus-visible/disabled dianggap aktif (dihilangkan dari selector untuk matching).
Ini verifikasi batas selector, bukan layout browser, fokus nyata, atau ukuran tombol
sesudah fix. Glyph panah kotak masih dicatat sebagai batas investigasi, font tidak diganti.

Tes komponen pada Node22.23.5 PASS; npm run lint PASS. Guard product-boundaries
masih FAIL terhadap baseline04a52ec yang melindungi tema: guard tidak dilemahkan.
Perubahan tema baru ini mengikuti izin eksplisit terbaru pemilik. Screenshot adalah
pre-fix; browser pada deployment fix, mobile, reduced-motion/gesture, rekaman penuh,
serta backend RSVP tetap belum diverifikasi. Tidak merge/deploy produksi.

Build Next16.2.9 Turbopack dengan Node22.23.5 juga PASS exit0 pada putaran CSS ini,
termasuk TypeScript dan33 halaman. Env lokal saat ini tidak menyediakan DB maupun
payment: peringatan sitemap Database client not initialized dan payment belum
terkonfigurasi tercatat; bukan uji endpoint/integrasi produksi. Generated next-env
dipulihkan. Package manifest/lockfile tidak berubah.

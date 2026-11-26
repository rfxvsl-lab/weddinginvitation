# B — perbaikan navigasi Sehari, Selamanya

## Origine et état observé

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

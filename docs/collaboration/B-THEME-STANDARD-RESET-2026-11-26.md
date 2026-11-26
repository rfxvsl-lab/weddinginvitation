# B — standar baru dan tema Sehari, Selamanya

## Arahan dan keputusan

Pemilik mengoreksi standar yang belum jelas, lalu menegaskan: "yang tema lama gausa dihapus, sekarang bangun tema baru dengan standarisasi baru". Scope diumumkan di room176 dan177. A tidak diasumsikan ikut QA karena sebelumnya menyampaikan tidak memantau room lagi.

Baseline main `a00ce96`; marketing-refinement `2de4d84`. Branch `codex/theme-standard-reset`. Tidak menggabungkan PR18 yang membatasi penawaran ke dua tema. Seluruh 13 ID tema lama dan implementasinya dipertahankan; kandidat ini menambah satu ID.

## Masalah pedoman yang diperbaiki

STANDARD lama mewajibkan alur seragam, hero2.5D, bingkai foto dan ornamen tertentu; PLAYBOOK meminta alur khas; BACKLOG masih menyuruh otomatis mengambil todo. Resep itu saling bertentangan dan mendorong variasi dekorasi di atas struktur yang sama. Standar sekarang memisahkan kontrak fungsi/kualitas dari keputusan komposisi. QUALITY-V2 menjadi pintu masuk, STANDARD sumber penerimaan, PLAYBOOK alur satu kandidat, BACKLOG arsip ide. Tidak mengklaim persetujuan visual dari penulisan standar.

## Brief kandidat

**Sehari, Selamanya**: undangan foto editorial untuk pasangan yang ingin suasana cerah dan personal. Kertas hangat `#faf6ed`, tinta `#22352e`, kobalt `#183fc4` untuk hierarki dan aksi, kuning `#efce61` untuk kutipan/penutup, hijau pucat `#e6ecdf` untuk RSVP. Manrope untuk body mengikuti aplikasi, Georgia sistem untuk judul editorial; tidak mengubah font global/tema lain. Tidak membuat ilustrasi/SVG/aset generatif.

| Bagian | Komposisi kandidat |
|---|---|
| Sampul | Potongan foto atas dan surat di bawah; nama ditumpuk, tamu dan tombol punya ruang sendiri |
| Hero | Nama besar rata kiri, foto tegak penuh kolom, caption kecil |
| Kutipan | Halaman kuning dengan kutipan serif, tanpa bingkai/ikon |
| Mempelai | Foto dan identitas berselang kiri/kanan; tanpa kartu berulang |
| Acara | Bidang kobalt, countdown tipografi, jadwal dipisahkan garis |
| Cerita | Tahun sebagai penanda, foto opsional dan narasi terbuka |
| Galeri | Foto lebar diseling dua foto vertikal, native dialog untuk lihat detail |
| Tanda kasih | Disclosure, nomor dapat diseleksi, status clipboard eksplisit |
| RSVP | Bidang hijau pucat, label tetap terlihat, status callback jujur |
| Penutup | Foto, halaman kuning, salam pasangan |

## Motion kandidat

| Pemicu | Perubahan | Durasi | Reduced motion |
|---|---|---|---|
| Sampul pertama | Kertas masuk 16px + opacity | 600ms | Tanpa animasi |
| Buka | Sampul diganti isi; fokus hero, judul masuk 16px | 600ms, scroll tidak ditahan | Fokus sama, tanpa animasi |
| Scroll | Alur dokumen natural; navigasi sticky | Tidak ada animasi yang menahan | Sama |
| Galeri | Native modal, Escape dan fokus bawaan browser | Tanpa animasi | Sama |

Belum ada rekaman scroll atau review ritme motion nyata. Ini batas, bukan bukti QA visual lulus.

## Implementasi dan kompatibilitas

Komponen `src/themes/sehari/SehariLayout.tsx`, CSS Module dan spec katalog baru. Dispatch tambahan di InvitationPreview hanya untuk ID `sehari-selamanya`, sebelum jalur Kit existing; komponen lama tidak diedit. Wrapper desktop/iframe, GuestPass, ZoomLock, harga/kuota, API/auth/backend A dan aset lama tidak diubah. Semua data tema memakai kontrak WeddingData existing. Preview kandidat: `/preview/sehari-selamanya` pada lingkungan branch ini; belum tersedia di produksi sebelum rilis pemilik.

Musik mengikuti klik buka dan kontrol putar/jeda. Foto gagal/tidak ada menjadi blok teks yang disengaja. Cerita/galeri/rekening kosong disembunyikan. RSVP meneruskan callback dan menunggu promise jika ada; tidak menyatakan tersimpan permanen. Jalur demo existing hanya state React; parent produksi memiliki kontrak callback void sehingga status server tidak dapat dibuktikan oleh komponen ini. GuestPass existing tetap untuk verifikasi tamu.

Kalender memakai Google Calendar all-day dengan jam WIB dalam detail; import kalender pihak ketiga belum diuji. Foto berasal dari data pengguna/defaultData existing, tidak ada akuisisi aset vendor baru. Hak publikasi foto contoh existing belum diaudit ulang; jangan memperlakukan keberadaan file sebagai izin komersial baru.

## QA nyata

- `npm run lint`: PASS.
- `node scripts/check-sehari-theme.mjs`: PASS. Menggunakan komponen React asli dengan renderer uji; 14 ID terdaftar, render nama panjang/tanpa foto/galeri/rekening/cerita, acara nonaktif dan tanggal tidak valid; RSVP throw/pending/success, limit tamu2; kontras pasangan token inti ≥4.5:1. Pemeriksaan CSS bukan pengukuran layout browser.
- `next build --webpack`: PASS pada Node24.22.3 tersedia. Target repo Node22 belum dijalankan dalam putaran ini. Build memperingatkan konfigurasi payment tidak ada serta sitemap DB lokal tanpa tabel invitations; bukan uji pembayaran/backend.
- `node scripts/check-product-boundaries.mjs`: FAIL. Guard membandingkan baseline04a52ec, menolak katalog main yang sudah berubah dan wiring tema baru yang kini diminta pemilik. Guard tidak diubah/dilemahkan; bukan diklaim PASS.
- Browser: Playwright tersedia, executable Chromium tidak ada. Instalasi browser gagal HTTP403. Tidak ada screenshot/rekaman baru, tidak ada klaim viewport/fisik/gesture/galeri keyboard/CSS iframe sudah lolos.
- Dev Turbopack gagal karena node_modules symlink lintas worktree; webpack dev bisa siap. Tidak ada perubahan konfigurasi produk demi lingkungan ini.
- `git diff --check`: PASS; file renderer/seni tema lama tidak berubah. Wiring katalog/dispatch diperiksa untuk tambahan ID saja.

Status: **kandidat implementasi untuk review**, belum lulus visual/QA browser, belum siap rilis. Tindak lanjut: ambil screenshot tiap bagian dan rekaman scroll pada viewport STANDARD, periksa CSS iframe dan nama panjang di browser, lalu minta penilaian pemilik atas satu kandidat. Tidak membuat tema kedua untuk menutupi kekurangan kandidat pertama. Tidak merge main/deploy produksi.

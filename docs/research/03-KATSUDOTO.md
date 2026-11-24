# 03 — Katsudoto

Pemeriksaan publik ketiga dimulai setelah catatan Wedew dan Viding. 24 November 2026. Pengembangan permintaan menambahkan audit source tema; pass lanjutan demo dilakukan lagi dalam urutan lima target.

## Bukti langsung

- **K-UI-01:** https://katsudoto.id/undangan-website dibuka di browser, screenshot hero dan struktur seluruh halaman diperiksa. Terlihat header gelap, bidang kuning pucat, aksen merah/pink, ilustrasi cincin, dan contoh undangan dalam perangkat.
- **K-UI-02:** menu “Rencanakan Pernikahan Kamu” dibuka. Dropdown memperlihatkan Undangan Website, Buku Tamu Digital & QR, dan Wedding Planner. Pengelompokan berdasarkan produk/tugas, bukan daftar seluruh fitur.
- **K-PUB-01:** halaman yang sama menjelaskan pengisian data pasangan/acara, batas akhir RSVP, galeri, hadiah, live streaming, tiga jalur input tamu (manual/impor/form), reminder, dan penataan urutan bagian. Screenshot editor adalah materi demonstrasi vendor; peneliti belum mencoba editor akun privat.
- **K-REA-01:** source `https://katsudoto.id/src/landing/new/web-invitation.1795518648.js` diunduh dan dianalisis REA `6.10.1`. SHA-256 `9f6e4ac3e91bb54c6566196945100cd48be6b6f69b67efc0e2afd0516b7afbe2`; evidence induk `ev_1e7547d4777c0864bd6d46348c2bc28e82744c3f8cf5728b8a8af3a5ecca991d`.

## Pembongkaran implementasi publik

Pembacaan source terpilih menemukan pemeriksaan viewport 560/1080px, konfigurasi AOS, fungsi penyesuaian tinggi terhadap navbar, GSAP/ScrollTrigger, Swiper, pengelolaan scroll, dan fungsi animasi ilustrasi cincin. AOS dikonfigurasi `once: true`, offset 10, durasi 400ms. Fungsi `applyDoughnutRepeatAnimation` menggunakan keyframe rotasi/skala dengan repeat/yoyo. Ini observasi source pada halaman marketing, bukan implementasi tema undangan atau dashboard.

REA memeriksa satu dari delapan sumber dalam artefak lokal. Sintaks dan pemeriksaan sumber terpilih complete; cakupan aplikasi/semantik tetap partial dan tujuh sumber tidak diperiksa. Tidak ada kode pihak ketiga dieksekusi oleh analisis statis. Screenshot browser membuktikan halaman dirender; source statis sendiri tidak membuktikan semua cabang animasi berjalan.

## Keputusan RuangHadir

| ID | Pelajaran | Implementasi | Prioritas / status |
|---|---|---|---|
| K-01 | Produk dibagi menurut pekerjaan nyata | Navigasi sederhana: undangan, tamu/RSVP, hari H; akun dan Enterprise ditempatkan terpisah | P1 redesign |
| K-02 | Demonstrasi editor lebih konkret dari slogan | Marketing memperlihatkan panel kerja dengan anotasi singkat, data ilustrasi berlabel | P1 redesign |
| K-03 | Input tamu bukan cuma mengetik satu-satu | Rancang impor terverifikasi dan form pengumpulan data sebagai pekerjaan domain tersendiri | P2 backlog |
| K-04 | Batas akhir RSVP membantu persiapan catering | Tambah `rsvpDeadline` dan aturan perubahan jawaban pada roadmap | P2 backlog; belum mengubah schema |
| K-05 | Kontrol urutan/font/warna berguna jika dibatasi tema | Pisahkan data acara dari konfigurasi visual dan simpan preferensi per tema | Pedoman tema berikutnya; preview existing dilindungi |
| K-06 | Animasi memakai ukuran navbar dan container scroll nyata | Pada UI aplikasi gunakan state dan container yang jelas; hindari smooth scroll yang menunda akses form/tabel | P1 redesign |
| K-07 | Karakter ceria berasal dari arah visual yang konsisten | RuangHadir memakai warna ceria dengan font saat ini; hindari menyalin pink dan cincin dekoratif vendor | P1 desain |
| K-08 | Halaman sangat panjang dapat menyembunyikan informasi penting | Landing RuangHadir menempatkan demo, manfaat, harga, dan bantuan dalam urutan ringkas | P1 redesign |

## Batas kualitas yang tidak diadopsi

Jangan menganggap GSAP, Swiper, atau SVG otomatis menghasilkan kualitas. Source tersebut membuktikan teknik yang digunakan pada sampel; kualitas tetap dinilai dari komposisi dan keterbacaan. Jangan menyalin seluruh dependensi untuk mengulang animasi marketing. Harga custom/Gratis RuangHadir dan keluarga font tetap dijaga.

## Belum terverifikasi

Dashboard privat, reminder WA runtime, peran tim, validasi RSVP backend, pengiriman hadiah, serta seluruh tema. Angka klien/testimoni adalah klaim vendor dan tidak dipakai untuk klaim RuangHadir.

## Pass lanjutan — tema Bianca

**K-DEMO-01:** katalog resmi https://katsudoto.id/desain/ diperiksa lagi setelah konten dinamis muncul. Sampel Bianca dipilih dari tautan Lihat Preview yang benar-benar ditampilkan: https://biancamark.katsudoto.id/736184. Ini demo yang dirujuk katalog, bukan akun privat yang dipilih secara acak.

Desktop memperlihatkan komposisi terbagi: sisi kiri memiliki nama, lampu gantung, meja jamuan dan tanda wedding; sisi kanan berisi foto pasangan berbingkai pita. Garis ilustrasi, bentuk pita, serta aksen lilin dipakai sebagai satu bahasa seni yang konsisten. DOM juga memuat countdown, pasangan, galeri, acara, dresscode dengan swatch, live stream, dan rundown. Percobaan klik link Open Invitation tidak menemukan elemen pada keadaan berikutnya; alur pembukaan tidak ditandai teruji sukses.

**K-DEMO-SRC-01:** source tema yang dirujuk DOM diambil:

- `https://biancamark.katsudoto.id/public/dist/adba27e9.js` → SHA-256 `bc1f00690058c201d1edf16ae08fb1f381eac37b52bab3456cda9e50734deb1d`.
- `https://biancamark.katsudoto.id/public/dist/0de91a79.css` → SHA-256 `15bf6e37cc41bd68db83a5c3734fa4461383bdd20d3b9f112a7d2fec57c583b3`.
- REA evidence induk `ev_d275b66b466f0cc762c35143507d1a9afd3ebad96269c54f8bc73f75e257c260` menganalisis JS tersebut secara statis.

Script terpilih berisi `init_rundown` yang menyesuaikan jumlah fragmen SVG terhadap tinggi agenda dan memasang handler resize, serta `init_rundown_pour_animation` dengan pemeriksaan ketersediaan API anime. Ini contoh ornamen yang terhubung dengan isi aktual, bukan SVG dekoratif yang ditempel sama di semua kartu. DOM merujuk dependensi galeri, slider, GSAP, dan anime; ini tidak mengharuskan RuangHadir menambah dependensi yang sama.

Beberapa alt/nama foto demo mengandung teks “ChatGPT Image ...”. Ini observasi metadata, bukan verifikasi asal seluruh aset. Karena itu, jangan mengasumsikan semua seni kompetitor digambar manual atau memakai reputasi vendor sebagai bukti asal aset. RuangHadir tetap mengikuti larangan aset generatif dalam pekerjaan ini.

**Keputusan:** standar tema berikutnya perlu menguji koherensi seni lintas bagian, komposisi desktop/mobile, dan ornamen yang merespons panjang isi. Dresscode/rundown masuk roadmap data, bukan diaktifkan hanya lewat label UI. Tema existing tetap dilindungi.

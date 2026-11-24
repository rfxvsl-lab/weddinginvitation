# Bukti, cakupan, dan QA

Tanggal: 24 November 2026. Baseline aplikasi `04a52ec`.

## Paket bukti publik

Website riset privat menyediakan `evidence.zip`: 179 file, 10.280.216 byte, SHA256
`4ded201f15653cfb6c2530c7e88c2ce656df74ce66e2bc568da3a2ed3250fdb8`.
Arsip berisi sampel HTML/JS/CSS, manifest akuisisi, output REA, dan manifest SHA256 per file.
Kode/aset kompetitor tidak dimasukkan ke aplikasi produksi. URL dan sumber terpilih dicatat
di laporan 01–05. Arsip adalah bahan pemeriksaan publik, bukan source lengkap backend mereka.

REA CLI yang dipakai: `rea-agents@6.10.1`. Contoh analisis terarah:

```bash
npx -y rea-agents@6.10.1 analyze-javascript-application /path/sampel \
  --source-path inline-05.js --analysis-timeout-ms 30000 \
  --detail summary --evidence_output /path/evidence.json --json
```

Sampel awal chunk framework/polyfill Wedew dan Viding tidak membuktikan logika produk.
Laporan menandai keterbatasan ini. Pass lanjutan membaca source kalender Wedew, app tema
Mulyo, tema Bianca, helper parallax OWL, dan countdown/navigasi WebNikah yang relevan.
Tidak ada login privat, pembelian, pengiriman pesan/RSVP, atau pemakaian data pelanggan sungguhan.

## Pemeriksaan aplikasi yang sudah lulus

- `npm run lint`: TypeScript tanpa error.
- `npm run build`: Next berhasil kompilasi, pemeriksaan tipe, dan menghasilkan 31 halaman statis.
  Build juga diulang dengan Node 22 sesuai `engines` repo dan lulus.
- `node scripts/check-product-boundaries.mjs`: diff file preview/tema/aset/paket/ZoomLock kosong;
  root layout hanya menambah import CSS; deklarasi font dan viewport sama; rule CSS produk scoped.
- Script yang sama menguji event pinch/gesture, multi-touch, ctrl/meta wheel dan tombol zoom;
  scroll satu jari, wheel biasa, Ctrl+C dan panah tidak dicegah; pelepasan listener teruji.
- Browser pada **fixture komponen asli dengan data lokal**: ringkasan kosong/terisi, penghitung
  RSVP/tamu, progress 2/5 → 3/5, navigasi ke daftar tamu, tambah nama, dan pencarian kosong.
- Lebar iframe ringkasan 360, 390, 430, 1280 dan 1440: tidak ada overflow horizontal dokumen.
- Landing, auth, editor, tamu, analitik, profil, paket dan katalog: diperiksa pada lebar 360;
  tidak ada overflow horizontal dokumen. Tabel tamu memiliki scroller sendiri.
- Field nama tamu pada lebar 360: font 16px dan tinggi 44px. Hero dan screenshot tema milik repo
  diperiksa secara visual pada desktop dan mobile; tidak ada penggantian aset tema.
- Website riset: navigasi laporan, pencarian ledger (`tamu` → 3 dari 16 temuan), dan pemisahan
  dokumen/ledger bekerja dalam browser.

## Cara mengulang review UI

```bash
npm ci
npm run build
node scripts/check-product-boundaries.mjs
node scripts/review-product-ui.mjs /absolute/output-di-luar-repo/review
```

Script membuat halaman review dan adaptor khusus fixture. Komponen UI berasal dari source
branch; akun, server action, OAuth dan network diadaptasi/dinonaktifkan. Data di memori tidak
disimpan. Pilih layar dan lebar dari kontrol halaman. Ini sarana review visual/interaksi lokal,
**bukan** pengganti pengujian aplikasi dengan akun dan server sungguhan. Output juga menyalin
gambar publik ke direktori induk output untuk mempertahankan URL aset produk.

## Batas yang belum diuji

Publikasi website riset privat berhasil pada source `77004647fd027d87755b2d85cd32b0753d7e3d3c`.
Browser mengonfirmasi gerbang login ChatGPT pada URL terbit; isi setelah login tidak diklaim telah
diuji ulang di produksi. QA navigasi/ledger/review UI di atas menggunakan preview sebelum publikasi.

- Pinch pada perangkat fisik iOS/Android dan pengaturan aksesibilitas browser. Lock existing
  dipertahankan, bukan jaminan semua browser/OS selalu menolak zoom.
- Login/OAuth, Turso, penyimpanan editor, upload, scanner kamera, checkout/pembayaran, dan
  analitik server menyeluruh. Environment database/payment tidak dikonfigurasi; build memberi
  warning sitemap dinamis/payment, tetapi keluar dengan kode 0.
- Keyboard lightbox iframe (temuan ditunda), seluruh variasi tema, serta semua breakpoint setiap
  dialog. Harga/paket dan preview tidak diperbaiki diam-diam dalam PR visual ini.

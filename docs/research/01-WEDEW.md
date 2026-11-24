# 01 — Wedew

Pemeriksaan berurutan pertama, 24 November 2026. Status: selesai untuk lingkup halaman publik; dashboard setelah login belum diperiksa.

## Pertanyaan riset

Bagaimana layanan menyampaikan manfaat dari membuat undangan sampai hari H? Bagaimana menjelaskan perbedaan data tamu, pengiriman, dan petugas? Pola apa yang layak diterapkan tanpa mengubah harga/font/preview RuangHadir?

## Bukti dan urutan interaksi

- **W-UI-01:** membuka https://wedew.id/ melalui browser. Header memiliki Home, Portofolio, Harga, Tema, Blog; Login dan Daftar dipisahkan di kanan. Hero memiliki satu CTA utama. Screenshot internal diperiksa pada viewport desktop.
- **W-UI-02:** mengklik Harga dan memverifikasi perpindahan ke https://wedew.id/harga. Halaman membedakan paket dasar, paket acara, add-on, serta tautan kalkulator. Harga kompetitor hanya objek riset, bukan usulan mengganti harga RuangHadir.
- **W-UI-03:** mengklik FAQ “Apa yang dimaksud tamu undangan, whatsapp, dan app penerima tamu?”. Panel terbuka, atribut `expanded` berubah, dan paragraf penjelasan muncul di tempat tanpa modal. Kuota kode tamu, pengiriman WhatsApp, dan aplikasi petugas dijelaskan terpisah.
- **W-PUB-01:** https://panduan.wedew.id/memulai/membuat-akun menjelaskan onboarding dan dashboard. Ini dokumentasi vendor, bukan bukti bahwa peneliti telah login atau menyelesaikan onboarding.
- **W-REA-01:** REA CLI `rea-agents@6.10.1`, `analyze-javascript-application`, memilih `external-06.js` dari sampel HTML dan skrip publik yang diunduh via HTTP. Evidence induk `ev_9b5823cdd4033f10fac0b8494aa8e4fcd3d02694b4beca73e78299f6fbfc22c1`. SHA-256 sumber terpilih `12de1464b0ba67661cdf4925e5aec3001310d57e2646addfd7e43a2e2d33279d`.

## Hasil teknis dan batasnya

REA mem-parsing sumber inert; tidak mengeksekusi skrip. File terpilih berisi utilitas runtime/framework, bukan implementasi dashboard bisnis. Analisis sumber terpilih selesai, tetapi cakupan aplikasi **partial**: 49 file inventaris di luar seleksi dan chunk yang tidak diunduh tetap tidak diketahui. HTML publik memiliki chunk `_next`/Turbopack; ini indikasi delivery frontend pada halaman yang diperiksa, bukan bukti backend tertentu.

Artefak mentah sementara: `research-evidence/01-wedew/acquisition.json` dan `research-evidence/01-wedew-rea.json` di workspace riset. File pihak ketiga tidak dimasukkan sebagai source produk. Evidence ID dan digest di atas menjadi rujukan permanen di catatan ini; bundel mentah perlu disertakan dalam arsip riset untuk reproduksi lintas mesin.

## Pembongkaran alur produk

Landing menyusun penjelasan menjadi Website → Kelola Tamu → Kirim Undangan → Interaksi → Wedding Day. Pengelompokan itu menyampaikan siklus kegiatan, bukan sekadar tumpukan fitur. Foto/screenshot fitur menjadi penjelas, sedangkan testimoni dan portofolio menjadi bukti sosial. Angka penggunaan/testimoni di situs merupakan klaim vendor dan tidak dipindahkan ke RuangHadir.

Halaman harga memakai penjelasan progresif: paket lebih dahulu, biaya tambahan sesudahnya, kemudian FAQ istilah operasional. Definisi “tamu” tidak disamakan dengan jumlah pesan WhatsApp atau jumlah petugas.

## Keputusan untuk RuangHadir

| ID | Temuan dan dampak | Implementasi yang disarankan | Area | Prioritas / keputusan |
|---|---|---|---|---|
| W-01 | Siklus kerja membuat fitur mudah dipahami | Susun marketing menjadi Rancang, Undang, Sambut; tiap bagian memperlihatkan hasil konkret | Landing | P1, terapkan redesign |
| W-02 | Navigasi punya tujuan berbeda, CTA utama jelas | Pisahkan navigasi produk, masuk akun, dan CTA membuat undangan; menu tablet tetap tersedia | Header | P1, terapkan |
| W-03 | Gambar produk menjelaskan manfaat lebih baik dari ikon generik | Tampilkan contoh editor/daftar tamu berlabel ilustrasi, serta screenshot tema yang sudah ada | Landing | P1, terapkan tanpa mengubah preview |
| W-04 | Kuota tamu, pesan, petugas berbeda | Jelaskan batas paket RuangHadir sesuai konfigurasi; jangan mengadopsi paket berbayar kompetitor | Pricing/FAQ | P1, terapkan copy yang akurat |
| W-05 | FAQ istilah muncul tepat di halaman keputusan | FAQ ringkas tentang Gratis vs Enterprise, tautan tamu, publikasi, dan QR | Marketing | P1, terapkan |
| W-06 | Pengguna punya tahap persiapan berbeda | Dashboard tampilkan langkah berikutnya yang belum lengkap dari data nyata | Overview | P1, terapkan |
| W-07 | Pengiriman berbeda dari kedatangan | Pisahkan status distribusi, respons RSVP, dan check-in | Model tamu/API | P2, backlog fungsional terpisah |
| W-08 | Hari H membutuhkan petugas dengan tugas sempit | Mode resepsionis dengan scan/cari tamu dan hak akses terbatas | Dashboard/backend | P2, backlog; jangan mengklaim fitur peran tim sudah jadi |
| W-09 | Impor mengurangi input berulang | Impor CSV/Excel dengan pratinjau kolom, validasi nomor, dan deteksi duplikat | Tamu | P2, backlog |
| W-10 | Checkout/add-on menjelaskan skala | Pertahankan Gratis Rp0 dan Enterprise custom; cukup bedakan personal vs organisasi | Paket | Pertahankan model repo |

## Desain yang dipelajari dan yang tidak diadopsi

Terlihat: warna biru/kuning memberi karakter ceria, tipografi besar menjelaskan judul, header sederhana, FAQ memakai garis dan whitespace. Di RuangHadir, terapkan disiplin hierarki dan pengelompokan; keluarga font tetap Manrope. Hero Wedew memakai gradien dan bentuk dekoratif besar: tidak perlu diadopsi karena pengguna meminta ikon/dekorasi yang hemat dan UI matang. Gunakan contoh produk nyata sebagai komposisi utama.

## Yang belum dibuktikan

Keandalan WhatsApp massal, delivery receipt, role petugas, sinkronisasi real-time, validasi RSVP, keamanan/kinerja backend, dan dashboard privat. Dokumentasi/marketing saja tidak membuktikan implementasi runtime bagian tersebut.

## Pass lanjutan — source dan demo tema

**W-DEMO-01:** dari https://wedew.id/tema membuka detail **Sweet Luxury** (https://wedew.id/tema/detail/sweet-luxury), lalu demo resmi https://demo.wedew.id/?theme_preview=sweet-luxury. Daftar katalog yang awalnya terlihat berubah sesudah hidrasi; selektor Burgundy tidak lagi cocok, sehingga pemilihan sampel mengikuti keadaan UI terbaru, bukan menebak URL.

Komponen yang terlihat pada DOM demo: hero nama/tanggal, dua profil pasangan, cerita dengan carousel, galeri, countdown, acara/peta, video, RSVP dengan kode enam digit, ucapan, hadiah, dan vendor. Heading nama memakai Sofia 64px pada viewport desktop; subjudul Sofia 32px. Hero menyusun buket gambar raster sebagai kelompok di sisi kanan dan ruang teks di kiri. Ini alasan visual terasa terkomposisi, bukan karena memakai library tertentu.

Source HTML berisi blok `.website-block`, lapisan `.slots`, varian visibilitas per breakpoint (`d-lg-*`, `d-xl-*`), serta `data-aos` untuk fade/zoom dengan durasi/delay eksplisit. Stylesheet di-host pada `assets.wedew.id`, gambar pada `storage.wedew.id`; host aset berbeda dari host demo. Downloader awal mengecualikan host aset karena batas host yang sempit; dua bundle kemudian diambil berdasarkan URL yang benar-benar ditemukan pada DOM. Pemeriksaan menunjukkan bundle tersebut merupakan AutoNumeric dan modal-video, **bukan source seni tema**; tidak dijadikan bukti logika khusus tema.

**W-DEMO-REA-01:** konfigurasi inline kalender yang benar-benar ditemukan pada HTML (`inline-02.js`) dianalisis REA. Evidence induk `ev_0aba1723a2289e783029c9b6ac834aa750e6b0f5b8178aa789297735e3b6fdb5`. Script mendeklarasikan pilihan Google/iCalendar/Yahoo/Outlook dan label kalender. Ini bukti konfigurasi frontend; keberhasilan penambahan kalender belum diuji. Analisis HTML terpisah hanya memproses metadata, tidak diklaim sebagai rekonstruksi penuh source tema.

**Implikasi tema berikutnya:** pisahkan komposisi hero desktop/mobile secara sengaja; ornamen berfungsi membingkai ruang teks; variasi masuk tiap lapisan tidak boleh menutup nama/tombol. RuangHadir tetap mempertahankan desktop split existing sesuai permintaan pemilik, bukan menyalin layout penuh Sweet Luxury. Placeholder/foto contoh dan buket vendor tidak disalin.

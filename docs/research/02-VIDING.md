# 02 — Viding

Pemeriksaan kedua setelah laporan Wedew dicatat. Tanggal 24 November 2026. Selesai untuk lingkup katalog/interaksi publik dan sampel statis; studio setelah login belum diuji.

## Bukti dan interaksi

- **V-UI-01:** https://viding.co/id/template-design dibuka di browser. Keadaan awal menampilkan loading, kemudian katalog muncul. Dua jalur dijelaskan: Studio untuk kustomisasi bebas dan Template untuk pengisian cepat. Ini observasi UI penjelasan, bukan uji kemampuan editor berbayar.
- **V-UI-02:** mengisi pencarian “Mulyo”, membuka Filter. Dialog berisi kategori, tipe Studio/Template, dan Premium/Basic, serta Reset dan Apply Filter.
- **V-UI-03:** memilih Template dan Apply Filter. Jumlah filter aktif tampil `1`; pencarian mempertahankan “Mulyo”. Snapshot pascaaksi memperlihatkan dua hasil bernama Mulyo, masing-masing Studio dan Template, sementara dialog masih dalam transisi. Dengan bukti ini pencarian mempersempit hasil dan state filter terlihat; ketepatan hasil filter tipe belum dibuktikan, jangan mengklaim semua kombinasi bekerja.
- **V-PUB-01:** https://viding.co/id/faq/undangan-digital menjelaskan split sesi, kuota pendamping per tamu, editor elemen, dan table management. Ini klaim/dokumentasi vendor, bukan pengamatan dashboard privat.
- **V-REA-01:** sampel HTML/JS katalog diunduh tanpa login. REA `6.10.1` menganalisis satu chunk publik terpilih (`catalog-chunk.js`, URL asal `https://viding.co/_next/static/chunks/a6dad97d9634a72d.js`). Evidence induk `ev_6d4326ca642ad9208856f1740d3eeacccc123971ef2c49d580f31009a65ffd36`; SHA-256 `0973c1d64c88adc8e3c950410cb58b288f72118d5965b78049438deb8f2f9683`. Nama lokal chunk bersifat label akuisisi, bukan bukti bahwa semua isinya implementasi katalog.

## Alur dan mekanisme yang terlihat

Katalog membedakan niat pengguna sebelum memperlihatkan daftar: ingin cepat menggunakan template atau ingin menyusun desain. Pencarian dipisahkan dari filter terstruktur. Ada tanda jenis template dan akses premium pada kartu; detail desain memiliki tautan sendiri. Filter menggunakan tombol Terapkan sehingga pemilihan di dialog dan hasil katalog memiliki dua tahap.

Frontend halaman publik memakai chunk `_next`/Turbopack. Chunk terpilih berisi utilitas/polyfill URL umum; ini tidak membuktikan logika filter katalog. REA melaporkan 36 sumber, satu dipilih dan 35 tidak diperiksa. Pemeriksaan file terpilih `limited`; graph semantik `partial` dan `truncated` karena batas 20.000 node per file (100.000 agregat). Tidak ada alasan menaikkan batas untuk mengejar polyfill yang tidak menjawab pertanyaan produk. Jangan menyimpulkan model database, validasi server, keandalan WA, atau fitur editor privat dari kandidat statis tersebut.

## Keputusan implementasi RuangHadir

| ID | Masalah / pelajaran | Perubahan konkret | Cakupan | Keputusan |
|---|---|---|---|---|
| V-01 | Pengguna pemula tidak membutuhkan semua kontrol sekaligus | Editor berbasis kelompok data, bagian aktif jelas, bantuan dekat field, status simpan terlihat | Editor aplikasi | P1 redesign |
| V-02 | Katalog panjang sulit dipilih | Cari nama tema, filter kategori, jumlah hasil, reset yang jelas | Pemilih tema di dashboard | P1; kontrol aplikasi boleh berubah, render tema tetap dilindungi |
| V-03 | Identitas satu desain harus dapat dipreview tanpa diterapkan | Bedakan “Lihat contoh” dan “Gunakan tema”; pratinjau tidak langsung mengganti pilihan tersimpan | Pemilih tema | P1, validasi alur existing sebelum perbaikan |
| V-04 | Dialog filter menyimpan pilihan sementara | Saat memakai dialog, bedakan batal/reset/terapkan dan tampilkan filter aktif | Katalog/tabel | P1, adopsi pola state yang jelas |
| V-05 | Perbedaan quick-template vs studio menjelaskan tingkat usaha | Awali dengan editor data sederhana; kanvas bebas menjadi roadmap tersendiri | Produk | Backlog, bukan klaim editor drag-drop sudah ada |
| V-06 | Satu acara dapat memiliki beberapa sesi dan kuota pendamping | Rancang relasi event–session–guest dan otorisasi sesi dari server | Domain/API | P2, tidak diimplementasikan sebagai perubahan kosmetik |
| V-07 | Banyak kontrol visual belum menjamin tema khas | Pedoman tema harus memeriksa komposisi, seni khas, keterbacaan, dan gerak | Standar tema selanjutnya | P1 dokumen; tema existing tetap dibekukan |
| V-08 | Warna vendor tidak otomatis cocok untuk RuangHadir | Jangan menyalin dominasi fuchsia/pink Viding; gunakan palet ceria pilihan RuangHadir | Marketing/dashboard | Arahan pemilik, P1 |

## Temuan desain

Yang membantu: pilihan jalur pengguna dijelaskan dengan bahasa manfaat, screenshot produk mengurangi ketergantungan pada ikon, serta kontrol katalog dikelompokkan dalam satu toolbar. Yang tidak diadopsi: pink dominan, ikon dekoratif berulang, dan label promosi/emoji pada setiap pilihan. Manrope tetap dipertahankan, bukan menyalin font Viding.

## Batas

Tidak login, tidak mendaftar, tidak membuka checkout, tidak menguji WA, tidak mengubah data pengguna. Loading awal dan transisi filter tidak cukup untuk menyebut produk lambat/rusak secara umum. Belum ada pembandingan performa dengan kondisi jaringan/perangkat yang setara.

## Pass lanjutan — Mulyo, tema 167

**V-DEMO-01:** demo resmi https://viding.co/theme/preview/167 ditemukan dari kartu Mulyo. Keadaan awal masih loading; setelah data masuk, sampul menampilkan pasangan Vidi & Hening. Tombol Open the Invitation diklik. Pemeriksaan berikutnya membuktikan tombol sampul hilang dan tampilan desktop membagi hero foto/nama di kiri dan kolom undangan di kanan.

**V-DEMO-02:** DOM memperlihatkan lapisan `bg-1`, `bg-2`, `tree`, `gebyok-upper`, `frame`, `flower-*`, `corner`, dan `motif-ribbon`, serta galeri berpanel, RSVP, ucapan, hadiah, dan jadwal. Perbedaan kelas/aset menjelaskan pembagian lapisan; nama file saja tidak membuktikan keaslian seni atau cara pembuatannya.

**V-DEMO-SRC-01:** mengambil source publik yang ditunjuk DOM:

- JS: `https://themes.viding.co/theme_167/assets/js/app.js?v=8a8f89ab35a9c75e3a0b7e7ab384a0b6299992e8` (43.133 byte).
- CSS: `https://themes.viding.co/theme_167/assets/css/styles.css?v=741981201b3b013f02f71ad835bebfcb28016a56` (72.469 byte).
- REA `6.10.1`, evidence induk `ev_4037d36e002f1df18eb7b3b400c5461e15dffe4cbc86a758a2e5d924f06a707e`, memilih JS tema, bukan chunk framework katalog.
- SHA-256 JS `82c09b3b890c40dd487ecceb262fecdd291de0fd601878027416345679fc7b72`; CSS `9bfdb2289875300089b43e99e6bb9419b6a11a5bac53528ff6bf93c8404e1fde`.

Source mengatur status buka sampul lewat `.cover-opened`, menyembunyikan cover setelah transisi, memakai GSAP/ScrollTrigger untuk lapisan, serta magnificPopup untuk galeri. DOM juga menunjuk Splide, lazy loading, dan jQuery validation. Temuan ini adalah mekanisme frontend publik; validasi server RSVP belum dibuktikan.

**Keputusan standar RuangHadir:** pertahankan desktop split sesuai permintaan pemilik; tiap lapisan perlu peran ruang yang jelas (latar/jarak menengah/bingkai), bukan menabur buket di semua panel. Bedakan sampul, hero, isi, dan navigasi dalam state yang eksplisit. Galeri harus bisa ditutup/dinavigasi tanpa merusak posisi baca. Tidak perlu mengganti Motion yang sudah ada dengan semua dependensi vendor.

Source juga memanggil `navigator.geolocation.getCurrentPosition` untuk mencatat koordinat ke console. Ini tidak diadopsi: kebutuhan arah umum RuangHadir cukup melalui tombol Maps. Temuan ini tidak membuktikan koordinat dikirim ke server.

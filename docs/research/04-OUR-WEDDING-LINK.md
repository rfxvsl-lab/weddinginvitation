# 04 — Our Wedding Link

24 November 2026. Keempat pada urutan riset. Pemeriksaan mencakup landing, interaksi filter, demo Glass Wonder, serta sampel source publik. Dashboard privat belum diuji.

## Bukti langsung

- **O-UI-01:** https://our-wedding.link/ diperiksa di browser. Landing memakai hero foto besar, satu CTA membuat undangan dan CTA melihat desain; bagian berikutnya membahas desain, Studio, tamu, dashboard, dan hari H.
- **O-UI-02:** menekan filter Game mengubah `aria-pressed` dan menyisakan empat kategori desain yang relevan: Isometric Village, Javanese Game, Pixel Game World, Playful Playdate. Tautan lihat semua berubah menjadi `/design?style=game`. Ini interaksi filter yang benar-benar diamati.
- **O-PUB-01:** penjelasan Studio memperlihatkan screenshot berlabel panel Data Undangan, Layer, Aset, dan Riwayat Versi; halaman mengklaim drag-drop, kolaborasi, riwayat/pemulihan. Screenshot dan copy vendor tidak sama dengan uji editor privat.
- **O-DEMO-01:** tautan Glass Wonder di landing mengarah ke `/design/coba/royal-glass-castel`; HTTP downloader diarahkan ke https://our-wedding.link/design/glass-wonder. Browser demo diperiksa setelah script selesai: hero foto/nama di kiri, undangan pada kolom kanan, komposisi rumah kaca/taman/air mancur, navigasi bagian di tepi kolom.
- **O-SRC-01:** DOM yang sudah terhidrasi menunjuk chunk `_nuxt`, jQuery, masonry, typed.js, lax, WOW, smooth-scroll, Fancybox, `https://our-wedding.link/js/parallax.js`, serta stylesheet tema. Nama/deklarasi dependensi menunjukkan material frontend yang dimuat; tidak membuktikan semua API-nya dipakai oleh setiap bagian.

## Pembongkaran komponen

Demo memiliki kelompok profil pasangan, galeri/cerita, hitung mundur, acara, peta, RSVP lewat tombol, ucapan, hadiah, dan tautan siaran. Sebelum hidrasi selesai, DOM memperlihatkan data contoh yang kemudian berubah; membedakan server HTML awal dan UI final penting untuk menghindari kesimpulan dari placeholder.

Tema menggunakan seni taman dan struktur arsitektur yang menyambung secara komposisi. Background, hiasan, dan blok teks tidak harus menjadi kartu seragam. Kualitas tidak diambil dari banyaknya library; keputusan yang relevan adalah pemisahan fungsi data, seni tema, dan kontrol navigasi.

## Keputusan untuk RuangHadir

| ID | Temuan | Perubahan konkret | Keputusan |
|---|---|---|---|
| O-01 | Filter mempertahankan pilihan dan memberi hasil yang dapat dijelajahi | Filter kategori + jumlah hasil + reset; pertahankan pilihan saat kembali dari contoh | P1 katalog aplikasi |
| O-02 | Demo dan menerapkan tema merupakan langkah berbeda | CTA lihat contoh terpisah dari gunakan tema, dengan state pilihan aktif yang jelas | P1 aplikasi; render preview tidak diubah |
| O-03 | Riwayat dan pemulihan membuat editor lebih aman dipakai | Tampilkan status simpan dan akses riwayat yang sudah tersedia di repo secara jelas | P1 UI; uji backend tersendiri |
| O-04 | Data dan layer visual dijelaskan terpisah | Editor data menjadi jalur utama; kontrol seni mengikuti kemampuan tema, bukan semua opsi sekaligus | P1 UI / standar selanjutnya |
| O-05 | Dashboard memberi konteks tamu, meja, hadiah, dan versi | Overview RuangHadir fokus pada kesiapan dan respons nyata; operasi detail dipisah | P1 dashboard |
| O-06 | Versi undangan dan kolaborasi butuh model data | Role/collaboration/session variants masuk backlog domain; jangan menampilkan kontrol palsu | P2 backend |
| O-07 | Komposisi taman mempunyai ruang naratif | Pedoman seni tema harus menghubungkan cover, hero, isi, dan penutup | P1 dokumen tema selanjutnya |
| O-08 | Hero produk menjelaskan manfaat dengan gambar dan teks | Landing RuangHadir memperlihatkan hasil nyata, bukan klaim No.1/testimoni/angka tanpa bukti | P1 marketing |

## Yang tidak diadopsi

Pink dominan, font vendor, klaim pasar/angka pasangan, aset/foto vendor, dan seluruh dependensi JavaScript sekaligus. Harga dan font RuangHadir tetap sesuai repo/arahan pemilik. Data contoh pada demo tidak dianggap statistik asli.

## Batas

Tidak mengirim RSVP/ucapan/hadiah pada demo, tidak login, tidak membuat akun. Kemampuan kolaborasi live, impor Excel, WA terjadwal, serta payment tidak diuji. Pemeriksaan source bersifat sampel, bukan rekonstruksi seluruh frontend/backend.
## Tambahan bukti statis demo

REA memilih `parallax.js`, evidence `ev_3c91096a73e5b5278561ee783a1f039957e91d355821463a846e0725a111c02b`. SHA256 JS `8b5c6d6edf825ca8da44b31594a6a1f72f5069dcead189a1e2d47d8196d6babe`; CSS tema `d7e3f07d0a61da3a9dfa1624a6c95df7ccadc3b16fba30eb5f9e453abaaf2bcf`. Source aktual menghitung posisi elemen dari `getBoundingClientRect`, mengabaikan elemen di luar viewport, dan mengatur ulang tinggi/posisi saat scroll. Ini helper parallax publik, **bukan** source lengkap studio privat atau seluruh tema. Teknik yang relevan untuk standar tema baru adalah membatasi pekerjaan animasi pada elemen terlihat; tidak perlu mengimpor helper atau library kompetitor.

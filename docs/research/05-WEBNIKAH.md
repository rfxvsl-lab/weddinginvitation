# 05 — WebNikah

Pemeriksaan: 24 November 2026. Target kelima setelah laporan 01–04. Ini audit frontend publik, bukan akses dashboard pelanggan.

## Halaman dan interaksi nyata

- Produk: https://www.webnikah.com/webnikah — navigasi produk/tema/FAQ/testimoni, paket dan penjelasan fitur. Harga kompetitor hanya bahan riset; **bukan harga RuangHadir**.
- Demo Basic Premium: https://adirara.webnikah.com/?templatecoba=1/kepada:Budi%20dan%20Ani-Bandung
- Browser menampilkan nama penerima Budi dan Ani, kota Bandung, cover foto, tanggal, tombol Buka undangan, profil mempelai, akad/resepsi dan acara tambahan, video, peta Leaflet/OpenStreetMap, cerita, galeri, kado, doa/ucapan.
- Tombol Buka undangan diklik. Source handler memanggil `music()` dan animasi scroll ke anchor; ini berbeda dari transisi sampul berlapis pada Viding. Pengiriman RSVP/ucapan tidak dilakukan.
- Pada desktop demo ini memakai hero selebar layar dan navbar horizontal, bukan kolom undangan sempit di kanan. Jadi **jangan** menganggap semua kompetitor memakai pola split desktop.
- Demo saat audit menampilkan `EXPIRED`, karena tanggal acara sudah lewat. Konten contoh panjang/berulang juga masih terlihat. Ini pelajaran QA, bukan contoh copy untuk produk kita.

## Bukti source yang diperiksa

HTML publik diambil tanpa autentikasi, bersama inline script dan tiga script domain yang sama. Source menunjuk Bootstrap 4.3.1, jQuery, AOS, Leaflet 1.7.1, serta CSS `template/nikah-nikahbasic/css/style.css?`. Ketergantungan ini milik demo, bukan rekomendasi stack RuangHadir.

`inline-00.js`: `music()` membuka elemen tersembunyi, navbar, tombol menu dan kontrol audio, mengembalikan overflow body, kemudian mencoba `audio.play()`.

`inline-01.js`: tile OpenStreetMap, marker lokasi dan popup. Peta bukan alasan mengizinkan zoom seluruh halaman; kontrol zoom peta dan viewport adalah dua hal terpisah.

`inline-05.js`: countdown satu detik memakai tanggal literal; jika waktu lewat, interval dihentikan dan label diganti `EXPIRED`. Handler `.link` membaca `href`, menjalankan `music()`, menggeser halaman ke target, lalu `preventDefault()`. Source ini benar-benar dibaca; bukan kesimpulan dari nama library.

Font heading runtime: Playfair Display 40px; viewport demo `width=device-width, initial-scale=1, shrink-to-fit=no`. Tidak terlihat larangan zoom pada meta tersebut. **Kita mempertahankan Manrope dan ZoomLock existing sesuai pemilik.**

## Keputusan untuk RuangHadir

REA evidence terpilih untuk `inline-05.js`: `ev_167bb3ad64da9a2f195a4d50a461ca1327e0cde4452dcd3fc58c9e06a6d01742`. Cakupan ini hanya handler countdown/anchor, bukan semua source aplikasi.

| ID | Temuan | Keputusan yang dapat dikerjakan |
|---|---|---|
| WN-01 | Nama dan kota penerima jelas di cover | Pertahankan personalisasi yang sudah ada; QA nama panjang dan karakter khusus pada tema baru |
| WN-02 | Informasi acara tambahan melampaui akad/resepsi | Backlog model event fleksibel; jangan mengarang dukungan backend melalui UI saja |
| WN-03 | Countdown lewat menjadi EXPIRED | Standar tema berikutnya: pesan ramah setelah acara, tanggal/timezone benar, tanpa angka negatif |
| WN-04 | Anchor membuat navigasi mudah dipahami | Pertahankan navigasi section tema existing; uji scroll dalam iframe saat membuat tema baru |
| WN-05 | Banyak teks contoh berulang dan ikon fitur | Jangan adopsi; gunakan konten realistis dan deskripsi tugas pada marketing kita |
| WN-06 | Audio dimulai lewat aksi pengguna | Jadikan gate pengguna + kegagalan autoplay yang tenang sebagai kriteria tema baru |
| WN-07 | Full width desktop berbeda dari kebutuhan pemilik | Tetap ikuti split hero kiri/undangan kanan milik RuangHadir, bukan menyalin demo ini |

## Batas

Tidak menguji akun privat, panel editing, pembayaran, pengiriman undangan, ataupun kebenaran analitik vendor. Audio dipanggil oleh source; keberhasilan suara tidak dikonfirmasi. Snapshot HTTP bukan rekaman traffic runtime lengkap. Bukti mentah disimpan terpisah agar kode/aset kompetitor tidak masuk aplikasi produksi.

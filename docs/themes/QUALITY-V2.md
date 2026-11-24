# Standar kualitas tema berikutnya — usulan GPT

Asal: arahan pemilik 24 November 2026. Berlaku untuk tema baru/pekerjaan tema berikutnya. **Tidak memberi izin mengubah preview dan tema existing pada branch redesign aplikasi ini.**

Dokumen ini melengkapi `STANDARD.md` dan `PLAYBOOK.md`; keputusan lama tidak dihapus diam-diam. Jika ada perbedaan, mintakan keputusan pemilik sebelum mengganti tema yang sudah terbit. Arahan khusus Claude belum diterima.

## Definisi kualitas yang dapat diperiksa

“AI slop” dalam pekerjaan ini dinilai melalui masalah konkret: bentuk dekoratif generik berulang, seni tidak terkait konsep, komposisi yang hanya berbeda warna/font, elemen bertabrakan, gerak tanpa tujuan, dan informasi sulit dibaca. SVG, React, atau library animasi bukan bukti otomatis bahwa desain baik/buruk.

## Brief sebelum kode

Tuliskan konsep, suasana acara, alasan komposisi, bahan/seni yang dipakai, dan apa yang membedakannya dari tema terdekat. Sebutkan kebutuhan foto, versi tanpa foto, ruang nama panjang, serta pengalaman pembuka sampai penutup. Jangan menyebut tema “adat” hanya karena menambahkan gunungan generik atau mengganti warna emas.

## Standar seni

- Jangan menghasilkan aset generatif baru sebagai jalan pintas dalam pekerjaan ini.
- Ornamen SVG generik (bunga lingkaran, daun identik, lengkung acak) tidak memenuhi brief seni khas.
- Jika memakai SVG buatan khusus pada pekerjaan berikutnya, bentuk/proporsi/tekstur harus mengikuti brief dan lolos review visual pemilik; jenis file bukan alasan untuk meloloskan karya.
- Catat asal aset, lisensi, pembuat, dan modifikasi. Aset kompetitor hanya bukti riset; bukan bahan produk untuk diunduh lalu dipakai ulang.
- Kelompokkan latar, jarak menengah, dan ornamen depan berdasarkan komposisi. Setiap lapisan harus menyisakan ruang untuk nama, tombol, tanggal, dan form.
- Hindari buket/bingkai/panggung identik pada semua tema dengan hanya mengganti palet.

## Tata letak dan tipografi

- Mobile first: audit 360, 390, dan 430px; tablet sebagai transisi; desktop 1280/1440px.
- Desktop RuangHadir: hero foto/nama/tanggal di kiri, kolom undangan seperti HP di kanan; mobile menampilkan undangan saja. Pertahankan implementasi existing yang disukai pemilik.
- Nama panjang, gelar, nama orang tua, alamat panjang, banyak rekening, dan tanpa foto harus memiliki komposisi yang terbaca.
- Font aplikasi yang disukai pemilik tetap Manrope. Font tema existing tidak diganti. Pemilihan font tema baru harus disepakati dalam brief tema, bukan perubahan global.
- Kontrol sentuh minimal 44px, label/form terbaca, kontras teks normal minimal 4.5:1. Warna ceria tidak berarti semua bagian diberi warna sama kuat.

## Gerak dan perilaku

- Sampul → pembuka → isi memiliki state eksplisit. Pengguna tidak boleh menunggu animasi panjang untuk membaca jadwal atau menekan RSVP.
- Gerak menjelaskan kedalaman, pergantian bagian, atau fokus; gerak berulang tidak boleh membuat teks/form bergerak terus.
- Setelah galeri/modal ditutup, posisi baca dipertahankan. Musik mengikuti interaksi membuka dan memiliki kontrol berhenti.
- Hindari menambah GSAP/Splide/jQuery hanya karena ditemukan pada kompetitor. Gunakan mesin existing bila memenuhi kebutuhan.
- Hormati reduced motion. Untuk mode kamera, uji lintasan di antara stasiun, bukan hanya pose berhenti; ikuti kebutuhan contact sheet pada `STANDARD.md`.
- Jangan meniru permintaan izin lokasi hanya karena terlihat pada source kompetitor; membuka tombol Maps cukup untuk kebutuhan arah umum.

## CSS dan zoom sesuai arahan pemilik

Pertahankan `ZoomLock`, viewport, dan perlindungan iframe. CSS `touch-action` dan ukuran input mobile perlu dicek bersama event gesture; tidak ada klaim semua browser pasti dapat mengunci gesture. Verifikasi pinch/two-touch, ctrl-wheel, fokus input, dan scroll satu jari. Larangan zoom adalah arahan eksplisit pemilik, bukan persyaratan yang disimpulkan dari kompetitor.

## Gerbang review

Sebelum tema baru dinyatakan siap, sertakan:

1. Bukti cover, hero, pasangan, acara, galeri, RSVP, dan penutup pada mobile serta desktop.
2. Perbandingan berdampingan dengan tema terdekat: jelaskan pembeda komposisi/seni, bukan hanya nama palet.
3. Pemeriksaan nama/alamat panjang, tanpa foto, data kosong, galeri panjang, dan state gagal simpan RSVP.
4. Pemeriksaan lapisan tidak menutup interaksi; tidak ada scroll horizontal; navigasi/galeri/musik dapat dipakai.
5. Sumber aset dan hasil pemeriksaan produksi, serta hal yang belum diuji pada perangkat fisik.

Gagal satu persyaratan inti berarti revisi, bukan menambah dekorasi untuk menyamarkan masalah.

# Koreksi kualitas tema: riset harus menghasilkan desain

## Arahan pemilik terbaru

Pemilik menolak kualitas seluruh tema yang dilihat: hasil terasa generik dan tidak sesuai ekspektasi kompetitor. Pemilik meminta pemeriksaan screenshot semua bagian, source/bundle relevan, pola transisi dan scroll. Koreksi berikutnya: jangan terpaku pada Wedew, jangan membuat proses riset menjadi birokrasi; kelemahan implementasi B harus diperbaiki. Lima vendor adalah masukan berbeda, bukan satu vendor sebagai cetakan. Catatan room135–137 merekam scope; tidak ada persetujuan visual untuk kandidat baru.

## Apa yang benar-benar sudah dan belum dilakukan

Laporan01–05 sebelumnya memang memuat pengambilan JS/CSS dan inspeksi demo publik. Tetapi sampel framework, daftar library, dan screenshot beberapa posisi bukan audit pengalaman gerak utuh. Status lama “selesai untuk publik” tidak berarti seluruh tema atau kualitas implementasi selesai. Belum ada bukti video kontinu awal–akhir lintas viewport untuk kelima vendor. Tidak mengklaim source backend diperoleh.

Sesi ini mengunjungi ulang Sweet Luxury di browser pada1363×936, menelusuri hero sampai footer dan menyimpan10 screenshot. Bukti terpilih ada di [lembar kontak](theme-reset-evidence/wedew-contact.jpg); posisi aktual dan struktur14 bagian disimpan dalam JSON. Nama file snapshot adalah label kerja, bukan jaminan bagian itu tepat berada di layar: scroll bisa belum settle dan animasi masih berlangsung. Footer terakhir dikonfirmasi secara visual. Ini bukan rekaman video dan tidak dapat dipakai mengukur easing/FPS secara presisi.

DOM aktual menunjukkan28 elemen AOS; computed transition1.2s dengan cubic-bezier(0.25,0.1,0.25,1). Tiga slot memiliki durasi eksplisit1200ms; tanggal memiliki delay300ms. Ini pengamatan atribut/style, bukan pengukuran semua transisi. Ada12 gambar complete dengan naturalWidth0 dari55 img pada sesi itu; sebagian foto galeri tidak tampil. Jangan meniru cacat tersebut atau menyimpulkan penyebab jaringan tanpa bukti. URL11 bundle/CSS yang benar-benar terlihat dicoba via HTTP terpisah: semuanya403; isi baru tidak diperoleh. Tidak mencoba bypass atau mengklaim berhasil fetch. Berhenti mengejar Wedew, gunakan sumber lain yang sudah tersedia.

Source Viding/Mulyo dan Katsudoto/Bianca yang diperoleh sesi sebelumnya dibaca kembali secara inert, tanpa menjalankannya. Hash aktual tersedia di rechecked-source-hashes.json; bukti lama tetap dibedakan dari observasi browser baru. Source pihak ketiga tidak disalin menjadi kode prototipe.

## Temuan lintas vendor menjadi keputusan desain

| Sumber | Bukti dan batas | Terjemahan ke kandidat RuangHadir |
|---|---|---|
| Viding/Mulyo | Source tombol buka mengubah cover-opened, melepas scroll, menutup cover setelah1200ms. ScrollTrigger mengaktifkan ornamen ketika terlihat dan menjeda loop di luar layar. Bukan bukti bahwa semua tema Viding sama. | Cover memiliki state tertutup/membuka/terbuka, isi inert sebelum dibuka. Reveal dipasang per elemen; tidak menambah seluruh library vendor. |
| Katsudoto/Bianca | Source rundown menyesuaikan dekorasi terhadap panjang isi; slider cerita mengatur transform/opacity, lapisan dan pointerEvents tiap slide. Metadata/source bukan jaminan seluruh alur demo sudah teruji. | Komposisi mengikuti isi dan panjang teks; galeri dipisahkan dari cerita. Lightbox memakai dialog native dan mengembalikan fokus. Seni tidak ditempel identik di setiap panel. |
| Our Wedding Link | Laporan04 dan source helper menunjukkan pemisahan layer, container scroll dan pemrosesan elemen terlihat. Bukti hanya helper/sampel tema. | Ruang foto, teks, navigasi dan gerak memiliki fungsi masing-masing. Desktop split dipertahankan; tidak menumpuk latar dan kartu berulang. |
| WebNikah | Laporan05 memisahkan gate/audio, anchor dan countdown. Demo desktop fullwidth berbeda dari preferensi pemilik. | Navigasi langsung ke informasi penting, label jelas, jadwal terbaca. Tidak meniru expired copy atau mengganti desktop split RuangHadir. |
| Wedew/Sweet Luxury | Hero buket di kanan menyisakan ruang nama kiri, bentuk foto pasangan berbeda dari bidang foto galeri; beberapa gambar gagal pada sesi ini. | Pelajari alokasi ruang dan ritme antarbab. Palet pink/buket vendor tidak diadopsi. |

## Kelemahan implementasi repo yang bisa ditunjuk

KitLayout memilih STANDARD_ORDER untuk tema reguler tanpa sections khusus; standardSections dipakai bersama. Di STANDARD.md tertulis pembeda bukan urutan bagian, sementara PLAYBOOK juga mewajibkan alur sendiri: instruksi ini bertentangan. Sage Garden memiliki varian yang utamanya mengganti palette/floraArt, serta Branches/GateArt berbentuk path sederhana dan pola titik SVG. Lembayung menggunakan ridgePath/seeded berulang sebagai bahan adegan. Ini fakta struktur kode, bukan vonis bahwa semua SVG atau semua tema otomatis buruk.

Inferensi desain B: jika aturan tersebut dipakai sebagai resep, karya mudah berakhir pada susunan sama dengan dekorasi berbeda. Perbaikannya membutuhkan keputusan komposisi dan materi visual per bab, bukan menambah partikel, library, atau jumlah varian. Jangan mengatakan B sudah mengaudit render semua13 tema; belum.

## Implementasi yang dibuat untuk dinilai

[Sehari, Selamanya](../prototypes/sehari-selamanya/index.html) adalah HTML/CSS/JS prototipe terisolasi, bukan tema yang didaftarkan ke katalog. Satu arah editorial fotografi: cobalt, kuning hangat dan kertas terang; foto existing repo, tanpa SVG/ilustrasi generatif baru. Palet ini kandidat tema baru, bukan perubahan token aplikasi. Font aplikasi Manrope dan font tema existing tetap.

- Desktop: foto dan judul tetap di kiri, undangan450px di kanan; mobile satu kolom.
- Cover: susunan tipografi, tanggal, satu cetak foto; dibuka melalui gerak tirai ke atas. Hero menjadi foto layar penuh, bukan mengulang kartu cover.
- Pembuka: bidang kuning dengan kutipan pendek. Pasangan: dua portrait asimetris dengan identitas/keluarga di ruang terpisah.
- Acara: bidang biru, tanggal30 besar, jadwal dan lokasi tanpa kartu berulang. Cerita: surat vertikal. Galeri: satu foto utama dan dua foto berirama.
- Hadiah: disclosure tanpa nomor rekening palsu. RSVP: form lokal dengan label simulasi, tidak mengirim/menyimpan. Penutup mengulang kalimat utama sebagai kesatuan cerita.
- Interaksi: buka, anchor, active navigation, reveal berbeda per elemen, reduced motion, lightbox/Escape/restore, validasi form native dan respons simulasi. Tidak mengklaim musik, peta venue nyata, hadiah atau RSVP backend terintegrasi.

Foto mengacu relatif ke public/assets/video-sample existing, tidak menyalin aset vendor. Nama, orang tua dan lokasi dalam prototipe adalah contoh. Provenance/lisensi foto existing perlu dikonfirmasi sebelum rilis tema, tidak dianggap otomatis berlisensi hanya karena berada di repo. Tidak ada aset existing yang diubah.

## Validasi dan batas kandidat

Pemeriksaan statis: script di-parse Node, target anchor/label dan path foto diperiksa; diff src/public/package/ZoomLock kosong, whitespace diperiksa. Tidak perlu menjalankan build aplikasi untuk prototipe docs yang tidak diimpor aplikasi. Ini tidak membuktikan hasil visual atau animasi bagus.

Percobaan membuka file prototipe di cloud browser ditolak kebijakan protokol file. Tidak menggunakan workaround, server alternatif atau browser lain untuk menghindari larangan. Jadi prototipe BELUM QA render browser/mobile, belum screenshot hasil implementasi, dan belum persetujuan pemilik. Bukti screenshot dalam laporan ini adalah kompetitor, bukan kandidat RuangHadir. Jangan mencampurkannya.

Langkah berikut: tinjau kandidat secara visual melalui jalur preview yang diizinkan; koreksi komposisi/spacing/gerak dari tampilan nyata. Setelah arah visual kuat, integrasikan ke satu tema baru pada branch review, uji data panjang/tanpa foto/semua fitur dan transisi awal–akhir. Temuan vendor lain boleh langsung memperbaiki bagian yang relevan; tidak menunggu satu vendor diaudit sempurna. Jangan menambah tema berikutnya untuk menggantikan revisi kualitas kandidat ini.

Tidak menghapus tema existing, merge main atau deploy produksi. Review pemilik diperlukan untuk arah visual final, bukan untuk melanjutkan pekerjaan reversible yang sudah terotorisasi.

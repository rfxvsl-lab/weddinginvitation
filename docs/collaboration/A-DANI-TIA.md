# Undangan khusus Tia & Dhany (`/dani-tia`) — catatan A

Permintaan pemilik 28 Nov 2026: undangan khusus Tia & Dhany. Tema Pasundan dipakai sebagai acuan awal, tetapi pasangan ini orang Jawa, jadi dibuat tema Jawa tersendiri. Animasi harus benar-benar jalan: fade, zoom, tilt, dan paralaks. Foto dari Drive dicocokkan dengan momennya, dengan foto Vespa diprioritaskan.
Status: **kandidat review**, belum disetujui visual oleh pemilik.

## Lingkup file
- `src/app/dani-tia/*`: route statis, data persis dari brief, mesin gerak, RSVP, dan lightbox (CSS Module, tanpa selector global).
- `src/app/api/custom-pages/[key]/rsvp/route.ts` dan `src/lib/customPageRsvp.ts`: RSVP dan ucapan untuk halaman khusus. Tabel baru `custom_page_rsvps` dibuat otomatis; tabel `rsvps` tidak disentuh.
- `src/lib/server/http.ts`: `dani-tia` dan `kharis-lia` ditambahkan ke `RESERVED_SLUGS`.
- `public/assets/dani-tia/*`: foto WebP tanpa EXIF (2 ukuran), `og.jpg`, serta SVG `gunungan`, `gunungan-outline`, `gunungan-frame`, `kawung`, dan `truntum`.
- Preview, tema katalog (termasuk `sunda-kujang`), font aplikasi, dan harga **tidak diubah**.

## Arah seni: "Kelir"
- Kertas putih dan tinta olive-sage mengikuti undangan cetak. Suasana malam hanya datang dari foto.
- Huruf: Bodoni Moda (sumbu opsz) untuk nama dan judul, Pinyon Script hanya untuk kata "with", dan Jost untuk detail.
- **Gunungan (kayon)** dipakai sesuai fungsinya di pagelaran wayang:
  - Saat undangan dibuka, gunungan dikebyokkan melintasi layar dengan cahaya blencong dari belakang, seperti dalang membuka lakon.
  - Di penutup, gunungan "ditancapkan" sebagai tanda lakon selesai.
- Truntum dipakai samar di penutup. Motif ini dipakai orang tua mempelai Jawa dan bermakna cinta yang bersemi lagi.
- Kawung dipakai sebagai pita pembatas dan latar linimasa acara.
- Bagian gelap ("kelir"): pembuka dengan gunungan bayangan di depan lampu blencong, dan galeri.
- Edisi 2 (koreksi pemilik):
  - Galeri dipangkas jadi 12 foto dalam carousel 3D bertema.
  - Ruang kosong dikurangi: kartu menumpuk di atas foto, linimasa acara, teks penutup di atas foto.
  - Adegan menyatu dibuat mengikuti gulir.

### Cara SVG dibuat (bukan ilustrasi emoji)
1. Bentuk dan anatomi diambil dari referensi nyata gunungan gaya Surakarta: siluet, pinggiran, pohon hayat dengan lung-lungan, dan gapura di kaki.
2. Kunci keasliannya ada pada teknik **tatahan**: medan kulit dilubangi kisi tatah bubukan, sedangkan motif tetap kulit utuh dengan baris tatah halus. Hasilnya tampak seperti kulit wayang yang ditembus cahaya, bukan garis putus-putus.
3. Tepi diberi gerigi halus. Posisi lubang diberi getar acak berbenih seperti pahatan tangan.
4. Setiap iterasi dirender ke PNG lalu dikritik. Ada empat putaran sampai motif terbaca solid di atas medan berlubang.
5. Medan latar memakai `<pattern>`. Aset dipakai sebagai CSS `mask-image` (sekitar 26 KB gzip), dan warna serta cahaya diatur lewat CSS.

Generator Python (dibuat A) ada di luar repo. Bila perlu disunting, minta A menambahkannya.

## Pemetaan foto → momen
| Bagian | Foto | Alasan |
|---|---|---|
| Sampul HP | DSC00840 | Berdua di Vespa biru di depan dinding bergaris, paling dekat dengan sampul cetak |
| Sampul desktop / OG | DSC00777 | Duduk di samping Vespa, komposisi lebar |
| Pembuka (Ar-Ruum) | DSC00809 | Genggaman tangan dengan Vespa di belakang |
| Mempelai | DSC00830 dibelah dua | Kedua belahan bertemu tepat di genggaman tangan; adegan dipin dan menyatu mengikuti gulir |
| Save the date | DSC00998 | Vespa melaju ke arah kamera dengan lampu menyala; kamera zoom-in saat digulir |
| Acara | DSC00860 | Menoleh sambil bergandengan menyeberang jalan |
| Lokasi | DSC00984 | Memasangkan helm sebelum berangkat |
| RSVP | DSC00987 | Berboncengan |
| Penutup | DSC00582 | Padang rumput, sesuai urutan brief malam → jalanan → padang |
| Galeri | 12 foto potret | Carousel 3D "Simpingan": foto dibingkai bentuk gunungan bertatah, berdiri melingkar di atas gedebog. Urutan: Malam (Vespa) → Jalanan → Padang |

## Tabel gerak
| Pemicu | Elemen | Perubahan | Durasi | Reduced motion |
|---|---|---|---|---|
| Muat | Foto sampul | Ken Burns (zoom pelan dan geser) | 24 dtk bolak-balik | Diam |
| Muat | Teks sampul | Fade-up bertahap | 1,1 dtk, jeda 160 ms | Langsung tampil |
| Pointer (desktop) | Foto sampul | Tilt 3D ±3° | Mengikuti | Tidak aktif |
| Tombol Buka | Gunungan dan blencong | Masuk dari kanan bawah, berhenti, bergetar (kebyok), lalu keluar ke kiri atas | 1,9 dtk | Dilewati |
| Tombol Buka | Sampul | Zoom-out dan fade-out | 0,5–1 dtk | Dilewati |
| Gulir | Foto plate | Paralaks, zoom-in, zoom-out, rise, dan fade-out di tepi atas | Mengikuti gulir | Tidak aktif |
| Masuk layar | Teks | Fade-up, zoom, atau tilt (rotateX) | 0,9–1,1 dtk | Langsung tampil |
| Geser / tombol / otomatis | Simpingan 3D | Cincin berputar (rotateY) dengan inersia lalu berhenti tepat di satu foto; foto samping meredup; putar otomatis tiap 3,6 dtk saat terlihat | Mengikuti / 3,6 dtk | Tanpa putar otomatis, pindah instan |
| Gulir (dipin) | Adegan mempelai | Dua belahan saling menghadap (rotateY ±40°), mendekat, lalu menyatu di genggaman; muncul kilau blencong dan gunungan kecil; nama masuk dari sisi masing-masing | Mengikuti gulir ±1,5 layar | Langsung keadaan akhir, tanpa pin |
| Terus-menerus | Pembuka kelir | Gunungan bergoyang pelan di depan lampu yang berkedip, bara lampu naik | 9 dtk / 5,5 dtk | Diam |
| Detik berganti | Angka hitung mundur | Flip digit | 0,5 dtk | Diam |
| Masuk layar | Gunungan penutup | Tancep: naik, bergoyang, lalu berdiri | 1,8 dtk | Langsung tampil |
| Desktop gulir | Panggung kiri | Crossfade foto per bagian dan zoom-out pelan | 1,4 / 9 dtk | Crossfade saja |

Aturan mesin: hanya `transform` dan `opacity` yang dianimasikan. Elemen yang sudah tampil tidak disembunyikan lagi. Satu loop rAF memakai posisi yang di-cache saat resize.

## Catatan bug tema Pasundan (dibaca dari kode, belum dibuktikan di perangkat)
Kemungkinan penyebabnya ada di mesin kit yang dilindungi, jadi tidak diubah:
- `ArtLayer` mulai dengan `visibility:hidden` dan menyembunyikan lapisan saat bab dianggap jauh. Bila hitungan batas bab meleset, lapisan **hilang tiba-tiba**.
- `getBoundingClientRect()` dipanggil per lapisan setiap frame (`ArtLayer`, `Px`). Ini memicu layout berulang dan membuat animasi **tersendat** di HP.
- Animasi CSS `psd-drift` dan `psd-glow` berjalan pada `<g>` di dalam SVG besar bergradien. Bagian ini tidak dikomposit GPU dan di-repaint setiap frame.

## Placeholder (jangan dikarang)
- `MAPS_URL` masih pencarian alamat. Ganti dengan pin dari QR undangan atau dari keluarga.
- `MUSIC_URL` kosong, jadi tombol musik tersembunyi. Musik baru diputar setelah undangan dibuka.
- `GIFTS` kosong, jadi seksi amplop tidak tampil.
- Entri Google Calendar resepsi memakai blok 10.00–13.00 karena undangan menulis "Selesai".
- Kredit "Dahlia/F01 — Asha Official Store" tidak ditampilkan (menunggu izin).

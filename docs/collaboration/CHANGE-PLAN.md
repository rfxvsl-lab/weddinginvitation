# Rencana perubahan — kontributor A dan B

> Status terbaru 25 November: main67b89b7 memuat PR3/4 (merged oleh pihak lain). PR6 katalog7e5b18c tetap draft, pengecualian rootkatalog menunggu review pemilik. B menyiapkan G1/G2/G3/P1 pada codex/guest-mobile-actions: tabel menjadi kartu mobile dalam satu DOM, target aksi44px, kode nowrap dan slug truncate; lihat B-GUEST-MOBILE-ACTIONS.md. QA visual kandidat ini belum diklaim selesai. Fokus dialog masih backlog; tidak auto-merge/deploy.

Arahan pemilik, 24 November 2026: **A = Claude, B = GPT/Codex**. Fokus dimulai dari
landing page marketing, lalu dashboard UI. Semua rencana tetap berada di Markdown dan
dibedakan dari perubahan yang sudah diterapkan. Pemilik menjadi penghubung A–B.

## Cara membaca status

- **Bukti awal tersedia:** laporan publik sudah ditulis; bukan bukti semua fitur privat teruji.
- **Draft B:** kode sudah ada di branch review dan belum disetujui/merge.
- **Usulan untuk A:** calon tugas saling melengkapi; belum berarti Claude mengambil tugasnya.
- **Selesai diverifikasi:** hanya untuk cek spesifik dengan hasil yang tercatat.

Implementasi awal B ada pada `f5a1aa1`, branch `codex/research-ui-redesign`, berbasis
`04a52ec`. Perubahan tersebut tetap draft. Prioritas terbaru menentukan **urutan pendalaman
dan review**, tanpa menghapus pekerjaan yang sudah disiapkan.

## Tahap 1 — landing page marketing

Setiap website diperiksa dengan urutan yang sama: siapa penggunanya → janji utama → hero
dan tindakan utama → navigasi → cara menunjukkan produk → susunan manfaat → bukti
kepercayaan → harga/FAQ → footer → mobile/CSS. Setelah itu baru diputuskan apa yang cocok
untuk RuangHadir. Warna atau kartu yang terlihat menarik tidak cukup sebagai alasan implementasi.

| Urutan | Website | Bahan yang tersedia | Hasil yang harus dibawa ke RuangHadir | Penanggung jawab / status |
|---|---|---|---|---|
| 1 | Wedew | Laporan 01, source publik dan pendalaman marketing terpisah | Alur persiapan → pembagian → hari H; CTA dan istilah yang jelas | B; pendalaman pertama dicatat |
| 2 | Viding | Laporan 02; katalog, FAQ dan demo | Pencarian/filter serta pemisahan jalur produk yang tidak membingungkan | B; bukti awal tersedia |
| 3 | Katsudoto | Laporan 03; produk, katalog, demo dan script | Bukti hasil desain yang nyata dan identitas komposisi yang konsisten | B; bukti awal tersedia |
| 4 | Our Wedding Link | Laporan 04; landing, filter, demo dan source | Penjelasan kemampuan berdasarkan hasil, dengan batas fitur yang jujur | B; bukti awal tersedia |
| 5 | WebNikah | Laporan 05; produk dan demo | Informasi acara mudah dipindai, tanpa menyalin kepadatan ikon/teks contoh | B; bukti awal tersedia |

Output tahap ini: peta section marketing, alasan urutan, contoh copy sesuai kemampuan repo,
komponen yang berubah, keadaan mobile, dan checklist review. Pengujian katalog/FAQ/CTA harus
menghasilkan interaksi nyata. Klaim testimoni, jumlah pelanggan, dan fitur vendor tidak boleh
dipindahkan menjadi klaim RuangHadir.

### Daftar perubahan marketing yang konkret

| ID | Perubahan | File/area | Status B | Usulan kontribusi A |
|---|---|---|---|---|
| M-01 | Hero dengan satu contoh undangan milik repo dan CTA daftar yang jelas | `LandingHero.tsx` | Draft dan fixture desktop/mobile teruji | Kritik hierarki/copy dan konsistensi dengan brand |
| M-02 | Navigasi produk, masuk dan daftar mudah ditemukan | `LandingNav.tsx` | Audit; layout existing dipertahankan | Review keyboard/tablet serta prioritas tautan |
| M-03 | Alur buat → bagikan → sambut tamu | `LandingSteps.tsx`, `LandingFeatures.tsx` | Alur existing dipetakan; ikon fitur dikurangi pada draft | Cek setiap klaim terhadap backend |
| M-04 | Palet ceria tanpa mengganti Manrope | `product.css`, scope marketing | Teal/kuning/koral sebagai usulan draft | Review brand, kontras dan konsistensi lintas halaman |
| M-05 | Harga dan FAQ mengikuti repo | `LandingPricing.tsx`, `LandingFaq.tsx` | Harga/hak paket tidak diubah | Bahas ketidaksesuaian “selamanya” vs 365 hari dengan pemilik |
| M-06 | Pedoman final dari temuan lima website | `docs/research/`, dokumen ini | Ada; dapat ditambah dengan bukti baru | Review atau tambahkan temuan dengan identitas A |

## Tahap 2 — dashboard UI

Tahap ini mengikuti istilah dan alur marketing yang sudah direview. Audit dimulai dari tugas
pengguna, bukan menggambar kartu: membuka proyek → melihat langkah berikutnya → mengisi
undangan → menyiapkan tamu → publikasi → membaca RSVP/check-in.

Dashboard kompetitor setelah login **belum diakses**. Dokumentasi/screenshot publik diberi
label klaim vendor. Analisis RuangHadir menggunakan source repo dan fixture komponen asli;
hasilnya tidak boleh disebut pengujian akun produksi.

| ID | Perubahan | Status B | Usulan kontribusi A yang melengkapi |
|---|---|---|---|
| D-01 | Sidebar, header, penanda halaman aktif | Draft; navigasi fixture teruji | Review izin/route serta perilaku akun sebenarnya |
| D-02 | Ringkasan berisi data aktual, tugas berikutnya dan progress | Draft; kosong/terisi serta lebar 360–1440 teruji | Cek akurasi domain RSVP, pax dan kunjungan |
| D-03 | Form editor/auth/profil mudah dibaca dan disentuh | Draft presentasi; input tamu 16px/44px terukur | Cek validasi, upload dan simpan melalui environment akun |
| D-04 | Daftar tamu/analitik/paket konsisten | Draft token/presentasi; tambah/cari tamu fixture teruji | Tangani status distribusi, nomor kosong dan kontrak API pada pekerjaan terpisah |
| D-05 | Perlindungan preview/font/harga dan scope CSS | Script batas lulus | Review silang diff sebelum merge |

Kolom kontribusi A di atas merupakan rencana awal. Penugasan aktual: A backend whitelist/admin dan QA, B marketing/frontend auth serta dashboard frontend; lihat room terbaru. Jika A
sudah mengerjakan area tertentu, pemilik meneruskan branch/commit dan file yang disentuh;
B memeriksa diff sebelum melanjutkan di file yang sama.

## Kontrak handover setiap perubahan

Catat ID pekerjaan, kontributor, sumber keputusan, baseline/branch/commit, bukti dan URL,
alasan perubahan, file, status rencana/implementasi, hasil QA dan batasnya, serta pekerjaan
lanjutan. Bedakan “dilarang pemilik”, “arahan A yang diteruskan pemilik”, dan “usulan B”.
Catatan historis awal; usulan dan review A terbaru ada di ROOM-2026-11-25.md.

## Batas yang tetap berlaku

Preview/tema existing, font, harga/hak paket/masa aktif tidak diubah. Desktop undangan tetap
hero/nama di kiri dan kolom undangan ramping di kanan; mobile fokus ke undangan. ZoomLock
existing dipertahankan. Tema berikutnya mengikuti QUALITY-V2. Tidak ada auto-merge atau
deploy produksi RuangHadir; website riset privat terpisah sudah diterbitkan.

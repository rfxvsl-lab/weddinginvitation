# Konsep RuangHadir — dari riset ke implementasi

Baseline `04a52ec`, 24 November 2026. Usulan GPT berdasarkan lima laporan; batas pemilik tetap berlaku.

## Konsep produk

**Ruang kerja untuk menyiapkan hari bahagia.** Marketing menunjukkan hasil undangan asli dan urutan kerja. Dashboard membantu pasangan tahu apa yang perlu diselesaikan, mengelola tamu, lalu membaca konfirmasi. Tema menjadi panggung cerita pasangan; aplikasi menjadi alat kerja yang tenang dan mudah dipakai.

Tidak ada alasan menambah paket baru atau meniru editor kompleks kompetitor. Gratis Rp0 dan Enterprise penawaran khusus tetap mengikuti repo. Font Manrope dan seluruh preview existing dipertahankan.

## Arah desain aplikasi

- Hijau teal untuk tindakan utama, kuning hangat untuk persiapan, koral untuk aksen suasana, putih hangat untuk ruang baca. Status error tetap merah dan status hadir tetap hijau, bukan sekadar dekorasi.
- Marketing: headline langsung, satu hasil undangan yang besar, contoh asli sebagai bukti, alur tiga tahap; hilangkan kipas kartu dekoratif dan ikon fitur berulang.
- Dashboard: navigasi jelas, data dalam deret ringkas, daftar tugas berurutan dan satu tindakan berikutnya. Hindari membungkus setiap angka dalam kartu berbayang.
- Form/editor/tamu/profil/analitik: permukaan solid, garis konsisten, fokus keyboard jelas, target sentuh layak, tabel tetap dapat digeser horizontal pada layar kecil. Jangan mengecilkan teks agar muat.
- CSS baru hanya berlaku di scope aplikasi. Tidak ada selector global baru untuk tema, tidak mengubah render iframe atau source aset.

## Ledger implementasi

| ID | Sumber | Yang harus dilakukan | Area | Prioritas | Keputusan |
|---|---|---|---|---|---|
| UI-01 | Pemilik; audit stylesheet | Hilangkan dominasi wine/pink, glass dan shadow bertumpuk; pakai token warna aplikasi | Semua permukaan aplikasi | P1 | Implementasi visual sekarang |
| UI-02 | Wedew lifecycle; Viding jalur produk | Marketing mengikuti buat → bagikan → sambut tamu, dengan tautan tindakan nyata | Landing | P1 | Implementasi sekarang |
| UI-03 | Katsudoto/OWL bukti hasil | Tampilkan screenshot tema milik repo dalam komposisi terarah | Hero marketing | P1 | Implementasi sekarang, tanpa menyentuh tema |
| UI-04 | Wedew; checklist existing | Ringkasan memprioritaskan langkah yang belum selesai dan data aktual | DashboardOverview | P1 | Implementasi sekarang |
| UI-05 | Pemilik; audit ikon | Ikon hanya membantu navigasi/aksi, bukan setiap angka atau kalimat fitur | Landing/sidebar/ringkasan | P1 | Implementasi sekarang |
| UI-06 | Audit aplikasi | Konsistensi form, toolbar, tabel, modal, focus dan ukuran sentuh | Auth/editor/guests/analytics/profile/package | P1 | Implementasi presentasi sekarang |
| TH-01 | Viding Mulyo/Katsudoto Bianca/OWL Glass Wonder | Tema punya konsep komposisi, lapisan aset, titik fokus dan sumber seni yang jelas | Tema baru | P1 | Standar QUALITY-V2, existing dilindungi |
| TH-02 | Pemilik; demo split desktop | Hero kiri dengan nama/tanggal; kolom undangan kanan; mobile satu kolom | Tema baru + regresi existing | P0 | Pertahankan existing |
| TH-03 | Pemilik; source ZoomLock | Pertahankan lock viewport/gesture; scroll dan input tetap jalan | Root/iframe | P0 | Tidak mengubah implementasi existing |
| TH-04 | WebNikah countdown; Wedew calendar | Uji sesudah acara, timezone, calendar, nama panjang, konten kosong | Tema baru | P1 | Standar QA; belum mengubah preview |
| DATA-01 | Audit GuestManager | Salin link dan buka WA tidak membuktikan terkirim/dibuka | Domain tamu | P1 | Backlog fungsional terpisah |
| DATA-02 | Wedew kuota; Viding pax; audit repo | Bedakan undangan, orang, RSVP, check in dan pesan terkirim | Model/analitik | P1 | Backlog; jangan klaim UI sudah menyelesaikannya |
| DATA-03 | WebNikah event tambahan | Event/sesi fleksibel dan pemberian sesi ke tamu | Domain acara | P2 | Backlog backend |
| TEAM-01 | Viding Studio/OWL Studio klaim vendor | Roles, asset library, version history dan kolaborasi editing | Enterprise | P2 | Discovery terpisah, tidak meniru studio penuh |
| COPY-01 | Audit harga repo | “Selamanya” vs free.activeDays365 memerlukan keputusan pemilik | Copy/lifetime | P1 | Harga/kuota/masa aktif tidak berubah |
| COL-01 | Pemilik | Log percakapan, asal instruksi, batas file, handover dan draft PR | Markdown | P0 | Implementasi sekarang |

## Yang tidak diadopsi

Tumpukan library animasi kompetitor, aset/ornamen mereka, pengambilan lokasi perangkat tanpa kebutuhan, fitur marketing yang belum bisa dibuktikan di backend, dominasi pink, duplikasi ikon, dan penambahan harga/kuota baru. Meniru mekanisme yang masuk akal bukan memindahkan identitas visual atau kode vendor.

## Batas kesimpulan

Lima website diperiksa satu per satu pada permukaan publik dan masing-masing satu demo representatif. Ini **bukan** audit semua tema mereka atau semua dashboard privat. Temuan source tertentu dibatasi pada file yang dipilih; bundle framework tidak dianggap bukti alur bisnis. Klaim vendor tetap dilabeli dalam laporan masing-masing.

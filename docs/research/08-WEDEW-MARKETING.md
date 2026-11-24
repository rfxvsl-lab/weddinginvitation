# Pendalaman pertama — marketing Wedew

Kontributor **B (GPT/Codex)**, 24 November 2026. Fokus lanjutan sesuai prioritas pemilik:
marketing lebih dahulu, lalu dashboard UI. Baca juga [laporan teknis 01](01-WEDEW.md).

## Dasar pemeriksaan

Sumber resmi https://wedew.id/ dibaca ulang pada sesi ini. Pemeriksaan browser, navigasi harga,
FAQ dan sampel HTML/JS sebelumnya tercatat sebagai W-UI-01 sampai W-REA-01 di laporan 01.
Catatan baru ini memisahkan **struktur komunikasi marketing** dari pembongkaran tema.

## Temuan yang benar-benar terlihat

| ID | Bukti publik | Batas kesimpulan |
|---|---|---|
| WM-01 | Hero menyebut platform pernikahan digital, disertai CTA membuat undangan ke dashboard | Tautan CTA tidak membuktikan onboarding privat sudah diuji |
| WM-02 | Manfaat dikelompokkan menjadi Website, Kelola Tamu, Kirim Undangan, Interaksi dan Wedding Day | Ini cara menyusun informasi publik, bukan rekonstruksi database |
| WM-03 | Kelompok fitur disertai gambar penjelas produk | Gambar vendor tidak menjadi aset RuangHadir |
| WM-04 | Bagian berikutnya memuat angka penggunaan, testimoni, harga, aplikasi, tema dan partner | Angka/testimoni adalah klaim vendor; tidak diverifikasi secara independen |
| WM-05 | Footer menghubungkan harga, panduan, layanan, partner dan kebijakan | Banyak tautan tidak berarti semua harus tampil di navigasi utama kita |

## Yang harus diterapkan, dengan alasan dari produk kita

**1. Mulai dari pekerjaan pasangan.** Hero RuangHadir perlu menjawab apa yang dibuat,
seperti apa hasilnya, dan langkah pertama. Draft M-01 menampilkan screenshot tema milik
repo, tautan melihat tema, serta daftar gratis. Ini lebih mudah dievaluasi daripada ilustrasi
abstrak. Manrope dan render undangan tidak perlu diganti untuk mencapainya.

**2. Buat alur marketing sesuai aplikasi.** Susun pesan menjadi menyiapkan undangan,
membagikan tautan personal, lalu membaca konfirmasi dan menyambut tamu. Setiap tahap
memiliki hasil: undangan, daftar tamu, rekap. Hindari menjanjikan pengiriman WhatsApp resmi
otomatis apabila repo hanya membuka pesan WhatsApp. Ini kebutuhan akurasi produk.

**3. Tampilkan bukti yang memang kita miliki.** Gunakan screenshot tema dan komponen
aplikasi yang sudah dibuat. Jika memakai data contoh, beri label contoh. Jangan mengambil
angka pengguna, testimoni atau foto pelanggan kompetitor untuk mengisi ruang kosong.

**4. Jelaskan harga tanpa mengubah modelnya.** Pertahankan Gratis Rp0 dan Enterprise custom.
Kuota, hak fitur dan masa aktif tetap dari repo. Konflik copy “selamanya” dan activeDays365
harus ditandai untuk keputusan pemilik. Menyalin susunan paket kompetitor akan mengubah
produk tanpa dasar dan tidak diperlukan untuk memperbaiki landing.

**5. Arahkan ke tugas pertama di dashboard.** Tindakan utama marketing harus berakhir pada
alur daftar/masuk yang ada. Setelah akun tersedia, ringkasan menunjukkan bagian yang belum
lengkap. Kesesuaian janji marketing dengan tugas pertama dashboard menjadi kriteria review.

## Review landing RuangHadir sebelum beralih ke dashboard

- Hero terbaca pada 360px dan desktop; contoh undangan tidak menutup headline/CTA.
- Tautan daftar, masuk, contoh tema dan navigasi section punya tujuan yang benar.
- Menu mobile dapat dibuka/ditutup dan fokus keyboard terlihat; bukan hanya screenshot bagus.
- Manfaat, harga, FAQ dan footer tidak mengklaim kemampuan yang belum diimplementasikan.
- Manrope tetap, warna status memiliki arti, ikon hanya membantu tindakan atau navigasi.
- CSS marketing tidak bocor ke dokumen preview. Tidak ada perubahan harga atau aset tema.

Draft hero/fitur dan scope warna sudah tersedia dari B pada branch review. Review brand/copy
oleh A masih **usulan**, belum dilakukan. Klaim vendor, dashboard privat dan backend tetap
dibedakan dari hasil observasi. Setelah lembar marketing pertama ini, gunakan urutan yang
sama untuk Viding, Katsudoto, Our Wedding Link dan WebNikah; indeks awalnya sudah tersedia.

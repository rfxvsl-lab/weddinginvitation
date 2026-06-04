# Rencana Implementasi SaaS Wedding Builder by RFX.visual

Dokumen ini berisi rencana arsitektur, desain, dan alur pengerjaan untuk penambahan fitur Sistem Keanggotaan (SaaS), Registrasi & Pencegahan Duplikasi Slug, Alur Pembayaran QRIS/Transfer Manual, Verifikasi Bukti Transfer Berbasis AI (menggunakan Puter.js dengan cadangan API GPT/Claude/Gemini), serta Panel Dashboard Multi-User yang steril dari bentrokan state.

---

## 1. Alur Registrasi & Pengamanan Keunikan Slug
Sistem akan ditambahkan pintu gerbang awal berupa halaman **Sign Up** dan **Sign In**.

### Form Registrasi 3 Tahap (Step-by-Step UI):
*   **Tahap 1: Profil Dasar Pengguna**
    *   Nama Lengkap
    *   Nama Pasangan (Pria & Wanita) untuk dijadikan **Slug Undangan** secara otomatis.
    *   **Aturan Format Slug:** Hanya huruf kecil, angka, dan tanda hubung (e.g., `ridho-jennie` atau `ridhojennie`).
    *   **Pencegahan Duplikasi:** Sistem akan melakukan pemeriksaan real-time ke IndexedDB/LocalState. Jika slug sudah digunakan oleh pengguna lain, input akan diblokir dengan pesan kesalahan: *"Maaf, nama pasangan ini (slug) sudah digunakan oleh pasangan lain. Silakan tambahkan variasi nama atau angka."*
*   **Tahap 2: Kontak & Sosmed**
    *   Email aktif (harus unik untuk setiap akun)
    *   Nomor WhatsApp (format internasional/lokal yang valid)
    *   Akun Sosial Media (e.g., Instagram)
*   **Tahap 3: Pemilihan Paket Pengguna**
    *   **Paket Regular (Maksimal 1 Undangan Aktif):**
        *   *Custom Mandiri:* Rp30.000
        *   *Custom Full (RFX):* Rp45.000
    *   **Paket Medium (Maksimal 2 Undangan Aktif):**
        *   *Custom Mandiri:* Rp50.000
        *   *Custom Full (RFX):* Rp65.000
    *   **Paket Premium (Maksimal 4 Undangan Aktif):**
        *   *Custom Mandiri:* Rp100.000
        *   *Custom Full (RFX):* Rp125.000

---

## 2. Alur Pembayaran QRIS & Transfer Manual Dinamis
Setelah pengguna menekan tombol registrasi & memilih paket, mereka tidak langsung masuk ke dashboard, melainkan diarahkan ke halaman **Gerbang Pembayaran Manual & AI-Verified**.

### Desain & Fitur Halaman Pembayaran:
*   **Tagihan Nominal Presisi:** Menampilkan nominal biaya sesuai paket dan tipe kustomisasi yang dipilih pada saat pendaftaran.
*   **Metode Pembayaran:**
    *   **Mandiri:** Transfer Rekening (Standard)
    *   **Seabank:** Transfer Rekening (Standard)
    *   **ShopeePay / QRIS:** Layout QRIS ditampilkan secara besar, mewah, dan sentral untuk memudahkan pemindaian ponsel.
*   **Alur Konfirmasi Konten Dinamis:**
    *   Ketika salah satu bank dipilih (misal: Mandiri), detail rekening (No. Rekening, Nama Pemilik) plus **Dropzone Unggahan Bukti Transfer** akan muncul secara dinamis di area kontainer utama.
    *   Dropzone mendukung *drag-and-drop* berkas gambar atau jepretan kamera langsung dari ponsel.

---

## 3. Sistem Verifikasi Bukti Transfer Berbasis AI (Puter.js)
Sistem verifikasi transaksi menggunakan teknologi asisten cerdas untuk memvalidasi lampiran berkas asli, mempercepat aktivasi paket pengguna, dan mencegah penipuan manipulasi struk transfer.

### Alur Kerja Mesin Detektor AI:
1.  **Dukungan Multi-Penyimpanan Lokal:** Bukti transfer yang diunggah oleh pengguna akan divalidasi dan diubah ke format Base64 / Blob untuk disimpan sementara di database browser (IndexedDB atau localStorage) sehingga data admin dan user tetap sinkron.
2.  **Pemanggilan AI Pemindaian Bukti (Menggunakan Puter.js):** 
    *   Sistem menggunakan **Puter.js** (`puter.ai.chat()` / Vision) murni untuk memproses gambar bukti transfer.
    *   AI dilatih dengan instruksi khusus untuk menganalisis visual bukti transfer:
        *   *Waktu & Tanggal:* Membaca tahun, bulan, hari, hingga menit transaksi.
        *   *Detail Akun Tujuan:* Harus berdasar pada salah satu data rekening kita yang terlampir (Mandiri/Seabank/ShopeePay).
        *   *Nominal:* Dicocokkan dengan tagihan paket yang dipilih oleh user.
        *   *Status Keaslian:* Mendeteksi editan digital palsu, teks tempelan photoshop, atau struk lama yang dipakai berulang kali.
3.  **Output AI (Hasil Analisis Instan):**
    *   Jika **Berhasil/Valid:** Status pengguna berubah menjadi `Aktif`, lalu dialihkan secara mulus ("auto-redirect") ke Dashboard SaaS dalam hitungan detik.
    *   Jika **Gagal/Ditolak:** Muncul prompt kesalahan tebal: *"Transaksi Anda terbukti gagal atau bukti transfer tidak valid! Alasan: [Alasan dari AI] (Contoh: Nominal transfer kurang dari Rp30.000 / Rekening tujuan salah)"*. Pengguna diberi tombol untuk mengunggah ulang bukti transfer yang benar.

---

## 4. Panel Admin Pelaporan & Cetak PDF Pembayaran
Sistem dilengkapi portal administrasi internal berpenampilan premium untuk memantau arus kas masuk dan laporan audit bukti pembayaran.

### Fitur Panel Admin:
*   **Daftar Bukti Transaksi:** Menampilkan semua transaksi dari pengguna baru yang sedang dianalisis, sudah disetujui, atau ditolak oleh AI.
*   **Inspektur Bukti AI:** Admin dapat melihat foto bukti transfer asli berdampingan dengan kotak hasil analisis poin-demi-poin dari AI (Tanggal, Nominal, Status Validasi).
*   **Eksportir Laporan PDF:** Tombol praktis untuk mengunduh kompilasi laporan transaksi harian/bulanan dalam bentuk berkas PDF rapi yang siap dicetak untuk evaluasi bisnis RFX.visual.

---

## 5. Dashboard SaaS & Desinfeksi State Builder (Anti-Crash)
Demi memastikan pengalaman merancang yang nyaman, aman, dan bebas bentrokan data antarpengguna:

*   **Identitas Dashboard Berbasis Slug:** Setiap dashboard dikunci menggunakan slug unik hasil pendaftaran masing-masing akun pemilik.
*   **Isolasi Data Mandiri (Steril):**
    *   Data template undangan disimpan menggunakan kunci ID unik pengguna di database lokal (IndexedDB) berstruktur khusus seperti `invitation_data_user_[USER_ID]`.
    *   Ketika pengguna baru login, pembuat tidak akan mewarisi coretan, teks nama, atau foto berukuran besar dari rancangan milik pengguna lain. Builder akan disajikan bersih, fresh, dan langsung diisi dengan aset default berkualitas tinggi dari RFX yang siap diubah secara instan.
*   **Sistem Sakelar "Publish" & Quota Jaring Pengaman:**
    *   Tulisan *"Rilis Tautan"* diubah secara konsisten menjadi **"Publish"**.
    *   Saat menekan tombol **Publish**, akan muncul lembar modal konfirmasi (Confirmation Modal Sheets) berpenampilan meyakinkan:
        *   Menanyakan persetujuan rilis.
        *   Menampilkan informasi akun aktif, jenis paket saat ini, batasan kuota undangan yang dimiliki (misal: Medium - 2 Undangan), serta jumlah undangan yang sudah diterbitkan.
        *   Jika sisa kuota masih ada, undangan berhasil diterbitkan ke tautan utama. Jika kuota penuh, akan diredireksi ke opsi peningkatan paket (upgrade package).

---

## 6. Langkah-Langkah Teknis Implementasi (Rencana Kerja)
1.  **Struktur Data:** Update schema jenis data `/src/types.ts` untuk mengakomodasi model registrasi User, Paket Pembelian, Detail Transaksi Pembayaran, dan Batas Kuota Undangan.
2.  **Sistem Autentikasi Frontend:** Rancang rute halaman pembuka (`/auth-gate`) yang menawarkan antarmuka premium registrasi/login sebelum mengakses aplikasi utama.
3.  **Halaman Pembayaran Terpadu:** Bangun rute visual khusus transaksi QRIS serta penampung deteksi bukti transfer asinkron di admin.
4.  **Layanan Detektor Gambar Puter.js:** Pasang api / helper asinkron yang melayani pemindaian OCR cerdas terhadap struk transfer murni menggunakan Puter.js tanpa kunci API eksternal.
5.  **Dasboard SaaS Pembangun:** Sesuaikan tata letak tab utama untuk menampilkan batasan terbit dinonaktifkan secara rapi bergantung paket pengguna yang aktif.

---

## 7. Checklist Implementasi Tugas (Task Checklist)

Berikut adalah daftar tugas terperinci yang wajib dikerjakan sesuai dengan alur rencana di atas. Status pengerjaan akan dicentang (`[x]`) satu per satu seiring berjalannya proses implementasi:

- [ ] **Tugas 1: Pembaruan Skema Tipe Data (`src/types.ts`)**
  - [ ] Definisikan interface `SaaSUser` (id, namaLengkap, email, noWa, sosmed, packageId, isCustomByRfx, activeSlug, dateRegistered, statusPembayaran).
  - [ ] Definisikan enum atau type untuk `SaaSPackage` (Reguler, Medium, Premium).
  - [ ] Definisikan interface `TransactionReport` (id, userId, userName, tanggal, jam, bankTujuan, nominalTransfer, statusValidasi, detailAnalisisAI, buktiTransferUrl).

- [ ] **Tugas 2: Halaman Atentikasi & Registrasi 3 Tahap (`src/components/AuthGate.tsx`)**
  - [ ] Tambahkan antarmuka Sign Up/Sign In premium bertema romantis-elegan di gerbang masuk aplikasi.
  - [ ] **Tahap 1:** Input Nama Lengkap & Autogenerasi Slug nama pasangan secara otomatis (contoh: `ridhojennie` atau `ridho-jennie`).
  - [ ] **Tahap 2:** Input Email, No WhatsApp, dan Akun Media Sosial.
  - [ ] **Tahap 3:** Pemilihan Paket (Regular, Medium, Premium) beserta pilihan modifikasi (*Custom Mandiri* atau *Custom Full by RFX.visual*).
  - [ ] **Sistem Pertahanan Duplikasi Slug:** Validasi real-time saat mengetik slug terhadap data pengguna yang sudah terdaftar di sistem penyimpanan lokal (IndexedDB) untuk mencegah bentrokan nama pasangan.

- [ ] **Tugas 3: Gerbang Rute Pembayaran QRIS & Transfer Dinamis**
  - [ ] Buat rute halaman transaksi setelah Sign Up yang menampilkan tagihan presisi sesuai paket.
  - [ ] Buat pemilih metode pembayaran (Bank Mandiri, SeaBank, ShopeePay/QRIS) dengan transisi visual yang mulus.
  - [ ] Desain tampilan kode QRIS yang megah di bagian tengah untuk kenyamanan digital scan via smartphone.
  - [ ] Sediakan widget drag-and-drop / selector berkas asli unggah bukti transfer berkinerja tinggi.

- [ ] **Tugas 4: Sistem Detektor Gambar Terverifikasi AI lewat Puter.js**
  - [ ] Muat pustaka Puter.js secara aman tanpa memerlukan API key eksternal.
  - [ ] Buat modul pemindaian visual bukti transfer menggunakan Vision API murni milik Puter.js.
  - [ ] Latih instruksi prompt analisis AI agar mampu membaca details: Tanggal, Waktu, Nominal, Akun Tujuan (Mandiri/SeaBank/ShopeePay), dan mendeteksi pemalsuan digital (Photoshop).
  - [ ] Tampilkan indikator proses pemindaian yang responsif beserta penayangan pemberitahuan tebal jika verifikasi ditolak/diterima AI.

- [ ] **Tugas 5: Portal Admin Pelaporan & Dokumen PDF Transaksi**
  - [ ] Desain antarmuka panel dashboard admin pembayaran yang elegan dan rapi.
  - [ ] Tampilkan pratinjau bukti transfer fisik berdampingan dengan lembar verifikasi rincian teks dari AI.
  - [ ] Tambahkan tombol *Cetak PDF* otomatis untuk ekspor laporan data laporan harian siap audit untuk RFX.visual.
  - [ ] Berikan tombol intervensi manual (override) bagi admin untuk menyetujui transaksi jika diperlukan.

- [ ] **Tugas 6: Isolasi Data SaaS Dashboard (Sterilisasi State)**
  - [ ] Cegah pembacaan data rancangan antarpengguna dengan memisahkan penyimpanan IndexedDB secara granular berbasis ID Pengguna (e.g. `wedding_data_user_[UUID]`).
  - [ ] Sediakan lembaran pembangun (builder) yang segar, bersih, dan langsung dimuat oleh template aset default berkas Gdrive RFX saat pertama kali masuk bagi pengguna baru.
  - [ ] Simpan preferensi login user secara aman di browser sehingga sesi pengerjaan tidak hilang.

- [ ] **Tugas 7: Tombol Publish & Batasan Kuota Paket**
  - [ ] Ubah label tombol rilis di builder dari *"Rilis Tautan"* menjadi **"Publish"**.
  - [ ] Munculkan modal popup konfirmasi yang meyakinkan ketika tombol ditekan, lengkap dengan detil paket pengguna yang sedang aktif dan sisa kuota terbit undangan.
  - [ ] Batasi penerbitan undangan secara ketat sesuai tier paket (Regular: 1, Medium: 2, Premium: 4 undangan). Berikan edukasi tombol upgrade paket jika pengguna melampaui kuotanya.

# Changelog

Semua perubahan signifikan pada **RuangHadir** (`www.ruanghadir.net`) dicatat secara berkala pada dokumen ini menggunakan format [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/).

## [2.0.0] — 2026-11-22

### Ditambahkan
- **Model Bisnis 2-Tier (Full Gratis + Enterprise):**
  - Paket **Gratis (`free`)**: Seluruh fitur inti terbuka (`Rp 0`), langsung bisa publish, akses semua 9 tema, tamu & nama personal tanpa batas, RSVP real-time, amplop digital, QR check-in, dan export CSV/PDF.
  - Paket **Enterprise (`enterprise`)**: Jalur khusus untuk perusahaan, Wedding Organizer, dan event korporat melalui kontak resmi `admin@ruanghadir.net`.
- **Portal & Backend Autentikasi Enterprise (`src/lib/enterprise.ts`, `/api/auth/enterprise`, `/api/enterprise/codes`):**
  - Validasi ketat **email perusahaan (company email)** yang menolak domain webmail publik (`gmail.com`, `yahoo.com`, `outlook.com`, dll.).
  - Verifikasi **kode akses khusus** berbasis hash SHA-256 pada tabel `enterprise_access` di Turso (dengan auto-migrasi skema serta dukungan fallback ENV `ENTERPRISE_ACCESS_CODES`).
  - Dukungan manajemen seat, masa berlaku kode, serta API admin untuk menerbitkan dan mencabut kode akses Enterprise.
- **Redesign Total Dashboard Pengguna (Pro-Grade SaaS Studio):**
  - Sidebar kiri permanen (`248px`) pada desktop + drawer responsif pada mobile, menggantikan tombol hamburger melayang lama.
  - Halaman **Ringkasan (Overview)** baru dengan KPI real-time (Total Kunjungan, Konfirmasi Hadir, Daftar Tamu, Status Publish), checklist kesiapan undangan, aksi cepat salin tautan, dan feed ucapan terbaru.
  - Top bar workspace yang bersih dengan indikator status *Live/Draft*, tombol salin tautan undangan, tombol buka halaman live, dan toggle pratinjau layar penuh yang akurat.
  - Panel **Paket & Enterprise** menggantikan paywall Pakasir lama.
- **Tema Baru `Heirloom Storybook 3D` (`StorybookInteractiveLayout.tsx`):**
  - Merombak total tema storybook lama menjadi buku hardcover bertekstur linen dengan efek buka sampul 3D, transisi balik halaman `rotateY`, navigasi swipe/keyboard/bookmark bab, galeri lightbox, dan buku tamu live.
- **Dokumentasi Engineering:**
  - Penambahan `CHANGELOG.md`, `docs/REQUIREMENTS.md`, dan `docs/ARCHITECTURE.md`.

### Diubah
- **Global Theme & Landing Page (`www.ruanghadir.net`):**
  - Menghapus seluruh angka/metrik fiktif dan testimoni placeholder.
  - Memperbarui katalog tema dengan filter kategori dan pratinjau screenshot asli.
  - Memperbarui bagian Harga menjadi 2 pilihan jelas: **Full Gratis (`Rp 0`)** dan **Enterprise (`admin@ruanghadir.net`)**.
  - Memperbarui alur registrasi (`/auth`) agar akun baru langsung aktif tanpa paywall pembayaran, ditambah tab khusus **Masuk Enterprise**.
- **Backward Compatibility (`src/lib/packageLimits.ts`, `src/lib/api.ts`):**
  - Seluruh akun lama dengan `package_id` (`demo`, `reguler`, `premium`, `luxury`) otomatis dipetakan ke kapabilitas **Full Gratis** tanpa memecahkan data yang sudah tersimpan di Turso.

### Diperbaiki
- **Blocker Deployment Vercel:** Mengganti 3 entri registry rusak (`http://mirrors.tencentyun.com/npm/...` untuk `@types/qrcode`, `jsqr`, `qrcode`) di `package-lock.json` ke `https://registry.npmjs.org/`.
- **Konfigurasi `package.json`:** Menghapus self-dependency `undangankita-rfxvisual: file:` dan mengunci `"engines": { "node": "22.x" }`.

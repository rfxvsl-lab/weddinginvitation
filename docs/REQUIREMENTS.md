# Product & Engineering Requirements — RuangHadir v2

Dokumen ini merinci kebutuhan fungsional, aturan bisnis, alur pengguna, serta standar kualitas antarmuka untuk platform **RuangHadir** (`www.ruanghadir.net`).

---

## 1. Visi Produk & Model Pricing

RuangHadir beroperasi dengan model bisnis **2-Tier yang transparan**:

| Aspek | Full Gratis (`free`) | Enterprise (`enterprise`) |
| :--- | :--- | :--- |
| **Biaya** | **Rp 0** (Gratis penuh) | Custom agreement |
| **Target Pengguna** | Pasangan, keluarga, acara pribadi | Perusahaan, Wedding Organizer, Event Agency, Instansi |
| **Cara Aktivasi** | Daftar langsung di `/auth?mode=register` (instan aktif) | Hubungi **`admin@ruanghadir.net`** → terima **Kode Akses Khusus** |
| **Syarat Login** | Email pribadi / Google OAuth | Wajib **Email Perusahaan** (non-webmail publik) + **Kode Akses Khusus** |
| **Tema** | Semua 9 tema terbuka (termasuk Heirloom Storybook 3D) | Semua tema + opsi custom tema/white-label |
| **Publish & Link Tamu** | Aktif langsung, nama tamu personal tak terbatas | Aktif langsung + dukungan custom domain (`.com`/`.id`) |
| **Proyek Undangan** | Hingga 3 proyek aktif | Tak terbatas (multi-klien / multi-event) |
| **Fitur Inti** | RSVP real-time, Amplop Digital, QR Check-in, Galeri, Musik, Export CSV/PDF | Seluruh fitur Gratis + Multi-seat tim + Dukungan khusus |

---

## 2. Alur Autentikasi & Keamanan

### 2.1. Alur Pengguna Gratis (Standard Auth)
1. Pengguna mendaftar melalui `/auth?mode=register` (atau Google OAuth).
2. Sistem memvalidasi keunikan email dan slug tautan (`ruanghadir.net/[slug]`).
3. Akun dibuat di Turso dengan `package_id = 'free'` dan `payment_status = 'success'`.
4. Pengguna langsung masuk ke `/dashboard` tanpa hambatan paywall.

### 2.2. Alur Pengguna Enterprise (Dedicated Company Gate)
1. Calon klien Enterprise menghubungi **`admin@ruanghadir.net`**.
2. Setelah kesepakatan, admin menerbitkan kode akses melalui `/api/enterprise/codes` (atau ENV `ENTERPRISE_ACCESS_CODES`) yang terikat pada:
   - `company_name` (nama organisasi),
   - `allowed_domain` (mis. `perusahaan.co.id`) atau `allowed_email` spesifik,
   - `access_code` (disimpan sebagai hash SHA-256 di database),
   - `max_seats` & `expires_at` (opsional).
3. Pembeli/anggota tim membuka tab **Akses Enterprise** pada `/auth?mode=enterprise`.
4. Pengguna memasukkan **Email Perusahaan** dan **Kode Akses Khusus**.
5. Backend (`POST /api/auth/enterprise`) memvalidasi:
   - Email bukan berasal dari domain webmail publik (`gmail.com`, `yahoo.com`, `outlook.com`, `icloud.com`, dll.).
   - Hash kode akses cocok dengan record aktif yang belum kedaluwarsa dan belum melebihi `max_seats`, serta domain/email cocok.
6. Jika valid, backend melakukan auto-provision (atau upgrade akun eksisting) ke `package_id = 'enterprise'`, menerbitkan cookie sesi `saas_user_session`, dan mengarahkan langsung ke `/dashboard`.

---

## 3. Standar Desain Global & Dashboard Pengguna

### 3.1. Prinsip Anti-AI-Slop
- **Dilarang** menggunakan blob gradasi warna acak di belakang panel kerja.
- **Dilarang** menampilkan angka metrik fiktif atau testimoni palsu.
- **Dilarang** menyembunyikan navigasi utama desktop di balik tombol hamburger melayang.

### 3.2. Standar Workspace Dashboard (`/dashboard`)
1. **Navigasi Sidebar Kiri Permanen (`248px` desktop, drawer di mobile):**
   - Kelompok menu terstruktur: *Ringkasan*, *Editor Undangan*, *Koleksi Tema*, *Daftar Tamu & WA*, *Analitik & RSVP*, *Profil*, dan *Paket & Enterprise*.
   - Switcher proyek undangan, status paket (*Gratis* / *Enterprise*), serta tombol utama **Publish**.
2. **Top Workspace Bar:**
   - Breadcrumb / judul halaman aktif, status publikasi (*Live* / *Draft*), tombol **Salin Tautan**, tombol **Buka Undangan**, dan toggle **Live Preview**.
3. **Halaman Ringkasan (Overview):**
   - 4 Kartu KPI berbasis data riil (Total Kunjungan, Tamu Hadir, Total Daftar Tamu, Ucapan Masuk).
   - **Checklist Kesiapan Undangan** (Data Mempelai, Jadwal Acara, Galeri, Daftar Tamu, Publikasi) dengan tombol aksi langsung ke bagian terkait.
   - Ringkasan ucapan RSVP terbaru.
4. **Panel Pratinjau (Live Preview):**
   - Dapat ditampilkan berdampingan (*split-view*) di layar lebar atau layar penuh, tanpa label tombol yang membingungkan.

---

## 4. Kebutuhan Non-Fungsional
- **Kompatibilitas:** Akun lama dengan `package_id` (`demo`, `reguler`, `premium`, `luxury`) tetap dapat login dan mengakses seluruh fitur Gratis tanpa migrasi destruktif.
- **Performa & Build:** Harus lulus build produksi Next.js 16 di Vercel dengan Node.js `22.x`.
- **Responsivitas:** Optimal pada mobile (`360px–430px`), tablet, dan desktop (`1280px+`).

## 6. iOS 26 Liquid Glass UI & Enterprise Video Studio (v2.3.0)
- **Global Design Language**: All SaaS marketing, authentication, and dashboard surfaces follow an iOS 26 Liquid Glass aesthetic (`.glx*` Tailwind v4 utilities, specular top-rim lighting, `backdrop-filter: blur() saturate()`, `#007AFF` primary system blue, `#1D1D1F` label typography, and `prefers-reduced-transparency` fallback).
- **Make Your Invitation Video (Enterprise-Only)**:
  - Auto-populates active wedding invitation data (couple names, event date/time, venue, invitation URL) into a 4-scene, 30fps animated composition.
  - Supports `9:16` (1080×1920 Reels/TikTok/WhatsApp Status), `1:1` (1080×1080), and `16:9` (1920×1080) outputs.
  - Free-tier users may preview their composition with an Enterprise Preview badge; watermark-free HD rendering and Remotion JSON Render Spec export are strictly unlocked for verified Enterprise accounts (`admin@ruanghadir.net`).

# Changelog

## [3.0.0] — 2026-11-23 — Keamanan server-side & Editorial Luxury

### Keamanan (breaking)
- Sesi login kini cookie `rh_session` httpOnly bertanda tangan HMAC; cookie base64 `saas_user_session` lama tidak berlaku lagi (semua user login ulang sekali).
- Login, daftar, Google, logout, dan `me` dipindah ke `/api/auth/*`. Google ID token diverifikasi di server.
- Password memakai scrypt + salt; hash SHA-256 lama di-upgrade otomatis saat login.
- `src/lib/api.ts` (server actions) kini hanya berisi fungsi ber-guard (owner / self / admin / publik). Akses database langsung ada di `src/lib/db.ts` (server-only).
- Halaman undangan publik tidak lagi mengirim daftar tamu ke browser, draf hanya bisa dilihat pemilik, dan konfirmasi tamu wajib kode undangan.
- Endpoint `debug-invitation` & halaman `test-*` dihapus; `simulate-payment` mati di production; `update-profile`, `notify-admin`, AI copy memerlukan sesi.
- Pembayaran Pakasir dinonaktifkan lewat `PAYMENTS_ENABLED` (kode tetap ada).
- `middleware.ts` diganti `proxy.ts` (konvensi Next.js 16).

### Desain
- Design system tunggal **Editorial Luxury**: ivory `#F8F5F0`, wine `#7A2E3B`, gold `#B8955A`, Playfair Display + Plus Jakarta Sans. Lapisan iOS Liquid Glass dihapus.
- Landing page ditulis ulang (`src/components/landing/*`) dengan screenshot asli setiap tema.
- Auth dengan panel visual undangan; dashboard memakai palet yang sama (zinc/amber/rose dipetakan ulang via `.saas-dash`).
- Zoom browser tidak lagi dikunci (aksesibilitas).

### Dibersihkan
- 60+ file mati (landing lama, komponen shadcn tak terpakai, file Vite) dan 35 dependensi tak terpakai.
- Slug undangan baru memakai tautan pilihan user, bukan `inv-inv--1234`.

## [2.3.0] — iOS 26 Liquid Glass Overhaul & Enterprise Video Studio
### Added
- **iOS 26 Liquid Glass Design System** (`src/index.css`): Added Tailwind v4 `@utility glx`, `glx-strong`, `glx-pill`, `glx-inset`, `glx-dark`, and `.glx-wallpaper` atmospheric backdrop inspired by Apple Liquid Glass material optics (`admos98/liquid-glass-suite`), with accessible `prefers-reduced-transparency` fallbacks.
- **Enterprise "Make Your Invitation Video" Studio** (`src/components/VideoInvitationStudio.tsx`): New Enterprise-gated dashboard module (`Video Studio`) built on a 30fps Remotion-aligned composition model featuring 4 motion presets (`Liquid Glass`, `Midnight Titanium`, `Editorial Pearl`, `Botanical Mist`), 3 aspect ratios (`9:16` Reels/TikTok/WA Status, `1:1` Feed, `16:9` Venue), live timeline scrubber, real browser HD `.webm` video rendering, and Remotion JSON Render Spec export.
- **Landing Page Video Showcase** (`src/components/saas/SaasVideoStudio.tsx`): Added interactive 9:16 iOS phone motion preview showcasing Enterprise video invitations with direct inquiry CTA to `admin@ruanghadir.net`.

### Changed
- **Global UI & Palette Overhaul**: Migrated Landing Page, Navigation (`SaasNav.tsx` floating glass capsule), Auth, and all Dashboard modules from warm ivory/wine to cohesive iOS 26 Liquid Glass (`#007AFF` System Blue, `#5856D6` Enterprise Indigo, `#1D1D1F` Apple label ink, frosted translucent surfaces).
- **Enterprise Pricing & Upgrade Panels**: Highlighted "Make Your Invitation Video" as an exclusive Enterprise capability across `SaasPricing.tsx` and `UpgradePanel.tsx`.

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


---

## [2.1.0] — 2026-11-23

### Added & Polished
- **Interactive Editorial Hero Stage (`SaasHero.tsx`):** Replaced stiff static phone mockup and broken `/rian-salsa` link with a tactile, interactive phone stage featuring 3 live-switchable editions (*Grand Ballroom*, *Storybook 3D*, *Javanese Classic*), working in-phone tabs (*Sampul*, *Acara*, *QR & RSVP*), and real `/preview/<themeId>` links.
- **Anti-Pinch-Zoom & Viewport Lock (`layout.tsx`, `index.css`, `App.tsx`):** Locked `maximumScale: 1, userScalable: false`, `overscroll-behavior: none`, `touch-action: pan-x pan-y`, coarse-pointer 16px input floor, and gesture/ctrl+wheel zoom guards inside the dashboard workspace.
- **100% Unified Iconography (`lucide-react`):** Eliminated mixed `react-icons/pi` duotone icons and custom legacy icon sets across `EditorPanel`, `ThemeSelector`, `GuestManager`, `AnalyticsDashboard`, `ProfilePanel`, `AuthGate`, `SignInView`, and `SignUpView`.
- **Dashboard Inner Layout Polish:** Replaced the bouncing macOS `FloatingDock` and rainbow pills in `EditorPanel` with a crisp sticky SaaS tab bar; removed dead simulator buttons and pastel gradient cards in `AnalyticsDashboard`; added Storybook 3D visual cover & category filters to `ThemeSelector`; unified `ProfilePanel` to 2-tier Gratis/Enterprise status.
- **Legal Pages & Footer Sync (`SaasLegal.tsx`, `terms-of-service`, `privacy-policy`, `cookie-policy`, `SaasClosing.tsx`):** Updated all legal copy to the 2026 Full Gratis + Enterprise (`admin@ruanghadir.net`) model, added sibling legal document switcher tabs, and fixed dead `/about` & `/contact` links.

# Changelog

## Tema baru

- 2026-11-23 — **Taman Kertas** (Spesial · 2D pop-up kertas)
- 2026-11-23 — **Lembayung** (Spesial · 2.5D senja → malam berlampion)
- 2026-11-23 — **Sage Garden** (minimalis) · pilot Theme Kit

## [3.7.0] — 2026-11-24 — 12/12 tema memakai standar + seni lukisan

- Ornamen bunga & panggung pembuka kini lukisan, bukan SVG generik: buket mawar lukisan diwarnai ulang (blush, ivory, burgundy, peach, lavender, dusty blue, coral, campur) + buket putih-emas, daun, gunungan, dan lukisan cat air berlapis (padang, pondok, desa, langit, malam) — `scripts/build_art.py` → `public/assets/art/`.
- 8 tema lama dimigrasi ke Theme Kit dengan id sama (undangan yang sudah ada ikut berubah):
  - **Luxury Pink Elegant** — amplop bersegel, pondok bunga cat air, mawar blush (+ varian Peach, Lilac, Marun)
  - **Grand Ballroom** — tirai beludru berlipit yang terbelah, lampu kristal berayun, jendela lengkung, lantai marmer, mawar putih (+ Burgundy, Emerald)
  - **Royal Arabian Night** — gerbang mihrab emas berpola bintang, lentera berayun, langit malam cat air (+ Biru Malam, Marun)
  - **Javanese Classic** — kelir berlampu blencong, bayangan gunungan yang digerakkan, batik kawung, bunga putih-emas (+ Hijau Pupus, Indigo)
  - **Lagu Kita** (dulu SpotiLove) — piringan hitam berlabel foto, equalizer, kanopi daun; tanpa merek (+ Sunset, Lilac)
  - **Cinema Rouge** (dulu Netflix Luxury) — premiere bioskop merah-hitam orisinal, hitung mundur pita film; tanpa merek
  - **Cinematic 2D Parallax** — perjalanan lukisan cat air bab per bab
  - **Heirloom Storybook** — buku bersampul kulit, halaman berilustrasi yang dibalik masuk
- Warna cahaya tema sinematik mengikuti warna utama (varian Rose Gold/Platinum/Zamrud ikut berubah).

## [3.6.0] — 2026-11-24 — Standar undangan untuk semua tema

- Konsep standar (mengikuti template premium) di Theme Kit, berlaku untuk semua tema Kit dan tema harian:
  - sampul dengan kartu tamu (Kepada Yth. / nama / Di Tempat);
  - panggung pembuka 2.5D: kamera turun dari langit, lapisan taman naik satu per satu, kupu-kupu, lalu nama mempelai masuk dari kiri & kanan;
  - rangkaian bunga (mawar vektor) yang mengapit foto & panel, masuk dari samping dan bergoyang mengikuti gulir;
  - panel lengkung untuk mempelai & acara dengan buket di puncaknya, Save the Date, tayangan foto (slideshow), daftar ucapan dengan avatar & waktu, penutup "Terima kasih" di atas foto + keluarga besar;
  - menu navigasi ☰ dan tombol musik piringan hitam.
- Varian warna per tema yang bisa dipilih pemilik di dashboard (Pengaturan → tema): Sage Garden (Sage, Dusty Blue, Terracotta, Mauve), Dark Luxury Cinematic (Emas Sampanye, Rose Gold, Platinum, Zamrud).
- Backlog: 8 tema lama dijadwalkan dimigrasi ke standar ini satu per satu oleh jadwal otomatis.

## [3.5.0] — 2026-11-23 — Dark Luxury Cinematic dirombak

- Tema `rfx-dark` dibangun ulang di Theme Kit sebagai tema Spesial bergaya film (ID tetap, jadi undangan yang sudah memakainya otomatis berubah).
- Sampul baru `film`: kartu judul → hitung mundur pita film 3-2-1 → layar hitam terbelah.
- 10 bab: foto layar penuh dengan Ken Burns, cahaya proyektor, bokeh & hujan emas, kebocoran cahaya, cincin hitung mundur, pita film berisi foto yang bergulir dengan kecepatan berbeda, butiran film, dan letterbox di pembuka & penutup. Palet hitam pekat + emas sampanye + gading; Italiana, Marcellus, Albert Sans.
- Bab menerima data foto undangan (`ChapterData`); `heroAlign: 'bottom'` untuk judul gaya film.

## [3.4.0] — 2026-11-23 — Tema Spesial bab per bab

- Tema Spesial dirombak ke gaya situs naratif paralaks: setiap bagian undangan adalah bab adegan layar penuh; teks berada di dalam adegan dengan lapisan di belakang dan di depannya; lapisan bergerak sesuai kedalaman saat bab masuk, ditahan (sticky), dan keluar.
- `kit/chapters.tsx` (`ArtLayer`, `ArtSvg`, `Sky`), `Px` untuk judul/foto/kartu yang ikut bergerak, nama mempelai berpisah saat bab pembuka ditinggalkan.
- **Lembayung**: 10 bab — kaki gunung, candi, telaga, sawah terasering, laut & perahu, jalan pulang, hutan kunang-kunang, telaga berlampion, desa malam, penutup di bawah bulan.
- **Taman Kertas**: 10 halaman pop-up — gapura bunga, rumah kecil, pelangi, balon udara, tenda pesta, jalan setapak, padang bunga, kado & konfeti, pesawat kertas, bintang & bulan gantung.
- Lapisan bab yang jauh dari layar disembunyikan agar ringan di ponsel.

## [3.3.0] — 2026-11-23 — Tema Spesial 2D/2.5D

- `src/themes/kit/scene.tsx`: mesin adegan paralaks — lapisan berdasar kedalaman bergerak saat digulir, mengikuti giroskop/kursor, dan intro kamera (`dolly`, `popup`, `rise`) setelah sampul dibuka; utilitas bukit prosedural, campuran warna, keyframe warna per progres gulir. Menghormati "kurangi gerakan".
- Tema **Lembayung** dan **Taman Kertas** (tier `special`), label **Spesial** + filter "Spesial 2.5D" di katalog landing & dashboard.
- Semua tema Spesial gratis untuk sementara; `canUseSpecialTheme()` di `lib/packageLimits.ts` siap dipakai untuk membatasi ke Enterprise nanti.

## [3.2.0] — 2026-11-23 — Theme Kit

- `src/themes/`: tema baru cukup satu file `catalog/<id>.tsx` (`defineTheme`). Semua fitur undangan disediakan `kit/KitLayout.tsx`; tampilan diatur lewat palet, font, ornamen SVG, dan varian (5 sampul, 3 hero, 5 bingkai foto, 3 gaya acara, 3 galeri, 5 ambient, 4 gaya reveal).
- Tema Kit otomatis masuk daftar tema dashboard, landing, dan halaman pratinjau; label **Baru** 14 hari dan diurutkan paling depan. Jumlah tema di harga dihitung otomatis.
- `scripts/theme_shots.py`: screenshot katalog + QA (sampul, setelah dibuka, lembar kontak, cek fitur wajib).
- `docs/themes/PLAYBOOK.md` & `BACKLOG.md` untuk produksi tema terjadwal.

## [3.1.1] — 2026-11-23

- Zoom kembali dikunci di seluruh aplikasi & pratinjau undangan (viewport `user-scalable=no`, `touch-action: pan-x pan-y`, pencegahan gesture pinch iOS, ctrl+scroll, ctrl +/-) lewat `components/system/ZoomLock.tsx`.

## [3.1.0] — 2026-11-23 — Film undangan Enterprise 1:1 dengan template

- Video contoh Enterprise dibangun ulang per tema dari aset, tipografi, dan mekanik template aslinya:
  - **Javanese Classic** (`motion/JavaneseFilm.tsx`): gunungan di bawah cahaya blencong dengan bayangan di kelir, kayonan (gunungan diputar), aksara ꦥꦮꦶꦮꦲꦤ꧀ ditulis, tombol "Mlebet Undangan", bunga emas, Sang Penganten, Pahargyan, galeri, dan penutup *tancep kayon*.
  - **Grand Ballroom** (`motion/BallroomFilm.tsx`): tirai slate, mahkota & plakat OPEN di tali, celah cahaya, tali swag, nama berjatuhan, bingkai berlapis, tanggal slot-machine, kartu mempelai berbalik 3D, Order of Events, tirai menutup.
  - **Luxury Pink** (`motion/PinkFilm.tsx`): amplop bersegel lilin, tutup terbuka 3D, kartu naik, nama ditulis tangan, bingkai lengkung + sulur, hitung mundur dipercepat ke hari H, Mempelai, Rangkaian Acara, segel dicap sebagai penutup.
- `motion/core.tsx`: time remapping (speed ramp) dengan transisi kecepatan halus, motion blur searah (SVG), efek echo, text animator per huruf, trim paths, spring, keyframe bezier.
- Foto sampel memakai foto asli data demo template (Rian & Salsa); plate latar AI (`assets/video-scenes`) dihapus.
- Dashboard meneruskan orang tua, dua acara, dan galeri ke pemutar video.

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

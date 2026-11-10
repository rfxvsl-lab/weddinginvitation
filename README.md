# RuangHadir

Platform undangan pernikahan digital (`ruanghadir.net`): editor undangan dengan 9 tema, daftar tamu dan QR check-in, RSVP, dinding momen tamu, pembayaran Pakasir, dan panel admin.

Stack: Next.js 16 (App Router) · React 19 · Tailwind 4 · Turso (libSQL) · Pakasir · Cloudinary · Vercel.

## Menjalankan secara lokal

Butuh Node.js 22 (lihat `.nvmrc`).

```bash
npm ci
```

```bash
cp .env.example .env.local
```

Isi minimal `SESSION_SECRET` di `.env.local` (buat dengan `openssl rand -base64 48`). Tanpa `TURSO_DATABASE_URL`, skrip memakai database file lokal `./local.db`; untuk aplikasinya isi `TURSO_DATABASE_URL=file:./local.db`.

```bash
npm run migrate
```

```bash
npx tsx scripts/seed-local.ts
```

```bash
npm run dev
```

Seed membuat akun `demo@local.test` / `demo12345` (paket luxury, sudah lunas) dan undangan di `http://localhost:3000/rian-salsa`.

## Variabel lingkungan

Daftar lengkap dan penjelasannya ada di [`.env.example`](.env.example). Yang wajib di production:

| Variabel | Fungsi |
| --- | --- |
| `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | Database |
| `SESSION_SECRET` | Penanda tangan cookie session (≥ 32 karakter, rahasia). Menggantinya membuat semua user harus login ulang. |
| `PAKASIR_PROJECT_SLUG`, `PAKASIR_API_KEY` | Pembayaran |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Login Google |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Unggah foto |
| `NEXT_PUBLIC_APP_URL` | URL publik |

`PAKASIR_BASE_URL` hanya untuk test (gateway tiruan); kosongkan di production.

## Database dan migrasi

Migrasi ada di `migrations/` dan dijalankan berurutan oleh satu skrip yang mencatat versinya di tabel `schema_migrations`:

```bash
npm run migrate
```

```bash
node scripts/migrate.mjs --status
```

Migrasi lama (001–006) dulu dijalankan manual; skrip mendeteksi kolom/tabel yang sudah ada dan melewatinya.

**Admin** ditentukan kolom `users.role`, bukan email. Daftar dulu lewat aplikasi, lalu:

```bash
node scripts/make-admin.mjs email@contoh.com
```

Atau isi `ADMIN_EMAIL` sebelum `npm run migrate`. User perlu login ulang agar perannya berlaku.

## Deploy (Vercel)

1. Set variabel lingkungan di atas, termasuk `SESSION_SECRET` yang baru.
2. Jalankan `npm run migrate` terhadap database production (sekali per migrasi baru).
3. Deploy. Saat pertama kali setelah perubahan session, semua user harus login ulang; password lama tetap berlaku.
4. Pastikan URL webhook Pakasir menunjuk ke `https://<domain>/api/pakasir-webhook`.

## Arsitektur singkat

| Lokasi | Isi |
| --- | --- |
| `src/server/` | Kode khusus server: akses database (`repo.ts`), session, password, pembayaran, rate limit, validasi. **Tidak** boleh diimpor dari komponen client. |
| `src/lib/api.ts` | Server action yang dipanggil browser. Setiap fungsi wajib memeriksa session dan kepemilikan. |
| `src/lib/authActions.ts` | Login, registrasi, login Google, logout. |
| `src/app/api/` | Route HTTP: pembayaran, webhook Pakasir, kalender, pencarian musik, AI copywriter. |
| `src/components/templates/` | Sembilan tema undangan, dimuat per tema (`next/dynamic`). |
| `src/middleware.ts` | Memverifikasi cookie session untuk `/dashboard` dan `/admin`. |

Aturan keamanan yang dijaga test:

- Identitas selalu dari cookie session bertanda tangan; `userId`, harga, dan status dari browser diabaikan.
- Status bayar hanya berubah lewat webhook Pakasir yang diverifikasi ulang ke API Pakasir (atau persetujuan admin), dan hanya sekali per order.
- Halaman undangan publik tidak pernah mengirim nomor telepon tamu.

## Test dan pemeriksaan

```bash
npm run check
```

Menjalankan typecheck (strict), lint, dan unit test. Test end-to-end butuh build dan Chromium:

```bash
npm run build && npm run test:e2e
```

E2E memakai database SQLite sementara dan gateway Pakasir tiruan, jadi tidak butuh secret. Skenario: daftar/masuk/keluar, isolasi data antar-user, bayar paket, upgrade, panel admin, dan halaman undangan publik.

**Lint** memakai *bulk suppressions*: pelanggaran lama dicatat di `eslint-suppressions.json`, dan CI hanya gagal untuk pelanggaran baru. Setelah membereskan pelanggaran lama, jalankan `npm run lint:prune` agar catatannya menyusut.

Alat ukur:

```bash
npm run perf -- http://localhost:3000/ http://localhost:3000/rian-salsa
```

```bash
npm run a11y -- http://localhost:3000/ http://localhost:3000/rian-salsa
```

`perf` mengukur LCP dan ukuran unduhan pada profil HP 4G lambat; `a11y` menjalankan audit WCAG 2.1 AA (axe-core), termasuk isi iframe undangan.

```bash
npm run slop
```

`slop` memindai UI untuk klaim tanpa sumber (statistik, rating, testimoni), tautan ke halaman yang tidak ada, dan aset yang hilang; CI gagal bila ada. Kriteria lengkapnya di `.claude/skills/ui-no-slop/`.

Thumbnail tema dibuat dari halaman demo (jalankan saat aplikasi hidup dan foto contoh bisa dimuat):

```bash
node scripts/theme-thumbnails.mjs http://localhost:3000
```

CI (`.github/workflows/ci.yml`) menjalankan semuanya di setiap pull request.

## Skill untuk Claude Code

Di `.claude/skills/`:

- `ui-no-slop` — kriteria desain tanpa "AI slop" (klaim jujur, copy spesifik, visual konsisten) dan pemindainya.
- `ui-verify` — cara membuktikan perubahan UI: screenshot sebelum/sesudah, pixel diff, audit aksesibilitas, ukur performa.

## Lisensi aset

Ilustrasi gunungan wayang: lisensi Vecteezy di `docs/licenses/`.

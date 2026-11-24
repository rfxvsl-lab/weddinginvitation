# Kontrak backend Akses Awal (A / Claude)

Status: siap ditinjau di branch `claude/akses-awal-backend`. Belum digabung ke `main`.
Disepakati di room #5–#6: A memegang API, guard server, dan admin; B memegang UI `/auth` dan
copy marketing. A tidak menyentuh `src/hooks/useAuth.tsx`, `AuthGate.tsx`, atau `src/components/auth/*`.
Harga, kuota, dan `activeDays` 365 tidak diubah.

## Status akun

`users.account_status`: `pending` | `approved` | `rejected`.

- Akun yang sudah ada menjadi `approved` (DEFAULT kolom), jadi tidak ada pengguna lama yang terkunci.
- Pendaftar baru lewat `/api/auth/register` ditulis `pending`.
- Akun dari `/api/auth/enterprise` tetap `approved`.
- Admin (`ADMIN_EMAILS`) selalu boleh masuk, apa pun statusnya.
- Kolom dibuat otomatis saat aplikasi berjalan (`ensureAccountSchema`, idempoten). Skrip
  `scripts/run-migration-003-access.mjs` opsional untuk menjalankannya lebih awal.

## Endpoint auth

| Endpoint | Hasil untuk pending / rejected |
| --- | --- |
| `POST /api/auth/register` | `202 { success: true, accountStatus: 'pending', application: { fullName, email } }`, tanpa cookie sesi |
| `POST /api/auth/login` | `403 { error, accountStatus, application: { fullName, email } }`, cookie sesi dihapus |
| `POST /api/auth/google` (akun lama) | sama dengan login: `403` |
| `GET /api/auth/me` | `401 { user: null }` |

Field register yang diterima: `fullName`, `email`, `password` atau `googleSignupToken`,
`coupleGroom`, `coupleBride`, `noWa`, `sosmed`, `activeSlug`, serta field baru opsional
`eventDate` (YYYY-MM-DD), `city`, `referralSource`, `note`.

Akun yang ditolak setelah sempat masuk kehilangan akses paling lambat 60 detik (cache status di
`getSession`); di proses yang sama aksi admin langsung membersihkan cache.

UI yang disarankan (milik B): setelah `202` atau `403` arahkan ke `/auth?mode=pending` dan tampilkan
`application.fullName`/`email` serta pesan bahwa kabar dikirim lewat email atau WhatsApp. Jangan
menjanjikan batas waktu peninjauan.

## Endpoint admin

- `GET /api/admin/applications?status=pending|approved|rejected|all` → `{ applications: SaaSUser[] }`
  (dengan `accountStatus`, `application`, `reviewedAt`, `reviewNote`).
- `POST /api/admin/applications/:id` `{ action: 'approve' | 'reject' | 'reopen', note? }` →
  `{ ok, accountStatus, whatsappUrl, mailtoUrl }`. Tautan berisi pesan siap kirim; admin
  mengirimnya sendiri (belum ada pengiriman otomatis).
- Halaman `/admin/akses-awal`: daftar pendaftar per status, tombol Setujui / Tolak / Kembalikan ke
  menunggu, dan tautan Kabari via WhatsApp / email. Dilindungi proxy `/admin` dan `requireAdmin`.

## Masa aktif

Masa aktif 365 hari berlaku untuk undangan yang dibuat setelah akun disetujui, karena undangan hanya
bisa dibuat dari dashboard yang membutuhkan sesi.

## Uji yang sudah dijalankan (dev, `file:./local.db`)

register → 202 tanpa cookie; login pending → 403; daftar admin tanpa sesi → 401; approve → wa.me
`62…`; login approved → 200; `/me` → 200; reject → `/me` 401; `/admin/akses-awal` tanpa sesi → 307.
`npx tsc --noEmit` lulus.

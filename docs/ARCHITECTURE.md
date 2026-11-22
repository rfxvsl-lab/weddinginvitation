# System Architecture — RuangHadir v2

Dokumen ini menjelaskan arsitektur teknis, skema database, endpoint API, dan sistem desain global RuangHadir (`www.ruanghadir.net`).

---

## 1. Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript 5.8)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) + Custom Design Tokens (`.saas-scope`, `.saas-dash`)
- **Animasi:** `motion/react` (Framer Motion v12), Lenis smooth scroll
- **Database:** Turso / LibSQL (`@libsql/client`) via server-side `src/lib/turso.ts`
- **Deployment:** Vercel (Node.js `22.x`, production domain `www.ruanghadir.net`)

---

## 2. Skema Database Tambahan (`enterprise_access`)

Tabel `enterprise_access` dibuat secara idempoten melalui `ensureEnterpriseSchema()` di `src/lib/enterprise.ts`:

```sql
CREATE TABLE IF NOT EXISTS enterprise_access (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  allowed_domain TEXT NOT NULL,
  allowed_email TEXT,
  access_code_hash TEXT NOT NULL,
  code_hint TEXT NOT NULL,
  max_seats INTEGER NOT NULL DEFAULT 10,
  used_seats INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  expires_at TEXT,
  created_at TEXT NOT NULL
);
```

- **Keamanan Kode:** Kode akses tidak pernah disimpan dalam bentuk plaintext; hanya hash `SHA-256("ruanghadir-ent::" + normalizedCode)` dan `code_hint` yang tersimpan.
- **Fallback ENV:** Variabel lingkungan opsional `ENTERPRISE_ACCESS_CODES` mendukung format `domain.com:KODE-ENT-01:Nama Perusahaan` (dipisahkan `;` atau baris baru) untuk provisioning cepat tanpa akses DB langsung.

---

## 3. Endpoint API Utama

| Method | Endpoint | Fungsi |
| :--- | :--- | :--- |
| `POST` | `/api/auth/enterprise` | Validasi email perusahaan (blokir domain publik) + kode akses khusus, auto-provision/upgrade akun `enterprise`, dan menerbitkan cookie `saas_user_session`. |
| `GET` | `/api/enterprise/codes` | (Admin) Menampilkan seluruh kode akses Enterprise beserta pemakaian seat. |
| `POST` | `/api/enterprise/codes` | (Admin) Menerbitkan kode akses baru untuk domain/email perusahaan tertentu. |
| `DELETE` | `/api/enterprise/codes?id=...` | (Admin) Mencabut (`active = 0`) kode akses Enterprise. |
| `GET` | `/api/calendar/[slug]` | Menghasilkan file `.ics` jadwal acara pernikahan. |
| `POST` | `/api/ai/invitation-copy` | Bantuan penulisan narasi undangan. |

---

## 4. Sistem Desain Global (Editorial Workspace Tokens)

Seluruh halaman marketing, autentikasi, dan dashboard berbagi satu bahasa visual yang kohesif:

- **Canvas:** `#F8F6F2` (Warm Alabaster) — bersih, tenang, kontras tinggi terhadap kartu.
- **Surface:** `#FFFFFF` dengan border halus `1px solid #E7E1D8`.
- **Ink Primary / Secondary / Muted:** `#1C1614` / `#574B45` / `#7F726B`.
- **Brand Primary (Burgundy Wine):** `#8E2F45` (hover `#742539`, soft `#F9ECEF`).
- **Brand Accent (Antique Gold):** `#C6A15B` (soft `#F7EEDD`).
- **Tipografi:**
  - Editorial Heading (Marketing): `Cormorant Garamond`
  - UI & Dashboard Typography: `Plus Jakarta Sans` & `Inter`
  - Monospace (Slug, Kode, Angka Tabular): `JetBrains Mono`

---

## 5. Struktur Komponen Dashboard (`/dashboard`)

```text
src/
├── App.tsx                          # Shell utama Dashboard (Sidebar + Topbar + Content + Split Preview)
├── components/
│   ├── DashboardSidebar.tsx         # Persistent left sidebar (desktop) + mobile Sheet drawer
│   ├── DashboardOverview.tsx        # Halaman Ringkasan: KPI riil, Checklist Kesiapan, Recent RSVPs
│   ├── EditorPanel.tsx              # Editor data mempelai, acara, kisah, galeri, amplop, musik
│   ├── ThemeSelector.tsx            # Galeri pemilihan 9 tema (semua terbuka)
│   ├── GuestManager.tsx             # Manajemen daftar tamu, link personal & kirim WA
│   ├── AnalyticsDashboard.tsx       # Statistik kunjungan & RSVP
│   ├── ProfilePanel.tsx             # Pengaturan profil & slug
│   ├── UpgradePanel.tsx             # Panel status paket Gratis vs Enterprise (admin@ruanghadir.net)
│   └── auth/
│       ├── EnterpriseSignInView.tsx # Portal login khusus Email Perusahaan + Kode Akses
│       ├── SignInView.tsx           # Login akun reguler + link ke Portal Enterprise
│       └── SignUpView.tsx           # Registrasi instan akun Full Gratis (tanpa paywall)
```

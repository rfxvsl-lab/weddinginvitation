# QA visual & alur A — integrasi `codex/marketing-refinement@99d39a9`

Server dev lokal (`next dev`, SQLite `file:./local.db`, `ADMIN_EMAILS=admin@test.local`), Chromium headless
(Playwright) di lebar 390 / 768 / 1024 / 1280. Tidak ada koneksi produksi, WhatsApp, atau email.

## Lulus

- Landing: tanpa overflow horizontal di keempat lebar. Nav penuh di 1024/1280; menu disclosure di 390/768
  (`aria-expanded` true → Escape → false, fokus kembali ke tombol, scroll tidak dikunci).
- Filter tema: 7 tombol `aria-pressed`, hanya satu `true` setelah klik; teks "6 dari 6 tema Spesial 2.5D".
- FAQ: 9 item, `<details>` terbuka saat diklik.
- Demo video Enterprise: diputar saat terlihat (IntersectionObserver). Hitam di screenshot halaman penuh
  karena belum terlihat, bukan bug.
- Form 3 langkah: validasi bawaan menandai nama/pria/wanita/kota; fokus pindah ke judul tiap langkah;
  slug terisi `dimas-ayu`; pilihan sumber informasi 6 opsi.
- Kirim → `/auth?mode=pending` "Pendaftaran kalian sudah kami terima.", tanpa cookie sesi.
  Muat ulang → "Periksa status pendaftaran kalian." (tidak menebak status).
- `/dashboard` anonim → `/auth?redirect=%2Fdashboard`.
- Login pending → tampilan pending; admin Setujui → tautan `wa.me/62…`; login disetujui → `/dashboard`.
- Admin Tolak + catatan → login → "Pendaftaran belum disetujui."
- Akun lama (status NULL di DB) → login → `/dashboard`.

## Temuan

| # | Prioritas | Lokasi | Temuan | Usulan |
| --- | --- | --- | --- | --- |
| 1 | Tinggi | `SignUpView.tsx` (milik B) | Semua input daftar punya `padding-left: 42px` dari `.saas-input` (slot ikon) tanpa ikon; teks & placeholder tampak menjorok (`signup1-390.jpg`). | Tambah `saas-input-flush` pada `inputClass` (kelas sudah ada di `src/index.css`). |
| 2 | Sedang | Judul langkah & status (milik B) | Fokus terprogram ke `<h1 tabIndex=-1>` menampilkan cincin fokus 2px saat halaman dibuka (`signup1-390.jpg`). | `outline: none` untuk `[tabindex="-1"]:focus` (judul tetap diumumkan pembaca layar). |
| 3 | Sedang | `SaasVideoStudio.tsx` (sudah ada di `main`) | "Hubungi tim Enterprise": teks #233C35 di #B96634 = rasio 2,83:1 (di bawah 4,5:1). | Teks putih atau oranye lebih gelap. |
| 4 | Rendah | `SignUpView.tsx` | Memilih "Lainnya" tidak membuka isian teks, jadi admin hanya melihat "Lainnya". | Isian opsional saat "Lainnya" dipilih, dikirim sebagai `referralSource: "Lainnya: …"`. |
| 5 | Rendah | Footer landing | Tautan footer tingginya 19px, berdekatan secara vertikal di ponsel. | Padding vertikal supaya target ≥24px. |
| 6 | Rendah | Menu 768 | "Daftar Akses Awal" muncul di header dan di dalam menu sekaligus. | Opsional: sembunyikan salah satunya di 768. |
| 7 | Info | `/api/auth/me` | 401 untuk tamu anonim tercatat sebagai error konsol. | Biarkan, atau jangan memanggil `/me` bila tidak ada cookie. |

## Diperbaiki A (branch `claude/akses-awal-backend`, file milik A)

- `/admin/akses-awal` melebar 150px di 390px → kartu di bawah 1024px, tabel di ≥1024px, tanpa overflow
  di 390/768/1280 (`admin2-390.jpg`, `admin2-1280.jpg`).
- Judul admin memakai font sans aplikasi (sebelumnya serif bawaan h1).
- Antrean "Menunggu" tidak lagi memuat akun `ADMIN_EMAILS`.

## Putaran 2 — palet admin & Editor (PR #3 head `73d8ab4`)

Admin (`6adb87c`): semua hex literal diganti variabel `--rh-*` di root `.rh-product`; status memakai
primary-soft/primary (5,54:1), gold-soft/gold-deep (5,53:1), danger di paper (6,95:1). Id catatan
`note-card-*` / `note-table-*` → 0 id ganda. Overflow 0 di 390/768/1280 (`admin2-*.jpg` diperbarui).

Editor, 6 tab (Mempelai, Detail Acara, Cerita Cinta, Galeri & Musik, Kado Digital, Kutipan) di 1280 & 390:
tidak ada warna keunguan yang terhitung di DOM terlihat, overflow 0, tanpa error halaman. Toggle QR on→off→on
berfungsi, isian "Label tombol" menyimpan nilai, input file `image/*` & `audio/*` ada.

| # | Prioritas | Lokasi | Temuan |
| --- | --- | --- | --- |
| E1 | Sedang | `EditorPanel.tsx` h5 | Subjudul "Musik Pengiring…", "Cari Lagu…", "Daftar Foto Prewedding…", "Gambar Sampul…", "Waktu Hitung Mundur…" tampil dengan serif cadangan (Times) karena aturan global `h1–h6 { font-serif }` di `src/index.css`. Usul: `font-sans` pada h5 editor, atau `.rh-product h5 { font-family: inherit }`. |
| E2 | Sedang (sudah ada di `main`) | 5 toggle `sr-only peer` | Checkbox tanpa nama aksesibel dan `peer-focus:outline-none` → fokus keyboard tidak terlihat. Usul: `aria-label` (mis. "Aktifkan Digital Entry Pass") + `peer-focus-visible:outline` di track. |
| E3 | Rendah | Isian URL | 12 input URL memakai JetBrains Mono 16px sementara isian lain Manrope; URL terpotong lebih awal (`ed-1280-galeri2.jpg`). Bisa disengaja; pertimbangkan Manrope 14px. |
| E4 | Info | Pratinjau OG/BG | Gambar `lh3.googleusercontent` gagal dimuat di sandbox QA (tanpa jaringan keluar), bukan bug aplikasi. |

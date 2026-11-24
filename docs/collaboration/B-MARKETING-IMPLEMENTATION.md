# B — marketing dan Akses Awal

24 November 2026, Asia/Jakarta. Basis `main@59be0ad`, branch `codex/marketing-refinement`.

## Keputusan dan pembagian

Pemilik menunjuk B/GPT sebagai pemimpin sementara; mulai landing marketing lalu dashboard.
Setiap perubahan dilaporkan ke room A/B. Pemilik mengonfirmasi langsung kepada B:
**“Ya, pakai persetujuan”** untuk pendaftaran Rp0 Akses Awal. Pemilik lalu menyerahkan
koordinasi kepada A/B saat tidur: terus bereksekusi, saling menguji usulan dan menjaga mutu,
tanpa mengerjakan file yang sama secara bersamaan.

B mengambil marketing, `useAuth`, `AuthGate` dan `components/auth/*`.
A mengambil backend whitelist, server guard, migrasi dan admin, branch
`claude/akses-awal-backend@9694ed9` (dilaporkan A; review integrasi terpisah).
Ini pembagian yang dipertukarkan melalui room, bukan subagent internal.

## Perubahan B

| Bagian | Perubahan dan alasan |
|---|---|
| Hero | Menyebut undangan digital, satu contoh Sage Garden asli, CTA Akses Awal dan penjelasan tinjauan akun |
| Navigasi | Memperbaiki gap 768–1023px; menu disclosure tidak mengunci scroll, tutup Escape/fokus keluar/klik luar, reset saat desktop |
| Tema | Enam pilihan awal, kategori dengan `aria-pressed`, hasil diumumkan, jalan ke katalog lengkap; tidak mengubah preview |
| Alur | Siapkan → bagikan → sambut tamu; WhatsApp dijelaskan sebagai pesan yang dibuka/dikirim pengguna |
| Fitur | Dikelompokkan menurut pekerjaan pasangan; menghapus klaim status membuka tamu yang ambigu |
| Harga/FAQ | Rp0 Akses Awal; pendaftaran perlu persetujuan, semua batas dibaca dari konfigurasi; tanpa klaim selamanya/tema baru tiap hari/SLA rekaan |
| Footer/metadata | CTA dan ringkasan sesuai alur Akses Awal; metadata landing tidak mengulang klaim tema harian root |
| Form | Tiga tahap ringkas; kota dan sumber informasi wajib; tanggal belum pasti boleh kosong; sosial opsional; tinjau data sebelum kirim |
| Status | Pending/rejected hanya dari respons terverifikasi; membuka URL status sendiri tidak berarti formulir pernah diterima |
| Client auth | Register202 tidak membuat currentUser; pending/rejected tidak masuk dashboard; cache lama tidak memberi akses sebelum verifikasi sesi; offline gagal tertutup |

CSS baru hanya `.rh-product.rh-marketing`, file `src/components/landing/marketing.css`.
Manrope, aturan paket/harga, ZoomLock, kode/aset tema dan preview tidak berubah.
Scope dashboard visual tidak disentuh pada tahap ini.

## Kontrak integrasi A/B

- Register202 `{success:true,accountStatus:'pending',application:{fullName,email}}`, tanpa cookie dashboard.
- Login/Google pending atau rejected:403 dengan accountStatus dan application; tanpa cookie dashboard.
- Akun lama dan Enterprise tetap approved. Persetujuan dan guard wajib di server, bukan hanya client.
- Field: fullName, coupleGroom, coupleBride, email, password atau googleSignupToken,
  noWa, activeSlug, sosmed opsional, eventDate opsional (YYYY-MM-DD), city dan referralSource wajib.
- `/auth?mode=pending` menampilkan status dari konteks respons; setelah reload meminta masuk
  untuk memeriksa. Tidak membuat endpoint cek status anonim berbasis email.
- Durasi365 tetap konfigurasi repo. Perbedaan titik awal approval versus pembuatan undangan
  sudah diperiksa: activateInvitation menetapkan expires_at dari waktu aktivasi, bukan waktu persetujuan akun. Copy final memakai “sejak undangan diaktifkan”.

## QA B

TypeScript dan build awal lulus; build memunculkan batas konfigurasi DB/payment yang belum tersedia.
`check-product-boundaries.mjs` lulus, mencakup kedua stylesheet dan file terlindungi.
`check-access-client.mjs` menjalankan provider React sebenarnya dengan respons HTTP terisolasi:
cache lama, register202pending, rejected403, approved200, pencabutan sesi, Google pending/needsSignup,
backend lama yang masih memberi user saat register, dan offline. Tidak memakai akun produksi.
Renderer adalah dev dependency; tidak masuk kode aplikasi.

**Browser lokal B diblokir auto-review.** Tidak ada klaim QA visual baru pada390/768/1024/1280,
OAuth Google nyata, atau sentuhan perangkat fisik. A diminta memeriksa visual dan alur integrasi
menggunakan browsernya. Source review dan tes terisolasi bukan pengganti pemeriksaan tersebut.

Tidak auto-merge main atau deploy aplikasi produksi. Kode B perlu backend A dalam satu
kandidat integrasi; jangan merilis frontend whitelist dan backend secara terpisah.

## Hasil integrasi A/B (B, 24 November)

Backend A `9694ed9` digabung secara lokal tanpa konflik dengan frontend B. Build Node22
lulus. Server QA terisolasi dari produksi.

Perintah yang dapat diulang dari repo:

```sh
npm ci
npm run lint
npm run build
node scripts/check-product-boundaries.mjs
node scripts/check-access-client.mjs
node scripts/check-access-http.mjs
```

`check-access-http.mjs` membuat SQLite sementara dan server Next sendiri pada port kosong.
Data, password, dan secret hanya untuk pengujian; tidak memakai database produksi. Tidak
ada push token pada DB tes. Tautan WhatsApp/email tidak dibuka atau dikirim. Server serta
database sementara dibersihkan setelah tes.

Hasil: validasi400, register202pending tanpa sesi aktif (cookie lama dihapus), loginpending403,
akun lama→approved, hak admin401/403, approve→login/me200, reject→me401/loginrejected403,
reopenpending dan dashboard anonim307: PASS. Provider juga menguji Google pending/needsSignup,
offline dan kontrak register lama. OAuth Google nyata serta QA visual masih perlu dilakukan
A sebelum penilaian final.

## Pemeriksaan lanjutan

Jadwal B aktif setiap1jam, zona Asia/Jakarta, pemeriksaan berikut25November00:51WIB.
ID jadwal `Automation_22277fb416ec81919ec18ba06d12b6a0`.
Akses room memakai identitas ChatGPT pemilik terverifikasi (`owner-session` bukan rahasia);
pengiriman dan pembacaan ulang di produksi telah lulus. Permintaan anonim alias yang sama
ditolak. Tidak menyimpan kode kontributor dalam prompt jadwal. Jadwal tersimpan bukan bukti
sesi berikutnya sudah berjalan.

Room source `556b248a7327844da11e8495b295ef2aff112c8a` sudah diterbitkan; audience publik tidak diubah.
Akses dan identitas A/Claude tetap melalui kode A.

## Perbaikan lanjutan 25 November — urutan respons auth

Baseline PR#3 `99d39a9c8e7bce27470e69a00d5f6c0ec7398b3a`. Pemilik meminta B terus bekerja;
scope ini diumumkan di room19 sebelum kode diubah. Tidak menyentuh file yang sedang direview A.

Reproduksi sebelum perbaikan: mulai GET`/api/auth/me`, masuk akun pending dengan respons403,
lalu selesaikan GET lama dengan userapproved. Provider salah mengembalikan currentUser ke
akun lama. `check-access-client.mjs` gagal dengan expectednull versus old-approved-account.

Perbaikan:

- Hanya operasi autentikasi terbaru boleh memperbarui user, status pendaftaran, error dan loading.
- Login, Google, register dan logout masuk antrean request yang sama. Logout tidak mendahului
  respons login sebelumnya yang dapat membawa Set-Cookie; permintaan berikutnya baru dimulai
  sesudah request lama selesai atau gagal.
- Logout menghapus tampilan user/status/error; respons lama tidak menghidupkannya kembali.
- Request gagal tidak merusak antrean berikutnya; cleanup provider membatalkan kepemilikan
  respons lama atas state UI.

Tes menggunakan provider React sebenarnya dengan respons tertunda yang dikendalikan:
stale /me setelah pending; login→logout; dua login dengan hasil berbeda dan loading yang
bertahan; kegagalan request lama diikuti sukses Google. Semuanya lulus setelah perbaikan.
Ini bukti urutan request pada satu provider, bukan pengujian cookie pada browser fisik atau
sinkronisasi login lintas tab. Otorisasi server tetap menjadi batas akses data.

QA visual A masih ditunggu; tidak ada klaim screenshot baru oleh B.

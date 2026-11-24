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
  harus dicocokkan dengan backend sebelum dianggap final.

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

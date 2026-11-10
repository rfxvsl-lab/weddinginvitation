---
name: ui-no-slop
description: Kriteria dan alur kerja untuk merancang atau memperbaiki UI tanpa "AI slop" (tampilan generik, klaim/angka karangan, pola visual template) di aplikasi RuangHadir. Gunakan skill ini setiap kali mengubah tampilan landing page, auth, dashboard, admin, modal, toast, atau copy pemasaran; setiap kali diminta "rapikan desain", "redesign", "biar nggak kayak buatan AI", "polish UI", "tambah section", menulis testimoni/statistik/headline, atau membuat komponen UI baru — bahkan jika pengguna tidak menyebut kata "slop".
---

# UI tanpa AI slop

"AI slop" di UI adalah segala hal yang terlihat dibuat tanpa memikirkan produk ini secara spesifik:
angka dan testimoni karangan, copy yang bisa ditempel di produk apa pun, dan pola visual default
(gradien + glow, ikon di kotak pastel, kata miring berwarna di setiap judul). Akibatnya pengunjung
tidak percaya, dan untuk klaim palsu, ada risiko hukum (UU No. 8/1999 Perlindungan Konsumen).

Urutan prioritasnya penting: **kejujuran > kejelasan > konsistensi > estetika.** Desain yang indah
dengan angka palsu tetap gagal.

## Alur kerja

1. **Ukur dulu.** Jalankan pemindai dan simpan hasilnya sebagai baseline:
   ```bash
   node .claude/skills/ui-no-slop/scripts/slop-scan.mjs
   ```
   Lalu ambil screenshot halaman yang akan diubah (lihat skill `ui-verify`). Lihat gambarnya sendiri;
   pemindai hanya menangkap pola yang bisa dideteksi dari kode.
2. **Daftar temuan per kategori** di [references/criteria.md](references/criteria.md):
   klaim (K), copy (C), visual (V), konsistensi (S), aset (A). Kerjakan K lebih dulu.
3. **Perbaiki dengan bahan nyata produk**, bukan pengganti generik:
   jumlah tema dari `DEFAULT_THEMES`, harga dari `PACKAGE_PRICES`, batas paket dari `PACKAGE_LIMITS`,
   screenshot tema asli di `public/assets/themes/`, nama fitur yang benar-benar ada di kode.
   Jika data yang dibutuhkan tidak ada (testimoni, jumlah pengguna), **jangan karang**:
   sembunyikan bagian itu dan tulis di laporan bahwa pemilik perlu menyediakan datanya.
4. **Verifikasi** dengan skill `ui-verify`: screenshot sesudah, bandingkan, audit a11y, ukur performa.
   Jalankan pemindai lagi dan laporkan angka sebelum → sesudah.
5. **Laporkan apa adanya:** apa yang diubah, apa yang sengaja tidak diubah dan kenapa,
   dan keputusan apa yang perlu pemilik ambil (mis. testimoni asli, warna merek).

## Aturan cepat

- **Angka di UI harus bisa ditelusuri** ke kode (konstanta/DB) atau ke sumber yang disebut.
  Angka dekoratif pada mockup ("98,4% terkirim") juga dihitung sebagai klaim.
- **Tidak ada testimoni tanpa izin pelanggan nyata.** Lebih baik tanpa bagian testimoni.
- **Satu aksen per halaman.** Kata miring berwarna di judul hanya di hero. Kicker berhuruf kapital
  hanya bila memberi informasi baru, bukan di setiap section.
- **Tombol: warna solid**, tanpa gradien dan tanpa bayangan berwarna (glow). Bayangan hanya untuk
  elemen yang benar-benar melayang (modal, dropdown).
- **Copy spesifik:** sebut fitur, angka, dan batas yang nyata. Hindari kata yang dijelaskan di
  daftar frasa generik di criteria.md ("eksklusif", "impian", "sekali seumur hidup", "seamless").
- **Tanpa emoji di UI produk.** Emoji di teks tombol/judul/toast terlihat seperti template.
- **Tautan harus menuju halaman yang ada.** Cek route di `src/app/` sebelum menulis `href`.
- **Jangan ubah template undangan (`src/components/templates/`) demi selera.** Itu produk yang dijual
  ke pelanggan; ubah hanya untuk bug, aksesibilitas, atau atas permintaan eksplisit.

## Hal yang bukan slop (jangan "diperbaiki")

- Palet merek "Blossom Ivory" (wine `--saas-wine`, gold `--saas-gold`, ivory) dan font serif
  Cormorant Garamond untuk judul. Itu identitas produk.
- Mockup HP yang menampilkan undangan sungguhan (Kharis & Lia) — itu contoh nyata.
- Data contoh yang **jelas berlabel contoh** di mockup (nama tamu "Andi Wijaya" di kartu undangan).

Rincian kriteria, contoh sebelum/sesudah, dan cara menilai: [references/criteria.md](references/criteria.md).

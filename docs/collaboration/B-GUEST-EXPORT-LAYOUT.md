# Overlay dan canvas laporan tamu — B/GPT

25 November 2026 WIB. Branch `codex/guest-export-layout`, dasar main `67b89b7`.
Scope sebelum edit diumumkan pada room88; A diminta tidak mengedit file yang sama.
PR6 katalog dan PR7 kartu tamu tetap terpisah, belum merged. Main/branch marketing,
AGENTS, COLLABORATION, handover, rencana dan log diperiksa sebelum perubahan.

## Bukti dan keputusan

A83 melaporkan strip24px di bawah overlay QR/export, canvas cetak terpotong pada390,
judul ungu dan garis biru tombol cetak. A86 mengunggah bukti pada branch QA `19f3e24`.
B87 membaca README dan melihat gambar kartu390, tabel1920 dan export390. Itu pemeriksaan
artefak A, bukan browser/perangkat fisik B. Bukti tersimpan:
https://github.com/rfxvsl-lab/weddinginvitation/tree/19f3e24/docs/collaboration/qa-20261125-a

Source main juga memuat root `space-y-6` dengan anak overlay fixed, canvas flex center,
scale95, literal ungu #4f46e5, border-indigo-600 dan checkbox tanpa accent aplikasi.
Jadi struktur/class ini bukan tambahan PR7. Sebab computed strip24px masih perlu A
bandingkan langsung sebelum disebut terbukti; jangan mengklaim QA visual sudah lulus.

- Tambahkan class overlay khusus QR/export: margin0, scroll vertikal, card flex tidak
  menyusut dan margin otomatis agar tetap terpusat saat muat serta terjangkau saat tinggi.
  Padding mempertimbangkan safe area. Tidak mengubah rootspacing bagian normal.
- Kartu ekspor memakai tinggi dinamis90dvh/80dvh dengan fallback vh existing. Pada mobile
  kontrol maksimal60% tinggi kartu dan bisa scroll; sisanya untuk canvas.
- Canvas A4 memakai scroll dua arah, minimum lebar210mm dan margininlineauto dalam block,
  tanpa transform95%/flex centering yang dapat memotong sisi awal. Ini lembar ukuran tetap
  yang bisa digulir, bukan janji fit seluruh A4 di layar HP. Ada petunjuk terlihat,
  region bernama dan tabstop untuk navigasi keyboard, dengan fokus warna aplikasi.
- Judul preview, border tombol cetak dan accent3checkbox memakai token rh existing.
  Garis biru pada screenshot ternyata juga ada sebagai border literal; tidak mengklaim
  seluruh masalah fokus aplikasi selesai. Tidak menambah CSS fokus global.

File aplikasi hanya GuestManager.tsx dan src/styles/product.css. Seluruh atribut JSX
on*,value,checked,disabled,href,src identik main melalui perbandingan AST TypeScript.
Bagian actual `print-section` termasuk stylesheet dan data identik byte demi byte.
Handler CSV/print/QR, DB/API, status, harga/kuota, font Manrope, tema/aset/renderer dan
ZoomLock tetap. Perlindungan preview tidak diberi pengecualian pada patch ini.

## Validasi dan batas

- Tes existing GuestSharing lulus: clipboard/fallback/race, WA/nomor, status tidak
  dipalsukan, filter dan CSV; bukan QR/layout/persistence/perangkat fisik.
- TypeScript, boundaries/scopedCSS/zoom dan diff whitespace lulus.
- Build Next Node22 lulus; warning DB/payment produksi belum dikonfigurasi.
  Integrasi layanan produksi tidak diuji.
- QA browser belum dilakukan pada kandidat ini. A diminta mengukur overlay360/390/1280,
  short viewport dan scroll atas/bawahQR; canvas kedua tepi/atas/bawah, scrollkontrol,
  checkbox/scope/CSV/print dan fokus keyboard. Periksa juga regresi PR7 setelah integrasi,
  karena branch ini sengaja berbasis main sehingga belum memuat kartu tamu PR7.
- Tidak menyebut seluruh overlay/dialog sudah aksesibel: role dialog, trap/Escape/restore
  masih backlog terpisah dengan perhatian pada alertmodal bertingkat.

Serahkan draft PR saja; tidak auto-merge main atau deploy aplikasi produksi.

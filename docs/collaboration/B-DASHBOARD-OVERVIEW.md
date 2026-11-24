# Ringkasan dashboard — akurasi persiapan dan salin tautan

B/GPT, 25 November 2026 WIB. Baseline PR#3:6e6cdf0, main59be0ad. Scope diumumkan
di room46; tidak ada pesan A baru setelah45. Marketing/Akses Awal sebelumnya lulus QA A
pada6155f0c; patch tamu sesudahnya masih menunggu QA visual, bukan dianggap sudah disetujui.

## Reproduksi dan keputusan

1. Dua sesi akad/resepsi dengan enabled=false tetapi tanggal terisi masih membuat checklist
   Tanggal acara berstatus selesai. Tes komponen asli sebelum patch gagal menemukan tombol
   Lengkapi Tanggal acara. Setelah patch hanya tanggal nonkosong pada sesi enabled!==false
   dihitung, mengikuti toggle editor dan conditional render tema existing. enabled tidak ada
   tetap aktif untuk kompatibilitas. Ini indikator kelengkapan, bukan validasi tanggal/acara.
2. Salin tautan proyek satu lalu mengganti props ke proyek dua masih menampilkan Tersalin.
   Tes --copy-only sebelum patch gagal pada assertion switching project must clear copied
   state. State kontrol kini di komponen anak dengan key identitas proyek+URL. Respons lama
   tertahan pada instance lama. Nomor operasi juga mencegah respons clipboard lama menimpa
   kegagalan/sukses percobaan terbaru pada tautan yang sama.

File: DashboardOverview.tsx dan scripts/check-dashboard-overview.mjs. Tidak mengubah CSS,
layout/markup kontrol, font, rute publikasi, callback onPublish, endpoint atau data tersimpan.
Tidak mengubah checklist lainnya atau menjadikannya aturan publikasi. Preview/tema/aset,
kuota/harga/masa aktif dan ZoomLock tetap dilindungi.

## QA

Tes komponen React asli sesudah patch lulus: sesi dimatikan, sesi aktif/legacy tanpa flag,
tanggal kosong; salin sukses/gagal/API tidak tersedia; pergantian proyek saat respons belum
selesai; dua percobaan pada URL sama yang selesai terbalik; retry sukses; tombol Buka hanya
ketika terbit dan callback modal publikasi/bagikan tetap. Tes ini memakai dependency existing
react-test-renderer (warning deprecation), tanpa API akun atau clipboard browser sebenarnya.

TypeScript, build Next Node22, diff whitespace dan batas preview/font/paket/scoped CSS lulus.
Build memberi peringatan konfigurasi payment/DB belum diisi; bukan bukti integrasi produksi.
Mode npm offline gagal mengambil runtime yang belum ada dalam cache; dicoba kembali melalui
jalur npm biasa. Ini kendala dependency runtime, bukan hasil uji source yang dipalsukan.

Belum QA browser/desktop/mobile/perangkat fisik baru oleh B atau A. Tidak mengklaim pengujian
persistensi publikasi. A sudah menyatakan berhenti memantau sampai pemilik aktif kembali;
permintaan review ditaruh di room untuk sesi berikutnya. Tidak merge main/deploy produksi.

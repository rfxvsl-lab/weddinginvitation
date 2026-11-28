# Bukti visual Sehari — 27 November 2026

Sumber: https://www.ruanghadir.net/preview/sehari-selamanya pada main `7fcb1ae`.
Chrome CUA desktop 1363×936, iframe undangan 430px (body 424px setelah scrollbar).
Semua gambar adalah screenshot asli sebelum perbaikan PR21 putaran ini, tanpa
perubahan warna, crop, atau komposisi. SHA-256 dan ukuran ada di [manifest](manifest.json).
Bukan screenshot sesudah fix, bukan viewport mobile fisik, bukan rekaman video.

| Bukti | Yang dapat diperiksa |
|---|---|
| [Sampul](01-cover.jpg) | Foto, nama, tamu dan tombol buka |
| [Hero](02-hero.jpg) | Nama setelah animasi selesai, navigasi, foto |
| [Profil](03-couple.jpg) | Kutipan parsial dan profil pertama; bukan bukti kedua profil lengkap |
| [Acara](04-events.jpg) | Bidang kobalt, countdown lewat tanggal, awal akad; bukan seluruh alamat/jadwal |
| [Cerita](05-story.jpg) | Dua bab cerita dalam alur foto dan narasi |
| [Galeri](06-gallery-dialog.jpg) | Dialog foto1/9, kontrol Tutup/Sebelumnya/Berikutnya |
| [RSVP sebelum fix](07-rsvp-before.jpg) | Tombol musik fixed menimpa sisi kanan tombol Kirim ucapan |
| [Penutup sebelum fix](08-ending-before.jpg) | Penutup kuning dan tiket; kata Validasi pecah dua baris |

Tindakan: buka sampul, scroll/PageDown, fokus bagian lewat klik judul/form,
buka/tutup dialog. Tidak memakai menu anchor yang sudah diketahui bermasalah di
versi main. Pengambilan crop via API sempat timeout; hasil parsial dan screenshot
dengan nama bagian tidak tepat tidak dimasukkan ke bukti ini. Delapan gambar ini
adalah titik pemeriksaan, tidak membuktikan seluruh posisi scroll tercakup.

## Penilaian B

Komposisi sampul, hero, acara dan penutup dapat dibedakan tanpa kartu dekoratif
berulang. Masalah yang terbukti justru ada pada integrasi: reset CSS tema mengambil
alih typography/padding komponen tiket; kontrol musik mengambang menutupi isi.
PR21 membatasi reset agar mengecualikan subtree extras serta menempatkan kontrol
musik di bar navigasi. Screenshot sesudah fix masih diperlukan. Gaya amber tiket
existing tetap milik komponen tersebut; belum diselaraskan atau dinyatakan lolos
review visual. Glyph panah terlihat kotak di browser ini; source berisi U+2197
benar. Akar font/fallback belum dibuktikan, sehingga tidak mengubah font global.

Belum ada persetujuan visual pemilik, rekaman gerak penuh, QA perangkat mobile,
data ekstrem di browser, atau verifikasi simpan RSVP backend dari rangkaian ini.

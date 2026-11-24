# Dashboard tahap pertama — alur berbagi tamu

Kontributor B/GPT, 25 November 2026 WIB. Dasar: arahan pemilik untuk melanjutkan dashboard
setelah marketing ditinjau. A melaporkan PR#3 head6155f0c lulus di room40. Itu review peer,
bukan persetujuan rilis pemilik. Branch codex/marketing-refinement tetap draft PR#3;
main59be0ad tidak berubah. Scope diumumkan sebelum edit di room41–42.

## Bukti dan keputusan

| Temuan source | Dampak | Perbaikan frontend B |
|---|---|---|
| handleCopyLink mengisi Sent | Menyalin dianggap bukti pengiriman | Hanya feedback clipboard setelah sukses, tanpa mutasi status |
| Membuka WhatsApp mengisi Opened | Jendela pengirim dianggap tamu membaca | Buka draf WhatsApp manual, tanpa mutasi status atau klaim pengiriman |
| Nomor kosong diganti contoh081234567890 | Nomor yang tidak dimasukkan tersimpan sebagai penerima | Simpan string kosong; WA tanpa nomor/format sesuai memberi penjelasan dan tautan manual |
| Opened juga diisi confirmGuestAttendance untuk Tidak Hadir dan checkInGuest | Label CSV Dibuka(Hadir)/cetak Hadir keliru | Label netral Catatan interaksi/Catatan berbagi konsisten di tabel, CSV, preview cetak dan cetak |
| Pencarian tanpa kecocokan disebut belum ada data | Pengguna seolah kehilangan seluruh daftar | Pesan khusus hasil kosong dan tombol hapus pencarian/filter |

Kehadiran di lokasi tetap berdasarkan checkedInAt pada kolom Check-in. Tidak mengubah status
enum, API/DB, data historis, handler QR/check-in atau RSVP. Nomor contoh yang sudah telanjur
tersimpan tidak dihapus otomatis: tidak dapat dibedakan dari nomor yang memang dimasukkan.
Arti status domain yang terpisah (distribusi/RSVP/kehadiran) adalah backlog backend untuk A.

Normalisasi nomor hanya memeriksa format: 0 awal menjadi62, tanda +/spasi/kurung/titik/strip
dirapikan, hasil7–15digit dengan kode negara. Ini bukan verifikasi nomor terdaftar di WhatsApp.
Clipboard gagal/tidak tersedia menyediakan field readonly yang bisa dipilih/disalin manual.
Operasi clipboard terlambat tidak menimpa feedback tindakan berbagi berikutnya.

File: GuestManager.tsx, src/lib/guestSharing.ts, scripts/check-guest-sharing.mjs dan dokumen
kolaborasi. Tombol salin/WA memakai token rh-* dan target44px. Perombakan visual penuh tabel,
modal QR dan print belum dilakukan; warna legacy pada area lain tetap backlog, bukan dianggap
sudah selesai. Tidak menyentuh preview/tema/aset, Manrope, harga/hak paket atau ZoomLock.

## QA dan batas

- Tes interaksi komponen GuestManager asli lulus: salin sukses/gagal/API tidak tersedia,
  tautan bernama, penyelesaian clipboard terlambat, nomor kosong/tidak valid/08/+62/+65,
  draf WA dengan noopener/noreferrer, callback status tidak dipanggil oleh berbagi,
  tambah tamu tanpa nomor palsu, pencarian/filter/reset, label netral dan isi CSV.
- npm run lint (TypeScript), build Next Node22 dan check-product-boundaries.mjs lulus.
  Build memberi peringatan konfigurasi payment/DB produksi belum diisi; tidak mengklaim
  payment atau sitemap database produksi teruji. Tes memakai react-test-renderer existing
  yang memberi peringatan deprecation; tidak menambah dependency.
- Tes React bukan browser/layout. QA mobile/desktop, wrapping label cetak yang lebih panjang,
  fokus feedback, pop-up WA dan perangkat fisik belum diverifikasi B. Pengiriman pesan nyata
  tidak dilakukan. QA visual dan regresi QR tetap diminta dari A setelah commit tersedia.

Tidak merge main atau deploy produksi. Kandidat commit akhir dan hasil lanjutan dicatat di
PR#3 serta room; tidak menyebut balasan A sebelum benar-benar diterima.

## Tanggapan A terhadap diagnosis

Room43: A mengonfirmasi diagnosis dari db.ts dan tidak mengubah file scope B. Usulan A
memisahkan shared_at/opened_at/RSVP/checked_in_at belum diimplementasikan. B menerima
arah pemisahan sinyal, tetapi shared_at yang diisi saat salin/WA sebaiknya dinamai atau
diberi jenis tindakan yang jelas: aksi itu tetap bukan bukti benar-benar berbagi.
opened_at membutuhkan bukti kunjungan bertoken dan desain deduplikasi/privacy. Tidak
menambah migrasi hanya untuk mengganti label. A berhenti memantau setelah02.00 WIB; QA
visual patch tamu menunggu sesi review berikutnya, bukan dianggap sudah ditangani A.

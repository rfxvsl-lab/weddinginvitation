# Katalog dua tema — arahan pemilik terbaru

Pemilik: singkirkan semua tema kecuali paralaks orang berjalan dan tema hijau Bandung.
B mencocokkan kode: storybook-interactive / Heirloom Storybook menyebut sepasang mempelai
berjalan; sunda-kujang / Pasundan menyebut Tangkuban Parahu dan varian Hijau Leuweung.
Ini pemetaan B berdasarkan deskripsi, belum konfirmasi nama terpisah oleh pemilik.
Scope sebelum edit room146; base main7334029, branch codex/retained-theme-catalog.

Hanya dua ID itu tersedia di landing, katalog marketing dan pemilih tema dashboard.
Counter tema di harga mengikuti daftar tersedia (2); Rp0/Enterprise/hakpaket/kuota tidak
berubah. Filter kategori kosong tidak ditawarkan. DEFAULT_THEMES/KIT_THEMES/resolver
lengkap13 tema tetap, karena undangan tersimpan dan rute lama merujuk ID tersebut.
Menghapus registry akan membuat InvitationPreview memakai fallback dan mengubah undangan
lama diam-diam. Karena itu ini penarikan dari pilihan, BUKAN penghapusan fisik file/aset
atau migrasi data. Pemilik menerima dua pilihan; tema lain diarsipkan secara kompatibel.
Tema lama yang masih aktif tidak diganti otomatis; pemilih menjelaskan pilih tema baru
jika ingin menggantinya. Varian tema existing/renderer/preview/ZoomLock tetap utuh.

AVAILABLE_THEMES menjadi sumber pilihan bersama; registry render bukan daftar penawaran.
Tidak menambah tema baru. PR15 ditahan sesuai arahan terbaru; QA A141 untuk prototipe lama
sudah dicatat di metadata PR15, bukan persetujuan visual pemilik. Perbaikan publikasi
A140 berada di draft PR16 terpisah, tidak dicampur penarikan katalog.

Validasi: TypeScript, Next build Node22, SSR marketing aktual (home2/catalog2/legal/404)
lulus. Tes React ThemeSelector nyata: hanya dua pilihan, onSelect hanya duaID, mounting
IDlama tidak menyeleksi tema baru; seluruh13 tema lama tetap resolve. Tidak ada call
persistensi/API dalam tes. Whitespace/diff protected path terhadapmain kosong. Guardasli
masih gagal rootkatalog existingmain; salinan sementara guardreviewPR12 lulus lalu dihapus.
Build memberi warning konfigurasi DB/payment existing. Belum QA browser/mobile A kandidat
ini; minta dua thumbnail/preview, filter/counter2 dan undangan IDlama tetap dirender.
Tidak ada penghapusan pelanggan/undangan, merge main atau deploy produksi.

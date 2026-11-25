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
atau migrasi data. Dua pilihan dipertahankan sesuai pemetaan di atas; tema lain diarsipkan secara kompatibel.
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

## Penyerahan review dan kendala GitHub

Head source aec702634b77e3cf37c2c8956d4865b3d158b234 diterbitkan pada branchreview;
tree22c508c12681053bd9cf1e0a696372ddacfaeab3 cocok dengan tree yang dites lokal.
Pembuatan draft PR dua kali gagal internal connector -32603. Pemeriksaan PR17 di antara
percobaan mendapat404, jadi tidak mengklaim PR tersedia. A diminta membantu membuat draft
jika konektornya tersedia dan QA source. Kendala bersifat sementara, bukan kegagalan build.
Commit penutupan ini hanya catatan, source dan bukti tes di atas tidak berubah.

## Pemeriksaan kompatibilitas branch review

Pemeriksaan ulang main7334029 dan marketing2de4d84 tidak berubah. Git merge-tree
PR16head927a666 dan kataloghead aec7026 keluar0 tanpa konflik, menghasilkan objek
tree d161db4764a7956991034d33f83c4bdd19bd58df. Ini tidak membuat branch gabungan
atau merge main, tidak membuktikan QA browser gabungan. GitHub update_ref masih error
internal GraphQL; native ContentsAPI dicoba untuk catatan dokumen saja. Jika berhasil,
source src/scripts tetap kandidatQA sebelumnya. Tidak mengulang tes/build tanpa
perubahan source. PR17 belum dianggap tersedia sebelum hasil create/fetch terverifikasi.

## Pemulihan GitHub dan draft review katalog

GitHub kini berhasil membuat draftPR18 https://github.com/rfxvsl-lab/weddinginvitation/pull/18
untuk source aec7026. Pernyataan PR17 belum tersedia di bagian atas adalah catatan waktu
kegagalan sebelumnya: nomor17 kemudian digunakan A untuk VideoEnterprise2467a88, bukan katalog.
A154 menguji bugpublikasi PR16 dan lulus, tetapi katalog dua tema belum QA A (prioritas A
sementara Enterprise). Jangan mencatat hasil A154 sebagai QA katalog. Commit penutupan
ini hanya dokumen; seluruh src/scripts masih byteidentik sourceaec7026 yang dites B.

Audit teks Remotion/AfterEffects di main menemukan UI pada App.tsx dan VideoInvitationStudio,
bukan komponen marketing landing. PR17 A sudah mengganti area itu. B tidak menyentuh file
A atau mengiklankan implementasi PR17 sebelum keputusan pemilik/integrasi. Komentar kode
pada tema dilindungi bukan klaim marketing dan tidak diedit.

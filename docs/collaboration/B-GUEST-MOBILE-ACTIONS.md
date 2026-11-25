# G1/G2/G3/P1 — daftar tamu mobile dan slug proyek

B/GPT, 25 November 2026 WIB. Dasar main67b89b7, branch codex/guest-mobile-actions.
Scope diumumkan room75 sebelum edit. PR6 katalog tetap terpisah menunggu review pemilik;
tidak menyentuh entry katalog yang ditandai guard atau menimpa kode A.

## Bukti dan keputusan

A room63 mengukur tabel743px dalam scroller306px pada390px. Salin/WA baru terlihat setelah
geser horizontal. QR/Buka/Hapus belum44px; kode membungkus; slug sidebar terpecah3baris.
B menerima temuan dan menerapkan presentasi berikut, belum mengklaim geometri akhir lulus.

- GuestManager: SATU tabel/baris/state/callback yang sama, pada layar<640px ditata menjadi
  kartu dua kolom, nama dan aksi selebar kartu. Aksi dapat wrap, tidak bergantung geser
  horizontal. Header kolom tetap di DOM, diklip visual pada mobile; data-label memberi
  label visual setiap field. Tabel diberi nama dan header scope=col. Desktop tetap tabel.
- QR/Buka/Hapus min44×44 dan nama aksesibel per tamu. Tidak mengubah callback, izin paket,
  alamat tautan, status atau mesin QR/check-in. Warna tiga aksi ini memakai token rh-*.
- Kode unik nowrap. Slug selector memakai truncate satu baris dengan title berisi slug
  penuh; penghitung proyek tidak menyusut. Semua nilai dan aturan kuota/slug tetap.
- CSS baru hanya .rh-product .rh-guest-list di media screen<640px. Tidak mengubah tabel
  cetak/ekspor, aturan print, preview/tema/aset/font/ZoomLock atau CSS global.

File aplikasi: GuestManager.tsx, ProjectSwitcher.tsx, product.css. Tidak membuat komponen
aksi duplikat atau versi data tamu kedua untuk mobile. Kode QR yang jauh lebih panjang dari
kode existing serta pembaca layar perlu diperiksa khusus; jangan menganggap CSS grid pada
tabel sudah sempurna di semua kombinasi browser/assistive technology tanpa pengujian.

## Pengujian dan batas

Tes interaksi existing check-guest-sharing.mjs dan check-project-switcher.mjs lulus:
clipboard/fallback/race, WA nomor/format, status tidak dipalsukan, nomor kosong, filter,
CSV, create/switch/kuota dan slug legacy. Perbandingan AST JSX pada dua komponen memastikan
seluruh on*,value,checked,disabled,href,src identik dengan main; bukan sekadar kompilasi.
TypeScript, build Next Node22, boundaries dan diff whitespace lulus. Build memberi warning
DB/payment produksi belum dikonfigurasi; integrasi produksi tidak dianggap teruji.
Tidak menambah tes yang hanya mencerminkan class CSS, atau menambah dependency.

QA visual A diminta pada360/390/640/1280: aksi terlihat tanpa scroll horizontal, semua
target44px, kode satu baris, slugtruncate/title, empty search, tombol copy/WA/QR/Buka/Hapus,
scroll panjang, serta tabel cetak/CSV tetap. Tes tidak menghapus/mengirim pesan pada akun
produksi. B belum menguji browser/perangkat fisik; tidak mengklaim balasan A yang belum ada.
Tidak auto-merge atau deploy produksi. Bukti A awal tersedia pada PR5 branchQA A; laporan
awal itu belum merupakan QA patch ini. Fokus dialog publikasi masih backlog terpisah.

## QA A putaran pertama dan koreksi lebar area

Room78: A menguji PR7 head76ec4b3 di Chromium dev dengan akun approved. Pada360/390/639px
kartu muat,10/10aksi terlihat tanpa geser, semua≥44px; copy/WA tetapstatusDraft, cari/reset
dan CSV lulus tanpa pageerror. Namun pada640/768/1024/1280/1440, tabel811px lebih lebar dari
area yang tersisa karena sidebar/LivePreview; sebagian/bahkan semua aksi tidak tampak.
Jadi G1 BELUM selesai pada kandidat pertama. Label nomor ikutmono dan tinggi aksi40px
di beberapa keadaan desktop juga dicatat. Ini hasil A, bukan browser B/perangkat fisik.

A menyiapkan ce99d3c di claude/guest-actions-container: containerquery860px, target44px
dan fontlabel. A melaporkan geometri/handler ulang lulus360 sampai1920, tabel kembali pada
area≥861px. B menerima arah containerquery sesuai bukti bahwa lebar workspace berbeda
dari viewport. Patch A diintegrasikan pada branch PR7, lalu B membatasi cakupannya:

- Container khusus .rh-guest-list-container membungkus daftar saja. Modal fixedQR/export
  dan print-section tetap di luarnya. B tidak memakai :has pada root seluruh GuestManager;
  ini pembatasan pengaruh layout, bukan klaim patch A sudah menyebabkan regresi modal.
- Container dan query tetap berada dalam @media screen. CSS cetak tidak diberi querykartu.
- Sel nomor mewarisi font UI; hanya nilai nomornya memakai span monospace. Label ::before
  mengikuti font UI tanpa menambah deklarasi keluarga font CSS yang dilarang guard.
- Query area≤860px memakai kartu yang sama; area lebih lebar tetap tabel. Tidak membuat
  ulang data/callback atau mengubah on*,value,disabled/href/source bisnis.

Scope B diumumkan80: GuestManager.tsx, product.css dan dokumen. Tes GuestSharing lulus;
TypeScript, build Next Node22, boundaries dan diff whitespace lulus. Build memberi warning
DB/payment produksi belum diisi. AST atribut fungsional identik kandidat76ec4b3. Kandidat akhir B berbeda sedikit dari
ce99d3c yang diuji A, sehingga perlu QA ulang area kartu/tabel, ukuranaksi/fontlabel serta
modal QR/export dan print. Tidak menyamakan hasil A atas patch awal dengan hasil final B.

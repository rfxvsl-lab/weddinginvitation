# Modal publikasi — bagian atas terpotong pada mobile

Arahan pemilik 25 November 2026 WIB: screenshot menunjukkan modal sudah discroll paling
atas tetapi header dan awal Rincian Akun tetap terpotong. B/GPT menangani container/scroll.
Baseline main6a7de34 (PR#3 terpantau sudah merged oleh pihak lain), branch review baru
codex/fix-publish-modal-scroll. Scope diumumkan di room55 sebelum edit.

## Diagnosis dan perubahan

PublishModal memakai fixed inset-0 + flex items-center + overflow-y-auto. Ketika tinggi
card melebihi tinggi viewport, centering cross-axis dapat menempatkan awal card di atas
scroll origin; margin my-8 tidak menyelesaikan akses ke awal tersebut. Screenshot pemilik
sesuai mekanisme ini. Tidak mengklaim reproduksi browser baru oleh B.

Overlay kini flex kolom dengan scroll vertikal, card flex:0 0 auto dan margin-block:auto.
Ruang positif memusatkan card pendek; saat card panjang, auto margin menjadi nol sehingga
card mulai setelah padding atas, tidak menyusut dan sisanya menjadi scrollable overflow.
Tinggi100dvh memakai fallback100%, padding atas/bawah mempertimbangkan safe-area, serta
overscroll ditahan pada overlay. Kedua cabang modal memakai container yang sama.

File aplikasi: PublishModal.tsx (empat literal className) dan product.css (selector khusus
.rh-product .rh-publish-overlay beserta card langsung). Tidak mengubah ukuran font,
warna, konten, handler publish/share/clipboard, kondisi tombol atau state. Perbandingan
source sebelum/sesudah di luar atribut className identik. Preview/tema/aset, Manrope,
harga/kuota dan ZoomLock tidak disentuh. Tidak mengubah body scroll lock atau viewport global.

## QA dan batas

TypeScript, build Next Node22 dan boundaries lulus. Build memberi warning konfigurasi
payment/DB produksi belum diisi; bukan bukti integrasi produksi teruji. Diff whitespace
bersih; perbandingan source di luar className lulus. Tidak menambah tes yang hanya menyalin
class CSS. Perubahan layout perlu verifikasi browser, bukan diklaim lulus dari tes DOM.

Belum diuji B pada browser/perangkat fisik. Checklist review A/pemilik:390×640,390×844,
360px dan desktop1280×800; scrollTop0 memperlihatkan logo/judul/tutup, scroll maksimal
menjangkau aksi pesan paling bawah, alamat panjang tidak melebar keluar, scroll normal
dan ZoomLock tetap. Ulangi saat address bar terbuka/menutup dan keyboard textarea tampil.
Tidak mengirim WhatsApp atau mempublikasikan undangan untuk pengujian.

Permintaan QA dikirim ke room; tidak mengklaim A sudah membalas. Tidak auto-merge atau
deploy aplikasi produksi oleh B. Commit/PR akhir dilaporkan di room dan PR review baru.

## Fixture QA tanpa akun — 25 November

Room58: B menyiapkan layar publish pada scripts/fixtures/product-review.tsx dan selector
tinggi iframe pada scripts/review-product-ui.mjs. Tidak ada perubahan aplikasi produksi.
Layar memakai PublishModal asli di shell fixed100dvh, data contoh/daftar tamu kosong agar
sesuai screenshot. Tutup dan buka ulang tersedia; publishInvitation/updateGuestStatus
ditolak adaptor fixture, tidak menyentuh API akun. Tidak menguji pengiriman WhatsApp.

Jalankan setelah build aplikasi: node scripts/review-product-ui.mjs /absolute/output-directory
(output di luar repo), kemudian buka index.html melalui server statik sesuai environment
review yang tersedia. Pilih Bagian Modal publikasi, lebar390 dan tinggi640/844; ulangi360
serta1280×800. Frame memakai tinggi1000 secara default; selector tinggi baru mencegah
pengujian mobile tersamarkan oleh frame yang terlalu tinggi. B tidak menerbitkan fixture.

Bundling fixture berhasil menggunakan CSS hasil build kandidat PR#4. Diff whitespace
bersih, src/** tidak berubah. Build/typecheck aplikasi tidak diulang karena source produksi
tidak berubah sejak pemeriksaan sebelumnya. Belum membuka fixture dalam browser; ukuran,
posisi dan scroll belum diklaim lulus. Perilaku keyboard/address bar HP tetap perlu uji fisik.

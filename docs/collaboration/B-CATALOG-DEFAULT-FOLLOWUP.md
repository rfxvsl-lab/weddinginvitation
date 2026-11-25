# Default undangan baru setelah katalog dipersempit

26 November2026 WIB. Scope B161/162, tindak lanjut QA A158 pada PR18c4e9921
(sourceaec7026). A membuktikan home/katalog/picker/pricing dua tema, filter sesuai,
390/1280 tanpa overflow; rute lama /preview/rfx-dark dan javanese-classic tetap200.
Screenshot A masih lokal /tmp/qa/pr18-*.png; belum diklaim ada di repo.

Masalah A158 valid: initial state hook, loadUserData akun pertama (payloadcreate+state)
dan createNewInvitation masih memakai rfx-dark. Pengguna baru langsung mendapat tema
yang tidak ditawarkan. B memilih Pasundan/sunda-kujang sebagai default baru: tema yang
memang dipertahankan, urutan pertama daftarexisting, lebih sederhana daripada Storybook
untuk awal pengisian data. Ini keputusan implementasi B dari arahan dua tema, bukan klaim
pemilik sudah memilih default secara eksplisit.

NEW_INVITATION_THEME_ID terpusat di availableThemes dan bertipe salah satu retainedID.
Keempat referensi default di hook memakai konstanta itu. Jalur load/switch undangan
tersimpan tetap memakai inv.themeId; tidak ada migrasi, API/DB/schema tidak berubah.
Varian warna tema lama tetap dipertahankan agar undangan lama masih bisa diedit; catatan
A tentang kebingungan dianggap tradeoff kompatibilitas, bukan alasan menghapus fitur lama.
Copy counter menjadi “2 tema undangan”/“2 Tema Gratis” tanpa “Semua2”. Harga/kuota tetap.

## Sinkronisasi main dan validasi

B menemukan maina00ce96 hasil mergePR17 oleh pihak lain (A d1c0c1b). B menggabungkan main
KE branchreviewPR18, tanpa konflik, mempertahankan kedua parent. B tidak merge PR ke main
atau deploy. Sourcevideo/App/API/DB/types/package/lock/next-env dari mainbyteidentikmain;
diffsource vs main hanya5 file B: ThemeSelector, LandingThemes, LandingPricing, hook,
availableThemes. npmci --ignore-scripts memakai lockfilemain; tidak menambah dependency B.

Tes actual useWeddingData dengan semua service distub (tidak memanggil API/DB asli):
initialstate, akun pertama, proyek kedua/ketiga memakaiPasundan; payload dan state sama;
proyek keempat ditolak sesuai freequota3; undanganexistingrfx-dark dimuat tanpa create,
save-theme/data atau activation. Ini bukan uji pendaftaran/OAuth/persistensi produksi.
Tes actualReactpicker/resolver13 dan SSRmarketing home2/catalog2/legal/404 lulus lagi.
TypeScript dan build final NextNode22 lulus; warningDB/paymentexisting tetap. Whitespace
lulus. Salinan sementara guardreviewPR12 lulus semua batas lalu dihapus; guardbranch
asli tidakdiubah dan masih punya masalah baseline rootcatalog yang dicatat sebelumnya.

QA A158 adalah bukti source sebelumpatch, bukan bukti runtime defaultbaru. Minta A QA
ulang kandidat baru: akunlokal tanpa undangan, proyekbaru, penghitungdua dan tema lama
tidakberubah. HPfisik/SR dan backendproduksi belum diuji. Tidak mengganti renderer/tema/
aset/font/ZoomLock atau menyentuh karya video A. A160 tentang AI cerita video dicatat
sebagai pesanA, bukan izin mengubah standar seni temaweb atau klaim fitur sudah selesai.

## QA lanjutan A165 pada source8bc32a5

A165 benar-benar menguji Next dev + Chromium1280. Membuat proyekbaru lewat switcher
menyimpan DBtheme_id=sunda-kujang. Sesudah pindah ke proyekbaru, selector menampilkan
“2 Tema Gratis” tanpa pemberitahuan tema lama. Dua undanganexisting tetap rfx-dark,
tidak ditulis ulang. Ini bukti browser+DB lokal A, bukan browserB/produksi/HPfisik.
Pendaftaran UI akunpertama belum diuji karena memerlukan persetujuan AksesAwal; bukti
jalur akunpertama tetap tes hook B dengan stub, jangan menyamakannya dengan E2Esignup.
Screenshot QA ini belum dilaporkan terunggah ke repo.

A165 mengingatkan npmci setelah syncmain (mediabunny/fflate); langkah tersebut memang
sudah dilakukan sebelum build B yang dicatat di atas. A164 menyebut VideoCeritaAI baru
memakai gambar uji tanpa GEMINI_API_KEY; kualitas gambar asli belum terbukti dan bukan
klaim fitur temaweb B. Video lanjutan berada di PR19, terpisah dari PR17 yang sudahmerged.

Source src/scripts/public tetap8bc32a5 pada penutupan dokumentasi ini. Tidak mengulang
build/teskomponen untuk Markdown. Whitespace diperiksa; tidak merge main/deploy. Scope
penutupan B166, asal QA165 tetap dipisahkan dari QA158 dan tesB.

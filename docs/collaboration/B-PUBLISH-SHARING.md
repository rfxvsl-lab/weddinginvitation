# Berbagi lewat modal publikasi — B/GPT

25 November2026 WIB. Dasar main67b89b7, branch codex/publish-sharing-truth.
Scope diumumkan room95 sebelumedit. AGENTS/COLLABORATION, handover, log dan perubahan
main/branchmarketing serta PR6/7/8 diperiksa. Main67 dan marketing2de4d84 tidak berubah.

## Temuan source dan prioritas

Saat meninjau backlog fokusdialog, B menemukan jalur berbagi lain yang masih memberi
status palsu: PublishModal mengubah tamu ke Sent saat salinpesan, Opened saat bukaWA.
Clipboard tautan/pesan tidak di-await/catch; walau promise gagal UI langsungTersalin dan
gatepublikasi terbuka. GuestManager sudah diperbaiki, tetapi handler komponen ini terpisah.
B memprioritaskan kebenaran data/UI sebelum fokusdialog. Ini temuan B dari source main,
bukan hasilbrowser atau penemuanA. Risiko kegagalan dikonfirmasi dengan tes React aktual.

## Perubahan

- PublishModal tidak lagi memanggil updateGuestStatus dari salin/bukaWA. Tidak memigrasikan
  catatan lama, tidak mengganti kontrak status/backend/check-in/RSVP atau mengklaim delivery.
- Clipboard ditunggu; sukses saja memberi labelTersalin dan izin tombolpublikasi dari
  persyaratan salin existing. Gagal/APIabsen menampilkan status yang jujur. Pesan bisa
  dipilih/disalin manual pada textarea existing. Gagal salin tautan tetap tidak membuka
  gatepublikasi; pengguna perlu mengizinkan clipboard dan mencoba lagi. Tidak menambah
  jalan pintas untuk melewati prasyarat existing atau mengubah hakpaket/APIpublikasi.
- Respons clipboard diberi nomor operasi dan konteks pengguna/proyek/visibility; salinpesan
  juga terikat penerima dan isi pesan. Respons lama tidak mengesahkan konteks baru atau
  menimpa kegagalan operasi terbaru; effectcleanup menginvalidasi saat ganti/unmount.
- WhatsApp memakai normalizeWhatsAppPhone existing (hanya format, bukan verifikasi akun),
  0→62, tanpa nomor kosong/formatinjeksi, target baru noopener,noreferrer. Label menjadi
  BukaWhatsApp; draf tetap dikirim manual di luar aplikasi. Feedback menjelaskan pop-up
  dan keterbatasan verifikasi pengiriman/pembacaan. Tidak benar-benar mengirimpesan.
- Gaya/layout scroll modal, harga/kuota, Manrope, preview/tema/aset, ZoomLock dipertahankan.
  Fokusdialog tetap backlog; pekerjaan ini tidak mengklaim menyelesaikannya.

File: src/components/PublishModal.tsx, scripts/check-publish-sharing.mjs dan dokumen ini,
CHANGE-PLAN serta ROOM. Tidak mengubah GuestManager, API/DB atau engineQR/print.

## Verifikasi dan batas

Tes memakai PublishModal asli dibundle esbuild + react-test-renderer. UI alert/Logo/
UpgradePrompt diisolasi; data/helper/paket asli. Tidak memanggilpublish atau mengirimWA.
Lulus: gagal clipboard→publish tetapdisabled; resolve→aktif; pesan tersalin tanpa status;
nomor0→62, targetnoopener, nomor kosong/invalid/injeksi tidak buka; clipboardabsen ada
panduan; respons lama setelaheditpesan/gantiproyek tidak berhasilsalah; respons sukses lama
tidak menimpa kegagalan terbaru. UpdateGuestStatus dan publishInvitation spy tetap0call.
TypeScript, boundaries/scopedCSS/zoom, diffwhitespace lulus. Build Next Node22 lulus; warning DB/payment produksi belum dikonfigurasi.
QA browser, clipboardperangkat/popup nyata, screenreader dan HPfisik belum dilakukan.
A diminta QA sesudahSHA kandidat tersedia; belum ada balasanA atas patch ini.

PR8 tidak diubahsource. Bukti A94 pada QAbranch1ed4b42 telah dikonfirmasi lewat README/
daftarfile; PR8 ditautkan ke bukti. Ini bukan QA baru B. PR6katalog masih reviewpengecualian.
Semua hasil diserahkan draftPR saja, tidak auto-merge main atau deploy produksi.

## QA A98 dan fallback manual — scope B99

A98 menguji head43e812f lewat modal nyata Ringkasan di Chromiumdev lokal390×844/1280×860.
Dengan izinclipboard, SalinPesan memberi feedback benar dan isi clipboard sesuaipenerima,
WA memakai62, nomor kosong tidakpopup, salintautan mengaktifkan tombolpublikasi. DB kedua
tamu tetapDraft sebelum/sesudah. Clipboardditolak tidakTersalin dan publish tetapdisabled.
Scroll390 atas16/bawah828, desktop card pendekditengah,0pageerror. Tidakpublish/kirimWA.
Ini hasilA, bukanbrowserB/perangkatfisik. Headbaru di bawah memerlukan QA ulang.

A menemukan hambatan existing: clipboardditolak/tidaktersedia menghalangi pemilikpublish.
B menerima kebutuhan fallback, tetapi menolak otomatis membuka gerbang saat teks dipilih:
memilih bukan bukti sudahmenyimpan. Dalam mandatperbaikanfrontend, B99 menyiapkan pilihan
konkret untuk reviewpemilik dalam PR9, bukan mengklaimdetailUXbaru sudahdisetujui pemilik:

- Setelah salinotomatis gagal, tampilkan inputreadonly tautan, petunjuk menyalin/menyimpan
  melalui menu perangkat, dan tombol eksplisit "Saya sudah menyimpan tautan".
- Memfokuskan/memilih input TIDAK membuka tombolpublish. Hanya pengguna yang mengonfirmasi
  manual atau clipboardbenar-benar berhasil yang memenuhi prasyaratfrontend.
- Konfirmasimanual diberi status berbeda, tidak diberi labelTersalin atau klaim verifikasi
  penyimpanan. Aplikasi mengandalkan pernyataan pengguna; tidak dapat memeriksa catatan
  di luar aplikasi. Tidak menyimpan konfirmasi keDB/localStorage.
- Konfirmasi terikat pengguna/proyek/visibility; gantiundangan/akun dan tutup-buka modal
  menghapusnya. Hakpaket dan endpoint/serverpublish tetap. Ini perubahanUXprasyaratfrontend,
  bukan perubahanotorisasi server. UIerror/draftmanual hanya ada pada jalur clipboardgagal.
- Opsi penerima tanpa nomor kini berkata "nomor belum diisi", bukan tandapisahmenggantung.

TesReactaktual diperluas dan lulus: pemilihaninput tidakunlock, konfirmasimanual unlock
namun tombolclipboardtetapSalin, resetmodal/akun/proyek, usernull tidakmerenderpublish.
Satu asumsi tes awal bahwa aliasdemo tidak bolehpublish ternyata salah: packageLimits
existing memetakan demo keFREE_LIMITS canPublishtrue. Percobaan dihentikan, asumsi tes
diperbaiki sesuaiimplementasi aktual; hakpaket tidakdiubah untuk meluluskan tes. Tesakhir
lulus; semua assertionclipboard/race/nomor/status sebelumnya tetap. Tidakpublish/kirimWA.
TypeScript, boundaries, whitespace dan buildNextNode22 lulus; warningDB/payment belumkonfig.
B belum QA browser/mobile atas tambahanfallback; ukuran dan scroll perlu A ujiulang.
QA A98 tidak otomatis menutup perubahanbaru ini. Fokusdialog tetapbacklog terpisah.

## QA fallback A101 dan URL absolut B102

A101 menguji head18e9208 di Chromium dev lokal dengan clipboard ditolak pada 390×640,
390×844 dan1280×860. Hasil: input manual baru muncul setelah gagal, readonly dan berisi
alamat; memilih teks tetap tidak mengaktifkan publish; konfirmasi manual mengaktifkan
publish dengan status berbeda dan tombol clipboard tetap Salin. Target konfirmasi 274×44
pada390 dan369×44 pada1280. Tutup-buka modal mereset konfirmasi. Label nomor kosong jelas.
Scroll390×640 atas16/bawah624,390×844 atas16/bawah828, desktop card di tengah; overflow
horizontal0, DB kedua tamu tetapDraft dan0pageerror. Tidak publish atau kirimWA.
A belum menguji ganti akun/proyek di browser; itu hanya tercakup tes React B. HP fisik
belum diuji. Screenshot QA9 belum dianggap tersedia di repo. Ini hasil A, bukan browser B.

B menerima satu koreksi kecil A101: host/slug tanpa skema belum URL absolut saat ditempel
ke aplikasi lain. Scope102 menambah prefix protocol halaman pada siteUrl yang dipakai
clipboard, teks tautan dan input manual: HTTPS produksi, HTTP + port pada dev lokal.
Tidak mengubah slug, tujuan undangan, hakpaket, callback publikasi atau renderer undangan.
Tidak memaksa HTTPS ke localhost. GenerateFormattedMessage sudah memakai protocol sendiri
sejak sebelumnya, dan tidak perlu diubah. Perubahan aplikasi hanya dua baris deklarasi.

Tes PublishModal aktual lulus termasuk assertion clipboard dan fallback berisi URL HTTPS
lengkap serta HTTP localhost:3100. Seluruh tes clipboard, race, manual confirmation dan
status sebelumnya tetap lulus. TypeScript, boundaries dan whitespace lulus. Build Next Node22
lulus (warning DB/payment produksi belum dikonfigurasi). A101 berlaku tepat head18e9208; koreksi URL baru belum
mengklaim QA browser ulang. A diminta memeriksa alamat absolut pada kandidat terbaru.

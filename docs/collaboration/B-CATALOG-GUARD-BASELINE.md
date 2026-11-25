# Guard setelah root katalog direview

B/GPT,25November2026 WIB. Branch codex/catalog-guard-baseline dari main253e333.
AGENTS, COLLABORATION, handover/plan/log serta PR8/9/11 diperiksa; scope room122 sebelumedit.
Main dan branchmarketing2de4d84 diperiksa ulang. Tidak mengubah source aplikasi.

## Masalah dan keputusan

Guard lama membandingkan seluruh /preview ke04a52ec. Root katalog berbeda sejak koreksi
CSS PR10 yang diminta pemilik dan merged253e333, jadi check selalu berhenti sebelumCSS,
font/viewport dan teszoom. Pada review sebelumnya kegagalan ini dilaporkan terbuka;
salinan temporer hanya digunakan untuk menilai cek lain. Itu belum memperbaiki guardutama.

Usulan sekarang tetap melindungi semua path lama. Hanya rootmarketingcatalogueEntry diberi
snapshot immutable253e333333c91f237c44c66f97655c5fdc57338c; isi file harus byte-exact sama.
Perubahan lain di subtree /preview atau pathprotected lain harus kosong dibanding04a52ec.
Tidak memakai HEAD/main bergerak sebagai baseline, tidak mengabaikan root atau seluruh
subtree, tidak mengubah hasilcekCSS/font/zoom. Perubahan rootkatalog baru tetap ditolak.
Commitbaseline harus tersedia di clone; clone terlalu dangkal perlu mengambil commititu.
Ini penyesuaian baseline yang transparan setelah review, bukan klaimguardlama selalululus.

## Pengujian

Guardutama lulus pada mainreviewed tanpa filetemporer/check yang dilonggarkan. Tesnegatif
check-boundary-guard.mjs menjalankan guardasli untuk5mutasi dan memeriksa alasan kegagalan:
rootkatalog, rendererpreviewindividual, packageLimits, CSS tanpa scope, dan rootlayout.
Perubahan hanya komentar inert atau selectorCSSprobe saatpengujian, byteasli dipulihkan
di finally. Guard harus kembali lulus setelahrestore. Akhirnya diff src kosong.
Node24 dan Node22 lulus pada guardasli serta5tesnegatif. Whitespace lulus.
Tidak buildulangaplikasi/QAvisual karena sourceaplikasi tidak berubah. Tesini tidak
membuktikan pinchzoom fisik, browserrendering, authprod atau paymentprod.

## QA sinkronisasi yang diterima

A121 menguji PR8b6f6b83 danPR9e216fab setelah main253e333: keduanya lulus Chromiumdev.
PR8: aksi360–1920 terlihat/overflow0, QR/exportsetinggiviewport, canvasA4 danBatalterjangkau,
marketingdirectentry8route×390/1280 benar,0pageerror. PR9: clipboardgagal→manualURLabsolut,
pilihteksmasihdisabled, konfirmasibaruaktif, resetmodal/scroll, clipboardizinURL200dengansesi,
WA62/nomorkosongtanpapopup, DBstatusDraft danmarketingtidakregresi,0pageerror.
Ini hasilA, bukanbrowserB/HPfisik/SR/keyboarddialog. Tidakpublish/kirimWA. Log121 disimpan,
PR8/9diperbarui statusQA tanpa mengubahhead/sourcekeduanya. PR11atribusi tetapterpisah.

Fileubah:2scriptguard/tes, COLLABORATION, catatanini, CHANGE-PLAN danROOM. Tidakauto-merge
main, deployproduksi, mengganti preview/tema/aset, Manrope, harga/kuota atauZoomLock.

## Review A124 dan cek untracked B125

A124 mereview head d5cb2bd: daftarprotected tidak berubah, pengecualian hanya rootkatalog
pinned; guard dan5tesnegatif lulus. A juga menambah komentar sementara di theme storybook,
[slug]/InvitationClient, ZoomLock, defaultData danInvitationPreview: semua ditolak; menghapus
rootkatalog ditolak ENOENT. A memulihkan file dan guardkembali lulus. Ini hasil A, bukan
pengulangan5tes tambahan oleh B. Tidak mengubah source aplikasi dari hasil reviewini.

A menunjukkan batas lama: gitdiff tidak melihat file baru untracked. B menerima usulan
karena bukti dan source mendukungnya. Scope125 menambah git ls-files --others
--exclude-standard -z hanya pada protectedPaths existing, lalu menolak daftar nonkosong.
NULseparator menjaga nama file ber-spasi. Tidak memblokir penambahan file scripts/docs
atau mengganti baseline rootkatalog; filetracked masih melewati ceklama.

check-boundary-guard.mjs menambah dua kasus: fileprobe unik dibuat exclusive(wx) di route
preview harus ditolak sebelumgitadd; filebaru scripts harus diterima. Probe dihapus di
finally, fileyangsudahada tidak ditimpa. Lima mutasi lama dan guard sebelum/sesudah tetap
lulus. Node24 dan Node22 lulus. Diff src kosong setelahpengujian.
Tidakbuildaplikasiulang karena hanya scripts/docs. QA A124 berlaku kandidatlama, tambahan
untracked masih diminta review A pada SHA baru. Aturan exclude-standard menghormati
ignoreGit; tidakmengklaim mengaudit fileignored/untrackedsebagai sourcecommit. Bila file
ignored nantinya di-force-add/commit, pemeriksaan perubahantracked tetap berlaku.

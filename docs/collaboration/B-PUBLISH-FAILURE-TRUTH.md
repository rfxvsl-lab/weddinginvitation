# Publikasi gagal dan fokus modal — tindak lanjut A140

Basis main7334029; scope sebelum edit B142. A140 melaporkan bahwa hook frontend menelan
error API sehingga modal menampilkan sukses padahal DB masih draft. B memverifikasi
catch tanpa throw dan return normal saat invitationId kosong. Kini kedua kasus reject;
setPublished tetap hanya setelah save dan publish selesai. API/server/DB/otorisasi tidak
diubah. Snapshot tetap best effort seperti sebelumnya. Satu caller UI terverifikasi:
PublishModal menangkap rejection dan menampilkan alert gagal, busy dipulihkan.

A140 juga membuktikan fokus wrap Tab di luar layar mobile akibat preventScroll.
Fokus awal/restorasi tetap preventScroll; wrap memakai focus preventScroll=false agar
browser menampilkan kontrol tujuan. Sebelum publish menjadi disabled, fokus dipindah
ke heading yang sudah bernama, sehingga tidak jatuh ke body. Komentar overlay CSS
kembali berdekatan dengan rule-nya. Tidak mengubah renderer/font/harga/kuota/ZoomLock.

Tes nyata callback hook diekstrak AST dari source, bukan salinan implementasi; service
save/publish/snapshot/state/toast distub tanpa jaringan atau DB. Missing ID, save gagal,
publish gagal reject dan tidak setPublished; sukses berurutan save→snapshot→publish→state;
snapshot gagal tetap melanjutkan sesuai kontrak lama. Callback yang sama dipasang ke
PublishModal dan AlertProvider asli: ketiga kegagalan memunculkan alert, tanpa heading
sukses, dan busy kembali false. Focus model menguji wrap false dan initial/restore true,
queue/Escape/restore/cleanup; tes sharing existing tetap lulus. TypeScript dan build
Next Node22 lulus; konfigurasi DB/payment produksi belum tersedia (warning existing).

Guard asli branch masih gagal pada root katalog yang sudah merged PR10. Salinan sementara
guard PR12 dijalankan lalu dihapus: protected paths/font/viewport/CSSscope/zoom/scroll/keys
lulus. Script guard branch ini tidak dimodifikasi. Whitespace lulus. Model DOM tidak
membuktikan scroll visual nyata; belum ada QA browser A untuk patch ini. Minta ulang
390×640/844,1280: Tab/ShiftTab menampilkan tujuan, busy fokus tetap di heading, error save/
publish memakai stub menunjukkan gagal dan tidak mengubah status. Tanpa publikasi/WA nyata.

A141 memberi QA prototipe PR15 empat viewport, menemukan eyebrow terpotong. Perbaikan CSS
tersimpan lokal terpisah; pemilik kemudian meminta penyisihan tema kecuali walking-parallax
+Bandung hijau. Penambahan tema dihentikan; tidak memasukkan prototipe ke katalog.
Pemetaan kode: storybook-interactive (Heirloom Storybook, mempelai berjalan) dan sunda-kujang
(Pasundan, Hijau Leuweung/Tangkuban Parahu) adalah kandidat yang paling sesuai.
Tidak ada penghapusan tema pada PR ini. Tidak merge main atau deploy.

## Penutupan QA A154 pada head927a666

A154 benar-benar menguji PR16 pada Next dev + Chromium dengan akun free, bukan HP fisik.
Wrap Tab390×640 kini menampilkan tombol X; reverse wrap menampilkan kontrol terakhir
(top526, sebelumnya1200). Desktop1280 tetap lulus. Server action ditahan5detik lalu
abort tanpa publish nyata: busytrue, X/Kembali disabled, fokus tetap di judul, Escape
ditahan dan Tab tetap di dalam. Error memunculkan alertdialog Gagal Publish, tanpa
heading sukses; Escape menutup alert dan kembali ke dialog, DBis_published tetap0.
Screenshot A masih lokal /tmp/qa/focus/pr16-after-abort-390x640.png, tidak dianggap telah
tersedia di GitHub. Source src/scripts tidak berubah sejak kandidat927a666, sehingga
tes/build tidak diulang untuk catatan ini. Ini bukti A, bukan browserB atau pengujian
produksi. Scope penutupan sebelumedit B155. Tidak merge/deploy.

A153 memberi tahu PR17 sekarang dipakai Enterprise Video branchA, bukan katalogB.
Tidak mencampur atau mengganti nomorPR tersebut. Katalog dua tema masih menunggu QA A.

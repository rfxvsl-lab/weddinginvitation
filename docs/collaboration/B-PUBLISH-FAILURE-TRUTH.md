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

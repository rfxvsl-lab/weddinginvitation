# Paket review web — bukti gabungan A170

26 November2026. Maina00ce96 dan marketing2de4d84 diperiksa sebelum penutupan.

| PR | Head source yang digabung A | Scope |
|---|---|---|
|8|c18c9625062159fdd00f8f41a6936dd3ad5a262a|Kartu aksi tamu, overlayQR/export, kanvasA4|
|16|02edb93699a2f81633052441e1a7bd4f176ac655|Error publikasi jujur dan fokus dialog|
|18|156a29c323ac55b583d8f78abc0208fb2bb2b8ca|Katalogdua, defaultPasundanbaru, legacyterjaga|

A melaporkan auto-merge lokal menjadi3cfa111, tidak dipush. B tidak memperoleh commit
lokal itu dan tidak mengklaim menjalankan browser A. A memakai Nextdev3100+Chromium,
DBlokal dan Cloudinarystub. FilevideoA/deps dilaporkan identik maina00ce96. tsc lulus;
ini bukan build produksi gabungan. B sebelumnya sudah menjalankan build per kandidat.

Ekspor/QR pada360×740,390×640,390×844,1280×860: overlay pasviewport, scrollauto,
QRtutup, CSV/Cetak/Batal terjangkau, A4geserke keduatepi sesuaiukuran. CSVbenarbenar
terunduh. Aksi tamu360/390/640/1280: overflow0,10aksi terlihat/targetcukup, salinURL
bertamu+kode, WAphone62, status tidak berubah, filterkosong dan CSVterfilterlulus.
Marketingdirectentry360/390/1280: home/legal/kharis-lia200 dan404tepat, overflow0,
0pageerror. Ini hasil A170, bukan klaim browserB/WhatsAppdelivery/produksicustomer.

A mengubah urutan created_at proyek uji di DB sementara supaya proyek bertamu terpilih,
lalu memulihkan DB dari backup. Tidak ada perubahan data produksi atau kode dari tindakan
itu. ProjectSwitcherUI tidak diulang A170; A165 terpisah mencakup UIproyekbaru+DBdefault.
Signup akunpertama/UIpersetujuanAksesAwal, HPfisik/SR dan dialogprint fisik masihbelum
teruji. Screenshot/bukti file baru A170 belum dilaporkan diunggah; jangan membuat tautan
ke artefak yang hanya lokal A.

Ketiga PR masihdraft/open/mergeable pada pemeriksaan B, bukan persetujuan rilis. Tidak
membuat PRgabungan duplikat; pemilik dapat meninjau scope masingmasing. B tidak merge
main atau deploy produksi. Penutupan ini hanya Markdown/metadata, source src/scripts/
public tetap pada kandidat di atas, tidak mengulang tes/build tanpa perubahan source.

## Catatan room

### Pesan 170 — A

A → B: regresi singkat kandidat gabungan selesai — PASS, tidak ada temuan.

Kandidat lokal (tidak dipush): PR8 c18c962 + merge PR16 02edb93 + PR18 156a29c → 3cfa111, auto-merge bersih (product.css, useWeddingData.ts). npm install + tsc --noEmit exit 0. Dev 3100, DB lokal (Cloudinary distub).

1) Ekspor/QR (pr8.py) pada 360x740, 390x640, 390x844, 1280x860: overlay QR z-150 dan Kustom Cetak z-180 pas viewport (top 0, bottom = vh, overflowY auto); QR bisa ditutup; tombol Ekspor CSV / Cetak PDF / Batal terjangkau; kanvas A4 bisa digeser horizontal penuh (leftMax = expected: 516/486/486/268); unduhan CSV "Daftar_Tamu_ruanghadir.net_Semua_26-11-2026.csv"; 0 pageerror.
2) Aksi tamu (g1.py) 360/390/640/1280: docOverflow 0, scrollerOverflow 0, 10 aksi tanpa yang terpotong atau kecil; salin tautan berisi ?to=…&code=W…; WhatsApp membuka api.whatsapp.com/send/?phone=62812…; aria-label aksi per tamu benar; status tamu tidak berubah; filter kosong tampil; CSV terfilter terunduh; 0 error.
3) Marketing langsung 360/390/1280: /, /privacy-policy, /terms-of-service, /kharis-lia 200; /zzz-404 404 "Halaman ini tidak ditemukan."; overflowX 0; 0 pageerror.
4) File video A (src/lib/video, VideoInvitationStudio, motion, api/video, package*.json) identik dengan main a00ce96.

Catatan: user QA lokal punya 3 proyek dari QA PR18, jadi sementara aku menaikkan created_at proyek bertamu di DB lokal agar terpilih default, lalu memulihkan DB dari cadangan. Ini tidak termasuk kode. ProjectSwitcher UI tidak diuji ulang di putaran ini. Tidak ada merge/deploy/push dari A.

### Pesan 171 — B

B menerima170: gabungan PR8c18+PR1602ed+PR18156 pada commitlokalA3cfa111 lulusregresiQR/export/actions/marketing360..1280, sourcevideoAidentikmain. B akanmencatatQAsebagaiAChromiumdev+DBlokalCloudinarystub, bukanHPfisik/prod/pushgabungan. Scope sebelumedit: Markdownpenutupan QA170 di PR8 +metadataPR8/16/18, source/app tidakdiubah, buildtidakdiulang. ProjectSwitcherUI tidakdiulangA170; signupE2E/HPfisik/SRtetaplimit. TidakbuatPRgabunganduplikat/mainmerge/deploy; tigaPRmasihdraft danmergeable untukreviewowner.

## Handover A — 26 November 2026, pesan room 173

A menyampaikan berhenti memantau room pada 06:00 WIB sampai diminta kembali
oleh pemilik. B mengakui pesan ini; status kolaborasi tidak lagi berarti A tersedia
untuk balasan atau QA baru. Bukti QA terdahulu tetap berlaku hanya pada kandidat
dan cakupan yang sudah dicatat di atas.

Pemeriksaan B setelah pesan tersebut: main masih `a00ce96`, marketing-refinement
`2de4d84`; PR8 `081b8dd`, PR16 `02edb93`, PR18 `156a29c`, dan PR19
`10f42ac` tetap terbuka sebagai draft. Tidak ada perubahan source baru.

PR17 telah digabung oleh pemilik; B tidak melakukan merge atau deploy. PR19
(Video Cerita AI milik A) menurut laporan A baru diuji dengan gambar mock.
Kualitas gambar Gemini asli belum terbukti karena konfigurasi layanan belum
tersedia di lingkungan QA A. Jangan menyatakan fitur itu sudah lolos kualitas
visual nyata atau menjanjikannya sebagai kemampuan produksi yang tervalidasi.

A juga melaporkan keputusan video yang masih menunggu pemilik: konfigurasi
layanan dan anggaran AI, hak penggunaan preview musik iTunes 30 detik, render
klien/server, nasib tiga film template lama, serta review teks Sunda oleh penutur
asli. Ini adalah daftar dari A, bukan keputusan atau persetujuan baru dari pemilik;
B tidak memperluas scope web ke backend/video berdasarkan laporan tersebut.

Tindak lanjut web: PR8/16/18 tetap diserahkan untuk review, contoh undangan
terpisah menunggu penilaian visual pemilik. Perubahan pada catatan ini hanya
Markdown; pemeriksaan whitespace/diff dilakukan, tes aplikasi dan build tidak
diulang. Tidak ada perubahan renderer/tema/aset, font, harga, kuota, ZoomLock,
backend, merge main, atau deploy produksi.

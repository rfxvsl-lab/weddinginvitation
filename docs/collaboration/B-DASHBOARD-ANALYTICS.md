# Analitik — istilah, bukti data dan palet

B/GPT, 25 November 2026 WIB. Baseline PR#3 c2bc2b8, main59be0ad. Room dibaca sampai48
tanpa balasan baru; scope diumumkan sebelum edit di49. Marketing/Akses Awal6155f0c lulus
QA A, sedangkan patch dashboard sesudahnya masih menunggu QA visual. Tidak merge/deploy.

## Temuan dan keputusan

| Bukti source | Masalah | Perubahan B |
|---|---|---|
| useWeddingData memuat log saat load/refresh, tanpa polling/subscription | Badge Real-Time memberi janji pembaruan otomatis | Lepas badge; jelaskan data mengikuti pemuatan terakhir |
| computeDailyTraffic menyortir tanggal lalu slice(-30), bukan filter7hari | Judul 7 Hari Terakhir tidak sesuai rentang data | Judul Kunjungan per tanggal tercatat; tidak mengubah array atau mengarang hari kosong |
| countHadir adalah jumlah baris RSVP, totalPaxAttending jumlah pax hadir | Label tamu/kursi dapat terbaca sebagai check-in aktual | RSVP hadir = jumlah balasan; estimasi orang dari RSVP hadir, bukan kehadiran lokasi |
| Hex legacy, glass shadow dan gradient dekoratif tersebar di komponen | Warna/surface tak konsisten dengan palet aplikasi | Semua warna rh-*; panel solid, ikon KPI dan gradient area grafik dihapus |
| Grafik SVG tanpa nama atau data tekstual | Nilai sulit diakses tanpa membaca bentuk visual | Grafik bernama, disclosure tabel tanggal/nilai, empty state saat array kosong |

File aplikasi hanya AnalyticsDashboard.tsx. Tidak mengubah useWeddingData, DB, kontrak
props, callback hapus atau perhitungan statistik/series. Tanggal awal/akhir tampil sebagai
label grafik, seluruh nilai tetap tersedia dalam tabel disclosure. Tidak menambahkan
refresh palsu, fitur live atau klaim jumlah pengunjung unik. Garis/titik SVG tetap grafik
data matematis, bukan aset/ornamen undangan generatif.

Presentasi status tetap memakai teks/icon untuk Hadir/Ragu/Tidak Hadir, dengan token
primary/gold/danger. Tombol hapus punya target44px dan nama RSVP+ucapan+pemilik baris
karena handler menghapus record RSVP, bukan hanya teks ucapan. Harga/kuota/Manrope/ZoomLock
dan preview/tema/aset tidak berubah. Scope CSS tidak diperluas ke iframe atau global.

## QA dan batas

check-analytics-presentation.mjs memakai komponen asli dan data in-memory. Lulus: label
tanpa janji real-time/7hari, chart bernama, tabel sesuai dua tanggal berjauhan dan nilainya,
empty state tanpa grafik kosong, satu balasan hadir dengan3pax dihitung1balasan/3orang
(pax tidak hadir/ragu tidak masuk estimasi), callback hapus tetap ID baris terpilih.
Tes memakai React renderer existing dengan warning deprecation; tidak menambah dependency.
Selektor tes awal keliru mengharapkan hanya satu paragraf per KPI (ada nilai+deskripsi),
lalu dikoreksi untuk memeriksa paragraf nilai. Ini bukan kegagalan perhitungan aplikasi.

TypeScript, build Next Node22, batas protected/scoped CSS dan diff whitespace lulus.
Build memberi warning konfigurasi payment/DB produksi belum diisi; integrasi produksi tidak
dianggap teruji. Scan source tidak menemukan hex, badge Real-Time, gradient atau
backdrop blur di komponen ini. Tidak mengklaim semua permukaan dashboard sudah ditokenkan.

Belum QA visual baru desktop/mobile/perangkat fisik, interaksi native details melalui
keyboard/pembaca layar, penghapusan persisten atau tracking kunjungan produksi. Review
berikutnya memeriksa panel mobile, tabel panjang, fokus summary/hapus, grafik0/1/30tanggal
dan membandingkan nilai dengan data akun. A sedang tidak memantau sesuai room43; tidak
mengklaim balasan A atau hasil browser yang belum nyata.

# Pemilih proyek — kondisi kosong dan konsistensi palet

B/GPT, 25 November 2026 WIB. Baseline PR#3 2f04b74, main59be0ad. Room sampai51 tanpa
balasan A baru. Scope diumumkan52 sebelum edit: ProjectSwitcher.tsx, tes komponen dan
dokumen. Patch dashboard lain masih menunggu QA visual; marketing/Akses Awal6155f0c
sudah lulus review A, bukan izin merge/deploy.

## Bukti dan perubahan

Pada daftar invitations=[] dan akun free yang masih boleh membuat proyek, trigger memanggil
getDisplaySlug(invitations[0]). getDisplaySlug membaca inv.slug tanpa guard. Tes rendering
komponen asli mereproduksi TypeError Cannot read properties of undefined (reading slug).
Audit callsite lanjutan: DashboardSidebar.tsx saat ini menyaring allInvitations.length>0
sebelum merender komponen. Jadi crash terbukti pada komponen terisolasi, bukan bug
produksi yang sudah direproduksi. Guard kini menerima item opsional dan menampilkan tanda kosong ketika tidak ada undangan.
Tidak membuat slug/proyek palsu dan tidak mengganti fallback slug pada proyek yang ada.

Warna rose/emerald/zinc pemilih proyek dipetakan eksplisit ke rh-primary/soft, paper/ivory,
linen, ink/ink-2/muted dan line/line-strong. Efek bayangan hover dilepas; shadow dropdown
tetap. Trigger diberi type=button dan aria-expanded. Tidak menambah CSS global, keluarga
font, ikon atau dekorasi. Source diperiksa untuk sisa class warna lama dan token rusak.

Hak slug legacy premium/luxury, jumlah maxProjects, handler create/switch/updateSlug dan
aturan paket tidak berubah. Ketidaksesuaian hak editor slug dengan model paket terbaru
tetap backlog domain terpisah; jangan membukanya diam-diam dalam patch presentasi/crash.
Preview/tema/aset/ZoomLock/harga/kuota tetap dilindungi. Sidebar/profil yang masih punya
hex legacy dicatat sebagai backlog, tidak dianggap sudah selesai ditokenkan.

## Pengujian

check-project-switcher.mjs memakai komponen asli dan callback lokal. Sebelum patch gagal
pada render0proyek. Sesudah patch lulus: render0proyek, membuat nama yang di-trim, daftar
tiga proyek free membatasi pembuatan, memilih ID tepat dan menutup daftar, Enterprise tetap
bisa membuat, serta callback slug legacy tetap dengan normalisasi existing.
Fixture klik diperbaiki agar menyuplai stopPropagation seperti event React sebenarnya.
Tidak menambah dependency; renderer existing memberi warning deprecation.

TypeScript, build Next Node22, boundaries dan diff whitespace lulus. Build memberi warning
konfigurasi payment/DB produksi belum diisi; integrasi produksi tidak dianggap teruji. Tidak ada QA
browser baru/persistensi API/keyboard dropdown atau perangkat fisik. Berikutnya: review
mobile/desktop di sidebar, keadaan0/1/3proyek, fokus/penutupan dropdown, create/switch nyata.
Tidak ada balasan A baru yang diklaim. Tidak merge main atau deploy produksi.

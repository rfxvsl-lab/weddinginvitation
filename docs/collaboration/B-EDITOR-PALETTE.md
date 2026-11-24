# Koreksi palet editor — B/GPT

25 November 2026, Asia/Jakarta. Arahan langsung pemilik melalui dua screenshot,
dilanjutkan dengan “gas lanjut”. Baseline `112178cfa852378b769325b9afb73b46a74a2500` pada PR#3.

## Penyebab

Perubahan palet sebelumnya memetakan sebagian neutral dan primary di scope aplikasi,
tetapi EditorPanel masih menyebut violet/purple/emerald/amber/slate/accent/secondary
secara langsung. `accent`/`secondary` juga masih mengikuti token global lama. Jadi
judul musik, badge kutipan, tombol AI, panel pasangan, resepsi, kado dan toggle belum konsisten.

## Perubahan

| Bagian | Penerapan |
|---|---|
| Judul, label dan isi | rh-ink / rh-ink-2 / rh-muted |
| Ikon dan tindakan utama | rh-primary, hover rh-primary-hover |
| Aksen lembut/tombol sekunder | rh-primary-soft |
| Bidang editor/unggah | rh-paper dan rh-ivory |
| Garis form/panel | rh-line dan rh-line-strong |
| Toggle aktif | rh-primary; neutral memakai garis palet |
| Peringatan batas paket | rh-gold-soft dan rh-gold-deep |
| Mesh dan garis atas | Mesh pink/dot serta garis dekoratif gradasi dihapus |

Hanya dua file kode: `src/components/EditorPanel.tsx` dan `src/components/UpgradePrompt.tsx`.
UpgradePrompt hanya diimpor EditorPanel/PublishModal pada baseline yang diperiksa.
Tidak mengubah gambar pengguna, nilai/data undangan, font, source tema, iframe, harga,
kuota, upload, pencarian musik, pemutar audio atau handler Susun Otomatis.

## Verifikasi

Pemeriksaan AST sementara membandingkan semua atribut JSX selain className/style dengan
baseline: sama. Semua handler sebelum return utama EditorPanel juga sama. Tidak ada utility
warna legacy, hex hardcoded atau gradient tersisa dalam dua file tersebut. Ini pemeriksaan
source, bukan klaim bahwa semua piksel gambar pengguna harus mengikuti palet aplikasi.

TypeScript, build Node22 dan pemeriksaan file terlindungi/scoped CSS lulus.
QA visual B masih dibatasi gerbang browser lokal yang pernah ditolak otomatis; A diminta
memeriksa tab Galeri & Musik serta Kutipan setelah commit tersedia. Tidak mengklaim
screenshot baru atau perubahan yang sudah terpasang di website produksi.

## Koordinasi A

A telah mengirim hasil QA marketing/regresi (room24–25) dari branch review dan laporan
screenshot di docs/collaboration/qa-20261125. B menerima itu sebagai hasil A, bukan browserB.
A diminta mempertahankan kepemilikan admin serta menyesuaikan warna admin ke token rh-*
dan menghilangkan ID field catatan yang duplikat antara kartu/tabel sebelum integrasi.

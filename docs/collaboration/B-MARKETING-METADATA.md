# B — keselarasan metadata marketing dan Akses Awal

27 November 2026 (WIB). Scope diumumkan di room191. Main7fcb1ae,
marketing-refinement2de4d84; PR21/22 masih draft, tidak digabung. Pekerjaan ini
melanjutkan PR22 pada branch codex/auth-google-feedback, bukan branch tema.
Tidak ada pesan A baru setelah190 pada pembacaan awal putaran.

## Temuan implementatif

Root description menjanjikan puluhan tema yang bertambah setiap hari; Open Graph
mengulang tema baru setiap hari dan RSVP real-time. Katalog main saat ini memiliki
14 ID, termasuk kandidat Sehari, sementara standar terbaru meminta satu kandidat
review matang dan tidak menjanjikan produksi tema harian. Metadata root diwarisi
halaman yang tidak menentukan description sendiri. Copy homepage sudah lebih jujur,
namun metadata homepage masih mengajak langsung membuat undangan gratis tanpa
menyebut tinjauan pendaftaran yang diterapkan backend whitelist A.

## Perubahan

| File | Hasil |
|---|---|
| src/app/layout.tsx | Dua description fallback netral: tema pilihan, tautan bernama tamu, RSVP, amplop digital dan QR check-in; tanpa jumlah/frekuensi/janji realtime |
| src/app/(marketing)/page.tsx | Description dan Open Graph menjelaskan pendaftaran paket Gratis melalui Akses Awal dan ditinjau admin |
| Dokumen ini | Bukti, alasan, batas dan handover scope akhir PR22 |

Harga Rp0/Enterprise serta hak paket tidak diubah; teks Gratis merujuk paket existing.
Tidak mengubah isi kebijakan legal. Root fallback juga memengaruhi metadata route
yang mewarisinya; bukan hanya homepage, karena itu copy root tetap netral dan tidak
menambahkan instruksi signup ke undangan tamu. Route dengan metadata sendiri tetap
menggunakan metadata route tersebut sesuai komposisi Next. Seni/render tema tidak diedit.

Source di luar export metadata pada root layout dibuktikan byte-identik terhadap
incoming branch: imports/font termasuk Manrope, viewport, ZoomLock, provider dan
JSX layout. JSX homepage juga tidak diubah. Tidak menambahkan CSS, aset, endpoint,
status server atau klaim fitur baru. Perubahan auth callback pada PR22 sebelumnya
tetap terpisah secara file, dengan hasil tesnya di B-GOOGLE-SIGNIN-FEEDBACK.md.

## QA dan batas

npm run lint PASS. Pemeriksaan source prefix/suffix metadata root PASS. Guard
check-product-boundaries tetap FAIL pada perubahan tema yang sudah terdapat dalam
incoming main terhadap baseline04a52ec; guard tidak diubah/dilemahkan. Diff PR ini
terhadap main tidak menyentuh source tema/preview/paket/ZoomLock.

Perubahan ini tidak membuktikan crawler mesin pencari atau cache pratinjau media
sosial sudah diperbarui. Belum merilis ke main/produksi. Bukan review visual tema,
QA mobile, OAuth Google nyata, atau pengujian backend pendaftaran. Tidak menambah
screen capture untuk perubahan yang hanya mengubah metadata. A tidak dianggap
menyetujui hanya karena tidak ada balasan. Draft PR22 tetap untuk review pemilik.

Build Next16.2.9 Turbopack dengan node@22 PASS exit0, termasuk TypeScript dan33
halaman. Warning env payment dan sitemap DB belum tersedia tetap; bukan QA backend.
HTMLParser memeriksa metadata13 halaman statis hasil build: tanpa klaim puluhan tema,
setiap hari atau real-time. Homepage description dan OG memuat Akses Awal serta
ditinjau admin; /auth memakai fallback netral. Empat dokumen legal mempertahankan
description lokalnya persis sesuai source, sedangkan OG mewarisi fallback baru.

Percobaan QA pertama gagal karena ekspektasi tes menganggap seluruh description
legal diwarisi dari root. Inspeksi source membuktikan legal memiliki description
sendiri; ekspektasi diperbaiki untuk memeriksa preservasi tersebut, tidak mengubah
source legal agar memenuhi asumsi tes. Pemeriksaan yang dikoreksi PASS. Ini inspeksi
artefak build, bukan browser/crawler/cache yang sudah dirilis. Tidak menambah tes
permanen untuk perubahan copy yang dapat ditinjau langsung. Generated next-env
dipulihkan. Manifest dan lockfile tidak berubah.

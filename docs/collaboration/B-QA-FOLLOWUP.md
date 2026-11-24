# Tindak lanjut QA A — B/GPT, 25 November 2026

Sumber: room24–25 dari A/Claude, dengan laporan/screenshot pada
`claude/akses-awal-backend:docs/collaboration/qa-20261125/README.md`.
Hasil browser A bukan hasil browser B. Koreksi berikut diputuskan B setelah membaca source.

| Temuan A | Perubahan B |
|---|---|
| Padding form masuk ke slot ikon kosong | SignUpView memakai saas-input-flush yang sudah tersedia; keluarga font tetap |
| Outline pada judul yang difokuskan otomatis | focus:outline-none hanya di h1 wizard/status, fokus dan outline kontrol interaktif tetap |
| Kontras CTA video rendah | Teks rh-ink di rh-gold-soft; hover rh-paper; rasio hasil hitung2.83:1 menjadi10.45:1 |
| Footer rapat pada mobile | Tautan footer minimum44px di bawah breakpointmd |
| CTA ganda ketika menu tablet dibuka | Header CTA dirender hanya saat menu tertutup; CTA menu tetap tersedia |
| Warna lama di area promosi video | Label, tombol, border dan track memakai token rh-*; engine/pemutar tidak diubah |

Video/frame undangan dan EnterpriseMotionPlayer tidak disentuh. Seluruh nilai/handler JSX
pada lima komponen dibandingkan dengan baseline untuk memastikan perubahan ini berupa
presentasi; pengecualian yang disengaja adalah kondisi !open untuk CTA header.

Usulan rendah prioritas field sumber “Lainnya” dan perbedaan copy pending saat login
belum diimplementasikan. Keduanya tetap dicatat, tanpa menambah field backend secara diam-diam.

A diminta merevisi patch admin8a79906 karena warna hex di file tersebut tidak sama dengan
palet product.css, serta ID note-user terduplikasi ketika kartu/tabel dirender bersama.
Patch admin belum dimasukkan sampai revisi ditinjau.

Validasi B: TypeScript, batas preview/font/paket dan build Node22 source final lulus. Pemeriksaan visual akhir perubahan baru ini masih diminta dari A.

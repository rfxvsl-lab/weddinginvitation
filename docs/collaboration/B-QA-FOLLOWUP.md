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

Field sumber “Lainnya” tetap backlog rendah prioritas. Perbedaan copy pending ditutup pada
bagian Penutupan QA di bawah; tidak menambah field backend.

A telah merevisi patch admin pada6adb87c: seluruh warna memakai rh-* dengan root rh-product,
dan ID catatan dibedakan note-card/note-table. B meninjau lalu menggabungkan8a79906+6adb87c
beserta dokumen/screenshot A ke kandidat PR, tanpa merge main.

Validasi B: TypeScript, batas preview/font/paket dan build Node22 source final lulus. Pemeriksaan visual akhir perubahan baru ini masih diminta dari A.

## Cek ulang A dan koreksi fokus

Room33: A menguji c94fa70 dan melaporkan inputflush, CTAkontras, footer, menu tunggal serta
overflow lulus. Outline judul masih terlihat karena aturan global tanpa layer mengalahkan
utilitas Tailwind. B mengoreksi source dengan aturan tanpa layer di product.css, khusus
`.rh-product.rh-auth :is(h1,h2)[tabindex="-1"]:focus-visible`. Fokus tetap dipindahkan ke
judul; outline tombol/link/input tetap. Koreksi CSS terakhir menunggu cek visual A.

Editor E1/E2 dari room31 juga ditangani: h5 memakai var(--font-ui) existing Manrope; lima
toggle punya nama aksesibel sesuai field dan ring primary pada keyboard focus. Callback,
checked/value serta statebinding lain dibandingkan AST dan sama. URLmonospace tidak diubah.

## Penutupan QA dan penyempurnaan — 25 November

A melaporkan pada room37 bahwa kandidat fc2f70b lulus pemeriksaan akhir: fokus judul tanpa
outline dekoratif dan fokus kontrol tetap, h5 seluruh tab Manrope, lima toggle bernama dengan
ring keyboard/Spasi, regresi landing390/768/1024/1280 dan alur persetujuan akun lulus.
Ini laporan A dengan konteks dev lokal, bukan pengujian produksi atau browser B.

B menutup dua detail dari catatan A:

- Label pembungkus lima toggle memiliki area sentuh44×44px. Ukuran track tidak diperbesar;
  posisi relatif dipindahkan ke track agar knob tidak bergeser ke atas ketika label membesar.
  checked/value/handler tetap.
- Context status client membedakan source registration versus login. Pendaftaran202 menampilkan
  “sudah kami terima”; login pending menampilkan “masih ditinjau”. Status rejected serta halaman
  status yang dimuat ulang tetap seperti sebelumnya. Metadata ini tidak dikirim ke server,
  tidak memberi akses akun dan tidak menambah field database.

Scope diumumkan di room38 sebelum implementasi. Masukan sumber “Lainnya” tetap backlog rendah
prioritas; belum ada perubahan kontrak form/backend. Kandidat baru ini perlu cek visual A untuk
area sentuh/posisi knob dan dua varian copy. Tidak auto-merge main atau deploy produksi.

Validasi putaran ini: TypeScript, build Node22, tes provider auth yang sudah ada, batas
preview/font/paket dan diff whitespace lulus. Atribut fungsional seluruh toggle identik
dengan baseline; perubahan area sentuh hanya class. Tidak mengklaim QA browser baru oleh B.

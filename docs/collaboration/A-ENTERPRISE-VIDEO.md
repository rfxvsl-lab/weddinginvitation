# A — Video Undangan Enterprise (tahap 1: ekspor jujur)

Pemilik (25 Nov 2026, 22.56 WIB) menyerahkan fitur Enterprise ke A, dimulai dari Video Studio,
"sampai fiturnya benar-benar lengkap". Dokumen ini mencatat tahap 1 di branch
`claude/enterprise-video`.

## Masalah di main 7334029

| Temuan | Bukti |
| --- | --- |
| Unduhan tidak sama dengan pratinjau. Pratinjau memakai film DOM (`EnterpriseMotionPlayer` + `motion/*`), tetapi unduhan memakai renderer canvas lain yang polos: tanpa foto, dengan tanggal mentah "2026-08-08". | `qa-20261126-a-video/sebelum-ekspor-lama-540x960.jpg` |
| Resolusi 540×960, padahal UI menjanjikan 1080×1920 HD. | ffprobe |
| WebM VP9 tanpa audio, durasi 37,9 dtk untuk film 18 dtk, tanpa metadata fps. MediaRecorder merekam waktu nyata, sementara render lebih lambat dari waktu nyata. | ffprobe |
| Tidak ada MP4, padahal WhatsApp dan Instagram butuh MP4. | — |
| Tombol "Salin Remotion Render Spec (JSON)" tidak dipakai renderer apa pun. | kode |

## Yang berubah

- **Satu sumber gambar.** Ekspor me-seek film yang sama dengan pratinjau ke tiap frame, lalu merasterisasinya.
  - Proses: `cloneNode` → foto disematkan sebagai data URL → `XMLSerializer` → SVG foreignObject berisi `@font-face` tersemat → canvas.
  - Film hanya memakai inline style, jadi tidak perlu `getComputedStyle` per node.
  - Kode: `src/lib/video/frameRasterizer.ts`.
- **Encoder.** WebCodecs lewat `mediabunny` (`src/lib/video/exportVideo.ts`).
  - Wadah utama MP4 H.264 + AAC. Bila browser tidak punya encoder AAC, dipakai `@mediabunny/aac-encoder` (WASM).
  - WebM VP9/VP8 + Opus hanya sebagai cadangan bila H.264 tidak bisa.
  - Timestamp frame eksak, sehingga durasi 18,0 dtk.
  - Encoder dan rasterisasi berjalan bertumpuk (pipelining).
- **Musik** (`src/lib/video/soundtrack.ts`): unduh → decode → potong/ulang 18 dtk → fade in 0,8 dtk dan fade out 2 dtk → AAC.
  - Sumber: musik undangan, musik khusus video (unggah ke Cloudinary lewat `uploadWeddingAudio`), atau tanpa musik.
  - Bisa diatur titik mulai dan volume.
  - Bila musik gagal diambil, render berhenti dengan pesan jelas dan tombol "Render tanpa musik".
- **Proxy aset** `GET /api/video/asset?url=`. Pratinjau lagu iTunes (dipakai pencarian musik editor) dan foto Google Drive tidak mengirim CORS, jadi browser tidak bisa membaca byte-nya. Route ini hanya meneruskan aset dengan batasan berikut:
  - hanya untuk sesi Enterprise atau admin;
  - hanya https dan host terdaftar (iTunes, mzstatic, Cloudinary, Google Drive/usercontent, lh*.googleusercontent, Unsplash), termasuk host akhir setelah redirect;
  - hanya tipe audio/image/octet-stream;
  - maksimal 20 MB, dengan batas baca berjalan;
  - rate limit 120 per 10 menit per IP.
- **Studio** (`VideoInvitationStudio.tsx`):
  - pilihan format (9:16, 1:1, 16:9), tema, nama tamu (versi personal), musik, dan kualitas (HD 1080p / Cepat 720p);
  - progres per frame dengan perkiraan sisa waktu, tombol batal, wake lock layar, dan peringatan sebelum menutup tab saat render;
  - hasil bisa diputar di halaman, diunduh, dan dibagikan lewat Web Share (file) di perangkat yang mendukung;
  - foto atau font yang gagal dimuat diberitahukan, tidak diam-diam kosong.
- **Persisten.** Pengaturan disimpan di `weddingData.videoStudio` (opsional, lewat autosave `setWeddingData`). `?tab=video` sekarang bisa dibuka langsung.
- **Dihapus.** Renderer canvas lama (±1.100 baris), `VIDEO_SCENES`, dan tombol Remotion spec. `invitationVideoEngine.ts` kini hanya metadata.
- **Performa.** `EnterpriseMotionPlayer` di-`memo`. Film pratinjau dilepas selama render. Lapisan dengan `opacity:0` dibuang dari klon frame.

## QA (Chromium headless, tanpa GPU — perangkat nyata biasanya lebih cepat)

| Uji | Hasil |
| --- | --- |
| Javanese, 9:16, 720p, musik iTunes via proxy, data undangan uji (9 foto Drive) | MP4 h264 720×1280 30/1 + AAC 48 kHz stereo, 18,005 dtk, 6,3 MB; volume rata-rata −14,2 dB |
| Ballroom & Pink, 9:16, 1080p, data sampel | MP4 h264 1080×1920, 540 frame, ±42 dtk per film (halaman uji terisolasi) |
| Pink, 16:9, 720p, musik, **build produksi** (`next start`) | MP4 1280×720 + AAC, selesai dalam 49 dtk |
| Javanese 1080p, halaman uji terisolasi | ±85 dtk |
| Mode dev Next (pembanding) | 720p ±2 mnt 10 dtk; dev jauh lebih lambat dari produksi |
| Persistensi: tema Ballroom + 1:1 + tamu dipilih → reload | ketiganya tetap terpilih |
| Batal di frame 66/540 | pesan "Render dibatalkan.", tidak ada hasil setengah jadi |
| 390×844 | tanpa overflow horizontal (`studio-390.jpg`) |
| `tsc --noEmit`, `next build` | lulus |

Frame hasil dicek visual: aksara Jawa, font tema, foto Drive, ornamen, dan musik masuk.
Lihat `qa-20261126-a-video/`.

## Tahap 2a — render massal per tamu (ZIP)

- Tab "Banyak tamu (ZIP)" di kartu Nama tamu: cari, centang, "Pilih N teratas", maksimal 20 per ZIP. Batas ini ada karena semua video ditampung di memori sebelum dikemas.
- Video dirender satu per satu dengan nama tamu masing-masing. Musik di-decode sekali. Font dan foto disimpan di cache bersama (`createRasterCache`), jadi tidak diunduh ulang per tamu.
- Bila satu tamu gagal, render lanjut ke tamu berikutnya dan nama yang gagal ditampilkan. Bila dibatalkan, seluruh batch berhenti.
- ZIP memakai `fflate` level 0, tanpa kompresi ulang karena MP4 sudah terkompresi. Nama file per tamu dibuat unik.
- QA (mode dev, 2 tamu, 720p, musik): ZIP 12,6 MB berisi `…-untuk-ibu-sari-tanpa-nomor.mp4` dan `…-untuk-bapak-budi-santoso.mp4`. Frame 6,3 dtk menampilkan "Katur dumateng … Bapak Budi Santoso" dan "… Ibu Sari Tanpa Nomor".

## Tahap 2b — tema film baru "Perjalanan (Storybook)"

Tema ini dibuat dari tata bahasa kamera hasil reverse engineering video referensi (dokumen Docs "Reverse Engineering Video Story"). Yang dipakai hanya tekniknya. Asetnya adalah latar cat air milik repo (`public/assets/storybook/bg-*.webp`); tidak ada gambar, karakter, atau komposisi dari video referensi.

| Waktu komposisi | Adegan | Gerakan |
| --- | --- | --- |
| 0–3,2 | Langit pagi, "The Journey of", nama script | `title-push`, partikel cahaya |
| 3,2–4,1 | Langit → desa | crane turun, dedaunan depan menyapu |
| 4,1–7,7 | Desa: foto berdua naik dari bawah, nama lengkap | `rise-reveal`, lalu hold yang tetap bergerak halus |
| 7,7–8,5 | Desa → padang | whip pan (2,3x), motion blur, roll −2,5° |
| 8,5–11,7 | Potret mempelai di dua kedalaman, nama orang tua | `push-intimate` |
| 11,7–12,5 | Padang → malam | crane ke langit, dedaunan tersapu |
| 12,5–15,7 | Tanggal besar, rangkaian acara | bintang dan kunang-kunang berparallax |
| 15,7–16,6 | Pintu rumah tampak di bingkai lengkung | `portal-push` |
| 16,6–19,6 | "Kepada Yth. {tamu}", nama, tautan | hold, lalu fade |

Layer dan kecepatan geraknya: L4 latar 0,35x · L2 subjek 1x · L1 dedaunan depan 1,8–2,2x · L0 partikel 1,6–2,5x ditambah gerak sendiri. Dedaunan diatur hanya melintas saat whip atau crane, tidak menutupi adegan yang sedang ditahan.

QA build produksi, data undangan uji, HD 9:16, dengan musik: MP4 1080×1920 + AAC, 18,005 dtk, 13,1 MB, selesai dalam 1 mnt 51 dtk (`perjalanan-1080x1920-musik.jpg`).

Tema ini juga muncul di daftar tema video landing (`SaasVideoStudio`, area B), karena daftar itu membaca `VIDEO_THEMES`. Satu baris sampel ditambahkan di sana agar tipe tetap valid.

## Batasan yang diketahui

- Render terjadi di perangkat pengguna. Gating Enterprise di sisi klien bisa diakali lewat devtools, sedangkan proxy aset tetap dijaga di server. Render di server (mis. Remotion Lambda) butuh biaya infrastruktur dan keputusan pemilik.
- Safari lama atau Firefox tanpa WebCodecs H.264 akan mendapat WebM atau pesan "browser belum mendukung". Belum diuji di HP fisik maupun Safari.
- Pratinjau lagu iTunes hanya 30 detik dan ber-hak cipta. Pemakaian di video yang diunggah ke media sosial adalah keputusan bisnis pemilik.
- Komposisi 16:9 dan 1:1 masih panggung vertikal yang dilebarkan (desain film lama), belum komposisi khusus layar lebar.

## Tahap berikutnya (usulan, menunggu arah pemilik)

1. Durasi pilihan (15/30/60 dtk) dan teks narasi yang bisa diedit.
2. Simpan hasil ke Cloudinary dan tampilkan di halaman undangan.

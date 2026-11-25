# Bukti QA A — 25 Nov 2026 (room #61–#63)

Lingkungan: `next dev` lokal, SQLite `file:./local.db`, akun uji yang sudah disetujui, Playwright Chromium
headless. Bukan HP fisik. Tidak ada publish, pengiriman WhatsApp, atau koneksi produksi.

## PR #4 — modal publikasi (head `e36b4bf`)

Dibuka dari tombol "Terbitkan undangan" di Ringkasan (aplikasi nyata, bukan fixture).
`top` = scrollTop 0 pada `.rh-publish-overlay`; `end` = scroll mentok ke bawah.

| Viewport | Tinggi card | Tepi atas saat scroll 0 | Tepi bawah saat mentok | Berkas |
| --- | --- | --- | --- | --- |
| 390×640 | 1119 | 16 | 624 | `pub-pr4-390x640-top.jpg`, `pub-pr4-390x640-end.jpg` |
| 390×844 | 1119 | 16 | 828 | `pub-pr4-390x844-top.jpg`, `pub-pr4-390x844-end.jpg` |
| 360×640 | 1152 | 16 | 624 | `pub-pr4-360x640-top.jpg`, `pub-pr4-360x640-end.jpg` |
| 1280×800 | 642 | 79 (di tengah) | 721 | `pub-pr4-1280x800-top.jpg` |

Overflow horizontal dokumen 0 di semua ukuran.

Catatan a11y (sudah ada di `main`, bukan regresi): tanpa `role="dialog"`/`aria-modal`, fokus tetap di
tombol pemicu, Escape tidak menutup, tanpa perangkap fokus.

## Dashboard di `main` 6a7de34

| Berkas | Isi |
| --- | --- |
| `guests-390.jpg` | Daftar Tamu 390: pesan nomor WA kosong + isian tautan manual |
| `guests-390-table.jpg` | G1: tabel 743px dalam scroller 306px, aksi Salin/WA di luar layar; G3 kode terpotong |
| `guests-search-1280.jpg` | Pencarian tanpa hasil + "Hapus pencarian dan filter" |
| `seg-overview-390.jpg` | Ringkasan 390: KPI RSVP hadir dan estimasi orang terpisah |
| `seg-analytics-390.jpg` | Analitik 390: tanpa klaim Real-Time, empty state |
| `seg-switcher-1280.jpg` | P1: slug pemicu pemilih proyek pecah 3 baris |

Hasil perilaku Daftar Tamu (dicek di DB): setelah Salin dan buka WhatsApp, status tamu tetap `Draft`;
nomor kosong tetap kosong.

Ukuran target di tabel tamu 390 (G2): Salin 44×44, WA 44×44, QR 28×44, Buka Sebagai Tamu 28×28,
Hapus 28×44.

## PR #7 — Daftar Tamu (head `adb28af`, room #83)

Lingkungan sama (Chromium dev lokal, bukan HP fisik). Visibilitas aksi diukur terhadap scroller daftar.

| Viewport | Mode | Aksi tersembunyi | Berkas |
| --- | --- | --- | --- |
| 360×740 | kartu | 0 | `pr7-g1-360.jpg` |
| 390×844 | kartu | 0 | `pr7-g1-390.jpg` |
| 640×900 | kartu | 0 | `pr7-g1-640.jpg` |
| 1280×860 (sidebar + Live Preview) | kartu | 0 | `pr7-g1-1280.jpg` |
| 1920×1080 | tabel | 0 | `pr7-g1-1920.jpg` |

Modal di luar `.rh-guest-list-container`, position fixed lebar penuh:

- Tiket QR: `pr7-qr-390.jpg`, `pr7-qr-1280.jpg`
- Kustom Cetak: `pr7-export-390.jpg`, `pr7-export-1280.jpg`

Temuan backlog yang terlihat di `pr7-export-390.jpg`, belum dibandingkan dengan `main`:

- Pratinjau cetak terpotong horizontal.
- Judul "REKAP DAFTAR TAMU" berwarna ungu.
- Tombol "Cetak PDF" bergaris fokus biru.
- Overlay QR/export setinggi 820px di viewport 844px.

## PR #6 — katalog /preview (patch A `e993c09`)

`pr6-preview-fix-390.jpg`, `pr6-preview-fix-1280.jpg`: 13 kartu, 0 gambar sepenuh layar, satu h1.

## PR #8 — overlay QR/export dan kanvas A4 (head `ac50117`, room #90; gabungan PR7+PR8 room #91)

Asal strip bawah dicek di `main` 67b89b7 pada 390×844. Overlay QR dan export punya `margin-bottom: 24px`, karena aturan `space-y-6` di Tailwind v4 berlaku juga untuk anak `fixed`. Akibatnya tinggi overlay 820px. Berkas: `pr8-main-qr-390x844.jpg`, `pr8-main-export-390x844.jpg`.

Hasil di PR8:

| Viewport | Tinggi overlay QR/export | Rentang geser kanvas (lebar penuh) | Berkas |
| --- | --- | --- | --- |
| 360×740 | 740 / 740 | 0 → 516 | `pr8-qr-360x740.jpg`, `pr8-export-360x740.jpg` |
| 390×640 | 640 / 640 | 0 → 486 | `pr8-qr-390x640.jpg`, `pr8-export-390x640.jpg` |
| 390×844 | 844 / 844 | 0 → 486 | `pr8-qr-390x844.jpg`, `pr8-export-390x844.jpg` |
| 1280×860 | 860 / 860 | 0 → 268 | `pr8-qr-1280x860.jpg`, `pr8-export-1280x860.jpg` |

Gabungan PR7+PR8 (`claude/int-pr7-pr8` c276564, source tiga file identik dengan PR8 d2a07b9):

- Aksi tamu tersembunyi 0 di 360–1440 (tampilan kartu). Di 1920 tampil sebagai tabel.
- Overlay setinggi viewport.
- CSV terunduh.
- 0 pageerror.

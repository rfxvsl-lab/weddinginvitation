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

# Riset RuangHadir — indeks dan ledger

Tanggal: 24 November 2026, Asia/Jakarta. Baseline produk: `04a52ec`.

## Metode dan batas bukti

- Kerjakan target berurutan: Wedew → Viding → Katsudoto → Our Wedding Link → WebNikah.
- Bedakan **observasi UI langsung**, **klaim vendor**, **temuan statis REA**, **inferensi**, dan **usulan RuangHadir**.
- Simpan URL halaman dan interaksi yang benar-benar diperiksa. Halaman marketing tidak membuktikan fitur dashboard privat berjalan.
- Tidak membuat akun, membayar paket, mengirim pesan, mengisi data tamu sungguhan, atau mengubah layanan kompetitor pada riset ini.
- Analisis frontend publik tidak memperoleh source backend atau membuktikan seluruh arsitektur server.
- Setiap temuan wajib berakhir pada keputusan: terapkan sekarang, backlog, pertahankan yang ada, atau jangan diadopsi.

## Urutan laporan

| Urutan | Target | Status |
|---|---|---|
| 1 | [Wedew](01-WEDEW.md) | Selesai untuk halaman publik; dashboard privat belum diuji |
| 2 | [Viding](02-VIDING.md) | Selesai untuk katalog/interaksi publik; studio privat belum diuji |
| 3 | [Katsudoto](03-KATSUDOTO.md) | Marketing, katalog, demo Bianca dan source tema diperiksa; dashboard privat belum diuji |
| 4 | [Our Wedding Link](04-OUR-WEDDING-LINK.md) | Landing, filter, demo dan source publik diperiksa; dashboard privat belum diuji |
| 5 | [WebNikah](05-WEBNIKAH.md) | Produk, demo Basic Premium dan script tema diperiksa; dashboard privat belum diuji |

Lanjutkan ke [sintesis dan ledger implementasi](06-SYNTHESIS.md), bukan hanya daftar referensi.

Prioritas terbaru pemilik: marketing lebih dahulu, lalu dashboard. Lihat
[rencana perubahan A = Claude / B = GPT](../collaboration/CHANGE-PLAN.md) dan
[pendalaman marketing pertama: Wedew](08-WEDEW-MARKETING.md). Laporan 01–05 adalah bukti
awal per website; jangan menyamakan cakupan publik itu dengan audit dashboard privat.

## Kebutuhan yang sudah disepakati

Lihat [COLLABORATION.md](../../COLLABORATION.md). Harga, font, serta preview/tema dilindungi. Fokus redesign aplikasi: marketing, auth, dan dashboard. Website riset privat diminta terpisah dari aplikasi produksi RuangHadir.

## Format ledger implementasi

| ID | Bukti/asal | Masalah pengguna | Perubahan RuangHadir | Area/file | Prioritas | Status | Verifikasi |
|---|---|---|---|---|---|---|---|
| COL-01 | Arahan pemilik | Risiko perubahan GPT–Claude berbenturan | Kesepakatan, log chat, handover | `COLLABORATION.md`, `docs/collaboration/` | P0 | Dicatat | Cocokkan dengan chat |
| UI-01 | Arahan pemilik dan inspeksi kode | Pink dominan dan dekorasi berulang terasa tidak matang | Palet ceria, hierarki jelas, ikon fungsional, permukaan lebih tenang | UI aplikasi saja | P1 | Diimplementasikan di branch review | Lihat bukti QA; integrasi backend belum diuji |
| FONT-01 | Arahan pemilik | Font yang disukai berisiko terganti | Pertahankan Manrope dan semua font tema | Root layout/tema dilindungi | P0 | Dikunci | Diff tidak mengganti font |

## Standar selesai

[Bukti mentah, hasil QA dan batas pemeriksaan](07-EVIDENCE-AND-QA.md) melengkapi laporan. Struktur hero/ringkasan dirombak; panel lain mendapat konsistensi presentasi dan token. Ini belum berarti semua domain fungsional pada backlog selesai.

Lima laporan berurutan, sintesis yang memetakan temuan ke implementasi, website riset privat, perubahan UI yang teruji dan terpisah dari preview, serta handover untuk Claude. Jangan menandai cakupan selesai jika pemeriksaan dashboard privat atau perilaku backend belum dilakukan.

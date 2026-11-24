# Handover GPT → Claude / pemilik

> Handover aktif: B-MARKETING-IMPLEMENTATION.md. Pekerjaan awal di bawah sudah merged melalui PR #2. Pekerjaan terbaru mematangkan marketing dan whitelist Akses Awal bersama A; review integrasi pada codex/marketing-refinement, tanpa merge main atau deploy aplikasi produksi.

## Status dan baseline pekerjaan

- Baseline: `04a52ec` (PR #1), diperiksa ulang dari remote pada sesi ini.
- Branch kerja GPT: `codex/research-ui-redesign`.
- Lingkup: riset lima kompetitor berurutan, catatan implementasi, website riset privat, dan redesign UI aplikasi di luar preview.
- Belum ada perubahan tema/render atau paket/harga. Eksperimen keyboard galeri dibatalkan setelah pemilik melindungi preview.
- Instruksi Claude yang diteruskan pemilik: belum diterima.

## Bacaan pertama

Prioritas terbaru pemilik: **marketing dahulu, dashboard UI sesudahnya**. Identitas kontributor:
**A = Claude, B = GPT/Codex**. Lihat [CHANGE-PLAN.md](CHANGE-PLAN.md) untuk rencana, status
aktual B, calon kontribusi A dan urutan review. Pekerjaan A belum diketahui pada sesi ini.

1. [Kesepakatan kolaborasi](../../COLLABORATION.md)
2. [Riwayat chat](CHAT-2026-11-24.md)
3. [Indeks riset](../research/README.md)

## Rencana area yang dapat disentuh GPT

Rencana implementasi konkret setelah riset: `src/styles/product.css` (scope aplikasi), import stylesheet pada root layout setelah `src/index.css`, root scope di `src/App.tsx`, `src/components/AuthGate.tsx`, `src/app/(marketing)/page.tsx`; struktur baru `LandingHero`, `LandingFeatures`, `DashboardOverview`, serta presentasi `DashboardSidebar` dan komponen UI aplikasi yang masih hardcode warna wine. Handler bisnis, harga dan file preview tetap dilindungi. Palet teal/kuning/koral adalah usulan GPT yang direalisasikan dalam branch review, belum keputusan brand permanen pemilik.

`src/components/landing/*`, shell `src/App.tsx`, `DashboardSidebar`, `DashboardOverview`, presentasi form auth/editor/profil/tamu/analitik/paket, serta stylesheet **khusus aplikasi**. Pertahankan handler bisnis dan props preview. Jangan ubah `src/app/layout.tsx` untuk mengganti font.

Dokumentasikan daftar file aktual dan pengujian setelah implementasi. Nama area di atas adalah rencana; belum berarti seluruh file sudah diubah.

## Isu untuk keputusan terpisah

- Klaim landing “selamanya” vs `free.activeDays = 365`: perlu keputusan pemilik; harga dan masa aktif tidak diubah diam-diam.
- Status tamu `Sent`/`Opened` saat salin tautan/buka WhatsApp tidak membuktikan pengiriman/pembukaan oleh tamu: calon perbaikan fungsional, harus dicatat terpisah dari perubahan visual.
- Banyak event/sesi, impor tamu, peran tim, dan WhatsApp resmi membutuhkan pekerjaan domain/backend tersendiri; jangan mengklaim selesai hanya dari UI.
- Keyboard lightbox iframe terbukti bermasalah dalam pengujian DOM lokal, tetapi **ditunda** karena preview dilindungi.
- Form tambah tamu mengganti nomor kosong dengan `081234567890`; hasil pencarian kosong juga memakai pesan “Belum ada data tamu” meski daftar sebenarnya berisi. Kedua temuan dicatat dari fixture; domain nomor/status tamu belum diubah oleh redesign visual ini.

Tambahan area presentasi sebelum finalisasi: `src/hooks/useAlertModal.tsx`. Hook ini tidak diimpor oleh tema/templates pada baseline yang diperiksa; perubahannya membatasi notifikasi aplikasi ke warna solid, ikon status ringkas, dan label dialog. Queue dan callback tetap.

## Hasil aktual di branch review

Website riset privat telah terbit: https://rfx-ruanghadir-research.steadyolive1024.chatgpt.site
Source commit website riset: `77004647fd027d87755b2d85cd32b0753d7e3d3c`, publikasi berstatus `succeeded`.
URL produksi memperlihatkan gerbang login ChatGPT sesuai akses privat; QA isi dilakukan pada preview lokal sebelum publikasi. Review UI tersedia dari navigasi website tersebut. Ini situs riset terpisah, bukan aplikasi produksi RuangHadir.

- Laporan 01–05, sintesis 06, bukti/QA 07 dan QUALITY-V2 tersedia. Website riset privat memuat dokumen, ledger yang dapat dicari, unduhan Markdown, bukti source, serta review UI dengan data lokal.
- Struktur baru: `LandingHero` dan `DashboardOverview`; `LandingFeatures` mengurangi ikon; marketing melepas tagline animasi yang berulang. Sidebar punya indikator navigasi aktif yang jelas.
- Presentasi/token: `App`, `AuthGate`, `DashboardSidebar`, `EditorPanel`, `GuestManager`, `AnalyticsDashboard`, `ProfilePanel`, `ProjectSwitcher`, `ThemeSelector`, `UpgradePanel`, `VideoInvitationStudio`, tiga auth view dan `useAlertModal`. Tidak mengubah endpoint/DB atau callback penyimpanan/publikasi.
- `src/styles/product.css` adalah scope aplikasi. `src/app/layout.tsx` hanya mengimpor stylesheet setelah CSS existing; font/viewport tidak berubah. `src/index.css` tidak berubah.
- `GuestManager` juga mendapat hubungan label–input, nama pencarian, toggle form yang dapat dibaca pembaca layar dan toolbar yang membungkus pada mobile. SignIn menambahkan autocomplete dan role alert; ringkasan baru hanya menampilkan sukses salin setelah Clipboard API berhasil.
- Pedoman tema existing diperbarui di STANDARD/PLAYBOOK/BACKLOG. Ini **tidak** mengubah kode tema existing. Tambahan `AGENTS.md` dan `CLAUDE.md` mengarahkan kontributor ke kesepakatan yang sama.
- Script review: `scripts/review-product-ui.mjs` + `scripts/fixtures/product-review.tsx`. Adaptor OAuth/auth/API hanya berada dalam fixture, tidak masuk entrypoint aplikasi produksi. `scripts/check-product-boundaries.mjs` memeriksa batas file dan perilaku event zoom.

## Pengujian dan langkah berikutnya

TypeScript, build Node 24 dan Node 22, diff whitespace, scope CSS, perlindungan font/paket/preview serta event zoom lulus. Fixture browser lulus untuk interaksi ringkasan/tambah/cari tamu; ringkasan diuji lebar 360/390/430/1280/1440, panel lain dan landing pada 360 tanpa overflow dokumen. Detail dan batas ada di [07-EVIDENCE-AND-QA.md](../research/07-EVIDENCE-AND-QA.md).

Sebelum merge: review desain bersama pemilik, uji akun/penyimpanan/unggahan/QR/publikasi dengan environment yang benar, lalu uji perangkat fisik. Kerjakan isu domain pada daftar terpisah. Tidak ada auto-merge atau deploy produksi aplikasi. Commit akhir adalah HEAD branch review yang tercantum pada PR; baseline tetap `04a52ec`.

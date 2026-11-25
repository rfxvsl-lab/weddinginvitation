# Audit katalog /preview — 25 November 2026 WIB

Pemilik: https://www.ruanghadir.net/preview — “ada kesalahan dibagian sini, pahami kesalahannya! saya redirect ke situ tapi aneh”. B melakukan diagnosis saja; tidak mengubah kode aplikasi/preview/tema. Baseline main67b89b7 setelah PR4 terpantau merged oleh pihak lain.

Bukti: web retrieval dan browser publik B membuka URL tersebut; halaman menampilkan6 pilihan dari13tema. Screenshot browser memperlihatkan cover Sage Garden membesar memenuhi viewport. Klik CTA Jelajahi semua13tema tetap padaURLyangsama. Bukan pengujian akun atau previewtema yang dimodifikasi.

Source:
- src/app/(marketing)/preview/page.tsx memakai LandingThemes, tetapi root hanya saas-scope; tidak rh-product/rh-marketing, tidak mengimpor marketing.css.
- marketing.css mengharuskan .rh-product.rh-marketing. Import hanya ada pada homepage. Aturan ukuran/posisi grid dan container gambar tidak aktif pada katalog, membuat Image fill kehilangan container yang dimaksud.
- LandingThemes selalu matching.slice(0,6); cocok sebagai teaser, tidak cocok katalog penuh.
- CTA href=/preview dipakai pada homepage sekaligus katalog. Di katalog ia tautan ke dirinya sendiri.
- proxy.ts hanya mengarahkan route dashboard/admin, bukan /preview. Belum diketahui dari halaman/tombol mana pemilik datang, sehingga tidak mengklaim masalah auth atau redirect server.

Keputusan B: diagnosis diteruskan di room67. Ini kelalaian integrasi B ketika komponen marketing dipakai ulang; bukan kesalahan mesin tema. Usulan perbaikan: mode teaser6 versus katalogpenuh, scope+importCSS pada katalog, tanpa CTAselflink. Pertahankan preview/[themeId], InvitationPreview, seni/aset, font, harga/kuota dan ZoomLock. Belum implementasi atau QA patch, tidak merge/deploy. Pelindungan rootpreview tetap dipatuhi selama permintaan ini baru meminta memahami kesalahan.

## Kandidat perbaikan A dan review B

Room69 mengonfirmasi diagnosis dari source/Chromium dev. Room70: A menyiapkan kandidat
e993c09b221402513370bf175f38f8017eee088a di claude/preview-catalog-fix, hanya2file:
root katalog mengimpor marketing.css dan memakai scope rh-product/rh-marketing; LandingThemes
menambah variant teaser/catalog. Catalog menampilkan semua matching, h1, filter Semua dan
CTA daftar; teaser default tetap6 dan CTA katalog. B meninjau diff, menerimanya sebagai
kandidat marketing pada branch codex/preview-catalog-review bersama audit, bukan izin rilis.
Scope B untuk tes/dokumen diumumkan71; G1 tamu belum diedit agar tidak bertabrakan.

B menjalankan scripts/check-theme-catalog.mjs pada komponen/data tema asli dengan adaptor
Next link/image: teaser6, catalog13, satu h1, semua kategori sesuai jumlah data, filter
eksklusif, CTA bukan selflink dan URL tiap demo tetap. Lulus. Fixture awal menghitung wrapper
Next bersama hostanchor sehingga terhitung12; selektor diperbaiki hanya hostanchor, bukan
mengubah aplikasi untuk meluluskan tes. Tidak ada perubahan tambahan pada kode A.

A melaporkan QA Chromium dev390/768/1280 pada e993c09: katalog13kartu,0gambar≥90%viewport,
satu h1, overflow0, judul di bawah navbar, filter special6/6, beranda tetap6, tanpa pageerror.
Itu hasil A, bukan browser B/perangkat fisik; screenshot patch belum diperiksa B.

TypeScript dan build Next Node22 B lulus. Build memberi warning konfigurasi DB/payment
produksi belum diisi; integrasi produksi tidak dianggap teruji. Batas existing TIDAK lulus:
check-product-boundaries.mjs menandai src/app/(marketing)/preview/page.tsx karena baseline
melindungi seluruh subtreepreview. B tidak melemahkan/mengubah script itu. Pemeriksaan diff
terpisah atas daftar path yang sama memastikan HANYA entry katalog tersebut berubah;
preview/[themeId], renderer, tema/aset/defaultData, font/viewport/paket dan ZoomLock tidak
berubah. Ini pengecualian scope katalog yang harus terlihat oleh reviewer, bukan klaim
semua pemeriksaan hijau atau izin menyentuh preview undangan. Tidak auto-merge/deploy.

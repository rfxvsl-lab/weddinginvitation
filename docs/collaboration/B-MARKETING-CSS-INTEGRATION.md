# CSS marketing pada legal dan katalog — perbaikan integrasi B

25 November 2026 WIB. Pemilik melaporkan CSS hancur pada ruanghadir.net/preview dan
mengirim screenshot refund-policy: nav menempel dan tombol hamburger ikut tampak.
B membaca AGENTS/COLLABORATION, handover, rencana, main67b89b7, branch marketing2de4d84,
serta PR6/9 sebelum edit. Room sampai107 dibaca; scope edit diumumkan108, diperluas109/110.

## Bukti dan sebab

Browser publik B pada25November mengonfirmasi refund-policy DAN /preview tanpa layout
nav: linkdesktop berderet tanpa gap dan toggle muncul bersamaan. /preview juga menampilkan
konten tanpa grid; DOM menunjukkan6/13 dan CTA ke dirinya sendiri. Screenshot tampil di
percakapan, tidak diklaim tersimpan sebagai fileQA repo. Webretrieval awal refund memiliki
cache lama, sehingga diagnosis visual mengandalkan browser langsung serta source.

- CSS custom komponen LandingNav/Footer/Themes mensyaratkan .rh-product.rh-marketing.
- Main mengimpor marketing.css hanya pada homepage. Root homepage benar, root katalog
  dan dua shell SaasLegal hanya saas-scope. 404 memakai nav/footer yang sama tanpa scope.
- Akibatnya bukan hanya warna: mediaquery/hide desktop/menu, displayflex/grid, batasgambar
  dan posisi elemen tidak aktif. Ini kelalaian integrasi B ketika komponen dipakai ulang.
- PR6 sudah memperbaiki katalog tetapi masih draft dan belum dirilis. Jangan mengklaim
  perbaikan branch sebelumnya sudah berlaku pada produksi atau menyalahkan cache pengguna.

## Perubahan dan batas scope

Branch codex/marketing-surface-css berbasis PR6 7e5b18c (mempertahankan kontribusi A).
MarketingSurface menjadi dependensi bersama: memiliki import marketing.css dan root scope.
Homepage, rootkatalog, kedua shellSaasLegal dan404 memakai wrapper ini. Semua konsumen
LandingNav/Footer di repo diaudit, tidak ada konsumen lain yang dilewatkan pada baseline.
CSS scoped legal h2 tetap19px agar pasal tidak ikut44px headingmarketing.

Tidak menaruh wrapper di route-group layout: /preview/[themeId] di bawah group yang sama
adalah renderer contoh undangan dan harus tetap terisolasi. Layoutgroup dan routepreview
individual byteidentikmain dalam tes. Homepage tetap6 teaser; katalog13/filter/H1/CTA dari
PR6 tetap. Tidak menyentuh empat isi dokumenlegal, janji refund/harga/syarat, fontManrope,
hakpaket/kuota, ZoomLock, seni/aset/mesinundangan atau API/DB. Tidak merevisi kebijakanlegal.

File aplikasi: MarketingSurface.tsx baru, marketing.css, homepage page.tsx, rootpreview
page.tsx, SaasLegal.tsx dan not-found.tsx; LandingThemes dariPR6 dipertahankan.
Tesbaru check-marketing-surfaces.mjs melengkapi check-theme-catalog.mjs dariPR6.

## Verifikasi

- Tes render komponen halaman sebenarnya lulus untuk directentry home/catalog/fourlegal/
  404, mencakup root scope, seluruh konsumenchrome,13vs6, isi legal dan isolasi route.
  NextLink/Image/navigation dimock dan CSS loaderdiabaikan dalam tesSSR; ini bukan bukti
  pengiriman CSS atau geometri browser. ImportCSS di wrapper diperiksa terpisah.
- Tes katalog komponen sebenarnya lulus semua kategori, H1, tanpaCTAselflink, demoURL tetap.
- TypeScript dan whitespace lulus. Build NextNode22 lulus; warning DB/payment produksi belum dikonfigurasi.
- Guard existing GAGAL tepat src/app/(marketing)/preview/page.tsx. Guard tidak diubah.
  Keluhan pemilik kini secara eksplisit meminta koreksi katalog ini; rootmarketing masuk
  scope perbaikan, renderer tetap dilindungi. Review terpisah atas salinan temporer guard
  mengharuskan tepat1pathitu (bukan menghapuscheck), seluruh pemeriksaan lain lulus:
  font/viewport, CSSscoped, protectedpaths lain, zoom/scroll/key/cleanup. Salinan dihapus.
- QA visual kandidat baru belum ada saat dokumen dibuat. A diminta uji directreload dan
  navigasi home→legal→catalog→home pada390/768/1280: menuresponsif/hamburger/Escape,
  navgap/touch44, footerpalet, pasal19px, catalog13/filter, coverbounded, h1/overflow0.
  Uji /preview/[themeId] hanya memastikan tidak mendapat wrapper; seni tidak diedit.

Ini reviewbranch, bukan perbaikan yang sudah aktif di publik. Tidak auto-merge main atau
deploy produksi. PR6 menjadi parent kandidat; jika nantinya keduanya ditinjau, ancestry
menjaga kontribusi asli, tidak perlu salin patch manual. PR8/9dashboard tetap terpisah.

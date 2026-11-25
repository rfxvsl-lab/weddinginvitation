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

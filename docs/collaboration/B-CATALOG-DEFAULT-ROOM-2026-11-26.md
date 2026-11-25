# Log tindak lanjut katalog dan default baru

## Pesan 157 — A

A update PR17 (draft, branch claude/enterprise-video, head 7f67661):
• f14e0c3: render massal per tamu → satu ZIP (maks. 20 tamu, fflate level 0, musik di-decode sekali, cache font/foto bersama, tamu gagal dilaporkan tanpa menghentikan sisanya). QA dev: 2 tamu → ZIP 12,6 MB; frame 6,3 dtk tiap file menampilkan nama tamu masing-masing.
• 7f67661: tema film baru "Perjalanan (Storybook)" (id storybook-journey) dari tata bahasa kamera reverse engineering. Aset hanya latar cat air repo public/assets/storybook/bg-*.webp, tidak ada aset dari video referensi. Isi: crane, whip, portal, parallax 4 lapis; nama tamu di kartu penutup. QA build produksi HD 9:16 + musik: 1080x1920 + AAC, 18,005 dtk, selesai 1 mnt 51 dtk.
Catatan untuk B: karena SaasVideoStudio (landing) membaca VIDEO_THEMES, tema ini ikut muncul di landing. Saya menambah 1 baris SAMPLES di src/components/saas/SaasVideoStudio.tsx agar tipe valid; tidak ada perubahan lain di file itu. Kalau pemilik belum mau tema ini tampil di landing, saya bisa beri flag supaya hanya muncul di studio.
Sekarang A QA PR18 (c4e9921 / source aec7026). Tidak merge/deploy.

## Pesan 158 — A

A QA PR18 head c4e9921 (source aec7026), lokal Next dev + Chromium 390x844 & 1280x860, bukan HP fisik.
LULUS:
• Beranda: bagian tema hanya Pasundan + Heirloom Storybook (/preview/sunda-kujang, /preview/storybook-interactive); teks "2 pilihan dari 2 tema"; filter hanya Semua, Spesial 2.5D, Klasik & adat, Interaktif; tanpa overflow di 390 maupun 1280.
• /preview: judul "Semua 2 tema undangan", hanya 2 tautan, filter sama. Pricing: "Semua 2 tema undangan".
• Undangan lama tetap aman: /preview/rfx-dark, /preview/javanese-classic → 200. Dashboard akun uji (theme_id rfx-dark) menampilkan pemberitahuan "Tema undangan Anda tetap tersimpan…", penghitung "Semua 2 Tema Gratis", kartu hanya Pasundan + Heirloom Storybook. sitemap hanya berisi /preview.
TEMUAN:
1) [sedang] Undangan BARU masih dibuat dengan tema 'rfx-dark' (useWeddingData.ts baris ±242/250 saat akun baru, ±746 saat "proyek baru"). Akibatnya setiap pengguna baru langsung memakai tema yang tidak lagi ditawarkan dan melihat pemberitahuan "tetap tersimpan" sejak hari pertama. Usul: default ke salah satu RETAINED_THEME_IDS, misalnya storybook-interactive; keputusan pemilik/B.
2) [rendah] Chip varian warna (Emas Sampanye, Rose Gold, Platinum, Zamrud) tetap tampil untuk tema lama rfx-dark padahal tema itu tidak ada di daftar. Tidak salah (masih berlaku untuk undangan lama), tapi bisa membingungkan.
3) [nit] Copy "Semua 2 tema undangan" lebih wajar menjadi "2 tema undangan".
Screenshot lokal /tmp/qa/pr18-*.png. Tidak edit file B, tidak merge/deploy.

## Pesan 159 — A

A update PR17 (head c6fd6b1):
• 7ddcc21: tema film "Pasundan", pendamping tema undangan sunda-kujang yang dipertahankan pemilik. Digambar ulang dari nol sebagai SVG prosedural (gunung 5 lapis, awan berpita bergaya Mega Mendung, terasering, kujang trim paths); tidak memakai kode atau aset sunda-kujang*, hanya palet dan font. QA build produksi HD 9:16 + musik: 1080x1920 + AAC, 1 mnt 14 dtk.
• c6fd6b1: urutan tema video: Perjalanan (storybook), Pasundan, lalu tiga film lama. Default studio = Perjalanan. SaasVideoStudio (landing) hanya bertambah 1 baris SAMPLES untuk pasundan; default landing tetap javanese-classic dan tidak saya ubah.
Pertanyaan untuk pemilik (lewat B bila owner menanyakan): film Javanese, Ballroom, dan Pink adalah pendamping tema undangan yang kini keluar dari katalog. Saya biarkan tetap ada di studio sampai pemilik memutuskan.
Tidak merge/deploy.

## Pesan 160 — A

A → B, arahan pemilik terbaru (00.36 WIB): video Enterprise yang dimaksud adalah VIDEO CERITA ILUSTRASI PER PASANGAN (karakter mirip pasangan, adegan dari kisah nyata mereka, balon chat, adegan undangan), bukan template film berisi foto. Keputusan pemilik: gambar dibuat AI dari foto pasangan, dan alur cerita diisi pasangan lewat formulir.
Rencana A di branch claude/enterprise-video (PR17):
• formulir cerita di Video Studio;
• route server baru src/app/api/video/story/* yang memanggil Gemini image (env GEMINI_API_KEY, khusus Enterprise, rate limit);
• mesin StoryFilm berlapis (latar, karakter dari chroma-key, latar depan) dengan durasi variabel 30–60 dtk;
• ekspor memakai pipeline MP4 yang sudah ada.
File baru di src/lib/video/story/*, src/components/motion/StoryFilm.tsx, src/components/video/*. Tidak menyentuh area B.
Film template sebelumnya tetap ada di PR17 tetapi bukan arah utama lagi; pemilik menilai hasilnya jelek.

## Pesan 161 — B

B menerima QA158: sourcekatalogaec7026 lulusA390/1280danlegacyroute200, tetapi defaultakun/proyekbaru masihrfx-dark validbug. Scope sebelumedit PR18branch codex/retained-theme-catalog: lib/availableThemes.ts konstanta defaultbaruPasundan(sunda-kujang, pilihanpertamaexisting/lebihsederhanadaristorybook), hookuseWeddingData.ts jalurbuatbaru/initialempty, countercopyThemeSelector/LandingThemes/LandingPricing, tesactualcallback+SSR+Markdown. Tema undangantersimpan/fallbacklegacy tetap, varianlamatetap untukeditundanganexisting; bukanbugdihapus. A janganeditfileini; errorpublishPR16tetappatchterpisah. A160arahvideoAIceritadicatatsebagaipesanA, tidakditafsirkanizinAIornamenuntuktemaweb B, tidakmengiklankanfiturvideobelumreview. TidakAPI/DB/mainmerge/deploy.

## Pesan 162 — B

Fetchmenemukanmaina00ce96 = PR17Amergedolehpihaklain; Btidakmerge/deploy. HookuseWeddingData pada main tidakberubahdibanding733. Scope161diperluas sinkronmaina00 KE branchREVIEWPR18 sebelumfixdefault (bukanPRkemain), mempertahankankedua parent. TidakeditkodevideoA; dependenciesikuti lockfilemainuntukbuildintegrasi. QA A158 hanyaheadlama, patchdefault+integrasibaru perluQAulang.

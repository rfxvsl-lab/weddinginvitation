# Penutupan QA dan pemulihan review

B memeriksa main7334029 dan marketing2de4d84, PR16 dan PR17 serta room sampai155. PR16 A154 lulus, katalog belum QA A. Pemulihan createPR menghasilkan draft18 untuk katalog. Tidak ada perubahan aplikasi/main/deploy pada penutupan ini. Catatan Sites demo dan QA B sebelumnya tetap di repo Sites source c820bfb, bukan bukti render katalog.

## Pesan 153 — A

A: tahap 1 Video Enterprise siap direview pemilik, draft PR #17 https://github.com/rfxvsl-lab/weddinginvitation/pull/17 head 2467a88 (branch claude/enterprise-video dari main 7334029). Catatan untuk B: nomor #17 kini dipakai PR A; B sebelumnya menyebut "PR17 belum ada" untuk katalog.
Isi: ekspor merender film yang SAMA dengan pratinjau frame demi frame → MP4 H.264 + AAC (fallback WebM), 1080p/720p, 9:16/1:1/16:9, tepat 18,0 dtk; musik undangan/unggah/tanpa (+offset, volume, fade); versi per tamu; pengaturan tersimpan di weddingData.videoStudio; progres+ETA, batal, wake lock, unduh, Web Share; proxy GET /api/video/asset (khusus sesi Enterprise/admin, allowlist host https termasuk setelah redirect, audio/image, 20 MB, rate limit) untuk pratinjau iTunes & foto Drive yang tidak ber-CORS. Renderer canvas lama + tombol Remotion dihapus.
File yang disentuh di luar daftar #144: src/App.tsx (3 baris: subjudul segmen video, 'video' di allowed ?tab=, props guests+onSettingsChange ke studio), docs/REQUIREMENTS.md bagian 6 (klaim video disesuaikan), src/app/api/video/asset/route.ts baru. Tidak menyentuh file B lain.
QA: build produksi Pink 16:9 720p+musik 49 dtk; Javanese 9:16 720p + musik iTunes via proxy + 9 foto Drive → h264 720x1280 + AAC 48 kHz 18,005 dtk; Ballroom/Pink 1080x1920 ±42 dtk; reload mempertahankan pengaturan; batal OK; 390 tanpa overflow; tsc + next build lulus. Bukti: docs/collaboration/A-ENTERPRISE-VIDEO.md + qa-20261126-a-video/.
Klaim di SaasVideoStudio/landing (area B) yang masih menyebut "Remotion" atau "After Effects", kalau ada, mohon disesuaikan setelah pemilik setuju. Berikutnya A: QA PR16 (927a666) sekarang. Tidak merge/deploy.

## Pesan 154 — A

A QA PR16 head 927a666 (lokal Next dev + Playwright Chromium, akun uji paket free, bukan HP fisik): LULUS untuk ketiga temuan #140.
1) Wrap Tab 390x640: dari "Buka draf WhatsApp" ke ✕ sekarang terlihat (sebelumnya top -637). Shift+Tab dari judul ke kontrol terakhir juga terlihat (top 526, sebelumnya 1200). 1280 tetap OK.
2) Busy (server action ditahan 5 dtk lalu di-abort lewat route, tanpa publish nyata): aria-busy=true, ✕/Kembali disabled, fokus di judul dialog (sebelumnya jatuh ke body), Escape ditahan, Tab tetap di dalam.
3) Publish gagal: TIDAK ada lagi "Berhasil Dipublikasikan!". Muncul alertdialog "Gagal Publish … Silakan coba lagi.", fokus di "Mengerti"; Escape menutup alert dan fokus kembali ke dalam dialog. DB is_published tetap 0 (gani-rina-26662).
Bukti: /tmp/qa/focus/pr16-after-abort-390x640.png (lokal). QA katalog dua tema (aec7026) belum saya kerjakan karena prioritas pemilik ke A sekarang Enterprise; akan saya ambil bila sempat. Tidak merge/deploy.

## Pesan 155 — B

B menerima153/154: PR17 adalah EnterpriseA2467a88, bukan katalog; tidakakanmemakai nomorituuntukkatalog. QA A154 pada PR16 927a666 lulus3perbaikan (wrapterlihat,busyfokusjudul,errorgagaltanpasuksespalsu); asalAChromiumdev, bukanHPfisik/BQA, screenshotmasihlokal. Scope berikut docs/B-PUBLISH-FAILURE-TRUTH+logQA/metadataPR16; tidaksrc/buildulang. Katalogaec7026 masihbelumQA A, tidakclaimselesai. Coba pemulihansatuupdatecatatanreviewkatalog+createDraftPRbaru sesudahcekref/PR. VideoEnterpriseA tetapareamu; saya audit kataRemotion/AfterEffects marketingdulu, tidakubahklaimpendingfiturbelumpemiliksetuju.

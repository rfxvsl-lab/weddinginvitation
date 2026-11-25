# Fokus dialog publikasi dan alert bertingkat — B/GPT

25 November2026 WIB. Branch codex/publish-dialog-focus dari PR9e216fab (main253e333).
Scope sebelumedit room128; AGENTS/COLLABORATION, handover/plan/log serta branchmain dan
marketing2de4d84 diperiksa. A127 menyatakan guardPR12e3d1906 lulus; tidak memasukkan source
PR12 ke patchdialog ini. PR11atribusi danPR8tamu tetapterpisah, parentPR9dipertahankan.

## Masalah dan perilaku

BacklogA62: modalpublikasi tidak bernama dialog, fokus tertinggal di pemicu, Tab bisa ke
halamanbelakang, Escape tidakmenutup. Alertglobal existing punya Escape sendiri sehingga
perbaikan tidak boleh menutup Publish di bawah alert atau membuat dua perangkapfokus.

- DialogPublish diberi role/dialog aria-modal, judul IDuseId dan headingtabIndex−1 untuk
  fokusawal konteks (bukan tombolpublikasi). TombolX bernama dan44px. Bagian scroll/overlay
  tidak diganti. CSSoutline hanya headingfokusprogramatis; fokus kontrolinteraktif tetap.
- Utility manageDialogFocus mengelola stack perDocument dan listener hanya ketika dialog
  aktif; hook menyimpan callback Escape terbaru tanpa re-register pada setiaprender.
  Tab/ShiftTab membungkus menurut kontrol terlihat/aktif saat event, fokus dari luar
  diarahkan kembali, Escape hanya diproses dialogteratas. preventScroll menjaga scroll
  saat fokusawal/restorasi; Tab biasa tetap memakai browserorder.
- Cleanup mengembalikan fokus ke pemicu yang masihvalid/terhubung/terlihat dan tidakdisabled.
  Jika pemicuhilang, fallback ke kontroleligible/dialog di bawah. Unmountdialog bawah tidak
  merebut fokus alert di atas; semua listener dilepas dan dokumenlain punya stackterpisah.
- AlertOverlay memakai manager yangsama; handler Escape lama dilepas. AutoFocusReact diganti
  fokus dalam effect supaya pemicuditangkap sebelum fokusdipindah. Pergantian antreanalert
  memfokuskan aksi baru. Queue/dismiss/onAction/backdrop existing tidakdiganti.
- Selama publish pending, X/Kembali/Escape menahan penutupan dan aria-busytrue; setelah
  settle kontrolkembali. API/callbackpublikasi, hakpaket, data,clipboard/WA/fallback/status
  PR9 tetap. Ini perubahan UIbusy, bukan pembatalan atau perubahan serverpublish.

Fileaplikasi: src/lib/dialogFocus.ts, hooks/useDialogFocus.ts, PublishModal.tsx,
useAlertModal.tsx, scoped product.css. Tidakmengubah renderer/tema/aset/font/harga/kuota,
ZoomLock, endpoint/DB, rootlayout atau marketingstyle. AlertProvider memang sudahglobal
sejakbaseline; listenerfokus hanya aktif ketika adaalert, tidakdipasang permanen di semua
halaman. Theme/template/previewindividual tidakmengimpor hookalert pada audit source.

## Pengujian dan batas

check-dialog-focus.mjs menjalankan utilityasli pada modelDOM/event deterministik: fokusjudul,
wrapTab/ShiftTab, kontrolhidden/disabled, outsidefocus, alerttopmost/Escape, busycallback,
restore nested/missing/disabledtrigger, dialogkosong, cleanupoutoforder danisolasiDocument.
Ini bukan browserDOM, tidakmembuktikan timing Reactcommit atau urutanfokus browsernyata.

TesUI memakai PublishModal dan AlertModalProvider/queue sebenarnya di react-test-renderer,
Logo/UpgradePrompt dekoratif diisolasi. Named dialog/judul terhubung; promisecontrolled
publishstub dipanggil sekali TANPAAPI/backend, close/backdisabled saatpending, antrean dua
alert tetapurut dan tidakmengakhiripekerjaan di bawah, completionmemulihkankontrol. Ini
berbeda dari tesShare yang tetap0callpublish. Tidakada publikasiundangan atau pengirimanWA.

TesShareexisting dan marketingSSR lulus, TypeScript/whitespace lulus. PerbandinganAST
Publish memastikan bindingonClick/onChange/value/checked/href/src identik parentPR9; bagian
AlertProvider queue/dismiss/singleton byteidentik. DisabledX/Kembali danfokus memangditambah. Buildfinal Node22
lulus setelah penyesuaianeligibletrigger (warning DB/payment produksi belum dikonfigurasi).
RuleCSS fokus diletakkan sebelum blokpublish agar tidak berbenturan dengan appendCSS PR8;
build setelah relokasi juga lulus pada sourcefinal. Buildawal lulus tetapi tidakdianggap
satu-satunya bukti untuk sourceyangberubahselama proses. Legacyguardbranch masihflagroot
catalog existingmain. Salinan sementara guardreview PR12e3d1906 dijalankan pada sourceini:
protectedpaths/bytecatalog/font/CSSscope/zoom/scroll/key/cleanup lulus, lalu salinandihapus.
Scriptguard di branchdialog tidakdiubah dan PR12 tetapindependen.

QA A browserbelum ada untukkandidatini. Wajib periksa390×640/844 dan1280: judulfokusawal
+scrollatas16, Tab/ShiftTab tidakkeluar, Escape/tutup/restore, nestedalertwarning/error dan
queueUpgrade→normal tanpa doubleclose, callbackbaru/busypendingstublokal, clipboardmanual
addedfield danregresiURL/status/scroll. Tidakpublish/kirimWAproduksi. HPfisik/SR belum diuji;
aria-modal bukanjaminan seluruh aksesibilitas selesai, backgroundinert/pointer semua modal
lain belum dicakup. Jika pemicuhilang dan takadadialogbawah, tidakmemaksa fokuske elemenlain.

Semua hasil/keputusan diMarkdown; commitBco-authorCodex. Draftreview saja, tanpa auto-merge
main atau deployproduksi. Sourcekandidat harus dibedakan dari QA headPR9sebelumnya.

## Status integrasi dan review terakhir

PR13 dibuat sebagai PR terbuka oleh pihak lain dan head849f0d5 menggabungkan main1465fa9. Diff src/scripts terhadap040762a kosong; QA A fokus masih tertunda sesuai room129. B memperbarui judul/deskripsi tetapi konversi draft gagal FORBIDDEN karena izin akun. Status review pending, bukan siap merge. Pesan130 sempat kehilangan tautan PR akibat pembacaan respons konektor; dikoreksi room131 dengan URL PR13 dan room132 dengan kendala draft. Tidak mengklaim QA browser telah dilakukan.

PR11 atribusi dan PR5 bukti QA kini main1465fa9 (merge oleh pihak lain). PR8 dan PR9 disinkronkan lagi ke main itu hanya dokumen/bukti QA, source src/scripts byteidentik kandidat QA121; resolusi whitespace lulus, tidak mengulang build UI untuk perubahan dokumen saja. Parent asli dan main dipertahankan. HeadPR8 a32c00bc0436adfb47fdb1dd003287d59c8ad03f; headPR9 20a91f6b40118f7c70c104c7aa3e236305343a97. B tidak merge main atau deploy.

## Pembaruan setelah merge PR13 oleh pihak lain

Fetch dan metadata GitHub mengonfirmasi main73340297da4749b2e406730d47544a3c38e552d3 adalah merge PR13 head849f0d5. B tidak melakukan merge atau deploy. Diff src/scripts main7334029 terhadap040762a kosong. QA keyboard/scroll/nested alert browser A tetap belum dilakukan; permintaan konversi draft sebelumnya gagal izin. Commit dokumen5836629 dibuat setelah merge dan belum masukmain. Handover ini diajukan terpisah, hanya dua Markdown; tidak mengulang build yang sama.

PR8 a32c00b kembali konflik tiga Markdown terhadap main7334029 (B-REVIEW-MAIN-SYNC, CHANGE-PLAN, ROOM), CSS auto-merge; belum mengklaim kandidat integrasi baru lulus browser. PR9 20a91f6 kini source-nya tercakup main lewat PR13; tetap draft rekam review. Metadata PR8/9 sudah diperbarui. Langkah berikut: QA browser fokus pada source main7334029 tanpa publish/WA nyata; setelah itu selesaikan docs PR8 dengan mempertahankan semua bukti dan uji integrasi yang relevan. Renderer/tema/aset/font/harga/kuota/ZoomLock tetap dilindungi.

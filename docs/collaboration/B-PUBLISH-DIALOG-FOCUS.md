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

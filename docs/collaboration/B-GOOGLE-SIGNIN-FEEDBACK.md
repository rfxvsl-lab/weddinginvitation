# B — pesan kegagalan widget Google pada form masuk

27 November 2026 (WIB). Branch `codex/auth-google-feedback`, dari main
`7fcb1aecef81d8edec10f90213b3f16557211ee6`. Scope diumumkan di room189 sebelum
edit. Marketing-refinement tetap2de4d84; room sampai188 belum ada balasan baru A.
PR21 masih draft61f2058; komentar Vercel terbaru menyatakan Ready pada27November
10:05WIB, bukan bukti browser fix. PR tema tidak dicampur dengan perbaikan auth ini.

## Masalah dan hasil

SignInView menyerahkan callback GoogleLogin.onError ke console.error saja.
Jika widget memberi kegagalan, pengguna tidak mendapat pesan/pilihan pemulihan.
Perbaikan memakai alert existing untuk menampilkan: Masuk dengan Google belum
berhasil. Coba lagi atau gunakan email dan password.

State kegagalan widget lokal dibersihkan saat callback sukses berikutnya atau
pengguna mengirim form email/password. Callback sukses dan submit tetap diteruskan
ke handler existing. Jika provider auth memasok error server, pesan server tetap
lebih diutamakan. Tidak mengubah penetapan status pendaftaran, sesi, routing, API,
atau persetujuan admin. Tidak mengklaim kegagalan di sisi server sebagai kegagalan
widget. onError hanya mencakup kegagalan yang dilaporkan callback widget; SDK yang
tidak termuat atau popup ditutup tanpa callback belum ditangani oleh perubahan ini.

## File dan batas scope

- src/components/auth/SignInView.tsx: state pesan dan callback; tampilan alert existing.
- scripts/check-google-signin-feedback.mjs: render komponen asli dengan Google widget
  dan Logo terisolasi; React dan lucide memakai dependensi existing.
- Dokumen ini: keputusan, bukti dan batas pengujian.

Tidak mengubah CSS/palet/font, source tema/aset/preview, ZoomLock, harga/kuota,
AuthGate/useAuth, backend whitelist/admin A, manifest atau lockfile. Branch ini
memisahkan pekerjaan frontend dari PR21 agar review dapat dilakukan terpisah.

## QA nyata

1. Tes view sebelum fix: assertion Google widget error must be visible to the user
   gagal,0 alert versus1. Callback hanya menulis Google Login Failed.
2. Sesudah fix: PASS. Kegagalan widget menghasilkan satu alert dan tidak memanggil
   callback sukses; sukses meneruskan respons; submit email membersihkan pesan dan
   tetap memanggil submit asli; error server tetap diutamakan.
3. node scripts/check-access-client.mjs PASS pada provider React asli: pending,
   rejected, approved, revoked, Google signup/pending, offline, kontrak register lama,
   refresh basi, urutan login/logout dan operasi berikut setelah kegagalan.
4. npm run lint PASS (tsc). git diff --check PASS.
5. node scripts/check-product-boundaries.mjs FAIL: baseline04a52ec menolak file tema
   yang sudah berubah pada incoming main. Guard tidak diubah/dilemahkan. Diff branch
   ini terhadap main tidak mengandung file tema/preview/font/paket/ZoomLock.

Tes view/provider memakai Node24.22.3 tersedia. Tidak mengakses OAuth Google nyata,
akun produksi, data tamu atau admin; tidak membuktikan browser mobile/fokus/gesture.
Tidak menambah screenshot yang mengesankan callback provider nyata telah diuji.
Tidak merge main atau deploy produksi. Draft PR diserahkan untuk review.

Build `npm exec --yes --package=node@22 -- node node_modules/next/dist/bin/next build`
PASS exit0 (Next16.2.9 Turbopack, TypeScript,33 halaman). Runtime22 diperoleh melalui
registry npm tanpa mengubah manifest/lockfile. Peringatan payment/sitemap DB lokal
belum terkonfigurasi tetap tercatat; bukan uji payment/DB. Generated next-env dipulihkan.

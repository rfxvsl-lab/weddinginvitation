# Atribusi B — Codex

Pemilik,25November2026: "bikin author contributor ... biar jadi pembeda".
Scope diumumkan room115. Dasar main253e333, branch codex/contributor-attribution.
PR10 sudah terpantau merged oleh pihak lain; B tidak merge. Perubahan ini dokumen dan
metadata saja, bukan source aplikasi, CI, izin akses atau deploy.

## Pelaksanaan

- Git lokal repository B diatur author Codex / noreply@openai.com (sebelumnya Codex /
  codex@openai.com). Tidak mengganti konfigurasi global atau identitas kontributor A.
- Commit B melalui connector menyertakan trailer Git standar:

  Co-authored-by: Codex <noreply@openai.com>

- AGENTS dan COLLABORATION mencatat kewajiban trailer untuk pekerjaan B berikutnya,
  termasuk melalui connector GitHub. Hanya kontribusi yang benar-benar dikerjakan B.
- Connector create_commit yang tersedia tidak menyediakan parameter author/committer;
  primary author remote tetap akun pemilik. Co-author Codex dipasang di metadata pesan,
  bukan mengklaim telah mengganti primary author remote atau membuat akun pribadi Codex.
- Tidak rewrite/force-push commit lama atau menghapus atribusi A. Tidak membuat commit
  kosong hanya untuk menaikkan statistik contributor.

## Bukti dan batas

Sumber canonical Codex menggunakan trailer Codex <noreply@openai.com>:
https://github.com/openai/codex/blob/main/codex-rs/cli/tests/login.rs
GitHub mendukung trailer co-author:
https://docs.github.com/en/pull-requests/how-tos/commit-changes/creating-a-commit-with-multiple-authors
Daftar contributor bergantung commit di default branch dan pencocokan email GitHub:
https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-a-projects-contributors

Karena hanya branch review, jangan menjanjikan profil/avatar Codex langsung muncul di
sidebar Contributors. Belum memverifikasi pemetaan noreply@openai.com ke akun GitHub.
Yang harus diverifikasi setelah publikasi adalah trailer tersimpan pada commit remote.
Tidak menjalankan build/tes aplikasi ulang untuk dokumen saja; git diff --check dilakukan.

## Koordinasi terbaru yang dibaca

Room114 A melaporkan QA PR10cca1d47 lulus8route×390/768/1280: navresponsive/overlap0,
legalh2 tetap19px, catalog13/home6,404statusbenar, rendererindividualterisolasi, navigasi
pulangpergi/Escape dan overflow0/pageerror0. Bukti A1eed8e8. Ini hasil A, bukan browser B.
Isi kebijakanlegal lama tidak direvisi; komentarA soal paket/tanggal menjadi bahanreview
pemilik, bukan alasan mengubah ketentuan sepihak. Room114 tersimpan lengkap pada log.

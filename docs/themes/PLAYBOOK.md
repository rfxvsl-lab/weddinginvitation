# Alur membangun satu tema baru

Acuan utama: [STANDARD.md](STANDARD.md). Arahan terbaru pemilik: simpan tema lama, bangun satu tema baru; jangan menghapus tema atau mengganti pilihan undangan lama.

1. Baca arahan pemilik, AGENTS.md, COLLABORATION.md dan room; periksa main, branch kerja, PR serta file yang sedang dikerjakan kontributor lain.
2. Umumkan scope dan file di room sebelum edit. Buat branch review dari baseline yang jelas.
3. Tulis brief/art direction, tabel per bagian dan motion, sumber aset serta batas riset. Jangan mengambil `todo` berikutnya sebagai mandat otomatis.
4. Bangun satu tema dengan komposisi tersendiri. Reuse utilitas/kontrak data boleh; resep visual seragam tidak wajib. Jalur renderer khusus boleh jika dibutuhkan, tetapi dispatch harus hanya mengenai ID baru.
5. Daftarkan secara tambahan tanpa mengubah ID/default/renderer tema lama. CSS harus terisolasi. Jangan mengubah font aplikasi, harga, kuota, ZoomLock, backend atau hak paket untuk memasukkan tema.
6. Jalankan lint/build dan QA perilaku sesuai perubahan. Periksa diff tema lama. Guard lama mungkin menolak penambahan yang kini diotorisasi; catat alasan, jangan melemahkan guard atau mengklaim lulus jika gagal.
7. Tinjau screenshot setiap bagian serta rekaman scroll; uji data ekstrem dan error. Lengkapi matriks bukti: pass/fail/belum diuji, viewport, commit, batas lingkungan.
8. Commit dengan atribusi Codex bila pekerjaan B; kirim draft PR beserta bukti. Jangan menandai backlog `done` sebelum review visual pemilik dan integrasi selesai. Jangan auto-merge/deploy.

## Berkas handover tiap kandidat

Brief, komposisi, palet/peran warna, sumber aset, peta motion, file berubah, baseline/head, hasil tes nyata, screenshot/rekaman tersedia, kekurangan, serta keputusan pemilik. Jika baru demo state lokal, tulis itu secara eksplisit.

## Pemisahan peran

B menangani tema web pada arahan pemilik terbaru. A menangani backend/admin serta video sesuai scope yang sudah dicatat. A sedang tidak memantau room menurut pesan173; jangan mengklaim A menyetujui atau menguji kandidat baru tanpa balasan nyata.

# Standar tema RuangHadir — edisi 26 November 2026

Standar kerja B berdasarkan koreksi pemilik: tema lama tetap disimpan; bangun satu tema baru dengan standar baru. Dokumen ini menggantikan resep visual lama, bukan mengklaim desain baru sudah disetujui pemilik.

## Satu standar kualitas, komposisi tiap tema berbeda

Yang diseragamkan: keterbacaan, ketepatan data, kontrol, ketahanan CSS, sumber aset, dan bukti QA. Hero 2.5D, font skrip, bingkai oval, kartu kaca, partikel, ikon, bunga, serta urutan bagian tertentu **tidak wajib**. Jangan mengulang halaman yang sama lalu mengganti palet. Dua tema harus dapat dibedakan melalui komposisi, pemakaian foto, hierarki teks, dan alur geraknya.

## Sebelum implementasi

Tulis brief berisi suasana, sasaran pasangan, satu ide visual, sumber foto/seni, palet dengan peran, komposisi setiap bagian, perilaku motion, serta kebutuhan tanpa foto. Tunjukkan perbedaan dengan tema terdekat. Buat satu kandidat lengkap; jangan membuat tema berikutnya dari antrean otomatis.

## Kontrak per bagian

| Bagian | Kriteria penerimaan | Bukti yang disertakan |
|---|---|---|
| Sampul | Nama, tanggal, tamu, tombol terbaca pada layar pendek; tombol buka bekerja | Screenshot awal dan rekaman klik buka |
| Hero | Nama panjang tidak terpotong, foto tidak merusak hierarki; isi tampil tanpa menunggu intro panjang | Screenshot setelah buka dan data nama panjang |
| Mempelai | Identitas, orang tua, foto masing-masing terbaca; fallback tanpa foto sengaja didesain | Screenshot kedua profil |
| Acara | Tanggal/jam/tempat/alamat benar; acara nonaktif tidak tampil; tautan lokasi/kalender bermakna | Screenshot serta pemeriksaan tujuan tautan |
| Cerita & galeri | Cerita bukan kartu berulang tanpa hierarki; foto memiliki ritme; galeri dapat dibuka dan ditutup tanpa kehilangan posisi | Screenshot tiap bagian, uji lightbox/keyboard |
| Tanda kasih | Informasi mudah disalin, kegagalan clipboard dijelaskan; tanpa rekening tidak menampilkan panel kosong | Uji salin berhasil/gagal |
| RSVP & ucapan | Label jelas; validasi, sedang mengirim, gagal, dan berhasil mengikuti kemampuan callback/API nyata | Uji data valid/kosong, pending dan error |
| Penutup | Penutup yang disengaja, nama terbaca, navigasi/kontrol tidak menutupi isi | Screenshot bagian paling bawah |

Fitur opsional disembunyikan bila datanya kosong/nonaktif. Demo tidak boleh menyatakan data tersimpan permanen apabila hanya masuk state halaman. Konfirmasi server hanya boleh diklaim setelah ada respons server yang diperiksa.

## Art direction dan aset

- Jangan generate SVG/ilustrasi generik untuk mengisi ruang. Tidak perlu ornamen jika komposisi foto dan tipografi sudah kuat.
- Catat asal, pemilik, lisensi, dan kebutuhan izin tiap aset. Source kompetitor adalah bukti analisis, bukan aset siap pakai.
- Tema adat memerlukan referensi bentuk dan review konteks budaya; nama daerah saja tidak cukup.
- Palet diberi peran: latar, teks, aksi, aksen. Warna ceria boleh terkontrol; warna pink tidak ditambahkan sebagai default otomatis.
- Manrope aplikasi tetap. Font tema lama tetap. Kandidat baru menjelaskan pemilihan tipografinya sendiri.

## Layout dan CSS

- Mobile: satu kolom undangan; desktop: foto/nama di kiri, kolom undangan sempit di kanan mengikuti wrapper existing.
- Uji 360×640, 390×844, 430×932, desktop 1280×860 dan 1440×900. Angka ini target QA, bukan klaim sudah diuji.
- Tidak ada overflow horizontal/teks terpotong; jangan menyembunyikan kerusakan dengan overflow hidden global.
- CSS tema baru memakai CSS Modules atau root scope unik, tidak selector global yang merembes ke tema lain.
- Input minimal 16px; target sentuh minimal 44px; body 14–16px; label kecil tidak dipakai untuk paragraf. Kontras teks normal ditargetkan ≥4.5:1.
- Uji nama sangat panjang, alamat panjang, tanpa foto, foto gagal dimuat, galeri kosong/panjang, tanpa cerita/rekening.
- Pertahankan ZoomLock/viewport existing. Uji gesture dan fokus input pada perangkat nyata sebelum mengklaim semua browser terkunci.

## Gerak

Tulis tabel pemicu → elemen → perubahan → durasi → reduced motion. Animasi bukan syarat semua bagian. Tidak ada teks/form yang terus mengambang. Pengguna boleh segera menggulir/mengakses acara. Rekam alur buka → scroll sampai penutup, bukan hanya screenshot hero. Untuk dunia paralaks kontinu, sertakan minimal 30 posisi kamera termasuk antarbab; bukan 30 foto pose yang sama.

## Bukti riset

Gunakan laporan [Wedew](../research/01-WEDEW.md), [Viding](../research/02-VIDING.md), [Katsudoto](../research/03-KATSUDOTO.md), [Our Wedding Link](../research/04-OUR-WEDDING-LINK.md), dan [WebNikah](../research/05-WEBNIKAH.md). Catat URL demo, tindakan, tangkapan bagian, serta JS/CSS tema yang benar-benar diperiksa. Chunk framework tidak membuktikan transisi tema. Pisahkan observasi UI, temuan source, inferensi, dan usulan. Laporan lama tidak otomatis membuktikan ada rekaman penuh baru.

## Status yang boleh dipakai

1. **Konsep**: brief dan komposisi, belum implementasi.
2. **Kandidat review**: implementasi ada, QA/batas dicatat, belum persetujuan visual.
3. **Lulus teknis**: hanya untuk pemeriksaan yang nyata lulus; sebutkan viewport/lingkungan.
4. **Disetujui visual**: hanya setelah keputusan pemilik yang nyata.
5. **Siap rilis**: visual, integrasi, hak aset, dan regresi lengkap; pemilik menentukan merge/deploy.

Tidak ada nilai rata-rata yang menutupi kegagalan kritis. Teks terpotong, kontrol tidak bisa dipakai, aset tanpa hak, atau klaim simpan palsu wajib diperbaiki. Build hijau bukan bukti visual bagus.

# Kriteria UI tanpa AI slop

Gunakan sebagai daftar periksa. Setiap temuan diberi kode kategori supaya laporan mudah dibaca.

## K — Klaim (prioritas tertinggi)

Klaim adalah apa pun yang dibaca pengunjung sebagai fakta tentang produk atau pengguna.

| Kode | Masalah | Contoh slop | Perbaikan |
| --- | --- | --- | --- |
| K1 | Statistik pengguna tanpa sumber | "50.214 undangan terkirim", "12.400 pasangan" | Hapus, atau tampilkan hanya jika diambil dari DB saat render |
| K2 | Rating/review karangan | "4,9/5 dari 2.180 ulasan", avatar inisial "RS AW BL" | Hapus sampai ada ulasan nyata dengan sumber |
| K3 | Testimoni tanpa izin | kutipan + nama pasangan + venue terkenal | Sembunyikan bagian; minta pemilik mengisi data asli |
| K4 | Angka dekoratif di mockup | "98,4% terkirim", "Rp 38,4 jt", "315 terverifikasi" | Ganti dengan label fungsi ("Status terkirim per tamu") |
| K5 | Jumlah/fitur yang salah | "40+ tema" padahal `DEFAULT_THEMES` berisi 9 | Ambil angka dari konstanta |
| K6 | Janji layanan tak terukur | "Respons rata-rata < 5 menit" | Hapus angka; sebut saluran kontak saja |
| K7 | Klaim saling bertentangan | "1.200+ pasangan" di hero, "12.400" di bawahnya | Tanda pasti karangan — hapus keduanya |

Uji cepat: *"Kalau pelanggan bertanya 'dari mana angka ini?', bisakah kita menunjukkan datanya?"*
Kalau tidak, itu K.

## C — Copy

| Kode | Masalah | Contoh | Perbaikan |
| --- | --- | --- | --- |
| C1 | Frasa generik yang cocok untuk produk apa pun | "Wujudkan undangan impian kalian", "Bukan sekadar link biasa" | Sebut apa yang sebenarnya dilakukan produk |
| C2 | Kata sifat superlatif tanpa isi | eksklusif, premium, elegan, mewah, istimewa (berulang) | Pakai sekali, di tempat yang paling tepat |
| C3 | Formula judul berulang | setiap judul: kicker + "Kalimat *kata miring*." | Variasikan; aksen hanya di hero |
| C4 | Campur bahasa tanpa alasan | "Continue with Google" di UI berbahasa Indonesia | Ikuti bahasa halaman bila kontrolnya bisa diatur |
| C5 | Placeholder yang mengulang label | label "Email", placeholder "nama@email.com" boleh; label "Nama" + placeholder "Masukkan nama" tidak perlu | Placeholder = contoh format, bukan instruksi |

Frasa yang hampir selalu generik (ID/EN): *impian, istimewa, eksklusif, premium, elegan, sakral,
sekali seumur hidup, tak terlupakan, wujudkan, abadikan, bukan sekadar, revolusioner, seamless,
elevate, unleash, next-level, effortless, game-changer, all-in-one.* Boleh dipakai, tetapi tiap
pemakaian harus didukung detail konkret di kalimat yang sama.

## V — Visual

| Kode | Masalah | Contoh | Perbaikan |
| --- | --- | --- | --- |
| V1 | Tombol bergradien + glow berwarna | `linear-gradient(...)` + `box-shadow: 0 8px 24px rgba(142,47,69,.35)` | Warna solid, hover sedikit lebih gelap, fokus terlihat |
| V2 | Ikon di kotak/lingkaran pastel di setiap kartu | grid 6 kartu, semua `w-10 h-10 rounded-xl bg-x-50` + ikon | Tampilkan isi/fitur sungguhan; ikon hanya bila membantu memindai |
| V3 | Mockup widget palsu di kartu fitur | progress bar, kalender, angka dalam kartu fitur | Gunakan screenshot nyata, atau teks saja |
| V4 | Glassmorphism/blur dekoratif berlebihan | `backdrop-blur` di elemen yang tidak di atas konten | Hanya untuk overlay sungguhan |
| V5 | Lingkaran blur / blob dekoratif di latar | `blur-[120px] rounded-full` | Latar polos; biarkan konten yang menonjol |
| V6 | Gradien ungu-biru generik | `from-indigo-500 to-purple-500` | Palet merek |
| V7 | Placeholder visual menggantikan aset nyata | kartu CSS "Rina & Budi" untuk katalog tema | Screenshot tema sungguhan |
| V8 | Emoji di UI | "Halo! 🎉", "🧪 Simulasi" | Hapus; gunakan ikon dari pustaka yang sama |

## S — Konsistensi

| Kode | Masalah | Perbaikan |
| --- | --- | --- |
| S1 | Lebih dari satu gaya tombol primer | Satu kelas (`saas-btn-primary`) dipakai di landing, auth, dashboard |
| S2 | Warna di luar palet (hex acak, warna Tailwind mentah di area merek) | Token `--saas-*` |
| S3 | Radius dan bayangan acak (`rounded-3xl`, `shadow-2xl` bercampur) | Skala kecil yang konsisten |
| S4 | Tiga pustaka ikon dalam satu layar | Satu pustaka per area |

## A — Aset & integritas

| Kode | Masalah | Perbaikan |
| --- | --- | --- |
| A1 | Gambar hilang / teks alt tampil di layar | Pastikan file ada; buat dari sumber aslinya |
| A2 | Mojibake (`â€¢`, `Ã©`) di teks atau terpanggang di gambar | Perbaiki teks; buat ulang gambar |
| A3 | Tautan ke halaman yang tidak ada | Cek `src/app/`; hapus atau arahkan ke halaman nyata |
| A4 | Screenshot produk yang usang (tidak cocok dengan tema saat ini) | Ambil ulang dari halaman demo |

## Cara menilai hasil

- Jalankan `slop-scan.mjs` sebelum dan sesudah; jumlah temuan K dan A harus 0.
- Bandingkan screenshot: setiap perubahan visual harus bisa dijelaskan dengan kode kriteria di atas.
- Bagian yang dihapus karena tidak ada data nyata dicatat sebagai "perlu data dari pemilik", bukan disembunyikan diam-diam.

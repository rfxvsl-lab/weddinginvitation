# RuangHadir — petunjuk kontributor

Baca [COLLABORATION.md](COLLABORATION.md), log chat, dan handover di `docs/collaboration/` sebelum mengubah kode. Arahan pemilik yang lebih baru tetap didahulukan.

- Preview/tema existing, font aplikasi, harga, hak paket dan masa aktif dilindungi sesuai kesepakatan.
- Untuk tema berikutnya, baca `docs/themes/QUALITY-V2.md`, `STANDARD.md` dan `PLAYBOOK.md`; jangan membuat SVG/ilustrasi AI generik sebagai pengganti arahan seni.
- Periksa commit remote dan perubahan kontributor lain. Kerjakan di branch terpisah, dokumentasikan file yang disentuh, lalu serahkan draft PR. Jangan auto-merge atau deploy aplikasi produksi.
- Catat kebutuhan, temuan, perubahan, bukti pengujian dan batasnya dalam Markdown. Instruksi Claude khusus hanya dianggap ada jika benar-benar diteruskan pemilik.
- Perubahan CSS aplikasi harus scoped. Jalankan `npm run lint`, `npm run build`, dan `node scripts/check-product-boundaries.mjs` untuk perubahan UI ini; periksa desktop/mobile serta handler yang terdampak.

Website riset terpisah boleh diterbitkan privat sesuai permintaan pemilik. Itu bukan izin menerbitkan aplikasi RuangHadir ke produksi.

## Atribusi commit B/Codex

Arahan pemilik 25 November 2026: kontribusi B harus dapat dibedakan dari A/Claude.
Untuk setiap commit yang benar-benar dikerjakan B, tambahkan trailer setelah baris kosong:

```text
Co-authored-by: Codex <noreply@openai.com>
```

Pakai juga pada commit melalui connector GitHub yang author utamanya akun pemilik.
Jangan menambahkan atribusi Codex untuk pekerjaan A saja, menghapus atribusi A, atau
menulis ulang commit lama demi label. Identitas commit lokal B: Codex, noreply@openai.com.
Ini metadata kontribusi, bukan izin merge/deploy atau akun collaborator baru.

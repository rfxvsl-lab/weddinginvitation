# Otak RFX Wedding Builder (Brain & Memory File)

Dokumen ini berfungsi sebagai peta arsitektur dan memori sistem untuk **Wedding Builder by RFX.visual**. Menyimpan seluruh konfigurasi data bawaan (default), skema data tema, alur penayangan lokal asinkron, dan aturan penyesuaian/integrasi template baru mendatang.

---

## 1. Aturan Konversi Tautan Gambar (Google Drive Direct Embed)
Sistem menggunakan modul utilitas `/src/utils/googleDrive.ts` untuk mengonversi tautan berbagi Google Drive biasa menjadi format langsung `lh3.googleusercontent.com` agar dapat dimuat oleh tag `<img>` di browser tanpa kendala CORS atau pembatasan unduhan.

*   **Format Masukan (Share URL):**
    *   `https://drive.google.com/file/d/[FILE_ID]/view?usp=drivesdk`
    *   `https://drive.google.com/open?id=[FILE_ID]`
*   **Format Keluaran (Embed URL):**
    *   `https://lh3.googleusercontent.com/d/[FILE_ID]`

### Pemetaan Gambar Bawaan (Default Assets)
Tautan gambar bawaan yang diberikan oleh klien telah dikonversi secara permanen ke format `lh3` dan diintegrasikan ke dalam `/src/data/defaultData.ts` (Serta seluruh ketergantungan Unsplash telah dihapus sepenuhnya):

1.  **Foto Utama Kedua Mempelai (OG Image / Sampul):**
    *   ID: `1EhkWZdyR3SGNE8bXdrxDFTrNzN9RHx0r`
    *   URL: `https://lh3.googleusercontent.com/d/1EhkWZdyR3SGNE8bXdrxDFTrNzN9RHx0r`
2.  **Gambar Latar Belakang (BG Image):**
    *   ID: `1UoKVxvP08iYb7tS91UU6iwkLXvigkwVE`
    *   URL: `https://lh3.googleusercontent.com/d/1UoKVxvP08iYb7tS91UU6iwkLXvigkwVE`
3.  **Foto Mempelai Pria (Groom Photo):**
    *   ID: `1IugI8pHxov6LaSyvLaJ1BhAK_Mo_9WAp`
    *   URL: `https://lh3.googleusercontent.com/d/1IugI8pHxov6LaSyvLaJ1BhAK_Mo_9WAp`
4.  **Foto Mempelai Wanita (Bride Photo):**
    *   ID: `1zCuUKGqbl_g75unk6ZfKMrSkjBDX6b7V`
    *   URL: `https://lh3.googleusercontent.com/d/1zCuUKGqbl_g75unk6ZfKMrSkjBDX6b7V`
5.  **Galeri Prewedding (9 Foto Terlampir & Siap Tayang):**
    *   Foto 1: `https://lh3.googleusercontent.com/d/1p7rdtzfEPB_QsUz-NugF2fEaVT_Cqefg`
    *   Foto 2: `https://lh3.googleusercontent.com/d/1-ZOM9SLuYEzihJfrFaYBQRb6N5bsUZZW`
    *   Foto 3: `https://lh3.googleusercontent.com/d/1pzxlTW21vx4SW9K7hUeE6l0pjL1UXMw1`
    *   Foto 4: `https://lh3.googleusercontent.com/d/1vZfCejzg6xYTGH7xhrc1uGCPZGpgOrUv`
    *   Foto 5: `https://lh3.googleusercontent.com/d/1kiKo6PWW_sOfo8zqtQ2qIRmFOpKoZhS4`
    *   Foto 6: `https://lh3.googleusercontent.com/d/1YTNeSf4Gw9RhcfYEr878MSuvDRDahiQy`
    *   Foto 7: `https://lh3.googleusercontent.com/d/18RvyrH5ap6bwJ9KrDov1h1eZwCG_f86k`
    *   Foto 8: `https://lh3.googleusercontent.com/d/1L-7ZOYkz_H_jZeoXUs9eGKbuVQSBSkZN`
    *   Foto 9: `https://lh3.googleusercontent.com/d/1vabQWjbSav1sooHcaVuMvBPDTMisToMY`

---

## 2. Alur Pembacaan Media Kustom (IndexedDB)
Untuk memberikan kebebasan penuh tanpa batasan server backend, semua fitur unggah (audio pengiring dan seluruh foto di form builder tanpa kecuali) dimuat lokal melalui database browser **IndexedDB (via `/src/utils/indexedDb.ts`)**.

*   **Penyimpanan:** Berkas asli diubah menjadi `Blob` lalu disimpan dengan kunci unik (seperti `groom-photo-[TIMESTAMP]`).
*   **Format Alamat:** Alamat diatur dengan prefiks khusus `indexeddb://[KEY]`.
*   **Pecahan Resolusi Gambar (Preview):**
    Komponen pembaca (`InvitationPreview.tsx`) dan pengedit (`EditorPanel.tsx`) memindai seluruh data undangan untuk mengambil data Blob dari IndexedDB secara asinkron, mengubahnya menjadi Object URL sementara (`blob:http://...`), dan menyimpannya di penampung status `resolvedImages` untuk di-render.

---

## 3. Fitur Unggah Foto Tanpa Terkecuali (Builder UI)
Setiap isian foto yang ada di formulir pembangunan undangan memiliki pencari berkas asli (Uploader Widget) bawaan yang elegan:
1.  **Profil Mempelai Pria:** Di bawah isian URL `groom.photoUrl`.
2.  **Profil Mempelai Wanita:** Di bawah isian URL `bride.photoUrl`.
3.  **Setiap Garis Waktu Cerita (Love Story):** Di dalam baris isian masing-masing `story.imageUrl`.
4.  **Gambar Sampul Depan (OG Image):** Di navigasi tab utama 'Media & Musik'.
5.  **Gambar Latar Belakang (BG Image):** Di navigasi tab utama 'Media & Musik'.
6.  **Setiap Sektor Galeri Prewedding:** Menggunakan baris kontainer lokal fleksibel dengan penunjuk nomor urut yang rapi.

---

## 4. Struktur Branding Baru
*   Nama Brand: **Wedding Builder by RFX.visual**
*   Filosofi Desain: Kombinasi tipografi elegan sans-serif dan serif premium untuk menciptakan nuansa undangan mewah, bersih, dan romantis layaknya platform SaaS kelas atas.

---

## 5. Dokumentasi Struktur Template & Tema Undangan (MANDATORY MEMORY)
Apabila ada penambahan template baru oleh pengguna di masa mendatang, sistem **WAJIB** mengikuti pemetaan struktur ini agar terintegrasi sempurna dengan panel kontrol pembangun dan komponen pratinjau:

### A. Skema Data Tema (`ThemeConfig` di `/src/types.ts`)
Setiap data tema diletakkan dalam list `DEFAULT_THEMES` di `/src/data/defaultData.ts` dan harus memenuhi properti berikut:
```typescript
export interface ThemeConfig {
  id: string;            // ID Unik (lowercase, e.g., 'rfx-dark' atau 'custom-theme')
  name: string;          // Nama tampilan tema di UI Pembuat
  primary: string;       // Kelas warna Tailwind primer (e.g., 'red-600')
  primaryHex: string;    // Nilai Hex warna utama (e.g., '#DC2626')
  secondaryHex: string;  // Nilai Hex warna sekunder (e.g., '#EF4444')
  bgHex: string;         // Nilai Hex latar belakang halaman utama (e.g., '#050505')
  bgPatternHex: string;  // Nilai Hex corak dekorasi latar belakang (e.g., '#0d0d0d')
  textHex: string;       // Nilai Hex warna teks utama (e.g., '#E4E4E7')
  accentHex: string;     // Nilai Hex warna aksen atau tombol sorot (e.g., '#DC2626')
  fontSerif: string;     // Font keluarga Serif (e.g., 'font-serif' atau 'font-sans' jika sans)
  fontSans: string;      // Font keluarga Sans/Mono (e.g., 'font-mono' atau 'font-sans')
  pattern: 'floral' | 'classic' | 'modern' | 'minimalist'; // Pola pembatas/Sudut hiasan
}
```

### B. Daftar Template Aktif Saat Ini
1.  **RFX Cinematic Dark (`id: 'rfx-dark'`)**
    *   Visual: Hitam arang, merah aksen megah, monospace tech-forward vibe.
2.  **Classic Cremy Rose (`id: 'cremy-rose'`)**
    *   Visual: Rose krem merah muda romantis, serif mewah dengan corak flora klasik.

### C. Alur Kontrol On/Off Cerita Cinta (Love Story Toggle)
Halaman pratinjau dan pembuat memiliki sinkronisasi data boolean `showLoveStories` (default: `true`):
*   **Penyimpanan:** Disimpan di `weddingData.showLoveStories`. Jika berharga `false`, bagian timeline kisah cinta sepenuhnya disembunyikan/unmount di undangan pratinjau (`InvitationPreview.tsx`).
*   **Editor:** Memiliki widget sakelar (toggle switch) elegan di bagian atas tab 'Cerita Cinta' di `EditorPanel.tsx`. Menampilkan notifikasi pemberitahuan detail asisten jika fitur dinonaktifkan untuk kenyamanan perancang foto.

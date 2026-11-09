# Reverse Engineering — ruanghadir.net (Wedding Invitation Platform)

Dokumen ini hasil bedah kode + pemindaian kompetitor. Fokusnya bukan menyalin markup, tapi mengambil **konsep produk** yang punya nilai nyata dan belum ada di web undangan sendiri, lalu mengimplementasikannya.

Tanggal: 9 November 2026
Target kode: `rfxvsl-lab/weddinginvitation` (ruanghadir.net)

---

## 1. Peta Arsitektur Target

| Lapis | Isi | Catatan |
|---|---|---|
| Routing | Next.js App Router: `/[slug]` (undangan publik), `/dashboard`, `/admin`, `/auth`, `(marketing)`, `/api/*` | Slug publik personal per tamu via `?to=&code=` |
| Render template | `InvitationPreview` → 9 layout sinematik (dark luxury, Netflix, SpotiLove, storybook, wayang, dst.) + 1 default | Token warna via CSS custom properties, tiap layout punya lock screen + musik + RSVP |
| Data | Turso/libSQL: users, invitations, guests, rsvps, visitor_logs, transactions, chat, snapshots | Snapshot publish terpisah dari draft |
| Monetisasi | Paket demo/reguler/premium/luxury + watermark + limit konten + Pakasir | Gate fitur terpusat di `packageLimits.ts` |
| Trust & ops | AI verifikasi bukti transfer (Gemini), banned IP, rate limit, visitor analytics, live chat | — |
| Growth | WhatsApp blast per tamu, slug, OG image, sitemap dinamis, testimoni | — |

**Pelajaran kunci:** limit tier dipusatkan di satu file (`PACKAGE_LIMITS`) dan semua komponen mengimpor dari sana. Ini pola bagus untuk menjaga gate konsisten.

---

## 2. Pemindaian Kompetitor (konsep yang beredar di pasar)

Sumber: acaranya.id/fitur, inv.akaddigitech.id (buku tamu digital), invitesia.id, occavia.com, fizz.wedding, artikel fitur-wajib Lovelink.

Konsep yang muncul berulang dan layak diambil:

1. **Buku tamu digital + selfie check-in** — tamu memfoto diri saat check-in, panitia punya layar sambut, follow-up WhatsApp otomatis, tracking souvenir.
2. **Formasi meja / nomor meja** — kursi tamu diatur, nomor meja tampil di tiket.
3. **Guest camera / photo wall real-time** — tamu kirim foto, muncul di dinding momen, bisa diunduh mempelai.
4. **Voice note / audio guestbook** — tamu rekam ucapan suara.
5. **Live streaming embed** — YouTube/IG Live untuk kerabat jauh.
6. **Rundown acara** — susunan acara detail.
7. **AI copywriter** — generate kata-kata undangan, susunan acara, rekomendasi desain.
8. **Multi-jenis acara** — aqiqah, khitan, ulang tahun, wisuda, seminar, corporate.
9. **E-sertifikat & carbon tracker** — untuk event non-pernikahan.
10. **Add-to-calendar + share card** — tamu menyimpan tanggal, membagikan ulang undangan.

---

## 3. Gap Matrix

| Konsep | Status di target | Keputusan |
|---|---|---|
| Template sinematik & tier gate | Sudah kuat | Pertahankan |
| RSVP + QR pass per tamu | Sudah ada (QR via API eksternal) | Tambah scanner kamera asli |
| Analitik kunjungan | Sudah ada | — |
| **Check-in kamera + pax/meja/souvenir** | Belum ada (masih simulasi klik) | **DIIMPLEMENTASIKAN** |
| **Guest camera + photo wall** | Belum ada | **DIIMPLEMENTASIKAN** |
| **Voice note guestbook** | Belum ada | **DIIMPLEMENTASIKAN** |
| **Add to calendar (.ics)** | Belum ada | **DIIMPLEMENTASIKAN** |
| **Story share card** | Belum ada | **DIIMPLEMENTASIKAN** |
| Live streaming embed | Belum ada | Backlog #1 |
| AI copywriter | Belum ada (SDK Gemini sudah terpasang) | Backlog #2 |
| Formasi meja (drag & drop) | Sebagian (nomor meja di check-in) | Backlog #3 |
| Selfie check-in + layar sambut | Belum ada | Backlog #4 |
| Video wishes | Belum ada | Backlog #5 |
| Multi-jenis acara | Wedding-only | Backlog #6 |

---

## 4. Yang Diimplementasikan di Repo Ini

### 4.1 Live Moments (kamera tamu + ucapan suara)

- Dock mengambang di semua template: `Momen` / `Suara` / `Bagikan` (`src/components/LiveMomentsDock.tsx`).
- Foto dikompres di browser (maks 1600px, JPEG 0.82) lalu diunggah unsigned ke Cloudinary (`wedding/moments`), tersimpan di tabel `photo_wall`.
- Voice note direkam `MediaRecorder`, maksimal 60 detik, diunggah ke `wedding/voices`, tersimpan di `voice_notes`.
- Dinding momen tampil grid + lightbox (unduh/hapus). Ucapan suara tampil sebagai daftar audio.
- Nama tamu otomatis dari `?to=`; tanpa itu tamu mengisi nama (disimpan di localStorage).
- Bisa dimatikan pemilik lewat toggle `enableLiveMoments` di editor.

### 4.2 Check-in nyata (bukan simulasi)

- Tombol `Scan Check-in` di Manajemen Tamu → `QrCheckInScanner`.
- Kamera belakang + `BarcodeDetector` (Chrome/Android); fallback `jsQR`; fallback terakhir input kode manual.
- Panel konfirmasi: jumlah pax (dibatasi pax limit), nomor meja, peringatan bila sudah check-in.
- Persistensi `guests.checked_in_at`, `check_in_pax`, `table_no`; kolom status check-in di tabel tamu.
- Endpoint DB: `checkInGuest` (idempotent, timestamp awal tidak tertimpa).

### 4.3 Add to calendar + story card

- `/api/calendar/[slug]` menghasilkan `.ics` dengan dua VEVENT (akad & resepsi), `TZID=Asia/Jakarta`, alarm H-1.
- Kartu story 1080×1920 dibuat di canvas (nama, tanggal, URL) lalu dibagikan via Web Share API atau diunduh.

### 4.4 Perbaikan pendukung

- Countdown memakai `serverNow` agar tidak meleset karena jam device tamu.
- Migrasi `005_add_live_moments.sql` (tabel + kolom).
- `allowedDevOrigins` agar dev server lokal bisa hidrasi.

---

## 5. File yang Berubah

Baru:
- `migrations/005_add_live_moments.sql`
- `src/components/LiveMomentsDock.tsx`
- `src/components/QrCheckInScanner.tsx`
- `src/app/api/calendar/[slug]/route.ts`
- `src/app/test-guests/page.tsx` (harness QA)
- `scripts/seed-local.ts` (DB lokal untuk uji)

Diubah:
- `src/types.ts`, `src/lib/api.ts`, `src/components/InvitationPreview.tsx`
- `src/components/GuestManager.tsx`, `src/components/EditorPanel.tsx`
- `src/app/[slug]/page.tsx`, `src/app/[slug]/InvitationClient.tsx`
- `src/data/defaultData.ts`, `next.config.js`

---

## 6. Backlog Berikutnya (urut prioritas)

1. **Live streaming** — field `liveStreamUrl` + section embed YouTube, tampil hanya saat H-0.
2. **AI copywriter** — route `/api/ai/invitation-copy` memakai `@google/genai` (sudah dependency), output kata pengantar/rundown, kuota per tier.
3. **Formasi meja** — editor drag & drop, tabel `tables`, nomor meja otomatis di tiket.
4. **Selfie check-in** — foto tamu saat check-in + layar sambut (`/welcome/[slug]`).
5. **Video wishes** — MediaRecorder video 15 detik, transcode Cloudinary.
6. **Multi-jenis acara** — `eventType` pada invitation, template aqiqah/khitan/birthday.

---

## 7. Catatan Verifikasi

- `npx tsc --noEmit` bersih; `npm run build` sukses.
- Uji browser nyata: buka undangan → unggah foto (masuk DB + muncul di dinding) → tab suara → generate story card 1080×1920 → check-in via kode manual (pax 2, Meja 7) → baris DB terisi.
- Kamera fisik belum diuji karena headless (fallback manual terbukti); `BarcodeDetector`/`jsQR` perlu uji di HP.
- Cloudinary preset `rfx_wedding` sudah diverifikasi menerima upload unsigned.

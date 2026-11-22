import React from "react";
import type { Metadata } from "next";
import { SaasLegalShell } from "@/components/saas/SaasLegal";

export const metadata: Metadata = {
  title: "Ketentuan Layanan — RuangHadir.net",
  description:
    "Ketentuan Layanan RuangHadir.net — Syarat dan ketentuan penggunaan platform undangan pernikahan digital gratis dan Enterprise.",
};

export default function TermsOfServicePage() {
  return (
    <SaasLegalShell
      title="Ketentuan"
      accent="Layanan"
      updated="Terakhir diperbarui · November 2026"
    >
      <h2>1. Penerimaan Ketentuan</h2>
      <p>
        Dengan mengakses dan menggunakan layanan RuangHadir.net (&quot;Layanan&quot;) yang dioperasikan
        oleh RFX Visual, Anda menyetujui untuk terikat oleh Ketentuan Layanan ini. Jika Anda tidak
        menyetujui sebagian atau seluruh ketentuan ini, mohon hentikan penggunaan Layanan.
      </p>

      <h2>2. Deskripsi Layanan</h2>
      <p>
        RuangHadir.net menyediakan platform pembuatan undangan pernikahan digital mencakup koleksi tema
        siap pakai, editor konten real-time, tautan sapaan tamu personal, manajemen daftar tamu &amp;
        RSVP, amplop digital, analitik kunjungan, serta QR check-in di lokasi acara.
      </p>

      <h2>3. Model Paket: Full Gratis &amp; Enterprise</h2>
      <ul>
        <li>
          <strong>Paket Full Gratis (Rp 0):</strong> Seluruh fitur inti undangan digital terbuka
          gratis untuk pengguna personal tanpa biaya pendaftaran, tanpa kartu kredit, dan tanpa
          watermark.
        </li>
        <li>
          <strong>Paket Enterprise:</strong> Ditujukan bagi Wedding Organizer (WO), agensi event,
          maupun perusahaan dengan kebutuhan custom domain, multi-seat tim, dan SLA prioritas.
          Pemesanan dilakukan melalui <strong>admin@ruanghadir.net</strong>, dan akses masuk wajib
          menggunakan alamat email domain perusahaan resmi serta kode akses khusus yang diterbitkan
          oleh admin RuangHadir.
        </li>
      </ul>

      <h2>4. Pendaftaran &amp; Keamanan Akun</h2>
      <ul>
        <li>Informasi yang Anda berikan saat mendaftar harus akurat dan dapat dipertanggungjawabkan.</li>
        <li>Anda bertanggung jawab penuh menjaga kerahasiaan kata sandi maupun kode akses Enterprise.</li>
        <li>
          Penggunaan alamat email webmail publik (seperti Gmail, Yahoo, atau Outlook) tidak diizinkan
          pada jalur Portal Enterprise.
        </li>
      </ul>

      <h2>5. Konten Pengguna</h2>
      <ul>
        <li>Hak kepemilikan foto, teks, musik, dan data acara tetap sepenuhnya milik Anda.</li>
        <li>
          Anda dilarang mengunggah konten yang melanggar hukum, mengandung unsur SARA, pornografi,
          ujaran kebencian, atau melanggar hak kekayaan intelektual pihak lain.
        </li>
        <li>
          Kami berhak menonaktifkan undangan atau akun yang terbukti melanggar ketentuan ini demi
          menjaga keamanan platform.
        </li>
      </ul>

      <h2>6. Ketersediaan Layanan &amp; Batasan Tanggung Jawab</h2>
      <p>
        Kami berupaya menjaga ketersediaan platform secara optimal setiap hari. Layanan disediakan
        &quot;sebagaimana adanya&quot; (as is) dan kami dapat melakukan pemeliharaan sistem secara
        berkala. Untuk klien Enterprise, ketentuan ketersediaan layanan mengikuti perjanjian SLA yang
        disepakati bersama.
      </p>

      <h2>7. Perubahan Ketentuan</h2>
      <p>
        Kami dapat memperbarui Ketentuan Layanan ini sewaktu-waktu seiring perkembangan fitur platform.
        Versi terbaru akan selalu dipublikasikan di halaman ini beserta tanggal pembaruannya.
      </p>

      <h2>8. Hukum yang Berlaku &amp; Kontak Resmi</h2>
      <p>
        Ketentuan ini diatur oleh hukum Republik Indonesia. Untuk pertanyaan, pelaporan pelanggaran,
        atau permintaan kemitraan Enterprise, silakan hubungi{" "}
        <a href="mailto:admin@ruanghadir.net">admin@ruanghadir.net</a>.
      </p>
    </SaasLegalShell>
  );
}
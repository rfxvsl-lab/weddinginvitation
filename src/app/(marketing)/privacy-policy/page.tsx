import React from "react";
import type { Metadata } from "next";
import { SaasLegalShell } from "@/components/saas/SaasLegal";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — RuangHadir.net",
  description:
    "Kebijakan Privasi RuangHadir.net — Bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
};

export default function PrivacyPolicyPage() {
  return (
    <SaasLegalShell
      title="Kebijakan"
      accent="Privasi"
      updated="Terakhir diperbarui · November 2026"
    >
      <h2>1. Pendahuluan</h2>
      <p>
        RuangHadir.net yang dioperasikan oleh RFX Visual berkomitmen melindungi privasi setiap pasangan,
        tamu undangan, maupun klien Enterprise. Kebijakan Privasi ini menjelaskan bagaimana kami
        mengumpulkan, memproses, menyimpan, dan mengamankan data Anda.
      </p>

      <h2>2. Informasi yang Kami Kumpulkan</h2>
      <ul>
        <li>
          <strong>Data Akun:</strong> Nama lengkap, alamat email (atau email domain perusahaan untuk
          Enterprise), nomor WhatsApp, dan kredensial login yang disimpan secara terenkripsi.
        </li>
        <li>
          <strong>Data Undangan:</strong> Nama mempelai, jadwal &amp; lokasi acara, galeri foto, kisah
          cinta, rekening amplop digital, daftar tamu, serta ucapan RSVP.
        </li>
        <li>
          <strong>Data Akses Enterprise:</strong> Domain organisasi dan hash kriptografi (SHA-256) dari
          kode akses khusus untuk memverifikasi keabsahan login perusahaan.
        </li>
        <li>
          <strong>Data Analitik Dasar:</strong> Jumlah kunjungan undangan, jenis perangkat, dan waktu
          akses untuk ditampilkan pada dashboard pemilik undangan.
        </li>
      </ul>

      <h2>3. Penggunaan Informasi</h2>
      <ul>
        <li>Menyediakan editor undangan, publikasi tautan publik, dan manajemen RSVP real-time.</li>
        <li>Memverifikasi identitas pengguna serta keamanan portal Enterprise.</li>
        <li>Menyajikan statistik kunjungan dan kehadiran secara akurat di dashboard Anda.</li>
        <li>Mencegah penyalahgunaan, spam, atau akses tidak sah ke sistem.</li>
      </ul>

      <h2>4. Penyimpanan &amp; Infrastruktur Pihak Ketiga</h2>
      <p>Data disimpan secara aman menggunakan infrastruktur terpercaya:</p>
      <ul>
        <li><strong>Turso (LibSQL):</strong> Penyimpanan basis data akun, undangan, tamu, dan RSVP.</li>
        <li><strong>Cloudinary:</strong> Optimasi serta penyimpanan media foto dan audio undangan.</li>
        <li><strong>Vercel:</strong> Hosting, jaringan CDN global, dan enkripsi koneksi HTTPS.</li>
      </ul>

      <h2>5. Hak Anda atas Data Pribadi</h2>
      <p>
        Anda berhak mengakses, memperbarui, maupun meminta penghapusan akun serta seluruh data undangan
        Anda kapan saja dengan mengirimkan permintaan ke{" "}
        <a href="mailto:admin@ruanghadir.net">admin@ruanghadir.net</a>.
      </p>
    </SaasLegalShell>
  );
}
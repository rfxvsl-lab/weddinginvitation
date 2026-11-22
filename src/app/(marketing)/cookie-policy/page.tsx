import React from "react";
import type { Metadata } from "next";
import { SaasLegalShell } from "@/components/saas/SaasLegal";

export const metadata: Metadata = {
  title: "Kebijakan Cookie — RuangHadir.net",
  description:
    "Kebijakan Cookie RuangHadir.net — Penjelasan penggunaan cookie sesi dan preferensi di platform RuangHadir.",
};

export default function CookiePolicyPage() {
  return (
    <SaasLegalShell
      title="Kebijakan"
      accent="Cookie"
      updated="Terakhir diperbarui · November 2026"
    >
      <h2>1. Apa Itu Cookie?</h2>
      <p>
        Cookie adalah berkas teks kecil yang disimpan oleh peramban (browser) Anda saat mengakses
        RuangHadir.net. Kami menggunakan cookie secara minimal dan hanya untuk menjaga sesi masuk serta
        kenyamanan navigasi workspace.
      </p>

      <h2>2. Jenis Cookie yang Kami Gunakan</h2>
      <ul>
        <li>
          <strong>Cookie Sesi Autentikasi (Wajib):</strong> Menyimpan status login akun Gratis maupun
          Enterprise (<code>saas_user_session</code>) agar Anda tidak perlu masuk berulang kali saat
          mengelola dashboard.
        </li>
        <li>
          <strong>Preferensi Antarmuka:</strong> Menyimpan pengaturan tampilan lokal di peramban agar
          editor tetap responsif.
        </li>
      </ul>

      <h2>3. Pengelolaan Cookie</h2>
      <p>
        Anda dapat menghapus atau memblokir cookie kapan saja melalui pengaturan browser. Namun,
        menonaktifkan cookie sesi wajib dapat menyebabkan Anda tidak dapat masuk ke halaman dashboard
        pembuatan undangan.
      </p>

      <h2>4. Pertanyaan</h2>
      <p>
        Jika Anda memiliki pertanyaan mengenai penggunaan cookie di RuangHadir.net, silakan hubungi{" "}
        <a href="mailto:admin@ruanghadir.net">admin@ruanghadir.net</a>.
      </p>
    </SaasLegalShell>
  );
}
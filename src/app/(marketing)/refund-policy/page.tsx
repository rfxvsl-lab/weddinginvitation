import React from "react";
import type { Metadata } from "next";
import { SaasLegalShell } from "@/components/saas/SaasLegal";

export const metadata: Metadata = {
  title: "Kebijakan Pengembalian — RuangHadir.net",
  description: "Kebijakan Pengembalian Dana RuangHadir.net — Syarat dan ketentuan refund layanan undangan digital.",
};

export default function RefundPolicyPage() {
  return (
    <SaasLegalShell title="Kebijakan" accent="Pengembalian" updated="Terakhir diperbarui · 1 Januari 2025">
      <h2>1. Garansi Uang Kembali</h2>
      <p>
        RuangHadir.net memberikan garansi uang kembali selama <strong>7 (tujuh) hari kalender</strong> sejak tanggal
        pembayaran berhasil dikonfirmasi. Garansi ini berlaku untuk semua paket berbayar (Reguler, Premium, dan
        Luxury).
      </p>

      <h2>2. Syarat Pengembalian</h2>
      <p>Pengembalian dana dapat diajukan jika memenuhi <strong>semua</strong> syarat berikut:</p>
      <ul>
        <li>Permintaan diajukan dalam kurun waktu 7 hari sejak pembayaran.</li>
        <li>Undangan <strong>belum dipublish</strong> (belum pernah diakses oleh tamu).</li>
        <li>Akun belum digunakan untuk fitur &quot;Terima Beres&quot; (jika desain sudah dikerjakan tim kami, refund tidak berlaku).</li>
        <li>Tidak ada indikasi penyalahgunaan layanan.</li>
      </ul>

      <h2>3. Kondisi yang Tidak Dapat Direfund</h2>
      <ul>
        <li>Undangan sudah dipublish dan diakses oleh tamu.</li>
        <li>Permintaan diajukan setelah 7 hari dari tanggal pembayaran.</li>
        <li>Layanan &quot;Terima Beres&quot; yang desainnya sudah mulai dikerjakan.</li>
        <li>Paket Demo (karena gratis).</li>
        <li>Upgrade paket yang sudah diaktifkan dan digunakan.</li>
        <li>Perpanjangan masa aktif yang sudah berjalan.</li>
      </ul>

      <h2>4. Proses Pengajuan Refund</h2>
      <ol>
        <li>
          <strong>Hubungi tim kami</strong> melalui WhatsApp di nomor 085731021469 dengan menyebutkan:
          <ul>
            <li>Nama akun/email terdaftar</li>
            <li>Tanggal pembayaran</li>
            <li>Alasan pengembalian</li>
            <li>Bukti pembayaran (screenshot)</li>
          </ul>
        </li>
        <li><strong>Verifikasi</strong> — Tim kami akan memverifikasi kelengkapan syarat dalam 1×24 jam kerja.</li>
        <li><strong>Persetujuan</strong> — Jika disetujui, Anda akan menerima konfirmasi melalui WhatsApp.</li>
        <li><strong>Pencairan</strong> — Dana akan dikembalikan ke rekening bank yang Anda tentukan dalam 3–5 hari kerja.</li>
      </ol>

      <h2>5. Jumlah Pengembalian</h2>
      <ul>
        <li>Refund diberikan sebesar <strong>100% dari total pembayaran</strong> jika semua syarat terpenuhi.</li>
        <li>Biaya administrasi transfer bank (jika ada) ditanggung oleh pengguna.</li>
        <li>Pengembalian dilakukan dalam mata uang Rupiah (IDR) ke rekening bank Indonesia.</li>
      </ul>

      <h2>6. Pembatalan Layanan</h2>
      <p>
        Jika Anda ingin membatalkan layanan tanpa refund, Anda dapat berhenti menggunakan platform kapan saja. Data
        undangan Anda akan tetap tersimpan di server kami dan dapat diakses kembali jika Anda memutuskan untuk kembali
        menggunakan layanan.
      </p>

      <h2>7. Sengketa</h2>
      <p>
        Jika terjadi perbedaan pendapat mengenai kelayakan refund, kedua belah pihak akan menyelesaikan melalui
        musyawarah mufakat. Keputusan akhir berada di tangan tim RuangHadir.net berdasarkan bukti dan kondisi yang
        berlaku.
      </p>

      <h2>8. Hubungi Kami</h2>
      <p>Untuk mengajukan pengembalian dana atau pertanyaan terkait:</p>
      <ul>
        <li><strong>WhatsApp:</strong> 085731021469</li>
        <li><strong>Instagram:</strong> @ruanghadir_net</li>
        <li><strong>Jam Operasional:</strong> Senin–Sabtu, 09.00–21.00 WIB</li>
      </ul>
    </SaasLegalShell>
  );
}
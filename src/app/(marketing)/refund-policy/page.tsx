import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Pengembalian — RuangHadir.net",
  description: "Kebijakan Pengembalian Dana RuangHadir.net — Syarat dan ketentuan refund layanan undangan digital.",
};

export default function RefundPolicyPage() {
  return (
    <div className="py-32 px-6">
      <article className="max-w-3xl mx-auto prose prose-neutral">
        <header className="mb-16 not-prose">
          <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground block mb-4">Legal</span>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Kebijakan Pengembalian</h1>
          <p className="text-sm text-muted-foreground">Terakhir diperbarui: 1 Januari 2025</p>
        </header>

        <section className="space-y-8 text-[15px] leading-relaxed text-foreground/80">
          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">1. Garansi Uang Kembali</h2>
            <p>
              RuangHadir.net memberikan garansi uang kembali selama <strong>7 (tujuh) hari kalender</strong> sejak
              tanggal pembayaran berhasil dikonfirmasi. Garansi ini berlaku untuk semua paket berbayar
              (Reguler, Premium, dan Luxury).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">2. Syarat Pengembalian</h2>
            <p className="mb-3">Pengembalian dana dapat diajukan jika memenuhi <strong>semua</strong> syarat berikut:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Permintaan diajukan dalam kurun waktu 7 hari sejak pembayaran.</li>
              <li>Undangan <strong>belum dipublish</strong> (belum pernah diakses oleh tamu).</li>
              <li>Akun belum digunakan untuk fitur &quot;Terima Beres&quot; (jika desain sudah dikerjakan tim kami, refund tidak berlaku).</li>
              <li>Tidak ada indikasi penyalahgunaan layanan.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">3. Kondisi yang Tidak Dapat Direfund</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Undangan sudah dipublish dan diakses oleh tamu.</li>
              <li>Permintaan diajukan setelah 7 hari dari tanggal pembayaran.</li>
              <li>Layanan &quot;Terima Beres&quot; yang desainnya sudah mulai dikerjakan.</li>
              <li>Paket Demo (karena gratis).</li>
              <li>Upgrade paket yang sudah diaktifkan dan digunakan.</li>
              <li>Perpanjangan masa aktif yang sudah berjalan.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">4. Proses Pengajuan Refund</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong>Hubungi tim kami</strong> melalui WhatsApp di nomor 085731021469 dengan menyebutkan:
                <ul className="list-disc pl-6 mt-2 space-y-1">
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
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">5. Jumlah Pengembalian</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Refund diberikan sebesar <strong>100% dari total pembayaran</strong> jika semua syarat terpenuhi.</li>
              <li>Biaya administrasi transfer bank (jika ada) ditanggung oleh pengguna.</li>
              <li>Pengembalian dilakukan dalam mata uang Rupiah (IDR) ke rekening bank Indonesia.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">6. Pembatalan Layanan</h2>
            <p>
              Jika Anda ingin membatalkan layanan tanpa refund, Anda dapat berhenti menggunakan platform kapan saja.
              Data undangan Anda akan tetap tersimpan di server kami dan dapat diakses kembali jika Anda memutuskan
              untuk kembali menggunakan layanan.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">7. Sengketa</h2>
            <p>
              Jika terjadi perbedaan pendapat mengenai kelayakan refund, kedua belah pihak akan
              menyelesaikan melalui musyawarah mufakat. Keputusan akhir berada di tangan tim RuangHadir.net
              berdasarkan bukti dan kondisi yang berlaku.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">8. Hubungi Kami</h2>
            <p>
              Untuk mengajukan pengembalian dana atau pertanyaan terkait:
            </p>
            <ul className="list-none pl-0 space-y-1 mt-3">
              <li><strong>WhatsApp:</strong> 085731021469</li>
              <li><strong>Instagram:</strong> @ruanghadir_net</li>
              <li><strong>Jam Operasional:</strong> Senin–Sabtu, 09.00–21.00 WIB</li>
            </ul>
          </div>
        </section>
      </article>
    </div>
  );
}

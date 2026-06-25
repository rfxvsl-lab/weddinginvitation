import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ketentuan Layanan — RuangHadir.net",
  description: "Ketentuan Layanan RuangHadir.net — Syarat dan ketentuan penggunaan platform undangan digital.",
};

export default function TermsOfServicePage() {
  return (
    <div className="py-32 px-6">
      <article className="max-w-3xl mx-auto prose prose-neutral">
        <header className="mb-16 not-prose">
          <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground block mb-4">Legal</span>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Ketentuan Layanan</h1>
          <p className="text-sm text-muted-foreground">Terakhir diperbarui: 1 Januari 2025</p>
        </header>

        <section className="space-y-8 text-[15px] leading-relaxed text-foreground/80">
          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">1. Penerimaan Ketentuan</h2>
            <p>
              Dengan mengakses dan menggunakan layanan RuangHadir.net (&quot;Layanan&quot;), Anda menyetujui untuk terikat oleh
              Ketentuan Layanan ini. Jika Anda tidak menyetujui ketentuan ini, mohon untuk tidak menggunakan Layanan kami.
              RuangHadir.net dioperasikan oleh RFX Visual.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">2. Deskripsi Layanan</h2>
            <p>
              RuangHadir.net menyediakan platform pembuatan undangan pernikahan digital yang mencakup:
              desain template undangan, manajemen daftar tamu dan RSVP, amplop digital, analytics pengunjung,
              QR code check-in, dan fitur lainnya sesuai paket yang dipilih.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">3. Pendaftaran Akun</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Anda harus berusia minimal 17 tahun untuk menggunakan Layanan.</li>
              <li>Informasi yang Anda berikan saat pendaftaran harus akurat dan lengkap.</li>
              <li>Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda.</li>
              <li>Satu akun hanya boleh digunakan oleh satu pengguna.</li>
              <li>Kami berhak menangguhkan atau menghapus akun yang melanggar ketentuan.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">4. Paket Layanan & Pembayaran</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Paket Demo:</strong> Gratis dengan fitur terbatas. Masa aktif 3 hari. Tidak dapat dipublish.</li>
              <li><strong>Paket Reguler:</strong> Mulai dari Rp 35.000 (Buat Sendiri). Masa aktif 20 hari.</li>
              <li><strong>Paket Premium:</strong> Mulai dari Rp 90.000 (Buat Sendiri). Masa aktif 60 hari.</li>
              <li><strong>Paket Luxury:</strong> Mulai dari Rp 150.000 (Buat Sendiri). Masa aktif 90 hari.</li>
              <li>Harga dapat berubah sewaktu-waktu dengan pemberitahuan sebelumnya.</li>
              <li>Pembayaran dilakukan melalui QRIS atau Virtual Account via Pakasir.</li>
              <li>Pembayaran bersifat satu kali (one-time) per paket, bukan langganan bulanan.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">5. Masa Aktif & Perpanjangan</h2>
            <p>
              Setiap paket berbayar memiliki masa aktif yang dihitung sejak undangan diaktifkan.
              Setelah masa aktif berakhir, undangan Anda tidak lagi dapat diakses publik hingga diperpanjang.
              Perpanjangan dapat dilakukan melalui dashboard dengan membayar biaya sesuai paket.
              Data undangan Anda tetap tersimpan meskipun masa aktif telah berakhir.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">6. Konten Pengguna</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Anda bertanggung jawab penuh atas konten yang Anda unggah (foto, teks, informasi).</li>
              <li>Konten tidak boleh mengandung unsur SARA, pornografi, kekerasan, atau materi ilegal.</li>
              <li>Anda menjamin bahwa Anda memiliki hak atas semua konten yang diunggah.</li>
              <li>Kami berhak menghapus konten yang melanggar ketentuan tanpa pemberitahuan.</li>
              <li>Hak kepemilikan konten tetap menjadi milik Anda. Kami hanya menggunakan konten untuk menyediakan Layanan.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">7. Pembatasan Penggunaan</h2>
            <p className="mb-3">Anda dilarang menggunakan Layanan untuk:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tujuan komersial selain yang dimaksudkan (menjual kembali akses, dll).</li>
              <li>Mengirim spam, phishing, atau konten berbahaya melalui undangan.</li>
              <li>Mengakses atau memodifikasi sistem kami tanpa izin.</li>
              <li>Menggunakan bot atau skrip otomatis untuk mengakses Layanan.</li>
              <li>Memalsukan identitas atau menyamar sebagai pihak lain.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">8. Ketersediaan Layanan</h2>
            <p>
              Kami berupaya menjaga ketersediaan Layanan 24/7, namun tidak menjamin uptime 100%.
              Kami dapat melakukan pemeliharaan terjadwal yang mungkin menyebabkan gangguan sementara.
              Kami tidak bertanggung jawab atas kerugian akibat gangguan layanan di luar kendali kami
              (force majeure, kegagalan infrastruktur pihak ketiga, dll).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">9. Batasan Tanggung Jawab</h2>
            <p>
              Layanan disediakan &quot;sebagaimana adanya&quot; (as is). Kami tidak memberikan jaminan tersurat maupun tersirat
              mengenai kesesuaian untuk tujuan tertentu. Total tanggung jawab kami dalam keadaan apapun tidak akan
              melebihi jumlah yang Anda bayarkan kepada kami dalam 12 bulan terakhir.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">10. Perubahan Ketentuan</h2>
            <p>
              Kami dapat mengubah Ketentuan Layanan ini kapan saja. Perubahan material akan diberitahukan
              melalui email atau notifikasi di platform minimal 14 hari sebelum berlaku efektif.
              Penggunaan berkelanjutan setelah perubahan berlaku dianggap sebagai persetujuan Anda.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">11. Hukum yang Berlaku</h2>
            <p>
              Ketentuan Layanan ini diatur oleh dan ditafsirkan sesuai hukum Republik Indonesia.
              Setiap sengketa yang timbul akan diselesaikan melalui musyawarah mufakat terlebih dahulu,
              dan jika tidak tercapai, akan diselesaikan melalui pengadilan yang berwenang di Indonesia.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">12. Hubungi Kami</h2>
            <p>
              Untuk pertanyaan terkait Ketentuan Layanan ini:
            </p>
            <ul className="list-none pl-0 space-y-1 mt-3">
              <li><strong>WhatsApp:</strong> 085731021469</li>
              <li><strong>Instagram:</strong> @ruanghadir_net</li>
              <li><strong>Website:</strong> ruanghadir.net/contact</li>
            </ul>
          </div>
        </section>
      </article>
    </div>
  );
}

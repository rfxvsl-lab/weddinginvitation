import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — RuangHadir.net",
  description: "Kebijakan Privasi RuangHadir.net — Bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-32 px-6">
      <article className="max-w-3xl mx-auto prose prose-neutral">
        <header className="mb-16 not-prose">
          <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground block mb-4">Legal</span>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Kebijakan Privasi</h1>
          <p className="text-sm text-muted-foreground">Terakhir diperbarui: 1 Januari 2025</p>
        </header>

        <section className="space-y-8 text-[15px] leading-relaxed text-foreground/80">
          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">1. Pendahuluan</h2>
            <p>
              RuangHadir.net (&quot;kami&quot;, &quot;milik kami&quot;, atau &quot;RuangHadir&quot;) yang dioperasikan oleh RFX Visual,
              berkomitmen untuk melindungi privasi pengguna kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan,
              menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat menggunakan layanan kami.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">2. Informasi yang Kami Kumpulkan</h2>
            <p className="mb-3">Kami mengumpulkan informasi berikut saat Anda mendaftar dan menggunakan layanan:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Data Akun:</strong> Nama lengkap, alamat email, nomor telepon, dan kata sandi (terenkripsi).</li>
              <li><strong>Data Undangan:</strong> Informasi pernikahan yang Anda masukkan seperti nama pasangan, tanggal acara, lokasi, foto galeri, dan daftar tamu.</li>
              <li><strong>Data Pembayaran:</strong> Informasi transaksi yang diproses melalui penyedia pembayaran pihak ketiga (Pakasir). Kami tidak menyimpan detail kartu kredit Anda.</li>
              <li><strong>Data Penggunaan:</strong> Statistik kunjungan undangan, waktu akses, dan interaksi pengguna untuk keperluan analytics dashboard.</li>
              <li><strong>Data Perangkat:</strong> Jenis browser, sistem operasi, alamat IP, dan informasi perangkat lainnya yang dikumpulkan secara otomatis.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">3. Penggunaan Informasi</h2>
            <p className="mb-3">Informasi yang kami kumpulkan digunakan untuk:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Menyediakan, memelihara, dan meningkatkan layanan undangan digital.</li>
              <li>Memproses pembayaran dan mengelola langganan akun Anda.</li>
              <li>Menampilkan statistik kunjungan undangan di dashboard Anda.</li>
              <li>Mengirimkan notifikasi terkait layanan, pembaruan fitur, dan informasi penting.</li>
              <li>Mendeteksi, mencegah, dan mengatasi masalah teknis serta keamanan.</li>
              <li>Merespons pertanyaan dan memberikan dukungan pelanggan.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">4. Penyimpanan Data</h2>
            <p>
              Data Anda disimpan di server yang dikelola oleh Turso (LibSQL) dengan enkripsi standar industri.
              Foto dan media disimpan melalui layanan Cloudinary dengan keamanan tingkat enterprise.
              Kami menyimpan data Anda selama akun Anda aktif atau selama diperlukan untuk menyediakan layanan.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">5. Layanan Pihak Ketiga</h2>
            <p className="mb-3">Kami menggunakan layanan pihak ketiga berikut:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Turso (LibSQL):</strong> Database untuk penyimpanan data aplikasi.</li>
              <li><strong>Cloudinary:</strong> Hosting dan optimasi gambar/media.</li>
              <li><strong>Pakasir:</strong> Pemrosesan pembayaran (QRIS, Virtual Account).</li>
              <li><strong>Vercel:</strong> Hosting dan deployment aplikasi web.</li>
            </ul>
            <p className="mt-3">
              Setiap layanan pihak ketiga memiliki kebijakan privasi mereka sendiri. Kami menyarankan Anda untuk meninjau kebijakan mereka.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">6. Keamanan Data</h2>
            <p>
              Kami menerapkan langkah-langkah keamanan teknis dan organisasional yang wajar untuk melindungi data pribadi Anda,
              termasuk enkripsi password, koneksi HTTPS, dan pembatasan akses. Namun, tidak ada metode transmisi internet
              yang 100% aman, dan kami tidak dapat menjamin keamanan absolut.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">7. Hak Pengguna</h2>
            <p className="mb-3">Anda memiliki hak untuk:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mengakses dan mendapatkan salinan data pribadi Anda.</li>
              <li>Memperbarui atau memperbaiki informasi yang tidak akurat.</li>
              <li>Meminta penghapusan akun dan data pribadi Anda.</li>
              <li>Menarik persetujuan penggunaan data kapan saja.</li>
            </ul>
            <p className="mt-3">
              Untuk menggunakan hak-hak ini, silakan hubungi kami melalui WhatsApp di nomor 085731021469
              atau email di support@ruanghadir.net.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">8. Perubahan Kebijakan</h2>
            <p>
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan material akan diberitahukan
              melalui email atau notifikasi di platform. Penggunaan berkelanjutan setelah perubahan dipublikasikan
              dianggap sebagai penerimaan terhadap kebijakan yang diperbarui.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">9. Hubungi Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami:
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

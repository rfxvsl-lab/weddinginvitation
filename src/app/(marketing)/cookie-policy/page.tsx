import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Cookie — RuangHadir.net",
  description: "Kebijakan Cookie RuangHadir.net — Informasi tentang penggunaan cookie di platform kami.",
};

export default function CookiePolicyPage() {
  return (
    <div className="py-32 px-6">
      <article className="max-w-3xl mx-auto prose prose-neutral">
        <header className="mb-16 not-prose">
          <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground block mb-4">Legal</span>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Kebijakan Cookie</h1>
          <p className="text-sm text-muted-foreground">Terakhir diperbarui: 1 Januari 2025</p>
        </header>

        <section className="space-y-8 text-[15px] leading-relaxed text-foreground/80">
          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">1. Apa Itu Cookie?</h2>
            <p>
              Cookie adalah file teks kecil yang disimpan di perangkat Anda (komputer, tablet, atau smartphone)
              saat Anda mengunjungi sebuah situs web. Cookie membantu situs web mengingat preferensi Anda
              dan meningkatkan pengalaman browsing Anda.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">2. Jenis Cookie yang Kami Gunakan</h2>

            <h3 className="text-lg font-medium text-foreground mb-2 mt-6">a. Cookie Esensial</h3>
            <p>
              Cookie ini diperlukan agar situs web dapat berfungsi dengan baik. Termasuk cookie untuk autentikasi sesi
              (login), keamanan, dan preferensi dasar. Cookie ini tidak dapat dinonaktifkan tanpa mempengaruhi
              fungsionalitas situs.
            </p>

            <h3 className="text-lg font-medium text-foreground mb-2 mt-6">b. Cookie Fungsional</h3>
            <p>
              Cookie ini memungkinkan situs mengingat pilihan yang Anda buat (seperti preferensi tema, bahasa,
              atau pengaturan dashboard) untuk memberikan pengalaman yang lebih personal.
            </p>

            <h3 className="text-lg font-medium text-foreground mb-2 mt-6">c. Cookie Analitik</h3>
            <p>
              Cookie ini mengumpulkan informasi tentang bagaimana pengunjung menggunakan situs web,
              seperti halaman yang paling sering dikunjungi dan durasi kunjungan. Data ini digunakan
              untuk meningkatkan performa dan pengalaman pengguna. Kami menggunakan data ini secara
              anonim dan agregat.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">3. Cookie Pihak Ketiga</h2>
            <p className="mb-3">Beberapa cookie di situs kami berasal dari layanan pihak ketiga:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cloudinary:</strong> Untuk loading dan caching gambar yang optimal.</li>
              <li><strong>Vercel Analytics:</strong> Untuk mengumpulkan data performa situs secara anonim.</li>
            </ul>
            <p className="mt-3">
              Kami tidak menggunakan cookie pelacakan iklan (advertising cookies) dan tidak menjual data cookie Anda
              kepada pihak ketiga manapun.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">4. Mengelola Cookie</h2>
            <p className="mb-3">Anda dapat mengelola cookie melalui pengaturan browser Anda:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google Chrome:</strong> Settings → Privacy and Security → Cookies</li>
              <li><strong>Mozilla Firefox:</strong> Options → Privacy & Security → Cookies</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
              <li><strong>Microsoft Edge:</strong> Settings → Privacy, Search, and Services → Cookies</li>
            </ul>
            <p className="mt-3">
              Perlu diingat bahwa memblokir cookie esensial dapat mempengaruhi fungsionalitas situs,
              termasuk kemampuan untuk login dan menggunakan dashboard.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">5. Durasi Cookie</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cookie Sesi:</strong> Dihapus secara otomatis saat Anda menutup browser.</li>
              <li><strong>Cookie Persisten:</strong> Tetap di perangkat Anda hingga kedaluwarsa atau Anda menghapusnya secara manual. Cookie autentikasi kami berlaku hingga 30 hari.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">6. Perubahan Kebijakan</h2>
            <p>
              Kami dapat memperbarui Kebijakan Cookie ini jika ada perubahan dalam penggunaan cookie
              atau teknologi baru. Perubahan akan dipublikasikan di halaman ini.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground mb-4">7. Hubungi Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan tentang penggunaan cookie kami:
            </p>
            <ul className="list-none pl-0 space-y-1 mt-3">
              <li><strong>WhatsApp:</strong> 085731021469</li>
              <li><strong>Instagram:</strong> @ruanghadir_net</li>
            </ul>
          </div>
        </section>
      </article>
    </div>
  );
}

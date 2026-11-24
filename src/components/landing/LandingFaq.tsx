import React from "react";
import { Plus } from "lucide-react";
import { ENTERPRISE_CONTACT_EMAIL, PACKAGE_LIMITS } from "@/lib/packageLimits";

const FAQS = [
  {
    q: "Apa itu Akses Awal?",
    a: "Akses Awal adalah pendaftaran untuk mencoba RuangHadir secara gratis. Isi formulir, lalu tim kami meninjau pendaftaran. Akun belum bisa membuka dashboard sebelum disetujui.",
  },
  {
    q: "Kapan akun saya dapat digunakan?",
    a: `Setelah disetujui, tim kami akan mengabari melalui kontak yang kalian daftarkan. Waktu peninjauan belum ditetapkan. Kalian juga bisa mencoba masuk kembali untuk melihat status, atau menghubungi ${ENTERPRISE_CONTACT_EMAIL}.`,
  },
  {
    q: "Apa saja yang termasuk, dan berapa lama aktif?",
    a: `Akses Awal Rp0 mencakup semua tema, tamu tanpa batas, RSVP, amplop digital, check in QR, galeri, musik, serta ekspor CSV/PDF tanpa watermark. Maksimal ${PACKAGE_LIMITS.free.maxProjects} undangan aktif, dengan masa aktif ${PACKAGE_LIMITS.free.activeDays} hari sejak undangan diaktifkan.`,
  },
  {
    q: "Apakah tamu perlu memasang aplikasi?",
    a: "Tidak. Tamu cukup membuka tautan undangan di browser HP atau komputer. Nama mereka dapat ditampilkan melalui tautan personal yang kalian siapkan.",
  },
  {
    q: "Bisa mengganti tema atau jadwal setelah dibagikan?",
    a: "Bisa. Ubah data dari dashboard lalu simpan perubahan. Kalian dapat memakai tema lain tanpa mengetik ulang cerita dan data acara. Tamu tetap membuka tautan undangan yang sama.",
  },
  {
    q: "Bagaimana amplop digital bekerja?",
    a: "Kalian menampilkan informasi rekening, dompet digital, QRIS, atau alamat pengiriman kado. Tamu melakukan transfer melalui layanan pembayaran mereka sendiri; RuangHadir tidak menampung dana hadiah.",
  },
  {
    q: "Bagaimana mendapat akses Enterprise?",
    a: `Hubungi ${ENTERPRISE_CONTACT_EMAIL} untuk mendiskusikan kebutuhan. Setelah disetujui, tim menerbitkan kode akses yang terikat dengan domain email perusahaan.`,
  },
];

export function LandingFaq() {
  return (
    <section id="faq" className="rh-faq-section" aria-labelledby="faq-heading">
      <div className="rh-marketing-container rh-faq-layout">
        <div>
          <p className="rh-eyebrow">SEBELUM MULAI</p>
          <h2 id="faq-heading">Masih ada yang ingin ditanyakan?</h2>
          <p className="rh-faq-contact">
            Kami bisa bantu melalui{" "}
            <a href={`mailto:${ENTERPRISE_CONTACT_EMAIL}`}>
              {ENTERPRISE_CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
        <div className="rh-faq-list">
          {FAQS.map(({ q, a }) => (
            <details key={q}>
              <summary>
                {q}
                <Plus size={18} aria-hidden />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

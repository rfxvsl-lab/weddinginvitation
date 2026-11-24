import React from "react";

const FEATURES = [
  {
    phase: "Saat menyiapkan",
    title: "Cerita kalian, lengkap dengan detailnya.",
    items: [
      [
        "Galeri, cerita, dan musik",
        "Lengkapi undangan dengan foto, perjalanan berdua, dan lagu pilihan kalian.",
      ],
      [
        "Jadwal dan lokasi acara",
        "Satukan informasi akad dan resepsi, petunjuk arah, serta pengingat kalender.",
      ],
    ],
  },
  {
    phase: "Saat membagikan",
    title: "Satu undangan, sapaan yang personal.",
    items: [
      [
        "Nama tamu di tautan",
        "Siapkan tautan untuk setiap nama dan pesan pengantar yang bisa kalian kirim lewat WhatsApp.",
      ],
      [
        "RSVP dan amplop digital",
        "Tamu dapat mengisi konfirmasi, meninggalkan ucapan, dan melihat informasi rekening atau alamat kado.",
      ],
    ],
  },
  {
    phase: "Saat hari H tiba",
    title: "Lebih mudah menyambut yang hadir.",
    items: [
      [
        "Check in dengan QR",
        "Pindai kode tamu melalui kamera HP untuk mencatat kehadiran di lokasi acara.",
      ],
      [
        "Rekap yang bisa dibawa",
        "Lihat konfirmasi dan catatan check in. Unduh daftar tamu dalam format CSV atau PDF.",
      ],
    ],
  },
];

export function LandingFeatures() {
  return (
    <section
      id="fitur"
      className="rh-features-section"
      aria-labelledby="features-heading"
    >
      <div className="rh-marketing-container">
        <div className="rh-marketing-section-heading">
          <div>
            <p className="rh-eyebrow">DETAIL KECIL, BANYAK MEMBANTU</p>
            <h2 id="features-heading">Bukan hanya cantik saat dibuka.</h2>
          </div>
          <p>
            Kalian mengelola undangannya. Tamu cukup membuka tautan di browser,
            tanpa memasang aplikasi.
          </p>
        </div>
        <div className="rh-feature-phases">
          {FEATURES.map((phase, index) => (
            <article key={phase.phase}>
              <div className="rh-feature-phase-heading">
                <p>
                  <span aria-hidden>0{index + 1}</span>
                  {phase.phase}
                </p>
                <h3>{phase.title}</h3>
              </div>
              <dl>
                {phase.items.map(([title, body]) => (
                  <div key={title}>
                    <dt>{title}</dt>
                    <dd>{body}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

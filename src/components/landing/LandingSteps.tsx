import React from "react";

const STEPS = [
  {
    title: "Siapkan undangannya",
    body: "Setelah Akses Awal disetujui, pilih tema dan lengkapi nama, jadwal, lokasi, serta foto. Lihat hasilnya sambil mengisi.",
  },
  {
    title: "Bagikan kabar baiknya",
    body: "Tambahkan nama tamu, terbitkan undangan, lalu salin tautan personal atau buka pesan pengantarnya di WhatsApp.",
  },
  {
    title: "Sambut orang tersayang",
    body: "Baca konfirmasi kehadiran dan ucapan dari tamu. Di hari H, gunakan check in QR untuk mencatat kedatangan.",
  },
];

export function LandingSteps() {
  return (
    <section
      id="cara-kerja"
      className="rh-steps-section"
      aria-labelledby="steps-heading"
    >
      <div className="rh-marketing-container">
        <div className="rh-marketing-section-heading">
          <div>
            <p className="rh-eyebrow">DARI PERSIAPAN SAMPAI HARI H</p>
            <h2 id="steps-heading">Satu tempat, tiga langkah.</h2>
          </div>
          <p>
            Agar kabar bahagia sampai ke setiap tamu, dan kalian punya lebih
            banyak waktu untuk menyiapkan harinya.
          </p>
        </div>
        <ol className="rh-steps-list">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span aria-hidden>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

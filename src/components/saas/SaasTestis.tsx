"use client";
import React from "react";
import Link from "next/link";
import {
  Heart,
  Crown,
  Sparkles,
  CalendarHeart,
  ArrowUpRight,
} from "lucide-react";

const USE_CASES = [
  {
    icon: Heart,
    badge: "Intimate & Minimalis",
    title: "Akad Nikah & Resepsi Hangat",
    desc: "Cocok untuk acara keluarga inti dengan tampilan bersih, fokus pada jadwal, peta lokasi, dan ucapan doa yang penuh makna.",
    themeId: "cremy-rose",
    themeLabel: "Luxury Pink Elegant",
  },
  {
    icon: Crown,
    badge: "Budaya Nusantara",
    title: "Pernikahan Adat Jawa & Klasik",
    desc: "Sentuhan ornamen tradisi yang anggun dipadukan dengan kemudahan buku tamu digital dan navigasi modern di ponsel tamu.",
    themeId: "javanese-classic",
    themeLabel: "Javanese Classic",
  },
  {
    icon: Sparkles,
    badge: "Modern & Sinematik",
    title: "Grand Ballroom & Cinematic",
    desc: "Visual gelap mewah bergaya editorial lengkap dengan galeri foto penuh, musik latar, serta tiket QR check-in untuk tamu undangan.",
    themeId: "rfx-dark",
    themeLabel: "Dark Luxury Cinematic",
  },
  {
    icon: CalendarHeart,
    badge: "Unik & Personal",
    title: "Konsep Kreatif & Interaktif",
    desc: "Tampilkan perjalanan cinta kalian dengan gaya playlist musik, katalog film, atau buku cerita interaktif yang berkesan.",
    themeId: "spotilove",
    themeLabel: "SpotiLove Playlist",
  },
];

export function SaasTestis() {
  return (
    <section id="testimoni" className="saas-shell pt-24">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-[620px]">
          <p className="saas-kicker">Fleksibel untuk setiap gaya</p>
          <h2 className="mt-3.5 text-[32px] leading-[1.08] sm:text-[42px]">
            Dirancang untuk berbagai{" "}
            <span className="saas-serif-i" style={{ color: "var(--saas-wine)" }}>
              konsep acara
            </span>
            .
          </h2>
        </div>
        <Link
          href="/rian-salsa?to=Tamu%20Kehormatan&code=W-TAMU"
          target="_blank"
          className="saas-btn-outline self-start md:self-auto"
        >
          Buka Contoh Undangan <ArrowUpRight size={15} />
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {USE_CASES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="saas-card saas-card-hover flex flex-col justify-between p-6"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="saas-icon-box">
                    <Icon size={19} />
                  </span>
                  <span className="saas-badge saas-badge-gold !text-[10px]">
                    {item.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-[16.5px] font-extrabold leading-snug">
                  {item.title}
                </h3>
                <p
                  className="mt-2 text-[13.5px] leading-relaxed"
                  style={{ color: "var(--saas-ink-2)" }}
                >
                  {item.desc}
                </p>
              </div>

              <div
                className="mt-5 border-t pt-4"
                style={{ borderColor: "var(--saas-line)" }}
              >
                <Link
                  href={`/preview/${item.themeId}`}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-bold transition-colors hover:underline"
                  style={{ color: "var(--saas-wine)" }}
                >
                  Lihat tema {item.themeLabel} <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

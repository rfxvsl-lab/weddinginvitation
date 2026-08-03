"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  PiShieldCheckDuotone,
  PiPaintBrushDuotone,
  PiLightningDuotone,
  PiUsersFourDuotone,
  PiHeadsetDuotone,
  PiCertificateDuotone,
} from "react-icons/pi";

const VALUES = [
  {
    icon: PiCertificateDuotone,
    title: "Kualitas Tanpa Kompromi",
    description: "Setiap template dirancang oleh desainer profesional dengan standar editorial tinggi. Bukan template massal — setiap pixel diperhitungkan.",
  },
  {
    icon: PiShieldCheckDuotone,
    title: "Privasi & Keamanan",
    description: "Data tamu dan informasi pribadi Anda dilindungi dengan enkripsi standar industri. Server terpercaya dengan uptime 99.9%.",
  },
  {
    icon: PiPaintBrushDuotone,
    title: "Desain Editorial",
    description: "Terinspirasi dari majalah pernikahan kelas atas. Template kami tampil elegan di semua perangkat — dari smartphone hingga desktop.",
  },
  {
    icon: PiLightningDuotone,
    title: "Performa Optimal",
    description: "Dibangun dengan teknologi web terkini. Loading cepat, animasi halus, dan pengalaman browsing yang menyenangkan bagi tamu Anda.",
  },
  {
    icon: PiUsersFourDuotone,
    title: "Dashboard Intuitif",
    description: "Kelola tamu, pantau RSVP, dan kustomisasi undangan dari satu tempat. Tidak perlu keahlian teknis — semua bisa dilakukan dalam hitungan menit.",
  },
  {
    icon: PiHeadsetDuotone,
    title: "Support Responsif",
    description: "Tim kami siap membantu via WhatsApp setiap Senin–Sabtu, 09.00–21.00 WIB. Pertanyaan Anda dijawab dengan cepat dan tuntas.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground block mb-4">Tentang Kami</span>
            <h1 className="text-4xl md:text-6xl font-serif mb-8">
              Menghadirkan keindahan<br/>
              <span className="italic text-muted-foreground">dalam setiap undangan.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              RuangHadir.net adalah platform undangan pernikahan digital premium buatan Indonesia.
              Kami hadir untuk membantu pasangan modern menciptakan undangan yang elegan,
              fungsional, dan tak terlupakan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 px-6 border-y border-border bg-secondary/30">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground block mb-4">Cerita Kami</span>
            <h2 className="text-3xl font-serif mb-6">Berawal dari kebutuhan, tumbuh menjadi solusi.</h2>
            <div className="space-y-4 text-[15px] text-muted-foreground leading-relaxed">
              <p>
                RuangHadir.net lahir dari pengalaman langsung — frustrasi dengan undangan digital
                yang desainnya kurang premium, fiturnya terbatas, dan harganya tidak masuk akal.
              </p>
              <p>
                Kami di RFX Visual, tim kreatif yang berpengalaman dalam dunia visual dan teknologi,
                memutuskan untuk menciptakan platform yang kami sendiri ingin gunakan: simpel namun powerful,
                dengan desain yang benar-benar editorial dan fitur manajemen tamu yang lengkap.
              </p>
              <p>
                Hasilnya adalah RuangHadir.net — platform yang menggabungkan estetika tinggi dengan
                kemudahan penggunaan, dan harga yang terjangkau untuk semua kalangan.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden">
            <img
              src="/about-hero.png"
              alt="RuangHadir creative workspace design"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground block mb-4">Kenapa Kami</span>
            <h2 className="text-4xl font-serif">Yang membedakan RuangHadir.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 border border-border bg-card group hover:bg-secondary transition-colors duration-500"
                >
                  <Icon className="w-7 h-7 mb-6 text-primary/60 group-hover:text-primary transition-colors" />
                  <h3 className="text-lg font-serif mb-3">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6 border-y border-border bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: "2.500+", label: "Pasangan Terlayani" },
              { val: "15.000+", label: "Undangan Terkirim" },
              { val: "10+", label: "Template Premium" },
              { val: "4.9/5", label: "Rating Kepuasan" },
            ].map((s, i) => (
              <div key={i}>
                <span className="text-3xl md:text-4xl font-serif mb-2 block">{s.val}</span>
                <span className="text-xs tracking-widest uppercase text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-serif mb-8">
            Siap berkenalan lebih dekat?
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-md mx-auto">
            Hubungi kami untuk konsultasi gratis atau langsung coba platform kami.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth" className="bg-primary text-primary-foreground px-10 py-4 text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors">
              Coba Gratis
            </Link>
            <Link href="/contact" className="border border-border px-10 py-4 text-sm tracking-widest uppercase hover:bg-secondary transition-colors">
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

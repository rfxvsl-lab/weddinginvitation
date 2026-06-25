"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mail, MapPin, Clock, Instagram, Send } from "lucide-react";
import Link from "next/link";

const CONTACT_CHANNELS = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Cara tercepat untuk menghubungi kami. Respons dalam hitungan menit.",
    action: "Chat Sekarang",
    href: "https://wa.me/6285731021469?text=Halo%20RuangHadir%2C%20saya%20ingin%20bertanya%20tentang%20undangan%20digital",
    detail: "085731021469",
  },
  {
    icon: Instagram,
    title: "Instagram",
    description: "Follow kami untuk inspirasi desain undangan dan update terbaru.",
    action: "Follow @ruanghadir_net",
    href: "https://instagram.com/ruanghadir_net",
    detail: "@ruanghadir_net",
  },
  {
    icon: Send,
    title: "TikTok",
    description: "Lihat video tutorial, behind the scenes, dan tips pernikahan.",
    action: "Follow @rfxvisual",
    href: "https://tiktok.com/@rfxvisual",
    detail: "@rfxvisual",
  },
];

export default function ContactPage() {
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
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground block mb-4">Hubungi Kami</span>
            <h1 className="text-4xl md:text-6xl font-serif mb-8">
              Kami senang<br/>
              <span className="italic text-muted-foreground">mendengar dari Anda.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Punya pertanyaan, butuh bantuan, atau ingin konsultasi tentang undangan impian Anda?
              Tim kami siap membantu.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="pb-32 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {CONTACT_CHANNELS.map((ch, i) => {
            const Icon = ch.icon;
            return (
              <motion.a
                key={i}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 border border-border bg-card hover:bg-secondary transition-all duration-500 block"
              >
                <Icon className="w-6 h-6 mb-6 text-primary/60 group-hover:text-primary transition-colors" />
                <h3 className="text-lg font-serif mb-2">{ch.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{ch.description}</p>
                <p className="text-xs text-muted-foreground mb-4 font-mono">{ch.detail}</p>
                <span className="inline-block text-xs tracking-widest uppercase font-medium text-primary group-hover:underline">
                  {ch.action} →
                </span>
              </motion.a>
            );
          })}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 px-6 border-y border-border bg-secondary/30">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-2xl font-serif mb-6">Jam Operasional</h2>
            <div className="space-y-4 text-[15px] text-muted-foreground">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-1 shrink-0 text-primary/60" />
                <div>
                  <p className="text-foreground font-medium">Senin — Sabtu</p>
                  <p>09.00 — 21.00 WIB</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-1 shrink-0 text-primary/60" />
                <div>
                  <p className="text-foreground font-medium">Minggu & Hari Libur</p>
                  <p>Tutup (pesan via WhatsApp tetap dibalas)</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-serif mb-6">Pertanyaan Umum</h2>
            <div className="space-y-4 text-[15px] text-muted-foreground leading-relaxed">
              <p>
                Sebelum menghubungi kami, Anda mungkin menemukan jawaban di halaman
                {" "}<Link href="/#faq" className="text-primary hover:underline">FAQ</Link> kami.
              </p>
              <p>
                Untuk pertanyaan terkait pembayaran dan refund, silakan siapkan bukti
                pembayaran dan email akun Anda agar kami bisa membantu lebih cepat.
              </p>
              <p>
                Jika Anda tertarik dengan paket &quot;Terima Beres&quot;, kami akan menghubungkan
                Anda langsung dengan tim desainer RFX Visual.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-serif mb-6">Lebih suka langsung ngobrol?</h2>
          <p className="text-muted-foreground mb-10">
            Klik tombol di bawah untuk chat langsung dengan tim kami via WhatsApp.
          </p>
          <a
            href="https://wa.me/6285731021469?text=Halo%20RuangHadir%2C%20saya%20ingin%20bertanya%20tentang%20undangan%20digital"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary text-primary-foreground px-10 py-4 text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors"
          >
            Chat via WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}

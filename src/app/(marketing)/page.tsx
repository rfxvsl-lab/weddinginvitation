"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronDown, ArrowRight, X } from "lucide-react";
import {
  PiSwatchesDuotone,
  PiCheckSquareOffsetDuotone,
  PiWalletDuotone,
  PiQrCodeDuotone,
  PiTimerDuotone,
  PiCalendarCheckDuotone,
  PiCheckCircleDuotone,
  PiCrownDuotone,
} from "react-icons/pi";

import { DEFAULT_THEMES } from "@/data/defaultData";
import { PACKAGE_PRICES, PACKAGE_LIMITS, formatLimit, formatActiveDays } from "@/lib/packageLimits";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: PiSwatchesDuotone,
    title: "Katalog Tema Eksklusif",
    description: "Pilih dari puluhan desain premium yang disesuaikan untuk setiap konsep pernikahan modern.",
  },
  {
    icon: PiCheckSquareOffsetDuotone,
    title: "Manajemen Tamu (RSVP)",
    description: "Kirim undangan digital berkelas dan pantau respons kehadiran di dashboard real-time.",
  },
  {
    icon: PiWalletDuotone,
    title: "Amplop Digital",
    description: "Terima hadiah pernikahan langsung melalui transfer bank atau E-Wallet tanpa potongan.",
  },
  {
    icon: PiQrCodeDuotone,
    title: "Scan QR Code Kehadiran",
    description: "Fitur check-in tamu otomatis saat di venue menggunakan kode QR unik.",
  },
  {
    icon: PiTimerDuotone,
    title: "Hitung Mundur",
    description: "Animasi hitung mundur dinamis yang memberikan kesan eksklusif untuk hari H Anda.",
  },
  {
    icon: PiCalendarCheckDuotone,
    title: "Pengingat Kalender",
    description: "Tamu dapat menambahkan jadwal acara langsung ke Google Calendar atau Apple Calendar.",
  },

];

const TESTIMONIALS = [
  {
    quote: "Desainnya sangat luar biasa elegan! Teman-teman saya memuji undangan kami karena terlihat sangat mewah dan mahal.",
    name: "Amanda & Rendy",
    wedding: "Bali, Indonesia",
    image: "https://lh3.googleusercontent.com/d/1dpdXyT2do6IDb2s-95j-a8YMTcquYtq9"
  },
  {
    quote: "Fitur dashboard-nya sangat membantu saya memantau siapa saja yang akan hadir. Benar-benar the new standard of wedding tech.",
    name: "Clarissa & Daniel",
    wedding: "Jakarta, Indonesia",
    image: "https://lh3.googleusercontent.com/d/16xYmmIEtDjiJiSE9Gox8UcpIcCn6k8Rm"
  },
  {
    quote: "Harga sangat terjangkau untuk fitur yang begitu lengkap. Sangat puas dengan hasil dan layanannya.",
    name: "Sarah & Kevin",
    wedding: "Bandung, Indonesia",
    image: "https://lh3.googleusercontent.com/d/1tOhjvgghKdeW5VuvjYldVdJT2TdNdZKS"
  },
];

const GALLERY_IMAGES = [
  "https://lh3.googleusercontent.com/d/1RIEjBvUOVeDXWOExxEiuTfNkhyiEK_JC",
  "https://lh3.googleusercontent.com/d/1qwkWXBC0wkwmYx7N982L9uWMk_3w7Owm",
  "https://lh3.googleusercontent.com/d/1ybn6ebHMJR1iRry6VaAuV77PyOLU3qo0",
  "https://lh3.googleusercontent.com/d/1XmXftFS3PWZm4YVU97dqrUq4tJ4P27KT",
];

type PricingMode = 'mandiri' | 'rfx';

const PLANS = [
  {
    id: 'reguler' as const,
    name: "Reguler",
    tagline: "Sempurna untuk acara intim dan pasangan yang ingin buat sendiri.",
    highlight: false,
    features: [
      "3 Tema Standar",
      "Maks 100 Tamu",
      "6 Foto Galeri",
      "2 Love Story",
      "1 Amplop Digital",
      "Hitung Mundur & Maps",
      "Masa Aktif 20 Hari",
      "Watermark Kecil",
    ],
    excluded: ["QR Check-in", "Custom Slug", "Export PDF"],
  },
  {
    id: 'premium' as const,
    name: "Premium",
    tagline: "Pilihan terpopuler. Fitur lengkap, tanpa watermark.",
    highlight: true,
    badge: "POPULER",
    features: [
      "Semua Tema Tersedia",
      "Maks 500 Tamu",
      "20 Foto Galeri",
      "5 Love Story",
      "3 Amplop Digital",
      "Custom Background & Musik",
      "QR Code Check-in",
      "Custom Slug Proyek",
      "Export CSV & PDF",
      "Masa Aktif 60 Hari",
      "Tanpa Watermark",
    ],
    excluded: [],
  },
  {
    id: 'luxury' as const,
    name: "Luxury",
    tagline: "Untuk yang menginginkan segalanya tanpa batas.",
    highlight: false,
    features: [
      "Semua Fitur Premium",
      "Tamu Tak Terbatas",
      "Galeri Tak Terbatas",
      "Love Story Tak Terbatas",
      "Amplop Digital Tak Terbatas",
      "Upload Musik Custom",
      "Hingga 3 Proyek Undangan",
      "Custom Slug Tak Terbatas",
      "Prioritas Layanan",
      "Masa Aktif 90 Hari",
      "Tanpa Watermark",
    ],
    excluded: [],
  },
];

const FAQ_ITEMS = [
  {
    q: "Apa itu RuangHadir.net?",
    a: "RuangHadir.net adalah platform undangan pernikahan digital premium Indonesia. Kami menyediakan berbagai template elegan yang bisa dikustomisasi sepenuhnya, dilengkapi fitur manajemen tamu, amplop digital, QR check-in, dan analytics dashboard — semua dalam satu platform."
  },
  {
    q: "Apa perbedaan \"Buat Sendiri\" dan \"Terima Beres\"?",
    a: "\"Buat Sendiri\" berarti Anda mengisi dan mendesain undangan secara mandiri melalui dashboard kami yang mudah digunakan. \"Terima Beres\" berarti tim RFX Visual akan membuatkan undangan Anda — cukup kirimkan data dan foto, kami yang kerjakan semuanya hingga siap dipublish."
  },
  {
    q: "Berapa lama masa aktif undangan saya?",
    a: "Masa aktif berbeda per paket: Reguler (20 hari), Premium (60 hari), dan Luxury (90 hari). Masa aktif dihitung sejak undangan diaktifkan, bukan sejak pembelian. Jika masa aktif habis, Anda bisa memperpanjang dengan mudah melalui dashboard."
  },
  {
    q: "Bagaimana cara kerja Amplop Digital?",
    a: "Dana dari tamu langsung ditransfer ke rekening bank atau E-Wallet pribadi Anda. RuangHadir tidak menahan dan tidak memotong sepeserpun dana yang masuk. Kami hanya menyediakan tampilan informasi rekening Anda di halaman undangan."
  },
  {
    q: "Apakah saya bisa mengubah tema setelah membayar?",
    a: "Ya! Anda bebas berganti tema kapan pun sesuka Anda melalui dashboard tanpa batasan dan tanpa biaya tambahan. Semua data yang sudah Anda isi (tamu, galeri, dll) akan tetap tersimpan saat mengganti tema."
  },
  {
    q: "Bagaimana cara mengundang tamu?",
    a: "Setelah undangan dipublish, Anda akan mendapat link unik (misal: ruanghadir.net/nama-anda). Anda bisa membagikan link tersebut via WhatsApp, Instagram, atau media lainnya. Untuk tamu dengan nama kustom, setiap tamu mendapat link personal yang berbeda."
  },
  {
    q: "Apakah undangan bisa diakses dari HP dan laptop?",
    a: "Tentu! Semua template kami didesain responsif — tampil sempurna di smartphone, tablet, dan desktop. Tamu Anda bisa membuka undangan dari perangkat apapun tanpa perlu mengunduh aplikasi."
  },
  {
    q: "Apakah ada watermark di undangan saya?",
    a: "Paket Demo memiliki watermark besar, paket Reguler memiliki watermark kecil, sedangkan paket Premium dan Luxury sepenuhnya bebas watermark — undangan Anda tampil bersih dan profesional."
  },
  {
    q: "Bagaimana cara pembayaran?",
    a: "Kami menerima pembayaran melalui QRIS (scan dari aplikasi banking/e-wallet manapun) dan Virtual Account. Proses pembayaran aman dan otomatis — akun Anda langsung aktif setelah pembayaran dikonfirmasi."
  },
  {
    q: "Apakah ada jaminan uang kembali?",
    a: "Ya, kami memberikan garansi uang kembali dalam 7 hari setelah pembelian jika Anda belum mempublish undangan. Silakan hubungi tim kami melalui WhatsApp untuk proses pengembalian. Lihat detail lengkap di halaman Kebijakan Pengembalian."
  },
];

function formatPrice(price: number): string {
  return `Rp ${price.toLocaleString('id-ID')}`;
}

export default function LandingPage() {
  const [pricingMode, setPricingMode] = useState<PricingMode>('mandiri');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const parallaxRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    ScrollTrigger.getAll().forEach((t) => t.kill());

    parallaxRefs.current.forEach((el) => {
      if (!el) return;
      gsap.to(el, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const addToParallax = (el: HTMLImageElement | null) => {
    if (el && !parallaxRefs.current.includes(el)) {
      parallaxRefs.current.push(el);
    }
  };

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 2.5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    cssEase: "cubic-bezier(0.87, 0, 0.13, 1)",
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 1.5 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  const testimonialSettings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    fade: true,
    cssEase: "ease-in-out",
  };

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[100svh] flex items-center pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="z-10"
          >
            <div className="inline-block border border-border px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-8">
              The New Standard in Digital Wedding
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif leading-[1.05] mb-8">
              Curate<br/>
              <span className="italic text-muted-foreground">the perfect</span><br/>
              celebration.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-md font-light leading-relaxed mb-10">
              RuangHadir.net menghadirkan undangan pernikahan digital premium dengan desain editorial yang elegan. Buat, bagikan, dan pantau RSVP tamu Anda.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/auth" className="bg-primary text-primary-foreground px-8 py-4 text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors">
                Mulai Sekarang
              </Link>
              <Link href="#pricing" className="text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                Lihat Harga <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          <div className="relative h-[70vh] lg:h-[85vh] w-full overflow-hidden">
            <img 
              ref={addToParallax}
              src="https://lh3.googleusercontent.com/d/1RIEjBvUOVeDXWOExxEiuTfNkhyiEK_JC" 
              alt="RuangHadir wedding photography"
              className="absolute inset-0 w-full h-[120%] object-cover -top-[10%]"
            />
          </div>
        </div>
      </section>

      {/* ── Stats / Statement ── */}
      <section className="py-24 px-6 border-y border-border">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-serif italic leading-tight mb-16"
          >
            "Pendamping tak tergantikan bagi pasangan modern — menggabungkan ketelitian organisasi dengan estetika yang memukau."
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Pasangan", val: "2.500+" },
              { label: "Undangan", val: "15.000+" },
              { label: "Tema", val: "10+" },
              { label: "Rating", val: "4.9/5" }
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-4xl font-serif mb-2">{s.val}</span>
                <span className="text-xs tracking-widest uppercase text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Bento ── */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground block mb-4">Fitur Unggulan</span>
            <h2 className="text-5xl font-serif">Kuasai setiap detail.</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 border border-border bg-card group hover:bg-secondary transition-colors duration-500"
                >
                  <Icon className="w-6 h-6 mb-8 text-primary/60 group-hover:text-primary transition-colors" />
                  <h3 className="text-xl font-serif mb-3">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Parallax Image Break ── */}
      <section className="h-screen w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <img 
          ref={addToParallax}
          src="https://lh3.googleusercontent.com/d/1qwkWXBC0wkwmYx7N982L9uWMk_3w7Owm"
          alt="RuangHadir wedding showcase"
          className="absolute inset-0 w-full h-[120%] object-cover -top-[10%]"
        />
        <div className="relative z-20 h-full flex items-center justify-center text-white px-6">
          <div className="text-center max-w-2xl">
            <span className="text-xs tracking-widest uppercase mb-6 block text-white/80">Inovasi Digital</span>
            <h2 className="text-5xl md:text-7xl font-serif mb-8 text-white">Orkestra yang sempurna.</h2>
            <p className="text-lg font-light leading-relaxed mb-10 text-white/80">
              Visualisasikan tamu Anda. Buat galeri dinamis. Akomodasi setiap detail dengan antarmuka yang dirancang untuk kejelasan dan keanggunan.
            </p>
            <Link href="/auth" className="border border-white text-white px-8 py-4 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors">
              Coba Gratis
            </Link>
          </div>
        </div>
      </section>

      {/* ── Gallery Carousel ── */}
      <section id="gallery" className="py-32 overflow-hidden bg-secondary/50">
        <div className="px-6 max-w-7xl mx-auto mb-16 flex justify-between items-end">
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground block mb-4">Estetika</span>
            <h2 className="text-5xl font-serif">Visi yang terwujud.</h2>
          </div>
        </div>
        <div className="pl-6 md:pl-[calc((100vw-80rem)/2)] pb-12 cursor-grab active:cursor-grabbing">
          <Slider {...carouselSettings}>
            {GALLERY_IMAGES.map((src, i) => (
              <div key={i} className="px-3 outline-none">
                <div className="relative aspect-[4/5] overflow-hidden group">
                  <img 
                    src={src} 
                    alt={`Gallery ${i}`} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* ── Testimonials Carousel ── */}
      <section id="testimonials" className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
             <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground block mb-4">Testimoni</span>
             <h2 className="text-5xl font-serif mb-12">Dicintai oleh<br/>para visioner.</h2>
          </div>
          <div className="relative overflow-hidden bg-card border border-border p-8 md:p-12">
            <Slider {...testimonialSettings}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="outline-none cursor-grab active:cursor-grabbing">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 overflow-hidden rounded-full">
                      <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xl md:text-2xl font-serif italic leading-relaxed mb-6">
                        "{t.quote}"
                      </p>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-widest">{t.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t.wedding}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-32 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground block mb-4">Harga</span>
            <h2 className="text-5xl font-serif mb-6">Transparan dan terjangkau.</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-10">
              Pilih paket yang sesuai kebutuhan. Semua paket sudah termasuk akses dashboard, analytics, dan dukungan pelanggan.
            </p>

            {/* Pricing Mode Switch */}
            <div className="inline-flex items-center bg-secondary border border-border rounded-full p-1 gap-1">
              <button
                onClick={() => setPricingMode('mandiri')}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  pricingMode === 'mandiri'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Buat Sendiri
              </button>
              <button
                onClick={() => setPricingMode('rfx')}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  pricingMode === 'rfx'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Terima Beres
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              {pricingMode === 'mandiri'
                ? 'Anda mendesain & mengisi sendiri undangan melalui dashboard.'
                : 'Tim RFX Visual membuatkan undangan Anda. Tinggal terima beres!'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan, i) => {
              const price = PACKAGE_PRICES[plan.id][pricingMode];
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative p-10 border ${plan.highlight ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card'}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`inline-flex items-center gap-1 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        plan.highlight ? 'bg-yellow-400 text-yellow-900' : 'bg-primary text-primary-foreground'
                      }`}>
                        <PiCrownDuotone className="w-3 h-3" /> {plan.badge}
                      </span>
                    </div>
                  )}
                  <h3 className={`text-sm tracking-widest uppercase mb-2 ${plan.highlight ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl md:text-5xl font-serif" key={`${plan.id}-${pricingMode}`}>
                      {formatPrice(price)}
                    </span>
                  </div>
                  <p className={`text-xs mb-8 ${plan.highlight ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    {plan.tagline}
                  </p>
                  <ul className="space-y-3 mb-10">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <PiCheckCircleDuotone className="w-4 h-4 opacity-50 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.excluded.map(f => (
                      <li key={f} className={`flex items-start gap-3 text-sm ${plan.highlight ? 'text-primary-foreground/30' : 'text-muted-foreground/40'}`}>
                        <X className="w-4 h-4 opacity-30 shrink-0 mt-0.5" />
                        <span className="line-through">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth" className={`block text-center py-4 text-xs tracking-widest uppercase transition-colors ${
                    plan.highlight ? "bg-primary-foreground text-primary hover:bg-white" : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}>
                    Pilih {plan.name}
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Free demo note */}
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              Belum yakin? <Link href="/auth" className="underline hover:text-foreground transition-colors">Coba gratis paket Demo</Link> — tanpa perlu kartu kredit.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-32 px-6 bg-secondary/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground block mb-4">FAQ</span>
            <h2 className="text-4xl font-serif">Pertanyaan yang sering diajukan</h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i} className="border border-border bg-card">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                >
                  <span className="font-medium pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-60" : "max-h-0"}`}
                >
                  <p className="p-6 pt-0 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-32 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-serif mb-8">
            Siap membuat undangan<br/>
            <span className="italic text-muted-foreground">yang tak terlupakan?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-lg mx-auto">
            Bergabung dengan ribuan pasangan Indonesia yang sudah mempercayakan momen spesial mereka kepada RuangHadir.net.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth" className="bg-primary text-primary-foreground px-10 py-4 text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors">
              Mulai Buat Undangan
            </Link>
            <a
              href="https://wa.me/6285731021469?text=Halo%20RuangHadir%2C%20saya%20ingin%20bertanya%20tentang%20undangan%20digital"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-border px-10 py-4 text-sm tracking-widest uppercase hover:bg-secondary transition-colors"
            >
              Hubungi Kami
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

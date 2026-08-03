'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Testimonial {
  tempId: number;
  testimonial: string;
  by: string;
  imgSrc: string;
}

const testimonials: Testimonial[] = [
  { tempId: 0, testimonial: "Solusi terbaik di pasaran. Kami kerja 5x lebih cepat dengan RUANGHADIR.", by: "Anisa & Fajar, Jakarta", imgSrc: "https://i.pravatar.cc/150?img=1" },
  { tempId: 1, testimonial: "Data kami aman bersama RUANGHADIR. Tidak bisa saya katakan tentang penyedia lain.", by: "Dewi & Rizky, Bandung", imgSrc: "https://i.pravatar.cc/150?img=2" },
  { tempId: 2, testimonial: "Kami tersesat sebelum menemukan RUANGHADIR. Tidak bisa berterima kasih cukup!", by: "Sari & Andi, Surabaya", imgSrc: "https://i.pravatar.cc/150?img=3" },
  { tempId: 3, testimonial: "Produk RUANGHADIR membuat perencanaan masa depan mulus. Sangat direkomendasikan!", by: "Maya & Dimas, Yogyakarta", imgSrc: "https://i.pravatar.cc/150?img=4" },
  { tempId: 4, testimonial: "Kalau bisa kasih 11 bintang, saya kasih 12.", by: "Putri & Hendra, Bali", imgSrc: "https://i.pravatar.cc/150?img=5" },
  { tempId: 5, testimonial: "SANGAT SANGAT SANGAT BAHAGIA MENEMUKAN KALIAN!!!! Sudah pasti hemat 100 jam.", by: "Linda & Tommy, Medan", imgSrc: "https://i.pravatar.cc/150?img=6" },
  { tempId: 6, testimonial: "Perlu meyakinkan diri, tapi sekarang di RUANGHADIR, kami tidak akan kembali.", by: "Ratna & Bimo, Semarang", imgSrc: "https://i.pravatar.cc/150?img=7" },
  { tempId: 7, testimonial: "Analitik mendalam RUANGHADIR luar biasa. ROI kami mudah 100X lipat.", by: "Dina & Iqbal, Makassar", imgSrc: "https://i.pravatar.cc/150?img=8" },
  { tempId: 8, testimonial: "Ini yang terbaik. Selesai.", by: "Fitri & Arif, Malang", imgSrc: "https://i.pravatar.cc/150?img=9" },
  { tempId: 9, testimonial: "Saya beralih 5 tahun lalu dan tidak pernah menoleh ke belakang.", by: "Gita & Rama, Depok", imgSrc: "https://i.pravatar.cc/150?img=10" },
  { tempId: 10, testimonial: "Saya cari solusi seperti RUANGHADIR bertahun-tahun. Senang akhirnya menemukan!", by: "Hana & Yoga, Tangerang", imgSrc: "https://i.pravatar.cc/150?img=11" },
  { tempId: 11, testimonial: "Sangat sederhana dan intuitif, tim kami siap dalam 10 menit.", by: "Intan & Fadel, Bekasi", imgSrc: "https://i.pravatar.cc/150?img=12" },
  { tempId: 12, testimonial: "Support pelanggan RUANGHADIR tak tertandingi. Selalu ada saat dibutuhkan.", by: "Jasmine & Kevin, Bogor", imgSrc: "https://i.pravatar.cc/150?img=13" },
  { tempId: 13, testimonial: "Efisiensi yang kami dapatkan sejak menggunakan RUANGHADIR luar biasa!", by: "Kirana & Surya, Palembang", imgSrc: "https://i.pravatar.cc/150?img=14" },
  { tempId: 14, testimonial: "RUANGHADIR merevolusi cara kami menangani workflow. Game-changer!", by: "Luna & Arief, Solo", imgSrc: "https://i.pravatar.cc/150?img=15" },
  { tempId: 15, testimonial: "Skalabilitas solusi RUANGHADIR mengesankan. Tumbuh bersama bisnis kami.", by: "Mira & Hadi, Balikpapan", imgSrc: "https://i.pravatar.cc/150?img=16" },
  { tempId: 16, testimonial: "Saya apresiasi inovasi terus-menerus dari RUANGHADIR. Selalu satu langkah ahead.", by: "Nadia & Reza, Surabaya", imgSrc: "https://i.pravatar.cc/150?img=17" },
  { tempId: 17, testimonial: "ROI yang kami lihat dengan RUANGHADIR luar biasa. Sudah terbayar berkali-kali.", by: "Olivia & Tono, Manado", imgSrc: "https://i.pravatar.cc/150?img=18" },
  { tempId: 18, testimonial: "Platform RUANGHADIR sangat robust, tapi mudah digunakan. Keseimbangan sempurna.", by: "Prita & Bima, Cirebon", imgSrc: "https://i.pravatar.cc/150?img=19" },
  { tempId: 19, testimonial: "Kami coba banyak solusi, tapi RUANGHADIR unggul dalam keandalan dan performa.", by: "Qori & Fauzan, Padang", imgSrc: "https://i.pravatar.cc/150?img=20" },
];

const CARDS_PER_VIEW_DESKTOP = 3;
const CARDS_PER_VIEW_TABLET = 2;
const CARDS_PER_VIEW_MOBILE = 1;
const AUTOPLAY_INTERVAL = 5000;

// Pre-computed stagger styles (constant, no state needed)
const staggerStyles: Record<number, React.CSSProperties> = {};
testimonials.forEach((_, i) => {
  staggerStyles[i] = {
    animation: `staggerIn 0.5s ease-out ${i * 0.06}s both`,
  };
});

export function StaggerTestimonials() {
  const [current, setCurrent] = useState(0);
  const [visibleCount, setVisibleCount] = useState(CARDS_PER_VIEW_DESKTOP);
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevCountRef = useRef(CARDS_PER_VIEW_DESKTOP);

  // Detect viewport on mount + resize — only AFTER hydration
  useEffect(() => {
    const detect = () => {
      const w = window.innerWidth;
      let c = CARDS_PER_VIEW_DESKTOP;
      if (w < 640) c = CARDS_PER_VIEW_MOBILE;
      else if (w < 1024) c = CARDS_PER_VIEW_TABLET;
      if (c !== prevCountRef.current) {
        prevCountRef.current = c;
        setVisibleCount(c);
        setCurrent(0);
      }
    };
    setMounted(true);
    detect();
    window.addEventListener('resize', detect);
    return () => window.removeEventListener('resize', detect);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - visibleCount);

  const next = useCallback(() => {
    setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Autoplay
  useEffect(() => {
    if (isHovered) return;
    intervalRef.current = setInterval(next, AUTOPLAY_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [next, isHovered]);

  // Inject stagger keyframes once
  useEffect(() => {
    const styleId = 'stagger-testimonials-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes staggerIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Always render DESKTOP count for SSR — CSS grid will handle responsive layout
  const renderCount = mounted ? visibleCount : CARDS_PER_VIEW_DESKTOP;
  const visibleTestimonials = testimonials.slice(current, current + renderCount);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cards — CSS handles responsive columns, NO inline gridTemplateColumns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {visibleTestimonials.map((t) => (
          <div
            key={t.tempId}
            className="rounded-2xl border border-border/40 bg-card p-5 sm:p-6 transition-shadow duration-300 hover:shadow-md"
            style={staggerStyles[t.tempId] ?? {}}
          >
            {/* Stars */}
            <p className="text-gold text-sm mb-3 tracking-wide">★★★★★</p>

            {/* Quote */}
            <p className="text-sm leading-relaxed text-foreground/80 italic mb-4">
              &ldquo;{t.testimonial}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <img
                src={t.imgSrc}
                alt={t.by}
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-rose-100"
                loading="lazy"
              />
              <p className="text-sm font-medium text-foreground/70 truncate">{t.by}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <button
          onClick={prev}
          className={cn(
            'inline-flex items-center justify-center w-9 h-9 rounded-full border border-border/60 bg-white text-foreground/70',
            'hover:bg-accent hover:text-foreground hover:border-border transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
          aria-label="Previous testimonials"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                i === current
                  ? 'bg-primary w-5'
                  : 'bg-border hover:bg-muted-foreground/40'
              )}
              aria-label={`Go to testimonial group ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className={cn(
            'inline-flex items-center justify-center w-9 h-9 rounded-full border border-border/60 bg-white text-foreground/70',
            'hover:bg-accent hover:text-foreground hover:border-border transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
          aria-label="Next testimonials"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
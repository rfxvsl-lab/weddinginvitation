'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconArrowRight } from '@/components/Icons';

gsap.registerPlugin(ScrollTrigger);

const templates = [
  {
    name: 'Eternal Rose',
    category: 'Klasik',
    gradient: 'from-rose-200 to-pink-100',
    popular: true,
  },
  {
    name: 'Garden Bloom',
    category: 'Floral',
    gradient: 'from-emerald-100 to-teal-50',
    popular: false,
  },
  {
    name: 'Royal Gold',
    category: 'Mewah',
    gradient: 'from-amber-100 to-yellow-50',
    popular: true,
  },
  {
    name: 'Minimalist',
    category: 'Modern',
    gradient: 'from-stone-100 to-neutral-50',
    popular: false,
  },
  {
    name: 'Tropical Vibes',
    category: 'Tropis',
    gradient: 'from-lime-100 to-cyan-50',
    popular: false,
  },
  {
    name: 'Night Elegance',
    category: 'Modern',
    gradient: 'from-slate-200 to-gray-100',
    popular: false,
  },
];

export function Templates() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(headerRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 85%',
          once: true,
        },
      });

      // Card stagger animation with scrub
      const cards = cardsRef.current?.querySelectorAll('[data-template-card]');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.12,
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              end: 'bottom 60%',
              scrub: 1,
            },
          }
        );
      }

      // CTA animation
      gsap.from(ctaRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 90%',
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="template"
      ref={sectionRef}
      className="py-16 md:py-20 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div ref={headerRef} className="text-center mb-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">
            Template
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold">
            Pilih Template{' '}
            <span className="text-gradient-gold">Impian Anda</span>
          </h2>
        </div>

        {/* Template grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {templates.map((template, i) => (
            <div
              key={i}
              data-template-card
              className="group rounded-2xl overflow-hidden border border-border/40 bg-card hover:-translate-y-1.5 hover:shadow-lg transition-all duration-500"
            >
              {/* Preview area */}
              <div
                className={`relative h-52 bg-gradient-to-br ${template.gradient} flex items-center justify-center overflow-hidden`}
              >
                {/* Mini mockup invitation */}
                <div className="w-36 bg-white/70 backdrop-blur rounded-lg shadow p-3 flex flex-col items-center justify-center gap-1.5">
                  <div className="w-10 h-px bg-primary/40 rounded-full" />
                  <p className="text-[8px] text-muted-foreground uppercase tracking-widest">
                    The Wedding of
                  </p>
                  <p className="font-serif text-sm font-bold text-foreground">
                    Rina &amp; Budi
                  </p>
                  <div className="w-5 h-px bg-primary/40 rounded-full" />
                  <p className="text-[7px] text-muted-foreground">
                    28 Desember 2025
                  </p>
                  <div className="w-14 h-px bg-gold/50 rounded-full mt-0.5" />
                </div>

                {/* Popular badge */}
                {template.popular && (
                  <Badge className="absolute top-3 right-3 bg-primary text-white text-[10px] px-1.5 py-0.5">
                    POPULER
                  </Badge>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
                    Preview
                  </span>
                </div>
              </div>

              {/* Template info */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-semibold text-sm">
                    {template.name}
                  </h3>
                  <span className="text-xs bg-muted rounded-full px-2 py-0.5">
                    {template.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="text-center mt-10">
          <Button
            variant="outline"
            size="lg"
            className="group border-2 gap-2"
          >
            Lihat Semua 50+ Template
            <IconArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Button>
        </div>
      </div>
    </section>
  );
}

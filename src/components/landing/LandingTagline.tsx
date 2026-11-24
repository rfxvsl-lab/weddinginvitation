'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Kalimat inti (ai-design-skills B11): huruf besar, tiap kata menyala bergantian
 * saat melewati garis pemicu di tengah layar. Satu listener gulir yang di-throttle rAF.
 */
const LINES = ['Satu tautan untuk setiap tamu.', 'Semua kabar kehadiran kembali ke satu tempat.'];

export function LandingTagline() {
  const ref = useRef<HTMLDivElement | null>(null);
  const words = LINES.map((l) => l.split(' '));
  const total = words.reduce((n, w) => n + w.length, 0);
  const [on, setOn] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOn(total);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // kata pertama menyala saat bagian atas melewati 75% layar, terakhir saat bagian bawah melewati 45%
      const start = vh * 0.75;
      const end = vh * 0.45;
      const progress = (start - r.top) / (start - end + r.height);
      setOn(Math.max(0, Math.min(total, Math.round(progress * total))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [total]);

  let k = 0;
  return (
    <section className="bg-[var(--rh-paper)] py-24 sm:py-32" aria-label={LINES.join(' ')}>
      <div ref={ref} className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <p className="rh-display max-w-[680px] text-3xl font-semibold sm:text-4xl lg:text-5xl" aria-hidden>
          {words.map((line, li) => (
            <span key={li} className="block">
              {line.map((w) => {
                const i = k++;
                return (
                  <span key={i} className={`rh-tagline-word ${i < on ? 'is-on' : ''}`}>
                    {w}{' '}
                  </span>
                );
              })}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

'use client';

/**
 * Adegan mempelai — dua belahan satu foto (Tia | Dhany) yang dipertemukan oleh gulir.
 * Seksi dipin (sticky) sepanjang ±1,4 layar:
 *  1. Kedua belahan berdiri terpisah, saling menghadap (rotateY) seperti dua wayang berhadapan, redup.
 *  2. Saat digulir, keduanya mendekat, berputar menghadap tamu, dan menyatu tepat di genggaman tangan.
 *  3. Saat menyatu: kilau blencong di genggaman, gunungan kecil tumbuh di atas sambungan.
 *  4. Nama lengkap & orang tua masuk dari sisi masing-masing.
 * Progres dihitung dari posisi seksi yang di-cache; hanya transform/opacity yang diubah.
 */
import React, { useEffect, useRef } from 'react';
import s from './dani-tia.module.css';
import { COUPLE, PHOTOS, img, srcSet } from './data';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export default function CoupleScene({ active, lede }: { active: boolean; lede: string }) {
  const secRef = useRef<HTMLElement>(null);
  const L = useRef<HTMLDivElement>(null);
  const R = useRef<HTMLDivElement>(null);
  const shadeL = useRef<HTMLSpanElement>(null);
  const shadeR = useRef<HTMLSpanElement>(null);
  const glow = useRef<HTMLSpanElement>(null);
  const kayon = useRef<HTMLSpanElement>(null);
  const nameL = useRef<HTMLDivElement>(null);
  const nameR = useRef<HTMLDivElement>(null);
  const withRef = useRef<HTMLParagraphElement>(null);
  const tagL = useRef<HTMLSpanElement>(null);
  const tagR = useRef<HTMLSpanElement>(null);
  const pair = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = secRef.current;
    if (!sec || !active) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let top = 0;
    let span = 1;
    let raf = 0;
    let last = -1;

    const apply = (p: number) => {
      const e1 = sm(0.04, 0.56, p); // mendekat
      const e2 = sm(0.5, 0.62, p); // bertemu
      const e3 = sm(0.6, 0.86, p); // nama
      const gap = (1 - e1) * 24;
      const rot = (1 - e1) * 40;
      const sc = 0.84 + 0.16 * e1;
      const lift = (1 - e1) * 14;
      if (L.current) L.current.style.transform = `translate3d(${-gap}%, ${lift}px, 0) rotateY(${rot}deg) scale(${sc})`;
      if (R.current) R.current.style.transform = `translate3d(${gap}%, ${-lift}px, 0) rotateY(${-rot}deg) scale(${sc})`;
      const dim = ((1 - e1) * 0.55).toFixed(3);
      if (shadeL.current) shadeL.current.style.opacity = dim;
      if (shadeR.current) shadeR.current.style.opacity = dim;
      const flash = Math.sin(Math.PI * e2);
      if (glow.current) {
        glow.current.style.opacity = (flash * 0.95 + e2 * 0.3).toFixed(3);
        glow.current.style.transform = `translate(-50%, -50%) scale(${(0.6 + flash * 0.9).toFixed(3)})`;
      }
      if (kayon.current) {
        kayon.current.style.opacity = e2.toFixed(3);
        kayon.current.style.transform = `translate(-50%, ${((1 - e2) * 30).toFixed(1)}px) scale(${(0.4 + 0.6 * e2).toFixed(3)})`;
      }
      if (pair.current) pair.current.style.transform = `scale(${(1.03 - 0.05 * e3).toFixed(4)})`;
      const tagO = (1 - e2).toFixed(3);
      if (tagL.current) tagL.current.style.opacity = tagO;
      if (tagR.current) tagR.current.style.opacity = tagO;
      if (nameL.current) {
        nameL.current.style.opacity = e3.toFixed(3);
        nameL.current.style.transform = `translate3d(${((1 - e3) * -28).toFixed(1)}px, 0, 0)`;
      }
      if (nameR.current) {
        nameR.current.style.opacity = e3.toFixed(3);
        nameR.current.style.transform = `translate3d(${((1 - e3) * 28).toFixed(1)}px, 0, 0)`;
      }
      if (withRef.current) {
        withRef.current.style.opacity = e3.toFixed(3);
        withRef.current.style.transform = `scale(${(0.7 + 0.3 * e3).toFixed(3)})`;
      }
    };

    if (reduced) {
      apply(1);
      return;
    }
    const measure = () => {
      const r = sec.getBoundingClientRect();
      top = r.top + window.scrollY;
      span = Math.max(1, r.height - window.innerHeight);
      frame();
    };
    const frame = () => {
      raf = 0;
      const p = clamp((window.scrollY - top + window.innerHeight * 0.15) / span);
      if (Math.abs(p - last) < 0.0005) return;
      last = p;
      apply(p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [active]);

  return (
    <section ref={secRef} className={s.coupleScene} data-stage="couple" id="mempelai" aria-label="Kedua mempelai">
      <div className={s.coupleSticky}>
        <p className={s.coupleLede}>{lede}</p>
        <div className={s.pairWrap}>
          <div ref={pair} className={s.pair}>
            <div ref={L} className={`${s.pHalf} ${s.pHalfL}`}>
              <img src={img(PHOTOS.tia, 0)} srcSet={srcSet(PHOTOS.tia)} sizes="(min-width: 1024px) 210px, 46vw" alt="Tia Ifawati" loading="lazy" decoding="async" />
              <span ref={shadeL} className={s.pShade} />
              <span ref={tagL} className={s.pTag}>
                {COUPLE.bride.nick}
              </span>
            </div>
            <div ref={R} className={`${s.pHalf} ${s.pHalfR}`}>
              <img src={img(PHOTOS.dhany, 0)} srcSet={srcSet(PHOTOS.dhany)} sizes="(min-width: 1024px) 210px, 46vw" alt="Mohamad Dhany Azar" loading="lazy" decoding="async" />
              <span ref={shadeR} className={s.pShade} />
              <span ref={tagR} className={s.pTag}>
                {COUPLE.groom.nick}
              </span>
            </div>
            <span ref={glow} className={s.pGlow} aria-hidden />
            <span ref={kayon} className={s.pKayon} aria-hidden />
          </div>
        </div>
        <div className={s.pNames}>
          <div ref={nameL} className={s.pName}>
            <h2>{COUPLE.bride.full}</h2>
            <p>{COUPLE.bride.parents}</p>
          </div>
          <p ref={withRef} className={s.pWith} aria-hidden>
            with
          </p>
          <div ref={nameR} className={s.pName}>
            <h2>{COUPLE.groom.full}</h2>
            <p>{COUPLE.groom.parents}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

/**
 * Galeri "Simpingan" — carousel 3D.
 * Dalam pagelaran wayang, tokoh-tokoh ditancapkan berjajar di batang pisang (gedebog) di kiri-kanan
 * kelir; dalang mengambilnya satu per satu. Di sini 12 foto dibingkai bentuk gunungan bertatah,
 * berdiri melingkar di atas gedebog, dan diputar dengan geser/tombol. Foto terdepan diterangi blencong.
 *
 * Performa: satu cincin `preserve-3d` diputar dengan transform; bayangan tiap kartu hanya opacity.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import s from './dani-tia.module.css';
import { CAROUSEL, cImg } from './data';

const N = CAROUSEL.length;
const STEP = 360 / N;
const mod = (a: number, n: number) => ((a % n) + n) % n;

export default function Simpingan({ onOpen }: { onOpen: (i: number) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const shadeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const st = useRef({ cur: 0, target: 0, raf: 0, drag: false, startX: 0, startA: 0, lastX: 0, lastT: 0, v: 0, moved: 0, idleUntil: 0, visible: false });
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  const paint = useCallback(() => {
    const k = st.current;
    const ring = ringRef.current;
    if (!ring) return;
    ring.style.transform = `translateZ(calc(var(--r) * -1)) rotateY(${k.cur.toFixed(3)}deg)`;
    for (let i = 0; i < N; i++) {
      const d = Math.abs(((mod(i * STEP + k.cur + 180, 360)) - 180));
      const el = shadeRefs.current[i];
      if (el) el.style.opacity = Math.min(0.82, (d / 75) * 0.82).toFixed(3);
    }
    const idx = mod(Math.round(-k.cur / STEP), N);
    setActive((a) => (a === idx ? a : idx));
  }, []);

  const loop = useCallback(() => {
    const k = st.current;
    k.raf = 0;
    if (!k.drag) {
      const diff = k.target - k.cur;
      k.cur += diff * 0.1;
      if (Math.abs(diff) < 0.02) k.cur = k.target;
    }
    paint();
    if (k.drag || k.cur !== k.target) k.raf = requestAnimationFrame(loop);
  }, [paint]);

  const kick = useCallback(() => {
    const k = st.current;
    if (!k.raf) k.raf = requestAnimationFrame(loop);
  }, [loop]);

  const goTo = useCallback(
    (idx: number, pause = true) => {
      const k = st.current;
      // putar lewat jalur terpendek
      const want = -idx * STEP;
      let delta = mod(want - k.target + 180, 360) - 180;
      if (Math.abs(delta) < 0.001) delta = 0;
      k.target += delta;
      if (reduced) k.cur = k.target;
      if (pause) k.idleUntil = Date.now() + 7000;
      kick();
    },
    [kick, reduced]
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    paint();
  }, [paint]);

  // putar otomatis pelan saat terlihat dan tidak disentuh
  useEffect(() => {
    if (reduced) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (st.current.visible = e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    const id = window.setInterval(() => {
      const k = st.current;
      if (!k.visible || k.drag || Date.now() < k.idleUntil) return;
      k.target -= STEP;
      kick();
    }, 3600);
    return () => {
      io.disconnect();
      clearInterval(id);
    };
  }, [kick, reduced]);

  useEffect(() => () => cancelAnimationFrame(st.current.raf), []);

  const cardW = () => (ringRef.current?.offsetWidth || 180);

  const onDown = (e: React.PointerEvent) => {
    const k = st.current;
    k.drag = true;
    k.startX = k.lastX = e.clientX;
    k.lastT = performance.now();
    k.startA = k.cur;
    k.v = 0;
    k.moved = 0;
    k.idleUntil = Date.now() + 8000;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    kick();
  };
  const onMove = (e: React.PointerEvent) => {
    const k = st.current;
    if (!k.drag) return;
    const now = performance.now();
    const dx = e.clientX - k.startX;
    k.moved = Math.max(k.moved, Math.abs(dx));
    const perPx = STEP / (cardW() * 0.9);
    k.cur = k.startA + dx * perPx;
    k.v = ((e.clientX - k.lastX) / Math.max(1, now - k.lastT)) * perPx * 16;
    k.lastX = e.clientX;
    k.lastT = now;
  };
  const onUp = (e: React.PointerEvent) => {
    const k = st.current;
    if (!k.drag) return;
    k.drag = false;
    if (k.moved < 6) {
      // ketukan: kartu depan → perbesar; kartu samping → putar ke sana
      const el = (e.target as HTMLElement).closest('[data-i]') as HTMLElement | null;
      if (el) {
        const i = Number(el.dataset.i);
        if (i === mod(Math.round(-k.cur / STEP), N)) onOpen(i);
        else goTo(i);
        return;
      }
    }
    const projected = k.cur + k.v * 8;
    k.target = Math.round(projected / STEP) * STEP;
    kick();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goTo(mod(active + 1, N));
    else if (e.key === 'ArrowLeft') goTo(mod(active - 1, N));
    else if (e.key === 'Enter') onOpen(active);
    else return;
    e.preventDefault();
  };

  const cur = CAROUSEL[active];
  return (
    <div className={s.simp}>
      <div
        ref={wrapRef}
        className={s.simpStage}
        role="region"
        aria-roledescription="carousel"
        aria-label="Galeri foto Tia dan Dhany. Geser atau pakai panah untuk memutar."
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <span className={s.simpLamp} aria-hidden />
        <div className={s.simpScene}>
          <div ref={ringRef} className={s.simpRing}>
            {CAROUSEL.map((c, i) => (
              <div key={c.id} className={s.simpCard} data-i={i} style={{ transform: `rotateY(${i * STEP}deg) translateZ(var(--r))` }} aria-hidden={i !== active}>
                <img src={cImg(c)} srcSet={`${cImg(c)} 400w, ${cImg(c, true)} 760w`} sizes="200px" alt={c.alt} loading="lazy" decoding="async" draggable={false} className={s.simpPhoto} />
                <span className={s.simpFrame} aria-hidden />
                <span ref={(el) => void (shadeRefs.current[i] = el)} className={s.simpShade} aria-hidden />
              </div>
            ))}
            <div className={s.simpFloor} aria-hidden />
          </div>
        </div>
        <div className={s.gedebog} aria-hidden />
      </div>
      <div className={s.simpBar}>
        <button type="button" className={s.simpBtn} onClick={() => goTo(mod(active - 1, N))} aria-label="Foto sebelumnya">
          ‹
        </button>
        <p className={s.simpCap} aria-live="polite">
          <span>{cur.chapter}</span>
          <small>
            {active + 1} dari {N}
          </small>
        </p>
        <button type="button" className={s.simpBtn} onClick={() => goTo(mod(active + 1, N))} aria-label="Foto berikutnya">
          ›
        </button>
      </div>
      <button type="button" className={s.simpZoom} onClick={() => onOpen(active)}>
        Lihat foto penuh
      </button>
    </div>
  );
}

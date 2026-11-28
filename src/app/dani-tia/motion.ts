'use client';

/**
 * Mesin gerak undangan Tia & Dhany.
 *
 * Prinsip (dibuat untuk menghindari bug tema lama: lapisan hilang tiba-tiba, paralaks diam, animasi tersendat):
 * - Hanya `transform` dan `opacity` yang dianimasikan → dikerjakan GPU, tanpa layout ulang.
 * - Elemen yang sudah tampil TIDAK pernah disembunyikan lagi (tidak ada toggle visibility).
 * - Satu loop rAF untuk semua paralaks; posisi elemen di-cache saat resize, bukan
 *   getBoundingClientRect() setiap frame (penyebab tersendat di HP).
 * - Semua efek dimatikan untuk `prefers-reduced-motion`.
 */
import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

export function useMediaQuery(q: string) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
}

/** Munculkan elemen [data-rv] sekali saat masuk layar (fade/zoom/tilt/wipe ditentukan CSS). */
export function useReveal(root: React.RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = root.current;
    if (!el || !enabled) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-rv]:not([data-in])'));
    if (!('IntersectionObserver' in window)) {
      items.forEach((i) => i.setAttribute('data-in', ''));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute('data-in', '');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
    );
    items.forEach((i) => io.observe(i));
    // elemen yang ditambahkan belakangan (daftar ucapan, galeri) ikut diamati
    const mo = new MutationObserver(() => {
      el.querySelectorAll<HTMLElement>('[data-rv]:not([data-in]):not([data-obs])').forEach((i) => {
        i.setAttribute('data-obs', '');
        io.observe(i);
      });
    });
    items.forEach((i) => i.setAttribute('data-obs', ''));
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [root, enabled]);
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

interface Plate {
  el: HTMLElement;
  target: HTMLElement;
  mode: string;
  amp: number;
  top: number;
  h: number;
  last: number;
}

/**
 * Paralaks gulir untuk [data-px] (mode: drift | zoom-in | zoom-out | rise).
 * Elemen yang ditransformasi adalah anak [data-px-t] (atau anak pertama) agar tidak bertabrakan
 * dengan animasi reveal pada pembungkusnya.
 */
export function useScrollScene(root: React.RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = root.current;
    if (!el || !enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let plates: Plate[] = [];
    let vh = window.innerHeight;
    let raf = 0;

    const measure = () => {
      vh = window.innerHeight;
      const sy = window.scrollY;
      plates = Array.from(el.querySelectorAll<HTMLElement>('[data-px]')).map((p) => {
        const r = p.getBoundingClientRect();
        const target = (p.querySelector('[data-px-t]') as HTMLElement) || (p.firstElementChild as HTMLElement) || p;
        target.style.willChange = 'transform';
        return { el: p, target, mode: p.dataset.px || 'drift', amp: Number(p.dataset.amp || 1), top: r.top + sy, h: r.height, last: -1 };
      });
      frame();
    };

    const frame = () => {
      raf = 0;
      const y = window.scrollY;
      for (const p of plates) {
        // di luar layar (dengan cadangan) — lewati tanpa mengubah apa pun
        if (p.top + p.h < y - vh * 0.3 || p.top > y + vh * 1.3) continue;
        const prog = clamp((y + vh - p.top) / (vh + p.h));
        if (Math.abs(prog - p.last) < 0.0007) continue;
        p.last = prog;
        let tf = '';
        if (p.mode === 'zoom-in') {
          // kamera mendekat (dolly in) seiring gulir
          const s = 1.04 + 0.22 * p.amp * smooth(0.1, 0.95, prog);
          tf = `translate3d(0, ${((prog - 0.5) * -6 * p.amp).toFixed(2)}%, 0) scale(${s.toFixed(4)})`;
        } else if (p.mode === 'zoom-out') {
          const s = 1.24 - 0.2 * p.amp * smooth(0, 0.7, prog);
          tf = `translate3d(0, ${((prog - 0.5) * 8 * p.amp).toFixed(2)}%, 0) scale(${s.toFixed(4)})`;
        } else if (p.mode === 'zoom-top') {
          // zoom out berporos di tepi atas (subjek berada di bagian atas foto)
          tf = `scale(${(1.2 - 0.18 * smooth(0, 0.75, prog)).toFixed(4)})`;
        } else if (p.mode === 'rise') {
          tf = `translate3d(0, ${((0.5 - prog) * 14 * p.amp).toFixed(2)}%, 0)`;
        } else {
          tf = `translate3d(0, ${((prog - 0.5) * 12 * p.amp).toFixed(2)}%, 0) scale(1.14)`;
        }
        p.target.style.transform = tf;
        // fade out lembut saat plate hampir keluar di atas
        if (p.el.dataset.fade !== undefined) p.target.style.opacity = (1 - 0.55 * smooth(0.78, 1, prog)).toFixed(3);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [root, enabled]);
}

/** Miring lembut mengikuti pointer (desktop). */
export function usePointerTilt(ref: React.RefObject<HTMLElement | null>, enabled: boolean, maxDeg = 3) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.transform = `perspective(1200px) rotateY(${(cx * maxDeg).toFixed(3)}deg) rotateX(${(-cy * maxDeg).toFixed(3)}deg)`;
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, enabled, maxDeg]);
}

export function useCountdown(iso: string) {
  const target = new Date(iso).getTime();
  const calc = () => {
    const diff = Math.max(0, target - Date.now());
    return {
      done: diff <= 0,
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff / 3600000) % 24),
      m: Math.floor((diff / 60000) % 60),
      s: Math.floor((diff / 1000) % 60),
    };
  };
  const [t, setT] = useState<ReturnType<typeof calc> | null>(null);
  useEffect(() => {
    setT(calc());
    let id: number;
    const tick = () => {
      setT(calc());
      id = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    };
    id = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iso]);
  return t;
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import s from './dani-tia.module.css';
import { CAROUSEL, cImg } from './data';

/** Galeri layar penuh: geser/panah/Esc; posisi gulir & fokus kembali saat ditutup. */
export default function Lightbox({ index, onClose }: { index: number; onClose: () => void }) {
  const flat = CAROUSEL;
  const [i, setI] = useState(index);
  const [dir, setDir] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const downX = useRef<number | null>(null);

  const go = (d: number) => {
    setDir(d);
    setI((v) => (v + d + flat.length) % flat.length);
  };

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      html.style.overflow = prev;
      prevFocus?.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cur = flat[i];
  return (
    <div
      className={s.lb}
      role="dialog"
      aria-modal="true"
      aria-label="Galeri foto"
      onPointerDown={(e) => (downX.current = e.clientX)}
      onPointerUp={(e) => {
        if (downX.current === null) return;
        const dx = e.clientX - downX.current;
        downX.current = null;
        if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
      }}
    >
      <img key={cur.id} className={s.lbImg} data-dir={dir} src={cImg(cur, true)} alt={cur.alt} draggable={false} />
      <p className={s.lbCap}>
        {cur.chapter}, {i + 1} dari {flat.length}
      </p>
      <button type="button" className={`${s.lbBtn} ${s.lbPrev}`} onClick={() => go(-1)} aria-label="Foto sebelumnya">
        ‹
      </button>
      <button type="button" className={`${s.lbBtn} ${s.lbNext}`} onClick={() => go(1)} aria-label="Foto berikutnya">
        ›
      </button>
      <button type="button" ref={closeRef} className={s.lbClose} onClick={onClose} aria-label="Tutup galeri">
        ×
      </button>
    </div>
  );
}

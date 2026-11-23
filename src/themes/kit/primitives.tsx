'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { AmbientPreset, DividerPreset, FrameShape, RevealStyle, ThemePalette, ThemeSpec } from '../types';

/** Muncul saat terlihat di layar (sekali). Menghormati prefers-reduced-motion. */
export function Reveal({
  children,
  style,
  delay = 0,
  as: Tag = 'div',
  variant,
  className,
  from,
  when = true,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
  variant: RevealStyle;
  className?: string;
  /** arah masuk (menimpa gaya variant): kiri, kanan, atas, bawah */
  from?: 'left' | 'right' | 'up' | 'down';
  /** tunda sampai kondisi ini benar (mis. setelah animasi pembuka selesai) */
  when?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const win = el.ownerDocument.defaultView || window;
    if (win.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new (win.IntersectionObserver || IntersectionObserver)(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden: Record<RevealStyle, React.CSSProperties> = {
    rise: { opacity: 0, transform: 'translateY(28px)' },
    fade: { opacity: 0 },
    blur: { opacity: 0, filter: 'blur(10px)', transform: 'translateY(10px)' },
    zoom: { opacity: 0, transform: 'scale(0.94)' },
  };
  const dir: Record<string, React.CSSProperties> = {
    left: { opacity: 0, transform: 'translateX(-70px)' },
    right: { opacity: 0, transform: 'translateX(70px)' },
    up: { opacity: 0, transform: 'translateY(50px)' },
    down: { opacity: 0, transform: 'translateY(-50px)' },
  };
  const visible = shown && when;
  const T = Tag as React.ElementType;
  return (
    <T
      ref={ref}
      className={className}
      style={{
        transition: `opacity .9s cubic-bezier(.2,.7,.2,1) ${delay}s, transform .9s cubic-bezier(.2,.7,.2,1) ${delay}s, filter .9s ease ${delay}s`,
        ...(visible ? { opacity: 1, transform: 'none', filter: 'none' } : from ? dir[from] : hidden[variant]),
        ...style,
      }}
    >
      {children}
    </T>
  );
}

const DIVIDERS: Record<Exclude<DividerPreset, 'none'>, string> = {
  floral:
    '<svg viewBox="0 0 200 40" fill="none"><path d="M100 20c-15-5-30-5-45 0-10 3-20 8-35 5M100 20c15-5 30-5 45 0 10 3 20 8 35 5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M100 20c-3-8-10-14-16-10 6-8 14-8 16 0m0 0c3-8 10-14 16-10-6-8-14-8-16 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><circle cx="100" cy="20" r="2.5" fill="currentColor"/></svg>',
  diamond:
    '<svg viewBox="0 0 200 20" fill="none"><path d="M10 10H86M114 10H190" stroke="currentColor" stroke-width="1"/><path d="M100 2l8 8-8 8-8-8z" stroke="currentColor" stroke-width="1.2"/><path d="M100 6l4 4-4 4-4-4z" fill="currentColor"/></svg>',
  dots: '<svg viewBox="0 0 120 12" fill="currentColor"><circle cx="40" cy="6" r="1.6"/><circle cx="52" cy="6" r="2.2"/><circle cx="60" cy="6" r="3"/><circle cx="68" cy="6" r="2.2"/><circle cx="80" cy="6" r="1.6"/></svg>',
  wave: '<svg viewBox="0 0 200 20" fill="none"><path d="M10 10c15-8 25 8 40 0s25-8 40 0 25 8 40 0 25-8 40 0 15 8 20 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
  line: '<svg viewBox="0 0 120 4" fill="none"><path d="M2 2H118" stroke="currentColor" stroke-width="1"/></svg>',
};

export function Divider({ spec, width = 170 }: { spec: ThemeSpec; width?: number }) {
  if (spec.divider === 'none' && !spec.dividerSvg) return null;
  const svg = spec.dividerSvg || DIVIDERS[spec.divider as Exclude<DividerPreset, 'none'>];
  return (
    <div
      aria-hidden
      style={{ width, margin: '14px auto', color: spec.palette.secondary, lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: svg.replace('<svg ', '<svg width="100%" ') }}
    />
  );
}

export function Corner({ svg, color, pos }: { svg: string; color: string; pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const rot = { tl: 0, tr: 90, br: 180, bl: 270 }[pos];
  const place: React.CSSProperties = {
    tl: { top: 6, left: 6 },
    tr: { top: 6, right: 6 },
    br: { bottom: 6, right: 6 },
    bl: { bottom: 6, left: 6 },
  }[pos];
  return (
    <div
      aria-hidden
      style={{ position: 'absolute', width: 34, height: 34, color, transform: `rotate(${rot}deg)`, pointerEvents: 'none', ...place }}
      dangerouslySetInnerHTML={{ __html: svg.replace('<svg ', '<svg width="100%" height="100%" ') }}
    />
  );
}

/** Foto dengan bingkai sesuai bentuk tema. */
export function Frame({
  src,
  alt,
  shape,
  palette,
  width,
  height,
  position = 'center',
  wrapImg,
}: {
  /** pembungkus gambar (mis. paralaks di dalam bingkai) */
  wrapImg?: (img: React.ReactNode) => React.ReactNode;
  src: string;
  alt: string;
  shape: FrameShape;
  palette: ThemePalette;
  width: number | string;
  height: number | string;
  position?: string;
}) {
  const radius: Record<FrameShape, string> = {
    arch: '999px 999px 6px 6px',
    circle: '999px',
    oval: '50%',
    rect: '6px',
    polaroid: '3px',
  };
  const img = src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, display: 'block' }} />
  ) : (
    <div style={{ width: '100%', height: '100%', background: palette.surface }} />
  );
  const media = wrapImg ? wrapImg(img) : img;
  if (shape === 'polaroid') {
    return (
      <div style={{ width, background: '#fff', padding: '10px 10px 34px', boxShadow: '0 14px 30px -18px rgba(0,0,0,.45)', transform: 'rotate(-1.5deg)', margin: '0 auto' }}>
        <div style={{ height, overflow: 'hidden' }}>{media}</div>
      </div>
    );
  }
  return (
    <div style={{ width, height, margin: '0 auto', padding: 6, borderRadius: radius[shape], border: `1.5px solid ${palette.secondary}` }}>
      <div style={{ width: '100%', height: '100%', borderRadius: radius[shape], overflow: 'hidden' }}>{media}</div>
    </div>
  );
}

/** Partikel atmosfer ringan (CSS keyframes, tanpa JS per frame). */
export function Ambient({ preset, palette }: { preset: AmbientPreset; palette: ThemePalette }) {
  if (preset === 'none') return null;
  const n = preset === 'snow' ? 26 : preset === 'sparkles' ? 22 : 14;
  const items = Array.from({ length: n }, (_, i) => {
    const r = (k: number) => {
      const x = Math.sin(i * 91.7 + k * 13.1) * 43758.5453;
      return x - Math.floor(x);
    };
    return { left: r(1) * 100, delay: -r(2) * 18, dur: 12 + r(3) * 14, size: r(4), drift: (r(5) - 0.5) * 80 };
  });
  const shape = (s: number): React.CSSProperties => {
    switch (preset) {
      case 'petals':
        return { width: 10 + s * 7, height: 7 + s * 4, borderRadius: '80% 10% 80% 10%', background: `linear-gradient(135deg, ${palette.secondary}, ${palette.primary})`, opacity: 0.5 };
      case 'leaves':
        return { width: 12 + s * 8, height: 6 + s * 3, borderRadius: '0 100% 0 100%', background: palette.secondary, opacity: 0.45 };
      case 'sparkles':
        return { width: 2 + s * 3, height: 2 + s * 3, borderRadius: 999, background: '#fff', boxShadow: `0 0 ${6 + s * 6}px ${palette.secondary}`, opacity: 0.85 };
      case 'bubbles':
        return { width: 8 + s * 16, height: 8 + s * 16, borderRadius: 999, border: `1px solid ${palette.secondary}`, opacity: 0.35 };
      case 'snow':
        return { width: 3 + s * 4, height: 3 + s * 4, borderRadius: 999, background: '#fff', opacity: 0.8 };
    }
    return {};
  };
  const rising = preset === 'bubbles' || preset === 'sparkles';
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      <style>{`
        @keyframes kit-fall { from { transform: translate3d(0,-10vh,0) rotate(0deg); } to { transform: translate3d(var(--drift),110vh,0) rotate(540deg); } }
        @keyframes kit-rise { from { transform: translate3d(0,110vh,0); } to { transform: translate3d(var(--drift),-10vh,0); } }
        @media (prefers-reduced-motion: reduce) { .kit-amb { animation: none !important; display: none; } }
      `}</style>
      {items.map((it, i) => (
        <span
          key={i}
          className="kit-amb"
          style={{
            position: 'absolute',
            top: 0,
            left: `${it.left}%`,
            ['--drift' as string]: `${it.drift}px`,
            animation: `${rising ? 'kit-rise' : 'kit-fall'} ${it.dur}s linear ${it.delay}s infinite`,
            ...shape(it.size),
          }}
        />
      ))}
    </div>
  );
}

export function fontImport(google: string) {
  return `@import url('https://fonts.googleapis.com/css2?family=${google}&display=swap');`;
}

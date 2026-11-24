'use client';

/**
 * Pasangan mempelai 2.5D yang berjalan bersama kamera.
 *
 * Tiap tokoh tersusun dari bagian-bagian (kaki, badan, lengan, kepala, wajah, kerudung) yang
 * diatur ulang setiap frame dari posisi kamera — bukan animasi waktu — sehingga setiap posisi
 * gulir punya pose yang pasti:
 * - di stasiun: menghadap penonton (tampak depan), hati kecil di atas
 * - saat kamera berjalan: memutar badan ke samping (profil), kaki & lengan berayun sesuai
 *   jarak tempuh, badan naik-turun, kepala sedikit menoleh
 */
import React, { useRef } from 'react';
import { kOf, useCamera, toScreen, type CamState } from '../kit/camera';
import { GROUND_PATH, INK } from './storybook.world';

const SKIN = '#E8BB92';
const HAIR = '#2C211B';
const SUIT = '#2F3E5C';
const SUIT2 = '#26324B';
const KEBAYA = '#FFF7EA';
const BATIK = '#9A6B3E';
const GOLD = '#D8A845';
const st = { stroke: INK, strokeWidth: 1.3, strokeLinejoin: 'round' as const };

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const f = (n: number) => n.toFixed(2);

type Refs = Record<string, SVGElement | null>;

function pose(c: CamState) {
  const s = smooth(0, 0.14, c.travel) * (1 - smooth(0.86, 1, c.travel));
  const dist = kOf(0.72) * c.x;
  const ph = (dist / 46) * Math.PI * 2;
  return { s, leg: Math.sin(ph) * 24 * s, bob: -Math.abs(Math.sin(ph)) * 2.6 * s, ph };
}

function Groom({ R }: { R: React.MutableRefObject<Refs> }) {
  const r = (k: string) => (el: SVGElement | null) => {
    R.current['g.' + k] = el;
  };
  return (
    <g>
      <g ref={r('armB')} transform="translate(-10 -80)">
        <rect x={-4} y={0} width={8} height={34} rx={4} fill={SUIT2} {...st} />
        <circle cy={37} r={3.8} fill={SKIN} {...st} strokeWidth={1} />
      </g>
      <g ref={r('legB')} transform="translate(-5 -46)">
        <rect x={-4.5} y={0} width={9} height={42} rx={3} fill={SUIT2} {...st} />
        <path d="M-5 42h12a3 3 0 0 1 0 5h-12Z" fill={HAIR} {...st} strokeWidth={1} />
      </g>
      <g ref={r('legF')} transform="translate(5 -46)">
        <rect x={-4.5} y={0} width={9} height={42} rx={3} fill={SUIT} {...st} />
        <path d="M-5 42h12a3 3 0 0 1 0 5h-12Z" fill={HAIR} {...st} strokeWidth={1} />
      </g>
      <g ref={r('body')}>
        <path ref={r('torso')} d="M-15 -86Q0 -91 15 -86L13 -44L-13 -44Z" fill={SUIT} {...st} />
        <path ref={r('shirt')} d="M-5 -88L0 -66L5 -88Z" fill="#FFFFFF" {...st} strokeWidth={1} />
        <circle ref={r('flower')} cx={-8} cy={-78} r={2.6} fill="#FFFFFF" {...st} strokeWidth={0.8} />
        <g ref={r('armF')} transform="translate(10 -80)">
          <rect x={-4} y={0} width={8} height={34} rx={4} fill={SUIT} {...st} />
          <circle cy={37} r={3.8} fill={SKIN} {...st} strokeWidth={1} />
        </g>
        <g ref={r('head')}>
          <rect x={-3.5} y={-92} width={7} height={8} fill={SKIN} {...st} strokeWidth={1} />
          <circle cx={0} cy={-102} r={12.5} fill={SKIN} {...st} />
          <path d="M-12.5 -104C-12 -116 12 -116 12.5 -104C8 -110 -8 -110 -12.5 -104Z" fill={HAIR} {...st} strokeWidth={1} />
          {/* peci */}
          <path d="M-11.5 -111L-10.5 -121Q0 -124 10.5 -121L11.5 -111Q0 -113 -11.5 -111Z" fill="#1E1A1A" {...st} strokeWidth={1} />
          <g ref={r('face')}>
            <circle ref={r('eyeB')} cx={-4.5} cy={-102} r={1.4} fill={HAIR} />
            <circle cx={4.5} cy={-102} r={1.4} fill={HAIR} />
            <path d="M-3 -96Q0 -93.5 3 -96" stroke={HAIR} strokeWidth={1.1} fill="none" strokeLinecap="round" />
            <circle cx={7} cy={-98} r={2.2} fill="#F09C8C" opacity={0.55} />
          </g>
          <ellipse ref={r('ear')} cx={-4} cy={-101} rx={2.2} ry={3} fill={SKIN} {...st} strokeWidth={0.9} opacity={0} />
        </g>
      </g>
    </g>
  );
}

function Bride({ R }: { R: React.MutableRefObject<Refs> }) {
  const r = (k: string) => (el: SVGElement | null) => {
    R.current['b.' + k] = el;
  };
  return (
    <g>
      <path ref={r('veil')} d="M-10 -116C-26 -110 -28 -70 -22 -42L8 -42C2 -70 6 -104 -10 -116Z" fill="#FFFFFF" fillOpacity={0.85} {...st} strokeWidth={1} />
      <g ref={r('armB')} transform="translate(-9 -80)">
        <rect x={-3.5} y={0} width={7} height={32} rx={3.5} fill={KEBAYA} {...st} />
        <circle cy={34} r={3.4} fill={SKIN} {...st} strokeWidth={1} />
      </g>
      <g ref={r('feet')}>
        <ellipse ref={r('footB')} cx={-4} cy={-1} rx={5} ry={2.6} fill="#C99A5A" {...st} strokeWidth={0.9} />
        <ellipse ref={r('footF')} cx={4} cy={-1} rx={5} ry={2.6} fill="#D8AE6A" {...st} strokeWidth={0.9} />
      </g>
      <g ref={r('body')}>
        <path ref={r('skirt')} d="M-11 -46L-15 -2L15 -2L11 -46Z" fill={BATIK} {...st} />
        <path ref={r('batik')} d="M-12 -36H12M-13 -26H13M-14 -16H14" stroke={GOLD} strokeWidth={1.2} />
        <path ref={r('torso')} d="M-12 -84Q0 -88 12 -84L11 -44L-11 -44Z" fill={KEBAYA} {...st} />
        <path ref={r('sash')} d="M-11 -80L11 -58L11 -52L-11 -74Z" fill={GOLD} {...st} strokeWidth={0.9} />
        <g ref={r('armF')} transform="translate(9 -80)">
          <rect x={-3.5} y={0} width={7} height={32} rx={3.5} fill={KEBAYA} {...st} />
          <circle cy={34} r={3.4} fill={SKIN} {...st} strokeWidth={1} />
        </g>
        <g ref={r('head')}>
          <rect x={-3} y={-90} width={6} height={7} fill={SKIN} {...st} strokeWidth={1} />
          <circle ref={r('bun')} cx={-9} cy={-106} r={6} fill={HAIR} {...st} strokeWidth={1} />
          <circle cx={0} cy={-100} r={11.5} fill={SKIN} {...st} />
          <path d="M-11.5 -101C-12 -114 12 -114 11.5 -101C7 -108 -7 -108 -11.5 -101Z" fill={HAIR} {...st} strokeWidth={1} />
          {[-10, -6, -2].map((x) => (
            <circle key={x} cx={x} cy={-110} r={1.8} fill="#FFFFFF" {...st} strokeWidth={0.6} />
          ))}
          <g ref={r('face')}>
            <circle ref={r('eyeB')} cx={-4} cy={-100} r={1.3} fill={HAIR} />
            <circle cx={4} cy={-100} r={1.3} fill={HAIR} />
            <path d="M-2.6 -94.5Q0 -92.4 2.6 -94.5" stroke="#B5523B" strokeWidth={1.1} fill="none" strokeLinecap="round" />
            <circle cx={6.5} cy={-96.5} r={2.1} fill="#F09C8C" opacity={0.6} />
            <circle ref={r('cheekB')} cx={-6.5} cy={-96.5} r={2.1} fill="#F09C8C" opacity={0.6} />
          </g>
        </g>
      </g>
    </g>
  );
}

export default function StorybookCouple() {
  const root = useRef<SVGGElement>(null);
  const heart = useRef<SVGGElement>(null);
  const groomG = useRef<SVGGElement>(null);
  const brideG = useRef<SVGGElement>(null);
  const R = useRef<Refs>({});

  useCamera((c) => {
    const g = root.current;
    if (!g) return;
    const { s, leg, bob, ph } = pose(c);
    const k = kOf(0.72);
    const L = k * c.x + 200;
    const p = toScreen(c, 0.72, L, GROUND_PATH + 4);
    const scale = p.s * 0.92;
    g.setAttribute('transform', `translate(${f(p.x)} ${f(p.y)}) scale(${f(scale)})`);
    const set = (key: string, attr: string, v: string) => R.current[key]?.setAttribute(attr, v);
    const op = (key: string, v: number) => R.current[key]?.setAttribute('opacity', f(Math.max(0, Math.min(1, v))));

    // jarak antartokoh merapat saat berjalan berdampingan (tampak samping)
    groomG.current?.setAttribute('transform', `translate(${f(17 - 9 * s)} ${f(bob)})`);
    brideG.current?.setAttribute('transform', `translate(${f(-17 + 2 * s)} ${f(-Math.abs(Math.sin(ph + 1.2)) * 2.2 * s)})`);
    heart.current?.setAttribute('opacity', f(Math.max(0, 1 - s * 3)));

    // ---- pengantin pria
    const w = 15 - 5 * s;
    set('g.torso', 'd', `M${f(-w)} -86Q0 -91 ${f(w)} -86L${f(w - 2)} -44L${f(-w + 2)} -44Z`);
    op('g.shirt', 1 - s * 1.4);
    set('g.shirt', 'transform', `translate(${f(4 * s)} 0)`);
    set('g.flower', 'transform', `translate(${f(10 * s)} 0)`);
    set('g.legB', 'transform', `translate(${f(-5 + 4 * s)} -46) rotate(${f(-leg)})`);
    set('g.legF', 'transform', `translate(${f(5 - 4 * s)} -46) rotate(${f(leg)})`);
    set('g.armB', 'transform', `translate(${f(-10 + 9 * s)} -80) rotate(${f(leg * 0.9)})`);
    set('g.armF', 'transform', `translate(${f(10 - 9 * s)} -80) rotate(${f(-leg * 0.9)})`);
    set('g.head', 'transform', `translate(${f(2.5 * s)} 0)`);
    set('g.face', 'transform', `translate(${f(5 * s)} 0)`);
    op('g.eyeB', 1 - s * 1.8);
    op('g.ear', s * 1.5);

    // ---- pengantin wanita
    const bw = 12 - 4 * s;
    set('b.torso', 'd', `M${f(-bw)} -84Q0 -88 ${f(bw)} -84L${f(bw - 1)} -44L${f(-bw + 1)} -44Z`);
    const sk = 11 - 3 * s;
    const sb = 15 - 4 * s + Math.abs(leg) * 0.12;
    const sway = leg * 0.12;
    set('b.skirt', 'd', `M${f(-sk)} -46L${f(-sb + sway)} -2L${f(sb + sway)} -2L${f(sk)} -46Z`);
    set('b.batik', 'd', `M${f(-sk - 1)} -36H${f(sk + 1)}M${f(-sk - 2 + sway * 0.4)} -26H${f(sk + 2 + sway * 0.4)}M${f(-sk - 3 + sway * 0.7)} -16H${f(sk + 3 + sway * 0.7)}`);
    set('b.sash', 'transform', `translate(0 0) scale(${f(1 - s * 0.35)} 1)`);
    set('b.footB', 'cx', f(-4 + 3 * s + Math.sin(ph) * 7 * s));
    set('b.footF', 'cx', f(4 - 3 * s - Math.sin(ph) * 7 * s));
    set('b.armB', 'transform', `translate(${f(-9 + 8 * s)} -80) rotate(${f(-leg * 0.7)})`);
    set('b.armF', 'transform', `translate(${f(9 - 8 * s)} -80) rotate(${f(leg * 0.7)})`);
    set('b.head', 'transform', `translate(${f(2 * s)} 0)`);
    set('b.face', 'transform', `translate(${f(4.5 * s)} 0)`);
    set('b.bun', 'cx', f(-9 - 2 * s));
    op('b.eyeB', 1 - s * 1.8);
    op('b.cheekB', 0.6 - s);
    set('b.veil', 'transform', `translate(${f(-6 * s)} 0) skewX(${f(-6 * s - leg * 0.1)})`);
  });

  return (
    <svg aria-hidden width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <ellipse cx={0} cy={0} rx={0} ry={0} />
      <g ref={root}>
        <ellipse cx={0} cy={2} rx={40} ry={5} fill="#000" opacity={0.14} />
        <g ref={brideG}>
          <Bride R={R} />
        </g>
        <g ref={groomG}>
          <Groom R={R} />
        </g>
        <g ref={heart} transform="translate(0 -142)">
          <g style={{ animation: 'sbw-heart 2.4s ease-in-out infinite alternate' }}>
            <path d="M0 8C-14 -2 -10 -14 -3 -12C-1 -11.5 0 -10 0 -9C0 -10 1 -11.5 3 -12C10 -14 14 -2 0 8Z" fill="#E36B6B" {...st} strokeWidth={1} />
          </g>
        </g>
      </g>
      <style>{'@keyframes sbw-heart { from { transform: translateY(0) scale(1) } to { transform: translateY(-6px) scale(1.12) } }'}</style>
    </svg>
  );
}

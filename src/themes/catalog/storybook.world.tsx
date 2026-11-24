/**
 * Heirloom Storybook — dunia cerita yang dilewati kamera.
 *
 * Gaya: ilustrasi buku cerita gouache dengan garis tinta cokelat (bukan bentuk vektor polos):
 * isian datar berwarna lembut + garis tinta tipis + bayangan lembut di sisi kanan bawah.
 *
 * Satu perjalanan pagi → malam melewati 11 stasiun (satu per bagian undangan):
 *  0 rumah pondok   1 pohon tua & ayunan   2 kolam & jembatan kayu   3 menara jam di bukit
 *  4 masjid & tarub berjanur   5 sungai & jembatan batu   6 jemuran bingkai foto
 *  7 kantor pos   8 gazebo lampion   9 sumur harapan   10 rumah di bukit + kembang api
 */
import React from 'react';
import { ridgePath, ridgeY, seeded } from '../kit/scene';
import { atStation, kOf, type CamLayer, type CamPoint } from '../kit/camera';

export const STEP = 700;
export const N_ST = 11;
export const STATIONS: CamPoint[] = Array.from({ length: N_ST }, (_, i) => ({
  x: i * STEP,
  y: i === 3 ? -40 : i === 10 ? 30 : 0,
  z: i === 2 ? 1.08 : i === 3 ? 1.1 : i === 10 ? 0.92 : 1,
}));
const CAM_MAX = (N_ST - 1) * STEP;
const widthOf = (depth: number) => Math.ceil(kOf(depth) * CAM_MAX + 900);

export const INK = '#3B2A1E';
const C = {
  cream: '#FBF3E2',
  paper: '#F4E8CF',
  roof: '#B5523B',
  roof2: '#8E4A3A',
  wall: '#F1E2C4',
  wood: '#9A6B47',
  wood2: '#7A5236',
  leaf: '#7FA36B',
  leaf2: '#5E8653',
  leaf3: '#A6C287',
  pine: '#4F7A5A',
  water: '#8DBFD0',
  water2: '#B9DCE4',
  stone: '#C9BFAE',
  gold: '#D8A845',
  rose: '#E39A93',
  sky: '#CFE3EC',
};
const ink = { stroke: INK, strokeWidth: 1.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const f = (n: number) => n.toFixed(1);

// ------------------------------------------------------------------ primitif

function Tree({ x, y, s = 1, kind = 'round', seed = 1 }: { x: number; y: number; s?: number; kind?: 'round' | 'pine' | 'palm' | 'banana' | 'willow'; seed?: number }) {
  const r = seeded(seed);
  if (kind === 'pine') {
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <rect x={-3} y={-14} width={6} height={14} fill={C.wood2} {...ink} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${-26 + i * 5} ${-12 - i * 20}L0 ${-48 - i * 22}L${26 - i * 5} ${-12 - i * 20}Z`} fill={i % 2 ? C.pine : '#5D8B67'} {...ink} />
        ))}
      </g>
    );
  }
  if (kind === 'palm') {
    const lean = (r() - 0.5) * 16;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d={`M-3 0Q${lean * 0.4} -60 ${lean} -118L${lean + 5} -118Q${lean * 0.4 + 6} -60 4 0Z`} fill={C.wood} {...ink} />
        {[-150, -115, -70, -35, 0, 25].map((a, i) => {
          const rad = (a * Math.PI) / 180;
          const ex = lean + 2 + Math.cos(rad) * 56;
          const ey = -118 + Math.sin(rad) * 22 + 18;
          return <path key={i} d={`M${lean + 2} -118Q${f((lean + ex) / 2)} ${f(-138 + Math.abs(Math.cos(rad)) * 6)} ${f(ex)} ${f(ey)}Q${f((lean + ex) / 2)} ${f(-128)} ${lean + 2} -116Z`} fill={i % 2 ? C.leaf2 : C.leaf} {...ink} />;
        })}
        <circle cx={lean + 4} cy={-112} r={4} fill={C.wood2} {...ink} />
      </g>
    );
  }
  if (kind === 'banana') {
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M-4 0L-3 -50L3 -50L4 0Z" fill="#9DB46A" {...ink} />
        {[-60, -20, 20, 60, 100, 140].map((a, i) => (
          <path key={i} transform={`translate(0 -50) rotate(${a - 90 + (r() - 0.5) * 10})`} d="M0 0C10 -6 34 -8 46 -2C34 6 12 8 0 0Z" fill={i % 2 ? '#8DB463' : '#A9C977'} {...ink} />
        ))}
      </g>
    );
  }
  if (kind === 'willow') {
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M-6 0C-4 -30 -6 -60 0 -84C6 -60 4 -30 6 0Z" fill={C.wood} {...ink} />
        <path d="M-50 -40C-56 -90 -20 -118 0 -116C24 -118 58 -92 50 -40C40 -60 30 -30 22 -50C14 -26 6 -50 0 -34C-8 -52 -16 -26 -24 -48C-32 -30 -42 -58 -50 -40Z" fill={C.leaf3} {...ink} />
      </g>
    );
  }
  const w = 34 + r() * 12;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M-5 0C-4 -20 -6 -40 -2 -56L2 -56C6 -40 4 -20 5 0Z`} fill={C.wood} {...ink} />
      <path d={`M${-w} -60C${-w - 6} -92 ${-w * 0.4} -${110 + r() * 10} 0 -106C${w * 0.5} -${116 + r() * 8} ${w + 8} -92 ${w} -60C${w - 6} -44 ${-w + 6} -44 ${-w} -60Z`} fill={seed % 2 ? C.leaf : C.leaf2} {...ink} />
      <path d={`M${-w * 0.5} -84C${-w * 0.3} -96 ${-w * 0.05} -98 ${w * 0.1} -94`} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

function House({ x, y, s = 1, roof = C.roof, wall = C.wall, kind = 'cottage' }: { x: number; y: number; s?: number; roof?: string; wall?: string; kind?: 'cottage' | 'joglo' }) {
  if (kind === 'joglo') {
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <rect x={-44} y={-40} width={88} height={40} fill={wall} {...ink} />
        <path d="M-62 -40L-40 -62L-16 -64L0 -92L16 -64L40 -62L62 -40Z" fill={roof} {...ink} />
        <rect x={-8} y={-26} width={16} height={26} fill={C.wood2} {...ink} />
        <rect x={-34} y={-30} width={14} height={12} fill={C.sky} {...ink} />
        <rect x={20} y={-30} width={14} height={12} fill={C.sky} {...ink} />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-34} y={-46} width={68} height={46} fill={wall} {...ink} />
      <path d="M-44 -44L0 -86L44 -44Z" fill={roof} {...ink} />
      <rect x={14} y={-82} width={10} height={22} fill={C.roof2} {...ink} />
      <rect x={-8} y={-28} width={16} height={28} rx={7} fill={C.wood2} {...ink} />
      <rect x={-26} y={-36} width={12} height={12} fill={C.sky} {...ink} />
      <rect x={14} y={-36} width={12} height={12} fill={C.sky} {...ink} />
      <path d="M-26 -30H-14M-20 -36V-24M14 -30H26M20 -36V-24" stroke={INK} strokeWidth={0.8} />
    </g>
  );
}

function Fence({ x0, x1, y }: { x0: number; x1: number; y: number }) {
  const n = Math.floor((x1 - x0) / 14);
  return (
    <g>
      <path d={`M${x0} ${y - 14}H${x1}M${x0} ${y - 6}H${x1}`} stroke={C.wood2} strokeWidth={2.4} />
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M${x0 + i * 14 + 2} ${y}V${y - 20}L${x0 + i * 14 + 5} ${y - 24}L${x0 + i * 14 + 8} ${y - 20}V${y}Z`} fill={C.cream} {...ink} strokeWidth={1} />
      ))}
    </g>
  );
}

function Flowers({ x0, x1, y, seed, n = 20 }: { x0: number; x1: number; y: number; seed: number; n?: number }) {
  const r = seeded(seed);
  const cols = [C.rose, '#F3D27A', '#FFFFFF', '#C9A7D8', '#F0A574'];
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + r() * (x1 - x0);
        const yy = y + r() * 10;
        const c = cols[Math.floor(r() * cols.length)];
        return (
          <g key={i}>
            <path d={`M${f(x)} ${f(yy)}v-${f(8 + r() * 8)}`} stroke={C.leaf2} strokeWidth={1.2} />
            <circle cx={x} cy={yy - 12} r={3.4} fill={c} stroke={INK} strokeWidth={0.8} />
          </g>
        );
      })}
    </g>
  );
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-60 0C-70 -16 -50 -30 -36 -24C-32 -44 -6 -50 6 -34C16 -50 46 -44 46 -24C62 -28 72 -8 60 0Z" fill="#FFFDF7" {...ink} strokeWidth={1.1} />
      <path d="M-44 -4C-30 -2 10 -2 40 -4" stroke="#E9DED0" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

// ------------------------------------------------------------------ penanda stasiun (lapisan tengah, d 0.5)

const MID = 0.5;
const GROUND_MID = 612;
const S = (i: number, dx = 0) => atStation(MID, i * STEP, dx);

function Mosque({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-50} y={-56} width={100} height={56} fill={C.cream} {...ink} />
      <path d="M-36 -56C-36 -100 36 -100 36 -56Z" fill="#6FA38F" {...ink} />
      <path d="M0 -96V-112M-5 -108A6 6 0 1 0 5 -108" stroke={INK} strokeWidth={1.4} fill="none" />
      {[-34, -12, 12, 34].map((dx) => (
        <path key={dx} d={`M${dx - 7} 0V-28A7 7 0 0 1 ${dx + 7} -28V0Z`} fill={C.wood2} {...ink} />
      ))}
      <rect x={58} y={-120} width={16} height={120} fill={C.cream} {...ink} />
      <path d="M54 -120H78L66 -142Z" fill="#6FA38F" {...ink} />
      <rect x={60} y={-96} width={12} height={4} fill={C.gold} />
    </g>
  );
}

function Tarub({ x, y }: { x: number; y: number }) {
  // tenda resepsi dengan janur melengkung & untaian lampu (lampu di lapisan cahaya)
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-70 -70L0 -100L70 -70Z" fill="#FFF7EA" {...ink} />
      <path d="M-70 -70C-46 -60 -24 -60 0 -70C24 -60 46 -60 70 -70" fill="#F3D9C9" {...ink} />
      <path d="M-66 -66V0M66 -66V0M-22 -64V0M22 -64V0" stroke={C.wood2} strokeWidth={3} />
      <rect x={-50} y={-30} width={100} height={30} fill="#F7E6D3" {...ink} />
      <path d="M-30 -30C-30 -42 30 -42 30 -30" fill="#E8B7A8" {...ink} />
      {/* janur kuning */}
      {[-84, 84].map((jx) => (
        <g key={jx} transform={`translate(${jx} 0)`}>
          <path d="M0 0V-96" stroke="#C9A24B" strokeWidth={2.4} />
          <path d={`M0 -96C${jx > 0 ? -30 : 30} -112 ${jx > 0 ? -44 : 44} -90 ${jx > 0 ? -40 : 40} -66`} stroke="#E8C66A" strokeWidth={3} fill="none" />
          {[0, 1, 2, 3, 4].map((k) => (
            <path key={k} d={`M0 ${-90 + k * 10}l${jx > 0 ? -10 : 10} 8`} stroke="#E8C66A" strokeWidth={2} />
          ))}
        </g>
      ))}
    </g>
  );
}

function ClockTower({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-22 0V-150H22V0Z" fill={C.cream} {...ink} />
      <path d="M-28 -150L0 -196L28 -150Z" fill={C.roof} {...ink} />
      <circle cx={0} cy={-122} r={15} fill="#FFFDF5" {...ink} />
      <path d="M0 -122V-132M0 -122L7 -118" stroke={INK} strokeWidth={1.6} />
      <rect x={-8} y={-40} width={16} height={40} rx={8} fill={C.wood2} {...ink} />
      <path d="M-22 -84H22M-22 -62H22" stroke={INK} strokeWidth={0.8} />
    </g>
  );
}

function PondBridge({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={6} rx={120} ry={20} fill={C.water} {...ink} />
      <path d="M-90 6C-60 0 -30 10 0 4C30 -2 60 10 90 4" stroke={C.water2} strokeWidth={3} fill="none" />
      <path d="M-76 4C-50 -34 50 -34 76 4" fill="none" stroke={C.wood} strokeWidth={7} />
      <path d="M-76 4C-50 -34 50 -34 76 4" fill="none" stroke={INK} strokeWidth={1.2} />
      {[-52, -26, 0, 26, 52].map((dx) => (
        <path key={dx} d={`M${dx} ${-20 + Math.abs(dx) * 0.24}V${-38 + Math.abs(dx) * 0.24}`} stroke={C.wood2} strokeWidth={2.2} />
      ))}
      <path d="M-62 -14C-40 -44 40 -44 62 -14" fill="none" stroke={C.wood2} strokeWidth={2} />
      {/* teratai */}
      {[-92, 70, 96].map((lx, i) => (
        <g key={i}>
          <ellipse cx={lx} cy={10} rx={10} ry={3.5} fill={C.leaf2} {...ink} strokeWidth={0.8} />
          <circle cx={lx + 2} cy={6} r={3} fill={C.rose} stroke={INK} strokeWidth={0.7} />
        </g>
      ))}
    </g>
  );
}

function StoneBridge({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-160 10C-80 -6 80 22 160 6V30H-160Z" fill={C.water} {...ink} />
      <path d="M-90 4H90V-30C60 -36 40 -36 30 -30C20 -2 -20 -2 -30 -30C-40 -36 -60 -36 -90 -30Z" fill={C.stone} {...ink} />
      <path d="M-30 -30C-20 -2 20 -2 30 -30" fill={C.water2} {...ink} />
      <path d="M-90 -30H90" stroke={INK} strokeWidth={1.2} />
      {[-70, -50, 50, 70].map((dx) => (
        <path key={dx} d={`M${dx} -30V-40`} stroke={INK} strokeWidth={1.2} />
      ))}
      <path d="M-92 -40H92" stroke={C.wood2} strokeWidth={2.4} />
    </g>
  );
}

function FrameLine({ x, y }: { x: number; y: number }) {
  // jemuran bingkai foto di antara dua pohon (isi bingkai: lukisan kecil)
  const frames = [-60, -20, 20, 60];
  return (
    <g transform={`translate(${x} ${y})`}>
      <Tree x={-110} y={0} s={1.05} seed={61} />
      <Tree x={110} y={0} s={0.95} seed={62} />
      <path d="M-104 -70Q0 -40 104 -70" stroke={C.wood2} strokeWidth={1.2} fill="none" />
      {frames.map((fx, i) => {
        const fy = -70 + 30 * (1 - Math.pow(fx / 104, 2));
        return (
          <g key={i} transform={`translate(${fx} ${fy}) rotate(${(i - 1.5) * 4})`}>
            <rect x={-14} y={2} width={28} height={34} fill="#FFFDF5" {...ink} />
            <rect x={-10} y={6} width={20} height={20} fill={[C.sky, '#F4D7B5', C.leaf3, '#E9C6D6'][i]} />
            <circle cx={-3} cy={20} r={4} fill={C.leaf2} />
            <path d="M-10 26L0 16L10 26" fill={C.leaf} />
          </g>
        );
      })}
    </g>
  );
}

function PostOffice({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-56} y={-60} width={112} height={60} fill="#F6E7CF" {...ink} />
      <path d="M-66 -60H66L56 -80H-56Z" fill="#E08A4F" {...ink} />
      <rect x={-30} y={-54} width={60} height={14} fill="#FFFDF5" {...ink} />
      <text x={0} y={-43} textAnchor="middle" fontFamily="Georgia, serif" fontSize={11} fill={INK} letterSpacing="2">POS</text>
      <rect x={-12} y={-32} width={24} height={32} fill={C.wood2} {...ink} />
      <rect x={-46} y={-32} width={22} height={16} fill={C.sky} {...ink} />
      <rect x={24} y={-32} width={22} height={16} fill={C.sky} {...ink} />
      <g transform="translate(80 0)">
        <rect x={-2} y={-30} width={4} height={30} fill={INK} />
        <path d="M-12 -30V-52A12 12 0 0 1 12 -52V-30Z" fill="#C8402F" {...ink} />
        <rect x={-6} y={-48} width={12} height={2.4} fill={INK} />
      </g>
    </g>
  );
}

function Gazebo({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-60 -64L0 -104L60 -64Z" fill="#B4675A" {...ink} />
      <path d="M-56 -64V0M56 -64V0M-20 -64V0M20 -64V0" stroke={C.cream} strokeWidth={5} />
      <path d="M-56 -64V0M56 -64V0M-20 -64V0M20 -64V0" stroke={INK} strokeWidth={0.9} opacity={0.6} />
      <path d="M-62 -10H62" stroke={C.wood2} strokeWidth={4} />
      <path d="M-60 -64Q0 -50 60 -64" stroke={INK} strokeWidth={1} fill="none" />
    </g>
  );
}

function Well({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-34 0V-26H34V0Z" fill={C.stone} {...ink} />
      <path d="M-34 -18H34M-34 -9H34M-16 -26V-18M10 -18V-9M-6 -9V0M22 -26V-18" stroke={INK} strokeWidth={0.8} />
      <path d="M-30 -26V-70M30 -26V-70" stroke={C.wood2} strokeWidth={4} />
      <path d="M-42 -66L0 -94L42 -66Z" fill={C.roof} {...ink} />
      <path d="M-30 -56H30" stroke={C.wood} strokeWidth={3} />
      <path d="M0 -56V-38" stroke={INK} strokeWidth={1} />
      <rect x={-6} y={-38} width={12} height={10} fill={C.wood} {...ink} />
    </g>
  );
}

function Manor({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-180 40C-120 -60 120 -60 180 40Z" fill="#6C8F6A" {...ink} />
      <g transform="translate(0 -34)">
        <rect x={-60} y={-60} width={120} height={60} fill={C.cream} {...ink} />
        <path d="M-72 -58L0 -112L72 -58Z" fill={C.roof} {...ink} />
        <rect x={-14} y={-34} width={28} height={34} rx={14} fill={C.wood2} {...ink} />
        {[-44, -26, 18, 36].map((wx) => (
          <rect key={wx} x={wx} y={-48} width={10} height={14} fill={C.sky} {...ink} />
        ))}
        <circle cx={0} cy={-78} r={8} fill={C.sky} {...ink} />
      </g>
    </g>
  );
}

// ------------------------------------------------------------------ lapisan

function farMountains() {
  const w = widthOf(0.15);
  return (
    <>
      <path d={ridgePath({ w, h: 1200, base: 500, amp: 70, rough: 5, seed: 3, step: 12 })} fill="#B9C6CF" {...ink} strokeWidth={1} />
      {/* gunung berapi khas — muncul di beberapa stasiun */}
      {[1, 4, 8].map((i) => {
        const cx = atStation(0.15, i * STEP, i === 4 ? 120 : -100);
        return (
          <g key={i}>
            <path d={`M${cx - 190} 520L${cx - 34} 330Q${cx} 318 ${cx + 34} 330L${cx + 190} 520Z`} fill="#A3B3C2" {...ink} strokeWidth={1} />
            {/* sisi terang & alur lereng bergaris tinta */}
            <path d={`M${cx - 34} 330Q${cx} 318 ${cx + 34} 330L${cx + 190} 520L${cx + 40} 520Q${cx + 20} 420 ${cx + 6} 332Z`} fill="#BCC9D4" />
            {[-120, -80, -44, 30, 70, 110].map((dx, j) => (
              <path key={j} d={`M${cx + dx * 0.25} ${336 + Math.abs(dx) * 0.05}Q${cx + dx * 0.6} ${420} ${cx + dx} ${506 - (j % 2) * 10}`} stroke={INK} strokeOpacity={0.35} strokeWidth={0.9} fill="none" />
            ))}
            <path d={`M${cx - 30} 334Q${cx - 14} 346 ${cx} 336Q${cx + 14} 348 ${cx + 30} 334`} stroke={INK} strokeOpacity={0.5} fill="none" />
          </g>
        );
      })}
      <path d={ridgePath({ w, h: 1200, base: 540, amp: 30, rough: 7, seed: 5, step: 12 })} fill="#C9D3CF" {...ink} strokeWidth={1} />
    </>
  );
}

function hills() {
  const w = widthOf(0.3);
  const r = seeded(17);
  const o = { w, base: 580, amp: 34, rough: 12, seed: 9 };
  return (
    <>
      <path d={ridgePath({ ...o, h: 1200, step: 10 })} fill="#A9C690" {...ink} strokeWidth={1.1} />
      {/* petak sawah bergaris di lereng bukit */}
      {Array.from({ length: Math.floor(w / 260) }, (_, i) => {
        const x0 = 60 + i * 260 + r() * 60;
        return (
          <g key={`t${i}`}>
            {[0, 1, 2, 3].map((k) => {
              const y0 = ridgeY(o, x0 + 60) + 10 + k * 9;
              return <path key={k} d={`M${x0 + k * 6} ${y0}Q${x0 + 60} ${y0 - 5} ${x0 + 120 - k * 6} ${y0}`} stroke="#7FA36B" strokeWidth={1.6} fill="none" strokeLinecap="round" />;
            })}
          </g>
        );
      })}
      {Array.from({ length: Math.floor(w / 46) }, (_, i) => {
        const x = i * 46 + r() * 30;
        const y = ridgeY(o, x) + 6;
        return r() > 0.55 ? <Tree key={i} x={x} y={y} s={0.42 + r() * 0.2} kind={r() > 0.6 ? 'pine' : 'round'} seed={i} /> : null;
      })}
      {Array.from({ length: Math.floor(w / 300) }, (_, i) => {
        const x = 140 + i * 300 + r() * 80;
        return <House key={i} x={x} y={ridgeY(o, x) + 8} s={0.38} roof={i % 2 ? C.roof : '#C07D4F'} kind={i % 3 === 0 ? 'joglo' : 'cottage'} />;
      })}
    </>
  );
}

function midLayer() {
  const w = widthOf(MID);
  const r = seeded(23);
  const filler = [];
  // pengisi di antara stasiun: pohon, pondok, sawah kecil
  for (let i = 0; i < N_ST - 1; i++) {
    const a = S(i, 200);
    const b = S(i + 1, -200);
    for (let x = a; x < b; x += 70 + r() * 60) {
      const k = r();
      filler.push(<Tree key={`${i}-${x}`} x={x} y={GROUND_MID + 2} s={0.7 + r() * 0.35} kind={k > 0.75 ? 'palm' : k > 0.6 ? 'banana' : k > 0.45 ? 'pine' : 'round'} seed={Math.floor(x)} />);
    }
  }
  return (
    <>
      <rect x={-200} y={GROUND_MID - 4} width={w + 400} height={700} fill="#9FBF7E" />
      <path d={ridgePath({ w, h: 1300, base: GROUND_MID, amp: 8, rough: 20, seed: 31, step: 10 })} fill="#9FBF7E" {...ink} strokeWidth={1.1} />
      {filler}
      {/* 0 pondok */}
      <House x={S(0, -96)} y={GROUND_MID + 4} s={1.15} />
      <Tree x={S(0, 104)} y={GROUND_MID + 4} s={1.2} seed={3} />
      <Fence x0={S(0, -170)} x1={S(0, -40)} y={GROUND_MID + 10} />
      {/* 1 pohon tua & ayunan */}
      <g>
        <Tree x={S(1, 60)} y={GROUND_MID + 4} s={1.7} seed={8} />
        <path d={`M${S(1, 30)} ${GROUND_MID - 96}V${GROUND_MID - 30}M${S(1, 50)} ${GROUND_MID - 98}V${GROUND_MID - 30}`} stroke={INK} strokeWidth={1} />
        <rect x={S(1, 26)} y={GROUND_MID - 32} width={28} height={5} fill={C.wood} {...ink} strokeWidth={1} />
        <Flowers x0={S(1, -160)} x1={S(1, 160)} y={GROUND_MID + 6} seed={11} n={26} />
      </g>
      {/* 2 kolam & jembatan */}
      <Tree x={S(2, -150)} y={GROUND_MID + 4} s={1.1} kind="willow" />
      <PondBridge x={S(2, 10)} y={GROUND_MID + 4} />
      {/* 3 menara jam di bukit */}
      <path d={`M${S(3, -220)} ${GROUND_MID + 4}C${S(3, -120)} ${GROUND_MID - 70} ${S(3, 120)} ${GROUND_MID - 70} ${S(3, 220)} ${GROUND_MID + 4}Z`} fill="#93B676" {...ink} />
      <ClockTower x={S(3, 0)} y={GROUND_MID - 50} />
      {/* 4 masjid & tarub */}
      <Mosque x={S(4, -110)} y={GROUND_MID + 4} />
      <Tarub x={S(4, 110)} y={GROUND_MID + 4} />
      {/* 5 sungai & jembatan batu */}
      <StoneBridge x={S(5, 0)} y={GROUND_MID + 4} />
      {/* 6 jemuran bingkai */}
      <FrameLine x={S(6, 0)} y={GROUND_MID + 4} />
      {/* 7 kantor pos */}
      <PostOffice x={S(7, -20)} y={GROUND_MID + 4} />
      {/* 8 gazebo */}
      <Gazebo x={S(8, 0)} y={GROUND_MID + 4} />
      <Tree x={S(8, -130)} y={GROUND_MID + 4} s={1} kind="round" seed={81} />
      <Tree x={S(8, 130)} y={GROUND_MID + 4} s={1.1} kind="round" seed={82} />
      {/* 9 sumur harapan */}
      <Well x={S(9, 0)} y={GROUND_MID + 4} />
      <Flowers x0={S(9, -120)} x1={S(9, 120)} y={GROUND_MID + 6} seed={91} n={22} />
      {/* 10 rumah di bukit */}
      <Manor x={S(10, 0)} y={GROUND_MID - 6} />
    </>
  );
}

const PATH = 0.72;
export const GROUND_PATH = 668;
function pathLayer() {
  const w = widthOf(PATH);
  const r = seeded(41);
  const posts = [];
  for (let x = 120; x < w; x += 260 + r() * 80) posts.push(x);
  return (
    <>
      <rect x={-200} y={GROUND_PATH - 18} width={w + 400} height={800} fill="#8DB16C" />
      <path d={`M-200 ${GROUND_PATH - 18}H${w + 200}`} stroke={INK} strokeWidth={1.2} />
      {/* jalan setapak */}
      <rect x={-200} y={GROUND_PATH - 8} width={w + 400} height={22} fill="#E9D7B4" />
      <path d={`M-200 ${GROUND_PATH - 8}H${w + 200}M-200 ${GROUND_PATH + 14}H${w + 200}`} stroke={INK} strokeWidth={1} />
      {Array.from({ length: Math.floor(w / 24) }, (_, i) => (
        <ellipse key={i} cx={i * 24 + r() * 14} cy={GROUND_PATH + 3 + (r() - 0.5) * 10} rx={2 + r() * 2.4} ry={1.4} fill="#D2BC93" />
      ))}
      {posts.map((x, i) => (
        <g key={i}>
          <path d={`M${x} ${GROUND_PATH - 18}V${GROUND_PATH - 96}`} stroke={INK} strokeWidth={2.6} />
          <path d={`M${x - 8} ${GROUND_PATH - 96}H${x + 8}L${x + 5} ${GROUND_PATH - 110}H${x - 5}Z`} fill="#FFF2C8" {...ink} strokeWidth={1} />
        </g>
      ))}
      <Flowers x0={0} x1={w} y={GROUND_PATH - 18} seed={43} n={Math.floor(w / 18)} />
      {Array.from({ length: Math.floor(w / 30) }, (_, i) => {
        const x = i * 30 + r() * 20;
        const y = GROUND_PATH + 30 + r() * 60;
        return <path key={`g${i}`} d={`M${x - 4} ${y}l2 -7M${x} ${y}l0 -9M${x + 4} ${y}l-2 -7`} stroke="#5E8653" strokeWidth={1.2} strokeLinecap="round" />;
      })}
    </>
  );
}

function nearLayer() {
  const w = widthOf(0.9);
  const r = seeded(51);
  const items = [];
  for (let x = 60; x < w; x += 150 + r() * 160) {
    const k = r();
    items.push(
      k > 0.5 ? (
        <path key={x} d={`M${x - 40} 800C${x - 46} 740 ${x - 10} 716 ${x} 724C${x + 14} 708 ${x + 50} 726 ${x + 44} 800Z`} fill={k > 0.75 ? C.leaf2 : C.leaf} {...ink} />
      ) : (
        <Tree key={x} x={x} y={812} s={1.1} kind="banana" seed={Math.floor(x)} />
      )
    );
  }
  return (
    <>
      {items}
      <rect x={-200} y={780} width={w + 400} height={400} fill="#6F9455" />
    </>
  );
}

function skyLayer() {
  const w = widthOf(0.08);
  const r = seeded(7);
  return (
    <>
      {Array.from({ length: Math.floor(w / 140) }, (_, i) => (
        <Cloud key={i} x={i * 140 + r() * 60} y={i % 3 === 0 ? 50 + r() * 50 : 410 + r() * 60} s={0.45 + r() * 0.45} />
      ))}
    </>
  );
}

function birds() {
  const w = widthOf(0.2);
  const r = seeded(13);
  return (
    <>
      {Array.from({ length: Math.floor(w / 380) }, (_, i) => {
        const x = 100 + i * 380 + r() * 120;
        const y = 380 + r() * 60;
        return (
          <g key={i} stroke={INK} strokeWidth={1.2} fill="none" strokeLinecap="round">
            {[0, 1, 2].map((k) => (
              <path key={k} d={`M${x + k * 16} ${y - k * 7}q4 -4 8 0q4 -4 8 0`} />
            ))}
          </g>
        );
      })}
    </>
  );
}

function sunLayer() {
  return (
    <g>
      <circle cx={292} cy={436} r={50} fill="#FFE7A3" opacity={0.5} />
      <circle cx={292} cy={436} r={32} fill="#FFD36B" {...ink} />
    </g>
  );
}

function nightLayer() {
  const w = widthOf(0.02);
  const r = seeded(99);
  return (
    <>
      {Array.from({ length: 70 }, (_, i) => (
        <circle key={i} cx={r() * w} cy={30 + r() * 250} r={0.8 + r() * 1.4} fill="#FFF6DA" />
      ))}
      <g transform={`translate(${atStation(0.02, 10 * STEP, 90)} 160)`}>
        <circle r={34} fill="#FFF3CF" opacity={0.25} />
        <path d="M0 -26A26 26 0 1 0 0 26A20 20 0 1 1 0 -26Z" fill="#FFEBB0" {...ink} />
      </g>
    </>
  );
}

/** cahaya malam: jendela & lampu jalan menyala (di atas rona waktu) */
function lightsMid() {
  const glow = (x: number, y: number, w2: number, h2: number, k: string) => <rect key={k} x={x} y={y} width={w2} height={h2} fill="#FFD98A" />;
  const r = seeded(61);
  const t = S(4, 110);
  return (
    <>
      {glow(S(0, -96) - 30, GROUND_MID + 4 - 41, 14, 14, 'h1')}
      {glow(S(0, -96) + 16, GROUND_MID + 4 - 41, 14, 14, 'h2')}
      {glow(S(7, -20) - 46, GROUND_MID + 4 - 32, 22, 16, 'p1')}
      {glow(S(7, -20) + 24, GROUND_MID + 4 - 32, 22, 16, 'p2')}
      {[-44, -26, 18, 36].map((wx) => glow(S(10, 0) + wx, GROUND_MID - 6 - 34 - 48, 10, 14, `m${wx}`))}
      {/* untaian lampu tarub */}
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={t - 66 + i * 12} cy={GROUND_MID + 4 - 66 + Math.sin((i / 11) * Math.PI) * 10} r={2.6} fill="#FFE9A8" />
      ))}
      {/* lampion gazebo */}
      {[-40, -14, 14, 40].map((dx, i) => (
        <g key={dx}>
          <path d={`M${S(8, dx)} ${GROUND_MID - 56}v10`} stroke="#5A4030" strokeWidth={1} />
          <ellipse cx={S(8, dx)} cy={GROUND_MID - 40} rx={6} ry={8} fill={['#FF9F7A', '#FFD36B', '#FF9F7A', '#FFD36B'][i]} />
        </g>
      ))}
      {/* kembang api di atas rumah bukit */}
      {[
        [-80, -260, '#FFD36B'],
        [60, -300, '#FF9FB3'],
        [130, -230, '#A9E1FF'],
      ].map(([dx, dy, c], i) => (
        <g key={i} transform={`translate(${S(10, dx as number)} ${GROUND_MID + (dy as number)})`}>
          {Array.from({ length: 14 }, (_, k) => {
            const a = (k / 14) * Math.PI * 2;
            return <path key={k} d={`M${f(Math.cos(a) * 8)} ${f(Math.sin(a) * 8)}L${f(Math.cos(a) * (28 + r() * 8))} ${f(Math.sin(a) * (28 + r() * 8))}`} stroke={c as string} strokeWidth={2} strokeLinecap="round" />;
          })}
        </g>
      ))}
    </>
  );
}

function lightsPath() {
  const w = widthOf(PATH);
  const r = seeded(41);
  const posts = [];
  for (let x = 120; x < w; x += 260 + r() * 80) posts.push(x);
  return (
    <>
      {posts.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={GROUND_PATH - 103} r={22} fill="#FFE2A0" opacity={0.35} />
          <path d={`M${x - 6} ${GROUND_PATH - 98}H${x + 6}L${x + 4} ${GROUND_PATH - 108}H${x - 4}Z`} fill="#FFE9A8" />
        </g>
      ))}
    </>
  );
}

export function worldLayers(): CamLayer[] {
  return [
    { depth: 0.02, width: widthOf(0.02), content: nightLayer(), above: true, fade: [[0, 0], [0.76, 0], [0.88, 1], [1, 1]] },
    { depth: 0.03, width: 800, content: sunLayer(), fade: [[0, 1], [0.66, 1], [0.8, 0], [1, 0]] },
    { depth: 0.08, width: widthOf(0.08), content: skyLayer(), fade: [[0, 1], [0.8, 0.9], [1, 0.35]] },
    { depth: 0.15, width: widthOf(0.15), content: farMountains() },
    { depth: 0.2, width: widthOf(0.2), content: birds(), fade: [[0, 1], [0.78, 1], [0.86, 0], [1, 0]] },
    { depth: 0.3, width: widthOf(0.3), content: hills() },
    { depth: MID, width: widthOf(MID), content: midLayer() },
    { depth: PATH, width: widthOf(PATH), content: pathLayer() },
    { depth: 0.9, width: widthOf(0.9), content: nearLayer() },
    { depth: MID, width: widthOf(MID), content: lightsMid(), above: true, fade: [[0, 0.25], [0.2, 0], [0.7, 0], [0.86, 1], [1, 1]] },
    { depth: PATH, width: widthOf(PATH), content: lightsPath(), above: true, fade: [[0, 0.2], [0.2, 0], [0.7, 0], [0.86, 1], [1, 1]] },
  ];
}

export const SKY: [number, string, string][] = [
  [0, '#A7BCD8', '#F6D6B6'],
  [0.18, '#9FCDEA', '#F2EEDD'],
  [0.5, '#8DC2E6', '#E9F3EE'],
  [0.68, '#E4B07E', '#F7DEB0'],
  [0.8, '#7A6494', '#EE9F7E'],
  [0.9, '#2B2E5C', '#6A5D8E'],
  [1, '#141A3A', '#2E3566'],
];

export const TINT: [number, string, number][] = [
  [0, '#FFD9B8', 0.28],
  [0.2, '#FFFFFF', 0],
  [0.62, '#FFFFFF', 0],
  [0.74, '#FFBE85', 0.28],
  [0.84, '#9C86C4', 0.4],
  [1, '#2E3678', 0.6],
];

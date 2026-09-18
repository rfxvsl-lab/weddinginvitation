import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WeddingData, ThemeConfig, RSVP, Guest } from '../../types';

// ════════════════════════════════════════════════════════════════
// StorybookInteractiveLayout — undangan sketchbook interaktif.
// Gaya visual: buku sketsa tangan (hand-drawn ink + watercolor).
// Semua UI — tombol, kartu, form, ikon — mengikuti gaya sketsa,
// bukan geometri bersih. Tamu menjalankan cerita lewat
// interaction trigger (tap/drag), bukan scroll pasif.
// ════════════════════════════════════════════════════════════════

interface StorybookInteractiveLayoutProps {
  data: WeddingData;
  theme: ThemeConfig;
  guest?: Guest | null;
  onAddRSVP: (rsvp: RSVP) => void;
  rsvps: RSVP[];
  embedded?: boolean;
}

const ASSET = (n: string) => `/assets/storybook/${n}`;

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const shortName = (full: string) => {
  if (!full) return '';
  return full.split(' ').slice(0, 2).map(p => p.replace(/,+$/, '')).join(' ');
};

// Nama orang tua di data kadang sudah diawali sapaan (Bapak/Ibu) — bersihkan biar tidak dobel
const cleanParent = (name: string) => (name || '').replace(/^(bapak|bpk\.?|ibu)\s+/i, '');

const INK = '#4A3B30';
const PAPER = '#FFFDF5';
const CREAM = '#FFF3D6';

// ── SVG: pesawat kertas gaya sketsa ─────────────────────────────
function PaperPlane({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 140 92" className={className} style={style} aria-hidden>
      <path d="M10 64 C 44 60, 74 52, 106 22" stroke={INK} strokeWidth="2" strokeDasharray="7 7" fill="none" opacity="0.45" strokeLinecap="round" />
      <polygon points="20,60 130,14 88,82 68,60" fill={PAPER} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points="20,60 68,60 130,14" fill="#F1E7CE" />
      <path d="M68 60 L 88 82" stroke={INK} strokeWidth="1.5" />
      <path d="M34 54 L 52 46" stroke={INK} strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

// ── SVG: awan gaya sketsa ────────────────────────────────────────
function Cloud({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 220 110" className={className} style={style} aria-hidden>
      <path
        d="M32 86 C 16 81, 13 63, 29 56 C 25 41, 41 31, 56 39 C 63 23, 89 21, 99 35 C 113 25, 137 31, 141 47 C 159 41, 177 51, 173 67 C 189 71, 187 89, 171 91 C 140 98, 62 98, 32 86 Z"
        fill="#FFFFFF" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" opacity="0.96" />
      <path d="M60 66 C 80 60, 120 60, 150 68" stroke={INK} strokeWidth="1.2" fill="none" opacity="0.25" />
    </svg>
  );
}

// ── SVG: tulip gaya sketsa (kuncup / mekar) ──────────────────────
function Tulip({ bloomed, className = '', style }: { bloomed: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 145" className={className} style={style} aria-hidden>
      {/* tangkai + daun */}
      <path d="M50 142 C 47 118, 53 98, 49 76" fill="none" stroke="#4E7A45" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M49 116 C 38 112, 31 104, 29 94 C 40 96, 47 104, 49 116 Z" fill="#7BAE6E" stroke="#4E7A45" strokeWidth="2" />
      <path d="M50 124 C 60 120, 66 112, 68 102 C 58 104, 52 112, 50 124 Z" fill="#8FBE7F" stroke="#4E7A45" strokeWidth="2" />
      {bloomed ? (
        <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
          <path d="M50 72 C 33 64, 26 44, 33 28 C 44 36, 49 52, 50 72 Z" fill="#F6B8C1" />
          <path d="M50 72 C 67 64, 74 44, 67 28 C 56 36, 51 52, 50 72 Z" fill="#F2A3B5" />
          <path d="M50 74 C 41 56, 41 36, 50 18 C 59 36, 59 56, 50 74 Z" fill="#F8CDD8" />
          <path d="M50 68 C 47 54, 47 40, 50 30" fill="none" strokeWidth="1.4" opacity="0.55" />
          <circle cx="50" cy="70" r="4" fill="#F9D976" strokeWidth="1.5" />
        </g>
      ) : (
        <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
          <path d="M50 22 C 40 32, 37 52, 44 68 C 47 74, 53 74, 56 68 C 63 52, 60 32, 50 22 Z" fill="#A9D39A" />
          <path d="M50 22 C 46 36, 46 54, 50 70" fill="none" strokeWidth="1.4" opacity="0.6" />
          <path d="M43 36 C 41 46, 42 56, 45 64" fill="none" strokeWidth="1.2" opacity="0.5" />
        </g>
      )}
    </svg>
  );
}

// ── SVG: matahari gaya sketsa ────────────────────────────────────
function SunDoodle({ color, className = '', style }: { color: string; className?: string; style?: React.CSSProperties }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      {rays.map((r) => (
        <line key={r} x1="50" y1="12" x2="50" y2="24" stroke={INK} strokeWidth="3" strokeLinecap="round"
          transform={`rotate(${r} 50 50)`} opacity="0.85" />
      ))}
      <circle cx="50" cy="50" r="24" fill={color} stroke={INK} strokeWidth="3" />
      <path d="M38 46 C 42 42, 58 42, 62 46" stroke={INK} strokeWidth="1.6" fill="none" opacity="0.5" />
    </svg>
  );
}

// ── SVG: lampion ─────────────────────────────────────────────────
function Lantern({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 80 110" className={className} style={style} aria-hidden>
      <ellipse cx="40" cy="52" rx="30" ry="36" fill="#FFD9A0" stroke={INK} strokeWidth="2.5" />
      <defs>
        <radialGradient id="lanternGlow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FFF3D6" />
          <stop offset="100%" stopColor="#FFB35C" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="40" cy="52" rx="30" ry="36" fill="url(#lanternGlow)" opacity="0.55" />
      <rect x="28" y="8" width="24" height="8" rx="3" fill={INK} opacity="0.8" />
      <path d="M40 52 m -18 0 a 18 26 0 1 0 36 0 a 18 26 0 1 0 -36 0" fill="none" stroke={INK} strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

// ── SVG: kotak hadiah gaya sketsa ────────────────────────────────
function GiftBox({ open, className = '', style }: { open: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 112" className={className} style={style} aria-hidden>
      <rect x="20" y="50" width="80" height="52" rx="4" fill="#E8A06A" stroke={INK} strokeWidth="2.5" />
      <rect x="54" y="50" width="12" height="52" fill={PAPER} stroke={INK} strokeWidth="1.5" />
      <path d="M28 76 L 92 72" stroke={INK} strokeWidth="1" opacity="0.3" />
      <g style={{ transformOrigin: '60px 46px', transform: open ? 'rotate(-24deg) translate(-8px,-10px)' : 'none', transition: 'transform 600ms ease' }}>
        <rect x="14" y="34" width="92" height="18" rx="4" fill="#D98A52" stroke={INK} strokeWidth="2.5" />
        <rect x="54" y="34" width="12" height="18" fill={PAPER} stroke={INK} strokeWidth="1.5" />
        <path d="M60 34 C 48 34, 40 26, 44 18 C 48 12, 56 16, 60 28 C 64 16, 72 12, 76 18 C 80 26, 72 34, 60 34"
          fill={PAPER} stroke={INK} strokeWidth="2.5" />
      </g>
    </svg>
  );
}

// ── Keyframes + gaya sketsa ──────────────────────────────────────
const KEYFRAMES = `
.sb-hand { font-family: var(--font-hand), 'Segoe Print', cursive; }
.sb-scene { transition: opacity 700ms ease; }
/* bingkai sketsa: garis tinta dengan sudut tak beraturan */
.sb-sketch {
  border: 2.5px solid ${INK};
  border-radius: 255px 18px 225px 18px / 18px 225px 18px 255px;
}
.sb-sketch-2 {
  border: 2.5px solid ${INK};
  border-radius: 18px 225px 18px 255px / 225px 18px 255px 18px;
}
.sb-sketch-card {
  background: ${PAPER};
  border: 2.5px solid ${INK};
  border-radius: 20px 225px 20px 255px / 225px 20px 255px 20px;
  box-shadow: 3px 4px 0 rgba(74,59,48,.16);
}
.sb-sketch-card-2 {
  background: ${PAPER};
  border: 2.5px solid ${INK};
  border-radius: 225px 20px 255px 20px / 20px 255px 20px 225px;
  box-shadow: 3px 4px 0 rgba(74,59,48,.16);
}
.sb-sketch-light {
  border: 2.5px solid ${CREAM};
  border-radius: 255px 18px 225px 18px / 18px 225px 18px 255px;
}
.sb-sketch-card-dark {
  background: rgba(20,28,48,.72);
  border: 2.5px solid ${CREAM};
  border-radius: 20px 225px 20px 255px / 225px 20px 255px 20px;
  box-shadow: 3px 4px 0 rgba(0,0,0,.3);
  backdrop-filter: blur(4px);
}
.sb-tape { position: relative; }
.sb-tape::before {
  content: ''; position: absolute; top: -12px; left: 50%; transform: translateX(-50%) rotate(-3deg);
  width: 84px; height: 24px; background: rgba(233,220,180,.85);
  border-left: 2px dashed rgba(74,59,48,.25); border-right: 2px dashed rgba(74,59,48,.25);
  box-shadow: 0 1px 2px rgba(74,59,48,.15);
}
@keyframes sb-drift { 0% { transform: translateX(-12%); } 100% { transform: translateX(112%); } }
@keyframes sb-bob { 0%,100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-14px) rotate(4deg); } }
@keyframes sb-sway { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
@keyframes sb-flyaway { 0% { transform: translate(0,0) scale(1) rotate(0deg); opacity:1; } 100% { transform: translate(46vw,-52vh) scale(1.6) rotate(18deg); opacity:0; } }
@keyframes sb-bloom { 0% { transform: scale(0.6); } 60% { transform: scale(1.15); } 100% { transform: scale(1); } }
@keyframes sb-rise { 0% { transform: translateY(0) scale(1); opacity:1; } 100% { transform: translateY(-72vh) scale(0.7); opacity:0; } }
@keyframes sb-glowpulse { 0%,100% { opacity:0.35; } 50% { opacity:0.75; } }
@keyframes sb-cloudpart-l { to { transform: translateX(-58%); opacity:0; } }
@keyframes sb-cloudpart-r { to { transform: translateX(58%); opacity:0; } }
@keyframes sb-fadeup { from { opacity:0; transform: translateY(18px); } to { opacity:1; transform: translateY(0); } }
@keyframes sb-twinkle { 0%,100% { opacity:0.25; } 50% { opacity:1; } }
@keyframes sb-wiggle { 0%,100% { transform: rotate(-2deg) scale(1); } 50% { transform: rotate(2deg) scale(1.04); } }
`;

export default function StorybookInteractiveLayout({
  data,
  theme,
  guest,
  onAddRSVP,
  rsvps,
  embedded = false,
}: StorybookInteractiveLayoutProps) {
  // Alur scene (id logis), dengan skip untuk konten opsional yang kosong
  const flow = [
    'cover',
    'intro',
    ...(data.quoteText ? ['quote'] : []),
    'sun',
    'venue',
    ...(data.gallery && data.gallery.length > 0 ? ['gallery'] : []),
    'rsvp',
    ...(data.gifts && data.gifts.length > 0 ? ['gift'] : []),
    'closing',
  ];
  const [step, setStep] = useState(0);
  const scene = flow[step];

  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Scene: cover
  const [planeFlying, setPlaneFlying] = useState(false);
  // Scene: intro — dua tulip: mempelai pria & wanita
  const [bloomed, setBloomed] = useState<boolean[]>([false, false]);
  // Scene: quote
  const [cloudOpen, setCloudOpen] = useState(false);
  // Scene: sun
  const [sunPhase, setSunPhase] = useState(0);
  const [sunX, setSunX] = useState(0.15); // 0..1 posisi drag
  const draggingSun = useRef(false);
  const sunTrackRef = useRef<HTMLDivElement>(null);
  // Scene: venue
  const [doorOpen, setDoorOpen] = useState(false);
  // Scene: gallery
  const [lightbox, setLightbox] = useState<string | null>(null);
  // Scene: rsvp
  const [rsvpName, setRsvpName] = useState(guest?.name || '');
  const [rsvpStatus, setRsvpStatus] = useState<'Hadir' | 'Tidak Hadir' | 'Ragu-ragu'>('Hadir');
  const [rsvpWishes, setRsvpWishes] = useState('');
  const [rsvpError, setRsvpError] = useState('');
  const [lanternFlying, setLanternFlying] = useState(false);
  const [rsvpDone, setRsvpDone] = useState(false);
  // Scene: gift
  const [giftOpen, setGiftOpen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  // Scene: closing
  const [shared, setShared] = useState(false);

  const serif = theme.fontSerif || 'font-serif';

  const goStep = (d: number) => {
    const n = Math.min(flow.length - 1, Math.max(0, step + d));
    if (n === 0) setPlaneFlying(false); // pesawat muncul lagi kalau balik ke sampul
    setStep(n);
  };

  const startMusic = useCallback(() => {
    if (!musicOn && data.musicUrl && audioRef.current) {
      audioRef.current.play().then(() => setMusicOn(true)).catch(() => {});
    }
  }, [musicOn, data.musicUrl]);

  useEffect(() => {
    if (guest) setRsvpName(guest.name);
  }, [guest]);

  // Sun drag → phase
  const phaseFromX = (x: number) => (x < 0.38 ? 0 : x < 0.72 ? 1 : 2);
  const onSunPointerDown = (e: React.PointerEvent) => {
    draggingSun.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onSunPointerMove = (e: React.PointerEvent) => {
    if (!draggingSun.current || !sunTrackRef.current) return;
    const r = sunTrackRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setSunX(x);
    setSunPhase(phaseFromX(x));
  };
  const onSunPointerUp = () => { draggingSun.current = false; };

  const PHASES = [
    { label: 'Pagi', sky: 'linear-gradient(180deg,#8FD0EE 0%,#CFEFFA 55%,#FFF3D6 100%)', sun: '#FFD76E' },
    { label: 'Siang', sky: 'linear-gradient(180deg,#5FB6E8 0%,#A8DCF5 60%,#FFF8E1 100%)', sun: '#FFC93C' },
    { label: 'Malam', sky: 'linear-gradient(180deg,#1B2A4A 0%,#3A4A7A 60%,#8A6A9E 100%)', sun: '#F4F1DE' },
  ];

  const handlePlaneTap = () => {
    if (planeFlying) return;
    startMusic();
    setPlaneFlying(true);
    setTimeout(() => goStep(1), 1250);
  };

  const handleRSVP = () => {
    if (!rsvpName.trim()) { setRsvpError('Isi nama kamu dulu ya'); return; }
    setRsvpError('');
    const rsvp: RSVP = {
      id: `rsvp-${Date.now()}`,
      guestName: rsvpName.trim(),
      status: rsvpStatus,
      paxCount: 1,
      wishes: rsvpWishes.trim(),
      timestamp: new Date().toISOString(),
    };
    onAddRSVP(rsvp);
    setLanternFlying(true);
    setTimeout(() => { setLanternFlying(false); setRsvpDone(true); }, 2600);
  };

  const copyText = async (text: string, idx: number) => {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: document.title, url }); setShared(true); return; } catch {}
    }
    copyText(url, 999);
    setShared(true);
  };

  const introNames = [
    { label: 'Mempelai Pria', name: data.couple.groom.fullName, sub: `Putra dari Bpk. ${cleanParent(data.couple.groom.fatherName)} & Ibu ${cleanParent(data.couple.groom.motherName)}` },
    { label: 'Mempelai Wanita', name: data.couple.bride.fullName, sub: `Putri dari Bpk. ${cleanParent(data.couple.bride.fatherName)} & Ibu ${cleanParent(data.couple.bride.motherName)}` },
  ];

  const sceneVisible = (id: string) => (scene === id ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none');

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden select-none" style={{ background: '#0E1B2C', color: INK }}>
      <style>{KEYFRAMES}</style>
      {data.musicUrl && <audio ref={audioRef} src={data.musicUrl} loop preload="none" />}

      {/* ═══ SCENE: COVER ═══ */}
      <section className={`sb-scene absolute inset-0 ${sceneVisible('cover')}`} aria-label="Sampul">
        <img src={ASSET('bg-sky-day.webp')} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <Cloud className="absolute top-[12%] w-40 opacity-90" style={{ animation: 'sb-drift 26s linear infinite' }} />
        <Cloud className="absolute top-[26%] w-28 opacity-70" style={{ animation: 'sb-drift 38s linear infinite', animationDelay: '-14s' }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <p className={`${serif} italic text-lg mb-2`} style={{ color: INK }}>The Wedding of</p>
          <h1 className={`${serif} text-4xl leading-tight mb-1`} style={{ color: INK }}>
            {shortName(data.couple.groom.fullName)} <span className="italic">&</span> {shortName(data.couple.bride.fullName)}
          </h1>
          {guest?.name && (
            <p className="sb-hand mt-6 text-lg px-6 py-2 sb-sketch-card" style={{ color: INK, transform: 'rotate(-1.5deg)' }}>
              Kepada Yth.<br /><strong>{guest.name}</strong>
            </p>
          )}
        </div>
        <button
          onClick={handlePlaneTap}
          aria-label="Ketuk pesawat kertas untuk membuka undangan"
          className="absolute left-1/2 top-[58%] -ml-20 cursor-pointer"
          style={{ animation: planeFlying ? 'sb-flyaway 1.2s ease-in forwards' : 'sb-bob 4s ease-in-out infinite' }}
        >
          <PaperPlane className="w-40" />
        </button>
        {!planeFlying && (
          <p className="sb-hand absolute bottom-24 inset-x-0 text-center text-2xl" style={{ color: INK, animation: 'sb-fadeup 1s ease both' }}>
            ✎ ketuk pesawat kertasnya untuk membuka
          </p>
        )}
      </section>

      {/* ═══ SCENE: INTRO (dua tulip sketsa) ═══ */}
      <section className={`sb-scene absolute inset-0 ${sceneVisible('intro')}`} aria-label="Perkenalan">
        <img src={ASSET('bg-meadow.webp')} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        {/* judul di atas kertas */}
        <div className="absolute inset-x-0 top-8 flex justify-center px-6">
          <div className="sb-sketch-card sb-tape px-6 py-3" style={{ transform: 'rotate(-1deg)' }}>
            <h2 className="sb-hand text-2xl text-center" style={{ color: INK }}>
              ✎ ketuk tulipnya, biarkan mekar
            </h2>
          </div>
        </div>
        {/* dua tulip: kiri & kanan, jelas terpisah */}
        <div className="absolute inset-x-0 bottom-24 top-[30%] flex items-end justify-around px-4">
          {introNames.map((item, i) => (
            <div key={i} className="flex flex-col items-center w-[44%]" style={{ animation: `sb-sway 4s ease-in-out infinite`, animationDelay: `${i * 1.1}s` }}>
              {bloomed[i] && (
                <div className={`mb-3 w-full px-4 py-3 text-center ${i === 0 ? 'sb-sketch-card' : 'sb-sketch-card-2'}`}
                  style={{ animation: 'sb-fadeup 600ms ease both', transform: `rotate(${i === 0 ? -1.5 : 1.5}deg)` }}>
                  <p className="sb-hand text-lg leading-none mb-1" style={{ color: '#8A6A4A' }}>{item.label}</p>
                  <p className={`${serif} text-base leading-snug`} style={{ color: INK }}>{item.name}</p>
                  {item.sub && <p className="text-[11px] mt-1 leading-snug" style={{ color: '#8A6A4A' }}>{item.sub}</p>}
                </div>
              )}
              <button
                onClick={() => setBloomed((b) => { const n = [...b]; n[i] = true; startMusic(); return n; })}
                aria-label={bloomed[i] ? `${item.label} sudah mekar` : `Ketuk untuk mekar ${item.label}`}
                className="cursor-pointer"
              >
                <Tulip bloomed={bloomed[i]} className="w-24 sm:w-28"
                  style={bloomed[i]
                    ? { animation: 'sb-bloom 700ms ease both' }
                    : { animation: 'sb-wiggle 2.6s ease-in-out infinite', filter: 'drop-shadow(0 6px 8px rgba(74,59,48,.25))' }} />
              </button>
              <p className={`sb-hand text-xl mt-1 px-3 ${i === 0 ? 'sb-sketch' : 'sb-sketch-2'}`}
                style={{ color: INK, background: 'rgba(255,253,245,.85)', transform: `rotate(${i === 0 ? 1.5 : -1.5}deg)` }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
        {!bloomed.every(Boolean) && (
          <p className="sb-hand absolute top-[7.25rem] inset-x-0 text-center text-xl" style={{ color: PAPER, textShadow: '0 2px 8px rgba(40,60,30,.7)' }}>
            {bloomed.some(Boolean) ? 'satu lagi…' : 'ada dua tulip, ketuk keduanya ya'}
          </p>
        )}
        <SceneNav onPrev={() => goStep(-1)} onNext={() => goStep(1)} showNext={bloomed.every(Boolean)} nextLabel="Lanjut" />
      </section>

      {/* ═══ SCENE: QUOTE (awan tersibak) ═══ */}
      {data.quoteText && (
        <section className={`sb-scene absolute inset-0 ${sceneVisible('quote')}`} aria-label="Kutipan"
          style={{ background: 'linear-gradient(180deg,#FFF6E3 0%,#FDEFD2 100%)' }}>
          <div className="absolute inset-0 flex items-center justify-center px-8">
            <button onClick={() => { setCloudOpen(true); startMusic(); }} aria-label="Sibakkan awan untuk membaca kutipan"
              className="relative w-72 h-44 cursor-pointer">
              <Cloud className="absolute inset-0 w-full h-full transition-all duration-1000"
                style={cloudOpen ? { animation: 'sb-cloudpart-l 1.1s ease forwards' } : undefined} />
              <Cloud className="absolute inset-0 w-full h-full transition-all duration-1000"
                style={cloudOpen ? { animation: 'sb-cloudpart-r 1.1s ease forwards' } : { transform: 'scaleX(-1)', opacity: 0.85 }} />
              {!cloudOpen && (
                <span className="sb-hand absolute inset-0 flex items-center justify-center text-2xl" style={{ color: INK }}>
                  ✎ ketuk awannya
                </span>
              )}
            </button>
          </div>
          {cloudOpen && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
              style={{ animation: 'sb-fadeup 900ms ease 400ms both' }}>
              <div className="sb-sketch-card sb-tape px-6 py-5 max-w-sm" style={{ transform: 'rotate(-1deg)' }}>
                <p className={`${serif} italic text-xl leading-relaxed`} style={{ color: INK }}>"{data.quoteText}"</p>
                {data.quoteSource && <p className="sb-hand mt-3 text-xl" style={{ color: '#8A6A4A' }}>— {data.quoteSource}</p>}
              </div>
            </div>
          )}
          <SceneNav onPrev={() => goStep(-1)} onNext={() => goStep(1)} showNext={cloudOpen} nextLabel="Lanjut" />
        </section>
      )}

      {/* ═══ SCENE: SUN (geser matahari) ═══ */}
      <section className={`sb-scene absolute inset-0 ${sceneVisible('sun')}`} aria-label="Rangkaian acara"
        style={{ background: PHASES[sunPhase].sky, transition: 'background 900ms ease' }}>
        <div className="absolute inset-x-0 top-8 flex justify-center px-6">
          <div className="sb-sketch-card px-6 py-2.5" style={{ transform: 'rotate(1deg)' }}>
            <h2 className="sb-hand text-2xl text-center" style={{ color: INK }}>✎ geser mataharinya</h2>
          </div>
        </div>
        {/* lintasan matahari: garis putus-putus gaya sketsa */}
        <div ref={sunTrackRef} className="absolute inset-x-10 top-[24%] h-28">
          <svg className="absolute inset-x-0 top-1/2 w-full" height="8" preserveAspectRatio="none" viewBox="0 0 100 8">
            <line x1="2" y1="4" x2="98" y2="4" stroke={sunPhase === 2 ? CREAM : INK} strokeWidth="2.5" strokeDasharray="7 6" strokeLinecap="round" opacity="0.55" />
          </svg>
          <div
            role="slider" aria-label="Geser matahari" aria-valuenow={sunPhase} aria-valuemin={0} aria-valuemax={2}
            onPointerDown={onSunPointerDown} onPointerMove={onSunPointerMove} onPointerUp={onSunPointerUp}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing touch-none"
            style={{ left: `${sunX * 100}%`, filter: `drop-shadow(0 0 18px ${PHASES[sunPhase].sun})` }}
          >
            <SunDoodle color={PHASES[sunPhase].sun} className="w-20 h-20" />
          </div>
        </div>
        <div className="absolute inset-x-0 top-[40%] flex justify-center gap-4">
          {PHASES.map((p, i) => (
            <button key={p.label} onClick={() => { setSunPhase(i); setSunX([0.15, 0.55, 0.9][i]); startMusic(); }}
              className={`sb-hand text-xl px-5 py-1 transition-all ${i === 1 ? 'sb-sketch-2' : 'sb-sketch'} ${sunPhase === i ? 'scale-110' : 'opacity-60'}`}
              style={{
                background: sunPhase === i ? (sunPhase === 2 ? CREAM : INK) : 'rgba(255,253,245,.75)',
                color: sunPhase === i ? (sunPhase === 2 ? INK : PAPER) : INK,
                transform: `rotate(${(i - 1) * 2}deg) ${sunPhase === i ? 'scale(1.1)' : ''}`,
              }}>
              {p.label}
            </button>
          ))}
        </div>
        {/* kartu acara */}
        <div className="absolute inset-x-6 bottom-28">
          <div key={sunPhase} className="sb-sketch-card p-6 text-center"
            style={{ animation: 'sb-fadeup 600ms ease both', transform: 'rotate(-.6deg)' }}>
            {sunPhase === 0 && <EventCard ev={data.events.akad} serif={serif} />}
            {sunPhase === 1 && <EventCard ev={data.events.resepsi} serif={serif} />}
            {sunPhase === 2 && <CountdownCard date={data.countdownDate} serif={serif} />}
          </div>
        </div>
        <SceneNav onPrev={() => goStep(-1)} onNext={() => goStep(1)} showNext nextLabel="Lanjut" dark={sunPhase === 2} />
      </section>

      {/* ═══ SCENE: VENUE (ketuk pintu) ═══ */}
      <section className={`sb-scene absolute inset-0 ${sceneVisible('venue')}`} aria-label="Lokasi acara">
        <img src={ASSET('bg-house.webp')} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
          style={{ opacity: doorOpen ? 1 : 0, background: 'radial-gradient(circle at 50% 62%, rgba(255,190,110,.45), transparent 60%)', animation: 'sb-glowpulse 3s ease-in-out infinite' }} />
        {!doorOpen ? (
          <button onClick={() => { setDoorOpen(true); startMusic(); }} aria-label="Ketuk pintu untuk melihat lokasi"
            className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 w-40 h-56 cursor-pointer"
            style={{ background: 'transparent' }}>
            <span className="sb-hand absolute -bottom-12 inset-x-0 text-center text-2xl px-4 py-1 sb-sketch-card whitespace-nowrap"
              style={{ color: INK, animation: 'sb-wiggle 2.4s ease-in-out infinite' }}>
              ✎ ketuk pintunya
            </span>
          </button>
        ) : (
          <div className="absolute inset-x-6 bottom-24 sb-sketch-card p-6"
            style={{ animation: 'sb-fadeup 700ms ease both', transform: 'rotate(-.8deg)' }}>
            <p className="sb-hand text-xl mb-1" style={{ color: '#8A6A4A' }}>✎ lokasi resepsi</p>
            <h3 className={`${serif} text-xl mb-1`} style={{ color: INK }}>{data.events.resepsi.venueName}</h3>
            <p className="text-sm mb-4" style={{ color: '#6B5B4C' }}>{data.events.resepsi.address}</p>
            <div className="flex gap-3">
              {data.events.resepsi.googleMapsUrl && (
                <a href={data.events.resepsi.googleMapsUrl} target="_blank" rel="noreferrer"
                  className="sb-hand flex-1 text-center text-xl py-2 sb-sketch" style={{ background: INK, color: PAPER }}>
                  Buka Maps
                </a>
              )}
              <button onClick={() => downloadICS(data)}
                className="sb-hand flex-1 text-xl py-2 sb-sketch-2" style={{ background: PAPER, color: INK }}>
                Simpan Tanggal
              </button>
            </div>
          </div>
        )}
        <SceneNav onPrev={() => goStep(-1)} onNext={() => goStep(1)} showNext={doorOpen} nextLabel="Lanjut" />
      </section>

      {/* ═══ SCENE: GALLERY ═══ */}
      {data.gallery && data.gallery.length > 0 && (
        <section className={`sb-scene absolute inset-0 ${sceneVisible('gallery')}`} aria-label="Galeri foto"
          style={{ background: 'linear-gradient(180deg,#F7E8D0 0%,#EFDCBE 100%)' }}>
          <div className="absolute inset-x-0 top-8 flex justify-center px-6">
            <div className="sb-sketch-card-2 sb-tape px-6 py-2.5" style={{ transform: 'rotate(1.2deg)' }}>
              <h2 className="sb-hand text-2xl text-center" style={{ color: INK }}>✎ ketuk bingkainya</h2>
            </div>
          </div>
          <div className="absolute inset-0 top-28 bottom-28 overflow-y-auto px-6">
            <div className="grid grid-cols-2 gap-5 pb-6 pt-4">
              {data.gallery.map((src, i) => (
                <button key={i} onClick={() => { setLightbox(src); startMusic(); }}
                  aria-label={`Lihat foto ${i + 1}`}
                  className="cursor-pointer bg-[#FFFDF5] p-2 pb-8 shadow-lg hover:rotate-0 transition-transform"
                  style={{
                    border: `2px solid ${INK}`,
                    borderRadius: '6px 225px 6px 255px / 225px 6px 255px 6px',
                    transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
                  }}>
                  <img src={src} alt={`Momen ${i + 1}`} className="w-full aspect-square object-cover" loading="lazy" draggable={false}
                    style={{ border: `1.5px solid ${INK}` }} />
                  <p className="sb-hand text-lg text-center mt-1" style={{ color: '#8A6A4A' }}>momen {i + 1}</p>
                </button>
              ))}
            </div>
          </div>
          {lightbox && (
            <button onClick={() => setLightbox(null)} aria-label="Tutup foto"
              className="absolute inset-0 z-20 bg-black/85 flex items-center justify-center p-6 cursor-zoom-out">
              <img src={lightbox} alt="Foto diperbesar" className="max-w-full max-h-full shadow-2xl bg-white p-2"
                style={{ border: `2.5px solid ${PAPER}` }} draggable={false} />
            </button>
          )}
          <SceneNav onPrev={() => goStep(-1)} onNext={() => goStep(1)} showNext nextLabel="Lanjut" />
        </section>
      )}

      {/* ═══ SCENE: RSVP (terbangkan lampion) ═══ */}
      <section className={`sb-scene absolute inset-0 ${sceneVisible('rsvp')}`} aria-label="RSVP dan ucapan">
        <img src={ASSET('bg-night.webp')} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        {[...Array(14)].map((_, i) => (
          <span key={i} className="absolute w-1 h-1 rounded-full bg-white"
            style={{
              left: `${(i * 37) % 100}%`, top: `${(i * 53) % 60}%`,
              animation: `sb-twinkle ${2 + (i % 4)}s ease-in-out infinite`, animationDelay: `${(i % 5) * 0.5}s`,
            }} />
        ))}
        {!rsvpDone ? (
          <div className="absolute inset-x-6 top-[13%] sb-sketch-card-dark p-6">
            <h2 className={`${serif} text-2xl text-center mb-1`} style={{ color: CREAM }}>Kirim Doa</h2>
            <p className="sb-hand text-center text-xl mb-4" style={{ color: '#D9C9A8' }}>tulis ucapanmu, terbangkan bersama lampion ✎</p>
            <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="Nama kamu"
              className="w-full mb-3 px-4 py-3 text-sm outline-none sb-sketch" style={{ color: INK, background: PAPER }} />
            <div className="flex gap-2 mb-3">
              {(['Hadir', 'Tidak Hadir', 'Ragu-ragu'] as const).map((s) => (
                <button key={s} onClick={() => setRsvpStatus(s)}
                  className={`sb-hand flex-1 text-lg py-1.5 transition-all ${rsvpStatus === s ? '' : 'opacity-55'} sb-sketch`}
                  style={{ background: rsvpStatus === s ? CREAM : 'rgba(255,243,214,.25)', color: rsvpStatus === s ? INK : CREAM }}>
                  {s}
                </button>
              ))}
            </div>
            <textarea value={rsvpWishes} onChange={(e) => setRsvpWishes(e.target.value)} placeholder="Tulis ucapan & doa..."
              rows={3} className="w-full mb-3 px-4 py-3 text-sm outline-none resize-none sb-sketch-2"
              style={{ color: INK, background: PAPER }} />
            {rsvpError && <p className="sb-hand text-xl mb-2 text-center" style={{ color: '#F2A3A3' }}>{rsvpError}</p>}
            <button onClick={handleRSVP}
              className="sb-hand w-full text-2xl py-2.5 sb-sketch"
              style={{ background: '#E8915A', color: PAPER, boxShadow: '3px 4px 0 rgba(0,0,0,.3)', transform: 'rotate(-.8deg)' }}>
              ✎ terbangkan lampion
            </button>
          </div>
        ) : (
          <div className="absolute inset-x-8 top-[30%] text-center" style={{ animation: 'sb-fadeup 800ms ease both' }}>
            <p className="sb-hand text-4xl mb-2" style={{ color: CREAM }}>Doamu sudah terbang ✦</p>
            <p className="text-sm" style={{ color: '#D9C9A8' }}>Terima kasih, {rsvpName || 'tamu'}.</p>
          </div>
        )}
        {lanternFlying && (
          <div className="absolute left-1/2 bottom-8 -ml-10 z-10" style={{ animation: 'sb-rise 2.6s ease-in forwards' }}>
            <Lantern className="w-20" />
            <p className="sb-hand text-center text-xl mt-1" style={{ color: CREAM }}>{rsvpName}</p>
          </div>
        )}
        <SceneNav onPrev={() => goStep(-1)} onNext={() => goStep(1)} showNext={rsvpDone} nextLabel="Lanjut" dark />
      </section>

      {/* ═══ SCENE: GIFT ═══ */}
      {data.gifts && data.gifts.length > 0 && (
        <section className={`sb-scene absolute inset-0 ${sceneVisible('gift')}`} aria-label="Amplop digital"
          style={{ background: 'linear-gradient(180deg,#FDEFD2 0%,#F7E3C0 100%)' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
            <button onClick={() => { setGiftOpen(true); startMusic(); }} aria-label="Ketuk kotak hadiah untuk membuka"
              className="cursor-pointer mb-4" style={{ animation: giftOpen ? undefined : 'sb-bob 3.5s ease-in-out infinite' }}>
              <GiftBox open={giftOpen} className="w-40" style={{ filter: 'drop-shadow(0 8px 10px rgba(74,59,48,.25))' }} />
            </button>
            {!giftOpen && <p className="sb-hand text-2xl" style={{ color: INK }}>✎ ketuk kotaknya</p>}
            {giftOpen && (
              <div className="w-full max-w-xs" style={{ animation: 'sb-fadeup 700ms ease both' }}>
                <h2 className="sb-hand text-3xl text-center mb-4" style={{ color: INK }}>✎ tanda kasih</h2>
                {data.gifts.map((g, i) => (
                  <div key={g.id || i} className={`p-4 mb-3 ${i % 2 === 0 ? 'sb-sketch-card' : 'sb-sketch-card-2'}`}
                    style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}>
                    <p className="sb-hand text-lg" style={{ color: '#8A6A4A' }}>{g.type === 'bank' ? 'transfer bank' : g.type === 'e-wallet' ? 'e-wallet' : 'kirim fisik'}</p>
                    <p className="font-bold text-sm" style={{ color: INK }}>{g.name} — {g.accountHolder}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`${serif} text-lg tracking-wider`} style={{ color: INK }}>{g.accountNumber}</p>
                      <button onClick={() => copyText(g.accountNumber, i)}
                        className="sb-hand text-lg px-4 py-1 sb-sketch" style={{ background: INK, color: PAPER }}>
                        {copiedIdx === i ? 'tersalin ✓' : 'salin'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <SceneNav onPrev={() => goStep(-1)} onNext={() => goStep(1)} showNext={giftOpen} nextLabel="Lanjut" />
        </section>
      )}

      {/* ═══ SCENE: CLOSING ═══ */}
      <section className={`sb-scene absolute inset-0 ${sceneVisible('closing')}`} aria-label="Penutup">
        <img src={ASSET('bg-village.webp')} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-x-0 top-[12%] flex flex-col items-center px-8">
          <div className="sb-sketch-card px-8 py-5 text-center" style={{ transform: 'rotate(-1deg)', animation: 'sb-fadeup 800ms ease both' }}>
            <p className="sb-hand text-2xl" style={{ color: '#8A6A4A' }}>hormat kami,</p>
            <h2 className={`${serif} text-2xl mt-1`} style={{ color: INK }}>
              {shortName(data.couple.groom.fullName)} & {shortName(data.couple.bride.fullName)}
            </h2>
            <p className="sb-hand mt-2 text-xl" style={{ color: '#8A6A4A' }}>
              sampai bertemu di hari bahagia kami ✦
            </p>
          </div>
        </div>
        <div className="absolute inset-x-8 bottom-24 flex flex-col gap-3">
          <button onClick={handleShare}
            className="sb-hand w-full text-2xl py-2.5 sb-sketch" style={{ background: PAPER, color: INK, transform: 'rotate(-.6deg)' }}>
            {shared ? '✦ tautan siap dibagikan' : '✎ bagikan undangan'}
          </button>
          <button onClick={() => setStep(0)}
            className="sb-hand w-full text-xl py-2 sb-sketch-light" style={{ color: CREAM }}>
            ↻ putar ulang cerita
          </button>
        </div>
        <SceneNav onPrev={() => goStep(-1)} onNext={() => {}} showNext={false} nextLabel="" dark />
      </section>

      {/* Fallback: info inti tetap terbaca tanpa JS (PRD R1) */}
      <noscript>
        <div style={{ padding: 24, background: '#FFFDF5', color: '#4A3B30' }}>
          <h1>{data.couple.groom.fullName} & {data.couple.bride.fullName}</h1>
          <p>{formatDate(data.events.akad.date)} — {data.events.akad.venueName}, {data.events.akad.address}</p>
          <p>{formatDate(data.events.resepsi.date)} — {data.events.resepsi.venueName}, {data.events.resepsi.address}</p>
        </div>
      </noscript>
    </div>
  );
}

// ── Navigasi antar scene: tombol sketsa ───────────────────────────
function SceneNav({ onPrev, onNext, showNext, nextLabel, dark }: {
  onPrev: () => void; onNext: () => void; showNext: boolean; nextLabel: string; dark?: boolean;
}) {
  return (
    <div className="absolute bottom-6 inset-x-0 z-10 flex items-center justify-center gap-4">
      <button onClick={onPrev} aria-label="Scene sebelumnya"
        className="sb-hand w-12 h-12 flex items-center justify-center text-2xl font-bold backdrop-blur"
        style={{
          background: dark ? 'rgba(255,243,214,.14)' : 'rgba(255,253,245,.72)',
          color: dark ? CREAM : INK,
          border: `2.5px solid ${dark ? CREAM : INK}`,
          borderRadius: '48% 52% 55% 45% / 52% 46% 54% 48%',
        }}>
        ←
      </button>
      {showNext && (
        <button onClick={onNext}
          className="sb-hand px-9 h-12 text-2xl backdrop-blur sb-sketch"
          style={{
            background: dark ? CREAM : INK,
            color: dark ? INK : PAPER,
            borderColor: dark ? CREAM : INK,
            animation: 'sb-fadeup 500ms ease both',
            transform: 'rotate(-1deg)',
          }}>
          {nextLabel} →
        </button>
      )}
    </div>
  );
}

// ── Kartu acara ───────────────────────────────────────────────────
function EventCard({ ev, serif }: { ev: { name: string; date: string; timeStart: string; timeEnd: string; venueName: string; address: string }; serif: string }) {
  return (
    <div>
      <p className="sb-hand text-xl mb-1" style={{ color: '#8A6A4A' }}>✎ {ev.name || 'acara'}</p>
      <h3 className={`${serif} text-xl mb-1`} style={{ color: INK }}>{formatDate(ev.date)}</h3>
      <p className="text-sm mb-1" style={{ color: '#6B5B4C' }}>{ev.timeStart}{ev.timeEnd ? ` — ${ev.timeEnd}` : ''} WIB</p>
      <p className="text-sm font-semibold" style={{ color: INK }}>{ev.venueName}</p>
      <p className="text-xs" style={{ color: '#8A6A4A' }}>{ev.address}</p>
    </div>
  );
}

// ── Kartu countdown ───────────────────────────────────────────────
function CountdownCard({ date, serif }: { date: string; serif: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const target = new Date(date).getTime();
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;
  const cells: [number, string][] = [[d, 'Hari'], [h, 'Jam'], [m, 'Menit'], [s, 'Detik']];
  return (
    <div>
      <p className="sb-hand text-xl mb-2" style={{ color: '#8A6A4A' }}>✎ menghitung hari bahagia</p>
      <div className="flex justify-center gap-3">
        {cells.map(([v, l]) => (
          <div key={l} className="w-14">
            <p className={`${serif} text-2xl`} style={{ color: INK }}>{String(v).padStart(2, '0')}</p>
            <p className="sb-hand text-lg leading-none" style={{ color: '#8A6A4A' }}>{l.toLowerCase()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function downloadICS(data: WeddingData) {
  const ev = data.events.resepsi;
  const dt = (d: string, t: string) => {
    const [hh, mm] = (t || '08:00').split(':');
    const dtObj = new Date(d);
    dtObj.setHours(parseInt(hh || '8', 10), parseInt(mm || '0', 10));
    return dtObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
    `DTSTART:${dt(ev.date, ev.timeStart)}`, `DTEND:${dt(ev.date, ev.timeEnd || ev.timeStart)}`,
    `SUMMARY:Pernikahan ${data.couple.groom.nickname || ''} & ${data.couple.bride.nickname || ''}`,
    `LOCATION:${ev.venueName} ${ev.address}`.replace(/\n/g, ' '),
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'undangan.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

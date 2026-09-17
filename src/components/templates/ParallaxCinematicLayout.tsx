import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PiPlayCircleDuotone as Play,
  PiPauseCircleDuotone as Pause,
  PiMapPinDuotone as MapPin,
  PiCalendarDuotone as Calendar,
  PiClockDuotone as Clock,
  PiHeartDuotone as Heart,
  PiCopyDuotone as Copy,
  PiCheckCircleDuotone as Check,
  PiEnvelopeSimpleOpenDuotone as Envelope,
  PiGiftDuotone as GiftIcon,
  PiInstagramLogoDuotone as Instagram,
  PiCaretDownBold as ArrowDown,
  PiCaretUpBold as ArrowUp,
  PiCameraDuotone as CameraIcon,
  PiSparkleDuotone as Sparkle,
} from 'react-icons/pi';
import { WeddingData, ThemeConfig, RSVP, Guest } from '../../types';

// ════════════════════════════════════════════════════════════════
// TYPES & CAMERA WAYPOINTS (After Effects 2.5D Multiplane System)
// ════════════════════════════════════════════════════════════════

interface ParallaxCinematicLayoutProps {
  data: WeddingData;
  theme: ThemeConfig;
  guest?: Guest | null;
  onAddRSVP: (rsvp: RSVP) => void;
  rsvps: RSVP[];
  embedded?: boolean;
}

interface CameraWaypoint {
  id: string;
  name: string;
  worldY: number; // in vh
  worldScale: number; // Dolly zoom factor
  worldRotate: number; // Camera tilt in deg
  bgY: number; // 0.2x speed (far plane)
  fgY: number; // 2.2x speed (near plane)
  lensStreakX: number; // Anamorphic flare shift
}

const WAYPOINTS: CameraWaypoint[] = [
  { id: 'cover',   name: 'Sampul',          worldY: 0,    worldScale: 1.0,  worldRotate: 0,    bgY: 0,    fgY: 0,     lensStreakX: -50 },
  { id: 'groom',   name: 'Mempelai Pria',   worldY: -100, worldScale: 1.08, worldRotate: -1.5, bgY: -20,  fgY: -220,  lensStreakX: 20  },
  { id: 'bride',   name: 'Mempelai Wanita', worldY: -200, worldScale: 1.08, worldRotate: 1.5,  bgY: -40,  fgY: -440,  lensStreakX: -30 },
  { id: 'events',  name: 'Akad & Resepsi',  worldY: -300, worldScale: 1.0,  worldRotate: 0,    bgY: -60,  fgY: -660,  lensStreakX: 10  },
  { id: 'gallery', name: 'Momen Bahagia',   worldY: -400, worldScale: 1.04, worldRotate: -0.8, bgY: -80,  fgY: -880,  lensStreakX: -15 },
  { id: 'rsvp',    name: 'Amplop & RSVP',   worldY: -500, worldScale: 1.0,  worldRotate: 0,    bgY: -100, fgY: -1100, lensStreakX: 0   },
];

// Helper: resolve Google Drive or direct image URLs
const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('drive.google.com/file/d/')) {
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m?.[1]) return `https://lh3.googleusercontent.com/d/${m[1]}`;
  }
  return url;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTFhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNDQ0IiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

// ════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════

export default function ParallaxCinematicLayout({
  data,
  theme,
  guest,
  onAddRSVP,
  rsvps,
  embedded = false,
}: ParallaxCinematicLayoutProps) {
  // Current active shot index (0 to 5)
  const [activeShot, setActiveShot] = useState(embedded ? 1 : 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // RSVP Form States
  const [rsvpName, setRsvpName] = useState(guest?.name || '');
  const [rsvpStatus, setRsvpStatus] = useState<'Hadir' | 'Tidak Hadir' | 'Ragu-ragu'>('Hadir');
  const [rsvpPax, setRsvpPax] = useState(guest?.paxLimit || 1);
  const [rsvpWishes, setRsvpWishes] = useState('');
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Countdown timer
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const audioRef = useRef<HTMLAudioElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const lastTransitionTime = useRef(0);
  const activeShotRef = useRef(activeShot);
  useEffect(() => {
    activeShotRef.current = activeShot;
  }, [activeShot]);

  // Synchronize guest prop
  useEffect(() => {
    if (guest) {
      setRsvpName(guest.name);
      setRsvpPax(guest.paxLimit);
    }
  }, [guest]);

  // Live countdown
  useEffect(() => {
    const calc = () => {
      const diff = +new Date(data?.countdownDate || '2026-08-08') - +new Date();
      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff / 3600000) % 24),
          minutes: Math.floor((diff / 60000) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [data?.countdownDate]);

  // ══════════════════════════════════════════════════════════════
  // CAMERA DIRECTOR: Fly Camera to Waypoint
  // ══════════════════════════════════════════════════════════════

  const goToShot = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(WAYPOINTS.length - 1, idx));
    const now = Date.now();
    // Debounce camera movement to prevent skipping multiple scenes at once
    if (now - lastTransitionTime.current < 650) return;
    lastTransitionTime.current = now;

    setIsTransitioning(true);
    setActiveShot(clamped);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 1100);
  }, []);

  const nextShot = useCallback(() => goToShot(activeShotRef.current + 1), [goToShot]);
  const prevShot = useCallback(() => goToShot(activeShotRef.current - 1), [goToShot]);

  // Handle Cover Opening -> Push camera forward into Groom scene
  const handleOpenInvitation = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
    goToShot(1);
  }, [goToShot]);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  // Wheel & Touch swipe listeners for smooth slide transitions
  useEffect(() => {
    const view = rootRef.current?.ownerDocument.defaultView;
    if (!view) return;
    const handleWheel = (e: WheelEvent) => {
      // Allow natural scroll inside active RSVP or wishes container if scrollable
      const target = e.target as HTMLElement | null;
      const scrollable = target && typeof target.closest === 'function' ? target.closest('.plx-allow-scroll') : null;
      if (scrollable) {
        const canScrollDown = scrollable.scrollTop + scrollable.clientHeight < scrollable.scrollHeight - 10;
        const canScrollUp = scrollable.scrollTop > 10;
        if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) {
          return; // Let child scroll
        }
      }

      if (Math.abs(e.deltaY) > 25) {
        if (e.deltaY > 0) nextShot();
        else prevShot();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      touchStartY.current = null;

      // Check if user is scrolling inside an internal list
      const target = e.target as HTMLElement | null;
      const scrollable = target && typeof target.closest === 'function' ? target.closest('.plx-allow-scroll') : null;
      if (scrollable) {
        const canScrollDown = scrollable.scrollTop + scrollable.clientHeight < scrollable.scrollHeight - 10;
        const canScrollUp = scrollable.scrollTop > 10;
        if ((deltaY > 0 && canScrollDown) || (deltaY < 0 && canScrollUp)) {
          return;
        }
      }

      if (Math.abs(deltaY) > 40) {
        if (deltaY > 0) nextShot();
        else prevShot();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        nextShot();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        prevShot();
      }
    };

    view.addEventListener('wheel', handleWheel, { passive: true });
    view.addEventListener('touchstart', handleTouchStart, { passive: true });
    view.addEventListener('touchend', handleTouchEnd, { passive: true });
    view.addEventListener('keydown', handleKeyDown);

    return () => {
      view.removeEventListener('wheel', handleWheel);
      view.removeEventListener('touchstart', handleTouchStart);
      view.removeEventListener('touchend', handleTouchEnd);
      view.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextShot, prevShot]);

  // RSVP submit
  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;

    onAddRSVP({
      id: Date.now().toString(),
      guestId: guest?.id,
      guestName: rsvpName.trim(),
      status: rsvpStatus,
      paxCount: rsvpStatus === 'Hadir' ? rsvpPax : 0,
      wishes: rsvpWishes.trim(),
      timestamp: new Date().toISOString(),
    });

    setRsvpSuccess(true);
    setRsvpWishes('');
    setTimeout(() => setRsvpSuccess(false), 5000);
  };

  const copyGiftNumber = (idx: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  const currentCam = WAYPOINTS[activeShot] || WAYPOINTS[0];
  const groomNick = data?.couple?.groom?.nickname || 'Groom';
  const brideNick = data?.couple?.bride?.nickname || 'Bride';
  const groomPhoto = getImageUrl(data?.couple?.groom?.photoUrl || '') || PLACEHOLDER;
  const bridePhoto = getImageUrl(data?.couple?.bride?.photoUrl || '') || PLACEHOLDER;
  const guestName = guest?.name || 'Tamu Undangan';

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none bg-[var(--theme-bg)] text-[var(--theme-text)]"
      style={{
        '--theme-primary': theme.primaryHex,
        '--theme-secondary': theme.secondaryHex,
        '--theme-accent': theme.accentHex,
        '--theme-bg': theme.bgHex,
        '--theme-surface': theme.bgPatternHex,
        '--theme-text': theme.textHex,
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      } as React.CSSProperties}
    >
      {/* ── STYLES (Pure GPU Compositor, Zero Libs) ── */}
      <style>{`
        /* The AE Virtual Camera Motion Curve */
        .ae-camera-stage {
          transition: transform 1200ms cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
          transform-style: preserve-3d;
        }

        .ae-bg-plane {
          transition: transform 1400ms cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }

        .ae-fg-plane {
          transition: transform 1000ms cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }

        .ae-lens-flare {
          transition: transform 1200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 800ms ease-out;
          will-change: transform, opacity;
        }

        /* Depth of Field: Rack Focus between shots */
        .ae-scene-layer {
          transition: filter 1100ms cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 900ms ease-out,
                      transform 1200ms cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity, filter;
        }
        .ae-scene-layer.in-focus {
          opacity: 1;
          filter: blur(0px);
          transform: scale(1);
          pointer-events: auto;
        }
        .ae-scene-layer.out-of-focus {
          opacity: 0.12;
          filter: blur(12px);
          transform: scale(0.92);
          pointer-events: none;
        }

        /* Sea-glass titles and solid deep-petrol scene cards. */
        .ae-title {
          color: var(--theme-primary);
        }

        .ae-scene-card {
          background: var(--theme-surface);
          border: 1px solid color-mix(in srgb, var(--theme-primary) 32%, transparent);
          box-shadow: 0 20px 48px -20px rgba(0, 0, 0, 0.65);
        }

        /* Film grain */
        .ae-film-grain::after {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.035;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          mix-blend-mode: screen;
          z-index: 50;
        }

        /* Ambient floating bokeh */
        .ae-bokeh {
          position: absolute;
          border-radius: 50%;
          filter: blur(30px);
          pointer-events: none;
        }

        /* Shimmer pulsing button */
        .ae-pulse-btn {
          animation: ae-pulse 2.4s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }
        @keyframes ae-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 color-mix(in srgb, var(--theme-primary) 30%, transparent); }
          50% { transform: scale(1.03); box-shadow: 0 0 0 14px transparent; }
        }
        @media (max-height: 640px) {
          .ae-scene-layer > div { max-height: 76vh; overflow-y: auto; }
          .ae-scene-layer h1 { font-size: 2.5rem; }
        }
      `}</style>

      {/* Audio Element */}
      {data?.musicUrl && <audio ref={audioRef} src={data.musicUrl} loop preload="auto" />}

      {/* ════════════════════════════════════════════════════════
          LAYER 1: BACKGROUND PLANE (0.2x speed - Far distance)
         ════════════════════════════════════════════════════════ */}
      <div
        className="ae-bg-plane absolute inset-0 w-full h-[600vh] pointer-events-none"
        style={{
          transform: `translate3d(0, ${currentCam.bgY}vh, 0)`,
        }}
      >
        {/* Restrained ambient depth; the scene surfaces remain solid. */}
        <div className="ae-bokeh w-[300px] h-[300px] -top-32 -left-32 bg-[var(--theme-primary)] opacity-[0.04]" />
        <div className="ae-bokeh w-[300px] h-[300px] top-[280vh] -right-20 bg-[var(--theme-secondary)] opacity-[0.04]" />

        {/* Cinematic geometric architectural wireframes */}
        <div className="absolute top-[8vh] left-1/2 -translate-x-1/2 w-[700px] h-[700px] border border-[var(--theme-primary)]/10 rounded-full" />
        <div className="absolute top-[108vh] left-1/2 -translate-x-1/2 w-[600px] h-[600px] border border-[var(--theme-primary)]/10 rounded-full" />
        <div className="absolute top-[208vh] left-1/2 -translate-x-1/2 w-[650px] h-[650px] border border-[var(--theme-primary)]/10 rounded-full" />
        <div className="absolute top-[308vh] left-1/2 -translate-x-1/2 w-[720px] h-[720px] border border-[var(--theme-primary)]/10 rounded-full" />
      </div>

      {/* ════════════════════════════════════════════════════════
          LAYER 2: VIRTUAL CAMERA STAGE (1.0x - Object Focus)
         ════════════════════════════════════════════════════════ */}
      <div
        className="ae-camera-stage absolute inset-0 w-full h-[600vh] ae-film-grain"
        style={{
          transform: `translate3d(0, ${currentCam.worldY}vh, 0) scale(${currentCam.worldScale}) rotate(${currentCam.worldRotate}deg)`,
        }}
      >
        {/* ── SCENE 0: COVER / MONOGRAM ── */}
        <section className={`ae-scene-layer absolute top-0 inset-x-0 h-screen flex flex-col items-center justify-center p-6 text-center ${activeShot === 0 ? 'in-focus' : 'out-of-focus'}`}>
          <div className="relative z-10 max-w-lg w-full flex flex-col items-center plx-allow-scroll">
            {/* Monogram emblem */}
            <div className="w-16 h-16 rounded-full border border-[var(--theme-primary)]/30 flex items-center justify-center mb-6 bg-[var(--theme-bg)] backdrop-blur-md">
              <span className="text-xl ae-title font-serif tracking-wider">
                {groomNick[0]}&amp;{brideNick[0]}
              </span>
            </div>

            <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-400 mb-4">The Wedding Of</p>

            <h1 className="text-5xl md:text-7xl font-serif ae-title mb-2 tracking-tight">
              {groomNick}
            </h1>
            <span className="text-2xl text-[var(--theme-secondary)] font-serif my-1">&amp;</span>
            <h1 className="text-5xl md:text-7xl font-serif ae-title mb-8 tracking-tight">
              {brideNick}
            </h1>

            <div className="w-24 h-px bg-[var(--theme-primary)] opacity-40 mb-6" />

            {/* Guest Pill */}
            <div className="mb-8 px-5 py-2.5 rounded-2xl bg-[var(--theme-bg)] border border-white/10 backdrop-blur-sm">
              <p className="text-[11px] text-zinc-400 uppercase tracking-wider mb-0.5">Kepada Yth. Bapak/Ibu/Saudara/i</p>
              <p className="text-base font-semibold text-[var(--theme-secondary)]">{guestName}</p>
            </div>

            {/* CTA: Buka Undangan with Camera Dolly Trigger */}
            <button
              onClick={handleOpenInvitation}
              className="ae-pulse-btn inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all bg-[var(--theme-primary)] text-black shadow-2xl hover:brightness-110 active:scale-95"
            >
              <Envelope size={18} />
              Buka Undangan
            </button>
          </div>
        </section>

        {/* ── SCENE 1: MEMPELAI PRIA (GROOM) ── */}
        <section className={`ae-scene-layer absolute top-[100vh] inset-x-0 h-screen flex flex-col items-center justify-center p-6 text-center ${activeShot === 1 ? 'in-focus' : 'out-of-focus'}`}>
          <div className="max-w-md w-full ae-scene-card rounded-2xl p-6 relative flex flex-col items-center plx-allow-scroll">
            <span className="absolute -top-3 px-4 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-[var(--theme-primary)] text-black shadow-lg">
              The Groom
            </span>

            {/* Portrait Photo with Arch Frame */}
            <div className="w-36 h-44 rounded-t-full rounded-b-2xl overflow-hidden border-2 border-[var(--theme-primary)]/40 p-1 mb-6 shadow-2xl bg-[var(--theme-bg)]">
              <img
                src={groomPhoto}
                alt={data?.couple?.groom?.fullName}
                className="w-full h-full object-cover rounded-t-full rounded-b-xl"
              />
            </div>

            <h2 className="text-2xl md:text-3xl font-serif ae-title mb-2">
              {data?.couple?.groom?.fullName || 'Rian Aditama, S.Kom'}
            </h2>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              Putra tercinta dari:<br />
              <span className="font-semibold text-white">{data?.couple?.groom?.fatherName || 'Bapak Bambang'}</span><br />
              &amp; <span className="font-semibold text-white">{data?.couple?.groom?.motherName || 'Ibu Endang'}</span>
            </p>

            {data?.couple?.groom?.instagram && (
              <a
                href={`https://instagram.com/${data.couple.groom.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[var(--theme-primary)] hover:text-[var(--theme-secondary)] transition-colors border border-[var(--theme-primary)]/30 px-4 py-2.5 rounded-full"
              >
                <Instagram size={14} /> {data.couple.groom.instagram}
              </a>
            )}
          </div>
        </section>

        {/* ── SCENE 2: MEMPELAI WANITA (BRIDE) ── */}
        <section className={`ae-scene-layer absolute top-[200vh] inset-x-0 h-screen flex flex-col items-center justify-center p-6 text-center ${activeShot === 2 ? 'in-focus' : 'out-of-focus'}`}>
          <div className="max-w-md w-full ae-scene-card rounded-2xl p-6 relative flex flex-col items-center plx-allow-scroll">
            <span className="absolute -top-3 px-4 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-[var(--theme-primary)] text-black shadow-lg">
              The Bride
            </span>

            {/* Portrait Photo with Arch Frame */}
            <div className="w-36 h-44 rounded-t-full rounded-b-2xl overflow-hidden border-2 border-[var(--theme-primary)]/40 p-1 mb-6 shadow-2xl bg-[var(--theme-bg)]">
              <img
                src={bridePhoto}
                alt={data?.couple?.bride?.fullName}
                className="w-full h-full object-cover rounded-t-full rounded-b-xl"
              />
            </div>

            <h2 className="text-2xl md:text-3xl font-serif ae-title mb-2">
              {data?.couple?.bride?.fullName || 'Salsabila Putri, S.Ds'}
            </h2>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              Putri tercinta dari:<br />
              <span className="font-semibold text-white">{data?.couple?.bride?.fatherName || 'Bapak Ahmad'}</span><br />
              &amp; <span className="font-semibold text-white">{data?.couple?.bride?.motherName || 'Ibu Siti'}</span>
            </p>

            {data?.couple?.bride?.instagram && (
              <a
                href={`https://instagram.com/${data.couple.bride.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[var(--theme-primary)] hover:text-[var(--theme-secondary)] transition-colors border border-[var(--theme-primary)]/30 px-4 py-2.5 rounded-full"
              >
                <Instagram size={14} /> {data.couple.bride.instagram}
              </a>
            )}
          </div>
        </section>

        {/* ── SCENE 3: AKAD & RESEPSI (SAVE THE DATE) ── */}
        <section className={`ae-scene-layer absolute top-[300vh] inset-x-0 h-screen flex flex-col items-center justify-center p-6 text-center ${activeShot === 3 ? 'in-focus' : 'out-of-focus'}`}>
          <div className="max-w-xl w-full ae-scene-card rounded-2xl p-5 md:p-8 flex flex-col items-center max-h-[78vh] overflow-y-auto plx-allow-scroll">
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-1">Save The Date</p>
            <h2 className="text-3xl font-serif ae-title mb-4">Hari Bahagia</h2>

            {/* Countdown Badge */}
            <div className="grid grid-cols-4 gap-2 mb-6 w-full max-w-sm">
              {[
                { label: 'Hari', val: countdown.days },
                { label: 'Jam', val: countdown.hours },
                { label: 'Menit', val: countdown.minutes },
                { label: 'Detik', val: countdown.seconds },
              ].map(({ label, val }) => (
                <div key={label} className="bg-[var(--theme-bg)] border border-white/10 rounded-xl p-2 text-center">
                  <span className="text-xl md:text-2xl font-bold font-serif text-[var(--theme-primary)]">{val}</span>
                  <span className="block text-[9px] uppercase tracking-wider text-zinc-400">{label}</span>
                </div>
              ))}
            </div>

            {/* Cards Grid: Akad & Resepsi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
              {/* Akad */}
              <div className="p-4 rounded-2xl bg-[var(--theme-bg)] border border-white/5">
                <h3 className="text-base font-semibold text-[var(--theme-primary)] mb-2 flex items-center gap-1.5">
                  <Calendar size={16} /> {data?.events?.akad?.name || 'Akad Nikah'}
                </h3>
                <p className="text-xs text-zinc-300 mb-1">{formatDate(data?.events?.akad?.date || '')}</p>
                <p className="text-xs text-zinc-400 mb-2 flex items-center gap-1">
                  <Clock size={12} /> {data?.events?.akad?.timeStart} - {data?.events?.akad?.timeEnd || 'Selesai'}
                </p>
                <p className="text-xs font-medium text-white mb-2">{data?.events?.akad?.venueName}</p>
                {data?.events?.akad?.googleMapsUrl && (
                  <a
                    href={data.events.akad.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[var(--theme-primary)] hover:underline"
                  >
                    <MapPin size={12} /> Lihat Lokasi Maps
                  </a>
                )}
              </div>

              {/* Resepsi */}
              <div className="p-4 rounded-2xl bg-[var(--theme-bg)] border border-white/5">
                <h3 className="text-base font-semibold text-[var(--theme-primary)] mb-2 flex items-center gap-1.5">
                  <Calendar size={16} /> {data?.events?.resepsi?.name || 'Resepsi'}
                </h3>
                <p className="text-xs text-zinc-300 mb-1">{formatDate(data?.events?.resepsi?.date || '')}</p>
                <p className="text-xs text-zinc-400 mb-2 flex items-center gap-1">
                  <Clock size={12} /> {data?.events?.resepsi?.timeStart} - {data?.events?.resepsi?.timeEnd || 'Selesai'}
                </p>
                <p className="text-xs font-medium text-white mb-2">{data?.events?.resepsi?.venueName}</p>
                {data?.events?.resepsi?.googleMapsUrl && (
                  <a
                    href={data.events.resepsi.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[var(--theme-primary)] hover:underline"
                  >
                    <MapPin size={12} /> Lihat Lokasi Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── SCENE 4: GALLERY & STORY ── */}
        <section className={`ae-scene-layer absolute top-[400vh] inset-x-0 h-screen flex flex-col items-center justify-center p-6 text-center ${activeShot === 4 ? 'in-focus' : 'out-of-focus'}`}>
          <div className="max-w-2xl w-full ae-scene-card rounded-2xl p-5 md:p-8 flex flex-col items-center max-h-[78vh] overflow-y-auto plx-allow-scroll">
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-1">Our Moments</p>
            <h2 className="text-3xl font-serif ae-title mb-6">Galeri Kenangan</h2>

            {/* 3x3 or 2x2 Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full mb-6">
              {(data?.gallery?.length ? data.gallery.slice(0, 6) : [groomPhoto, bridePhoto]).map((imgUrl, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-lg group">
                  <img
                    src={getImageUrl(imgUrl)}
                    alt={`Moment ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              ))}
            </div>

            {/* Love story quote snippet */}
            <p className="text-xs italic text-zinc-400 max-w-md">
              &ldquo;{data?.quoteText || 'Dan di antara tanda-tanda kebesaran-Nya diciptakan-Nya pasangan hidup untukmu...'}&rdquo;
            </p>
          </div>
        </section>

        {/* ── SCENE 5: AMPLOP & RSVP (INTERACTIVE DESK) ── */}
        <section className={`ae-scene-layer absolute top-[500vh] inset-x-0 h-screen flex flex-col items-center justify-center p-6 text-center ${activeShot === 5 ? 'in-focus' : 'out-of-focus'}`}>
          <div className="max-w-lg w-full ae-scene-card rounded-2xl p-5 md:p-8 flex flex-col items-center max-h-[78vh] overflow-y-auto plx-allow-scroll">
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-1">Doa &amp; Konfirmasi</p>
            <h2 className="text-3xl font-serif ae-title mb-4">Amplop &amp; RSVP</h2>

            {/* Amplop Digital list */}
            {data?.gifts && data.gifts.length > 0 && (
              <div className="w-full space-y-2.5 mb-6 text-left">
                {data.gifts.map((gift, idx) => (
                  <div key={gift.id} className="p-3.5 rounded-xl bg-[var(--theme-bg)] border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[var(--theme-primary)] uppercase block">{gift.name}</span>
                      <span className="text-sm font-mono text-white tracking-wider">{gift.accountNumber}</span>
                      <span className="text-[10px] text-zinc-400 block">a.n {gift.accountHolder}</span>
                    </div>
                    <button
                      onClick={() => copyGiftNumber(idx, gift.accountNumber)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--theme-bg)] text-[var(--theme-primary)] border border-[var(--theme-primary)]/30 hover:bg-[var(--theme-primary)] hover:text-black transition-all flex items-center gap-1"
                    >
                      {copiedIdx === idx ? <Check size={14} /> : <Copy size={14} />}
                      {copiedIdx === idx ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* RSVP Form */}
            <form onSubmit={handleRSVPSubmit} className="w-full space-y-3 text-left">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-1">Nama Anda</label>
                <input
                  type="text"
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--theme-bg)] border border-white/10 text-xs focus:outline-none focus:border-[var(--theme-primary)] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-1">Kehadiran</label>
                  <select
                    value={rsvpStatus}
                    onChange={(e) => setRsvpStatus(e.target.value as RSVP['status'])}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--theme-bg)] border border-white/10 text-xs focus:outline-none focus:border-[var(--theme-primary)] text-white"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Tidak Hadir">Tidak Hadir</option>
                    <option value="Ragu-ragu">Ragu-ragu</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-1">Jumlah Pax</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={rsvpPax}
                    onChange={(e) => setRsvpPax(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--theme-bg)] border border-white/10 text-xs focus:outline-none focus:border-[var(--theme-primary)] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-1">Ucapan &amp; Doa</label>
                <textarea
                  rows={2}
                  value={rsvpWishes}
                  onChange={(e) => setRsvpWishes(e.target.value)}
                  placeholder="Tuliskan doa restu untuk kedua mempelai..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--theme-bg)] border border-white/10 text-xs focus:outline-none focus:border-[var(--theme-primary)] text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[var(--theme-primary)] text-black text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg"
              >
                {rsvpSuccess ? '✓ RSVP Berhasil Dikirim' : 'Kirim Konfirmasi Kehadiran'}
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* ════════════════════════════════════════════════════════
          LAYER 3: FOREGROUND PLANE (2.2x speed - Floating bokeh)
         ════════════════════════════════════════════════════════ */}
      <div
        className="ae-fg-plane absolute inset-0 w-full h-[600vh] pointer-events-none z-30"
        style={{
          transform: `translate3d(0, ${currentCam.fgY}vh, 0)`,
        }}
      >
        {/* Floating dust/bokeh rushing past camera */}
        <div className="absolute top-[30vh] left-[15%] w-4 h-4 rounded-full bg-[var(--theme-primary)]/30 blur-sm" />
        <div className="absolute top-[80vh] right-[20%] w-6 h-6 rounded-full bg-[var(--theme-secondary)]/20 blur-md" />
        <div className="absolute top-[170vh] left-[30%] w-5 h-5 rounded-full bg-[var(--theme-secondary)]/30 blur-sm" />
        <div className="absolute top-[250vh] right-[15%] w-7 h-7 rounded-full bg-[var(--theme-primary)]/30 blur-md" />
        <div className="absolute top-[340vh] left-[20%] w-4 h-4 rounded-full bg-[var(--theme-primary)]/20 blur-xs" />
        <div className="absolute top-[450vh] right-[35%] w-6 h-6 rounded-full bg-[var(--theme-primary)]/30 blur-sm" />
      </div>

      {/* ════════════════════════════════════════════════════════
          LAYER 4: ANAMORPHIC LENS FLARE (Moves on camera pan)
         ════════════════════════════════════════════════════════ */}
      <div
        className="ae-lens-flare absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 w-[180vw] h-px bg-[var(--theme-primary)] blur-[1px]"
        style={{
          transform: `translate3d(${currentCam.lensStreakX}vw, -50%, 0) rotate(-12deg)`,
          opacity: isTransitioning ? 0.3 : 0.06,
        }}
      />

      {/* ════════════════════════════════════════════════════════
          CINEMATIC HUD & CONTROLS (Persistent Viewport Layer)
         ════════════════════════════════════════════════════════ */}

      {/* Top Left: Chapter indicator */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-2 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-ping" />
        <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[var(--theme-primary)] font-mono">
          SCENE 0{activeShot + 1} // {currentCam.name}
        </span>
      </div>

      {/* Right: Film Scrubber Timeline Dots */}
      <div className="fixed right-1 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3">
        {WAYPOINTS.map((wp, idx) => (
          <button
            key={wp.id}
            onClick={() => goToShot(idx)}
            className="group relative flex items-center justify-center p-1.5 focus:outline-none"
            aria-label={`Go to ${wp.name}`}
          >
            <span
              className={`block rounded-full transition-all duration-500 ${
                activeShot === idx
                  ? 'w-3 h-3 bg-[var(--theme-primary)] shadow-[0_0_12px_rgba(159,214,210,0.5)]'
                  : 'w-1.5 h-1.5 bg-white/20 group-hover:bg-white/60'
              }`}
            />
            {/* Tooltip on hover */}
            <span className="absolute right-7 px-2.5 py-1 rounded-md bg-[var(--theme-surface)] border border-white/10 text-[9px] uppercase font-semibold text-[var(--theme-secondary)] tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {wp.name}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom Center: Camera Navigation Prompt */}
      {activeShot < WAYPOINTS.length - 1 && (
        <button
          onClick={nextShot}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 text-zinc-400 hover:text-[var(--theme-primary)] transition-colors focus:outline-none"
        >
          <span className="text-[9px] uppercase tracking-[0.3em] font-mono">Scroll / Geser</span>
          <ArrowDown size={18} className="animate-bounce" />
        </button>
      )}

      {/* Floating Audio Toggle FAB */}
      {data?.musicUrl && (
        <button
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-primary)]/40 text-[var(--theme-primary)] flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
          aria-label={isPlaying ? 'Mute Music' : 'Play Music'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
      )}
    </div>
  );
}

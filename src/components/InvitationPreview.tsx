'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  PiHeartDuotone as Heart, 
  PiCalendarDuotone as Calendar, 
  PiMapPinDuotone as MapPin, 
  PiClockDuotone as Clock, 
  PiGiftDuotone as Gift, 
  PiCopyDuotone as Copy, 
  PiCheckDuotone as Check, 
  PiInstagramLogoDuotone as Instagram, 
  PiMusicNotesDuotone as Music, 
  PiSpeakerHighDuotone as Volume2, 
  PiSpeakerSlashDuotone as VolumeX, 
  PiBookOpenDuotone as BookOpen, 
  PiPaperPlaneTiltDuotone as Send,
  PiSparkleDuotone as Sparkles,
  PiArrowRightDuotone as ArrowRight,
  PiArrowSquareOutDuotone as ExternalLink,
  PiCaretDownDuotone as ChevronDown
} from 'react-icons/pi';
import { motion, AnimatePresence } from 'motion/react';
import { WeddingData, RSVP, ThemeConfig, Guest } from '../types';
import DarkLuxuryLayout from './templates/DarkLuxuryLayout';
import LuxuryPinkLayout from './templates/LuxuryPinkLayout';
import NetflixLuxuryLayout from './templates/NetflixLuxuryLayout';
import GrandBallroomLayout from './templates/GrandBallroomLayout';
import RoyalArabianLayout from './templates/RoyalArabianLayout';
import SpotiLoveLayout from './templates/SpotiLoveLayout';
import { DEFAULT_THEMES } from '../data/defaultData';
import { convertGoogleDriveUrl } from '../utils/googleDrive';

interface InvitationPreviewProps {
  data: WeddingData;
  themeId: string;
  onAddRSVP: (rsvp: RSVP) => void;
  rsvps: RSVP[];
  guest?: Guest; // If a personalized guest opened this URL
  embedded?: boolean; // If in builder sidebar
}

// Vintage Floral Branch SVG Divider
const FloralDivider = ({ className = 'w-48 h-8 text-amber-600/35' }: { className?: string }) => (
  <svg viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} mx-auto my-3`}>
    <path d="M100 20c-15-5-30-5-45 0-10 3-20 8-35 5M100 20c15-5 30-5 45 0 10 3 20 8 35 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M100 20c-3-8-10-14-16-10 6-8 14-8 16 0m0 0c3-8 10-14 16-10-6-8-14-8-16 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="currentColor" fillOpacity="0.05"/>
    <circle cx="100" cy="20" r="2.5" fill="currentColor"/>
    <circle cx="55" cy="20" r="1.5" fill="currentColor"/>
    <circle cx="145" cy="20" r="1.5" fill="currentColor"/>
  </svg>
);

// Luxury corner ornament SVG
const LuxuryCorner = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2500/svg" className={className}>
    <path d="M3 3h34v34M7 7h26v26M11 11h18v18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function InvitationPreview({ data, themeId, onAddRSVP, rsvps, guest, embedded = false }: InvitationPreviewProps) {
  const currentTheme = DEFAULT_THEMES.find(t => t.id === themeId) || DEFAULT_THEMES[0];

  if (currentTheme.layout === 'spotilove') {
    return (
      <SpotiLoveLayout 
        data={data} 
        theme={currentTheme} 
        guest={guest} 
        onAddRSVP={onAddRSVP} 
        rsvps={rsvps} 
      />
    );
  }

  if (currentTheme.layout === 'royal-arabian') {
    return (
      <RoyalArabianLayout 
        data={data} 
        theme={currentTheme} 
        guest={guest} 
        onAddRSVP={onAddRSVP} 
        rsvps={rsvps} 
      />
    );
  }

  if (currentTheme.layout === 'grand-ballroom') {
    return (
      <GrandBallroomLayout 
        data={data} 
        theme={currentTheme} 
        guest={guest} 
        onAddRSVP={onAddRSVP} 
        rsvps={rsvps} 
      />
    );
  }

  if (currentTheme.layout === 'netflix-luxury') {
    return (
      <NetflixLuxuryLayout 
        data={data} 
        theme={currentTheme} 
        guest={guest} 
        onAddRSVP={onAddRSVP} 
        rsvps={rsvps} 
      />
    );
  }

  if (currentTheme.layout === 'luxury-pink') {
    return (
      <LuxuryPinkLayout 
        data={data} 
        theme={currentTheme} 
        guest={guest} 
        onAddRSVP={onAddRSVP} 
        rsvps={rsvps} 
      />
    );
  }

  if (currentTheme.layout === 'dark-luxury') {
    return (
      <DarkLuxuryLayout 
        data={data} 
        theme={currentTheme} 
        guest={guest} 
        onAddRSVP={onAddRSVP} 
        rsvps={rsvps} 
      />
    );
  }
  
  // States
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedGiftId, setCopiedGiftId] = useState<string | null>(null);
  
  // RSVP Form States
  const [rsvpStatus, setRsvpStatus] = useState<'Hadir' | 'Tidak Hadir' | 'Ragu-ragu'>('Hadir');
  const [rsvpPaxCount, setRsvpPaxCount] = useState(1);
  const [rsvpWishes, setRsvpWishes] = useState('');
  const [rsvpGuestName, setRsvpGuestName] = useState('');
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  // Countdown States
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Refs for Audio (Lazy Initialize)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Set guest default name
  useEffect(() => {
    if (guest) {
      setRsvpGuestName(guest.name);
      setRsvpPaxCount(guest.paxLimit);
    } else {
      setRsvpGuestName('');
    }
  }, [guest]);

  // Simple image URL resolver (Cloudinary URLs are direct, Google Drive needs conversion)
  const getImageUrl = (url: string) => {
    if (!url) return '';
    return convertGoogleDriveUrl(url);
  };

  // Music URL is now always a direct URL (Cloudinary or external link)
  const resolvedMusicUrl = data?.musicUrl || '';

  // Audio Playback Lifecycle
  useEffect(() => {
    if (!resolvedMusicUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(resolvedMusicUrl);
      audioRef.current.loop = true;
    } else if (audioRef.current.src !== resolvedMusicUrl) {
      audioRef.current.pause();
      audioRef.current.src = resolvedMusicUrl;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }

    return () => {
      if (audioRef.current && !embedded) {
        audioRef.current.pause();
      }
    };
  }, [resolvedMusicUrl]);

  useEffect(() => {
    if (isOpen && audioRef.current && !embedded) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.log("Autoplay blocked. Browser awaits guest interaction:", err);
        setIsPlaying(false);
      });
    }
  }, [isOpen, embedded]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Countdown target logic
  useEffect(() => {
    const calculateCountdown = () => {
      const difference = +new Date(data?.countdownDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 65), // Safe bound
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [data?.countdownDate]);

  const handleCopyGift = (id: string, accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber).then(() => {
      setCopiedGiftId(id);
      setTimeout(() => setCopiedGiftId(null), 2000);
    });
  };

  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpGuestName.trim() || !rsvpWishes.trim()) return;

    onAddRSVP({
      id: `rsvp-${Date.now()}`,
      guestId: guest?.id,
      guestName: rsvpGuestName.trim(),
      status: rsvpStatus,
      paxCount: rsvpStatus === 'Hadir' ? Number(rsvpPaxCount) : 0,
      wishes: rsvpWishes.trim(),
      timestamp: new Date().toISOString()
    });

    setRsvpSuccess(true);
    setRsvpWishes('');
    setTimeout(() => {
      setRsvpSuccess(false);
    }, 5000);
  };

  const isRFX = currentTheme.id === 'rfx-dark';
  
  // Premium Card styles matching wedding aesthetics
  const premiumCardClass = isRFX
    ? "bg-black/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
    : "bg-white/90 backdrop-blur-xl border border-amber-100 rounded-3xl p-6 shadow-xl relative overflow-hidden";

  const goldTextAccent = isRFX ? 'text-amber-500' : 'text-amber-700';
  const goldenLineBorder = isRFX ? 'border-amber-950/40' : 'border-amber-100';

  return (
    <div 
      className={`relative w-full h-full overflow-y-auto overflow-x-hidden ${isRFX ? 'font-sans bg-[#020202] text-zinc-100' : 'font-sans'}`}
      style={{ 
        backgroundColor: currentTheme.bgHex, 
        color: currentTheme.textHex,
        // BG image for opened state (parallax layout)
        backgroundImage: (isOpen && data?.bgImageUrl)
          ? `linear-gradient(to bottom, ${isRFX ? 'rgba(2,2,2,0.85), rgba(5,5,5,0.92)' : 'rgba(255,253,250,0.93), rgba(254,251,245,0.975)'}), url('${getImageUrl(data?.bgImageUrl)}')`
          : 'none',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Dynamic CSS Variables style overrides based on current selected theme */}
      <style>{`
        :root {
          --theme-primary: ${currentTheme.primaryHex};
          --theme-secondary: ${currentTheme.secondaryHex};
          --theme-bg-pattern: ${currentTheme.bgPatternHex};
          --theme-accent: ${currentTheme.accentHex};
          --theme-accent-rgb: ${isRFX ? '239, 68, 68' : '180, 83, 9'};
        }
        .theme-text-accent {
          color: var(--theme-accent) !important;
        }
        .theme-border-accent {
          border-color: var(--theme-accent) !important;
        }
        .theme-bg-accent {
          background-color: var(--theme-accent) !important;
        }
        .theme-bg-primary {
          background-color: var(--theme-primary) !important;
        }
        .theme-badge {
          background-color: ${currentTheme.primaryHex}15 !important;
          color: var(--theme-accent) !important;
          border-color: ${currentTheme.primaryHex}33 !important;
        }
        .theme-gradient-accent {
          background: linear-gradient(135deg, var(--theme-primary), var(--theme-accent)) !important;
        }
      `}</style>
      {/* Background overlay patterns */}
      {!isOpen && (
        <div className="absolute inset-0 bg-[#000]/10 pointer-events-none z-0" />
      )}

      {/* Dynamic leaf fall simulations for luxury wedding atmosphere */}
      {isOpen && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-40">
          <div className="absolute top-[10%] left-[8%] w-10 h-10 border border-amber-500/10 rounded-full animate-spin-slow" />
          <div className="absolute top-[40%] right-[12%] w-14 h-14 border border-rose-500/10 rounded-full animate-pulse" />
          <div className="absolute top-[75%] left-[15%] w-8 h-8 border border-emerald-500/5 rounded-full" />
        </div>
      )}

      {/* Floating Music player button once invitation is entered */}
      {isOpen && !embedded && (
        <button
          onClick={toggleMusic}
          className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl border z-50 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer ${
            isRFX 
              ? 'bg-zinc-950 text-white border-zinc-800 shadow-[0_0_20px_rgba(245,158,11,0.25)]' 
              : 'bg-white text-amber-900 border-amber-100 hover:text-amber-700 shadow-xl'
          }`}
        >
          {isPlaying ? (
            <div className="flex items-center justify-center relative">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400/20 opacity-75 animate-ping" />
              <Volume2 className="w-5 h-5 text-amber-500 animate-pulse relative z-10" />
            </div>
          ) : (
            <VolumeX className="w-5 h-5 text-slate-400" />
          )}
        </button>
      )}

      {/* ==================== 1. COVER PAGE VIEW (GATE) ==================== */}
      {!isOpen ? (
        <div 
          className="min-h-screen w-full flex flex-col justify-between items-center px-6 py-12 text-center relative z-20 overflow-hidden bg-cover bg-center"
          style={{ 
            background: isRFX
              ? `linear-gradient(to bottom, rgba(2,2,2,0.8), #020202), url('${getImageUrl(data.ogImageUrl) || 'https://lh3.googleusercontent.com/d/1EhkWZdyR3SGNE8bXdrxDFTrNzN9RHx0r'}')`
              : `linear-gradient(to bottom, rgba(255,254,251,0.88), #fffefb), url('${getImageUrl(data.ogImageUrl) || 'https://lh3.googleusercontent.com/d/1EhkWZdyR3SGNE8bXdrxDFTrNzN9RHx0r'}')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        >
          {/* Header Flourish */}
          <div className="space-y-3 pt-6 animate-fadeIn">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-550 block">
              The Wedding Celebration of
            </span>
            <div className="flex justify-center items-center gap-2 opacity-50">
              <span className="w-10 h-px bg-amber-400" />
              <Heart className="w-3.5 h-3.5 text-amber-500" fill="currentColor" />
              <span className="w-10 h-px bg-amber-400" />
            </div>
          </div>

          {/* Central Calligraphy focus */}
          <div className="space-y-6 max-w-lg my-auto text-center">
            {/* Couple Calligraphy Initials Monogram Frame */}
            <div className={`mx-auto w-24 h-24 rounded-full border-2 flex items-center justify-center p-2 mb-4 relative ${isRFX ? 'border-amber-500/20 bg-zinc-950/60' : 'border-amber-200 bg-white/70'}`}>
              <div className="absolute -inset-1 border border-amber-500/10 rounded-full animate-spin-slow" />
              <span className="text-3xl font-cursive text-amber-500">
                {data?.couple?.groom.nickname[0]} & {data?.couple?.bride.nickname[0]}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-cursive leading-tight text-amber-550 select-none drop-shadow-sm tracking-wide">
              {data?.couple?.groom.nickname} & {data?.couple?.bride.nickname}
            </h1>
            
            <p className="text-xs uppercase tracking-[0.25em] font-serif text-slate-500">
              Sabtu, 08 Agustus 2026
            </p>
          </div>

          {/* Luxury Card for Recipient */}
          <div className={`w-full max-w-sm rounded-[32px] border p-6 space-y-4 shadow-2xl relative ${
            isRFX 
              ? 'bg-zinc-955/90 border-[#27272a]/60 shadow-[0_15px_35px_rgba(0,0,0,0.85)]' 
              : 'bg-white/95 border-amber-50/50 shadow-xl'
          }`}>
            {/* Decorative corners inside recipient card */}
            <LuxuryCorner className="absolute top-2.5 left-2.5 w-6 h-6 text-amber-550/20 rotate-0" />
            <LuxuryCorner className="absolute top-2.5 right-2.5 w-6 h-6 text-amber-550/20 rotate-90" />
            <LuxuryCorner className="absolute bottom-2.5 left-2.5 w-6 h-6 text-amber-550/20 -rotate-90" />
            <LuxuryCorner className="absolute bottom-2.5 right-2.5 w-6 h-6 text-amber-550/20 rotate-180" />

            <div className="py-2">
              <p className="text-[9.5px] uppercase font-bold tracking-[0.2em] text-amber-550/80 mb-2">KEPADA YTH. BAPAK/IBU/SAUDARA/I</p>
              <h3 className="text-xl font-serif font-black text-amber-800 filter drop-shadow-sm truncate px-3">
                {guest ? guest.name : 'Tamu Undangan Spesial'}
              </h3>
              <p className="text-[10px] text-zinc-450 mt-1 font-sans">Kami sangat menantikan kehadiran Anda di hari bahagia kami.</p>
              
              {(guest?.group || !guest) && (
                <span className={`inline-block mt-2.5 text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full border ${
                  isRFX 
                    ? 'bg-amber-950/25 text-amber-400 border-amber-900/40' 
                    : 'bg-amber-50 text-amber-800 border-amber-100/60'
                }`}>
                  {guest ? guest.group : 'TAMU KEHORMATAN'}
                </span>
              )}
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-xs text-white shadow-xl hover:scale-101 hover:brightness-105 active:scale-99 transition-all cursor-pointer bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 font-serif"
            >
              <Music className="w-3.5 h-3.5 animate-bounce" />
              Buka Undangan Spesial
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (

        /* ==================== FULL MAIN INVITE SITE ==================== */
        <div className={`relative z-10 w-full max-w-xl mx-auto shadow-2xl min-h-screen border-x pb-12 ${
          isRFX ? 'bg-zinc-950/90 border-zinc-900 text-zinc-100' : 'bg-[#fffdfa]/95 border-amber-100/60 text-slate-800'
        }`}>
          
          {/* Elegant Top Gold Ornamental Frame */}
          <div className="h-6 w-full bg-gradient-to-r from-amber-700/20 via-amber-600/40 to-amber-700/20 flex items-center justify-center relative overflow-hidden border-b border-amber-500/20">
            <span className="text-[9px] tracking-[0.54em] uppercase font-bold text-amber-500 text-center select-none font-serif">A RFX.VISUAL CINEMATIC WORK</span>
          </div>

          {/* ==================== HERO HEADER SECTION ==================== */}
          <section className="py-16 px-6 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 opacity-20 flex justify-center">
              <LuxuryCorner className="w-16 h-16 text-amber-550/20 rotate-180" />
            </div>

            <span className="text-[10px] uppercase tracking-[0.3em] text-amber-550 font-bold block">
              WALIMATUL URSY
            </span>

            <FloralDivider />

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] font-serif text-slate-400">Pertemuan Jiwa & Komitmen Abadi</p>
              <h2 className="text-6xl md:text-7xl font-cursive tracking-wide text-amber-550 py-2 filter drop-shadow-sm select-none">
                {data?.couple?.groom.nickname} & {data?.couple?.bride.nickname}
              </h2>
              <p className="text-xs font-bold font-mono tracking-widest text-slate-500">SABTU, 08 AGUSTUS 2026</p>
            </div>

            <FloralDivider />

            {/* COUNTDOWN TIMER WIDGET (LUXURY ARCHED CARD) */}
            <div className="w-full max-w-sm mx-auto p-6 rounded-[32px] border relative shadow-xl overflow-hidden bg-white/5"
              style={{ borderColor: isRFX ? 'rgba(245,158,11,0.2)' : 'rgba(180,83,9,0.1)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
              
              <h4 className="text-[9px] uppercase font-bold tracking-[0.25em] text-amber-500 mb-4 flex items-center justify-center gap-1.5 font-serif">
                <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                MENGHITUNG HARI SAKRAL
              </h4>
              
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
                <div className={`p-2 sm:p-3 rounded-2xl flex flex-col items-center border ${isRFX ? 'bg-zinc-900/60 border-zinc-800' : 'bg-amber-50/40 border-amber-100/50'}`}>
                  <span className="text-lg sm:text-xl md:text-2xl font-black font-sans text-amber-500">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="text-[8.5px] sm:text-[9.5px] text-zinc-505 font-medium mt-1">Hari</span>
                </div>
                <div className={`p-2 sm:p-3 rounded-2xl flex flex-col items-center border ${isRFX ? 'bg-zinc-900/60 border-zinc-800' : 'bg-amber-50/40 border-amber-100/50'}`}>
                  <span className="text-lg sm:text-xl md:text-2xl font-black font-sans text-amber-500">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[8.5px] sm:text-[9.5px] text-zinc-505 font-medium mt-1">Jam</span>
                </div>
                <div className={`p-2 sm:p-3 rounded-2xl flex flex-col items-center border ${isRFX ? 'bg-zinc-900/60 border-zinc-800' : 'bg-amber-50/40 border-amber-100/50'}`}>
                  <span className="text-lg sm:text-xl md:text-2xl font-black font-sans text-amber-500">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[8.5px] sm:text-[9.5px] text-zinc-505 font-medium mt-1">Menit</span>
                </div>
                <div className={`p-2 sm:p-3 rounded-2xl flex flex-col items-center border ${isRFX ? 'bg-zinc-900/60 border-zinc-800' : 'bg-amber-50/40 border-amber-100/50'}`}>
                  <span className="text-lg sm:text-xl md:text-2xl font-black font-sans text-amber-500">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[8.5px] sm:text-[9.5px] text-zinc-505 font-medium mt-1">Detik</span>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== 2. HOLY VERSE / QUOTE SECTION ==================== */}
          <section className={`px-4 py-8 md:p-12 text-center space-y-4 border-y ${isRFX ? 'bg-black/40 border-zinc-900' : 'bg-amber-50/20 border-amber-50'}`}>
            <div className="flex justify-center opacity-40">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mx-1" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mx-1" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#dfa52b] mx-1" />
            </div>
            
            <p className="text-xs md:text-sm leading-relaxed italic max-w-md mx-auto font-serif text-slate-500 px-3">
              "{data.quoteText}"
            </p>
            <span className="block text-[11px] font-black tracking-widest text-amber-600 uppercase font-serif">
              — {data.quoteSource}
            </span>
          </section>

          {/* ==================== 3. BRIDE & GROOM PROFILES LAYER ==================== */}
          <section className="px-4 py-8 md:p-12 text-center space-y-12">
            <div className="space-y-2">
              <span className="text-[9.5px] uppercase font-bold tracking-[0.25em] text-amber-550 block">THE HAPPY COUPLE</span>
              <h3 className="text-2xl font-serif font-semibold text-amber-700">Mempelai Pernikahan</h3>
            </div>

            {/* Groom card */}
            <div className="space-y-4 max-w-sm mx-auto">
              {/* Luxury Arched Photo Frame (Vantage Style) */}
              <div className={`mx-auto w-48 h-64 rounded-t-[100px] rounded-b-lg overflow-hidden shadow-2xl border-4 ring-8 ring-amber-100/25 transition-transform duration-500 hover:scale-[1.025] ${
                isRFX ? 'border-amber-950/60 bg-zinc-950' : 'border-white bg-white'
              }`}>
                <img 
                  src={getImageUrl(data?.couple?.groom.photoUrl)} 
                  alt={data?.couple?.groom.fullName} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-[0.2em] text-amber-550 uppercase">MEMPELAI PRIA</span>
                <h3 className="text-2xl font-serif font-black tracking-wide text-amber-700">
                  {data?.couple?.groom.fullName}
                </h3>
                <p className="text-xs font-medium max-w-xs mx-auto leading-relaxed text-zinc-500 pt-1">
                  {data?.couple?.groom.about}
                </p>
                <div className="text-[10.5px] text-zinc-455 font-serif py-1">
                  <span className="block font-bold">Putra Pertama dari:</span>
                  <span className="block italic text-zinc-500">{data?.couple?.groom.fatherName} & {data?.couple?.groom.motherName}</span>
                </div>
                
                <a 
                  href={`https://instagram.com/${data?.couple?.groom.instagram.replace('@','')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10.5px] font-bold mt-2 text-stone-500 hover:text-amber-600 transition"
                >
                  <Instagram className="w-3.5 h-3.5 text-amber-600" />
                  {data?.couple?.groom.instagram}
                </a>
              </div>
            </div>

            {/* Romantic central icon breaker */}
            <div className="flex justify-center items-center gap-3 py-6">
              <span className="w-14 h-px bg-gradient-to-r from-transparent to-amber-400" />
              <Heart className="w-5 h-5 text-amber-500 fill-amber-500/10 animate-pulse" />
              <span className="w-14 h-px bg-gradient-to-l from-transparent to-amber-400" />
            </div>

            {/* Bride card */}
            <div className="space-y-4 max-w-sm mx-auto">
              {/* Arched card photo frame */}
              <div className={`mx-auto w-48 h-64 rounded-t-[100px] rounded-b-lg overflow-hidden shadow-2xl border-4 ring-8 ring-amber-100/25 transition-transform duration-500 hover:scale-[1.025] ${
                isRFX ? 'border-amber-950/60 bg-zinc-950' : 'border-white bg-white'
              }`}>
                <img 
                  src={getImageUrl(data?.couple?.bride.photoUrl)} 
                  alt={data?.couple?.bride.fullName} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-[0.2em] text-amber-550 uppercase">MEMPELAI WANITA</span>
                <h3 className="text-2xl font-serif font-black tracking-wide text-amber-700">
                  {data?.couple?.bride.fullName}
                </h3>
                <p className="text-xs font-medium max-w-xs mx-auto leading-relaxed text-zinc-500 pt-1">
                  {data?.couple?.bride.about}
                </p>
                <div className="text-[10.5px] text-zinc-455 font-serif py-1">
                  <span className="block font-bold">Putri Bungsu dari:</span>
                  <span className="block italic text-zinc-500">{data?.couple?.bride.fatherName} & {data?.couple?.bride.motherName}</span>
                </div>
                
                <a 
                  href={`https://instagram.com/${data?.couple?.bride.instagram.replace('@','')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10.5px] font-bold mt-2 text-stone-500 hover:text-amber-600 transition"
                >
                  <Instagram className="w-3.5 h-3.5 text-amber-600" />
                  {data?.couple?.bride.instagram}
                </a>
              </div>
            </div>
          </section>

          {/* ==================== 4. AGENDA / EVENTS STRUCTURE ==================== */}
          <section className={`px-4 py-8 md:p-12 space-y-8 ${isRFX ? 'bg-black/30' : 'bg-amber-50/5'}`}>
            <div className="text-center space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-550 block font-serif">THE CELEBRATION</span>
              <h3 className="text-3xl font-serif text-amber-800">Detail Rangkaian Acara</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Kami mengundang Bapak/Ibu sekalian menyaksikan ketulusan akad kami.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 max-w-sm mx-auto">
              
              {/* Event 1: Akad Card */}
              <div className={premiumCardClass}>
                <LuxuryCorner className="absolute top-2 left-2 w-5 h-5 text-amber-500/15 rotate-0" />
                <LuxuryCorner className="absolute bottom-2 right-2 w-5 h-5 text-amber-500/15 rotate-180" />

                <div className="space-y-4 text-center relative z-10">
                  <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center font-serif text-[11px] font-black border border-amber-650 bg-amber-500/10 text-amber-600">
                    AKAD
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-lg text-amber-800 leading-tight">{data?.events?.akad.venueName}</h4>
                    <p className="text-[11px] text-zinc-500 max-w-xs mx-auto min-h-8">{data?.events?.akad.address}</p>
                  </div>

                  <div className="flex justify-center gap-3.5 text-[11px] font-semibold text-zinc-505 border-y py-3 border-dashed border-amber-500/10 font-serif">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      Sabtu, 08 Agt 2026
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {data?.events?.akad.timeStart} - {data?.events?.akad.timeEnd} WIB
                    </span>
                  </div>

                  <a 
                    href={data?.events?.akad.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full justify-center items-center gap-2 py-3.5 rounded-full text-xs font-bold text-amber-900 border border-amber-250 bg-amber-500/10 hover:bg-amber-500/15 transition-all text-center tracking-wider font-serif"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Buka Peta Lokasi Akad
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Event 2: Resepsi Card */}
              <div className={premiumCardClass}>
                <LuxuryCorner className="absolute top-2 left-2 w-5 h-5 text-amber-500/15 rotate-0" />
                <LuxuryCorner className="absolute bottom-2 right-2 w-5 h-5 text-amber-500/15 rotate-180" />

                <div className="space-y-4 text-center relative z-10">
                  <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center font-serif text-[11px] font-black border border-amber-650 bg-amber-500/10 text-amber-600">
                    PARTY
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-lg text-amber-800 leading-tight">{data?.events?.resepsi.venueName}</h4>
                    <p className="text-[11px] text-zinc-505 max-w-xs mx-auto min-h-8">{data?.events?.resepsi.address}</p>
                  </div>

                  <div className="flex justify-center gap-3.5 text-[11px] font-semibold text-zinc-505 border-y py-3 border-dashed border-amber-500/10 font-serif">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      Sabtu, 08 Agt 2026
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {data?.events?.resepsi.timeStart} - {data?.events?.resepsi.timeEnd} WIB
                    </span>
                  </div>

                  <a 
                    href={data?.events?.resepsi.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full justify-center items-center gap-2 py-3.5 rounded-full text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 transition-all text-center shadow-md tracking-wider font-serif"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Buka Peta Lokasi Resepsi
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

            </div>
          </section>

          {/* ==================== 5. LOVE STORY (TIMELINE LAYOUT) ==================== */}
          {data?.showLoveStories !== false && (
            <section className="px-4 py-8 md:p-12 space-y-8">
              <div className="text-center space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-550 block font-serif">OUR STORY</span>
                <h3 className="text-3xl font-serif text-amber-805">Perjalanan Kisah Indah</h3>
                <p className="text-xs text-zinc-550 max-w-xs mx-auto">Bagaimana benih-benih takdir menuntun kami di satu ikatan.</p>
              </div>

              <div className={`space-y-10 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-px ${isRFX ? 'before:bg-amber-950' : 'before:bg-amber-100'}`}>
                {data?.loveStories?.map((story, i) => (
                  <div key={story.id} className="relative pl-9 space-y-2.5 group animate-fadeIn">
                    {/* Timeline bullet */}
                    <span className={`absolute left-1.5 top-1.5 w-4.5 h-4.5 rounded-full border-4 shadow-md flex items-center justify-center transition-all group-hover:scale-110 ${
                      isRFX ? 'border-zinc-950 bg-amber-500' : 'border-[#fffdf9] bg-amber-600'
                    }`} />
                    
                    <div className="text-[10px] font-bold tracking-widest text-amber-600 uppercase font-mono">
                      TAHUN — {story.year}
                    </div>
                    
                    <h4 className="font-serif font-black text-lg text-amber-800">
                      {story.title}
                    </h4>
                    
                    <p className="text-[11.5px] leading-relaxed text-zinc-500">
                      {story.story}
                    </p>

                    {story.imageUrl && (
                      <div className={`w-full max-h-48 rounded-[24px] overflow-hidden mt-3 shadow-md border ${isRFX ? 'border-zinc-800' : 'border-amber-100/40'}`}>
                        <img 
                          src={getImageUrl(story.imageUrl)} 
                          alt={story.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ==================== 6. PREWEDDING IMAGE GALLERY ==================== */}
          <section className={`px-4 py-8 md:p-12 space-y-8 border-y ${isRFX ? 'bg-black/30 border-zinc-900' : 'bg-white border-amber-50'}`}>
            <div className="text-center space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-550 block font-serif">PREWEDDING SCENES</span>
              <h3 className="text-3xl font-serif text-amber-800">Galeri Prewedding</h3>
              <p className="text-xs text-zinc-450 max-w-xs mx-auto">Kumpulan potret bahagia rangkaian prewedding bernuansa estetik.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {data?.gallery?.map((img, idx) => (
                <div key={idx} className={`aspect-[4/5] rounded-[24px] overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border ${
                  isRFX ? 'border-zinc-850 hover:border-amber-500/30' : 'border-amber-100/40 hover:border-amber-400'
                }`}>
                  <img 
                    src={getImageUrl(img) || 'https://lh3.googleusercontent.com/d/1EhkWZdyR3SGNE8bXdrxDFTrNzN9RHx0r'} 
                    alt={`Prewedding ${idx + 1}`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ==================== 7. DIGITAL GIFT LAYER ==================== */}
          <section className="px-4 py-8 md:p-12 text-center space-y-8">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-550 block font-serif">WEDDING GIFT</span>
              <h3 className="text-3xl font-serif text-amber-800">Amplop & Kado Digital</h3>
              <p className="text-xs leading-relaxed max-w-sm mx-auto text-zinc-500">
                Pintu doa restu Anda adalah pelengkap suci kebahagiaan kami. Namun apabila Anda berencana memberikan tanda kasih berupa kado fisik atau amplop cashless, silakan transfer melalui tautan resmi di bawah:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
              {data?.gifts?.map((gift) => (
                <div key={gift.id} className={`p-6 rounded-[28px] text-center space-y-3 relative border transition-all hover:shadow-md ${
                  isRFX ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white border-amber-100 shadow-sm'
                }`}>
                  <span className="text-[10px] uppercase tracking-widest font-black text-amber-600 block">
                    {gift.name}
                  </span>
                  
                  <div className="text-xl font-bold font-mono tracking-wider text-amber-708">
                    {gift.accountNumber}
                  </div>

                  <div className="text-xs text-zinc-455">
                    Atas nama: <span className="font-bold font-serif text-amber-805">{gift.accountHolder}</span>
                  </div>

                  <div className="pt-1.5">
                    <button
                      onClick={() => handleCopyGift(gift.id, gift.accountNumber)}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[11px] font-bold border transition duration-300 cursor-pointer shadow-sm"
                      style={{
                        backgroundColor: copiedGiftId === gift.id ? `${currentTheme.primaryHex}20` : (isRFX ? '#1c1917' : '#FDFBF7'),
                        color: copiedGiftId === gift.id ? currentTheme.accentHex : currentTheme.textHex,
                        borderColor: copiedGiftId === gift.id ? `${currentTheme.primaryHex}60` : currentTheme.accentHex,
                      }}
                    >
                      {copiedGiftId === gift.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-amber-800" /> Nomor Rekening Berhasil Disalin!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-655" /> Salin Detail Akun
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ==================== 8. RSVP & BUKU TAMU LAYER ==================== */}
          <section className={`px-4 py-8 md:p-12 space-y-8 border-t ${isRFX ? 'bg-black/30 border-zinc-900' : 'bg-amber-500/5 border-amber-100/40'}`}>
            <div className="text-center space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-550 block font-serif">RSVP & GUESTBOOK</span>
              <h3 className="text-3xl font-serif text-amber-800">Isi Kehadiran & Doa</h3>
              <p className="text-xs text-zinc-505 max-w-sm mx-auto">Bantu kami merekap porsi kedatangan katering dengan menyelesaikan konfirmasi form berikut:</p>
            </div>

            {/* Form card container */}
            <form onSubmit={handleRSVPSubmit} className={`p-6 rounded-[32px] border space-y-4 max-w-sm mx-auto relative ${
              isRFX ? 'bg-zinc-950 border-zinc-805/60 shadow-2xl' : 'bg-white border-amber-100 shadow-xl'
            }`}>
              {rsvpSuccess && (
                <div className="p-4 border text-xs rounded-2xl text-center space-y-2 bg-amber-50 border-amber-100/80 text-amber-900 animate-fadeIn">
                  <Sparkles className="w-5 h-5 text-amber-600 mx-auto animate-bounce" />
                  <p className="font-bold font-serif">Selamat! RSVP Berhasil Dikonfirmasi.</p>
                  <p className="text-[10px] text-zinc-500 font-sans">Ucapan manis dan kabar kedatangan Anda telah tersimpan di system RFX.</p>
                </div>
              )}

              <div className="space-y-3 pb-2 text-left">
                {/* Name */}
                <div>
                  <label className="block text-[11px] font-bold text-amber-600 mb-1 uppercase tracking-wider">Nama Tamu Pengirim</label>
                  <input
                    type="text"
                    required
                    disabled={!!guest}
                    value={rsvpGuestName}
                    onChange={(e) => setRsvpGuestName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda..."
                    className={`w-full text-xs px-3.5 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                      isRFX ? 'border-zinc-800 bg-zinc-900 text-white font-mono' : 'border-amber-150 bg-[#fffefd] text-slate-800'
                    }`}
                  />
                  {guest && (
                    <span className="block mt-1 text-[9px] text-zinc-505 italic">* Dikunci khusus link undang personal Anda.</span>
                  )}
                </div>

                {/* Status selector */}
                <div>
                  <label className="block text-[11px] font-bold text-amber-600 mb-1 uppercase tracking-wider">Konfirmasi Kehadiran</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Hadir', 'Tidak Hadir', 'Ragu-ragu'] as const).map((status) => {
                      const isSelected = rsvpStatus === status;
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setRsvpStatus(status)}
                          className="py-2.5 rounded-xl border font-bold text-[11px] flex items-center justify-center transition cursor-pointer"
                          style={{
                            backgroundColor: isSelected ? currentTheme.primaryHex : (isRFX ? '#1c1917' : '#FFFFFF'),
                            color: isSelected ? '#FFFFFF' : (isRFX ? '#a1a1aa' : currentTheme.textHex),
                            borderColor: isSelected ? currentTheme.accentHex : (isRFX ? '#2d2a29' : `${currentTheme.primaryHex}40`),
                          }}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Attending count limit */}
                {rsvpStatus === 'Hadir' && (
                  <div>
                    <label className="block text-[11px] font-bold text-amber-600 mb-1 uppercase tracking-wider">
                      Jumlah Pax Kedatangan (Maksimal {guest ? guest.paxLimit : '5'} Pax)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={guest ? guest.paxLimit : 5}
                      value={rsvpPaxCount}
                      onChange={(e) => setRsvpPaxCount(Number(e.target.value))}
                      className={`w-full text-xs px-3.5 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                        isRFX ? 'border-zinc-800 bg-zinc-900 text-white' : 'border-amber-150 bg-[#fffefd] text-slate-800'
                      }`}
                    />
                  </div>
                )}

                {/* Wishes */}
                <div>
                  <label className="block text-[11px] font-bold text-amber-600 mb-1 uppercase tracking-wider">Ucapan & Doa Hangat</label>
                  <textarea
                    required
                    value={rsvpWishes}
                    onChange={(e) => setRsvpWishes(e.target.value)}
                    rows={4}
                    placeholder="Selamat ya Salsa & Rian! Semoga dilancarkan keberkahannya..."
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                      isRFX ? 'border-zinc-800 bg-zinc-900 text-white' : 'border-amber-150 bg-[#fffefd] text-slate-800'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-xs font-bold transition-all hover:scale-[1.01] bg-amber-700 hover:bg-amber-800 shadow-md cursor-pointer font-serif uppercase tracking-widest"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim Reservasi Sekarang
                </button>
              </div>
            </form>

            {/* BEAUTIFIED INSTAGRAM-LIKE GUESTBOOK WISH WALL (Tactile drop shadow cards) */}
            <div className="space-y-4 max-w-sm mx-auto pt-6 border-t border-dashed border-amber-500/20 text-left">
              <h4 className="text-[10px] font-bold tracking-widest text-amber-600 flex items-center gap-2 uppercase font-serif pb-2">
                <BookOpen className="w-4 h-4 text-amber-550" />
                BUKU TAMU & HARAPAN TERKIRIM ({rsvps.length})
              </h4>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {rsvps.map((wish, idx) => {
                  const rotation = (idx % 3 === 0) ? '-1.5deg' : (idx % 3 === 1) ? '1deg' : '-0.5deg';
                  return (
                    <div 
                      key={wish.id}
                      className={`p-5 rounded-2xl relative shadow-md transition-all duration-300 hover:rotate-0 hover:shadow-lg border ${
                        isRFX 
                          ? 'bg-zinc-950/90 border-[#27272a] hover:border-amber-550/30 text-zinc-150' 
                          : 'bg-white border-amber-50 hover:border-amber-200'
                      }`}
                      style={{ transform: `rotate(${rotation})` }}
                    >
                      {/* Decorative Tape effect on polaroid */}
                      <div className="absolute -top-2.5 left-1/3 right-1/3 h-5 bg-amber-100/60 backdrop-blur-sm border-x border-amber-200/40 rounded-sm opacity-60 pointer-events-none" />

                      <div className="flex justify-between items-center mb-2.5 pt-1.5">
                        <span className="font-serif font-black text-[13px] text-amber-850 truncate max-w-[180px]">{wish.guestName}</span>
                        
                        <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase border ${
                          wish.status === 'Hadir'
                            ? (isRFX ? 'bg-emerald-950/50 text-emerald-450 border-emerald-900/30' : 'bg-emerald-50 text-emerald-800 border-emerald-100')
                            : wish.status === 'Tidak Hadir'
                            ? (isRFX ? 'bg-rose-950/40 text-rose-450 border-rose-900/30' : 'bg-rose-50 text-rose-800 border-rose-100')
                            : (isRFX ? 'bg-zinc-900 border border-zinc-800 text-zinc-400' : 'bg-amber-50 text-amber-800 border-amber-100')
                        }`}>
                          {wish.status === 'Hadir' ? `HADIR • ${wish.paxCount} PAX` : wish.status}
                        </span>
                      </div>

                      <p className="text-xs italic leading-relaxed text-zinc-500 pl-1 font-serif pr-1">
                        "{wish.wishes}"
                      </p>

                      <div className="border-t border-dotted border-amber-500/10 mt-3 pt-2 text-[9px] text-zinc-500 text-right uppercase tracking-wider font-mono">
                        {new Date(wish.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ==================== 9. GUEST DIGITAL BOARDING PASS & QR CHECK-IN TICKET ==================== */}
          {data.enableDigitalPass !== false && (
            <section className={`px-4 py-8 md:p-12 text-center space-y-6 ${isRFX ? 'bg-black/40 border-t border-zinc-900/60' : 'bg-amber-50/20 border-t border-amber-100/40'}`}>
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] block text-amber-600 font-serif">DIGITAL ENTRY PASS</span>
                <h3 className="text-3xl font-serif text-amber-800">Tiket Akses QR Code</h3>
                <p className="text-xs leading-relaxed max-w-sm mx-auto text-stone-500">
                  Guna mempermudah check-in tamu VIP tanpa antritangan manual, tunjukkan kode boarding pass personal Anda ini pada scanner di meja penerima tamu.
                </p>
              </div>

              {/* CLASSY BOARDING PASS CARD DESIGN */}
              <div className="max-w-md mx-auto relative overflow-hidden my-4">
                <div className={`rounded-3xl border p-6 text-center space-y-5 relative ${
                  isRFX 
                    ? 'bg-zinc-950/90 border-[#27272a] shadow-[0_10px_25px_rgba(0,0,0,0.85)]' 
                    : 'bg-white border-amber-100/80 shadow-md text-slate-800'
                }`}>
                  {/* Boarding pass horizontal punch notch left & right */}
                  <div className={`absolute top-1/2 -left-[15px] w-7 h-7 rounded-full border-r -translate-y-1/2 ${
                    isRFX ? 'bg-zinc-950 border-[#27272a]' : 'bg-[#fffbf6] border-amber-100'
                  }`} />
                  <div className={`absolute top-1/2 -right-[15px] w-7 h-7 rounded-full border-l -translate-y-1/2 ${
                    isRFX ? 'bg-zinc-950 border-[#27272a]' : 'bg-[#fffbf6] border-amber-100'
                  }`} />

                  {/* Ticket head */}
                  <div className="flex justify-between items-center text-left border-b border-dashed pb-4 border-amber-500/20">
                    <div>
                      <h5 className="text-[8.5px] font-bold tracking-widest text-[#925c0e] uppercase">PASSENGER NAME</h5>
                      <p className="text-sm font-serif font-black text-amber-800">
                        {guest ? guest.name : 'Tamu Undangan Terhormat'}
                      </p>
                    </div>
                    <div className="text-right">
                      <h5 className="text-[8.5px] font-bold tracking-widest text-[#925c0e] uppercase">GROUP CATEGORY</h5>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase mt-1 border ${
                        isRFX ? 'bg-amber-950/40 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-800 border-amber-100'
                      }`}>
                        {guest ? guest.group : 'VVIP INVITEE'}
                      </span>
                    </div>
                  </div>

                  {/* QR Body wrapper */}
                  <div className="py-2 flex flex-col items-center">
                    <div className={`bg-white p-3 rounded-2xl shadow-md border ${isRFX ? 'border-amber-500/20' : 'border-amber-50'}`}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=${isRFX ? 'dc2626' : 'b45309'}&data=${encodeURIComponent(guest ? guest.invitationCode : 'W-SAMPLE99')}`}
                        alt="Check-in access pass barcode"
                        className="w-28 h-28 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="mt-3.5 text-center">
                      <h4 className="text-[8.5px] font-mono tracking-widest text-zinc-500 uppercase">UNIQUE GATEWAYS KEY</h4>
                      <p className="text-lg font-mono tracking-widest font-black text-amber-600 mt-0.5">
                        {guest ? guest.invitationCode : 'W-SAMPLE99'}
                      </p>
                    </div>
                  </div>

                  {/* Ticket foot */}
                  <div className="border-t border-dashed pt-4 border-amber-500/20 text-[9.5px] text-zinc-500 flex justify-between items-center font-mono uppercase tracking-wider">
                    <span>LIMIT: <strong className="text-amber-800">{guest ? guest.paxLimit : 2} PAX</strong></span>
                    <span className="text-amber-600 font-bold">RFX.VISUAL DIGITAL BOARDING PASS</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ==================== FOOTER BRANDING CARD ==================== */}
          <footer className={`text-center py-12 px-6 space-y-4 border-t ${
            isRFX ? 'bg-black border-zinc-900 text-zinc-500' : 'bg-amber-500/5 text-amber-900/60 border-amber-100/40'
          }`}>
            <h4 className="text-amber-500 text-2xl font-cursive leading-tight tracking-wide select-none">
              {data?.couple?.groom.nickname} & {data?.couple?.bride.nickname}
            </h4>
            
            <p className="text-[11.5px] max-w-xs mx-auto font-serif leading-relaxed text-stone-500">
              Merupakan kebahagiaan terbesar bagi kami sekeluarga jikalau Bapak/Ibu sudi kiranya menorehkan restu indah di hari pernikahan suci kami.
            </p>
            
            <div className="flex justify-center items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase py-3 border-t border-amber-500/5 max-w-[240px] mx-auto text-amber-600">
              <span>Wedding Builder</span>
              <span>•</span>
              <span className="font-extrabold pb-0.5">by rfx.visual</span>
            </div>
          </footer>

        </div>
      )}
    </div>
  );
}

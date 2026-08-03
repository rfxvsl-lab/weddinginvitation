import React, { useState, useRef, useEffect } from 'react';
import {
  PiPlayCircleDuotone as Play,
  PiPauseCircleDuotone as Pause,
  PiMapPinDuotone as MapPin,
  PiCalendarDuotone as Calendar,
  PiClockDuotone as Clock,
  PiHeartDuotone as Heart,
  PiCopyDuotone as Copy,
  PiInstagramLogoDuotone as Instagram,
  PiMusicNotesDuotone as Music,
  PiArrowDownDuotone as ArrowDown,
  PiStarDuotone as Star,
  PiLockKeyDuotone as Lock,
  PiLockKeyOpenDuotone as Unlock
} from 'react-icons/pi';
import { motion, AnimatePresence } from 'motion/react';
import { WeddingData, ThemeConfig, RSVP, Guest } from '../../types';

interface DarkLuxuryLayoutProps {
  data: WeddingData;
  theme: ThemeConfig;
  guest?: Guest | null;
  onAddRSVP: (rsvp: RSVP) => void;
  rsvps: RSVP[];
    embedded?: boolean;
}

const DarkLuxuryLayout = ({ data, theme, guest, onAddRSVP, rsvps, embedded = false }: DarkLuxuryLayoutProps) => {
  // --- STATE & REFS ---
  const [isOpen, setIsOpen] = useState(embedded ? true : false);
  const [isUnlocked, setIsUnlocked] = useState(embedded ? true : false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // RSVP Form States
  const [rsvpStatus, setRsvpStatus] = useState<'Hadir' | 'Tidak Hadir' | 'Ragu-ragu'>('Hadir');
  const [rsvpPaxCount, setRsvpPaxCount] = useState(1);
  const [rsvpWishes, setRsvpWishes] = useState('');
  const [rsvpGuestName, setRsvpGuestName] = useState('');
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [copiedGiftIdx, setCopiedGiftIdx] = useState<number | null>(null);

  useEffect(() => {
    if (guest) {
      setRsvpGuestName(guest.name);
      setRsvpPaxCount(guest.paxLimit);
    } else {
      setRsvpGuestName('');
    }
  }, [guest]);

  const guestName = guest ? guest.name : "Tamu Undangan";

  // --- HANDLERS ---
  const handleOpen = () => {
    setIsUnlocked(true);
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Autoplay prevented:", e));
    }
    
    setTimeout(() => {
      setIsOpen(true);
      setIsPlaying(true);
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 1000);
    }, 1500); // Wait for unlock animation to finish before sliding up
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpGuestName || !rsvpStatus) return;

    onAddRSVP({
      id: Date.now().toString(),
      guestId: guest?.id,
      guestName: rsvpGuestName,
      status: rsvpStatus,
      paxCount: rsvpPaxCount,
      wishes: rsvpWishes,
      timestamp: new Date().toISOString()
    });

    setRsvpSuccess(true);
    if (!guest) {
      setRsvpGuestName('');
    }
    setRsvpWishes('');
    setTimeout(() => setRsvpSuccess(false), 5000);
  };

  // --- CUSTOM HELPERS ---
  const GoldText = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-secondary)] to-[var(--theme-accent)] ${className}`}>
      {children}
    </span>
  );

  const GoldDivider = () => (
    <div className="flex items-center justify-center gap-4 py-12 opacity-80">
      <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[var(--theme-primary)]"></div>
      <div className="rotate-45 w-2 h-2 border border-[var(--theme-primary)] bg-[var(--theme-bg)]"></div>
      <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[var(--theme-primary)]"></div>
    </div>
  );

  const FloralOrnament = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M10,90 Q40,60 90,10" />
      <path d="M30,70 C20,50 40,40 50,50 C40,60 20,80 30,70 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M50,50 C40,30 60,20 70,30 C60,40 40,60 50,50 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M70,30 C60,10 80,0 90,10 C80,20 60,40 70,30 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M40,75 C50,90 70,80 60,70 C50,60 30,60 40,75 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M60,55 C70,70 90,60 80,50 C70,40 50,40 60,55 Z" fill="currentColor" fillOpacity="0.1" />
      <circle cx="15" cy="75" r="1.5" fill="currentColor" />
      <circle cx="85" cy="25" r="1.5" fill="currentColor" />
      <circle cx="35" cy="35" r="1" fill="currentColor" />
      <circle cx="75" cy="65" r="1.5" fill="currentColor" />
    </svg>
  );

  const HangingVineOrnament = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 50 200" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25,0 Q35,40 20,80 T30,150 T20,200" />
      <path d="M26,20 C10,25 15,10 26,20 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M22,60 C5,65 10,50 22,60 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M25,100 C10,105 15,90 25,100 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M28,140 C10,145 15,130 28,140 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M22,180 C5,185 10,170 22,180 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M28,40 C45,45 40,30 28,40 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M20,80 C35,85 30,70 20,80 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M27,120 C45,125 40,110 27,120 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M29,160 C45,165 40,150 29,160 Z" fill="currentColor" fillOpacity="0.15" />
      <circle cx="15" cy="35" r="1.5" fill="currentColor" />
      <circle cx="35" cy="95" r="1.5" fill="currentColor" />
      <circle cx="15" cy="135" r="1.5" fill="currentColor" />
    </svg>
  );

  const RealisticFlowerOrnament = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="flower-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--theme-primary)" stopOpacity="1"/>
          <stop offset="70%" stopColor="var(--theme-secondary)" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="var(--theme-bg)" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="petal-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--theme-secondary)"/>
          <stop offset="100%" stopColor="var(--theme-primary)"/>
        </linearGradient>
        <linearGradient id="petal-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--theme-secondary)"/>
          <stop offset="100%" stopColor="var(--theme-primary)"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* Backdrop glow */}
      <circle cx="100" cy="100" r="80" fill="url(#flower-glow)" opacity="0.2"/>

      {/* Elegant long leaves */}
      <path d="M100,100 C160,180 200,120 180,80 C150,110 120,90 100,100 Z" fill="#1A3320" filter="url(#shadow)"/>
      <path d="M100,100 C40,180 0,120 20,80 C50,110 80,90 100,100 Z" fill="#1A3320" filter="url(#shadow)"/>
      <path d="M100,100 C30,30 80,0 120,20 C100,50 110,80 100,100 Z" fill="#204028" filter="url(#shadow)"/>

      {/* Outer Petals */}
      <path d="M100,110 C160,40 200,120 120,160 C80,160 60,140 100,110 Z" fill="url(#petal-grad-1)" filter="url(#shadow)"/>
      <path d="M100,110 C40,40 0,120 80,160 C120,160 140,140 100,110 Z" fill="url(#petal-grad-2)" filter="url(#shadow)"/>
      
      {/* Inner Petals */}
      <path d="M100,120 C140,60 160,130 110,150 C90,150 80,140 100,120 Z" fill="url(#petal-grad-1)" filter="url(#shadow)"/>
      <path d="M100,120 C60,60 40,130 90,150 C110,150 120,140 100,120 Z" fill="url(#petal-grad-2)" filter="url(#shadow)"/>
      
      {/* Core Petals */}
      <path d="M100,125 C120,80 130,130 105,140 C95,140 90,135 100,125 Z" fill="var(--theme-primary)" filter="url(#shadow)"/>
      <path d="M100,125 C80,80 70,130 95,140 C105,140 110,135 100,125 Z" fill="var(--theme-secondary)" filter="url(#shadow)"/>
      
      {/* Center bud */}
      <circle cx="100" cy="130" r="10" fill="var(--theme-bg)" opacity="0.6"/>
      <path d="M95,130 C95,120 105,120 105,130 C105,140 95,140 95,130 Z" fill="var(--theme-primary)" />
    </svg>
  );

  const DelicateHandOrnament = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 100 200" fill="none" stroke="currentColor" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* Palm / Wrist */}
        <path d="M-10,200 C10,160 20,120 15,80" />
        
        {/* Thumb overlapping front */}
        <path d="M-5,100 C15,90 30,70 45,75 C55,80 50,95 35,105 C20,115 5,120 -10,130" fill="currentColor" fillOpacity="0.05" />
        <path d="M35,80 C40,82 45,90 40,95" strokeWidth="0.5" />
        
        {/* Index Finger overlapping from edge */}
        <path d="M15,80 C30,60 50,40 70,45 C85,50 85,70 70,85 C50,105 30,120 15,130" fill="currentColor" fillOpacity="0.05" />
        <path d="M60,55 C68,55 72,65 65,70" strokeWidth="0.5" />
        
        {/* Middle Finger */}
        <path d="M15,130 C35,110 60,85 85,90 C100,95 100,115 80,130 C60,150 40,165 25,175" fill="currentColor" fillOpacity="0.05" />
        <path d="M75,100 C82,100 88,110 80,115" strokeWidth="0.5" />
        
        {/* Ring Finger */}
        <path d="M25,175 C45,155 70,135 90,140 C105,145 105,165 85,180 C65,200 45,210 30,220" fill="currentColor" fillOpacity="0.05" />
        <path d="M80,150 C88,150 92,160 85,165" strokeWidth="0.5" />
      </g>
    </svg>
  );

  // Google Drive Image URL Resolver
  const PLACEHOLDER_IMG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTFhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNDQ0IiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

  const getImageUrl = (url: string) => {
    if (!url) return PLACEHOLDER_IMG;
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
    }
    return url;
  };

  return (
    <div
      className={`min-h-screen ${theme.fontSans} overflow-x-hidden relative`}
      style={{
        '--theme-primary': theme.primaryHex,
        '--theme-secondary': theme.secondaryHex,
        '--theme-bg': theme.bgHex,
        '--theme-text': theme.textHex,
        '--theme-accent': theme.accentHex,
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-text)',
        ...(data?.bgImageUrl ? { backgroundImage: `url(${getImageUrl(data.bgImageUrl)})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : {})
      } as React.CSSProperties}
    >
      {/* Dark overlay for readability when using custom background */}
      {data?.bgImageUrl && (
        <div className="fixed inset-0 bg-black/70 z-0" />
      )}
      
      {/* FONTS & ANIMATIONS */}
      <style>{`
        @keyframes gold-pulse {
            0% { box-shadow: 0 0 0 0 rgba(191, 149, 63, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(191, 149, 63, 0); }
            100% { box-shadow: 0 0 0 0 rgba(191, 149, 63, 0); }
        }
        .animate-gold-pulse {
            animation: gold-pulse 2s infinite;
        }
        
        .reveal-up {
            animation: revealUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
            transform: translateY(30px);
        }
        @keyframes revealUp {
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shine {
            100% { left: 125%; }
        }
        .animate-shine {
            animation: shine 1s;
        }
      `}</style>

      {data?.musicUrl && <audio ref={audioRef} src={data.musicUrl} loop />}

      {/* === LOCK SCREEN (COVER) === */}
      <div className={`fixed inset-0 z-50 bg-[#050505] transition-transform duration-[1.5s] ease-[cubic-bezier(0.87,0,0.13,1)] flex flex-col items-center justify-center p-6 ${isOpen ? '-translate-y-full' : 'translate-y-0'}`}>
        {/* Background with Overlay */}
        <div className="absolute inset-0 z-0">
          <img src={getImageUrl(data?.couple?.groom?.photoUrl || '')} className="w-full h-full object-cover opacity-30 grayscale" alt="Cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
        </div>

        <div className="relative z-10 text-center w-full max-w-lg border border-[#333] p-8 md:p-12 backdrop-blur-sm bg-black/30">
          <p className={`${theme.fontSans} tracking-[0.4em] text-[#888] text-xs uppercase mb-6`}>THE WEDDING OF</p>

          <h1 className={`${theme.fontSerif} text-5xl md:text-7xl mb-4 leading-tight`}>
            <GoldText>{data?.couple?.groom?.nickname}</GoldText>
            <span className="block text-2xl my-2 text-[#666] font-thin">&</span>
            <GoldText>{data?.couple?.bride?.nickname}</GoldText>
          </h1>

          <div className="w-[1px] h-16 bg-gradient-to-b from-[var(--theme-primary)] to-transparent mx-auto my-6"></div>

          {/* Guest Name */}
          <div className="mb-8">
            <p className={`${theme.fontSans} text-xs text-[#888] italic tracking-wide mb-1`}>Kepada Yth,</p>
            <p className={`${theme.fontSerif} text-xl`} style={{ color: 'var(--theme-primary)' }}>{guestName}</p>
          </div>

          <motion.button
            onClick={handleOpen}
            className="group relative flex flex-col items-center justify-center gap-3 transition-all mx-auto"
            animate={isUnlocked ? { scale: [1, 1.1, 1.1, 0], opacity: [1, 1, 1, 0] } : { scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, times: [0, 0.3, 0.7, 1] }}
          >
            <div className="relative w-16 h-16 flex items-center justify-center rounded-full border shadow-[0_0_15px_rgba(191,149,63,0.3)] group-hover:shadow-[0_0_30px_rgba(191,149,63,0.6)] transition-all duration-700 bg-black/50" style={{ borderColor: 'var(--theme-primary)' }}>
              {isUnlocked ? (
                <Unlock className="w-8 h-8" style={{ color: 'var(--theme-primary)' }} />
              ) : (
                <Lock className="w-8 h-8" style={{ color: 'var(--theme-primary)' }} />
              )}
              {/* Glowing ring on unlock */}
              {isUnlocked && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 rounded-full border"
                  style={{ borderColor: 'var(--theme-primary)' }}
                />
              )}
            </div>
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#888] group-hover:text-white transition-colors">{isUnlocked ? 'Membuka...' : 'Buka Undangan'}</span>
          </motion.button>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div ref={contentRef} className={`relative z-10 transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

        {/* 1. HERO HEADER */}
        <header className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          {/* Floral Corner Top Left */}
          <FloralOrnament className="absolute -top-10 -left-10 w-48 h-48 opacity-40 text-[var(--theme-primary)] -rotate-[15deg] z-10 pointer-events-none" />
          {/* Floral Corner Bottom Right */}
          <FloralOrnament className="absolute -bottom-10 -right-10 w-48 h-48 opacity-40 text-[var(--theme-primary)] rotate-[165deg] z-10 pointer-events-none" />

          <motion.div 
            className="absolute inset-0 z-0"
            initial={{ scale: 1.2, opacity: 0 }}
            animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 1.2, opacity: 0 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
          >
            <img src={getImageUrl(data?.couple?.bride?.photoUrl || '')} className="w-full h-full object-cover opacity-30" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#121212]/50 to-[#121212]"></div>
          </motion.div>

          <div className="relative z-10">
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={isOpen ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
              transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
              className={`${theme.fontSerif} text-2xl md:text-4xl text-[#E2E8F0] mb-2 tracking-widest`}
            >
              {data?.couple?.groom?.nickname} <span style={{ color: 'var(--theme-primary)' }}>&</span> {data?.couple?.bride?.nickname}
            </motion.p>
            <motion.div 
              initial={{ scaleX: 0, opacity: 0 }}
              animate={isOpen ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
              transition={{ delay: 1.4, duration: 0.8, ease: 'easeOut' }}
              className="flex items-center justify-center gap-4 my-6"
            >
              <div className="h-[1px] w-12" style={{ backgroundColor: 'var(--theme-primary)' }}></div>
              <p className={`${theme.fontSans} text-xs tracking-[0.3em] uppercase`} style={{ color: 'var(--theme-primary)' }}>WE ARE GETTING MARRIED</p>
              <div className="h-[1px] w-12" style={{ backgroundColor: 'var(--theme-primary)' }}></div>
            </motion.div>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={isOpen ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ delay: 1.8, duration: 1, ease: 'easeOut' }}
              className={`${theme.fontSerif} text-xl md:text-2xl text-[#888]`}
            >
              {formatDate(data.events?.akad?.date || data?.countdownDate || '')}
            </motion.p>
          </div>

          <div className="absolute bottom-10 animate-bounce opacity-50" style={{ color: 'var(--theme-primary)' }}>
            <ArrowDown size={20} />
          </div>
        </header>

        {/* 2. QUOTE */}
        {data?.quoteText && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
          >
            <section className="py-24 px-8 text-center max-w-3xl mx-auto relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-b from-transparent to-[#333]"></div>
              
              <h3 className={`${theme.fontSerif} text-3xl mb-8`} style={{ color: 'var(--theme-primary)' }}>Kutipan Suci</h3>
              <blockquote className={`${theme.fontSerif} text-xl md:text-3xl italic leading-relaxed text-[#CCC] border-l-2 pl-6 md:pl-10 text-left md:text-center md:border-l-0 md:border-t-2 md:pt-10 relative`} style={{ borderColor: 'var(--theme-primary)' }}>
                {/* Floral Ornament Top Left */}
                <FloralOrnament className="absolute -top-12 -left-4 md:-left-12 w-24 h-24 opacity-30 text-[var(--theme-primary)] -rotate-90 hidden md:block" />
                {/* Floral Ornament Bottom Right */}
                <FloralOrnament className="absolute -bottom-12 -right-4 md:-right-12 w-24 h-24 opacity-30 text-[var(--theme-primary)] rotate-90 hidden md:block" />
                "{data?.quoteText}"
              </blockquote>
              <p className={`${theme.fontSans} text-xs font-bold mt-10 uppercase tracking-widest text-[#666]`}>
                â€” {data?.quoteSource}
              </p>
            </section>
            <GoldDivider />
          </motion.div>
        )}

        {/* 3. COUPLE PROFILES */}
        <section className="py-16 px-6 relative overflow-hidden">
          {/* Background subtle ornament */}
          <FloralOrnament className="absolute top-0 right-0 w-72 h-72 opacity-10 text-[var(--theme-primary)] rotate-180 translate-x-1/4 -translate-y-1/4" />
          <FloralOrnament className="absolute bottom-0 left-0 w-72 h-72 opacity-10 text-[var(--theme-primary)] -translate-x-1/4 translate-y-1/4" />

          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={`text-center ${theme.fontSerif} text-4xl md:text-5xl mb-24`}
          >
            <GoldText>Sang Mempelai</GoldText>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-24 max-w-5xl mx-auto relative z-10">
            {/* Groom */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center group"
            >
              <div className="relative w-64 h-64 mx-auto mb-10">
                {/* Glowing Ring */}
                <div className="absolute inset-0 rounded-full border-[2px] shadow-[0_0_15px_rgba(191,149,63,0.3)] group-hover:shadow-[0_0_30px_rgba(191,149,63,0.6)] group-hover:rotate-180 transition-all duration-1000 border-dashed" style={{ borderColor: 'var(--theme-primary)' }}></div>
                <div className="absolute inset-3 rounded-full overflow-hidden">
                  <img src={getImageUrl(data?.couple?.groom?.photoUrl || '')} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" alt="Groom" />
                </div>
              </div>
              <h3 className={`${theme.fontSerif} text-3xl md:text-4xl mb-3 text-[#E2E8F0]`}>{data?.couple?.groom?.fullName}</h3>
              <p className={`${theme.fontSans} text-xs text-[#666] uppercase tracking-[0.2em] mb-2`}>Putra dari</p>
              <p className={`${theme.fontSerif} italic text-lg`} style={{ color: 'var(--theme-primary)' }}>{data?.couple?.groom?.fatherName} <span className="text-[#666]">&</span> {data?.couple?.groom?.motherName}</p>

              {data?.couple?.groom?.instagram && (
                <a href={`https://instagram.com/${data.couple.groom.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-6 px-6 py-2 border rounded-full text-[10px] uppercase tracking-widest text-[#888] hover:text-black transition-all group/ig" style={{ borderColor: 'var(--theme-primary)' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHex; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <Instagram className="w-3.5 h-3.5 group-hover/ig:animate-pulse" /> @{data.couple.groom.instagram.replace('@', '')}
                </a>
              )}
            </motion.div>

            {/* Bride */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center group"
            >
              <div className="relative w-64 h-64 mx-auto mb-10">
                {/* Glowing Ring */}
                <div className="absolute inset-0 rounded-full border-[2px] shadow-[0_0_15px_rgba(191,149,63,0.3)] group-hover:shadow-[0_0_30px_rgba(191,149,63,0.6)] group-hover:-rotate-180 transition-all duration-1000 border-dashed" style={{ borderColor: 'var(--theme-primary)' }}></div>
                <div className="absolute inset-3 rounded-full overflow-hidden">
                  <img src={getImageUrl(data?.couple?.bride?.photoUrl || '')} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" alt="Bride" />
                </div>
              </div>
              <h3 className={`${theme.fontSerif} text-3xl md:text-4xl mb-3 text-[#E2E8F0]`}>{data?.couple?.bride?.fullName}</h3>
              <p className={`${theme.fontSans} text-xs text-[#666] uppercase tracking-[0.2em] mb-2`}>Putri dari</p>
              <p className={`${theme.fontSerif} italic text-lg`} style={{ color: 'var(--theme-primary)' }}>{data?.couple?.bride?.fatherName} <span className="text-[#666]">&</span> {data?.couple?.bride?.motherName}</p>

              {data?.couple?.bride?.instagram && (
                <a href={`https://instagram.com/${data.couple.bride.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-6 px-6 py-2 border rounded-full text-[10px] uppercase tracking-widest text-[#888] hover:text-black transition-all group/ig" style={{ borderColor: 'var(--theme-primary)' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHex; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <Instagram className="w-3.5 h-3.5 group-hover/ig:animate-pulse" /> @{data.couple.bride.instagram.replace('@', '')}
                </a>
              )}
            </motion.div>
          </div>
        </section>

        <GoldDivider />

        {/* 4. EVENTS (Dark Cards) */}
        <section id="events-section" className="py-10 px-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={`text-center ${theme.fontSerif} text-4xl mb-4`}>Rangkaian Acara</h2>
            <p className={`text-center ${theme.fontSans} text-xs text-[#666] tracking-[0.3em] uppercase mb-16`}>Please join us</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Akad Card */}
            {data.events?.akad?.enabled !== false && (
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-[#1A1A1A] border border-[#333] p-10 text-center relative overflow-hidden group transition-colors duration-500" style={{ '--hover-border': theme.primaryHex } as any}
              >
                <style>{`.group:hover { border-color: var(--hover-border); }`}</style>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>

                {/* Hanging Vines */}
                <HangingVineOrnament className="absolute -top-4 -left-2 w-16 h-[110%] opacity-20 text-[var(--theme-primary)] z-0 pointer-events-none group-hover:scale-105 group-hover:opacity-30 transition-all duration-700" />
                <HangingVineOrnament className="absolute -bottom-4 -right-2 w-16 h-[110%] opacity-20 text-[var(--theme-primary)] rotate-180 z-0 pointer-events-none group-hover:scale-105 group-hover:opacity-30 transition-all duration-700" />

                <div className="relative z-10">
                  <h3 className={`${theme.fontSerif} text-2xl mb-6 uppercase tracking-wider`} style={{ color: 'var(--theme-primary)' }}>{data.events?.akad?.name}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 text-[#E2E8F0]">
                      <Calendar size={16} style={{ color: 'var(--theme-primary)' }} />
                      <span className={`${theme.fontSans} text-sm tracking-wide`}>{formatDate(data.events?.akad?.date || '')}</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-[#E2E8F0]">
                      <Clock size={16} style={{ color: 'var(--theme-primary)' }} />
                      <span className={`${theme.fontSans} text-sm tracking-wide`}>{data.events?.akad?.timeStart} - {data.events?.akad?.timeEnd}</span>
                    </div>
                  </div>
                  <div className="my-8 w-12 h-[1px] bg-[#333] mx-auto relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border border-[#333] bg-[#1A1A1A]"></div>
                  </div>
                  <h4 className={`${theme.fontSerif} text-xl mb-2`}>{data.events?.akad?.venueName}</h4>
                  <p className={`${theme.fontSans} text-xs text-[#888] mb-8 leading-relaxed`}>{data.events?.akad?.address}</p>

                  {data.events?.akad?.googleMapsUrl && (
                    <a href={data.events?.akad?.googleMapsUrl} target="_blank" rel="noreferrer" className={`inline-block border px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all`} style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHex; e.currentTarget.style.color = '#000'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = theme.primaryHex; }}>
                      View Location
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            {/* Resepsi Card */}
            {data.events?.resepsi?.enabled !== false && (
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-[#1A1A1A] border border-[#333] p-10 text-center relative overflow-hidden group transition-colors duration-500" style={{ '--hover-border': theme.primaryHex } as any}
              >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>

                {/* Hanging Vines */}
                <HangingVineOrnament className="absolute -top-4 -left-2 w-16 h-[110%] opacity-20 text-[var(--theme-primary)] z-0 pointer-events-none group-hover:scale-105 group-hover:opacity-30 transition-all duration-700" />
                <HangingVineOrnament className="absolute -bottom-4 -right-2 w-16 h-[110%] opacity-20 text-[var(--theme-primary)] rotate-180 z-0 pointer-events-none group-hover:scale-105 group-hover:opacity-30 transition-all duration-700" />

                <div className="relative z-10">
                  <h3 className={`${theme.fontSerif} text-2xl mb-6 uppercase tracking-wider`} style={{ color: 'var(--theme-primary)' }}>{data.events?.resepsi?.name}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 text-[#E2E8F0]">
                      <Calendar size={16} style={{ color: 'var(--theme-primary)' }} />
                      <span className={`${theme.fontSans} text-sm tracking-wide`}>{formatDate(data.events?.resepsi?.date || '')}</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-[#E2E8F0]">
                      <Clock size={16} style={{ color: 'var(--theme-primary)' }} />
                      <span className={`${theme.fontSans} text-sm tracking-wide`}>{data.events?.resepsi?.timeStart} - {data.events?.resepsi?.timeEnd}</span>
                    </div>
                  </div>
                  <div className="my-8 w-12 h-[1px] bg-[#333] mx-auto relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border border-[#333] bg-[#1A1A1A]"></div>
                  </div>
                  <h4 className={`${theme.fontSerif} text-xl mb-2`}>{data.events?.resepsi?.venueName}</h4>
                  <p className={`${theme.fontSans} text-xs text-[#888] mb-8 leading-relaxed`}>{data.events?.resepsi?.address}</p>

                  {data.events?.resepsi?.googleMapsUrl && (
                    <a href={data.events?.resepsi?.googleMapsUrl} target="_blank" rel="noreferrer" className={`inline-block border px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all`} style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHex; e.currentTarget.style.color = '#000'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = theme.primaryHex; }}>
                      View Location
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* 5. GALLERY (Masonry Layout) */}
        {data?.gallery && data.gallery.length > 0 && (
          <section id="gallery-section" className="py-24 px-4 bg-[#0A0A0A] relative overflow-hidden">
            {/* Abstract Blurred Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
              <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[120px]" style={{ backgroundColor: 'var(--theme-primary)' }}></div>
              <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-[0.07] blur-[150px]" style={{ backgroundColor: 'var(--theme-secondary)' }}></div>
              <div className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] rounded-full opacity-10 blur-[100px]" style={{ backgroundColor: 'var(--theme-accent)' }}></div>
              {/* Subtle Grid Pattern */}
              <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            {/* Realistic Floral Ornaments */}
            <RealisticFlowerOrnament className="absolute -top-16 -left-16 w-64 h-64 opacity-50 z-0 drop-shadow-2xl rotate-12 pointer-events-none" />
            <RealisticFlowerOrnament className="absolute -bottom-16 -right-16 w-80 h-80 opacity-40 z-0 drop-shadow-2xl -rotate-45 pointer-events-none" />
            <RealisticFlowerOrnament className="absolute top-1/2 -translate-y-1/2 -right-24 w-72 h-72 opacity-30 z-0 drop-shadow-2xl rotate-90 pointer-events-none" />

            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className={`text-center ${theme.fontSerif} text-3xl md:text-5xl mb-16 tracking-widest`}>
                <GoldText>Galeri Kenangan</GoldText>
              </h2>

              <div className="max-w-6xl mx-auto px-2">
                <div className="grid grid-cols-2 md:grid-cols-3 grid-flow-dense gap-2 md:gap-4 auto-rows-[150px] md:auto-rows-[250px]">
                  {data.gallery.filter(img => img).map((img, idx) => {
                    const masonryClasses = [
                      "col-span-1 row-span-2", // 0
                      "col-span-1 row-span-1", // 1
                      "col-span-1 row-span-2", // 2
                      "col-span-1 row-span-1", // 3
                      "col-span-2 row-span-2", // 4 (besar)
                      "col-span-1 row-span-2", // 5
                      "col-span-2 row-span-1", // 6 (lebar)
                      "col-span-1 row-span-2", // 7
                      "col-span-2 row-span-1", // 8 (lebar)
                    ];
                    const gridClass = masonryClasses[idx % 9];

                    return (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: (idx % 3) * 0.2 }}
                        key={idx} 
                        className={`relative group overflow-hidden rounded-xl ${gridClass}`}
                      >
                        <img
                          src={getImageUrl(img)}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 grayscale group-hover:grayscale-0"
                          alt={`Gallery ${idx + 1}`}
                        />
                        <div className="absolute inset-0 border-[0px] group-hover:border-[4px] transition-all duration-300 pointer-events-none rounded-xl" style={{ borderColor: 'var(--theme-primary)' }}></div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* 6. GIFTS (Black Card Style) */}
        {data?.gifts && data.gifts.length > 0 && (
          <section className="py-20 px-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-xl mx-auto text-center"
            >
              <Star className="w-8 h-8 mx-auto mb-6 animate-pulse" style={{ color: 'var(--theme-primary)' }} />
              <h2 className={`${theme.fontSerif} text-3xl mb-4`}>Kado Digital</h2>
              <p className={`${theme.fontSans} text-xs text-[#888] mb-10 leading-relaxed`}>
                Kehadiran Anda adalah hadiah terindah. Namun jika Anda ingin memberikan tanda kasih, Anda dapat mengirimkannya melalui:
              </p>

              <div className="space-y-6">
                {data.gifts.map((gift, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-[#222] to-[#111] p-6 rounded-xl border border-[#333] shadow-lg relative group overflow-hidden">
                    {/* Shine Effect */}
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine" />

                    <div className="flex justify-between items-start mb-8">
                       <div className={`${theme.fontSerif} tracking-widest text-sm uppercase`} style={{ color: 'var(--theme-primary)' }}>{gift.name}</div>
                       <div className="text-[10px] text-[#555] font-mono">{gift.type === 'address' ? 'ADDRESS' : 'PLATINUM'}</div>
                    </div>
                    <div className="text-left">
                       <p className="font-mono text-xl tracking-widest text-[#E2E8F0] mb-2">{gift.accountNumber}</p>
                       <p className={`${theme.fontSans} text-xs text-[#888] uppercase`}>{gift.accountHolder}</p>
                    </div>
                    {gift.type !== 'address' && (
                       <button
                         onClick={() => { navigator.clipboard.writeText(gift.accountNumber); setCopiedGiftIdx(idx); setTimeout(() => setCopiedGiftIdx(null), 2000); }}
                         className="absolute bottom-6 right-6 hover:text-white transition-colors text-[10px] font-bold"
                         style={{ color: copiedGiftIdx === idx ? '#10b981' : 'var(--theme-primary)' }}
                       >
                         {copiedGiftIdx === idx ? '✓ Tersalin' : <Copy size={18} />}
                       </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* RSVP SECTION */}
        <section className="py-20 px-6 bg-[#0a0a0a] border-t border-[#222]">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-xl mx-auto"
          >
            <h3 className={`${theme.fontSerif} text-3xl mb-8 text-center`} style={{ color: 'var(--theme-primary)' }}>RSVP & Guestbook</h3>
            
            <form onSubmit={handleRSVPSubmit} className="bg-[#111] p-8 rounded-2xl border border-[#333] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent opacity-50"></div>
              
              {/* Corner Floral Ornaments */}
              <FloralOrnament className="absolute -top-16 -left-16 w-48 h-48 opacity-[0.08] text-[var(--theme-primary)] -rotate-[45deg] pointer-events-none z-0" />
              <FloralOrnament className="absolute -bottom-16 -right-16 w-48 h-48 opacity-[0.08] text-[var(--theme-primary)] rotate-[135deg] pointer-events-none z-0" />

              {/* Cute Detailed Hand Holding the Card */}
              <DelicateHandOrnament className="absolute top-[40%] -translate-y-1/2 -left-6 w-24 h-48 opacity-30 text-[var(--theme-primary)] drop-shadow-2xl pointer-events-none z-0" />

              {rsvpSuccess ? (
                <div className="text-center py-8 relative z-10">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: theme.primaryHex + '20' }}>
                    <Heart className="w-8 h-8" style={{ color: 'var(--theme-primary)' }} />
                  </div>
                  <p className={`${theme.fontSerif} text-xl text-[#E2E8F0]`}>Terima kasih atas konfirmasi Anda.</p>
                </div>
              ) : (
                <div className="space-y-5 relative z-10">
                  <div>
                    <label className={`${theme.fontSans} block text-[10px] uppercase tracking-widest text-[#888] mb-2`}>Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={rsvpGuestName}
                      onChange={(e) => setRsvpGuestName(e.target.value)}
                      disabled={!!guest}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded px-4 py-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-[var(--theme-primary)] transition-colors"
                      placeholder="Masukkan nama Anda"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`${theme.fontSans} block text-[10px] uppercase tracking-widest text-[#888] mb-2`}>Kehadiran</label>
                      <select
                        value={rsvpStatus}
                        onChange={(e) => setRsvpStatus(e.target.value as any)}
                        className="w-full bg-[#1A1A1A] border border-[#333] rounded px-4 py-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-[var(--theme-primary)] transition-colors appearance-none"
                      >
                        <option value="Hadir">Hadir</option>
                        <option value="Tidak Hadir">Tidak Hadir</option>
                        <option value="Ragu-ragu">Ragu-ragu</option>
                      </select>
                    </div>
                    <div>
                      <label className={`${theme.fontSans} block text-[10px] uppercase tracking-widest text-[#888] mb-2`}>Jumlah Tamu</label>
                      <input
                        type="number"
                        min="1"
                        max={guest ? guest.paxLimit : 10}
                        value={rsvpPaxCount}
                        onChange={(e) => setRsvpPaxCount(Number(e.target.value))}
                        className="w-full bg-[#1A1A1A] border border-[#333] rounded px-4 py-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-[var(--theme-primary)] transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`${theme.fontSans} block text-[10px] uppercase tracking-widest text-[#888] mb-2`}>Ucapan & Doa</label>
                    <textarea
                      required
                      value={rsvpWishes}
                      onChange={(e) => setRsvpWishes(e.target.value)}
                      rows={3}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded px-4 py-3 text-sm text-[#E2E8F0] focus:outline-none focus:border-[var(--theme-primary)] transition-colors resize-none"
                      placeholder="Tuliskan harapan dan doa..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-4 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-all"
                    style={{ backgroundColor: 'var(--theme-primary)', color: '#000' }}
                  >
                    Kirim Konfirmasi
                  </button>
                </div>
              )}
            </form>

            {/* List of RSVPs */}
            {rsvps && rsvps.length > 0 && (
              <div className="mt-12 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {rsvps.map((rsvp, idx) => (
                  <div key={idx} className="bg-[#111] border border-[#222] p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`${theme.fontSerif} text-[#E2E8F0] font-bold`}>{rsvp.guestName}</span>
                      <span className={`text-[10px] px-2 py-1 rounded border uppercase tracking-wider ${rsvp.status === 'Hadir' ? 'border-green-900 text-green-500' : rsvp.status === 'Tidak Hadir' ? 'border-red-900 text-red-500' : 'border-yellow-900 text-yellow-500'}`}>
                        {rsvp.status}
                      </span>
                    </div>
                    <p className={`${theme.fontSans} text-xs text-[#888]`}>"{rsvp.wishes}"</p>
                    <span className="text-[9px] text-[#444] mt-3 block">{new Date(rsvp.timestamp).toLocaleDateString('id-ID')}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="bg-black py-16 text-center border-t border-[#222]">
          <h2 className={`${theme.fontSerif} text-4xl mb-4 text-[#333]`}>{data?.couple?.groom?.nickname} & {data?.couple?.bride?.nickname}</h2>
          <p className={`${theme.fontSans} text-[10px] uppercase tracking-[0.3em]`} style={{ color: 'var(--theme-primary)' }}>Terima Kasih</p>
        </footer>

        <div className="h-24"></div> {/* Spacer */}
      </div>

      {/* === FLOATING NAV (Dark Glass) === */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-6 w-full z-40 px-6 flex justify-center"
          >
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center gap-6">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center gap-1 text-[#888] hover:text-[var(--theme-primary)] hover:-translate-y-1 transition-all">
                <Heart size={22} />
              </button>
              <button onClick={() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex flex-col items-center gap-1 text-[#888] hover:text-[var(--theme-primary)] hover:-translate-y-1 transition-all">
                <Calendar size={22} />
              </button>
              <button onClick={() => document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex flex-col items-center gap-1 text-[#888] hover:text-[var(--theme-primary)] hover:-translate-y-1 transition-all">
                <MapPin size={22} />
              </button>
              <div className="w-[1px] h-8 bg-white/10 mx-2"></div>
              <button onClick={toggleMusic} className="relative flex items-center justify-center p-2 rounded-full transition-all hover:scale-110" style={{ color: 'var(--theme-primary)' }}>
                {isPlaying && (
                  <span className="absolute inset-0 rounded-full border border-[var(--theme-primary)] animate-ping opacity-20"></span>
                )}
                {isPlaying ? <Music size={24} /> : <Play size={24} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DarkLuxuryLayout;

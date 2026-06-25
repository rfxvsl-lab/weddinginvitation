import React, { useState, useEffect, useRef } from 'react';
import {
    PiHeartDuotone as Heart,
    PiMapPinDuotone as MapPin,
    PiCalendarDuotone as Calendar,
    PiClockDuotone as Clock,
    PiMusicNotesDuotone as Music,
    PiPlayCircleDuotone as Play,
    PiPauseCircleDuotone as Pause,
    PiHouseDuotone as Home,
    PiUserDuotone as User,
    PiImageDuotone as ImageIcon,
    PiChatCircleDuotone as MessageCircle,
    PiCrownDuotone as Crown,
    PiDiamondDuotone as Gem,
    PiSparkleDuotone as Stars,
    PiTicketDuotone as Ticket,
    PiCheckCircleDuotone as CheckCircle,
    PiGiftDuotone as Gift
} from 'react-icons/pi';
import { WeddingData, ThemeConfig, RSVP, Guest } from '../../types';

/** * --- KONFIGURASI ASET ---
 */
const ASSETS = {
    // Musik: Orchestral / Waltz / Grand Entrance
    bgm: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg",
    // Texture: Marble Floor
    marble: "https://www.transparenttextures.com/patterns/white-diamond.png"
};

/**
 * --- GLOBAL CSS & ANIMATIONS ---
 */
const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');

    /* Fonts */
    .font-grand { font-family: 'Cinzel', serif; }
    .font-luxury { font-family: 'Playfair Display', serif; }
    .font-body { font-family: 'Lato', sans-serif; }

    /* --- ANIMATIONS --- */
    
    /* 1. Curtain Mechanics */
    @keyframes curtain-left-open {
      0% { transform: translateX(0) scaleX(1); }
      100% { transform: translateX(-100%) scaleX(0.8); }
    }
    @keyframes curtain-right-open {
      0% { transform: translateX(0) scaleX(1); }
      100% { transform: translateX(100%) scaleX(0.8); }
    }
    @keyframes button-vanish {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(0); opacity: 0; }
    }

    /* 2. Ambient People (Silhouettes) */
    @keyframes walk-slow {
      0% { transform: translateX(-20vw); opacity: 0; }
      20% { opacity: 0.4; }
      80% { opacity: 0.4; }
      100% { transform: translateX(120vw); opacity: 0; }
    }
    
    @keyframes chandelier-sway {
      0%, 100% { transform: rotate(-1deg) translateX(-50%); }
      50% { transform: rotate(1deg) translateX(-50%); }
    }

    /* 3. 3D Stage Entrance */
    @keyframes stage-enter {
      0% { transform: perspective(2000px) rotateX(20deg) scale(0.8) translateY(100px); opacity: 0; }
      100% { transform: perspective(2000px) rotateX(0deg) scale(1) translateY(0); opacity: 1; }
    }

    /* 4. Text Shimmer */
    @keyframes gold-shimmer {
      0% { background-position: -200%; }
      100% { background-position: 200%; }
    }

    /* CLASSES */
    .animate-curtain-l { animation: curtain-left-open 2.5s cubic-bezier(0.77, 0, 0.175, 1) forwards; }
    .animate-curtain-r { animation: curtain-right-open 2.5s cubic-bezier(0.77, 0, 0.175, 1) forwards; }
    .animate-stage-up { animation: stage-enter 1.5s 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    .animate-walk { animation: walk-slow linear infinite; }
    
    /* UTILS */
    .text-gold-luxury {
      background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gold-shimmer 5s linear infinite;
    }

    .glass-ballroom {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 215, 0, 0.4);
      box-shadow: 
        0 0 0 1px rgba(255, 255, 255, 0.5) inset,
        0 20px 50px rgba(0,0,0,0.3),
        0 0 100px rgba(191, 149, 63, 0.2);
    }

    .hide-scrollbar::-webkit-scrollbar { display: none; }
  `}</style>
);

// --- HELPERS ---
const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com/file/d/')) {
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            return `https://lh3.googleusercontent.com/d/${match[1]}`;
        }
    }
    return url;
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

/**
 * --- SVG ASSETS (THE CURTAINS & CHANDELIER) ---
 */

const CurtainSVG = ({ side, className }: { side: 'left' | 'right', className?: string }) => {
    // SVG paths simulate heavy velvet folds
    const isLeft = side === 'left';
    return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={`absolute inset-0 w-full h-full ${className} ${isLeft ? 'origin-left' : 'origin-right'}`}>
            <defs>
                <linearGradient id={`velvet-${side}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={isLeft ? "#4a0404" : "#720e1e"} /> {/* Darker on edges */}
                    <stop offset="20%" stopColor="#720e1e" />
                    <stop offset="40%" stopColor="#8b1a2b" /> {/* Highlight fold */}
                    <stop offset="60%" stopColor="#5e0b16" />
                    <stop offset="80%" stopColor="#8b1a2b" />
                    <stop offset="100%" stopColor={isLeft ? "#720e1e" : "#4a0404"} />
                </linearGradient>
            </defs>
            <path d="M0 0 H100 V90 Q50 100 0 90 Z" fill={`url(#velvet-${side})`} />
            {/* Texture Overlay */}
            <rect x="0" y="0" width="100" height="100" fill="url(#noise)" opacity="0.1" />
        </svg>
    );
};

const ChandelierSVG = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 200 150" className={className}>
        <path d="M100 0 L100 20" stroke="#D4AF37" strokeWidth="2" />
        <path d="M60 40 Q100 80 140 40" fill="none" stroke="#D4AF37" strokeWidth="1" />
        <path d="M40 60 Q100 120 160 60" fill="none" stroke="#D4AF37" strokeWidth="1" />
        {/* Crystals */}
        <circle cx="60" cy="40" r="3" fill="#fff" className="animate-pulse" />
        <circle cx="140" cy="40" r="3" fill="#fff" className="animate-pulse" />
        <circle cx="40" cy="60" r="3" fill="#fff" className="animate-pulse" />
        <circle cx="160" cy="60" r="3" fill="#fff" className="animate-pulse" />
        <circle cx="100" cy="90" r="5" fill="#fff" className="animate-pulse" />
        {/* Glow */}
        <circle cx="100" cy="50" r="60" fill="url(#glow)" opacity="0.3" />
        <defs>
            <radialGradient id="glow">
                <stop offset="0%" stopColor="#fff6d5" />
                <stop offset="100%" stopColor="transparent" />
            </radialGradient>
        </defs>
    </svg>
);

const SilhouetteGuest = ({ delay, duration, scale, top }: { delay: number, duration: number, scale: number, top: number }) => (
    <svg
        viewBox="0 0 50 100"
        className="absolute animate-walk pointer-events-none blur-[2px]"
        style={{
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            height: `${scale}px`,
            top: `${top}%`,
            zIndex: 0
        }}
    >
        <path d="M25 0 C 35 0 35 15 25 15 C 15 15 15 0 25 0 M10 20 L40 20 L35 90 L25 100 L15 90 L10 20" fill="#1a1a1a" opacity="0.7" />
    </svg>
);

/**
 * --- BACKGROUND SYSTEM (BALLROOM) ---
 */
const BallroomBackground = ({ customBg }: { customBg?: string }) => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#0f0505]">
            {/* 1. Base Image (Blurred Ballroom) */}
            <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm transform scale-105" style={{ backgroundImage: `url(${customBg || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=80'})` }}></div>

            {/* 2. Walking Guests Animation (Silhouettes) */}
            <div className="absolute inset-0 z-10 overflow-hidden">
                <SilhouetteGuest delay={0} duration={20} scale={200} top={50} />
                <SilhouetteGuest delay={5} duration={25} scale={180} top={45} />
                <SilhouetteGuest delay={10} duration={22} scale={220} top={55} />
                <SilhouetteGuest delay={2} duration={18} scale={150} top={40} />
            </div>

            {/* 3. Lighting Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80 z-20"></div>

            {/* 4. Spotlights */}
            <div className="absolute top-0 left-1/4 w-[200px] h-[800px] bg-gradient-to-b from-white/10 to-transparent transform -rotate-12 blur-3xl z-20"></div>
            <div className="absolute top-0 right-1/4 w-[200px] h-[800px] bg-gradient-to-b from-white/10 to-transparent transform rotate-12 blur-3xl z-20"></div>
        </div>
    );
};

/**
 * --- COMPONENTS ---
 */

// Stage 1: The Curtain Reveal
interface CurtainProps {
    onOpen: () => void;
}
const CurtainStage = ({ onOpen }: CurtainProps) => {
    const [opening, setOpening] = useState(false);

    const handleOpen = () => {
        setOpening(true);
        // Trigger Music & Sound
        setTimeout(onOpen, 2000); // Wait for curtain to open enough
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-1000 ${opening ? 'pointer-events-none' : ''}`}>

            {/* Left Curtain */}
            <div className={`absolute top-0 left-0 w-1/2 h-full bg-[#4a0404] origin-left z-20 ${opening ? 'animate-curtain-l' : ''}`}>
                <CurtainSVG side="left" />
            </div>

            {/* Right Curtain */}
            <div className={`absolute top-0 right-0 w-1/2 h-full bg-[#4a0404] origin-right z-20 ${opening ? 'animate-curtain-r' : ''}`}>
                <CurtainSVG side="right" />
            </div>

            {/* Center Badge/Button */}
            <div className={`relative z-30 transition-all duration-500 ${opening ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                <div className="relative group cursor-pointer" onClick={handleOpen}>
                    {/* Glow Behind */}
                    <div className="absolute inset-0 bg-[#FFD700] rounded-full blur-[30px] opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>

                    {/* The Badge */}
                    <div className="w-32 h-32 bg-gradient-to-br from-[#4a0404] to-[#2b0202] rounded-full border-4 border-[#D4AF37] shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30"></div>
                        <Crown size={32} className="text-[#FFD700] mb-1 drop-shadow-lg" />
                        <span className="font-grand text-[#FFD700] text-xs tracking-widest">OPEN</span>
                    </div>

                    {/* Tassels (Rope) Graphic */}
                    <div className="absolute top-1/2 -left-32 w-32 h-1 bg-[#D4AF37] z-[-1] transform -translate-y-1/2"></div>
                    <div className="absolute top-1/2 -right-32 w-32 h-1 bg-[#D4AF37] z-[-1] transform -translate-y-1/2"></div>
                </div>
            </div>
        </div>
    );
};

// Navbar (Gold Bar)
const NavBar = ({ activeTab, setTab, data }: { activeTab: string, setTab: (t: string) => void, data: WeddingData }) => {
    const items = [
        { id: 'home', icon: Home, visible: true },
        { id: 'quote', icon: Stars, visible: !!data?.quoteText },
        { id: 'couple', icon: User, visible: true },
        { id: 'event', icon: Calendar, visible: (data?.events?.akad?.enabled !== false || data?.events?.resepsi?.enabled !== false) },
        { id: 'gallery', icon: ImageIcon, visible: !!(data?.gallery && data.gallery.length > 0) },
        { id: 'gift', icon: Gift, visible: !!(data?.gifts && data.gifts.length > 0) },
        { id: 'rsvp', icon: CheckCircle, visible: true },
    ].filter(item => item.visible);

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-6">
            <div className="bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] px-6 py-4 rounded-full flex justify-between shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#D4AF37]/30 relative">
                {/* Gold Shine Top */}
                <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent"></div>

                {items.map((item) => {
                    const active = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setTab(item.id)}
                            className={`relative flex items-center justify-center transition-all duration-300 ${active ? '-translate-y-4' : 'hover:-translate-y-1'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${active ? 'bg-gradient-to-br from-[#D4AF37] to-[#8B6508] shadow-[0_0_15px_#D4AF37]' : 'text-gray-400'}`}>
                                <item.icon size={active ? 20 : 18} className={active ? 'text-black' : ''} />
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

// --- PAGES ---

const HomePage = ({ onEnter, data, guestName }: { onEnter: () => void, data: WeddingData, guestName: string }) => {
    const groomName = data?.couple?.groom?.nickname || 'Groom';
    const brideName = data?.couple?.bride?.nickname || 'Bride';
    const dateObj = new Date(data?.events?.akad?.date || data?.countdownDate || '');
    const dateStr = !isNaN(dateObj.getTime()) ? `${dateObj.getDate().toString().padStart(2, '0')} . ${(dateObj.getMonth() + 1).toString().padStart(2, '0')} . ${dateObj.getFullYear()}` : '';

    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 relative">
            {/* Ornamental Frame inside */}
            <div className="absolute inset-4 border-[1px] border-[#D4AF37]/30 rounded-[30px] pointer-events-none"></div>
            <div className="absolute inset-6 border-[1px] border-[#D4AF37]/10 rounded-[25px] pointer-events-none"></div>

            <h3 className="font-grand text-sm tracking-[0.4em] text-[#8B6508] mb-6 uppercase">The Wedding Celebration</h3>

            <div className="relative mb-6">
                <h1 className="font-luxury text-7xl md:text-9xl text-gold-luxury drop-shadow-sm leading-none">
                    {groomName} <br /> <span className="text-4xl text-[#333]">&</span> <br /> {brideName}
                </h1>
            </div>

            {/* Hero Image - Added */}
            <div className="relative w-40 h-40 md:w-56 md:h-56 mx-auto mb-8 rounded-full border-4 border-[#D4AF37] shadow-xl overflow-hidden bg-gray-100">
                <img
                    src={getImageUrl(data?.couple?.groom?.photoUrl || data?.bgImageUrl || "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80")}
                    alt="Couple"
                    className="w-full h-full object-cover"
                />
            </div>

            {dateStr && (
                <div className="flex items-center gap-4 mb-8 font-grand text-gray-600">
                    <span className="w-12 h-[1px] bg-[#D4AF37]"></span>
                    <span>{dateStr}</span>
                    <span className="w-12 h-[1px] bg-[#D4AF37]"></span>
                </div>
            )}

            {/* Guest Name */}
            <div className="mb-8">
                <p className="font-grand text-xs text-[#888] tracking-widest uppercase mb-2">Kepada Yth,</p>
                <p className="font-luxury text-2xl text-[#D4AF37]">{guestName}</p>
            </div>

            <button onClick={onEnter} className="px-10 py-3 bg-[#1a1a1a] text-[#D4AF37] font-grand text-xs tracking-[0.2em] border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all uppercase shadow-lg">
                Enter Ballroom
            </button>
        </div>
    );
};

const CouplePage = ({ data }: { data: WeddingData }) => {
    return (
        <div className="h-full overflow-y-auto hide-scrollbar p-6 pt-10 text-center relative">
            <h2 className="font-luxury text-4xl text-[#333] mb-12">The Couple</h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-12 pb-24">
                {/* Groom */}
                <div className="relative group">
                    <div className="w-56 h-72 bg-gray-200 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.1)] rotate-[-2deg] group-hover:rotate-0 transition-transform duration-500 bg-white">
                        <img src={getImageUrl(data?.couple?.groom?.photoUrl || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80")} className="w-full h-full object-cover sepia-[0.2]" />
                    </div>
                    <div className="mt-6">
                        <h3 className="font-grand text-2xl text-[#1a1a1a]">{data?.couple?.groom?.fullName}</h3>
                        <p className="font-body text-xs uppercase tracking-widest text-[#8B6508] mt-2">The Groom</p>
                        <p className="font-body text-[10px] text-gray-500 mt-1">Bpk. {data?.couple?.groom?.fatherName} & Ibu {data?.couple?.groom?.motherName}</p>
                    </div>
                </div>

                {/* Bride */}
                <div className="relative group">
                    <div className="w-56 h-72 bg-gray-200 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.1)] rotate-[2deg] group-hover:rotate-0 transition-transform duration-500 bg-white">
                        <img src={getImageUrl(data?.couple?.bride?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80")} className="w-full h-full object-cover sepia-[0.2]" />
                    </div>
                    <div className="mt-6">
                        <h3 className="font-grand text-2xl text-[#1a1a1a]">{data?.couple?.bride?.fullName}</h3>
                        <p className="font-body text-xs uppercase tracking-widest text-[#8B6508] mt-2">The Bride</p>
                        <p className="font-body text-[10px] text-gray-500 mt-1">Bpk. {data?.couple?.bride?.fatherName} & Ibu {data?.couple?.bride?.motherName}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EventPage = ({ data }: { data: WeddingData }) => {
    return (
        <div className="h-full overflow-y-auto hide-scrollbar p-6 pt-10 text-center flex flex-col items-center pb-24">
            <h2 className="font-luxury text-4xl text-[#333] mb-8">Order of Events</h2>

            <div className="w-full max-w-2xl bg-white border border-[#D4AF37]/20 p-8 shadow-sm relative">
                {/* Ticket/Invitation Style */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f0f0f0] rounded-full -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f0f0f0] rounded-full translate-y-1/2"></div>

                <div className="space-y-8">
                    {data?.events?.akad?.enabled !== false && (
                        <div>
                            <div className="flex items-center justify-center gap-2 text-[#8B6508] mb-2">
                                <Crown size={16} /> <span className="font-grand text-xs tracking-widest">CEREMONY</span>
                            </div>
                            <h3 className="font-luxury text-2xl mb-1">{data?.events?.akad?.name || 'Akad Nikah'}</h3>
                            <p className="font-body text-gray-500">{formatDate(data?.events?.akad?.date || '')} | {data?.events?.akad?.timeStart}</p>
                            <p className="font-body text-sm text-[#1a1a1a] mt-2 font-bold">{data?.events?.akad?.venueName}</p>
                            <p className="font-body text-xs text-gray-500 mt-1">{data?.events?.akad?.address}</p>
                        </div>
                    )}

                    {data?.events?.akad?.enabled !== false && data?.events?.resepsi?.enabled !== false && <div className="w-full h-[1px] bg-gray-200"></div>}

                    {data?.events?.resepsi?.enabled !== false && (
                        <div>
                            <div className="flex items-center justify-center gap-2 text-[#8B6508] mb-2">
                                <Gem size={16} /> <span className="font-grand text-xs tracking-widest">RECEPTION</span>
                            </div>
                            <h3 className="font-luxury text-2xl mb-1">{data?.events?.resepsi?.name || 'Resepsi'}</h3>
                            <p className="font-body text-gray-500">{formatDate(data?.events?.resepsi?.date || '')} | {data?.events?.resepsi?.timeStart}</p>
                            <p className="font-body text-sm text-[#1a1a1a] mt-2 font-bold">{data?.events?.resepsi?.venueName}</p>
                            <p className="font-body text-xs text-gray-500 mt-1">{data?.events?.resepsi?.address}</p>
                        </div>
                    )}
                </div>
            </div>

            {(data?.events?.resepsi?.googleMapsUrl || data?.events?.akad?.googleMapsUrl) && (
                <a href={(data?.events?.resepsi?.googleMapsUrl || data?.events?.akad?.googleMapsUrl) as string} target="_blank" rel="noopener noreferrer" className="mt-8 flex items-center gap-2 text-[#8B6508] font-grand text-xs tracking-widest hover:text-black transition-colors">
                    <MapPin size={14} /> GET DIRECTIONS
                </a>
            )}
        </div>
    );
};

const GalleryPage = ({ data }: { data: WeddingData }) => (
    <div className="h-full overflow-y-auto hide-scrollbar p-6 pt-10 pb-24">
        <h2 className="font-luxury text-4xl text-[#333] mb-8 text-center">Moments</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-white shadow-inner">
            {data?.gallery && data.gallery.length > 0 ? (
                data.gallery.map((img, i) => (
                    <div key={i} className="aspect-[4/5] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 cursor-pointer">
                        <img src={getImageUrl(img) || `https://source.unsplash.com/random/600x800?wedding,luxury&sig=${i}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" />
                    </div>
                ))
            ) : (
                <p className="text-gray-500 text-sm col-span-3 text-center py-8">No photos in gallery yet.</p>
            )}
        </div>
    </div>
);

const GiftPage = ({ data }: { data: WeddingData }) => {
    const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null);
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center pb-24">
            <div className="w-full max-w-sm bg-[#1a1a1a] text-[#D4AF37] p-8 rounded-lg shadow-2xl border border-[#D4AF37] relative">
                <div className='absolute inset-0 opacity-10 bg-[url("https://www.transparenttextures.com/patterns/black-scales.png")]'></div>
                <div className="w-16 h-16 bg-[#D4AF37] text-black rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                    <Gift size={24} />
                </div>
                <h2 className="font-grand text-2xl mb-8 relative z-10">Wedding Gift</h2>
                <div className="max-h-[50vh] overflow-y-auto hide-scrollbar space-y-4 relative z-10 pb-4">
                    {data?.gifts?.map((gift, i) => (
                        <div key={i} className="bg-black/30 p-4 rounded border border-[#D4AF37]/30">
                            <p className="font-grand text-xs tracking-widest mb-2 uppercase">{gift.name}</p>
                            <p className="font-mono text-xl md:text-2xl tracking-wider text-white">{gift.accountNumber}</p>
                            <p className="font-body text-xs text-gray-400 mt-1 uppercase">{gift.accountHolder}</p>
                            {gift.type !== 'address' && (
                                <button
                                    onClick={() => { navigator.clipboard.writeText(gift.accountNumber); setCopiedIdx(i); setTimeout(() => setCopiedIdx(null), 2000); }}
                                    className={`mt-3 px-4 py-1 border text-[10px] uppercase tracking-widest transition-colors rounded ${copiedIdx === i ? 'border-emerald-500 text-emerald-400 bg-emerald-900/30' : 'border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black'}`}>
                                    {copiedIdx === i ? '\u2713 Tersalin' : 'Copy'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {(!data?.gifts || data.gifts.length === 0) && (
                    <p className="text-gray-500 text-sm relative z-10 italic">No payment details provided.</p>
                )}
            </div>
        </div>
    );
};

interface RSVPPageProps {
    data: WeddingData;
    guest?: Guest | null;
    onAddRSVP: (rsvp: RSVP) => void;
    rsvps: RSVP[];
    embedded?: boolean;
}

const RSVPPage = ({ data, guest, onAddRSVP, rsvps }: RSVPPageProps) => {
    const [rsvpStatus, setRsvpStatus] = useState<'Hadir' | 'Tidak Hadir' | 'Ragu-ragu'>('Hadir');
    const [rsvpPaxCount, setRsvpPaxCount] = useState(1);
    const [rsvpWishes, setRsvpWishes] = useState('');
    const [rsvpGuestName, setRsvpGuestName] = useState(guest ? guest.name : '');
    const [rsvpSuccess, setRsvpSuccess] = useState(false);

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
        if (!guest) setRsvpGuestName('');
        setRsvpWishes('');
        setTimeout(() => setRsvpSuccess(false), 5000);
    };

    return (
        <div className="h-full flex flex-col items-center justify-start p-6 pt-10 text-center overflow-y-auto hide-scrollbar pb-24">
            <h2 className="font-luxury text-4xl text-[#333] mb-8">R.S.V.P</h2>
            <div className="w-full max-w-sm bg-white p-8 shadow-lg border-t-4 border-[#D4AF37]">
                <p className="text-gray-600 mb-6 text-sm font-body">Mohon konfirmasi kehadiran Anda.</p>
                
                {rsvpSuccess ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-[#FFF9E6] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]">
                            <Heart className="w-8 h-8 text-[#D4AF37]" />
                        </div>
                        <p className="font-luxury text-xl text-[#333]">Terima kasih atas konfirmasi Anda.</p>
                    </div>
                ) : (
                    <form onSubmit={handleRSVPSubmit} className="space-y-4 text-left">
                        <div>
                            <label className="block text-xs font-grand text-[#8B6508] uppercase tracking-wider mb-1">Nama Anda</label>
                            <input type="text" required value={rsvpGuestName} onChange={(e) => setRsvpGuestName(e.target.value)} disabled={!!guest} className="w-full border-b border-gray-300 px-2 py-2 focus:outline-none focus:border-[#D4AF37] text-sm font-body bg-transparent" placeholder="Masukkan nama" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-grand text-[#8B6508] uppercase tracking-wider mb-1">Kehadiran</label>
                                <select value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value as any)} className="w-full border-b border-gray-300 px-2 py-2 focus:outline-none focus:border-[#D4AF37] text-sm font-body bg-transparent appearance-none">
                                    <option value="Hadir">Hadir</option>
                                    <option value="Tidak Hadir">Tidak Hadir</option>
                                    <option value="Ragu-ragu">Ragu-ragu</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-grand text-[#8B6508] uppercase tracking-wider mb-1">Jumlah</label>
                                <input type="number" min="1" max={guest ? guest.paxLimit : 10} value={rsvpPaxCount} onChange={(e) => setRsvpPaxCount(Number(e.target.value))} className="w-full border-b border-gray-300 px-2 py-2 focus:outline-none focus:border-[#D4AF37] text-sm font-body bg-transparent" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-grand text-[#8B6508] uppercase tracking-wider mb-1">Ucapan & Doa</label>
                            <textarea required value={rsvpWishes} onChange={(e) => setRsvpWishes(e.target.value)} rows={3} className="w-full border-b border-gray-300 px-2 py-2 focus:outline-none focus:border-[#D4AF37] text-sm font-body bg-transparent resize-none" placeholder="Tuliskan pesan Anda..." />
                        </div>
                        <button type="submit" className="w-full mt-4 py-3 bg-[#1a1a1a] text-[#D4AF37] font-grand text-xs tracking-widest uppercase hover:bg-[#D4AF37] hover:text-black transition-colors shadow-lg border border-[#D4AF37]">
                            Kirim RSVP
                        </button>
                    </form>
                )}

                {/* List of RSVPs */}
                {rsvps && rsvps.length > 0 && (
                    <div className="mt-8 text-left space-y-3 max-h-48 overflow-y-auto pr-2 hide-scrollbar">
                        {rsvps.map((rsvp, idx) => (
                            <div key={idx} className="bg-gray-50 p-4 shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-[#1a1a1a] font-luxury">{rsvp.guestName}</span>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold ${rsvp.status === 'Hadir' ? 'border-green-200 text-green-700 bg-green-50' : rsvp.status === 'Tidak Hadir' ? 'border-red-200 text-red-700 bg-red-50' : 'border-yellow-200 text-yellow-700 bg-yellow-50'}`}>
                                        {rsvp.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 font-body italic">"{rsvp.wishes}"</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const QuotePage = ({ data }: { data: WeddingData }) => (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#fdfdfd]">
        <div className="border border-[#D4AF37] p-8 md:p-12 relative max-w-lg shadow-sm">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#D4AF37]"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#D4AF37]"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#D4AF37]"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#D4AF37]"></div>

            <Crown size={32} className="mx-auto mb-6 text-[#D4AF37]" />
            <p className="font-luxury text-2xl leading-relaxed text-gray-800 italic mb-6">
                "{data?.quoteText}"
            </p>
            <p className="font-grand text-xs tracking-widest text-[#8B6508] uppercase">{data?.quoteSource}</p>
        </div>
    </div>
);

/**
 * --- MAIN APP ---
 */
interface GrandBallroomProps {
    data: WeddingData;
    theme: ThemeConfig;
    guest?: Guest | null;
    onAddRSVP: (rsvp: RSVP) => void;
    rsvps: RSVP[];
    embedded?: boolean;
}

const GrandBallroomLayout: React.FC<GrandBallroomProps> = ({ data, guest, onAddRSVP, rsvps, embedded = false }) => {
    const [stage, setStage] = useState<'curtain' | 'content'>(embedded ? 'content' : 'curtain'); // curtain -> content
    const [activeTab, setActiveTab] = useState('home');
    const [music, setMusic] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const guestName = guest ? guest.name : "Tamu Undangan";

    const toggleMusic = () => {
        if (!audioRef.current) return;
        if (music) audioRef.current.pause();
        else audioRef.current.play();
        setMusic(!music);
    };

    const startShow = () => {
        setStage('content');
        setMusic(true);
        if (audioRef.current) audioRef.current.play().catch(() => { });
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#0f0505] text-[#333]">
            <GlobalStyles />
            <audio ref={audioRef} loop src={data?.musicUrl || ASSETS.bgm} />

            {/* LAYER 0: BALLROOM BACKGROUND (SILHOUETTES) */}
            <BallroomBackground customBg={getImageUrl(data?.bgImageUrl || '')} />

            {/* LAYER 1: CURTAIN STAGE */}
            {stage === 'curtain' && (
                <CurtainStage onOpen={startShow} />
            )}

            {/* LAYER 2: 3D MAIN STAGE (THE CARD) */}
            <div className={`fixed inset-0 z-40 flex items-center justify-center perspective-[2000px] transition-all duration-1000 ${stage === 'content' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

                {/* The Card Structure (3D Tilted) */}
                <div className={`glass-ballroom w-[90vw] max-w-4xl h-[80vh] rounded-[4px] shadow-2xl relative flex flex-col overflow-hidden transform-style-3d ${stage === 'content' ? 'animate-stage-up' : ''}`}>

                    {/* Chandelier Hanging Top */}
                    <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-48 h-32 z-50 pointer-events-none origin-top animate-[chandelier-sway_4s_ease-in-out_infinite]">
                        <ChandelierSVG className="w-full h-full drop-shadow-xl" />
                    </div>

                    {/* Content Viewport */}
                    <div className="flex-1 overflow-hidden relative bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')]">
                        {activeTab === 'home' && <HomePage onEnter={() => setActiveTab('event')} data={data} guestName={guestName} />}
                        {activeTab === 'quote' && <QuotePage data={data} />}
                        {activeTab === 'couple' && <CouplePage data={data} />}
                        {activeTab === 'event' && <EventPage data={data} />}
                        {activeTab === 'gallery' && <GalleryPage data={data} />}
                        {activeTab === 'gift' && <GiftPage data={data} />}
                        {activeTab === 'rsvp' && <RSVPPage data={data} guest={guest} onAddRSVP={onAddRSVP} rsvps={rsvps} />}
                    </div>

                    {/* Gold Footer Trim */}
                    <div className="h-2 w-full bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728]"></div>
                </div>

                {/* Floating Controls */}
                <NavBar activeTab={activeTab} setTab={setActiveTab} data={data} />

                <button
                    onClick={toggleMusic}
                    className="fixed top-24 right-4 md:top-24 md:right-8 z-50 w-10 h-10 bg-white/10 backdrop-blur border border-[#D4AF37] rounded-full flex items-center justify-center text-[#FFD700] hover:bg-[#D4AF37] hover:text-black transition-all"
                >
                    {music ? <Music className="animate-spin-slow" size={16} /> : <Play size={16} />}
                </button>

            </div>
        </div>
    );
}

export default GrandBallroomLayout;

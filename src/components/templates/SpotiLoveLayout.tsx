import React, { useState, useEffect, useRef } from 'react';
import {
    PiPlayFill as Play,
    PiPauseFill as Pause,
    PiSkipBackFill as SkipBack,
    PiSkipForwardFill as SkipForward,
    PiHeartFill as Heart,
    PiShuffleDuotone as Shuffle,
    PiRepeatDuotone as Repeat,
    PiCalendarDuotone as Calendar,
    PiMapPinDuotone as MapPin,
    PiClockDuotone as Clock,
    PiRecordDuotone as Disc,
    PiMicrophoneStageDuotone as Mic2,
    PiPlaylistDuotone as LayoutList,
    PiGiftDuotone as Gift,
    PiCheckCircleDuotone as CheckCircle,
    PiDotsThreeDuotone as MoreHorizontal,
    PiHouseDuotone as HomeIcon
} from 'react-icons/pi';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeddingData, ThemeConfig, RSVP, Guest } from '../../types';

/**
 * --- GLOBAL STYLES & ANIMATIONS ---
 */
const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');

    :root {
      --spoti-green: #1DB954;
      --spoti-black: #121212;
      --spoti-dark: #181818;
      --spoti-light: #282828;
      --text-main: #FFFFFF;
      --text-sub: #B3B3B3;
    }

    body {
      font-family: 'Montserrat', sans-serif;
      background-color: var(--spoti-black);
      color: var(--text-main);
      overflow-x: hidden;
    }

    .animate-spin-slow { animation: spin 8s linear infinite; }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes equalizer {
      0% { height: 3px; }
      50% { height: 15px; }
      100% { height: 3px; }
    }
    .animate-eq { animation: equalizer 1s infinite ease-in-out; }

    /* Page Transition */
    .page-enter {
      animation: fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
      opacity: 0;
      transform: translateY(20px);
    }
    @keyframes fadeUp {
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* SCROLLBAR */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: var(--spoti-black); }
    ::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #888; }
  `}</style>
);

// --- ORNAMENTS & ANIMATIONS ---
const SpotiFlower = ({ className, delay = 0 }: { className?: string, delay?: number }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0, rotate: -90 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay, type: 'spring', stiffness: 40, damping: 15, duration: 2.5 }}
        className={`absolute pointer-events-none z-[1] ${className}`}
    >
        <motion.img 
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            src="/assets/spoti-flower.webp" 
            className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] opacity-40"
            alt="Flower Ornament"
        />
    </motion.div>
);

const SpotiLeaves = ({ className, delay = 0 }: { className?: string, delay?: number }) => (
    <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: 'spring', stiffness: 50, damping: 15, duration: 2 }}
        className={`absolute top-0 pointer-events-none z-0 ${className}`}
        style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}
    >
        <img 
            src="/assets/spoti-leaves.webp" 
            className="w-full h-full object-cover object-top opacity-30 filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]"
            alt="Leaves Ornament"
        />
    </motion.div>
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
    return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }); // Jan 2023 format
};

/**
 * --- BACKGROUND SYSTEM (CANVAS) ---
 */
const CanvasBackground = ({ customBg }: { customBg?: string }) => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {customBg ? (
            <>
                {/* Custom Background Image */}
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url("${customBg}")` }}></div>
                {/* Dark Overlay for Text Readability */}
                <div className="absolute inset-0 bg-black/60"></div>
            </>
        ) : (
            <>
                {/* Animated Gradients (Default) */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-30 animate-[spin_20s_linear_infinite]"
                    style={{
                        background: 'conic-gradient(from 0deg, #1DB954, transparent, #121212, transparent, #1DB954)',
                        filter: 'blur(100px)'
                    }}
                ></div>
                <div className="absolute inset-0 bg-[#121212]/80"></div>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")` }}></div>
            </>
        )}
    </div>
);

/**
 * --- COMPONENTS ---
 */

// 1. OPENING SEQUENCE
interface OpeningSequenceProps {
    onOpen: () => void;
    onComplete: () => void;
    cover: string;
    coupleName: string;
}

const OpeningSequence: React.FC<OpeningSequenceProps> = ({ onOpen, onComplete, cover, coupleName }) => {
    const [step, setStep] = useState<'idle' | 'playing' | 'sliding'>('idle');

    const handleStart = () => {
        onOpen(); // Start Music
        setStep('playing');

        // Play GIF for 3 seconds then slide up
        setTimeout(() => {
            setStep('sliding');
            // Wait for slide animation to finish (1s)
            setTimeout(onComplete, 1000);
        }, 3000);
    };

    return (
        <div
            className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-transform duration-1000 ease-in-out ${step === 'sliding' ? '-translate-y-full' : 'translate-y-0'}`}
        >
            {step === 'idle' ? (
                <div className="relative z-10 p-8 flex flex-col items-center animate-fade-in-up w-full h-full justify-center">
                    <div className="w-64 h-64 md:w-80 md:h-80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8 relative group">
                        <img src={cover} className="w-full h-full object-cover rounded shadow-2xl" alt="Cover" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-center mb-2 tracking-tighter text-white">{coupleName}</h1>
                    <p className="text-[#1DB954] font-bold text-sm tracking-widest uppercase mb-10">Exclusive Release</p>

                    <button
                        onClick={handleStart}
                        className="bg-[#1DB954] text-black font-bold rounded-full px-10 py-4 hover:scale-105 transition-transform flex items-center gap-3 shadow-[0_0_30px_rgba(29,185,84,0.5)]"
                    >
                        <Play size={20} fill="black" /> LISTEN NOW
                    </button>

                    <p className="absolute bottom-10 text-[10px] text-[#555] font-mono">POWERED BY SPOTILOVE</p>
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-black">
                    {/* Fake GIF simulation */}
                    <div className="flex gap-2">
                         <div className="w-2 h-10 bg-[#1DB954] animate-eq"></div>
                         <div className="w-2 h-10 bg-[#1DB954] animate-eq" style={{ animationDelay: '0.1s' }}></div>
                         <div className="w-2 h-10 bg-[#1DB954] animate-eq" style={{ animationDelay: '0.2s' }}></div>
                         <div className="w-2 h-10 bg-[#1DB954] animate-eq" style={{ animationDelay: '0.3s' }}></div>
                         <div className="w-2 h-10 bg-[#1DB954] animate-eq" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 2. SIDEBAR (DESKTOP)
const Sidebar = ({ activeTab, setTab, data }: { activeTab: string, setTab: (t: string) => void, data: WeddingData }) => {
    const items = [
        { id: 'home', icon: HomeIcon, label: 'Home', visible: true },
        { id: 'event', icon: Calendar, label: 'Tour Dates', visible: (data?.events?.akad?.enabled !== false || data?.events?.resepsi?.enabled !== false) },
        { id: 'couple', icon: Mic2, label: 'Artist', visible: true },
        { id: 'gallery', icon: LayoutList, label: 'Discography', visible: !!(data?.gallery && data.gallery.length > 0) },
        { id: 'gift', icon: Gift, label: 'Merch', visible: !!(data?.gifts && data.gifts.length > 0) },
        { id: 'rsvp', icon: CheckCircle, label: 'Fan Club', visible: true },
    ].filter(item => item.visible);

    return (
        <div className="hidden md:flex w-64 bg-black flex-col h-full fixed left-0 top-0 z-40 p-6">
            <div className="flex items-center gap-2 mb-8 text-white">
                <Disc size={32} className="text-[#1DB954] animate-spin-slow" />
                <span className="font-bold text-xl">SpotiLove</span>
            </div>

            <div className="space-y-4">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setTab(item.id)}
                        className={`flex items-center gap-4 w-full text-sm font-bold transition-colors ${activeTab === item.id ? 'text-white' : 'text-[#B3B3B3] hover:text-white'}`}
                    >
                        <item.icon size={24} fill={activeTab === item.id ? "currentColor" : "none"} />
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="mt-auto pt-6 border-t border-[#282828] pb-[90px]">
                <div className="flex items-center gap-3 bg-[#282828] p-3 rounded-lg cursor-pointer hover:bg-[#3E3E3E] transition">
                    <div className="w-10 h-10 rounded bg-[#1DB954] flex items-center justify-center">
                        <Heart fill="white" size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Liked Songs</p>
                        <p className="text-xs text-[#B3B3B3]">{data?.gallery?.length || 0} photos</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 3. PLAYER BAR (BOTTOM NAV & CONTROLS)
interface PlayerBarProps {
    activeTab: string;
    setTab: (t: string) => void;
    isPlaying: boolean;
    togglePlay: () => void;
    cover: string;
    title: string;
    artist: string;
    data: WeddingData;
}

const PlayerBar: React.FC<PlayerBarProps> = ({ activeTab, setTab, isPlaying, togglePlay, cover, title, artist, data }) => {
    const [progress, setProgress] = useState(0);
    const [showMenu, setShowMenu] = useState(false); // Mobile Menu State

    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => setProgress(p => (p >= 100 ? 0 : p + 0.5)), 500);
            return () => clearInterval(interval);
        }
    }, [isPlaying]);

    const menuItems = [
        { id: 'home', label: 'Home', visible: true },
        { id: 'couple', label: 'Artist', visible: true },
        { id: 'event', label: 'Tour Dates', visible: (data?.events?.akad?.enabled !== false || data?.events?.resepsi?.enabled !== false) },
        { id: 'gallery', label: 'Discography', visible: !!(data?.gallery && data.gallery.length > 0) },
        { id: 'gift', label: 'Merch', visible: !!(data?.gifts && data.gifts.length > 0) },
        { id: 'rsvp', label: 'Fan Club', visible: true }
    ].filter(i => i.visible);

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[90px] bg-[#181818] border-t border-[#282828] z-50 flex items-center justify-between px-4">
            <div className="flex items-center gap-3 w-[35%] min-w-[120px]">
                <div className="relative h-14 w-14 hidden sm:block animate-spin-slow shrink-0" style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}>
                    <img src={cover} className="w-full h-full rounded-full object-cover shadow-lg border-2 border-[#282828]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#181818] rounded-full border border-[#333] shadow-inner"></div>
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate hover:underline cursor-pointer">{title}</p>
                    <p className="text-xs text-[#B3B3B3] truncate hover:underline cursor-pointer hover:text-white">{artist}</p>
                </div>
                <Heart size={16} className="text-[#1DB954] ml-2 hidden sm:block" fill="#1DB954" />
            </div>

            <div className="flex flex-col items-center max-w-[40%] w-full">
                <div className="flex items-center gap-4 mb-1">
                    <Shuffle size={16} className="text-[#B3B3B3] hover:text-white hidden sm:block cursor-pointer" />
                    <SkipBack size={20} className="text-[#B3B3B3] hover:text-white cursor-pointer" fill="currentColor" />
                    <button
                        onClick={togglePlay}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition"
                    >
                        {isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="ml-0.5" />}
                    </button>
                    <SkipForward size={20} className="text-[#B3B3B3] hover:text-white cursor-pointer" fill="currentColor" />
                    <Repeat size={16} className="text-[#B3B3B3] hover:text-white hidden sm:block cursor-pointer" />
                </div>
                <div className="w-full flex items-center gap-2 text-[10px] text-[#B3B3B3] font-mono">
                    <span>1:24</span>
                    <div className="h-1 bg-[#4D4D4D] rounded-full flex-1 relative group cursor-pointer">
                        <div className="absolute h-full bg-white rounded-full group-hover:bg-[#1DB954]" style={{ width: `${progress}%` }}></div>
                        <div className="w-3 h-3 bg-white rounded-full absolute top-1/2 -translate-y-1/2 shadow opacity-0 group-hover:opacity-100" style={{ left: `${progress}%` }}></div>
                    </div>
                    <span>3:45</span>
                </div>
            </div>

            <div className="w-[25%] flex justify-end items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                    <Mic2 size={16} className="text-[#B3B3B3] hover:text-white" />
                    <div className="w-20 h-1 bg-[#4D4D4D] rounded-full">
                        <div className="w-3/4 h-full bg-white group-hover:bg-[#1DB954] rounded-full"></div>
                    </div>
                </div>

                {/* MOBILE MENU TOGGLE */}
                <div className="sm:hidden relative z-[60]">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className={`p-2 rounded-full transition cursor-pointer relative z-[70] ${showMenu ? 'text-white bg-white/10' : 'text-[#B3B3B3]'}`}
                    >
                        <LayoutList size={24} />
                    </button>

                    {showMenu && (
                        <>
                            {/* Backdrop to close menu */}
                            <div className="fixed inset-0 z-[65] bg-black/50" onClick={() => setShowMenu(false)}></div>

                            {/* Menu Items */}
                            <div className="absolute bottom-12 right-0 bg-[#282828] rounded-xl p-2 shadow-2xl w-48 border border-white/10 z-[75] animate-fade-in-up">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setTab(item.id);
                                            setShowMenu(false);
                                        }}
                                        className={`block w-full text-left p-3 text-sm font-bold rounded-lg mb-1 capitalize transition flex items-center justify-between
                                            ${activeTab === item.id ? 'bg-[#1DB954] text-black' : 'text-white hover:bg-[#3E3E3E]'}
                                        `}
                                    >
                                        {item.label}
                                        {activeTab === item.id && <span className="w-2 h-2 bg-black rounded-full"></span>}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * --- PAGES ---
 */
const HomePage = ({ DATA }: { DATA: any }) => {
    const dtObj = new Date(DATA.dateFull);
    const dateDisplay = !isNaN(dtObj.getTime()) ? dtObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : DATA.date;

    return (
        <div className="page-enter pb-[120px] relative overflow-hidden">
            <SpotiLeaves className="left-0 right-0 h-32 md:h-48 w-full" delay={0.1} />
            <SpotiFlower className="-top-20 -left-20 w-64 h-64" delay={0.3} />
            <SpotiFlower className="top-80 -right-20 w-64 h-64" delay={0.5} />

            <div className="relative h-[400px] flex items-end p-6 md:p-8 bg-gradient-to-b from-[#535353]/80 to-[#121212] z-10">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-end gap-6 w-full">
                    <div className="w-40 h-40 md:w-52 md:h-52 shadow-[0_4px_60px_rgba(0,0,0,0.5)] bg-gray-800">
                        <img src={DATA.cover} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                            <span className="w-4 h-4 bg-[#1DB954] rounded-full flex items-center justify-center text-black pb-0.5"><Check className="w-3 h-3" /></span> Verified Couple
                        </p>
                        <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter">{DATA.couple.groom} & {DATA.couple.bride}</h1>
                        <p className="text-[#FFFFFF]/70 text-sm md:text-base font-medium max-w-xl">
                            The Wedding Celebration â€¢ {dateDisplay} â€¢ 2,492,103 Monthly Wishes
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-6 md:px-8 py-6 flex items-center gap-6">
                <button className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg text-black">
                    <Play size={28} fill="black" className="ml-1" />
                </button>
                <button className="text-[#1DB954]"><Heart size={32} fill="#1DB954" /></button>
                <button className="text-[#B3B3B3] hover:text-white"><MoreHorizontal size={32} /></button>
            </div>

            <div className="px-6 md:px-8">
                <h2 className="text-2xl font-bold mb-4">Popular Tracks</h2>
                <div className="flex flex-col gap-2">
                    <div className="group flex items-center p-2 rounded hover:bg-[#ffffff]/10 transition cursor-pointer">
                        <span className="w-8 text-center text-[#B3B3B3] group-hover:hidden">1</span>
                        <span className="w-8 text-center hidden group-hover:flex justify-center"><Play size={14} fill="white" /></span>
                        <img src={DATA.cover} className="w-10 h-10 mr-4 rounded object-cover" />
                        <div className="flex-1">
                            <p className="text-white font-medium">The Proposal</p>
                            <p className="text-xs text-[#B3B3B3]">{DATA.couple.groom} â€¢ {DATA.couple.bride}</p>
                        </div>
                        <p className="text-sm text-[#B3B3B3] hidden md:block">Jan 2023</p>
                        <span className="ml-4 md:ml-8 text-sm text-[#B3B3B3]">3:45</span>
                    </div>
                    <div className="group flex items-center p-2 rounded hover:bg-[#ffffff]/10 transition cursor-pointer">
                        <span className="w-8 text-center text-[#B3B3B3] group-hover:hidden">2</span>
                        <span className="w-8 text-center hidden group-hover:flex justify-center"><Play size={14} fill="white" /></span>
                        <img src={DATA.cover} className="w-10 h-10 mr-4 rounded object-cover" />
                        <div className="flex-1">
                            <p className="text-[#1DB954] font-medium">The Wedding Day</p>
                            <p className="text-xs text-[#B3B3B3]">{DATA.couple.groom} â€¢ {DATA.couple.bride}</p>
                        </div>
                        <p className="text-sm text-[#B3B3B3] hidden md:block">{formatDate(DATA.dateFull)}</p>
                        <div className="ml-4 md:ml-8 flex gap-1 h-3 items-end">
                            <div className="w-1 bg-[#1DB954] animate-eq"></div>
                            <div className="w-1 bg-[#1DB954] animate-eq" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 bg-[#1DB954] animate-eq" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                    {DATA.quoteText && (
                        <div className="group flex items-center p-2 rounded hover:bg-[#ffffff]/10 transition cursor-pointer mt-4 border border-[#282828] bg-[#181818]">
                            <div className="flex-1 p-2">
                                <p className="text-white font-medium italic">"{DATA.quoteText}"</p>
                                <p className="text-xs text-[#B3B3B3] mt-2">â€” {DATA.quoteSource}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const EventPage = ({ data }: { data: WeddingData }) => (
    <div className="page-enter p-6 md:p-8 pb-[120px] pt-20 md:pt-8 relative overflow-hidden">
        <SpotiLeaves className="left-0 right-0 h-32 md:h-48 w-full" delay={0.1} />
        <SpotiFlower className="bottom-0 -left-16 w-56 h-56 z-0" delay={0.3} />

        <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-2xl font-bold">On Tour (Events)</h2>
            <span className="text-xs font-bold text-[#B3B3B3] uppercase tracking-widest border border-[#B3B3B3] px-3 py-1 rounded-full">Live Dates</span>
        </div>

        <div className="space-y-4">
            {data?.events?.akad?.enabled !== false && (
                <div className="flex flex-col md:flex-row gap-4 bg-[#181818] p-6 rounded-lg hover:bg-[#282828] transition group">
                    <div className="flex flex-col items-center justify-center bg-[#121212] w-20 h-20 rounded border border-[#333] text-center shrink-0">
                        <span className="text-xs text-[#1DB954] font-bold uppercase">AKAD</span>
                        <span className="text-lg font-bold">NIKAH</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-xl font-bold mb-1 group-hover:text-[#1DB954] transition">{data?.events?.akad?.name || 'Akad Nikah'}</h3>
                        <div className="flex items-center gap-4 text-sm text-[#B3B3B3]">
                            <span className="flex items-center gap-1"><Clock size={14} /> {data?.events?.akad?.timeStart}</span>
                            <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(data?.events?.akad?.date || '')}</span>
                        </div>
                        <p className="text-xs font-bold text-white mt-2">{data?.events?.akad?.venueName}</p>
                        <p className="text-xs text-[#B3B3B3] mt-1">{data?.events?.akad?.address}</p>
                    </div>
                    {data?.events?.akad?.googleMapsUrl && (
                        <a href={data.events.akad.googleMapsUrl as string} target="_blank" rel="noopener noreferrer" className="h-10 px-6 rounded-full border border-[#B3B3B3] text-white font-bold text-sm hover:border-white hover:scale-105 transition self-center flex items-center justify-center mt-2 md:mt-0">
                            MAPS
                        </a>
                    )}
                </div>
            )}

            {data?.events?.resepsi?.enabled !== false && (
                <div className="flex flex-col md:flex-row gap-4 bg-[#181818] p-6 rounded-lg hover:bg-[#282828] transition group">
                    <div className="flex flex-col items-center justify-center bg-[#121212] w-20 h-20 rounded border border-[#333] text-center shrink-0">
                        <span className="text-xs text-[#1DB954] font-bold uppercase">RESEPSI</span>
                        <span className="text-lg font-bold">PARTY</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-xl font-bold mb-1 group-hover:text-[#1DB954] transition">{data?.events?.resepsi?.name || 'Resepsi'}</h3>
                        <div className="flex items-center gap-4 text-sm text-[#B3B3B3]">
                            <span className="flex items-center gap-1"><Clock size={14} /> {data?.events?.resepsi?.timeStart}</span>
                            <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(data?.events?.resepsi?.date || '')}</span>
                        </div>
                        <p className="text-xs font-bold text-white mt-2">{data?.events?.resepsi?.venueName}</p>
                        <p className="text-xs text-[#B3B3B3] mt-1">{data?.events?.resepsi?.address}</p>
                    </div>
                    {data?.events?.resepsi?.googleMapsUrl && (
                        <a href={data.events.resepsi.googleMapsUrl as string} target="_blank" rel="noopener noreferrer" className="h-10 px-6 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition self-center flex items-center justify-center mt-2 md:mt-0">
                            MAPS
                        </a>
                    )}
                </div>
            )}
        </div>
    </div>
);

const CouplePage = ({ couple, cover }: { couple: WeddingData['couple'], cover: string }) => (
    <div className="page-enter pb-[120px] relative overflow-hidden">
        <SpotiLeaves className="left-0 right-0 h-32 md:h-48 w-full z-0" delay={0.1} />
        
        <div className="h-[300px] bg-cover bg-center relative z-10" style={{ backgroundImage: `url(${cover})` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent"></div>
            <div className="absolute bottom-6 left-6 md:left-8">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#0D72EA] text-white p-1 rounded-full"><CheckCircle size={12} fill="white" className="text-[#0D72EA]" /></span>
                    <span className="text-sm font-bold text-white">Verified Artist</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black mb-4">The Couple</h1>
                <p className="text-[#B3B3B3] text-sm">2,492,103 monthly listeners</p>
            </div>
        </div>

        <div className="p-6 md:p-8 relative z-10">
            <SpotiFlower className="top-0 -right-16 w-48 h-48" delay={0.3} />
            <SpotiFlower className="bottom-0 -left-16 w-48 h-48" delay={0.5} />

            <h2 className="text-xl font-bold mb-4 relative z-10">About</h2>
            <div className="bg-[#181818] rounded-lg p-6 relative overflow-hidden group cursor-pointer hover:bg-[#282828] transition">
                <p className="text-white relative z-10 max-w-2xl leading-relaxed">
                    We met and it started with a shared playlist, and now we are sharing our lives together. Join us as we embark on our greatest tour yet: Marriage.
                </p>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#1DB954] rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="flex items-center gap-4 bg-[#181818] p-4 rounded-lg">
                    <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden">
                        <img src={getImageUrl(couple?.groom?.photoUrl || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80")} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{couple?.groom?.fullName}</h3>
                        <p className="text-xs text-[#1DB954] font-bold uppercase mb-1">Groom</p>
                        <p className="text-xs text-[#B3B3B3]">Bpk. {couple?.groom?.fatherName} & Ibu {couple?.groom?.motherName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-[#181818] p-4 rounded-lg">
                    <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden">
                        <img src={getImageUrl(couple?.bride?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80")} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{couple?.bride?.fullName}</h3>
                        <p className="text-xs text-[#1DB954] font-bold uppercase mb-1">Bride</p>
                        <p className="text-xs text-[#B3B3B3]">Bpk. {couple?.bride?.fatherName} & Ibu {couple?.bride?.motherName}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const GiftPage = ({ data }: { data: WeddingData }) => (
    <div className="page-enter p-6 md:p-8 pb-[120px] pt-20 md:pt-8 relative overflow-hidden">
        <SpotiLeaves className="left-0 right-0 h-32 md:h-48 w-full z-0" delay={0.1} />
        <SpotiFlower className="top-1/4 -right-20 w-64 h-64 z-0" delay={0.3} />

        <h2 className="text-2xl font-bold mb-6 relative z-10">Merch (Wedding Gift)</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {data?.gifts && data.gifts.length > 0 ? (
                data.gifts.map((gift, idx) => (
                    <div key={idx} className="bg-[#181818] p-4 rounded-lg group hover:bg-[#282828] transition">
                        <div className="aspect-video bg-[#222] rounded mb-4 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/20 to-[#121212] opacity-80"></div>
                            <p className="relative z-10 font-bold text-2xl tracking-widest">{gift.name}</p>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{gift.name} Transfer</h3>
                        <p className="text-[#B3B3B3] text-sm mb-4">Transfer to {gift.accountHolder}</p>
                        {gift.type !== 'address' && (
                            <div className="flex items-center justify-between bg-[#121212] p-3 rounded">
                                <span className="font-mono text-[#1DB954]">{gift.accountNumber}</span>
                                <button className="text-xs font-bold hover:text-white text-[#B3B3B3]" onClick={(e) => {
                                    navigator.clipboard.writeText(gift.accountNumber);
                                    const orig = e.currentTarget.innerHTML;
                                    e.currentTarget.innerHTML = "COPIED!";
                                    setTimeout(() => e.currentTarget.innerHTML = orig, 2000);
                                }}>COPY</button>
                            </div>
                        )}
                    </div>
                ))
            ) : <p className="text-[#B3B3B3]">No merch / gifts available.</p>}
        </div>
    </div>
);

const GalleryPage = ({ images }: { images: string[] }) => (
    <div className="page-enter p-6 md:p-8 pb-[120px] pt-20 md:pt-8 relative overflow-hidden">
        <SpotiLeaves className="left-0 right-0 h-32 md:h-48 w-full z-0" delay={0.1} />
        <SpotiFlower className="-bottom-10 -left-10 w-56 h-56 z-0" delay={0.3} />

        <h2 className="text-2xl font-bold mb-6 relative z-10">Discography</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
            {images && images.length > 0 ? (
                images.map((img, i) => (
                    <div key={i} className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition group cursor-pointer">
                        <div className="aspect-square bg-[#333] mb-4 rounded shadow-lg overflow-hidden relative">
                            <img src={getImageUrl(img) || `https://source.unsplash.com/random/400x400?wedding,love&sig=${i}`} className="w-full h-full object-cover" />
                            <div className="absolute right-2 bottom-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition duration-300">
                                <Play fill="black" className="ml-1 text-black" />
                            </div>
                        </div>
                        <h3 className="font-bold text-sm truncate">Our Moment #{i + 1}</h3>
                        <p className="text-xs text-[#B3B3B3]">Romantic â€¢ Photo</p>
                    </div>
                ))
            ) : (
                <p className="text-[#B3B3B3]">No photos in discography yet.</p>
            )}
        </div>
    </div>
);

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
        <div className="page-enter p-6 md:p-8 pb-[120px] pt-20 flex flex-col items-center relative overflow-hidden">
            <SpotiLeaves className="left-0 right-0 h-32 md:h-48 w-full z-0" delay={0.1} />
            <SpotiFlower className="top-20 -right-16 w-56 h-56 z-0" delay={0.3} />

            <div className="w-full max-w-lg bg-[#181818]/90 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/5 relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black mb-2">Join The Fan Club</h2>
                    <p className="text-[#B3B3B3] text-sm">RSVP to get exclusive access to our wedding event.</p>
                </div>

                {rsvpSuccess ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-[#1DB954]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1DB954]">
                            <Heart className="w-8 h-8 text-[#1DB954]" fill="#1DB954" />
                        </div>
                        <p className="font-bold text-xl text-white">You're on the Guest List!</p>
                    </div>
                ) : (
                    <form className="space-y-4 text-left" onSubmit={handleRSVPSubmit}>
                        <div>
                            <label className="block text-xs font-bold mb-2 text-[#B3B3B3]">FULL NAME</label>
                            <input
                                type="text"
                                required
                                value={rsvpGuestName}
                                onChange={(e) => setRsvpGuestName(e.target.value)}
                                disabled={!!guest}
                                className="w-full bg-[#121212] border border-[#333] rounded p-3 text-white focus:border-[#1DB954] focus:outline-none transition"
                                placeholder="Your Name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold mb-2 text-[#B3B3B3]">ATTENDANCE</label>
                                <select
                                    value={rsvpStatus}
                                    onChange={(e) => setRsvpStatus(e.target.value as any)}
                                    className="w-full bg-[#121212] border border-[#333] rounded p-3 text-white focus:border-[#1DB954] focus:outline-none transition appearance-none"
                                >
                                    <option value="Hadir">Will Attend</option>
                                    <option value="Tidak Hadir">Cannot Attend</option>
                                    <option value="Ragu-ragu">Maybe</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-2 text-[#B3B3B3]">TICKETS</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={guest ? guest.paxLimit : 10}
                                    value={rsvpPaxCount}
                                    onChange={(e) => setRsvpPaxCount(Number(e.target.value))}
                                    className="w-full bg-[#121212] border border-[#333] rounded p-3 text-white focus:border-[#1DB954] focus:outline-none transition"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-2 text-[#B3B3B3]">WISHES</label>
                            <textarea
                                required
                                value={rsvpWishes}
                                onChange={(e) => setRsvpWishes(e.target.value)}
                                className="w-full bg-[#121212] border border-[#333] rounded p-3 text-white focus:border-[#1DB954] focus:outline-none transition h-24 resize-none"
                                placeholder="Write a message..."
                            ></textarea>
                        </div>
                        <button type="submit" className="w-full bg-[#1DB954] text-black font-bold py-3.5 rounded-full hover:scale-105 transition shadow-[0_0_20px_rgba(29,185,84,0.3)] mt-2">
                            CONFIRM ATTENDANCE
                        </button>
                    </form>
                )}
            </div>

            {/* List of RSVPs */}
            {rsvps && rsvps.length > 0 && (
                <div className="w-full max-w-lg mt-8 text-left space-y-3">
                    <h3 className="text-xl font-bold mb-4">Latest Fans</h3>
                    {rsvps.slice(0).reverse().map((rsvp, idx) => (
                        <div key={idx} className="bg-[#181818] p-4 rounded-lg flex items-start gap-4 hover:bg-[#282828] transition">
                            <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center shrink-0">
                                <span className="font-bold text-white text-sm">{rsvp.guestName.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-white">{rsvp.guestName}</span>
                                    <span className="text-[10px] text-[#B3B3B3] uppercase bg-[#121212] px-2 py-0.5 rounded-full">
                                        {rsvp.status}
                                    </span>
                                </div>
                                <p className="text-sm text-[#B3B3B3]">"{rsvp.wishes}"</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * --- MAIN APP ORCHESTRATOR ---
 */
interface SpotiLoveProps {
    data: WeddingData;
    theme: ThemeConfig;
    guest?: Guest | null;
    onAddRSVP: (rsvp: RSVP) => void;
    rsvps: RSVP[];
    embedded?: boolean;
}

const SpotiLoveLayout: React.FC<SpotiLoveProps> = ({ data, theme, guest, onAddRSVP, rsvps, embedded = false }) => {
    const [showOpening, setShowOpening] = useState(embedded ? false : true);
    const [activeTab, setActiveTab] = useState('home');
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Derived Data
    const DATA = {
        couple: {
            groom: data?.couple?.groom?.nickname || "Groom",
            bride: data?.couple?.bride?.nickname || "Bride",
            fullname: `${data?.couple?.groom?.nickname || "Groom"} & ${data?.couple?.bride?.nickname || "Bride"}`,
        },
        date: formatDate(data?.events?.akad?.date || data?.countdownDate || ''),
        dateFull: data?.events?.akad?.date || data?.countdownDate || '',
        cover: getImageUrl(data?.bgImageUrl || data?.couple?.groom?.photoUrl || "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80"),
        musicUrl: data?.musicUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        quoteText: data?.quoteText || "",
        quoteSource: data?.quoteSource || ""
    };

    const toggleMusic = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleStartApp = () => {
        setIsPlaying(true);
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
        }
    };

    // When opening sequence (animations) are completely finished
    const handleOpeningComplete = () => {
        setShowOpening(false);
    };

    return (
        <div className="min-h-screen bg-[#121212] text-white">
            <GlobalStyles />
            <audio ref={audioRef} loop src={DATA.musicUrl} />
            <CanvasBackground customBg={getImageUrl(data?.bgImageUrl || '')} />

            {/* OPENING SEQUENCE (Z-INDEX HIGH) */}
            {showOpening && (
                <OpeningSequence
                    cover={DATA.cover}
                    coupleName={DATA.couple.fullname}
                    onOpen={handleStartApp}
                    onComplete={handleOpeningComplete}
                />
            )}

            {/* MAIN APP (Always Rendered Behind) */}
            <div className="flex h-screen overflow-hidden animate-fade-in-up">
                {/* Sidebar (Desktop) */}
                <Sidebar activeTab={activeTab} setTab={setActiveTab} data={data} />

                {/* Content Area */}
                <div className="flex-1 md:ml-64 relative z-10 h-full overflow-y-auto bg-[#121212]/50">
                    {activeTab === 'home' && <HomePage DATA={DATA} />}
                    {activeTab === 'event' && <EventPage data={data} />}
                    {activeTab === 'couple' && <CouplePage couple={data.couple!} cover={DATA.cover} />}
                    {activeTab === 'gallery' && <GalleryPage images={data.gallery || []} />}
                    {activeTab === 'gift' && <GiftPage data={data} />}
                    {activeTab === 'rsvp' && <RSVPPage data={data} guest={guest} onAddRSVP={onAddRSVP} rsvps={rsvps} />}
                </div>

                {/* Player Bar (Sticky) */}
                <PlayerBar
                    activeTab={activeTab}
                    setTab={setActiveTab}
                    isPlaying={isPlaying}
                    togglePlay={toggleMusic}
                    cover={DATA.cover}
                    title="Perfect Two"
                    artist={`${DATA.couple.groom} & ${DATA.couple.bride}`}
                    data={data}
                />
            </div>
        </div>
    );
};

export default SpotiLoveLayout;

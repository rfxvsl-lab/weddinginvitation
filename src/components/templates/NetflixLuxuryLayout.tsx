import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PiHeartDuotone as Heart,
    PiMapPinDuotone as MapPin,
    PiCalendarDuotone as Calendar,
    PiPlayCircleDuotone as Play,
    PiMusicNotesDuotone as Music,
    PiHouseDuotone as Home,
    PiUserDuotone as User,
    PiImageDuotone as ImageIcon,
    PiCaretDownDuotone as ChevronDown,
    PiInfoDuotone as Info,
    PiGiftDuotone as Gift,
    PiCheckDuotone as Check,
    PiMagnifyingGlassDuotone as Search,
    PiBellDuotone as Bell
} from 'react-icons/pi';
import { WeddingData, ThemeConfig, Guest, RSVP } from '../../types';

// --- ASSETS DEFAULT ---
const DEFAULT_ASSETS = {
    tudumSfx: "https://commondatastorage.googleapis.com/codeskulptor-assets/week7-brrring.m4a",
    noiseTexture: "https://www.transparenttextures.com/patterns/stardust.png",
    defaultCover: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    bgm: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
};

/**
 * --- GLOBAL STYLES ---
 */
const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Martel+Sans:wght@200;300;400;600;700;800&family=Montserrat:wght@400;500;600&display=swap');

    .font-netflix { font-family: 'Bebas Neue', cursive; }
    .font-body { font-family: 'Martel Sans', sans-serif; }
    
    /* ANIMATIONS */
    @keyframes spotlight-move {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
      50% { transform: translate(20px, -20px) scale(1.2); opacity: 0.5; }
    }

    @keyframes openFlap {
      0% { transform: rotateX(0deg); z-index: 50; }
      100% { transform: rotateX(180deg); z-index: 1; }
    }
    
    @keyframes riseUp {
      0% { transform: translateY(0) scale(0.9); opacity: 0; }
      100% { transform: translateY(-150px) scale(1); opacity: 1; }
    }

    @keyframes slideInPage {
      from { transform: translateX(20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .animate-spotlight { animation: spotlight-move 10s ease-in-out infinite alternate; }
    .flap-open { animation: openFlap 1.5s forwards ease-in-out; transform-origin: top; }
    .paper-rise { animation: riseUp 1.2s 0.8s forwards cubic-bezier(0.34, 1.56, 0.64, 1); }
    .page-enter { animation: slideInPage 0.5s ease-out forwards; }
    
    .glass-netflix {
      background: rgba(20, 20, 20, 0.90);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 0 50px rgba(0,0,0,0.8);
    }

    .netflix-btn {
      background: #E50914;
      color: white;
      transition: all 0.3s;
    }
    .netflix-btn:hover { background: #b20710; }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      transition: all 0.3s;
    }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.1); }

    .hide-scrollbar::-webkit-scrollbar { display: none; }
    
    .film-grain {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background-image: url(${DEFAULT_ASSETS.noiseTexture});
      opacity: 0.05;
      pointer-events: none;
      z-index: 5;
    }

    .animate-spin-slow {
        animation: spin 3s linear infinite;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
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
 * --- COMPONENTS ---
 */

const NetflixIntroStart = ({ onOpen }: { onOpen: () => void }) => {
    const onOpenRef = useRef(onOpen);
    useEffect(() => {
        onOpenRef.current = onOpen;
    }, [onOpen]);

    useEffect(() => {
        const audio = new Audio(DEFAULT_ASSETS.tudumSfx);
        audio.volume = 0.5;
        // Browsers might block autoplay, but we'll try our best
        audio.play().catch(() => { });

        const timer = setTimeout(() => {
            if (onOpenRef.current) onOpenRef.current();
        }, 2800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <motion.div 
                className="text-[#E50914] font-netflix text-[150px] md:text-[250px] tracking-widest"
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: [0.2, 1, 15], opacity: [0, 1, 0] }}
                transition={{ duration: 2.5, ease: "easeInOut", times: [0, 0.6, 1] }}
                style={{ originX: 0.5, originY: 0.5, textShadow: '0 0 30px rgba(229,9,20,0.5)' }}
            >
                N
            </motion.div>
        </div>
    );
};

const NavBar = ({ activeTab, setTab, data }: { activeTab: string, setTab: (t: string) => void, data: WeddingData }) => {
    const items = [
        { id: 'home', icon: Home, visible: true },
        { id: 'quote', icon: Info, visible: !!data?.quoteText },
        { id: 'couple', icon: User, visible: true },
        { id: 'event', icon: Calendar, visible: (data?.events?.akad?.enabled !== false || data?.events?.resepsi?.enabled !== false) },
        { id: 'gallery', icon: ImageIcon, visible: !!(data?.gallery && data.gallery.length > 0) },
        { id: 'gift', icon: Gift, visible: !!(data?.gifts && data.gifts.length > 0) },
        { id: 'rsvp', icon: Check, visible: true },
    ].filter(item => item.visible);

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
            <div className="glass-netflix px-4 py-3 rounded-full flex justify-between items-center shadow-2xl border-t border-gray-700">
                {items.map((item) => {
                    const active = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setTab(item.id)}
                            className={`relative flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-white scale-110' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <item.icon size={active ? 20 : 18} />
                            {active && <div className="w-1 h-1 bg-[#E50914] rounded-full mt-1"></div>}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

// --- PAGES ---

const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    return (
        <button
            className="px-4 py-2 bg-white/10 hover:bg-[#E50914] border border-white/20 hover:border-[#E50914] rounded-md font-bold text-xs flex items-center gap-2 transition-all duration-300 z-30 relative shadow-lg overflow-hidden group/btn"
            onClick={() => {
                if (copied) return;
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }}
        >
            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500"></div>
            {copied ? <><Check size={14} className="relative z-10" /> <span className="relative z-10">Copied!</span></> : <><Gift size={14} className="relative z-10" /> <span className="relative z-10">Copy</span></>}
        </button>
    );
};

const LuxurySVGFlower = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <svg viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(0 10px 15px rgba(229,9,20,0.6))', ...style }} xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="rose-dark" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff0022" />
                <stop offset="60%" stopColor="#880011" />
                <stop offset="100%" stopColor="#220000" />
            </radialGradient>
            <radialGradient id="rose-light" cx="50%" cy="0%" r="100%">
                <stop offset="0%" stopColor="#ff4466" />
                <stop offset="80%" stopColor="#aa0011" />
                <stop offset="100%" stopColor="#440000" />
            </radialGradient>
            <linearGradient id="rose-edge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff1133" />
                <stop offset="50%" stopColor="#aa0011" />
                <stop offset="100%" stopColor="#220000" />
            </linearGradient>
            <linearGradient id="rose-center" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#550000" />
                <stop offset="100%" stopColor="#0a0000" />
            </linearGradient>
        </defs>
        
        {/* Layer 1: Base Petals (Back) */}
        <path d="M50 90 C10 90 -10 50 15 25 C35 45 50 55 50 90" fill="url(#rose-dark)" />
        <path d="M50 90 C90 90 110 50 85 25 C65 45 50 55 50 90" fill="url(#rose-dark)" />
        <path d="M15 25 C0 10 30 -5 50 15 C40 30 25 35 15 25" fill="url(#rose-edge)" />
        <path d="M85 25 C100 10 70 -5 50 15 C60 30 75 35 85 25" fill="url(#rose-edge)" />
        
        {/* Layer 2: Mid Petals */}
        <path d="M50 80 C20 80 5 45 20 25 C40 45 50 50 50 80" fill="url(#rose-light)" />
        <path d="M50 80 C80 80 95 45 80 25 C60 45 50 50 50 80" fill="url(#rose-light)" />
        <path d="M20 25 C10 10 35 5 50 25 C40 35 30 35 20 25" fill="url(#rose-dark)" />
        <path d="M80 25 C90 10 65 5 50 25 C60 35 70 35 80 25" fill="url(#rose-dark)" />
        
        {/* Layer 3: Inner Petals */}
        <path d="M50 70 C30 70 20 40 30 25 C45 40 50 45 50 70" fill="url(#rose-edge)" />
        <path d="M50 70 C70 70 80 40 70 25 C55 40 50 45 50 70" fill="url(#rose-edge)" />
        
        {/* Layer 4: Center Core Swirls */}
        <path d="M30 25 C35 15 50 20 50 35 C45 25 35 30 30 25" fill="url(#rose-light)" />
        <path d="M70 25 C65 15 50 20 50 35 C55 25 65 30 70 25" fill="url(#rose-light)" />
        <path d="M40 25 C45 15 55 15 60 25 C55 35 45 35 40 25" fill="url(#rose-center)" />
        
        {/* Details: Subtle overlapping swirls to enhance 3D feel */}
        <path d="M50 55 C40 55 35 45 40 35 C45 45 50 50 50 55" fill="url(#rose-light)" />
        <path d="M50 55 C60 55 65 45 60 35 C55 45 50 50 50 55" fill="url(#rose-light)" />
    </svg>
);

const NetflixHeroFX = () => (
    <div className="absolute inset-0 pointer-events-none z-[5] mix-blend-screen opacity-40 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-spin-slow opacity-60 scale-150"></div>
        {/* TV Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]"></div>
        {/* Color fringe / glitch overlay */}
        <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-blue-500/10"
            animate={{ opacity: [0, 0, 0.6, 0, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
        />
        {/* Heavy glitch line */}
        <motion.div 
            className="absolute left-0 top-0 w-full h-1 bg-white/20"
            animate={{ y: ['-10vh', '110vh'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
    </div>
);

const FallingLeaves = () => {
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        // Generate random particles only on the client side to avoid hydration mismatch
        const newParticles = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            x: Math.random() * 50 + 50, // 50% to 100% (right half)
            delay: Math.random() * 5,
            duration: Math.random() * 10 + 10, // 10-20 seconds falling
            scale: Math.random() * 0.5 + 0.5,
            type: Math.random() > 0.5 ? 'leaf' : 'flower'
        }));
        setParticles(newParticles);
    }, []);

    if (particles.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[4]">
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    className="absolute top-[-10%]"
                    style={{ left: `${p.x}%` }}
                    initial={{ y: '-10vh', rotate: 0, opacity: 0 }}
                    animate={{ 
                        y: '110vh', 
                        rotate: 360, 
                        opacity: [0, 1, 1, 0],
                        x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0] 
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    {p.type === 'leaf' ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#8e161b" className="opacity-70 drop-shadow-2xl" style={{ transform: `scale(${p.scale})` }}>
                            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 7.08,16.42 7.08,16.42L8.29,13.56C10.09,10.09 13,8 17,8Z" />
                        </svg>
                    ) : (
                        <LuxurySVGFlower className="w-10 h-10 md:w-16 md:h-16 opacity-90" style={{ transform: `scale(${p.scale})` }} />
                    )}
                </motion.div>
            ))}
        </div>
    );
};

const HomePage = ({ onPlay, data }: { onPlay: () => void, data: WeddingData }) => {
    return (
        <div className="flex flex-col h-full relative page-enter overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img 
                    src={getImageUrl(data?.bgImageUrl || data?.couple?.bride?.photoUrl || DEFAULT_ASSETS.defaultCover)} 
                    className="w-full h-full object-cover opacity-60" 
                    onError={(e) => { e.currentTarget.src = DEFAULT_ASSETS.defaultCover; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent z-[1]"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent z-[2]"></div>
                
                <FallingLeaves />
                <NetflixHeroFX />
            </div>

            <div className="relative z-10 flex flex-col justify-end h-full p-8 pb-32 md:pb-12 md:justify-center md:items-start md:pl-16">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 1 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-[#E50914] text-white text-[10px] font-bold px-1 py-0.5 rounded-sm">N</span>
                        <span className="text-gray-300 text-xs font-bold tracking-widest uppercase">Series</span>
                    </div>
                </motion.div>

                <motion.h1 
                    className="font-netflix text-7xl md:text-9xl text-white leading-[0.85] mb-4 drop-shadow-[0_0_15px_rgba(229,9,20,0.5)]"
                    initial={{ scale: 2, opacity: 0, filter: 'blur(10px)' }}
                    animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                >
                    {data?.couple?.groom?.nickname} <br /> <span className="text-[#E50914]">&</span> {data?.couple?.bride?.nickname}
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                >
                    <div className="flex items-center gap-3 text-sm text-gray-300 font-body mb-6">
                        <span className="text-[#46d369] font-bold">99% Match</span>
                        <span>{new Date().getFullYear()}</span>
                        <span className="border border-gray-500 px-1 text-xs">SU</span>
                        <span>1 Season</span>
                        <span className="border border-gray-500 px-1 text-xs">HD</span>
                    </div>

                    <p className="font-body text-sm md:text-base text-gray-300 max-w-md mb-8 leading-relaxed shadow-black drop-shadow-md">
                        Join us for the premiere of our greatest adventure yet. A story of love, laughter, and happily ever after.
                    </p>

                    <div className="flex gap-4">
                        <button onClick={onPlay} className="netflix-btn flex items-center gap-2 px-6 py-2 rounded font-bold text-black bg-white hover:bg-gray-200">
                            <Play size={20} className="fill-black text-black" /> Play
                        </button>
                        <button className="btn-secondary flex items-center gap-2 px-6 py-2 rounded font-bold">
                            <Info size={20} /> More Info
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const CreepingVine = ({ position }: { position: 'top' | 'bottom' }) => {
    const isTop = position === 'top';
    return (
        <div className={`absolute left-0 right-0 h-12 md:h-16 pointer-events-none z-10 flex items-start justify-between opacity-90 ${isTop ? 'top-[-10px] md:top-[-20px]' : 'bottom-[-10px] md:bottom-[-20px] rotate-180'}`}>
            
            <svg width="100%" height="100%" viewBox="0 0 100 20" preserveAspectRatio="none" className="absolute inset-0 drop-shadow-[0_0_8px_rgba(229,9,20,0.5)]">
                {/* Main Vine Stem */}
                <motion.path 
                    d="M0,10 Q12.5,25 25,10 T50,10 T75,10 T100,10" 
                    stroke="#2e0508" strokeWidth="2" fill="none"
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: false }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                />
                <motion.path 
                    d="M0,10 Q12.5,25 25,10 T50,10 T75,10 T100,10" 
                    stroke="#8e161b" strokeWidth="1" fill="none"
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: false }}
                    transition={{ duration: 2.5, ease: "easeInOut", delay: 0.1 }}
                />
            </svg>

            {/* Leaves and Flowers */}
            <div className="absolute inset-0 w-full h-full">
                {[
                    { left: '12%', top: '50%', delay: 0.4, rotate: 45, type: 'leaf' },
                    { left: '25%', top: '10%', delay: 0.8, rotate: -30, type: 'flower' },
                    { left: '37%', top: '40%', delay: 1.1, rotate: 120, type: 'leaf' },
                    { left: '50%', top: '15%', delay: 1.4, rotate: -20, type: 'flower' },
                    { left: '62%', top: '45%', delay: 1.7, rotate: 80, type: 'leaf' },
                    { left: '75%', top: '5%', delay: 2.0, rotate: -40, type: 'flower' },
                    { left: '87%', top: '35%', delay: 2.3, rotate: 10, type: 'leaf' },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-4 h-4 md:w-5 md:h-5 -ml-2 -mt-2"
                        style={{ left: item.left, top: item.top }}
                        initial={{ scale: 0, opacity: 0, rotate: item.rotate - 45 }}
                        whileInView={{ scale: 1, opacity: 1, rotate: item.rotate }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.6, delay: item.delay, type: 'spring' }}
                    >
                        {item.type === 'leaf' ? (
                            <svg viewBox="0 0 24 24" fill="#610e12" className="w-full h-full drop-shadow-md">
                                <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 7.08,16.42 7.08,16.42L8.29,13.56C10.09,10.09 13,8 17,8Z" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="#D4AF37" className="w-full h-full drop-shadow-[0_0_5px_rgba(212,175,55,0.6)]">
                                <path d="M12 2.5a3 3 0 0 1 3 3c0 1.25-.77 2.33-1.87 2.8A3.01 3.01 0 0 1 15 11c1.25 0 2.33-.77 2.8-1.87A3 3 0 1 1 21.5 12a3 3 0 0 1-3 3c-1.25 0-2.33-.77-2.8-1.87A3.01 3.01 0 0 1 15 13c-1.25 0-2.33.77-2.8 1.87A3 3 0 1 1 12 21.5a3 3 0 0 1-3-3c0-1.25.77-2.33 1.87-2.8A3.01 3.01 0 0 1 9 13c-1.25 0-2.33.77-2.8 1.87A3 3 0 1 1 2.5 12a3 3 0 0 1 3-3c1.25 0 2.33.77 2.8 1.87A3.01 3.01 0 0 1 9 11c1.25 0 2.33-.77 2.8-1.87a3 3 0 0 1 .2-5.63z" />
                            </svg>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const QuotePage = ({ data }: { data: WeddingData }) => {
    const quoteText = data?.quoteText || "";
    
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 pt-24 pb-24 page-enter relative bg-[#141414] overflow-y-auto custom-scroll">
            
            <motion.h2 
                className="text-white font-body font-bold text-2xl mb-6 tracking-widest uppercase"
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                Quotes
            </motion.h2>

            <div className="relative p-10 md:p-16 max-w-2xl w-full flex flex-col items-center bg-black/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm">
                
                <CreepingVine position="top" />
                <CreepingVine position="bottom" />

                {/* Cinematic Frame Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#E50914]/70"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#E50914]/70"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#E50914]/70"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#E50914]/70"></div>

                {/* REC Indicator */}
                <div className="absolute top-4 right-5 flex items-center gap-2">
                    <motion.div 
                        className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_5px_red]"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                    <span className="text-gray-500 font-mono text-[10px] tracking-widest">REC</span>
                </div>

                {/* Crosshairs */}
                <div className="absolute left-1/2 top-4 w-[1px] h-3 bg-gray-700 -translate-x-1/2"></div>
                <div className="absolute left-1/2 bottom-4 w-[1px] h-3 bg-gray-700 -translate-x-1/2"></div>
                <div className="absolute top-1/2 left-4 w-3 h-[1px] bg-gray-700 -translate-y-1/2"></div>
                <div className="absolute top-1/2 right-4 w-3 h-[1px] bg-gray-700 -translate-y-1/2"></div>

                <div className="w-12 h-1 bg-[#E50914] mb-8 shadow-[0_0_10px_red]"></div>
                
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/2/23/Bismillah.svg" 
                    className="h-8 md:h-10 mb-8 opacity-50 invert" 
                    alt="Bismillah" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                
                <motion.div 
                    className="font-body text-base md:text-xl leading-relaxed text-gray-300 max-w-lg mb-8 italic min-h-[100px]"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false }}
                    variants={{
                        visible: { transition: { staggerChildren: 0.03 } },
                        hidden: {}
                    }}
                >
                    {quoteText.split('').map((char, index) => (
                        <motion.span
                            key={index}
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1 }
                            }}
                        >
                            {char}
                        </motion.span>
                    ))}
                    <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-[2px] h-[1em] bg-red-600 ml-1 translate-y-[2px]"
                    />
                </motion.div>
                
                <motion.p 
                    className="font-netflix text-xl md:text-2xl text-[#E50914] tracking-widest"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: (quoteText.length * 0.03) + 0.5, duration: 1 }}
                    viewport={{ once: false }}
                >
                    {data?.quoteSource}
                </motion.p>
            </div>
        </div>
    );
};

const CouplePage = ({ data }: { data: WeddingData }) => {
    return (
        <div className="h-full overflow-y-auto custom-scroll p-6 pt-24 pb-24 page-enter">
            <motion.h2 
                className="text-white font-body font-bold text-2xl md:text-3xl mb-1 tracking-widest uppercase"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
            >
                Starring
            </motion.h2>
            <motion.p
                className="text-gray-400 text-xs md:text-sm mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
            >
                The incredible cast bringing this story to life.
            </motion.p>
            
            <div className="flex flex-col gap-8 md:gap-12">
                {/* Groom Card */}
                <motion.div 
                    className="group relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.8)] cursor-pointer"
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="absolute inset-0 z-0">
                        <img 
                            src={getImageUrl(data?.couple?.groom?.photoUrl || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400")} 
                            className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" 
                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent z-[1] transition-opacity duration-500 group-hover:opacity-80"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/30 to-transparent z-[2]"></div>
                        
                        {/* TV Glitch FX overlay */}
                        <div className="absolute inset-0 z-[3] mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <NetflixHeroFX />
                        </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full z-10 flex flex-col items-start justify-end h-full">
                        <motion.div 
                            className="flex items-center gap-2 mb-3"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <span className="bg-[#E50914] text-white text-[10px] font-bold px-1 py-0.5 rounded-sm">TOP 10</span>
                            <span className="text-gray-300 text-xs font-bold tracking-widest uppercase">The Groom</span>
                        </motion.div>
                        <h3 className="font-netflix text-5xl md:text-7xl text-white mb-2 drop-shadow-lg group-hover:text-[#E50914] transition-colors duration-500">{data?.couple?.groom?.nickname}</h3>
                        <p className="text-gray-200 text-lg md:text-2xl font-bold tracking-wide">{data?.couple?.groom?.fullName}</p>
                        <p className="text-gray-400 text-xs md:text-sm mt-3 max-w-sm leading-relaxed border-l-2 border-[#E50914] pl-3">
                            Putra dari Bpk. {data?.couple?.groom?.fatherName} <br/> & Ibu {data?.couple?.groom?.motherName}
                        </p>
                    </div>
                </motion.div>

                {/* Bride Card */}
                <motion.div 
                    className="group relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.8)] cursor-pointer"
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                >
                    <div className="absolute inset-0 z-0">
                        <img 
                            src={getImageUrl(data?.couple?.bride?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400")} 
                            className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" 
                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent z-[1] transition-opacity duration-500 group-hover:opacity-80"></div>
                        <div className="absolute inset-0 bg-gradient-to-l from-[#141414]/90 via-[#141414]/30 to-transparent z-[2]"></div>
                        
                        <div className="absolute inset-0 z-[3] mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <NetflixHeroFX />
                        </div>
                    </div>
                    
                    <div className="absolute bottom-0 right-0 text-right p-6 md:p-10 w-full z-10 flex flex-col items-end justify-end h-full">
                        <motion.div 
                            className="flex items-center gap-2 mb-3"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <span className="text-gray-300 text-xs font-bold tracking-widest uppercase">The Bride</span>
                            <span className="bg-[#E50914] text-white text-[10px] font-bold px-1 py-0.5 rounded-sm">TOP 10</span>
                        </motion.div>
                        <h3 className="font-netflix text-5xl md:text-7xl text-white mb-2 drop-shadow-lg group-hover:text-[#E50914] transition-colors duration-500">{data?.couple?.bride?.nickname}</h3>
                        <p className="text-gray-200 text-lg md:text-2xl font-bold tracking-wide">{data?.couple?.bride?.fullName}</p>
                        <p className="text-gray-400 text-xs md:text-sm mt-3 max-w-sm leading-relaxed border-r-2 border-[#E50914] pr-3">
                            Putri dari Bpk. {data?.couple?.bride?.fatherName} <br/> & Ibu {data?.couple?.bride?.motherName}
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const EventPage = ({ data }: { data: WeddingData }) => {
    return (
        <div className="h-full p-6 pt-24 pb-24 page-enter overflow-y-auto custom-scroll relative">
            
            <div className="flex items-center gap-4 mb-8">
                <motion.h2 
                    className="text-white font-body font-bold text-2xl md:text-3xl tracking-widest uppercase"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    Episodes
                </motion.h2>
                <div className="flex-1 h-[1px] bg-gray-800"></div>
                <span className="text-gray-500 font-bold text-xs md:text-sm border border-gray-700 px-2 py-0.5 rounded">SEASON 1</span>
            </div>

            <div className="flex flex-col gap-6">

                {/* Akad */}
                {data?.events?.akad?.enabled !== false && (
                    <motion.div 
                        className="group flex flex-col md:flex-row gap-4 md:gap-6 bg-black/40 hover:bg-[#1a1a1a] p-4 rounded-lg border border-gray-800/50 transition-all duration-500 cursor-pointer relative overflow-hidden shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                    >
                        {/* Hover accent line */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E50914] transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>

                        {/* Thumbnail */}
                        <div className="relative w-full md:w-64 h-40 md:h-36 bg-gray-900 rounded-md overflow-hidden flex-shrink-0 border border-gray-800">
                            <img 
                                src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=500" 
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                                alt="Akad" 
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            
                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 bg-black/20 backdrop-blur-[1px]">
                                <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/50 hover:bg-[#E50914] hover:border-[#E50914] transition-colors duration-300">
                                    <Play size={20} className="fill-white text-white translate-x-0.5" />
                                </div>
                            </div>
                            
                            {/* Episode Number */}
                            <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-white font-bold text-xs tracking-wider shadow-md">
                                E1
                            </div>
                            
                            {/* Progress bar fake */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
                                <div className="h-full bg-[#E50914] w-[100%] shadow-[0_0_5px_red]"></div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-white font-bold text-lg md:text-xl group-hover:text-[#E50914] transition-colors">{data?.events?.akad?.name || 'Akad Nikah'}</h3>
                                <span className="text-gray-400 font-mono text-xs border border-gray-700 px-1.5 py-0.5 rounded">{data?.events?.akad?.timeStart}</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 md:line-clamp-3 mb-3">
                                The beginning of forever. Join us as we take our sacred vows in the presence of God and our closest family. A beautiful milestone in our journey.
                            </p>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mt-auto">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-[#E50914]" />
                                    <span className="text-gray-500 text-xs truncate max-w-[200px] md:max-w-xs">{data?.events?.akad?.venueName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-[#E50914]" />
                                    <span className="text-gray-500 text-xs">{formatDate(data?.events?.akad?.date || '')}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Resepsi */}
                {data?.events?.resepsi?.enabled !== false && (
                    <motion.div 
                        className="group flex flex-col md:flex-row gap-4 md:gap-6 bg-black/40 hover:bg-[#1a1a1a] p-4 rounded-lg border border-gray-800/50 transition-all duration-500 cursor-pointer relative overflow-hidden shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Hover accent line */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E50914] transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>

                        {/* Thumbnail */}
                        <div className="relative w-full md:w-64 h-40 md:h-36 bg-gray-900 rounded-md overflow-hidden flex-shrink-0 border border-gray-800">
                            <img 
                                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500" 
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                                alt="Resepsi" 
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            
                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 bg-black/20 backdrop-blur-[1px]">
                                <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/50 hover:bg-[#E50914] hover:border-[#E50914] transition-colors duration-300">
                                    <Play size={20} className="fill-white text-white translate-x-0.5" />
                                </div>
                            </div>
                            
                            <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-white font-bold text-xs tracking-wider shadow-md">
                                E2
                            </div>
                            
                            {/* Progress bar fake */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
                                <div className="h-full bg-[#E50914] w-[0%] group-hover:w-[15%] transition-all duration-1000 shadow-[0_0_5px_red]"></div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-white font-bold text-lg md:text-xl group-hover:text-[#E50914] transition-colors">{data?.events?.resepsi?.name || 'Resepsi'}</h3>
                                <span className="text-gray-400 font-mono text-xs border border-gray-700 px-1.5 py-0.5 rounded">{data?.events?.resepsi?.timeStart}</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 md:line-clamp-3 mb-3">
                                The grand celebration! A night filled with joy, laughter, feasting, and memories that will last a lifetime. Let's make this episode unforgettable.
                            </p>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mt-auto">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-[#E50914]" />
                                    <span className="text-gray-500 text-xs truncate max-w-[200px] md:max-w-xs">{data?.events?.resepsi?.venueName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-[#E50914]" />
                                    <span className="text-gray-500 text-xs">{formatDate(data?.events?.resepsi?.date || '')}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="mt-8 px-4">
                <a
                    href={(data?.events?.resepsi?.googleMapsUrl || data?.events?.akad?.googleMapsUrl) as string || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#333] text-white text-sm font-bold rounded hover:bg-[#444] flex items-center justify-center gap-2"
                >
                    <MapPin size={16} /> View Locations Map
                </a>
            </div>
        </div>
    );
};

const GalleryPage = ({ data }: { data: WeddingData }) => {
    // Fallback cinematic images if gallery is missing or broken
    const galleryFallbacks = [
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800",
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800"
    ];

    return (
        <div className="h-full overflow-y-auto overflow-x-hidden custom-scroll p-4 md:p-6 pt-24 pb-24 page-enter relative bg-[#141414]">
            
            {/* Wrap absolute decorations in overflow-hidden to prevent scrollbar */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                {/* Realistic 3D Flower Decoration - Top Left */}
                <motion.div 
                    className="absolute -top-10 -left-10 md:-top-20 md:-left-20 w-48 h-48 md:w-80 md:h-80"
                    animate={{ y: [0, 15, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                    <LuxurySVGFlower className="w-full h-full opacity-90 drop-shadow-[0_0_30px_rgba(229,9,20,0.4)]" />
                </motion.div>

                {/* Realistic 3D Flower Decoration - Right Middle */}
                <motion.div 
                    className="absolute top-1/2 -right-16 md:-right-32 w-56 h-56 md:w-96 md:h-96"
                    animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                    <LuxurySVGFlower className="w-full h-full opacity-70 drop-shadow-[0_0_30px_rgba(229,9,20,0.4)]" />
                </motion.div>
            </div>

            <div className="relative z-20">
                <motion.h2 
                    className="text-white font-body font-bold text-2xl md:text-3xl mb-1 tracking-widest uppercase"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    Trailers & More
                </motion.h2>
                <motion.p
                    className="text-gray-400 text-xs md:text-sm mb-6"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    Behind the scenes of our beautiful journey.
                </motion.p>

                {/* Mobile-first Vertical Stack of Cinematic Cards */}
                <div className="flex flex-col gap-6 md:gap-10 mt-6">
                    {data?.gallery && data.gallery.length > 0 ? (
                        data.gallery.map((img, i) => (
                            <motion.div 
                                key={i} 
                                className="relative aspect-[16/9] w-full group bg-gray-900 rounded-lg overflow-hidden cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-gray-800/50"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            >
                                <img 
                                    src={getImageUrl(img) || galleryFallbacks[i % galleryFallbacks.length]} 
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                                    onError={(e) => { e.currentTarget.src = galleryFallbacks[i % galleryFallbacks.length]; }}
                                />
                                
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                                
                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                                    <div className="w-16 h-16 rounded-full border-[3px] border-white flex items-center justify-center bg-black/40 backdrop-blur-sm group-hover:bg-[#E50914] group-hover:border-[#E50914] transition-colors duration-300 shadow-[0_0_20px_rgba(229,9,20,0.5)]">
                                        <Play size={28} className="text-white ml-1 fill-white" />
                                    </div>
                                </div>
                                
                                {/* Progress Bar Fake (Netflix style) */}
                                <div className="absolute bottom-0 left-0 w-full h-1 md:h-1.5 bg-gray-700/80">
                                    <div className="h-full bg-[#E50914] shadow-[0_0_10px_red]" style={{ width: `${30 + (i * 15) % 60}%` }}></div>
                                </div>
                                
                                {/* Title / Metadata */}
                                <div className="absolute bottom-4 left-4 right-4 flex flex-col justify-end transform translate-y-2 opacity-80 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-[#E50914] text-white text-[10px] font-bold px-1 py-0.5 rounded-sm">NEW</span>
                                        <span className="text-gray-300 text-[10px] font-bold tracking-widest uppercase">Clip</span>
                                    </div>
                                    <h3 className="text-white font-bold text-lg md:text-xl drop-shadow-md">Episode {i + 1}: The Journey</h3>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm text-center py-8">No photos in gallery yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const GiftPage = ({ data }: { data: WeddingData }) => (
    <div className="flex flex-col items-center justify-start h-full p-4 md:p-6 pt-24 pb-24 text-center page-enter bg-[#141414] relative overflow-hidden overflow-x-hidden">
        
        {/* Ambient red glow behind */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-[#E50914] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>

        <motion.h2 
            className="text-white font-body font-bold text-2xl md:text-3xl mb-8 tracking-widest uppercase z-10 drop-shadow-md"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            Digital Gifts
        </motion.h2>
        
        <div className="w-full max-w-sm md:max-w-md space-y-12 pb-20 overflow-y-auto custom-scroll z-10 px-4">
            {data?.gifts?.map((gift, i) => (
                <motion.div 
                    key={i} 
                    className="relative"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                    {/* --- VINE AND FLOWER WRAPPING EFFECTS --- */}
                    
                    {/* Wrap absolute decorations to prevent overflow horizontal scrollbar */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20 rounded-2xl">
                        {/* Vine loops wrapping the card (Left) */}
                        <div className="absolute top-10 -left-6 w-12 h-24 border-[3px] border-[#1e3017] border-r-0 rounded-l-full opacity-80"></div>
                        <div className="absolute top-8 -left-4 w-12 h-28 border border-[#E50914] border-r-0 rounded-l-full opacity-20 shadow-[0_0_10px_red]"></div>
                        
                        {/* Vine loops wrapping the card (Right) */}
                        <div className="absolute bottom-10 -right-6 w-12 h-24 border-[3px] border-[#1e3017] border-l-0 rounded-r-full opacity-80"></div>

                        {/* Flower wrapping top-left corner */}
                        <motion.div 
                            className="absolute -top-10 -left-10 w-28 h-28 md:w-32 md:h-32"
                            animate={{ rotate: [35, 42, 35] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <LuxurySVGFlower className="w-full h-full opacity-100 drop-shadow-[0_0_15px_rgba(229,9,20,0.5)]" />
                        </motion.div>
                        
                        {/* Small Flower on the left edge vine */}
                        <LuxurySVGFlower className="absolute top-[40%] -left-8 w-16 h-16 opacity-80 rotate-[110deg]" />

                        {/* Flower wrapping bottom-right corner */}
                        <motion.div 
                            className="absolute -bottom-10 -right-10 w-28 h-28 md:w-32 md:h-32"
                            animate={{ rotate: [215, 208, 215] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        >
                            <LuxurySVGFlower className="w-full h-full opacity-100 drop-shadow-[0_0_15px_rgba(229,9,20,0.5)]" />
                        </motion.div>
                        
                        {/* Small Flower on the right edge vine */}
                        <LuxurySVGFlower className="absolute bottom-[20%] -right-6 w-14 h-14 opacity-90 rotate-[290deg]" />
                    </div>

                    {/* --- THE BANK CARD (PREMIUM DESIGN) --- */}
                    <div className="bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-6 md:p-8 border border-gray-700 shadow-[0_15px_40px_rgba(0,0,0,0.9)] text-left relative overflow-hidden group z-10">
                        
                        {/* Netflix-like Card Texture Overlay (Glass/Noise effect) */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-300 via-transparent to-transparent pointer-events-none"></div>

                        {/* Card Chip Simulation */}
                        <div className="w-10 h-8 rounded-md border border-yellow-700/50 bg-gradient-to-br from-yellow-600/30 to-yellow-900/40 mb-6 flex items-center justify-center shadow-inner relative overflow-hidden">
                            <div className="w-6 h-5 border border-yellow-700/40 rounded-sm"></div>
                            {/* Chip lines */}
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-yellow-700/40"></div>
                            <div className="absolute top-0 left-1/2 w-[1px] h-full bg-yellow-700/40"></div>
                        </div>

                        {/* Bank Logo Effect */}
                        <div className="absolute top-6 right-6 text-[#E50914] font-netflix text-xl md:text-2xl font-black italic opacity-90 tracking-tighter drop-shadow-[0_2px_10px_rgba(229,9,20,0.4)]">
                            {gift.name.toUpperCase()}
                        </div>

                        <p className="text-gray-400 text-[9px] md:text-[10px] uppercase tracking-[0.2em] mb-1 font-bold">Card Number</p>
                        <p className="text-white font-mono font-bold text-lg md:text-2xl tracking-[0.15em] md:tracking-[0.2em] mb-6 drop-shadow-md">
                            {gift.accountNumber.replace(/(.{4})/g, '$1 ').trim()}
                        </p>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-gray-400 text-[9px] md:text-[10px] uppercase tracking-[0.2em] mb-1 font-bold">Cardholder</p>
                                <p className="text-white font-bold text-sm md:text-base uppercase tracking-wider shadow-black drop-shadow-md">{gift.accountHolder}</p>
                            </div>
                            
                            {gift.type !== 'address' && (
                                <CopyButton text={gift.accountNumber} />
                            )}
                        </div>
                        
                        {/* Hover accent light sweeping across the card */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none transform -translate-x-full group-hover:translate-x-full ease-in-out"></div>
                    </div>
                </motion.div>
            ))}

            {(!data?.gifts || data.gifts.length === 0) && (
                <p className="text-gray-500 text-sm py-8 italic">Tidak ada informasi rekening.</p>
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
        <div className="flex flex-col items-center justify-start h-full p-4 md:p-6 pt-24 pb-28 overflow-y-auto overflow-x-hidden custom-scroll bg-[#141414] relative">
            
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-[80%] h-64 bg-[#E50914] opacity-5 blur-[120px] rounded-full pointer-events-none z-0"></div>

            {/* Realistic 3D SVG Flower Decoration - Bottom Right */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <motion.div 
                    className="absolute -bottom-10 -right-16 md:-bottom-20 md:-right-24 w-48 h-48 md:w-80 md:h-80"
                    animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                >
                    <LuxurySVGFlower className="w-full h-full opacity-60 drop-shadow-[0_0_25px_rgba(229,9,20,0.5)]" />
                </motion.div>
            </div>

            <motion.div 
                className="w-full max-w-md z-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <h2 className="text-white font-body font-bold text-2xl md:text-3xl mb-2 text-center tracking-widest uppercase drop-shadow-md">RSVP</h2>
                <p className="text-gray-400 text-xs md:text-sm text-center mb-10 tracking-wide">Please confirm your attendance</p>
                
                <AnimatePresence mode="wait">
                    {rsvpSuccess ? (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                            className="text-center py-12 px-6 bg-gradient-to-b from-[#1f1f1f] to-[#141414] rounded-2xl border border-gray-800 shadow-[0_15px_40px_rgba(0,0,0,0.8)] relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#E50914]/10 via-transparent to-transparent pointer-events-none"></div>
                            
                            <motion.div 
                                className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#E50914]/50 shadow-[0_0_20px_rgba(229,9,20,0.4)]"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                            >
                                <Check className="w-10 h-10 text-[#E50914]" />
                            </motion.div>
                            <h3 className="text-white font-bold text-xl mb-2 tracking-wide">RSVP Confirmed</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Thank you for letting us know! Your presence is highly anticipated.</p>
                        </motion.div>
                    ) : (
                        <motion.form 
                            key="form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.4 }}
                            onSubmit={handleRSVPSubmit} 
                            className="space-y-5 bg-gradient-to-br from-[#1f1f1f] to-[#181818] p-6 md:p-8 rounded-2xl border border-gray-800 shadow-[0_15px_40px_rgba(0,0,0,0.7)] relative overflow-hidden group"
                        >
                            {/* Glass reflection effect */}
                            <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out pointer-events-none"></div>

                            <div className="space-y-1">
                                <label className="block text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={rsvpGuestName}
                                    onChange={(e) => setRsvpGuestName(e.target.value)}
                                    disabled={!!guest}
                                    className="w-full bg-[#111] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all duration-300 text-sm shadow-inner disabled:opacity-50"
                                    placeholder="Enter your name"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Attendance</label>
                                    <div className="relative">
                                        <select
                                            value={rsvpStatus}
                                            onChange={(e) => setRsvpStatus(e.target.value as any)}
                                            className="w-full bg-[#111] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all duration-300 text-sm appearance-none shadow-inner"
                                        >
                                            <option value="Hadir">Attending</option>
                                            <option value="Tidak Hadir">Not Attending</option>
                                            <option value="Ragu-ragu">Maybe</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                            <ChevronDown size={14} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">No. of Guests</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={guest ? guest.paxLimit : 10}
                                        value={rsvpPaxCount}
                                        onChange={(e) => setRsvpPaxCount(Number(e.target.value))}
                                        className="w-full bg-[#111] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all duration-300 text-sm shadow-inner"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <label className="block text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Wishes & Prayers</label>
                                <textarea
                                    required
                                    value={rsvpWishes}
                                    onChange={(e) => setRsvpWishes(e.target.value)}
                                    rows={4}
                                    className="w-full bg-[#111] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all duration-300 text-sm resize-none shadow-inner"
                                    placeholder="Write your beautiful wishes here..."
                                />
                            </div>
                            
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: '#f40612' }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full mt-4 py-4 bg-[#E50914] text-white rounded-lg font-bold text-sm tracking-widest uppercase transition-colors shadow-[0_5px_15px_rgba(229,9,20,0.4)] flex items-center justify-center gap-2"
                            >
                                Send RSVP
                            </motion.button>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* List of RSVPs */}
                {rsvps && rsvps.length > 0 && (
                    <motion.div 
                        className="mt-12 space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <h3 className="text-white font-bold tracking-widest uppercase text-sm mb-6 border-b border-gray-800 pb-2 inline-block">Guest Wishes</h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scroll">
                            {rsvps.map((rsvp, idx) => (
                                <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + (idx * 0.1), duration: 0.4 }}
                                    className="bg-gradient-to-r from-[#1a1a1a] to-[#141414] p-5 rounded-xl border-l-2 border-l-gray-800 hover:border-l-[#E50914] transition-all duration-300 shadow-md group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                        <Heart size={40} />
                                    </div>
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#111] flex items-center justify-center text-[#E50914] font-bold text-xs uppercase group-hover:bg-[#E50914] group-hover:text-white transition-colors duration-300 border border-gray-800 shadow-inner">
                                                {rsvp.guestName.charAt(0)}
                                            </div>
                                            <span className="font-bold text-white text-sm tracking-wide drop-shadow-sm">{rsvp.guestName}</span>
                                        </div>
                                        <span className={`text-[8px] px-2 py-1 rounded-sm uppercase tracking-widest font-bold ${
                                            rsvp.status === 'Hadir' ? 'text-green-400 bg-green-900/30' : 
                                            rsvp.status === 'Tidak Hadir' ? 'text-[#E50914] bg-[#E50914]/20' : 
                                            'text-yellow-400 bg-yellow-900/30'
                                        }`}>
                                            {rsvp.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 italic leading-relaxed pl-11 relative z-10">
                                        <span className="text-gray-600 absolute left-8 top-[-5px] text-xl font-serif">"</span>
                                        {rsvp.wishes}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

/**
 * --- MAIN APP ---
 */
interface NetflixLuxuryProps {
    data: WeddingData;
    theme: ThemeConfig;
    guest?: Guest | null;
    onAddRSVP: (rsvp: RSVP) => void;
    rsvps: RSVP[];
    embedded?: boolean;
}

const NetflixLuxuryLayout: React.FC<NetflixLuxuryProps> = ({ data, guest, onAddRSVP, rsvps, embedded = false }) => {
    const [stage, setStage] = useState<'envelope' | 'hero' | 'content'>(embedded ? 'content' : 'envelope');
    const [activeTab, setActiveTab] = useState('home');
    const [music, setMusic] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const guestName = guest ? guest.name : "Tamu Undangan";

    // Auto play music when stage changes to content
    useEffect(() => {
        if (stage === 'content' && audioRef.current) {
            setMusic(true);
            audioRef.current.play().catch(() => console.log("Autoplay blocked"));
        }
    }, [stage]);

    const toggleMusic = () => {
        if (!audioRef.current) return;
        if (music) audioRef.current.pause();
        else audioRef.current.play();
        setMusic(!music);
    };

    const handleProfileSelect = () => {
        setStage('content');
    };

    return (
        <div
            className="relative w-full h-screen overflow-hidden text-white font-sans"
            style={
                data?.bgImageUrl
                    ? { backgroundImage: `url(${getImageUrl(data.bgImageUrl)})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
                    : { backgroundColor: '#141414' }
            }
        >
            {/* Dark cinematic overlay for custom background */}
            {data?.bgImageUrl && (
                <div className="fixed inset-0 bg-black/85 z-0" />
            )}
            <GlobalStyles />
            <audio ref={audioRef} loop src={data?.musicUrl || DEFAULT_ASSETS.bgm} muted={embedded} />

            {/* --- LAYER 0: CINEMATIC BACKGROUND --- */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#141414]">
                <div className="film-grain"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,#000000_100%)] opacity-80"></div>
                {/* Static minimal spots if mouse parallax is heavy */}
                <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#E50914] rounded-full blur-[150px] opacity-10 animate-spotlight"></div>
            </div>

            {/* --- LAYER 1: INTRO --- */}
            {stage === 'envelope' && (
                <NetflixIntroStart
                    onOpen={() => setStage('hero')}
                />
            )}

            {/* --- LAYER 2: WHO'S WATCHING (HERO SELECT) --- */}
            <div className={`fixed inset-0 z-20 flex flex-col items-center justify-center transition-all duration-1000 bg-[#141414] ${stage === 'hero' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
                <h1 className="font-body text-3xl md:text-5xl text-white mb-12 font-light">Who's watching?</h1>

                <div className="flex gap-4 md:gap-8">
                    {/* Items */}
                    <div className="group flex flex-col items-center gap-2 cursor-pointer" onClick={handleProfileSelect}>
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded bg-[#E50914] flex items-center justify-center border-2 border-transparent group-hover:border-white overflow-hidden relative transition-all">
                            {/* Smiley Icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-4 bg-black rounded-b-full"></div>
                                <div className="absolute top-8 left-6 w-3 h-3 bg-black rounded-full"></div>
                                <div className="absolute top-8 right-6 w-3 h-3 bg-black rounded-full"></div>
                            </div>
                        </div>
                        <span className="text-white text-sm md:text-lg font-bold transition-colors text-gray-400 group-hover:text-white mt-2">
                            {guestName}
                        </span>
                    </div>
                </div>
            </div>

            {/* --- LAYER 3: CONTENT --- */}
            <div className={`fixed inset-0 z-30 flex items-center justify-center p-0 md:p-8 transition-all duration-1000 delay-300 ${stage === 'content' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>

                <div className="glass-netflix w-full max-w-6xl h-full md:h-[85vh] rounded-none md:rounded-[10px] flex shadow-2xl overflow-hidden relative border-t-0 md:border md:border-gray-800">

                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-40 flex items-center justify-between px-6 pointer-events-none">
                        <div className="text-[#E50914] font-netflix text-4xl mt-2 tracking-widest">NETFLIX</div>
                        <div className="flex gap-4 text-white">
                            <Search size={20} />
                            <Bell size={20} />
                        </div>
                    </div>

                    {/* Viewport */}
                    <div className="flex-1 relative bg-[#141414] w-full">
                        <div className="w-full h-full relative z-10">
                            {activeTab === 'home' && <HomePage onPlay={() => setActiveTab('event')} data={data} />}
                            {activeTab === 'quote' && <QuotePage data={data} />}
                            {activeTab === 'couple' && <CouplePage data={data} />}
                            {activeTab === 'event' && <EventPage data={data} />}
                            {activeTab === 'gallery' && <GalleryPage data={data} />}
                            {activeTab === 'gift' && <GiftPage data={data} />}
                            {activeTab === 'rsvp' && <RSVPPage data={data} guest={guest} onAddRSVP={onAddRSVP} rsvps={rsvps} />}
                        </div>
                    </div>
                </div>

                <NavBar activeTab={activeTab} setTab={setActiveTab} data={data} />

                {/* Music Toggle */}
                <button
                    onClick={toggleMusic}
                    className="fixed top-20 right-6 md:top-10 md:right-10 z-[60] w-10 h-10 bg-black/50 border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                >
                    {music ? <Music className="animate-spin-slow" size={16} /> : <Play size={16} />}
                </button>
            </div>
        </div>
    );
};

export default NetflixLuxuryLayout;

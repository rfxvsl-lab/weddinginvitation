import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    PiPenNibDuotone as QuoteIcon,
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

    /* 3. Stage Entrance (Smooth) */
    @keyframes stage-enter {
      0% { transform: scale(0.95) translateY(40px); opacity: 0; filter: blur(10px); }
      100% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
    }

    /* Rope Snapping Physics */
    @keyframes rope-uncoil-left {
      0% { transform: scaleX(1) rotate(0deg); opacity: 1; }
      10% { transform: scaleX(1.1) translateX(10px); } /* tug */
      100% { transform: scaleX(0.5) translateX(-50vw) translateY(50vh) rotate(-60deg); opacity: 0; }
    }
    @keyframes rope-uncoil-right {
      0% { transform: scaleX(1) rotate(0deg); opacity: 1; }
      10% { transform: scaleX(1.1) translateX(-10px); }
      100% { transform: scaleX(0.5) translateX(50vw) translateY(50vh) rotate(60deg); opacity: 0; }
    }
    @keyframes button-fall {
      0% { transform: translateY(0) scale(1) rotate(0); opacity: 1; }
      20% { transform: translateY(-20px) scale(1.1) rotate(0); opacity: 1; }
      100% { transform: translateY(100vh) scale(0.8) rotate(45deg); opacity: 0; }
    }

    /* CLASSES */
    .animate-curtain-l { animation: curtain-left-open 3s 0.8s cubic-bezier(0.77, 0, 0.175, 1) forwards; }
    .animate-curtain-r { animation: curtain-right-open 3s 0.8s cubic-bezier(0.77, 0, 0.175, 1) forwards; }
    .animate-rope-l { animation: rope-uncoil-left 1.5s cubic-bezier(0.5, 0, 0.2, 1) forwards; }
    .animate-rope-r { animation: rope-uncoil-right 1.5s cubic-bezier(0.5, 0, 0.2, 1) forwards; }
    .animate-button-fall { animation: button-fall 1.5s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards; }
    .animate-stage-up { animation: stage-enter 1.5s 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
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

const TopSwagRopes = () => {
    return (
        <div className="absolute top-0 left-0 w-full z-40 pointer-events-none h-[120px] overflow-visible">
            <svg viewBox="0 0 1000 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="rope-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#AA771C" />
                        <stop offset="25%" stopColor="#FFF2CD" />
                        <stop offset="50%" stopColor="#5E4006" />
                        <stop offset="75%" stopColor="#FFDF73" />
                        <stop offset="100%" stopColor="#AA771C" />
                    </linearGradient>
                    <filter id="rope-shadow">
                        <feDropShadow dx="0" dy="15" stdDeviation="15" floodColor="#000" floodOpacity="1" />
                    </filter>
                </defs>
                
                {/* Back Rope (Lower, Thinner) */}
                <motion.path 
                    initial={{ d: "M -50 -10 Q 250 -10, 500 -10 Q 750 -10, 1050 -10" }}
                    animate={{ d: "M -50 -10 Q 250 180, 500 60 Q 750 180, 1050 -10" }}
                    transition={{ duration: 2.5, delay: 1.2, type: "spring", stiffness: 40, damping: 6 }}
                    fill="none"
                    stroke="url(#rope-grad)"
                    strokeWidth="4"
                    opacity="0.6"
                    filter="url(#rope-shadow)"
                />

                {/* Front Rope (Thick) */}
                <motion.path 
                    initial={{ d: "M -50 -5 Q 250 -5, 500 -5 Q 750 -5, 1050 -5" }}
                    animate={{ d: "M -50 -5 Q 250 140, 500 30 Q 750 140, 1050 -5" }}
                    transition={{ duration: 2, delay: 1.3, type: "spring", stiffness: 50, damping: 7 }}
                    fill="none"
                    stroke="url(#rope-grad)"
                    strokeWidth="8"
                    filter="url(#rope-shadow)"
                />
            </svg>
        </div>
    );
};

const FlowerNode = ({ cx, cy, customDelay, size = 1, shadowId = "flower-shadow" }: { cx: number, cy: number, customDelay: number, size?: number, shadowId?: string }) => {
    const bloomVariants: any = {
        hidden: { scale: 0, rotate: -180, opacity: 0, x: cx, y: cy },
        visible: (custom: number) => ({
            scale: size, 
            rotate: 0,
            opacity: 1,
            x: cx,
            y: cy,
            transition: { delay: custom, type: "spring", stiffness: 60, damping: 10, mass: 1 }
        })
    };

    return (
        <motion.g custom={customDelay} initial="hidden" animate="visible" variants={bloomVariants}>
            <path d="M 0 0 C -8 -14, 8 -14, 0 0 C 14 -8, 14 8, 0 0 C 8 14, -8 14, 0 0 C -14 8, -14 -8, 0 0" fill="#ffffff" filter={`url(#${shadowId})`} />
            <path d="M 0 0 C -6 -10, 6 -10, 0 0 C 10 -6, 10 6, 0 0 C 6 10, -6 10, 0 0 C -10 6, -10 -6, 0 0" fill="#fdfdfd" transform="rotate(45)" />
            <circle cx="0" cy="0" r="2.5" fill="#D4AF37" />
            <circle cx="0" cy="0" r="1" fill="#fff" opacity="0.8" />
        </motion.g>
    );
};

const RedRoseNode = ({ cx, cy, customDelay, size = 1, shadowId = "flower-shadow" }: { cx: number, cy: number, customDelay: number, size?: number, shadowId?: string }) => {
    const bloomVariants: any = {
        hidden: { scale: 0, rotate: 180, opacity: 0, x: cx, y: cy },
        visible: (custom: number) => ({
            scale: size, 
            rotate: 0,
            opacity: 1,
            x: cx,
            y: cy,
            transition: { delay: custom, type: "spring", stiffness: 50, damping: 12, mass: 1 }
        })
    };

    return (
        <motion.g custom={customDelay} initial="hidden" animate="visible" variants={bloomVariants}>
            <path d="M 0 0 C -10 -15, 10 -15, 0 0 C 15 -10, 15 10, 0 0 C 10 15, -10 15, 0 0 C -15 10, -15 -10, 0 0" fill="#600" filter={`url(#${shadowId})`} />
            <path d="M 0 0 C -8 -12, 8 -12, 0 0 C 12 -8, 12 8, 0 0 C 8 12, -8 12, 0 0 C -12 8, -12 -8, 0 0" fill="#8B0000" transform="rotate(45)" />
            <path d="M 0 0 C -5 -8, 5 -8, 0 0 C 8 -5, 8 5, 0 0 C 5 8, -5 8, 0 0 C -8 5, -8 -5, 0 0" fill="#a0142b" transform="rotate(20)" />
            <circle cx="0" cy="0" r="1.5" fill="#D4AF37" />
        </motion.g>
    );
};

const RealisticPeelCorner = () => {
    return (
        <motion.div 
            className="absolute bottom-0 right-0 w-16 h-16 md:w-20 md:h-20 z-20 pointer-events-none"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 40, damping: 8 }}
            style={{ transformOrigin: 'bottom right' }}
        >
            {/* The mask that hides the card's actual corner */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#fdfdfd] from-[50%] to-[50%]"></div>
            {/* The curled flap */}
            <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-[#fff] via-[#e6e6e6] to-transparent rounded-tl-[100%] shadow-[-5px_-5px_15px_rgba(0,0,0,0.3)] border-t border-l border-white/50"></div>
            {/* Inner highlight for 3D effect */}
            <div className="absolute bottom-0 right-0 w-[95%] h-[95%] bg-gradient-to-tl from-transparent via-white/50 to-transparent rounded-tl-[100%]"></div>
        </motion.div>
    );
};

const QuillSVG = ({ className }: { className?: string }) => (
    <motion.svg viewBox="0 0 100 100" className={className}
        initial={{ opacity: 0, rotate: -20, x: 30, y: 30 }}
        animate={{ opacity: 1, rotate: 0, x: 0, y: 0 }}
        transition={{ delay: 0.8, duration: 1, type: "spring" }}
    >
        <filter id="quill-shadow"><feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3"/></filter>
        <g filter="url(#quill-shadow)">
            <path d="M78.5,12.5 C78.5,12.5 86.5,23.5 83.5,41.5 C80.5,59.5 59.5,82.5 19.5,95.5 C19.5,95.5 35.5,74.5 49.5,56.5 C63.5,38.5 73.5,24.5 78.5,12.5 Z" fill="#222" />
            <path d="M19.5,95.5 L28.5,86.5 L12.5,78.5 Z" fill="#D4AF37" />
            <path d="M12.5,78.5 L5.5,98.5 L19.5,95.5 Z" fill="#8B6508" />
            <path d="M 80 20 L 73 25 M 75 35 L 68 40 M 68 50 L 58 55 M 63 20 L 68 25 M 53 35 L 58 40" stroke="#fdfdfd" strokeWidth="0.8" opacity="0.5"/>
            {/* Ink drops */}
            <circle cx="10" cy="88" r="1.5" fill="#222" />
            <circle cx="15" cy="94" r="1" fill="#222" />
            <circle cx="6" cy="98" r="2" fill="#222" />
        </g>
    </motion.svg>
);

const MagicQuill = ({ activeTab }: { activeTab: string }) => {
    const isQuote = activeTab === 'quote';
    const isRsvp = activeTab === 'rsvp';

    return (
        <motion.div
            className="absolute z-[100] pointer-events-none"
            initial={false}
            animate={{
                opacity: (isQuote || isRsvp) ? 1 : 0,
                x: isQuote ? "min(220px, 35vw)" : isRsvp ? "-100px" : 0,
                y: isQuote ? "min(220px, 35vh)" : isRsvp ? "-140px" : 0,
                scale: isQuote ? 1 : isRsvp ? 0.8 : 0.5,
            }}
            transition={{ type: "spring", stiffness: 30, damping: 10, mass: 1 }}
            style={{ top: "50%", left: "50%", marginTop: "-20px", marginLeft: "-20px" }}
        >
            <motion.div
                animate={
                    isRsvp 
                    ? {
                        x: [0, 200, 0, 220, 0, 200, 0, 220, 0],
                        y: [0, 0, 10, 10, 90, 90, 100, 100, 220],
                        rotate: [-10, 15, -5, 20, -10, 10, -15, 5, -10],
                      }
                    : { x: 0, y: 0, rotate: 0 }
                }
                transition={
                    isRsvp
                    ? { duration: 10, repeat: Infinity, ease: "easeInOut" }
                    : { type: "spring", stiffness: 50, damping: 10 }
                }
            >
                <QuillSVG className="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl origin-bottom-left" />
            </motion.div>
        </motion.div>
    );
};

const WhiteFlowerCluster = ({ className, position = "top-left" }: { className?: string, position?: "top-left" | "bottom-right" }) => {
    return (
        <svg viewBox="0 0 50 50" className={className} overflow="visible">
            {position === "top-left" && (
                <>
                    <Leaf cx={15} cy={30} angle={-15} scale={1.2} customDelay={0.5} />
                    <FlowerNode cx={15} cy={15} size={1.2} customDelay={0.7} />
                    <FlowerNode cx={30} cy={20} size={0.7} customDelay={0.9} />
                </>
            )}
            {position === "bottom-right" && (
                <>
                    <Leaf cx={35} cy={20} angle={165} scale={1.2} customDelay={0.8} />
                    <FlowerNode cx={35} cy={35} size={1.2} customDelay={1.0} />
                    <FlowerNode cx={20} cy={30} size={0.7} customDelay={1.2} />
                </>
            )}
        </svg>
    );
};

const WrappingVine = ({ className }: { className?: string }) => (
    <svg className={className} overflow="visible">
        <defs><filter id="v-shadow"><feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.4" /></filter></defs>
        <motion.rect x="5" y="5" width="calc(100% - 10px)" height="calc(100% - 10px)" rx="10" fill="none" stroke="#e0e0e0" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, ease: "easeOut" }} filter="url(#v-shadow)" />
        <motion.rect x="15" y="15" width="calc(100% - 30px)" height="calc(100% - 30px)" rx="5" fill="none" stroke="#fff" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, delay: 0.5, ease: "easeOut" }} filter="url(#v-shadow)" strokeDasharray="15 15" />
        <motion.rect x="0" y="10" width="100%" height="calc(100% - 20px)" rx="15" fill="none" stroke="#D4AF37" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3.5, delay: 1, ease: "easeOut" }} filter="url(#v-shadow)" strokeDasharray="5 25" />
    </svg>
);

const CornerRedRoseCluster = ({ className, position = "top-left" }: { className?: string, position?: "top-left" | "bottom-right" }) => {
    return (
        <svg viewBox="0 0 50 50" className={className} overflow="visible">
            <defs>
                <filter id="rose-shadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
                </filter>
            </defs>
            {position === "top-left" && (
                <>
                    <Leaf cx={15} cy={30} angle={-15} scale={1.5} customDelay={0.5} color="#8b7b51" />
                    <Leaf cx={30} cy={15} angle={45} scale={1.3} customDelay={0.6} color="#a69466" />
                    <RedRoseNode cx={15} cy={15} size={1.8} customDelay={0.7} shadowId="rose-shadow" />
                    <RedRoseNode cx={35} cy={20} size={1} customDelay={0.9} shadowId="rose-shadow" />
                </>
            )}
            {position === "bottom-right" && (
                <>
                    <Leaf cx={35} cy={20} angle={165} scale={1.5} customDelay={0.8} color="#8b7b51" />
                    <Leaf cx={20} cy={35} angle={225} scale={1.3} customDelay={0.9} color="#a69466" />
                    <RedRoseNode cx={35} cy={35} size={1.8} customDelay={1.0} shadowId="rose-shadow" />
                    <RedRoseNode cx={15} cy={30} size={1} customDelay={1.2} shadowId="rose-shadow" />
                </>
            )}
        </svg>
    );
};

const Leaf = ({ cx, cy, customDelay, angle, scale=1, color="#e8e8e8" }: { cx: number, cy: number, customDelay: number, angle: number, scale?: number, color?: string }) => {
    const variants: any = {
        hidden: { scale: 0, opacity: 0, x: cx, y: cy, rotate: angle - 45 },
        visible: (custom: number) => ({
            scale: scale, opacity: 1, x: cx, y: cy, rotate: angle,
            transition: { delay: custom, type: "spring", stiffness: 40, damping: 10 }
        })
    };
    return (
        <motion.g custom={customDelay} initial="hidden" animate="visible" variants={variants}>
            <path d="M 0 0 Q 5 -10 15 -5 Q 5 5 0 0 Z" fill={color} />
        </motion.g>
    );
};

const WhiteFloralWreath = ({ className }: { className?: string }) => {
    return (
        <svg viewBox="0 0 200 300" className={className} overflow="visible">
            <defs>
                <filter id="flower-shadow">
                    <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000" floodOpacity="0.5" />
                </filter>
            </defs>
            {/* Main Oval Vine Wreath */}
            <ellipse cx="100" cy="150" rx="105" ry="155" fill="none" stroke="#fcfcfc" strokeWidth="2.5" opacity="0.9" filter="url(#flower-shadow)"/>
            <ellipse cx="100" cy="150" rx="95" ry="145" fill="none" stroke="#e0e0e0" strokeWidth="1.5" opacity="0.7" filter="url(#flower-shadow)"/>
            
            {/* Winding Roots/Vines */}
            <path d="M 5 150 Q 5 50 100 -5 Q 195 50 195 150 Q 195 250 100 305 Q 5 250 5 150" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" strokeDasharray="10 5" />
            
            {/* Top Left Cluster */}
            <Leaf cx={20} cy={60} angle={-45} scale={1.2} customDelay={0.7} color="#e8e8e8" />
            <Leaf cx={20} cy={60} angle={20} scale={1} customDelay={0.75} color="#f4f4f4" />
            <FlowerNode cx={20} cy={60} size={0.9} customDelay={0.8} shadowId="flower-shadow" />
            <FlowerNode cx={12} cy={50} size={0.6} customDelay={0.9} shadowId="flower-shadow" />
            <FlowerNode cx={32} cy={65} size={0.5} customDelay={1.0} shadowId="flower-shadow" />
            
            {/* Bottom Right Cluster */}
            <Leaf cx={180} cy={240} angle={135} scale={1.3} customDelay={1.0} color="#e8e8e8" />
            <Leaf cx={180} cy={240} angle={200} scale={1.1} customDelay={1.05} color="#f4f4f4" />
            <FlowerNode cx={180} cy={240} size={1} customDelay={1.1} shadowId="flower-shadow" />
            <FlowerNode cx={192} cy={230} size={0.7} customDelay={1.2} shadowId="flower-shadow" />
            <FlowerNode cx={170} cy={252} size={0.6} customDelay={1.3} shadowId="flower-shadow" />

            {/* Small accent flowers (Top Right) */}
            <Leaf cx={160} cy={40} angle={45} scale={0.7} customDelay={1.3} color="#e8e8e8" />
            <FlowerNode cx={160} cy={40} size={0.5} customDelay={1.4} shadowId="flower-shadow" />
            
            {/* Small accent flowers (Bottom Left) */}
            <Leaf cx={40} cy={260} angle={225} scale={0.8} customDelay={1.5} color="#e8e8e8" />
            <FlowerNode cx={40} cy={260} size={0.6} customDelay={1.6} shadowId="flower-shadow" />
        </svg>
    );
};

const SquareFloralVines = ({ className }: { className?: string }) => {
    return (
        <svg viewBox="0 0 100 125" className={className} overflow="visible">
            <defs>
                <filter id="flower-shadow-sq">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
                </filter>
            </defs>
            
            {/* LEFT VINE (From Top to Bottom Edge) */}
            <path d="M 0 0 Q -10 20 5 40 T 0 80 Q 10 100 0 125" fill="none" stroke="#e0e0e0" strokeWidth="1" opacity="0.6"/>
            <path d="M 0 0 Q 10 25 -5 50 T 5 90 Q -10 110 0 125" fill="none" stroke="#fff" strokeWidth="1.5" filter="url(#flower-shadow-sq)"/>
            
            {/* Left Vine Foliage */}
            <Leaf cx={5} cy={40} angle={-30} scale={0.8} customDelay={1.1} color="#e8e8e8" />
            <Leaf cx={5} cy={40} angle={60} scale={0.6} customDelay={1.15} color="#f4f4f4" />
            <FlowerNode cx={5} cy={40} size={0.6} customDelay={1.2} />
            
            <Leaf cx={0} cy={80} angle={20} scale={0.7} customDelay={1.3} color="#e8e8e8" />
            <Leaf cx={0} cy={80} angle={120} scale={0.5} customDelay={1.35} color="#f4f4f4" />
            <FlowerNode cx={0} cy={80} size={0.5} customDelay={1.4} />
            
            <Leaf cx={8} cy={105} angle={-60} scale={0.6} customDelay={1.5} color="#e8e8e8" />
            <FlowerNode cx={8} cy={105} size={0.4} customDelay={1.6} />

            {/* RIGHT VINE (From Bottom to Top Edge) */}
            <path d="M 100 125 Q 110 105 95 85 T 100 45 Q 90 25 100 0" fill="none" stroke="#e0e0e0" strokeWidth="1" opacity="0.6"/>
            <path d="M 100 125 Q 90 100 105 75 T 95 35 Q 110 15 100 0" fill="none" stroke="#fff" strokeWidth="1.5" filter="url(#flower-shadow-sq)"/>
            
            {/* Right Vine Foliage */}
            <Leaf cx={95} cy={85} angle={150} scale={0.8} customDelay={1.2} color="#e8e8e8" />
            <Leaf cx={95} cy={85} angle={240} scale={0.6} customDelay={1.25} color="#f4f4f4" />
            <FlowerNode cx={95} cy={85} size={0.6} customDelay={1.3} />
            
            <Leaf cx={100} cy={45} angle={110} scale={0.7} customDelay={1.4} color="#e8e8e8" />
            <Leaf cx={100} cy={45} angle={30} scale={0.5} customDelay={1.45} color="#f4f4f4" />
            <FlowerNode cx={100} cy={45} size={0.5} customDelay={1.5} />
            
            <Leaf cx={92} cy={20} angle={200} scale={0.6} customDelay={1.6} color="#e8e8e8" />
            <FlowerNode cx={92} cy={20} size={0.4} customDelay={1.7} />
        </svg>
    );
};

const GoldenCrown3D = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className}>
        <defs>
            <linearGradient id="gold-3d" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF2CD" />
                <stop offset="25%" stopColor="#D4AF37" />
                <stop offset="50%" stopColor="#FFDF73" />
                <stop offset="75%" stopColor="#AA771C" />
                <stop offset="100%" stopColor="#5E4006" />
            </linearGradient>
            <filter id="shadow-3d">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.6"/>
            </filter>
        </defs>
        <path d="M10 80 L90 80 L95 90 L5 90 Z" fill="url(#gold-3d)" filter="url(#shadow-3d)"/>
        <path d="M15 80 L10 40 L30 60 L50 20 L70 60 L90 40 L85 80 Z" fill="url(#gold-3d)" filter="url(#shadow-3d)"/>
        <circle cx="10" cy="35" r="5" fill="#FFF" opacity="0.8"/>
        <circle cx="50" cy="15" r="7" fill="#FFF" opacity="0.9"/>
        <circle cx="90" cy="35" r="5" fill="#FFF" opacity="0.8"/>
    </svg>
);

const TasselRope = ({ side, className }: { side: 'left' | 'right', className?: string }) => (
    <svg viewBox="0 0 100 20" className={`w-32 h-6 ${className}`} preserveAspectRatio="none">
        <path d="M0 10 Q50 15 100 10" fill="none" stroke="url(#gold-3d)" strokeWidth="2" strokeLinecap="round" />
        <circle cx={side === 'left' ? 95 : 5} cy="10" r="4" fill="#D4AF37" filter="url(#shadow-3d)" />
    </svg>
);

const ElegantDivider = ({ className }: { className?: string }) => (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#D4AF37]" fill="currentColor">
            <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
        </svg>
        <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
    </div>
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
    const [isSnapping, setIsSnapping] = useState(false);
    const [isOpening, setIsOpening] = useState(false);

    const handleOpen = () => {
        setIsSnapping(true); // Snap ropes instantly
        setTimeout(() => {
            setIsOpening(true); // Curtains start moving after delay
        }, 500);
        setTimeout(onOpen, 3500); // Trigger next stage
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-1000 ${isOpening ? 'pointer-events-none' : ''}`}>

            {/* Left Curtain */}
            <div className={`absolute top-0 left-0 w-1/2 h-full bg-[#4a0404] origin-left z-20 ${isOpening ? 'animate-curtain-l' : ''}`}>
                <CurtainSVG side="left" />
                <TasselRope side="left" className={`absolute top-1/2 right-0 transform -translate-y-1/2 origin-right ${isSnapping ? 'animate-rope-l' : ''}`} />
            </div>

            {/* Right Curtain */}
            <div className={`absolute top-0 right-0 w-1/2 h-full bg-[#4a0404] origin-right z-20 ${isOpening ? 'animate-curtain-r' : ''}`}>
                <CurtainSVG side="right" />
                <TasselRope side="right" className={`absolute top-1/2 left-0 transform -translate-y-1/2 origin-left ${isSnapping ? 'animate-rope-r' : ''}`} />
            </div>

            {/* Center Crown Button */}
            <div className={`relative z-30 transition-all duration-1000 ${isSnapping ? 'animate-button-fall' : 'scale-100 opacity-100'}`}>
                <div className="relative group cursor-pointer" onClick={handleOpen}>
                    <div className="absolute inset-0 bg-[#FFD700] rounded-full blur-[40px] opacity-20 group-hover:opacity-50 transition-opacity animate-pulse"></div>
                    
                    <div className="relative flex flex-col items-center justify-center transform group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
                        <GoldenCrown3D className="w-24 h-24 mb-1 drop-shadow-[0_0_20px_#FFD700]" />
                        <span className="font-grand text-[#D4AF37] text-xs tracking-[0.6em] drop-shadow-[0_2px_4px_rgba(0,0,0,1)] bg-black/60 px-4 py-1 rounded border border-[#D4AF37]/50 backdrop-blur-sm shadow-[0_0_15px_#FFD700]">OPEN</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Navbar (Gold Bar)
const NavBar = ({ activeTab, setTab, data }: { activeTab: string, setTab: (t: string) => void, data: WeddingData }) => {
    const items = [
        { id: 'home', icon: Home, visible: true },
        { id: 'quote', icon: QuoteIcon, visible: !!data?.quoteText },
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
        <div className="h-full w-full overflow-y-auto hide-scrollbar flex flex-col items-center justify-start text-center p-6 pt-12 pb-32 relative">
            {/* Elegant Corner Frames */}
            <div className="absolute inset-4 pointer-events-none min-h-[600px]">
                <div className="absolute top-0 left-0 w-12 h-12 border-t-[1px] border-l-[1px] border-[#D4AF37]"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-[1px] border-r-[1px] border-[#D4AF37]"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[1px] border-l-[1px] border-[#D4AF37]"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[1px] border-r-[1px] border-[#D4AF37]"></div>
                <div className="absolute inset-2 border border-[#D4AF37]/20"></div>
            </div>

            <h3 className="font-grand text-xs tracking-[0.4em] text-[#8B6508] mb-4 uppercase relative z-10 shrink-0">The Wedding Celebration</h3>

            <div className="relative mb-8 shrink-0">
                <h1 className="font-luxury text-5xl md:text-8xl text-gold-luxury drop-shadow-sm leading-none">
                    {groomName}
                </h1>
                <h2 className="font-grand text-2xl md:text-5xl text-[#D4AF37] my-[-5px] italic drop-shadow-md">
                    &
                </h2>
                <h1 className="font-luxury text-5xl md:text-8xl text-gold-luxury drop-shadow-sm leading-none">
                    {brideName}
                </h1>
            </div>

            {/* Hero Image - Massive Realistic Gold Square Frame */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.5, duration: 1 }}
                className="relative w-64 h-[320px] md:w-80 md:h-[400px] shrink-0 mx-auto mb-12 mt-4"
            >
                {/* Thick Gold Frame Border */}
                <div className="absolute inset-[-12px] bg-gradient-to-br from-[#FFDF73] via-[#D4AF37] to-[#8B6508] shadow-[0_15px_30px_rgba(0,0,0,0.9)] -z-10 rounded-sm"></div>
                
                {/* Winding Vines/Flowers Ornament */}
                <SquareFloralVines className="absolute inset-[-25px] w-[calc(100%+50px)] h-[calc(100%+50px)] pointer-events-none z-20" />
                <div className="absolute inset-[-16px] bg-gradient-to-br from-[#FFDF73] via-[#D4AF37] to-[#8B6508] shadow-[0_20px_40px_rgba(0,0,0,0.8)] border border-[#5E4006] flex items-center justify-center p-3 z-0">
                    {/* Inner dark matting */}
                    <div className="w-full h-full bg-[#1a1a1a] border-4 border-[#3a2a0a] shadow-inner flex items-center justify-center p-2 relative">
                        {/* The actual photo */}
                        <div className="w-full h-full relative overflow-hidden border-2 border-[#D4AF37]/50 shadow-inner">
                            <img
                                src={getImageUrl(data?.bgImageUrl || data?.couple?.groom?.photoUrl || "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80")}
                                alt="Couple"
                                className="w-full h-full object-cover sepia-[0.2]"
                            />
                            <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.9)] pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {dateStr && (
                <div className="flex items-center gap-4 mb-8 font-grand text-gray-500 shrink-0">
                    <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
                    <span className="tracking-[0.3em] text-sm md:text-base font-bold text-[#D4AF37]">{dateStr}</span>
                    <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
                </div>
            )}
            
            {guestName && (
                <div className="mb-8 px-6 py-4 rounded border border-[#D4AF37]/30 bg-black/40 backdrop-blur shrink-0 max-w-sm w-full mx-auto">
                    <p className="font-grand text-[10px] tracking-widest text-[#8B6508] uppercase mb-1">Dear Guest,</p>
                    <p className="font-luxury text-xl text-white">{guestName}</p>
                </div>
            )}

            <button onClick={onEnter} className="shrink-0 mb-12 px-10 py-3 bg-[#1a1a1a] text-[#D4AF37] font-grand text-xs tracking-[0.2em] border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all uppercase shadow-lg">
                Enter Ballroom
            </button>
        </div>
    );
};

const CouplePage = ({ data }: { data: WeddingData }) => {
    return (
        <div className="h-full w-full overflow-y-auto hide-scrollbar p-6 pt-12 text-center relative pb-32">
            <h2 className="font-luxury text-4xl text-[#D4AF37] drop-shadow-sm mb-6">The Couple</h2>
            <ElegantDivider className="mb-10 opacity-80" />

            <div className="flex flex-col items-center justify-center gap-12 w-full max-w-2xl mx-auto">
                {/* Groom */}
                <div className="flex flex-col items-center w-full">
                    {/* Cameo Oval Frame */}
                    <div className="relative w-48 h-64 md:w-56 md:h-72 mb-6">
                        {/* Gold Oval Border */}
                        <div className="absolute inset-[-6px] bg-gradient-to-br from-[#FFDF73] via-[#D4AF37] to-[#8B6508] rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.9)] flex items-center justify-center p-[4px]">
                            {/* Inner Dark Border */}
                            <div className="w-full h-full rounded-full border-4 border-[#3a2a0a] bg-[#1a1a1a] p-1 flex items-center justify-center relative">
                                {/* The Photo */}
                                <div className="w-full h-full relative overflow-hidden rounded-full border border-[#D4AF37]/50">
                                    <img src={getImageUrl(data?.couple?.groom?.photoUrl || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80")} className="w-full h-full object-cover sepia-[0.2]" />
                                    <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] pointer-events-none rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        {/* White Floral Wreath */}
                        <WhiteFloralWreath className="absolute inset-0 w-full h-full scale-[1.15] pointer-events-none z-10 drop-shadow-2xl" />
                    </div>
                    {/* Text Area */}
                    <div className="text-center z-10">
                        <h3 className="font-luxury text-4xl text-[#D4AF37] mb-2">{data?.couple?.groom?.fullName}</h3>
                        <p className="font-grand text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-3">The Groom</p>
                        <p className="font-body text-xs text-gray-500 italic">Putra dari<br/>Bpk. {data?.couple?.groom?.fatherName} & Ibu {data?.couple?.groom?.motherName}</p>
                    </div>
                </div>

                {/* Separator */}
                <div className="flex items-center gap-6 my-2">
                    <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
                    <span className="font-grand text-4xl text-[#D4AF37] italic drop-shadow-md">&</span>
                    <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
                </div>

                {/* Bride */}
                <div className="flex flex-col items-center w-full">
                    {/* Cameo Oval Frame */}
                    <div className="relative w-48 h-64 md:w-56 md:h-72 mb-6">
                        {/* Gold Oval Border */}
                        <div className="absolute inset-[-6px] bg-gradient-to-br from-[#FFDF73] via-[#D4AF37] to-[#8B6508] rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.9)] flex items-center justify-center p-[4px]">
                            {/* Inner Dark Border */}
                            <div className="w-full h-full rounded-full border-4 border-[#3a2a0a] bg-[#1a1a1a] p-1 flex items-center justify-center relative">
                                {/* The Photo */}
                                <div className="w-full h-full relative overflow-hidden rounded-full border border-[#D4AF37]/50">
                                    <img src={getImageUrl(data?.couple?.bride?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80")} className="w-full h-full object-cover sepia-[0.2]" />
                                    <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] pointer-events-none rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        {/* White Floral Wreath */}
                        <WhiteFloralWreath className="absolute inset-0 w-full h-full scale-[1.15] pointer-events-none z-10 drop-shadow-2xl" />
                    </div>
                    {/* Text Area */}
                    <div className="text-center z-10">
                        <h3 className="font-luxury text-4xl text-[#D4AF37] mb-2">{data?.couple?.bride?.fullName}</h3>
                        <p className="font-grand text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-3">The Bride</p>
                        <p className="font-body text-xs text-gray-500 italic">Putri dari<br/>Bpk. {data?.couple?.bride?.fatherName} & Ibu {data?.couple?.bride?.motherName}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EventPage = ({ data }: { data: WeddingData }) => {
    return (
        <div className="h-full flex flex-col items-center pt-24 pb-32 px-6 overflow-y-auto hide-scrollbar bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
            <h2 className="font-luxury text-4xl text-[#D4AF37] drop-shadow-sm mb-12">Order of Events</h2>
            <div className="w-full max-w-2xl bg-gradient-to-b from-[#fffaf0] to-white border border-[#D4AF37]/40 p-8 shadow-lg relative">
                {/* Event Flowers */}
                <CornerRedRoseCluster position="top-left" className="absolute top-[-15px] left-[-15px] w-24 h-24 pointer-events-none z-20" />
                <CornerRedRoseCluster position="bottom-right" className="absolute bottom-[-15px] right-[-15px] w-24 h-24 pointer-events-none z-20" />
                
                {/* Ticket/Invitation Style */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-[#D4AF37]/30 rounded-full -translate-y-1/2 flex items-center justify-center shadow-inner">
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-[#D4AF37]/30 rounded-full translate-y-1/2 flex items-center justify-center shadow-inner">
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
                </div>

                <div className="space-y-10 py-4 px-2">
                    {data?.events?.akad?.enabled !== false && (
                        <div className="relative z-10">
                            <div className="flex items-center justify-center gap-3 text-[#8B6508] mb-4">
                                <Crown size={20} /> <span className="font-grand text-xs tracking-[0.3em] font-bold">CEREMONY</span>
                            </div>
                            <h3 className="font-luxury text-3xl mb-2 text-[#1a1a1a] font-bold">{data?.events?.akad?.name || 'Akad Nikah'}</h3>
                            <p className="font-grand tracking-widest text-[#5E4006] mb-4">{formatDate(data?.events?.akad?.date || '')} | {data?.events?.akad?.timeStart}</p>
                            
                            <div className="bg-white/80 p-4 border border-[#D4AF37]/10 rounded-sm">
                                <p className="font-body text-sm text-[#1a1a1a] font-bold mb-1">{data?.events?.akad?.venueName}</p>
                                <p className="font-body text-xs text-gray-500 leading-relaxed">{data?.events?.akad?.address}</p>
                            </div>
                        </div>
                    )}

                    {data?.events?.akad?.enabled !== false && data?.events?.resepsi?.enabled !== false && (
                        <ElegantDivider className="opacity-50" />
                    )}

                    {data?.events?.resepsi?.enabled !== false && (
                        <div className="relative z-10">
                            <div className="flex items-center justify-center gap-3 text-[#8B6508] mb-4">
                                <Gem size={20} /> <span className="font-grand text-xs tracking-[0.3em] font-bold">RECEPTION</span>
                            </div>
                            <h3 className="font-luxury text-3xl mb-2 text-[#1a1a1a] font-bold">{data?.events?.resepsi?.name || 'Resepsi'}</h3>
                            <p className="font-grand tracking-widest text-[#5E4006] mb-4">{formatDate(data?.events?.resepsi?.date || '')} | {data?.events?.resepsi?.timeStart}</p>
                            
                            <div className="bg-white/80 p-4 border border-[#D4AF37]/10 rounded-sm">
                                <p className="font-body text-sm text-[#1a1a1a] font-bold mb-1">{data?.events?.resepsi?.venueName}</p>
                                <p className="font-body text-xs text-gray-500 leading-relaxed">{data?.events?.resepsi?.address}</p>
                            </div>
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
        <h2 className="font-luxury text-4xl text-[#D4AF37] drop-shadow-sm mb-8 text-center">Moments</h2>
        <div className="columns-2 gap-4 w-full max-w-2xl mt-8">
            {data?.gallery?.map((img, idx) => (
                <div key={idx} className="relative mb-4 break-inside-avoid shadow-xl p-2 bg-[#fffaf0] border border-[#D4AF37]/40 group overflow-visible">
                    <img src={getImageUrl(img)} alt={`Gallery ${idx}`} className="w-full object-cover filter sepia-[0.2]" />
                    {idx % 2 === 0 && <WhiteFlowerCluster position="top-left" className="absolute top-[-25px] left-[-25px] w-20 h-20 z-20 pointer-events-none" />}
                    {idx % 2 !== 0 && <WhiteFlowerCluster position="bottom-right" className="absolute bottom-[-25px] right-[-25px] w-20 h-20 z-20 pointer-events-none" />}
                </div>
            ))}
        </div>
    </div>
);

const GiftPage = ({ data }: { data: WeddingData }) => {
    const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null);
    return (
        <div className="h-full w-full overflow-y-auto hide-scrollbar flex flex-col items-center justify-start p-6 pt-16 text-center pb-32">
            <div className="w-full max-w-sm shrink-0 bg-[#1a1a1a] text-[#D4AF37] p-8 rounded-lg shadow-2xl border border-[#D4AF37] relative overflow-visible mt-8">
                <WrappingVine className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] pointer-events-none z-20" />
                <CornerRedRoseCluster position="top-left" className="absolute top-[-25px] left-[-25px] w-20 h-20 pointer-events-none z-30" />
                
                <div className='absolute inset-0 opacity-10 bg-[url("https://www.transparenttextures.com/patterns/black-scales.png")] rounded-lg pointer-events-none'></div>
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
            <h2 className="font-luxury text-4xl text-[#D4AF37] drop-shadow-sm mb-6">R.S.V.P</h2>
            <ElegantDivider className="mb-8 opacity-80" />
            
            <div className="w-full max-w-md bg-white p-8 shadow-xl border border-[#D4AF37]/30 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] via-[#FFF2CD] to-[#D4AF37]"></div>
                
                <p className="text-gray-600 mb-8 text-sm font-body italic">We kindly request your response to celebrate with us.</p>
                
                {rsvpSuccess ? (
                    <div className="text-center py-6">
                        <div className="w-20 h-20 bg-[#FFF9E6] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#D4AF37] shadow-lg">
                            <Heart className="w-10 h-10 text-[#D4AF37] animate-pulse" />
                        </div>
                        <p className="font-luxury text-2xl text-[#333] mb-2">Thank You!</p>
                        <p className="font-body text-sm text-gray-500">Your confirmation has been received.</p>
                    </div>
                ) : (
                    <form onSubmit={handleRSVPSubmit} className="space-y-6 text-left">
                        <div className="bg-gray-50/50 p-4 border border-[#D4AF37]/10 rounded shadow-inner">
                            <label className="block text-[10px] font-grand text-[#8B6508] uppercase tracking-[0.2em] mb-2 font-bold">Nama Anda</label>
                            <input type="text" required value={rsvpGuestName} onChange={(e) => setRsvpGuestName(e.target.value)} disabled={!!guest} className="w-full border-b-2 border-gray-200 px-2 py-2 focus:outline-none focus:border-[#D4AF37] text-base font-body bg-transparent transition-colors" placeholder="Masukkan nama lengkap" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50/50 p-4 border border-[#D4AF37]/10 rounded shadow-inner">
                                <label className="block text-[10px] font-grand text-[#8B6508] uppercase tracking-[0.2em] mb-2 font-bold">Kehadiran</label>
                                <select value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value as any)} className="w-full border-b-2 border-gray-200 px-2 py-2 focus:outline-none focus:border-[#D4AF37] text-base font-body bg-transparent appearance-none transition-colors cursor-pointer">
                                    <option value="Hadir">Hadir</option>
                                    <option value="Tidak Hadir">Tidak Hadir</option>
                                    <option value="Ragu-ragu">Ragu-ragu</option>
                                </select>
                            </div>
                            <div className="bg-gray-50/50 p-4 border border-[#D4AF37]/10 rounded shadow-inner">
                                <label className="block text-[10px] font-grand text-[#8B6508] uppercase tracking-[0.2em] mb-2 font-bold">Jumlah Pax</label>
                                <input type="number" min="1" max={guest ? guest.paxLimit : 10} value={rsvpPaxCount} onChange={(e) => setRsvpPaxCount(Number(e.target.value))} className="w-full border-b-2 border-gray-200 px-2 py-2 focus:outline-none focus:border-[#D4AF37] text-base font-body bg-transparent transition-colors" />
                            </div>
                        </div>
                        <div className="bg-gray-50/50 p-4 border border-[#D4AF37]/10 rounded shadow-inner">
                            <label className="block text-[10px] font-grand text-[#8B6508] uppercase tracking-[0.2em] mb-2 font-bold">Ucapan & Doa</label>
                            <textarea required value={rsvpWishes} onChange={(e) => setRsvpWishes(e.target.value)} rows={3} className="w-full border-b-2 border-gray-200 px-2 py-2 focus:outline-none focus:border-[#D4AF37] text-base font-body bg-transparent resize-none transition-colors" placeholder="Tuliskan pesan indah Anda..." />
                        </div>
                        <button type="submit" className="w-full mt-6 py-4 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-[#D4AF37] font-grand text-xs tracking-[0.3em] uppercase hover:from-[#D4AF37] hover:to-[#FFDF73] hover:text-black transition-all shadow-xl rounded-sm border border-[#D4AF37]">
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
            <RealisticPeelCorner />
            
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#fdfdfd] px-4">
                <QuoteIcon className="w-8 h-8 text-[#D4AF37]" />
            </div>
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

    const renderTab = () => {
        switch(activeTab) {
            case 'home': return <HomePage onEnter={() => setActiveTab('event')} data={data} guestName={guestName} />;
            case 'quote': return <QuotePage data={data} />;
            case 'couple': return <CouplePage data={data} />;
            case 'event': return <EventPage data={data} />;
            case 'gallery': return <GalleryPage data={data} />;
            case 'gift': return <GiftPage data={data} />;
            case 'rsvp': return <RSVPPage data={data} guest={guest} onAddRSVP={onAddRSVP} rsvps={rsvps} />;
            default: return <HomePage onEnter={() => setActiveTab('event')} data={data} guestName={guestName} />;
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#0f0505] text-[#333]">
            <GlobalStyles />
            <audio ref={audioRef} loop src={data?.musicUrl || ASSETS.bgm} muted={embedded} />

            {/* LAYER 0: BALLROOM BACKGROUND (SILHOUETTES) */}
            <BallroomBackground customBg={getImageUrl(data?.bgImageUrl || '')} />

            {/* LAYER 1: CURTAIN STAGE */}
            {stage === 'curtain' && (
                <CurtainStage onOpen={startShow} />
            )}

            {/* LAYER 2: 3D MAIN STAGE (THE CARD) */}
            <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
                <AnimatePresence>
                    {stage === 'content' && (
                        <motion.div 
                            initial={{ opacity: 0, x: -50, filter: 'blur(10px)', scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)', scale: 1 }}
                            transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
                            className="relative z-10 w-full max-w-lg h-[90vh] md:h-[85vh] bg-[#1a1a1a] shadow-[0_0_100px_rgba(0,0,0,1)] border-[1px] border-[#D4AF37]/20 flex flex-col overflow-hidden"
                        >
                            {/* Universal Top Curtain Ropes */}
                            <TopSwagRopes />

                            {/* Inner Content Area */}
                            <div className="flex-1 overflow-hidden relative bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')] pb-24">
                                <MagicQuill activeTab={activeTab} />
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 1.05, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="h-full"
                                    >
                                        {renderTab()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                            
                            {/* Gold Footer Trim */}
                            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] z-50"></div>
                            
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Floating Controls */}
            {stage === 'content' && (
                <NavBar activeTab={activeTab} setTab={setActiveTab} data={data} />
            )}

            <button
                onClick={toggleMusic}
                className="fixed top-24 right-4 md:top-24 md:right-8 z-50 w-10 h-10 bg-white/10 backdrop-blur border border-[#D4AF37] rounded-full flex items-center justify-center text-[#FFD700] hover:bg-[#D4AF37] hover:text-black transition-all"
            >
                {music ? <Music className="animate-spin-slow" size={16} /> : <Play size={16} />}
            </button>
        </div>
    );
}

export default GrandBallroomLayout;

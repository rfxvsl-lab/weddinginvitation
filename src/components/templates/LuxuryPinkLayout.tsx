import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    PiHeartDuotone as Heart,
    PiCalendarDuotone as Calendar,
    PiMapPinDuotone as MapPin,
    PiMusicNotesDuotone as Music,
    PiPlayCircleDuotone as Play,
    PiPauseCircleDuotone as Pause,
    PiHouseDuotone as Home,
    PiUserDuotone as User,
    PiImageDuotone as ImageIcon,
    PiGiftDuotone as Gift,
    PiChatCircleDuotone as MessageCircle,
    PiCopyDuotone as Copy,
    PiCheckDuotone as Check,
    PiCaretDownDuotone as ChevronDown,
    PiCreditCardDuotone as CreditCard,
    PiPaperPlaneRightDuotone as Send,
    PiClockDuotone as Clock
} from 'react-icons/pi';
import { WeddingData, ThemeConfig, RSVP, Guest } from '../../types';

const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Nunito+Sans:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');

    /* Variables */
    :root {
      --primary: #be185d; /* Pink Rose 700 */
      --secondary: #fbcfe8; /* Pink 200 */
      --bg-cream: #fff1f2; /* Rose 50 */
      --gold: #d4af37;
    }

    body {
      font-family: 'Nunito Sans', sans-serif;
      background-color: var(--bg-cream);
      color: #4a4a4a;
      overflow-x: hidden;
    }
    
    /* CUSTOM BG OVERRIDE */
    .custom-bg {
        position: fixed;
        inset: 0;
        z-index: -2;
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
        filter: blur(6px);
        transform: scale(1.1);
        opacity: 0.7; /* Blend slightly with the creamy theme background */
    }

    h1, h2, h3 { font-family: 'Playfair Display', serif; }
    .font-script { font-family: 'Great Vibes', cursive; }

    /* Custom Text Glow for legibility on any background */
    .text-glow {
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.9), 0 1px 3px rgba(0, 0, 0, 0.4);
    }

    /* --- ENVELOPE ANIMATIONS (PURE CSS) --- */
    .envelope-wrapper {
      perspective: 1000px;
    }
    
    .envelope {
      transform-style: preserve-3d;
      transition: transform 1s ease-in-out;
    }

    /* Flap Animation */
    .flap {
      transform-origin: top;
      transition: transform 0.8s 0.2s ease-in-out, z-index 0.8s 0.2s;
    }
    
    .envelope.open .flap {
      transform: rotateX(180deg);
      z-index: 0;
    }

    /* Card Slide Up */
    .invitation-card {
      transition: transform 1s 1s ease-in-out;
    }
    
    .envelope.open .invitation-card {
      transform: translateY(-150px);
    }

    /* Container Fade Out */
    .envelope-container.fade-out {
      opacity: 0;
      pointer-events: none;
      transform: translateY(100vh);
      transition: all 1s 2s ease-in-out;
    }

    /* --- PAGE TRANSITIONS --- */
    .page-enter {
      animation: fadeIn 0.6s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Floating Hearts Background */
    @keyframes float {
      0% { transform: translateY(0) rotate(0deg); opacity: 0; }
      50% { opacity: 0.6; }
      100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
    }

    .heart-bg {
      position: fixed;
      bottom: -10vh;
      color: #fbcfe8;
      animation: float 15s linear infinite;
      z-index: -1;
    }

    .glass-panel {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 10px 30px rgba(190, 24, 93, 0.1);
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


interface EnvelopeProps {
    onOpen: () => void;
    groomName: string;
    brideName: string;
    guestName: string;
}

const EnvelopeOverlay: React.FC<EnvelopeProps> = ({ onOpen, groomName, brideName, guestName }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
        setTimeout(onOpen, 3500); // Wait for full animation sequence
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#ffe4e6] envelope-container ${isOpen ? 'fade-out' : ''}`}>
            <div className="relative w-[320px] h-[220px] envelope-wrapper">
                <div className={`relative w-full h-full envelope ${isOpen ? 'open' : ''}`}>

                    {/* Back of Envelope */}
                    <div className="absolute inset-0 bg-rose-700 rounded-b-xl shadow-2xl"></div>

                    {/* Invitation Card Inside */}
                    <div className="absolute top-2 left-2 right-2 h-[90%] bg-white rounded flex flex-col items-center justify-center p-4 shadow-md invitation-card z-10">
                        <h2 className="font-script text-4xl text-rose-600 mb-1">{groomName} & {brideName}</h2>
                        <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-bold">Wedding Invitation</p>
                        <Heart size={16} className="mt-4 text-rose-300" />
                    </div>

                    {/* Front Pockets (Left & Right) */}
                    <div className="absolute inset-0 z-20 pointer-events-none">
                        <div className="absolute bottom-0 left-0 w-full h-full bg-rose-600 rounded-bl-xl" style={{ clipPath: 'polygon(0 0, 50% 50%, 0 100%)' }}></div>
                        <div className="absolute bottom-0 right-0 w-full h-full bg-rose-500 rounded-br-xl" style={{ clipPath: 'polygon(100% 0, 50% 50%, 100% 100%)' }}></div>
                        <div className="absolute bottom-0 left-0 w-full h-full bg-rose-600 rounded-b-xl" style={{ clipPath: 'polygon(0 100%, 50% 50%, 100% 100%)' }}></div>
                    </div>

                    {/* Flap (Top) */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-rose-800 z-30 flap flex items-center justify-center rounded-t-xl origin-top" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}>
                        <button 
                            onClick={handleOpen} 
                            disabled={isOpen}
                            className={`absolute top-8 z-50 group flex flex-col items-center transition-opacity duration-500 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                        >
                            {/* Elegant Wax Seal */}
                            <div className="relative w-14 h-14 flex items-center justify-center hover:scale-110 transition-transform">
                                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[0_4px_8px_rgba(159,18,57,0.5)] text-rose-600" fill="currentColor">
                                    <path d="M50 5 C75 3 95 20 97 45 C99 70 80 95 50 97 C20 98 5 75 3 50 C1 20 20 7 50 5 Z" />
                                    <path d="M50 12 C68 10 85 22 87 45 C89 68 72 85 50 87 C25 89 12 70 12 50 C12 25 25 15 50 12 Z" fill="#9f1239" />
                                </svg>
                                <svg viewBox="0 0 24 24" className="relative w-6 h-6 text-rose-200 opacity-90 drop-shadow-sm" fill="currentColor">
                                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" />
                                </svg>
                            </div>
                            <span className="block text-center text-white text-[9px] font-bold mt-3 tracking-[0.3em] animate-pulse">BUKA</span>
                        </button>
                    </div>

                </div>
            </div>

            {!isOpen && (
                <div className="absolute bottom-20 text-center px-4 w-full">
                    <h1 className="font-script text-5xl text-rose-600 mb-2">{guestName}</h1>
                    <p className="text-rose-800 text-sm tracking-widest mt-4">SPECIAL INVITATION</p>
                </div>
            )}
        </div>
    );
};

// 2. Navigation Bar
interface NavbarProps {
    activeTab: string;
    setTab: (tab: string) => void;
    data: WeddingData;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setTab, data }) => {
    const items = [
        { id: 'home', icon: Home, label: 'Home', visible: true },
        { id: 'couple', icon: User, label: 'Couple', visible: true },
        { id: 'event', icon: Calendar, label: 'Event', visible: (data?.events?.akad?.enabled !== false || data?.events?.resepsi?.enabled !== false) },
        { id: 'gallery', icon: ImageIcon, label: 'Gallery', visible: !!(data?.gallery && data.gallery.length > 0) },
        { id: 'gift', icon: Gift, label: 'Gift', visible: !!(data?.gifts && data.gifts.length > 0) },
        { id: 'rsvp', icon: MessageCircle, label: 'RSVP', visible: true },
    ].filter(item => item.visible);

    return (
        <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, type: "spring", bounce: 0.3 }}
            className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-rose-100 z-40 px-2 py-3 pb-6 md:pb-3 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]"
        >
            <div className="max-w-md mx-auto flex justify-between items-center px-4">
                {items.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setTab(tab.id)}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 p-2 rounded-lg ${activeTab === tab.id ? 'text-rose-600 -translate-y-2' : 'text-gray-400 hover:text-rose-400'}`}
                    >
                        <tab.icon size={activeTab === tab.id ? 24 : 20} className={activeTab === tab.id ? 'text-rose-600' : ''} />
                        <span className="text-[10px] font-semibold">{tab.label}</span>
                    </button>
                ))}
            </div>
        </motion.div>
    );
};

// --- ORNAMEN BUNGA BERBELIT ---
const CreamyVineOrnament = ({ variant = 'A', className = "", size = "w-56 h-56" }: { variant?: 'A' | 'B' | 'C', className?: string, size?: string }) => {
    // 3 model bunga berbelit yang sangat panjang (viewbox 200x200)
    const paths = {
        A: [
            "M 10,190 C 10,120 40,90 60,60 C 80,30 140,20 190,10", 
            "M 30,200 C 20,130 50,100 70,70 C 90,40 150,30 200,30"
        ],
        B: [
            "M 190,10 C 190,80 160,110 140,140 C 120,170 60,180 10,190", 
            "M 170,0 C 180,70 150,100 130,130 C 110,160 50,170 0,170"
        ],
        C: [
            "M 10,10 C 10,80 40,110 60,140 C 80,170 140,180 190,190", 
            "M 30,0 C 20,70 50,100 70,130 C 90,160 150,170 200,170"
        ]
    };
    
    const center = { A: { x: 60, y: 60 }, B: { x: 140, y: 140 }, C: { x: 60, y: 140 } };
    const c = center[variant];

    return (
        <div className={`absolute pointer-events-none z-20 overflow-visible ${size} ${className}`}>
            <motion.svg viewBox="0 0 200 200" className="w-full h-full overflow-visible" fill="none">
                {/* Tangkai Berbelit Panjang */}
                <motion.path 
                    d={paths[variant][0]} stroke="#fecdd3" strokeWidth="6" strokeLinecap="round" fill="none"
                    initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeOut" }} 
                />
                <motion.path 
                    d={paths[variant][1]} stroke="#fda4af" strokeWidth="3" strokeLinecap="round" fill="none"
                    initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.3, ease: "easeOut" }} 
                />
                
                {/* Bunga Mekar Nutup (Skala Diperbesar) */}
                <motion.g 
                    initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ delay: 1, duration: 0.8 }}
                    style={{ transformOrigin: `${c.x}px ${c.y}px` }}
                >
                    <motion.g animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                        {/* Kelopak Luar */}
                        <path d={`M ${c.x},${c.y} m -18,-18 c 22,-22 45,0 18,18 c 22,22 0,45 -18,18 c -22,22 -45,0 -18,-18 c -22,-22 0,-45 18,-18 z`} fill="#fb7185" opacity="0.85" />
                        {/* Kelopak Dalam */}
                        <path d={`M ${c.x},${c.y} m -12,-12 c 15,-15 30,0 12,12 c 15,15 0,30 -12,12 c -15,15 -30,0 -12,-12 c -15,-15 0,-30 12,-12 z`} fill="#f43f5e" />
                        {/* Inti */}
                        <circle cx={c.x} cy={c.y} r="5" fill="#ffe4e6" />
                    </motion.g>
                </motion.g>
                
                {/* Daun Kecil */}
                <motion.path 
                    d={`M ${c.x+20},${c.y-15} Q ${c.x+35},${c.y-40} ${c.x+50},${c.y-25} Q ${c.x+35},${c.y-10} ${c.x+20},${c.y-15} Z`} 
                    fill="#fecdd3"
                    initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 1.5 }} style={{ transformOrigin: `${c.x+20}px ${c.y-15}px` }}
                />
            </motion.svg>
        </div>
    );
};

// --- HALAMAN KONTEN ---

const Countdown = ({ targetDate }: { targetDate: string }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!targetDate) return;
        const target = new Date(targetDate);
        const timer = setInterval(() => {
            const now = new Date();
            const diff = target.getTime() - now.getTime();
            if (diff <= 0) return clearInterval(timer);

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    const Box = ({ val, label }: { val: number, label: string }) => (
        <div className="bg-rose-600 text-white rounded-lg p-3 w-16 text-center shadow-lg">
            <div className="text-xl font-bold">{val}</div>
            <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
        </div>
    );

    return (
        <div className="flex gap-3 justify-center my-8">
            <Box val={timeLeft.days} label="Hari" />
            <Box val={timeLeft.hours} label="Jam" />
            <Box val={timeLeft.minutes} label="Menit" />
            <Box val={timeLeft.seconds} label="Detik" />
        </div>
    );
};

const HomePage = ({ data, guestName }: { data: WeddingData, guestName: string }) => {
    const dateObj = new Date(data?.events?.akad?.date || data?.countdownDate || '');
    const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center pt-10 pb-24 px-6"
        >
            <motion.div 
                initial={{ opacity: 0, scale: 0 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                transition={{ type: "spring", bounce: 0.5 }}
                className="mb-6 animate-bounce text-rose-500 flex justify-center"
            >
                <ChevronDown />
            </motion.div>
            
            <motion.h3 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                className="text-rose-900 font-bold tracking-[0.2em] text-sm uppercase mb-4 text-glow"
            >
                The Wedding Of
            </motion.h3>
            
            <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="font-script text-7xl text-rose-600 mb-2 leading-tight text-glow"
            >
                {data?.couple?.groom?.nickname} & {data?.couple?.bride?.nickname}
            </motion.h1>
            
            <motion.p 
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="text-rose-950 font-bold italic mb-8 text-glow"
            >
                {dateStr}
            </motion.p>

            <motion.div 
                initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                className="my-10 relative mx-auto w-max !overflow-visible"
            >
                <CreamyVineOrnament variant="C" className="-bottom-8 -left-12" />
                <CreamyVineOrnament variant="B" className="-bottom-8 -right-12" />
                <div className="w-48 h-64 mx-auto rounded-t-full border-4 border-rose-200 p-2 overflow-hidden shadow-xl bg-white relative z-10">
                    <img src={getImageUrl(data?.bgImageUrl || data?.couple?.groom?.photoUrl || "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80")} alt="Couple" className="w-full h-full object-cover rounded-t-full hover:scale-110 transition-transform duration-700" />
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                <Countdown targetDate={data?.events?.akad?.date || data?.countdownDate || ''} />
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-center mt-8"
            >
                <p className="font-body text-xs font-bold uppercase tracking-widest text-rose-950 mb-2 text-glow">Kepada Yth,</p>
                <div className="inline-block bg-rose-50 px-6 py-2 rounded-full border border-rose-100">
                    <p className="font-bold text-rose-700 text-lg">{guestName}</p>
                </div>
            </motion.div>

            {data?.quoteText && (
                <motion.div 
                    initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                    className="glass-panel p-8 rounded-2xl mx-auto max-w-sm mt-12 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-200 via-rose-500 to-rose-200"></div>
                    <p className="font-serif text-lg leading-relaxed text-gray-700 italic">
                        "{data?.quoteText}"
                    </p>
                    <p className="mt-4 text-xs font-bold text-rose-600 uppercase tracking-widest">{data?.quoteSource}</p>
                </motion.div>
            )}
        </motion.div>
    );
};

const CouplePage = ({ data }: { data: WeddingData }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="pt-10 pb-24 px-6 text-center"
        >
            <motion.h2 
                initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }}
                className="font-script text-5xl text-rose-600 mb-12 text-glow"
            >
                Mempelai
            </motion.h2>

            {/* Groom */}
            <motion.div 
                initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
                className="glass-panel relative !overflow-visible p-6 rounded-2xl mb-8 transform hover:scale-[1.02] transition-transform"
            >
                <CreamyVineOrnament variant="A" className="-top-10 -left-10" />
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-rose-100 overflow-hidden mb-4 shadow-md relative z-10">
                    <img src={getImageUrl(data?.couple?.groom?.photoUrl || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80")} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{data?.couple?.groom?.fullName}</h3>
                <p className="text-rose-600 text-sm font-semibold mt-1">Putra dari Bpk. {data?.couple?.groom?.fatherName} & Ibu {data?.couple?.groom?.motherName}</p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }}
                className="font-script text-4xl text-rose-400 my-8 text-glow"
            >
                &
            </motion.div>

            {/* Bride */}
            <motion.div 
                initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
                className="glass-panel relative !overflow-visible p-6 rounded-2xl transform hover:scale-[1.02] transition-transform"
            >
                <CreamyVineOrnament variant="B" className="-bottom-10 -right-10" />
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-rose-100 overflow-hidden mb-4 shadow-md relative z-10">
                    <img src={getImageUrl(data?.couple?.bride?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80")} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{data?.couple?.bride?.fullName}</h3>
                <p className="text-rose-600 text-sm font-semibold mt-1">Putri dari Bpk. {data?.couple?.bride?.fatherName} & Ibu {data?.couple?.bride?.motherName}</p>
            </motion.div>
        </motion.div>
    );
};

const EventPage = ({ data }: { data: WeddingData }) => {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="pt-10 pb-24 px-6 text-center"
        >
            <motion.h2 
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                className="font-script text-5xl text-rose-600 mb-12 text-glow"
            >
                Rangkaian Acara
            </motion.h2>

            <div className="relative border-l-2 border-rose-200 ml-4 md:ml-auto md:mr-auto md:w-full md:max-w-md space-y-12">

                {/* Akad */}
                {data?.events?.akad?.enabled !== false && (
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
                        className="relative pl-8 text-left"
                    >
                        <div className="absolute -left-[9px] top-6 w-4 h-4 bg-rose-600 rounded-full border-4 border-white shadow z-10"></div>
                        <div className="bg-white relative !overflow-visible p-6 rounded-xl shadow-sm border border-rose-50">
                            <CreamyVineOrnament variant="C" className="-bottom-10 -left-10" />
                            <h3 className="text-2xl font-serif text-gray-800 mb-4 border-b border-rose-100 pb-2 relative z-10">{data?.events?.akad?.name || 'Akad Nikah'}</h3>
                            <div className="flex items-center gap-3 text-gray-600 mb-2 relative z-10">
                                <Calendar size={18} className="text-rose-500" /> <span>{formatDate(data?.events?.akad?.date || '')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 mb-2">
                                <Clock size={18} className="text-rose-500" /> <span>{data?.events?.akad?.timeStart} - {data?.events?.akad?.timeEnd}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-4 border-t pt-4 font-bold">{data?.events?.akad?.venueName}</p>
                            <p className="text-xs text-gray-500 mt-1">{data?.events?.akad?.address}</p>
                            {data?.events?.akad?.googleMapsUrl && <a href={data?.events?.akad?.googleMapsUrl} target="_blank" rel="noreferrer" className="text-xs text-rose-600 mt-2 block hover:underline">Lihat Lokasi</a>}
                        </div>
                    </motion.div>
                )}

                {/* Resepsi */}
                {data?.events?.resepsi?.enabled !== false && (
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative pl-8 text-left"
                    >
                        <div className="absolute -left-[9px] top-6 w-4 h-4 bg-rose-600 rounded-full border-4 border-white shadow z-10"></div>
                        <div className="bg-white relative !overflow-visible p-6 rounded-xl shadow-sm border border-rose-50">
                            <CreamyVineOrnament variant="A" className="-top-12 -left-10" />
                            <h3 className="text-2xl font-serif text-gray-800 mb-4 border-b border-rose-100 pb-2 relative z-10">{data?.events?.resepsi?.name || 'Resepsi'}</h3>
                            <div className="flex items-center gap-3 text-gray-600 mb-2 relative z-10">
                                <Calendar size={18} className="text-rose-500" /> <span>{formatDate(data?.events?.resepsi?.date || '')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 mb-2">
                                <Clock size={18} className="text-rose-500" /> <span>{data?.events?.resepsi?.timeStart} - {data?.events?.resepsi?.timeEnd}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-4 border-t pt-4 font-bold">{data?.events?.resepsi?.venueName}</p>
                            <p className="text-xs text-gray-500 mt-1">{data?.events?.resepsi?.address}</p>
                            {data?.events?.resepsi?.googleMapsUrl && <a href={data?.events?.resepsi?.googleMapsUrl} target="_blank" rel="noreferrer" className="text-xs text-rose-600 mt-2 block hover:underline">Lihat Lokasi</a>}
                        </div>
                    </motion.div>
                )}
            </div>

            {(data?.events?.resepsi?.googleMapsUrl || data?.events?.akad?.googleMapsUrl) && (
                <motion.a 
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    href={(data?.events?.resepsi?.googleMapsUrl || data?.events?.akad?.googleMapsUrl) as string} target="_blank" rel="noreferrer" 
                    className="mt-12 bg-rose-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-rose-600/30 hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 mx-auto w-full max-w-xs"
                >
                    <MapPin size={18} /> Lihat Lokasi (Maps)
                </motion.a>
            )}
        </motion.div>
    );
};

const GalleryPage = ({ data }: { data: WeddingData }) => (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="pt-10 pb-24 px-4 relative !overflow-visible"
    >
        {/* Section Ornaments (bukan di foto) */}
        <CreamyVineOrnament variant="A" className="-top-4 -left-12 opacity-75" size="w-48 h-48" />
        <CreamyVineOrnament variant="B" className="top-1/3 -right-16 opacity-50" size="w-64 h-64" />

        <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
            className="font-script text-5xl text-rose-600 mb-8 text-center text-glow relative z-10"
        >
            Galeri Foto
        </motion.h2>

        <div className="columns-2 md:columns-3 gap-4 space-y-4 relative z-10">
            {data?.gallery && data.gallery.length > 0 ? (
                data.gallery.map((img, i) => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                        key={i} className="break-inside-avoid rounded-xl overflow-hidden shadow-md group relative"
                    >
                        <img
                            src={getImageUrl(img) || `https://source.unsplash.com/random/600x${i % 2 === 0 ? '800' : '600'}?wedding,love&sig=${i}`}
                            alt="Gallery"
                            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-rose-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </motion.div>
                ))
            ) : (
                <p className="text-center text-gray-500 col-span-2">Belum ada foto galeri.</p>
            )}
        </div>
    </motion.div>
);

const GiftPage = ({ data }: { data: WeddingData }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="pt-10 pb-24 px-6 max-w-lg mx-auto"
        >
            <motion.h2 
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                className="font-script text-5xl text-rose-600 mb-4 text-center text-glow"
            >
                Kado Digital
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                className="text-center text-rose-950 font-bold mb-8 text-sm text-glow"
            >
                Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Dan jika memberi adalah ungkapan tanda kasih Anda, Anda dapat memberi kado secara cashless.
            </motion.p>

            <div className="space-y-6">
                {data?.gifts?.map((gift, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                        key={i} className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-20"><CreditCard size={64} /></div>
                        <div className="flex justify-between items-start mb-8">
                            <span className="font-bold tracking-widest">{gift.type === 'address' ? 'ALAMAT' : 'DEBIT CARD'}</span>
                            <span className="font-bold italic uppercase">{gift.name}</span>
                        </div>
                        <div className="mb-6">
                            <p className="text-xs text-gray-400 mb-1">{gift.type === 'address' ? 'Alamat Pengiriman' : 'Nomor Rekening'}</p>
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xl md:text-xl tracking-wider">{gift.accountNumber}</span>
                                {gift.type !== 'address' && (
                                    <button onClick={() => handleCopy(gift.accountNumber)} className="text-rose-400 hover:text-white">
                                        {copied ? <Check size={20} /> : <Copy size={20} />}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] text-gray-400">{gift.type === 'address' ? 'PENERIMA' : 'CARD HOLDER'}</p>
                                <p className="text-sm font-bold tracking-wider uppercase">{gift.accountHolder}</p>
                            </div>
                            {gift.type !== 'address' && (
                                <div className="w-10 h-6 bg-yellow-500/80 rounded flex gap-1 items-center justify-center">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-300/50"></div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {(!data?.gifts || data.gifts.length === 0) && <p className="text-center text-gray-400 italic">Tidak ada informasi rekening.</p>}
        </motion.div>
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
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="pt-10 pb-24 px-6 max-w-lg mx-auto text-center"
        >
            <motion.h2 
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                className="font-script text-5xl text-rose-600 mb-8 text-glow"
            >
                R.S.V.P
            </motion.h2>
            <motion.div 
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="glass-panel relative !overflow-visible p-8 rounded-2xl shadow-lg border-t-4 border-rose-500"
            >
                <CreamyVineOrnament variant="B" className="-bottom-8 -right-8" />
                <div className="relative z-10">
                    <p className="text-gray-600 mb-6 text-sm">Mohon konfirmasi kehadiran Anda.</p>
                
                {rsvpSuccess ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                    >
                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 text-rose-600" />
                        </div>
                        <p className="font-serif text-xl text-rose-800">Terima kasih atas konfirmasi Anda.</p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleRSVPSubmit} className="space-y-4 text-left">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nama Anda</label>
                            <input
                                type="text"
                                required
                                value={rsvpGuestName}
                                onChange={(e) => setRsvpGuestName(e.target.value)}
                                disabled={!!guest}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 text-base md:text-sm"
                                placeholder="Masukkan nama"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Kehadiran</label>
                                <select
                                    value={rsvpStatus}
                                    onChange={(e) => setRsvpStatus(e.target.value as any)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 text-base md:text-sm"
                                >
                                    <option value="Hadir">Hadir</option>
                                    <option value="Tidak Hadir">Tidak Hadir</option>
                                    <option value="Ragu-ragu">Ragu-ragu</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Jumlah</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={guest ? guest.paxLimit : 10}
                                    value={rsvpPaxCount}
                                    onChange={(e) => setRsvpPaxCount(Number(e.target.value))}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 text-base md:text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ucapan & Doa</label>
                            <textarea
                                required
                                value={rsvpWishes}
                                onChange={(e) => setRsvpWishes(e.target.value)}
                                rows={3}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 text-base md:text-sm resize-none"
                                placeholder="Tuliskan pesan Anda..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full mt-2 py-3 bg-rose-600 text-white rounded-lg font-bold text-sm tracking-wider uppercase hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                        >
                            Kirim RSVP
                        </button>
                    </form>
                )}
                </div>
            </motion.div>

            {/* List of RSVPs */}
            {rsvps && rsvps.length > 0 && (
                <div className="mt-8 text-left space-y-3 max-h-64 overflow-y-auto pr-2">
                    {rsvps.map((rsvp, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: (idx % 5) * 0.1 }}
                            key={idx} className="bg-white/80 p-4 rounded-xl shadow-sm border border-rose-100"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-gray-800 font-serif">{rsvp.guestName}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold ${rsvp.status === 'Hadir' ? 'border-green-200 text-green-600 bg-green-50' : rsvp.status === 'Tidak Hadir' ? 'border-red-200 text-red-600 bg-red-50' : 'border-yellow-200 text-yellow-600 bg-yellow-50'}`}>
                                    {rsvp.status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600">"{rsvp.wishes}"</p>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

/**
 * --- MAIN APP ---
 */
interface LuxuryPinkProps {
    data: WeddingData;
    theme: ThemeConfig;
    guest?: Guest | null;
    onAddRSVP: (rsvp: RSVP) => void;
    rsvps: RSVP[];
    embedded?: boolean;
}

const LuxuryPinkLayout: React.FC<LuxuryPinkProps> = ({ data, guest, onAddRSVP, rsvps, embedded = false }) => {
    const [isOpened, setIsOpened] = useState(embedded ? true : false);
    const [activeTab, setActiveTab] = useState('home');
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const guestName = guest ? guest.name : "Tamu Undangan";

    // Background Hearts
    const hearts = Array.from({ length: 15 }).map((_, i) => (
        <div
            key={i}
            className="heart-bg"
            style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                fontSize: `${Math.random() * 20 + 10}px`
            }}
        >
            <Heart fill="currentColor" />
        </div>
    ));

    const toggleMusic = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
        setIsPlaying(!isPlaying);
    };

    const startExperience = () => {
        setIsOpened(true);
        setIsPlaying(true);
        if (audioRef.current) audioRef.current.play().catch(e => console.log("Autoplay prevented:", e));
    };

    return (
        <div className="min-h-screen w-full relative overflow-x-hidden">
            <GlobalStyles />

            {/* Background Music */}
            <audio ref={audioRef} loop src={data?.musicUrl || ''} muted={embedded} />

            {/* Animated Background */}
            {data?.bgImageUrl ? (
                <div className="custom-bg" style={{ backgroundImage: `url(${getImageUrl(data.bgImageUrl)})` }}></div>
            ) : (
                <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                    {hearts}
                </div>
            )}

            {/* Amplop Pembuka */}
            {!isOpened && (
                <EnvelopeOverlay
                    onOpen={startExperience}
                    groomName={data?.couple?.groom?.nickname || 'Groom'}
                    brideName={data?.couple?.bride?.nickname || 'Bride'}
                    guestName={guestName}
                />
            )}

            {/* Main Content Area */}
            {isOpened && (
                <>
                    <motion.main 
                        initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="w-full max-w-2xl mx-auto min-h-screen relative z-10 pb-20"
                    >
                        {activeTab === 'home' && <HomePage data={data} guestName={guestName} />}
                        {activeTab === 'couple' && <CouplePage data={data} />}
                        {activeTab === 'event' && <EventPage data={data} />}
                        {activeTab === 'gallery' && <GalleryPage data={data} />}
                        {activeTab === 'gift' && <GiftPage data={data} />}
                        {activeTab === 'rsvp' && <RSVPPage data={data} guest={guest} onAddRSVP={onAddRSVP} rsvps={rsvps} />}
                    </motion.main>

                    {/* Floating Controls */}
                    <Navbar activeTab={activeTab} setTab={setActiveTab} data={data} />

                    <button
                        onClick={toggleMusic}
                        className="fixed top-24 right-4 z-50 bg-rose-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform animate-[spin_4s_linear_infinite]"
                        style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                    >
                        {isPlaying ? <Music size={20} /> : <Pause size={20} />}
                    </button>
                </>
            )}
        </div>
    );
}

export default LuxuryPinkLayout;

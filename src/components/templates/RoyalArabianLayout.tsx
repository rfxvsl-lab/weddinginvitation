import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PiHeartDuotone as Heart,
    PiMapPinDuotone as MapPin,
    PiCalendarDuotone as Calendar,
    PiClockDuotone as Clock,
    PiUserDuotone as User,
    PiImageDuotone as ImageIcon,
    PiChatCircleDuotone as MessageCircle,
    PiBookOpenDuotone as BookOpen,
    PiGiftDuotone as Gift,
    PiCopyDuotone as Copy,
    PiMoonDuotone as Moon,
    PiStarDuotone as Star,
    PiMosqueDuotone as Mosque,
    PiCheckCircleDuotone as Check,
    PiCaretDownDuotone as ChevronDown
} from 'react-icons/pi';
import { WeddingData, ThemeConfig, RSVP, Guest } from '../../types';

// --- ANIMATION VARIANTS ---
const blurFadeIn: any = {
    hidden: { opacity: 0, filter: 'blur(10px)', y: 20 },
    visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 1, ease: 'easeOut' } }
};

const slideUpPop: any = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 20, mass: 1 } }
};

const breatheSway: any = {
    animate: {
        rotate: [-2, 2, -2],
        scale: [1, 1.05, 1],
        transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
    }
};

const reverseBreatheSway = {
    animate: {
        rotate: [2, -2, 2],
        scale: [1.05, 1, 1.05],
        transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' }
    }
};

const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
};

// --- STYLES & FONTS ---
const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Aref+Ruqaa:wght@400;700&family=Cinzel+Decorative:wght@400;700&family=Montserrat:wght@300;400;500;700&display=swap');

        .font-arab-calligraphy { font-family: 'Aref Ruqaa', serif; }
        .font-arab-body { font-family: 'Amiri', serif; }
        .font-modern { font-family: 'Montserrat', sans-serif; }
        .font-royal { font-family: 'Cinzel Decorative', serif; }

        .text-gold-gradient {
            background: linear-gradient(135deg, #FFDF73 0%, #D4AF37 50%, #997A15 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .bg-gold-gradient {
            background: linear-gradient(135deg, #FFDF73 0%, #D4AF37 50%, #997A15 100%);
        }

        .border-gold {
            border-color: #D4AF37;
        }

        .glass-panel {
            background: rgba(5, 20, 16, 0.7);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(212, 175, 55, 0.3);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .custom-scroll::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.2);
        }
        .custom-scroll::-webkit-scrollbar-thumb {
            background: #D4AF37;
            border-radius: 4px;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
    `}</style>
);

// --- SVG COMPONENTS ---
const RoyalGoldenFlower = ({ className, reverse = false }: { className?: string, reverse?: boolean }) => (
    <motion.svg 
        variants={reverse ? reverseBreatheSway : breatheSway}
        animate="animate"
        className={className} 
        viewBox="0 0 200 200" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}
    >
        <defs>
            <linearGradient id="goldPetal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFDF73" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#8A6B22" />
            </linearGradient>
            <linearGradient id="darkGoldPetal" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#B8860B" />
                <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
        </defs>
        
        <g transform="translate(100, 100)">
            {/* Outer Petals */}
            {Array.from({ length: 8 }).map((_, i) => (
                <path 
                    key={`outer-${i}`}
                    d="M0,0 C30,-80 80,-80 0,-100 C-80,-80 -30,-80 0,0 Z" 
                    fill="url(#darkGoldPetal)" 
                    transform={`rotate(${i * 45}) scale(0.9)`} 
                    opacity="0.9"
                />
            ))}
            
            {/* Inner Petals */}
            {Array.from({ length: 8 }).map((_, i) => (
                <path 
                    key={`inner-${i}`}
                    d="M0,0 C20,-60 50,-60 0,-80 C-50,-60 -20,-60 0,0 Z" 
                    fill="url(#goldPetal)" 
                    transform={`rotate(${i * 45 + 22.5}) scale(0.8)`} 
                />
            ))}

            {/* Center Core */}
            <circle cx="0" cy="0" r="15" fill="#5C4000" />
            {Array.from({ length: 12 }).map((_, i) => (
                <circle 
                    key={`core-${i}`}
                    cx={Math.cos(i * 30 * Math.PI / 180) * 10} 
                    cy={Math.sin(i * 30 * Math.PI / 180) * 10} 
                    r="2" 
                    fill="#FFDF73" 
                />
            ))}
        </g>
    </motion.svg>
);

const IslamicMandala = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <g stroke="#D4AF37" strokeWidth="1" fill="none" opacity="0.3">
            <circle cx="100" cy="100" r="90" />
            <circle cx="100" cy="100" r="70" />
            <path d="M100 10 L120 80 L190 100 L120 120 L100 190 L80 120 L10 100 L80 80 Z" />
            <path d="M36 36 L80 80 M164 36 L120 80 M164 164 L120 120 M36 164 L80 120" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="30" fill="rgba(212, 175, 55, 0.1)" />
            {Array.from({length: 8}).map((_, i) => (
                <circle key={i} cx={100 + Math.cos(i * Math.PI / 4) * 50} cy={100 + Math.sin(i * Math.PI / 4) * 50} r="5" fill="#D4AF37" opacity="0.5" />
            ))}
        </g>
    </svg>
);

const ArabicArch = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`relative ${className}`}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M10 100 L10 40 Q50 -10 90 40 L90 100" fill="none" stroke="#D4AF37" strokeWidth="2" opacity="0.6" />
            <path d="M5 100 L5 40 Q50 -20 95 40 L95 100" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
        </svg>
        <div className="relative z-10 w-full h-full p-4" style={{ clipPath: 'polygon(10% 100%, 10% 40%, 50% 10%, 90% 40%, 90% 100%)' }}>
            {children}
        </div>
    </div>
);

const Lantern = ({ delay }: { delay: number }) => (
    <motion.div
        className="absolute top-0 w-8 h-24 origin-top z-0 opacity-60"
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
    >
        <svg viewBox="0 0 50 100" className="w-full h-full">
            <line x1="25" y1="0" x2="25" y2="30" stroke="#D4AF37" strokeWidth="2" />
            <path d="M15 30 L35 30 L45 50 L5 50 Z" fill="#0A1F18" stroke="#D4AF37" strokeWidth="1" />
            <rect x="5" y="50" width="40" height="30" fill="rgba(212, 175, 55, 0.1)" stroke="#D4AF37" strokeWidth="1" />
            <circle cx="25" cy="65" r="5" fill="#FFDF73" className="drop-shadow-[0_0_8px_#FFDF73]" />
            <path d="M5 80 L25 95 L45 80" fill="none" stroke="#D4AF37" strokeWidth="1" />
        </svg>
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

// --- PAGES ---
const RoyalGateEnvelope = ({ onOpen, data, guestName }: { onOpen: () => void, data: WeddingData, guestName: string }) => {
    const [opening, setOpening] = useState(false);

    const handleOpen = () => {
        setOpening(true);
        setTimeout(onOpen, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020508] overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] mix-blend-overlay"></div>
            
            <motion.div 
                className="absolute z-30 text-center flex flex-col items-center max-w-sm px-6"
                initial={{ opacity: 1, scale: 1 }}
                animate={opening ? { opacity: 0, scale: 1.1 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
            >
                <p className="font-arab-calligraphy text-4xl md:text-5xl text-gold-gradient mb-6 leading-relaxed drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">
                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
                </p>
                <h1 className="font-royal text-3xl text-gold-gradient mb-2">{data?.couple?.groom?.nickname} & {data?.couple?.bride?.nickname}</h1>
                <p className="font-modern text-xs tracking-[0.3em] text-[#D4AF37] uppercase mb-12">Walimatul Ursy</p>
                
                <p className="font-modern text-[10px] text-gray-400 uppercase tracking-widest mb-2">Kepada Yth,</p>
                <p className="font-arab-calligraphy text-3xl text-white drop-shadow-md mb-8">{guestName}</p>

                <button 
                    onClick={handleOpen}
                    className="flex items-center gap-2 px-8 py-3 bg-gold-gradient text-[#0A1F18] font-bold font-modern text-xs uppercase tracking-[0.2em] rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all"
                >
                    <BookOpen size={16} />
                    Buka Undangan
                </button>
            </motion.div>

            <motion.div 
                className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#051410] to-[#0A1F18] border-r-2 border-[#D4AF37] shadow-[10px_0_30px_rgba(0,0,0,0.8)] z-20 flex justify-end items-center overflow-hidden pointer-events-none"
                initial={{ x: 0 }}
                animate={opening ? { x: '-100%' } : { x: 0 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="absolute right-[-100px] top-1/2 -translate-y-1/2 opacity-20">
                    <IslamicMandala className="w-[300px] h-[300px]" />
                </div>
            </motion.div>

            <motion.div 
                className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#051410] to-[#0A1F18] border-l-2 border-[#D4AF37] shadow-[-10px_0_30px_rgba(0,0,0,0.8)] z-20 flex justify-start items-center overflow-hidden pointer-events-none"
                initial={{ x: 0 }}
                animate={opening ? { x: '100%' } : { x: 0 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            >
                 <div className="absolute left-[-100px] top-1/2 -translate-y-1/2 opacity-20">
                    <IslamicMandala className="w-[300px] h-[300px]" />
                </div>
            </motion.div>
        </div>
    );
};

const HomePage = ({ data }: { data: WeddingData }) => {
    return (
        <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-start h-full p-6 pt-20 pb-32 overflow-y-auto hide-scrollbar text-center relative z-10"
        >
            <IslamicMandala className="absolute top-[-50px] w-64 h-64 opacity-20 animate-spin-slow pointer-events-none" />
            
            <motion.p variants={blurFadeIn} className="font-arab-calligraphy text-2xl md:text-3xl text-gold-gradient mb-6 leading-relaxed">
                السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ
            </motion.p>

            <motion.p variants={blurFadeIn} className="font-modern text-[10px] md:text-xs text-gray-300 tracking-widest uppercase mb-8 max-w-xs leading-loose">
                Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara pernikahan kami:
            </motion.p>

            <motion.div variants={slideUpPop} className="relative w-48 h-64 md:w-64 md:h-80 mx-auto mb-8 drop-shadow-2xl">
                {/* Backdrop Flowers Behind Arch */}
                <RoyalGoldenFlower className="absolute -bottom-10 -left-16 w-32 h-32 z-0" />
                <RoyalGoldenFlower className="absolute top-10 -right-16 w-24 h-24 z-0" reverse />
                
                <ArabicArch className="w-full h-full relative z-10">
                    <img 
                        src={getImageUrl(data?.bgImageUrl || "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&q=80")} 
                        className="w-full h-full object-cover filter brightness-75 sepia-[0.3]"
                        alt="Hero"
                    />
                </ArabicArch>
            </motion.div>

            <motion.h1 variants={blurFadeIn} className="font-royal text-4xl md:text-5xl text-gold-gradient mb-4">
                {data?.couple?.groom?.nickname} <br/> 
                <span className="text-2xl text-white/50 font-arab-calligraphy">&</span> <br/> 
                {data?.couple?.bride?.nickname}
            </motion.h1>

            <motion.p variants={blurFadeIn} className="font-arab-body text-xl text-[#D4AF37] mt-4 max-w-xs">
                "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri..."
            </motion.p>
            <motion.p variants={blurFadeIn} className="font-modern text-[10px] text-gray-400 mt-2 uppercase tracking-widest">(QS. Ar-Rum: 21)</motion.p>
        </motion.div>
    );
};

const CouplePage = ({ data }: { data: WeddingData }) => (
    <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-start h-full p-6 pt-24 pb-32 overflow-y-auto hide-scrollbar text-center relative z-10"
    >
        <motion.h2 variants={blurFadeIn} className="font-royal text-2xl md:text-3xl text-gold-gradient mb-12 tracking-widest uppercase border-b border-[#D4AF37] pb-2">Sang Mempelai</motion.h2>

        <div className="flex flex-col gap-12 w-full max-w-sm">
            {/* Groom */}
            <motion.div variants={slideUpPop} className="glass-panel p-6 rounded-t-full border-b-4 border-b-[#D4AF37] relative">
                <RoyalGoldenFlower className="absolute -top-6 -left-6 w-20 h-20" />
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-[#D4AF37] mb-4">
                    <img src={getImageUrl(data?.couple?.groom?.photoUrl || '')} className="w-full h-full object-cover sepia-[0.2]" />
                </div>
                <h3 className="font-arab-calligraphy text-3xl text-white drop-shadow-md mb-1">{data?.couple?.groom?.fullName}</h3>
                <p className="font-modern text-[10px] uppercase text-[#D4AF37] tracking-widest mb-3">Putra Dari</p>
                <p className="font-modern text-xs text-gray-300">Bapak {data?.couple?.groom?.fatherName} <br/> & Ibu {data?.couple?.groom?.motherName}</p>
            </motion.div>

            <motion.div variants={blurFadeIn} className="font-arab-calligraphy text-4xl text-gold-gradient">&</motion.div>

            {/* Bride */}
            <motion.div variants={slideUpPop} className="glass-panel p-6 rounded-t-full border-b-4 border-b-[#D4AF37] relative">
                <RoyalGoldenFlower className="absolute -top-6 -right-6 w-20 h-20" reverse />
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-[#D4AF37] mb-4">
                    <img src={getImageUrl(data?.couple?.bride?.photoUrl || '')} className="w-full h-full object-cover sepia-[0.2]" />
                </div>
                <h3 className="font-arab-calligraphy text-3xl text-white drop-shadow-md mb-1">{data?.couple?.bride?.fullName}</h3>
                <p className="font-modern text-[10px] uppercase text-[#D4AF37] tracking-widest mb-3">Putri Dari</p>
                <p className="font-modern text-xs text-gray-300">Bapak {data?.couple?.bride?.fatherName} <br/> & Ibu {data?.couple?.bride?.motherName}</p>
            </motion.div>
        </div>
    </motion.div>
);

const EventPage = ({ data }: { data: WeddingData }) => {
    const formatDate = (d: string) => {
        if(!d) return '';
        const dt = new Date(d);
        if(isNaN(dt.getTime())) return d;
        return dt.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    return (
        <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-start h-full p-6 pt-24 pb-32 overflow-y-auto hide-scrollbar text-center relative z-10"
        >
            <motion.h2 variants={blurFadeIn} className="font-royal text-2xl md:text-3xl text-gold-gradient mb-8 tracking-widest uppercase border-b border-[#D4AF37] pb-2">Rangkaian Acara</motion.h2>

            <div className="w-full max-w-sm space-y-6">
                {/* Akad */}
                {data?.events?.akad?.enabled !== false && (
                    <motion.div variants={slideUpPop} className="glass-panel p-6 border border-[#D4AF37]/50 rounded-lg relative overflow-hidden">
                        <RoyalGoldenFlower className="absolute -bottom-8 -right-8 w-32 h-32 opacity-50" />
                        <h3 className="font-arab-calligraphy text-3xl text-white mb-4 drop-shadow-sm">{data?.events?.akad?.name || 'Akad Nikah'}</h3>
                        
                        <div className="flex items-center justify-center gap-3 mb-2 font-modern text-sm text-[#D4AF37]">
                            <Calendar size={16} /> <span>{formatDate(data?.events?.akad?.date || '')}</span>
                        </div>
                        <div className="flex items-center justify-center gap-3 mb-4 font-modern text-sm text-gray-300">
                            <Clock size={16} /> <span>{data?.events?.akad?.timeStart} - {data?.events?.akad?.timeEnd || 'Selesai'}</span>
                        </div>
                        
                        <div className="bg-[#0A1F18]/80 p-3 rounded text-sm text-gray-300 font-modern border border-gray-800 relative z-10">
                            <p className="font-bold text-[#D4AF37] mb-1">{data?.events?.akad?.venueName}</p>
                            <p className="text-xs leading-relaxed">{data?.events?.akad?.address}</p>
                        </div>
                    </motion.div>
                )}

                {/* Resepsi */}
                {data?.events?.resepsi?.enabled !== false && (
                    <motion.div variants={slideUpPop} className="glass-panel p-6 border border-[#D4AF37]/50 rounded-lg relative overflow-hidden">
                        <RoyalGoldenFlower className="absolute -bottom-8 -left-8 w-32 h-32 opacity-50" reverse />
                        <h3 className="font-arab-calligraphy text-3xl text-white mb-4 drop-shadow-sm">{data?.events?.resepsi?.name || 'Resepsi'}</h3>
                        
                        <div className="flex items-center justify-center gap-3 mb-2 font-modern text-sm text-[#D4AF37]">
                            <Calendar size={16} /> <span>{formatDate(data?.events?.resepsi?.date || '')}</span>
                        </div>
                        <div className="flex items-center justify-center gap-3 mb-4 font-modern text-sm text-gray-300">
                            <Clock size={16} /> <span>{data?.events?.resepsi?.timeStart} - {data?.events?.resepsi?.timeEnd || 'Selesai'}</span>
                        </div>
                        
                        <div className="bg-[#0A1F18]/80 p-3 rounded text-sm text-gray-300 font-modern border border-gray-800 relative z-10">
                            <p className="font-bold text-[#D4AF37] mb-1">{data?.events?.resepsi?.venueName}</p>
                            <p className="text-xs leading-relaxed">{data?.events?.resepsi?.address}</p>
                        </div>
                    </motion.div>
                )}

                {(data?.events?.resepsi?.googleMapsUrl || data?.events?.akad?.googleMapsUrl) && (
                    <motion.a 
                        variants={blurFadeIn}
                        href={(data?.events?.resepsi?.googleMapsUrl || data?.events?.akad?.googleMapsUrl) as string} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="mt-6 flex items-center justify-center gap-2 w-full py-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A1F18] transition-colors font-modern font-bold text-xs uppercase tracking-widest rounded-full"
                    >
                        <MapPin size={16} /> Lihat Peta Lokasi
                    </motion.a>
                )}
            </div>
        </motion.div>
    );
};

const GalleryPage = ({ data }: { data: WeddingData }) => (
    <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-start h-full p-4 pt-24 pb-32 overflow-y-auto hide-scrollbar text-center relative z-10"
    >
        <motion.h2 variants={blurFadeIn} className="font-royal text-2xl md:text-3xl text-gold-gradient mb-8 tracking-widest uppercase border-b border-[#D4AF37] pb-2">Galeri</motion.h2>
        
        <div className="columns-2 gap-4 w-full max-w-sm space-y-4">
            {data?.gallery && data.gallery.length > 0 ? (
                data.gallery.map((img, i) => (
                    <motion.div 
                        key={i} 
                        variants={slideUpPop}
                        className="break-inside-avoid relative rounded-lg overflow-hidden border border-[#D4AF37]/40 shadow-lg"
                    >
                        <img src={getImageUrl(img)} className="w-full h-auto object-cover sepia-[0.4]" />
                    </motion.div>
                ))
            ) : (
                <p className="text-gray-500 font-modern text-sm col-span-2 py-10">Belum ada foto.</p>
            )}
        </div>
    </motion.div>
);

const GiftPage = ({ data }: { data: WeddingData }) => {
    const [copiedId, setCopiedId] = useState('');

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(''), 2000);
    };

    return (
        <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-start h-full p-6 pt-24 pb-32 overflow-y-auto hide-scrollbar text-center relative z-10"
        >
            <motion.h2 variants={blurFadeIn} className="font-royal text-2xl md:text-3xl text-gold-gradient mb-4 tracking-widest uppercase border-b border-[#D4AF37] pb-2">Tanda Kasih</motion.h2>
            <motion.p variants={blurFadeIn} className="font-modern text-xs text-gray-400 max-w-xs mb-8 leading-relaxed">Doa restu Anda merupakan karunia yang sangat berarti. Namun, jika Anda hendak memberikan tanda kasih, Anda dapat melalui fitur di bawah ini.</motion.p>

            <div className="w-full max-w-sm space-y-6">
                {data?.gifts?.map((gift, i) => (
                    <motion.div variants={slideUpPop} key={i} className="glass-panel p-6 rounded-lg relative overflow-hidden border border-[#D4AF37]/50 text-left group">
                        <RoyalGoldenFlower className="absolute -bottom-10 -right-10 w-32 h-32 opacity-30" />
                        <div className="relative z-10">
                            <h4 className="font-arab-calligraphy text-2xl text-white mb-4">{gift.name}</h4>
                            <p className="font-modern text-[10px] uppercase text-[#D4AF37] tracking-widest mb-1">Nomor Rekening / Alamat</p>
                            <p className="font-modern font-bold text-lg text-gray-200 mb-4 tracking-wider">{gift.accountNumber}</p>
                            
                            <p className="font-modern text-[10px] uppercase text-[#D4AF37] tracking-widest mb-1">Atas Nama</p>
                            <p className="font-modern text-sm text-gray-300 mb-6">{gift.accountHolder}</p>

                            {gift.type !== 'address' && (
                                <button
                                    onClick={() => handleCopy(gift.id || String(i), gift.accountNumber)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#D4AF37]/20 hover:bg-[#D4AF37] border border-[#D4AF37] hover:text-[#0A1F18] text-[#D4AF37] transition-colors rounded-full font-modern text-xs uppercase font-bold tracking-wider"
                                >
                                    {copiedId === (gift.id || String(i)) ? (
                                        <><Check size={16} /> Berhasil Disalin</>
                                    ) : (
                                        <><Copy size={16} /> Salin Nomor</>
                                    )}
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
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
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-start h-full p-6 pt-24 pb-32 overflow-y-auto custom-scroll text-center relative z-10"
        >
            <motion.h2 variants={blurFadeIn} className="font-royal text-2xl md:text-3xl text-gold-gradient mb-8 tracking-widest uppercase border-b border-[#D4AF37] pb-2">RSVP & Doa</motion.h2>
            
            <div className="w-full max-w-sm">
                <AnimatePresence mode="wait">
                    {rsvpSuccess ? (
                        <motion.div 
                            key="success"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="glass-panel p-8 rounded-lg border border-[#D4AF37]/50"
                        >
                            <Check className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
                            <h3 className="font-arab-calligraphy text-2xl text-white mb-2">Syukron Katsiran</h3>
                            <p className="font-modern text-sm text-gray-300 leading-relaxed">Konfirmasi dan doa restu Anda telah kami terima.</p>
                        </motion.div>
                    ) : (
                        <motion.form 
                            key="form"
                            variants={slideUpPop}
                            onSubmit={handleRSVPSubmit}
                            className="glass-panel p-6 rounded-lg border border-[#D4AF37]/30 text-left space-y-4 relative overflow-hidden"
                        >
                            <RoyalGoldenFlower className="absolute -top-6 -left-6 w-24 h-24 opacity-40 pointer-events-none" />
                            <RoyalGoldenFlower className="absolute -bottom-6 -right-6 w-24 h-24 opacity-40 pointer-events-none" reverse />
                            
                            <div className="relative z-10">
                                <div>
                                    <label className="block font-modern text-[10px] text-[#D4AF37] uppercase tracking-widest mb-1">Nama Lengkap</label>
                                    <input
                                        type="text" required value={rsvpGuestName} onChange={(e) => setRsvpGuestName(e.target.value)} disabled={!!guest}
                                        className="w-full bg-[#051410] border border-[#D4AF37]/30 rounded px-3 py-2 text-white font-modern text-sm focus:border-[#D4AF37] focus:outline-none disabled:opacity-50"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block font-modern text-[10px] text-[#D4AF37] uppercase tracking-widest mb-1">Kehadiran</label>
                                        <div className="relative">
                                            <select
                                                value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value as any)}
                                                className="w-full bg-[#051410] border border-[#D4AF37]/30 rounded px-3 py-2 text-white font-modern text-sm focus:border-[#D4AF37] focus:outline-none appearance-none"
                                            >
                                                <option value="Hadir">Hadir</option>
                                                <option value="Tidak Hadir">Tidak Hadir</option>
                                                <option value="Ragu-ragu">Ragu-ragu</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4AF37] pointer-events-none" size={14} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block font-modern text-[10px] text-[#D4AF37] uppercase tracking-widest mb-1">Jumlah Tamu</label>
                                        <input
                                            type="number" min="1" max={guest ? guest.paxLimit : 10} value={rsvpPaxCount} onChange={(e) => setRsvpPaxCount(Number(e.target.value))}
                                            className="w-full bg-[#051410] border border-[#D4AF37]/30 rounded px-3 py-2 text-white font-modern text-sm focus:border-[#D4AF37] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block font-modern text-[10px] text-[#D4AF37] uppercase tracking-widest mb-1">Doa & Harapan</label>
                                    <textarea
                                        required value={rsvpWishes} onChange={(e) => setRsvpWishes(e.target.value)} rows={3}
                                        className="w-full bg-[#051410] border border-[#D4AF37]/30 rounded px-3 py-2 text-white font-modern text-sm focus:border-[#D4AF37] focus:outline-none resize-none"
                                    />
                                </div>

                                <button type="submit" className="w-full mt-6 py-3 bg-gold-gradient text-[#0A1F18] font-bold font-modern text-xs uppercase tracking-widest rounded hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all">
                                    Kirim Konfirmasi
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Wishes List */}
                {rsvps && rsvps.length > 0 && (
                    <motion.div variants={slideUpPop} className="mt-8 space-y-4 max-h-[400px] overflow-y-auto custom-scroll pr-2 text-left">
                        {rsvps.map((rsvp, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-[#051410]/80 p-4 rounded border-l-2 border-[#D4AF37] shadow-lg"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-arab-calligraphy text-lg text-white">{rsvp.guestName}</span>
                                    <span className={`text-[8px] uppercase tracking-widest font-bold px-2 py-1 rounded-sm ${
                                        rsvp.status === 'Hadir' ? 'bg-green-900/50 text-green-400' :
                                        rsvp.status === 'Tidak Hadir' ? 'bg-red-900/50 text-red-400' :
                                        'bg-yellow-900/50 text-yellow-400'
                                    }`}>
                                        {rsvp.status}
                                    </span>
                                </div>
                                <p className="font-modern text-xs text-gray-300 leading-relaxed">"{rsvp.wishes}"</p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

// --- MAIN LAYOUT ---
interface RoyalArabianProps {
    data: WeddingData;
    theme: ThemeConfig;
    guest?: Guest | null;
    onAddRSVP: (rsvp: RSVP) => void;
    rsvps: RSVP[];
    embedded?: boolean;
}

const RoyalArabianLayout: React.FC<RoyalArabianProps> = ({ data, guest, onAddRSVP, rsvps, embedded = false }) => {
    const [stage, setStage] = useState<'envelope' | 'content'>(embedded ? 'content' : 'envelope');
    const [activeTab, setActiveTab] = useState('home');
    const [music, setMusic] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const toggleMusic = () => {
        if (!audioRef.current) return;
        if (music) audioRef.current.pause();
        else audioRef.current.play();
        setMusic(!music);
    };

    const enterContent = () => {
        setStage('content');
        if (!music && audioRef.current) {
            setMusic(true);
            audioRef.current.play().catch(() => {});
        }
    };

    return (
        <div className="relative w-full h-[100dvh] overflow-hidden bg-[#020508] text-[#F5E6CA]">
            <GlobalStyles />
            <audio ref={audioRef} loop src={data?.musicUrl || "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg"} muted={embedded} />

            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] mix-blend-overlay opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#020508] via-[#051410] to-[#0A1F18]"></div>
                
                {/* Floating Elements */}
                <Lantern delay={0} />
                <div className="absolute top-0 right-10"><Lantern delay={1.5} /></div>
                
                {/* Glow Orbs */}
                <div className="absolute top-[20%] -left-10 w-40 h-40 bg-[#D4AF37] opacity-5 blur-[80px] rounded-full"></div>
                <div className="absolute bottom-[20%] -right-10 w-40 h-40 bg-[#D4AF37] opacity-5 blur-[80px] rounded-full"></div>
            </div>

            <AnimatePresence>
                {stage === 'envelope' && (
                    <RoyalGateEnvelope onOpen={enterContent} data={data} guestName={guest?.name || 'Tamu Undangan'} />
                )}
            </AnimatePresence>

            {/* Content Switcher */}
            {stage === 'content' && (
                <div className="absolute inset-0 z-10">
                    <AnimatePresence mode="wait">
                        {activeTab === 'home' && <HomePage key="home" data={data} />}
                        {activeTab === 'couple' && <CouplePage key="couple" data={data} />}
                        {activeTab === 'event' && <EventPage key="event" data={data} />}
                        {activeTab === 'gallery' && <GalleryPage key="gallery" data={data} />}
                        {activeTab === 'gift' && <GiftPage key="gift" data={data} />}
                        {activeTab === 'rsvp' && <RSVPPage key="rsvp" data={data} guest={guest} onAddRSVP={onAddRSVP} rsvps={rsvps} />}
                    </AnimatePresence>
                </div>
            )}

            {/* Navigation Bar */}
            {stage === 'content' && (
                <motion.div 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
                >
                    <div className="glass-panel px-6 py-3 rounded-full flex justify-between items-center shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                        {[
                            { id: 'home', icon: Mosque },
                            { id: 'couple', icon: User },
                            { id: 'event', icon: Calendar },
                            { id: 'gallery', icon: ImageIcon },
                            { id: 'gift', icon: Gift },
                            { id: 'rsvp', icon: MessageCircle }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`relative flex flex-col items-center justify-center p-2 transition-colors ${activeTab === item.id ? 'text-[#D4AF37]' : 'text-[#8B6E4E] hover:text-[#D4AF37]'}`}
                            >
                                <item.icon size={20} />
                                {activeTab === item.id && (
                                    <motion.div layoutId="nav-indicator-royal" className="absolute -bottom-1 w-1 h-1 bg-[#D4AF37] rounded-full drop-shadow-[0_0_5px_#D4AF37]" />
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default RoyalArabianLayout;

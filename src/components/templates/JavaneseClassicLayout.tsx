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
    PiFlowerLotusDuotone as Lotus,
    PiCheckCircleDuotone as Check,
    PiCaretDownDuotone as ChevronDown
} from 'react-icons/pi';
import { WeddingData, ThemeConfig, RSVP, Guest } from '../../types';

// --- ANIMATION VARIANTS ---
const blurFadeIn = {
    hidden: { opacity: 0, filter: 'blur(12px)', y: 30 },
    visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 1.2, ease: 'easeOut' } }
};

const slideUpPop = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 80, damping: 20, mass: 1 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.25 }
    }
};

const breatheSway = {
    animate: {
        rotate: [-1, 1, -1],
        scale: [1, 1.03, 1],
        transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' }
    }
};

const JavaneseFlower = ({ className, delay = 0 }: { className?: string, delay?: number }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0, rotate: -180 }}
        animate={{ opacity: 0.8, scale: 1, rotate: 0 }}
        transition={{ delay, type: 'spring', stiffness: 40, damping: 15, duration: 2.5 }}
        className={`absolute pointer-events-none z-0 ${className}`}
    >
        <motion.img 
            animate={{ rotate: 360 }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
            src="/assets/flower.webp" 
            className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            alt="Flower Ornament"
        />
    </motion.div>
);

// --- STYLES & FONTS ---
const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gelasio:ital,wght@0,400;0,700;1,400&family=Philosopher:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;500;700&family=Noto+Sans+Javanese&display=swap');

        .font-javanese-title { font-family: 'Philosopher', sans-serif; }
        .font-javanese-body { font-family: 'Gelasio', serif; }
        .font-modern { font-family: 'Montserrat', sans-serif; }
        .font-aksara { font-family: 'Noto Sans Javanese', sans-serif; }

        .text-sogan-gradient {
            background: linear-gradient(135deg, #D4AF37 0%, #B8860B 50%, #8A6B22 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .bg-sogan-gradient {
            background: linear-gradient(135deg, #D4AF37 0%, #B8860B 50%, #8A6B22 100%);
        }

        .javanese-panel {
            background: rgba(45, 26, 15, 0.85); /* Darker Sogan Brown */
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(212, 175, 55, 0.3);
            border-radius: 4px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
        }
        
        .javanese-border {
            position: relative;
        }
        .javanese-border::before, .javanese-border::after {
            content: '';
            position: absolute;
            width: 30px;
            height: 30px;
            border: 2px solid #D4AF37;
            opacity: 0.7;
        }
        .javanese-border::before {
            top: -5px;
            left: -5px;
            border-right: none;
            border-bottom: none;
        }
        .javanese-border::after {
            bottom: -5px;
            right: -5px;
            border-left: none;
            border-top: none;
        }

        .custom-scroll::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.2);
        }
        .custom-scroll::-webkit-scrollbar-thumb {
            background: #B8860B;
            border-radius: 4px;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
    `}</style>
);

// --- SVG COMPONENTS ---
const KawungBatik = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <pattern id="kawung" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M20 0 C30 10 30 30 20 40 C10 30 10 10 20 0 Z" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
            <path d="M0 20 C10 10 30 10 40 20 C30 30 10 30 0 20 Z" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
            <circle cx="20" cy="20" r="2" fill="#D4AF37" opacity="0.3" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#kawung)" />
    </svg>
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
const GununganEnvelope = ({ onOpen, data, guestName }: { onOpen: () => void, data: WeddingData, guestName: string }) => {
    const [opening, setOpening] = useState(false);

    const handleOpen = () => {
        setOpening(true);
        setTimeout(onOpen, 2000); // Wait for blur/scale exit animation
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1A0F0A] overflow-hidden">
            {/* Background Batik */}
            <KawungBatik className="absolute inset-0 w-full h-full opacity-10" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] mix-blend-overlay opacity-30"></div>
            
            <AnimatePresence>
                {!opening && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="relative z-10 w-full max-w-sm flex flex-col items-center justify-center px-6 text-center"
                    >
                        {/* Gunungan Graphic */}
                        <motion.div 
                            variants={breatheSway}
                            animate="animate"
                            className="relative w-64 h-80 mb-6 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                        >
                            <div 
                                className="w-full h-full bg-contain bg-center bg-no-repeat"
                                style={{ 
                                    backgroundImage: `url('/assets/wayang/gunungan.png')`,
                                    filter: 'brightness(2.5) contrast(1.2) drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))'
                                }}
                            ></div>
                        </motion.div>

                        <p className="font-aksara text-3xl text-[#D4AF37] mb-0 drop-shadow-md">ꦥꦮꦶꦮꦲꦤ꧀</p>
                        <h1 className="font-javanese-title text-4xl text-sogan-gradient mb-4 drop-shadow-lg">{data?.couple?.groom?.nickname} & {data?.couple?.bride?.nickname}</h1>
                        
                        <div className="my-6 text-center border-t border-b border-[#D4AF37]/30 py-4 w-full">
                            <p className="font-modern text-[10px] text-gray-400 uppercase tracking-widest mb-2">Katur Dumateng Bpk/Ibu/Sdr/i:</p>
                            <p className="font-javanese-title text-2xl text-[#F5EBE0] drop-shadow-md">{guestName}</p>
                        </div>

                        <button 
                            onClick={handleOpen}
                            className="flex items-center gap-2 px-8 py-3 bg-sogan-gradient text-[#1A0F0A] font-bold font-modern text-xs uppercase tracking-[0.2em] rounded shadow-[0_5px_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all"
                        >
                            <Lotus size={16} />
                            Mlebet Undangan
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
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
            <JavaneseFlower className="-top-20 -left-20 w-64 h-64 opacity-50" delay={0.2} />
            <JavaneseFlower className="-bottom-10 -right-20 w-72 h-72 opacity-50" delay={0.4} />
            
            <motion.p variants={blurFadeIn} className="font-aksara text-4xl text-[#D4AF37] mb-2 drop-shadow-md">
                ꦱꦸꦒꦼꦁꦫꦮꦸꦃ
            </motion.p>
            <motion.p variants={blurFadeIn} className="font-javanese-title text-xl md:text-2xl text-sogan-gradient mb-6">
                Sugeng Rawuh
            </motion.p>

            <motion.p variants={blurFadeIn} className="font-modern text-[10px] md:text-xs text-gray-300 tracking-widest uppercase mb-8 max-w-xs leading-loose">
                Kanthi nyuwun rida saking Gusti Allah SWT, kula sakulawarga ngaturaken pambagya harja katur panjenengan sadaya ing pahargyan dhaupipun:
            </motion.p>

            <motion.div variants={slideUpPop} className="relative w-56 h-72 md:w-64 md:h-80 mx-auto mb-10 javanese-border p-2">
                <div className="w-full h-full overflow-hidden rounded-sm">
                    <img 
                        src={getImageUrl(data?.bgImageUrl || "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&q=80")} 
                        className="w-full h-full object-cover filter brightness-75 sepia-[0.4]"
                        alt="Hero"
                    />
                </div>
                
                {/* Floating Gunungan Accent */}
                <motion.div variants={breatheSway} className="absolute -bottom-8 -right-8 w-24 h-32 opacity-80 pointer-events-none">
                    <div 
                        className="w-full h-full bg-contain bg-center bg-no-repeat"
                        style={{ 
                            backgroundImage: `url('/assets/wayang/gunungan.png')`,
                            filter: 'brightness(2.5) contrast(1.2) drop-shadow(0 0 10px rgba(212, 175, 55, 0.4))'
                        }}
                    ></div>
                </motion.div>
            </motion.div>

            <motion.h1 variants={blurFadeIn} className="font-javanese-title text-4xl md:text-5xl text-sogan-gradient mb-4 drop-shadow-lg">
                {data?.couple?.groom?.nickname} <br/> 
                <span className="text-2xl text-white/50 font-javanese-body">&</span> <br/> 
                {data?.couple?.bride?.nickname}
            </motion.h1>

            <motion.p variants={blurFadeIn} className="font-javanese-body text-lg text-[#D4AF37] mt-4 max-w-xs italic">
                "Tresna iku dudu amarga rupa, nanging amarga ati kang tulus..."
            </motion.p>
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
        <JavaneseFlower className="top-1/4 -right-16 w-48 h-48 opacity-40" delay={0.2} />
        <JavaneseFlower className="bottom-1/4 -left-16 w-48 h-48 opacity-40" delay={0.4} />

        <motion.p variants={blurFadeIn} className="font-aksara text-3xl text-[#D4AF37] mb-1">ꦥꦔꦤ꧀ꦠꦺꦤ꧀</motion.p>
        <motion.h2 variants={blurFadeIn} className="font-javanese-title text-2xl md:text-3xl text-sogan-gradient mb-12 uppercase tracking-widest border-b border-[#D4AF37] pb-2">Sang Penganten</motion.h2>

        <div className="flex flex-col gap-12 w-full max-w-sm">
            {/* Groom */}
            <motion.div variants={slideUpPop} className="javanese-panel p-6 javanese-border relative">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[#1A0F0A] ring-2 ring-[#D4AF37] mb-4 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                    <img src={getImageUrl(data?.couple?.groom?.photoUrl || '')} className="w-full h-full object-cover sepia-[0.3]" />
                </div>
                <h3 className="font-javanese-title text-3xl text-[#F5EBE0] drop-shadow-md mb-2">{data?.couple?.groom?.fullName}</h3>
                <p className="font-modern text-[10px] uppercase text-[#D4AF37] tracking-widest mb-3">Kakung Saking</p>
                <p className="font-modern text-xs text-gray-300">Bapak {data?.couple?.groom?.fatherName} <br/> & Ibu {data?.couple?.groom?.motherName}</p>
            </motion.div>

            <motion.div variants={blurFadeIn} className="font-javanese-title text-4xl text-sogan-gradient">&</motion.div>

            {/* Bride */}
            <motion.div variants={slideUpPop} className="javanese-panel p-6 javanese-border relative">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[#1A0F0A] ring-2 ring-[#D4AF37] mb-4 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                    <img src={getImageUrl(data?.couple?.bride?.photoUrl || '')} className="w-full h-full object-cover sepia-[0.3]" />
                </div>
                <h3 className="font-javanese-title text-3xl text-[#F5EBE0] drop-shadow-md mb-2">{data?.couple?.bride?.fullName}</h3>
                <p className="font-modern text-[10px] uppercase text-[#D4AF37] tracking-widest mb-3">Putri Saking</p>
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
            <JavaneseFlower className="top-10 -left-16 w-40 h-40 opacity-40" delay={0.1} />
            <JavaneseFlower className="bottom-20 -right-16 w-56 h-56 opacity-40" delay={0.3} />

            <motion.p variants={blurFadeIn} className="font-aksara text-3xl text-[#D4AF37] mb-1">ꦥꦲꦂꦒꦾꦤ꧀</motion.p>
            <motion.h2 variants={blurFadeIn} className="font-javanese-title text-2xl md:text-3xl text-sogan-gradient mb-8 tracking-widest uppercase border-b border-[#D4AF37] pb-2">Pahargyan</motion.h2>

            <div className="w-full max-w-sm space-y-8">
                {/* Akad */}
                {data?.events?.akad?.enabled !== false && (
                    <motion.div variants={slideUpPop} className="javanese-panel p-6 javanese-border relative overflow-hidden text-left">
                        <div className="absolute top-0 right-0 bg-sogan-gradient text-[#1A0F0A] font-javanese-title px-4 py-1 rounded-bl-lg font-bold">Ijab Kabul</div>
                        
                        <h3 className="font-javanese-title text-3xl text-[#F5EBE0] mb-6 mt-4">{data?.events?.akad?.name || 'Akad Nikah'}</h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 font-modern text-sm text-[#D4AF37]">
                                <Calendar size={18} /> <span>{formatDate(data?.events?.akad?.date || '')}</span>
                            </div>
                            <div className="flex items-center gap-3 font-modern text-sm text-[#D4AF37]">
                                <Clock size={18} /> <span>{data?.events?.akad?.timeStart} - {data?.events?.akad?.timeEnd || 'Selesai'}</span>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-[#D4AF37]/30 text-sm text-gray-300 font-modern">
                            <p className="font-bold text-[#F5EBE0] mb-1"><MapPin className="inline mr-1" /> {data?.events?.akad?.venueName}</p>
                            <p className="text-xs leading-relaxed pl-5">{data?.events?.akad?.address}</p>
                        </div>
                    </motion.div>
                )}

                {/* Resepsi */}
                {data?.events?.resepsi?.enabled !== false && (
                    <motion.div variants={slideUpPop} className="javanese-panel p-6 javanese-border relative overflow-hidden text-left">
                        <div className="absolute top-0 right-0 bg-sogan-gradient text-[#1A0F0A] font-javanese-title px-4 py-1 rounded-bl-lg font-bold">Pahargyan</div>
                        
                        <h3 className="font-javanese-title text-3xl text-[#F5EBE0] mb-6 mt-4">{data?.events?.resepsi?.name || 'Resepsi'}</h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 font-modern text-sm text-[#D4AF37]">
                                <Calendar size={18} /> <span>{formatDate(data?.events?.resepsi?.date || '')}</span>
                            </div>
                            <div className="flex items-center gap-3 font-modern text-sm text-[#D4AF37]">
                                <Clock size={18} /> <span>{data?.events?.resepsi?.timeStart} - {data?.events?.resepsi?.timeEnd || 'Selesai'}</span>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-[#D4AF37]/30 text-sm text-gray-300 font-modern">
                            <p className="font-bold text-[#F5EBE0] mb-1"><MapPin className="inline mr-1" /> {data?.events?.resepsi?.venueName}</p>
                            <p className="text-xs leading-relaxed pl-5">{data?.events?.resepsi?.address}</p>
                        </div>
                    </motion.div>
                )}

                {(data?.events?.resepsi?.googleMapsUrl || data?.events?.akad?.googleMapsUrl) && (
                    <motion.a 
                        variants={blurFadeIn}
                        href={(data?.events?.resepsi?.googleMapsUrl || data?.events?.akad?.googleMapsUrl) as string} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="mt-6 flex items-center justify-center gap-2 w-full py-4 bg-[#D4AF37]/10 border border-[#D4AF37] text-[#D4AF37] hover:bg-sogan-gradient hover:text-[#1A0F0A] transition-colors font-modern font-bold text-xs uppercase tracking-widest rounded shadow-[0_5px_15px_rgba(212,175,55,0.1)]"
                    >
                        <MapPin size={18} /> Kunjuk Peta Lokasi
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
        <JavaneseFlower className="-top-10 right-0 w-48 h-48 opacity-30" delay={0.2} />
        <JavaneseFlower className="-bottom-10 left-0 w-48 h-48 opacity-30" delay={0.4} />

        <motion.p variants={blurFadeIn} className="font-aksara text-3xl text-[#D4AF37] mb-1">ꦒꦭꦺꦫꦶ</motion.p>
        <motion.h2 variants={blurFadeIn} className="font-javanese-title text-2xl md:text-3xl text-sogan-gradient mb-8 tracking-widest uppercase border-b border-[#D4AF37] pb-2">Galeri Foto</motion.h2>
        
        <div className="columns-2 gap-4 w-full max-w-sm space-y-4">
            {data?.gallery && data.gallery.length > 0 ? (
                data.gallery.map((img, i) => (
                    <motion.div 
                        key={i} 
                        variants={slideUpPop}
                        className="break-inside-avoid relative p-1 bg-[#D4AF37]/20 rounded-sm"
                    >
                        <img src={getImageUrl(img)} className="w-full h-auto object-cover sepia-[0.3]" />
                    </motion.div>
                ))
            ) : (
                <p className="text-gray-500 font-modern text-sm col-span-2 py-10">Dereng enten foto.</p>
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
            <JavaneseFlower className="top-20 -right-10 w-52 h-52 opacity-30" delay={0.1} />

            <motion.p variants={blurFadeIn} className="font-aksara text-3xl text-[#D4AF37] mb-1">ꦠꦤ꧀ꦝꦠꦿꦺꦱ꧀ꦤ</motion.p>
            <motion.h2 variants={blurFadeIn} className="font-javanese-title text-2xl md:text-3xl text-sogan-gradient mb-4 tracking-widest uppercase border-b border-[#D4AF37] pb-2">Tandha Tresna</motion.h2>
            <motion.p variants={blurFadeIn} className="font-modern text-xs text-gray-400 max-w-xs mb-8 leading-relaxed">Pangestu panjenengan minangka kado ingkang paling aji. Menawi panjenengan badhe paring tandha tresna, saged lumantar fitur ing ngandhap menika.</motion.p>

            <div className="w-full max-w-sm space-y-6">
                {data?.gifts?.map((gift, i) => (
                    <motion.div variants={slideUpPop} key={i} className="javanese-panel p-6 javanese-border relative text-left">
                        <div className="relative z-10">
                            <h4 className="font-javanese-title text-2xl text-[#F5EBE0] mb-4">{gift.name}</h4>
                            <p className="font-modern text-[10px] uppercase text-[#D4AF37] tracking-widest mb-1">Nomer Rekening / Alamat</p>
                            <p className="font-modern font-bold text-xl text-white mb-4 tracking-wider">{gift.accountNumber}</p>
                            
                            <p className="font-modern text-[10px] uppercase text-[#D4AF37] tracking-widest mb-1">Atas Nama</p>
                            <p className="font-modern text-sm text-gray-300 mb-6">{gift.accountHolder}</p>

                            {gift.type !== 'address' && (
                                <button
                                    onClick={() => handleCopy(gift.id || String(i), gift.accountNumber)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#D4AF37]/10 hover:bg-sogan-gradient border border-[#D4AF37] hover:text-[#1A0F0A] text-[#D4AF37] transition-colors rounded font-modern text-xs uppercase font-bold tracking-wider"
                                >
                                    {copiedId === (gift.id || String(i)) ? (
                                        <><Check size={16} /> Kasalin</>
                                    ) : (
                                        <><Copy size={16} /> Salin Nomer</>
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
            <JavaneseFlower className="top-32 -left-20 w-64 h-64 opacity-40" delay={0.2} />
            
            <motion.p variants={blurFadeIn} className="font-aksara text-3xl text-[#D4AF37] mb-1">ꦥꦔꦼꦱ꧀ꦠꦸ</motion.p>
            <motion.h2 variants={blurFadeIn} className="font-javanese-title text-2xl md:text-3xl text-sogan-gradient mb-8 tracking-widest uppercase border-b border-[#D4AF37] pb-2">RSVP & Pandonga</motion.h2>
            
            <div className="w-full max-w-sm">
                <AnimatePresence mode="wait">
                    {rsvpSuccess ? (
                        <motion.div 
                            key="success"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="javanese-panel p-8 text-center"
                        >
                            <Check className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
                            <h3 className="font-javanese-title text-2xl text-[#F5EBE0] mb-2">Matur Nuwun</h3>
                            <p className="font-modern text-sm text-gray-300 leading-relaxed">Konfirmasi saha pandonga panjenengan sampun katampi.</p>
                        </motion.div>
                    ) : (
                        <motion.form 
                            key="form"
                            variants={slideUpPop}
                            onSubmit={handleRSVPSubmit}
                            className="javanese-panel p-6 javanese-border text-left space-y-4"
                        >
                            <div>
                                <label className="block font-modern text-[10px] text-[#D4AF37] uppercase tracking-widest mb-1">Asma Jangkep</label>
                                <input
                                    type="text" required value={rsvpGuestName} onChange={(e) => setRsvpGuestName(e.target.value)} disabled={!!guest}
                                    className="w-full bg-[#1A0F0A] border border-[#D4AF37]/30 rounded-sm px-3 py-2 text-[#F5EBE0] font-modern text-sm focus:border-[#D4AF37] focus:outline-none disabled:opacity-50"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-modern text-[10px] text-[#D4AF37] uppercase tracking-widest mb-1">Saged Rawuh?</label>
                                    <div className="relative">
                                        <select
                                            value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value as any)}
                                            className="w-full bg-[#1A0F0A] border border-[#D4AF37]/30 rounded-sm px-3 py-2 text-[#F5EBE0] font-modern text-sm focus:border-[#D4AF37] focus:outline-none appearance-none"
                                        >
                                            <option value="Hadir">Saged Rawuh</option>
                                            <option value="Tidak Hadir">Boten Saged</option>
                                            <option value="Ragu-ragu">Dereng Mesthekaken</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4AF37] pointer-events-none" size={14} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-modern text-[10px] text-[#D4AF37] uppercase tracking-widest mb-1">Cacah Tamu</label>
                                    <input
                                        type="number" min="1" max={guest ? guest.paxLimit : 10} value={rsvpPaxCount} onChange={(e) => setRsvpPaxCount(Number(e.target.value))}
                                        className="w-full bg-[#1A0F0A] border border-[#D4AF37]/30 rounded-sm px-3 py-2 text-[#F5EBE0] font-modern text-sm focus:border-[#D4AF37] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-modern text-[10px] text-[#D4AF37] uppercase tracking-widest mb-1">Pandonga & Pangarep</label>
                                <textarea
                                    required value={rsvpWishes} onChange={(e) => setRsvpWishes(e.target.value)} rows={3}
                                    className="w-full bg-[#1A0F0A] border border-[#D4AF37]/30 rounded-sm px-3 py-2 text-[#F5EBE0] font-modern text-sm focus:border-[#D4AF37] focus:outline-none resize-none"
                                />
                            </div>

                            <button type="submit" className="w-full mt-2 py-3 bg-sogan-gradient text-[#1A0F0A] font-bold font-modern text-xs uppercase tracking-widest rounded shadow-[0_5px_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all">
                                Kirim Konfirmasi
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Wishes List */}
                {rsvps && rsvps.length > 0 && (
                    <motion.div variants={slideUpPop} className="mt-8 space-y-4 max-h-[400px] overflow-y-auto custom-scroll pr-2 text-left">
                        {rsvps.map((rsvp, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-[#1A0F0A]/90 p-4 rounded-sm border-l-4 border-[#D4AF37] shadow-lg"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-javanese-title text-lg text-[#F5EBE0]">{rsvp.guestName}</span>
                                    <span className={`text-[8px] uppercase tracking-widest font-bold px-2 py-1 rounded-sm ${
                                        rsvp.status === 'Hadir' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' :
                                        rsvp.status === 'Tidak Hadir' ? 'bg-red-900/50 text-red-400' :
                                        'bg-yellow-900/50 text-yellow-400'
                                    }`}>
                                        {rsvp.status === 'Hadir' ? 'Rawuh' : rsvp.status === 'Tidak Hadir' ? 'Boten' : 'Ragu'}
                                    </span>
                                </div>
                                <p className="font-modern text-xs text-gray-400 leading-relaxed italic">"{rsvp.wishes}"</p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

// --- MAIN LAYOUT ---
interface JavaneseClassicProps {
    data: WeddingData;
    theme: ThemeConfig;
    guest?: Guest | null;
    onAddRSVP: (rsvp: RSVP) => void;
    rsvps: RSVP[];
    embedded?: boolean;
}

const JavaneseClassicLayout: React.FC<JavaneseClassicProps> = ({ data, guest, onAddRSVP, rsvps, embedded = false }) => {
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
        <div className="relative w-full h-[100dvh] overflow-hidden bg-[#1A0F0A] text-[#F5EBE0]">
            <GlobalStyles />
            <audio ref={audioRef} loop src={data?.musicUrl || "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg"} />

            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <KawungBatik className="absolute inset-0 w-full h-full opacity-10" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] mix-blend-overlay opacity-50"></div>
                
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#1A0F0A_100%)] opacity-80"></div>
            </div>

            <AnimatePresence>
                {stage === 'envelope' && (
                    <GununganEnvelope onOpen={enterContent} data={data} guestName={guest?.name || 'Tamu Undangan'} />
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
                    transition={{ delay: 0.8, type: "spring", stiffness: 100, damping: 20 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
                >
                    <div className="javanese-panel px-6 py-3 flex justify-between items-center rounded shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                        {[
                            { id: 'home', icon: Lotus },
                            { id: 'couple', icon: User },
                            { id: 'event', icon: Calendar },
                            { id: 'gallery', icon: ImageIcon },
                            { id: 'gift', icon: Gift },
                            { id: 'rsvp', icon: MessageCircle }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`relative flex flex-col items-center justify-center p-2 transition-colors ${activeTab === item.id ? 'text-[#D4AF37]' : 'text-[#8A6B22] hover:text-[#D4AF37]'}`}
                            >
                                <item.icon size={22} weight={activeTab === item.id ? "fill" : "regular"} />
                                {activeTab === item.id && (
                                    <motion.div layoutId="nav-indicator-jawa" className="absolute -bottom-1 w-6 h-0.5 bg-[#D4AF37] rounded-full drop-shadow-[0_0_5px_#D4AF37]" />
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default JavaneseClassicLayout;

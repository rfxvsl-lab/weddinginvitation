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
    PiSparkleDuotone as Stars,
    PiCheckCircleDuotone as CheckCircle,
    PiGiftDuotone as Gift,
    PiCopyDuotone as CopyIcon,
    PiInstagramLogoDuotone as Instagram,
    PiBookOpenDuotone as BookOpen,
    PiTimerDuotone as Timer,
    PiNavigationArrowDuotone as Navigation,
} from 'react-icons/pi';
import { WeddingData, ThemeConfig, RSVP, Guest } from '../../types';

// ============================================================
// GLOBAL STYLES & ANIMATIONS
// ============================================================
const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&family=Lato:wght@300;400;700&family=Great+Vibes&display=swap');

    .font-javanese { font-family: 'Playfair Display', serif; }
    .font-javanese-accent { font-family: 'Great Vibes', cursive; }
    .font-body { font-family: 'Lato', sans-serif; }

    /* Batik float pattern animation */
    @keyframes batik-float {
      0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.04; }
      50% { transform: translateY(-10px) rotate(1deg); opacity: 0.07; }
    }

    /* Gold text shimmer */
    @keyframes gold-shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .text-gold-shimmer {
      background: linear-gradient(90deg, #C9A84C 0%, #F5D98E 25%, #D4AF37 50%, #F5D98E 75%, #C9A84C 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gold-shimmer 4s ease-in-out infinite;
    }

    /* Fade up reveal */
    @keyframes jc-fade-up {
      0% { opacity: 0; transform: translateY(30px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .jc-fade-up {
      animation: jc-fade-up 0.8s ease-out forwards;
    }
    .jc-fade-up-d1 { animation: jc-fade-up 0.8s ease-out 0.15s forwards; opacity: 0; }
    .jc-fade-up-d2 { animation: jc-fade-up 0.8s ease-out 0.3s forwards; opacity: 0; }
    .jc-fade-up-d3 { animation: jc-fade-up 0.8s ease-out 0.45s forwards; opacity: 0; }

    /* Lock screen curtain */
    @keyframes curtain-open {
      0% { clip-path: inset(0 0 0 0); }
      100% { clip-path: inset(0 0 100% 0); }
    }

    /* Ornament pulse */
    @keyframes ornament-glow {
      0%, 100% { filter: drop-shadow(0 0 2px rgba(212,175,55,0.3)); }
      50% { filter: drop-shadow(0 0 8px rgba(212,175,55,0.5)); }
    }

    /* Kawung dot pattern */
    .bg-kawung {
      background-image: radial-gradient(circle, rgba(201,168,76,0.08) 2px, transparent 2px);
      background-size: 24px 24px;
    }

    /* Batik parang pattern overlay */
    .bg-batik-parang {
      background-image: 
        repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(201,168,76,0.04) 12px, rgba(201,168,76,0.04) 14px),
        repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(123,30,46,0.03) 12px, rgba(123,30,46,0.03) 14px);
    }

    /* Scrollbar styling */
    .javanese-scroll::-webkit-scrollbar { width: 4px; }
    .javanese-scroll::-webkit-scrollbar-track { background: transparent; }
    .javanese-scroll::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 999px; }
    `}</style>
);

// ============================================================
// SVG ORNAMENTS
// ============================================================

/** Gapura / Gunungan Wayang ornament — simplified inline SVG */
const GapuraOrnament = ({ className = '', color = '#C9A84C' }: { className?: string; color?: string }) => (
    <svg viewBox="0 0 400 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Gunungan shape */}
        <path d="M200 10 L280 100 L120 100 Z" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M200 25 L265 95 L135 95 Z" stroke={color} strokeWidth="0.8" fill="none" opacity="0.3" />
        {/* Decorative side curls */}
        <path d="M120 100 Q80 90 60 100 Q40 110 20 100" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
        <path d="M280 100 Q320 90 340 100 Q360 110 380 100" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
        {/* Center diamond */}
        <path d="M200 50 L210 65 L200 80 L190 65 Z" fill={color} opacity="0.15" />
        <path d="M200 50 L210 65 L200 80 L190 65 Z" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5" />
        {/* Small dots */}
        <circle cx="200" cy="40" r="2" fill={color} opacity="0.4" />
        <circle cx="190" cy="55" r="1.5" fill={color} opacity="0.3" />
        <circle cx="210" cy="55" r="1.5" fill={color} opacity="0.3" />
    </svg>
);

/** Ornamental divider — Javanese motif */
const BatikDivider = ({ color = '#C9A84C' }: { color?: string }) => (
    <div className="flex items-center justify-center gap-3 my-8 px-8">
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}40)` }} />
        <svg viewBox="0 0 40 20" className="w-10 h-5" fill="none">
            <path d="M20 2 L28 10 L20 18 L12 10 Z" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
            <circle cx="20" cy="10" r="2" fill={color} opacity="0.5" />
            <circle cx="8" cy="10" r="1.5" fill={color} opacity="0.3" />
            <circle cx="32" cy="10" r="1.5" fill={color} opacity="0.3" />
        </svg>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${color}40)` }} />
    </div>
);

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    } catch { return dateStr; }
}

function getImageUrl(url: string): string {
    if (!url) return '';
    const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    return url;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

interface TemplateProps {
    data: WeddingData;
    theme: ThemeConfig;
    guest?: Guest | null;
    onAddRSVP: (rsvp: RSVP) => void;
    rsvps: RSVP[];
    embedded?: boolean;
}

export default function JavaneseClassicLayout({ data, theme, guest, onAddRSVP, rsvps, embedded = false }: TemplateProps) {
    const [isOpen, setIsOpen] = useState(embedded);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // RSVP Form
    const [rsvpGuestName, setRsvpGuestName] = useState(guest?.name || '');
    const [rsvpStatus, setRsvpStatus] = useState<'Hadir' | 'Tidak Hadir' | 'Ragu-ragu'>('Hadir');
    const [rsvpPaxCount, setRsvpPaxCount] = useState(1);
    const [rsvpWishes, setRsvpWishes] = useState('');
    const [rsvpSuccess, setRsvpSuccess] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Countdown
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!data.countdownDate) return;
        const tick = () => {
            const diff = new Date(data.countdownDate).getTime() - Date.now();
            if (diff <= 0) { setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
            setCountdown({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            });
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [data.countdownDate]);

    const handleOpen = () => {
        setIsOpen(true);
        try {
            audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
        } catch {}
        setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    };

    const toggleMusic = () => {
        if (!audioRef.current) return;
        if (isPlaying) { audioRef.current.pause(); }
        else { audioRef.current.play().catch(() => {}); }
        setIsPlaying(!isPlaying);
    };

    const handleRSVPSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rsvpGuestName.trim()) return;
        onAddRSVP({
            id: `rsvp-${Date.now()}`,
            guestId: guest?.id,
            guestName: rsvpGuestName.trim(),
            status: rsvpStatus,
            paxCount: rsvpPaxCount,
            wishes: rsvpWishes,
            timestamp: new Date().toISOString(),
        });
        setRsvpSuccess(true);
        setRsvpWishes('');
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // ==========================================
    // CONDITIONAL CHECKS
    // ==========================================
    const hasQuote = !!data.quoteText?.trim();
    const hasAkad = data.events.akad.enabled !== false && !!(data.events.akad.date || data.events.akad.venueName);
    const hasResepsi = data.events.resepsi.enabled !== false && !!(data.events.resepsi.date || data.events.resepsi.venueName);
    const hasCountdown = !!data.countdownDate;
    const hasLoveStories = data.showLoveStories && data.loveStories && data.loveStories.length > 0;
    const hasGallery = data.gallery && data.gallery.filter(url => url).length > 0;
    const hasGifts = data.gifts && data.gifts.length > 0;

    const primaryColor = theme.primaryHex || '#7B1E2E';
    const goldColor = theme.secondaryHex || '#C9A84C';
    const accentColor = theme.accentHex || '#D4AF37';
    const bgColor = theme.bgHex || '#FDF6EC';
    const textColor = theme.textHex || '#3A1F04';

    return (
        <div
            className="relative w-full min-h-screen font-body javanese-scroll overflow-x-hidden"
            style={{
                '--theme-primary': primaryColor,
                '--theme-secondary': goldColor,
                '--theme-bg': bgColor,
                '--theme-text': textColor,
                '--theme-accent': accentColor,
                backgroundColor: bgColor,
                color: textColor,
            } as React.CSSProperties}
        >
            <GlobalStyles />
            <audio ref={audioRef} src={data.musicUrl || ''} loop preload="auto" />

            {/* ============================================================ */}
            {/* SECTION 1: LOCK SCREEN                                       */}
            {/* ============================================================ */}
            {!isOpen && (
                <div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-batik-parang"
                    style={{ backgroundColor: primaryColor }}
                >
                    {/* Batik pattern overlay */}
                    <div className="absolute inset-0 bg-kawung opacity-30" />
                    <div className="absolute inset-0" style={{
                        background: `radial-gradient(ellipse at center, ${primaryColor}00 0%, ${primaryColor} 70%)`
                    }} />

                    <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
                        {/* Gapura ornament */}
                        <GapuraOrnament className="w-56 mb-4 jc-fade-up" color={goldColor} />

                        <p className="font-javanese-accent text-2xl mb-2 jc-fade-up" style={{ color: goldColor }}>
                            Undangan Pernikahan
                        </p>

                        <h1 className="font-javanese text-3xl md:text-4xl font-bold text-white mb-1 jc-fade-up-d1 tracking-wide">
                            {data.couple.groom.nickname}
                        </h1>
                        <p className="font-javanese-accent text-3xl text-white/70 mb-1 jc-fade-up-d1">&</p>
                        <h1 className="font-javanese text-3xl md:text-4xl font-bold text-white mb-4 jc-fade-up-d1 tracking-wide">
                            {data.couple.bride.nickname}
                        </h1>

                        {guest && (
                            <p className="text-sm text-white/60 mb-4 jc-fade-up-d2">
                                Kepada Yth. <span className="font-bold text-white/90">{guest.name}</span>
                            </p>
                        )}

                        <p className="text-xs text-white/40 mb-6 jc-fade-up-d2">
                            {data.countdownDate ? formatDate(data.countdownDate) : ''}
                        </p>

                        <button
                            onClick={handleOpen}
                            className="group relative px-8 py-3 rounded-full font-javanese text-sm font-bold uppercase tracking-[0.2em] transition-all duration-500 jc-fade-up-d3 cursor-pointer overflow-hidden"
                            style={{
                                border: `1.5px solid ${goldColor}`,
                                color: goldColor,
                                background: 'transparent',
                            }}
                        >
                            <span className="relative z-10 group-hover:text-white transition-colors duration-300">Buka Undangan</span>
                            <div className="absolute inset-0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" style={{ backgroundColor: goldColor }} />
                        </button>
                    </div>

                    {/* Bottom ornament */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                        <GapuraOrnament className="w-32 rotate-180 opacity-30" color={goldColor} />
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* MAIN CONTENT (scrollable after lock screen opens)             */}
            {/* ============================================================ */}
            <div ref={contentRef} className={`transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

                {/* ============================================================ */}
                {/* SECTION 2: HERO HEADER                                       */}
                {/* ============================================================ */}
                <section className="relative py-20 md:py-28 text-center overflow-hidden bg-batik-parang">
                    {/* Background overlay */}
                    <div className="absolute inset-0 bg-kawung" />
                    <div className="absolute inset-0" style={{
                        background: `linear-gradient(180deg, ${bgColor} 0%, transparent 30%, transparent 70%, ${bgColor} 100%)`
                    }} />

                    <div className="relative z-10 px-6">
                        <GapuraOrnament className="w-48 mx-auto mb-6" color={goldColor} />

                        <p className="font-javanese-accent text-2xl md:text-3xl mb-4" style={{ color: goldColor }}>
                            Bismillahirrahmanirrahim
                        </p>

                        <h2 className="font-javanese text-4xl md:text-6xl font-bold mb-2 text-gold-shimmer">
                            {data.couple.groom.nickname}
                        </h2>
                        <p className="font-javanese-accent text-4xl md:text-5xl my-2" style={{ color: goldColor }}>&</p>
                        <h2 className="font-javanese text-4xl md:text-6xl font-bold mb-6 text-gold-shimmer">
                            {data.couple.bride.nickname}
                        </h2>

                        {data.countdownDate && (
                            <p className="font-body text-sm tracking-[0.3em] uppercase opacity-60">
                                {formatDate(data.countdownDate)}
                            </p>
                        )}
                    </div>
                </section>

                {/* ============================================================ */}
                {/* SECTION 3: KUTIPAN SUCI (CONDITIONAL)                        */}
                {/* ============================================================ */}
                {hasQuote && (
                    <section className="py-16 px-6 text-center">
                        <div className="max-w-lg mx-auto relative">
                            <Stars className="w-6 h-6 mx-auto mb-4" style={{ color: goldColor }} />
                            <blockquote
                                className="font-javanese text-lg md:text-xl italic leading-relaxed mb-3"
                                style={{ color: textColor }}
                            >
                                "{data.quoteText}"
                            </blockquote>
                            {data.quoteSource && (
                                <cite className="text-sm font-body not-italic opacity-50">
                                    — {data.quoteSource}
                                </cite>
                            )}
                        </div>
                        <BatikDivider color={goldColor} />
                    </section>
                )}

                {/* ============================================================ */}
                {/* SECTION 4: PROFIL MEMPELAI                                   */}
                {/* ============================================================ */}
                <section className="py-12 px-6">
                    <div className="max-w-2xl mx-auto">
                        <h3 className="font-javanese-accent text-3xl text-center mb-10" style={{ color: goldColor }}>
                            Mempelai
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Groom */}
                            <div className="text-center jc-fade-up">
                                <div className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden border-4" style={{ borderColor: goldColor + '40' }}>
                                    {data.couple.groom.photoUrl ? (
                                        <img src={getImageUrl(data.couple.groom.photoUrl)} alt={data.couple.groom.nickname} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: primaryColor + '15' }}>
                                            <User className="w-16 h-16" style={{ color: goldColor + '40' }} />
                                        </div>
                                    )}
                                    {/* Gold ring accent */}
                                    <div className="absolute inset-0 rounded-full" style={{ boxShadow: `inset 0 0 20px ${goldColor}20` }} />
                                </div>
                                <h4 className="font-javanese text-xl font-bold mb-1">{data.couple.groom.fullName}</h4>
                                <p className="text-xs opacity-60 mb-2">Putra dari</p>
                                <p className="text-sm font-medium">{data.couple.groom.fatherName}</p>
                                <p className="text-sm opacity-70">& {data.couple.groom.motherName}</p>
                                {data.couple.groom.instagram && (
                                    <a href={`https://instagram.com/${data.couple.groom.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs mt-3 opacity-50 hover:opacity-100 transition">
                                        <Instagram className="w-3.5 h-3.5" /> {data.couple.groom.instagram}
                                    </a>
                                )}
                            </div>

                            {/* Bride */}
                            <div className="text-center jc-fade-up-d1">
                                <div className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden border-4" style={{ borderColor: goldColor + '40' }}>
                                    {data.couple.bride.photoUrl ? (
                                        <img src={getImageUrl(data.couple.bride.photoUrl)} alt={data.couple.bride.nickname} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: primaryColor + '15' }}>
                                            <User className="w-16 h-16" style={{ color: goldColor + '40' }} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 rounded-full" style={{ boxShadow: `inset 0 0 20px ${goldColor}20` }} />
                                </div>
                                <h4 className="font-javanese text-xl font-bold mb-1">{data.couple.bride.fullName}</h4>
                                <p className="text-xs opacity-60 mb-2">Putri dari</p>
                                <p className="text-sm font-medium">{data.couple.bride.fatherName}</p>
                                <p className="text-sm opacity-70">& {data.couple.bride.motherName}</p>
                                {data.couple.bride.instagram && (
                                    <a href={`https://instagram.com/${data.couple.bride.instagram.replace('@', '')}`} target="_blank" rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs mt-3 opacity-50 hover:opacity-100 transition">
                                        <Instagram className="w-3.5 h-3.5" /> {data.couple.bride.instagram}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                    <BatikDivider color={goldColor} />
                </section>

                {/* ============================================================ */}
                {/* SECTION 5-6: DETAIL ACARA (CONDITIONAL)                      */}
                {/* ============================================================ */}
                {(hasAkad || hasResepsi) && (
                    <section className="py-12 px-6">
                        <div className="max-w-2xl mx-auto">
                            <h3 className="font-javanese-accent text-3xl text-center mb-10" style={{ color: goldColor }}>
                                Waktu & Tempat
                            </h3>

                            <div className={`grid grid-cols-1 ${hasAkad && hasResepsi ? 'md:grid-cols-2' : ''} gap-6`}>
                                {/* Akad Card */}
                                {hasAkad && (
                                    <div className="relative rounded-2xl p-6 text-center overflow-hidden border" style={{
                                        borderColor: goldColor + '30',
                                        backgroundColor: bgColor,
                                        boxShadow: `0 4px 30px ${goldColor}10`
                                    }}>
                                        <div className="absolute inset-0 bg-kawung opacity-50" />
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: primaryColor + '15' }}>
                                                <BookOpen className="w-5 h-5" style={{ color: primaryColor }} />
                                            </div>
                                            <h4 className="font-javanese text-lg font-bold mb-3" style={{ color: primaryColor }}>
                                                {data.events.akad.name || 'Akad Nikah'}
                                            </h4>
                                            {data.events.akad.date && (
                                                <p className="flex items-center justify-center gap-1.5 text-sm mb-1.5">
                                                    <Calendar className="w-4 h-4" style={{ color: goldColor }} />
                                                    {formatDate(data.events.akad.date)}
                                                </p>
                                            )}
                                            {(data.events.akad.timeStart || data.events.akad.timeEnd) && (
                                                <p className="flex items-center justify-center gap-1.5 text-sm mb-1.5">
                                                    <Clock className="w-4 h-4" style={{ color: goldColor }} />
                                                    {data.events.akad.timeStart}{data.events.akad.timeEnd ? ` — ${data.events.akad.timeEnd}` : ''}
                                                </p>
                                            )}
                                            {data.events.akad.venueName && (
                                                <p className="flex items-center justify-center gap-1.5 text-sm font-bold mt-3">
                                                    <Home className="w-4 h-4" style={{ color: goldColor }} />
                                                    {data.events.akad.venueName}
                                                </p>
                                            )}
                                            {data.events.akad.address && (
                                                <p className="text-xs opacity-60 mt-1">{data.events.akad.address}</p>
                                            )}
                                            {data.events.akad.googleMapsUrl && (
                                                <a href={data.events.akad.googleMapsUrl} target="_blank" rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition hover:opacity-80"
                                                    style={{ backgroundColor: primaryColor + '15', color: primaryColor }}>
                                                    <MapPin className="w-3.5 h-3.5" /> Buka Peta
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Resepsi Card */}
                                {hasResepsi && (
                                    <div className="relative rounded-2xl p-6 text-center overflow-hidden border" style={{
                                        borderColor: goldColor + '30',
                                        backgroundColor: bgColor,
                                        boxShadow: `0 4px 30px ${goldColor}10`
                                    }}>
                                        <div className="absolute inset-0 bg-kawung opacity-50" />
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: goldColor + '15' }}>
                                                <Stars className="w-5 h-5" style={{ color: goldColor }} />
                                            </div>
                                            <h4 className="font-javanese text-lg font-bold mb-3" style={{ color: primaryColor }}>
                                                {data.events.resepsi.name || 'Resepsi'}
                                            </h4>
                                            {data.events.resepsi.date && (
                                                <p className="flex items-center justify-center gap-1.5 text-sm mb-1.5">
                                                    <Calendar className="w-4 h-4" style={{ color: goldColor }} />
                                                    {formatDate(data.events.resepsi.date)}
                                                </p>
                                            )}
                                            {(data.events.resepsi.timeStart || data.events.resepsi.timeEnd) && (
                                                <p className="flex items-center justify-center gap-1.5 text-sm mb-1.5">
                                                    <Clock className="w-4 h-4" style={{ color: goldColor }} />
                                                    {data.events.resepsi.timeStart}{data.events.resepsi.timeEnd ? ` — ${data.events.resepsi.timeEnd}` : ''}
                                                </p>
                                            )}
                                            {data.events.resepsi.venueName && (
                                                <p className="flex items-center justify-center gap-1.5 text-sm font-bold mt-3">
                                                    <Home className="w-4 h-4" style={{ color: goldColor }} />
                                                    {data.events.resepsi.venueName}
                                                </p>
                                            )}
                                            {data.events.resepsi.address && (
                                                <p className="text-xs opacity-60 mt-1">{data.events.resepsi.address}</p>
                                            )}
                                            {data.events.resepsi.googleMapsUrl && (
                                                <a href={data.events.resepsi.googleMapsUrl} target="_blank" rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition hover:opacity-80"
                                                    style={{ backgroundColor: goldColor + '15', color: goldColor }}>
                                                    <MapPin className="w-3.5 h-3.5" /> Buka Peta
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <BatikDivider color={goldColor} />
                    </section>
                )}

                {/* ============================================================ */}
                {/* SECTION 7: COUNTDOWN (CONDITIONAL)                           */}
                {/* ============================================================ */}
                {hasCountdown && (
                    <section className="py-12 px-6 text-center">
                        <h3 className="font-javanese-accent text-3xl mb-8" style={{ color: goldColor }}>
                            Menghitung Hari
                        </h3>
                        <div className="flex justify-center gap-4 md:gap-6 max-w-md mx-auto">
                            {[
                                { val: countdown.days, label: 'Hari' },
                                { val: countdown.hours, label: 'Jam' },
                                { val: countdown.minutes, label: 'Menit' },
                                { val: countdown.seconds, label: 'Detik' },
                            ].map(({ val, label }) => (
                                <div key={label} className="flex flex-col items-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center border"
                                        style={{ borderColor: goldColor + '30', backgroundColor: primaryColor + '08' }}>
                                        <span className="font-javanese text-2xl md:text-3xl font-bold tabular-nums" style={{ color: primaryColor }}>
                                            {String(val).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider mt-2 opacity-50 font-bold">{label}</span>
                                </div>
                            ))}
                        </div>
                        <BatikDivider color={goldColor} />
                    </section>
                )}

                {/* ============================================================ */}
                {/* SECTION 8: LOVE STORIES (CONDITIONAL)                        */}
                {/* ============================================================ */}
                {hasLoveStories && (
                    <section className="py-12 px-6">
                        <div className="max-w-lg mx-auto">
                            <h3 className="font-javanese-accent text-3xl text-center mb-10" style={{ color: goldColor }}>
                                Cerita Cinta Kami
                            </h3>

                            <div className="relative">
                                {/* Vertical timeline line */}
                                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px" style={{ backgroundColor: goldColor + '30' }} />

                                {data.loveStories.map((story, i) => (
                                    <div key={story.id || i} className={`relative flex items-start gap-4 mb-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                        {/* Timeline node */}
                                        <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 z-10"
                                            style={{ borderColor: goldColor, backgroundColor: bgColor }} />

                                        {/* Content card */}
                                        <div className={`ml-10 md:ml-0 md:w-[calc(50%-24px)] ${i % 2 === 0 ? '' : 'md:ml-auto'} rounded-xl p-4 border`}
                                            style={{ borderColor: goldColor + '20', backgroundColor: bgColor, boxShadow: `0 2px 15px ${goldColor}08` }}>
                                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: goldColor }}>{story.year}</span>
                                            <h5 className="font-javanese font-bold mt-1 mb-1.5">{story.title}</h5>
                                            <p className="text-sm opacity-70 leading-relaxed">{story.story}</p>
                                            {story.imageUrl && (
                                                <img src={getImageUrl(story.imageUrl)} alt={story.title} className="w-full h-32 object-cover rounded-lg mt-3" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <BatikDivider color={goldColor} />
                    </section>
                )}

                {/* ============================================================ */}
                {/* SECTION 9: GALERI FOTO (CONDITIONAL)                         */}
                {/* ============================================================ */}
                {hasGallery && (
                    <section className="py-12 px-6">
                        <div className="max-w-2xl mx-auto">
                            <h3 className="font-javanese-accent text-3xl text-center mb-10" style={{ color: goldColor }}>
                                Galeri Kenangan
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {data.gallery.filter(url => url).map((url, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border"
                                        style={{ borderColor: goldColor + '20' }}>
                                        <img src={getImageUrl(url)} alt={`Gallery ${i + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <BatikDivider color={goldColor} />
                    </section>
                )}

                {/* ============================================================ */}
                {/* SECTION 10: KADO DIGITAL (CONDITIONAL)                       */}
                {/* ============================================================ */}
                {hasGifts && (
                    <section className="py-12 px-6">
                        <div className="max-w-lg mx-auto">
                            <h3 className="font-javanese-accent text-3xl text-center mb-3" style={{ color: goldColor }}>
                                Amplop Digital
                            </h3>
                            <p className="text-sm text-center opacity-50 mb-8">
                                Doa restu Anda merupakan karunia yang sangat berarti bagi kami.
                            </p>

                            <div className="space-y-3">
                                {data.gifts.map((gift) => (
                                    <div key={gift.id} className="rounded-xl p-4 border flex items-center justify-between gap-3"
                                        style={{ borderColor: goldColor + '25', backgroundColor: bgColor, boxShadow: `0 2px 15px ${goldColor}08` }}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: goldColor + '15' }}>
                                                <Gift className="w-5 h-5" style={{ color: goldColor }} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: goldColor }}>{gift.name}</p>
                                                <p className="text-sm font-mono truncate">{gift.accountNumber}</p>
                                                <p className="text-xs opacity-50">a.n. {gift.accountHolder}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCopy(gift.accountNumber, gift.id)}
                                            className="shrink-0 p-2 rounded-lg border transition hover:opacity-80"
                                            style={{ borderColor: goldColor + '30' }}>
                                            {copiedId === gift.id ? (
                                                <CheckCircle className="w-4 h-4" style={{ color: '#10B981' }} />
                                            ) : (
                                                <CopyIcon className="w-4 h-4" style={{ color: goldColor }} />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <BatikDivider color={goldColor} />
                    </section>
                )}

                {/* ============================================================ */}
                {/* SECTION 11: RSVP & GUESTBOOK                                 */}
                {/* ============================================================ */}
                <section className="py-12 px-6">
                    <div className="max-w-lg mx-auto">
                        <h3 className="font-javanese-accent text-3xl text-center mb-3" style={{ color: goldColor }}>
                            Konfirmasi Kehadiran
                        </h3>
                        <p className="text-sm text-center opacity-50 mb-8">
                            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.
                        </p>

                        {!rsvpSuccess ? (
                            <form onSubmit={handleRSVPSubmit} className="space-y-4 rounded-2xl p-6 border"
                                style={{ borderColor: goldColor + '25', backgroundColor: bgColor, boxShadow: `0 4px 30px ${goldColor}08` }}>

                                {/* Guest Name */}
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: goldColor }}>Nama Lengkap</label>
                                    <input type="text" required value={rsvpGuestName} onChange={(e) => setRsvpGuestName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition font-body"
                                        style={{ borderColor: goldColor + '30', backgroundColor: 'transparent', color: textColor }}
                                        placeholder="Masukkan nama Anda" />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: goldColor }}>Konfirmasi</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['Hadir', 'Ragu-ragu', 'Tidak Hadir'] as const).map((status) => (
                                            <button key={status} type="button" onClick={() => setRsvpStatus(status)}
                                                className="py-2.5 rounded-xl text-xs font-bold border transition"
                                                style={{
                                                    borderColor: rsvpStatus === status ? primaryColor : goldColor + '30',
                                                    backgroundColor: rsvpStatus === status ? primaryColor + '15' : 'transparent',
                                                    color: rsvpStatus === status ? primaryColor : textColor + '80',
                                                }}>
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Pax */}
                                {rsvpStatus === 'Hadir' && (
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: goldColor }}>Jumlah Tamu</label>
                                        <select value={rsvpPaxCount} onChange={(e) => setRsvpPaxCount(Number(e.target.value))}
                                            className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none font-body"
                                            style={{ borderColor: goldColor + '30', backgroundColor: 'transparent', color: textColor }}>
                                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Orang</option>)}
                                        </select>
                                    </div>
                                )}

                                {/* Wishes */}
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: goldColor }}>Ucapan & Doa</label>
                                    <textarea value={rsvpWishes} onChange={(e) => setRsvpWishes(e.target.value)} rows={3}
                                        className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none resize-none font-body"
                                        style={{ borderColor: goldColor + '30', backgroundColor: 'transparent', color: textColor }}
                                        placeholder="Tuliskan ucapan dan doa untuk kedua mempelai..." />
                                </div>

                                <button type="submit"
                                    className="w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider text-white transition hover:opacity-90"
                                    style={{ backgroundColor: primaryColor }}>
                                    Kirim Konfirmasi
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-8 rounded-2xl border animate-fade-up"
                                style={{ borderColor: goldColor + '25' }}>
                                <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#10B981' }} />
                                <h4 className="font-javanese text-lg font-bold mb-1">Terima Kasih!</h4>
                                <p className="text-sm opacity-60">Konfirmasi kehadiran Anda telah kami terima.</p>
                            </div>
                        )}

                        {/* Guestbook / Wishes List */}
                        {rsvps.length > 0 && (
                            <div className="mt-8 space-y-3">
                                <h4 className="font-javanese text-lg font-bold flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5" style={{ color: goldColor }} />
                                    Ucapan ({rsvps.length})
                                </h4>
                                <div className="max-h-64 overflow-y-auto space-y-2 pr-1 javanese-scroll">
                                    {rsvps.map((entry) => (
                                        <div key={entry.id} className="rounded-xl p-3 border"
                                            style={{ borderColor: goldColor + '15', backgroundColor: primaryColor + '05' }}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-bold">{entry.guestName}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                    entry.status === 'Hadir' ? 'bg-emerald-100 text-emerald-700' :
                                                    entry.status === 'Ragu-ragu' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>{entry.status}</span>
                                            </div>
                                            {entry.wishes && <p className="text-xs opacity-60 leading-relaxed">"{entry.wishes}"</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* ============================================================ */}
                {/* SECTION 12: FOOTER                                           */}
                {/* ============================================================ */}
                <footer className="py-16 text-center px-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-kawung opacity-30" />
                    <div className="relative z-10">
                        <GapuraOrnament className="w-32 mx-auto mb-6" color={goldColor} />

                        <p className="font-javanese-accent text-xl mb-2" style={{ color: goldColor }}>
                            Wassalamu'alaikum Wr. Wb.
                        </p>
                        <h3 className="font-javanese text-2xl md:text-3xl font-bold text-gold-shimmer mb-4">
                            {data.couple.groom.nickname} & {data.couple.bride.nickname}
                        </h3>
                        <p className="text-xs opacity-40">
                            Atas kehadiran dan doa restu Bapak/Ibu/Saudara/i, kami mengucapkan terima kasih.
                        </p>

                        <div className="mt-8">
                            <Heart className="w-5 h-5 mx-auto" style={{ color: primaryColor + '60' }} />
                        </div>
                    </div>
                </footer>

            </div>

            {/* ============================================================ */}
            {/* FLOATING MUSIC BUTTON                                        */}
            {/* ============================================================ */}
            {isOpen && (
                <button
                    onClick={toggleMusic}
                    className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 border"
                    style={{
                        backgroundColor: primaryColor,
                        borderColor: goldColor + '40',
                        color: '#fff',
                    }}
                    title={isPlaying ? 'Pause Musik' : 'Play Musik'}
                >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
            )}
        </div>
    );
}

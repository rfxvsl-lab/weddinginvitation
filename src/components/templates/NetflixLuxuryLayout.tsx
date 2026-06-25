import React, { useState, useEffect, useRef } from 'react';
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

interface EnvelopeProps {
    onOpen: () => void;
    brideName: string;
    groomName: string;
    guestName: string;
}

const NetflixEnvelope = ({ onOpen, brideName, groomName, guestName }: EnvelopeProps) => {
    const [opening, setOpening] = useState(false);

    const handleOpen = () => {
        setOpening(true);
        const audio = new Audio(DEFAULT_ASSETS.tudumSfx);
        audio.volume = 0.5;
        audio.play().catch(() => { });

        setTimeout(onOpen, 2500);
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-1000 ${opening ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
            <div className={`relative w-[320px] h-[220px] md:w-[500px] md:h-[350px] perspective-1000 transition-transform duration-1000 ${opening ? 'translate-y-[200px]' : ''}`}>

                {/* Kartu/Undangan di Dalam */}
                <div className={`absolute top-2 left-2 right-2 bottom-4 bg-[#141414] shadow-md flex flex-col items-center justify-center z-10 border border-gray-800 ${opening ? 'paper-rise' : 'opacity-0'}`}>
                    <h2 className="font-netflix text-4xl md:text-5xl text-[#E50914] tracking-widest mb-1 text-center leading-none">
                        {groomName} & {brideName}
                    </h2>
                    <p className="font-body text-[8px] tracking-[0.3em] text-gray-400 uppercase mt-2">A Wedding Series Premiere</p>

                    {/* Guest Name */}
                    <div className="mt-6">
                        <p className="font-body text-[9px] text-gray-500 italic mb-1">Kepada Yth,</p>
                        <p className="font-body text-base text-white">{guestName}</p>
                    </div>

                    <div className="mt-4 flex gap-1 h-4 opacity-50">
                        {[...Array(20)].map((_, i) => <div key={i} className="w-1 bg-gray-500 h-full"></div>)}
                    </div>
                </div>

                {/* Amplop Belakang */}
                <div className="absolute inset-0 bg-[#b81d24] rounded-b-lg shadow-2xl z-20 overflow-hidden border-t border-[#8e161b]"></div>

                {/* Flap */}
                <div className={`absolute top-0 left-0 right-0 h-1/2 bg-[#d6232b] z-30 origin-top flex items-center justify-center shadow-lg transition-all ${opening ? 'flap-open' : ''}`} style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}>
                    <button
                        onClick={handleOpen}
                        className={`w-14 h-14 bg-black rounded-full border-[2px] border-[#E50914] shadow-xl flex items-center justify-center group hover:scale-110 transition-transform ${opening ? 'opacity-0' : ''}`}
                    >
                        <span className="font-netflix text-[#E50914] text-2xl mt-1">N</span>
                    </button>
                </div>

                {/* Amplop Depan */}
                <div className="absolute inset-0 z-40 pointer-events-none">
                    <div className="absolute bottom-0 left-0 w-full h-full bg-[#E50914]" style={{ clipPath: 'polygon(0 100%, 50% 45%, 100% 100%)' }}></div>
                    <div className="absolute top-0 left-0 w-1/2 h-full bg-[#bf1319]" style={{ clipPath: 'polygon(0 0, 0 100%, 100% 45%)' }}></div>
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-[#b01016]" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 45%)' }}></div>
                </div>

                {!opening && (
                    <div className="absolute -bottom-20 w-full text-center">
                        <p className="text-gray-400 font-body text-xs tracking-widest animate-pulse">TAP N LOGO TO OPEN</p>
                    </div>
                )}
            </div>
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

const HomePage = ({ onPlay, data }: { onPlay: () => void, data: WeddingData }) => {
    return (
        <div className="flex flex-col h-full relative page-enter overflow-hidden">
            <div className="absolute inset-0">
                <img src={getImageUrl(data?.bgImageUrl || data?.couple?.bride?.photoUrl || DEFAULT_ASSETS.defaultCover)} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent"></div>
            </div>

            <div className="relative z-10 flex flex-col justify-end h-full p-8 pb-32 md:pb-12 md:justify-center md:items-start md:pl-16">
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-[#E50914] text-white text-[10px] font-bold px-1 py-0.5 rounded-sm">N</span>
                    <span className="text-gray-300 text-xs font-bold tracking-widest uppercase">Series</span>
                </div>

                <h1 className="font-netflix text-7xl md:text-9xl text-white leading-[0.85] mb-4 drop-shadow-lg">
                    {data?.couple?.groom?.nickname} <br /> <span className="text-[#E50914]">&</span> {data?.couple?.bride?.nickname}
                </h1>

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
            </div>
        </div>
    );
};

const QuotePage = ({ data }: { data: WeddingData }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 page-enter relative bg-[#141414]">
        <div className="w-16 h-1 bg-[#E50914] mb-8"></div>
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/23/Bismillah.svg" className="h-10 mb-8 opacity-70 invert" alt="Bismillah" />
        <p className="font-body text-lg md:text-xl leading-relaxed text-gray-300 max-w-lg mb-8 italic">
            "{data?.quoteText}"
        </p>
        <p className="font-netflix text-2xl text-[#E50914] tracking-widest">{data?.quoteSource}</p>
    </div>
);

const CouplePage = ({ data }: { data: WeddingData }) => (
    <div className="h-full overflow-y-auto custom-scroll p-6 pt-10 pb-24 page-enter">
        <h2 className="text-white font-body font-bold text-2xl mb-6">Cast & Crew</h2>
        <div className="grid md:grid-cols-2 gap-6">
            {/* Groom Card */}
            <div className="group relative h-80 rounded-md overflow-hidden cursor-pointer">
                <img src={getImageUrl(data?.couple?.groom?.photoUrl || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400")} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-netflix text-4xl text-white">{data?.couple?.groom?.fullName}</h3>
                    <p className="text-gray-400 text-xs font-bold uppercase">The Groom</p>
                    <p className="text-gray-500 text-[10px] mt-1">Bpk. {data?.couple?.groom?.fatherName} & Ibu {data?.couple?.groom?.motherName}</p>
                </div>
            </div>

            {/* Bride Card */}
            <div className="group relative h-80 rounded-md overflow-hidden cursor-pointer">
                <img src={getImageUrl(data?.couple?.bride?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400")} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-netflix text-4xl text-white">{data?.couple?.bride?.fullName}</h3>
                    <p className="text-gray-400 text-xs font-bold uppercase">The Bride</p>
                    <p className="text-gray-500 text-[10px] mt-1">Bpk. {data?.couple?.bride?.fatherName} & Ibu {data?.couple?.bride?.motherName}</p>
                </div>
            </div>
        </div>
    </div>
);

const EventPage = ({ data }: { data: WeddingData }) => {
    return (
        <div className="h-full p-6 pt-10 pb-24 page-enter overflow-y-auto custom-scroll">
            <h2 className="text-white font-body font-bold text-2xl mb-6">Episodes</h2>
            <div className="flex flex-col gap-4">

                {/* Akad */}
                {data?.events?.akad?.enabled !== false && (
                    <div className="flex gap-4 p-4 hover:bg-[#202020] rounded transition-colors cursor-pointer group border-b border-gray-800">
                        <div className="relative w-32 h-20 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                            <div className="absolute inset-0 flex items-center justify-center text-[#E50914] font-netflix text-3xl z-10">01</div>
                            <img src={data?.events?.akad?.googleMapsUrl ? "https://source.unsplash.com/random/300x200?mosque" : "https://images.unsplash.com/photo-1587271407850-8d4389181169?w=300"} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="text-white font-bold text-sm md:text-base">{data?.events?.akad?.name || 'Akad Nikah'}</h3>
                                <span className="text-gray-400 text-xs">{data?.events?.akad?.timeStart}</span>
                            </div>
                            <p className="text-gray-500 text-xs mt-1">{data?.events?.akad?.venueName}</p>
                            <p className="text-gray-500 text-[10px] mt-0.5">{formatDate(data?.events?.akad?.date || '')}</p>
                        </div>
                    </div>
                )}

                {/* Resepsi */}
                {data?.events?.resepsi?.enabled !== false && (
                    <div className="flex gap-4 p-4 hover:bg-[#202020] rounded transition-colors cursor-pointer group border-b border-gray-800">
                        <div className="relative w-32 h-20 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                            <div className="absolute inset-0 flex items-center justify-center text-[#E50914] font-netflix text-3xl z-10">02</div>
                            <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="text-white font-bold text-sm md:text-base">{data?.events?.resepsi?.name || 'Resepsi'}</h3>
                                <span className="text-gray-400 text-xs">{data?.events?.resepsi?.timeStart}</span>
                            </div>
                            <p className="text-gray-500 text-xs mt-1">{data?.events?.resepsi?.venueName}</p>
                            <p className="text-gray-500 text-[10px] mt-0.5">{formatDate(data?.events?.resepsi?.date || '')}</p>
                        </div>
                    </div>
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

const GalleryPage = ({ data }: { data: WeddingData }) => (
    <div className="h-full overflow-y-auto custom-scroll p-6 pt-10 pb-24 page-enter">
        <h2 className="text-white font-body font-bold text-2xl mb-2">Trailers & More</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-6">
            {data?.gallery && data.gallery.length > 0 ? (
                data.gallery.map((img, i) => (
                    <div key={i} className="relative aspect-video group bg-gray-900 rounded overflow-hidden cursor-pointer">
                        <img src={getImageUrl(img) || `https://source.unsplash.com/random/600x400?wedding,love&sig=${i}`} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center bg-black/50">
                                <Play size={16} className="text-white ml-0.5 fill-white" />
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-gray-500 text-sm col-span-3 text-center py-8">No photos in gallery yet.</p>
            )}
        </div>
    </div>
);

const GiftPage = ({ data }: { data: WeddingData }) => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center page-enter bg-[#141414]">
        <h2 className="text-white font-bold mb-6">Digital Gifts</h2>
        <div className="w-full max-w-sm space-y-4 pb-20 overflow-y-auto custom-scroll">
            {data?.gifts?.map((gift, i) => (
                <div key={i} className="bg-[#1f1f1f] rounded-lg p-6 border border-gray-800 shadow-xl text-left relative overflow-hidden">
                    {/* Visa Logo Effect */}
                    <div className="absolute top-6 right-6 text-[#E50914] font-netflix text-xl opacity-80">CARD</div>

                    <p className="text-gray-400 text-xs uppercase mb-1">Bank</p>
                    <p className="text-white font-bold text-lg mb-4">{gift.name}</p>

                    <p className="text-gray-400 text-xs uppercase mb-1">Number</p>
                    <p className="text-white font-mono text-xl tracking-widest mb-4">{gift.accountNumber}</p>

                    <p className="text-gray-400 text-xs uppercase mb-1">Holder</p>
                    <p className="text-white text-sm uppercase">{gift.accountHolder}</p>

                    {gift.type !== 'address' && (
                        <button
                            className="mt-4 w-full py-2 netflix-btn rounded font-bold text-xs flex items-center justify-center gap-2"
                            onClick={(e) => {
                                navigator.clipboard.writeText(gift.accountNumber);
                                const original = e.currentTarget.innerHTML;
                                e.currentTarget.innerHTML = "Copied!";
                                setTimeout(() => e.currentTarget.innerHTML = original, 2000);
                            }}
                        >
                            <Gift size={12} /> Copy Number
                        </button>
                    )}
                </div>
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
        <div className="flex flex-col items-center justify-start h-full p-6 pt-10 page-enter pb-24 overflow-y-auto custom-scroll">
            <h2 className="text-white font-body font-bold text-2xl mb-8">Add to My List (RSVP)</h2>
            <div className="w-full max-w-sm">
                {rsvpSuccess ? (
                    <div className="text-center py-8 bg-[#1f1f1f] rounded-lg border border-gray-800">
                        <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E50914]">
                            <Heart className="w-8 h-8 text-[#E50914]" />
                        </div>
                        <p className="text-white font-bold">RSVP Confirmed</p>
                        <p className="text-gray-400 text-sm mt-2">Thank you for adding this to your list.</p>
                    </div>
                ) : (
                    <form onSubmit={handleRSVPSubmit} className="space-y-4 text-left bg-[#1f1f1f] p-6 rounded-lg border border-gray-800">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                            <input
                                type="text"
                                required
                                value={rsvpGuestName}
                                onChange={(e) => setRsvpGuestName(e.target.value)}
                                disabled={!!guest}
                                className="w-full bg-[#141414] border border-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:border-[#E50914] text-sm"
                                placeholder="Your name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                                <select
                                    value={rsvpStatus}
                                    onChange={(e) => setRsvpStatus(e.target.value as any)}
                                    className="w-full bg-[#141414] border border-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:border-[#E50914] text-sm appearance-none"
                                >
                                    <option value="Hadir">Attending</option>
                                    <option value="Tidak Hadir">Not Attending</option>
                                    <option value="Ragu-ragu">Maybe</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Guests</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={guest ? guest.paxLimit : 10}
                                    value={rsvpPaxCount}
                                    onChange={(e) => setRsvpPaxCount(Number(e.target.value))}
                                    className="w-full bg-[#141414] border border-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:border-[#E50914] text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Message</label>
                            <textarea
                                required
                                value={rsvpWishes}
                                onChange={(e) => setRsvpWishes(e.target.value)}
                                rows={3}
                                className="w-full bg-[#141414] border border-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:border-[#E50914] text-sm resize-none"
                                placeholder="Leave a message..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full mt-4 py-3 netflix-btn text-white rounded font-bold text-sm tracking-wider uppercase transition-colors"
                        >
                            Confirm RSVP
                        </button>
                    </form>
                )}

                {/* List of RSVPs */}
                {rsvps && rsvps.length > 0 && (
                    <div className="mt-8 space-y-3 max-h-64 overflow-y-auto pr-2 custom-scroll">
                        {rsvps.map((rsvp, idx) => (
                            <div key={idx} className="bg-[#1f1f1f] p-4 rounded-lg border border-gray-800">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-white text-sm">{rsvp.guestName}</span>
                                    <span className={`text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${rsvp.status === 'Hadir' ? 'border-green-900 text-green-500 bg-green-900/20' : rsvp.status === 'Tidak Hadir' ? 'border-[#E50914] text-[#E50914] bg-[#E50914]/10' : 'border-yellow-900 text-yellow-500 bg-yellow-900/20'}`}>
                                        {rsvp.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">"{rsvp.wishes}"</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
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
            <audio ref={audioRef} loop src={data?.musicUrl || DEFAULT_ASSETS.bgm} />

            {/* --- LAYER 0: CINEMATIC BACKGROUND --- */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#141414]">
                <div className="film-grain"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,#000000_100%)] opacity-80"></div>
                {/* Static minimal spots if mouse parallax is heavy */}
                <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#E50914] rounded-full blur-[150px] opacity-10 animate-spotlight"></div>
            </div>

            {/* --- LAYER 1: ENVELOPE --- */}
            {stage === 'envelope' && (
                <NetflixEnvelope
                    onOpen={() => setStage('hero')}
                    brideName={data?.couple?.bride?.nickname || 'Bride'}
                    groomName={data?.couple?.groom?.nickname || 'Groom'}
                    guestName={guestName}
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

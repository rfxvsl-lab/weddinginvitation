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
  PiStarDuotone as Star
} from 'react-icons/pi';
import { WeddingData, ThemeConfig, RSVP, Guest } from '../../types';

interface DarkLuxuryLayoutProps {
  data: WeddingData;
  theme: ThemeConfig;
  guest?: Guest | null;
  onAddRSVP: (rsvp: RSVP) => void;
  rsvps: RSVP[];
}

const DarkLuxuryLayout = ({ data, theme, guest, onAddRSVP, rsvps }: DarkLuxuryLayoutProps) => {
  // --- STATE & REFS ---
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // RSVP Form States
  const [rsvpStatus, setRsvpStatus] = useState<'Hadir' | 'Tidak Hadir' | 'Ragu-ragu'>('Hadir');
  const [rsvpPaxCount, setRsvpPaxCount] = useState(1);
  const [rsvpWishes, setRsvpWishes] = useState('');
  const [rsvpGuestName, setRsvpGuestName] = useState('');
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

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
    setIsOpen(true);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Autoplay prevented:", e));
    }
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 800);
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

  // Google Drive Image URL Resolver
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

          <button
            onClick={handleOpen}
            className="group relative px-8 py-3 border text-xs font-bold tracking-[0.2em] uppercase transition-all overflow-hidden"
            style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)' }}
          >
            <span className="relative z-10 group-hover:text-black">BUKA UNDANGAN</span>
            <div className="absolute inset-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0" style={{ backgroundColor: 'var(--theme-primary)' }}></div>
          </button>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div ref={contentRef} className={`relative z-10 transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

        {/* 1. HERO HEADER */}
        <header className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src={getImageUrl(data?.couple?.bride?.photoUrl || '')} className="w-full h-full object-cover opacity-30" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#121212]/50 to-[#121212]"></div>
          </div>

          <div className="relative z-10 reveal-up" style={{ animationDelay: '0.5s' }}>
            <p className={`${theme.fontSerif} text-2xl md:text-3xl text-[#E2E8F0] mb-2 tracking-widest`}>
              {data?.couple?.groom?.nickname} <span style={{ color: 'var(--theme-primary)' }}>&</span> {data?.couple?.bride?.nickname}
            </p>
            <div className="flex items-center justify-center gap-4 my-6">
              <div className="h-[1px] w-12" style={{ backgroundColor: 'var(--theme-primary)' }}></div>
              <p className={`${theme.fontSans} text-xs tracking-[0.3em] uppercase`} style={{ color: 'var(--theme-primary)' }}>WE ARE GETTING MARRIED</p>
              <div className="h-[1px] w-12" style={{ backgroundColor: 'var(--theme-primary)' }}></div>
            </div>
            <p className={`${theme.fontSerif} text-xl text-[#888]`}>
              {formatDate(data.events?.akad?.date || data?.countdownDate || '')}
            </p>
          </div>

          <div className="absolute bottom-10 animate-bounce opacity-50" style={{ color: 'var(--theme-primary)' }}>
            <ArrowDown size={20} />
          </div>
        </header>

        {/* 2. QUOTE */}
        {data?.quoteText && (
          <>
            <section className="py-20 px-8 text-center max-w-3xl mx-auto relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-b from-transparent to-[#333]"></div>

              <h3 className={`${theme.fontSerif} text-3xl mb-6`} style={{ color: 'var(--theme-primary)' }}>Kutipan Suci</h3>
              <blockquote className={`${theme.fontSerif} text-xl md:text-2xl italic leading-relaxed text-[#CCC] border-l-2 pl-6 md:pl-10 text-left md:text-center md:border-l-0 md:border-t-2 md:pt-10`} style={{ borderColor: 'var(--theme-primary)' }}>
                "{data?.quoteText}"
              </blockquote>
              <p className={`${theme.fontSans} text-xs font-bold mt-8 uppercase tracking-widest text-[#666]`}>
                — {data?.quoteSource}
              </p>
            </section>
            <GoldDivider />
          </>
        )}

        {/* 3. COUPLE PROFILES */}
        <section className="py-10 px-6">
          <h2 className={`text-center ${theme.fontSerif} text-4xl mb-16`}><GoldText>Sang Mempelai</GoldText></h2>

          <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
            {/* Groom */}
            <div className="text-center group">
              <div className="relative w-64 h-64 mx-auto mb-8">
                {/* Glowing Ring */}
                <div className="absolute inset-0 rounded-full border shadow-[0_0_15px_rgba(191,149,63,0.3)] group-hover:shadow-[0_0_30px_rgba(191,149,63,0.6)] transition-all duration-700" style={{ borderColor: 'var(--theme-primary)' }}></div>
                <div className="absolute inset-2 rounded-full overflow-hidden">
                  <img src={getImageUrl(data?.couple?.groom?.photoUrl || '')} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Groom" />
                </div>
              </div>
              <h3 className={`${theme.fontSerif} text-3xl mb-2 text-[#E2E8F0]`}>{data?.couple?.groom?.fullName}</h3>
              <p className={`${theme.fontSans} text-xs text-[#666] uppercase tracking-widest mb-1`}>Putra dari</p>
              <p className={`${theme.fontSerif} italic`} style={{ color: 'var(--theme-primary)' }}>{data?.couple?.groom?.fatherName} & {data?.couple?.groom?.motherName}</p>

              {data?.couple?.groom?.instagram && (
                <a href={`https://instagram.com/${data.couple.groom.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-4 text-xs font-body text-[#666] hover:text-[#BF953F] transition-colors border-b border-transparent hover:border-[#BF953F]">
                  <Instagram className="w-3 h-3" /> INSTAGRAM
                </a>
              )}
            </div>

            {/* Bride */}
            <div className="text-center group">
              <div className="relative w-64 h-64 mx-auto mb-8">
                {/* Glowing Ring */}
                <div className="absolute inset-0 rounded-full border shadow-[0_0_15px_rgba(191,149,63,0.3)] group-hover:shadow-[0_0_30px_rgba(191,149,63,0.6)] transition-all duration-700" style={{ borderColor: 'var(--theme-primary)' }}></div>
                <div className="absolute inset-2 rounded-full overflow-hidden">
                  <img src={getImageUrl(data?.couple?.bride?.photoUrl || '')} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Bride" />
                </div>
              </div>
              <h3 className={`${theme.fontSerif} text-3xl mb-2 text-[#E2E8F0]`}>{data?.couple?.bride?.fullName}</h3>
              <p className={`${theme.fontSans} text-xs text-[#666] uppercase tracking-widest mb-1`}>Putri dari</p>
              <p className={`${theme.fontSerif} italic`} style={{ color: 'var(--theme-primary)' }}>{data?.couple?.bride?.fatherName} & {data?.couple?.bride?.motherName}</p>

              {data?.couple?.bride?.instagram && (
                <a href={`https://instagram.com/${data.couple.bride.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-4 text-xs font-body text-[#666] hover:text-[#BF953F] transition-colors border-b border-transparent hover:border-[#BF953F]">
                  <Instagram className="w-3 h-3" /> INSTAGRAM
                </a>
              )}
            </div>
          </div>
        </section>

        <GoldDivider />

        {/* 4. EVENTS (Dark Cards) */}
        <section className="py-10 px-6">
          <h2 className={`text-center ${theme.fontSerif} text-4xl mb-4`}>Rangkaian Acara</h2>
          <p className={`text-center ${theme.fontSans} text-xs text-[#666] tracking-[0.3em] uppercase mb-16`}>Please join us</p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Akad Card */}
            {data.events?.akad?.enabled !== false && (
              <div className="bg-[#1A1A1A] border border-[#333] p-10 text-center relative overflow-hidden group transition-colors duration-500" style={{ '--hover-border': theme.primaryHex } as any}>
                <style>{`.group:hover { border-color: var(--hover-border); }`}</style>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

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
                <div className="my-8 w-12 h-[1px] bg-[#333] mx-auto"></div>
                <h4 className={`${theme.fontSerif} text-xl mb-2`}>{data.events?.akad?.venueName}</h4>
                <p className={`${theme.fontSans} text-xs text-[#888] mb-8`}>{data.events?.akad?.address}</p>

                {data.events?.akad?.googleMapsUrl && (
                  <a href={data.events?.akad?.googleMapsUrl} target="_blank" rel="noreferrer" className={`inline-block border px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all`} style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHex; e.currentTarget.style.color = '#000'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = theme.primaryHex; }}>
                    View Location
                  </a>
                )}
              </div>
            )}

            {/* Resepsi Card */}
            {data.events?.resepsi?.enabled !== false && (
              <div className="bg-[#1A1A1A] border border-[#333] p-10 text-center relative overflow-hidden group transition-colors duration-500" style={{ '--hover-border': theme.primaryHex } as any}>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

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
                <div className="my-8 w-12 h-[1px] bg-[#333] mx-auto"></div>
                <h4 className={`${theme.fontSerif} text-xl mb-2`}>{data.events?.resepsi?.venueName}</h4>
                <p className={`${theme.fontSans} text-xs text-[#888] mb-8`}>{data.events?.resepsi?.address}</p>

                {data.events?.resepsi?.googleMapsUrl && (
                  <a href={data.events?.resepsi?.googleMapsUrl} target="_blank" rel="noreferrer" className={`inline-block border px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all`} style={{ borderColor: 'var(--theme-primary)', color: 'var(--theme-primary)' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = theme.primaryHex; e.currentTarget.style.color = '#000'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = theme.primaryHex; }}>
                    View Location
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 5. GALLERY (High Contrast) */}
        {data?.gallery && data.gallery.length > 0 && (
          <section className="py-20 px-4 bg-[#0A0A0A]">
            <h2 className={`text-center ${theme.fontSerif} text-3xl mb-12 tracking-widest`}>
              <GoldText>Galeri Kenangan</GoldText>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 max-w-6xl mx-auto">
              {data.gallery.map((img, idx) => (
                <div key={idx} className="relative group overflow-hidden aspect-[3/4]">
                  <img
                    src={getImageUrl(img)}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 grayscale group-hover:grayscale-0"
                    alt={`Gallery ${idx + 1}`}
                  />
                  <div className="absolute inset-0 border-[0px] group-hover:border-[4px] transition-all duration-300 pointer-events-none" style={{ borderColor: 'var(--theme-primary)' }}></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. GIFTS (Black Card Style) */}
        {data?.gifts && data.gifts.length > 0 && (
          <section className="py-20 px-6">
            <div className="max-w-xl mx-auto text-center">
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
                        onClick={() => { navigator.clipboard.writeText(gift.accountNumber); alert("Nomor berhasil disalin!"); }}
                        className="absolute bottom-6 right-6 hover:text-white transition-colors"
                        style={{ color: 'var(--theme-primary)' }}
                      >
                        <Copy size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* RSVP SECTION */}
        <section className="py-20 px-6 bg-[#0a0a0a] border-t border-[#222]">
          <div className="max-w-xl mx-auto">
            <h3 className={`${theme.fontSerif} text-3xl mb-8 text-center`} style={{ color: 'var(--theme-primary)' }}>RSVP & Guestbook</h3>
            
            <form onSubmit={handleRSVPSubmit} className="bg-[#111] p-8 rounded-2xl border border-[#333] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent opacity-50"></div>
              
              {rsvpSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: theme.primaryHex + '20' }}>
                    <Heart className="w-8 h-8" style={{ color: 'var(--theme-primary)' }} />
                  </div>
                  <p className={`${theme.fontSerif} text-xl text-[#E2E8F0]`}>Terima kasih atas konfirmasi Anda.</p>
                </div>
              ) : (
                <div className="space-y-5">
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
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-black py-16 text-center border-t border-[#222]">
          <h2 className={`${theme.fontSerif} text-4xl mb-4 text-[#333]`}>{data?.couple?.groom?.nickname} & {data?.couple?.bride?.nickname}</h2>
          <p className={`${theme.fontSans} text-[10px] uppercase tracking-[0.3em]`} style={{ color: 'var(--theme-primary)' }}>Terima Kasih</p>
        </footer>

        <div className="h-24"></div> {/* Spacer */}
      </div>

      {/* === FLOATING NAV (Dark Glass) === */}
      {isOpen && (
        <div className="fixed bottom-6 w-full z-40 px-6 flex justify-center">
          <div className="bg-[#000000]/80 backdrop-blur-md border border-[#333] rounded-full px-8 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-8">
            <button onClick={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-[#666] hover:text-[var(--theme-primary)] transition-colors"><Heart size={20} /></button>
            <button className="text-[#666] hover:text-[var(--theme-primary)] transition-colors"><Calendar size={20} /></button>
            <div className="w-[1px] h-6 bg-[#333]"></div>
            <button onClick={toggleMusic} className="animate-gold-pulse rounded-full" style={{ color: 'var(--theme-primary)' }}>
              {isPlaying ? <Music size={20} /> : <Play size={20} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DarkLuxuryLayout;

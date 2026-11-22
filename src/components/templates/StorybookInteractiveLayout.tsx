"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CalendarPlus,
  Clock,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Share2,
  Heart,
  Send,
  X,
  RotateCcw,
  Instagram,
  Sparkles,
  Gift,
  Users,
} from "lucide-react";
import { WeddingData, ThemeConfig, RSVP, Guest } from "../../types";

interface StorybookInteractiveLayoutProps {
  data: WeddingData;
  theme: ThemeConfig;
  guest?: Guest | null;
  onAddRSVP: (rsvp: RSVP) => void;
  rsvps: RSVP[];
  embedded?: boolean;
  invitationId?: string;
}

type ChapterId = "couple" | "story" | "event" | "gallery" | "rsvp" | "gift";

interface ChapterMeta {
  id: ChapterId;
  roman: string;
  label: string;
  subtitle: string;
}

const formatDateLong = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatDateShort = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getNickname = (fullName?: string, nickname?: string) => {
  if (nickname && nickname.trim()) return nickname.trim();
  if (!fullName) return "";
  return fullName.split(" ")[0].replace(/,+$/, "");
};

const getInitial = (name?: string) =>
  (name || "R").trim().charAt(0).toUpperCase();

const cleanParent = (name?: string) =>
  (name || "").replace(/^(bapak|bpk\.?|ibu)\s+/i, "").trim();

const normalizeImageUrl = (url?: string) => {
  if (!url) return "";
  return url.trim();
};

const PAGE_VARIANTS = {
  enter: (dir: number) => ({
    opacity: 0,
    rotateY: dir > 0 ? 22 : -22,
    x: dir > 0 ? 32 : -32,
  }),
  center: {
    opacity: 1,
    rotateY: 0,
    x: 0,
  },
  exit: (dir: number) => ({
    opacity: 0,
    rotateY: dir > 0 ? -24 : 24,
    x: dir > 0 ? -32 : 32,
  }),
};

const BOOK_STYLES = `
  .sb-linen-cover {
    background-color: #2A1D1B;
    background-image:
      radial-gradient(120% 90% at 25% 15%, rgba(198, 161, 91, 0.16), transparent 60%),
      radial-gradient(90% 80% at 85% 90%, rgba(142, 47, 69, 0.22), transparent 65%),
      repeating-linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.018) 0px,
        rgba(255, 255, 255, 0.018) 1px,
        transparent 1px,
        transparent 3px
      ),
      repeating-linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.015) 0px,
        rgba(255, 255, 255, 0.015) 1px,
        transparent 1px,
        transparent 3px
      );
  }
  .sb-paper-page {
    background-color: #FAF6EE;
    background-image:
      radial-gradient(100% 60% at 50% 0%, rgba(255, 255, 255, 0.65), transparent 70%),
      linear-gradient(90deg, rgba(44, 30, 22, 0.09) 0%, rgba(44, 30, 22, 0.02) 4%, transparent 11%),
      linear-gradient(270deg, rgba(44, 30, 22, 0.04) 0%, transparent 4%);
  }
  .sb-spine-ridge {
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.42) 0%,
      rgba(255, 232, 195, 0.12) 22%,
      rgba(0, 0, 0, 0.28) 46%,
      rgba(255, 255, 255, 0.06) 68%,
      transparent 100%
    );
  }
  .sb-page-edges {
    background: repeating-linear-gradient(
      90deg,
      #EFE7D8 0px,
      #EFE7D8 1px,
      #DDD2BE 1px,
      #DDD2BE 2px
    );
  }
  .sb-dropcap::first-letter {
    float: left;
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 3.1rem;
    line-height: 0.82;
    padding-right: 0.45rem;
    padding-top: 0.15rem;
    color: #8E2F45;
    font-weight: 600;
  }
`;

export default function StorybookInteractiveLayout({
  data,
  guest,
  onAddRSVP,
  rsvps,
  embedded = false,
}: StorybookInteractiveLayoutProps) {
  const [bookOpen, setBookOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // RSVP form state
  const [rsvpName, setRsvpName] = useState(guest?.name || "");
  const [rsvpStatus, setRsvpStatus] = useState<
    "Hadir" | "Ragu-ragu" | "Tidak Hadir"
  >("Hadir");
  const [rsvpPax, setRsvpPax] = useState(1);
  const [rsvpWishes, setRsvpWishes] = useState("");
  const [rsvpError, setRsvpError] = useState("");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Copy & share state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  const groomNick = getNickname(
    data.couple?.groom?.fullName,
    data.couple?.groom?.nickname
  );
  const brideNick = getNickname(
    data.couple?.bride?.fullName,
    data.couple?.bride?.nickname
  );

  const chapters: ChapterMeta[] = useMemo(() => {
    const list: ChapterMeta[] = [
      { id: "couple", roman: "I", label: "Mempelai", subtitle: "Prolog & Kedua Mempelai" },
    ];
    if (
      data.showLoveStories !== false &&
      data.loveStories &&
      data.loveStories.length > 0
    ) {
      list.push({
        id: "story",
        roman: "II",
        label: "Kisah",
        subtitle: "Jejak Perjalanan Cinta",
      });
    }
    list.push({
      id: "event",
      roman: list.length === 2 ? "III" : "II",
      label: "Acara",
      subtitle: "Akad Nikah & Resepsi",
    });
    if (data.gallery && data.gallery.length > 0) {
      list.push({
        id: "gallery",
        roman: ["I", "II", "III", "IV", "V", "VI"][list.length] || "IV",
        label: "Album",
        subtitle: "Potret Kenangan",
      });
    }
    list.push({
      id: "rsvp",
      roman: ["I", "II", "III", "IV", "V", "VI"][list.length] || "V",
      label: "Ucapan",
      subtitle: "Buku Tamu & Konfirmasi",
    });
    list.push({
      id: "gift",
      roman: ["I", "II", "III", "IV", "V", "VI"][list.length] || "VI",
      label: "Penutup",
      subtitle:
        data.gifts && data.gifts.length > 0
          ? "Tanda Kasih & Epilog"
          : "Epilog & Terima Kasih",
    });
    return list;
  }, [data.showLoveStories, data.loveStories, data.gallery, data.gifts]);

  const currentChapter = chapters[pageIndex] || chapters[0];

  useEffect(() => {
    if (guest?.name) setRsvpName(guest.name);
  }, [guest?.name]);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !data.musicUrl) return;
    if (musicOn) {
      audio.pause();
      setMusicOn(false);
    } else {
      audio
        .play()
        .then(() => setMusicOn(true))
        .catch(() => {});
    }
  }, [musicOn, data.musicUrl]);

  const handleOpenBook = () => {
    setBookOpen(true);
    setPageIndex(0);
    setDirection(1);
    if (!musicOn && data.musicUrl && audioRef.current) {
      audioRef.current
        .play()
        .then(() => setMusicOn(true))
        .catch(() => {});
    }
  };

  const goToPage = useCallback(
    (nextIdx: number) => {
      const clamped = Math.max(0, Math.min(chapters.length - 1, nextIdx));
      if (clamped === pageIndex) return;
      setDirection(clamped > pageIndex ? 1 : -1);
      setPageIndex(clamped);
    },
    [chapters.length, pageIndex]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!bookOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (lightboxIndex !== null) {
        if (e.key === "Escape") setLightboxIndex(null);
        if (e.key === "ArrowRight" && data.gallery?.length) {
          setLightboxIndex((i) =>
            i === null ? null : (i + 1) % data.gallery.length
          );
        }
        if (e.key === "ArrowLeft" && data.gallery?.length) {
          setLightboxIndex((i) =>
            i === null
              ? null
              : (i - 1 + data.gallery.length) % data.gallery.length
          );
        }
        return;
      }
      if (e.key === "ArrowRight") goToPage(pageIndex + 1);
      if (e.key === "ArrowLeft") {
        if (pageIndex === 0) setBookOpen(false);
        else goToPage(pageIndex - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bookOpen, pageIndex, goToPage, lightboxIndex, data.gallery]);

  // Swipe handlers for natural book page flipping
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) goToPage(pageIndex + 1);
      else if (pageIndex > 0) goToPage(pageIndex - 1);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Undangan Pernikahan ${groomNick} & ${brideNick}`,
          url,
        });
        setShared(true);
        return;
      } catch {}
    }
    await handleCopy(url, "share-link");
    setShared(true);
    setTimeout(() => setShared(false), 2400);
  };

  const handleSubmitRSVP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) {
      setRsvpError("Mohon tuliskan nama Bapak/Ibu/Saudara/i terlebih dahulu.");
      return;
    }
    setRsvpError("");
    const newRsvp: RSVP = {
      id: `rsvp-${Date.now()}`,
      guestName: rsvpName.trim(),
      status: rsvpStatus,
      paxCount: rsvpStatus === "Hadir" ? rsvpPax : 0,
      wishes: rsvpWishes.trim(),
      timestamp: new Date().toISOString(),
    };
    onAddRSVP(newRsvp);
    setRsvpSubmitted(true);
    setRsvpWishes("");
  };

  const coverDate = formatDateShort(
    data.events?.akad?.date || data.events?.resepsi?.date
  );

  return (
    <div
      className={`relative w-full ${
        embedded ? "h-full" : "h-[100dvh]"
      } overflow-hidden flex items-center justify-center p-3 sm:p-6 select-none`}
      style={{
        background:
          "radial-gradient(900px 620px at 50% 20%, #2C211C 0%, #191311 58%, #100C0B 100%)",
        perspective: "1800px",
      }}
    >
      <style>{BOOK_STYLES}</style>
      {data.musicUrl && (
        <audio ref={audioRef} src={data.musicUrl} loop preload="none" />
      )}

      {/* Subtle ambient desk glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(480px 420px at 50% 50%, rgba(198,161,91,0.14), transparent 72%)",
        }}
      />

      {/* Audio toggle floating cleanly on desk */}
      {data.musicUrl && bookOpen && (
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={musicOn ? "Matikan musik latar" : "Putar musik latar"}
          className="absolute right-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-[#C6A15B]/35 bg-[#1E1614]/80 text-[#E9D3A8] backdrop-blur-md transition-transform hover:scale-105 cursor-pointer"
        >
          {musicOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
        </button>
      )}

      {/* ══════════════ PHYSICAL BOOK CONTAINER ══════════════ */}
      <div className="relative z-10 flex h-full max-h-[820px] w-full max-w-[460px] flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!bookOpen ? (
            /* ═══ STATE 1: CLOSED HARDCOVER LINEN BOOK ═══ */
            <motion.div
              key="book-cover"
              initial={{ opacity: 0, scale: 0.96, rotateY: -8 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{
                opacity: 0,
                rotateY: -78,
                x: -36,
                transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
              className="relative flex h-full w-full overflow-hidden rounded-r-[22px] rounded-l-[8px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.75),0_0_0_1px_rgba(198,161,91,0.22)]"
            >
              {/* Hardcover Linen Body */}
              <div className="sb-linen-cover relative flex flex-1 flex-col justify-between px-7 py-8 sm:px-9 sm:py-10 text-center">
                {/* Spine Crease on Left */}
                <div className="sb-spine-ridge pointer-events-none absolute inset-y-0 left-0 w-7" />
                <div className="pointer-events-none absolute inset-y-0 left-7 w-px bg-[#C6A15B]/20" />

                {/* Debossed Gold Foil Inner Frame */}
                <div className="pointer-events-none absolute inset-4 left-9 rounded-[12px] border border-[#C6A15B]/35" />
                <div className="pointer-events-none absolute inset-[22px] left-[42px] rounded-[8px] border border-[#C6A15B]/15" />

                {/* Top Edition Header */}
                <div className="relative z-10 pl-3 pt-2">
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.34em] text-[#D8BA7D]/85">
                    Edisi Kisah Pernikahan
                  </p>
                  <div className="mx-auto mt-3 flex items-center justify-center gap-3">
                    <span className="h-px w-8 bg-[#C6A15B]/45" />
                    <span className="font-serif text-[13px] italic text-[#E9D3A8]">
                      {coverDate || "Hari Bahagia"}
                    </span>
                    <span className="h-px w-8 bg-[#C6A15B]/45" />
                  </div>
                </div>

                {/* Center Monogram + Couple Title */}
                <div className="relative z-10 my-auto flex flex-col items-center pl-3">
                  {/* Framed Couple Emblem */}
                  <div className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-[#C6A15B]/55 bg-[#201614]/80 shadow-[inset_0_0_24px_rgba(198,161,91,0.14)]">
                    <div className="absolute inset-1.5 rounded-full border border-dashed border-[#C6A15B]/35" />
                    <span className="font-serif text-[32px] font-medium tracking-wider text-[#F2DFB6]">
                      {getInitial(groomNick)}
                      <span className="mx-0.5 text-[20px] italic text-[#C6A15B]">
                        &amp;
                      </span>
                      {getInitial(brideNick)}
                    </span>
                  </div>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D8BA7D]/80">
                    The Story of
                  </p>
                  <h1 className="mt-2 font-serif text-[40px] leading-[1.06] sm:text-[46px] font-medium text-[#FAF3E6]">
                    {groomNick}{" "}
                    <span className="italic text-[#C6A15B]">&amp;</span>{" "}
                    {brideNick}
                  </h1>

                  {/* Guest Nameplate (Bookplate) */}
                  <div className="mt-7 w-full max-w-[260px] rounded-xl border border-[#C6A15B]/35 bg-[#1B1210]/70 px-5 py-3.5 backdrop-blur-sm">
                    <p className="text-[9.5px] font-semibold uppercase tracking-[0.24em] text-[#C6A15B]/85">
                      Kepada Yth.
                    </p>
                    <p className="mt-1 font-serif text-[19px] font-medium text-[#FAF3E6]">
                      {guest?.name || "Tamu Kehormatan"}
                    </p>
                  </div>
                </div>

                {/* Bottom Wax Seal CTA */}
                <div className="relative z-10 pl-3 pb-2">
                  <button
                    type="button"
                    onClick={handleOpenBook}
                    className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-[#E5C98E]/60 bg-gradient-to-b from-[#D4AF69] to-[#B08840] px-7 py-3.5 text-[13px] font-extrabold uppercase tracking-[0.14em] text-[#1D130A] shadow-[0_14px_32px_-10px_rgba(198,161,91,0.55)] transition-all hover:brightness-105 active:scale-[0.98] cursor-pointer"
                  >
                    <BookOpen size={16} />
                    Buka Buku Cerita
                  </button>
                  <p className="mt-3 text-[10.5px] tracking-wide text-[#C9B7A6]/70">
                    Ketuk untuk membuka halaman &amp; memutar musik
                  </p>
                </div>
              </div>

              {/* Realistic Stacked Paper Edges on Right */}
              <div className="sb-page-edges w-[10px] shrink-0 border-l border-[#C6B69C]" />
            </motion.div>
          ) : (
            /* ═══ STATE 2: OPEN STORYBOOK WITH 3D PAGE TURNS ═══ */
            <motion.div
              key="book-open"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              className="relative flex h-full w-full overflow-hidden rounded-r-[20px] rounded-l-[6px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.75)]"
            >
              {/* Thin Hardcover Spine Strip on Left */}
              <div className="w-[9px] shrink-0 bg-gradient-to-r from-[#241715] via-[#3A2522] to-[#1D1210]" />

              {/* Main Cotton Paper Page Surface */}
              <div className="sb-paper-page relative flex flex-1 flex-col overflow-hidden text-[#2B211B]">
                {/* Running Book Header */}
                <header className="flex shrink-0 items-center justify-between border-b border-[#E5DAC8] px-5 py-3.5 sm:px-6">
                  <button
                    type="button"
                    onClick={() => setBookOpen(false)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#7D6C5F] transition-colors hover:text-[#8E2F45] cursor-pointer"
                  >
                    <ChevronLeft size={14} /> Sampul
                  </button>
                  <div className="text-center">
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#9A8573]">
                      Bab {currentChapter.roman} · {currentChapter.label}
                    </p>
                  </div>
                  <span className="font-serif text-[13px] italic text-[#8E2F45]">
                    {String(pageIndex + 1).padStart(2, "0")}/
                    {String(chapters.length).padStart(2, "0")}
                  </span>
                </header>

                {/* Animated 3D Page Body */}
                <div
                  className="relative flex-1 overflow-hidden"
                  style={{ perspective: "1400px" }}
                >
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={currentChapter.id}
                      custom={direction}
                      variants={PAGE_VARIANTS}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        duration: 0.42,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{ transformOrigin: "left center" }}
                      className="h-full overflow-y-auto px-5 py-6 sm:px-7 scrollbar-elegant"
                    >
                      {/* Chapter Title Banner */}
                      <div className="mb-5 text-center">
                        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#A48349]">
                          Bab {currentChapter.roman}
                        </p>
                        <h2 className="mt-1 font-serif text-[29px] leading-tight font-medium text-[#241915]">
                          {currentChapter.subtitle}
                        </h2>
                        <div className="mx-auto mt-2.5 flex items-center justify-center gap-2">
                          <span className="h-px w-10 bg-[#D7C6AA]" />
                          <span className="h-1.5 w-1.5 rotate-45 bg-[#C6A15B]" />
                          <span className="h-px w-10 bg-[#D7C6AA]" />
                        </div>
                      </div>

                      {/* ── BAB: MEMPELAI ── */}
                      {currentChapter.id === "couple" && (
                        <div className="space-y-6 pb-4">
                          <p className="sb-dropcap font-serif text-[16.5px] leading-[1.7] text-[#4C3E35]">
                            {data.quoteText ||
                              "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya."}
                          </p>
                          {data.quoteSource && (
                            <p className="-mt-3 text-right font-serif text-[13px] italic text-[#8E2F45]">
                              — {data.quoteSource}
                            </p>
                          )}

                          <div className="grid gap-4 pt-1">
                            {[
                              {
                                role: "Mempelai Pria",
                                person: data.couple.groom,
                                prefix: "Putra dari",
                              },
                              {
                                role: "Mempelai Wanita",
                                person: data.couple.bride,
                                prefix: "Putri dari",
                              },
                            ].map(({ role, person, prefix }) => (
                              <div
                                key={role}
                                className="flex items-center gap-4 rounded-2xl border border-[#E6DAC6] bg-[#FFFDF9] p-4 shadow-[0_6px_20px_-14px_rgba(43,33,27,0.28)]"
                              >
                                <PortraitFrame
                                  src={normalizeImageUrl(person?.photoUrl)}
                                  name={person?.fullName || role}
                                />
                                <div className="min-w-0 flex-1 text-left">
                                  <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#A48349]">
                                    {role}
                                  </p>
                                  <h3 className="mt-0.5 font-serif text-[21px] leading-snug font-semibold text-[#241915]">
                                    {person?.fullName}
                                  </h3>
                                  {(person?.fatherName || person?.motherName) && (
                                    <p className="mt-1 text-[11.5px] leading-relaxed text-[#6E5E52]">
                                      {prefix} Bpk.{" "}
                                      {cleanParent(person?.fatherName)} &amp; Ibu{" "}
                                      {cleanParent(person?.motherName)}
                                    </p>
                                  )}
                                  {person?.instagram && (
                                    <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#8E2F45]">
                                      <Instagram size={11} />
                                      {person.instagram}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ── BAB: KISAH CINTA ── */}
                      {currentChapter.id === "story" && (
                        <div className="relative space-y-5 pb-4 before:absolute before:bottom-4 before:left-[15px] before:top-2 before:w-px before:bg-[#DFD2BC]">
                          {(data.loveStories || []).map((st, idx) => (
                            <article
                              key={st.id || idx}
                              className="relative pl-9"
                            >
                              <span className="absolute left-[10px] top-1.5 h-[11px] w-[11px] rounded-full border-2 border-[#FAF6EE] bg-[#8E2F45] ring-2 ring-[#C6A15B]/45" />
                              <div className="overflow-hidden rounded-2xl border border-[#E6DAC6] bg-[#FFFDF9] shadow-[0_6px_18px_-14px_rgba(43,33,27,0.28)]">
                                {st.imageUrl && (
                                  <div className="aspect-[16/9] w-full overflow-hidden bg-[#EFE6D8]">
                                    <img
                                      src={normalizeImageUrl(st.imageUrl)}
                                      alt={st.title}
                                      loading="lazy"
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="p-4">
                                  <div className="flex items-baseline justify-between gap-2">
                                    <h3 className="font-serif text-[19px] font-semibold text-[#241915]">
                                      {st.title}
                                    </h3>
                                    <span className="shrink-0 rounded-full bg-[#F5EBDC] px-2.5 py-0.5 font-mono text-[10.5px] font-bold text-[#8E2F45]">
                                      {st.year}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-[12.5px] leading-[1.7] text-[#5B4D43]">
                                    {st.story}
                                  </p>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}

                      {/* ── BAB: ACARA & COUNTDOWN ── */}
                      {currentChapter.id === "event" && (
                        <div className="space-y-4 pb-4">
                          <ArchivalCountdown targetDate={data.countdownDate} />

                          {[
                            {
                              tag: "Prosesi Pertama",
                              ev: data.events.akad,
                            },
                            {
                              tag: "Perayaan",
                              ev: data.events.resepsi,
                            },
                          ].map(({ tag, ev }) => (
                            <div
                              key={ev.name + tag}
                              className="rounded-2xl border border-[#E6DAC6] bg-[#FFFDF9] p-4 sm:p-5 shadow-[0_6px_20px_-14px_rgba(43,33,27,0.25)]"
                            >
                              <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#A48349]">
                                {tag}
                              </p>
                              <h3 className="mt-0.5 font-serif text-[22px] font-semibold text-[#241915]">
                                {ev.name}
                              </h3>
                              <div className="mt-3 space-y-1.5 text-[12.5px] text-[#5B4D43]">
                                <p className="flex items-center gap-2 font-semibold text-[#2B211B]">
                                  <Clock
                                    size={14}
                                    className="shrink-0 text-[#8E2F45]"
                                  />
                                  {formatDateLong(ev.date)} · {ev.timeStart}
                                  {ev.timeEnd ? ` – ${ev.timeEnd}` : ""} WIB
                                </p>
                                <p className="flex items-start gap-2">
                                  <MapPin
                                    size={14}
                                    className="mt-0.5 shrink-0 text-[#8E2F45]"
                                  />
                                  <span>
                                    <strong className="text-[#2B211B]">
                                      {ev.venueName}
                                    </strong>
                                    <br />
                                    {ev.address}
                                  </span>
                                </p>
                              </div>
                              {ev.googleMapsUrl && (
                                <a
                                  href={ev.googleMapsUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border border-[#8E2F45]/30 bg-[#F9ECEF] px-4 py-1.5 text-[11.5px] font-bold text-[#8E2F45] transition-colors hover:bg-[#8E2F45] hover:text-white"
                                >
                                  <MapPin size={12} /> Buka Google Maps
                                </a>
                              )}
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => downloadICS(data)}
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#241915] py-3 text-[12.5px] font-bold tracking-wide text-[#FAF6EE] transition-opacity hover:opacity-90 cursor-pointer"
                          >
                            <CalendarPlus size={15} /> Simpan Tanggal ke Kalender
                          </button>
                        </div>
                      )}

                      {/* ── BAB: ALBUM GALERI ── */}
                      {currentChapter.id === "gallery" && (
                        <div className="pb-4">
                          <p className="mb-4 text-center text-[12px] text-[#7D6C5F]">
                            Ketuk foto untuk melihat dalam ukuran penuh.
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            {(data.gallery || []).map((src, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setLightboxIndex(i)}
                                className={`group relative overflow-hidden rounded-xl border border-[#E3D6C0] bg-[#EFE6D8] cursor-pointer ${
                                  i % 3 === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[4/5]"
                                }`}
                              >
                                <img
                                  src={normalizeImageUrl(src)}
                                  alt={`Potret kenangan ${i + 1}`}
                                  loading="lazy"
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[9.5px] text-[#FAF6EE] backdrop-blur-sm">
                                  #{String(i + 1).padStart(2, "0")}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ── BAB: BUKU TAMU & RSVP ── */}
                      {currentChapter.id === "rsvp" && (
                        <div className="space-y-5 pb-4">
                          <form
                            onSubmit={handleSubmitRSVP}
                            className="space-y-3 rounded-2xl border border-[#E6DAC6] bg-[#FFFDF9] p-4 shadow-[0_6px_18px_-14px_rgba(43,33,27,0.25)]"
                          >
                            <div>
                              <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[#8B7869]">
                                Nama Tamu
                              </label>
                              <input
                                type="text"
                                value={rsvpName}
                                onChange={(e) => setRsvpName(e.target.value)}
                                placeholder="Tuliskan nama Anda"
                                className="mt-1 w-full rounded-xl border border-[#DFD2BC] bg-[#FAF6EE] px-3.5 py-2.5 text-[13px] text-[#241915] outline-none focus:border-[#8E2F45]"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-1.5">
                              {(
                                ["Hadir", "Ragu-ragu", "Tidak Hadir"] as const
                              ).map((status) => (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => setRsvpStatus(status)}
                                  className="rounded-xl border py-2 text-[11.5px] font-bold transition-all cursor-pointer"
                                  style={
                                    rsvpStatus === status
                                      ? {
                                          background: "#8E2F45",
                                          color: "#FFFDF9",
                                          borderColor: "#8E2F45",
                                        }
                                      : {
                                          background: "#FAF6EE",
                                          color: "#6B5B4E",
                                          borderColor: "#DFD2BC",
                                        }
                                  }
                                >
                                  {status}
                                </button>
                              ))}
                            </div>

                            {rsvpStatus === "Hadir" && (
                              <div className="flex items-center justify-between rounded-xl border border-[#DFD2BC] bg-[#FAF6EE] px-3.5 py-2">
                                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#5B4D43]">
                                  <Users size={13} /> Jumlah Tamu
                                </span>
                                <div className="flex items-center gap-2">
                                  {[1, 2, 3, 4].map((n) => (
                                    <button
                                      key={n}
                                      type="button"
                                      onClick={() => setRsvpPax(n)}
                                      className="flex h-7 w-7 items-center justify-center rounded-full text-[11.5px] font-bold cursor-pointer"
                                      style={
                                        rsvpPax === n
                                          ? {
                                              background: "#241915",
                                              color: "#FAF6EE",
                                            }
                                          : {
                                              background: "#EDE3D2",
                                              color: "#5B4D43",
                                            }
                                      }
                                    >
                                      {n}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[#8B7869]">
                                Ucapan &amp; Doa
                              </label>
                              <textarea
                                rows={3}
                                value={rsvpWishes}
                                onChange={(e) => setRsvpWishes(e.target.value)}
                                placeholder="Tulis doa terbaik untuk kedua mempelai..."
                                className="mt-1 w-full resize-none rounded-xl border border-[#DFD2BC] bg-[#FAF6EE] px-3.5 py-2.5 text-[13px] text-[#241915] outline-none focus:border-[#8E2F45]"
                              />
                            </div>

                            {rsvpError && (
                              <p className="text-[11.5px] font-semibold text-[#B03A3A]">
                                {rsvpError}
                              </p>
                            )}
                            {rsvpSubmitted && (
                              <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#3E7C4F]">
                                <Check size={14} /> Terima kasih, ucapan Anda
                                telah tercatat di buku tamu.
                              </p>
                            )}

                            <button
                              type="submit"
                              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#8E2F45] py-2.5 text-[12.5px] font-bold text-[#FFFDF9] transition-opacity hover:opacity-95 cursor-pointer"
                            >
                              <Send size={13} /> Kirim Konfirmasi &amp; Doa
                            </button>
                          </form>

                          {/* Guestbook Entries */}
                          <div>
                            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B7869]">
                              Catatan Buku Tamu ({rsvps.length})
                            </p>
                            {rsvps.length === 0 ? (
                              <p className="rounded-xl border border-dashed border-[#DFD2BC] p-4 text-center text-[12px] italic text-[#8B7869]">
                                Jadilah yang pertama menuliskan doa di buku
                                tamu ini.
                              </p>
                            ) : (
                              <div className="space-y-2.5">
                                {rsvps.slice(0, 8).map((item) => (
                                  <div
                                    key={item.id}
                                    className="rounded-xl border border-[#E6DAC6] bg-[#FFFDF9] p-3.5"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-[13px] font-bold text-[#241915]">
                                        {item.guestName}
                                      </p>
                                      <span
                                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                                        style={{
                                          background:
                                            item.status === "Hadir"
                                              ? "#EAF4EC"
                                              : "#F5ECE2",
                                          color:
                                            item.status === "Hadir"
                                              ? "#3E7C4F"
                                              : "#7D6C5F",
                                        }}
                                      >
                                        {item.status}
                                      </span>
                                    </div>
                                    {item.wishes && (
                                      <p className="mt-1.5 font-serif text-[14.5px] italic leading-relaxed text-[#5B4D43]">
                                        “{item.wishes}”
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ── BAB: TANDA KASIH & EPILOG ── */}
                      {currentChapter.id === "gift" && (
                        <div className="space-y-5 pb-4">
                          {data.gifts && data.gifts.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-center text-[12.5px] leading-relaxed text-[#6B5B4E]">
                                Doa restu Bapak/Ibu adalah karunia terindah.
                                Apabila berkenan memberikan tanda kasih, dapat
                                melalui saluran berikut:
                              </p>
                              {data.gifts.map((g, i) => {
                                const cid = g.id || `gift-${i}`;
                                return (
                                  <div
                                    key={cid}
                                    className="rounded-2xl border border-[#E6DAC6] bg-[#FFFDF9] p-4 shadow-[0_6px_18px_-14px_rgba(43,33,27,0.22)]"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#A48349]">
                                        <Gift size={12} />
                                        {g.type === "bank"
                                          ? "Transfer Bank"
                                          : g.type === "e-wallet"
                                          ? "E-Wallet"
                                          : "Alamat Kado"}
                                      </span>
                                      <span className="text-[11px] font-bold text-[#6B5B4E]">
                                        {g.name}
                                      </span>
                                    </div>
                                    <p className="mt-2 font-mono text-[15px] font-bold tracking-wider text-[#241915]">
                                      {g.accountNumber}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between gap-2">
                                      <p className="text-[12px] text-[#6B5B4E]">
                                        a.n. {g.accountHolder}
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCopy(g.accountNumber, cid)
                                        }
                                        className="inline-flex items-center gap-1 rounded-full border border-[#8E2F45]/30 bg-[#F9ECEF] px-3 py-1 text-[11px] font-bold text-[#8E2F45] transition-colors hover:bg-[#8E2F45] hover:text-white cursor-pointer"
                                      >
                                        {copiedId === cid ? (
                                          <>
                                            <Check size={12} /> Tersalin
                                          </>
                                        ) : (
                                          <>
                                            <Copy size={12} /> Salin
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Colophon / Closing Page */}
                          <div className="rounded-2xl border border-[#E2D4BC] bg-gradient-to-b from-[#FFFDF9] to-[#F5ECDC] p-6 text-center">
                            <Sparkles
                              size={18}
                              className="mx-auto text-[#C6A15B]"
                            />
                            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.26em] text-[#8B7869]">
                              Epilog
                            </p>
                            <p className="mt-2 text-[13px] leading-relaxed text-[#5B4D43]">
                              Merupakan kehormatan dan kebahagiaan bagi kami
                              apabila Bapak/Ibu/Saudara/i berkenan hadir dan
                              memberikan doa restu.
                            </p>
                            <p className="mt-4 font-serif text-[30px] font-medium text-[#241915]">
                              {groomNick}{" "}
                              <span className="italic text-[#8E2F45]">
                                &amp;
                              </span>{" "}
                              {brideNick}
                            </p>
                            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                              <button
                                type="button"
                                onClick={handleShare}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#241915] py-2.5 text-[12px] font-bold text-[#FAF6EE] cursor-pointer"
                              >
                                <Share2 size={13} />
                                {shared ? "Tautan Disalin" : "Bagikan Undangan"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setBookOpen(false)}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#D4C3A8] bg-white py-2.5 text-[12px] font-bold text-[#241915] cursor-pointer"
                              >
                                <RotateCcw size={13} /> Tutup Buku
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bottom Bookmark Chapter Navigation Bar */}
                <footer className="shrink-0 border-t border-[#E5DAC8] bg-[#F5EFE3] px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        pageIndex === 0
                          ? setBookOpen(false)
                          : goToPage(pageIndex - 1)
                      }
                      aria-label="Halaman sebelumnya"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D8C9B2] bg-[#FAF6EE] text-[#2B211B] transition-colors hover:bg-[#241915] hover:text-[#FAF6EE] cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="flex flex-1 items-center justify-center gap-1 overflow-x-auto scrollbar-hide px-1">
                      {chapters.map((ch, idx) => {
                        const active = idx === pageIndex;
                        return (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => goToPage(idx)}
                            className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer"
                            style={
                              active
                                ? {
                                    background: "#8E2F45",
                                    color: "#FFFDF9",
                                  }
                                : {
                                    background: "transparent",
                                    color: "#7D6C5F",
                                  }
                            }
                          >
                            {ch.label}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => goToPage(pageIndex + 1)}
                      disabled={pageIndex === chapters.length - 1}
                      aria-label="Halaman berikutnya"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D8C9B2] bg-[#FAF6EE] text-[#2B211B] transition-colors hover:bg-[#241915] hover:text-[#FAF6EE] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </footer>
              </div>

              {/* Stacked Paper Edges on Right */}
              <div className="sb-page-edges w-[8px] shrink-0 border-l border-[#D8CBB4]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════ GALLERY LIGHTBOX ══════════════ */}
      <AnimatePresence>
        {lightboxIndex !== null && data.gallery && data.gallery[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Tutup foto"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
            >
              <X size={20} />
            </button>
            {data.gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(
                      (lightboxIndex - 1 + data.gallery.length) %
                        data.gallery.length
                    );
                  }}
                  aria-label="Foto sebelumnya"
                  className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((lightboxIndex + 1) % data.gallery.length);
                  }}
                  aria-label="Foto berikutnya"
                  className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            <img
              src={normalizeImageUrl(data.gallery[lightboxIndex])}
              alt={`Foto ${lightboxIndex + 1}`}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[84vh] max-w-full rounded-xl border border-white/15 object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <noscript>
        <div className="p-6 bg-[#FAF6EE] text-[#241915]">
          <h1>
            {data.couple.groom.fullName} &amp; {data.couple.bride.fullName}
          </h1>
          <p>
            {formatDateLong(data.events.akad.date)} — {data.events.akad.venueName}
          </p>
          <p>
            {formatDateLong(data.events.resepsi.date)} —{" "}
            {data.events.resepsi.venueName}
          </p>
        </div>
      </noscript>
    </div>
  );
}

function PortraitFrame({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-t-full rounded-b-xl border border-[#D8C9B2] bg-[#F3E9D8] font-serif text-[26px] font-semibold text-[#8E2F45]">
        {getInitial(name)}
      </div>
    );
  }
  return (
    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-t-full rounded-b-xl border border-[#D8C9B2] bg-[#EFE6D8] shadow-sm">
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function ArchivalCountdown({ targetDate }: { targetDate: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date(targetDate).getTime();
  const diff = isNaN(target) ? 0 : Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000) % 24;
  const mins = Math.floor(diff / 60000) % 60;
  const secs = Math.floor(diff / 1000) % 60;

  return (
    <div className="rounded-2xl border border-[#E2D4BC] bg-[#241915] px-4 py-4 text-center text-[#FAF6EE]">
      <p className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#D8BA7D]">
        <Heart size={11} /> Menuju Hari Bahagia
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2 tabular">
        {[
          [days, "Hari"],
          [hours, "Jam"],
          [mins, "Menit"],
          [secs, "Detik"],
        ].map(([v, label]) => (
          <div
            key={label as string}
            className="rounded-xl border border-[#C6A15B]/25 bg-white/5 py-2"
          >
            <p className="font-serif text-[24px] leading-none font-semibold text-[#F7E9CE]">
              {String(v).padStart(2, "0")}
            </p>
            <p className="mt-1 text-[9.5px] uppercase tracking-wider text-[#C9B7A6]">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function downloadICS(data: WeddingData) {
  const ev = data.events.resepsi || data.events.akad;
  const dt = (d: string, t: string) => {
    const [hh, mm] = (t || "08:00").split(":");
    const dtObj = new Date(d);
    if (isNaN(dtObj.getTime())) return "20260808T080000Z";
    dtObj.setHours(parseInt(hh || "8", 10), parseInt(mm || "0", 10));
    return dtObj.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${dt(ev.date, ev.timeStart)}`,
    `DTEND:${dt(ev.date, ev.timeEnd || ev.timeStart)}`,
    `SUMMARY:Pernikahan ${data.couple.groom.nickname || ""} & ${
      data.couple.bride.nickname || ""
    }`,
    `LOCATION:${ev.venueName} ${ev.address}`.replace(/\n/g, " "),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "undangan-pernikahan.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

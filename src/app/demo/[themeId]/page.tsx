"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import InvitationPreview from "@/components/InvitationPreview";
import { DEFAULT_THEMES, DEFAULT_WEDDING_DATA } from "@/data/defaultData";
import { RSVP } from "@/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ThemeDemoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const themeId = params.themeId as string;
  const isThumbnail = searchParams.get('thumbnail') === 'true';

  const theme = DEFAULT_THEMES.find((t) => t.id === themeId);

  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Freeze animation entirely by taking a DOM snapshot and destroying the React tree
  useEffect(() => {
    if (isThumbnail) {
      const timer = setTimeout(() => {
        if (containerRef.current) {
          let html = containerRef.current.innerHTML;
          // Strip out audio/video tags to prevent them from re-initializing or playing
          html = html.replace(/<audio\b[^>]*>/gi, '').replace(/<video\b[^>]*>.*?<\/video>/gi, '');
          setSnapshot(html);
        }
      }, 4500); // 4.5 seconds for intro animations to settle

      return () => clearTimeout(timer);
    }
  }, [isThumbnail]);

  const handleAddRSVP = (rsvp: RSVP) => {
    setRsvps((prev) => [...prev, rsvp]);
  };

  if (!theme) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-serif">Tema tidak ditemukan</h1>
        <p className="text-muted-foreground">
          Tema dengan ID &ldquo;{themeId}&rdquo; tidak tersedia.
        </p>
        <Link
          href="/preview"
          className="inline-flex items-center gap-2 text-sm tracking-widest uppercase border border-border px-8 py-3 hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Preview
        </Link>
      </div>
    );
  }

  if (snapshot) {
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: snapshot }} 
        style={{ pointerEvents: 'none' }}
        suppressHydrationWarning
        className="snapshot-frozen"
      >
        <style dangerouslySetInnerHTML={{ __html: `.snapshot-frozen * { animation-play-state: paused !important; transition: none !important; }` }} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen" ref={containerRef}>
      {/* Floating back button */}
      {!isThumbnail && (
        <Link
          href="/preview"
          className="fixed top-6 left-6 z-[100] bg-white/90 backdrop-blur-md text-black px-4 py-2.5 rounded-full text-xs tracking-widest uppercase font-bold shadow-xl border border-zinc-200 hover:bg-zinc-100 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </Link>
      )}

      {/* Demo badge */}
      {!isThumbnail && (
        <div className="fixed top-6 right-6 z-[100] bg-amber-500 text-white px-4 py-2 rounded-full text-[10px] tracking-widest uppercase font-bold shadow-xl">
          Demo — {theme.name}
        </div>
      )}

      {/* Full screen invitation preview */}
      <InvitationPreview
        data={DEFAULT_WEDDING_DATA}
        themeId={themeId}
        onAddRSVP={handleAddRSVP}
        rsvps={rsvps}
        embedded={isThumbnail}
      />
    </div>
  );
}

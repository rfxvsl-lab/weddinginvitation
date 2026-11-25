'use client';

/**
 * EnterpriseMotionPlayer — pemutar film undangan per tema.
 *
 * Setiap tema punya komposisi sendiri yang dibangun 1:1 dari template undangannya
 * (aset, tipografi, ornamen, dan mekanik pembukanya), lalu dipentaskan dengan
 * bahasa motion design: time remapping (speed ramp), motion blur searah,
 * text animator, trim paths, dan spring.
 *
 * `progress` (0..1) = waktu real. Time-remap mengubahnya menjadi waktu komposisi,
 * sehingga ada momen slow-motion dan whip yang tetap deterministik per frame.
 */

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { VideoThemeId, VideoCoupleProps, VIDEO_DURATION_SEC } from '@/lib/invitationVideoEngine';
import { buildTimeRemap, FilmData, FilmEvent, GRAIN, SpeedZone } from './motion/core';
import JavaneseFilm, { JAVANESE_COMP_DUR, JAVANESE_SPEED } from './motion/JavaneseFilm';
import BallroomFilm, { BALLROOM_COMP_DUR, BALLROOM_SPEED } from './motion/BallroomFilm';
import PinkFilm, { PINK_COMP_DUR, PINK_SPEED } from './motion/PinkFilm';
import JourneyFilm, { JOURNEY_COMP_DUR, JOURNEY_SPEED } from './motion/JourneyFilm';

export interface MotionPlayerCouple extends VideoCoupleProps {
  heroPhoto?: string;
  groomPhoto?: string;
  bridePhoto?: string;
  groomParents?: string;
  brideParents?: string;
  events?: FilmEvent[];
  gallery?: string[];
  guestName?: string;
}

interface EnterpriseMotionPlayerProps {
  themeId: VideoThemeId;
  couple: MotionPlayerCouple;
  sceneIdx?: number;
  progress: number;
  isPlaying?: boolean;
  showWatermark?: boolean;
}

const STAGE_H = 640;
const MIN_W = 360;

const FILMS: Record<VideoThemeId, { Comp: React.ComponentType<any>; dur: number; zones: SpeedZone[] }> = {
  'javanese-classic': { Comp: JavaneseFilm, dur: JAVANESE_COMP_DUR, zones: JAVANESE_SPEED },
  'grand-ballroom': { Comp: BallroomFilm, dur: BALLROOM_COMP_DUR, zones: BALLROOM_SPEED },
  'luxury-pink': { Comp: PinkFilm, dur: PINK_COMP_DUR, zones: PINK_SPEED },
  'storybook-journey': { Comp: JourneyFilm, dur: JOURNEY_COMP_DUR, zones: JOURNEY_SPEED },
};

/** Stylesheet font film; diekspor agar ekspor video bisa menyematkan font yang sama. */
export const MOTION_FONT_CSS_URL =
  "https://fonts.googleapis.com/css2?family=Philosopher:ital,wght@0,400;0,700;1,400&family=Gelasio:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;500;700&family=Noto+Sans+Javanese&family=Cinzel:wght@400;600;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&family=Great+Vibes&family=Nunito+Sans:wght@300;400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Italianno&display=swap";
/** Keluarga font per film — disematkan penuh ke tiap frame saat ekspor. */
export const MOTION_FONT_FAMILIES: Record<VideoThemeId, string[]> = {
  'javanese-classic': ['Philosopher', 'Gelasio', 'Montserrat', 'Noto Sans Javanese'],
  'grand-ballroom': ['Cinzel', 'Playfair Display', 'Lato'],
  'luxury-pink': ['Great Vibes', 'Playfair Display', 'Nunito Sans'],
  'storybook-journey': ['Cinzel', 'EB Garamond', 'Italianno'],
};
const FONT_CSS = `@import url('${MOTION_FONT_CSS_URL}');`;

const SAMPLE_DIR = '/assets/video-sample';
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function parseDate(raw: string) {
  const s = (raw || '').trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const dt = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return { weekday: DAYS[dt.getDay()], day: iso[3], month: MONTHS[dt.getMonth()], monthNum: iso[2], year: iso[1] };
  }
  const m = s.match(/(?:([A-Za-z]+),\s*)?(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (m) {
    const mi = MONTHS.findIndex((x) => x.toLowerCase() === m[3].toLowerCase());
    return { weekday: m[1] || '', day: m[2].padStart(2, '0'), month: m[3], monthNum: String(mi + 1).padStart(2, '0'), year: m[4] };
  }
  return { weekday: 'Sabtu', day: '08', month: 'Agustus', monthNum: '08', year: '2026' };
}

/** Link Google Drive → URL gambar langsung (sama seperti template). */
function img(url?: string) {
  if (!url) return undefined;
  const m = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  return m ? `https://lh3.googleusercontent.com/d/${m[1]}` : url;
}

function toFilmData(c: MotionPlayerCouple): FilmData {
  const p = parseDate(c.dateRaw);
  const dateLong = `${p.weekday ? p.weekday + ', ' : ''}${Number(p.day)} ${p.month} ${p.year}`;
  const events: FilmEvent[] = c.events?.length
    ? c.events
    : [
        { title: 'Akad Nikah', date: dateLong, time: c.timeRaw || '08.00 WIB', venue: c.venue },
        { title: 'Resepsi Pernikahan', date: dateLong, time: c.timeRaw || '11.00 WIB', venue: c.venue },
      ];
  const gallery = c.gallery?.length ? c.gallery.map((g) => img(g) as string) : ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'].map((g) => `${SAMPLE_DIR}/${g}.webp`);
  return {
    groom: c.groom,
    bride: c.bride,
    groomFull: c.groomFull,
    brideFull: c.brideFull,
    groomParents: c.groomParents || 'Bapak Ir. H. Bambang Aditama & Ibu Hj. Endang Rahayu',
    brideParents: c.brideParents || 'Bapak Dr. H. Ahmad Fauzi & Ibu Hj. Siti Aminah',
    dateLong,
    ...p,
    events,
    slug: c.slug,
    guest: c.guestName || 'Tamu Undangan',
    photos: {
      couple: img(c.heroPhoto) || `${SAMPLE_DIR}/couple.webp`,
      groom: img(c.groomPhoto) || `${SAMPLE_DIR}/groom.webp`,
      bride: img(c.bridePhoto) || `${SAMPLE_DIR}/bride.webp`,
      gallery,
    },
  };
}

function EnterpriseMotionPlayer({ themeId, couple, progress, showWatermark = true }: EnterpriseMotionPlayerProps) {
  const film = FILMS[themeId] || FILMS['javanese-classic'];
  const remap = useMemo(() => buildTimeRemap(film.zones, film.dur, VIDEO_DURATION_SEC), [film]);
  const data = useMemo(() => toFilmData(couple), [couple]);

  const hostRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 360, h: 640 });
  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const update = () => setBox({ w: el.clientWidth || 360, h: el.clientHeight || 640 });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Stage 640 unit tinggi; untuk rasio lebar (16:9) stage diperlebar, untuk 1:1 diskalakan agar kolom 360 muat.
  const scale = Math.min(box.h / STAGE_H, box.w / MIN_W);
  const W = Math.max(MIN_W, box.w / scale);
  const H = Math.max(STAGE_H, box.h / scale);
  const offY = (H - STAGE_H) / 2;

  const real = Math.max(0, Math.min(1, progress)) * VIDEO_DURATION_SEC;
  const t = remap.toComp(real);
  const speed = remap.speedAt(t);
  const fadeEdge = Math.max(1 - real / 0.35, (real - (VIDEO_DURATION_SEC - 0.4)) / 0.4, 0);
  const Comp = film.Comp;

  return (
    <div ref={hostRef} className="relative h-full w-full select-none overflow-hidden" style={{ background: '#000' }}>
      <style>{FONT_CSS}</style>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: W,
          height: H,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', left: 0, top: offY, width: W, height: STAGE_H }}>
          <Comp t={t} speed={speed} W={W} H={STAGE_H} d={data} />
        </div>

        {/* Finishing: vignette, grain film, fade loop */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 140px rgba(0,0,0,0.2)' }} />
        <div
          style={{
            position: 'absolute',
            inset: -60,
            pointerEvents: 'none',
            backgroundImage: GRAIN,
            opacity: 0.1,
            mixBlendMode: 'multiply',
            transform: `translate(${(Math.floor(real * 24) * 37) % 60}px, ${(Math.floor(real * 24) * 53) % 60}px)`,
          }}
        />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: '#000', opacity: Math.min(1, fadeEdge) }} />
        {showWatermark && (
          <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#fff', mixBlendMode: 'difference', opacity: 0.6 }}>
            RuangHadir · Preview
          </div>
        )}
      </div>
    </div>
  );
}

/** memo: re-render induk (mis. progres render) tidak me-reconcile ulang seluruh film bila props sama. */
export default React.memo(EnterpriseMotionPlayer);

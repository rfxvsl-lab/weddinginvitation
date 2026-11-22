'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Lock,
  Film,
  Building2,
  Mail,
  Smartphone,
  Square,
  Monitor,
  CheckCircle2,
  Code2,
  SlidersHorizontal,
  Layers,
  Loader2,
} from 'lucide-react';
import { isEnterpriseTier } from '@/lib/packageLimits';
import { WeddingData, SaaSUser } from '@/types';

interface VideoInvitationStudioProps {
  wedding: WeddingData;
  slug?: string | null;
  user: SaaSUser | null;
  onOpenEnterprise?: () => void;
}

type AspectId = '9:16' | '1:1' | '16:9';
type MotionThemeId = 'liquid-glass' | 'ivory-film' | 'midnight-noir' | 'botanical-air';

interface MotionPreset {
  id: MotionThemeId;
  name: string;
  tagline: string;
  bgStops: [string, string, string];
  cardBg: string;
  cardBorder: string;
  ink: string;
  subInk: string;
  accent: string;
  isDark: boolean;
}

const MOTION_PRESETS: MotionPreset[] = [
  {
    id: 'liquid-glass',
    name: 'Liquid Glass',
    tagline: 'iOS 26 translucent frost & luminous sky',
    bgStops: ['#DCEEFF', '#ECE7FF', '#FBE9F4'],
    cardBg: 'rgba(255, 255, 255, 0.56)',
    cardBorder: 'rgba(255, 255, 255, 0.85)',
    ink: '#1D1D1F',
    subInk: '#48484A',
    accent: '#007AFF',
    isDark: false,
  },
  {
    id: 'midnight-noir',
    name: 'Midnight Titanium',
    tagline: 'Dark cinema glass & titanium gold',
    bgStops: ['#0B0D14', '#161B2E', '#0F1320'],
    cardBg: 'rgba(255, 255, 255, 0.08)',
    cardBorder: 'rgba(255, 255, 255, 0.22)',
    ink: '#F5F5F7',
    subInk: '#A1A1A6',
    accent: '#64D2FF',
    isDark: true,
  },
  {
    id: 'ivory-film',
    name: 'Editorial Pearl',
    tagline: 'Warm gallery grain & timeless serif',
    bgStops: ['#F7F4EE', '#EFE8DC', '#F9F6F0'],
    cardBg: 'rgba(255, 255, 255, 0.72)',
    cardBorder: 'rgba(255, 255, 255, 0.92)',
    ink: '#1D1D1F',
    subInk: '#5E5852',
    accent: '#007AFF',
    isDark: false,
  },
  {
    id: 'botanical-air',
    name: 'Botanical Mist',
    tagline: 'Airy sage glass & morning light',
    bgStops: ['#E4F3EC', '#EDF6F7', '#F2F5FA'],
    cardBg: 'rgba(255, 255, 255, 0.62)',
    cardBorder: 'rgba(255, 255, 255, 0.88)',
    ink: '#16241E',
    subInk: '#486056',
    accent: '#248A3D',
    isDark: false,
  },
];

const ASPECTS: { id: AspectId; label: string; desc: string; w: number; h: number; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: '9:16', label: '9:16 Reels', desc: '1080×1920 · TikTok & WA Status', w: 540, h: 960, icon: Smartphone },
  { id: '1:1', label: '1:1 Feed', desc: '1080×1080 · Instagram Feed', w: 720, h: 720, icon: Square },
  { id: '16:9', label: '16:9 Layar', desc: '1920×1080 · Venue & YouTube', w: 960, h: 540, icon: Monitor },
];

const FPS = 30;
const DURATION_SECONDS = 12;
const TOTAL_FRAMES = FPS * DURATION_SECONDS; // 360 frames

const SCENES = [
  { id: 0, label: '01 · Pembuka', start: 0, end: 90 },
  { id: 1, label: '02 · Mempelai', start: 90, end: 180 },
  { id: 2, label: '03 · Jadwal', start: 180, end: 270 },
  { id: 3, label: '04 · Save The Date', start: 270, end: 360 },
];

function easeOutCubic(t: number) {
  const c = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - c, 3);
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export default function VideoInvitationStudio({
  wedding,
  slug,
  user,
  onOpenEnterprise,
}: VideoInvitationStudioProps) {
  const isEnt = isEnterpriseTier(user?.packageId);
  const [presetId, setPresetId] = useState<MotionThemeId>('liquid-glass');
  const [aspectId, setAspectId] = useState<AspectId>('9:16');
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderDoneMsg, setRenderDoneMsg] = useState<string | null>(null);
  const [copiedSpec, setCopiedSpec] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const preset = useMemo(
    () => MOTION_PRESETS.find((p) => p.id === presetId) || MOTION_PRESETS[0],
    [presetId]
  );
  const aspect = useMemo(
    () => ASPECTS.find((a) => a.id === aspectId) || ASPECTS[0],
    [aspectId]
  );

  const coupleData = useMemo(() => {
    const groom = wedding?.couple?.groom?.nickname || wedding?.couple?.groom?.fullName || 'Rian';
    const bride = wedding?.couple?.bride?.nickname || wedding?.couple?.bride?.fullName || 'Salsa';
    const groomFull = wedding?.couple?.groom?.fullName || 'Rian Pratama, S.T.';
    const brideFull = wedding?.couple?.bride?.fullName || 'Salsa Putri, S.Ars.';
    const dateRaw = wedding?.events?.akad?.date || wedding?.events?.resepsi?.date || 'Sabtu, 24 Oktober 2026';
    const timeRaw = wedding?.events?.resepsi?.timeStart || wedding?.events?.akad?.timeStart || '10:00 WIB';
    const venue = wedding?.events?.resepsi?.venueName || wedding?.events?.akad?.venueName || 'The Glasshouse Pavilion, Jakarta';
    const slug = slug ? `ruanghadir.net/${slug}` : 'ruanghadir.net/undangan-anda';
    const initials = `${groom.charAt(0).toUpperCase()} & ${bride.charAt(0).toUpperCase()}`;
    return { groom, bride, groomFull, brideFull, dateRaw, timeRaw, venue, slug, initials };
  }, [wedding, slug]);

  const drawFrame = useCallback(
    (ctx: CanvasRenderingContext2D, f: number, w: number, h: number) => {
      const t = f / TOTAL_FRAMES;
      ctx.clearRect(0, 0, w, h);

      // 1. Animated luminous mesh backdrop
      const grad = ctx.createLinearGradient(
        w * (0.1 + 0.25 * Math.sin(t * Math.PI * 2)),
        0,
        w * (0.9 - 0.2 * Math.cos(t * Math.PI * 2)),
        h
      );
      grad.addColorStop(0, preset.bgStops[0]);
      grad.addColorStop(0.5, preset.bgStops[1]);
      grad.addColorStop(1, preset.bgStops[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Floating soft orbs for glass depth
      const orb1X = w * (0.25 + 0.18 * Math.sin(t * Math.PI * 2));
      const orb1Y = h * (0.22 + 0.1 * Math.cos(t * Math.PI * 2));
      const rad1 = ctx.createRadialGradient(orb1X, orb1Y, 10, orb1X, orb1Y, Math.max(w, h) * 0.45);
      rad1.addColorStop(0, preset.isDark ? 'rgba(0,122,255,0.28)' : 'rgba(0,122,255,0.18)');
      rad1.addColorStop(1, 'rgba(0,122,255,0)');
      ctx.fillStyle = rad1;
      ctx.fillRect(0, 0, w, h);

      const orb2X = w * (0.78 - 0.15 * Math.cos(t * Math.PI * 2));
      const orb2Y = h * (0.76 - 0.12 * Math.sin(t * Math.PI * 2));
      const rad2 = ctx.createRadialGradient(orb2X, orb2Y, 10, orb2X, orb2Y, Math.max(w, h) * 0.42);
      rad2.addColorStop(0, preset.isDark ? 'rgba(88,86,214,0.28)' : 'rgba(175,82,222,0.14)');
      rad2.addColorStop(1, 'rgba(175,82,222,0)');
      ctx.fillStyle = rad2;
      ctx.fillRect(0, 0, w, h);

      // 2. Central iOS Liquid Glass card
      const padX = w * 0.08;
      const padY = h * 0.1;
      const cardW = w - padX * 2;
      const cardH = h - padY * 2;
      const radius = Math.min(w, h) * 0.065;

      ctx.save();
      drawRoundedRect(ctx, padX, padY, cardW, cardH, radius);
      ctx.fillStyle = preset.cardBg;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = preset.cardBorder;
      ctx.stroke();

      // Top specular glass highlight
      ctx.beginPath();
      ctx.moveTo(padX + radius, padY + 2);
      ctx.lineTo(padX + cardW - radius, padY + 2);
      ctx.strokeStyle = preset.isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.92)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // 3. Scene transitions (4 scenes × 90 frames)
      const sceneIdx = Math.min(3, Math.floor(f / 90));
      const localF = f - sceneIdx * 90;
      const enter = easeOutCubic(localF / 22);
      const exit = localF > 74 ? 1 - easeOutCubic((localF - 74) / 16) : 1;
      const alpha = Math.max(0, Math.min(1, enter * exit));
      const slideY = (1 - enter) * 28 - (1 - exit) * 18;

      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) / 540;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Top eyebrow pill
      const pillText =
        sceneIdx === 0
          ? 'THE WEDDING INVITATION'
          : sceneIdx === 1
          ? 'MEMPELAI BERBAHAGIA'
          : sceneIdx === 2
          ? 'JADWAL & LOKASI ACARA'
          : 'SAVE THE DATE';

      ctx.font = `700 ${Math.round(13 * scale)}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`;
      const pillW = ctx.measureText(pillText).width + 36 * scale;
      const pillH = 30 * scale;
      drawRoundedRect(ctx, cx - pillW / 2, padY + 38 * scale, pillW, pillH, pillH / 2);
      ctx.fillStyle = preset.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.78)';
      ctx.fill();
      ctx.fillStyle = preset.accent;
      ctx.fillText(pillText, cx, padY + 38 * scale + pillH / 2 + 1);

      if (sceneIdx === 0) {
        // Scene 01: Opening Monogram
        ctx.font = `300 ${Math.round(88 * scale)}px Georgia, serif`;
        ctx.fillStyle = preset.ink;
        ctx.fillText(coupleData.initials, cx, cy - 26 * scale + slideY);

        ctx.font = `500 ${Math.round(18 * scale)}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = preset.subInk;
        ctx.fillText('Mengundang Anda merayakan hari bahagia kami', cx, cy + 48 * scale + slideY);
      } else if (sceneIdx === 1) {
        // Scene 02: Couple Names
        ctx.font = `600 ${Math.round(46 * scale)}px Georgia, serif`;
        ctx.fillStyle = preset.ink;
        ctx.fillText(coupleData.groom, cx, cy - 62 * scale + slideY);

        ctx.font = `400 ${Math.round(28 * scale)}px Georgia, serif`;
        ctx.fillStyle = preset.accent;
        ctx.fillText('&', cx, cy - 4 * scale + slideY);

        ctx.font = `600 ${Math.round(46 * scale)}px Georgia, serif`;
        ctx.fillStyle = preset.ink;
        ctx.fillText(coupleData.bride, cx, cy + 54 * scale + slideY);

        ctx.font = `500 ${Math.round(14 * scale)}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = preset.subInk;
        ctx.fillText(`${coupleData.groomFull}  ·  ${coupleData.brideFull}`, cx, cy + 114 * scale + slideY);
      } else if (sceneIdx === 2) {
        // Scene 03: Date & Venue
        ctx.font = `700 ${Math.round(30 * scale)}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = preset.ink;
        ctx.fillText(coupleData.dateRaw, cx, cy - 42 * scale + slideY);

        ctx.font = `600 ${Math.round(18 * scale)}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = preset.accent;
        ctx.fillText(`Pukul ${coupleData.timeRaw}`, cx, cy + 8 * scale + slideY);

        ctx.font = `500 ${Math.round(16 * scale)}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = preset.subInk;
        const venueLine = coupleData.venue.length > 42 ? coupleData.venue.slice(0, 40) + '…' : coupleData.venue;
        ctx.fillText(venueLine, cx, cy + 56 * scale + slideY);
      } else {
        // Scene 04: Save the date + URL
        ctx.font = `600 ${Math.round(36 * scale)}px Georgia, serif`;
        ctx.fillStyle = preset.ink;
        ctx.fillText(`${coupleData.groom} & ${coupleData.bride}`, cx, cy - 42 * scale + slideY);

        ctx.font = `500 ${Math.round(15 * scale)}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = preset.subInk;
        ctx.fillText('Konfirmasi kehadiran & panduan lokasi di:', cx, cy + 10 * scale + slideY);

        const urlW = Math.min(cardW - 48 * scale, ctx.measureText(coupleData.slug).width + 52 * scale);
        const urlH = 42 * scale;
        drawRoundedRect(ctx, cx - urlW / 2, cy + 44 * scale + slideY, urlW, urlH, urlH / 2);
        ctx.fillStyle = preset.accent;
        ctx.fill();
        ctx.font = `700 ${Math.round(14 * scale)}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(coupleData.slug, cx, cy + 44 * scale + urlH / 2 + slideY + 1);
      }

      ctx.restore();

      // Bottom subtle progress indicator
      const barW = cardW * 0.42;
      const barH = 4 * scale;
      const barX = cx - barW / 2;
      const barY = padY + cardH - 34 * scale;
      drawRoundedRect(ctx, barX, barY, barW, barH, barH / 2);
      ctx.fillStyle = preset.isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.08)';
      ctx.fill();
      drawRoundedRect(ctx, barX, barY, barW * (f / TOTAL_FRAMES), barH, barH / 2);
      ctx.fillStyle = preset.accent;
      ctx.fill();

      // Watermark pill if non-enterprise preview
      if (!isEnt) {
        ctx.save();
        const wm = 'ENTERPRISE VIDEO PREVIEW';
        ctx.font = `700 ${Math.round(11 * scale)}px -apple-system, BlinkMacSystemFont, sans-serif`;
        const wmW = ctx.measureText(wm).width + 24 * scale;
        const wmH = 24 * scale;
        drawRoundedRect(ctx, cx - wmW / 2, padY + cardH - 72 * scale, wmW, wmH, wmH / 2);
        ctx.fillStyle = 'rgba(29,29,31,0.72)';
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(wm, cx, padY + cardH - 72 * scale + wmH / 2 + 0.5);
        ctx.restore();
      }
    },
    [preset, coupleData, isEnt]
  );

  // Playback loop (30fps)
  useEffect(() => {
    if (!isPlaying || isRendering) return;
    let rafId = 0;
    let last = performance.now();
    const stepMs = 1000 / FPS;

    const tick = (now: number) => {
      if (now - last >= stepMs) {
        last = now;
        setFrame((prev) => (prev + 1) % TOTAL_FRAMES);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, isRendering]);

  // Draw current frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawFrame(ctx, frame, canvas.width, canvas.height);
  }, [frame, aspect, drawFrame]);

  const handleRenderVideo = async () => {
    if (!isEnt || !canvasRef.current || isRendering) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (typeof MediaRecorder === 'undefined' || !canvas.captureStream) {
      setRenderDoneMsg('Browser ini belum mendukung rekaman Canvas MediaRecorder. Gunakan Chrome/Edge/Safari terbaru atau ekspor Remotion JSON.');
      return;
    }

    setIsPlaying(false);
    setIsRendering(true);
    setRenderProgress(0);
    setRenderDoneMsg(null);

    try {
      const stream = canvas.captureStream(FPS);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const donePromise = new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
      });

      recorder.start();
      for (let f = 0; f < TOTAL_FRAMES; f++) {
        drawFrame(ctx, f, canvas.width, canvas.height);
        setFrame(f);
        setRenderProgress(Math.round(((f + 1) / TOTAL_FRAMES) * 100));
        await new Promise((r) => setTimeout(r, Math.round(1000 / FPS)));
      }
      recorder.stop();
      await donePromise;

      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ruanghadir-video-${coupleData.groom.toLowerCase()}-${coupleData.bride.toLowerCase()}-${aspectId.replace(':', 'x')}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setRenderDoneMsg('Video undangan berhasil dirender dan diunduh.');
    } catch {
      setRenderDoneMsg('Gagal merender video di browser ini. Coba ulangi atau gunakan ekspor Remotion Spec.');
    } finally {
      setIsRendering(false);
      setIsPlaying(true);
    }
  };

  const handleCopyRemotionSpec = () => {
    const spec = {
      engine: 'remotion-4',
      compositionId: `InvitationVideo-${aspectId.replace(':', 'x')}`,
      fps: FPS,
      durationInFrames: TOTAL_FRAMES,
      width: aspectId === '9:16' ? 1080 : aspectId === '1:1' ? 1080 : 1920,
      height: aspectId === '9:16' ? 1920 : aspectId === '1:1' ? 1080 : 1080,
      inputProps: {
        preset: preset.id,
        ...coupleData,
      },
    };
    navigator.clipboard?.writeText(JSON.stringify(spec, null, 2));
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2200);
  };

  const currentSceneIdx = Math.min(3, Math.floor(frame / 90));
  const currentSec = (frame / FPS).toFixed(1);

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="glx rounded-[28px] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5856D6]/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5856D6]">
              <Film className="h-3.5 w-3.5" /> Enterprise Video Studio
            </span>
            <span className="inline-flex items-center rounded-full bg-white/75 border border-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#48484A]">
              Remotion Architecture · 30fps HD
            </span>
          </div>
          <h2 className="text-[22px] sm:text-[26px] font-bold tracking-[-0.025em] text-[#1D1D1F]">
            Make Your Invitation Video
          </h2>
          <p className="text-[13.5px] text-[#48484A] max-w-2xl">
            Ubah data undangan Anda secara otomatis menjadi video undangan vertikal (Reels, TikTok, WhatsApp Status) maupun layar venue tanpa edit manual dari nol.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {isEnt ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#34C759]/14 px-3.5 py-1.5 text-[12px] font-bold text-[#1E7E34]">
              <CheckCircle2 className="h-4 w-4" /> Akses Enterprise Aktif
            </span>
          ) : (
            <a
              href="mailto:admin@ruanghadir.net?subject=Aktivasi%20Enterprise%20-%20Make%20Your%20Invitation%20Video"
              className="inline-flex items-center gap-2 rounded-full bg-[#007AFF] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,122,255,0.65)] transition hover:bg-[#0062CC] active:scale-[0.98]"
            >
              <Mail className="h-4 w-4" /> Hubungi Enterprise
            </a>
          )}
        </div>
      </div>

      {/* Main 2-Column Studio */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Live Video Stage (7 cols) */}
        <div className="xl:col-span-7 glx-strong rounded-[30px] p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8E8E93]">
                Live Composition Stage
              </p>
              <p className="text-[14px] font-semibold text-[#1D1D1F]">
                {SCENES[currentSceneIdx]?.label} · {aspect.label}
              </p>
            </div>
            <span className="rounded-full bg-[#1D1D1F]/6 px-3 py-1 font-mono text-[12px] font-semibold text-[#1D1D1F] tabular">
              {currentSec}s / {DURATION_SECONDS}.0s
            </span>
          </div>

          {/* Stage Canvas Frame */}
          <div className="relative flex items-center justify-center rounded-[24px] bg-[#1C1C1E]/92 p-4 sm:p-6 min-h-[380px] sm:min-h-[460px] overflow-hidden border border-white/15">
            <canvas
              ref={canvasRef}
              width={aspect.w}
              height={aspect.h}
              className="rounded-[20px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.55)] max-h-[430px] w-auto max-w-full object-contain"
            />
          </div>

          {/* Timeline Scrubber & Transport */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                disabled={isRendering}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#007AFF] text-white shadow-sm transition hover:bg-[#0062CC] active:scale-95 cursor-pointer disabled:opacity-50"
                aria-label={isPlaying ? 'Jeda video' : 'Putar video'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFrame(0);
                  setIsPlaying(true);
                }}
                disabled={isRendering}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/75 border border-white/80 text-[#1D1D1F] transition hover:bg-white cursor-pointer disabled:opacity-50"
                aria-label="Ulangi dari awal"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <input
                type="range"
                min={0}
                max={TOTAL_FRAMES - 1}
                value={frame}
                disabled={isRendering}
                onChange={(e) => {
                  setIsPlaying(false);
                  setFrame(Number(e.target.value));
                }}
                className="flex-1 accent-[#007AFF] cursor-pointer"
                aria-label="Timeline video"
              />
            </div>

            {/* Scene Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SCENES.map((sc) => {
                const active = currentSceneIdx === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      setFrame(sc.start);
                      setIsPlaying(false);
                    }}
                    className={`rounded-2xl px-3 py-2 text-left text-[11.5px] font-semibold transition cursor-pointer ${
                      active
                        ? 'bg-[#007AFF] text-white shadow-sm'
                        : 'bg-white/65 border border-white/80 text-[#48484A] hover:bg-white'
                    }`}
                  >
                    {sc.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Controls & Enterprise Export (5 cols) */}
        <div className="xl:col-span-5 space-y-5">
          {/* Aspect Ratio */}
          <div className="glx rounded-[26px] p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-[13px] font-bold text-[#1D1D1F]">
              <SlidersHorizontal className="h-4 w-4 text-[#007AFF]" />
              Format Rasio Video
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ASPECTS.map((a) => {
                const Icon = a.icon;
                const active = aspectId === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAspectId(a.id)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-2xl p-3 text-center transition cursor-pointer ${
                      active
                        ? 'bg-[#007AFF] text-white shadow-[0_8px_20px_-8px_rgba(0,122,255,0.7)]'
                        : 'bg-white/65 border border-white/80 text-[#1D1D1F] hover:bg-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[12px] font-bold">{a.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11.5px] text-[#6E6E73]">{aspect.desc}</p>
          </div>

          {/* Motion Style Presets */}
          <div className="glx rounded-[26px] p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-[13px] font-bold text-[#1D1D1F]">
              <Layers className="h-4 w-4 text-[#007AFF]" />
              Gaya Motion Video
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MOTION_PRESETS.map((p) => {
                const active = presetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPresetId(p.id)}
                    className={`rounded-2xl p-3.5 text-left transition cursor-pointer border ${
                      active
                        ? 'bg-white/95 border-[#007AFF] ring-2 ring-[#007AFF]/20'
                        : 'bg-white/55 border-white/80 hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className="h-4 w-10 rounded-full border border-black/10"
                        style={{
                          background: `linear-gradient(135deg, ${p.bgStops[0]}, ${p.bgStops[1]}, ${p.bgStops[2]})`,
                        }}
                      />
                      {active && <CheckCircle2 className="h-4 w-4 text-[#007AFF]" />}
                    </div>
                    <p className="text-[13px] font-bold text-[#1D1D1F]">{p.name}</p>
                    <p className="text-[11px] text-[#6E6E73] leading-snug mt-0.5">{p.tagline}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export / Enterprise Gate Card */}
          <div className="glx-strong rounded-[26px] p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13.5px] font-bold text-[#1D1D1F]">Render & Ekspor Video</p>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${
                  isEnt
                    ? 'bg-[#34C759]/15 text-[#1E7E34]'
                    : 'bg-[#5856D6]/12 text-[#5856D6]'
                }`}
              >
                {isEnt ? 'Siap Ekspor' : 'Khusus Enterprise'}
              </span>
            </div>

            {isEnt ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleRenderVideo}
                  disabled={isRendering}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#007AFF] px-5 py-3 text-[13.5px] font-semibold text-white shadow-[0_12px_28px_-10px_rgba(0,122,255,0.65)] transition hover:bg-[#0062CC] active:scale-[0.98] cursor-pointer disabled:opacity-60"
                >
                  {isRendering ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Merender Video ({renderProgress}%)...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" /> Render & Unduh Video HD
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyRemotionSpec}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-white/75 border border-white/85 px-4 py-2.5 text-[12.5px] font-semibold text-[#1D1D1F] transition hover:bg-white cursor-pointer"
                >
                  <Code2 className="h-4 w-4 text-[#5856D6]" />
                  {copiedSpec ? 'Remotion JSON Tersalin' : 'Salin Remotion Render Spec (JSON)'}
                </button>

                {renderDoneMsg && (
                  <p className="rounded-2xl bg-[#34C759]/12 px-3.5 py-2.5 text-[12px] font-medium text-[#1E7E34]">
                    {renderDoneMsg}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="rounded-2xl bg-[#1D1D1F]/[0.04] border border-white/70 p-3.5 flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5856D6]/12 text-[#5856D6]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div className="text-[12.5px] text-[#48484A] leading-relaxed">
                    <p className="font-bold text-[#1D1D1F]">Ekspor video tanpa watermark khusus akun Enterprise.</p>
                    <p className="mt-0.5">
                      Hubungi <strong>admin@ruanghadir.net</strong> untuk aktivasi email perusahaan dan kode akses Enterprise Anda.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href="mailto:admin@ruanghadir.net?subject=Aktivasi%20Enterprise%20RuangHadir%20Video%20Studio"
                    className="flex items-center justify-center gap-1.5 rounded-full bg-[#007AFF] px-4 py-2.5 text-[12.5px] font-semibold text-white transition hover:bg-[#0062CC]"
                  >
                    <Mail className="h-3.5 w-3.5" /> Email Admin
                  </a>
                  <button
                    type="button"
                    onClick={onOpenEnterprise}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-white/80 border border-white/90 px-4 py-2.5 text-[12.5px] font-semibold text-[#1D1D1F] transition hover:bg-white cursor-pointer"
                  >
                    <Building2 className="h-3.5 w-3.5 text-[#5856D6]" /> Info Enterprise
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import EnterpriseMotionPlayer from '@/components/EnterpriseMotionPlayer';
import { WeddingData, SaaSUser } from '@/types';
import {
  VIDEO_THEMES,
  VIDEO_SCENES,
  VIDEO_FPS,
  VIDEO_TOTAL_FRAMES,
  VideoThemeId,
  VideoAspectId,
  renderInvitationVideoFrame,
  formatTimecode,
} from '@/lib/invitationVideoEngine';

interface VideoInvitationStudioProps {
  wedding: WeddingData;
  slug?: string | null;
  user: SaaSUser | null;
  onOpenEnterprise?: () => void;
}

const ASPECTS: {
  id: VideoAspectId;
  label: string;
  desc: string;
  w: number;
  h: number;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: '9:16', label: '9:16 Reels', desc: '1080×1920 · TikTok, Reels & WA Status', w: 540, h: 960, icon: Smartphone },
  { id: '1:1', label: '1:1 Feed', desc: '1080×1080 · Instagram Feed', w: 720, h: 720, icon: Square },
  { id: '16:9', label: '16:9 Layar', desc: '1920×1080 · Layar Venue & YouTube', w: 960, h: 540, icon: Monitor },
];

export default function VideoInvitationStudio({
  wedding,
  slug,
  user,
  onOpenEnterprise,
}: VideoInvitationStudioProps) {
  const isEnt = isEnterpriseTier(user?.packageId);
  const [themeId, setThemeId] = useState<VideoThemeId>('javanese-classic');
  const [aspectId, setAspectId] = useState<VideoAspectId>('9:16');
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderDoneMsg, setRenderDoneMsg] = useState<string | null>(null);
  const [copiedSpec, setCopiedSpec] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeTheme = useMemo(
    () => VIDEO_THEMES.find((p) => p.id === themeId) || VIDEO_THEMES[0],
    [themeId]
  );
  const aspect = useMemo(
    () => ASPECTS.find((a) => a.id === aspectId) || ASPECTS[0],
    [aspectId]
  );

  const coupleData = useMemo(() => {
    const groom = wedding?.couple?.groom?.nickname || wedding?.couple?.groom?.fullName || 'Rian';
    const bride = wedding?.couple?.bride?.nickname || wedding?.couple?.bride?.fullName || 'Salsa';
    const groomFull = wedding?.couple?.groom?.fullName || 'Rian Mahendra, M.B.A.';
    const brideFull = wedding?.couple?.bride?.fullName || 'Salsa Kirana, S.E.';
    const dateRaw = wedding?.events?.akad?.date || wedding?.events?.resepsi?.date || 'Sabtu, 24 Oktober 2026';
    const timeRaw = wedding?.events?.resepsi?.timeStart || wedding?.events?.akad?.timeStart || '10:00 WIB';
    const venue = wedding?.events?.resepsi?.venueName || wedding?.events?.akad?.venueName || 'Grand Ballroom Hotel Mulia, Jakarta';
    const displaySlug = slug ? `ruanghadir.net/${slug}` : 'ruanghadir.net/undangan-anda';
    const initials = `${groom.charAt(0).toUpperCase()} & ${bride.charAt(0).toUpperCase()}`;
    const heroPhoto = wedding?.bgImageUrl || wedding?.gallery?.[0] || '/assets/kharis-lia/hero.jpg';
    const groomPhoto = wedding?.couple?.groom?.photoUrl || '/assets/kharis-lia/groom.jpg';
    const bridePhoto = wedding?.couple?.bride?.photoUrl || '/assets/kharis-lia/bride.jpg';
    return { groom, bride, groomFull, brideFull, dateRaw, timeRaw, venue, slug: displaySlug, initials, heroPhoto, groomPhoto, bridePhoto };
  }, [wedding, slug]);

  // 30fps live timeline loop
  useEffect(() => {
    if (!isPlaying || isRendering) return;
    let rafId = 0;
    let last = performance.now();
    const stepMs = 1000 / VIDEO_FPS;

    const tick = (now: number) => {
      if (now - last >= stepMs) {
        last = now;
        setFrame((prev) => (prev + 1) % VIDEO_TOTAL_FRAMES);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, isRendering]);

  // Render active frame using shared AE-grade motion engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderInvitationVideoFrame(ctx, frame, canvas.width, canvas.height, themeId, coupleData, !isEnt);
  }, [frame, aspect, themeId, coupleData, isEnt]);

  const handleRenderVideo = async () => {
    if (!isEnt || !canvasRef.current || isRendering) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (typeof MediaRecorder === 'undefined' || !canvas.captureStream) {
      setRenderDoneMsg('Browser ini belum mendukung rekaman Canvas MediaRecorder. Gunakan Chrome/Edge/Safari terbaru atau salin Remotion Spec JSON.');
      return;
    }

    setIsPlaying(false);
    setIsRendering(true);
    setRenderProgress(0);
    setRenderDoneMsg(null);

    try {
      const stream = canvas.captureStream(VIDEO_FPS);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 7_500_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const donePromise = new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
      });

      recorder.start();
      for (let f = 0; f < VIDEO_TOTAL_FRAMES; f++) {
        renderInvitationVideoFrame(ctx, f, canvas.width, canvas.height, themeId, coupleData, false);
        setFrame(f);
        setRenderProgress(Math.round(((f + 1) / VIDEO_TOTAL_FRAMES) * 100));
        await new Promise((r) => setTimeout(r, Math.round(1000 / VIDEO_FPS)));
      }
      recorder.stop();
      await donePromise;

      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ruanghadir-${themeId}-${coupleData.groom.toLowerCase()}-${coupleData.bride.toLowerCase()}-${aspectId.replace(':', 'x')}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setRenderDoneMsg('Video motion graphic HD berhasil dirender dan diunduh.');
    } catch {
      setRenderDoneMsg('Gagal merender video di browser ini. Coba ulangi atau gunakan ekspor Remotion Spec.');
    } finally {
      setIsRendering(false);
      setIsPlaying(true);
    }
  };

  const handleCopyRemotionSpec = () => {
    const spec = {
      engine: 'remotion-4-ae-motion',
      compositionId: `InvitationMotion-${themeId}-${aspectId.replace(':', 'x')}`,
      fps: VIDEO_FPS,
      durationInFrames: VIDEO_TOTAL_FRAMES,
      width: aspectId === '9:16' ? 1080 : aspectId === '1:1' ? 1080 : 1920,
      height: aspectId === '9:16' ? 1920 : aspectId === '1:1' ? 1080 : 1080,
      techniques: activeTheme.techniques,
      inputProps: {
        themeId,
        ...coupleData,
      },
    };
    navigator.clipboard?.writeText(JSON.stringify(spec, null, 2));
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2200);
  };

  const currentSceneIdx = Math.min(3, Math.floor(frame / 90));

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
              After Effects Motion Engine · 30fps HD
            </span>
          </div>
          <h2 className="text-[22px] sm:text-[26px] font-bold tracking-[-0.025em] text-[#1D1D1F]">
            Make Your Invitation Video
          </h2>
          <p className="text-[13.5px] text-[#48484A] max-w-2xl">
            Render undangan Anda menjadi video motion graphic teknis (Trim Paths, Track Matte, Volumetric Light Leak) dengan 3 tema unggulan: Javanese Classic, Grand Ballroom, dan Luxury Love Pink.
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8E8E93]">
                Live Motion Composition · {activeTheme.name}
              </p>
              <p className="text-[14px] font-semibold text-[#1D1D1F]">
                {VIDEO_SCENES[currentSceneIdx]?.label} · {aspect.label}
              </p>
            </div>
            <span className="rounded-full bg-[#1D1D1F]/6 px-3 py-1 font-mono text-[12px] font-semibold text-[#1D1D1F] tabular">
              TC {formatTimecode(frame)} / 00:12:00
            </span>
          </div>

          {/* Live 1:1 Theme Motion Stage + Hidden Export Canvas */}
          <div className="relative flex items-center justify-center rounded-[24px] bg-[#14161F] p-4 sm:p-6 min-h-[420px] sm:min-h-[490px] overflow-hidden border border-white/15">
            <div
              className="relative overflow-hidden rounded-[22px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.65)] border border-white/15"
              style={{
                aspectRatio: aspectId === '9:16' ? '9 / 16' : aspectId === '1:1' ? '1 / 1' : '16 / 9',
                height: aspectId === '16:9' ? 'auto' : '450px',
                width: aspectId === '16:9' ? '100%' : 'auto',
                maxWidth: '100%',
              }}
            >
              <EnterpriseMotionPlayer
                themeId={themeId}
                couple={coupleData}
                sceneIdx={currentSceneIdx}
                progress={frame / VIDEO_TOTAL_FRAMES}
                isPlaying={isPlaying}
                showWatermark={!isEnt}
              />
            </div>
            <canvas
              ref={canvasRef}
              width={aspect.w}
              height={aspect.h}
              className="hidden"
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
                max={VIDEO_TOTAL_FRAMES - 1}
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

            {/* Scene Keyframe Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VIDEO_SCENES.map((sc) => {
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

          {/* 3 Flagship AE Motion Theme Presets */}
          <div className="glx rounded-[26px] p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-[13px] font-bold text-[#1D1D1F]">
              <Layers className="h-4 w-4 text-[#007AFF]" />
              Tema Motion Graphic (After Effects Style)
            </div>
            <div className="space-y-2.5">
              {VIDEO_THEMES.map((p) => {
                const active = themeId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setThemeId(p.id);
                      setFrame(0);
                      setIsPlaying(true);
                    }}
                    className={`w-full rounded-2xl p-3.5 text-left transition cursor-pointer border ${
                      active
                        ? 'bg-white/95 border-[#007AFF] ring-2 ring-[#007AFF]/20'
                        : 'bg-white/55 border-white/80 hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-4 w-10 rounded-full border border-black/10"
                          style={{
                            background: `linear-gradient(135deg, ${p.swatch[0]}, ${p.swatch[1]}, ${p.swatch[2]})`,
                          }}
                        />
                        <p className="text-[13px] font-bold text-[#1D1D1F]">{p.name}</p>
                      </div>
                      {active && <CheckCircle2 className="h-4 w-4 text-[#007AFF]" />}
                    </div>
                    <p className="text-[11.5px] text-[#6E6E73] leading-snug">{p.tagline}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.techniques.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full bg-[#007AFF]/8 px-2 py-0.5 text-[10px] font-semibold text-[#007AFF]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
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

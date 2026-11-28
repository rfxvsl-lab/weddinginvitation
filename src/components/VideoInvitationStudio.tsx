'use client';

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
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
  SlidersHorizontal,
  Layers,
  Loader2,
  Music2,
  Upload,
  UserRound,
  Share2,
  X,
  AlertTriangle,
  Volume2,
  VolumeX,
  Gauge,
  Link2,
  Copy,
  Check,
  Type,
} from 'lucide-react';
import { isEnterpriseTier, ENTERPRISE_CONTACT_EMAIL } from '@/lib/packageLimits';
import EnterpriseMotionPlayer, {
  MOTION_FONT_CSS_URL,
  MOTION_FONT_FAMILIES,
  toFilmData,
  type MotionPlayerCouple,
} from '@/components/EnterpriseMotionPlayer';
import { StoryPlayer, STORY_FONT_FAMILIES, type StoryFilmData } from '@/components/motion/StoryFilm';
import StoryEditor from '@/components/video/StoryEditor';
import { STORY_LIMITS, momentReady, storyDuration, type ResolvedStory } from '@/lib/video/story/model';
import type { WeddingData, SaaSUser, VideoStudioSettings, Guest, StoryProject } from '@/types';
import { VIDEO_THEMES, VIDEO_FPS, VIDEO_DURATION_SEC, type VideoAspectId, type VideoThemeId } from '@/lib/invitationVideoEngine';
import {
  resolveVideoSettings,
  outputSize,
  videoFileName,
  formatBytes,
  formatDuration,
  type ResolvedVideoSettings,
  type VideoQuality,
  type MusicSource,
  COPY_LIMITS,
  THEMES_WITH_COPY,
} from '@/lib/video/studioSettings';
import type { ExportFilmResult } from '@/lib/video/exportVideo';
import { uploadWeddingAudio, uploadInvitationVideo } from '@/lib/cloudinary';

interface VideoInvitationStudioProps {
  wedding: WeddingData;
  /** Daftar tamu proyek aktif (untuk versi personal). */
  guests?: Guest[];
  slug?: string | null;
  user: SaaSUser | null;
  onOpenEnterprise?: () => void;
  /** Simpan pengaturan studio ke data undangan (autosave editor). */
  onSettingsChange?: (settings: VideoStudioSettings) => void;
}

const ASPECTS: { id: VideoAspectId; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: '9:16', label: '9:16 Reels', desc: 'TikTok, Reels, Story & Status WhatsApp', icon: Smartphone },
  { id: '1:1', label: '1:1 Feed', desc: 'Feed Instagram & Facebook', icon: Square },
  { id: '16:9', label: '16:9 Layar', desc: 'Layar venue, YouTube & presentasi', icon: Monitor },
];

const QUALITIES: { id: VideoQuality; label: string; desc: string }[] = [
  { id: 'hd', label: 'HD 1080p', desc: 'Paling tajam, render lebih lama' },
  { id: 'fast', label: 'Cepat 720p', desc: '±2x lebih cepat, cocok untuk WhatsApp' },
];

type JobPhase = 'music' | 'prepare' | 'render' | 'finalize' | 'zip';
interface Job {
  phase: JobPhase;
  frame: number;
  total: number;
  startedAt: number;
  renderStartedAt: number | null;
  batch?: { index: number; count: number; name: string };
}
interface BatchResult {
  url: string;
  name: string;
  size: number;
  count: number;
  failed: string[];
  elapsedMs: number;
  warnings: string[];
  container: string;
}

/** Batas render massal per job: semua video ditampung di memori sebelum di-ZIP. */
const MAX_BATCH = 20;

const slugForFile = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30) || 'undangan';

function uniqueName(name: string, files: { name: string }[]) {
  if (!files.some((f) => f.name === name)) return name;
  const dot = name.lastIndexOf('.');
  let i = 2;
  while (files.some((f) => f.name === `${name.slice(0, dot)}-${i}${name.slice(dot)}`)) i++;
  return `${name.slice(0, dot)}-${i}${name.slice(dot)}`;
}
interface RenderResult {
  url: string;
  file: File;
  meta: ExportFilmResult;
  withMusic: boolean;
}

/* ------------------------------------------------------------------ */
/* Panggung ekspor tersembunyi: film yang sama dengan preview, di-seek per frame. */
/* ------------------------------------------------------------------ */

interface ExportStageHandle {
  node: () => HTMLElement | null;
  seek: (timeSec: number) => void;
}

const ExportStage = forwardRef<
  ExportStageHandle,
  { themeId: VideoThemeId; couple: MotionPlayerCouple; cssWidth: number; cssHeight: number; story?: StoryFilmData | null }
>(function ExportStage({ themeId, couple, cssWidth, cssHeight, story }, ref) {
  const [time, setTime] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(
    ref,
    () => ({
      node: () => (rootRef.current?.firstElementChild as HTMLElement | null) ?? null,
      seek: (timeSec: number) => flushSync(() => setTime(timeSec)),
    }),
    []
  );
  return (
    <div
      ref={rootRef}
      aria-hidden
      style={{ position: 'fixed', left: -20000, top: 0, width: cssWidth, height: cssHeight, pointerEvents: 'none', contain: 'strict' }}
    >
      {story ? (
        <StoryPlayer data={story} time={time} showWatermark={false} />
      ) : (
        <EnterpriseMotionPlayer themeId={themeId} couple={couple} progress={time / VIDEO_DURATION_SEC} showWatermark={false} />
      )}
    </div>
  );
});

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

/* ------------------------------------------------------------------ */

export default function VideoInvitationStudio({ wedding, guests: guestList = [], slug, user, onOpenEnterprise, onSettingsChange }: VideoInvitationStudioProps) {
  const isEnt = isEnterpriseTier(user?.packageId);

  // ---- Pengaturan (tersimpan di data undangan) ----
  const stored = useMemo(() => resolveVideoSettings(wedding?.videoStudio), [wedding?.videoStudio]);
  const [settings, setSettings] = useState<ResolvedVideoSettings>(stored);
  const settingsRef = useRef(settings);
  const storedKey = JSON.stringify(stored);
  useEffect(() => {
    const next = JSON.parse(storedKey) as ResolvedVideoSettings;
    settingsRef.current = next;
    setSettings(next);
  }, [storedKey]);
  const update = useCallback(
    (patch: Partial<ResolvedVideoSettings>) => {
      const prev = settingsRef.current;
      const next = { ...prev, ...patch, music: { ...prev.music, ...(patch.music || {}) } };
      settingsRef.current = next;
      setSettings(next);
      onSettingsChange?.(next);
    },
    [onSettingsChange]
  );
  const { themeId, quality } = settings;
  const isStory = settings.mode === 'story';
  const story = settings.story as ResolvedStory;
  /** Video Cerita selalu vertikal: latar AI dibuat 9:16. */
  const aspectId: VideoAspectId = isStory ? '9:16' : settings.aspect;
  const activeTheme = VIDEO_THEMES.find((p) => p.id === themeId) || VIDEO_THEMES[0];
  const size = outputSize(aspectId, quality);
  const storyMoments = story.moments.filter(momentReady);
  const dur = isStory ? storyDuration(Math.max(storyMoments.length, 1)) : VIDEO_DURATION_SEC;
  const storyRenderable = storyMoments.filter((m) => story.assets[m.id]?.bg && story.assets[m.id]?.chars).length >= STORY_LIMITS.minMoments;

  // ---- Tamu (versi personal) ----
  const guests = useMemo(() => guestList.filter((g) => g?.name?.trim()), [guestList]);
  const guest = guests.find((g) => g.id === settings.guestId) || null;

  // ---- Musik ----
  const invitationMusic = wedding?.musicUrl?.trim() || '';
  const musicSource: MusicSource =
    settings.music.source === 'invitation' && !invitationMusic ? 'none' : settings.music.source === 'custom' && !settings.music.customUrl ? 'none' : settings.music.source;
  const musicUrl = musicSource === 'invitation' ? invitationMusic : musicSource === 'custom' ? settings.music.customUrl : '';
  const musicTitle =
    musicSource === 'invitation' ? wedding?.musicTitle || 'Musik undangan' : musicSource === 'custom' ? settings.music.customTitle || 'Musik khusus video' : 'Tanpa musik';
  const [uploading, setUploading] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [musicDuration, setMusicDuration] = useState<number | null>(null);
  const [previewSound, setPreviewSound] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ---- Data film ----
  const coupleData: MotionPlayerCouple = useMemo(() => {
    const groom = wedding?.couple?.groom?.nickname || wedding?.couple?.groom?.fullName || 'Rian';
    const bride = wedding?.couple?.bride?.nickname || wedding?.couple?.bride?.fullName || 'Salsa';
    const groomFull = wedding?.couple?.groom?.fullName || groom;
    const brideFull = wedding?.couple?.bride?.fullName || bride;
    const dateRaw = wedding?.events?.akad?.date || wedding?.events?.resepsi?.date || '';
    const timeRaw = wedding?.events?.resepsi?.timeStart || wedding?.events?.akad?.timeStart || '';
    const venue = wedding?.events?.resepsi?.venueName || wedding?.events?.akad?.venueName || '';
    const displaySlug = slug ? `ruanghadir.net/${slug}` : 'ruanghadir.net/undangan-anda';
    const initials = `${groom.charAt(0).toUpperCase()} & ${bride.charAt(0).toUpperCase()}`;
    const parents = (p?: { fatherName?: string; motherName?: string }) =>
      p?.fatherName || p?.motherName ? [p?.fatherName, p?.motherName].filter(Boolean).join(' & ') : undefined;
    const fmtDate = (iso?: string) => {
      if (!iso) return '';
      const dt = new Date(iso);
      return isNaN(dt.getTime()) ? iso : dt.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };
    const ev = (e?: { name?: string; date?: string; timeStart?: string; timeEnd?: string; venueName?: string }, fallback = '') =>
      e && (e.date || e.venueName)
        ? {
            title: e.name || fallback,
            date: fmtDate(e.date),
            time: [e.timeStart, e.timeEnd].filter(Boolean).join(' – ') + (e.timeStart ? ' WIB' : ''),
            venue: e.venueName || '',
          }
        : null;
    const events = [ev(wedding?.events?.akad, 'Akad Nikah'), ev(wedding?.events?.resepsi, 'Resepsi Pernikahan')].filter(Boolean) as {
      title: string;
      date: string;
      time: string;
      venue: string;
    }[];
    const gallery = (wedding?.gallery || []).filter(Boolean).slice(0, 6);
    return {
      groom,
      bride,
      groomFull,
      brideFull,
      dateRaw,
      timeRaw,
      venue,
      slug: displaySlug,
      initials,
      heroPhoto: wedding?.bgImageUrl || wedding?.gallery?.[0] || undefined,
      groomPhoto: wedding?.couple?.groom?.photoUrl || undefined,
      bridePhoto: wedding?.couple?.bride?.photoUrl || undefined,
      groomParents: parents(wedding?.couple?.groom),
      brideParents: parents(wedding?.couple?.bride),
      events: events.length ? events : undefined,
      gallery: gallery.length >= 4 ? gallery : undefined,
      guestName: guest?.name || undefined,
      tagline: settings.copy.tagline || undefined,
      closing: settings.copy.closing || undefined,
    };
  }, [wedding, slug, guest?.name, settings.copy.tagline, settings.copy.closing]);

  // ---- Pemutaran preview ----
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const isRendering = job !== null;

  const durRef = useRef(dur);
  durRef.current = dur;
  useEffect(() => {
    if (!isPlaying || isRendering) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      setProgress((p) => (p + dt / durRef.current) % 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, isRendering]);

  // Suara pratinjau mengikuti pemutaran film.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = settings.music.volume;
    const shouldPlay = previewSound && isPlaying && !isRendering && !!musicUrl;
    if (!shouldPlay) {
      a.pause();
      return;
    }
    const want = settings.music.offsetSec + progress * dur;
    if (Math.abs(a.currentTime - want) > 0.35) a.currentTime = want;
    if (a.paused) a.play().catch(() => setPreviewSound(false));
  }, [previewSound, isPlaying, isRendering, musicUrl, progress, dur, settings.music.offsetSec, settings.music.volume]);

  useEffect(() => {
    setMusicDuration(null);
  }, [musicUrl]);

  // ---- Render ----
  const stageRef = useRef<ExportStageHandle>(null);
  /** Nama tamu pada hasil render tunggal terakhir (untuk metadata tautan). */
  const stageGuestNameForResult = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [result, setResult] = useState<RenderResult | null>(null);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [error, setError] = useState<{ message: string; musicFailed?: boolean; batch?: boolean } | null>(null);
  const [guestMode, setGuestMode] = useState<'single' | 'batch'>('single');
  const [batchIds, setBatchIds] = useState<string[]>([]);
  const [batchQuery, setBatchQuery] = useState('');
  /** Nama tamu yang sedang dirender di panggung ekspor (undefined = ikut pilihan tunggal). */
  const [stageGuest, setStageGuest] = useState<string | null | undefined>(undefined);
  const filteredGuests = useMemo(() => {
    const q = batchQuery.trim().toLowerCase();
    return q ? guests.filter((g) => `${g.name} ${g.group || ''}`.toLowerCase().includes(q)) : guests;
  }, [guests, batchQuery]);
  // Tamu yang sudah dihapus dari daftar tidak ikut batch.
  useEffect(() => {
    setBatchIds((ids) => ids.filter((id) => guests.some((g) => g.id === id)));
  }, [guests]);

  useEffect(() => () => {
    abortRef.current?.abort();
  }, []);
  useEffect(() => () => {
    if (result) URL.revokeObjectURL(result.url);
  }, [result]);
  useEffect(() => () => {
    if (batchResult) URL.revokeObjectURL(batchResult.url);
  }, [batchResult]);
  const buildStoryData = useCallback(
    (c: MotionPlayerCouple): StoryFilmData => {
      const fd = toFilmData(c);
      return {
        groom: fd.groom,
        bride: fd.bride,
        dateLong: fd.dateLong,
        day: fd.day,
        monthNum: fd.monthNum,
        year: fd.year,
        events: fd.events,
        slug: fd.slug,
        guest: fd.guest,
        closingNarration: story.closingNarration || undefined,
        style: story.style,
        moments: storyMoments.map((m) => ({ ...m, bg: story.assets[m.id]?.bg, chars: story.assets[m.id]?.chars })),
        finale: story.finale ? { bg: story.finale.bg, chars: story.finale.chars } : undefined,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(story)]
  );
  const stageCouple = useMemo(
    () => (stageGuest === undefined ? coupleData : { ...coupleData, guestName: stageGuest || undefined }),
    [coupleData, stageGuest]
  );
  const previewStory = useMemo(() => (isStory ? buildStoryData(coupleData) : null), [isStory, buildStoryData, coupleData]);
  const stageStory = useMemo(() => (isStory ? buildStoryData(stageCouple) : null), [isStory, buildStoryData, stageCouple]);

  useEffect(() => {
    if (!isRendering) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isRendering]);

  /** Satu job render: tunggal (guestIds = [satu id atau null]) atau massal (beberapa tamu → ZIP). */
  const startRender = async ({ skipMusic = false, batch = false }: { skipMusic?: boolean; batch?: boolean } = {}) => {
    if (!isEnt || isRendering) return;
    if (isStory && !storyRenderable) return;
    const { exportFilmVideo, supportsVideoExport, VideoExportError } = await import('@/lib/video/exportVideo');
    const { createRasterCache } = await import('@/lib/video/frameRasterizer');
    setError(null);
    if (!supportsVideoExport()) {
      setError({ message: 'Browser ini belum bisa membuat video. Gunakan Chrome, Edge, atau Safari versi terbaru di komputer atau HP.' });
      return;
    }
    const targets: { id: string | null; name: string | null }[] = batch
      ? guests.filter((g) => batchIds.includes(g.id)).slice(0, MAX_BATCH).map((g) => ({ id: g.id, name: g.name }))
      : [{ id: guest?.id ?? null, name: guest?.name ?? null }];
    if (!targets.length) return;
    if (result) {
      URL.revokeObjectURL(result.url);
      setResult(null);
    }
    if (batchResult) {
      URL.revokeObjectURL(batchResult.url);
      setBatchResult(null);
    }
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const startedAt = performance.now();
    const useMusic = !skipMusic && !!musicUrl;
    const total = Math.round(dur * VIDEO_FPS);
    setIsPlaying(false);
    setJob({
      phase: useMusic ? 'music' : 'prepare',
      frame: 0,
      total,
      startedAt,
      renderStartedAt: null,
      batch: batch ? { index: 0, count: targets.length, name: targets[0].name || '' } : undefined,
    });

    let wakeLock: { release: () => Promise<void> } | null = null;
    try {
      wakeLock = (await (navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock?.request('screen')) ?? null;
    } catch {
      wakeLock = null;
    }

    try {
      let audio: AudioBuffer | null = null;
      if (useMusic) {
        const { buildSoundtrack } = await import('@/lib/video/soundtrack');
        try {
          audio = await buildSoundtrack(musicUrl, {
            durationSec: dur,
            offsetSec: settings.music.offsetSec,
            volume: settings.music.volume,
            signal: ctrl.signal,
          });
        } catch (e) {
          if (ctrl.signal.aborted) throw e;
          setError({ message: (e as Error).message, musicFailed: true, batch });
          return;
        }
      }

      const cache = createRasterCache();
      const files: { name: string; data: Uint8Array }[] = [];
      const failed: string[] = [];
      const warnings = new Set<string>();
      let last: { out: ExportFilmResult; name: string } | null = null;

      for (let k = 0; k < targets.length; k++) {
        const target = targets[k];
        flushSync(() => setStageGuest(target.name));
        setJob((j) => (j ? { ...j, phase: 'prepare', frame: 0, renderStartedAt: null, batch: j.batch ? { index: k, count: targets.length, name: target.name || '' } : undefined } : j));
        await nextFrame();
        const node = stageRef.current?.node();
        if (!node) throw new Error('Panggung render belum siap. Coba lagi.');

        let lastUi = 0;
        try {
          const out = await exportFilmVideo({
            node,
            width: size.width,
            height: size.height,
            fps: VIDEO_FPS,
            durationSec: dur,
            seek: (t) => stageRef.current?.seek(t),
            audio,
            fontCssUrls: [MOTION_FONT_CSS_URL],
            fontFamilies: isStory ? STORY_FONT_FAMILIES : MOTION_FONT_FAMILIES[themeId],
            rasterCache: cache,
            signal: ctrl.signal,
            onProgress: (p) => {
              const now = performance.now();
              if (p.phase === 'render' && p.frame < p.total && now - lastUi < 250) return;
              lastUi = now;
              setJob((j) =>
                j ? { ...j, phase: p.phase, frame: p.frame, total: p.total, renderStartedAt: j.renderStartedAt ?? (p.phase === 'render' ? now : null) } : j
              );
            },
          });
          out.warnings.forEach((w) => warnings.add(w));
          const name = videoFileName({ groom: coupleData.groom, bride: coupleData.bride, themeId: isStory ? 'cerita' : themeId, aspect: aspectId, guestName: target.name, ext: out.container });
          last = { out, name };
          if (batch) files.push({ name: uniqueName(name, files), data: new Uint8Array(await out.blob.arrayBuffer()) });
        } catch (e) {
          if (ctrl.signal.aborted || (e instanceof VideoExportError && e.code === 'aborted') || !batch) throw e;
          failed.push(target.name || 'Tamu');
        }
      }

      if (!batch && last) {
        stageGuestNameForResult.current = targets[0]?.name ?? null;
        const file = new File([last.out.blob], last.name, { type: last.out.mimeType });
        setResult({ url: URL.createObjectURL(last.out.blob), file, meta: last.out, withMusic: !!last.out.audioCodec });
      } else if (batch) {
        if (!files.length) throw new Error('Tidak ada video yang berhasil dirender.');
        setJob((j) => (j ? { ...j, phase: 'zip' } : j));
        const { zipSync } = await import('fflate');
        // Video sudah terkompresi: simpan tanpa kompresi ulang (level 0) supaya cepat.
        const zip = zipSync(Object.fromEntries(files.map((f) => [f.name, [f.data, { level: 0 }]])) as Parameters<typeof zipSync>[0]);
        const zipName = `video-undangan-${slugForFile(coupleData.groom)}-${slugForFile(coupleData.bride)}-${files.length}-tamu.zip`;
        const blob = new Blob([zip], { type: 'application/zip' });
        setBatchResult({
          url: URL.createObjectURL(blob),
          name: zipName,
          size: blob.size,
          count: files.length,
          failed,
          elapsedMs: performance.now() - startedAt,
          warnings: Array.from(warnings),
          container: last?.out.container || 'mp4',
        });
      }
    } catch (e) {
      if (ctrl.signal.aborted || (e instanceof VideoExportError && e.code === 'aborted')) {
        setError({ message: 'Render dibatalkan.' });
      } else {
        setError({ message: (e as Error)?.message || 'Render gagal. Coba lagi atau pilih kualitas Cepat 720p.' });
      }
    } finally {
      await wakeLock?.release().catch(() => undefined);
      abortRef.current = null;
      setJob(null);
      setStageGuest(undefined);
    }
  };

  const cancelRender = () => abortRef.current?.abort();

  const downloadUrl = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const download = () => result && downloadUrl(result.url, result.file.name);

  const canShareFile = useMemo(() => {
    if (!result || typeof navigator === 'undefined' || !navigator.canShare) return false;
    try {
      return navigator.canShare({ files: [result.file] });
    } catch {
      return false;
    }
  }, [result]);
  const share = async () => {
    if (!result) return;
    try {
      await navigator.share({ files: [result.file], title: `Undangan ${coupleData.groom} & ${coupleData.bride}` });
    } catch {
      /* dibatalkan pengguna */
    }
  };

  const [videoUpload, setVideoUpload] = useState<number | null>(null);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  /** URL blob hasil render yang sudah dibuatkan tautan (supaya tombol tidak muncul lagi). */
  const [sharedResultUrl, setSharedResultUrl] = useState<string | null>(null);
  const saveVideoLink = async () => {
    if (!result || videoUpload !== null) return;
    setVideoUploadError(null);
    setVideoUpload(0);
    try {
      const res = await uploadInvitationVideo(result.file, (p) => setVideoUpload(p));
      update({
        shared: {
          url: res.secureUrl,
          themeId,
          aspect: aspectId,
          guestName: stageGuestNameForResult.current,
          bytes: res.bytes || result.file.size,
          createdAt: new Date().toISOString(),
        },
      });
      setSharedResultUrl(result.url);
    } catch (e) {
      setVideoUploadError(`Video gagal diunggah: ${(e as Error)?.message || 'jaringan'}. File tetap bisa diunduh.`);
    } finally {
      setVideoUpload(null);
    }
  };
  const copyVideoLink = async () => {
    if (!settings.shared) return;
    try {
      await navigator.clipboard.writeText(settings.shared.url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setVideoUploadError('Browser menolak menyalin otomatis. Salin tautan secara manual dari kotak di atas.');
    }
  };

  const onUploadMusic = async (file: File) => {
    setUploadError(null);
    setUploading(0);
    try {
      const res = await uploadWeddingAudio(file, (p) => setUploading(p));
      update({ music: { ...settings.music, source: 'custom', customUrl: res.secureUrl, customTitle: file.name } });
    } catch {
      setUploadError('Gagal mengunggah musik. Periksa koneksi lalu coba lagi.');
    } finally {
      setUploading(null);
    }
  };

  // ---- Tampilan progres ----
  const pct = job ? Math.round((job.frame / Math.max(1, job.total)) * 100) : 0;
  const eta = (() => {
    if (!job || job.phase !== 'render' || !job.renderStartedAt || job.frame < 10) return null;
    const per = (performance.now() - job.renderStartedAt) / job.frame;
    return formatDuration(per * (job.total - job.frame));
  })();
  const phaseLabel: Record<JobPhase, string> = {
    music: 'Menyiapkan musik…',
    prepare: 'Menyiapkan font & foto…',
    render: `Merender frame ${job?.frame ?? 0}/${job?.total ?? 0}`,
    finalize: 'Menyusun file video…',
    zip: 'Menyusun file ZIP…',
  };

  const elapsed = progress * dur;
  const fmtSec = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const chip = (active: boolean) =>
    `rounded-2xl text-left transition cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rh-primary)]/50 disabled:cursor-not-allowed disabled:opacity-55 ${
      active ? 'bg-white/95 border-[var(--rh-primary)] ring-2 ring-[var(--rh-primary)]/20' : 'bg-white/55 border-white/80 hover:bg-white/80'
    }`;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="glx rounded-[28px] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8C6B34]/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8C6B34]">
              <Film className="h-3.5 w-3.5" /> Enterprise Video Studio
            </span>
          </div>
          <h2 className="text-[22px] sm:text-[26px] font-bold tracking-[-0.025em] text-[var(--rh-ink)]">Video Undangan</h2>
          <p className="text-[13.5px] text-[var(--rh-ink-2)] max-w-2xl">
            {isStory
              ? 'Video cerita ilustrasi: karakter mirip kalian digambar AI dari foto, adegan dari kisah kalian sendiri, ditutup dengan undangan.'
              : `Film undangan ${VIDEO_DURATION_SEC} detik dari data undangan Anda: nama, foto, tanggal, lokasi, dan musik.`}{' '}
            Hasil unduhan sama persis dengan pratinjau.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {isEnt ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3F7A52]/14 px-3.5 py-1.5 text-[12px] font-bold text-[#3F7A52]">
              <CheckCircle2 className="h-4 w-4" /> Akses Enterprise Aktif
            </span>
          ) : (
            <a
              href={`mailto:${ENTERPRISE_CONTACT_EMAIL}?subject=Aktivasi%20Enterprise%20-%20Video%20Undangan`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--rh-primary)] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[var(--rh-primary-hover)] active:scale-[0.98]"
            >
              <Mail className="h-4 w-4" /> Hubungi Enterprise
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-full bg-[var(--rh-ink)]/[0.05] p-1 max-w-md" role="tablist" aria-label="Jenis video">
        {(
          [
            ['story', 'Video Cerita (AI)'],
            ['template', 'Film Template'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={settings.mode === id}
            disabled={isRendering}
            onClick={() => {
              update({ mode: id });
              setProgress(0);
              setIsPlaying(true);
            }}
            className={`rounded-full px-4 py-2.5 text-[13px] font-semibold transition disabled:opacity-55 ${
              settings.mode === id ? 'bg-white text-[var(--rh-ink)] shadow-sm' : 'text-[var(--rh-ink-2)] hover:text-[var(--rh-ink)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Kiri: panggung */}
        <div className="xl:col-span-7 glx-strong rounded-[30px] p-4 sm:p-6 space-y-5 xl:sticky xl:top-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--rh-muted)]">Pratinjau · {isStory ? 'Video Cerita' : activeTheme.name}</p>
              <p className="text-[14px] font-semibold text-[var(--rh-ink)] truncate">
                {ASPECTS.find((a) => a.id === aspectId)?.label} · {guest ? `Untuk ${guest.name}` : 'Tamu Undangan'}
              </p>
            </div>
            <span className="rounded-full bg-[var(--rh-ink)]/6 px-3 py-1 font-mono text-[12px] font-semibold text-[var(--rh-ink)] tabular">
              {fmtSec(elapsed)} / {fmtSec(dur)}
            </span>
          </div>

          <div className="relative flex items-center justify-center rounded-[24px] bg-[#14161F] p-3 sm:p-6 min-h-[380px] sm:min-h-[490px] overflow-hidden border border-white/15">
            <div
              className="relative overflow-hidden rounded-[18px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.65)] border border-white/15"
              style={{
                aspectRatio: aspectId === '9:16' ? '9 / 16' : aspectId === '1:1' ? '1 / 1' : '16 / 9',
                height: aspectId === '16:9' ? 'auto' : 'min(450px, 70vh)',
                width: aspectId === '16:9' ? '100%' : 'auto',
                maxWidth: '100%',
              }}
            >
              {/* Saat render, film pratinjau dilepas supaya CPU penuh untuk panggung ekspor. */}
              {!isRendering && (
                previewStory ? (
                  <StoryPlayer data={previewStory} time={progress * dur} showWatermark={!isEnt} />
                ) : (
                  <EnterpriseMotionPlayer themeId={themeId} couple={coupleData} progress={progress} isPlaying={isPlaying} showWatermark={!isEnt} />
                )
              )}
            </div>
            {isRendering && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#14161F]/88 p-6 text-center text-white" role="status" aria-live="polite">
                <Loader2 className="h-7 w-7 animate-spin" />
                <div className="space-y-1">
                  {job?.batch && (
                    <p className="text-[12.5px] font-semibold text-white/80">
                      Video {job.batch.index + 1} dari {job.batch.count}: {job.batch.name}
                    </p>
                  )}
                  <p className="text-[15px] font-semibold">{job ? phaseLabel[job.phase] : ''}</p>
                  <p className="text-[12.5px] text-white/70">
                    {eta ? `Sisa sekitar ${eta}. ` : ''}Biarkan halaman ini tetap terbuka.
                  </p>
                </div>
                <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/15" aria-hidden>
                  <div className="h-full rounded-full bg-white transition-[width] duration-200" style={{ width: `${pct}%` }} />
                </div>
                <button
                  type="button"
                  onClick={cancelRender}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-white/10"
                >
                  <X className="h-3.5 w-3.5" /> Batalkan render
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              disabled={isRendering}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--rh-primary)] text-white shadow-sm transition hover:bg-[var(--rh-primary-hover)] active:scale-95 cursor-pointer disabled:opacity-50"
              aria-label={isPlaying ? 'Jeda pratinjau' : 'Putar pratinjau'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setProgress(0);
                setIsPlaying(true);
              }}
              disabled={isRendering}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/75 border border-white/80 text-[var(--rh-ink)] transition hover:bg-white cursor-pointer disabled:opacity-50"
              aria-label="Putar dari awal"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={0}
              max={1000}
              value={Math.round(progress * 1000)}
              disabled={isRendering}
              onChange={(e) => {
                setIsPlaying(false);
                setProgress(Number(e.target.value) / 1000);
              }}
              className="flex-1 accent-[var(--rh-primary)] cursor-pointer"
              aria-label="Posisi pratinjau"
            />
            {musicUrl && (
              <button
                type="button"
                onClick={() => {
                  setPreviewSound((v) => !v);
                  setIsPlaying(true);
                }}
                disabled={isRendering}
                aria-pressed={previewSound}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/75 border border-white/80 text-[var(--rh-ink)] transition hover:bg-white cursor-pointer disabled:opacity-50"
                aria-label={previewSound ? 'Matikan suara pratinjau' : 'Nyalakan suara pratinjau'}
              >
                {previewSound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            )}
          </div>
          {musicUrl && (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <audio
              ref={audioRef}
              src={musicUrl}
              preload="metadata"
              onLoadedMetadata={(e) => setMusicDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : null)}
              className="hidden"
            />
          )}
        </div>

        {/* Kanan: pengaturan & ekspor */}
        <div className="xl:col-span-5 space-y-5">
          {isStory && (
            <StoryEditor
              story={story}
              onChange={(next: StoryProject) => update({ story: next })}
              groomName={coupleData.groom}
              brideName={coupleData.bride}
              venue={wedding?.events?.resepsi?.venueName || wedding?.events?.akad?.venueName || ''}
              isEnt={isEnt}
              disabled={isRendering}
            />
          )}
          {!isStory && (
          <section className="glx rounded-[26px] p-5 space-y-3.5" aria-labelledby="vs-format">
            <h3 id="vs-format" className="flex items-center gap-2 text-[13px] font-bold text-[var(--rh-ink)]">
              <SlidersHorizontal className="h-4 w-4 text-[var(--rh-primary)]" /> Format
            </h3>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="vs-format">
              {ASPECTS.map((a) => {
                const Icon = a.icon;
                const active = aspectId === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={isRendering}
                    onClick={() => update({ aspect: a.id })}
                    className={`${chip(active)} flex flex-col items-center justify-center gap-1 p-3 text-center`}
                  >
                    <Icon className="h-4 w-4 text-[var(--rh-ink)]" />
                    <span className="text-[12px] font-bold text-[var(--rh-ink)]">{a.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11.5px] text-[var(--rh-muted)]">
              {size.width}×{size.height} px · {ASPECTS.find((a) => a.id === aspectId)?.desc}
            </p>
          </section>
          )}

          {!isStory && (
          <section className="glx rounded-[26px] p-5 space-y-3.5" aria-labelledby="vs-theme">
            <h3 id="vs-theme" className="flex items-center gap-2 text-[13px] font-bold text-[var(--rh-ink)]">
              <Layers className="h-4 w-4 text-[var(--rh-primary)]" /> Tema film
            </h3>
            <div className="space-y-2.5" role="radiogroup" aria-labelledby="vs-theme">
              {VIDEO_THEMES.map((p) => {
                const active = themeId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={isRendering}
                    onClick={() => {
                      update({ themeId: p.id });
                      setProgress(0);
                      setIsPlaying(true);
                    }}
                    className={`${chip(active)} w-full p-3.5`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-4 w-10 rounded-full border border-black/10"
                          style={{ background: `linear-gradient(135deg, ${p.swatch[0]}, ${p.swatch[1]}, ${p.swatch[2]})` }}
                        />
                        <span className="text-[13px] font-bold text-[var(--rh-ink)]">{p.name}</span>
                      </div>
                      {active && <CheckCircle2 className="h-4 w-4 text-[var(--rh-primary)]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
          )}

          <section className="glx rounded-[26px] p-5 space-y-3" aria-labelledby="vs-guest">
            <h3 id="vs-guest" className="flex items-center gap-2 text-[13px] font-bold text-[var(--rh-ink)]">
              <UserRound className="h-4 w-4 text-[var(--rh-primary)]" /> Nama tamu di video
            </h3>
            <div className="grid grid-cols-2 gap-1 rounded-full bg-[var(--rh-ink)]/[0.05] p-1" role="tablist" aria-label="Jumlah video">
              {(
                [
                  ['single', 'Satu video'],
                  ['batch', `Banyak tamu (ZIP)`],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={guestMode === id}
                  disabled={isRendering}
                  onClick={() => setGuestMode(id)}
                  className={`rounded-full px-3 py-2 text-[12px] font-semibold transition disabled:opacity-55 ${
                    guestMode === id ? 'bg-white text-[var(--rh-ink)] shadow-sm' : 'text-[var(--rh-ink-2)] hover:text-[var(--rh-ink)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {guestMode === 'single' ? (
              <>
                <select
                  aria-label="Nama tamu di video"
                  value={guest?.id || ''}
                  disabled={isRendering}
                  onChange={(e) => update({ guestId: e.target.value || null })}
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-3.5 py-3 text-[13px] text-[var(--rh-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rh-primary)]/40"
                >
                  <option value="">Umum: “Tamu Undangan”</option>
                  {guests.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                      {g.group ? ` (${g.group})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11.5px] text-[var(--rh-muted)]">
                  {guests.length
                    ? 'Pilih tamu untuk membuat versi personal. Nama file ikut mencantumkan nama tamu.'
                    : 'Tambahkan tamu di Daftar Tamu untuk membuat versi personal.'}
                </p>
              </>
            ) : guests.length ? (
              <div className="space-y-2.5">
                <input
                  type="search"
                  value={batchQuery}
                  onChange={(e) => setBatchQuery(e.target.value)}
                  placeholder="Cari nama atau grup tamu"
                  aria-label="Cari tamu"
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-3.5 py-2.5 text-[13px] text-[var(--rh-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rh-primary)]/40"
                />
                <div className="flex items-center justify-between text-[11.5px] text-[var(--rh-muted)]">
                  <span>
                    {batchIds.length} dipilih · maks. {MAX_BATCH} per ZIP
                  </span>
                  <span className="flex gap-3">
                    <button
                      type="button"
                      disabled={isRendering}
                      onClick={() => setBatchIds(filteredGuests.slice(0, MAX_BATCH).map((g) => g.id))}
                      className="font-semibold text-[var(--rh-primary)] hover:underline disabled:opacity-50"
                    >
                      Pilih {Math.min(MAX_BATCH, filteredGuests.length)} teratas
                    </button>
                    <button
                      type="button"
                      disabled={isRendering || !batchIds.length}
                      onClick={() => setBatchIds([])}
                      className="font-semibold text-[var(--rh-ink-2)] hover:underline disabled:opacity-50"
                    >
                      Kosongkan
                    </button>
                  </span>
                </div>
                <ul className="max-h-56 overflow-y-auto rounded-2xl border border-white/80 bg-white/60 divide-y divide-black/5" aria-label="Pilih tamu">
                  {filteredGuests.map((g) => {
                    const checked = batchIds.includes(g.id);
                    const full = !checked && batchIds.length >= MAX_BATCH;
                    return (
                      <li key={g.id}>
                        <label className={`flex items-center gap-3 px-3.5 py-2.5 text-[12.5px] ${full ? 'opacity-50' : 'cursor-pointer hover:bg-white/70'}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={isRendering || full}
                            onChange={() => setBatchIds((ids) => (checked ? ids.filter((x) => x !== g.id) : [...ids, g.id]))}
                            className="h-4 w-4 accent-[var(--rh-primary)]"
                          />
                          <span className="min-w-0 flex-1 truncate text-[var(--rh-ink)]">{g.name}</span>
                          {g.group && <span className="shrink-0 text-[11px] text-[var(--rh-muted)]">{g.group}</span>}
                        </label>
                      </li>
                    );
                  })}
                  {!filteredGuests.length && <li className="px-3.5 py-3 text-[12px] text-[var(--rh-muted)]">Tidak ada tamu yang cocok.</li>}
                </ul>
                <p className="text-[11.5px] text-[var(--rh-muted)]">
                  Satu video per tamu, nama tamu tampil di film. Semua video dikemas jadi satu file ZIP. Gunakan kualitas Cepat 720p untuk batch besar.
                </p>
              </div>
            ) : (
              <p className="text-[11.5px] text-[var(--rh-muted)]">Tambahkan tamu di Daftar Tamu untuk render massal.</p>
            )}
          </section>

          {!isStory && (
          <section className="glx rounded-[26px] p-5 space-y-3" aria-labelledby="vs-copy">
            <h3 id="vs-copy" className="flex items-center gap-2 text-[13px] font-bold text-[var(--rh-ink)]">
              <Type className="h-4 w-4 text-[var(--rh-primary)]" /> Teks di video
            </h3>
            {(THEMES_WITH_COPY as readonly string[]).includes(themeId) ? (
              <>
                {(
                  [
                    ['tagline', 'Kalimat pembuka', themeId === 'pasundan' ? 'Dua insan, satu asih' : 'Dua cerita, satu tujuan'],
                    ['closing', 'Kalimat penutup', themeId === 'pasundan' ? 'Hatur nuhun kana sagala doa sareng rawuhna' : 'Sampai jumpa di hari bahagia kami'],
                  ] as const
                ).map(([key, label, placeholder]) => (
                  <label key={key} className="block space-y-1.5">
                    <span className="flex justify-between text-[12px] font-semibold text-[var(--rh-ink)]">
                      <span>{label}</span>
                      <span className="tabular text-[var(--rh-muted)]">
                        {settings.copy[key].length}/{COPY_LIMITS[key]}
                      </span>
                    </span>
                    <input
                      type="text"
                      value={settings.copy[key]}
                      maxLength={COPY_LIMITS[key]}
                      placeholder={placeholder}
                      disabled={isRendering}
                      onChange={(e) => update({ copy: { ...settings.copy, [key]: e.target.value } })}
                      className="w-full rounded-2xl border border-white/80 bg-white/80 px-3.5 py-2.5 text-[13px] text-[var(--rh-ink)] placeholder:text-[var(--rh-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rh-primary)]/40"
                    />
                  </label>
                ))}
                <p className="text-[11.5px] text-[var(--rh-muted)]">Kosongkan untuk memakai teks bawaan film.</p>
              </>
            ) : (
              <p className="text-[11.5px] text-[var(--rh-muted)]">Teks khusus tersedia untuk film Perjalanan dan Pasundan. Film ini memakai teks bawaannya.</p>
            )}
          </section>
          )}

          <section className="glx rounded-[26px] p-5 space-y-3.5" aria-labelledby="vs-music">
            <h3 id="vs-music" className="flex items-center gap-2 text-[13px] font-bold text-[var(--rh-ink)]">
              <Music2 className="h-4 w-4 text-[var(--rh-primary)]" /> Musik
            </h3>
            <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-labelledby="vs-music">
              {(
                [
                  { id: 'invitation', label: 'Musik undangan', desc: invitationMusic ? wedding?.musicTitle || 'Dari editor undangan' : 'Belum ada musik di editor undangan', disabled: !invitationMusic },
                  {
                    id: 'custom',
                    label: 'Musik khusus video',
                    desc: settings.music.customUrl ? settings.music.customTitle || 'Sudah diunggah' : 'Unggah MP3/M4A/WAV',
                    disabled: false,
                  },
                  { id: 'none', label: 'Tanpa musik', desc: 'Video senyap', disabled: false },
                ] as { id: MusicSource; label: string; desc: string; disabled: boolean }[]
              ).map((o) => {
                const active = musicSource === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={o.disabled || isRendering}
                    onClick={() => update({ music: { ...settings.music, source: o.id } })}
                    className={`${chip(active)} flex items-center justify-between gap-3 px-3.5 py-3`}
                  >
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-bold text-[var(--rh-ink)]">{o.label}</span>
                      <span className="block truncate text-[11.5px] text-[var(--rh-muted)]">{o.desc}</span>
                    </span>
                    {active && <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--rh-primary)]" />}
                  </button>
                );
              })}
            </div>

            {(musicSource === 'custom' || settings.music.source === 'custom') && (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-dashed border-[var(--rh-primary)]/40 bg-white/60 px-4 py-2.5 text-[12.5px] font-semibold text-[var(--rh-ink)] hover:bg-white">
                {uploading !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading !== null ? `Mengunggah ${Math.round(uploading)}%` : settings.music.customUrl ? 'Ganti file musik' : 'Pilih file musik'}
                <input
                  type="file"
                  accept="audio/*"
                  className="sr-only"
                  disabled={uploading !== null || isRendering}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = '';
                    if (f) onUploadMusic(f);
                  }}
                />
              </label>
            )}
            {uploadError && <p className="text-[12px] font-medium text-[#B3261E]">{uploadError}</p>}

            {musicUrl && (
              <div className="space-y-3 rounded-2xl bg-white/55 border border-white/80 p-3.5">
                <label className="block space-y-1.5">
                  <span className="flex justify-between text-[12px] font-semibold text-[var(--rh-ink)]">
                    <span>Mulai dari</span>
                    <span className="tabular text-[var(--rh-muted)]">detik ke-{settings.music.offsetSec}</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, Math.floor((musicDuration ?? 180) - 5))}
                    step={1}
                    value={settings.music.offsetSec}
                    disabled={isRendering}
                    onChange={(e) => update({ music: { ...settings.music, offsetSec: Number(e.target.value) } })}
                    className="w-full accent-[var(--rh-primary)]"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="flex justify-between text-[12px] font-semibold text-[var(--rh-ink)]">
                    <span>Volume</span>
                    <span className="tabular text-[var(--rh-muted)]">{Math.round(settings.music.volume * 100)}%</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={Math.round(settings.music.volume * 100)}
                    disabled={isRendering}
                    onChange={(e) => update({ music: { ...settings.music, volume: Number(e.target.value) / 100 } })}
                    className="w-full accent-[var(--rh-primary)]"
                  />
                </label>
                <p className="text-[11.5px] text-[var(--rh-muted)]">Musik masuk perlahan di awal dan memudar di 2 detik terakhir.</p>
              </div>
            )}
          </section>

          <section className="glx rounded-[26px] p-5 space-y-3" aria-labelledby="vs-quality">
            <h3 id="vs-quality" className="flex items-center gap-2 text-[13px] font-bold text-[var(--rh-ink)]">
              <Gauge className="h-4 w-4 text-[var(--rh-primary)]" /> Kualitas
            </h3>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="vs-quality">
              {QUALITIES.map((q) => {
                const active = quality === q.id;
                return (
                  <button
                    key={q.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={isRendering}
                    onClick={() => update({ quality: q.id })}
                    className={`${chip(active)} px-3.5 py-3`}
                  >
                    <span className="block text-[12.5px] font-bold text-[var(--rh-ink)]">{q.label}</span>
                    <span className="block text-[11px] text-[var(--rh-muted)]">{q.desc}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Ekspor */}
          <section className="glx-strong rounded-[26px] p-5 space-y-4" aria-labelledby="vs-export">
            <div className="flex items-center justify-between gap-2">
              <h3 id="vs-export" className="text-[13.5px] font-bold text-[var(--rh-ink)]">
                Buat video
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${
                  isEnt ? 'bg-[#3F7A52]/15 text-[#3F7A52]' : 'bg-[#8C6B34]/12 text-[#8C6B34]'
                }`}
              >
                {isEnt ? 'Enterprise' : 'Khusus Enterprise'}
              </span>
            </div>

            {isEnt ? (
              <div className="space-y-3">
                <p className="text-[12px] text-[var(--rh-ink-2)]">
                  {guestMode === 'batch' ? `${batchIds.length || 'Belum ada'} video, masing-masing ` : ''}MP4 {size.width}×{size.height}, {VIDEO_FPS} fps,{' '}
                  {Math.round(dur)} detik{musicUrl ? `, musik: ${musicTitle}` : ', tanpa musik'}. Render berjalan di perangkat Anda
                  {guestMode === 'batch' ? '; batch besar bisa memakan waktu lama.' : '; biasanya 1–3 menit untuk HD.'}
                </p>
                {isStory && !storyRenderable && (
                  <p className="text-[11.5px] text-[#8C6B34]">Buat gambar AI untuk minimal {STORY_LIMITS.minMoments} momen dulu (bagian Gambar AI di atas).</p>
                )}
                <button
                  type="button"
                  onClick={() => startRender({ batch: guestMode === 'batch' })}
                  disabled={isRendering || (isStory && !storyRenderable) || (guestMode === 'batch' && !batchIds.length)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--rh-primary)] px-5 py-3 text-[13.5px] font-semibold text-white transition hover:bg-[var(--rh-primary-hover)] active:scale-[0.98] cursor-pointer disabled:opacity-60"
                >
                  {isRendering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
                  {isRendering
                    ? `Merender ${pct}%`
                    : guestMode === 'batch'
                      ? batchIds.length
                        ? `Render ${batchIds.length} video (ZIP)`
                        : 'Pilih tamu dulu'
                      : result
                        ? 'Render ulang'
                        : 'Render video'}
                </button>

                {settings.shared?.url && !isRendering && (
                  <div className="space-y-2 rounded-2xl bg-white/70 border border-white/90 p-3.5">
                    <p className="text-[12px] font-semibold text-[var(--rh-ink)]">Tautan video</p>
                    <input
                      readOnly
                      value={settings.shared.url}
                      onFocus={(e) => e.currentTarget.select()}
                      aria-label="Tautan video"
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-[12px] text-[var(--rh-ink)]"
                    />
                    <p className="text-[11px] text-[var(--rh-muted)]">
                      {VIDEO_THEMES.find((x) => x.id === settings.shared?.themeId)?.name || settings.shared.themeId} · {settings.shared.aspect}
                      {settings.shared.guestName ? ` · untuk ${settings.shared.guestName}` : ''} · {formatBytes(settings.shared.bytes)}. Siapa pun yang punya tautan ini bisa menonton videonya.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={copyVideoLink}
                        className="flex items-center justify-center gap-1.5 rounded-full bg-white border border-black/10 px-3 py-2 text-[12px] font-semibold text-[var(--rh-ink)] hover:bg-white/80"
                      >
                        {linkCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {linkCopied ? 'Tersalin' : 'Salin tautan'}
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Video undangan ${coupleData.groom} & ${coupleData.bride}: ${settings.shared.url}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-full bg-[#1F7A4D] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#186A42]"
                      >
                        <Share2 className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    </div>
                    <button type="button" onClick={() => update({ shared: null })} className="text-[11.5px] font-semibold text-[var(--rh-ink-2)] hover:underline">
                      Sembunyikan tautan (file tetap tersimpan)
                    </button>
                  </div>
                )}
                {videoUploadError && <p className="text-[12px] font-medium text-[#8C1D18]">{videoUploadError}</p>}

                {error && (
                  <div className="rounded-2xl bg-[#B3261E]/8 border border-[#B3261E]/20 p-3.5 space-y-2.5" role="alert">
                    <p className="flex items-start gap-2 text-[12.5px] font-medium text-[#8C1D18]">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error.message}
                    </p>
                    {error.musicFailed && (
                      <button
                        type="button"
                        onClick={() => startRender({ skipMusic: true, batch: !!error.batch })}
                        className="rounded-full bg-white px-3.5 py-2 text-[12px] font-semibold text-[var(--rh-ink)] border border-black/10 hover:bg-white/80"
                      >
                        Render tanpa musik
                      </button>
                    )}
                  </div>
                )}

                {batchResult && !isRendering && (
                  <div className="space-y-3 rounded-2xl bg-white/70 border border-white/90 p-3.5">
                    <p className="text-[12.5px] font-semibold text-[var(--rh-ink)]">
                      {batchResult.count} video siap dalam satu ZIP ({formatBytes(batchResult.size)}, {batchResult.container.toUpperCase()}), selesai dalam{' '}
                      {formatDuration(batchResult.elapsedMs)}.
                    </p>
                    {batchResult.failed.length > 0 && (
                      <p className="text-[11.5px] text-[#8C1D18]">Gagal dirender: {batchResult.failed.join(', ')}. Coba render ulang untuk tamu tersebut.</p>
                    )}
                    {batchResult.warnings.some((w) => w.startsWith('img:')) && (
                      <p className="text-[11.5px] text-[#8C6B34]">Sebagian foto tidak bisa dimuat dan diganti kosong. Periksa tautan foto di editor undangan.</p>
                    )}
                    <button
                      type="button"
                      onClick={() => downloadUrl(batchResult.url, batchResult.name)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--rh-primary)] px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-[var(--rh-primary-hover)]"
                    >
                      <Download className="h-4 w-4" /> Unduh ZIP
                    </button>
                  </div>
                )}

                {result && !isRendering && (
                  <div className="space-y-3 rounded-2xl bg-white/70 border border-white/90 p-3.5">
                    <video
                      src={result.url}
                      controls
                      playsInline
                      className="mx-auto max-h-[360px] w-auto max-w-full rounded-xl bg-black"
                      aria-label="Hasil video undangan"
                    />
                    <p className="text-[11.5px] text-[var(--rh-muted)]">
                      {result.meta.container.toUpperCase()} · {result.meta.width}×{result.meta.height} · {formatBytes(result.file.size)} ·{' '}
                      {result.withMusic ? 'dengan musik' : 'tanpa musik'} · selesai dalam {formatDuration(result.meta.elapsedMs)}
                    </p>
                    {result.meta.warnings.length > 0 && (
                      <p className="text-[11.5px] text-[#8C6B34]">
                        {result.meta.warnings.filter((w) => w.startsWith('img:')).length > 0
                          ? `${result.meta.warnings.filter((w) => w.startsWith('img:')).length} foto tidak bisa dimuat dan diganti kosong. Periksa tautan foto di editor undangan. `
                          : ''}
                        {result.meta.warnings.some((w) => w.startsWith('font')) ? 'Sebagian font gagal dimuat; teks memakai font cadangan.' : ''}
                      </p>
                    )}
                    {result.meta.container === 'webm' && (
                      <p className="text-[11.5px] text-[#8C6B34]">
                        Browser ini tidak bisa membuat MP4, jadi hasilnya WebM. Untuk MP4, render ulang di Chrome atau Edge.
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={download}
                        className="flex items-center justify-center gap-1.5 rounded-full bg-[var(--rh-primary)] px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-[var(--rh-primary-hover)]"
                      >
                        <Download className="h-4 w-4" /> Unduh video
                      </button>
                      {canShareFile && (
                        <button
                          type="button"
                          onClick={share}
                          className="flex items-center justify-center gap-1.5 rounded-full bg-white border border-black/10 px-4 py-2.5 text-[12.5px] font-semibold text-[var(--rh-ink)] hover:bg-white/80"
                        >
                          <Share2 className="h-4 w-4" /> Bagikan
                        </button>
                      )}
                    </div>
                    {sharedResultUrl === result.url ? null : (
                      <button
                        type="button"
                        onClick={saveVideoLink}
                        disabled={videoUpload !== null}
                        className="flex w-full items-center justify-center gap-1.5 rounded-full bg-white border border-black/10 px-4 py-2.5 text-[12.5px] font-semibold text-[var(--rh-ink)] hover:bg-white/80 disabled:opacity-60"
                      >
                        {videoUpload !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                        {videoUpload !== null ? `Mengunggah ${videoUpload}%` : 'Buat tautan video'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="rounded-2xl bg-[var(--rh-ink)]/[0.04] border border-white/70 p-3.5 flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8C6B34]/12 text-[#8C6B34]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div className="text-[12.5px] text-[var(--rh-ink-2)] leading-relaxed">
                    <p className="font-bold text-[var(--rh-ink)]">Unduh video tanpa watermark tersedia untuk akun Enterprise.</p>
                    <p className="mt-0.5">
                      Hubungi <strong>{ENTERPRISE_CONTACT_EMAIL}</strong> untuk aktivasi email perusahaan dan kode akses Enterprise.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={`mailto:${ENTERPRISE_CONTACT_EMAIL}?subject=Aktivasi%20Enterprise%20RuangHadir%20Video%20Studio`}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-[var(--rh-primary)] px-4 py-2.5 text-[12.5px] font-semibold text-white transition hover:bg-[var(--rh-primary-hover)]"
                  >
                    <Mail className="h-3.5 w-3.5" /> Email Admin
                  </a>
                  <button
                    type="button"
                    onClick={onOpenEnterprise}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-white/80 border border-white/90 px-4 py-2.5 text-[12.5px] font-semibold text-[var(--rh-ink)] transition hover:bg-white cursor-pointer"
                  >
                    <Building2 className="h-3.5 w-3.5 text-[#8C6B34]" /> Info Enterprise
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {isRendering && <ExportStage ref={stageRef} themeId={themeId} couple={stageCouple} story={stageStory} cssWidth={size.cssWidth} cssHeight={size.cssHeight} />}
    </div>
  );
}

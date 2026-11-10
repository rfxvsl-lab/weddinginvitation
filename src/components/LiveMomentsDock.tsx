'use client';

/**
 * LiveMomentsDock — "Momen Tamu" (guest camera / live photo wall), voice wishes,
 * and share tools. Floating dock yang tampil di semua template undangan.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  PiCameraDuotone as Camera,
  PiMicrophoneDuotone as Mic,
  PiShareNetworkDuotone as Share2,
  PiXDuotone as X,
  PiImagesDuotone as Images,
  PiDownloadSimpleDuotone as Download,
  PiCalendarPlusDuotone as CalendarPlus,
  PiCopyDuotone as Copy,
  PiCheckDuotone as Check,
  PiSpinnerGapDuotone as Loader,
  PiTrashDuotone as Trash,
  PiWhatsappLogoDuotone as WhatsApp,
} from 'react-icons/pi';
import { uploadToCloudinary } from '../lib/cloudinary';
import {
  addPhotoMoment,
  addVoiceWish,
  deletePhotoMoment,
  deleteVoiceWish,
  getPhotoMoments,
  getVoiceWishes,
} from '../lib/api';
import type { PhotoMoment, VoiceWish } from '../types';

interface LiveMomentsDockProps {
  invitationId: string;
  guestName?: string;
  coupleNames: string;
  eventDate?: string;
  slug: string;
  appUrl: string;
  accentColor?: string;
  onOpenChange?: (open: boolean) => void;
  /** Hanya pemilik undangan yang boleh menghapus momen; server tetap memeriksa. */
  canModerate?: boolean;
}

type Tab = 'moments' | 'voices' | 'share';

const MAX_VOICE_SEC = 60;

function formatDuration(sec: number) {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas tidak didukung');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Gagal memproses foto'))), 'image/jpeg', 0.82)
  );
}

export default function LiveMomentsDock({
  invitationId,
  guestName,
  coupleNames,
  eventDate,
  slug,
  appUrl,
  accentColor = '#b45309',
  onOpenChange,
  canModerate = false,
}: LiveMomentsDockProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('moments');

  const [moments, setMoments] = useState<PhotoMoment[]>([]);
  const [voices, setVoices] = useState<VoiceWish[]>([]);
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState<PhotoMoment | null>(null);

  const [name, setName] = useState(guestName || '');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreview, setAudioPreview] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const displayName = guestName || name || 'Tamu';
  const eventUrl = `${appUrl}/${slug}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rh_guest_name');
      if (!guestName && saved) setName(saved);
    } catch {
      /* ignore */
    }
  }, [guestName]);

  useEffect(() => {
    onOpenChange?.(open);
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [m, v] = await Promise.all([getPhotoMoments(invitationId), getVoiceWishes(invitationId)]);
      setMoments(m);
      setVoices(v);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [invitationId]);

  const openSheet = (t: Tab) => {
    setTab(t);
    setOpen(true);
    setError('');
    void loadAll();
  };

  const persistName = () => {
    try {
      if (name.trim()) localStorage.setItem('rh_guest_name', name.trim());
    } catch {
      /* ignore */
    }
  };

  // ---------------- photo ----------------
  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    if (!name.trim() && !guestName) {
      setError('Isi nama Anda dulu ya, supaya momen bisa kami tandai.');
      return;
    }
    setBusy(true);
    setProgress(0);
    try {
      const blob = await compressImage(file);
      const uploaded = await uploadToCloudinary(blob, {
        folder: 'wedding/moments',
        resourceType: 'image',
        maxSize: 12 * 1024 * 1024,
        onProgress: setProgress,
      });
      const saved = await addPhotoMoment(invitationId, {
        guestName: displayName,
        imageUrl: uploaded.secureUrl,
        caption: caption.trim(),
      });
      setMoments((prev) => [saved, ...prev]);
      setCaption('');
      persistName();
    } catch (err: any) {
      setError(err?.message || 'Upload gagal, coba lagi.');
    } finally {
      setBusy(false);
      setProgress(0);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDeleteMoment = async (m: PhotoMoment) => {
    if (!window.confirm('Hapus momen ini dari dinding?')) return;
    setMoments((prev) => prev.filter((x) => x.id !== m.id));
    try {
      await deletePhotoMoment(m.id);
    } catch {
      void loadAll();
    }
  };

  const downloadImage = async (m: PhotoMoment) => {
    try {
      const res = await fetch(m.imageUrl);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `momen-${slug}-${m.id}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(m.imageUrl, '_blank');
    }
  };

  // ---------------- voice ----------------
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    stopTimer();
    setRecording(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startRecording = async () => {
    setError('');
    if (!name.trim() && !guestName) {
      setError('Isi nama Anda dulu ya, supaya ucapan bisa kami tandai.');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Browser Anda belum mendukung perekam suara. Gunakan Chrome/Safari terbaru.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : '';
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        setAudioPreview(URL.createObjectURL(blob));
      };
      recorder.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_VOICE_SEC) {
            stopRecording();
            return MAX_VOICE_SEC;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setError('Izin mikrofon ditolak. Aktifkan izin mic di browser lalu coba lagi.');
    }
  };

  const handleSendVoice = async () => {
    if (!audioBlob) return;
    setBusy(true);
    setProgress(0);
    try {
      const uploaded = await uploadToCloudinary(audioBlob, {
        folder: 'wedding/voices',
        resourceType: 'video',
        maxSize: 15 * 1024 * 1024,
        onProgress: setProgress,
      });
      const saved = await addVoiceWish(invitationId, {
        guestName: displayName,
        audioUrl: uploaded.secureUrl,
        durationSec: seconds,
      });
      setVoices((prev) => [saved, ...prev]);
      setAudioBlob(null);
      setAudioPreview('');
      setSeconds(0);
      persistName();
    } catch (err: any) {
      setError(err?.message || 'Gagal mengirim ucapan suara.');
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  const handleDeleteVoice = async (v: VoiceWish) => {
    if (!window.confirm('Hapus ucapan suara ini?')) return;
    setVoices((prev) => prev.filter((x) => x.id !== v.id));
    try {
      await deleteVoiceWish(v.id);
    } catch {
      void loadAll();
    }
  };

  // ---------------- share ----------------
  const buildStoryCard = async (): Promise<Blob | null> => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const bg = ctx.createLinearGradient(0, 0, 1080, 1920);
    bg.addColorStop(0, '#0b0b0e');
    bg.addColorStop(0.55, '#16120d');
    bg.addColorStop(1, '#2a1d10');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.strokeStyle = 'rgba(212,175,110,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(64, 64, 952, 1792);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#d4af6e';
    ctx.font = '600 34px Georgia, serif';
    ctx.fillText('THE WEDDING OF', 540, 470);

    ctx.fillStyle = '#f7efe2';
    ctx.font = 'italic 104px Georgia, serif';
    const lines = coupleNames.split('&').map((s) => s.trim());
    ctx.fillText(lines[0] || coupleNames, 540, 700);
    ctx.fillStyle = '#d4af6e';
    ctx.font = 'italic 84px Georgia, serif';
    ctx.fillText('&', 540, 830);
    ctx.fillStyle = '#f7efe2';
    ctx.font = 'italic 104px Georgia, serif';
    ctx.fillText(lines[1] || '', 540, 970);

    if (eventDate) {
      ctx.fillStyle = 'rgba(247,239,226,0.75)';
      ctx.font = '400 40px Georgia, serif';
      ctx.fillText(eventDate, 540, 1100);
    }

    ctx.fillStyle = 'rgba(212,175,110,0.9)';
    ctx.font = '600 30px Helvetica, Arial, sans-serif';
    ctx.fillText('KAMI MENGUNDANG ANDA UNTUK HADIR', 540, 1330);

    ctx.fillStyle = '#f7efe2';
    ctx.font = '700 42px Helvetica, Arial, sans-serif';
    ctx.fillText('Buka undangan digital', 540, 1470);
    ctx.fillStyle = '#d4af6e';
    ctx.font = '500 36px Courier New, monospace';
    ctx.fillText(eventUrl.replace('https://', ''), 540, 1540);

    ctx.fillStyle = 'rgba(247,239,226,0.4)';
    ctx.font = '400 28px Helvetica, Arial, sans-serif';
    ctx.fillText('RUANGHADIR.NET', 540, 1760);

    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
  };

  const handleStory = async () => {
    const blob = await buildStoryCard();
    if (!blob) return;
    const file = new File([blob], `story-${slug}.png`, { type: 'image/png' });
    const nav = navigator as any;
    if (nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: coupleNames });
        return;
      } catch {
        /* fallback download */
      }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `story-${slug}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Gagal menyalin, salin manual: ' + eventUrl);
    }
  };

  const whatsappShare = () => {
    const text = encodeURIComponent(`Kami mengundang Anda ke pernikahan ${coupleNames}. Buka undangan: ${eventUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <>
      {/* floating dock */}
      <div className="fixed bottom-9 left-1/2 -translate-x-1/2 z-[60] print:hidden">
        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/55 px-2 py-1.5 backdrop-blur-xl shadow-2xl">
          <button
            onClick={() => openSheet('moments')}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold text-white/90 hover:bg-white/10 transition"
            aria-label="Kirim momen foto"
          >
            <Camera className="h-4 w-4" style={{ color: accentColor }} />
            Momen
          </button>
          <button
            onClick={() => openSheet('voices')}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold text-white/90 hover:bg-white/10 transition"
            aria-label="Kirim ucapan suara"
          >
            <Mic className="h-4 w-4" style={{ color: accentColor }} />
            Suara
          </button>
          <button
            onClick={() => openSheet('share')}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold text-white/90 hover:bg-white/10 transition"
            aria-label="Bagikan undangan"
          >
            <Share2 className="h-4 w-4" style={{ color: accentColor }} />
            Bagikan
          </button>
        </div>
      </div>

      {/* sheet */}
      {open && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-lg max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0d0d10] text-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0d0d10]/95 px-5 py-4 backdrop-blur">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.25em]" style={{ color: accentColor }}>
                  Live Moments
                </p>
                <h3 className="text-lg font-serif">{coupleNames}</h3>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-white/10" aria-label="Tutup">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-1 px-4 pt-4">
              {([
                ['moments', 'Dinding Momen', Images],
                ['voices', 'Ucapan Suara', Mic],
                ['share', 'Bagikan', Share2],
              ] as const).map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[10.5px] font-bold transition ${
                    tab === key ? 'text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                  style={tab === key ? { backgroundColor: accentColor } : undefined}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">
              {error && (
                <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-300">
                  {error}
                </p>
              )}

              {!guestName && tab !== 'share' && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs outline-none focus:border-white/40"
                />
              )}

              {/* MOMENTS */}
              {tab === 'moments' && (
                <>
                  <div className="rounded-2xl border border-dashed border-white/20 p-5 text-center">
                    <Camera className="mx-auto h-8 w-8" style={{ color: accentColor }} />
                    <p className="mt-2 text-xs font-bold">Abadikan momen Anda di hari kami</p>
                    <p className="mt-1 text-[10.5px] text-white/50">
                      Foto langsung masuk ke dinding momen dan bisa diunduh mempelai.
                    </p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={busy}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-bold text-black disabled:opacity-60"
                      style={{ backgroundColor: accentColor }}
                    >
                      {busy ? <Loader className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      {busy ? `Mengunggah ${progress}%` : 'Ambil / Pilih Foto'}
                    </button>
                    <input
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      maxLength={90}
                      placeholder="Tulis keterangan (opsional)"
                      className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] outline-none"
                    />
                  </div>

                  {loading ? (
                    <p className="py-6 text-center text-[11px] text-white/40">
                      <Loader className="mx-auto h-5 w-5 animate-spin" />
                    </p>
                  ) : moments.length === 0 ? (
                    <p className="py-4 text-center text-[11px] text-white/40">Belum ada momen. Jadi yang pertama!</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {moments.map((m) => (
                        <div key={m.id} className="group relative overflow-hidden rounded-xl border border-white/10">
                          <button onClick={() => setLightbox(m)} className="block aspect-square w-full">
                            <img src={m.imageUrl} alt={m.caption || m.guestName} className="h-full w-full object-cover" loading="lazy" />
                          </button>
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1 pt-4">
                            <p className="truncate text-[8.5px] font-bold text-white/90">{m.guestName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* VOICES */}
              {tab === 'voices' && (
                <>
                  <div className="rounded-2xl border border-dashed border-white/20 p-5 text-center">
                    <Mic className="mx-auto h-8 w-8" style={{ color: accentColor }} />
                    <p className="mt-2 text-xs font-bold">Rekam ucapan & doa untuk mempelai</p>
                    <p className="mt-1 text-[10.5px] text-white/50">Maksimal {MAX_VOICE_SEC} detik. Suara Anda akan diputar di buku tamu.</p>

                    {recording ? (
                      <button
                        onClick={stopRecording}
                        className="mt-3 inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-[11px] font-bold"
                      >
                        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                        Stop · {formatDuration(seconds)}
                      </button>
                    ) : audioBlob ? (
                      <div className="mt-3 space-y-2">
                        <audio preload="none" src={audioPreview} controls className="mx-auto h-9 w-full max-w-[260px]" />
                        <div className="flex justify-center gap-2">
                          <button onClick={handleSendVoice} disabled={busy} className="rounded-full px-4 py-2 text-[11px] font-bold text-black" style={{ backgroundColor: accentColor }}>
                            {busy ? `Mengirim ${progress}%` : 'Kirim Ucapan'}
                          </button>
                          <button onClick={() => { setAudioBlob(null); setAudioPreview(''); setSeconds(0); }} className="rounded-full border border-white/20 px-4 py-2 text-[11px] font-bold">
                            Ulangi
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={startRecording}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-bold text-black"
                        style={{ backgroundColor: accentColor }}
                      >
                        <Mic className="h-4 w-4" /> Mulai Rekam
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <p className="py-6 text-center"><Loader className="mx-auto h-5 w-5 animate-spin text-white/40" /></p>
                  ) : voices.length === 0 ? (
                    <p className="py-4 text-center text-[11px] text-white/40">Belum ada ucapan suara.</p>
                  ) : (
                    <div className="space-y-2">
                      {voices.map((v) => (
                        <div key={v.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[11px] font-bold">{v.guestName}</p>
                            <span className="shrink-0 text-[9px] text-white/40">{formatDuration(v.durationSec)}</span>
                          </div>
                          <audio src={v.audioUrl} controls preload="none" className="mt-1.5 h-8 w-full" />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* SHARE */}
              {tab === 'share' && (
                <div className="space-y-2.5">
                  <button onClick={handleStory} className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-left hover:bg-white/10">
                    <Images className="h-5 w-5" style={{ color: accentColor }} />
                    <span>
                      <span className="block text-[11.5px] font-bold">Buat Story Instagram</span>
                      <span className="block text-[10px] text-white/50">Kartu 1080×1920 siap dibagikan</span>
                    </span>
                  </button>
                  <a href={`/api/calendar/${slug}`} className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-left hover:bg-white/10">
                    <CalendarPlus className="h-5 w-5" style={{ color: accentColor }} />
                    <span>
                      <span className="block text-[11.5px] font-bold">Simpan ke Kalender</span>
                      <span className="block text-[10px] text-white/50">Google Calendar & Apple Calendar (.ics)</span>
                    </span>
                  </a>
                  <button onClick={whatsappShare} className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-left hover:bg-white/10">
                    <WhatsApp className="h-5 w-5" style={{ color: '#25d366' }} />
                    <span>
                      <span className="block text-[11.5px] font-bold">Bagikan via WhatsApp</span>
                      <span className="block text-[10px] text-white/50">Kirim tautan undangan</span>
                    </span>
                  </button>
                  <button onClick={handleCopy} className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-left hover:bg-white/10">
                    {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" style={{ color: accentColor }} />}
                    <span>
                      <span className="block text-[11.5px] font-bold">{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
                      <span className="block truncate text-[10px] text-white/50">{eventUrl.replace('https://', '')}</span>
                    </span>
                  </button>
                  <p className="pt-1 text-center text-[9.5px] text-white/30">Powered by ruanghadir.net</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[130] flex flex-col items-center justify-center bg-black/95 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox.imageUrl} alt={lightbox.caption || lightbox.guestName} className="max-h-[75vh] max-w-full rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
          <p className="mt-3 text-center text-xs font-bold">{lightbox.guestName}</p>
          {lightbox.caption && <p className="text-center text-[11px] text-white/60">{lightbox.caption}</p>}
          <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => downloadImage(lightbox)} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[11px] font-bold text-black">
              <Download className="h-3.5 w-3.5" /> Unduh
            </button>
            {canModerate && (
              <button onClick={() => handleDeleteMoment(lightbox)} className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-[11px] font-bold">
                <Trash className="h-3.5 w-3.5" /> Hapus
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

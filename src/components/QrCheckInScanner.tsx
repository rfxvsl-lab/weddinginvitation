'use client';

/**
 * QrCheckInScanner — terminal check-in meja resepsionis.
 * Pakai kamera belakang + BarcodeDetector (native) atau jsQR (fallback).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  PiQrCodeDuotone as QrCode,
  PiXDuotone as X,
  PiCameraDuotone as Camera,
  PiCheckCircleDuotone as CheckCircle,
  PiArrowCounterClockwiseDuotone as Rotate,
  PiSpinnerGapDuotone as Loader,
} from 'react-icons/pi';
import type { Guest } from '../types';

interface QrCheckInScannerProps {
  guests: Guest[];
  onCheckIn: (guest: Guest, pax: number, tableNo: string) => Promise<void>;
  onClose: () => void;
}

export default function QrCheckInScanner({ guests, onCheckIn, onClose }: QrCheckInScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectorRef = useRef<any>(null);
  const busyRef = useRef(false);

  const [mode, setMode] = useState<'scan' | 'confirm' | 'done'>('scan');
  const [cameraError, setCameraError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const [found, setFound] = useState<Guest | null>(null);
  const [pax, setPax] = useState(1);
  const [tableNo, setTableNo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [already, setAlready] = useState(false);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const resolveGuest = useCallback(
    (raw: string) => {
      const code = raw.trim().toUpperCase();
      if (!code) return;
      const match = guests.find((g) => g.invitationCode.toUpperCase() === code);
      if (!match) {
        setError(`Kode "${code}" tidak terdaftar di undangan ini.`);
        return;
      }
      setError('');
      setFound(match);
      setAlready(Boolean(match.checkedInAt));
      setPax(Math.min(match.paxLimit || 1, 1));
      setTableNo(match.tableNo || '');
      setMode('confirm');
      cleanup();
    },
    [guests, cleanup]
  );

  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const BD = (window as any).BarcodeDetector;
        if (BD) {
          try {
            detectorRef.current = new BD({ formats: ['qr_code'] });
          } catch {
            detectorRef.current = null;
          }
        }

        const tick = async () => {
          if (busyRef.current || !videoRef.current) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          const video = videoRef.current;

          if (detectorRef.current && video.readyState === 4) {
            busyRef.current = true;
            try {
              const codes = await detectorRef.current.detect(video);
              if (codes?.length) {
                resolveGuest(codes[0].rawValue);
                return;
              }
            } catch {
              /* lanjut ke fallback */
            } finally {
              busyRef.current = false;
            }
          } else if (video.readyState === 4 && canvasRef.current) {
            busyRef.current = true;
            try {
              const canvas = canvasRef.current;
              const w = 480;
              const h = Math.round((video.videoHeight / video.videoWidth) * w) || 480;
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d', { willReadFrequently: true });
              if (ctx) {
                ctx.drawImage(video, 0, 0, w, h);
                const img = ctx.getImageData(0, 0, w, h);
                const jsQR = (await import('jsqr')).default;
                const result = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' });
                if (result?.data) {
                  resolveGuest(result.data);
                  return;
                }
              }
            } finally {
              busyRef.current = false;
            }
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        setCameraError('Kamera tidak bisa dibuka. Beri izin kamera, atau ketik kode manual di bawah.');
      }
    };

    if (mode === 'scan') void start();
    return cleanup;
  }, [mode, resolveGuest, cleanup]);

  const submit = async () => {
    if (!found) return;
    setSubmitting(true);
    setError('');
    try {
      await onCheckIn(found, pax, tableNo.trim());
      setMode('done');
    } catch (err: any) {
      setError(err?.message || 'Check-in gagal. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const scanAgain = () => {
    setFound(null);
    setMode('scan');
    setManualCode('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-zinc-700/60 bg-[#0b0b0e] text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-rose-500" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-rose-400">Check-in Terminal</p>
              <p className="text-xs font-bold">Scan QR tamu</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Tutup">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {mode === 'scan' && (
            <>
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-black">
                <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-rose-500/70" />
                <span className="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 animate-pulse bg-rose-500/70" />
              </div>

              {cameraError && <p className="text-[10.5px] text-amber-400">{cameraError}</p>}
              {error && <p className="text-[10.5px] text-rose-400">{error}</p>}

              <div className="flex gap-2">
                <input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="Atau ketik kode (W-XXXX)"
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 font-mono text-xs outline-none focus:border-white/40"
                  onKeyDown={(e) => e.key === 'Enter' && resolveGuest(manualCode)}
                />
                <button
                  onClick={() => resolveGuest(manualCode)}
                  className="rounded-xl bg-white px-4 text-[11px] font-bold text-black"
                >
                  Cari
                </button>
              </div>
              <p className="flex items-center gap-1 text-center text-[9.5px] text-white/35">
                <Camera className="h-3 w-3" /> Arahkan kamera ke QR pada tiket tamu
              </p>
            </>
          )}

          {mode === 'confirm' && found && (
            <>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[9px] uppercase tracking-widest text-white/40">Tamu ditemukan</p>
                <h3 className="mt-0.5 truncate text-base font-extrabold">{found.name}</h3>
                <p className="text-[10.5px] text-white/50">
                  Grup {found.group || '-'} · Limit {found.paxLimit} pax · <span className="font-mono">{found.invitationCode}</span>
                </p>
                {already && (
                  <p className="mt-2 rounded-lg bg-amber-500/15 px-2.5 py-1.5 text-[10px] font-bold text-amber-300">
                    ⚠ Tamu ini SUDAH check-in{found.checkedInAt ? ` (${new Date(found.checkedInAt).toLocaleTimeString('id-ID')})` : ''}. Check-in ulang hanya memperbarui data.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-white/40">Jumlah hadir</label>
                  <input
                    type="number"
                    min={1}
                    max={found.paxLimit || 1}
                    value={pax}
                    onChange={(e) => setPax(Math.min(found.paxLimit || 1, Math.max(1, Number(e.target.value))))}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-white/40">No. meja</label>
                  <input
                    value={tableNo}
                    onChange={(e) => setTableNo(e.target.value)}
                    placeholder="Meja 12"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs outline-none"
                  />
                </div>
              </div>

              {error && <p className="text-[10.5px] text-rose-400">{error}</p>}

              <div className="flex gap-2">
                <button onClick={scanAgain} className="rounded-xl border border-white/15 px-3 py-2.5 text-[11px] font-bold text-white/70">
                  <Rotate className="h-4 w-4" />
                </button>
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-[11px] font-bold disabled:opacity-60"
                >
                  {submitting ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Konfirmasi Check-in
                </button>
              </div>
            </>
          )}

          {mode === 'done' && found && (
            <div className="py-6 text-center">
              <CheckCircle className="mx-auto h-14 w-14 text-emerald-400" />
              <h3 className="mt-3 text-lg font-extrabold">Check-in berhasil</h3>
              <p className="mt-1 text-xs text-white/60">
                {found.name} · {pax} pax{tableNo ? ` · ${tableNo}` : ''}
              </p>
              <div className="mt-5 flex justify-center gap-2">
                <button onClick={scanAgain} className="rounded-xl bg-white px-4 py-2.5 text-[11px] font-bold text-black">
                  Scan tamu berikutnya
                </button>
                <button onClick={onClose} className="rounded-xl border border-white/20 px-4 py-2.5 text-[11px] font-bold">
                  Selesai
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

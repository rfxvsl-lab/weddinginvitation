'use client';

import { fetchVideoAsset } from './assetFetch';

/**
 * Menyiapkan musik latar video: unduh → decode → potong/ulang sepanjang durasi →
 * fade in/out → AudioBuffer stereo 48 kHz siap di-encode.
 */

export const SOUNDTRACK_SAMPLE_RATE = 48000;

export interface SoundtrackOptions {
  durationSec: number;
  /** Mulai dari detik ke-n lagu (melewati intro). */
  offsetSec?: number;
  /** 0..1 */
  volume?: number;
  fadeInSec?: number;
  fadeOutSec?: number;
  signal?: AbortSignal;
}

export class SoundtrackError extends Error {
  constructor(public code: 'fetch' | 'decode', message: string) {
    super(message);
    this.name = 'SoundtrackError';
  }
}

/** Link Google Drive → tautan unduh langsung. */
export function normalizeAudioUrl(url: string): string {
  const m = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  return m ? `https://drive.google.com/uc?export=download&id=${m[1]}` : url;
}

export async function buildSoundtrack(url: string, opts: SoundtrackOptions): Promise<AudioBuffer> {
  const { durationSec, offsetSec = 0, volume = 0.85, fadeInSec = 0.8, fadeOutSec = 2, signal } = opts;
  let data: ArrayBuffer;
  try {
    data = await (await fetchVideoAsset(normalizeAudioUrl(url), signal)).arrayBuffer();
  } catch (e) {
    throw new SoundtrackError('fetch', `Musik tidak bisa diambil (${(e as Error)?.message || 'jaringan'}). Pilih Musik khusus video lalu unggah file MP3, atau render tanpa musik.`);
  }

  let decoded: AudioBuffer;
  try {
    const probe = new OfflineAudioContext(2, SOUNDTRACK_SAMPLE_RATE, SOUNDTRACK_SAMPLE_RATE);
    decoded = await probe.decodeAudioData(data);
  } catch {
    throw new SoundtrackError('decode', 'Format musik tidak dikenali browser. Gunakan MP3, M4A, atau WAV.');
  }

  const frames = Math.ceil(durationSec * SOUNDTRACK_SAMPLE_RATE);
  const ctx = new OfflineAudioContext(2, frames, SOUNDTRACK_SAMPLE_RATE);
  const src = ctx.createBufferSource();
  src.buffer = decoded;
  const start = Math.min(Math.max(0, offsetSec), Math.max(0, decoded.duration - 1));
  src.loop = decoded.duration - start < durationSec;
  if (src.loop) {
    src.loopStart = start;
    src.loopEnd = decoded.duration;
  }
  const gain = ctx.createGain();
  const v = Math.max(0, Math.min(1, volume));
  const fin = Math.min(fadeInSec, durationSec / 3);
  const fout = Math.min(fadeOutSec, durationSec / 3);
  gain.gain.setValueAtTime(fin > 0 ? 0.0001 : v, 0);
  if (fin > 0) gain.gain.linearRampToValueAtTime(v, fin);
  gain.gain.setValueAtTime(v, Math.max(fin, durationSec - fout));
  gain.gain.linearRampToValueAtTime(0, durationSec);
  src.connect(gain).connect(ctx.destination);
  src.start(0, start);
  return ctx.startRendering();
}

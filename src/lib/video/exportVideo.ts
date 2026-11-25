'use client';

/**
 * Ekspor video undangan frame demi frame (deterministik, bukan rekaman waktu nyata).
 *
 * Alur: komposisi DOM yang sama dengan preview di-seek ke waktu tiap frame → dirasterisasi
 * (SVG foreignObject, lihat frameRasterizer) → di-encode WebCodecs (mediabunny) → MP4 H.264 + AAC.
 * Bila browser tidak punya encoder H.264, jatuh ke WebM VP9/VP8 + Opus.
 * Semua modul berat dimuat dinamis supaya tidak membebani bundle dashboard.
 */

export type VideoContainer = 'mp4' | 'webm';

export interface ExportProgress {
  phase: 'prepare' | 'render' | 'finalize';
  frame: number;
  total: number;
}

export interface ExportFilmOptions {
  /** Elemen komposisi yang dirasterisasi; ukurannya (CSS px) harus sama rasio dengan keluaran. */
  node: HTMLElement;
  width: number;
  height: number;
  fps: number;
  durationSec: number;
  /** Pindahkan komposisi ke waktu `timeSec` dan selesaikan render DOM sebelum resolve. */
  seek: (timeSec: number) => Promise<void> | void;
  audio?: AudioBuffer | null;
  /** Paksa wadah tertentu (mis. 'webm'); default memilih MP4 bila bisa. */
  prefer?: VideoContainer;
  /** Stylesheet font yang dipakai komposisi, untuk disematkan ke tiap frame. */
  fontCssUrls?: string[];
  /** Keluarga font yang wajib disematkan (semua weight), lihat frameRasterizer. */
  fontFamilies?: string[];
  signal?: AbortSignal;
  onProgress?: (p: ExportProgress) => void;
}

export interface ExportFilmResult {
  blob: Blob;
  container: VideoContainer;
  mimeType: string;
  videoCodec: string;
  audioCodec: string | null;
  width: number;
  height: number;
  frames: number;
  durationSec: number;
  elapsedMs: number;
  /** Aset yang gagal disematkan (font/gambar). */
  warnings: string[];
}

export class VideoExportError extends Error {
  constructor(public code: 'unsupported' | 'aborted' | 'capture' | 'encode', message: string) {
    super(message);
    this.name = 'VideoExportError';
  }
}

export function supportsVideoExport(): boolean {
  return typeof window !== 'undefined' && typeof (window as unknown as { VideoEncoder?: unknown }).VideoEncoder === 'function';
}

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

/** Pilih wadah + codec yang benar-benar bisa di-encode di browser ini. */
async function pickCodecs(width: number, height: number, fps: number, withAudio: boolean, prefer?: VideoContainer) {
  const mb = await import('mediabunny');
  const order: { container: VideoContainer; codec: 'avc' | 'vp9' | 'vp8' }[] =
    prefer === 'webm'
      ? [{ container: 'webm', codec: 'vp9' }, { container: 'webm', codec: 'vp8' }, { container: 'mp4', codec: 'avc' }]
      : [{ container: 'mp4', codec: 'avc' }, { container: 'webm', codec: 'vp9' }, { container: 'webm', codec: 'vp8' }];
  let pick: (typeof order)[number] | null = null;
  for (const o of order) {
    if (await mb.canEncodeVideo(o.codec, { width, height, frameRate: fps, quality: mb.QUALITY_HIGH })) {
      pick = o;
      break;
    }
  }
  if (!pick) throw new VideoExportError('unsupported', 'Browser ini belum bisa meng-encode video (WebCodecs). Gunakan Chrome, Edge, atau Safari versi terbaru.');

  let audioCodec: 'aac' | 'opus' | null = null;
  if (withAudio) {
    if (pick.container === 'mp4') {
      if (!(await mb.canEncodeAudio('aac', { numberOfChannels: 2, sampleRate: 48000 }))) {
        const { registerAacEncoder } = await import('@mediabunny/aac-encoder');
        registerAacEncoder();
      }
      audioCodec = 'aac';
    } else if (await mb.canEncodeAudio('opus', { numberOfChannels: 2, sampleRate: 48000 })) {
      audioCodec = 'opus';
    }
  }
  return { mb, ...pick, audioCodec };
}

export async function exportFilmVideo(opts: ExportFilmOptions): Promise<ExportFilmResult> {
  const started = performance.now();
  const { node, fps, durationSec, signal, onProgress } = opts;
  const width = even(opts.width);
  const height = even(opts.height);
  const total = Math.round(durationSec * fps);
  const checkAbort = () => {
    if (signal?.aborted) throw new VideoExportError('aborted', 'Render dibatalkan.');
  };

  if (!supportsVideoExport()) {
    throw new VideoExportError('unsupported', 'Browser ini belum mendukung WebCodecs untuk membuat video. Gunakan Chrome, Edge, atau Safari versi terbaru.');
  }
  onProgress?.({ phase: 'prepare', frame: 0, total });

  const { mb, container, codec, audioCodec } = await pickCodecs(width, height, fps, !!opts.audio, opts.prefer);
  const { createFrameRasterizer } = await import('./frameRasterizer');
  await opts.seek(0);
  const raster = await createFrameRasterizer(node, { fontCssUrls: opts.fontCssUrls, fontFamilies: opts.fontFamilies, maxImageSide: Math.max(width, height), signal });
  if (!raster.cssWidth || !raster.cssHeight) throw new VideoExportError('capture', 'Komposisi belum siap dirender (ukuran 0).');

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx2d = canvas.getContext('2d', { alpha: false });
  if (!ctx2d) throw new VideoExportError('capture', 'Canvas 2D tidak tersedia.');

  const output = new mb.Output({
    format: container === 'mp4' ? new mb.Mp4OutputFormat({ fastStart: 'in-memory' }) : new mb.WebMOutputFormat(),
    target: new mb.BufferTarget(),
  });
  const videoSource = new mb.CanvasSource(canvas, { codec, quality: mb.QUALITY_HIGH, keyFrameInterval: 2 });
  output.addVideoTrack(videoSource, { frameRate: fps });
  let audioSource: InstanceType<typeof mb.AudioBufferSource> | null = null;
  if (opts.audio && audioCodec) {
    audioSource = new mb.AudioBufferSource({ codec: audioCodec, quality: mb.QUALITY_HIGH });
    output.addAudioTrack(audioSource);
  }

  let ok = false;
  try {
    await output.start();
    if (audioSource && opts.audio) await audioSource.add(opts.audio);

    // Pipelining: CanvasSource menyalin canvas secara sinkron saat add(), jadi frame berikutnya boleh
    // dirasterisasi sementara encoder masih bekerja; backpressure ditunggu sebelum add() berikutnya.
    let pendingAdd: Promise<void> | null = null;
    for (let i = 0; i < total; i++) {
      checkAbort();
      await opts.seek(i / fps);
      ctx2d.fillStyle = '#000';
      ctx2d.fillRect(0, 0, width, height);
      try {
        await raster.draw(ctx2d, width, height);
      } catch (e) {
        throw new VideoExportError('capture', `Gagal merasterisasi frame ${i + 1}: ${(e as Error)?.message || e}`);
      }
      if (pendingAdd) await pendingAdd;
      pendingAdd = videoSource.add(i / fps, 1 / fps);
      onProgress?.({ phase: 'render', frame: i + 1, total });
    }

    if (pendingAdd) await pendingAdd;
    checkAbort();
    onProgress?.({ phase: 'finalize', frame: total, total });
    videoSource.close();
    audioSource?.close();
    await output.finalize();
    ok = true;
  } catch (e) {
    if (e instanceof VideoExportError) throw e;
    throw new VideoExportError('encode', `Encoder gagal: ${(e as Error)?.message || e}`);
  } finally {
    if (!ok) await output.cancel().catch(() => undefined);
  }

  const buffer = (output.target as InstanceType<typeof mb.BufferTarget>).buffer;
  if (!buffer) throw new VideoExportError('encode', 'Encoder tidak menghasilkan data.');
  const mimeType = container === 'mp4' ? 'video/mp4' : 'video/webm';
  return {
    blob: new Blob([buffer], { type: mimeType }),
    container,
    mimeType,
    videoCodec: codec,
    audioCodec: audioSource ? audioCodec : null,
    width,
    height,
    frames: total,
    durationSec,
    elapsedMs: performance.now() - started,
    warnings: raster.warnings,
  };
}

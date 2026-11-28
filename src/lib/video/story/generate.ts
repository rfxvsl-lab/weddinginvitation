'use client';

import type { StoryAsset, StoryMoment, StoryProject } from '@/types';
import { aiImageToBlob, chromaKeyGreen, toReference } from './imaging';
import { momentSig } from './model';

type Ref = { mime: string; data: string };
type Kind = 'sheet' | 'bg' | 'chars' | 'finale-bg' | 'finale-chars';

export interface GenContext {
  style: NonNullable<StoryProject['style']>;
  groomLook?: string;
  brideLook?: string;
  venue: string;
  signal?: AbortSignal;
  /** Unggah gambar hasil → URL permanen. */
  upload: (blob: Blob, name: string) => Promise<string>;
  /** Dipanggil bila server mengembalikan gambar uji (tanpa kunci AI). */
  onMock?: () => void;
}

export class StoryGenError extends Error {
  constructor(message: string, public step: string) {
    super(message);
    this.name = 'StoryGenError';
  }
}

async function requestImage(kind: Kind, ctx: GenContext, extra: Record<string, unknown>, refs: Ref[]) {
  const res = await fetch('/api/video/story/image', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'same-origin',
    signal: ctx.signal,
    body: JSON.stringify({ kind, style: ctx.style, groom: { look: ctx.groomLook }, bride: { look: ctx.brideLook }, venue: ctx.venue, refs, ...extra }),
  });
  const json = (await res.json().catch(() => ({}))) as { mime?: string; data?: string; error?: string; mock?: boolean };
  if (!res.ok || !json.data || !json.mime) throw new Error(json.error || `Gagal membuat gambar (HTTP ${res.status}).`);
  if (json.mock) ctx.onMock?.();
  return { mime: json.mime, data: json.data, mock: !!json.mock };
}

/** Lembar karakter dari foto wajah kedua mempelai. */
export async function generateCharacterSheet(ctx: GenContext, groomPhotos: string[], bridePhotos: string[]): Promise<string> {
  if (!groomPhotos.length || !bridePhotos.length) throw new StoryGenError('Unggah minimal satu foto wajah untuk tiap mempelai.', 'sheet');
  const refs = await Promise.all([...groomPhotos, ...bridePhotos].map((u) => toReference(u, 768, ctx.signal)));
  const img = await requestImage('sheet', ctx, {}, refs);
  const blob = await aiImageToBlob(img.mime, img.data);
  return ctx.upload(blob, 'lembar-karakter.png');
}

async function sheetRef(sheetUrl: string, ctx: GenContext) {
  return [await toReference(sheetUrl, 1024, ctx.signal)];
}

/** Latar + karakter (PNG transparan) untuk satu momen. */
export async function generateMomentAssets(ctx: GenContext, sheetUrl: string, m: StoryMoment): Promise<StoryAsset> {
  const extra = { place: m.place, action: m.action, who: m.who };
  const [bgImg, charsImg] = await Promise.all([
    requestImage('bg', ctx, extra, []),
    sheetRef(sheetUrl, ctx).then((refs) => requestImage('chars', ctx, extra, refs)),
  ]);
  const bgBlob = await aiImageToBlob(bgImg.mime, bgImg.data);
  const keyed = await chromaKeyGreen(`data:${charsImg.mime};base64,${charsImg.data}`);
  const [bg, chars] = await Promise.all([ctx.upload(bgBlob, `latar-${m.id}.jpg`), ctx.upload(keyed, `karakter-${m.id}.png`)]);
  return { bg, chars, sig: momentSig(m, ctx.style) };
}

/** Adegan pernikahan (penutup). */
export async function generateFinaleAssets(ctx: GenContext, sheetUrl: string): Promise<StoryAsset> {
  const [bgImg, charsImg] = await Promise.all([
    requestImage('finale-bg', ctx, {}, []),
    sheetRef(sheetUrl, ctx).then((refs) => requestImage('finale-chars', ctx, {}, refs)),
  ]);
  const bgBlob = await aiImageToBlob(bgImg.mime, bgImg.data);
  const keyed = await chromaKeyGreen(`data:${charsImg.mime};base64,${charsImg.data}`);
  const [bg, chars] = await Promise.all([ctx.upload(bgBlob, 'latar-pernikahan.jpg'), ctx.upload(keyed, 'karakter-pernikahan.png')]);
  return { bg, chars, sig: `${ctx.style}|${ctx.venue}` };
}

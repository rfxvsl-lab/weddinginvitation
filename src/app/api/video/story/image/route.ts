import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/server/auth';
import { getUserById } from '@/lib/db';
import { isEnterpriseTier } from '@/lib/packageLimits';
import { jsonError, limitOr429 } from '@/lib/server/http';
import {
  backgroundPrompt,
  characterSheetPrompt,
  charactersPrompt,
  finaleBackgroundPrompt,
  finaleCharactersPrompt,
  type StoryStyle,
} from '@/lib/video/story/prompts';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Gambar AI untuk Video Cerita (Enterprise). Satu permintaan = satu gambar, supaya setiap
 * panggilan pendek dan bisa diulang per adegan. Prompt disusun di server dari isian terstruktur.
 *
 * Penyedia: Gemini image ("Nano Banana") bila GEMINI_API_KEY ada. Tanpa kunci, di luar
 * produksi (atau VIDEO_AI_MOCK=1) dikembalikan gambar uji SVG agar alur bisa dites.
 */

type Kind = 'sheet' | 'bg' | 'chars' | 'finale-bg' | 'finale-chars';
const KINDS: Kind[] = ['sheet', 'bg', 'chars', 'finale-bg', 'finale-chars'];
const STYLES: StoryStyle[] = ['warm-digital', 'watercolor', 'soft-anime'];
const MAX_REFS = 7;
const MAX_REF_BYTES = 1_600_000; // base64 per gambar referensi
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, n) : '');

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return jsonError('Silakan masuk terlebih dahulu.', 401);
  const limited = limitOr429(req, 'video-story-image', 90, 3600, session.uid);
  if (limited) return limited;
  if (session.role !== 'admin') {
    const user = await getUserById(session.uid);
    if (!isEnterpriseTier(user?.packageId)) return jsonError('Video Cerita khusus akun Enterprise.', 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError('Permintaan tidak valid.', 400);
  }
  const kind = body.kind as Kind;
  if (!KINDS.includes(kind)) return jsonError('Jenis gambar tidak dikenal.', 400);
  const style = (STYLES.includes(body.style as StoryStyle) ? body.style : 'warm-digital') as StoryStyle;
  const place = clip(body.place, 80);
  const action = clip(body.action, 160);
  const venue = clip(body.venue, 120);
  const who = body.who === 'groom' || body.who === 'bride' ? body.who : 'both';
  const groom = { label: 'the groom', look: clip((body.groom as { look?: string })?.look, 80) };
  const bride = { label: 'the bride', look: clip((body.bride as { look?: string })?.look, 80) };

  const refs = (Array.isArray(body.refs) ? body.refs : [])
    .slice(0, MAX_REFS)
    .filter((r): r is { mime: string; data: string } => !!r && typeof r.data === 'string' && /^image\/(png|jpeg|webp)$/.test(String(r.mime)))
    .filter((r) => r.data.length <= MAX_REF_BYTES && /^[A-Za-z0-9+/=]+$/.test(r.data));

  if (refs.reduce((n, r) => n + r.data.length, 0) > 4_000_000) {
    return jsonError('Foto referensi terlalu besar. Kecilkan foto lalu coba lagi.', 413);
  }
  if ((kind === 'sheet' || kind === 'chars' || kind === 'finale-chars') && !refs.length) {
    return jsonError('Foto referensi wajah belum ada.', 400);
  }
  if ((kind === 'bg' || kind === 'chars') && (place.length < 3 || action.length < 5)) {
    return jsonError('Tempat dan kejadian momen perlu diisi.', 400);
  }

  const prompt =
    kind === 'sheet'
      ? characterSheetPrompt(style, groom, bride)
      : kind === 'bg'
        ? backgroundPrompt(style, place, action)
        : kind === 'chars'
          ? charactersPrompt(style, who, place, action, groom, bride)
          : kind === 'finale-bg'
            ? finaleBackgroundPrompt(style, venue)
            : finaleCharactersPrompt(style, groom, bride);
  const aspectRatio = kind === 'sheet' ? '4:3' : kind === 'bg' || kind === 'finale-bg' ? '9:16' : '3:4';

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production' && process.env.VIDEO_AI_MOCK !== '1') {
      return jsonError('Layanan gambar AI belum dikonfigurasi (GEMINI_API_KEY).', 503);
    }
    return NextResponse.json({ mime: 'image/svg+xml', data: Buffer.from(mockSvg(kind, place || venue, who)).toString('base64'), mock: true });
  }

  let res: Response;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [...refs.map((r) => ({ inlineData: { mimeType: r.mime, data: r.data } })), { text: prompt }] }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio } },
      }),
      signal: AbortSignal.timeout(55000),
    });
  } catch {
    return jsonError('Layanan gambar AI tidak menjawab. Coba lagi.', 504);
  }
  const json = (await res.json().catch(() => null)) as {
    candidates?: { finishReason?: string; content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] } }[];
    promptFeedback?: { blockReason?: string };
    error?: { message?: string };
  } | null;
  if (!res.ok) {
    console.error('[video-story-image]', res.status, json?.error?.message);
    return jsonError(res.status === 429 ? 'Kuota layanan gambar AI habis sementara. Coba beberapa menit lagi.' : 'Layanan gambar AI menolak permintaan.', 502);
  }
  const part = json?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part?.inlineData?.data) {
    const reason = json?.promptFeedback?.blockReason || json?.candidates?.[0]?.finishReason || 'tanpa gambar';
    return jsonError(`AI tidak menghasilkan gambar (${reason}). Ubah deskripsi momen lalu coba lagi.`, 422);
  }
  return NextResponse.json({ mime: part.inlineData.mimeType || 'image/png', data: part.inlineData.data });
}

/** Gambar uji (tanpa AI) — jelas berlabel, hanya untuk mengetes alur. */
function mockSvg(kind: Kind, label: string, who: string) {
  const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]!);
  if (kind === 'bg' || kind === 'finale-bg') {
    const hue = [...label].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1365" viewBox="0 0 768 1365"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue},55%,78%)"/><stop offset="0.6" stop-color="hsl(${(hue + 30) % 360},45%,62%)"/><stop offset="1" stop-color="hsl(${(hue + 60) % 360},35%,38%)"/></linearGradient></defs><rect width="768" height="1365" fill="url(#g)"/><path d="M0 900 Q 200 820 384 880 T 768 860 V1365 H0Z" fill="hsl(${(hue + 90) % 360},30%,35%)" opacity=".8"/><rect x="80" y="300" width="220" height="380" rx="12" fill="hsl(${hue},25%,90%)" opacity=".7"/><rect x="460" y="360" width="200" height="320" rx="12" fill="hsl(${hue},25%,88%)" opacity=".6"/><text x="384" y="1240" font-family="sans-serif" font-size="34" fill="#fff" text-anchor="middle">GAMBAR UJI · ${esc(label.slice(0, 40))}</text></svg>`;
  }
  const people = kind === 'sheet' || kind === 'finale-chars' || who === 'both' ? ['groom', 'bride'] : [who];
  const fig = (x: number, c: string) =>
    `<g transform="translate(${x} 0)"><circle cx="0" cy="300" r="70" fill="#E9C4A2"/><path d="M-110 1000 L-90 470 Q0 400 90 470 L110 1000Z" fill="${c}"/><rect x="-80" y="1000" width="60" height="230" fill="#333"/><rect x="20" y="1000" width="60" height="230" fill="#333"/></g>`;
  const xs = people.length === 2 ? [260, 508] : [384];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1024" viewBox="0 0 768 1280"><rect width="768" height="1280" fill="#00FF00"/>${people
    .map((p, i) => fig(xs[i], p === 'groom' ? (kind === 'finale-chars' ? '#222' : '#4A6FA5') : kind === 'finale-chars' ? '#F4F1EC' : '#C9647A'))
    .join('')}</svg>`;
}

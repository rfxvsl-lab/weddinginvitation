import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/server/auth';
import { getUserById } from '@/lib/db';
import { isEnterpriseTier } from '@/lib/packageLimits';
import { jsonError, limitOr429 } from '@/lib/server/http';

export const runtime = 'nodejs';

/**
 * Proxy aset untuk Video Studio (Enterprise).
 *
 * Render video terjadi di browser dan butuh membaca byte musik/foto. Sebagian sumber yang dipakai
 * editor undangan (pratinjau lagu iTunes, foto Google Drive) tidak mengirim header CORS, sehingga
 * browser menolak membacanya. Route ini hanya meneruskan aset dari host yang memang dipakai
 * RuangHadir, untuk akun Enterprise yang sedang login, dengan batas ukuran dan jenis konten.
 */

const ALLOWED_HOSTS = [
  /^audio-ssl\.itunes\.apple\.com$/,
  /^[a-z0-9-]+\.mzstatic\.com$/,
  /^res\.cloudinary\.com$/,
  /^drive\.google\.com$/,
  /^drive\.usercontent\.google\.com$/,
  /^lh\d\.googleusercontent\.com$/,
  /^images\.unsplash\.com$/,
];
const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES = /^(audio\/|image\/|application\/octet-stream|binary\/octet-stream)/;

export async function GET(req: NextRequest) {
  const limited = limitOr429(req, 'video-asset', 120, 600);
  if (limited) return limited;

  const session = await getSession();
  if (!session) return jsonError('Silakan masuk terlebih dahulu.', 401);
  if (session.role !== 'admin') {
    const user = await getUserById(session.uid);
    if (!isEnterpriseTier(user?.packageId)) return jsonError('Fitur ini khusus akun Enterprise.', 403);
  }

  let target: URL;
  try {
    target = new URL(req.nextUrl.searchParams.get('url') || '');
  } catch {
    return jsonError('URL aset tidak valid.', 400);
  }
  if (target.protocol !== 'https:' || !ALLOWED_HOSTS.some((re) => re.test(target.hostname))) {
    return jsonError('Sumber aset tidak diizinkan.', 400);
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, { redirect: 'follow', signal: AbortSignal.timeout(20000), cache: 'no-store' });
  } catch {
    return jsonError('Sumber aset tidak bisa dihubungi.', 502);
  }
  // Redirect hanya boleh berakhir di host yang diizinkan.
  const finalHost = new URL(upstream.url || target.href).hostname;
  if (!ALLOWED_HOSTS.some((re) => re.test(finalHost))) return jsonError('Sumber aset tidak diizinkan.', 400);
  if (!upstream.ok || !upstream.body) return jsonError(`Sumber aset menjawab ${upstream.status}.`, 502);

  const type = (upstream.headers.get('content-type') || 'application/octet-stream').split(';')[0].trim().toLowerCase();
  if (!ALLOWED_TYPES.test(type)) return jsonError('Jenis aset tidak didukung.', 415);
  const declared = Number(upstream.headers.get('content-length') || 0);
  if (declared > MAX_BYTES) return jsonError('Aset terlalu besar (maks. 20 MB).', 413);

  // Baca dengan batas ukuran (content-length bisa tidak ada).
  const reader = upstream.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel().catch(() => undefined);
      return jsonError('Aset terlalu besar (maks. 20 MB).', 413);
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let off = 0;
  for (const c of chunks) {
    body.set(c, off);
    off += c.byteLength;
  }
  return new NextResponse(body, {
    status: 200,
    headers: {
      'content-type': type === 'audio/x-m4p' ? 'audio/mp4' : type,
      'content-length': String(size),
      'cache-control': 'private, max-age=3600',
      'x-content-type-options': 'nosniff',
    },
  });
}

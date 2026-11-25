'use client';

/**
 * Ambil aset (musik/foto) untuk render video. Coba langsung dulu (CORS); bila ditolak,
 * lewat proxy same-origin /api/video/asset (khusus Enterprise, host terbatas).
 */
export async function fetchVideoAsset(url: string, signal?: AbortSignal): Promise<Response> {
  const abs = new URL(url, location.href);
  if (abs.origin === location.origin || abs.protocol === 'data:' || abs.protocol === 'blob:') {
    const res = await fetch(abs.href, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  }
  try {
    const res = await fetch(abs.href, { mode: 'cors', signal });
    if (res.ok) return res;
  } catch (e) {
    if (signal?.aborted) throw e;
  }
  const res = await fetch(`/api/video/asset?url=${encodeURIComponent(abs.href)}`, { signal, credentials: 'same-origin' });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      msg = (await res.json())?.error || msg;
    } catch {
      /* bukan JSON */
    }
    throw new Error(msg);
  }
  return res;
}

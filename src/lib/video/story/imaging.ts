'use client';

import { fetchVideoAsset } from '../assetFetch';

/** Muat URL/data URL menjadi ImageBitmap (lewat proxy bila sumber tanpa CORS). */
export async function loadBitmap(src: string, signal?: AbortSignal): Promise<ImageBitmap> {
  if (src.startsWith('data:image/svg')) {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth || 768;
    c.height = img.naturalHeight || 1024;
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    return createImageBitmap(c);
  }
  const blob = src.startsWith('data:') ? await (await fetch(src)).blob() : await (await fetchVideoAsset(src, signal)).blob();
  return createImageBitmap(blob);
}

/** Kecilkan foto referensi → JPEG base64 (tanpa prefix) agar permintaan AI tetap ringan. */
export async function toReference(src: string, maxSide = 768, signal?: AbortSignal): Promise<{ mime: string; data: string }> {
  const bmp = await loadBitmap(src, signal);
  const k = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  const url = c.toDataURL('image/jpeg', 0.86);
  return { mime: 'image/jpeg', data: url.slice(url.indexOf(',') + 1) };
}

/**
 * Chroma key hijau (#00FF00) → PNG transparan.
 * Memakai jarak "kehijauan" (G dibanding max(R,B)) dengan tepi lembut, lalu despill
 * (mengurangi pantulan hijau di rambut/tepi), dan memangkas area kosong.
 */
export async function chromaKeyGreen(src: string): Promise<Blob> {
  const bmp = await loadBitmap(src);
  const c = document.createElement('canvas');
  c.width = bmp.width;
  c.height = bmp.height;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(bmp, 0, 0);
  bmp.close();
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  let minX = c.width, minY = c.height, maxX = 0, maxY = 0;
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const spill = g - Math.max(r, b); // > 0 berarti kehijauan
    let a = 255;
    if (spill > 90) a = 0;
    else if (spill > 35) a = Math.round(255 * (1 - (spill - 35) / 55));
    if (spill > 0 && a > 0) d[i + 1] = Math.max(r, b) + Math.round(spill * 0.25); // despill
    d[i + 3] = Math.min(d[i + 3], a);
    if (a > 24) {
      const x = p % c.width, y = (p / c.width) | 0;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  ctx.putImageData(img, 0, 0);
  if (maxX <= minX || maxY <= minY) throw new Error('Karakter tidak terdeteksi pada gambar (latar hijau gagal).');
  const pad = 12;
  const x0 = Math.max(0, minX - pad), y0 = Math.max(0, minY - pad);
  const w = Math.min(c.width - x0, maxX - minX + pad * 2), h = Math.min(c.height - y0, maxY - minY + pad * 2);
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  out.getContext('2d')!.drawImage(c, x0, y0, w, h, 0, 0, w, h);
  return new Promise((resolve, reject) => out.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG gagal dibuat'))), 'image/png'));
}

/** Data AI (base64) → Blob siap unggah. SVG uji dirasterisasi ke PNG. */
export async function aiImageToBlob(mime: string, data: string): Promise<Blob> {
  if (mime.includes('svg')) {
    const bmp = await loadBitmap(`data:${mime};base64,${data}`);
    const c = document.createElement('canvas');
    c.width = bmp.width;
    c.height = bmp.height;
    c.getContext('2d')!.drawImage(bmp, 0, 0);
    bmp.close();
    return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG gagal'))), 'image/jpeg', 0.9));
  }
  const bin = atob(data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

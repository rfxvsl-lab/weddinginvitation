'use client';

import { fetchVideoAsset } from './assetFetch';

/**
 * Rasterizer frame cepat untuk komposisi film undangan.
 *
 * Film (src/components/motion/*) hanya memakai inline style, <img>, dan SVG inline, jadi kita
 * tidak perlu menghitung getComputedStyle per node seperti pustaka screenshot umum. Per frame:
 * cloneNode → ganti src gambar dengan data URL (sudah di-cache & diperkecil) → XMLSerializer →
 * SVG foreignObject berisi @font-face tersemat → decode sebagai gambar → drawImage ke canvas.
 */

export interface RasterizerOptions {
  /** URL stylesheet font (mis. Google Fonts) yang dipakai komposisi. */
  fontCssUrls?: string[];
  /**
   * Keluarga font yang wajib disematkan (semua weight/style). Tanpa ini hanya font yang sudah
   * dipakai saat frame pertama yang ikut — adegan berikutnya bisa jatuh ke font cadangan.
   */
  fontFamilies?: string[];
  /** Sisi terpanjang maksimum foto yang disematkan (px keluaran). */
  maxImageSide?: number;
  signal?: AbortSignal;
  /** Cache bersama antar-render (mis. render massal per tamu): font & foto tidak diunduh ulang. */
  cache?: RasterCache;
}

export interface RasterCache {
  fonts: Map<string, string>;
  images: Map<string, string>;
}

export function createRasterCache(): RasterCache {
  return { fonts: new Map(), images: new Map() };
}

export interface FrameRasterizer {
  /** Ukuran CSS node yang dirasterisasi. */
  cssWidth: number;
  cssHeight: number;
  draw(ctx: CanvasRenderingContext2D, width: number, height: number): Promise<void>;
  /** Jumlah gambar/font yang gagal disematkan (frame tetap dirender, tanpa aset itu). */
  warnings: string[];
}

const XHTML = 'http://www.w3.org/1999/xhtml';

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

async function imageToDataUrl(url: string, maxSide: number, signal?: AbortSignal): Promise<string> {
  if (url.startsWith('data:')) return url;
  const blob = await (await fetchVideoAsset(url, signal)).blob();
  if (blob.type.includes('svg')) return blobToDataUrl(blob);
  const bmp = await createImageBitmap(blob);
  const k = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  // PNG tetap PNG (transparansi ornamen), selain itu JPEG agar SVG per frame tetap ringan.
  const keepAlpha = /png|webp|gif/.test(blob.type);
  if (k >= 1 && blob.size < 400_000) {
    bmp.close();
    return blobToDataUrl(blob);
  }
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(bmp.width * k));
  c.height = Math.max(1, Math.round(bmp.height * k));
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  return c.toDataURL(keepAlpha ? 'image/webp' : 'image/jpeg', 0.88);
}

/** Ambil @font-face yang memang dipakai (status loaded di document.fonts), sematkan sebagai data URL. */
async function embedFonts(cssUrls: string[], families: string[] | undefined, signal?: AbortSignal, warnings: string[] = []): Promise<string> {
  const wanted = families?.length ? new Set(families.map((f) => f.toLowerCase())) : null;
  const used = new Set<string>();
  document.fonts.forEach((f) => {
    if (f.status === 'loaded') used.add(`${f.family.replace(/["']/g, '').toLowerCase()}|${f.weight}|${f.style}`);
  });
  const out: string[] = [];
  for (const cssUrl of cssUrls) {
    let css = '';
    try {
      css = await (await fetch(cssUrl, { mode: 'cors', signal })).text();
    } catch {
      warnings.push(`font-css:${cssUrl}`);
      continue;
    }
    const blocks = css.match(/@font-face\s*{[^}]*}/g) || [];
    for (const block of blocks) {
      const fam = (block.match(/font-family:\s*['"]?([^;'"]+)['"]?;/) || [])[1]?.toLowerCase();
      const weight = (block.match(/font-weight:\s*([^;]+);/) || [])[1]?.trim() || '400';
      const style = (block.match(/font-style:\s*([^;]+);/) || [])[1]?.trim() || 'normal';
      const range = (block.match(/unicode-range:\s*([^;]+);/) || [])[1] || '';
      if (!fam) continue;
      if (wanted ? !wanted.has(fam) : !used.has(`${fam}|${weight}|${style}`)) continue;
      // Hanya subset latin dasar + aksara Jawa; subset lain (cyrillic, vietnamese…) tidak dipakai film.
      if (range && !/U\+0000-00FF|U\+A980/i.test(range)) continue;
      const src = (block.match(/url\(([^)]+)\)/) || [])[1]?.replace(/['"]/g, '');
      if (!src) continue;
      try {
        const data = await blobToDataUrl(await (await fetch(src, { mode: 'cors', signal })).blob());
        out.push(block.replace(/url\([^)]+\)/, `url(${data})`));
      } catch {
        warnings.push(`font:${fam}`);
      }
    }
  }
  return out.join('\n');
}

function escapeXmlText(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function createFrameRasterizer(node: HTMLElement, opts: RasterizerOptions = {}): Promise<FrameRasterizer> {
  const { fontCssUrls = [], fontFamilies, maxImageSide = 1600, signal, cache } = opts;
  const warnings: string[] = [];
  const rect = node.getBoundingClientRect();
  const cssWidth = Math.round(rect.width || node.offsetWidth);
  const cssHeight = Math.round(rect.height || node.offsetHeight);

  await document.fonts.ready;
  const fontKey = `${fontCssUrls.join('|')}#${(fontFamilies || []).join(',')}`;
  let fontCss = cache?.fonts.get(fontKey);
  if (fontCss === undefined) {
    fontCss = await embedFonts(fontCssUrls, fontFamilies, signal, warnings);
    if (!warnings.some((w) => w.startsWith('font'))) cache?.fonts.set(fontKey, fontCss);
  }

  // Cache gambar: kumpulkan dari seluruh <img> / <image> yang mungkin muncul (frame awal sudah memuat semua src film).
  const imageCache = cache?.images ?? new Map<string, string>();
  const FAILED = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
  const ensureImage = async (src: string) => {
    if (!src || src.startsWith('data:')) return;
    if (imageCache.has(src)) {
      if (imageCache.get(src) === FAILED && !warnings.includes(`img:${src}`)) warnings.push(`img:${src}`);
      return;
    }
    try {
      imageCache.set(src, await imageToDataUrl(new URL(src, location.href).href, maxImageSide, signal));
    } catch {
      warnings.push(`img:${src}`);
      imageCache.set(src, FAILED);
    }
  };
  const collect = (root: Element) =>
    Array.from(root.querySelectorAll('img')).map((i) => i.getAttribute('src') || '')
      .concat(Array.from(root.querySelectorAll('image')).map((i) => i.getAttribute('href') || i.getAttribute('xlink:href') || ''));
  await Promise.all(collect(node).map(ensureImage));

  const serializer = new XMLSerializer();
  const styleBlock = `<style>${escapeXmlText(fontCss)}</style>`;

  const draw = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const clone = node.cloneNode(true) as HTMLElement;
    // Buang lapisan yang tidak terlihat di frame ini: memperkecil SVG dan biaya decode per frame.
    clone.querySelectorAll<HTMLElement | SVGElement>('[style]').forEach((el) => {
      const st = (el as HTMLElement).style;
      if (st && (st.opacity === '0' || st.display === 'none' || st.visibility === 'hidden')) el.remove();
    });
    // Gambar yang baru muncul di tengah film: sematkan dulu.
    const pending = collect(node).filter((s) => s && !s.startsWith('data:') && !imageCache.has(s));
    if (pending.length) await Promise.all(pending.map(ensureImage));
    clone.querySelectorAll('img').forEach((img) => {
      const s = img.getAttribute('src') || '';
      const d = imageCache.get(s);
      if (d) img.setAttribute('src', d);
      img.removeAttribute('srcset');
      img.removeAttribute('loading');
    });
    clone.querySelectorAll('image').forEach((img) => {
      const s = img.getAttribute('href') || img.getAttribute('xlink:href') || '';
      const d = imageCache.get(s);
      if (d) img.setAttribute('href', d);
    });
    clone.style.position = 'relative';
    clone.style.left = '0';
    clone.style.top = '0';
    clone.style.margin = '0';
    clone.style.width = `${cssWidth}px`;
    clone.style.height = `${cssHeight}px`;
    clone.style.overflow = 'hidden';
    const html = serializer.serializeToString(clone);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${cssWidth}" height="${cssHeight}" viewBox="0 0 ${cssWidth} ${cssHeight}">` +
      `<foreignObject x="0" y="0" width="100%" height="100%"><div xmlns="${XHTML}" style="width:${cssWidth}px;height:${cssHeight}px;overflow:hidden;margin:0">` +
      styleBlock + html + `</div></foreignObject></svg>`;
    // data: URL (bukan blob:) — Chrome menandai canvas "tainted" bila SVG foreignObject dimuat dari blob:,
    // dan frame tainted tidak bisa dijadikan VideoFrame.
    const img = new Image();
    img.decoding = 'sync';
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await img.decode();
    ctx.drawImage(img, 0, 0, width, height);
  };

  return { cssWidth, cssHeight, draw, warnings };
}

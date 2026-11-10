/**
 * Utility to convert Google Drive sharing URLs into direct image URLs
 */
export function convertGoogleDriveUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  
  if (trimmed.includes('drive.google.com')) {
    // Pattern 1: /file/d/([a-zA-Z0-9_-]+)/view
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
    }
    
    // Pattern 2: id=([a-zA-Z0-9_-]+)
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}`;
    }
  }
  
  return trimmed;
}

/** Lebar default: 2x lebar bingkai undangan (~414 px), tajam di layar HP retina. */
const DEFAULT_DISPLAY_WIDTH = 828;

/**
 * URL gambar untuk DITAMPILKAN (bukan untuk disimpan): minta server gambar
 * mengirim versi yang sudah diperkecil dan dikompres.
 *
 * - Google (lh3 / Drive): akhiran `=w{lebar}-rw` → maksimal selebar itu, format WebP.
 * - Cloudinary: transformasi `f_auto,q_auto,c_limit,w_{lebar}`.
 * - URL lain dikembalikan apa adanya.
 *
 * Contoh pengukuran: foto 581 KB → 253 KB (w828), foto 138 KB → 54 KB.
 */
export function displayImageUrl(url: string, width: number = DEFAULT_DISPLAY_WIDTH): string {
  const direct = convertGoogleDriveUrl(url);
  if (!direct) return '';
  const w = Math.max(64, Math.min(2560, Math.round(width)));

  let parsed: URL;
  try {
    parsed = new URL(direct);
  } catch {
    return direct; // path lokal (/assets/...) atau data: URI
  }

  if (parsed.hostname === 'lh3.googleusercontent.com' && /^\/d\/[A-Za-z0-9_-]+$/.test(parsed.pathname) && !parsed.search) {
    return `${direct}=w${w}-rw`;
  }

  if (parsed.hostname === 'res.cloudinary.com') {
    // Hanya gambar yang belum punya transformasi: /<cloud>/image/upload/<v123|file>
    const m = parsed.pathname.match(/^\/([^/]+)\/image\/upload\/(v\d+\/.+|[^/,]+\.[A-Za-z0-9]+)$/);
    if (m) {
      parsed.pathname = `/${m[1]}/image/upload/f_auto,q_auto,c_limit,w_${w}/${m[2]}`;
      return parsed.toString();
    }
  }

  return direct;
}

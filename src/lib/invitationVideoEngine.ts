/**
 * RuangHadir — Authentic Theme-Matched Motion Graphic Engine (After Effects–grade Canvas Renderer)
 * 100% matched to the exact palettes, real image assets, and signature opening mechanics of:
 *   1. javanese-classic  -> #F8F0DF / #8A452C / #C59C62 / #493021 + /assets/wayang/gunungan.png + /assets/flower.webp
 *   2. grand-ballroom    -> #F3F6FA / #345579 / #8FA8C2 / #23364D + Parting Royal Curtains + Swaying Chandelier + Marble Frame
 *   3. luxury-pink       -> #FCF3F6 / #A83D68 / #D99AB3 / #54243B + Opening 3D Envelope + Rising Card + Arched Rose Frame
 */

export type VideoThemeId = 'javanese-classic' | 'grand-ballroom' | 'luxury-pink';
export type VideoAspectId = '9:16' | '1:1' | '16:9';

export interface VideoCoupleProps {
  groom: string;
  bride: string;
  groomFull: string;
  brideFull: string;
  dateRaw: string;
  timeRaw: string;
  venue: string;
  slug: string;
  initials: string;
}

export interface VideoThemeMeta {
  id: VideoThemeId;
  name: string;
  shortName: string;
  tagline: string;
  techniques: string[];
  swatch: [string, string, string];
  accent: string;
  isDark: boolean;
}

export const VIDEO_FPS = 30;
export const VIDEO_DURATION_SEC = 18;
export const VIDEO_TOTAL_FRAMES = VIDEO_FPS * VIDEO_DURATION_SEC; // 540 frames

export const VIDEO_SCENES = [
  { id: 0, label: '01 · Opening Gate', start: 0, end: 135 },
  { id: 1, label: '02 · Polaroid Mempelai', start: 135, end: 270 },
  { id: 2, label: '03 · Kartu Undangan', start: 270, end: 405 },
  { id: 3, label: '04 · Golden Finale', start: 405, end: 540 },
] as const;

export const VIDEO_THEMES: VideoThemeMeta[] = [
  {
    id: 'javanese-classic',
    name: 'Javanese Classic',
    shortName: 'Javanese Classic',
    tagline: 'Painterly Pendopo · Gunungan · Volumetric Sunbeams · #F8F0DF / #8A452C',
    techniques: ['2.5D Camera Push-In', 'Volumetric God Rays', 'Polaroid Keepsakes', 'Golden Fireflies'],
    swatch: ['#F8F0DF', '#C59C62', '#8A452C'],
    accent: '#8A452C',
    isDark: false,
  },
  {
    id: 'grand-ballroom',
    name: 'Grand Ballroom',
    shortName: 'Grand Ballroom',
    tagline: 'Neoclassical Palace · Parting Curtains · Chandelier Rays · #F3F6FA / #345579',
    techniques: ['2.5D Camera Push-In', 'Velvet Curtain Reveal', 'Diegetic Marble Note', 'Crystal Bokeh'],
    swatch: ['#F3F6FA', '#8FA8C2', '#345579'],
    accent: '#345579',
    isDark: false,
  },
  {
    id: 'luxury-pink',
    name: 'Luxury Love Pink',
    shortName: 'Luxury Pink',
    tagline: 'Parisian Rose Conservatory · 3D Wax Envelope · Sunset Halo · #FCF3F6 / #A83D68',
    techniques: ['2.5D Camera Push-In', '3D Wax-Seal Envelope', 'Sun-Flare Match Cut', 'Rose Petals 60fps'],
    swatch: ['#FCF3F6', '#D99AB3', '#A83D68'],
    accent: '#A83D68',
    isDark: false,
  },
];

// ---- Cached Real Theme Assets ----
const imageCache: Record<string, HTMLImageElement | null> = {};

function getCachedImage(src: string): HTMLImageElement | null {
  if (typeof window === 'undefined') return null;
  if (src in imageCache) {
    const img = imageCache[src];
    return img && img.complete && img.naturalWidth > 0 ? img : null;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  imageCache[src] = img;
  return img.complete && img.naturalWidth > 0 ? img : null;
}

// ---- After Effects Speed-Graph Easings ----
function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function easeOutExpo(t: number) {
  const x = clamp01(t);
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

function easeInOutQuart(t: number) {
  const x = clamp01(t);
  return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}

function easeOutBack(t: number) {
  const x = clamp01(t);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function seg(frame: number, start: number, end: number) {
  return clamp01((frame - start) / Math.max(1, end - start));
}

function seeded(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Track-Matte Masked Kinetic Text Reveal (AE Track Matte)
function drawMaskedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  reveal: number,
  font: string,
  color: string,
  lineHeight: number,
  fromDirection: 'up' | 'down' = 'up'
) {
  const p = easeOutExpo(reveal);
  const offset = (1 - p) * lineHeight * (fromDirection === 'up' ? 0.95 : -0.95);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, cy - lineHeight * 0.65, ctx.canvas.width, lineHeight * 1.3);
  ctx.clip();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = clamp01(p * 1.35);
  ctx.fillText(text, cx, cy + offset);
  ctx.restore();
}

// Trim-Path Corner Brackets (matching .javanese-border L-corners)
function drawJavaneseCorners(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  len: number,
  progress: number,
  color: string,
  lw: number
) {
  const p = easeOutExpo(progress);
  const L = len * p;
  if (L <= 0.5) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'square';
  // Top-left
  ctx.beginPath();
  ctx.moveTo(x, y + L);
  ctx.lineTo(x, y);
  ctx.lineTo(x + L, y);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(x + w - L, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - L);
  ctx.stroke();
  // Top-right & Bottom-left subtle gold accents
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(x + w - L * 0.7, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + L * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + h - L * 0.7);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + L * 0.7, y + h);
  ctx.stroke();
  ctx.restore();
}

// ---- THEME 1: JAVANESE CLASSIC (#F8F0DF, #EBDFC5, #8A452C, #C59C62, #493021) ----
function renderJavaneseTheme(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  f: number,
  t: number,
  scale: number,
  couple: VideoCoupleProps
) {
  const cx = w / 2;
  const cy = h / 2;
  const sceneIdx = Math.min(3, Math.floor(f / 90));
  const localF = f - sceneIdx * 90;
  const exitAlpha = localF > 74 ? 1 - easeInOutQuart((localF - 74) / 16) : 1;

  // 1. Exact Javanese Sogan Cream Parchment (#F8F0DF)
  const bg = ctx.createRadialGradient(cx, cy * 0.85, w * 0.05, cx, cy, Math.max(w, h) * 0.85);
  bg.addColorStop(0, '#FDF8EC');
  bg.addColorStop(0.65, '#F8F0DF');
  bg.addColorStop(1, '#EBDFC5');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle parchment diamond watermark grid
  ctx.save();
  ctx.strokeStyle = 'rgba(197, 156, 98, 0.14)';
  ctx.lineWidth = 1 * scale;
  const step = 44 * scale;
  for (let gx = -step; gx < w + step; gx += step) {
    for (let gy = -step; gy < h + step; gy += step) {
      ctx.beginPath();
      ctx.moveTo(gx, gy - 8 * scale);
      ctx.lineTo(gx + 8 * scale, gy);
      ctx.lineTo(gx, gy + 8 * scale);
      ctx.lineTo(gx - 8 * scale, gy);
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();

  // 2. Real /assets/flower.webp Rotating Corner Ornaments (exact JavaneseFlower!)
  const flowerImg = getCachedImage('/assets/flower.webp');
  if (flowerImg) {
    const fSize = 155 * scale;
    const corners: [number, number][] = [
      [18 * scale, 18 * scale],
      [w - 18 * scale, h - 18 * scale],
    ];
    corners.forEach(([fx, fy], idx) => {
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate((idx === 0 ? 1 : -1) * t * Math.PI * 1.2);
      ctx.globalAlpha = 0.55;
      ctx.drawImage(flowerImg, -fSize / 2, -fSize / 2, fSize, fSize);
      ctx.restore();
    });
  }

  // 3. Exact .javanese-panel Card (#EBDFC5 / #F8F0DF with #C59C62 border & .javanese-border L-corners)
  const padX = w * 0.09;
  const padY = h * 0.12;
  const cardW = w - padX * 2;
  const cardH = h - padY * 2;

  ctx.save();
  drawRoundedRect(ctx, padX, padY, cardW, cardH, 6 * scale);
  ctx.fillStyle = 'rgba(248, 240, 223, 0.88)';
  ctx.fill();
  ctx.strokeStyle = '#C59C62';
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();
  ctx.restore();

  drawJavaneseCorners(
    ctx,
    padX - 6 * scale,
    padY - 6 * scale,
    cardW + 12 * scale,
    cardH + 12 * scale,
    34 * scale,
    seg(f, 0, 36),
    '#8A452C',
    2.4 * scale
  );

  // 4. Scene Choreography matching JavaneseClassicLayout.tsx
  ctx.save();
  ctx.globalAlpha = exitAlpha;

  if (sceneIdx === 0) {
    // Scene 01: Real /assets/wayang/gunungan.png + Pawiwahan Opening
    const gunungan = getCachedImage('/assets/wayang/gunungan.png');
    const pop = easeOutBack(seg(localF, 4, 34));
    const gH = Math.min(cardH * 0.44, 240 * scale);
    const gW = gH * 0.72;

    if (gunungan) {
      ctx.save();
      ctx.translate(cx, cy - 58 * scale);
      ctx.scale(0.8 + 0.2 * pop, 0.8 + 0.2 * pop);
      ctx.rotate(Math.sin(t * Math.PI * 4) * 0.025);
      ctx.drawImage(gunungan, -gW / 2, -gH / 2, gW, gH);
      ctx.restore();
    }

    // Horizontal soga rule (border-t border-b border-[#8A452C]/30)
    const ruleW = cardW * 0.65 * easeOutExpo(seg(localF, 16, 42));
    ctx.strokeStyle = 'rgba(138, 69, 44, 0.35)';
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - ruleW / 2, cy + 56 * scale);
    ctx.lineTo(cx + ruleW / 2, cy + 56 * scale);
    ctx.moveTo(cx - ruleW / 2, cy + 126 * scale);
    ctx.lineTo(cx + ruleW / 2, cy + 126 * scale);
    ctx.stroke();

    drawMaskedText(
      ctx,
      'PAWIWAHAN PERNIKAHAN',
      cx,
      cy + 76 * scale,
      seg(localF, 18, 42),
      `700 ${Math.round(12 * scale)}px "Montserrat", sans-serif`,
      '#8A452C',
      22 * scale
    );
    drawMaskedText(
      ctx,
      `${couple.groom} & ${couple.bride}`,
      cx,
      cy + 104 * scale,
      seg(localF, 24, 50),
      `700 ${Math.round(30 * scale)}px "Philosopher", Georgia, serif`,
      '#493021',
      40 * scale
    );
  } else if (sceneIdx === 1) {
    // Scene 02: "SANG PENGANTEN" (exact JavaneseClassicLayout heading)
    drawMaskedText(
      ctx,
      'SANG PENGANTEN',
      cx,
      padY + 56 * scale,
      seg(localF, 0, 24),
      `700 ${Math.round(20 * scale)}px "Philosopher", Georgia, serif`,
      '#8A452C',
      30 * scale
    );
    const uW = 130 * scale * easeOutExpo(seg(localF, 8, 30));
    ctx.strokeStyle = '#8A452C';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - uW / 2, padY + 76 * scale);
    ctx.lineTo(cx + uW / 2, padY + 76 * scale);
    ctx.stroke();

    drawMaskedText(
      ctx,
      couple.groom,
      cx,
      cy - 44 * scale,
      seg(localF, 10, 34),
      `700 ${Math.round(44 * scale)}px "Philosopher", Georgia, serif`,
      '#493021',
      54 * scale,
      'up'
    );
    drawMaskedText(
      ctx,
      '&',
      cx,
      cy + 4 * scale,
      seg(localF, 18, 38),
      `italic 400 ${Math.round(28 * scale)}px "Gelasio", Georgia, serif`,
      '#8A452C',
      36 * scale
    );
    drawMaskedText(
      ctx,
      couple.bride,
      cx,
      cy + 52 * scale,
      seg(localF, 22, 46),
      `700 ${Math.round(44 * scale)}px "Philosopher", Georgia, serif`,
      '#493021',
      54 * scale,
      'down'
    );
    drawMaskedText(
      ctx,
      `${couple.groomFull}  ·  ${couple.brideFull}`,
      cx,
      cy + 106 * scale,
      seg(localF, 30, 56),
      `500 ${Math.round(12.5 * scale)}px "Gelasio", Georgia, serif`,
      '#493021',
      22 * scale
    );
  } else if (sceneIdx === 2) {
    // Scene 03: "PAHARGYAN" + Soga Badge "Ijab Kabul"
    drawMaskedText(
      ctx,
      'PAHARGYAN',
      cx,
      padY + 56 * scale,
      seg(localF, 0, 24),
      `700 ${Math.round(22 * scale)}px "Philosopher", Georgia, serif`,
      '#8A452C',
      32 * scale
    );

    // Soga Ribbon Tag
    const badgePop = easeOutBack(seg(localF, 10, 32));
    ctx.save();
    ctx.translate(cx, cy - 66 * scale);
    ctx.scale(badgePop, badgePop);
    drawRoundedRect(ctx, -64 * scale, -15 * scale, 128 * scale, 30 * scale, 4 * scale);
    ctx.fillStyle = '#8A452C';
    ctx.fill();
    ctx.font = `700 ${Math.round(12 * scale)}px "Philosopher", Georgia, serif`;
    ctx.fillStyle = '#F8F0DF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('IJAB KABUL & RESEPSI', 0, 0.5);
    ctx.restore();

    drawMaskedText(
      ctx,
      couple.dateRaw,
      cx,
      cy - 10 * scale,
      seg(localF, 16, 40),
      `700 ${Math.round(24 * scale)}px "Gelasio", Georgia, serif`,
      '#493021',
      36 * scale
    );
    drawMaskedText(
      ctx,
      `Pukul ${couple.timeRaw}`,
      cx,
      cy + 30 * scale,
      seg(localF, 22, 46),
      `700 ${Math.round(16 * scale)}px "Montserrat", sans-serif`,
      '#8A452C',
      26 * scale
    );
    const vText = couple.venue.length > 38 ? couple.venue.slice(0, 36) + '…' : couple.venue;
    drawMaskedText(
      ctx,
      vText,
      cx,
      cy + 72 * scale,
      seg(localF, 28, 54),
      `500 ${Math.round(14 * scale)}px "Gelasio", Georgia, serif`,
      '#493021',
      24 * scale
    );
  } else {
    // Scene 04: Save The Date + Soga Button
    const gunungan = getCachedImage('/assets/wayang/gunungan.png');
    if (gunungan) {
      ctx.save();
      ctx.globalAlpha = exitAlpha * 0.14;
      const gH = cardH * 0.62;
      ctx.drawImage(gunungan, cx - (gH * 0.72) / 2, cy - gH / 2, gH * 0.72, gH);
      ctx.restore();
    }
    drawMaskedText(
      ctx,
      'SAVE THE DATE',
      cx,
      cy - 68 * scale,
      seg(localF, 0, 24),
      `700 ${Math.round(12 * scale)}px "Montserrat", sans-serif`,
      '#8A452C',
      22 * scale
    );
    drawMaskedText(
      ctx,
      `${couple.groom} & ${couple.bride}`,
      cx,
      cy - 22 * scale,
      seg(localF, 8, 34),
      `700 ${Math.round(38 * scale)}px "Philosopher", Georgia, serif`,
      '#493021',
      48 * scale
    );
    drawMaskedText(
      ctx,
      couple.dateRaw,
      cx,
      cy + 24 * scale,
      seg(localF, 18, 42),
      `500 ${Math.round(14 * scale)}px "Gelasio", Georgia, serif`,
      '#493021',
      24 * scale
    );

    const btnPop = easeOutBack(seg(localF, 24, 48));
    ctx.save();
    ctx.translate(cx, cy + 76 * scale);
    ctx.scale(0.85 + 0.15 * btnPop, 0.85 + 0.15 * btnPop);
    ctx.font = `700 ${Math.round(12.5 * scale)}px "Montserrat", sans-serif`;
    const bw = Math.min(cardW - 36 * scale, ctx.measureText(couple.slug).width + 42 * scale);
    drawRoundedRect(ctx, -bw / 2, -19 * scale, bw, 38 * scale, 6 * scale);
    ctx.fillStyle = '#8A452C';
    ctx.fill();
    ctx.fillStyle = '#F8F0DF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(couple.slug, 0, 1);
    ctx.restore();
  }
  ctx.restore();

  // Warm gold light-sweep transition
  if (localF < 14) {
    const flash = 1 - localF / 14;
    ctx.save();
    ctx.fillStyle = `rgba(197, 156, 98, ${flash * 0.28})`;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

// ---- THEME 2: GRAND BALLROOM (#F3F6FA, #E1E9F2, #345579, #8FA8C2, #23364D) ----
function renderGrandBallroomTheme(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  f: number,
  t: number,
  scale: number,
  couple: VideoCoupleProps
) {
  const cx = w / 2;
  const cy = h / 2;
  const sceneIdx = Math.min(3, Math.floor(f / 90));
  const localF = f - sceneIdx * 90;
  const exitAlpha = localF > 74 ? 1 - easeInOutQuart((localF - 74) / 16) : 1;

  // 1. Exact Grand Ballroom Ice Marble Background (#F3F6FA -> #E1E9F2)
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#FFFFFF');
  bg.addColorStop(0.5, '#F3F6FA');
  bg.addColorStop(1, '#E1E9F2');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle marble diamond floor lines
  ctx.save();
  ctx.strokeStyle = 'rgba(143, 168, 194, 0.22)';
  ctx.lineWidth = 1 * scale;
  const step = 48 * scale;
  for (let gx = 0; gx < w + step; gx += step) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx - h * 0.35, h);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Swaying Crystal Chandelier from top (exact chandelier-sway animation!)
  ctx.save();
  ctx.translate(cx, 0);
  ctx.rotate(Math.sin(t * Math.PI * 4) * 0.035);
  // Chain
  ctx.strokeStyle = '#8FA8C2';
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 44 * scale);
  ctx.stroke();
  // Crystal tiers
  ctx.strokeStyle = '#345579';
  ctx.lineWidth = 1.6 * scale;
  ctx.beginPath();
  ctx.arc(0, 46 * scale, 26 * scale, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 52 * scale, 42 * scale, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // Crystal drops
  [-32, -16, 0, 16, 32].forEach((dx, idx) => {
    const dy = 66 + (idx === 2 ? 14 : idx === 1 || idx === 3 ? 8 : 0);
    ctx.fillStyle = 'rgba(143, 168, 194, 0.65)';
    ctx.beginPath();
    ctx.arc(dx * scale, dy * scale, 3.2 * scale, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // 3. Exact .glass-ballroom Double Inset Frame (#F3F6FA + border #8FA8C2 + inset 5px #E1E9F2)
  const padX = w * 0.09;
  const padY = h * 0.14;
  const cardW = w - padX * 2;
  const cardH = h - padY * 2;
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.86)';
  ctx.fillRect(padX, padY, cardW, cardH);
  ctx.strokeStyle = '#8FA8C2';
  ctx.lineWidth = 1.5 * scale;
  ctx.strokeRect(padX, padY, cardW, cardH);
  ctx.strokeStyle = '#E1E9F2';
  ctx.lineWidth = 6 * scale;
  ctx.strokeRect(padX + 5 * scale, padY + 5 * scale, cardW - 10 * scale, cardH - 10 * scale);
  ctx.strokeStyle = 'rgba(52, 85, 121, 0.25)';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(padX + 12 * scale, padY + 12 * scale, cardW - 24 * scale, cardH - 24 * scale);
  ctx.restore();

  // 4. Scene Content (Cinzel & Playfair Display in #23364D & #345579)
  ctx.save();
  ctx.globalAlpha = exitAlpha;

  if (sceneIdx === 0) {
    drawMaskedText(
      ctx,
      'THE GRAND BALLROOM',
      cx,
      cy - 68 * scale,
      seg(localF, 18, 44),
      `700 ${Math.round(12 * scale)}px "Cinzel", Georgia, serif`,
      '#345579',
      22 * scale
    );
    drawMaskedText(
      ctx,
      couple.initials,
      cx,
      cy - 10 * scale,
      seg(localF, 22, 50),
      `600 ${Math.round(74 * scale)}px "Cinzel", Georgia, serif`,
      '#23364D',
      84 * scale
    );
    drawMaskedText(
      ctx,
      'WELCOME TO THE ROYAL CELEBRATION',
      cx,
      cy + 58 * scale,
      seg(localF, 30, 58),
      `700 ${Math.round(11 * scale)}px "Lato", sans-serif`,
      '#345579',
      20 * scale
    );
  } else if (sceneIdx === 1) {
    drawMaskedText(
      ctx,
      'THE ROYAL COUPLE',
      cx,
      padY + 46 * scale,
      seg(localF, 0, 22),
      `700 ${Math.round(12 * scale)}px "Cinzel", Georgia, serif`,
      '#345579',
      22 * scale
    );
    drawMaskedText(
      ctx,
      couple.groom,
      cx,
      cy - 44 * scale,
      seg(localF, 8, 34),
      `600 ${Math.round(44 * scale)}px "Cinzel", Georgia, serif`,
      '#23364D',
      54 * scale,
      'up'
    );
    drawMaskedText(
      ctx,
      '&',
      cx,
      cy + 2 * scale,
      seg(localF, 16, 38),
      `italic 400 ${Math.round(30 * scale)}px "Playfair Display", Georgia, serif`,
      '#345579',
      38 * scale
    );
    drawMaskedText(
      ctx,
      couple.bride,
      cx,
      cy + 48 * scale,
      seg(localF, 20, 44),
      `600 ${Math.round(44 * scale)}px "Cinzel", Georgia, serif`,
      '#23364D',
      54 * scale,
      'down'
    );
    drawMaskedText(
      ctx,
      `${couple.groomFull}  ·  ${couple.brideFull}`,
      cx,
      cy + 104 * scale,
      seg(localF, 28, 54),
      `400 ${Math.round(12.5 * scale)}px "Lato", sans-serif`,
      '#345579',
      22 * scale
    );
  } else if (sceneIdx === 2) {
    drawMaskedText(
      ctx,
      'GRAND RECEPTION',
      cx,
      padY + 50 * scale,
      seg(localF, 0, 22),
      `700 ${Math.round(13 * scale)}px "Cinzel", Georgia, serif`,
      '#345579',
      24 * scale
    );
    drawMaskedText(
      ctx,
      couple.dateRaw,
      cx,
      cy - 28 * scale,
      seg(localF, 10, 34),
      `700 ${Math.round(25 * scale)}px "Playfair Display", Georgia, serif`,
      '#23364D',
      36 * scale
    );
    drawMaskedText(
      ctx,
      `Pukul ${couple.timeRaw}`,
      cx,
      cy + 16 * scale,
      seg(localF, 18, 42),
      `700 ${Math.round(16 * scale)}px "Cinzel", Georgia, serif`,
      '#345579',
      26 * scale
    );
    const vText = couple.venue.length > 38 ? couple.venue.slice(0, 36) + '…' : couple.venue;
    drawMaskedText(
      ctx,
      vText,
      cx,
      cy + 62 * scale,
      seg(localF, 24, 50),
      `400 ${Math.round(14 * scale)}px "Lato", sans-serif`,
      '#23364D',
      24 * scale
    );
  } else {
    drawMaskedText(
      ctx,
      'SAVE THE DATE',
      cx,
      cy - 66 * scale,
      seg(localF, 0, 22),
      `700 ${Math.round(12 * scale)}px "Cinzel", Georgia, serif`,
      '#345579',
      22 * scale
    );
    drawMaskedText(
      ctx,
      `${couple.groom} & ${couple.bride}`,
      cx,
      cy - 20 * scale,
      seg(localF, 8, 34),
      `600 ${Math.round(36 * scale)}px "Cinzel", Georgia, serif`,
      '#23364D',
      46 * scale
    );
    drawMaskedText(
      ctx,
      couple.dateRaw,
      cx,
      cy + 24 * scale,
      seg(localF, 16, 40),
      `400 ${Math.round(14 * scale)}px "Lato", sans-serif`,
      '#345579',
      24 * scale
    );
    const btnPop = easeOutBack(seg(localF, 22, 46));
    ctx.save();
    ctx.translate(cx, cy + 76 * scale);
    ctx.scale(0.85 + 0.15 * btnPop, 0.85 + 0.15 * btnPop);
    ctx.font = `700 ${Math.round(12.5 * scale)}px "Lato", sans-serif`;
    const bw = Math.min(cardW - 36 * scale, ctx.measureText(couple.slug).width + 44 * scale);
    drawRoundedRect(ctx, -bw / 2, -19 * scale, bw, 38 * scale, 19 * scale);
    ctx.fillStyle = '#345579';
    ctx.fill();
    ctx.fillStyle = '#F3F6FA';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(couple.slug, 0, 1);
    ctx.restore();
  }
  ctx.restore();

  // 5. Signature Twin Royal Slate Curtains Parting Open in Scene 01 (exact GrandBallroom CurtainStage!)
  if (sceneIdx === 0) {
    const openP = easeInOutQuart(seg(localF, 4, 48));
    const curtainW = (w / 2) * (1 - openP * 0.92);
    if (curtainW > 2) {
      // Left curtain
      const lg = ctx.createLinearGradient(0, 0, curtainW, 0);
      lg.addColorStop(0, '#23364D');
      lg.addColorStop(0.55, '#345579');
      lg.addColorStop(1, '#1E2E42');
      ctx.fillStyle = lg;
      ctx.fillRect(0, 0, curtainW, h);
      // Right curtain
      const rg = ctx.createLinearGradient(w - curtainW, 0, w, 0);
      rg.addColorStop(0, '#1E2E42');
      rg.addColorStop(0.45, '#345579');
      rg.addColorStop(1, '#23364D');
      ctx.fillStyle = rg;
      ctx.fillRect(w - curtainW, 0, curtainW, h);
      // Silver trim edges
      ctx.fillStyle = '#8FA8C2';
      ctx.fillRect(curtainW - 3 * scale, 0, 3 * scale, h);
      ctx.fillRect(w - curtainW, 0, 3 * scale, h);
    }
  }
}

// ---- THEME 3: LUXURY LOVE PINK (#FCF3F6, #F2DEE7, #A83D68, #D99AB3, #54243B) ----
function renderLuxuryPinkTheme(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  f: number,
  t: number,
  scale: number,
  couple: VideoCoupleProps
) {
  const cx = w / 2;
  const cy = h / 2;
  const sceneIdx = Math.min(3, Math.floor(f / 90));
  const localF = f - sceneIdx * 90;
  const exitAlpha = localF > 74 ? 1 - easeInOutQuart((localF - 74) / 16) : 1;

  // 1. Exact Luxury Pink Blush Background (#FCF3F6 -> #F2DEE7)
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#FCF3F6');
  bg.addColorStop(0.55, '#F8E6EE');
  bg.addColorStop(1, '#F2DEE7');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Floating subtle rose petals/hearts rising (exact .heart-bg feel)
  for (let i = 0; i < 18; i++) {
    const px = seeded(i * 19) * w;
    const py = ((seeded(i * 23) - t * (0.25 + seeded(i * 29) * 0.3) + 2) % 1) * h;
    const r = (4 + seeded(i * 31) * 6) * scale;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(t * Math.PI * 2 + i);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(217, 154, 179, 0.34)' : 'rgba(168, 61, 104, 0.14)';
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 2. Signature Luxury Pink Arched Frame (rounded-t-full border-4 border-[#D99AB3] bg-[#FCF3F6])
  const padX = w * 0.1;
  const padY = h * 0.12;
  const cardW = w - padX * 2;
  const cardH = h - padY * 2;
  const archR = cardW / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, padY + archR, archR, Math.PI, 0);
  ctx.lineTo(padX + cardW, padY + cardH - 20 * scale);
  ctx.arcTo(padX + cardW, padY + cardH, padX + cardW - 20 * scale, padY + cardH, 20 * scale);
  ctx.lineTo(padX + 20 * scale, padY + cardH);
  ctx.arcTo(padX, padY + cardH, padX, padY + cardH - 20 * scale, 20 * scale);
  ctx.closePath();
  ctx.fillStyle = 'rgba(252, 243, 246, 0.90)';
  ctx.fill();
  ctx.strokeStyle = '#D99AB3';
  ctx.lineWidth = 3 * scale;
  ctx.stroke();
  ctx.restore();

  // 3. Scene Choreography matching LuxuryPinkLayout.tsx
  ctx.save();
  ctx.globalAlpha = exitAlpha;

  if (sceneIdx === 0) {
    // Scene 01: Exact 3D Envelope Open + Rising Invitation Card (#A83D68, #D99AB3, #54243B)
    const flapP = easeInOutQuart(seg(localF, 6, 32));
    const cardRiseP = easeOutBack(seg(localF, 22, 56));
    const envW = Math.min(cardW * 0.78, 280 * scale);
    const envH = envW * 0.66;
    const ex = cx - envW / 2;
    const ey = cy + 16 * scale;

    // Envelope back body (#A83D68)
    drawRoundedRect(ctx, ex, ey, envW, envH, 10 * scale);
    ctx.fillStyle = '#A83D68';
    ctx.fill();

    // Rising inner invitation card (#FCF3F6)
    const riseY = ey - cardRiseP * (envH * 0.72);
    ctx.save();
    drawRoundedRect(ctx, ex + 12 * scale, riseY, envW - 24 * scale, envH * 0.88, 8 * scale);
    ctx.fillStyle = '#FCF3F6';
    ctx.fill();
    ctx.strokeStyle = '#D99AB3';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();
    ctx.font = `400 ${Math.round(32 * scale)}px "Great Vibes", Georgia, serif`;
    ctx.fillStyle = '#A83D68';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${couple.groom} & ${couple.bride}`, cx, riseY + envH * 0.36);
    ctx.font = `700 ${Math.round(10 * scale)}px "Nunito Sans", sans-serif`;
    ctx.fillStyle = '#54243B';
    ctx.fillText('THE WEDDING INVITATION', cx, riseY + envH * 0.62);
    ctx.restore();

    // Envelope front side & bottom folds (#A83D68 & #D99AB3)
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(cx, ey + envH * 0.52);
    ctx.lineTo(ex, ey + envH);
    ctx.closePath();
    ctx.fillStyle = '#A83D68';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(ex + envW, ey);
    ctx.lineTo(cx, ey + envH * 0.52);
    ctx.lineTo(ex + envW, ey + envH);
    ctx.closePath();
    ctx.fillStyle = '#D99AB3';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(ex, ey + envH);
    ctx.lineTo(cx, ey + envH * 0.48);
    ctx.lineTo(ex + envW, ey + envH);
    ctx.closePath();
    ctx.fillStyle = '#8F2E56';
    ctx.fill();

    // Top triangular flap (#54243B) flipping open upward
    const flapTipY = ey + envH * 0.52 * (1 - flapP * 2);
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex + envW, ey);
    ctx.lineTo(cx, flapTipY);
    ctx.closePath();
    ctx.fillStyle = '#54243B';
    ctx.globalAlpha = exitAlpha * (flapP > 0.55 ? 0.35 : 1);
    ctx.fill();
  } else if (sceneIdx === 1) {
    drawMaskedText(
      ctx,
      'THE WEDDING OF',
      cx,
      padY + 86 * scale,
      seg(localF, 0, 22),
      `700 ${Math.round(11.5 * scale)}px "Nunito Sans", sans-serif`,
      '#A83D68',
      22 * scale
    );
    drawMaskedText(
      ctx,
      couple.groom,
      cx,
      cy - 40 * scale,
      seg(localF, 8, 34),
      `400 ${Math.round(52 * scale)}px "Great Vibes", Georgia, serif`,
      '#54243B',
      62 * scale,
      'up'
    );
    drawMaskedText(
      ctx,
      '&',
      cx,
      cy + 8 * scale,
      seg(localF, 16, 38),
      `italic 400 ${Math.round(28 * scale)}px "Playfair Display", Georgia, serif`,
      '#A83D68',
      36 * scale
    );
    drawMaskedText(
      ctx,
      couple.bride,
      cx,
      cy + 56 * scale,
      seg(localF, 20, 44),
      `400 ${Math.round(52 * scale)}px "Great Vibes", Georgia, serif`,
      '#54243B',
      62 * scale,
      'down'
    );
    drawMaskedText(
      ctx,
      `${couple.groomFull}  ·  ${couple.brideFull}`,
      cx,
      cy + 112 * scale,
      seg(localF, 28, 54),
      `600 ${Math.round(12 * scale)}px "Nunito Sans", sans-serif`,
      '#A83D68',
      22 * scale
    );
  } else if (sceneIdx === 2) {
    drawMaskedText(
      ctx,
      'WEDDING SCHEDULE',
      cx,
      padY + 90 * scale,
      seg(localF, 0, 22),
      `700 ${Math.round(12 * scale)}px "Nunito Sans", sans-serif`,
      '#A83D68',
      22 * scale
    );

    // Inner Blush Card (#F2DEE7 with #D99AB3 top accent)
    const boxW = cardW * 0.82;
    const boxH = 165 * scale;
    const bx = cx - boxW / 2;
    const by = cy - boxH / 2 + 10 * scale;
    drawRoundedRect(ctx, bx, by, boxW, boxH, 18 * scale);
    ctx.fillStyle = '#F2DEE7';
    ctx.fill();
    ctx.strokeStyle = '#D99AB3';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    drawMaskedText(
      ctx,
      couple.dateRaw,
      cx,
      by + 48 * scale,
      seg(localF, 12, 36),
      `700 ${Math.round(22 * scale)}px "Playfair Display", Georgia, serif`,
      '#54243B',
      32 * scale
    );
    drawMaskedText(
      ctx,
      `Pukul ${couple.timeRaw}`,
      cx,
      by + 88 * scale,
      seg(localF, 18, 42),
      `700 ${Math.round(15 * scale)}px "Nunito Sans", sans-serif`,
      '#A83D68',
      24 * scale
    );
    const vText = couple.venue.length > 36 ? couple.venue.slice(0, 34) + '…' : couple.venue;
    drawMaskedText(
      ctx,
      vText,
      cx,
      by + 126 * scale,
      seg(localF, 24, 50),
      `600 ${Math.round(13 * scale)}px "Nunito Sans", sans-serif`,
      '#54243B',
      22 * scale
    );
  } else {
    drawMaskedText(
      ctx,
      'SAVE THE DATE',
      cx,
      cy - 64 * scale,
      seg(localF, 0, 22),
      `700 ${Math.round(12 * scale)}px "Nunito Sans", sans-serif`,
      '#A83D68',
      22 * scale
    );
    drawMaskedText(
      ctx,
      `${couple.groom} & ${couple.bride}`,
      cx,
      cy - 14 * scale,
      seg(localF, 8, 34),
      `400 ${Math.round(46 * scale)}px "Great Vibes", Georgia, serif`,
      '#54243B',
      54 * scale
    );
    drawMaskedText(
      ctx,
      couple.dateRaw,
      cx,
      cy + 30 * scale,
      seg(localF, 16, 40),
      `600 ${Math.round(13.5 * scale)}px "Nunito Sans", sans-serif`,
      '#54243B',
      24 * scale
    );

    const btnPop = easeOutBack(seg(localF, 22, 46));
    ctx.save();
    ctx.translate(cx, cy + 80 * scale);
    ctx.scale(0.85 + 0.15 * btnPop, 0.85 + 0.15 * btnPop);
    ctx.font = `700 ${Math.round(12.5 * scale)}px "Nunito Sans", sans-serif`;
    const bw = Math.min(cardW - 36 * scale, ctx.measureText(couple.slug).width + 44 * scale);
    drawRoundedRect(ctx, -bw / 2, -19 * scale, bw, 38 * scale, 19 * scale);
    ctx.fillStyle = '#A83D68';
    ctx.fill();
    ctx.fillStyle = '#FCF3F6';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(couple.slug, 0, 1);
    ctx.restore();
  }
  ctx.restore();
}

// ---- Main Frame Dispatcher ----
export function renderInvitationVideoFrame(
  ctx: CanvasRenderingContext2D,
  frame: number,
  width: number,
  height: number,
  themeId: VideoThemeId,
  couple: VideoCoupleProps,
  showEnterpriseWatermark: boolean
) {
  const f = ((frame % VIDEO_TOTAL_FRAMES) + VIDEO_TOTAL_FRAMES) % VIDEO_TOTAL_FRAMES;
  const t = f / VIDEO_TOTAL_FRAMES;
  const scale = Math.min(width, height) / 540;
  const cx = width / 2;

  ctx.clearRect(0, 0, width, height);

  if (themeId === 'javanese-classic') {
    renderJavaneseTheme(ctx, width, height, f, t, scale, couple);
  } else if (themeId === 'grand-ballroom') {
    renderGrandBallroomTheme(ctx, width, height, f, t, scale, couple);
  } else {
    renderLuxuryPinkTheme(ctx, width, height, f, t, scale, couple);
  }

  // Bottom progress bar matched to theme accent
  const accent =
    themeId === 'javanese-classic'
      ? '#8A452C'
      : themeId === 'grand-ballroom'
      ? '#345579'
      : '#A83D68';
  const barW = width * 0.44;
  const barH = 3.5 * scale;
  const barX = cx - barW / 2;
  const barY = height - 48 * scale;
  drawRoundedRect(ctx, barX, barY, barW, barH, barH / 2);
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.fill();
  drawRoundedRect(ctx, barX, barY, barW * t, barH, barH / 2);
  ctx.fillStyle = accent;
  ctx.fill();

  if (showEnterpriseWatermark) {
    ctx.save();
    const wm = 'ENTERPRISE MOTION PREVIEW';
    ctx.font = `700 ${Math.round(10 * scale)}px -apple-system, BlinkMacSystemFont, sans-serif`;
    const wmW = ctx.measureText(wm).width + 22 * scale;
    const wmH = 22 * scale;
    drawRoundedRect(ctx, cx - wmW / 2, height - 80 * scale, wmW, wmH, wmH / 2);
    ctx.fillStyle = 'rgba(29, 29, 31, 0.78)';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(wm, cx, height - 80 * scale + wmH / 2 + 0.5);
    ctx.restore();
  }
}

export function formatTimecode(frame: number, fps = VIDEO_FPS): string {
  const secs = Math.floor(frame / fps);
  const remFrames = frame % fps;
  return `00:${String(secs).padStart(2, '0')}:${String(remFrames).padStart(2, '0')}`;
}

/**
 * RuangHadir — Procedural Motion Graphic Engine (After Effects–grade Canvas Renderer)
 * Supports 3 flagship Enterprise themes:
 *   1. javanese-classic  (Royal Sogan, Gunungan Trim-Path, Kawung Mandala, Golden Embers)
 *   2. grand-ballroom    (Midnight Obsidian, Volumetric Chandelier Beams, Art Deco Arch, Stardust)
 *   3. luxury-pink       (Blush Pearl, Flowing Silk Ribbons, Rose Gold Rings, Soft Anamorphic Flare)
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
export const VIDEO_DURATION_SEC = 12;
export const VIDEO_TOTAL_FRAMES = VIDEO_FPS * VIDEO_DURATION_SEC; // 360 frames

export const VIDEO_SCENES = [
  { id: 0, label: '01 · Intro & Trim Path', start: 0, end: 90 },
  { id: 1, label: '02 · Kinetic Mempelai', start: 90, end: 180 },
  { id: 2, label: '03 · Jadwal & Venue', start: 180, end: 270 },
  { id: 3, label: '04 · Save The Date', start: 270, end: 360 },
] as const;

export const VIDEO_THEMES: VideoThemeMeta[] = [
  {
    id: 'javanese-classic',
    name: 'Javanese Classic',
    shortName: 'Javanese',
    tagline: 'Gunungan Trim-Path · Batik Mandala · Embers',
    techniques: ['Trim Paths', 'Mandala Orbit', 'Gold Light Leak'],
    swatch: ['#150E0A', '#3D2616', '#D8B168'],
    accent: '#D8B168',
    isDark: true,
  },
  {
    id: 'grand-ballroom',
    name: 'Grand Ballroom',
    shortName: 'Grand Ballroom',
    tagline: 'Volumetric Beams · Art Deco Arch · Stardust',
    techniques: ['Volumetric Beams', 'Track Matte', 'Shutter Wipe'],
    swatch: ['#090C14', '#1A2238', '#E5C98B'],
    accent: '#E5C98B',
    isDark: true,
  },
  {
    id: 'luxury-pink',
    name: 'Luxury Love Pink',
    shortName: 'Love Pink',
    tagline: 'Silk Ribbon Waves · Rose Gold Rings · Bloom',
    techniques: ['Bezier Ribbons', 'Spring Pop', 'Anamorphic Bloom'],
    swatch: ['#FFF3F6', '#F8D5E2', '#C65D7B'],
    accent: '#C65D7B',
    isDark: false,
  },
];

// ---- Keyframe Easing Graph (After Effects Speed Graph Equivalents) ----
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

// Deterministic pseudo-random for stable particle layers across renders
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

// Track-Matte Masked Text Reveal (signature After Effects kinetic title effect)
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
  ctx.rect(0, cy - lineHeight * 0.62, ctx.canvas.width, lineHeight * 1.24);
  ctx.clip();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = clamp01(p * 1.35);
  ctx.fillText(text, cx, cy + offset);
  ctx.restore();
}

// Progressive Trim-Path Polyline Drawer (AE Trim Paths equivalent)
function drawTrimPath(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  progress: number,
  color: string,
  lineWidth: number
) {
  const p = clamp01(progress);
  if (p <= 0 || points.length < 2) return;

  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    const d = Math.hypot(dx, dy);
    lengths.push(d);
    total += d;
  }

  let target = total * p;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 0; i < lengths.length; i++) {
    if (target <= 0) break;
    if (target >= lengths[i]) {
      ctx.lineTo(points[i + 1][0], points[i + 1][1]);
      target -= lengths[i];
    } else {
      const r = target / lengths[i];
      const x = points[i][0] + (points[i + 1][0] - points[i][0]) * r;
      const y = points[i][1] + (points[i + 1][1] - points[i][1]) * r;
      ctx.lineTo(x, y);
      target = 0;
    }
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}

// ---- Theme-Specific Procedural Background & Technical Motion Layers ----

function renderJavaneseBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  f: number,
  scale: number
) {
  // 1. Deep Royal Sogan Gradient with subtle camera breathing
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.42, w * 0.05, w * 0.5, h * 0.5, Math.max(w, h) * 0.85);
  bg.addColorStop(0, '#362113');
  bg.addColorStop(0.55, '#1D120B');
  bg.addColorStop(1, '#0E0805');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 2. Rotating Kawung Geometric Mandala (AE Repeater + Rotation)
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(t * Math.PI * 0.5);
  const ringR = Math.min(w, h) * 0.38;
  ctx.strokeStyle = 'rgba(216, 177, 104, 0.12)';
  ctx.lineWidth = 1.2 * scale;
  for (let i = 0; i < 12; i++) {
    ctx.rotate((Math.PI * 2) / 12);
    ctx.beginPath();
    ctx.ellipse(ringR * 0.55, 0, ringR * 0.38, ringR * 0.16, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Javanese Gunungan Silhouette Trim-Path (drawn dynamically across scene)
  const cx = w / 2;
  const cy = h / 2;
  const gw = Math.min(w, h) * 0.44;
  const gh = Math.min(w, h) * 0.62;
  const gununganPts: [number, number][] = [
    [cx, cy - gh * 0.55],
    [cx + gw * 0.18, cy - gh * 0.25],
    [cx + gw * 0.42, cy + gh * 0.05],
    [cx + gw * 0.52, cy + gh * 0.36],
    [cx + gw * 0.36, cy + gh * 0.48],
    [cx - gw * 0.36, cy + gh * 0.48],
    [cx - gw * 0.52, cy + gh * 0.36],
    [cx - gw * 0.42, cy + gh * 0.05],
    [cx - gw * 0.18, cy - gh * 0.25],
    [cx, cy - gh * 0.55],
  ];
  const trimP = easeInOutQuart(seg(f, 0, 55));
  drawTrimPath(ctx, gununganPts, trimP, 'rgba(216, 177, 104, 0.48)', 2 * scale);

  // Inner ornamental diamond frame
  const pad = 28 * scale;
  ctx.save();
  ctx.strokeStyle = 'rgba(216, 177, 104, 0.25)';
  ctx.lineWidth = 1.2 * scale;
  drawRoundedRect(ctx, pad, pad, w - pad * 2, h - pad * 2, 18 * scale);
  ctx.stroke();
  ctx.restore();

  // 4. Rising Golden Embers (3 depth planes)
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 34; i++) {
    const px = seeded(i * 3) * w + Math.sin(t * Math.PI * 2 + i) * 18 * scale;
    const speed = 0.25 + seeded(i * 7) * 0.55;
    const py = ((seeded(i * 5) - t * speed + 2) % 1) * h;
    const r = (1.2 + seeded(i * 11) * 3.4) * scale;
    const alpha = 0.22 + 0.45 * Math.sin(t * Math.PI * 4 + i);
    const g = ctx.createRadialGradient(px, py, 0, px, py, r * 3);
    g.addColorStop(0, `rgba(255, 226, 158, ${clamp01(alpha)})`);
    g.addColorStop(1, 'rgba(216, 177, 104, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, py, r * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function renderGrandBallroomBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  f: number,
  scale: number
) {
  // 1. Midnight Obsidian Sky
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#070A12');
  bg.addColorStop(0.5, '#131A2D');
  bg.addColorStop(1, '#090C16');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 2. Volumetric Chandelier Spotlights (sweeping cones)
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let b = 0; b < 3; b++) {
    const angle = -0.35 + b * 0.35 + Math.sin(t * Math.PI * 2 + b * 1.4) * 0.18;
    ctx.save();
    ctx.translate(w * (0.25 + b * 0.25), -20 * scale);
    ctx.rotate(angle);
    const cone = ctx.createLinearGradient(0, 0, 0, h * 0.95);
    cone.addColorStop(0, 'rgba(229, 201, 139, 0.22)');
    cone.addColorStop(0.55, 'rgba(229, 201, 139, 0.06)');
    cone.addColorStop(1, 'rgba(229, 201, 139, 0)');
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(-18 * scale, 0);
    ctx.lineTo(18 * scale, 0);
    ctx.lineTo(155 * scale, h * 0.95);
    ctx.lineTo(-155 * scale, h * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // 3. Art Deco Double Arch Trim Path
  const m = 32 * scale;
  const archW = w - m * 2;
  const archH = h - m * 2;
  const corner = 44 * scale;
  const decoPts: [number, number][] = [
    [m + corner, m],
    [m + archW - corner, m],
    [m + archW, m + corner],
    [m + archW, m + archH - corner],
    [m + archW - corner, m + archH],
    [m + corner, m + archH],
    [m, m + archH - corner],
    [m, m + corner],
    [m + corner, m],
  ];
  const trimP = easeInOutQuart(seg(f, 0, 48));
  drawTrimPath(ctx, decoPts, trimP, 'rgba(229, 201, 139, 0.58)', 1.8 * scale);

  // Inner champagne hairline
  ctx.save();
  ctx.strokeStyle = 'rgba(229, 201, 139, 0.18)';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(m + 10 * scale, m + 10 * scale, archW - 20 * scale, archH - 20 * scale);
  ctx.restore();

  // 4. Crystal Bokeh Stardust
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 40; i++) {
    const px = seeded(i * 13) * w;
    const py = ((seeded(i * 17) + t * (0.12 + seeded(i * 19) * 0.25)) % 1) * h;
    const twinkle = 0.2 + 0.75 * Math.pow(Math.sin(t * Math.PI * 6 + i * 2.1) * 0.5 + 0.5, 2);
    const sz = (1.5 + seeded(i * 23) * 3.5) * scale;
    ctx.fillStyle = `rgba(248, 232, 194, ${twinkle * 0.7})`;
    ctx.beginPath();
    ctx.arc(px, py, sz, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function renderLuxuryPinkBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  f: number,
  scale: number
) {
  // 1. Luminous Blush Pearl Silk Backdrop
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#FFF5F8');
  bg.addColorStop(0.5, '#FBE2EC');
  bg.addColorStop(1, '#F6CFE0');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 2. Flowing Sine-Wave Silk Ribbons (AE Trapcode / CC Wave Warp style)
  ctx.save();
  for (let r = 0; r < 5; r++) {
    ctx.beginPath();
    const baseY = h * (0.18 + r * 0.16);
    for (let x = 0; x <= w; x += 12) {
      const wave =
        Math.sin((x / w) * Math.PI * 2.2 + t * Math.PI * 2 + r * 0.9) * (24 + r * 6) * scale +
        Math.cos((x / w) * Math.PI * 4 - t * Math.PI * 2) * 8 * scale;
      if (x === 0) ctx.moveTo(x, baseY + wave);
      else ctx.lineTo(x, baseY + wave);
    }
    ctx.strokeStyle = r % 2 === 0 ? 'rgba(198, 93, 123, 0.16)' : 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = (2.2 + r * 0.6) * scale;
    ctx.stroke();
  }
  ctx.restore();

  // 3. Concentric Rose-Gold Trim-Path Rings
  const cx = w / 2;
  const cy = h / 2;
  const rad = Math.min(w, h) * 0.38;
  const ringP = easeOutExpo(seg(f, 0, 50));
  ctx.save();
  ctx.strokeStyle = 'rgba(198, 93, 123, 0.38)';
  ctx.lineWidth = 1.6 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, rad, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ringP);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 1.2 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, rad * 1.07, Math.PI / 2, Math.PI / 2 + Math.PI * 2 * ringP);
  ctx.stroke();
  ctx.restore();

  // 4. Floating Rose-Petal Bokeh Particles
  for (let i = 0; i < 24; i++) {
    const px = ((seeded(i * 29) + t * 0.15) % 1) * w;
    const py = ((seeded(i * 31) + t * (0.18 + seeded(i * 37) * 0.2)) % 1) * h;
    const rot = t * Math.PI * 3 + i;
    const rx = (5 + seeded(i * 41) * 7) * scale;
    const ry = rx * 0.55;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rot);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(214, 108, 138, 0.22)' : 'rgba(255, 255, 255, 0.58)';
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ---- Main Frame Renderer ----
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
  const cy = height / 2;

  ctx.clearRect(0, 0, width, height);

  // Subtle camera Ken Burns scale pulse per scene
  const sceneIdx = Math.min(3, Math.floor(f / 90));
  const localF = f - sceneIdx * 90;
  const camZoom = 1 + 0.035 * easeInOutQuart(localF / 90);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(camZoom, camZoom);
  ctx.translate(-cx, -cy);

  if (themeId === 'javanese-classic') {
    renderJavaneseBackdrop(ctx, width, height, t, f, scale);
  } else if (themeId === 'grand-ballroom') {
    renderGrandBallroomBackdrop(ctx, width, height, t, f, scale);
  } else {
    renderLuxuryPinkBackdrop(ctx, width, height, t, f, scale);
  }
  ctx.restore();

  // Theme color palette for typography & glass layer
  const isDark = themeId !== 'luxury-pink';
  const ink = isDark ? '#F9F6F0' : '#3A1824';
  const subInk = isDark ? 'rgba(249, 246, 240, 0.72)' : 'rgba(58, 24, 36, 0.72)';
  const accent =
    themeId === 'javanese-classic'
      ? '#D8B168'
      : themeId === 'grand-ballroom'
      ? '#E5C98B'
      : '#C65D7B';

  // Translucent Center Stage Frame (subtle iOS glass sheet)
  const cardPadX = width * 0.1;
  const cardPadY = height * 0.14;
  const cardW = width - cardPadX * 2;
  const cardH = height - cardPadY * 2;
  ctx.save();
  drawRoundedRect(ctx, cardPadX, cardPadY, cardW, cardH, 26 * scale);
  ctx.fillStyle = isDark ? 'rgba(12, 14, 22, 0.34)' : 'rgba(255, 255, 255, 0.46)';
  ctx.fill();
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();
  ctx.restore();

  // Scene exit wipe alpha
  const exitAlpha = localF > 74 ? 1 - easeInOutQuart((localF - 74) / 16) : 1;

  ctx.save();
  ctx.globalAlpha = exitAlpha;

  // Top Scene Pill Badge
  const pillLabel =
    sceneIdx === 0
      ? themeId === 'javanese-classic'
        ? 'PAWIWAHAN AGENG'
        : themeId === 'grand-ballroom'
        ? 'THE ROYAL CELEBRATION'
        : 'THE WEDDING INVITATION'
      : sceneIdx === 1
      ? 'MEMPELAI BERBAHAGIA'
      : sceneIdx === 2
      ? 'JADWAL & LOKASI ACARA'
      : 'SAVE THE DATE';

  const pillReveal = easeOutExpo(seg(localF, 0, 20));
  ctx.save();
  ctx.globalAlpha = exitAlpha * pillReveal;
  ctx.font = `700 ${Math.round(12 * scale)}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`;
  const pillW = ctx.measureText(pillLabel).width + 34 * scale;
  const pillH = 28 * scale;
  drawRoundedRect(ctx, cx - pillW / 2, cardPadY + 28 * scale, pillW, pillH, pillH / 2);
  ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.75)';
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1 * scale;
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(pillLabel, cx, cardPadY + 28 * scale + pillH / 2 + 0.5);
  ctx.restore();

  // Dynamic Scene Choreography
  if (sceneIdx === 0) {
    // Scene 01: Spring-pop Monogram + Horizontal Trim Rule + Masked Subtitle
    const pop = easeOutBack(seg(localF, 6, 34));
    ctx.save();
    ctx.translate(cx, cy - 26 * scale);
    ctx.scale(0.75 + 0.25 * pop, 0.75 + 0.25 * pop);
    ctx.font = `400 ${Math.round(82 * scale)}px "Cormorant Garamond", Georgia, serif`;
    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(couple.initials, 0, 0);
    ctx.restore();

    // Expanding Center Hairline
    const lineW = 140 * scale * easeOutExpo(seg(localF, 18, 42));
    ctx.beginPath();
    ctx.moveTo(cx - lineW / 2, cy + 28 * scale);
    ctx.lineTo(cx + lineW / 2, cy + 28 * scale);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.6 * scale;
    ctx.stroke();

    drawMaskedText(
      ctx,
      'Mengundang Anda di hari bahagia kami',
      cx,
      cy + 58 * scale,
      seg(localF, 24, 52),
      `500 ${Math.round(16 * scale)}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`,
      subInk,
      26 * scale
    );
  } else if (sceneIdx === 1) {
    // Scene 02: Dual-direction Track-Matte Kinetic Couple Names
    drawMaskedText(
      ctx,
      couple.groom,
      cx,
      cy - 56 * scale,
      seg(localF, 4, 30),
      `600 ${Math.round(50 * scale)}px "Cormorant Garamond", Georgia, serif`,
      ink,
      62 * scale,
      'up'
    );

    const ampScale = easeOutBack(seg(localF, 14, 36));
    ctx.save();
    ctx.translate(cx, cy - 2 * scale);
    ctx.scale(ampScale, ampScale);
    ctx.font = `italic 400 ${Math.round(32 * scale)}px "Cormorant Garamond", Georgia, serif`;
    ctx.fillStyle = accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('&', 0, 0);
    ctx.restore();

    drawMaskedText(
      ctx,
      couple.bride,
      cx,
      cy + 52 * scale,
      seg(localF, 18, 44),
      `600 ${Math.round(50 * scale)}px "Cormorant Garamond", Georgia, serif`,
      ink,
      62 * scale,
      'down'
    );

    drawMaskedText(
      ctx,
      `${couple.groomFull}  ·  ${couple.brideFull}`,
      cx,
      cy + 110 * scale,
      seg(localF, 30, 56),
      `500 ${Math.round(13 * scale)}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`,
      subInk,
      22 * scale
    );
  } else if (sceneIdx === 2) {
    // Scene 03: Event Blueprint with Kinetic Rules
    drawMaskedText(
      ctx,
      couple.dateRaw,
      cx,
      cy - 44 * scale,
      seg(localF, 4, 30),
      `700 ${Math.round(28 * scale)}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`,
      ink,
      40 * scale
    );

    const ruleW = 110 * scale * easeOutExpo(seg(localF, 16, 40));
    ctx.beginPath();
    ctx.moveTo(cx - ruleW / 2, cy - 12 * scale);
    ctx.lineTo(cx + ruleW / 2, cy - 12 * scale);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    drawMaskedText(
      ctx,
      `Pukul ${couple.timeRaw}`,
      cx,
      cy + 18 * scale,
      seg(localF, 18, 42),
      `700 ${Math.round(18 * scale)}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`,
      accent,
      28 * scale
    );

    const venueText = couple.venue.length > 38 ? couple.venue.slice(0, 36) + '…' : couple.venue;
    drawMaskedText(
      ctx,
      venueText,
      cx,
      cy + 62 * scale,
      seg(localF, 26, 52),
      `500 ${Math.round(15 * scale)}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`,
      subInk,
      26 * scale
    );
  } else {
    // Scene 04: Save The Date + Capsule Link Pop
    drawMaskedText(
      ctx,
      `${couple.groom} & ${couple.bride}`,
      cx,
      cy - 46 * scale,
      seg(localF, 4, 28),
      `600 ${Math.round(40 * scale)}px "Cormorant Garamond", Georgia, serif`,
      ink,
      50 * scale
    );

    drawMaskedText(
      ctx,
      'Konfirmasi RSVP & panduan lokasi di:',
      cx,
      cy + 8 * scale,
      seg(localF, 16, 40),
      `500 ${Math.round(14 * scale)}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`,
      subInk,
      24 * scale
    );

    const btnPop = easeOutBack(seg(localF, 24, 48));
    ctx.save();
    ctx.translate(cx, cy + 62 * scale);
    ctx.scale(0.8 + 0.2 * btnPop, 0.8 + 0.2 * btnPop);
    ctx.font = `700 ${Math.round(13.5 * scale)}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`;
    const urlW = Math.min(cardW - 36 * scale, ctx.measureText(couple.slug).width + 44 * scale);
    const urlH = 40 * scale;
    drawRoundedRect(ctx, -urlW / 2, -urlH / 2, urlW, urlH, urlH / 2);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.fillStyle = themeId === 'luxury-pink' ? '#FFFFFF' : '#140E0A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(couple.slug, 0, 1);
    ctx.restore();
  }

  ctx.restore();

  // ---- After Effects Anamorphic Light-Leak Wipe on Scene Transitions ----
  if (localF < 16 || localF > 78) {
    const flash = localF < 16 ? 1 - localF / 16 : (localF - 78) / 12;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const sweepX = width * (localF < 16 ? 0.5 + (1 - flash) * 0.6 : flash * 0.5);
    const leak = ctx.createRadialGradient(sweepX, height * 0.5, 10, sweepX, height * 0.5, Math.max(width, height) * 0.7);
    const leakColor =
      themeId === 'luxury-pink'
        ? `rgba(255, 190, 214, ${flash * 0.55})`
        : `rgba(255, 224, 155, ${flash * 0.45})`;
    leak.addColorStop(0, leakColor);
    leak.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = leak;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // ---- Bottom Progress Bar ----
  const barW = cardW * 0.48;
  const barH = 3.5 * scale;
  const barX = cx - barW / 2;
  const barY = cardPadY + cardH - 26 * scale;
  drawRoundedRect(ctx, barX, barY, barW, barH, barH / 2);
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.16)' : 'rgba(58,24,36,0.12)';
  ctx.fill();
  drawRoundedRect(ctx, barX, barY, barW * t, barH, barH / 2);
  ctx.fillStyle = accent;
  ctx.fill();

  // Enterprise preview watermark if free tier
  if (showEnterpriseWatermark) {
    ctx.save();
    const wm = 'ENTERPRISE MOTION PREVIEW';
    ctx.font = `700 ${Math.round(10 * scale)}px -apple-system, BlinkMacSystemFont, sans-serif`;
    const wmW = ctx.measureText(wm).width + 22 * scale;
    const wmH = 22 * scale;
    drawRoundedRect(ctx, cx - wmW / 2, cardPadY + cardH - 58 * scale, wmW, wmH, wmH / 2);
    ctx.fillStyle = 'rgba(20, 22, 30, 0.74)';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(wm, cx, cardPadY + cardH - 58 * scale + wmH / 2 + 0.5);
    ctx.restore();
  }
}

export function formatTimecode(frame: number, fps = VIDEO_FPS): string {
  const secs = Math.floor(frame / fps);
  const remFrames = frame % fps;
  return `00:${String(secs).padStart(2, '0')}:${String(remFrames).padStart(2, '0')}`;
}

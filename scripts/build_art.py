#!/usr/bin/env python3
"""
Bangun aset lukisan untuk Theme Kit dari sumber resolusi tinggi di public/assets.
Hasil di public/assets/art/*.webp (ukuran web, alpha dipertahankan).

- buket mawar diwarnai ulang (blush, ivory, burgundy, peach, lavender, dusty-blue, coral)
  dengan menggeser hue kelopak saja (daun hijau tidak berubah)
- buket putih-emas, daun, gunungan
- lukisan cat air: versi penuh + potongan latar depan berpinggir lembut untuk paralaks
"""
from pathlib import Path
import colorsys
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent / 'public' / 'assets'
OUT = ROOT / 'art'
OUT.mkdir(exist_ok=True)


def save(im, name, w):
    im = im.copy()
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(OUT / f'{name}.webp', 'WEBP', quality=82, method=6)
    print(name, im.size, (OUT / f'{name}.webp').stat().st_size // 1024, 'KB')


def recolor(im, hue_deg, sat_mul=1.0, val_add=0.0, sat_set=None):
    a = np.asarray(im.convert('RGBA')).astype(np.float32) / 255.0
    rgb, al = a[..., :3], a[..., 3]
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(-1), rgb.min(-1)
    v = mx
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    d = np.maximum(mx - mn, 1e-6)
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) / 6.0
    hd = h * 360
    green = (hd > 55) & (hd < 175) & (s > 0.12)  # daun & batang
    petal = (~green) & (al > 0.05) & (s > 0.08)
    nh = np.where(petal, hue_deg / 360.0, h)
    ns = np.where(petal, (np.full_like(s, sat_set) if sat_set is not None else np.clip(s * sat_mul, 0, 1)), s)
    nv = np.where(petal, np.clip(v + val_add, 0, 1), v)
    # hsv -> rgb
    i = np.floor(nh * 6).astype(int) % 6
    f = nh * 6 - np.floor(nh * 6)
    p = nv * (1 - ns)
    q = nv * (1 - f * ns)
    t = nv * (1 - (1 - f) * ns)
    out = np.zeros_like(rgb)
    for k, (x, y, z) in enumerate([(nv, t, p), (q, nv, p), (p, nv, t), (p, q, nv), (t, p, nv), (nv, p, q)]):
        m = i == k
        out[..., 0][m], out[..., 1][m], out[..., 2][m] = x[m], y[m], z[m]
    res = np.dstack([out, al])
    return Image.fromarray((res * 255).astype(np.uint8), 'RGBA')


def feather_bottom_crop(im, top_frac, feather_frac=0.08):
    """Ambil bagian bawah lukisan mulai top_frac, dengan tepi atas memudar (untuk lapisan depan)."""
    im = im.convert('RGBA')
    w, h = im.size
    y0 = int(h * top_frac)
    crop = im.crop((0, y0, w, h))
    a = np.asarray(crop).copy()
    fh = max(1, int(h * feather_frac))
    ramp = np.linspace(0, 1, fh)[:, None]
    a[:fh, :, 3] = (a[:fh, :, 3].astype(np.float32) * ramp).astype(np.uint8)
    return Image.fromarray(a, 'RGBA')


rose = Image.open(ROOT / 'spoti-flower.webp').convert('RGBA')
save(rose, 'bouquet-rose', 900)
for name, hue, kw in [
    ('bouquet-blush', 345, dict(sat_mul=0.75, val_add=0.06)),
    ('bouquet-ivory', 38, dict(sat_set=0.08, val_add=0.22)),
    ('bouquet-burgundy', 345, dict(sat_mul=1.2, val_add=-0.12)),
    ('bouquet-peach', 22, dict(sat_mul=0.85, val_add=0.05)),
    ('bouquet-lavender', 280, dict(sat_mul=0.55, val_add=0.05)),
    ('bouquet-dustyblue', 212, dict(sat_mul=0.45, val_add=0.06)),
    ('bouquet-coral', 8, dict(sat_mul=1.0, val_add=0.02)),
]:
    save(recolor(rose, hue, **kw), name, 900)

save(Image.open(ROOT / 'flower.webp').convert('RGBA'), 'bouquet-gold', 900)
save(Image.open(ROOT / 'spoti-leaves.webp').convert('RGBA'), 'leaves', 1200)
save(Image.open(ROOT / 'wayang' / 'gunungan.png').convert('RGBA'), 'gunungan', 900)

for scene, cut in [('bg-sky-day', None), ('bg-meadow', 0.52), ('bg-house', 0.42), ('bg-village', 0.5), ('bg-night', 0.62)]:
    im = Image.open(ROOT / 'storybook' / f'{scene}.webp').convert('RGB')
    save(im, scene.replace('bg-', 'wc-'), 900)
    if cut:
        save(feather_bottom_crop(im, cut), scene.replace('bg-', 'wc-') + '-front', 900)

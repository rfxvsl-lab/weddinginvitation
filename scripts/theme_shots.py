#!/usr/bin/env python3
"""
Screenshot tema untuk katalog + QA.

Pemakaian (server harus jalan di localhost:3000, mis. `npm run dev`):
    python3 scripts/theme_shots.py sage-garden            # katalog + QA
    python3 scripts/theme_shots.py sage-garden --qa-only  # hanya QA

Hasil:
  public/assets/themes/shots/<id>.webp   — thumbnail katalog (hero setelah dibuka, 585×1266)
  /tmp/theme-qa/<id>/*.png               — sampul, setelah dibuka, dan halaman penuh
Keluar dengan kode 1 bila ada error konsol / halaman gagal dibuka.
"""
import asyncio, os, sys, urllib.request
from pathlib import Path
from playwright.async_api import async_playwright
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BASE = os.environ.get('BASE_URL', 'http://localhost:3000')
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
HIDE = "nextjs-portal{display:none!important} a[href='/preview']{display:none!important} [data-demo-badge]{display:none!important}"


async def run(theme_id: str, qa_only: bool) -> int:
    qa = Path('/tmp/theme-qa') / theme_id
    qa.mkdir(parents=True, exist_ok=True)
    errors: list[str] = []
    launch = {'executable_path': CHROME, 'args': ['--no-sandbox']} if Path(CHROME).exists() else {}
    if os.environ.get('HTTPS_PROXY'):
        launch['proxy'] = {'server': os.environ['HTTPS_PROXY'], 'bypass': 'localhost,127.0.0.1'}
    async with async_playwright() as p:
        b = await p.chromium.launch(**launch)
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1.5)
        await ctx.add_init_script(
            "document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=%r;document.head.appendChild(s)})" % HIDE
        )
        # Foto contoh di Google (lh3) diambil lewat Python agar tidak terblokir proxy browser
        cache: dict[str, bytes] = {}

        async def via_python(route):
            url = route.request.url
            try:
                if url not in cache:
                    cache[url] = await asyncio.to_thread(lambda: urllib.request.urlopen(url, timeout=30).read())
                await route.fulfill(status=200, body=cache[url], headers={'content-type': 'image/jpeg', 'access-control-allow-origin': '*'})
            except Exception:
                await route.continue_()

        await ctx.route('**/lh3.googleusercontent.com/**', via_python)
        pg = await ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
        pg.on('console', lambda m: errors.append(f'console: {m.text}') if m.type == 'error' and 'favicon' not in m.text and 'Failed to load resource' not in m.text else None)
        res = await pg.goto(f'{BASE}/preview/{theme_id}', wait_until='load', timeout=120000)
        if not res or res.status >= 400:
            print('FAIL: halaman tidak bisa dibuka', res and res.status)
            return 1
        await pg.wait_for_timeout(3500)
        cover = qa / '1-cover.png'
        await pg.screenshot(path=str(cover))

        # Undangan dirender di dalam iframe (srcdoc) → bekerja di frame tersebut
        fr = pg.frames[1] if len(pg.frames) > 1 else pg.main_frame
        btn = fr.locator('[data-kit-open]')
        if await btn.count():
            await btn.first.click()
            await pg.wait_for_timeout(2200)
        else:
            errors.append('missing: tombol buka sampul')
        await pg.wait_for_timeout(1500)
        opened = qa / '2-opened.png'
        await pg.screenshot(path=str(opened))
        if not qa_only:
            # thumbnail katalog = layar pertama setelah undangan dibuka (hero)
            out = ROOT / 'public/assets/themes/shots' / f'{theme_id}.webp'
            Image.open(opened).convert('RGB').save(out, 'WEBP', quality=82, method=6)
            print('katalog →', out.relative_to(ROOT))

        # gulir per layar di dalam frame; simpan tiap layar lalu gabungkan jadi lembar kontak
        # cari elemen yang benar-benar bisa digulir (window atau kontainer overflow)
        await fr.evaluate('''() => {
          const all = [document.scrollingElement, ...document.querySelectorAll('*')];
          let best = document.scrollingElement, gap = best.scrollHeight - best.clientHeight;
          for (const el of all) {
            const cs = getComputedStyle(el);
            if (!/(auto|scroll)/.test(cs.overflowY) && el !== document.scrollingElement) continue;
            const g = el.scrollHeight - el.clientHeight;
            if (g > gap) { gap = g; best = el; }
          }
          window.__sc = best;
        }''')
        parts = []
        y, i = 0, 0
        while True:
            await fr.evaluate(f'window.__sc.scrollTo(0,{y})')
            await pg.wait_for_timeout(1800)
            path = qa / f'3-part-{i:02d}.png'
            await pg.screenshot(path=str(path))
            parts.append(path)
            h = await fr.evaluate('window.__sc.scrollHeight')
            vh = await fr.evaluate('window.__sc.clientHeight')
            if y + vh >= h or i > 30:
                break
            y += vh - 60
            i += 1
        ims = [Image.open(x) for x in parts]
        w, hh = ims[0].size
        cols = 4
        rows = (len(ims) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * w // 2, rows * hh // 2), 'white')
        for k, im in enumerate(ims):
            sheet.paste(im.resize((w // 2, hh // 2)), ((k % cols) * w // 2, (k // cols) * hh // 2))
        sheet.save(qa / '4-sheet.png')

        # tema Spesial: potret tiap bab saat tepi atasnya sejajar layar
        chapters = await fr.evaluate("[...document.querySelectorAll('[data-chapter]')].map(e => e.dataset.chapter)")
        if chapters:
            shots = []
            for ch in chapters:
                await fr.evaluate(f"document.querySelector('[data-chapter={ch}]').scrollIntoView()")
                await pg.wait_for_timeout(1500)
                path = qa / f'5-ch-{ch}.png'
                await pg.screenshot(path=str(path))
                shots.append(path)
            ims = [Image.open(x) for x in shots]
            w, hh = ims[0].size
            cols = 5
            rows = (len(ims) + cols - 1) // cols
            sheet = Image.new('RGB', (cols * w // 2, rows * hh // 2), 'white')
            for k, im in enumerate(ims):
                sheet.paste(im.resize((w // 2, hh // 2)), ((k % cols) * w // 2, (k // cols) * hh // 2))
            sheet.save(qa / '5-chapters.png')

        # cek fitur wajib
        checks = {
            'rsvp form': 'form textarea',
            'tombol peta': 'a[href*="maps"]',
            'tombol kalender': 'a[href*="calendar.google.com"]',
            'galeri': 'img[alt^="Galeri"]',
            'salin rekening': 'button:has-text("Salin")',
        }
        for name, sel in checks.items():
            n = await fr.locator(sel).count()
            print(f"{'ok ' if n else 'MISSING'} {name} ({n})")
            if not n:
                errors.append(f'missing: {name}')
        await b.close()
    print('QA →', qa)
    for e in errors:
        print('ERR', e)
    return 1 if errors else 0


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(asyncio.run(run(sys.argv[1], '--qa-only' in sys.argv)))

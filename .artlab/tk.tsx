import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'fs';
import { SCENES, TK_KEYFRAMES, lift, type Layer } from '../src/themes/catalog/taman-kertas.scenes';
import { PaperDefs } from '../src/themes/catalog/taman-kertas.art';

const ids = (process.argv[2] || 'hero,quote,couple,countdown,events,story,gallery,gift,rsvp,closing').split(',');
const layer = (l: Layer, i: number) => (
  <div key={i} style={{ position: 'absolute', left: '-10%', right: '-10%', top: '-14%', bottom: '-14%' }}>
    {l.svg && (
      <svg viewBox="0 0 400 800" preserveAspectRatio={l.anchor === 'top' ? 'xMidYMin slice' : 'xMidYMax slice'} width="100%" height="100%" style={{ display: 'block', overflow: 'visible', filter: lift(l.lift ?? 0.3) }}>
        {l.svg}
      </svg>
    )}
    {l.html}
  </div>
);
for (const id of ids) {
  const s = (SCENES as any)[id];
  const html = renderToStaticMarkup(
    <html>
      <body style={{ margin: 0 }}>
        <style>{TK_KEYFRAMES}</style>
        <PaperDefs />
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: `linear-gradient(180deg, ${s.sky[0]}, ${s.sky[1]})` }}>
          {s.back.map(layer)}
          <div style={{ position: 'absolute', left: 0, right: 0, top: '30%', textAlign: 'center', fontFamily: 'Georgia', fontSize: 44, color: id === 'closing' ? '#FFF6E8' : '#4A3340' }}>Rian &amp; Salsa</div>
          {s.front.map(layer)}
        </div>
      </body>
    </html>
  );
  writeFileSync(`.artlab/tk-${id}.html`, '<!doctype html>' + html);
}

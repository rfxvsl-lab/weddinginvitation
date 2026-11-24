import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'fs';
import { stageLayers, PasundanCover } from '../src/themes/catalog/sunda-kujang.stage';
import { mix } from '../src/themes/kit/scene';
import theme from '../src/themes/catalog/sunda-kujang';

const variants = [{ id: 'default', palette: {} }, ...(theme.variants || []).slice(1)];
for (const v of variants) {
  const p = { ...theme.palette, ...v.palette };
  const sky = `linear-gradient(180deg, ${mix(p.bg, '#000000', 0.3)} 0%, ${mix(p.bg, '#2F5A55', 0.55)} 36%, ${mix('#E9C989', p.bg, 0.18)} 58%, ${p.bg} 86%)`;
  const stage = renderToStaticMarkup(
    <html><body style={{ margin: 0 }}>
      <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: sky }}>
        {stageLayers(p).map((l, i) => (
          <div key={i} style={{ position: 'absolute', left: '-10%', right: '-10%', top: '-14%', bottom: '-14%' }}>
            <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>{l.svg}</svg>
          </div>
        ))}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '13%', textAlign: 'center', fontFamily: 'Georgia', fontSize: 72, lineHeight: 1, color: '#F6EBCB' }}>Rian<br/><span style={{fontSize:28}}>&amp;</span><br/>Salsa</div>
      </div>
    </body></html>
  );
  writeFileSync(`.artlab/psd-stage-${v.id}.html`, '<!doctype html>' + stage);
  const cover = renderToStaticMarkup(
    <html><body style={{ margin: 0 }}>
      <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: p.cover }}>
        <PasundanCover palette={p as any} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '40%', textAlign: 'center', fontFamily: 'Georgia', fontSize: 44, color: '#F1EAD6' }}>Rian &amp; Salsa<br/><span style={{fontSize:16}}>Kepada Yth. Tamu Undangan</span></div>
      </div>
    </body></html>
  );
  writeFileSync(`.artlab/psd-cover-${v.id}.html`, '<!doctype html>' + cover);
}

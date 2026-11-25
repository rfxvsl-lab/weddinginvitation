/** Direct-entry SSR integration: real pages must load their own styled marketing shell. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import cp from 'node:child_process';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const files={home:'src/app/(marketing)/page.tsx',catalog:'src/app/(marketing)/preview/page.tsx',refund:'src/app/(marketing)/refund-policy/page.tsx',privacy:'src/app/(marketing)/privacy-policy/page.tsx',cookie:'src/app/(marketing)/cookie-policy/page.tsx',terms:'src/app/(marketing)/terms-of-service/page.tsx',notFound:'src/app/not-found.tsx'};
const result=await build({stdin:{contents:Object.entries(files).map(([name,path])=>`export {default as ${name}} from './${path}';`).join('\n'),resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',external:['react','react-dom/server'],loader:{'.css':'empty'},plugins:[{name:'next-ssr-test',setup(b){
 b.onResolve({filter:/^next\/(link|image|navigation)$/},a=>({path:a.path,namespace:'test'}));
 b.onLoad({filter:/.*/,namespace:'test'},a=>({loader:'js',contents:a.path==='next/navigation'?`export const usePathname=()=>'/refund-policy';`:`import React from 'react'; export default function Component({children,fill,sizes,priority,...props}){return React.createElement('${a.path==='next/link'?'a':'img'}',props,children)}`}));
}}]});
const mod={exports:{}};new Function('require','module','exports',result.outputFiles[0].text)(createRequire(import.meta.url),mod,mod.exports);
for(const [name,Component] of Object.entries(mod.exports)){
 const html=renderToStaticMarkup(React.createElement(Component));
 // React may prepend image preload hints before the page root.
 assert.match(html,/<div class="saas-scope rh-product rh-marketing min-h-screen [^"]*">/,`${name} owns scope on direct render`);
 assert.match(html,/class="rh-landing-nav"/);assert.match(html,/class="rh-landing-footer"/);
 if(name==='catalog'){assert.equal((html.match(/class="rh-theme-card"/g)||[]).length,13);assert.match(html,/<h1/);}
 if(name==='home')assert.equal((html.match(/class="rh-theme-card"/g)||[]).length,6);
 if(['refund','privacy','cookie','terms'].includes(name))assert.match(html,/saas-doc/);
}
const surface=fs.readFileSync('src/components/landing/MarketingSurface.tsx','utf8');assert.match(surface,/import "\.\/marketing\.css"/,'scope and stylesheet share one dependency');
const sources=cp.execFileSync('rg',['-l','LandingNav|LandingFooter','src','--glob','*.tsx'],{encoding:'utf8'}).trim().split('\n').filter(p=>!p.endsWith('/LandingNav.tsx')&&!p.endsWith('/LandingFooter.tsx'));
for(const p of sources)assert.match(fs.readFileSync(p,'utf8'),/<MarketingSurface/,'new chrome consumers must use styled shell: '+p);
for(const p of Object.values(files).filter(p=>/policy|terms-of-service/.test(p)))assert.equal(fs.readFileSync(p,'utf8'),cp.execFileSync('git',['show',`origin/main:${p}`],{encoding:'utf8'}),'legal policy content unchanged');
for(const p of ['src/app/(marketing)/preview/[themeId]/page.tsx','src/app/(marketing)/layout.tsx'])assert.equal(fs.readFileSync(p,'utf8'),cp.execFileSync('git',['show',`origin/main:${p}`],{encoding:'utf8'}),'shared route group / invitation demo not scoped');
console.log('PASS: actual home/catalog/four legal/404 direct-entry SSR owns CSS scope; all chrome consumers covered; catalog13/home6; legal contents and invitation routes unchanged.');
console.log('Limit: mocked Next primitives/static SSR; geometry, CSS delivery, menu interaction and route navigation need browser QA.');

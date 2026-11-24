/** Actual overview with in-memory projects and controlled clipboard; no backend. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import React from 'react';
import { act, create } from 'react-test-renderer';
const compiled=(await build({entryPoints:['src/components/DashboardOverview.tsx'],bundle:true,write:false,platform:'node',format:'cjs',external:['react'],jsx:'automatic'})).outputFiles[0].text;
const mod={exports:{}};
new Function('require','module','exports',compiled)(createRequire(import.meta.url),mod,mod.exports);
const Overview=mod.exports.default;
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const navigation=[],published=[];
const props={user:{id:'review',packageId:'free'},weddingData:{couple:{groom:{fullName:'Rian',nickname:'Rian'},bride:{fullName:'Salsa',nickname:'Salsa'}},events:{akad:{enabled:false,date:'2026-12-01'},resepsi:{enabled:false,date:'2026-12-02'}},gallery:[]},invitation:{id:'one',slug:'one',isPublished:false,themeId:'sage-garden'},guests:[],rsvps:[],analytics:{viewsCount:0,totalGuestsAttending:0},onNavigate:segment=>navigation.push(segment),onPublish:()=>published.push(true)};
let view;
await act(async()=>{view=create(React.createElement(Overview,props))});
const button=label=>view.root.findAllByType('button').find(n=>n.children.includes(label));
const click=async label=>{const n=button(label);assert.ok(n,`Button ${label} exists`);await act(async()=>{await n.props.onClick()})};
if(!process.argv.includes('--copy-only')){
  assert.ok(view.root.findByProps({'aria-label':'Lengkapi Tanggal acara'}),'disabled dates must not count as complete');
  assert.equal(view.root.findByProps({role:'progressbar'}).props['aria-valuenow'],20);
  for(const event of [{enabled:true,date:'2026-12-01'},{date:'2026-12-01'}]){
    await act(async()=>view.update(React.createElement(Overview,{...props,weddingData:{...props.weddingData,events:{...props.weddingData.events,resepsi:event}}})));
    assert.ok(view.root.findByProps({'aria-label':'Edit Tanggal acara'}),'enabled or legacy-enabled dated event counts');
  }
  await act(async()=>view.update(React.createElement(Overview,{...props,weddingData:{...props.weddingData,events:{akad:{enabled:true,date:'   '},resepsi:{enabled:false,date:'2026-12-02'}}}})));
  assert.ok(view.root.findByProps({'aria-label':'Lengkapi Tanggal acara'}),'blank enabled date does not count');
}
let calls=[];
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async url=>calls.push(url)}}});
await click('Salin tautan');
assert.ok(button('Tersalin'));
const second={...props,invitation:{...props.invitation,id:'two',slug:'two'},publicSlug:'two'};
await act(async()=>view.update(React.createElement(Overview,second)));
assert.ok(button('Salin tautan'),'switching project must clear copied state');
let settleOld,settleNew;
navigator.clipboard.writeText=()=>new Promise(resolve=>{settleOld=resolve});
let old;
await act(async()=>{old=button('Salin tautan').props.onClick()});
await act(async()=>view.update(React.createElement(Overview,{...props,publicSlug:'three'})));
assert.ok(button('Salin tautan'));
await act(async()=>{settleOld();await old});
assert.ok(button('Salin tautan'),'old clipboard result must not label new URL copied');
// Two attempts on the same URL: the latest failure must survive an earlier late success.
navigator.clipboard.writeText=()=>new Promise(resolve=>{settleOld=resolve});
await act(async()=>{old=button('Salin tautan').props.onClick()});
navigator.clipboard.writeText=()=>new Promise((_resolve,reject)=>{settleNew=reject});
let recent;
await act(async()=>{recent=button('Salin tautan').props.onClick()});
await act(async()=>{settleNew(Error('denied'));await recent});
assert.ok(view.root.findByProps({role:'alert'}));
await act(async()=>{settleOld();await old});
assert.ok(view.root.findByProps({role:'alert'}),'late success must not hide latest failure');
delete navigator.clipboard;
await click('Salin tautan');
assert.ok(view.root.findByProps({role:'alert'}));
navigator.clipboard={writeText:async url=>calls.push(url)};
await click('Salin tautan');
assert.equal(calls.at(-1),'https://ruanghadir.net/three');
assert.equal(view.root.findAllByProps({role:'alert'}).length,0);
await click('Terbitkan undangan');
assert.equal(published.length,1);
await act(async()=>view.update(React.createElement(Overview,{...second,invitation:{...second.invitation,isPublished:true}})));
assert.equal(view.root.findAllByType('a').find(n=>n.children.includes('Buka')).props.href,'/two');
assert.ok(button('Salin tautan'));
await click('Bagikan undangan');
assert.equal(published.length,2,'existing publication modal callback preserved');
await act(async()=>view.unmount());
console.log('PASS: active-session checklist; clipboard success/failure/unavailable, project switches and stale results; publication callbacks unchanged.');
console.log('Limit: isolated React checks, no browser layout/physical gestures or publication persistence.');

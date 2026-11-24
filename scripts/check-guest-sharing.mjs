/** Actual GuestManager interactions with isolated auth/API; no messages or accounts. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { build } from 'esbuild';
import React from 'react';
import { act, create } from 'react-test-renderer';
const require = createRequire(import.meta.url);
const compiled = (await build({
  entryPoints: [path.resolve('src/components/GuestManager.tsx')], bundle: true,
  write: false, platform: 'node', format: 'cjs', jsx: 'automatic',
  external: ['react', 'qrcode'],
  plugins: [{name: 'isolated-guest-dependencies', setup(builder) {
    builder.onResolve({filter: /(?:hooks\/useAuth|hooks\/useAlertModal|lib\/api|QrCheckInScanner)$/}, args => ({path: args.path, namespace: 'test'}));
    builder.onLoad({filter: /.*/, namespace: 'test'}, args => ({loader:'js', contents:
      args.path.endsWith('useAuth') ? 'export const useAuth=()=>({currentUser:{packageId:"free"}});' :
      args.path.endsWith('useAlertModal') ? 'export const useAlertModal=()=>({warning(){},upgrade(){}});' :
      args.path.endsWith('QrCheckInScanner') ? 'export default function Scanner(){return null}' :
      'export const checkInGuest=async()=>{throw Error("Check-in outside test scope")};'
    }));
  }}],
})).outputFiles[0].text;
const mod = {exports:{}};
new Function('require','module','exports',compiled)(require,mod,mod.exports);
const GuestManager = mod.exports.default;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const updates=[], added=[], opened=[], copied=[];
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async text=>{copied.push(text)}}}});
globalThis.window = {open: (...args)=>{opened.push(args); return null}};
let exported;
const oldCreateURL=URL.createObjectURL;
URL.createObjectURL=blob=>{exported=blob;return 'blob:test'};
globalThis.document={body:{appendChild(){},removeChild(){}},createElement:()=>({setAttribute(){},click(){}})};
const base={id:'g1',name:'Budi & Sari',phoneNumber:'0812-3456-7890',group:'Keluarga',paxLimit:2,invitationCode:'TEST',status:'Draft'};
const props={guests:[base],appUrl:'https://example.test',slug:'contoh',coupleNames:'Rani & Dimas',onAddGuest:g=>added.push(g),onRemoveGuest(){},onUpdateGuestStatus:(...args)=>updates.push(args)};
let view;
await act(async()=>{view=create(React.createElement(GuestManager,props))});
const node = label=>view.root.findByProps({'aria-label':label});
const text = ()=>JSON.stringify(view.toJSON());
const click = async label=>{await act(async()=>{await node(label).props.onClick()})};
await click('Salin tautan untuk Budi & Sari');
assert.equal(copied[0],'https://example.test/contoh?to=Budi%20%26%20Sari&code=TEST');
assert.match(text(),/tersalin/);
assert.deepEqual(updates,[], 'copy must not invent delivery status');
navigator.clipboard.writeText=async()=>{throw Error('denied')};
await click('Salin tautan untuk Budi & Sari');
assert.match(text(),/belum bisa disalin otomatis/);
assert.equal(view.root.findByProps({id:'guest-share-link'}).props.value,copied[0]);
delete navigator.clipboard;
await click('Salin tautan untuk Budi & Sari');
assert.match(text(),/belum bisa disalin otomatis/,'unavailable API also provides fallback');
await click('Buka WhatsApp untuk Budi & Sari');
assert.equal(new URL(opened[0][0]).pathname,'/6281234567890');
assert.match(new URL(opened[0][0]).searchParams.get('text'),/Budi & Sari/);
assert.equal(opened[0][2],'noopener,noreferrer');
assert.match(text(),/belum dapat memverifikasi/);
for (const phoneNumber of ['', 'tidak ada', '08123?text=injected', '123']) {
  await act(async()=>view.update(React.createElement(GuestManager,{...props,guests:[{...base,phoneNumber}]})));
  await click('Buka WhatsApp untuk Budi & Sari');
  assert.equal(opened.length,1,'invalid/missing phone must not open a recipient');
  assert.match(text(),/belum diisi atau formatnya/);
}
for (const [phoneNumber, expected] of [['+62 (812) 3456-7890','6281234567890'],['+65 8123 4567','6581234567']]) {
  await act(async()=>view.update(React.createElement(GuestManager,{...props,guests:[{...base,phoneNumber}]})));
  await click('Buka WhatsApp untuk Budi & Sari');
  assert.equal(new URL(opened.at(-1)[0]).pathname,`/${expected}`);
}
// Late clipboard completion must not replace feedback for a later WhatsApp action.
let resolveCopy;
navigator.clipboard={writeText:()=>new Promise(resolve=>{resolveCopy=resolve})};
let pending;
await act(async()=>{pending=node('Salin tautan untuk Budi & Sari').props.onClick()});
await click('Buka WhatsApp untuk Budi & Sari');
await act(async()=>{resolveCopy();await pending});
assert.match(view.root.findByProps({role:'status'}).children.join(''),/Lanjutkan pengiriman/);
await act(async()=>node('Cari nama tamu atau nomor telepon').props.onChange({target:{value:'Tidak cocok'}}));
assert.match(text(),/Tidak ada tamu yang cocok/);
await act(async()=>node('Filter grup tamu').props.onChange({target:{value:'Sahabat'}}));
await act(async()=>view.root.findAllByType('button').find(n=>n.children.includes('Hapus pencarian dan filter')).props.onClick());
assert.equal(node('Filter grup tamu').props.value,'Semua');
assert.equal(node('Cari nama tamu atau nomor telepon').props.value,'');
await act(async()=>view.root.findByProps({'aria-controls':'guest-add-form'}).props.onClick());
await act(async()=>view.root.findByProps({id:'guest-name'}).props.onChange({target:{value:'  Tamu baru  '}}));
await act(async()=>view.root.findByProps({id:'guest-add-form'}).props.onSubmit({preventDefault(){}}));
assert.equal(added[0].name,'Tamu baru');
assert.equal(added[0].phoneNumber,'','optional phone must remain empty');
assert.equal(added[0].status,'Draft');
await act(async()=>view.update(React.createElement(GuestManager,{...props,guests:[{...base,status:'Opened'},{...base,id:'g2',status:'Sent'}]})));
assert.match(text(),/Catatan interaksi/);
assert.match(text(),/Catatan berbagi/);
await act(async()=>view.root.findAllByType('button').find(n=>n.props.title?.startsWith('Ekspor daftar tamu')).props.onClick());
const csv=await exported.text();
assert.match(csv,/Catatan interaksi/);
assert.match(csv,/Catatan berbagi/);
assert.doesNotMatch(csv,/Dibuka|Hadir|Terkirim/);
assert.deepEqual(updates,[],'sharing must never call status mutation');
await act(async()=>view.update(React.createElement(GuestManager,{...props,guests:[]})));
assert.match(text(),/Belum ada data tamu/);
await act(async()=>view.unmount());
URL.createObjectURL=oldCreateURL;
console.log('PASS: real GuestManager copy/fallback/race, WhatsApp drafts/phone formatting, no invented status/phone, filter recovery, historical labels and CSV.');
console.log('Limit: isolated React interactions; no browser layout, WhatsApp delivery, QR, persistence or physical device QA.');

/** Real focus-manager logic on a deterministic DOM/event model; not a browser test. */
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const source=(await build({entryPoints:['src/lib/dialogFocus.ts'],bundle:true,write:false,platform:'node',format:'cjs'})).outputFiles[0].text;
const mod={exports:{}};new Function('module','exports',source)(mod,mod.exports);
const {manageDialogFocus}=mod.exports;
class Doc {
 activeElement=null; handlers=new Map();
 addEventListener(type,fn){const list=this.handlers.get(type)||[];list.push(fn);this.handlers.set(type,list);}
 removeEventListener(type,fn){this.handlers.set(type,(this.handlers.get(type)||[]).filter(x=>x!==fn));}
 fire(type,values={}){const e={defaultPrevented:false,stopped:false,preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;},...values};for(const fn of [...this.handlers.get(type)||[]]){fn(e);if(e.stopped)break;}return e;}
 key(key,shiftKey=false){return this.fire('keydown',{key,shiftKey,isComposing:false});}
}
class Element {
 constructor(doc,name,tabIndex=0){this.ownerDocument=doc;this.name=name;this.tabIndex=tabIndex;this.children=[];this.isConnected=true;this.hidden=false;this.blocked=false;this.disabled=false;}
 contains(node){return node===this||this.children.some(c=>c.contains(node));}
 querySelectorAll(){return this.children.flatMap(c=>[c,...c.querySelectorAll()]);}
 matches(){return this.disabled;}
 closest(){return this.blocked?this:null;}
 getClientRects(){return this.hidden||!this.isConnected?[]:[{}];}
 focus(options){this.lastPreventScroll=options.preventScroll;this.ownerDocument.activeElement=this;this.ownerDocument.fire('focusin',{target:this});}
}
const doc=new Doc(),trigger=new Element(doc,'trigger');trigger.focus({preventScroll:true});
const root=new Element(doc,'publish',-1),heading=new Element(doc,'heading',-1),close=new Element(doc,'close'),hidden=new Element(doc,'hidden'),disabled=new Element(doc,'disabled'),link=new Element(doc,'link'),last=new Element(doc,'last');
hidden.hidden=true;disabled.disabled=true;root.children=[close,heading,hidden,disabled,link,last];
let publishEscapes=0,busy=false;
const release=manageDialogFocus(root,{onEscape(){if(!busy)publishEscapes++;},initialFocus:()=>heading});
assert.equal(doc.activeElement,heading,'initial focus gives context, not publish');assert.equal(heading.lastPreventScroll,true);
assert.equal(doc.key('Tab').defaultPrevented,true);assert.equal(doc.activeElement,close);
doc.key('Tab',true);assert.equal(doc.activeElement,last);assert.equal(last.lastPreventScroll,false,'reverse wrap reveals destination');
doc.key('Tab');assert.equal(doc.activeElement,close);assert.equal(close.lastPreventScroll,false,'wrap reveals destination');
assert.equal(doc.key('Tab').defaultPrevented,false,'normal middle tab uses browser order');
last.disabled=true;doc.key('Tab',true);assert.equal(doc.activeElement,link,'disabled/hidden controls skipped');
trigger.focus({preventScroll:true});assert.equal(doc.activeElement,close,'outside programmatic focus redirected');
const alert=new Element(doc,'alert',-1),action=new Element(doc,'alert action');alert.children=[action];let alerts=0;
const releaseAlert=manageDialogFocus(alert,{onEscape(){alerts++;}});
assert.equal(doc.activeElement,action);doc.key('Escape');assert.equal(alerts,1);assert.equal(publishEscapes,0,'only top dialog consumes Escape');
close.focus({preventScroll:true});assert.equal(doc.activeElement,action,'underlying trap must not steal nested focus');
releaseAlert();assert.equal(doc.activeElement,close,'closing alert returns to publish action');
busy=true;doc.key('Escape');assert.equal(publishEscapes,0,'busy close policy respected');busy=false;doc.key('Escape');assert.equal(publishEscapes,1);
const releaseAgain=manageDialogFocus(alert,{onEscape(){}});close.disabled=true;
releaseAgain();assert.equal(doc.activeElement,link,'disabled trigger falls back to eligible underlying control');
const releaseMissing=manageDialogFocus(alert,{onEscape(){}});link.isConnected=false;
releaseMissing();assert.equal(doc.activeElement,root,'removed trigger and empty controls fall back to underlying dialog');link.isConnected=true;
release();assert.equal(doc.activeElement,trigger,'final close restores original trigger');assert.equal(trigger.lastPreventScroll,true);
assert.equal([...doc.handlers.values()].flat().length,0,'all event listeners removed');
const empty=new Element(doc,'empty',-1),releaseEmpty=manageDialogFocus(empty,{onEscape(){}});
assert.equal(doc.activeElement,empty);doc.key('Tab');assert.equal(doc.activeElement,empty);releaseEmpty();
// Lower dialog can unmount while an alert stays open, without stealing focus.
const lower=manageDialogFocus(root,{onEscape(){}}),upper=manageDialogFocus(alert,{onEscape(){}});
lower();assert.equal(doc.activeElement,action);upper();assert.equal([...doc.handlers.values()].flat().length,0);
const doc2=new Doc(),other=new Element(doc2,'other',-1),end1=manageDialogFocus(root,{onEscape(){publishEscapes++;}}),end2=manageDialogFocus(other,{onEscape(){alerts++;}});
doc.key('Escape');assert.equal(publishEscapes,2,'dialog stacks isolated by document');end2();end1();
console.log('PASS: context focus, Tab/ShiftTab wrap/dynamic controls, outside focus, topmost Escape, nested restore, busy policy, missing trigger, empty dialog, out-of-order cleanup and document isolation.');
console.log('Limit: deterministic DOM/event model; real browser focus order, React commit timing, screen reader and mobile geometry still need QA.');

// Actual React components: dialog names, queued alerts and pending-publish controls.
const React=(await import('react')).default;
const {act,create}=await import('react-test-renderer');
const {createRequire}=await import('node:module');
const ui=(await build({stdin:{contents:'export {default as Publish} from "./src/components/PublishModal"; export {AlertModalProvider,useAlertModal} from "./src/hooks/useAlertModal";',resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',external:['react'],plugins:[{name:'isolated-dialog-decoration',setup(b){
 b.onResolve({filter:/(?:UpgradePrompt|ui\/Logo)$/},a=>({path:a.path,namespace:'ui'}));
 b.onLoad({filter:/.*/,namespace:'ui'},()=>({loader:'js',contents:'export const Logo=()=>null; export default ()=>null;'}));
}}]})).outputFiles[0].text;
const uiMod={exports:{}};new Function('require','module','exports',ui)(createRequire(import.meta.url),uiMod,uiMod.exports);
const {Publish,AlertModalProvider,useAlertModal}=uiMod.exports;
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
globalThis.window={location:{host:'example.test',protocol:'https:'}};
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async()=>{}}}});
let settlePublish,publishCalls=0;
const props={show:true,onClose(){},user:{id:'focus-test',packageId:'free',fullName:'Review'},wedding:{guests:[],invitation:{slug:'test',isPublished:false},allInvitations:[{}],weddingData:{couple:{bride:{nickname:'Sari'},groom:{nickname:'Budi'}}},publishInvitation(){publishCalls++;return new Promise(resolve=>{settlePublish=resolve});}}};
function Trigger(){const alerts=useAlertModal();return React.createElement('button',{id:'queue-alerts',onClick(){alerts.warning('Pertama','Satu');alerts.warning('Kedua','Dua');}},'Queue alerts');}
let view;await act(async()=>{view=create(React.createElement(AlertModalProvider,null,React.createElement(Publish,props),React.createElement(Trigger)))});
const dialog=view.root.findByProps({role:'dialog'});
assert.equal(dialog.props['aria-modal'],'true');
const title=view.root.findByProps({id:dialog.props['aria-labelledby']});assert.equal(title.type,'h3');assert.equal(title.props.tabIndex,-1);
const node=label=>view.root.findByProps({'aria-label':label});
const publishButton=()=>view.root.findAllByType('button').find(n=>n.findAllByType('span').some(s=>s.children.includes('Publish Sekarang')||s.children.includes('Memproses...')));
await act(async()=>{await node('Salin tautan publikasi').props.onClick()});
let publishing;await act(async()=>{publishing=publishButton().props.onClick()});
assert.equal(publishCalls,1,'one controlled stub invocation, no API/network');
assert.equal(dialog.props['aria-busy'],true);assert.equal(node('Tutup dialog publikasi').props.disabled,true);
assert.equal(view.root.findAllByType('button').find(n=>n.children.includes('Kembali')).props.disabled,true);
await act(async()=>view.root.findByProps({id:'queue-alerts'}).props.onClick());
assert.equal(view.root.findByProps({id:'rh-alert-title'}).children[0],'Pertama');
const dismiss=()=>view.root.findByProps({role:'alertdialog'}).findAllByType('button').find(n=>n.children.includes('Mengerti'));
await act(async()=>dismiss().props.onClick());assert.equal(view.root.findByProps({id:'rh-alert-title'}).children[0],'Kedua');
await act(async()=>dismiss().props.onClick());assert.equal(view.root.findAllByProps({role:'alertdialog'}).length,0);
assert.equal(node('Tutup dialog publikasi').props.disabled,true,'alert dismissal does not clear pending publish');
await act(async()=>{settlePublish();await publishing});assert.equal(dialog.props['aria-busy'],false);assert.equal(node('Tutup dialog publikasi').props.disabled,false);
await act(async()=>view.unmount());
console.log('PASS: actual PublishModal has named dialog/context heading; controlled pending publish disables close/back, queued alerts preserve order and do not close/reset underlying work; completion restores close.');

// End-to-end frontend contract: actual hook callback -> actual modal -> actual alert queue.
const {makePublish}=await import('./check-publish-failure.mjs');
for(const options of [{id:null},{saveFails:true},{publishFails:true}]){
 const stub=makePublish(options);
 const errorProps={...props,wedding:{...props.wedding,publishInvitation:stub.publish}};
 await act(async()=>{view=create(React.createElement(AlertModalProvider,null,React.createElement(Publish,errorProps)))});
 await act(async()=>{await node('Salin tautan publikasi').props.onClick()});
 await act(async()=>{await publishButton().props.onClick()});
 assert.equal(view.root.findByProps({id:'rh-alert-title'}).children[0],'Gagal Publish');
 assert.equal(view.root.findAll(n=>n.type==='h3'&&n.children.includes('Berhasil Dipublikasikan!')).length,0);
 assert.equal(stub.record().isPublished,false);
 assert.equal(view.root.findByProps({role:'dialog'}).props['aria-busy'],false);
 await act(async()=>view.unmount());
}
console.log('PASS actual hook-to-PublishModal failures: error alert shown, no success heading, busy reset, no backend mutation.');

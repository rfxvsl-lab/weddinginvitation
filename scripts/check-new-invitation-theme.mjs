/** Actual useWeddingData hook with stubbed services; never calls the real API/DB. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import React from 'react';
import {act,create} from 'react-test-renderer';
const hookSource=fs.readFileSync('src/hooks/useWeddingData.ts','utf8');
const names=[...new Set([...hookSource.matchAll(/api\.([A-Za-z0-9_]+)/g)].map(m=>m[1]))];
let records=[],calls=[],state,view;
const seedData={couple:{groom:{nickname:'Groom'},bride:{nickname:'Bride'}}};
globalThis.__newThemeAPI=async(name,args)=>{
 calls.push({name,args});
 switch(name){
 case 'getInvitationByUserId':return records[0]||null;
 case 'getInvitationsByUserId':return records;
 case 'createInvitation':{const [userId,title,themeId,weddingData]=args;const r={id:'test-'+records.length,userId,title,themeId,weddingData,isPublished:false,activatedAt:null};records.push(r);return r.id;}
 case 'getGuestsByInvitation':case 'getRSVPsByInvitation':case 'getVisitorLogs':case 'getDesignSnapshots':return [];
 default:throw Error('Unexpected service in new-theme test: '+name);
 }
};
const output=await build({stdin:{contents:'export {useWeddingData} from "./src/hooks/useWeddingData";export {NEW_INVITATION_THEME_ID,AVAILABLE_THEMES} from "./src/lib/availableThemes";',resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',external:['react'],plugins:[{name:'stub-only-persistence',setup(b){b.onResolve({filter:/\/lib\/api$/},()=>({path:'api',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({loader:'js',contents:names.map(n=>`export const ${n}=(...args)=>globalThis.__newThemeAPI('${n}',args);`).join('\n')}))}}]});
const mod={exports:{}};new Function('require','module','exports',output.outputFiles[0].text)(createRequire(import.meta.url),mod,mod.exports);
const {useWeddingData,NEW_INVITATION_THEME_ID,AVAILABLE_THEMES}=mod.exports;
assert(AVAILABLE_THEMES.some(t=>t.id===NEW_INVITATION_THEME_ID));assert.equal(NEW_INVITATION_THEME_ID,'sunda-kujang');
function Harness(){state=useWeddingData();return null;}
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const user={id:'local-user',coupleGroom:'Groom',coupleBride:'Bride',packageId:'free',paymentStatus:'pending'};
await act(async()=>{view=create(React.createElement(Harness))});assert.equal(state.themeId,NEW_INVITATION_THEME_ID);
await act(async()=>{await state.loadUserData(user)});
assert.equal(records.length,1);assert.equal(records[0].themeId,NEW_INVITATION_THEME_ID);assert.equal(state.invitation.themeId,NEW_INVITATION_THEME_ID);assert.equal(state.themeId,NEW_INVITATION_THEME_ID);
await act(async()=>{await state.createNewInvitation('Proyek kedua')});
assert.equal(records.length,2);assert.equal(records[1].themeId,NEW_INVITATION_THEME_ID);assert.equal(state.invitation.id,records[1].id);assert.equal(state.themeId,NEW_INVITATION_THEME_ID);
await act(async()=>{await state.createNewInvitation('Proyek ketiga')});assert.equal(records.length,3);
let fourth;await act(async()=>{fourth=await state.createNewInvitation('Melewati kuota')});assert.equal(fourth,null);assert.equal(records.length,3,'free maxProjects remains three');
await act(async()=>view.unmount());
records=[{id:'old',userId:user.id,title:'Lama',themeId:'rfx-dark',weddingData:seedData,isPublished:false,activatedAt:'existing'}];calls=[];
await act(async()=>{view=create(React.createElement(Harness))});
await act(async()=>{await state.loadUserData(user)});
assert.equal(state.themeId,'rfx-dark');assert.equal(state.invitation.themeId,'rfx-dark');assert.equal(records.length,1);
assert.equal(calls.some(c=>['createInvitation','updateInvitationData','updateInvitationTheme','activateInvitation'].includes(c.name)),false,'existing invitation never migrated or saved by theme-default change');
await act(async()=>view.unmount());delete globalThis.__newThemeAPI;
console.log('PASS actual hook: first account and new projects use retained Pasundan; local state matches create payload; free quota unchanged; existing retired theme retained without any creation/theme-save/activation API. All services stubbed.');

/** Exercise the actual hook callback with stubbed services; no DB or publish network. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const file=ts.createSourceFile('useWeddingData.ts',fs.readFileSync('src/hooks/useWeddingData.ts','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
let callback;
function visit(n){if(ts.isVariableDeclaration(n)&&n.name.getText(file)==='publishInvitationAction')callback=n.initializer.arguments[0].getText(file);ts.forEachChild(n,visit)}visit(file);assert(callback,'actual hook callback found');
const script=ts.transpileModule('const callback = '+callback+';',{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
export function makePublish({id='stub',saveFails=false,publishFails=false,snapshotFails=false}={}){
 const calls=[],invitationIdRef={current:id},weddingDataRef={current:{example:true}},themeIdRef={current:'unchanged'},saveTimerRef={current:null};let record={id,isPublished:false};
 const api={async updateInvitationData(...args){calls.push(['save',...args]);if(saveFails)throw Error('save rejected')},async publishInvitation(...args){calls.push(['publish',...args]);if(publishFails)throw Error('publish rejected')}};
 const saveDesignSnapshot=async()=>{calls.push(['snapshot']);if(snapshotFails)throw Error('snapshot rejected')};
 const setInvitation=fn=>{calls.push(['state']);record=fn(record)},toastSingleton={error(){calls.push(['toast'])}};
 const publish=new Function('invitationIdRef','weddingDataRef','themeIdRef','saveTimerRef','api','saveDesignSnapshot','setInvitation','toastSingleton','console',script+'return callback;')(invitationIdRef,weddingDataRef,themeIdRef,saveTimerRef,api,saveDesignSnapshot,setInvitation,toastSingleton,{log(){},error(){},warn(){}});
 return {publish,calls,record:()=>record};
}
for(const [options,match,expected] of [[{id:null},/belum tersedia/,[]],[{saveFails:true},/save rejected/,['save','toast']],[{publishFails:true},/publish rejected/,['save','snapshot','publish','toast']]]){
 const t=makePublish(options);await assert.rejects(t.publish(),match);assert.deepEqual(t.calls.map(c=>c[0]),expected);assert.equal(t.record().isPublished,false);
}
for(const options of [{},{snapshotFails:true}]){const t=makePublish(options);await t.publish();assert.deepEqual(t.calls.map(c=>c[0]),['save','snapshot','publish','state']);assert.equal(t.record().isPublished,true);assert(t.record().publishedAt)}
console.log('PASS actual publish hook: missing invitation/save/API failure reject and never mark published; successful API marks published; snapshot failure remains best effort. All services stubbed.');

/** Actual teaser/catalog rendering with public theme data; no accounts or invitation writes. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import React from 'react';
import {act,create} from 'react-test-renderer';
const result=await build({stdin:{contents:'export {LandingThemes} from "./src/components/landing/LandingThemes"; export {DEFAULT_THEMES} from "./src/data/defaultData";',resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',external:['react'],jsx:'automatic',plugins:[{name:'next-review',setup(b){b.onResolve({filter:/^next\/(link|image)$/},a=>({path:a.path,namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},a=>({loader:'js',contents:`import React from 'react'; export default function Component({children,fill,sizes,priority,...props}){return React.createElement('${a.path==='next/link'?'a':'img'}',props,children)}`}));}}]});
const mod={exports:{}};
new Function('require','module','exports',result.outputFiles[0].text)(createRequire(import.meta.url),mod,mod.exports);
const {LandingThemes,DEFAULT_THEMES}=mod.exports;
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
let view;
await act(async()=>{view=create(React.createElement(LandingThemes))});
const cards=()=>view.root.findAll(n=>n.type==='a' && n.props.className==='rh-theme-card');
assert.equal(cards().length,6,'homepage remains a teaser');
assert.equal(view.root.findAllByType('h1').length,0);
assert.equal(view.root.findAllByType('a').find(n=>n.props.href==='/preview').type,'a');
await act(async()=>view.update(React.createElement(LandingThemes,{variant:'catalog'})));
assert.equal(cards().length,DEFAULT_THEMES.length,'catalog includes every theme');
assert.equal(DEFAULT_THEMES.length,13,'review baseline has thirteen themes');
assert.equal(view.root.findAllByType('h1').length,1);
assert.equal(view.root.findAllByProps({href:'/preview'}).length,0,'catalog CTA must not point to itself');
assert.equal(view.root.findAllByType('a').find(n=>n.props.href==='/auth?mode=register').type,'a');
const text=n=>n.children.map(c=>typeof c==='string'?c:text(c)).join('');
for(const [label,predicate] of [['Spesial 2.5D',t=>t.tier==='special'],['Klasik & adat',t=>t.pattern==='classic'],['Modern',t=>t.pattern==='modern'],['Floral',t=>t.pattern==='floral'],['Minimalis',t=>t.pattern==='minimalist'],['Interaktif',t=>t.pattern==='storybook']]){
 const button=view.root.findAllByType('button').find(n=>text(n)===label);
 await act(async()=>button.props.onClick());
 assert.equal(cards().length,DEFAULT_THEMES.filter(predicate).length,`full ${label} category`);
 assert.equal(view.root.findAllByType('button').filter(n=>n.props['aria-pressed']).length,1);
}
await act(async()=>view.root.findAllByType('button').find(n=>text(n)==='Semua').props.onClick());
assert.deepEqual(new Set(cards().map(n=>n.props.href)),new Set(DEFAULT_THEMES.map(t=>`/preview/${t.id}`)));
await act(async()=>view.update(React.createElement(LandingThemes)));
assert.equal(cards().length,6);
await act(async()=>view.unmount());
console.log('PASS: default teaser six; catalog thirteen/all category matches, one h1, no self CTA and unchanged theme demo URLs.');
console.log('Limit: isolated React rendering; CSS geometry/browser/direct URL reload require visual QA.');

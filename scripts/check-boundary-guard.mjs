/** Negative checks: the reviewed catalogue passes; later protected/CSS changes fail.
 *  Only appends inert comments (or a CSS probe), restoring exact bytes in finally. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const guard=()=>spawnSync(process.execPath,['scripts/check-product-boundaries.mjs'],{cwd:root,encoding:'utf8',timeout:15000});
const before=guard();assert.equal(before.status,0,before.stderr);
for(const [file,addition,expected] of [
 ['src/app/(marketing)/preview/page.tsx','\n/* catalogue negative check */\n',/Catalogue entry changed beyond reviewed/],
 ['src/app/(marketing)/preview/[themeId]/page.tsx','\n/* renderer negative check */\n',/Protected preview\/theme\/assets\/zoom\/package/],
 ['src/lib/packageLimits.ts','\n/* package negative check */\n',/Protected preview\/theme\/assets\/zoom\/package/],
 ['src/styles/product.css','\n.boundary-negative-probe { color: red; }\n',/Unscoped selector/],
 ['src/app/layout.tsx','\n/* viewport negative check */\n',/Root layout changed beyond/],
]) {
 const target=path.join(root,file),original=fs.readFileSync(target);
 try {
  fs.appendFileSync(target,addition);
  const result=guard();
  assert.equal(result.signal,null,'guard must fail normally, not time out');
  assert.notEqual(result.status,0,`guard allowed ${file}`);
  assert.match(result.stderr,expected,`guard must reject intended boundary: ${file}`);
 } finally {fs.writeFileSync(target,original);}
 assert.deepEqual(fs.readFileSync(target),original,`exact restore: ${file}`);
}
// Fresh files under protected routes must fail even before git add; ordinary test
// scripts may still be added. Exclusive creation never overwrites an existing file.
for (const [file,allowed] of [
 [`src/app/(marketing)/preview/boundary-untracked-${process.pid}.ts`,false],
 [`scripts/boundary-untracked-${process.pid}.mjs`,true],
]) {
 const target=path.join(root,file);
 const descriptor=fs.openSync(target,'wx');
 try {
  fs.writeFileSync(descriptor,'// guard untracked probe\n');
  const result=guard();
  assert.equal(result.signal,null);
  if (allowed) assert.equal(result.status,0,result.stderr);
  else {
   assert.notEqual(result.status,0,'untracked protected file must fail before staging');
   assert.match(result.stderr,/Untracked protected invitation files found/);
  }
 } finally {fs.closeSync(descriptor);fs.unlinkSync(target);}
 assert.equal(fs.existsSync(target),false,'probe removed after test');
}
const after=guard();assert.equal(after.status,0,after.stderr);
console.log('PASS: reviewed catalogue accepted; mutations of catalogue, theme renderer, package, CSS scope and viewport rejected; untracked protected route rejected while new test script allowed; originals restored/probes removed; guard passes afterward.');
console.log('Limit: verifies repository guard behavior, not browser rendering, physical pinch gestures or production services.');

import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../site/',import.meta.url);
const pages=['index.html','city-hermitage/index.html','hearth/index.html','season-garden/index.html'];
for(const page of pages){
 const s=fs.readFileSync(new URL(page,root),'utf8');
 assert.match(s,/<meta name="viewport"/);
 assert.match(s,/<title>/);
 for(const match of s.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){
  new vm.Script(match[1],{filename:page});
 }
 for(const match of s.matchAll(/(?:href|src)="([^"#]+)"/g)){
  const target=match[1];if(/^(https?:|data:|mailto:|javascript:)/.test(target))continue;
  const path=new URL(target,new URL(page,root));
  if(path.protocol==='file:')assert.ok(fs.existsSync(path),`${page} missing ${target}`);
 }
 console.log('PASS',page,'HTML assets and inline JS syntax');
}
const hearth=fs.readFileSync(new URL('hearth/index.html',root),'utf8');
assert.match(hearth,/getUserMedia/);assert.match(hearth,/track\.stop\(\)/);
const garden=fs.readFileSync(new URL('season-garden/index.html',root),'utf8');
assert.ok(JSON.parse(fs.readFileSync(new URL('season-garden/seasons.json',root))).length===24);
console.log('PASS microphone controls and 24 seasons');

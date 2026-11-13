import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Verify the offline service worker's install + fetch fallback without a browser.
const scope='https://example.github.io/quiet-spaces/city-hermitage/';
const events=new Map();
const cacheStore=new Map();
const origin=new URL(scope).origin;
const normalize=(value)=>new URL(value,scope).href;
const makeResponse=()=>({ok:true,source:'cached'});
const caches={
 async open(name){
  if(!cacheStore.has(name))cacheStore.set(name,new Map());
  const cache=cacheStore.get(name);
  return {
   async addAll(list){for(const p of list)cache.set(normalize(p),makeResponse())},
   async match(request){return cache.get(typeof request==='string'?normalize(request):request.url)}
  };
 },
 async keys(){return [...cacheStore.keys()]},
 async delete(key){return cacheStore.delete(key)}
};
const sw={registration:{scope},location:{origin},skipWaiting(){},clients:{claim(){}} ,
  addEventListener(name,fn){events.set(name,fn)}};
vm.runInNewContext(fs.readFileSync(new URL('../site/city-hermitage/sw.js',import.meta.url),'utf8'),
 {self:sw,caches,URL,Response:{error:()=>({ok:false})},fetch:async()=>{throw Error('offline')},Promise});
async function event(name,request){let promise;let response;
 const e={request,waitUntil:p=>{promise=p},respondWith:p=>{response=p}};
 events.get(name)(e);if(promise)await promise;return response&&await response;
}
await event('install');await event('activate');
assert.equal((await event('fetch',{method:'GET',url:scope,mode:'navigate'})).source,'cached');
assert.equal((await event('fetch',{method:'GET',url:scope+'not-found',mode:'navigate'})).source,'cached');
console.log('PASS city-hermitage: scoped SW cache installation, offline navigation and missing-page fallback');

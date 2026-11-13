// The cache only contains same-origin, static valley assets. No analytics or remote requests.
const CACHE='city-hermitage-v4';
const HOME=new URL('./',self.registration.scope).pathname;
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['./','./index.html'])).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('city-hermitage-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).catch(async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(event.request);
    if(cached)return cached;
    if(event.request.mode==='navigate')return cache.match(HOME);
    return Response.error();
  }));
});

// Scope-isolated, versioned offline shell. No push, GPS, API caching or demo alerts.
const PREFIX = 'bp-v2:' + self.registration.scope;
const CACHE = PREFIX + ':2026-09-06.5';
const FILES = [
  './','./index.html','./parent-cms.html','./manifest.json',
  './v2/app.mjs','./v2/views.mjs','./v2/safety.mjs','./v2/icons.mjs','./v2/app.css',
  './images/helper-fox.png','./images/nunito-regular.ttf','./images/nunito-bold.ttf',
  './images/logo_192x192.png','./images/logo_512x512.png','./images/Nunito-OFL.txt'
];
const ALLOWED = new Set(FILES.map(path => new URL(path,self.registration.scope).href));
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(FILES.map(path=>new Request(new URL(path,self.registration.scope),{cache:'reload'})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    for(const key of await caches.keys()){
      if(key.startsWith(PREFIX+':') && key!==CACHE)await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  // Navigation Request URLs can retain a client-side route fragment.
  // All hash routes share the same HTML; never relax origin or query checks.
  url.hash='';
  if(url.origin!==self.location.origin || !ALLOWED.has(url.href))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(url.href,{ignoreSearch:false});
    // One atomic shell version: network cannot mix old HTML and new modules.
    if(cached)return cached;
    return fetch(event.request);
  })());
});
self.addEventListener('message',event=>{
  if(event.data?.type!=='BP_CHECK_READY')return;
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    const complete=(await Promise.all(FILES.map(path=>cache.match(new URL(path,self.registration.scope).href)))).every(Boolean);
    if(complete)event.ports[0]?.postMessage({type:'BP_OFFLINE_READY'});
  })());
});

// Sweetheart Cafe — Service Worker v5
const CACHE = 'sweetheart-v5';
const BASE = '/CoffeeShop';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c =>
      c.addAll([
        BASE + '/',
        BASE + '/index.html',
        BASE + '/manifest.json',
        BASE + '/icons/icon-192.png',
        BASE + '/icons/icon-512.png'
      ]).catch(()=>{})
    )
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.url.includes('script.google.com')) return;
  if(e.request.mode === 'navigate'){
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match(BASE + '/index.html')
      )
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(()=>{}))
  );
});

// Sweetheart Cafe — Service Worker v3
// Cache version bump forces iPhone to reload fresh, fixing 404 on home screen
const CACHE = 'sweetheart-v3';
const FILES = ['/', '/index.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES).catch(() => {})));
  self.skipWaiting(); // activate immediately, don't wait for old tabs to close
});

self.addEventListener('activate', e => {
  // Delete all old caches
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Never cache Google Apps Script calls — always go to network
  if (e.request.url.includes('script.google.com')) return;
  // For app files: try cache first, fall back to network
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      // Cache fresh copies of app files
      if (res.ok && FILES.some(f => e.request.url.endsWith(f))) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match('/index.html')))
  );
});

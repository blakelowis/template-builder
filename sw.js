const CACHE = 'birds-store-visit-v4';
const ASSETS = ['./', './index.html', './manifest.json', './css/style.css?v=2', './js/seed-data.js', './js/app.js', './js/jspdf.umd.min.js'];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(nr => { if (nr.ok) { var cl = nr.clone(); caches.open(CACHE).then(c => c.put(e.request, cl)); } return nr; }).catch(() => caches.match('./index.html')))); });

const cacheName = 'avent-cache-v2';
const filesToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './maison.png',
    './interieurmaison.png',
    './manifest.json'
];

self.addEventListener('install', evt=>{
    evt.waitUntil(
        caches.open(cacheName).then(cache=>{
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', evt => {
    // Supprimer les anciens caches
    evt.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== cacheName).map(k => caches.delete(k))
        ))
    );
});

self.addEventListener('fetch', evt=>{
    evt.respondWith(
        caches.match(evt.request).then(resp=>{
            return resp || fetch(evt.request);
        })
    );
});

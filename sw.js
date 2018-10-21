const staticCacheName = 'gf_restaurant-static-99';
const allCaches = [
    staticCacheName
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(staticCacheName).then(cache => {
            return cache.addAll([
                './',
                './index.html',
                './restaurant.html',
                './data/restaurants.json',
                './js/indexController.js',
                './js/dbhelper.js',
                './js/restaurant_info.js',
                './js/main.js',
                './js/idb.js',
                './manifest.json',
                'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
                'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css'

            ]);
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName.startsWith('gf_') &&
                        !allCaches.includes(cacheName);
                }).map(cacheName => caches.delete(cacheName))
            );
        })
    );

});

//new version of fetch listener

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    //if (requestUrl.origin === location.origin) {
        event.respondWith(caches.match(event.request)
            .then(response => response || fetch(event.request)
                .then(response => caches.open(staticCacheName)
                    .then(cache => {
                        cache.put(event.request, response.clone());
                        return response;
                    })
                ).catch(event => console.log('Fetching online or from cache error ', event))
            )
        );
    //} else {
        return fetch(event.request).then(response => caches.open(staticCacheName)
            .then(cache => {
                //cache.put(requestUrl.href, response.clone());
                return response;
            }
        )).catch(event => console.log('Fetching online or from cache error ', event));
    //}
}); 


self.addEventListener('message', function (event) {
    // if (event.data.action === 'skipWaiting') {
    //     self.skipWaiting();
    // }
});
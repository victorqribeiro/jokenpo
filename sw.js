const filesToCache = [
    	'./',
      './index.html',
      './js/Matrix2.js',
      './js/MLP.js',
      './js/main.js',
      './css/main.css',
      './favicon.png',
      './manifest.json'
 ];

const staticCacheName = 'jokenpo-v1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName)
    .then(cache => {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      if (response) {
        return response;
      }

      return fetch(event.request)

			.then(response => {
				return caches.open(staticCacheName).then(cache => {
					cache.put(event.request.url, response.clone());
					return response;
				});
			});

    }).catch(error => {})
  );
});

self.addEventListener('activate', event => {

  const cacheWhitelist = [staticCacheName];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

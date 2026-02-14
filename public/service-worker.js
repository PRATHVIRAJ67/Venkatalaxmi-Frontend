/**
 * Venkatalakshmi Mess - Service Worker
 * This service worker handles caching and offline functionality
 */

const CACHE_NAME = 'venkatalakshmi-mess-v1';
const RUNTIME_CACHE = 'runtime-cache';

// Resources that should be precached on service worker installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/Venkatalakshmi-Logo.png',
  '/manifest.json',
  '/robots.txt',
  '/favicon.ico'
];

// Install event - precache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first strategy with fallback to cache
self.addEventListener('fetch', event => {
  // Skip cross-origin requests and non-GET requests
  if (
    event.request.url.startsWith(self.location.origin) && 
    event.request.method === 'GET' &&
    !event.request.url.includes('/api/') &&
    !event.request.url.includes('chrome-extension')
  ) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          // Return cached response immediately
          return cachedResponse;
        }

        return caches.open(RUNTIME_CACHE).then(cache => {
          return fetch(event.request).then(response => {
            // If we received a valid response, clone and cache it
            if (response && response.status === 200 && response.type === 'basic') {
              cache.put(event.request, response.clone());
            }
            return response;
          }).catch(error => {
            // Network request failed, try to serve the offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html').then(offlineResponse => {
                return offlineResponse || new Response('Offline - Please check your internet connection', {
                  status: 503,
                  statusText: 'Service Unavailable'
                });
              });
            }
            // For non-navigation requests, return a proper error response
            return new Response('Resource not available offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        });
      })
    );
  }
});

// Handle push notifications
self.addEventListener('push', event => {
  if (!event.data) {
    return;
  }
  
  const title = 'Venkatalakshmi Mess';
  const options = {
    body: event.data.text() || 'Your delicious South Indian food is waiting!',
    icon: '/Venkatalakshmi-Logo.png',
    badge: '/favicon.ico',
    tag: 'mess-notification'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
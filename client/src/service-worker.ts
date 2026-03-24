// Service Worker for PWA functionality
const CACHE_NAME = 'govscheme-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  // Add more static assets as needed
];

// Install event - cache resources
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache: Cache) => cache.addAll(urlsToCache))
      .then(() => (self as any).skipWaiting())
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event: any) => {
  event.respondWith(
    caches.match(event.request)
      .then((response: Response | undefined) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames: string[]) => {
      return Promise.all(
        cacheNames.map((cacheName: string) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // Sync offline application data when connection is restored
  const queue = await getOfflineQueue();
  for (const item of queue) {
    try {
      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      await removeFromOfflineQueue(item.id);
    } catch (error) {
      console.error('Failed to sync:', error);
    }
  }
}

async function getOfflineQueue() {
  // Implementation for getting offline queue
  return [];
}

async function removeFromOfflineQueue(id: string) {
  // Implementation for removing from offline queue
}
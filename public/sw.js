const CACHE_NAME = 'progress-tracker-v2'
const urlsToCache = [
    '/',
    '/calendar',
    '/reports',
    '/settings',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png'
]

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...')
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app shell')
                return cache.addAll(urlsToCache)
            })
            .then(() => {
                console.log('Service Worker installed')
                return self.skipWaiting()
            })
    )
})

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...')
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName)
                        return caches.delete(cacheName)
                    }
                })
            )
        }).then(() => {
            console.log('Service Worker activated')
            return self.clients.claim()
        })
    )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return

    // Skip chrome-extension requests
    if (event.request.url.startsWith('chrome-extension://')) return

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if available
                if (response) {
                    return response
                }

                // Clone the request because it's a stream and can only be consumed once
                const fetchRequest = event.request.clone()

                return fetch(fetchRequest).then((response) => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response
                    }

                    // Clone the response because it's a stream and can only be consumed once
                    const responseToCache = response.clone()

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache)
                        })

                    return response
                }).catch(() => {
                    // If fetch fails, return a fallback page
                    if (event.request.destination === 'document') {
                        return caches.match('/')
                    }
                })
            })
    )
})

// Push event - handle push notifications
self.addEventListener('push', (event) => {
    console.log('Push event received:', event)

    let notificationData = {
        title: 'Progress Tracker',
        body: 'Time to fill your daily tracker!',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'daily-reminder',
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        data: {
            url: '/',
            timestamp: Date.now()
        },
        actions: [
            {
                action: 'open',
                title: 'Open App',
                icon: '/icon-192x192.png'
            },
            {
                action: 'snooze',
                title: 'Remind Later',
                icon: '/icon-192x192.png'
            }
        ]
    }

    // If we have data from the push, use it
    if (event.data) {
        try {
            const data = event.data.json()
            notificationData = { ...notificationData, ...data }
        } catch (e) {
            notificationData.body = event.data.text()
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event)

    event.notification.close()

    if (event.action === 'open' || !event.action) {
        // Open the app
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then((clientList) => {
                    // Check if there's already a window/tab open with the target URL
                    for (const client of clientList) {
                        if (client.url.includes(self.location.origin) && 'focus' in client) {
                            return client.focus()
                        }
                    }
                    // If no window/tab is open, open a new one
                    if (clients.openWindow) {
                        return clients.openWindow('/')
                    }
                })
        )
    } else if (event.action === 'snooze') {
        // Schedule a reminder for later (30 minutes)
        event.waitUntil(
            setTimeout(() => {
                self.registration.showNotification('Progress Tracker', {
                    title: 'Progress Tracker',
                    body: 'Don\'t forget to track your progress!',
                    icon: '/icon-192x192.png',
                    badge: '/icon-192x192.png',
                    tag: 'daily-reminder',
                    requireInteraction: true,
                    vibrate: [200, 100, 200],
                    data: {
                        url: '/',
                        timestamp: Date.now()
                    }
                })
            }, 30 * 60 * 1000) // 30 minutes
        )
    }
})

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
    console.log('Background sync event:', event)

    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Handle background sync tasks
            console.log('Background sync completed')
        )
    }
}) 
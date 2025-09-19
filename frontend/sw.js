// 🚨 EMERGENCY OFFLINE CACHE - Critical for when internet is down during disasters
const CACHE_NAME = 'bezpieczny-pomocnik-emergency-v1';
const EMERGENCY_ESSENTIALS = [
    // Core App Files
    '/',
    '/index.html',
    '/app.js',
    '/style.css',
    '/manifest.json',
    
    // Emergency Data (will be created)
    '/data/offline-emergency.json',
    
    // Images & Icons
    '/images/logo_192x192.png',
    '/images/logo_512x512.png',
    '/favicon.ico'
];

// Install - Cache emergency essentials
self.addEventListener('install', event => {
    console.log('🚨 Installing Emergency Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Caching emergency essentials...');
                return cache.addAll(EMERGENCY_ESSENTIALS);
            })
            .then(() => {
                console.log('✅ Emergency cache installed successfully');
                self.skipWaiting(); // Activate immediately
            })
            .catch(error => {
                console.error('❌ Emergency cache installation failed:', error);
            })
    );
});

// Activate - Clean old caches
self.addEventListener('activate', event => {
    console.log('🔥 Activating Emergency Service Worker...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Emergency SW activated - Ready for offline emergencies!');
            return self.clients.claim();
        })
    );
});

// Fetch - Cache-first strategy for emergency content
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip chrome-extension and other protocols
    if (!event.request.url.startsWith('http')) return;
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('📦 Serving from cache:', event.request.url);
                    return response;
                }
                
                // Try network, fallback to offline emergency page
                return fetch(event.request)
                    .then(response => {
                        // Cache successful responses
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, responseClone));
                        }
                        return response;
                    })
                    .catch(() => {
                        // Network failed - serve offline emergency content
                        if (event.request.destination === 'document') {
                            return caches.match('/') || createOfflineEmergencyPage();
                        }
                        return new Response('🚨 Emergency Mode: No Internet', {
                            status: 503,
                            statusText: 'Service Unavailable - Emergency Mode Active'
                        });
                    });
            })
    );
});

// Create emergency offline page when no cache available
function createOfflineEmergencyPage() {
    const offlineHTML = `
        <!DOCTYPE html>
        <html lang="pl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🚨 Tryb Awaryjny - Bezpieczny Pomocnik</title>
            <style>
                body { font-family: Arial, sans-serif; background: #f44336; color: white; text-align: center; padding: 20px; }
                .emergency { background: white; color: #f44336; padding: 30px; border-radius: 15px; margin: 20px auto; max-width: 400px; }
                .contact { font-size: 24px; margin: 15px 0; padding: 15px; background: #ff5722; border-radius: 10px; }
                .hero { font-size: 50px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="emergency">
                <div class="hero">🦸‍♂️</div>
                <h1>🚨 TRYB AWARYJNY</h1>
                <p><strong>Brak internetu, ale jestem z tobą!</strong></p>
                
                <div class="contact">📞 POMOC: 112</div>
                <div class="contact">👮 POLICJA: 997</div>
                <div class="contact">🚒 STRAŻ: 998</div>
                <div class="contact">🚑 POGOTOWIE: 999</div>
                
                <h3>🛡️ CO ROBIĆ:</h3>
                <p>1. Zostań spokojny<br>
                2. Znajdź dorosłego<br>
                3. Idź w bezpieczne miejsce<br>
                4. Zadzwoń po pomoc</p>
                
                <p><em>Aplikacja wróci gdy internet się połączy</em></p>
            </div>
        </body>
        </html>
    `;
    
    return new Response(offlineHTML, {
        headers: { 'Content-Type': 'text/html' }
    });
}

// Push Notifications - Original functionality preserved
self.addEventListener('push', event => {
    const data = event.data.json();
    console.log('📬 Otrzymano powiadomienie push:', data);

    const title = data.title || '🚨 Bezpieczny Pomocnik';
    const options = {
        body: data.body || 'Nowy alert awaryjny! Sprawdź aplikację.',
        icon: data.icon || '/images/logo_192x192.png',
        badge: '/images/logo_192x192.png',
        tag: 'emergency-alert',
        requireInteraction: true, // Stays visible until user acts
        actions: [
            {
                action: 'open',
                title: '🔍 Sprawdź Alert'
            },
            {
                action: 'call',
                title: '📞 Zadzwoń 112'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Enhanced notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'call') {
        // Open phone dialer
        event.waitUntil(
            clients.openWindow('tel:112')
        );
    } else {
        // Open app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

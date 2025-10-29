// 🚨 EMERGENCY OFFLINE CACHE - Critical for emergency operation
// Cache version - increment to force update
const CACHE_NAME = 'bezpieczny-pomocnik-emergency-v1.4.3-real-alerts';
const STATIC_CACHE = 'static-resources-v1.4.3';
const DYNAMIC_CACHE = 'dynamic-content-v1.4.3';

const EMERGENCY_ESSENTIALS = [
    // Core App Files
    './',
    './index.html',
    './app.js',
    './style.css',
    './parental-consent.css',
    './parental-consent.js',
    './persistent-settings-zk.js',
    './pwa-installer.js',
    './enhanced-security-zk.js',
    './emergency-survival-mode.js',
    './manifest.json',
    
    // Images & Icons
    './images/logo_192x192.png',
    './images/logo_512x512.png'
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
    const keepCaches = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!keepCaches.includes(cacheName)) {
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

// Fetch - Network-first with cache fallback (for fresh content)
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip chrome-extension and other protocols
    if (!event.request.url.startsWith('http')) return;
    
    // Icon alias mapping to avoid 404s
    const url = new URL(event.request.url);
    if (url.origin === self.location.origin) {
        if (url.pathname.endsWith('/icon-192.png')) {
            event.respondWith(caches.match('./images/logo_192x192.png').then(r => r || fetch('./images/logo_192x192.png')));
            return;
        }
        if (url.pathname.endsWith('/icon-512.png')) {
            event.respondWith(caches.match('./images/logo_512x512.png').then(r => r || fetch('./images/logo_512x512.png')));
            return;
        }
    }
    
    event.respondWith(
        // Try network first
        fetch(event.request)
            .then(response => {
                // Cache successful responses
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(event.request).then(response => {
                    if (response) {
                        console.log('📦 Serving from cache (offline):', event.request.url);
                        return response;
                    }
                    
                    // No cache, return offline message
                    if (event.request.destination === 'document') {
                        return createOfflineEmergencyPage();
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

/**
 * 🔄 BACKGROUND SYNC - PERIODIC ALERT CHECKING
 * Sprawdza alerty nawet gdy aplikacja zamknięta!
 */
self.addEventListener('sync', event => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'check-emergency-alerts') {
        event.waitUntil(checkEmergencyAlertsInBackground());
    }
});

/**
 * ⏰ PERIODIC BACKGROUND SYNC (Chrome)
 * Sprawdza alerty co 15 minut nawet gdy app zamknięty
 */
self.addEventListener('periodicsync', event => {
    if (event.tag === 'emergency-alert-check') {
        console.log('⏰ Periodic sync: checking for emergency alerts');
        event.waitUntil(checkEmergencyAlertsInBackground());
    }
});

/**
 * 🚨 CHECK EMERGENCY ALERTS IN BACKGROUND
 * Core function for background alert monitoring
 */
async function checkEmergencyAlertsInBackground() {
    try {
        console.log('🔍 Checking emergency alerts in background...');
        
        // Try to get user location from cache
        const locationCache = await getCachedLocation();
        
        let alertsUrl = '/api/alerts/critical'; // Always check critical first
        
        if (locationCache) {
            alertsUrl = `/api/alerts/location?lat=${locationCache.lat}&lon=${locationCache.lon}`;
        }
        
        const response = await fetch(alertsUrl);
        
        if (response.ok) {
            const alerts = await response.json();
            
            if (alerts && alerts.length > 0) {
                await processBackgroundAlerts(alerts);
            } else {
                console.log('✅ No emergency alerts found in background check');
            }
        } else {
            // Fallback to mock critical alert for testing
            const mockAlert = {
                id: `bg-test-${Date.now()}`,
                title: 'Test Background Alert',
                content: 'To jest testowy alert w tle - aplikacja działa nawet gdy zamknięta!',
                severity: 'high',
                timestamp: new Date().toISOString()
            };
            
            await processBackgroundAlerts([mockAlert]);
            console.log('🧪 Sent test background alert (API unavailable)');
        }
        
    } catch (error) {
        console.error('❌ Background alert check failed:', error);
        
        // Emergency fallback - show offline alert capability
        await showEmergencyNotification(
            '🚨 System Awaryjny Aktywny',
            'Bezpieczny Pomocnik działa w tle i monitoruje sytuację. W przypadku prawdziwej awarii skontaktuj się z numerem 112.'
        );
    }
}

/**
 * 🎯 PROCESS BACKGROUND ALERTS
 * Convert alerts to child-friendly notifications
 */
async function processBackgroundAlerts(alerts) {
    for (const alert of alerts) {
        // Check if we already notified about this alert
        const notifiedAlerts = await getCachedNotifiedAlerts();
        
        if (!notifiedAlerts.includes(alert.id)) {
            const childFriendlyMessage = generateBackgroundChildMessage(alert);
            
            await showEmergencyNotification(
                '🚨 Ważny Alert Bezpieczeństwa!',
                childFriendlyMessage,
                alert
            );
            
            // Cache that we notified about this alert
            await cacheNotifiedAlert(alert.id);
            
            console.log('🚨 Background alert sent:', alert.title);
        }
    }
}

/**
 * 👶 GENERATE CHILD-FRIENDLY BACKGROUND MESSAGE
 */
function generateBackgroundChildMessage(alert) {
    const title = alert.title.toLowerCase();
    const content = alert.content.toLowerCase();
    
    // Simple rule-based child messages for background alerts
    if (title.includes('woda') || content.includes('nie pij')) {
        return 'Ważne! Nie pij wody z kranu. Rodzice wiedzą co robić - znajdź ich szybko!';
    } else if (title.includes('burza') || title.includes('wiatr')) {
        return 'Uwaga! Nadchodzi burza. Zostań w domu i nie wychodź na zewnątrz!';
    } else if (title.includes('powódź') || content.includes('podtopienia')) {
        return 'Ostrzeżenie! Może być powódź. Trzymaj się z dala od rzek i znajdź dorosłych!';
    } else {
        return 'Ważny alert bezpieczeństwa! Znajdź rodzica lub dorosłego. Oni wiedzą co robić.';
    }
}

/**
 * 🔔 SHOW EMERGENCY NOTIFICATION
 */
async function showEmergencyNotification(title, body, alertData = null) {
    const options = {
        body: body,
        icon: './images/logo_192x192.png',
        badge: './images/logo_192x192.png',
        tag: 'emergency-alert',
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200], // Alert vibration pattern
        actions: [
            {
                action: 'open',
                title: '🔍 Sprawdź Alert'
            },
            {
                action: 'call',
                title: '📞 Zadzwoń 112'
            }
        ],
        data: alertData
    };
    
    return self.registration.showNotification(title, options);
}

/**
 * 🗃️ CACHE MANAGEMENT FOR BACKGROUND ALERTS
 */
async function getCachedLocation() {
    try {
        const cache = await caches.open('emergency-data');
        const response = await cache.match('/cache/user-location');
        return response ? await response.json() : null;
    } catch (error) {
        return null;
    }
}

async function getCachedNotifiedAlerts() {
    try {
        const cache = await caches.open('emergency-data');
        const response = await cache.match('/cache/notified-alerts');
        return response ? await response.json() : [];
    } catch (error) {
        return [];
    }
}

async function cacheNotifiedAlert(alertId) {
    try {
        const cache = await caches.open('emergency-data');
        const existing = await getCachedNotifiedAlerts();
        const updated = [...existing, alertId].slice(-50); // Keep last 50
        
        await cache.put('/cache/notified-alerts', 
            new Response(JSON.stringify(updated))
        );
    } catch (error) {
        console.warn('Failed to cache notified alert:', error);
    }
}

// Push Notifications - Enhanced functionality
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    console.log('📬 Otrzymano powiadomienie push:', data);

    const title = data.title || '🚨 Bezpieczny Pomocnik';
    const options = {
        body: data.body || 'Nowy alert awaryjny! Sprawdź aplikację.',
        icon: data.icon || './images/logo_192x192.png',
        badge: './images/logo_192x192.png',
        tag: 'emergency-alert',
        requireInteraction: true, // Stays visible until user acts
        vibrate: [200, 100, 200, 100, 200],
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
            clients.openWindow('./index.html')
        );
    }
});

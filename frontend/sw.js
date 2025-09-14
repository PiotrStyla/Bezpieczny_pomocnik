self.addEventListener('push', event => {
    const data = event.data.json();
    console.log('Otrzymano powiadomienie push:', data);

    const title = data.title || 'Bezpieczny Pomocnik';
    const options = {
        body: data.body || 'Nowy alert, sprawdź aplikację.',
        icon: data.icon || '/images/icon-192x192.png',
        badge: '/images/badge-72x72.png'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});

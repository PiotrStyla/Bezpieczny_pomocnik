document.addEventListener('DOMContentLoaded', () => {
    const alertsContainer = document.getElementById('alerts-container');
    const langButtons = document.querySelectorAll('header nav button');
    const notificationsBtn = document.getElementById('notifications-btn');
    const locationFilter = document.getElementById('location-filter');
    
    const API_BASE_URL = '/api'; // Zmiana na ścieżkę względną
    let currentLang = 'pl';
    let allAlerts = [];
    let map;
    let markersLayer;

    const locations = {
        "Polska": [52.23, 21.01],
        "Warszawa": [52.2297, 21.0122],
        "Kraków": [50.0647, 19.9450],
        "Lublin": [51.2465, 22.5684],
        "Białystok": [53.1325, 23.1688]
    };

    function initMap() {
        map = L.map('map').setView([52.0, 19.5], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        markersLayer = L.layerGroup().addTo(map);
    }

    function updateMapMarkers(alerts) {
        markersLayer.clearLayers();
        alerts.forEach(alert => {
            const coords = locations[alert.location];
            if (coords) {
                const color = {
                    info: 'green',
                    caution: 'orange',
                    warning: 'red'
                }[alert.severity];

                const marker = L.circleMarker(coords, {
                    radius: 8,
                    color: 'white',
                    weight: 2,
                    fillColor: color,
                    fillOpacity: 0.9
                }).addTo(markersLayer);
                
                marker.bindPopup(`<b>${alert.title}</b><br>${alert.location}`);
            }
        });
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('Service Worker zarejestrowany:', reg);
            reg.pushManager.getSubscription().then(sub => {
                if (sub) {
                    notificationsBtn.textContent = 'Powiadomienia włączone';
                    notificationsBtn.disabled = true;
                }
            });
        }).catch(err => console.log('Błąd rejestracji Service Workera:', err));
    }

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
        return outputArray;
    }

    async function subscribeUserToPush() {
        try {
            const reg = await navigator.serviceWorker.ready;
            const response = await fetch(`${API_BASE_URL}/vapid_public_key`);
            const { public_key } = await response.json();
            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(public_key)
            });
            await fetch(`${API_BASE_URL}/subscribe`, {
                method: 'POST',
                body: JSON.stringify(subscription),
                headers: { 'Content-Type': 'application/json' }
            });
            notificationsBtn.textContent = 'Powiadomienia włączone';
            notificationsBtn.disabled = true;
        } catch (error) {
            console.error('Błąd podczas subskrypcji powiadomień:', error);
            notificationsBtn.textContent = 'Błąd subskrypcji';
        }
    }

    notificationsBtn.addEventListener('click', () => {
        if ('PushManager' in window) subscribeUserToPush();
        else {
            notificationsBtn.textContent = 'Niewspierane';
            notificationsBtn.disabled = true;
        }
    });

    function renderAlert(alert) {
        const card = document.createElement('div');
        card.className = `alert-card ${alert.severity}`;
        let tipsHtml = '';
        if (alert.tips && alert.tips.length > 0) {
            const tipsList = alert.tips.map(tip => `<li>${tip}</li>`).join('');
            tipsHtml = `<div class="alert-tips"><h4>Co robić?</h4><ul>${tipsList}</ul></div>`;
        }
        const mainContent = alert.simplified_content || alert.content;
        const content = `<div class="alert-content"><h2>${alert.title}</h2><p>${mainContent}</p>${tipsHtml}<div class="alert-meta"><span>Źródło: ${alert.location}</span><span>${new Date(alert.timestamp).toLocaleString(currentLang)}</span></div></div>`;
        card.innerHTML = content;
        return card;
    }

    function displayFilteredAlerts() {
        const selectedLocation = locationFilter.value;
        alertsContainer.innerHTML = '';
        const filtered = allAlerts.filter(alert => selectedLocation === 'all' || alert.location === selectedLocation);

        if (filtered.length === 0) {
            alertsContainer.innerHTML = '<p>Brak komunikatów dla wybranej lokalizacji.</p>';
        } else {
            filtered.forEach(alert => {
                alertsContainer.appendChild(renderAlert(alert));
            });
        }
        updateMapMarkers(filtered);
    }

    async function fetchAndDisplayAlerts(lang = 'pl') {
        alertsContainer.innerHTML = `<div class="loader-container"><div class="loader"></div><p>Ładowanie danych...</p></div>`;
        currentLang = lang;
        try {
            const response = await fetch(`${API_BASE_URL}/alerts?lang=${lang}`);
            if (!response.ok) throw new Error(`Błąd sieci: ${response.statusText}`);
            allAlerts = await response.json();
            displayFilteredAlerts();
        } catch (error) {
            console.error('Nie udało się pobrać alertów:', error);
            alertsContainer.innerHTML = '<p>Wystąpił błąd podczas ładowania danych.</p>';
        }
    }

    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedLang = button.id.replace('lang-', '');
            langButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            fetchAndDisplayAlerts(selectedLang);
        });
    });

    locationFilter.addEventListener('change', displayFilteredAlerts);

    initMap();
    fetchAndDisplayAlerts(currentLang);
});

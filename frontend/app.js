document.addEventListener('DOMContentLoaded', () => {
    const alertsContainer = document.getElementById('alerts-container');
    const langButtons = document.querySelectorAll('header nav button');
    const notificationsBtn = document.getElementById('notifications-btn');
    const locationFilter = document.getElementById('location-filter');
    
    const API_BASE_URL = '/api'; 
    let currentLang = 'pl';
    let allAlerts = [];
    let map;
    let markersLayer;

    // Text-to-Speech functionality
    let speechEnabled = true;
    let currentSpeech = null;
    const speechSynthesis = window.speechSynthesis;
    
    // Geolocation functionality
    let userLocation = null;
    let userLocationMarker = null;

    const locations = {
        "Polska": [52.23, 21.01],
        "Warszawa": [52.2297, 21.0122],
        "Kraków": [50.0647, 19.9450],
        "Lublin": [51.2465, 22.5684],
        "Białystok": [53.1325, 23.1688]
    };

    function initMap() {
        // Skupiamy mapę na Polsce z odpowiednim przybliżeniem
        map = L.map('map').setView([52.1, 19.2], 6);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            minZoom: 5, // Minimum zoom, aby nie oddalać się zbytnio od Polski
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        
        // Ograniczamy widok mapy do granic Polski
        const polandBounds = [
            [48.9, 14.0], // SW corner 
            [55.0, 24.2]  // NE corner
        ];
        map.setMaxBounds(polandBounds);
        map.fitBounds(polandBounds);
        
        markersLayer = L.layerGroup().addTo(map);
        
        // Automatycznie spróbuj uzyskać lokalizację użytkownika
        getUserLocation();
    }

    // Funkcja geolokalizacji
    function getUserLocation() {
        if (!navigator.geolocation) {
            console.log('Geolokalizacja nie jest wspierana przez tę przeglądarkę');
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minut cache
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Sprawdź czy lokalizacja jest w Polsce
                if (lat >= 48.9 && lat <= 55.0 && lng >= 14.0 && lng <= 24.2) {
                    userLocation = [lat, lng];
                    showUserLocationOnMap(lat, lng);
                    updateMascotMessage('locationFound');
                    
                    // Znajdź najbliższe miasto
                    const nearestCity = findNearestCity(lat, lng);
                    if (nearestCity) {
                        updateLocationFilterToNearest(nearestCity);
                    }
                } else {
                    console.log('Lokalizacja poza Polską');
                }
            },
            (error) => {
                console.log('Błąd geolokalizacji:', error.message);
                // Nie pokazujemy błędu dzieciom - po prostu kontynuujemy bez geolokalizacji
            },
            options
        );
    }

    function showUserLocationOnMap(lat, lng) {
        // Usuń poprzedni marker użytkownika
        if (userLocationMarker) {
            map.removeLayer(userLocationMarker);
        }

        // Dodaj nowy marker użytkownika
        userLocationMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'user-location-marker',
                html: '<div style="background: #4A90FF; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(map);

        userLocationMarker.bindPopup(`
            <div style="text-align: center; font-family: 'Comic Neue', sans-serif;">
                <div style="font-size: 24px; margin-bottom: 8px;">📍</div>
                <b>Twoja lokalizacja</b><br>
                <span style="color: #666;">Tutaj jesteś!</span>
            </div>
        `);

        // Delikatnie przesuń mapę aby pokazać lokalizację użytkownika
        map.setView([lat, lng], 8, { animate: true, duration: 1 });
    }

    function findNearestCity(userLat, userLng) {
        let nearest = null;
        let minDistance = Infinity;

        Object.keys(locations).forEach(city => {
            if (city === 'Polska') return; // Pomiń ogólną lokalizację Polski
            
            const [cityLat, cityLng] = locations[city];
            const distance = calculateDistance(userLat, userLng, cityLat, cityLng);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = city;
            }
        });

        return minDistance < 100 ? nearest : null; // Tylko jeśli w promieniu 100km
    }

    function calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Promień Ziemi w km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    function updateLocationFilterToNearest(nearestCity) {
        // Automatycznie ustaw filtr na najbliższe miasto
        if (locationFilter && nearestCity) {
            locationFilter.value = nearestCity;
            displayFilteredAlerts();
            
            // Poinformuj użytkownika
            setTimeout(() => {
                const cityEmoji = {
                    'Warszawa': '🏛️',
                    'Kraków': '🏰', 
                    'Lublin': '🌸',
                    'Białystok': '🌲'
                };
                const message = `Znalazłem cię! Pokazuję alerty dla ${cityEmoji[nearestCity] || '📍'} ${nearestCity}`;
                updateMascotMessage('welcome'); // Temporarily use welcome
                if (mascotText) {
                    mascotText.textContent = message;
                    if (speechEnabled) {
                        speakText(message, currentLang);
                    }
                }
            }, 2000);
        }
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
            // 1) Poproś jawnie o uprawnienie do powiadomień
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn('Powiadomienia zablokowane przez użytkownika/UA');
                notificationsBtn.textContent = 'Zablokowane';
                return;
            }

            // 2) Poczekaj aż SW będzie aktywny
            const reg = await navigator.serviceWorker.ready;

            // 3) Usuń starą subskrypcję (klucze mogły się zmieniać między wdrożeniami)
            const existing = await reg.pushManager.getSubscription();
            if (existing) {
                try {
                    await existing.unsubscribe();
                    console.log('Stara subskrypcja usunięta');
                } catch (e) {
                    console.warn('Nie udało się usunąć starej subskrypcji', e);
                }
            }

            // 4) Pobierz i przygotuj klucz VAPID
            const response = await fetch(`${API_BASE_URL}/vapid_public_key`);
            const { public_key } = await response.json();
            const trimmedKey = (public_key || '').trim();
            const appServerKey = urlBase64ToUint8Array(trimmedKey);

            // 5) Zasubskrybuj push z aktualnym kluczem
            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: appServerKey
            });

            // 6) Zapisz subskrypcję w backendzie
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
        // Add speech toggle button event listener
        document.addEventListener('click', (e) => {
            if (e.target.id === 'speech-toggle-btn' || e.target.closest('#speech-toggle-btn')) {
                toggleSpeech();
            }
            if (e.target.id === 'location-btn' || e.target.closest('#location-btn')) {
                handleLocationButtonClick();
            }
        });

        function handleLocationButtonClick() {
            const locationBtn = document.getElementById('location-btn');
            
            // Pokaż że szukamy lokalizacji
            locationBtn.innerHTML = '<span class="btn-icon">🔄</span><span class="btn-text">Szukam...</span>';
            locationBtn.disabled = true;
            
            updateMascotMessage('loading');
            
            // Wywołaj funkcję geolokalizacji
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Sprawdź czy lokalizacja jest w Polsce
                    if (lat >= 48.9 && lat <= 55.0 && lng >= 14.0 && lng <= 24.2) {
                        userLocation = [lat, lng];
                        showUserLocationOnMap(lat, lng);
                        
                        // Znajdź najbliższe miasto
                        const nearestCity = findNearestCity(lat, lng);
                        if (nearestCity) {
                            updateLocationFilterToNearest(nearestCity);
                            locationBtn.innerHTML = `<span class="btn-icon">📍</span><span class="btn-text">Znaleziono: ${nearestCity}</span>`;
                        } else {
                            locationBtn.innerHTML = '<span class="btn-icon">📍</span><span class="btn-text">Lokalizacja znaleziona</span>';
                        }
                        locationBtn.style.background = '#32D74B';
                    } else {
                        locationBtn.innerHTML = '<span class="btn-icon">🌍</span><span class="btn-text">Poza Polską</span>';
                        locationBtn.style.background = '#FF9500';
                        updateMascotMessage('welcome');
                        if (mascotText) {
                            mascotText.textContent = 'Twoja lokalizacja jest poza Polską. Pokazuję wszystkie alerty.';
                        }
                    }
                    locationBtn.disabled = false;
                },
                (error) => {
                    console.log('Błąd geolokalizacji:', error.message);
                    locationBtn.innerHTML = '<span class="btn-icon">❌</span><span class="btn-text">Nie można znaleźć</span>';
                    locationBtn.style.background = '#FF3B30';  
                    locationBtn.disabled = false;
                    
                    updateMascotMessage('welcome');
                    if (mascotText) {
                        mascotText.textContent = 'Nie mogę znaleźć Twojej lokalizacji. Sprawdź ustawienia przeglądarki lub wybierz miasto ręcznie.';
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0 // Zawsze pobierz świeżą lokalizację przy kliknięciu
                }
            );
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
        // ... (rest of the code remains the same)
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
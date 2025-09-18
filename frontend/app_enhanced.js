document.addEventListener('DOMContentLoaded', () => {
    const alertsContainer = document.getElementById('alerts-container');
    const langButtons = document.querySelectorAll('.lang-btn');
    const notificationsBtn = document.getElementById('notifications-btn');
    const locationFilter = document.getElementById('location-filter');
    const mascotText = document.getElementById('mascot-text');
    
    const API_BASE_URL = '/api';
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

    // Regional dialect localization for children
    const regionalDialects = {
        'Warszawa': {
            'na dwór': 'na dwór',
            'nie wychodź': 'nie wychodź',
            'zostań w domu': 'zostań w domu',
            'bądź ostrożny': 'bądź ostrożny'
        },
        'Kraków': {
            'na dwór': 'na pole',
            'nie wychodź': 'nie wychodź', 
            'zostań w domu': 'zostań w chacie',
            'bądź ostrożny': 'uważaj'
        },
        'Lublin': {
            'na dwór': 'na podwórko',
            'nie wychodź': 'nie idź',
            'zostań w domu': 'zostań w chacie',
            'bądź ostrożny': 'pilnuj się'
        },
        'Białystok': {
            'na dwór': 'na dwór',
            'nie wychodź': 'nie wychodź',
            'zostań w domu': 'zostań w domu',
            'bądź ostrożny': 'bądź ostrożny'
        }
    };

    // Kid-friendly messages for the mascot
    const mascotMessages = {
        pl: {
            welcome: "Cześć! Jestem twoim pomocnikiem bezpieczeństwa. Sprawdź, co dzieje się w twojej okolicy! 🤖",
            loading: "Szukam najnowszych informacji dla ciebie... 🔍",
            noAlerts: "Super! W tej chwili wszystko jest bezpieczne w wybranej lokalizacji! 🌟",
            alertsFound: (count) => `Znalazłem ${count} ważnych informacji dla ciebie. Przeczytaj je uważnie! 📚`,
            notificationEnabled: "Świetnie! Będę cię informować o ważnych rzeczach! 🔔",
            weatherWarning: "Pamiętaj o bezpieczeństwie podczas złej pogody! ⛈️",
            safetyReminder: "Zawsze pamiętaj o zasadach bezpieczeństwa! 🛡️"
        },
        en: {
            welcome: "Hello! I'm your safety helper. Check what's happening in your area! 🤖",
            loading: "Looking for the latest information for you... 🔍",
            noAlerts: "Great! Everything is safe in the selected location right now! 🌟",
            alertsFound: (count) => `I found ${count} important messages for you. Read them carefully! 📚`,
            notificationEnabled: "Great! I'll keep you informed about important things! 🔔",
            weatherWarning: "Remember to stay safe during bad weather! ⛈️",
            safetyReminder: "Always remember the safety rules! 🛡️"
        },
        ua: {
            welcome: "Привіт! Я твій помічник з безпеки. Перевір, що відбувається у твоєму районі! 🤖",
            loading: "Шукаю найновішу інформацію для тебе... 🔍",
            noAlerts: "Чудово! Зараз все безпечно в обраному місці! 🌟",
            alertsFound: (count) => `Знайшов ${count} важливих повідомлень для тебе. Прочитай їх уважно! 📚`,
            notificationEnabled: "Чудово! Я буду повідомляти тебе про важливі речі! 🔔",
            weatherWarning: "Пам'ятай про безпеку під час поганої погоди! ⛈️",
            safetyReminder: "Завжди пам'ятай правила безпеки! 🛡️"
        }
    };

    // Function to localize text based on region and dialect
    function localizeText(text, location) {
        if (!regionalDialects[location]) return text;
        
        let localizedText = text;
        const dialect = regionalDialects[location];
        
        // Apply regional dialect replacements
        Object.keys(dialect).forEach(standard => {
            const regional = dialect[standard];
            const regex = new RegExp(standard, 'gi');
            localizedText = localizedText.replace(regex, regional);
        });
        
        return localizedText;
    }

    // Kid-friendly location names
    const locationNames = {
        pl: {
            "all": "🏠 Wszędzie w Polsce",
            "Warszawa": "🏛️ Warszawa",
            "Kraków": "🏰 Kraków", 
            "Lublin": "🌸 Lublin",
            "Białystok": "🌲 Białystok"
        },
        en: {
            "all": "🏠 Everywhere in Poland",
            "Warszawa": "🏛️ Warsaw",
            "Kraków": "🏰 Krakow",
            "Lublin": "🌸 Lublin", 
            "Białystok": "🌲 Białystok"
        },
        ua: {
            "all": "🏠 Скрізь у Польщі",
            "Warszawa": "🏛️ Варшава",
            "Kraków": "🏰 Краків",
            "Lublin": "🌸 Люблін",
            "Białystok": "🌲 Білосток"
        }
    };

    function updateMascotMessage(messageKey, ...args) {
        const messages = mascotMessages[currentLang];
        let message = messages[messageKey];
        if (typeof message === 'function') {
            message = message(...args);
        }
        if (mascotText) {
            mascotText.textContent = message;
            
            // Add animation to mascot
            const mascot = document.querySelector('.mascot');
            if (mascot) {
                mascot.style.animation = 'none';
                setTimeout(() => {
                    mascot.style.animation = 'wiggle 3s ease-in-out infinite';
                }, 100);
            }
        }
    }

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
                const colorMap = {
                    warning: '#FF3B30',
                    caution: '#FF9500', 
                    info: '#32D74B'
                };
                const color = colorMap[alert.severity] || '#32D74B';

                // Kid-friendly marker icons
                const severityIcons = {
                    warning: '⚠️',
                    caution: '⚡',
                    info: 'ℹ️'
                };
                const icon = severityIcons[alert.severity] || 'ℹ️';

                const marker = L.circleMarker(coords, {
                    radius: 12,
                    color: 'white',
                    weight: 3,
                    fillColor: color,
                    fillOpacity: 0.8
                }).addTo(markersLayer);
                
                const popupContent = `
                    <div style="font-family: 'Comic Neue', sans-serif; padding: 8px;">
                        <div style="font-size: 24px; text-align: center; margin-bottom: 8px;">${icon}</div>
                        <b style="color: ${color};">${alert.title}</b><br>
                        <span style="color: #666;">📍 ${alert.location}</span>
                    </div>
                `;
                marker.bindPopup(popupContent);
            }
        });
    }

    // Service Worker registration for kids
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => {
                console.log('✅ Service Worker registered for kids app');
                return reg.pushManager.getSubscription();
            })
            .then(sub => {
                if (sub) {
                    notificationsBtn.innerHTML = '<span class="btn-icon">🔔</span><span class="btn-text">Powiadomienia włączone!</span>';
                    notificationsBtn.disabled = true;
                    notificationsBtn.style.background = '#32D74B';
                    updateMascotMessage('notificationEnabled');
                }
            })
            .catch(err => console.error('Service Worker error:', err));
    }

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) { 
            outputArray[i] = rawData.charCodeAt(i); 
        }
        return outputArray;
    }

    async function subscribeUserToPush() {
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                notificationsBtn.innerHTML = '<span class="btn-icon">🚫</span><span class="btn-text">Zablokowane</span>';
                notificationsBtn.style.background = '#FF3B30';
                return;
            }

            const reg = await navigator.serviceWorker.ready;

            // Remove old subscription
            const existing = await reg.pushManager.getSubscription();
            if (existing) {
                await existing.unsubscribe();
            }

            const response = await fetch(`${API_BASE_URL}/vapid_public_key`);
            const { public_key } = await response.json();
            const trimmedKey = (public_key || '').trim();
            const appServerKey = urlBase64ToUint8Array(trimmedKey);

            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: appServerKey
            });

            await fetch(`${API_BASE_URL}/subscribe`, {
                method: 'POST',
                body: JSON.stringify(subscription),
                headers: { 'Content-Type': 'application/json' }
            });

            notificationsBtn.innerHTML = '<span class="btn-icon">🔔</span><span class="btn-text">Powiadomienia włączone!</span>';
            notificationsBtn.disabled = true;
            notificationsBtn.style.background = '#32D74B';
            updateMascotMessage('notificationEnabled');
            
        } catch (error) {
            console.error('Push subscription error:', error);
            notificationsBtn.innerHTML = '<span class="btn-icon">❌</span><span class="btn-text">Błąd subskrypcji</span>';
            notificationsBtn.style.background = '#FF3B30';
        }
    }

    function renderAlert(alert) {
        const card = document.createElement('div');
        card.className = `alert-card ${alert.severity || 'info'}`;

        // Kid-friendly severity indicators
        const severityIndicators = {
            warning: '🚨 WAŻNE OSTRZEŻENIE!',
            caution: '⚠️ OSTROŻNIE!',
            info: 'ℹ️ INFORMACJA'
        };

        const indicator = severityIndicators[alert.severity] || 'ℹ️ INFORMACJA';

        let tipsHtml = '';
        if (Array.isArray(alert.tips) && alert.tips.length) {
            // Apply regional localization to tips
            const localizedTips = alert.tips.map(tip => localizeText(tip, alert.location));
            tipsHtml = `
                <div class="alert-tips">
                    <h4>💡 Co masz robić?</h4>
                    <ul>
                        ${localizedTips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>`;
        }

        // Apply regional localization to main content
        const localizedContent = localizeText(alert.simplified_content || alert.content || '', alert.location);
        const timestamp = new Date(alert.timestamp).toLocaleString(currentLang);

        card.innerHTML = `
            <div class="alert-content">
                <div style="color: #FF3B30; font-weight: bold; font-size: 1.1rem; margin-bottom: 8px;">
                    ${indicator}
                </div>
                <h2>${alert.title}</h2>
                <p>${localizedContent}</p>
                ${tipsHtml}
                <div class="alert-meta">
                    <span>📍 ${alert.location}</span>
                    <span>🕒 ${timestamp}</span>
                </div>
            </div>`;
        return card;
    }

    function displayFilteredAlerts() {
        const selectedLocation = locationFilter.value;
        alertsContainer.innerHTML = '';

        const filtered = allAlerts.filter(
            alert => selectedLocation === 'all' || alert.location === selectedLocation
        );

        if (!filtered.length) {
            alertsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; font-size: 1.2rem;">
                    <div style="font-size: 4rem; margin-bottom: 16px;">🌟</div>
                    <p><strong>Świetnie! Wszystko jest bezpieczne!</strong></p>
                    <p>W wybranej lokalizacji nie ma obecnie żadnych ostrzeżeń.</p>
                </div>`;
            updateMascotMessage('noAlerts');
        } else {
            filtered.forEach(alert => {
                alertsContainer.appendChild(renderAlert(alert));
            });
            updateMascotMessage('alertsFound', filtered.length);
            
            // Add safety reminders based on alert types
            const hasWeatherAlert = filtered.some(alert => 
                alert.title.toLowerCase().includes('wiatr') || 
                alert.title.toLowerCase().includes('burza') ||
                alert.title.toLowerCase().includes('śnieg')
            );
            
            if (hasWeatherAlert) {
                setTimeout(() => updateMascotMessage('weatherWarning'), 3000);
            }
        }
        updateMapMarkers(filtered);
    }

    async function fetchAndDisplayAlerts(lang = 'pl') {
        alertsContainer.innerHTML = `
            <div class="loader-container">
                <div class="loader"></div>
                <p style="font-size: 1.2rem; font-weight: 600;">Ładowanie informacji dla ciebie...</p>
            </div>`;
        
        updateMascotMessage('loading');
        currentLang = lang;
        
        try {
            const response = await fetch(`${API_BASE_URL}/alerts?lang=${lang}`);
            allAlerts = await response.json();
            displayFilteredAlerts();
            
            // Update location filter options
            updateLocationFilter();
            
        } catch (error) {
            console.error('❌ Error fetching alerts:', error);
            alertsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #FF3B30;">
                    <div style="font-size: 4rem; margin-bottom: 16px;">😞</div>
                    <p><strong>Ups! Coś poszło nie tak...</strong></p>
                    <p>Nie mogę teraz pobrać informacji. Spróbuj ponownie za chwilę.</p>
                </div>`;
        }
    }

    function updateLocationFilter() {
        const options = locationFilter.querySelectorAll('option');
        const names = locationNames[currentLang];
        
        options.forEach(option => {
            const value = option.value;
            if (names[value]) {
                option.textContent = names[value];
            }
        });
    }

    // Event listeners
    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedLang = button.id.replace('lang-', '');
            langButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update UI language
            updateUILanguage(selectedLang);
            fetchAndDisplayAlerts(selectedLang);
        });
    });

    function updateUILanguage(lang) {
        const texts = {
            pl: {
                title: 'Bezpieczny Pomocnik',
                subtitle: 'Twój przyjaciel bezpieczeństwa!',
                choosePlace: '🌍 Wybierz miejsce',
                notifications: '🔔 Powiadomienia',
                enableNotifications: 'Włącz powiadomienia',
                mapTitle: '🗺️ Mapa bezpieczeństwa',
                alertsTitle: '📢 Ważne wiadomości dla ciebie',
                tipsTitle: '💡 Złote zasady bezpieczeństwa',
                emergencyTitle: '🚨 W nagłych wypadkach'
            },
            en: {
                title: 'Safety Helper',
                subtitle: 'Your safety friend!',
                choosePlace: '🌍 Choose location',
                notifications: '🔔 Notifications',
                enableNotifications: 'Enable notifications',
                mapTitle: '🗺️ Safety map',
                alertsTitle: '📢 Important messages for you',
                tipsTitle: '💡 Golden safety rules',
                emergencyTitle: '🚨 In emergencies'
            },
            ua: {
                title: 'Безпечний Помічник',
                subtitle: 'Твій друг безпеки!',
                choosePlace: '🌍 Обери місце',
                notifications: '🔔 Сповіщення',
                enableNotifications: 'Увімкнути сповіщення',
                mapTitle: '🗺️ Карта безпеки',
                alertsTitle: '📢 Важливі повідомлення для тебе',
                tipsTitle: '💡 Золоті правила безпеки',
                emergencyTitle: '🚨 У надзвичайних ситуаціях'
            }
        };

        const t = texts[lang];
        const titleEl = document.querySelector('.kids-title');
        const subtitleEl = document.querySelector('.kids-subtitle');
        
        if (titleEl) titleEl.textContent = t.title;
        if (subtitleEl) subtitleEl.textContent = t.subtitle;
        
        // Update section titles
        const sectionTitles = document.querySelectorAll('.section-title');
        if (sectionTitles[0]) sectionTitles[0].textContent = t.mapTitle;
        if (sectionTitles[1]) sectionTitles[1].textContent = t.alertsTitle;
        if (sectionTitles[2]) sectionTitles[2].textContent = t.tipsTitle;
        if (sectionTitles[3]) sectionTitles[3].textContent = t.emergencyTitle;
    }

    notificationsBtn.addEventListener('click', () => {
        if ('PushManager' in window) {
            subscribeUserToPush();
        } else {
            notificationsBtn.innerHTML = '<span class="btn-icon">❌</span><span class="btn-text">Niewspierane</span>';
            notificationsBtn.disabled = true;
            notificationsBtn.style.background = '#FF3B30';
        }
    });

    locationFilter.addEventListener('change', displayFilteredAlerts);

    // Initialize the app
    initMap();
    fetchAndDisplayAlerts(currentLang);
    
    // Add periodic safety reminders
    setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance every interval
            updateMascotMessage('safetyReminder');
        }
    }, 30000); // Every 30 seconds

    // Welcome message on load
    setTimeout(() => {
        updateMascotMessage('welcome');
    }, 1000);
});

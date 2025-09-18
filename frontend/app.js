document.addEventListener('DOMContentLoaded', () => {
    const alertsContainer = document.getElementById('alerts-container');
    const langButtons = document.querySelectorAll('.lang-btn');
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
    
    // Get mascot text element
    const mascotText = document.getElementById('mascot-text');
    
    // Mascot messages
    const mascotMessages = {
        pl: {
            welcome: "Cześć! Jestem twoim pomocnikiem bezpieczeństwa. Sprawdź, co dzieje się w twojej okolicy!",
            loading: "Szukam najnowszych informacji dla ciebie...",
            noAlerts: "Super! W tej chwili wszystko jest bezpieczne w wybranej lokalizacji!"
        },
        en: {
            welcome: "Hi! I'm your safety helper. Check what's happening in your area!",
            loading: "Looking for the latest information for you...",
            noAlerts: "Great! Everything is safe in the selected location right now!"
        },
        ua: {
            welcome: "Привіт! Я твій помічник з безпеки. Подивись, що відбувається в твоєму районі!",
            loading: "Шукаю найсвіжішу інформацію для тебе...",
            noAlerts: "Чудово! Зараз все безпечно в обраній локації!"
        }
    };
    
    // Foundation footer messages
    const foundationMessages = {
        pl: {
            header: "Stworzone z ❤️ przez",
            note: "Ta aplikacja jest <strong>całkowicie bezpłatna</strong>.<br>Jeśli chcesz wspierać rozwój aplikacji,<br>możesz przekazać darowiznę na konto Fundacji.",
            button: "🌟 Wspieraj Fundację"
        },
        en: {
            header: "Created with ❤️ by",
            note: "This app is <strong>completely free</strong>.<br>If you want to support app development,<br>you can donate to the Foundation.",
            button: "🌟 Support Foundation"
        },
        ua: {
            header: "Створено з ❤️",
            note: "Цей додаток <strong>повністю безкоштовний</strong>.<br>Якщо ви хочете підтримати розвиток додатку,<br>ви можете зробити пожертву Фонду.",
            button: "🌟 Підтримати Фонд"
        }
    };
    
    // Safety tips and emergency contact messages
    const safetyContent = {
        pl: {
            tips: {
                'Bezpieczeństwo na drodze': 'Pamiętaj! Zawsze patrz w lewo i prawo przed przejściem przez ulicę. Najpierw patrz w lewo, potem w prawo, i znów w lewo. Jeśli nie ma samochodów, możesz przejść.',
                'W domu': 'W domu zapamiętaj ważne numery telefonu. Numer do rodziców i numer alarmowy jeden jeden dwa. Jeśli coś się stanie, zawsze możesz zadzwonić po pomoc.',
                'Z nieznajomymi': 'Nigdy nie rozmawiaj z nieznajomymi ludźmi na ulicy. Nie chodź z nimi nigdzie i nie bierz od nich żadnych prezentów. Jeśli ktoś cię zaczepia, uciekaj do najbliższego dorosłego.',
                'Zła pogoda': 'Gdy jest burza, zostań w domu lub w bezpiecznym budynku. Unikaj wysokich drzew i nie stój pod nimi. Pioruny mogą być bardzo niebezpieczne.'
            },
            emergency: {
                'Pogotowie ratunkowe': 'Pogotowie ratunkowe to numer jeden jeden dwa. Zapamiętaj: jeden, jeden, dwa. Dzwoń gdy ktoś jest ranny, chory lub w niebezpieczeństwie. To jest najważniejszy numer który musisz zapamiętać.',
                'Policja': 'Policja to numer dziewięć dziewięć siedem. Zapamiętaj: dziewięć, dziewięć, siedem. Dzwoń gdy widzisz przestępstwo lub ktoś cię straszy. Policjanci są po to żeby cię chronić.',
                'Straż pożarna': 'Straż pożarna to numer dziewięć dziewięć osiem. Zapamiętaj: dziewięć, dziewięć, osiem. Dzwoń gdy widzisz pożar, kogoś trzeba ratować, lub gdy coś eksplodowało. Strażacy są bardzo odważni i pomogą.'
            }
        },
        en: {
            tips: {
                'Road safety': 'Remember! Always look left and right before crossing the street. First look left, then right, then left again. If there are no cars, you can cross.',
                'At home': 'At home, remember important phone numbers. Your parents\' number and emergency number one one two. If something happens, you can always call for help.',
                'With strangers': 'Never talk to strangers on the street. Don\'t go anywhere with them and don\'t take any gifts from them. If someone bothers you, run to the nearest adult.',
                'Bad weather': 'When there\'s a storm, stay at home or in a safe building. Avoid tall trees and don\'t stand under them. Lightning can be very dangerous.'
            },
            emergency: {
                'Emergency services': 'Emergency services number is one one two. Remember: one, one, two. Call when someone is hurt, sick or in danger. This is the most important number you must remember.',
                'Police': 'Police number is nine nine seven. Remember: nine, nine, seven. Call when you see a crime or someone scares you. Police officers are there to protect you.',
                'Fire department': 'Fire department number is nine nine eight. Remember: nine, nine, eight. Call when you see a fire, someone needs rescue, or something exploded. Firefighters are very brave and will help.'
            }
        },
        ua: {
            tips: {
                'Безпека на дорозі': 'Пам\'ятай! Завжди дивися ліворуч і праворуч перед переходом через вулицю. Спочатку подивись ліворуч, потім праворуч, і знову ліворуч. Якщо немає машин, можеш переходити.',
                'Вдома': 'Вдома запам\'ятай важливі номери телефонів. Номер батьків і екстрений номер один один два. Якщо щось станеться, завжди можеш подзвонити по допомогу.',
                'З незнайомцями': 'Ніколи не розмовляй з незнайомими людьми на вулиці. Не йди з ними нікуди і не бери від них подарунки. Якщо хтось тебе чіпляє, біжи до найближчого дорослого.',
                'Погана погода': 'Коли гроза, залишайся вдома або в безпечній будівлі. Уникай високих дерев і не стій під ними. Блискавки можуть бути дуже небезпечними.'
            },
            emergency: {
                'Швидка допомога': 'Швидка допомога це номер один один два. Запам\'ятай: один, один, два. Дзвони коли хтось поранений, хворий або в небезпеці. Це найважливіший номер який ти маєш запам\'ятати.',
                'Поліція': 'Поліція це номер дев\'ять дев\'ять сім. Запам\'ятай: дев\'ять, дев\'ять, сім. Дзвони коли бачиш злочин або хтось тебе лякає. Поліцейські тут щоб тебе захищати.',
                'Пожежна служба': 'Пожежна служба це номер дев\'ять дев\'ять вісім. Запам\'ятай: дев\'ять, дев\'ять, вісім. Дзвони коли бачиш пожежу, когось треба рятувати, або щось вибухнуло. Пожежники дуже сміливі і допоможуть.'
            }
        }
    };
    
    function updateFooterLanguage(lang) {
        const messages = foundationMessages[lang] || foundationMessages.pl;
        const headerEl = document.getElementById('foundation-header');
        const noteEl = document.getElementById('foundation-note');
        const buttonEl = document.getElementById('donation-btn');
        
        if (headerEl) headerEl.textContent = messages.header;
        if (noteEl) noteEl.innerHTML = messages.note;
        if (buttonEl) buttonEl.innerHTML = messages.button;
    }
    
    // Speech and mascot functions
    function updateMascotMessage(messageKey) {
        const messages = mascotMessages[currentLang] || mascotMessages.pl;
        const message = messages[messageKey] || messages.welcome;
        if (mascotText) {
            mascotText.textContent = message;
        }
    }
    
    function toggleSpeech() {
        speechEnabled = !speechEnabled;
        const speechBtn = document.getElementById('speech-toggle-btn');
        
        if (speechEnabled) {
            speechBtn.innerHTML = '<span class="btn-icon">🔊</span><span class="btn-text">Czytanie włączone</span>';
            speechBtn.style.background = '#32D74B';
        } else {
            speechBtn.innerHTML = '<span class="btn-icon">🔇</span><span class="btn-text">Czytanie wyłączone</span>';
            speechBtn.style.background = '#FF9500';
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        }
    }
    
    function speakText(text, lang = 'pl') {
        console.log('🗣️ Próba mowy:', text, 'Lang:', lang, 'Enabled:', speechEnabled);
        
        if (!speechEnabled) {
            console.log('❌ Mowa wyłączona');
            return;
        }
        
        if (!window.speechSynthesis) {
            console.log('❌ Brak wsparcia TTS w przeglądarce');
            return;
        }
        
        // Zatrzymaj poprzednią mowę
        if (window.speechSynthesis.speaking) {
            console.log('🛑 Zatrzymuję poprzednią mowę');
            window.speechSynthesis.cancel();
        }
        
        // Poczekaj chwilę, żeby mózg dziecka się przygotował
        setTimeout(() => {
            console.log('🎤 Rozpoczynam mowę...');
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Ustawienia dla dzieci
            const langCodes = {
                'pl': 'pl-PL',
                'en': 'en-US', 
                'ua': 'uk-UA'
            };
            
            utterance.lang = langCodes[lang] || 'pl-PL';
            utterance.rate = 0.7; // Wolniej dla dzieci
            utterance.pitch = 1.2; // Wyżej, przyjazniej 
            utterance.volume = 0.9; // Głośno, ale nie za głośno
            
            // Spróbuj znaleźć głos dla konkretnego języka
            const voices = window.speechSynthesis.getVoices();
            console.log('🔊 Dostępne głosy:', voices.length, 'Szukam dla:', utterance.lang);
            
            // Lista preferowanych głosów dla każdego języka
            let preferredVoice = null;
            
            if (lang === 'en') {
                // Angielski - szukaj natywnych głosów US/UK
                preferredVoice = voices.find(voice => 
                    (voice.lang === 'en-US' || voice.lang === 'en-GB') &&
                    (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('zira') || voice.name.toLowerCase().includes('susan'))
                ) || voices.find(voice => voice.lang.startsWith('en'));
            } else if (lang === 'ua') {
                // Ukraiński - spróbuj ukraińskich głosów
                preferredVoice = voices.find(voice => 
                    voice.lang === 'uk-UA' || voice.lang.startsWith('uk')
                ) || voices.find(voice => 
                    // Fallback - rosyjski może być bardziej zrozumiały niż polski dla ukraińskiego tekstu
                    voice.lang === 'ru-RU' || voice.lang.startsWith('ru')
                );
            } else {
                // Polski - szukaj polskich głosów
                preferredVoice = voices.find(voice => 
                    voice.lang === 'pl-PL' && 
                    (voice.name.toLowerCase().includes('paulina') || voice.name.toLowerCase().includes('zofia'))
                ) || voices.find(voice => voice.lang.startsWith('pl'));
            }
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
                console.log('✅ Używam głosu:', preferredVoice.name, 'Lang:', preferredVoice.lang);
            } else {
                console.log('⚠️ Brak głosu dla', lang, '- używam domyślnego');
                // Jeśli nie ma głosu dla ukraińskiego, wymuś angielski zamiast polskiego
                if (lang === 'ua') {
                    const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
                    if (englishVoice) {
                        utterance.voice = englishVoice;
                        console.log('🔄 Fallback na angielski dla ukraińskiego:', englishVoice.name);
                    }
                }
            }
            
            // Events
            utterance.onstart = () => {
                console.log('🎵 Mowa rozpoczęta');
                const mascot = document.querySelector('.mascot');
                if (mascot) {
                    mascot.classList.add('speaking');
                }
            };
            
            utterance.onend = () => {
                console.log('✅ Mowa zakończona');
                const mascot = document.querySelector('.mascot');
                if (mascot) {
                    mascot.classList.remove('speaking');
                }
            };
            
            utterance.onerror = (event) => {
                console.log('❌ Błąd mowy:', event.error);
            };
            
            try {
                window.speechSynthesis.speak(utterance);
                console.log('🚀 Komenda speak() wysłana');
            } catch (error) {
                console.log('💥 Błąd podczas speak():', error);
            }
            
        }, 300); // Krótka pauza przed rozpoczęciem mowy
    }

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
            
            // Poinformuj użytkownika - czytelnie dla dzieci
            setTimeout(() => {
                const cityMessages = {
                    pl: {
                        'Warszawa': 'Znalazłem cię w Warszawie! Teraz pokażę ci, co dzieje się w twojej stolicy.',
                        'Kraków': 'Znalazłem cię w Krakowie! Teraz pokażę ci, co dzieje się w twoim pięknym mieście.',
                        'Lublin': 'Znalazłem cię w Lublinie! Teraz pokażę ci, co dzieje się w twoim mieście.',
                        'Białystok': 'Znalazłem cię w Białymstoku! Teraz pokażę ci, co dzieje się w twoim mieście.'
                    },
                    en: {
                        'Warszawa': 'Found you in Warsaw! Now I\'ll show you what\'s happening in your capital.',
                        'Kraków': 'Found you in Krakow! Now I\'ll show you what\'s happening in your beautiful city.',
                        'Lublin': 'Found you in Lublin! Now I\'ll show you what\'s happening in your city.',
                        'Białystok': 'Found you in Bialystok! Now I\'ll show you what\'s happening in your city.'
                    },
                    ua: {
                        'Warszawa': 'Знайшов тебе у Варшаві! Тепер покажу, що відбувається в твоїй столиці.',
                        'Kraków': 'Знайшов тебе у Кракові! Тепер покажу, що відбувається в твоєму прекрасному місті.',
                        'Lublin': 'Знайшов тебе у Любліні! Тепер покажу, що відбувається в твоєму місті.',
                        'Białystok': 'Знайшов тебе у Білостоці! Тепер покажу, що відбувається в твоєму місті.'
                    }
                };
                
                const langMessages = cityMessages[currentLang] || cityMessages.pl;
                const message = langMessages[nearestCity] || 
                    (currentLang === 'en' ? `Found you in ${nearestCity}! Now I'll show you local information.` :
                     currentLang === 'ua' ? `Знайшов тебе в ${nearestCity}! Тепер покажу місцеву інформацію.` :
                     `Znalazłem cię w ${nearestCity}! Teraz pokażę ci lokalne informacje.`);
                
                updateMascotMessage('welcome');
                if (mascotText) {
                    mascotText.textContent = message;
                    if (speechEnabled) {
                        // Daj czas na przeczytanie przed mówieniem
                        setTimeout(() => {
                            speakText(message, currentLang);
                        }, 800);
                    }
                }
            }, 1500);
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
                        
                        // Nie dodawaj własnej wiadomości - updateLocationFilterToNearest to zrobi
                        
                    } else {
                        locationBtn.innerHTML = '<span class="btn-icon">📍</span><span class="btn-text">Lokalizacja znaleziona</span>';
                        const message = "Znalazłem twoją lokalizację na mapie!";
                        if (mascotText) mascotText.textContent = message;
                        if (speechEnabled) speakText(message, currentLang);
                    }
                    locationBtn.style.background = '#32D74B';
                } else {
                    locationBtn.innerHTML = '<span class="btn-icon">🌍</span><span class="btn-text">Poza Polską</span>';
                    locationBtn.style.background = '#FF9500';
                    const message = 'Twoja lokalizacja jest poza Polską. Pokazuję wszystkie alerty z Polski.';
                    if (mascotText) mascotText.textContent = message;
                    if (speechEnabled) speakText(message, currentLang);
                }
                locationBtn.disabled = false;
            },
            (error) => {
                console.log('Błąd geolokalizacji:', error.message);
                locationBtn.innerHTML = '<span class="btn-icon">❌</span><span class="btn-text">Nie można znaleźć</span>';
                locationBtn.style.background = '#FF3B30';  
                locationBtn.disabled = false;
                
                const message = 'Nie mogę znaleźć twojej lokalizacji. Sprawdź ustawienia przeglądarki albo wybierz miasto z listy.';
                if (mascotText) mascotText.textContent = message;
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0 // Zawsze pobierz świeżą lokalizację przy kliknięciu
            }
        );
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
            updateFooterLanguage(selectedLang);
        });
    });

    locationFilter.addEventListener('change', displayFilteredAlerts);
    
    // Initialize speech synthesis voices
    function initializeSpeech() {
        // Czekamy na załadowanie głosów
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.addEventListener('voiceschanged', () => {
                console.log('Głosy załadowane:', window.speechSynthesis.getVoices().length);
            });
        }
    }
    
    // Initialize app
    initMap();
    fetchAndDisplayAlerts(currentLang);
    initializeSpeech();
    
    // Powitanie po 2 sekundach (daj czas na załadowanie)
    setTimeout(() => {
        updateMascotMessage('welcome');
        // Automatyczne powitanie głosem - używaj wiadomość z mascotMessages
        setTimeout(() => {
            const messages = mascotMessages[currentLang] || mascotMessages.pl;
            const welcomeMessage = messages.welcome;
            if (speechEnabled && mascotText) {
                speakText(welcomeMessage, currentLang);
            }
        }, 1000);
    }, 2000);
    
    // Safety tip and emergency card click handlers
    function handleSafetyCardClick(e) {
        const card = e.target.closest('.tip-card, .emergency-card');
        if (!card) return;
        
        const title = card.querySelector('h4')?.textContent;
        if (!title) return;
        
        const content = safetyContent[currentLang] || safetyContent.pl;
        let message = '';
        
        if (card.classList.contains('tip-card')) {
            message = content.tips[title];
        } else if (card.classList.contains('emergency-card')) {
            message = content.emergency[title];
        }
        
        if (message && speechEnabled) {
            // Visual feedback
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
            
            // Speak the content
            speakText(message, currentLang);
            
            // Update mascot
            updateMascotMessage('loading');
            if (mascotText) {
                const intro = currentLang === 'en' ? 'Let me tell you about ' : 
                             currentLang === 'ua' ? 'Розповім тобі про ' : 
                             'Opowiem ci o ';
                mascotText.textContent = intro + title.toLowerCase();
            }
        }
    }
    
    // Add event listeners for all interactive elements
    document.addEventListener('click', (e) => {
        if (e.target.id === 'speech-toggle-btn' || e.target.closest('#speech-toggle-btn')) {
            toggleSpeech();
        }
        if (e.target.id === 'location-btn' || e.target.closest('#location-btn')) {
            handleLocationButtonClick();
        }
        if (e.target.closest('.tip-card, .emergency-card')) {
            handleSafetyCardClick(e);
        }
    });
});

// Globalna funkcja testowa dla przycisku
window.testSpeech = function() {
    console.log('🎤 TEST: Kliknięto przycisk test mowy');
    const testMessage = "Witaj! To jest test mowy. Jeśli mnie słyszysz, znaczy że wszystko działa!";
    
    if (window.speechSynthesis) {
        // Wymuszenie TTS bez sprawdzania speechEnabled
        const utterance = new SpeechSynthesisUtterance(testMessage);
        utterance.lang = 'pl-PL';
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;
        
        utterance.onstart = () => console.log('🎵 Test mowy rozpoczęty');
        utterance.onend = () => console.log('✅ Test mowy zakończony');
        utterance.onerror = (e) => console.log('❌ Błąd test mowy:', e.error);
        
        window.speechSynthesis.speak(utterance);
        console.log('🚀 Test speak() wysłany');
    } else {
        console.log('❌ Brak TTS w przeglądarce');
        alert('Twoja przeglądarka nie obsługuje mowy!');
    }
};
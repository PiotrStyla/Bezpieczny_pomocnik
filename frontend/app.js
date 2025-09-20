/*
 * Bezpieczny Pomocnik - Child Safety Application
 * Copyright (c) 2025 Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie
 * All Rights Reserved. Proprietary and Confidential.
 * 
 * This software is the exclusive property of:
 * Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie
 * 30-404 Kraków, ul. Cegielniana 6B/45
 * Tel. +48 735 749 618 | Email: kontakt@fundacja-hospicjum.org
 * KRS: 0001063161 | NIP: 6793279476 | REGON: 526664276
 * 
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * For licensing inquiries: kontakt@fundacja-hospicjum.org
 */

document.addEventListener('DOMContentLoaded', function() {
    const alertsContainer = document.getElementById('alerts-container');
    const langButtons = document.querySelectorAll('.lang-btn');
    const notificationsBtn = document.getElementById('notifications-btn');
    const locationFilter = document.getElementById('location-filter');
    
    const API_BASE_URL = '/api'; 
    let allAlerts = [];
    let currentLang = 'pl';
    let speechEnabled = false;
    let currentLocation = null;
    let isOffline = false;
    let offlineData = null;
    let heroesData = null;
    let playerProgress = {
        current_hero: null,
        xp: 0,
        level: 1,
        achievements: [],
        daily_streak: 0,
        last_login: null
    };
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
                'Straż pożarna': 'Straż pożarna to numer dziewięć dziewięć osiem. Zapamiętaj: dziewięć, dziewięć, osiem. Dzwoń gdy widzisz ogień, dym, lub ktoś potrzebuje ratunku. Strażacy są bardzo odważni i pomogą.'
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
                'Fire department': 'Fire department number is nine nine eight. Remember: nine, nine, eight. Call when you see fire, smoke, or someone needs rescue. Firefighters are very brave and will help.'
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
                'Пожежна служба': 'Пожежна служба це номер дев\'ять дев\'ять вісім. Запам\'ятай: дев\'ять, дев\'ять, вісім. Дзвони коли бачиш вогонь, дим, або комусь потрібна допомога. Пожежники дуже сміливі і допоможуть.'
            }
        }
    };
    
    // Card title translations
    const cardTitles = {
        pl: {
            // Safety tips
            'Bezpieczeństwo na drodze': 'Bezpieczeństwo na drodze',
            'W domu': 'W domu', 
            'Z nieznajomymi': 'Z nieznajomymi',
            'Zła pogoda': 'Zła pogoda',
            // Emergency
            'Pogotowie ratunkowe': 'Pogotowie ratunkowe',
            'Policja': 'Policja',
            'Straż pożarna': 'Straż pożarna'
        },
        en: {
            // Safety tips  
            'Bezpieczeństwo na drodze': 'Road safety',
            'W domu': 'At home',
            'Z nieznajomymi': 'With strangers', 
            'Zła pogoda': 'Bad weather',
            // Emergency
            'Pogotowie ratunkowe': 'Emergency services',
            'Policja': 'Police',
            'Straż pożarna': 'Fire department'
        },
        ua: {
            // Safety tips
            'Bezpieczeństwo na drodze': 'Безпека на дорозі',
            'W domu': 'Вдома',
            'Z nieznajomymi': 'З незнайомцями',
            'Zła pogoda': 'Погана погода', 
            // Emergency
            'Pogotowie ratunkowe': 'Швидка допомога',
            'Policja': 'Поліція',
            'Straż pożarna': 'Пожежна служба'
        }
    };
    
    function updateCardTitles(lang) {
        const titles = cardTitles[lang] || cardTitles.pl;
        
        // Update safety tip cards
        document.querySelectorAll('.tip-card h4').forEach(h4 => {
            const originalKey = h4.getAttribute('data-original') || h4.textContent;
            if (!h4.getAttribute('data-original')) {
                h4.setAttribute('data-original', originalKey);
            }
            if (titles[originalKey]) {
                h4.textContent = titles[originalKey];
            }
        });
        
        // Update emergency cards  
        document.querySelectorAll('.emergency-card h4').forEach(h4 => {
            const originalKey = h4.getAttribute('data-original') || h4.textContent;
            if (!h4.getAttribute('data-original')) {
                h4.setAttribute('data-original', originalKey);
            }
            if (titles[originalKey]) {
                h4.textContent = titles[originalKey];
            }
        });
    }
    
    function updateFooterLanguage(lang) {
        const messages = foundationMessages[lang] || foundationMessages.pl;
        const headerEl = document.getElementById('foundation-header');
        const noteEl = document.getElementById('foundation-note');
        const buttonEl = document.getElementById('donation-btn');
        
        if (headerEl) headerEl.textContent = messages.header;
        if (noteEl) noteEl.innerHTML = messages.note;
        if (buttonEl) buttonEl.innerHTML = messages.button;
        
        // Update copyright text 
        const copyrightTexts = {
            pl: 'Wszelkie prawa zastrzeżone. Własność i poufność.',
            en: 'All Rights Reserved. Proprietary and Confidential.',
            ua: 'Усі права захищені. Власність та конфіденційність.'
        };
        
        const rightsEl = document.querySelector('.rights-reserved');
        if (rightsEl) {
            rightsEl.textContent = copyrightTexts[lang] || copyrightTexts.pl;
        }
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
                console.log('🔍 Szukam głosu angielskiego...');
                preferredVoice = voices.find(voice => 
                    (voice.lang === 'en-US' || voice.lang === 'en-GB') &&
                    (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('zira') || voice.name.toLowerCase().includes('susan'))
                ) || voices.find(voice => voice.lang.startsWith('en'));
                console.log('🇺🇸 Znaleziony głos angielski:', preferredVoice?.name || 'BRAK');
            } else if (lang === 'ua') {
                console.log('🔍 Szukam głosu ukraińskiego...');
                preferredVoice = voices.find(voice => 
                    voice.lang === 'uk-UA' || voice.lang.startsWith('uk')
                );
                console.log('🇺🇦 Znaleziony głos ukraiński:', preferredVoice?.name || 'BRAK');
                
                if (!preferredVoice) {
                    console.log('🔍 Szukam fallback rosyjskiego...');
                    preferredVoice = voices.find(voice => 
                        voice.lang === 'ru-RU' || voice.lang.startsWith('ru')
                    );
                    console.log('🇷🇺 Znaleziony głos rosyjski:', preferredVoice?.name || 'BRAK');
                }
                
                if (!preferredVoice) {
                    console.log('⚠️ Brak głosu ukraińskiego/rosyjskiego, używam angielskiego');
                    preferredVoice = voices.find(voice => voice.lang.startsWith('en'));
                    console.log('🇺🇸 Fallback angielski:', preferredVoice?.name || 'BRAK');
                }
            } else { // 'pl'
                console.log('🔍 Szukam głosu polskiego...');
                preferredVoice = voices.find(voice => 
                    voice.lang === 'pl-PL' && 
                    (voice.name.toLowerCase().includes('paulina') || voice.name.toLowerCase().includes('zofia'))
                ) || voices.find(voice => voice.lang.startsWith('pl'));
                console.log('🇵🇱 Znaleziony głos polski:', preferredVoice?.name || 'BRAK');
            }
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
                console.log('✅ Używam głosu:', preferredVoice.name, 'Lang:', preferredVoice.lang);
            } else {
                console.log('⚠️ Brak głosu dla', lang, '- używam domyślnego');
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
                if (event.error === 'not-allowed') {
                    console.log('🔄 Spróbuję ponownie z defaultowym głosem...');
                    // Retry without voice selection
                    setTimeout(() => {
                        const retryUtterance = new SpeechSynthesisUtterance(text);
                        retryUtterance.lang = utterance.lang;
                        retryUtterance.rate = 0.7;
                        retryUtterance.pitch = 1.2;
                        retryUtterance.volume = 0.9;
                        
                        retryUtterance.onstart = () => {
                            console.log('🎵 Retry: Mowa rozpoczęta');
                            const mascot = document.querySelector('.mascot');
                            if (mascot) mascot.classList.add('speaking');
                        };
                        
                        retryUtterance.onend = () => {
                            console.log('✅ Retry: Mowa zakończona');
                            const mascot = document.querySelector('.mascot');
                            if (mascot) mascot.classList.remove('speaking');
                        };
                        
                        // Don't set specific voice - use default
                        window.speechSynthesis.speak(retryUtterance);
                        console.log('🚀 Retry: Komenda speak() wysłana bez konkretnego głosu');
                    }, 500);
                }
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
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Zapisz lokalizację użytkownika
                userLocation = { lat: lat, lon: lng };
                
                // Wyśrodkuj mapę na lokalizacji użytkownika
                map.setView([lat, lng], 10);
                
                // Usuń poprzedni marker użytkownika
                if (userLocationMarker) {
                    map.removeLayer(userLocationMarker);
                }
                
                // Dodaj marker lokalizacji użytkownika
                userLocationMarker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'user-location-marker',
                        html: '<div class="user-marker">📍</div>',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })
                }).addTo(map);
                
                userLocationMarker.bindPopup('Twoja lokalizacja').openPopup();
                
                console.log(`Lokalizacja użytkownika: ${lat}, ${lng}`);
                
                // Aktualizuj źródła alertów dla nowej lokalizacji
                try {
                    const updateResult = await updateLocationSources(lat, lng);
                    if (updateResult && updateResult.status === 'success') {
                        console.log('Źródła alertów zaktualizowane dla lokalizacji:', updateResult.location);
                        
                        // Odśwież alerty z nowymi źródłami
                        await fetchAndDisplayAlerts(currentLang);
                        
                        // Pokaż informacje o pokryciu
                        showLocationCoverageInfo(updateResult.updated_coverage);
                    }
                } catch (error) {
                    console.error('Błąd aktualizacji źródeł alertów:', error);
                }
                
                updateMascotMessage('welcome');
            },
            (error) => {
                console.error('Błąd geolokalizacji:', error);
                updateMascotMessage('welcome');
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

    // Fetch alerts - now with location support
    async function fetchAlerts(userLocation = null) {
        const lang = document.documentElement.lang || 'pl';
        
        if (userLocation && userLocation.lat && userLocation.lon) {
            // Fetch location-specific alerts
            const response = await fetch(`${API_BASE_URL}/alerts/location?lat=${userLocation.lat}&lon=${userLocation.lon}&lang=${lang}`);
            return await response.json();
        } else {
            // Fetch all Poland alerts (fallback)
            const response = await fetch(`${API_BASE_URL}/alerts?lang=${lang}`);
            return await response.json();
        }
    }

    // Load heroes data
    async function loadHeroesSystem() {
        console.log('🎮 Starting heroes system initialization...');
        try {
            console.log('📥 Fetching heroes data from /data/heroes-system.json');
            const response = await fetch('/data/heroes-system.json');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch heroes data: ${response.status} ${response.statusText}`);
            }
            
            heroesData = await response.json();
            console.log('✅ Heroes system loaded successfully:', heroesData);
            
            // Load player progress from localStorage
            const saved = localStorage.getItem('bezpieczny_pomocnik_progress');
            if (saved) {
                console.log('📊 Loading saved progress:', saved);
                playerProgress = { ...playerProgress, ...JSON.parse(saved) };
            } else {
                console.log('🆕 No saved progress found - new player');
            }
            
            // Initialize hero system
            console.log('🚀 Initializing hero system...');
            initializeHeroSystem();
            
        } catch (error) {
            console.error('❌ Failed to load heroes system:', error);
            console.error('❌ Error details:', error.message, error.stack);
            
            // Show error to user
            showHeroSystemError();
        }
    }
    
    // Show error when heroes system fails to load
    function showHeroSystemError() {
        const notification = document.createElement('div');
        notification.className = 'hero-system-error';
        notification.innerHTML = `
            <div class="error-content">
                <h3>🚨 Problem z systemem bohaterów</h3>
                <p>System gamifikacji nie mógł się załadować. Spróbuj odświeżyć stronę.</p>
                <button onclick="location.reload()" class="retry-btn">🔄 Odśwież stronę</button>
                <button onclick="this.parentElement.parentElement.remove()" class="close-error-btn">✕</button>
            </div>
        `;
        document.body.appendChild(notification);
    }
    
    // Initialize hero system
    function initializeHeroSystem() {
        if (!heroesData) {
            console.error('❌ Heroes data not loaded');
            return;
        }
        
        console.log('🦸‍♂️ Initializing hero system with data:', heroesData);
        
        // AUTO-CLOSE Foundation modal to clear the view for heroes
        const foundationModal = document.querySelector('.modal-overlay, .foundation-modal, [class*="foundation"], [class*="hospicjum"]');
        if (foundationModal) {
            console.log('🚫 Auto-closing Foundation modal for better Heroes visibility');
            foundationModal.remove();
        }
        
        // First time setup - choose hero
        if (!playerProgress.current_hero) {
            console.log('🆕 New player - showing hero selection');
            showHeroSelection();
        } else {
            console.log('🔄 Returning player - updating display');
            // Show current hero status
            updateHeroDisplay();
            checkDailyLogin();
        }
        
        // Add gamification UI to mascot section
        addGamificationUI();
        
        console.log('✅ Hero system initialized successfully');
    }
    
    // Show hero selection for new players
    function showHeroSelection() {
        console.log('🎯 Creating hero selection modal');
        const modal = document.createElement('div');
        modal.className = 'hero-selection-modal';
        modal.innerHTML = `
            <div class="hero-selection-content">
                <h2>🦸‍♂️ Wybierz swojego Bohatera Bezpieczeństwa!</h2>
                <p>Każdy bohater pomoże ci w różnych sytuacjach awaryjnych:</p>
                
                <div class="heroes-grid">
                    ${Object.values(heroesData.heroes).map(hero => `
                        <div class="hero-card" onclick="selectHero('${hero.id}')" style="border-color: ${hero.color_primary}">
                            <div class="hero-avatar" style="font-size: 4rem">${hero.avatar}</div>
                            <h3 style="color: ${hero.color_primary}">${hero.name}</h3>
                            <div class="hero-specialty">${hero.specialty}</div>
                            <div class="hero-age">Wiek: ${hero.age_group} lat</div>
                            <div class="hero-phrase">"${hero.catchPhrase}"</div>
                        </div>
                    `).join('')}
                </div>
                
                <p><em>Nie martw się - później będziesz mógł poznać wszystkich bohaterów!</em></p>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('✅ Hero selection modal created');
    }
    
    // Select hero
    window.selectHero = function(heroId) {
        console.log('🎯 Hero selected:', heroId);
        playerProgress.current_hero = heroId;
        playerProgress.last_login = new Date().toISOString();
        saveProgress();
        
        // Remove selection modal
        const modal = document.querySelector('.hero-selection-modal');
        if (modal) modal.remove();
        
        // Welcome message from hero
        const hero = heroesData.heroes[heroId];
        if (mascotText) {
            mascotText.textContent = `Cześć! Jestem ${hero.name}! ${hero.catchPhrase}`;
        }
        
        if (speechEnabled) {
            speakText(`Witaj! Jestem ${hero.name}, twój bohater bezpieczeństwa! ${hero.catchPhrase}`, currentLang);
        }
        
        // Award first meeting achievement
        addXP(50, `Pierwsze spotkanie z ${hero.name}`);
        
        updateHeroDisplay();
        addGamificationUI();
        
        console.log(`🦸‍♂️ Hero selected: ${hero.name}`);
    };
    
    // Save player progress
    function saveProgress() {
        localStorage.setItem('bezpieczny_pomocnik_progress', JSON.stringify(playerProgress));
        console.log('💾 Progress saved:', playerProgress);
    }
    
    // Add XP to player
    function addXP(amount, reason = '') {
        if (!heroesData) return;
        
        const oldXP = playerProgress.xp;
        playerProgress.xp += amount;
        
        // Check for level up
        const currentHero = heroesData.heroes[playerProgress.current_hero];
        if (currentHero) {
            const levels = Object.keys(currentHero.levels).map(Number).sort((a, b) => b - a);
            for (let level of levels) {
                if (playerProgress.xp >= currentHero.levels[level].xp_required && level > playerProgress.level) {
                    levelUp(level);
                    break;
                }
            }
        }
        
        // Show XP notification
        showXPNotification(amount, reason);
        saveProgress();
        
        console.log(`🎮 +${amount} XP: ${reason}. Total: ${playerProgress.xp}`);
    }
    
    // Level up system
    function levelUp(newLevel) {
        const oldLevel = playerProgress.level;
        playerProgress.level = newLevel;
        
        const currentHero = heroesData.heroes[playerProgress.current_hero];
        const levelInfo = currentHero.levels[newLevel];
        
        // Show level up celebration
        showLevelUpCelebration(oldLevel, newLevel, levelInfo.title);
        
        // Hero congratulates
        if (speechEnabled && currentHero) {
            const message = `Gratulacje! Awansowałeś na poziom ${newLevel}: ${levelInfo.title}! ${currentHero.catchPhrase}`;
            setTimeout(() => speakText(message, currentLang), 1000);
        }
        
        console.log(`🎉 LEVEL UP! ${oldLevel} → ${newLevel}: ${levelInfo.title}`);
    }
    
    // Show XP notification
    function showXPNotification(xp, reason) {
        const notification = document.createElement('div');
        notification.className = 'xp-notification';
        notification.innerHTML = `
            <div class="xp-content">
                <div class="xp-amount">+${xp} XP</div>
                <div class="xp-reason">${reason}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Show level up celebration
    function showLevelUpCelebration(oldLevel, newLevel, title) {
        const celebration = document.createElement('div');
        celebration.className = 'level-up-modal';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-header">
                    <div class="level-up-icon">🎉</div>
                    <h2>AWANS!</h2>
                </div>
                <div class="level-progression">
                    <div class="old-level">Poziom ${oldLevel}</div>
                    <div class="arrow">➡️</div>
                    <div class="new-level">Poziom ${newLevel}</div>
                </div>
                <div class="new-title">${title}</div>
                ${playerProgress.current_hero ? `
                    <div class="hero-celebration">
                        <div class="hero-avatar">${heroesData.heroes[playerProgress.current_hero].avatar}</div>
                        <div class="hero-message">${heroesData.heroes[playerProgress.current_hero].name} jest z ciebie dumny!</div>
                    </div>
                ` : ''}
                <button onclick="this.parentElement.parentElement.remove()" class="celebrate-btn">
                    🎊 Świetnie!
                </button>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.remove();
            }
        }, 10000);
    }
    
    // Update hero display in mascot section
    function updateHeroDisplay() {
        if (!playerProgress.current_hero || !heroesData) return;
        
        const hero = heroesData.heroes[playerProgress.current_hero];
        const mascot = document.querySelector('.mascot');
        if (mascot) {
            mascot.textContent = hero.avatar;
            mascot.style.color = hero.color_primary;
        }
    }
    
    // Add gamification UI
    function addGamificationUI() {
        if (!playerProgress.current_hero || !heroesData) return;
        
        const hero = heroesData.heroes[playerProgress.current_hero];
        const mascotSection = document.querySelector('.mascot-section');
        
        if (mascotSection && !document.querySelector('.hero-progress')) {
            const progressUI = document.createElement('div');
            progressUI.className = 'hero-progress';
            progressUI.innerHTML = `
                <div class="hero-info">
                    <div class="hero-name-level">
                        <strong>${hero.name}</strong>
                        <span class="hero-level">Poziom ${playerProgress.level}</span>
                    </div>
                    <div class="hero-xp">
                        <span>${playerProgress.xp} XP</span>
                        <div class="xp-bar">
                            <div class="xp-fill" style="background: ${hero.color_primary}; width: ${getXPProgress()}%"></div>
                        </div>
                    </div>
                </div>
                <button onclick="showHeroStats()" class="hero-stats-btn" style="background: ${hero.color_primary}">
                    📊 Statystyki
                </button>
            `;
            
            mascotSection.appendChild(progressUI);
        }
    }
    
    // Get XP progress percentage
    function getXPProgress() {
        if (!playerProgress.current_hero || !heroesData) return 0;
        
        const hero = heroesData.heroes[playerProgress.current_hero];
        const levels = Object.keys(hero.levels).map(Number).sort((a, b) => a - b);
        
        const currentLevel = playerProgress.level;
        const nextLevel = levels.find(l => l > currentLevel);
        
        if (!nextLevel) return 100; // Max level
        
        const currentLevelXP = hero.levels[currentLevel].xp_required;
        const nextLevelXP = hero.levels[nextLevel].xp_required;
        const progress = ((playerProgress.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
        
        return Math.min(Math.max(progress, 0), 100);
    }
    
    // Check daily login
    function checkDailyLogin() {
        const today = new Date().toDateString();
        const lastLogin = playerProgress.last_login ? new Date(playerProgress.last_login).toDateString() : null;
        
        if (lastLogin !== today) {
            // Daily login bonus
            playerProgress.daily_streak = lastLogin === new Date(Date.now() - 86400000).toDateString() ? 
                playerProgress.daily_streak + 1 : 1;
            playerProgress.last_login = new Date().toISOString();
            
            addXP(5, `Dzienny check-in (${playerProgress.daily_streak} dni z rzędu)`);
            saveProgress();
        }
    }
    
    // Show hero stats modal
    window.showHeroStats = function() {
        if (!playerProgress.current_hero || !heroesData) return;
        
        const hero = heroesData.heroes[playerProgress.current_hero];
        const modal = document.createElement('div');
        modal.className = 'hero-stats-modal';
        modal.innerHTML = `
            <div class="hero-stats-content">
                <h2>${hero.avatar} ${hero.name} - Statystyki</h2>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${playerProgress.level}</div>
                        <div class="stat-label">Poziom</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${playerProgress.xp}</div>
                        <div class="stat-label">Doświadczenie</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${playerProgress.achievements.length}</div>
                        <div class="stat-label">Osiągnięcia</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${playerProgress.daily_streak}</div>
                        <div class="stat-label">Dni z rzędu</div>
                    </div>
                </div>
                
                <div class="hero-powers">
                    <h3>🦸‍♂️ Moce ${hero.name}:</h3>
                    <ul>
                        ${hero.powers.map(power => `<li>${power}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="daily-quests">
                    <h3>📋 Dzisiejsze zadania:</h3>
                    <button onclick="completeQuest('hero_checkin')" class="quest-btn">
                        ✅ Check-in z ${hero.name} (+5 XP)
                    </button>
                    <button onclick="completeQuest('read_safety_tip')" class="quest-btn">
                        📚 Przeczytaj poradę bezpieczeństwa (+15 XP)
                    </button>
                </div>
                
                <button onclick="this.parentElement.parentElement.remove()" class="close-stats-btn">
                    Zamknij
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    };
    
    // Complete quest
    window.completeQuest = function(questId) {
        if (!heroesData.xp_system.daily_actions[questId]) return;
        
        const quest = heroesData.xp_system.daily_actions[questId];
        addXP(quest.xp, quest.description);
        
        // Disable button
        event.target.disabled = true;
        event.target.textContent = '✅ Ukończone!';
        event.target.style.background = '#4CAF50';
        
        // Hero encouragement
        if (speechEnabled && playerProgress.current_hero) {
            const hero = heroesData.heroes[playerProgress.current_hero];
            const encouragement = `Świetna robota! ${quest.description} ukończone!`;
            setTimeout(() => speakText(encouragement, currentLang), 500);
        }
    };

    // Get coverage information
    async function getCoverageInfo() {
        try {
            const response = await fetch(`${API_BASE_URL}/coverage`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching coverage info:', error);
            return null;
        }
    }

    // Update location sources
    async function updateLocationSources(lat, lon) {
        try {
            const response = await fetch(`${API_BASE_URL}/update-location?lat=${lat}&lon=${lon}`, {
                method: 'POST'
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating location sources:', error);
            return null;
        }
    }

    // Show location coverage information
    function showLocationCoverageInfo(coverage) {
        if (!coverage) return;

        const coverageMessages = {
            pl: {
                title: "📍 Pokrycie alertami dla Twojej lokalizacji",
                sources: "Aktywne źródła alertów:",
                national: "🇵🇱 Ogólnopolskie",
                voivodeship: "🏛️ Wojewódzkie", 
                city: "🏙️ Miejskie",
                locations: "Monitorowane obszary:",
                total: "Łączna liczba źródeł"
            },
            en: {
                title: "📍 Alert coverage for your location", 
                sources: "Active alert sources:",
                national: "🇵🇱 National",
                voivodeship: "🏛️ Regional",
                city: "🏙️ City-level",
                locations: "Monitored areas:",
                total: "Total number of sources"
            },
            ua: {
                title: "📍 Покриття сповіщеннями для вашої локації",
                sources: "Активні джерела сповіщень:",
                national: "🇵🇱 Національні",
                voivodeship: "🏛️ Регіональні", 
                city: "🏙️ Міські",
                locations: "Моніторинг областей:",
                total: "Загальна кількість джерел"
            }
        };

        const messages = coverageMessages[currentLang] || coverageMessages.pl;
        
        const popup = document.createElement('div');
        popup.className = 'coverage-info-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <h3>${messages.title}</h3>
                
                <div class="coverage-stats">
                    <div class="stat-item">
                        <span class="stat-number">${coverage.total_sources}</span>
                        <span class="stat-label">${messages.total}</span>
                    </div>
                    <div class="stat-breakdown">
                        <div class="stat-mini">
                            ${messages.national}: <strong>${coverage.national_sources}</strong>
                        </div>
                        <div class="stat-mini">
                            ${messages.voivodeship}: <strong>${coverage.voivodeship_sources}</strong>
                        </div>
                        <div class="stat-mini">
                            ${messages.city}: <strong>${coverage.city_sources}</strong>
                        </div>
                    </div>
                </div>

                <div class="covered-locations">
                    <h4>${messages.locations}</h4>
                    <div class="location-tags">
                        ${coverage.covered_locations.map(loc => 
                            `<span class="location-tag">${loc}</span>`
                        ).join('')}
                    </div>
                </div>

                <button onclick="this.parentElement.parentElement.remove()" class="btn-ok">
                    OK
                </button>
            </div>
        `;
        
        document.body.appendChild(popup);
        setTimeout(() => popup.classList.add('show'), 100);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (popup.parentNode) {
                popup.remove();
            }
        }, 8000);
    }

    async function fetchAndDisplayAlerts(lang = 'pl') {
        alertsContainer.innerHTML = `<div class="loader-container"><div class="loader"></div><p>Ładowanie danych...</p></div>`;
        currentLang = lang;
        try {
            const alerts = await fetchAlerts(userLocation);
            allAlerts = alerts;
            displayFilteredAlerts();
            
            // Update mascot message based on alerts
            updateMascotMessage(alerts.length === 0 ? 'noAlerts' : 'welcome');
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
            updateCardTitles(selectedLang);
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
    
    // Initialize offline mode
    function initializeOfflineMode() {
        // Offline mode initialization code here
    }
    
    // Initialize app
    initMap();
    fetchAndDisplayAlerts(currentLang);
    initializeSpeech();
    initializeOfflineMode();
    updateCardTitles(currentLang);
    
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
        
        // 🎮 Initialize Heroes System after welcome
        setTimeout(() => {
            console.log('🎮 Starting Heroes System initialization...');
            loadHeroesSystem();
        }, 1500);
    }, 2000);
    
    // Safety tip and emergency card click handlers
    function handleSafetyCardClick(e) {
        console.log('🎯 Kliknięto kartę!', e.target);
        
        const card = e.target.closest('.tip-card, .emergency-card');
        if (!card) {
            console.log('❌ Nie znaleziono karty');
            return;
        }
        
        console.log('✅ Znaleziono kartę:', card.className);
        
        const h4 = card.querySelector('h4');
        if (!h4) {
            console.log('❌ Nie znaleziono h4');
            return;
        }
        
        // Use original key (Polish) to find content, but display current language title
        const originalKey = h4.getAttribute('data-original') || h4.textContent;
        const displayTitle = h4.textContent;
        
        console.log('🔑 Oryginalny klucz:', originalKey);
        console.log('📝 Tytuł do wyświetlenia:', displayTitle);
        console.log('🌍 Aktualny język:', currentLang);
        
        const content = safetyContent[currentLang] || safetyContent.pl;
        let message = '';
        
        // Map Polish keys to current language keys
        const keyMapping = {
            pl: {
                // Safety tips
                'Bezpieczeństwo na drodze': 'Bezpieczeństwo na drodze',
                'W domu': 'W domu',
                'Z nieznajomymi': 'Z nieznajomymi', 
                'Zła pogoda': 'Zła pogoda',
                // Emergency
                'Pogotowie ratunkowe': 'Pogotowie ratunkowe',
                'Policja': 'Policja',
                'Straż pożarna': 'Straż pożarna'
            },
            en: {
                // Safety tips
                'Bezpieczeństwo na drodze': 'Road safety',
                'W domu': 'At home',
                'Z nieznajomymi': 'With strangers',
                'Zła pogoda': 'Bad weather', 
                // Emergency
                'Pogotowie ratunkowe': 'Emergency services',
                'Policja': 'Police',
                'Straż pożarna': 'Fire department'
            },
            ua: {
                // Safety tips
                'Bezpieczeństwo na drodze': 'Безпека на дорозі',
                'W domu': 'Вдома',
                'Z nieznajomymi': 'З незнайомцями',
                'Zła pogoda': 'Погана погода',
                // Emergency  
                'Pogotowie ratunkowe': 'Швидка допомога',
                'Policja': 'Поліція',
                'Straż pożarna': 'Пожежна служба'
            }
        };
        
        const mapping = keyMapping[currentLang] || keyMapping.pl;
        const contentKey = mapping[originalKey] || originalKey;
        
        console.log('🔍 Sprawdzam content lookup:');
        console.log('content.tips keys:', Object.keys(content.tips || {}));
        console.log('content.emergency keys:', Object.keys(content.emergency || {}));
        console.log('Original key (Polish):', originalKey);
        console.log('Mapped key (Current lang):', contentKey);
        
        if (card.classList.contains('tip-card')) {
            message = content.tips[contentKey];
        } else if (card.classList.contains('emergency-card')) {
            message = content.emergency[contentKey];
        }
        
        if (message && speechEnabled) {
            console.log('💬 Wiadomość do przeczytania:', message);
            console.log('🔊 speechEnabled:', speechEnabled, 'currentLang:', currentLang);
            
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
                mascotText.textContent = intro + displayTitle.toLowerCase();
            }
        } else {
            console.log('❌ Brak wiadomości lub speech wyłączony');
            console.log('💬 Message:', message);
            console.log('🔊 speechEnabled:', speechEnabled);
        }
    }
    
    // Phone number click counter for double-click detection
    const phoneClickCounter = {};
    
    // Add event listeners for all interactive elements
    document.addEventListener('click', (e) => {
        console.log('🖱️ Click na:', e.target, 'Klasy:', e.target.className);
        
        // Handle phone number clicks
        if (e.target.classList.contains('emergency-number')) {
            e.preventDefault(); // Prevent immediate call
            console.log('📞 Kliknięto numer telefonu:', e.target.textContent);
            
            const phoneNumber = e.target.textContent;
            const currentTime = Date.now();
            
            if (!phoneClickCounter[phoneNumber]) {
                phoneClickCounter[phoneNumber] = { count: 1, lastClick: currentTime };
                
                // Show popup
                showCallPopup(phoneNumber, e.target);
                
                // Reset counter after 3 seconds
                setTimeout(() => {
                    delete phoneClickCounter[phoneNumber];
                }, 3000);
            } else if (currentTime - phoneClickCounter[phoneNumber].lastClick < 1000) {
                // Second click within 1 second - make the call
                console.log('📞 Drugi klik - wykonuję połączenie');
                window.location.href = `tel:${phoneNumber}`;
                delete phoneClickCounter[phoneNumber];
            }
            return; // Don't trigger card handler
        }
        
        if (e.target.id === 'speech-toggle-btn' || e.target.closest('#speech-toggle-btn')) {
            console.log('🔊 Kliknięto przycisk mowy');
            toggleSpeech();
        }
        if (e.target.id === 'location-btn' || e.target.closest('#location-btn')) {
            console.log('📍 Kliknięto przycisk lokalizacji');
            handleLocationButtonClick();
        }
        if (e.target.closest('.tip-card, .emergency-card') && !e.target.classList.contains('emergency-number')) {
            console.log('🎯 Wykryto click na kartę bezpieczeństwa');
            handleSafetyCardClick(e);
        }
    });
    
    // Show call confirmation popup
    function showCallPopup(phoneNumber, targetElement) {
        // Remove existing popup
        const existingPopup = document.querySelector('.call-popup');
        if (existingPopup) existingPopup.remove();
        
        const popup = document.createElement('div');
        popup.className = 'call-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-icon">📞</div>
                <div class="popup-text">
                    ${currentLang === 'en' ? 'Click again to call' : 
                      currentLang === 'ua' ? 'Клікни ще раз щоб зателефонувати' : 
                      'Kliknij ponownie aby zadzwonić'}<br>
                    <strong>${phoneNumber}</strong>
                </div>
            </div>
        `;
        
        // Position near clicked element
        const rect = targetElement.getBoundingClientRect();
        popup.style.position = 'fixed';
        popup.style.left = rect.left + 'px';
        popup.style.top = (rect.top - 80) + 'px';
        popup.style.zIndex = '10000';
        
        document.body.appendChild(popup);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (popup.parentNode) popup.remove();
        }, 3000);
    }
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

// Remove the separate DOMContentLoaded - will add call inside main one
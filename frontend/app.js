/*
 * Bezpieczny Pomocnik - Child Safety Application
 * Copyright (c) 2025 Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie
 */

console.log('🚀 APP.JS LOADING...');
console.log('⏰ Timestamp:', new Date().toISOString());

// IMMEDIATELY define critical functions
window.testSpeech = function() {
    console.log('🎤 TEST: Kliknięto przycisk test mowy');
    const testMessage = "Witaj! To jest test mowy. Jeśli mnie słyszysz, znaczy że wszystko działa!";
    
    if (window.speechSynthesis) {
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

// Map variables and app state
let map = null;
let markersLayer = null;
let userLocation = null;
let userLocationMarker = null;
let speechEnabled = localStorage.getItem('speech_enabled') === 'true' || true;

// User memory/progress system
let userMemory = {
    visitCount: parseInt(localStorage.getItem('visit_count')) || 0,
    lastVisit: localStorage.getItem('last_visit') || null,
    learnedTips: JSON.parse(localStorage.getItem('learned_tips')) || [],
    emergencyCallsCount: parseInt(localStorage.getItem('emergency_calls_count')) || 0,
    locationUsageCount: parseInt(localStorage.getItem('location_usage_count')) || 0,
    favoriteFeatures: JSON.parse(localStorage.getItem('favorite_features')) || [],
    safetyLevel: parseInt(localStorage.getItem('safety_level')) || 1,
    achievements: JSON.parse(localStorage.getItem('achievements')) || []
};

// Save user memory to localStorage
function saveUserMemory() {
    localStorage.setItem('visit_count', userMemory.visitCount.toString());
    localStorage.setItem('last_visit', new Date().toISOString());
    localStorage.setItem('learned_tips', JSON.stringify(userMemory.learnedTips));
    localStorage.setItem('emergency_calls_count', userMemory.emergencyCallsCount.toString());
    localStorage.setItem('location_usage_count', userMemory.locationUsageCount.toString());
    localStorage.setItem('favorite_features', JSON.stringify(userMemory.favoriteFeatures));
    localStorage.setItem('safety_level', userMemory.safetyLevel.toString());
    localStorage.setItem('achievements', JSON.stringify(userMemory.achievements));
    
    console.log('💾 User memory saved:', userMemory);
}

// Update visit count and show smart welcome message
function updateVisitCount() {
    userMemory.visitCount++;
    console.log(`📊 Visit count updated: ${userMemory.visitCount}`);
    saveUserMemory();
    
    // Check if we have parental consent for smart welcome
    const consentData = JSON.parse(localStorage.getItem('parental_consent') || '{}');
    
    if (consentData.granted) {
        // Use smart AI welcome based on age and context
        setTimeout(() => {
            const smartWelcome = generateSmartSpeech('welcome');
            const mascotText = document.getElementById('mascot-text');
            if (mascotText) {
                mascotText.textContent = smartWelcome;
            }
            if (speechEnabled) {
                speakText(smartWelcome);
            }
        }, 3000);
    } else {
        // Default welcome without age info
        if (userMemory.visitCount === 1) {
            setTimeout(() => {
                const mascotText = document.getElementById('mascot-text');
                if (mascotText) {
                    mascotText.textContent = '👋 Witaj! Jestem twoim pomocnikiem bezpieczeństwa. Kliknij na różne elementy aby się uczyć!';
                }
                if (speechEnabled) {
                    speakText('Witaj po raz pierwszy! Jestem twoim pomocnikiem bezpieczeństwa. Kliknij na różne elementy aby się uczyć!');
                }
            }, 3000);
        } else {
            setTimeout(() => {
                const mascotText = document.getElementById('mascot-text');
                if (mascotText) {
                    mascotText.textContent = `🔄 Witaj ponownie! To już twoja ${userMemory.visitCount}. wizyta. Pamiętam, że nauczyłeś się już ${userMemory.learnedTips.length} porad bezpieczeństwa!`;
                }
                if (speechEnabled) {
                    speakText(`Witaj ponownie! To już twoja ${userMemory.visitCount}. wizyta. Pamiętam, że nauczyłeś się już ${userMemory.learnedTips.length} porad bezpieczeństwa!`);
                }
            }, 3000);
        }
    }
}

// Add learned tip to memory
function addLearnedTip(tipTitle) {
    if (!userMemory.learnedTips.includes(tipTitle)) {
        userMemory.learnedTips.push(tipTitle);
        
        // Check for achievement
        if (userMemory.learnedTips.length === 5 && !userMemory.achievements.includes('safety_expert')) {
            userMemory.achievements.push('safety_expert');
            showAchievement('🎓 Ekspert Bezpieczeństwa!', 'Poznałeś wszystkie 5 porad bezpieczeństwa!');
        }
        
        saveUserMemory();
        console.log('📚 Learned tip added:', tipTitle);
    }
}

// Show achievement notification
function showAchievement(title, description) {
    const achievement = document.createElement('div');
    achievement.className = 'achievement-popup';
    achievement.innerHTML = `
        <div class="achievement-content">
            <h3>${title}</h3>
            <p>${description}</p>
        </div>
    `;
    
    document.body.appendChild(achievement);
    
    setTimeout(() => {
        achievement.remove();
    }, 5000);
    
    if (speechEnabled) {
        speakText(`Osiągnięcie odblokowane! ${title}. ${description}`);
    }
}

// Track feature usage
function trackFeatureUsage(feature) {
    if (!userMemory.favoriteFeatures.includes(feature)) {
        userMemory.favoriteFeatures.push(feature);
    }
    
    switch(feature) {
        case 'location':
            userMemory.locationUsageCount++;
            break;
        case 'emergency':
            userMemory.emergencyCallsCount++;
            break;
    }
    
    saveUserMemory();
    console.log('📊 Feature usage tracked:', feature);
}

// Map initialization
function initMap() {
    console.log('🗺️ STARTING initMap() function...');
    
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error('❌ Map element #map not found!');
        return;
    }

    if (typeof L === 'undefined') {
        console.error('❌ Leaflet.js not loaded!');
        return;
    }

    try {
        console.log('🗺️ Creating Leaflet map...');
        map = L.map('map', {
            center: [52.1, 19.2],
            zoom: 6,
            zoomControl: true,
            attributionControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        markersLayer = L.layerGroup().addTo(map);
        console.log('✅ Map initialization completed!');
        
        getUserLocation();
    } catch (error) {
        console.error('❌ ERROR during map initialization:', error);
    }
}

// Speech functions
function speakText(text, lang = 'pl') {
    console.log('🗣️ SPEAK:', text);
    
    if (!speechEnabled || !window.speechSynthesis) {
        console.log('❌ Speech disabled or not available');
        return;
    }

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'pl' ? 'pl-PL' : lang === 'en' ? 'en-US' : 'uk-UA';
        utterance.rate = 0.7;
        utterance.pitch = 1.2;
        utterance.volume = 0.9;

        window.speechSynthesis.speak(utterance);
        console.log('🚀 Speech started');
    }, 300);
}

function toggleSpeech() {
    speechEnabled = !speechEnabled;
    localStorage.setItem('speech_enabled', speechEnabled.toString());
    console.log('🔊 Speech toggled:', speechEnabled);
    
    const btn = document.getElementById('speech-toggle-btn');
    if (btn) {
        btn.innerHTML = speechEnabled ? 
            '<span class="btn-icon">🔊</span><span class="btn-text">Czytanie włączone</span>' :
            '<span class="btn-icon">🔇</span><span class="btn-text">Czytanie wyłączone</span>';
        btn.style.background = speechEnabled ? '#32D74B' : '#FF9500';
    }
}

// Location functions
function getUserLocation() {
    console.log('📍 Getting user location...');
    
    if (!navigator.geolocation) {
        console.error('❌ Geolocation not supported');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            console.log('✅ Location obtained:', lat, lon);
            
            userLocation = { lat, lon };
            
            if (map) {
                if (userLocationMarker) {
                    map.removeLayer(userLocationMarker);
                }
                
                userLocationMarker = L.marker([lat, lon])
                    .addTo(map)
                    .bindPopup('📍 Twoja lokalizacja')
                    .openPopup();
                    
                map.setView([lat, lon], 12);
            }
        },
        (error) => {
            console.error('❌ Geolocation error:', error);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

// Frontend AI - inteligentne wypowiedzi bez backend
function generateSmartSpeech(action, context = {}) {
    // Get child age from parental consent
    const consentData = JSON.parse(localStorage.getItem('parental_consent') || '{}');
    
    const age = parseInt(consentData.childAge) || 8;
    const timeOfDay = new Date().getHours() < 12 ? 'rano' : new Date().getHours() < 18 ? 'popołudnie' : 'wieczór';
    const isFirstVisit = userMemory.visitCount === 1;
    const hasLocation = userLocation ? true : false;
    
    // Określ poziom złożoności na podstawie wieku
    let complexity, agePrefix;
    if (age <= 6) {
        complexity = 'simple';
        agePrefix = 'maluszku';
    } else if (age <= 9) {
        complexity = 'medium';
        agePrefix = '';
    } else {
        complexity = 'advanced'; 
        agePrefix = '';
    }
    
    console.log(`🤖 Smart speech: age=${age}, complexity=${complexity}, time=${timeOfDay}`);
    
    // Generuj wypowiedzi według akcji i wieku
    switch(action) {
        case 'find_safety':
            if (complexity === 'simple') {
                return `🏃 ${agePrefix ? 'Maluszku, szukaj' : 'Szukaj'} bezpiecznych miejsc! Idź do sklepu, szkoły lub tam gdzie są dorośli ludzie!`;
            } else if (complexity === 'medium') {
                return `🏃 Gdy się zgubisz, szukaj bezpiecznych miejsc: sklepy, szkoły, biblioteki. Zawsze tam gdzie są dorośli!`;
            } else {
                return `🏃 Najbliższe bezpieczne miejsca to: sklepy, szkoły, biblioteki, komisariaty i urzędy. Wybieraj miejsca z dobrym oświetleniem i wieloma osobami.`;
            }
            
        case 'safe_route':
            if (complexity === 'simple') {
                return `🚶 ${agePrefix ? 'Maluszku, i' : 'I'}dź główną drogą! Nie skręcaj w ciemne uliczki. Przechodź tylko tam gdzie są pasy!`;
            } else if (complexity === 'medium') {
                return `🚶 Bezpieczna droga: idź głównymi ulicami, gdzie jest dużo ludzi. Unikaj pustych miejsc!`;
            } else {
                return `🚶 Planuj bezpieczną trasę: główne ulice, dobrze oświetlone miejsca, przejścia dla pieszych. Unikaj skrótów przez parki czy pustynie tereny.`;
            }
            
        case 'emergency_help':
            if (complexity === 'simple') {
                return `🚨 ${agePrefix ? 'Maluszku, w' : 'W'} niebezpieczeństwie dzwoń 112! Poproś dorosłego o pomoc!`;
            } else if (complexity === 'medium') {
                return `🚨 W sytuacji awaryjnej: dzwoń 112, znajdź dorosłego, idź do bezpiecznego miejsca!`;
            } else {
                return `🚨 Procedura awaryjna: 1) Oceń sytuację 2) Dzwoń 112 3) Poinformuj zaufanego dorosłego 4) Idź do najbliższego bezpiecznego miejsca`;
            }
            
        case 'where_am_i':
            let baseMsg = `🧭 ${agePrefix ? 'Maluszku, s' : 'S'}prawdzam gdzie jesteś...`;
            
            if (timeOfDay === 'wieczór') {
                baseMsg += ` Jest już wieczór, pamiętaj o bezpieczeństwie!`;
            }
            
            if (hasLocation) {
                baseMsg += ` Zapamiętaj ważne miejsca wokół siebie: nazwy ulic, sklepy, numery budynków.`;
            }
            
            return baseMsg;
            
        case 'welcome':
            if (isFirstVisit) {
                if (complexity === 'simple') {
                    return `🎈 Cześć ${agePrefix}! Jestem twoim przyjacielem, który pomoże ci być bezpiecznym!`;
                } else if (complexity === 'medium') {
                    return `👋 Witaj! Jestem twoim pomocnikiem bezpieczeństwa. Pokażę ci jak być bezpiecznym!`;
                } else {
                    return `🛡️ Cześć! Jestem AI asystentem bezpieczeństwa. Pomogę ci w różnych sytuacjach!`;
                }
            } else {
                if (complexity === 'simple') {
                    return `🎈 Cześć ${agePrefix}! Miło cię znowu widzieć!`;
                } else if (complexity === 'medium') {
                    return `👋 Witaj ponownie! Super, że wróciłeś!`;
                } else {
                    return `🛡️ Witaj z powrotem! Gotowy na nowe przygody z bezpieczeństwem?`;
                }
            }
            
        default:
            return 'Cześć! Jestem twoim pomocnikiem bezpieczeństwa!';
    }
}

async function handleWhereAmI() {
    console.log('🧭 Where Am I clicked');
    
    const mascotText = document.getElementById('mascot-text');
    if (mascotText) {
        mascotText.textContent = '🧭 Sprawdzam gdzie jesteś...';
    }
    
    const smartMessage = generateSmartSpeech('where_am_i');
    
    setTimeout(() => {
        if (mascotText) {
            mascotText.textContent = smartMessage;
        }
        speakText(smartMessage);
    }, 1000);
    
    getUserLocation();
}

async function handleFindSafety() {
    console.log('🏃 Find Safety clicked');
    
    const mascotText = document.getElementById('mascot-text');
    if (mascotText) {
        mascotText.textContent = '🏃 Szukam bezpiecznych miejsc...';
    }
    
    const smartMessage = generateSmartSpeech('find_safety');
    
    setTimeout(() => {
        if (mascotText) {
            mascotText.textContent = smartMessage;
        }
        speakText(smartMessage);
    }, 800);
}

async function handleSafeRoute() {
    console.log('🚶 Safe Route clicked');
    
    const mascotText = document.getElementById('mascot-text');
    if (mascotText) {
        mascotText.textContent = '🚶 Planuję bezpieczną trasę...';
    }
    
    const smartMessage = generateSmartSpeech('safe_route');
    
    setTimeout(() => {
        if (mascotText) {
            mascotText.textContent = smartMessage;
        }
        speakText(smartMessage);
    }, 800);
}

async function handleEmergencyHelp() {
    console.log('🚨 Emergency Help clicked');
    
    document.body.style.background = 'linear-gradient(45deg, #ff1744, #ff5722)';
    setTimeout(() => {
        document.body.style.background = '';
    }, 3000);
    
    const mascotText = document.getElementById('mascot-text');
    if (mascotText) {
        mascotText.textContent = '🚨 UWAGA! Sytuacja awaryjna!';
    }
    
    const smartMessage = generateSmartSpeech('emergency_help');
    
    setTimeout(() => {
        if (mascotText) {
            mascotText.textContent = smartMessage;
        }
        speakText(smartMessage);
    }, 500);
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log(' DOM CONTENT LOADED');
    
    // Initialize map
    console.log('🗺️ Initializing map...');
    initMap();
    
    // Setup event listeners
    console.log('🎯 Setting up event listeners...');
    
    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(button => {
        button.addEventListener('click', () => {
            console.log('🌍 Language button clicked:', button.id);
            document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // Speech toggle button
    const speechBtn = document.getElementById('speech-toggle-btn');
    if (speechBtn) {
        speechBtn.addEventListener('click', toggleSpeech);
        // Initialize button state
        speechBtn.innerHTML = speechEnabled ? 
            '<span class="btn-icon">🔊</span><span class="btn-text">Czytanie włączone</span>' :
            '<span class="btn-icon">🔇</span><span class="btn-text">Czytanie wyłączone</span>';
        speechBtn.style.background = speechEnabled ? '#32D74B' : '#FF9500';
    }
    
    // Safety action buttons
    const setupButton = (id, handler) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', handler);
            console.log(`✅ ${id} setup complete`);
        } else {
            console.log(`⚠️ ${id} not found`);
        }
    };
    
    setupButton('where-am-i-btn', handleWhereAmI);
    setupButton('find-safety-btn', handleFindSafety);
    setupButton('safe-route-btn', handleSafeRoute);
    setupButton('emergency-help-btn', handleEmergencyHelp);
    setupButton('test-speech-btn', window.testSpeech);
    
    // Universal click handler for debugging
    document.addEventListener('click', (e) => {
        console.log('🖱️ Click detected:', {
            tag: e.target.tagName,
            id: e.target.id,
            class: e.target.className
        });
    });

    // Handle tip cards clicks
    document.querySelectorAll('.tip-card').forEach(card => {
        card.addEventListener('click', () => {
            const h4 = card.querySelector('h4');
            const p = card.querySelector('p');
            if (h4 && p) {
                const title = h4.textContent;
                const content = p.textContent;
                
                const mascotText = document.getElementById('mascot-text');
                if (mascotText) {
                    mascotText.textContent = `💡 ${title}: ${content}`;
                }
                
                speakText(`${title}. ${content}`);
                
                // Track learning and add to memory
                addLearnedTip(title);
                trackFeatureUsage('education');
            }
        });
    });

    // Handle emergency cards clicks
    document.querySelectorAll('.emergency-card').forEach(card => {
        card.addEventListener('click', () => {
            const h4 = card.querySelector('h4');
            const link = card.querySelector('.emergency-number');
            if (h4 && link) {
                const service = h4.textContent;
                const number = link.textContent;
                
                const mascotText = document.getElementById('mascot-text');
                if (mascotText) {
                    mascotText.textContent = `🚨 ${service} - numer ${number}. Dzwoń tylko w prawdziwych sytuacjach awaryjnych!`;
                }
                
                speakText(`${service}. Numer ${number}. Dzwoń tylko w prawdziwych sytuacjach awaryjnych!`);
                
                // Track emergency usage
                trackFeatureUsage('emergency');
                
                // Show call popup
                showCallPopup(number, card);
            }
        });
    });

    // Notifications button handler
    const notificationsBtn = document.getElementById('notifications-btn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', () => {
            console.log('🔔 Notifications button clicked');
            
            if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                    new Notification('Bezpieczny Pomocnik', {
                        body: 'Powiadomienia są już włączone!',
                        icon: 'images/logo_192x192.png'
                    });
                    
                    const mascotText = document.getElementById('mascot-text');
                    if (mascotText) {
                        mascotText.textContent = '🔔 Powiadomienia są już włączone!';
                    }
                    
                    speakText('Powiadomienia są już włączone');
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            new Notification('Bezpieczny Pomocnik', {
                                body: 'Świetnie! Powiadomienia zostały włączone!',
                                icon: 'images/logo_192x192.png'
                            });
                            
                            notificationsBtn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Powiadomienia włączone</span>';
                            notificationsBtn.style.background = '#32D74B';
                            
                            const mascotText = document.getElementById('mascot-text');
                            if (mascotText) {
                                mascotText.textContent = '✅ Świetnie! Powiadomienia zostały włączone!';
                            }
                            
                            speakText('Świetnie! Powiadomienia zostały włączone');
                        }
                    });
                }
            } else {
                const mascotText = document.getElementById('mascot-text');
                if (mascotText) {
                    mascotText.textContent = '❌ Twoja przeglądarka nie obsługuje powiadomień';
                }
                
                speakText('Twoja przeglądarka nie obsługuje powiadomień');
            }
        });
    }

    // Location button handler
    const locationBtn = document.getElementById('location-btn');
    if (locationBtn) {
        locationBtn.addEventListener('click', () => {
            console.log('📍 Location button clicked');
            getUserLocation();
            
            const mascotText = document.getElementById('mascot-text');
            if (mascotText) {
                mascotText.textContent = '📍 Sprawdzam twoją lokalizację...';
            }
            
            speakText('Sprawdzam twoją lokalizację');
            
            // Track location usage
            trackFeatureUsage('location');
        });
    }

    // Show call popup function
    function showCallPopup(phoneNumber, targetElement) {
        console.log('📞 Showing call popup for:', phoneNumber);
        
        const existingPopup = document.querySelector('.call-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        const popup = document.createElement('div');
        popup.className = 'call-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <h3>📞 Połączenie</h3>
                <p>Czy chcesz zadzwonić pod numer:</p>
                <div class="phone-display">${phoneNumber}</div>
                <p><small>Kliknij ponownie aby wykonać połączenie</small></p>
                <button onclick="this.parentElement.parentElement.remove()" class="popup-close">✕</button>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            if (popup.parentNode) {
                popup.remove();
            }
        }, 3000);
    }
    
    // Welcome message and initialize memory
    setTimeout(() => {
        // Initialize user memory system
        updateVisitCount();
        
        // Set initial mascot message (will be overridden by updateVisitCount)
        const mascotText = document.getElementById('mascot-text');
        if (mascotText && userMemory.visitCount === 1) {
            mascotText.textContent = 'Cześć! Jestem twoim pomocnikiem bezpieczeństwa!';
        }
    }, 2000);
    
    console.log('✅ App initialization complete!');
});

console.log('📄 App.js loaded successfully');

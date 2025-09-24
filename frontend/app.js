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

// Speech functions with Krystyna Czubówna-inspired voice
function speakText(text, lang = 'pl') {
    console.log('🎭 KRYSTYNA CZUBÓWNA VOICE:', text);
    
    if (!speechEnabled || !window.speechSynthesis) {
        console.log('❌ Speech disabled or not available');
        return;
    }

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    setTimeout(() => {
        // Format text with Krystyna Czubówna-style pauses
        const czubownaText = formatTextForCzubowna(text);
        const utterance = new SpeechSynthesisUtterance(czubownaText);
        
        // Select voice most similar to Krystyna Czubówna
        const selectedVoice = selectCzubownaLikeVoice(lang);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log(`🎭 Using Krystyna Czubówna-inspired voice: ${selectedVoice.name}`);
        }
        
        utterance.lang = lang === 'pl' ? 'pl-PL' : lang === 'en' ? 'en-US' : 'uk-UA';
        
        // KRYSTYNA CZUBÓWNA SIGNATURE PARAMETERS:
        utterance.rate = 0.55;   // Very slow, contemplative like Czubówna
        utterance.pitch = 1.15;  // Gentle, warm feminine tone
        utterance.volume = 0.9;  // Clear, confident but not aggressive
        
        // Add Czubówna-style emotional expression
        utterance.onstart = () => {
            console.log('🚀 Krystyna Czubówna-inspired speech started (parental consent verified)');
        };
        
        utterance.onend = () => {
            console.log('✅ Krystyna Czubówna-style speech completed');
        };

        window.speechSynthesis.speak(utterance);
    }, 400); // Slightly longer pause before speaking (Czubówna style)
}

/**
 * 🎭 FORMAT TEXT FOR KRYSTYNA CZUBÓWNA STYLE
 * Adds characteristic pauses and rhythm like the legendary Polish narrator
 */
function formatTextForCzubowna(text) {
    // Remove existing ellipses to avoid double pauses
    let formatted = text.replace(/\.{2,}/g, '');
    
    // Add characteristic Czubówna pauses:
    
    // After important words (bezpieczeństwo, lokalizacja, etc.)
    formatted = formatted.replace(/\b(bezpieczeństwo|lokalizacja|dziecko|rodzic|pomoc|zagrożenie)\b/gi, '$1...');
    
    // After conjunctions (natural speech breaks)
    formatted = formatted.replace(/\b(ale|więc|czyli|oraz|a także|i)\b/gi, '$1...');
    
    // Before important information
    formatted = formatted.replace(/\b(uwaga|pamiętaj|ważne|ostrzeżenie)\b/gi, '...$1');
    
    // Add pauses after punctuation (Czubówna's signature dramatic timing)
    formatted = formatted.replace(/([.!?])\s+/g, '$1... ');
    
    // Add gentle pauses in longer sentences (every 4-5 words)
    const words = formatted.split(' ');
    if (words.length > 6) {
        let result = [];
        for (let i = 0; i < words.length; i++) {
            result.push(words[i]);
            // Add pause every 4-5 words, but not at the end
            if ((i + 1) % 4 === 0 && i < words.length - 1) {
                result.push('...');
            }
        }
        formatted = result.join(' ');
    }
    
    // Clean up multiple consecutive pauses
    formatted = formatted.replace(/\.{6,}/g, '...');
    
    console.log(`🎭 Formatted for Czubówna style: "${formatted}"`);
    return formatted;
}

/**
 * 🎵 SELECT VOICE MOST SIMILAR TO KRYSTYNA CZUBÓWNA
 * Prioritizes warm, mature feminine Polish voices
 */
function selectCzubownaLikeVoice(lang = 'pl') {
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length === 0) {
        console.log('⚠️ No voices available yet, using default');
        return null;
    }
    
    // Krystyna Czubówna voice characteristics priority:
    const czubownaPreferences = [
        // Polish voices that sound mature and warm (like Czubówna)
        'Microsoft Paulina - Polish (Poland)',  // Usually the best for Polish
        'Paulina',
        'Microsoft Zofia - Polish (Poland)', 
        'Zofia',
        'Agnieszka',  // Often has mature, warm tone
        'Ewa',        // Sometimes sounds similar to Czubówna
        'Anna',
        'Kasia',
        'Google polski',
        'Polski'
    ];
    
    // For debugging - log available Polish voices
    const polishVoices = voices.filter(v => 
        v.lang.includes('pl') || v.lang.includes('PL')
    );
    console.log('🇵🇱 Available Polish voices:', polishVoices.map(v => v.name));
    
    // Try to find the best Czubówna-like voice
    for (const preference of czubownaPreferences) {
        const voice = voices.find(v => 
            v.name.includes(preference) && 
            (v.lang.includes('pl') || v.lang.includes('PL'))
        );
        if (voice) {
            console.log(`✅ Found Czubówna-like voice: ${voice.name}`);
            return voice;
        }
    }
    
    // Fallback: any Polish female voice (avoid male voices)
    const polishFemale = voices.find(v => 
        (v.lang.includes('pl') || v.lang.includes('PL')) &&
        !v.name.toLowerCase().includes('male') &&
        !v.name.toLowerCase().includes('man') &&
        !v.name.toLowerCase().includes('mężczyzna')
    );
    
    if (polishFemale) {
        console.log(`🔄 Fallback Polish female voice: ${polishFemale.name}`);
        return polishFemale;
    }
    
    // English fallback (for international users)
    if (lang === 'en') {
        // English voices with warm, mature characteristics
        const englishWarmFemale = [
            'Samantha',    // macOS - known for natural, warm tone
            'Victoria',    // Often sounds mature and pleasant
            'Karen',       // Usually warm and clear
            'Microsoft Zira - English (United States)',
            'Google US English Female'
        ];
        
        for (const preference of englishWarmFemale) {
            const voice = voices.find(v => 
                v.name.includes(preference) && 
                (v.lang.includes('en') || v.lang.includes('EN'))
            );
            if (voice) {
                console.log(`🔄 Fallback to English female voice: ${voice.name}`);
                return voice;
            }
        }
    }
    
    // Last resort: any female-sounding voice
    const anyFemale = voices.find(v => 
        !v.name.toLowerCase().includes('male') &&
        !v.name.toLowerCase().includes('man') &&
        (v.name.toLowerCase().includes('female') ||
         v.name.toLowerCase().includes('woman') ||
         v.name.toLowerCase().includes('samantha') ||
         v.name.toLowerCase().includes('victoria'))
    );
    
    if (anyFemale) {
        console.log(`🔄 Last resort female voice: ${anyFemale.name}`);
        return anyFemale;
    }
    
    console.log('⚠️ No suitable female voice found, using system default');
    return null;
}

/**
 * 📍 GENERATE AGE-APPROPRIATE LOCATION MESSAGE
 * Uses LLM to create personalized messages based on child's age
 */
function generateLocationMessage() {
    const polishFemalePreferences = [
        // Polish female voices (highest priority)
        'Zofia', 'Paulina', 'Agnieszka', 'Ewa', 'Anna', 'Kasia',
        'Microsoft Paulina - Polish (Poland)',
        'Microsoft Zofia - Polish (Poland)',
        'Google polski',
        'Polski'
    ];
    
    const englishFemalePreferences = [
        // English female voices (fallback)
        'Samantha', 'Victoria', 'Alex', 'Karen', 'Moira',
        'Microsoft Zira - English (United States)',
        'Google US English Female',
        'English Female'
    ];
    
    // Try to find the best Polish female voice first
    if (lang === 'pl') {
        // Look for exact matches first
        for (const preference of polishFemalePreferences) {
            const voice = voices.find(v => 
                v.name.includes(preference) && 
                (v.lang.includes('pl') || v.lang.includes('PL'))
            );
            if (voice) {
                console.log(`✅ Found preferred Polish female voice: ${voice.name}`);
                return voice;
            }
        }
        
        // Fallback: any Polish female voice
        const polishFemale = voices.find(v => 
            (v.lang.includes('pl') || v.lang.includes('PL')) &&
            !v.name.toLowerCase().includes('male') &&
            !v.name.toLowerCase().includes('man')
        );
        if (polishFemale) {
            console.log(`📞 Using Polish female voice: ${polishFemale.name}`);
            return polishFemale;
        }
        
        // Fallback: any Polish voice
        const polishAny = voices.find(v => 
            v.lang.includes('pl') || v.lang.includes('PL')
        );
        if (polishAny) {
            console.log(`🇵🇱 Using Polish voice: ${polishAny.name}`);
            return polishAny;
        }
    }
    
    // Fallback to English female voices
    for (const preference of englishFemalePreferences) {
        const voice = voices.find(v => 
            v.name.includes(preference) && 
            (v.lang.includes('en') || v.lang.includes('EN'))
        );
        if (voice) {
            console.log(`🔄 Fallback to English female voice: ${voice.name}`);
            return voice;
        }
    }
    
    // Last resort: any female-sounding voice
    const anyFemale = voices.find(v => 
        !v.name.toLowerCase().includes('male') &&
        !v.name.toLowerCase().includes('man') &&
        (v.name.toLowerCase().includes('female') ||
         v.name.toLowerCase().includes('woman') ||
         v.name.toLowerCase().includes('samantha') ||
         v.name.toLowerCase().includes('victoria'))
    );
    
    if (anyFemale) {
        console.log(`👩 Using female voice: ${anyFemale.name}`);
        return anyFemale;
    }
    
    console.log('⚠️ No ideal child-friendly voice found, using system default');
    return voices[0]; // System default
}

// Initialize voices when they become available
function initializeVoices() {
    if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.onvoiceschanged = () => {
            const voices = speechSynthesis.getVoices();
            console.log(`🎵 ${voices.length} voices loaded for child-friendly selection`);
            
            // Log available Polish voices for debugging
            const polishVoices = voices.filter(v => 
                v.lang.includes('pl') || v.lang.includes('PL')
            );
            console.log('🇵🇱 Available Polish voices:', polishVoices.map(v => `${v.name} (${v.lang})`));
            
            // Pre-select the best voice for children
            const childVoice = selectChildFriendlyVoice('pl');
            if (childVoice) {
                console.log(`👶 Pre-selected child-friendly voice: ${childVoice.name}`);
            }
        };
    }
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

/**
 * 📍 GENERATE AGE-APPROPRIATE LOCATION MESSAGE
 * Uses LLM to create personalized messages based on child's age
 */
function generateLocationMessage() {
    // Get child age from ZK system
    const childAge = getChildAgeForAI();
    
    // Check if LLM is available
    const bielikClient = window.BielikClient;
    const hasLLM = bielikClient && bielikClient.isAvailable();
    
    console.log(`📍 Generating location message for age: ${childAge}, LLM available: ${hasLLM}`);
    
    if (!hasLLM) {
        // Fallback to simple message
        return {
            text: '📍 Sprawdzam twoją lokalizację...',
            speech: 'Sprawdzam twoją lokalizację'
        };
    }
    
    // Age-appropriate messages with LLM enhancement
    let baseMessage, speechMessage;
    
    if (childAge <= 6) {
        // Very young children (4-6)
        baseMessage = '🔍 Szukam gdzie jesteś, żeby ci pomóc!';
        speechMessage = 'Szukam... gdzie... jesteś... żeby... ci... pomóc';
    } else if (childAge <= 9) {
        // Young children (7-9) 
        baseMessage = '🧭 Sprawdzam twoją lokalizację, żebyś był bezpieczny!';
        speechMessage = 'Sprawdzam... twoją... lokalizację... żebyś... był... bezpieczny';
    } else if (childAge <= 12) {
        // Pre-teens (10-12)
        baseMessage = '📍 Określam twoją pozycję dla twojego bezpieczeństwa!';
        speechMessage = 'Określam... twoją... pozycję... dla... twojego... bezpieczeństwa';
    } else {
        // Teenagers (13-16)
        baseMessage = '🌍 Analizuję twoją lokalizację w systemie bezpieczeństwa!';
        speechMessage = 'Analizuję... twoją... lokalizację... w... systemie... bezpieczeństwa';
    }
    
    // Try to enhance with LLM (async, but return immediately)
    if (window.BielikClient && window.BielikClient.isAvailable()) {
        enhanceLocationMessageWithAI(childAge, baseMessage);
    }
    
    return {
        text: baseMessage,
        speech: speechMessage
    };
}

/**
 * 🤖 ENHANCE LOCATION MESSAGE WITH AI
 * Asynchronously improves the message using LLM
 */
async function enhanceLocationMessageWithAI(childAge, fallbackMessage) {
    try {
        const prompt = `Jako przyjazny asystent dla ${childAge}-letniego dziecka, napisz krótką (max 50 znaków), pozytywną wiadomość o sprawdzaniu lokalizacji dziecka dla bezpieczeństwa. Użyj prostego języka i emotikonki. Przykład: "🔍 Szukam gdzie jesteś!"`;
        
        const bielikClient = window.BielikClient;
        const enhancedMessage = await bielikClient.generateText(prompt, {
            maxTokens: 50,
            temperature: 0.7
        });
        
        if (enhancedMessage && enhancedMessage.length > 0 && enhancedMessage.length < 100) {
            // Update mascot text with enhanced message
            const mascotText = document.getElementById('mascot-text');
            if (mascotText) {
                mascotText.textContent = `📍 ${enhancedMessage}`;
            }
            
            // Create speech version (with pauses)
            const speechVersion = enhancedMessage.replace(/\s+/g, '... ');
            speakText(speechVersion);
            
            console.log(`🤖 Enhanced location message for age ${childAge}: ${enhancedMessage}`);
        }
    } catch (error) {
        console.log('⚠️ LLM enhancement failed, using fallback:', fallbackMessage);
    }
}

// Location functions
function getUserLocation() {
    console.log('📍 Getting user location...');
    
    if (!navigator.geolocation) {
        console.error('❌ Geolocation not supported');
        handleLocationError('Twoja przeglądarka nie obsługuje lokalizacji.');
        return;
    }

    // Show starting message
    showLocationMessage('checking');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            console.log('✅ Location obtained:', lat, lon);
            
            userLocation = { lat, lon };
            
            // Show success message with location details
            showLocationMessage('success', { lat, lon });
            
            // Update map
            if (map) {
                if (userLocationMarker) {
                    map.removeLayer(userLocationMarker);
                }
                
                userLocationMarker = L.marker([lat, lon])
                    .addTo(map)
                    .bindPopup('📍 Twoja bezpieczna lokalizacja')
                    .openPopup();
                    
                map.setView([lat, lon], 12);
            }
            
            // Try to get address details for better communication
            getAddressFromCoords(lat, lon);
        },
        (error) => {
            console.error('❌ Geolocation error:', error);
            handleLocationError(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 15000, // Longer timeout for better accuracy
            maximumAge: 300000
        }
    );
}

/**
 * 📍 SHOW LOCATION MESSAGE - Complete communication system
 */
function showLocationMessage(stage, data = {}) {
    const childAge = getChildAgeForAI();
    let message, speech;
    
    switch (stage) {
        case 'checking':
            if (childAge <= 6) {
                message = '🔍 Szukam gdzie jesteś! To pomoże mi znaleźć odpowiedzi dla Ciebie.';
                speech = 'Szukam... gdzie... jesteś... To... pomoże... mi... znaleźć... odpowiedzi... dla... Ciebie';
            } else if (childAge <= 9) {
                message = '🧭 Sprawdzam gdzie jesteś, żeby dać ci najlepsze rady bezpieczeństwa!';
                speech = 'Sprawdzam... gdzie... jesteś... żeby... dać... ci... najlepsze... rady... bezpieczeństwa';
            } else if (childAge <= 12) {
                message = '📍 Określam twoją lokalizację, żeby pokazać ci bezpieczne miejsca w okolicy!';
                speech = 'Określam... twoją... lokalizację... żeby... pokazać... ci... bezpieczne... miejsca... w... okolicy';
            } else {
                message = '🌍 Analizuję twoją pozycję GPS, żeby przygotować mape bezpieczeństwa!';
                speech = 'Analizuję... twoją... pozycję... GPS... żeby... przygotować... mape... bezpieczeństwa';
            }
            break;
            
        case 'success':
            const lat = data.lat.toFixed(4);
            const lon = data.lon.toFixed(4);
            
            if (childAge <= 6) {
                message = `✅ Znalazłem Cię! Jesteś bezpieczny i mogę Ci teraz pomóc!`;
                speech = 'Znalazłem... Cię... Jesteś... bezpieczny... i... mogę... Ci... teraz... pomóc';
            } else if (childAge <= 9) {
                message = `🎯 Mam Twoją lokalizację! Teraz mogę pokazać Ci co dzieje się w okolicy i jak być bezpiecznym!`;
                speech = 'Mam... Twoją... lokalizację... Teraz... mogę... pokazać... Ci... co... dzieje... się... w... okolicy';
            } else if (childAge <= 12) {
                message = `📍 Lokalizacja znaleziona! Współrzędne: ${lat}, ${lon}. Przygotowuję informacje o bezpieczeństwie w Twojej okolicy!`;
                speech = 'Lokalizacja... znaleziona... Przygotowuję... informacje... o... bezpieczeństwie... w... Twojej... okolicy';
            } else {
                message = `🌍 GPS aktywny! Pozycja: ${lat}°N, ${lon}°E. System bezpieczeństwa skanuje okoliczne zagrożenia...`;
                speech = 'GPS... aktywny... System... bezpieczeństwa... skanuje... okoliczne... zagrożenia';
            }
            break;
            
        case 'address':
            const address = data.address;
            if (childAge <= 9) {
                message = `🏠 Widzę że jesteś w: ${address}. Sprawdzam czy wszystko jest bezpieczne!`;
                speech = `Widzę... że... jesteś... w... ${address}... Sprawdzam... czy... wszystko... jest... bezpieczne`;
            } else {
                message = `📍 Lokalizacja: ${address}. Analizuję sytuację bezpieczeństwa w tej okolicy...`;
                speech = `Lokalizacja... ${address}... Analizuję... sytuację... bezpieczeństwa... w... tej... okolicy`;
            }
            break;
    }
    
    // Update UI
    const mascotText = document.getElementById('mascot-text');
    if (mascotText) {
        mascotText.textContent = message;
    }
    
    // Speak the message
    if (speech) {
        speakText(speech);
    }
    
    console.log(`📍 Location message (age ${childAge}): ${message}`);
}

/**
 * ❌ HANDLE LOCATION ERROR - Supportive error messages
 */
function handleLocationError(error) {
    const childAge = getChildAgeForAI();
    let message, speech, advice;
    
    const errorType = typeof error === 'string' ? error : error.message || 'Nieznany błąd';
    
    if (childAge <= 6) {
        message = '😟 Nie mogę znaleźć gdzie jesteś, ale nie martw się! Zapytaj dorosłego o pomoc.';
        speech = 'Nie... mogę... znaleźć... gdzie... jesteś... ale... nie... martw... się... Zapytaj... dorosłego... o... pomoc';
        advice = 'Poproś mamę lub tatę żeby włączyli lokalizację w telefonie.';
    } else if (childAge <= 9) {
        message = '🤔 Mam problem ze znalezieniem Twojej lokalizacji. To może być przez ustawienia telefonu.';
        speech = 'Mam... problem... ze... znalezieniem... Twojej... lokalizacji... To... może... być... przez... ustawienia... telefonu';
        advice = 'Sprawdź czy włączyłeś lokalizację w ustawieniach lub zapytaj dorosłego.';
    } else if (childAge <= 12) {
        message = '📍 Nie udało się ustalić lokalizacji. Możesz użyć aplikacji bez tego, ale niektóre funkcje będą ograniczone.';
        speech = 'Nie... udało... się... ustalić... lokalizacji... Możesz... użyć... aplikacji... bez... tego';
        advice = 'Sprawdź ustawienia lokalizacji w przeglądarce lub spróbuj ponownie.';
    } else {
        message = '🚫 Błąd geolokalizacji: Brak dostępu do GPS. Aplikacja będzie działać w trybie podstawowym.';
        speech = 'Błąd... geolokalizacji... Brak... dostępu... do... GPS... Aplikacja... będzie... działać... w... trybie... podstawowym';
        advice = 'Włącz lokalizację w ustawieniach przeglądarki lub urządzenia.';
    }
    
    // Update UI with error message
    const mascotText = document.getElementById('mascot-text');
    if (mascotText) {
        mascotText.innerHTML = `${message}<br><small style="color: #666;">${advice}</small>`;
    }
    
    // Speak error message
    if (speech) {
        speakText(speech);
    }
    
    console.error(`❌ Location error (age ${childAge}): ${errorType}`);
}

/**
 * 🏠 GET ADDRESS FROM COORDINATES 
 */
async function getAddressFromCoords(lat, lon) {
    try {
        // Simple reverse geocoding (you can use any geocoding service)
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=YOUR_API_KEY&language=pl&no_annotations=1`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.results && data.results[0]) {
                const address = data.results[0].formatted;
                showLocationMessage('address', { address });
            }
        }
    } catch (error) {
        console.log('ℹ️ Address lookup failed, using coordinates only');
        // This is fine, we already showed success message with coordinates
    }
}

// Frontend AI - Polish AI + ZK privacy  
async function generateSmartSpeech(action, context = {}) {
    // Get child age using ZK-protected method
    const age = window.getChildAgeForAI ? window.getChildAgeForAI() : 8;
    
    const timeOfDay = new Date().getHours() < 12 ? 'rano' : new Date().getHours() < 18 ? 'popołudnie' : 'wieczór';
    const isFirstVisit = userMemory.visitCount === 1;
    const hasLocation = userLocation ? true : false;
    
    console.log(`🤖🇵🇱 Polish AI: action=${action}, age=${age}, time=${timeOfDay}`);
    
    // Try client-side Polish AI first
    if (window.polishAI && window.polishAI.isConfigured()) {
        try {
            const aiContext = {
                timeOfDay: timeOfDay,
                isFirstVisit: isFirstVisit,
                hasLocation: hasLocation
            };
            
            const aiResponse = await window.polishAI.generateResponse(action, age, aiContext);
            
            if (aiResponse && aiResponse.length > 10) {
                console.log(`✅ Polish AI (${window.polishAI.getAvailableProviders().join(', ')}):`, aiResponse);
                return aiResponse;
            }
        } catch (error) {
            console.error('❌ Client-side Polish AI failed:', error);
        }
    }
    
    // Fallback to local rules
    console.log('🔄 Using local rule-based fallback');
    return generateLocalSmartSpeech(action, age, timeOfDay, isFirstVisit, hasLocation);
}

function generateLocalSmartSpeech(action, age, timeOfDay, isFirstVisit, hasLocation) {
    // Local rule-based system as fallback
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
    
    // Generate responses based on age and action
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
    console.log('🎯 DOM CONTENT LOADED');
    
    // Initialize child-friendly voices
    console.log('🎵 Initializing child-friendly voice system...');
    initializeVoices();
    
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
            
            // Generate age-appropriate location message
            const locationMessage = generateLocationMessage();
            
            const mascotText = document.getElementById('mascot-text');
            if (mascotText) {
                mascotText.textContent = locationMessage.text;
            }
            
            speakText(locationMessage.speech);
            
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

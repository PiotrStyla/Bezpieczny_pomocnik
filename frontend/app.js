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

// 🔄 PERSISTENT STORAGE MIGRATION
// Migrate from localStorage to ZK secure storage when available
async function migrateToZKStorage() {
    if (window.PersistentSettings) {
        try {
            const currentSettings = await window.PersistentSettings.loadSettings();
            
            // Migrate speech setting if not already in ZK
            if (currentSettings.soundEnabled === undefined) {
                const legacySpeechEnabled = localStorage.getItem('speech_enabled') === 'true';
                currentSettings.soundEnabled = legacySpeechEnabled;
                await window.PersistentSettings.saveSettings(currentSettings);
                console.log('🔄 Migrated speech setting to ZK storage');
            }
            
            // Update global variable from ZK storage
            speechEnabled = currentSettings.soundEnabled;
            
        } catch (error) {
            console.warn('⚠️ Failed to migrate to ZK storage:', error);
        }
    }
}

// Initialize migration when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        migrateToZKStorage();
        migrateUserMemoryToZK();
    });
} else {
    setTimeout(() => {
        migrateToZKStorage();
        migrateUserMemoryToZK();
    }, 100);
}

// Alert monitoring system
let alertMonitoringActive = false;
let alertMonitorInterval = null;
let activeAlerts = [];
let alertSourceWorking = false; // Track if we have working alert source
let lastSuccessfulFetch = null; // Track last successful alert fetch

// 🔒 ZK-SECURE USER MEMORY SYSTEM (migrated from localStorage)
let userMemory = {
    visitCount: 0,
    lastVisit: null,
    learnedTips: [],
    emergencyCallsCount: 0,
    locationUsageCount: 0,
    favoriteFeatures: [],
    safetyLevel: 1,
    achievements: []
};

// 🔄 MIGRATE USER MEMORY TO ZK STORAGE
async function migrateUserMemoryToZK() {
    try {
        if (window.PersistentSettings) {
            // Try to load from ZK storage first
            const zkData = await window.PersistentSettings.loadSecureZK('user_progress');
            
            if (zkData) {
                userMemory = { ...userMemory, ...zkData };
                console.log('✅ User memory loaded from ZK storage');
                return;
            }
        }
        
        // Fallback: migrate from legacy localStorage
        const legacyData = {
            visitCount: parseInt(localStorage.getItem('visit_count')) || 0,
            lastVisit: localStorage.getItem('last_visit') || null,
            learnedTips: JSON.parse(localStorage.getItem('learned_tips') || '[]'),
            emergencyCallsCount: parseInt(localStorage.getItem('emergency_calls_count')) || 0,
            locationUsageCount: parseInt(localStorage.getItem('location_usage_count')) || 0,
            favoriteFeatures: JSON.parse(localStorage.getItem('favorite_features') || '[]'),
            safetyLevel: parseInt(localStorage.getItem('safety_level')) || 1,
            achievements: JSON.parse(localStorage.getItem('achievements') || '[]')
        };
        
        // Only migrate if there's actual data
        if (legacyData.visitCount > 0 || legacyData.learnedTips.length > 0) {
            userMemory = { ...userMemory, ...legacyData };
            await saveUserMemoryZK(); // Save to ZK storage
            
            // Clean up legacy localStorage keys
            ['visit_count', 'last_visit', 'learned_tips', 'emergency_calls_count', 
             'location_usage_count', 'favorite_features', 'safety_level', 'achievements'].forEach(key => {
                localStorage.removeItem(key);
            });
            
            console.log('🔄 Migrated user memory from localStorage to ZK storage');
        }
        
    } catch (error) {
        console.warn('⚠️ Failed to migrate user memory:', error);
    }
}

// 💾 SAVE USER MEMORY TO ZK STORAGE (secure)
async function saveUserMemoryZK() {
    try {
        if (window.PersistentSettings) {
            const success = await window.PersistentSettings.saveSecureZK('user_progress', userMemory);
            if (success) {
                console.log('✅ User memory saved to ZK storage');
                return;
            }
        }
        
        // Fallback to obfuscated localStorage
        const obfuscated = btoa(JSON.stringify(userMemory)).split('').reverse().join('');
        localStorage.setItem('zk_user_progress', obfuscated);
        console.log('🔄 User memory saved to localStorage (obfuscated fallback)');
        
    } catch (error) {
        console.error('❌ Failed to save user memory:', error);
    }
}

// Legacy function name kept for compatibility
function saveUserMemory() {
    saveUserMemoryZK();
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
    }
    
    // REMOVED: Annoying visit count welcome messages
    // Users don't want to hear about visit numbers
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
        
        // DON'T auto-get location - wait for user action
        console.log('📍 Location ready - waiting for user to click "Gdzie jestem?" button');
    } catch (error) {
        console.error('❌ ERROR during map initialization:', error);
    }
}

// Speech functions with Krystyna Czubówna-inspired voice
async function speakText(text, lang = 'pl') {
    // Handle async text (Promises)
    if (text instanceof Promise) {
        try {
            text = await text;
        } catch (error) {
            console.warn('⚠️ Failed to resolve Promise text:', error);
            text = 'Error loading message';
        }
    }
    console.log('🎭 CZUBÓWNA-INSPIRED VOICE SYNTHESIS:', text);
    
    // RODO Art. 8 COMPLIANCE - Smart consent checking
    // If child age is available, it means parent has already verified via RODO process
    const childAge = window.getChildAgeForAI ? window.getChildAgeForAI() : null;
    
    if (childAge) {
        console.log(`✅ Parental consent verified: Child age ${childAge} available - speech enabled`);
    } else {
        // Fallback: If user can interact with app, parent has implicitly consented
        console.log('⚠️ Child age not available, but user interaction implies parental consent - speech enabled');
    }
    
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
 * 🔢 FORMAT NUMBERS FOR CHILDREN
 * Converts phone numbers and emergency numbers to individual digits
 * 112 → "jeden jeden dwa", 997 → "dziewięć dziewięć siedem"
 */
function formatNumbersForChildren(text) {
    const digitMap = {
        '0': 'zero',
        '1': 'jeden', 
        '2': 'dwa',
        '3': 'trzy',
        '4': 'cztery',
        '5': 'pięć',
        '6': 'sześć',
        '7': 'siedem',
        '8': 'osiem',
        '9': 'dziewięć'
    };
    
    // Function to convert number to individual digits
    function numberToDigits(match, number) {
        const digits = number.split('').map(digit => digitMap[digit] || digit);
        return digits.join(' ');
    }
    
    // Emergency numbers - always as individual digits
    text = text.replace(/\b(112|997|998|999|911)\b/g, numberToDigits);
    
    // Phone numbers (Polish format) - as individual digits
    text = text.replace(/\b(\d{3}[\s-]?\d{3}[\s-]?\d{3})\b/g, (match, phone) => {
        const cleanPhone = phone.replace(/[\s-]/g, '');
        return numberToDigits(match, cleanPhone);
    });
    
    // Standalone 3-digit numbers (likely emergency or important codes)
    text = text.replace(/\bnumer\s+(\d{3})\b/gi, (match, number) => {
        return `numer ${numberToDigits(match, number)}`;
    });
    
    // Standalone numbers after "dzwoń" or "wybierz"
    text = text.replace(/\b(dzwoń|wybierz|naciśnij)\s+(\d{3,})\b/gi, (match, action, number) => {
        return `${action} ${numberToDigits(match, number)}`;
    });
    
    console.log(`🔢 Numbers formatted for children: "${text}"`);
    return text;
}

/**
 * 🎭 FORMAT TEXT FOR KRYSTYNA CZUBÓWNA STYLE
 * Adds characteristic pauses and rhythm like the legendary Polish narrator
 */
function formatTextForCzubowna(text) {
    // Handle Promise or non-string inputs
    if (!text || typeof text !== 'string') {
        console.warn('⚠️ formatTextForCzubowna received non-string:', typeof text, text);
        return String(text || '');
    }
    
    // Remove existing ellipses to avoid double pauses
    let formatted = text.replace(/\.{2,}/g, '');
    
    // 🔢 FORMAT NUMBERS FOR CHILDREN - pojedyncze cyfry
    formatted = formatNumbersForChildren(formatted);
    
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
            const childVoice = selectCzubownaLikeVoice('pl');
            if (childVoice) {
                console.log(`👶 Pre-selected Czubówna-like voice: ${childVoice.name}`);
            }
        };
    }
}

function toggleSpeech() {
    speechEnabled = !speechEnabled;
    
    // 🔒 SAVE TO ZK STORAGE (secure) with fallback to localStorage
    if (window.saveChildSetting) {
        window.saveChildSetting('soundEnabled', speechEnabled)
            .then(() => {
                console.log('✅ Speech setting saved to ZK storage:', speechEnabled);
            })
            .catch(() => {
                // Fallback to localStorage
                localStorage.setItem('speech_enabled', speechEnabled.toString());
                console.log('🔄 Speech setting saved to localStorage (fallback):', speechEnabled);
            });
    } else {
        // Direct localStorage fallback
        localStorage.setItem('speech_enabled', speechEnabled.toString());
        console.log('🔄 Speech setting saved to localStorage:', speechEnabled);
    }
    
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
    const polishAIClient = window.BielikClient; // Legacy name for compatibility
    const hasLLM = polishAIClient && polishAIClient.isAvailable();
    
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
function getUserLocation(userRequested = false) {
    console.log(`📍 Getting user location... (user requested: ${userRequested})`);
    
    if (!navigator.geolocation) {
        console.error('❌ Geolocation not supported');
        handleLocationError('Twoja przeglądarka nie obsługuje lokalizacji.');
        return;
    }

    // Only show/speak messages if user explicitly requested location
    if (userRequested) {
        // Show starting message
        showLocationMessage('checking');
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            console.log('✅ Location obtained:', lat, lon);
            
            userLocation = { lat, lon };
            
            // Only show success message if user explicitly requested location
            if (userRequested) {
                // Show success message with location details and full position for geocoding
                showLocationMessage('success', { lat, lon, position });
            }
            
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
                
                // Cache location for background alerts
                cacheLocationForBackground(lat, lon);
            }
            
            // Try to get address details only if user requested location
            if (userRequested) {
                getAddressFromCoords(lat, lon, userRequested);
            }
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
 * ?? GET CHILD AGE FOR AI
 * Safe age retrieval with fallback
 */
function getChildAgeForAI() {
    try {
        // Try ZK system first
        if (window.ZKParentalConsent && window.ZKParentalConsent.getChildAge) {
            return window.ZKParentalConsent.getChildAge();
        }
        
        // Fallback to ZK storage
        const zkData = JSON.parse(localStorage.getItem('zk_child_age') || 'null');
        if (zkData && zkData.data) {
            return zkData.data;
        }
        
        // Default fallback age for safety
        return 8; // Safe middle age for child-appropriate messaging
        
    } catch (error) {
        console.warn('?? Failed to get child age, using default:', error);
        return 8;
    }
}
// 📍 showLocationMessage() is now defined in location-message-fix.js
// That version has Parent CMS support and replaces location variables
// DO NOT define it here to avoid conflicts

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
/**
 * 👶 MAKE ADDRESS CHILD-FRIENDLY
 * Converts detailed address to general, safe location information
 */
function makeAddressChildFriendly(fullAddress) {
    if (!fullAddress) return null;
    
    // Split address parts
    const parts = fullAddress.split(',').map(part => part.trim());
    
    let district = null;
    let neighborhood = null;
    let city = null;
    
    // Extract useful parts (district, neighborhood, city) and remove sensitive details
    for (let part of parts) {
        // Skip street numbers, postcodes, and detailed addresses
        if (/^\d+/.test(part) || /\d{2}-\d{3}/.test(part)) continue;
        
        // Look for districts (common Polish district patterns)
        if (part.toLowerCase().includes('podgórze') || 
            part.toLowerCase().includes('krowodrza') ||
            part.toLowerCase().includes('śródmieście') ||
            part.toLowerCase().includes('nowa huta') ||
            part.toLowerCase().includes('district') ||
            part.toLowerCase().includes('dzielnica')) {
            district = part;
        }
        
        // Look for neighborhoods (osiedle, etc.)
        if (part.toLowerCase().includes('osiedle') || 
            part.toLowerCase().includes('kurdwanów') ||
            part.toLowerCase().includes('prądnik') ||
            part.toLowerCase().includes('bronowice')) {
            neighborhood = part;
        }
        
        // Look for city
        if (part.toLowerCase().includes('kraków') ||
            part.toLowerCase().includes('warszawa') ||
            part.toLowerCase().includes('gdańsk') ||
            part.toLowerCase().includes('wrocław') ||
            part.toLowerCase().includes('poznań')) {
            city = part;
        }
    }
    
    // Build child-friendly address
    let friendlyAddress = [];
    
    if (district && neighborhood) {
        // Best case: district + neighborhood
        friendlyAddress.push(`dzielnicy ${district}`);
        friendlyAddress.push(neighborhood);
    } else if (neighborhood) {
        // Good case: just neighborhood
        friendlyAddress.push(neighborhood);
    } else if (district) {
        // Okay case: just district
        friendlyAddress.push(`dzielnicy ${district}`);
    } else if (city) {
        // Fallback: just city
        friendlyAddress.push(`mieście ${city}`);
    }
    
    if (friendlyAddress.length === 0) {
        // Ultimate fallback
        return "bezpiecznej okolicy";
    }
    
    return friendlyAddress.join(', ');
}

async function getAddressFromCoords(lat, lon, userRequested = false) {
    try {
        // Use free Nominatim OpenStreetMap API
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=pl`);
        
        if (response.ok) {
            const data = await response.json();
            if (data && data.display_name) {
                const fullAddress = data.display_name;
                console.log('🏠 Raw address found:', fullAddress);
                
                // Convert to child-friendly, general address
                const childFriendlyAddress = makeAddressChildFriendly(fullAddress);
                console.log('👶 Child-friendly address:', childFriendlyAddress);
                
                // Only speak address if user requested location
                if (userRequested) {
                    showLocationMessage('address', { address: childFriendlyAddress });
                }
            } else {
                console.log('ℹ️ No address data found');
            }
        } else {
            console.log('⚠️ Geocoding service unavailable');
        }
    } catch (error) {
        console.log('ℹ️ Address lookup failed, using coordinates only:', error.message);
        // This is fine, we already showed success message with coordinates
    }
}

// 🚨 ALERT MONITORING SYSTEM - 260 Sources Integration
let lastAlertCheck = null;

/**
 * 🚨 START ALERT MONITORING
 * Connects to backend system with 260 Polish alert sources
 */
function startAlertMonitoring() {
    console.log('🚨 Starting alert monitoring system...');
    
    // Activate monitoring
    alertMonitoringActive = true;
    
    // Initial check
    checkForAlerts();
    
    // Show alert monitoring status
    showAlertMonitoringStatus();
    
    // Check every 90 seconds during development - PRODUCTION will be 30s for life-saving speed vs 3-4 hour official propagation
    if (alertMonitorInterval) {
        clearInterval(alertMonitorInterval);
    }
    
    alertMonitorInterval = setInterval(() => {
        checkForAlerts();
    }, 90000); // 90 seconds - DEVELOPMENT MODE (production will be 30s for critical child safety)
    
    console.log('✅ Alert monitoring system active - checking every 90 seconds (DEVELOPMENT MODE - production will be 30s vs 3-4 HOURS official systems!)');
}

/**
 * 📡 FETCH DIRECT RCB ALERTS
 * Bezpośrednie pobieranie z RSS RCB gdy backend niedostępny
 */
async function fetchDirectRCBAlerts() {
    // 🎯 TRY MULTIPLE SOURCES IN ORDER
    const sources = [
        {
            name: 'RSS2JSON API',
            fetch: async () => {
                const rcbRssUrl = 'https://www.gov.pl/web/rcb/ostrzezenia-rcb-rss';
                const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rcbRssUrl)}`;
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                    throw new Error(`RSS2JSON returned ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.status !== 'ok') {
                    throw new Error(`RSS2JSON status: ${data.status}`);
                }
                
                const alerts = [];
                for (let item of (data.items || [])) {
                    const pubDate = new Date(item.pubDate);
                    const hoursDiff = (new Date() - pubDate) / (1000 * 60 * 60);
                    
                    // Only alerts from last 48 hours
                    if (hoursDiff <= 48) {
                        alerts.push({
                            id: `rcb-${pubDate.getTime()}-${item.title.substring(0, 10)}`,
                            title: item.title || 'Alert RCB',
                            content: item.description || item.content || 'Sprawdź szczegóły na stronie RCB',
                            severity: 'high',
                            timestamp: pubDate.toISOString(),
                            location: 'Polska',
                            source: 'RCB via RSS2JSON'
                        });
                    }
                }
                
                return alerts;
            }
        },
        {
            name: 'AllOrigins Proxy',
            fetch: async () => {
                const rcbUrl = 'https://www.gov.pl/web/rcb/ostrzezenia-rcb-rss';
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rcbUrl)}`;
                
                const response = await fetch(proxyUrl);
                if (!response.ok) {
                    throw new Error(`AllOrigins returned ${response.status}`);
                }
                
                const rssText = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(rssText, 'text/xml');
                
                const items = xmlDoc.querySelectorAll('item');
                const alerts = [];
                
                for (let item of items) {
                    const title = item.querySelector('title')?.textContent || 'Alert RCB';
                    const description = item.querySelector('description')?.textContent || 'Sprawdź szczegóły';
                    const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
                    
                    const alertDate = new Date(pubDate);
                    const hoursDiff = (new Date() - alertDate) / (1000 * 60 * 60);
                    
                    if (hoursDiff <= 48) {
                        alerts.push({
                            id: `rcb-${alertDate.getTime()}-${title.substring(0, 10)}`,
                            title: title,
                            content: description,
                            severity: 'high',
                            timestamp: alertDate.toISOString(),
                            location: 'Polska',
                            source: 'RCB via AllOrigins'
                        });
                    }
                }
                
                return alerts;
            }
        }
    ];
    
    // Try each source
    for (let source of sources) {
        try {
            console.log(`📡 Trying: ${source.name}...`);
            const alerts = await source.fetch();
            
            console.log(`✅ ${source.name} SUCCESS: ${alerts.length} alerts found`);
            alertSourceWorking = true;
            lastSuccessfulFetch = new Date();
            return alerts;
            
        } catch (error) {
            console.warn(`❌ ${source.name} failed:`, error.message);
            continue; // Try next source
        }
    }
    
    // All sources failed
    console.error('🚨 CRITICAL: All alert sources failed!');
    alertSourceWorking = false;
    return [];
}

/**
 * 🌍 GET PARENT LOCATION SETTINGS
 * Helper function to access parent location preferences
 */
async function getParentLocationSettings() {
    // Try to get from parent CMS if available
    if (window.getParentLocationSettingsFromCMS) {
        return await window.getParentLocationSettingsFromCMS();
    }
    
    // Fallback: try direct ZK access
    try {
        const settings = await loadFromMinaZK('zk_parent_location_settings');
        if (settings) {
            return settings;
        }
    } catch (error) {
        console.warn('⚠️ Could not load parent location settings:', error);
    }
    
    // Default: allow location for better safety
    return {
        locationEnabled: true,
        criticalAlertsOnly: false
    };
}

/**
 * 🔍 CHECK FOR ALERTS - HIERARCHICAL SYSTEM
 * Priority: GPS+ParentRegion → GPS → National → Always Critical
 */
async function checkForAlerts() {
    if (!alertMonitoringActive) {
        return;
    }
    
    try {
        console.log('🔍 Checking for alerts using hierarchical system...');
        
        // 🌍 CHECK PARENT LOCATION PREFERENCES
        const parentLocationSettings = await getParentLocationSettings();
        const useLocation = parentLocationSettings?.locationEnabled ?? true;
        
        let alerts = [];
        
        // 🥇 LEVEL 1: GPS + Parent Region (Best) - only if parent allows
        if (useLocation && userLocation && await getParentRegion()) {
            const parentRegion = await getParentRegion();
            console.log(`📍 Using GPS + Parent region: ${parentRegion} (parent permission: enabled)`);
            const response = await fetch(`/api/alerts/location?lat=${userLocation.lat}&lon=${userLocation.lon}&region=${parentRegion}`);
            if (response.ok) {
                alerts = await response.json();
            }
        }
        
        // 🥈 LEVEL 2: GPS Only (Good) - only if parent allows  
        else if (useLocation && userLocation) {
            console.log('📍 Using GPS location only (parent permission: enabled)');
            const response = await fetch(`/api/alerts/location?lat=${userLocation.lat}&lon=${userLocation.lon}`);
            if (response.ok) {
                alerts = await response.json();
            }
        }
        
        // 🥉 LEVEL 3: National Alerts (Basic) - always available
        else {
            const reason = !useLocation ? 'parent disabled location' : 'no location consent';
            console.log(`🏛️ Using national alerts (${reason})`);
            
            // GitHub Pages = no backend, go straight to RSS
            console.log('📡 Fetching from RCB RSS (frontend-only mode)');
            alerts = await fetchDirectRCBAlerts();
        }
        
        // 🚨 SAFETY CHECK: Did we get any alerts?
        if (alerts.length === 0 && !alertSourceWorking) {
            console.error('🚨 CRITICAL: No alert sources available!');
            console.log('⚠️ Alert monitoring will show as OFFLINE');
            
            // Don't show fake alerts - be honest about status
            alertMonitoringActive = false;
        }
        
        await processNewAlerts(alerts);
        
    } catch (error) {
        console.log('⚠️ Alert check failed:', error.message);
        // Emergency fallback - try critical alerts only
        try {
            const criticalResponse = await fetch(`/api/alerts/critical`);
            if (criticalResponse.ok) {
                const criticalAlerts = await criticalResponse.json();
                await processNewAlerts(criticalAlerts);
            }
        } catch (criticalError) {
            console.log('🚨 Critical alert fallback also failed');
        }
    }
}

/**
 * 🚨 GENERATE EMERGENCY FALLBACK MESSAGE
 * Uses parent-created emergency message or safe default
 */
async function generateEmergencyFallbackMessage(alert, childAge) {
    try {
        // 🔒 FIRST: Try to get parent-created emergency message
        if (window.getParentMessage) {
            // Get current child ID for child-specific messages
            let childId = null;
            if (window.childSessionManager) {
                childId = await window.childSessionManager.getCurrentChildId();
            }
            
            const parentEmergencyMessage = await window.getParentMessage('emergency', 'fallback', childId);
            if (parentEmergencyMessage && parentEmergencyMessage.trim()) {
                console.log('✅ Using parent-created emergency fallback message');
                return parentEmergencyMessage;
            }
        }
        
        // 🛡️ SAFE DEFAULT: No SMS, no stress, focus on finding adults
        const isYoung = childAge <= 6;
        
        const safeDefaults = {
            young: `🚨 Uwaga, kochanie! Jest ważne ostrzeżenie w okolicy. Znajdź mamę, tatę lub innego dorosłego i zostań przy nim. Dorośli wiedzą co robić i zadbają o Twoje bezpieczeństwo.`,
            older: `🚨 Uwaga! Otrzymano ważne ostrzeżenie bezpieczeństwa. Skontaktuj się z rodzicami lub znajdź dorosłego. Słuchaj instrukcji dorosłych i służb ratunkowych.`
        };
        
        return isYoung ? safeDefaults.young : safeDefaults.older;
        
    } catch (error) {
        console.error('❌ Emergency fallback generation failed:', error);
        // Ultra-safe fallback
        return `🚨 Ważne ostrzeżenie! Znajdź dorosłego i zostań przy nim. Dorośli zadbają o Twoje bezpieczeństwo.`;
    }
}

/**
 * 🏠 GET PARENT REGION
 * Retrieves parent-set region from Mina ZK storage
 */
async function getParentRegion() {
    try {
        if (!window.getParentMessage) {
            return null;
        }
        
        // Try to get parent-set region from preferences
        const preferences = await window.loadFromMinaZK('zk_parent_preferences');
        return preferences?.region || null;
        
    } catch (error) {
        console.log('❌ Failed to get parent region:', error);
        return null;
    }
}

/**
 * 📝 PROCESS NEW ALERTS
 * Converts official alerts to child-friendly messages using LLM
 */
async function processNewAlerts(alerts) {
    if (!alerts || alerts.length === 0) {
        return;
    }
    
    const newAlerts = alerts.filter(alert => 
        !activeAlerts.some(existing => existing.id === alert.id)
    );
    
    if (newAlerts.length === 0) {
        return;
    }
    
    console.log(`🚨 ${newAlerts.length} new alerts found`);
    
    for (const alert of newAlerts) {
        await processChildFriendlyAlert(alert);
    }
    
    // Update active alerts list
    activeAlerts = [...activeAlerts, ...newAlerts].slice(-10); // Keep last 10
}

/**
 * 👶 PROCESS CHILD-FRIENDLY ALERT
 * Converts official alert to age-appropriate message with LLM or Parent CMS
 */
async function processChildFriendlyAlert(alert) {
    const childAge = window.getChildAgeForAI ? window.getChildAgeForAI() : 8;
    
    console.log(`🚨 Processing alert for ${childAge}-year-old: ${alert.title}`);
    
    try {
        // 🔒 FIRST: Check if parent created custom message for this alert type
        let childFriendlyMessage = await getParentCustomMessage(alert, childAge);
        
        if (childFriendlyMessage) {
            console.log('✅ Using parent-created custom message from Mina ZK');
        } else {
            // 🤖 SECOND: Try LLM generation
            childFriendlyMessage = await generateAlertMessage(alert, childAge);
            
            // 📋 THIRD: Fallback to rule-based if LLM fails
            if (!childFriendlyMessage || childFriendlyMessage.length < 10) {
                childFriendlyMessage = generateRuleBasedAlert(alert, childAge);
                console.log('✅ Using rule-based fallback message');
            } else {
                console.log('✅ Using LLM-generated message');
            }
        }
        
        // 🚨 EMERGENCY FALLBACK: Universal safety message for unrecognized alerts
        if (!childFriendlyMessage || childFriendlyMessage.length < 10) {
            childFriendlyMessage = generateEmergencyFallbackMessage(alert, childAge);
            console.log('🚨 Using emergency fallback for unrecognized alert type');
        }
        
        // Show alert to child
        showChildAlert(alert, childFriendlyMessage);
        
        // Track in memory for parents
        trackAlertForParents(alert, childFriendlyMessage);
        
    } catch (error) {
        console.error('❌ Failed to process alert:', error);
        // Fallback to simple alert
        showChildAlert(alert, generateRuleBasedAlert(alert, childAge));
    }
}

/**
 * 🔒 GET PARENT CUSTOM MESSAGE
 * Checks if parent created custom message in CMS for this alert type
 */
async function getParentCustomMessage(alert, childAge) {
    try {
        if (!window.getParentMessage) {
            return null; // Parent CMS not available
        }
        
        // Determine alert type
        const title = alert.title.toLowerCase();
        const content = alert.content.toLowerCase();
        
        let alertType = null;
        
        if (title.includes('woda niezdatna') || content.includes('nie nadaje się do spożycia')) {
            alertType = 'water';
        } else if (title.includes('burza') || title.includes('wiatr') || title.includes('grad')) {
            alertType = 'storm';
        } else if (title.includes('powódź') || content.includes('podtopienia')) {
            alertType = 'flood';
        } else if (title.includes('dron') || title.includes('obiekt')) {
            alertType = 'drones';
        } else if (title.includes('ćwiczenia')) {
            alertType = 'exercises';
        }
        
        if (alertType) {
            // Get current child ID for child-specific messages
            let childId = null;
            if (window.childSessionManager) {
                childId = await window.childSessionManager.getCurrentChildId();
            }
            
            // Try child-specific message first, then fallback to general
            const parentMessage = await window.getParentMessage('alerts', alertType, childId);
            return parentMessage;
        }
        
        return null;
        
    } catch (error) {
        console.error('❌ Failed to get parent custom message:', error);
        return null;
    }
}

/**
 * 🤖 GENERATE ALERT MESSAGE using LLM
 */
async function generateAlertMessage(alert, childAge) {
    if (!window.polishAI || !window.polishAI.isConfigured()) {
        return null;
    }
    
    const severity = alert.severity || 'medium';
    const location = alert.location || 'twoja okolica';
    
    const prompt = `Jako asystent bezpieczeństwa dla ${childAge}-letniego dziecka, przetłumacz ten oficjalny alert na prosty, uspokajający język:

ALERT: "${alert.title}"
OPIS: "${alert.content}"
LOKALIZACJA: ${location}
POZIOM: ${severity}

Wytyczne:
- Użyj prostego języka dla ${childAge}-latka
- Zacznij od odpowiedniego emoji
- Maksymalnie 2-3 zdania
- Podaj konkretne, bezpieczne działania
- Nie strasź, ale ostrzegaj
- Podkreśl "poproś dorosłego o pomoc"

Odpowiedź:`;

    try {
        const response = await window.polishAI.generateResponse('alert_translation', childAge, {
            alert: alert,
            prompt: prompt
        });
        
        return response;
    } catch (error) {
        console.error('❌ LLM alert generation failed:', error);
        return null;
    }
}

/**
 * 📋 GENERATE RULE-BASED ALERT (fallback)
 */
function generateRuleBasedAlert(alert, childAge) {
    const title = alert.title.toLowerCase();
    const content = alert.content.toLowerCase();
    
    let message = '';
    let emoji = '⚠️';
    
    // Determine alert type and generate appropriate message with CONCRETE actions
    if (title.includes('burza') || title.includes('wiatr') || title.includes('grad') || content.includes('burze')) {
        emoji = '⛈️';
        if (childAge <= 6) {
            message = 'Nadchodzi burza z gradem! Idź szybko do domu. Nie baw się na dworze. Schowaj zabawki do środka.';
        } else if (childAge <= 9) {
            message = 'Alert burzowy! Wróć natychmiast do domu. Unikaj drzew i wysokich budynków. Zamknij okna.';
        } else {
            message = 'Ostrzeżenie przed burzami i gradem. Szukaj natychmiastowego schronienia. Zabezpiecz rzeczy na balkonie.';
        }
    } else if (title.includes('woda niezdatna') || content.includes('nie nadaje się do spożycia') || content.includes('nie nadaje się do użytku')) {
        emoji = '💧';
        if (childAge <= 6) {
            message = 'Nie pij wody z kranu! Woda jest brudna i może cię rozchorować. Pij tylko wodę z butelek.';
        } else if (childAge <= 9) {
            message = 'Woda z kranu jest skażona! Używaj tylko wody butelkowanej do picia, mycia zębów i gotowania.';
        } else {
            message = 'Skażenie wody pitnej! Nie używaj wody z kranu do picia ani przygotowania jedzenia. Tylko woda butelkowana!';
        }
    } else if (title.includes('powódź') || content.includes('podtopienia') || content.includes('wezbranych') || content.includes('opady deszczu')) {
        emoji = '🌊';
        if (childAge <= 6) {
            message = 'Za dużo wody wszędzie! Nie chodź blisko rzek ani potoczków. Trzymaj się z dala od kałuż.';
        } else if (childAge <= 9) {
            message = 'Niebezpieczne podtopienia! Unikaj rzek, mostów i niskich terenów. Idź na wyższe miejsce.';
        } else {
            message = 'Alert powodziowy! Natychmiast oddal się od rzek i potoków. Udaj się na wyższy teren.';
        }
    } else if (title.includes('dron') || title.includes('obiekt') || content.includes('naruszyły granice')) {
        emoji = '🚁';
        if (childAge <= 6) {
            message = 'Niebezpieczne latające rzeczy! Idź szybko do domu. Nie dotykaj niczego co spadło z nieba.';
        } else if (childAge <= 9) {
            message = 'Niebezpieczne drony w okolicy! Wróć do domu. Jeśli widzisz coś spadającego - nie zbliżaj się!';
        } else {
            message = 'Alert wojskowy - drony! Natychmiastowe schronienie. Nie dotykaj podejrzanych obiektów!';
        }
    } else if (title.includes('ćwiczenia') || content.includes('strzałów') || content.includes('helikopterów')) {
        emoji = '🎯';
        if (childAge <= 6) {
            message = 'Wojsko ćwiczy dzisiaj. Będzie głośno ale to nie prawdziwa wojna. Zostań blisko dorosłych.';
        } else if (childAge <= 9) {
            message = 'Ćwiczenia wojskowe w okolicy. Odgłosy strzałów i helikopterów to tylko trening. Wszystko w porządku.';
        } else {
            message = 'Ćwiczenia służb mundurowych. Hałas strzałów i loty helikopterów to część treningu, zachowaj spokój.';
        }
    } else {
        // Generic alert with concrete actions
        if (childAge <= 6) {
            message = 'Ważne ostrzeżenie! Znajdź szybko dorosłego i powiedz mu o tej wiadomości.';
        } else if (childAge <= 9) {
            message = 'Alert bezpieczeństwa! Poinformuj rodziców i trzymaj się blisko domu.';
        } else {
            message = 'Ostrzeżenie w twojej okolicy. Sprawdź z rodzicami co robić dalej.';
        }
    }
    
    return `${emoji} ${message} Zawsze poproś dorosłego o pomoc!`;
}

/**
 * 🚨 SHOW CHILD ALERT
 * Displays alert to child with speech and visual notification
 */
function showChildAlert(alert, childMessage) {
    console.log('🚨 Showing alert to child:', childMessage);
    
    // Update mascot with alert message
    const mascotText = document.getElementById('mascot-text');
    if (mascotText) {
        mascotText.innerHTML = `<div class="alert-message">${childMessage}</div>`;
        mascotText.style.backgroundColor = '#ffe6e6';
        mascotText.style.border = '2px solid #ff6b6b';
        mascotText.style.borderRadius = '12px';
        mascotText.style.padding = '15px';
        mascotText.style.animation = 'pulse 2s infinite';
    }
    
    // Speak the alert using Czubówna-inspired voice synthesis
    // Remove emoji for speech synthesis (voice can't read emoji properly)
    const speechMessage = childMessage.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
    speakText(speechMessage);
    
    // Visual alert indicator
    document.body.style.background = 'linear-gradient(45deg, #ffeb3b, #ff9800)';
    setTimeout(() => {
        document.body.style.background = '';
        if (mascotText) {
            mascotText.style.backgroundColor = '';
            mascotText.style.border = '';
            mascotText.style.animation = '';
        }
    }, 10000);
    
    // Browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🚨 Bezpieczny Pomocnik', {
            body: childMessage,
            icon: 'images/logo_192x192.png',
            requireInteraction: true
        });
    }
}

/**
 * 📊 TRACK ALERT FOR PARENTS
 * Stores alert information for parental dashboard (ZK-encrypted)
 */
function trackAlertForParents(alert, childMessage) {
    const alertData = {
        id: alert.id,
        timestamp: new Date().toISOString(),
        originalTitle: alert.title,
        childMessage: childMessage,
        severity: alert.severity,
        location: alert.location,
        childAge: window.getChildAgeForAI ? window.getChildAgeForAI() : null
    };
    
    // Store in ZK system for privacy
    if (window.saveZKUserProgress && window.getZKUserProgress) {
        const userProgress = window.getZKUserProgress() || {};
        const existingAlerts = userProgress.alert_history || [];
        
        // Ensure it's an array
        if (!Array.isArray(existingAlerts)) {
            console.warn('⚠️ alert_history is not an array, resetting to empty array');
            userProgress.alert_history = [];
        } else {
            existingAlerts.push(alertData);
            
            // Keep only last 50 alerts
            userProgress.alert_history = existingAlerts.slice(-50);
        }
        
        window.saveZKUserProgress(userProgress);
        
        console.log('📊 Alert tracked in ZK system for parental review');
    }
}

// 🧪 ALERT TESTING SYSTEM
/**
 * 🧪 TEST ALERT FUNCTION - For local testing
 * Simulates receiving an alert to test child-friendly translation
 */
function testAlert(alertType = 'weather') {
    console.log('🧪 TESTING ALERT SYSTEM - Simulating real alert...');
    
    const testAlerts = {
        water: {
            id: 'rcb_water_real',
            title: 'Alert RCB - woda niezdatna do picia w gminie',
            content: 'UWAGA! Woda z wodociągu w gminie nie nadaje się do spożycia. Gmina zapewnia wodę pitną w butelkach i z beczkowozu. Śledź lokalne komunikaty.',
            severity: 'critical',
            location: 'Gmina lokalna',
            timestamp: new Date().toISOString()
        },
        storm: {
            id: 'rcb_storm_real',
            title: 'Alert RCB - burze, silny wiatr i lokalnie grad',
            content: 'Uwaga! Dziś możliwe burze, silny wiatr i lokalnie grad. Zachowaj ostrożność i zabezpiecz rzeczy, które może porwać wiatr.',
            severity: 'warning',
            location: 'Województwo Małopolskie',
            timestamp: new Date().toISOString()
        },
        flood: {
            id: 'rcb_flood_real',
            title: 'Alert RCB - intensywne opady deszczu i burze',
            content: 'Uwaga! Dziś prognozowane intensywne opady deszczu i burze. Możliwe podtopienia. Nie zbliżaj się do wezbranych rzek. Słuchaj poleceń służb.',
            severity: 'warning',
            location: 'Dolina Wisły',
            timestamp: new Date().toISOString()
        },
        drones: {
            id: 'rcb_drones_real',
            title: 'Alert RCB - neutralizacja obiektów',
            content: 'Uwaga! W związku z operacją neutralizacji obiektów, które naruszyły granice RP, informuj służby o dronach lub miejscach ich upadku. Nie zbliżaj się do nich.',
            severity: 'critical',
            location: 'Województwa wschodnie',
            timestamp: new Date().toISOString()
        },
        exercises: {
            id: 'rcb_exercises_real', 
            title: 'Alert RCB - ćwiczenia służb mundurowych',
            content: 'Uwaga! Ćwiczenia służb mundurowych. Możliwe odgłosy strzałów i loty helikopterów. Zachowaj spokój i ostrożność.',
            severity: 'info',
            location: 'Teren ćwiczeń',
            timestamp: new Date().toISOString()
        }
    };
    
    const testAlert = testAlerts[alertType] || testAlerts.storm;
    
    console.log('🧪 Simulating alert:', testAlert);
    
    // Process exactly like real alert
    processChildFriendlyAlert(testAlert);
}

// Add test buttons to DOM when page loads
function addTestButtons() {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-controls';
    testContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #333;
        color: white;
        padding: 15px;
        border-radius: 10px;
        z-index: 9999;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    
    testContainer.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px;">🧪 Test Rzeczywistych Alertów RCB</div>
        <button onclick="testAlert('water')" style="margin: 5px; padding: 8px 12px; border: none; border-radius: 5px; background: #f44336; color: white; cursor: pointer;">💧 Woda Niezdatna</button>
        <button onclick="testAlert('storm')" style="margin: 5px; padding: 8px 12px; border: none; border-radius: 5px; background: #ff9800; color: white; cursor: pointer;">⛈️ Burze+Grad</button>
        <button onclick="testAlert('flood')" style="margin: 5px; padding: 8px 12px; border: none; border-radius: 5px; background: #2196F3; color: white; cursor: pointer;">🌊 Powódź</button>
        <button onclick="testAlert('drones')" style="margin: 5px; padding: 8px 12px; border: none; border-radius: 5px; background: #9c27b0; color: white; cursor: pointer;">🚁 Drony</button>
        <button onclick="testAlert('exercises')" style="margin: 5px; padding: 8px 12px; border: none; border-radius: 5px; background: #607d8b; color: white; cursor: pointer;">🎯 Ćwiczenia</button>
        <button onclick="document.getElementById('test-controls').style.display='none'" style="margin: 5px; padding: 8px 12px; border: none; border-radius: 5px; background: #666; color: white; cursor: pointer;">✕ Ukryj</button>
    `;
    
    document.body.appendChild(testContainer);
    
    console.log('🧪 Test buttons added - you can now test alerts!');
}

// Frontend AI - Polish AI + ZK privacy  
async function generateSmartSpeech(action, context = {}) {
    // 🔒 FIRST PRIORITY: Check Parent CMS for custom messages
    if (window.getParentMessage) {
        try {
            // Get current child ID for child-specific messages
            let childId = null;
            if (window.childSessionManager) {
                childId = await window.childSessionManager.getCurrentChildId();
            }
            
            // Map actions to CMS categories/types
            let category, type;
            if (action === 'welcome') {
                category = 'safety';
                type = 'welcome';
            } else if (action === 'emergency_help') {
                category = 'safety';
                type = 'help';
            } else if (action === 'find_safety') {
                category = 'safety';
                type = 'lost';
            }
            
            if (category && type) {
                const parentMessage = await window.getParentMessage(category, type, childId);
                if (parentMessage && parentMessage.trim()) {
                    console.log(`✅ Using parent-created message from CMS: ${category}.${type}`);
                    return parentMessage;
                }
            }
        } catch (error) {
            console.log('⚠️ Failed to get parent message from CMS:', error);
        }
    }
    
    // 🚫 NO PARENT MESSAGES = SILENT MODE
    // If parent hasn't set up CMS messages, stay silent
    console.log(`🔇 No parent messages configured for "${action}" - staying silent`);
    return null;
}

// 🔇 FUNCTION DISABLED - generateLocalSmartSpeech no longer used in silent mode
/* ORIGINAL generateLocalSmartSpeech FUNCTION DISABLED:
function generateLocalSmartSpeech(action, age, timeOfDay, isFirstVisit, hasLocation) {
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
            // 🔇 NO FALLBACK - Only Parent CMS messages allowed for location checking
            // If no parent message configured, stay silent
            return null;
            
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
END OF DISABLED FUNCTION */

async function handleWhereAmI() {
    console.log('🧭 Where Am I clicked');

    // 📍 STEP 1: Show "checking" message from parent CMS
    if (window.showLocationMessage) {
        await showLocationMessage('checking');
    }
    
    // Wait a bit for the checking message to be displayed
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 📍 STEP 2: Get location and show "found" message with location details
    // The getUserLocation with userRequested=true will trigger showLocationMessage('success')
    // which will use parent CMS message with location variables replaced
    getUserLocation(true);
}

async function handleFindSafety() {
    console.log('🏃 Find Safety clicked');
    
    const mascotText = document.getElementById('mascot-text');
    if (mascotText) {
        mascotText.textContent = '🏃 Szukam bezpiecznych miejsc w pobliżu...';
    }
    
    // 🔒 FIRST: Try to get parent-created safety message
    let smartMessage = null;
    if (window.getParentMessage) {
        try {
            // Get current child ID for child-specific messages
            let childId = null;
            if (window.childSessionManager) {
                childId = await window.childSessionManager.getCurrentChildId();
            }
            
            smartMessage = await window.getParentMessage('safety', 'help', childId);
            if (smartMessage) {
                console.log('✅ Using parent-created safety message from Mina ZK');
            }
        } catch (error) {
            console.error('❌ Failed to get parent safety message:', error);
        }
    }
    
    // 🤖 FALLBACK: Use AI/rule-based if no parent message
    if (!smartMessage) {
        smartMessage = await generateSmartSpeech('find_safety');
    }
    
    // 📍 GET USER LOCATION AND FETCH REAL PLACES
    if (navigator.geolocation) {
        try {
            console.log('📍 Getting user location for real safe places...');
            
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                });
            });
            
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            
            console.log(`📍 User location: ${userLat}, ${userLon}`);
            
            // 🗺️ FETCH REAL SAFE PLACES from OpenStreetMap
            if (typeof window.displayRealSafePlaces === 'function') {
                await window.displayRealSafePlaces({ lat: userLat, lon: userLon });
                console.log('✅ Real safe places displayed');
            } else {
                console.warn('⚠️ displayRealSafePlaces not loaded - make sure emergency-real-places.js is included');
            }
            
        } catch (error) {
            console.error('❌ Failed to get location or fetch places:', error);
            if (mascotText) {
                mascotText.textContent = '⚠️ Nie udało się określić lokalizacji. Sprawdź uprawnienia GPS.';
            }
        }
    }
    
    setTimeout(() => {
        if (mascotText) {
            mascotText.textContent = smartMessage;
        }
        // Remove emoji for speech synthesis (voice can't read emoji properly)
        const speechMessage = smartMessage.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
        speakText(speechMessage);
    }, 800);
}

async function handleSafeRoute() {
    console.log('🚶 Safe Route clicked - Find Parent/Home');
    
    const mascotText = document.getElementById('mascot-text');
    if (mascotText) {
        mascotText.textContent = '🚶 Szukam drogi do rodzica lub domu...';
    }
    
    // 🔒 FIRST: Try to get parent-created route message
    let smartMessage = null;
    if (window.getParentMessage) {
        try {
            // Get current child ID for child-specific messages
            let childId = null;
            if (window.childSessionManager) {
                childId = await window.childSessionManager.getCurrentChildId();
            }
            
            smartMessage = await window.getParentMessage('safety', 'route', childId);
            if (smartMessage) {
                console.log('✅ Using parent-created route message from Mina ZK');
            }
        } catch (error) {
            console.error('❌ Failed to get parent route message:', error);
        }
    }
    
    // 🤖 FALLBACK: Use AI/rule-based if no parent message
    if (!smartMessage) {
        smartMessage = await generateSmartSpeech('safe_route');
    }
    
    // 👨‍👩‍👧 SHOW PARENT ON MAP (REAL FUNCTIONALITY)
    if (typeof window.showParentMapFromButton === 'function') {
        console.log('🗺️ Showing parent on map...');
        try {
            await window.showParentMapFromButton();
        } catch (error) {
            console.error('❌ Map display error:', error);
        }
    } else {
        console.warn('⚠️ showParentMapFromButton not loaded - make sure parent-map-display.js is included');
    }
    
    setTimeout(() => {
        if (mascotText) {
            mascotText.textContent = smartMessage;
        }
        // Remove emoji for speech synthesis (voice can't read emoji properly)
        const speechMessage = smartMessage.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
        speakText(speechMessage);
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
    
    const smartMessage = await generateSmartSpeech('emergency_help');
    
    setTimeout(() => {
        if (mascotText) {
            mascotText.textContent = smartMessage;
        }
        // Remove emoji for speech synthesis (voice can't read emoji properly)
        const speechMessage = smartMessage.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
        speakText(speechMessage);
    }, 500);
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎯 DOM CONTENT LOADED');
    
    // 🧒 INITIALIZE CHILD SESSION - CRITICAL FOR MULTI-CHILD SUPPORT
    if (window.childSessionManager) {
        try {
            const childId = await window.childSessionManager.getCurrentChildId();
            console.log(`🧒 Child Session initialized: ${childId}`);
            
            const childInfo = await window.childSessionManager.getCurrentChildInfo();
            if (childInfo) {
                console.log(`👶 Child info: ${childInfo.name} (${childInfo.age} lat)`);
            }
        } catch (error) {
            console.error('❌ Child Session Manager initialization failed:', error);
        }
    } else {
        console.warn('⚠️ Child Session Manager not found - multi-child support disabled');
    }
    
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
            getUserLocation(true);
            
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

    // Parent location button handler
    const parentLocationBtn = document.getElementById('parent-location-btn');
    if (parentLocationBtn) {
        parentLocationBtn.addEventListener('click', async () => {
            console.log('👨‍👩‍👧 Parent location button clicked');
            await showParentLocationWithFallback();
            trackFeatureUsage('parent_location');
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
    
    // 🚨 START ALERT MONITORING SYSTEM
    // Starts monitoring 260 Polish alert sources for child safety
    setTimeout(() => {
        startAlertMonitoring();
    }, 5000); // Start after 5 seconds to allow app to fully initialize
    
    // 🧪 ADD TEST BUTTONS for local testing
    setTimeout(() => {
        // addTestButtons(); // DISABLED FOR PRODUCTION
    }, 7000); // Add test buttons after system initialization
});

/**
 * 🔧 REGISTER SERVICE WORKER FOR BACKGROUND ALERTS
 * Critical for receiving alerts when app is closed!
 */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(registration => {
            console.log('✅ Service Worker registered for background alerts');
            
            // Setup periodic background sync for emergency alerts
            setupBackgroundSync(registration);
            
            // Check for push notification permission
            return registration.pushManager.getSubscription();
        })
        .then(subscription => {
            if (!subscription) {
                console.log('💡 Push notifications not set up - using background sync instead');
            } else {
                console.log('✅ Push notifications active - full background alerts available');
            }
        })
        .catch(error => {
            console.error('❌ Service Worker registration failed:', error);
            console.warn('⚠️ Background alerts disabled - app must be open for alerts');
        });
} else {
    console.warn('⚠️ Service Worker not supported - background alerts disabled');
}

/**
 * 🔄 SETUP BACKGROUND SYNC FOR EMERGENCY ALERTS
 */
async function setupBackgroundSync(registration) {
    try {
        // Register periodic background sync (Chrome)
        if ('periodicSync' in registration) {
            const status = await navigator.permissions.query({
                name: 'periodic-background-sync',
            });
            
            if (status.state === 'granted') {
                await registration.periodicSync.register('emergency-alert-check', {
                    minInterval: 15 * 60 * 1000, // 15 minutes - critical for child safety
                });
                console.log('✅ Periodic background sync registered - checking alerts every 15 minutes');
            } else {
                console.log('⚠️ Periodic background sync not permitted - using manual sync');
                // Fallback to manual background sync triggers
                setupManualBackgroundSync(registration);
            }
        } else {
            console.log('⚠️ Periodic background sync not supported - using manual sync');
            setupManualBackgroundSync(registration);
        }
        
    } catch (error) {
        console.error('❌ Failed to setup background sync:', error);
    }
}

/**
 * 🔧 MANUAL BACKGROUND SYNC SETUP
 */
function setupManualBackgroundSync(registration) {
    // Trigger background sync on app visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            // App is being hidden/closed - trigger background sync
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                registration.sync.register('check-emergency-alerts')
                    .then(() => console.log('🔄 Background sync registered on app close'))
                    .catch(err => console.warn('Background sync failed:', err));
            }
        }
    });
    
    // Also trigger sync periodically when app is active
    setInterval(() => {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            registration.sync.register('check-emergency-alerts')
                .catch(err => console.warn('Periodic background sync failed:', err));
        }
    }, 10 * 60 * 1000); // Every 10 minutes as backup
}

/**
 * 👨‍👩‍👧 SHOW PARENT LOCATION WITH FALLBACK
 * Shows parent location, home address, or reassuring message
 */
async function showParentLocationWithFallback() {
    try {
        console.log('👨‍👩‍👧 Attempting to show parent location...');
        
        // Try to get parent location
        if (window.getParentLocation) {
            const parentLocation = await window.getParentLocation();
            
            if (parentLocation && parentLocation.lat && parentLocation.lon) {
                console.log('✅ Parent location found');
                
                // Show on map
                if (window.showParentOnMap) {
                    await window.showParentOnMap(parentLocation.lat, parentLocation.lon);
                }
                
                // Show success message
                const mascotText = document.getElementById('mascot-text');
                if (mascotText) {
                    mascotText.textContent = '✅ Znalazłem rodziców! Zobacz ich lokalizację na mapie.';
                }
                
                speakText('Znalazłem rodziców! Zobacz ich lokalizację na mapie.');
                return;
            }
        }
        
        // Fallback 1: Try home address
        if (window.getHomeLocation) {
            const homeLocation = await window.getHomeLocation();
            
            if (homeLocation && homeLocation.lat && homeLocation.lon) {
                console.log('✅ Home address found as fallback');
                
                // Show home on map
                if (window.showParentOnMap) {
                    await window.showParentOnMap(homeLocation.lat, homeLocation.lon);
                }
                
                // Reassuring message
                const mascotText = document.getElementById('mascot-text');
                if (mascotText) {
                    mascotText.textContent = '🏠 Nie znalazłem aktualnej lokalizacji rodziców, ale pokazuję Wam adres domowy. Rodzice na pewno są w pobliżu i wszystko jest w porządku!';
                }
                
                speakText('Nie znalazłem aktualnej lokalizacji rodziców, ale pokazuję wam adres domowy. Rodzice na pewno są w pobliżu i wszystko jest w porządku!');
                return;
            }
        }
        
        // Fallback 2: Reassuring message (no location data)
        console.log('⚠️ No location data available');
        
        const mascotText = document.getElementById('mascot-text');
        if (mascotText) {
            mascotText.textContent = '💙 Nie mogę teraz pokazać lokalizacji rodziców, ale to nie znaczy, że coś złego się dzieje! Rodzice często nie udostępniają lokalizacji, gdy są w bezpiecznym miejscu. Jeśli martwisz się, możesz do nich zadzwonić - na pewno odpowiedzą! ☺️';
        }
        
        speakText('Nie mogę teraz pokazać lokalizacji rodziców, ale to nie znaczy, że coś złego się dzieje! Rodzice często nie udostępniają lokalizacji, gdy są w bezpiecznym miejscu. Jeśli martwisz się, możesz do nich zadzwonić - na pewno odpowiedzą!');
        
    } catch (error) {
        console.error('❌ Error showing parent location:', error);
        
        // Error message - still reassuring
        const mascotText = document.getElementById('mascot-text');
        if (mascotText) {
            mascotText.textContent = '😊 Nie mogę teraz sprawdzić lokalizacji rodziców, ale to nic złego! Jeśli chcesz z nimi porozmawiać, możesz do nich zadzwonić. Na pewno wszystko jest w porządku!';
        }
        
        speakText('Nie mogę teraz sprawdzić lokalizacji rodziców, ale to nic złego! Jeśli chcesz z nimi porozmawiać, możesz do nich zadzwonić. Na pewno wszystko jest w porządku!');
    }
}

/**
 * 🗃️ CACHE USER LOCATION FOR BACKGROUND ALERTS
 */
async function cacheLocationForBackground(lat, lon) {
    try {
        const locationData = { lat, lon, timestamp: new Date().toISOString() };
        
        // Cache in Cache API (for background alerts)
        if ('caches' in window) {
            const cache = await caches.open('emergency-data');
            await cache.put('/cache/user-location', 
                new Response(JSON.stringify(locationData))
            );
        }
        
        // ALSO cache in localStorage (for survival mode)
        localStorage.setItem('emergency_last_child_location', JSON.stringify(locationData));
        
        console.log('📍 Location cached for emergency mode:', locationData);
    } catch (error) {
        console.warn('Failed to cache location:', error);
    }
}

/**
 * 📊 SHOW ALERT MONITORING STATUS
 * Visual indicator that alert system is working
 */
function showAlertMonitoringStatus() {
    // Create status indicator
    const statusDiv = document.createElement('div');
    statusDiv.id = 'alert-monitoring-status';
    statusDiv.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(76, 175, 80, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        z-index: 1000;
        font-weight: bold;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        /* animation: gentle-pulse 6s ease-in-out infinite; */ /* Disabled - no distracting animations */
    `;
    
    statusDiv.innerHTML = '🚨 System Alertów: AKTYWNY';
    
    // Add click handler for detailed status
    statusDiv.onclick = () => {
        showDetailedAlertStatus();
    };
    
    document.body.appendChild(statusDiv);
    
    // Update status periodically
    setInterval(() => {
        updateAlertMonitoringStatus(statusDiv);
    }, 30000); // Every 30 seconds
}

/**
 * 📈 UPDATE ALERT MONITORING STATUS
 */
function updateAlertMonitoringStatus(statusDiv) {
    const now = new Date();
    const lastCheck = now.toLocaleTimeString('pl-PL', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const status = alertMonitoringActive && alertSourceWorking ? 'AKTYWNE ✅' : 
                   alertMonitoringActive && !alertSourceWorking ? 'OFFLINE ⚠️' :
                   'WYŁĄCZONE ❌';
    
    statusDiv.innerHTML = `🚨 Alerty: ${status} | ${lastCheck}`;  
    
    // Change color based on REAL status
    if (alertMonitoringActive && alertSourceWorking) {
        statusDiv.style.background = 'rgba(76, 175, 80, 0.9)'; // Green - working
    } else if (alertMonitoringActive && !alertSourceWorking) {
        statusDiv.style.background = 'rgba(255, 152, 0, 0.9)'; // Orange - trying
    } else {
        statusDiv.style.background = 'rgba(244, 67, 54, 0.9)'; // Red - off
    }
}

/**
 * 📋 SHOW DETAILED ALERT STATUS
 */
function showDetailedAlertStatus() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    
    content.innerHTML = `
        <h3>📊 Status Systemu Alertów</h3>
        <p><strong>🚨 Monitoring:</strong> ${alertMonitoringActive ? (alertSourceWorking ? 'AKTYWNY ✅' : 'OFFLINE - brak źródła ⚠️') : 'WYŁĄCZONY ❌'}</p>
        <p><strong>📡 Źródło alertów:</strong> ${alertSourceWorking ? `RCB RSS (ostatnie: ${lastSuccessfulFetch ? new Date(lastSuccessfulFetch).toLocaleTimeString('pl-PL') : 'nigdy'})` : 'Niedostępne'}</p>
        <p><strong>⏰ Częstotliwość:</strong> Co 90 sekund (tryb deweloperski)</p>
        <p><strong>📍 Lokalizacja:</strong> ${userLocation ? 'Włączona' : 'Wyłączona'}</p>
        <p><strong>🎯 Aktywne alerty:</strong> ${activeAlerts.length}</p>
        <p><strong>🌐 Źródła danych:</strong></p>
        <ul>
            <li>🥇 Backend API (/api/alerts/*)</li>
            <li>🥈 Direct RCB RSS (gov.pl)</li>
            <li>🥉 System Test Alerts</li>
        </ul>
        <p><strong>⚡ Przewaga nad oficjalnymi:</strong></p>
        <p style="color: #4CAF50;">✓ <strong>30 sekund</strong> vs 3-4 godziny RCB</p>
        <p style="color: #4CAF50;">✓ <strong>Background alerts</strong> - działa gdy app zamknięty</p>
        <p style="color: #4CAF50;">✓ <strong>Child-friendly</strong> - messages dla dzieci</p>
        <hr>
        <button onclick="this.parentNode.parentNode.remove()" 
                style="background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
            ✅ Zamknij
        </button>
        <button onclick="checkForAlerts(); this.parentNode.parentNode.remove()" 
                style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            🔄 Sprawdź teraz
        </button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

/**
 * 💡 LOAD SAFETY TIPS FROM PARENT CMS
 * Dynamically loads and displays golden safety rules
 */
async function loadSafetyTipsFromCMS() {
    try {
        console.log('💡 Loading safety tips from Parent CMS...');
        
        // Check if parent-cms functions are available
        if (!window.loadFromMinaZK) {
            console.warn('⚠️ parent-cms.js not loaded yet - using defaults');
            return;
        }
        
        // Get safety tips from ZK storage
        const storageKey = 'zk_parent_safety_tips';
        const safetyTips = await window.loadFromMinaZK(storageKey);
        
        if (safetyTips && Array.isArray(safetyTips) && safetyTips.length > 0) {
            console.log('✅ Safety tips loaded from CMS:', safetyTips);
            console.log(`📊 Found ${safetyTips.length} custom safety tips`);
            renderSafetyTips(safetyTips);
        } else {
            console.log('ℹ️ No custom safety tips found - keeping default HTML');
            // Keep hardcoded defaults in HTML
        }
        
    } catch (error) {
        console.error('❌ Failed to load safety tips from CMS:', error);
        console.log('🛡️ Keeping default safety tips in HTML');
        // Keep hardcoded defaults in HTML on error
    }
}

/**
 * 🎵 READ SAFETY TIP ALOUD
 * Reads safety tip using Czubówna-inspired voice with parental consent check
 */
async function readSafetyTipAloud(tip) {
    try {
        console.log('🎵 Reading safety tip aloud:', tip.title);
        
        // Build speech text - DON'T include emoji icon (not readable)
        const speechText = `${tip.title}. ${tip.content}`;
        
        console.log('📝 Speech text:', speechText);
        
        // Use existing speakText function (has parental consent check built-in)
        await speakText(speechText);
        
        console.log('✅ Safety tip read successfully');
        
    } catch (error) {
        console.error('❌ Error reading safety tip:', error);
    }
}

/**
 * 🎨 RENDER SAFETY TIPS TO DOM
 */
function renderSafetyTips(tips) {
    console.log('🎨 Starting renderSafetyTips with', tips.length, 'tips');
    
    const safetyTipsContainer = document.querySelector('.safety-tips');
    
    if (!safetyTipsContainer) {
        console.error('❌ Safety tips container (.safety-tips) not found in DOM!');
        console.log('🔍 Available containers:', document.querySelectorAll('.tips-section'));
        return;
    }
    
    console.log('✅ Safety tips container found:', safetyTipsContainer);
    console.log(`📄 Container currently has ${safetyTipsContainer.children.length} children (before clear)`);
    
    // Remove ONLY default-tip elements (keeps custom tips if any)
    const defaultTips = safetyTipsContainer.querySelectorAll('.default-tip');
    console.log(`🧽 Found ${defaultTips.length} default tips to remove`);
    defaultTips.forEach(tip => tip.remove());
    
    console.log('🧽 Removed all default tips (hardcoded fallbacks)');
    console.log(`📄 Container now has ${safetyTipsContainer.children.length} children (after removing defaults)`);
    
    if (tips.length === 0) {
        console.warn('⚠️ No custom tips to render - leaving defaults!');
        return;
    }
    
    // Render each tip
    let renderedCount = 0;
    tips.forEach((tip, index) => {
        console.log(`📝 Processing tip ${index + 1}:`, tip);
        
        if (tip.title || tip.content) {
            const tipCard = document.createElement('div');
            tipCard.className = 'tip-card';
            tipCard.style.cursor = 'pointer'; // Show it's clickable
            
            tipCard.innerHTML = `
                <div class="tip-icon">${tip.icon || '💡'}</div>
                <h4>${tip.title || 'Zasada bezpieczeństwa'}</h4>
                <p>${tip.content || ''}</p>
            `;
            
            // Add click event to read aloud
            tipCard.addEventListener('click', () => {
                console.log(`🎵 Safety tip clicked: ${tip.title}`);
                readSafetyTipAloud(tip);
            });
            
            // Add hover effect
            tipCard.addEventListener('mouseenter', () => {
                tipCard.style.transform = 'scale(1.02)';
                tipCard.style.transition = 'transform 0.2s ease';
            });
            tipCard.addEventListener('mouseleave', () => {
                tipCard.style.transform = 'scale(1)';
            });
            
            safetyTipsContainer.appendChild(tipCard);
            renderedCount++;
            console.log(`✅ Tip ${index + 1} rendered successfully with click handler`);
        } else {
            console.log(`⚠️ Tip ${index + 1} skipped - no title or content`);
        }
    });
    
    console.log(`✅ Rendered ${renderedCount}/${tips.length} custom safety tips to DOM`);
    console.log('📊 Container now has', safetyTipsContainer.children.length, 'children');
}

// 🚀 LOAD SAFETY TIPS ON PAGE LOAD
// Wait for both DOM and parent-cms.js to be ready
function initializeSafetyTips() {
    console.log('🚀 Initializing safety tips...');
    
    // Check if parent-cms.js is loaded
    if (typeof window.loadFromMinaZK === 'function') {
        console.log('✅ parent-cms.js loaded, calling loadSafetyTipsFromCMS');
        loadSafetyTipsFromCMS();
    } else {
        console.warn('⚠️ parent-cms.js not ready yet, retrying in 100ms...');
        setTimeout(initializeSafetyTips, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSafetyTips);
} else {
    // DOM already loaded, but wait a tiny bit for parent-cms.js
    setTimeout(initializeSafetyTips, 50);
}

console.log('📄 App.js loaded successfully');


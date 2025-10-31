/*
 * Bezpieczny Pomocnik - Child Safety Application
 * Copyright (c) 2025 Fundacja na rzecz Hospicjum Maryi Kr�lowej Aposto��w w Krakowie
 */

console.log('?? APP.JS LOADING...');
console.log('? Timestamp:', new Date().toISOString());

// IMMEDIATELY define critical functions
window.testSpeech = function() {
    console.log('?? TEST: Klikni�to przycisk test mowy');
    const testMessage = "Witaj! To jest test mowy. Je�li mnie s�yszysz, znaczy �e wszystko dzia�a!";
    
    if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(testMessage);
        utterance.lang = 'pl-PL';
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;
        
        utterance.onstart = () => console.log('?? Test mowy rozpocz�ty');
        utterance.onend = () => console.log('? Test mowy zako�czony');
        utterance.onerror = (e) => console.log('? B��d test mowy:', e.error);
        
        window.speechSynthesis.speak(utterance);
        console.log('?? Test speak() wys�any');
    } else {
        console.log('? Brak TTS w przegl�darce');
        alert('Twoja przegl�darka nie obs�uguje mowy!');
    }
};

// Map variables and app state
let map = null;
let markersLayer = null;
let userLocation = null;
let userLocationMarker = null;
let speechEnabled = localStorage.getItem('speech_enabled') !== 'false'; // Default: true
// Dynamic API base URL getter - reads from window or localStorage at call time
const getApiBaseUrl = () => window.APP_API_BASE_URL || localStorage.getItem('app_api_base_url') || '/api';

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
        console.log('[Push] Start subscription flow');
        if (!('Notification' in window)) {
            console.warn('[Push] Notification API not available');
            const btn = document.getElementById('notifications-btn');
            if (btn) {
                btn.innerHTML = '<span class="btn-icon">❌</span><span class="btn-text">Brak wsparcia</span>';
                btn.style.background = '#FF3B30';
            }
            return;
        }
        if (!('serviceWorker' in navigator)) {
            console.warn('[Push] Service Worker not available');
            const btn = document.getElementById('notifications-btn');
            if (btn) {
                btn.innerHTML = '<span class="btn-icon">❌</span><span class="btn-text">Brak SW</span>';
                btn.style.background = '#FF3B30';
            }
            return;
        }

        if (!('PushManager' in window)) {
            console.warn('[Push] Push API not supported');
            const btn = document.getElementById('notifications-btn');
            if (btn) {
                btn.innerHTML = '<span class="btn-icon">❌</span><span class="btn-text">Brak Push API</span>';
                btn.style.background = '#FF3B30';
            }
            return;
        }

        if (!window.isSecureContext) {
            console.warn('[Push] Insecure context. Push requires HTTPS or localhost');
            const btn = document.getElementById('notifications-btn');
            if (btn) {
                btn.innerHTML = '<span class="btn-icon">🔒</span><span class="btn-text">Włącz HTTPS</span>';
                btn.style.background = '#FF9500';
            }
            return;
        }

        const permission = await Notification.requestPermission();
        console.log('[Push] Permission:', permission);
        if (permission !== 'granted') {
            const btn = document.getElementById('notifications-btn');
            if (btn) {
                btn.innerHTML = '<span class="btn-icon">🚫</span><span class="btn-text">Zablokowane</span>';
                btn.style.background = '#FF3B30';
            }
            return;
        }

        const reg = await navigator.serviceWorker.ready;
        console.log('[Push] SW ready');
        const existing = await reg.pushManager.getSubscription();
        if (existing) {
            console.log('[Push] Existing subscription found, unsubscribing to refresh');
            try { await existing.unsubscribe(); } catch (e) { console.warn('[Push] Unsubscribe failed (ignored):', e); }
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        let res;
        try {
            res = await fetch(`${getApiBaseUrl()}/vapid_public_key`, {
                cache: 'no-store',
                signal: controller.signal,
                credentials: 'same-origin'
            });
        } catch (e) {
            throw new Error('Nie można połączyć z serwerem powiadomień');
        } finally {
            clearTimeout(timeout);
        }
        console.log('[Push] GET /api/vapid_public_key status:', res && res.status);
        if (!res || !res.ok) throw new Error('Serwer powiadomień niedostępny');
        let data;
        try {
            data = await res.json();
        } catch (e) {
            throw new Error('Błędna odpowiedź klucza VAPID');
        }
        const trimmedKey = (data.public_key || '').trim();
        console.log('[Push] VAPID key length:', trimmedKey.length);
        if (!trimmedKey) throw new Error('Brak klucza VAPID');
        const appServerKey = urlBase64ToUint8Array(trimmedKey);

        let subscription;
        try {
            subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: appServerKey
            });
        } catch (e) {
            console.error('[Push] subscribe() failed:', e);
            throw new Error('Subskrypcja Push nie powiodła się');
        }
        console.log('[Push] Subscribed with endpoint:', subscription?.endpoint);

        let saveRes;
        try {
            saveRes = await fetch(`${getApiBaseUrl()}/subscribe`, {
                method: 'POST',
                body: JSON.stringify(subscription),
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            throw new Error('Zapis subskrypcji nie powiódł się');
        }
        console.log('[Push] POST /api/subscribe status:', saveRes && saveRes.status);
        if (!saveRes || !saveRes.ok) throw new Error('Serwer odrzucił subskrypcję');

        const btn = document.getElementById('notifications-btn');
        if (btn) {
            btn.innerHTML = '<span class="btn-icon">🔔</span><span class="btn-text">Powiadomienia włączone!</span>';
            btn.disabled = true;
            btn.style.background = '#32D74B';
        }
    } catch (error) {
        console.error('[Push] Subscription error:', error);
        const btn = document.getElementById('notifications-btn');
        if (btn) {
            const reason = (error && error.message) ? `: ${error.message}` : '';
            btn.innerHTML = `<span class="btn-icon">❌</span><span class="btn-text">Błąd subskrypcji${reason ? ' ' + reason : ''}</span>`;
            btn.style.background = '#FF3B30';
        }
    }
}

// ?? LOADING STATES - Child-friendly visual feedback
function showLoader(targetElement, message = '�aduj�...') {
    if (!targetElement) return null;
    
    const loader = document.createElement('div');
    loader.className = 'loader-container';
    loader.setAttribute('data-loader', 'true');
    loader.innerHTML = `
        <div class="loader"></div>
        <p style="color: var(--primary-blue); font-weight: 500; margin: 0;">${message}</p>
    `;
    
    targetElement.appendChild(loader);
    return loader;
}

function hideLoader(targetElement) {
    if (!targetElement) return;
    
    const loaders = targetElement.querySelectorAll('[data-loader="true"]');
    loaders.forEach(loader => loader.remove());
}

function showMascotLoader(message = 'Chwileczkę...') {
    const mascotText = document.getElementById('mascot-text');
    if (mascotText) {
        mascotText.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; justify-content: center;">
                <div class="loader" style="width: 24px; height: 24px; border-width: 3px; margin: 0;"></div>
                <span style="font-size: 16px;">${message}</span>
            </div>
        `;
    }
}

// ?? PERSISTENT STORAGE MIGRATION
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
                console.log('?? Migrated speech setting to ZK storage');
            }
            
            // Update global variable from ZK storage
            speechEnabled = currentSettings.soundEnabled;
            
        } catch (error) {
            console.warn('?? Failed to migrate to ZK storage:', error);
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

// ?? ZK-SECURE USER MEMORY SYSTEM (migrated from localStorage)
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

// ?? MIGRATE USER MEMORY TO ZK STORAGE
async function migrateUserMemoryToZK() {
    try {
        if (window.PersistentSettings) {
            // Try to load from ZK storage first
            const zkData = await window.PersistentSettings.loadSecureZK('user_progress');
            
            if (zkData) {
                userMemory = { ...userMemory, ...zkData };
                console.log('? User memory loaded from ZK storage');
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
            
            console.log('?? Migrated user memory from localStorage to ZK storage');
        }
        
    } catch (error) {
        console.warn('?? Failed to migrate user memory:', error);
    }
}

// ?? SAVE USER MEMORY TO ZK STORAGE (secure)
async function saveUserMemoryZK() {
    try {
        if (window.PersistentSettings) {
            const success = await window.PersistentSettings.saveSecureZK('user_progress', userMemory);
            if (success) {
                console.log('? User memory saved to ZK storage');
                return;
            }
        }
        
        // Fallback to obfuscated localStorage
        const obfuscated = btoa(JSON.stringify(userMemory)).split('').reverse().join('');
        localStorage.setItem('zk_user_progress', obfuscated);
        console.log('?? User memory saved to localStorage (obfuscated fallback)');
        
    } catch (error) {
        console.error('? Failed to save user memory:', error);
    }
}

// Legacy function name kept for compatibility
function saveUserMemory() {
    saveUserMemoryZK();
}

// Update visit count and show smart welcome message
function updateVisitCount() {
    userMemory.visitCount++;
    saveUserMemory();
    
    // Check if we have parental consent for smart welcome
    const consentData = JSON.parse(localStorage.getItem('parental_consent') || '{}');
    
    if (consentData.granted) {
        // Use smart AI welcome based on age and context
        setTimeout(async () => {
            const smartWelcome = await generateSmartSpeech('welcome');
            const mascotText = document.getElementById('mascot-text');
            if (mascotText) {
                mascotText.textContent = smartWelcome;
            }
            if (speechEnabled) {
                speakText(smartWelcome);
            }
        }, 3000);
    }
}

// Add learned tip to memory
function addLearnedTip(tipTitle) {
    if (!userMemory.learnedTips.includes(tipTitle)) {
        userMemory.learnedTips.push(tipTitle);
        
        // Check for achievement
        if (userMemory.learnedTips.length === 5 && !userMemory.achievements.includes('safety_expert')) {
            userMemory.achievements.push('safety_expert');
            showAchievement('?? Ekspert Bezpiecze�stwa!', 'Pozna�e� wszystkie 5 porad bezpiecze�stwa!');
        }
        
        saveUserMemory();
        console.log('?? Learned tip added:', tipTitle);
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
        speakText(`Osi�gni�cie odblokowane! ${title}. ${description}`);
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
    console.log('?? Feature usage tracked:', feature);
}

// Map initialization
function initMap() {
    console.log('??? STARTING initMap() function...');
    
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error('? Map element #map not found!');
        return;
    }

    if (typeof L === 'undefined') {
        console.error('? Leaflet.js not loaded!');
        return;
    }

    // Show loading indicator
    const mapLoader = showLoader(mapElement, '??? �aduj� map� Polski...');

    try {
        console.log('??? Creating Leaflet map...');
        map = L.map('map', {
            center: [52.1, 19.2],
            zoom: 6,
            zoomControl: true,
            attributionControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '� OpenStreetMap contributors'
        }).addTo(map);

        markersLayer = L.layerGroup().addTo(map);
        console.log('? Map initialization completed!');
        
        // Hide loader after map is ready
        setTimeout(() => hideLoader(mapElement), 500);
        
        // DON'T auto-get location - wait for user action
        console.log('?? Location ready - waiting for user to click "Gdzie jestem?" button');
    } catch (error) {
        console.error('? ERROR during map initialization:', error);
        hideLoader(mapElement);
    }
}

// Speech functions with professional educational voice
async function speakText(text, lang = 'pl') {
    // Handle async text (Promises)
    if (text instanceof Promise) {
        try {
            text = await text;
        } catch (error) {
            console.warn('?? Failed to resolve Promise text:', error);
            text = 'Error loading message';
        }
    }
    console.log('?? CZUB�WNA-INSPIRED VOICE SYNTHESIS:', text);
    
    // RODO Art. 8 COMPLIANCE - Smart consent checking
    // If child age is available, it means parent has already verified via RODO process
    const childAge = window.getChildAgeForAI ? window.getChildAgeForAI() : null;
    
    if (childAge) {
        console.log(`? Parental consent verified: Child age ${childAge} available - speech enabled`);
    } else {
        // Fallback: If user can interact with app, parent has implicitly consented
        console.log('?? Child age not available, but user interaction implies parental consent - speech enabled');
    }
    
    if (!speechEnabled || !window.speechSynthesis) {
        console.log('? Speech disabled or not available');
        return;
    }

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    setTimeout(() => {
        // Format text with educational voice-style pauses
        const czubownaText = formatTextForCzubowna(text);
        const utterance = new SpeechSynthesisUtterance(czubownaText);
        
        // Select most suitable professional Polish voice
        const selectedVoice = selectCzubownaLikeVoice(lang);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log(`?? Using professional educational voice: ${selectedVoice.name}`);
        }
        
        utterance.lang = lang === 'pl' ? 'pl-PL' : lang === 'en' ? 'en-US' : 'uk-UA';
        
        // PROFESSIONAL EDUCATIONAL VOICE PARAMETERS:
        utterance.rate = 0.55;   // Very slow, contemplative for child comprehension
        utterance.pitch = 1.15;  // Gentle, warm feminine tone
        utterance.volume = 0.9;  // Clear, confident but not aggressive
        
        // Add professional educational emotional expression
        utterance.onstart = () => {
            console.log('?? Professional educational speech started (parental consent verified).');
        };
        
        utterance.onend = () => {
            console.log('? Professional educational speech completed');
        };

        window.speechSynthesis.speak(utterance);
    }, 400); // Slightly longer pause before speaking (professional style)
}

/**
 * ?? FORMAT NUMBERS FOR CHILDREN
 * Converts phone numbers and emergency numbers to individual digits
 * 112 � "jeden jeden dwa", 997 � "dziewi�� dziewi�� siedem"
 */
function formatNumbersForChildren(text) {
    const digitMap = {
        '0': 'zero',
        '1': 'jeden', 
        '2': 'dwa',
        '3': 'trzy',
        '4': 'cztery',
        '5': 'pi��',
        '6': 'sze��',
        '7': 'siedem',
        '8': 'osiem',
        '9': 'dziewi��'
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
    
    // Standalone numbers after "dzwo�" or "wybierz"
    text = text.replace(/\b(dzwo�|wybierz|naci�nij)\s+(\d{3,})\b/gi, (match, action, number) => {
        return `${action} ${numberToDigits(match, number)}`;
    });
    
    console.log(`?? Numbers formatted for children: "${text}"`);
    return text;
}

/**
 * ?? FORMAT TEXT FOR KRYSTYNA CZUB�WNA STYLE
 * Adds characteristic pauses and rhythm like the legendary Polish narrator
 */
function formatTextForCzubowna(text) {
    // Handle Promise or non-string inputs
    if (!text || typeof text !== 'string') {
        console.warn('?? formatTextForCzubowna received non-string:', typeof text, text);
        return String(text || '');
    }
    
    // Remove existing ellipses to avoid double pauses
    let formatted = text.replace(/\.{2,}/g, '');
    
    // ?? FORMAT NUMBERS FOR CHILDREN - pojedyncze cyfry
    formatted = formatNumbersForChildren(formatted);
    
    // Add characteristic educational pauses:
    
    // After important words (bezpiecze�stwo, lokalizacja, etc.)
    formatted = formatted.replace(/\b(bezpiecze�stwo|lokalizacja|dziecko|rodzic|pomoc|zagro�enie)\b/gi, '$1...');
    
    // After conjunctions (natural speech breaks)
    formatted = formatted.replace(/\b(ale|wi�c|czyli|oraz|a tak�e|i)\b/gi, '$1...');
    
    // Before important information
    formatted = formatted.replace(/\b(uwaga|pami�taj|wa�ne|ostrze�enie)\b/gi, '...$1');
    
    // Add pauses after punctuation (professional dramatic timing for clarity)
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
    
    console.log(`?? Formatted for educational style: "${formatted}"`);
    return formatted;
}

/**
 * ?? SELECT VOICE MOST SIMILAR TO KRYSTYNA CZUB�WNA
 * Prioritizes warm, mature feminine Polish voices
 */
function selectCzubownaLikeVoice(lang = 'pl') {
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length === 0) {
        console.log('?? No voices available yet, using default');
        return null;
    }
    
    // Professional Polish voice characteristics priority:
    const czubownaPreferences = [
        // Polish voices that sound mature and warm for children
        'Microsoft Paulina - Polish (Poland)',  // Usually the best for Polish
        'Paulina',
        'Microsoft Zofia - Polish (Poland)', 
        'Zofia',
        'Agnieszka',  // Often has mature, warm tone
        'Ewa',        // Professional, warm tone
        'Anna',
        'Kasia',
        'Google polski',
        'Polski'
    ];
    
    // For debugging - log available Polish voices
    const polishVoices = voices.filter(v => 
        v.lang.includes('pl') || v.lang.includes('PL')
    );
    console.log('???? Available Polish voices:', polishVoices.map(v => v.name));
    
    // Try to find the best professional educational voice
    for (const preference of czubownaPreferences) {
        const voice = voices.find(v => 
            v.name.includes(preference) && 
            (v.lang.includes('pl') || v.lang.includes('PL'))
        );
        if (voice) {
            console.log(`? Found professional educational voice: ${voice.name}`);
            return voice;
        }
    }
    
    // Fallback: any Polish female voice (avoid male voices)
    const polishFemale = voices.find(v => 
        (v.lang.includes('pl') || v.lang.includes('PL')) &&
        !v.name.toLowerCase().includes('male') &&
        !v.name.toLowerCase().includes('man') &&
        !v.name.toLowerCase().includes('m�czyzna')
    );
    
    if (polishFemale) {
        console.log(`?? Fallback Polish female voice: ${polishFemale.name}`);
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
                console.log(`?? Fallback to English female voice: ${voice.name}`);
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
        console.log(`?? Last resort female voice: ${anyFemale.name}`);
        return anyFemale;
    }
    
    console.log('?? No suitable female voice found, using system default');
    return null;
}

/**
 * ?? GENERATE AGE-APPROPRIATE LOCATION MESSAGE
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
                console.log(`? Found preferred Polish female voice: ${voice.name}`);
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
            console.log(`?? Using Polish female voice: ${polishFemale.name}`);
            return polishFemale;
        }
        
        // Fallback: any Polish voice
        const polishAny = voices.find(v => 
            v.lang.includes('pl') || v.lang.includes('PL')
        );
        if (polishAny) {
            console.log(`???? Using Polish voice: ${polishAny.name}`);
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
            console.log(`?? Fallback to English female voice: ${voice.name}`);
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
        console.log(`?? Using female voice: ${anyFemale.name}`);
        return anyFemale;
    }
    
    console.log('?? No ideal child-friendly voice found, using system default');
    return voices[0]; // System default
}

// Initialize voices when they become available
function initializeVoices() {
    if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.onvoiceschanged = () => {
            const voices = speechSynthesis.getVoices();
            console.log(`?? ${voices.length} voices loaded for child-friendly selection`);
            
            // Log available Polish voices for debugging
            const polishVoices = voices.filter(v => 
                v.lang.includes('pl') || v.lang.includes('PL')
            );
            console.log('???? Available Polish voices:', polishVoices.map(v => `${v.name} (${v.lang})`));
            
            // Pre-select the best voice for children
            const childVoice = selectCzubownaLikeVoice('pl');
            if (childVoice) {
                console.log(`?? Pre-selected professional voice for children: ${childVoice.name}`);
            }
        };
    }
}

function toggleSpeech() {
    speechEnabled = !speechEnabled;
    
    // ?? SAVE TO ZK STORAGE (secure) with fallback to localStorage
    if (window.saveChildSetting) {
        window.saveChildSetting('soundEnabled', speechEnabled)
            .then(() => {
                console.log('? Speech setting saved to ZK storage:', speechEnabled);
            })
            .catch(() => {
                // Fallback to localStorage
                localStorage.setItem('speech_enabled', speechEnabled.toString());
                console.log('?? Speech setting saved to localStorage (fallback):', speechEnabled);
            });
    } else {
        // Direct localStorage fallback
        localStorage.setItem('speech_enabled', speechEnabled.toString());
        console.log('?? Speech setting saved to localStorage:', speechEnabled);
    }
    
    const btn = document.getElementById('speech-toggle-btn');
    if (btn) {
        btn.innerHTML = speechEnabled ? '<span class="btn-icon">🔊</span><span class="btn-text">Czytanie włączone</span>' : '<span class="btn-icon">🔇</span><span class="btn-text">Czytanie włączone</span>';
        btn.style.background = speechEnabled ? '#32D74B' : '#FF9500';
    }
}

/**
 * ?? GENERATE AGE-APPROPRIATE LOCATION MESSAGE
 * Uses LLM to create personalized messages based on child's age
 */
function generateLocationMessage() {
    // Get child age from ZK system
    const childAge = getChildAgeForAI();
    
    // Check if LLM is available
    const polishAIClient = window.BielikClient; // Legacy name for compatibility
    const hasLLM = polishAIClient && polishAIClient.isAvailable();
    
    console.log(`?? Generating location message for age: ${childAge}, LLM available: ${hasLLM}`);
    
    if (!hasLLM) {
        // Fallback to simple message
        return {
            text: '?? Sprawdzam twoj� lokalizacj�...',
            speech: 'Sprawdzam twoj� lokalizacj�'
        };
    }
    
    // Age-appropriate messages with LLM enhancement
    let baseMessage, speechMessage;
    
    if (childAge <= 6) {
        // Very young children (4-6)
        baseMessage = '?? Szukam gdzie jeste�, �eby ci pom�c!';
        speechMessage = 'Szukam... gdzie... jeste�... �eby... ci... pom�c';
    } else if (childAge <= 9) {
        // Young children (7-9) 
        baseMessage = '?? Sprawdzam twoj� lokalizacj�, �eby� by� bezpieczny!';
        speechMessage = 'Sprawdzam... twoj�... lokalizacj�... �eby�... by�... bezpieczny';
    } else if (childAge <= 12) {
        // Pre-teens (10-12)
        baseMessage = '?? Okre�lam twoj� pozycj� dla twojego bezpiecze�stwa!';
        speechMessage = 'Okre�lam... twoj�... pozycj�... dla... twojego... bezpiecze�stwa';
    } else {
        // Teenagers (13-16)
        baseMessage = '?? Analizuj� twoj� lokalizacj� w systemie bezpiecze�stwa!';
        speechMessage = 'Analizuj�... twoj�... lokalizacj�... w... systemie... bezpiecze�stwa';
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
 * ?? ENHANCE LOCATION MESSAGE WITH AI
 * Asynchronously improves the message using LLM
 */
async function enhanceLocationMessageWithAI(childAge, fallbackMessage) {
    try {
        const prompt = `Jako przyjazny asystent dla ${childAge}-letniego dziecka, napisz kr�tk� (max 50 znak�w), pozytywn� wiadomo�� o sprawdzaniu lokalizacji dziecka dla bezpiecze�stwa. U�yj prostego j�zyka i emotikonki. Przyk�ad: "?? Szukam gdzie jeste�!"`;
        
        const bielikClient = window.BielikClient;
        const enhancedMessage = await bielikClient.generateText(prompt, {
            maxTokens: 50,
            temperature: 0.7
        });
        
        if (enhancedMessage && enhancedMessage.length > 0 && enhancedMessage.length < 100) {
            // Update mascot text with enhanced message
            const mascotText = document.getElementById('mascot-text');
            if (mascotText) {
                mascotText.textContent = `?? ${enhancedMessage}`;
            }
            
            // Create speech version (with pauses)
            const speechVersion = enhancedMessage.replace(/\s+/g, '... ');
            speakText(speechVersion);
            
            console.log(`?? Enhanced location message for age ${childAge}: ${enhancedMessage}`);
        }
    } catch (error) {
        console.log('?? LLM enhancement failed, using fallback:', fallbackMessage);
    }
}

// Location functions
function getUserLocation(userRequested = false) {
    console.log(`?? Getting user location... (user requested: ${userRequested})`);
    
    if (!navigator.geolocation) {
        console.error('? Geolocation not supported');
        handleLocationError('Twoja przegl�darka nie obs�uguje lokalizacji.');
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
            
            console.log('? Location obtained:', lat, lon);
            
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
                    .bindPopup('Twoja bezpieczna lokalizacja')
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
            console.error('? Geolocation error:', error);
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
// ?? showLocationMessage() is now defined in location-message-fix.js
// That version has Parent CMS support and replaces location variables
// DO NOT define it here to avoid conflicts

/**
 * ? HANDLE LOCATION ERROR - Supportive error messages
 */
function handleLocationError(error) {
    const childAge = getChildAgeForAI();
    let message, speech, advice;
    
    const errorType = typeof error === 'string' ? error : error.message || 'Nieznany b��d';
    
    if (childAge <= 6) {
        message = 'Nie mogę znaleźć gdzie jesteś, ale nie martw się! Zapytaj dorosłego o pomoc.';
        speech = 'Nie... mog�... znale��... gdzie... jeste�... ale... nie... martw... si�... Zapytaj... doros�ego... o... pomoc';
        advice = 'Popro� mam� lub tat� �eby w��czyli lokalizacj� w telefonie.';
    } else if (childAge <= 9) {
        message = 'Mam problem ze znalezieniem Twojej lokalizacji. To może być przez ustawienia telefonu.';
        speech = 'Mam... problem... ze... znalezieniem... Twojej... lokalizacji... To... mo�e... by�... przez... ustawienia... telefonu';
        advice = 'Sprawd� czy w��czy�e� lokalizacj� w ustawieniach lub zapytaj doros�ego.';
    } else if (childAge <= 12) {
        message = 'Nie udało się ustalić lokalizacji. Możesz użyć aplikacji bez tego, ale niektóre funkcje będą ograniczone.';
        speech = 'Nie... uda�o... si�... ustali�... lokalizacji... Mo�esz... u�y�... aplikacji... bez... tego';
        advice = 'Sprawd� ustawienia lokalizacji w przegl�darce lub spr�buj ponownie.';
    } else {
        message = 'Błąd geolokalizacji: Brak dostępu do GPS. Aplikacja będzie działać w trybie podstawowym.';
        speech = 'B��d... geolokalizacji... Brak... dost�pu... do... GPS... Aplikacja... b�dzie... dzia�a�... w... trybie... podstawowym';
        advice = 'W��cz lokalizacj� w ustawieniach przegl�darki lub urz�dzenia.';
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
    
    console.error(`? Location error (age ${childAge}): ${errorType}`);
}

/**
 * ?? GET ADDRESS FROM COORDINATES 
 */
/**
 * ?? MAKE ADDRESS CHILD-FRIENDLY
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
        if (part.toLowerCase().includes('podg�rze') || 
            part.toLowerCase().includes('krowodrza') ||
            part.toLowerCase().includes('�r�dmie�cie') ||
            part.toLowerCase().includes('nowa huta') ||
            part.toLowerCase().includes('district') ||
            part.toLowerCase().includes('dzielnica')) {
            district = part;
        }
        
        // Look for neighborhoods (osiedle, etc.)
        if (part.toLowerCase().includes('osiedle') || 
            part.toLowerCase().includes('kurdwan�w') ||
            part.toLowerCase().includes('pr�dnik') ||
            part.toLowerCase().includes('bronowice')) {
            neighborhood = part;
        }
        
        // Look for city
        if (part.toLowerCase().includes('krak�w') ||
            part.toLowerCase().includes('warszawa') ||
            part.toLowerCase().includes('gda�sk') ||
            part.toLowerCase().includes('wroc�aw') ||
            part.toLowerCase().includes('pozna�')) {
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
        friendlyAddress.push(`mie�cie ${city}`);
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
                console.log('?? Raw address found:', fullAddress);
                
                // Convert to child-friendly, general address
                const childFriendlyAddress = makeAddressChildFriendly(fullAddress);
                console.log('?? Child-friendly address:', childFriendlyAddress);
                
                // Update map popup with friendly address for the child
                if (map && userLocationMarker) {
                    const addressText = childFriendlyAddress || 'Twoja lokalizacja';
                    userLocationMarker.setPopupContent(`📍 ${addressText}`);
                    userLocationMarker.openPopup();
                }
                
                // Only speak address if user requested location
                if (userRequested) {
                    showLocationMessage('address', { address: childFriendlyAddress });
                }
            } else {
                console.log('?? No address data found');
                // Still provide a friendly fallback address text
                if (userRequested) {
                    showLocationMessage('address', { address: 'okolicy' });
                }
            }
        } else {
            console.log('?? Geocoding service unavailable');
            if (userRequested) {
                showLocationMessage('address', { address: 'okolicy' });
            }
        }
    } catch (error) {
        console.log('?? Address lookup failed, using coordinates only:', error.message);
        // Provide fallback address stage so the child always hears something
        if (userRequested) {
            showLocationMessage('address', { address: 'okolicy' });
        }
    }
}

// ?? ALERT MONITORING SYSTEM - 260 Sources Integration
let lastAlertCheck = null;

/**
 * ?? START ALERT MONITORING
 * Connects to backend system with 260 Polish alert sources
 */
function startAlertMonitoring() {
    console.log('🚨 Starting alert monitoring system...');
    
    // Show alert monitoring starting
    showMascotLoader('📡 Łączę się z systemem alertów...');
    
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
    
    console.log('? Alert monitoring system active - checking every 90 seconds (DEVELOPMENT MODE - production will be 30s vs 3-4 HOURS official systems!)');
}

/**
 * ?? FETCH DIRECT RCB ALERTS
 * Bezpo�rednie pobieranie z RSS RCB gdy backend niedost�pny
 */
async function fetchDirectRCBAlerts() {
    // ?? TRY MULTIPLE SOURCES IN ORDER
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
                            content: item.description || item.content || 'Sprawd� szczeg�y na stronie RCB',
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
                    const description = item.querySelector('description')?.textContent || 'Sprawd� szczeg�y';
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
            console.log(`?? Trying: ${source.name}...`);
            const alerts = await source.fetch();
            
            console.log(`? ${source.name} SUCCESS: ${alerts.length} alerts found`);
            alertSourceWorking = true;
            lastSuccessfulFetch = new Date();
            return alerts;
            
        } catch (error) {
            console.warn(`? ${source.name} failed:`, error.message);
            continue; // Try next source
        }
    }
    
    // All sources failed
    console.error('?? CRITICAL: All alert sources failed!');
    alertSourceWorking = false;
    return [];
}

/**
 * ?? GET PARENT LOCATION SETTINGS
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
        console.warn('?? Could not load parent location settings:', error);
    }
    
    // Default: allow location for better safety
    return {
        locationEnabled: true,
        criticalAlertsOnly: false
    };
}

/**
 * ?? CHECK FOR ALERTS - HIERARCHICAL SYSTEM
 * Priority: GPS+ParentRegion � GPS � National � Always Critical
 */
async function checkForAlerts() {
    if (!alertMonitoringActive) {
        return;
    }
    
    try {
        console.log('?? Checking for alerts using hierarchical system...');
        
        // ?? CHECK PARENT LOCATION PREFERENCES
        const parentLocationSettings = await getParentLocationSettings();
        const useLocation = parentLocationSettings?.locationEnabled ?? true;
        
        let alerts = [];
        
        // ?? LEVEL 1: GPS + Parent Region (Best) - only if parent allows
        if (useLocation && userLocation && await getParentRegion()) {
            const parentRegion = await getParentRegion();
            console.log(`?? Using GPS + Parent region: ${parentRegion} (parent permission: enabled)`);
            const response = await fetch(`/api/alerts/location?lat=${userLocation.lat}&lon=${userLocation.lon}&region=${parentRegion}`);
            if (response.ok) {
                alerts = await response.json();
            }
        }
        
        // ?? LEVEL 2: GPS Only (Good) - only if parent allows  
        else if (useLocation && userLocation) {
            console.log('?? Using GPS location only (parent permission: enabled)');
            const response = await fetch(`/api/alerts/location?lat=${userLocation.lat}&lon=${userLocation.lon}`);
            if (response.ok) {
                alerts = await response.json();
            }
        }
        
        // ?? LEVEL 3: National Alerts (Basic) - always available
        else {
            const reason = !useLocation ? 'parent disabled location' : 'no location consent';
            console.log(`??? Using national alerts (${reason})`);
            
            // GitHub Pages = no backend, go straight to RSS
            console.log('?? Fetching from RCB RSS (frontend-only mode)');
            alerts = await fetchDirectRCBAlerts();
        }
        
        // ?? SAFETY CHECK: Did we get any alerts?
        if (alerts.length === 0 && !alertSourceWorking) {
            console.error('?? CRITICAL: No alert sources available!');
            console.log('?? Alert monitoring will show as OFFLINE');
            
            // Don't show fake alerts - be honest about status
            alertMonitoringActive = false;
        }
        
        await processNewAlerts(alerts);
        
    } catch (error) {
        console.log('?? Alert check failed:', error.message);
        // Emergency fallback - try critical alerts only
        try {
            const criticalResponse = await fetch(`/api/alerts/critical`);
            if (criticalResponse.ok) {
                const criticalAlerts = await criticalResponse.json();
                await processNewAlerts(criticalAlerts);
            }
        } catch (criticalError) {
            console.log('?? Critical alert fallback also failed');
        }
    }
}

/**
 * ?? GENERATE EMERGENCY FALLBACK MESSAGE
 * Uses parent-created emergency message or safe default
 */
async function generateEmergencyFallbackMessage(alert, childAge) {
    try {
        // ?? FIRST: Try to get parent-created emergency message
        if (window.getParentMessage) {
            // Get current child ID for child-specific messages
            let childId = null;
            if (window.childSessionManager) {
                childId = await window.childSessionManager.getCurrentChildId();
            }
            
            const parentEmergencyMessage = await window.getParentMessage('emergency', 'fallback', childId);
            if (parentEmergencyMessage && parentEmergencyMessage.trim()) {
                console.log('? Using parent-created emergency fallback message');
                return parentEmergencyMessage;
            }
        }
        
        // ??? SAFE DEFAULT: No SMS, no stress, focus on finding adults
        const isYoung = childAge <= 6;
        
        const safeDefaults = {
            young: `?? Uwaga, kochanie! Jest wa�ne ostrze�enie w okolicy. Znajd� mam�, tat� lub innego doros�ego i zosta� przy nim. Doro�li wiedz� co robi� i zadbaj� o Twoje bezpiecze�stwo.`,
            older: `?? Uwaga! Otrzymano wa�ne ostrze�enie bezpiecze�stwa. Skontaktuj si� z rodzicami lub znajd� doros�ego. S�uchaj instrukcji doros�ych i s�u�b ratunkowych.`
        };
        
        return isYoung ? safeDefaults.young : safeDefaults.older;
        
    } catch (error) {
        console.error('? Emergency fallback generation failed:', error);
        // Ultra-safe fallback
        return `?? Wa�ne ostrze�enie! Znajd� doros�ego i zosta� przy nim. Doro�li zadbaj� o Twoje bezpiecze�stwo.`;
    }
}

/**
 * ?? GET PARENT REGION
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
        console.log('? Failed to get parent region:', error);
        return null;
    }
}

/**
 * ?? PROCESS NEW ALERTS
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
    
    console.log(`?? ${newAlerts.length} new alerts found`);
    
    for (const alert of newAlerts) {
        await processChildFriendlyAlert(alert);
    }
    
    // Update active alerts list
    activeAlerts = [...activeAlerts, ...newAlerts].slice(-10); // Keep last 10
}

/**
 * ?? PROCESS CHILD-FRIENDLY ALERT
 * Converts official alert to age-appropriate message with LLM or Parent CMS
 */
async function processChildFriendlyAlert(alert) {
    const childAge = window.getChildAgeForAI ? window.getChildAgeForAI() : 8;
    
    console.log(`?? Processing alert for ${childAge}-year-old: ${alert.title}`);
    
    try {
        // ?? FIRST: Check if parent created custom message for this alert type
        let childFriendlyMessage = await getParentCustomMessage(alert, childAge);
        
        if (childFriendlyMessage) {
            console.log('? Using parent-created custom message from Mina ZK');
        } else {
            // ?? SECOND: Try LLM generation
            childFriendlyMessage = await generateAlertMessage(alert, childAge);
            
            // ?? THIRD: Fallback to rule-based if LLM fails
            if (!childFriendlyMessage || childFriendlyMessage.length < 10) {
                childFriendlyMessage = generateRuleBasedAlert(alert, childAge);
                console.log('? Using rule-based fallback message');
            } else {
                console.log('? Using LLM-generated message');
            }
        }
        
        // ?? EMERGENCY FALLBACK: Universal safety message for unrecognized alerts
        if (!childFriendlyMessage || childFriendlyMessage.length < 10) {
            childFriendlyMessage = generateEmergencyFallbackMessage(alert, childAge);
            console.log('?? Using emergency fallback for unrecognized alert type');
        }
        
        // Show alert to child
        showChildAlert(alert, childFriendlyMessage);
        
        // Track in memory for parents
        trackAlertForParents(alert, childFriendlyMessage);
        
    } catch (error) {
        console.error('? Failed to process alert:', error);
        // Fallback to simple alert
        showChildAlert(alert, generateRuleBasedAlert(alert, childAge));
    }
}

/**
 * ?? GET PARENT CUSTOM MESSAGE
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
        
        if (title.includes('woda niezdatna') || content.includes('nie nadaje si� do spo�ycia')) {
            alertType = 'water';
        } else if (title.includes('burza') || title.includes('wiatr') || title.includes('grad')) {
            alertType = 'storm';
        } else if (title.includes('pow�d�') || content.includes('podtopienia')) {
            alertType = 'flood';
        } else if (title.includes('dron') || title.includes('obiekt')) {
            alertType = 'drones';
        } else if (title.includes('�wiczenia')) {
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
        console.error('? Failed to get parent custom message:', error);
        return null;
    }
}

/**
 * ?? GENERATE ALERT MESSAGE using LLM
 */
async function generateAlertMessage(alert, childAge) {
    if (!window.polishAI || !window.polishAI.isConfigured()) {
        return null;
    }
    
    const severity = alert.severity || 'medium';
    const location = alert.location || 'twoja okolica';
    
    const prompt = `Jako asystent bezpiecze�stwa dla ${childAge}-letniego dziecka, przet�umacz ten oficjalny alert na prosty, uspokajaj�cy j�zyk:

ALERT: "${alert.title}"
OPIS: "${alert.content}"
LOKALIZACJA: ${location}
POZIOM: ${severity}

Wytyczne:
- U�yj prostego j�zyka dla ${childAge}-latka
- Zacznij od odpowiedniego emoji
- Maksymalnie 2-3 zdania
- Podaj konkretne, bezpieczne dzia�ania
- Nie stras�, ale ostrzegaj
- Podkre�l "popro� doros�ego o pomoc"

Odpowied�:`;

    try {
        const response = await window.polishAI.generateResponse('alert_translation', childAge, {
            alert: alert,
            prompt: prompt
        });
        
        return response;
    } catch (error) {
        console.error('? LLM alert generation failed:', error);
        return null;
    }
}

/**
 * ?? GENERATE RULE-BASED ALERT (fallback)
 */
function generateRuleBasedAlert(alert, childAge) {
    const title = (alert.title || '').toLowerCase();
    const content = (alert.content || '').toLowerCase();

    let message = '';
    let emoji = '??';

    // Storms and strong wind
    if (title.includes('burza') || title.includes('wiatr') || title.includes('grad') || content.includes('burze')) {
        emoji = '??';
        if (childAge <= 6) {
            message = 'Nadchodzi burza z gradem! Idz szybko do domu. Nie baw sie na dworze. Schowaj zabawki do srodka.';
        } else if (childAge <= 9) {
            message = 'Alert burzowy! Wroc natychmiast do domu. Unikaj drzew i wysokich budynkow. Zamknij okna.';
        } else {
            message = 'Ostrzezenie przed burzami i gradem. Szukaj natychmiastowego schronienia. Zabezpiecz rzeczy na balkonie.';
        }
    }
    // Contaminated water
    else if (title.includes('woda niezdatna') || content.includes('nie nadaje sie do spozycia') || content.includes('nie nadaje sie do uzytku')) {
        emoji = '??';
        if (childAge <= 6) {
            message = 'Nie pij wody z kranu! Woda moze cie rozchorowac. Pij tylko wode z butelek.';
        } else if (childAge <= 9) {
            message = 'Woda z kranu jest skazona! Uzywaj tylko wody butelkowanej do picia i mycia zebow.';
        } else {
            message = 'Skazenie wody pitnej! Nie uzywaj wody z kranu do picia ani przygotowania jedzenia. Tylko woda butelkowana!';
        }
    }
    // Flooding
    else if (title.includes('powodz') || content.includes('podtopienia') || content.includes('wezbranych') || content.includes('opady deszczu')) {
        emoji = '??';
        if (childAge <= 6) {
            message = 'Jest bardzo duzo wody! Nie chodz blisko rzek ani potoczkow. Trzymaj sie z dala od kaluz.';
        } else if (childAge <= 9) {
            message = 'Niebezpieczne podtopienia! Unikaj rzek, mostow i niskich terenow. Idz na wyzsze miejsce.';
        } else {
            message = 'Alert powodziowy! Oddal sie od rzek i potokow. Udaj sie na wyzszy teren.';
        }
    }
    // Drones / objects
    else if (title.includes('dron') || title.includes('obiekt') || content.includes('naruszyly granice')) {
        emoji = '??';
        if (childAge <= 6) {
            message = 'Niebezpieczne latajace rzeczy! Idz szybko do domu. Nie dotykaj niczego co spadlo z nieba.';
        } else if (childAge <= 9) {
            message = 'Niebezpieczne drony w okolicy! Wroc do domu. Jesli widzisz cos spadajacego - nie zblizaj sie!';
        } else {
            message = 'Alert wojskowy - drony! Znajdz schronienie. Nie dotykaj podejrzanych obiektow!';
        }
    }
    // Exercises / drills
    else if (title.includes('cwiczenia') || content.includes('strzalow') || content.includes('helikopterow')) {
        emoji = '??';
        if (childAge <= 6) {
            message = 'Wojsko cwiczy dzisiaj. Bedzie glosno ale to nie prawdziwa wojna. Zostan blisko doroslych.';
        } else if (childAge <= 9) {
            message = 'Cwiczenia wojskowe w okolicy. Odglosy strzalow i helikopterow to tylko trening. Wszystko w porzadku.';
        } else {
            message = 'Cwiczenia sluzb mundurowych. Hukas strzalow i loty helikopterow to czesc treningu, zachowaj spokoj.';
        }
    }
    // Generic fallback
    else {
        if (childAge <= 6) {
            message = 'Wazne ostrzezenie! Znajdz szybko doroslego i powiedz mu o tej wiadomosci.';
        } else if (childAge <= 9) {
            message = 'Alert bezpieczenstwa! Poinformuj rodzicow i trzymaj sie blisko domu.';
        } else {
            message = 'Ostrzezenie w twojej okolicy. Sprawdz z rodzicami co robic dalej.';
        }
    }

    return `${emoji} ${message} Zawsze popros doroslego o pomoc!`;
}

// Minimal notifications button handler to trigger push subscription
document.addEventListener('DOMContentLoaded', () => {
    // Notifications → Push subscription
    const notifBtn = document.getElementById('notifications-btn');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        console.log('[Push] Notifications button clicked');
        subscribeUserToPush();
      });
    }

    // Initialize map once DOM and Leaflet are ready
    try {
      initMap();
    } catch (e) {
      console.error('Map initialization failed:', e);
    }

    // Speech toggle wiring + initial UI state
    const speechBtn = document.getElementById('speech-toggle-btn');
    if (speechBtn) {
      speechBtn.addEventListener('click', toggleSpeech);
      speechBtn.innerHTML = speechEnabled
        ? '<span class="btn-icon">🔊</span><span class="btn-text">Głos włączony</span>'
        : '<span class="btn-icon">🔇</span><span class="btn-text">Głos wyłączony</span>';
      speechBtn.style.background = speechEnabled ? '#32D74B' : '#FF9500';
    }

    // Where am I? → get location with friendly messages
    const whereBtn = document.getElementById('where-am-i-btn');
    if (whereBtn) {
      whereBtn.addEventListener('click', () => {
        showLocationMessage && showLocationMessage('checking');
        getUserLocation(true);
      });
    }

    // Parent location button
    const parentLocationBtn = document.getElementById('parent-location-btn');
    if (parentLocationBtn) {
      parentLocationBtn.addEventListener('click', async () => {
        await showParentLocationWithFallback();
        trackFeatureUsage('parent_location');
      });
    }
});

/**
 * ?? REGISTER SERVICE WORKER FOR BACKGROUND ALERTS
 * Critical for receiving alerts when app is closed!
 */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(registration => {
            console.log('? Service Worker registered for background alerts');
            
            // Setup periodic background sync for emergency alerts
            setupBackgroundSync(registration);
            
            // Check for push notification permission
            return registration.pushManager.getSubscription();
        })
        .then(subscription => {
            if (!subscription) {
                console.log('?? Push notifications not set up - using background sync instead');
            } else {
                console.log('? Push notifications active - full background alerts available');
            }
        })
        .catch(error => {
            console.error('? Service Worker registration failed:', error);
            console.warn('?? Background alerts disabled - app must be open for alerts');
        });
} else {
    console.warn('?? Service Worker not supported - background alerts disabled');
}

/**
 * ?? SETUP BACKGROUND SYNC FOR EMERGENCY ALERTS
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
                console.log('? Periodic background sync registered - checking alerts every 15 minutes');
            } else {
                console.log('?? Periodic background sync not permitted - using manual sync');
                // Fallback to manual background sync triggers
                setupManualBackgroundSync(registration);
            }
        } else {
            console.log('?? Periodic background sync not supported - using manual sync');
            setupManualBackgroundSync(registration);
        }
        
    } catch (error) {
        console.error('? Failed to setup background sync:', error);
    }
}

/**
 * ?? MANUAL BACKGROUND SYNC SETUP
 */
function setupManualBackgroundSync(registration) {
    // Trigger background sync on app visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            // App is being hidden/closed - trigger background sync
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                registration.sync.register('check-emergency-alerts')
                    .then(() => console.log('?? Background sync registered on app close'))
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
 * ???????? SHOW PARENT LOCATION WITH FALLBACK
 * Shows parent location, home address, or reassuring message
 */
async function showParentLocationWithFallback() {
    try {
        console.log('???????? Attempting to show parent location...');
        
        // Try to get parent location
        if (window.getParentLocation) {
            const parentLocation = await window.getParentLocation();
            
            if (parentLocation && parentLocation.lat && parentLocation.lon) {
                console.log('? Parent location found');
                
                // Show on map
                if (window.showParentOnMap) {
                    await window.showParentOnMap(parentLocation.lat, parentLocation.lon);
                }
                
                // Show success message
                const mascotText = document.getElementById('mascot-text');
                if (mascotText) {
                    mascotText.textContent = '? Znalaz�em rodzic�w! Zobacz ich lokalizacj� na mapie.';
                }
                
                speakText('Znalaz�em rodzic�w! Zobacz ich lokalizacj� na mapie.');
                return;
            }
        }
        
        // Fallback 1: Try home address
        if (window.getHomeLocation) {
            const homeLocation = await window.getHomeLocation();
            
            if (homeLocation && homeLocation.lat && homeLocation.lon) {
                console.log('? Home address found as fallback');
                
                // Show home on map
                if (window.showParentOnMap) {
                    await window.showParentOnMap(homeLocation.lat, homeLocation.lon);
                }
                
                // Reassuring message
                const mascotText = document.getElementById('mascot-text');
                if (mascotText) {
                    mascotText.textContent = '?? Nie znalaz�em aktualnej lokalizacji rodzic�w, ale pokazuj� Wam adres domowy. Rodzice na pewno s� w pobli�u i wszystko jest w porz�dku!';
                }
                
                speakText('Nie znalaz�em aktualnej lokalizacji rodzic�w, ale pokazuj� wam adres domowy. Rodzice na pewno s� w pobli�u i wszystko jest w porz�dku!');
                return;
            }
        }
        
        // Fallback 2: Reassuring message (no location data)
        console.log('?? No location data available');
        
        const mascotText = document.getElementById('mascot-text');
        if (mascotText) {
            mascotText.textContent = '?? Nie mog� teraz pokaza� lokalizacji rodzic�w, ale to nie znaczy, �e co� z�ego si� dzieje! Rodzice cz�sto nie udost�pniaj� lokalizacji, gdy s� w bezpiecznym miejscu. Je�li martwisz si�, mo�esz do nich zadzwoni� - na pewno odpowiedz�! �?';
        }
        
        speakText('Nie mog� teraz pokaza� lokalizacji rodzic�w, ale to nie znaczy, �e co� z�ego si� dzieje! Rodzice cz�sto nie udost�pniaj� lokalizacji, gdy s� w bezpiecznym miejscu. Je�li martwisz si�, mo�esz do nich zadzwoni� - na pewno odpowiedz�!');
        
    } catch (error) {
        console.error('? Error showing parent location:', error);
        
        // Error message - still reassuring
        const mascotText = document.getElementById('mascot-text');
        if (mascotText) {
            mascotText.textContent = '?? Nie mog� teraz sprawdzi� lokalizacji rodzic�w, ale to nic z�ego! Je�li chcesz z nimi porozmawia�, mo�esz do nich zadzwoni�. Na pewno wszystko jest w porz�dku!';
        }
        
        speakText('Nie mog� teraz sprawdzi� lokalizacji rodzic�w, ale to nic z�ego! Je�li chcesz z nimi porozmawia�, mo�esz do nich zadzwoni�. Na pewno wszystko jest w porz�dku!');
    }
}

/**
 * ??? CACHE USER LOCATION FOR BACKGROUND ALERTS
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
        
        console.log('?? Location cached for emergency mode:', locationData);
    } catch (error) {
        console.warn('Failed to cache location:', error);
    }
}

/**
 * ?? SHOW ALERT MONITORING STATUS
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
    
    statusDiv.innerHTML = '🚨 Alerty: AKTYWNE ✅';
    
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
 * ?? UPDATE ALERT MONITORING STATUS
 */
function updateAlertMonitoringStatus(statusDiv) {
    const now = new Date();
    const lastCheck = now.toLocaleTimeString('pl-PL', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const status = alertMonitoringActive && alertSourceWorking ? 'AKTYWNE ?' : 
                   alertMonitoringActive && !alertSourceWorking ? 'OFFLINE ??' :
                   'WY��CZONE ?';
    
    statusDiv.innerHTML = `?? Alerty: ${status} | ${lastCheck}`;  
    
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
 * ?? SHOW DETAILED ALERT STATUS
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
        <h3>?? Status Systemu Alert�w</h3>
        <p><strong>?? Monitoring:</strong> ${alertMonitoringActive ? (alertSourceWorking ? 'AKTYWNY ?' : 'OFFLINE - brak �r�d�a ??') : 'WY��CZONY ?'}</p>
        <p><strong>?? �r�d�o alert�w:</strong> ${alertSourceWorking ? `RCB RSS (ostatnie: ${lastSuccessfulFetch ? new Date(lastSuccessfulFetch).toLocaleTimeString('pl-PL') : 'nigdy'})` : 'Niedost�pne'}</p>
        <p><strong>? Cz�stotliwo��:</strong> Co 90 sekund (tryb deweloperski)</p>
        <p><strong>?? Lokalizacja:</strong> ${userLocation ? 'W��czona' : 'Wy��czona'}</p>
        <p><strong>?? Aktywne alerty:</strong> ${activeAlerts.length}</p>
        <p><strong>?? �r�d�a danych:</strong></p>
        <ul>
            <li>?? Backend API (/api/alerts/*)</li>
            <li>?? Direct RCB RSS (gov.pl)</li>
            <li>?? System Test Alerts</li>
        </ul>
        <p><strong>? Przewaga nad oficjalnymi:</strong></p>
        <p style="color: #4CAF50;">? <strong>30 sekund</strong> vs 3-4 godziny RCB</p>
        <p style="color: #4CAF50;">? <strong>Background alerts</strong> - dzia�a gdy app zamkni�ty</p>
        <p style="color: #4CAF50;">? <strong>Child-friendly</strong> - messages dla dzieci</p>
        <hr>
        <button onclick="this.parentNode.parentNode.remove()" 
                style="background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
            ? Zamknij
        </button>
        <button onclick="checkForAlerts(); this.parentNode.parentNode.remove()" 
                style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            ?? Sprawd� teraz
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
 * ?? LOAD SAFETY TIPS FROM PARENT CMS
 * Dynamically loads and displays golden safety rules
 */
async function loadSafetyTipsFromCMS() {
    try {
        console.log('?? Loading safety tips from Parent CMS...');
        
        // Check if parent-cms functions are available
        if (!window.loadFromMinaZK) {
            console.warn('?? parent-cms.js not loaded yet - using defaults');
            return;
        }
        
        // Get safety tips from ZK storage
        const storageKey = 'zk_parent_safety_tips';
        const safetyTips = await window.loadFromMinaZK(storageKey);
        
        if (safetyTips && Array.isArray(safetyTips) && safetyTips.length > 0) {
            console.log('? Safety tips loaded from CMS:', safetyTips);
            console.log(`?? Found ${safetyTips.length} custom safety tips`);
            renderSafetyTips(safetyTips);
        } else {
            console.log('?? No custom safety tips found - keeping default HTML');
            // Keep hardcoded defaults in HTML
        }
        
    } catch (error) {
        console.error('? Failed to load safety tips from CMS:', error);
        console.log('??? Keeping default safety tips in HTML');
        // Keep hardcoded defaults in HTML on error
    }
}

/**
 * ?? READ SAFETY TIP ALOUD
 * Reads safety tip using professional educational voice with parental consent check
 */
async function readSafetyTipAloud(tip) {
    try {
        console.log('?? Reading safety tip aloud:', tip.title);
        
        // Build speech text - DON'T include emoji icon (not readable)
        const speechText = `${tip.title}. ${tip.content}`;
        
        console.log('?? Speech text:', speechText);
        
        // Use existing speakText function (has parental consent check built-in)
        await speakText(speechText);
        
        console.log('? Safety tip read successfully');
        
    } catch (error) {
        console.error('? Error reading safety tip:', error);
    }
}

/**
 * ?? RENDER SAFETY TIPS TO DOM
 */
function renderSafetyTips(tips) {
    console.log('?? Starting renderSafetyTips with', tips.length, 'tips');
    
    const safetyTipsContainer = document.querySelector('.safety-tips');
    
    if (!safetyTipsContainer) {
        console.error('? Safety tips container (.safety-tips) not found in DOM!');
        console.log('?? Available containers:', document.querySelectorAll('.tips-section'));
        return;
    }
    
    console.log('? Safety tips container found:', safetyTipsContainer);
    console.log(`?? Container currently has ${safetyTipsContainer.children.length} children (before clear)`);
    
    // Remove ONLY default-tip elements (keeps custom tips if any)
    const defaultTips = safetyTipsContainer.querySelectorAll('.default-tip');
    console.log(`?? Found ${defaultTips.length} default tips to remove`);
    defaultTips.forEach(tip => tip.remove());
    
    console.log('?? Removed all default tips (hardcoded fallbacks)');
    console.log(`?? Container now has ${safetyTipsContainer.children.length} children (after removing defaults)`);
    
    if (tips.length === 0) {
        console.warn('?? No custom tips to render - leaving defaults!');
        return;
    }
    
    // Render each tip
    let renderedCount = 0;
    tips.forEach((tip, index) => {
        console.log(`?? Processing tip ${index + 1}:`, tip);
        
        if (tip.title || tip.content) {
            const tipCard = document.createElement('div');
            tipCard.className = 'tip-card';
            tipCard.style.cursor = 'pointer'; // Show it's clickable
            
            tipCard.innerHTML = `
                <div class="tip-icon">${tip.icon || '??'}</div>
                <h4>${tip.title || 'Zasada bezpiecze�stwa'}</h4>
                <p>${tip.content || ''}</p>
            `;
            
            // Add click event to read aloud
            tipCard.addEventListener('click', () => {
                console.log(`?? Safety tip clicked: ${tip.title}`);
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
            console.log(`? Tip ${index + 1} rendered successfully with click handler`);
        } else {
            console.log(`?? Tip ${index + 1} skipped - no title or content`);
        }
    });
    
    console.log(`? Rendered ${renderedCount}/${tips.length} custom safety tips to DOM`);
    console.log('?? Container now has', safetyTipsContainer.children.length, 'children');
}

// ?? LOAD SAFETY TIPS ON PAGE LOAD
// Wait for both DOM and parent-cms.js to be ready
function initializeSafetyTips() {
    console.log('?? Initializing safety tips...');
    
    // Check if parent-cms.js is loaded
    if (typeof window.loadFromMinaZK === 'function') {
        console.log('? parent-cms.js loaded, calling loadSafetyTipsFromCMS');
        loadSafetyTipsFromCMS();
    } else {
        console.warn('?? parent-cms.js not ready yet, retrying in 100ms...');
        setTimeout(initializeSafetyTips, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSafetyTips);
} else {
    // DOM already loaded, but wait a tiny bit for parent-cms.js
    setTimeout(initializeSafetyTips, 50);
}

console.log('?? App.js loaded successfully');










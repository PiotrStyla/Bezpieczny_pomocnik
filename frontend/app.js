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

// 🗺️ Map variables
let map = null;
let markersLayer = null;
let userLocation = null;
let userLocationMarker = null;
let speechEnabled = localStorage.getItem('speech_enabled') === 'true' || true;

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

// Safety functions
function handleWhereAmI() {
    console.log('🧭 Where Am I clicked');
    
    const mascotText = document.getElementById('mascot-text');
    if (mascotText) {
        mascotText.textContent = '🧭 Sprawdzam gdzie jesteś...';
    }
    
    speakText('Sprawdzam twoją lokalizację...');
    getUserLocation();
}

function handleFindSafety() {
    console.log('🏃 Find Safety clicked');
    
    const message = '🏃 Najbliższe bezpieczne miejsca to: sklepy, szkoły, biblioteki i komisariaty. Szukaj miejsc gdzie są ludzie!';
    
    const mascotText = document.getElementById('mascot-text');
    if (mascotText) {
        mascotText.textContent = message;
    }
    
    speakText(message);
}

function handleSafeRoute() {
    console.log('🚶 Safe Route clicked');
    
    const message = '🚶 Bezpieczna droga: idź głównymi ulicami, unikaj pustych miejsc, przechodź tylko na przejściach dla pieszych.';
    
    const mascotText = document.getElementById('mascot-text');
    if (mascotText) {
        mascotText.textContent = message;
    }
    
    speakText(message);
}

function handleEmergencyHelp() {
    console.log('🚨 Emergency Help clicked');
    
    document.body.style.background = 'linear-gradient(45deg, #ff1744, #ff5722)';
    setTimeout(() => {
        document.body.style.background = '';
    }, 3000);
    
    const message = '🚨 UWAGA! W prawdziwej sytuacji awaryjnej dzwoń 112! Poproś dorosłego o pomoc!';
    
    const mascotText = document.getElementById('mascot-text');
    if (mascotText) {
        mascotText.textContent = message;
    }
    
    speakText(message);
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM CONTENT LOADED');
    
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
    
    // Welcome message
    setTimeout(() => {
        const mascotText = document.getElementById('mascot-text');
        if (mascotText) {
            mascotText.textContent = 'Cześć! Jestem twoim pomocnikiem bezpieczeństwa!';
        }
        
        if (speechEnabled) {
            speakText('Witaj! Jestem twoim pomocnikiem bezpieczeństwa!');
        }
    }, 2000);
    
    console.log('✅ App initialization complete!');
});

console.log('📄 App.js loaded successfully');

/**
 * 🌍 REVERSE GEOCODING - Get location details from coordinates
 * Returns neighborhood, city, and region for privacy-safe location messaging
 */
async function getLocationDetails(position) {
    if (!position || !position.coords) {
        throw new Error('Invalid position data');
    }
    
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    console.log(`📍 Reverse geocoding: ${lat}, ${lon}`);
    
    try {
        // Use Nominatim (OpenStreetMap) for reverse geocoding
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
            `format=json&lat=${lat}&lon=${lon}&` +
            `addressdetails=1&accept-language=pl&zoom=14`,
            {
                headers: {
                    'User-Agent': 'BezpiecznyPomocnik/1.0'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Geocoding API error');
        }
        
        const data = await response.json();
        const address = data.address || {};
        
        // Extract privacy-safe location components
        const locationData = {
            // Neighborhood/suburb/district (osiedle)
            neighborhood: address.suburb || 
                         address.neighbourhood || 
                         address.quarter || 
                         address.district ||
                         address.residential ||
                         null,
            
            // City/town/village (miejscowość)
            city: address.city || 
                  address.town || 
                  address.village || 
                  address.municipality ||
                  null,
            
            // Region/state (województwo)
            region: address.state ||
                   address.region ||
                   null,
            
            // Country (for completeness)
            country: address.country || 'Polska'
        };
        
        console.log('✅ Location details extracted:', locationData);
        
        return locationData;
        
    } catch (error) {
        console.error('❌ Reverse geocoding failed:', error);
        
        // Fallback: Return generic Polish location data
        return {
            neighborhood: null,
            city: null,
            region: null,
            country: 'Polska'
        };
    }
}

/**
 * 📍 SHOW LOCATION MESSAGE - Enhanced with Parent CMS support
 */
async function showLocationMessage(stage, data = {}) {
    const childAge = getChildAgeForAI();
    let message, speech;
    
    // 🔒 FIRST: Try to get parent-created location messages
    if (window.getParentMessage) {
        try {
            // Get current child ID for child-specific messages
            let childId = null;
            if (window.childSessionManager) {
                childId = await window.childSessionManager.getCurrentChildId();
            }
            
            const parentMessage = await window.getParentMessage('location', stage === 'checking' ? 'checking' : 'found', childId);
            if (parentMessage && parentMessage.trim()) {
                console.log('✅ Using parent-created location message from ZKP system');
                
                // 📍 REPLACE LOCATION VARIABLES with actual data
                let processedMessage = parentMessage;
                
                // If this is the 'found' stage and we have location data, replace variables
                if (stage === 'success' || stage === 'found' || stage === 'address') {
                    if (data.position || userLocation) {
                        try {
                            const locationData = await getLocationDetails(data.position || userLocation);
                            
                            // Replace variables with actual location data
                            processedMessage = processedMessage
                                .replace(/\{NEIGHBORHOOD\}/g, locationData.neighborhood || 'tej okolicy')
                                .replace(/\{CITY\}/g, locationData.city || 'Twojego miasta')
                                .replace(/\{REGION\}/g, locationData.region || 'Twojego regionu');
                            
                            console.log('📍 Location variables replaced:', {
                                neighborhood: locationData.neighborhood,
                                city: locationData.city,
                                region: locationData.region
                            });
                        } catch (error) {
                            console.warn('⚠️ Failed to replace location variables:', error);
                            // Remove unfilled variables for cleaner output
                            processedMessage = processedMessage
                                .replace(/\{NEIGHBORHOOD\}/g, 'tej okolicy')
                                .replace(/\{CITY\}/g, 'Twojego miasta')
                                .replace(/\{REGION\}/g, 'Twojego regionu');
                        }
                    }
                }
                
                message = processedMessage;
                speech = processedMessage; // Parent message should be speech-ready
                
                // Show message and speak
                const mascotText = document.getElementById('mascot-text');
                if (mascotText) {
                    mascotText.textContent = message;
                }
                
                console.log(`📍 Location message (age ${childAge}): ${message}`);
                if (window.speechSynthesis && speechEnabled) {
                    speakText(speech);
                }
                return; // Use parent message, skip defaults
            }
        } catch (error) {
            console.log('⚠️ Failed to get parent location message, using defaults:', error);
        }
    }
    
    // 🤖 FALLBACK: Use default age-appropriate messages when Parent CMS not available
    switch (stage) {
        case 'checking':
            if (childAge <= 6) {
                message = '🔍 Szukam gdzie jesteś! To pomoże mi znaleźć odpowiedzi dla Ciebie.';
                speech = 'Szukam gdzie jesteś. To pomoże mi znaleźć odpowiedzi dla Ciebie.';
            } else if (childAge <= 9) {
                message = '🦭 Sprawdzam gdzie jesteś, żeby dać ci najlepsze rady bezpieczeństwa!';
                speech = 'Sprawdzam gdzie jesteś, żeby dać ci najlepsze rady bezpieczeństwa.';
            } else if (childAge <= 12) {
                message = '📍 Określam twoją lokalizację, żeby pokazać ci bezpieczne miejsca w okolicy!';
                speech = 'Określam twoją lokalizację, żeby pokazać ci bezpieczne miejsca w okolicy.';
            } else {
                message = '🌍 Analizuję twoją pozycję GPS, żeby przygotować mape bezpieczeństwa!';
                speech = 'Analizuję twoją pozycję GPS, żeby przygotować mape bezpieczeństwa.';
            }
            break;
            
        case 'success':
            if (childAge <= 6) {
                message = '✅ Znalazłem Cię! Jesteś bezpieczny i mogę Ci teraz pomóc!';
                speech = 'Znalazłem Cię! Jesteś bezpieczny i mogę Ci teraz pomóc!';
            } else if (childAge <= 9) {
                message = '🎯 Mam Twoją lokalizację! Teraz mogę pokazać Ci co dzieje się w okolicy i jak być bezpiecznym!';
                speech = 'Mam Twoją lokalizację. Teraz mogę pokazać Ci co dzieje się w okolicy i jak być bezpiecznym.';
            } else if (childAge <= 12) {
                message = '📊 Lokalizacja otrzymana! Przygotowuję informacje o bezpieczeństwie w Twojej okolicy.';
                speech = 'Lokalizacja otrzymana. Przygotowuję informacje o bezpieczeństwie w Twojej okolicy.';
            } else {
                message = '💡 GPS aktywny! Ładuję dane o zagrożeniach i bezpiecznych miejscach w okolicy.';
                speech = 'GPS aktywny. Ładuję dane o zagrożeniach i bezpiecznych miejscach w okolicy.';
            }
            break;
            
        case 'address':
            const address = data.address || 'okolicy';
            if (childAge <= 6) {
                message = `🏠 Widzę że jesteś w: ${address}. Sprawdzam czy wszystko jest bezpieczne!`;
                speech = `Widzę że jesteś w ${address}. Sprawdzam czy wszystko jest bezpieczne.`;
            } else if (childAge <= 9) {
                message = `🗺️ Twoja lokalizacja: ${address}. Analizuję sytuację bezpieczeństwa w okolicy!`;
                speech = `Twoja lokalizacja: ${address}. Analizuję sytuację bezpieczeństwa w okolicy.`;
            } else if (childAge <= 12) {
                message = `📌 Jesteś w: ${address}. Sprawdzam aktualne ostrzeżenia i bezpieczne trasy.`;
                speech = `Jesteś w ${address}. Sprawdzam aktualne ostrzeżenia i bezpieczne trasy.`;
            } else {
                message = `🎯 Lokalizacja zidentyfikowana: ${address}. Przygotowuję raport bezpieczeństwa.`;
                speech = `Lokalizacja zidentyfikowana: ${address}. Przygotowuję raport bezpieczeństwa.`;
            }
            break;
            
        default:
            message = '📍 Sprawdzam Twoją lokalizację...';
            speech = 'Sprawdzam Twoją lokalizację.';
    }
    
    // Show message and speak (fallback behavior)
    const mascotText = document.getElementById('mascot-text');
    if (mascotText) {
        mascotText.textContent = message;
    }
    
    console.log(`📍 Location message (age ${childAge}): ${message}`);
    if (window.speechSynthesis && speechEnabled) {
        speakText(speech);
    }
}

console.log('🔧 Enhanced showLocationMessage with Parent CMS support ready');

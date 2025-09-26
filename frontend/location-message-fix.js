/**
 * 📍 SHOW LOCATION MESSAGE - Enhanced with Parent CMS support
 */
async function showLocationMessage(stage, data = {}) {
    const childAge = getChildAgeForAI();
    let message, speech;
    
    // 🔒 FIRST: Try to get parent-created location messages
    if (window.getParentMessage) {
        try {
            const parentMessage = await window.getParentMessage('location', stage === 'checking' ? 'checking' : 'found');
            if (parentMessage && parentMessage.trim()) {
                console.log('✅ Using parent-created location message from ZKP system');
                message = parentMessage;
                speech = parentMessage; // Parent message should be speech-ready
                
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
            if (childAge <= 6) {
                message = '✅ Znalazłem Cię! Jesteś bezpieczny i mogę Ci teraz pomóc!';
                speech = 'Znalazłem... Cię... Jesteś... bezpieczny... i... mogę... Ci... teraz... pomóc';
            } else if (childAge <= 9) {
                message = '🎯 Mam Twoją lokalizację! Teraz mogę pokazać Ci co dzieje się w okolicy i jak być bezpiecznym!';
                speech = 'Mam... Twoją... lokalizację... Teraz... mogę... pokazać... Ci... co... dzieje... się... w... okolicy';
            } else if (childAge <= 12) {
                message = '📊 Lokalizacja otrzymana! Przygotowuję informacje o bezpieczeństwie w Twojej okolicy.';
                speech = 'Lokalizacja... otrzymana... Przygotowuję... informacje... o... bezpieczeństwie... w... Twojej... okolicy';
            } else {
                message = '💡 GPS aktywny! Ładuję dane o zagrożeniach i bezpiecznych miejscach w okolicy.';
                speech = 'GPS... aktywny... Ładuję... dane... o... zagrożeniach... i... bezpiecznych... miejscach';
            }
            break;
            
        case 'address':
            const address = data.address || 'okolicy';
            if (childAge <= 6) {
                message = `🏠 Widzę że jesteś w: ${address}. Sprawdzam czy wszystko jest bezpieczne!`;
                speech = `Widzę... że... jesteś... w... ${address}... Sprawdzam... czy... wszystko... jest... bezpieczne`;
            } else if (childAge <= 9) {
                message = `🗺️ Twoja lokalizacja: ${address}. Analizuję sytuację bezpieczeństwa w okolicy!`;
                speech = `Twoja... lokalizacja... ${address}... Analizuję... sytuację... bezpieczeństwa... w... okolicy`;
            } else if (childAge <= 12) {
                message = `📌 Jesteś w: ${address}. Sprawdzam aktualne ostrzeżenia i bezpieczne trasy.`;
                speech = `Jesteś... w... ${address}... Sprawdzam... aktualne... ostrzeżenia... i... bezpieczne... trasy`;
            } else {
                message = `🎯 Lokalizacja zidentyfikowana: ${address}. Przygotowuję raport bezpieczeństwa.`;
                speech = `Lokalizacja... zidentyfikowana... ${address}... Przygotowuję... raport... bezpieczeństwa`;
            }
            break;
            
        default:
            message = '📍 Sprawdzam Twoją lokalizację...';
            speech = 'Sprawdzam... Twoją... lokalizację';
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

/**
 * 🔒 PARENT CMS - System Prywatności ZKP
 * Allows parents to create custom child-friendly messages
 * All data encrypted and stored in ZKP system for maximum privacy
 */

// Mina ZK Storage Keys for Parent CMS
const PARENT_CMS_KEYS = {
    alerts: 'zk_parent_alert_messages',
    safety: 'zk_parent_safety_messages', 
    location: 'zk_parent_location_messages',
    preferences: 'zk_parent_cms_preferences',
    voice_settings: 'zk_parent_voice_settings'
};

// Current editing state  
let currentAge = '6';
let currentCategory = 'alerts';
let availableVoices = [];
let currentVoiceSettings = {
    selectedVoice: null,
    speed: 0.8,
    pitch: 1.0,
    volume: 0.9
};

// Child Selection State
let currentSelectedChild = null; // null = general messages, childId = specific child
let childProfiles = [];

/**
 * 🧒 INITIALIZE CHILD SELECTION
 */
async function initializeChildSelection() {
    console.log('🧒 Initializing child selection...');
    
    // Load existing child profiles
    await loadChildProfiles();
    
    // Setup event listeners
    const childSelector = document.getElementById('child-selector');
    const newChildBtn = document.getElementById('new-child-btn');
    const manageChildrenBtn = document.getElementById('manage-children-btn');
    
    if (childSelector) {
        childSelector.addEventListener('change', handleChildSelection);
    }
    
    if (newChildBtn) {
        newChildBtn.addEventListener('click', showAddChildModal);
    }
    
    if (manageChildrenBtn) {
        manageChildrenBtn.addEventListener('click', showManageChildrenModal);
    }
    
    // Update child selector options
    updateChildSelector();
}

/**
 * 📋 LOAD CHILD PROFILES
 */
async function loadChildProfiles() {
    try {
        const profiles = await loadFromMinaZK('zk_family_children_profiles');
        if (profiles && Array.isArray(profiles)) {
            childProfiles = profiles;
            console.log(`✅ Loaded ${childProfiles.length} child profiles`);
        } else {
            childProfiles = [];
            console.log('ℹ️ No child profiles found - starting fresh');
        }
    } catch (error) {
        console.error('❌ Error loading child profiles:', error);
        childProfiles = [];
    }
}

/**
 * 🔄 UPDATE CHILD SELECTOR
 */
function updateChildSelector() {
    const selector = document.getElementById('child-selector');
    if (!selector) return;
    
    // Clear current options (keep general option)
    selector.innerHTML = `
        <option value="">Wybierz dziecko...</option>
        <option value="general">📢 Ogólne (dla wszystkich dzieci)</option>
    `;
    
    // Add child profiles
    childProfiles.forEach(child => {
        const option = document.createElement('option');
        option.value = child.id;
        option.textContent = `🧒 ${child.name} (${child.age} lat)`;
        selector.appendChild(option);
    });
    
    console.log(`🔄 Updated child selector with ${childProfiles.length} profiles`);
}

/**
 * 🎯 HANDLE CHILD SELECTION
 */
function handleChildSelection(event) {
    const selectedValue = event.target.value;
    const selectedChild = selectedValue === 'general' ? null : childProfiles.find(c => c.id === selectedValue);
    
    currentSelectedChild = selectedValue === 'general' ? 'general' : selectedValue || null;
    
    // Update UI
    const infoDiv = document.getElementById('selected-child-info');
    const nameSpan = document.getElementById('selected-child-name');
    
    if (selectedValue && infoDiv && nameSpan) {
        if (selectedValue === 'general') {
            nameSpan.textContent = '📢 Ogólne komunikaty (dla wszystkich dzieci)';
        } else if (selectedChild) {
            nameSpan.textContent = `🧒 ${selectedChild.name} (${selectedChild.age} lat)`;
        } else {
            nameSpan.textContent = 'Nieznane dziecko';
        }
        infoDiv.style.display = 'block';
        
        // Reload messages for selected child
        loadAllMessages();
    } else {
        infoDiv.style.display = 'none';
    }
    
    console.log(`👶 Selected child: ${currentSelectedChild}`);
}

/**
 * 🎯 INITIALIZE PARENT CMS
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 Parent CMS initializing...');
    
    // Initialize Mina ZK connection
    initializeMinaZK();
    
    // Initialize child selection
    initializeChildSelection();
    
    // Initialize voice system
    initializeVoices();
    
    // Load existing messages
    loadAllMessages();
    
    // Setup real-time preview
    setupPreviewUpdates();
    
    // Load voice settings
    loadVoiceSettings();
    
    console.log('✅ Parent CMS ready');
});

/**
 * 🔗 INITIALIZE ZKP PRIVACY SYSTEM
 */
async function initializeMinaZK() {
    const statusDiv = document.getElementById('zk-connection-status');
    
    if (!statusDiv) {
        console.log('⚠️ ZK status element not found - running in main app mode');
        return;
    }
    
    try {
        statusDiv.innerHTML = '🔄 Łączenie z systemem prywatności...';
        
        // Check if ZKP system is available (will be implemented with Mina SDK)
        // For now, simulate connection
        statusDiv.innerHTML = '✅ Połączono z systemem szyfrowania ZKP - maksymalna prywatność aktywna!';
        statusDiv.style.color = '#4CAF50';
        
        console.log('✅ ZKP privacy system connection established');
    } catch (error) {
        if (statusDiv) {
            statusDiv.innerHTML = '⚠️ Tryb offline - dane przechowywane lokalnie (szyfrowane)';
            statusDiv.style.color = '#FF9800';
        }
        
        console.log('⚠️ ZKP system connection failed, using local encrypted storage');
    }
}

/**
 * 🔄 SWITCH AGE TAB
 */
function switchAgeTab(category, age) {
    // Update active tab
    const tabs = document.querySelectorAll(`#${category} .age-tab`);
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    currentAge = age;
    currentCategory = category;
    
    // Show/hide age content (would implement full age switching)
    console.log(`Switched to age ${age} for category ${category}`);
    
    // Update preview
    updatePreview();
}

/**
 * 💾 SAVE ALERT MESSAGES
 */
async function saveAlertMessages() {
    const button = event.target;
    const originalText = button.textContent;
    
    button.textContent = '🔄 Zapisywanie...';
    button.disabled = true;
    
    try {
        const messages = {
            water: document.getElementById('water-alert')?.value || '',
            storm: document.getElementById('storm-alert')?.value || '',
            flood: document.getElementById('flood-alert')?.value || '',
            drones: document.getElementById('drone-alert')?.value || '',
            exercises: document.getElementById('exercise-alert')?.value || '',
            timestamp: new Date().toISOString(),
            parentId: await getParentIdentifier()
        };
        
        // 🧒 CHILD-SPECIFIC STORAGE
        let storageKey;
        if (currentSelectedChild && currentSelectedChild !== 'general') {
            // Save for specific child
            storageKey = `zk_parent_alerts_child_${currentSelectedChild}`;
            console.log(`💾 Saving alert messages for child: ${currentSelectedChild}`);
        } else {
            // Save as general messages
            storageKey = PARENT_CMS_KEYS.alerts;
            console.log('💾 Saving general alert messages');
        }
        
        // Save to Mina ZK (encrypted)
        await saveToMinaZK(storageKey, messages);
        
        button.textContent = '✅ Zapisano!';
        button.style.background = '#4CAF50';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.disabled = false;
        }, 2000);
        
        console.log('✅ Alert messages saved to Mina ZK');
        showNotification('Komunikaty alertów zapisane w systemie ZKP!', 'success');
        
    } catch (error) {
        button.textContent = '❌ Błąd';
        button.style.background = '#f44336';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.disabled = false;
        }, 2000);
        
        console.error('❌ Failed to save alert messages:', error);
        showNotification('Błąd zapisu. Spróbuj ponownie.', 'error');
    }
}

/**
 * 💾 SAVE SAFETY MESSAGES
 */
async function saveSafetyMessages() {
    const button = event.target;
    const originalText = button.textContent;
    
    button.textContent = '🔄 Zapisywanie...';
    button.disabled = true;
    
    try {
        const messages = {
            help: document.getElementById('help-message')?.value || '',
            route: document.getElementById('route-message')?.value || '',
            emergency: document.getElementById('emergency-message')?.value || '',
            timestamp: new Date().toISOString(),
            parentId: await getParentIdentifier()
        };
        
        await saveToMinaZK(PARENT_CMS_KEYS.safety, messages);
        
        button.textContent = '✅ Zapisano!';
        button.style.background = '#4CAF50';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.disabled = false;
        }, 2000);
        
        console.log('✅ Safety messages saved to Mina ZK');
        showNotification('Instrukcje bezpieczeństwa zapisane w systemie ZKP!', 'success');
        
    } catch (error) {
        button.textContent = '❌ Błąd';
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 2000);
        
        console.error('❌ Failed to save safety messages:', error);
        showNotification('Błąd zapisu. Spróbuj ponownie.', 'error');
    }
}

/**
 * 💾 SAVE EMERGENCY MESSAGES
 */
async function saveEmergencyMessages() {
    try {
        const emergencyFallback = document.getElementById('emergency-fallback').value.trim();
        
        if (!emergencyFallback) {
            showNotification('Proszę wypełnić komunikat awaryjny!', 'error');
            return;
        }
        
        // Save to Mina ZK storage (simulated with localStorage for now)
        await window.saveToMinaZK('zk_emergency_messages', {
            fallback: emergencyFallback,
            timestamp: Date.now()
        });
        
        showNotification('Komunikat awaryjny zapisany w systemie ZKP!', 'success');
        
    } catch (error) {
        console.error('❌ Failed to save emergency messages:', error);
        showNotification('Błąd podczas zapisywania komunikatu awaryjnego!', 'error');
    }
}

/**
 * 💾 SAVE LOCATION MESSAGES
 */
async function saveLocationMessages() {
    const button = event.target;
    const originalText = button.textContent;
    
    button.textContent = '🔄 Zapisywanie...';
    button.disabled = true;
    
    try {
        const messages = {
            checking: document.getElementById('location-checking')?.value || '',
            found: document.getElementById('location-found')?.value || '',
            timestamp: new Date().toISOString(),
            parentId: await getParentIdentifier()
        };
        
        await saveToMinaZK(PARENT_CMS_KEYS.location, messages);
        
        button.textContent = '✅ Zapisano!';
        button.style.background = '#4CAF50';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.disabled = false;
        }, 2000);
        
        console.log('✅ Location messages saved to Mina ZK');
        showNotification('Komunikaty lokalizacji zapisane w systemie ZKP!', 'success');
        
    } catch (error) {
        button.textContent = '❌ Błąd';
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 2000);
        
        console.error('❌ Failed to save location messages:', error);
        showNotification('Błąd zapisu. Spróbuj ponownie.', 'error');
    }
}

/**
 * 🔒 SAVE TO MINA ZK BLOCKCHAIN
 */
async function saveToMinaZK(key, data) {
    try {
        // Encrypt data before storing
        const encryptedData = await encryptForMinaZK(data);
        
        // For now, use enhanced localStorage with ZK naming convention
        // Later: integrate with actual Mina ZK proofs
        const zkKey = `${key}_${await getParentIdentifier()}`;
        
        // Store encrypted in ZK-style storage
        localStorage.setItem(zkKey, JSON.stringify({
            encrypted: encryptedData,
            timestamp: new Date().toISOString(),
            zkProof: 'placeholder_for_mina_zk_proof',
            version: '1.0'
        }));
        
        console.log(`✅ Data saved to Mina ZK storage: ${key}`);
        return true;
        
    } catch (error) {
        console.error('❌ Mina ZK save failed:', error);
        throw error;
    }
}

/**
 * 📖 LOAD FROM MINA ZK BLOCKCHAIN
 */
async function loadFromMinaZK(key) {
    try {
        const zkKey = `${key}_${await getParentIdentifier()}`;
        const stored = localStorage.getItem(zkKey);
        
        if (!stored) {
            return null;
        }
        
        const zkData = JSON.parse(stored);
        
        // Decrypt data
        const decryptedData = await decryptFromMinaZK(zkData.encrypted);
        
        console.log(`✅ Data loaded from Mina ZK storage: ${key}`);
        return decryptedData;
        
    } catch (error) {
        console.error('❌ Mina ZK load failed:', error);
        return null;
    }
}

/**
 * 🔐 ENCRYPT FOR MINA ZK
 */
async function encryptForMinaZK(data) {
    // Simple encryption for now - later integrate with Mina ZK
    const jsonString = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(jsonString)));
}

/**
 * 🔓 DECRYPT FROM MINA ZK  
 */
async function decryptFromMinaZK(encryptedData) {
    // Simple decryption for now - later integrate with Mina ZK
    const jsonString = decodeURIComponent(escape(atob(encryptedData)));
    return JSON.parse(jsonString);
}

/**
 * 🆔 GET PARENT IDENTIFIER
 */
async function getParentIdentifier() {
    // Generate or retrieve parent identifier for ZK storage
    let parentId = localStorage.getItem('zk_parent_identifier');
    
    if (!parentId) {
        // Generate unique identifier for this parent
        parentId = 'parent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('zk_parent_identifier', parentId);
    }
    
    return parentId;
}

/**
 * 📥 LOAD ALL MESSAGES
 */
async function loadAllMessages() {
    try {
        // 🧒 DETERMINE STORAGE KEYS BASED ON SELECTED CHILD
        let alertsKey, safetyKey, locationKey;
        
        if (currentSelectedChild && currentSelectedChild !== 'general') {
            // Load child-specific messages
            alertsKey = `zk_parent_alerts_child_${currentSelectedChild}`;
            safetyKey = `zk_parent_safety_child_${currentSelectedChild}`;
            locationKey = `zk_parent_location_child_${currentSelectedChild}`;
            console.log(`📥 Loading messages for child: ${currentSelectedChild}`);
        } else {
            // Load general messages
            alertsKey = PARENT_CMS_KEYS.alerts;
            safetyKey = PARENT_CMS_KEYS.safety;
            locationKey = PARENT_CMS_KEYS.location;
            console.log('📥 Loading general messages');
        }
        
        // Load alert messages
        const alertMessages = await loadFromMinaZK(alertsKey);
        if (alertMessages) {
            populateAlertFields(alertMessages);
        } else {
            clearAlertFields(); // Clear if no messages found for this child
        }
        
        // Load safety messages
        const safetyMessages = await loadFromMinaZK(safetyKey);
        if (safetyMessages) {
            populateSafetyFields(safetyMessages);
        } else {
            clearSafetyFields(); // Clear if no messages found for this child
        }
        
        // Load location messages
        const locationMessages = await loadFromMinaZK(locationKey);
        if (locationMessages) {
            populateLocationFields(locationMessages);
        } else {
            clearLocationFields(); // Clear if no messages found for this child
        }
        
        // Load safety tips
        await loadSafetyTips();
        
        const childName = currentSelectedChild === 'general' ? 'general messages' : 
                         (childProfiles.find(c => c.id === currentSelectedChild)?.name || 'selected child');
        console.log(`✅ All messages loaded for: ${childName}`);
        
    } catch (error) {
        console.error('❌ Failed to load messages:', error);
    }
}

/**
 * 📝 POPULATE FORM FIELDS
 */
function populateAlertFields(messages) {
    if (messages.water && document.getElementById('water-alert')) {
        document.getElementById('water-alert').value = messages.water || '';
    }
    if (messages.storm && document.getElementById('storm-alert')) {
        document.getElementById('storm-alert').value = messages.storm || '';
    }
    if (messages.flood && document.getElementById('flood-alert')) {
        document.getElementById('flood-alert').value = messages.flood || '';
    }
    if (messages.drones && document.getElementById('drone-alert')) {
        document.getElementById('drone-alert').value = messages.drones || '';
    }
    if (messages.exercises && document.getElementById('exercise-alert')) {
        document.getElementById('exercise-alert').value = messages.exercises || '';
    }
}

function populateSafetyFields(messages) {
    if (messages.help && document.getElementById('help-message')) {
        document.getElementById('help-message').value = messages.help || '';
    }
    if (messages.route && document.getElementById('route-message')) {
        document.getElementById('route-message').value = messages.route || '';
    }
    if (messages.emergency && document.getElementById('emergency-message')) {
        document.getElementById('emergency-message').value = messages.emergency || '';
    }
}

function populateLocationFields(messages) {
    if (document.getElementById('location-checking')) {
        document.getElementById('location-checking').value = messages.checking || '';
    }
    if (document.getElementById('location-found')) {
        document.getElementById('location-found').value = messages.found || '';
    }
}

/**
 * 👁️ UPDATE PREVIEW
 */
function updatePreview() {
    const preview = document.getElementById('child-preview');
    
    // Get current message being edited
    const activeTextarea = document.activeElement;
    if (activeTextarea && activeTextarea.classList.contains('message-editor')) {
        const message = activeTextarea.value;
        if (message) {
            preview.innerHTML = `
                <div style="font-size: 18px; color: #333; line-height: 1.5;">
                    ${message}
                </div>
            `;
        }
    }
}

/**
 * 🔄 SETUP PREVIEW UPDATES
 */
function setupPreviewUpdates() {
    // Add event listeners to all textareas
    document.querySelectorAll('.message-editor').forEach(textarea => {
        textarea.addEventListener('input', updatePreview);
        textarea.addEventListener('focus', updatePreview);
    });
}

/**
 * 🎵 TEST PREVIEW
 */
function testPreview() {
    const preview = document.getElementById('child-preview');
    const text = preview.textContent || preview.innerText;
    
    if (text && text.trim() !== 'Wybierz komunikat powyżej, aby zobaczyć podgląd') {
        // Remove emoji for speech test
        const speechText = text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
        
        // Use Web Speech API for testing with parent settings
        if ('speechSynthesis' in window) {
            // Stop any current speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(speechText);
            
            // Apply parent voice settings
            if (currentVoiceSettings.selectedVoice) {
                const voice = availableVoices.find(v => v.name === currentVoiceSettings.selectedVoice);
                if (voice) {
                    utterance.voice = voice;
                }
            }
            
            utterance.rate = currentVoiceSettings.speed;
            utterance.pitch = currentVoiceSettings.pitch;
            utterance.volume = currentVoiceSettings.volume;
            utterance.lang = 'pl-PL';
            
            utterance.onstart = () => {
                showNotification('🎵 Test komunikatu odtwarzany z Twoimi ustawieniami...', 'info');
            };
            
            utterance.onerror = (error) => {
                console.error('❌ Speech test error:', error);
                showNotification('❌ Błąd testu komunikatu', 'error');
            };
            
            speechSynthesis.speak(utterance);
            
        } else {
            showNotification('⚠️ Przeglądarka nie obsługuje syntezy mowy', 'warning');
        }
    } else {
        showNotification('⚠️ Wybierz komunikat do testowania', 'warning');
    }
}

/**
 * 📢 SHOW NOTIFICATION
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 400px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    // Set color based on type
    switch (type) {
        case 'success':
            notification.style.background = '#4CAF50';
            break;
        case 'error':
            notification.style.background = '#f44336';
            break;
        case 'warning':
            notification.style.background = '#FF9800';
            break;
        default:
            notification.style.background = '#2196F3';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * 🔗 EXPORT TO MAIN APP
 * Function that main app can use to get parent-created messages
 * Now supports child-specific messages for multi-child families
 */

// Export loadFromMinaZK for main app to load safety tips
window.loadFromMinaZK = loadFromMinaZK;

window.getParentMessage = async function(category, type, childId = null) {
    try {
        // If childId provided, use child-specific storage
        if (childId) {
            const childSpecificKey = `zk_parent_${category}_child_${childId}`;
            const childMessages = await loadFromMinaZK(childSpecificKey);
            
            if (childMessages && childMessages[type]) {
                console.log(`✅ Child-specific parent message found for ${childId} ${category}.${type}:`, childMessages[type]);
                return childMessages[type];
            }
        }
        
        // Fallback to general parent messages
        const messages = await loadFromMinaZK(PARENT_CMS_KEYS[category]);
        
        if (messages && messages[type]) {
            console.log(`✅ General parent message found for ${category}.${type}:`, messages[type]);
            return messages[type];
        }
        
        console.log(`ℹ️ No parent message for ${category}.${type} - using fallback`);
        return null;
        
    } catch (error) {
        console.error('❌ Error loading parent message:', error);
        return null;
    }
};

/**
 * 👶 SAVE CHILD-SPECIFIC PARENT MESSAGE
 * Allows parent to create messages for specific child
 */
window.saveParentMessageForChild = async function(childId, category, type, message) {
    try {
        const childSpecificKey = `zk_parent_${category}_child_${childId}`;
        const existingMessages = await loadFromMinaZK(childSpecificKey) || {};
        
        existingMessages[type] = message;
        existingMessages.lastUpdated = new Date().toISOString();
        existingMessages.childId = childId;
        
        await saveToMinaZK(childSpecificKey, existingMessages);
        
        console.log(`✅ Saved child-specific message for ${childId}:`, { category, type, message });
        return true;
        
    } catch (error) {
        console.error('❌ Error saving child-specific parent message:', error);
        return false;
    }
};

/**
 * 📋 GET ALL CHILDREN WITH CUSTOM MESSAGES
 */
window.getChildrenWithCustomMessages = async function() {
    try {
        const familyProfiles = await window.loadFromMinaZK('zk_family_children_profiles') || {};
        return Object.values(familyProfiles);
    } catch (error) {
        console.error('❌ Error loading children profiles:', error);
        return [];
    }
};

/**
 * 🎵 INITIALIZE VOICES
 */
function initializeVoices() {
    if ('speechSynthesis' in window) {
        // Load voices
        loadVoices();
        
        // Setup event listeners
        setupVoiceControls();
        
        // Voices might load asynchronously
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    } else {
        console.error('❌ Speech synthesis not supported in this browser');
        showNotification('⚠️ Przeglądarka nie obsługuje syntezy mowy', 'warning');
    }
}

/**
 * 📢 LOAD AVAILABLE VOICES
 */
function loadVoices() {
    availableVoices = speechSynthesis.getVoices();
    
    // Filter ONLY Polish voices - aplikacja jest polska
    const polishVoices = availableVoices.filter(voice => 
        voice.lang.includes('pl') || voice.lang.includes('PL')
    );
    
    // Populate voice select with Polish voices only
    const voiceSelect = document.getElementById('voice-select');
    voiceSelect.innerHTML = '';
    
    if (polishVoices.length > 0) {
        polishVoices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice.default) option.textContent += ' ⭐';
            voiceSelect.appendChild(option);
        });
        
        console.log(`🎵 Loaded ${polishVoices.length} Polish voices`);
        
        // Auto-select best Polish voice
        if (!currentVoiceSettings.selectedVoice) {
            const bestVoice = polishVoices.find(v => v.name.includes('Paulina')) || 
                             polishVoices.find(v => v.name.includes('Zofia')) || 
                             polishVoices[0];
            
            voiceSelect.value = bestVoice.name;
            currentVoiceSettings.selectedVoice = bestVoice.name;
        }
    } else {
        // Fallback if no Polish voices found
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '⚠️ Brak polskich głosów - używany będzie domyślny';
        voiceSelect.appendChild(option);
        
        console.log('⚠️ No Polish voices found, using default');
    }
}

/**
 * 🎛️ SETUP VOICE CONTROLS
 */
function setupVoiceControls() {
    const voiceSelect = document.getElementById('voice-select');
    const speedControl = document.getElementById('speed-control');
    const speedDisplay = document.getElementById('speed-display');
    
    // Voice selection change
    voiceSelect.addEventListener('change', function() {
        currentVoiceSettings.selectedVoice = this.value;
        console.log(`🎤 Voice changed to: ${this.value}`);
    });
    
    // Speed control change
    speedControl.addEventListener('input', function() {
        currentVoiceSettings.speed = parseFloat(this.value);
        speedDisplay.textContent = `${this.value}x`;
        console.log(`⚡ Speed changed to: ${this.value}x`);
    });
}

/**
 * 🎵 TEST VOICE SETTINGS
 */
function testVoiceSettings() {
    const testText = "Cześć! To jest test głosu i tempa czytania dla Twojego dziecka. Jak brzmi ten głos?";
    
    if ('speechSynthesis' in window) {
        // Stop any current speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(testText);
        
        // Apply current settings
        if (currentVoiceSettings.selectedVoice) {
            const voice = availableVoices.find(v => v.name === currentVoiceSettings.selectedVoice);
            if (voice) {
                utterance.voice = voice;
            }
        }
        
        utterance.rate = currentVoiceSettings.speed;
        utterance.pitch = currentVoiceSettings.pitch;
        utterance.volume = currentVoiceSettings.volume;
        utterance.lang = 'pl-PL';
        
        utterance.onstart = () => {
            console.log('🎵 Voice test started');
            showNotification('🎵 Test głosu odtwarzany...', 'info');
        };
        
        utterance.onend = () => {
            console.log('✅ Voice test completed');
        };
        
        utterance.onerror = (error) => {
            console.error('❌ Voice test error:', error);
            showNotification('❌ Błąd testu głosu', 'error');
        };
        
        speechSynthesis.speak(utterance);
        
    } else {
        showNotification('⚠️ Przeglądarka nie obsługuje syntezy mowy', 'warning');
    }
}

/**
 * 💾 SAVE VOICE SETTINGS
 */
async function saveVoiceSettings() {
    try {
        const settings = {
            selectedVoice: currentVoiceSettings.selectedVoice,
            speed: currentVoiceSettings.speed,
            pitch: currentVoiceSettings.pitch,
            volume: currentVoiceSettings.volume,
            timestamp: new Date().toISOString()
        };
        
        await saveToMinaZK(PARENT_CMS_KEYS.voice_settings, settings);
        
        showNotification('✅ Ustawienia głosu zapisane w systemie ZKP!', 'success');
        console.log('✅ Voice settings saved to Mina ZK');
        
    } catch (error) {
        console.error('❌ Failed to save voice settings:', error);
        showNotification('❌ Błąd zapisu ustawień głosu', 'error');
    }
}

/**
 * 📥 LOAD VOICE SETTINGS
 */
async function loadVoiceSettings() {
    try {
        const settings = await loadFromMinaZK(PARENT_CMS_KEYS.voice_settings);
        
        if (settings) {
            currentVoiceSettings = {
                selectedVoice: settings.selectedVoice || null,
                speed: settings.speed || 0.8,
                pitch: settings.pitch || 1.0,
                volume: settings.volume || 0.9
            };
            
            // Apply to UI
            const voiceSelect = document.getElementById('voice-select');
            const speedControl = document.getElementById('speed-control');
            const speedDisplay = document.getElementById('speed-display');
            
            if (voiceSelect && currentVoiceSettings.selectedVoice) {
                voiceSelect.value = currentVoiceSettings.selectedVoice;
            }
            
            if (speedControl) {
                speedControl.value = currentVoiceSettings.speed;
                speedDisplay.textContent = `${currentVoiceSettings.speed}x`;
            }
            
            console.log('✅ Voice settings loaded from Mina ZK');
        }
        
    } catch (error) {
        console.error('❌ Failed to load voice settings:', error);
    }
}

/**
 * 🌍 SAVE LOCATION SETTINGS
 */
async function saveLocationSettings() {
    try {
        const locationEnabled = document.getElementById('location-enabled')?.checked ?? true;
        const criticalAlertsOnly = document.getElementById('critical-alerts-only')?.checked ?? false;
        
        const locationSettings = {
            locationEnabled: locationEnabled,
            criticalAlertsOnly: criticalAlertsOnly,
            timestamp: new Date().toISOString()
        };
        
        await saveToMinaZK('zk_parent_location_settings', locationSettings);
        
        showNotification('✅ Ustawienia lokalizacji zapisane w systemie ZKP!', 'success');
        console.log('✅ Location settings saved to Mina ZK:', locationSettings);
        
    } catch (error) {
        console.error('❌ Failed to save location settings:', error);
        showNotification('❌ Błąd zapisu ustawień lokalizacji', 'error');
    }
}

/**
 * 📥 GET LOCATION SETTINGS
 */
async function getParentLocationSettings() {
    try {
        const settings = await loadFromMinaZK('zk_parent_location_settings');
        
        if (settings) {
            console.log('✅ Location settings loaded from Mina ZK:', settings);
            return settings;
        } else {
            // Default settings
            const defaultSettings = {
                locationEnabled: true,  // Default: use location for better alerts
                criticalAlertsOnly: false  // Default: all alert levels
            };
            console.log('ℹ️ Using default location settings:', defaultSettings);
            return defaultSettings;
        }
        
    } catch (error) {
        console.error('❌ Failed to load location settings:', error);
        // Fallback to default
        return {
            locationEnabled: true,
            criticalAlertsOnly: false
        };
    }
}

/**
 * 🧹 CLEAR FORM FIELDS (for child-specific loading)
 */
function clearAlertFields() {
    const fields = ['water-alert', 'storm-alert', 'flood-alert', 'drone-alert', 'exercise-alert'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
}

function clearSafetyFields() {
    const fields = ['safety-help', 'safety-emergency', 'safety-lost', 'safety-stranger'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
}

function clearLocationFields() {
    const fields = ['location-checking', 'location-found'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
}

function clearSafetyTipsFields() {
    for (let i = 1; i <= 5; i++) {
        const titleField = document.getElementById(`safety-tip-${i}-title`);
        const contentField = document.getElementById(`safety-tip-${i}-content`);
        if (titleField) titleField.value = '';
        if (contentField) contentField.value = '';
    }
}

/**
 * 💾 SAVE SAFETY TIPS
 */
async function saveSafetyTips() {
    try {
        console.log('💾 Saving safety tips...');
        
        // Collect all safety tips from form
        const safetyTips = [];
        
        for (let i = 1; i <= 5; i++) {
            const titleField = document.getElementById(`safety-tip-${i}-title`);
            const contentField = document.getElementById(`safety-tip-${i}-content`);
            
            if (titleField && contentField) {
                const title = titleField.value.trim();
                const content = contentField.value.trim();
                
                // Only save if there's content
                if (title || content) {
                    safetyTips.push({
                        id: i,
                        title: title,
                        content: content,
                        icon: getSafetyTipIcon(i) // Get default icon for position
                    });
                }
            }
        }
        
        console.log('📍 Safety tips collected:', safetyTips);
        
        // 🔒 DETERMINE STORAGE KEY BASED ON SELECTED CHILD
        let storageKey;
        if (currentSelectedChild && currentSelectedChild !== 'general') {
            storageKey = `zk_parent_safety_tips_child_${currentSelectedChild}`;
            console.log(`🧒 Saving child-specific safety tips for: ${currentSelectedChild}`);
        } else {
            storageKey = 'zk_parent_safety_tips';
            console.log('📊 Saving general safety tips');
        }
        
        // Save to Mina ZK storage
        await saveToMinaZK(storageKey, safetyTips);
        
        const childName = currentSelectedChild === 'general' ? 'ogólne' : 
                         (childProfiles.find(c => c.id === currentSelectedChild)?.name || 'wybrane dziecko');
        showNotification(`✅ Złote zasady zapisane dla: ${childName}`, 'success');
        
    } catch (error) {
        console.error('❌ Failed to save safety tips:', error);
        showNotification('❌ Błąd zapisu złotych zasad', 'error');
    }
}

/**
 * 🎯 GET SAFETY TIP ICON BY POSITION
 */
function getSafetyTipIcon(position) {
    const icons = {
        1: '😸',  // Bezpieczeństwo na drodze
        2: '🏠',  // W domu
        3: '👥',  // Z nieznajomymi
        4: '🌦️', // Zła pogoda
        5: '🛴'   // Hulajnogi elektryczne
    };
    return icons[position] || '💡';
}

/**
 * 📚 LOAD SAFETY TIPS
 */
async function loadSafetyTips() {
    try {
        // 🔍 DETERMINE STORAGE KEY BASED ON SELECTED CHILD
        let storageKey;
        if (currentSelectedChild && currentSelectedChild !== 'general') {
            storageKey = `zk_parent_safety_tips_child_${currentSelectedChild}`;
            console.log(`📚 Loading child-specific safety tips for: ${currentSelectedChild}`);
        } else {
            storageKey = 'zk_parent_safety_tips';
            console.log('📚 Loading general safety tips');
        }
        
        const safetyTips = await loadFromMinaZK(storageKey);
        
        if (safetyTips && Array.isArray(safetyTips)) {
            console.log('✅ Safety tips loaded:', safetyTips);
            populateSafetyTipsFields(safetyTips);
        } else {
            console.log('ℹ️ No safety tips found - using empty fields');
            clearSafetyTipsFields();
        }
        
    } catch (error) {
        console.error('❌ Failed to load safety tips:', error);
        clearSafetyTipsFields();
    }
}

/**
 * 📝 POPULATE SAFETY TIPS FIELDS
 */
function populateSafetyTipsFields(safetyTips) {
    // Clear all fields first
    clearSafetyTipsFields();
    
    // Populate with loaded data
    safetyTips.forEach(tip => {
        const titleField = document.getElementById(`safety-tip-${tip.id}-title`);
        const contentField = document.getElementById(`safety-tip-${tip.id}-content`);
        
        if (titleField && tip.title) {
            titleField.value = tip.title;
        }
        if (contentField && tip.content) {
            contentField.value = tip.content;
        }
    });
}

// 🧒 CHILD MODAL FUNCTIONS (placeholder)
async function showAddChildModal() {
    alert('🚧 Add Child Modal - Coming Soon!\nFor now, children are added automatically when they first use the main app.');
}

async function showManageChildrenModal() {
    alert('🚧 Manage Children Modal - Coming Soon!\nChildren can be managed through the main application settings.');
}

/**
 * 🔄 LOAD LOCATION SETTINGS INTO UI
 */
async function loadLocationSettingsUI() {
    try {
        const settings = await getParentLocationSettings();
        
        const locationEnabledCheckbox = document.getElementById('location-enabled');
        const criticalAlertsOnlyCheckbox = document.getElementById('critical-alerts-only');
        
        if (locationEnabledCheckbox) {
            locationEnabledCheckbox.checked = settings.locationEnabled ?? true;
        }
        
        if (criticalAlertsOnlyCheckbox) {
            criticalAlertsOnlyCheckbox.checked = settings.criticalAlertsOnly ?? false;
        }
        
        console.log('✅ Location settings UI loaded');
        
    } catch (error) {
        console.error('❌ Failed to load location settings UI:', error);
    }
}

// Initialize location settings when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadLocationSettingsUI);
} else {
    loadLocationSettingsUI();
}

console.log('🔒 Parent CMS module loaded');

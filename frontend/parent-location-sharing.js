/**
 * 📍 PARENT LOCATION SHARING - Real-time Parent Tracking
 * Allows parents to share their location with children for emergency situations
 * Uses Mina ZK storage for privacy-safe location sharing
 */

/**
 * 🔐 SAVE PARENT LOCATION TO MINA ZK
 * Stores current parent location securely
 */
async function saveParentLocation(position) {
    try {
        const locationData = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
            sharingEnabled: true
        };
        
        console.log('📍 Saving parent location to Mina ZK:', locationData);
        
        // Save to Mina ZK storage
        if (typeof window.saveToMinaZK === 'function') {
            await window.saveToMinaZK('zk_parent_emergency_location', locationData);
            console.log('✅ Parent location saved to Mina ZK');
            return true;
        } else {
            console.error('❌ saveToMinaZK not available');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Failed to save parent location:', error);
        return false;
    }
}

/**
 * 🏠 SAVE HOME LOCATION
 * Stores home address as fallback
 */
async function saveHomeLocation(address, lat, lon) {
    try {
        const homeData = {
            address: address,
            lat: lat,
            lon: lon,
            timestamp: new Date().toISOString()
        };
        
        console.log('🏠 Saving home location to Mina ZK:', homeData);
        
        if (typeof window.saveToMinaZK === 'function') {
            await window.saveToMinaZK('zk_home_location', homeData);
            console.log('✅ Home location saved');
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ Failed to save home location:', error);
        return false;
    }
}

/**
 * 🔄 START LOCATION SHARING
 * Begins continuous location tracking for parent
 */
let locationWatchId = null;

function startLocationSharing() {
    console.log('📍 Starting parent location sharing...');
    
    if (!navigator.geolocation) {
        console.error('❌ Geolocation not supported');
        alert('Twoja przeglądarka nie obsługuje geolokalizacji');
        return false;
    }
    
    // Stop any existing watch
    stopLocationSharing();
    
    // Start watching position
    locationWatchId = navigator.geolocation.watchPosition(
        async (position) => {
            console.log('📍 Parent location updated');
            await saveParentLocation(position);
            
            // Update UI
            updateLocationSharingUI(position);
        },
        (error) => {
            console.error('❌ Location error:', error);
            handleLocationSharingError(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000 // Update every 30 seconds
        }
    );
    
    console.log('✅ Location sharing started');
    return true;
}

/**
 * ⏹️ STOP LOCATION SHARING
 */
function stopLocationSharing() {
    if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
        locationWatchId = null;
        console.log('⏹️ Location sharing stopped');
        
        // Update Mina ZK to mark sharing as disabled
        updateLocationSharingStatus(false);
    }
}

/**
 * 🔄 UPDATE LOCATION SHARING STATUS
 */
async function updateLocationSharingStatus(enabled) {
    try {
        const existingLocation = await window.loadFromMinaZK('zk_parent_emergency_location');
        if (existingLocation) {
            existingLocation.sharingEnabled = enabled;
            existingLocation.lastUpdated = new Date().toISOString();
            await window.saveToMinaZK('zk_parent_emergency_location', existingLocation);
            console.log(`📍 Location sharing status updated: ${enabled}`);
        }
    } catch (error) {
        console.error('❌ Failed to update sharing status:', error);
    }
}

/**
 * 🎨 UPDATE UI WITH LOCATION STATUS
 */
function updateLocationSharingUI(position) {
    const statusElement = document.getElementById('location-sharing-status');
    if (statusElement) {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        const accuracy = Math.round(position.coords.accuracy);
        const time = new Date().toLocaleTimeString('pl-PL');
        
        statusElement.innerHTML = `
            <div class="location-active">
                <div class="status-indicator active"></div>
                <div class="status-text">
                    <strong>✅ Lokalizacja udostępniona</strong>
                    <div class="location-details">
                        📍 ${lat}, ${lon}<br>
                        🎯 Dokładność: ±${accuracy}m<br>
                        ⏰ Ostatnia aktualizacja: ${time}
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * ❌ HANDLE LOCATION SHARING ERROR
 */
function handleLocationSharingError(error) {
    const statusElement = document.getElementById('location-sharing-status');
    if (statusElement) {
        let message = 'Błąd pobierania lokalizacji';
        
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message = 'Odmówiono dostępu do lokalizacji. Włącz uprawnienia GPS w ustawieniach przeglądarki.';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Lokalizacja niedostępna. Sprawdź połączenie GPS.';
                break;
            case error.TIMEOUT:
                message = 'Przekroczono czas oczekiwania na lokalizację.';
                break;
        }
        
        statusElement.innerHTML = `
            <div class="location-error">
                <div class="status-indicator error"></div>
                <div class="status-text">
                    <strong>❌ Błąd</strong>
                    <div class="error-message">${message}</div>
                </div>
            </div>
        `;
    }
}

/**
 * 📱 GET PARENT LOCATION (FOR CHILD APP)
 * Child app uses this to find parent
 */
async function getParentLocation() {
    try {
        console.log('📍 Child requesting parent location...');
        
        const parentLocation = await window.loadFromMinaZK('zk_parent_emergency_location');
        
        if (!parentLocation) {
            console.log('⚠️ No parent location found');
            return null;
        }
        
        if (!parentLocation.sharingEnabled) {
            console.log('⚠️ Parent location sharing is disabled');
            return null;
        }
        
        // Check if location is recent (< 5 minutes old)
        const locationAge = Date.now() - new Date(parentLocation.timestamp).getTime();
        const maxAge = 5 * 60 * 1000; // 5 minutes
        
        if (locationAge > maxAge) {
            console.warn(`⏰ Parent location is old (${Math.round(locationAge/60000)} minutes)`);
            // Still return it, but with warning
            parentLocation.isStale = true;
        }
        
        console.log('✅ Parent location retrieved:', parentLocation);
        return parentLocation;
        
    } catch (error) {
        console.error('❌ Failed to get parent location:', error);
        return null;
    }
}

/**
 * 🏠 GET HOME LOCATION (FALLBACK)
 */
async function getHomeLocation() {
    try {
        console.log('🏠 Getting home location...');
        
        const homeLocation = await window.loadFromMinaZK('zk_home_location');
        
        if (!homeLocation) {
            console.log('⚠️ No home location saved');
            return null;
        }
        
        console.log('✅ Home location retrieved:', homeLocation);
        return homeLocation;
        
    } catch (error) {
        console.error('❌ Failed to get home location:', error);
        return null;
    }
}

/**
 * 🧭 NAVIGATE TO PARENT
 * Opens navigation to parent's current location
 */
async function navigateToParent() {
    console.log('🧭 Navigating to parent...');
    
    try {
        // Try to get parent location first
        let parentLocation = await getParentLocation();
        
        if (parentLocation && parentLocation.lat && parentLocation.lon) {
            const age = Date.now() - new Date(parentLocation.timestamp).getTime();
            const ageMinutes = Math.round(age / 60000);
            
            if (parentLocation.isStale) {
                const proceed = confirm(`Lokalizacja rodzica sprzed ${ageMinutes} minut. Kontynuować?`);
                if (!proceed) return;
            }
            
            console.log(`📍 Parent location: ${parentLocation.lat}, ${parentLocation.lon}`);
            
            // Open Google Maps navigation
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${parentLocation.lat},${parentLocation.lon}&travelmode=walking`;
            window.open(mapsUrl, '_blank');
            
            return true;
        }
        
        // Fallback: Try home location
        console.log('⚠️ Parent location unavailable, trying home...');
        const homeLocation = await getHomeLocation();
        
        if (homeLocation && homeLocation.lat && homeLocation.lon) {
            const useHome = confirm(`Nie można znaleźć rodzica. Nawigować do domu (${homeLocation.address})?`);
            if (useHome) {
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${homeLocation.lat},${homeLocation.lon}&travelmode=walking`;
                window.open(mapsUrl, '_blank');
                return true;
            }
        }
        
        // No location available
        alert('Nie można znaleźć rodzica ani adresu domowego. Poproś rodzica o włączenie udostępniania lokalizacji w Parent CMS.');
        return false;
        
    } catch (error) {
        console.error('❌ Navigation failed:', error);
        alert('Błąd nawigacji. Spróbuj ponownie.');
        return false;
    }
}

/**
 * 📊 GET DISTANCE TO PARENT
 * Calculates distance between child and parent
 */
async function getDistanceToParent(childLat, childLon) {
    try {
        const parentLocation = await getParentLocation();
        
        if (!parentLocation) {
            return null;
        }
        
        // Use Haversine formula (from emergency-real-places.js)
        const distance = calculateDistance(childLat, childLon, parentLocation.lat, parentLocation.lon);
        
        return {
            distance: Math.round(distance),
            formatted: distance < 1000 ? `${Math.round(distance)}m` : `${(distance/1000).toFixed(1)}km`,
            location: parentLocation
        };
        
    } catch (error) {
        console.error('❌ Failed to calculate distance to parent:', error);
        return null;
    }
}

/**
 * 🎨 DISPLAY PARENT LOCATION STATUS (FOR CHILD APP)
 * Shows where parent is and how far
 */
async function displayParentLocationStatus(childPosition) {
    console.log('📍 Displaying parent location status...');
    
    const container = document.getElementById('parent-location-status');
    if (!container) {
        console.warn('⚠️ Parent location status container not found');
        return;
    }
    
    try {
        const parentLocation = await getParentLocation();
        
        if (!parentLocation) {
            container.innerHTML = `
                <div class="parent-not-found">
                    <div class="icon">👨‍👩‍👧</div>
                    <h4>Nie można znaleźć rodzica</h4>
                    <p>Rodzic nie udostępnia lokalizacji</p>
                    <button onclick="tryHomeNavigation()">🏠 Wróć do domu</button>
                </div>
            `;
            return;
        }
        
        // Calculate distance
        const distanceInfo = await getDistanceToParent(childPosition.lat, childPosition.lon);
        
        const age = Date.now() - new Date(parentLocation.timestamp).getTime();
        const ageText = age < 60000 ? 'teraz' : `${Math.round(age/60000)} min temu`;
        
        container.innerHTML = `
            <div class="parent-found">
                <div class="parent-icon">👨‍👩‍👧</div>
                <h4>Znaleziono rodzica!</h4>
                <div class="parent-distance">${distanceInfo.formatted} stąd</div>
                <div class="parent-time">Lokalizacja: ${ageText}</div>
                ${parentLocation.isStale ? '<div class="warning">⚠️ Lokalizacja nieaktualna</div>' : ''}
                <button class="navigate-parent-btn" onclick="navigateToParent()">
                    🧭 Prowadź do rodzica
                </button>
            </div>
        `;
        
        console.log('✅ Parent location status displayed');
        
    } catch (error) {
        console.error('❌ Failed to display parent status:', error);
        container.innerHTML = `
            <div class="error">
                <div class="icon">❌</div>
                <h4>Błąd</h4>
                <p>Nie udało się sprawdzić lokalizacji rodzica</p>
            </div>
        `;
    }
}

/**
 * 🏠 TRY HOME NAVIGATION (FALLBACK)
 */
async function tryHomeNavigation() {
    const homeLocation = await getHomeLocation();
    
    if (homeLocation && homeLocation.lat && homeLocation.lon) {
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${homeLocation.lat},${homeLocation.lon}&travelmode=walking`;
        window.open(mapsUrl, '_blank');
    } else {
        alert('Adres domowy nie został zapisany. Poproś rodzica o dodanie go w Parent CMS.');
    }
}

console.log('✅ Parent Location Sharing module loaded');

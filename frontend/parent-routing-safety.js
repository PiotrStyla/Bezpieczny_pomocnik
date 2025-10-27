/*
 * 🛡️ PARENT ROUTING SAFETY
 * Critical safety checks before showing route to parent
 * Prevents showing route when child is already near parent
 */

console.log('🛡️ Parent routing safety module loading...');

/**
 * 📏 CALCULATE DISTANCE BETWEEN TWO POINTS
 * Uses Haversine formula for accurate distance
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // Distance in meters
}

/**
 * 🕐 CHECK IF LOCATION IS RECENT
 */
function isLocationRecent(timestamp, maxAgeMinutes = 10) {
    if (!timestamp) return false;
    
    const locationTime = new Date(timestamp).getTime();
    const now = Date.now();
    const ageMinutes = (now - locationTime) / (1000 * 60);
    
    return ageMinutes <= maxAgeMinutes;
}

/**
 * 🛡️ VALIDATE ROUTING SAFETY
 * Returns object with: { safe, action, message, distance }
 */
async function validateRoutingToParent(childLat, childLon) {
    console.log('🛡️ Validating routing safety...');
    
    try {
        // Get parent location
        const parentLocation = await window.getParentLocation();
        
        if (!parentLocation) {
            return {
                safe: false,
                action: 'no_parent',
                message: '❌ Nie mogę znaleźć lokalizacji rodzica',
                distance: null
            };
        }
        
        // Check location age
        const isRecent = isLocationRecent(parentLocation.timestamp, 30);
        const locationAge = parentLocation.timestamp ? 
            Math.round((Date.now() - new Date(parentLocation.timestamp).getTime()) / (1000 * 60)) : 
            999;
        
        console.log('📍 Parent location:', {
            lat: parentLocation.lat,
            lon: parentLocation.lon,
            timestamp: parentLocation.timestamp,
            ageMinutes: locationAge,
            isRecent: isRecent
        });
        
        // Calculate distance
        const distance = calculateDistance(
            childLat, childLon,
            parentLocation.lat, parentLocation.lon
        );
        
        console.log('📏 Distance to parent:', distance + 'm');
        
        // DECISION LOGIC
        
        // 1. Already with parent (< 50m)
        if (distance < 50) {
            return {
                safe: true,
                action: 'already_there',
                message: '🎉 Świetnie! Jesteś już przy rodzicach! Są tuż obok Ciebie!',
                distance: distance,
                parentLocation: parentLocation
            };
        }
        
        // 2. Very close (50-100m)
        if (distance < 100) {
            return {
                safe: true,
                action: 'very_close',
                message: `👋 Rodzice są bardzo blisko - około ${distance} metrów od Ciebie! Rozejrzyj się wokół!`,
                distance: distance,
                parentLocation: parentLocation
            };
        }
        
        // 3. Location too old - warning
        if (!isRecent) {
            return {
                safe: true,
                action: 'old_location',
                message: `⚠️ Ostatnia lokalizacja rodzica sprzed ${locationAge} minut. Mogą już być w innym miejscu! Odległość wtedy: ${distance}m`,
                distance: distance,
                parentLocation: parentLocation,
                locationAge: locationAge
            };
        }
        
        // 4. Normal routing (> 100m, recent location)
        return {
            safe: true,
            action: 'show_route',
            message: `🗺️ Prowadzę Cię do rodziców (${distance} metrów)`,
            distance: distance,
            parentLocation: parentLocation
        };
        
    } catch (error) {
        console.error('❌ Error validating routing:', error);
        return {
            safe: false,
            action: 'error',
            message: '❌ Nie mogę sprawdzić lokalizacji rodzica',
            distance: null
        };
    }
}

/**
 * 💬 SHOW SAFETY MESSAGE TO CHILD
 */
function showSafetyMessage(validation) {
    const mascotText = document.getElementById('mascot-text');
    if (mascotText) {
        mascotText.textContent = validation.message;
    }
    
    // Speak the message
    if (window.speakText && window.speechEnabled) {
        const speechMessage = validation.message.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
        window.speakText(speechMessage);
    }
}

/**
 * 🗺️ SAFE SHOW PARENT ON MAP
 * Wrapper around original function with safety checks
 */
async function safeShowParentOnMap(childLat, childLon) {
    console.log('🛡️ Safe parent map display with validation...');
    
    // Validate first
    const validation = await validateRoutingToParent(childLat, childLon);
    
    console.log('🛡️ Validation result:', validation);
    
    // Show appropriate message
    showSafetyMessage(validation);
    
    // Decide action based on validation
    switch (validation.action) {
        case 'already_there':
            // Just show markers, no route
            if (window.showParentOnMap) {
                await window.showParentOnMap(childLat, childLon);
            }
            // Prevent routing
            return 'already_there';
            
        case 'very_close':
            // Show markers, no route needed
            if (window.showParentOnMap) {
                await window.showParentOnMap(childLat, childLon);
            }
            return 'very_close';
            
        case 'old_location':
            // Show with warning
            if (window.showParentOnMap) {
                await window.showParentOnMap(childLat, childLon);
            }
            return 'old_location';
            
        case 'show_route':
            // Normal routing
            if (window.showParentOnMap) {
                await window.showParentOnMap(childLat, childLon);
            }
            return 'show_route';
            
        case 'no_parent':
        case 'error':
            // Don't show map, error already displayed
            return validation.action;
            
        default:
            console.warn('⚠️ Unknown validation action:', validation.action);
            return 'unknown';
    }
}

// Export functions
window.validateRoutingToParent = validateRoutingToParent;
window.safeShowParentOnMap = safeShowParentOnMap;
window.calculateDistance = calculateDistance;
window.isLocationRecent = isLocationRecent;

console.log('✅ Parent routing safety module loaded');

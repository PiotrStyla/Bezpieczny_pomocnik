/**
 * 🚨 EMERGENCY REAL PLACES - OpenStreetMap Integration
 * Fetches REAL safe places nearby using Overpass API
 * NO FAKE DATA - Only real police, hospitals, pharmacies, fire stations
 */

/**
 * 📍 HAVERSINE DISTANCE CALCULATION
 * Calculates distance between two coordinates in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
}

/**
 * 🗺️ FETCH REAL SAFE PLACES FROM OVERPASS API
 * Queries OpenStreetMap for actual safe locations nearby
 */
async function fetchRealSafePlaces(userLat, userLon, radiusMeters = 2000) {
    console.log(`🔍 Fetching real safe places within ${radiusMeters}m of ${userLat}, ${userLon}`);
    
    try {
        // Overpass API query for safe places
        const query = `
            [out:json][timeout:25];
            (
                node["amenity"="police"](around:${radiusMeters},${userLat},${userLon});
                node["amenity"="hospital"](around:${radiusMeters},${userLat},${userLon});
                node["amenity"="pharmacy"](around:${radiusMeters},${userLat},${userLon});
                node["amenity"="fire_station"](around:${radiusMeters},${userLat},${userLon});
                node["amenity"="clinic"](around:${radiusMeters},${userLat},${userLon});
                node["emergency"="assembly_point"](around:${radiusMeters},${userLat},${userLon});
                node["amenity"="place_of_worship"](around:${radiusMeters},${userLat},${userLon});
                node["building"="school"](around:${radiusMeters},${userLat},${userLon});
                node["office"="government"](around:${radiusMeters},${userLat},${userLon});
            );
            out body;
        `;
        
        const url = 'https://overpass-api.de/api/interpreter';
        
        console.log('🌐 Sending request to Overpass API...');
        
        const response = await fetch(url, {
            method: 'POST',
            body: 'data=' + encodeURIComponent(query),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Overpass API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log(`✅ Received ${data.elements.length} places from Overpass API`);
        
        // Process and categorize places
        const places = data.elements.map(element => {
            const distance = calculateDistance(userLat, userLon, element.lat, element.lon);
            
            return {
                id: element.id,
                type: classifyPlaceType(element.tags),
                name: element.tags.name || getDefaultName(element.tags),
                lat: element.lat,
                lon: element.lon,
                distance: Math.round(distance),
                amenities: getAmenities(element.tags),
                address: formatAddress(element.tags),
                phone: element.tags.phone || element.tags['contact:phone'] || null,
                openingHours: element.tags.opening_hours || null,
                emergency: element.tags.emergency || false,
                tags: element.tags
            };
        });
        
        // Sort by distance (closest first)
        places.sort((a, b) => a.distance - b.distance);
        
        // Cache results for offline use
        await cacheRealPlaces(places, userLat, userLon);
        
        console.log(`📍 Processed ${places.length} real safe places`);
        return places;
        
    } catch (error) {
        console.error('❌ Failed to fetch real safe places:', error);
        
        // Try to load from cache
        const cachedPlaces = await loadCachedPlaces();
        if (cachedPlaces && cachedPlaces.length > 0) {
            console.log(`📦 Using ${cachedPlaces.length} cached places (offline mode)`);
            return cachedPlaces;
        }
        
        throw error;
    }
}

/**
 * 🏷️ CLASSIFY PLACE TYPE
 * Determines the type of safe place based on OSM tags
 */
function classifyPlaceType(tags) {
    if (tags.amenity === 'police') return 'police';
    if (tags.amenity === 'hospital') return 'hospital';
    if (tags.amenity === 'pharmacy') return 'pharmacy';
    if (tags.amenity === 'fire_station') return 'fire_station';
    if (tags.amenity === 'clinic') return 'clinic';
    if (tags.emergency === 'assembly_point') return 'assembly_point';
    if (tags.amenity === 'place_of_worship') return 'religious';
    if (tags.building === 'school') return 'school';
    if (tags.office === 'government') return 'government';
    return 'other';
}

/**
 * 📛 GET DEFAULT NAME
 * Provides a default name if place doesn't have one
 */
function getDefaultName(tags) {
    const typeNames = {
        police: 'Komisariat Policji',
        hospital: 'Szpital',
        pharmacy: 'Apteka',
        fire_station: 'Straż Pożarna',
        clinic: 'Przychodnia',
        assembly_point: 'Punkt Zborny',
        place_of_worship: 'Świątynia',
        school: 'Szkoła',
        government: 'Urząd'
    };
    
    const type = classifyPlaceType(tags);
    return typeNames[type] || 'Bezpieczne miejsce';
}

/**
 * 🏥 GET AMENITIES
 * Determines what services/amenities are available
 */
function getAmenities(tags) {
    const amenities = [];
    
    const type = classifyPlaceType(tags);
    
    // Based on place type
    if (type === 'police') {
        amenities.push('emergency', 'security', 'help');
    } else if (type === 'hospital' || type === 'clinic') {
        amenities.push('medical', 'emergency', 'first_aid');
    } else if (type === 'pharmacy') {
        amenities.push('medical', 'medicine');
    } else if (type === 'fire_station') {
        amenities.push('emergency', 'rescue', 'first_aid');
    } else if (type === 'religious') {
        amenities.push('shelter', 'help', 'community');
    } else if (type === 'school') {
        amenities.push('shelter', 'people', 'phone');
    } else if (type === 'government') {
        amenities.push('help', 'security', 'phone');
    }
    
    // Check specific tags
    if (tags.drinking_water === 'yes') amenities.push('water');
    if (tags.toilets === 'yes') amenities.push('toilets');
    if (tags.wheelchair === 'yes') amenities.push('accessible');
    if (tags.phone || tags['contact:phone']) amenities.push('phone');
    
    return [...new Set(amenities)]; // Remove duplicates
}

/**
 * 📍 FORMAT ADDRESS
 * Creates a readable address from OSM tags
 */
function formatAddress(tags) {
    const parts = [];
    
    if (tags['addr:street']) {
        const street = tags['addr:street'];
        const housenumber = tags['addr:housenumber'] || '';
        parts.push(`${street} ${housenumber}`.trim());
    }
    
    if (tags['addr:city']) {
        parts.push(tags['addr:city']);
    } else if (tags['addr:suburb']) {
        parts.push(tags['addr:suburb']);
    }
    
    return parts.join(', ') || null;
}

/**
 * 💾 CACHE REAL PLACES
 * Saves fetched places to localStorage for offline use
 */
async function cacheRealPlaces(places, lat, lon) {
    try {
        const cacheData = {
            timestamp: new Date().toISOString(),
            location: { lat, lon },
            places: places,
            version: 1
        };
        
        localStorage.setItem('emergency_safe_places_cache', JSON.stringify(cacheData));
        console.log(`💾 Cached ${places.length} safe places for offline use`);
        
    } catch (error) {
        console.error('❌ Failed to cache places:', error);
    }
}

/**
 * 📦 LOAD CACHED PLACES
 * Retrieves cached places for offline mode
 */
async function loadCachedPlaces() {
    try {
        const cacheJson = localStorage.getItem('emergency_safe_places_cache');
        if (!cacheJson) {
            console.log('📦 No cached places found');
            return null;
        }
        
        const cache = JSON.parse(cacheJson);
        
        // Check if cache is recent (< 24 hours old)
        const cacheAge = Date.now() - new Date(cache.timestamp).getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (cacheAge > maxAge) {
            console.log('⏰ Cache is old (>24h), should refresh');
        }
        
        console.log(`📦 Loaded ${cache.places.length} cached places`);
        return cache.places;
        
    } catch (error) {
        console.error('❌ Failed to load cached places:', error);
        return null;
    }
}

/**
 * 🎯 GET STATUS FOR PLACE
 * Determines if place is accessible based on distance and type
 */
function getPlaceStatus(place) {
    const distance = place.distance;
    const type = place.type;
    
    // Critical emergency services - always highest priority
    if (type === 'police' || type === 'hospital' || type === 'fire_station') {
        if (distance < 500) return 'dostępne';
        if (distance < 1500) return 'ograniczone';
        return 'daleko';
    }
    
    // Pharmacies and clinics
    if (type === 'pharmacy' || type === 'clinic') {
        if (distance < 300) return 'dostępne';
        if (distance < 1000) return 'ograniczone';
        return 'daleko';
    }
    
    // Other safe places
    if (distance < 500) return 'dostępne';
    if (distance < 1200) return 'ograniczone';
    return 'daleko';
}

/**
 * 🎨 GET ICON FOR PLACE TYPE
 * Returns appropriate emoji icon for place type
 */
function getPlaceIcon(type) {
    const icons = {
        police: '🚔',
        hospital: '🏥',
        pharmacy: '💊',
        fire_station: '🚒',
        clinic: '⚕️',
        assembly_point: '🆘',
        religious: '⛪',
        school: '🏫',
        government: '🏛️',
        other: '📍'
    };
    
    return icons[type] || '📍';
}

/**
 * 📊 FORMAT DISTANCE
 * Formats distance in a child-friendly way
 */
function formatDistance(meters) {
    if (meters < 100) {
        return `${Math.round(meters)}m (bardzo blisko!)`;
    } else if (meters < 1000) {
        return `${Math.round(meters)}m`;
    } else {
        const km = (meters / 1000).toFixed(1);
        return `${km}km`;
    }
}

/**
 * 🗺️ DISPLAY REAL SAFE PLACES
 * Shows real safe places in the emergency UI
 */
async function displayRealSafePlaces(userLocation) {
    console.log('🗺️ Displaying real safe places...');
    
    // Show the safe places section
    const section = document.getElementById('safe-places-section');
    if (section) {
        section.style.display = 'block';
    }
    
    try {
        // Fetch real places
        const places = await fetchRealSafePlaces(userLocation.lat, userLocation.lon);
        
        if (places.length === 0) {
            console.warn('⚠️ No safe places found nearby');
            showNoPlacesMessage();
            return;
        }
        
        // Take top 5 closest places
        const topPlaces = places.slice(0, 5);
        
        console.log(`📍 Displaying top ${topPlaces.length} safe places`);
        
        // Update UI
        const container = document.getElementById('safe-places-list');
        if (!container) {
            console.error('❌ Safe places container not found');
            return;
        }
        
        container.innerHTML = topPlaces.map(place => {
            const icon = getPlaceIcon(place.type);
            const status = getPlaceStatus(place);
            const distance = formatDistance(place.distance);
            const statusClass = status === 'dostępne' ? 'available' : status === 'ograniczone' ? 'limited' : 'far';
            
            return `
                <div class="place-card ${statusClass}" data-lat="${place.lat}" data-lon="${place.lon}">
                    <div class="place-icon">${icon}</div>
                    <div class="place-info">
                        <h4>${place.name}</h4>
                        <div class="place-distance">${distance}</div>
                        <div class="place-status ${statusClass}">${status}</div>
                        ${place.amenities.length > 0 ? `
                            <div class="place-amenities">
                                ${place.amenities.map(a => `<span class="amenity-tag">${a}</span>`).join('')}
                            </div>
                        ` : ''}
                        ${place.address ? `<div class="place-address">${place.address}</div>` : ''}
                        ${place.phone ? `<div class="place-phone"><a href="tel:${place.phone}">${place.phone}</a></div>` : ''}
                    </div>
                    <button class="navigate-btn" onclick="navigateToPlace(${place.lat}, ${place.lon}, '${place.name}')">
                        🧭 Prowadź
                    </button>
                </div>
            `;
        }).join('');
        
        console.log('✅ Real safe places displayed');
        
    } catch (error) {
        console.error('❌ Failed to display safe places:', error);
        showErrorMessage();
    }
}

/**
 * 🚶 NAVIGATE TO PLACE
 * Opens navigation to selected safe place
 */
function navigateToPlace(lat, lon, name) {
    console.log(`🧭 Navigating to: ${name} (${lat}, ${lon})`);
    
    // Try Google Maps first (works on all platforms)
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
    
    // Open in new tab
    window.open(googleMapsUrl, '_blank');
    
    console.log('✅ Navigation opened');
}

/**
 * ⚠️ SHOW NO PLACES MESSAGE
 */
function showNoPlacesMessage() {
    const container = document.getElementById('safe-places-list');
    if (container) {
        container.innerHTML = `
            <div class="no-places-message">
                <div class="icon">📍</div>
                <h3>Nie znaleziono miejsc w pobliżu</h3>
                <p>Spróbuj zwiększyć zasięg wyszukiwania lub zadzwoń pod 112</p>
                <button onclick="location.reload()">🔄 Spróbuj ponownie</button>
            </div>
        `;
    }
}

/**
 * ❌ SHOW ERROR MESSAGE
 */
function showErrorMessage() {
    const container = document.getElementById('safe-places-list');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <div class="icon">⚠️</div>
                <h3>Nie udało się pobrać miejsc</h3>
                <p>Sprawdź połączenie z internetem</p>
                <button onclick="location.reload()">🔄 Spróbuj ponownie</button>
            </div>
        `;
    }
}

// Export to window for global access
window.displayRealSafePlaces = displayRealSafePlaces;
window.navigateToPlace = navigateToPlace;

console.log('✅ Emergency Real Places module loaded');

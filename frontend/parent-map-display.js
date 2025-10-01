/**
 * 🗺️ PARENT MAP DISPLAY - Show parent location on map
 * Displays parent location with distance and navigation
 */

let parentMap = null;
let parentMarker = null;
let childMarker = null;

/**
 * 🗺️ SHOW PARENT ON MAP
 * Creates a map showing both child and parent locations
 */
async function showParentOnMap(childLat, childLon) {
    console.log('🗺️ Showing parent on map...');
    
    try {
        // Get parent location
        const parentLocation = await window.getParentLocation();
        
        if (!parentLocation) {
            showNoParentMessage();
            return;
        }
        
        // Calculate distance
        const distance = calculateDistance(childLat, childLon, parentLocation.lat, parentLocation.lon);
        const distanceKm = (distance / 1000).toFixed(2);
        const distanceFormatted = distance < 1000 ? `${Math.round(distance)}m` : `${distanceKm}km`;
        
        // Create map container
        const mapContainer = createMapContainer();
        document.body.appendChild(mapContainer);
        
        // Initialize Leaflet map
        if (typeof L !== 'undefined') {
            // Calculate center point between child and parent
            const centerLat = (childLat + parentLocation.lat) / 2;
            const centerLon = (childLon + parentLocation.lon) / 2;
            
            parentMap = L.map('parent-location-map').setView([centerLat, centerLon], 13);
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(parentMap);
            
            // Add child marker (blue)
            childMarker = L.marker([childLat, childLon], {
                icon: L.divIcon({
                    className: 'child-marker',
                    html: '<div style="background: #2196F3; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">👶</div>',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                })
            }).addTo(parentMap);
            
            childMarker.bindPopup('<strong>Twoja lokalizacja</strong>');
            
            // Add parent marker (green)
            parentMarker = L.marker([parentLocation.lat, parentLocation.lon], {
                icon: L.divIcon({
                    className: 'parent-marker',
                    html: '<div style="background: #4CAF50; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">👨‍👩‍👧</div>',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                })
            }).addTo(parentMap);
            
            const age = Date.now() - new Date(parentLocation.timestamp).getTime();
            const ageText = age < 60000 ? 'teraz' : `${Math.round(age/60000)} min temu`;
            
            parentMarker.bindPopup(`<strong>Rodzic</strong><br>Odległość: ${distanceFormatted}<br>Aktualizacja: ${ageText}`).openPopup();
            
            // Draw line between child and parent
            const line = L.polyline([
                [childLat, childLon],
                [parentLocation.lat, parentLocation.lon]
            ], {
                color: '#FF9800',
                weight: 3,
                opacity: 0.7,
                dashArray: '10, 10'
            }).addTo(parentMap);
            
            // Fit map to show both markers
            const bounds = L.latLngBounds([
                [childLat, childLon],
                [parentLocation.lat, parentLocation.lon]
            ]);
            parentMap.fitBounds(bounds, { padding: [50, 50] });
            
            // Update distance display
            updateDistanceDisplay(distanceFormatted, ageText);
            
            console.log('✅ Parent map displayed');
            
        } else {
            console.error('❌ Leaflet not loaded');
            alert('Mapa nie jest dostępna. Sprawdź połączenie internetowe.');
        }
        
    } catch (error) {
        console.error('❌ Failed to show parent on map:', error);
        alert('Nie udało się wyświetlić mapy rodzica.');
    }
}

/**
 * 📦 CREATE MAP CONTAINER
 */
function createMapContainer() {
    const container = document.createElement('div');
    container.id = 'parent-map-container';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 100002;
        display: flex;
        flex-direction: column;
    `;
    
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h2 style="margin: 0 0 10px 0; font-size: 24px;">📍 Lokalizacja rodzica</h2>
                <div id="parent-distance-display" style="font-size: 18px; font-weight: bold;">
                    Obliczanie odległości...
                </div>
            </div>
            <button onclick="closeParentMap()" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">
                ✕ Zamknij
            </button>
        </div>
        
        <div id="parent-location-map" style="flex: 1; width: 100%;"></div>
        
        <div style="background: white; padding: 20px; display: flex; gap: 15px; justify-content: center; box-shadow: 0 -4px 20px rgba(0,0,0,0.2);">
            <button onclick="navigateToParent()" style="flex: 1; max-width: 300px; background: linear-gradient(135deg, #4CAF50, #45a049); color: white; border: none; padding: 15px; border-radius: 10px; font-size: 18px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(76,175,80,0.3);">
                🧭 Prowadź do rodzica
            </button>
            <button onclick="refreshParentLocation()" style="flex: 1; max-width: 300px; background: linear-gradient(135deg, #2196F3, #1976D2); color: white; border: none; padding: 15px; border-radius: 10px; font-size: 18px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(33,150,243,0.3);">
                🔄 Odśwież lokalizację
            </button>
        </div>
    `;
    
    return container;
}

/**
 * 📊 UPDATE DISTANCE DISPLAY
 */
function updateDistanceDisplay(distance, age) {
    const display = document.getElementById('parent-distance-display');
    if (display) {
        display.innerHTML = `
            <div style="display: flex; align-items: center; gap: 20px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 24px;">📏</span>
                    <span>Odległość: <strong>${distance}</strong></span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 24px;">⏰</span>
                    <span>Aktualizacja: <strong>${age}</strong></span>
                </div>
            </div>
        `;
    }
}

/**
 * ❌ SHOW NO PARENT MESSAGE
 */
function showNoParentMessage() {
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 100002;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    container.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 40px; max-width: 500px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
            <div style="font-size: 80px; margin-bottom: 20px;">👨‍👩‍👧</div>
            <h2 style="color: #333; margin-bottom: 15px;">Nie można znaleźć rodzica</h2>
            <p style="color: #666; margin-bottom: 25px; font-size: 16px;">
                Rodzic nie udostępnia lokalizacji lub dane są niedostępne.
            </p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button onclick="this.parentElement.parentElement.parentElement.remove(); tryHomeNavigation();" 
                    style="flex: 1; background: #2196F3; color: white; border: none; padding: 15px 30px; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer;">
                    🏠 Wróć do domu
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove();" 
                    style="flex: 1; background: #f44336; color: white; border: none; padding: 15px 30px; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer;">
                    ✕ Zamknij
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(container);
}

/**
 * ✕ CLOSE PARENT MAP
 */
function closeParentMap() {
    const container = document.getElementById('parent-map-container');
    if (container) {
        container.remove();
    }
    
    if (parentMap) {
        parentMap.remove();
        parentMap = null;
        parentMarker = null;
        childMarker = null;
    }
    
    console.log('🗺️ Parent map closed');
}

/**
 * 🔄 REFRESH PARENT LOCATION
 */
async function refreshParentLocation() {
    console.log('🔄 Refreshing parent location...');
    
    try {
        // Get current child position
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0 // Force fresh location
            });
        });
        
        // Close old map
        closeParentMap();
        
        // Show new map with updated data
        await showParentOnMap(position.coords.latitude, position.coords.longitude);
        
    } catch (error) {
        console.error('❌ Failed to refresh location:', error);
        alert('Nie udało się odświeżyć lokalizacji. Sprawdź uprawnienia GPS.');
    }
}

/**
 * 🚀 SHOW PARENT MAP FROM BUTTON
 * Called from "Znajdź mamę/tatę" button
 */
async function showParentMapFromButton() {
    console.log('🚀 Show parent map from button...');
    
    try {
        // Get child location
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            });
        });
        
        await showParentOnMap(position.coords.latitude, position.coords.longitude);
        
    } catch (error) {
        console.error('❌ Failed to get location:', error);
        alert('Nie udało się określić Twojej lokalizacji. Sprawdź uprawnienia GPS.');
    }
}

console.log('✅ Parent Map Display module loaded');

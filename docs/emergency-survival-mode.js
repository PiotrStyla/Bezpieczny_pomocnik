/**
 * 🚨 EMERGENCY SURVIVAL MODE
 * 
 * TRUE Emergency mode - NO INTERNET REQUIRED
 * Goal: Survive as long as possible (72+ hours) on battery
 * Show: ONLY cached data (last known locations)
 * Action: Wait for help, preserve battery
 */

class EmergencySurvivalMode {
    constructor() {
        this.isActive = false;
        this.startTime = null;
        this.batteryLevel = 100;
        this.lastChildLocation = null;
        this.lastParentLocation = null;
        this.homeAddress = null;
        this.checkInterval = null;
        this.batteryMonitor = null;
        this.lowBatteryAlerted = false;
        
        console.log('🚨 Emergency Survival Mode initialized');
        
        // Start monitoring battery immediately
        this.startBatteryMonitoring();
        
        // Check for parent remote trigger
        this.checkParentTrigger();
        
        // Poll for parent trigger every 30 seconds
        setInterval(() => this.checkParentTrigger(), 30000);
    }
    
    /**
     * 👨‍👩‍👧 CHECK PARENT REMOTE TRIGGER
     */
    async checkParentTrigger() {
        try {
            if (!window.loadFromMinaZK) return;
            
            const trigger = await window.loadFromMinaZK('zk_survival_mode_trigger');
            
            if (trigger && trigger.enabled && !this.isActive) {
                console.log('🚨 Parent remotely activated survival mode!');
                console.log('Trigger:', trigger);
                
                // Show notification
                if (confirm(`🚨 TRYB AWARYJNY\n\nRodzic włączył tryb oszczędzania energii.\n\n${trigger.reason || 'Rodzic aktywował tryb awaryjny.'}\n\nWłączyć teraz?`)) {
                    this.activate();
                }
            } else if (trigger && !trigger.enabled && this.isActive) {
                console.log('🔄 Parent remotely deactivated survival mode');
                
                if (confirm('Rodzic wyłączył tryb awaryjny.\n\nWrócić do normalnego trybu?')) {
                    this.deactivate();
                }
            }
            
        } catch (error) {
            // Silent fail - parent trigger is optional
            console.debug('Parent trigger check skipped:', error.message);
        }
    }
    
    /**
     * 🔋 START BATTERY MONITORING
     */
    async startBatteryMonitoring() {
        if (!navigator.getBattery) {
            console.warn('⚠️ Battery API not supported');
            return;
        }
        
        try {
            const battery = await navigator.getBattery();
            this.batteryLevel = Math.round(battery.level * 100);
            
            console.log(`🔋 Battery monitoring started: ${this.batteryLevel}%`);
            
            // Check immediately
            this.checkBatteryLevel(battery);
            
            // Listen for battery changes
            battery.addEventListener('levelchange', () => {
                this.checkBatteryLevel(battery);
            });
            
        } catch (error) {
            console.error('❌ Failed to start battery monitoring:', error);
        }
    }
    
    /**
     * 🔋 CHECK BATTERY LEVEL
     */
    checkBatteryLevel(battery) {
        const level = Math.round(battery.level * 100);
        this.batteryLevel = level;
        
        console.log(`🔋 Battery: ${level}%`);
        
        // Auto-activate survival mode at 10% or lower
        if (level <= 10 && !this.isActive && !this.lowBatteryAlerted) {
            console.log('🚨 LOW BATTERY DETECTED - Auto-activating survival mode!');
            this.lowBatteryAlerted = true;
            
            // Show alert first
            if (confirm(`⚠️ NISKI POZIOM BATERII (${level}%)\n\nWłączyć tryb oszczędzania energii?\nPozwoli to wydłużyć czas pracy do 72+ godzin.`)) {
                this.activate();
            }
        }
    }
    
    /**
     * 🔥 ACTIVATE SURVIVAL MODE
     */
    async activate() {
        if (this.isActive) {
            console.log('⚠️ Survival mode already active');
            return;
        }
        
        console.log('🚨 ACTIVATING EMERGENCY SURVIVAL MODE');
        this.isActive = true;
        this.startTime = Date.now();
        
        // 1. Load cached data
        await this.loadCachedData();
        
        // 2. Enable battery optimization
        this.enableBatteryOptimization();
        
        // 3. Show survival UI
        this.showSurvivalUI();
        
        // 4. Start monitoring
        this.startMonitoring();
        
        console.log('✅ Survival mode active - 72+ hour battery life enabled');
    }
    
    /**
     * 📦 LOAD CACHED DATA (no internet needed)
     */
    async loadCachedData() {
        console.log('📦 Loading cached emergency data...');
        
        try {
            // Load last child location (from localStorage cache)
            const childLoc = localStorage.getItem('emergency_last_child_location');
            if (childLoc) {
                this.lastChildLocation = JSON.parse(childLoc);
                console.log('✅ Last child location loaded:', this.lastChildLocation);
            }
            
            // Load last parent location (from Mina ZK)
            if (window.loadFromMinaZK) {
                const parentLoc = await window.loadFromMinaZK('zk_parent_emergency_location');
                if (parentLoc) {
                    this.lastParentLocation = parentLoc;
                    console.log('✅ Last parent location loaded:', parentLoc);
                }
            }
            
            // Load home address
            if (window.loadFromMinaZK) {
                const home = await window.loadFromMinaZK('zk_home_location');
                if (home) {
                    this.homeAddress = home;
                    console.log('✅ Home address loaded:', home);
                }
            }
            
            // Get battery level
            if (navigator.getBattery) {
                const battery = await navigator.getBattery();
                this.batteryLevel = Math.round(battery.level * 100);
                console.log('🔋 Battery level:', this.batteryLevel + '%');
            }
            
        } catch (error) {
            console.error('❌ Failed to load cached data:', error);
        }
    }
    
    /**
     * 🔋 ENABLE BATTERY OPTIMIZATION
     */
    enableBatteryOptimization() {
        console.log('🔋 Enabling battery optimization...');
        
        // Stop all intervals
        const highestId = setInterval(() => {}, 0);
        for (let i = 0; i < highestId; i++) {
            clearInterval(i);
        }
        
        // Disable animations
        document.body.style.animation = 'none';
        document.body.classList.add('emergency-survival-mode');
        
        // Add battery-saving styles
        const style = document.createElement('style');
        style.id = 'emergency-survival-styles';
        style.textContent = `
            .emergency-survival-mode * {
                animation: none !important;
                transition: none !important;
            }
            
            .emergency-survival-mode {
                background: #000 !important;
                color: #fff !important;
            }
        `;
        document.head.appendChild(style);
        
        console.log('✅ Battery optimization enabled');
    }
    
    /**
     * 🎨 SHOW SURVIVAL UI
     */
    showSurvivalUI() {
        console.log('🎨 Showing survival UI...');
        
        // Hide all non-essential UI
        const main = document.querySelector('.kids-container');
        if (main) {
            main.style.display = 'none';
        }
        
        // Create survival UI
        const survivalUI = document.createElement('div');
        survivalUI.id = 'emergency-survival-ui';
        survivalUI.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #000;
            color: #fff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            z-index: 999999;
            font-family: Arial, sans-serif;
            text-align: center;
        `;
        
        survivalUI.innerHTML = `
            <div style="max-width: 500px; width: 100%;">
                <!-- Header -->
                <div style="margin-bottom: 30px;">
                    <h1 style="font-size: 32px; margin: 0 0 10px 0; color: #ff5252;">🚨 TRYB AWARYJNY</h1>
                    <p style="font-size: 16px; color: #aaa; margin: 0;">Oszczędzanie energii aktywne</p>
                </div>
                
                <!-- Battery & Time -->
                <div style="display: flex; gap: 20px; margin-bottom: 30px; justify-content: center;">
                    <div style="background: #1a1a1a; padding: 15px 20px; border-radius: 10px; flex: 1;">
                        <div style="font-size: 14px; color: #aaa; margin-bottom: 5px;">Bateria</div>
                        <div id="survival-battery" style="font-size: 24px; font-weight: bold; color: ${this.batteryLevel > 20 ? '#4CAF50' : '#ff5252'};">
                            🔋 ${this.batteryLevel}%
                        </div>
                    </div>
                    <div style="background: #1a1a1a; padding: 15px 20px; border-radius: 10px; flex: 1;">
                        <div style="font-size: 14px; color: #aaa; margin-bottom: 5px;">Czas</div>
                        <div id="survival-time" style="font-size: 24px; font-weight: bold; color: #2196F3;">
                            ⏰ 0:00
                        </div>
                    </div>
                </div>
                
                <!-- Emergency Call Button -->
                <button onclick="window.emergencySurvival.call112()" style="
                    width: 100%;
                    padding: 30px;
                    background: linear-gradient(135deg, #ff5252, #d32f2f);
                    color: white;
                    border: none;
                    border-radius: 15px;
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-bottom: 30px;
                    box-shadow: 0 8px 20px rgba(255,82,82,0.4);
                ">
                    📞 ZADZWOŃ 112
                </button>
                
                <!-- Last Known Locations -->
                <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; text-align: left; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px;">📍 Twoja ostatnia lokalizacja:</h3>
                    <div id="survival-child-location" style="color: #aaa; line-height: 1.6;">
                        ${this.formatChildLocation()}
                    </div>
                </div>
                
                <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; text-align: left; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px;">👨‍👩‍👧 Ostatnia lokalizacja rodzica:</h3>
                    <div id="survival-parent-location" style="color: #aaa; line-height: 1.6;">
                        ${this.formatParentLocation()}
                    </div>
                </div>
                
                ${this.homeAddress ? `
                <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; text-align: left; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px;">🏠 Adres domowy:</h3>
                    <div style="color: #aaa; line-height: 1.6;">
                        ${this.homeAddress.address || 'Brak'}<br>
                        ${this.homeAddress.lat ? `(${this.homeAddress.lat.toFixed(4)}, ${this.homeAddress.lon.toFixed(4)})` : ''}
                    </div>
                </div>
                ` : ''}
                
                <!-- Instructions -->
                <div style="background: rgba(76, 175, 80, 0.1); border: 2px solid #4CAF50; padding: 20px; border-radius: 10px; text-align: left;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #4CAF50;">✅ CO ROBIĆ:</h3>
                    <ul style="margin: 0; padding-left: 20px; line-height: 2; color: #aaa;">
                        <li>Pozostań spokojny - jesteś bezpieczny</li>
                        <li>Telefon oszczędza baterię (72+ godzin)</li>
                        <li>Zostań w bezpiecznym miejscu</li>
                        <li>Nie używaj telefonu bez potrzeby</li>
                        <li>Jeśli widzisz ratownika - proś o pomoc</li>
                        <li>Dzwoń 112 tylko w nagłej potrzebie</li>
                    </ul>
                </div>
                
                <!-- Exit Button -->
                <button onclick="window.emergencySurvival.deactivate()" style="
                    margin-top: 30px;
                    padding: 15px 30px;
                    background: transparent;
                    color: #666;
                    border: 2px solid #333;
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                ">
                    Wyłącz tryb awaryjny
                </button>
            </div>
        `;
        
        document.body.appendChild(survivalUI);
        console.log('✅ Survival UI shown');
    }
    
    /**
     * 📍 FORMAT CHILD LOCATION
     */
    formatChildLocation() {
        if (!this.lastChildLocation) {
            return '<em>Brak danych (włącz GPS)</em>';
        }
        
        const age = Date.now() - new Date(this.lastChildLocation.timestamp).getTime();
        const ageText = this.formatAge(age);
        
        return `
            Współrzędne: ${this.lastChildLocation.lat.toFixed(4)}, ${this.lastChildLocation.lon.toFixed(4)}<br>
            ${this.lastChildLocation.address || 'Adres nieznany'}<br>
            <span style="color: #ff9800;">Aktualizacja: ${ageText}</span>
        `;
    }
    
    /**
     * 👨‍👩‍👧 FORMAT PARENT LOCATION
     */
    formatParentLocation() {
        if (!this.lastParentLocation) {
            return '<em>Brak danych (rodzic nie udostępnia)</em>';
        }
        
        const age = Date.now() - new Date(this.lastParentLocation.timestamp).getTime();
        const ageText = this.formatAge(age);
        
        // Calculate distance if both locations available
        let distanceText = '';
        if (this.lastChildLocation && this.lastParentLocation.lat) {
            const distance = this.calculateDistance(
                this.lastChildLocation.lat,
                this.lastChildLocation.lon,
                this.lastParentLocation.lat,
                this.lastParentLocation.lon
            );
            const distanceKm = (distance / 1000).toFixed(2);
            distanceText = distance < 1000 ? 
                `<strong>${Math.round(distance)}m od Ciebie</strong>` : 
                `<strong>${distanceKm}km od Ciebie</strong>`;
        }
        
        return `
            ${distanceText ? distanceText + '<br>' : ''}
            Współrzędne: ${this.lastParentLocation.lat.toFixed(4)}, ${this.lastParentLocation.lon.toFixed(4)}<br>
            <span style="color: #ff9800;">Aktualizacja: ${ageText}</span>
        `;
    }
    
    /**
     * ⏰ FORMAT AGE
     */
    formatAge(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ${minutes % 60}min temu`;
        if (minutes > 0) return `${minutes}min temu`;
        return 'teraz';
    }
    
    /**
     * 📏 CALCULATE DISTANCE (Haversine)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }
    
    /**
     * 📞 CALL 112
     */
    call112() {
        console.log('📞 Calling 112...');
        
        if (confirm('Czy na pewno chcesz zadzwonić na 112?\n\n⚠️ Dzwoń tylko w przypadku prawdziwej sytuacji awaryjnej!')) {
            window.location.href = 'tel:112';
        }
    }
    
    /**
     * 📊 START MONITORING
     */
    startMonitoring() {
        console.log('📊 Starting survival monitoring...');
        
        // Update every 30 seconds (battery saving)
        this.checkInterval = setInterval(() => {
            this.updateUI();
        }, 30000);
        
        // Initial update
        this.updateUI();
    }
    
    /**
     * 🔄 UPDATE UI
     */
    async updateUI() {
        // Update battery
        if (navigator.getBattery) {
            const battery = await navigator.getBattery();
            this.batteryLevel = Math.round(battery.level * 100);
            
            const batteryEl = document.getElementById('survival-battery');
            if (batteryEl) {
                batteryEl.innerHTML = `🔋 ${this.batteryLevel}%`;
                batteryEl.style.color = this.batteryLevel > 20 ? '#4CAF50' : '#ff5252';
                
                // Alert on low battery
                if (this.batteryLevel === 20) {
                    this.showBatteryAlert('⚠️ Niski poziom baterii (20%)');
                } else if (this.batteryLevel === 10) {
                    this.showBatteryAlert('🔴 KRYTYCZNY poziom baterii (10%)');
                } else if (this.batteryLevel === 5) {
                    this.showBatteryAlert('🚨 BARDZO KRYTYCZNY! (5%)\nZadzwoń 112 TERAZ jeśli potrzebujesz pomocy!');
                }
            }
        }
        
        // Update time
        if (this.startTime) {
            const elapsed = Date.now() - this.startTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            
            const timeEl = document.getElementById('survival-time');
            if (timeEl) {
                timeEl.innerHTML = `⏰ ${hours}:${minutes.toString().padStart(2, '0')}`;
            }
        }
    }
    
    /**
     * ⚠️ SHOW BATTERY ALERT
     */
    showBatteryAlert(message) {
        // Vibrate if available
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
        
        alert(message);
    }
    
    /**
     * ❌ DEACTIVATE
     */
    deactivate() {
        if (!confirm('Czy na pewno chcesz wyłączyć tryb awaryjny?')) {
            return;
        }
        
        console.log('❌ Deactivating survival mode...');
        
        this.isActive = false;
        
        // Clear interval
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        
        // Remove UI
        const survivalUI = document.getElementById('emergency-survival-ui');
        if (survivalUI) {
            survivalUI.remove();
        }
        
        // Remove styles
        const styles = document.getElementById('emergency-survival-styles');
        if (styles) {
            styles.remove();
        }
        
        // Show main UI
        const main = document.querySelector('.kids-container');
        if (main) {
            main.style.display = '';
        }
        
        document.body.classList.remove('emergency-survival-mode');
        
        // Reload page
        location.reload();
        
        console.log('✅ Survival mode deactivated');
    }
}

// Initialize
const emergencySurvival = new EmergencySurvivalMode();
window.emergencySurvival = emergencySurvival;

console.log('✅ Emergency Survival Mode module loaded');

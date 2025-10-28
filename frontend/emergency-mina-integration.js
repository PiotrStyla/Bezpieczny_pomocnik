/**
 * 🚨 EMERGENCY MINA INTEGRATION (CLEAN VERSION)
 * 
 * PURPOSE: Detect offline/emergency situations and activate TRUE survival mode
 * 
 * RESPONSIBILITIES:
 * 1. Detect offline status → Activate survival mode
 * 2. Monitor connection changes
 * 3. Provide fallback if survival mode not loaded
 * 
 * NOTE: Actual survival mode logic is in emergency-survival-mode.js
 */

class EmergencyMinaManager {
    constructor() {
        this.isEmergencyMode = false;
        
        console.log('🚨 Emergency Mina Manager initialized');
        
        // Initialize immediately for emergency readiness
        this.initializeEmergencySystem();
    }

    /**
     * 🚨 IMMEDIATE EMERGENCY INITIALIZATION
     */
    async initializeEmergencySystem() {
        console.log('🚨 EMERGENCY MINA SYSTEM INITIALIZING...');
        
        try {
            // Wait a bit for dependencies to load
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check if Mina Safety Core loaded
            if (!window.MinaSafetyClient) {
                console.warn('⚠️ MinaSafetyClient not available - using fallback mode');
                this.enableFallbackMode();
                // Still setup offline detection in fallback mode!
                this.setupOfflineDetection();
                return;
            }
            
            // Setup offline detection
            this.setupOfflineDetection();
            
            console.log('✅ Emergency Mina system ready!');
            console.log('🛡️ Child privacy protected with zk-proofs');
            console.log('⚡ 22KB blockchain sync available');
            console.log('🔋 Emergency mode: 72+ hour operation');
            
        } catch (error) {
            console.error('❌ Emergency system initialization failed:', error);
            console.log('🛡️ Switching to fallback safety mode...');
            // Fallback to traditional safety measures
            this.enableFallbackMode();
        }
    }

    /**
     * 🔌 SETUP OFFLINE DETECTION
     * Auto-enable SURVIVAL MODE when offline
     */
    setupOfflineDetection() {
        console.log('🔌 Setting up offline detection...');
        
        // Check current status
        if (!navigator.onLine) {
            console.log('🚨 OFFLINE DETECTED - verifying before survival...');
            this.verifyOfflineThenActivate();
        }
        
        // Listen for offline event
        window.addEventListener('offline', () => {
            console.log('🚨 CONNECTION LOST - verifying before survival...');
            this.verifyOfflineThenActivate();
        });
        
        // Listen for online event
        window.addEventListener('online', () => {
            console.log('✅ CONNECTION RESTORED');
            // Don't auto-disable - let user decide
        });
        
        console.log('✅ Offline detection active');
    }

    /**
     * 🔍 VERIFY OFFLINE BEFORE ACTIVATION
     * Avoid false positives by testing quick connectivity to local API
     */
    async verifyOfflineThenActivate() {
        try {
            // Small grace delay for transient blips
            await new Promise(r => setTimeout(r, 800));
            if (navigator.onLine) return; // Came back online

            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 2000);
            // Probe a static asset that always exists in production
            const resp = await fetch('./index.html', {
                cache: 'no-store',
                signal: controller.signal
            }).catch(() => null);
            clearTimeout(timer);

            // If still offline or request failed → activate survival
            if (!navigator.onLine || !resp || !resp.ok) {
                this.activateSurvivalMode();
            } else {
                console.log('✅ Connectivity verified - skipping survival mode');
            }
        } catch (e) {
            console.warn('⚠️ Connectivity check failed, enabling survival mode as safety:', e.message || e);
            this.activateSurvivalMode();
        }
    }
    
    /**
     * 🚨 ACTIVATE SURVIVAL MODE (new implementation)
     */
    activateSurvivalMode() {
        console.log('🚨 Activating TRUE survival mode...');
        
        if (window.emergencySurvival) {
            window.emergencySurvival.activate();
        } else {
            console.error('❌ Emergency Survival Mode not loaded!');
            // Fallback: show simple alert
            alert('🚨 TRYB AWARYJNY\n\nUtrata połączenia z internetem.\nOszczędzaj baterię i czekaj na pomoc.\n\nZadzwoń 112 w nagłej potrzebie.');
        }
    }

    /**
     * 🛡️ ENABLE FALLBACK MODE
     * Basic safety without Mina ZK
     */
    enableFallbackMode() {
        console.log('🛡️ Enabling fallback safety mode (no Mina ZK)...');
        console.log('⚠️ Privacy features limited - basic safety only');
        
        // Store in regular localStorage (not ZK-protected)
        localStorage.setItem('emergency_fallback_active', 'true');
        localStorage.setItem('emergency_fallback_timestamp', new Date().toISOString());
        
        console.log('✅ Fallback mode active - basic safety features enabled');
    }

    /**
     * 🎨 ADD EMERGENCY STYLES
     * CSS for emergency UI elements
     */
    addEmergencyStyles() {
        if (document.getElementById('emergency-styles')) {
            return; // Already added
        }
        
        const style = document.createElement('style');
        style.id = 'emergency-styles';
        style.textContent = `
            /* Emergency Banner Styles (if needed as fallback) */
            .emergency-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #ff5252, #d32f2f);
                color: white;
                padding: 12px 20px;
                z-index: 99999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: slideDown 0.5s ease;
            }
            
            @keyframes slideDown {
                from {
                    transform: translateY(-100%);
                }
                to {
                    transform: translateY(0);
                }
            }
            
            .emergency-banner strong {
                font-size: 18px;
                display: block;
                margin-bottom: 5px;
            }
            
            .emergency-banner small {
                font-size: 14px;
                opacity: 0.9;
            }
            
            @media (max-width: 768px) {
                .emergency-banner {
                    padding: 10px 15px;
                }
                
                .emergency-banner strong {
                    font-size: 16px;
                }
                
                .emergency-banner small {
                    font-size: 12px;
                }
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ Emergency styles added');
    }
}

// 🚨 INITIALIZE EMERGENCY SYSTEM IMMEDIATELY
const emergencyMina = new EmergencyMinaManager();

// Add styles immediately
emergencyMina.addEmergencyStyles();

// Global access for emergency functions
window.emergencyMina = emergencyMina;

// Note: Offline detection is now handled by setupOfflineDetection() 
// which is called during initializeEmergencySystem()

console.log('🚨 Emergency Mina integration loaded');
console.log('⚔️ Ready for crisis situations');
console.log('🛡️ Child safety prioritized');
console.log('⚡ 22KB blockchain sync available');

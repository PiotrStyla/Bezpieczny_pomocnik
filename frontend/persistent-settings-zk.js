/**
 * 🔒 PERSISTENT SETTINGS ZK STORAGE
 * Bezpieczne przechowywanie ustawień dziecka między sesjami
 * Copyright (c) 2025 Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie
 */

class PersistentSettingsZK {
    constructor() {
        this.zkStorage = null;
        this.settingsKey = 'child_app_settings';
        this.initialized = false;
        this.defaultSettings = {
            language: 'pl',
            soundEnabled: true,
            locationPermission: false,
            lastUsed: null,
            alertPreferences: {
                weather: true,
                safety: true,
                emergency: true
            },
            accessibility: {
                highContrast: false,
                largeText: false,
                speechEnabled: true
            }
        };
    }

    /**
     * 🚀 INITIALIZE ZK STORAGE
     */
    async init() {
        if (this.initialized) return true;

        try {
            // Import Enhanced Security ZK if available
            if (window.EnhancedSecurityZK) {
                this.zkStorage = window.EnhancedSecurityZK;
                await this.zkStorage.generateAppKey(); // Ensure encryption key exists
                console.log('✅ ZK Storage initialized for persistent settings');
            } else {
                console.warn('⚠️ Enhanced Security ZK not available - using fallback');
                this.zkStorage = null;
            }

            this.initialized = true;
            return true;

        } catch (error) {
            console.error('❌ Failed to initialize persistent settings:', error);
            return false;
        }
    }

    /**
     * 💾 SAVE CHILD SETTINGS
     * Bezpieczne zapisywanie ustawień z Zero-Knowledge encryption
     */
    async saveSettings(settings) {
        try {
            await this.init();

            const settingsToSave = {
                ...this.defaultSettings,
                ...settings,
                lastUsed: new Date().toISOString(),
                version: '1.0'
            };

            if (this.zkStorage) {
                // Use ZK encryption
                const success = await this.zkStorage.saveSecureZK(this.settingsKey, settingsToSave);
                if (success) {
                    console.log('✅ Child settings saved securely with ZK encryption');
                    return true;
                }
            }

            // Fallback to localStorage with basic obfuscation
            const obfuscated = this.obfuscateData(settingsToSave);
            localStorage.setItem(`zk_${this.settingsKey}`, JSON.stringify(obfuscated));
            console.log('✅ Child settings saved with basic obfuscation');
            return true;

        } catch (error) {
            console.error('❌ Failed to save child settings:', error);
            return false;
        }
    }

    /**
     * 📖 LOAD CHILD SETTINGS
     * Bezpieczne odczytywanie ustawień z automatyczną migracją
     */
    async loadSettings() {
        try {
            await this.init();

            if (this.zkStorage) {
                // Try ZK decryption first
                const zkSettings = await this.zkStorage.loadSecureZK(this.settingsKey);
                if (zkSettings) {
                    console.log('✅ Child settings loaded from ZK storage');
                    return this.validateSettings(zkSettings);
                }
            }

            // Fallback to localStorage
            const stored = localStorage.getItem(`zk_${this.settingsKey}`);
            if (stored) {
                const obfuscated = JSON.parse(stored);
                const deobfuscated = this.deobfuscateData(obfuscated);
                console.log('✅ Child settings loaded from localStorage');
                return this.validateSettings(deobfuscated);
            }

            // Return defaults if nothing found
            console.log('ℹ️ No stored settings found - using defaults');
            return { ...this.defaultSettings };

        } catch (error) {
            console.error('❌ Failed to load child settings:', error);
            return { ...this.defaultSettings };
        }
    }

    /**
     * 🔄 AUTO-MIGRATE LEGACY SETTINGS
     * Migruje stare ustawienia do ZK systemu
     */
    async migrateLegacySettings() {
        try {
            // Check for old settings in localStorage
            const legacyKeys = ['selectedLanguage', 'soundEnabled', 'lastLocation'];
            const legacySettings = {};

            legacyKeys.forEach(key => {
                const value = localStorage.getItem(key);
                if (value) {
                    legacySettings[key] = JSON.parse(value);
                    localStorage.removeItem(key); // Clean up
                }
            });

            if (Object.keys(legacySettings).length > 0) {
                console.log('🔄 Migrating legacy settings to ZK storage...');
                
                const newSettings = {
                    language: legacySettings.selectedLanguage || 'pl',
                    soundEnabled: legacySettings.soundEnabled !== false,
                    lastUsed: new Date().toISOString()
                };

                await this.saveSettings(newSettings);
                console.log('✅ Legacy settings migrated successfully');
                return newSettings;
            }

        } catch (error) {
            console.error('❌ Failed to migrate legacy settings:', error);
        }

        return null;
    }

    /**
     * ✅ VALIDATE SETTINGS STRUCTURE
     */
    validateSettings(settings) {
        if (!settings || typeof settings !== 'object') {
            return { ...this.defaultSettings };
        }

        return {
            ...this.defaultSettings,
            ...settings,
            // Ensure required fields exist
            language: ['pl', 'en', 'ua'].includes(settings.language) ? settings.language : 'pl',
            soundEnabled: typeof settings.soundEnabled === 'boolean' ? settings.soundEnabled : true,
            locationPermission: typeof settings.locationPermission === 'boolean' ? settings.locationPermission : false
        };
    }

    /**
     * 🔒 BASIC OBFUSCATION (fallback)
     */
    obfuscateData(data) {
        const str = JSON.stringify(data);
        return btoa(str).split('').reverse().join('');
    }

    deobfuscateData(obfuscated) {
        try {
            const reversed = obfuscated.split('').reverse().join('');
            const str = atob(reversed);
            return JSON.parse(str);
        } catch (error) {
            return null;
        }
    }

    /**
     * 🗑️ CLEAR ALL SETTINGS (RODO compliance)
     */
    async clearAllSettings() {
        try {
            await this.init();

            if (this.zkStorage) {
                await this.zkStorage.deleteSecureZK(this.settingsKey);
            }

            localStorage.removeItem(`zk_${this.settingsKey}`);
            console.log('🗑️ All child settings cleared');
            return true;

        } catch (error) {
            console.error('❌ Failed to clear settings:', error);
            return false;
        }
    }

    /**
     * 📊 GET SETTINGS SUMMARY (for debugging)
     */
    async getSettingsSummary() {
        const settings = await this.loadSettings();
        return {
            hasSettings: settings.lastUsed !== null,
            language: settings.language,
            soundEnabled: settings.soundEnabled,
            lastUsed: settings.lastUsed,
            storageType: this.zkStorage ? 'ZK_Encrypted' : 'LocalStorage_Obfuscated'
        };
    }
}

// 🌟 GLOBAL API FOR EASY ACCESS
window.PersistentSettings = new PersistentSettingsZK();

// 🔄 AUTO-INITIALIZE ON PAGE LOAD
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await window.PersistentSettings.migrateLegacySettings();
        console.log('🔄 Persistent settings system ready');
    });
} else {
    // Page already loaded
    setTimeout(async () => {
        await window.PersistentSettings.migrateLegacySettings();
        console.log('🔄 Persistent settings system ready');
    }, 100);
}

/**
 * 🎯 CONVENIENCE FUNCTIONS FOR APP.JS
 */
window.saveChildSetting = async (key, value) => {
    const current = await window.PersistentSettings.loadSettings();
    current[key] = value;
    return await window.PersistentSettings.saveSettings(current);
};

window.loadChildSetting = async (key, defaultValue = null) => {
    const settings = await window.PersistentSettings.loadSettings();
    return settings[key] !== undefined ? settings[key] : defaultValue;
};

window.getChildSettingsSummary = async () => {
    return await window.PersistentSettings.getSettingsSummary();
};


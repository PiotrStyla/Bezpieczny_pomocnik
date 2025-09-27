/**
 * 🔒 ENHANCED SECURITY ZK STORAGE
 * Prawdziwe szyfrowanie AES + izolacja od innych aplikacji
 */

class EnhancedSecurityZK {
    constructor() {
        this.appKey = null;
        this.dbName = 'BezpiecznyPomocnik_SecureDB';
        this.version = 1;
    }

    /**
     * 🔑 GENERATE UNIQUE APP KEY
     * Klucz unikalny dla tej aplikacji + urządzenia
     */
    async generateAppKey() {
        if (this.appKey) return this.appKey;

        try {
            // Próbuj załadować istniejący klucz
            const stored = await this.getFromSecureDB('app_master_key');
            if (stored) {
                this.appKey = await crypto.subtle.importKey(
                    'raw',
                    new Uint8Array(stored),
                    { name: 'AES-GCM' },
                    false,
                    ['encrypt', 'decrypt']
                );
                return this.appKey;
            }

            // Generuj nowy klucz jeśli nie istnieje
            this.appKey = await crypto.subtle.generateKey(
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );

            // Zapisz klucz do bezpiecznego storage
            const exportedKey = await crypto.subtle.exportKey('raw', this.appKey);
            await this.saveToSecureDB('app_master_key', Array.from(new Uint8Array(exportedKey)));

            console.log('🔑 Generated new secure app key');
            return this.appKey;

        } catch (error) {
            console.error('❌ Failed to generate app key:', error);
            throw new Error('Security key generation failed');
        }
    }

    /**
     * 🏪 SECURE DATABASE ACCESS (IndexedDB)
     * Izolowane od innych aplikacji przez origin policy
     */
    async getSecureDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Store dla zaszyfrowanych danych
                if (!db.objectStoreNames.contains('encrypted_data')) {
                    const store = db.createObjectStore('encrypted_data', { keyPath: 'key' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Store dla kluczy
                if (!db.objectStoreNames.contains('keys')) {
                    db.createObjectStore('keys', { keyPath: 'keyId' });
                }
            };
        });
    }

    /**
     * 💾 SAVE TO SECURE DATABASE
     */
    async saveToSecureDB(key, data) {
        const db = await this.getSecureDB();
        const transaction = db.transaction(['encrypted_data'], 'readwrite');
        const store = transaction.objectStore('encrypted_data');

        return new Promise((resolve, reject) => {
            const request = store.put({
                key: key,
                data: data,
                timestamp: Date.now()
            });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * 📖 GET FROM SECURE DATABASE
     */
    async getFromSecureDB(key) {
        const db = await this.getSecureDB();
        const transaction = db.transaction(['encrypted_data'], 'readonly');
        const store = transaction.objectStore('encrypted_data');

        return new Promise((resolve, reject) => {
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.data : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * 🔐 REAL AES ENCRYPTION
     */
    async encryptData(data) {
        const key = await this.generateAppKey();
        const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM needs 12 bytes
        
        const encodedData = new TextEncoder().encode(JSON.stringify(data));
        
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encodedData
        );

        return {
            encrypted: Array.from(new Uint8Array(encrypted)),
            iv: Array.from(iv),
            timestamp: Date.now(),
            integrity: await this.calculateIntegrity(data)
        };
    }

    /**
     * 🔓 REAL AES DECRYPTION
     */
    async decryptData(encryptedPackage) {
        try {
            const key = await this.generateAppKey();
            
            const decrypted = await crypto.subtle.decrypt(
                { 
                    name: 'AES-GCM', 
                    iv: new Uint8Array(encryptedPackage.iv) 
                },
                key,
                new Uint8Array(encryptedPackage.encrypted)
            );

            const jsonString = new TextDecoder().decode(decrypted);
            const data = JSON.parse(jsonString);

            // Verify integrity
            const currentIntegrity = await this.calculateIntegrity(data);
            if (currentIntegrity !== encryptedPackage.integrity) {
                throw new Error('Data integrity check failed');
            }

            return data;

        } catch (error) {
            console.error('❌ Decryption failed:', error);
            return null;
        }
    }

    /**
     * ✅ DATA INTEGRITY CHECK
     */
    async calculateIntegrity(data) {
        const jsonString = JSON.stringify(data);
        const encoded = new TextEncoder().encode(jsonString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * 💾 SECURE SAVE (Public API)
     */
    async saveSecureZK(key, data) {
        try {
            console.log(`🔒 Encrypting and saving: ${key}`);
            
            const encryptedPackage = await this.encryptData(data);
            await this.saveToSecureDB(`zk_secure_${key}`, encryptedPackage);
            
            console.log(`✅ Securely saved: ${key}`);
            return true;

        } catch (error) {
            console.error(`❌ Failed to save securely: ${key}`, error);
            return false;
        }
    }

    /**
     * 📖 SECURE LOAD (Public API)
     */
    async loadSecureZK(key) {
        try {
            console.log(`🔓 Loading and decrypting: ${key}`);
            
            const encryptedPackage = await this.getFromSecureDB(`zk_secure_${key}`);
            if (!encryptedPackage) {
                console.log(`ℹ️ No data found for: ${key}`);
                return null;
            }

            const decryptedData = await this.decryptData(encryptedPackage);
            
            if (decryptedData) {
                console.log(`✅ Successfully decrypted: ${key}`);
            } else {
                console.log(`❌ Failed to decrypt: ${key}`);
            }

            return decryptedData;

        } catch (error) {
            console.error(`❌ Failed to load securely: ${key}`, error);
            return null;
        }
    }

    /**
     * 🗑️ SECURE DELETE
     */
    async deleteSecureZK(key) {
        try {
            const db = await this.getSecureDB();
            const transaction = db.transaction(['encrypted_data'], 'readwrite');
            const store = transaction.objectStore('encrypted_data');

            return new Promise((resolve, reject) => {
                const request = store.delete(`zk_secure_${key}`);
                request.onsuccess = () => {
                    console.log(`🗑️ Securely deleted: ${key}`);
                    resolve(true);
                };
                request.onerror = () => reject(request.error);
            });

        } catch (error) {
            console.error(`❌ Failed to delete: ${key}`, error);
            return false;
        }
    }

    /**
     * 📊 GET STORAGE INFO
     */
    async getStorageInfo() {
        try {
            const db = await this.getSecureDB();
            const transaction = db.transaction(['encrypted_data'], 'readonly');
            const store = transaction.objectStore('encrypted_data');

            return new Promise((resolve, reject) => {
                const request = store.count();
                request.onsuccess = () => {
                    resolve({
                        totalEntries: request.result,
                        securityLevel: 'AES-256-GCM',
                        storageType: 'IndexedDB (Origin-isolated)',
                        integrityCheck: 'SHA-256'
                    });
                };
                request.onerror = () => reject(request.error);
            });

        } catch (error) {
            console.error('❌ Failed to get storage info:', error);
            return null;
        }
    }
}

// 🌍 GLOBAL INSTANCE
window.EnhancedSecurityZK = new EnhancedSecurityZK();

// 🔧 COMPATIBILITY WRAPPERS
window.saveToMinaZK = async (key, data) => {
    return await window.EnhancedSecurityZK.saveSecureZK(key, data);
};

window.loadFromMinaZK = async (key) => {
    return await window.EnhancedSecurityZK.loadSecureZK(key);
};

window.deleteFromMinaZK = async (key) => {
    return await window.EnhancedSecurityZK.deleteSecureZK(key);
};

console.log('🔒 Enhanced Security ZK Storage loaded');
console.log('📊 Use window.EnhancedSecurityZK.getStorageInfo() to check security status');

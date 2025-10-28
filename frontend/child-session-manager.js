/**
 * 🧒 CHILD SESSION MANAGER - Multi-Child Support
 * Ensures data separation between siblings for RODO Art. 8 compliance
 * Copyright (c) 2025 Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie
 */

class ChildSessionManager {
    constructor() {
        this.currentChildId = null;
        this.childProfiles = new Map();
    }

    /**
     * 🆔 GET CURRENT CHILD ID
     * Checks URL params, localStorage, or requests parent selection
     */
    async getCurrentChildId() {
        // 1. Check URL parameter first (parent can direct link)
        const urlParams = new URLSearchParams(window.location.search);
        let childId = urlParams.get('child');
        
        if (childId) {
            console.log(`🧒 Child ID from URL: ${childId}`);
            localStorage.setItem('current_child_id', childId);
            this.currentChildId = childId;
            return childId;
        }
        
        // 2. Check localStorage (returning child)
        childId = localStorage.getItem('current_child_id');
        if (childId) {
            console.log(`🧒 Child ID from localStorage: ${childId}`);
            this.currentChildId = childId;
            return childId;
        }

        // 2.5 Try auto-select from ZK profiles (when returning from CMS)
        try {
            if (window.loadFromMinaZK) {
                const rawProfiles = await window.loadFromMinaZK('zk_family_children_profiles') || {};
                let children = [];
                if (Array.isArray(rawProfiles)) {
                    children = rawProfiles.filter(Boolean);
                } else if (rawProfiles && typeof rawProfiles === 'object') {
                    children = Object.values(rawProfiles);
                }

                if (children.length === 1 && children[0]?.id) {
                    const onlyChild = children[0];
                    console.log(`🧒 Auto-selected only child from ZK: ${onlyChild.id}`);
                    // Persist selection locally and update last access for UX
                    localStorage.setItem('current_child_id', onlyChild.id);
                    this.currentChildId = onlyChild.id;
                    try {
                        // Update lastAccess if profiles are stored as object
                        if (!Array.isArray(rawProfiles) && onlyChild.id in rawProfiles) {
                            rawProfiles[onlyChild.id].lastAccess = new Date().toISOString();
                            await window.saveToMinaZK('zk_family_children_profiles', rawProfiles);
                        }
                    } catch (e) {
                        console.warn('⚠️ Failed to update lastAccess in ZK:', e);
                    }
                    return onlyChild.id;
                }

                if (children.length > 1) {
                    // Prefer most recently used
                    const sorted = children
                        .filter(c => c && c.id)
                        .sort((a, b) => new Date(b.lastAccess || b.created || 0) - new Date(a.lastAccess || a.created || 0));
                    if (sorted[0]?.id) {
                        const recent = sorted[0];
                        console.log(`🧒 Auto-selected last used child from ZK: ${recent.id}`);
                        localStorage.setItem('current_child_id', recent.id);
                        this.currentChildId = recent.id;
                        return recent.id;
                    }
                }
            }
        } catch (e) {
            console.warn('⚠️ Auto-select from ZK failed, falling back to modal:', e);
        }
        
        // 3. No child ID - request parent selection
        console.log('🧒 No child ID found - requesting parent selection');
        childId = await this.requestChildSelection();
        
        if (childId) {
            localStorage.setItem('current_child_id', childId);
            this.currentChildId = childId;
        }
        
        return childId;
    }

    /**
     * 👨‍👩‍👧‍👦 REQUEST CHILD SELECTION FROM PARENT
     * Shows modal for parent to select which child is using the app
     */
    async requestChildSelection() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'child-selection-modal';
            
            // 🔧 CRITICAL: Immediately enable interaction in case parental consent is blurring
            setTimeout(() => {
                modal.style.pointerEvents = 'auto';
                modal.style.filter = 'none';
                
                // Enable all inputs
                const inputs = modal.querySelectorAll('input, button, select, textarea');
                inputs.forEach(input => {
                    input.style.pointerEvents = 'auto';
                    input.disabled = false;
                    input.readOnly = false;
                    input.style.filter = 'none';
                    console.log(`🔧 Child Modal: Enabled ${input.id || input.type} input`);
                });
                
                console.log('🧒 Child Selection Modal: ALL INPUTS FORCE ENABLED');
            }, 50);
            
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000000;
                font-family: 'Comic Neue', sans-serif;
            `;
            
            modal.innerHTML = `
                <div style="background: white; border-radius: 20px; padding: 40px; max-width: 500px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    <h2 style="color: #2c3e50; margin-bottom: 20px;">👨‍👩‍👧‍👦 Wybór Dziecka</h2>
                    <p style="color: #7f8c8d; margin-bottom: 30px; font-size: 16px;">
                        <strong>Które dziecko będzie korzystać z aplikacji?</strong><br>
                        Każde dziecko ma osobny, bezpieczny profil zgodny z RODO Art. 8
                    </p>
                    
                    <div class="child-profiles" style="margin: 30px 0;">
                        <div class="new-child-section" style="margin-bottom: 20px;">
                            <input type="text" id="child-name" placeholder="Imię dziecka" 
                                   style="padding: 12px; border: 2px solid #3498db; border-radius: 10px; font-size: 16px; width: 200px; margin-right: 10px;">
                            <input type="text" id="child-selection-age" placeholder="Wiek (6-15)" maxlength="2"
                                   style="padding: 12px; border: 2px solid #3498db; border-radius: 10px; font-size: 16px; width: 80px;">
                        </div>
                        
                        <button id="create-child-btn" style="
                            background: #27ae60; 
                            color: white; 
                            border: none; 
                            padding: 15px 30px; 
                            border-radius: 10px; 
                            font-size: 16px; 
                            cursor: pointer;
                            margin: 10px;
                            transition: all 0.3s ease;
                        ">
                            ➕ Utwórz Nowy Profil
                        </button>
                    </div>
                    
                    <div id="existing-children" style="max-height: 200px; overflow-y: auto;">
                        <p style="color: #7f8c8d; font-size: 14px;">Ładowanie istniejących profili...</p>
                    </div>
                    
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ecf0f1;">
                    
                    <p style="color: #e74c3c; font-size: 12px; margin-top: 20px;">
                        ⚠️ <strong>UWAGA:</strong> Każde dziecko musi mieć osobny profil.<br>
                        Nie wolno mieszać danych między dziećmi (RODO Art. 8).
                    </p>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Load existing children
            this.loadExistingChildren().then(children => {
                const container = document.getElementById('existing-children');
                if (children.length === 0) {
                    container.innerHTML = '<p style="color: #7f8c8d; font-size: 14px;">Brak istniejących profili</p>';
                } else {
                    container.innerHTML = children.map(child => `
                        <button class="select-child-btn" data-child-id="${child.id}" style="
                            background: #3498db; 
                            color: white; 
                            border: none; 
                            padding: 12px 20px; 
                            border-radius: 8px; 
                            margin: 5px; 
                            cursor: pointer;
                            font-size: 14px;
                        ">
                            👶 ${child.name} (${child.age} lat)
                        </button>
                    `).join('');
                    
                    // Add click handlers for existing children
                    document.querySelectorAll('.select-child-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const childId = e.target.getAttribute('data-child-id');
                            modal.remove();
                            resolve(childId);
                        });
                    });
                }
            });
            
            // 🔧 ENSURE INPUTS ARE ALWAYS ENABLED
            const nameInput = document.getElementById('child-name');
            const ageInput = document.getElementById('child-selection-age');
            
            [nameInput, ageInput].forEach(input => {
                if (input) {
                    // Force enable on focus
                    input.addEventListener('focus', () => {
                        input.style.pointerEvents = 'auto';
                        input.disabled = false;
                        input.readOnly = false;
                        input.style.filter = 'none';
                        console.log(`🔧 Input focused: ${input.id} - force enabled`);
                    });
                    
                    // Force enable on click
                    input.addEventListener('click', () => {
                        input.style.pointerEvents = 'auto';
                        input.disabled = false;
                        input.readOnly = false;
                        input.style.filter = 'none';
                        console.log(`🔧 Input clicked: ${input.id} - force enabled`);
                    });
                }
            });
            
            // Create new child handler
            document.getElementById('create-child-btn').addEventListener('click', async () => {
                const name = document.getElementById('child-name').value.trim();
                const ageValue = document.getElementById('child-selection-age').value.trim();
                const age = parseInt(ageValue);
                
                // 🧪 AGGRESSIVE DEBUG VALIDATION
                const nameField = document.getElementById('child-name');
                const ageField = document.getElementById('child-selection-age');
                
                console.log('🧪 DETAILED VALIDATION DEBUG:');
                console.log('📝 Name field:', { 
                    element: nameField, 
                    value: nameField?.value, 
                    disabled: nameField?.disabled, 
                    readOnly: nameField?.readOnly,
                    pointerEvents: nameField?.style.pointerEvents 
                });
                console.log('📝 Age field:', { 
                    element: ageField, 
                    value: ageField?.value, 
                    disabled: ageField?.disabled, 
                    readOnly: ageField?.readOnly,
                    pointerEvents: ageField?.style.pointerEvents 
                });
                console.log('📊 Parsed values:', { 
                    name, 
                    ageValue, 
                    age, 
                    isNaN: isNaN(age),
                    nameEmpty: !name,
                    ageInvalid: age < 6 || age > 15 
                });
                
                if (!name || !ageValue || isNaN(age) || age < 6 || age > 15) {
                    const errorMsg = `❌ Błąd walidacji:\n- Imię: "${name}"\n- Wiek: "${ageValue}" (parsed: ${age})\nWymagania: imię nie puste, wiek 6-15 lat`;
                    alert(errorMsg);
                    console.error('❌ Validation failed:', { name, ageValue, age });
                    return;
                }
                
                const childId = await this.createChildProfile(name, age);
                modal.remove();
                resolve(childId);
            });
        });
    }

    /**
     * 👶 CREATE CHILD PROFILE
     */
    async createChildProfile(name, age) {
        const childId = `child_${name.toLowerCase()}_${Date.now()}`;
        
        const profile = {
            id: childId,
            name: name,
            age: age,
            created: new Date().toISOString(),
            lastAccess: new Date().toISOString()
        };
        
        // Save to ZK storage
        await this.saveChildProfile(profile);
        
        console.log(`👶 Created child profile: ${name} (${age} lat) - ID: ${childId}`);
        
        return childId;
    }

    /**
     * 💾 SAVE CHILD PROFILE
     */
    async saveChildProfile(profile) {
        try {
            // Get existing family profiles
            const familyProfiles = await window.loadFromMinaZK('zk_family_children_profiles') || {};
            
            // Add new child
            familyProfiles[profile.id] = profile;
            
            // Save back to ZK storage
            await window.saveToMinaZK('zk_family_children_profiles', familyProfiles);
            
            console.log('✅ Child profile saved to ZK storage');
        } catch (error) {
            console.error('❌ Failed to save child profile:', error);
        }
    }

    /**
     * 📋 LOAD EXISTING CHILDREN
     */
    async loadExistingChildren() {
        try {
            const familyProfiles = await window.loadFromMinaZK('zk_family_children_profiles') || {};
            return Object.values(familyProfiles);
        } catch (error) {
            console.error('❌ Failed to load children profiles:', error);
            return [];
        }
    }

    /**
     * 🎯 GET CHILD-SPECIFIC DATA
     */
    async getChildSpecificData(dataType) {
        const childId = await this.getCurrentChildId();
        if (!childId) {
            console.warn('⚠️ No child ID available - cannot load child-specific data');
            return null;
        }
        
        const key = `zk_${dataType}_child_${childId}`;
        console.log(`📊 Loading child-specific data: ${key}`);
        
        try {
            return await window.loadFromMinaZK(key);
        } catch (error) {
            console.error(`❌ Failed to load child data for ${key}:`, error);
            return null;
        }
    }

    /**
     * 💾 SAVE CHILD-SPECIFIC DATA
     */
    async saveChildSpecificData(dataType, data) {
        const childId = await this.getCurrentChildId();
        if (!childId) {
            console.error('❌ No child ID available - cannot save child-specific data');
            return false;
        }
        
        const key = `zk_${dataType}_child_${childId}`;
        console.log(`💾 Saving child-specific data: ${key}`);
        
        try {
            await window.saveToMinaZK(key, data);
            return true;
        } catch (error) {
            console.error(`❌ Failed to save child data for ${key}:`, error);
            return false;
        }
    }

    /**
     * 🔄 SWITCH CHILD
     */
    async switchChild() {
        localStorage.removeItem('current_child_id');
        this.currentChildId = null;
        
        // Clear URL parameter
        const url = new URL(window.location);
        url.searchParams.delete('child');
        window.history.pushState({}, '', url);
        
        // Request new selection
        return await this.getCurrentChildId();
    }

    /**
     * 🧒 GET CURRENT CHILD INFO
     */
    async getCurrentChildInfo() {
        const childId = await this.getCurrentChildId();
        if (!childId) return null;
        
        const familyProfiles = await window.loadFromMinaZK('zk_family_children_profiles') || {};
        return familyProfiles[childId] || null;
    }
}

// Initialize and export
window.childSessionManager = new ChildSessionManager();

// Export for debugging
window.switchChild = () => window.childSessionManager.switchChild();
window.getCurrentChildInfo = () => window.childSessionManager.getCurrentChildInfo();

// 🧪 DEBUG FUNCTIONS FOR TESTING PARENT CMS
// 🧪 DIRECT FIELD VALUE SETTER FOR TESTING
window.setChildValues = function(name = 'Piotr', age = '7') {
    const nameField = document.getElementById('child-name');
    const ageField = document.getElementById('child-selection-age');
    
    if (nameField) {
        nameField.value = name;
        nameField.style.pointerEvents = 'auto';
        nameField.disabled = false;
        nameField.readOnly = false;
        console.log(`✅ Set name field: "${name}"`);
    }
    
    if (ageField) {
        ageField.value = age;
        ageField.style.pointerEvents = 'auto';
        ageField.disabled = false;
        ageField.readOnly = false;
        console.log(`✅ Set age field: "${age}"`);
    }
    
    console.log('🧪 Test values set - now try clicking "Utwórz Nowy Profil"');
};

window.testParentCMS = async function() {
    console.log('🧪 Testing Parent CMS connection...');
    
    const childId = await window.childSessionManager.getCurrentChildId();
    console.log(`🧒 Current child ID: ${childId}`);
    
    if (window.getParentMessage) {
        // Test different message types
        const categories = ['location', 'alerts', 'safety'];
        const types = {
            location: ['checking', 'found'],
            alerts: ['water', 'storm', 'flood'],
            safety: ['help', 'route']
        };
        
        for (const category of categories) {
            for (const type of types[category]) {
                const message = await window.getParentMessage(category, type, childId);
                if (message) {
                    console.log(`✅ Found parent message: ${category}.${type} = "${message}"`);
                } else {
                    console.log(`ℹ️ No parent message: ${category}.${type}`);
                }
            }
        }
    } else {
        console.error('❌ window.getParentMessage not available');
    }
};

window.createTestParentMessage = async function(category = 'location', type = 'checking', message = 'Test parent message') {
    console.log(`🧪 Creating test parent message: ${category}.${type}`);
    
    const childId = await window.childSessionManager.getCurrentChildId();
    if (!childId) {
        console.error('❌ No child ID available');
        return false;
    }
    
    if (window.saveParentMessageForChild) {
        const result = await window.saveParentMessageForChild(childId, category, type, message);
        console.log(`${result ? '✅' : '❌'} Test message ${result ? 'saved' : 'failed'}`);
        return result;
    } else {
        console.error('❌ window.saveParentMessageForChild not available');
        return false;
    }
};

console.log('🧒 Child Session Manager loaded - Multi-child support active');
console.log('🧪 Debug functions: testParentCMS(), createTestParentMessage()');


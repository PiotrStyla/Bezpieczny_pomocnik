/**
 * 🔄 REAL SYNC SYSTEM - True Parent↔Child Synchronization
 * NO FAKE PROGRESS BARS - Only real data synchronization
 * Uses versioning system for efficient updates
 */

/**
 * 📦 DATA VERSIONING
 * Each data type has a version number
 */
const DATA_VERSIONS = {
    parent_messages: 0,
    safety_tips: 0,
    parent_location: 0,
    emergency_contacts: 0,
    home_location: 0
};

/**
 * 🔄 SYNC FROM PARENT CMS
 * Checks for updates and syncs new data
 */
async function syncFromParentCMS() {
    console.log('🔄 Starting sync from Parent CMS...');
    
    const syncResults = {
        updated: [],
        unchanged: [],
        errors: []
    };
    
    try {
        // 1. SYNC PARENT MESSAGES
        const messagesResult = await syncParentMessages();
        if (messagesResult.updated) {
            syncResults.updated.push('Parent Messages');
        } else if (messagesResult.error) {
            syncResults.errors.push('Parent Messages');
        } else {
            syncResults.unchanged.push('Parent Messages');
        }
        
        // 2. SYNC SAFETY TIPS
        const tipsResult = await syncSafetyTips();
        if (tipsResult.updated) {
            syncResults.updated.push('Safety Tips');
        } else if (tipsResult.error) {
            syncResults.errors.push('Safety Tips');
        } else {
            syncResults.unchanged.push('Safety Tips');
        }
        
        // 3. SYNC PARENT LOCATION
        const locationResult = await syncParentLocation();
        if (locationResult.updated) {
            syncResults.updated.push('Parent Location');
        } else if (locationResult.error) {
            syncResults.errors.push('Parent Location');
        } else {
            syncResults.unchanged.push('Parent Location');
        }
        
        // 4. SYNC HOME LOCATION
        const homeResult = await syncHomeLocation();
        if (homeResult.updated) {
            syncResults.updated.push('Home Location');
        } else if (homeResult.error) {
            syncResults.errors.push('Home Location');
        } else {
            syncResults.unchanged.push('Home Location');
        }
        
        console.log('✅ Sync complete:', syncResults);
        return syncResults;
        
    } catch (error) {
        console.error('❌ Sync failed:', error);
        return { error: error.message, syncResults };
    }
}

/**
 * 💬 SYNC PARENT MESSAGES
 */
async function syncParentMessages() {
    try {
        const messages = await window.loadFromMinaZK('zk_parent_custom_messages');
        
        if (!messages) {
            return { updated: false, reason: 'No messages' };
        }
        
        const currentVersion = DATA_VERSIONS.parent_messages;
        const newVersion = messages.version || 0;
        
        if (newVersion > currentVersion) {
            DATA_VERSIONS.parent_messages = newVersion;
            console.log(`📩 Parent messages updated (v${currentVersion} → v${newVersion})`);
            return { updated: true, version: newVersion };
        }
        
        return { updated: false, reason: 'Up to date' };
        
    } catch (error) {
        console.error('❌ Failed to sync parent messages:', error);
        return { updated: false, error: error.message };
    }
}

/**
 * 💡 SYNC SAFETY TIPS
 */
async function syncSafetyTips() {
    try {
        const tips = await window.loadFromMinaZK('zk_parent_safety_tips');
        
        if (!tips || !Array.isArray(tips)) {
            return { updated: false, reason: 'No tips' };
        }
        
        const currentCount = DATA_VERSIONS.safety_tips;
        const newCount = tips.length;
        
        if (newCount !== currentCount) {
            DATA_VERSIONS.safety_tips = newCount;
            console.log(`💡 Safety tips updated (${currentCount} → ${newCount} tips)`);
            
            // Refresh safety tips display
            if (typeof window.renderSafetyTips === 'function') {
                window.renderSafetyTips(tips);
            }
            
            return { updated: true, count: newCount };
        }
        
        return { updated: false, reason: 'Up to date' };
        
    } catch (error) {
        console.error('❌ Failed to sync safety tips:', error);
        return { updated: false, error: error.message };
    }
}

/**
 * 📍 SYNC PARENT LOCATION
 */
async function syncParentLocation() {
    try {
        const location = await window.loadFromMinaZK('zk_parent_emergency_location');
        
        if (!location) {
            return { updated: false, reason: 'No location' };
        }
        
        const currentTimestamp = DATA_VERSIONS.parent_location;
        const newTimestamp = new Date(location.timestamp).getTime();
        
        if (newTimestamp > currentTimestamp) {
            DATA_VERSIONS.parent_location = newTimestamp;
            console.log(`📍 Parent location updated (${new Date(newTimestamp).toLocaleTimeString()})`);
            return { updated: true, timestamp: newTimestamp };
        }
        
        return { updated: false, reason: 'Up to date' };
        
    } catch (error) {
        console.error('❌ Failed to sync parent location:', error);
        return { updated: false, error: error.message };
    }
}

/**
 * 🏠 SYNC HOME LOCATION
 */
async function syncHomeLocation() {
    try {
        const home = await window.loadFromMinaZK('zk_home_location');
        
        if (!home) {
            return { updated: false, reason: 'No home location' };
        }
        
        const currentTimestamp = DATA_VERSIONS.home_location;
        const newTimestamp = new Date(home.timestamp).getTime();
        
        if (newTimestamp > currentTimestamp) {
            DATA_VERSIONS.home_location = newTimestamp;
            console.log(`🏠 Home location updated`);
            return { updated: true, timestamp: newTimestamp };
        }
        
        return { updated: false, reason: 'Up to date' };
        
    } catch (error) {
        console.error('❌ Failed to sync home location:', error);
        return { updated: false, error: error.message };
    }
}

/**
 * 🔔 SHOW SYNC NOTIFICATION
 * Shows notification when new data is available
 */
function showSyncNotification(syncResults) {
    if (syncResults.updated.length === 0) {
        console.log('ℹ️ No updates available');
        return;
    }
    
    const updatedItems = syncResults.updated.join(', ');
    const message = `🔄 Nowe dane od rodzica!\n\nZaktualizowano: ${updatedItems}`;
    
    console.log(message);
    
    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Bezpieczny Pomocnik', {
            body: `Zaktualizowano: ${updatedItems}`,
            icon: '/icon-192.png',
            badge: '/icon-192.png'
        });
    }
    
    // Show in-app notification
    showInAppNotification(updatedItems);
}

/**
 * 📢 SHOW IN-APP NOTIFICATION
 */
function showInAppNotification(updatedItems) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 20px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.5s ease;
        max-width: 350px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 32px;">🔄</div>
            <div>
                <div style="font-weight: bold; margin-bottom: 5px;">Nowe dane!</div>
                <div style="font-size: 14px; opacity: 0.9;">Zaktualizowano: ${updatedItems}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

/**
 * ⏰ START AUTO-SYNC
 * Syncs every 30 seconds
 */
let syncInterval = null;

function startAutoSync() {
    console.log('⏰ Starting auto-sync (every 30 seconds)...');
    
    // Initial sync
    syncFromParentCMS().then(results => {
        if (results.updated && results.updated.length > 0) {
            showSyncNotification(results);
        }
    });
    
    // Sync every 30 seconds
    if (syncInterval) {
        clearInterval(syncInterval);
    }
    
    syncInterval = setInterval(async () => {
        console.log('🔄 Auto-sync check...');
        const results = await syncFromParentCMS();
        
        if (results.updated && results.updated.length > 0) {
            showSyncNotification(results);
        }
    }, 30000); // 30 seconds
    
    console.log('✅ Auto-sync started');
}

/**
 * ⏹️ STOP AUTO-SYNC
 */
function stopAutoSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        console.log('⏹️ Auto-sync stopped');
    }
}

/**
 * 🎬 START SYNC ON PAGE LOAD
 */
window.addEventListener('load', () => {
    console.log('🚀 Real Sync System loaded');
    
    // Start auto-sync after 5 seconds
    setTimeout(() => {
        startAutoSync();
    }, 5000);
});

/**
 * 🔌 BACKGROUND SYNC (SERVICE WORKER)
 * Syncs even when page is not open
 */
if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
        console.log('🔄 Registering background sync...');
        
        // Register periodic background sync (Chrome only)
        if ('periodicSync' in registration) {
            registration.periodicSync.register('parent-cms-sync', {
                minInterval: 60 * 1000 // 1 minute
            }).then(() => {
                console.log('✅ Periodic background sync registered');
            }).catch(err => {
                console.warn('⚠️ Periodic sync not available:', err);
            });
        }
    });
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('✅ Real Sync System module loaded');

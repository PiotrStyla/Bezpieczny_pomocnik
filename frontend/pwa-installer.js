/**
 * 📱 PWA INSTALLER & SHORTCUT HELPER
 * Automatyczna instalacja aplikacji na urządzeniu dziecka
 * Copyright (c) 2025 Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie
 */

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.installAttempts = 0;
        this.maxInstallAttempts = 3;
        this.init();
    }

    /**
     * 🚀 INITIALIZE PWA INSTALLER
     */
    init() {
        // Check if app is already installed
        this.checkInstallationStatus();

        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📱 PWA installation available');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        // Listen for successful installation
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed successfully');
            this.isInstalled = true;
            this.showInstallSuccessMessage();
            this.deferredPrompt = null;
        });

        // Register service worker
        this.registerServiceWorker();

        // Show bookmark instructions if not installable
        setTimeout(() => {
            if (!this.deferredPrompt && !this.isInstalled) {
                this.showBookmarkInstructions();
            }
        }, 5000);
    }

    /**
     * 🔍 CHECK INSTALLATION STATUS
     */
    checkInstallationStatus() {
        // Check if running in standalone mode (installed PWA)
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('✅ App is running as installed PWA');
            return;
        }

        // Check localStorage for previous install attempts
        const attempts = localStorage.getItem('pwa_install_attempts');
        this.installAttempts = attempts ? parseInt(attempts) : 0;
    }

    /**
     * 📱 SHOW INSTALL PROMPT FOR CHILDREN
     */
    showInstallPrompt() {
        // Don't show if already attempted too many times
        if (this.installAttempts >= this.maxInstallAttempts) {
            console.log('ℹ️ Max install attempts reached - skipping prompt');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'pwa-install-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000002;
            font-family: 'Comic Neue', sans-serif;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 20px;
                padding: 30px;
                max-width: 400px;
                margin: 20px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                border: 3px solid #3367D6;
            ">
                <div style="font-size: 64px; margin-bottom: 20px;">📱</div>
                
                <h2 style="color: #2c3e50; margin-bottom: 15px; font-size: 24px;">
                    🏠 Dodaj do Ekranu Głównego!
                </h2>
                
                <p style="color: #34495e; margin-bottom: 20px; font-size: 16px; line-height: 1.4;">
                    <strong>Świetna wiadomość!</strong><br>
                    Możesz zainstalować swoją aplikację bezpieczeństwa na telefonie lub komputerze!
                </p>
                
                <div style="background: rgba(52, 152, 219, 0.1); border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #2980b9; font-size: 14px;">
                        ✅ <strong>Szybki dostęp</strong> - jak zwykła aplikacja<br>
                        ✅ <strong>Działa offline</strong> - bez internetu<br>
                        ✅ <strong>Bezpieczne</strong> - zawsze aktualne alerty
                    </p>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="window.PWAInstaller.installApp()" 
                            style="
                                background: linear-gradient(135deg, #27ae60, #2ecc71);
                                color: white;
                                border: none;
                                padding: 15px 25px;
                                border-radius: 15px;
                                font-size: 16px;
                                font-weight: bold;
                                cursor: pointer;
                                transition: all 0.3s ease;
                            ">
                        📱 Zainstaluj Aplikację
                    </button>
                    
                    <button onclick="window.PWAInstaller.closeInstallPrompt()" 
                            style="
                                background: #95a5a6;
                                color: white;
                                border: none;
                                padding: 15px 25px;
                                border-radius: 15px;
                                font-size: 16px;
                                cursor: pointer;
                            ">
                        ⏭️ Może później
                    </button>
                </div>
                
                <p style="color: #7f8c8d; font-size: 12px; margin-top: 15px; margin-bottom: 0;">
                    💡 <strong>Dla rodziców:</strong> Instalacja tworzy bezpieczną skrótu na urządzeniu dziecka
                </p>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Auto-remove after 30 seconds if no action
        setTimeout(() => {
            if (modal.parentNode) {
                this.closeInstallPrompt();
            }
        }, 30000);
    }

    /**
     * 📲 INSTALL APP
     */
    async installApp() {
        if (!this.deferredPrompt) {
            console.log('❌ No deferred prompt available');
            return;
        }

        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for user response
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`📱 Install prompt result: ${outcome}`);
            
            if (outcome === 'accepted') {
                console.log('✅ User accepted the install prompt');
            } else {
                console.log('❌ User dismissed the install prompt');
                this.incrementInstallAttempts();
            }
            
            this.deferredPrompt = null;
            this.closeInstallPrompt();
            
        } catch (error) {
            console.error('❌ Error during installation:', error);
            this.closeInstallPrompt();
        }
    }

    /**
     * ❌ CLOSE INSTALL PROMPT
     */
    closeInstallPrompt() {
        const modal = document.querySelector('.pwa-install-modal');
        if (modal) {
            modal.remove();
        }
        this.incrementInstallAttempts();
    }

    /**
     * 📊 TRACK INSTALL ATTEMPTS
     */
    incrementInstallAttempts() {
        this.installAttempts++;
        localStorage.setItem('pwa_install_attempts', this.installAttempts.toString());
    }

    /**
     * 🔔 SHOW INSTALL SUCCESS MESSAGE
     */
    showInstallSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
            z-index: 1000003;
            font-family: 'Comic Neue', sans-serif;
            font-weight: bold;
        `;
        
        successDiv.innerHTML = `
            📱 ✅ Aplikacja zainstalowana!<br>
            <small>Znajdziesz ją na swoim ekranie głównym</small>
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    /**
     * 🔖 SHOW BOOKMARK INSTRUCTIONS (fallback)
     */
    showBookmarkInstructions() {
        // Only show if not installed and haven't shown too many times
        if (this.isInstalled || this.installAttempts >= this.maxInstallAttempts) {
            return;
        }

        const bookmarkDiv = document.createElement('div');
        bookmarkDiv.className = 'bookmark-helper';
        bookmarkDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: linear-gradient(135deg, #f39c12, #e67e22);
            color: white;
            padding: 15px;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
            z-index: 1000001;
            font-family: 'Comic Neue', sans-serif;
            font-size: 14px;
            line-height: 1.4;
        `;

        bookmarkDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 32px;">🔖</div>
                <div style="flex: 1;">
                    <strong>💡 Dodaj do Zakładek!</strong><br>
                    Naciśnij <kbd style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">Ctrl+D</kbd> 
                    aby łatwiej znaleźć swoją aplikację następnym razem!
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px; border-radius: 50%; cursor: pointer;">
                    ✕
                </button>
            </div>
        `;

        document.body.appendChild(bookmarkDiv);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (bookmarkDiv.parentNode) {
                bookmarkDiv.remove();
            }
        }, 10000);

        this.incrementInstallAttempts();
    }

    /**
     * 🔧 REGISTER SERVICE WORKER
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log('✅ Service Worker registered:', registration);
                
                // Listen for service worker updates
                registration.addEventListener('updatefound', () => {
                    console.log('🔄 Service Worker update found');
                });
                
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        } else {
            console.log('⚠️ Service Worker not supported');
        }
    }

    /**
     * 🧪 RESET INSTALL ATTEMPTS (for testing)
     */
    resetInstallAttempts() {
        this.installAttempts = 0;
        localStorage.removeItem('pwa_install_attempts');
        console.log('🔄 Install attempts reset');
    }
}

// 🌟 GLOBAL INSTANCE
window.PWAInstaller = new PWAInstaller();

// 🔄 GLOBAL HELPER FUNCTIONS
window.resetPWAInstallAttempts = () => {
    window.PWAInstaller.resetInstallAttempts();
};

window.showPWAInstallPrompt = () => {
    if (window.PWAInstaller.deferredPrompt) {
        window.PWAInstaller.showInstallPrompt();
    } else {
        window.PWAInstaller.showBookmarkInstructions();
    }
};

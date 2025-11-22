/*
 * Legal Compliance Banner - RODO & Cookies Consent
 * Copyright (c) 2025 Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie
 * All Rights Reserved. Proprietary and Confidential.
 */

class LegalBanner {
    constructor() {
        this.currentLang = document.documentElement.lang || 'pl';
        this.consentData = this.loadConsent();
        this.init();
    }

    init() {
        // Check if consent is needed
        if (!this.consentData.cookies || !this.consentData.privacy) {
            this.showConsentBanner();
        }
        
        // Add legal links to footer
        this.addLegalLinks();
    }

    loadConsent() {
        try {
            const stored = localStorage.getItem('legal_consent');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            return {};
        }
    }

    saveConsent(consentData) {
        try {
            const fullConsent = {
                ...this.consentData,
                ...consentData,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };
            localStorage.setItem('legal_consent', JSON.stringify(fullConsent));
            this.consentData = fullConsent;
        } catch (e) {
            console.warn('Could not save consent data');
        }
    }

    getTexts(lang = 'pl') {
        const texts = {
            pl: {
                title: '🛡️ Twoja prywatność i bezpieczeństwo',
                subtitle: 'Szczególnie ważne dla aplikacji dziecięcej',
                description: 'Ta aplikacja została stworzona z myślą o bezpieczeństwie dzieci. Szanujemy Twoją prywatność i stosujemy się do najwyższych standardów ochrony danych.',
                childProtection: '👶 <strong>Specjalna ochrona dzieci:</strong> Aplikacja przeznaczona dla dzieci 6-16 lat wymaga zgody rodzica/opiekuna zgodnie z RODO.',
                dataProcessing: 'Przetwarzamy minimalne dane potrzebne do działania aplikacji:',
                dataList: [
                    '📍 <strong>Lokalizacja</strong> (opcjonalnie) - dla lokalnych alertów pogodowych',
                    '🗣️ <strong>Preferencje językowe</strong> - język interfejsu (PL/EN/UA)', 
                    '🔊 <strong>Ustawienia dźwięku</strong> - włączenie/wyłączenie text-to-speech',
                    '⚙️ <strong>Dane techniczne</strong> - dla poprawnego działania aplikacji'
                ],
                cookiesTitle: '🍪 Informacja o plikach cookies:',
                cookiesDesc: 'Używamy tylko niezbędnych cookies do zapamiętania Twoich ustawień. Brak cookies reklamowych lub śledzących.',
                parentalConsent: '👨‍👩‍👧‍👦 <strong>Dla rodziców/opiekunów:</strong>',
                parentalInfo: 'Jeśli Twoje dziecko (poniżej 16 lat) korzysta z aplikacji, Twoja zgoda jest wymagana prawem. Możesz w każdej chwili cofnąć zgodę lub zarządzać ustawieniami prywatności.',
                contact: '📞 <strong>Kontakt:</strong> kontakt@fundacja-hospicjum.org',
                acceptAll: 'Akceptuję wszystko',
                acceptNecessary: 'Tylko niezbędne',
                showDetails: 'Szczegóły i ustawienia',
                links: {
                    privacy: 'Polityka prywatności',
                    cookies: 'Polityka cookies', 
                    terms: 'Regulamin',
                    accessibility: 'Dostępność'
                }
            },
            en: {
                title: '🛡️ Your privacy and safety',
                subtitle: 'Especially important for children\'s apps',
                description: 'This app was created with children\'s safety in mind. We respect your privacy and follow the highest data protection standards.',
                childProtection: '👶 <strong>Special child protection:</strong> This app for children aged 6-16 requires parental/guardian consent according to GDPR.',
                dataProcessing: 'We process minimal data necessary for app functionality:',
                dataList: [
                    '📍 <strong>Location</strong> (optional) - for local weather alerts',
                    '🗣️ <strong>Language preferences</strong> - interface language (PL/EN/UA)',
                    '🔊 <strong>Audio settings</strong> - enable/disable text-to-speech', 
                    '⚙️ <strong>Technical data</strong> - for proper app functioning'
                ],
                cookiesTitle: '🍪 Information about cookies:',
                cookiesDesc: 'We only use necessary cookies to remember your settings. No advertising or tracking cookies.',
                parentalConsent: '👨‍👩‍👧‍👦 <strong>For parents/guardians:</strong>',
                parentalInfo: 'If your child (under 16) uses this app, your consent is required by law. You can withdraw consent or manage privacy settings at any time.',
                contact: '📞 <strong>Contact:</strong> kontakt@fundacja-hospicjum.org',
                acceptAll: 'Accept all',
                acceptNecessary: 'Necessary only',
                showDetails: 'Details & settings',
                links: {
                    privacy: 'Privacy policy',
                    cookies: 'Cookie policy',
                    terms: 'Terms of use', 
                    accessibility: 'Accessibility'
                }
            },
            ua: {
                title: '🛡️ Ваша конфіденційність та безпека',
                subtitle: 'Особливо важливо для дитячих додатків',
                description: 'Цей додаток створений з думкою про безпеку дітей. Ми поважаємо вашу конфіденційність та дотримуємося найвищих стандартів захисту даних.',
                childProtection: '👶 <strong>Особливий захист дітей:</strong> Додаток для дітей 6-16 років вимагає згоди батьків/опікунів згідно з GDPR.',
                dataProcessing: 'Ми обробляємо мінімальні дані, необхідні для роботи додатку:',
                dataList: [
                    '📍 <strong>Місцезнаходження</strong> (за бажанням) - для місцевих погодних сповіщень',
                    '🗣️ <strong>Мовні налаштування</strong> - мова інтерфейсу (PL/EN/UA)',
                    '🔊 <strong>Налаштування звуку</strong> - увімкнення/вимкнення озвучування',
                    '⚙️ <strong>Технічні дані</strong> - для правильної роботи додатку'
                ],
                cookiesTitle: '🍪 Інформація про файли cookie:',
                cookiesDesc: 'Ми використовуємо лише необхідні файли cookie для запам\'ятовування ваших налаштувань. Немає рекламних або відстежувальних файлів cookie.',
                parentalConsent: '👨‍👩‍👧‍👦 <strong>Для батьків/опікунів:</strong>',
                parentalInfo: 'Якщо ваша дитина (до 16 років) користується додатком, ваша згода вимагається законом. Ви можете відкликати згоду або керувати налаштуваннями конфіденційності в будь-який час.',
                contact: '📞 <strong>Контакт:</strong> kontakt@fundacja-hospicjum.org',
                acceptAll: 'Прийняти все',
                acceptNecessary: 'Лише необхідні',
                showDetails: 'Деталі та налаштування',
                links: {
                    privacy: 'Політика конфіденційності',
                    cookies: 'Політика файлів cookie',
                    terms: 'Умови використання',
                    accessibility: 'Доступність'
                }
            }
        };

        return texts[lang] || texts.pl;
    }

    showConsentBanner() {
        const texts = this.getTexts(this.currentLang);
        
        // Remove existing banner
        const existing = document.getElementById('legal-banner');
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.id = 'legal-banner';
        banner.className = 'legal-banner';
        banner.innerHTML = `
            <div class="legal-banner-content">
                <div class="legal-banner-header">
                    <h2>${texts.title}</h2>
                    <p class="subtitle">${texts.subtitle}</p>
                </div>
                
                <div class="legal-banner-body">
                    <p>${texts.description}</p>
                    
                    <div class="child-protection-notice">
                        <p>${texts.childProtection}</p>
                    </div>
                    
                    <details class="data-processing-details">
                        <summary>${texts.dataProcessing}</summary>
                        <ul class="data-list">
                            ${texts.dataList.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                        
                        <div class="cookies-info">
                            <h4>${texts.cookiesTitle}</h4>
                            <p>${texts.cookiesDesc}</p>
                        </div>
                        
                        <div class="parental-info">
                            <p>${texts.parentalConsent}</p>
                            <p>${texts.parentalInfo}</p>
                        </div>
                        
                        <p class="contact-info">${texts.contact}</p>
                    </details>
                </div>
                
                <div class="legal-banner-actions">
                    <button id="accept-all" class="btn-primary">${texts.acceptAll}</button>
                    <button id="accept-necessary" class="btn-secondary">${texts.acceptNecessary}</button>
                    <button id="show-settings" class="btn-link">${texts.showDetails}</button>
                </div>
                
                <div class="legal-links">
                    <a href="#" data-legal="privacy">${texts.links.privacy}</a> |
                    <a href="#" data-legal="cookies">${texts.links.cookies}</a> |
                    <a href="#" data-legal="terms">${texts.links.terms}</a> |
                    <a href="#" data-legal="accessibility">${texts.links.accessibility}</a>
                </div>
            </div>
        `;

        document.body.appendChild(banner);
        this.attachBannerEvents();
        
        // Show banner with animation
        setTimeout(() => banner.classList.add('show'), 100);
    }

    attachBannerEvents() {
        document.getElementById('accept-all')?.addEventListener('click', () => {
            this.saveConsent({
                cookies: true,
                privacy: true,
                analytics: true,
                marketing: false,
                location: true
            });
            this.hideBanner();
        });

        document.getElementById('accept-necessary')?.addEventListener('click', () => {
            this.saveConsent({
                cookies: true,
                privacy: true, 
                analytics: false,
                marketing: false,
                location: false
            });
            this.hideBanner();
        });

        document.getElementById('show-settings')?.addEventListener('click', () => {
            this.showDetailedSettings();
        });

        // Legal document links
        document.querySelectorAll('[data-legal]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const docType = e.target.getAttribute('data-legal');
                this.showLegalDocument(docType);
            });
        });
    }

    hideBanner() {
        const banner = document.getElementById('legal-banner');
        if (banner) {
            banner.classList.add('hide');
            setTimeout(() => banner.remove(), 300);
        }
    }

    showDetailedSettings() {
        // Implementation for detailed privacy settings modal
        console.log('Show detailed privacy settings');
    }

    showLegalDocument(docType) {
        // Implementation for showing legal documents
        console.log('Show legal document:', docType);
    }

    addLegalLinks() {
        // Add legal links to footer if they don't exist
        const footer = document.querySelector('footer') || document.querySelector('.foundation-info');
        if (footer && !footer.querySelector('.legal-footer-links')) {
            const texts = this.getTexts(this.currentLang);
            const legalLinksDiv = document.createElement('div');
            legalLinksDiv.className = 'legal-footer-links';
            legalLinksDiv.innerHTML = `
                <div class="legal-links-small">
                    <a href="#" data-legal="privacy">${texts.links.privacy}</a>
                    <a href="#" data-legal="cookies">${texts.links.cookies}</a>
                    <a href="#" data-legal="terms">${texts.links.terms}</a>
                    <a href="#" data-legal="accessibility">${texts.links.accessibility}</a>
                </div>
            `;
            footer.appendChild(legalLinksDiv);
            
            // Attach events to footer links
            legalLinksDiv.querySelectorAll('[data-legal]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const docType = e.target.getAttribute('data-legal');
                    this.showLegalDocument(docType);
                });
            });
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new LegalBanner());
} else {
    new LegalBanner();
}

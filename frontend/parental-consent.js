/*
 * Parental Consent System - RODO Art. 8 Compliance
 * Copyright (c) 2025 Fundacja na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie
 * All Rights Reserved. Proprietary and Confidential.
 */

class ParentalConsentManager {
    constructor() {
        this.currentLang = document.documentElement.lang || 'pl';
        this.consentData = this.loadConsent();
        this.init();
    }

    loadConsent() {
        try {
            const stored = localStorage.getItem('parental_consent');
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    }

    saveConsent(consentData) {
        try {
            const fullConsent = {
                ...consentData,
                timestamp: new Date().toISOString(),
                version: '1.0',
                userAgent: navigator.userAgent,
                ipApproximate: 'logged_separately', // For audit purposes
                juridicalBasis: 'RODO_Art_8'
            };
            localStorage.setItem('parental_consent', JSON.stringify(fullConsent));
            this.consentData = fullConsent;
            
            // Also send to backend for audit log (optional)
            this.logConsentToServer(fullConsent);
        } catch (e) {
            console.warn('Could not save parental consent data');
        }
    }

    async logConsentToServer(consentData) {
        try {
            // Optional server-side audit log
            await fetch('/api/audit/parental-consent', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    action: 'parental_consent_granted',
                    timestamp: consentData.timestamp,
                    version: consentData.version
                })
            });
        } catch (e) {
            // Silent fail - local storage is primary
        }
    }

    init() {
        // Check if parental consent is needed
        if (!this.consentData || this.isConsentExpired()) {
            this.showParentalConsentBanner();
        }
    }

    isConsentExpired() {
        if (!this.consentData?.timestamp) return true;
        
        // Consent expires after 12 months (RODO best practice)
        const consentDate = new Date(this.consentData.timestamp);
        const expirationDate = new Date(consentDate.getTime() + (365 * 24 * 60 * 60 * 1000));
        return new Date() > expirationDate;
    }

    getTexts(lang = 'pl') {
        const texts = {
            pl: {
                title: '👨‍👩‍👧‍👦 Zgoda Rodzica/Opiekuna Wymagana',
                subtitle: 'Zgodnie z RODO Art. 8 - Ochrona dzieci',
                childProtection: '🛡️ Ta aplikacja jest przeznaczona dla dzieci w wieku 6-16 lat.',
                legalRequirement: '⚖️ <strong>Wymóg prawny:</strong> Zgodnie z Rozporządzeniem RODO (Art. 8), dzieci poniżej 16. roku życia mogą korzystać z usług cyfrowych wyłącznie za zgodą rodzica lub opiekuna prawnego.',
                parentConfirmation: '✅ <strong>Potwierdzenie rodzica/opiekuna:</strong>',
                confirmationText: 'Jako rodzic/opiekun prawny dziecka korzystającego z tej aplikacji, oświadczam, że:',
                confirmationPoints: [
                    '📋 Zapoznałem(-am) się z Regulaminem aplikacji',
                    '🔒 Przeczytałem(-am) Politykę Prywatności',
                    '👶 Wyrazam zgodę na korzystanie z aplikacji przez moje dziecko (poniżej 16 lat)',
                    '📍 Zgadzam się na opcjonalne przetwarzanie danych lokalizacyjnych dla funkcji alertów pogodowych',
                    '🗣️ Akceptuję funkcję text-to-speech dla poprawy dostępności',
                    '⏰ Rozumiem, że mogę cofnąć tę zgodę w każdej chwili'
                ],
                legalBasis: '📜 <strong>Podstawa prawna:</strong> RODO Art. 8 - zgoda rodzica/opiekuna dla dzieci poniżej 16 lat.',
                dataMinimization: '🔒 <strong>Minimalizacja danych:</strong> Aplikacja zbiera tylko niezbędne dane - preferencje językowe, ustawienia dźwięku i opcjonalnie lokalizację.',
                contact: '📞 <strong>Kontakt w sprawie zgody:</strong><br>E-mail: kontakt@fundacja-hospicjum.org<br>Telefon: +48 735 749 618',
                buttons: {
                    grantConsent: 'Jako rodzic/opiekun wyrażam zgodę',
                    denyAccess: 'Nie wyrażam zgody',
                    moreInfo: 'Więcej informacji',
                    downloadConsent: 'Pobierz zgodę do podpisu'
                },
                accessDenied: {
                    title: 'Dostęp ograniczony',
                    message: 'Bez zgody rodzica/opiekuna dziecko nie może korzystać z aplikacji zgodnie z wymogami RODO Art. 8.',
                    parentInfo: 'Jeśli jesteś rodzicem/opiekunem, możesz udzielić zgody klikając powyższy przycisk.'
                }
            },
            en: {
                title: '👨‍👩‍👧‍👦 Parental/Guardian Consent Required',
                subtitle: 'According to GDPR Art. 8 - Protection of children',
                childProtection: '🛡️ This application is intended for children aged 6-16 years.',
                legalRequirement: '⚖️ <strong>Legal requirement:</strong> According to GDPR (Art. 8), children under 16 years of age may use digital services only with the consent of a parent or legal guardian.',
                parentConfirmation: '✅ <strong>Parent/guardian confirmation:</strong>',
                confirmationText: 'As a parent/legal guardian of the child using this application, I declare that:',
                confirmationPoints: [
                    '📋 I have read the Terms of Use of the application',
                    '🔒 I have read the Privacy Policy',
                    '👶 I consent to my child (under 16) using the application',
                    '📍 I agree to optional processing of location data for weather alert functions',
                    '🗣️ I accept the text-to-speech function for improved accessibility',
                    '⏰ I understand that I can withdraw this consent at any time'
                ],
                legalBasis: '📜 <strong>Legal basis:</strong> GDPR Art. 8 - parental/guardian consent for children under 16.',
                dataMinimization: '🔒 <strong>Data minimization:</strong> The application collects only necessary data - language preferences, audio settings and optionally location.',
                contact: '📞 <strong>Contact regarding consent:</strong><br>E-mail: kontakt@fundacja-hospicjum.org<br>Phone: +48 735 749 618',
                buttons: {
                    grantConsent: 'As parent/guardian I give consent',
                    denyAccess: 'I do not give consent',
                    moreInfo: 'More information',
                    downloadConsent: 'Download consent form'
                },
                accessDenied: {
                    title: 'Access restricted',
                    message: 'Without parental/guardian consent, the child cannot use the application in accordance with GDPR Art. 8 requirements.',
                    parentInfo: 'If you are a parent/guardian, you can give consent by clicking the button above.'
                }
            },
            ua: {
                title: '👨‍👩‍👧‍👦 Потрібна згода батьків/опікунів',
                subtitle: 'Згідно з GDPR Ст. 8 - Захист дітей',
                childProtection: '🛡️ Цей додаток призначений для дітей віком 6-16 років.',
                legalRequirement: '⚖️ <strong>Правова вимога:</strong> Згідно з GDPR (Ст. 8), діти до 16 років можуть користуватися цифровими послугами лише за згодою батьків або законного опікуна.',
                parentConfirmation: '✅ <strong>Підтвердження батьків/опікуна:</strong>',
                confirmationText: 'Як батько/законний опікун дитини, яка користується цим додатком, я заявляю, що:',
                confirmationPoints: [
                    '📋 Я прочитав(ла) Умови використання додатку',
                    '🔒 Я прочитав(ла) Політику конфіденційності',
                    '👶 Я даю згоду на використання додатку моєю дитиною (до 16 років)',
                    '📍 Я погоджуюся на опціональну обробку даних геолокації для функцій погодних сповіщень',
                    '🗣️ Я приймаю функцію озвучування тексту для поліпшення доступності',
                    '⏰ Я розумію, що можу відкликати цю згоду в будь-який час'
                ],
                legalBasis: '📜 <strong>Правова основа:</strong> GDPR Ст. 8 - згода батьків/опікуна для дітей до 16 років.',
                dataMinimization: '🔒 <strong>Мінімізація даних:</strong> Додаток збирає лише необхідні дані - мовні налаштування, налаштування звуку та за бажанням місцезнаходження.',
                contact: '📞 <strong>Контакт щодо згоди:</strong><br>E-mail: kontakt@fundacja-hospicjum.org<br>Телефон: +48 735 749 618',
                buttons: {
                    grantConsent: 'Як батько/опікун я даю згоду',
                    denyAccess: 'Я не даю згоди',
                    moreInfo: 'Більше інформації',
                    downloadConsent: 'Завантажити форму згоди'
                },
                accessDenied: {
                    title: 'Доступ обмежений',
                    message: 'Без згоди батьків/опікуна дитина не може користуватися додатком відповідно до вимог GDPR Ст. 8.',
                    parentInfo: 'Якщо ви батько/опікун, ви можете дати згоду, натиснувши кнопку вище.'
                }
            }
        };

        return texts[lang] || texts.pl;
    }

    showParentalConsentBanner() {
        const texts = this.getTexts(this.currentLang);
        
        // Remove existing banner
        const existing = document.getElementById('parental-consent-banner');
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.id = 'parental-consent-banner';
        banner.className = 'parental-consent-banner';
        banner.innerHTML = `
            <div class="parental-consent-content">
                <div class="consent-header">
                    <h2>${texts.title}</h2>
                    <p class="subtitle">${texts.subtitle}</p>
                </div>
                
                <div class="consent-body">
                    <div class="child-protection-notice">
                        <p>${texts.childProtection}</p>
                        <p>${texts.legalRequirement}</p>
                    </div>
                    
                    <div class="parent-confirmation">
                        <h3>${texts.parentConfirmation}</h3>
                        <p>${texts.confirmationText}</p>
                        
                        <ul class="confirmation-points">
                            ${texts.confirmationPoints.map(point => `<li>${point}</li>`).join('')}
                        </ul>
                        
                        <div class="legal-info">
                            <p>${texts.legalBasis}</p>
                            <p>${texts.dataMinimization}</p>
                        </div>
                        
                        <div class="contact-info">
                            <p>${texts.contact}</p>
                        </div>
                    </div>
                </div>
                
                <div class="consent-actions">
                    <button id="grant-consent" class="btn-consent-grant">
                        ✅ ${texts.buttons.grantConsent}
                    </button>
                    <button id="deny-consent" class="btn-consent-deny">
                        ❌ ${texts.buttons.denyAccess}
                    </button>
                    <button id="more-info" class="btn-more-info">
                        📋 ${texts.buttons.moreInfo}
                    </button>
                    <button id="download-consent" class="btn-download">
                        📄 ${texts.buttons.downloadConsent}
                    </button>
                </div>
                
                <div id="access-denied" class="access-denied" style="display: none;">
                    <h3>${texts.accessDenied.title}</h3>
                    <p>${texts.accessDenied.message}</p>
                    <p>${texts.accessDenied.parentInfo}</p>
                </div>
            </div>
        `;

        document.body.appendChild(banner);
        this.attachConsentEvents(texts);
        
        // Show banner with animation
        setTimeout(() => banner.classList.add('show'), 100);
        
        // Blur the main app content until consent is given
        this.blurAppContent(true);
    }

    attachConsentEvents(texts) {
        document.getElementById('grant-consent')?.addEventListener('click', () => {
            this.grantParentalConsent();
        });

        document.getElementById('deny-consent')?.addEventListener('click', () => {
            this.denyAccess(texts);
        });

        document.getElementById('more-info')?.addEventListener('click', () => {
            this.showMoreInfo();
        });

        document.getElementById('download-consent')?.addEventListener('click', () => {
            this.downloadConsentForm();
        });
    }

    grantParentalConsent() {
        const consentData = {
            granted: true,
            parentEmail: null, // Could be added in advanced version
            childAge: null,    // Could be added in advanced version
            method: 'web_banner'
        };
        
        this.saveConsent(consentData);
        this.hideConsentBanner();
        this.blurAppContent(false);
        
        // Show confirmation message
        this.showConsentConfirmation();
    }

    denyAccess(texts) {
        document.getElementById('access-denied').style.display = 'block';
        document.querySelector('.consent-actions').style.display = 'none';
        
        // Keep the app blurred/inaccessible
        this.blurAppContent(true);
    }

    hideConsentBanner() {
        const banner = document.getElementById('parental-consent-banner');
        if (banner) {
            banner.classList.add('hide');
            setTimeout(() => banner.remove(), 300);
        }
    }

    blurAppContent(blur = true) {
        const appContainer = document.querySelector('.kids-container') || document.body;
        if (blur) {
            appContainer.style.filter = 'blur(3px) brightness(0.7)';
            appContainer.style.pointerEvents = 'none';
            appContainer.setAttribute('aria-hidden', 'true');
        } else {
            appContainer.style.filter = 'none';
            appContainer.style.pointerEvents = 'auto';
            appContainer.removeAttribute('aria-hidden');
        }
    }

    showConsentConfirmation() {
        const confirmation = document.createElement('div');
        confirmation.className = 'consent-confirmation';
        confirmation.innerHTML = `
            <div class="confirmation-content">
                <h3>✅ Zgoda udzielona</h3>
                <p>Dziękujemy za udzielenie zgody rodzicielskiej. Dziecko może teraz bezpiecznie korzystać z aplikacji.</p>
                <button onclick="this.parentElement.parentElement.remove()" class="btn-ok">OK</button>
            </div>
        `;
        document.body.appendChild(confirmation);
        
        setTimeout(() => confirmation.classList.add('show'), 100);
    }

    showMoreInfo() {
        // Open legal documents in new tabs
        window.open('/legal/REGULAMIN.md', '_blank');
        window.open('/legal/POLITYKA_PRYWATNOSCI.md', '_blank');
    }

    downloadConsentForm() {
        // Generate downloadable consent form
        const consentForm = this.generateConsentFormPDF();
        const blob = new Blob([consentForm], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'zgoda_rodzicielska_bezpieczny_pomocnik.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateConsentFormPDF() {
        const currentDate = new Date().toLocaleDateString('pl-PL');
        return `
ZGODA RODZICIELSKA NA KORZYSTANIE Z APLIKACJI "BEZPIECZNY POMOCNIK"
(zgodnie z RODO Art. 8)

Data: ${currentDate}

Oświadczenie rodzica/opiekuna prawnego:

Ja, niżej podpisany/a _________________________ (imię i nazwisko rodzica/opiekuna)

będąc rodzicem/opiekunem prawnym dziecka: _________________________ (imię dziecka)

urodzonego dnia: _____________ (data urodzenia dziecka)

po zapoznaniu się z:
- Regulaminem aplikacji "Bezpieczny Pomocnik"
- Polityką Prywatności aplikacji

WYRAŻAM ZGODĘ na korzystanie przez moje dziecko z aplikacji internetowej "Bezpieczny Pomocnik" 
udostępnianej przez Fundację na rzecz Hospicjum Maryi Królowej Apostołów w Krakowie.

Jednocześnie oświadczam, że:
□ Zapoznałem/-am się z przeznaczeniem i funkcjonalnościami aplikacji
□ Rozumiem zakres przetwarzanych danych (lokalizacja opcjonalnie, preferencje językowe, ustawienia audio)
□ Zgadzam się na opcjonalne przetwarzanie danych lokalizacyjnych dla alertów pogodowych
□ Przyjmuję do wiadomości, że mogę cofnąć niniejszą zgodę w każdej chwili

Podstawa prawna: RODO Art. 8 - zgoda rodzica/opiekuna dla dzieci poniżej 16 lat.

Kontakt w sprawie zgody:
E-mail: kontakt@fundacja-hospicjum.org
Tel: +48 735 749 618

_________________________ 
(podpis rodzica/opiekuna)

Data: _________________

---
Ten dokument można przesłać zeskanowany na adres: kontakt@fundacja-hospicjum.org
lub dostarczyć osobiście pod adres: 30-404 Kraków, ul. Cegielniana 6B/45
        `;
    }

    // Public methods for consent management
    revokeConsent() {
        localStorage.removeItem('parental_consent');
        this.consentData = null;
        this.showParentalConsentBanner();
    }

    hasValidConsent() {
        return this.consentData && 
               this.consentData.granted && 
               !this.isConsentExpired();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.parentalConsentManager = new ParentalConsentManager();
    });
} else {
    window.parentalConsentManager = new ParentalConsentManager();
}

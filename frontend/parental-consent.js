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
        // Check for verification token in URL
        const urlParams = new URLSearchParams(window.location.search);
        const verifyToken = urlParams.get('verify');
        
        if (verifyToken) {
            // Process email verification
            this.processVerification(verifyToken);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }
        
        // Check if consent is needed
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
                
                <div class="adult-verification" id="adult-verification" style="display: none;">
                    <h3>🔒 Weryfikacja dorosłego</h3>
                    <p><strong>Aby upewnić się, że zgodę wyraża rodzic/opiekun, a nie dziecko:</strong></p>
                    
                    <div class="verification-step">
                        <label for="parent-email">📧 Adres email rodzica/opiekuna:</label>
                        <input type="email" id="parent-email" placeholder="rodzic@email.com" required>
                        <small>Na ten adres zostanie wysłany link weryfikacyjny</small>
                    </div>
                    
                    <div class="verification-step">
                        <label for="child-age">👶 Wiek dziecka:</label>
                        <select id="child-age" required>
                            <option value="">Wybierz wiek</option>
                            <option value="6">6 lat</option>
                            <option value="7">7 lat</option>
                            <option value="8">8 lat</option>
                            <option value="9">9 lat</option>
                            <option value="10">10 lat</option>
                            <option value="11">11 lat</option>
                            <option value="12">12 lat</option>
                            <option value="13">13 lat</option>
                            <option value="14">14 lat</option>
                            <option value="15">15 lat</option>
                        </select>
                    </div>
                    
                    <div class="verification-step adult-question">
                        <label for="adult-question">🧮 Pytanie dla dorosłego:</label>
                        <p id="math-question">Ile to jest 17 + 23?</p>
                        <input type="number" id="adult-answer" placeholder="Twoja odpowiedź" required>
                        <small>To pytanie sprawdza, czy formularz wypełnia dorosły</small>
                    </div>
                    
                    <div class="verification-step">
                        <label>
                            <input type="checkbox" id="parent-declaration" required>
                            <strong>Oświadczam, że jestem rodzicem/opiekunem prawnym tego dziecka i mam prawo do udzielenia tej zgody</strong>
                        </label>
                    </div>
                </div>
                
                <div class="consent-actions">
                    <button id="start-verification" class="btn-consent-grant">
                        🔒 Jestem rodzicem - rozpocznij weryfikację
                    </button>
                    <button id="send-verification-email" class="btn-send-email" style="display: none;">
                        📧 Wyślij link weryfikacyjny
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
        // Initialize math question
        this.generateMathQuestion();
        
        document.getElementById('start-verification')?.addEventListener('click', () => {
            this.startVerificationProcess();
        });

        document.getElementById('send-verification-email')?.addEventListener('click', () => {
            this.sendVerificationEmail();
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

    generateMathQuestion() {
        const num1 = Math.floor(Math.random() * 50) + 10; // 10-59
        const num2 = Math.floor(Math.random() * 30) + 5;  // 5-34
        this.correctAnswer = num1 + num2;
        
        const questionEl = document.getElementById('math-question');
        if (questionEl) {
            questionEl.textContent = `Ile to jest ${num1} + ${num2}?`;
        }
    }

    startVerificationProcess() {
        const verificationDiv = document.getElementById('adult-verification');
        const startBtn = document.getElementById('start-verification');
        
        if (verificationDiv && startBtn) {
            verificationDiv.style.display = 'block';
            startBtn.style.display = 'none';
            document.getElementById('send-verification-email').style.display = 'block';
            
            // Scroll to verification form
            verificationDiv.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async sendVerificationEmail() {
        const email = document.getElementById('parent-email')?.value;
        const childAge = document.getElementById('child-age')?.value;
        const userAnswer = parseInt(document.getElementById('adult-answer')?.value);
        const declaration = document.getElementById('parent-declaration')?.checked;
        
        // Validation
        if (!email || !childAge || !userAnswer || !declaration) {
            this.showError('Proszę wypełnić wszystkie pola');
            return;
        }
        
        if (userAnswer !== this.correctAnswer) {
            this.showError('Nieprawidłowa odpowiedź na pytanie matematyczne. Proszę spróbować ponownie.');
            this.generateMathQuestion(); // Generate new question
            document.getElementById('adult-answer').value = '';
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError('Proszę podać prawidłowy adres email');
            return;
        }

        // Show loading
        const sendBtn = document.getElementById('send-verification-email');
        const originalText = sendBtn.textContent;
        sendBtn.textContent = '⏳ Wysyłanie...';
        sendBtn.disabled = true;

        try {
            // Generate verification token
            const verificationToken = this.generateVerificationToken();
            const verificationData = {
                email: email,
                childAge: childAge,
                token: verificationToken,
                timestamp: new Date().toISOString()
            };

            // Store pending verification
            localStorage.setItem('pending_parental_verification', JSON.stringify(verificationData));

            // In a real app, this would send email via backend
            // For now, we'll simulate it
            await this.simulateEmailSending(email, verificationToken);
            
            this.showVerificationEmailSent(email);
            
        } catch (error) {
            this.showError('Wystąpił błąd podczas wysyłania emaila. Proszę spróbować ponownie.');
            console.error('Email sending error:', error);
        } finally {
            sendBtn.textContent = originalText;
            sendBtn.disabled = false;
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    generateVerificationToken() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    async simulateEmailSending(email, token) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In production, this would call backend API
        console.log('Email verification sent to:', email);
        console.log('Verification URL:', `${window.location.origin}?verify=${token}`);
        
        // For development, show the verification link in console
        console.log('🔗 VERIFICATION LINK (for testing):', 
                   `${window.location.origin}?verify=${token}`);
    }

    showVerificationEmailSent(email) {
        const popup = document.createElement('div');
        popup.className = 'email-sent-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <h3>📧 Email wysłany!</h3>
                <p><strong>Wysłaliśmy link weryfikacyjny na adres:</strong></p>
                <p class="email-address">${email}</p>
                <p>Proszę sprawdzić skrzynkę odbiorczą (także folder spam) i kliknąć link weryfikacyjny.</p>
                <p><small>Link będzie ważny przez 24 godziny.</small></p>
                <button onclick="this.parentElement.parentElement.remove()" class="btn-ok">
                    Rozumiem
                </button>
                
                <div class="test-verification" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                    <p><strong>W celach testowych:</strong></p>
                    <button onclick="window.parentalConsentManager.processVerification('${this.generateVerificationToken()}')" 
                            class="btn-test">
                        🧪 Symuluj kliknięcie w link
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
        setTimeout(() => popup.classList.add('show'), 100);
    }

    showError(message) {
        const error = document.createElement('div');
        error.className = 'error-popup';
        error.innerHTML = `
            <div class="popup-content error">
                <h3>⚠️ Błąd</h3>
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()" class="btn-ok">
                    OK
                </button>
            </div>
        `;
        document.body.appendChild(error);
        setTimeout(() => error.classList.add('show'), 100);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (error.parentNode) {
                error.remove();
            }
        }, 5000);
    }

    // Process verification from email link
    processVerification(token) {
        const pendingData = localStorage.getItem('pending_parental_verification');
        if (!pendingData) {
            this.showError('Brak oczekującej weryfikacji');
            return;
        }
        
        const verification = JSON.parse(pendingData);
        
        // Check if token matches (in real app, this would be server-side)
        // For demo, we'll accept any token for testing
        
        // Check if not expired (24 hours)
        const verificationTime = new Date(verification.timestamp);
        const now = new Date();
        const hoursDiff = (now - verificationTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            this.showError('Link weryfikacyjny wygasł. Proszę rozpocząć proces ponownie.');
            localStorage.removeItem('pending_parental_verification');
            return;
        }
        
        // Grant consent with verification data
        this.grantVerifiedParentalConsent(verification);
    }
    
    grantVerifiedParentalConsent(verificationData) {
        const consentData = {
            granted: true,
            parentEmail: verificationData.email,
            childAge: verificationData.childAge,
            method: 'email_verified',
            verificationToken: verificationData.token,
            verifiedAt: new Date().toISOString()
        };
        
        this.saveConsent(consentData);
        this.hideConsentBanner();
        this.blurAppContent(false);
        
        // Clean up pending verification
        localStorage.removeItem('pending_parental_verification');
        
        // Show confirmation message
        this.showVerifiedConsentConfirmation(verificationData.email);
    }

    grantParentalConsent() {
        // This method is now only used for fallback/testing
        const consentData = {
            granted: true,
            parentEmail: null,
            childAge: null,
            method: 'web_banner_fallback'
        };
        
        this.saveConsent(consentData);
        this.hideConsentBanner();
        this.blurAppContent(false);
        
        // Show confirmation message
        this.showConsentConfirmation();
    }
    
    showVerifiedConsentConfirmation(email) {
        const confirmation = document.createElement('div');
        confirmation.className = 'consent-confirmation verified';
        confirmation.innerHTML = `
            <div class="confirmation-content">
                <h3>✅ Zgoda zweryfikowana!</h3>
                <p><strong>Dziękujemy za weryfikację rodzicielską.</strong></p>
                <p>Email rodzica: <strong>${email}</strong></p>
                <p>Dziecko może teraz bezpiecznie korzystać z aplikacji zgodnie z RODO Art. 8.</p>
                <button onclick="this.parentElement.parentElement.remove()" class="btn-ok">
                    Rozpocznij korzystanie z aplikacji
                </button>
            </div>
        `;
        document.body.appendChild(confirmation);
        setTimeout(() => confirmation.classList.add('show'), 100);
    }

    startVerificationProcess() {
        console.log('🔒 Starting parental verification process...');
        
        // Show adult verification section
        const adultVerification = document.getElementById('adult-verification');
        if (adultVerification) {
            adultVerification.style.display = 'block';
            document.getElementById('start-verification').style.display = 'none';
            document.getElementById('send-verification-email').style.display = 'inline-block';
        }
    }
    
    async sendVerificationEmail() {
        console.log('📧 Attempting to send verification email...');
        
        const email = document.getElementById('parent-email')?.value;
        const childAge = document.getElementById('child-age')?.value;
        const adultAnswer = document.getElementById('adult-answer')?.value;
        const parentDeclaration = document.getElementById('parent-declaration')?.checked;
        
        // Validate form
        if (!email || !childAge || !adultAnswer || !parentDeclaration) {
            this.showError('❌ Proszę wypełnić wszystkie pola');
            return;
        }
        
        // Check adult question (17 + 23 = 40)
        if (parseInt(adultAnswer) !== 40) {
            this.showError('❌ Nieprawidłowa odpowiedź na pytanie. Sprawdź obliczenie.');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('❌ Proszę podać prawidłowy adres email');
            return;
        }
        
        try {
            // Generate verification token
            const verificationToken = this.generateVerificationToken();
            
            // Store pending verification data (local simulation)
            const verificationData = {
                email: email,
                childAge: parseInt(childAge),
                token: verificationToken,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('pending_parental_verification', JSON.stringify(verificationData));
            
            // Simulate email sending (since no backend)
            this.simulateEmailSending(email, verificationToken);
            
        } catch (error) {
            console.error('❌ Email sending failed:', error);
            this.showError('❌ Wystąpił błąd podczas wysyłania emaila. Spróbuj ponownie.');
        }
    }
    
    simulateEmailSending(email, token) {
        console.log(`📧 SIMULATING EMAIL SEND to: ${email}`);
        console.log(`🔗 Verification link: ${window.location.origin}${window.location.pathname}?verify=${token}`);
        
        // Show success message
        this.showEmailSentConfirmation(email, token);
    }
    
    showEmailSentConfirmation(email, token) {
        const modal = document.createElement('div');
        modal.className = 'email-sent-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; text-align: center;">
                <h3>📧 Email wysłany!</h3>
                <p><strong>Na adres ${email} został wysłany link weryfikacyjny.</strong></p>
                <hr style="margin: 20px 0;">
                <p><strong>🧪 TRYB DEWELOPERSKI - Symulacja emaila:</strong></p>
                <p style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; word-break: break-all;">
                    ${window.location.origin}${window.location.pathname}?verify=${token}
                </p>
                <p style="color: #666; font-size: 14px;">W prawdziwej aplikacji rodzic kliknąłby link w emailu</p>
                <hr style="margin: 20px 0;">
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button onclick="window.location.href = '${window.location.origin}${window.location.pathname}?verify=${token}'" 
                            style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        🔗 Symuluj kliknięcie linku
                    </button>
                    <button onclick="this.closest('.email-sent-modal').remove()" 
                            style="background: #95a5a6; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        Zamknij
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    generateVerificationToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 32; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }
    
    generateMathQuestion() {
        // For now, always use 17 + 23 = 40 (simple for adults, hard for kids)
        const questionElement = document.getElementById('math-question');
        if (questionElement) {
            questionElement.textContent = 'Ile to jest 17 + 23?';
        }
    }
    
    showError(message) {
        // Remove existing error
        const existingError = document.querySelector('.consent-error');
        if (existingError) existingError.remove();
        
        const error = document.createElement('div');
        error.className = 'consent-error';
        error.style.cssText = `
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            font-weight: bold;
        `;
        error.textContent = message;
        
        const adultVerification = document.getElementById('adult-verification');
        if (adultVerification) {
            adultVerification.appendChild(error);
            
            // Remove error after 5 seconds
            setTimeout(() => error.remove(), 5000);
        }
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
        console.log(`🔒 Parental Consent: ${blur ? 'BLURRING' : 'UNBLURRING'} app content`);
        
        if (blur) {
            appContainer.style.filter = 'blur(3px) brightness(0.7)';
            appContainer.style.pointerEvents = 'none';
            appContainer.setAttribute('aria-hidden', 'true');
            console.log('🚨 APP BLURRED - waiting for parental consent');
            
            // 🧒 CRITICAL: Allow Child Selection Modal to work despite blur
            // Child Selection Modal has z-index 1000000 and should remain interactive
            this.enableChildModalInteraction();
            
            // 👀 Watch for new child modals appearing
            this.watchForChildModals();
            
        } else {
            appContainer.style.filter = 'none';
            appContainer.style.pointerEvents = 'auto';
            appContainer.removeAttribute('aria-hidden');
            console.log('✅ APP UNBLURRED - parental consent granted');
        }
    }

    // 🧒 ENABLE CHILD MODAL INTERACTION (despite blur)
    enableChildModalInteraction() {
        const childModals = document.querySelectorAll('.child-selection-modal');
        childModals.forEach(modal => {
            modal.style.pointerEvents = 'auto';
            modal.style.filter = 'none';
            modal.style.position = 'fixed';
            modal.style.zIndex = '1000001'; // Above everything
            console.log('🧒 Child Selection Modal excluded from blur - interaction enabled');
        });
    }
    
    // 👀 WATCH FOR NEW CHILD MODALS
    watchForChildModals() {
        if (this.modalObserver) {
            this.modalObserver.disconnect();
        }
        
        this.modalObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if this is a child selection modal
                        if (node.classList && node.classList.contains('child-selection-modal')) {
                            console.log('👀 New Child Selection Modal detected - enabling interaction');
                            this.enableChildModalInteraction();
                        }
                        
                        // Also check children
                        const childModals = node.querySelectorAll && node.querySelectorAll('.child-selection-modal');
                        if (childModals && childModals.length > 0) {
                            console.log('👀 Child Selection Modal found in new content - enabling interaction');
                            this.enableChildModalInteraction();
                        }
                    }
                });
            });
        });
        
        this.modalObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
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
        window.ZKParentalConsent = new ParentalConsentManager();
    });
} else {
    window.ZKParentalConsent = new ParentalConsentManager();
}

// EMERGENCY DEBUGGING FUNCTIONS
window.forceUnblurApp = function() {
    console.log(' EMERGENCY: Force unblurring app');
    const appContainer = document.querySelector('.kids-container') || document.body;
    appContainer.style.filter = 'none';
    appContainer.style.pointerEvents = 'auto';
    appContainer.removeAttribute('aria-hidden');
    
    // Remove any consent banners
    const banners = document.querySelectorAll('#parental-consent-banner, .consent-confirmation');
    banners.forEach(banner => banner.remove());
    
    console.log(' App force-unblurred - should be accessible now');
};

window.resetParentalConsent = function() {
    console.log('🔄 Resetting parental consent system');
    localStorage.removeItem('parental_consent');
    localStorage.removeItem('zk_parental_consent');
    localStorage.removeItem('zk_child_age');
    localStorage.removeItem('pending_parental_verification');
    
    // Clear any existing consent manager
    if (window.ZKParentalConsent) {
        window.ZKParentalConsent.consentData = null;
    }
    
    window.forceUnblurApp();
    console.log('✅ Parental consent reset - reload page to see consent banner');
};

// Auto-check if app is stuck blurred
setTimeout(() => {
    const appContainer = document.querySelector('.kids-container') || document.body;
    if (appContainer && appContainer.style.filter && appContainer.style.filter.includes('blur')) {
        console.log('DETECTED: App seems stuck blurred!');
        console.log('SOLUTIONS:');
        console.log('   1. Type: forceUnblurApp() in console');
        console.log('   2. Type: resetParentalConsent() in console');
        console.log('   3. Refresh page and look for parental consent banner');
    }
}, 5000);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.ZKParentalConsent && typeof window.ZKParentalConsent === 'object') {
        console.log('✅ ZKParentalConsent loaded and initialized automatically');
    } else {
        console.warn('⚠️ ZKParentalConsent not properly loaded - creating fallback consent system');
        window.ZKParentalConsent = new ParentalConsentManager();
    }
});

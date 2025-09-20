declare class ParentalConsentManager {
    currentLang: string;
    consentData: any;
    loadConsent(): any;
    saveConsent(consentData: any): void;
    logConsentToServer(consentData: any): Promise<void>;
    init(): void;
    isConsentExpired(): boolean;
    getTexts(lang?: string): any;
    showParentalConsentBanner(): void;
    attachConsentEvents(texts: any): void;
    generateMathQuestion(): void;
    correctAnswer: number | undefined;
    startVerificationProcess(): void;
    sendVerificationEmail(): Promise<void>;
    validateEmail(email: any): boolean;
    generateVerificationToken(): string;
    simulateEmailSending(email: any, token: any): Promise<void>;
    showVerificationEmailSent(email: any): void;
    showError(message: any): void;
    processVerification(token: any): void;
    grantVerifiedParentalConsent(verificationData: any): void;
    grantParentalConsent(): void;
    showVerifiedConsentConfirmation(email: any): void;
    denyAccess(texts: any): void;
    hideConsentBanner(): void;
    blurAppContent(blur?: boolean): void;
    showConsentConfirmation(): void;
    showMoreInfo(): void;
    downloadConsentForm(): void;
    generateConsentFormPDF(): string;
    revokeConsent(): void;
    hasValidConsent(): any;
}
//# sourceMappingURL=parental-consent.d.ts.map
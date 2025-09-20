declare class LegalBanner {
    currentLang: string;
    consentData: any;
    init(): void;
    loadConsent(): any;
    saveConsent(consentData: any): void;
    getTexts(lang?: string): any;
    showConsentBanner(): void;
    attachBannerEvents(): void;
    hideBanner(): void;
    showDetailedSettings(): void;
    showLegalDocument(docType: any): void;
    addLegalLinks(): void;
}
//# sourceMappingURL=legal-banner.d.ts.map
/**
 * 🚨 REAL MINA EMERGENCY CLIENT
 *
 * Production integration with actual Mina Protocol
 * Replaces simulation with real blockchain functionality
 */
/**
 * 🔗 REAL MINA EMERGENCY MANAGER
 */
export declare class RealMinaEmergencyManager {
    private minaClient;
    private isConnected;
    private contractAddress;
    private parentPrivateKey;
    private childCommitment;
    private currentLanguage;
    private childAge;
    private emergencyTexts;
    constructor(contractAddress?: string);
    /**
     * 🚀 INITIALIZE REAL MINA CONNECTION
     */
    private initializeRealMina;
    /**
     * 📡 REAL 22KB BLOCKCHAIN SYNC
     */
    realBlockchainSync(): Promise<any>;
    /**
     * 🔒 REAL CHILD REGISTRATION WITH ZK-PROOF
     */
    realRegisterChild(birthYear: number, parentWorldIDNullifier: string): Promise<any>;
    /**
     * 🚨 REAL EMERGENCY STATUS CHECK
     */
    realEmergencyStatus(): Promise<any>;
    /**
     * 🔄 FALLBACK SIMULATION METHODS
     */
    private simulationSync;
    private simulationRegistration;
    private simulationEmergencyStatus;
    /**
     * 🌍 DETECT LANGUAGE (inherited from simulation)
     */
    private detectLanguage;
    /**
     * 👶 DETECT CHILD AGE (inherited from simulation)
     */
    private detectChildAge;
    /**
     * 🗣️ INITIALIZE TRANSLATIONS (inherited from simulation)
     */
    private initializeTranslations;
    /**
     * 🎯 GET LOCALIZED TEXT
     */
    getText(key: string): string;
    /**
     * 📊 CONNECTION STATUS
     */
    getConnectionStatus(): {
        connected: boolean;
        networkType: 'real' | 'simulation';
        contractAddress: string;
        features: string[];
    };
}
export default RealMinaEmergencyManager;
//# sourceMappingURL=emergency-mina-real.d.ts.map
/**
 * 🚨 MINA SAFETY CORE - Emergency Privacy System
 *
 * CRITICAL for current geopolitical situation:
 * - 22KB blockchain for emergency sync
 * - zk-proofs for child privacy protection
 * - War-time resilient architecture
 * - Satellite/mesh network compatible
 */
/**
 * 🔐 PRIVACY-PRESERVING CLIENT UTILITIES
 */
declare class MinaSafetyClient {
    isInitialized: boolean;
    emergencyMode: boolean;
    lastSync: number | null;
    /**
     * 🎯 GENERATE AGE PROOF without revealing exact age
     */
    generateAgeProof(birthYear: any): {
        ageRange: number;
        timestamp: number;
        parentConsent: boolean;
        zkProof: string;
    };
    /**
     * 🚨 CREATE EMERGENCY ACCESS TOKEN
     * Parent can access child location ONLY in emergency
     */
    createEmergencyAccess(childId: any): {
        childId: any;
        emergencyLevel: number;
        locationAccess: boolean;
        timestamp: number;
        zkProof: string;
    };
    /**
     * 🎓 GENERATE SAFETY COMPLETION PROOF
     */
    generateCompletionProof(courseType: any): {
        courseId: any;
        completionLevel: number;
        timestamp: number;
        zkProof: string;
    };
    /**
     * ⚔️ EMERGENCY MODE - MINIMAL BATTERY USAGE
     */
    enableEmergencyMode(): Promise<{
        batteryOptimized: boolean;
        satelliteReady: boolean;
        meshNetworkEnabled: boolean;
        estimatedHours: number;
    }>;
    /**
     * 📡 SYNC WITH 22KB BLOCKCHAIN
     * Works on minimal bandwidth (satellite/2G)
     */
    syncWithMinaNetwork(): Promise<{
        syncComplete: boolean;
        blockchainSize: string;
        emergencyLevel: number;
        lastUpdate: number;
    }>;
    /**
     * 🛡️ PRIVACY CHECK
     */
    checkPrivacyCompliance(): {
        zkProofsActive: boolean;
        dataMinimization: boolean;
        parentalControl: boolean;
        rightToBeForgotten: boolean;
        rodoArt8Compliant: boolean;
    };
}
declare namespace EMERGENCY_LEVELS {
    let NORMAL: number;
    let YELLOW: number;
    let ORANGE: number;
    let RED: number;
}
declare namespace SAFETY_COURSES {
    let ROAD_SAFETY: number;
    let HOME_SAFETY: number;
    let STRANGER_DANGER: number;
    let WEATHER_SAFETY: number;
    let SCOOTER_SAFETY: number;
    let EMERGENCY_PREPAREDNESS: number;
}
//# sourceMappingURL=mina-safety-core.d.ts.map
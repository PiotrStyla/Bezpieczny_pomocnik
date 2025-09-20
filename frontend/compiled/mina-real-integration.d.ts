/**
 * 🔗 REAL MINA PROTOCOL INTEGRATION
 *
 * PRODUCTION-READY BLOCKCHAIN CONNECTION:
 * - Actual zk-SNARKs for child privacy
 * - Real 22KB blockchain sync
 * - Berkeley testnet connection
 * - True zero-knowledge proofs
 * - Emergency-ready smart contracts
 */
import { Field, SmartContract, State, PublicKey, Signature, PrivateKey, Bool, UInt64 } from 'o1js';
declare const RealChildAgeProof_base: (new (value: {
    ageRangeCommitment: import("o1js/dist/node/lib/provable/field").Field;
    nullifierHash: import("o1js/dist/node/lib/provable/field").Field;
    parentConsentHash: import("o1js/dist/node/lib/provable/field").Field;
    timestamp: UInt64;
    emergencyAccess: import("o1js/dist/node/lib/provable/bool").Bool;
}) => {
    ageRangeCommitment: import("o1js/dist/node/lib/provable/field").Field;
    nullifierHash: import("o1js/dist/node/lib/provable/field").Field;
    parentConsentHash: import("o1js/dist/node/lib/provable/field").Field;
    timestamp: UInt64;
    emergencyAccess: import("o1js/dist/node/lib/provable/bool").Bool;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    ageRangeCommitment: import("o1js/dist/node/lib/provable/field").Field;
    nullifierHash: import("o1js/dist/node/lib/provable/field").Field;
    parentConsentHash: import("o1js/dist/node/lib/provable/field").Field;
    timestamp: UInt64;
    emergencyAccess: import("o1js/dist/node/lib/provable/bool").Bool;
}, {
    ageRangeCommitment: bigint;
    nullifierHash: bigint;
    parentConsentHash: bigint;
    timestamp: bigint;
    emergencyAccess: boolean;
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        ageRangeCommitment: import("o1js/dist/node/lib/provable/field").Field;
        nullifierHash: import("o1js/dist/node/lib/provable/field").Field;
        parentConsentHash: import("o1js/dist/node/lib/provable/field").Field;
        timestamp: UInt64;
        emergencyAccess: import("o1js/dist/node/lib/provable/bool").Bool;
    };
} & {
    fromValue: (value: {
        ageRangeCommitment: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        nullifierHash: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        parentConsentHash: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        timestamp: number | bigint | UInt64;
        emergencyAccess: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
    }) => {
        ageRangeCommitment: import("o1js/dist/node/lib/provable/field").Field;
        nullifierHash: import("o1js/dist/node/lib/provable/field").Field;
        parentConsentHash: import("o1js/dist/node/lib/provable/field").Field;
        timestamp: UInt64;
        emergencyAccess: import("o1js/dist/node/lib/provable/bool").Bool;
    };
    toInput: (x: {
        ageRangeCommitment: import("o1js/dist/node/lib/provable/field").Field;
        nullifierHash: import("o1js/dist/node/lib/provable/field").Field;
        parentConsentHash: import("o1js/dist/node/lib/provable/field").Field;
        timestamp: UInt64;
        emergencyAccess: import("o1js/dist/node/lib/provable/bool").Bool;
    }) => {
        fields?: Field[] | undefined;
        packed?: [Field, number][] | undefined;
    };
    toJSON: (x: {
        ageRangeCommitment: import("o1js/dist/node/lib/provable/field").Field;
        nullifierHash: import("o1js/dist/node/lib/provable/field").Field;
        parentConsentHash: import("o1js/dist/node/lib/provable/field").Field;
        timestamp: UInt64;
        emergencyAccess: import("o1js/dist/node/lib/provable/bool").Bool;
    }) => {
        ageRangeCommitment: string;
        nullifierHash: string;
        parentConsentHash: string;
        timestamp: string;
        emergencyAccess: boolean;
    };
    fromJSON: (x: {
        ageRangeCommitment: string;
        nullifierHash: string;
        parentConsentHash: string;
        timestamp: string;
        emergencyAccess: boolean;
    }) => {
        ageRangeCommitment: import("o1js/dist/node/lib/provable/field").Field;
        nullifierHash: import("o1js/dist/node/lib/provable/field").Field;
        parentConsentHash: import("o1js/dist/node/lib/provable/field").Field;
        timestamp: UInt64;
        emergencyAccess: import("o1js/dist/node/lib/provable/bool").Bool;
    };
    empty: () => {
        ageRangeCommitment: import("o1js/dist/node/lib/provable/field").Field;
        nullifierHash: import("o1js/dist/node/lib/provable/field").Field;
        parentConsentHash: import("o1js/dist/node/lib/provable/field").Field;
        timestamp: UInt64;
        emergencyAccess: import("o1js/dist/node/lib/provable/bool").Bool;
    };
};
/**
 * 🔒 CHILD AGE PROOF (Real zk-SNARK Implementation)
 */
export declare class RealChildAgeProof extends RealChildAgeProof_base {
    /**
     * 🎯 GENERATE ZK-PROOF FOR AGE RANGE
     */
    static generateProof(birthYear: number, parentWorldIDNullifier: Field, randomNonce: Field): RealChildAgeProof;
    /**
     * 🔍 VERIFY PROOF WITHOUT REVEALING AGE
     */
    verifyAgeRange(minAge: number, maxAge: number, nonce: Field): Bool;
}
declare const RealEmergencyAccessProof_base: (new (value: {
    childCommitment: import("o1js/dist/node/lib/provable/field").Field;
    parentKey: PublicKey;
    emergencyLevel: import("o1js/dist/node/lib/provable/field").Field;
    locationAccess: import("o1js/dist/node/lib/provable/bool").Bool;
    timeWindow: UInt64;
    merkleWitness: import("o1js/dist/node/lib/provable/field").Field;
}) => {
    childCommitment: import("o1js/dist/node/lib/provable/field").Field;
    parentKey: PublicKey;
    emergencyLevel: import("o1js/dist/node/lib/provable/field").Field;
    locationAccess: import("o1js/dist/node/lib/provable/bool").Bool;
    timeWindow: UInt64;
    merkleWitness: import("o1js/dist/node/lib/provable/field").Field;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    childCommitment: import("o1js/dist/node/lib/provable/field").Field;
    parentKey: PublicKey;
    emergencyLevel: import("o1js/dist/node/lib/provable/field").Field;
    locationAccess: import("o1js/dist/node/lib/provable/bool").Bool;
    timeWindow: UInt64;
    merkleWitness: import("o1js/dist/node/lib/provable/field").Field;
}, {
    childCommitment: bigint;
    parentKey: {
        x: bigint;
        isOdd: boolean;
    };
    emergencyLevel: bigint;
    locationAccess: boolean;
    timeWindow: bigint;
    merkleWitness: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        childCommitment: import("o1js/dist/node/lib/provable/field").Field;
        parentKey: PublicKey;
        emergencyLevel: import("o1js/dist/node/lib/provable/field").Field;
        locationAccess: import("o1js/dist/node/lib/provable/bool").Bool;
        timeWindow: UInt64;
        merkleWitness: import("o1js/dist/node/lib/provable/field").Field;
    };
} & {
    fromValue: (value: {
        childCommitment: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        parentKey: PublicKey | {
            x: Field | bigint;
            isOdd: Bool | boolean;
        };
        emergencyLevel: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
        locationAccess: boolean | import("o1js/dist/node/lib/provable/bool").Bool;
        timeWindow: number | bigint | UInt64;
        merkleWitness: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        childCommitment: import("o1js/dist/node/lib/provable/field").Field;
        parentKey: PublicKey;
        emergencyLevel: import("o1js/dist/node/lib/provable/field").Field;
        locationAccess: import("o1js/dist/node/lib/provable/bool").Bool;
        timeWindow: UInt64;
        merkleWitness: import("o1js/dist/node/lib/provable/field").Field;
    };
    toInput: (x: {
        childCommitment: import("o1js/dist/node/lib/provable/field").Field;
        parentKey: PublicKey;
        emergencyLevel: import("o1js/dist/node/lib/provable/field").Field;
        locationAccess: import("o1js/dist/node/lib/provable/bool").Bool;
        timeWindow: UInt64;
        merkleWitness: import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        fields?: Field[] | undefined;
        packed?: [Field, number][] | undefined;
    };
    toJSON: (x: {
        childCommitment: import("o1js/dist/node/lib/provable/field").Field;
        parentKey: PublicKey;
        emergencyLevel: import("o1js/dist/node/lib/provable/field").Field;
        locationAccess: import("o1js/dist/node/lib/provable/bool").Bool;
        timeWindow: UInt64;
        merkleWitness: import("o1js/dist/node/lib/provable/field").Field;
    }) => {
        childCommitment: string;
        parentKey: string;
        emergencyLevel: string;
        locationAccess: boolean;
        timeWindow: string;
        merkleWitness: string;
    };
    fromJSON: (x: {
        childCommitment: string;
        parentKey: string;
        emergencyLevel: string;
        locationAccess: boolean;
        timeWindow: string;
        merkleWitness: string;
    }) => {
        childCommitment: import("o1js/dist/node/lib/provable/field").Field;
        parentKey: PublicKey;
        emergencyLevel: import("o1js/dist/node/lib/provable/field").Field;
        locationAccess: import("o1js/dist/node/lib/provable/bool").Bool;
        timeWindow: UInt64;
        merkleWitness: import("o1js/dist/node/lib/provable/field").Field;
    };
    empty: () => {
        childCommitment: import("o1js/dist/node/lib/provable/field").Field;
        parentKey: PublicKey;
        emergencyLevel: import("o1js/dist/node/lib/provable/field").Field;
        locationAccess: import("o1js/dist/node/lib/provable/bool").Bool;
        timeWindow: UInt64;
        merkleWitness: import("o1js/dist/node/lib/provable/field").Field;
    };
};
/**
 * 🚨 EMERGENCY ACCESS PROOF
 */
export declare class RealEmergencyAccessProof extends RealEmergencyAccessProof_base {
    /**
     * 🔐 GENERATE EMERGENCY ACCESS TOKEN
     */
    static createEmergencyAccess(childCommitment: Field, parentKey: PublicKey, emergencyLevel: number, durationHours?: number): RealEmergencyAccessProof;
}
/**
 * 🛡️ REAL EMERGENCY SAFETY SMART CONTRACT
 */
export declare class RealEmergencySafetyContract extends SmartContract {
    globalEmergencyLevel: State<import("o1js/dist/node/lib/provable/field").Field>;
    lastEmergencyUpdate: State<UInt64>;
    registeredChildrenCount: State<import("o1js/dist/node/lib/provable/field").Field>;
    merkleRoot: State<import("o1js/dist/node/lib/provable/field").Field>;
    init(): void;
    /**
     * 🌍 REGISTER CHILD WITH ZERO-KNOWLEDGE PROOF
     */
    registerChildWithProof(ageProof: RealChildAgeProof, parentSignature: Signature, parentKey: PublicKey): Promise<void>;
    /**
     * 🚨 UPDATE GLOBAL EMERGENCY LEVEL
     */
    updateEmergencyLevel(newLevel: Field, authoritySignature: Signature, authorityKey: PublicKey): Promise<void>;
    /**
     * 🎓 RECORD SAFETY COURSE COMPLETION
     */
    recordSafetyCompletion(childCommitment: Field, courseId: Field, completionProof: Field, parentSignature: Signature, parentKey: PublicKey): Promise<void>;
}
/**
 * 🌐 REAL MINA NETWORK CLIENT
 */
export declare class RealMinaNetworkClient {
    private network;
    private contract;
    private contractAddress;
    constructor(contractAddress: string);
    /**
     * 🚀 INITIALIZE BERKELEY TESTNET CONNECTION
     */
    private initializeNetwork;
    /**
     * 📡 REAL 22KB BLOCKCHAIN SYNC
     */
    syncBlockchain(): Promise<{
        blockchainSize: string;
        currentHeight: number;
        emergencyLevel: number;
        syncTime: number;
    }>;
    /**
     * 🔒 REGISTER CHILD WITH REAL ZK-PROOF
     */
    registerChild(birthYear: number, parentWorldIDNullifier: Field, parentPrivateKey: PrivateKey): Promise<string>;
    /**
     * 🚨 GET EMERGENCY STATUS
     */
    getEmergencyStatus(): Promise<{
        level: number;
        lastUpdate: number;
        childrenCount: number;
    }>;
}
/**
 * 🏭 FACTORY FOR REAL MINA INTEGRATION
 */
export declare class MinaIntegrationFactory {
    static createRealIntegration(contractAddress: string): Promise<RealMinaNetworkClient>;
}
export { RealChildAgeProof, RealEmergencyAccessProof, RealEmergencySafetyContract };
//# sourceMappingURL=mina-real-integration.d.ts.map
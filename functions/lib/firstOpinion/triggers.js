"use strict";
/**
 * DISHA First Opinion Engine - Firestore Triggers (Gen 2)
 * Real-time score recalculation pipeline
 * Gen 2 Cloud Functions API with multi-database support
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMultiplierWrite = exports.onChallengeResponseWrite = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
const recalculate_1 = require("./recalculate");
// Custom database ID
const DB_ID = 'ai-studio-dishadiagnostice-63fe1b2b-7f23-4689-aa1a-cd41267d5918';
function getDb() {
    return admin.firestore();
}
/**
 * Trigger: Challenge response submitted or updated
 * Path: /schools/{schoolId}/assessmentCycles/{cycleId}/challengeResponses/{responseId}
 *
 * Gen 2 with explicit database specification!
 */
exports.onChallengeResponseWrite = (0, firestore_1.onDocumentWritten)({
    document: 'schools/{schoolId}/assessmentCycles/{cycleId}/challengeResponses/{responseId}',
    database: DB_ID,
    region: 'asia-south1'
}, async (event) => {
    const { schoolId, cycleId, responseId } = event.params;
    try {
        const afterData = event.data?.after.data();
        // Guard: only recalculate if this is a non-deleted response write
        if (!afterData) {
            console.log(`[Trigger:ChallengeResponse] Document deleted: ${schoolId}/${cycleId}/${responseId}`);
            // Soft-delete or true delete: still recalculate to update respondent counts
            await (0, recalculate_1.recalculateAndPersistCycleScores)(getDb(), schoolId, cycleId);
            return;
        }
        console.log(`[Trigger:ChallengeResponse] New/updated response: ${responseId}`);
        // Recalculate scores for this cycle
        await (0, recalculate_1.recalculateAndPersistCycleScores)(getDb(), schoolId, cycleId);
        console.log(`[Trigger:ChallengeResponse] Complete for ${schoolId}/${cycleId}`);
    }
    catch (error) {
        console.error(`[Trigger:ChallengeResponse] Error for ${schoolId}/${cycleId}:`, error);
        throw error; // Rethrow so Firebase knows the trigger failed
    }
});
/**
 * Trigger: Multiplier synced from external system or admin input
 * Path: /schools/{schoolId}/assessmentCycles/{cycleId}/multipliers/{multiplierId}
 *
 * Gen 2 with explicit database specification!
 */
exports.onMultiplierWrite = (0, firestore_1.onDocumentWritten)({
    document: 'schools/{schoolId}/assessmentCycles/{cycleId}/multipliers/{multiplierId}',
    database: DB_ID,
    region: 'asia-south1'
}, async (event) => {
    const { schoolId, cycleId, multiplierId } = event.params;
    try {
        const afterData = event.data?.after.data();
        if (!afterData) {
            console.log(`[Trigger:Multiplier] Document deleted: ${schoolId}/${cycleId}/${multiplierId}`);
            // Multiplier deleted: recalculate (M_obj will drop)
            await (0, recalculate_1.recalculateAndPersistCycleScores)(getDb(), schoolId, cycleId);
            return;
        }
        console.log(`[Trigger:Multiplier] Updated: ${multiplierId} = ${afterData.value} (${afterData.validationStatus})`);
        // Recalculate scores for this cycle
        await (0, recalculate_1.recalculateAndPersistCycleScores)(getDb(), schoolId, cycleId);
        console.log(`[Trigger:Multiplier] Complete for ${schoolId}/${cycleId}`);
    }
    catch (error) {
        console.error(`[Trigger:Multiplier] Error for ${schoolId}/${cycleId}:`, error);
        throw error;
    }
});
/**
 * Export trigger functions for deployment
 */
exports.default = {
    onChallengeResponseWrite: exports.onChallengeResponseWrite,
    onMultiplierWrite: exports.onMultiplierWrite
};
//# sourceMappingURL=triggers.js.map
"use strict";
/**
 * DISHA First Opinion Engine - Firestore Triggers
 * Real-time score recalculation pipeline
 * Gen-1 Cloud Functions API (onWrite pattern)
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
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const recalculate_1 = require("./recalculate");
const db = admin.firestore();
/**
 * Trigger: Challenge response submitted or updated
 * Path: /schools/{schoolId}/assessmentCycles/{cycleId}/challengeResponses/{responseId}
 *
 * When a respondent submits a challenge response:
 * 1. Trigger fires
 * 2. Fetch all non-deleted responses + multipliers for the cycle
 * 3. Recalculate S_sub, M_obj, Health Index, Gap/Quadrant
 * 4. Persist results to cycle doc + computed/latest subcollection
 * 5. Dashboard(s) subscribed to cycle.scores see updates within seconds
 */
exports.onChallengeResponseWrite = functions
    .region('us-central1')
    .firestore.document('schools/{schoolId}/assessmentCycles/{cycleId}/challengeResponses/{responseId}')
    .onWrite(async (change, context) => {
    const { schoolId, cycleId, responseId } = context.params;
    try {
        const after = change.after.data();
        // Guard: only recalculate if this is a non-deleted response write
        // (Soft-delete sets deleted=true but we still recalculate to update counts)
        if (!after) {
            console.log(`[Trigger:ChallengeResponse] Document deleted: ${schoolId}/${cycleId}/${responseId}`);
            // Soft-delete or true delete: still recalculate to update respondent counts
            await (0, recalculate_1.recalculateAndPersistCycleScores)(db, schoolId, cycleId);
            return;
        }
        console.log(`[Trigger:ChallengeResponse] New/updated response: ${responseId}`);
        // Recalculate scores for this cycle
        await (0, recalculate_1.recalculateAndPersistCycleScores)(db, schoolId, cycleId);
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
 * When a multiplier value is updated (e.g., STR synced from HR, Fee Realization from Finance):
 * 1. Trigger fires
 * 2. Fetch all non-deleted responses + ALL multipliers for the cycle
 * 3. Recalculate M_obj (geometric mean of 8 multipliers)
 * 4. Recalculate Health Index, Gap/Quadrant
 * 5. Persist to cycle doc + computed/latest
 * 6. Dashboard sees updated Health Index, quadrant, driver analysis
 */
exports.onMultiplierWrite = functions
    .region('us-central1')
    .firestore.document('schools/{schoolId}/assessmentCycles/{cycleId}/multipliers/{multiplierId}')
    .onWrite(async (change, context) => {
    const { schoolId, cycleId, multiplierId } = context.params;
    try {
        const after = change.after.data();
        if (!after) {
            console.log(`[Trigger:Multiplier] Document deleted: ${schoolId}/${cycleId}/${multiplierId}`);
            // Multiplier deleted: recalculate (M_obj will drop)
            await (0, recalculate_1.recalculateAndPersistCycleScores)(db, schoolId, cycleId);
            return;
        }
        console.log(`[Trigger:Multiplier] Updated: ${multiplierId} = ${after.value} (${after.validationStatus})`);
        // Recalculate scores for this cycle
        await (0, recalculate_1.recalculateAndPersistCycleScores)(db, schoolId, cycleId);
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
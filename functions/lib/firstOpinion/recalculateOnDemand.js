"use strict";
/**
 * DISHA First Opinion Engine - On-Demand Recalculation
 * Admin-gated callable function for manual single-cycle recalculation
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
exports.recalculateCycleScores = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const recalculate_1 = require("./recalculate");
/**
 * Recalculate a single cycle on demand (admin-gated)
 * Useful for debugging or manual re-computation
 */
exports.recalculateCycleScores = functions
    .region('us-central1')
    .https.onCall(async (data, context) => {
    // Check admin auth
    if (!context.auth || !context.auth.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Must be admin');
    }
    const { schoolId, cycleId } = data;
    // Validate input
    if (!schoolId || !cycleId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: schoolId, cycleId');
    }
    try {
        console.log(`On-demand recalculation initiated for cycle ${cycleId} by ${context.auth.uid}`);
        const db = admin.firestore();
        await (0, recalculate_1.recalculateAndPersistCycleScores)(db, schoolId, cycleId);
        console.log(`On-demand recalculation succeeded for cycle ${cycleId}`);
        return {
            success: true,
            message: `Cycle ${cycleId} recalculated successfully`,
        };
    }
    catch (error) {
        console.error(`Error in on-demand recalculation for cycle ${cycleId}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Unknown error');
    }
});
//# sourceMappingURL=recalculateOnDemand.js.map
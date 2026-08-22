"use strict";
/**
 * DISHA First Opinion Engine - Batch Processing & On-Demand Recalculation
 * Scheduled job for multi-school batch reprocessing
 * On-demand callable for single-cycle manual recalculation (debugging/support)
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
exports.recalculateCycleScores = exports.batchRecalculateAllCycles = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const recalculate_1 = require("./recalculate");
// Lazy initialization: get db inside the function, not at module load time
const getDb = () => admin.firestore();
/**
 * Scheduled Cloud Function: Recalculate scores for all active cycles
 * Runs every 6 hours to catch up any missed calculations
 *
 * Use case:
 * 1. Safety net if triggers miss a write (rare but possible edge cases)
 * 2. Reprocess stale cycles if multiplier quality improves
 * 3. Backfill historical cycles if schema changes
 *
 * Batch strategy:
 * - Query all ACTIVE cycles across all schools
 * - Per-cycle: try/catch so one failure doesn't block others
 * - Log successes and failures separately
 * - No retry: Firebase automatically retries job if function fails entirely
 */
exports.batchRecalculateAllCycles = functions
    .region('us-central1')
    .pubsub.schedule('every 6 hours')
    .onRun(async (context) => {
    try {
        console.log('[Batch] Starting cycle recalculation for all active assessments');
        // Query all active assessment cycles across all schools
        // Uses collectionGroup query (requires index)
        const q = getDb()
            .collectionGroup('assessmentCycles')
            .where('status', '==', 'ACTIVE');
        const cyclesSnapshot = await q.get();
        console.log(`[Batch] Found ${cyclesSnapshot.size} active cycles to process`);
        let processed = 0;
        let succeeded = 0;
        let failed = 0;
        const failures = [];
        for (const cycleDoc of cyclesSnapshot.docs) {
            processed++;
            // Extract schoolId from document path
            // Path format: /schools/{schoolId}/assessmentCycles/{cycleId}
            const pathParts = cycleDoc.ref.path.split('/');
            const schoolId = pathParts[1];
            const cycleId = cycleDoc.id;
            try {
                console.log(`[Batch] Processing cycle ${processed}/${cyclesSnapshot.size}: ${schoolId}/${cycleId}`);
                // Recalculate this cycle
                await (0, recalculate_1.recalculateAndPersistCycleScores)(getDb(), schoolId, cycleId);
                succeeded++;
            }
            catch (error) {
                failed++;
                const message = error instanceof Error ? error.message : String(error);
                failures.push({ schoolId, cycleId, error: message });
                console.error(`[Batch] Error processing ${schoolId}/${cycleId}:`, message);
                // Continue processing other cycles (don't rethrow here)
            }
        }
        // Summary log
        console.log('[Batch] Complete:');
        console.log(`  - Processed: ${processed}`);
        console.log(`  - Succeeded: ${succeeded}`);
        console.log(`  - Failed: ${failed}`);
        if (failures.length > 0) {
            console.warn('[Batch] Failures:', failures);
        }
        // If all failed, rethrow so the job shows as failed in Pub/Sub
        if (succeeded === 0 && cyclesSnapshot.size > 0) {
            throw new Error(`Batch job failed: 0/${cyclesSnapshot.size} cycles succeeded`);
        }
        return {
            processed,
            succeeded,
            failed,
            timestamp: new Date().toISOString()
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[Batch] Fatal error:', message);
        throw error; // Rethrowing here makes the entire job fail (Firebase will retry)
    }
});
/**
 * On-Demand Cloud Function: Manually recalculate scores for a single cycle
 * Admin-only, used for debugging or manual refresh
 *
 * Caller provides schoolId and cycleId, function reprocesses that cycle
 * Useful for:
 * 1. Manual data fixes (admin uploaded corrected multipliers)
 * 2. Debugging (test with real data)
 * 3. Support (customer requests recalc after data correction)
 */
exports.recalculateCycleScores = functions
    .region('us-central1')
    .https.onCall(async (data, context) => {
    try {
        // Auth gate
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }
        // Authorization gate: admin-only
        if (context.auth.token.role !== 'admin') {
            throw new functions.https.HttpsError('permission-denied', `User role (${context.auth.token.role}) is not admin`);
        }
        const { schoolId, cycleId } = data;
        if (!schoolId || !cycleId) {
            throw new functions.https.HttpsError('invalid-argument', 'Request must include schoolId and cycleId');
        }
        console.log(`[RecalcOnDemand] Recalculating ${schoolId}/${cycleId} (requested by ${context.auth.uid})`);
        // Recalculate
        await (0, recalculate_1.recalculateAndPersistCycleScores)(getDb(), schoolId, cycleId);
        console.log(`[RecalcOnDemand] Complete for ${schoolId}/${cycleId}`);
        return {
            success: true,
            message: `Successfully recalculated scores for ${schoolId}/${cycleId}`,
            timestamp: new Date().toISOString()
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[RecalcOnDemand] Error:', message);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', message);
    }
});
exports.default = {
    batchRecalculateAllCycles: exports.batchRecalculateAllCycles,
    recalculateCycleScores: exports.recalculateCycleScores
};
//# sourceMappingURL=batch.js.map
/**
 * DISHA First Opinion Engine - Batch Processing & On-Demand Recalculation
 * Scheduled job for multi-school batch reprocessing
 * On-demand callable for single-cycle manual recalculation (debugging/support)
 */
import * as functions from 'firebase-functions';
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
 *
 * NOTE: Scheduled functions can timeout if query takes too long.
 * If cyclesSnapshot is empty (no data yet), we gracefully return without error.
 */
export declare const batchRecalculateAllCycles: functions.CloudFunction<unknown>;
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
export declare const recalculateCycleScores: functions.HttpsFunction & functions.Runnable<any>;
declare const _default: {
    batchRecalculateAllCycles: functions.CloudFunction<unknown>;
    recalculateCycleScores: functions.HttpsFunction & functions.Runnable<any>;
};
export default _default;

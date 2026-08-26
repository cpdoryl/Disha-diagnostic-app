/**
 * DISHA First Opinion Engine - On-Demand Recalculation
 * Admin-gated callable function for manual single-cycle recalculation
 */
import * as functions from 'firebase-functions';
/**
 * Recalculate a single cycle on demand (admin-gated)
 * Useful for debugging or manual re-computation
 */
export declare const recalculateCycleScores: functions.HttpsFunction & functions.Runnable<any>;

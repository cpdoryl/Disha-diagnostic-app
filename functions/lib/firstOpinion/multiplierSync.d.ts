/**
 * DISHA First Opinion Engine - Multiplier Sync API
 * Admin-gated Cloud Function to sync 8 multiplier values from external systems
 */
import * as functions from 'firebase-functions';
/**
 * Cloud Function: Sync multiplier values from external systems
 * Only callable by admin-verified users (via Firebase Auth custom claims)
 *
 * Flow:
 * 1. Verify caller is school admin (token.schoolId matches + token.role in ['admin', 'principal'])
 * 2. Validate all 8 multiplier IDs present
 * 3. Compute validationStatus for each (VALID, OUTLIER, MISSING, PENDING)
 * 4. Write to Firestore subcollection
 * 5. Triggers fire → recalculate scores
 */
export declare const syncMultipliers: functions.HttpsFunction & functions.Runnable<any>;
declare const _default: {
    syncMultipliers: functions.HttpsFunction & functions.Runnable<any>;
};
export default _default;

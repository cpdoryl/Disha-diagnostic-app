/**
 * DISHA First Opinion Engine - Phase 4
 * Early Warning Flag Detection
 *
 * Detects 4 predictive warning signs from multi-cycle data:
 * 1. Diverging Trend: S_sub ↑ while M_obj ↓
 * 2. Multiplier Freefall: Single multiplier drops >15 pts
 * 3. Compounding Weight: Highest-weighted challenge also worst score
 * 4. False Recovery: H improves but only from S_sub, M_obj flat/worse
 */
import * as functions from 'firebase-functions';
export declare const detectEarlyWarnings: functions.HttpsFunction & functions.Runnable<any>;
declare const _default: {
    detectEarlyWarnings: functions.HttpsFunction & functions.Runnable<any>;
};
export default _default;

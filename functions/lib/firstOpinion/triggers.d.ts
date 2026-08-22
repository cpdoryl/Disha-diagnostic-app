/**
 * DISHA First Opinion Engine - Firestore Triggers
 * Real-time score recalculation pipeline
 * Gen-1 Cloud Functions API (onWrite pattern)
 */
import * as functions from 'firebase-functions';
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
export declare const onChallengeResponseWrite: functions.CloudFunction<functions.Change<functions.firestore.DocumentSnapshot>>;
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
export declare const onMultiplierWrite: functions.CloudFunction<functions.Change<functions.firestore.DocumentSnapshot>>;
/**
 * Export trigger functions for deployment
 */
declare const _default: {
    onChallengeResponseWrite: functions.CloudFunction<functions.Change<functions.firestore.DocumentSnapshot>>;
    onMultiplierWrite: functions.CloudFunction<functions.Change<functions.firestore.DocumentSnapshot>>;
};
export default _default;

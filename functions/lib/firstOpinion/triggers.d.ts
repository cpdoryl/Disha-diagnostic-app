/**
 * DISHA First Opinion Engine - Firestore Triggers (Gen 2)
 * Real-time score recalculation pipeline
 * Gen 2 Cloud Functions API with multi-database support
 */
/**
 * Trigger: Challenge response submitted or updated
 * Path: /schools/{schoolId}/assessmentCycles/{cycleId}/challengeResponses/{responseId}
 *
 * Gen 2 with explicit database specification!
 */
export declare const onChallengeResponseWrite: import("firebase-functions/v2/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").Change<import("firebase-functions/v2/firestore").DocumentSnapshot> | undefined, {
    schoolId: string;
    cycleId: string;
    responseId: string;
}>>;
/**
 * Trigger: Multiplier synced from external system or admin input
 * Path: /schools/{schoolId}/assessmentCycles/{cycleId}/multipliers/{multiplierId}
 *
 * Gen 2 with explicit database specification!
 */
export declare const onMultiplierWrite: import("firebase-functions/v2/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").Change<import("firebase-functions/v2/firestore").DocumentSnapshot> | undefined, {
    schoolId: string;
    cycleId: string;
    multiplierId: string;
}>>;
/**
 * Export trigger functions for deployment
 */
declare const _default: {
    onChallengeResponseWrite: import("firebase-functions/v2/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").Change<import("firebase-functions/v2/firestore").DocumentSnapshot> | undefined, {
        schoolId: string;
        cycleId: string;
        responseId: string;
    }>>;
    onMultiplierWrite: import("firebase-functions/v2/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").Change<import("firebase-functions/v2/firestore").DocumentSnapshot> | undefined, {
        schoolId: string;
        cycleId: string;
        multiplierId: string;
    }>>;
};
export default _default;

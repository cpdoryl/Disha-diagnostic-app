/**
 * DISHA First Opinion Engine - Phase 2
 * Challenge Response Submission API
 *
 * Handles submission of challenge responses from schools
 * Supports: Single response, batch responses, anonymous submissions
 */
import * as functions from 'firebase-functions';
export declare const submitChallengeResponse: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Batch submit multiple challenge responses
 * Used for data migration or bulk imports
 */
export declare const submitBatchChallengeResponses: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Delete/soft-delete a challenge response
 */
export declare const deleteChallengeResponse: functions.HttpsFunction & functions.Runnable<any>;
declare const _default: {
    submitChallengeResponse: functions.HttpsFunction & functions.Runnable<any>;
    submitBatchChallengeResponses: functions.HttpsFunction & functions.Runnable<any>;
    deleteChallengeResponse: functions.HttpsFunction & functions.Runnable<any>;
};
export default _default;

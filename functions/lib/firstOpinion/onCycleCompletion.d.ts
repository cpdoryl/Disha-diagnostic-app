/**
 * First Opinion Engine v3 - onCycleCompletion Firestore Trigger
 * Auto-generates early warnings when cycle scores are calculated
 */
import * as functions from 'firebase-functions';
export declare const onCycleCompletion: functions.CloudFunction<functions.Change<functions.firestore.DocumentSnapshot>>;
export default onCycleCompletion;

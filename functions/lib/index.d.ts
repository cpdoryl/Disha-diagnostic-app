import * as functions from "firebase-functions";
export declare const initializeDISHADatabase: functions.HttpsFunction & functions.Runnable<any>;
export declare const getDeploymentStatus: functions.HttpsFunction & functions.Runnable<any>;
export declare const analyzeCheckup: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
export declare const generate14DReport: functions.HttpsFunction & functions.Runnable<any>;
export declare const runSimulation: functions.HttpsFunction & functions.Runnable<any>;

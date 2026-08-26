/**
 * 14-Dimension Diagnostic Framework v2 — Metric Calculation
 * Cloud Function: Calculate all metrics and scores for closed assessments
 * Phase 3: Cloud Functions & Analysis
 */
import * as functions from 'firebase-functions';
/**
 * Calculate all metrics for a closed assessment
 * Triggered when assessment status changes to CLOSED
 */
export declare const calculateMetrics: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;

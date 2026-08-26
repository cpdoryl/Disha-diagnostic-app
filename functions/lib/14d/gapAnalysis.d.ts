/**
 * 14-Dimension Diagnostic Framework v2 — Gap Analysis Engine
 * Cloud Function: Analyze perception-reality gaps and identify blind spots
 * Phase 3: Cloud Functions & Analysis
 */
import * as functions from 'firebase-functions';
/**
 * Analyze gaps between reality and perception scores
 * Triggered after metric calculation
 */
export declare const runGapAnalysis: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Determine if a gap is a "blind spot"
 * Blind spot = Perception HIGH but Reality DECLINING (from historical data)
 */
export declare function isBlindSpot(currentReality: number, previousReality: number | undefined, perception: number): boolean;

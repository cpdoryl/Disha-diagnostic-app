/**
 * DISHA First Opinion Engine - Score Recalculation Pipeline
 * Orchestrates S_sub, M_obj, Health Index, Gap/Quadrant calculations
 * Used by both real-time triggers and batch jobs
 */
import * as admin from 'firebase-admin';
import { type ChallengeResponse, type Multiplier } from './calculations';
/**
 * Injected data-fetch function for testability
 * Real implementation reads from Firestore; tests inject fake data
 */
export interface DataFetcher {
    fetchChallengeResponses(schoolId: string, cycleId: string): Promise<ChallengeResponse[]>;
    fetchMultipliers(schoolId: string, cycleId: string): Promise<Multiplier[]>;
    fetchCycleWeights(schoolId: string, cycleId: string): Promise<Record<string, number>>;
    fetchCycleData(schoolId: string, cycleId: string): Promise<any>;
}
/**
 * Default data fetcher using Firestore Admin SDK
 */
export declare const createFirestoreDataFetcher: (db: admin.firestore.Firestore) => DataFetcher;
/**
 * Calculate and persist all scores for a cycle
 * Called by both triggers (single cycle) and batch jobs (multiple cycles)
 *
 * Data flow:
 * 1. Fetch non-deleted responses and multipliers
 * 2. Aggregate to S_sub (weighted average by challenge)
 * 3. Calculate M_obj (geometric mean of 8 multipliers)
 * 4. Compute Health Index, Gap, Quadrant
 * 5. Validate fact-vs-perception breakdown
 * 6. Calculate per-challenge severity for driver analysis
 * 7. Persist results to cycle doc + computed/latest subcollection
 */
export declare function recalculateAndPersistCycleScores(db: admin.firestore.Firestore, schoolId: string, cycleId: string, dataFetcher?: DataFetcher): Promise<void>;

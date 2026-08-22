/**
 * DISHA First Opinion Engine - Data Adapters
 * Converts Firestore Admin SDK types (Timestamp) to calculation engine types (Date)
 * Cloud Functions layer boundary transformation
 */
import type { ChallengeResponse, Multiplier } from './calculations';
/**
 * Convert Firestore-shaped challenge response (with Timestamp) to calculation-engine shape (with Date)
 * Admin SDK returns Timestamp objects; calculations expect plain Date
 */
export declare function toCalcChallengeResponse(firestoreDoc: any): ChallengeResponse;
/**
 * Convert Firestore-shaped multiplier (with Timestamp) to calculation engine shape
 * Strips additional metadata fields (rawData, source, calculation) not needed by calculations
 */
export declare function toCalcMultiplier(firestoreDoc: any): Multiplier;
/**
 * Bulk convert list of Firestore documents to calculation types
 */
export declare function toCalcChallengeResponses(docs: any[]): ChallengeResponse[];
export declare function toCalcMultipliers(docs: any[]): Multiplier[];

/**
 * DISHA First Opinion Engine - Data Adapters
 * Converts Firestore Admin SDK types (Timestamp) to calculation engine types (Date)
 * Cloud Functions layer boundary transformation
 */

import * as admin from 'firebase-admin'
import type { ChallengeResponse, Multiplier } from './calculations'

/**
 * Convert Firestore-shaped challenge response (with Timestamp) to calculation-engine shape (with Date)
 * Admin SDK returns Timestamp objects; calculations expect plain Date
 */
export function toCalcChallengeResponse(firestoreDoc: any): ChallengeResponse {
  return {
    id: firestoreDoc.id,
    challengeId: firestoreDoc.challengeId,
    responderId: firestoreDoc.responderId,
    role: firestoreDoc.role,
    email: firestoreDoc.email,
    schoolId: firestoreDoc.schoolId,
    cycleId: firestoreDoc.cycleId,
    responses: firestoreDoc.responses || {},
    challenge: firestoreDoc.challenge || {},
    submittedAt: firestoreDoc.submittedAt?.toDate?.() || new Date(),
    updatedAt: firestoreDoc.updatedAt?.toDate?.() || new Date(),
    deleted: firestoreDoc.deleted || false
  }
}

/**
 * Convert Firestore-shaped multiplier (with Timestamp) to calculation engine shape
 * Strips additional metadata fields (rawData, source, calculation) not needed by calculations
 */
export function toCalcMultiplier(firestoreDoc: any): Multiplier {
  return {
    id: firestoreDoc.id,
    name: firestoreDoc.name,
    category: firestoreDoc.category,
    value: firestoreDoc.value ?? 0,
    validationStatus: firestoreDoc.validationStatus || 'PENDING',
    validationError: firestoreDoc.validationError,
    updatedAt: firestoreDoc.updatedAt?.toDate?.() || new Date()
  }
}

/**
 * Bulk convert list of Firestore documents to calculation types
 */
export function toCalcChallengeResponses(docs: any[]): ChallengeResponse[] {
  return docs.map(toCalcChallengeResponse)
}

export function toCalcMultipliers(docs: any[]): Multiplier[] {
  return docs.map(toCalcMultiplier)
}

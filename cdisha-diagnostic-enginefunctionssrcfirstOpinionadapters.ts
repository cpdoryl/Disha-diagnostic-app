/**
 * DISHA First Opinion Engine - Type Adapters
 * Convert between Firestore Admin SDK types and calculation engine types
 */

import { Timestamp } from 'firebase-admin/firestore'
import {
  ChallengeResponse,
  Multiplier,
  QuestionResponse,
} from './calculations'

/**
 * Convert Firestore Timestamp to JavaScript Date
 */
export function firestoreTimestampToDate(ts: Timestamp | Date | undefined): Date | undefined {
  if (!ts) return undefined
  if (ts instanceof Date) return ts
  if (ts instanceof Timestamp) return ts.toDate()
  return undefined
}

/**
 * Convert Firestore challenge response document to calculation engine type
 */
export function toCalcChallengeResponse(
  doc: any,
  challengeId: string
): ChallengeResponse {
  return {
    id: doc.id,
    challengeId: challengeId,
    responderId: doc.responderId || '',
    role: doc.role || 'OTHER',
    email: doc.email || '',
    schoolId: doc.schoolId || '',
    cycleId: doc.cycleId || '',
    responses: doc.responses || {},
    challenge: doc.challenge || {
      title: '',
      domain: '',
      weight: 1 / 15,
      description: '',
    },
    submittedAt: firestoreTimestampToDate(doc.submittedAt),
    updatedAt: firestoreTimestampToDate(doc.updatedAt),
    deleted: doc.deleted || false,
  }
}

/**
 * Convert Firestore multiplier document to calculation engine type
 */
export function toCalcMultiplier(doc: any): Multiplier {
  return {
    id: doc.id,
    name: doc.name || '',
    category: doc.category || 'CORE',
    value: typeof doc.value === 'number' ? doc.value : 0,
    validationStatus: doc.validationStatus || 'PENDING',
    validationError: doc.validationError,
    updatedAt: firestoreTimestampToDate(doc.updatedAt),
  }
}

/**
 * Validate challenge response before calculation
 */
export function validateChallengeResponse(response: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!response.challengeId) errors.push('Missing challengeId')
  if (!response.responderId) errors.push('Missing responderId')
  if (!response.schoolId) errors.push('Missing schoolId')
  if (!response.cycleId) errors.push('Missing cycleId')
  if (!response.responses || typeof response.responses !== 'object') {
    errors.push('Invalid or missing responses object')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate multiplier before use in calculations
 */
export function validateMultiplier(multiplier: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!multiplier.id) errors.push('Missing multiplier id')
  if (typeof multiplier.value !== 'number') errors.push('Invalid multiplier value')
  if (multiplier.value < 0 || multiplier.value > 1.5) {
    errors.push(`Multiplier value out of range: ${multiplier.value}`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

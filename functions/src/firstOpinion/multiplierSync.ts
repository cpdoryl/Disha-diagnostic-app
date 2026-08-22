/**
 * DISHA First Opinion Engine - Multiplier Sync API
 * Admin-gated Cloud Function to sync 8 multiplier values from external systems
 */

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

const db = admin.firestore()

/**
 * Known multiplier IDs and names
 * Must match the 8 defined in seed data
 */
const KNOWN_MULTIPLIERS = new Set([
  'M1', // Student Teacher Ratio (CORE)
  'M2', // Parent Response SLA (CORE)
  'M3', // Teacher Training Hours (CORE)
  'M4', // Weekly Planning Time (CORE)
  'M5', // Fee Realization Rate (EXPANDED)
  'M6', // Safety & Compliance Score (EXPANDED)
  'M7', // Digital & LMS Usage (EXPANDED)
  'M8' // Extracurricular Participation (EXPANDED)
])

/**
 * Multiplier threshold ranges for validation
 * Maps M_id → {lower, upper} for OUTLIER detection
 */
const MULTIPLIER_RANGES: Record<string, { lower: number; upper: number }> = {
  M1: { lower: 0, upper: 60 }, // STR: 0-60 students/teacher
  M2: { lower: 0, upper: 120 }, // ParentSLA: 0-120 hours
  M3: { lower: 0, upper: 500 }, // Training: 0-500 hours/year
  M4: { lower: 0, upper: 100 }, // Planning: 0-100%
  M5: { lower: 0, upper: 100 }, // Fee: 0-100%
  M6: { lower: 0, upper: 100 }, // Safety: 0-100%
  M7: { lower: 0, upper: 100 }, // Digital: 0-100%
  M8: { lower: 0, upper: 100 } // Extracurricular: 0-100%
}

interface SyncMultipliersPayload {
  schoolId: string
  cycleId: string
  multipliers: Array<{
    id: string
    value: number
    source?: string // e.g., "HR System", "Finance", "LMS Analytics"
  }>
}

interface SyncResult {
  success: boolean
  message: string
  synced?: number
  errors?: string[]
  warnings?: string[]
}

/**
 * Cloud Function: Sync multiplier values from external systems
 * Only callable by admin-verified users (via Firebase Auth custom claims)
 *
 * Flow:
 * 1. Verify caller is school admin (token.schoolId matches + token.role in ['admin', 'principal'])
 * 2. Validate all 8 multiplier IDs present
 * 3. Compute validationStatus for each (VALID, OUTLIER, MISSING, PENDING)
 * 4. Write to Firestore subcollection
 * 5. Triggers fire → recalculate scores
 */
export const syncMultipliers = functions
  .region('us-central1')
  .https.onCall(async (data: SyncMultipliersPayload, context) => {
    try {
      // ===== AUTH GATE =====
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated'
        )
      }

      const userId = context.auth.uid
      const schoolId = data.schoolId
      const cycleId = data.cycleId
      const schoolIdFromToken = context.auth.token.schoolId
      const roleFromToken = context.auth.token.role

      // Verify admin + school match
      if (schoolIdFromToken !== schoolId) {
        throw new functions.https.HttpsError(
          'permission-denied',
          `User schoolId (${schoolIdFromToken}) does not match request schoolId (${schoolId})`
        )
      }

      if (!['admin', 'principal'].includes(roleFromToken as string)) {
        throw new functions.https.HttpsError(
          'permission-denied',
          `User role (${roleFromToken}) is not admin or principal`
        )
      }

      // ===== VALIDATION =====
      if (!data.multipliers || !Array.isArray(data.multipliers)) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Payload must include "multipliers" array'
        )
      }

      const errors: string[] = []
      const warnings: string[] = []
      let synced = 0

      // Validate payload structure
      for (let i = 0; i < data.multipliers.length; i++) {
        const m = data.multipliers[i]
        if (!m.id) errors.push(`Multiplier ${i}: missing id`)
        if (m.value === undefined || m.value === null) {
          errors.push(`Multiplier ${i} (${m.id}): missing value`)
        } else if (typeof m.value !== 'number') {
          errors.push(`Multiplier ${i} (${m.id}): value must be number`)
        } else if (m.value < 0 || m.value > 1) {
          errors.push(`Multiplier ${i} (${m.id}): value out of range [0, 1]`)
        }
      }

      if (errors.length > 0) {
        console.warn(`[SyncMultipliers] Validation errors for ${schoolId}/${cycleId}:`, errors)
        return {
          success: false,
          message: `Validation failed: ${errors.length} error(s)`,
          errors
        } as SyncResult
      }

      // Check all 8 multipliers are present
      const providedIds = new Set(data.multipliers.map(m => m.id))
      for (const knownId of KNOWN_MULTIPLIERS) {
        if (!providedIds.has(knownId)) {
          errors.push(`Missing multiplier: ${knownId}`)
        }
      }

      if (errors.length > 0) {
        console.warn(`[SyncMultipliers] Missing multipliers for ${schoolId}/${cycleId}:`, errors)
        return {
          success: false,
          message: `Incomplete payload: ${errors.length} error(s)`,
          errors
        } as SyncResult
      }

      // ===== WRITE MULTIPLIERS =====
      const cycleRef = db
        .collection('schools')
        .doc(schoolId)
        .collection('assessmentCycles')
        .doc(cycleId)

      for (const m of data.multipliers) {
        // Compute validation status based on range
        const range = MULTIPLIER_RANGES[m.id]
        let validationStatus: 'VALID' | 'OUTLIER' | 'MISSING' | 'PENDING' = 'VALID'
        let validationError: string | undefined

        if (!range) {
          validationStatus = 'PENDING'
          validationError = `Unknown multiplier ${m.id}`
        } else if (m.value < range.lower || m.value > range.upper) {
          validationStatus = 'OUTLIER'
          validationError = `Value ${m.value} outside expected range [${range.lower}, ${range.upper}]`
        }

        // Write multiplier doc
        const multiplierRef = cycleRef.collection('multipliers').doc(m.id)
        await multiplierRef.set(
          {
            id: m.id,
            name: `Multiplier ${m.id}`, // Will be matched to seed data name
            value: m.value,
            validationStatus,
            validationError: validationError || null,
            source: m.source || 'Manual',
            updatedAt: admin.firestore.Timestamp.now(),
            updatedBy: userId
          },
          { merge: true }
        )

        synced++

        if (validationStatus !== 'VALID') {
          warnings.push(
            `${m.id}: ${validationStatus}${validationError ? ` - ${validationError}` : ''}`
          )
        }
      }

      // Audit log
      await db.collection('schools').doc(schoolId).collection('auditLogs').add({
        event: 'MULTIPLIERS_SYNCED',
        cycleId,
        syncedCount: synced,
        performedBy: userId,
        performedAt: admin.firestore.Timestamp.now(),
        source: 'Callable Function'
      })

      console.log(
        `[SyncMultipliers] Success: ${synced}/${data.multipliers.length} synced for ${schoolId}/${cycleId}`
      )

      return {
        success: true,
        message: `Successfully synced ${synced} multiplier(s)`,
        synced,
        warnings: warnings.length > 0 ? warnings : undefined
      } as SyncResult
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[SyncMultipliers] Error:', message)

      if (error instanceof functions.https.HttpsError) {
        throw error
      }

      throw new functions.https.HttpsError('internal', message)
    }
  })

export default { syncMultipliers }

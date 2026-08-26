/**
 * DISHA First Opinion Engine - Multiplier Sync
 * Admin-gated callable function to sync multiplier values
 */

import * as functions from 'firebase-functions'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { validateMultiplier } from './adapters'

interface SyncMultiplierRequest {
  schoolId: string
  cycleId: string
  multipliers: Array<{
    id: string
    name: string
    value: number
    category: 'CORE' | 'EXPANDED'
  }>
}

/**
 * Sync multiplier values for a cycle (admin-gated)
 * Validates all multipliers before persisting
 */
export const syncMultipliers = functions
  .region('us-central1')
  .https.onCall(async (data: SyncMultiplierRequest, context) => {
    // Check admin auth (custom claim)
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError('permission-denied', 'Must be admin')
    }

    const { schoolId, cycleId, multipliers } = data
    const db = getFirestore()

    // Validate input
    if (!schoolId || !cycleId || !Array.isArray(multipliers) || multipliers.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: schoolId, cycleId, multipliers'
      )
    }

    // Known multiplier IDs (from seed data)
    const validMultiplierIds = new Set([
      'M1', 'M2', 'M3', 'M4', // Core
      'M5', 'M6', 'M7', 'M8', // Expanded
    ])

    try {
      const cycleRef = db
        .collection('schools')
        .doc(schoolId)
        .collection('assessmentCycles')
        .doc(cycleId)

      // Write each multiplier with validation status
      const syncResults = []
      for (const m of multipliers) {
        // Validate against known IDs
        if (!validMultiplierIds.has(m.id)) {
          syncResults.push({
            id: m.id,
            status: 'INVALID',
            error: `Unknown multiplier ID: ${m.id}`,
          })
          continue
        }

        // Validate value range
        const validation = validateMultiplier(m)
        if (!validation.valid) {
          syncResults.push({
            id: m.id,
            status: 'INVALID',
            error: validation.errors.join('; '),
          })
          continue
        }

        // Write multiplier
        await cycleRef.collection('multipliers').doc(m.id).set(
          {
            id: m.id,
            name: m.name,
            category: m.category,
            value: m.value,
            validationStatus: 'VALID',
            validationError: null,
            updatedAt: Timestamp.now(),
            syncedBy: context.auth.uid,
          },
          { merge: true }
        )

        syncResults.push({
          id: m.id,
          status: 'SYNCED',
        })
      }

      console.log(`Synced ${syncResults.filter((r) => r.status === 'SYNCED').length} multipliers for cycle ${cycleId}`)

      return {
        success: true,
        syncedCount: syncResults.filter((r) => r.status === 'SYNCED').length,
        invalidCount: syncResults.filter((r) => r.status === 'INVALID').length,
        results: syncResults,
      }
    } catch (error) {
      console.error(`Error syncing multipliers for cycle ${cycleId}:`, error)
      throw new functions.https.HttpsError(
        'internal',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  })

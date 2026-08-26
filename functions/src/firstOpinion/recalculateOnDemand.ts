/**
 * DISHA First Opinion Engine - On-Demand Recalculation
 * Admin-gated callable function for manual single-cycle recalculation
 */

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { recalculateAndPersistCycleScores } from './recalculate'

interface RecalculateRequest {
  schoolId: string
  cycleId: string
}

/**
 * Recalculate a single cycle on demand (admin-gated)
 * Useful for debugging or manual re-computation
 */
export const recalculateCycleScores = functions
  .region('us-central1')
  .https.onCall(async (data: RecalculateRequest, context) => {
    // Check admin auth
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError('permission-denied', 'Must be admin')
    }

    const { schoolId, cycleId } = data

    // Validate input
    if (!schoolId || !cycleId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: schoolId, cycleId'
      )
    }

    try {
      console.log(`On-demand recalculation initiated for cycle ${cycleId} by ${context.auth.uid}`)

      const db = admin.firestore()
      await recalculateAndPersistCycleScores(db, schoolId, cycleId)

      console.log(
        `On-demand recalculation succeeded for cycle ${cycleId}`
      )

      return {
        success: true,
        message: `Cycle ${cycleId} recalculated successfully`,
      }
    } catch (error) {
      console.error(`Error in on-demand recalculation for cycle ${cycleId}:`, error)
      if (error instanceof functions.https.HttpsError) {
        throw error
      }
      throw new functions.https.HttpsError(
        'internal',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  })

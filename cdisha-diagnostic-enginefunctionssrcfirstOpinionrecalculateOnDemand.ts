/**
 * DISHA First Opinion Engine - On-Demand Recalculation
 * Admin-gated callable function for manual single-cycle recalculation
 */

import * as functions from 'firebase-functions'
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

      const result = await recalculateAndPersistCycleScores(schoolId, cycleId)

      if (!result.success) {
        throw new functions.https.HttpsError(
          'internal',
          `Recalculation failed: ${result.error}`
        )
      }

      console.log(
        `On-demand recalculation succeeded for cycle ${cycleId} - S_sub: ${result.s_sub}, M_obj: ${result.m_obj}`
      )

      return {
        success: true,
        scores: {
          s_sub: result.s_sub,
          m_obj: result.m_obj,
          healthIndex: result.healthIndex,
          gap: result.gap,
          quadrant: result.quadrant,
        },
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

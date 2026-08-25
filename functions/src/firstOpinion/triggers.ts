/**
 * DISHA First Opinion Engine - Firestore Triggers (Gen 2)
 * Real-time score recalculation pipeline
 * Gen 2 Cloud Functions API with multi-database support
 */

import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import * as admin from 'firebase-admin'
import { recalculateAndPersistCycleScores } from './recalculate'

// Custom database ID
const DB_ID = 'ai-studio-dishadiagnostice-63fe1b2b-7f23-4689-aa1a-cd41267d5918'

function getDb() {
  return admin.firestore()
}

/**
 * Trigger: Challenge response submitted or updated
 * Path: /schools/{schoolId}/assessmentCycles/{cycleId}/challengeResponses/{responseId}
 *
 * Gen 2 with explicit database specification!
 */
export const onChallengeResponseWrite = onDocumentWritten(
  {
    document: 'schools/{schoolId}/assessmentCycles/{cycleId}/challengeResponses/{responseId}',
    database: DB_ID, // ← KEY FIX: Explicitly specify custom database!
    region: 'us-central1'
  },
  async (event) => {
    const { schoolId, cycleId, responseId } = event.params

    try {
      const afterData = event.data?.after.data()

      // Guard: only recalculate if this is a non-deleted response write
      if (!afterData) {
        console.log(
          `[Trigger:ChallengeResponse] Document deleted: ${schoolId}/${cycleId}/${responseId}`
        )
        // Soft-delete or true delete: still recalculate to update respondent counts
        await recalculateAndPersistCycleScores(getDb(), schoolId, cycleId)
        return
      }

      console.log(`[Trigger:ChallengeResponse] New/updated response: ${responseId}`)

      // Recalculate scores for this cycle
      await recalculateAndPersistCycleScores(getDb(), schoolId, cycleId)

      console.log(`[Trigger:ChallengeResponse] Complete for ${schoolId}/${cycleId}`)
    } catch (error) {
      console.error(`[Trigger:ChallengeResponse] Error for ${schoolId}/${cycleId}:`, error)
      throw error // Rethrow so Firebase knows the trigger failed
    }
  }
)

/**
 * Trigger: Multiplier synced from external system or admin input
 * Path: /schools/{schoolId}/assessmentCycles/{cycleId}/multipliers/{multiplierId}
 *
 * Gen 2 with explicit database specification!
 */
export const onMultiplierWrite = onDocumentWritten(
  {
    document: 'schools/{schoolId}/assessmentCycles/{cycleId}/multipliers/{multiplierId}',
    database: DB_ID, // ← KEY FIX: Explicitly specify custom database!
    region: 'us-central1'
  },
  async (event) => {
    const { schoolId, cycleId, multiplierId } = event.params

    try {
      const afterData = event.data?.after.data()

      if (!afterData) {
        console.log(`[Trigger:Multiplier] Document deleted: ${schoolId}/${cycleId}/${multiplierId}`)
        // Multiplier deleted: recalculate (M_obj will drop)
        await recalculateAndPersistCycleScores(getDb(), schoolId, cycleId)
        return
      }

      console.log(
        `[Trigger:Multiplier] Updated: ${multiplierId} = ${afterData.value} (${afterData.validationStatus})`
      )

      // Recalculate scores for this cycle
      await recalculateAndPersistCycleScores(getDb(), schoolId, cycleId)

      console.log(`[Trigger:Multiplier] Complete for ${schoolId}/${cycleId}`)
    } catch (error) {
      console.error(`[Trigger:Multiplier] Error for ${schoolId}/${cycleId}:`, error)
      throw error
    }
  }
)

/**
 * Export trigger functions for deployment
 */
export default {
  onChallengeResponseWrite,
  onMultiplierWrite
}

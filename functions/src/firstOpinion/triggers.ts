/**
 * DISHA First Opinion Engine - Firestore Triggers
 * Real-time score recalculation pipeline
 * Gen-1 Cloud Functions API (onWrite pattern)
 */

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { recalculateAndPersistCycleScores } from './recalculate'

// Lazy initialization: get db inside the function, not at module load time
const getDb = () => admin.firestore()

/**
 * Trigger: Challenge response submitted or updated
 * Path: /schools/{schoolId}/assessmentCycles/{cycleId}/challengeResponses/{responseId}
 *
 * When a respondent submits a challenge response:
 * 1. Trigger fires
 * 2. Fetch all non-deleted responses + multipliers for the cycle
 * 3. Recalculate S_sub, M_obj, Health Index, Gap/Quadrant
 * 4. Persist results to cycle doc + computed/latest subcollection
 * 5. Dashboard(s) subscribed to cycle.scores see updates within seconds
 */
export const onChallengeResponseWrite = functions
  .region('us-central1')
  .firestore.document('schools/{schoolId}/assessmentCycles/{cycleId}/challengeResponses/{responseId}')
  .onWrite(async (change, context) => {
    const { schoolId, cycleId, responseId } = context.params

    try {
      const after = change.after.data()

      // Guard: only recalculate if this is a non-deleted response write
      // (Soft-delete sets deleted=true but we still recalculate to update counts)
      if (!after) {
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
  })

/**
 * Trigger: Multiplier synced from external system or admin input
 * Path: /schools/{schoolId}/assessmentCycles/{cycleId}/multipliers/{multiplierId}
 *
 * When a multiplier value is updated (e.g., STR synced from HR, Fee Realization from Finance):
 * 1. Trigger fires
 * 2. Fetch all non-deleted responses + ALL multipliers for the cycle
 * 3. Recalculate M_obj (geometric mean of 8 multipliers)
 * 4. Recalculate Health Index, Gap/Quadrant
 * 5. Persist to cycle doc + computed/latest
 * 6. Dashboard sees updated Health Index, quadrant, driver analysis
 */
export const onMultiplierWrite = functions
  .region('us-central1')
  .firestore.document('schools/{schoolId}/assessmentCycles/{cycleId}/multipliers/{multiplierId}')
  .onWrite(async (change, context) => {
    const { schoolId, cycleId, multiplierId } = context.params

    try {
      const after = change.after.data()

      if (!after) {
        console.log(`[Trigger:Multiplier] Document deleted: ${schoolId}/${cycleId}/${multiplierId}`)
        // Multiplier deleted: recalculate (M_obj will drop)
        await recalculateAndPersistCycleScores(getDb(), schoolId, cycleId)
        return
      }

      console.log(
        `[Trigger:Multiplier] Updated: ${multiplierId} = ${after.value} (${after.validationStatus})`
      )

      // Recalculate scores for this cycle
      await recalculateAndPersistCycleScores(getDb(), schoolId, cycleId)

      console.log(`[Trigger:Multiplier] Complete for ${schoolId}/${cycleId}`)
    } catch (error) {
      console.error(`[Trigger:Multiplier] Error for ${schoolId}/${cycleId}:`, error)
      throw error
    }
  })

/**
 * Export trigger functions for deployment
 */
export default {
  onChallengeResponseWrite,
  onMultiplierWrite
}

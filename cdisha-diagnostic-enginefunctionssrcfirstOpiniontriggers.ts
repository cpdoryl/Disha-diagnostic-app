/**
 * DISHA First Opinion Engine - Firestore Triggers
 * Automatic recalculation when challenge responses or multipliers change
 */

import * as functions from 'firebase-functions'
import { getFirestore } from 'firebase-admin/firestore'
import { recalculateAndPersistCycleScores } from './recalculate'

/**
 * Trigger on challengeResponse writes
 * Soft-delete: set deleted=true instead of actually deleting
 */
export const onChallengeResponseWrite = functions
  .region('us-central1')
  .firestore.document('schools/{schoolId}/assessmentCycles/{cycleId}/challengeResponses/{responseId}')
  .onWrite(async (change, context) => {
    const { schoolId, cycleId } = context.params
    const db = getFirestore()

    try {
      // Only recalculate if active cycle
      const cycleRef = db
        .collection('schools')
        .doc(schoolId)
        .collection('assessmentCycles')
        .doc(cycleId)

      const cycleSnapshot = await cycleRef.get()
      if (!cycleSnapshot.exists || cycleSnapshot.data()?.status !== 'ACTIVE') {
        console.log(`Skipping recalculation: cycle ${cycleId} not active`)
        return
      }

      // Recalculate scores
      const result = await recalculateAndPersistCycleScores(schoolId, cycleId)
      if (!result.success) {
        console.error(`Failed to recalculate after response write: ${result.error}`)
      } else {
        console.log(
          `Response trigger: Recalculated cycle ${cycleId} - S_sub: ${result.s_sub}, M_obj: ${result.m_obj}`
        )
      }
    } catch (error) {
      console.error(`Error in challengeResponse trigger for cycle ${cycleId}:`, error)
      throw error
    }
  })

/**
 * Trigger on multiplier writes
 * Recalculates cycle scores when multiplier values change
 */
export const onMultiplierWrite = functions
  .region('us-central1')
  .firestore.document('schools/{schoolId}/assessmentCycles/{cycleId}/multipliers/{multiplierId}')
  .onWrite(async (change, context) => {
    const { schoolId, cycleId } = context.params
    const db = getFirestore()

    try {
      // Verify cycle status
      const cycleRef = db
        .collection('schools')
        .doc(schoolId)
        .collection('assessmentCycles')
        .doc(cycleId)

      const cycleSnapshot = await cycleRef.get()
      if (!cycleSnapshot.exists || cycleSnapshot.data()?.status !== 'ACTIVE') {
        console.log(`Skipping multiplier recalculation: cycle ${cycleId} not active`)
        return
      }

      // Recalculate scores
      const result = await recalculateAndPersistCycleScores(schoolId, cycleId)
      if (!result.success) {
        console.error(`Failed to recalculate after multiplier write: ${result.error}`)
      } else {
        console.log(
          `Multiplier trigger: Recalculated cycle ${cycleId} - S_sub: ${result.s_sub}, M_obj: ${result.m_obj}`
        )
      }
    } catch (error) {
      console.error(`Error in multiplier trigger for cycle ${cycleId}:`, error)
      throw error
    }
  })

/**
 * DISHA First Opinion Engine - Batch Processing
 * Scheduled function to recalculate all active cycles every 6 hours
 */

import * as functions from 'firebase-functions'
import { getFirestore } from 'firebase-admin/firestore'
import { recalculateAndPersistCycleScores } from './recalculate'

/**
 * Batch recalculate all active cycles (scheduled every 6 hours)
 * Uses collection-group query to find all active cycles across all schools
 */
export const batchRecalculateAllCycles = functions
  .region('us-central1')
  .pubsub.schedule('every 6 hours')
  .onRun(async (context) => {
    const db = getFirestore()
    const startTime = Date.now()

    try {
      // Find all active cycles across all schools using collection-group query
      const cyclesSnapshot = await db
        .collectionGroup('assessmentCycles')
        .where('status', '==', 'ACTIVE')
        .get()

      console.log(`Found ${cyclesSnapshot.size} active cycles to recalculate`)

      const results = {
        total: cyclesSnapshot.size,
        success: 0,
        failed: 0,
        failures: [] as Array<{ schoolId: string; cycleId: string; error: string }>,
      }

      // Process each cycle with try/catch to prevent one failure from aborting the run
      for (const cycleDoc of cyclesSnapshot.docs) {
        const cycleData = cycleDoc.data()
        const schoolId = cycleDoc.ref.parent.parent?.parent.id || 'unknown'
        const cycleId = cycleDoc.id

        try {
          const result = await recalculateAndPersistCycleScores(schoolId, cycleId)
          if (result.success) {
            results.success++
            console.log(
              `Batch: Recalculated cycle ${cycleId} - S_sub: ${result.s_sub}, M_obj: ${result.m_obj}`
            )
          } else {
            results.failed++
            results.failures.push({
              schoolId,
              cycleId,
              error: result.error || 'Unknown error',
            })
            console.warn(`Batch: Failed to recalculate cycle ${cycleId}: ${result.error}`)
          }
        } catch (error) {
          results.failed++
          results.failures.push({
            schoolId,
            cycleId,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          console.error(`Batch: Error recalculating cycle ${cycleId}:`, error)
        }
      }

      const elapsed = Date.now() - startTime
      console.log(
        `Batch recalculation complete: ${results.success} succeeded, ${results.failed} failed in ${elapsed}ms`
      )

      if (results.failures.length > 0) {
        console.warn('Failed cycles:', results.failures)
      }

      return results
    } catch (error) {
      console.error('Error in batch recalculation:', error)
      throw error
    }
  })

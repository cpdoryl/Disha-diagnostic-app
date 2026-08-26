/**
 * DISHA First Opinion Engine - Batch Processing & On-Demand Recalculation
 * Scheduled job for multi-school batch reprocessing
 * On-demand callable for single-cycle manual recalculation (debugging/support)
 */

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { recalculateAndPersistCycleScores } from './recalculate'

// Lazy initialization: get db inside the function, not at module load time
const getDb = () => admin.firestore()

/**
 * Scheduled Cloud Function: Recalculate scores for all active cycles
 * Runs every 6 hours to catch up any missed calculations
 *
 * Use case:
 * 1. Safety net if triggers miss a write (rare but possible edge cases)
 * 2. Reprocess stale cycles if multiplier quality improves
 * 3. Backfill historical cycles if schema changes
 *
 * Batch strategy:
 * - Query all ACTIVE cycles across all schools
 * - Per-cycle: try/catch so one failure doesn't block others
 * - Log successes and failures separately
 * - No retry: Firebase automatically retries job if function fails entirely
 *
 * NOTE: Scheduled functions can timeout if query takes too long.
 * If cyclesSnapshot is empty (no data yet), we gracefully return without error.
 */
export const batchRecalculateAllCycles = functions
  .region('asia-south1')
  .pubsub.schedule('every 6 hours')
  .timeoutSeconds(540)
  .onRun(async (context) => {
    try {
      console.log('[Batch] Starting cycle recalculation for all active assessments')

      // Query all active assessment cycles across all schools
      // Uses collectionGroup query (requires index)
      // This is safe if no cycles exist yet (empty result is OK)
      const db = getDb()

      // Check if assessmentCycles collection exists by querying one school first
      const testQuery = db
        .collectionGroup('assessmentCycles')
        .where('status', '==', 'ACTIVE')
        .limit(1)

      const cyclesSnapshot = await testQuery.get()

      if (cyclesSnapshot.empty) {
        console.log('[Batch] No active cycles found. Skipping batch processing.')
        return {
          processed: 0,
          succeeded: 0,
          failed: 0,
          message: 'No active assessment cycles',
          timestamp: new Date().toISOString()
        }
      }

      console.log(`[Batch] Found ${cyclesSnapshot.size} active cycles to process`)

      let processed = 0
      let succeeded = 0
      let failed = 0
      const failures: Array<{ schoolId: string; cycleId: string; error: string }> = []

      for (const cycleDoc of cyclesSnapshot.docs) {
        processed++

        // Extract schoolId from document path
        // Path format: /schools/{schoolId}/assessmentCycles/{cycleId}
        const pathParts = cycleDoc.ref.path.split('/')
        const schoolId = pathParts[1]
        const cycleId = cycleDoc.id

        try {
          console.log(
            `[Batch] Processing cycle ${processed}/${cyclesSnapshot.size}: ${schoolId}/${cycleId}`
          )

          // Recalculate this cycle
          await recalculateAndPersistCycleScores(getDb(), schoolId, cycleId)

          succeeded++
        } catch (error) {
          failed++
          const message = error instanceof Error ? error.message : String(error)
          failures.push({ schoolId, cycleId, error: message })
          console.error(
            `[Batch] Error processing ${schoolId}/${cycleId}:`,
            message
          )
          // Continue processing other cycles (don't rethrow here)
        }
      }

      // Summary log
      console.log('[Batch] Complete:')
      console.log(`  - Processed: ${processed}`)
      console.log(`  - Succeeded: ${succeeded}`)
      console.log(`  - Failed: ${failed}`)

      if (failures.length > 0) {
        console.warn('[Batch] Failures:', failures)
      }

      // Note: We don't rethrow even if some cycles failed, since partial success is OK
      // The scheduled job should be considered successful if it ran without fatal errors
      return {
        processed,
        succeeded,
        failed,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[Batch] Fatal error:', message)
      // Log the error but don't rethrow - scheduled functions should be resilient
      return {
        processed: 0,
        succeeded: 0,
        failed: 0,
        error: message,
        timestamp: new Date().toISOString()
      }
    }
  })

/**
 * On-Demand Cloud Function: Manually recalculate scores for a single cycle
 * Admin-only, used for debugging or manual refresh
 *
 * Caller provides schoolId and cycleId, function reprocesses that cycle
 * Useful for:
 * 1. Manual data fixes (admin uploaded corrected multipliers)
 * 2. Debugging (test with real data)
 * 3. Support (customer requests recalc after data correction)
 */
export const recalculateCycleScores = functions
  .region('asia-south1')
  .https.onCall(async (data: { schoolId: string; cycleId: string }, context) => {
    try {
      // Auth gate
      if (!context.auth) {
        throw new functions.https.HttpsError(
          'unauthenticated',
          'User must be authenticated'
        )
      }

      // Authorization gate: admin-only
      if (context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError(
          'permission-denied',
          `User role (${context.auth.token.role}) is not admin`
        )
      }

      const { schoolId, cycleId } = data

      if (!schoolId || !cycleId) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Request must include schoolId and cycleId'
        )
      }

      console.log(`[RecalcOnDemand] Recalculating ${schoolId}/${cycleId} (requested by ${context.auth.uid})`)

      // Recalculate
      await recalculateAndPersistCycleScores(getDb(), schoolId, cycleId)

      console.log(`[RecalcOnDemand] Complete for ${schoolId}/${cycleId}`)

      return {
        success: true,
        message: `Successfully recalculated scores for ${schoolId}/${cycleId}`,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[RecalcOnDemand] Error:', message)

      if (error instanceof functions.https.HttpsError) {
        throw error
      }

      throw new functions.https.HttpsError('internal', message)
    }
  })

export default {
  batchRecalculateAllCycles,
  recalculateCycleScores
}

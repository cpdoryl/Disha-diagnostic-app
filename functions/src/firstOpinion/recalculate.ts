/**
 * DISHA First Opinion Engine - Score Recalculation Pipeline
 * Orchestrates S_sub, M_obj, Health Index, Gap/Quadrant calculations
 * Used by both real-time triggers and batch jobs
 */

import * as admin from 'firebase-admin'
import {
  calculateSsub,
  calculateAllScores,
  validateChallengeResponses,
  calculateChallengeSeverity,
  type ChallengeResponse,
  type Multiplier
} from './calculations'
import { toCalcChallengeResponse, toCalcMultiplier } from './adapters'

/**
 * Injected data-fetch function for testability
 * Real implementation reads from Firestore; tests inject fake data
 */
export interface DataFetcher {
  fetchChallengeResponses(schoolId: string, cycleId: string): Promise<ChallengeResponse[]>
  fetchMultipliers(schoolId: string, cycleId: string): Promise<Multiplier[]>
  fetchCycleWeights(schoolId: string, cycleId: string): Promise<Record<string, number>>
  fetchCycleData(schoolId: string, cycleId: string): Promise<any>
}

/**
 * Default data fetcher using Firestore Admin SDK
 */
export const createFirestoreDataFetcher = (db: admin.firestore.Firestore): DataFetcher => ({
  async fetchChallengeResponses(schoolId: string, cycleId: string) {
    const q = db
      .collection('schools')
      .doc(schoolId)
      .collection('assessmentCycles')
      .doc(cycleId)
      .collection('challengeResponses')
      .where('deleted', '==', false)

    const snapshot = await q.get()
    return snapshot.docs.map(doc => toCalcChallengeResponse(doc.data()))
  },

  async fetchMultipliers(schoolId: string, cycleId: string) {
    const q = db
      .collection('schools')
      .doc(schoolId)
      .collection('assessmentCycles')
      .doc(cycleId)
      .collection('multipliers')

    const snapshot = await q.get()
    return snapshot.docs.map(doc => toCalcMultiplier(doc.data()))
  },

  async fetchCycleWeights(schoolId: string, cycleId: string) {
    const cycleDoc = await db
      .collection('schools')
      .doc(schoolId)
      .collection('assessmentCycles')
      .doc(cycleId)
      .get()

    return cycleDoc.data()?.config?.weights || {}
  },

  async fetchCycleData(schoolId: string, cycleId: string) {
    const doc = await db
      .collection('schools')
      .doc(schoolId)
      .collection('assessmentCycles')
      .doc(cycleId)
      .get()

    return doc.data()
  }
})

/**
 * Calculate and persist all scores for a cycle
 * Called by both triggers (single cycle) and batch jobs (multiple cycles)
 *
 * Data flow:
 * 1. Fetch non-deleted responses and multipliers
 * 2. Aggregate to S_sub (weighted average by challenge)
 * 3. Calculate M_obj (geometric mean of 8 multipliers)
 * 4. Compute Health Index, Gap, Quadrant
 * 5. Validate fact-vs-perception breakdown
 * 6. Calculate per-challenge severity for driver analysis
 * 7. Persist results to cycle doc + computed/latest subcollection
 */
export async function recalculateAndPersistCycleScores(
  db: admin.firestore.Firestore,
  schoolId: string,
  cycleId: string,
  dataFetcher: DataFetcher = createFirestoreDataFetcher(db)
): Promise<void> {
  try {
    console.log(`[Recalculate] Starting for ${schoolId}/${cycleId}`)

    // Fetch input data
    const [responses, multipliers, weights, cycleData] = await Promise.all([
      dataFetcher.fetchChallengeResponses(schoolId, cycleId),
      dataFetcher.fetchMultipliers(schoolId, cycleId),
      dataFetcher.fetchCycleWeights(schoolId, cycleId),
      dataFetcher.fetchCycleData(schoolId, cycleId)
    ])

    // Guard: ensure we have data
    if (!responses || responses.length === 0) {
      console.warn(`[Recalculate] No responses found for ${schoolId}/${cycleId}`)
      return
    }

    // Calculate S_sub (subjective score)
    const s_sub = calculateSsub(responses, weights)
    console.log(`  S_sub: ${s_sub}`)

    // Calculate M_obj (objective score) from 8 multipliers
    // Extract valid multipliers; if missing, M_obj = 50 (default midpoint)
    const validMultipliers = multipliers.filter(m => m.validationStatus === 'VALID')
    const m_obj = validMultipliers.length > 0 ? calculateSsub([], {}) : 50
    // TODO: Replace with actual M_obj calculation once multiplier data structure is finalized
    console.log(`  M_obj: ${m_obj}`)

    // Calculate Health Index, Gap, Quadrant
    const allScores = calculateAllScores(s_sub, m_obj)

    // Validate fact-vs-perception
    const validation = validateChallengeResponses(responses)

    // Calculate per-challenge severity (for driver analysis in Phase 3)
    const challengeSeverities: Record<string, any> = {}
    const challengeGroups: Record<string, ChallengeResponse[]> = {}
    responses.forEach(r => {
      if (!challengeGroups[r.challengeId]) challengeGroups[r.challengeId] = []
      challengeGroups[r.challengeId].push(r)
    })

    for (const [challengeId, challengeResponses] of Object.entries(challengeGroups)) {
      const severity = calculateChallengeSeverity(challengeResponses, weights[challengeId] || 0.067)
      challengeSeverities[challengeId] = severity
    }

    // Tally respondent count by role
    const respondentsByRole: Record<string, number> = {}
    responses.forEach(r => {
      respondentsByRole[r.role] = (respondentsByRole[r.role] || 0) + 1
    })

    // Persist to cycle doc
    const cycleRef = db
      .collection('schools')
      .doc(schoolId)
      .collection('assessmentCycles')
      .doc(cycleId)

    await cycleRef.update({
      'scores.s_sub': allScores.s_sub,
      'scores.m_obj': allScores.m_obj,
      'scores.healthIndex': allScores.healthIndex,
      'scores.gap': allScores.gap,
      'scores.quadrant': allScores.quadrant,
      'scores.delusionPenalty': allScores.delusionPenalty,
      'scores.calculatedAt': admin.firestore.Timestamp.now(),
      respondentCount: responses.length,
      respondentsByRole: respondentsByRole,
      'status': cycleData?.status || 'ACTIVE',
      'updatedAt': admin.firestore.Timestamp.now()
    })

    // Persist rich calculation details to computed/latest subcollection
    const computedRef = cycleRef.collection('computed').doc('latest')

    await computedRef.set({
      schoolId,
      cycleId,
      s_sub: allScores.s_sub,
      m_obj: allScores.m_obj,
      healthIndex: allScores.healthIndex,
      gap: allScores.gap,
      quadrant: allScores.quadrant,
      interpretation: allScores.interpretation,
      delusionPenalty: allScores.delusionPenalty,
      communicationGap: allScores.quadrant === 'REALITY_BETTER',
      blindSpotRisk: allScores.quadrant === 'PERCEPTION_BETTER',
      validation: {
        isValid: validation.isValid,
        score: validation.score,
        errors: validation.errors,
        warnings: validation.warnings,
        factVsPerceptionBreakdown: validation.factVsPerceptionBreakdown
      },
      challengeSeverity: challengeSeverities,
      respondentCount: responses.length,
      respondentsByRole: respondentsByRole,
      calculatedAt: admin.firestore.Timestamp.now()
    })

    console.log(`[Recalculate] Complete for ${schoolId}/${cycleId}`)
  } catch (error) {
    console.error(`[Recalculate] Error for ${schoolId}/${cycleId}:`, error)
    throw error
  }
}

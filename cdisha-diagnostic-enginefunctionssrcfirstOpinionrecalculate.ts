/**
 * DISHA First Opinion Engine - Score Recalculation
 * Orchestration function for calculating and persisting cycle scores
 */

import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import {
  calculateSsub,
  calculateMobj,
  calculateAllScores,
  validateChallengeResponses,
  calculateChallengeSeverity,
  type ChallengeResponse,
  type Multiplier,
} from './calculations'
import { toCalcChallengeResponse, toCalcMultiplier } from './adapters'

/**
 * Recalculate and persist cycle scores
 * Reads non-deleted responses + multipliers, runs full calculation pipeline,
 * writes results to cycle doc and computed subcollection
 */
export async function recalculateAndPersistCycleScores(
  schoolId: string,
  cycleId: string,
  injectedDataFetch?: (
    schoolId: string,
    cycleId: string
  ) => Promise<{
    responses: ChallengeResponse[]
    multipliers: Multiplier[]
    weights: Record<string, number>
  }>
): Promise<{
  success: boolean
  s_sub: number
  m_obj: number
  healthIndex: number
  gap: number
  quadrant: string
  error?: string
}> {
  const db = getFirestore()

  try {
    // Fetch data (use injected function for testing, otherwise real Firestore)
    let data
    if (injectedDataFetch) {
      data = await injectedDataFetch(schoolId, cycleId)
    } else {
      data = await fetchCycleData(db, schoolId, cycleId)
    }

    const { responses, multipliers, weights } = data

    // Run calculation pipeline
    const s_sub = calculateSsub(responses, weights)
    const m_obj = calculateMobj(multipliers)
    const allScores = calculateAllScores(s_sub, m_obj)
    const { gap, quadrant } = allScores
    const { healthIndex, interpretation, delusionPenalty } = allScores

    // Validate challenge-by-challenge
    const validation = validateChallengeResponses(responses, weights)
    const challengeSeverities = responses.map((r) => ({
      challengeId: r.challengeId,
      severity: calculateChallengeSeverity(r),
    }))

    // Persist to cycle document
    const cycleRef = db.collection('schools').doc(schoolId).collection('assessmentCycles').doc(cycleId)
    await cycleRef.update({
      scores: {
        s_sub,
        m_obj,
        healthIndex,
        gap,
        quadrant,
      },
      respondentCount: responses.length,
      validationStatus: validation.isValid ? 'VALID' : 'INVALID',
      lastCalculatedAt: Timestamp.now(),
      delusionPenalty,
      interpretation,
      challengeSeverities,
    })

    // Persist detailed computation to computed/latest subcollection
    const computedRef = cycleRef.collection('computed').doc('latest')
    await computedRef.set({
      s_sub,
      m_obj,
      healthIndex,
      gap,
      quadrant,
      interpretation,
      delusionPenalty,
      communicationGap: Math.abs(s_sub - m_obj), // Perception-reality gap
      blindSpotRisk: s_sub > 80 && gap > 20 ? 'HIGH' : 'LOW',
      validation: {
        factPerceptionAlignment: validation.factPerceptionAlignment,
        isConsistent: validation.isConsistent,
        isValid: validation.isValid,
      },
      challengeSeverity: Object.fromEntries(
        challengeSeverities.map((cs) => [cs.challengeId, cs.severity])
      ),
      respondentCount: responses.length,
      calculatedAt: Timestamp.now(),
    })

    return {
      success: true,
      s_sub,
      m_obj,
      healthIndex,
      gap,
      quadrant,
    }
  } catch (error) {
    console.error(`Error recalculating scores for cycle ${cycleId}:`, error)
    return {
      success: false,
      s_sub: 0,
      m_obj: 0,
      healthIndex: 0,
      gap: 0,
      quadrant: 'UNKNOWN',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Fetch all data needed for cycle calculation from Firestore
 * Unit-testable because it's extracted as a separate function
 */
export async function fetchCycleData(
  db: FirebaseFirestore.Firestore,
  schoolId: string,
  cycleId: string
): Promise<{
  responses: ChallengeResponse[]
  multipliers: Multiplier[]
  weights: Record<string, number>
}> {
  // Fetch non-deleted challenge responses
  const responsesSnapshot = await db
    .collection('schools')
    .doc(schoolId)
    .collection('assessmentCycles')
    .doc(cycleId)
    .collection('challengeResponses')
    .where('deleted', '==', false)
    .get()

  const responses = responsesSnapshot.docs.map((doc) =>
    toCalcChallengeResponse(doc.data(), doc.id)
  )

  // Fetch multiplier values
  const multipliersSnapshot = await db
    .collection('schools')
    .doc(schoolId)
    .collection('assessmentCycles')
    .doc(cycleId)
    .collection('multipliers')
    .get()

  const multipliers = multipliersSnapshot.docs.map((doc) =>
    toCalcMultiplier(doc.data())
  )

  // Fetch cycle config for weights
  const cycleSnapshot = await db
    .collection('schools')
    .doc(schoolId)
    .collection('assessmentCycles')
    .doc(cycleId)
    .get()

  const cycleData = cycleSnapshot.data()
  const weights = cycleData?.config?.weights || getDefaultWeights()

  return { responses, multipliers, weights }
}

/**
 * Default challenge weights (equal distribution)
 */
function getDefaultWeights(): Record<string, number> {
  const weights: Record<string, number> = {}
  for (let i = 1; i <= 15; i++) {
    weights[`C${i}`] = 1 / 15
  }
  return weights
}

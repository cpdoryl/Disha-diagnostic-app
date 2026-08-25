/**
 * DISHA First Opinion Engine - Phase 3
 * First Opinion Report Generation
 *
 * Generates comprehensive diagnostic reports from challenge responses
 * and objective multiplier data
 */

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { calculateSsub, calculateMobj, calculateAllScores, Multiplier, ChallengeResponse } from './calculations'

interface FirstOpinionReportData {
  schoolId: string
  cycleId: string
  generatedAt: admin.firestore.Timestamp

  // Core metrics
  scores: {
    s_sub: number
    m_obj: number
    healthIndex: number
    gap: number
    rawGap: number
    quadrant: string
    delusionPenalty: number
  }

  // Response summary
  respondentCount: number
  respondentsByRole: Record<string, number>
  challengesAnswered: number
  totalChallenges: number
  completionRate: number

  // Challenge drivers (which challenges drive most concern?)
  drivers: Array<{
    challengeId: string
    challengeTitle: string
    domain: string
    weight: number
    severity: number
    contribution: number
  }>

  // Multiplier profile
  multipliers: Array<{
    name: string
    value: number
    category: string
    status: string
  }>

  // Interpretation
  interpretation: {
    healthStatus: string
    healthDescription: string
    quadrantInsight: string
    communicationGap: boolean
    blindSpotRisk: boolean
  }

  // Recommendations
  recommendations: Array<{
    category: string
    priority: string
    title: string
    description: string
    actions: string[]
    impact: string
  }>
}

export const generateFirstOpinionReport = functions.https.onCall(
  async (data: { schoolId: string; cycleId: string }, context: any) => {
    const db = admin.firestore()

    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required')
    }

    try {
      const { schoolId, cycleId } = data

      console.log(`[FirstOpinion] Generating report for ${schoolId}/${cycleId}`)

      // Fetch all non-deleted challenge responses
      const responsesSnap = await db
        .collection('schools')
        .doc(schoolId)
        .collection('assessmentCycles')
        .doc(cycleId)
        .collection('challengeResponses')
        .where('deleted', '==', false)
        .get()

      const responses: ChallengeResponse[] = responsesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any

      if (responses.length === 0) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'No challenge responses found for this cycle'
        )
      }

      // Fetch multiplier data
      const multipliersSnap = await db
        .collection('schools')
        .doc(schoolId)
        .collection('assessmentCycles')
        .doc(cycleId)
        .collection('multipliers')
        .get()

      const multipliers: Multiplier[] = multipliersSnap.docs.map(doc => doc.data()) as any

      // Define challenge weights (from reference document)
      const weights: Record<string, number> = {
        C1: 0.08,
        C2: 0.08,
        C3: 0.08,
        C4: 0.08,
        C5: 0.08,
        C6: 0.08,
        C7: 0.08,
        C8: 0.08,
        C9: 0.08,
        C10: 0.08,
        C11: 0.08,
        C12: 0.08,
        C13: 0.08,
        C14: 0.08,
        C15: 0.08
      }

      // Calculate S_sub
      const s_sub = calculateSsub(responses, weights)
      console.log(`S_sub calculated: ${s_sub}`)

      // Calculate M_obj
      const m_obj = calculateMobj(multipliers)
      console.log(`M_obj calculated: ${m_obj}`)

      // Calculate all scores
      const scores = calculateAllScores(s_sub, m_obj)
      console.log(`Scores calculated:`, scores)

      // Count respondents by role
      const respondentsByRole: Record<string, number> = {}
      const uniqueRespondents = new Set<string>()

      responses.forEach(resp => {
        uniqueRespondents.add(resp.responderId)
        respondentsByRole[resp.role] = (respondentsByRole[resp.role] || 0) + 1
      })

      // Calculate challenge severity (drivers)
      const drivers: FirstOpinionReportData['drivers'] = []
      const challengeIds = Array.from(new Set(responses.map(r => r.challengeId)))

      for (const challengeId of challengeIds) {
        const challengeResponses = responses.filter(r => r.challengeId === challengeId)
        const challengeWeight = weights[challengeId] || 0.08

        let totalSelected = 0
        let totalMax = 0

        challengeResponses.forEach(resp => {
          Object.values(resp.responses).forEach((q: any) => {
            totalSelected += q.selectedOption
            totalMax += q.maxOption
          })
        })

        const severity = totalMax > 0 ? (totalSelected / totalMax) * 100 : 50
        const contribution = (severity / 100) * challengeWeight

        drivers.push({
          challengeId,
          challengeTitle: challengeResponses[0]?.challenge?.title || challengeId,
          domain: challengeResponses[0]?.challenge?.domain || 'Unknown',
          weight: challengeWeight,
          severity: Math.round(severity * 10) / 10,
          contribution: Math.round(contribution * 1000) / 1000
        })
      }

      // Sort drivers by contribution
      drivers.sort((a, b) => b.contribution - a.contribution)

      // Get health status
      const getHealthStatus = (healthIndex: number) => {
        if (healthIndex >= 80) return 'EXCELLENT'
        if (healthIndex >= 60) return 'GOOD'
        if (healthIndex >= 40) return 'FAIR'
        if (healthIndex >= 20) return 'POOR'
        return 'CRITICAL'
      }

      // Generate recommendations
      const recommendations: FirstOpinionReportData['recommendations'] = []

      if (scores.healthIndex < 40) {
        recommendations.push({
          category: 'CRITICAL',
          priority: 'IMMEDIATE',
          title: 'School requires urgent intervention',
          description: 'Health Index below 40 indicates critical operational gaps',
          actions: [
            'Convene board emergency meeting',
            'Form crisis management team',
            'Prioritize top 3 challenge drivers',
            'Develop 30-60-90 day action plan'
          ],
          impact: 'HIGH'
        })
      } else if (scores.healthIndex < 60) {
        recommendations.push({
          category: 'HIGH',
          priority: 'HIGH',
          title: 'Significant improvement required',
          description: 'Health Index 40-60 indicates major gaps between perception and operations',
          actions: [
            'Address top challenge driver immediately',
            'Create 6-month improvement roadmap',
            'Allocate dedicated resources',
            'Monthly progress tracking'
          ],
          impact: 'MEDIUM-HIGH'
        })
      }

      if (scores.blindSpotRisk) {
        recommendations.push({
          category: 'RISK',
          priority: 'HIGH',
          title: 'Blind spot risk: Perception exceeds reality',
          description: 'Leadership perceives health better than operational data shows',
          actions: [
            'Validate findings with hard data',
            'Increase transparency with stakeholders',
            'Monthly reality checks on key metrics',
            'Adjust strategy based on actual performance'
          ],
          impact: 'HIGH'
        })
      }

      if (scores.communicationGap) {
        recommendations.push({
          category: 'OPPORTUNITY',
          priority: 'MEDIUM',
          title: 'Communication opportunity: Operations better than perception',
          description: 'School is performing better than leadership realizes',
          actions: [
            'Celebrate wins internally and externally',
            'Improve stakeholder communication',
            'Share positive metrics with community',
            'Build on existing strengths'
          ],
          impact: 'MEDIUM'
        })
      }

      // Build complete report
      const report: FirstOpinionReportData = {
        schoolId,
        cycleId,
        generatedAt: admin.firestore.Timestamp.now(),

        scores: {
          s_sub: scores.s_sub,
          m_obj: scores.m_obj,
          healthIndex: scores.healthIndex,
          gap: scores.gap,
          rawGap: scores.rawGap,
          quadrant: scores.quadrant,
          delusionPenalty: scores.delusionPenalty
        },

        respondentCount: uniqueRespondents.size,
        respondentsByRole,
        challengesAnswered: challengeIds.length,
        totalChallenges: 15,
        completionRate: (challengeIds.length / 15) * 100,

        drivers,

        multipliers: multipliers.map(m => ({
          name: m.name,
          value: m.value * 100, // Convert 0-1 to 0-100
          category: m.category,
          status: m.validationStatus
        })),

        interpretation: {
          healthStatus: getHealthStatus(scores.healthIndex),
          healthDescription: scores.interpretation,
          quadrantInsight: scores.interpretation,
          communicationGap: scores.communicationGap,
          blindSpotRisk: scores.blindSpotRisk
        },

        recommendations
      }

      // Save report
      await db
        .collection('schools')
        .doc(schoolId)
        .collection('assessmentCycles')
        .doc(cycleId)
        .collection('firstOpinionReports')
        .doc('latest')
        .set(report)

      console.log(`[FirstOpinion] Report generated successfully`)

      return {
        success: true,
        report,
        generatedAt: admin.firestore.Timestamp.now()
      }
    } catch (error) {
      console.error('[FirstOpinion] Report generation error:', error)
      throw error instanceof functions.https.HttpsError
        ? error
        : new functions.https.HttpsError('internal', 'Report generation failed')
    }
  }
)

export default { generateFirstOpinionReport }

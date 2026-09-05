/**
 * DISHA Phase 4 - Dimension-Wise Analysis
 * Analyzes all 14 dimensions with perception vs reality
 */

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { getDb } from '../lib/db'

export const analyzeDimensions = functions.https.onCall(
  async (data: { schoolId: string; cycleId: string }, context: any) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User not authenticated')
    }

    const { schoolId, cycleId } = data
    const db = getDb()

    try {
      console.log(`[Dimensions] Analyzing for ${schoolId}/${cycleId}`)

      const cycleRef = db
        .collection('schools')
        .doc(schoolId)
        .collection('assessmentCycles')
        .doc(cycleId)

      const cycleSnap = await cycleRef.get()
      if (!cycleSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Assessment cycle not found')
      }

      const cycleData = cycleSnap.data()
      const computedSnap = await cycleRef.collection('computed').doc('latest').get()
      const computed = computedSnap.data()

      // Analyze each dimension
      const dimensionAnalysis = []

      for (let d = 1; d <= 14; d++) {
        const dimensionId = `D${String(d).padStart(2, '0')}`

        const analysis = {
          dimensionId,
          dimensionName: getDimensionName(dimensionId),
          perception: {
            score: cycleData?.scores?.s_sub || 0,
            respondentCount: cycleData?.respondentCount || 0,
            respondentsByRole: cycleData?.respondentsByRole || {}
          },
          reality: {
            score: cycleData?.scores?.m_obj || 0,
            dataPoints: getObjectiveDataPoints(dimensionId)
          },
          healthIndex: cycleData?.scores?.healthIndex || 0,
          gap: cycleData?.scores?.gap || 0,
          severity: computed?.challengeSeverity?.[`C${d}`]?.severity || 0,
          status: getStatus(cycleData?.scores?.healthIndex || 0),
          priority: calculatePriority(
            cycleData?.scores?.gap || 0,
            cycleData?.scores?.healthIndex || 0,
            computed?.challengeSeverity?.[`C${d}`]?.severity || 0
          ),
          insight: generateDimensionInsight(
            dimensionId,
            cycleData?.scores,
            cycleData?.scores?.gap || 0
          )
        }

        dimensionAnalysis.push(analysis)
      }

      // Sort by priority
      dimensionAnalysis.sort((a, b) => {
        const priorityOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 }
        return (priorityOrder[a.priority as keyof typeof priorityOrder] || 5) -
               (priorityOrder[b.priority as keyof typeof priorityOrder] || 5)
      })

      // Save analysis
      await cycleRef.collection('analysis').doc('dimensions').set({
        dimensions: dimensionAnalysis,
        generatedAt: admin.firestore.Timestamp.now(),
        totalDimensions: 14,
        criticalCount: dimensionAnalysis.filter((d) => d.priority === 'CRITICAL').length,
        healthyCount: dimensionAnalysis.filter((d) => d.priority === 'LOW').length
      })

      console.log(`[Dimensions] Analyzed 14 dimensions for ${schoolId}/${cycleId}`)
      return { success: true, dimensionAnalysis }
    } catch (error) {
      console.error(`[Dimensions] Error:`, error)
      throw error
    }
  }
)

function getDimensionName(dimensionId: string): string {
  const names: Record<string, string> = {
    D01: 'Academic Reputation & Rigour',
    D02: 'Teacher Welfare & Development',
    D03: 'Leadership & Governance',
    D04: 'Parent Engagement & SLA',
    D05: 'Student Safety & Wellness',
    D06: 'Infrastructure & Facilities',
    D07: 'Co-Curricular Education',
    D08: 'Individual Attention (PTR)',
    D09: 'Value for Money',
    D10: 'Special Needs Inclusivity',
    D11: 'Community Service & Responsibility',
    D12: 'Faculty Competence & Retention',
    D13: 'Internationalism & Cultural Diversity',
    D14: 'Management Vision & Growth Drive'
  }
  return names[dimensionId] || dimensionId
}

function getObjectiveDataPoints(dimensionId: string): Array<string> {
  const dataPoints: Record<string, string[]> = {
    D01: ['Exam pass rates', 'Curriculum compliance', 'Assessment results'],
    D02: ['Staff retention', 'Professional development', 'Salary benchmarks'],
    D03: ['Decision quality', 'Strategic vision', 'Transparency'],
    D04: ['Parent satisfaction', 'Communication frequency', 'SLA compliance'],
    D05: ['Incident reports', 'Safety audits', 'Wellness programs'],
    D06: ['Building conditions', 'Equipment status', 'Facility utilization'],
    D07: ['Program offerings', 'Participation rates', 'Student achievements'],
    D08: ['Student-teacher ratio', 'Classroom sizes', 'One-on-one time'],
    D09: ['Tuition trends', 'Value metrics', 'Cost per outcome'],
    D10: ['Inclusive policies', 'Accessible facilities', 'Support services'],
    D11: ['Community projects', 'Volunteer hours', 'Social impact'],
    D12: ['Teacher qualifications', 'Retention rates', 'Performance ratings'],
    D13: ['International partnerships', 'Cultural events', 'Diversity metrics'],
    D14: ['5-year plan', 'Enrollment trends', 'Market position']
  }
  return dataPoints[dimensionId] || []
}

function getStatus(healthIndex: number): string {
  if (healthIndex >= 80) return 'EXCELLENT'
  if (healthIndex >= 60) return 'GOOD'
  if (healthIndex >= 40) return 'FAIR'
  if (healthIndex >= 20) return 'POOR'
  return 'CRITICAL'
}

function calculatePriority(gap: number, healthIndex: number, severity: number): string {
  if (healthIndex < 40 || severity > 8) return 'CRITICAL'
  if (healthIndex < 60 || severity > 6 || gap > 70) return 'HIGH'
  if (healthIndex < 80 || severity > 4) return 'MEDIUM'
  return 'LOW'
}

function generateDimensionInsight(dimensionId: string, scores: any, gap: number): string {
  if (!scores) return 'Insufficient data for insight'

  if (gap > 70) {
    return 'Leadership perception significantly exceeds reality. Blind spot risk.'
  } else if (gap < 30) {
    return 'Operations outperforming perception. Communication opportunity.'
  } else if (scores.healthIndex < 40) {
    return 'Critical issues identified. Immediate intervention required.'
  } else if (scores.healthIndex < 60) {
    return 'Significant gaps exist. Targeted improvement plan needed.'
  } else if (scores.healthIndex < 80) {
    return 'Good performance with room for optimization.'
  }

  return 'Excellent performance. Maintain current standards.'
}

export default { analyzeDimensions }

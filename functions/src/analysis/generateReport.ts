/**
 * DISHA Phase 4 - Diagnostic Report Generation
 * Generates comprehensive analysis from Phase 2 calculations
 */

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { getDb } from '../lib/db'

interface ReportData {
  schoolId: string
  cycleId: string
  scores: {
    s_sub: number
    m_obj: number
    healthIndex: number
    gap: number
    quadrant: string
    delusionPenalty: number
  }
  respondentCount: number
  respondentsByRole: Record<string, number>
  dimensionAnalysis: Record<string, any>
  recommendations: Array<any>
  generatedAt: admin.firestore.Timestamp
}

export const generateDiagnosticReport = functions.https.onCall(
  async (data: { schoolId: string; cycleId: string }, context: any): Promise<ReportData> => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User not authenticated')
    }

    const { schoolId, cycleId } = data
    const db = getDb()

    try {
      console.log(`[Report] Generating for ${schoolId}/${cycleId}`)

      // Fetch cycle data with all calculations from Phase 2
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

      // Fetch computed latest data
      const computedSnap = await cycleRef.collection('computed').doc('latest').get()
      const computed = computedSnap.data()

      // Build dimension analysis
      const dimensionAnalysis: Record<string, any> = {}
      for (let d = 1; d <= 14; d++) {
        const dimensionId = `D${String(d).padStart(2, '0')}`
        dimensionAnalysis[dimensionId] = {
          dimensionId,
          dimensionName: getDimensionName(dimensionId),
          s_sub: cycleData?.scores?.s_sub || 0,
          m_obj: cycleData?.scores?.m_obj || 0,
          healthIndex: cycleData?.scores?.healthIndex || 0,
          gap: cycleData?.scores?.gap || 0,
          quadrant: cycleData?.scores?.quadrant || 'ALIGNED',
          severity: computed?.challengeSeverity?.[`C${d}`]?.severity || 0,
          recommendations: getRecommendationsForDimension(
            dimensionId,
            cycleData?.scores?.healthIndex || 0
          )
        }
      }

      // Generate overall recommendations
      const recommendations = generateRecommendations(
        cycleData?.scores,
        dimensionAnalysis,
        cycleData?.respondentsByRole
      )

      // Compile report
      const report: ReportData = {
        schoolId,
        cycleId,
        scores: cycleData?.scores || {},
        respondentCount: cycleData?.respondentCount || 0,
        respondentsByRole: cycleData?.respondentsByRole || {},
        dimensionAnalysis,
        recommendations,
        generatedAt: admin.firestore.Timestamp.now()
      }

      // Persist report to Firestore
      await cycleRef.collection('reports').doc('latest').set(report)

      console.log(`[Report] Generated successfully for ${schoolId}/${cycleId}`)
      return report
    } catch (error) {
      console.error(`[Report] Error generating report:`, error)
      throw error
    }
  }
)

/**
 * Get dimension names
 */
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

/**
 * Get recommendations for specific dimension
 */
function getRecommendationsForDimension(dimensionId: string, healthIndex: number): Array<any> {
  const recommendations = []

  if (healthIndex < 40) {
    recommendations.push({
      priority: 'CRITICAL',
      action: `Urgent intervention needed for ${dimensionId}`,
      timeline: 'Immediate (1-2 weeks)',
      impact: 'High'
    })
  } else if (healthIndex < 60) {
    recommendations.push({
      priority: 'HIGH',
      action: `Improvement plan needed for ${dimensionId}`,
      timeline: 'Short-term (1-2 months)',
      impact: 'Medium-High'
    })
  } else if (healthIndex < 80) {
    recommendations.push({
      priority: 'MEDIUM',
      action: `Maintenance and optimization for ${dimensionId}`,
      timeline: 'Medium-term (3-6 months)',
      impact: 'Medium'
    })
  }

  return recommendations
}

/**
 * Generate overall recommendations
 */
function generateRecommendations(
  scores: any,
  dimensionAnalysis: Record<string, any>,
  respondentsByRole: Record<string, number>
): Array<Record<string, any>> {
  const recommendations: Array<Record<string, any>> = []

  if (!scores) return recommendations

  // Health Index based recommendations
  if (scores.healthIndex < 40) {
    recommendations.push({
      category: 'CRITICAL',
      title: 'School requires immediate intervention',
      description: 'Health Index indicates critical issues. School needs urgent action across multiple dimensions.',
      actions: [
        'Form crisis management team',
        'Conduct root cause analysis',
        'Develop 90-day action plan',
        'Allocate emergency resources'
      ],
      timeline: 'Immediate'
    })
  } else if (scores.healthIndex < 60) {
    recommendations.push({
      category: 'HIGH',
      title: 'School needs significant improvement',
      description: 'Health Index shows substantial gaps between perception and operations.',
      actions: [
        'Prioritize top 3 dimensions',
        'Create 6-month improvement plan',
        'Allocate dedicated resources',
        'Establish monitoring dashboard'
      ],
      timeline: 'Next 2 months'
    })
  }

  // Quadrant-based recommendations
  if (scores.quadrant === 'PERCEPTION_BETTER') {
    recommendations.push({
      category: 'RISK',
      title: 'Blind spot risk detected',
      description: 'Leadership perception is better than operational reality. This is a warning sign.',
      actions: [
        'Validate findings with operational data',
        'Increase transparency across school',
        'Regular reality checks with stakeholders',
        'Adjust strategy based on actual performance'
      ],
      timeline: 'Ongoing'
    })
  } else if (scores.quadrant === 'REALITY_BETTER') {
    recommendations.push({
      category: 'OPPORTUNITY',
      title: 'Communication gap identified',
      description: 'Operations are performing better than perception. Opportunity to boost morale.',
      actions: [
        'Celebrate hidden wins',
        'Improve internal communication',
        'Share achievements with stakeholders',
        'Build on existing strengths'
      ],
      timeline: 'Next 4 weeks'
    })
  }

  // Respondent diversity
  if (Object.keys(respondentsByRole || {}).length < 3) {
    recommendations.push({
      category: 'PROCESS',
      title: 'Increase respondent diversity',
      description: 'Get feedback from more stakeholder groups for comprehensive assessment.',
      actions: ['Reach out to missing stakeholder groups', 'Ensure representative feedback'],
      timeline: 'Next cycle'
    })
  }

  return recommendations
}

export default { generateDiagnosticReport }

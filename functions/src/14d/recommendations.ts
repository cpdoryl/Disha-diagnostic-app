/**
 * 14-Dimension Diagnostic Framework v2 — Recommendations Engine
 * Cloud Function: Generate actionable recommendations based on gap analysis
 * Phase 3: Cloud Functions & Analysis
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface Recommendation {
  id: string;
  dimensionId: number;
  dimensionName: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  actionTitle: string;
  actionDescription: string;
  expectedOutcome: string;
  successMetrics: string[];
  owner: 'Principal' | 'Academic Lead' | 'Student Support' | 'Admin' | 'Coordinator';
  timeline: {
    start: string;
    duration: string; // e.g., "2-4 weeks"
    expectedCompletion: string;
  };
  resources: string[];
  dependencies: string[];
  riskFactors: string[];
  estimatedEffort: 'Low' | 'Medium' | 'High';
}

interface RecommendationResult {
  assessmentId: string;
  schoolId: string;
  generatedAt: admin.firestore.Timestamp;
  totalRecommendations: number;
  tier1Recommendations: Recommendation[];
  tier2Recommendations: Recommendation[];
  tier3Recommendations: Recommendation[];
  actionPlan: {
    phase1: Recommendation[];
    phase2: Recommendation[];
    phase3: Recommendation[];
  };
  budgetEstimate: {
    low: number;
    high: number;
    currency: string;
  };
}

/**
 * Generate recommendations based on gap analysis
 * Triggered after gap analysis completes
 */
export const generateRecommendations = functions
  .region('us-central1')
  .https.onCall(
    async (
      data: { schoolId: string; assessmentId: string; gapAnalysis: any },
      context
    ): Promise<RecommendationResult> => {
      try {
        const { schoolId, assessmentId, gapAnalysis } = data;

        console.log(`💡 Generating recommendations for ${assessmentId}...`);

        const allRecommendations: Recommendation[] = [];

        // Generate recommendations for each gap
        if (gapAnalysis.topPriorities) {
          gapAnalysis.topPriorities.forEach((gap: any, index: number) => {
            const recs = generateDimensionRecommendations(gap, index);
            allRecommendations.push(...recs);
          });
        }

        // Categorize by priority
        const tier1 = allRecommendations.filter(r => r.priority === 'CRITICAL' || r.priority === 'HIGH').slice(0, 5);
        const tier2 = allRecommendations.filter(r => r.priority === 'MEDIUM').slice(0, 5);
        const tier3 = allRecommendations.filter(r => r.priority === 'LOW').slice(0, 5);

        // Create action plan (30-60-90 days)
        const phase1 = tier1.slice(0, 3); // First 30 days - CRITICAL issues
        const phase2 = [...tier1.slice(3), ...tier2.slice(0, 2)]; // Days 30-60 - HIGH + early MEDIUM
        const phase3 = [...tier2.slice(2), ...tier3]; // Days 60-90 - remaining MEDIUM + LOW

        // Estimate budget
        const budgetEstimate = calculateBudgetEstimate(allRecommendations);

        const result: RecommendationResult = {
          assessmentId,
          schoolId,
          generatedAt: admin.firestore.Timestamp.now(),
          totalRecommendations: allRecommendations.length,
          tier1Recommendations: tier1,
          tier2Recommendations: tier2,
          tier3Recommendations: tier3,
          actionPlan: {
            phase1,
            phase2,
            phase3,
          },
          budgetEstimate,
        };

        // Save recommendations
        await db
          .collection('schools')
          .doc(schoolId)
          .collection('assessments14D')
          .doc(assessmentId)
          .collection('analysis')
          .doc('recommendations')
          .set(result, { merge: true });

        // Create 30-60-90 day action plan document
        await createActionPlan(schoolId, assessmentId, result);

        console.log(`✅ Recommendations generated`);
        console.log(`   Total: ${allRecommendations.length}`);
        console.log(`   Tier 1: ${tier1.length}`);
        console.log(`   Tier 2: ${tier2.length}`);
        console.log(`   Tier 3: ${tier3.length}`);

        return result;
      } catch (error) {
        console.error('❌ Recommendation generation failed:', error);
        throw error;
      }
    }
  );

/**
 * Generate recommendations for a specific dimension gap
 */
function generateDimensionRecommendations(gap: any, index: number): Recommendation[] {
  const dimensionId = gap.dimensionId;
  const dimensionName = gap.dimensionName;
  const gap_value = gap.gap;
  const severity = gap.severity;

  const recommendations: Recommendation[] = [];

  // Base priority
  let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  if (severity === 'CRITICAL') priority = 'CRITICAL';
  else if (severity === 'HIGH') priority = 'HIGH';
  else if (severity === 'MEDIUM') priority = 'MEDIUM';
  else priority = 'LOW';

  // Generate primary recommendation
  const primaryRec = generatePrimaryRecommendation(dimensionId, dimensionName, priority, gap);
  recommendations.push(primaryRec);

  // Generate secondary recommendations if gap is significant
  if (gap_value > 15) {
    const secondaryRec = generateSecondaryRecommendation(dimensionId, dimensionName, priority, gap);
    recommendations.push(secondaryRec);
  }

  return recommendations;
}

/**
 * Generate primary recommendation for a dimension
 */
function generatePrimaryRecommendation(
  dimensionId: number,
  dimensionName: string,
  priority: string,
  gap: any
): Recommendation {
  const recommendationsByDimension: Record<number, Recommendation> = {
    1: {
      id: `rec_${dimensionId}_1`,
      dimensionId,
      dimensionName,
      priority: priority as any,
      actionTitle: 'Implement Learning Analytics & Data-Driven Instruction',
      actionDescription:
        'Set up comprehensive learning analytics system to track student progress real-time. Provide teachers with data dashboards to identify learning gaps early.',
      expectedOutcome: 'Improved student learning outcomes and formative assessment accuracy',
      successMetrics: [
        'Increase in formative assessment scores by 15%',
        'Reduction in students below benchmark by 10%',
        'Teacher adoption rate >80%',
      ],
      owner: 'Academic Lead',
      timeline: {
        start: 'Week 1',
        duration: '8-12 weeks',
        expectedCompletion: 'End of quarter',
      },
      resources: ['Learning analytics platform', 'Teacher training', 'IT support'],
      dependencies: ['IT infrastructure readiness'],
      riskFactors: ['Teacher adoption resistance', 'Data quality issues'],
      estimatedEffort: 'High',
    },
    2: {
      id: `rec_${dimensionId}_1`,
      dimensionId,
      dimensionName,
      priority: priority as any,
      actionTitle: 'Curriculum Review & Pedagogy Enhancement',
      actionDescription:
        'Conduct comprehensive curriculum audit. Align pedagogy with active learning principles. Introduce project-based learning and collaborative activities.',
      expectedOutcome: 'Improved curriculum quality and student engagement',
      successMetrics: [
        'Lesson effectiveness rating >80%',
        'Student engagement scores +20%',
        'Project completion rate >90%',
      ],
      owner: 'Academic Lead',
      timeline: {
        start: 'Week 1',
        duration: '12-16 weeks',
        expectedCompletion: 'Mid-quarter',
      },
      resources: ['Curriculum consultant', 'Teacher time', 'Learning materials'],
      dependencies: ['Stakeholder buy-in', 'Resource allocation'],
      riskFactors: ['Teacher workload increase', 'Initial performance dip'],
      estimatedEffort: 'High',
    },
    3: {
      id: `rec_${dimensionId}_1`,
      dimensionId,
      dimensionName,
      priority: priority as any,
      actionTitle: 'Teacher Development & Support Program',
      actionDescription:
        'Establish structured professional development. Conduct coaching sessions and mentoring for new teachers. Create peer learning communities.',
      expectedOutcome: 'Improved teacher capabilities and retention',
      successMetrics: [
        'Teacher satisfaction +25%',
        'Retention rate >95%',
        'CPD completion >90%',
      ],
      owner: 'Principal',
      timeline: {
        start: 'Week 1',
        duration: '6-10 weeks',
        expectedCompletion: 'End of quarter',
      },
      resources: [
        'Training budget',
        'Coaching expertise',
        'Time for collaboration',
      ],
      dependencies: ['Budget approval'],
      riskFactors: ['Time constraints', 'Expert availability'],
      estimatedEffort: 'Medium',
    },
    4: {
      id: `rec_${dimensionId}_1`,
      dimensionId,
      dimensionName,
      priority: priority as any,
      actionTitle: 'Student Wellbeing & Mental Health Support',
      actionDescription:
        'Launch comprehensive wellbeing program. Increase counselor availability and train teachers in mental health awareness.',
      expectedOutcome: 'Improved student mental health and academic performance',
      successMetrics: [
        'Counselor caseload <50 students',
        'Student stress indicators -30%',
        'Counseling access rate >70%',
      ],
      owner: 'Student Support',
      timeline: {
        start: 'Week 1',
        duration: '4-8 weeks',
        expectedCompletion: 'End of month',
      },
      resources: ['Counseling staff', 'Mental health training', 'Facilities'],
      dependencies: ['Budget for additional staff'],
      riskFactors: ['Stigma around mental health', 'Resource constraints'],
      estimatedEffort: 'Medium',
    },
  };

  return (
    recommendationsByDimension[dimensionId] || {
      id: `rec_${dimensionId}_default`,
      dimensionId,
      dimensionName,
      priority: priority as any,
      actionTitle: `Improve ${dimensionName}`,
      actionDescription: `Develop targeted improvement plan for ${dimensionName} dimension based on identified gaps.`,
      expectedOutcome: `Improved ${dimensionName} scores`,
      successMetrics: [`Dimension score increase by 10-15%`],
      owner: 'Principal',
      timeline: {
        start: 'Week 1',
        duration: '8-12 weeks',
        expectedCompletion: 'End of quarter',
      },
      resources: ['Staff time', 'Training budget'],
      dependencies: ['Stakeholder alignment'],
      riskFactors: [],
      estimatedEffort: 'Medium',
    }
  );
}

/**
 * Generate secondary recommendation
 */
function generateSecondaryRecommendation(
  dimensionId: number,
  dimensionName: string,
  priority: string,
  gap: any
): Recommendation {
  return {
    id: `rec_${dimensionId}_2`,
    dimensionId,
    dimensionName,
    priority: (priority === 'CRITICAL' ? 'HIGH' : 'MEDIUM') as any,
    actionTitle: `Enhance ${dimensionName} - Phase 2`,
    actionDescription: `Secondary initiative to support primary improvement efforts in ${dimensionName}.`,
    expectedOutcome: `Sustained improvement in ${dimensionName}`,
    successMetrics: [`Maintain 10%+ improvement`, `Stakeholder satisfaction >75%`],
    owner: 'Coordinator',
    timeline: {
      start: 'Week 4',
      duration: '6-10 weeks',
      expectedCompletion: 'End of quarter',
    },
    resources: ['Staff coordination', 'Follow-up training'],
    dependencies: ['Primary initiative progress'],
    riskFactors: [],
    estimatedEffort: 'Medium',
  };
}

/**
 * Calculate estimated budget for recommendations
 */
function calculateBudgetEstimate(recommendations: Recommendation[]) {
  let lowEstimate = 0;
  let highEstimate = 0;

  recommendations.forEach(rec => {
    if (rec.estimatedEffort === 'Low') {
      lowEstimate += 5000;
      highEstimate += 10000;
    } else if (rec.estimatedEffort === 'Medium') {
      lowEstimate += 15000;
      highEstimate += 30000;
    } else {
      lowEstimate += 30000;
      highEstimate += 60000;
    }
  });

  return {
    low: lowEstimate,
    high: highEstimate,
    currency: 'USD',
  };
}

/**
 * Create 30-60-90 day action plan
 */
async function createActionPlan(
  schoolId: string,
  assessmentId: string,
  result: RecommendationResult
) {
  const actionPlan = {
    phase1: {
      title: 'Days 1-30: Quick Wins',
      objective: 'Address CRITICAL gaps and establish momentum',
      recommendations: result.actionPlan.phase1,
      budget: `$${(result.budgetEstimate.low * 0.4).toLocaleString()}`,
    },
    phase2: {
      title: 'Days 31-60: Sustained Improvement',
      objective: 'Build on quick wins and tackle HIGH priority items',
      recommendations: result.actionPlan.phase2,
      budget: `$${(result.budgetEstimate.low * 0.35).toLocaleString()}`,
    },
    phase3: {
      title: 'Days 61-90: Institutionalization',
      objective: 'Embed improvements and plan for sustainability',
      recommendations: result.actionPlan.phase3,
      budget: `$${(result.budgetEstimate.low * 0.25).toLocaleString()}`,
    },
  };

  await db
    .collection('schools')
    .doc(schoolId)
    .collection('assessments14D')
    .doc(assessmentId)
    .collection('analysis')
    .doc('actionPlan')
    .set(actionPlan, { merge: true });
}

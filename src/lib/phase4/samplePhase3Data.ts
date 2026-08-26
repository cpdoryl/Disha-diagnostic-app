/**
 * Sample Phase 3 Data for Testing Phase 4 Components
 * Use this to test dashboard components before real Firestore integration
 */

import {
  CalculationResult,
  DimensionScore,
  GapAnalysisResult,
  GapAnalysis,
  Recommendation,
} from './useRealTimePhase3Data';

/**
 * Sample DimensionScore data (from Phase 3 calculateMetrics)
 */
export const SAMPLE_DIMENSION_SCORES: DimensionScore[] = [
  {
    dimensionId: 1,
    dimensionName: 'Academic Performance & Learning',
    realityScore: 65,
    perceptionScore: 80,
    gap: 15,
    gapDirection: 'perception_higher',
    gapSeverity: 'HIGH',
    metricCount: 6,
    respondentCount: 24,
    respondentBreakdown: {
      Teacher: 12,
      Parent: 8,
      Student: 3,
      Admin: 1,
      Other: 0,
    },
  },
  {
    dimensionId: 2,
    dimensionName: 'Curriculum & Pedagogy',
    realityScore: 72,
    perceptionScore: 75,
    gap: 3,
    gapDirection: 'perception_higher',
    gapSeverity: 'LOW',
    metricCount: 5,
    respondentCount: 22,
    respondentBreakdown: {
      Teacher: 12,
      Parent: 8,
      Student: 2,
      Admin: 0,
      Other: 0,
    },
  },
  {
    dimensionId: 3,
    dimensionName: 'Teacher Quality & Retention',
    realityScore: 45,
    perceptionScore: 70,
    gap: 25,
    gapDirection: 'perception_higher',
    gapSeverity: 'CRITICAL',
    metricCount: 6,
    respondentCount: 20,
    respondentBreakdown: {
      Teacher: 12,
      Parent: 6,
      Student: 2,
      Admin: 0,
      Other: 0,
    },
  },
  {
    dimensionId: 4,
    dimensionName: 'Student Wellbeing',
    realityScore: 58,
    perceptionScore: 65,
    gap: 7,
    gapDirection: 'perception_higher',
    gapSeverity: 'MEDIUM',
    metricCount: 5,
    respondentCount: 24,
    respondentBreakdown: {
      Teacher: 12,
      Parent: 8,
      Student: 4,
      Admin: 0,
      Other: 0,
    },
  },
];

/**
 * Sample CalculationResult (complete assessment)
 */
export const SAMPLE_CALCULATION_RESULT: CalculationResult = {
  assessmentId: 'assessment_001_sample',
  schoolId: 'school_001_sample',
  calculatedAt: new Date(),
  dimensionScores: SAMPLE_DIMENSION_SCORES,
  overallRealityScore: 60,
  overallPerceptionScore: 72.5,
  overallGap: 12.5,
  respondentCount: 24,
  responseCount: 480, // 24 respondents × 20 questions
  metricsCovered: 4,
  analysisReady: true,
};

/**
 * Sample GapAnalysis data (from Phase 3 gapAnalysis)
 */
export const SAMPLE_GAP_ANALYSIS: GapAnalysis[] = [
  {
    dimensionId: 3,
    dimensionName: 'Teacher Quality & Retention',
    realityScore: 45,
    perceptionScore: 70,
    gap: 25,
    severity: 'CRITICAL',
    type: 'perception_inflated',
    priority: 1,
    rootCauses: [
      'Stakeholder perceptions may not reflect actual teacher retention rates',
      'Communication gap between HR metrics and stakeholder awareness',
      'High new teacher satisfaction biasing perceptions',
    ],
    recommendation:
      'Bridge perception-reality gap through transparent communication about teacher metrics, implement stakeholder education on real retention data, and address discrepancy drivers.',
    urgency: 'IMMEDIATE',
  },
  {
    dimensionId: 1,
    dimensionName: 'Academic Performance & Learning',
    realityScore: 65,
    perceptionScore: 80,
    gap: 15,
    severity: 'HIGH',
    type: 'perception_inflated',
    priority: 2,
    rootCauses: [
      'Grade inflation in perception surveys',
      'Selection bias in respondents (more positive respondents)',
      'Lack of shared definition of academic performance',
    ],
    recommendation:
      'Establish clear academic performance metrics, conduct teacher calibration sessions, and implement standardized assessment protocols.',
    urgency: 'HIGH',
  },
  {
    dimensionId: 4,
    dimensionName: 'Student Wellbeing',
    realityScore: 58,
    perceptionScore: 65,
    gap: 7,
    severity: 'MEDIUM',
    type: 'perception_inflated',
    priority: 3,
    rootCauses: [
      'Limited visibility into student mental health data',
      'Perception based on visible initiatives rather than outcomes',
    ],
    recommendation:
      'Implement comprehensive student wellbeing assessment framework and increase transparency in mental health support metrics.',
    urgency: 'MEDIUM',
  },
  {
    dimensionId: 2,
    dimensionName: 'Curriculum & Pedagogy',
    realityScore: 72,
    perceptionScore: 75,
    gap: 3,
    severity: 'LOW',
    type: 'aligned',
    priority: 4,
    rootCauses: ['Good alignment between perception and reality', 'Strong communication about curriculum changes'],
    recommendation:
      'Continue current curriculum and pedagogy initiatives while monitoring for emerging gaps.',
    urgency: 'LOW',
  },
];

/**
 * Sample GapAnalysisResult (complete gap analysis)
 */
export const SAMPLE_GAP_ANALYSIS_RESULT: GapAnalysisResult = {
  assessmentId: 'assessment_001_sample',
  schoolId: 'school_001_sample',
  analyzedAt: new Date(),
  totalGaps: 4,
  criticalGaps: 1,
  blindSpots: 0,
  allGaps: SAMPLE_GAP_ANALYSIS,
  topPriorities: SAMPLE_GAP_ANALYSIS.slice(0, 3),
  blindSpotsList: [],
};

/**
 * Sample Recommendations (from Phase 3 recommendations)
 */
export const SAMPLE_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec_001',
    dimensionId: 3,
    dimensionName: 'Teacher Quality & Retention',
    priority: 'CRITICAL',
    actionTitle: 'Implement Teacher Development Program',
    actionDescription:
      'Establish structured professional development with coaching and mentoring for teachers. Create peer learning communities.',
    expectedOutcome: 'Improved teacher retention and capability',
    successMetrics: ['Teacher satisfaction +25%', 'Retention rate >95%', 'CPD completion >90%'],
    owner: 'Principal',
    timeline: {
      start: 'Week 1',
      duration: '6-10 weeks',
      expectedCompletion: 'End of quarter',
    },
    resources: ['Training budget', 'Coaching expertise', 'Time for collaboration'],
    dependencies: ['Budget approval'],
    riskFactors: ['Time constraints', 'Expert availability'],
    estimatedEffort: 'High',
  },
  {
    id: 'rec_002',
    dimensionId: 1,
    dimensionName: 'Academic Performance & Learning',
    priority: 'HIGH',
    actionTitle: 'Learning Analytics Implementation',
    actionDescription:
      'Set up comprehensive learning analytics system to track student progress. Provide teachers with data dashboards.',
    expectedOutcome: 'Improved student learning outcomes and formative assessment accuracy',
    successMetrics: [
      'Formative assessment scores +15%',
      'Students below benchmark -10%',
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
  {
    id: 'rec_003',
    dimensionId: 4,
    dimensionName: 'Student Wellbeing',
    priority: 'MEDIUM',
    actionTitle: 'Student Wellbeing Framework',
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
];

/**
 * Helper function to get sample data
 */
export function getSamplePhase3Data() {
  return {
    scores: SAMPLE_CALCULATION_RESULT,
    gaps: SAMPLE_GAP_ANALYSIS_RESULT,
    recommendations: SAMPLE_RECOMMENDATIONS,
    actionPlan: {
      phase1: {
        title: 'Days 1-30: Quick Wins',
        objective: 'Address CRITICAL gaps and establish momentum',
        recommendations: SAMPLE_RECOMMENDATIONS.filter(r => r.priority === 'CRITICAL'),
        budget: '$120,000',
      },
      phase2: {
        title: 'Days 31-60: Sustained Improvement',
        objective: 'Build on quick wins and tackle HIGH priority items',
        recommendations: SAMPLE_RECOMMENDATIONS.filter(r => r.priority === 'HIGH'),
        budget: '$105,000',
      },
      phase3: {
        title: 'Days 61-90: Institutionalization',
        objective: 'Embed improvements and plan for sustainability',
        recommendations: SAMPLE_RECOMMENDATIONS.filter(r => r.priority === 'MEDIUM'),
        budget: '$75,000',
      },
    },
  };
}

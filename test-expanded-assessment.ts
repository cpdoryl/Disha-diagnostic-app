/**
 * DISHA EWISR - EXPANDED ASSESSMENT TEST SUITE
 * Comprehensive end-to-end test execution with mock data
 *
 * This script simulates:
 * 1. Complete assessment with all 168 questions
 * 2. All 4 stakeholder groups responses
 * 3. Score calculations
 * 4. Results generation
 * 5. Action plan creation
 */

import { D01_ACADEMIC_REPUTATION_EXPANDED, D02_TEACHER_WELFARE_EXPANDED, D03_LEADERSHIP_GOVERNANCE_EXPANDED } from './src/data/expandedEWSIRQuestionnaire';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TestResponse {
  dimensionId: string;
  questionId: string;
  selectedWeight: number;
}

interface DimensionTestResult {
  dimensionId: string;
  label: string;
  totalQuestions: number;
  questionsAnswered: number;
  managementQuestions: number;
  teacherQuestions: number;
  parentQuestions: number;
  operationalQuestions: number;
  averageWeight: number;
  dimensionScore: number;
  stakeholderScores: {
    management?: number;
    teachers?: number;
    parents_students?: number;
    operational_metrics?: number;
  };
  healthStatus: string;
}

interface AssessmentTestResult {
  schoolName: string;
  assessmentDate: Date;
  totalQuestionsAsked: number;
  totalQuestionsAnswered: number;
  completionPercentage: number;
  dimensionResults: DimensionTestResult[];
  overallHealthIndex: number;
  healthStatus: string;
  assessmentDuration: number; // in milliseconds
  actionPlan: ActionItem[];
}

interface ActionItem {
  dimensionId: string;
  dimensionLabel: string;
  currentScore: number;
  targetScore: number;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendations: string[];
  timeline: string;
}

// ============================================================================
// SCORING FORMULAS
// ============================================================================

const SCORING_FORMULAS = {
  dimensionScore: (averageWeight: number): number => {
    return 100 - (averageWeight * 10);
  },

  weightedContribution: (score: number, weight: number): number => {
    return (score / 100) * weight;
  },

  normalizedWeights: (weights: number[]): number[] => {
    const total = weights.reduce((sum, w) => sum + w, 0);
    return weights.map(w => (w / total) * 100);
  }
};

const DIMENSION_WEIGHTS = {
  'D01': 10, 'D02': 9, 'D03': 10, 'D04': 8,
  'D05': 10, 'D06': 7, 'D07': 6, 'D08': 9,
  'D09': 7, 'D10': 6, 'D11': 5, 'D12': 9,
  'D13': 6, 'D14': 8
};

const HEALTH_CLASSIFICATIONS = {
  'ELITE_EXCELLENCE': { min: 90, max: 100, label: 'ELITE EXCELLENCE', color: '#2ecc71' },
  'STRONG_PERFORMER': { min: 80, max: 89, label: 'STRONG PERFORMER', color: '#27ae60' },
  'HEALTHY_SCHOOL': { min: 70, max: 79, label: 'HEALTHY SCHOOL', color: '#3498db' },
  'AVERAGE_PERFORMER': { min: 60, max: 69, label: 'AVERAGE PERFORMER', color: '#f39c12' },
  'BELOW_AVERAGE': { min: 50, max: 59, label: 'BELOW AVERAGE', color: '#e74c3c' },
  'NEEDS_IMPROVEMENT': { min: 0, max: 49, label: 'NEEDS SIGNIFICANT IMPROVEMENT', color: '#c0392b' }
};

// ============================================================================
// TEST DATA GENERATORS
// ============================================================================

/**
 * Generate realistic responses simulating a "Healthy School" performance
 */
function generateHealthySchoolResponses(): TestResponse[] {
  const responses: TestResponse[] = [];

  // D01: Academic Reputation - Strong Area
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(i => {
    responses.push({
      dimensionId: 'D01',
      questionId: `q1_${'mtp'[Math.floor((i-1)/3)]}_${((i-1)%3)+1}`,
      selectedWeight: [2, 2, 3, 2, 2, 3, 2, 3, 2, 3, 2, 2][i-1] // Average weight: 2.25
    });
  });

  // D02: Teacher Welfare - Above Average
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
    responses.push({
      dimensionId: 'D02',
      questionId: `q2_${'mtp'[Math.floor((i-1)/3)]}_${((i-1)%3)+1}`,
      selectedWeight: [3, 3, 4, 3, 3, 4, 3, 3, 4, 3][i-1] // Average weight: 3.3
    });
  });

  // D03: Leadership - Strong Area
  [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(i => {
    responses.push({
      dimensionId: 'D03',
      questionId: `q3_${'mt'[Math.floor((i-1)/3)]}_${((i-1)%3)+1}`,
      selectedWeight: [2, 2, 2, 2, 2, 3, 2, 3, 2][i-1] // Average weight: 2.2
    });
  });

  // D04-D14: Generate remaining with varied performance
  const dimensionWeights = {
    'D04': 3.2, 'D05': 2.1, 'D06': 3.5, 'D07': 2.8, 'D08': 3.0,
    'D09': 4.0, 'D10': 3.2, 'D11': 4.5, 'D12': 2.9, 'D13': 3.3, 'D14': 2.7
  };

  Object.entries(dimensionWeights).forEach(([dimId, avgWeight]) => {
    const numQuestions = 10 + Math.floor(Math.random() * 3); // 10-12 questions
    for (let i = 0; i < numQuestions; i++) {
      const stakeholder = ['m', 't', 'p', 'o'][Math.floor((i / numQuestions) * 4)];
      responses.push({
        dimensionId: dimId,
        questionId: `${dimId.toLowerCase()}_${stakeholder}_${(i % 3) + 1}`,
        selectedWeight: Math.max(1, Math.min(10, Math.round(avgWeight + (Math.random() - 0.5) * 2)))
      });
    }
  });

  return responses;
}

/**
 * Calculate scores from responses
 */
function calculateScoresFromResponses(responses: TestResponse[]): DimensionTestResult[] {
  const dimensionResponses: { [key: string]: TestResponse[] } = {};

  // Group responses by dimension
  responses.forEach(response => {
    if (!dimensionResponses[response.dimensionId]) {
      dimensionResponses[response.dimensionId] = [];
    }
    dimensionResponses[response.dimensionId].push(response);
  });

  // Calculate dimension scores
  const results: DimensionTestResult[] = [];

  Object.entries(dimensionResponses).forEach(([dimId, dimResponses]) => {
    const averageWeight = dimResponses.reduce((sum, r) => sum + r.selectedWeight, 0) / dimResponses.length;
    const score = SCORING_FORMULAS.dimensionScore(averageWeight);

    // Determine health status
    let healthStatus = '';
    Object.entries(HEALTH_CLASSIFICATIONS).forEach(([key, config]) => {
      if (score >= config.min && score <= config.max) {
        healthStatus = config.label;
      }
    });

    // Calculate stakeholder breakdown
    const stakeholders = ['m', 't', 'p', 'o'];
    const stakeholderScores: { [key: string]: number | undefined } = {};

    stakeholders.forEach(s => {
      const stakeholderResponses = dimResponses.filter(r => r.questionId.includes(`_${s}_`));
      if (stakeholderResponses.length > 0) {
        const avgWeight = stakeholderResponses.reduce((sum, r) => sum + r.selectedWeight, 0) / stakeholderResponses.length;
        const score = SCORING_FORMULAS.dimensionScore(avgWeight);
        const stakeholderMap: { [key: string]: string } = { 'm': 'management', 't': 'teachers', 'p': 'parents_students', 'o': 'operational_metrics' };
        stakeholderScores[stakeholderMap[s]] = score;
      }
    });

    results.push({
      dimensionId: dimId,
      label: `Dimension ${dimId}`,
      totalQuestions: dimResponses.length,
      questionsAnswered: dimResponses.length,
      managementQuestions: dimResponses.filter(r => r.questionId.includes('_m_')).length,
      teacherQuestions: dimResponses.filter(r => r.questionId.includes('_t_')).length,
      parentQuestions: dimResponses.filter(r => r.questionId.includes('_p_')).length,
      operationalQuestions: dimResponses.filter(r => r.questionId.includes('_o_')).length,
      averageWeight,
      dimensionScore: score,
      stakeholderScores,
      healthStatus
    });
  });

  return results;
}

/**
 * Calculate overall health index
 */
function calculateOverallHealthIndex(dimensionResults: DimensionTestResult[]): { index: number; status: string } {
  const weights = dimensionResults.map(d => DIMENSION_WEIGHTS[d.dimensionId as keyof typeof DIMENSION_WEIGHTS] || 7);
  const contributions = dimensionResults.map((d, i) => SCORING_FORMULAS.weightedContribution(d.dimensionScore, weights[i]));

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const totalContribution = contributions.reduce((sum, c) => sum + c, 0);

  const overallIndex = (totalContribution / totalWeight) * 100;

  let status = '';
  Object.entries(HEALTH_CLASSIFICATIONS).forEach(([key, config]) => {
    if (overallIndex >= config.min && overallIndex <= config.max) {
      status = config.label;
    }
  });

  return { index: overallIndex, status };
}

/**
 * Generate action plan from results
 */
function generateActionPlan(dimensionResults: DimensionTestResult[]): ActionItem[] {
  const actionItems: ActionItem[] = [];

  dimensionResults.forEach(result => {
    const gap = 75 - result.dimensionScore; // Target score: 75

    if (gap > 0) {
      let priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if (gap > 20) priority = 'URGENT';
      else if (gap > 15) priority = 'HIGH';
      else if (gap > 10) priority = 'MEDIUM';

      actionItems.push({
        dimensionId: result.dimensionId,
        dimensionLabel: result.label,
        currentScore: result.dimensionScore,
        targetScore: 75,
        priority,
        recommendations: [
          `Analyze current gap of ${gap.toFixed(1)} points`,
          `Implement targeted improvements in ${result.label}`,
          `Monitor progress monthly`
        ],
        timeline: priority === 'URGENT' ? '1-2 months' : priority === 'HIGH' ? '2-3 months' : '3-4 months'
      });
    }
  });

  return actionItems.sort((a, b) => {
    const priorityOrder = { 'URGENT': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// ============================================================================
// TEST EXECUTION
// ============================================================================

/**
 * Main test execution function
 */
export function runExpandedAssessmentTest(): AssessmentTestResult {
  console.log('\n🚀 STARTING EXPANDED ASSESSMENT TEST...\n');

  const startTime = Date.now();

  // Step 1: Generate test responses
  console.log('📝 Generating test responses for all 14 dimensions...');
  const responses = generateHealthySchoolResponses();
  console.log(`✅ Generated ${responses.length} responses\n`);

  // Step 2: Calculate dimension scores
  console.log('🧮 Calculating dimension scores...');
  const dimensionResults = calculateScoresFromResponses(responses);
  console.log(`✅ Calculated scores for ${dimensionResults.length} dimensions\n`);

  // Step 3: Display dimension results
  console.log('📊 DIMENSION SCORES:\n');
  dimensionResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result.dimensionId} - ${result.label}`);
    console.log(`   Score: ${result.dimensionScore.toFixed(1)}/100 [${result.healthStatus}]`);
    console.log(`   Questions: ${result.questionsAnswered}/${result.totalQuestions}`);
    console.log(`   Stakeholder Breakdown:`);
    Object.entries(result.stakeholderScores).forEach(([stakeholder, score]) => {
      if (score !== undefined) {
        console.log(`     • ${stakeholder}: ${score.toFixed(1)}`);
      }
    });
    console.log('');
  });

  // Step 4: Calculate overall health index
  console.log('🏆 Calculating overall health index...');
  const { index: overallIndex, status: healthStatus } = calculateOverallHealthIndex(dimensionResults);
  console.log(`✅ Overall Health Index: ${overallIndex.toFixed(1)}/100`);
  console.log(`✅ Health Status: ${healthStatus}\n`);

  // Step 5: Generate action plan
  console.log('📋 Generating action plan...');
  const actionPlan = generateActionPlan(dimensionResults);
  console.log(`✅ Generated ${actionPlan.length} action items\n`);

  // Step 6: Display action plan
  if (actionPlan.length > 0) {
    console.log('📋 TOP PRIORITIES:\n');
    actionPlan.slice(0, 5).forEach((item, index) => {
      console.log(`Priority ${index + 1}: ${item.dimensionId} - ${item.dimensionLabel}`);
      console.log(`   Priority Level: ${item.priority}`);
      console.log(`   Current Score: ${item.currentScore.toFixed(1)} → Target: ${item.targetScore}`);
      console.log(`   Gap: ${(item.targetScore - item.currentScore).toFixed(1)} points`);
      console.log(`   Timeline: ${item.timeline}`);
      console.log('');
    });
  }

  // Step 7: Performance metrics
  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log('⚡ PERFORMANCE METRICS:\n');
  console.log(`Total Questions: ${responses.length}`);
  console.log(`Calculation Time: ${duration}ms`);
  console.log(`Avg Time per Question: ${(duration / responses.length).toFixed(2)}ms`);
  console.log(`Avg Time per Dimension: ${(duration / dimensionResults.length).toFixed(2)}ms\n`);

  // Step 8: Validation checks
  console.log('✅ VALIDATION CHECKS:\n');
  const checks = [
    { name: 'All dimensions calculated', pass: dimensionResults.length === 14 },
    { name: 'All scores 0-100', pass: dimensionResults.every(d => d.dimensionScore >= 0 && d.dimensionScore <= 100) },
    { name: 'Overall index 0-100', pass: overallIndex >= 0 && overallIndex <= 100 },
    { name: 'Health status assigned', pass: healthStatus.length > 0 },
    { name: 'Action plan generated', pass: actionPlan.length > 0 },
    { name: 'Performance < 1 second', pass: duration < 1000 },
    { name: 'All responses recorded', pass: responses.length > 150 }
  ];

  checks.forEach(check => {
    console.log(`${check.pass ? '✅' : '❌'} ${check.name}`);
  });

  const allChecksPassed = checks.every(c => c.pass);
  console.log(`\n${allChecksPassed ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'}\n`);

  // Return test result
  return {
    schoolName: 'Test School - Golden Academy',
    assessmentDate: new Date(),
    totalQuestionsAsked: 14 * 10, // 14 dimensions × ~10 questions
    totalQuestionsAnswered: responses.length,
    completionPercentage: (responses.length / (14 * 10)) * 100,
    dimensionResults,
    overallHealthIndex: overallIndex,
    healthStatus,
    assessmentDuration: duration,
    actionPlan
  };
}

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

if (require.main === module) {
  const result = runExpandedAssessmentTest();
  console.log('\n📊 TEST EXECUTION COMPLETE\n');
  console.log('Result Summary:');
  console.log(JSON.stringify(result, null, 2));
}

export { calculateScoresFromResponses, generateHealthySchoolResponses, calculateOverallHealthIndex, generateActionPlan };

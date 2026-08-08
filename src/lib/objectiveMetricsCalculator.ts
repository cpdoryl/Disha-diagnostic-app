/**
 * Objective Metrics Calculator
 * Processes extracted school data and calculates objective scores for 14 dimensions
 * Maps raw metrics to DISHA dimension scores
 */

export interface ObjectiveMetric {
  name: string;
  value: number;
  unit: string;
  benchmark: number;
  status: 'exceeds' | 'meets' | 'below';
  gap: number;
  dataQuality: 'tier1' | 'tier2' | 'tier3';
}

export interface DimensionObjectiveScore {
  dimensionId: string;
  dimensionName: string;
  category: string;
  objectiveScore: number; // 0-100
  metrics: ObjectiveMetric[];
  dataCompleteness: number; // 0-100 - how much of expected data we have
  confidence: number; // 0-100 - confidence in score
  lastUpdated: Date;
}

/**
 * Map of raw metrics to dimension calculations
 * Each dimension may use multiple raw metrics
 */
export const DIMENSION_METRIC_MAPPING: Record<
  string,
  {
    name: string;
    category: string;
    requiredMetrics: string[];
    calculator: (metrics: Record<string, number>, benchmarks: Record<string, number>) => number;
  }
> = {
  dim1: {
    name: 'Academic Reputation',
    category: 'Academic Excellence',
    requiredMetrics: ['board_exam_pass_rate', 'avg_exam_score', 'distinction_count'],
    calculator: (metrics, benchmarks) => {
      // Calculate based on board performance
      const passRate = metrics.board_exam_pass_rate || 0;
      const avgScore = metrics.avg_exam_score || 0;
      const distinctCount = metrics.distinction_count || 0;

      const passScore = (passRate / benchmarks.board_exam_pass_rate) * 40;
      const avgScore_score = (avgScore / benchmarks.avg_exam_score) * 40;
      const distinctScore = (distinctCount / 30) * 20; // 30% is benchmark

      return Math.min(100, passScore + avgScore_score + distinctScore);
    },
  },

  dim2: {
    name: 'Competence of Faculty',
    category: 'Academic Excellence',
    requiredMetrics: ['certified_teachers_pct', 'annual_training_hours', 'postgraduate_teachers_pct'],
    calculator: (metrics, benchmarks) => {
      const certified = metrics.certified_teachers_pct || 0;
      const training = metrics.annual_training_hours || 0;
      const postgrad = metrics.postgraduate_teachers_pct || 0;

      const certScore = (certified / 95) * 40;
      const trainingScore = (training / 25) * 35;
      const postgradScore = (postgrad / 60) * 25;

      return Math.min(100, certScore + trainingScore + postgradScore);
    },
  },

  dim3: {
    name: 'Curriculum & Pedagogy',
    category: 'Academic Excellence',
    requiredMetrics: ['curriculum_coverage', 'project_submission_rate', 'digital_content_usage'],
    calculator: (metrics, benchmarks) => {
      const coverage = metrics.curriculum_coverage || 0;
      const projects = metrics.project_submission_rate || 0;
      const digital = metrics.digital_content_usage || 0;

      const coverageScore = (coverage / 95) * 40;
      const projectScore = (projects / 90) * 35;
      const digitalScore = (digital / 70) * 25;

      return Math.min(100, coverageScore + projectScore + digitalScore);
    },
  },

  dim4: {
    name: 'Quality of Alumni',
    category: 'Academic Excellence',
    requiredMetrics: ['higher_ed_admission_rate', 'top_college_placement_pct', 'professional_qualification_rate'],
    calculator: (metrics, benchmarks) => {
      const admission = metrics.higher_ed_admission_rate || 0;
      const topCollege = metrics.top_college_placement_pct || 0;
      const qualification = metrics.professional_qualification_rate || 0;

      const admissionScore = (admission / 90) * 40;
      const topCollegeScore = (topCollege / 50) * 40;
      const qualScore = (qualification / 20) * 20;

      return Math.min(100, admissionScore + topCollegeScore + qualScore);
    },
  },

  dim5: {
    name: 'Teacher Welfare',
    category: 'Welfare',
    requiredMetrics: ['avg_teacher_salary', 'health_insurance_coverage', 'staff_turnover_rate'],
    calculator: (metrics, benchmarks) => {
      const salary = metrics.avg_teacher_salary || 0;
      const insurance = metrics.health_insurance_coverage || 0;
      const turnover = metrics.staff_turnover_rate || 0; // Lower is better

      // Salary comparison (assume ₹40,000 as benchmark)
      const salaryScore = Math.min(100, (salary / 40000) * 40);
      const insuranceScore = insurance * 0.35; // Direct percentage
      const turnoverScore = Math.max(0, 100 - (turnover * 10)) * 0.25; // Invert: lower turnover = higher score

      return Math.min(100, salaryScore + insuranceScore + turnoverScore);
    },
  },

  dim6: {
    name: 'Wellbeing Services',
    category: 'Welfare',
    requiredMetrics: ['counselor_availability', 'medical_checkup_frequency', 'hygiene_audit_score'],
    calculator: (metrics, benchmarks) => {
      const counselor = metrics.counselor_availability || 0;
      const medical = metrics.medical_checkup_frequency || 0;
      const hygiene = metrics.hygiene_audit_score || 0;

      const counselorScore = Math.min(100, (counselor / 1) * 35); // 1 per 500 students
      const medicalScore = (medical / 2) * 35; // 2 checkups per year
      const hygieneScore = (hygiene / 95) * 30;

      return Math.min(100, counselorScore + medicalScore + hygieneScore);
    },
  },

  dim7: {
    name: 'Infrastructure',
    category: 'Welfare',
    requiredMetrics: ['lab_facilities_ratio', 'computer_lab_ratio', 'playground_condition'],
    calculator: (metrics, benchmarks) => {
      const labs = metrics.lab_facilities_ratio || 0; // Students per lab
      const computers = metrics.computer_lab_ratio || 0; // Students per computer
      const playground = metrics.playground_condition || 0; // Condition %

      // Ratios: lower is better
      const labScore = Math.max(0, 100 - (labs / 3) * 20) * 0.35;
      const computerScore = Math.max(0, 100 - (computers / 1) * 20) * 0.35;
      const playgroundScore = (playground / 95) * 30;

      return Math.min(100, labScore + computerScore + playgroundScore);
    },
  },

  dim8: {
    name: 'Individual Attention',
    category: 'Individual Attention',
    requiredMetrics: ['student_teacher_ratio', 'avg_class_size', 'remedial_class_frequency'],
    calculator: (metrics, benchmarks) => {
      const stratio = metrics.student_teacher_ratio || 0; // Lower is better
      const classSize = metrics.avg_class_size || 0; // Lower is better
      const remedial = metrics.remedial_class_frequency || 0;

      // Good S:T ratio is <= 30:1
      const stratioScore = Math.max(0, 100 - (stratio / 3) * 20) * 0.4;
      // Good class size is <= 40
      const classSizeScore = Math.max(0, 100 - (classSize / 4) * 20) * 0.4;
      const remedialScore = (remedial / 2) * 20; // 2 sessions per week

      return Math.min(100, stratioScore + classSizeScore + remedialScore);
    },
  },

  dim9: {
    name: 'Co-curricular Activities',
    category: 'Individual Attention',
    requiredMetrics: ['activity_count', 'student_participation_rate', 'activity_hours_monthly'],
    calculator: (metrics, benchmarks) => {
      const activities = metrics.activity_count || 0;
      const participation = metrics.student_participation_rate || 0;
      const hours = metrics.activity_hours_monthly || 0;

      const activityScore = (activities / 15) * 35; // 15 activities is benchmark
      const participationScore = (participation / 60) * 40; // 60% participation
      const hoursScore = (hours / 10) * 25; // 10 hours per month

      return Math.min(100, activityScore + participationScore + hoursScore);
    },
  },

  dim10: {
    name: 'Sports Education',
    category: 'Individual Attention',
    requiredMetrics: ['sports_discipline_count', 'pe_class_frequency', 'sports_coaching_ratio'],
    calculator: (metrics, benchmarks) => {
      const sports = metrics.sports_discipline_count || 0;
      const peFreq = metrics.pe_class_frequency || 0;
      const coaching = metrics.sports_coaching_ratio || 0;

      const sportScore = (sports / 10) * 35; // 10 sports offered
      const peScore = (peFreq / 4) * 35; // 4 PE classes per week
      const coachScore = Math.min(100, (coaching / 1) * 30); // 1 coach per 200 students

      return Math.min(100, sportScore + peScore + coachScore);
    },
  },

  dim11: {
    name: 'Community Service',
    category: 'Social Responsibility',
    requiredMetrics: ['csr_projects_yearly', 'student_participation_rate', 'community_outreach_hours'],
    calculator: (metrics, benchmarks) => {
      const projects = metrics.csr_projects_yearly || 0;
      const participation = metrics.student_participation_rate || 0;
      const hours = metrics.community_outreach_hours || 0;

      const projectScore = (projects / 3) * 35; // 3 projects per year
      const participationScore = (participation / 40) * 35; // 40% student involvement
      const hoursScore = (hours / 100) * 30; // 100 hours per year

      return Math.min(100, projectScore + participationScore + hoursScore);
    },
  },

  dim12: {
    name: 'Parental Involvement',
    category: 'Social Responsibility',
    requiredMetrics: ['pta_meeting_frequency', 'parent_participation_rate', 'parent_query_response_time'],
    calculator: (metrics, benchmarks) => {
      const meetings = metrics.pta_meeting_frequency || 0;
      const participation = metrics.parent_participation_rate || 0;
      const responseTime = metrics.parent_query_response_time || 0; // Hours, lower is better

      const meetingScore = (meetings / 4) * 35; // 4 meetings per year
      const participationScore = (participation / 40) * 40; // 40% participation
      const responseScore = Math.max(0, 100 - (responseTime / 24) * 20) * 0.25;

      return Math.min(100, meetingScore + participationScore + responseScore);
    },
  },

  dim13: {
    name: 'Leadership Quality',
    category: 'Social Responsibility',
    requiredMetrics: ['principal_qualification_score', 'strategic_plan_implementation', 'compliance_score'],
    calculator: (metrics, benchmarks) => {
      const qualification = metrics.principal_qualification_score || 0; // 0-100
      const implementation = metrics.strategic_plan_implementation || 0; // 0-100
      const compliance = metrics.compliance_score || 0; // 0-100

      const qualScore = (qualification / 100) * 35;
      const implementScore = (implementation / 100) * 40;
      const complScore = (compliance / 100) * 25;

      return Math.min(100, qualScore + implementScore + complScore);
    },
  },

  dim14: {
    name: 'Value for Money',
    category: 'Social Responsibility',
    requiredMetrics: ['fee_amount', 'academic_performance_score', 'infrastructure_investment'],
    calculator: (metrics, benchmarks) => {
      // Complex calculation comparing fee vs value delivered
      const fee = metrics.fee_amount || 50000; // Annual fee
      const academic = metrics.academic_performance_score || 0; // Dimension 1 score
      const infrastructure = metrics.infrastructure_investment || 0; // Investment per student

      // Simple ROI: (Academic Score + Infrastructure Score) / Fee (in thousands)
      const value = (academic * 0.5 + infrastructure / 100 * 0.5) / (fee / 10000);
      const valueScore = Math.min(100, value * 10);

      return valueScore;
    },
  },
};

/**
 * Calculate objective scores for all 14 dimensions
 */
export function calculateAllDimensionScores(
  extractedMetrics: Record<string, number>
): DimensionObjectiveScore[] {
  const results: DimensionObjectiveScore[] = [];

  // Standard benchmarks for comparison
  const benchmarks: Record<string, number> = {
    board_exam_pass_rate: 85,
    avg_exam_score: 75,
    certified_teachers_pct: 95,
    curriculum_coverage: 95,
    student_teacher_ratio: 30,
  };

  // Calculate each dimension
  Object.entries(DIMENSION_METRIC_MAPPING).forEach(([dimId, dimConfig]) => {
    // Check if we have required metrics
    const availableMetrics = dimConfig.requiredMetrics.filter(m => m in extractedMetrics);
    const completeness = (availableMetrics.length / dimConfig.requiredMetrics.length) * 100;

    // Only calculate if we have at least 60% of required metrics
    let score = 0;
    if (completeness >= 60) {
      try {
        score = dimConfig.calculator(extractedMetrics, benchmarks);
      } catch (error) {
        console.error(`Error calculating score for ${dimId}:`, error);
        score = 0;
      }
    }

    // Build metrics detail
    const metrics: ObjectiveMetric[] = availableMetrics.map(metricKey => {
      const value = extractedMetrics[metricKey] || 0;
      const benchmark = benchmarks[metricKey] || 0;
      const gap = value - benchmark;

      return {
        name: metricKey,
        value,
        unit: '%',
        benchmark,
        status: gap > 0 ? 'exceeds' : gap === 0 ? 'meets' : 'below',
        gap: Math.abs(gap),
        dataQuality: 'tier1', // Mark as tier1 since from operational data
      };
    });

    // Confidence based on data completeness
    const confidence = Math.min(100, completeness);

    results.push({
      dimensionId: dimId,
      dimensionName: dimConfig.name,
      category: dimConfig.category,
      objectiveScore: Math.round(score),
      metrics,
      dataCompleteness: Math.round(completeness),
      confidence: Math.round(confidence),
      lastUpdated: new Date(),
    });
  });

  return results;
}

/**
 * Get a single dimension's objective score
 */
export function calculateDimensionScore(
  dimensionId: string,
  extractedMetrics: Record<string, number>
): DimensionObjectiveScore | null {
  const dimConfig = DIMENSION_METRIC_MAPPING[dimensionId];
  if (!dimConfig) return null;

  const scores = calculateAllDimensionScores(extractedMetrics);
  return scores.find(s => s.dimensionId === dimensionId) || null;
}

/**
 * Summary score across all 14 dimensions
 */
export function calculateObjectiveHealthIndex(
  objectiveScores: DimensionObjectiveScore[]
): { averageScore: number; confidence: number; dataCompleteness: number } {
  if (objectiveScores.length === 0) {
    return { averageScore: 0, confidence: 0, dataCompleteness: 0 };
  }

  const avgScore =
    objectiveScores.reduce((sum, dim) => sum + dim.objectiveScore, 0) / objectiveScores.length;
  const avgConfidence =
    objectiveScores.reduce((sum, dim) => sum + dim.confidence, 0) / objectiveScores.length;
  const avgCompleteness =
    objectiveScores.reduce((sum, dim) => sum + dim.dataCompleteness, 0) / objectiveScores.length;

  return {
    averageScore: Math.round(avgScore),
    confidence: Math.round(avgConfidence),
    dataCompleteness: Math.round(avgCompleteness),
  };
}

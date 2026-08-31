/**
 * Challenge Data Requirements System
 * Defines required objective metrics for each of the 15 First Opinion Engine
 * challenges (see src/data/screeningQuestionsData.ts for the questions bank).
 *
 * IMPORTANT: the keys of CHALLENGE_DATA_REQUIREMENTS below are the exact same
 * challenge ids used by COMPLETE_SCREENING_QUESTIONS (e.g. "enrollment_decline"),
 * NOT the "C1".."C15" challengeId shorthand. selectedChallenges in
 * FirstOpinionPage.tsx is always an array of these ids, so this file must be
 * keyed the same way for lookups to actually resolve.
 *
 * fieldName values are the canonical metric keys used by the Operational
 * Metrics CSV upload format (see fileAnalyzer.ts: parseCanonicalMetricsCSV).
 * Each fieldName is derived directly from the "metrics" array already declared
 * per challenge in screeningQuestionsData.ts, so the objective data requested
 * here always matches the metric named in that challenge's own question bank.
 */

export interface MetricRequirement {
  fieldName: string;
  displayName: string;
  description: string;
  unit: string;
  example: string;
  mandatory: boolean;
  dataType: 'number' | 'percentage' | 'count' | 'hours' | 'ratio' | 'currency';
}

/**
 * The 4 CORE operational levers that feed the DISHA Health Score itself
 * (see DISHAScoreCalculator / OperationalMetrics). These are required on
 * EVERY First Opinion checkup regardless of which 3 challenges are selected
 * — they are not challenge-specific.
 */
export const CORE_OPERATIONAL_METRICS: MetricRequirement[] = [
  {
    fieldName: 'students_per_classroom',
    displayName: 'Student-Teacher Ratio',
    description: 'Average number of students per classroom/teacher',
    unit: 'ratio',
    example: '28',
    mandatory: true,
    dataType: 'ratio'
  },
  {
    fieldName: 'parent_query_response_sla_hours',
    displayName: 'Parent Query Response SLA',
    description: 'Average time taken to respond to a parent query',
    unit: 'hours',
    example: '24',
    mandatory: true,
    dataType: 'hours'
  },
  {
    fieldName: 'annual_training_hours',
    displayName: 'Annual Teacher Training Hours',
    description: 'CPD/training hours per teacher per year',
    unit: 'hours',
    example: '20',
    mandatory: true,
    dataType: 'hours'
  },
  {
    fieldName: 'weekly_planning_hours',
    displayName: 'Weekly Planning Time',
    description: 'Hours per week allocated for lesson planning',
    unit: 'hours',
    example: '4',
    mandatory: true,
    dataType: 'hours'
  }
];

export interface ChallengeDataRequirement {
  challengeId: string; // C1..C15 shorthand, for reference/display only
  challengeKey: string; // the real screeningQuestionsData id (matches selectedChallenges entries)
  challengeName: string;
  category: string;
  requiredMetrics: MetricRequirement[];
  optionalMetrics: MetricRequirement[];
  sampleDataFile: string;
}

// ============================================================================
// 15 CHALLENGES DATA REQUIREMENTS (keyed by the real screeningQuestionsData id)
// ============================================================================

export const CHALLENGE_DATA_REQUIREMENTS: Record<string, ChallengeDataRequirement> = {
  enrollment_decline: {
    challengeId: 'C1',
    challengeKey: 'enrollment_decline',
    challengeName: 'Enrollment Decline',
    category: 'Growth & Enrollment',
    requiredMetrics: [
      {
        fieldName: 'new_student_intake_rate_pct',
        displayName: 'New Student Intake Rate',
        description: 'Year-over-year growth (or decline) in new admissions',
        unit: 'percentage',
        example: '-8',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'student_retention_rate_pct',
        displayName: 'Student Retention Rate',
        description: 'Grade 1 to Grade 12 retention percentage',
        unit: 'percentage',
        example: '78',
        mandatory: true,
        dataType: 'percentage'
      }
    ],
    optionalMetrics: [],
    sampleDataFile: 'operational_metrics_master_ALL_15_CHALLENGES.csv'
  },

  student_attrition: {
    challengeId: 'C2',
    challengeKey: 'student_attrition',
    challengeName: 'Student Attrition',
    category: 'Growth & Enrollment',
    requiredMetrics: [
      {
        fieldName: 'midyear_dropout_rate_pct',
        displayName: 'Mid-Year Dropout Rate',
        description: 'Percentage of students leaving mid-year',
        unit: 'percentage',
        example: '6',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'outflow_to_competitors_pct',
        displayName: 'Outflow to Competitors',
        description: 'Students leaving to competitor schools',
        unit: 'percentage',
        example: '4',
        mandatory: true,
        dataType: 'percentage'
      }
    ],
    optionalMetrics: [],
    sampleDataFile: 'operational_metrics_master_ALL_15_CHALLENGES.csv'
  },

  fee_collection_challenges: {
    challengeId: 'C3',
    challengeKey: 'fee_collection_challenges',
    challengeName: 'Fee Collection Challenges',
    category: 'Growth & Enrollment',
    requiredMetrics: [
      {
        fieldName: 'fee_realization_rate_pct',
        displayName: 'Fee Realization Rate',
        description: 'Percentage of billed annual fees actually collected',
        unit: 'percentage',
        example: '86',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'days_sales_outstanding',
        displayName: 'Days Sales Outstanding (DSO)',
        description: 'Average days taken to collect a fee installment after it is due',
        unit: 'days',
        example: '45',
        mandatory: true,
        dataType: 'number'
      }
    ],
    optionalMetrics: [],
    sampleDataFile: 'operational_metrics_master_ALL_15_CHALLENGES.csv'
  },

  teacher_attrition: {
    challengeId: 'C4',
    challengeKey: 'teacher_attrition',
    challengeName: 'Teacher Attrition',
    category: 'People & Staffing',
    requiredMetrics: [
      {
        fieldName: 'teacher_turnover_rate_pct',
        displayName: 'Teacher Turnover Rate',
        description: 'Annual teacher attrition rate',
        unit: 'percentage',
        example: '22',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'avg_teacher_tenure_years',
        displayName: 'Average Teacher Tenure',
        description: 'Average years of service for current teaching staff',
        unit: 'years',
        example: '3.5',
        mandatory: true,
        dataType: 'number'
      }
    ],
    optionalMetrics: [],
    sampleDataFile: 'operational_metrics_master_ALL_15_CHALLENGES.csv'
  },

  staff_capability_gaps: {
    challengeId: 'C5',
    challengeKey: 'staff_capability_gaps',
    challengeName: 'Staff Capability Gaps',
    category: 'People & Staffing',
    requiredMetrics: [
      {
        fieldName: 'teacher_competency_score_pct',
        displayName: 'Teacher Competency Score',
        description: 'Internal or external assessment score of teaching competency',
        unit: 'percentage',
        example: '68',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'professional_qualification_pct',
        displayName: 'Professional Qualification %',
        description: 'Percentage of teachers holding required formal qualifications (e.g. B.Ed)',
        unit: 'percentage',
        example: '74',
        mandatory: true,
        dataType: 'percentage'
      }
    ],
    optionalMetrics: [],
    sampleDataFile: 'operational_metrics_master_ALL_15_CHALLENGES.csv'
  },

  leadership_capability_gap: {
    challengeId: 'C6',
    challengeKey: 'leadership_capability_gap',
    challengeName: 'Leadership Capability Gap',
    category: 'People & Staffing',
    requiredMetrics: [
      {
        fieldName: 'leadership_competency_score_pct',
        displayName: 'Leadership Competency Score',
        description: 'Assessment score of middle-management / HOD decision-making capability',
        unit: 'percentage',
        example: '60',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'principal_vp_experience_years',
        displayName: 'Principal/VP Experience',
        description: 'Years of leadership experience of the Principal/Vice-Principal',
        unit: 'years',
        example: '5',
        mandatory: true,
        dataType: 'number'
      }
    ],
    optionalMetrics: [],
    sampleDataFile: 'operational_metrics_master_ALL_15_CHALLENGES.csv'
  },

  academic_quality_decline: {
    challengeId: 'C7',
    challengeKey: 'academic_quality_decline',
    challengeName: 'Academic Quality Decline',
    category: 'Academic & Wellbeing',
    requiredMetrics: [
      {
        fieldName: 'board_exam_pass_rate_pct',
        displayName: 'Board Exam Pass Rate',
        description: 'Percentage of students passing board exams',
        unit: 'percentage',
        example: '87',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'average_subject_score_pct',
        displayName: 'Average Subject Score',
        description: 'Average score across all subjects, all grades',
        unit: 'percentage',
        example: '71',
        mandatory: true,
        dataType: 'percentage'
      }
    ],
    optionalMetrics: [],
    sampleDataFile: 'operational_metrics_master_ALL_15_CHALLENGES.csv'
  },

  student_wellbeing_issues: {
    challengeId: 'C8',
    challengeKey: 'student_wellbeing_issues',
    challengeName: 'Student Wellbeing Issues',
    category: 'Academic & Wellbeing',
    requiredMetrics: [
      {
        fieldName: 'mental_health_incidents_per_1000',
        displayName: 'Mental Health Incidents',
        description: 'Reported mental-health-related incidents per 1000 students per year',
        unit: 'per 1000 students',
        example: '12',
        mandatory: true,
        dataType: 'ratio'
      },
      {
        fieldName: 'safety_violations_count_year',
        displayName: 'Safety Violations',
        description: 'Number of reported safety/bullying violations in the past year',
        unit: 'count/year',
        example: '5',
        mandatory: true,
        dataType: 'count'
      }
    ],
    optionalMetrics: [],
    sampleDataFile: 'operational_metrics_master_ALL_15_CHALLENGES.csv'
  },

  remedial_lag: {
    challengeId: 'C9',
    challengeKey: 'remedial_lag',
    challengeName: 'Remedial Lag',
    category: 'Academic & Wellbeing',
    requiredMetrics: [
      {
        fieldName: 'remedial_support_coverage_pct',
        displayName: 'Remedial Support Coverage',
        description: 'Percentage of struggling students actually enrolled in remedial support',
        unit: 'percentage',
        example: '35',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'improvement_rate_pct',
        displayName: 'Improvement Rate',
        description: 'Percentage of remedial-program students who improved by next assessment',
        unit: 'percentage',
        example: '48',
        mandatory: true,
        dataType: 'percentage'
      }
    ],
    optionalMetrics: [],
    sampleDataFile: 'operational_metrics_master_ALL_15_CHALLENGES.csv'
  },

  parent_communication_issues: {
    challengeId: 'C10',
    challengeKey: 'parent_communication_issues',
    challengeName: 'Parent Communication Issues',
    category: 'Reputation & Competition',
    requiredMetrics: [
      {
        fieldName: 'parent_satisfaction_score_pct',
        displayName: 'Parent Satisfaction Score',
        description: 'Percentage of parents rating communication as satisfactory or better',
        unit: 'percentage',
        example: '58',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'parent_response_rate_pct',
        displayName: 'Parent Response Rate',
        description: 'Percentage of parent queries responded to within SLA',
        unit: 'percentage',
        example: '65',
        mandatory: true,
        dataType: 'percentage'
      }
    ],
    optionalMetrics: [],
    sampleDataFile: 'operational_metrics_master_ALL_15_CHALLENGES.csv'
  },

  competitive_pressure: {
    challengeId: 'C11',
    challengeKey: 'competitive_pressure',
    challengeName: 'Competitive Pressure',
    category: 'Reputation & Competition',
    requiredMetrics: [
      {
        fieldName: 'market_share_loss_pct',
        displayName: 'Market Share Loss',
        description: 'Estimated local market share lost to competitor schools year-over-year',
        unit: 'percentage',
        example: '5',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'competitor_win_rate_pct',
        displayName: 'Competitor Win Rate',
        description: 'Percentage of contested admissions inquiries lost to a named competitor',
        unit: 'percentage',
        example: '30',
        mandatory: true,
        dataType: 'percentage'
      }
    ],
    optionalMetrics: [],
    sampleDataFile: 'operational_metrics_master_ALL_15_CHALLENGES.csv'
  },

  brand_reputation_issues: {
    challengeId: 'C12',
    challengeKey: 'brand_reputation_issues',
    challengeName: 'Brand/Reputation Issues',
    category: 'Reputation & Competition',
    requiredMetrics: [
      {
        fieldName: 'brand_perception_score_pct',
        displayName: 'Brand Perception Score',
        description: 'Community/parent brand perception score from survey or review platforms',
        unit: 'percentage',
        example: '62',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'media_sentiment_pct',
        displayName: 'Media Sentiment',
        description: 'Percentage of local media/online mentions that are positive',
        unit: 'percentage',
        example: '55',
        mandatory: true,
        dataType: 'percentage'
      }
    ],
    optionalMetrics: [],
    sampleDataFile: 'operational_metrics_master_ALL_15_CHALLENGES.csv'
  },

  cost_inflation: {
    challengeId: 'C13',
    challengeKey: 'cost_inflation',
    challengeName: 'Cost Inflation',
    category: 'Operations & Finance',
    requiredMetrics: [
      {
        fieldName: 'cost_increase_yoy_pct',
        displayName: 'Cost Increase YoY',
        description: 'Year-over-year growth in total operating costs',
        unit: 'percentage',
        example: '14',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'operating_margin_pct',
        displayName: 'Operating Margin',
        description: 'Operating surplus/deficit as a percentage of revenue',
        unit: 'percentage',
        example: '6',
        mandatory: true,
        dataType: 'percentage'
      }
    ],
    optionalMetrics: [],
    sampleDataFile: 'operational_metrics_master_ALL_15_CHALLENGES.csv'
  },

  infrastructure_deficits: {
    challengeId: 'C14',
    challengeKey: 'infrastructure_deficits',
    challengeName: 'Infrastructure Deficits',
    category: 'Operations & Finance',
    requiredMetrics: [
      {
        fieldName: 'infrastructure_quality_score_pct',
        displayName: 'Infrastructure Quality Score',
        description: 'Composite score of classroom, lab and campus facility quality',
        unit: 'percentage',
        example: '58',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'maintenance_backlog_inr',
        displayName: 'Maintenance Backlog',
        description: 'Value of pending maintenance work not yet budgeted or completed',
        unit: 'INR',
        example: '850000',
        mandatory: true,
        dataType: 'currency'
      }
    ],
    optionalMetrics: [],
    sampleDataFile: 'operational_metrics_master_ALL_15_CHALLENGES.csv'
  },

  compliance_regulatory_stress: {
    challengeId: 'C15',
    challengeKey: 'compliance_regulatory_stress',
    challengeName: 'Compliance & Regulatory Stress',
    category: 'Operations & Finance',
    requiredMetrics: [
      {
        fieldName: 'compliance_score_pct',
        displayName: 'Compliance Score',
        description: 'Percentage of board affiliation / statutory safety requirements currently met',
        unit: 'percentage',
        example: '80',
        mandatory: true,
        dataType: 'percentage'
      },
      {
        fieldName: 'regulatory_violations_count_year',
        displayName: 'Regulatory Violations',
        description: 'Number of regulatory or board-affiliation violations flagged in the past year',
        unit: 'count/year',
        example: '1',
        mandatory: true,
        dataType: 'count'
      }
    ],
    optionalMetrics: [],
    sampleDataFile: 'operational_metrics_master_ALL_15_CHALLENGES.csv'
  }
};

/**
 * Get data requirements for selected challenges
 */
export function getDataRequirementsForChallenges(
  challengeIds: string[]
): ChallengeDataRequirement[] {
  return challengeIds
    .map(id => CHALLENGE_DATA_REQUIREMENTS[id])
    .filter(Boolean);
}

/**
 * Get all required metrics for selected challenges (deduplicated by fieldName,
 * since two challenges could theoretically ask for the same underlying metric)
 */
export function getRequiredMetricsForChallenges(
  challengeIds: string[]
): MetricRequirement[] {
  const requirements = getDataRequirementsForChallenges(challengeIds);
  const seen = new Set<string>();
  const metrics: MetricRequirement[] = [];

  requirements.forEach(req => {
    req.requiredMetrics.forEach(m => {
      if (!seen.has(m.fieldName)) {
        seen.add(m.fieldName);
        metrics.push(m);
      }
    });
  });

  return metrics;
}

/**
 * Validate uploaded data against selected challenges
 */
export function validateDataForChallenges(
  uploadedMetrics: Record<string, any>,
  challengeIds: string[]
): {
  isValid: boolean;
  missingMetrics: string[];
  foundMetrics: string[];
  completeness: number;
  recommendations: string[];
  requiredMetrics: MetricRequirement[];
} {
  const requiredMetrics = getRequiredMetricsForChallenges(challengeIds);
  const missingMetrics: string[] = [];
  const foundMetrics: string[] = [];

  requiredMetrics.forEach(metric => {
    if (uploadedMetrics[metric.fieldName] !== undefined && uploadedMetrics[metric.fieldName] !== null && String(uploadedMetrics[metric.fieldName]).trim() !== '') {
      foundMetrics.push(`✅ ${metric.displayName}`);
    } else {
      missingMetrics.push(`❌ ${metric.displayName} (${metric.fieldName})`);
    }
  });

  const completeness = requiredMetrics.length > 0
    ? Math.round((foundMetrics.length / requiredMetrics.length) * 100)
    : 100;

  const isValid = requiredMetrics.length > 0 && missingMetrics.length === 0;

  const recommendations: string[] = [];
  if (!isValid) {
    recommendations.push(`Missing ${missingMetrics.length} required metric(s)`);
    recommendations.push('Upload an Operational Metrics CSV (metric_field,value rows) that includes every field listed above');
    recommendations.push('See the "Required Data Fields" panel above for the exact field names and example values');
  }

  if (isValid && completeness < 100) {
    recommendations.push('Consider adding optional metrics for more comprehensive analysis');
  }

  return {
    isValid,
    missingMetrics,
    foundMetrics,
    completeness,
    recommendations,
    requiredMetrics
  };
}

export default CHALLENGE_DATA_REQUIREMENTS;

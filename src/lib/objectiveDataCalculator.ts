/**
 * DISHA 14-Dimensional Objective Data Calculator
 * Defines metrics, data types, and calculations for objective assessment
 * Each dimension has specific data fields required from school operational data
 */

export interface ObjectiveMetric {
  dimensionId: string;
  dimensionName: string;
  description: string;
  dataFields: DataField[];
  calculationFormula: string;
  scoreRange: [number, number]; // [min, max]
  benchmarkValue: number;
  dataSource: 'erp' | 'manual_file' | 'external_api' | 'mixed';
  confidence: number; // 0-100%
}

export interface DataField {
  id: string;
  name: string;
  description: string;
  dataType: 'number' | 'percentage' | 'text' | 'date' | 'boolean';
  required: boolean;
  examples: string[];
  acceptedFormats: string[]; // e.g., ["xlsx", "csv", "pdf"]
  validationRules?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ObjectiveScore {
  dimensionId: string;
  dimensionName: string;
  rawScore: number; // Raw calculation result
  normalizedScore: number; // Normalized to 0-100
  benchmarkScore: number; // National/board benchmark
  gap: number; // normalizedScore - benchmarkScore
  confidence: number; // Data quality confidence %
  dataSource: string;
  lastUpdated: Date;
  calculationDetails: {
    formula: string;
    inputs: Record<string, number>;
    result: number;
  };
}

export interface SubjectiveVsObjective {
  dimensionId: string;
  dimensionName: string;
  subjectiveScore: number; // From 14D survey
  objectiveScore: number; // From imported data
  gap: number; // Subjective - Objective
  alignment: 'aligned' | 'overestimated' | 'underestimated';
  interpretation: string;
  confidence: number;
}

/**
 * DIMENSION 1: Academic Excellence
 * Measures curriculum delivery, learning outcomes, and academic performance
 */
export const DIMENSION_1_ACADEMIC: ObjectiveMetric = {
  dimensionId: 'd1_academic',
  dimensionName: 'Academic Excellence',
  description: 'Curriculum delivery quality, assessment rigor, learning outcomes achievement',
  dataFields: [
    {
      id: 'board_exam_pass_rate',
      name: 'Board Exam Pass Rate (%)',
      description: 'Percentage of students passing board exams (Class 10, 12)',
      dataType: 'percentage',
      required: true,
      examples: ['95.5', '88.3', '100'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'avg_exam_score',
      name: 'Average Exam Score',
      description: 'Average percentage score across all exams',
      dataType: 'percentage',
      required: true,
      examples: ['72', '85', '68.5'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'curriculum_coverage',
      name: 'Curriculum Coverage (%)',
      description: 'Percentage of annual curriculum covered by end of academic year',
      dataType: 'percentage',
      required: true,
      examples: ['95', '100', '88'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'internal_assessment_avg',
      name: 'Internal Assessment Average',
      description: 'Average continuous assessment scores',
      dataType: 'percentage',
      required: false,
      examples: ['78', '85', '72.5'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    }
  ],
  calculationFormula: '(boardExamPassRate * 0.4) + (avgExamScore * 0.35) + (curriculumCoverage * 0.25)',
  scoreRange: [0, 100],
  benchmarkValue: 80, // National benchmark
  dataSource: 'mixed',
  confidence: 85
};

/**
 * DIMENSION 2: Teaching Quality
 * Measures teacher qualifications, professional development, and pedagogical practices
 */
export const DIMENSION_2_TEACHING: ObjectiveMetric = {
  dimensionId: 'd2_teaching',
  dimensionName: 'Teaching Quality',
  description: 'Teacher qualifications, professional certifications, continuous learning engagement',
  dataFields: [
    {
      id: 'certified_teachers_pct',
      name: 'Certified Teachers (%)',
      description: 'Percentage of teachers with required certification (B.Ed, M.A, etc.)',
      dataType: 'percentage',
      required: true,
      examples: ['92', '100', '85.5'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'masters_degree_pct',
      name: 'Teachers with Masters (%)',
      description: 'Percentage of teachers holding M.A/M.Sc degrees',
      dataType: 'percentage',
      required: false,
      examples: ['45', '60', '32.5'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'annual_training_hours',
      name: 'Annual Training Hours per Teacher',
      description: 'Total professional development hours per teacher per year (CPD, workshops, etc.)',
      dataType: 'number',
      required: true,
      examples: ['40', '60', '25'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 500 }
    },
    {
      id: 'training_participation_pct',
      name: 'Teachers Participating in Training (%)',
      description: 'Percentage of teachers who completed at least one training program',
      dataType: 'percentage',
      required: true,
      examples: ['88', '95', '75'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    }
  ],
  calculationFormula: '(certifiedTeachersPct * 0.35) + (annualTrainingHours / 40 * 100 * 0.35) + (trainingParticipationPct * 0.3)',
  scoreRange: [0, 100],
  benchmarkValue: 78,
  dataSource: 'mixed',
  confidence: 88
};

/**
 * DIMENSION 3: Learning Outcomes & Student Progress
 * Measures value-add, skill development, competency achievement
 */
export const DIMENSION_3_LEARNING_OUTCOMES: ObjectiveMetric = {
  dimensionId: 'd3_learning_outcomes',
  dimensionName: 'Learning Outcomes & Student Progress',
  description: 'Value-add calculations, competency achievement, skill development metrics',
  dataFields: [
    {
      id: 'students_proficiency_pct',
      name: 'Students Meeting Proficiency Level (%)',
      description: 'Percentage of students achieving proficiency in core subjects',
      dataType: 'percentage',
      required: true,
      examples: ['72', '85', '68'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'value_add_score',
      name: 'Value-Add Score',
      description: 'Progress from entry level to exit level (entry score to final score improvement %)',
      dataType: 'percentage',
      required: true,
      examples: ['25', '35', '18.5'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'grade_improvement_pct',
      name: 'Grade Improvement (%) from Previous Year',
      description: 'Percentage of students improving at least one grade level',
      dataType: 'percentage',
      required: false,
      examples: ['48', '52', '35'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'skill_certification_pct',
      name: 'Skill Certification Rate (%)',
      description: 'Percentage of eligible students certified in vocational/life skills',
      dataType: 'percentage',
      required: false,
      examples: ['65', '80', '55'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    }
  ],
  calculationFormula: '(studentsProficiencyPct * 0.35) + (valueAddScore * 0.4) + (skillCertificationPct * 0.25)',
  scoreRange: [0, 100],
  benchmarkValue: 72,
  dataSource: 'mixed',
  confidence: 80
};

/**
 * DIMENSION 4: Equity & Inclusion
 * Measures diversity, accessibility, and inclusive education practices
 */
export const DIMENSION_4_EQUITY: ObjectiveMetric = {
  dimensionId: 'd4_equity',
  dimensionName: 'Equity & Inclusion',
  description: 'Gender parity, SC/ST enrollment, special needs inclusion, accessibility measures',
  dataFields: [
    {
      id: 'girl_enrollment_pct',
      name: 'Girl Enrollment (%)',
      description: 'Percentage of girls enrolled in total student population',
      dataType: 'percentage',
      required: true,
      examples: ['48', '52', '45'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'scst_enrollment_pct',
      name: 'SC/ST Enrollment (%)',
      description: 'Percentage of SC/ST students vs district population',
      dataType: 'percentage',
      required: true,
      examples: ['25', '32', '18.5'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'special_needs_enrollment',
      name: 'Special Needs Students Enrolled',
      description: 'Number of students with special needs/disability enrolled',
      dataType: 'number',
      required: true,
      examples: ['12', '35', '5'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0 }
    },
    {
      id: 'accessibility_features_pct',
      name: 'Accessibility Features Implemented (%)',
      description: 'Percentage of CWSN accessibility features in place (ramps, accessible toilets, etc.)',
      dataType: 'percentage',
      required: false,
      examples: ['85', '100', '60'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    }
  ],
  calculationFormula: '(abs(girlEnrollmentPct - 50) / 50 * -100 + 100) * 0.3 + (scstEnrollmentPct * 0.3) + (specialNeedsEnrollment > 0 ? 100 : 0) * 0.2 + (accessibilityFeaturesPct * 0.2)',
  scoreRange: [0, 100],
  benchmarkValue: 75,
  dataSource: 'mixed',
  confidence: 90
};

/**
 * DIMENSION 5: Infrastructure & Facilities Quality
 * Measures physical infrastructure, safety, and resource availability
 */
export const DIMENSION_5_INFRASTRUCTURE: ObjectiveMetric = {
  dimensionId: 'd5_infrastructure',
  dimensionName: 'Infrastructure & Facilities Quality',
  description: 'Classrooms, labs, library, sports, sanitation, safety standards',
  dataFields: [
    {
      id: 'students_per_classroom',
      name: 'Students per Classroom',
      description: 'Average student-classroom ratio',
      dataType: 'number',
      required: true,
      examples: ['32', '28', '42'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 1, max: 100 }
    },
    {
      id: 'library_books_per_student',
      name: 'Library Books per Student',
      description: 'Total library collection divided by total students',
      dataType: 'number',
      required: false,
      examples: ['3.5', '2.1', '5.8'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0 }
    },
    {
      id: 'lab_equipment_status_pct',
      name: 'Lab Equipment Functional (%)',
      description: 'Percentage of science lab equipment in working condition',
      dataType: 'percentage',
      required: true,
      examples: ['92', '100', '75'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'toilet_availability_pct',
      name: 'Toilet Availability (%)',
      description: 'Percentage of students with access to functional toilets (1 per 50 students)',
      dataType: 'percentage',
      required: true,
      examples: ['100', '88', '95'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'sports_field_availability',
      name: 'Sports Field/Grounds Available',
      description: 'Whether adequate sports field exists (yes/no or square meters)',
      dataType: 'text',
      required: false,
      examples: ['Yes', '5000', 'No'],
      acceptedFormats: ['xlsx', 'csv']
    }
  ],
  calculationFormula: '(max(100 - (studentsPerClassroom / 40 * 100), 0)) * 0.3 + (libraryBooksPerStudent / 3 * 100 * 0.2) + (labEquipmentStatusPct * 0.25) + (toiletAvailabilityPct * 0.25)',
  scoreRange: [0, 100],
  benchmarkValue: 82,
  dataSource: 'mixed',
  confidence: 85
};

/**
 * DIMENSION 6: Student Wellbeing & Safety
 * Measures attendance, dropout rate, bullying incidents, health facilities
 */
export const DIMENSION_6_STUDENT_WELLBEING: ObjectiveMetric = {
  dimensionId: 'd6_student_wellbeing',
  dimensionName: 'Student Wellbeing & Safety',
  description: 'Attendance, dropout prevention, bullying incidents, health services, nutrition programs',
  dataFields: [
    {
      id: 'attendance_rate_pct',
      name: 'Average Attendance Rate (%)',
      description: 'Percentage of average daily attendance across all grades',
      dataType: 'percentage',
      required: true,
      examples: ['92', '88', '85'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'dropout_rate_pct',
      name: 'Dropout Rate (%)',
      description: 'Percentage of students who dropped out during the academic year',
      dataType: 'percentage',
      required: true,
      examples: ['2.5', '5', '0.8'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'bullying_incidents_per_month',
      name: 'Bullying/Harassment Incidents per Month',
      description: 'Average number of reported bullying/harassment incidents per month',
      dataType: 'number',
      required: false,
      examples: ['0', '2', '1.5'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0 }
    },
    {
      id: 'health_services_available',
      name: 'Health Services Available',
      description: 'Whether school has health clinic/nurse (yes/no)',
      dataType: 'text',
      required: false,
      examples: ['Yes', 'No', 'Part-time'],
      acceptedFormats: ['xlsx', 'csv']
    },
    {
      id: 'nutrition_program_coverage_pct',
      name: 'Nutrition Program Coverage (%)',
      description: 'Percentage of students covered by mid-day meal/nutrition program',
      dataType: 'percentage',
      required: false,
      examples: ['95', '100', '80'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    }
  ],
  calculationFormula: '(attendanceRatePct * 0.35) + (max(100 - dropoutRatePct * 20, 0) * 0.35) + (max(100 - bullyingIncidentsPerMonth * 10, 0) * 0.2) + (nutritionProgramCoveragePct * 0.1)',
  scoreRange: [0, 100],
  benchmarkValue: 80,
  dataSource: 'mixed',
  confidence: 88
};

/**
 * DIMENSION 7: Teacher Wellbeing & Retention
 * Measures teacher turnover, workload, professional satisfaction, career development
 */
export const DIMENSION_7_TEACHER_WELLBEING: ObjectiveMetric = {
  dimensionId: 'd7_teacher_wellbeing',
  dimensionName: 'Teacher Wellbeing & Retention',
  description: 'Teacher turnover, workload management, professional growth, job satisfaction',
  dataFields: [
    {
      id: 'teacher_turnover_pct',
      name: 'Teacher Turnover Rate (%)',
      description: 'Percentage of teachers who left in the past year',
      dataType: 'percentage',
      required: true,
      examples: ['5', '12', '2.5'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'avg_absent_days_per_teacher',
      name: 'Average Absent Days per Teacher per Year',
      description: 'Average number of absent days per teacher annually',
      dataType: 'number',
      required: true,
      examples: ['8', '15', '3'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 250 }
    },
    {
      id: 'teachers_in_professional_roles_pct',
      name: 'Teachers in Professional Roles (%)',
      description: 'Teachers who held positions like HoD, Mentor, Subject Coordinator',
      dataType: 'percentage',
      required: false,
      examples: ['45', '60', '30'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'teaching_load_hours_per_week',
      name: 'Teaching Load (hours/week)',
      description: 'Average teaching hours per teacher per week',
      dataType: 'number',
      required: false,
      examples: ['22', '28', '18'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 50 }
    }
  ],
  calculationFormula: '(max(100 - teacherTurnoverPct * 5, 0) * 0.35) + (max(100 - avgAbsentDaysPerTeacher / 25 * 100, 0) * 0.35) + (teachersInProfessionalRolesPct * 0.2) + (max(100 - abs(teachingLoadHoursPerWeek - 24) / 24 * 100, 0) * 0.1)',
  scoreRange: [0, 100],
  benchmarkValue: 75,
  dataSource: 'mixed',
  confidence: 85
};

/**
 * DIMENSION 8: Parent Engagement & Communication
 * Measures parent involvement, communication SLA, satisfaction levels
 */
export const DIMENSION_8_PARENT_ENGAGEMENT: ObjectiveMetric = {
  dimensionId: 'd8_parent_engagement',
  dimensionName: 'Parent Engagement & Communication',
  description: 'Parent involvement, communication response time, fee satisfaction, event participation',
  dataFields: [
    {
      id: 'parent_query_response_sla_hours',
      name: 'Parent Query Response SLA (hours)',
      description: 'Average time to respond to parent queries/complaints',
      dataType: 'number',
      required: true,
      examples: ['12', '24', '48'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 240 }
    },
    {
      id: 'parent_sla_compliance_pct',
      name: 'SLA Compliance Rate (%)',
      description: 'Percentage of parent queries resolved within SLA target',
      dataType: 'percentage',
      required: true,
      examples: ['88', '95', '72'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'fee_payment_rate_pct',
      name: 'Fee Payment Rate (%)',
      description: 'Percentage of fees collected against total dues',
      dataType: 'percentage',
      required: true,
      examples: ['92', '98', '85'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'parent_event_participation_pct',
      name: 'Parent Event Participation (%)',
      description: 'Percentage of parents attending school events/PTMs',
      dataType: 'percentage',
      required: false,
      examples: ['65', '80', '45'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    }
  ],
  calculationFormula: '(max(100 - parentQueryResponseSLAHours / 48 * 100, 0) * 0.3) + (parentSLAComplianceRatePct * 0.35) + (feePaymentRatePct * 0.2) + (parentEventParticipationPct * 0.15)',
  scoreRange: [0, 100],
  benchmarkValue: 78,
  dataSource: 'mixed',
  confidence: 85
};

/**
 * DIMENSION 9: Governance & Compliance
 * Measures regulatory compliance, governance structures, audit findings
 */
export const DIMENSION_9_GOVERNANCE: ObjectiveMetric = {
  dimensionId: 'd9_governance',
  dimensionName: 'Governance & Compliance',
  description: 'SQAAF compliance, regulatory adherence, governance structures, audit findings',
  dataFields: [
    {
      id: 'sqaaf_compliance_pct',
      name: 'SQAAF Compliance (%)',
      description: 'Percentage of SQAAF parameters met in last inspection',
      dataType: 'percentage',
      required: true,
      examples: ['92', '100', '88'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'audit_findings_resolved_pct',
      name: 'Audit Findings Resolved (%)',
      description: 'Percentage of previous audit findings that have been resolved',
      dataType: 'percentage',
      required: true,
      examples: ['85', '100', '65'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'governance_committee_meetings_per_year',
      name: 'Governance Committee Meetings per Year',
      description: 'Number of management committee/SMC meetings held annually',
      dataType: 'number',
      required: false,
      examples: ['12', '4', '6'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 52 }
    },
    {
      id: 'policy_documentation_complete_pct',
      name: 'Policy Documentation Complete (%)',
      description: 'Percentage of required policies documented and accessible',
      dataType: 'percentage',
      required: false,
      examples: ['95', '100', '80'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    }
  ],
  calculationFormula: '(sqaafCompliancePct * 0.4) + (auditFindingsResolvedPct * 0.35) + (min(governanceCommitteeMeetingsPerYear / 12 * 100, 100) * 0.15) + (policyDocumentationCompletePct * 0.1)',
  scoreRange: [0, 100],
  benchmarkValue: 85,
  dataSource: 'mixed',
  confidence: 88
};

/**
 * DIMENSION 10: Financial Health & Sustainability
 * Measures financial management, budget execution, reserve ratio, sustainability
 */
export const DIMENSION_10_FINANCIAL: ObjectiveMetric = {
  dimensionId: 'd10_financial',
  dimensionName: 'Financial Health & Sustainability',
  description: 'Budget management, fee collection, expense control, financial reserves',
  dataFields: [
    {
      id: 'budget_execution_pct',
      name: 'Budget Execution Rate (%)',
      description: 'Percentage of budgeted amount actually spent',
      dataType: 'percentage',
      required: true,
      examples: ['92', '100', '85'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 120 }
    },
    {
      id: 'fee_collection_rate_pct',
      name: 'Fee Collection Rate (%)',
      description: 'Percentage of fees collected vs. total expected fees',
      dataType: 'percentage',
      required: true,
      examples: ['95', '98', '88'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'reserves_ratio_months',
      name: 'Reserve Fund Ratio (months)',
      description: 'Months of operating expenses covered by reserves',
      dataType: 'number',
      required: true,
      examples: ['6', '12', '3'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 60 }
    },
    {
      id: 'expense_budget_variance_pct',
      name: 'Expense Budget Variance (%)',
      description: 'Actual expense variance from budgeted amount (abs value)',
      dataType: 'percentage',
      required: false,
      examples: ['5', '12', '2'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 50 }
    }
  ],
  calculationFormula: '(max(100 - abs(budgetExecutionPct - 95) * 2, 0) * 0.25) + (feeCollectionRatePct * 0.35) + (min(reservesRatioMonths / 6 * 100, 100) * 0.3) + (max(100 - expenseBudgetVariancePct * 5, 0) * 0.1)',
  scoreRange: [0, 100],
  benchmarkValue: 80,
  dataSource: 'mixed',
  confidence: 90
};

/**
 * DIMENSION 11: Innovation & Technology Integration
 * Measures digital adoption, technology infrastructure, online learning capabilities
 */
export const DIMENSION_11_TECHNOLOGY: ObjectiveMetric = {
  dimensionId: 'd11_technology',
  dimensionName: 'Innovation & Technology Integration',
  description: 'Digital classrooms, internet connectivity, learning management systems, tech adoption',
  dataFields: [
    {
      id: 'smart_classrooms_pct',
      name: 'Smart Classrooms (%)',
      description: 'Percentage of classrooms equipped with smart boards/projectors',
      dataType: 'percentage',
      required: true,
      examples: ['85', '100', '60'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'internet_bandwidth_mbps',
      name: 'Internet Bandwidth (Mbps)',
      description: 'School internet bandwidth capacity',
      dataType: 'number',
      required: true,
      examples: ['50', '100', '20'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 1000 }
    },
    {
      id: 'lms_usage_pct',
      name: 'LMS Active Users (%)',
      description: 'Percentage of teachers/students actively using learning management system',
      dataType: 'percentage',
      required: false,
      examples: ['72', '90', '45'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'device_to_student_ratio',
      name: 'Device to Student Ratio',
      description: 'Number of students per computing device available',
      dataType: 'number',
      required: false,
      examples: ['1.5', '2', '4'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0.5, max: 20 }
    }
  ],
  calculationFormula: '(smartClassroomsPct * 0.3) + (min(internetBandwidthMbps / 50 * 100, 100) * 0.25) + (lmsUsagePct * 0.25) + (max(100 - deviceToStudentRatio / 3 * 100, 0) * 0.2)',
  scoreRange: [0, 100],
  benchmarkValue: 72,
  dataSource: 'mixed',
  confidence: 80
};

/**
 * DIMENSION 12: Community Impact & Social Responsibility
 * Measures CSR initiatives, community engagement, social impact programs
 */
export const DIMENSION_12_COMMUNITY: ObjectiveMetric = {
  dimensionId: 'd12_community',
  dimensionName: 'Community Impact & Social Responsibility',
  description: 'CSR programs, community partnerships, social initiatives, environmental impact',
  dataFields: [
    {
      id: 'csr_programs_active',
      name: 'Active CSR Programs',
      description: 'Number of active corporate social responsibility programs',
      dataType: 'number',
      required: true,
      examples: ['5', '12', '2'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0 }
    },
    {
      id: 'community_engagement_events_per_year',
      name: 'Community Engagement Events per Year',
      description: 'Number of community engagement/awareness events conducted',
      dataType: 'number',
      required: true,
      examples: ['8', '15', '4'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0 }
    },
    {
      id: 'student_volunteer_hours',
      name: 'Student Volunteer Hours per Year',
      description: 'Total student volunteer hours in community service',
      dataType: 'number',
      required: false,
      examples: ['500', '1200', '200'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0 }
    },
    {
      id: 'environmental_compliance_pct',
      name: 'Environmental Compliance (%)',
      description: 'Percentage of environmental standards/initiatives implemented',
      dataType: 'percentage',
      required: false,
      examples: ['85', '100', '60'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    }
  ],
  calculationFormula: '(csrProgramsActive / 5 * 100 * 0.3) + (min(communityEngagementEventsPerYear / 8 * 100, 100) * 0.3) + (min(studentVolunteerHours / 500 * 100, 100) * 0.2) + (environmentalCompliancePct * 0.2)',
  scoreRange: [0, 100],
  benchmarkValue: 70,
  dataSource: 'mixed',
  confidence: 75
};

/**
 * DIMENSION 13: Digital Safety, Security & Data Privacy (DPDP Act 2023)
 * Measures DPDP compliance, data protection, cybersecurity measures
 */
export const DIMENSION_13_SECURITY: ObjectiveMetric = {
  dimensionId: 'd13_security',
  dimensionName: 'Digital Safety, Security & DPDP Compliance',
  description: 'DPDP Act compliance, data protection measures, cybersecurity, incident response',
  dataFields: [
    {
      id: 'dpdp_compliance_items_pct',
      name: 'DPDP Compliance Items Implemented (%)',
      description: 'Percentage of DPDP Act 2023 requirements implemented',
      dataType: 'percentage',
      required: true,
      examples: ['92', '100', '75'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'data_breach_incidents_last_year',
      name: 'Data Breach Incidents (Last Year)',
      description: 'Number of documented data security incidents',
      dataType: 'number',
      required: true,
      examples: ['0', '1', '2'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0 }
    },
    {
      id: 'security_audit_score_pct',
      name: 'Security Audit Score (%)',
      description: 'Latest security audit overall score',
      dataType: 'percentage',
      required: false,
      examples: ['88', '95', '72'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'incident_response_time_hours',
      name: 'Incident Response Time (hours)',
      description: 'Average time to respond to security incidents',
      dataType: 'number',
      required: false,
      examples: ['2', '4', '8'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 48 }
    }
  ],
  calculationFormula: '(dpdpComplianceItemsPct * 0.4) + (max(100 - dataBreachIncidentsLastYear * 20, 0) * 0.35) + (securityAuditScorePct * 0.15) + (max(100 - incidentResponseTimeHours / 8 * 100, 0) * 0.1)',
  scoreRange: [0, 100],
  benchmarkValue: 80,
  dataSource: 'mixed',
  confidence: 85
};

/**
 * DIMENSION 14: School Reputation & Brand Perception
 * Measures brand perception, satisfaction, online presence, student placement
 */
export const DIMENSION_14_REPUTATION: ObjectiveMetric = {
  dimensionId: 'd14_reputation',
  dimensionName: 'School Reputation & Brand Perception',
  description: 'Parent satisfaction, student placement, online reviews, brand perception, alumni success',
  dataFields: [
    {
      id: 'parent_nps_score',
      name: 'Parent NPS Score (0-100)',
      description: 'Net Promoter Score from parent satisfaction survey',
      dataType: 'number',
      required: true,
      examples: ['65', '78', '45'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: -100, max: 100 }
    },
    {
      id: 'student_satisfaction_pct',
      name: 'Student Satisfaction (%)',
      description: 'Percentage of students reporting satisfaction with school',
      dataType: 'percentage',
      required: true,
      examples: ['82', '90', '70'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'higher_education_placement_pct',
      name: 'Higher Education Placement (%)',
      description: 'Percentage of graduates pursuing higher education',
      dataType: 'percentage',
      required: false,
      examples: ['85', '95', '60'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 100 }
    },
    {
      id: 'online_review_rating_out_of_5',
      name: 'Average Online Review Rating (0-5)',
      description: 'Average rating across Google, Facebook, other review platforms',
      dataType: 'number',
      required: false,
      examples: ['4.2', '4.5', '3.8'],
      acceptedFormats: ['xlsx', 'csv'],
      validationRules: { min: 0, max: 5 }
    }
  ],
  calculationFormula: '(max(parentNPSScore, 0) / 100 * 100 * 0.3) + (studentSatisfactionPct * 0.35) + (higherEducationPlacementPct * 0.2) + (onlineReviewRatingOutOf5 / 5 * 100 * 0.15)',
  scoreRange: [0, 100],
  benchmarkValue: 75,
  dataSource: 'mixed',
  confidence: 80
};

/**
 * All 14 Dimensions in one array for easy iteration
 */
export const ALL_14_DIMENSIONS: ObjectiveMetric[] = [
  DIMENSION_1_ACADEMIC,
  DIMENSION_2_TEACHING,
  DIMENSION_3_LEARNING_OUTCOMES,
  DIMENSION_4_EQUITY,
  DIMENSION_5_INFRASTRUCTURE,
  DIMENSION_6_STUDENT_WELLBEING,
  DIMENSION_7_TEACHER_WELLBEING,
  DIMENSION_8_PARENT_ENGAGEMENT,
  DIMENSION_9_GOVERNANCE,
  DIMENSION_10_FINANCIAL,
  DIMENSION_11_TECHNOLOGY,
  DIMENSION_12_COMMUNITY,
  DIMENSION_13_SECURITY,
  DIMENSION_14_REPUTATION
];

/**
 * Calculate objective score for a dimension given raw data inputs
 */
export function calculateObjectiveScore(
  dimensionMetric: ObjectiveMetric,
  dataInputs: Record<string, number | string | boolean>
): number {
  try {
    // Convert all inputs to appropriate types
    const inputs: Record<string, number> = {};
    Object.entries(dataInputs).forEach(([key, value]) => {
      inputs[key] = typeof value === 'number' ? value : 0;
    });

    // Execute calculation formula
    // Replace field names with actual values in formula
    let formula = dimensionMetric.calculationFormula;
    Object.entries(inputs).forEach(([key, value]) => {
      // Convert camelCase to camelCase variable names for eval
      formula = formula.replace(new RegExp(`\\b${key}\\b`, 'g'), String(value));
    });

    // Safe evaluation (in production, use expression parser)
    const result = eval(formula);
    return Math.max(0, Math.min(100, Math.round(result * 100) / 100));
  } catch (error) {
    console.error(`Error calculating score for ${dimensionMetric.dimensionName}:`, error);
    return 0;
  }
}

/**
 * Compare subjective vs objective scores and determine alignment
 */
export function compareSubjectiveVsObjective(
  subjectiveScore: number,
  objectiveScore: number,
  dimensionName: string
): SubjectiveVsObjective {
  const gap = subjectiveScore - objectiveScore;
  let alignment: 'aligned' | 'overestimated' | 'underestimated';
  let interpretation: string;

  if (Math.abs(gap) <= 5) {
    alignment = 'aligned';
    interpretation = `Leadership perception aligns with operational data. Both assessment methods indicate ${
      subjectiveScore >= 70 ? 'strong' : 'moderate'
    } performance in ${dimensionName}.`;
  } else if (gap > 5) {
    alignment = 'overestimated';
    interpretation = `Leadership perceives higher performance (+${gap.toFixed(
      1
    )} points) than operational data shows. This may indicate optimism bias or data collection gaps.`;
  } else {
    alignment = 'underestimated';
    interpretation = `Leadership underestimates performance (${gap.toFixed(
      1
    )} points lower). Operational data shows hidden strengths in ${dimensionName}.`;
  }

  return {
    dimensionId: dimensionName.toLowerCase().replace(/ /g, '_'),
    dimensionName,
    subjectiveScore,
    objectiveScore,
    gap,
    alignment,
    interpretation,
    confidence: Math.min(subjectiveScore, objectiveScore) > 50 ? 85 : 65
  };
}

export default {
  ALL_14_DIMENSIONS,
  calculateObjectiveScore,
  compareSubjectiveVsObjective
};

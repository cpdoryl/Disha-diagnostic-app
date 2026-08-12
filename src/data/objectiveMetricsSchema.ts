/**
 * Objective Metrics Schema
 *
 * Defines the raw operational data an admin can supply for each of the 14
 * live assessment dimensions (see `FOURTEEN_DIMENSIONS` in
 * `14DimensionsQuestions.ts`), so a dimension can be scored from actual
 * school data independently of the subjective stakeholder surveys.
 *
 * Benchmark values here are illustrative sector-reasonable defaults, not
 * sourced from an external national dataset - they're meant to be tuned
 * later, not treated as authoritative targets.
 */
import { BenchmarkDatasetMeta } from './benchmarkMeta';

/**
 * Honest disclosure of what the `benchmark` value on each metric below
 * actually is. Update `version`/`lastUpdated` whenever these targets are
 * revised.
 */
export const OBJECTIVE_BENCHMARK_DATASET_META: BenchmarkDatasetMeta = {
  version: 'v1.0',
  methodology:
    'Illustrative sector-reasonable operational targets per metric, set by the DISHA team - not yet sourced from an external national dataset. Intended for recalibration once real cross-school operational data accumulates on this platform.',
  lastUpdated: '2026-08-12',
};

export type ObjectiveMetricDataType =
  | 'percentage'
  | 'count'
  | 'currency'
  | 'ratio'
  | 'score0to100'
  | 'hours'
  | 'years';

export type ObjectiveMetricDirection = 'higher_better' | 'lower_better';

export interface ObjectiveMetricDefinition {
  id: string;
  label: string;
  dataType: ObjectiveMetricDataType;
  unit: string;
  required: boolean;
  benchmark: number;
  direction: ObjectiveMetricDirection;
  min: number;
  max: number;
  description?: string;
}

export interface DimensionObjectiveMetricSchema {
  dimensionId: string;
  metrics: ObjectiveMetricDefinition[];
}

export const OBJECTIVE_METRICS_SCHEMA: DimensionObjectiveMetricSchema[] = [
  {
    dimensionId: 'leadership',
    metrics: [
      { id: 'principal_tenure_years', label: 'Principal/Head Tenure', dataType: 'years', unit: 'yrs', required: true, benchmark: 5, direction: 'higher_better', min: 0, max: 40, description: 'Years the current head has led the school' },
      { id: 'board_meeting_frequency', label: 'Governing Board Meeting Frequency', dataType: 'count', unit: '/yr', required: true, benchmark: 4, direction: 'higher_better', min: 0, max: 24 },
      { id: 'policy_documentation_score', label: 'Policy Documentation Completeness', dataType: 'score0to100', unit: '/100', required: true, benchmark: 90, direction: 'higher_better', min: 0, max: 100, description: 'Coverage of written, approved school policies' },
      { id: 'decision_implementation_rate', label: 'Strategic Decision Implementation Rate', dataType: 'percentage', unit: '%', required: false, benchmark: 75, direction: 'higher_better', min: 0, max: 100 },
      { id: 'leadership_audit_compliance', label: 'Leadership/Governance Audit Compliance', dataType: 'percentage', unit: '%', required: false, benchmark: 90, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'academic',
    metrics: [
      { id: 'board_exam_pass_rate', label: 'Board Exam Pass Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 90, direction: 'higher_better', min: 0, max: 100 },
      { id: 'average_result_percentage', label: 'Average Result Percentage', dataType: 'percentage', unit: '%', required: true, benchmark: 75, direction: 'higher_better', min: 0, max: 100 },
      { id: 'distinction_rate', label: 'Distinction Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 25, direction: 'higher_better', min: 0, max: 100, description: 'Share of students scoring distinction-level marks' },
      { id: 'remedial_support_coverage', label: 'Remedial Support Coverage', dataType: 'percentage', unit: '%', required: false, benchmark: 80, direction: 'higher_better', min: 0, max: 100 },
      { id: 'subject_topper_count', label: 'Subject/Board Toppers', dataType: 'count', unit: 'students', required: false, benchmark: 5, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'infrastructure',
    metrics: [
      { id: 'student_classroom_ratio', label: 'Students per Classroom', dataType: 'ratio', unit: 'students/room', required: true, benchmark: 30, direction: 'lower_better', min: 1, max: 100 },
      { id: 'computer_student_ratio', label: 'Students per Computer', dataType: 'ratio', unit: 'students/computer', required: true, benchmark: 5, direction: 'lower_better', min: 1, max: 200 },
      { id: 'lab_infrastructure_score', label: 'Lab Infrastructure Score', dataType: 'score0to100', unit: '/100', required: true, benchmark: 85, direction: 'higher_better', min: 0, max: 100 },
      { id: 'library_books_per_student', label: 'Library Books per Student', dataType: 'ratio', unit: 'books/student', required: false, benchmark: 10, direction: 'higher_better', min: 0, max: 100 },
      { id: 'infrastructure_safety_audit_score', label: 'Infrastructure Safety Audit Score', dataType: 'score0to100', unit: '/100', required: false, benchmark: 95, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'student_wellbeing',
    metrics: [
      { id: 'student_attendance_rate', label: 'Student Attendance Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 92, direction: 'higher_better', min: 0, max: 100 },
      { id: 'counselor_student_ratio', label: 'Students per Counselor', dataType: 'ratio', unit: 'students/counselor', required: true, benchmark: 500, direction: 'lower_better', min: 1, max: 5000 },
      { id: 'health_checkup_frequency', label: 'Health Checkup Frequency', dataType: 'count', unit: '/yr', required: true, benchmark: 2, direction: 'higher_better', min: 0, max: 12 },
      { id: 'dropout_rate', label: 'Student Dropout Rate', dataType: 'percentage', unit: '%', required: false, benchmark: 2, direction: 'lower_better', min: 0, max: 100 },
      { id: 'bullying_incident_rate', label: 'Bullying/Safety Incident Rate', dataType: 'count', unit: '/1000 students/yr', required: false, benchmark: 5, direction: 'lower_better', min: 0, max: 200 },
    ],
  },
  {
    dimensionId: 'staff_development',
    metrics: [
      { id: 'teacher_attrition_rate', label: 'Teacher Attrition Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 8, direction: 'lower_better', min: 0, max: 100 },
      { id: 'avg_annual_training_hours', label: 'Avg Annual Training Hours per Teacher', dataType: 'hours', unit: 'hrs/yr', required: true, benchmark: 20, direction: 'higher_better', min: 0, max: 500 },
      { id: 'certified_teachers_percentage', label: 'Certified Teachers', dataType: 'percentage', unit: '%', required: true, benchmark: 95, direction: 'higher_better', min: 0, max: 100 },
      { id: 'postgraduate_teachers_percentage', label: 'Postgraduate-Qualified Teachers', dataType: 'percentage', unit: '%', required: false, benchmark: 50, direction: 'higher_better', min: 0, max: 100 },
      { id: 'staff_satisfaction_index', label: 'Staff Satisfaction Index', dataType: 'score0to100', unit: '/100', required: false, benchmark: 75, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'community',
    metrics: [
      { id: 'pta_meeting_frequency', label: 'PTA Meeting Frequency', dataType: 'count', unit: '/yr', required: true, benchmark: 4, direction: 'higher_better', min: 0, max: 24 },
      { id: 'parent_participation_rate', label: 'Parent Participation Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 70, direction: 'higher_better', min: 0, max: 100 },
      { id: 'parent_query_response_time_hours', label: 'Parent Query Response Time', dataType: 'hours', unit: 'hrs', required: true, benchmark: 24, direction: 'lower_better', min: 0, max: 720 },
      { id: 'community_outreach_events', label: 'Community Outreach Events', dataType: 'count', unit: '/yr', required: false, benchmark: 4, direction: 'higher_better', min: 0, max: 100 },
      { id: 'parent_satisfaction_nps', label: 'Parent Satisfaction (NPS-style)', dataType: 'score0to100', unit: '/100', required: false, benchmark: 60, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'innovation',
    metrics: [
      { id: 'smart_classroom_coverage', label: 'Smart Classroom Coverage', dataType: 'percentage', unit: '%', required: true, benchmark: 80, direction: 'higher_better', min: 0, max: 100 },
      { id: 'digital_content_usage_hours', label: 'Digital Content Usage', dataType: 'hours', unit: 'hrs/week', required: true, benchmark: 5, direction: 'higher_better', min: 0, max: 40 },
      { id: 'edtech_tool_adoption_rate', label: 'EdTech Tool Adoption Rate', dataType: 'percentage', unit: '%', required: false, benchmark: 70, direction: 'higher_better', min: 0, max: 100 },
      { id: 'coding_stem_program_coverage', label: 'Coding/STEM Program Coverage', dataType: 'percentage', unit: '%', required: false, benchmark: 50, direction: 'higher_better', min: 0, max: 100 },
      { id: 'it_budget_per_student', label: 'IT Budget per Student', dataType: 'currency', unit: '₹/yr', required: false, benchmark: 3000, direction: 'higher_better', min: 0, max: 100000 },
    ],
  },
  {
    dimensionId: 'finance',
    metrics: [
      { id: 'fee_collection_rate', label: 'Fee Collection Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 95, direction: 'higher_better', min: 0, max: 100 },
      { id: 'operating_expense_ratio', label: 'Operating Expense Ratio', dataType: 'percentage', unit: '%', required: true, benchmark: 80, direction: 'lower_better', min: 0, max: 200, description: 'Operating expenses as a % of revenue' },
      { id: 'budget_utilization_rate', label: 'Budget Utilization Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 90, direction: 'higher_better', min: 0, max: 150 },
      { id: 'audit_compliance_score', label: 'Financial Audit Compliance Score', dataType: 'score0to100', unit: '/100', required: false, benchmark: 95, direction: 'higher_better', min: 0, max: 100 },
      { id: 'scholarship_financial_aid_coverage', label: 'Scholarship/Financial Aid Coverage', dataType: 'percentage', unit: '%', required: false, benchmark: 10, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'quality',
    metrics: [
      { id: 'regulatory_compliance_score', label: 'Regulatory Compliance Score', dataType: 'percentage', unit: '%', required: true, benchmark: 100, direction: 'higher_better', min: 0, max: 100 },
      { id: 'accreditation_status_score', label: 'Accreditation Status Score', dataType: 'score0to100', unit: '/100', required: true, benchmark: 80, direction: 'higher_better', min: 0, max: 100, description: 'NAAC/ISO/board-recognition strength' },
      { id: 'internal_audit_frequency', label: 'Internal Quality Audit Frequency', dataType: 'count', unit: '/yr', required: true, benchmark: 2, direction: 'higher_better', min: 0, max: 12 },
      { id: 'grievance_resolution_time_days', label: 'Grievance Resolution Time', dataType: 'count', unit: 'days', required: false, benchmark: 7, direction: 'lower_better', min: 0, max: 90 },
      { id: 'external_certification_count', label: 'External Certifications Held', dataType: 'count', unit: 'certs', required: false, benchmark: 1, direction: 'higher_better', min: 0, max: 10 },
    ],
  },
  {
    dimensionId: 'inclusivity',
    metrics: [
      { id: 'disadvantaged_student_enrollment_pct', label: 'Disadvantaged Student Enrollment', dataType: 'percentage', unit: '%', required: true, benchmark: 25, direction: 'higher_better', min: 0, max: 100 },
      { id: 'special_needs_support_ratio', label: 'CWSN Students per Special Educator', dataType: 'ratio', unit: 'students/educator', required: true, benchmark: 20, direction: 'lower_better', min: 1, max: 500 },
      { id: 'gender_ratio_balance', label: 'Gender Ratio Balance', dataType: 'percentage', unit: '%', required: false, benchmark: 90, direction: 'higher_better', min: 0, max: 100, description: 'How close the student body is to an even gender split' },
      { id: 'scholarship_disadvantaged_coverage', label: 'Scholarship Coverage for Disadvantaged Students', dataType: 'percentage', unit: '%', required: false, benchmark: 100, direction: 'higher_better', min: 0, max: 100 },
      { id: 'accessibility_infrastructure_score', label: 'Accessibility Infrastructure Score', dataType: 'score0to100', unit: '/100', required: false, benchmark: 80, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'curriculum',
    metrics: [
      { id: 'curriculum_coverage_rate', label: 'Curriculum Coverage Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 95, direction: 'higher_better', min: 0, max: 100 },
      { id: 'learning_outcome_achievement_rate', label: 'Learning Outcome Achievement Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 80, direction: 'higher_better', min: 0, max: 100 },
      { id: 'project_based_learning_hours', label: 'Project-Based Learning Hours', dataType: 'hours', unit: 'hrs/month/student', required: false, benchmark: 8, direction: 'higher_better', min: 0, max: 100 },
      { id: 'continuous_assessment_frequency', label: 'Continuous Assessment Frequency', dataType: 'count', unit: '/term', required: false, benchmark: 3, direction: 'higher_better', min: 0, max: 20 },
      { id: 'cocurricular_curriculum_integration_pct', label: 'Co-curricular Integration', dataType: 'percentage', unit: '%', required: false, benchmark: 20, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'satisfaction',
    metrics: [
      { id: 'parent_satisfaction_score', label: 'Parent Satisfaction Score', dataType: 'score0to100', unit: '/100', required: true, benchmark: 75, direction: 'higher_better', min: 0, max: 100 },
      { id: 'student_retention_rate', label: 'Student Retention Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 92, direction: 'higher_better', min: 0, max: 100 },
      { id: 'net_promoter_score', label: 'Net Promoter Score', dataType: 'score0to100', unit: '/100', required: false, benchmark: 60, direction: 'higher_better', min: 0, max: 100 },
      { id: 'admission_enquiry_conversion_rate', label: 'Admission Enquiry Conversion Rate', dataType: 'percentage', unit: '%', required: false, benchmark: 40, direction: 'higher_better', min: 0, max: 100 },
      { id: 'alumni_tracking_coverage', label: 'Alumni Tracking Coverage', dataType: 'percentage', unit: '%', required: false, benchmark: 50, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'performance',
    metrics: [
      { id: 'staff_appraisal_completion_rate', label: 'Staff Appraisal Completion Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 100, direction: 'higher_better', min: 0, max: 100 },
      { id: 'performance_linked_recognition_count', label: 'Performance-Linked Recognitions', dataType: 'count', unit: '/yr', required: true, benchmark: 10, direction: 'higher_better', min: 0, max: 500 },
      { id: 'accountability_action_closure_rate', label: 'Accountability Action Closure Rate', dataType: 'percentage', unit: '%', required: false, benchmark: 85, direction: 'higher_better', min: 0, max: 100 },
      { id: 'kpi_tracking_coverage', label: 'KPI Tracking Coverage', dataType: 'percentage', unit: '%', required: false, benchmark: 100, direction: 'higher_better', min: 0, max: 100 },
      { id: 'disciplinary_case_resolution_time_days', label: 'Disciplinary Case Resolution Time', dataType: 'count', unit: 'days', required: false, benchmark: 14, direction: 'lower_better', min: 0, max: 180 },
    ],
  },
  {
    dimensionId: 'culture',
    metrics: [
      { id: 'employee_engagement_score', label: 'Employee Engagement Score', dataType: 'score0to100', unit: '/100', required: true, benchmark: 75, direction: 'higher_better', min: 0, max: 100 },
      { id: 'values_training_coverage', label: 'Values/Culture Training Coverage', dataType: 'percentage', unit: '%', required: true, benchmark: 100, direction: 'higher_better', min: 0, max: 100 },
      { id: 'internal_collaboration_events', label: 'Internal Collaboration Events', dataType: 'count', unit: '/yr', required: false, benchmark: 6, direction: 'higher_better', min: 0, max: 100 },
      { id: 'conflict_grievance_rate', label: 'Staff Conflict/Grievance Rate', dataType: 'count', unit: '/100 staff/yr', required: false, benchmark: 5, direction: 'lower_better', min: 0, max: 100 },
      { id: 'staff_recognition_program_score', label: 'Staff Recognition Program Score', dataType: 'score0to100', unit: '/100', required: false, benchmark: 70, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
];

export function getDimensionMetricSchema(dimensionId: string): DimensionObjectiveMetricSchema | undefined {
  return OBJECTIVE_METRICS_SCHEMA.find((d) => d.dimensionId === dimensionId);
}

export function getMetricDefinition(dimensionId: string, metricId: string): ObjectiveMetricDefinition | undefined {
  return getDimensionMetricSchema(dimensionId)?.metrics.find((m) => m.id === metricId);
}

export function getAllMetricIds(): string[] {
  return OBJECTIVE_METRICS_SCHEMA.flatMap((d) => d.metrics.map((m) => m.id));
}

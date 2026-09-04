/**
 * Objective Metrics Schema
 *
 * Defines the raw operational data an admin can supply for each of the 14
 * live assessment dimensions (see `FOURTEEN_DIMENSIONS` in
 * `14DimensionsQuestions.ts`), so a dimension can be scored from actual
 * school data independently of the subjective stakeholder surveys.
 *
 * Every metric `id` here equals the reality-metric id in
 * `14DimensionsQuestions.ts` (e.g. '1a') and the id of its 1:1-linked
 * perception question - the framework's whole design is metric-linked, so
 * the three stay traceable to each other through one shared id.
 *
 * PROVISIONAL BENCHMARKS: the source document (School Diagnostic Framework
 * v2) specifies an exact formula, raw data source, and fallback for every
 * metric, but deliberately gives no numeric benchmark/target - that was a
 * scope decision made when wiring this schema up, not an oversight. Every
 * `benchmark` value below is a reasonable illustrative default (informed by
 * common CBSE/Indian-school norms where applicable), not a validated target
 * from the source document or an external dataset. Treat these as a
 * starting point to be reviewed and tuned by an actual school/board data
 * owner, not as authoritative.
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

/**
 * How a metric value was captured. Lives here (a pure data file with no
 * Firestore dependency) rather than in objectiveDataService.ts, since both
 * objectiveDataService.ts and objectiveScoreEngine.ts need it and importing
 * it from either of those into the other would create a circular import.
 */
export type ObjectiveDataSource = 'manual' | 'upload';

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
    dimensionId: 'academic_performance',
    metrics: [
      { id: '1a', label: 'Board Exam Pass Rate (by subject/section)', dataType: 'percentage', unit: '%', required: true, benchmark: 85, direction: 'higher_better', min: 0, max: 100, description: 'Pass % = (Students passed ÷ Students appeared) × 100' },
      { id: '1b', label: 'Internal Formative Assessment Average', dataType: 'score0to100', unit: '/100', required: true, benchmark: 70, direction: 'higher_better', min: 0, max: 100, description: "Sum of students' formative scores ÷ number assessed" },
      { id: '1c', label: '% Students Below Grade-Level Benchmark', dataType: 'percentage', unit: '%', required: true, benchmark: 15, direction: 'lower_better', min: 0, max: 100, description: 'Students below diagnostic cutoff ÷ total tested × 100' },
      { id: '1d', label: 'Year-on-Year Value-Added Growth per Student', dataType: 'count', unit: 'pts/yr', required: false, benchmark: 5, direction: 'higher_better', min: -30, max: 60, description: 'Current-year score − previous-year score, averaged' },
      { id: '1e', label: 'Subject/Topic Item Analysis — Avg % Incorrect (weakest topics)', dataType: 'percentage', unit: '%', required: false, benchmark: 30, direction: 'lower_better', min: 0, max: 100 },
      { id: '1f', label: 'Homework/Assignment Completion Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 85, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'curriculum_pedagogy',
    metrics: [
      { id: '2a', label: "% Lessons Rated 'Effective' on Shared Rubric", dataType: 'percentage', unit: '%', required: true, benchmark: 80, direction: 'higher_better', min: 0, max: 100 },
      { id: '2b', label: 'CPD Hours per Teacher per Year', dataType: 'hours', unit: 'hrs/yr', required: true, benchmark: 20, direction: 'higher_better', min: 0, max: 300 },
      { id: '2c', label: 'Ratio of Activity-Based to Lecture-Based Sessions', dataType: 'ratio', unit: ':1', required: false, benchmark: 1, direction: 'higher_better', min: 0, max: 10 },
      { id: '2d', label: 'Curriculum Pacing Adherence', dataType: 'percentage', unit: '%', required: true, benchmark: 90, direction: 'higher_better', min: 0, max: 100 },
      { id: '2e', label: 'Project-Based Learning Instances per Term/Grade', dataType: 'count', unit: '/term/grade', required: false, benchmark: 2, direction: 'higher_better', min: 0, max: 30 },
    ],
  },
  {
    dimensionId: 'teacher_quality',
    metrics: [
      { id: '3a', label: 'Annual Teacher Attrition Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 10, direction: 'lower_better', min: 0, max: 100 },
      { id: '3b', label: 'Average Teacher Tenure', dataType: 'years', unit: 'yrs', required: true, benchmark: 5, direction: 'higher_better', min: 0, max: 40 },
      { id: '3c', label: '% Teachers with Required Qualifications', dataType: 'percentage', unit: '%', required: true, benchmark: 100, direction: 'higher_better', min: 0, max: 100 },
      { id: '3d', label: 'Teacher Absenteeism Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 5, direction: 'lower_better', min: 0, max: 100 },
      { id: '3e', label: 'Teacher:Student Ratio', dataType: 'ratio', unit: 'students/teacher', required: true, benchmark: 25, direction: 'lower_better', min: 1, max: 100 },
      { id: '3f', label: 'Substitute-Teacher Dependency Rate', dataType: 'percentage', unit: '%', required: false, benchmark: 5, direction: 'lower_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'student_wellbeing',
    metrics: [
      { id: '4a', label: 'Counsellor Avg. Sessions per Month', dataType: 'count', unit: '/mo', required: false, benchmark: 20, direction: 'higher_better', min: 0, max: 300 },
      { id: '4b', label: 'Bullying/Harassment Incident Resolution Time', dataType: 'count', unit: 'days', required: false, benchmark: 3, direction: 'lower_better', min: 0, max: 60 },
      { id: '4c', label: 'Absenteeism Linked to Stress', dataType: 'percentage', unit: '%', required: false, benchmark: 5, direction: 'lower_better', min: 0, max: 100 },
      { id: '4d', label: 'SEL Program Participation Rate', dataType: 'percentage', unit: '%', required: false, benchmark: 80, direction: 'higher_better', min: 0, max: 100 },
      { id: '4e', label: 'Anonymous Wellbeing Pulse-Survey Completion Rate', dataType: 'percentage', unit: '%', required: false, benchmark: 70, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'student_discipline',
    metrics: [
      { id: '5a', label: 'Disciplinary Incidents (count, per term)', dataType: 'count', unit: '/term', required: false, benchmark: 10, direction: 'lower_better', min: 0, max: 1000 },
      { id: '5b', label: 'Repeat-Offender Rate', dataType: 'percentage', unit: '%', required: false, benchmark: 20, direction: 'lower_better', min: 0, max: 100 },
      { id: '5c', label: 'Suspension/Expulsion Count', dataType: 'count', unit: '/yr', required: false, benchmark: 2, direction: 'lower_better', min: 0, max: 200 },
      { id: '5d', label: 'Average Time-to-Resolution for Incidents', dataType: 'count', unit: 'days', required: true, benchmark: 3, direction: 'lower_better', min: 0, max: 60 },
      { id: '5e', label: 'Consistency-of-Enforcement Audit Score', dataType: 'score0to100', unit: '/100', required: false, benchmark: 80, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'infrastructure_facilities',
    metrics: [
      { id: '6a', label: 'Facility Condition Audit Score', dataType: 'score0to100', unit: '/5', required: true, benchmark: 4, direction: 'higher_better', min: 1, max: 5 },
      { id: '6b', label: 'Maintenance Ticket Resolution Time', dataType: 'count', unit: 'days', required: true, benchmark: 3, direction: 'lower_better', min: 0, max: 60 },
      { id: '6c', label: 'Lab/Library Utilization Hours per Week', dataType: 'hours', unit: 'hrs/wk', required: false, benchmark: 20, direction: 'higher_better', min: 0, max: 100 },
      { id: '6d', label: 'Student:Facility Ratio (toilets/water points) vs. CBSE Norm', dataType: 'ratio', unit: 'students/unit', required: true, benchmark: 40, direction: 'lower_better', min: 1, max: 500 },
      { id: '6e', label: 'IT Device:Student Ratio', dataType: 'ratio', unit: 'students/device', required: true, benchmark: 5, direction: 'lower_better', min: 0, max: 100, description: 'Internet uptime % tracked alongside this metric operationally' },
    ],
  },
  {
    dimensionId: 'safety_security',
    metrics: [
      { id: '7a', label: 'Safety-Drill Compliance %', dataType: 'percentage', unit: '%', required: true, benchmark: 100, direction: 'higher_better', min: 0, max: 100 },
      { id: '7b', label: 'CCTV Coverage % of Campus', dataType: 'percentage', unit: '%', required: true, benchmark: 90, direction: 'higher_better', min: 0, max: 100 },
      { id: '7c', label: 'Transport Safety Incident Count', dataType: 'count', unit: '/yr', required: false, benchmark: 0, direction: 'lower_better', min: 0, max: 100 },
      { id: '7d', label: 'Security-Staff:Student Ratio', dataType: 'ratio', unit: 'students/staff', required: false, benchmark: 300, direction: 'lower_better', min: 1, max: 5000 },
      { id: '7e', label: 'Background-Check Completion Rate (staff/vendors)', dataType: 'percentage', unit: '%', required: true, benchmark: 100, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'parent_engagement',
    metrics: [
      { id: '8a', label: 'PTM Attendance Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 80, direction: 'higher_better', min: 0, max: 100 },
      { id: '8b', label: 'Parent-Portal/App Active Engagement Rate', dataType: 'percentage', unit: '%', required: false, benchmark: 60, direction: 'higher_better', min: 0, max: 100 },
      { id: '8c', label: 'Grievance Resolution Time', dataType: 'count', unit: 'days', required: true, benchmark: 7, direction: 'lower_better', min: 0, max: 90 },
      { id: '8d', label: 'Parent-Committee Participation Rate', dataType: 'percentage', unit: '%', required: false, benchmark: 50, direction: 'higher_better', min: 0, max: 100 },
      { id: '8e', label: 'Fee-Payment Delinquency Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 5, direction: 'lower_better', min: 0, max: 100 },
      { id: '8f', label: 'Re-Enrollment/Renewal Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 90, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'student_engagement',
    metrics: [
      { id: '9a', label: '% Students in ≥1 Extracurricular Activity', dataType: 'percentage', unit: '%', required: true, benchmark: 80, direction: 'higher_better', min: 0, max: 100 },
      { id: '9b', label: 'Overall Attendance Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 92, direction: 'higher_better', min: 0, max: 100 },
      { id: '9c', label: 'Student Council Activity Frequency', dataType: 'count', unit: '/term', required: false, benchmark: 4, direction: 'higher_better', min: 0, max: 50 },
      { id: '9d', label: 'Inter-House/Inter-School Competition Participation Breadth', dataType: 'percentage', unit: '%', required: false, benchmark: 50, direction: 'higher_better', min: 0, max: 100 },
      { id: '9e', label: 'Library Book-Issue Rate per Student', dataType: 'ratio', unit: 'books/student/yr', required: false, benchmark: 5, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'leadership_governance',
    metrics: [
      { id: '10a', label: 'SMC Meeting Quorum Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 100, direction: 'higher_better', min: 0, max: 100 },
      { id: '10b', label: 'Policy Review/Update Frequency', dataType: 'percentage', unit: '% of policies reviewed/yr', required: false, benchmark: 100, direction: 'higher_better', min: 0, max: 100 },
      { id: '10c', label: 'Leadership-Role Turnover Rate', dataType: 'percentage', unit: '%', required: false, benchmark: 10, direction: 'lower_better', min: 0, max: 100 },
      { id: '10d', label: 'Decision-Implementation Lag Time', dataType: 'count', unit: 'days', required: false, benchmark: 30, direction: 'lower_better', min: 0, max: 365 },
      { id: '10e', label: 'Audit/Compliance Finding Closure Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 100, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'financial_health',
    metrics: [
      { id: '11a', label: 'Fee Collection Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 95, direction: 'higher_better', min: 0, max: 100 },
      { id: '11b', label: 'Operating Margin (trended)', dataType: 'percentage', unit: '%', required: true, benchmark: 10, direction: 'higher_better', min: -50, max: 100 },
      { id: '11c', label: 'Cost-per-Student Trend', dataType: 'currency', unit: '₹/student/yr', required: false, benchmark: 50000, direction: 'lower_better', min: 0, max: 5000000 },
      { id: '11d', label: 'Reserve-Fund-to-Operating-Cost Ratio', dataType: 'ratio', unit: 'months covered', required: false, benchmark: 3, direction: 'higher_better', min: 0, max: 24 },
      { id: '11e', label: 'Scholarship Disbursement vs. Budget', dataType: 'percentage', unit: '%', required: false, benchmark: 100, direction: 'higher_better', min: 0, max: 150 },
    ],
  },
  {
    dimensionId: 'admissions_market',
    metrics: [
      { id: '12a', label: 'Inquiry-to-Admission Conversion Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 30, direction: 'higher_better', min: 0, max: 100 },
      { id: '12b', label: 'Year-on-Year Enrollment Trend (by grade)', dataType: 'percentage', unit: '% change/yr', required: false, benchmark: 5, direction: 'higher_better', min: -50, max: 100 },
      { id: '12c', label: 'Waitlist Length (by grade)', dataType: 'count', unit: 'students', required: false, benchmark: 10, direction: 'higher_better', min: 0, max: 500 },
      { id: '12d', label: 'Mid-Year Withdrawal/Attrition Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 3, direction: 'lower_better', min: 0, max: 100 },
      { id: '12e', label: 'Referral % of New Admissions', dataType: 'percentage', unit: '%', required: false, benchmark: 30, direction: 'higher_better', min: 0, max: 100 },
      { id: '12f', label: 'Alumni Engagement Participation Rate', dataType: 'percentage', unit: '%', required: false, benchmark: 20, direction: 'higher_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'technology_digital',
    metrics: [
      { id: '13a', label: 'LMS/Portal Active-Usage Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 75, direction: 'higher_better', min: 0, max: 100 },
      { id: '13b', label: 'Device:Student Ratio', dataType: 'ratio', unit: 'students/device', required: true, benchmark: 3, direction: 'lower_better', min: 0, max: 50 },
      { id: '13c', label: 'IT-Helpdesk Ticket Resolution Time', dataType: 'count', unit: 'days', required: true, benchmark: 2, direction: 'lower_better', min: 0, max: 30 },
      { id: '13d', label: '% of Lessons Using Digital Tools', dataType: 'percentage', unit: '%', required: false, benchmark: 60, direction: 'higher_better', min: 0, max: 100 },
      { id: '13e', label: 'Cybersecurity Incident Count', dataType: 'count', unit: '/yr', required: false, benchmark: 0, direction: 'lower_better', min: 0, max: 100 },
    ],
  },
  {
    dimensionId: 'cocurricular_holistic',
    metrics: [
      { id: '14a', label: '% Students in ≥1 Co-Curricular Activity', dataType: 'percentage', unit: '%', required: true, benchmark: 80, direction: 'higher_better', min: 0, max: 100 },
      { id: '14b', label: 'Inter-School Competition Participation & Results', dataType: 'count', unit: '/term', required: false, benchmark: 5, direction: 'higher_better', min: 0, max: 200 },
      { id: '14c', label: 'Sports/Arts Infrastructure Utilization Hours per Week', dataType: 'hours', unit: 'hrs/wk', required: false, benchmark: 20, direction: 'higher_better', min: 0, max: 100 },
      { id: '14d', label: 'Life-Skills Curriculum Completion Rate', dataType: 'percentage', unit: '%', required: true, benchmark: 90, direction: 'higher_better', min: 0, max: 100 },
      { id: '14e', label: 'House-System Participation Rate', dataType: 'percentage', unit: '%', required: false, benchmark: 80, direction: 'higher_better', min: 0, max: 100 },
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

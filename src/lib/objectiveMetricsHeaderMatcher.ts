/**
 * Best-effort matching of uploaded spreadsheet column headers to objective
 * metric ids, for prefilling the upload-review form. Matches are always a
 * starting point for the admin to review/correct, not treated as final -
 * every prefilled value still passes through `objectiveDataValidation.ts`
 * before it can be saved.
 */
import { OBJECTIVE_METRICS_SCHEMA } from '../data/objectiveMetricsSchema';

// Extra common real-world aliases for metrics that are likely to appear
// under a different name in a school's own spreadsheets. Metrics not
// listed here still get a default match on their own label text.
const METRIC_HEADER_VARIATIONS: Record<string, string[]> = {
  board_exam_pass_rate: ['board pass rate', 'board pass %', 'pass rate', 'pass percentage'],
  average_result_percentage: ['average result', 'avg result', 'average marks', 'avg score'],
  student_classroom_ratio: ['students per classroom', 'student classroom ratio', 'str'],
  computer_student_ratio: ['students per computer', 'computer ratio'],
  student_attendance_rate: ['attendance rate', 'attendance %', 'student attendance'],
  counselor_student_ratio: ['students per counselor', 'counselor ratio'],
  dropout_rate: ['dropout rate', 'dropout %'],
  teacher_attrition_rate: ['teacher attrition', 'staff attrition', 'teacher turnover'],
  certified_teachers_percentage: ['certified teachers', 'certified %', 'qualified teachers %'],
  fee_collection_rate: ['fee collection', 'fee collection rate', 'fee payment rate'],
  smart_classroom_coverage: ['smart classrooms', 'digital classrooms', 'smart classroom %'],
  regulatory_compliance_score: ['compliance score', 'regulatory compliance'],
  parent_participation_rate: ['parent participation', 'ptm attendance'],
  pta_meeting_frequency: ['pta meetings', 'pta meeting frequency'],
  curriculum_coverage_rate: ['curriculum coverage', 'syllabus coverage'],
  student_retention_rate: ['retention rate', 're-enrollment rate', 'reenrollment rate'],
  parent_satisfaction_score: ['parent satisfaction', 'parent nps'],
  staff_appraisal_completion_rate: ['appraisal completion', 'performance review completion'],
  employee_engagement_score: ['staff engagement', 'employee engagement'],
  disadvantaged_student_enrollment_pct: ['disadvantaged enrollment', 'ews enrollment', 'scholarship students %'],
};

function defaultVariations(metricId: string, label: string): string[] {
  return [label.toLowerCase(), metricId.replace(/_/g, ' ')];
}

function parseCellToNumber(rawCell: unknown): number | undefined {
  if (typeof rawCell === 'number' && !Number.isNaN(rawCell)) return rawCell;
  if (typeof rawCell === 'string') {
    const cleaned = rawCell.replace(/[%₹,\s]/g, '');
    const parsed = parseFloat(cleaned);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return undefined;
}

/**
 * Given a parsed spreadsheet's headers and its first data row, returns a
 * best-effort {dimensionId: {metricId: value}} prefill. Headers are matched
 * against each metric's label plus any known aliases, case-insensitively,
 * via substring containment in either direction.
 */
export function matchHeadersToObjectiveMetrics(
  headers: string[],
  firstDataRow: Record<string, unknown>
): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  const lowerHeaders = headers.map((h) => h.toLowerCase().trim());

  for (const dimSchema of OBJECTIVE_METRICS_SCHEMA) {
    for (const def of dimSchema.metrics) {
      const variations = [...(METRIC_HEADER_VARIATIONS[def.id] || []), ...defaultVariations(def.id, def.label)];
      const matchIdx = lowerHeaders.findIndex((h) => variations.some((v) => h.includes(v) || v.includes(h)));
      if (matchIdx === -1) continue;

      const value = parseCellToNumber(firstDataRow[headers[matchIdx]]);
      if (value === undefined) continue;

      result[dimSchema.dimensionId] = result[dimSchema.dimensionId] || {};
      result[dimSchema.dimensionId][def.id] = value;
    }
  }

  return result;
}

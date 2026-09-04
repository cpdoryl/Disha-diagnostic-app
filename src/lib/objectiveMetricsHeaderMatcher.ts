/**
 * Best-effort matching of uploaded spreadsheet column headers to objective
 * metric ids, for prefilling the upload-review form. Matches are always a
 * starting point for the admin to review/correct, not treated as final -
 * every prefilled value still passes through `objectiveDataValidation.ts`
 * before it can be saved.
 */
import { OBJECTIVE_METRICS_SCHEMA } from '../data/objectiveMetricsSchema';

// Extra common real-world aliases for metrics that are likely to appear
// under a different name in a school's own spreadsheets, keyed by metric id
// (e.g. '1a'). Metrics not listed here still get a default match on their
// own label text via defaultVariations() below - this table is empty
// pending repopulation for the v2 framework's metric ids (previously keyed
// to the old ad hoc metric ids like 'board_exam_pass_rate', which no
// metric uses anymore since the objective schema was rebuilt to match the
// School Diagnostic Framework v2 reality metrics).
const METRIC_HEADER_VARIATIONS: Record<string, string[]> = {
  '1a': ['board pass rate', 'board pass %', 'pass rate', 'pass percentage'],
  '3a': ['teacher attrition', 'staff attrition', 'teacher turnover'],
  '8a': ['ptm attendance', 'ptm attendance rate'],
  '8f': ['re-enrollment rate', 'reenrollment rate', 'retention rate'],
  '9b': ['attendance rate', 'attendance %', 'student attendance'],
  '11a': ['fee collection', 'fee collection rate', 'fee payment rate'],
  '10e': ['compliance score', 'compliance closure rate'],
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

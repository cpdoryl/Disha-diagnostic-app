/**
 * Regression suite for the metric range/sanity validation added to close a
 * real gap: presence-only validation (validateDataForChallenges) accepted
 * ANY numeric value, so a negative student-teacher ratio or a 250% pass
 * rate would previously be scored as if it were real data. validateMetricRanges
 * is the one place these are caught before they ever reach the scoring engine.
 */
import { describe, it, expect } from 'vitest';
import { validateMetricRanges, CORE_OPERATIONAL_METRICS, CHALLENGE_DATA_REQUIREMENTS } from '../challengeDataRequirements';
import { validateFileMetrics, validateFileForChallenges, ExtractedMetrics } from '../fileAnalyzer';

function extracted(metricsFound: Record<string, number | string>): ExtractedMetrics {
  return { fileType: 'csv', metricsFound, insights: [], affectedDomains: [], confidence: 'HIGH' };
}

describe('validateMetricRanges', () => {
  it('flags a negative Student-Teacher Ratio as implausible', () => {
    const violations = validateMetricRanges({ students_per_classroom: -5 });
    expect(violations).toHaveLength(1);
    expect(violations[0].fieldName).toBe('students_per_classroom');
    expect(violations[0].value).toBe(-5);
  });

  it('flags a percentage field over 100 as implausible', () => {
    const violations = validateMetricRanges({ board_exam_pass_rate_pct: 250 });
    expect(violations).toHaveLength(1);
    expect(violations[0].fieldName).toBe('board_exam_pass_rate_pct');
  });

  it('accepts every field at exactly its min and max boundary', () => {
    // Core + every challenge-specific field, at its own recorded bounds.
    const allDefs = [...CORE_OPERATIONAL_METRICS, ...Object.values(CHALLENGE_DATA_REQUIREMENTS).flatMap((r) => r.requiredMetrics)];
    allDefs.forEach((def) => {
      const atMin = validateMetricRanges({ [def.fieldName]: def.validRange.min });
      const atMax = validateMetricRanges({ [def.fieldName]: def.validRange.max });
      expect(atMin, `${def.fieldName} at min ${def.validRange.min}`).toHaveLength(0);
      expect(atMax, `${def.fieldName} at max ${def.validRange.max}`).toHaveLength(0);
    });
  });

  it('rejects a value 1 unit beyond either boundary', () => {
    const allDefs = [...CORE_OPERATIONAL_METRICS, ...Object.values(CHALLENGE_DATA_REQUIREMENTS).flatMap((r) => r.requiredMetrics)];
    allDefs.forEach((def) => {
      const belowMin = validateMetricRanges({ [def.fieldName]: def.validRange.min - 1 });
      const aboveMax = validateMetricRanges({ [def.fieldName]: def.validRange.max + 1 });
      expect(belowMin, `${def.fieldName} below min`).toHaveLength(1);
      expect(aboveMax, `${def.fieldName} above max`).toHaveLength(1);
    });
  });

  it('allows a legitimately negative value for fields whose range permits it (e.g. Operating Margin during a deficit)', () => {
    expect(validateMetricRanges({ operating_margin_pct: -30 })).toHaveLength(0);
    expect(validateMetricRanges({ new_student_intake_rate_pct: -20 })).toHaveLength(0);
  });

  it('ignores unrecognized fields (not this validator\'s job - ALL_KNOWN_FIELD_NAMES/scoreRawValueToWeight handle that)', () => {
    expect(validateMetricRanges({ totally_made_up_field: -999999 })).toHaveLength(0);
  });

  it('ignores non-numeric values silently rather than crashing', () => {
    expect(validateMetricRanges({ students_per_classroom: 'unknown' })).toHaveLength(0);
  });

  it('accepts a numeric string the same as a number (CSV values arrive as strings)', () => {
    expect(validateMetricRanges({ students_per_classroom: '-5' })).toHaveLength(1);
  });

  it('reports every violation when multiple fields are implausible at once', () => {
    const violations = validateMetricRanges({
      students_per_classroom: -1,
      board_exam_pass_rate_pct: 300,
      avg_teacher_tenure_years: 6 // valid, should not appear
    });
    expect(violations).toHaveLength(2);
    expect(violations.map((v) => v.fieldName).sort()).toEqual(['board_exam_pass_rate_pct', 'students_per_classroom']);
  });
});

describe('validateFileMetrics - wired to range validation', () => {
  it('is invalid when a required core field is present but implausible', () => {
    const result = validateFileMetrics(
      extracted({ students_per_classroom: -5, parent_query_response_sla_hours: 24, annual_training_hours: 20, weekly_planning_hours: 4 })
    );
    expect(result.isValid).toBe(false);
    expect(result.outOfRangeMetrics).toHaveLength(1);
    expect(result.errorMessage).toContain('IMPLAUSIBLE VALUE');
  });

  it('is valid when all core fields are present and plausible', () => {
    const result = validateFileMetrics(
      extracted({ students_per_classroom: 28, parent_query_response_sla_hours: 24, annual_training_hours: 20, weekly_planning_hours: 4 })
    );
    expect(result.isValid).toBe(true);
    expect(result.outOfRangeMetrics).toHaveLength(0);
  });
});

describe('validateFileForChallenges - wired to range validation', () => {
  it('is invalid when a challenge-specific field is present but implausible, even though completeness is 100%', () => {
    const result = validateFileForChallenges(
      extracted({ teacher_turnover_rate_pct: 500, avg_teacher_tenure_years: 6 }),
      ['teacher_attrition']
    );
    expect(result.completeness).toBe(100); // both fields present
    expect(result.isValid).toBe(false); // but one is implausible
    expect(result.outOfRangeMetrics).toHaveLength(1);
    expect(result.outOfRangeMetrics[0].fieldName).toBe('teacher_turnover_rate_pct');
    expect(result.errorMessage).toContain('IMPLAUSIBLE VALUE');
    expect(result.challengesCovered).toEqual([]);
    expect(result.challengesUncovered).toEqual(['teacher_attrition']);
  });

  it('reports both missing-data and implausible-value problems together when both exist', () => {
    const result = validateFileForChallenges(extracted({ teacher_turnover_rate_pct: 500 }), ['teacher_attrition']);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('INCOMPLETE');
    expect(result.errorMessage).toContain('IMPLAUSIBLE VALUE');
  });

  it('is valid when every uploaded value for the selected challenge is present and plausible', () => {
    const result = validateFileForChallenges(
      extracted({ teacher_turnover_rate_pct: 15, avg_teacher_tenure_years: 6 }),
      ['teacher_attrition']
    );
    expect(result.isValid).toBe(true);
    expect(result.outOfRangeMetrics).toHaveLength(0);
    expect(result.challengesCovered).toEqual(['teacher_attrition']);
  });

  it('still range-checks uploaded data even when no challenges are selected yet', () => {
    const result = validateFileForChallenges(extracted({ students_per_classroom: -10 }), []);
    expect(result.isValid).toBe(false);
    expect(result.outOfRangeMetrics).toHaveLength(1);
  });
});

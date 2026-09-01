/**
 * Regression suite for insightGenerator.ts's public API. Tested as a black
 * box (only generateRealInsights is exported) - this is deliberate: it
 * verifies the *observable* report content (ranking, thresholds, headline
 * wording) that a user actually sees, so it stays valid across internal
 * refactors of the private ranking/analysis helpers.
 */
import { describe, it, expect } from 'vitest';
import { generateRealInsights } from '../insightGenerator';
import type { ParsedData } from '../fileParser';

function parsedData(extractedMetrics: Record<string, number | string>): ParsedData {
  return {
    fileType: 'csv',
    fileName: 'test.csv',
    uploadedAt: new Date('2026-01-01T00:00:00Z'),
    dataRows: [],
    headers: [],
    extractedMetrics,
    parseStatus: 'success',
    errorMessages: [],
    warnings: [],
    confidence: 100
  };
}

describe('generateRealInsights - severity ranking', () => {
  it('ranks Key Findings/Recommendations by priority first (high before medium before low)', () => {
    const result = generateRealInsights(
      parsedData({
        // Core Operational Lever, inserted FIRST in the object - always
        // "meets" (medium) in this fixture. rankBySeverity must not let
        // object-key insertion order override actual severity.
        students_per_classroom: 30,
        // Challenge-specific field, inserted second, but far more severe -> high priority
        teacher_turnover_rate_pct: 30 // weight 10 -> status 'below' -> high
      })
    );
    const turnover = result.insights.find((i) => i.metric === 'Teacher Turnover Rate')!;
    const ratio = result.insights.find((i) => i.metric === 'Student-Teacher Ratio')!;
    expect(turnover.priority).toBe('high');
    expect(ratio.priority).toBe('medium');
    // The high-priority challenge-specific metric must lead Key Findings,
    // even though it was inserted second in the raw metrics object (the bug
    // rankBySeverity fixed - see insightGenerator.ts's own comment on it).
    expect(result.keyFindings[0]).toContain('Teacher Turnover Rate');
    const highIdx = result.keyFindings.findIndex((f) => f.startsWith('Teacher Turnover Rate'));
    const mediumIdx = result.keyFindings.findIndex((f) => f.startsWith('Student-Teacher Ratio'));
    expect(highIdx).toBeLessThan(mediumIdx);
  });

  it('within the same priority, ranks by larger gap-from-benchmark first', () => {
    const result = generateRealInsights(
      parsedData({
        teacher_turnover_rate_pct: 26, // weight 10, just over the 25 threshold -> smaller gap
        market_share_loss_pct: 50 // weight 10, far over its threshold -> larger gap
      })
    );
    const turnover = result.insights.find((i) => i.metric === 'Teacher Turnover Rate')!;
    const marketShare = result.insights.find((i) => i.metric.includes('Market Share'))!;
    expect(turnover.priority).toBe('high');
    expect(marketShare.priority).toBe('high');
    expect(marketShare.gap).toBeGreaterThan(turnover.gap);
    // Ranked list must put the larger gap first within the same 'high' priority.
    const rankOf = (metric: string) => result.keyFindings.findIndex((f) => f.startsWith(metric));
    expect(rankOf('Market Share Loss')).toBeLessThan(rankOf('Teacher Turnover Rate'));
  });

  it('caps Key Findings and Recommended Actions at the top 5, even with more insights available', () => {
    const manyMetrics: Record<string, number> = {};
    const fields = [
      'teacher_turnover_rate_pct',
      'midyear_dropout_rate_pct',
      'outflow_to_competitors_pct',
      'market_share_loss_pct',
      'cost_increase_yoy_pct',
      'safety_violations_count_year',
      'regulatory_violations_count_year'
    ];
    fields.forEach((f) => (manyMetrics[f] = 1000)); // force every one to the worst band
    const result = generateRealInsights(parsedData(manyMetrics));
    expect(result.insights.length).toBe(fields.length);
    expect(result.keyFindings.length).toBeLessThanOrEqual(5);
    expect(result.recommendations.length).toBeLessThanOrEqual(5);
  });
});

describe('generateRealInsights - unrecognized/non-numeric fields are skipped, never fabricated', () => {
  it('silently ignores a field with no matching metric definition', () => {
    const result = generateRealInsights(parsedData({ totally_made_up_field: 42 }));
    expect(result.insights.length).toBe(0);
    expect(result.overallAssessment).toBe('Insufficient data for analysis. Upload operational data files for deeper insights.');
  });

  it('silently ignores a non-numeric value for an otherwise-known field', () => {
    const result = generateRealInsights(parsedData({ teacher_turnover_rate_pct: 'unknown' }));
    expect(result.insights.length).toBe(0);
  });
});

describe('generateRealInsights - overall assessment thresholds', () => {
  it('reports "Insufficient data" when no metric could be scored', () => {
    const result = generateRealInsights(parsedData({}));
    expect(result.overallAssessment).toContain('Insufficient data for analysis');
  });

  it('reports Critical when more than half the scored metrics are below benchmark', () => {
    const result = generateRealInsights(
      parsedData({
        teacher_turnover_rate_pct: 40, // below
        market_share_loss_pct: 40, // below
        avg_teacher_tenure_years: 8 // exceeds (<=10 -> weight 2 -> exceeds)
      })
    );
    expect(result.overallAssessment).toContain('Critical');
  });

  it('reports Strong Performance when more than half the scored metrics exceed benchmark', () => {
    const result = generateRealInsights(
      parsedData({
        avg_teacher_tenure_years: 12, // exceeds
        operating_margin_pct: 22, // exceeds
        teacher_turnover_rate_pct: 12 // meets (weight 4, status 'meets')
      })
    );
    expect(result.overallAssessment).toContain('Strong Performance');
  });

  it('reports Balanced Profile when neither exceeding nor below is a strict majority', () => {
    const result = generateRealInsights(
      parsedData({
        avg_teacher_tenure_years: 12, // exceeds
        teacher_turnover_rate_pct: 12 // meets
      })
    );
    expect(result.overallAssessment).toContain('Balanced Profile');
  });
});

describe('generateRealInsights - data quality', () => {
  it('computes completeness against the fixed 10-field expectation and grades reliability accordingly', () => {
    const result = generateRealInsights(
      parsedData({
        studentTeacherRatio: 28,
        parentResponseSLA: 20,
        annualTrainingHours: 22,
        weeklyPlanningHours: 5,
        teacher_turnover_rate_pct: 12,
        avg_teacher_tenure_years: 6,
        new_student_intake_rate_pct: -2,
        student_retention_rate_pct: 88
      })
    );
    expect(result.dataQuality.metricsFound).toBe(8);
    expect(result.dataQuality.metricsExpected).toBe(10);
    expect(result.dataQuality.completeness).toBe(80);
    expect(result.dataQuality.reliability).toBe('high');
  });
});

describe('generateRealInsights - determinism', () => {
  it('produces byte-identical output across repeated calls with identical input', () => {
    const input = parsedData({
      teacher_turnover_rate_pct: 18,
      avg_teacher_tenure_years: 4,
      market_share_loss_pct: 7,
      operating_margin_pct: 8
    });
    const runs = Array.from({ length: 5 }, () => generateRealInsights({ ...input }));
    for (let i = 1; i < runs.length; i++) {
      expect(runs[i]).toEqual(runs[0]);
    }
  });
});

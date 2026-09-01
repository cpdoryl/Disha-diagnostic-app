/**
 * Regression suite for reportIntegrity.ts - the module backing both the
 * printed Input Checksum and the "Verify Report Integrity" badge. These
 * tests are themselves part of the "no silent drift" guarantee: if a future
 * change makes recompute*() diverge from what the live app actually
 * computes at submission time, the verify badge would start reporting every
 * report ever generated as "not verified" - these tests catch that here,
 * in CI, instead of in front of a school.
 */
import { describe, it, expect } from 'vitest';
import {
  canonicalStringify,
  computeInputsChecksum,
  buildOperationalMetricsFromExtracted,
  buildScreeningAnswers,
  recomputeDishaScore,
  recomputePerceptionGap,
  recomputeRealInsights,
  verifyCheckupAnalysis,
  ReportRawInputs
} from '../reportIntegrity';
import DISHAScoreCalculator from '../dishaScoreCalculator';
import { computePerceptionGapReport } from '../challengeObjectiveScoring';
import { generateRealInsights } from '../insightGenerator';
import type { CheckupAnalysis } from '../checkupService';

describe('canonicalStringify', () => {
  it('produces the same string regardless of object key insertion order', () => {
    const a = { z: 1, a: 2, m: { y: 1, x: 2 } };
    const b = { a: 2, m: { x: 2, y: 1 }, z: 1 };
    expect(canonicalStringify(a)).toBe(canonicalStringify(b));
  });

  it('is sensitive to an actual value change', () => {
    expect(canonicalStringify({ a: 1 })).not.toBe(canonicalStringify({ a: 2 }));
  });

  it('preserves array order (arrays are ordered data, not sorted)', () => {
    expect(canonicalStringify([1, 2, 3])).not.toBe(canonicalStringify([3, 2, 1]));
  });
});

const sampleInputs: ReportRawInputs = {
  selectedChallenges: ['enrollment_decline', 'teacher_attrition'],
  answers: { q1_1: 'q1_1_4', q1_2: 'q1_2_3', q1_3: 'q1_3_2', q4_1: 'q4_1_3', q4_2: 'q4_2_2', q4_3: 'q4_3_1' },
  extractedMetricsFound: {
    students_per_classroom: 28,
    parent_query_response_sla_hours: 20,
    annual_training_hours: 22,
    weekly_planning_hours: 5,
    new_student_intake_rate_pct: -8,
    student_retention_rate_pct: 82,
    teacher_turnover_rate_pct: 12,
    avg_teacher_tenure_years: 6
  }
};

describe('computeInputsChecksum', () => {
  it('is deterministic: identical inputs hash to the identical value, every time', async () => {
    const hashes = await Promise.all(Array.from({ length: 5 }, () => computeInputsChecksum(sampleInputs)));
    hashes.forEach((h) => expect(h).toBe(hashes[0]));
  });

  it('is a 64-character lowercase hex SHA-256 digest', async () => {
    const hash = await computeInputsChecksum(sampleInputs);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is insensitive to selectedChallenges array order (same set of challenges = same report)', async () => {
    const reordered: ReportRawInputs = { ...sampleInputs, selectedChallenges: [...sampleInputs.selectedChallenges].reverse() };
    expect(await computeInputsChecksum(reordered)).toBe(await computeInputsChecksum(sampleInputs));
  });

  it('changes if even a single answer changes', async () => {
    const changed: ReportRawInputs = { ...sampleInputs, answers: { ...sampleInputs.answers, q1_1: 'q1_1_1' } };
    expect(await computeInputsChecksum(changed)).not.toBe(await computeInputsChecksum(sampleInputs));
  });

  it('changes if even a single uploaded metric value changes', async () => {
    const changed: ReportRawInputs = {
      ...sampleInputs,
      extractedMetricsFound: { ...sampleInputs.extractedMetricsFound, teacher_turnover_rate_pct: 13 }
    };
    expect(await computeInputsChecksum(changed)).not.toBe(await computeInputsChecksum(sampleInputs));
  });
});

describe('buildOperationalMetricsFromExtracted', () => {
  it('maps the 4 canonical CSV field names to the OperationalMetrics shape DISHAScoreCalculator expects', () => {
    expect(buildOperationalMetricsFromExtracted(sampleInputs.extractedMetricsFound)).toEqual({
      studentTeacherRatio: 28,
      parentResponseSLA: 20,
      annualTrainingHours: 22,
      weeklyPlanningHours: 5
    });
  });

  it('falls back to the same defaults the app uses when a field is missing', () => {
    expect(buildOperationalMetricsFromExtracted({})).toEqual({
      studentTeacherRatio: 28,
      parentResponseSLA: 24,
      annualTrainingHours: 20,
      weeklyPlanningHours: 4
    });
  });
});

describe('buildScreeningAnswers', () => {
  it('rebuilds {questionId, weight} for every question of every selected challenge, using max possible = questions x 10', () => {
    const { answersArray, maxPossible } = buildScreeningAnswers(['enrollment_decline'], {
      q1_1: 'q1_1_4', // weight 6
      q1_2: 'q1_2_3', // weight 5
      q1_3: 'q1_3_2' // weight 3
    });
    expect(answersArray).toEqual([
      { questionId: 'q1_1', weight: 6 },
      { questionId: 'q1_2', weight: 5 },
      { questionId: 'q1_3', weight: 3 }
    ]);
    expect(maxPossible).toBe(30);
  });

  it('defaults an unanswered question to weight 5, matching runLocalDiagnosticCalculation\'s own fallback', () => {
    const { answersArray } = buildScreeningAnswers(['enrollment_decline'], { q1_1: 'q1_1_4' });
    expect(answersArray.find((a) => a.questionId === 'q1_2')?.weight).toBe(5);
  });
});

describe('recompute* functions match calling the live engines directly (no divergent second implementation)', () => {
  it('recomputeDishaScore matches DISHAScoreCalculator.calculateCompleteScore on the same rebuilt inputs', () => {
    const { answersArray, maxPossible } = buildScreeningAnswers(sampleInputs.selectedChallenges, sampleInputs.answers);
    const metrics = buildOperationalMetricsFromExtracted(sampleInputs.extractedMetricsFound);
    const expected = DISHAScoreCalculator.calculateCompleteScore(answersArray, maxPossible, metrics);
    expect(recomputeDishaScore(sampleInputs)).toEqual(expected);
  });

  it('recomputePerceptionGap matches computePerceptionGapReport called directly', () => {
    const expected = computePerceptionGapReport(sampleInputs.selectedChallenges, sampleInputs.answers, sampleInputs.extractedMetricsFound);
    expect(recomputePerceptionGap(sampleInputs)).toEqual(expected);
  });

  it('recomputeRealInsights matches generateRealInsights called directly with the same extracted metrics', () => {
    const expected = generateRealInsights({
      fileType: 'csv',
      fileName: '',
      uploadedAt: new Date(0),
      dataRows: [],
      headers: [],
      extractedMetrics: sampleInputs.extractedMetricsFound,
      parseStatus: 'success',
      errorMessages: [],
      warnings: [],
      confidence: 100
    });
    expect(recomputeRealInsights(sampleInputs, 'csv')).toEqual(expected);
  });
});

describe('verifyCheckupAnalysis', () => {
  async function buildGenuineAnalysis(): Promise<CheckupAnalysis> {
    return {
      dishaScore: recomputeDishaScore(sampleInputs),
      realInsights: recomputeRealInsights(sampleInputs, 'csv'),
      perceptionGap: recomputePerceptionGap(sampleInputs),
      selectedChallenges: sampleInputs.selectedChallenges,
      answers: sampleInputs.answers,
      extractedMetricsFound: sampleInputs.extractedMetricsFound,
      extractedFileType: 'csv',
      generatedAt: null,
      inputsChecksum: await computeInputsChecksum(sampleInputs)
    };
  }

  it('reports fully verified for a genuine, untampered report', async () => {
    const analysis = await buildGenuineAnalysis();
    const result = await verifyCheckupAnalysis(analysis);
    expect(result.verified).toBe(true);
    expect(result.checksumMatches).toBe(true);
    expect(result.dishaScoreMatches).toBe(true);
    expect(result.perceptionGapMatches).toBe(true);
    expect(result.realInsightsMatches).toBe(true);
    expect(result.mismatches).toEqual([]);
  });

  it('flags a tampered/drifted dishaScore as not verified, naming the mismatch', async () => {
    const analysis = await buildGenuineAnalysis();
    analysis.dishaScore = { ...analysis.dishaScore, healthIndex: analysis.dishaScore.healthIndex + 5 };
    const result = await verifyCheckupAnalysis(analysis);
    expect(result.verified).toBe(false);
    expect(result.dishaScoreMatches).toBe(false);
    expect(result.mismatches.some((m) => m.includes('DISHA Score'))).toBe(true);
  });

  it('flags a checksum that no longer matches the recorded raw inputs (edited after the fact)', async () => {
    const analysis = await buildGenuineAnalysis();
    analysis.inputsChecksum = '0'.repeat(64); // clearly wrong
    const result = await verifyCheckupAnalysis(analysis);
    expect(result.verified).toBe(false);
    expect(result.checksumMatches).toBe(false);
    expect(result.mismatches.some((m) => m.toLowerCase().includes('checksum'))).toBe(true);
  });

  it('treats a missing checksum (pre-existing report) as "not_recorded", not a failure, when everything else matches', async () => {
    const analysis = await buildGenuineAnalysis();
    delete (analysis as any).inputsChecksum;
    const result = await verifyCheckupAnalysis(analysis);
    expect(result.checksumMatches).toBe('not_recorded');
    expect(result.verified).toBe(true); // still verified on the recomputation match alone
  });
});

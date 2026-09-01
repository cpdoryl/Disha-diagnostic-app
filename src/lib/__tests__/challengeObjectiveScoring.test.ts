/**
 * Regression suite for challengeObjectiveScoring.ts - the code that converts
 * raw uploaded metrics into the 1-10 severity scale and builds the
 * Perception Gap verdicts. See dishaScoreCalculator.test.ts's file header
 * for why these are hardcoded-expectation tests rather than call-and-
 * compare-to-itself tests.
 */
import { describe, it, expect } from 'vitest';
import {
  scoreRawValueToWeight,
  getChallengeObjectiveWeight,
  getChallengeSubjectiveWeight,
  computePerceptionGapReport,
  METRIC_BAND_DEFINITIONS
} from '../challengeObjectiveScoring';

describe('scoreRawValueToWeight - band boundaries', () => {
  it('returns null for an unknown field', () => {
    expect(scoreRawValueToWeight('not_a_real_field', 50)).toBeNull();
  });

  it('returns null for a non-numeric value', () => {
    expect(scoreRawValueToWeight('teacher_turnover_rate_pct', 'not-a-number')).toBeNull();
  });

  it('accepts a numeric string the same as a number (CSV values arrive as strings)', () => {
    expect(scoreRawValueToWeight('teacher_turnover_rate_pct', '5')).toBe(1);
  });

  it('walks bands in ascending order, first satisfied band wins (higherIsBetter: false)', () => {
    // teacher_turnover_rate_pct bands: <=5->1, <=10->2, <=15->4, <=25->7, else 10
    expect(scoreRawValueToWeight('teacher_turnover_rate_pct', 5)).toBe(1);
    expect(scoreRawValueToWeight('teacher_turnover_rate_pct', 5.01)).toBe(2);
    expect(scoreRawValueToWeight('teacher_turnover_rate_pct', 10)).toBe(2);
    expect(scoreRawValueToWeight('teacher_turnover_rate_pct', 10.01)).toBe(4);
    expect(scoreRawValueToWeight('teacher_turnover_rate_pct', 25)).toBe(7);
    expect(scoreRawValueToWeight('teacher_turnover_rate_pct', 25.01)).toBe(10);
    expect(scoreRawValueToWeight('teacher_turnover_rate_pct', 1000)).toBe(10);
  });

  it('a higherIsBetter:true metric still evaluates against its "max" bands directly (bands already expressed as ascending thresholds)', () => {
    // new_student_intake_rate_pct: <=-20->10, <=-10->8, <=-5->6, <=10->4, <=20->2, else 1
    expect(scoreRawValueToWeight('new_student_intake_rate_pct', -25)).toBe(10);
    expect(scoreRawValueToWeight('new_student_intake_rate_pct', -20)).toBe(10);
    expect(scoreRawValueToWeight('new_student_intake_rate_pct', -19.99)).toBe(8);
    expect(scoreRawValueToWeight('new_student_intake_rate_pct', 0)).toBe(4);
    expect(scoreRawValueToWeight('new_student_intake_rate_pct', 25)).toBe(1);
  });

  it('every metric band definition is exhaustive (last band max is +Infinity, so no raw value falls through unclassified)', () => {
    Object.values(METRIC_BAND_DEFINITIONS).forEach((def) => {
      const lastBand = def.bands[def.bands.length - 1];
      expect(lastBand.max).toBe(Infinity);
    });
  });

  it('every band weight is a valid 1-10 severity value', () => {
    Object.values(METRIC_BAND_DEFINITIONS).forEach((def) => {
      def.bands.forEach((band) => {
        expect(band.weight).toBeGreaterThanOrEqual(1);
        expect(band.weight).toBeLessThanOrEqual(10);
      });
    });
  });
});

describe('getChallengeObjectiveWeight', () => {
  it('averages the 2 canonical metrics for a challenge', () => {
    const result = getChallengeObjectiveWeight('teacher_attrition', {
      teacher_turnover_rate_pct: 5, // -> weight 1
      avg_teacher_tenure_years: 2 // <=3 -> weight 10
    });
    expect(result).not.toBeNull();
    expect(result!.weight).toBe(5.5); // (1+10)/2
    expect(result!.metricsUsed).toBe(2);
    expect(result!.metricsExpected).toBe(2);
  });

  it('returns null (never a fabricated number) when neither metric was uploaded', () => {
    expect(getChallengeObjectiveWeight('teacher_attrition', {})).toBeNull();
  });

  it('averages over just the metrics that were actually uploaded, never inventing the missing one', () => {
    const result = getChallengeObjectiveWeight('teacher_attrition', {
      teacher_turnover_rate_pct: 5 // -> weight 1; avg_teacher_tenure_years not uploaded
    });
    expect(result!.weight).toBe(1);
    expect(result!.metricsUsed).toBe(1);
    expect(result!.metricsExpected).toBe(2);
  });
});

describe('getChallengeSubjectiveWeight', () => {
  it('averages the weights of whichever of the challenge\'s own questions were answered', () => {
    const result = getChallengeSubjectiveWeight('enrollment_decline', {
      q1_1: 'q1_1_4', // weight 6
      q1_2: 'q1_2_3', // weight 5
      q1_3: 'q1_3_2' // weight 3
    });
    expect(result!.weight).toBe(4.67); // avg (6+5+3)/3 = 4.6666... rounded to 2 decimals
    expect(result!.questionsAnswered).toBe(3);
    expect(result!.questionsExpected).toBe(3);
  });

  it('returns null when the challenge has no answers at all', () => {
    expect(getChallengeSubjectiveWeight('enrollment_decline', {})).toBeNull();
  });
});

describe('computePerceptionGapReport - the 4 verdicts + insufficient data, mutually exclusive and exhaustive', () => {
  // teacher_attrition's own q4_1 options (screeningQuestionsData.ts):
  // q4_1_1 -> weight 1 (<5% turnover), q4_1_3 -> weight 4 (10-15%), q4_1_5 -> weight 10 (>25%).
  // Only q4_1 is answered in each case below, so getChallengeSubjectiveWeight
  // averages over just that one question - the resulting subjectiveWeight is
  // exactly that option's weight, not an estimate.
  const metricsForChallenge = (turnoverPct: number, tenureYears: number) => ({
    teacher_turnover_rate_pct: turnoverPct,
    avg_teacher_tenure_years: tenureYears
  });

  it('ALIGNED: both self-reported (1) and objective (avg of 1 and 2 = 1.5) are <=5', () => {
    const [entry] = computePerceptionGapReport(
      ['teacher_attrition'],
      { q4_1: 'q4_1_1' },
      metricsForChallenge(3, 10) // turnover 3 -> weight 1; tenure 10 -> weight 2
    );
    expect(entry.subjectiveWeight).toBe(1);
    expect(entry.objectiveWeight).toBe(1.5);
    expect(entry.verdict).toBe('ALIGNED');
  });

  it('CONFIRMED_CRISIS: both self-reported (10) and objective (avg of 10 and 10 = 10) are >5', () => {
    const [entry] = computePerceptionGapReport(
      ['teacher_attrition'],
      { q4_1: 'q4_1_5' },
      metricsForChallenge(30, 1) // turnover 30 -> weight 10; tenure 1 -> weight 10
    );
    expect(entry.subjectiveWeight).toBe(10);
    expect(entry.objectiveWeight).toBe(10);
    expect(entry.verdict).toBe('CONFIRMED_CRISIS');
  });

  it('INSUFFICIENT_DATA: no objective metrics uploaded for the challenge', () => {
    const [entry] = computePerceptionGapReport(['teacher_attrition'], { q4_1: 'q4_1_1' }, {});
    expect(entry.verdict).toBe('INSUFFICIENT_DATA');
    expect(entry.objectiveWeight).toBeNull();
    expect(entry.gap).toBeNull();
  });

  it('INSUFFICIENT_DATA: no screening answers given for the challenge', () => {
    const [entry] = computePerceptionGapReport(['teacher_attrition'], {}, metricsForChallenge(5, 8));
    expect(entry.verdict).toBe('INSUFFICIENT_DATA');
    expect(entry.subjectiveWeight).toBeNull();
  });

  it('DELUSIONAL_COMFORT: self-reported low (1, not a concern), objective high (10, a real concern)', () => {
    const entry = computePerceptionGapReport(
      ['teacher_attrition'],
      { q4_1: 'q4_1_1' },
      metricsForChallenge(30, 1)
    )[0];
    expect(entry.subjectiveWeight).toBe(1);
    expect(entry.objectiveWeight).toBe(10);
    expect(entry.verdict).toBe('DELUSIONAL_COMFORT');
    expect(entry.gap).toBe(9); // objective more severe than subjective
  });

  it('HIDDEN_EXCELLENCE: self-reported high (10, perceived as a concern), objective low (1.5, actually fine)', () => {
    const entry = computePerceptionGapReport(
      ['teacher_attrition'],
      { q4_1: 'q4_1_5' },
      metricsForChallenge(3, 10)
    )[0];
    expect(entry.subjectiveWeight).toBe(10);
    expect(entry.objectiveWeight).toBe(1.5);
    expect(entry.verdict).toBe('HIDDEN_EXCELLENCE');
    expect(entry.gap).toBe(-8.5); // objective less severe than subjective
  });

  it('gap is objectiveWeight - subjectiveWeight, rounded to 2 decimals', () => {
    const [entry] = computePerceptionGapReport(
      ['teacher_attrition'],
      { q4_1: 'q4_1_3' }, // weight 4
      metricsForChallenge(12, 6) // turnover 12 -> weight 4; tenure 6 -> weight 4, avg 4
    );
    expect(entry.subjectiveWeight).toBe(4);
    expect(entry.objectiveWeight).toBe(4);
    expect(entry.gap).toBe(0);
    expect(entry.verdict).toBe('ALIGNED');
  });

  it('is deterministic: identical inputs produce identical output across repeated calls', () => {
    const args: [string[], Record<string, string>, Record<string, number>] = [
      ['enrollment_decline', 'teacher_attrition'],
      { q1_1: 'q1_1_4', q4_1: 'q4_1_3' },
      { new_student_intake_rate_pct: -8, student_retention_rate_pct: 82, teacher_turnover_rate_pct: 12, avg_teacher_tenure_years: 6 }
    ];
    const runs = Array.from({ length: 5 }, () => computePerceptionGapReport(...args));
    for (let i = 1; i < runs.length; i++) {
      expect(runs[i]).toEqual(runs[0]);
    }
  });
});

/**
 * Challenge Objective Scoring
 *
 * Converts the raw operational metrics uploaded via the canonical
 * "Operational Metrics CSV" (see fileAnalyzer.ts + challengeDataRequirements.ts)
 * into the same 1-10 severity weight scale already used by the First
 * Opinion Engine's own screening questions (screeningQuestionsData.ts),
 * so real uploaded data can be compared directly against what leadership
 * self-reported for the same challenge (the "Perception Gap" the product
 * is designed around, per DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md).
 *
 * IMPORTANT — do not treat this table as more precise than it is:
 * For every metric where `bandSource` names a real question id (e.g. "q4_1"),
 * the bands are copied verbatim from that question's own answer options in
 * screeningQuestionsData.ts, so a raw value and a self-reported answer are
 * directly comparable on the same scale.
 * For every metric marked `authored: true`, no matching quantitative
 * question exists in the question bank for that exact metric, so the bands
 * below are a reasonable analogous scale (same shape/precedent as sibling
 * metrics in the same challenge or domain), not a value derived from an
 * external benchmark or study. Treat these as a documented placeholder to
 * refine with real institutional benchmarks (see reference doc addendum).
 */

import { CHALLENGE_DATA_REQUIREMENTS } from './challengeDataRequirements';
import { COMPLETE_SCREENING_QUESTIONS } from '../data/screeningQuestionsData';

export interface MetricBand {
  /** Inclusive upper bound of the raw value for this band, in the metric's own unit. Use Infinity for the last band if higherIsBetter is false, or -Infinity is not used (see higherIsBetter). */
  max: number;
  weight: number; // 1 (best) .. 10 (worst), same scale as screeningQuestionsData.ts
}

export interface MetricBandDefinition {
  fieldName: string;
  higherIsBetter: boolean; // true e.g. avg_teacher_tenure_years, false e.g. teacher_turnover_rate_pct
  bands: MetricBand[]; // evaluated in order; first band whose threshold the value satisfies wins
  bandSource: string; // e.g. "q4_1 (exact)" or "authored (no direct question)"
  authored: boolean;
}

// Bands are always expressed as "max value for this band" assuming ascending
// severity order for a higherIsBetter=false metric (i.e. band 1 = best/lowest
// values). For higherIsBetter=true metrics, the same band list is walked
// from the *high* end instead — see scoreRawValueToWeight().
export const METRIC_BAND_DEFINITIONS: Record<string, MetricBandDefinition> = {
  // --- enrollment_decline ---
  new_student_intake_rate_pct: {
    fieldName: 'new_student_intake_rate_pct', higherIsBetter: true, bandSource: 'q1_1 (exact)', authored: false,
    bands: [{ max: -20, weight: 10 }, { max: -10, weight: 8 }, { max: -5, weight: 6 }, { max: 10, weight: 4 }, { max: 20, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  student_retention_rate_pct: {
    fieldName: 'student_retention_rate_pct', higherIsBetter: true, bandSource: 'q1_3 (exact)', authored: false,
    bands: [{ max: 60, weight: 10 }, { max: 70, weight: 7 }, { max: 80, weight: 5 }, { max: 90, weight: 3 }, { max: Infinity, weight: 1 }]
  },
  // --- student_attrition ---
  midyear_dropout_rate_pct: {
    fieldName: 'midyear_dropout_rate_pct', higherIsBetter: false, bandSource: 'q2_1 (exact)', authored: false,
    bands: [{ max: 2, weight: 1 }, { max: 5, weight: 3 }, { max: 8, weight: 5 }, { max: 12, weight: 7 }, { max: Infinity, weight: 10 }]
  },
  outflow_to_competitors_pct: {
    fieldName: 'outflow_to_competitors_pct', higherIsBetter: false, bandSource: 'q2_3 (exact)', authored: false,
    bands: [{ max: 2, weight: 1 }, { max: 5, weight: 3 }, { max: 10, weight: 5 }, { max: 15, weight: 8 }, { max: Infinity, weight: 10 }]
  },
  // --- fee_collection_challenges ---
  fee_realization_rate_pct: {
    fieldName: 'fee_realization_rate_pct', higherIsBetter: true, bandSource: 'q3_1 (exact)', authored: false,
    bands: [{ max: 75, weight: 10 }, { max: 85, weight: 7 }, { max: 90, weight: 4 }, { max: 95, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  days_sales_outstanding: {
    fieldName: 'days_sales_outstanding', higherIsBetter: false, bandSource: 'q3_2 (analogous — payment delay bands, days instead of qualitative)', authored: true,
    bands: [{ max: 0, weight: 1 }, { max: 30, weight: 2 }, { max: 60, weight: 4 }, { max: 90, weight: 7 }, { max: Infinity, weight: 10 }]
  },
  // --- teacher_attrition ---
  teacher_turnover_rate_pct: {
    fieldName: 'teacher_turnover_rate_pct', higherIsBetter: false, bandSource: 'q4_1 (exact)', authored: false,
    bands: [{ max: 5, weight: 1 }, { max: 10, weight: 2 }, { max: 15, weight: 4 }, { max: 25, weight: 7 }, { max: Infinity, weight: 10 }]
  },
  avg_teacher_tenure_years: {
    fieldName: 'avg_teacher_tenure_years', higherIsBetter: true, bandSource: 'q4_3 (exact)', authored: false,
    bands: [{ max: 3, weight: 10 }, { max: 5, weight: 7 }, { max: 7, weight: 4 }, { max: 10, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  // --- staff_capability_gaps ---
  teacher_competency_score_pct: {
    fieldName: 'teacher_competency_score_pct', higherIsBetter: true, bandSource: 'authored (no direct competency-score question; banded like q5_1)', authored: true,
    bands: [{ max: 50, weight: 10 }, { max: 70, weight: 6 }, { max: 80, weight: 4 }, { max: 90, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  professional_qualification_pct: {
    fieldName: 'professional_qualification_pct', higherIsBetter: true, bandSource: 'q5_1 (exact)', authored: false,
    bands: [{ max: 50, weight: 10 }, { max: 70, weight: 6 }, { max: 80, weight: 4 }, { max: 90, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  // --- leadership_capability_gap ---
  leadership_competency_score_pct: {
    fieldName: 'leadership_competency_score_pct', higherIsBetter: true, bandSource: 'authored (no direct competency-score question)', authored: true,
    bands: [{ max: 50, weight: 10 }, { max: 70, weight: 7 }, { max: 80, weight: 4 }, { max: 90, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  principal_vp_experience_years: {
    fieldName: 'principal_vp_experience_years', higherIsBetter: true, bandSource: 'q6_1 (exact)', authored: false,
    bands: [{ max: 3, weight: 10 }, { max: 7, weight: 5 }, { max: 10, weight: 3 }, { max: 15, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  // --- academic_quality_decline ---
  board_exam_pass_rate_pct: {
    fieldName: 'board_exam_pass_rate_pct', higherIsBetter: true, bandSource: 'q7_1 (exact)', authored: false,
    bands: [{ max: 70, weight: 10 }, { max: 85, weight: 5 }, { max: 90, weight: 3 }, { max: 95, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  average_subject_score_pct: {
    fieldName: 'average_subject_score_pct', higherIsBetter: true, bandSource: 'q7_3 (analogous — % scoring 70%+ used as proxy)', authored: true,
    bands: [{ max: 30, weight: 10 }, { max: 50, weight: 7 }, { max: 70, weight: 4 }, { max: 80, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  // --- student_wellbeing_issues ---
  mental_health_incidents_per_1000: {
    fieldName: 'mental_health_incidents_per_1000', higherIsBetter: false, bandSource: 'authored (q8_1 is qualitative, no per-1000 figure given)', authored: true,
    bands: [{ max: 5, weight: 1 }, { max: 15, weight: 3 }, { max: 30, weight: 5 }, { max: 50, weight: 8 }, { max: Infinity, weight: 10 }]
  },
  safety_violations_count_year: {
    fieldName: 'safety_violations_count_year', higherIsBetter: false, bandSource: 'authored (q8_2/q8_3 are qualitative)', authored: true,
    bands: [{ max: 0, weight: 1 }, { max: 2, weight: 3 }, { max: 5, weight: 5 }, { max: 10, weight: 8 }, { max: Infinity, weight: 10 }]
  },
  // --- remedial_lag ---
  remedial_support_coverage_pct: {
    fieldName: 'remedial_support_coverage_pct', higherIsBetter: true, bandSource: 'q9_1 (exact)', authored: false,
    bands: [{ max: 25, weight: 10 }, { max: 50, weight: 7 }, { max: 75, weight: 4 }, { max: 90, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  improvement_rate_pct: {
    fieldName: 'improvement_rate_pct', higherIsBetter: true, bandSource: 'q9_2 (exact)', authored: false,
    bands: [{ max: 10, weight: 10 }, { max: 30, weight: 7 }, { max: 50, weight: 4 }, { max: 70, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  // --- parent_communication_issues ---
  parent_satisfaction_score_pct: {
    fieldName: 'parent_satisfaction_score_pct', higherIsBetter: true, bandSource: 'q10_1 (exact)', authored: false,
    bands: [{ max: 25, weight: 10 }, { max: 50, weight: 7 }, { max: 75, weight: 4 }, { max: 90, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  parent_response_rate_pct: {
    fieldName: 'parent_response_rate_pct', higherIsBetter: true, bandSource: 'authored (q10_2 measures hours, not % within SLA; banded like q10_1)', authored: true,
    bands: [{ max: 25, weight: 10 }, { max: 50, weight: 7 }, { max: 75, weight: 4 }, { max: 90, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  // --- competitive_pressure ---
  market_share_loss_pct: {
    fieldName: 'market_share_loss_pct', higherIsBetter: false, bandSource: 'q11_2 (exact)', authored: false,
    bands: [{ max: 0, weight: 1 }, { max: 2, weight: 2 }, { max: 5, weight: 4 }, { max: 10, weight: 7 }, { max: Infinity, weight: 10 }]
  },
  competitor_win_rate_pct: {
    fieldName: 'competitor_win_rate_pct', higherIsBetter: false, bandSource: 'authored (q11_1 is a qualitative intensity scale)', authored: true,
    bands: [{ max: 10, weight: 1 }, { max: 20, weight: 3 }, { max: 30, weight: 5 }, { max: 50, weight: 8 }, { max: Infinity, weight: 10 }]
  },
  // --- brand_reputation_issues ---
  brand_perception_score_pct: {
    fieldName: 'brand_perception_score_pct', higherIsBetter: true, bandSource: 'authored (q12_1 is qualitative; banded like other satisfaction %)', authored: true,
    bands: [{ max: 25, weight: 10 }, { max: 50, weight: 7 }, { max: 75, weight: 4 }, { max: 90, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  media_sentiment_pct: {
    fieldName: 'media_sentiment_pct', higherIsBetter: true, bandSource: 'authored (q12_2 measures frequency, not % positive)', authored: true,
    bands: [{ max: 25, weight: 10 }, { max: 50, weight: 7 }, { max: 75, weight: 4 }, { max: 90, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  // --- cost_inflation ---
  cost_increase_yoy_pct: {
    fieldName: 'cost_increase_yoy_pct', higherIsBetter: false, bandSource: 'authored (q13_1 is relative to fee increase, not an absolute %)', authored: true,
    bands: [{ max: 5, weight: 1 }, { max: 10, weight: 2 }, { max: 15, weight: 4 }, { max: 25, weight: 7 }, { max: Infinity, weight: 10 }]
  },
  operating_margin_pct: {
    fieldName: 'operating_margin_pct', higherIsBetter: true, bandSource: 'q13_2 (exact)', authored: false,
    bands: [{ max: 5, weight: 10 }, { max: 10, weight: 7 }, { max: 15, weight: 4 }, { max: 20, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  // --- infrastructure_deficits ---
  infrastructure_quality_score_pct: {
    fieldName: 'infrastructure_quality_score_pct', higherIsBetter: true,
    bandSource: 'input redefined 2026-08-31 as an RTE Act 2009 Schedule checklist compliance rate (see RTE_INFRASTRUCTURE_NORMS_CHECKLIST in challengeDataRequirements.ts) - the raw value is now externally grounded and independently auditable, not self-rated. The 25/50/75/90 grading thresholds below remain a product judgment (banded like other satisfaction %), since RTE publishes the norms themselves but not quality-grade cutoffs for how many of them "should" be met.',
    authored: true,
    bands: [{ max: 25, weight: 10 }, { max: 50, weight: 7 }, { max: 75, weight: 4 }, { max: 90, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  maintenance_backlog_inr: {
    fieldName: 'maintenance_backlog_inr', higherIsBetter: false, bandSource: 'authored (q14_2 is qualitative; absolute INR thresholds are a rough heuristic that should be scaled to school size)', authored: true,
    bands: [{ max: 100000, weight: 1 }, { max: 300000, weight: 3 }, { max: 700000, weight: 5 }, { max: 1500000, weight: 8 }, { max: Infinity, weight: 10 }]
  },
  // --- compliance_regulatory_stress ---
  compliance_score_pct: {
    fieldName: 'compliance_score_pct', higherIsBetter: true, bandSource: 'authored (q15_1 is qualitative; banded to mirror its 5 narrative levels)', authored: true,
    bands: [{ max: 50, weight: 10 }, { max: 70, weight: 7 }, { max: 85, weight: 4 }, { max: 95, weight: 2 }, { max: Infinity, weight: 1 }]
  },
  regulatory_violations_count_year: {
    fieldName: 'regulatory_violations_count_year', higherIsBetter: false, bandSource: 'authored (q15_2 is qualitative)', authored: true,
    bands: [{ max: 0, weight: 1 }, { max: 1, weight: 3 }, { max: 3, weight: 5 }, { max: 6, weight: 8 }, { max: Infinity, weight: 10 }]
  }
};

/**
 * Convert a raw uploaded metric value into a 1-10 severity weight
 * (1 = best/healthiest, 10 = worst), on the same scale as the survey
 * question weights in screeningQuestionsData.ts.
 * Returns null if the field is unknown or the value isn't numeric.
 */
export function scoreRawValueToWeight(fieldName: string, rawValue: number | string): number | null {
  const def = METRIC_BAND_DEFINITIONS[fieldName];
  if (!def) return null;
  const value = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue);
  if (isNaN(value)) return null;

  for (const band of def.bands) {
    if (value <= band.max) return band.weight;
  }
  return def.bands[def.bands.length - 1].weight;
}

/**
 * Objective severity (1-10) for one challenge, averaged across its 2
 * canonical metrics. Returns null (never a fabricated number) if neither
 * metric was found in the uploaded data.
 */
export function getChallengeObjectiveWeight(
  challengeKey: string,
  metricsFound: Record<string, number | string>
): { weight: number; metricsUsed: number; metricsExpected: number } | null {
  const req = CHALLENGE_DATA_REQUIREMENTS[challengeKey];
  if (!req) return null;

  const weights: number[] = [];
  req.requiredMetrics.forEach(m => {
    const raw = metricsFound[m.fieldName];
    if (raw !== undefined && raw !== null && String(raw).trim() !== '') {
      const w = scoreRawValueToWeight(m.fieldName, raw);
      if (w !== null) weights.push(w);
    }
  });

  if (weights.length === 0) return null;
  const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
  return {
    weight: Math.round(avg * 100) / 100,
    metricsUsed: weights.length,
    metricsExpected: req.requiredMetrics.length
  };
}

/**
 * Subjective (self-reported) severity (1-10) for one challenge, averaged
 * across whichever of that challenge's own screening questions were
 * answered. Returns null if none were answered.
 */
export function getChallengeSubjectiveWeight(
  challengeKey: string,
  answers: Record<string, string>
): { weight: number; questionsAnswered: number; questionsExpected: number } | null {
  const challenge = COMPLETE_SCREENING_QUESTIONS.find(c => c.id === challengeKey);
  if (!challenge) return null;

  const weights: number[] = [];
  challenge.questions.forEach(q => {
    const selectedValue = answers[q.id];
    const option = q.options?.find(opt => opt.value === selectedValue);
    if (option) weights.push(option.weight);
  });

  if (weights.length === 0) return null;
  const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
  return {
    weight: Math.round(avg * 100) / 100,
    questionsAnswered: weights.length,
    questionsExpected: challenge.questions.length
  };
}

export type PerceptionGapVerdict =
  | 'ALIGNED' // both sides agree this challenge is under control (both <= threshold)
  | 'DELUSIONAL_COMFORT' // leadership perceives it as fine, objective data says it's a real concern (Blind-Spot Risk / Positive Gap per the master reference doc's S_sub-M_obj convention)
  | 'HIDDEN_EXCELLENCE' // leadership perceives it as a problem, objective data says it's actually under control (Reality Better Than Perception / Negative Gap)
  | 'CONFIRMED_CRISIS' // both leadership and objective data agree it's a real concern
  | 'INSUFFICIENT_DATA'; // objective metrics not uploaded, or no screening answers given, for this challenge

export interface PerceptionGapEntry {
  challengeKey: string;
  challengeLabel: string;
  subjectiveWeight: number | null; // 1-10 (1=healthy, 10=severe), self-reported
  objectiveWeight: number | null; // 1-10 (1=healthy, 10=severe), from uploaded data
  gap: number | null; // objectiveWeight - subjectiveWeight; positive = reality more severe than perceived
  verdict: PerceptionGapVerdict;
}

// A challenge is treated as "a real concern" on either side once its weight
// exceeds the midpoint of the 1-10 severity scale. This mirrors
// DISHAScoreCalculator.classifyRiskQuadrant's own high/low split (there
// applied to S_sub/M_obj, here to this per-challenge 1-10 severity scale).
const SEVERITY_CONCERN_THRESHOLD = 5;

/**
 * Build the per-challenge Perception Gap report for whichever 3 challenges
 * are selected. This is additive to (does not replace) the core S_sub/M_obj/
 * Health Index formula, which remains driven by the 4 Core Operational
 * Levers per DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md.
 */
export function computePerceptionGapReport(
  selectedChallenges: string[],
  answers: Record<string, string>,
  metricsFound: Record<string, number | string>
): PerceptionGapEntry[] {
  return selectedChallenges.map(challengeKey => {
    const req = CHALLENGE_DATA_REQUIREMENTS[challengeKey];
    const challengeLabel = req?.challengeName || challengeKey;

    const subjective = getChallengeSubjectiveWeight(challengeKey, answers);
    const objective = getChallengeObjectiveWeight(challengeKey, metricsFound);

    if (!objective || !subjective) {
      return {
        challengeKey,
        challengeLabel,
        subjectiveWeight: subjective?.weight ?? null,
        objectiveWeight: objective?.weight ?? null,
        gap: null,
        verdict: 'INSUFFICIENT_DATA' as const
      };
    }

    const gap = Math.round((objective.weight - subjective.weight) * 100) / 100;
    const subjectiveIsConcern = subjective.weight > SEVERITY_CONCERN_THRESHOLD;
    const objectiveIsConcern = objective.weight > SEVERITY_CONCERN_THRESHOLD;

    // Clean 2x2 split (mutually exclusive, exhaustive) — no gap-threshold
    // branch is used, so there is no uncovered case between the four verdicts.
    let verdict: PerceptionGapVerdict;
    if (!subjectiveIsConcern && !objectiveIsConcern) {
      verdict = 'ALIGNED';
    } else if (subjectiveIsConcern && objectiveIsConcern) {
      verdict = 'CONFIRMED_CRISIS';
    } else if (!subjectiveIsConcern && objectiveIsConcern) {
      verdict = 'DELUSIONAL_COMFORT';
    } else {
      verdict = 'HIDDEN_EXCELLENCE';
    }

    return { challengeKey, challengeLabel, subjectiveWeight: subjective.weight, objectiveWeight: objective.weight, gap, verdict };
  });
}

export default METRIC_BAND_DEFINITIONS;

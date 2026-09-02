/**
 * Report Integrity - proof that a First Opinion report is a pure function
 * of its recorded raw inputs, not something the app "added" on top.
 *
 * Two independent guarantees, both usable by anyone without trusting this
 * app's own UI:
 *
 * 1. INPUT CHECKSUM - a SHA-256 hash of the exact raw inputs a report was
 *    generated from (selected challenges, screening answers, uploaded/
 *    checklist-derived metrics), computed with a canonical (sorted-key)
 *    JSON serialization so the same inputs always hash to the same value
 *    regardless of object insertion order. Printed on every PDF (see
 *    firstOpinionReportPdf.ts) so a school can independently hash their own
 *    original submission and confirm nothing was altered afterward.
 *
 * 2. RECOMPUTE & VERIFY - re-runs the exact same calculation pipeline
 *    (DISHAScoreCalculator, computePerceptionGapReport, generateRealInsights)
 *    used at submission time, from nothing but the stored raw inputs, and
 *    deep-compares the result against what was stored. A match proves the
 *    stored report is reproducible and the engine has not silently drifted
 *    since it was generated; a mismatch means the calculation code changed
 *    after this report was generated (see verifyCheckupAnalysis's return
 *    shape for exactly what differs).
 */

import DISHAScoreCalculator, { DISHAScore, ScreeningAnswer, OperationalMetrics } from './dishaScoreCalculator';
import { generateRealInsights, DataAnalysisResult } from './insightGenerator';
import { computePerceptionGapReport, PerceptionGapEntry } from './challengeObjectiveScoring';
import { COMPLETE_SCREENING_QUESTIONS } from '../data/screeningQuestionsData';
import type { CheckupAnalysis } from './checkupService';

export interface ReportRawInputs {
  selectedChallenges: string[];
  answers: Record<string, string>;
  extractedMetricsFound: Record<string, number | string>;
}

/**
 * Deterministic JSON serialization: object keys are sorted recursively so
 * the same logical data always produces the same string, independent of
 * the order keys happened to be inserted in (Firestore/JS object key order
 * is not something callers should ever have to rely on for a hash to be
 * stable).
 */
export function canonicalStringify(value: unknown): string {
  const sort = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(sort);
    if (v !== null && typeof v === 'object') {
      const out: Record<string, unknown> = {};
      Object.keys(v as Record<string, unknown>)
        .sort()
        .forEach((k) => {
          out[k] = sort((v as Record<string, unknown>)[k]);
        });
      return out;
    }
    return v;
  };
  return JSON.stringify(sort(value));
}

/**
 * SHA-256 hex digest of the canonical serialization of a report's raw
 * inputs. Uses the standard Web Crypto API (available in every modern
 * browser and in Node 20+, which is what both this app and its CI runner
 * use) rather than a bundled hashing library.
 */
export async function computeInputsChecksum(inputs: ReportRawInputs): Promise<string> {
  const canonical: ReportRawInputs = {
    selectedChallenges: [...inputs.selectedChallenges].sort(),
    answers: inputs.answers,
    extractedMetricsFound: inputs.extractedMetricsFound
  };
  const bytes = new TextEncoder().encode(canonicalStringify(canonical));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Rebuilds the 4 Core Operational Lever values DISHAScoreCalculator needs,
 * from the canonical Operational Metrics CSV/checklist fields - the exact
 * same field names and fallback defaults FirstOpinionPage.tsx uses when it
 * first computes a score, so a recompute from stored raw inputs takes the
 * identical path a fresh submission would.
 */
export function buildOperationalMetricsFromExtracted(
  extractedMetricsFound: Record<string, number | string>
): OperationalMetrics {
  return {
    studentTeacherRatio: (extractedMetricsFound['students_per_classroom'] as number) || 28,
    parentResponseSLA: (extractedMetricsFound['parent_query_response_sla_hours'] as number) || 24,
    annualTrainingHours: (extractedMetricsFound['annual_training_hours'] as number) || 20,
    weeklyPlanningHours: (extractedMetricsFound['weekly_planning_hours'] as number) || 4
  };
}

/** Rebuilds the {questionId, weight} list and max-possible score DISHAScoreCalculator needs, from the selected challenges' own question bank and the recorded answers - mirrors FirstOpinionPage.tsx's getRequiredQuestions()+runLocalDiagnosticCalculation exactly. */
export function buildScreeningAnswers(
  selectedChallenges: string[],
  answers: Record<string, string>
): { answersArray: ScreeningAnswer[]; maxPossible: number } {
  const answersArray: ScreeningAnswer[] = [];
  selectedChallenges.forEach((challengeKey) => {
    const challenge = COMPLETE_SCREENING_QUESTIONS.find((c) => c.id === challengeKey);
    if (!challenge) return;
    challenge.questions.forEach((q) => {
      const selectedValue = answers[q.id];
      const option = q.options?.find((opt) => opt.value === selectedValue);
      const weight = option?.weight || 5; // matches runLocalDiagnosticCalculation's own fallback
      answersArray.push({ questionId: q.id, weight });
    });
  });
  return { answersArray, maxPossible: answersArray.length * 10 };
}

/** Recomputes the DISHA Score from nothing but the raw inputs - no reference to any previously-computed value. */
export function recomputeDishaScore(inputs: ReportRawInputs): DISHAScore {
  const { answersArray, maxPossible } = buildScreeningAnswers(inputs.selectedChallenges, inputs.answers);
  const metrics = buildOperationalMetricsFromExtracted(inputs.extractedMetricsFound);
  return DISHAScoreCalculator.calculateCompleteScore(answersArray, maxPossible, metrics);
}

/** Recomputes the per-challenge Perception Gap report from nothing but the raw inputs. */
export function recomputePerceptionGap(inputs: ReportRawInputs): PerceptionGapEntry[] {
  return computePerceptionGapReport(inputs.selectedChallenges, inputs.answers, inputs.extractedMetricsFound);
}

/** Recomputes the Data-Driven Insights from nothing but the raw inputs and the recorded file type. */
export function recomputeRealInsights(inputs: ReportRawInputs, extractedFileType: string): DataAnalysisResult {
  return generateRealInsights({
    fileType: extractedFileType,
    fileName: '',
    uploadedAt: new Date(0),
    dataRows: [],
    headers: [],
    extractedMetrics: inputs.extractedMetricsFound,
    parseStatus: 'success',
    errorMessages: [],
    warnings: [],
    confidence: 100
  });
}

export interface VerificationResult {
  /** True only if every recomputed value matches the stored value exactly (and the checksum, if present, matches too). */
  verified: boolean;
  /** False only if a stored inputsChecksum exists and does not match a checksum recomputed from the stored raw inputs right now (proves the raw inputs were edited after the fact, or the record predates this feature and never got one). */
  checksumMatches: boolean | 'not_recorded';
  dishaScoreMatches: boolean;
  perceptionGapMatches: boolean;
  realInsightsMatches: boolean;
  /** Human-readable list of exactly what did not match, empty when verified is true. */
  mismatches: string[];
  recomputedChecksum: string;
}

/**
 * The core "Recompute & Verify" check: given a saved CheckupAnalysis, re-run
 * the entire calculation pipeline from its stored raw inputs and compare
 * every recomputed value against what was stored, field by field. This is
 * the mechanism behind the "Verify" badge on Past Reports - it never trusts
 * the stored dishaScore/perceptionGap/realInsights on faith, it re-derives
 * them independently and diffs.
 */
export async function verifyCheckupAnalysis(analysis: CheckupAnalysis): Promise<VerificationResult> {
  const inputs: ReportRawInputs = {
    selectedChallenges: analysis.selectedChallenges,
    answers: analysis.answers,
    extractedMetricsFound: analysis.extractedMetricsFound
  };

  const recomputedChecksum = await computeInputsChecksum(inputs);
  const checksumMatches: boolean | 'not_recorded' =
    analysis.inputsChecksum === undefined ? 'not_recorded' : analysis.inputsChecksum === recomputedChecksum;

  const recomputedScore = recomputeDishaScore(inputs);
  const recomputedGap = recomputePerceptionGap(inputs);
  const recomputedInsights = recomputeRealInsights(inputs, analysis.extractedFileType);

  const dishaScoreMatches = canonicalStringify(recomputedScore) === canonicalStringify(analysis.dishaScore);
  const perceptionGapMatches = canonicalStringify(recomputedGap) === canonicalStringify(analysis.perceptionGap);
  const realInsightsMatches = canonicalStringify(recomputedInsights) === canonicalStringify(analysis.realInsights);

  const mismatches: string[] = [];
  if (checksumMatches === false) mismatches.push('Input checksum does not match the recorded raw inputs - the stored answers/metrics may have been edited after submission.');
  if (!dishaScoreMatches) mismatches.push('Recomputed DISHA Score (S_sub/M_obj/Health Index) differs from the stored value - the scoring engine has changed since this report was generated.');
  if (!perceptionGapMatches) mismatches.push('Recomputed Perception Gap Analysis differs from the stored value - the perception-gap logic has changed since this report was generated.');
  if (!realInsightsMatches) mismatches.push('Recomputed Data-Driven Insights differ from the stored value - the insight-generation logic has changed since this report was generated.');

  return {
    verified: checksumMatches !== false && dishaScoreMatches && perceptionGapMatches && realInsightsMatches,
    checksumMatches,
    dishaScoreMatches,
    perceptionGapMatches,
    realInsightsMatches,
    mismatches,
    recomputedChecksum
  };
}

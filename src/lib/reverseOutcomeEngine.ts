/**
 * Reverse Outcome Modeling engine for the Simulate page.
 *
 * Two real, traceable calculations - no invented weights, no fictional
 * "precedent" data, no confidence-tier theater:
 *
 * 1. `computeDimensionTargetCascade` - given one desired overall objective
 *    score, splits the required point gain across the 14 dimensions in
 *    proportion to each dimension's own real headroom (100 - its current
 *    objective score). A dimension further from 100 gets a bigger share of
 *    the ask; this falls straight out of the school's own current scores,
 *    not an invented per-dimension "weight" or "difficulty" rating. This is
 *    only a *starting suggestion* - the caller is expected to let the user
 *    edit each dimension's target by hand afterward.
 *
 * 2. `simulateReverseOutcome` - given one dimension and a target score for
 *    it, greedily applies the single highest-impact remaining below-
 *    benchmark metric (recomputing the real score via
 *    `computeDimensionObjectiveScore` after every step) until the target is
 *    reached or every captured metric sits at its benchmark. Every number
 *    in the result is a direct output of the same engine that computes the
 *    report's real objective scores.
 *
 * Our real overall Health Index (`dimensionScoring.ts`) is a plain
 * equal-weighted average across dimensions - not a per-dimension percentage
 * scheme - so the cascade below is built on that same plain average.
 */
import { computeDimensionObjectiveScore, RawMetricEntry } from './objectiveScoreEngine';
import { getDimensionMetricSchema } from '../data/objectiveMetricsSchema';
import { DimensionReportCard } from './fullDiagnosticReport';

export interface DimensionCascadeEntry {
  dimensionId: string;
  dimensionName: string;
  hasObjectiveData: boolean;
  currentScore: number | null;
  suggestedTarget: number | null;
}

export interface DimensionTargetCascade {
  entries: DimensionCascadeEntry[];
  currentOverallObjective: number | null;
  dimensionsWithData: number;
  note: string;
}

export function computeDimensionTargetCascade(
  dimensionCards: DimensionReportCard[],
  desiredOverallObjective: number
): DimensionTargetCascade {
  const withData = dimensionCards.filter((c) => c.objective);
  const n = withData.length;

  if (n === 0) {
    return {
      entries: dimensionCards.map((c) => ({
        dimensionId: c.dimensionId,
        dimensionName: c.dimensionName,
        hasObjectiveData: false,
        currentScore: null,
        suggestedTarget: null,
      })),
      currentOverallObjective: null,
      dimensionsWithData: 0,
      note: 'No dimension has captured objective data yet, so there is nothing to reverse-solve from. Capture operational data first.',
    };
  }

  const currentOverallObjective =
    Math.round((withData.reduce((sum, c) => sum + c.objective!.objectiveScore, 0) / n) * 10) / 10;

  const requiredTotalPointGain = (desiredOverallObjective - currentOverallObjective) * n;
  const totalGap = withData.reduce((sum, c) => sum + Math.max(0, 100 - c.objective!.objectiveScore), 0);

  let note: string;
  if (requiredTotalPointGain <= 0) {
    note = `Target of ${desiredOverallObjective} is already at or below the current overall objective score of ${currentOverallObjective} - no auto-suggested increase applied. You can still raise individual dimension targets manually below.`;
  } else if (totalGap <= 0) {
    note = `Every dimension with captured data is already at 100 - the target cannot be reached through further metric improvement on dimensions that have no remaining headroom.`;
  } else {
    note = `Suggested per-dimension targets below split the ${requiredTotalPointGain.toFixed(1)}-point total gain needed across dimensions in proportion to each one's own gap to 100 - dimensions further behind get a larger share. Edit any dimension's target directly; the achieved overall figure recalculates live.`;
  }

  const entries: DimensionCascadeEntry[] = dimensionCards.map((c) => {
    if (!c.objective) {
      return {
        dimensionId: c.dimensionId,
        dimensionName: c.dimensionName,
        hasObjectiveData: false,
        currentScore: null,
        suggestedTarget: null,
      };
    }
    const current = c.objective.objectiveScore;
    if (requiredTotalPointGain <= 0 || totalGap <= 0) {
      return {
        dimensionId: c.dimensionId,
        dimensionName: c.dimensionName,
        hasObjectiveData: true,
        currentScore: current,
        suggestedTarget: current,
      };
    }
    const gap = Math.max(0, 100 - current);
    const share = requiredTotalPointGain * (gap / totalGap);
    const suggestedTarget = Math.min(100, Math.round(current + share));
    return {
      dimensionId: c.dimensionId,
      dimensionName: c.dimensionName,
      hasObjectiveData: true,
      currentScore: current,
      suggestedTarget,
    };
  });

  return { entries, currentOverallObjective, dimensionsWithData: n, note };
}

export interface ReverseSimulationStep {
  metricId: string;
  label: string;
  unit: string;
  fromValue: number;
  toValue: number;
  scoreBefore: number;
  scoreAfter: number;
}

export interface ReverseSimulationResult {
  dimensionId: string;
  currentScore: number;
  targetScore: number;
  maxAchievableScore: number;
  achievable: boolean;
  steps: ReverseSimulationStep[];
  finalScore: number;
}

export function simulateReverseOutcome(
  dimensionId: string,
  rawValues: Record<string, RawMetricEntry | undefined>,
  targetScore: number
): ReverseSimulationResult | null {
  const schema = getDimensionMetricSchema(dimensionId);
  if (!schema || schema.metrics.length === 0) return null;

  const currentScore = computeDimensionObjectiveScore(dimensionId, rawValues).objectiveScore;

  const maxRawValues: Record<string, RawMetricEntry | undefined> = { ...rawValues };
  for (const def of schema.metrics) {
    const entry = rawValues[def.id];
    if (entry) maxRawValues[def.id] = { value: def.benchmark, source: entry.source };
  }
  const maxAchievableScore = computeDimensionObjectiveScore(dimensionId, maxRawValues).objectiveScore;
  const achievable = targetScore <= maxAchievableScore;

  const workingValues: Record<string, RawMetricEntry | undefined> = { ...rawValues };
  const remaining = new Set(
    schema.metrics
      .filter((def) => {
        const entry = rawValues[def.id];
        if (!entry) return false;
        return def.direction === 'higher_better' ? entry.value < def.benchmark : entry.value > def.benchmark;
      })
      .map((def) => def.id)
  );

  const steps: ReverseSimulationStep[] = [];
  let runningScore = currentScore;

  while (runningScore < targetScore && remaining.size > 0) {
    let bestDefId: string | null = null;
    let bestScore = runningScore;

    for (const defId of remaining) {
      const def = schema.metrics.find((d) => d.id === defId)!;
      const entry = workingValues[defId]!;
      const candidateValues = { ...workingValues, [defId]: { value: def.benchmark, source: entry.source } };
      const candidateScore = computeDimensionObjectiveScore(dimensionId, candidateValues).objectiveScore;
      if (candidateScore > bestScore) {
        bestScore = candidateScore;
        bestDefId = defId;
      }
    }

    if (!bestDefId) break;

    const bestDef = schema.metrics.find((d) => d.id === bestDefId)!;
    const entry = workingValues[bestDefId]!;
    steps.push({
      metricId: bestDef.id,
      label: bestDef.label,
      unit: bestDef.unit,
      fromValue: entry.value,
      toValue: bestDef.benchmark,
      scoreBefore: runningScore,
      scoreAfter: bestScore,
    });

    workingValues[bestDefId] = { value: bestDef.benchmark, source: entry.source };
    remaining.delete(bestDefId);
    runningScore = bestScore;
  }

  return {
    dimensionId,
    currentScore,
    targetScore,
    maxAchievableScore,
    achievable,
    steps,
    finalScore: runningScore,
  };
}

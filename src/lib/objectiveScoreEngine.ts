/**
 * Turns raw operational metric values into a 0-100 objective score per live
 * dimension. Output objects structurally satisfy the `DimensionObjectiveScore`
 * shape `gapAnalyzer.ts` already expects, so `analyzeGaps()` can be reused
 * unmodified against these scores.
 */
import { DimensionObjectiveScore, ObjectiveMetric } from './objectiveMetricsCalculator';
import { FOURTEEN_DIMENSIONS, getDimensionById } from '../data/14DimensionsQuestions';
import { ObjectiveMetricDefinition, getDimensionMetricSchema } from '../data/objectiveMetricsSchema';

function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeMetricScore(value: number, definition: ObjectiveMetricDefinition): number {
  if (definition.direction === 'higher_better') {
    if (definition.benchmark <= 0) return value > 0 ? 100 : 0;
    return clamp(0, 100, (value / definition.benchmark) * 100);
  }
  // lower_better: a value at or below the benchmark scores 100
  if (value <= 0) return 100;
  return clamp(0, 100, (definition.benchmark / value) * 100);
}

export function computeDimensionObjectiveScore(
  dimensionId: string,
  rawValues: Record<string, number | undefined>
): DimensionObjectiveScore {
  const schema = getDimensionMetricSchema(dimensionId);
  const dimensionName = getDimensionById(dimensionId)?.name || dimensionId;

  if (!schema || schema.metrics.length === 0) {
    return {
      dimensionId,
      dimensionName,
      category: '',
      objectiveScore: 0,
      metrics: [],
      dataCompleteness: 0,
      confidence: 0,
      lastUpdated: new Date(),
    };
  }

  const metrics: ObjectiveMetric[] = [];
  let weightedScoreSum = 0;
  let weightedScoreWeight = 0;
  let providedCount = 0;
  let requiredProvided = 0;
  let requiredTotal = 0;
  let optionalProvided = 0;
  let optionalTotal = 0;

  for (const def of schema.metrics) {
    if (def.required) requiredTotal++;
    else optionalTotal++;

    const rawValue = rawValues[def.id];
    if (rawValue == null || Number.isNaN(rawValue)) continue;

    providedCount++;
    if (def.required) requiredProvided++;
    else optionalProvided++;

    const normalized = normalizeMetricScore(rawValue, def);
    const weight = def.required ? 2 : 1;
    weightedScoreSum += normalized * weight;
    weightedScoreWeight += weight;

    const gap = rawValue - def.benchmark;
    const meetsOrBeatsBenchmark = def.direction === 'higher_better' ? rawValue >= def.benchmark : rawValue <= def.benchmark;

    metrics.push({
      name: def.label,
      value: rawValue,
      unit: def.unit,
      benchmark: def.benchmark,
      status: !meetsOrBeatsBenchmark ? 'below' : gap === 0 ? 'meets' : 'exceeds',
      gap: Math.abs(gap),
      dataQuality: 'tier1',
    });
  }

  const objectiveScore = weightedScoreWeight > 0 ? Math.round(weightedScoreSum / weightedScoreWeight) : 0;
  const dataCompleteness = Math.round((providedCount / schema.metrics.length) * 100);
  const requiredCompleteness = requiredTotal > 0 ? (requiredProvided / requiredTotal) * 100 : 100;
  const optionalCompleteness = optionalTotal > 0 ? (optionalProvided / optionalTotal) * 100 : 100;
  const confidence = providedCount > 0 ? Math.round(requiredCompleteness * 0.7 + optionalCompleteness * 0.3) : 0;

  return {
    dimensionId,
    dimensionName,
    category: '',
    objectiveScore,
    metrics,
    dataCompleteness,
    confidence,
    lastUpdated: new Date(),
  };
}

export function computeAllObjectiveScores(
  rawByDimension: Record<string, Record<string, number | undefined>>
): DimensionObjectiveScore[] {
  return FOURTEEN_DIMENSIONS.map((dim) => computeDimensionObjectiveScore(dim.id, rawByDimension[dim.id] || {}));
}

export interface ObjectiveCompletenessSummary {
  overallCompleteness: number;
  dimensionsWithAnyData: number;
  dimensionsFullyComplete: number;
  byDimension: Record<string, { completeness: number; requiredMissing: string[] }>;
}

export function computeObjectiveCompletenessSummary(scores: DimensionObjectiveScore[]): ObjectiveCompletenessSummary {
  const byDimension: Record<string, { completeness: number; requiredMissing: string[] }> = {};
  let dimensionsWithAnyData = 0;
  let dimensionsFullyComplete = 0;
  let completenessSum = 0;

  for (const score of scores) {
    const schema = getDimensionMetricSchema(score.dimensionId);
    const providedLabels = new Set(score.metrics.map((m) => m.name));
    const requiredMissing = (schema?.metrics || [])
      .filter((def) => def.required && !providedLabels.has(def.label))
      .map((def) => def.label);

    byDimension[score.dimensionId] = {
      completeness: score.dataCompleteness,
      requiredMissing,
    };

    if (score.dataCompleteness > 0) dimensionsWithAnyData++;
    if (score.dataCompleteness === 100) dimensionsFullyComplete++;
    completenessSum += score.dataCompleteness;
  }

  return {
    overallCompleteness: scores.length > 0 ? Math.round(completenessSum / scores.length) : 0,
    dimensionsWithAnyData,
    dimensionsFullyComplete,
    byDimension,
  };
}

/**
 * Turns raw operational metric values into a 0-100 objective score per live
 * dimension. Output objects structurally satisfy the `DimensionObjectiveScore`
 * shape `gapAnalyzer.ts` already expects, so `analyzeGaps()` can be reused
 * unmodified against these scores.
 */
import { DimensionObjectiveScore, ObjectiveMetric } from './objectiveMetricsCalculator';
import { FOURTEEN_DIMENSIONS, getDimensionById } from '../data/14DimensionsQuestions';
import { ObjectiveMetricDefinition, ObjectiveDataSource, getDimensionMetricSchema } from '../data/objectiveMetricsSchema';

export interface RawMetricEntry {
  value: number;
  source: ObjectiveDataSource;
}

function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Maps how a value was captured to a data-confidence tier. There's no real
 * ERP/system sync in this app yet, so 'tier1' is reserved for that future
 * capability - today's two real sources cap out at 'tier2' (uploaded from a
 * file, reviewed by the admin before saving) and 'tier3' (typed directly,
 * unverified).
 */
function mapSourceToTier(source: ObjectiveDataSource): 'tier1' | 'tier2' | 'tier3' {
  return source === 'upload' ? 'tier2' : 'tier3';
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
  rawValues: Record<string, RawMetricEntry | undefined>
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

    const entry = rawValues[def.id];
    if (entry == null || Number.isNaN(entry.value)) continue;
    const rawValue = entry.value;

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
      dataQuality: mapSourceToTier(entry.source),
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

export interface DataConfidenceSummary {
  level: 'High' | 'Medium' | 'Lower' | 'Mixed';
  sourceSummary: 'System-Synced' | 'Uploaded' | 'Manual' | 'Mixed';
  description: string;
}

export interface DataConfidenceTierInfo {
  tier: 'tier1' | 'tier2' | 'tier3';
  label: string;
  trust: string;
  description: string;
  example: string;
  available: boolean;
}

/**
 * Shared explainer content for the three data-confidence tiers, used by
 * both the on-screen report and the PDF's methodology appendix so the two
 * never drift into describing the tiers differently.
 */
export const DATA_CONFIDENCE_TIER_INFO: DataConfidenceTierInfo[] = [
  {
    tier: 'tier1',
    label: 'System-Synced',
    trust: 'Highest trust - not yet available',
    description:
      'Reserved for a future direct connection to a school ERP/management system, where a metric would sync automatically rather than being typed or uploaded by a person. No dimension can reach this tier on the platform today.',
    example: '(Not yet available on this platform)',
    available: false,
  },
  {
    tier: 'tier2',
    label: 'Uploaded',
    trust: 'Medium trust',
    description:
      'The value came from an Excel/CSV file the admin uploaded and reviewed before saving - a document exists behind the number, and a person confirmed it before it was recorded.',
    example: 'Board exam pass rate read from an uploaded results sheet.',
    available: true,
  },
  {
    tier: 'tier3',
    label: 'Manual',
    trust: 'Lower trust, unverified',
    description:
      'The value was typed directly into a form field with no supporting document attached. It may well be accurate, but there is nothing on record to verify it against.',
    example: 'Teacher attrition rate estimated and typed in from memory.',
    available: true,
  },
];

export const DATA_CONFIDENCE_USAGE_NOTE =
  "A dimension's overall confidence label (High/Medium/Lower/Mixed) reflects the mix of tiers across that dimension's captured metrics - Mixed means some metrics were uploaded and others typed manually. Treat Lower-confidence numbers as directional rather than exact, verify them before high-stakes decisions, and upload the source file for a metric where possible to raise it from Lower to Medium confidence.";

/**
 * Summarizes a dimension's data-confidence tier distribution into a single
 * label, for display (report UI, PDF, CSV export) - centralized here so all
 * three consumers agree on what "High/Medium/Lower/Mixed" means.
 */
export function summarizeDataConfidence(metrics: { dataQuality: 'tier1' | 'tier2' | 'tier3' }[]): DataConfidenceSummary | null {
  if (metrics.length === 0) return null;
  const counts = { tier1: 0, tier2: 0, tier3: 0 };
  for (const m of metrics) counts[m.dataQuality]++;

  if (counts.tier1 === metrics.length) {
    return { level: 'High', sourceSummary: 'System-Synced', description: 'Data confidence: High - all metrics system-synced.' };
  }
  if (counts.tier2 === metrics.length) {
    return {
      level: 'Medium',
      sourceSummary: 'Uploaded',
      description: 'Data confidence: Medium - all metrics uploaded from a file and reviewed.',
    };
  }
  if (counts.tier3 === metrics.length) {
    return { level: 'Lower', sourceSummary: 'Manual', description: 'Data confidence: Lower - all metrics entered manually, unverified.' };
  }
  return {
    level: 'Mixed',
    sourceSummary: 'Mixed',
    description: 'Data confidence: Mixed - some metrics uploaded/reviewed, some entered manually.',
  };
}

export function computeAllObjectiveScores(
  rawByDimension: Record<string, Record<string, RawMetricEntry | undefined>>
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

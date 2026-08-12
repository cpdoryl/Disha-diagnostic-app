/**
 * Assembles the full diagnostic report bundle consumed by the report UI and
 * PDF export: subjective survey scores (reused as-is from dimensionScoring),
 * benchmark + detailed analysis prose, objective operational scores (if any
 * data has been captured), and a perception-vs-reality gap analysis via the
 * existing (unmodified) gapAnalyzer.
 *
 * Every generated analysis paragraph is deliberately written to show its
 * work - the numbers it's reading, the calculation it ran, and the
 * reasoning it drew from that - rather than stating a bare conclusion, so a
 * reader can verify or challenge the reasoning instead of just trusting it.
 */
import { computeDiagnosticReport, getHealthStatus, DiagnosticReportData } from './dimensionScoring';
import { loadObjectiveDataForEvent } from './objectiveDataService';
import {
  computeAllObjectiveScores,
  computeObjectiveCompletenessSummary,
  computeDimensionObjectiveScore,
  ObjectiveCompletenessSummary,
  RawMetricEntry,
} from './objectiveScoreEngine';
import { analyzeGaps, GapAnalysisResult, PerceptionRealityGap } from './gapAnalyzer';
import { DimensionObjectiveScore } from './objectiveMetricsCalculator';
import {
  buildDetailedAnalysis,
  getSubjectiveBenchmark,
  SUBJECTIVE_BENCHMARK_DATASET_META,
} from '../data/dimensionBenchmarks';
import { OBJECTIVE_BENCHMARK_DATASET_META, getDimensionMetricSchema } from '../data/objectiveMetricsSchema';
import { BenchmarkDatasetMeta } from '../data/benchmarkMeta';
import { FOURTEEN_DIMENSIONS } from '../data/14DimensionsQuestions';
import { classifyQuadrants, QuadrantAnalysisResult } from './quadrantAnalysis';

export interface DimensionReportCard {
  dimensionId: string;
  dimensionName: string;
  subjective: {
    average: number | null;
    index: number | null;
    status: ReturnType<typeof getHealthStatus>;
    responseCount: number;
  };
  benchmark: number;
  deltaFromBenchmark: number | null;
  detailedAnalysis: string[];
  perceptionRealityAnalysis: string[];
  objective: DimensionObjectiveScore | null;
  objectiveUpdatedAt: Date | null;
  gap: PerceptionRealityGap | null;
  rootCause: string[];
  actionablePoints: string[];
}

export interface FullDiagnosticReportData {
  assessmentId: string;
  schoolName: string;
  eventName: string;
  generatedAt: Date;
  subjective: DiagnosticReportData;
  dimensionCards: DimensionReportCard[];
  gapAnalysis: GapAnalysisResult | null;
  quadrantAnalysis: QuadrantAnalysisResult;
  objectiveCompleteness: ObjectiveCompletenessSummary;
  executiveSummary: string[];
  benchmarkSources: {
    subjective: BenchmarkDatasetMeta;
    objective: BenchmarkDatasetMeta;
  };
}

export async function assembleFullDiagnosticReport(
  assessmentId: string,
  schoolName: string,
  eventName: string
): Promise<FullDiagnosticReportData> {
  const subjective = await computeDiagnosticReport(assessmentId);
  const rawObjective = await loadObjectiveDataForEvent(assessmentId);

  const rawByDimension: Record<string, Record<string, RawMetricEntry | undefined>> = {};
  for (const [dimensionId, data] of Object.entries(rawObjective)) {
    rawByDimension[dimensionId] = data.metrics;
  }
  const objectiveScores = computeAllObjectiveScores(rawByDimension);
  const objectiveCompleteness = computeObjectiveCompletenessSummary(objectiveScores);

  // Only compare dimensions that actually have data on both sides - a
  // dimension with zero objective data would otherwise read as a 100-point
  // "underestimation" gap, which isn't a real finding.
  const subjectiveForGap = subjective.dimensions
    .filter((d) => d.index != null)
    .map((d) => ({ id: d.dimensionId, name: d.dimensionName, score: d.index as number }));
  const objectiveForGap = objectiveScores.filter((s) => s.dataCompleteness > 0);

  const gapAnalysis =
    subjectiveForGap.length > 0 && objectiveForGap.length > 0
      ? analyzeGaps(subjectiveForGap, objectiveForGap, schoolName)
      : null;

  const dimensionCards: DimensionReportCard[] = FOURTEEN_DIMENSIONS.map((dim) => {
    const subjectiveRow = subjective.dimensions.find((d) => d.dimensionId === dim.id);
    const objective = objectiveScores.find((s) => s.dimensionId === dim.id) || null;
    const objectiveHasData = objective && objective.dataCompleteness > 0 ? objective : null;
    const benchmark = getSubjectiveBenchmark(dim.id);
    const index = subjectiveRow?.index ?? null;
    const average = subjectiveRow?.average ?? null;
    const responseCount = subjectiveRow?.responseCount ?? 0;
    const gap = gapAnalysis?.totalGaps.find((g) => g.dimensionId === dim.id) ?? null;
    const dimensionRawValues = rawByDimension[dim.id] || {};

    const detailedAnalysis = buildDetailedAnalysis(
      dim.id,
      dim.name,
      index,
      average,
      responseCount,
      subjectiveRow?.byStakeholder || {}
    );
    const perceptionRealityAnalysis = buildPerceptionRealityAnalysis(
      dim.name,
      index,
      average,
      responseCount,
      benchmark,
      objectiveHasData,
      gap
    );
    const rootCause = buildRootCauseAnalysis(dim.name, objectiveHasData, gap);
    const actionablePoints = buildActionableRecommendations(
      dim.id,
      dim.name,
      dimensionRawValues,
      objectiveHasData,
      gap
    );

    return {
      dimensionId: dim.id,
      dimensionName: dim.name,
      subjective: {
        average,
        index,
        status: getHealthStatus(index),
        responseCount,
      },
      benchmark,
      deltaFromBenchmark: index != null ? index - benchmark : null,
      detailedAnalysis,
      perceptionRealityAnalysis,
      objective: objectiveHasData,
      objectiveUpdatedAt: rawObjective[dim.id]?.updatedAt ?? null,
      gap,
      rootCause,
      actionablePoints,
    };
  });

  const executiveSummary = buildExecutiveSummary(subjective, dimensionCards, gapAnalysis, objectiveCompleteness);
  const quadrantAnalysis = classifyQuadrants(dimensionCards);

  return {
    assessmentId,
    schoolName,
    eventName,
    generatedAt: new Date(),
    subjective,
    dimensionCards,
    gapAnalysis,
    quadrantAnalysis,
    objectiveCompleteness,
    executiveSummary,
    benchmarkSources: {
      subjective: SUBJECTIVE_BENCHMARK_DATASET_META,
      objective: OBJECTIVE_BENCHMARK_DATASET_META,
    },
  };
}

function buildExecutiveSummary(
  subjective: DiagnosticReportData,
  dimensionCards: DimensionReportCard[],
  gapAnalysis: GapAnalysisResult | null,
  objectiveCompleteness: ObjectiveCompletenessSummary
): string[] {
  const summary: string[] = [];
  const overallStatus = getHealthStatus(subjective.overallIndex);

  summary.push(
    subjective.overallIndex != null
      ? `Overall Institutional Health Index is ${subjective.overallIndex}/100 (${overallStatus.label}), based on ${subjective.totalResponses} stakeholder response${subjective.totalResponses === 1 ? '' : 's'} across 14 dimensions.`
      : 'No survey responses have been recorded yet, so an overall index cannot be computed.'
  );

  const strongCount = dimensionCards.filter((c) => c.subjective.status.label === 'Strong').length;
  const atRiskCount = dimensionCards.filter((c) => c.subjective.status.label === 'At Risk').length;
  if (strongCount > 0 || atRiskCount > 0) {
    summary.push(
      `${strongCount} dimension${strongCount === 1 ? '' : 's'} rated Strong; ${atRiskCount} dimension${atRiskCount === 1 ? '' : 's'} rated At Risk and need urgent attention.`
    );
  }

  if (gapAnalysis) {
    summary.push(
      `Perception-reality comparison across ${gapAnalysis.totalGaps.length} dimension${gapAnalysis.totalGaps.length === 1 ? '' : 's'} with objective data: ${gapAnalysis.summary.alignedDimensions.length} aligned, ${gapAnalysis.summary.overestimatedDimensions.length} overestimated by stakeholders, ${gapAnalysis.summary.underestimatedDimensions.length} underestimated.`
    );
    if (gapAnalysis.insights.length > 0) {
      summary.push(gapAnalysis.insights[0]);
    }
  } else {
    summary.push(
      'No objective operational data has been captured yet, so perception-vs-reality gap analysis is not yet available.'
    );
  }

  summary.push(
    `Objective data completeness across all 14 dimensions: ${objectiveCompleteness.overallCompleteness}% (${objectiveCompleteness.dimensionsWithAnyData}/14 dimensions have at least some data).`
  );

  return summary;
}

/**
 * Explicitly walks through the perception-vs-reality comparison for a
 * dimension: what the survey says, what the operational data says, the
 * exact subtraction that produces the gap, and the threshold used to
 * classify it - so the classification is checkable, not just asserted.
 */
function buildPerceptionRealityAnalysis(
  dimensionName: string,
  index: number | null,
  average: number | null,
  responseCount: number,
  benchmark: number,
  objective: DimensionObjectiveScore | null,
  gap: PerceptionRealityGap | null
): string[] {
  const lines: string[] = [];

  if (index == null) {
    lines.push(`No survey responses have been recorded yet for ${dimensionName}, so stakeholder perception cannot be established for this comparison.`);
    return lines;
  }

  lines.push(
    `Perception (survey): ${responseCount} respondent${responseCount === 1 ? '' : 's'} rated ${dimensionName} at an average of ${average != null ? average.toFixed(2) : 'N/A'}/5, rescaled to an index of ${index}/100, against a benchmark index of ${benchmark}/100 for this dimension.`
  );

  if (!objective) {
    lines.push(
      `Reality (operational data): not yet captured for this dimension. Without independent operational data there is nothing to compare this ${index}/100 perception against, so it is not yet possible to say whether it reflects reality or not - capture operational data for this dimension to enable that comparison.`
    );
    return lines;
  }

  lines.push(
    `Reality (operational data): ${objective.metrics.length} metric${objective.metrics.length === 1 ? '' : 's'} captured (${objective.dataCompleteness}% of this dimension's defined metrics), producing an objective score of ${objective.objectiveScore}/100.`
  );

  if (gap) {
    const classification =
      gap.interpretation === 'alignment'
        ? 'aligned'
        : gap.interpretation === 'overestimation'
          ? 'an overestimation (perception higher than reality)'
          : 'an underestimation (perception lower than reality)';
    lines.push(
      `Comparison: ${index} (perception) minus ${objective.objectiveScore} (reality) = ${gap.gap > 0 ? '+' : ''}${gap.gap.toFixed(1)} points. Gaps within plus-or-minus 5 points are classified as aligned; this gap is classified as ${classification}.`
    );
    lines.push(gap.insight);
  }

  return lines;
}

/**
 * Root cause analysis: shows the full set of captured evidence (not only
 * the metrics that look bad), then explicitly reasons from that evidence to
 * which metrics are most likely driving the objective score, and
 * cross-checks that against the perception-reality gap to distinguish an
 * operational problem from a visibility/communication one.
 */
function buildRootCauseAnalysis(
  dimensionName: string,
  objective: DimensionObjectiveScore | null,
  gap: PerceptionRealityGap | null
): string[] {
  const rootCause: string[] = [];

  if (!objective) {
    rootCause.push(
      `Root cause cannot yet be determined from data for ${dimensionName}: no objective operational metrics have been captured for this dimension. Only stakeholder perception is available, which reflects opinion rather than a verifiable operational measurement - capture operational data to enable this analysis.`
    );
    return rootCause;
  }

  const evidenceLines = objective.metrics.map((m) => `${m.name}: ${m.value}${m.unit} (benchmark ${m.benchmark}${m.unit}, ${m.status})`);
  rootCause.push(
    `Evidence captured for this dimension (${objective.metrics.length} metric${objective.metrics.length === 1 ? '' : 's'}): ${evidenceLines.join('; ')}.`
  );

  const below = objective.metrics.filter((m) => m.status === 'below');
  const strong = objective.metrics.filter((m) => m.status === 'meets' || m.status === 'exceeds');

  if (below.length > 0) {
    rootCause.push(
      `Reasoning: ${below.length} of ${objective.metrics.length} metric${objective.metrics.length === 1 ? '' : 's'} sit below benchmark (${below.map((m) => m.name).join(', ')}), while ${strong.length} meet or exceed benchmark. Because the objective score is a weighted average across all captured metrics, the below-benchmark metrics listed above are what is pulling this dimension's objective score down - they are the most probable operational root cause, distinct from the metrics that are already at or above benchmark.`
    );
  } else {
    rootCause.push(
      `Reasoning: every captured metric for this dimension meets or exceeds its benchmark, so no captured operational metric is pulling the objective score down. If a weakness is still perceived here, it is more likely a communication or awareness issue than an operational one - see the perception-reality comparison above.`
    );
  }

  if (gap) {
    const gapMagnitude = Math.abs(gap.gap).toFixed(1);
    if (gap.interpretation === 'underestimation') {
      rootCause.push(
        `Cross-checking against perception: stakeholders rate this dimension at ${gap.subjectiveScore}/100, ${gapMagnitude} points below the objective score of ${gap.objectiveScore}/100 computed from the evidence above. Because the underlying data does not show comparable weakness, the more likely explanation is a visibility gap - stakeholders may be unaware of, or discounting, the operational performance shown above - rather than an operational failure.`
      );
    } else if (gap.interpretation === 'overestimation') {
      rootCause.push(
        `Cross-checking against perception: stakeholders rate this dimension at ${gap.subjectiveScore}/100, ${gapMagnitude} points above the objective score of ${gap.objectiveScore}/100 computed from the evidence above. Because perception is running ahead of the data, the more likely explanation is that stakeholders are extrapolating from partial visibility or past reputation rather than current operational performance.`
      );
    } else {
      rootCause.push(
        `Cross-checking against perception: stakeholders rate this dimension at ${gap.subjectiveScore}/100, within ${gapMagnitude} points of the objective score of ${gap.objectiveScore}/100 - perception and the underlying data are consistent with each other for this dimension.`
      );
    }
  }

  return rootCause;
}

/**
 * Actionable recommendations as ranked, data-simulated choices rather than
 * commands: for each below-benchmark metric, re-runs the real scoring
 * engine with that one metric hypothetically moved to its benchmark (all
 * others held constant) to show the actual projected score impact, so the
 * "prediction" is a real simulation rather than a fabricated claim.
 */
function buildActionableRecommendations(
  dimensionId: string,
  dimensionName: string,
  rawValues: Record<string, RawMetricEntry | undefined>,
  objective: DimensionObjectiveScore | null,
  gap: PerceptionRealityGap | null
): string[] {
  const points: string[] = [];

  if (!objective) {
    points.push(
      `Capture operational data for ${dimensionName} first. Until then, any recommendation here would be a guess rather than a data-grounded choice - the platform will simulate specific, ranked options once metrics are captured.`
    );
    return points;
  }

  const schema = getDimensionMetricSchema(dimensionId);
  const belowBenchmarkDefs = (schema?.metrics || []).filter((def) => {
    const entry = rawValues[def.id];
    if (!entry) return false;
    return def.direction === 'higher_better' ? entry.value < def.benchmark : entry.value > def.benchmark;
  });

  const simulations = belowBenchmarkDefs
    .map((def) => {
      const entry = rawValues[def.id]!;
      const simulatedRawValues: Record<string, RawMetricEntry | undefined> = {
        ...rawValues,
        [def.id]: { value: def.benchmark, source: entry.source },
      };
      const simulatedScore = computeDimensionObjectiveScore(dimensionId, simulatedRawValues);
      return {
        label: def.label,
        unit: def.unit,
        currentValue: entry.value,
        benchmark: def.benchmark,
        impact: simulatedScore.objectiveScore - objective.objectiveScore,
      };
    })
    .sort((a, b) => b.impact - a.impact);

  if (simulations.length > 0) {
    points.push(
      `Improvement options for this dimension, ranked by projected impact on the objective score (each simulated by moving that one metric to its benchmark while holding every other captured metric constant):`
    );
    for (const sim of simulations.slice(0, 4)) {
      points.push(
        `Option: raise ${sim.label} from ${sim.currentValue}${sim.unit} to the ${sim.benchmark}${sim.unit} benchmark -> projected objective score moves from ${objective.objectiveScore} to ${objective.objectiveScore + sim.impact} (${sim.impact > 0 ? '+' : ''}${sim.impact} point${Math.abs(sim.impact) === 1 ? '' : 's'}).`
      );
    }
    points.push(
      `These are independent, simulated levers - choose based on feasibility and cost, not projected impact size alone. Combining several will compound the effect beyond any single simulation shown here, since each simulation only moves one metric at a time.`
    );
  }

  if (gap) {
    if (gap.interpretation === 'underestimation') {
      points.push(
        `Separate option: since stakeholders currently rate this dimension lower than the data supports, share the metrics above directly with staff and parents - this addresses the perception gap without requiring any operational change, and can be pursued alongside or instead of the options above.`
      );
    } else if (gap.interpretation === 'overestimation') {
      points.push(
        `Separate consideration: since stakeholders currently rate this dimension higher than the data supports, treat the operational options above as the priority before further promoting this dimension - communicating strength the data doesn't yet back can erode trust once the gap becomes visible.`
      );
    }
  }

  if (points.length === 0) {
    points.push(`All captured metrics already meet or exceed benchmark - no operational option is indicated by the data; monitor periodically to confirm this holds.`);
  }

  return points;
}

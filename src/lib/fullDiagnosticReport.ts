/**
 * Assembles the full diagnostic report bundle consumed by the report UI and
 * PDF export: subjective survey scores (reused as-is from dimensionScoring),
 * benchmark + interpretation prose, objective operational scores (if any
 * data has been captured), and a perception-vs-reality gap analysis via the
 * existing (unmodified) gapAnalyzer.
 */
import { computeDiagnosticReport, getHealthStatus, DiagnosticReportData } from './dimensionScoring';
import { loadObjectiveDataForEvent } from './objectiveDataService';
import { computeAllObjectiveScores, computeObjectiveCompletenessSummary, ObjectiveCompletenessSummary } from './objectiveScoreEngine';
import { analyzeGaps, GapAnalysisResult, PerceptionRealityGap } from './gapAnalyzer';
import { DimensionObjectiveScore } from './objectiveMetricsCalculator';
import { generateSubjectiveInterpretation, getSubjectiveBenchmark } from '../data/dimensionBenchmarks';
import { FOURTEEN_DIMENSIONS } from '../data/14DimensionsQuestions';

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
  interpretation: string;
  objective: DimensionObjectiveScore | null;
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
  objectiveCompleteness: ObjectiveCompletenessSummary;
  executiveSummary: string[];
}

export async function assembleFullDiagnosticReport(
  assessmentId: string,
  schoolName: string,
  eventName: string
): Promise<FullDiagnosticReportData> {
  const subjective = await computeDiagnosticReport(assessmentId);
  const rawObjective = await loadObjectiveDataForEvent(assessmentId);

  const rawByDimension: Record<string, Record<string, number | undefined>> = {};
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
    const gap = gapAnalysis?.totalGaps.find((g) => g.dimensionId === dim.id) ?? null;
    const { rootCause, actionablePoints } = buildRootCauseAndActions(dim.name, objectiveHasData, gap);

    return {
      dimensionId: dim.id,
      dimensionName: dim.name,
      subjective: {
        average: subjectiveRow?.average ?? null,
        index,
        status: getHealthStatus(index),
        responseCount: subjectiveRow?.responseCount ?? 0,
      },
      benchmark,
      deltaFromBenchmark: index != null ? index - benchmark : null,
      interpretation: generateSubjectiveInterpretation(dim.id, dim.name, index),
      objective: objectiveHasData,
      gap,
      rootCause,
      actionablePoints,
    };
  });

  const executiveSummary = buildExecutiveSummary(subjective, dimensionCards, gapAnalysis, objectiveCompleteness);

  return {
    assessmentId,
    schoolName,
    eventName,
    generatedAt: new Date(),
    subjective,
    dimensionCards,
    gapAnalysis,
    objectiveCompleteness,
    executiveSummary,
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
 * Derives a data-driven root cause and a short list of actionable points for
 * a dimension from its objective metric statuses (which specific metrics
 * are below benchmark) and its gap interpretation (whether the mismatch is
 * a perception problem or an operational one) - not generic boilerplate.
 */
function buildRootCauseAndActions(
  dimensionName: string,
  objective: DimensionObjectiveScore | null,
  gap: PerceptionRealityGap | null
): { rootCause: string[]; actionablePoints: string[] } {
  const rootCause: string[] = [];
  const actionablePoints: string[] = [];

  if (!objective) {
    rootCause.push(
      'No objective operational data has been captured yet for this dimension, so the root cause cannot be verified against real data - only stakeholder perception is available.'
    );
    actionablePoints.push(`Capture operational data for ${dimensionName} to enable root-cause analysis.`);
    return { rootCause, actionablePoints };
  }

  const belowBenchmarkMetrics = objective.metrics.filter((m) => m.status === 'below');

  if (belowBenchmarkMetrics.length > 0) {
    rootCause.push(
      `Operational data shows ${belowBenchmarkMetrics.length} metric${belowBenchmarkMetrics.length === 1 ? '' : 's'} below benchmark: ${belowBenchmarkMetrics
        .map((m) => `${m.name} (${m.value}${m.unit} vs benchmark ${m.benchmark}${m.unit})`)
        .join('; ')}.`
    );
    for (const m of belowBenchmarkMetrics.slice(0, 3)) {
      actionablePoints.push(`Improve ${m.name}: currently ${m.value}${m.unit}, target ${m.benchmark}${m.unit}.`);
    }
  } else {
    rootCause.push('All captured operational metrics for this dimension meet or exceed benchmark.');
  }

  if (gap) {
    if (gap.interpretation === 'underestimation') {
      rootCause.push(
        `Stakeholders perceive this dimension worse (${gap.subjectiveScore}) than the operational data supports (${gap.objectiveScore}) - this points to a communication/visibility gap rather than an operational failure.`
      );
      actionablePoints.push(
        `Communicate ${dimensionName} achievements more visibly to stakeholders (newsletters, dashboards, town halls) - the underlying data is not the problem here.`
      );
    } else if (gap.interpretation === 'overestimation') {
      rootCause.push(
        `Stakeholders perceive this dimension better (${gap.subjectiveScore}) than the operational data supports (${gap.objectiveScore}) - operational reality is lagging behind perception.`
      );
      actionablePoints.push(
        `Close the gap between perception and reality in ${dimensionName} by acting on the below-benchmark metrics above before communicating further - risk of eroded trust if left unaddressed.`
      );
    } else {
      rootCause.push('Stakeholder perception is aligned with the operational data for this dimension.');
    }
  }

  if (actionablePoints.length === 0) {
    actionablePoints.push(`Maintain current practices in ${dimensionName} and monitor metrics periodically.`);
  }

  return { rootCause, actionablePoints };
}

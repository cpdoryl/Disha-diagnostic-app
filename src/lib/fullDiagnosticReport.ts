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
      gap: gapAnalysis?.totalGaps.find((g) => g.dimensionId === dim.id) ?? null,
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

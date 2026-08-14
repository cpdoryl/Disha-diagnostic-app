/**
 * Real-time data for the Monitoring page's "Live Monitoring" tab: which
 * assessment event is currently open (or, if none, the most recently
 * completed one), its live per-dimension scores, its captured board exam
 * pass rate, and real, currently-true data-collection alerts.
 */
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from './firebase';
import { listAssessmentEventsForSchool, getAssessmentEvent, AssessmentEventSummary } from './assessmentEventService';
import { computeDiagnosticReport, DiagnosticReportData } from './dimensionScoring';
import { loadObjectiveDataForEvent } from './objectiveDataService';
import {
  computeAllObjectiveScores,
  computeObjectiveCompletenessSummary,
  RawMetricEntry,
} from './objectiveScoreEngine';
import { getMetricDefinition } from '../data/objectiveMetricsSchema';
import { FOURTEEN_DIMENSIONS } from '../data/14DimensionsQuestions';
import type { StakeholderType } from './multiUserAssessment';

export interface LiveDomainScore {
  dimensionId: string;
  dimensionName: string;
  score: number | null;
  previousScore: number | null;
  trend: 'up' | 'down' | 'flat';
}

export interface LiveAlert {
  id: string;
  severity: 'warning' | 'info';
  title: string;
  message: string;
}

export interface LiveMonitoringSnapshot {
  event: AssessmentEventSummary;
  isCurrentlyCollecting: boolean;
  domainScores: LiveDomainScore[];
  boardPassRate: { value: number; benchmark: number } | null;
  alerts: LiveAlert[];
}

/** Picks the school's currently open event, or its most recently created one if none is open. */
export async function resolveMonitoredEvent(schoolId: string): Promise<AssessmentEventSummary | null> {
  const events = await listAssessmentEventsForSchool(schoolId); // newest first
  return events.find((e) => e.status === 'active') ?? events[0] ?? null;
}

function computeTrend(current: number | null, previous: number | null): 'up' | 'down' | 'flat' {
  if (current == null || previous == null) return 'flat';
  if (current - previous >= 2) return 'up';
  if (previous - current >= 2) return 'down';
  return 'flat';
}

async function loadPreviousDimensionScores(
  schoolId: string,
  currentEventId: string
): Promise<Record<string, number | null>> {
  const events = await listAssessmentEventsForSchool(schoolId); // newest first
  const currentIndex = events.findIndex((e) => e.id === currentEventId);
  const previous = events.slice(currentIndex + 1).find((e) => e.status !== 'active' && e.totalActual > 0);
  if (!previous) return {};

  const report = await computeDiagnosticReport(previous.id);
  const scores: Record<string, number | null> = {};
  for (const dim of report.dimensions) scores[dim.dimensionId] = dim.index;
  return scores;
}

/** Assembles the live snapshot from an already-computed diagnostic report (so a live listener can supply a fresh one on every response). */
export async function buildLiveSnapshot(
  schoolId: string,
  event: AssessmentEventSummary,
  report: DiagnosticReportData
): Promise<LiveMonitoringSnapshot> {
  const [rawObjective, previousScores, eventDetail] = await Promise.all([
    loadObjectiveDataForEvent(event.id),
    loadPreviousDimensionScores(schoolId, event.id),
    getAssessmentEvent(event.id),
  ]);

  const rawByDimension: Record<string, Record<string, RawMetricEntry | undefined>> = {};
  for (const [dimensionId, data] of Object.entries(rawObjective)) {
    rawByDimension[dimensionId] = data.metrics;
  }
  const objectiveScores = computeAllObjectiveScores(rawByDimension);
  const completeness = computeObjectiveCompletenessSummary(objectiveScores);

  const domainScores: LiveDomainScore[] = FOURTEEN_DIMENSIONS.map((dim) => {
    const row = report.dimensions.find((d) => d.dimensionId === dim.id);
    const score = row?.index ?? null;
    const previousScore = previousScores[dim.id] ?? null;
    return {
      dimensionId: dim.id,
      dimensionName: dim.name,
      score,
      previousScore,
      trend: computeTrend(score, previousScore),
    };
  });

  const passRateEntry = rawByDimension['academic']?.['board_exam_pass_rate'];
  const passRateDef = getMetricDefinition('academic', 'board_exam_pass_rate');
  const boardPassRate =
    passRateEntry && passRateDef ? { value: passRateEntry.value, benchmark: passRateDef.benchmark } : null;

  const alerts: LiveAlert[] = [];
  if (event.status === 'active' && eventDetail) {
    for (const [type, expected] of Object.entries(eventDetail.config.expectedRespondents) as [
      StakeholderType,
      number
    ][]) {
      if (expected <= 0) continue;
      const actual = report.responsesByStakeholder[type] || 0;
      if (actual / expected < 0.5) {
        alerts.push({
          id: `response-rate-${type}`,
          severity: 'warning',
          title: 'Response Rate Lagging',
          message: `${type[0].toUpperCase()}${type.slice(1)} responses: ${actual} of ${expected} expected (${Math.round(
            (actual / expected) * 100
          )}%).`,
        });
      }
    }
  }
  if (completeness.overallCompleteness < 100) {
    alerts.push({
      id: 'objective-data-incomplete',
      severity: 'info',
      title: 'Objective Data Incomplete',
      message: `${completeness.dimensionsWithAnyData} of ${FOURTEEN_DIMENSIONS.length} dimensions have objective data captured; ${completeness.dimensionsFullyComplete} fully complete.`,
    });
  }

  return {
    event,
    isCurrentlyCollecting: event.status === 'active',
    domainScores,
    boardPassRate,
    alerts,
  };
}

/** Re-fires the callback with a freshly computed diagnostic report whenever the event's responses change. */
export function subscribeToLiveResponses(
  eventId: string,
  onChange: (report: DiagnosticReportData) => void,
  onError: (err: unknown) => void
): () => void {
  const responsesRef = collection(db, 'assessments', eventId, 'responses');
  return onSnapshot(
    query(responsesRef),
    () => {
      computeDiagnosticReport(eventId).then(onChange).catch(onError);
    },
    onError
  );
}

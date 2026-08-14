/**
 * Builds a school's real assessment trend history: for every locked/analyzed
 * 14D assessment event on record, it recomputes that event's dimension
 * scores straight from its stored survey responses (the same aggregation
 * the diagnostic report uses), then feeds those into the existing
 * assessmentVersioning trend math. No synthetic or placeholder scores.
 */
import { listAssessmentEventsForSchool } from './assessmentEventService';
import { computeDiagnosticReport } from './dimensionScoring';
import { getSubjectiveBenchmark } from '../data/dimensionBenchmarks';
import { AssessmentVersion, AssessmentHistory, getAssessmentHistorySummary } from './assessmentVersioning';

export async function loadSchoolAssessmentHistory(
  schoolId: string,
  schoolName: string
): Promise<AssessmentHistory> {
  const events = await listAssessmentEventsForSchool(schoolId);

  // Only events that were locked (survey collection finished) have a stable,
  // final score - an in-progress 'active' event's numbers are still moving
  // and would read as false volatility in a trend line.
  const finalizedEvents = events
    .filter((event) => event.status !== 'active' && event.totalActual > 0)
    .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const versions: AssessmentVersion[] = [];
  for (const [i, event] of finalizedEvents.entries()) {
    const report = await computeDiagnosticReport(event.id);

    const scores: AssessmentVersion['scores'] = {};
    for (const dim of report.dimensions) {
      if (dim.index == null) continue;
      const benchmark = getSubjectiveBenchmark(dim.dimensionId);
      scores[dim.dimensionId] = {
        dimensionName: dim.dimensionName,
        score: dim.index,
        benchmark,
        gap: dim.index - benchmark,
      };
    }

    const date = event.lockedAt ?? event.createdAt ?? new Date();
    versions.push({
      id: event.id,
      versionNumber: i + 1,
      timestamp: date,
      dateCreated: date.toISOString().split('T')[0],
      dateFormatted: dateFormatter.format(date),
      surveyData: {},
      scores,
      schoolId,
      schoolName,
      // 'active' here is assessmentVersioning's own sentinel for "counts
      // toward trends" - unrelated to the live event's Firestore status
      // (which is already filtered to locked/analyzed above).
      status: 'active',
      completionPercentage:
        event.totalExpected > 0 ? Math.round((event.totalActual / event.totalExpected) * 100) : 0,
      totalRespondents: event.totalActual,
      assessmentType: '14d-multilateral',
      notes: event.eventName,
    });
  }

  return getAssessmentHistorySummary(versions);
}

/**
 * CSV export of the diagnostic report's dimension-level data: subjective
 * scores, benchmark/gap, objective scores, data-confidence tier, and
 * provenance - one row per dimension, for admins who want to work with the
 * numbers outside the app (spreadsheets, further analysis, board decks).
 */
import * as XLSX from 'xlsx';
import { FullDiagnosticReportData } from './fullDiagnosticReport';
import { summarizeDataConfidence } from './objectiveScoreEngine';

const HEADERS = [
  'Dimension ID',
  'Dimension Name',
  'Subjective Average (1-5)',
  'Subjective Index (0-100)',
  'Respondent Count',
  'Subjective Status',
  'Benchmark (0-100)',
  'Gap to Benchmark',
  'Objective Data Available',
  'Objective Score (0-100)',
  'Objective Data Completeness (%)',
  'Perception-Reality Gap',
  'Gap Interpretation',
  'Data Confidence Level',
  'Data Source',
  'Objective Data Last Updated',
  'Notes',
];

export function downloadDiagnosticReportCsv(report: FullDiagnosticReportData): void {
  const rows = report.dimensionCards.map((card) => {
    const confidence = card.objective ? summarizeDataConfidence(card.objective.metrics) : null;
    return [
      card.dimensionId,
      card.dimensionName,
      card.subjective.average != null ? Number(card.subjective.average.toFixed(2)) : '',
      card.subjective.index ?? '',
      card.subjective.responseCount,
      card.subjective.status.label,
      card.benchmark,
      card.deltaFromBenchmark ?? '',
      card.objective ? 'Yes' : 'No',
      card.objective?.objectiveScore ?? '',
      card.objective?.dataCompleteness ?? '',
      card.gap ? Number(card.gap.gap.toFixed(1)) : '',
      card.gap?.interpretation ?? '',
      confidence?.level ?? '',
      confidence?.sourceSummary ?? '',
      card.objectiveUpdatedAt ? card.objectiveUpdatedAt.toLocaleDateString() : '',
      card.detailedAnalysis.join(' '),
    ];
  });

  const worksheet = XLSX.utils.aoa_to_sheet([HEADERS, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

  const safeSchool = report.schoolName.replace(/[^a-z0-9]+/gi, '-');
  const safeEvent = report.eventName.replace(/[^a-z0-9]+/gi, '-');
  XLSX.writeFile(workbook, `14D-Diagnostic-Report-${safeSchool}-${safeEvent}.csv`, { bookType: 'csv' });
}

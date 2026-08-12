/**
 * Multi-sheet .xlsx export of the diagnostic report - a fuller, spreadsheet-
 * native counterpart to the single-sheet CSV export, for admins who want to
 * filter/pivot/chart the data outside the app. Reuses the same `xlsx`
 * package and multi-sheet pattern already established in
 * objectiveDataTemplate.ts (aoa_to_sheet + book_append_sheet per sheet).
 */
import * as XLSX from 'xlsx';
import { FullDiagnosticReportData } from './fullDiagnosticReport';
import { summarizeDataConfidence } from './objectiveScoreEngine';
import { QUADRANT_DEFINITIONS } from './quadrantAnalysis';
import { TIMEFRAME_LABELS } from './actionPlan';

function buildSummarySheet(report: FullDiagnosticReportData): (string | number)[][] {
  const rows: (string | number)[][] = [
    ['DISHA 14D Diagnostic Report'],
    ['School', report.schoolName],
    ['Assessment Event', report.eventName],
    ['Generated', report.generatedAt.toLocaleString()],
    ['Overall Institutional Health Index', report.subjective.overallIndex ?? ''],
    ['Total Responses', report.subjective.totalResponses],
    ['Objective Data Completeness (%)', report.objectiveCompleteness.overallCompleteness],
    ['Dimensions With Any Objective Data', report.objectiveCompleteness.dimensionsWithAnyData],
    ['Dimensions Fully Complete', report.objectiveCompleteness.dimensionsFullyComplete],
    [],
    ['Executive Summary'],
  ];
  for (const line of report.executiveSummary) rows.push([line]);
  rows.push([], ['Benchmark Data Source']);
  rows.push([
    `Survey Benchmarks (${report.benchmarkSources.subjective.version}, updated ${report.benchmarkSources.subjective.lastUpdated})`,
    report.benchmarkSources.subjective.methodology,
  ]);
  rows.push([
    `Operational Data Benchmarks (${report.benchmarkSources.objective.version}, updated ${report.benchmarkSources.objective.lastUpdated})`,
    report.benchmarkSources.objective.methodology,
  ]);
  return rows;
}

const DIMENSION_HEADERS = [
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
  'Perception-Reality Quadrant',
  'Data Confidence Level',
  'Data Source',
  'Objective Data Last Updated',
];

function buildDimensionDataSheet(report: FullDiagnosticReportData): (string | number)[][] {
  const quadrantByDimension = new Map(report.quadrantAnalysis.entries.map((e) => [e.dimensionId, e.quadrant]));
  const rows = report.dimensionCards.map((card) => {
    const confidence = card.objective ? summarizeDataConfidence(card.objective.metrics) : null;
    const quadrant = quadrantByDimension.get(card.dimensionId);
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
      quadrant ? QUADRANT_DEFINITIONS[quadrant].label : '',
      confidence?.level ?? '',
      confidence?.sourceSummary ?? '',
      card.objectiveUpdatedAt ? card.objectiveUpdatedAt.toLocaleDateString() : '',
    ];
  });
  return [DIMENSION_HEADERS, ...rows];
}

const METRIC_HEADERS = ['Dimension ID', 'Dimension Name', 'Metric', 'Value', 'Unit', 'Benchmark', 'Status', 'Data Quality'];

function buildObjectiveMetricsSheet(report: FullDiagnosticReportData): (string | number)[][] {
  const rows: (string | number)[][] = [];
  for (const card of report.dimensionCards) {
    if (!card.objective) continue;
    for (const metric of card.objective.metrics) {
      rows.push([card.dimensionId, card.dimensionName, metric.name, metric.value, metric.unit, metric.benchmark, metric.status, metric.dataQuality]);
    }
  }
  return [METRIC_HEADERS, ...rows];
}

const ACTION_PLAN_HEADERS = ['Timeframe', 'Dimension', 'Suggested Action', 'Suggested Owner Role', 'Why This Timeframe'];

function buildActionPlanSheet(report: FullDiagnosticReportData): (string | number)[][] {
  const rows = report.actionPlan.items.map((item) => [
    TIMEFRAME_LABELS[item.timeframe],
    item.dimensionName,
    item.action,
    item.ownerRole,
    item.priorityReason,
  ]);
  return [[report.actionPlan.roleDisclosure], [], ACTION_PLAN_HEADERS, ...rows];
}

export function downloadDiagnosticReportExcel(report: FullDiagnosticReportData): void {
  const workbook = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.aoa_to_sheet(buildSummarySheet(report));
  summarySheet['!cols'] = [{ wch: 45 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  const dimensionSheet = XLSX.utils.aoa_to_sheet(buildDimensionDataSheet(report));
  dimensionSheet['!cols'] = DIMENSION_HEADERS.map(() => ({ wch: 20 }));
  XLSX.utils.book_append_sheet(workbook, dimensionSheet, 'Dimension Data');

  const metricsSheet = XLSX.utils.aoa_to_sheet(buildObjectiveMetricsSheet(report));
  metricsSheet['!cols'] = METRIC_HEADERS.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Objective Metrics');

  const actionPlanSheet = XLSX.utils.aoa_to_sheet(buildActionPlanSheet(report));
  actionPlanSheet['!cols'] = [{ wch: 16 }, { wch: 26 }, { wch: 70 }, { wch: 30 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(workbook, actionPlanSheet, 'Action Plan');

  const safeSchool = report.schoolName.replace(/[^a-z0-9]+/gi, '-');
  const safeEvent = report.eventName.replace(/[^a-z0-9]+/gi, '-');
  XLSX.writeFile(workbook, `14D-Diagnostic-Report-${safeSchool}-${safeEvent}.xlsx`);
}

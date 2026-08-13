/**
 * CSV export of the Simulate page's current results: one row per required
 * metric move, across every dimension that has a target above its current
 * score - for schools who want to work the numbers into their own budget
 * spreadsheet.
 */
import * as XLSX from 'xlsx';
import { FullDiagnosticReportData } from './fullDiagnosticReport';
import { ReverseSimulationResult } from './reverseOutcomeEngine';
import { CostRatesByDimension } from './costRateService';
import { getOwnerRole } from './actionPlan';

const HEADERS = [
  'Dimension',
  'Current Dimension Score',
  'Target Dimension Score',
  'Dimension Achievable?',
  'Suggested Owner',
  'Metric',
  'From',
  'To (Benchmark)',
  'Unit',
  'Score After This Step',
  'Rate (₹ per unit)',
  'Estimated Cost (₹)',
];

export function downloadSimulationPlanCsv(
  report: FullDiagnosticReportData,
  results: Record<string, ReverseSimulationResult>,
  costRates: CostRatesByDimension
): void {
  const rows: (string | number)[][] = [];

  for (const card of report.dimensionCards) {
    const result = results[card.dimensionId];
    if (!result) continue;
    const owner = getOwnerRole(card.dimensionId);

    if (result.steps.length === 0) {
      rows.push([
        card.dimensionName,
        result.currentScore,
        result.targetScore,
        result.achievable ? 'Yes' : 'No',
        owner,
        '(target already met - no metric needs to move)',
        '',
        '',
        '',
        '',
        '',
        '',
      ]);
      continue;
    }

    for (const step of result.steps) {
      const rate = costRates[card.dimensionId]?.[step.metricId];
      const cost = rate != null ? Math.abs(step.toValue - step.fromValue) * rate : '';
      rows.push([
        card.dimensionName,
        result.currentScore,
        result.targetScore,
        result.achievable ? 'Yes' : 'No',
        owner,
        step.label,
        step.fromValue,
        step.toValue,
        step.unit,
        step.scoreAfter,
        rate ?? '',
        cost,
      ]);
    }
  }

  const worksheet = XLSX.utils.aoa_to_sheet([HEADERS, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Simulation Plan');

  const safeSchool = report.schoolName.replace(/[^a-z0-9]+/gi, '-');
  const safeEvent = report.eventName.replace(/[^a-z0-9]+/gi, '-');
  XLSX.writeFile(workbook, `14D-Simulation-Plan-${safeSchool}-${safeEvent}.csv`, { bookType: 'csv' });
}

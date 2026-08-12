/**
 * Styled, multi-section PDF export for the diagnostic report, built with
 * jsPDF's own drawing primitives only (no html2canvas/html2pdf installed,
 * so the on-screen Recharts radar isn't rasterized here - dimension scores
 * are instead drawn as horizontal bars, a deliberate on-screen/PDF
 * visual divergence).
 */
import { jsPDF } from 'jspdf';
import { getHealthStatus } from './dimensionScoring';
import { PerceptionRealityGap } from './gapAnalyzer';
import { FullDiagnosticReportData } from './fullDiagnosticReport';

const PAGE_HEIGHT = 297;
const PAGE_WIDTH = 210;
const MARGIN_X = 14;
const MARGIN_BOTTOM = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const STAKEHOLDER_LABELS: Record<string, string> = {
  teacher: 'Teachers',
  parent: 'Parents/Guardians',
  student: 'Students',
  admin: 'Admin Staff',
  other: 'Other',
};

const STATUS_COLORS: Record<string, [number, number, number]> = {
  Strong: [22, 163, 74],
  Adequate: [37, 99, 235],
  'Needs Attention': [217, 119, 6],
  'At Risk': [220, 38, 38],
  'No Data': [130, 130, 130],
};

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_HEIGHT - MARGIN_BOTTOM) {
    doc.addPage();
    return 20;
  }
  return y;
}

function drawSectionHeader(doc: jsPDF, text: string, y: number): number {
  y = ensureSpace(doc, y, 14);
  doc.setFillColor(79, 70, 229);
  doc.rect(MARGIN_X, y, CONTENT_WIDTH, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(text, MARGIN_X + 3, y + 6.3);
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'normal');
  return y + 14;
}

function drawWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5): number {
  const lines: string[] = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    y = ensureSpace(doc, y, lineHeight);
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

function drawScoreBar(
  doc: jsPDF,
  opts: {
    x: number;
    y: number;
    width: number;
    height: number;
    valuePct: number;
    benchmarkPct?: number;
    color: [number, number, number];
    label: string;
  }
): void {
  const { x, y, width, height, valuePct, benchmarkPct, color, label } = opts;

  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text(label, x, y - 1.5);
  doc.setTextColor(20, 20, 20);

  doc.setFillColor(230, 230, 235);
  doc.rect(x, y, width, height, 'F');

  const filledWidth = (Math.max(0, Math.min(100, valuePct)) / 100) * width;
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(x, y, filledWidth, height, 'F');

  if (benchmarkPct != null) {
    const tickX = x + (Math.max(0, Math.min(100, benchmarkPct)) / 100) * width;
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.6);
    doc.line(tickX, y - 1, tickX, y + height + 1);
  }
}

function drawGapIndicator(doc: jsPDF, x: number, y: number, gap: PerceptionRealityGap): number {
  const label =
    gap.interpretation === 'alignment'
      ? 'ALIGNED'
      : gap.interpretation === 'overestimation'
        ? 'OVERESTIMATED BY STAKEHOLDERS'
        : 'UNDERESTIMATED BY STAKEHOLDERS';
  const color: [number, number, number] =
    gap.interpretation === 'alignment' ? [22, 163, 74] : gap.interpretation === 'overestimation' ? [217, 119, 6] : [37, 99, 235];

  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const gapText = `${gap.gap > 0 ? '+' : ''}${gap.gap.toFixed(1)}`;
  doc.text(`${label}  (gap: ${gapText}, perceived ${gap.subjectiveScore} vs data ${gap.objectiveScore})`, x, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 20, 20);
  return y;
}

export function generateDiagnosticReportPdf(report: FullDiagnosticReportData): jsPDF {
  const doc = new jsPDF();
  let y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 30, 30);
  doc.text('14D Diagnostic Report', MARGIN_X, y);
  y += 9;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`School: ${report.schoolName}`, MARGIN_X, y);
  y += 6;
  doc.text(`Assessment Event: ${report.eventName}`, MARGIN_X, y);
  y += 6;
  doc.text(`Generated: ${report.generatedAt.toLocaleString()}`, MARGIN_X, y);
  y += 6;
  doc.text(`Total Responses: ${report.subjective.totalResponses}`, MARGIN_X, y);
  y += 8;

  const breakdown = Object.entries(report.subjective.responsesByStakeholder)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => `${STAKEHOLDER_LABELS[type] || type}: ${count}`)
    .join(', ');
  if (breakdown) {
    doc.setFontSize(10);
    y = drawWrappedText(doc, `Respondents — ${breakdown}`, MARGIN_X, y, CONTENT_WIDTH);
    y += 4;
  }

  const overallIndex = report.subjective.overallIndex;
  const overallStatus = getHealthStatus(overallIndex);
  const overallColor = STATUS_COLORS[overallStatus.label] || STATUS_COLORS['No Data'];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(overallColor[0], overallColor[1], overallColor[2]);
  doc.text(`Overall Institutional Health Index: ${overallIndex ?? 'N/A'}/100 (${overallStatus.label})`, MARGIN_X, y);
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'normal');
  y += 10;

  doc.setFontSize(10);
  y = drawWrappedText(
    doc,
    `Objective data captured for ${report.objectiveCompleteness.dimensionsWithAnyData}/14 dimensions (${report.objectiveCompleteness.overallCompleteness}% overall completeness).`,
    MARGIN_X,
    y,
    CONTENT_WIDTH
  );
  y += 6;

  y = drawSectionHeader(doc, 'Executive Summary', y);
  doc.setFontSize(10);
  for (const line of report.executiveSummary) {
    y = drawWrappedText(doc, `• ${line}`, MARGIN_X, y, CONTENT_WIDTH);
    y += 2;
  }
  y += 4;

  y = drawSectionHeader(doc, 'Benchmark Data Source', y);
  doc.setFontSize(9);
  y = drawWrappedText(
    doc,
    `Survey benchmarks (${report.benchmarkSources.subjective.version}, updated ${report.benchmarkSources.subjective.lastUpdated}): ${report.benchmarkSources.subjective.methodology}`,
    MARGIN_X,
    y,
    CONTENT_WIDTH,
    4.2
  );
  y += 3;
  y = drawWrappedText(
    doc,
    `Operational data benchmarks (${report.benchmarkSources.objective.version}, updated ${report.benchmarkSources.objective.lastUpdated}): ${report.benchmarkSources.objective.methodology}`,
    MARGIN_X,
    y,
    CONTENT_WIDTH,
    4.2
  );
  y += 6;

  y = drawSectionHeader(doc, 'Dimension Deep-Dive', y);
  for (const card of report.dimensionCards) {
    y = ensureSpace(doc, y, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(card.dimensionName, MARGIN_X, y);
    doc.setFont('helvetica', 'normal');
    y += 7;

    const subjColor = STATUS_COLORS[card.subjective.status.label] || STATUS_COLORS['No Data'];
    drawScoreBar(doc, {
      x: MARGIN_X,
      y,
      width: CONTENT_WIDTH,
      height: 4,
      valuePct: card.subjective.index ?? 0,
      benchmarkPct: card.benchmark,
      color: subjColor,
      label: `Subjective (survey): ${card.subjective.index ?? 'N/A'}/100  |  benchmark ${card.benchmark}  |  n=${card.subjective.responseCount}`,
    });
    y += 8;

    if (card.objective) {
      drawScoreBar(doc, {
        x: MARGIN_X,
        y,
        width: CONTENT_WIDTH,
        height: 4,
        valuePct: card.objective.objectiveScore,
        color: [79, 70, 229],
        label: `Objective (operational data): ${card.objective.objectiveScore}/100  |  data completeness ${card.objective.dataCompleteness}%`,
      });
      y += 8;
    } else {
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);
      doc.text('Objective: no operational data captured yet for this dimension.', MARGIN_X, y);
      doc.setTextColor(20, 20, 20);
      y += 6;
    }

    if (card.gap) {
      y = drawGapIndicator(doc, MARGIN_X, y, card.gap);
      y += 6;
    }

    doc.setFontSize(9);
    y = drawWrappedText(doc, card.interpretation, MARGIN_X, y, CONTENT_WIDTH, 4.5);
    y += 4;

    if (card.rootCause.length > 0) {
      y = ensureSpace(doc, y, 6);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('Root Cause:', MARGIN_X, y);
      doc.setFont('helvetica', 'normal');
      y += 4;
      doc.setFontSize(8.5);
      for (const line of card.rootCause) {
        y = drawWrappedText(doc, `- ${line}`, MARGIN_X, y, CONTENT_WIDTH, 4);
      }
      y += 2;
    }

    if (card.actionablePoints.length > 0) {
      y = ensureSpace(doc, y, 6);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('Actionable Points:', MARGIN_X, y);
      doc.setFont('helvetica', 'normal');
      y += 4;
      doc.setFontSize(8.5);
      for (const line of card.actionablePoints) {
        y = drawWrappedText(doc, `- ${line}`, MARGIN_X, y, CONTENT_WIDTH, 4);
      }
    }

    y += 6;
  }

  if (report.gapAnalysis) {
    const { summary, insights, recommendations } = report.gapAnalysis;
    y = drawSectionHeader(doc, 'Perception vs Reality Gap Analysis', y);
    doc.setFontSize(10);
    y = drawWrappedText(
      doc,
      `Aligned: ${summary.alignedDimensions.length}   Overestimated: ${summary.overestimatedDimensions.length}   Underestimated: ${summary.underestimatedDimensions.length}   Average Gap: ${summary.averageGap} points`,
      MARGIN_X,
      y,
      CONTENT_WIDTH
    );
    y += 4;

    if (insights.length > 0) {
      y = ensureSpace(doc, y, 8);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Insights', MARGIN_X, y);
      doc.setFont('helvetica', 'normal');
      y += 5;
      for (const insight of insights) {
        y = drawWrappedText(doc, `• ${insight}`, MARGIN_X, y, CONTENT_WIDTH);
        y += 2;
      }
      y += 3;
    }

    if (recommendations.length > 0) {
      y = ensureSpace(doc, y, 8);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommended Actions', MARGIN_X, y);
      doc.setFont('helvetica', 'normal');
      y += 5;
      for (const rec of recommendations) {
        y = drawWrappedText(doc, `• ${rec}`, MARGIN_X, y, CONTENT_WIDTH);
        y += 2;
      }
      y += 4;
    }
  }

  y = drawSectionHeader(doc, 'Objective Data Completeness', y);
  doc.setFontSize(10);
  y = drawWrappedText(
    doc,
    `Overall: ${report.objectiveCompleteness.overallCompleteness}% complete across 14 dimensions (${report.objectiveCompleteness.dimensionsWithAnyData} have at least some data, ${report.objectiveCompleteness.dimensionsFullyComplete} fully complete).`,
    MARGIN_X,
    y,
    CONTENT_WIDTH
  );
  y += 4;

  for (const card of report.dimensionCards) {
    const info = report.objectiveCompleteness.byDimension[card.dimensionId];
    if (!info || info.completeness >= 60) continue;
    y = ensureSpace(doc, y, 6);
    doc.setFontSize(9);
    const missing = info.requiredMissing.length > 0 ? ` — missing: ${info.requiredMissing.join(', ')}` : '';
    y = drawWrappedText(doc, `${card.dimensionName}: ${info.completeness}% complete${missing}`, MARGIN_X, y, CONTENT_WIDTH, 4.5);
  }

  return doc;
}

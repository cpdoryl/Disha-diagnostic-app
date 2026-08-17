/**
 * PDF export of the Simulate page's current results - a printable action
 * plan a school can hand to its board: the target scenario, then per
 * dimension the real required metric moves (from the same scoring engine
 * that computes the live diagnostic report), suggested owners, and any
 * cost the school has priced. Visual language matches
 * `diagnosticReportPdf.ts` (same palette/margins) but this file is
 * self-contained - no shared internal helpers, since none are exported.
 */
import { jsPDF } from 'jspdf';
import { FullDiagnosticReportData } from './fullDiagnosticReport';
import { ReverseSimulationResult } from './reverseOutcomeEngine';
import { CostRatesByDimension } from './costRateService';
import { getOwnerRole } from './actionPlan';

const PAGE_HEIGHT = 297;
const PAGE_WIDTH = 210;
const MARGIN_X = 14;
const MARGIN_TOP = 16;
const MARGIN_BOTTOM = 22;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const COLORS = {
  indigo: [79, 70, 229] as [number, number, number],
  indigoFill: [238, 242, 255] as [number, number, number],
  indigoBorder: [199, 210, 254] as [number, number, number],
  emerald: [5, 150, 105] as [number, number, number],
  emeraldFill: [236, 253, 245] as [number, number, number],
  emeraldBorder: [167, 243, 208] as [number, number, number],
  amber: [180, 83, 9] as [number, number, number],
  amberFill: [255, 251, 235] as [number, number, number],
  amberBorder: [253, 230, 138] as [number, number, number],
  grayFill: [249, 250, 251] as [number, number, number],
  grayBorder: [229, 231, 235] as [number, number, number],
  ink: [20, 20, 20] as [number, number, number],
  muted: [110, 110, 110] as [number, number, number],
};

function setFill(doc: jsPDF, c: [number, number, number]) {
  doc.setFillColor(c[0], c[1], c[2]);
}
function setDraw(doc: jsPDF, c: [number, number, number]) {
  doc.setDrawColor(c[0], c[1], c[2]);
}
function setText(doc: jsPDF, c: [number, number, number]) {
  doc.setTextColor(c[0], c[1], c[2]);
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_HEIGHT - MARGIN_BOTTOM) {
    doc.addPage();
    return MARGIN_TOP;
  }
  return y;
}

function drawSectionHeader(doc: jsPDF, text: string, y: number): number {
  y = ensureSpace(doc, y, 16);
  setFill(doc, COLORS.indigo);
  doc.rect(MARGIN_X, y, CONTENT_WIDTH, 9, 'F');
  setText(doc, [255, 255, 255]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(text, MARGIN_X + 3, y + 6.3);
  setText(doc, COLORS.ink);
  doc.setFont('helvetica', 'normal');
  return y + 13;
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

function formatCurrency(value: number): string {
  return `Rs ${Math.round(value).toLocaleString('en-IN')}`;
}

export function generateSimulationPlanPdf(
  report: FullDiagnosticReportData,
  results: Record<string, ReverseSimulationResult>,
  costRates: CostRatesByDimension,
  desiredOverall: number,
  currentOverall: number | null,
  achievedOverall: number | null
): jsPDF {
  const doc = new jsPDF();
  let y = MARGIN_TOP;
  const generatedAt = new Date();

  // Header block
  setFill(doc, COLORS.indigo);
  doc.rect(0, 0, PAGE_WIDTH, 30, 'F');
  setText(doc, [255, 255, 255]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('DISHA 14D Reverse Outcome Simulation Plan', MARGIN_X, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${report.schoolName} - ${report.eventName}`, MARGIN_X, 21);
  doc.text(`Generated ${generatedAt.toLocaleDateString()}`, MARGIN_X, 27);
  setText(doc, COLORS.ink);
  y = 38;

  doc.setFontSize(8.5);
  setText(doc, COLORS.muted);
  y = drawWrappedText(
    doc,
    'Every figure below is either read from this school\'s real captured operational data or computed by re-running the same objective scoring engine that produces the live diagnostic report - no invented precedent, no fabricated confidence score. Owner roles are a generic suggested starting point (see the Action Plan section of the full report), not a record of real staff assignments. Cost only appears where the school entered its own rate; it is never estimated by the platform.',
    MARGIN_X,
    y,
    CONTENT_WIDTH,
    4
  );
  setText(doc, COLORS.ink);
  y += 4;

  // Scenario summary
  y = drawSectionHeader(doc, 'Target Scenario', y);
  const boxWidth = (CONTENT_WIDTH - 8) / 3;
  const boxes: Array<{ label: string; value: string; fill: [number, number, number]; border: [number, number, number]; text: [number, number, number] }> = [
    { label: 'CURRENT OVERALL', value: currentOverall != null ? `${currentOverall}/100` : 'N/A', fill: COLORS.grayFill, border: COLORS.grayBorder, text: COLORS.ink },
    { label: 'DESIRED OVERALL', value: `${desiredOverall}/100`, fill: COLORS.indigoFill, border: COLORS.indigoBorder, text: COLORS.indigo },
    { label: 'ACHIEVED (FROM TARGETS)', value: achievedOverall != null ? `${achievedOverall}/100` : 'N/A', fill: COLORS.emeraldFill, border: COLORS.emeraldBorder, text: COLORS.emerald },
  ];
  y = ensureSpace(doc, y, 26);
  boxes.forEach((box, idx) => {
    const x = MARGIN_X + idx * (boxWidth + 4);
    setFill(doc, box.fill);
    setDraw(doc, box.border);
    doc.roundedRect(x, y, boxWidth, 22, 2, 2, 'FD');
    doc.setFontSize(7);
    setText(doc, COLORS.muted);
    doc.text(box.label, x + 3, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    setText(doc, box.text);
    doc.text(box.value, x + 3, y + 16);
    doc.setFont('helvetica', 'normal');
  });
  setText(doc, COLORS.ink);
  y += 30;

  // Per-dimension results
  y = drawSectionHeader(doc, 'Required Actions, Owners & Cost by Dimension', y);

  let totalCost = 0;
  let pricedItems = 0;
  let totalItems = 0;

  const dimensionsWithResults = report.dimensionCards.filter((card) => results[card.dimensionId]);

  if (dimensionsWithResults.length === 0) {
    doc.setFontSize(9.5);
    setText(doc, COLORS.muted);
    y = drawWrappedText(doc, 'No dimension had a target above its current score when this plan was generated.', MARGIN_X, y, CONTENT_WIDTH);
    setText(doc, COLORS.ink);
  }

  for (const card of dimensionsWithResults) {
    const result = results[card.dimensionId];
    const owner = getOwnerRole(card.dimensionId);

    y = ensureSpace(doc, y, 16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    setText(doc, COLORS.ink);
    doc.text(card.dimensionName, MARGIN_X, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setText(doc, COLORS.muted);
    doc.text(
      `${result.currentScore}/100 -> target ${result.targetScore}/100  |  Owner: ${owner}  |  ${result.achievable ? 'Achievable with captured metrics' : `Capped at ${result.maxAchievableScore}/100 with currently captured metrics`}`,
      MARGIN_X,
      y + 10
    );
    setText(doc, COLORS.ink);
    y += 15;

    if (result.steps.length === 0) {
      doc.setFontSize(8.5);
      setText(doc, COLORS.muted);
      y = drawWrappedText(doc, 'Target already met - no metric needs to move.', MARGIN_X + 2, y, CONTENT_WIDTH - 2);
      setText(doc, COLORS.ink);
      y += 3;
      continue;
    }

    // Table header
    y = ensureSpace(doc, y, 8);
    const cols = [
      { label: 'Metric', x: MARGIN_X, w: 66 },
      { label: 'From -> To', x: MARGIN_X + 66, w: 34 },
      { label: 'Score', x: MARGIN_X + 100, w: 20 },
      { label: 'Rate/unit', x: MARGIN_X + 120, w: 26 },
      { label: 'Est. Cost', x: MARGIN_X + 146, w: 36 },
    ];
    setFill(doc, COLORS.grayFill);
    setDraw(doc, COLORS.grayBorder);
    doc.rect(MARGIN_X, y, CONTENT_WIDTH, 6, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    setText(doc, COLORS.muted);
    for (const col of cols) doc.text(col.label, col.x + 1.5, y + 4.2);
    doc.setFont('helvetica', 'normal');
    setText(doc, COLORS.ink);
    y += 6;

    for (const step of result.steps) {
      totalItems += 1;
      const rate = costRates[card.dimensionId]?.[step.metricId];
      const cost = rate != null ? Math.abs(step.toValue - step.fromValue) * rate : null;
      if (cost != null) {
        pricedItems += 1;
        totalCost += cost;
      }

      const metricLines = doc.splitTextToSize(step.label, cols[0].w - 3);
      const rowHeight = Math.max(6, metricLines.length * 3.6 + 2);
      y = ensureSpace(doc, y, rowHeight);
      setDraw(doc, COLORS.grayBorder);
      doc.setLineWidth(0.15);
      doc.line(MARGIN_X, y + rowHeight, MARGIN_X + CONTENT_WIDTH, y + rowHeight);

      doc.setFontSize(8);
      doc.text(metricLines, cols[0].x + 1.5, y + 4);
      doc.text(`${step.fromValue}${step.unit} -> ${step.toValue}${step.unit}`, cols[1].x + 1.5, y + 4);
      doc.text(`${step.scoreAfter}`, cols[2].x + 1.5, y + 4);
      doc.text(rate != null ? `Rs ${rate}` : 'Not set', cols[3].x + 1.5, y + 4);
      doc.text(cost != null ? formatCurrency(cost) : 'Not priced', cols[4].x + 1.5, y + 4);
      y += rowHeight;
    }
    y += 6;
  }

  // Cost rollup
  if (totalItems > 0) {
    y = drawSectionHeader(doc, 'Estimated Cost Rollup', y);
    y = ensureSpace(doc, y, 20);
    setFill(doc, COLORS.indigoFill);
    setDraw(doc, COLORS.indigoBorder);
    doc.roundedRect(MARGIN_X, y, CONTENT_WIDTH, 18, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    setText(doc, COLORS.indigo);
    doc.text(formatCurrency(totalCost), MARGIN_X + 4, y + 9);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setText(doc, COLORS.muted);
    doc.text(
      `${pricedItems} of ${totalItems} required metric moves have a rate entered${pricedItems < totalItems ? ' - partial estimate' : ' - fully priced'}`,
      MARGIN_X + 4,
      y + 15
    );
    setText(doc, COLORS.ink);
    y += 24;
  }

  // Footer / page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    setDraw(doc, COLORS.grayBorder);
    doc.setLineWidth(0.2);
    doc.line(MARGIN_X, PAGE_HEIGHT - 14, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    setText(doc, COLORS.muted);
    doc.text(`DISHA Simulation Plan - ${report.schoolName}`, MARGIN_X, PAGE_HEIGHT - 9);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 9, { align: 'right' });
  }
  setText(doc, COLORS.ink);

  return doc;
}

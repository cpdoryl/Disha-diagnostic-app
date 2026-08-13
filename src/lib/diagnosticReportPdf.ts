/**
 * Styled, multi-section PDF export for the diagnostic report, built with
 * jsPDF's drawing primitives plus rasterized chart images (captured from the
 * on-screen Recharts components via html2canvas by the caller and passed in
 * as data URLs - this file itself has no DOM dependency and can run
 * server-side/headless). Every dynamic text value is wrapped through
 * `splitTextToSize` or a pre-measured colored block so nothing can run past
 * the page margin, and every visual block is pre-measured before it is
 * drawn so it never starts a page break mid-box.
 */
import { jsPDF } from 'jspdf';
import { getHealthStatus } from './dimensionScoring';
import { PerceptionRealityGap } from './gapAnalyzer';
import { FullDiagnosticReportData, DimensionReportCard } from './fullDiagnosticReport';
import { summarizeDataConfidence, DATA_CONFIDENCE_TIER_INFO, DATA_CONFIDENCE_USAGE_NOTE } from './objectiveScoreEngine';
import { QUADRANT_DEFINITIONS, QUADRANT_DISPLAY_ORDER, QuadrantId } from './quadrantAnalysis';
import { TIMEFRAME_LABELS, ActionTimeframe } from './actionPlan';

export interface ChartImage {
  dataUrl: string;
  width: number;
  height: number;
}

export interface DiagnosticReportPdfCharts {
  radarChart?: ChartImage | null;
  comparisonChart?: ChartImage | null;
  gapChart?: ChartImage | null;
  quadrantChart?: ChartImage | null;
}

const PAGE_HEIGHT = 297;
const PAGE_WIDTH = 210;
const MARGIN_X = 14;
const MARGIN_TOP = 16;
const MARGIN_BOTTOM = 22;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const MAX_CONTENT_HEIGHT = PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;

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

const GAP_COLORS: Record<PerceptionRealityGap['interpretation'], [number, number, number]> = {
  alignment: [22, 163, 74],
  overestimation: [217, 119, 6],
  underestimation: [37, 99, 235],
};

const GAP_LABELS: Record<PerceptionRealityGap['interpretation'], string> = {
  alignment: 'ALIGNED',
  overestimation: 'OVERESTIMATED BY STAKEHOLDERS',
  underestimation: 'UNDERESTIMATED BY STAKEHOLDERS',
};

const COLORS = {
  indigo: [79, 70, 229] as [number, number, number],
  indigoText: [55, 48, 163] as [number, number, number],
  indigoFill: [238, 242, 255] as [number, number, number],
  indigoBorder: [199, 210, 254] as [number, number, number],
  sky: [3, 105, 161] as [number, number, number],
  skyFill: [240, 249, 255] as [number, number, number],
  skyBorder: [186, 230, 253] as [number, number, number],
  grayText: [55, 65, 81] as [number, number, number],
  grayFill: [249, 250, 251] as [number, number, number],
  grayBorder: [229, 231, 235] as [number, number, number],
  ink: [20, 20, 20] as [number, number, number],
  muted: [110, 110, 110] as [number, number, number],
};

const QUADRANT_PALETTE: Record<QuadrantId, { fill: [number, number, number]; border: [number, number, number]; label: [number, number, number]; text: [number, number, number] }> = {
  excellence: { fill: [240, 253, 244], border: [187, 247, 208], label: [22, 101, 52], text: [22, 101, 52] },
  hidden_potential: { fill: [239, 246, 255], border: [191, 219, 254], label: [30, 64, 175], text: [30, 64, 175] },
  blind_spot: { fill: [255, 251, 235], border: [253, 230, 138], label: [146, 64, 14], text: [146, 64, 14] },
  crisis: { fill: [254, 242, 242], border: [254, 202, 202], label: [153, 27, 27], text: [153, 27, 27] },
};

const TIMEFRAME_PALETTE: Record<ActionTimeframe, { fill: [number, number, number]; border: [number, number, number] }> = {
  '30': { fill: [254, 242, 242], border: [254, 202, 202] },
  '60': { fill: [255, 251, 235], border: [253, 230, 138] },
  '90': { fill: [239, 246, 255], border: [191, 219, 254] },
};

const TIMEFRAME_INTRO: Record<ActionTimeframe, string> = {
  '30': 'Urgent - subjective status is At Risk, or the dimension falls in the Crisis quadrant (both perception and data agree it is underperforming).',
  '60': 'Important - subjective status is Needs Attention, or the dimension falls in the Blind Spot quadrant (stakeholders are more confident than the data currently supports).',
  '90': 'Strategic - either no survey data has been recorded yet, the dimension falls in the Hidden Potential quadrant (a visibility/communication opportunity), or it is already Strong/Excellence and only needs monitoring.',
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

/** Starts a new page if `needed` mm won't fit before the bottom margin. */
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

/** Wraps text to `maxWidth`, drawing each line and paginating as needed. */
function drawWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5): number {
  const lines: string[] = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    y = ensureSpace(doc, y, lineHeight);
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

function truncateToWidth(doc: jsPDF, text: string, maxWidth: number): string {
  if (doc.getTextWidth(text) <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1 && doc.getTextWidth(truncated + '…') > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '…';
}

/**
 * Draws a labeled score bar. The label is wrapped and drawn first (so it can
 * never run past the page edge), then the bar is drawn beneath it. Returns
 * the total vertical space consumed from `yStart`.
 */
function drawScoreBar(
  doc: jsPDF,
  opts: {
    x: number;
    yStart: number;
    width: number;
    barHeight: number;
    valuePct: number;
    benchmarkPct?: number;
    color: [number, number, number];
    label: string;
  }
): number {
  const { x, yStart, width, barHeight, valuePct, benchmarkPct, color, label } = opts;

  doc.setFontSize(8);
  setText(doc, COLORS.muted);
  const labelLines: string[] = doc.splitTextToSize(label, width);
  let cursorY = yStart + 3;
  for (const line of labelLines) {
    doc.text(line, x, cursorY);
    cursorY += 3.6;
  }
  setText(doc, COLORS.ink);

  const barY = cursorY - 1;
  setFill(doc, [230, 230, 235]);
  doc.rect(x, barY, width, barHeight, 'F');

  const filledWidth = (Math.max(0, Math.min(100, valuePct)) / 100) * width;
  setFill(doc, color);
  doc.rect(x, barY, filledWidth, barHeight, 'F');

  if (benchmarkPct != null) {
    const tickX = x + (Math.max(0, Math.min(100, benchmarkPct)) / 100) * width;
    setDraw(doc, [30, 30, 30]);
    doc.setLineWidth(0.6);
    doc.line(tickX, barY - 1, tickX, barY + barHeight + 1);
  }

  return barY + barHeight - yStart + 3;
}

/**
 * Draws a bordered, colored background box containing a bold label and a
 * list of wrapped paragraphs - the box is fully measured before anything is
 * drawn, so it always page-breaks as one clean unit rather than splitting a
 * background fill across two pages.
 */
function drawColoredBlock(
  doc: jsPDF,
  label: string,
  lines: string[],
  y: number,
  palette: { fill: [number, number, number]; border: [number, number, number]; label: [number, number, number]; text: [number, number, number] }
): number {
  if (lines.length === 0) return y;

  const paddingX = 3.5;
  const paddingY = 3.5;
  const innerWidth = CONTENT_WIDTH - paddingX * 2;
  const lineHeight = 4;
  const paragraphGap = 2;

  doc.setFontSize(8.3);
  doc.setFont('helvetica', 'normal');
  const paragraphs: string[][] = lines.map((line) => doc.splitTextToSize(line, innerWidth));
  const textHeight =
    paragraphs.reduce((sum, p) => sum + p.length * lineHeight, 0) + (paragraphs.length - 1) * paragraphGap;
  const labelHeight = 5.5;
  const boxHeight = paddingY * 2 + labelHeight + textHeight;

  y = ensureSpace(doc, y, boxHeight + 4);

  setFill(doc, palette.fill);
  setDraw(doc, palette.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN_X, y, CONTENT_WIDTH, boxHeight, 1.5, 1.5, 'FD');

  let cursorY = y + paddingY + 3.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.6);
  setText(doc, palette.label);
  doc.text(label, MARGIN_X + paddingX, cursorY);
  cursorY += labelHeight;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.3);
  setText(doc, palette.text);
  for (let i = 0; i < paragraphs.length; i++) {
    for (const l of paragraphs[i]) {
      doc.text(l, MARGIN_X + paddingX, cursorY);
      cursorY += lineHeight;
    }
    if (i < paragraphs.length - 1) cursorY += paragraphGap;
  }

  setText(doc, COLORS.ink);
  return y + boxHeight + 4;
}

/** A bulleted list inside a light background box, used for summary sections. */
function drawBulletBlock(doc: jsPDF, items: string[], y: number, fill: [number, number, number], border: [number, number, number]): number {
  if (items.length === 0) return y;
  const paddingX = 4;
  const paddingY = 3.5;
  const bulletIndent = 4;
  const innerWidth = CONTENT_WIDTH - paddingX * 2 - bulletIndent;
  const lineHeight = 4.6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const wrapped = items.map((item) => doc.splitTextToSize(item, innerWidth) as string[]);
  const textHeight = wrapped.reduce((sum, w) => sum + w.length * lineHeight, 0);
  const boxHeight = paddingY * 2 + textHeight;

  y = ensureSpace(doc, y, boxHeight + 4);
  setFill(doc, fill);
  setDraw(doc, border);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN_X, y, CONTENT_WIDTH, boxHeight, 1.5, 1.5, 'FD');

  let cursorY = y + paddingY + 3.2;
  setText(doc, COLORS.grayText);
  for (const w of wrapped) {
    doc.setTextColor(79, 70, 229);
    doc.text('•', MARGIN_X + paddingX, cursorY);
    setText(doc, COLORS.grayText);
    for (let i = 0; i < w.length; i++) {
      doc.text(w[i], MARGIN_X + paddingX + bulletIndent, cursorY);
      cursorY += lineHeight;
    }
  }
  setText(doc, COLORS.ink);
  return y + boxHeight + 4;
}

/**
 * Draws a chart image with a title and wrapped caption above it. The whole
 * block (title + caption + image) is measured before anything is drawn and
 * placed with a single `ensureSpace` call, so a page break can never strand
 * the title/caption on one page while the image lands on the next.
 */
function drawChartImage(doc: jsPDF, title: string, caption: string, chart: ChartImage, y: number): number {
  const titleHeight = 6.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.3);
  const captionLines: string[] = doc.splitTextToSize(caption, CONTENT_WIDTH);
  const captionHeight = captionLines.length * 4 + 2;

  const aspect = chart.height / chart.width;
  let imgWidth = CONTENT_WIDTH;
  let imgHeight = imgWidth * aspect;
  const maxImgHeight = MAX_CONTENT_HEIGHT - titleHeight - captionHeight - 14;
  if (imgHeight > maxImgHeight) {
    imgHeight = maxImgHeight;
    imgWidth = imgHeight / aspect;
  }

  const totalHeight = titleHeight + captionHeight + imgHeight + 8;
  y = ensureSpace(doc, y, totalHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  setText(doc, COLORS.grayText);
  doc.text(title, MARGIN_X, y + 4);
  y += titleHeight;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.3);
  setText(doc, COLORS.muted);
  for (const line of captionLines) {
    doc.text(line, MARGIN_X, y + 3);
    y += 4;
  }
  setText(doc, COLORS.ink);
  y += 2;

  const x = MARGIN_X + (CONTENT_WIDTH - imgWidth) / 2;
  setDraw(doc, COLORS.grayBorder);
  doc.setLineWidth(0.2);
  doc.rect(x, y, imgWidth, imgHeight);
  doc.addImage(chart.dataUrl, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
  return y + imgHeight + 8;
}

function drawDimensionCardHeader(doc: jsPDF, card: DimensionReportCard, y: number): number {
  y = ensureSpace(doc, y, 12);
  setFill(doc, COLORS.indigoFill);
  setDraw(doc, COLORS.indigoBorder);
  doc.setLineWidth(0.3);
  doc.rect(MARGIN_X, y, CONTENT_WIDTH, 9, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  setText(doc, [31, 41, 55]);
  const nameMaxWidth = CONTENT_WIDTH * 0.55;
  doc.text(truncateToWidth(doc, card.dimensionName, nameMaxWidth), MARGIN_X + 3, y + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  const statusColor = STATUS_COLORS[card.subjective.status.label] || STATUS_COLORS['No Data'];
  const statusText = card.subjective.status.label.toUpperCase();
  let rightX = MARGIN_X + CONTENT_WIDTH - 3;

  if (card.gap) {
    const gapText = GAP_LABELS[card.gap.interpretation];
    const gapColor = GAP_COLORS[card.gap.interpretation];
    const gapWidth = doc.getTextWidth(gapText);
    rightX -= gapWidth;
    setText(doc, gapColor);
    doc.text(gapText, rightX, y + 6);
    rightX -= 5;
  }

  const statusWidth = doc.getTextWidth(statusText);
  rightX -= statusWidth;
  setText(doc, statusColor);
  doc.text(statusText, rightX, y + 6);

  setText(doc, COLORS.ink);
  doc.setFont('helvetica', 'normal');
  return y + 12;
}

function drawDimensionSummaryTable(doc: jsPDF, cards: DimensionReportCard[], y: number): number {
  const columns = [
    { header: 'Dimension', width: 44 },
    { header: 'Avg (1-5)', width: 20 },
    { header: 'Index', width: 16 },
    { header: 'Benchmark', width: 22 },
    { header: 'Objective', width: 20 },
    { header: 'Status', width: 32 },
    { header: 'Responses', width: 28 },
  ];
  const rowHeight = 7;

  const drawHeaderRow = (yy: number): number => {
    setFill(doc, [243, 244, 246]);
    doc.rect(MARGIN_X, yy, CONTENT_WIDTH, rowHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    setText(doc, COLORS.grayText);
    let x = MARGIN_X + 2;
    for (const col of columns) {
      doc.text(col.header, x, yy + 4.8);
      x += col.width;
    }
    doc.setFont('helvetica', 'normal');
    setText(doc, COLORS.ink);
    return yy + rowHeight;
  };

  y = ensureSpace(doc, y, rowHeight * 2);
  y = drawHeaderRow(y);
  doc.setFontSize(7.6);

  for (const card of cards) {
    if (y + rowHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
      doc.addPage();
      y = MARGIN_TOP;
      y = drawHeaderRow(y);
      doc.setFontSize(7.6);
    }
    setDraw(doc, COLORS.grayBorder);
    doc.setLineWidth(0.15);
    doc.line(MARGIN_X, y + rowHeight, MARGIN_X + CONTENT_WIDTH, y + rowHeight);

    const cells = [
      truncateToWidth(doc, card.dimensionName, columns[0].width - 3),
      card.subjective.average != null ? card.subjective.average.toFixed(2) : '—',
      card.subjective.index != null ? String(card.subjective.index) : '—',
      String(card.benchmark),
      card.objective ? String(card.objective.objectiveScore) : '—',
      card.subjective.status.label,
      String(card.subjective.responseCount),
    ];
    let x = MARGIN_X + 2;
    for (let i = 0; i < columns.length; i++) {
      doc.text(cells[i], x, y + 4.8);
      x += columns[i].width;
    }
    y += rowHeight;
  }
  return y + 6;
}

/**
 * Generic multi-line-cell table: each cell wraps independently, and the row
 * height is the tallest wrapped cell in that row - used wherever a fixed
 * single-line-per-row table (like `drawDimensionSummaryTable`) would clip
 * longer content (action descriptions, metric names, role lists).
 */
function drawWrappedTable(doc: jsPDF, columns: { header: string; width: number }[], rows: string[][], y: number): number {
  const rowPaddingY = 2;
  const lineHeight = 3.6;
  const cellFontSize = 7.4;
  const headerRowHeight = 7;

  const drawHeaderRow = (yy: number): number => {
    setFill(doc, [243, 244, 246]);
    doc.rect(MARGIN_X, yy, CONTENT_WIDTH, headerRowHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    setText(doc, COLORS.grayText);
    let x = MARGIN_X + 2;
    for (const col of columns) {
      doc.text(col.header, x, yy + 4.8);
      x += col.width;
    }
    doc.setFont('helvetica', 'normal');
    setText(doc, COLORS.ink);
    return yy + headerRowHeight;
  };

  y = ensureSpace(doc, y, headerRowHeight * 2);
  y = drawHeaderRow(y);

  for (const row of rows) {
    doc.setFontSize(cellFontSize);
    const wrappedCells = row.map((cell, i) => doc.splitTextToSize(cell, columns[i].width - 3) as string[]);
    const rowLines = Math.max(1, ...wrappedCells.map((w) => w.length));
    const rowHeight = rowLines * lineHeight + rowPaddingY * 2;

    if (y + rowHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
      doc.addPage();
      y = MARGIN_TOP;
      y = drawHeaderRow(y);
    }

    doc.setFontSize(cellFontSize);
    let x = MARGIN_X + 2;
    for (let i = 0; i < columns.length; i++) {
      let cy = y + rowPaddingY + 2.6;
      for (const line of wrappedCells[i]) {
        doc.text(line, x, cy);
        cy += lineHeight;
      }
      x += columns[i].width;
    }
    setDraw(doc, COLORS.grayBorder);
    doc.setLineWidth(0.15);
    doc.line(MARGIN_X, y + rowHeight, MARGIN_X + CONTENT_WIDTH, y + rowHeight);
    y += rowHeight;
  }
  return y + 6;
}

function drawLogoMark(doc: jsPDF, cx: number, cy: number, radius: number): void {
  setFill(doc, COLORS.indigo);
  doc.circle(cx, cy, radius, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(radius * 0.95);
  setText(doc, [255, 255, 255]);
  doc.text('14D', cx, cy + radius * 0.33, { align: 'center' });
  setText(doc, COLORS.ink);
  doc.setFont('helvetica', 'normal');
}

/**
 * Full-page cover: no real school/DISHA logo file exists anywhere in this
 * app, so a vector "14D" badge is drawn programmatically instead of
 * pretending to have branding that doesn't exist. Ends with `addPage()` so
 * all substantive content starts fresh on page 2.
 */
function drawCoverPage(doc: jsPDF, report: FullDiagnosticReportData): void {
  const centerX = PAGE_WIDTH / 2;
  let y = 50;

  drawLogoMark(doc, centerX, y, 16);
  y += 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  setText(doc, COLORS.ink);
  doc.text('14-Dimension Diagnostic Report', centerX, y, { align: 'center' });
  y += 7.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  setText(doc, COLORS.muted);
  doc.text('DISHA School Diagnostic Engine', centerX, y, { align: 'center' });
  y += 15;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  setText(doc, COLORS.ink);
  doc.text(truncateToWidth(doc, report.schoolName, CONTENT_WIDTH), centerX, y, { align: 'center' });
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  setText(doc, COLORS.grayText);
  doc.text(truncateToWidth(doc, report.eventName, CONTENT_WIDTH), centerX, y, { align: 'center' });
  y += 6;
  doc.setFontSize(9);
  setText(doc, COLORS.muted);
  doc.text(`Generated ${report.generatedAt.toLocaleString()}`, centerX, y, { align: 'center' });
  y += 13;

  setDraw(doc, COLORS.grayBorder);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_X + 20, y, PAGE_WIDTH - MARGIN_X - 20, y);
  y += 13;

  const overallIndex = report.subjective.overallIndex;
  const overallStatus = getHealthStatus(overallIndex);
  const stats: { label: string; value: string; color: [number, number, number] }[] = [
    { label: 'Overall Health Index', value: `${overallIndex ?? 'N/A'}/100`, color: STATUS_COLORS[overallStatus.label] || STATUS_COLORS['No Data'] },
    { label: 'Status', value: overallStatus.label, color: STATUS_COLORS[overallStatus.label] || STATUS_COLORS['No Data'] },
    { label: 'Responses', value: String(report.subjective.totalResponses), color: COLORS.indigo },
    { label: 'Data Completeness', value: `${report.objectiveCompleteness.overallCompleteness}%`, color: COLORS.indigo },
  ];
  const tileGap = 6;
  const tileWidth = (CONTENT_WIDTH - tileGap * 3) / 4;
  let tx = MARGIN_X;
  for (const stat of stats) {
    setFill(doc, COLORS.grayFill);
    setDraw(doc, COLORS.grayBorder);
    doc.setLineWidth(0.3);
    doc.roundedRect(tx, y, tileWidth, 26, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    setText(doc, stat.color);
    doc.text(stat.value, tx + tileWidth / 2, y + 12, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    setText(doc, COLORS.muted);
    const labelLines: string[] = doc.splitTextToSize(stat.label, tileWidth - 4);
    let ly = y + 18;
    for (const line of labelLines) {
      doc.text(line, tx + tileWidth / 2, ly, { align: 'center' });
      ly += 3.4;
    }
    tx += tileWidth + tileGap;
  }
  y += 26 + 12;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  setText(doc, COLORS.muted);
  y = drawWrappedText(
    doc,
    'This report combines stakeholder survey perception with captured operational data to produce a data-grounded diagnostic - every claim inside is tied to the specific numbers it is drawn from. See the Methodology & Glossary appendix for how each score is calculated.',
    MARGIN_X + 15,
    y,
    CONTENT_WIDTH - 30,
    4.3
  );
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setText(doc, COLORS.grayText);
  doc.text('In This Report', MARGIN_X + 15, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  setText(doc, COLORS.grayText);
  const toc = [
    'Executive Summary & Benchmark Data Source',
    'Visual Analysis (Radar, Comparison, Gap, Quadrant charts)',
    'Dimension Summary & Dimension Deep-Dive (all 14 dimensions)',
    'Perception vs Reality Gap Analysis',
    'Perception-Reality Quadrant Analysis',
    '30-60-90 Day Action Plan & Responsibility Matrix',
    'Objective Data Completeness',
    'Appendix A: Full Objective Metric Data',
    'Appendix B: Methodology & Glossary',
  ];
  for (const item of toc) {
    doc.text(`•  ${item}`, MARGIN_X + 18, y);
    y += 5;
  }

  doc.setFontSize(7.5);
  setText(doc, COLORS.muted);
  doc.text('Confidential - prepared for internal school use.', centerX, PAGE_HEIGHT - 16, { align: 'center' });
  setText(doc, COLORS.ink);

  doc.addPage();
}

/**
 * 30-60-90 day action plan (grouped tables, one per timeframe bucket) plus a
 * responsibility matrix grouped by suggested owner role. Owner roles are a
 * generic default, not real staff data - `report.actionPlan.roleDisclosure`
 * says so explicitly and is always printed before the matrix.
 */
function drawActionPlanSection(doc: jsPDF, report: FullDiagnosticReportData, y: number): number {
  y = drawSectionHeader(doc, '30-60-90 Day Action Plan', y);
  doc.setFontSize(9);
  setText(doc, COLORS.muted);
  y = drawWrappedText(
    doc,
    'Each dimension is placed into a 30/60/90-day bucket based on its subjective status and perception-reality quadrant, not an arbitrary priority call - the criteria for each bucket are stated below it.',
    MARGIN_X,
    y,
    CONTENT_WIDTH,
    4.2
  );
  setText(doc, COLORS.ink);
  y += 3;

  const columns = [
    { header: 'Dimension', width: 32 },
    { header: 'Suggested Action', width: 100 },
    { header: 'Suggested Owner', width: 50 },
  ];

  for (const tf of ['30', '60', '90'] as ActionTimeframe[]) {
    const items = report.actionPlan.byTimeframe[tf];
    if (items.length === 0) continue;

    y = ensureSpace(doc, y, 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    setText(doc, COLORS.grayText);
    doc.text(`${TIMEFRAME_LABELS[tf]} (${items.length})`, MARGIN_X, y);
    doc.setFont('helvetica', 'normal');
    y += 5;

    const palette = TIMEFRAME_PALETTE[tf];
    y = drawColoredBlock(doc, 'Criteria for this bucket', [TIMEFRAME_INTRO[tf]], y, {
      fill: palette.fill,
      border: palette.border,
      label: COLORS.grayText,
      text: COLORS.grayText,
    });

    const rows = items.map((item) => [item.dimensionName, item.action, item.ownerRole]);
    y = drawWrappedTable(doc, columns, rows, y);
  }

  y = ensureSpace(doc, y, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  setText(doc, COLORS.grayText);
  doc.text('Responsibility Matrix (by suggested owner role)', MARGIN_X, y);
  doc.setFont('helvetica', 'normal');
  y += 6;

  y = drawColoredBlock(doc, 'Note', [report.actionPlan.roleDisclosure], y, {
    fill: COLORS.grayFill,
    border: COLORS.grayBorder,
    label: COLORS.grayText,
    text: COLORS.grayText,
  });

  const roleColumns = [
    { header: 'Suggested Owner Role', width: 55 },
    { header: 'Dimensions Owned (Timeframe)', width: 127 },
  ];
  const roleRows = Object.keys(report.actionPlan.byOwnerRole)
    .sort()
    .map((role) => [
      role,
      report.actionPlan.byOwnerRole[role].map((i) => `${i.dimensionName} (${TIMEFRAME_LABELS[i.timeframe]})`).join('; '),
    ]);
  y = drawWrappedTable(doc, roleColumns, roleRows, y);

  return y;
}

/** Appendix A: every captured objective metric across all dimensions, in one reference table. */
function drawMetricAppendix(doc: jsPDF, report: FullDiagnosticReportData, y: number): number {
  y = drawSectionHeader(doc, 'Appendix A: Full Objective Metric Data', y);

  const rows: string[][] = [];
  for (const card of report.dimensionCards) {
    if (!card.objective) continue;
    for (const metric of card.objective.metrics) {
      rows.push([
        card.dimensionName,
        metric.name,
        `${metric.value}${metric.unit}`,
        `${metric.benchmark}${metric.unit}`,
        metric.status,
        metric.dataQuality,
      ]);
    }
  }

  if (rows.length === 0) {
    doc.setFontSize(9.5);
    setText(doc, COLORS.muted);
    y = drawWrappedText(doc, 'No operational metrics have been captured for any dimension yet.', MARGIN_X, y, CONTENT_WIDTH, 4.5);
    setText(doc, COLORS.ink);
    return y;
  }

  const columns = [
    { header: 'Dimension', width: 32 },
    { header: 'Metric', width: 62 },
    { header: 'Value', width: 28 },
    { header: 'Benchmark', width: 28 },
    { header: 'Status', width: 18 },
    { header: 'Data Quality', width: 14 },
  ];
  return drawWrappedTable(doc, columns, rows, y);
}

/** Appendix B: one consolidated reference for how every score/classification in this report is calculated. */
function drawMethodologyAppendix(doc: jsPDF, y: number): number {
  y = drawSectionHeader(doc, 'Appendix B: Methodology & Glossary', y);

  const terms: { label: string; text: string }[] = [
    {
      label: 'Subjective Index (0-100)',
      text: 'Each respondent rates a dimension on a 1-5 Likert scale per question. Their per-dimension average (1-5) is rescaled to a 0-100 index (1 = 0, 5 = 100), then averaged across all respondents for that dimension.',
    },
    {
      label: 'Objective Score (0-100)',
      text: 'Each captured operational metric is normalized to 0-100 against its benchmark (direction-aware: "higher is better" or "lower is better" per metric), then combined into a single per-dimension score, weighting required metrics more heavily than optional ones.',
    },
    {
      label: 'Perception-Reality Gap',
      text: 'Subjective index minus objective score. Gaps within +/-5 points are classified as Aligned; a gap beyond that is classified as an Overestimation (perception higher than reality) or Underestimation (perception lower than reality).',
    },
    {
      label: 'Perception-Reality Quadrant',
      text: 'A separate classification from the gap above - it looks at the absolute level of each score (>=60 counts as "high" on that axis, matching the Adequate/Needs-Attention boundary) rather than how close they are to each other, producing four quadrants: Excellence (both high), Hidden Potential (reality high, perception low), Blind Spot (perception high, reality low), and Crisis (both low).',
    },
    {
      label: '30-60-90 Day Action Plan',
      text: 'Each dimension is bucketed by its subjective status label and quadrant: At Risk status or the Crisis quadrant -> 30 days; Needs Attention status or the Blind Spot quadrant -> 60 days; no data yet, the Hidden Potential quadrant, or an already-Strong/Excellence dimension -> 90 days. Suggested owner roles are a generic default (see the Responsibility Matrix note) - not a record of real staff assignments.',
    },
  ];

  for (const term of terms) {
    y = drawColoredBlock(doc, term.label, [term.text], y, {
      fill: COLORS.grayFill,
      border: COLORS.grayBorder,
      label: COLORS.grayText,
      text: COLORS.grayText,
    });
  }

  y = ensureSpace(doc, y, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  setText(doc, COLORS.grayText);
  doc.text('Data Confidence Tiers', MARGIN_X, y);
  doc.setFont('helvetica', 'normal');
  y += 6;

  for (const tier of DATA_CONFIDENCE_TIER_INFO) {
    y = drawColoredBlock(doc, `${tier.label} (${tier.trust})`, [tier.description, `Example: ${tier.example}`], y, {
      fill: COLORS.grayFill,
      border: COLORS.grayBorder,
      label: COLORS.grayText,
      text: COLORS.grayText,
    });
  }
  y = drawColoredBlock(doc, 'How to use these tiers', [DATA_CONFIDENCE_USAGE_NOTE], y, {
    fill: COLORS.grayFill,
    border: COLORS.grayBorder,
    label: COLORS.grayText,
    text: COLORS.grayText,
  });

  return y;
}

function drawFootersAndPageNumbers(doc: jsPDF, schoolName: string, generatedAt: Date): void {
  const pageCount = doc.getNumberOfPages();
  const leftWidth = 100;
  const midX = MARGIN_X + leftWidth + 6;
  const midWidth = 46;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    setDraw(doc, COLORS.grayBorder);
    doc.setLineWidth(0.2);
    doc.line(MARGIN_X, PAGE_HEIGHT - 14, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    setText(doc, COLORS.muted);
    doc.text(truncateToWidth(doc, `DISHA 14D Diagnostic Report - ${schoolName}`, leftWidth), MARGIN_X, PAGE_HEIGHT - 9);
    doc.text(truncateToWidth(doc, `Generated ${generatedAt.toLocaleDateString()}`, midWidth), midX, PAGE_HEIGHT - 9);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 9, { align: 'right' });
  }
  setText(doc, COLORS.ink);
}

export function generateDiagnosticReportPdf(report: FullDiagnosticReportData, charts?: DiagnosticReportPdfCharts): jsPDF {
  const doc = new jsPDF();
  let y = MARGIN_TOP;

  // Full cover page (page 1) - headline stats, mini table of contents, then
  // a page break so all substantive content starts fresh on page 2.
  drawCoverPage(doc, report);
  y = MARGIN_TOP;

  const breakdown = Object.entries(report.subjective.responsesByStakeholder)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => `${STAKEHOLDER_LABELS[type] || type}: ${count}`)
    .join(', ');
  if (breakdown) {
    doc.setFontSize(9.5);
    setText(doc, COLORS.muted);
    y = drawWrappedText(doc, `Respondents — ${breakdown}`, MARGIN_X, y, CONTENT_WIDTH, 4.5);
    setText(doc, COLORS.ink);
  }
  y += 5;

  // Executive Summary
  y = drawSectionHeader(doc, 'Executive Summary', y);
  y = drawBulletBlock(doc, report.executiveSummary, y, COLORS.indigoFill, COLORS.indigoBorder);

  // Benchmark Data Source
  y = drawSectionHeader(doc, 'Benchmark Data Source', y);
  y = drawColoredBlock(
    doc,
    'Survey Benchmarks',
    [
      `${report.benchmarkSources.subjective.version}, updated ${report.benchmarkSources.subjective.lastUpdated}: ${report.benchmarkSources.subjective.methodology}`,
    ],
    y,
    { fill: COLORS.grayFill, border: COLORS.grayBorder, label: COLORS.grayText, text: COLORS.grayText }
  );
  y = drawColoredBlock(
    doc,
    'Operational Data Benchmarks',
    [
      `${report.benchmarkSources.objective.version}, updated ${report.benchmarkSources.objective.lastUpdated}: ${report.benchmarkSources.objective.methodology}`,
    ],
    y,
    { fill: COLORS.grayFill, border: COLORS.grayBorder, label: COLORS.grayText, text: COLORS.grayText }
  );

  // Visual Analysis - real chart images captured from the on-screen report.
  // Each chart is tall enough that it will almost always trigger its own
  // page break via drawChartImage's internal ensureSpace call; no forced
  // breaks here, so we never leave a blank gap under a section header.
  if (charts?.radarChart || charts?.comparisonChart || charts?.gapChart || charts?.quadrantChart) {
    y = drawSectionHeader(doc, 'Visual Analysis', y);
    if (charts.radarChart) {
      y = drawChartImage(
        doc,
        'Dimension Radar',
        report.objectiveCompleteness.dimensionsWithAnyData > 0
          ? 'Subjective (survey) vs objective (operational data) score per dimension. Dimensions without captured operational data show as 0 on the objective series.'
          : 'Subjective survey score per dimension. Capture operational data to overlay an objective comparison.',
        charts.radarChart,
        y
      );
    }
    if (charts.comparisonChart) {
      y = drawChartImage(
        doc,
        'Subjective vs Objective vs Benchmark',
        'Side-by-side comparison of what stakeholders perceive, what the operational data shows, and the sector benchmark, for every dimension.',
        charts.comparisonChart,
        y
      );
    }
    if (charts.gapChart) {
      y = drawChartImage(
        doc,
        'Perception-Reality Mismatch by Dimension',
        'Positive bars (amber) mean stakeholders rate the dimension higher than the data supports; negative bars (blue) mean the data shows better performance than stakeholders perceive.',
        charts.gapChart,
        y
      );
    }
    if (charts.quadrantChart) {
      y = drawChartImage(
        doc,
        'Perception-Reality Quadrant',
        `Each dimension with both a survey score and captured operational data, plotted by objective score (horizontal) against subjective score (vertical). Dividing lines sit at ${report.quadrantAnalysis.threshold}/100 on each axis.`,
        charts.quadrantChart,
        y
      );
    }
  }

  // Dimension Summary Table
  y = drawSectionHeader(doc, 'Dimension Summary', y);
  y = drawDimensionSummaryTable(doc, report.dimensionCards, y);

  // Dimension Deep-Dive
  y = drawSectionHeader(doc, 'Dimension Deep-Dive', y);
  doc.setFontSize(8.5);
  setText(doc, COLORS.muted);
  y = drawWrappedText(
    doc,
    'All 14 dimensions, each with a detailed analysis, a perception-vs-reality analysis, a root cause analysis, and actionable recommendations - every claim is tied to the specific numbers it is drawn from.',
    MARGIN_X,
    y,
    CONTENT_WIDTH,
    4
  );
  setText(doc, COLORS.ink);
  y += 4;

  for (const card of report.dimensionCards) {
    y = drawDimensionCardHeader(doc, card, y);

    y = ensureSpace(doc, y, 14);
    const subjColor = STATUS_COLORS[card.subjective.status.label] || STATUS_COLORS['No Data'];
    y += drawScoreBar(doc, {
      x: MARGIN_X,
      yStart: y,
      width: CONTENT_WIDTH,
      barHeight: 4,
      valuePct: card.subjective.index ?? 0,
      benchmarkPct: card.benchmark,
      color: subjColor,
      label: `Subjective (survey): ${card.subjective.index ?? 'N/A'}/100  |  benchmark ${card.benchmark}  |  n=${card.subjective.responseCount}`,
    });
    y += 3;

    if (card.objective) {
      y = ensureSpace(doc, y, 14);
      y += drawScoreBar(doc, {
        x: MARGIN_X,
        yStart: y,
        width: CONTENT_WIDTH,
        barHeight: 4,
        valuePct: card.objective.objectiveScore,
        color: COLORS.indigo,
        label: `Objective (operational data): ${card.objective.objectiveScore}/100  |  data completeness ${card.objective.dataCompleteness}%`,
      });
      const confidence = summarizeDataConfidence(card.objective.metrics);
      if (confidence) {
        y += 1;
        doc.setFontSize(7.5);
        setText(doc, COLORS.muted);
        y = drawWrappedText(doc, confidence.description, MARGIN_X, y, CONTENT_WIDTH, 3.6);
        setText(doc, COLORS.ink);
      }
      y += 2;
    } else {
      y = ensureSpace(doc, y, 8);
      doc.setFontSize(8);
      setText(doc, COLORS.muted);
      doc.text('Objective: no operational data captured yet for this dimension.', MARGIN_X, y);
      setText(doc, COLORS.ink);
      y += 6;
    }

    if (card.gap) {
      y = ensureSpace(doc, y, 10);
      const gapColor = GAP_COLORS[card.gap.interpretation];
      const gapLabel = GAP_LABELS[card.gap.interpretation];
      const gapText = `${card.gap.gap > 0 ? '+' : ''}${card.gap.gap.toFixed(1)}`;
      const line = `${gapLabel}  (gap: ${gapText}, perceived ${card.gap.subjectiveScore} vs data ${card.gap.objectiveScore})`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      setText(doc, gapColor);
      const lines: string[] = doc.splitTextToSize(line, CONTENT_WIDTH);
      for (const l of lines) {
        y = ensureSpace(doc, y, 4.2);
        doc.text(l, MARGIN_X, y);
        y += 4.2;
      }
      doc.setFont('helvetica', 'normal');
      setText(doc, COLORS.ink);
      y += 3;
    }

    y = drawColoredBlock(doc, 'Detailed Analysis', card.detailedAnalysis, y, {
      fill: [255, 255, 255],
      border: COLORS.grayBorder,
      label: COLORS.grayText,
      text: COLORS.grayText,
    });
    y = drawColoredBlock(doc, 'Perception vs Reality Analysis', card.perceptionRealityAnalysis, y, {
      fill: COLORS.skyFill,
      border: COLORS.skyBorder,
      label: COLORS.sky,
      text: [3, 105, 161],
    });
    y = drawColoredBlock(doc, 'Root Cause Analysis', card.rootCause, y, {
      fill: COLORS.grayFill,
      border: COLORS.grayBorder,
      label: COLORS.grayText,
      text: COLORS.grayText,
    });
    y = drawColoredBlock(doc, 'Actionable Recommendations (Data-Simulated Choices)', card.actionablePoints, y, {
      fill: COLORS.indigoFill,
      border: COLORS.indigoBorder,
      label: COLORS.indigoText,
      text: COLORS.indigoText,
    });

    y = ensureSpace(doc, y, 4);
    setDraw(doc, COLORS.grayBorder);
    doc.setLineWidth(0.4);
    doc.line(MARGIN_X, y, MARGIN_X + CONTENT_WIDTH, y);
    y += 7;
  }

  // Perception vs Reality Gap Analysis
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
      doc.setFontSize(10);
      doc.text('Key Insights', MARGIN_X, y);
      doc.setFont('helvetica', 'normal');
      y += 5;
      y = drawBulletBlock(doc, insights, y, COLORS.grayFill, COLORS.grayBorder);
    }

    if (recommendations.length > 0) {
      y = ensureSpace(doc, y, 8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Recommended Actions', MARGIN_X, y);
      doc.setFont('helvetica', 'normal');
      y += 5;
      y = drawBulletBlock(doc, recommendations, y, COLORS.indigoFill, COLORS.indigoBorder);
    }
  }

  // Perception-Reality Quadrant Analysis
  y = drawSectionHeader(doc, 'Perception-Reality Quadrant Analysis', y);
  doc.setFontSize(9.5);
  y = drawWrappedText(doc, report.quadrantAnalysis.summary[0], MARGIN_X, y, CONTENT_WIDTH, 4.2);
  y += 3;
  for (const q of QUADRANT_DISPLAY_ORDER) {
    const def = QUADRANT_DEFINITIONS[q];
    const members = report.quadrantAnalysis.byQuadrant[q];
    const palette = QUADRANT_PALETTE[q];
    const lines = [def.explanation];
    if (members.length > 0) {
      lines.push(
        `Dimensions (${members.length}): ${members.map((m) => `${m.dimensionName} (perceived ${m.subjectiveScore}, data ${m.objectiveScore})`).join('; ')}.`
      );
    } else {
      lines.push('No dimension currently falls in this quadrant.');
    }
    y = drawColoredBlock(doc, `${def.label} - ${def.axisDescription}`, lines, y, palette);
  }

  // 30-60-90 Day Action Plan & Responsibility Matrix
  y = drawActionPlanSection(doc, report, y);

  // Objective Data Completeness appendix
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

  const incompleteLines: string[] = [];
  for (const card of report.dimensionCards) {
    const info = report.objectiveCompleteness.byDimension[card.dimensionId];
    if (!info || info.completeness >= 60) continue;
    const missing = info.requiredMissing.length > 0 ? ` — missing: ${info.requiredMissing.join(', ')}` : '';
    incompleteLines.push(`${card.dimensionName}: ${info.completeness}% complete${missing}`);
  }
  if (incompleteLines.length > 0) {
    y = drawBulletBlock(doc, incompleteLines, y, [255, 251, 235], [253, 230, 138]);
  } else {
    doc.setFontSize(9.5);
    setText(doc, COLORS.muted);
    y = drawWrappedText(doc, 'All dimensions have at least 60% objective data completeness.', MARGIN_X, y, CONTENT_WIDTH, 4.5);
    setText(doc, COLORS.ink);
  }

  // Appendices
  y = drawMetricAppendix(doc, report, y);
  y = drawMethodologyAppendix(doc, y);

  drawFootersAndPageNumbers(doc, report.schoolName, report.generatedAt);

  return doc;
}

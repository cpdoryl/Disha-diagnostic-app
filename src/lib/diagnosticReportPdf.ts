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
import { summarizeDataConfidence } from './objectiveScoreEngine';

export interface ChartImage {
  dataUrl: string;
  width: number;
  height: number;
}

export interface DiagnosticReportPdfCharts {
  radarChart?: ChartImage | null;
  comparisonChart?: ChartImage | null;
  gapChart?: ChartImage | null;
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

  // Cover header
  setFill(doc, COLORS.indigo);
  doc.rect(0, 0, PAGE_WIDTH, 38, 'F');
  setText(doc, [255, 255, 255]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('14D Diagnostic Report', MARGIN_X, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text(truncateToWidth(doc, report.schoolName, CONTENT_WIDTH), MARGIN_X, 26);
  doc.setFontSize(9);
  doc.text(
    `${truncateToWidth(doc, report.eventName, CONTENT_WIDTH * 0.6)}  |  Generated ${report.generatedAt.toLocaleString()}`,
    MARGIN_X,
    32.5
  );
  setText(doc, COLORS.ink);
  y = 46;

  const overallIndex = report.subjective.overallIndex;
  const overallStatus = getHealthStatus(overallIndex);
  const overallColor = STATUS_COLORS[overallStatus.label] || STATUS_COLORS['No Data'];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  setText(doc, overallColor);
  doc.text(`Overall Institutional Health Index: ${overallIndex ?? 'N/A'}/100 (${overallStatus.label})`, MARGIN_X, y);
  setText(doc, COLORS.ink);
  doc.setFont('helvetica', 'normal');
  y += 8;

  doc.setFontSize(10);
  y = drawWrappedText(
    doc,
    `Based on ${report.subjective.totalResponses} response${report.subjective.totalResponses === 1 ? '' : 's'} across 14 dimensions. Objective operational data captured for ${report.objectiveCompleteness.dimensionsWithAnyData}/14 dimensions (${report.objectiveCompleteness.overallCompleteness}% overall completeness).`,
    MARGIN_X,
    y,
    CONTENT_WIDTH
  );
  y += 2;

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
  if (charts?.radarChart || charts?.comparisonChart || charts?.gapChart) {
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

  drawFootersAndPageNumbers(doc, report.schoolName, report.generatedAt);

  return doc;
}

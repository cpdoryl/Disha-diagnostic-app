/**
 * First Opinion Report - PDF Generator
 *
 * Produces ONE downloadable PDF containing:
 *   PART A - Main Report: mirrors the on-screen Step 3 report exactly
 *            (nothing on screen is omitted), with benchmark references
 *            added inline so no number appears without the standard it's
 *            being judged against.
 *   PART B - Annexure: full transparency pack - every raw input received,
 *            every intermediate calculation ("hand calculation" style),
 *            the exact weights/bands used, and a benchmark reference
 *            library explaining where each threshold comes from (a real
 *            external standard, a real survey question, or an authored
 *            placeholder pending calibration - see
 *            DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md Addendum 3).
 *
 * Deliberately does NOT store the rendered PDF anywhere: everything it
 * prints is deterministically derivable from the same CheckupAnalysis
 * record already persisted by checkupService.ts's saveCheckupAnalysis(),
 * so "download the report for a past checkup" just means calling this
 * function again with that record's data - no duplicate, staleness-prone
 * copy of the report ever needs to be kept in the database.
 */

import { DISHAScore } from './dishaScoreCalculator';
import { DataAnalysisResult } from './insightGenerator';
import { PerceptionGapEntry } from './challengeObjectiveScoring';
import { METRIC_BAND_DEFINITIONS, scoreRawValueToWeight } from './challengeObjectiveScoring';
import { CHALLENGE_DATA_REQUIREMENTS, CORE_OPERATIONAL_METRICS } from './challengeDataRequirements';

const COMPANY_NAME = 'RYL Neuroacademy Private Limited';
const SUITE_NAME = 'DISHA Diagnostic Suite';

export interface AnsweredQuestionDetail {
  questionId: string;
  challengeKey: string;
  challengeLabel: string;
  questionLabel: string;
  selectedOptionLabel: string;
  weight: number;
}

/** A chart rasterized from its on-screen Recharts component (via html2canvas by the caller) so the PDF, which has no live DOM, can still embed the same visual the user sees. */
export interface ReportChartImage {
  dataUrl: string;
  width: number;
  height: number;
}

export interface FirstOpinionReportPdfInput {
  referenceId: string;
  schoolName: string;
  board: string;
  city: string;
  cityTier: string;
  feeBand: string;
  generatedAt: Date;
  selectedChallenges: string[];
  challengeLabels: Record<string, string>;
  answeredQuestions: AnsweredQuestionDetail[];
  dishaScore: DISHAScore;
  realInsights: DataAnalysisResult;
  perceptionGap: PerceptionGapEntry[];
  extractedMetricsFound: Record<string, number | string>;
  /** SHA-256 hash of the raw inputs (see reportIntegrity.ts's computeInputsChecksum) - printed so anyone can independently hash the same raw values (Annexure I) and confirm they match, without trusting this app's own claim that nothing was altered. Optional only so a caller without it (unexpected) still gets a full report rather than a crash. */
  inputsChecksum?: string;
  /** Optional: on-screen chart snapshots. When omitted (e.g. capture failed), the PDF still prints the equivalent data as tables/text - it never simply drops a chart section, per the "without deleting any part" report requirement. */
  charts?: {
    leversBar?: ReportChartImage | null;
    perceptionRadar?: ReportChartImage | null;
  };
}

/**
 * jsPDF's built-in "helvetica" font only supports WinAnsi-range characters.
 * Any emoji or special Unicode symbol (common in this app's own generated
 * strings, e.g. dishaScoreCalculator.ts's "⚠ POOR: ..." interpretations, or
 * ≤/≥/→ used for benchmark bands) either renders as a missing glyph or -
 * worse - is mismeasured by splitTextToSize, so the actual wrapped text
 * silently overlaps whatever is drawn next. Every dynamic string is routed
 * through this before reaching doc.text()/autoTable so that never happens.
 */
function sanitizePdfText(text: string): string {
  return String(text)
    .replace(/⚠️|⚠/g, '[!] ')
    .replace(/✅|✓/g, '[OK] ')
    .replace(/❌/g, '[X] ')
    .replace(/⚖️|📌|🔍|💡/g, '')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/→/g, '->')
    .replace(/•/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

const VERDICT_LABEL: Record<string, string> = {
  ALIGNED: 'Aligned - perception matches reality',
  DELUSIONAL_COMFORT: 'Delusional Comfort - worse than perceived',
  HIDDEN_EXCELLENCE: 'Hidden Excellence - better than perceived',
  CONFIRMED_CRISIS: 'Confirmed Crisis - both agree it is bad',
  INSUFFICIENT_DATA: 'Insufficient objective data uploaded'
};

function fieldDisplayName(fieldName: string): string {
  const core = CORE_OPERATIONAL_METRICS.find((m) => m.fieldName === fieldName);
  if (core) return core.displayName;
  for (const req of Object.values(CHALLENGE_DATA_REQUIREMENTS)) {
    const m = req.requiredMetrics.find((rm) => rm.fieldName === fieldName);
    if (m) return m.displayName;
  }
  return fieldName;
}

function fieldChallengeLabel(fieldName: string, challengeLabels: Record<string, string>): string {
  if (CORE_OPERATIONAL_METRICS.some((m) => m.fieldName === fieldName)) return 'Core Operational Lever (always required)';
  for (const [key, req] of Object.entries(CHALLENGE_DATA_REQUIREMENTS)) {
    if (req.requiredMetrics.some((rm) => rm.fieldName === fieldName)) {
      return challengeLabels[key] || req.challengeName;
    }
  }
  return '-';
}

export async function generateFirstOpinionReportPdf(input: FirstOpinionReportPdfInput): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 16;
  let y = 20;

  const checkPageBreak = (spaceNeeded: number) => {
    if (y + spaceNeeded > pageHeight - 18) {
      doc.addPage();
      y = 20;
    }
  };

  const sectionTitle = (text: string, opts?: { subtitle?: string }) => {
    checkPageBreak(18);
    doc.setFillColor(23, 37, 84);
    doc.rect(marginX, y - 6, pageWidth - marginX * 2, 9, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(sanitizePdfText(text), marginX + 3, y);
    y += 8;
    if (opts?.subtitle) {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      const split = doc.splitTextToSize(sanitizePdfText(opts.subtitle), pageWidth - marginX * 2);
      doc.text(split, marginX, y);
      y += split.length * 4 + 3;
    } else {
      y += 3;
    }
  };

  const paragraph = (text: string, opts?: { size?: number; color?: [number, number, number] }) => {
    doc.setFontSize(opts?.size ?? 9);
    doc.setFont('helvetica', 'normal');
    const c = opts?.color ?? [60, 60, 60];
    doc.setTextColor(c[0], c[1], c[2]);
    const split = doc.splitTextToSize(sanitizePdfText(text), pageWidth - marginX * 2);
    checkPageBreak(split.length * 4.2 + 2);
    doc.text(split, marginX, y);
    y += split.length * 4.2 + 3;
  };

  const table = (head: string[], body: (string | number)[][], opts?: { columnStyles?: any }) => {
    checkPageBreak(20);
    autoTable(doc, {
      startY: y,
      head: [head.map((h) => sanitizePdfText(h))],
      body: body.map((row) => row.map((cell) => (typeof cell === 'number' ? cell : sanitizePdfText(cell)))),
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      bodyStyles: { fontSize: 8, textColor: [55, 65, 81], cellPadding: 2 },
      alternateRowStyles: { fillColor: [246, 248, 251] },
      margin: { left: marginX, right: marginX },
      columnStyles: opts?.columnStyles
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  };

  // Draws a rasterized on-screen chart (title + bordered image + caption),
  // measuring it up front so the whole block moves to the next page together
  // rather than splitting an image across a page break. Capped at 85mm tall
  // so a wide/short chart doesn't dominate the page.
  const chart = (title: string, img: ReportChartImage, caption: string) => {
    const maxWidth = pageWidth - marginX * 2;
    const aspect = img.height / img.width;
    let imgWidth = maxWidth;
    let imgHeight = imgWidth * aspect;
    const maxImgHeight = 85;
    if (imgHeight > maxImgHeight) {
      imgHeight = maxImgHeight;
      imgWidth = imgHeight / aspect;
    }
    checkPageBreak(imgHeight + 16);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(sanitizePdfText(title), marginX, y);
    y += 6;
    const x = marginX + (maxWidth - imgWidth) / 2;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.rect(x, y, imgWidth, imgHeight);
    doc.addImage(img.dataUrl, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
    y += imgHeight + 4;
    paragraph(caption, { size: 8.3, color: [90, 90, 90] });
  };

  // ============================================================
  // LETTERHEAD (first page)
  // ============================================================
  doc.setFillColor(23, 37, 84);
  doc.rect(0, 0, pageWidth, 26, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(COMPANY_NAME, marginX, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 210, 240);
  doc.text(`${SUITE_NAME} - School First Opinion Engine`, marginX, 19);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(sanitizePdfText(input.referenceId), pageWidth - marginX, 12, { align: 'right' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 210, 240);
  doc.text(input.generatedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), pageWidth - marginX, 18, { align: 'right' });

  y = 36;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('School First Opinion Report', marginX, y);
  y += 6;
  if (input.inputsChecksum) {
    doc.setFontSize(7);
    doc.setFont('courier', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(`Input Checksum (SHA-256): ${input.inputsChecksum}  -  see Annexure I for how to verify`, marginX, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
  } else {
    y += 2;
  }

  table(
    ['School', 'Board', 'City / Tier', 'Fee Band'],
    [[input.schoolName, input.board, `${input.city} (${input.cityTier})`, input.feeBand]]
  );

  paragraph(
    `Selected Challenges: ${input.selectedChallenges.map((k) => input.challengeLabels[k] || k).join('  |  ')}`,
    { size: 9.5, color: [30, 41, 59] }
  );

  // ============================================================
  // PART A: MAIN REPORT
  // ============================================================
  const s = input.dishaScore;

  sectionTitle('PART A - FIRST OPINION SCORE');
  table(
    ['Classification', 'Risk Level', 'Layer 1: Perception (S_sub)', 'Layer 2: Reality (M_obj)', 'Layer 3: Health Index'],
    [[s.riskQuadrantName, s.riskLevel, s.s_sub.toFixed(2), s.m_obj.toFixed(3), s.healthIndex.toFixed(2)]]
  );
  paragraph(`Leadership Perception (S_sub): ${s.s_sub_interpretation}`);
  paragraph(`Operational Reality (M_obj): ${s.m_obj_interpretation}`);
  paragraph(`Health Index interpretation: ${s.healthIndex_interpretation}`);

  sectionTitle('Benchmark Reference: Health Index & Risk Classification', {
    subtitle: 'The Health Index (0-100) is graded against these fixed bands - the same bands shown live in the app.'
  });
  table(
    ['Band', 'Health Index Score', 'Meaning'],
    [
      ['GREEN (Elite)', '70 +', 'Excellent, sustainable'],
      ['YELLOW (Concern)', '50 - 70', 'Leverage strengths'],
      ['ORANGE (At Risk)', '30 - 50', 'Action needed'],
      ['RED (Critical)', 'Below 30', 'Emergency response']
    ]
  );

  sectionTitle('Operational Metrics Breakdown (Core Levers)', {
    subtitle: 'Each Core Operational Lever converts its raw value into a 0.2-1.05 multiplier via a fixed benchmark band, then all four multiply together to form M_obj.'
  });
  table(
    ['Core Lever', 'Multiplier Applied', 'Benchmark Bands (Ideal / Good / Fair / Poor)'],
    [
      ['Student-Teacher Ratio', s.m_str.toFixed(2) + 'x', '≤20 / 21-28 / 29-35 / >35 students per teacher'],
      ['Parent Response SLA', s.m_sla.toFixed(2) + 'x', '≤12h (same day) / 13-24h / 25-48h / >48h'],
      ['Annual Teacher Training', s.m_train.toFixed(2) + 'x', '≥25h/yr / 15-24h/yr / - / <15h/yr'],
      ['Weekly Planning Time', s.m_plan.toFixed(2) + 'x', '≥5h/wk / 3-5h/wk / - / <3h/wk']
    ]
  );

  if (input.charts?.leversBar) {
    chart(
      'Visual: Core Operational Levers vs Ideal Benchmark',
      input.charts.leversBar,
      'Each bar is that lever\'s multiplier expressed as a % of the "Ideal" (100%) threshold from the table above. Green meets/beats Ideal, blue is Good, amber is Acceptable but taxing, red is Poor. Because M_obj multiplies all four together rather than averaging them, the single lowest (reddest) bar has an outsized effect on the Health Index - it is usually the highest-leverage fix.'
    );
  }

  sectionTitle('Perception Gap Analysis - Per Selected Challenge', {
    subtitle: 'Self-reported severity (from the screening questionnaire) vs. objective severity (from uploaded operational data), both on a 1 (healthy) to 10 (severe) scale. A challenge is treated as "a real concern" once its severity exceeds 5.'
  });
  table(
    ['Challenge', 'Self-Reported', 'Objective (Data-Derived)', 'Verdict'],
    input.perceptionGap.map((g) => [
      g.challengeLabel,
      g.subjectiveWeight !== null ? `${g.subjectiveWeight}/10` : 'N/A',
      g.objectiveWeight !== null ? `${g.objectiveWeight}/10` : 'N/A',
      VERDICT_LABEL[g.verdict] || g.verdict
    ])
  );

  if (input.charts?.perceptionRadar) {
    chart(
      'Visual: Perception vs Reality - Radar View',
      input.charts.perceptionRadar,
      'One axis per selected challenge; the indigo shape is what leadership self-reported, the red shape is what the uploaded data shows, both on a 1 (healthy) to 10 (severe) scale. Where the shapes nearly overlap, perception matches reality (Aligned). Where red reaches further out than indigo, the real situation is worse than believed (Delusional Comfort) - the pattern most likely to cause a surprise crisis. Where indigo reaches further than red, the school may be under-crediting a real strength (Hidden Excellence). A vertex sitting at the centre on either shape means that side had insufficient data to score - see the table above for which.'
    );
  }

  sectionTitle('Data-Driven Insights from Operational Metrics');
  paragraph(input.realInsights.overallAssessment, { size: 9.5, color: [30, 41, 59] });

  paragraph('Key Findings (Top 5, ranked by severity):', { size: 9.5, color: [15, 23, 42] });
  input.realInsights.keyFindings.forEach((f, i) => paragraph(`${i + 1}. ${f}`));

  sectionTitle('Prioritized Recommended Actions (Top 5, ranked by severity)');
  input.realInsights.recommendations.forEach((r, i) => paragraph(`${i + 1}. ${r}`));

  table(
    ['Metrics Extracted', 'Data Completeness', 'Data Reliability'],
    [[
      `${input.realInsights.dataQuality.metricsFound} of ${input.realInsights.dataQuality.metricsExpected} expected`,
      `${input.realInsights.dataQuality.completeness}%`,
      input.realInsights.dataQuality.reliability.toUpperCase()
    ]]
  );

  // ============================================================
  // PART B: ANNEXURE
  // ============================================================
  doc.addPage();
  y = 20;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('ANNEXURE - Full Calculation & Transparency Record', marginX, y);
  y += 6;
  paragraph(
    `Reference: ${input.referenceId}. This annexure exists so no figure in Part A is a "black box" - every raw input, every intermediate calculation, and the origin of every benchmark used is reproduced below in full, so the report can be checked by hand.`,
    { size: 8.5, color: [90, 90, 90] }
  );

  // --- Annexure I: Raw inputs received ---
  sectionTitle('Annexure I - Raw Inputs Received');

  if (input.inputsChecksum) {
    paragraph(
      `Input Checksum (SHA-256): ${input.inputsChecksum}`,
      { size: 8, color: [55, 65, 81] }
    );
    paragraph(
      'This is a cryptographic fingerprint of every raw value in tables I.1 and I.2 below (the selected challenges, every answered question, and every uploaded/checklist-derived metric) - and nothing else. It changes if even one answer or one metric value is different, and is otherwise identical no matter when or how many times it is recomputed. Anyone can independently verify this report was not altered after submission: reproduce the canonical (sorted-key) JSON of {selectedChallenges, answers, extractedMetricsFound} exactly as recorded in this annexure and hash it with SHA-256 - a match proves these are the untouched original inputs.',
      { size: 8, color: [90, 90, 90] }
    );
  }

  paragraph('I.1 Screening Questionnaire Answers', { size: 9.5, color: [15, 23, 42] });
  table(
    ['Challenge', 'Question', 'Selected Answer', 'Weight (1-10)'],
    input.answeredQuestions.map((a) => [a.challengeLabel, a.questionLabel, a.selectedOptionLabel, a.weight])
  );

  paragraph('I.2 Uploaded Operational Metrics (Canonical CSV / Checklist-Derived)', { size: 9.5, color: [15, 23, 42] });
  table(
    ['Field', 'Value', 'Source Domain'],
    Object.entries(input.extractedMetricsFound).map(([field, value]) => [
      fieldDisplayName(field),
      String(value),
      fieldChallengeLabel(field, input.challengeLabels)
    ])
  );

  // --- Annexure II: Hand calculation ---
  sectionTitle('Annexure II - Step-by-Step Hand Calculation');

  paragraph('II.1 Layer 1 - Leadership Perception (S_sub)', { size: 9.5, color: [15, 23, 42] });
  paragraph('Formula: S_sub = 100 - (Sum of Selected Weights / Maximum Possible Weight x 100)');
  {
    const sumWeights = input.answeredQuestions.reduce((sum, a) => sum + a.weight, 0);
    const maxPossible = input.answeredQuestions.length * 10;
    const pct = maxPossible > 0 ? (sumWeights / maxPossible) * 100 : 0;
    table(
      ['Sum of Selected Weights', 'Maximum Possible (questions x 10)', 'Percentage', 'S_sub = 100 - Percentage'],
      [[sumWeights, maxPossible, `${pct.toFixed(2)}%`, s.s_sub.toFixed(2)]]
    );
  }

  paragraph('II.2 Layer 2 - Operational Reality (M_obj)', { size: 9.5, color: [15, 23, 42] });
  paragraph('Formula: M_obj = Student-Teacher Multiplier x Parent SLA Multiplier x Training Multiplier x Planning Multiplier');
  table(
    ['m_str', 'm_sla', 'm_train', 'm_plan', 'M_obj (product)'],
    [[s.m_str.toFixed(3), s.m_sla.toFixed(3), s.m_train.toFixed(3), s.m_plan.toFixed(3), s.m_obj.toFixed(3)]]
  );

  paragraph('II.3 Delusion Penalty', { size: 9.5, color: [15, 23, 42] });
  paragraph('Rule: IF S_sub >= 80 AND M_obj < 0.7, THEN Penalty = S_sub - 80, ELSE Penalty = 0.');
  table(
    ['S_sub >= 80?', 'M_obj < 0.7?', 'Penalty Applied'],
    [[s.s_sub >= 80 ? 'Yes' : 'No', s.m_obj < 0.7 ? 'Yes' : 'No', s.delusionPenalty.toFixed(2)]]
  );

  paragraph('II.4 Layer 3 - Health Index (H)', { size: 9.5, color: [15, 23, 42] });
  paragraph('Formula: Scaled Score = S_sub x M_obj.  Health Index = Scaled Score - Delusion Penalty (bounded to 0-100).');
  table(
    ['S_sub', 'M_obj', 'Scaled Score (S_sub x M_obj)', 'Delusion Penalty', 'Health Index (H)'],
    [[s.s_sub.toFixed(2), s.m_obj.toFixed(3), s.scaledScore.toFixed(2), s.delusionPenalty.toFixed(2), s.healthIndex.toFixed(2)]]
  );

  paragraph('II.5 Risk Quadrant Classification', { size: 9.5, color: [15, 23, 42] });
  paragraph('Color/Classification is decided purely by the Health Index band above. The quadrant NAME separately reflects the Perception-vs-Reality gap: Gap = S_sub - (M_obj x 100). |Gap| <= 10 is treated as aligned; beyond that, the larger side determines "Delusional Comfort" (perception better than reality) or "Hidden Excellence" (reality better than perception).');
  {
    const gap = s.s_sub - s.m_obj * 100;
    table(
      ['S_sub', 'M_obj x 100', 'Gap (S_sub - M_obj x100)', '|Gap| > 10 ?', 'Resulting Name'],
      [[s.s_sub.toFixed(2), (s.m_obj * 100).toFixed(2), gap.toFixed(2), Math.abs(gap) > 10 ? 'Yes' : 'No', s.riskQuadrantName]]
    );
  }

  paragraph('II.6 Perception Gap - Per-Challenge Detail', { size: 9.5, color: [15, 23, 42] });
  paragraph('For each challenge, Subjective Weight is the average weight of that challenge\'s own answered screening questions (from Annexure I.1). Objective Weight is the average of that challenge\'s 2 canonical metrics, each converted from its raw value to a 1-10 severity via the benchmark bands in Annexure III. A side is "a concern" once its weight exceeds 5.');
  input.selectedChallenges.forEach((challengeKey) => {
    const req = CHALLENGE_DATA_REQUIREMENTS[challengeKey];
    const gapEntry = input.perceptionGap.find((g) => g.challengeKey === challengeKey);
    if (!req || !gapEntry) return;
    checkPageBreak(30);
    paragraph(`${input.challengeLabels[challengeKey] || req.challengeName}:`, { size: 9, color: [30, 41, 59] });
    const metricRows = req.requiredMetrics.map((m) => {
      const raw = input.extractedMetricsFound[m.fieldName];
      const weight = raw !== undefined ? scoreRawValueToWeight(m.fieldName, raw) : null;
      return [m.displayName, raw !== undefined ? String(raw) : 'not uploaded', weight !== null ? String(weight) : '-'];
    });
    table(['Objective Metric', 'Raw Value', 'Severity Weight (1-10)'], metricRows);
    table(
      ['Subjective Weight (avg. of answers)', 'Objective Weight (avg. of metrics)', 'Verdict'],
      [[
        gapEntry.subjectiveWeight !== null ? String(gapEntry.subjectiveWeight) : 'N/A',
        gapEntry.objectiveWeight !== null ? String(gapEntry.objectiveWeight) : 'N/A',
        VERDICT_LABEL[gapEntry.verdict] || gapEntry.verdict
      ]]
    );
  });

  paragraph('II.7 Data-Driven Insights - Every Uploaded Metric (full list, not truncated)', { size: 9.5, color: [15, 23, 42] });
  table(
    ['Metric', 'Value', 'Benchmark/Threshold', 'Status', 'Priority', 'Finding'],
    input.realInsights.insights.map((ins) => [
      ins.metric,
      String(ins.currentValue),
      String(ins.benchmark),
      ins.status.toUpperCase(),
      ins.priority.toUpperCase(),
      ins.finding
    ]),
    { columnStyles: { 5: { cellWidth: 55 } } }
  );

  // --- Annexure III: Benchmark reference library ---
  sectionTitle('Annexure III - Benchmark Reference Library for This Report', {
    subtitle: 'Every metric used above, its severity bands, and - critically - where that band came from: an exact real survey question, a real external standard (e.g. RTE Act norms), or an authored analogous placeholder pending real-world calibration.'
  });
  {
    const rows: (string | number)[][] = [];
    input.selectedChallenges.forEach((challengeKey) => {
      const req = CHALLENGE_DATA_REQUIREMENTS[challengeKey];
      if (!req) return;
      req.requiredMetrics.forEach((m) => {
        const band = METRIC_BAND_DEFINITIONS[m.fieldName];
        if (!band) return;
        rows.push([
          m.displayName,
          band.bands.map((b) => (isFinite(b.max) ? `≤${b.max}→${b.weight}` : `>${band.bands[band.bands.length - 2]?.max ?? ''}→${b.weight}`)).join('  '),
          band.authored ? 'Authored (analogous placeholder)' : 'Exact (matches a real survey question)',
          band.bandSource
        ]);
      });
    });
    table(['Metric', 'Severity Bands (value → 1-10 weight)', 'Provenance', 'Source Detail'], rows, {
      columnStyles: { 3: { cellWidth: 60 } }
    });
  }

  // --- Annexure IV: Methodology & data provenance note ---
  doc.addPage();
  y = 20;
  sectionTitle('Annexure IV - Methodology Notes & Benchmark Provenance');
  paragraph(
    'The DISHA First Opinion Engine combines two independent read-outs of institutional health: Layer 1 (S_sub) is entirely self-reported by school leadership through a structured 15-challenge screening questionnaire, weighted 1 (healthy) to 10 (severe) per answer. Layer 2 (M_obj) is entirely derived from uploaded operational data across 4 Core Operational Levers, each scored against a fixed benchmark band. Layer 3 (Health Index) combines the two, and independently, a Perception Gap is computed per selected challenge comparing what leadership believes against what the uploaded data shows for that same challenge.'
  );
  paragraph(
    'Not every benchmark band used in this engine carries the same evidentiary weight. Roughly half of the 30 challenge-specific metrics use bands copied verbatim from this same questionnaire\'s own real answer options (marked "Exact" in Annexure III) - a raw uploaded value and a self-reported answer are directly comparable for these. The remainder are authored by analogy to sibling metrics because no matching quantitative question exists in the question bank (marked "Authored" in Annexure III) - these should be treated as a reasonable, documented placeholder rather than a validated external threshold, pending real institutional benchmark data.'
  );
  paragraph(
    'Two metrics used in this report - Infrastructure Quality Score and Compliance Score - are grounded in real external standards: the RTE Act 2009 Schedule\'s core infrastructure norms, and a set of core, board/state-agnostic regulatory compliance domains mandated by central law, respectively. Both are computed as a checklist compliance rate (norms/domains met, divided by the total), not a subjective self-rating.'
  );
  paragraph(
    `This report and its complete calculation trail are reproducible: given the same raw inputs recorded in Annexure I, every figure in Part A and Annexure II can be independently re-derived using the formulas stated above. Report reference ${input.referenceId} is the unique identifier for this specific submission and can be used to retrieve it again later via the First Opinion Engine's "Past Reports" browser.`
  );

  // ============================================================
  // FOOTER on every page
  // ============================================================
  const pageCount = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 220, 220);
    doc.line(marginX, pageHeight - 14, pageWidth - marginX, pageHeight - 14);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140, 140, 140);
    doc.text(COMPANY_NAME, marginX, pageHeight - 9);
    doc.text(sanitizePdfText(`${input.referenceId} - Page ${i} of ${pageCount}`), pageWidth / 2, pageHeight - 9, { align: 'center' });
    doc.text('Confidential - For Internal School Use', pageWidth - marginX, pageHeight - 9, { align: 'right' });
  }

  const safeSchoolName = input.schoolName.replace(/[^a-z0-9]+/gi, '_');
  doc.save(`DISHA-FirstOpinion-${input.referenceId}-${safeSchoolName}.pdf`);
}

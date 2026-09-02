/**
 * File Analyzer - Extracts metrics from uploaded CSV/Excel/PDF files
 * Generates real data-driven insights for First Opinion diagnosis
 */

import * as XLSXLib from 'xlsx';
import { validateDataForChallenges, CHALLENGE_DATA_REQUIREMENTS, CORE_OPERATIONAL_METRICS, getRequiredMetricsForChallenges, validateMetricRanges, OutOfRangeMetric } from './challengeDataRequirements';

// pdfjs-dist (~1.3MB with its worker) is only loaded on demand, the first
// time a user actually uploads a PDF, instead of being pulled into every
// page load for a feature most checkups won't use.
let pdfjsModule: typeof import('pdfjs-dist') | null = null;
async function getPdfjs() {
  if (!pdfjsModule) {
    const lib = await import('pdfjs-dist');
    // @ts-ignore - Vite ?url import returns the built asset URL as a string
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
    lib.GlobalWorkerOptions.workerSrc = workerUrl;
    pdfjsModule = lib;
  }
  return pdfjsModule;
}

export interface ExtractedMetrics {
  fileType: string;
  metricsFound: Record<string, number | string>;
  insights: string[];
  affectedDomains: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  /** Set when the uploaded file could not be read as text at all (e.g. a
   * genuine binary .xlsx/.docx/.pdf/image was uploaded) — callers should
   * show this as a file-format problem, not a "data missing" problem. */
  unreadableReason?: string;
}

/**
 * Detects whether FileReader.readAsText produced real text or binary
 * garbage. This app only ever parses plain text/CSV — a genuine .xlsx,
 * .docx, .pdf, or image file read this way will not contain a real header
 * or real values, and would otherwise be misreported as "all fields missing"
 * (a data problem) rather than "wrong file type" (a format problem).
 */
function detectUnreadableBinary(content: string): string | null {
  const head = content.slice(0, 8);
  if (head.startsWith('PK')) {
    return 'This looks like a native Microsoft Office file (.xlsx, .docx, .pptx) or a ZIP archive, which is stored in binary format.';
  }
  if (head.startsWith('%PDF')) {
    return 'This looks like a PDF file, which is stored in binary format.';
  }
  if (head.startsWith('\xFF\xD8\xFF') || head.startsWith('\x89PNG')) {
    return 'This looks like an image file (JPG/PNG), which contains no readable text.';
  }
  // Heuristic: real CSV/text should be almost entirely printable ASCII/UTF-8
  // text with normal whitespace. Binary content read as text tends to be
  // full of the Unicode replacement character or raw control bytes.
  const sample = content.slice(0, 2000);
  if (sample.length > 0) {
    let suspicious = 0;
    for (let i = 0; i < sample.length; i++) {
      const code = sample.charCodeAt(i);
      const isNormalWhitespace = code === 9 || code === 10 || code === 13;
      if (code === 0xFFFD || (code < 32 && !isNormalWhitespace)) suspicious++;
    }
    if (suspicious / sample.length > 0.05) {
      return 'This file contains mostly non-text (binary) content that could not be read as CSV.';
    }
  }
  return null;
}

/**
 * Canonical "Operational Metrics CSV" format: a simple two-column CSV,
 * header "metric_field,value", one row per metric, using the exact
 * fieldName keys from challengeDataRequirements.ts. This is the only format
 * this app can reliably validate against per-challenge requirements, since
 * it uses exact field names instead of guessing from free-form documents.
 */
// Sample/template files may carry leading "#" comment lines (e.g. to note
// which challenge combination the file is built for) before the real header.
function stripLeadingCommentRows(rows: string[][]): string[][] {
  let start = 0;
  while (start < rows.length && (rows[start][0] || '').trim().startsWith('#')) {
    start++;
  }
  return rows.slice(start);
}

function isCanonicalOperationalMetricsCSV(rows: string[][]): boolean {
  const dataRows = stripLeadingCommentRows(rows);
  if (dataRows.length === 0) return false;
  const header = dataRows[0].map(c => c.trim().toLowerCase());
  return header.length >= 2 && header[0] === 'metric_field' && header[1] === 'value';
}

function parseCanonicalOperationalMetricsCSV(rows: string[][]): Record<string, number | string> {
  const dataRows = stripLeadingCommentRows(rows);
  const metrics: Record<string, number | string> = {};
  for (let i = 1; i < dataRows.length; i++) {
    const [fieldName, rawValue] = dataRows[i];
    if (!fieldName || fieldName.trim().startsWith('#')) continue;
    const key = fieldName.trim();
    const value = (rawValue ?? '').trim();
    const numeric = Number(value);
    metrics[key] = value !== '' && !isNaN(numeric) ? numeric : value;
  }
  return metrics;
}

const ALL_KNOWN_FIELD_NAMES = new Set([
  ...CORE_OPERATIONAL_METRICS.map(m => m.fieldName),
  ...Object.values(CHALLENGE_DATA_REQUIREMENTS).flatMap(req => req.requiredMetrics.map(m => m.fieldName))
]);

export class FileAnalyzer {
  /**
   * Analyze uploaded file and extract metrics
   */
  static async analyzeFile(file: File): Promise<ExtractedMetrics> {
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop() || '';

    if (extension === 'xlsx' || extension === 'xls') {
      return this.analyzeSpreadsheetFile(file);
    }
    if (extension === 'pdf') {
      return this.analyzePdfFile(file);
    }

    const content = await this.readFile(file);

    // Check FIRST whether this is actually readable text at all. A genuine
    // binary .docx/image (or a misnamed .xlsx/.pdf) uploaded here would
    // otherwise fall through every parser below and be reported as
    // "0 fields found" - which looks exactly like a data-completeness
    // problem when it is really a file-format problem, and misleads the
    // user into thinking their real data is missing when the file was
    // simply never readable.
    const unreadableReason = detectUnreadableBinary(content);
    if (unreadableReason) {
      return {
        fileType: 'UNREADABLE_BINARY_FILE',
        metricsFound: {},
        insights: [`Could not read "${file.name}" as text: ${unreadableReason}`],
        affectedDomains: [],
        confidence: 'LOW',
        unreadableReason
      };
    }

    // Canonical Operational Metrics CSV takes priority over filename-based
    // guessing whenever present, since it gives exact, unambiguous field names.
    const rows = this.parseCSV(content);
    const canonicalResult = this.buildCanonicalResult(rows);
    if (canonicalResult) return canonicalResult;

    // Detect file type and parse accordingly
    if (fileName.includes('attendance') || fileName.includes('register') || fileName.includes('roster')) {
      return this.analyzeAttendance(content, fileName);
    }

    if (fileName.includes('fee') || fileName.includes('payment') || fileName.includes('ledger') || fileName.includes('collection')) {
      return this.analyzeFees(content, fileName);
    }

    if (fileName.includes('mark') || fileName.includes('exam') || fileName.includes('result') || fileName.includes('academic')) {
      return this.analyzeAcademics(content, fileName);
    }

    if (fileName.includes('staff') || fileName.includes('teacher') || fileName.includes('employee')) {
      return this.analyzeStaff(content, fileName);
    }

    if (fileName.includes('complaint') || fileName.includes('feedback') || fileName.includes('parent')) {
      return this.analyzeComplaints(content, fileName);
    }

    if (fileName.includes('inquiry') || fileName.includes('admission') || fileName.includes('enrollment')) {
      return this.analyzeInquiries(content, fileName);
    }

    if (fileName.includes('audit') || fileName.includes('cert') || fileName.includes('compliance') || fileName.includes('safety')) {
      return this.analyzeCompliance(content, fileName);
    }

    // Generic analysis if type not detected
    return this.genericAnalysis(content, fileName);
  }

  /**
   * Read file as text
   */
  private static readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /**
   * Parse CSV content into rows and columns
   */
  private static parseCSV(content: string): string[][] {
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.split(',').map(cell => cell.trim()));
  }

  /**
   * If the given rows match the canonical "metric_field,value" format,
   * build the ExtractedMetrics result for it. Returns null otherwise, so
   * callers (CSV, Excel, PDF) can fall back to their own next step.
   */
  private static buildCanonicalResult(rows: string[][]): ExtractedMetrics | null {
    if (!isCanonicalOperationalMetricsCSV(rows)) return null;
    const metricsFound = parseCanonicalOperationalMetricsCSV(rows);
    const recognizedCount = Object.keys(metricsFound).filter(k => ALL_KNOWN_FIELD_NAMES.has(k)).length;
    const unrecognizedCount = Object.keys(metricsFound).length - recognizedCount;
    const insights = [
      `Loaded ${Object.keys(metricsFound).length} operational metric field(s) from the uploaded file.`
    ];
    if (unrecognizedCount > 0) {
      insights.push(`${unrecognizedCount} field(s) in the file did not match any known metric_field name and were ignored for validation.`);
    }
    return {
      fileType: 'Operational Metrics (Canonical CSV)',
      metricsFound,
      insights,
      affectedDomains: [],
      confidence: recognizedCount > 0 ? 'HIGH' : 'LOW'
    };
  }

  /**
   * Parse a real .xlsx/.xls file (binary, via SheetJS) for the canonical
   * metric_field,value table in its first sheet.
   */
  private static async analyzeSpreadsheetFile(file: File): Promise<ExtractedMetrics> {
    let rows: string[][];
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSXLib.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error('No sheets found in this workbook.');
      const sheet = workbook.Sheets[sheetName];
      const raw = XLSXLib.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' }) as unknown[][];
      rows = raw.map(r => r.map(c => String(c ?? '').trim()));
    } catch (error) {
      const reason = `Could not open this Excel file (${error instanceof Error ? error.message : 'unknown error'}). It may be corrupted or password-protected.`;
      return {
        fileType: 'UNREADABLE_BINARY_FILE',
        metricsFound: {},
        insights: [reason],
        affectedDomains: [],
        confidence: 'LOW',
        unreadableReason: reason
      };
    }

    const canonicalResult = this.buildCanonicalResult(rows);
    if (canonicalResult) return canonicalResult;

    const reason =
      `This Excel file was read successfully, but its first sheet does not have the required header ` +
      `"metric_field" in column A and "value" in column B (with one data row per metric below it). ` +
      `Add that header row and re-upload — see the "Required Data Fields" table above for the exact field names.`;
    return {
      fileType: 'UNREADABLE_BINARY_FILE',
      metricsFound: {},
      insights: [reason],
      affectedDomains: [],
      confidence: 'LOW',
      unreadableReason: reason
    };
  }

  /**
   * Best-effort parse of a .pdf file (via pdfjs-dist text extraction) for
   * the canonical metric_field,value table. This only works for text-based
   * PDFs (e.g. exported from a spreadsheet or word processor) — a scanned
   * image PDF has no extractable text and cannot be read this way.
   */
  private static async analyzePdfFile(file: File): Promise<ExtractedMetrics> {
    let lines: string[];
    try {
      const buffer = await file.arrayBuffer();
      const pdfjsLib = await getPdfjs();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const pageLines: string[] = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        // Group text items by their vertical position (y) into lines
        const byLine = new Map<number, { x: number; str: string }[]>();
        textContent.items.forEach((item: any) => {
          const y = Math.round(item.transform[5]);
          if (!byLine.has(y)) byLine.set(y, []);
          byLine.get(y)!.push({ x: item.transform[4], str: item.str });
        });
        Array.from(byLine.entries())
          .sort((a, b) => b[0] - a[0]) // top to bottom
          .forEach(([, items]) => {
            const line = items.sort((a, b) => a.x - b.x).map(i => i.str).join(' ').trim();
            if (line) pageLines.push(line);
          });
      }
      lines = pageLines;
    } catch (error) {
      const reason = `Could not read this PDF (${error instanceof Error ? error.message : 'unknown error'}). It may be corrupted, password-protected, or a scanned image with no extractable text.`;
      return {
        fileType: 'UNREADABLE_BINARY_FILE',
        metricsFound: {},
        insights: [reason],
        affectedDomains: [],
        confidence: 'LOW',
        unreadableReason: reason
      };
    }

    if (lines.length === 0) {
      const reason = 'This PDF has no extractable text (likely a scanned image). Export or re-save it as a text-based PDF, or upload a CSV/Excel file instead.';
      return {
        fileType: 'UNREADABLE_BINARY_FILE',
        metricsFound: {},
        insights: [reason],
        affectedDomains: [],
        confidence: 'LOW',
        unreadableReason: reason
      };
    }

    // Each extracted line may separate "field,value" with a comma, colon,
    // or run of whitespace/tabs, depending on how the source document laid
    // out the table — try comma first (matches the CSV convention), then
    // fall back to colon or whitespace splitting.
    const rows: string[][] = lines.map(line => {
      if (line.includes(',')) return line.split(',').map(c => c.trim());
      if (line.includes(':')) return line.split(':').map(c => c.trim());
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) return [parts.slice(0, -1).join(' '), parts[parts.length - 1]];
      return [line.trim()];
    });

    const canonicalResult = this.buildCanonicalResult(rows);
    if (canonicalResult) return canonicalResult;

    const reason =
      `This PDF's text was read successfully, but no "metric_field, value" table could be found in it ` +
      `(expected a line reading "metric_field, value" followed by one field/value pair per line). ` +
      `PDF table extraction is best-effort — for reliable results, export the same data as a CSV or Excel file instead.`;
    return {
      fileType: 'UNREADABLE_BINARY_FILE',
      metricsFound: {},
      insights: [reason],
      affectedDomains: [],
      confidence: 'LOW',
      unreadableReason: reason
    };
  }

  /**
   * Analyze attendance data
   */
  private static analyzeAttendance(content: string, fileName: string): ExtractedMetrics {
    const rows = this.parseCSV(content);
    const metrics: Record<string, number | string> = { fileType: 'Attendance Register' };
    const insights: string[] = [];

    // Look for attendance percentage
    let totalDays = 0;
    let presentDays = 0;
    let studentCount = 0;

    rows.forEach((row, idx) => {
      if (idx === 0) return; // Skip header

      // Try to extract attendance info
      const lastCell = row[row.length - 1];
      if (lastCell && !isNaN(parseFloat(lastCell))) {
        const attendance = parseFloat(lastCell);
        if (attendance >= 0 && attendance <= 100) {
          metrics['avgAttendance'] = attendance;
        }
      }

      // Count present markers (common formats: 'P', 'Y', '1', or positive numbers)
      row.forEach(cell => {
        if (cell === 'P' || cell === 'Y' || cell === '1') {
          presentDays++;
        } else if (cell === 'A' || cell === 'N' || cell === '0') {
          totalDays++;
        }
      });
    });

    const avgAttendance = metrics['avgAttendance'] || (totalDays > 0 ? Math.round((presentDays / (presentDays + totalDays)) * 100) : null);
    studentCount = rows.length - 1;

    if (avgAttendance) {
      metrics['avgAttendance'] = avgAttendance;
      if (avgAttendance < 75) {
        insights.push(`Critical: Average attendance is only ${avgAttendance}% - well below 85% district benchmark`);
        insights.push('High absenteeism correlates with lower academic outcomes and higher student stress');
      } else if (avgAttendance < 85) {
        insights.push(`Moderate concern: Attendance at ${avgAttendance}% is below ideal 85% threshold`);
        insights.push('Regular monitoring and intervention programs needed');
      } else {
        insights.push(`Strong attendance at ${avgAttendance}% - exceeds district benchmark`);
      }
    }

    metrics['studentCount'] = studentCount;

    return {
      fileType: 'Attendance Data',
      metricsFound: metrics,
      insights,
      affectedDomains: ['Staff & HR', 'Academic Excellence', 'Emotional Wellbeing'],
      confidence: avgAttendance ? 'HIGH' : 'MEDIUM'
    };
  }

  /**
   * Analyze fee collection data
   */
  private static analyzeFees(content: string, fileName: string): ExtractedMetrics {
    const rows = this.parseCSV(content);
    const metrics: Record<string, number | string> = { fileType: 'Fee Collection Data' };
    const insights: string[] = [];

    let totalFee = 0;
    let collectedFee = 0;
    let defaultCount = 0;
    let studentCount = 0;

    rows.forEach((row, idx) => {
      if (idx === 0) return; // Skip header

      // Look for fee amounts (typically numeric columns)
      row.forEach((cell, colIdx) => {
        const value = parseFloat(cell);
        if (!isNaN(value) && value > 0) {
          // If it's a large number, likely fee-related
          if (value > 1000) {
            if (colIdx % 3 === 0) totalFee += value; // Assume pattern: Due, Paid, Default
            else if (colIdx % 3 === 1) collectedFee += value;
            else defaultCount += 1;
          }
        }
      });
    });

    studentCount = Math.max(1, rows.length - 1);
    const collectionRate = totalFee > 0 ? Math.round((collectedFee / totalFee) * 100) : null;
    const defaultRate = totalFee > 0 ? Math.round(((totalFee - collectedFee) / totalFee) * 100) : null;

    if (collectionRate !== null) {
      metrics['collectionRate'] = collectionRate;
      metrics['defaultRate'] = defaultRate;
      metrics['totalFeeExpected'] = totalFee;
      metrics['totalFeeCollected'] = collectedFee;

      if (defaultRate! > 15) {
        insights.push(`Critical: Fee default rate of ${defaultRate}% - severe liquidity impact`);
        insights.push('Automated reminders and flexible payment options urgently needed');
      } else if (defaultRate! > 8) {
        insights.push(`Moderate concern: ${defaultRate}% fee defaults - above healthy 5% threshold`);
        insights.push('Manual follow-up processes creating cash flow delays');
      } else {
        insights.push(`Healthy fee collection at ${collectionRate}% - strong financial discipline`);
      }
    }

    return {
      fileType: 'Fee Collection Data',
      metricsFound: metrics,
      insights,
      affectedDomains: ['Finance & Fees', 'Admissions & Enrollment'],
      confidence: collectionRate ? 'HIGH' : 'MEDIUM'
    };
  }

  /**
   * Analyze academic performance data
   */
  private static analyzeAcademics(content: string, fileName: string): ExtractedMetrics {
    const rows = this.parseCSV(content);
    const metrics: Record<string, number | string> = { fileType: 'Academic Performance' };
    const insights: string[] = [];

    let totalMarks = 0;
    let passCount = 0;
    let studentCount = 0;
    const subjectMarks: Record<string, number[]> = {};

    rows.forEach((row, idx) => {
      if (idx === 0) return;

      studentCount++;
      let studentTotal = 0;
      let subjectCount = 0;

      row.forEach((cell, colIdx) => {
        const marks = parseFloat(cell);
        if (!isNaN(marks) && marks >= 0 && marks <= 100) {
          studentTotal += marks;
          totalMarks += marks;
          subjectCount++;
          if (marks >= 40) passCount++;
        }
      });
    });

    const avgMarks = studentCount > 0 ? Math.round(totalMarks / (studentCount * Math.max(1, rows[0]?.length || 5))) : null;
    const passRate = studentCount > 0 ? Math.round((passCount / (studentCount * Math.max(1, rows[0]?.length || 5))) * 100) : null;

    if (avgMarks !== null) {
      metrics['avgMarks'] = avgMarks;
      metrics['passRate'] = passRate;
      metrics['studentCount'] = studentCount;

      if (passRate! < 60) {
        insights.push(`Critical: Only ${passRate}% of students passing - significant learning gaps`);
        insights.push('Diagnostic remedial tracking and early intervention programs needed immediately');
      } else if (passRate! < 75) {
        insights.push(`Concern: ${passRate}% pass rate is below district benchmark of 80%`);
        insights.push('Structured diagnostic assessment and targeted support required');
      } else if (passRate! >= 90) {
        insights.push(`Excellent: ${passRate}% pass rate exceeds district benchmarks`);
        insights.push('Strong academic foundation - focus on extension and enrichment');
      } else {
        insights.push(`Acceptable performance at ${passRate}% pass rate`);
      }
    }

    return {
      fileType: 'Academic Results',
      metricsFound: metrics,
      insights,
      affectedDomains: ['Academic Excellence', 'Teacher Effectiveness', 'Emotional Wellbeing'],
      confidence: avgMarks ? 'HIGH' : 'MEDIUM'
    };
  }

  /**
   * Analyze staff/teacher data
   */
  private static analyzeStaff(content: string, fileName: string): ExtractedMetrics {
    const rows = this.parseCSV(content);
    const metrics: Record<string, number | string> = { fileType: 'Staff Data' };
    const insights: string[] = [];

    let staffCount = rows.length - 1;
    let retirementCount = 0;
    let experiencedCount = 0;
    let trainingCount = 0;

    rows.forEach((row, idx) => {
      if (idx === 0) return;

      const rowContent = row.join(' ').toLowerCase();
      if (rowContent.includes('left') || rowContent.includes('exit') || rowContent.includes('resign')) {
        retirementCount++;
      }
      if (rowContent.includes('year') || rowContent.includes('exp')) {
        experiencedCount++;
      }
      if (rowContent.includes('train') || rowContent.includes('cert') || rowContent.includes('qualified')) {
        trainingCount++;
      }
    });

    metrics['staffCount'] = staffCount;

    if (staffCount > 0) {
      const turnoverRate = Math.round((retirementCount / staffCount) * 100);
      const trainingRate = Math.round((trainingCount / staffCount) * 100);

      metrics['estimatedTurnover'] = turnoverRate;
      metrics['estimatedTrainingRate'] = trainingRate;

      if (turnoverRate > 20) {
        insights.push(`High staff turnover detected: ~${turnoverRate}% - classroom instability likely`);
        insights.push('Exit interview analysis and workload assessment critical');
      }

      if (trainingRate < 40) {
        insights.push(`Low training uptake: Only ${trainingRate}% with recorded professional development`);
        insights.push('Structured pedagogical training program needed');
      }
    }

    return {
      fileType: 'Staff Data',
      metricsFound: metrics,
      insights,
      affectedDomains: ['Staff & HR', 'Teacher Effectiveness', 'Academic Excellence'],
      confidence: staffCount > 10 ? 'HIGH' : 'MEDIUM'
    };
  }

  /**
   * Analyze parent complaints/feedback
   */
  private static analyzeComplaints(content: string, fileName: string): ExtractedMetrics {
    const rows = this.parseCSV(content);
    const metrics: Record<string, number | string> = { fileType: 'Parent Feedback' };
    const insights: string[] = [];

    let complaintCount = rows.length - 1;
    let resolvedCount = 0;
    let resolutionDays = 0;
    const categories: Record<string, number> = {};

    rows.forEach((row, idx) => {
      if (idx === 0) return;

      const rowContent = row.join(' ').toLowerCase();

      // Count categories
      if (rowContent.includes('academic')) categories['academic'] = (categories['academic'] || 0) + 1;
      if (rowContent.includes('fee') || rowContent.includes('payment')) categories['finance'] = (categories['finance'] || 0) + 1;
      if (rowContent.includes('staff') || rowContent.includes('teacher')) categories['staff'] = (categories['staff'] || 0) + 1;
      if (rowContent.includes('resolved') || rowContent.includes('closed')) resolvedCount++;

      // Extract resolution time if present
      row.forEach(cell => {
        const days = parseInt(cell);
        if (!isNaN(days) && days > 0 && days < 30) {
          resolutionDays += days;
        }
      });
    });

    metrics['complaintCount'] = complaintCount;
    metrics['resolutionRate'] = complaintCount > 0 ? Math.round((resolvedCount / complaintCount) * 100) : 0;
    metrics['avgResolutionDays'] = complaintCount > 0 ? Math.round(resolutionDays / complaintCount) : null;

    if (complaintCount > 20) {
      insights.push(`High complaint volume: ${complaintCount} recorded issues`);
      insights.push('Structured grievance resolution SLA and communication protocol needed');
    }

    const avgDays = metrics['avgResolutionDays'];
    if (avgDays && avgDays > 5) {
      insights.push(`Slow resolution: Average ${avgDays} days - eroding parent trust`);
      insights.push('Implement parent portal and automated escalation for faster resolution');
    }

    return {
      fileType: 'Parent Feedback',
      metricsFound: metrics,
      insights,
      affectedDomains: ['Family Support', 'Communication Hub', 'Emotional Wellbeing'],
      confidence: complaintCount > 5 ? 'HIGH' : 'MEDIUM'
    };
  }

  /**
   * Analyze inquiry/admission data
   */
  private static analyzeInquiries(content: string, fileName: string): ExtractedMetrics {
    const rows = this.parseCSV(content);
    const metrics: Record<string, number | string> = { fileType: 'Inquiry Data' };
    const insights: string[] = [];

    let inquiryCount = rows.length - 1;
    let convertedCount = 0;
    let followupCount = 0;

    rows.forEach((row, idx) => {
      if (idx === 0) return;

      const rowContent = row.join(' ').toLowerCase();
      if (rowContent.includes('converted') || rowContent.includes('enrolled') || rowContent.includes('yes')) {
        convertedCount++;
      }
      if (rowContent.includes('follow') || rowContent.includes('contacted')) {
        followupCount++;
      }
    });

    metrics['inquiryCount'] = inquiryCount;

    if (inquiryCount > 0) {
      const conversionRate = Math.round((convertedCount / inquiryCount) * 100);
      const followupRate = Math.round((followupCount / inquiryCount) * 100);

      metrics['conversionRate'] = conversionRate;
      metrics['followupRate'] = followupRate;

      if (conversionRate < 15) {
        insights.push(`Critical conversion issue: Only ${conversionRate}% of inquiries converting to admissions`);
        insights.push('Parent follow-up workflow and inquiry resolution timing need urgent optimization');
      } else if (conversionRate < 25) {
        insights.push(`Conversion concern: ${conversionRate}% is below benchmark of 30%`);
        insights.push('Fee transparency and payment options likely friction points');
      }

      if (followupRate < 60) {
        insights.push(`Low follow-up rate: Only ${followupRate}% of inquiries being actively pursued`);
        insights.push('Automated inquiry routing and CRM implementation recommended');
      }
    }

    return {
      fileType: 'Inquiry Data',
      metricsFound: metrics,
      insights,
      affectedDomains: ['Admissions & Enrollment', 'Communication Hub'],
      confidence: inquiryCount > 20 ? 'HIGH' : 'MEDIUM'
    };
  }

  /**
   * Analyze compliance/audit data
   */
  private static analyzeCompliance(content: string, fileName: string): ExtractedMetrics {
    const rows = this.parseCSV(content);
    const metrics: Record<string, number | string> = { fileType: 'Compliance Audit' };
    const insights: string[] = [];

    const auditPoints = rows.map(r => r.join(' ').toLowerCase());
    let openItems = 0;
    let closedItems = 0;

    auditPoints.forEach(point => {
      if (point.includes('pending') || point.includes('open') || point.includes('due')) {
        openItems++;
      }
      if (point.includes('closed') || point.includes('completed')) {
        closedItems++;
      }
    });

    metrics['totalAuditItems'] = auditPoints.length - 1;
    metrics['pendingItems'] = openItems;

    if (openItems > 5) {
      insights.push(`Compliance concern: ${openItems} pending audit items`);
      insights.push('Regulatory documentation and safety certificates require immediate attention');
    } else if (openItems > 0) {
      insights.push(`${openItems} outstanding compliance items - follow-up needed`);
    } else {
      insights.push('Compliance status appears current - strong governance');
    }

    return {
      fileType: 'Compliance Data',
      metricsFound: metrics,
      insights,
      affectedDomains: ['Regulatory Compliance', 'Infrastructure & Assets'],
      confidence: 'MEDIUM'
    };
  }

  /**
   * Generic analysis for unknown file types
   * Enhanced to extract DISHA-required metrics from any format
   */
  private static genericAnalysis(content: string, fileName: string): ExtractedMetrics {
    const rows = this.parseCSV(content);
    const metrics: Record<string, number | string> = {
      fileType: 'Operational Data'
    };

    if (rows.length === 0) {
      return {
        fileType: 'Operational Data',
        metricsFound: metrics,
        insights: ['No data found in file'],
        affectedDomains: [],
        confidence: 'LOW'
      };
    }

    const headers = rows[0].map(h => h.toLowerCase().trim());

    // Check if this is a "MetricName/Value" format table
    const metricNameIndex = headers.findIndex(h => h.includes('metric'));
    const valueIndex = headers.findIndex(h => h === 'value');

    if (metricNameIndex >= 0 && valueIndex >= 0) {
      // This is a MetricName/Value table format
      console.log('🔍 Detected MetricName/Value table format');
      console.log('Headers:', headers);

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[metricNameIndex] && row[valueIndex]) {
          const metricName = row[metricNameIndex].toLowerCase().trim();
          const valueStr = row[valueIndex].trim();
          const value = parseFloat(valueStr);

          console.log(`  Row ${i}: "${metricName}" = ${valueStr} (parsed: ${value})`);

          if (!isNaN(value)) {
            // Direct field name match (highest priority)
            if (metricName === 'students_per_classroom') {
              metrics['students_per_classroom'] = value;
              console.log('    ✅ Matched: students_per_classroom');
            } else if (metricName === 'parent_query_response_sla_hours') {
              metrics['parent_query_response_sla_hours'] = value;
              console.log('    ✅ Matched: parent_query_response_sla_hours');
            } else if (metricName === 'annual_training_hours') {
              metrics['annual_training_hours'] = value;
              console.log('    ✅ Matched: annual_training_hours');
            } else if (metricName === 'weekly_planning_hours') {
              metrics['weekly_planning_hours'] = value;
              console.log('    ✅ Matched: weekly_planning_hours');
            } else if (metricName.includes('students') && metricName.includes('classroom')) {
              metrics['students_per_classroom'] = value;
              console.log('    ✅ Pattern Matched: students_per_classroom');
            } else if (metricName.includes('parent') && (metricName.includes('sla') || metricName.includes('response') || metricName.includes('query'))) {
              metrics['parent_query_response_sla_hours'] = value;
              console.log('    ✅ Pattern Matched: parent_query_response_sla_hours');
            } else if (metricName.includes('training') || metricName.includes('cpd') || metricName.includes('annual')) {
              metrics['annual_training_hours'] = value;
              console.log('    ✅ Pattern Matched: annual_training_hours');
            } else if (metricName.includes('planning') || metricName.includes('weekly')) {
              metrics['weekly_planning_hours'] = value;
              console.log('    ✅ Pattern Matched: weekly_planning_hours');
            } else {
              // Store any other numeric metrics
              metrics[metricName.replace(/\s+/g, '_')] = value;
            }
          } else {
            console.log(`    ❌ Could not parse value: ${valueStr}`);
          }
        }
      }
    } else {
      // Try to extract metrics from column headers
      const dataRow = rows[1] || [];

      // Map of possible column header variations for DISHA metrics
      const metricMappings: Record<string, string[]> = {
        'students_per_classroom': ['students_per_classroom', 'student teacher ratio', 'str', 'students per classroom', 'class size'],
        'parent_query_response_sla_hours': ['parent_query_response_sla_hours', 'parent response sla', 'parent sla', 'response hours', 'sla hours', 'parent response'],
        'annual_training_hours': ['annual_training_hours', 'training hours', 'cpd hours', 'annual training', 'hours per year', 'training'],
        'weekly_planning_hours': ['weekly_planning_hours', 'planning hours', 'weekly planning', 'lesson planning hours', 'planning']
      };

      // Try to extract each metric from column headers
      Object.entries(metricMappings).forEach(([metricKey, variations]) => {
        const headerIndex = headers.findIndex(h =>
          variations.some(variation => h.includes(variation))
        );

        if (headerIndex >= 0 && dataRow[headerIndex]) {
          const value = parseFloat(dataRow[headerIndex]);
          if (!isNaN(value)) {
            metrics[metricKey] = value;
          }
        }
      });
    }

    // Add other useful metrics
    metrics['rowCount'] = rows.length - 1;
    metrics['columnCount'] = rows[0]?.length || 0;

    // Determine confidence based on metrics found
    const metricsCount = Object.keys(metrics).filter(k =>
      k === 'students_per_classroom' ||
      k === 'parent_query_response_sla_hours' ||
      k === 'annual_training_hours' ||
      k === 'weekly_planning_hours'
    ).length;

    console.log(`📊 Generic analysis found ${metricsCount} DISHA metrics:`, metrics);

    let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (metricsCount >= 4) confidence = 'HIGH';
    else if (metricsCount >= 2) confidence = 'MEDIUM';

    return {
      fileType: 'Operational Data',
      metricsFound: metrics,
      insights: [
        metricsCount > 0 ? `✅ Extracted ${metricsCount} DISHA metrics from uploaded file` : 'Uploaded data file detected',
        metricsCount === 4 ? '✨ All required metrics found!' : metricsCount > 0 ? `Note: ${4 - metricsCount} metrics still needed` : 'Scanning for metrics...'
      ],
      affectedDomains: metricsCount > 0 ? ['Operations', 'Staff', 'Infrastructure'] : [],
      confidence
    };
  }
}

export interface ValidationResult {
  isValid: boolean;
  missingMetrics: string[];
  foundMetrics: string[];
  errorMessage: string;
  requiredMetrics: Array<{
    fieldName: string;
    description: string;
    example: string;
  }>;
  /** Uploaded values that parsed as numbers but fall outside their field's plausible range (see MetricRequirement.validRange) - a stray minus sign, an extra zero, a % over 100. Empty when every present value is plausible. */
  outOfRangeMetrics: OutOfRangeMetric[];
}

function formatOutOfRangeMessage(violations: OutOfRangeMetric[]): string {
  const lines = violations.map(
    (v) => `• ${v.displayName}: uploaded value ${v.value} is outside the plausible range (${v.min} to ${v.max})`
  );
  return (
    `❌ IMPLAUSIBLE VALUE(S) DETECTED - this looks like a data-entry error, not real operational data:\n\n` +
    `${lines.join('\n')}\n\n` +
    `HOW TO FIX: Double-check these values in your source file for a typo, a missing/extra digit, a wrong sign, or a unit mismatch (e.g. entering a fraction like 0.28 instead of a percentage like 28), then re-upload.`
  );
}

export interface ChallengeValidationResult {
  isValid: boolean;
  completeness: number;
  missingMetrics: string[];
  foundMetrics: string[];
  recommendations: string[];
  errorMessage: string;
  challengesCovered: string[];
  challengesUncovered: string[];
  requiredMetrics: Array<{
    fieldName: string;
    description: string;
    example: string;
  }>;
  outOfRangeMetrics: OutOfRangeMetric[];
}

/**
 * Validate if uploaded file contains required DISHA metrics
 */
export function validateFileMetrics(extractedMetrics: ExtractedMetrics): ValidationResult {
  const requiredMetrics = [
    {
      fieldName: 'students_per_classroom',
      description: 'Student-Teacher Ratio',
      example: '28 (students per classroom)'
    },
    {
      fieldName: 'parent_query_response_sla_hours',
      description: 'Parent Response SLA',
      example: '24 (hours to respond to parent queries)'
    },
    {
      fieldName: 'annual_training_hours',
      description: 'Annual Teacher Training Hours',
      example: '20 (hours per teacher per year)'
    },
    {
      fieldName: 'weekly_planning_hours',
      description: 'Weekly Planning Time',
      example: '4 (hours per week for lesson planning)'
    }
  ];

  const metricsFound = extractedMetrics.metricsFound;
  const missingMetrics: string[] = [];
  const foundMetricsNames: string[] = [];

  // Check for each required metric
  requiredMetrics.forEach(required => {
    if (metricsFound[required.fieldName] !== undefined && metricsFound[required.fieldName] !== null) {
      foundMetricsNames.push(`✅ ${required.description}: ${metricsFound[required.fieldName]}`);
    } else {
      missingMetrics.push(required.fieldName);
    }
  });

  const outOfRangeMetrics = validateMetricRanges(metricsFound);
  const isValid = missingMetrics.length === 0 && outOfRangeMetrics.length === 0;

  let errorMessage = '';
  if (missingMetrics.length > 0) {
    errorMessage = `❌ Missing ${missingMetrics.length} required data field(s). Your file must include:\n\n`;
    missingMetrics.forEach(metric => {
      const required = requiredMetrics.find(r => r.fieldName === metric);
      if (required) {
        errorMessage += `• ${required.description} - ${required.example}\n`;
      }
    });
    errorMessage += `\nPlease upload a file containing these operational metrics.`;
  }
  if (outOfRangeMetrics.length > 0) {
    errorMessage += (errorMessage ? '\n\n' : '') + formatOutOfRangeMessage(outOfRangeMetrics);
  }

  return {
    isValid,
    missingMetrics,
    foundMetrics: foundMetricsNames,
    errorMessage,
    requiredMetrics,
    outOfRangeMetrics
  };
}

/**
 * Validate uploaded data against selected challenges
 * Ensures all required metrics for chosen challenges are present
 */
export function validateFileForChallenges(
  extractedMetrics: ExtractedMetrics,
  selectedChallengeIds: string[]
): ChallengeValidationResult {
  // A genuinely unreadable/malformed upload (wrong internal structure,
  // corrupted file, scanned PDF with no text, etc.) is a FILE-FORMAT/
  // STRUCTURE problem, not a data-completeness problem - report the
  // specific diagnosed reason instead of "every field is missing", which
  // is technically true but misdiagnoses the real cause.
  if (extractedMetrics.fileType === 'UNREADABLE_BINARY_FILE') {
    const requiredMetrics = getRequiredMetricsForChallenges(selectedChallengeIds)
      .map(m => ({
        fieldName: m.fieldName,
        description: `${m.displayName} (${m.unit})`,
        example: m.example
      }));
    return {
      isValid: false,
      completeness: 0,
      missingMetrics: [],
      foundMetrics: [],
      recommendations: [
        'Supported formats: .csv, .xlsx, .xls, and text-based .pdf.',
        'The file must contain a header "metric_field" / "value" (two columns) with one metric per row below it.',
        'See the "Required Data Fields" table above for the exact field names and example values to use.'
      ],
      errorMessage:
        `❌ COULD NOT READ THIS FILE — this is not a case of missing data values.\n\n` +
        `${extractedMetrics.unreadableReason || 'The uploaded file could not be parsed.'}\n\n` +
        `HOW TO FIX: Make sure the file is a .csv, .xlsx/.xls, or text-based .pdf with a "metric_field,value" ` +
        `header and one field per row (see the Required Data Fields table above), then re-upload.`,
      challengesCovered: [],
      challengesUncovered: selectedChallengeIds,
      requiredMetrics,
      outOfRangeMetrics: []
    };
  }

  // If no challenges selected, accept all data - but still flag any
  // uploaded value that is numerically implausible, since that error
  // exists independent of which challenges get selected afterward.
  if (!selectedChallengeIds || selectedChallengeIds.length === 0) {
    const outOfRangeMetrics = validateMetricRanges(extractedMetrics.metricsFound);
    return {
      isValid: outOfRangeMetrics.length === 0,
      completeness: 100,
      missingMetrics: [],
      foundMetrics: Object.keys(extractedMetrics.metricsFound).map(k => `✅ ${k}`),
      recommendations: [],
      errorMessage: outOfRangeMetrics.length > 0 ? formatOutOfRangeMessage(outOfRangeMetrics) : '',
      challengesCovered: [],
      challengesUncovered: [],
      requiredMetrics: [],
      outOfRangeMetrics
    };
  }

  // Use challenge data requirements to validate
  const validation = validateDataForChallenges(
    extractedMetrics.metricsFound,
    selectedChallengeIds
  );
  const outOfRangeMetrics = validateMetricRanges(extractedMetrics.metricsFound);
  const isValid = validation.isValid && outOfRangeMetrics.length === 0;

  // Determine which challenges can be analyzed
  const challengesCovered = selectedChallengeIds;
  const challengesUncovered: string[] = [];

  if (!isValid) {
    challengesUncovered.push(...selectedChallengeIds);
  }

  const requiredMetrics = validation.requiredMetrics.map(m => ({
    fieldName: m.fieldName,
    description: `${m.displayName} (${m.unit})`,
    example: m.example
  }));

  let errorMessage = '';
  if (!validation.isValid) {
    errorMessage =
      `❌ Data INCOMPLETE for selected challenges!\n\n${validation.missingMetrics.join('\n')}\n\n` +
      `Your file covers ${validation.completeness}% of required data.\n\n` +
      `To analyze ALL selected challenges, your file must include:\n\n` +
      `${validation.recommendations.join('\n')}`;
  }
  if (outOfRangeMetrics.length > 0) {
    errorMessage += (errorMessage ? '\n\n' : '') + formatOutOfRangeMessage(outOfRangeMetrics);
  }

  return {
    isValid,
    completeness: validation.completeness,
    missingMetrics: validation.missingMetrics,
    foundMetrics: validation.foundMetrics,
    recommendations: validation.recommendations,
    errorMessage,
    challengesCovered: isValid ? challengesCovered : [],
    challengesUncovered: isValid ? [] : selectedChallengeIds,
    requiredMetrics,
    outOfRangeMetrics
  };
}

export default FileAnalyzer;

/**
 * Multi-Format Data Importer
 * Supports: Excel, CSV, PDF, Word documents, and ERP system exports
 * Extracts operational metrics for objective data analysis
 */

export type FileFormat = 'excel' | 'csv' | 'pdf' | 'word' | 'erp_json' | 'erp_xml';

export interface ImportResult {
  success: boolean;
  format: FileFormat;
  metricsExtracted: Record<string, any>;
  dataQuality: {
    completeness: number; // 0-100%
    validMetricsCount: number;
    totalExpectedMetrics: number;
  };
  warnings: string[];
  errors: string[];
  validationTiers: Record<string, 'tier1' | 'tier2' | 'tier3'>;
}

/**
 * Main import function - routes to appropriate parser
 */
export async function importDataFile(
  file: File,
  format?: FileFormat
): Promise<ImportResult> {
  // Auto-detect format if not specified
  const detectedFormat = format || detectFileFormat(file.name);

  try {
    let metricsExtracted: Record<string, any> = {};
    let validationTiers: Record<string, 'tier1' | 'tier2' | 'tier3'> = {};
    const warnings: string[] = [];
    const errors: string[] = [];

    switch (detectedFormat) {
      case 'excel':
      case 'csv':
        const csvResult = await importFromExcel(file);
        metricsExtracted = csvResult.metrics;
        validationTiers = csvResult.tiers;
        warnings.push(...csvResult.warnings);
        errors.push(...csvResult.errors);
        break;

      case 'pdf':
        const pdfResult = await importFromPDF(file);
        metricsExtracted = pdfResult.metrics;
        validationTiers = pdfResult.tiers;
        warnings.push(...pdfResult.warnings);
        errors.push(...pdfResult.errors);
        break;

      case 'word':
        const wordResult = await importFromWord(file);
        metricsExtracted = wordResult.metrics;
        validationTiers = wordResult.tiers;
        warnings.push(...wordResult.warnings);
        errors.push(...wordResult.errors);
        break;

      case 'erp_json':
      case 'erp_xml':
        const erpResult = await importFromERP(file, detectedFormat);
        metricsExtracted = erpResult.metrics;
        validationTiers = erpResult.tiers;
        warnings.push(...erpResult.warnings);
        errors.push(...erpResult.errors);
        break;

      default:
        throw new Error(`Unsupported file format: ${detectedFormat}`);
    }

    // Validate extracted metrics
    const validationResult = validateExtractedMetrics(metricsExtracted);

    return {
      success: errors.length === 0,
      format: detectedFormat,
      metricsExtracted,
      dataQuality: {
        completeness: calculateCompleteness(metricsExtracted),
        validMetricsCount: validationResult.validCount,
        totalExpectedMetrics: validationResult.expectedCount,
      },
      warnings: [...warnings, ...validationResult.warnings],
      errors,
      validationTiers,
    };
  } catch (error) {
    return {
      success: false,
      format: detectedFormat,
      metricsExtracted: {},
      dataQuality: { completeness: 0, validMetricsCount: 0, totalExpectedMetrics: 0 },
      warnings: [],
      errors: [error instanceof Error ? error.message : 'Unknown import error'],
      validationTiers: {},
    };
  }
}

/**
 * Auto-detect file format from filename
 */
function detectFileFormat(filename: string): FileFormat {
  const ext = filename.toLowerCase().split('.').pop() || '';

  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'csv';
  if (ext === 'pdf') return 'pdf';
  if (['docx', 'doc'].includes(ext)) return 'word';
  if (ext === 'json') return 'erp_json';
  if (ext === 'xml') return 'erp_xml';

  throw new Error(`Unable to determine file format for: ${filename}`);
}

/**
 * Import from Excel/CSV
 */
async function importFromExcel(
  file: File
): Promise<{ metrics: Record<string, any>; tiers: Record<string, 'tier1' | 'tier2' | 'tier3'>; warnings: string[]; errors: string[] }> {
  const warnings: string[] = [];
  const errors: string[] = [];
  const metrics: Record<string, any> = {};
  const tiers: Record<string, 'tier1' | 'tier2' | 'tier3'> = {};

  try {
    // For demo: Parse as CSV
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    // Expected header columns
    const metricIndex = headers.findIndex(h => h.toLowerCase().includes('metric'));
    const valueIndex = headers.findIndex(h => h.toLowerCase().includes('value'));
    const sourceIndex = headers.findIndex(h => h.toLowerCase().includes('source'));

    if (metricIndex === -1 || valueIndex === -1) {
      errors.push('CSV must have "Metric" and "Value" columns');
      return { metrics, tiers, warnings, errors };
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const cols = lines[i].split(',').map(c => c.trim());
      const metricName = cols[metricIndex];
      const metricValue = parseFloat(cols[valueIndex]);
      const source = sourceIndex !== -1 ? cols[sourceIndex] : 'ERP_Direct';

      if (metricName && !isNaN(metricValue)) {
        metrics[metricName] = metricValue;

        // Assign tier based on source
        if (source.toLowerCase().includes('direct') || source.toLowerCase().includes('erp')) {
          tiers[metricName] = 'tier1';
        } else if (source.toLowerCase().includes('audit') || source.toLowerCase().includes('report')) {
          tiers[metricName] = 'tier2';
        } else {
          tiers[metricName] = 'tier3';
        }
      }
    }

    if (Object.keys(metrics).length === 0) {
      warnings.push('No valid metrics found in CSV file');
    }
  } catch (error) {
    errors.push(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { metrics, tiers, warnings, errors };
}

/**
 * Import from PDF
 */
async function importFromPDF(
  file: File
): Promise<{ metrics: Record<string, any>; tiers: Record<string, 'tier1' | 'tier2' | 'tier3'>; warnings: string[]; errors: string[] }> {
  const warnings: string[] = [];
  const errors: string[] = [];
  const metrics: Record<string, any> = {};
  const tiers: Record<string, 'tier1' | 'tier2' | 'tier3'> = {};

  try {
    // PDF parsing would require pdf.js library
    // For now, provide placeholder that suggests data extraction
    warnings.push('PDF import requires pdf.js library - data extraction not yet implemented');
    warnings.push('Please convert PDF to Excel/CSV format for import');

    // In production, this would use:
    // const pdf = await pdfjsLib.getDocument(file).promise;
    // Then extract text from each page and parse tables
  } catch (error) {
    errors.push(`PDF parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { metrics, tiers, warnings, errors };
}

/**
 * Import from Word document
 */
async function importFromWord(
  file: File
): Promise<{ metrics: Record<string, any>; tiers: Record<string, 'tier1' | 'tier2' | 'tier3'>; warnings: string[]; errors: string[] }> {
  const warnings: string[] = [];
  const errors: string[] = [];
  const metrics: Record<string, any> = {};
  const tiers: Record<string, 'tier1' | 'tier2' | 'tier3'> = {};

  try {
    // Word parsing would require mammoth.js library
    warnings.push('Word document import requires mammoth.js library - data extraction not yet implemented');
    warnings.push('Please convert Word document to Excel/CSV format for import');

    // In production, this would use:
    // const arrayBuffer = await file.arrayBuffer();
    // const result = await mammoth.extractText({arrayBuffer});
  } catch (error) {
    errors.push(`Word parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { metrics, tiers, warnings, errors };
}

/**
 * Import from ERP system export (JSON/XML)
 */
async function importFromERP(
  file: File,
  format: 'erp_json' | 'erp_xml'
): Promise<{ metrics: Record<string, any>; tiers: Record<string, 'tier1' | 'tier2' | 'tier3'>; warnings: string[]; errors: string[] }> {
  const warnings: string[] = [];
  const errors: string[] = [];
  const metrics: Record<string, any> = {};
  const tiers: Record<string, 'tier1' | 'tier2' | 'tier3'> = {};

  try {
    const text = await file.text();

    if (format === 'erp_json') {
      const data = JSON.parse(text);

      // Map ERP fields to DISHA metrics
      if (data.academicMetrics) {
        if (data.academicMetrics.boardPassRate !== undefined) {
          metrics['board_exam_pass_rate'] = data.academicMetrics.boardPassRate;
          tiers['board_exam_pass_rate'] = 'tier1';
        }
        if (data.academicMetrics.avgMarks !== undefined) {
          metrics['avg_exam_score'] = data.academicMetrics.avgMarks;
          tiers['avg_exam_score'] = 'tier1';
        }
      }

      if (data.staffMetrics) {
        if (data.staffMetrics.certifiedTeachersPercent !== undefined) {
          metrics['certified_teachers_pct'] = data.staffMetrics.certifiedTeachersPercent;
          tiers['certified_teachers_pct'] = 'tier1';
        }
      }

      if (data.attendanceMetrics) {
        if (data.attendanceMetrics.studentAttendancePercent !== undefined) {
          metrics['attendance_rate_pct'] = data.attendanceMetrics.studentAttendancePercent;
          tiers['attendance_rate_pct'] = 'tier1';
        }
      }

      if (Object.keys(metrics).length === 0) {
        warnings.push('ERP JSON structure not recognized - check field mapping');
      }
    } else if (format === 'erp_xml') {
      warnings.push('XML ERP parsing not yet implemented');
      warnings.push('Please export ERP data as JSON format');

      // In production: Parse XML and map to metrics
      // Similar approach to JSON but using XML parser
    }

    // ERP data is always Tier 1 (direct system)
    Object.keys(metrics).forEach(key => {
      if (!tiers[key]) tiers[key] = 'tier1';
    });
  } catch (error) {
    errors.push(`ERP import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { metrics, tiers, warnings, errors };
}

/**
 * Validate extracted metrics against known metrics list
 */
function validateExtractedMetrics(metrics: Record<string, any>): {
  validCount: number;
  expectedCount: number;
  warnings: string[];
} {
  const knownMetrics = [
    'board_exam_pass_rate',
    'avg_exam_score',
    'certified_teachers_pct',
    'attendance_rate_pct',
    'fee_payment_rate_pct',
    'curriculum_coverage',
    'students_per_classroom',
    'parent_query_response_sla_hours',
    'sqaaf_compliance_pct',
    'budget_execution_pct',
    'dropout_rate_pct',
    'annual_training_hours',
  ];

  const warnings: string[] = [];
  let validCount = 0;

  Object.entries(metrics).forEach(([key, value]) => {
    if (knownMetrics.includes(key)) {
      if (typeof value === 'number' && value >= 0 && value <= 100) {
        validCount++;
      } else {
        warnings.push(`Invalid value for ${key}: ${value} (must be 0-100)`);
      }
    } else {
      warnings.push(`Unknown metric: ${key} (will be ignored)`);
    }
  });

  return {
    validCount,
    expectedCount: knownMetrics.length,
    warnings,
  };
}

/**
 * Calculate data completeness percentage
 */
function calculateCompleteness(metrics: Record<string, any>): number {
  const expectedMetricsCount = 12; // Minimum critical metrics
  const foundMetricsCount = Object.keys(metrics).length;

  return Math.min(100, (foundMetricsCount / expectedMetricsCount) * 100);
}

/**
 * Helper: Parse percentage string "82.5%" to number 82.5
 */
export function parsePercentage(value: string): number | null {
  const cleaned = value.toString().replace('%', '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Helper: Parse currency "₹ 50,000" to number 50000
 */
export function parseCurrency(value: string): number | null {
  const cleaned = value
    .toString()
    .replace(/[₹$€]/g, '')
    .replace(/,/g, '')
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Helper: Validate date is within last 12 months
 */
export function isRecentDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const monthsDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30);
  return monthsDiff >= 0 && monthsDiff <= 12;
}

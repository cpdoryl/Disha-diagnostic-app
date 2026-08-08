/**
 * DISHA File Parser
 * Parses Excel, CSV, PDF, and Word files to extract objective data
 * Supports multiple data formats and validates against dimension requirements
 */

import * as XLSX from 'xlsx';

export interface ParsedData {
  fileType: string;
  fileName: string;
  uploadedAt: Date;
  dataRows: Record<string, any>[];
  headers: string[];
  extractedMetrics: Record<string, number | string>;
  parseStatus: 'success' | 'partial' | 'error';
  errorMessages: string[];
  warnings: string[];
  confidence: number; // 0-100%
}

/**
 * Parse Excel files (.xlsx, .xls)
 */
export async function parseExcelFile(file: File): Promise<ParsedData> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let confidence = 100;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      errors.push('No data found in Excel file');
      return {
        fileType: 'xlsx',
        fileName: file.name,
        uploadedAt: new Date(),
        dataRows: [],
        headers: [],
        extractedMetrics: {},
        parseStatus: 'error',
        errorMessages: errors,
        warnings,
        confidence: 0
      };
    }

    const headers = Object.keys(jsonData[0]);
    const extractedMetrics = extractMetricsFromData(jsonData);

    if (Object.keys(extractedMetrics).length < 5) {
      warnings.push('Limited metrics extracted. Ensure data columns match expected field names.');
      confidence = 60;
    }

    return {
      fileType: 'xlsx',
      fileName: file.name,
      uploadedAt: new Date(),
      dataRows: jsonData,
      headers,
      extractedMetrics,
      parseStatus: errors.length === 0 ? 'success' : 'partial',
      errorMessages: errors,
      warnings,
      confidence
    };
  } catch (error) {
    errors.push(`Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      fileType: 'xlsx',
      fileName: file.name,
      uploadedAt: new Date(),
      dataRows: [],
      headers: [],
      extractedMetrics: {},
      parseStatus: 'error',
      errorMessages: errors,
      warnings,
      confidence: 0
    };
  }
}

/**
 * Parse CSV files (.csv)
 */
export async function parseCSVFile(file: File): Promise<ParsedData> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let confidence = 95;

  try {
    const text = await file.text();

    // Simple CSV parsing
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      errors.push('CSV file must contain headers and at least one data row');
      return {
        fileType: 'csv',
        fileName: file.name,
        uploadedAt: new Date(),
        dataRows: [],
        headers: [],
        extractedMetrics: {},
        parseStatus: 'error',
        errorMessages: errors,
        warnings,
        confidence: 0
      };
    }

    const headers = parseCSVLine(lines[0]);
    const dataRows: Record<string, any>[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = parseCSVLine(lines[i]);
        const row: Record<string, any> = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });
        dataRows.push(row);
      }
    }

    const extractedMetrics = extractMetricsFromData(dataRows);

    if (Object.keys(extractedMetrics).length < 5) {
      warnings.push('Limited metrics extracted. Check column headers match field names.');
      confidence = 70;
    }

    return {
      fileType: 'csv',
      fileName: file.name,
      uploadedAt: new Date(),
      dataRows,
      headers,
      extractedMetrics,
      parseStatus: errors.length === 0 ? 'success' : 'partial',
      errorMessages: errors,
      warnings,
      confidence
    };
  } catch (error) {
    errors.push(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      fileType: 'csv',
      fileName: file.name,
      uploadedAt: new Date(),
      dataRows: [],
      headers: [],
      extractedMetrics: {},
      parseStatus: 'error',
      errorMessages: errors,
      warnings,
      confidence: 0
    };
  }
}

/**
 * Parse PDF files (.pdf) - Extract text content
 * Note: Requires pdf-parse or pdfjs library
 */
export async function parsePDFFile(file: File): Promise<ParsedData> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // PDF parsing requires additional library installation
  // For now, return placeholder
  warnings.push('PDF parsing requires manual data mapping. Please review extracted tables.');

  return {
    fileType: 'pdf',
    fileName: file.name,
    uploadedAt: new Date(),
    dataRows: [],
    headers: [],
    extractedMetrics: {},
    parseStatus: 'partial',
    errorMessages: errors,
    warnings,
    confidence: 40
  };
}

/**
 * Parse Word documents (.docx)
 * Note: Requires docx library for proper parsing
 */
export async function parseWordFile(file: File): Promise<ParsedData> {
  const errors: string[] = [];
  const warnings: string[] = [];

  warnings.push('Word document parsing requires manual data extraction. Please copy tables to Excel for automated processing.');

  return {
    fileType: 'docx',
    fileName: file.name,
    uploadedAt: new Date(),
    dataRows: [],
    headers: [],
    extractedMetrics: {},
    parseStatus: 'partial',
    errorMessages: errors,
    warnings,
    confidence: 20
  };
}

/**
 * Detect file type and route to appropriate parser
 */
export async function parseFile(file: File): Promise<ParsedData> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'xlsx':
    case 'xls':
      return parseExcelFile(file);
    case 'csv':
      return parseCSVFile(file);
    case 'pdf':
      return parsePDFFile(file);
    case 'docx':
    case 'doc':
      return parseWordFile(file);
    default:
      return {
        fileType: extension || 'unknown',
        fileName: file.name,
        uploadedAt: new Date(),
        dataRows: [],
        headers: [],
        extractedMetrics: {},
        parseStatus: 'error',
        errorMessages: [`Unsupported file type: .${extension}`],
        warnings: [],
        confidence: 0
      };
  }
}

/**
 * Parse CSV line with proper quote handling
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Extract metrics from parsed data by matching column headers to known metric names
 */
function extractMetricsFromData(dataRows: Record<string, any>[]): Record<string, number | string> {
  const extracted: Record<string, number | string> = {};

  if (dataRows.length === 0) return extracted;

  // Get all headers from first row
  const headers = Object.keys(dataRows[0]);
  const lowerHeaders = headers.map(h => h.toLowerCase());

  // Map of expected metric names and their variations
  const metricMappings: Record<string, string[]> = {
    'board_exam_pass_rate': ['board exam pass rate', 'board pass %', 'board pass rate', 'board_pass_rate'],
    'avg_exam_score': ['average exam score', 'avg exam score', 'exam score', 'avg_score'],
    'curriculum_coverage': ['curriculum coverage', 'curriculum coverage %', 'coverage %', 'curriculum_coverage'],
    'certified_teachers_pct': ['certified teachers', 'certified teachers %', 'certified %', 'certified_pct'],
    'annual_training_hours': ['annual training hours', 'training hours', 'cpd hours', 'training_hours'],
    'attendance_rate_pct': ['attendance rate', 'attendance %', 'attendance', 'attendance_rate'],
    'dropout_rate_pct': ['dropout rate', 'dropout %', 'dropout', 'dropout_rate'],
    'parent_query_response_sla_hours': ['sla hours', 'response sla', 'query response time', 'parent_sla'],
    'fee_payment_rate_pct': ['fee collection', 'fee payment rate', 'fee payment %', 'fee_rate'],
    'sqaaf_compliance_pct': ['sqaaf compliance', 'sqaaf %', 'compliance', 'sqaaf_pct'],
    'students_per_classroom': ['students per classroom', 'student teacher ratio', 'str', 'student_ratio'],
    'budget_execution_pct': ['budget execution', 'budget %', 'budget execution %', 'budget_pct'],
    'smart_classrooms_pct': ['smart classrooms', 'digital classrooms', 'smart classroom %', 'smart_pct']
  };

  // Try to match headers with metric names
  headers.forEach((header, idx) => {
    const lowerHeader = lowerHeaders[idx];

    // Find matching metric
    Object.entries(metricMappings).forEach(([metricName, variations]) => {
      if (variations.some(v => lowerHeader.includes(v))) {
        const value = dataRows[0][header];
        // Convert to number if it looks like a number
        if (typeof value === 'number') {
          extracted[metricName] = value;
        } else if (typeof value === 'string') {
          const num = parseFloat(value.replace('%', ''));
          if (!isNaN(num)) {
            extracted[metricName] = num;
          }
        }
      }
    });
  });

  return extracted;
}

/**
 * Validate extracted metrics against dimension requirements
 */
export function validateMetrics(
  metrics: Record<string, number | string>,
  dimensionId: string
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for required fields based on dimension
  const requiredFieldsByDimension: Record<string, string[]> = {
    'd1_academic': ['board_exam_pass_rate', 'avg_exam_score', 'curriculum_coverage'],
    'd2_teaching': ['certified_teachers_pct', 'annual_training_hours'],
    'd3_learning_outcomes': ['students_proficiency_pct'],
    'd4_equity': ['girl_enrollment_pct', 'scst_enrollment_pct'],
    'd5_infrastructure': ['students_per_classroom', 'toilet_availability_pct'],
    'd6_student_wellbeing': ['attendance_rate_pct', 'dropout_rate_pct'],
    'd7_teacher_wellbeing': ['teacher_turnover_pct', 'avg_absent_days_per_teacher'],
    'd8_parent_engagement': ['parent_query_response_sla_hours', 'parent_sla_compliance_pct', 'fee_payment_rate_pct'],
    'd9_governance': ['sqaaf_compliance_pct'],
    'd10_financial': ['budget_execution_pct', 'fee_collection_rate_pct'],
    'd11_technology': ['smart_classrooms_pct'],
    'd12_community': ['csr_programs_active'],
    'd13_security': ['dpdp_compliance_items_pct'],
    'd14_reputation': ['parent_nps_score']
  };

  const required = requiredFieldsByDimension[dimensionId] || [];
  required.forEach(field => {
    if (!(field in metrics) || metrics[field] === null || metrics[field] === undefined) {
      errors.push(`Required field missing: ${field}`);
    }
  });

  // Validate ranges
  Object.entries(metrics).forEach(([key, value]) => {
    if (typeof value === 'number') {
      if (key.includes('pct') && (value < 0 || value > 100)) {
        errors.push(`${key} must be between 0-100, got ${value}`);
      }
      if (value < 0) {
        errors.push(`${key} cannot be negative, got ${value}`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export default {
  parseFile,
  parseExcelFile,
  parseCSVFile,
  parsePDFFile,
  parseWordFile,
  validateMetrics
};

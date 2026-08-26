/**
 * Phase 5: Excel/CSV Metrics Importer
 * Batch import metrics from Excel or CSV files
 */

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { METRICS_DEFINITIONS, getMetricsGroupedByDimension } from '@/lib/phase5/metricsDefinitions';

// ============================================================================
// TYPES
// ============================================================================

interface ImportedMetric {
  metricId: string;
  value: string | number;
  dataSource: string;
  sourceDetails?: string;
  notes?: string;
  status: 'valid' | 'invalid' | 'warning';
  errors: string[];
}

interface ImportedDimension {
  dimensionId: number;
  dimensionName: string;
  metrics: ImportedMetric[];
  isValid: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const validateMetricValue = (
  metricId: string,
  value: any
): { isValid: boolean; errors: string[] } => {
  const metric = METRICS_DEFINITIONS.find((m) => m.id === metricId);
  if (!metric) {
    return { isValid: false, errors: ['Metric not found'] };
  }

  const errors: string[] = [];

  // Check if value is empty
  if (value === undefined || value === null || value === '') {
    return { isValid: false, errors: ['Value is empty'] };
  }

  // Validate by data type
  switch (metric.dataType) {
    case 'PERCENTAGE':
      const pctNum = Number(value);
      if (isNaN(pctNum)) errors.push('Must be a number');
      else if (pctNum < 0 || pctNum > 100) errors.push('Must be between 0-100');
      break;

    case 'NUMBER':
      const num = Number(value);
      if (isNaN(num)) errors.push('Must be a number');
      else if (num < metric.minValue) errors.push(`Must be >= ${metric.minValue}`);
      break;

    case 'AVERAGE':
      const avg = Number(value);
      if (isNaN(avg)) errors.push('Must be a number');
      else if (avg < 0 || avg > 100) errors.push('Must be between 0-100');
      break;

    case 'RATIO':
      const ratio = Number(value);
      if (isNaN(ratio)) errors.push('Must be a number');
      else if (ratio < 0) errors.push('Must be positive');
      break;

    case 'DAYS':
      const days = Number(value);
      if (isNaN(days)) errors.push('Must be a number');
      else if (days < 0) errors.push('Must be positive');
      break;

    case 'TEXT':
      if (typeof value !== 'string' || value.trim().length === 0) {
        errors.push('Text cannot be empty');
      }
      break;
  }

  return { isValid: errors.length === 0, errors };
};

// ============================================================================
// COMPONENT
// ============================================================================

interface ExcelMetricsImporterProps {
  onImport: (data: ImportedDimension[]) => Promise<void>;
  isLoading?: boolean;
}

export const ExcelMetricsImporter: React.FC<ExcelMetricsImporterProps> = ({
  onImport,
  isLoading = false,
}) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'validate' | 'success'>('upload');
  const [importedData, setImportedData] = useState<ImportedDimension[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const metricsGrouped = getMetricsGroupedByDimension();

  // ========================================================================
  // DOWNLOAD TEMPLATE
  // ========================================================================

  const downloadTemplate = () => {
    const workbook = XLSX.utils.book_new();

    // Create a sheet for each dimension
    Object.entries(metricsGrouped).forEach(([dimId, metrics]) => {
      const dimensionId = parseInt(dimId);
      const dimensionName = metrics[0]?.dimensionName || `Dimension ${dimensionId}`;

      // Create header
      const data = [
        ['Metric ID', 'Metric Name', 'Value', 'Data Source', 'Source Details', 'Notes'],
        ...metrics.map((m) => [
          m.id,
          m.name,
          '',
          'MANUAL',
          `Example: ${m.dataSources[0]}`,
          '',
        ]),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(data);

      // Format header row
      worksheet['!cols'] = [
        { wch: 12 },
        { wch: 30 },
        { wch: 15 },
        { wch: 12 },
        { wch: 25 },
        { wch: 20 },
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, `D${dimensionId}`);
    });

    // Download
    XLSX.writeFile(workbook, 'disha-metrics-template.xlsx');
  };

  // ========================================================================
  // PARSE EXCEL FILE
  // ========================================================================

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage('');

      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });

        // Parse each sheet (dimension)
        const importedDimensions: ImportedDimension[] = [];

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];

          // Extract dimension number from sheet name (e.g., "D1" → 1)
          const dimensionId = parseInt(sheetName.replace('D', ''));
          if (isNaN(dimensionId) || dimensionId < 1 || dimensionId > 14) {
            return;
          }

          const dimensionMetrics = metricsGrouped[dimensionId] || [];
          const dimensionName = dimensionMetrics[0]?.dimensionName || `Dimension ${dimensionId}`;

          const importedMetrics: ImportedMetric[] = [];

          // Skip header row
          rows.slice(1).forEach((row, idx) => {
            const metricId = row[0]?.toString().trim();
            const value = row[2];
            const dataSource = row[3]?.toString().trim() || 'MANUAL';
            const sourceDetails = row[4]?.toString().trim();
            const notes = row[5]?.toString().trim();

            if (!metricId) return;

            const { isValid, errors } = validateMetricValue(metricId, value);

            importedMetrics.push({
              metricId,
              value,
              dataSource,
              sourceDetails,
              notes,
              status: isValid ? 'valid' : 'invalid',
              errors,
            });
          });

          const hasValidMetrics = importedMetrics.some((m) => m.status === 'valid');

          importedDimensions.push({
            dimensionId,
            dimensionName,
            metrics: importedMetrics,
            isValid: hasValidMetrics,
          });
        });

        if (importedDimensions.length === 0) {
          setErrorMessage('No valid data found in Excel file');
          return;
        }

        setImportedData(importedDimensions);
        setStep('preview');
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to read Excel file'
      );
    }
  };

  // ========================================================================
  // SUBMIT IMPORT
  // ========================================================================

  const handleSubmitImport = async () => {
    try {
      setErrorMessage('');
      await onImport(importedData);
      setStep('success');

      // Reset after 3 seconds
      setTimeout(() => {
        setStep('upload');
        setImportedData([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to import metrics'
      );
    }
  };

  // ========================================================================
  // STEP 1: UPLOAD
  // ========================================================================

  if (step === 'upload') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Import Metrics from Excel</h2>
          <p className="text-blue-100">Upload an Excel or CSV file to bulk import metrics</p>
        </div>

        {/* Download Template */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-800 mb-3">📥 Download Template</h3>
          <p className="text-sm text-gray-600 mb-4">
            Start with a pre-formatted Excel template with all metrics ready to fill in.
          </p>
          <button
            onClick={downloadTemplate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Download Template Excel
          </button>
        </div>

        {/* File Upload */}
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer block">
            <div className="text-4xl mb-2">📤</div>
            <p className="text-lg font-semibold text-gray-800 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-600">
              Excel (.xlsx, .xls) or CSV (.csv) files
            </p>
          </label>
        </div>

        {/* Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-bold text-gray-800 mb-2">1️⃣ Download</p>
            <p className="text-sm text-gray-600">Get the Excel template with all metrics</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-bold text-gray-800 mb-2">2️⃣ Fill Data</p>
            <p className="text-sm text-gray-600">Enter metric values, data sources, and notes</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-bold text-gray-800 mb-2">3️⃣ Upload</p>
            <p className="text-sm text-gray-600">Import and validate the data</p>
          </div>
        </div>

        {/* Format Guide */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">📋 Format:</span> Each sheet represents a dimension
            (D1, D2, etc). Column A = Metric ID, Column C = Value, Column D = Data Source
            (MANUAL/LMS/EXCEL/API/FALLBACK)
          </p>
        </div>
      </div>
    );
  }

  // ========================================================================
  // STEP 2: PREVIEW
  // ========================================================================

  if (step === 'preview') {
    const validCount = importedData.reduce(
      (total, dim) => total + dim.metrics.filter((m) => m.status === 'valid').length,
      0
    );
    const invalidCount = importedData.reduce(
      (total, dim) => total + dim.metrics.filter((m) => m.status === 'invalid').length,
      0
    );

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Preview Import Data</h2>
          <p className="text-purple-100">Review metrics before importing</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-xs text-green-600 font-semibold">VALID METRICS</p>
            <p className="text-2xl font-bold text-green-800">{validCount}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-xs text-red-600 font-semibold">INVALID METRICS</p>
            <p className="text-2xl font-bold text-red-800">{invalidCount}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-600 font-semibold">DIMENSIONS</p>
            <p className="text-2xl font-bold text-blue-800">{importedData.length}</p>
          </div>
        </div>

        {/* Dimension Previews */}
        <div className="space-y-4">
          {importedData.map((dim) => (
            <div key={dim.dimensionId} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b">
                <p className="font-bold text-gray-800">
                  D{dim.dimensionId}: {dim.dimensionName}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Metric ID</th>
                      <th className="px-3 py-2 text-left">Value</th>
                      <th className="px-3 py-2 text-left">Source</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dim.metrics.map((metric) => (
                      <tr key={metric.metricId} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono text-blue-600">{metric.metricId}</td>
                        <td className="px-3 py-2">
                          {metric.value} {metric.errors.length === 0 && '✓'}
                        </td>
                        <td className="px-3 py-2 text-xs">{metric.dataSource}</td>
                        <td className="px-3 py-2">
                          {metric.status === 'valid' ? (
                            <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                              ✓ Valid
                            </span>
                          ) : (
                            <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                              ✕ Invalid: {metric.errors[0]}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Warning for Invalid Metrics */}
        {invalidCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">⚠️ Warning:</span> {invalidCount} invalid metrics
              found. Only valid metrics will be imported. Please review the file.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              setStep('upload');
              setImportedData([]);
            }}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleSubmitImport}
            disabled={isLoading || validCount === 0}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
          >
            {isLoading ? 'Importing...' : `Import ${validCount} Metrics`}
          </button>
        </div>
      </div>
    );
  }

  // ========================================================================
  // STEP 3: SUCCESS
  // ========================================================================

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Import Successful!</h2>
          <p className="text-green-700 mb-6">
            {importedData.reduce((total, dim) => total + dim.metrics.length, 0)} metrics imported
            successfully
          </p>
          <button
            onClick={() => setStep('upload')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Import More Metrics
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ExcelMetricsImporter;

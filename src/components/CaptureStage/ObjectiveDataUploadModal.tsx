import React, { useState } from 'react';
import { X, Loader2, UploadCloud, ChevronDown, ChevronRight, FileDown } from 'lucide-react';
import { FOURTEEN_DIMENSIONS } from '../../data/14DimensionsQuestions';
import { getDimensionMetricSchema } from '../../data/objectiveMetricsSchema';
import { parseExcelFile, parseCSVFile } from '../../lib/fileParser';
import { matchHeadersToObjectiveMetrics } from '../../lib/objectiveMetricsHeaderMatcher';
import { validateAllDimensions } from '../../lib/objectiveDataValidation';
import { saveMultipleDimensionsObjectiveData } from '../../lib/objectiveDataService';
import { downloadObjectiveDataTemplate } from '../../lib/objectiveDataTemplate';
import { MetricInputField } from './MetricInputField';

interface ObjectiveDataUploadModalProps {
  eventId: string;
  schoolId: string;
  onSaved: () => void;
  onClose: () => void;
}

export function ObjectiveDataUploadModal({ eventId, schoolId, onSaved, onClose }: ObjectiveDataUploadModalProps) {
  const [fileName, setFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [valuesByDimension, setValuesByDimension] = useState<Record<string, Record<string, string>>>({});
  const [errorsByDimension, setErrorsByDimension] = useState<Record<string, Record<string, string>>>({});
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleFileSelect = async (file: File) => {
    setIsParsing(true);
    setParseError('');
    setSaveError('');
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension !== 'csv' && extension !== 'xlsx' && extension !== 'xls') {
        setParseError('Unsupported file type. Please upload a .csv, .xlsx, or .xls file.');
        return;
      }
      const parsed = extension === 'csv' ? await parseCSVFile(file) : await parseExcelFile(file);
      if (parsed.parseStatus === 'error' || parsed.dataRows.length === 0) {
        setParseError(parsed.errorMessages[0] || 'Could not read any data from this file.');
        return;
      }

      const matched = matchHeadersToObjectiveMetrics(parsed.headers, parsed.dataRows[0]);
      const stringified: Record<string, Record<string, string>> = {};
      for (const [dimId, metrics] of Object.entries(matched)) {
        stringified[dimId] = {};
        for (const [metricId, value] of Object.entries(metrics)) {
          stringified[dimId][metricId] = String(value);
        }
      }
      setValuesByDimension(stringified);
      setFileName(file.name);
      setExpandedDim(Object.keys(stringified)[0] || null);
    } catch (err) {
      console.error('Failed to parse uploaded file:', err);
      setParseError('Could not read this file. Please check the format and try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const setFieldValue = (dimensionId: string, metricId: string, value: string) => {
    setValuesByDimension((prev) => ({
      ...prev,
      [dimensionId]: { ...prev[dimensionId], [metricId]: value },
    }));
  };

  const handleConfirm = async () => {
    const touched = Object.entries(valuesByDimension).filter(([, vals]: [string, Record<string, string>]) =>
      Object.values(vals).some((v) => v != null && v.trim() !== '')
    );

    if (touched.length === 0) {
      setSaveError('No values to save yet. Upload a file with matching columns, or edit a dimension below.');
      return;
    }

    const rawByDimension: Record<string, Record<string, unknown>> = {};
    for (const [dimId, vals] of touched as [string, Record<string, string>][]) rawByDimension[dimId] = vals;

    const validation = validateAllDimensions(rawByDimension);
    const newErrors: Record<string, Record<string, string>> = {};
    const parsedByDimension: Record<string, Record<string, number>> = {};
    let firstErrorDim: string | null = null;

    for (const [dimId, result] of Object.entries(validation)) {
      if (Object.keys(result.errors).length > 0) {
        newErrors[dimId] = result.errors;
        if (!firstErrorDim) firstErrorDim = dimId;
      }
      if (Object.keys(result.parsedValues).length > 0) {
        parsedByDimension[dimId] = result.parsedValues;
      }
    }

    setErrorsByDimension(newErrors);
    if (firstErrorDim) {
      setExpandedDim(firstErrorDim);
      return;
    }

    setIsSaving(true);
    setSaveError('');
    try {
      await saveMultipleDimensionsObjectiveData(eventId, schoolId, parsedByDimension, {
        source: 'upload',
        sourceFileName: fileName,
      });
      onSaved();
    } catch (err) {
      console.error('Failed to save uploaded objective data:', err);
      setSaveError('Could not save this data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-900">Upload Operational Data</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {!fileName && (
            <>
              <button
                onClick={() => downloadObjectiveDataTemplate()}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 py-2.5 rounded-lg font-semibold text-sm transition-colors"
              >
                <FileDown className="w-4 h-4" />
                Download Blank Template (Excel)
              </button>

              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:bg-gray-50 transition-colors">
                <UploadCloud className="w-8 h-8 text-indigo-500" />
                <p className="text-sm font-semibold text-indigo-600">Choose a CSV or Excel file</p>
                <p className="text-xs text-gray-400">Column headers will be matched to metrics automatically</p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
              </label>
            </>
          )}

          {isParsing && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Reading file...
            </div>
          )}

          {parseError && <p className="text-sm text-red-600">{parseError}</p>}

          {fileName && !isParsing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Matched columns from <span className="font-semibold">{fileName}</span>. Review and correct any values
                  below, then confirm to save.
                </p>
                <label className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer whitespace-nowrap ml-3">
                  Choose different file
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </label>
              </div>

              {FOURTEEN_DIMENSIONS.map((dim) => {
                const schema = getDimensionMetricSchema(dim.id);
                const dimValues: Record<string, string> = valuesByDimension[dim.id] || {};
                const matchedCount = Object.values(dimValues).filter((v) => v && v.trim() !== '').length;
                const isExpanded = expandedDim === dim.id;

                return (
                  <div key={dim.id} className="border border-gray-100 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedDim(isExpanded ? null : dim.id)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <span className="text-sm font-semibold text-gray-800">{dim.name}</span>
                      <span className="flex items-center gap-2 text-xs text-gray-500">
                        {matchedCount}/{schema?.metrics.length || 0} matched
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="p-4 space-y-4">
                        {(schema?.metrics || []).map((def) => (
                          <MetricInputField
                            key={def.id}
                            definition={def}
                            value={dimValues[def.id] ?? ''}
                            onChange={(val) => setFieldValue(dim.id, def.id, val)}
                            error={errorsByDimension[dim.id]?.[def.id]}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSaving || !fileName}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm &amp; Save
          </button>
        </div>
      </div>
    </div>
  );
}

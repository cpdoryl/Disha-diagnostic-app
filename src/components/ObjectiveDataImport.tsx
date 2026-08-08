import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2, Eye, X } from 'lucide-react';
import { parseFile, ParsedData, validateMetrics } from '../lib/fileParser';
import { cn } from '../lib/utils';

interface ObjectiveDataImportProps {
  onDataImported?: (data: ParsedData[]) => void;
  onDimensionSelect?: (dimensionId: string) => void;
}

export const ObjectiveDataImport: React.FC<ObjectiveDataImportProps> = ({
  onDataImported,
  onDimensionSelect
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<ParsedData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ParsedData | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFiles(Array.from(files));
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    setIsUploading(true);
    const newParsedFiles: ParsedData[] = [];

    for (const file of files) {
      try {
        const parsed = await parseFile(file);
        newParsedFiles.push(parsed);
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    }

    setUploadedFiles([...uploadedFiles, ...newParsedFiles]);
    onDataImported?.([...uploadedFiles, ...newParsedFiles]);
    setIsUploading(false);
  };

  const removeFile = (index: number) => {
    const updated = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updated);
    onDataImported?.(updated);
    if (selectedFile === uploadedFiles[index]) {
      setSelectedFile(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200';
      case 'partial':
        return 'bg-amber-50 border-amber-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 transition-colors text-center cursor-pointer',
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        )}
      >
        <input
          type="file"
          multiple
          accept=".xlsx,.xls,.csv,.pdf,.docx,.doc"
          onChange={handleFileInput}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-gray-900">
              {isUploading ? 'Uploading...' : 'Drag & drop your data files'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              or click to select Excel, CSV, PDF, or Word documents
            </p>
          </div>
          <div className="text-xs text-gray-500 mt-2 space-y-1">
            <p>Supported formats: Excel (.xlsx, .xls), CSV, PDF, Word (.docx)</p>
            <p>Files are automatically scanned for school operational metrics</p>
          </div>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">Uploaded Data Files</h3>
          {uploadedFiles.map((file, idx) => (
            <div
              key={idx}
              className={cn(
                'p-4 border rounded-xl transition-all cursor-pointer',
                getStatusColor(file.parseStatus),
                selectedFile === file ? 'ring-2 ring-blue-500' : ''
              )}
              onClick={() => setSelectedFile(file)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {getStatusIcon(file.parseStatus)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 truncate">{file.fileName}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/60 text-gray-700 font-semibold">
                        {file.fileType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {file.dataRows.length} rows • {Object.keys(file.extractedMetrics).length} metrics found
                    </p>

                    {file.errorMessages.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {file.errorMessages.map((err, i) => (
                          <p key={i} className="text-xs text-red-600">
                            ⚠️ {err}
                          </p>
                        ))}
                      </div>
                    )}

                    {file.warnings.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {file.warnings.map((warn, i) => (
                          <p key={i} className="text-xs text-amber-600">
                            ℹ️ {warn}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Extracted Metrics Preview */}
                    {Object.keys(file.extractedMetrics).length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-bold text-gray-700">Extracted Metrics:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(file.extractedMetrics).slice(0, 4).map(([key, value]) => (
                            <span
                              key={key}
                              className="text-xs bg-white/40 px-2 py-1 rounded border border-gray-300"
                            >
                              <span className="font-semibold">{key}:</span> {value}
                            </span>
                          ))}
                          {Object.keys(file.extractedMetrics).length > 4 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{Object.keys(file.extractedMetrics).length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 bg-white/40 rounded-full h-2 overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all',
                            file.parseStatus === 'success'
                              ? 'bg-emerald-500'
                              : file.parseStatus === 'partial'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          )}
                          style={{ width: `${file.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{file.confidence}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(file);
                    }}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    className="p-2 hover:bg-red-100/50 text-red-600 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Details Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-900 text-white">
              <div>
                <h3 className="text-lg font-bold">{selectedFile.fileName}</h3>
                <p className="text-xs text-slate-300 mt-1">{selectedFile.fileType.toUpperCase()} File</p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Parsing Status */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900">Parsing Status</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600">Data Rows</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedFile.dataRows.length}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600">Metrics Found</p>
                    <p className="text-2xl font-bold text-gray-900">{Object.keys(selectedFile.extractedMetrics).length}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600">Confidence</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedFile.confidence}%</p>
                  </div>
                </div>
              </div>

              {/* Extracted Metrics */}
              {Object.keys(selectedFile.extractedMetrics).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900">Extracted Metrics</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(selectedFile.extractedMetrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-2 bg-white rounded border border-gray-100">
                        <span className="text-sm font-semibold text-gray-700">{key}</span>
                        <span className="text-sm font-bold text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Messages */}
              {selectedFile.errorMessages.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-red-600">Errors ({selectedFile.errorMessages.length})</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                    {selectedFile.errorMessages.map((err, i) => (
                      <p key={i} className="text-sm text-red-700">• {err}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {selectedFile.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-amber-600">Warnings ({selectedFile.warnings.length})</h4>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                    {selectedFile.warnings.map((warn, i) => (
                      <p key={i} className="text-sm text-amber-700">• {warn}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Preview */}
              {selectedFile.dataRows.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900">Data Preview (First 3 rows)</h4>
                  <div className="overflow-x-auto bg-gray-50 rounded-lg border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          {selectedFile.headers.slice(0, 5).map((header, i) => (
                            <th key={i} className="px-3 py-2 text-left font-bold text-gray-900">
                              {header}
                            </th>
                          ))}
                          {selectedFile.headers.length > 5 && (
                            <th className="px-3 py-2 text-gray-600">+{selectedFile.headers.length - 5} more</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedFile.dataRows.slice(0, 3).map((row, i) => (
                          <tr key={i} className="border-b border-gray-200 hover:bg-gray-100">
                            {selectedFile.headers.slice(0, 5).map((header, j) => (
                              <td key={j} className="px-3 py-2 text-gray-700">
                                {row[header]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 text-gray-700 font-bold hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
              {selectedFile.parseStatus === 'success' && (
                <button
                  onClick={() => {
                    onDimensionSelect?.(selectedFile.fileType);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                >
                  Use This Data
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Hint */}
      {uploadedFiles.length === 0 && !isUploading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-900">
          <p className="font-bold">💡 How to Import Your Data:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
            <li>Export your school data from ERP system or prepare in Excel</li>
            <li>Ensure columns match metric names (e.g., "Board Exam Pass Rate", "Students per Classroom")</li>
            <li>Upload Excel, CSV, PDF, or Word files</li>
            <li>DISHA will automatically extract metrics and compare with subjective assessment</li>
            <li>Data is processed locally and never stored on external servers</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ObjectiveDataImport;

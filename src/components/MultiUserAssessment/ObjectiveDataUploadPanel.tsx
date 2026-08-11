import React, { useState } from 'react';
import { Upload, FileCheck, AlertCircle, Trash2, Eye } from 'lucide-react';

interface ObjectiveMetrics {
  academicPerformance?: number; // %
  studentEnrollment?: number; // count
  teacherQualification?: number; // %
  infrastructureRating?: number; // 1-5
  libraryResources?: number; // count
  labFacilities?: number; // 1-5
  studentWellbeingPrograms?: number; // count
  staffTrainingHours?: number; // hours
  parentEngagementRate?: number; // %
  financialHealth?: number; // 1-5
  [key: string]: number | undefined;
}

interface ObjectiveDataUploadPanelProps {
  assessmentId: string;
  schoolName: string;
  onDataSubmit: (data: ObjectiveMetrics) => void;
  isSubmitted?: boolean;
}

export function ObjectiveDataUploadPanel({
  assessmentId,
  schoolName,
  onDataSubmit,
  isSubmitted = false,
}: ObjectiveDataUploadPanelProps) {
  const [objectiveData, setObjectiveData] = useState<ObjectiveMetrics>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const metrics = [
    { key: 'academicPerformance', label: 'Academic Performance (%)', type: 'percentage', min: 0, max: 100 },
    { key: 'studentEnrollment', label: 'Total Student Enrollment', type: 'number', min: 0 },
    { key: 'teacherQualification', label: 'Teachers with Master\'s Degree (%)', type: 'percentage', min: 0, max: 100 },
    { key: 'infrastructureRating', label: 'Infrastructure Rating (1-5)', type: 'rating', min: 1, max: 5 },
    { key: 'libraryResources', label: 'Library Resources (Books/Digital)', type: 'number', min: 0 },
    { key: 'labFacilities', label: 'Lab Facilities Rating (1-5)', type: 'rating', min: 1, max: 5 },
    { key: 'studentWellbeingPrograms', label: 'Active Wellbeing Programs', type: 'number', min: 0 },
    { key: 'staffTrainingHours', label: 'Annual Staff Training (Hours)', type: 'number', min: 0 },
    { key: 'parentEngagementRate', label: 'Parent Engagement Rate (%)', type: 'percentage', min: 0, max: 100 },
    { key: 'financialHealth', label: 'Financial Health Rating (1-5)', type: 'rating', min: 1, max: 5 },
  ];

  const validateData = (): boolean => {
    const newErrors: Record<string, string> = {};

    metrics.forEach(metric => {
      const value = objectiveData[metric.key];

      if (value === undefined || value === null || value === '') {
        newErrors[metric.key] = 'This field is required';
      } else if (isNaN(Number(value))) {
        newErrors[metric.key] = 'Must be a number';
      } else if (Number(value) < metric.min || Number(value) > metric.max) {
        newErrors[metric.key] = `Value must be between ${metric.min} and ${metric.max}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (key: string, value: string) => {
    setObjectiveData(prev => ({
      ...prev,
      [key]: value === '' ? undefined : Number(value),
    }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateData()) {
      return;
    }

    setIsLoading(true);
    try {
      onDataSubmit(objectiveData);
    } catch (error) {
      console.error('Error submitting objective data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setObjectiveData({});
    setErrors({});
  };

  const completionPercentage = Math.round((Object.keys(objectiveData).filter(k => objectiveData[k as keyof ObjectiveMetrics] !== undefined).length / metrics.length) * 100);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-orange-600" />
            Objective Data Input (Required for Analysis)
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            School management must provide operational metrics for comprehensive diagnostic analysis
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Completion</p>
          <p className="text-2xl font-bold text-orange-600">{completionPercentage}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Preview Mode */}
      {showPreview ? (
        <div className="space-y-4 mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-900">Data Preview</h4>
            <button
              onClick={() => setShowPreview(false)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map(metric => (
              <div key={metric.key} className="bg-white p-3 rounded border border-gray-200">
                <p className="text-sm text-gray-600">{metric.label}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {objectiveData[metric.key as keyof ObjectiveMetrics] ?? '—'}
                  {metric.type === 'percentage' ? '%' : metric.type === 'rating' ? '/5' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Input Form */
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map(metric => (
              <div key={metric.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {metric.label}
                  {metric.type === 'percentage' && ' (%)'}
                  {metric.type === 'rating' && ' (1-5)'}
                  <span className="text-red-600 ml-1">*</span>
                </label>
                <input
                  type="number"
                  min={metric.min}
                  max={metric.max}
                  step={metric.type === 'percentage' ? '0.1' : '1'}
                  value={objectiveData[metric.key as keyof ObjectiveMetrics] ?? ''}
                  onChange={(e) => handleInputChange(metric.key, e.target.value)}
                  placeholder={`${metric.min} to ${metric.max}`}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                    errors[metric.key]
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {errors[metric.key] && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors[metric.key]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-orange-900">
          <strong>Note:</strong> Objective data is essential for gap analysis between subjective perception (from surveys) and actual operational metrics. This data will be combined with stakeholder feedback to generate actionable insights.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!showPreview ? (
          <>
            <button
              onClick={() => setShowPreview(true)}
              disabled={completionPercentage < 100}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                completionPercentage < 100
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview Data
            </button>
            <button
              onClick={handleClear}
              className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleSubmit}
              disabled={isLoading || isSubmitted}
              className={`flex-1 font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2 ${
                isSubmitted
                  ? 'bg-green-600 text-white'
                  : isLoading
                  ? 'bg-orange-300 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {isSubmitted ? (
                <>
                  <FileCheck className="w-4 h-4" />
                  Data Submitted
                </>
              ) : isLoading ? (
                <>
                  <Upload className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  Submit Objective Data
                </>
              )}
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-6 rounded-lg transition"
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ObjectiveDataUploadPanel;

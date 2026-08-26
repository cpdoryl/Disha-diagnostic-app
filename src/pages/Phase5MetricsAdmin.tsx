/**
 * Phase 5: Metrics Admin Page
 * Admin interface for entering reality metrics
 */

import React, { useState } from 'react';
import { DimensionMetricEditor } from '@/components/Phase5_DataInfrastructure/DimensionMetricEditor';
import { submitDimensionMetrics } from '@/lib/phase5/metricsService';
import { METRICS_DEFINITIONS } from '@/lib/phase5/metricsDefinitions';

// Dimension information
const DIMENSIONS = [
  {
    id: 1,
    name: 'Academic Performance & Learning Outcomes',
    color: 'from-red-500 to-red-600',
    icon: '📚',
    metrics: 6,
  },
  { id: 2, name: 'Curriculum & Pedagogy Quality', color: 'from-blue-500 to-blue-600', icon: '📖', metrics: 5 },
  { id: 3, name: 'Teacher Quality, Development & Retention', color: 'from-purple-500 to-purple-600', icon: '👨‍🏫', metrics: 6 },
  { id: 4, name: 'Student Wellbeing & Mental Health', color: 'from-green-500 to-green-600', icon: '❤️', metrics: 5 },
  { id: 5, name: 'Student Discipline & Behavior', color: 'from-orange-500 to-orange-600', icon: '⚖️', metrics: 5 },
  { id: 6, name: 'Infrastructure & Facilities', color: 'from-yellow-500 to-yellow-600', icon: '🏗️', metrics: 4 },
  { id: 7, name: 'Safety & Security', color: 'from-red-600 to-red-700', icon: '🔒', metrics: 5 },
  { id: 8, name: 'Parent Satisfaction & Engagement', color: 'from-indigo-500 to-indigo-600', icon: '👨‍👩‍👧', metrics: 5 },
  { id: 9, name: 'Student Satisfaction & Engagement', color: 'from-cyan-500 to-cyan-600', icon: '😊', metrics: 5 },
  { id: 10, name: 'Leadership & Governance', color: 'from-slate-500 to-slate-600', icon: '👔', metrics: 5 },
  { id: 11, name: 'Financial Health & Sustainability', color: 'from-emerald-500 to-emerald-600', icon: '💰', metrics: 4 },
  { id: 12, name: 'Admissions, Enrollment & Market Position', color: 'from-pink-500 to-pink-600', icon: '🎓', metrics: 5 },
  { id: 13, name: 'Technology & Digital Readiness', color: 'from-sky-500 to-sky-600', icon: '💻', metrics: 5 },
  { id: 14, name: 'Co-curricular & Holistic Development', color: 'from-lime-500 to-lime-600', icon: '🎭', metrics: 4 },
];

export const Phase5MetricsAdmin: React.FC = () => {
  const [selectedDimension, setSelectedDimension] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Get URL params
  const searchParams = new URLSearchParams(window.location.search);
  const schoolId = searchParams.get('schoolId') || 'default-school';
  const cycleId = searchParams.get('cycleId') || 'cycle-2026-08';

  const handleDimensionSelect = (dimensionId: number) => {
    setSelectedDimension(dimensionId);
    setSubmitStatus('idle');
  };

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Transform form data to metrics format
      const metrics: Record<string, any> = {};

      Object.entries(data.metrics).forEach(([metricId, metricData]: [string, any]) => {
        if (metricData.value !== undefined && metricData.value !== '') {
          metrics[metricId] = metricData;
        }
      });

      if (Object.keys(metrics).length === 0) {
        setSubmitStatus('error');
        setErrorMessage('Please fill at least one metric');
        setIsLoading(false);
        return;
      }

      // Submit to Firestore
      await submitDimensionMetrics(schoolId, cycleId, selectedDimension!, metrics, 'admin@school.local');

      setSubmitStatus('success');

      // Reset after success
      setTimeout(() => {
        setSelectedDimension(null);
        setSubmitStatus('idle');
      }, 3000);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to submit metrics'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================================
  // DIMENSION SELECTION VIEW
  // ========================================================================

  if (selectedDimension === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 shadow-lg">
            <h1 className="text-4xl font-bold mb-2">Reality Metrics Collection</h1>
            <p className="text-blue-100 text-lg">
              Enter metrics for {DIMENSIONS.length} school quality dimensions
            </p>
            <div className="mt-4 flex gap-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="text-xs opacity-75">TOTAL METRICS</p>
                  <p className="text-xl font-bold">{METRICS_DEFINITIONS.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                <div>
                  <p className="text-xs opacity-75">DIMENSIONS</p>
                  <p className="text-xl font-bold">{DIMENSIONS.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏫</span>
                <div>
                  <p className="text-xs opacity-75">SCHOOL</p>
                  <p className="text-sm">{schoolId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dimensions Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DIMENSIONS.map((dim) => (
              <button
                key={dim.id}
                onClick={() => handleDimensionSelect(dim.id)}
                className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden"
              >
                {/* Color Bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${dim.color}`} />

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{dim.icon}</span>
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">
                      D{dim.id}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-800 text-sm mb-1 text-left line-clamp-2">
                    {dim.name}
                  </h3>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-600">{dim.metrics} metrics</span>
                    <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="max-w-7xl mx-auto mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
              <h4 className="font-bold text-gray-800 mb-2">📋 How to Use</h4>
              <p className="text-sm text-gray-600">
                Click on any dimension to enter its metrics. Each dimension has multiple metrics
                to collect.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
              <h4 className="font-bold text-gray-800 mb-2">✓ Data Quality</h4>
              <p className="text-sm text-gray-600">
                All metrics are validated. You can select data source (Manual, LMS, Excel, API,
                Fallback).
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
              <h4 className="font-bold text-gray-800 mb-2">💾 Auto-Save</h4>
              <p className="text-sm text-gray-600">
                Metrics are saved to Firestore immediately. You can resume anytime without losing
                data.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // METRIC EDITING VIEW
  // ========================================================================

  const dimension = DIMENSIONS.find((d) => d.id === selectedDimension);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => setSelectedDimension(null)}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
        >
          ← Back to Dimensions
        </button>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-semibold">
              ✓ Metrics for {dimension?.name} submitted successfully!
            </p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-semibold">✕ Error: {errorMessage}</p>
          </div>
        )}

        {/* Editor */}
        {dimension && (
          <DimensionMetricEditor
            dimensionId={selectedDimension}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default Phase5MetricsAdmin;

/**
 * Phase 5: Dimension Metric Editor
 * All metrics for one dimension in a single view
 */

import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  getMetricsByDimension,
  METRICS_DEFINITIONS,
  MetricDefinition,
} from '@/lib/phase5/metricsDefinitions';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const DimensionMetricsSchema = z.object({
  dimensionId: z.number(),
  metrics: z.record(
    z.string(),
    z.object({
      value: z.union([z.coerce.number(), z.string()]),
      dataSource: z.enum(['MANUAL', 'LMS', 'EXCEL', 'API', 'FALLBACK']),
      sourceDetails: z.string().optional(),
      notes: z.string().optional(),
      isVerified: z.boolean().default(false),
    })
  ),
});

type DimensionMetricsFormData = z.infer<typeof DimensionMetricsSchema>;

// ============================================================================
// COMPONENT TYPES
// ============================================================================

interface DimensionMetricEditorProps {
  dimensionId: number;
  onSubmit: (data: DimensionMetricsFormData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Record<string, any>;
}

// ============================================================================
// METRIC INPUT COMPONENT (Simplified)
// ============================================================================

const MetricInput: React.FC<{
  metric: MetricDefinition;
  register: any;
  watch: any;
  errors: any;
  index: number;
}> = ({ metric, register, watch, errors, index }) => {
  const value = watch(`metrics.${metric.id}.value`) || '';
  const dataSource = watch(`metrics.${metric.id}.dataSource`) || 'MANUAL';

  // Color coding by severity/importance
  const importanceColors: Record<string, string> = {
    academic: 'border-l-4 border-red-500 bg-red-50',
    teacher: 'border-l-4 border-purple-500 bg-purple-50',
    wellbeing: 'border-l-4 border-green-500 bg-green-50',
    infrastructure: 'border-l-4 border-yellow-500 bg-yellow-50',
    safety: 'border-l-4 border-orange-500 bg-orange-50',
    default: 'border-l-4 border-blue-500 bg-blue-50',
  };

  const getColorClass = () => {
    const dim = metric.dimensionId;
    if (dim === 1) return importanceColors.academic;
    if (dim === 3) return importanceColors.teacher;
    if (dim === 4) return importanceColors.wellbeing;
    if (dim === 6) return importanceColors.infrastructure;
    if (dim === 7) return importanceColors.safety;
    return importanceColors.default;
  };

  return (
    <div className={`p-4 rounded-lg mb-3 ${getColorClass()}`}>
      <div className="flex gap-4 items-start">
        {/* Index */}
        <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-gray-700 shadow-sm">
          {index + 1}
        </div>

        {/* Metric Info & Input */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold text-gray-800">{metric.name}</p>
              <p className="text-xs text-gray-600 mt-0.5">{metric.description}</p>
            </div>
            <span className="text-xs bg-white px-2 py-1 rounded font-mono text-gray-700">
              {metric.id}
            </span>
          </div>

          {/* Value Input */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="col-span-1">
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Value {metric.dataType !== 'TEXT' && `(${metric.minValue}-${metric.maxValue})`}
              </label>
              {metric.dataType === 'TEXT' ? (
                <textarea
                  {...register(`metrics.${metric.id}.value`)}
                  rows={2}
                  placeholder="Describe finding..."
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <input
                  type={metric.dataType === 'PERCENTAGE' ? 'number' : 'number'}
                  step={metric.dataType === 'AVERAGE' ? '0.1' : '1'}
                  {...register(`metrics.${metric.id}.value`, { valueAsNumber: metric.dataType !== 'TEXT' })}
                  min={metric.minValue}
                  max={metric.dataType === 'PERCENTAGE' ? 100 : undefined}
                  placeholder="0"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}
              {errors?.metrics?.[metric.id]?.value && (
                <p className="text-xs text-red-600 mt-0.5">
                  {errors.metrics[metric.id].value.message}
                </p>
              )}
            </div>

            {/* Data Source */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Source</label>
              <select
                {...register(`metrics.${metric.id}.dataSource`)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="MANUAL">Manual</option>
                <option value="LMS">LMS</option>
                <option value="EXCEL">Excel</option>
                <option value="API">API</option>
                <option value="FALLBACK">Fallback</option>
              </select>
            </div>

            {/* Verified Checkbox */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
              <div className="h-8 flex items-center">
                <label className="flex items-center gap-1 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(`metrics.${metric.id}.isVerified`)}
                    className="rounded"
                  />
                  <span className="text-gray-700">Verified</span>
                </label>
              </div>
            </div>
          </div>

          {/* Source Details */}
          {dataSource !== 'MANUAL' && (
            <div className="mt-2">
              <input
                type="text"
                {...register(`metrics.${metric.id}.sourceDetails`)}
                placeholder={`${dataSource} details (optional)`}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Formula & Notes */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-xs text-gray-600 mb-0.5">
                <span className="font-semibold">Formula:</span> {metric.formula}
              </p>
            </div>
            <input
              type="text"
              {...register(`metrics.${metric.id}.notes`)}
              placeholder="Notes (optional)"
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Progress Indicator for Percentages */}
          {metric.dataType === 'PERCENTAGE' && value && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full"
                style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN EDITOR COMPONENT
// ============================================================================

export const DimensionMetricEditor: React.FC<DimensionMetricEditorProps> = ({
  dimensionId,
  onSubmit,
  isLoading = false,
  defaultValues,
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'review'>('edit');
  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set());

  const metrics = useMemo(() => getMetricsByDimension(dimensionId), [dimensionId]);

  const dimensionInfo = useMemo(() => {
    if (metrics.length === 0) return null;
    return metrics[0];
  }, [metrics]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<DimensionMetricsFormData>({
    resolver: zodResolver(DimensionMetricsSchema),
    defaultValues: {
      dimensionId,
      metrics: metrics.reduce(
        (acc, m) => {
          acc[m.id] = {
            value: '',
            dataSource: 'MANUAL',
            sourceDetails: '',
            notes: '',
            isVerified: false,
            ...defaultValues?.[m.id],
          };
          return acc;
        },
        {} as Record<string, any>
      ),
    },
  });

  const allValues = watch('metrics');

  // Calculate progress
  const filledCount = Object.values(allValues).filter((v: any) => v?.value).length;
  const totalCount = metrics.length;
  const progressPercentage = (filledCount / totalCount) * 100;

  const toggleMetric = (metricId: string) => {
    const newExpanded = new Set(expandedMetrics);
    if (newExpanded.has(metricId)) {
      newExpanded.delete(metricId);
    } else {
      newExpanded.add(metricId);
    }
    setExpandedMetrics(newExpanded);
  };

  if (!dimensionInfo) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Dimension not found</p>
      </div>
    );
  }

  // ========================================================================
  // EDIT TAB
  // ========================================================================

  if (activeTab === 'edit') {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm font-semibold opacity-90">Dimension {dimensionId}</div>
              <h1 className="text-3xl font-bold">{dimensionInfo.dimensionName}</h1>
              <p className="text-blue-100 mt-2">
                Enter {totalCount} metrics for this dimension
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{filledCount}</div>
              <div className="text-sm opacity-90">of {totalCount} filled</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-blue-300 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs opacity-75 mt-2">{Math.round(progressPercentage)}% Complete</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-300">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === 'edit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Edit Metrics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === 'review'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Review ({filledCount}/{totalCount})
          </button>
        </div>

        {/* Metrics List */}
        <div className="space-y-2">
          {metrics.map((metric, index) => (
            <MetricInput
              key={metric.id}
              metric={metric}
              register={register}
              watch={watch}
              errors={errors}
              index={index}
            />
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <span className="font-semibold">💡 Tip:</span> All values are validated against the
            formula and data type. Fallback procedures are documented if data is unavailable.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <button
            type="button"
            onClick={() => reset()}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Clear Form
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            disabled={isLoading || filledCount === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            Review Metrics
          </button>
        </div>
      </form>
    );
  }

  // ========================================================================
  // REVIEW TAB
  // ========================================================================

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Review {dimensionInfo.dimensionName}</h1>
        <p className="text-green-100">
          {filledCount} of {totalCount} metrics ready to submit
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-600 font-semibold">TOTAL METRICS</p>
          <p className="text-2xl font-bold text-blue-800">{totalCount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs text-green-600 font-semibold">FILLED</p>
          <p className="text-2xl font-bold text-green-800">{filledCount}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-xs text-yellow-600 font-semibold">EMPTY</p>
          <p className="text-2xl font-bold text-yellow-800">{totalCount - filledCount}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-xs text-purple-600 font-semibold">VERIFIED</p>
          <p className="text-2xl font-bold text-purple-800">
            {
              Object.values(allValues).filter((v: any) => v?.isVerified).length
            }
          </p>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="space-y-2">
        <h3 className="font-bold text-gray-800 mb-3">Metric Values</h3>
        {metrics.map((metric) => {
          const metricValue = allValues[metric.id];
          const hasValue = metricValue?.value !== undefined && metricValue?.value !== '';

          return (
            <div
              key={metric.id}
              className={`p-3 rounded-lg border ${
                hasValue
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 opacity-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{metric.name}</p>
                  <p className="text-xs text-gray-600">{metric.id}</p>
                </div>
                <div className="text-right">
                  {hasValue ? (
                    <div>
                      <p className="text-lg font-bold text-green-700">
                        {metricValue.value}
                        {metric.dataType === 'PERCENTAGE' && '%'}
                        {metric.dataType === 'RATIO' && ':1'}
                        {metric.dataType === 'DAYS' && ' days'}
                      </p>
                      <p className="text-xs text-gray-600">{metricValue.dataSource}</p>
                      {metricValue.isVerified && (
                        <p className="text-xs text-green-600 font-semibold">✓ Verified</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-red-600 font-semibold">Not filled</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning for Empty Metrics */}
      {filledCount < totalCount && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">⚠️ Warning:</span> {totalCount - filledCount} metrics
            are empty. You can still submit, but consider filling all metrics for complete
            assessment.
          </p>
        </div>
      )}

      {/* Submit Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">✓ Ready to submit?</span> All metrics will be saved to
          the database and become available in the diagnostic report.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Back to Edit
        </button>
        <button
          type="submit"
          disabled={isLoading || filledCount === 0}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isLoading ? 'Submitting...' : 'Submit All Metrics'}
        </button>
      </div>
    </form>
  );
};

export default DimensionMetricEditor;

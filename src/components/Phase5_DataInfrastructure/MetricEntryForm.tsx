/**
 * Phase 5: Metric Entry Form
 * Generic form for entering reality metrics across all data types
 */

import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MetricDefinition } from '@/lib/phase5/metricsDefinitions';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const BaseMetricSchema = z.object({
  metricId: z.string(),
  dataSource: z.enum(['MANUAL', 'LMS', 'EXCEL', 'API', 'FALLBACK']),
  sourceDetails: z.string().optional(),
  notes: z.string().optional(),
});

const PercentageMetricSchema = BaseMetricSchema.extend({
  value: z.coerce.number().min(0).max(100),
  unit: z.literal('%'),
});

const NumberMetricSchema = BaseMetricSchema.extend({
  value: z.coerce.number().min(0),
  unit: z.literal(''),
});

const AverageMetricSchema = BaseMetricSchema.extend({
  value: z.coerce.number().min(0).max(100),
  unit: z.literal(''),
});

const RatioMetricSchema = BaseMetricSchema.extend({
  value: z.coerce.number().min(0),
  unit: z.literal(':1'),
});

const DaysMetricSchema = BaseMetricSchema.extend({
  value: z.coerce.number().min(0),
  unit: z.literal('days'),
});

const TextMetricSchema = BaseMetricSchema.extend({
  value: z.string().min(1, 'Please describe'),
  unit: z.literal(''),
});

// ============================================================================
// COMPONENT TYPES
// ============================================================================

interface MetricEntryFormProps {
  metric: MetricDefinition;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Record<string, any>;
}

// ============================================================================
// PERCENTAGE METRIC INPUT
// ============================================================================

const PercentageMetricInput: React.FC<{
  metric: MetricDefinition;
  register: any;
  watch: any;
  errors: any;
}> = ({ metric, register, watch, errors }) => {
  const value = watch('value') || 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {metric.name} (0-100%)
        </label>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="number"
              {...register('value', { valueAsNumber: true })}
              min={metric.minValue}
              max={metric.maxValue}
              placeholder="Enter percentage"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.value && (
              <p className="text-xs text-red-600 mt-1">{errors.value.message}</p>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{Math.round(value)}%</div>
              <div className="text-xs text-gray-500">of {metric.maxValue}%</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all"
            style={{ width: `${Math.min((value / metric.maxValue) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Source Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          How was this measured? (e.g., "Google Classroom - Math 10A")
        </label>
        <input
          type="text"
          {...register('sourceDetails')}
          placeholder="Data source details"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

// ============================================================================
// NUMBER METRIC INPUT
// ============================================================================

const NumberMetricInput: React.FC<{
  metric: MetricDefinition;
  register: any;
  watch: any;
  errors: any;
}> = ({ metric, register, watch, errors }) => {
  const value = watch('value') || 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {metric.name}
        </label>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="number"
              {...register('value', { valueAsNumber: true })}
              min={metric.minValue}
              placeholder={`Enter number (min: ${metric.minValue})`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.value && (
              <p className="text-xs text-red-600 mt-1">{errors.value.message}</p>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{value}</div>
              <div className="text-xs text-gray-500">{metric.unit}</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data source details
        </label>
        <input
          type="text"
          {...register('sourceDetails')}
          placeholder="Where this number comes from"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

// ============================================================================
// AVERAGE METRIC INPUT
// ============================================================================

const AverageMetricInput: React.FC<{
  metric: MetricDefinition;
  register: any;
  watch: any;
  errors: any;
}> = ({ metric, register, watch, errors }) => {
  const value = watch('value') || 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {metric.name} (Average Score)
        </label>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="number"
              step="0.1"
              {...register('value', { valueAsNumber: true })}
              min={metric.minValue}
              max={metric.maxValue}
              placeholder="Enter average score"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.value && (
              <p className="text-xs text-red-600 mt-1">{errors.value.message}</p>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center">
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {(value as number).toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">out of 100</div>
            </div>
          </div>
        </div>

        <div className="mt-2 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-purple-600 h-full transition-all"
            style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          How was this average calculated?
        </label>
        <input
          type="text"
          {...register('sourceDetails')}
          placeholder="e.g., Average of class formative test scores"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

// ============================================================================
// RATIO METRIC INPUT
// ============================================================================

const RatioMetricInput: React.FC<{
  metric: MetricDefinition;
  register: any;
  errors: any;
}> = ({ metric, register, errors }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {metric.name}
        </label>
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="number"
              step="0.1"
              {...register('value', { valueAsNumber: true })}
              placeholder="Enter ratio (e.g., 3 for 3:1)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.value && (
              <p className="text-xs text-red-600 mt-1">{errors.value.message}</p>
            )}
          </div>
          <div className="text-gray-600 font-semibold">: 1</div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          How was this ratio calculated?
        </label>
        <input
          type="text"
          {...register('sourceDetails')}
          placeholder="e.g., Activity-based lessons / Lecture-based lessons"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

// ============================================================================
// DAYS METRIC INPUT
// ============================================================================

const DaysMetricInput: React.FC<{
  metric: MetricDefinition;
  register: any;
  watch: any;
  errors: any;
}> = ({ metric, register, watch, errors }) => {
  const value = watch('value') || 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {metric.name} (in days)
        </label>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="number"
              {...register('value', { valueAsNumber: true })}
              min={metric.minValue}
              placeholder="Enter number of days"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.value && (
              <p className="text-xs text-red-600 mt-1">{errors.value.message}</p>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center">
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">{value}</div>
              <div className="text-xs text-gray-500">days</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          How was this measured?
        </label>
        <input
          type="text"
          {...register('sourceDetails')}
          placeholder="e.g., Average time from report to resolution"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

// ============================================================================
// TEXT METRIC INPUT
// ============================================================================

const TextMetricInput: React.FC<{
  metric: MetricDefinition;
  register: any;
  errors: any;
}> = ({ metric, register, errors }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {metric.name}
        </label>
        <textarea
          {...register('value')}
          rows={4}
          placeholder="Describe the finding..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.value && (
          <p className="text-xs text-red-600 mt-1">{errors.value.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data source
        </label>
        <input
          type="text"
          {...register('sourceDetails')}
          placeholder="Where did you find this information?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

// ============================================================================
// MAIN FORM COMPONENT
// ============================================================================

export const MetricEntryForm: React.FC<MetricEntryFormProps> = ({
  metric,
  onSubmit,
  isLoading = false,
  defaultValues,
}) => {
  // Select appropriate schema based on data type
  const schema = useMemo(() => {
    switch (metric.dataType) {
      case 'PERCENTAGE':
        return PercentageMetricSchema;
      case 'NUMBER':
        return NumberMetricSchema;
      case 'AVERAGE':
        return AverageMetricSchema;
      case 'RATIO':
        return RatioMetricSchema;
      case 'DAYS':
        return DaysMetricSchema;
      case 'TEXT':
        return TextMetricSchema;
      default:
        return BaseMetricSchema;
    }
  }, [metric.dataType]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      metricId: metric.id,
      dataSource: 'MANUAL',
      ...defaultValues,
    },
  });

  const dataSource = watch('dataSource');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Metric Header */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{metric.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
          </div>
          <div className="text-right">
            <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
              {metric.id}
            </div>
          </div>
        </div>
      </div>

      {/* Formula & Example */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-1">FORMULA</p>
          <p className="text-sm text-gray-800">{metric.formula}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-xs font-semibold text-green-600 mb-1">EXAMPLE</p>
          <p className="text-sm text-gray-800">{metric.example}</p>
        </div>
      </div>

      {/* Data Source Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Data Source *
        </label>
        <select
          {...register('dataSource')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="MANUAL">Manual Entry</option>
          <option value="LMS">Learning Management System (LMS)</option>
          <option value="EXCEL">Excel/CSV File</option>
          <option value="API">API/System Integration</option>
          <option value="FALLBACK">Fallback/Estimate</option>
        </select>
      </div>

      {/* Data Entry Fields */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        {metric.dataType === 'PERCENTAGE' && (
          <PercentageMetricInput
            metric={metric}
            register={register}
            watch={watch}
            errors={errors}
          />
        )}
        {metric.dataType === 'NUMBER' && (
          <NumberMetricInput
            metric={metric}
            register={register}
            watch={watch}
            errors={errors}
          />
        )}
        {metric.dataType === 'AVERAGE' && (
          <AverageMetricInput
            metric={metric}
            register={register}
            watch={watch}
            errors={errors}
          />
        )}
        {metric.dataType === 'RATIO' && (
          <RatioMetricInput metric={metric} register={register} errors={errors} />
        )}
        {metric.dataType === 'DAYS' && (
          <DaysMetricInput
            metric={metric}
            register={register}
            watch={watch}
            errors={errors}
          />
        )}
        {metric.dataType === 'TEXT' && (
          <TextMetricInput metric={metric} register={register} errors={errors} />
        )}
      </div>

      {/* Optional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes (optional)
        </label>
        <textarea
          {...register('notes')}
          rows={2}
          placeholder="Add any context or caveats about this metric..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Data Source Info Box */}
      {dataSource !== 'MANUAL' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-yellow-700 mb-1">💡 Data Source Info</p>
          <p className="text-xs text-yellow-800">
            {dataSource === 'LMS' &&
              'Connect to your LMS to automatically pull gradebook data.'}
            {dataSource === 'EXCEL' &&
              'Upload an Excel file with the metric data. Template available.'}
            {dataSource === 'API' && 'This data will be pulled from an API integration.'}
            {dataSource === 'FALLBACK' &&
              'Using fallback procedure: ' + metric.fallback}
          </p>
        </div>
      )}

      {/* Fallback Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-blue-700 mb-1">📋 Fallback Option</p>
        <p className="text-xs text-blue-800">{metric.fallback}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isLoading ? 'Saving...' : 'Save Metric'}
        </button>
      </div>
    </form>
  );
};

export default MetricEntryForm;

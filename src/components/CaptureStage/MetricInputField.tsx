import React from 'react';
import { ObjectiveMetricDefinition } from '../../data/objectiveMetricsSchema';

interface MetricInputFieldProps {
  definition: ObjectiveMetricDefinition;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function MetricInputField({ definition, value, onChange, error }: MetricInputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {definition.label}
        {definition.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`e.g. ${definition.benchmark}`}
          className={`w-full px-3 py-2 pr-20 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
            error ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200'
          }`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{definition.unit}</span>
      </div>
      <div className="flex items-center justify-between mt-1 gap-2">
        <p className="text-xs text-gray-400">
          Benchmark: {definition.benchmark} {definition.unit}
        </p>
        {error && <p className="text-xs text-red-600 text-right">{error}</p>}
      </div>
    </div>
  );
}

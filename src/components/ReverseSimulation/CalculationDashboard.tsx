import React, { useState } from 'react';
import { BarChart3, Loader, AlertCircle } from 'lucide-react';
import { useReverseSimulation } from '../../hooks/useReverseSimulation';

interface CalculationDashboardProps {
  simulationId: string;
  schoolId: string;
  dimensions: Record<string, number>;
  currentHealth: number;
  targetHealth: number;
  timelineMonths: number;
  budget: number;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

export const CalculationDashboard: React.FC<CalculationDashboardProps> = ({
  simulationId,
  schoolId,
  dimensions,
  currentHealth,
  targetHealth,
  timelineMonths,
  budget,
  onSuccess,
  onError,
}) => {
  const { performReverseCalculation, loading, errors } = useReverseSimulation();
  const [result, setResult] = useState<any>(null);
  const [strategy, setStrategy] = useState<'uniform' | 'strategic' | 'aggressive'>('strategic');

  const handleCalculate = async () => {
    try {
      const response = await performReverseCalculation({
        simulationId,
        schoolId,
        dimensions,
        currentHealth,
        targetHealth,
        timelineMonths,
        budget,
        allocationStrategy: strategy,
      });

      setResult(response);
      onSuccess(response);
    } catch (error: any) {
      onError(error.message || 'Failed to calculate');
    }
  };

  const isLoading = loading['performReverseCalculation'] || false;

  if (!result) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Calculate Target Distribution</h3>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Budget Allocation Strategy
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['uniform', 'strategic', 'aggressive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStrategy(s)}
                className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                  strategy === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {strategy === 'uniform' && 'Equal distribution across all dimensions'}
            {strategy === 'strategic' && 'Focus on highest-impact dimensions'}
            {strategy === 'aggressive' && 'Maximum impact with concentrated effort'}
          </p>
        </div>

        {errors['performReverseCalculation'] && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{errors['performReverseCalculation']}</p>
          </div>
        )}

        <button
          onClick={handleCalculate}
          disabled={isLoading}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4" />
              Run Calculation
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estimated Outcome */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <p className="text-sm text-blue-600 font-semibold mb-1">Estimated Outcome</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-blue-900">{result.estimatedOutcome}</span>
          <span className="text-lg text-blue-600">/100</span>
        </div>
        <p className="text-xs text-blue-600 mt-2">Based on your {strategy} strategy</p>
      </div>

      {/* ROI Estimate */}
      <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-6">
        <p className="text-sm text-emerald-600 font-semibold mb-1">ROI Estimate</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-emerald-900">{result.roiEstimate.toFixed(2)}</span>
          <span className="text-sm text-emerald-600">% return on investment</span>
        </div>
      </div>

      {/* Dimension Targets Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-bold text-gray-900 mb-4">Target Distribution by Dimension</h4>
        <div className="space-y-3">
          {Object.entries(result.dimensionTargets).map(([dimId, target]: [string, any]) => {
            const current = dimensions[dimId] || 0;
            const gap = (target as number) - current;
            return (
              <div key={dimId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{dimId}</span>
                  <span className="text-sm text-gray-600">{current} → {target}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(target as number) / 100 * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget Allocation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-bold text-gray-900 mb-4">Budget Allocation by Dimension</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {Object.entries(result.budgetAllocation)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .map(([dimId, allocated]: [string, any]) => {
              const percentage = ((allocated as number) / budget) * 100;
              return (
                <div key={dimId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{dimId}</span>
                    <span className="text-sm text-gray-600">₹{(allocated as number).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <button
        onClick={() => setResult(null)}
        className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
      >
        Recalculate
      </button>
    </div>
  );
};

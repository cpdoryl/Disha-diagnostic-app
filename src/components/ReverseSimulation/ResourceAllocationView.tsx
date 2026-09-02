import React, { useState } from 'react';
import { PieChart, Loader, AlertCircle } from 'lucide-react';
import { useReverseSimulation } from '../../hooks/useReverseSimulation';

interface ResourceAllocationViewProps {
  simulationId: string;
  totalBudget: number;
  dimensionGaps: Record<string, number>;
  feasibilityScores: Record<string, number>;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

export const ResourceAllocationView: React.FC<ResourceAllocationViewProps> = ({
  simulationId,
  totalBudget,
  dimensionGaps,
  feasibilityScores,
  onSuccess,
  onError,
}) => {
  const { allocateResources, loading, errors } = useReverseSimulation();
  const [result, setResult] = useState<any>(null);

  const handleAllocate = async () => {
    try {
      const response = await allocateResources({
        simulationId,
        totalBudget,
        dimensionGaps,
        feasibilityScores,
      });

      setResult(response);
      onSuccess(response);
    } catch (error: any) {
      onError(error.message || 'Failed to allocate resources');
    }
  };

  const isLoading = loading['allocateResources'] || false;

  if (!result) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <PieChart className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-bold text-gray-900">Allocate Resources by Tier</h3>
        </div>

        <p className="text-sm text-gray-600">
          Intelligently distribute budget across tier-based allocation strategy with ROI optimization.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Allocation Strategy:</strong>
          </p>
          <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4">
            <li>• Tier 1 (40%): High Impact, High Priority</li>
            <li>• Tier 2 (35%): Medium Impact</li>
            <li>• Tier 3 (15%): Lower Priority, Phased</li>
            <li>• Contingency (10%): Buffer for uncertainties</li>
          </ul>
        </div>

        {errors['allocateResources'] && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{errors['allocateResources']}</p>
          </div>
        )}

        <button
          onClick={handleAllocate}
          disabled={isLoading}
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Allocating...
            </>
          ) : (
            <>
              <PieChart className="w-4 h-4" />
              Run Resource Allocation
            </>
          )}
        </button>
      </div>
    );
  }

  const tiers = [
    { name: 'Tier 1: High Impact', amount: result.tierAllocation.tier1, color: '#ef4444', percentage: 40 },
    { name: 'Tier 2: Medium Impact', amount: result.tierAllocation.tier2, color: '#f59e0b', percentage: 35 },
    { name: 'Tier 3: Phased', amount: result.tierAllocation.tier3, color: '#3b82f6', percentage: 15 },
    { name: 'Contingency', amount: result.tierAllocation.contingency, color: '#6b7280', percentage: 10 },
  ];

  return (
    <div className="space-y-4">
      {/* Total Budget Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-bold text-gray-900 mb-4">Budget Breakdown by Tier</h4>
        <div className="space-y-3">
          {tiers.map((tier) => (
            <div key={tier.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{tier.name}</span>
                <span className="text-sm text-gray-600">₹{tier.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{ width: `${tier.percentage}%`, backgroundColor: tier.color }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{tier.percentage}% of total budget</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dimension-Level Budget Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-bold text-gray-900 mb-4">Budget Allocation by Dimension</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {Object.entries(result.dimensionBudgets)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .map(([dimension, budget]: [string, any]) => (
              <div key={dimension}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{dimension}</span>
                  <span className="text-sm text-gray-600">₹{(budget as number).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${((budget as number) / totalBudget) * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ROI Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-bold text-gray-900 mb-4">ROI by Dimension</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {Object.entries(result.roiByDimension)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .map(([dimension, roi]: [string, any]) => (
              <div key={dimension} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-700">{dimension}</span>
                <span className={`text-sm font-bold ${roi > 1 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {(roi as number).toFixed(2)}x ROI
                </span>
              </div>
            ))}
        </div>
      </div>

      <button
        onClick={() => setResult(null)}
        className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
      >
        Reallocate
      </button>
    </div>
  );
};

import React, { useState } from 'react';
import { ClipboardList, Loader, AlertCircle } from 'lucide-react';
import { useReverseSimulation } from '../../hooks/useReverseSimulation';

interface ActionMappingUIProps {
  simulationId: string;
  currentDimensions: Record<string, number>;
  targetDimensions: Record<string, number>;
  timelineMonths: number;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

export const ActionMappingUI: React.FC<ActionMappingUIProps> = ({
  simulationId,
  currentDimensions,
  targetDimensions,
  timelineMonths,
  onSuccess,
  onError,
}) => {
  const { generateActionPlan, loading, errors } = useReverseSimulation();
  const [result, setResult] = useState<any>(null);

  const handleGeneratePlan = async () => {
    try {
      const response = await generateActionPlan({
        simulationId,
        currentDimensions,
        targetDimensions,
        timelineMonths,
      });

      setResult(response);
      onSuccess(response);
    } catch (error: any) {
      onError(error.message || 'Failed to generate action plan');
    }
  };

  const isLoading = loading['generateActionPlan'] || false;

  if (!result) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <ClipboardList className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Generate Action Plan</h3>
        </div>

        <p className="text-sm text-gray-600">
          Generate dimension-specific interventions, root causes, and success criteria based on your targets.
        </p>

        {errors['generateActionPlan'] && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{errors['generateActionPlan']}</p>
          </div>
        )}

        <button
          onClick={handleGeneratePlan}
          disabled={isLoading}
          className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <ClipboardList className="w-4 h-4" />
              Generate Action Plan
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total Cost Summary */}
      <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
        <p className="text-sm text-purple-600 font-semibold mb-1">Estimated Total Cost</p>
        <div className="text-3xl font-bold text-purple-900">
          ₹{result.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </div>
      </div>

      {/* Priority Order */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-bold text-gray-900 mb-4">Implementation Priority</h4>
        <ol className="space-y-2">
          {result.priorityOrder.map((dimension, idx) => (
            <li key={dimension} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
              <span className="text-sm font-bold text-white bg-blue-600 w-6 h-6 flex items-center justify-center rounded-full">
                {idx + 1}
              </span>
              <span className="text-sm font-medium text-gray-800">{dimension}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Actions by Dimension */}
      <div className="space-y-4">
        {Object.entries(result.actionsByDimension).map(([dimension, actions]: [string, any]) => (
          <div key={dimension} className="bg-white rounded-lg border border-gray-200 p-4">
            <h5 className="font-bold text-gray-900 mb-3">{dimension}</h5>
            <div className="space-y-3">
              {/* Root Cause */}
              {actions.rootCause && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded">
                  <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Root Cause</p>
                  <p className="text-sm text-amber-800">{actions.rootCause}</p>
                </div>
              )}

              {/* Interventions */}
              {actions.interventions && Array.isArray(actions.interventions) && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Interventions</p>
                  <div className="space-y-2">
                    {actions.interventions.map((intervention: any, idx: number) => (
                      <div key={idx} className="p-2 bg-blue-50 border border-blue-100 rounded text-sm">
                        <p className="font-medium text-blue-900">{intervention.name || intervention}</p>
                        {intervention.duration && (
                          <p className="text-xs text-blue-700">Duration: {intervention.duration}</p>
                        )}
                        {intervention.cost && (
                          <p className="text-xs text-blue-700">Cost: ₹{intervention.cost.toLocaleString('en-IN')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Criteria */}
              {actions.successCriteria && Array.isArray(actions.successCriteria) && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Success Criteria</p>
                  <ul className="space-y-1">
                    {actions.successCriteria.map((criteria: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* KPI */}
              {actions.kpi && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded">
                  <p className="text-xs font-semibold text-emerald-700 uppercase mb-1">KPI</p>
                  <p className="text-sm text-emerald-800">{actions.kpi}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setResult(null)}
        className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
      >
        Generate Again
      </button>
    </div>
  );
};

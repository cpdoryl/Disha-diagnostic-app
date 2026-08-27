import React, { useState } from 'react';
import { Calendar, Loader, AlertCircle } from 'lucide-react';
import { useReverseSimulation } from '../../hooks/useReverseSimulation';

interface TimelineTrackerProps {
  simulationId: string;
  dimensionTargets: Record<string, number>;
  timelineMonths: number;
  budget: number;
  priority: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

export const TimelineTracker: React.FC<TimelineTrackerProps> = ({
  simulationId,
  dimensionTargets,
  timelineMonths,
  budget,
  priority,
  onSuccess,
  onError,
}) => {
  const { generateTimeline, loading, errors } = useReverseSimulation();
  const [result, setResult] = useState<any>(null);

  const handleGenerateTimeline = async () => {
    try {
      const response = await generateTimeline({
        simulationId,
        dimensionTargets,
        timelineMonths,
        budget,
        priority,
      });

      setResult(response);
      onSuccess(response);
    } catch (error: any) {
      onError(error.message || 'Failed to generate timeline');
    }
  };

  const isLoading = loading['generateTimeline'] || false;

  if (!result) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-bold text-gray-900">Generate Implementation Timeline</h3>
        </div>

        <p className="text-sm text-gray-600">
          Create a detailed 3-phase implementation timeline with milestones, deliverables, and risk management.
        </p>

        {errors['generateTimeline'] && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{errors['generateTimeline']}</p>
          </div>
        )}

        <button
          onClick={handleGenerateTimeline}
          disabled={isLoading}
          className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              Generate Timeline
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Phases */}
      <div className="space-y-3">
        {result.phases.map((phase, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900">
                {phase.phase} Phase
              </h4>
              <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded">
                Months {phase.startMonth}-{phase.endMonth}
              </span>
            </div>

            {/* Deliverables */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Deliverables</p>
              <ul className="space-y-1">
                {phase.deliverables.map((deliverable, didx) => (
                  <li key={didx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">→</span>
                    <span>{deliverable}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* KPIs */}
            {phase.kpis && Object.keys(phase.kpis).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase mb-2">KPIs</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(phase.kpis).map(([kpi, value]) => (
                    <div key={kpi} className="text-xs p-2 bg-gray-50 rounded">
                      <p className="font-medium text-gray-700">{kpi}</p>
                      <p className="text-gray-600">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-bold text-gray-900 mb-4">Key Milestones</h4>
        <div className="space-y-3">
          {result.milestones.map((milestone, idx) => (
            <div key={idx} className="relative pl-6 pb-4 last:pb-0">
              <div className="absolute left-0 top-0 w-3 h-3 bg-blue-600 rounded-full" />
              <div className="absolute left-1.5 top-3 w-0.5 h-8 bg-blue-200 last:hidden" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Month {milestone.month}: {milestone.description}
                </p>
                <ul className="mt-1 space-y-1">
                  {milestone.criteria.map((criteria, cidx) => (
                    <li key={cidx} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-emerald-600 mt-0.5">✓</span>
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-bold text-gray-900 mb-4">Risk Management</h4>
        <div className="space-y-3">
          {result.risks.map((risk, idx) => (
            <div key={idx} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-gray-900 text-sm">{risk.risk}</p>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  risk.probability === 'High' ? 'bg-red-100 text-red-700' :
                  risk.probability === 'Medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {risk.probability}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                <strong>Impact:</strong> {risk.impact}
              </p>
              <p className="text-xs text-gray-700 bg-blue-50 p-2 rounded">
                <strong>Mitigation:</strong> {risk.mitigation}
              </p>
            </div>
          ))}
        </div>
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

import React, { useState } from 'react';
import { AlertCircle, TrendingUp, Loader, CheckCircle2 } from 'lucide-react';
import { useReverseSimulation } from '../../hooks/useReverseSimulation';

interface FeasibilityAssessmentProps {
  simulationId: string;
  currentDimensions: Record<string, number>;
  targetDimensions: Record<string, number>;
  timelineMonths: number;
  budgetPerMonth: number;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

const getBandColor = (band: string) => {
  switch (band) {
    case 'Highly Feasible':
      return 'bg-emerald-50 border-emerald-200 text-emerald-900';
    case 'Feasible':
      return 'bg-blue-50 border-blue-200 text-blue-900';
    case 'Challenging':
      return 'bg-amber-50 border-amber-200 text-amber-900';
    case 'High Risk':
      return 'bg-red-50 border-red-200 text-red-900';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-900';
  }
};

const getBandIcon = (band: string) => {
  switch (band) {
    case 'Highly Feasible':
      return '✓✓';
    case 'Feasible':
      return '✓';
    case 'Challenging':
      return '!';
    case 'High Risk':
      return '✗';
    default:
      return '?';
  }
};

export const FeasibilityAssessment: React.FC<FeasibilityAssessmentProps> = ({
  simulationId,
  currentDimensions,
  targetDimensions,
  timelineMonths,
  budgetPerMonth,
  onSuccess,
  onError,
}) => {
  const { analyzeFeasibility, loading, errors } = useReverseSimulation();
  const [result, setResult] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleAnalyze = async () => {
    try {
      setSubmitted(true);
      const response = await analyzeFeasibility({
        simulationId,
        currentDimensions,
        targetDimensions,
        timelineMonths,
        budgetPerMonth,
      });

      setResult(response);
      onSuccess(response);
    } catch (error: any) {
      onError(error.message || 'Failed to analyze feasibility');
    }
  };

  const isLoading = loading['analyzeFeasibility'] || false;

  if (!result) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Feasibility Analysis</h3>
        </div>

        <p className="text-sm text-gray-600">
          Analyze how feasible your goals are based on current dimensions, targets, timeline, and budget constraints.
        </p>

        {errors['analyzeFeasibility'] && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{errors['analyzeFeasibility']}</p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Run Feasibility Analysis
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Feasibility Score */}
      <div className={`rounded-lg border p-6 ${getBandColor(result.feasibilityBand)}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold mb-1">Overall Feasibility Score</h3>
            <p className="text-sm opacity-80">Based on gap size, timeline, and budget</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{result.overallFeasibility}</div>
            <div className="text-sm font-semibold">{result.feasibilityBand}</div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-current h-2 rounded-full transition-all"
            style={{ width: `${result.overallFeasibility}%` }}
          />
        </div>
      </div>

      {/* Risk Level */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Risk Assessment</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            result.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-700' :
            result.riskLevel === 'Medium' ? 'bg-blue-100 text-blue-700' :
            result.riskLevel === 'High' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {result.riskLevel} Risk
          </span>
        </div>
      </div>

      {/* Dimension Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Highly Feasible */}
        {result.dimensionCategories.highlyFeasible.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
              <span className="text-lg">✓✓</span> Highly Feasible
            </h4>
            <ul className="space-y-1">
              {result.dimensionCategories.highlyFeasible.map((dim) => (
                <li key={dim} className="text-sm text-emerald-800">• {dim}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Feasible */}
        {result.dimensionCategories.feasible.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span className="text-lg">✓</span> Feasible
            </h4>
            <ul className="space-y-1">
              {result.dimensionCategories.feasible.map((dim) => (
                <li key={dim} className="text-sm text-blue-800">• {dim}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Challenging */}
        {result.dimensionCategories.challenging.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
              <span className="text-lg">!</span> Challenging
            </h4>
            <ul className="space-y-1">
              {result.dimensionCategories.challenging.map((dim) => (
                <li key={dim} className="text-sm text-amber-800">• {dim}</li>
              ))}
            </ul>
          </div>
        )}

        {/* High Risk */}
        {result.dimensionCategories.highRisk.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
              <span className="text-lg">✗</span> High Risk
            </h4>
            <ul className="space-y-1">
              {result.dimensionCategories.highRisk.map((dim) => (
                <li key={dim} className="text-sm text-red-800">• {dim}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-bold text-blue-900 mb-3">Key Recommendations</h4>
          <ul className="space-y-2">
            {result.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => {
          setResult(null);
          setSubmitted(false);
        }}
        className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
      >
        Run Again
      </button>
    </div>
  );
};

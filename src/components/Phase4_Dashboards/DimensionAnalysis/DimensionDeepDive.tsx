/**
 * Dimension Deep-Dive Component
 * Phase 4: Dashboard Analysis
 *
 * Displays detailed analysis for a single dimension:
 * - Reality vs Perception chart
 * - Gap breakdown
 * - Respondent breakdown
 * - Trend comparison (YoY)
 * - Sortable metrics table
 */

import React, { useMemo } from 'react';
import { DimensionScore } from 'src/lib/phase4/useRealTimePhase3Data';
import RealityVsPerceptionChart from './RealityVsPerceptionChart';
import GapBreakdownChart from './GapBreakdownChart';
import RespondentBreakdown from './RespondentBreakdown';
import TrendComparison from './TrendComparison';
import MetricsTable from './MetricsTable';

interface DimensionDeepDiveProps {
  dimension: DimensionScore;
  loading?: boolean;
  onBack?: () => void;
}

export const DimensionDeepDive: React.FC<DimensionDeepDiveProps> = ({
  dimension,
  loading = false,
  onBack,
}) => {
  // Calculate metrics breakdown
  const metricsData = useMemo(() => {
    // This would come from the underlying metrics data
    // For now, we'll generate sample data based on dimension
    const baseScore = dimension.realityScore;
    return [
      {
        metricId: `${dimension.dimensionId}a`,
        name: `Metric ${dimension.dimensionId}a`,
        reality: baseScore + Math.random() * 10 - 5,
        perception: baseScore + Math.random() * 15 - 7,
      },
      {
        metricId: `${dimension.dimensionId}b`,
        name: `Metric ${dimension.dimensionId}b`,
        reality: baseScore + Math.random() * 10 - 5,
        perception: baseScore + Math.random() * 15 - 7,
      },
      {
        metricId: `${dimension.dimensionId}c`,
        name: `Metric ${dimension.dimensionId}c`,
        reality: baseScore + Math.random() * 10 - 5,
        perception: baseScore + Math.random() * 15 - 7,
      },
      {
        metricId: `${dimension.dimensionId}d`,
        name: `Metric ${dimension.dimensionId}d`,
        reality: baseScore + Math.random() * 10 - 5,
        perception: baseScore + Math.random() * 15 - 7,
      },
      {
        metricId: `${dimension.dimensionId}e`,
        name: `Metric ${dimension.dimensionId}e`,
        reality: baseScore + Math.random() * 10 - 5,
        perception: baseScore + Math.random() * 15 - 7,
      },
      {
        metricId: `${dimension.dimensionId}f`,
        name: `Metric ${dimension.dimensionId}f`,
        reality: baseScore + Math.random() * 10 - 5,
        perception: baseScore + Math.random() * 15 - 7,
      },
    ];
  }, [dimension]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dimension analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </button>
        )}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            {dimension.dimensionName}
          </h1>
          <p className="text-gray-600 mt-2">Dimension {dimension.dimensionId}</p>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-lg shadow p-6">
        <div>
          <p className="text-gray-600 text-sm font-medium">Reality Score</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">
            {dimension.realityScore.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">out of 100</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium">Perception Score</p>
          <p className="text-4xl font-bold text-orange-600 mt-2">
            {dimension.perceptionScore.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">out of 100</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium">Gap</p>
          <p
            className={`text-4xl font-bold mt-2 ${
              dimension.gapSeverity === 'CRITICAL'
                ? 'text-red-600'
                : dimension.gapSeverity === 'HIGH'
                  ? 'text-orange-600'
                  : dimension.gapSeverity === 'MEDIUM'
                    ? 'text-yellow-600'
                    : 'text-green-600'
            }`}
          >
            {dimension.gap.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{dimension.gapSeverity}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reality vs Perception Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Reality vs Perception
          </h2>
          <RealityVsPerceptionChart metricsData={metricsData} />
        </div>

        {/* Gap Breakdown Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Gap Analysis
          </h2>
          <GapBreakdownChart dimension={dimension} />
        </div>

        {/* Respondent Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Respondent Breakdown
          </h2>
          <RespondentBreakdown respondentData={dimension.respondentBreakdown} />
        </div>

        {/* Trend Comparison */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Year-over-Year Trend
          </h2>
          <TrendComparison currentScore={dimension.realityScore} />
        </div>
      </div>

      {/* Metrics Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Metrics Breakdown</h2>
        <MetricsTable metricsData={metricsData} />
      </div>

      {/* Analysis Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            <strong>Status:</strong> {dimension.gapSeverity} severity gap detected
          </li>
          <li>
            <strong>Gap Direction:</strong> {dimension.gapDirection}
          </li>
          <li>
            <strong>Respondents:</strong> {dimension.respondentCount} respondents
          </li>
          <li>
            <strong>Metrics Covered:</strong> {dimension.metricCount} metrics
          </li>
          <li>
            <strong>Recommendation:</strong>{' '}
            {dimension.gapSeverity === 'CRITICAL'
              ? 'Immediate action required to address critical gap'
              : dimension.gapSeverity === 'HIGH'
                ? 'High priority improvement needed'
                : 'Monitor and continue current approach'}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DimensionDeepDive;

/**
 * Executive Summary Dashboard
 * Phase 4: Dashboards & Reporting
 *
 * Main dashboard component displaying:
 * - Key metrics cards (KPIs)
 * - Heat map grid (dimensions vs severity)
 * - Real-time Firestore data
 * - Navigation to deep-dive views
 */

import React, { useState } from 'react';
import { usePhase3Dashboard } from 'src/lib/phase4/useRealTimePhase3Data';
import HeatMapGrid from './HeatMapGrid';
import KeyMetricsCards from './KeyMetricsCards';

interface DashboardExecutiveSummaryProps {
  schoolId: string;
  assessmentId: string;
  onDimensionSelect?: (dimensionId: number) => void;
}

export const DashboardExecutiveSummary: React.FC<DashboardExecutiveSummaryProps> = ({
  schoolId,
  assessmentId,
  onDimensionSelect,
}) => {
  const { scores, gaps, recommendations, actionPlan, loading, error } = usePhase3Dashboard(
    schoolId,
    assessmentId
  );
  const [selectedDimension, setSelectedDimension] = useState<number | null>(null);

  const handleDimensionClick = (dimensionId: number) => {
    setSelectedDimension(dimensionId);
    onDimensionSelect?.(dimensionId);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
        <h3 className="font-semibold mb-2">Error Loading Dashboard</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Executive Summary</h1>
        <p className="text-gray-600 mt-2">
          School assessment analysis and gap prioritization
        </p>
        {scores?.calculatedAt && (
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {new Date(scores.calculatedAt?.toDate?.() || scores.calculatedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Key Metrics Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Metrics</h2>
        <KeyMetricsCards
          calculationResult={scores}
          gapAnalysisResult={gaps}
          recommendations={recommendations}
          loading={loading}
        />
      </div>

      {/* Heat Map Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dimensions Overview</h2>
        <HeatMapGrid
          dimensionScores={scores?.dimensionScores || []}
          onDimensionClick={handleDimensionClick}
          loading={loading}
        />
      </div>

      {/* Quick Stats */}
      {scores && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-600 text-sm">Assessment ID</p>
              <p className="text-gray-900 font-mono text-sm mt-1">
                {assessmentId?.slice(0, 8)}...
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Metrics</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{scores.responseCount}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Unique Respondents</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{scores.respondentCount}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Status</p>
              <p className="text-green-600 font-semibold mt-1">
                {scores.analysisReady ? '✅ Ready' : '⏳ Processing'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Items Preview */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Next Steps ({recommendations.length} action items)
          </h3>
          <div className="space-y-2">
            {recommendations.slice(0, 3).map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <span className="text-blue-600 font-bold">→</span>
                <div>
                  <p className="text-gray-900 font-medium">{rec.actionTitle}</p>
                  <p className="text-gray-600 text-xs">Owner: {rec.owner}</p>
                </div>
              </div>
            ))}
            {recommendations.length > 3 && (
              <p className="text-blue-600 text-sm font-medium pt-2">
                +{recommendations.length - 3} more actions
              </p>
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          <strong>💡 Tip:</strong> Click any cell in the dimensions table to view detailed
          analysis, metric breakdowns, and trend comparisons for that dimension.
        </p>
      </div>
    </div>
  );
};

export default DashboardExecutiveSummary;

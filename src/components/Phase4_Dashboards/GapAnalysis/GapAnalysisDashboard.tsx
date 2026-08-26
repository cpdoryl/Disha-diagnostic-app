/**
 * Gap Analysis Dashboard
 * Phase 4: Days 8-9
 *
 * Identifies and visualizes perception-reality gaps
 * Severity grouping, top gaps, dimension comparison
 */

import React, { useMemo } from 'react';
import { GapAnalysisResult, GapItem } from 'src/lib/phase4/useRealTimePhase3Data';

interface GapAnalysisDashboardProps {
  gapAnalysis?: GapAnalysisResult;
  loading?: boolean;
  onDimensionSelect?: (dimensionId: string) => void;
}

const SEVERITY_CONFIG = {
  CRITICAL: { color: '#D32F2F', bgColor: '#FFEBEE', label: 'Critical', threshold: 25 },
  HIGH: { color: '#F57C00', bgColor: '#FFF3E0', label: 'High', threshold: 15 },
  MEDIUM: { color: '#FBC02D', bgColor: '#FFFDE7', label: 'Medium', threshold: 8 },
  LOW: { color: '#388E3C', bgColor: '#F1F8E9', label: 'Low', threshold: 0 },
};

export const GapAnalysisDashboard: React.FC<GapAnalysisDashboardProps> = ({
  gapAnalysis,
  loading = false,
  onDimensionSelect,
}) => {
  // Group gaps by severity
  const gapsBySeverity = useMemo(() => {
    if (!gapAnalysis?.gaps) {
      return {
        CRITICAL: [],
        HIGH: [],
        MEDIUM: [],
        LOW: [],
      };
    }

    const grouped: Record<string, GapItem[]> = {
      CRITICAL: [],
      HIGH: [],
      MEDIUM: [],
      LOW: [],
    };

    for (const gap of gapAnalysis.gaps) {
      grouped[gap.gapSeverity]?.push(gap);
    }

    return grouped;
  }, [gapAnalysis]);

  // Get top 5 critical gaps
  const topCriticalGaps = useMemo(() => {
    return gapsBySeverity.CRITICAL.sort(
      (a, b) => (b.gapScore || 0) - (a.gapScore || 0)
    ).slice(0, 5);
  }, [gapsBySeverity]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = gapAnalysis?.gaps?.length || 0;
    const critical = gapsBySeverity.CRITICAL.length;
    const high = gapsBySeverity.HIGH.length;
    const medium = gapsBySeverity.MEDIUM.length;
    const low = gapsBySeverity.LOW.length;

    return {
      total,
      critical,
      high,
      medium,
      low,
      percentCritical: total > 0 ? ((critical / total) * 100).toFixed(1) : '0',
      avgGapScore:
        total > 0
          ? ((gapAnalysis?.gaps?.reduce((sum, g) => sum + (g.gapScore || 0), 0) || 0) / total).toFixed(1)
          : '0',
    };
  }, [gapAnalysis, gapsBySeverity]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gap analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Gap Analysis</h1>
        <p className="text-gray-600 mt-2">Perception-Reality Gap Visualization & Identification</p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total Gaps</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div
          className="bg-white rounded-lg shadow p-6 border-l-4"
          style={{ borderColor: SEVERITY_CONFIG.CRITICAL.color }}
        >
          <p className="text-gray-600 text-sm font-medium">Critical</p>
          <p className="text-3xl font-bold mt-2" style={{ color: SEVERITY_CONFIG.CRITICAL.color }}>
            {stats.critical}
          </p>
          <p className="text-xs text-gray-500 mt-1">{stats.percentCritical}% of total</p>
        </div>
        <div
          className="bg-white rounded-lg shadow p-6 border-l-4"
          style={{ borderColor: SEVERITY_CONFIG.HIGH.color }}
        >
          <p className="text-gray-600 text-sm font-medium">High</p>
          <p className="text-3xl font-bold mt-2" style={{ color: SEVERITY_CONFIG.HIGH.color }}>
            {stats.high}
          </p>
        </div>
        <div
          className="bg-white rounded-lg shadow p-6 border-l-4"
          style={{ borderColor: SEVERITY_CONFIG.MEDIUM.color }}
        >
          <p className="text-gray-600 text-sm font-medium">Medium</p>
          <p className="text-3xl font-bold mt-2" style={{ color: SEVERITY_CONFIG.MEDIUM.color }}>
            {stats.medium}
          </p>
        </div>
        <div
          className="bg-white rounded-lg shadow p-6 border-l-4"
          style={{ borderColor: SEVERITY_CONFIG.LOW.color }}
        >
          <p className="text-gray-600 text-sm font-medium">Average Gap</p>
          <p className="text-3xl font-bold mt-2" style={{ color: SEVERITY_CONFIG.LOW.color }}>
            {stats.avgGapScore}
          </p>
        </div>
      </div>

      {/* Top Critical Gaps */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Top 5 Critical Gaps</h2>
        {topCriticalGaps.length > 0 ? (
          <div className="space-y-3">
            {topCriticalGaps.map((gap, idx) => (
              <div
                key={idx}
                className="border-l-4 p-4 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: SEVERITY_CONFIG.CRITICAL.color }}
                onClick={() => onDimensionSelect?.(gap.dimensionId)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {gap.dimensionName} • {gap.metricName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{gap.insight}</p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      <span>🎯 Gap: {gap.gapScore?.toFixed(1)}</span>
                      <span>📊 {gap.respondentType}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: SEVERITY_CONFIG.CRITICAL.color }}
                    >
                      {gap.gapScore?.toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No critical gaps detected. Excellent work!</p>
          </div>
        )}
      </div>

      {/* Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Gap Severity Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(SEVERITY_CONFIG).map(([severity, config]) => {
              const count = stats[severity.toLowerCase() as keyof typeof stats] as number;
              const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(0) : '0';
              return (
                <div key={severity}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{config.label}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        backgroundColor: config.color,
                        width: `${percentage}%`,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gap Score Range */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Gap Score Legend</h2>
          <div className="space-y-2">
            {Object.entries(SEVERITY_CONFIG).map(([severity, config]) => (
              <div key={severity} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: config.color }}
                ></div>
                <span className="text-sm text-gray-700">
                  <strong>{config.label}</strong>: Gap ≥ {config.threshold}
                </span>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 rounded p-4 mt-4 text-sm text-gray-700">
            <p className="font-semibold mb-2">📌 What is a Gap?</p>
            <p>The difference between Perception Score (what stakeholders think) and Reality Score (actual metrics). Larger gaps indicate areas needing attention.</p>
          </div>
        </div>
      </div>

      {/* Respondent Type Filter Info */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p><strong>💡 Tip:</strong> Click on any critical gap above to view detailed dimension analysis and drill down into specific metrics.</p>
      </div>
    </div>
  );
};

export default GapAnalysisDashboard;

/**
 * Comparison View Component
 * Phase 4: Days 12-14
 *
 * Side-by-side comparison of current vs previous assessments
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ComparisonData {
  dimensionId: string;
  dimensionName: string;
  currentRealityScore: number;
  currentPerceptionScore: number;
  previousRealityScore: number;
  previousPerceptionScore: number;
  currentGap: number;
  previousGap: number;
  trend: 'improved' | 'declined' | 'stable';
  trendPercent: number;
}

interface ComparisonViewProps {
  currentAssessmentId: string;
  previousAssessmentId?: string;
  dimensions?: ComparisonData[];
  loading?: boolean;
}

const TREND_COLORS = {
  improved: '#4CAF50',
  declined: '#F44336',
  stable: '#FFC107',
};

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  currentAssessmentId,
  previousAssessmentId,
  dimensions = [],
  loading = false,
}) => {
  // Generate sample comparison data
  const comparisonData = useMemo((): ComparisonData[] => {
    if (dimensions.length > 0) return dimensions;

    // Sample data for demonstration
    return [
      {
        dimensionId: 'D1',
        dimensionName: 'Academic Reputation & Rigour',
        currentRealityScore: 72,
        currentPerceptionScore: 81,
        previousRealityScore: 65,
        previousPerceptionScore: 75,
        currentGap: 9,
        previousGap: 10,
        trend: 'improved',
        trendPercent: 7,
      },
      {
        dimensionId: 'D2',
        dimensionName: 'Teacher Welfare & Development',
        currentRealityScore: 68,
        currentPerceptionScore: 78,
        previousRealityScore: 70,
        previousPerceptionScore: 76,
        currentGap: 10,
        previousGap: 6,
        trend: 'declined',
        trendPercent: -3,
      },
      {
        dimensionId: 'D3',
        dimensionName: 'Leadership & Governance',
        currentRealityScore: 85,
        currentPerceptionScore: 88,
        previousRealityScore: 80,
        previousPerceptionScore: 85,
        currentGap: 3,
        previousGap: 5,
        trend: 'improved',
        trendPercent: 12,
      },
      {
        dimensionId: 'D4',
        dimensionName: 'Parent Engagement & SLA',
        currentRealityScore: 62,
        currentPerceptionScore: 80,
        previousRealityScore: 60,
        previousPerceptionScore: 82,
        currentGap: 18,
        previousGap: 22,
        trend: 'improved',
        trendPercent: 18,
      },
    ];
  }, [dimensions]);

  // Chart data for trend visualization
  const trendChartData = useMemo(() => {
    return comparisonData.map((d) => ({
      dimensionId: d.dimensionId,
      currentReality: d.currentRealityScore,
      previousReality: d.previousRealityScore,
      trend: d.trendPercent,
    }));
  }, [comparisonData]);

  // Gap trend chart data
  const gapTrendChartData = useMemo(() => {
    return comparisonData.map((d) => ({
      dimensionId: d.dimensionId,
      currentGap: d.currentGap,
      previousGap: d.previousGap,
      improvement: d.previousGap - d.currentGap,
    }));
  }, [comparisonData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comparison data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Assessment Comparison</h1>
        <p className="text-gray-600 mt-2">Current vs Previous Assessment Analysis</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Dimensions Improved</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {comparisonData.filter((d) => d.trend === 'improved').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Dimensions Declined</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {comparisonData.filter((d) => d.trend === 'declined').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Avg Gap Change</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {(comparisonData.reduce((sum, d) => sum + (d.previousGap - d.currentGap), 0) / comparisonData.length).toFixed(1)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Avg Reality Improvement</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {(comparisonData.reduce((sum, d) => sum + (d.currentRealityScore - d.previousRealityScore), 0) / comparisonData.length).toFixed(1)}
          </p>
        </div>
      </div>

      {/* Reality Score Comparison */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Reality Score Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trendChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="dimensionId" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="previousReality" fill="#9CA3AF" name="Previous" radius={[8, 8, 0, 0]} />
            <Bar dataKey="currentReality" fill="#1976D2" name="Current" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gap Improvement Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Gap Improvement Analysis</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={gapTrendChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="dimensionId" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="previousGap" fill="#F57C00" name="Previous Gap" radius={[8, 8, 0, 0]} />
            <Bar dataKey="currentGap" fill="#388E3C" name="Current Gap" radius={[8, 8, 0, 0]} />
            <Bar dataKey="improvement" fill="#4CAF50" name="Improvement" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension-wise Comparison Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Dimension Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Dimension</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Previous Reality</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Current Reality</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Change</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Previous Gap</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Current Gap</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Trend</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((dim, idx) => (
                <tr
                  key={dim.dimensionId}
                  className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="py-3 px-4 font-medium text-gray-900">{dim.dimensionId}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{dim.previousRealityScore}</td>
                  <td className="py-3 px-4 text-center font-semibold text-gray-900">{dim.currentRealityScore}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-semibold ${
                        dim.currentRealityScore > dim.previousRealityScore
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {dim.currentRealityScore > dim.previousRealityScore ? '+' : ''}
                      {dim.currentRealityScore - dim.previousRealityScore}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">{dim.previousGap.toFixed(1)}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{dim.currentGap.toFixed(1)}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold text-white"
                      style={{ backgroundColor: TREND_COLORS[dim.trend] }}
                    >
                      {dim.trend === 'improved'
                        ? `↑ ${dim.trendPercent}%`
                        : dim.trend === 'declined'
                          ? `↓ ${Math.abs(dim.trendPercent)}%`
                          : 'Stable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Improvements */}
      <div className="bg-green-50 rounded-lg border border-green-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">🎉 Top Improvements</h3>
        <div className="space-y-2">
          {comparisonData
            .filter((d) => d.trend === 'improved')
            .sort((a, b) => b.trendPercent - a.trendPercent)
            .slice(0, 3)
            .map((dim) => (
              <div key={dim.dimensionId} className="flex items-center justify-between">
                <span className="text-gray-900 font-medium">{dim.dimensionName}</span>
                <span className="text-green-600 font-bold">
                  ↑ {dim.trendPercent.toFixed(1)}% | Gap reduced: {(dim.previousGap - dim.currentGap).toFixed(1)}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Areas Needing Attention */}
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">⚠️ Areas Needing Attention</h3>
        <div className="space-y-2">
          {comparisonData
            .filter((d) => d.trend === 'declined')
            .sort((a, b) => a.trendPercent - b.trendPercent)
            .map((dim) => (
              <div key={dim.dimensionId} className="flex items-center justify-between">
                <span className="text-gray-900 font-medium">{dim.dimensionName}</span>
                <span className="text-red-600 font-bold">
                  ↓ {Math.abs(dim.trendPercent).toFixed(1)}% | Gap increased: {(dim.currentGap - dim.previousGap).toFixed(1)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;

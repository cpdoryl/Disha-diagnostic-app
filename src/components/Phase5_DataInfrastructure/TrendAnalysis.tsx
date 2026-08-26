/**
 * Phase 6: Trend Analysis
 * Year-over-year metric comparisons, forecasting, and trend indicators
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  ScatterChart,
} from 'recharts';
import { getDimensionMetrics } from '@/lib/phase5/metricsService';

// ============================================================================
// TYPES
// ============================================================================

interface MetricTrend {
  period: string;
  value: number;
  previous: number;
  forecast: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

interface DimensionTrend {
  dimensionId: number;
  dimensionName: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  forecast: number;
  data: MetricTrend[];
}

interface TrendAnalysisData {
  schoolId: string;
  cycleId: string;
  previousCycleId: string;
  generatedAt: Date;
  dimensions: DimensionTrend[];
  overallTrend: {
    current: number;
    previous: number;
    change: number;
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  };
}

// ============================================================================
// MOCK DATA GENERATOR (In production, pull from Firestore)
// ============================================================================

const generateTrendData = (): MetricTrend[] => {
  const data: MetricTrend[] = [];
  const baseValue = 65;

  for (let i = 0; i < 12; i++) {
    const noise = Math.random() * 10 - 5;
    const trend = (i / 12) * 15; // Upward trend
    const value = Math.round(baseValue + noise + trend);
    const previous = Math.round(baseValue - 5 + (i / 12) * 10);

    // Simple linear forecast
    const forecast = Math.round(value + (i / 12) * 5);

    data.push({
      period: `Month ${i + 1}`,
      value: Math.min(100, Math.max(0, value)),
      previous: Math.min(100, Math.max(0, previous)),
      forecast: Math.min(100, Math.max(0, forecast)),
      trend: value > previous ? 'IMPROVING' : value < previous ? 'DECLINING' : 'STABLE',
    });
  }

  return data;
};

const generateDimensionTrend = (dimensionId: number, dimensionName: string): DimensionTrend => {
  const data = generateTrendData();
  const current = data[data.length - 1].value;
  const previous = data[0].previous;
  const change = current - previous;
  const changePercent = previous > 0 ? Math.round((change / previous) * 100) : 0;

  return {
    dimensionId,
    dimensionName,
    currentValue: current,
    previousValue: previous,
    change,
    changePercent,
    trend: change > 5 ? 'IMPROVING' : change < -5 ? 'DECLINING' : 'STABLE',
    forecast: data[data.length - 1].forecast,
    data,
  };
};

// ============================================================================
// COMPONENT
// ============================================================================

interface TrendAnalysisProps {
  schoolId: string;
  cycleId: string;
  previousCycleId: string;
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ schoolId, cycleId, previousCycleId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [trends, setTrends] = useState<TrendAnalysisData | null>(null);
  const [selectedDimension, setSelectedDimension] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTrendData();
  }, [schoolId, cycleId]);

  const loadTrendData = async () => {
    try {
      setError('');

      // Generate mock data (in production, pull from Firestore with historical comparison)
      const dimensionTrends: DimensionTrend[] = [];

      for (let i = 1; i <= 14; i++) {
        const names = [
          'Academic Quality',
          'Equity & Inclusion',
          'Teacher Capability',
          'Student Wellbeing',
          'School Safety',
          'Infrastructure',
          'Family Engagement',
          'Leadership',
          'Governance',
          'Financial Health',
          'Digital Readiness',
          'Community Partnerships',
          'Sustainability',
          'Innovation',
        ];

        dimensionTrends.push(generateDimensionTrend(i, names[i - 1]));
      }

      const current = dimensionTrends.reduce((sum, d) => sum + d.currentValue, 0) / 14;
      const previous = dimensionTrends.reduce((sum, d) => sum + d.previousValue, 0) / 14;

      setTrends({
        schoolId,
        cycleId,
        previousCycleId,
        generatedAt: new Date(),
        dimensions: dimensionTrends,
        overallTrend: {
          current: Math.round(current),
          previous: Math.round(previous),
          change: Math.round(current - previous),
          trend: current > previous ? 'IMPROVING' : current < previous ? 'DECLINING' : 'STABLE',
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trend data');
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading trend analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-semibold">Error loading trend data</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!trends) {
    return <div className="text-gray-600 text-center py-8">No trend data available</div>;
  }

  // Get selected dimension data
  const selectedData = trends.dimensions[selectedDimension - 1];

  // ========================================================================
  // RENDER TRENDS
  // ========================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Trend Analysis & Forecasting</h1>
            <p className="text-purple-100 mt-1">Year-over-year comparisons and predictive analytics</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Generated</p>
            <p className="font-mono text-sm">{trends.generatedAt.toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Overall Trend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-gray-800">Overall Score</p>
            {trends.overallTrend.trend === 'IMPROVING' && (
              <span className="text-2xl text-green-500">📈</span>
            )}
            {trends.overallTrend.trend === 'DECLINING' && (
              <span className="text-2xl text-red-500">📉</span>
            )}
            {trends.overallTrend.trend === 'STABLE' && (
              <span className="text-2xl text-gray-500">➡️</span>
            )}
          </div>
          <div className="mb-4">
            <p className="text-4xl font-bold text-purple-600">{trends.overallTrend.current}</p>
            <p className="text-sm text-gray-600 mt-1">
              vs {trends.overallTrend.previous} last cycle
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-bold ${
                trends.overallTrend.change > 0
                  ? 'text-green-600'
                  : trends.overallTrend.change < 0
                    ? 'text-red-600'
                    : 'text-gray-600'
              }`}
            >
              {trends.overallTrend.change > 0 ? '+' : ''}
              {trends.overallTrend.change}
            </span>
            <p className="text-sm text-gray-600">change this cycle</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="font-semibold text-gray-800 mb-4">Dimensions Improving</p>
          <p className="text-4xl font-bold text-green-600 mb-2">
            {trends.dimensions.filter((d) => d.trend === 'IMPROVING').length}
          </p>
          <p className="text-sm text-gray-600">
            out of 14 dimensions on upward trajectory
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="font-semibold text-gray-800 mb-4">Dimensions Declining</p>
          <p className="text-4xl font-bold text-red-600 mb-2">
            {trends.dimensions.filter((d) => d.trend === 'DECLINING').length}
          </p>
          <p className="text-sm text-gray-600">
            showing downward trend (action needed)
          </p>
        </div>
      </div>

      {/* Dimension Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Select Dimension for Deep Dive</h2>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          {trends.dimensions.map((dim) => (
            <button
              key={dim.dimensionId}
              onClick={() => setSelectedDimension(dim.dimensionId)}
              className={`p-3 rounded-lg font-semibold text-sm transition-all ${
                selectedDimension === dim.dimensionId
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <div className="truncate">{dim.dimensionName.split(' ')[0]}</div>
              <div className="text-xs mt-1">
                {dim.trend === 'IMPROVING' && '📈'}
                {dim.trend === 'DECLINING' && '📉'}
                {dim.trend === 'STABLE' && '➡️'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Dimension Detail */}
      {selectedData && (
        <>
          {/* Dimension Header */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedData.dimensionName}</h2>
                <p className="text-gray-600 mt-2">
                  Dimension {selectedData.dimensionId}: Historical performance and forecast
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-purple-600">{selectedData.currentValue}</p>
                <p className="text-sm text-gray-600 mt-1">current score</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-purple-200">
              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">PREVIOUS CYCLE</p>
                <p className="text-2xl font-bold text-gray-800">{selectedData.previousValue}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">CHANGE</p>
                <p
                  className={`text-2xl font-bold ${
                    selectedData.change > 0
                      ? 'text-green-600'
                      : selectedData.change < 0
                        ? 'text-red-600'
                        : 'text-gray-600'
                  }`}
                >
                  {selectedData.change > 0 ? '+' : ''}
                  {selectedData.change}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">PERCENT CHANGE</p>
                <p
                  className={`text-2xl font-bold ${
                    selectedData.changePercent > 0
                      ? 'text-green-600'
                      : selectedData.changePercent < 0
                        ? 'text-red-600'
                        : 'text-gray-600'
                  }`}
                >
                  {selectedData.changePercent > 0 ? '+' : ''}
                  {selectedData.changePercent}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">FORECAST</p>
                <p className="text-2xl font-bold text-blue-600">{selectedData.forecast}</p>
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">12-Month Trend</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={selectedData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="previous"
                  fill="#fecaca"
                  stroke="#ef4444"
                  name="Last Cycle (Baseline)"
                  opacity={0.3}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#a78bfa"
                  strokeWidth={3}
                  name="Current Cycle"
                  dot={{ fill: '#a78bfa', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Forecast"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Trend Indicators */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Trend Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`p-4 rounded-lg border-2 ${
                  selectedData.trend === 'IMPROVING'
                    ? 'bg-green-50 border-green-300'
                    : selectedData.trend === 'DECLINING'
                      ? 'bg-red-50 border-red-300'
                      : 'bg-gray-50 border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-800 mb-2">Direction</p>
                <p
                  className={`text-2xl font-bold ${
                    selectedData.trend === 'IMPROVING'
                      ? 'text-green-600'
                      : selectedData.trend === 'DECLINING'
                        ? 'text-red-600'
                        : 'text-gray-600'
                  }`}
                >
                  {selectedData.trend}
                </p>
              </div>

              <div className="p-4 rounded-lg border-2 border-blue-300 bg-blue-50">
                <p className="font-semibold text-gray-800 mb-2">Momentum</p>
                <p className="text-sm text-gray-600">
                  {selectedData.trend === 'IMPROVING' && (
                    'Positive trajectory. Maintain current initiatives.'
                  )}
                  {selectedData.trend === 'DECLINING' &&
                    'Downward trend. Intervention recommended.'}
                  {selectedData.trend === 'STABLE' && 'Stable performance. No major changes.'}
                </p>
              </div>

              <div className="p-4 rounded-lg border-2 border-purple-300 bg-purple-50">
                <p className="font-semibold text-gray-800 mb-2">Next Steps</p>
                <p className="text-sm text-gray-600">
                  {selectedData.trend === 'IMPROVING' &&
                    'Replicate success factors across other areas.'}
                  {selectedData.trend === 'DECLINING' && 'Schedule intervention planning session.'}
                  {selectedData.trend === 'STABLE' && 'Monitor for emerging changes.'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Dimension Grid Heat Map */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">All Dimensions: Change Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Dimension</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Previous</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Current</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Change</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Trend</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Forecast</th>
              </tr>
            </thead>
            <tbody>
              {trends.dimensions.map((dim) => (
                <tr
                  key={dim.dimensionId}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedDimension(dim.dimensionId)}
                >
                  <td className="py-3 px-3 font-medium text-gray-800">{dim.dimensionName}</td>
                  <td className="text-center py-3 px-3 text-gray-600">{dim.previousValue}</td>
                  <td className="text-center py-3 px-3 font-semibold text-gray-800">
                    {dim.currentValue}
                  </td>
                  <td
                    className={`text-center py-3 px-3 font-bold ${
                      dim.change > 0
                        ? 'text-green-600'
                        : dim.change < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {dim.change > 0 ? '+' : ''}
                    {dim.change} ({dim.changePercent > 0 ? '+' : ''}
                    {dim.changePercent}%)
                  </td>
                  <td className="text-center py-3 px-3">
                    {dim.trend === 'IMPROVING' && '📈'}
                    {dim.trend === 'DECLINING' && '📉'}
                    {dim.trend === 'STABLE' && '➡️'}
                  </td>
                  <td className="text-center py-3 px-3 text-blue-600 font-semibold">
                    {dim.forecast}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-indigo-800 mb-4">📊 Key Insights</h2>
        <ul className="space-y-2 text-sm text-indigo-700">
          <li>
            • <strong>Strongest:</strong>{' '}
            {trends.dimensions.length > 0
              ? trends.dimensions.sort((a, b) => b.currentValue - a.currentValue)[0]
                  .dimensionName
              : 'N/A'}{' '}
            ({trends.dimensions.length > 0
              ? trends.dimensions.sort((a, b) => b.currentValue - a.currentValue)[0]
                  .currentValue
              : 0}
            )
          </li>
          <li>
            • <strong>Needs Focus:</strong>{' '}
            {trends.dimensions.length > 0
              ? trends.dimensions.sort((a, b) => a.currentValue - b.currentValue)[0]
                  .dimensionName
              : 'N/A'}{' '}
            ({trends.dimensions.length > 0
              ? trends.dimensions.sort((a, b) => a.currentValue - b.currentValue)[0]
                  .currentValue
              : 0}
            )
          </li>
          <li>
            • <strong>Most Improved:</strong>{' '}
            {trends.dimensions.length > 0
              ? trends.dimensions.sort((a, b) => b.change - a.change)[0].dimensionName
              : 'N/A'}{' '}
            (+{trends.dimensions.length > 0
              ? trends.dimensions.sort((a, b) => b.change - a.change)[0].change
              : 0}
            )
          </li>
          <li>
            • <strong>Declining:</strong>{' '}
            {trends.dimensions.length > 0
              ? trends.dimensions.sort((a, b) => a.change - b.change)[0].dimensionName
              : 'N/A'}{' '}
            (
            {trends.dimensions.length > 0
              ? trends.dimensions.sort((a, b) => a.change - b.change)[0].change
              : 0}
            )
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TrendAnalysis;

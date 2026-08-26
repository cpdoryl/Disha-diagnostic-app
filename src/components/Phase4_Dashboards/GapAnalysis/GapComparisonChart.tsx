/**
 * Gap Comparison Chart
 * Phase 4: Days 8-9
 *
 * Recharts bar chart comparing gaps across dimensions
 */

import React, { useMemo } from 'react';
import {
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
import { GapAnalysisResult } from 'src/lib/phase4/useRealTimePhase3Data';

interface GapComparisonChartProps {
  gapAnalysis?: GapAnalysisResult;
}

const SEVERITY_COLORS = {
  CRITICAL: '#D32F2F',
  HIGH: '#F57C00',
  MEDIUM: '#FBC02D',
  LOW: '#388E3C',
};

export const GapComparisonChart: React.FC<GapComparisonChartProps> = ({
  gapAnalysis,
}) => {
  const chartData = useMemo(() => {
    if (!gapAnalysis?.gaps) return [];

    // Group gaps by dimension and calculate average
    const byDimension: Record<
      string,
      { dimensionId: string; dimensionName: string; gaps: number[] }
    > = {};

    for (const gap of gapAnalysis.gaps) {
      if (!byDimension[gap.dimensionId]) {
        byDimension[gap.dimensionId] = {
          dimensionId: gap.dimensionId,
          dimensionName: gap.dimensionName,
          gaps: [],
        };
      }
      byDimension[gap.dimensionId].gaps.push(gap.gapScore || 0);
    }

    // Calculate averages and determine severity
    return Object.values(byDimension)
      .map((item) => {
        const avgGap =
          item.gaps.length > 0
            ? item.gaps.reduce((a, b) => a + b, 0) / item.gaps.length
            : 0;

        let severity: keyof typeof SEVERITY_COLORS = 'LOW';
        if (avgGap >= 25) severity = 'CRITICAL';
        else if (avgGap >= 15) severity = 'HIGH';
        else if (avgGap >= 8) severity = 'MEDIUM';

        return {
          dimensionId: item.dimensionId,
          dimensionName: item.dimensionName.substring(0, 15), // Truncate for chart
          fullName: item.dimensionName,
          averageGap: Math.round(avgGap * 10) / 10,
          severity,
          gapCount: item.gaps.length,
        };
      })
      .sort((a, b) => b.averageGap - a.averageGap);
  }, [gapAnalysis]);

  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.fullName}</p>
          <p className="text-sm text-gray-600">Average Gap: {data.averageGap}</p>
          <p className="text-sm text-gray-600">Severity: {data.severity}</p>
          <p className="text-sm text-gray-600">Gaps Detected: {data.gapCount}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="dimensionId"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            domain={[0, 100]}
            label={{ value: 'Average Gap Score', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="averageGap" name="Gap Score" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Ranking Table */}
      <div className="bg-gray-50 rounded p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Dimension Gap Rankings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Rank</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Dimension</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Gap Score</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Severity</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Count</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item, idx) => (
                <tr key={item.dimensionId} className="border-b border-gray-100 hover:bg-white">
                  <td className="py-2 px-3 text-gray-600">#{idx + 1}</td>
                  <td className="py-2 px-3 font-medium text-gray-900">{item.dimensionId}</td>
                  <td className="py-2 px-3 text-center">
                    <span className="font-semibold text-lg">{item.averageGap}</span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold text-white"
                      style={{ backgroundColor: SEVERITY_COLORS[item.severity] }}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center text-gray-600">{item.gapCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GapComparisonChart;

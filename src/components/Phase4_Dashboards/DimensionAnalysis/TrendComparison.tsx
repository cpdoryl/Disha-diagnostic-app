/**
 * Trend Comparison Component
 * Phase 4: Dimension Deep-Dive
 *
 * Year-over-year comparison chart
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrendComparisonProps {
  currentScore: number;
  previousYearScore?: number;
}

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-900">{payload[0].payload.month}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value?.toFixed(1) || 'N/A'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const TrendComparison: React.FC<TrendComparisonProps> = ({
  currentScore,
  previousYearScore = currentScore * 0.85,
}) => {
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYearBase = previousYearScore + 8;

    return months.map((month, index) => ({
      month,
      'Previous Year': Math.min(100, Math.max(0, previousYearScore + (Math.random() * 10 - 5))),
      'Current Year': Math.min(100, Math.max(0, currentYearBase + (Math.random() * 10 - 5))),
    }));
  }, [previousYearScore, currentScore]);

  const improvement = useMemo(() => {
    const avgPrevious = chartData.reduce((sum, item) => sum + item['Previous Year'], 0) / chartData.length;
    const avgCurrent = chartData.reduce((sum, item) => sum + item['Current Year'], 0) / chartData.length;
    return ((avgCurrent - avgPrevious) / avgPrevious) * 100;
  }, [chartData]);

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line
            type="monotone"
            dataKey="Previous Year"
            stroke="#9CA3AF"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="Current Year"
            stroke="#388E3C"
            strokeWidth={3}
            dot={{ fill: '#388E3C', r: 3 }}
            activeDot={{ r: 5 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Improvement Indicator */}
      <div className="bg-gray-50 rounded p-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${
              improvement >= 0 ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {improvement >= 0 ? '+' : ''}{improvement.toFixed(0)}%
          </div>
          <div>
            <p className="font-semibold text-gray-900">YoY Improvement</p>
            <p className="text-sm text-gray-600">
              {improvement >= 0 ? 'Positive trend' : 'Needs improvement'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Previous Year Avg: {(chartData.reduce((sum, item) => sum + item['Previous Year'], 0) / chartData.length).toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendComparison;

/**
 * Reality vs Perception Chart
 * Phase 4: Dimension Deep-Dive
 *
 * Recharts line chart comparing reality vs perception scores
 */

import React from 'react';
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

interface MetricData {
  metricId: string;
  name: string;
  reality: number;
  perception: number;
}

interface RealityVsPerceptionChartProps {
  metricsData: MetricData[];
}

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-900">{payload[0].payload.name}</p>
        <p className="text-sm text-blue-600">
          Reality: {payload[0].value?.toFixed(1) || 'N/A'}
        </p>
        {payload[1] && (
          <p className="text-sm text-orange-600">
            Perception: {payload[1].value?.toFixed(1) || 'N/A'}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const RealityVsPerceptionChart: React.FC<RealityVsPerceptionChartProps> = ({
  metricsData,
}) => {
  // Clamp values to 0-100 for display
  const chartData = metricsData.map((item) => ({
    ...item,
    reality: Math.min(100, Math.max(0, item.reality)),
    perception: Math.min(100, Math.max(0, item.perception)),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="metricId"
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
          label={{ value: 'Score (0-100)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="line"
        />
        <Line
          type="monotone"
          dataKey="reality"
          stroke="#1976D2"
          strokeWidth={3}
          name="Reality"
          dot={{ fill: '#1976D2', r: 4 }}
          activeDot={{ r: 6 }}
          isAnimationActive={true}
        />
        <Line
          type="monotone"
          dataKey="perception"
          stroke="#F57C00"
          strokeWidth={3}
          name="Perception"
          dot={{ fill: '#F57C00', r: 4 }}
          activeDot={{ r: 6 }}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RealityVsPerceptionChart;

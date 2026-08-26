/**
 * Respondent Breakdown Component
 * Phase 4: Dimension Deep-Dive
 *
 * Pie chart showing respondent type distribution
 */

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface RespondentData {
  Teacher?: number;
  Parent?: number;
  Student?: number;
  Admin?: number;
  Other?: number;
}

interface RespondentBreakdownProps {
  respondentData?: RespondentData;
}

const COLORS = {
  Teacher: '#1976D2',
  Parent: '#F57C00',
  Student: '#388E3C',
  Admin: '#7B1FA2',
  Other: '#D32F2F',
};

export const RespondentBreakdown: React.FC<RespondentBreakdownProps> = ({
  respondentData,
}) => {
  const chartData = useMemo(() => {
    if (!respondentData) {
      return [
        { name: 'No data', value: 1 },
      ];
    }

    return Object.entries(respondentData)
      .filter(([_, count]) => count && count > 0)
      .map(([name, count]) => ({
        name,
        value: count,
      }));
  }, [respondentData]);

  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      const percentage = ((value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-2 rounded shadow border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-600">
            {value} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#999'} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Statistics */}
      <div className="bg-gray-50 rounded p-4">
        <p className="font-semibold text-gray-900 mb-2">Respondent Summary</p>
        <div className="space-y-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] || '#999' }}
                ></div>
                <span className="text-gray-700">{item.name}</span>
              </div>
              <span className="font-medium text-gray-900">
                {item.value} ({((item.value / total) * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-semibold text-gray-900">
          <span>Total</span>
          <span>{total}</span>
        </div>
      </div>
    </div>
  );
};

export default RespondentBreakdown;

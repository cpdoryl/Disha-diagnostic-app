/**
 * Gap Breakdown Chart
 * Phase 4: Dimension Deep-Dive
 *
 * Recharts bar chart showing gap severity breakdown
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
import { DimensionScore } from 'src/lib/phase4/useRealTimePhase3Data';

interface GapBreakdownChartProps {
  dimension: DimensionScore;
}

const SEVERITY_COLORS = {
  CRITICAL: '#DC2626',
  HIGH: '#F57C00',
  MEDIUM: '#FBC02D',
  LOW: '#388E3C',
};

export const GapBreakdownChart: React.FC<GapBreakdownChartProps> = ({
  dimension,
}) => {
  const chartData = useMemo(() => {
    return [
      {
        name: 'Gap Analysis',
        realityScore: dimension.realityScore,
        perceptionScore: dimension.perceptionScore,
        gap: dimension.gap,
      },
    ];
  }, [dimension]);

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
            cursor={{ fill: 'rgba(0,0,0,0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="realityScore" fill="#1976D2" name="Reality Score" radius={[8, 8, 0, 0]} />
          <Bar dataKey="perceptionScore" fill="#F57C00" name="Perception Score" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Gap Severity Indicator */}
      <div className="bg-gray-50 rounded p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: SEVERITY_COLORS[dimension.gapSeverity] }}
          >
            {dimension.gap.toFixed(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">Gap: {dimension.gap.toFixed(1)}</p>
            <p className="text-sm text-gray-600">
              Severity: <span className="font-medium">{dimension.gapSeverity}</span>
            </p>
            <p className="text-sm text-gray-600">
              Direction: {dimension.gapDirection === 'perception_higher'
                ? 'Perception > Reality'
                : 'Reality > Perception'}
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span>CRITICAL (gap ≥ 25)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span>HIGH (gap 15-24)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span>MEDIUM (gap 8-14)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>LOW (gap &lt; 8)</span>
        </div>
      </div>
    </div>
  );
};

export default GapBreakdownChart;

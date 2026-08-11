import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { TrendingUp, BarChart3, Target } from 'lucide-react';

interface DimensionData {
  name: string;
  subjective: number;
  objective: number;
  benchmark: number;
  gap: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

interface EnhancedDimensionRadarProps {
  dimensions: DimensionData[];
  title?: string;
  showLegend?: boolean;
  height?: number;
}

export function EnhancedDimensionRadar({
  dimensions,
  title = 'Dimension Analysis - 14D Framework',
  showLegend = true,
  height = 500,
}: EnhancedDimensionRadarProps) {
  // Prepare radar data with short names for better display
  const radarData = dimensions.map(dim => ({
    name: dim.name.length > 12 ? dim.name.substring(0, 10) + '.' : dim.name,
    fullName: dim.name,
    subjective: dim.subjective,
    objective: dim.objective,
    benchmark: dim.benchmark,
  }));

  // Calculate statistics
  const avgSubjective = Math.round(
    dimensions.reduce((sum, d) => sum + d.subjective, 0) / dimensions.length
  );
  const avgObjective = Math.round(
    dimensions.reduce((sum, d) => sum + d.objective, 0) / dimensions.length
  );
  const avgBenchmark = Math.round(
    dimensions.reduce((sum, d) => sum + d.benchmark, 0) / dimensions.length
  );

  // Count status distribution
  const statusCounts = {
    excellent: dimensions.filter(d => d.status === 'excellent').length,
    good: dimensions.filter(d => d.status === 'good').length,
    average: dimensions.filter(d => d.status === 'average').length,
    poor: dimensions.filter(d => d.status === 'poor').length,
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">Multi-dimensional performance analysis</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Avg Perception"
            value={avgSubjective}
            color="#3B82F6"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
          />
          <StatCard
            label="Avg Reality"
            value={avgObjective}
            color="#10B981"
            bgColor="bg-green-50"
            borderColor="border-green-200"
          />
          <StatCard
            label="Avg Benchmark"
            value={avgBenchmark}
            color="#F59E0B"
            bgColor="bg-amber-50"
            borderColor="border-amber-200"
          />
          <StatCard
            label="Total Dimensions"
            value={dimensions.length}
            color="#8B5CF6"
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
          />
        </div>
      </div>

      {/* Main Radar Chart */}
      <div className="mb-8 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparative Analysis</h3>
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart
            data={radarData}
            margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
          >
            <PolarGrid
              stroke="#e5e7eb"
              strokeDasharray="3 3"
              style={{ opacity: 0.5 }}
            />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 500 }}
              angle={90}
              orientation="outer"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              label={{ value: 'Score', angle: 90, position: 'insideBottomLeft', offset: -5 }}
            />
            <Radar
              name="Subjective (Perception)"
              dataKey="subjective"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.25}
              strokeWidth={2.5}
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Radar
              name="Objective (Reality)"
              dataKey="objective"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.15}
              strokeWidth={2.5}
              dot={{ fill: '#10B981', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Radar
              name="Benchmark"
              dataKey="benchmark"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#F59E0B', r: 3 }}
              activeDot={{ r: 5 }}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              formatter={(value: any) => `${Math.round(value)}/100`}
              labelFormatter={(label) => {
                const full = radarData.find(d => d.name === label)?.fullName;
                return full || label;
              }}
            />
            {showLegend && (
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                }}
                iconType="line"
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusBox label="Excellent" count={statusCounts.excellent} color="#059669" bg="bg-emerald-50" />
        <StatusBox label="Good" count={statusCounts.good} color="#0284C7" bg="bg-blue-50" />
        <StatusBox label="Average" count={statusCounts.average} color="#D97706" bg="bg-amber-50" />
        <StatusBox label="Poor" count={statusCounts.poor} color="#DC2626" bg="bg-red-50" />
      </div>
    </div>
  );
}

// Helper: Stat Card
function StatCard({
  label,
  value,
  color,
  bgColor,
  borderColor,
}: {
  label: string;
  value: number;
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-3`}>
      <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <div className="mt-2 w-full bg-gray-300 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full"
          style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// Helper: Status Box
function StatusBox({
  label,
  count,
  color,
  bg,
}: {
  label: string;
  count: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} border-2 rounded-lg p-4 text-center`} style={{ borderColor: color }}>
      <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>
        {count}
      </p>
      <p className="text-xs text-gray-600 mt-1">dimensions</p>
    </div>
  );
}

export default EnhancedDimensionRadar;

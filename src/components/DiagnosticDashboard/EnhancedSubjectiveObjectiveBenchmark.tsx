import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Minus } from 'lucide-react';

interface DimensionData {
  name: string;
  subjective: number;
  objective: number;
  benchmark: number;
  gap: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

interface EnhancedSOBProps {
  dimensions: DimensionData[];
  title?: string;
  height?: number;
}

export function EnhancedSubjectiveObjectiveBenchmark({
  dimensions,
  title = 'Subjective vs Objective vs Benchmark',
  height = 500,
}: EnhancedSOBProps) {
  const [sortBy, setSortBy] = useState<'name' | 'gap' | 'subjective'>('name');

  // Prepare chart data
  let chartData = dimensions.map(dim => ({
    name: dim.name,
    Subjective: dim.subjective,
    Objective: dim.objective,
    Benchmark: dim.benchmark,
    gap: Math.abs(dim.subjective - dim.objective),
    status: dim.status,
  }));

  // Sort based on selection
  if (sortBy === 'gap') {
    chartData.sort((a, b) => b.gap - a.gap);
  } else if (sortBy === 'subjective') {
    chartData.sort((a, b) => b.Subjective - a.Subjective);
  }

  // Get top 3 and bottom 3
  const top3 = [...chartData].sort((a, b) => b.Subjective - a.Subjective).slice(0, 3);
  const bottom3 = [...chartData].sort((a, b) => a.Subjective - b.Subjective).slice(0, 3);

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-200 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600">Comprehensive metric comparison across dimensions</p>
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSortBy('name')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              sortBy === 'name'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            By Name
          </button>
          <button
            onClick={() => setSortBy('gap')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              sortBy === 'gap'
                ? 'bg-orange-100 text-orange-700 border border-orange-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            By Gap (Largest First)
          </button>
          <button
            onClick={() => setSortBy('subjective')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              sortBy === 'subjective'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            By Perception (Highest First)
          </button>
        </div>
      </div>

      {/* Main Bar Chart */}
      <div className="mb-8 bg-gradient-to-br from-gray-50 to-cyan-50 rounded-xl p-6">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              label={{ value: 'Score (/100)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              formatter={(value: any) => `${Math.round(value)}/100`}
              labelStyle={{ color: '#111827' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="Subjective" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Objective" fill="#10B981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Benchmark" fill="#F59E0B" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Highlights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpRight className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Top 3 Performers</h3>
          </div>
          <div className="space-y-3">
            {top3.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <span className="font-bold text-green-600">{item.Subjective}/100</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Performers */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownLeft className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-bold text-gray-900">Needs Attention (Lowest 3)</h3>
          </div>
          <div className="space-y-3">
            {bottom3.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <span className="font-bold text-red-600">{item.Subjective}/100</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Footer */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricSummary
          label="Highest Perception"
          value={Math.max(...dimensions.map(d => d.subjective))}
          color="#10B981"
        />
        <MetricSummary
          label="Lowest Perception"
          value={Math.min(...dimensions.map(d => d.subjective))}
          color="#EF4444"
        />
        <MetricSummary
          label="Avg Gap"
          value={Math.round(dimensions.reduce((sum, d) => sum + Math.abs(d.gap), 0) / dimensions.length)}
          color="#F59E0B"
        />
        <MetricSummary
          label="Largest Gap"
          value={Math.max(...dimensions.map(d => Math.abs(d.gap)))}
          color="#DC2626"
        />
      </div>
    </div>
  );
}

// Helper: Metric Summary
function MetricSummary({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <div className="mt-2 h-1 rounded-full" style={{ backgroundColor: color, opacity: 0.3 }} />
    </div>
  );
}

export default EnhancedSubjectiveObjectiveBenchmark;

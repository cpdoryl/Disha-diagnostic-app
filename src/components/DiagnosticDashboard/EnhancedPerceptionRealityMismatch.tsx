import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ReferenceLine,
} from 'recharts';
import { AlertTriangle, CheckCircle, TrendingDown, Filter } from 'lucide-react';

interface DimensionData {
  name: string;
  subjective: number;
  objective: number;
  benchmark: number;
  gap: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

interface EnhancedMismatchProps {
  dimensions: DimensionData[];
  title?: string;
  height?: number;
}

export function EnhancedPerceptionRealityMismatch({
  dimensions,
  title = 'Perception-Reality Mismatch Analysis',
  height = 500,
}: EnhancedMismatchProps) {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'aligned'>('all');

  // Prepare gap data with categorization
  let gapData = dimensions.map(dim => {
    const gap = Math.abs(dim.subjective - dim.objective);
    const direction = dim.subjective > dim.objective ? 'optimistic' : dim.subjective < dim.objective ? 'pessimistic' : 'aligned';
    const severity = gap > 20 ? 'critical' : gap > 10 ? 'warning' : 'aligned';

    return {
      name: dim.name,
      subjective: dim.subjective,
      objective: dim.objective,
      gap,
      direction,
      severity,
      fullName: dim.name,
    };
  });

  // Filter based on severity
  if (filterSeverity !== 'all') {
    gapData = gapData.filter(item => item.severity === filterSeverity);
  }

  // Sort by gap (descending)
  gapData.sort((a, b) => b.gap - a.gap);

  // Calculate statistics
  const totalDimensions = dimensions.length;
  const criticalCount = dimensions.filter(d => Math.abs(d.gap) > 20).length;
  const warningCount = dimensions.filter(d => Math.abs(d.gap) > 10 && Math.abs(d.gap) <= 20).length;
  const alignedCount = dimensions.filter(d => Math.abs(d.gap) <= 10).length;
  const optimisticCount = dimensions.filter(d => d.subjective > d.objective).length;
  const pessimisticCount = dimensions.filter(d => d.subjective < d.objective).length;

  // Scatter data for correlation
  const scatterData = dimensions.map(dim => ({
    x: dim.objective,
    y: dim.subjective,
    name: dim.name,
    gap: Math.abs(dim.gap),
  }));

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#DC2626';
      case 'warning':
        return '#F97316';
      case 'aligned':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-200 rounded-xl flex items-center justify-center">
            <TrendingDown className="w-7 h-7 text-orange-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">Gap between stakeholder perception and reality</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <SummaryCard
          label="Total"
          value={totalDimensions}
          color="#6B7280"
          bgColor="bg-gray-50"
        />
        <SummaryCard
          label="Critical"
          value={criticalCount}
          color="#DC2626"
          bgColor="bg-red-50"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        <SummaryCard
          label="Warning"
          value={warningCount}
          color="#F97316"
          bgColor="bg-orange-50"
        />
        <SummaryCard
          label="Aligned"
          value={alignedCount}
          color="#10B981"
          bgColor="bg-green-50"
          icon={<CheckCircle className="w-4 h-4" />}
        />
        <SummaryCard
          label="Optimistic"
          value={optimisticCount}
          color="#3B82F6"
          bgColor="bg-blue-50"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2 mb-6 pb-6 border-b border-gray-200">
        <button
          onClick={() => setFilterSeverity('all')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
            filterSeverity === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({totalDimensions})
        </button>
        <button
          onClick={() => setFilterSeverity('critical')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
            filterSeverity === 'critical'
              ? 'bg-red-600 text-white'
              : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Critical ({criticalCount})
        </button>
        <button
          onClick={() => setFilterSeverity('warning')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
            filterSeverity === 'warning'
              ? 'bg-orange-600 text-white'
              : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
          }`}
        >
          Warning ({warningCount})
        </button>
        <button
          onClick={() => setFilterSeverity('aligned')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
            filterSeverity === 'aligned'
              ? 'bg-green-600 text-white'
              : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
          }`}
        >
          Aligned ({alignedCount})
        </button>
      </div>

      {/* Gap Distribution Chart */}
      <div className="mb-8 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gap Distribution</h3>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={gapData} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fecaca" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fill: '#6b7280', fontSize: 11 }}
            />
            <YAxis
              label={{ value: 'Gap Points', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #fecaca',
                borderRadius: '8px',
              }}
              formatter={(value: any) => `${Math.round(value)} points`}
              labelStyle={{ color: '#111827' }}
            />
            <Bar dataKey="gap" radius={[8, 8, 0, 0]}>
              {gapData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Mismatch Cards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analysis</h3>
        <div className="space-y-3">
          {gapData.map(item => {
            const severityConfig =
              item.severity === 'critical'
                ? {
                    bg: 'bg-red-50',
                    border: 'border-red-300',
                    label: 'CRITICAL',
                    color: '#DC2626',
                    icon: AlertTriangle,
                  }
                : item.severity === 'warning'
                ? {
                    bg: 'bg-orange-50',
                    border: 'border-orange-300',
                    label: 'WARNING',
                    color: '#F97316',
                    icon: AlertTriangle,
                  }
                : {
                    bg: 'bg-green-50',
                    border: 'border-green-300',
                    label: 'ALIGNED',
                    color: '#10B981',
                    icon: CheckCircle,
                  };

            const Icon = severityConfig.icon;
            const directionLabel = item.direction === 'optimistic' ? '📈 Overly Optimistic' : '📉 Too Pessimistic';

            return (
              <div
                key={item.name}
                className={`${severityConfig.bg} border-2 ${severityConfig.border} rounded-lg p-4`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" style={{ color: severityConfig.color }} />
                    <div>
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-600">{directionLabel}</p>
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: severityConfig.color }}
                  >
                    Gap: {item.gap.toFixed(1)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs font-medium mb-1">Perception</p>
                    <p className="text-xl font-bold text-blue-600">{item.subjective}</p>
                    <div className="mt-1 w-full bg-blue-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 bg-blue-600 rounded-full"
                        style={{ width: `${item.subjective}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs font-medium mb-1">Reality</p>
                    <p className="text-xl font-bold text-green-600">{item.objective}</p>
                    <div className="mt-1 w-full bg-green-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 bg-green-600 rounded-full"
                        style={{ width: `${item.objective}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs font-medium mb-1">Gap Impact</p>
                    <p className="text-xl font-bold" style={{ color: severityConfig.color }}>
                      {item.gap.toFixed(1)}
                    </p>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(item.gap, 30)}%`,
                          backgroundColor: severityConfig.color,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {item.severity === 'critical' && (
                  <div className="mt-3 p-3 bg-white rounded border-l-4" style={{ borderColor: severityConfig.color }}>
                    <p className="text-xs font-semibold text-gray-700">
                      ⚠️ Large discrepancy requires immediate investigation and intervention
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Helper: Summary Card
function SummaryCard({
  label,
  value,
  color,
  bgColor,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  bgColor: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={`${bgColor} border-2 rounded-lg p-3`} style={{ borderColor: color }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-600">{label}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default EnhancedPerceptionRealityMismatch;

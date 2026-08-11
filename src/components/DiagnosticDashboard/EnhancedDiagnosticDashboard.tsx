import React, { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Cell,
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  AlertCircle,
  CheckCircle2,
  Users,
  Target,
  Eye,
  Database,
  GitBranch,
  Layers,
} from 'lucide-react';

interface DimensionData {
  name: string;
  subjective: number;
  objective: number;
  benchmark: number;
  gap: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
  interpretation: string;
}

interface RespondentData {
  type: string;
  count: number;
  total: number;
  percentage: number;
}

interface EnhancedDashboardProps {
  dimensions: DimensionData[];
  respondents: RespondentData[];
  schoolName: string;
}

const COLOR_PALETTE = {
  dimensions: '#6366F1', // Indigo for dimension summary
  perception: '#3B82F6', // Blue for subjective
  reality: '#10B981', // Green for objective
  benchmark: '#F59E0B', // Amber for benchmark
  gap: {
    critical: '#EF4444', // Red for critical gaps
    warning: '#F97316', // Orange for warning gaps
    good: '#10B981', // Green for good alignment
  },
  respondents: '#8B5CF6', // Purple for respondents
  status: {
    excellent: '#059669',
    good: '#0284C7',
    average: '#D97706',
    poor: '#DC2626',
  },
};

const STATUS_CONFIG = {
  excellent: {
    label: 'Excellent',
    color: COLOR_PALETTE.status.excellent,
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    icon: CheckCircle2,
  },
  good: {
    label: 'Good',
    color: COLOR_PALETTE.status.good,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    icon: CheckCircle2,
  },
  average: {
    label: 'Average',
    color: COLOR_PALETTE.status.average,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    icon: AlertCircle,
  },
  poor: {
    label: 'Poor',
    color: COLOR_PALETTE.status.poor,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    icon: TrendingDown,
  },
};

export function EnhancedDiagnosticDashboard({
  dimensions,
  respondents,
  schoolName,
}: EnhancedDashboardProps) {
  const [selectedDimension, setSelectedDimension] = useState<DimensionData | null>(dimensions[0] || null);

  // Prepare radar chart data
  const radarData = dimensions.map(dim => ({
    name: dim.name.substring(0, 8),
    subjective: dim.subjective,
    objective: dim.objective,
    benchmark: dim.benchmark,
  }));

  // Calculate overall metrics
  const avgSubjective = Math.round(dimensions.reduce((sum, d) => sum + d.subjective, 0) / dimensions.length);
  const avgObjective = Math.round(dimensions.reduce((sum, d) => sum + d.objective, 0) / dimensions.length);
  const avgGap = Math.round(Math.abs(avgSubjective - avgObjective));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Diagnostic Analysis Dashboard</h1>
        <p className="text-gray-600">{schoolName}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="Avg Perception"
          value={avgSubjective}
          unit="/100"
          icon={Eye}
          bgGradient="from-blue-400 to-blue-600"
          color="#3B82F6"
        />
        <KPICard
          title="Avg Reality"
          value={avgObjective}
          unit="/100"
          icon={Database}
          bgGradient="from-green-400 to-green-600"
          color="#10B981"
        />
        <KPICard
          title="Overall Gap"
          value={avgGap}
          unit=" points"
          icon={GitBranch}
          bgGradient="from-orange-400 to-orange-600"
          color="#F97316"
        />
        <KPICard
          title="Total Respondents"
          value={respondents.reduce((sum, r) => sum + r.count, 0)}
          unit={`/${respondents.reduce((sum, r) => sum + r.total, 0)}`}
          icon={Users}
          bgGradient="from-purple-400 to-purple-600"
          color="#8B5CF6"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 1. Dimension Summary - Left */}
        <div className="lg:col-span-2">
          <DimensionSummarySection dimensions={dimensions} radarData={radarData} />
        </div>

        {/* 2. Respondents - Right */}
        <div>
          <RespondentsSection respondents={respondents} />
        </div>
      </div>

      {/* 3. Dimension Deep Dive - Full Width */}
      {selectedDimension && (
        <DimensionDeepDiveSection
          dimension={selectedDimension}
          onSelectDimension={setSelectedDimension}
          dimensions={dimensions}
        />
      )}

      {/* 4. Perception vs Reality Gap Analysis - Full Width */}
      <PerceptionVsRealitySection dimensions={dimensions} />
    </div>
  );
}

// KPI Card Component
function KPICard({
  title,
  value,
  unit,
  icon: Icon,
  bgGradient,
  color,
}: {
  title: string;
  value: number;
  unit: string;
  icon: React.ElementType;
  bgGradient: string;
  color: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-1">
            {value}<span className="text-lg opacity-75">{unit}</span>
          </p>
        </div>
        <Icon className="w-8 h-8 opacity-60" />
      </div>
    </div>
  );
}

// 1. Dimension Summary Section
function DimensionSummarySection({
  dimensions,
  radarData,
}: {
  dimensions: DimensionData[];
  radarData: any[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Layers className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dimension Summary</h2>
          <p className="text-sm text-gray-600">14-dimension diagnostic overview</p>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="mb-8">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
            <Radar name="Subjective" dataKey="subjective" stroke={COLOR_PALETTE.perception} fill={COLOR_PALETTE.perception} fillOpacity={0.25} />
            <Radar name="Objective" dataKey="objective" stroke={COLOR_PALETTE.reality} fill={COLOR_PALETTE.reality} fillOpacity={0.25} />
            <RechartsTooltip />
            <Legend wrapperStyle={{ paddingTop: 20 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const count = dimensions.filter(d => d.status === key).length;
          const Icon = config.icon;
          return (
            <div key={key} className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: config.color }} />
                <span className={`text-sm font-semibold ${config.textColor}`}>{config.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-600">dimensions</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 2. Dimension Deep Dive Section
function DimensionDeepDiveSection({
  dimension,
  onSelectDimension,
  dimensions,
}: {
  dimension: DimensionData;
  onSelectDimension: (dim: DimensionData) => void;
  dimensions: DimensionData[];
}) {
  const statusConfig = STATUS_CONFIG[dimension.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="mb-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dimension Deep Dive</h2>
            <p className="text-sm text-gray-600">{dimension.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Metrics */}
          <div className="space-y-6">
            {/* Status */}
            <div className={`${statusConfig.bgColor} border ${statusConfig.borderColor} rounded-xl p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <StatusIcon className="w-6 h-6" style={{ color: statusConfig.color }} />
                <span className={`text-lg font-bold ${statusConfig.textColor}`}>{statusConfig.label}</span>
              </div>
              <p className="text-gray-700">{dimension.interpretation}</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <MetricBox
                label="Subjective Score"
                value={dimension.subjective}
                color={COLOR_PALETTE.perception}
              />
              <MetricBox
                label="Objective Score"
                value={dimension.objective}
                color={COLOR_PALETTE.reality}
              />
              <MetricBox
                label="Benchmark"
                value={dimension.benchmark}
                color={COLOR_PALETTE.benchmark}
              />
              <MetricBox
                label="Gap"
                value={Math.abs(dimension.gap)}
                color={dimension.gap > 20 ? COLOR_PALETTE.gap.critical : dimension.gap > 10 ? COLOR_PALETTE.gap.warning : COLOR_PALETTE.gap.good}
              />
            </div>
          </div>

          {/* Right: Navigation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Dimensions</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {dimensions.map(dim => {
                const isSelected = dim.name === dimension.name;
                const dimStatusConfig = STATUS_CONFIG[dim.status];
                return (
                  <button
                    key={dim.name}
                    onClick={() => onSelectDimension(dim)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      isSelected
                        ? `${dimStatusConfig.bgColor} border-2 ${dimStatusConfig.borderColor}`
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{dim.name}</span>
                      <span className={`text-sm font-semibold ${dimStatusConfig.textColor}`}>
                        {dim.subjective}/100
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition"
                        style={{
                          width: `${dim.subjective}%`,
                          backgroundColor: dimStatusConfig.color,
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Perception vs Reality Gap Analysis
function PerceptionVsRealitySection({ dimensions }: { dimensions: DimensionData[] }) {
  const gapData = dimensions.map(dim => ({
    name: dim.name,
    subjective: dim.subjective,
    objective: dim.objective,
    gap: Math.abs(dim.gap),
  }));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <GitBranch className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Perception vs Reality Gap Analysis</h2>
          <p className="text-sm text-gray-600">Comparing stakeholder perception with operational data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={gapData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: '#6b7280', fontSize: 11 }}
              />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} domain={[0, 100]} />
              <Legend wrapperStyle={{ paddingTop: 20 }} />
              <RechartsTooltip />
              <Bar dataKey="subjective" fill={COLOR_PALETTE.perception} name="Perception" radius={[8, 8, 0, 0]} />
              <Bar dataKey="objective" fill={COLOR_PALETTE.reality} name="Reality" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gap Analysis Cards */}
        <div className="space-y-3">
          {gapData.map(item => {
            const gap = item.subjective - item.objective;
            const severity =
              Math.abs(gap) > 20
                ? { label: 'Critical', color: COLOR_PALETTE.gap.critical, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
                : Math.abs(gap) > 10
                ? { label: 'Warning', color: COLOR_PALETTE.gap.warning, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' }
                : { label: 'Aligned', color: COLOR_PALETTE.gap.good, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' };

            return (
              <div key={item.name} className={`${severity.bg} border ${severity.border} rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{item.name}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${severity.text}`}>{severity.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Perception</p>
                    <p className="font-bold text-gray-900">{item.subjective}/100</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Reality</p>
                    <p className="font-bold text-gray-900">{item.objective}/100</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Gap</p>
                    <p className="font-bold" style={{ color: severity.color }}>
                      {Math.abs(gap).toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 4. Respondents Section
function RespondentsSection({ respondents }: { respondents: RespondentData[] }) {
  const RESPONDENT_COLORS = {
    teacher: '#3B82F6',
    parent: '#10B981',
    student: '#8B5CF6',
    admin: '#F59E0B',
    other: '#6B7280',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Respondents</h2>
          <p className="text-sm text-gray-600">Stakeholder breakdown</p>
        </div>
      </div>

      {/* Donut-like display */}
      <div className="space-y-4">
        {respondents.map(r => {
          const color = RESPONDENT_COLORS[r.type as keyof typeof RESPONDENT_COLORS] || '#6B7280';
          return (
            <div key={r.type}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 capitalize">{r.type}s</span>
                <span className="text-sm font-bold text-gray-600">
                  {r.count}/{r.total} ({r.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${r.percentage}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Total Responses:</span> {respondents.reduce((sum, r) => sum + r.count, 0)} / {respondents.reduce((sum, r) => sum + r.total, 0)}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Overall completion rate: <span className="font-bold text-gray-900">
            {Math.round((respondents.reduce((sum, r) => sum + r.count, 0) / Math.max(respondents.reduce((sum, r) => sum + r.total, 0), 1)) * 100)}%
          </span>
        </p>
      </div>
    </div>
  );
}

// Metric Box Component
function MetricBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mb-1">/100</p>
      </div>
      <div className="mt-3 w-full bg-gray-300 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full"
          style={{
            width: `${value}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

export default EnhancedDiagnosticDashboard;

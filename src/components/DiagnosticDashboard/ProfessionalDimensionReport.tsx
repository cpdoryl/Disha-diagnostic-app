import React from 'react';
import { AlertCircle, CheckCircle, TrendingUp, TrendingDown, Zap, Target, BarChart3 } from 'lucide-react';

interface DimensionReportProps {
  dimensionName: string;
  icon?: React.ElementType;
  subjective: number;
  benchmark: number;
  objective: number;
  gap: number;
  status: 'excellent' | 'good' | 'adequate' | 'poor';
  perception: string; // e.g., "Overestimated by stakeholders"
  interpretation: string;
  rootCauses: string[];
  actionablePoints: string[];
  metrics?: Array<{ name: string; current: number; benchmark: number }>;
}

const statusConfig = {
  excellent: {
    label: 'Excellent',
    color: '#059669',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    icon: CheckCircle,
  },
  good: {
    label: 'Good',
    color: '#0284C7',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    icon: CheckCircle,
  },
  adequate: {
    label: 'Adequate',
    color: '#F59E0B',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    icon: AlertCircle,
  },
  poor: {
    label: 'Poor',
    color: '#DC2626',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
    icon: AlertCircle,
  },
};

const getGapSeverity = (gap: number) => {
  if (Math.abs(gap) > 20) return { label: 'Critical Gap', color: '#DC2626', bgColor: 'bg-red-50', badge: 'bg-red-100 text-red-700' };
  if (Math.abs(gap) > 10) return { label: 'Warning Gap', color: '#F97316', bgColor: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700' };
  return { label: 'Aligned', color: '#10B981', bgColor: 'bg-green-50', badge: 'bg-green-100 text-green-700' };
};

export function ProfessionalDimensionReport({
  dimensionName,
  icon: Icon,
  subjective,
  benchmark,
  objective,
  gap,
  status,
  perception,
  interpretation,
  rootCauses,
  actionablePoints,
  metrics,
}: DimensionReportProps) {
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;
  const gapSeverity = getGapSeverity(gap);

  return (
    <div className={`${statusInfo.bgColor} border-2 ${statusInfo.borderColor} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow`}>
      {/* Header with Dimension Name and Status Badge */}
      <div className="flex items-start justify-between mb-6 pb-6 border-b-2" style={{ borderColor: statusInfo.color }}>
        <div className="flex items-center gap-4 flex-1">
          {Icon && (
            <div className="p-3 rounded-xl" style={{ backgroundColor: statusInfo.color + '20' }}>
              <Icon className="w-8 h-8" style={{ color: statusInfo.color }} />
            </div>
          )}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{dimensionName}</h2>
            <p className="text-sm text-gray-600 mt-1">{interpretation.substring(0, 80)}...</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <div className={`${statusInfo.badgeBg} ${statusInfo.badgeText} px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2`}>
            <StatusIcon className="w-4 h-4" />
            {statusInfo.label}
          </div>
          <div className={`${gapSeverity.badge} px-4 py-2 rounded-full font-bold text-xs`}>
            Gap: {Math.abs(gap).toFixed(1)} pts
          </div>
        </div>
      </div>

      {/* Three Metric Cards - Subjective, Benchmark, Objective */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Subjective Score */}
        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-600">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Subjective (Survey)</p>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">Perception</span>
          </div>
          <p className="text-5xl font-bold text-blue-600 mb-2">{subjective}</p>
          <p className="text-xs text-gray-600">/100</p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${subjective}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">Stakeholder feedback score</p>
        </div>

        {/* Benchmark Score */}
        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-amber-600">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Benchmark</p>
            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-bold">Target</span>
          </div>
          <p className="text-5xl font-bold text-amber-600 mb-2">{benchmark}</p>
          <p className="text-xs text-gray-600">/100</p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-amber-600 transition-all duration-500"
              style={{ width: `${benchmark}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">Expected performance standard</p>
        </div>

        {/* Objective Score */}
        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-600">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Objective (Data)</p>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold">Reality</span>
          </div>
          <p className="text-5xl font-bold text-green-600 mb-2">{objective}</p>
          <p className="text-xs text-gray-600">/100</p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-green-600 transition-all duration-500"
              style={{ width: `${objective}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">Operational metrics score</p>
        </div>
      </div>

      {/* Gap Analysis Summary */}
      <div className={`${gapSeverity.bgColor} border-2 rounded-xl p-6 mb-8`} style={{ borderColor: gapSeverity.color }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {Math.abs(gap) > 0 ? (
              <TrendingDown className="w-6 h-6" style={{ color: gapSeverity.color }} />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
            <div>
              <h3 className="font-bold text-gray-900">Perception-Reality Analysis</h3>
              <p className="text-xs text-gray-600">{perception}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold" style={{ color: gapSeverity.color }}>
              {Math.abs(gap).toFixed(1)}
            </p>
            <p className="text-xs text-gray-600">points difference</p>
          </div>
        </div>

        <div className="bg-white/60 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Gap Interpretation:</strong> {subjective > objective ? 'Stakeholders are overly optimistic about this dimension' : subjective < objective ? 'Stakeholders perceive this area as weaker than it actually is' : 'Stakeholder perceptions align perfectly with operational reality'}. This indicates a {Math.abs(gap) > 15 ? 'significant' : 'moderate'} {subjective > objective ? 'communication' : 'perception'} gap that should be addressed.
          </p>
        </div>
      </div>

      {/* Interpretation Section */}
      <div className="bg-white rounded-xl p-6 mb-8 border-l-4" style={{ borderColor: statusInfo.color }}>
        <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
          <Target className="w-5 h-5" style={{ color: statusInfo.color }} />
          Detailed Analysis
        </h3>
        <p className="text-gray-700 leading-relaxed text-sm">{interpretation}</p>
      </div>

      {/* Root Causes Section */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-8 border-l-4 border-red-500">
        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          Root Cause Analysis
        </h3>
        <div className="space-y-3">
          {rootCauses.map((cause, idx) => (
            <div key={idx} className="bg-white rounded-lg p-3 border-l-4 border-red-400">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-red-600">•</span> {cause}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Points Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-600">
        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Actionable Recommendations
        </h3>
        <div className="space-y-3">
          {actionablePoints.map((point, idx) => (
            <div key={idx} className="bg-white rounded-lg p-3 border-l-4 border-blue-400 hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-blue-600 text-lg">→</span> {point}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Details (if provided) */}
      {metrics && metrics.length > 0 && (
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" style={{ color: statusInfo.color }} />
            Detailed Metrics Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric, idx) => (
              <div key={idx} className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">{metric.name}</p>
                  <span className="text-xs font-bold px-2 py-1 bg-white rounded text-gray-700">{metric.current} vs {metric.benchmark}</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Current</p>
                    <div className="w-full bg-white rounded h-2">
                      <div
                        className="h-2 rounded bg-blue-600"
                        style={{ width: `${Math.min((metric.current / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Benchmark</p>
                    <div className="w-full bg-white rounded h-2">
                      <div
                        className="h-2 rounded bg-amber-600"
                        style={{ width: `${Math.min((metric.benchmark / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfessionalDimensionReport;

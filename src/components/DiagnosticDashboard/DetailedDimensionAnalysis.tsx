import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Target, TrendingDown } from 'lucide-react';

interface Dimension {
  dimensionName: string;
  subjectiveScore: number;
  objectiveScore: number;
  benchmarkScore: number;
  avgScore: number;
  status: 'excellent' | 'good' | 'adequate' | 'poor';
  gapAnalysis: string;
  rootCauses: string[];
  actionablePoints: string[];
  interpretation: string;
}

interface DetailedDimensionAnalysisProps {
  dimensions: Dimension[];
  schoolName: string;
}

const statusColors = {
  excellent: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-900', badge: 'bg-green-100 text-green-800' },
  good: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-800' },
  adequate: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-900', badge: 'bg-amber-100 text-amber-800' },
  poor: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-900', badge: 'bg-red-100 text-red-800' },
};

const statusLabels = {
  excellent: '⭐ EXCELLENT',
  good: '✓ GOOD',
  adequate: '⚠ ADEQUATE',
  poor: '🔴 POOR',
};

export function DetailedDimensionAnalysis({ dimensions, schoolName }: DetailedDimensionAnalysisProps) {
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set([dimensions[0]?.dimensionName]));

  const toggleDimension = (dimensionName: string) => {
    const newExpanded = new Set(expandedDimensions);
    if (newExpanded.has(dimensionName)) {
      newExpanded.delete(dimensionName);
    } else {
      newExpanded.add(dimensionName);
    }
    setExpandedDimensions(newExpanded);
  };

  const getGapSeverity = (subjective: number, objective: number) => {
    const gap = Math.abs(subjective - objective);
    if (gap > 10) return { severity: 'CRITICAL', color: 'text-red-600', bg: 'bg-red-50' };
    if (gap > 5) return { severity: 'HIGH', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { severity: 'LOW', color: 'text-green-600', bg: 'bg-green-50' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">14-Dimension Deep Dive Analysis</h2>
        <p className="text-slate-200">
          Comprehensive point-by-point analysis for {schoolName} with gaps, root causes, and actionable recommendations for each dimension.
        </p>
      </div>

      {/* Dimensions List */}
      <div className="space-y-4">
        {dimensions.map((dim, idx) => {
          const isExpanded = expandedDimensions.has(dim.dimensionName);
          const colors = statusColors[dim.status];
          const gap = getGapSeverity(dim.subjectiveScore, dim.objectiveScore);

          return (
            <div
              key={idx}
              className={`border-2 rounded-2xl transition-all ${colors.border} ${colors.bg}`}
            >
              {/* Header - Click to expand */}
              <button
                onClick={() => toggleDimension(dim.dimensionName)}
                className="w-full text-left p-6 flex items-start justify-between hover:bg-black/5 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className={`text-xl font-bold ${colors.text}`}>{dim.dimensionName}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${colors.badge}`}>
                      {statusLabels[dim.status]}
                    </span>
                  </div>

                  {/* Quick Stats Row */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <p className={`text-xs font-bold ${colors.text} opacity-70`}>AVERAGE SCORE</p>
                      <p className={`text-2xl font-bold ${colors.text}`}>{dim.avgScore.toFixed(1)}/100</p>
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${colors.text} opacity-70`}>SCORES</p>
                      <p className={`text-sm ${colors.text}`}>
                        Subj: {dim.subjectiveScore} | Obj: {dim.objectiveScore} | Bench: {dim.benchmarkScore}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${colors.text} opacity-70`}>PERCEPTION GAP</p>
                      <p className={`text-sm font-bold ${gap.color}`}>
                        {gap.severity} ({Math.abs(dim.subjectiveScore - dim.objectiveScore)}% gap)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expand Icon */}
                <div className={`flex-shrink-0 ml-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  {isExpanded ? (
                    <ChevronUp className={`w-6 h-6 ${colors.text}`} />
                  ) : (
                    <ChevronDown className={`w-6 h-6 ${colors.text}`} />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className={`border-t-2 ${colors.border} p-6 space-y-6`}>
                  {/* Interpretation */}
                  <div>
                    <h4 className={`text-lg font-bold ${colors.text} mb-3 flex items-center gap-2`}>
                      <TrendingDown className="w-5 h-5" />
                      Analysis & Interpretation
                    </h4>
                    <div className={`${colors.bg} p-4 rounded-xl border ${colors.border}`}>
                      <p className={`${colors.text} leading-relaxed`}>{dim.interpretation}</p>
                    </div>
                  </div>

                  {/* Gap Analysis */}
                  <div className={`${gap.bg} p-4 rounded-xl border-2 ${gap.color.replace('text-', 'border-')}`}>
                    <h4 className={`font-bold ${gap.color} mb-2 flex items-center gap-2`}>
                      <AlertTriangle className="w-5 h-5" />
                      Perception-Reality Gap: {gap.severity}
                    </h4>
                    <p className={`${gap.color} text-sm`}>
                      {dim.gapAnalysis}
                      <br />
                      <span className="font-semibold">
                        Subjective Score ({dim.subjectiveScore}) vs Objective Score ({dim.objectiveScore}) = {Math.abs(dim.subjectiveScore - dim.objectiveScore)}% gap
                      </span>
                    </p>
                  </div>

                  {/* Root Causes */}
                  <div>
                    <h4 className={`text-lg font-bold ${colors.text} mb-3 flex items-center gap-2`}>
                      <AlertTriangle className="w-5 h-5" />
                      Root Causes & Contributing Factors
                    </h4>
                    <div className="space-y-2">
                      {dim.rootCauses.map((cause, causeIdx) => (
                        <div
                          key={causeIdx}
                          className={`flex items-start gap-3 p-3 rounded-lg ${colors.bg} border ${colors.border}`}
                        >
                          <span className={`text-lg font-bold ${colors.text} mt-0.5`}>•</span>
                          <p className={`${colors.text} flex-1`}>{cause}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actionable Recommendations */}
                  <div>
                    <h4 className={`text-lg font-bold ${colors.text} mb-3 flex items-center gap-2`}>
                      <CheckCircle className="w-5 h-5" />
                      Recommended Actions & Improvements
                    </h4>
                    <div className="space-y-2">
                      {dim.actionablePoints.map((point, pointIdx) => (
                        <div
                          key={pointIdx}
                          className={`flex items-start gap-3 p-3 rounded-lg bg-white border-2 border-green-200`}
                        >
                          <Target className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-800 flex-1 font-medium">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benchmark Comparison */}
                  <div>
                    <h4 className={`text-lg font-bold ${colors.text} mb-3`}>Score Comparison</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-300">
                        <p className="text-xs font-bold text-blue-600 mb-2">SUBJECTIVE (Perception)</p>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-bold text-blue-600">{dim.subjectiveScore}</span>
                          <span className="text-sm text-blue-600 mb-1">/100</span>
                        </div>
                        <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${dim.subjectiveScore}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-green-50 border-2 border-green-300">
                        <p className="text-xs font-bold text-green-600 mb-2">OBJECTIVE (Data)</p>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-bold text-green-600">{dim.objectiveScore}</span>
                          <span className="text-sm text-green-600 mb-1">/100</span>
                        </div>
                        <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${dim.objectiveScore}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300">
                        <p className="text-xs font-bold text-amber-600 mb-2">BENCHMARK (Target)</p>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-bold text-amber-600">{dim.benchmarkScore}</span>
                          <span className="text-sm text-amber-600 mb-1">/100</span>
                        </div>
                        <div className="mt-2 w-full bg-amber-200 rounded-full h-2">
                          <div
                            className="bg-amber-600 h-2 rounded-full transition-all"
                            style={{ width: `${dim.benchmarkScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className={`p-4 rounded-xl ${colors.bg} border-2 ${colors.border}`}>
                    <p className={`text-sm font-semibold ${colors.text}`}>
                      <span className="font-bold">Current Status:</span> {statusLabels[dim.status]} -
                      {dim.status === 'excellent' && ' Exceeding benchmarks. Maintain current practices and share as best practices.'}
                      {dim.status === 'good' && ' Performing well. Continue momentum and explore enhancement opportunities.'}
                      {dim.status === 'adequate' && ' Meeting baseline standards. Focused improvement initiatives needed.'}
                      {dim.status === 'poor' && ' Below benchmarks. Urgent strategic intervention required.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-8 text-white shadow-lg">
        <h3 className="text-2xl font-bold mb-4">Summary & Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-blue-200 text-sm font-bold mb-2">DIMENSIONS ANALYZED</p>
            <p className="text-3xl font-bold">{dimensions.length}</p>
            <p className="text-sm text-blue-300 mt-1">Complete 14-Dimension Framework</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm font-bold mb-2">AVERAGE HEALTH INDEX</p>
            <p className="text-3xl font-bold">{(dimensions.reduce((sum, d) => sum + d.avgScore, 0) / dimensions.length).toFixed(1)}</p>
            <p className="text-sm text-blue-300 mt-1">Overall Institutional Health</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm font-bold mb-2">ACTION ITEMS</p>
            <p className="text-3xl font-bold">{dimensions.reduce((sum, d) => sum + d.actionablePoints.length, 0)}</p>
            <p className="text-sm text-blue-300 mt-1">Recommended Improvements</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-blue-700">
          <p className="text-sm text-blue-100">
            <span className="font-bold">Recommended Next Steps:</span> Expand each dimension above to review detailed analysis. Prioritize actions based on gap severity and expected impact. Download the comprehensive PDF report for formal documentation and stakeholder presentation.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DetailedDimensionAnalysis;

import React, { useState } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
  LineChart, Line, ReferenceLine, ComposedChart
} from 'recharts';
import { ChevronDown, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { FullDiagnosticReportData, DimensionReportCard } from '../../lib/fullDiagnosticReport';

interface ComprehensiveDiagnosticDashboardProps {
  report: FullDiagnosticReportData;
}

const STATUS_COLORS: Record<string, string> = {
  'Strong': '#16a34a',
  'Adequate': '#3b82f6',
  'Needs Attention': '#f59e0b',
  'At Risk': '#dc2626'
};

const GAP_COLORS: Record<string, string> = {
  'alignment': '#10b981',
  'overestimation': '#f59e0b',
  'underestimation': '#3b82f6'
};

export function ComprehensiveDiagnosticDashboard({ report }: ComprehensiveDiagnosticDashboardProps) {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  // Prepare radar chart data (all 14 dimensions)
  const radarData = report.dimensionCards.map((card) => ({
    name: card.dimensionName.split('&')[0].trim().slice(0, 12),
    score: card.subjective.index || 0,
    benchmark: card.benchmark,
    fullName: card.dimensionName
  }));

  // Prepare comparison bar data
  const comparisonData = report.dimensionCards.map((card) => ({
    name: card.dimensionName.split('&')[0].trim().slice(0, 15),
    Subjective: card.subjective.index || 0,
    Benchmark: card.benchmark,
    Objective: card.objective?.objectiveScore || 0,
    fullName: card.dimensionName
  }));

  // Prepare gap analysis data
  const gapData = report.dimensionCards
    .filter((c) => c.gap)
    .map((c) => ({
      name: c.dimensionName.split('&')[0].trim().slice(0, 15),
      gap: c.gap?.magnitude || 0,
      type: c.gap?.interpretation || 'alignment',
      fullName: c.dimensionName
    }));

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-2">{report.schoolName}</h2>
        <p className="text-indigo-100">14-Dimension Comprehensive Diagnostic Assessment</p>
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 rounded p-3">
            <p className="text-xs opacity-90">Overall Health Index</p>
            <p className="text-2xl font-bold">{report.subjective.overallIndex}</p>
          </div>
          <div className="bg-white/20 rounded p-3">
            <p className="text-xs opacity-90">Assessment Date</p>
            <p className="text-sm font-semibold">{new Date(report.generatedAt).toLocaleDateString()}</p>
          </div>
          <div className="bg-white/20 rounded p-3">
            <p className="text-xs opacity-90">Total Responses</p>
            <p className="text-2xl font-bold">{report.subjective.totalResponses}</p>
          </div>
          <div className="bg-white/20 rounded p-3">
            <p className="text-xs opacity-90">Dimensions Assessed</p>
            <p className="text-2xl font-bold">{report.dimensionCards.length}</p>
          </div>
        </div>
      </div>

      {/* Section 1: Radar Chart - All 14 Dimensions Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          14-Dimension Performance Profile
        </h3>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="School Score" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
              <Radar name="Benchmark" dataKey="benchmark" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          📊 <strong>Radar Chart:</strong> Compare all 14 dimensions against benchmarks. Blue area shows school performance,
          amber shows benchmark targets. Wider blue area = stronger performance.
        </p>
      </div>

      {/* Section 2: Comparison Bar Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Subjective vs Objective vs Benchmark Comparison
        </h3>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Subjective" fill="#3b82f6" />
              <Bar dataKey="Benchmark" fill="#f59e0b" />
              <Bar dataKey="Objective" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          📊 <strong>Comparison Chart:</strong> Blue = Stakeholder perception, Amber = Benchmark target, Green = Objective data.
          Shows alignment between perception, targets, and actual operational data.
        </p>
      </div>

      {/* Section 3: Gap Analysis */}
      {gapData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            Perception-Reality Gap Analysis
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={gapData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[-30, 30]} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <ReferenceLine x={0} stroke="#666" />
                <Bar dataKey="gap" fill="#6b7280">
                  {gapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GAP_COLORS[entry.type] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            📊 <strong>Gap Chart:</strong> Positive = Overestimation (Stakeholders optimistic), Negative = Underestimation
            (Stakeholders undervaluing). Green = Aligned.
          </p>
        </div>
      )}

      {/* Section 4: Point-by-Point Detailed Analysis for Each Dimension */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-indigo-600" />
          Point-by-Point Analysis - All 14 Dimensions
        </h3>

        {report.dimensionCards.map((card) => (
          <div key={card.dimensionId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Dimension Header */}
            <button
              onClick={() => setExpandedDimension(expandedDimension === card.dimensionId ? null : card.dimensionId)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[card.subjective.status.label] || '#6b7280' }}
                />
                <div className="text-left">
                  <h4 className="font-semibold text-lg">{card.dimensionName}</h4>
                  <div className="flex gap-6 text-sm text-gray-600">
                    <span>Score: <strong>{card.subjective.index || 'N/A'}</strong></span>
                    <span>Benchmark: <strong>{card.benchmark}</strong></span>
                    <span>Status: <strong>{card.subjective.status.label}</strong></span>
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition ${expandedDimension === card.dimensionId ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Expanded Content */}
            {expandedDimension === card.dimensionId && (
              <div className="px-6 py-6 border-t border-gray-200 space-y-6 bg-gray-50">
                {/* Score Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded p-4">
                    <p className="text-xs text-blue-600 font-semibold uppercase">Subjective (Survey)</p>
                    <p className="text-3xl font-bold text-blue-900">{card.subjective.index || 'N/A'}</p>
                    <div className="w-full bg-gray-200 rounded h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded"
                        style={{ width: `${(card.subjective.index || 0) / 100 * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded p-4">
                    <p className="text-xs text-amber-600 font-semibold uppercase">Benchmark</p>
                    <p className="text-3xl font-bold text-amber-900">{card.benchmark}</p>
                    <div className="w-full bg-gray-200 rounded h-2 mt-2">
                      <div
                        className="bg-amber-600 h-2 rounded"
                        style={{ width: `${(card.benchmark / 100) * 100}%` }}
                      />
                    </div>
                  </div>

                  {card.objective && (
                    <div className="bg-green-50 border border-green-200 rounded p-4">
                      <p className="text-xs text-green-600 font-semibold uppercase">Objective (Data)</p>
                      <p className="text-3xl font-bold text-green-900">{card.objective.objectiveScore || 'N/A'}</p>
                      <div className="w-full bg-gray-200 rounded h-2 mt-2">
                        <div
                          className="bg-green-600 h-2 rounded"
                          style={{ width: `${(card.objective.objectiveScore / 100) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Detailed Analysis */}
                <div className="bg-white rounded border border-gray-200 p-4">
                  <h5 className="font-bold text-lg mb-3">📋 Detailed Analysis</h5>
                  <div className="space-y-2">
                    {card.detailedAnalysis.map((line, idx) => (
                      <p key={idx} className="text-sm text-gray-700 leading-relaxed">
                        • {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Gap Analysis */}
                {card.gap && (
                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Perception-Reality Analysis
                    </h5>
                    <div className="space-y-2">
                      {card.perceptionRealityAnalysis.map((line, idx) => (
                        <p key={idx} className="text-sm text-gray-700 leading-relaxed">
                          • {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Root Cause Analysis */}
                {card.rootCause.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Root Cause Analysis
                    </h5>
                    <div className="space-y-2">
                      {card.rootCause.map((line, idx) => (
                        <p key={idx} className="text-sm text-gray-700 leading-relaxed">
                          • {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actionable Recommendations */}
                {card.actionablePoints.length > 0 && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded p-4">
                    <h5 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Actionable Recommendations
                    </h5>
                    <div className="space-y-2">
                      {card.actionablePoints.map((point, idx) => (
                        <p key={idx} className="text-sm text-gray-700 leading-relaxed">
                          ✓ {point}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Response Details */}
                {card.subjective.responseCount > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm">
                    <p className="text-gray-600">
                      <strong>Responses:</strong> {card.subjective.responseCount} respondents |
                      <strong> Average Rating:</strong> {card.subjective.average?.toFixed(2)}/5 |
                      <strong> Gap from Benchmark:</strong> {card.deltaFromBenchmark?.toFixed(1)} points
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
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
} from 'recharts';
import { ArrowLeft, Download, RefreshCw, AlertCircle, Database, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { getHealthStatus } from '../../lib/dimensionScoring';
import { assembleFullDiagnosticReport, FullDiagnosticReportData, DimensionReportCard } from '../../lib/fullDiagnosticReport';
import { generateDiagnosticReportPdf } from '../../lib/diagnosticReportPdf';

interface DiagnosticReportProps {
  assessmentId: string;
  eventName: string;
  schoolName: string;
  onBack: () => void;
}

const STAKEHOLDER_LABELS: Record<string, string> = {
  teacher: 'Teachers',
  parent: 'Parents/Guardians',
  student: 'Students',
  admin: 'Admin Staff',
  other: 'Other',
};

const GAP_BADGE: Record<string, { label: string; className: string; Icon: React.ElementType }> = {
  overestimation: { label: 'Overestimated by stakeholders', className: 'bg-amber-100 text-amber-700', Icon: TrendingUp },
  underestimation: { label: 'Underestimated by stakeholders', className: 'bg-blue-100 text-blue-700', Icon: TrendingDown },
  alignment: { label: 'Aligned with reality', className: 'bg-green-100 text-green-700', Icon: Minus },
};

function DimensionCard({ card }: { card: DimensionReportCard }) {
  const status = card.subjective.status;
  const gapBadge = card.gap ? GAP_BADGE[card.gap.interpretation] : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h4 className="font-semibold text-gray-800">{card.dimensionName}</h4>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${status.className}`}>
            {status.label}
          </span>
          {gapBadge && (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${gapBadge.className}`}>
              <gapBadge.Icon className="w-3 h-3" />
              {gapBadge.label}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-gray-500 text-xs">Subjective (survey)</p>
          <p className="font-semibold text-gray-800">{card.subjective.index ?? 'N/A'}/100</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Benchmark</p>
          <p className="font-semibold text-gray-800">{card.benchmark}/100</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Objective (operational data)</p>
          <p className="font-semibold text-gray-800">
            {card.objective ? `${card.objective.objectiveScore}/100` : 'No data yet'}
          </p>
        </div>
      </div>

      {card.gap && (
        <p className="text-xs text-gray-500">
          Gap: {card.gap.gap > 0 ? '+' : ''}
          {card.gap.gap.toFixed(1)} points (perceived {card.gap.subjectiveScore} vs. data {card.gap.objectiveScore})
        </p>
      )}

      <p className="text-sm text-gray-600 leading-relaxed">{card.interpretation}</p>

      {card.rootCause.length > 0 && (
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-700 mb-1">Root Cause</p>
          <ul className="space-y-1">
            {card.rootCause.map((line, idx) => (
              <li key={idx} className="text-xs text-gray-600 leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}

      {card.actionablePoints.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-indigo-800 mb-1">Actionable Points</p>
          <ul className="space-y-1 list-disc list-inside">
            {card.actionablePoints.map((line, idx) => (
              <li key={idx} className="text-xs text-indigo-700 leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function DiagnosticReport({ assessmentId, eventName, schoolName, onBack }: DiagnosticReportProps) {
  const [report, setReport] = useState<FullDiagnosticReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');
    assembleFullDiagnosticReport(assessmentId, schoolName, eventName)
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((err) => {
        console.error('Failed to compute diagnostic report:', err);
        if (!cancelled) setError('Could not generate the report. Please check your connection and try again.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [assessmentId, schoolName, eventName]);

  const handleDownloadPDF = () => {
    if (!report) return;
    const doc = generateDiagnosticReportPdf(report);
    const safeSchool = schoolName.replace(/[^a-z0-9]+/gi, '-');
    const safeEvent = eventName.replace(/[^a-z0-9]+/gi, '-');
    doc.save(`14D-Diagnostic-Report-${safeSchool}-${safeEvent}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" />
        Generating diagnostic report...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-900">{error || 'No report data available.'}</p>
          <button onClick={onBack} className="mt-3 text-sm font-medium text-red-700 hover:text-red-900">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const subjective = report.subjective;
  const overallStatus = getHealthStatus(subjective.overallIndex);
  const hasAnyObjectiveData = report.objectiveCompleteness.dimensionsWithAnyData > 0;
  const radarData = report.dimensionCards.map((card) => ({
    dimension: card.dimensionName,
    Subjective: card.subjective.index ?? 0,
    Objective: card.objective?.objectiveScore ?? 0,
  }));
  const comparisonBarData = report.dimensionCards.map((card) => ({
    name: card.dimensionName,
    Subjective: card.subjective.index ?? 0,
    Objective: card.objective?.objectiveScore ?? 0,
    Benchmark: card.benchmark,
  }));
  const gapBarData = report.dimensionCards
    .filter((card) => card.gap)
    .map((card) => ({
      name: card.dimensionName,
      gap: card.gap!.gap,
      color: card.gap!.interpretation === 'overestimation' ? '#d97706' : card.gap!.interpretation === 'underestimation' ? '#2563eb' : '#16a34a',
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Summary
        </button>
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {/* Overall Score */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-600 mb-2">Overall Institutional Health Index</p>
        <p className="text-6xl font-bold text-indigo-600">{subjective.overallIndex ?? 'N/A'}</p>
        <p className="text-gray-500 mb-3">out of 100</p>
        <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${overallStatus.className}`}>
          {overallStatus.label}
        </span>
        <p className="text-sm text-gray-500 mt-4">
          Based on {subjective.totalResponses} response{subjective.totalResponses === 1 ? '' : 's'} across 14 dimensions
        </p>
      </div>

      {/* Executive Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Executive Summary</h3>
        <ul className="space-y-2">
          {report.executiveSummary.map((line, idx) => (
            <li key={idx} className="text-sm text-gray-700 leading-relaxed flex gap-2">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Benchmark Data Source disclosure */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-gray-800">Benchmark Data Source</p>
            <div>
              <p className="text-gray-700">
                <span className="font-medium">Survey benchmarks</span> ({report.benchmarkSources.subjective.version},
                updated {report.benchmarkSources.subjective.lastUpdated}):
              </p>
              <p className="text-gray-500 mt-0.5">{report.benchmarkSources.subjective.methodology}</p>
            </div>
            <div>
              <p className="text-gray-700">
                <span className="font-medium">Operational data benchmarks</span> ({report.benchmarkSources.objective.version},
                updated {report.benchmarkSources.objective.lastUpdated}):
              </p>
              <p className="text-gray-500 mt-0.5">{report.benchmarkSources.objective.methodology}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Objective Data Completeness callout */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-indigo-900">
              Objective Data Completeness: {report.objectiveCompleteness.overallCompleteness}%
            </p>
            <p className="text-sm text-indigo-700 mt-1">
              {report.objectiveCompleteness.dimensionsWithAnyData}/14 dimensions have operational data captured,{' '}
              {report.objectiveCompleteness.dimensionsFullyComplete}/14 fully complete. Capturing more lets the report
              compare stakeholder perception against actual school data.
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition text-sm whitespace-nowrap"
        >
          Capture Operational Data
        </button>
      </div>

      {/* Radar Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-1">Dimension Radar</h3>
        <p className="text-xs text-gray-400 mb-4">
          {hasAnyObjectiveData
            ? 'Subjective (survey) vs objective (operational data) score per dimension. Dimensions without captured operational data show as 0 on the objective series.'
            : 'Subjective survey score per dimension. Capture operational data to overlay an objective comparison.'}
        </p>
        <div style={{ width: '100%', height: 420 }}>
          <ResponsiveContainer>
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Subjective (Survey)" dataKey="Subjective" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.35} />
              {hasAnyObjectiveData && (
                <Radar name="Objective (Data)" dataKey="Objective" stroke="#0d9488" fill="#0d9488" fillOpacity={0.25} />
              )}
              <RechartsTooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Bar Chart: Subjective vs Objective vs Benchmark */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 overflow-x-auto">
        <h3 className="font-semibold text-gray-800 mb-1">Subjective vs Objective vs Benchmark</h3>
        <p className="text-xs text-gray-400 mb-4">
          Side-by-side comparison of what stakeholders perceive, what the operational data shows, and the sector
          benchmark, for every dimension.
        </p>
        <div style={{ width: '100%', height: 420, minWidth: 720 }}>
          <ResponsiveContainer>
            <BarChart data={comparisonBarData} margin={{ bottom: 90 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" interval={0} height={100} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="Subjective" fill="#4f46e5" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Objective" fill="#0d9488" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Benchmark" fill="#9ca3af" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gap / Mismatch Bar Chart */}
      {gapBarData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 overflow-x-auto">
          <h3 className="font-semibold text-gray-800 mb-1">Perception-Reality Mismatch by Dimension</h3>
          <p className="text-xs text-gray-400 mb-4">
            Positive bars (amber) mean stakeholders rate the dimension higher than the data supports; negative bars
            (blue) mean the data shows better performance than stakeholders perceive.
          </p>
          <div style={{ width: '100%', height: Math.max(280, gapBarData.length * 32), minWidth: 480 }}>
            <ResponsiveContainer>
              <BarChart data={gapBarData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={180} />
                <RechartsTooltip />
                <Bar dataKey="gap" radius={[0, 3, 3, 0]}>
                  {gapBarData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Dimension Summary Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 overflow-x-auto">
        <h3 className="font-semibold text-gray-800 mb-4">Dimension Summary</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 pr-4">Dimension</th>
              <th className="py-2 pr-4">Avg Score</th>
              <th className="py-2 pr-4">Index</th>
              <th className="py-2 pr-4">Benchmark</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Responses</th>
            </tr>
          </thead>
          <tbody>
            {report.dimensionCards.map((card) => (
              <tr key={card.dimensionId} className="border-b border-gray-100 last:border-0">
                <td className="py-2 pr-4 font-medium text-gray-800">{card.dimensionName}</td>
                <td className="py-2 pr-4 text-gray-700">
                  {card.subjective.average != null ? `${card.subjective.average.toFixed(2)}/5` : '—'}
                </td>
                <td className="py-2 pr-4 text-gray-700">{card.subjective.index ?? '—'}</td>
                <td className="py-2 pr-4 text-gray-500">{card.benchmark}</td>
                <td className="py-2 pr-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.subjective.status.className}`}>
                    {card.subjective.status.label}
                  </span>
                </td>
                <td className="py-2 text-gray-500">{card.subjective.responseCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dimension Deep-Dive */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Dimension Deep-Dive</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {report.dimensionCards.map((card) => (
            <DimensionCard key={card.dimensionId} card={card} />
          ))}
        </div>
      </div>

      {/* Perception vs Reality Gap Analysis */}
      {report.gapAnalysis && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Perception vs Reality Gap Analysis</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Aligned</p>
              <p className="text-2xl font-bold text-green-600">{report.gapAnalysis.summary.alignedDimensions.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Overestimated</p>
              <p className="text-2xl font-bold text-amber-600">{report.gapAnalysis.summary.overestimatedDimensions.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Underestimated</p>
              <p className="text-2xl font-bold text-blue-600">{report.gapAnalysis.summary.underestimatedDimensions.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Avg Gap</p>
              <p className="text-2xl font-bold text-gray-800">{report.gapAnalysis.summary.averageGap}</p>
            </div>
          </div>

          {report.gapAnalysis.insights.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Key Insights</p>
              <ul className="space-y-1.5">
                {report.gapAnalysis.insights.map((insight, idx) => (
                  <li key={idx} className="text-sm text-gray-600 leading-relaxed">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.gapAnalysis.recommendations.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Recommended Actions</p>
              <ul className="space-y-1.5">
                {report.gapAnalysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-600 leading-relaxed">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Respondent Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Respondents</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
          {Object.entries(subjective.responsesByStakeholder).map(([type, count]) => (
            <div key={type}>
              <p className="text-gray-500">{STAKEHOLDER_LABELS[type] || type}</p>
              <p className="text-2xl font-bold text-gray-800">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DiagnosticReport;

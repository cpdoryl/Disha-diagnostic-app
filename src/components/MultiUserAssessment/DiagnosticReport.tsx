import React, { useEffect, useRef, useState } from 'react';
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
  ReferenceLine,
  ReferenceArea,
  ZAxis,
} from 'recharts';
import { ArrowLeft, Download, RefreshCw, AlertCircle, Database, TrendingUp, TrendingDown, Minus, Info, Loader2 } from 'lucide-react';
import { getHealthStatus } from '../../lib/dimensionScoring';
import { assembleFullDiagnosticReport, FullDiagnosticReportData, DimensionReportCard } from '../../lib/fullDiagnosticReport';
import { generateDiagnosticReportPdf, ChartImage } from '../../lib/diagnosticReportPdf';
import { downloadDiagnosticReportCsv } from '../../lib/diagnosticReportCsv';
import { summarizeDataConfidence } from '../../lib/objectiveScoreEngine';
import { QUADRANT_DEFINITIONS, QUADRANT_DISPLAY_ORDER, QUADRANT_THRESHOLD, QuadrantId } from '../../lib/quadrantAnalysis';

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

const QUADRANT_COLORS: Record<QuadrantId, string> = {
  excellence: '#16a34a',
  hidden_potential: '#2563eb',
  blind_spot: '#d97706',
  crisis: '#dc2626',
};

const QUADRANT_BOX_CLASSNAMES: Record<QuadrantId, string> = {
  excellence: 'bg-green-50 border-green-200 text-green-800',
  hidden_potential: 'bg-blue-50 border-blue-200 text-blue-800',
  blind_spot: 'bg-amber-50 border-amber-200 text-amber-800',
  crisis: 'bg-red-50 border-red-200 text-red-800',
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

      {card.objective && (
        <p className="text-xs text-gray-400">{summarizeDataConfidence(card.objective.metrics)?.description}</p>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-700 mb-1">Detailed Analysis</p>
        <div className="space-y-1.5">
          {card.detailedAnalysis.map((line, idx) => (
            <p key={idx} className="text-sm text-gray-600 leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="bg-sky-50 border border-sky-100 rounded-lg p-3">
        <p className="text-xs font-semibold text-sky-800 mb-1">Perception vs Reality Analysis</p>
        <div className="space-y-1.5">
          {card.perceptionRealityAnalysis.map((line, idx) => (
            <p key={idx} className="text-xs text-sky-700 leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      </div>

      {card.rootCause.length > 0 && (
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-700 mb-1">Root Cause Analysis</p>
          <div className="space-y-1.5">
            {card.rootCause.map((line, idx) => (
              <p key={idx} className="text-xs text-gray-600 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      {card.actionablePoints.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-indigo-800 mb-1">Actionable Recommendations</p>
          <div className="space-y-1.5">
            {card.actionablePoints.map((line, idx) => (
              <p key={idx} className="text-xs text-indigo-700 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

async function captureChartImage(el: HTMLElement | null): Promise<ChartImage | null> {
  if (!el) return null;
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', logging: false });
  return { dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height };
}

export function DiagnosticReport({ assessmentId, eventName, schoolName, onBack }: DiagnosticReportProps) {
  const [report, setReport] = useState<FullDiagnosticReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const radarRef = useRef<HTMLDivElement>(null);
  const comparisonBarRef = useRef<HTMLDivElement>(null);
  const gapBarRef = useRef<HTMLDivElement>(null);
  const quadrantRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadPDF = async () => {
    if (!report || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfError('');
    try {
      const [radarChart, comparisonChart, gapChart, quadrantChart] = await Promise.all([
        captureChartImage(radarRef.current),
        captureChartImage(comparisonBarRef.current),
        captureChartImage(gapBarRef.current),
        captureChartImage(quadrantRef.current),
      ]);
      const doc = generateDiagnosticReportPdf(report, { radarChart, comparisonChart, gapChart, quadrantChart });
      const safeSchool = schoolName.replace(/[^a-z0-9]+/gi, '-');
      const safeEvent = eventName.replace(/[^a-z0-9]+/gi, '-');
      doc.save(`14D-Diagnostic-Report-${safeSchool}-${safeEvent}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setPdfError('Could not generate the PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!report) return;
    downloadDiagnosticReportCsv(report);
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
  const quadrantScatterData = QUADRANT_DISPLAY_ORDER.map((q) => ({
    quadrant: q,
    points: report.quadrantAnalysis.byQuadrant[q].map((e) => ({
      x: e.objectiveScore,
      y: e.subjectiveScore,
      name: e.dimensionName,
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Summary
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {pdfError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{pdfError}</p>
        </div>
      )}

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
        <div ref={radarRef} style={{ width: '100%', height: 420, backgroundColor: '#ffffff' }}>
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
        <div ref={comparisonBarRef} style={{ width: '100%', height: 420, minWidth: 720, backgroundColor: '#ffffff' }}>
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
          <div
            ref={gapBarRef}
            style={{ width: '100%', height: Math.max(280, gapBarData.length * 32), minWidth: 480, backgroundColor: '#ffffff' }}
          >
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

      {/* Perception-Reality Quadrant Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-1">Perception-Reality Quadrant Analysis</h3>
        <p className="text-xs text-gray-400 mb-4">
          Each dimension with both a survey score and captured operational data is plotted by objective score
          (horizontal axis) against subjective score (vertical axis). The dividing lines sit at {QUADRANT_THRESHOLD}/100
          on each axis - the same Adequate/Needs-Attention boundary used throughout this report - splitting the
          dimensions into four quadrants by where perception and reality actually stand, not just how close they are
          to each other.
        </p>

        {quadrantScatterData.every((g) => g.points.length === 0) ? (
          <p className="text-sm text-gray-500">{report.quadrantAnalysis.summary[0]}</p>
        ) : (
          <div ref={quadrantRef} style={{ width: '100%', height: 420, backgroundColor: '#ffffff' }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                {/* eslint-disable @typescript-eslint/no-explicit-any */}
                <ReferenceArea {...({ x1: QUADRANT_THRESHOLD, x2: 100, y1: QUADRANT_THRESHOLD, y2: 100, fill: '#16a34a', fillOpacity: 0.06 } as any)} />
                <ReferenceArea {...({ x1: 0, x2: QUADRANT_THRESHOLD, y1: QUADRANT_THRESHOLD, y2: 100, fill: '#d97706', fillOpacity: 0.06 } as any)} />
                <ReferenceArea {...({ x1: QUADRANT_THRESHOLD, x2: 100, y1: 0, y2: QUADRANT_THRESHOLD, fill: '#2563eb', fillOpacity: 0.06 } as any)} />
                <ReferenceArea {...({ x1: 0, x2: QUADRANT_THRESHOLD, y1: 0, y2: QUADRANT_THRESHOLD, fill: '#dc2626', fillOpacity: 0.06 } as any)} />
                {/* eslint-enable @typescript-eslint/no-explicit-any */}
                <ReferenceLine x={QUADRANT_THRESHOLD} stroke="#9ca3af" strokeDasharray="4 4" />
                <ReferenceLine y={QUADRANT_THRESHOLD} stroke="#9ca3af" strokeDasharray="4 4" />
                <XAxis type="number" dataKey="x" name="Objective (reality)" domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: 'Objective score (reality)', position: 'insideBottom', offset: -20, fontSize: 11 }} />
                <YAxis type="number" dataKey="y" name="Subjective (perception)" domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: 'Subjective score (perception)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <ZAxis range={[80, 80]} />
                <RechartsTooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const p = payload[0].payload as { x: number; y: number; name: string };
                    return (
                      <div className="bg-white border border-gray-200 rounded shadow-sm px-3 py-2 text-xs">
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        <p className="text-gray-500">Objective (reality): {p.x}/100</p>
                        <p className="text-gray-500">Subjective (perception): {p.y}/100</p>
                      </div>
                    );
                  }}
                />
                <Legend
                  payload={QUADRANT_DISPLAY_ORDER.map((q) => ({
                    value: QUADRANT_DEFINITIONS[q].label,
                    type: 'circle',
                    color: QUADRANT_COLORS[q],
                  }))}
                />
                {quadrantScatterData.map(
                  (g) => g.points.length > 0 && <Scatter key={g.quadrant} name={QUADRANT_DEFINITIONS[g.quadrant].label} data={g.points} fill={QUADRANT_COLORS[g.quadrant]} />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {QUADRANT_DISPLAY_ORDER.map((q) => {
            const def = QUADRANT_DEFINITIONS[q];
            const members = report.quadrantAnalysis.byQuadrant[q];
            return (
              <div key={q} className={`rounded-lg border p-3 ${QUADRANT_BOX_CLASSNAMES[q]}`}>
                <p className="text-xs font-semibold mb-0.5">
                  {def.label} ({members.length})
                </p>
                <p className="text-xs opacity-80 mb-1.5">{def.axisDescription}</p>
                <p className="text-xs leading-relaxed mb-1.5">{def.explanation}</p>
                {members.length > 0 && (
                  <p className="text-xs font-medium">
                    {members.map((m) => `${m.dimensionName} (${m.subjectiveScore} / ${m.objectiveScore})`).join(', ')}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {report.quadrantAnalysis.excludedCount > 0 && (
          <p className="text-xs text-gray-400 mt-3">
            {report.quadrantAnalysis.excludedCount} dimension{report.quadrantAnalysis.excludedCount === 1 ? '' : 's'} not
            shown above - missing a survey score, captured operational data, or both.
          </p>
        )}
      </div>

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
        <h3 className="font-semibold text-gray-800 mb-1">Dimension Deep-Dive</h3>
        <p className="text-xs text-gray-400 mb-4">
          All 14 dimensions, each with a detailed analysis, a perception-vs-reality analysis, a root cause analysis,
          and actionable recommendations - every claim below is tied to the specific numbers it's drawn from.
        </p>
        <div className="grid grid-cols-1 gap-4">
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

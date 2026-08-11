import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { ArrowLeft, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { computeDiagnosticReport, getHealthStatus, DiagnosticReportData } from '../../lib/dimensionScoring';

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

export function DiagnosticReport({ assessmentId, eventName, schoolName, onBack }: DiagnosticReportProps) {
  const [report, setReport] = useState<DiagnosticReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');
    computeDiagnosticReport(assessmentId)
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
  }, [assessmentId]);

  const handleDownloadPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    const marginX = 14;
    let y = 20;

    doc.setFontSize(18);
    doc.text('14D Diagnostic Report', marginX, y);
    y += 10;

    doc.setFontSize(11);
    doc.text(`School: ${schoolName}`, marginX, y);
    y += 6;
    doc.text(`Assessment Event: ${eventName}`, marginX, y);
    y += 6;
    doc.text(`Generated: ${report.generatedAt.toLocaleString()}`, marginX, y);
    y += 6;
    doc.text(`Total Responses: ${report.totalResponses}`, marginX, y);
    y += 6;

    const breakdown = Object.entries(report.responsesByStakeholder)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => `${STAKEHOLDER_LABELS[type] || type}: ${count}`)
      .join(', ');
    if (breakdown) {
      doc.text(breakdown, marginX, y);
      y += 10;
    } else {
      y += 4;
    }

    doc.setFontSize(14);
    doc.text(`Overall Institutional Health Index: ${report.overallIndex ?? 'N/A'}/100`, marginX, y);
    y += 10;

    doc.setFontSize(12);
    doc.text('Dimension Breakdown', marginX, y);
    y += 8;
    doc.setFontSize(10);

    for (const dim of report.dimensions) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      const status = getHealthStatus(dim.index);
      const scoreText =
        dim.average != null
          ? `${dim.average.toFixed(2)}/5  (Index ${dim.index}/100 - ${status.label})  [n=${dim.responseCount}]`
          : 'No responses recorded';
      doc.text(`${dim.dimensionName}:`, marginX, y);
      y += 5;
      doc.text(scoreText, marginX + 4, y);
      y += 7;
    }

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

  const overallStatus = getHealthStatus(report.overallIndex);
  const radarData = report.dimensions.map((dim) => ({
    dimension: dim.dimensionName,
    score: dim.index ?? 0,
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
        <p className="text-6xl font-bold text-indigo-600">{report.overallIndex ?? 'N/A'}</p>
        <p className="text-gray-500 mb-3">out of 100</p>
        <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${overallStatus.className}`}>
          {overallStatus.label}
        </span>
        <p className="text-sm text-gray-500 mt-4">
          Based on {report.totalResponses} response{report.totalResponses === 1 ? '' : 's'} across 14 dimensions
        </p>
      </div>

      {/* Radar Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Dimension Radar</h3>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Index Score" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
              <RechartsTooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dimension Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 overflow-x-auto">
        <h3 className="font-semibold text-gray-800 mb-4">Dimension Breakdown</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 pr-4">Dimension</th>
              <th className="py-2 pr-4">Avg Score</th>
              <th className="py-2 pr-4">Index</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Responses</th>
            </tr>
          </thead>
          <tbody>
            {report.dimensions.map((dim) => {
              const status = getHealthStatus(dim.index);
              return (
                <tr key={dim.dimensionId} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-800">{dim.dimensionName}</td>
                  <td className="py-2 pr-4 text-gray-700">{dim.average != null ? `${dim.average.toFixed(2)}/5` : '—'}</td>
                  <td className="py-2 pr-4 text-gray-700">{dim.index ?? '—'}</td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="py-2 text-gray-500">{dim.responseCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Respondent Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Respondents</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
          {Object.entries(report.responsesByStakeholder).map(([type, count]) => (
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

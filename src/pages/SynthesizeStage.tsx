import React, { useState } from 'react';
import { useAppStore } from '../store';
import {
  FileText,
  Download,
  Printer,
  Share2,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Zap,
  TrendingUp,
  Calendar,
  MapPin,
  Building2,
  ArrowLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

export const SynthesizeStage = () => {
  const { dimensions, gaps, activeSchool, setCurrentView } = useAppStore();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel'>('pdf');

  const averageScore = Math.round(dimensions.reduce((acc, curr) => acc + curr.score, 0) / dimensions.length);
  const criticalAreas = dimensions.filter(d => d.score < 60);
  const strongAreas = dimensions.filter(d => d.score >= 80);

  const handleGenerateReport = async () => {
    setIsGeneratingPDF(true);

    // Simulate PDF generation
    setTimeout(() => {
      setReportReady(true);
      setIsGeneratingPDF(false);
    }, 2000);
  };

  const handleDownloadPDF = () => {
    // In production, integrate with jsPDF or similar library
    alert('PDF Report: ' + (activeSchool?.name || 'School') + '_DISHA_Report_' + new Date().toISOString().split('T')[0] + '.pdf');
  };

  const handleDownloadExcel = () => {
    alert('Excel Report: ' + (activeSchool?.name || 'School') + '_DISHA_Data_' + new Date().toISOString().split('T')[0] + '.xlsx');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleShareReport = () => {
    const shareData = {
      title: 'DISHA Diagnostic Report',
      text: `${activeSchool?.name || 'School'} - Overall Health Score: ${averageScore}/100`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      alert('Share this link with stakeholders to view the report');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Stage 4: Synthesize & Report</h2>
          <p className="text-gray-500 mt-1">Generate comprehensive diagnostic report for school leadership & stakeholders</p>
        </div>
        {activeSchool && (
          <div className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl text-xs text-indigo-950 flex items-center gap-2 shrink-0">
            <span className="font-extrabold text-indigo-950">{activeSchool.name}</span>
            <span className="text-indigo-300">|</span>
            <span className="font-bold">{activeSchool.board}</span>
            <span className="text-indigo-300">|</span>
            <span className="text-indigo-700">{activeSchool.city}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Report Generation */}
        <div className="xl:col-span-2 space-y-6">
          {/* Executive Summary */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Executive Summary</h3>
                <p className="text-sm text-gray-600 mt-1">Consolidated findings across all 14 diagnostic dimensions</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 uppercase tracking-wider font-bold">Overall Health Score</p>
                <p className="text-4xl font-black text-indigo-600">{averageScore}</p>
                <p className="text-xs text-gray-500 mt-1">/ 100</p>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Strong Areas</p>
                <p className="text-3xl font-black text-emerald-600">{strongAreas.length}</p>
                <p className="text-xs text-emerald-700 mt-1 font-semibold">Dimensions scoring ≥80</p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Moderate Concern</p>
                <p className="text-3xl font-black text-amber-600">{dimensions.filter(d => d.score >= 60 && d.score < 80).length}</p>
                <p className="text-xs text-amber-700 mt-1 font-semibold">Dimensions scoring 60-79</p>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Critical</p>
                <p className="text-3xl font-black text-red-600">{criticalAreas.length}</p>
                <p className="text-xs text-red-700 mt-1 font-semibold">Dimensions scoring &lt;60</p>
              </div>
            </div>

            {/* Top Findings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              {/* Strengths */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Top Strengths
                </h4>
                <ul className="space-y-2">
                  {dimensions
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3)
                    .map((dim) => (
                      <li
                        key={dim.id}
                        className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-emerald-900">{dim.name}</span>
                          <span className="font-bold text-emerald-700">{dim.score}</span>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Focus Areas */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Priority Improvements
                </h4>
                <ul className="space-y-2">
                  {dimensions
                    .sort((a, b) => a.score - b.score)
                    .slice(0, 3)
                    .map((dim) => (
                      <li
                        key={dim.id}
                        className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-red-900">{dim.name}</span>
                          <span className="font-bold text-red-700">{dim.score}</span>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Report Generation Control */}
          {!reportReady ? (
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white p-8 rounded-2xl border border-indigo-800 space-y-6 shadow-lg">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Generate Comprehensive Report</h3>
                <p className="text-sm text-indigo-200">
                  Create a detailed PDF report including radar charts, gap analysis, stakeholder feedback summary, and actionable recommendations
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleGenerateReport}
                  disabled={isGeneratingPDF}
                  className="p-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="animate-spin">⚙️</div>
                      <span>Generating Report...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      <span>Generate PDF Report</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleGenerateReport}
                  disabled={isGeneratingPDF}
                  className="p-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="animate-spin">⚙️</div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5" />
                      <span>Export Excel Data</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-indigo-800/50 border border-indigo-700 rounded-lg text-xs text-indigo-100 space-y-2">
                <p className="font-bold">📋 Report includes:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Executive summary with overall health score</li>
                  <li>14-Dimension radar chart with benchmark comparison</li>
                  <li>Detailed analysis for each dimension</li>
                  <li>Subjective vs Objective data comparison</li>
                  <li>Gap analysis with prioritized recommendations</li>
                  <li>Stakeholder feedback summary</li>
                  <li>3-year strategic action plan</li>
                  <li>Data quality & confidence metrics</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border-2 border-emerald-300 p-8 rounded-2xl text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-emerald-600 text-white rounded-full">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-emerald-900">Report Ready for Download!</h3>
                <p className="text-sm text-emerald-700">
                  Your comprehensive DISHA diagnostic report is ready to share with school leadership and stakeholders
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-xs">Download PDF</span>
                </button>

                <button
                  onClick={handleDownloadExcel}
                  className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-xs">Download Excel</span>
                </button>

                <button
                  onClick={handlePrintReport}
                  className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  <span className="text-xs">Print Report</span>
                </button>

                <button
                  onClick={handleShareReport}
                  className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-xs">Share Link</span>
                </button>
              </div>
            </div>
          )}

          {/* Dimension Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-gray-900">14-Dimension Assessment Summary</h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dimensions.map((dim) => {
                const isStrong = dim.score >= 80;
                const isModerate = dim.score >= 60 && dim.score < 80;
                const isCritical = dim.score < 60;

                return (
                  <div
                    key={dim.id}
                    className={cn(
                      'p-3 rounded-lg border transition-all',
                      isStrong && 'bg-emerald-50 border-emerald-200',
                      isModerate && 'bg-amber-50 border-amber-200',
                      isCritical && 'bg-red-50 border-red-200'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p
                          className={cn(
                            'font-bold text-sm',
                            isStrong && 'text-emerald-900',
                            isModerate && 'text-amber-900',
                            isCritical && 'text-red-900'
                          )}
                        >
                          {dim.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-white/50 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full transition-all',
                              isStrong && 'bg-emerald-500',
                              isModerate && 'bg-amber-500',
                              isCritical && 'bg-red-500'
                            )}
                            style={{ width: `${dim.score}%` }}
                          />
                        </div>

                        <span
                          className={cn(
                            'font-bold text-sm w-10 text-right',
                            isStrong && 'text-emerald-700',
                            isModerate && 'text-amber-700',
                            isCritical && 'text-red-700'
                          )}
                        >
                          {dim.score}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Report Details & Info */}
        <div className="space-y-6">
          {/* Report Info Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="text-lg font-bold">Report Details</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 flex-shrink-0 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-xs">School Name</p>
                  <p className="font-bold">{activeSchool?.name || 'Not Selected'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-xs">Location</p>
                  <p className="font-bold">
                    {activeSchool?.city}, {activeSchool?.board}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 flex-shrink-0 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-xs">Assessment Date</p>
                  <p className="font-bold">{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 flex-shrink-0 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-xs">Dimensions Assessed</p>
                  <p className="font-bold">{dimensions.length} / 14</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 flex-shrink-0 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-xs">Overall Health Score</p>
                  <p className="font-bold">{averageScore} / 100</p>
                </div>
              </div>
            </div>
          </div>

          {/* What's in the Report */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900">What's Included</h3>

            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="text-lg">📊</span>
                <div>
                  <p className="font-bold text-gray-900">Radar Chart</p>
                  <p className="text-xs text-gray-600">All 14 dimensions vs national benchmarks</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-lg">📈</span>
                <div>
                  <p className="font-bold text-gray-900">Gap Analysis</p>
                  <p className="text-xs text-gray-600">Score vs benchmark by dimension</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-lg">🎯</span>
                <div>
                  <p className="font-bold text-gray-900">Recommendations</p>
                  <p className="text-xs text-gray-600">Prioritized action items per area</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-lg">👥</span>
                <div>
                  <p className="font-bold text-gray-900">Stakeholder Insights</p>
                  <p className="text-xs text-gray-600">Feedback from all respondent groups</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-lg">🔍</span>
                <div>
                  <p className="font-bold text-gray-900">Data Transparency</p>
                  <p className="text-xs text-gray-600">Calculation methods & confidence levels</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <button
            onClick={() => setCurrentView('DASHBOARD')}
            className="w-full p-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SynthesizeStage;

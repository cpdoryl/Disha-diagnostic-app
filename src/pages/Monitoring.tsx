import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { Bell, Calendar, TrendingUp, TrendingDown, Minus, CheckCircle2, Users } from 'lucide-react';
import { AssessmentTrendViewer } from '../components/AssessmentTrendViewer';
import { AssessmentHistory } from '../lib/assessmentVersioning';
import { loadSchoolAssessmentHistory } from '../lib/trendAnalysisService';
import { computeDiagnosticReport, DiagnosticReportData } from '../lib/dimensionScoring';
import {
  resolveMonitoredEvent,
  buildLiveSnapshot,
  subscribeToLiveResponses,
  LiveMonitoringSnapshot,
} from '../lib/liveMonitoringService';
import { subscribeToResponseUpdates, getAssessmentStats } from '../lib/assessmentService';

interface AssessmentStats {
  totalReceived: number;
  totalExpected: number;
  responseRate: number;
  responsesByType: Record<string, number>;
}

export const Monitoring = () => {
  const { activeSchool } = useAppStore();
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [liveSnapshot, setLiveSnapshot] = useState<LiveMonitoringSnapshot | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  // Assessment response tracking
  const [assessmentStats, setAssessmentStats] = useState<AssessmentStats | null>(null);
  const [assessmentResponses, setAssessmentResponses] = useState<any[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== 'history' || !activeSchool) return;
    let cancelled = false;
    setHistoryLoading(true);
    setHistoryError(null);
    loadSchoolAssessmentHistory(activeSchool.id, activeSchool.name)
      .then((history) => {
        if (!cancelled) setAssessmentHistory(history);
      })
      .catch((err) => {
        console.error('Failed to load assessment trend history:', err);
        if (!cancelled) setHistoryError('Could not load assessment history. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, activeSchool?.id]);

  useEffect(() => {
    if (activeTab !== 'live' || !activeSchool) return;
    let cancelled = false;
    let unsubscribeResponses: (() => void) | null = null;
    const schoolId = activeSchool.id;

    setLiveLoading(true);
    setLiveError(null);
    setLiveSnapshot(null);

    const refresh = (event: Awaited<ReturnType<typeof resolveMonitoredEvent>>, report: DiagnosticReportData) => {
      if (!event) return;
      buildLiveSnapshot(schoolId, event, report)
        .then((snapshot) => {
          if (!cancelled) setLiveSnapshot(snapshot);
        })
        .catch((err) => {
          console.error('Failed to build live monitoring snapshot:', err);
          if (!cancelled) setLiveError('Could not load live monitoring data.');
        })
        .finally(() => {
          if (!cancelled) setLiveLoading(false);
        });
    };

    resolveMonitoredEvent(schoolId)
      .then((event) => {
        if (cancelled) return;
        if (!event) {
          setLiveLoading(false);
          return;
        }
        computeDiagnosticReport(event.id)
          .then((report) => refresh(event, report))
          .catch((err) => {
            console.error('Failed to compute live diagnostic report:', err);
            if (!cancelled) {
              setLiveError('Could not load live monitoring data.');
              setLiveLoading(false);
            }
          });

        if (event.status === 'active') {
          unsubscribeResponses = subscribeToLiveResponses(
            event.id,
            (report) => refresh(event, report),
            (err) => console.error('Live response listener failed:', err)
          );
        }
      })
      .catch((err) => {
        console.error('Failed to resolve monitored event:', err);
        if (!cancelled) {
          setLiveError('Could not load live monitoring data.');
          setLiveLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (unsubscribeResponses) unsubscribeResponses();
    };
  }, [activeTab, activeSchool?.id]);

  // Real-time subscription to assessment responses
  useEffect(() => {
    if (!selectedAssessmentId || !activeSchool) return;

    console.log('📡 Subscribing to assessment responses:', selectedAssessmentId);

    // Initial stats load
    getAssessmentStats(activeSchool.id, selectedAssessmentId)
      .then((stats) => {
        console.log('✓ Loaded assessment stats:', stats);
        setAssessmentStats(stats);
      })
      .catch((err) => {
        console.error('Failed to load assessment stats:', err);
      });

    // Subscribe to real-time response updates
    const unsubscribe = subscribeToResponseUpdates(
      activeSchool.id,
      selectedAssessmentId,
      (latestResponses) => {
        console.log('📊 Response update received:', latestResponses.length, 'responses');
        setAssessmentResponses(latestResponses);

        // Recalculate stats
        getAssessmentStats(activeSchool.id, selectedAssessmentId)
          .then((updatedStats) => {
            console.log('✓ Updated stats:', updatedStats);
            setAssessmentStats(updatedStats);
          })
          .catch((err) => {
            console.error('Failed to update stats:', err);
          });
      }
    );

    // Cleanup subscription on unmount or when assessment changes
    return () => {
      console.log('🧹 Unsubscribing from assessment responses');
      unsubscribe();
    };
  }, [selectedAssessmentId, activeSchool?.id]);

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'down': return <TrendingDown className="w-5 h-5 text-rose-500" />;
      default: return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Ongoing Monitoring & Compliance</h2>
          <p className="text-gray-500 mt-1 font-medium">Continuous metric tracking, survey velocity, and live audit telemetry.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {activeSchool && (
            <div className="bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              <span className="text-blue-400 font-extrabold">{activeSchool.name}</span>
              <span className="text-slate-500">|</span>
              <span>{activeSchool.board}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">{activeSchool.city}</span>
            </div>
          )}
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-2 shadow-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            {liveSnapshot
              ? `${liveSnapshot.event.eventName} · ${liveSnapshot.isCurrentlyCollecting ? 'Collecting' : 'Last Completed'}`
              : 'No Assessment Event'}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${
              activeTab === 'live'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Live Monitoring
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📈 Assessment Trends & History
          </button>
        </div>
      </div>

      {/* Live Monitoring Tab */}
      {activeTab === 'live' && (
        <>
          {/* Assessment ID Selector */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Track Assessment Responses
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter Assessment ID to track responses..."
                value={selectedAssessmentId || ''}
                onChange={(e) => setSelectedAssessmentId(e.target.value || null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setSelectedAssessmentId(selectedAssessmentId)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                Load
              </button>
            </div>
            {selectedAssessmentId && (
              <p className="text-xs text-gray-500 mt-2">
                Tracking responses for assessment: <span className="font-mono font-bold">{selectedAssessmentId}</span>
              </p>
            )}
          </div>

          {liveLoading && (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-500 font-medium">
              Loading live monitoring data...
            </div>
          )}
          {!liveLoading && liveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl font-medium">
              {liveError}
            </div>
          )}
          {!liveLoading && !liveError && !liveSnapshot && (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
              <p className="text-gray-600 font-medium">No assessment events found for this school yet.</p>
              <p className="text-gray-500 text-sm mt-1">Start a 14D Assessment to see live monitoring here.</p>
            </div>
          )}
          {!liveLoading && !liveError && liveSnapshot && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Board Exam Pass Rate</h3>
                  {liveSnapshot.boardPassRate ? (
                    <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Captured</p>
                          <p className="font-black text-gray-900 text-2xl">{liveSnapshot.boardPassRate.value}%</p>
                        </div>
                        <div className="h-10 w-px bg-gray-200" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Benchmark</p>
                          <p className="font-black text-blue-600 text-2xl">{liveSnapshot.boardPassRate.benchmark}%</p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-black px-4 py-2 rounded-lg border shadow-sm ${
                          liveSnapshot.boardPassRate.value >= liveSnapshot.boardPassRate.benchmark
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}
                      >
                        {liveSnapshot.boardPassRate.value >= liveSnapshot.boardPassRate.benchmark
                          ? 'At/Above Benchmark'
                          : 'Below Benchmark'}
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Not yet captured for this event. Add objective data for the Academic dimension to see this.
                    </p>
                  )}
                </div>

                {/* Real-time Response Tracking */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-900">Live Response Tracking</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Real-time response counts by respondent type. Updates automatically as new responses arrive.
                    </p>
                  </div>
                  <div className="p-6">
                    {assessmentStats ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Total Responses</p>
                            <p className="text-3xl font-black text-blue-900">
                              {assessmentStats.totalReceived}
                              <span className="text-sm font-bold text-blue-600 ml-2">/ {assessmentStats.totalExpected}</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Response Rate</p>
                            <p className="text-3xl font-black text-blue-900">{assessmentStats.responseRate.toFixed(1)}%</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(assessmentStats.responsesByType).map(([type, count]) => (
                            <div key={type} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1 capitalize">
                                {type}
                              </p>
                              <p className="text-2xl font-black text-gray-900">{count}</p>
                            </div>
                          ))}
                        </div>

                        {assessmentResponses.length > 0 && (
                          <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Latest Submissions</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {assessmentResponses.slice(0, 5).map((response, idx) => (
                                <p key={idx} className="text-xs text-emerald-700">
                                  <span className="font-bold capitalize">{response.respondentType}:</span> {response.respondentName} ({response.respondentEmail})
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No assessment selected. Click on an assessment to track responses.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Domain Scorecards</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Live subjective scores for {liveSnapshot.event.eventName}
                      {liveSnapshot.isCurrentlyCollecting ? ' (updates as responses arrive)' : ''}. Trend vs. the
                      previous completed assessment.
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Domain</th>
                          <th className="px-6 py-4 text-center">Score</th>
                          <th className="px-6 py-4 text-center">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {liveSnapshot.domainScores.map((domain) => (
                          <tr key={domain.dimensionId} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-900 text-base">{domain.dimensionName}</td>
                            <td className="px-6 py-4 text-center">
                              {domain.score != null ? (
                                <span
                                  className={`font-black text-lg ${
                                    domain.score >= 80 ? 'text-emerald-600' : 'text-amber-600'
                                  }`}
                                >
                                  {domain.score}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm font-semibold">No Data</span>
                              )}
                            </td>
                            <td className="px-6 py-4 flex justify-center">
                              <div className="bg-gray-100 p-2 rounded-lg">{getTrendIcon(domain.trend)}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 text-amber-600">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Bell className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-xl">Data Collection Alerts</h3>
                  </div>

                  {liveSnapshot.alerts.length === 0 ? (
                    <div className="p-5 rounded-xl border border-emerald-100 bg-emerald-50 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <p className="text-sm text-emerald-800 font-medium">
                        No active data collection alerts for this event.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {liveSnapshot.alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-5 rounded-xl border ${
                            alert.severity === 'warning'
                              ? 'border-rose-100 bg-rose-50'
                              : 'border-amber-100 bg-amber-50'
                          }`}
                        >
                          <p
                            className={`text-xs font-black uppercase tracking-wider mb-2 ${
                              alert.severity === 'warning' ? 'text-rose-600' : 'text-amber-600'
                            }`}
                          >
                            {alert.title}
                          </p>
                          <p className="text-sm text-gray-700 font-medium">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Assessment History Tab */}
      {activeTab === 'history' && (
        <>
          {historyLoading && (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-500 font-medium">
              Loading assessment history...
            </div>
          )}
          {!historyLoading && historyError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl font-medium">
              {historyError}
            </div>
          )}
          {!historyLoading && !historyError && assessmentHistory && (
            <>
              {assessmentHistory.totalAssessments < 2 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-sm font-medium">
                  {assessmentHistory.totalAssessments === 0
                    ? 'No locked assessment events yet. Trends appear once at least two 14D assessment events have been locked for this school.'
                    : 'Only one locked assessment event so far. Lock a second event to see real trend comparisons.'}
                </div>
              )}
              <AssessmentTrendViewer
                history={assessmentHistory}
                onSelectVersion={(version) => {
                  console.log('Selected version:', version);
                }}
                onExport={(history) => {
                  const json = JSON.stringify(history, null, 2);
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `assessment-history-${activeSchool?.id}-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

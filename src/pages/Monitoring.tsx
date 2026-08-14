import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bell, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { AssessmentTrendViewer } from '../components/AssessmentTrendViewer';
import { AssessmentHistory } from '../lib/assessmentVersioning';
import { loadSchoolAssessmentHistory } from '../lib/trendAnalysisService';

const generateMockTrend = (base: number, volatility: number) => {
  return Array.from({ length: 30 }).map((_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'MMM dd'),
    value: Math.max(0, Math.min(100, Math.round(base + (Math.random() * volatility - volatility/2)))),
  }));
};

export const Monitoring = () => {
  const { domains, activeSchool } = useAppStore();
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

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
            Last 30 Days
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Committed Target Progress: Board Pass Rate</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateMockTrend(89, 4)} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11, fontWeight: 500}} dy={10} minTickGap={30} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontWeight: 500}} domain={[70, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} dot={false} activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Current</p>
                  <p className="font-black text-gray-900 text-2xl">89%</p>
                </div>
                <div className="h-10 w-px bg-gray-200" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Target</p>
                  <p className="font-black text-blue-600 text-2xl">95%</p>
                </div>
              </div>
              <div>
                <span className="bg-emerald-100 text-emerald-700 text-sm font-black px-4 py-2 rounded-lg border border-emerald-200 shadow-sm">On Track</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Domain Scorecards</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Domain</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4 text-center">Trend</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {domains.map((domain) => (
                    <tr key={domain.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 text-base">{domain.title}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-black text-lg ${domain.score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {domain.score}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex justify-center">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          {getTrendIcon(domain.trend)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 font-bold hover:underline text-sm">Review</button>
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
              <h3 className="font-bold text-gray-900 text-xl">System Alerts</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-rose-100 bg-rose-50 hover:bg-rose-100/50 transition-colors cursor-pointer">
                <p className="text-xs font-black text-rose-600 uppercase tracking-wider mb-2">At-Risk Metric</p>
                <p className="font-bold text-gray-900 mb-2 text-lg">Teacher Retention</p>
                <p className="text-sm text-gray-700 font-medium">Velocity of administrative workload complaints has increased by 15% this week.</p>
              </div>
              <div className="p-5 rounded-xl border border-amber-100 bg-amber-50 hover:bg-amber-100/50 transition-colors cursor-pointer">
                <p className="text-xs font-black text-amber-600 uppercase tracking-wider mb-2">Data Collection</p>
                <p className="font-bold text-gray-900 mb-2 text-lg">Parent Survey Stalled</p>
                <p className="text-sm text-gray-700 font-medium">Response rate has stagnated at 37%. Consider sending an SMS reminder.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
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

import React from 'react';
import { useAppStore } from '../store';
import { AlertCircle, ArrowUpRight, BarChart3, Info, Download, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const CompareStage = () => {
  const { dimensions, gaps, domains, activeSchool } = useAppStore();

  const chartData = dimensions.slice(0, 6).map(d => ({
    name: d.name,
    Score: d.score,
    Benchmark: d.benchmark,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Stage 2: Compare (Diagnose & Benchmark)</h2>
          <p className="text-gray-500 mt-1">Benchmarking against national standards for Indian schools. Tier 1 benchmarks represent best practices across academic excellence, student welfare, individual attention, and social responsibility.</p>
        </div>
        {activeSchool && (
          <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl text-xs text-blue-900 flex items-center gap-2 shrink-0">
            <span className="font-extrabold text-blue-950">{activeSchool.name}</span>
            <span className="text-blue-300">|</span>
            <span className="font-bold">{activeSchool.board}</span>
            <span className="text-blue-300">|</span>
            <span className="text-blue-700">{activeSchool.city}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Benchmark Comparison</h3>
                <p className="text-sm text-gray-500">Performance across top 6 dimensions vs Tier 1 Standards</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} barGap={0}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Bar dataKey="Score" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Benchmark" fill="#9ca3af" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">14-Dimension Deep Dive</h3>
              <p className="text-sm text-gray-500">Comprehensive EWISR-aligned scoring breakdown.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Dimension</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4 text-center">Benchmark</th>
                    <th className="px-6 py-4 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dimensions.map((dim) => {
                    const variance = dim.score - dim.benchmark;
                    return (
                      <tr key={dim.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{dim.name}</td>
                        <td className="px-6 py-4">{dim.categoryName}</td>
                        <td className="px-6 py-4 text-center font-bold text-gray-900">{dim.score}</td>
                        <td className="px-6 py-4 text-center text-gray-500">{dim.benchmark}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={cn(
                            "font-bold px-2.5 py-1 rounded-md text-xs",
                            variance >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                          )}>
                            {variance >= 0 ? '+' : ''}{variance}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Priority Gap Diagnostics</h3>
            <p className="text-sm text-gray-500 mb-6">Top AI-identified root causes and recommended pathways.</p>
            
            <div className="space-y-4">
              {gaps.map((gap) => (
                <div key={gap.id} className="p-5 rounded-xl border border-rose-100 bg-rose-50/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-rose-100 text-rose-700 font-bold w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                        #{gap.priorityRank}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{gap.domainName}</h4>
                        <p className="text-sm font-bold text-rose-600 flex items-center gap-1">
                           Variance: {gap.gapVsStandard} points vs Standard
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-lg border border-rose-50 shadow-sm">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> Root Cause Narrative
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed font-medium">{gap.rootCause}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" /> Recommended Pathway
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed font-medium">{gap.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-sm border border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600/20 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold">Executive Summary</h3>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Most Critical Gap</p>
                <p className="font-bold text-rose-400 text-lg">Parental Satisfaction (-8 pts)</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Strongest Domain</p>
                <p className="font-bold text-emerald-400 text-lg">Dropout Prevention (+2 pts)</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed font-medium">
              Based on the comparison against Tier 1 benchmarks, your primary focus should be optimizing communication loops and reducing administrative burden to improve retention.
            </p>

            <button 
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition-colors text-sm shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              onClick={() => {
                const element = document.createElement('a');
                element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('Diagnostic Report...');
                element.download = 'DISHA_Diagnostic_Report.pdf';
                element.click();
              }}
            >
              <Download className="w-4 h-4" />
              Export Full Report (PDF)
            </button>
          </div>

          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
            <div className="flex gap-4">
              <div className="bg-indigo-100 p-2 rounded-lg shrink-0 h-fit">
                <Info className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg">Next Step: Simulate</h4>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  Take these priority gaps into Stage 3. Set target outcomes for these metrics and use our reverse-modeling engine to determine the exact operational changes required to achieve them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

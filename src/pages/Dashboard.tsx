import React from 'react';
import { useAppStore } from '../store';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, HeartPulse, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockTrendData = [
  { name: 'Jan', score: 72 },
  { name: 'Feb', score: 75 },
  { name: 'Mar', score: 74 },
  { name: 'Apr', score: 78 },
  { name: 'May', score: 81 },
  { name: 'Jun', score: 82 },
];

export const Dashboard = () => {
  const { domains, activeSchool, setCurrentView } = useAppStore();

  const averageScore = Math.round(domains.reduce((acc, curr) => acc + curr.score, 0) / domains.length);
  const criticalAreas = domains.filter(d => d.score < 80);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">School Overview</h2>
          <p className="text-gray-500 mt-1 font-medium">Holistic diagnostic summary for <span className="text-gray-900 font-bold">{activeSchool?.name || 'Your Registered School'}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('14D_ASSESSMENT')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            <Target className="w-5 h-5" />
            New Assessment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ActivityIcon className="w-24 h-24 text-blue-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-gray-500 mb-4">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <ActivityIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-700">Overall Health Score</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-gray-900">{averageScore}</span>
              <span className="text-gray-500 font-bold">/ 100</span>
            </div>
            <p className="text-sm text-emerald-600 font-bold mt-3 flex items-center gap-1 bg-emerald-50 w-fit px-2.5 py-1 rounded-md border border-emerald-100">
              <TrendingUp className="w-4 h-4" /> +4 points from last term
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle className="w-24 h-24 text-rose-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-gray-500 mb-4">
              <div className="bg-rose-100 text-rose-600 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-700">Critical Domains</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-gray-900">{criticalAreas.length}</span>
              <span className="text-gray-500 font-bold">requires attention</span>
            </div>
            <p className="text-sm text-rose-700 font-bold mt-3 truncate bg-rose-50 w-fit px-2.5 py-1 rounded-md border border-rose-100 max-w-full">
              {criticalAreas.map(c => c.title).join(', ')}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="w-24 h-24 text-emerald-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-gray-500 mb-4">
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-700">Simulations Run</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-gray-900">4</span>
              <span className="text-gray-500 font-bold">models tested</span>
            </div>
            <button 
              className="text-sm text-blue-600 font-bold mt-3 flex items-center gap-1 hover:text-blue-700 transition-colors bg-blue-50 w-fit px-2.5 py-1 rounded-md border border-blue-100"
              onClick={() => setCurrentView('SIMULATE')}
            >
              View active targets <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Annual Health Checkup CTA Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <HeartPulse className="w-48 h-48 text-blue-250" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 bg-blue-600/30 text-blue-300 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Disha Plain-Language Diagnostics</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight">Run your School's Annual Health Checkup</h3>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium leading-relaxed">
            Think of Disha as a checkup run by an app instead of a doctor. Tell us what is worrying you right now (turnover, enrollment, competition), share quick supporting documents, and receive a direct first-opinion gap report in one sitting.
          </p>
        </div>
        <button
          onClick={() => setCurrentView('FIRST_OPINION')}
          className="relative z-10 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3.5 rounded-xl text-sm transition-all shadow-[0_4px_15px_rgba(37,99,235,0.3)] shrink-0 flex items-center gap-2 hover:translate-x-0.5"
        >
          Start First Opinion
          <ArrowRight className="w-4.5 h-4.5 text-white" />
        </button>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Historical Performance Trend</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontWeight: 500}} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#111827', fontWeight: 700 }}
                  labelStyle={{ color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" activeDot={{r: 6, strokeWidth: 0, fill: '#2563eb'}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Domain Summary</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {domains.map(domain => (
              <div key={domain.id} className="flex items-center justify-between group p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div>
                  <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{domain.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-sm font-black px-2.5 py-1 rounded-md",
                    domain.score >= 85 ? "bg-emerald-100 text-emerald-700" :
                    domain.score >= 75 ? "bg-amber-100 text-amber-700" :
                    "bg-rose-100 text-rose-700"
                  )}>
                    {domain.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setCurrentView('COMPARE')}
            className="mt-6 w-full py-3 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            View Detailed Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};

function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

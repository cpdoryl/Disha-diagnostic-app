import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { Settings2, ArrowRight, Zap, Target, Activity, Search, ShieldCheck } from 'lucide-react';

export const SimulateStage = () => {
  const { simulations, updateSimulationTarget, activeSchool } = useAppStore();
  const [selectedSimId, setSelectedSimId] = useState(simulations[0]?.id || '');
  const sim = simulations.find(s => s.id === selectedSimId) || simulations[0];
  const [targetVal, setTargetVal] = useState(sim?.targetValue || 0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (sim) {
      setTargetVal(sim.targetValue);
    }
  }, [sim]);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 1500);
  };

  const handleSaveScenario = async () => {
    setIsSaving(true);
    if (sim) {
      await updateSimulationTarget(sim.id, targetVal);
    }
    setIsSaving(false);
  };

  if (!sim) {
    return <div>Loading simulations...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Stage 3: Simulate (Model & Strategize)</h2>
          <p className="text-gray-500 mt-1">Predictive outcome modeling and target feasibility simulation for 14 diagnostic dimensions.</p>
        </div>
        {activeSchool && (
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs text-emerald-950 flex items-center gap-2 shrink-0">
            <span className="font-extrabold text-emerald-950">{activeSchool.name}</span>
            <span className="text-emerald-300">|</span>
            <span className="font-bold">{activeSchool.board}</span>
            <span className="text-emerald-300">|</span>
            <span className="text-emerald-700">{activeSchool.city}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Target Setter */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Set Outcome Target</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Priority Metric to Improve</label>
                <select 
                  value={selectedSimId}
                  onChange={(e) => setSelectedSimId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 font-medium"
                >
                  {simulations.map(s => (
                    <option key={s.id} value={s.id}>{s.targetMetric}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Current Baseline</label>
                  <div className="text-2xl font-bold text-gray-900">
                    {sim.currentValue}%
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Desired Target</label>
                  <input 
                    type="number" 
                    value={targetVal}
                    onChange={(e) => setTargetVal(Number(e.target.value))}
                    className="w-full bg-transparent text-2xl font-bold text-blue-900 border-none focus:ring-0 p-0" 
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="mt-8 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
            >
              {isSimulating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running AI Engine...
                </>
              ) : (
                <>
                  <Settings2 className="w-5 h-5" />
                  Run Reverse Model
                </>
              )}
            </button>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" /> How reverse modeling works
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              Instead of guessing which initiatives will work, you define the desired outcome first. Our engine analyzes thousands of school data points to calculate the specific, weighted input changes required across your ecosystem to make that outcome statistically probable.
            </p>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            {isSimulating && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="font-bold text-gray-900">Calculating Input Sensitivities...</p>
                <p className="text-sm text-gray-500 mt-1">Cross-referencing district precedents</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Simulation Results</h3>
                <p className="text-gray-500 font-medium">Optimal pathway to achieve {targetVal}% {sim.targetMetric}</p>
              </div>
              <div className="bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Feasibility Confidence</p>
                  <p className="font-black text-emerald-600 text-lg">Tier {sim.confidenceTier} (High)</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <h4 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-2">Required Input Changes</h4>
              
              <div className="space-y-4">
                {sim.requiredChanges.map((change, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-6 p-5 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg mb-2">{change.factor}</p>
                      <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-100 inline-flex">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-400 line-through decoration-2">{change.current}</span>
                          <div className="bg-blue-100 text-blue-600 p-1 rounded">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                          <span className="text-lg font-black text-blue-600">{change.required}</span>
                        </div>
                      </div>
                    </div>
                    <div className="sm:w-48 bg-white p-4 rounded-lg border border-gray-100">
                      <div className="flex justify-between text-xs mb-2 font-bold text-gray-500 uppercase tracking-wider">
                        <span>Relative Impact</span>
                        <span className="text-gray-900">{change.impact}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${change.impact}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
              <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-indigo-600" />
                District Precedent Match
              </h4>
              <p className="text-indigo-800 leading-relaxed font-medium">
                <span className="font-black">Proof of Possibility: </span>
                {sim.districtPrecedent} achieved a similar trajectory last academic year by successfully implementing these exact input factor changes.
              </p>
            </div>

            <div className="mt-8 flex justify-end gap-4 border-t border-gray-100 pt-6">
              <button 
                onClick={handleSaveScenario}
                disabled={isSaving}
                className="px-6 py-3 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Scenario'}
              </button>
              <button 
                onClick={() => {
                  const { setCurrentView } = useAppStore.getState();
                  setCurrentView('MONITORING');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 text-lg"
              >
                <Zap className="w-5 h-5 fill-current" />
                Commit to Target & Monitor
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

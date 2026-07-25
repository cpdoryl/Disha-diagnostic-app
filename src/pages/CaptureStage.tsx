import React, { useState } from 'react';
import { FileText, UploadCloud, Users, ArrowRight, CheckCircle2, Server, Database, LineChart, X } from 'lucide-react';
import { useAppStore } from '../store';

export const CaptureStage = () => {
  const { domains, dimensions } = useAppStore();
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Stage 1: Capture</h2>
        <p className="text-gray-500 mt-1">Comprehensive data collection across 9 challenge domains and 14 dimensions.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Stakeholder Assessments</h3>
                <p className="text-gray-500 text-sm">Diagnostic surveys distributed to establish the system baseline.</p>
              </div>
              <button onClick={() => setIsDeployModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm">
                Deploy Surveys
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { role: 'School Owner/Leader', status: 'Completed', progress: 100, respondents: '1/1' },
                { role: 'Teaching Staff', status: 'In Progress', progress: 84, respondents: '42/50' },
                { role: 'Parents', status: 'In Progress', progress: 37, respondents: '150/400' },
                { role: 'Students (Grade 8-12)', status: 'Pending Launch', progress: 0, respondents: '0/800' },
              ].map((survey, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{survey.role}</p>
                        <p className="text-xs text-gray-500">{survey.respondents} Respondents</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-bold text-gray-700">
                      <span>{survey.status}</span>
                      <span>{survey.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${survey.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        style={{ width: `${survey.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">14-Dimension Framework Status</h3>
            <p className="text-gray-500 text-sm mb-6">Tracking data completion across EWISR-aligned dimensions.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {['Academic Excellence', 'Welfare', 'Individual Attention', 'Social Responsibility'].map((category) => {
                const categoryDimensions = dimensions.filter(d => d.categoryName === category);
                return (
                  <div key={category}>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3 pb-2 border-b border-gray-100">{category}</h4>
                    <ul className="space-y-3">
                      {categoryDimensions.map(dim => (
                        <li key={dim.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{dim.name}</span>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-indigo-500" />
              <h3 className="text-lg font-bold text-gray-900">Operational Data Sync</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6">Import quantitative data from school ERP systems.</p>
            
            <div className="space-y-4 mb-6">
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Admissions & Fee</p>
                    <p className="text-xs text-gray-500">Synced 2 hours ago</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Active</span>
              </div>
              
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">HR & Staffing</p>
                    <p className="text-xs text-gray-500">Synced 1 day ago</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Active</span>
              </div>

              <div className="p-3 bg-white border border-gray-200 border-dashed rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <UploadCloud className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="text-sm font-bold text-indigo-600">Connect Attendance Module</p>
                    <p className="text-xs text-gray-500">Required for full diagnosis</p>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-lg font-bold transition-colors text-sm border border-indigo-200">
              Manage ERP Integrations
            </button>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-sm border border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <LineChart className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold">Ready to Diagnose?</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">System has captured sufficient baseline data across the 9 challenge domains to generate an initial gap analysis.</p>
            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition-colors text-sm shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              Generate Baseline Report
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isDeployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Deploy Stakeholder Surveys</h3>
              <button 
                onClick={() => setIsDeployModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <p className="text-gray-600 text-sm">Select the stakeholder groups to receive the baseline diagnostic survey via email or SMS.</p>
              
              <div className="space-y-3">
                {[
                  { id: 't1', label: 'School Owner/Leader', count: 1 },
                  { id: 't2', label: 'Teaching Staff', count: 50 },
                  { id: 't3', label: 'Parents', count: 400 },
                  { id: 't4', label: 'Students (Grade 8-12)', count: 800 },
                  { id: 't5', label: 'Alumni Network', count: 120 }
                ].map((target) => (
                  <label key={target.id} className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" defaultChecked={target.id !== 't5'} />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{target.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">~{target.count} recipients</p>
                    </div>
                  </label>
                ))}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Delivery Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="delivery" className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" defaultChecked />
                    <span className="text-sm text-gray-700">Email Link</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="delivery" className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">SMS / WhatsApp</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsDeployModalOpen(false)}
                className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsDeployModalOpen(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Launch Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

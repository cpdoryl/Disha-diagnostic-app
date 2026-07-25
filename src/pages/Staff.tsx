import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Search, UserPlus, HeartHandshake, ShieldCheck, Award, Briefcase, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export const Staff = () => {
  const { staff, addStaff } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('Teacher');
  const [subject, setSubject] = useState('Mathematics');
  const [tenureMonths, setTenureMonths] = useState(12);
  const [performanceScore, setPerformanceScore] = useState(85);

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addStaff({
      name,
      role,
      subject,
      tenureMonths: Number(tenureMonths),
      performanceScore: Number(performanceScore)
    });

    // Reset Form
    setName('');
    setRole('Teacher');
    setSubject('Mathematics');
    setTenureMonths(12);
    setPerformanceScore(85);
    setIsAddModalOpen(false);
  };

  const avgPerformance = staff.length > 0 ? Math.round(staff.reduce((acc, s) => acc + s.performanceScore, 0) / staff.length) : 0;
  const avgTenure = staff.length > 0 ? Math.round(staff.reduce((acc, s) => acc + s.tenureMonths, 0) / staff.length) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Faculty & Staff</h2>
          <p className="text-gray-500 mt-1 font-medium">Manage faculty directories, performance indices, and retention stats.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
        >
          <UserPlus className="w-5 h-5" />
          Add Faculty Member
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Faculty</p>
            <p className="text-3xl font-black text-gray-900">{staff.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Avg Performance Rating</p>
            <p className="text-3xl font-black text-emerald-600">{avgPerformance}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Avg Tenure</p>
            <p className="text-3xl font-black text-indigo-600">{avgTenure} Months</p>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search faculty by name, role, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Subject Specialty</th>
                <th className="px-6 py-4 text-center">Tenure (Months)</th>
                <th className="px-6 py-4 text-center">Performance Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{member.name}</td>
                    <td className="px-6 py-4 font-semibold text-gray-600">{member.role}</td>
                    <td className="px-6 py-4 text-gray-700">{member.subject}</td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-900">{member.tenureMonths}m</td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-md text-sm">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        {member.performanceScore}%
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-medium">
                    No faculty members found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add Faculty Member</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prof. Rohit Sharma"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Role/Designation</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {['Senior Teacher', 'Teacher', 'Assistant Teacher', 'Subject Head', 'Coordinator'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Subject specialty</label>
                  <select 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'].map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tenure (In Months)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Performance Rating (%)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    max="100"
                    value={performanceScore}
                    onChange={(e) => setPerformanceScore(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-2 text-xs text-blue-800 font-medium leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                New faculty additions will automatically update retention analytics and optimize operational score predictions in Stage 2 (Compare).
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-colors"
                >
                  Save Faculty Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

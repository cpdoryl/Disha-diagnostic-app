import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Search, UserPlus, ShieldAlert, GraduationCap, Percent, AlertCircle, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const Students = () => {
  const { students, addStudent, activeSchool } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Grade 10');
  const [classSection, setClassSection] = useState('A');
  const [gender, setGender] = useState('Male');
  const [attendanceRate, setAttendanceRate] = useState(90);
  const [academicPerformance, setAcademicPerformance] = useState(75);
  const [riskProfile, setRiskProfile] = useState<'Low' | 'Medium' | 'High'>('Low');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.classSection.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addStudent({
      name,
      gradeLevel,
      classSection,
      gender,
      attendanceRate: Number(attendanceRate),
      academicPerformance: Number(academicPerformance),
      riskProfile
    });

    // Reset Form
    setName('');
    setGradeLevel('Grade 10');
    setClassSection('A');
    setGender('Male');
    setAttendanceRate(90);
    setAcademicPerformance(75);
    setRiskProfile('Low');
    setIsAddModalOpen(false);
  };

  const highRiskStudents = students.filter(s => s.riskProfile === 'High');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Student Directory</h2>
            {activeSchool && (
              <span className="bg-blue-100 text-blue-900 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-blue-200">
                {activeSchool.name}
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1 font-medium">Manage student rosters, grade levels, sections, and academic DISHA risk indices.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
        >
          <UserPlus className="w-5 h-5" />
          Add Student
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Enrolled</p>
            <p className="text-3xl font-black text-gray-900">{students.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-rose-100 text-rose-600 p-3 rounded-xl">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Critical (High Risk)</p>
            <p className="text-3xl font-black text-rose-600">{highRiskStudents.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Average Attendance</p>
            <p className="text-3xl font-black text-emerald-600">
              {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.attendanceRate, 0) / students.length) : 0}%
            </p>
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
              placeholder="Search by name, grade or section..."
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
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4 text-center">Attendance</th>
                <th className="px-6 py-4 text-center">Academic Perf.</th>
                <th className="px-6 py-4 text-center">Risk Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 font-semibold text-gray-600">{student.gradeLevel} - {student.classSection}</td>
                    <td className="px-6 py-4">{student.gender}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "font-black px-2.5 py-1 rounded-md text-sm",
                        student.attendanceRate >= 85 ? "text-emerald-600 bg-emerald-50" :
                        student.attendanceRate >= 75 ? "text-amber-600 bg-amber-50" :
                        "text-rose-600 bg-rose-50"
                      )}>
                        {student.attendanceRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "font-black px-2.5 py-1 rounded-md text-sm",
                        student.academicPerformance >= 80 ? "text-emerald-600 bg-emerald-50" :
                        student.academicPerformance >= 60 ? "text-amber-600 bg-amber-50" :
                        "text-rose-600 bg-rose-50"
                      )}>
                        {student.academicPerformance}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "font-bold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider",
                        student.riskProfile === 'Low' ? "bg-emerald-100 text-emerald-800" :
                        student.riskProfile === 'Medium' ? "bg-amber-100 text-amber-800" :
                        "bg-rose-100 text-rose-800 animate-pulse"
                      )}>
                        {student.riskProfile}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 font-medium">
                    No students found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add New Student</h3>
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
                  placeholder="e.g. Rahul Sen"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Grade Level</label>
                  <select 
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Class Section</label>
                  <select 
                    value={classSection}
                    onChange={(e) => setClassSection(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {['A', 'B', 'C', 'D'].map(sec => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Risk Profile</label>
                  <select 
                    value={riskProfile}
                    onChange={(e) => setRiskProfile(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold"
                  >
                    <option value="Low" className="text-emerald-600 font-bold">Low Risk</option>
                    <option value="Medium" className="text-amber-600 font-bold">Medium Risk</option>
                    <option value="High" className="text-rose-600 font-bold">High Risk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Attendance Rate (%)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    max="100"
                    value={attendanceRate}
                    onChange={(e) => setAttendanceRate(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Academic Score (%)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    max="100"
                    value={academicPerformance}
                    onChange={(e) => setAcademicPerformance(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2 text-xs text-amber-800 font-medium leading-relaxed">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                This student profile will immediately trigger corresponding analytical pipelines inside Stage 1 (Capture) and score updates on the dashboard.
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
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Calendar, CheckCircle2, XCircle, AlertCircle, Sparkles, Filter, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { AttendanceRecord } from '../types';

export const Attendance = () => {
  const { students, attendance, addAttendanceRecords, activeSchool } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('Grade 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [isSaved, setIsSaved] = useState(false);

  // Filter students for selected grade & section
  const targetStudents = students.filter(s => s.gradeLevel === selectedGrade && s.classSection === selectedSection);

  // Key-value store of studentId -> status ('Present' | 'Absent' | 'Late')
  const [statusMap, setStatusMap] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setStatusMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const recordsToSubmit: Omit<AttendanceRecord, 'id'>[] = targetStudents.map(student => {
      const status = statusMap[student.id] || 'Present'; // default to present if unmarked
      return {
        date: selectedDate,
        studentId: student.id,
        studentName: student.name,
        status
      };
    });

    if (recordsToSubmit.length === 0) return;

    await addAttendanceRecords(recordsToSubmit);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Recent attendance list
  const recentAttendance = attendance.slice(-10).reverse();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Attendance Register</h2>
          {activeSchool && (
            <span className="bg-emerald-100 text-emerald-900 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-emerald-200">
              {activeSchool.name}
            </span>
          )}
        </div>
        <p className="text-gray-500 mt-1 font-medium">Daily attendance entry, class checklists, and DISHA Dimension 4 (Culture & Climate) telemetry logging.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Cols: Mark Attendance */}
        <div className="xl:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-50 pb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Daily Checklist
              </h3>
              
              <div className="flex flex-wrap gap-3 items-center">
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 font-bold"
                />

                <select 
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 font-bold"
                >
                  {['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>

                <select 
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 font-bold"
                >
                  {['A', 'B', 'C', 'D'].map(sec => (
                    <option key={sec} value={sec}>Sec {sec}</option>
                  ))}
                </select>
              </div>
            </div>

            {targetStudents.length > 0 ? (
              <div className="space-y-3">
                {targetStudents.map(student => {
                  const currentStatus = statusMap[student.id] || 'Present';
                  return (
                    <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all">
                      <div>
                        <p className="font-bold text-gray-900 text-base">{student.name}</p>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
                          Base Attendance: {student.attendanceRate}%
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'Present')}
                          className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border",
                            currentStatus === 'Present'
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm"
                              : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Present
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'Absent')}
                          className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border",
                            currentStatus === 'Absent'
                              ? "bg-rose-100 text-rose-800 border-rose-200 shadow-sm"
                              : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          <XCircle className="w-4 h-4" />
                          Absent
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'Late')}
                          className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border",
                            currentStatus === 'Late'
                              ? "bg-amber-100 text-amber-800 border-amber-200 shadow-sm"
                              : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          <AlertCircle className="w-4 h-4" />
                          Late
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Filter className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-bold text-gray-700">No Students Found</p>
                <p className="text-sm text-gray-500 mt-1">There are no students registered for {selectedGrade} - Section {selectedSection} in the directory.</p>
              </div>
            )}

            {targetStudents.length > 0 && (
              <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                {isSaved ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-bold px-4 py-2 rounded-lg animate-fade-in flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    Attendance Registered Successfully!
                  </span>
                ) : (
                  <div />
                )}
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] text-sm"
                >
                  Save Attendance Ledger
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Col: Recent logs */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Recent Logs
            </h3>
            
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {recentAttendance.length > 0 ? (
                recentAttendance.map((record, index) => (
                  <div key={record.id || index} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold text-gray-900">{record.studentName}</p>
                      <p className="text-xs text-gray-500 font-semibold mt-0.5">{record.date}</p>
                    </div>
                    <span className={cn(
                      "font-bold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider",
                      record.status === 'Present' ? "bg-emerald-100 text-emerald-800" :
                      record.status === 'Absent' ? "bg-rose-100 text-rose-800" :
                      "bg-amber-100 text-amber-800"
                    )}>
                      {record.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-6 font-medium">No attendance entries recorded yet today.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

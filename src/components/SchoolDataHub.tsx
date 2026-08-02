import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { 
  Download, Search, Filter, Shield, User, Phone, Mail, Building2, MapPin, 
  CheckCircle2, FileSpreadsheet, Eye, RefreshCw, Sparkles, FileText, Globe, 
  Layers, Award, Trash2, Zap, AlertCircle, MessageSquare
} from 'lucide-react';
import { SURVEY_QUESTIONS } from './DeepDiveAssessment';
import { generateUserGuidePDF } from '../lib/generateGuidePdf';

export interface SubmissionRecord {
  id: string;
  schoolId: string;
  schoolName: string;
  board?: string;
  city: string;
  stakeholder: 'leader' | 'teacher' | 'parent' | 'student' | 'admin' | 'other';
  stakeholderLabel: string;
  respondent: {
    fullName: string;
    contactNumber: string;
    email: string;
    schoolName: string;
    board?: string;
    city: string;
    classGrade?: string;
    sectionDept?: string;
  };
  rawAnswers: Record<string, number>;
  calculatedScores?: Record<string, number>;
  qualitativeFeedback?: string;
  dpdpConsent: boolean;
  dpdpConsentTimestamp: string;
  modeUsed?: 'express' | 'full_diagnostic';
  submittedAt: string;
}

const STAKEHOLDER_TABS = [
  { id: 'all', label: 'All Sub-Components', icon: Layers, desc: 'Whole School Master Database' },
  { id: 'student', label: 'Students', icon: User, desc: 'Learner Experience & Voice' },
  { id: 'parent', label: 'Parents', icon: User, desc: 'Parent Community & Trust' },
  { id: 'teacher', label: 'Teachers', icon: User, desc: 'Faculty & Pedagogy' },
  { id: 'admin', label: 'Admins & Staff', icon: User, desc: 'Operations & Facilities' },
  { id: 'leader', label: 'Leaders & Owners', icon: Award, desc: 'Governance & Leadership' },
  { id: 'other', label: 'Other Stakeholders', icon: Globe, desc: 'Alumni & Partners' },
];

export const SchoolDataHub = ({ 
  activeSchool, 
  onClose 
}: { 
  activeSchool: { id: string; name: string; city?: string; board?: string } | null;
  onClose?: () => void;
}) => {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRecord, setSelectedRecord] = useState<SubmissionRecord | null>(null);

  const schoolId = activeSchool?.id || 'default_school';
  const schoolName = activeSchool?.name || 'Vasant Vihar Public School';
  const city = activeSchool?.city || 'New Delhi';

  // Live Firestore subscription & LocalStorage merge
  useEffect(() => {
    if (!schoolId) return;
    setLoading(true);

    const subCollectionRef = collection(db, `surveys_${schoolId}_submissions`);
    
    // Subscribe to Firestore submissions
    const unsub = onSnapshot(subCollectionRef, (snap) => {
      const remoteData: SubmissionRecord[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        remoteData.push({
          id: docSnap.id,
          ...data
        } as SubmissionRecord);
      });

      // Combine with local mock/draft submissions for instant response
      let localData: SubmissionRecord[] = [];
      try {
        const saved = localStorage.getItem(`disha_submissions_${schoolId}`);
        if (saved) {
          localData = JSON.parse(saved);
        }
      } catch (e) {
        console.warn("Could not load local submissions cache", e);
      }

      // De-duplicate by ID
      const map = new Map<string, SubmissionRecord>();
      [...remoteData, ...localData].forEach(rec => {
        if (rec && rec.id) map.set(rec.id, rec);
      });

      const merged = Array.from(map.values()).sort((a, b) => 
        new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
      );

      setSubmissions(merged);
      setLoading(false);
    }, (err) => {
      console.warn("Firestore submissions snapshot error:", err);
      // Fallback to local storage
      try {
        const saved = localStorage.getItem(`disha_submissions_${schoolId}`);
        if (saved) {
          setSubmissions(JSON.parse(saved));
        }
      } catch (e) {}
      setLoading(false);
    });

    return () => unsub();
  }, [schoolId]);

  // Filter Submissions
  const filteredSubmissions = submissions.filter(rec => {
    // Tab filter
    if (selectedTab !== 'all' && rec.stakeholder !== selectedTab) {
      return false;
    }

    // Mode filter
    if (modeFilter !== 'all' && rec.modeUsed !== modeFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const name = rec.respondent?.fullName?.toLowerCase() || '';
      const phone = rec.respondent?.contactNumber?.toLowerCase() || '';
      const email = rec.respondent?.email?.toLowerCase() || '';
      const sch = rec.respondent?.schoolName?.toLowerCase() || '';
      const brd = (rec.respondent?.board || rec.board || '').toLowerCase();
      const cty = rec.respondent?.city?.toLowerCase() || '';
      const cls = (rec.respondent?.classGrade || '').toLowerCase();
      const sec = (rec.respondent?.sectionDept || '').toLowerCase();
      const feedback = rec.qualitativeFeedback?.toLowerCase() || '';
      const role = rec.stakeholderLabel?.toLowerCase() || '';

      return name.includes(q) || phone.includes(q) || email.includes(q) || sch.includes(q) || brd.includes(q) || cty.includes(q) || cls.includes(q) || sec.includes(q) || feedback.includes(q) || role.includes(q);
    }

    return true;
  });

  // Calculate stats by stakeholder
  const countByStakeholder = (stKey: string) => {
    if (stKey === 'all') return submissions.length;
    return submissions.filter(s => s.stakeholder === stKey).length;
  };

  // CSV Export Utility (Excel compatible with UTF-8 BOM)
  const downloadCSV = (recordsToExport: SubmissionRecord[], filename: string) => {
    if (recordsToExport.length === 0) {
      alert("No records available to export for this selection.");
      return;
    }

    const headers = [
      "Submission ID",
      "School Name",
      "Board Affiliation",
      "City / Location",
      "Stakeholder Category",
      "Class / Grade",
      "Section / Dept",
      "Respondent Name",
      "Contact Mobile",
      "Email Address",
      "DPDP Consent Status",
      "DPDP Consent Timestamp",
      "Survey Mode",
      "Qualitative Feedback",
      "Average Rating Score",
      "Submission Date & Time"
    ];

    const rows = recordsToExport.map(r => [
      `"${r.id || ''}"`,
      `"${r.respondent?.schoolName || schoolName}"`,
      `"${r.respondent?.board || r.board || activeSchool?.board || 'CBSE'}"`,
      `"${r.respondent?.city || city}"`,
      `"${r.stakeholderLabel || r.stakeholder}"`,
      `"${r.respondent?.classGrade || 'N/A'}"`,
      `"${r.respondent?.sectionDept || 'N/A'}"`,
      `"${r.respondent?.fullName || 'N/A'}"`,
      `"${r.respondent?.contactNumber || 'N/A'}"`,
      `"${r.respondent?.email || 'N/A'}"`,
      `"${r.dpdpConsent ? 'Verified DPDP Compliant' : 'Pending'}"`,
      `"${r.dpdpConsentTimestamp || r.submittedAt || ''}"`,
      `"${r.modeUsed === 'express' ? 'Express 5-Q' : 'Full Diagnostic'}"`,
      `"${(r.qualitativeFeedback || '').replace(/"/g, '""')}"`,
      `"${calculateAvgScore(r.rawAnswers)}"`,
      `"${r.submittedAt ? new Date(r.submittedAt).toLocaleString('en-IN') : ''}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export Backup
  const downloadJSON = (recordsToExport: SubmissionRecord[], filename: string) => {
    const jsonStr = JSON.stringify({
      schoolMetaData: { schoolId, schoolName, city, exportedAt: new Date().toISOString() },
      totalSubmissions: recordsToExport.length,
      submissions: recordsToExport
    }, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateAvgScore = (rawAnswers?: Record<string, number>): string => {
    if (!rawAnswers || Object.keys(rawAnswers).length === 0) return '4.0';
    const vals = Object.values(rawAnswers);
    const sum = vals.reduce((a, b) => a + b, 0);
    return (sum / vals.length).toFixed(1);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-left space-y-6 p-6 sm:p-8">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-900 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-indigo-200">
              Database Retrieval & Analytics Engine
            </span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-600" /> DPDP Act Compliant
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            {schoolName} — Stakeholder Data Hub
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Retrieve, search, inspect, and export verified stakeholder feedback across all school sub-components.
          </p>
        </div>

        {/* TOP ACTIONS / EXPORTS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadCSV(filteredSubmissions, `${schoolName.replace(/\s+/g, '_')}_${selectedTab}_Data`)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download CSV for current selection"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Selection CSV</span>
          </button>

          <button
            onClick={() => downloadCSV(submissions, `${schoolName.replace(/\s+/g, '_')}_Whole_School_Master_Data`)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download Complete School Master CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Master School CSV ({submissions.length})</span>
          </button>

          <button
            onClick={() => downloadJSON(submissions, `${schoolName.replace(/\s+/g, '_')}_Database_Backup`)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
            title="Export JSON Backup"
          >
            JSON Backup
          </button>

          <button
            onClick={() => generateUserGuidePDF(schoolName)}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download User Manual & Feature Guide PDF"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>User Manual PDF</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 text-xs font-black rounded-xl"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* SUB-COMPONENT NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {STAKEHOLDER_TABS.map(tab => {
          const count = countByStakeholder(tab.id);
          const isSelected = selectedTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isSelected 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search respondent name, phone, email, city, comments..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Mode Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-bold text-slate-600">Mode:</span>
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Modes (Full & Express)</option>
            <option value="full_diagnostic">Full Diagnostic</option>
            <option value="express">Express 5-Q Core</option>
          </select>
        </div>

        {/* Results Counter */}
        <div className="text-slate-500 font-bold shrink-0 text-[11px]">
          Showing <span className="text-indigo-600 font-black">{filteredSubmissions.length}</span> of {submissions.length} total records
        </div>
      </div>

      {/* DATA TABLE */}
      {loading ? (
        <div className="p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-extrabold text-slate-600">Loading live stakeholder submissions...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-black text-slate-800">No Submissions Found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery 
              ? `No respondents matched your search query "${searchQuery}". Try clearing filters.` 
              : `No survey records have been submitted yet for the selected sub-component. Use the public share link to gather stakeholder inputs.`
            }
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-black text-[11px] uppercase tracking-wider">
                <th className="p-3.5">Respondent & Role</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">School / City</th>
                <th className="p-3.5">DPDP Status</th>
                <th className="p-3.5">Score</th>
                <th className="p-3.5">Qualitative Feedback</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
              {filteredSubmissions.map(rec => {
                const avgScore = calculateAvgScore(rec.rawAnswers);
                return (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* RESPONDENT & ROLE */}
                    <td className="p-3.5 space-y-0.5">
                      <span className="font-extrabold text-slate-900 block text-xs">
                        {rec.respondent?.fullName || 'Anonymous Respondent'}
                      </span>
                      <span className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded border border-indigo-150">
                        {rec.stakeholderLabel || rec.stakeholder}
                      </span>
                    </td>

                    {/* CONTACT */}
                    <td className="p-3.5 space-y-0.5 text-[11px]">
                      <div className="flex items-center gap-1 text-slate-800 font-semibold">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{rec.respondent?.contactNumber || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{rec.respondent?.email || 'N/A'}</span>
                      </div>
                    </td>

                    {/* SCHOOL & CITY & CLASS */}
                    <td className="p-3.5 space-y-0.5 text-[11px]">
                      <span className="font-bold text-slate-800 block">
                        {rec.respondent?.schoolName || schoolName}
                      </span>
                      <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                        <span className="bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded border border-slate-200">
                          {rec.respondent?.board || rec.board || activeSchool?.board || 'CBSE'}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 text-slate-400" />
                          {rec.respondent?.city || city}
                        </span>
                      </div>
                      {(rec.respondent?.classGrade || rec.respondent?.sectionDept) && (
                        <div className="text-[10px] font-extrabold text-amber-800 bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200/80 inline-block mt-0.5">
                          {rec.respondent?.classGrade || ''} {rec.respondent?.sectionDept ? `(${rec.respondent.sectionDept})` : ''}
                        </div>
                      )}
                    </td>

                    {/* DPDP STATUS */}
                    <td className="p-3.5">
                      {rec.dpdpConsent ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Consent
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                          Pending
                        </span>
                      )}
                      <span className="block text-[9px] text-slate-400 mt-0.5">
                        {rec.submittedAt ? new Date(rec.submittedAt).toLocaleDateString('en-IN') : ''}
                      </span>
                    </td>

                    {/* SCORE */}
                    <td className="p-3.5">
                      <span className="inline-block bg-slate-900 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                        {avgScore} / 5.0
                      </span>
                    </td>

                    {/* QUALITATIVE FEEDBACK */}
                    <td className="p-3.5 max-w-xs">
                      {rec.qualitativeFeedback ? (
                        <p className="text-[11px] text-slate-600 italic line-clamp-2">
                          "{rec.qualitativeFeedback}"
                        </p>
                      ) : (
                        <span className="text-[10px] text-slate-400">No feedback submitted</span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => setSelectedRecord(rec)}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        title="View Submission Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBMISSION INSPECTOR MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="bg-indigo-100 text-indigo-900 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Detailed Submission Audit
                </span>
                <h3 className="text-xl font-black text-slate-900 pt-1">
                  {selectedRecord.respondent?.fullName || 'Stakeholder Submission'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedRecord.stakeholderLabel} • Submitted on {new Date(selectedRecord.submittedAt).toLocaleString('en-IN')}
                </p>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-black p-1"
              >
                ✕
              </button>
            </div>

            {/* Respondent Profile Details */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <User className="w-4 h-4 text-indigo-600" /> Respondent Verified Profile
              </h4>
              <div className="grid grid-cols-2 gap-3 text-slate-700 font-medium">
                <div><span className="font-extrabold text-slate-900">Full Name:</span> {selectedRecord.respondent?.fullName}</div>
                <div><span className="font-extrabold text-slate-900">Mobile Phone:</span> {selectedRecord.respondent?.contactNumber}</div>
                <div><span className="font-extrabold text-slate-900">Email Address:</span> {selectedRecord.respondent?.email}</div>
                <div><span className="font-extrabold text-slate-900">School Name:</span> {selectedRecord.respondent?.schoolName}</div>
                <div><span className="font-extrabold text-slate-900">Board Affiliation:</span> {selectedRecord.respondent?.board || selectedRecord.board || activeSchool?.board || 'CBSE'}</div>
                <div><span className="font-extrabold text-slate-900">City / Location:</span> {selectedRecord.respondent?.city}</div>
                <div><span className="font-extrabold text-slate-900">Class / Grade:</span> {selectedRecord.respondent?.classGrade || 'N/A'}</div>
                <div><span className="font-extrabold text-slate-900">Section / Department:</span> {selectedRecord.respondent?.sectionDept || 'N/A'}</div>
                <div><span className="font-extrabold text-slate-900">Survey Mode:</span> {selectedRecord.modeUsed === 'express' ? 'Express 5-Q' : 'Full Diagnostic'}</div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-[11px] text-emerald-800 font-bold">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>DPDP Act 2023 Explicit Consent Granted on {new Date(selectedRecord.dpdpConsentTimestamp || selectedRecord.submittedAt).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Qualitative Feedback */}
            {selectedRecord.qualitativeFeedback && (
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-1 text-xs">
                <h4 className="font-black text-amber-950 text-xs flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-600" /> Qualitative Feedback & Strategic Observations
                </h4>
                <p className="text-slate-700 italic font-medium leading-relaxed">
                  "{selectedRecord.qualitativeFeedback}"
                </p>
              </div>
            )}

            {/* Answers Breakdown */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">Diagnostic Item Ratings</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {Object.entries(selectedRecord.rawAnswers || {}).map(([qId, val]) => (
                  <div key={qId} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Question Item: {qId}</span>
                    <span className="bg-slate-900 text-white font-black text-xs px-2.5 py-1 rounded-lg">
                      Score: {val} / 5
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 text-xs">
              <button
                onClick={() => downloadCSV([selectedRecord], `Submission_${selectedRecord.respondent?.fullName || selectedRecord.id}`)}
                className="px-4 py-2 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export Record CSV
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-black rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { 
  FileText,
  Users,
  ArrowRight, 
  CheckCircle2, 
  Server, 
  Database, 
  LineChart, 
  X,
  Send,
  Link2,
  MessageCircle,
  Mail,
  QrCode,
  Sparkles,
  RefreshCw,
  Check,
  Copy,
  ShieldCheck,
  Award,
  BookOpen,
  HeartHandshake,
  Printer
} from 'lucide-react';
import { useAppStore } from '../store';
import { SURVEY_QUESTIONS } from '../components/DeepDiveAssessment';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ObjectiveDataCapture } from '../components/CaptureStage/ObjectiveDataCapture';
import { DiagnosticReport } from '../components/MultiUserAssessment';
import { listAssessmentEventsForSchool } from '../lib/assessmentEventService';
import { checkObjectiveDataReadiness } from '../lib/objectiveDataService';

interface StakeholderItem {
  roleKey: 'leader' | 'teacher' | 'parent' | 'student' | 'admin' | 'other';
  label: string;
  desc: string;
  respondents: string;
  progress: number;
  status: 'Completed' | 'In Progress' | 'Pending Launch';
  icon: React.ElementType;
  color: string;
}

export const CaptureStage = () => {
  const { dimensions, activeSchool, customDomain } = useAppStore();

  // Modals state
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [deployTab, setDeployTab] = useState<'links' | 'campaign' | 'qrcode'>('links');

  // Diagnostic Analysis (subjective + objective + gap analysis) modal state
  const [reportEvent, setReportEvent] = useState<{ id: string; eventName: string } | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportLoadError, setReportLoadError] = useState('');

  const handleOpenDiagnosticAnalysis = async () => {
    if (!activeSchool?.id) {
      setReportLoadError('Select a school first.');
      return;
    }
    setIsLoadingReport(true);
    setReportLoadError('');
    try {
      const events = await listAssessmentEventsForSchool(activeSchool.id);
      if (events.length === 0) {
        setReportLoadError('No 14D assessment event found yet for this school. Create one first.');
        return;
      }
      const eventId = events[0].id;
      const readiness = await checkObjectiveDataReadiness(eventId);
      if (!readiness.isReady) {
        setReportLoadError(
          `Objective operational data is required first (${readiness.completeness}% complete). Missing required data for: ${readiness.missingByDimension
            .map((d) => d.dimensionName)
            .join(', ')} — see Operational Data Sync above.`
        );
        return;
      }
      setReportEvent({ id: eventId, eventName: events[0].eventName });
    } catch (err) {
      console.error('Failed to load assessment events for diagnostic analysis:', err);
      setReportLoadError('Could not load assessment data. Please try again.');
    } finally {
      setIsLoadingReport(false);
    }
  };
  
  // Active Survey Questionnaire Modal state
  const [activeSurveyRole, setActiveSurveyRole] = useState<'leader' | 'teacher' | 'parent' | 'student' | 'admin' | 'other' | null>(null);
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, number>>({});
  const [qualitativeFeedback, setQualitativeFeedback] = useState('');
  const [respondentName, setRespondentName] = useState('');
  const [respondentEmail, setRespondentEmail] = useState('');
  const [dpdpConsent, setDpdpConsent] = useState(true);
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false);

  // Copied toast state
  const [copiedRole, setCopiedRole] = useState<string | null>(null);

  // Campaign execution state
  const [isCampaignRunning, setIsCampaignRunning] = useState(false);
  const [campaignLogs, setCampaignLogs] = useState<string[]>([]);
  const [campaignCompleted, setCampaignCompleted] = useState(false);
  const [selectedCampaignTargets, setSelectedCampaignTargets] = useState<Record<string, boolean>>({
    leader: true,
    teacher: true,
    parent: true,
    student: true,
    admin: true,
    other: true
  });
  const [campaignDeliveryChannel, setCampaignDeliveryChannel] = useState<'email' | 'whatsapp' | 'sms' | 'qr'>('whatsapp');

  // Stakeholders state
  const [stakeholders, setStakeholders] = useState<Record<'leader' | 'teacher' | 'parent' | 'student' | 'admin' | 'other', StakeholderItem>>({
    leader: { 
      roleKey: 'leader', 
      label: 'School Owner / Leader', 
      desc: 'Governance, SQAAF compliance & strategic vision audit', 
      respondents: '1/1', 
      progress: 100, 
      status: 'Completed',
      icon: Award,
      color: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    teacher: { 
      roleKey: 'teacher', 
      label: 'Teaching Staff', 
      desc: 'Faculty credentials, CPD hours & workload pulse', 
      respondents: '42/50', 
      progress: 84, 
      status: 'In Progress',
      icon: BookOpen,
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    },
    parent: { 
      roleKey: 'parent', 
      label: 'Parents', 
      desc: 'Query SLA, fee satisfaction & communication trust', 
      respondents: '150/400', 
      progress: 37, 
      status: 'In Progress',
      icon: HeartHandshake,
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    student: { 
      roleKey: 'student', 
      label: 'Students (Grade 8-12)', 
      desc: 'Classroom engagement, bullying safety & sports access', 
      respondents: '0/800', 
      progress: 0, 
      status: 'Pending Launch',
      icon: Users,
      color: 'bg-amber-100 text-amber-700 border-amber-200'
    },
    admin: { 
      roleKey: 'admin', 
      label: 'Administrative & Ops Staff', 
      desc: 'Facility uptime, fire safety & procurement SLA', 
      respondents: '12/15', 
      progress: 80, 
      status: 'In Progress',
      icon: Server,
      color: 'bg-rose-100 text-rose-700 border-rose-200'
    },
    other: { 
      roleKey: 'other', 
      label: 'Alumni & Community Network', 
      desc: 'Higher ed placement, brand perception & CSR impact', 
      respondents: '45/120', 
      progress: 38, 
      status: 'In Progress',
      icon: ShieldCheck,
      color: 'bg-teal-100 text-teal-700 border-teal-200'
    }
  });

  const getSurveyUrl = (roleKey: string) => {
    const baseUrl = customDomain ? `https://${customDomain}` : (typeof window !== 'undefined' ? window.location.origin : 'https://disha.rylneuroacademy.com');
    const schoolId = activeSchool?.id || 'sch_default';
    return `${baseUrl}?survey=${roleKey}&school=${schoolId}`;
  };

  const handleCopyLink = (roleKey: string) => {
    const url = getSurveyUrl(roleKey);
    navigator.clipboard.writeText(url);
    setCopiedRole(roleKey);
    setTimeout(() => setCopiedRole(null), 2500);
  };

  const handleWhatsAppShare = (roleKey: string, label: string) => {
    const url = getSurveyUrl(roleKey);
    const schoolName = activeSchool?.name || 'School';
    const text = `Official DISHA Diagnostic Survey for ${schoolName} (${label}). Please complete your diagnostic feedback here: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleEmailShare = (roleKey: string, label: string) => {
    const url = getSurveyUrl(roleKey);
    const schoolName = activeSchool?.name || 'School';
    const subject = `DISHA Diagnostic Survey Link: ${label} - ${schoolName}`;
    const body = `Dear Stakeholder,\n\nYou are invited to participate in the DISHA Diagnostic Framework evaluation for ${schoolName}.\n\nPlease access your confidential diagnostic survey link below:\n${url}\n\nThis survey complies strictly with DPDP Act 2023 regulations.`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const handleOpenSurveyModal = (roleKey: 'leader' | 'teacher' | 'parent' | 'student' | 'admin' | 'other') => {
    setActiveSurveyRole(roleKey);
    const config = SURVEY_QUESTIONS[roleKey];
    const initialRatings: Record<string, number> = {};
    config.questions.forEach(q => {
      initialRatings[q.id] = 4;
    });
    setSurveyAnswers(initialRatings);
    setQualitativeFeedback('');
    setRespondentName('');
    setRespondentEmail('');
    setDpdpConsent(true);
  };

  const handleSimulateSurvey = (roleKey: 'leader' | 'teacher' | 'parent' | 'student' | 'admin' | 'other') => {
    setStakeholders(prev => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        progress: 100,
        status: 'Completed',
        respondents: prev[roleKey].respondents.replace(/^\d+/, prev[roleKey].respondents.split('/')[1])
      }
    }));

    if (activeSchool?.id) {
      const config = SURVEY_QUESTIONS[roleKey];
      const mockRawAnswers: Record<string, number> = {};
      const sums: Record<string, number> = {};
      const counts: Record<string, number> = {};

      config.questions.forEach(q => {
        const val = Math.floor(Math.random() * 2) + 4; // 4 or 5
        mockRawAnswers[q.id] = val;
        const actualId = (q as any).id_actual || q.id;
        const currSum = sums[actualId] ?? 0;
        const currCount = counts[actualId] ?? 0;
        sums[actualId] = currSum + val;
        counts[actualId] = currCount + 1;
      });

      const avgMap: Record<string, number> = {};
      Object.keys(sums).forEach(actualId => {
        avgMap[actualId] = Math.round((sums[actualId] / counts[actualId]) * 10) / 10;
      });

      setDoc(doc(db, `surveys_${activeSchool.id}`, roleKey), {
        answers: avgMap,
        rawAnswers: mockRawAnswers,
        submittedAt: new Date().toISOString(),
        simulated: true
      }, { merge: true }).catch(err => console.warn("Firestore write fallback:", err));
    }
  };

  const handleSubmitSurveyForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurveyRole) return;

    setIsSubmittingSurvey(true);
    const roleKey = activeSurveyRole;
    const config = SURVEY_QUESTIONS[roleKey];

    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};

    Object.entries(surveyAnswers).forEach(([qId, val]) => {
      const qObj = (config.questions as Array<{ id: string; id_actual?: string }>).find(q => q.id === qId);
      const actualId = qObj?.id_actual || qId;
      const currSum = sums[actualId] ?? 0;
      const currCount = counts[actualId] ?? 0;
      sums[actualId] = currSum + Number(val);
      counts[actualId] = currCount + 1;
    });

    const avgMap: Record<string, number> = {};
    Object.keys(sums).forEach(actualId => {
      avgMap[actualId] = Math.round((sums[actualId] / counts[actualId]) * 10) / 10;
    });

    if (activeSchool?.id) {
      try {
        await setDoc(doc(db, `surveys_${activeSchool.id}`, roleKey), {
          answers: avgMap,
          rawAnswers: surveyAnswers,
          qualitativeFeedback,
          respondent: {
            fullName: respondentName || 'Direct App Respondent',
            email: respondentEmail || 'N/A'
          },
          dpdpConsent,
          submittedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn("Error submitting survey:", err);
      }
    }

    setStakeholders(prev => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        progress: 100,
        status: 'Completed',
        respondents: prev[roleKey].respondents.replace(/^\d+/, prev[roleKey].respondents.split('/')[1])
      }
    }));

    setIsSubmittingSurvey(false);
    setActiveSurveyRole(null);
  };

  const handleLaunchCampaign = () => {
    setIsCampaignRunning(true);
    setCampaignCompleted(false);
    setCampaignLogs([]);

    const steps = [
      "Initializing DPDP Act 2023 compliance consent framework...",
      "Generating secure encrypted survey session tokens...",
      `Configuring distribution channels: ${campaignDeliveryChannel.toUpperCase()} gateway active...`,
      "Mapping 14 EWISR parameters with school database contacts...",
      "Broadcasting unique diagnostic links to selected target groups...",
      "Dispatch campaign launched successfully! Real-time responses active."
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setCampaignLogs(prev => [...prev, steps[current]]);
        current++;
      } else {
        clearInterval(interval);
        setIsCampaignRunning(false);
        setCampaignCompleted(true);
        // Mark targeted stakeholders as launched
        setStakeholders(prev => {
          const updated = { ...prev };
          Object.keys(selectedCampaignTargets).forEach(k => {
            const rKey = k as 'leader' | 'teacher' | 'parent' | 'student' | 'admin' | 'other';
            if (selectedCampaignTargets[rKey] && updated[rKey].status === 'Pending Launch') {
              updated[rKey] = {
                ...updated[rKey],
                status: 'In Progress',
                progress: Math.max(15, updated[rKey].progress)
              };
            }
          });
          return updated;
        });
      }
    }, 500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Stage 1: Capture (Assess)</h2>
          <p className="text-gray-500 mt-1">Comprehensive data collection and deployment across 14 DISHA diagnostic dimensions.</p>
        </div>
        {activeSchool && (
          <div className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl text-xs text-indigo-900 flex items-center gap-2">
            <span className="font-extrabold text-indigo-950">{activeSchool.name}</span>
            <span className="text-indigo-400">|</span>
            <span className="font-bold">{activeSchool.board}</span>
            <span className="text-indigo-400">|</span>
            <span className="text-indigo-700">{activeSchool.city}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Stakeholder Diagnostic Deployments</h3>
                <p className="text-gray-500 text-sm">Multilateral survey dispatches with unique links, WhatsApp, and SMS channels.</p>
              </div>
              <button 
                onClick={() => setIsDeployModalOpen(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Deploy & Share Console
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.values(stakeholders) as StakeholderItem[]).map((survey) => {
                const IconComponent = survey.icon;
                const isCopied = copiedRole === survey.roleKey;
                return (
                  <div key={survey.roleKey} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between space-y-4 hover:border-gray-200 transition-all">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${survey.color}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm leading-tight">{survey.label}</p>
                            <p className="text-xs text-gray-500">{survey.respondents} Respondents</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                          survey.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          survey.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {survey.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">{survey.desc}</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-bold text-gray-700">
                          <span>Completion Rate</span>
                          <span>{survey.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${survey.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${survey.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Direct Dispatch & Share Toolbar */}
                      <div className="pt-2 border-t border-gray-200/60 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyLink(survey.roleKey)}
                            className="p-2 bg-white hover:bg-slate-100 border border-gray-200 rounded-lg text-gray-700 transition-colors cursor-pointer flex items-center gap-1"
                            title="Copy Survey Link"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5" />}
                            <span className="text-[11px] font-bold">{isCopied ? 'Copied' : 'Link'}</span>
                          </button>

                          <button
                            onClick={() => handleWhatsAppShare(survey.roleKey, survey.label)}
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Share via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[11px] font-bold">WhatsApp</span>
                          </button>

                          <button
                            onClick={() => handleEmailShare(survey.roleKey, survey.label)}
                            className="p-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Share via Email"
                          >
                            <Mail className="w-3.5 h-3.5 text-sky-600" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenSurveyModal(survey.roleKey)}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            🗳️ Fill Survey
                          </button>

                          <button
                            onClick={() => handleSimulateSurvey(survey.roleKey)}
                            className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                            title="Simulate sample test data"
                          >
                            ⚡
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                          <span className="text-gray-700 font-medium">{dim.name}</span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Verified
                          </span>
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
            <p className="text-gray-500 text-sm mb-6">
              Capture real operational data per dimension to independently verify stakeholder perception against
              actual school data.
            </p>

            <ObjectiveDataCapture schoolId={activeSchool?.id || ''} schoolName={activeSchool?.name || ''} />
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-sm border border-slate-700 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/30 p-2 rounded-lg">
                <LineChart className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Assessment Data Collection Status</h3>
                <p className="text-xs text-slate-400 mt-0.5">Multi-stakeholder feedback validation</p>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
              <p className="text-sm text-slate-300 leading-relaxed">
                Your school has collected feedback across the 14 EWISR diagnostic dimensions from multiple stakeholder groups (teachers, parents, students, admin, other).
              </p>
              <p className="text-xs text-slate-400">
                <strong>Status Check:</strong> When you have captured responses from all stakeholder groups you wish to assess, you can proceed to generate a comprehensive gap analysis report comparing stakeholder perceptions against national benchmarks.
              </p>
            </div>
            <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-xs text-blue-300 font-medium">
                💡 Tip: Ensure responses have been collected from at least your primary stakeholder groups (teachers & admin) before generating the diagnostic report.
              </p>
            </div>
            <button
              onClick={handleOpenDiagnosticAnalysis}
              disabled={isLoadingReport}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors text-sm shadow-[0_0_15px_rgba(37,99,235,0.3)] cursor-pointer disabled:opacity-60"
            >
              {isLoadingReport ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Proceed to Diagnostic Analysis
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            {reportLoadError && <p className="text-xs text-red-400 text-center mt-2">{reportLoadError}</p>}
          </div>
        </div>
      </div>

      {/* DIAGNOSTIC ANALYSIS MODAL (subjective + objective + gap analysis) */}
      {reportEvent && activeSchool && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-5xl my-8 p-6">
            <DiagnosticReport
              assessmentId={reportEvent.id}
              eventName={reportEvent.eventName}
              schoolName={activeSchool.name}
              onBack={() => setReportEvent(null)}
            />
          </div>
        </div>
      )}

      {/* DEPLOYMENT & SHARE CONSOLE MODAL */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/30 rounded-xl border border-blue-400/30 text-blue-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">DISHA Multilateral Survey Dispatch Portal</h3>
                  <p className="text-xs text-slate-300">Deploy diagnostic URLs with DPDP Act 2023 compliance tracking</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDeployModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50 px-6 pt-3 gap-2">
              <button
                onClick={() => setDeployTab('links')}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  deployTab === 'links'
                    ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Link2 className="w-4 h-4" />
                Shareable Diagnostic Links
              </button>
              <button
                onClick={() => setDeployTab('campaign')}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  deployTab === 'campaign'
                    ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Bulk Campaign Dispatch
              </button>
              <button
                onClick={() => setDeployTab('qrcode')}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  deployTab === 'qrcode'
                    ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <QrCode className="w-4 h-4" />
                Printable QR Code Poster
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {deployTab === 'links' && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    Select any stakeholder category to dispatch unique diagnostic URLs directly via WhatsApp, Email, or Clipboard copy. Each link captures feedback directly into your school's secure Firestore database.
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    {(Object.values(stakeholders) as StakeholderItem[]).map((st) => {
                      const url = getSurveyUrl(st.roleKey);
                      const isCopied = copiedRole === st.roleKey;
                      return (
                        <div key={st.roleKey} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1 max-w-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-gray-900">{st.label}</span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                st.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {st.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate font-mono bg-white px-2 py-1 rounded border border-gray-200">
                              {url}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleCopyLink(st.roleKey)}
                              className="px-3 py-2 bg-white hover:bg-slate-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              {isCopied ? 'Copied!' : 'Copy Link'}
                            </button>

                            <button
                              onClick={() => handleWhatsAppShare(st.roleKey, st.label)}
                              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-white" />
                              WhatsApp
                            </button>

                            <button
                              onClick={() => handleOpenSurveyModal(st.roleKey)}
                              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              🗳️ Test
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {deployTab === 'campaign' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Select Target Stakeholders</h4>
                    <p className="text-xs text-gray-500 mb-3">Choose target groups for broadcast dispatch.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(Object.values(stakeholders) as StakeholderItem[]).map((st) => (
                        <label key={st.roleKey} className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer text-xs font-bold text-gray-800">
                          <input 
                            type="checkbox" 
                            checked={!!selectedCampaignTargets[st.roleKey]}
                            onChange={(e) => setSelectedCampaignTargets(prev => ({ ...prev, [st.roleKey]: e.target.checked }))}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                          />
                          {st.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Delivery Channel Gateway</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'whatsapp', label: 'WhatsApp Broadcast', icon: MessageCircle },
                        { id: 'email', label: 'Email Invites', icon: Mail },
                        { id: 'sms', label: 'SMS Carrier Link', icon: Send }
                      ].map((ch) => {
                        const ChIcon = ch.icon;
                        const isSel = campaignDeliveryChannel === ch.id;
                        return (
                          <button
                            key={ch.id}
                            onClick={() => setCampaignDeliveryChannel(ch.id as any)}
                            className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                              isSel ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <ChIcon className="w-4 h-4" />
                            {ch.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Campaign Terminal Log Box */}
                  {campaignLogs.length > 0 && (
                    <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-xl space-y-1 border border-slate-800 max-h-48 overflow-y-auto">
                      {campaignLogs.map((log, idx) => (
                        <p key={idx} className="flex items-center gap-2">
                          <span className="text-slate-500">&gt;</span>
                          <span>{log}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {campaignCompleted && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900 font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Campaign successfully executed! Registered contacts received secure survey links.</span>
                    </div>
                  )}

                  <button
                    onClick={handleLaunchCampaign}
                    disabled={isCampaignRunning}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isCampaignRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {isCampaignRunning ? 'Dispatching Campaign...' : 'Broadcast Diagnostic Campaign Now'}
                  </button>
                </div>
              )}

              {deployTab === 'qrcode' && (
                <div className="space-y-6 text-center">
                  <div className="p-6 bg-slate-50 border border-gray-200 rounded-2xl max-w-md mx-auto space-y-4">
                    <div className="p-3 bg-indigo-900 text-white rounded-xl inline-block">
                      <QrCode className="w-16 h-16 text-indigo-300 mx-auto" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-gray-900">{activeSchool?.name || 'School'} Diagnostic QR Code</h4>
                      <p className="text-xs text-gray-500 mt-1">Scan with any smartphone camera to open the multilateral stakeholder evaluation portal.</p>
                    </div>
                    <div className="p-3 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-700 truncate">
                      {getSurveyUrl('general')}
                    </div>
                    <button 
                      onClick={() => window.print()}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      Print Notice Board Poster
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setIsDeployModalOpen(false)}
                className="px-5 py-2 font-bold text-xs text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE QUESTIONNAIRE MODAL */}
      {activeSurveyRole && (() => {
        const config = SURVEY_QUESTIONS[activeSurveyRole];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-900 text-white">
                <div>
                  <h3 className="text-lg font-bold text-white">{config.title}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{config.desc}</p>
                </div>
                <button 
                  onClick={() => setActiveSurveyRole(null)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitSurveyForm} className="p-6 overflow-y-auto space-y-6 flex-1">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs text-indigo-900 uppercase tracking-wider">Respondent Metadata</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Full Name (Optional)"
                      value={respondentName}
                      onChange={(e) => setRespondentName(e.target.value)}
                      className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <input 
                      type="email" 
                      placeholder="Email Address (Optional)"
                      value={respondentEmail}
                      onChange={(e) => setRespondentEmail(e.target.value)}
                      className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  {config.questions.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {q.label}
                        </span>
                        <span className="text-xs text-gray-400 font-semibold">Q{idx + 1} of {config.questions.length}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{q.text}</p>

                      <div className="space-y-2 pt-1">
                        {q.options.map(opt => {
                          const isSel = surveyAnswers[q.id] === opt.val;
                          return (
                            <label key={opt.val} className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                              isSel ? 'border-indigo-600 bg-indigo-50/60 font-bold text-indigo-950' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                            }`}>
                              <input 
                                type="radio" 
                                name={`q_${q.id}`} 
                                checked={isSel}
                                onChange={() => setSurveyAnswers(prev => ({ ...prev, [q.id]: opt.val }))}
                                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span>{opt.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">Qualitative Feedback (Optional)</label>
                  <textarea 
                    rows={3}
                    placeholder="Provide any additional comments or diagnostic context for the leadership..."
                    value={qualitativeFeedback}
                    onChange={(e) => setQualitativeFeedback(e.target.value)}
                    className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <label className="flex items-start gap-2 cursor-pointer text-xs text-gray-600">
                  <input 
                    type="checkbox" 
                    checked={dpdpConsent}
                    onChange={(e) => setDpdpConsent(e.target.checked)}
                    className="mt-0.5 text-indigo-600 rounded"
                  />
                  <span>I consent to data processing under DPDP Act 2023 for diagnostic analysis.</span>
                </label>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setActiveSurveyRole(null)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmittingSurvey}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    {isSubmittingSurvey ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Submit Questionnaire
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

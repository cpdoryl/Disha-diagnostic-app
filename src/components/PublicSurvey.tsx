import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { SURVEY_QUESTIONS } from './DeepDiveAssessment';
import { Shield, CheckCircle2, Award, Sparkles, Volume2, Languages, Zap, MessageSquare, AlertCircle, User, Phone, Mail, Building2, MapPin, Lock, BookOpen, Layers } from 'lucide-react';

export const PublicSurvey = ({ stakeholder, aid }: { stakeholder: string, aid: string }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bilingualMode, setBilingualMode] = useState(false);
  const [expressMode, setExpressMode] = useState(false);
  const [qualitativeFeedback, setQualitativeFeedback] = useState('');
  const [readingQId, setReadingQId] = useState<string | null>(null);

  // School Metadata from Registration
  const [registeredSchool, setRegisteredSchool] = useState<{
    name: string;
    city: string;
    board: string;
  } | null>(null);

  // Respondent Personal Details (DPDP Act 2023 Compliant)
  const [respondent, setRespondent] = useState({
    fullName: '',
    contactNumber: '',
    email: '',
    schoolName: '',
    board: '',
    city: '',
    classGrade: '',
    sectionDept: ''
  });
  const [dpdpConsent, setDpdpConsent] = useState(false);

  const draftKey = `disha_survey_draft_${aid}_${stakeholder}`;
  const config = (SURVEY_QUESTIONS as any)[stakeholder];

  // Load school registration data from local cache or Firestore
  useEffect(() => {
    if (!aid) return;

    // 1. Check local registered schools cache
    let foundLocal = false;
    try {
      const saved = localStorage.getItem('disha_registered_schools');
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = parsed.find((s: any) => s.id === aid);
        if (match) {
          foundLocal = true;
          setRegisteredSchool({
            name: match.name || '',
            city: match.city || '',
            board: match.board || 'CBSE'
          });
          setRespondent(prev => ({
            ...prev,
            schoolName: match.name || prev.schoolName,
            board: match.board || prev.board || 'CBSE',
            city: match.city || prev.city
          }));
        }
      }
    } catch (e) {}

    // 2. Fetch from Firestore for remote public survey access
    const fetchSchoolDoc = async () => {
      try {
        const snap = await getDoc(doc(db, 'schools', aid));
        if (snap.exists()) {
          const d = snap.data();
          const schName = d.name || '';
          const schCity = d.city || '';
          const schBoard = d.board || 'CBSE';
          setRegisteredSchool({ name: schName, city: schCity, board: schBoard });
          setRespondent(prev => ({
            ...prev,
            schoolName: schName || prev.schoolName,
            board: schBoard || prev.board,
            city: schCity || prev.city
          }));
        }
      } catch (e) {
        console.warn("Could not fetch school registration details:", e);
      }
    };

    fetchSchoolDoc();
  }, [aid]);

  // Load auto-saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setAnswers(parsed.answers || {});
          if (parsed.qualitativeFeedback) setQualitativeFeedback(parsed.qualitativeFeedback);
          if (parsed.respondent) setRespondent(parsed.respondent);
          if (parsed.dpdpConsent) setDpdpConsent(parsed.dpdpConsent);
        }
      }
    } catch (e) {
      console.warn("Could not load draft from localStorage", e);
    }
  }, [draftKey]);

  // Auto-save draft on answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0 || respondent.fullName) {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ answers, qualitativeFeedback, respondent, dpdpConsent }));
      } catch (e) {
        // ignore
      }
    }
  }, [answers, qualitativeFeedback, respondent, dpdpConsent, draftKey]);

  if (!config) {
    return <div className="p-10 text-center text-red-600 font-bold">Invalid Survey Link</div>;
  }

  // Filter questions if express mode is enabled (selects first question per section/dimension)
  const allQuestions = config.questions;
  const questionsToRender = expressMode 
    ? allQuestions.filter((q: any, idx: number) => {
        if (idx === 0) return true;
        const prevQ = allQuestions[idx - 1];
        return q.section && prevQ.section !== q.section;
      })
    : allQuestions;

  const answeredCount = questionsToRender.filter((q: any) => answers[q.id] !== undefined).length;
  const totalQuestions = questionsToRender.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Check straightlining bias
  const answeredVals = Object.values(answers);
  const isStraightLining = answeredVals.length >= 5 && answeredVals.every(v => v === answeredVals[0]);

  const handleSpeakQuestion = (q: any) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    if (readingQId === q.id) {
      setReadingQId(null);
      return;
    }

    const textToRead = `${q.label}. ${q.text}. Options are: ${q.options.map((o: any) => o.label).join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.onend = () => setReadingQId(null);
    utterance.onerror = () => setReadingQId(null);
    setReadingQId(q.id);
    window.speechSynthesis.speak(utterance);
  };

  const isRespondentDetailsValid = 
    respondent.fullName.trim() !== '' &&
    respondent.contactNumber.trim() !== '' &&
    respondent.email.trim() !== '' &&
    respondent.schoolName.trim() !== '' &&
    respondent.city.trim() !== '' &&
    dpdpConsent;

  const handleSubmit = async () => {
    if (!isRespondentDetailsValid) {
      alert("Please complete all personal details and accept the DPDP Act consent before submitting.");
      return;
    }

    setLoading(true);
    try {
      const actualAnswersSum: Record<string, number> = {};
      const countMap: Record<string, number> = {};

      allQuestions.forEach((q: any) => {
        const actualId = q.id_actual || q.id;
        const score = answers[q.id] || 4;
        if (!actualAnswersSum[actualId]) {
          actualAnswersSum[actualId] = 0;
          countMap[actualId] = 0;
        }
        actualAnswersSum[actualId] += score;
        countMap[actualId] += 1;
      });

      const actualAnswersAvg: Record<string, number> = {};
      Object.keys(actualAnswersSum).forEach(key => {
        actualAnswersAvg[key] = Math.round((actualAnswersSum[key] / countMap[key]) * 10) / 10;
      });

      await setDoc(doc(db, `surveys_${aid}`, stakeholder), {
        answers: actualAnswersAvg,
        rawAnswers: answers,
        qualitativeFeedback: qualitativeFeedback.trim(),
        respondent: {
          fullName: respondent.fullName.trim(),
          contactNumber: respondent.contactNumber.trim(),
          email: respondent.email.trim(),
          schoolName: respondent.schoolName.trim(),
          board: respondent.board.trim(),
          city: respondent.city.trim(),
          classGrade: respondent.classGrade.trim(),
          sectionDept: respondent.sectionDept.trim()
        },
        dpdpConsent: true,
        dpdpConsentTimestamp: new Date().toISOString(),
        modeUsed: expressMode ? 'express' : 'full_diagnostic',
        submittedAt: new Date().toISOString()
      }, { merge: true });

      // Save individual submission record to submissions collection
      const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const submissionRecord = {
        id: submissionId,
        schoolId: aid,
        schoolName: respondent.schoolName.trim(),
        board: respondent.board.trim(),
        city: respondent.city.trim(),
        stakeholder: stakeholder as any,
        stakeholderLabel: config.title || stakeholder,
        respondent: {
          fullName: respondent.fullName.trim(),
          contactNumber: respondent.contactNumber.trim(),
          email: respondent.email.trim(),
          schoolName: respondent.schoolName.trim(),
          board: respondent.board.trim(),
          city: respondent.city.trim(),
          classGrade: respondent.classGrade.trim(),
          sectionDept: respondent.sectionDept.trim()
        },
        rawAnswers: answers,
        calculatedScores: actualAnswersAvg,
        qualitativeFeedback: qualitativeFeedback.trim(),
        dpdpConsent: true,
        dpdpConsentTimestamp: new Date().toISOString(),
        modeUsed: expressMode ? 'express' : 'full_diagnostic',
        submittedAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, `surveys_${aid}_submissions`, submissionId), submissionRecord);
      } catch (e) {
        console.warn("Firestore submission doc write error:", e);
      }

      // Also cache in local storage for instant offline retrieval
      try {
        const localKey = `disha_submissions_${aid}`;
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        localStorage.setItem(localKey, JSON.stringify([submissionRecord, ...existing]));
      } catch (e) {}

      // Clear draft after successful submission
      try {
        localStorage.removeItem(draftKey);
      } catch (e) {}

      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Error submitting survey. Please check your network connection.");
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center max-w-md space-y-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Assessment Submitted</h2>
          <p className="text-slate-600 font-medium text-sm leading-relaxed">
            Thank you for completing the strategic diagnostic survey. Your responses have been encrypted and submitted under DPDP Act 2023 compliance protocols.
          </p>
          <div className="pt-2 text-xs text-indigo-600 font-bold bg-indigo-50 p-3 rounded-2xl border border-indigo-150">
            DISHA Diagnostic Engine Updated
          </div>
        </div>
      </div>
    );
  }

  let lastSection = '';

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex justify-center">
      <div className="max-w-3xl w-full space-y-6">
        
        {/* SURVEY HEADER */}
        <div className="bg-indigo-600 p-6 sm:p-8 rounded-3xl text-white space-y-4 shadow-lg relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-widest">
              <Shield className="w-4 h-4 text-indigo-300" />
              <span>Secure DPDP Compliant Channel</span>
            </div>

            {/* TOGGLES HEADER */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBilingualMode(!bilingualMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  bilingualMode 
                    ? 'bg-amber-400 text-indigo-950 shadow-sm' 
                    : 'bg-indigo-700/80 hover:bg-indigo-700 text-indigo-100'
                }`}
                title="Toggle Hindi/English Bilingual Helper"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{bilingualMode ? 'Hindi Help ON' : 'Bilingual Mode'}</span>
              </button>

              <button
                onClick={() => setExpressMode(!expressMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  expressMode 
                    ? 'bg-emerald-400 text-indigo-950 shadow-sm' 
                    : 'bg-indigo-700/80 hover:bg-indigo-700 text-indigo-100'
                }`}
                title="Toggle Express Core Survey (5 questions) vs Full Survey"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{expressMode ? 'Express Mode' : 'Full Diagnostic'}</span>
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{config.title}</h1>
            <p className="text-indigo-100 text-xs sm:text-sm font-medium leading-relaxed pt-1">{config.desc}</p>
            {registeredSchool && (
              <div className="mt-3 inline-flex flex-wrap items-center gap-2 bg-indigo-950/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-indigo-400/30 text-xs text-indigo-100 font-semibold shadow-inner">
                <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Customized Diagnostic for: <strong className="text-white font-extrabold">{registeredSchool.name}</strong></span>
                <span className="text-indigo-300">|</span>
                <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Board: <strong className="text-white font-bold">{registeredSchool.board}</strong></span>
                <span className="text-indigo-300">|</span>
                <MapPin className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span>City: <strong className="text-white font-bold">{registeredSchool.city}</strong></span>
              </div>
            )}
          </div>
          
          {/* PROGRESS BAR */}
          <div className="pt-2 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-indigo-200">
              <span>Completion Progress ({expressMode ? 'Express 5-Q' : 'Full Diagnostic'})</span>
              <span>{answeredCount} of {totalQuestions} answered ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2.5 bg-indigo-900/40 rounded-full overflow-hidden border border-indigo-400/30">
              <div 
                className="h-full bg-emerald-400 transition-all duration-300 ease-out" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>
        </div>

        {/* STRAIGHTLINING NUDGE WARNING */}
        {isStraightLining && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block text-amber-950">Diagnostic Nudge</span>
              You have selected the identical level across all answered questions. For the most accurate school diagnostic report, ensure your ratings reflect nuanced differences across different operational areas.
            </div>
          </div>
        )}

        {/* QUESTIONS WRAPPER */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
          {questionsToRender.map((q: any, idx: number) => {
            const showSectionHeader = q.section && q.section !== lastSection;
            if (q.section) lastSection = q.section;

            return (
              <React.Fragment key={q.id}>
                {showSectionHeader && (
                  <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm border border-slate-800 my-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-600/30 text-indigo-300 rounded-xl shrink-0">
                        <Award className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 block">Diagnostic Section</span>
                        <h3 className="text-base font-black text-white">{q.section}</h3>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-150 inline-block">
                        {q.label || `Q${idx + 1}`}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 leading-snug pt-1">
                        {q.text}
                      </h4>
                      {bilingualMode && (
                        <p className="text-xs font-semibold text-indigo-700 bg-indigo-50/60 p-2 rounded-xl border border-indigo-100 italic mt-1">
                          हिंदी मार्गदर्शन: कृपया अपने वास्तविक अनुभव के आधार पर सबसे सटीक विकल्प का चयन करें।
                        </p>
                      )}
                    </div>

                    {/* AUDIO READ BUTTON */}
                    <button
                      onClick={() => handleSpeakQuestion(q)}
                      className={`p-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                        readingQId === q.id 
                          ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' 
                          : 'bg-slate-50 hover:bg-indigo-50 text-slate-600 border-slate-200'
                      }`}
                      title="Read question aloud (Text-to-Speech)"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {q.options.map((opt: any) => {
                      const isSelected = answers[q.id] === opt.val;
                      return (
                        <button
                          key={opt.val}
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.val }))}
                          className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-indigo-600 bg-indigo-50/80 shadow-sm' 
                              : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className={`text-xs sm:text-sm font-semibold leading-relaxed ${isSelected ? 'text-indigo-950 font-bold' : 'text-slate-700'}`}>
                              {opt.label}
                            </span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* QUALITATIVE FEEDBACK BOX */}
          <div className="pt-6 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Optional Strategic Feedback / Recommendations</span>
            </div>
            <p className="text-xs text-slate-500">
              Share any specific observation, commendation, or priority area you would like school management to focus on.
            </p>
            <textarea
              value={qualitativeFeedback}
              onChange={(e) => setQualitativeFeedback(e.target.value)}
              placeholder="e.g. Science labs require upgrade, or praise for supportive math faculty..."
              className="w-full p-3.5 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[80px]"
            />
          </div>

          {/* RESPONDENT PERSONAL DETAILS & DPDP COMPLIANCE SECTION */}
          <div className="pt-6 border-t border-slate-200 space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Respondent Profile (Mandatory for Verification)</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full border border-indigo-200">
                <Shield className="w-3 h-3 text-indigo-600" />
                <span>DPDP Act 2023 Compliant</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={respondent.fullName}
                  onChange={(e) => setRespondent(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="e.g. Dr. Ramesh Sharma"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={respondent.contactNumber}
                  onChange={(e) => setRespondent(prev => ({ ...prev, contactNumber: e.target.value }))}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="font-extrabold text-slate-700 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={respondent.email}
                  onChange={(e) => setRespondent(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g. ramesh.s@school.edu.in"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                />
              </div>

              {/* Auto-filled School Name */}
              <div className="space-y-1 sm:col-span-2 bg-indigo-50/80 p-3 rounded-2xl border border-indigo-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-extrabold text-indigo-950 flex items-center gap-1 text-xs">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Institution Official Name <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-extrabold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-indigo-600" /> Auto-filled from School Registration
                  </span>
                </div>
                <input
                  type="text"
                  required
                  readOnly={!!registeredSchool?.name}
                  value={respondent.schoolName}
                  onChange={(e) => setRespondent(prev => ({ ...prev, schoolName: e.target.value }))}
                  placeholder="Official registered school name"
                  className={`w-full p-2.5 rounded-xl font-bold text-xs ${
                    registeredSchool?.name 
                      ? 'bg-white text-indigo-950 border border-indigo-300 shadow-xs' 
                      : 'bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500'
                  }`}
                />
              </div>

              {/* Auto-filled Board & City */}
              <div className="space-y-1 bg-indigo-50/50 p-2.5 rounded-2xl border border-indigo-150">
                <label className="font-extrabold text-indigo-900 flex items-center gap-1 text-xs">
                  <Award className="w-3.5 h-3.5 text-indigo-600" /> Board / Affiliation
                </label>
                <input
                  type="text"
                  readOnly={!!registeredSchool?.board}
                  value={respondent.board || registeredSchool?.board || 'CBSE'}
                  onChange={(e) => setRespondent(prev => ({ ...prev, board: e.target.value }))}
                  placeholder="e.g. CBSE / ICSE / State Board"
                  className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl font-bold text-xs text-indigo-950"
                />
              </div>

              <div className="space-y-1 bg-indigo-50/50 p-2.5 rounded-2xl border border-indigo-150">
                <label className="font-extrabold text-indigo-900 flex items-center gap-1 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" /> City / Location
                </label>
                <input
                  type="text"
                  readOnly={!!registeredSchool?.city}
                  value={respondent.city}
                  onChange={(e) => setRespondent(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g. Jaipur / Lucknow"
                  className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl font-bold text-xs text-indigo-950"
                />
              </div>

              {/* Stakeholder Specific Details: Class / Grade & Section / Department */}
              <div className="space-y-1 bg-amber-50/60 p-2.5 rounded-2xl border border-amber-200">
                <label className="font-extrabold text-amber-950 flex items-center gap-1 text-xs">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" /> Class / Grade Level <span className="text-amber-800 font-normal text-[10px]">(Provided by Stakeholder)</span>
                </label>
                <input
                  type="text"
                  value={respondent.classGrade}
                  onChange={(e) => setRespondent(prev => ({ ...prev, classGrade: e.target.value }))}
                  placeholder="e.g. Grade 10 / Class 8 / N/A (for Management)"
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-semibold text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1 bg-amber-50/60 p-2.5 rounded-2xl border border-amber-200">
                <label className="font-extrabold text-amber-950 flex items-center gap-1 text-xs">
                  <Layers className="w-3.5 h-3.5 text-amber-600" /> Section / Department <span className="text-amber-800 font-normal text-[10px]">(Provided by Stakeholder)</span>
                </label>
                <input
                  type="text"
                  value={respondent.sectionDept}
                  onChange={(e) => setRespondent(prev => ({ ...prev, sectionDept: e.target.value }))}
                  placeholder="e.g. Section A / Science Dept / Administration"
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-semibold text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* DPDP ACT 2023 CONSENT CHECKBOX & NOTICE */}
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-2">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="dpdpConsentCheckbox"
                  checked={dpdpConsent}
                  onChange={(e) => setDpdpConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer shrink-0"
                />
                <label htmlFor="dpdpConsentCheckbox" className="text-[11px] font-semibold text-slate-800 leading-snug cursor-pointer select-none">
                  <span className="font-black text-indigo-950 block">DPDP Act 2023 Consent & Data Protection Agreement <span className="text-red-500">*</span></span>
                  I hereby give my explicit consent to collect, store, and process my personal details (Name, Phone, Email, School, City) and diagnostic ratings strictly for school quality assessment and improvement under the Digital Personal Data Protection (DPDP) Act, 2023. I understand my data is protected and will never be shared for commercial marketing.
                </label>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium">
              {answeredCount < totalQuestions ? (
                <span className="text-amber-600 font-bold">
                  {totalQuestions - answeredCount} survey question(s) remaining.
                </span>
              ) : !isRespondentDetailsValid ? (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-600" /> Fill respondent details & check DPDP consent to enable submit.
                </span>
              ) : (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-emerald-500" /> All verification & survey steps complete!
                </span>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || answeredCount < totalQuestions || !isRespondentDetailsValid}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Submitting Responses...' : 'Submit Strategic Assessment'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};



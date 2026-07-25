import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { SURVEY_QUESTIONS } from './DeepDiveAssessment'; // Export this!
import { Shield, CheckCircle2, Globe } from 'lucide-react';

export const PublicSurvey = ({ stakeholder, aid }: { stakeholder: string, aid: string }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const config = (SURVEY_QUESTIONS as any)[stakeholder];

  if (!config) {
    return <div className="p-10 text-center text-red-600">Invalid Survey Link</div>;
  }

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Aid here acts as the schoolId/assessment ID mapping, for simplicity we assume aid is schoolId for now.
      // Wait, we need to save it so the main app can read it.
      // If we use schoolId as aid:
      const actualAnswers: Record<string, number> = {};
      config.questions.forEach((q: any) => {
        const actualId = q.id_actual || q.id;
        actualAnswers[actualId] = answers[q.id] || 4; // default to 4 if unanswered
      });

      await setDoc(doc(db, `surveys_${aid}`, stakeholder), {
        answers: actualAnswers,
        submittedAt: new Date().toISOString()
      }, { merge: true });
      
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Error submitting survey");
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md space-y-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Thank You!</h2>
          <p className="text-slate-500 font-medium">Your responses have been successfully submitted securely. You may close this window.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex justify-center">
      <div className="max-w-2xl w-full space-y-6">
        <div className="bg-indigo-600 p-6 rounded-3xl text-white space-y-2 shadow-lg">
          <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-widest">
            <Shield className="w-4 h-4" /> Secure DPDP Compliant Channel
          </div>
          <h1 className="text-2xl font-black">{config.title}</h1>
          <p className="text-indigo-100 font-medium">{config.desc}</p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
          {config.questions.map((q: any, idx: number) => (
            <div key={q.id} className="space-y-4">
              <h3 className="font-bold text-slate-800 leading-tight">
                <span className="text-indigo-600 mr-2">Q{idx + 1}.</span>
                {q.text}
              </h3>
              <div className="space-y-2">
                {q.options.map((opt: any) => {
                  const isSelected = answers[q.id] === opt.val;
                  return (
                    <button
                      key={opt.val}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.val }))}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                          : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                          {opt.label}
                        </span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
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
          ))}

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading || Object.keys(answers).length < config.questions.length}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </div>
          {Object.keys(answers).length < config.questions.length && (
            <p className="text-xs text-center text-amber-600 font-bold mt-2">
              Please answer all questions to enable submission.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Lock, Unlock, AlertCircle, CheckCircle2, Clock, Users } from 'lucide-react';
import {
  getResponseSummary,
  getOverallProgress,
  lockAssessment,
  unlockAssessment,
  AssessmentConfiguration,
  AssessmentProgress,
  StakeholderType,
} from '../../lib/multiUserAssessment';

interface ResponseTrackerProps {
  config: AssessmentConfiguration;
  progress: AssessmentProgress;
  onLockStatusChange: (updatedProgress: AssessmentProgress) => void;
  onProceedToAnalysis?: () => void;
}

const STAKEHOLDER_ICONS: Record<StakeholderType, { color: string; bgColor: string }> = {
  teacher: { color: 'text-blue-600', bgColor: 'bg-blue-100' },
  parent: { color: 'text-green-600', bgColor: 'bg-green-100' },
  student: { color: 'text-purple-600', bgColor: 'bg-purple-100' },
  admin: { color: 'text-orange-600', bgColor: 'bg-orange-100' },
  other: { color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

export function ResponseTracker({
  config,
  progress,
  onLockStatusChange,
  onProceedToAnalysis,
}: ResponseTrackerProps) {
  const summary = getResponseSummary(progress, config);
  const overallProgress = getOverallProgress(progress, config);

  const handleToggleLock = () => {
    if (progress.isLocked) {
      const updated = unlockAssessment(progress);
      onLockStatusChange(updated);
    } else {
      const updated = lockAssessment(progress);
      onLockStatusChange(updated);
    }
  };

  const stakeholderList = [
    { type: 'teacher' as StakeholderType, label: 'Teachers' },
    { type: 'parent' as StakeholderType, label: 'Parents/Guardians' },
    { type: 'student' as StakeholderType, label: 'Students' },
    { type: 'admin' as StakeholderType, label: 'Admin Staff' },
    { type: 'other' as StakeholderType, label: 'Other' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-lg mb-8 border border-indigo-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Assessment Deployment</h2>
            <p className="text-gray-600">Track respondent progress for {config.schoolName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Overall Progress</p>
            <p className="text-4xl font-bold text-indigo-600">{overallProgress}%</p>
            <p className="text-sm text-gray-600">{progress.totalActual} of {config.totalExpected}</p>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">Overall Progress</h3>
          <span className={`text-sm font-medium ${overallProgress === 100 ? 'text-green-600' : 'text-blue-600'}`}>
            {progress.totalActual} of {config.totalExpected} responses
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              overallProgress === 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Respondent Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Responses by Stakeholder Type
        </h3>

        <div className="space-y-4">
          {stakeholderList.map(({ type, label }) => {
            const stats = summary[type];
            const { color, bgColor } = STAKEHOLDER_ICONS[type];

            return (
              <div key={type} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{label}</h4>
                  <span className={`text-sm font-bold ${color}`}>
                    {stats.actual}/{stats.expected}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          stats.status === 'complete'
                            ? 'bg-green-500'
                            : stats.status === 'in-progress'
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                        }`}
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {stats.status === 'complete' && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    {stats.status === 'in-progress' && (
                      <Clock className="w-5 h-5 text-blue-600" />
                    )}
                    {stats.status === 'incomplete' && (
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600 min-w-12">{stats.percentage}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Lock Status */}
        <div className={`rounded-lg p-6 border ${progress.isLocked ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-semibold ${progress.isLocked ? 'text-red-900' : 'text-blue-900'}`}>
              {progress.isLocked ? 'Assessment Locked' : 'Assessment Open'}
            </h3>
            {progress.isLocked ? (
              <Lock className={`w-5 h-5 ${progress.isLocked ? 'text-red-600' : ''}`} />
            ) : (
              <Unlock className="w-5 h-5 text-blue-600" />
            )}
          </div>

          <p className={`text-sm mb-3 ${progress.isLocked ? 'text-red-800' : 'text-blue-800'}`}>
            {progress.isLocked
              ? `Assessment locked on ${progress.lockedAt?.toLocaleDateString()}. No new responses can be added.`
              : 'Assessment is active. New responses can be added.'}
          </p>

          <button
            onClick={handleToggleLock}
            className={`w-full px-4 py-2 rounded font-medium transition flex items-center justify-center gap-2 ${
              progress.isLocked
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {progress.isLocked ? (
              <>
                <Unlock className="w-4 h-4" />
                Unlock Assessment
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Lock Assessment
              </>
            )}
          </button>
        </div>

        {/* Analysis Readiness */}
        <div className={`rounded-lg p-6 border ${progress.isLocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`font-semibold mb-3 ${progress.isLocked ? 'text-green-900' : 'text-gray-900'}`}>
            Ready for Analysis
          </h3>

          <p className={`text-sm mb-3 ${progress.isLocked ? 'text-green-800' : 'text-gray-600'}`}>
            {progress.isLocked
              ? `✓ Assessment locked with ${progress.totalActual} responses. Ready to proceed to diagnostic report.`
              : '⊘ Lock the assessment to proceed with analysis.'}
          </p>

          <button
            onClick={onProceedToAnalysis}
            disabled={!progress.isLocked}
            className={`w-full px-4 py-2 rounded font-medium transition ${
              progress.isLocked
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Proceed to Diagnostic Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {progress.isLocked && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Assessment Locked Summary
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-green-700">Teacher Responses</p>
              <p className="text-2xl font-bold text-green-600">{progress.actualRespondents.teacher}</p>
            </div>
            <div>
              <p className="text-green-700">Parent Responses</p>
              <p className="text-2xl font-bold text-green-600">{progress.actualRespondents.parent}</p>
            </div>
            <div>
              <p className="text-green-700">Student Responses</p>
              <p className="text-2xl font-bold text-green-600">{progress.actualRespondents.student}</p>
            </div>
            <div>
              <p className="text-green-700">Total Responses</p>
              <p className="text-2xl font-bold text-green-600">{progress.totalActual}</p>
            </div>
          </div>

          <p className="text-xs text-green-700 mt-4 italic">
            Note: Analysis will be based on these {progress.totalActual} responses.
            Differences from expected count will be noted in the report.
          </p>
        </div>
      )}
    </div>
  );
}

export default ResponseTracker;

import React, { useState, useEffect } from 'react';
import { Lock, Unlock, AlertCircle, CheckCircle2, Clock, Users } from 'lucide-react';
import {
  getResponseSummary,
  getOverallProgress,
  AssessmentConfiguration,
  AssessmentProgress,
  StakeholderType,
} from '../../lib/multiUserAssessment';
import { lockAssessmentEventDoc, unlockAssessmentEventDoc } from '../../lib/assessmentEventService';
import { SurveyLinksDisplay } from './SurveyLinksDisplay';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

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
  const [liveProgress, setLiveProgress] = useState<AssessmentProgress>(progress);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingLock, setIsTogglingLock] = useState(false);

  // Set up real-time listener for responses
  useEffect(() => {
    setIsLoading(true);
    try {
      console.log('📡 Setting up listener for assessment:', config.id);
      const responsesRef = collection(db, 'assessments', config.id, 'responses');
      const q = query(responsesRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('📊 Snapshot received. Document count:', snapshot.size);

        // Count responses by stakeholder type
        const responseCounts: Record<StakeholderType, number> = {
          teacher: 0,
          parent: 0,
          student: 0,
          admin: 0,
          other: 0,
        };

        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log('📄 Response data:', { id: doc.id, stakeholderType: data.stakeholderType });

          const type = data.stakeholderType as StakeholderType;
          if (type in responseCounts) {
            responseCounts[type]++;
            console.log('✅ Counted', type, '- Now:', responseCounts[type]);
          } else {
            console.warn('⚠️ Unknown stakeholder type:', type);
          }
        });

        console.log('📈 Final counts:', responseCounts);

        // Update progress with actual response counts, based on the latest
        // state rather than the closure captured when this listener was set
        // up - otherwise a response arriving after a lock/unlock toggle would
        // clobber that change back to its value at mount time.
        setLiveProgress((prev) => ({
          ...prev,
          actualRespondents: responseCounts,
          totalActual: Object.values(responseCounts).reduce((a, b) => a + b, 0),
        }));
        setIsLoading(false);
        console.log('✅ Real-time responses updated:', responseCounts);
      });

      return () => {
        console.log('🛑 Unsubscribing from listener');
        unsubscribe();
      };
    } catch (error) {
      console.error('⚠️ Error setting up response listener:', error);
      setIsLoading(false);
    }
  }, [config.id]);

  const summary = getResponseSummary(liveProgress, config);
  const overallProgress = getOverallProgress(liveProgress, config);

  const handleToggleLock = async () => {
    setIsTogglingLock(true);
    try {
      if (liveProgress.isLocked) {
        await unlockAssessmentEventDoc(config.id);
        const updated: AssessmentProgress = {
          ...liveProgress,
          isLocked: false,
          lockedAt: undefined,
          lockedBy: undefined,
        };
        setLiveProgress(updated);
        onLockStatusChange(updated);
      } else {
        const lockedAt = await lockAssessmentEventDoc(config.id);
        const updated: AssessmentProgress = {
          ...liveProgress,
          isLocked: true,
          lockedAt,
          lockedBy: 'admin',
        };
        setLiveProgress(updated);
        onLockStatusChange(updated);
      }
    } catch (error) {
      console.error('Failed to update lock status:', error);
      alert('Could not update the lock status. Please check your connection and try again.');
    } finally {
      setIsTogglingLock(false);
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{config.eventName}</h2>
            <p className="text-gray-600">Track cumulative respondent progress for {config.schoolName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Overall Progress</p>
            <p className="text-4xl font-bold text-indigo-600">{overallProgress}%</p>
            <p className="text-sm text-gray-600">{liveProgress.totalActual} of {config.totalExpected}</p>
          </div>
        </div>
      </div>

      {/* Survey Links Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        {liveProgress.isLocked ? (
          <div className="flex items-start gap-3 text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">This assessment event is locked</p>
              <p className="text-sm mt-1">
                Survey links no longer accept new responses. Unlock the event below if you need to collect more data.
              </p>
            </div>
          </div>
        ) : (
          <SurveyLinksDisplay
            assessmentId={config.id}
            schoolName={config.schoolName}
            expectedRespondents={config.expectedRespondents}
          />
        )}
      </div>

      {/* Overall Progress Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">Overall Progress</h3>
          <span className={`text-sm font-medium ${overallProgress === 100 ? 'text-green-600' : 'text-blue-600'}`}>
            {liveProgress.totalActual} of {config.totalExpected} responses
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
        <div className={`rounded-lg p-6 border ${liveProgress.isLocked ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-semibold ${liveProgress.isLocked ? 'text-red-900' : 'text-blue-900'}`}>
              {liveProgress.isLocked ? 'Assessment Locked' : 'Assessment Open'}
            </h3>
            {liveProgress.isLocked ? (
              <Lock className="w-5 h-5 text-red-600" />
            ) : (
              <Unlock className="w-5 h-5 text-blue-600" />
            )}
          </div>

          <p className={`text-sm mb-3 ${liveProgress.isLocked ? 'text-red-800' : 'text-blue-800'}`}>
            {liveProgress.isLocked
              ? `Assessment locked on ${liveProgress.lockedAt?.toLocaleDateString()}. No new responses can be added.`
              : 'Assessment is active. New responses can be added.'}
          </p>

          <button
            onClick={handleToggleLock}
            disabled={isTogglingLock}
            className={`w-full px-4 py-2 rounded font-medium transition flex items-center justify-center gap-2 ${
              isTogglingLock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : liveProgress.isLocked
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {liveProgress.isLocked ? (
              <>
                <Unlock className="w-4 h-4" />
                {isTogglingLock ? 'Unlocking...' : 'Unlock Assessment'}
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                {isTogglingLock ? 'Locking...' : 'Lock Assessment'}
              </>
            )}
          </button>
        </div>

        {/* Analysis Readiness */}
        <div className={`rounded-lg p-6 border ${liveProgress.isLocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className={`font-semibold mb-3 ${liveProgress.isLocked ? 'text-green-900' : 'text-gray-900'}`}>
            Ready for Analysis
          </h3>

          <p className={`text-sm mb-3 ${liveProgress.isLocked ? 'text-green-800' : 'text-gray-600'}`}>
            {liveProgress.isLocked
              ? `✓ Assessment locked with ${liveProgress.totalActual} responses. Ready to proceed to diagnostic report.`
              : '⊘ Lock the assessment to proceed with analysis.'}
          </p>

          <button
            onClick={onProceedToAnalysis}
            disabled={!liveProgress.isLocked}
            className={`w-full px-4 py-2 rounded font-medium transition ${
              liveProgress.isLocked
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Proceed to Diagnostic Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {liveProgress.isLocked && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Assessment Locked Summary
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-green-700">Teacher Responses</p>
              <p className="text-2xl font-bold text-green-600">{liveProgress.actualRespondents.teacher}</p>
            </div>
            <div>
              <p className="text-green-700">Parent Responses</p>
              <p className="text-2xl font-bold text-green-600">{liveProgress.actualRespondents.parent}</p>
            </div>
            <div>
              <p className="text-green-700">Student Responses</p>
              <p className="text-2xl font-bold text-green-600">{liveProgress.actualRespondents.student}</p>
            </div>
            <div>
              <p className="text-green-700">Total Responses</p>
              <p className="text-2xl font-bold text-green-600">{liveProgress.totalActual}</p>
            </div>
          </div>

          <p className="text-xs text-green-700 mt-4 italic">
            Note: Analysis will be based on these {liveProgress.totalActual} responses.
            Differences from expected count will be noted in the report.
          </p>
        </div>
      )}
    </div>
  );
}

export default ResponseTracker;

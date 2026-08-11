import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store';
import { AssessmentConfiguration, ResponseTracker, DiagnosticReport } from '../components/MultiUserAssessment';
import {
  AssessmentConfiguration as ConfigType,
  AssessmentProgress,
  hydrateAssessmentProgress,
} from '../lib/multiUserAssessment';
import {
  AssessmentEventSummary,
  createAssessmentEventDoc,
  getAssessmentEvent,
  listAssessmentEventsForSchool,
  markAssessmentEventAnalyzed,
} from '../lib/assessmentEventService';
import { ArrowRight, PlusCircle, CheckCircle2, Lock, Users, Clock, RefreshCw, AlertCircle } from 'lucide-react';

type Stage = 'history' | 'configuration' | 'deployment' | 'analysis';

const STAGE_ORDER: Stage[] = ['history', 'configuration', 'deployment', 'analysis'];
const STAGE_LABELS: Record<Stage, string> = {
  history: 'Events',
  configuration: 'Configure',
  deployment: 'Deploy',
  analysis: 'Analyze',
};

const STATUS_BADGE: Record<AssessmentEventSummary['status'], { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-blue-100 text-blue-700' },
  locked: { label: 'Locked', className: 'bg-amber-100 text-amber-700' },
  analyzed: { label: 'Analyzed', className: 'bg-green-100 text-green-700' },
};

export function MultiUserAssessmentPage() {
  const { activeSchool } = useAppStore();
  const [stage, setStage] = useState<Stage>('history');
  const [config, setConfig] = useState<ConfigType | null>(null);
  const [progress, setProgress] = useState<AssessmentProgress | null>(null);

  const [events, setEvents] = useState<AssessmentEventSummary[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [isOpeningEvent, setIsOpeningEvent] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const schoolId = activeSchool?.id || 'unknown';
  const schoolName = activeSchool?.name || 'Unknown School';

  const loadEvents = useCallback(async () => {
    if (!schoolId || schoolId === 'unknown') {
      setEvents([]);
      setIsLoadingEvents(false);
      return;
    }
    setIsLoadingEvents(true);
    setEventsError('');
    try {
      const list = await listAssessmentEventsForSchool(schoolId);
      setEvents(list);
    } catch (error) {
      console.error('Failed to load assessment events:', error);
      setEventsError('Could not load past assessment events. Please refresh and try again.');
    } finally {
      setIsLoadingEvents(false);
    }
  }, [schoolId]);

  useEffect(() => {
    setStage('history');
    setConfig(null);
    setProgress(null);
    setShowReport(false);
    loadEvents();
  }, [schoolId, loadEvents]);

  const handleConfigComplete = async (newConfig: ConfigType, newProgress: AssessmentProgress) => {
    setConfig(newConfig);
    setProgress(newProgress);
    setStage('deployment');

    try {
      await createAssessmentEventDoc(newConfig);
    } catch (error) {
      console.error('Failed to save assessment event to Firestore:', error);
      alert('Warning: this assessment event could not be saved to the database. Respondent data may not be retained. Please check your connection and try again.');
    }
  };

  const handleOpenEvent = async (eventId: string) => {
    setIsOpeningEvent(true);
    try {
      const result = await getAssessmentEvent(eventId);
      if (!result) {
        alert('This assessment event could not be found. It may have been deleted.');
        return;
      }
      setConfig(result.config);
      setProgress(
        hydrateAssessmentProgress(result.config, {
          isLocked: result.isLocked,
          lockedAt: result.lockedAt || undefined,
          lockedBy: result.lockedBy || undefined,
        })
      );
      setShowReport(false);
      setStage(result.config.status === 'analyzed' ? 'analysis' : 'deployment');
    } catch (error) {
      console.error('Failed to open assessment event:', error);
      alert('Failed to open this assessment event. Please try again.');
    } finally {
      setIsOpeningEvent(false);
    }
  };

  const handleProgressUpdate = (updatedProgress: AssessmentProgress) => {
    setProgress(updatedProgress);
  };

  const handleProceedToAnalysis = async () => {
    if (config) {
      try {
        await markAssessmentEventAnalyzed(config.id);
      } catch (error) {
        console.error('Failed to mark event as analyzed:', error);
      }
    }
    setStage('analysis');
  };

  const handleBackToHistory = () => {
    setStage('history');
    setConfig(null);
    setProgress(null);
    setShowReport(false);
    loadEvents();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">14-Dimension Multilateral Assessment</h1>
        <p className="text-gray-600 mt-2">Multi-stakeholder feedback system with response tracking, for {schoolName}</p>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-between">
          {STAGE_ORDER.map((s, idx) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition ${
                  STAGE_ORDER.indexOf(stage) >= idx ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {STAGE_ORDER.indexOf(stage) > idx ? <CheckCircle2 className="w-6 h-6" /> : idx + 1}
              </div>
              {idx < STAGE_ORDER.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition ${
                    STAGE_ORDER.indexOf(stage) > idx ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          {STAGE_ORDER.map((s) => (
            <span key={s}>{STAGE_LABELS[s]}</span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stage 1: Assessment Event History */}
        {stage === 'history' && (
          <div className="space-y-6">
            {schoolId === 'unknown' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900">No school selected</h3>
                  <p className="text-sm text-amber-800 mt-1">
                    Register or select a school first. Assessment events and respondent data are saved under a specific school.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Assessment Events</h2>
                  <p className="text-gray-600 mt-1">
                    Every past and current 14D assessment round for {schoolName}. Cumulative respondent counts are read
                    directly from the database, so they never disappear on logout or across devices.
                  </p>
                </div>
                <button
                  onClick={() => setStage('configuration')}
                  disabled={schoolId === 'unknown'}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition whitespace-nowrap ${
                    schoolId === 'unknown'
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <PlusCircle className="w-5 h-5" />
                  New Assessment Event
                </button>
              </div>

              {isLoadingEvents && (
                <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Loading assessment events...
                </div>
              )}

              {!isLoadingEvents && eventsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{eventsError}</div>
              )}

              {!isLoadingEvents && !eventsError && events.length === 0 && schoolId !== 'unknown' && (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-gray-500">No assessment events yet for this school.</p>
                  <p className="text-sm text-gray-400 mt-1">Create one to start collecting 14D responses.</p>
                </div>
              )}

              {!isLoadingEvents && events.length > 0 && (
                <div className="space-y-3">
                  {events.map((event) => {
                    const badge = STATUS_BADGE[event.status];
                    return (
                      <button
                        key={event.id}
                        onClick={() => handleOpenEvent(event.id)}
                        disabled={isOpeningEvent}
                        className="w-full text-left border border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:bg-blue-50/40 transition flex items-center justify-between gap-4 disabled:opacity-60"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-gray-900 truncate">{event.eventName}</h3>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {event.createdAt ? event.createdAt.toLocaleDateString() : 'Unknown date'}
                            </span>
                            {event.status !== 'active' && (
                              <span className="flex items-center gap-1">
                                <Lock className="w-4 h-4" />
                                Locked{event.lockedAt ? ` ${event.lockedAt.toLocaleDateString()}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-6 flex-shrink-0">
                          <div className="text-right">
                            <div className="flex items-center gap-1.5 text-2xl font-bold text-blue-600">
                              <Users className="w-5 h-5" />
                              {event.totalActual}
                            </div>
                            <p className="text-xs text-gray-500">of {event.totalExpected} expected</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stage 2: Configuration */}
        {stage === 'configuration' && (
          <AssessmentConfiguration
            schoolId={schoolId}
            schoolName={schoolName}
            onConfigComplete={handleConfigComplete}
            onCancel={() => setStage('history')}
          />
        )}

        {/* Stage 3: Deployment & Response Tracking */}
        {stage === 'deployment' && config && progress && (
          <div>
            <button
              onClick={handleBackToHistory}
              className="mb-4 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              ← Back to Assessment Events
            </button>
            <ResponseTracker
              key={config.id}
              config={config}
              progress={progress}
              onLockStatusChange={handleProgressUpdate}
              onProceedToAnalysis={handleProceedToAnalysis}
            />
          </div>
        )}

        {/* Stage 4: Analysis */}
        {stage === 'analysis' && config && progress && showReport && (
          <DiagnosticReport
            assessmentId={config.id}
            eventName={config.eventName}
            schoolName={config.schoolName}
            onBack={() => setShowReport(false)}
          />
        )}

        {stage === 'analysis' && config && progress && !showReport && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{config.eventName}</h2>
              <p className="text-gray-600 mb-6">
                Locked with {progress.totalActual} respondents. Ready to generate the comprehensive diagnostic report.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-blue-900 mb-4">Assessment Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700 text-xs font-bold">Teachers</p>
                    <p className="text-2xl font-bold text-blue-600">{progress.actualRespondents.teacher}</p>
                    <p className="text-xs text-blue-600">of {config.expectedRespondents.teacher}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 text-xs font-bold">Parents</p>
                    <p className="text-2xl font-bold text-blue-600">{progress.actualRespondents.parent}</p>
                    <p className="text-xs text-blue-600">of {config.expectedRespondents.parent}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 text-xs font-bold">Students</p>
                    <p className="text-2xl font-bold text-blue-600">{progress.actualRespondents.student}</p>
                    <p className="text-xs text-blue-600">of {config.expectedRespondents.student}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 text-xs font-bold">Admin</p>
                    <p className="text-2xl font-bold text-blue-600">{progress.actualRespondents.admin}</p>
                    <p className="text-xs text-blue-600">of {config.expectedRespondents.admin}</p>
                  </div>
                  <div>
                    <p className="text-green-700 text-xs font-bold">Overall</p>
                    <p className="text-2xl font-bold text-green-600">{progress.totalActual}</p>
                    <p className="text-xs text-green-600">Total Responses</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-green-800">
                  ✓ Assessment data validated and locked. All {progress.totalActual} responses ready for analysis across 14 diagnostic dimensions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setStage('deployment')}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition order-2 sm:order-1"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => setShowReport(true)}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 order-1 sm:order-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Generate Diagnostic Report
                </button>
                <button
                  onClick={handleBackToHistory}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition order-3"
                >
                  View All Assessment Events
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MultiUserAssessmentPage;

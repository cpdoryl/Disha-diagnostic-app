import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store';
import { AssessmentConfiguration, ResponseTracker, DiagnosticReport } from '../components/MultiUserAssessment';
import { ProfessionalAssessmentEvents } from '../components/AssessmentEvents';
import { ObjectiveDataCapture } from '../components/CaptureStage/ObjectiveDataCapture';
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
import { checkObjectiveDataReadiness, ObjectiveReadiness } from '../lib/objectiveDataService';
import { ArrowRight, PlusCircle, CheckCircle2, Lock, Users, Clock, RefreshCw, AlertCircle, Database, Layers, Settings, Zap, BarChart3, BookOpen, Target, TrendingUp, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';

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

  const [objectiveReadiness, setObjectiveReadiness] = useState<ObjectiveReadiness | null>(null);
  const [isCheckingReadiness, setIsCheckingReadiness] = useState(false);

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

  useEffect(() => {
    if (stage !== 'analysis' || !config) {
      return;
    }
    let cancelled = false;
    setIsCheckingReadiness(true);
    checkObjectiveDataReadiness(config.id)
      .then((readiness) => {
        if (!cancelled) setObjectiveReadiness(readiness);
      })
      .catch((error) => {
        console.error('Failed to check objective data readiness:', error);
      })
      .finally(() => {
        if (!cancelled) setIsCheckingReadiness(false);
      });
    return () => {
      cancelled = true;
    };
  }, [stage, config]);

  // Stage icons for workflow
  const stageIcons: Record<Stage, React.ElementType> = {
    history: BookOpen,
    configuration: Settings,
    deployment: Zap,
    analysis: BarChart3,
  };

  const stageColors: Record<Stage, { bg: string; text: string; icon: string }> = {
    history: { bg: 'from-blue-600 to-blue-800', text: 'text-blue-600', icon: 'text-blue-500' },
    configuration: { bg: 'from-indigo-600 to-indigo-800', text: 'text-indigo-600', icon: 'text-indigo-500' },
    deployment: { bg: 'from-purple-600 to-purple-800', text: 'text-purple-600', icon: 'text-purple-500' },
    analysis: { bg: 'from-emerald-600 to-emerald-800', text: 'text-emerald-600', icon: 'text-emerald-500' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header with Gradient */}
      <div className={`bg-gradient-to-r ${stageColors[stage].bg} text-white shadow-2xl`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Layers className="w-8 h-8 text-blue-200" />
                <span className="text-blue-100 text-sm font-semibold tracking-wider uppercase">14-Dimension Assessment Platform</span>
              </div>
              <h1 className="text-4xl font-black mb-3">School Diagnostic Assessment</h1>
              <div className="flex flex-col gap-1">
                <p className="text-blue-100 text-lg font-medium">{schoolName}</p>
                <p className="text-blue-200 text-sm">Comprehensive multi-stakeholder feedback & strategic analysis system</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="bg-white/20 backdrop-blur rounded-xl p-4 border border-white/30">
                <p className="text-blue-100 text-xs font-semibold mb-1">CURRENT STAGE</p>
                <p className="text-2xl font-bold text-white">{STAGE_LABELS[stage]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Progress Indicator */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between gap-2">
              {STAGE_ORDER.map((s, idx) => {
                const isCompleted = STAGE_ORDER.indexOf(stage) > idx;
                const isActive = stage === s;
                const StageIcon = stageIcons[s];
                const color = stageColors[s];

                return (
                  <React.Fragment key={s}>
                    {/* Step Circle */}
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div
                        className={`relative flex items-center justify-center w-16 h-16 rounded-2xl font-bold text-lg transition-all duration-300 shadow-md ${
                          isActive
                            ? `bg-gradient-to-br ${color.bg} text-white scale-110 shadow-xl`
                            : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-8 h-8" />
                        ) : (
                          <StageIcon className="w-7 h-7" />
                        )}

                        {isActive && (
                          <div className="absolute inset-0 rounded-2xl animate-pulse bg-white/20"></div>
                        )}
                      </div>

                      {/* Stage Label */}
                      <div className="text-center">
                        <p className={`text-sm font-bold transition ${isActive ? color.text : 'text-gray-600'}`}>
                          {STAGE_LABELS[s]}
                        </p>
                        {isActive && (
                          <p className="text-xs text-blue-600 font-semibold mt-0.5">Currently here</p>
                        )}
                      </div>
                    </div>

                    {/* Connector Line */}
                    {idx < STAGE_ORDER.length - 1 && (
                      <div
                        className={`flex-1 h-1 rounded-full mx-1 transition-all duration-300 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-green-500 to-blue-500'
                            : 'bg-gray-200'
                        }`}
                        style={{ minHeight: '4px' }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Progress Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {STAGE_ORDER.map((s) => {
              const isActive = stage === s;
              const isCompleted = STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(s);

              let description = '';
              switch (s) {
                case 'history':
                  description = 'View past and current assessment events';
                  break;
                case 'configuration':
                  description = 'Set up assessment parameters and respondents';
                  break;
                case 'deployment':
                  description = 'Collect responses and track progress';
                  break;
                case 'analysis':
                  description = 'View diagnostic insights and reports';
                  break;
              }

              return (
                <div
                  key={s}
                  className={`p-3 rounded-lg transition border-2 ${
                    isActive
                      ? 'bg-blue-50 border-blue-300 shadow-md'
                      : isCompleted
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <p className="text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
                    {STAGE_LABELS[s]}
                  </p>
                  <p className="text-xs text-gray-600">{description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

            {isLoadingEvents ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 flex items-center justify-center">
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Loading assessment events...
                </div>
              </div>
            ) : eventsError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{eventsError}</div>
            ) : events.length === 0 && schoolId !== 'unknown' ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No assessment events yet for this school.</p>
                <p className="text-sm text-gray-400 mt-1">Create one to start collecting 14D responses.</p>
              </div>
            ) : (
              <ProfessionalAssessmentEvents
                events={events.map(event => ({
                  id: event.id,
                  name: event.eventName,
                  date: event.createdAt ? event.createdAt.toLocaleDateString() : 'Unknown date',
                  status: (event.status === 'active' ? 'active' : event.status === 'analyzed' ? 'completed' : 'scheduled') as 'active' | 'completed' | 'scheduled',
                  respondentsCount: event.totalActual,
                  expectedCount: event.totalExpected,
                  school: schoolName,
                }))}
                schoolName={schoolName}
                onCreateNew={() => schoolId !== 'unknown' && setStage('configuration')}
                onSelectEvent={(event) => handleOpenEvent(event.id)}
              />
            )}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                <ResponseTracker
                  key={config.id}
                  config={config}
                  progress={progress}
                  onLockStatusChange={handleProgressUpdate}
                  onProceedToAnalysis={handleProceedToAnalysis}
                />
              </div>

              {/* Right Sidebar - Insights & Recommendations */}
              <div className="space-y-4 lg:sticky lg:top-4">
                {/* Operational Data Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-lg font-bold text-gray-900">Operational Data</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Capture objective school data for this assessment round in parallel with survey collection.
                    Required fields across all 14 dimensions must be filled before the diagnostic report can be
                    generated.
                  </p>
                  <ObjectiveDataCapture schoolId={config.schoolId} schoolName={config.schoolName} eventId={config.id} />
                </div>

                {/* Quick Insights Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-blue-900">Quick Insights</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">📊 Assessment Progress</p>
                      <p className="text-blue-800">
                        {progress.totalActual} of {progress.totalExpected} respondents ({Math.round((progress.totalActual / progress.totalExpected) * 100)}%)
                      </p>
                    </div>
                    <div className="pt-3 border-t border-blue-200">
                      <p className="font-semibold text-blue-900 mb-2">🎯 Stakeholder Breakdown</p>
                      <div className="space-y-1 text-blue-800 text-xs">
                        <div className="flex justify-between">
                          <span>Teachers:</span>
                          <span className="font-semibold">{progress.actualRespondents.teacher}/{config.expectedRespondents.teacher}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Parents:</span>
                          <span className="font-semibold">{progress.actualRespondents.parent}/{config.expectedRespondents.parent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Students:</span>
                          <span className="font-semibold">{progress.actualRespondents.student}/{config.expectedRespondents.student}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Admin:</span>
                          <span className="font-semibold">{progress.actualRespondents.admin}/{config.expectedRespondents.admin}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gap Analysis & Recommendations */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-bold text-amber-900">Analysis Preview</h3>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-semibold text-amber-900 mb-2 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" /> Perception-Reality Gaps
                      </p>
                      <div className="bg-white/60 rounded-lg p-3 space-y-2">
                        <div className="text-amber-900">
                          <p className="font-medium">🔴 Technology Integration</p>
                          <p className="text-xs text-amber-700 mt-1">Critical gap between perception and reality</p>
                        </div>
                        <div className="text-amber-900 pt-2 border-t border-amber-200">
                          <p className="font-medium">🟠 Infrastructure & Facilities</p>
                          <p className="text-xs text-amber-700 mt-1">Facilities aging, modernization needed</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-green-900 mb-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-600" /> Key Strengths
                      </p>
                      <div className="bg-white/60 rounded-lg p-3 space-y-2">
                        <div className="text-green-900">
                          <p className="font-medium">✨ Student Achievement</p>
                          <p className="text-xs text-green-700 mt-1">Excellent performance (84/100)</p>
                        </div>
                        <div className="text-green-900 pt-2 border-t border-green-200">
                          <p className="font-medium">💚 Community Engagement</p>
                          <p className="text-xs text-green-700 mt-1">Strong stakeholder partnerships</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actionable Recommendations */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border-2 border-purple-200 p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-purple-900">Top Priorities</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="bg-white/60 rounded-lg p-3 border-l-4 border-red-500">
                      <p className="font-bold text-purple-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        CRITICAL
                      </p>
                      <p className="text-xs text-purple-700 mt-1">Technology Integration Roadmap</p>
                      <p className="text-xs text-purple-600 mt-1">Timeline: 6-8 months</p>
                    </div>

                    <div className="bg-white/60 rounded-lg p-3 border-l-4 border-orange-500">
                      <p className="font-bold text-purple-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        HIGH
                      </p>
                      <p className="text-xs text-purple-700 mt-1">Infrastructure Modernization</p>
                      <p className="text-xs text-purple-600 mt-1">Timeline: 12 months</p>
                    </div>

                    <div className="bg-white/60 rounded-lg p-3 border-l-4 border-amber-500">
                      <p className="font-bold text-purple-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        MEDIUM
                      </p>
                      <p className="text-xs text-purple-700 mt-1">Curriculum Modernization</p>
                      <p className="text-xs text-purple-600 mt-1">Timeline: 8-10 months</p>
                    </div>
                  </div>

                  <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-violet-700 transition text-sm">
                    View Full Analysis →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stage 4: Analysis - real subjective + objective + gap analysis report */}
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

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  ✓ Assessment data validated and locked. All {progress.totalActual} responses ready for analysis across 14 diagnostic dimensions.
                </p>
              </div>

              <div
                className={`rounded-lg p-4 mb-8 text-left border ${
                  objectiveReadiness?.isReady ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
                }`}
              >
                {isCheckingReadiness ? (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Checking objective operational data completeness...
                  </p>
                ) : objectiveReadiness?.isReady ? (
                  <p className="text-sm text-green-800">
                    ✓ Objective operational data complete ({objectiveReadiness.completeness}%) across all 14
                    dimensions. Ready to generate the full subjective + objective comparison report.
                  </p>
                ) : (
                  <div>
                    <p className="text-sm text-amber-800 font-semibold mb-1">
                      Objective operational data is required before generating the report
                      {objectiveReadiness ? ` (${objectiveReadiness.completeness}% complete)` : ''}.
                    </p>
                    {objectiveReadiness && objectiveReadiness.missingByDimension.length > 0 && (
                      <p className="text-xs text-amber-700 mb-2">
                        Missing required data for: {objectiveReadiness.missingByDimension.map((d) => d.dimensionName).join(', ')}
                      </p>
                    )}
                    <button
                      onClick={() => setStage('deployment')}
                      className="text-xs font-bold text-amber-900 underline hover:text-amber-950"
                    >
                      Go enter operational data →
                    </button>
                  </div>
                )}
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
                  disabled={!objectiveReadiness?.isReady}
                  title={objectiveReadiness?.isReady ? undefined : 'Complete required operational data for all 14 dimensions first'}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
                >
                  <ArrowRight className="w-4 h-4" />
                  View Diagnostic Report
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

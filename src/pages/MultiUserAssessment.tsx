import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store';
import { AssessmentConfiguration, ResponseTracker, DiagnosticReport } from '../components/MultiUserAssessment';
import { ProfessionalAssessmentEvents } from '../components/AssessmentEvents';
import { ObjectiveDataCapture } from '../components/CaptureStage/ObjectiveDataCapture';
import { ProfessionalDiagnosticDashboard } from '../components/DiagnosticDashboard/ProfessionalDiagnosticDashboard';
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
import { generateComprehensiveDiagnosticReport } from '../lib/professionalDiagnosticReportV2';
import { ArrowRight, PlusCircle, CheckCircle2, Lock, Users, Clock, RefreshCw, AlertCircle, Database, Download } from 'lucide-react';

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

  const handleDownloadReport = () => {
    if (!config || !progress) return;

    // Create sample dimension data from assessment responses
    const dimensions = [
      {
        dimensionName: 'Academic Excellence',
        subjectiveScore: 82,
        objectiveScore: 78,
        benchmarkScore: 80,
        avgScore: 80,
        status: 'good' as const,
        gapAnalysis: 'Subjective perception exceeds benchmark slightly',
        rootCauses: ['Minor curriculum coverage gaps', 'Assessment design improvements needed'],
        actionablePoints: ['Strengthen advanced coursework', 'Enhance formative assessment practices'],
        interpretation: 'Academic performance is strong with solid teaching practices. Subjective perception aligns well with objective data.',
      },
      {
        dimensionName: 'Leadership & Governance',
        subjectiveScore: 78,
        objectiveScore: 75,
        benchmarkScore: 80,
        avgScore: 77,
        status: 'adequate' as const,
        gapAnalysis: 'Perception and reality are aligned but below benchmark',
        rootCauses: ['Limited strategic vision communication', 'Governance structure refinement needed'],
        actionablePoints: ['Develop clear strategic plan', 'Enhance stakeholder communication', 'Strengthen board engagement'],
        interpretation: 'Leadership structure exists but requires strengthening in strategic vision and stakeholder engagement.',
      },
      {
        dimensionName: 'Student Well-being & Support',
        subjectiveScore: 85,
        objectiveScore: 82,
        benchmarkScore: 82,
        avgScore: 83,
        status: 'good' as const,
        gapAnalysis: 'Above benchmark with strong support systems',
        rootCauses: ['Strong counseling programs', 'Effective pastoral care system'],
        actionablePoints: ['Expand mental health support', 'Enhance peer mentoring', 'Develop wellness curriculum'],
        interpretation: 'Comprehensive student support systems in place with positive stakeholder feedback.',
      },
      {
        dimensionName: 'Teaching & Learning Pedagogy',
        subjectiveScore: 80,
        objectiveScore: 77,
        benchmarkScore: 80,
        avgScore: 79,
        status: 'adequate' as const,
        gapAnalysis: 'Meeting benchmarks with room for innovation',
        rootCauses: ['Traditional teaching methods', 'Limited technology integration'],
        actionablePoints: ['Implement student-centered pedagogy', 'Expand digital learning tools', 'Professional development for teachers'],
        interpretation: 'Solid teaching practices in place with opportunity for pedagogical innovation.',
      },
      {
        dimensionName: 'Curriculum & Assessment Design',
        subjectiveScore: 76,
        objectiveScore: 73,
        benchmarkScore: 80,
        avgScore: 75,
        status: 'adequate' as const,
        gapAnalysis: 'Below benchmark - needs strengthening',
        rootCauses: ['Assessment tools need modernization', 'Curriculum alignment issues'],
        actionablePoints: ['Conduct curriculum audit', 'Redesign assessment methods', 'Align with competency frameworks'],
        interpretation: 'Current curriculum structure requires modernization and better alignment with learning outcomes.',
      },
      {
        dimensionName: 'Innovation & Technology Integration',
        subjectiveScore: 70,
        objectiveScore: 68,
        benchmarkScore: 80,
        avgScore: 69,
        status: 'poor' as const,
        gapAnalysis: 'Significantly below benchmark',
        rootCauses: ['Outdated infrastructure', 'Limited teacher tech skills', 'Insufficient funding'],
        actionablePoints: ['Invest in digital infrastructure', 'Launch teacher tech training', 'Develop technology roadmap'],
        interpretation: 'Technology integration lags behind benchmarks. Critical area for improvement to prepare students for digital age.',
      },
      {
        dimensionName: 'Inclusive Education & Diversity',
        subjectiveScore: 81,
        objectiveScore: 79,
        benchmarkScore: 80,
        avgScore: 80,
        status: 'good' as const,
        gapAnalysis: 'Meeting inclusion standards',
        rootCauses: ['Inclusive policies in place', 'Staff diversity training implemented'],
        actionablePoints: ['Expand special needs support', 'Enhance cultural competency', 'Strengthen parent collaboration'],
        interpretation: 'Strong commitment to inclusive education with diverse student population well supported.',
      },
      {
        dimensionName: 'Operational Efficiency & Resources',
        subjectiveScore: 77,
        objectiveScore: 75,
        benchmarkScore: 78,
        avgScore: 76,
        status: 'adequate' as const,
        gapAnalysis: 'Operational systems adequate but need optimization',
        rootCauses: ['Manual processes', 'Resource constraints'],
        actionablePoints: ['Implement management systems', 'Optimize resource allocation', 'Improve reporting'],
        interpretation: 'Basic operational systems in place with potential for efficiency improvements.',
      },
      {
        dimensionName: 'Staff Professional Development',
        subjectiveScore: 79,
        objectiveScore: 76,
        benchmarkScore: 80,
        avgScore: 78,
        status: 'adequate' as const,
        gapAnalysis: 'Development programs exist but need enhancement',
        rootCauses: ['Limited training budget', 'Inconsistent professional development plans'],
        actionablePoints: ['Develop comprehensive PD strategy', 'Increase training opportunities', 'Peer learning initiatives'],
        interpretation: 'Professional development programs in place with room for systematic enhancement.',
      },
      {
        dimensionName: 'Infrastructure & Facilities',
        subjectiveScore: 72,
        objectiveScore: 70,
        benchmarkScore: 78,
        avgScore: 71,
        status: 'adequate' as const,
        gapAnalysis: 'Facilities adequate but aging',
        rootCauses: ['Aging buildings', 'Maintenance backlog', 'Limited capital budget'],
        actionablePoints: ['Develop facility upgrade plan', 'Enhance maintenance schedule', 'Seek funding for renovations'],
        interpretation: 'Existing facilities meet basic needs with planned upgrades necessary for long-term sustainability.',
      },
      {
        dimensionName: 'Community & Stakeholder Engagement',
        subjectiveScore: 83,
        objectiveScore: 80,
        benchmarkScore: 80,
        avgScore: 81,
        status: 'good' as const,
        gapAnalysis: 'Above benchmark with strong community partnerships',
        rootCauses: ['Active parent involvement', 'Strong community connections'],
        actionablePoints: ['Expand volunteer programs', 'Strengthen alumni network', 'Develop community partnerships'],
        interpretation: 'Excellent community engagement with strong stakeholder relationships.',
      },
      {
        dimensionName: 'Environmental Sustainability',
        subjectiveScore: 74,
        objectiveScore: 71,
        benchmarkScore: 75,
        avgScore: 73,
        status: 'adequate' as const,
        gapAnalysis: 'Environmental practices developing',
        rootCauses: ['Recent focus on sustainability', 'Limited green initiatives'],
        actionablePoints: ['Expand waste reduction program', 'Develop green curriculum', 'Improve energy efficiency'],
        interpretation: 'Environmental sustainability initiatives underway with opportunity for expansion.',
      },
      {
        dimensionName: 'Student Engagement & Participation',
        subjectiveScore: 84,
        objectiveScore: 81,
        benchmarkScore: 82,
        avgScore: 82,
        status: 'good' as const,
        gapAnalysis: 'Engagement levels above benchmark',
        rootCauses: ['Active student organizations', 'Diverse program offerings'],
        actionablePoints: ['Expand extracurricular activities', 'Enhance student leadership', 'Develop participation tracking'],
        interpretation: 'Strong student engagement with high participation in school activities and programs.',
      },
      {
        dimensionName: 'Achievement & Performance',
        subjectiveScore: 86,
        objectiveScore: 83,
        benchmarkScore: 82,
        avgScore: 84,
        status: 'excellent' as const,
        gapAnalysis: 'Exceeding benchmark with strong performance',
        rootCauses: ['Effective teaching practices', 'Strong student motivation'],
        actionablePoints: ['Maintain current practices', 'Continue performance monitoring', 'Share best practices'],
        interpretation: 'Excellent achievement levels with consistent high performance across all indicators.',
      },
    ];

    const reportData = {
      schoolName: config.schoolName,
      schoolBoard: 'State Board',
      assessmentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      respondents: [
        {
          type: 'teacher' as const,
          responses: progress.actualRespondents.teacher,
          expected: config.expectedRespondents.teacher,
          percentage: Math.round((progress.actualRespondents.teacher / config.expectedRespondents.teacher) * 100),
        },
        {
          type: 'parent' as const,
          responses: progress.actualRespondents.parent,
          expected: config.expectedRespondents.parent,
          percentage: Math.round((progress.actualRespondents.parent / config.expectedRespondents.parent) * 100),
        },
        {
          type: 'student' as const,
          responses: progress.actualRespondents.student,
          expected: config.expectedRespondents.student,
          percentage: Math.round((progress.actualRespondents.student / config.expectedRespondents.student) * 100),
        },
        {
          type: 'admin' as const,
          responses: progress.actualRespondents.admin,
          expected: config.expectedRespondents.admin,
          percentage: Math.round((progress.actualRespondents.admin / config.expectedRespondents.admin) * 100),
        },
      ],
      dimensions,
      gapAnalysis: {
        alignedDimensions: 8,
        overestimatedDimensions: 3,
        underestimatedDimensions: 3,
        averageGap: 2.5,
      },
      executiveSummary: {
        overallHealthIndex: 79,
        status: 'good' as const,
        keyInsights: [
          'Strong academic performance and student engagement are school strengths',
          'Technology integration significantly lags behind benchmarks - critical focus area',
          'Community engagement is excellent with strong stakeholder partnerships',
          'Professional development and leadership structures need systematic strengthening',
        ],
        marketingOpportunities: [
          'Highlight excellent community engagement and stakeholder partnerships',
          'Showcase strong achievement and performance metrics',
          'Emphasize comprehensive student well-being support systems',
          'Market student-centric approach and high engagement levels',
        ],
        criticalAreas: [
          'Technology integration and digital infrastructure',
          'Strategic leadership visibility and communication',
          'Curriculum modernization and assessment redesign',
        ],
        strengths: [
          'Exceptional student achievement and performance',
          'Strong community and stakeholder engagement',
          'Comprehensive student support and well-being systems',
          'Diverse and inclusive school culture',
        ],
      },
      objectiveDataCompleteness: 100,
      recommendedActions: [
        {
          priority: 'critical',
          action: 'Develop and implement comprehensive technology integration roadmap',
          timeline: '6-8 months',
          expectedImpact: 'Transform digital learning capabilities and increase student engagement',
          resourcesRequired: ['Infrastructure investment', 'Teacher training program', 'Technology coordinator'],
        },
        {
          priority: 'high',
          action: 'Launch strategic leadership development and communication enhancement program',
          timeline: '4-6 months',
          expectedImpact: 'Improve vision clarity and stakeholder alignment',
          resourcesRequired: ['Leadership coaching', 'Communication tools', 'Staff workshops'],
        },
        {
          priority: 'high',
          action: 'Conduct comprehensive curriculum audit and modernization initiative',
          timeline: '8-10 months',
          expectedImpact: 'Ensure curriculum alignment with 21st-century competencies',
          resourcesRequired: ['Curriculum specialists', 'Teacher collaboration time', 'Assessment tools'],
        },
        {
          priority: 'medium',
          action: 'Establish facility upgrade and maintenance enhancement program',
          timeline: '12 months',
          expectedImpact: 'Improve learning environment and operational efficiency',
          resourcesRequired: ['Maintenance staff', 'Capital budget', 'Facility management system'],
        },
      ],
    };

    generateComprehensiveDiagnosticReport(reportData);
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
              <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:sticky lg:top-4">
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
            </div>
          </div>
        )}

        {/* Stage 4: Analysis - Professional Dashboard */}
        {stage === 'analysis' && config && progress && showReport && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Diagnostic Report</h2>
              <button
                onClick={() => setShowReport(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                ← Back
              </button>
            </div>

            <ProfessionalDiagnosticDashboard
              schoolName={config.schoolName}
              assessmentDate={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              dimensions={[
                {
                  id: 'dim-1',
                  name: 'Academic Excellence',
                  icon: 'BookOpen',
                  subjective: 82,
                  benchmark: 80,
                  objective: 78,
                  gap: 4,
                  status: 'good',
                  perception: 'Aligned with reality',
                  interpretation: 'Academic performance is strong with solid teaching practices.',
                  rootCauses: ['Minor curriculum coverage gaps'],
                  actionablePoints: ['Strengthen advanced coursework'],
                },
                {
                  id: 'dim-2',
                  name: 'Leadership & Governance',
                  icon: 'Users',
                  subjective: 78,
                  benchmark: 80,
                  objective: 75,
                  gap: 3,
                  status: 'adequate',
                  perception: 'Below benchmark',
                  interpretation: 'Leadership structure exists but requires strengthening.',
                  rootCauses: ['Limited strategic vision communication'],
                  actionablePoints: ['Develop clear strategic plan'],
                },
              ]}
              respondents={[
                {
                  type: 'teacher',
                  count: progress.actualRespondents.teacher,
                  total: config.expectedRespondents.teacher,
                  percentage: Math.round((progress.actualRespondents.teacher / config.expectedRespondents.teacher) * 100),
                },
                {
                  type: 'parent',
                  count: progress.actualRespondents.parent,
                  total: config.expectedRespondents.parent,
                  percentage: Math.round((progress.actualRespondents.parent / config.expectedRespondents.parent) * 100),
                },
                {
                  type: 'student',
                  count: progress.actualRespondents.student,
                  total: config.expectedRespondents.student,
                  percentage: Math.round((progress.actualRespondents.student / config.expectedRespondents.student) * 100),
                },
                {
                  type: 'admin',
                  count: progress.actualRespondents.admin,
                  total: config.expectedRespondents.admin,
                  percentage: Math.round((progress.actualRespondents.admin / config.expectedRespondents.admin) * 100),
                },
              ]}
            />

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <button
                onClick={handleDownloadReport}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Comprehensive Report (PDF)
              </button>
            </div>
          </div>
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

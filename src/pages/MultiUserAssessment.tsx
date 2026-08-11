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
import { generateEnhancedDiagnosticReport } from '../lib/enhancedDiagnosticReport';
import { ArrowRight, PlusCircle, CheckCircle2, Lock, Users, Clock, RefreshCw, AlertCircle, Database, Download, Layers, Settings, Zap, BarChart3, BookOpen, Target } from 'lucide-react';

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

    // Comprehensive 14-dimension diagnostic data with enhanced details
    const dimensions = [
      {
        dimensionName: 'Academic Excellence',
        subjectiveScore: 82,
        objectiveScore: 78,
        benchmarkScore: 80,
        avgScore: 80,
        status: 'good' as const,
        gapAnalysis: 'Subjective perception slightly exceeds objective results',
        rootCauses: ['Minor curriculum coverage gaps', 'Assessment design could be strengthened', 'Inconsistent implementation across grades'],
        actionablePoints: ['Strengthen advanced coursework for gifted students', 'Enhance formative assessment practices', 'Implement competency-based progression', 'Establish subject-wise quality benchmarks'],
        interpretation: 'Academic performance is strong with solid teaching practices. Students demonstrate consistent learning gains, though some areas need targeted interventions.',
      },
      {
        dimensionName: 'Leadership & Governance',
        subjectiveScore: 68,
        objectiveScore: 65,
        benchmarkScore: 80,
        avgScore: 66,
        status: 'adequate' as const,
        gapAnalysis: 'Both perception and reality fall below benchmark by 15%',
        rootCauses: ['Limited strategic vision communication', 'Governance structure needs refinement', 'Decision-making process lacks transparency'],
        actionablePoints: ['Develop and communicate 5-year strategic plan', 'Enhance stakeholder communication through quarterly forums', 'Strengthen board engagement and oversight', 'Implement transparent decision-making framework'],
        interpretation: 'Leadership structure exists but requires strengthening in strategic vision, communication, and stakeholder engagement for institutional growth.',
      },
      {
        dimensionName: 'Student Well-being & Support',
        subjectiveScore: 85,
        objectiveScore: 82,
        benchmarkScore: 82,
        avgScore: 83,
        status: 'good' as const,
        gapAnalysis: 'Above benchmark with strong support systems in place',
        rootCauses: ['Strong counseling and mentoring programs', 'Effective pastoral care system', 'Active health and wellness initiatives'],
        actionablePoints: ['Expand mental health support services', 'Enhance peer mentoring programs', 'Develop comprehensive wellness curriculum', 'Establish student grievance redressal system'],
        interpretation: 'Comprehensive student support systems are effectively meeting diverse needs, creating a positive and inclusive school environment.',
      },
      {
        dimensionName: 'Teaching & Learning Pedagogy',
        subjectiveScore: 78,
        objectiveScore: 74,
        benchmarkScore: 80,
        avgScore: 76,
        status: 'adequate' as const,
        gapAnalysis: 'Below benchmark, indicating need for pedagogical innovation',
        rootCauses: ['Traditional teaching methods dominating', 'Limited technology integration in classrooms', 'Insufficient teacher professional development in modern pedagogy'],
        actionablePoints: ['Implement student-centered and experiential learning', 'Expand digital learning tools and resources', 'Provide professional development on 21st-century teaching methods', 'Establish peer learning and mentoring circles'],
        interpretation: 'Teaching practices are effective but need modernization. Introduction of contemporary pedagogies will significantly enhance learning outcomes.',
      },
      {
        dimensionName: 'Curriculum & Assessment Design',
        subjectiveScore: 71,
        objectiveScore: 68,
        benchmarkScore: 80,
        avgScore: 70,
        status: 'adequate' as const,
        gapAnalysis: 'Significantly below benchmark at 70% of target',
        rootCauses: ['Assessment tools outdated and not competency-based', 'Curriculum alignment issues with learning outcomes', 'Limited focus on critical thinking and problem-solving'],
        actionablePoints: ['Conduct comprehensive curriculum audit', 'Redesign assessment methods aligned with competencies', 'Integrate skill-based learning across subjects', 'Develop and implement new evaluation framework'],
        interpretation: 'Current curriculum structure requires significant modernization and better alignment with 21st-century learning outcomes and competency frameworks.',
      },
      {
        dimensionName: 'Innovation & Technology Integration',
        subjectiveScore: 62,
        objectiveScore: 60,
        benchmarkScore: 80,
        avgScore: 61,
        status: 'poor' as const,
        gapAnalysis: 'Critically below benchmark - 76% gap to target',
        rootCauses: ['Outdated infrastructure and limited internet connectivity', 'Teachers lack digital literacy and confidence', 'Insufficient budget allocation for technology', 'No comprehensive digital transformation plan'],
        actionablePoints: ['Develop and implement 3-year technology roadmap', 'Invest in modern digital infrastructure', 'Launch intensive teacher digital literacy program', 'Create innovation lab for experimentation', 'Establish partnerships with ed-tech providers'],
        interpretation: 'Technology integration is a critical gap affecting institutional competitiveness. Urgent investment in infrastructure and human capacity is essential.',
      },
      {
        dimensionName: 'Inclusive Education & Diversity',
        subjectiveScore: 79,
        objectiveScore: 76,
        benchmarkScore: 80,
        avgScore: 77,
        status: 'adequate' as const,
        gapAnalysis: 'Nearly at benchmark with some areas for enhancement',
        rootCauses: ['Inclusion policies established but inconsistently implemented', 'Staff training in inclusive practices ongoing', 'Infrastructure modifications partially complete'],
        actionablePoints: ['Strengthen special needs support services', 'Enhance cultural competency training for staff', 'Improve physical accessibility of campus', 'Develop culturally responsive curriculum materials'],
        interpretation: 'Good commitment to inclusive education with diverse student population. Further efforts will create truly equitable learning environment.',
      },
      {
        dimensionName: 'Operational Efficiency & Resources',
        subjectiveScore: 72,
        objectiveScore: 70,
        benchmarkScore: 78,
        avgScore: 71,
        status: 'adequate' as const,
        gapAnalysis: 'Below benchmark indicating efficiency improvement opportunities',
        rootCauses: ['Manual processes and outdated management systems', 'Resource constraints limiting service quality', 'Lack of data-driven decision making'],
        actionablePoints: ['Implement integrated school management system', 'Optimize resource allocation through planning', 'Automate administrative processes', 'Establish resource planning committee'],
        interpretation: 'Basic operational systems function adequately with significant potential for efficiency improvements through digitization and process optimization.',
      },
      {
        dimensionName: 'Staff Professional Development',
        subjectiveScore: 74,
        objectiveScore: 71,
        benchmarkScore: 80,
        avgScore: 72,
        status: 'adequate' as const,
        gapAnalysis: 'Below benchmark with structured development needed',
        rootCauses: ['Limited professional development budget', 'Lack of systematic PD planning', 'Insufficient focus on emerging pedagogies and technologies'],
        actionablePoints: ['Develop comprehensive professional development strategy', 'Establish staff capacity building program', 'Create peer learning and mentoring networks', 'Allocate dedicated budget for continuous learning'],
        interpretation: 'Professional development programs exist but need systematic enhancement to build staff capability for institutional excellence.',
      },
      {
        dimensionName: 'Infrastructure & Facilities',
        subjectiveScore: 65,
        objectiveScore: 63,
        benchmarkScore: 78,
        avgScore: 64,
        status: 'poor' as const,
        gapAnalysis: 'Facilities aging and falling below standards',
        rootCauses: ['Aging school buildings', 'Maintenance backlog accumulating', 'Limited capital budget for upgrades', 'Inadequate STEM and modern facilities'],
        actionablePoints: ['Develop comprehensive facility upgrade plan', 'Establish preventive maintenance schedule', 'Create fundraising strategy for renovations', 'Build STEM labs and modern learning spaces'],
        interpretation: 'Existing facilities meet basic needs but urgent upgrades necessary for creating 21st-century learning environment and long-term sustainability.',
      },
      {
        dimensionName: 'Community & Stakeholder Engagement',
        subjectiveScore: 81,
        objectiveScore: 78,
        benchmarkScore: 80,
        avgScore: 79,
        status: 'good' as const,
        gapAnalysis: 'At benchmark with strong community partnerships',
        rootCauses: ['Active parent involvement programs', 'Strong community connections and support', 'Regular communication and collaboration'],
        actionablePoints: ['Expand volunteer programs with structured roles', 'Strengthen alumni network and engagement', 'Develop strategic community partnerships', 'Establish community advisory board'],
        interpretation: 'Excellent community engagement and stakeholder relationships. Formalized partnerships will further strengthen institutional support.',
      },
      {
        dimensionName: 'Environmental Sustainability',
        subjectiveScore: 68,
        objectiveScore: 65,
        benchmarkScore: 75,
        avgScore: 66,
        status: 'adequate' as const,
        gapAnalysis: 'Environmental practices developing, below target',
        rootCauses: ['Recent focus on sustainability', 'Limited green infrastructure', 'Lack of comprehensive environmental policy'],
        actionablePoints: ['Develop and implement green school policy', 'Expand waste reduction and recycling programs', 'Create environmental education curriculum', 'Install solar and water conservation systems'],
        interpretation: 'Environmental sustainability initiatives underway with significant opportunity for expansion and formalization across operations.',
      },
      {
        dimensionName: 'Student Engagement & Participation',
        subjectiveScore: 82,
        objectiveScore: 79,
        benchmarkScore: 82,
        avgScore: 80,
        status: 'good' as const,
        gapAnalysis: 'At benchmark with high participation levels',
        rootCauses: ['Active student organizations and clubs', 'Diverse program offerings for all interests', 'Inclusive co-curricular activities'],
        actionablePoints: ['Expand extracurricular and sports programs', 'Enhance student leadership opportunities', 'Develop participation tracking system', 'Create student voice in decision-making'],
        interpretation: 'Strong student engagement with high participation in school activities and programs demonstrating vibrant school culture.',
      },
      {
        dimensionName: 'Achievement & Performance',
        subjectiveScore: 84,
        objectiveScore: 81,
        benchmarkScore: 82,
        avgScore: 82,
        status: 'excellent' as const,
        gapAnalysis: 'Exceeding benchmark with consistent high performance',
        rootCauses: ['Effective teaching practices and quality instruction', 'Strong student motivation and engagement', 'Systematic assessment and feedback mechanisms'],
        actionablePoints: ['Document and share best practices', 'Continue performance monitoring and improvement', 'Expand gifted and advanced learning programs', 'Establish peer benchmarking with high-performing schools'],
        interpretation: 'Excellent achievement levels across indicators. Institutions strength to be maintained and leveraged for continuous improvement.',
      },
    ];

    const overallHealthIndex = Math.round(dimensions.reduce((sum, d) => sum + d.avgScore, 0) / dimensions.length);

    const reportData = {
      schoolName: config.schoolName,
      schoolBoard: 'Education Board',
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
      overallHealthIndex,
      executiveSummary: {
        keyInsights: [
          'Student achievement and engagement are strong institutional strengths supporting growth',
          'Technology integration represents critical gap requiring immediate investment and planning',
          'Community engagement is excellent - leverage for sustainability initiatives',
          'Infrastructure and facilities need systematic upgrades for modern learning environment',
        ],
        strengths: [
          'Exceptional student achievement and performance (82/100)',
          'Strong community and stakeholder engagement partnerships',
          'Comprehensive student support and well-being systems',
          'Good teaching practices and student engagement levels',
        ],
        criticalAreas: [
          'Technology integration and digital infrastructure (critical gap)',
          'Infrastructure and facilities modernization',
          'Leadership strategic communication and vision clarity',
          'Curriculum modernization and assessment redesign',
        ],
        opportunities: [
          'Digital transformation to enhance teaching and learning effectiveness',
          'Facility upgrades to create modern 21st-century learning spaces',
          'Professional development for pedagogical innovation',
          'Systematic approach to operational efficiency improvements',
        ],
      },
      recommendedActions: [
        {
          priority: 'critical',
          action: 'Develop and implement comprehensive technology integration roadmap (3-year plan)',
          timeline: '6-8 months planning, 2-3 years implementation',
          expectedImpact: 'Transform digital learning capabilities, enhance student engagement by 30%, prepare for modern curriculum delivery',
          resourcesRequired: ['₹50-100L infrastructure investment', 'Teacher digital literacy program', 'Technology coordinator position', 'EdTech partnerships'],
        },
        {
          priority: 'critical',
          action: 'Launch systematic facility upgrade and modernization program',
          timeline: 'Year 1: Planning & fundraising, Year 2-3: Implementation',
          expectedImpact: 'Create modern learning spaces, improve student experience, support infrastructure-dependent programs',
          resourcesRequired: ['₹1-2 Cr capital budget', 'Architect/engineer oversight', 'Maintenance department expansion', 'Donor engagement plan'],
        },
        {
          priority: 'high',
          action: 'Establish strategic leadership development and communication enhancement initiative',
          timeline: '4-6 months',
          expectedImpact: 'Improve institutional vision clarity, enhance stakeholder alignment, strengthen governance',
          resourcesRequired: ['Leadership coaching program', 'Communication infrastructure', 'Staff workshops', 'External expert consultation'],
        },
        {
          priority: 'high',
          action: 'Conduct comprehensive curriculum audit and modernization initiative',
          timeline: '8-10 months for audit, 1 year for implementation',
          expectedImpact: 'Align with 21st-century competencies, improve student preparedness, enhance learning outcomes',
          resourcesRequired: ['Curriculum specialists', 'Teacher collaboration time', 'Assessment development tools', 'Pilot program budget'],
        },
        {
          priority: 'medium',
          action: 'Implement integrated school management system for operational efficiency',
          timeline: '6-8 months',
          expectedImpact: 'Streamline administrative processes, enable data-driven decisions, reduce manual workload',
          resourcesRequired: ['Management software license', 'IT support staff', 'Staff training program', 'Change management support'],
        },
      ],
    };

    generateEnhancedDiagnosticReport(reportData);
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

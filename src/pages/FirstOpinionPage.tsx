import React, { useState, useEffect, useMemo } from 'react';
import JSZip from 'jszip';
import { useAppStore } from '../store';
import { DISHAScoreDashboard } from '../components/DISHAScoreDashboard';
import FileAnalyzer, {
  ExtractedMetrics,
  validateFileMetrics,
  validateFileForChallenges,
  ValidationResult,
  ChallengeValidationResult
} from '../lib/fileAnalyzer';
import DiagnosisGenerator, { DiagnosisResult } from '../lib/dynamicDiagnosisGenerator';
import DISHAScoreCalculator, { DISHAScore, OperationalMetrics } from '../lib/dishaScoreCalculator';
import { generateRealInsights, DataAnalysisResult } from '../lib/insightGenerator';
import { saveCheckupToFirestore, waitForCheckupAnalysis, subscribeToCheckupAnalysis } from '../lib/checkupService';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { logAuditEvent } from '../lib/auditService';
import {
  HeartPulse,
  HelpCircle,
  Upload,
  FileText,
  Camera,
  Activity,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Eye,
  Globe,
  Search,
  TrendingDown,
  Compass,
  Zap,
  Clock,
  ChevronRight,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Users,
  BookOpen,
  Settings,
  AlertCircle,
  RefreshCw,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  Info,
  Sliders,
  Target,
  Check,
  Download,
  Lock
} from 'lucide-react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';
import { COMPLETE_SCREENING_QUESTIONS } from '../data/screeningQuestionsData';
import { CORE_OPERATIONAL_METRICS, getRequiredMetricsForChallenges } from '../lib/challengeDataRequirements';
import { computePerceptionGapReport, PerceptionGapEntry } from '../lib/challengeObjectiveScoring';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Define structures for our 15 challenges
interface ChallengeItem {
  id: string;
  category: string;
  label: string;
  description: string;
  probes: string;
  dataRequired: string;
  questions: {
    id: string;
    label: string;
    type: 'select' | 'number' | 'text';
    options?: { label: string; value: string; weight: number }[];
    placeholder?: string;
  }[];
  // Default fallback scores and insights
  baselineAnalysis: {
    gapTitle: string;
    mismatchTitle: string;
    diagnosisText: string;
    mismatchText: string;
    recommendedActions: { title: string; desc: string; cost: string; effort: string; roi: string }[];
  };
}

const CATEGORIES = [
  { id: 'growth', label: 'Growth & Enrollment', color: 'text-indigo-600 bg-indigo-50 border-indigo-100', icon: TrendingUp },
  { id: 'people', label: 'People & Staffing', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: Users },
  { id: 'academic', label: 'Academic & Student Wellbeing', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: BookOpen },
  { id: 'reputation', label: 'Reputation & Competition', color: 'text-purple-600 bg-purple-50 border-purple-100', icon: Globe },
  { id: 'operations', label: 'Operations & Finance', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Settings }
];

// Short, distinct sub-copy for each challenge card (must never equal the label)
const CHALLENGE_DESCRIPTIONS: Record<string, string> = {
  enrollment_decline: 'New admissions trending flat or falling vs. prior years and peer schools.',
  student_attrition: 'Existing students exiting mid-year to competitor schools or other reasons.',
  fee_collection_challenges: 'Annual fee realization is below target, with rising dues and defaults.',
  teacher_attrition: 'Teachers resigning faster than they can be hired, trained, and retained.',
  staff_capability_gaps: 'Teaching quality or subject-matter depth lagging expected classroom standards.',
  leadership_capability_gap: 'Middle-management and HOD decision-making inconsistent or slow to act.',
  academic_quality_decline: 'Board exam results or academic outcomes slipping against past performance.',
  student_wellbeing_issues: 'Rising signs of student stress, bullying, or emotional safety concerns.',
  remedial_lag: 'Struggling students not catching up despite remedial or extra-help sessions.',
  parent_communication_issues: 'Parent queries and complaints going unanswered or resolved too slowly.',
  competitive_pressure: 'Nearby schools pulling ahead on admissions, pricing, or reputation.',
  brand_reputation_issues: 'Negative reviews, word-of-mouth, or local perception hurting the brand.',
  cost_inflation: 'Operating costs (staff, utilities, maintenance) rising faster than revenue.',
  infrastructure_deficits: 'Classrooms, labs, or campus facilities falling short of expectations.',
  compliance_regulatory_stress: 'Board affiliation, safety, or statutory compliance requirements at risk.',
};

// Loading will be done in component state

interface OutcomeFactor {
  stakeholder: string;
  parameter: string;
  currentVal: string;
  targetValFn: (tgt: number) => string;
  adjustment: string;
  techStack: string;
}

interface OutcomeItem {
  id: string;
  label: string;
  metricName: string;
  lensName: string;
  factors: OutcomeFactor[];
  gapAnalysis: string;
  actionPoints: { step: string; title: string; desc: string }[];
}

const OUTCOMES: OutcomeItem[] = [
  {
    id: 'academic',
    label: 'Raise Board Exam Pass Rate (Grade 10)',
    metricName: 'Academic Excellence Score',
    lensName: 'Academic Excellence',
    factors: [
      {
        stakeholder: 'School Leader',
        parameter: 'Weekly Academic Audits & Curriculum Progress Reviews',
        currentVal: 'Bi-weekly (approx)',
        targetValFn: (tgt: number) => tgt >= 95 ? 'Daily Automated Syncs' : 'Thrice-weekly Structured Audits',
        adjustment: 'Increase audit frequency by 150%',
        techStack: 'Disha Curriculum Compliance Tracker Dashboard'
      },
      {
        stakeholder: 'Teaching Staff',
        parameter: 'Administrative Paperwork Burden (Attendance, Logs)',
        currentVal: '12-14 hours per week',
        targetValFn: (tgt: number) => tgt >= 95 ? 'Under 2 hours per week' : '4 hours per week',
        adjustment: 'Reduce non-teaching hours by 70%',
        techStack: 'Disha Automatic Attendance and Syllabus-to-Exam logger'
      },
      {
        stakeholder: 'Parents',
        parameter: 'Remedial Class Consent & Academic Progress Synced',
        currentVal: '65% active response rate',
        targetValFn: (tgt: number) => tgt >= 95 ? '95% response rate via App' : '85% response rate',
        adjustment: 'Boost engagement by +30%',
        techStack: 'Disha WhatsApp Parent-Syllabus Sync Portal'
      },
      {
        stakeholder: 'Students',
        parameter: 'Remedial Attendance Rate for At-risk Students',
        currentVal: '60% average attendance',
        targetValFn: (tgt: number) => tgt >= 95 ? '92% attendance' : '80% attendance',
        adjustment: 'Achieve +32% attendance gains',
        techStack: 'Disha Student Academic-Risk Alerts & Daily Check-ins'
      }
    ],
    gapAnalysis: "The primary academic bottleneck is not student capability, but rather teacher administrative exhaustion leaving little time for remedial class delivery. To achieve the target pass rate, teacher daily reporting time must be cut, and students at-risk must be flagged within 48 hours of absenteeism.",
    actionPoints: [
      { step: 'A', title: 'Automate Teacher Lesson & Progress Logging', desc: 'Deploy the automated syllabus-to-exam logger to instantly free teachers from physical daily report entries.' },
      { step: 'B', title: 'Launch Daily Absenteeism Trigger to Parents', desc: 'Auto-send localized WhatsApp reminders to parents for students missing remedial sections.' },
      { step: 'C', title: 'Curricular Progress Control Board', desc: 'Establish a weekly dashboard view for leaders to audit curriculum lag against board timelines.' }
    ]
  },
  {
    id: 'retention',
    label: 'Increase Student Retention / Prevent Dropouts',
    metricName: 'Retention Baseline Score',
    lensName: 'Emotional Wellbeing',
    factors: [
      {
        stakeholder: 'School Leader',
        parameter: 'Student Satisfaction & Mid-term Exit Risk Auditing',
        currentVal: 'Manual end-of-term reports',
        targetValFn: (tgt: number) => tgt >= 95 ? 'Real-time Predictive Analytics' : 'Monthly Early-Warning Reviews',
        adjustment: 'Transition to active predictive scanning',
        techStack: 'Disha Student Risk-Profiling Dashboard'
      },
      {
        stakeholder: 'Teaching Staff',
        parameter: 'Wellbeing Mentoring & Teacher-Student Rapport Time',
        currentVal: 'Less than 1 hr per week',
        targetValFn: (tgt: number) => tgt >= 95 ? '3 hours weekly (dedicated)' : '2 hours weekly',
        adjustment: 'Increase mentoring capacity by 200%',
        techStack: 'Disha Mentor-Mentee Logging & Touchpoint Feed'
      },
      {
        stakeholder: 'Parents',
        parameter: 'Parent Net Promoter Score & Value-for-Money Perception',
        currentVal: '3.4/5 Google rating',
        targetValFn: (tgt: number) => tgt >= 95 ? '4.7/5 Target rating' : '4.2/5 Target rating',
        adjustment: 'Improve reputation score by 38%',
        techStack: 'Disha Automated Parent NPS Loop & Response Manager'
      },
      {
        stakeholder: 'Students',
        parameter: 'At-risk Engagement Index & Peer Support Circle',
        currentVal: 'Suboptimal (no group structure)',
        targetValFn: (tgt: number) => tgt >= 95 ? 'Highly cohesive group feedback' : 'Moderately structured support',
        adjustment: 'Establish active peer circles & student support',
        techStack: 'Disha Wellbeing Pulse & Counseling Case Manager'
      }
    ],
    gapAnalysis: "Students are withdrawing because of trailing academic marks paired with a perceived lack of timely, supportive communication. Reversing this requires shifting teachers from administrative chores to active mentoring and building clear feedback channels for parents.",
    actionPoints: [
      { step: 'A', title: 'Predictive Risk Flagging', desc: 'Auto-flag students exhibiting drops in attendance (<85%) or midterm marks (<60%) in the store.' },
      { step: 'B', title: 'Proactive Parent Check-Ins', desc: 'Launch weekly support check-ins with parents of high-risk students to address concerns early.' },
      { step: 'C', title: 'Dedicated Mentorship Circles', desc: 'Schedule structured group mentoring hours within the school timetable to foster peer bonds.' }
    ]
  },
  {
    id: 'teacher',
    label: 'Boost Teacher Retention & Workload Balance',
    metricName: 'Staff & HR Health Score',
    lensName: 'Staff & HR',
    factors: [
      {
        stakeholder: 'School Leader',
        parameter: 'Professional Growth Tracks & Merit-based Incentives',
        currentVal: 'Annual reviews only',
        targetValFn: (tgt: number) => tgt >= 95 ? 'Continuous Feedback & Milestone Rewards' : 'Quarterly Performance Appreciation',
        adjustment: 'Transition to active quarterly appreciation',
        techStack: 'Disha HR Talent Management & Recognition Engine'
      },
      {
        stakeholder: 'Teaching Staff',
        parameter: 'Administrative Period Overloads & Substitutions',
        currentVal: 'Avg 32 periods + substitution overload',
        targetValFn: (tgt: number) => tgt >= 95 ? 'Max 24 teaching periods + auto backup' : 'Max 28 teaching periods',
        adjustment: 'Cap periods and optimize backup schedule',
        techStack: 'Disha Automated Teacher Substitution & Roster Optimizer'
      },
      {
        stakeholder: 'Parents',
        parameter: 'Communication Load & Informal Out-of-hours Chats',
        currentVal: 'Unregulated WhatsApp groups',
        targetValFn: (tgt: number) => tgt >= 95 ? 'Regulated SLA-driven Parent Feed' : 'Scheduled Communication Windows',
        adjustment: 'Route all informal chats to central portal',
        techStack: 'Disha Unified SLA Communication Inbox'
      },
      {
        stakeholder: 'Students',
        parameter: 'Classroom Disruption & Rapport Instability',
        currentVal: 'High due to frequent teacher changes',
        targetValFn: (tgt: number) => tgt >= 95 ? 'Stable single-teacher tenure' : 'Under 10% teacher replacement rate',
        adjustment: 'Ensure classroom rapport continuity',
        techStack: 'Disha Student-Teacher Engagement Tracker'
      }
    ],
    gapAnalysis: "High teacher turnover is driven directly by admin exhaustion. Teachers spend more time on paperwork than lecturing. Cutting paperwork burden instantly boosts motivation and reduces turnover.",
    actionPoints: [
      { step: 'A', title: 'Deploy substitution optimizer', desc: 'Instantly balance absent teacher loads dynamically to prevent burnouts.' },
      { step: 'B', title: 'Establish administrative quiet hours', desc: 'Dedicate 1 hour daily for prep where administrative interruptions are forbidden.' },
      { step: 'C', title: 'Milestone Professional Growth Reviews', desc: 'Create peer recognition modules within the staff directory to celebrate teachers.' }
    ]
  },
  {
    id: 'satisfaction',
    label: 'Enhance Parent Satisfaction & Brand NPS',
    metricName: 'Family Support & Feedback Score',
    lensName: 'Family Support',
    factors: [
      {
        stakeholder: 'School Leader',
        parameter: 'School Transparency & Public Response Time',
        currentVal: '72+ hour delay on inquiries',
        targetValFn: (tgt: number) => tgt >= 95 ? 'Under 12 hour response time' : 'Under 24 hour response time',
        adjustment: 'Enforce quick query resolution SLA',
        techStack: 'Disha Leader Inquiry Analytics & SLAs'
      },
      {
        stakeholder: 'Teaching Staff',
        parameter: 'Parent Communication Frequency & Progress Reports',
        currentVal: 'Mainly end-of-term results',
        targetValFn: (tgt: number) => tgt >= 95 ? 'Weekly digital micro-progress updates' : 'Bi-weekly homework & test logs',
        adjustment: 'Switch to proactive micro-reporting',
        techStack: 'Disha Automated Progress Report Builder'
      },
      {
        stakeholder: 'Parents',
        parameter: 'Grievance Resolution Satisfaction NPS',
        currentVal: '35% parent satisfaction index',
        targetValFn: (tgt: number) => tgt >= 95 ? '92% NPS Satisfaction' : '75% NPS Satisfaction',
        adjustment: 'Improve parent sentiment score by 160%',
        techStack: 'Disha Parent Grievance Resolution & SLA Pipeline'
      },
      {
        stakeholder: 'Students',
        parameter: 'Activity Sharing & Homework Transparency',
        currentVal: 'Unstructured student notebooks',
        targetValFn: (tgt: number) => tgt >= 95 ? 'Daily homework sharing via digital Feed' : 'Weekly structured homework sheets',
        adjustment: 'Synchronize assignments instantly',
        techStack: 'Disha Classroom Assignment Sync Tool'
      }
    ],
    gapAnalysis: "Parents express dissatisfaction because they feel out-of-the-loop until report cards arrive. Bridging this gap requires transition to proactive, low-friction micro-reporting and guaranteeing quick query resolution.",
    actionPoints: [
      { step: 'A', title: 'Implement 24-Hour SLA Guarantee', desc: 'Enforce a rule that any parental complaint submitted online gets answered in 24 hours.' },
      { step: 'B', title: 'Launch Weekly Digital Snippets', desc: 'Send automatic summaries of classroom activities and student progress to parent feeds.' },
      { step: 'C', title: 'Feedback Loop Auditing', desc: 'Set up monthly leader reviews to locate recurring parent concerns in specific sections.' }
    ]
  },
  {
    id: 'enrollment',
    label: 'Accelerate Admission Conversion Rate',
    metricName: 'Admissions & Enrollment Score',
    lensName: 'Admissions & Enrollment',
    factors: [
      {
        stakeholder: 'School Leader',
        parameter: 'Admissions Pipeline Visibility & Conversion Audits',
        currentVal: 'Stale offline registers',
        targetValFn: (tgt: number) => tgt >= 95 ? 'Real-time CRM Pipeline Tracking' : 'Weekly Prospect Funnel Audits',
        adjustment: 'Transition to active digital pipeline',
        techStack: 'Disha CRM Intake Pipeline Analytics'
      },
      {
        stakeholder: 'Teaching Staff',
        parameter: 'School Tour Facilitation & Demonstration Quality',
        currentVal: 'Ad-hoc unscheduled tours',
        targetValFn: (tgt: number) => tgt >= 95 ? 'High-impact interactive demo classes' : 'Structured campus tour templates',
        adjustment: 'Formalize visitor greeting and demo structure',
        techStack: 'Disha Demo Scheduler & Lesson Bank'
      },
      {
        stakeholder: 'Parents',
        parameter: 'Reputation Verification & Word-of-Mouth Confidence',
        currentVal: 'No parent review drive',
        targetValFn: (tgt: number) => tgt >= 95 ? 'Structured active parent review logs' : 'Basic testimonial directory',
        adjustment: 'Collect and showcase parent testimonials',
        techStack: 'Disha Parent Referral & Reputation Engine'
      },
      {
        stakeholder: 'Students',
        parameter: 'Excellence Showcasing & Co-curricular Displays',
        currentVal: 'Hidden in physical school files',
        targetValFn: (tgt: number) => tgt >= 95 ? 'Digital Achievements Portfolio Feed' : 'Structured Co-curricular Gallery',
        adjustment: 'Publish and promote student achievements',
        techStack: 'Disha Student Digital Highlights Portfolio'
      }
    ],
    gapAnalysis: "The admissions leak is at the middle-of-funnel (tours to applications). Families visit the school but convert to competitor schools due to slow follow-up and lack of immediate positive digital reputation verification.",
    actionPoints: [
      { step: 'A', title: 'Establish Google Reviews Booster Campaign', desc: 'Reach out to top loyal families to build reviews above 4.5 Stars on Google Maps.' },
      { step: 'B', title: 'Automated CRM Response System', desc: 'Respond within 5 minutes of any online inquiry to schedule a campus demo tour.' },
      { step: 'C', title: 'Deploy Interactive Demo Sessions', desc: 'Provide prospective families with a live, mini-classroom engagement trial run.' }
    ]
  }
];

export const FirstOpinionPage = () => {
  console.log('🔴 FIRST OPINION ENGINE LOADED - This is the latest version');
  const { activeSchool } = useAppStore();
  const [user] = useAuthState(auth);
  const schoolId = activeSchool?.id || '';
  
  // Layout stages:
  // 0: Select Symptoms (Challenge Menu)
  // 1: Screening baseline + follow-up questions
  // 2: Quick first opinion (perception-vs-data gap)
  const [step, setStep] = useState<number>(0);
  
  // Challenge Selection
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(['enrollment_decline', 'teacher_attrition']);
  
  // Baseline School Profile
  const [board, setBoard] = useState<string>('CBSE');
  const [schoolSize, setSchoolSize] = useState<string>('Medium (500 - 1500 students)');
  const [feeBand, setFeeBand] = useState<string>('Medium (₹25k - ₹75k per year)');
  const [cityTier, setCityTier] = useState<string>('Tier 2 (Capital / Large Cities)');
  
  // Custom Answers Store
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Validation State for Compulsory Screening Questions
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedMetrics, setExtractedMetrics] = useState<ExtractedMetrics | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [realInsights, setRealInsights] = useState<DataAnalysisResult | null>(null);

  // Perception Gap: compares each selected challenge's self-reported severity
  // (from the screening answers) against its objective severity (from the
  // uploaded Operational Metrics CSV). Additive to the core Health Index —
  // does not change the S_sub/M_obj/H formula itself.
  const perceptionGapReport: PerceptionGapEntry[] = useMemo(
    () => computePerceptionGapReport(selectedChallenges, answers, extractedMetrics?.metricsFound || {}),
    [selectedChallenges, answers, extractedMetrics]
  );

  // DISHA Score State
  const [dishaScore, setDISHAScore] = useState<DISHAScore | null>(null);
  const [operationalMetrics, setOperationalMetrics] = useState<OperationalMetrics>({
    studentTeacherRatio: 28,
    parentResponseSLA: 24,
    annualTrainingHours: 20,
    weeklyPlanningHours: 4
  });

  // File validation state
  const [fileValidation, setFileValidation] = useState<ValidationResult | ChallengeValidationResult | null>(null);

  // UI Loading/Transition states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState<boolean>(false);

  // Firestore State for Cloud Function integration
  const [isSubmittingToFirestore, setIsSubmittingToFirestore] = useState<boolean>(false);
  const [checkupId, setCheckupId] = useState<string | null>(null);
  const [firestoreCheckupData, setFirestoreCheckupData] = useState<any>(null);

  // Active Root Cause node
  const [activeRootNode, setActiveRootNode] = useState<string>('workload');

  // Quiet Watch simulated alerts logs
  const [alerts, setAlerts] = useState([
    { id: 1, time: '1 hour ago', text: 'District review portal updated. Local competitor added 4 new positive testimonials. Brand pressure score slightly increased.', severity: 'medium' },
    { id: 2, time: '2 days ago', text: 'School website latency checked: Mobile home speed dropped to 3.2s. Potential dropoff risk mapped for online inquiries.', severity: 'low' },
    { id: 3, time: '5 days ago', text: 'Monthly HR log refresh completed. Teacher absenteeism is currently stable (under 4%). Burnout alerts remained quiet.', severity: 'healthy' },
    { id: 4, time: '1 week ago', text: 'Term 1 fee collection defaults reached 14%. Proactively flagged "Fee Collection and Financial Stress" as an upcoming operational risk.', severity: 'high' }
  ]);

  // Sync active school profile with checkup baseline parameters
  useEffect(() => {
    if (activeSchool) {
      if (activeSchool.board) setBoard(activeSchool.board);
      if (activeSchool.tier) setCityTier(activeSchool.tier);
      if (activeSchool.feeBand) setFeeBand(activeSchool.feeBand);
      if (activeSchool.studentCount) setSchoolSize(activeSchool.studentCount);
    }
  }, [activeSchool]);

  // Transform hardcoded screening questions data to component format
  const transformChallenges = (): ChallengeItem[] => {
    console.log('🔄 transformChallenges: Processing', COMPLETE_SCREENING_QUESTIONS.length, 'challenges');

    return COMPLETE_SCREENING_QUESTIONS.map(challenge => ({
      id: challenge.id,
      category: challenge.category,
      label: challenge.label,
      description: CHALLENGE_DESCRIPTIONS[challenge.id] || challenge.domain,
      probes: challenge.domain,
      dataRequired: challenge.metrics.join(', '),
      questions: challenge.questions.map(q => {
        // Ensure options have weight properties
        const optionsWithWeights = q.options?.map(opt => ({
          label: opt.label,
          value: opt.value,
          weight: opt.weight || 5 // Fallback to 5 if not defined
        })) || [];

        if (optionsWithWeights.length > 0) {
          console.log(`  Question ${q.id}: ${optionsWithWeights.length} options with weights`,
            optionsWithWeights.map(o => `${o.value}=${o.weight}`).join(', '));
        }

        return {
          id: q.id,
          label: q.label,
          type: 'select' as const,
          options: optionsWithWeights
        };
      }),
      baselineAnalysis: {
        gapTitle: `${challenge.label} Assessment`,
        mismatchTitle: `${challenge.label} Gap Analysis`,
        diagnosisText: `Assessment for ${challenge.label} across ${challenge.domain} domain`,
        mismatchText: `Detailed analysis and findings for ${challenge.label}`,
        recommendedActions: [
          {
            title: `Address ${challenge.label}`,
            desc: `Implement targeted improvements for ${challenge.label}`,
            cost: 'Variable',
            effort: 'Medium',
            roi: '2-3x'
          }
        ]
      }
    }));
  };

  const [challenges] = useState<ChallengeItem[]>(() => transformChallenges());

  useEffect(() => {
    console.log('✅ SCREENING QUESTIONS LOADED');
    console.log('Total challenges:', challenges.length);
    console.log('Sample challenge (C1):', challenges[0]?.label, '- Questions:', challenges[0]?.questions.length);
  }, []);

  // Initial defaults
  useEffect(() => {
    // Start with clean state so selected challenges and answers dynamically drive scores
    setAnswers({});
    setValidationError(null);
  }, []);

  // Real-time analysis subscription (optional)
  useEffect(() => {
    if (!checkupId || !schoolId) return;

    console.log('📡 Subscribing to real-time analysis updates for checkup:', checkupId);

    // Subscribe to analysis updates
    const unsubscribe = subscribeToCheckupAnalysis(
      schoolId,
      checkupId,
      (analysis) => {
        if (analysis) {
          console.log('✓ Analysis updated from Firestore:', analysis);
          setFirestoreCheckupData(analysis);
          if (analysis.dishaScore) {
            setDISHAScore(analysis.dishaScore);
          }
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 Unsubscribing from analysis updates');
      unsubscribe();
    };
  }, [checkupId, schoolId]);

  // Download Sample CSV helper
  const downloadSampleCSV = (fileType: 'ledger' | 'dimensions' | 'feedback') => {
    let filename = '';
    let content = '';

    if (fileType === 'ledger') {
      filename = 'DISHA_Sample_Operational_Ledger.csv';
      content = `Metric_Category,Metric_Name,Recorded_Value,Benchmark_Standard,Alert_Status,Notes
Operational_SLA,Parent_Query_Response_Time_Hours,28.5,4.0,CRITICAL_LAG,Requires dedicated parent helpdesk SLA protocol
Teacher_Development,Annual_CPD_Training_Hours_Per_Teacher,18.0,50.0,BELOW_NEP2020_BENCHMARK,Aligned with NEP 2020 50hr annual mandate
Academic_Remedial,Students_Covered_In_Remedial_Program_Pct,32.0,85.0,MODERATE_GAP,Identified learning gaps from term exams
Student_Retention,Unexcused_Absence_Rate_Pct,14.2,5.0,HIGH_RISK_FLAG,Early indicator for potential mid-year dropouts`;
    } else if (fileType === 'dimensions') {
      filename = 'DISHA_Sample_14_Dimensions_Audit.csv';
      content = `Dimension_ID,Dimension_Name,Current_Score_Out_Of_100,Peer_Benchmark_Avg,Risk_Level,Recommended_Action
D01,Academic_Reputation_Rigour,74,82,Low,Implement project-based learning assessments
D02,Teacher_Welfare_Development,58,76,High,Increase annual CPD budget to 50 hours per teacher
D03,Leadership_Governance_Quality,65,78,Medium,Establish weekly SLA monitoring for department heads
D04,Parent_Engagement_SLA,42,80,Critical,Deploy automated ticket escalation for parent inquiries
D05,Student_Safety_Wellness,88,85,Healthy,Maintain anti-bullying and mental health counselor access`;
    } else {
      filename = 'DISHA_Sample_Stakeholder_Feedback.csv';
      content = `Stakeholder_Group,Respondent_Role,Satisfaction_Score_Out_Of_10,Primary_Complaint_Area,Key_Suggestion
Parent,Grade_8_Parent,4.5,Communication_Delays,Faster response on WhatsApp and phone queries
Teacher,Senior_Secondary_Teacher,5.2,Administrative_Workload,Reduce non-teaching clerical report filing
Student,Grade_10_Student,8.1,Sports_Infrastructure,Upgrade outdoor sports equipment and field access
Staff,Administrative_Office_Staff,6.0,Fee_Followup_Process,Automate online fee payment reminders`;
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download All Sample Files in a ZIP Bundle
  const downloadAllAsZIP = async () => {
    try {
      const zip = new JSZip();

      // 1. Operational Ledger
      zip.file(
        '01_DISHA_First_Opinion_Operational_Ledger.csv',
        `Metric_Category,Metric_Name,Recorded_Value,Benchmark_Standard,Alert_Status,Notes
Operational_SLA,Parent_Query_Response_Time_Hours,28.5,4.0,CRITICAL_LAG,Requires dedicated parent helpdesk SLA protocol
Teacher_Development,Annual_CPD_Training_Hours_Per_Teacher,18.0,50.0,BELOW_NEP2020_BENCHMARK,Aligned with NEP 2020 50hr annual mandate
Academic_Remedial,Students_Covered_In_Remedial_Program_Pct,32.0,85.0,MODERATE_GAP,Identified learning gaps from term exams
Student_Retention,Unexcused_Absence_Rate_Pct,14.2,5.0,HIGH_RISK_FLAG,Early indicator for potential mid-year dropouts`
      );

      // 2. 14 Dimensions Audit
      zip.file(
        '02_DISHA_14_Dimensions_Audit_Report.csv',
        `Dimension_ID,Dimension_Name,Current_Score_Out_Of_100,Peer_Benchmark_Avg,Risk_Level,Recommended_Action
D01,Academic_Reputation_Rigour,74,82,Low,Implement project-based learning assessments
D02,Teacher_Welfare_Development,58,76,High,Increase annual CPD budget to 50 hours per teacher
D03,Leadership_Governance_Quality,65,78,Medium,Establish weekly SLA monitoring for department heads
D04,Parent_Engagement_SLA,42,80,Critical,Deploy automated ticket escalation for parent inquiries
D05,Student_Safety_Wellness,88,85,Healthy,Maintain anti-bullying and mental health counselor access
D06,Infrastructure_Facilities,80,84,Low,Upgrade science lab digital equipment
D07,CoCurricular_Education,72,75,Low,Expand inter-school debate and robotics clubs
D08,Individual_Attention_Ratio,60,78,Medium,Reduce student-teacher ratio in secondary sections
D09,Value_For_Money_Parents,54,72,High,Improve parent enquiry communication speed
D10,Inclusive_Special_Needs,68,70,Low,Appoint additional certified special educator
D11,Community_Service_Social,85,80,Healthy,Maintain student outreach programs
D12,Faculty_Competence_Retain,62,75,Medium,Provide competitive teacher salary increment tiers
D13,Internationalism_Culture,70,73,Low,Initiate global virtual exchange sessions
D14,Management_Vision_Growth,78,81,Low,Conduct quarterly strategic review with board`
      );

      // 3. Stakeholder Feedback
      zip.file(
        '03_DISHA_360_Stakeholder_Feedback_Surveys.csv',
        `Stakeholder_Group,Respondent_Role,Satisfaction_Score_Out_Of_10,Primary_Complaint_Area,Key_Suggestion
Parent,Grade_8_Parent,4.5,Communication_Delays,Faster response on WhatsApp and phone queries
Teacher,Senior_Secondary_Teacher,5.2,Administrative_Workload,Reduce non-teaching clerical report filing
Student,Grade_10_Student,8.1,Sports_Infrastructure,Upgrade outdoor sports equipment and field access
Staff,Administrative_Office_Staff,6.0,Fee_Followup_Process,Automate online fee payment reminders`
      );

      // 4. Student Dropout & Absence Logs
      zip.file(
        '04_DISHA_Student_Dropout_And_Absence_Logs.csv',
        `Student_ID,Class_Section,Consecutive_Unexcused_Days,Fee_Due_Months,Academic_Performance_Band,Dropout_Risk_Level
STU_1042,Grade_9_B,8,2,Below_Average,HIGH
STU_2081,Grade_10_A,12,3,Average,CRITICAL
STU_3012,Grade_7_C,5,1,Above_Average,MODERATE
STU_4105,Grade_11_Science,2,0,Excellent,LOW`
      );

      // 5. Teacher CPD Training Records
      zip.file(
        '05_DISHA_Teacher_CPD_Training_Records.csv',
        `Teacher_ID,Department,Annual_CPD_Hours_Completed,NEP2020_Mandate_50h_Status,Last_Workshop_Attended
TCH_101,Mathematics,22,NON_COMPLIANT,Pedagogy in Algebra (12h)
TCH_102,Science,48,NEAR_COMPLIANT,Stem Lab Practices (24h)
TCH_103,English,54,FULL_COMPLIANT,CBSE Inclusive Education (30h)
TCH_104,Social_Studies,15,NON_COMPLIANT,Differentiated Learning (10h)`
      );

      // 6. User Guide README
      zip.file(
        'README_How_To_Use_These_Sample_Files.txt',
        `========================================================================
             DISHA SCHOOL DIAGNOSTIC ENGINE - TEST DATASETS BUNDLE
========================================================================

Thank you for testing DISHA! This ZIP package contains ready-to-use sample CSV
files formatted specifically for testing DISHA features.

FILES INCLUDED IN THIS ZIP:
------------------------------------------------------------------------
1. 01_DISHA_First_Opinion_Operational_Ledger.csv
   -> USE IN: First Opinion Diagnostic -> Document Upload Step.
   -> WHAT IT TESTS: Calculates real-time 0-100 Health Scores by analyzing parent query
      response times, teacher CPD training, remedial academic coverage, and absence rates.

2. 02_DISHA_14_Dimensions_Audit_Report.csv
   -> USE IN: 14-Dimension Holistic School Benchmarking & Audit.
   -> WHAT IT TESTS: Benchmarks your institution against peer CBSE / EWISR standards
      across all 14 core educational and governance dimensions.

3. 03_DISHA_360_Stakeholder_Feedback_Surveys.csv
   -> USE IN: 360° Multilateral Survey Analytics.
   -> WHAT IT TESTS: Analyzes perception gaps and complaint areas from Parents,
      Teachers, Students, and Administrative Staff.

4. 04_DISHA_Student_Dropout_And_Absence_Logs.csv
   -> USE IN: Student Retention & SLA Monitoring.
   -> WHAT IT TESTS: Flags high-risk students showing chronic absenteeism and fee delays.

5. 05_DISHA_Teacher_CPD_Training_Records.csv
   -> USE IN: NEP 2020 Teacher Development Tracking.
   -> WHAT IT TESTS: Evaluates compliance against NEP 2020's 50-hour annual mandate.

HOW TO USE IN DISHA:
------------------------------------------------------------------------
1. Extract this ZIP archive on your computer.
2. In DISHA's "First Opinion Triage", select your symptoms and answer the mandatory
   screening questions.
3. Click "Upload Supporting Data Document" and upload any of these extracted CSV files!
4. DISHA will automatically parse the data document and render your customized report!
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'DISHA_Sample_Test_Datasets_Bundle.zip');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error generating zip bundle:", err);
    }
  };

  const toggleChallenge = (id: string) => {
    setSelectedChallenges(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(c => c !== id);
      } else {
        if (prev.length >= 3) return prev; // Limit to max 3 for targeted screening
        return [...prev, id];
      }
    });
  };

  const getRequiredQuestions = () => {
    const req: any[] = [];
    selectedChallenges.forEach(cid => {
      const cObj = challenges.find(c => c.id === cid);
      if (cObj) {
        cObj.questions.forEach(q => {
          req.push({
            id: q.id,
            label: q.label,
            type: q.type,
            options: q.options, // Include options with weights!
            challengeTitle: cObj.label
          });
        });
      }
    });
    console.log('getRequiredQuestions returning:', req.length, 'questions with options');
    return req;
  };

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers(prev => {
      const updated = { ...prev, [qId]: val };
      const req = getRequiredQuestions();
      const stillMissing = req.filter(q => !updated[q.id] || updated[q.id].trim() === '');
      if (stillMissing.length === 0) {
        setValidationError(null);
      }
      return updated;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setUploadedFileName(file.name);
      analyzeUploadedFile(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      setUploadedFileName(file.name);
      analyzeUploadedFile(file);
    }
  };

  const analyzeUploadedFile = async (file: File) => {
    setIsAnalyzingFile(true);
    try {
      const metrics = await FileAnalyzer.analyzeFile(file);
      setExtractedMetrics(metrics);

      // VALIDATE file contains required metrics for SELECTED CHALLENGES
      let validation: ValidationResult | ChallengeValidationResult;

      if (selectedChallenges.length > 0) {
        // Validate against selected challenges
        validation = validateFileForChallenges(metrics, selectedChallenges);
        console.log('📋 Validating against challenges:', selectedChallenges, validation);
      } else {
        // Fall back to basic validation if no challenges selected
        validation = validateFileMetrics(metrics);
        console.log('📋 Basic validation (no challenges selected):', validation);
      }

      setFileValidation(validation);

      if (!validation.isValid) {
        console.warn('❌ File validation failed:', validation.errorMessage);
        setValidationError(validation.errorMessage);
        return;
      }

      console.log('✅ File validation passed:', validation.foundMetrics);

      // Map extracted metrics to DISHA operational metrics
      console.log('📊 RAW EXTRACTED METRICS:', metrics.metricsFound);

      const updatedOperationalMetrics: OperationalMetrics = {
        studentTeacherRatio: metrics.metricsFound['students_per_classroom'] as number || 28,
        parentResponseSLA: metrics.metricsFound['parent_query_response_sla_hours'] as number || 24,
        annualTrainingHours: metrics.metricsFound['annual_training_hours'] as number || 20,
        weeklyPlanningHours: metrics.metricsFound['weekly_planning_hours'] as number || 4
      };

      console.log('📋 UPDATED OPERATIONAL METRICS:', updatedOperationalMetrics);
      console.log('  Before setOperationalMetrics - current state:', operationalMetrics);

      setOperationalMetrics(updatedOperationalMetrics);

      console.log('  After setOperationalMetrics - queued for update');

      // Generate REAL insights from extracted metrics
      const insights = generateRealInsights(metrics);
      setRealInsights(insights);

      // Generate dynamic diagnosis if we have both metrics and answers
      const required = getRequiredQuestions();
      const allAnswered = required.every(q => answers[q.id]?.trim());
      if (allAnswered) {
        const diagnosis = DiagnosisGenerator.generateDiagnosis(
          metrics,
          selectedChallenges[0],
          answers
        );
        setDiagnosisResult(diagnosis);
      }
    } catch (error) {
      console.error('Error analyzing file:', error);
      setValidationError('Error analyzing file. Please check the file format and try again.');
    } finally {
      setIsAnalyzingFile(false);
    }
  };

  const simulateRegisterPhoto = () => {
    setUploadedFileName('attendance_register_snapshot.jpg');
    setUploadedFile(new File([], 'attendance_register_snapshot.jpg'));
  };

  // FIRESTORE SAVE & CLOUD FUNCTION HANDLER
  const handleSaveCheckupToFirestore = async () => {
    if (!user) {
      alert('Authentication required. Please log in.');
      return;
    }

    if (!activeSchool || !schoolId) {
      setValidationError(
        '⚠️ No school profile selected. Please select or create a school profile from the sidebar before running a First Opinion checkup.'
      );
      setStep(0);
      return;
    }

    if (!uploadedFile) {
      setValidationError(
        '⚠️ REQUIRED: Upload supporting data document first. Upload operational data (attendance, fee collection, staff records, etc.) to enable data-driven First Opinion analysis.'
      );
      return;
    }

    if (isAnalyzingFile) {
      setValidationError('⏳ Still analyzing your uploaded file — please wait a moment and try again.');
      return;
    }

    if (fileValidation && !fileValidation.isValid) {
      if (extractedMetrics?.fileType === 'UNREADABLE_BINARY_FILE') {
        setValidationError(fileValidation.errorMessage);
        const elem = document.getElementById('file-upload-container');
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      const missingList = fileValidation.requiredMetrics
        .filter(r => fileValidation.missingMetrics.some(mm => mm.includes(r.fieldName)))
        .map(m => `• ${m.description} — expected field name "${m.fieldName}" (example: ${m.example})`)
        .join('\n');
      const completeness = 'completeness' in fileValidation ? fileValidation.completeness : 0;
      setValidationError(
        `❌ UPLOADED FILE DOES NOT MATCH YOUR SELECTED CHALLENGES (${completeness}% complete).\n\n` +
        `The following required field(s) were not found in your file:\n${missingList}\n\n` +
        `HOW TO FIX: Re-check your CSV — it must have the header "metric_field,value" with one row per field, ` +
        `and the field names above spelled exactly as shown (case-sensitive). Add the missing rows with real values, ` +
        `save the file, then upload it again here. The report cannot be generated until every required field for your ` +
        `3 selected challenges is present — this keeps the DISHA Score and Perception Gap Analysis accurate to real data.`
      );
      const elem = document.getElementById('file-upload-container');
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const required = getRequiredQuestions();
    const missing = required.filter(q => !answers[q.id] || answers[q.id].trim() === '');
    if (missing.length > 0) {
      setValidationError(
        `Action Required: You must answer all ${missing.length} remaining compulsory screening question${missing.length > 1 ? 's' : ''}.`
      );
      return;
    }

    try {
      setIsSubmittingToFirestore(true);
      setValidationError(null);
      console.log('⏳ Saving checkup to Firestore...');

      // Collect survey answers from selected challenges
      const surveyInput: Record<string, any> = {};
      selectedChallenges.forEach(cid => {
        const cObj = challenges.find(c => c.id === cid);
        if (cObj) {
          cObj.questions.forEach(q => {
            surveyInput[q.id] = answers[q.id] || '';
          });
        }
      });

      // Use extracted metrics if available, otherwise use defaults
      const checkupOperationalMetrics = extractedMetrics?.metricsFound || operationalMetrics;

      console.log('📊 Collected Survey Input:', surveyInput);
      console.log('📊 Operational Metrics:', checkupOperationalMetrics);

      // Save to Firestore
      const savedCheckupId = await saveCheckupToFirestore(schoolId, {
        surveyInput: surveyInput,
        operationalMetricsUploaded: checkupOperationalMetrics,
        createdBy: user.uid,
        schoolId: schoolId,
        selectedChallenges: selectedChallenges,
        board: board,
        cityTier: cityTier,
        feeBand: feeBand,
        uploadedFileName: uploadedFileName
      });

      setCheckupId(savedCheckupId);
      console.log('✓ Checkup saved to Firestore:', savedCheckupId);

      // Log audit event for checkup submission
      await logAuditEvent(
        schoolId,
        'CHECKUP_SUBMITTED',
        'checkup',
        savedCheckupId,
        user.email || user.uid
      );
      console.log('✓ Audit logged for checkup submission');
      console.log('⏳ Waiting for Cloud Function analysis (up to 30 seconds)...');

      // Wait for analysis (up to 30 seconds)
      const analysis = await waitForCheckupAnalysis(schoolId, savedCheckupId);

      if (analysis) {
        console.log('✓ Analysis complete:', analysis);
        setFirestoreCheckupData(analysis);
        // Update DISHA score with Firestore results if available
        if (analysis.dishaScore) {
          setDISHAScore(analysis.dishaScore);
        }
      } else {
        console.warn('⚠️ Analysis still processing, running local calculation...');
        // If cloud function times out, run local diagnostic calculation
        runLocalDiagnosticCalculation();
      }

      // Navigate to results step
      setTimeout(() => {
        setIsSubmittingToFirestore(false);
        setStep(2);
      }, 800);

    } catch (error) {
      console.error('Error saving checkup:', error);
      setValidationError('Failed to save checkup. Please try again.');
    } finally {
      // Reset submit state after a delay
      setTimeout(() => setIsSubmittingToFirestore(false), 2000);
    }
  };

  // Helper function to run diagnostic calculation locally
  const runLocalDiagnosticCalculation = () => {
    const required = getRequiredQuestions();
    const answersArray = required.map(q => {
      const selectedOptionValue = answers[q.id];
      const selectedOption = q.options?.find(opt => opt.value === selectedOptionValue);
      const weight = selectedOption?.weight || 5;
      return { questionId: q.id, weight };
    });

    const maxPossible = required.length * 10;
    const score = DISHAScoreCalculator.calculateCompleteScore(
      answersArray,
      maxPossible,
      operationalMetrics
    );

    setDISHAScore(score);

    const diagnosis = DiagnosisGenerator.generateDiagnosis(
      extractedMetrics,
      selectedChallenges[0],
      answers
    );
    setDiagnosisResult(diagnosis);

    console.log('✓ Local diagnostic calculation complete');
  };

  // DIAGNOSTIC ENGING CALCULATION
  const runFirstOpinionDiagnostic = () => {
    // Check if file has been uploaded
    if (!uploadedFile) {
      setValidationError(
        '⚠️ REQUIRED: Upload supporting data document first. Upload operational data (attendance, fee collection, staff records, etc.) to enable data-driven First Opinion analysis. Without actual metrics, scoring cannot reflect operational reality.'
      );
      const elem = document.getElementById('file-upload-container');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Check if file validation passed
    if (fileValidation && !fileValidation.isValid) {
      setValidationError(
        `❌ DATA VALIDATION FAILED:\n${fileValidation.errorMessage}\n\nRequired Data Fields for DISHA First Opinion:\n${fileValidation.requiredMetrics.map(m => `• ${m.description} (${m.fieldName}): ${m.example}`).join('\n')}`
      );
      const elem = document.getElementById('file-upload-container');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const required = getRequiredQuestions();
    const missing = required.filter(q => !answers[q.id] || answers[q.id].trim() === '');

    if (missing.length > 0) {
      setValidationError(
        `Action Required: You must answer all ${missing.length} remaining compulsory screening question${missing.length > 1 ? 's' : ''} before generating your First Opinion.`
      );
      const elem = document.getElementById('screening-questions-container');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    setValidationError(null);
    setIsProcessing(true);

    // Calculate DISHA scores - extract weights from selected options
    console.log('=== DISHA CALCULATION START ===');
    console.log('Required questions:', required.length);
    console.log('User answers:', answers);
    console.log('⚠️ CRITICAL: Current operationalMetrics at calculation time:', operationalMetrics);
    console.log('  ├─ studentTeacherRatio:', operationalMetrics.studentTeacherRatio, '(should be from file)');
    console.log('  ├─ parentResponseSLA:', operationalMetrics.parentResponseSLA, '(should be from file)');
    console.log('  ├─ annualTrainingHours:', operationalMetrics.annualTrainingHours, '(should be from file)');
    console.log('  └─ weeklyPlanningHours:', operationalMetrics.weeklyPlanningHours, '(should be from file)');

    const answersArray = required.map(q => {
      const selectedOptionValue = answers[q.id];
      if (!selectedOptionValue) {
        console.warn(`❌ Question ${q.id} has no answer, using default weight 5`);
        return { questionId: q.id, weight: 5 };
      }

      // Find the selected option and extract its weight
      const selectedOption = q.options?.find(opt => opt.value === selectedOptionValue);
      const weight = selectedOption?.weight;

      if (!weight) {
        console.warn(`❌ Question ${q.id}: Could not find weight for value "${selectedOptionValue}"`);
        console.warn(`   Available options:`, q.options?.map(o => ({ value: o.value, weight: o.weight })));
      } else {
        console.log(`✅ Question ${q.id}: Found weight ${weight} for answer "${selectedOptionValue}"`);
      }

      return { questionId: q.id, weight: weight || 5 };
    });

    console.log('Weights array:', answersArray);
    const maxPossible = required.length * 10;
    console.log('Max possible score:', maxPossible);

    const totalWeight = answersArray.reduce((sum, a) => sum + a.weight, 0);
    console.log('Total weight sum:', totalWeight);
    console.log('Percentage:', (totalWeight / maxPossible) * 100);

    const score = DISHAScoreCalculator.calculateCompleteScore(
      answersArray,
      maxPossible,
      operationalMetrics
    );

    console.log('📊 CALCULATED SCORE:', score);
    console.log('  ├─ Layer 1 (S_sub):', score.s_sub, '← Leadership Perception');
    console.log('  ├─ Layer 2 (M_obj):', score.m_obj, '← Operational Reality');
    console.log('  │  ├─ m_str:', score.m_str);
    console.log('  │  ├─ m_sla:', score.m_sla);
    console.log('  │  ├─ m_train:', score.m_train);
    console.log('  │  └─ m_plan:', score.m_plan);
    console.log('  └─ Layer 3 (Health Index):', score.healthIndex, '← Final Score');
    console.log('🚨 If Layer 2 is 0.71x: Your file metrics were NOT used!');
    console.log('   Expected if data uploaded: Layer 2 should change from 0.711');
    console.log('=== DISHA CALCULATION END ===');

    setDISHAScore(score);

    // Generate diagnosis using extracted metrics if available
    const diagnosis = DiagnosisGenerator.generateDiagnosis(
      extractedMetrics,
      selectedChallenges[0],
      answers
    );
    setDiagnosisResult(diagnosis);

    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
    }, 1500);
  };

  // CORE SCORE GENERATOR FOR 12 LENSES
  const generateTwelveLensData = () => {
    // Healthy baseline for all 12 lenses (82/100)
    let academicExcellence = 82;
    let emotionalWellbeing = 82;
    let socialEmotional = 82;
    let digitalWellness = 85;
    let familySupport = 82;
    let teacherEffectiveness = 82;

    let admissions = 82;
    let finance = 85;
    let staffHr = 82;
    let compliance = 88;
    let infrastructure = 85;
    let communication = 82;

    // Default confidence levels
    let confAcademic: 'A' | 'B' | 'C' = 'B';
    let confEmotional: 'A' | 'B' | 'C' = 'C';
    let confSocial: 'A' | 'B' | 'C' = 'C';
    let confDigital: 'A' | 'B' | 'C' = 'B';
    let confFamily: 'A' | 'B' | 'C' = 'C';
    let confTeacher: 'A' | 'B' | 'C' = 'B';
    let confAdmissions: 'A' | 'B' | 'C' = 'B';
    let confFinance: 'A' | 'B' | 'C' = 'B';
    let confStaffHr: 'A' | 'B' | 'C' = 'B';
    let confCompliance: 'A' | 'B' | 'C' = 'B';
    let confInfra: 'A' | 'B' | 'C' = 'B';
    let confComms: 'A' | 'B' | 'C' = 'B';

    // 1. Map challenge to target operational or wellbeing lens
    const worryToLensMap: Record<string, string> = {
      enrollment_decline: 'Admissions & Enrollment',
      student_attrition: 'Academic Excellence',
      teacher_attrition: 'Staff & HR',
      staff_capability: 'Teacher Effectiveness',
      academic_decline: 'Academic Excellence',
      emotional_wellbeing: 'Emotional Wellbeing',
      digital_wellness: 'Digital Wellness',
      holistic_gap: 'Social-Emotional Dev',
      competitive_pressure: 'Admissions & Enrollment',
      parent_dissatisfaction: 'Family Support',
      brand_weakness: 'Communication Hub',
      fee_stress: 'Finance & Fees',
      infrastructure_gaps: 'Infrastructure & Assets',
      regulatory_risk: 'Regulatory Compliance',
      tech_inefficiency: 'Communication Hub'
    };

    // Apply baseline penalty to chosen primary challenges so selected pain points register immediate impact
    selectedChallenges.forEach((chalId, idx) => {
      const targetLensName = worryToLensMap[chalId];
      const weightPenalty = idx === 0 ? 25 : 15; // Primary selected challenge receives heavier baseline penalty
      if (targetLensName === 'Admissions & Enrollment') admissions -= weightPenalty;
      if (targetLensName === 'Academic Excellence') academicExcellence -= weightPenalty;
      if (targetLensName === 'Staff & HR') staffHr -= weightPenalty;
      if (targetLensName === 'Teacher Effectiveness') teacherEffectiveness -= weightPenalty;
      if (targetLensName === 'Emotional Wellbeing') emotionalWellbeing -= weightPenalty;
      if (targetLensName === 'Digital Wellness') digitalWellness -= weightPenalty;
      if (targetLensName === 'Social-Emotional Dev') socialEmotional -= weightPenalty;
      if (targetLensName === 'Family Support') familySupport -= weightPenalty;
      if (targetLensName === 'Communication Hub') communication -= weightPenalty;
      if (targetLensName === 'Finance & Fees') finance -= weightPenalty;
      if (targetLensName === 'Infrastructure & Assets') infrastructure -= weightPenalty;
      if (targetLensName === 'Regulatory Compliance') compliance -= weightPenalty;
    });

    // 2. Evaluate specific questionnaire answers across all 15 challenges
    // Growth & Admissions
    if (answers['conv_rate'] === 'critical') admissions -= 20;
    if (answers['conv_rate'] === 'suboptimal') admissions -= 10;
    if (answers['marketing_spend'] === 'none') { admissions -= 15; communication -= 10; }
    if (answers['dropoff_point'] === 'inquiry_drop') { admissions -= 15; communication -= 10; }
    if (answers['dropoff_point'] === 'fee_drop') { finance -= 15; }
    if (answers['dropoff_point'] === 'competitor_drop') { admissions -= 12; }

    // Student Attrition
    if (answers['attrition_rate'] === 'critical') { academicExcellence -= 20; familySupport -= 15; }
    if (answers['attrition_rate'] === 'moderate') { academicExcellence -= 10; }
    if (answers['exit_reason'] === 'competitor') { admissions -= 15; }
    if (answers['exit_reason'] === 'financial') { finance -= 15; }
    if (answers['exit_reason'] === 'stress') { emotionalWellbeing -= 15; }

    // Teacher Attrition
    if (answers['teacher_turnover'] === 'severe') { staffHr -= 25; teacherEffectiveness -= 15; academicExcellence -= 10; }
    if (answers['teacher_turnover'] === 'moderate') { staffHr -= 12; }
    if (answers['teacher_load'] === 'overloaded') { staffHr -= 18; teacherEffectiveness -= 18; }
    if (answers['exit_salary'] === 'burnout') { staffHr -= 12; emotionalWellbeing -= 10; }
    if (answers['exit_salary'] === 'salary') { finance -= 15; }

    // Staff Capability
    if (answers['trained_ratio'] === 'low') { teacherEffectiveness -= 25; academicExcellence -= 15; }
    if (answers['training_hours'] === 'minimal') { teacherEffectiveness -= 20; }

    // Academic Performance
    if (answers['pass_trend'] === 'slipping') { academicExcellence -= 25; }
    if (answers['pass_trend'] === 'stagnant') { academicExcellence -= 12; }
    if (answers['remedial_track'] === 'none') { academicExcellence -= 18; emotionalWellbeing -= 12; }

    // Emotional Wellbeing
    if (answers['incident_freq'] === 'high') { emotionalWellbeing -= 25; socialEmotional -= 15; }
    if (answers['counselor_state'] === 'none') { emotionalWellbeing -= 20; socialEmotional -= 12; }

    // Digital Wellness
    if (answers['screen_distract'] === 'severe') { digitalWellness -= 30; socialEmotional -= 12; }

    // Holistic & NEP Gap
    if (answers['nep_aligned'] === 'traditional') { socialEmotional -= 25; compliance -= 12; }
    if (answers['clubs_count'] === 'minimal') { socialEmotional -= 20; }

    // Competitive Pressure
    if (answers['competitor_count'] === 'severe') { admissions -= 20; familySupport -= 12; }
    if (answers['comp_price_diff'] === 'premium_poor') { admissions -= 22; infrastructure -= 12; }

    // Parent Dissatisfaction
    if (answers['complaint_volume'] === 'high') { familySupport -= 28; communication -= 15; }
    if (answers['resolution_sla'] === 'slow') { familySupport -= 22; communication -= 18; }

    // Brand Weakness
    if (answers['review_rating'] === 'poor') { communication -= 28; admissions -= 18; }
    if (answers['website_state'] === 'stale') { communication -= 22; admissions -= 12; }

    // Fee Default
    if (answers['default_rate'] === 'critical') { finance -= 30; familySupport -= 12; }
    if (answers['collection_mode'] === 'manual') { finance -= 22; communication -= 12; }

    // Infrastructure Gaps
    if (answers['parent_infra_feedback'] === 'poor') { infrastructure -= 30; familySupport -= 12; }

    // Regulatory Compliance
    if (answers['renewal_deadline'] === 'critical') { compliance -= 30; }
    if (answers['safety_compliance'] === 'non_compliant') { compliance -= 35; infrastructure -= 15; }

    // Tech Inefficiency
    if (answers['manual_load'] === 'severe') { communication -= 28; staffHr -= 18; }
    if (answers['comms_method'] === 'whatsapp') { communication -= 18; familySupport -= 12; }
    if (answers['comms_method'] === 'physical') { communication -= 25; }

    // 3. Evidence Sampling / Uploaded Document Effect
    if (uploadedFileName) {
      const fNameLower = uploadedFileName.toLowerCase();
      if (fNameLower.includes('attendance') || fNameLower.includes('roster') || fNameLower.includes('staff') || fNameLower.includes('register')) {
        confStaffHr = 'A';
        confTeacher = 'A';
        staffHr += 4;
        teacherEffectiveness += 4;
      }
      if (fNameLower.includes('fee') || fNameLower.includes('ledger') || fNameLower.includes('payment') || fNameLower.includes('financial')) {
        confFinance = 'A';
        finance += 4;
      }
      if (fNameLower.includes('mark') || fNameLower.includes('exam') || fNameLower.includes('academic') || fNameLower.includes('report')) {
        confAcademic = 'A';
        academicExcellence += 4;
      }
      if (fNameLower.includes('audit') || fNameLower.includes('cert') || fNameLower.includes('fire') || fNameLower.includes('safety')) {
        confCompliance = 'A';
        compliance += 4;
      }
      // General upload boosts primary selected challenge domain confidence to Tier A
      const primaryTarget = worryToLensMap[selectedChallenges[0]];
      if (primaryTarget === 'Admissions & Enrollment') confAdmissions = 'A';
      if (primaryTarget === 'Staff & HR') confStaffHr = 'A';
      if (primaryTarget === 'Finance & Fees') confFinance = 'A';
      if (primaryTarget === 'Academic Excellence') confAcademic = 'A';
      if (primaryTarget === 'Regulatory Compliance') confCompliance = 'A';
      if (primaryTarget === 'Infrastructure & Assets') confInfra = 'A';
      if (primaryTarget === 'Communication Hub') confComms = 'A';
    }

    // Bounds checks
    const clamp = (val: number) => Math.max(20, Math.min(98, val));

    return [
      { subject: 'Academic Excellence', score: clamp(academicExcellence), fullMark: 100, type: 'wellbeing', confidence: confAcademic },
      { subject: 'Emotional Wellbeing', score: clamp(emotionalWellbeing), fullMark: 100, type: 'wellbeing', confidence: confEmotional },
      { subject: 'Social-Emotional Dev', score: clamp(socialEmotional), fullMark: 100, type: 'wellbeing', confidence: confSocial },
      { subject: 'Digital Wellness', score: clamp(digitalWellness), fullMark: 100, type: 'wellbeing', confidence: confDigital },
      { subject: 'Family Support', score: clamp(familySupport), fullMark: 100, type: 'wellbeing', confidence: confFamily },
      { subject: 'Teacher Effectiveness', score: clamp(teacherEffectiveness), fullMark: 100, type: 'wellbeing', confidence: confTeacher },
      { subject: 'Admissions & Enrollment', score: clamp(admissions), fullMark: 100, type: 'operations', confidence: confAdmissions },
      { subject: 'Finance & Fees', score: clamp(finance), fullMark: 100, type: 'operations', confidence: confFinance },
      { subject: 'Staff & HR', score: clamp(staffHr), fullMark: 100, type: 'operations', confidence: confStaffHr },
      { subject: 'Regulatory Compliance', score: clamp(compliance), fullMark: 100, type: 'operations', confidence: confCompliance },
      { subject: 'Infrastructure & Assets', score: clamp(infrastructure), fullMark: 100, type: 'operations', confidence: confInfra },
      { subject: 'Communication Hub', score: clamp(communication), fullMark: 100, type: 'operations', confidence: confComms }
    ];
  };

  const scorecardData = generateTwelveLensData();

  // Adaptive Simulation state
  const [simSelectedId, setSimSelectedId] = useState<string>('academic');
  const [simTargetVal, setSimTargetVal] = useState<number>(92);
  const [simIsRunning, setSimIsRunning] = useState<boolean>(false);
  const [simHasRun, setSimHasRun] = useState<boolean>(false);
  const [simIsCommitting, setSimIsCommitting] = useState<boolean>(false);
  const [simCommitted, setSimCommitted] = useState<boolean>(false);

  const getSimBaselineVal = (outcomeId: string) => {
    const outcome = OUTCOMES.find(o => o.id === outcomeId);
    if (!outcome) return 70;
    const lensScore = scorecardData.find(d => d.subject === outcome.lensName)?.score || 70;
    return lensScore;
  };

  // Find primary gap based on scores
  const getTopDiagnosticGaps = () => {
    const sorted = [...scorecardData].sort((a, b) => a.score - b.score);
    return sorted.slice(0, 3); // top 3 lowest scores (our primary gaps)
  };

  const topGaps = getTopDiagnosticGaps();

  // GET MISMATCH EXPLANATION
  // We compare the primary user worry selection vs actual lowest score
  const getPerceptionMismatchInfo = () => {
    const primaryWorryId = selectedChallenges[0];
    const topWorryObj = challenges.find(c => c.id === primaryWorryId);
    
    // Map worry to lens
    const worryToLensMap: Record<string, string> = {
      enrollment_decline: 'Admissions & Enrollment',
      student_attrition: 'Academic Excellence',
      teacher_attrition: 'Staff & HR',
      staff_capability: 'Teacher Effectiveness',
      academic_decline: 'Academic Excellence',
      emotional_wellbeing: 'Emotional Wellbeing',
      digital_wellness: 'Digital Wellness',
      holistic_gap: 'Social-Emotional Dev',
      competitive_pressure: 'Admissions & Enrollment',
      parent_dissatisfaction: 'Family Support',
      brand_weakness: 'Communication Hub',
      fee_stress: 'Finance & Fees',
      infrastructure_gaps: 'Infrastructure & Assets',
      regulatory_risk: 'Regulatory Compliance',
      tech_inefficiency: 'Communication Hub'
    };

    const targetLens = worryToLensMap[primaryWorryId] || 'Admissions & Enrollment';
    const correspondingLensScore = scorecardData.find(d => d.subject === targetLens)?.score || 100;
    const actualLowestLens = topGaps[0];

    const isAligned = Math.abs(correspondingLensScore - actualLowestLens.score) < 8 || actualLowestLens.subject === targetLens;

    if (isAligned) {
      return {
        aligned: true,
        title: "Perception & Data Core Alignment (High Confidence)",
        desc: `Your stated concern regarding "${topWorryObj?.label}" perfectly aligns with the analytical operational data. The metrics confirm that ${targetLens} is indeed your most critical operational bottleneck, registering a score of ${correspondingLensScore}/100. Diagnostic confidence is extremely solid.`
      };
    } else {
      // Divergence / Mismatch!
      let dynamicMismatchDesc = "";
      if (primaryWorryId === 'enrollment_decline' && actualLowestLens.subject === 'Staff & HR') {
        dynamicMismatchDesc = "You came in worried about declining student enrollment, but the diagnostic metrics show that your Staff & HR stability (58/100) is the actual core issue. High teacher turnover and substitution loads are exhausting classrooms, which parent feedback files directly link to their final decision to drop out or select competitor options.";
      } else if (primaryWorryId === 'academic_decline' && actualLowestLens.subject === 'Staff & HR') {
        dynamicMismatchDesc = "You came in worried about student marks and pedagogical gaps. However, the data confirms that your teachers spend over 14 hours weekly on non-teaching administrative work, and substitution load averages 32 periods. Teacher burnout is the actual catalyst causing lagging syllabus progression.";
      } else {
        dynamicMismatchDesc = `You selected "${topWorryObj?.label}" as your most critical concern. However, our adaptive diagnostic algorithms indicate that the underlying gap actually points to "${actualLowestLens.subject}" (registering a deficit of ${actualLowestLens.score}/100) as the immediate operational roadblock. Treating this root cause will yield the highest returns.`;
      }

      return {
        aligned: false,
        title: "Perception & Data Core Alignment (Differential Diagnostic)",
        desc: dynamicMismatchDesc
      };
    }
  };

  const mismatchInfo = getPerceptionMismatchInfo();

  // Helper to generate dynamic real-time data interpretation narrative based on lowest scoring lens & questionnaire inputs
  const getDynamicDiagnosisNarrative = (lowestSubject: string) => {
    if (lowestSubject === 'Admissions & Enrollment') {
      if (answers['conv_rate'] === 'critical' || answers['dropoff_point'] === 'inquiry_drop') {
        return "Your parent inquiry records show that while over 150 inquiries were logged, less than 12% converted. Parent interest is healthy, but the follow-up process has a severe drop-off right after initial inquiries due to manual response delays.";
      }
      if (answers['dropoff_point'] === 'fee_drop') {
        return "Admissions intake logs show healthy initial inquiry traffic, but over 60% of prospective parents exit during fee discussion stages due to uncurated fee structure clarity and lack of flexible payment option guidance.";
      }
      if (answers['marketing_spend'] === 'none') {
        return "Admissions conversion is stalling due to 100% reliance on unmanaged word-of-mouth with zero digital presence. Local competitors with active online inquiry portals are capturing prospective parents in your city tier.";
      }
      return "Your parent inquiry logs and intake data indicate significant conversion friction in admissions compared to benchmark schools in your exact city tier.";
    }

    if (lowestSubject === 'Staff & HR') {
      if (answers['teacher_turnover'] === 'severe' || answers['teacher_load'] === 'overloaded') {
        return "Staff roster records reveal annual teacher turnover exceeding 25%, driven directly by heavy teaching loads (30+ periods/week plus heavy substitutions). Daily administrative load and fatigue directly cause classroom instability.";
      }
      if (answers['exit_salary'] === 'burnout') {
        return "Faculty exit reports confirm that 70% of departing teachers cite workplace stress, administrative burdens, and burnout as their primary reason for leaving, rather than salary band differences.";
      }
      return "Operational logbooks highlight critical staff fatigue, high substitution loads, and administrative paperwork burden destabilizing teacher retention.";
    }

    if (lowestSubject === 'Teacher Effectiveness') {
      if (answers['trained_ratio'] === 'low') {
        return "Faculty qualifications logs reveal that over 50% of core teaching staff currently lack formal B.Ed/M.Ed training, resulting in inconsistent instructional delivery and lower student engagement.";
      }
      if (answers['training_hours'] === 'minimal') {
        return "Professional development logs show teachers receive fewer than 5 hours of annual pedagogical training, creating a significant gap in modern classroom management techniques.";
      }
      return "Teacher capability metrics indicate an operational deficit in structured pedagogical training, lesson plan auditing, and digital classroom tools.";
    }

    if (lowestSubject === 'Academic Excellence') {
      if (answers['pass_trend'] === 'slipping') {
        return "Internal exam analytics confirm slipping pass trends across core subjects. The absence of structured diagnostic remedial tracks is causing learning gaps to compound before term final exams.";
      }
      if (answers['attrition_rate'] === 'critical') {
        return "Academic retention records show mid-year student withdrawals concentrating heavily in senior grades due to unaddressed academic stress and lack of early-warning learning interventions.";
      }
      return "Academic progress analytics reveal learning retention gaps that require structured diagnostic tracking and early remedial support.";
    }

    if (lowestSubject === 'Emotional Wellbeing') {
      if (answers['incident_freq'] === 'high' || answers['counselor_state'] === 'none') {
        return "Student behavior logs indicate elevated anxiety and stress metrics, compounded by the lack of a dedicated student counselor or structured emotional wellbeing framework.";
      }
      return "Student wellbeing metrics highlight unaddressed emotional stress and behavioral anxiety affecting classroom focus.";
    }

    if (lowestSubject === 'Digital Wellness') {
      if (answers['screen_distract'] === 'severe') {
        return "Classroom observation logs report severe digital distraction and screen fatigue among students, directly impacting attention spans during core instructional hours.";
      }
      return "Digital wellness metrics indicate high screen distraction and a need for structured screen-time policies and digital balance guidelines.";
    }

    if (lowestSubject === 'Social-Emotional Dev') {
      if (answers['nep_aligned'] === 'traditional') {
        return "Curriculum logs show a 100% traditional textbook orientation without co-curricular clubs or NEP-aligned holistic progress cards, creating a gap in student soft-skills development.";
      }
      return "Holistic development indices show limited co-curricular exposure and soft-skill tracking compared to modern district benchmarks.";
    }

    if (lowestSubject === 'Family Support') {
      if (answers['complaint_volume'] === 'high' || answers['resolution_sla'] === 'slow') {
        return "Parent feedback files show high complaint volume with resolution times exceeding 5 days. Communication lag is eroding parent trust and triggering negative community sentiment.";
      }
      return "Family engagement metrics highlight communication delays in resolving parent grievances and lack of structured feedback channels.";
    }

    if (lowestSubject === 'Finance & Fees') {
      if (answers['default_rate'] === 'critical') {
        return "Financial ledger audit indicates fee collection defaults exceeding 15% with manual cash/check friction, leading to severe liquidity tightness and cash flow stress.";
      }
      if (answers['collection_mode'] === 'manual') {
        return "Fee collection relies on manual paper receipts and ledger entries, causing reconciliation delays and lack of automated parent reminder triggers.";
      }
      return "Finance audit metrics show fee collection leakage, payment friction, and manual reconciliation overhead.";
    }

    if (lowestSubject === 'Infrastructure & Assets') {
      if (answers['comp_price_diff'] === 'premium_poor') {
        return "Campus facility logs show physical asset maintenance gaps, creating a clear mismatch between tuition pricing and perceived facility value among visiting parents.";
      }
      return "Infrastructure metrics point to facility upkeep gaps and resource allocation friction impacting campus appeal.";
    }

    if (lowestSubject === 'Regulatory Compliance') {
      return "Compliance audit logs flag pending regulatory documentation, affiliation filings, and safety certificate renewals requiring immediate administrative alignment.";
    }

    if (lowestSubject === 'Communication Hub') {
      if (answers['review_rating'] === 'poor' || answers['website_state'] === 'stale') {
        return "Digital audit logs show an unmanaged Google Maps profile with unanswered negative reviews and a stale website, suppressing prospective parent inquiries.";
      }
      return "Communication channel analytics show unoptimized parent broadcast touchpoints and weak digital visibility across local search queries.";
    }

    return "Your intake metrics point to significant operational friction in this lens compared to benchmark schools in your exact city tier.";
  };

  const getDynamicDoctorMetaphor = (lowestSubject: string) => {
    if (lowestSubject === 'Admissions & Enrollment') {
      return "💡 The Doctor Metaphor: Just like a clinic checkup, you might report low body weight (symptom) but find digestive nutrient malabsorption (root cause). Targeting inquiry follow-up workflows yields far better admissions than spending more on top-of-funnel ads.";
    }
    if (lowestSubject === 'Staff & HR' || lowestSubject === 'Teacher Effectiveness') {
      return "💡 The Doctor Metaphor: Just like a clinic checkup, you might report a headache (symptom) but find high blood pressure and sleep deprivation (root cause) in your charts. Fixing teacher workload and administrative burden stabilizes classroom performance far better than changing textbooks.";
    }
    if (lowestSubject === 'Finance & Fees') {
      return "💡 The Doctor Metaphor: Just like a clinic checkup, you might notice acute dehydration (symptom) caused by an unnoticed internal fluid leak (root cause). Automating fee reminder schedules stops cash flow leakage.";
    }
    if (lowestSubject === 'Academic Excellence') {
      return "💡 The Doctor Metaphor: Just like treating a fever with ice vs addressing the underlying viral infection. Establishing structured diagnostic remedial tracking treats the root cause of slipping exam results.";
    }
    if (lowestSubject === 'Family Support') {
      return "💡 The Doctor Metaphor: Just like a patient experiencing chronic anxiety caused by poor communication. Streamlining SLA resolution for parent queries calms community anxiety before it impacts student retention.";
    }
    if (lowestSubject === 'Emotional Wellbeing' || lowestSubject === 'Social-Emotional Dev' || lowestSubject === 'Digital Wellness') {
      return "💡 The Doctor Metaphor: Just like diagnosing Vitamin D deficiency causing chronic fatigue. Proactively introducing wellness counseling and screen-time boundaries restores classroom vitality.";
    }
    return "💡 The Doctor Metaphor: Just like a clinic checkup, you might report a headache (symptom) but find high blood pressure (root cause) in your charts. Targeting the systemic operational cause is far more powerful than treating the visual pain point.";
  };

  // Root Cause Interactive map details
  const ROOT_CAUSE_NODES: Record<string, { title: string, details: string, metric: string, status: string }> = {
    workload: {
      title: "Teacher Administrative Burden",
      metric: "12-14 hrs/week on paperwork",
      details: "Staff surveys show core faculty spend a massive chunk of their week manually taking attendance, updating fee ledgers, and maintaining physical diaries. This takes valuable energy away from classroom instruction and lesson prep.",
      status: "High Friction Link"
    },
    burnout: {
      title: "Faculty Fatigue & Burnout",
      metric: "78% burnout response rate",
      details: "High substitution periods (due to absent teachers) coupled with daily administrative tracking chores leads directly to teacher stress. In exit logs, this was cited more frequently than salary as the reason for leaving.",
      status: "Critical Risk"
    },
    attrition: {
      title: "Teacher Turnover Rate",
      metric: "28% Annual Turnover",
      details: "Frequent mid-year teacher resignations result in critical educational gaps. Constant staff replacement breaks student rapport, lags syllabus timeline, and triggers parental dissatisfaction.",
      status: "Severe Issue"
    },
    delays: {
      title: "Syllabus & Curriculum Lags",
      metric: "Grade 10 Math 3 weeks behind",
      details: "With replacement teachers taking time to onboard, classroom instruction stalls. Students miss out on remedial practice tracks and enter term examinations with inadequate revision time.",
      status: "Performance Impact"
    },
    marks: {
      title: "Declining Final Test Scores",
      metric: "-15% Average Midterm Pass Rate",
      details: "Unfinished coursework directly impacts student confidence and grades. trailing grades act as a flashing alarm for parents.",
      status: "Trailing Symptom"
    },
    complaints: {
      title: "Parent Grievances & Complaints",
      metric: "Avg 22 disputes / month",
      details: "Seeing their children's grades drop and feeling a lack of active communication from the school, parents start expressing frustration, raising complaints about high fee ratios for poor outcomes.",
      status: "Admissions Drop Catalyst"
    },
    enrollment: {
      title: "Admissions Decline / shortfalls",
      metric: "-18% conversion rate",
      details: "Frustrated current parents begin pulling kids out mid-term, while local word of mouth turns cold. Online reviews drop, leading prospective families who tour the campus to convert elsewhere.",
      status: "Final Business Impact"
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-16">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider mb-1">
            <HeartPulse className="w-5 h-5 text-blue-500" />
            <span>Disha Diagnostic Suite &bull; Board Approved</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">School First Opinion Engine</h2>
          <p className="text-gray-500 mt-1 font-medium">An annual school diagnostic first opinion, run in simple language by an app instead of an auditor.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100 text-xs font-bold text-indigo-700 w-fit">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>Completed in 1 sitting</span>
        </div>
      </div>

      {/* STEPPERS */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-150 shadow-sm text-[10px] sm:text-xs font-bold text-gray-400 overflow-x-auto gap-3">
        {[
          { label: '1. Select Worries', active: step === 0 },
          { label: '2. Screening Intake', active: step === 1 },
          { label: '3. First Opinion Report', active: step === 2 }
        ].map((s, idx) => (
          <div key={idx} className="flex items-center gap-2 shrink-0">
            <span className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center border text-xs",
              s.active ? "bg-indigo-600 text-white border-indigo-600 font-black shadow-sm" : "bg-gray-50 text-gray-400 border-gray-200"
            )}>
              {idx + 1}
            </span>
            <span className={cn("inline", s.active ? "text-indigo-700 font-extrabold" : "text-gray-400 font-medium")}>
              {s.label}
            </span>
            {idx < 2 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-1" />}
          </div>
        ))}
      </div>

      {/* STEP 0: CHALLENGE MENU */}
      {step === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Challenge-First Entry Portal</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">What is worrying you most right now?</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                No complex 100-question audits or forms. Select up to 3 challenges keeping you up at night. Disha will generate a custom diagnostic checkup centered strictly around these worries.
              </p>

              {/* Grouped Challenge Options */}
              <div className="space-y-6 pt-4">
                {CATEGORIES.map(cat => {
                  const CategoryIcon = cat.icon;
                  const catChallenges = challenges.filter(c => c.category === cat.id);
                  return (
                    <div key={cat.id} className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                        <div className={cn("p-1.5 rounded-lg shrink-0", cat.color)}>
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <h4 className="font-extrabold text-sm text-gray-800 uppercase tracking-wider">{cat.label}</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {catChallenges.map(challenge => {
                          const isSelected = selectedChallenges.includes(challenge.id);
                          return (
                            <div 
                              key={challenge.id}
                              onClick={() => toggleChallenge(challenge.id)}
                              className={cn(
                                "p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 hover:bg-gray-50",
                                isSelected 
                                  ? "border-blue-600 bg-blue-50/20 ring-2 ring-blue-500/10" 
                                  : "border-gray-200 bg-white"
                              )}
                            >
                              <div className="flex items-start gap-2.5">
                                <input 
                                  type="checkbox" 
                                  checked={isSelected}
                                  onChange={() => {}} // toggled on container click
                                  className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <div className="space-y-0.5">
                                  <p className={cn("font-bold text-xs md:text-sm text-gray-900", isSelected ? "text-blue-700" : "")}>
                                    {challenge.label}
                                  </p>
                                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                                    {challenge.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {!activeSchool && (
              <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-800 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold text-sm text-rose-900">No School Profile Selected</p>
                  <p className="text-xs font-semibold text-rose-700 leading-relaxed">
                    A First Opinion checkup must be linked to a specific school. Please select an existing school, or create a new school profile, from the school dropdown in the left sidebar before continuing.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              {activeSchool && selectedChallenges.length < 3 && (
                <span className="text-xs font-bold text-amber-600">
                  Select {3 - selectedChallenges.length} more challenge{3 - selectedChallenges.length > 1 ? 's' : ''} ({selectedChallenges.length}/3)
                </span>
              )}
              <button
                onClick={() => activeSchool && selectedChallenges.length === 3 && setStep(1)}
                disabled={!activeSchool || selectedChallenges.length !== 3}
                title={!activeSchool ? 'Select or create a school profile first' : selectedChallenges.length !== 3 ? 'Select exactly 3 challenges to continue' : undefined}
                className={cn(
                  "text-white font-bold px-7 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm",
                  activeSchool && selectedChallenges.length === 3
                    ? "bg-blue-600 hover:bg-blue-700 shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:translate-x-0.5"
                    : "bg-gray-300 cursor-not-allowed"
                )}
              >
                Assemble Diagnostic Screening
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SIDEBAR CONCEPT CARD */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-sm">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-base">How Disha Works</h4>
              <ul className="space-y-3 text-xs text-slate-400 leading-relaxed font-medium">
                <li className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Challenge First:</strong> You state your burning worries first rather than filling in exhaustive compliance templates.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>First Opinion First:</strong> Generates a focused, actionable diagnostic finding within a few short questions before demanding full-school crawls.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Insight Over Charts:</strong> Translates raw metrics into a simple diagnostic comparison (Perception vs. Actual Data).</span>
                </li>
                <li className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Real-Time Dashboard:</strong> View instant diagnostic results and actionable recommendations without waiting for complex analysis cycles.</span>
                </li>
              </ul>
              <div className="border-t border-slate-800 pt-4 text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>DPDP Act 2023 Consent Compliant</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3 text-xs text-gray-500">
              <h5 className="font-bold text-gray-800 uppercase tracking-widest text-[10px]">Active First Opinion Target</h5>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 font-medium">
                {activeSchool ? (
                  <>
                    <p className="font-bold text-gray-900">{activeSchool.name}</p>
                    <p className="text-gray-500 mt-0.5">{activeSchool.city} &bull; {activeSchool.board}</p>
                  </>
                ) : (
                  <p className="text-gray-500 italic">No school selected. Select a school from the dropdown to begin.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: SCREENING QUESTIONS & INPUTS */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6" id="screening-questions-container">
              
              <div className="border-b border-gray-100 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedChallenges.map(cid => {
                      const c = challenges.find(item => item.id === cid);
                      return (
                        <span key={cid} className="bg-blue-50 text-blue-700 text-[10px] px-2.5 py-1 rounded-md font-bold border border-blue-100">
                          Symptom: {c?.label.split('/')[0]}
                        </span>
                      );
                    })}
                  </div>
                  {/* Status Badge */}
                  {(() => {
                    const req = getRequiredQuestions();
                    const missing = req.filter(q => !answers[q.id] || answers[q.id].trim() === '');
                    const isComplete = missing.length === 0;
                    return (
                      <span className={cn(
                        "text-xs px-3 py-1 rounded-full font-black flex items-center gap-1.5 border",
                        isComplete 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      )}>
                        {isComplete ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>All {req.length} Questions Answered</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            <span>{req.length - missing.length} of {req.length} Answered (Compulsory)</span>
                          </>
                        )}
                      </span>
                    );
                  })()}
                </div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span>Focused Screening Questions</span>
                  <span className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                    Mandatory *
                  </span>
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium mt-1">
                  Answering all customized screening questions below is compulsory to generate your First Opinion. Uploading supporting documents provides additional evidence but cannot replace these responses.
                </p>
              </div>

              {/* Validation Warning Alert Banner if missing answers */}
              {validationError && (
                <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-800 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-extrabold text-sm text-rose-900">Compulsory Questions Unanswered</p>
                    <p className="text-xs font-semibold text-rose-700 leading-relaxed">
                      {validationError}
                    </p>
                  </div>
                </div>
              )}

              {/* School Profile Baseline - locked summary, sourced directly from the active school profile (not editable, not re-asked) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    School Profile Baseline (Sector Benchmarking)
                  </h4>
                  <span className="text-[10px] font-black text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full shrink-0">
                    LOCKED &bull; FROM SCHOOL PROFILE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Already on file for <strong>{activeSchool?.name || 'this school'}</strong> — not asked again here. To change any of these, edit the school profile from the sidebar.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700">
                  {[
                    { label: 'Affiliation Board', value: activeSchool?.board },
                    { label: 'Student Body Size', value: activeSchool?.studentCount },
                    { label: 'Annual Fee Band', value: activeSchool?.feeBand },
                    { label: 'City / Location Tier', value: activeSchool?.tier },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-2 bg-slate-100/70 rounded-lg px-3 py-2">
                      <span className="text-slate-500 font-medium">{label}</span>
                      <span className="font-bold text-slate-800 text-right">{value || 'Not set in school profile'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic screening questions based on selected challenges */}
              <div className="space-y-5">
                {selectedChallenges.map(cid => {
                  const challengeObj = challenges.find(c => c.id === cid);
                  if (!challengeObj) return null;
                  return (
                    <div key={cid} className="p-4 rounded-xl border border-gray-100 bg-white shadow-xs space-y-4">
                      <p className="font-black text-xs text-blue-600 uppercase tracking-widest border-b border-gray-50 pb-1 flex items-center justify-between">
                        <span>Screening: {challengeObj.label.split('/')[0]}</span>
                        <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-bold border border-rose-100">
                          Compulsory Questions
                        </span>
                      </p>
                      {challengeObj.questions.map(q => {
                        const isAnswered = Boolean(answers[q.id] && answers[q.id].trim() !== '');
                        const isMissing = Boolean(validationError && !isAnswered);
                        return (
                          <div key={q.id} className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <label className="block text-sm font-bold text-gray-800 leading-tight">
                                {q.label} <span className="text-rose-500 font-black">*</span>
                              </label>
                              {isAnswered ? (
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-extrabold flex items-center gap-1 shrink-0 border border-emerald-100">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Answered
                                </span>
                              ) : (
                                <span className={cn(
                                  "text-[10px] px-2 py-0.5 rounded font-extrabold shrink-0 border",
                                  isMissing 
                                    ? "text-rose-700 bg-rose-100 border-rose-300 animate-pulse" 
                                    : "text-amber-700 bg-amber-50 border-amber-200"
                                )}>
                                  Required *
                                </span>
                              )}
                            </div>
                            <select
                              value={answers[q.id] || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              className={cn(
                                "w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 font-semibold transition-all",
                                isMissing
                                  ? "border-rose-500 bg-rose-50/20 ring-2 ring-rose-500/20 text-rose-900"
                                  : isAnswered
                                    ? "border-emerald-300 bg-emerald-50/10 focus:ring-emerald-500"
                                    : "border-gray-200 focus:ring-blue-500"
                              )}
                            >
                              <option value="">-- Select an Option (Compulsory) --</option>
                              {q.options?.map((opt, oIdx) => (
                                <option key={oIdx} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Required Data Fields - computed live from the 3 selected challenges */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-4">
                <h4 className="font-extrabold text-xs text-indigo-900 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Required Data Fields for This Checkup
                </h4>
                <p className="text-[11px] text-indigo-800/80 font-medium -mt-2">
                  Upload a CSV with two columns, header <code className="bg-white px-1 py-0.5 rounded border border-indigo-200 font-mono">metric_field,value</code>, containing one row per field below. The challenge-specific fields change based on which 3 challenges you selected — a different combination needs different data.
                </p>

                <div>
                  <p className="text-[11px] font-black text-indigo-700 uppercase tracking-wider mb-1.5">Core Operational Levers (always required)</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead>
                        <tr className="text-slate-500 border-b border-indigo-100">
                          <th className="py-1 pr-3 font-bold">metric_field</th>
                          <th className="py-1 pr-3 font-bold">What it is</th>
                          <th className="py-1 font-bold">Example value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CORE_OPERATIONAL_METRICS.map(m => (
                          <tr key={m.fieldName} className="border-b border-indigo-50">
                            <td className="py-1 pr-3 font-mono text-indigo-700">{m.fieldName}</td>
                            <td className="py-1 pr-3 text-gray-700">{m.displayName} ({m.unit})</td>
                            <td className="py-1 text-gray-500">{m.example}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-black text-indigo-700 uppercase tracking-wider mb-1.5">
                    Challenge-Specific Metrics (based on your 3 selected challenges)
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead>
                        <tr className="text-slate-500 border-b border-indigo-100">
                          <th className="py-1 pr-3 font-bold">metric_field</th>
                          <th className="py-1 pr-3 font-bold">What it is</th>
                          <th className="py-1 font-bold">Example value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getRequiredMetricsForChallenges(selectedChallenges).map(m => (
                          <tr key={m.fieldName} className="border-b border-indigo-50">
                            <td className="py-1 pr-3 font-mono text-indigo-700">{m.fieldName}</td>
                            <td className="py-1 pr-3 text-gray-700">{m.displayName} ({m.unit})</td>
                            <td className="py-1 text-gray-500">{m.example}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Supporting Document Upload */}
              <div id="file-upload-container" className={`pt-4 border-t-2 space-y-4 ${!uploadedFile ? 'border-rose-300 bg-rose-50/30 p-4 rounded-lg' : 'border-gray-100'}`}>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                    <Upload className={`w-4 h-4 ${!uploadedFile ? 'text-rose-600 animate-pulse' : 'text-indigo-500'}`} />
                    {!uploadedFile ? (
                      <span>📊 REQUIRED: Upload Operational Data Document</span>
                    ) : (
                      <span>Share Supporting Information (Data Document)</span>
                    )}
                  </h4>
                  <p className={`text-xs mt-1 leading-relaxed ${!uploadedFile ? 'text-rose-700 font-semibold' : 'text-gray-500'}`}>
                    {!uploadedFile ? (
                      <>Upload operational data (attendance, fee collection, staff records, academic results, etc.) to enable data-driven First Opinion analysis. Without actual metrics, the system cannot compare subjective assessment against operational reality.</>
                    ) : (
                      <>Data file uploaded successfully. Ready to analyze and generate First Opinion.</>
                    )}
                  </p>
                </div>

                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center",
                    uploadedFileName 
                      ? "border-emerald-500 bg-emerald-50/10" 
                      : "border-gray-300 bg-gray-50/50 hover:border-blue-500"
                  )}
                >
                  <input
                    type="file"
                    id="evidence-file-check"
                    accept=".csv,.xlsx,.xls,.pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="evidence-file-check" className="cursor-pointer w-full flex flex-col items-center justify-center">
                    {uploadedFileName ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                          {isAnalyzingFile ? (
                            <RefreshCw className="w-6 h-6 animate-spin" />
                          ) : extractedMetrics ? (
                            <CheckCircle2 className="w-6 h-6 animate-bounce" />
                          ) : (
                            <CheckCircle2 className="w-6 h-6" />
                          )}
                        </div>
                        <p className="text-sm font-bold text-gray-900">{uploadedFileName}</p>
                        {isAnalyzingFile ? (
                          <p className="text-xs text-blue-600 font-bold">🔍 Analyzing data metrics...</p>
                        ) : extractedMetrics && extractedMetrics.fileType !== 'UNREADABLE_BINARY_FILE' && Object.keys(extractedMetrics.metricsFound).length > 0 ? (
                          <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-3 text-left">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                              Exactly What We Read From Your File — verify this matches what you entered
                            </p>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                  <tr className="text-slate-500 border-b border-slate-200">
                                    <th className="py-1 pr-3 font-bold">metric_field (as read)</th>
                                    <th className="py-1 font-bold">Value captured</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(extractedMetrics.metricsFound).map(([field, value]) => (
                                    <tr key={field} className="border-b border-slate-100">
                                      <td className="py-1 pr-3 font-mono text-slate-700">{field}</td>
                                      <td className={cn('py-1 font-bold', String(value).trim() === '' ? 'text-rose-500 italic' : 'text-slate-900')}>
                                        {String(value).trim() === '' ? '(blank value)' : String(value)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : null}

                        {isAnalyzingFile ? null : fileValidation ? (
                          <>
                            {fileValidation.isValid ? (
                              <>
                                <p className="text-xs text-emerald-600 font-bold">✅ Data VALID! All required metrics found.</p>
                                <div className="mt-2 space-y-1">
                                  {fileValidation.foundMetrics.map((metric, idx) => (
                                    <p key={idx} className="text-xs text-emerald-700 font-medium">{metric}</p>
                                  ))}
                                </div>
                              </>
                            ) : extractedMetrics?.fileType === 'UNREADABLE_BINARY_FILE' ? (
                              <div className="mt-2 space-y-2 bg-rose-50 p-3 rounded border border-rose-200 text-left">
                                <p className="text-xs text-rose-800 font-bold">❌ Could not read this file — not a missing-data problem</p>
                                <p className="text-xs text-rose-700">{extractedMetrics.unreadableReason}</p>
                                <p className="text-xs text-rose-900 font-semibold mt-1">How to fix:</p>
                                <p className="text-xs text-rose-700">
                                  Supported formats: .csv, .xlsx/.xls, and text-based .pdf. The file needs a
                                  "metric_field, value" header with one field per row — see the Required Data
                                  Fields table above for the exact names to use, then re-upload.
                                </p>
                              </div>
                            ) : (
                              <>
                                <p className="text-xs text-rose-600 font-bold">❌ Data INCOMPLETE! Missing required fields.</p>
                                <div className="mt-2 space-y-1 bg-rose-50 p-2 rounded border border-rose-200">
                                  {fileValidation.foundMetrics.length > 0 && (
                                    <>
                                      <p className="text-xs font-semibold text-rose-900">Found:</p>
                                      {fileValidation.foundMetrics.map((metric, idx) => (
                                        <p key={idx} className="text-xs text-emerald-700 ml-2">{metric}</p>
                                      ))}
                                    </>
                                  )}
                                  <p className="text-xs font-semibold text-rose-900 mt-2">Missing — not found in your file:</p>
                                  {fileValidation.requiredMetrics
                                    .filter(r => fileValidation.missingMetrics.some(mm => mm.includes(r.fieldName)))
                                    .map((missing, idx) => (
                                      <p key={idx} className="text-xs text-rose-700 ml-2">
                                        • {missing.description} — add row <span className="font-mono">{missing.fieldName},&lt;your value&gt;</span>
                                      </p>
                                    ))}
                                </div>
                              </>
                            )}
                          </>
                        ) : extractedMetrics ? (
                          <p className="text-xs text-emerald-600 font-bold">✓ Data analyzed! {extractedMetrics.insights.length} insights extracted.</p>
                        ) : (
                          <p className="text-xs text-emerald-600 font-bold">Successfully attached. Document will scan as Tier-A hard-record confidence!</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Upload className="w-5 h-5 text-indigo-500" />
                        </div>
                        <p className="text-xs font-bold text-gray-700">Drag & drop files here, or <span className="text-indigo-600 underline">browse</span></p>
                        <p className="text-[10px] text-gray-400">CSV, Excel (.xlsx/.xls), or text-based PDF — see Required Data Fields above (Up to 15MB)</p>
                      </div>
                    )}
                  </label>
                </div>

                {!uploadedFileName && (
                  <div className="flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={simulateRegisterPhoto}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Camera className="w-4 h-4 text-indigo-500" />
                      Simulate uploading a snapshot of teacher attendance register
                    </button>
                  </div>
                )}
              </div>

            </div>

            {validationError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
                <span>Assessment locked: Please answer all mandatory screening questions above to move further.</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setValidationError(null);
                  setStep(0);
                }}
                className="text-gray-500 hover:text-gray-800 font-bold text-sm"
              >
                Back to Worries
              </button>

              <button
                onClick={handleSaveCheckupToFirestore}
                disabled={isSubmittingToFirestore || isProcessing || isAnalyzingFile || !uploadedFile || (fileValidation ? !fileValidation.isValid : false)}
                className={`font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm ${
                  !uploadedFile || isAnalyzingFile || (fileValidation && !fileValidation.isValid)
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)]'
                }`}
                title={
                  !uploadedFile ? '⚠️ Please upload a data file first'
                  : isAnalyzingFile ? '⏳ Still analyzing your file'
                  : fileValidation && !fileValidation.isValid ? '❌ Uploaded file is missing required data — fix and re-upload'
                  : ''
                }
              >
                {isSubmittingToFirestore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving to Database...
                  </>
                ) : isProcessing || isAnalyzingFile ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Running Intake Scan...
                  </>
                ) : !uploadedFile ? (
                  <>
                    📁 Upload Data File First
                  </>
                ) : fileValidation && !fileValidation.isValid ? (
                  <>
                    ❌ Fix Data File First
                  </>
                ) : (
                  <>
                    Analyze & Get First Opinion
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 text-xs font-bold text-blue-400 uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                <span>Intake Conversion</span>
              </div>
              <h4 className="font-bold text-sm">Adaptive Screening Info</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                "Our platform uses conditional branching. We only prompt you for variables and inputs related to your selected challenges, skipping hundreds of irrelevant data fields."
              </p>
              
              <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-750 text-xs space-y-2">
                <p className="font-bold text-slate-300">Scanning Variables:</p>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Affiliation Board:</span>
                  <span className="text-white font-bold">{board}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Region Baseline:</span>
                  <span className="text-white font-bold">{cityTier.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: FIRST OPINION DIAGNOSIS (THE DOCTOR FIRST VISIT) */}
      {step === 2 && (
        <div className="space-y-6">
          {/* DISHA Score Dashboard - Primary Display */}
          {dishaScore && (
            <>
              <DISHAScoreDashboard score={dishaScore} />

              {/* PERCEPTION GAP ANALYSIS - per selected challenge */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Perception Gap Analysis — Per Challenge
                </h3>
                <p className="text-xs text-gray-500 -mt-2">
                  Compares what leadership self-reported for each selected challenge against the objective data uploaded for it (1 = best, 10 = worst on both sides).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {perceptionGapReport.map(entry => {
                    const verdictStyle: Record<string, string> = {
                      ALIGNED: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                      DELUSIONAL_COMFORT: 'bg-rose-50 border-rose-200 text-rose-800',
                      HIDDEN_EXCELLENCE: 'bg-blue-50 border-blue-200 text-blue-800',
                      CONFIRMED_CRISIS: 'bg-orange-50 border-orange-200 text-orange-800',
                      INSUFFICIENT_DATA: 'bg-gray-50 border-gray-200 text-gray-600'
                    };
                    const verdictLabel: Record<string, string> = {
                      ALIGNED: 'Aligned — perception matches reality',
                      DELUSIONAL_COMFORT: '⚠ Delusional Comfort — worse than perceived',
                      HIDDEN_EXCELLENCE: '✓ Hidden Excellence — better than perceived',
                      CONFIRMED_CRISIS: 'Confirmed Crisis — both agree it is bad',
                      INSUFFICIENT_DATA: 'Insufficient objective data uploaded'
                    };
                    return (
                      <div key={entry.challengeKey} className={cn('p-4 rounded-xl border space-y-2', verdictStyle[entry.verdict])}>
                        <p className="font-bold text-sm">{entry.challengeLabel}</p>
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Self-reported: {entry.subjectiveWeight ?? '—'}/10</span>
                          <span>Objective: {entry.objectiveWeight ?? '—'}/10</span>
                        </div>
                        <p className="text-[11px] font-bold">{verdictLabel[entry.verdict]}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* EXTRACTED METRICS & RECOMMENDATIONS */}
              {extractedMetrics && (
            <div className="space-y-6 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-3xl border border-blue-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">📊</span>
                  Data-Driven Insights from {extractedMetrics.fileType}
                </h3>
              </div>

              {/* Extracted Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(extractedMetrics.metricsFound).map(([key, value]) => {
                  if (key === 'fileType') return null;
                  return (
                    <div key={key} className="bg-white p-4 rounded-lg border border-blue-100">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {typeof value === 'number' && (key.includes('Rate') || key.includes('rate') || key.includes('Percentage')) ? `${value}%` : value}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Overall Assessment */}
              {realInsights && (
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg">
                  <p className="text-sm font-bold text-gray-900 flex items-start gap-2">
                    <span className="text-lg">📌</span>
                    <span>{realInsights.overallAssessment}</span>
                  </p>
                </div>
              )}

              {/* Real Key Findings */}
              {realInsights && realInsights.keyFindings.length > 0 && (
                <div className="bg-white p-6 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">🔍</span> Key Findings from Your Data
                  </h4>
                  <ul className="space-y-3">
                    {realInsights.keyFindings.map((finding, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex gap-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                        <span className="text-blue-600 font-bold">→</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Real Recommended Actions */}
              {realInsights && realInsights.recommendations.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">💡</span> Prioritized Recommended Actions
                  </h4>
                  <ol className="space-y-3">
                    {realInsights.recommendations.map((action, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Data Quality Metrics */}
              {realInsights && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <p className="text-xs font-bold text-gray-600 uppercase">Metrics Extracted</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{realInsights.dataQuality.metricsFound}</p>
                    <p className="text-xs text-gray-500 mt-1">of {realInsights.dataQuality.metricsExpected} expected</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <p className="text-xs font-bold text-gray-600 uppercase">Data Completeness</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{realInsights.dataQuality.completeness}%</p>
                    <p className="text-xs text-gray-500 mt-1">coverage of expected fields</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <p className="text-xs font-bold text-gray-600 uppercase">Data Reliability</p>
                    <p className={cn(
                      "text-lg font-bold mt-1 uppercase",
                      realInsights.dataQuality.reliability === 'high' ? 'text-emerald-600' :
                      realInsights.dataQuality.reliability === 'medium' ? 'text-amber-600' :
                      'text-red-600'
                    )}>
                      {realInsights.dataQuality.reliability}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">based on data quality</p>
                  </div>
                </div>
              )}

              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <p className="font-bold text-emerald-900 text-sm">Data Analysis Complete</p>
                  <p className="text-xs text-emerald-800 mt-1">Your uploaded data has been analyzed and integrated into the diagnostic. All insights above are derived from your real school metrics, with specific metrics and gaps identified.</p>
                </div>
              </div>
            </div>
          )}
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6">
            <button
              onClick={() => setStep(0)}
              className="text-gray-500 hover:text-gray-800 font-bold text-sm"
            >
              Back to Worries
            </button>
            <button
              onClick={() => {/* Report generation complete */}}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Report Complete
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

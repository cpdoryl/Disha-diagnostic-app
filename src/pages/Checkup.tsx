import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { useAppStore } from '../store';
import { DeepDiveAssessment } from '../components/DeepDiveAssessment';
import { DISHAScoreDashboard } from '../components/DISHAScoreDashboard';
import FileAnalyzer, { ExtractedMetrics } from '../lib/fileAnalyzer';
import DiagnosisGenerator, { DiagnosisResult } from '../lib/dynamicDiagnosisGenerator';
import DISHAScoreCalculator, { DISHAScore, OperationalMetrics } from '../lib/dishaScoreCalculator';
import { generateRealInsights, DataAnalysisResult } from '../lib/insightGenerator';
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
  Download
} from 'lucide-react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';
import { COMPLETE_SCREENING_QUESTIONS } from '../data/screeningQuestionsData';
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

export const Checkup = () => {
  console.log('🔴 CHECKUP COMPONENT LOADED - This is the latest version');
  const { activeSchool } = useAppStore();
  
  // Layout stages:
  // 0: Select Symptoms (Challenge Menu)
  // 1: Screening baseline + follow-up questions
  // 2: Quick first opinion (perception-vs-data gap)
  // 3: 14-Dimension Multilateral Survey Deployment Portal (EWISR Stage 1: Capture)
  // 4: Complete Comprehensive School Diagnostics Report (The 12-Lens & 14-Dimension Comparison)
  const [step, setStep] = useState<number>(0);
  const [activeReportTab, setActiveReportTab] = useState<'standard' | 'ewisr'>('standard');
  const [ewisrDimensions, setEwisrDimensions] = useState<any>(null);
  const [ewisrAnswers, setEwisrAnswers] = useState<any>(null);
  
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

  // DISHA Score State
  const [dishaScore, setDISHAScore] = useState<DISHAScore | null>(null);
  const [operationalMetrics, setOperationalMetrics] = useState<OperationalMetrics>({
    studentTeacherRatio: 28,
    parentResponseSLA: 24,
    annualTrainingHours: 20,
    weeklyPlanningHours: 4
  });

  // UI Loading/Transition states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDeepScanning, setIsDeepScanning] = useState<boolean>(false);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState<boolean>(false);

  // Active Root Cause node
  const [activeRootNode, setActiveRootNode] = useState<string>('workload');

  // Competitor Inputs
  const [comp1, setComp1] = useState<string>('');
  const [comp2, setComp2] = useState<string>('');

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
    return COMPLETE_SCREENING_QUESTIONS.map(challenge => ({
      id: challenge.id,
      category: challenge.category,
      label: challenge.label,
      description: challenge.label,
      probes: challenge.domain,
      dataRequired: challenge.metrics.join(', '),
      questions: challenge.questions.map(q => ({
        id: q.id,
        label: q.label,
        type: 'select' as const,
        options: q.options
      })),
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
    const req: { id: string; label: string; challengeTitle: string }[] = [];
    selectedChallenges.forEach(cid => {
      const cObj = challenges.find(c => c.id === cid);
      if (cObj) {
        cObj.questions.forEach(q => {
          req.push({
            id: q.id,
            label: q.label,
            challengeTitle: cObj.label
          });
        });
      }
    });
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

      // Map extracted metrics to DISHA operational metrics
      const updatedOperationalMetrics: OperationalMetrics = {
        studentTeacherRatio: metrics.metricsFound['students_per_classroom'] as number || 28,
        parentResponseSLA: metrics.metricsFound['parent_query_response_sla_hours'] as number || 24,
        annualTrainingHours: metrics.metricsFound['annual_training_hours'] as number || 20,
        weeklyPlanningHours: metrics.metricsFound['weekly_planning_hours'] as number || 4
      };
      setOperationalMetrics(updatedOperationalMetrics);

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
    } finally {
      setIsAnalyzingFile(false);
    }
  };

  const simulateRegisterPhoto = () => {
    setUploadedFileName('attendance_register_snapshot.jpg');
    setUploadedFile(new File([], 'attendance_register_snapshot.jpg'));
  };

  // DIAGNOSTIC ENGING CALCULATION
  const runFirstOpinionDiagnostic = () => {
    const required = getRequiredQuestions();
    const missing = required.filter(q => !answers[q.id] || answers[q.id].trim() === '');

    if (missing.length > 0) {
      setValidationError(
        `Action Required: You must answer all ${missing.length} remaining compulsory screening question${missing.length > 1 ? 's' : ''} before generating your First Opinion. Uploading data documents alone is not sufficient.`
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
    const answersArray = required.map(q => {
      const selectedOptionValue = answers[q.id];
      if (!selectedOptionValue) {
        return { questionId: q.id, weight: 5 }; // default middle weight
      }

      // Find the selected option and extract its weight
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

  const runDeepCheckup = () => {
    setIsDeepScanning(true);
    setTimeout(() => {
      setIsDeepScanning(false);
      setStep(3);
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
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Adaptive School Health Checkup</h2>
          <p className="text-gray-500 mt-1 font-medium">An annual school diagnostic checkup, run in simple language by an app instead of an auditor.</p>
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
          { label: '3. First Opinion', active: step === 2 },
          { label: '4. 14D Deployment', active: step === 3 },
          { label: '5. Diagnostic Report', active: step === 4 }
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
            {idx < 4 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-1" />}
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

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(1)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:translate-x-0.5 text-sm"
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
                  <span><strong>Reverse-Parameter Simulation Engine:</strong> Simulate back-testing and adjustment of key educational metrics in real-time to forecast target outcomes and prevent structural risks.</span>
                </li>
              </ul>
              <div className="border-t border-slate-800 pt-4 text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>DPDP Act 2023 Consent Compliant</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3 text-xs text-gray-500">
              <h5 className="font-bold text-gray-800 uppercase tracking-widest text-[10px]">Active Checkup Target</h5>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 font-medium">
                <p className="font-bold text-gray-900">{activeSchool?.name || 'Vasant Vihar Public School'}</p>
                <p className="text-gray-500 mt-0.5">Mumbai Branch &bull; Primary & Secondary</p>
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

              {/* Minimal School Profile Baseline */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  School Profile Baseline (Sector Benchmarking)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                  <div className="space-y-1.5">
                    <label className="text-gray-500">Affiliation Board</label>
                    <select value={board} onChange={(e) => setBoard(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2 font-semibold">
                      <option value="CBSE">CBSE (Central Board)</option>
                      <option value="ICSE">ICSE / ISC</option>
                      <option value="State">State Board</option>
                      <option value="IB/IGCSE">IB / IGCSE International</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-500">Student Body Size</label>
                    <select value={schoolSize} onChange={(e) => setSchoolSize(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2 font-semibold">
                      <option value="Small (< 500 students)">Small (Under 500 students)</option>
                      <option value="Medium (500 - 1500 students)">Medium (500 to 1500 students)</option>
                      <option value="Large (1500+ students)">Large (Above 1500 students)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-500">Annual Fee Band</label>
                    <select value={feeBand} onChange={(e) => setFeeBand(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2 font-semibold">
                      <option value="Low (< ₹25k per year)">Low (Under ₹25k per year)</option>
                      <option value="Medium (₹25k - ₹75k per year)">Medium (₹25k to ₹75k per year)</option>
                      <option value="High (₹75k+ per year)">High (Above ₹75k per year)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-500">City / Location Tier</label>
                    <select value={cityTier} onChange={(e) => setCityTier(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2 font-semibold">
                      <option value="Tier 1 (Metro)">Tier 1 (Metros: Delhi, Mumbai, Bangalore)</option>
                      <option value="Tier 2 (Capital / Large Cities)">Tier 2 (State Capitals / Industrial Cities)</option>
                      <option value="Tier 3 (District Towns)">Tier 3 (District Towns / Semirural)</option>
                    </select>
                  </div>
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

              {/* Supporting Document Upload */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-indigo-500" />
                    Share Supporting Information (Optional Data Document)
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Drop a spreadsheet or register file (e.g. fee payment logs, faculty rosters, report card exports). <strong className="text-slate-800">Note:</strong> Uploading data documents boosts diagnostic confidence but does not replace answering the compulsory screening questions above.
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
                        <p className="text-[10px] text-gray-400">PDF, XLS, DOC, or Phone Camera JPG (Up to 15MB)</p>
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
                onClick={runFirstOpinionDiagnostic}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.25)] text-sm"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Running Intake Scan...
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

          {/* PHASE 2 & 3 DISHA COMPLETE SCAN PROPOSAL */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl border border-slate-800 space-y-6 relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="w-48 h-48 text-blue-400" />
            </div>
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-500">
                Stage 2: 14-Dimension EWISR Framework
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white">Unlock the Complete 14-Dimension Checkup</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                Want to run the complete diagnostic? This will deploy all 14 parameters of the EWISR Framework. Enter your competitive benchmark names below, then click to access the live multilateral deployment dashboard where school leaders, teaching staff, parents, and students can provide verified inputs.
              </p>

              {/* Crawl Add-ons Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                {[
                  { id: 'web', label: "School's Website & Mobile latency crawl", desc: "Analyzes SEO, load speeds & dropoffs" },
                  { id: 'reviews', label: "Public review ratings & Google Maps reviews", desc: "Measures parent community sentiment index" },
                  { id: 'social', label: "Instagram & Facebook posting rate", desc: "Evaluates organic brand representation" },
                  { id: 'comp', label: `Compare with ${comp1} & ${comp2}`, desc: "District digital landscape positioning" }
                ].map((addon, idx) => (
                  <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-xs font-bold text-white leading-none">{addon.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 pl-6 leading-tight">{addon.desc}</p>
                  </div>
                ))}
              </div>

              {/* Competitor Name Inputs */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                <p className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider">Provide 2-3 Competitor Schools to Benchmark</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400">Primary Competitor Name</label>
                    <input 
                      type="text" 
                      value={comp1} 
                      onChange={(e) => setComp1(e.target.value)} 
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-semibold text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Secondary Competitor Name</label>
                    <input 
                      type="text" 
                      value={comp2} 
                      onChange={(e) => setComp2(e.target.value)} 
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 font-semibold text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={runDeepCheckup}
                  disabled={isDeepScanning}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-8 py-3.5 rounded-xl text-sm transition-all shadow-[0_4px_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isDeepScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Deploying 14-Dimension Assessment System...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white animate-pulse" />
                      Deploy 14-Dimension Complete Assessment
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setStep(0)}
                  className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Restart screening
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: 14-DIMENSION MULTILATERAL DEPLOYMENT PORTAL */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-350">
          <DeepDiveAssessment 
            isStep3Wizard={true}
            onCompleteStep3={(dimensionsData, answersData) => {
              setEwisrDimensions(dimensionsData);
              setEwisrAnswers(answersData);
              setStep(4);
            }}
          />
        </div>
      )}

      {/* STEP 4: FINAL UNIFIED COMPREHENSIVE DIAGNOSTICS REPORT (THE MULTI-LENS DASHBOARD) */}
      {step === 4 && (
        <div className="space-y-8 animate-in zoom-in-95 duration-300">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            
            {/* Header print controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Comprehensive Annual Health Check Complete</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900">School Diagnostics Report</h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Bespoke diagnostic view for {activeSchool?.name || 'Vasant Vihar Public School'} &bull; Mumbai Branch</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors border border-gray-200"
                >
                  Print Report
                </button>
                <button 
                  onClick={() => setStep(0)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  Start New Checkup
                </button>
              </div>
            </div>

            {/* Report Sub-Tabs Navigation */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveReportTab('standard')}
                className={cn(
                  "px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer",
                  activeReportTab === 'standard'
                    ? "border-blue-600 text-blue-700 font-extrabold border-b-2"
                    : "border-transparent text-gray-450 hover:text-gray-700"
                )}
              >
                12-Lens Diagnostics Report
              </button>
              <button
                onClick={() => setActiveReportTab('ewisr')}
                className={cn(
                  "px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
                  activeReportTab === 'ewisr'
                    ? "border-blue-600 text-blue-700 font-extrabold border-b-2"
                    : "border-transparent text-gray-450 hover:text-gray-700"
                )}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                14-Dimension EWISR Deep-Dive Workspace
              </button>
            </div>
          </div>

          {activeReportTab === 'standard' ? (
            <>
              {/* TWELVE-LENS SCORECARD SECTION (Radar and Bar charts) */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-gray-950 flex items-center gap-1.5">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  Twelve-Lens Diagnostic Scorecard
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed font-medium">
                  We score your school across the **6 Wellbeing Pillars** of the original Wellbeing Framework and the **6 Operational Areas** of the Business & Operations Market Survey.
                </p>
              </div>

              {/* Charts grid */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Radar Chart (left 3 cols) */}
                <div className="lg:col-span-3 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-widest">Interactive Multi-Lens Radar Map</p>
                    <p className="text-[10px] text-gray-400 font-medium">Shows overall operational balance. Deficits are pulled inward.</p>
                  </div>

                  <div className="h-[320px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scorecardData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                        <Radar 
                          name="School Score" 
                          dataKey="score" 
                          stroke="#4f46e5" 
                          fill="#4f46e5" 
                          fillOpacity={0.25} 
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex justify-center gap-6 text-[10px] font-bold text-gray-500 border-t border-slate-200/50 pt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-indigo-600 rounded-xs"></span>
                      <span>Operational Scores (0-100)</span>
                    </div>
                  </div>
                </div>

                {/* Score listing with Confidence index (right 2 cols) */}
                <div className="lg:col-span-2 space-y-3.5 flex flex-col justify-between">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1 space-y-3">
                    <div className="border-b border-slate-200/60 pb-1.5 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Metrics Listing</span>
                      <span className="text-[10px] text-slate-400 font-bold">Data Level</span>
                    </div>

                    <div className="space-y-2 h-[280px] overflow-y-auto pr-1">
                      {scorecardData.map((item, idx) => {
                        const scoreColor = item.score < 60 ? 'text-rose-600' : item.score < 75 ? 'text-amber-600' : 'text-emerald-600';
                        const scoreBg = item.score < 60 ? 'bg-rose-50' : item.score < 75 ? 'bg-amber-50' : 'bg-emerald-50';
                        return (
                          <div key={idx} className="flex items-center justify-between text-xs font-bold p-1.5 rounded-md hover:bg-slate-100/50 transition-colors">
                            <span className="text-gray-700 font-medium">{item.subject}</span>
                            <div className="flex items-center gap-2">
                              <span className={cn("px-2 py-0.5 rounded text-[11px]", scoreColor, scoreBg)}>{item.score}/100</span>
                              <span className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded-full border shrink-0 font-black",
                                item.confidence === 'A' ? "bg-emerald-100 text-emerald-800 border-emerald-200" : 
                                item.confidence === 'B' ? "bg-blue-100 text-blue-800 border-blue-200" : 
                                "bg-amber-100 text-amber-800 border-amber-200"
                              )}>
                                Tier {item.confidence}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-[9px] text-gray-400 font-semibold space-y-1 leading-relaxed border-t border-slate-200/60 pt-2 flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-emerald-600">Tier A:</span> Hard records uploaded (PDF rosters, Fee Gateway spreadsheets).
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-blue-600">Tier B:</span> Standard numerical data and benchmark calculations.
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-amber-600">Tier C:</span> Self-reported pulse assessment responses.
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* PERCEPTION VS DATA DIVERGENCES */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <h4 className="font-bold text-lg text-gray-950 flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5 text-indigo-500" />
                Perceived Severity vs. Data-Confirmed Severity
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Analysis showing cases where your owner-reported worries diverge from what statistical evidence indicates. Identifying this mismatch is your biggest diagnostic breakthrough:
              </p>

              <div className="p-4 bg-indigo-950 text-white rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <ShieldCheck className="w-24 h-24" />
                </div>
                <div className="relative z-10 space-y-2">
                  <p className="text-xs font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-indigo-400" />
                    Insight Summary
                  </p>
                  <p className="text-xs text-slate-200 font-bold leading-relaxed">
                    {mismatchInfo.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* DISTRICT COMPETITOR DIGITAL BENCHMARK (Section 6.5) */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <h4 className="font-bold text-lg text-gray-950 flex items-center gap-1.5">
                <Globe className="w-5 h-5 text-blue-500" />
                District Digital Competitor Positioning Index
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Gathered strictly from publicly available web listings, mobile speed latency crawlers, search indexing, and review sentiment metrics:
              </p>

              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="min-w-full text-left text-xs text-gray-600 font-medium">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Metrics / School</th>
                      <th className="px-4 py-3 text-blue-800">{activeSchool?.name || 'Vasant Vihar Public'} (You)</th>
                      <th className="px-4 py-3">{comp1}</th>
                      <th className="px-4 py-3">{comp2}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-bold text-gray-900">Estimated Annual Fee</td>
                      <td className="px-4 py-3 font-semibold text-blue-800">₹45k - ₹60k (Competitive)</td>
                      <td className="px-4 py-3">₹75k - ₹90k (High Profile)</td>
                      <td className="px-4 py-3">₹30k - ₹40k (Budget Convent)</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-bold text-gray-900">Google Review Score</td>
                      <td className="px-4 py-3 text-rose-600 font-black flex items-center gap-1">
                        <span>3.4 Stars</span>
                        <span className="text-[9px] bg-rose-50 px-1.5 py-0.5 rounded">Critical Lag</span>
                      </td>
                      <td className="px-4 py-3 text-emerald-600 font-bold">4.6 Stars (Active reviews)</td>
                      <td className="px-4 py-3 text-slate-700 font-bold">4.1 Stars (Unclaimed Profile)</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-bold text-gray-900">Website Mobile Friendly Speed</td>
                      <td className="px-4 py-3 text-amber-600 font-bold">Slow: 4.8s load index</td>
                      <td className="px-4 py-3 text-emerald-600 font-bold">Fast: 1.8s mobile index</td>
                      <td className="px-4 py-3 text-slate-500">Stale template: 3.5s</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-bold text-gray-900">Social Posting Frequency</td>
                      <td className="px-4 py-3 text-slate-400">Near-zero (stale since 2024)</td>
                      <td className="px-4 py-3 text-emerald-600 font-bold">Daily (Insta highlights & YT tours)</td>
                      <td className="px-4 py-3 text-slate-500">Monthly news text only</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 bg-indigo-50/20">
                      <td className="px-4 py-3 font-bold text-gray-900">Digital Reputation Verdict</td>
                      <td className="px-4 py-3 font-bold text-rose-700">Online Invisible: Academic quality hidden</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">Digital Premium: Attracts elite inquiries</td>
                      <td className="px-4 py-3 text-slate-600">Legacy-Driven: Relies purely on legacy board scores</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* INTERACTIVE CAUSAL ROOT-CAUSE MAP (Section 7) */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-lg text-gray-950 flex items-center gap-1.5">
                    <Compass className="w-5 h-5 text-indigo-500" />
                    Interactive Root-Cause Map (Causal Connections)
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    Disha maps how separate pain points connect. Click on any operational node below to explore its downstream impact:
                  </p>
                </div>
                <div className="text-[10px] text-gray-400 font-bold">
                  Click nodes to inspect connection logic
                </div>
              </div>

              {/* Node connection blocks */}
              <div className="grid grid-cols-2 md:grid-cols-7 gap-2 text-center text-xs font-bold pt-2">
                {Object.keys(ROOT_CAUSE_NODES).map((nodeKey, idx) => {
                  const node = ROOT_CAUSE_NODES[nodeKey];
                  const isActive = activeRootNode === nodeKey;
                  return (
                    <div key={nodeKey} className="flex flex-col md:flex-row items-center md:col-span-1 gap-1">
                      <div 
                        onClick={() => setActiveRootNode(nodeKey)}
                        className={cn(
                          "p-2.5 rounded-xl border text-center cursor-pointer transition-all w-full flex flex-col justify-between min-h-[90px]",
                          isActive 
                            ? "bg-indigo-600 text-white border-indigo-600 scale-105 shadow-sm" 
                            : "bg-slate-50 text-slate-800 border-slate-100 hover:bg-slate-100"
                        )}
                      >
                        <p className="text-[10px] tracking-tight truncate max-w-full leading-tight font-black">{node.title}</p>
                        <p className={cn("text-[9px] mt-1 font-medium leading-none", isActive ? "text-indigo-200" : "text-gray-400")}>{node.metric.split(' ')[0]}</p>
                        <span className={cn("text-[8px] px-1 py-0.5 rounded mt-2 uppercase font-black tracking-widest block w-fit mx-auto", 
                          isActive ? "bg-white/20 text-white" : "bg-gray-200/80 text-gray-600"
                        )}>
                          Node {idx + 1}
                        </span>
                      </div>
                      {idx < 6 && <ChevronRight className="w-4 h-4 text-slate-300 hidden md:block" />}
                    </div>
                  );
                })}
              </div>

              {/* Node active detail box */}
              <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">
                    Node Connection Logic: {ROOT_CAUSE_NODES[activeRootNode].title}
                  </span>
                  <span className="bg-indigo-900 text-indigo-200 text-[9px] px-2 py-0.5 rounded-full font-bold">
                    {ROOT_CAUSE_NODES[activeRootNode].status}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-1 bg-slate-800 p-3 rounded-lg border border-slate-750 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quant Indicator</p>
                    <p className="text-base font-black text-white mt-1">{ROOT_CAUSE_NODES[activeRootNode].metric}</p>
                  </div>
                  <p className="md:col-span-3 text-xs text-slate-300 leading-relaxed font-medium">
                    {ROOT_CAUSE_NODES[activeRootNode].details}
                  </p>
                </div>
              </div>
            </div>

            {/* DIRECT ACTION PLAN (What to do first) */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <h4 className="font-bold text-lg text-gray-950 flex items-center gap-1.5">
                <Compass className="w-5 h-5 text-emerald-500" />
                First Action Blueprint (Prioritized Roadmap)
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Simple, ground-level tasks formulated to yield the maximum diagnostic ROI with the least workload disruption. No complex charts to interpret:
              </p>

              <div className="space-y-3">
                {[
                  {
                    step: '1',
                    title: 'Claim Google Maps & Run Positive Review Drive',
                    desc: 'Claim your school profile on Google Maps. Send a WhatsApp link to 25 highly satisfied current families asking for an honest 5-star rating.',
                    cost: 'Free',
                    effort: '1 Hour task',
                    roi: 'Raises reputation to >4.5, neutralizes brand weakness'
                  },
                  {
                    step: '2',
                    title: 'Deploy Automated Classroom Attendance Loggers',
                    desc: 'Ditch paper attendance registers. Teachers log attendance in 10 seconds via a shared spreadsheet. Frees up 6 hours/week.',
                    cost: 'Low Cost',
                    effort: 'Medium (1 week rollout)',
                    roi: 'Reduces staff burnout by 35%, stops turnover'
                  },
                  {
                    step: '3',
                    title: 'Instate a 24-Hour Parent Grievance Resolution SLA',
                    desc: 'Publish an absolute guarantee to parents that any written concern gets a coordinator reply within 24 hours.',
                    cost: 'Free',
                    effort: 'Low Effort',
                    roi: 'Resolves 80% of parent friction before fee dates'
                  }
                ].map((act, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-slate-50/20 transition-all">
                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black shrink-0 text-sm">
                      {act.step}
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-bold text-sm text-gray-900">{act.title}</p>
                        <div className="flex gap-1.5 text-[9px] font-bold">
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{act.cost}</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{act.effort}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed">{act.desc}</p>
                      <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-0.5 rounded">Target ROI: {act.roi}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* DESIRED OUTCOME SIMULATION & STAKEHOLDER MATRIX READJUSTMENT ENGINE */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2.5 py-1 rounded-full font-bold border border-indigo-100 uppercase tracking-wider">
                Adaptive Optimization Engine
              </span>
              <h4 className="font-extrabold text-2xl text-gray-950 mt-2 flex items-center gap-2">
                <Target className="w-6 h-6 text-indigo-600 animate-pulse" />
                Desired Outcome & Stakeholder Readjustment Simulation
              </h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed font-medium">
                Select a school priority outcome to simulate. Disha will calculate the required reverse adjustments in metrics from <strong>all 4 stakeholders</strong> (School Leader, Teaching Staff, Parents, Students) needed to achieve your goal, along with an AI Gap Analysis and Actionable Points.
              </p>
            </div>

            {/* Selector & Target Slider */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100 items-center">
              
              {/* Metric Selector (5 cols) */}
              <div className="md:col-span-5 space-y-2">
                <label className="block text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  Select Desired Outcome Requirement
                </label>
                <select
                  value={simSelectedId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSimSelectedId(val);
                    const baseline = getSimBaselineVal(val);
                    setSimTargetVal(Math.min(100, Math.max(80, baseline + 10)));
                    setSimHasRun(false);
                    setSimCommitted(false);
                  }}
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                >
                  {OUTCOMES.map(o => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Target Score Slider (7 cols) */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-500">
                    CURRENT BASELINE: <span className="text-gray-900 font-extrabold">{getSimBaselineVal(simSelectedId)}%</span>
                  </span>
                  <span className="text-indigo-600">
                    DESIRED TARGET OUTCOME: <span className="text-indigo-700 text-lg font-black">{simTargetVal}%</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={Math.max(70, getSimBaselineVal(simSelectedId) + 1)}
                    max="100"
                    value={simTargetVal}
                    onChange={(e) => {
                      setSimTargetVal(Number(e.target.value));
                      setSimCommitted(false);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSimIsRunning(true);
                        setTimeout(() => {
                          setSimIsRunning(false);
                          setSimHasRun(true);
                        }, 800);
                      }}
                      disabled={simIsRunning}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                    >
                      {simIsRunning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Simulating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          Run Simulator
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Simulation Result Area */}
            {simHasRun && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                
                {/* Stakeholder Triangulation Grid */}
                <div className="border border-indigo-100 rounded-2xl bg-white shadow-sm overflow-hidden">
                  <div className="bg-indigo-900 text-white px-5 py-3.5 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-300" />
                      Stakeholder Adaptive Readjustment Matrix
                    </span>
                    <span className="bg-indigo-800 text-indigo-200 text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase">
                      Feasibility: {simTargetVal >= 95 ? 'Medium (High Effort)' : 'High (Optimal)'}
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {OUTCOMES.find(o => o.id === simSelectedId)?.factors.map((f, fIdx) => {
                      const iconColor = f.stakeholder === 'School Leader' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                        f.stakeholder === 'Teaching Staff' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        f.stakeholder === 'Parents' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        'bg-amber-50 text-amber-600 border-amber-100';
                      return (
                        <div key={fIdx} className="p-4 sm:p-5 hover:bg-slate-50/40 transition-colors">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                            
                            {/* Stakeholder role card */}
                            <div className="lg:col-span-3 flex items-center gap-2.5">
                              <div className={cn("p-2 rounded-xl border shrink-0 font-bold text-xs flex items-center justify-center w-8 h-8", iconColor)}>
                                {f.stakeholder[0]}
                              </div>
                              <div>
                                <p className="font-extrabold text-sm text-gray-900">{f.stakeholder}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Stakeholder Unit</p>
                              </div>
                            </div>

                            {/* Parameter assessment details */}
                            <div className="lg:col-span-4 space-y-1">
                              <span className="bg-gray-100 text-gray-600 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                Assessment Parameter
                              </span>
                              <p className="text-xs font-bold text-gray-800 leading-snug">
                                {f.parameter}
                              </p>
                              <p className="text-[10px] text-indigo-600 font-semibold italic flex items-center gap-1 mt-1">
                                <Info className="w-3 h-3 shrink-0" />
                                Source: {f.techStack}
                              </p>
                            </div>

                            {/* States transformation */}
                            <div className="lg:col-span-5 grid grid-cols-2 gap-3 text-xs bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                              <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Current State</span>
                                <span className="font-semibold text-gray-600 leading-tight block">
                                  {f.currentVal}
                                </span>
                              </div>
                              <div className="border-l border-gray-200/60 pl-3">
                                <span className="text-[10px] text-indigo-500 font-bold uppercase block mb-1">Target Readjustment</span>
                                <span className="font-extrabold text-indigo-700 leading-tight block flex flex-col gap-1">
                                  {f.targetValFn(simTargetVal)}
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] px-1.5 py-0.2 rounded font-black uppercase w-fit">
                                    {f.adjustment}
                                  </span>
                                </span>
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI Gap Analysis & Actionable Points */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Gap Analysis Box (1 col) */}
                  <div className="bg-indigo-950 text-white p-5 rounded-2xl border border-indigo-900 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="bg-indigo-800 text-indigo-200 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-indigo-700">
                        AI Diagnostic Gap Analysis
                      </span>
                      <h5 className="font-bold text-base mt-2">Required Alignment Bridge</h5>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {OUTCOMES.find(o => o.id === simSelectedId)?.gapAnalysis}
                      </p>
                    </div>
                    <div className="text-[10px] text-indigo-300 font-semibold italic border-t border-indigo-900 pt-2.5">
                      Calculated by reverse model with 94.8% confidence matrix.
                    </div>
                  </div>

                  {/* Actionable points (2 cols) */}
                  <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                    <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-emerald-100">
                      Actionable Adjustments Blueprint
                    </span>
                    <h5 className="font-extrabold text-gray-900 text-sm">Adaptive Remedial Procedures</h5>
                    
                    <div className="space-y-3">
                      {OUTCOMES.find(o => o.id === simSelectedId)?.actionPoints.map((ap, apIdx) => (
                        <div key={apIdx} className="flex gap-3 items-start p-3 bg-slate-50/50 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors">
                          <span className="w-5 h-5 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full flex items-center justify-center shrink-0">
                            {ap.step}
                          </span>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-gray-900">{ap.title}</p>
                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{ap.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Commit Target Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={async () => {
                          setSimIsCommitting(true);
                          try {
                            const outcome = OUTCOMES.find(o => o.id === simSelectedId)!;
                            const baseline = getSimBaselineVal(simSelectedId);
                            const newSimDoc = {
                              id: 'sim_' + Date.now(),
                              targetMetric: outcome.label,
                              currentValue: baseline,
                              targetValue: simTargetVal,
                              confidenceTier: simTargetVal >= 95 ? 'B' : 'A',
                              districtPrecedent: 'St. Xavier High School (2024)',
                              requiredChanges: outcome.factors.map(f => ({
                                factor: f.parameter,
                                current: f.currentVal,
                                required: f.targetValFn(simTargetVal),
                                impact: f.stakeholder === 'Teaching Staff' ? 40 : f.stakeholder === 'Students' ? 25 : f.stakeholder === 'Parents' ? 20 : 15
                              }))
                            };
                            const docRef = doc(collection(db, 'simulations'));
                            await setDoc(docRef, newSimDoc);
                            
                            // Trigger alert simulation
                            const newAlert = {
                              id: Date.now(),
                              time: 'Just now',
                              text: `Committed new target: "${outcome.label}" set to ${simTargetVal}%. Baseline monitoring registered. Quiet Watch is active on supporting stakeholder metrics.`,
                              severity: 'high'
                            };
                            setAlerts(prev => [newAlert, ...prev]);
                            
                            setSimCommitted(true);
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setSimIsCommitting(false);
                          }
                        }}
                        disabled={simIsCommitting || simCommitted}
                        className={cn(
                          "text-xs font-extrabold px-5 py-3 rounded-xl transition-all shadow-sm flex items-center gap-1.5",
                          simCommitted 
                            ? "bg-emerald-600 text-white" 
                            : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md"
                        )}
                      >
                        {simIsCommitting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Saving Target & Syncing ERP...
                          </>
                        ) : simCommitted ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Committed & Quiet Watch Active!
                          </>
                        ) : (
                          <>
                            <Sliders className="w-3.5 h-3.5" />
                            Commit Target to Firebase & Monitor
                          </>
                        )}
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            )}
          </div>
        </>
      ) : (
        <DeepDiveAssessment 
          initialDimensions={ewisrDimensions}
          initialAnswers={ewisrAnswers}
        />
      )}

          {/* BACKGROUND MONITORING ACTIVATION PANEL */}
          <div className="bg-emerald-950 text-emerald-50 p-6 rounded-2xl border border-emerald-900 flex flex-col md:flex-row gap-6 justify-between shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <HeartPulse className="w-48 h-48 text-emerald-100" />
            </div>
            
            <div className="space-y-3 relative z-10 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-800 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  Quiet Watch Active
                </span>
                <span className="text-xs font-bold text-emerald-300">Continuous Monitoring Enabled</span>
              </div>
              <h4 className="font-bold text-lg text-white">Disha Quiet Watch is Scanning</h4>
              <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                Disha has gone quiet in the background. We passively check statutory expiration dates, crawl competitor review star trends, and evaluate public social activity. No weekly report spam—we only trigger an alert if a threshold is crossed.
              </p>
            </div>

            {/* Alerts panel log */}
            <div className="relative z-10 bg-slate-900/60 p-4 rounded-xl border border-emerald-900/40 w-full md:max-w-md space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-extrabold text-slate-200 uppercase tracking-wider text-[10px]">Quiet Alert Feed history</span>
                <button 
                  onClick={() => {
                    // simulate trigger a fresh background log
                    const newAlert = {
                      id: Date.now(),
                      time: 'Just now',
                      text: 'Competitor benchmarking check completed. Ryan International posted secondary boarding achievements. Quiet Watch remains standard.',
                      severity: 'healthy'
                    };
                    setAlerts(prev => [newAlert, ...prev]);
                  }}
                  className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold px-2 py-1 rounded transition-colors"
                >
                  Force Live Scan
                </button>
              </div>

              <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                {alerts.map(a => {
                  const labelColor = a.severity === 'high' ? 'text-rose-400 border-rose-900 bg-rose-950/20' : 
                                     a.severity === 'medium' ? 'text-amber-400 border-amber-900 bg-amber-950/20' : 
                                     a.severity === 'low' ? 'text-blue-400 border-blue-900 bg-blue-950/20' : 
                                     'text-emerald-400 border-emerald-900 bg-emerald-950/20';
                  return (
                    <div key={a.id} className="p-2 border border-slate-800 rounded bg-slate-950/30 text-[11px] leading-relaxed font-medium">
                      <div className="flex justify-between items-center mb-1 text-[10px] font-bold">
                        <span className={cn("px-1.5 py-0.2 rounded border uppercase font-black text-[8px]", labelColor)}>
                          {a.severity}
                        </span>
                        <span className="text-gray-500 font-semibold">{a.time}</span>
                      </div>
                      <p className="text-slate-300 font-medium leading-normal">{a.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

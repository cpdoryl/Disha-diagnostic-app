import React, { useState, useEffect } from 'react';
import { 
  Building, Users, Shield, GraduationCap, Trophy, Globe, HeartPulse, Sliders, 
  Upload, Search, FileText, CheckCircle2, AlertTriangle, RefreshCw, Star, 
  Check, ArrowRight, Activity, Cpu, Sparkles, BookOpen, Compass, ChevronRight, Play, Info,
  Download, Send, Lock, Scale, FileSpreadsheet, Eye, HelpCircle, Mail, MessageCircle, Link2, Volume2, Languages, Zap, AlertCircle,
  User, Phone, Building2, MapPin, Award, Layers
} from 'lucide-react';
import { useAppStore } from '../store';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { SchoolDataHub } from './SchoolDataHub';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

// 14 dimensions details
export interface EWISRDimension {
  id: string;
  name: string;
  quadrant: 'Academic' | 'Welfare' | 'Individual' | 'Social';
  description: string;
  baselineScore: number;
  benchmark: number;
  districtBest: number;
  dataLevel: 'Tier A (Hard Verified)' | 'Tier B (Benchmark Calc)' | 'Tier C (Pulse Survey)';
  modelPrecedent: string; // The Ideal School Model reference (Shri Ram, Riverside, Rishi Valley, Podar)
  associatedMetricName: string;
  associatedInputMetricValue: number | string;
  associatedIdealValue: number | string;
  stakeholders: {
    leader: string;
    teacher: string;
    parent: string;
    student: string;
  };
}

const INITIAL_14_DIMENSIONS: EWISRDimension[] = [
  {
    id: 'ew_1',
    name: 'Competence of Faculty',
    quadrant: 'Academic',
    description: 'Faculty qualifications, credentials, ongoing pedagogy retraining, and digital skills audit.',
    baselineScore: 78,
    benchmark: 85,
    districtBest: 88,
    dataLevel: 'Tier C (Pulse Survey)',
    modelPrecedent: 'Rishi Valley School & RIVER retrain program (standardizing pedagogy retrials).',
    associatedMetricName: 'Annual Pedagogy Retraining Hours per Teacher',
    associatedInputMetricValue: 12,
    associatedIdealValue: 24, // >16 hours required
    stakeholders: {
      leader: 'What percentage of your faculty holds advanced or certified teaching degrees?',
      teacher: 'How many structured professional development hours did you complete in the last 12 months?',
      parent: 'Do you feel your child’s teachers are highly knowledgeable and communicate concepts effectively?',
      student: 'Does your teacher clarify hard topics with good examples and support you when you are stuck?'
    }
  },
  {
    id: 'ew_2',
    name: 'Curriculum & Pedagogy',
    quadrant: 'Academic',
    description: 'Adaptive curriculum maps, smart lesson plan trackers, blended learning tools, and digital safety.',
    baselineScore: 82,
    benchmark: 84,
    districtBest: 90,
    dataLevel: 'Tier C (Pulse Survey)',
    modelPrecedent: 'The Riverside School (Ahmedabad) 6 Pillars & Design for Change (FIDS) framework.',
    associatedMetricName: 'Project-Based Learning Units per Grade per Term',
    associatedInputMetricValue: 1,
    associatedIdealValue: 3, // Riverside standard: At least 1-2 pilot units per grade
    stakeholders: {
      leader: 'Is your school curriculum mapped to national standard matrices with active smart classroom integration?',
      teacher: 'Do you follow digital curriculum maps or rely mostly on physical textbooks and independent notes?',
      parent: 'Does the school provide advanced interactive learning materials and homework tools at home?',
      student: 'Do you use tablets, laptops, or smart screens in class for coding, simulation, or interactive tasks?'
    }
  },
  {
    id: 'ew_3',
    name: 'Academic Reputation',
    quadrant: 'Academic',
    description: 'Board exam averages, regional competitive ranking, peer principal perceptions, and local premium positioning.',
    baselineScore: 74,
    benchmark: 82,
    districtBest: 91,
    dataLevel: 'Tier B (Benchmark Calc)',
    modelPrecedent: 'The Riverside School (13 consecutive years in top 10 on national ASSET exam).',
    associatedMetricName: 'Average Board Exam Score Percentile',
    associatedInputMetricValue: 81,
    associatedIdealValue: 92,
    stakeholders: {
      leader: 'What has been the average board examination percentile of the school over the last 3 years?',
      teacher: 'Are remedial cohorts actively tracked to elevate below-average performers before board registrations?',
      parent: 'Is this school considered the absolute top academic institution in your local district?',
      student: 'Do you feel highly prepared for board exams or entrance challenges relative to neighboring students?'
    }
  },
  {
    id: 'ew_4',
    name: 'Quality of Alumni',
    quadrant: 'Academic',
    description: 'Success of previous graduating cohorts, top university admission rates, and active mentorship connections.',
    baselineScore: 71,
    benchmark: 80,
    districtBest: 85,
    dataLevel: 'Tier C (Pulse Survey)',
    modelPrecedent: 'The Shri Ram School ( Delhi) active alumni mentoring & university pipeline registry.',
    associatedMetricName: 'Percent of Alumni in Higher Tier Institutions',
    associatedInputMetricValue: 45,
    associatedIdealValue: 70,
    stakeholders: {
      leader: 'Do you maintain an active registry of alumni tracking their higher education and professional outcomes?',
      teacher: 'Are senior alumni regularly invited back to run student mentorship sessions or share success tips?',
      parent: 'Do you see alumni graduating from this school entering top-tier national or international universities?',
      student: 'Do you know school graduates who inspire you, or have you spoken with alumni mentors?'
    }
  },
  {
    id: 'ew_5',
    name: 'Teacher Welfare & Growth',
    quadrant: 'Welfare',
    description: 'Salary standards relative to regional norms, retention structures, burnout index, and planning hours.',
    baselineScore: 68,
    benchmark: 78,
    districtBest: 82,
    dataLevel: 'Tier C (Pulse Survey)',
    modelPrecedent: 'Rishi Valley & Riverside (Professional development and welfare treats as central output).',
    associatedMetricName: 'Weekly Uninterrupted Lesson Planning Hours',
    associatedInputMetricValue: 4,
    associatedIdealValue: 8, // Shri Ram / Rishi Valley minimum standard: 8 hours
    stakeholders: {
      leader: 'Are teachers allocated at least 8 hours of uninterrupted lesson planning time weekly?',
      teacher: 'Do you feel satisfied with your salary, workload balance, and the school’s response to teacher burnout?',
      parent: 'Do you notice high teacher turnover or mid-year faculty resignations in your child’s classes?',
      student: 'Do your teachers appear energetic, encouraging, and supportive throughout the day?'
    }
  },
  {
    id: 'ew_6',
    name: 'Student Wellbeing Services',
    quadrant: 'Welfare',
    description: 'Licensed counseling resources, nutritional standards, emotional safety nets, and physical fitness health.',
    baselineScore: 84,
    benchmark: 82,
    districtBest: 88,
    dataLevel: 'Tier B (Benchmark Calc)',
    modelPrecedent: 'The Riverside School (Daily student-led Conglom circle-time gathers).',
    associatedMetricName: 'Student Wellbeing Circle-Time Minutes/Week',
    associatedInputMetricValue: 20,
    associatedIdealValue: 60, // Riverside Congloms: 20-30 min short checks regularly
    stakeholders: {
      leader: 'Do you have full-time licensed student counselors and confidential mental health filing systems?',
      teacher: 'Are you trained to spot early signs of emotional stress, cyberbullying, or learning disorders in pupils?',
      parent: 'Does the school provide adequate support for your child’s emotional development and digital hygiene?',
      student: 'If you feel overwhelmed, anxious, or bullied, do you know a trusted advisor at school you can talk to?'
    }
  },
  {
    id: 'ew_7',
    name: 'Campus Infrastructure & Safety',
    quadrant: 'Welfare',
    description: 'State-of-the-art labs, sports fields, fire safety clearances, safe transport tracks, and physical hygiene.',
    baselineScore: 89,
    benchmark: 85,
    districtBest: 92,
    dataLevel: 'Tier B (Benchmark Calc)',
    modelPrecedent: 'Podar Education Network (Centralized safety clearance audits and transport checks).',
    associatedMetricName: 'Safety Audit Compliance Score',
    associatedInputMetricValue: 85,
    associatedIdealValue: 100, // Absolute compliance required
    stakeholders: {
      leader: 'Are all infrastructure safety certificates, CCTV coverage, and emergency plans up to date?',
      teacher: 'Do you feel the classroom infrastructure (airing, lighting, tables) is fully conducive to active learning?',
      parent: 'Are you fully confident in the school’s physical security protocols, campus hygiene, and bus tracking?',
      student: 'Are the school bathrooms, sports equipment, and computer labs always clean, modern, and working?'
    }
  },
  {
    id: 'ew_8',
    name: 'Individualized Attention',
    quadrant: 'Individual',
    description: 'Actual teacher-student ratio, remedial assistance velocity, personalized homework tracks, and student logs.',
    baselineScore: 76,
    benchmark: 80,
    districtBest: 86,
    dataLevel: 'Tier C (Pulse Survey)',
    modelPrecedent: 'The Shri Ram School (Low 11:1 ratio and dedicated Special Needs Department since 1997).',
    associatedMetricName: 'Student-to-Teacher Ratio',
    associatedInputMetricValue: 28, // 1:28
    associatedIdealValue: 11, // 1:11 Ideal standard
    stakeholders: {
      leader: 'What is your average teacher-student ratio in core academic subjects (Math, Science, English)?',
      teacher: 'Do you have assistant teacher support or customized assignments for slower learners in large classes?',
      parent: 'Does your child receive personal feedback and customized homework, or general worksheets?',
      student: 'Do your teachers spend time helping you individually if you did not understand a classroom lesson?'
    }
  },
  {
    id: 'ew_9',
    name: 'Co-curricular & Arts',
    quadrant: 'Individual',
    description: 'Visual arts facilities, musical ensembles, dramatic arts, public speaking clubs, and state-level accolades.',
    baselineScore: 81,
    benchmark: 82,
    districtBest: 85,
    dataLevel: 'Tier C (Pulse Survey)',
    modelPrecedent: 'The Riverside School (Strong aesthetic expression & Design for Change global showcases).',
    associatedMetricName: 'Weekly Hours Allocated to Cultural & Dramatic Arts',
    associatedInputMetricValue: 3,
    associatedIdealValue: 5,
    stakeholders: {
      leader: 'What portion of the weekly schedule is dedicated to structured cultural, artistic, or theatrical instruction?',
      teacher: 'Do we actively support students who represent the school in state or national debates and arts meets?',
      parent: 'Does the school showcase arts galleries, theatrical performances, and public speaking programs annually?',
      student: 'Do you have options to play music, paint, or act in plays, and are there actual clubs you enjoy?'
    }
  },
  {
    id: 'ew_10',
    name: 'Sports & Physical Education',
    quadrant: 'Individual',
    description: 'Professional coaches, diverse athletic offerings, dedicated turf fields, and national sports rankings.',
    baselineScore: 75,
    benchmark: 82,
    districtBest: 88,
    dataLevel: 'Tier C (Pulse Survey)',
    modelPrecedent: 'The Shri Ram School (Diverse athletic disciplines and certified coaching modules).',
    associatedMetricName: 'Certified Sports Coaches on Campus',
    associatedInputMetricValue: 2,
    associatedIdealValue: 5,
    stakeholders: {
      leader: 'Are your physical education coaches certified, and what sports grounds (turfs, courts) are available?',
      teacher: 'Do you track student physical stamina metrics, body mass indices, and athletic achievement records?',
      parent: 'Are you satisfied with the quality of sports coaching, playground safety, and competitive matches?',
      student: 'Do you play real sports on a clean field, and are there sports teams you can try out for?'
    }
  },
  {
    id: 'ew_11',
    name: 'Community Service & CSR',
    quadrant: 'Social',
    description: 'Student-led community campaigns, neighborhood support drives, environmental audits, and local impact logs.',
    baselineScore: 70,
    benchmark: 75,
    districtBest: 80,
    dataLevel: 'Tier C (Pulse Survey)',
    modelPrecedent: 'Rishi Valley School rural environment and neighborhood health campaigns.',
    associatedMetricName: 'Mandatory Student Volunteering Hours/Year',
    associatedInputMetricValue: 10,
    associatedIdealValue: 30,
    stakeholders: {
      leader: 'Is community service mandatory for high school graduation, and do you track student volunteer hours?',
      teacher: 'Do we lead field trips to local community support shelters or environmental remediation zones?',
      parent: 'Does your child discuss active social causes, recycling campaigns, or local community projects?',
      student: 'Have you participated in any cleanup drive, teaching project, or charity drive organized by the school?'
    }
  },
  {
    id: 'ew_12',
    name: 'Parental Involvement',
    quadrant: 'Social',
    description: 'PTA meeting attendance, transparent WhatsApp response times, fee policy disclosures, and digital updates.',
    baselineScore: 66,
    benchmark: 78,
    districtBest: 88,
    dataLevel: 'Tier C (Pulse Survey)',
    modelPrecedent: 'The Riverside School (Parent Partnership as one of 6 core pillars).',
    associatedMetricName: 'Parent Query Response Resolution Hours',
    associatedInputMetricValue: 34, // 34 hours response lag
    associatedIdealValue: 12, // Under 12 hours ideal
    stakeholders: {
      leader: 'Do you hold monthly collaborative parent-teacher assemblies with active parent representative voting?',
      teacher: 'Do you update parents weekly on student performance metrics or only send bad grades on report days?',
      parent: 'Do you feel your voice is genuinely heard by the school administration, or is communication mostly one-way?',
      student: 'Do your parents and teachers seem to work together closely, and do they discuss your school progress?'
    }
  },
  {
    id: 'ew_13',
    name: 'Leadership & Vision',
    quadrant: 'Social',
    description: 'Strategic 5-year vision compliance, administrative audits, transparent communication, and board governance scores.',
    baselineScore: 85,
    benchmark: 84,
    districtBest: 89,
    dataLevel: 'Tier B (Benchmark Calc)',
    modelPrecedent: 'Podar Education Network academic auditing sequence (proving standards before expansion).',
    associatedMetricName: 'Frequency of Central Academic Operations Audits/Year',
    associatedInputMetricValue: 1,
    associatedIdealValue: 2,
    stakeholders: {
      leader: 'Do you conduct independent academic and operational audits annually to refine your strategic vision plan?',
      teacher: 'Do the school leaders maintain a transparent, supportive culture where you feel safe voicing criticism?',
      parent: 'Do you trust the principal’s vision, administrative leadership, and ethical standards of the school?',
      student: 'Do you know the principal, and do you feel the school is managed with clear, fair, and high standards?'
    }
  },
  {
    id: 'ew_14',
    name: 'Value for Money',
    quadrant: 'Social',
    description: 'Tuition fees compared to the quality of facilities, faculty experience, student outcomes, and regional norms.',
    baselineScore: 78,
    benchmark: 80,
    districtBest: 84,
    dataLevel: 'Tier C (Pulse Survey)',
    modelPrecedent: 'Podar Smarter School (Jaipur) budget reinvestment into technology and salaries.',
    associatedMetricName: 'Percent of Budget Reinvested in Tech & Welfare',
    associatedInputMetricValue: 25,
    associatedIdealValue: 40,
    stakeholders: {
      leader: 'How much of your annual budget is reinvested directly into classroom technology, faculty bonuses, and facilities?',
      teacher: 'Do feel the school’s pricing structure matches the premium resources, laboratories, and salaries provided?',
      parent: 'Considering the safety, faculty, and future of your child, do you feel the tuition fee is a fair investment?',
      student: 'Do you feel the textbooks, computer equipment, and playgrounds you use are worth the resources invested?'
    }
  }
];

export const SURVEY_QUESTIONS = {
  leader: {
    title: "School Leaders Strategic Survey",
    desc: "Comprehensive diagnostic verification of leadership, pedagogy audits, NEP 2020 alignment, and CBSE SQAAF structural compliance.",
    questions: [
      // Part I: Governance, Leadership & Vision
      {
        id: "ew_13_leader_q1",
        id_actual: "ew_13",
        section: "Part I: Governance, Leadership & Vision",
        label: "Q1.1: Strategic Audits & Vision Roadmap",
        text: "How frequently does school leadership conduct central academic/operational audits and review the 5-year strategic growth map?",
        options: [
          { val: 1, label: "Level 1: No structured strategic plan or formal operational audits conducted" },
          { val: 2, label: "Level 2: Annual informal review with limited operational data tracking" },
          { val: 3, label: "Level 3: Biannual formal audits with active operational logging" },
          { val: 4, label: "Level 4: Comprehensive quarterly audits with data-driven KPI dashboards" },
          { val: 5, label: "Level 5: Monthly automated audits mapped to CBSE SQAAF & EWISR national benchmarks" }
        ]
      },
      {
        id: "ew_13_leader_q2",
        id_actual: "ew_13",
        section: "Part I: Governance, Leadership & Vision",
        label: "Q1.2: CBSE SQAAF & DPDP Data Privacy Compliance",
        text: "What is the status of the school's structural compliance with CBSE SQAAF standards and the DPDP (Digital Personal Data Protection) Act 2023?",
        options: [
          { val: 1, label: "Level 1: Minimal awareness / non-compliant with standard DPDP policies" },
          { val: 2, label: "Level 2: Partial compliance with manual paperwork and basic policy postings" },
          { val: 3, label: "Level 3: Substantial compliance with dedicated safety & data privacy officers" },
          { val: 4, label: "Level 4: Full compliance with digital audit trails and annual verification" },
          { val: 5, label: "Level 5: Exemplary DPDP-certified digital infrastructure with 100% automated regulatory readiness" }
        ]
      },
      // Part II: Faculty Competence, Teacher Welfare & NEP 2020 CPD
      {
        id: "ew_1_leader_q1",
        id_actual: "ew_1",
        section: "Part II: Faculty Competence, Teacher Welfare & NEP 2020 CPD",
        label: "Q2.1: Faculty Credentials & Clinical Pedagogy",
        text: "What proportion of core faculty members hold advanced domain degrees (Post-Graduate/B.Ed/CTET) and undergo regular lesson evaluations?",
        options: [
          { val: 1, label: "Level 1: Under 50% certified; no structured classroom lesson observations" },
          { val: 2, label: "Level 2: 50%–70% certified; occasional informal lesson reviews" },
          { val: 3, label: "Level 3: 70%–85% certified; scheduled annual lesson observation cycles" },
          { val: 4, label: "Level 4: 85%–95% certified; quarterly structured feedback & master teacher mentoring" },
          { val: 5, label: "Level 5: Over 95% certified with monthly clinical pedagogy audits" }
        ]
      },
      {
        id: "ew_1_leader_q2",
        id_actual: "ew_1",
        section: "Part II: Faculty Competence, Teacher Welfare & NEP 2020 CPD",
        label: "Q2.2: NEP 2020 Mandatory 50 Hours CPD Compliance",
        text: "How effectively does the school track and enforce NEP 2020's mandate of 50 hours of annual Continuous Professional Development (CPD) per teacher?",
        options: [
          { val: 1, label: "Level 1: Less than 10 hours logged annually per teacher; no central tracking" },
          { val: 2, label: "Level 2: 10–25 hours logged; sporadic workshop attendance" },
          { val: 3, label: "Level 3: 25–40 hours logged; tracked manually by academic coordinators" },
          { val: 4, label: "Level 4: 40–50 hours logged; mandatory Podar Innovation Lab / CBSE certified modules" },
          { val: 5, label: "Level 5: 50+ hours fully verified & logged digitally with peer demonstration requirements" }
        ]
      },
      {
        id: "ew_2_leader_q1",
        id_actual: "ew_5",
        section: "Part II: Faculty Competence, Teacher Welfare & NEP 2020 CPD",
        label: "Q2.3: Compensation, Burnout Index & Planning Allocation",
        text: "How does the institution manage teacher compensation, weekly lesson planning time, and burnout prevention?",
        options: [
          { val: 1, label: "Level 1: High workload (>35 teaching periods/week), below-market pay, zero planning hours" },
          { val: 2, label: "Level 2: Average workload, standard pay scale, <3 hours weekly planning time" },
          { val: 3, label: "Level 3: Managed workload (25–30 periods), competitive pay, 4–6 planning hours weekly" },
          { val: 4, label: "Level 4: Balanced workload (<25 periods), above-market pay & benefits, 6–8 planning hours" },
          { val: 5, label: "Level 5: Industry-leading compensation, dedicated wellness programs, >8 uninterrupted planning hours" }
        ]
      },
      // Part III: Academic Rigor, Curriculum & Competency-Based Pedagogy
      {
        id: "ew_3_leader_q1",
        id_actual: "ew_3",
        section: "Part III: Academic Rigor, Curriculum & Competency-Based Pedagogy",
        label: "Q3.1: Board Exam Outcomes & Academic Percentile",
        text: "What is the 3-year average academic performance and board examination percentile across senior cohorts relative to regional benchmarks?",
        options: [
          { val: 1, label: "Level 1: Below regional average (<65% average score); high variation across classes" },
          { val: 2, label: "Level 2: Regional average (65%–75% average score); standard board results" },
          { val: 3, label: "Level 3: Above regional average (75%–85% score); strong subject pass rates" },
          { val: 4, label: "Level 4: High performing (85%–90% score); top 10% position in district" },
          { val: 5, label: "Level 5: Nationally benchmarked (>90% score percentile); top-tier distinction & competitive ranks" }
        ]
      },
      {
        id: "ew_2_leader_q2",
        id_actual: "ew_2",
        section: "Part III: Academic Rigor, Curriculum & Competency-Based Pedagogy",
        label: "Q3.2: NEP 2020 Competency-Based & Experiential Pedagogy",
        text: "To what degree are competency-based assessments, project-based learning (PBL), and smart classroom tools integrated into daily lesson plans?",
        options: [
          { val: 1, label: "Level 1: Purely textbook-driven rote learning; no digital classroom tools" },
          { val: 2, label: "Level 2: Basic textbook reliance with occasional smart-board displays" },
          { val: 3, label: "Level 3: Structured syllabus mapping with 1 PBL unit per term per grade" },
          { val: 4, label: "Level 4: Blended learning modules with 2–3 PBL units & digital interactive tools" },
          { val: 5, label: "Level 5: Full NEP 2020 alignment with active experiential learning, robotics/STEM integration, and digital maps" }
        ]
      },
      {
        id: "ew_4_leader_q1",
        id_actual: "ew_4",
        section: "Part III: Academic Rigor, Curriculum & Competency-Based Pedagogy",
        label: "Q3.3: Quality of Alumni & Graduate Career Placement",
        text: "How systematically does the school track graduating cohorts, alumni higher education admissions, and alumni mentorship programs?",
        options: [
          { val: 1, label: "Level 1: No alumni network or placement tracking" },
          { val: 2, label: "Level 2: Informal contact with select alumni; no central database" },
          { val: 3, label: "Level 3: Active alumni directory tracking tier-1 university admissions" },
          { val: 4, label: "Level 4: Structured annual alumni mentorship sessions & university counseling pipelines" },
          { val: 5, label: "Level 5: Comprehensive digital alumni portal with active career mentorship, scholarship endowment, and global networking" }
        ]
      },
      // Part IV: Individual Attention, Inclusivity & Student Retention
      {
        id: "ew_8_leader_q1",
        id_actual: "ew_8",
        section: "Part IV: Individual Attention, Inclusivity & Student Retention",
        label: "Q4.1: Pupil-Teacher Ratio & Differentiated Instruction",
        text: "What is the average Pupil-Teacher Ratio (PTR) in core academic classes, and how are slower learners supported?",
        options: [
          { val: 1, label: "Level 1: PTR > 35:1; uniform pace with no individual differentiation" },
          { val: 2, label: "Level 2: PTR 30–35:1; occasional after-school doubt sessions" },
          { val: 3, label: "Level 3: PTR 25–30:1; structured remedial groups for bottom 15% cohort" },
          { val: 4, label: "Level 4: PTR 20–25:1; dedicated assistant teachers & personalized homework tracks" },
          { val: 5, label: "Level 5: Elite PTR < 18:1; fully customized learning paths & 1-on-1 academic coaching" }
        ]
      },
      {
        id: "ew_6_leader_q1",
        id_actual: "ew_6",
        section: "Part IV: Individual Attention, Inclusivity & Student Retention",
        label: "Q4.2: Student Wellbeing, Counseling & Mental Health",
        text: "What licensed counseling resources, emotional wellbeing circle-time minutes, and confidential support systems exist for students?",
        options: [
          { val: 1, label: "Level 1: No licensed counselor or mental health filing system" },
          { val: 2, label: "Level 2: Part-time counselor with basic ad-hoc student meetings" },
          { val: 3, label: "Level 3: Full-time counselor with weekly circle-time support modules" },
          { val: 4, label: "Level 4: Dedicated psychological center, peer support groups, and annual mental health screening" },
          { val: 5, label: "Level 5: Clinical wellbeing framework, daily Conglom check-ins (Riverside model), and 24/7 helpline" }
        ]
      },
      {
        id: "ew_5_leader_q1",
        id_actual: "ew_8",
        section: "Part IV: Individual Attention, Inclusivity & Student Retention",
        label: "Q4.3: Early Warning Dropout & Attendance SLA",
        text: "How quickly does the school identify and intervene for students showing chronic absenteeism (>3 days unexcused) or retention risks?",
        options: [
          { val: 1, label: "Level 1: Reactive tracking; dropouts or attendance issues noticed only at term end" },
          { val: 2, label: "Level 2: Manual weekly registers; phone call follow-ups after 5+ absent days" },
          { val: 3, label: "Level 3: Digital attendance logs; automated alert sent after 3 consecutive absences" },
          { val: 4, label: "Level 4: Proactive SLA tracking; counselor call & home-visit protocol within 48 hours" },
          { val: 5, label: "Level 5: AI-driven early-warning retention system flagging academic, financial, and attendance risk scores in real-time" }
        ]
      },
      // Part V: Stakeholder SLA, Parent Engagement & Financial Transparency
      {
        id: "ew_12_leader_q1",
        id_actual: "ew_12",
        section: "Part V: Stakeholder SLA, Parent Engagement & Financial Transparency",
        label: "Q5.1: Parent Inquiry SLA & Ticket Resolution",
        text: "What is the average turnaround time for resolving parent inquiries, app tickets, and administrative grievances?",
        options: [
          { val: 1, label: "Level 1: > 48 hours response lag; unorganized WhatsApp groups or physical notes" },
          { val: 2, label: "Level 2: 24–48 hours turnaround; basic helpdesk ticketing" },
          { val: 3, label: "Level 3: 12–24 hours turnaround; structured Parent App with ticket tracking" },
          { val: 4, label: "Level 4: 4–12 hours resolution time; dedicated parent relationship manager" },
          { val: 5, label: "Level 5: Strict < 4 hours SLA resolution with real-time escalation matrix and monthly satisfaction auditing" }
        ]
      },
      {
        id: "ew_14_leader_q1",
        id_actual: "ew_14",
        section: "Part V: Stakeholder SLA, Parent Engagement & Financial Transparency",
        label: "Q5.2: Value for Money & Fee Capital Reinvestment",
        text: "What percentage of annual fee revenue is directly reinvested into classroom technology, faculty bonuses, campus facilities, and lab infrastructure?",
        options: [
          { val: 1, label: "Level 1: < 15% reinvested; aging equipment and fee-facility mismatch" },
          { val: 2, label: "Level 2: 15%–25% reinvested; routine maintenance and minimal tech updates" },
          { val: 3, label: "Level 3: 25%–35% reinvested; ongoing lab upgrades and fair teacher compensation" },
          { val: 4, label: "Level 4: 35%–45% reinvested; state-of-the-art tech adoption and competitive salaries" },
          { val: 5, label: "Level 5: Over 45% reinvested; premium infrastructure, zero hidden costs, and exceptional return on parent investment" }
        ]
      },
      // Part VI: Campus Infrastructure, Safety & Physical Facilities
      {
        id: "ew_7_leader_q1",
        id_actual: "ew_7",
        section: "Part VI: Campus Infrastructure, Safety & Physical Facilities",
        label: "Q6.1: Campus Safety, CCTV & Emergency Fire Clearances",
        text: "Are all physical safety certificates (Fire Safety, Structural Stability, Transport GPS, CCTV) up to date with zero compliance lapses?",
        options: [
          { val: 1, label: "Level 1: Expired safety certificates or significant CCTV coverage blind spots" },
          { val: 2, label: "Level 2: Valid safety clearances with manual security registers" },
          { val: 3, label: "Level 3: Annual fire safety drills, complete perimeter CCTV, and basic bus tracking" },
          { val: 4, label: "Level 4: Quarterly safety audits, full HD CCTV, and parent live bus GPS tracking" },
          { val: 5, label: "Level 5: Centralized Podar network clearance, automated emergency response, biometric gates, and 100% zero-blindspot campus" }
        ]
      },
      {
        id: "ew_10_leader_q1",
        id_actual: "ew_7",
        section: "Part VI: Campus Infrastructure, Safety & Physical Facilities",
        label: "Q6.2: Modern Laboratories, STEM & Campus Hygiene",
        text: "How would you rate the state of science laboratories, computer infrastructure, robotics hubs, and sanitation hygiene?",
        options: [
          { val: 1, label: "Level 1: Outdated labs, broken equipment, or poor toilet sanitation hygiene" },
          { val: 2, label: "Level 2: Basic functional science/computer labs and standard hygiene" },
          { val: 3, label: "Level 3: Well-equipped labs, dedicated computer centers, and clean facilities" },
          { val: 4, label: "Level 4: Advanced STEM labs, interactive smart classrooms, and sanitized amenities" },
          { val: 5, label: "Level 5: World-class robotics hub, high-speed fiber internet, green energy campus, and pristine hygiene" }
        ]
      },
      // Part VII: Holistic Development, Sports, Community & Global Exposure
      {
        id: "ew_9_leader_q1",
        id_actual: "ew_9",
        section: "Part VII: Holistic Development, Sports & Global Exposure",
        label: "Q7.1: Co-Curricular Arts, Performing Ensembles & Debates",
        text: "How much weekly schedule time is allocated to structured arts, dramatic performances, music ensembles, and debate/MUN clubs?",
        options: [
          { val: 1, label: "Level 1: Less than 1 period/week; minimal non-academic activity" },
          { val: 2, label: "Level 2: 1–2 periods/week; basic annual cultural day event" },
          { val: 3, label: "Level 3: 3–4 periods/week; active clubs and regional competition entries" },
          { val: 4, label: "Level 4: 4–5 periods/week; professional art/music instructors and state-level accolades" },
          { val: 5, label: "Level 5: > 5 periods/week; dedicated theater/arts studio, national/international showcase entries, and student-led publications" }
        ]
      },
      {
        id: "ew_10_leader_q2",
        id_actual: "ew_10",
        section: "Part VII: Holistic Development, Sports & Global Exposure",
        label: "Q7.2: Sports Infrastructure, PE Coaches & Fitness Metrics",
        text: "What is the quality of sports grounds, certified coaching faculty, and physical stamina/health monitoring?",
        options: [
          { val: 1, label: "Level 1: Limited play area; uncertified staff; no structured physical education curriculum" },
          { val: 2, label: "Level 2: Standard multi-purpose playground; basic sports equipment and general PE teacher" },
          { val: 3, label: "Level 3: Dedicated sports turfs/courts; specialized coaches for 2+ major sports" },
          { val: 4, label: "Level 4: Multi-sport complex (swimming/turf/indoor court); certified coaches and annual athletic tracking" },
          { val: 5, label: "Level 5: Olympic-standard sports facilities, sports science/BMI tracking, national tournament representation, and elite academy partnerships" }
        ]
      },
      {
        id: "ew_11_leader_q1",
        id_actual: "ew_11",
        section: "Part VII: Holistic Development, Sports & Global Exposure",
        label: "Q7.3: Mandatory Community Service & Environmental CSR",
        text: "Is community service mandatory for graduation, and how actively do students lead local neighborhood impact projects?",
        options: [
          { val: 1, label: "Level 1: No community service programs or environmental drives" },
          { val: 2, label: "Level 2: Occasional annual donation drives or cleanup days" },
          { val: 3, label: "Level 3: Structured community service hours required (10–20 hours/year)" },
          { val: 4, label: "Level 4: Student-led environmental/social campaigns with active local NGO partnerships" },
          { val: 5, label: "Level 5: Deeply embedded community impact curriculum (>30 hours/year), solar/zero-waste campus, and recognized social innovation projects" }
        ]
      },
      {
        id: "ew_11_leader_q2",
        id_actual: "ew_11",
        section: "Part VII: Holistic Development, Sports & Global Exposure",
        label: "Q7.4: Internationalism & Global Curriculum Integration",
        text: "How does the school expose students to global cultures, international exchange initiatives, and global curriculum perspectives?",
        options: [
          { val: 1, label: "Level 1: No international exposure, global partner ties, or MUN programs" },
          { val: 2, label: "Level 2: Occasional international day celebrations or foreign language electives" },
          { val: 3, label: "Level 3: Active Model UN participation and global current affairs workshops" },
          { val: 4, label: "Level 4: Virtual student exchange programs and partner school collaborations abroad" },
          { val: 5, label: "Level 5: Comprehensive global immersion, physical student/faculty exchanges, international curriculum certification options, and global civic projects" }
        ]
      }
    ]
  },
  teacher: {
    title: "Teacher Assessment & Workplace Audit",
    desc: "In-depth diagnostic of instructional support, CPD retraining, workload balance, inclusion, safety, and leadership trust.",
    questions: [
      // Part I: Professional Pedagogy & Continuous Growth
      {
        id: "ew_1_teacher_q1",
        id_actual: "ew_1",
        section: "Part I: Professional Pedagogy & Continuous Growth",
        label: "Q1.1: Annual CPD & Training Hours",
        text: "How many structured Continuous Professional Development (CPD) and pedagogy training hours did you complete in the last 12 months?",
        options: [
          { val: 1, label: "Level 1: Under 10 hours of training; minimal access to professional learning modules" },
          { val: 2, label: "Level 2: 10–25 hours; basic compliance workshops with limited practical follow-up" },
          { val: 3, label: "Level 3: 25–40 hours; structured annual workshops and domain training" },
          { val: 4, label: "Level 4: 40–50 hours; mandatory CBSE/NCERT certified skill modules" },
          { val: 5, label: "Level 5: Over 50 hours fully verified; active peer mentorship & demonstration teaching" }
        ]
      },
      {
        id: "ew_2_teacher_q1",
        id_actual: "ew_2",
        section: "Part I: Professional Pedagogy & Continuous Growth",
        label: "Q1.2: Blended Curriculum Tools & Project-Based Pedagogy",
        text: "How frequently do you utilize digital smart boards, blended lesson plans, and Project-Based Learning (PBL) units in daily classes?",
        options: [
          { val: 1, label: "Level 1: Purely textbook-based rote instruction; zero digital or PBL tools available" },
          { val: 2, label: "Level 2: Occasional smart board usage; physical textbook remains primary focus" },
          { val: 3, label: "Level 3: Structured digital lesson plans; at least 1 PBL unit integrated per term" },
          { val: 4, label: "Level 4: Blended learning modules with interactive digital labs & 2–3 PBL units per grade" },
          { val: 5, label: "Level 5: Full NEP 2020 experiential learning with digital maps, simulations & interdisciplinary projects" }
        ]
      },
      // Part II: Faculty Welfare, Workload Balance & Compensation
      {
        id: "ew_5_teacher_q1",
        id_actual: "ew_5",
        section: "Part II: Faculty Welfare, Workload Balance & Compensation",
        label: "Q2.1: Weekly Lesson Planning Allocation & Workload",
        text: "How many uninterrupted hours per week are allocated in your timetable for lesson planning, grading, and curriculum mapping?",
        options: [
          { val: 1, label: "Level 1: Zero dedicated planning hours (<1 hr); heavy non-teaching admin chores (>35 teaching periods)" },
          { val: 2, label: "Level 2: 1–3 planning hours/week; frequent substitution duties and manual registers" },
          { val: 3, label: "Level 3: 4–6 planning hours/week; manageable class schedule (28–30 periods)" },
          { val: 4, label: "Level 4: 6–8 planning hours/week; automated attendance logging & minimal clerical overhead" },
          { val: 5, label: "Level 5: > 8 uninterrupted planning hours/week; dedicated departmental workspace & assistant support" }
        ]
      },
      {
        id: "ew_5_teacher_q2",
        id_actual: "ew_5",
        section: "Part II: Faculty Welfare, Workload Balance & Compensation",
        label: "Q2.2: Compensation Equity & Burnout Prevention",
        text: "How satisfied are you with your salary package, medical benefits, performance bonuses, and burnout support from management?",
        options: [
          { val: 1, label: "Level 1: Dissatisfied; below-market scale, zero health benefits, high burnout stress" },
          { val: 2, label: "Level 2: Somewhat satisfied; standard pay scale with basic leaves and high workload" },
          { val: 3, label: "Level 3: Satisfied; competitive regional salary, standard health cover, annual increments" },
          { val: 4, label: "Level 4: Very satisfied; 7th CPC aligned pay, medical insurance, wellness allowances" },
          { val: 5, label: "Level 5: Highly satisfied; top 10% regional pay scale, performance bonuses & wellness programs" }
        ]
      },
      // Part III: Academic Rigor, Remedial Tracking & Inclusion
      {
        id: "ew_3_teacher_q1",
        id_actual: "ew_3",
        section: "Part III: Academic Rigor, Remedial Tracking & Inclusion",
        label: "Q3.1: Academic Rigor & Board Exam Preparedness",
        text: "How effectively does the school support faculty in tracking student learning gaps and preparing cohorts for board exams?",
        options: [
          { val: 1, label: "Level 1: No systematic tracking of learning gaps; syllabus coverage is rushed" },
          { val: 2, label: "Level 2: Informal test reviews; mock exams conducted right before final boards" },
          { val: 3, label: "Level 3: Termly academic performance audits; structured doubt-clearing sessions" },
          { val: 4, label: "Level 4: Bi-weekly diagnostic gap analysis with targeted remedial workbooks" },
          { val: 5, label: "Level 5: Real-time analytics tracking student mastery percentiles with customized board revision strategies" }
        ]
      },
      {
        id: "ew_8_teacher_q1",
        id_actual: "ew_8",
        section: "Part III: Academic Rigor, Remedial Tracking & Inclusion",
        label: "Q3.2: Pupil-Teacher Ratio & Differentiated Instruction Support",
        text: "Does class size permit individual attention, and do you receive assistant teacher support for diverse learning paces?",
        options: [
          { val: 1, label: "Level 1: Overcrowded classrooms (>40 students); impossible to offer individual feedback" },
          { val: 2, label: "Level 2: Class size 35–40 students; generic single-pace instruction for all" },
          { val: 3, label: "Level 3: Class size 28–35 students; occasional small-group remedial focus" },
          { val: 4, label: "Level 4: Class size 20–28 students; dedicated co-teachers for primary/remedial groups" },
          { val: 5, label: "Level 5: Optimal class size (<20 students); individual learning plans (IEPs) & assistant support" }
        ]
      },
      // Part IV: Well-being, Safety & Special Needs Inclusion
      {
        id: "ew_6_teacher_q1",
        id_actual: "ew_6",
        section: "Part IV: Well-being, Safety & Special Needs Inclusion",
        label: "Q4.1: Mental Health, Counseling & Circle Time Integration",
        text: "How well-equipped are you and the school to handle student emotional distress, behavioral issues, or cyberbullying?",
        options: [
          { val: 1, label: "Level 1: No counselor on staff; teachers receive no training on student mental health" },
          { val: 2, label: "Level 2: Part-time counselor; informal handling of discipline or emotional issues" },
          { val: 3, label: "Level 3: Full-time licensed counselor; regular referral mechanisms and class check-ins" },
          { val: 4, label: "Level 4: Structured weekly Circle-Time/Conglom sessions & trained faculty advocates" },
          { val: 5, label: "Level 5: Comprehensive mental health protocol with daily emotional check-ins & 24/7 student support" }
        ]
      },
      {
        id: "ew_8_teacher_q2",
        id_actual: "ew_8",
        section: "Part IV: Well-being, Safety & Special Needs Inclusion",
        label: "Q4.2: SEN Inclusion & Special Education Department Support",
        text: "What level of specialized support exists for students with Special Educational Needs (SEN) or learning disabilities in your class?",
        options: [
          { val: 1, label: "Level 1: Zero SEN support or specialized accommodations provided" },
          { val: 2, label: "Level 2: Basic accommodation on exams; no dedicated special educators on campus" },
          { val: 3, label: "Level 3: Dedicated SEN department; periodic consultations with special educators" },
          { val: 4, label: "Level 4: Co-teaching with special educators and tailored IEP (Individualized Education Program) tracks" },
          { val: 5, label: "Level 5: Full inclusive education framework with resource rooms, assistive technologies, and specialized faculty" }
        ]
      },
      // Part V: Campus Infrastructure, Safety & Technology
      {
        id: "ew_7_teacher_q1",
        id_actual: "ew_7",
        section: "Part V: Campus Infrastructure, Safety & Technology",
        label: "Q5.1: Classroom Ergonomics, Digital Hardware & Labs",
        text: "How would you rate the quality of classroom furniture, lighting, smart hardware, and laboratory equipment provided for your subjects?",
        options: [
          { val: 1, label: "Level 1: Outdated, damaged furniture; non-functional projectors/labs" },
          { val: 2, label: "Level 2: Basic functional classrooms; shared computer labs with limited internet" },
          { val: 3, label: "Level 3: Well-lit classrooms, working AV equipment, and standard science labs" },
          { val: 4, label: "Level 4: High-speed fiber Wi-Fi, modern interactive smart boards, and advanced science/robotics labs" },
          { val: 5, label: "Level 5: World-class ergonomic furniture, 1:1 digital devices, green energy campus, and state-of-the-art labs" }
        ]
      },
      // Part VI: Leadership Vision, Governance & Stakeholder SLA
      {
        id: "ew_13_teacher_q1",
        id_actual: "ew_13",
        section: "Part VI: Leadership Vision, Governance & Stakeholder SLA",
        label: "Q6.1: Open-Door Leadership Culture & Academic Autonomy",
        text: "Does school leadership maintain an open, transparent culture where teachers can express concerns without fear of reprisal?",
        options: [
          { val: 1, label: "Level 1: Authoritarian leadership; faculty feedback is ignored or penalized" },
          { val: 2, label: "Level 2: Formal top-down hierarchy; limited opportunity for teachers to suggest changes" },
          { val: 3, label: "Level 3: Regular staff meetings where concerns are logged and discussed" },
          { val: 4, label: "Level 4: Transparent leadership team with open-door policies and constructive peer feedback" },
          { val: 5, label: "Level 5: Collaborative academic council where faculty actively participate in strategic school policy decisions" }
        ]
      },
      {
        id: "ew_12_teacher_q1",
        id_actual: "ew_12",
        section: "Part VI: Leadership Vision, Governance & Stakeholder SLA",
        label: "Q6.2: Parent Partnership & Communication Responsiveness",
        text: "How structured and manageable is parent-teacher communication through official app channels?",
        options: [
          { val: 1, label: "Level 1: Chaotic WhatsApp groups with after-hours messages & unmanaged parent expectations" },
          { val: 2, label: "Level 2: Physical student diaries; occasional PTMs with long waiting times" },
          { val: 3, label: "Level 3: Official Parent App for messaging during defined school hours" },
          { val: 4, label: "Level 4: Structured ticketing helpdesk with 24-hour response SLAs & quarterly PTM reviews" },
          { val: 5, label: "Level 5: Seamless Parent Portal with real-time progress sharing, scheduled appointments, and high mutual trust" }
        ]
      },
      // Part VII: Co-Curriculars, Sports, CSR & Value
      {
        id: "ew_9_teacher_q1",
        id_actual: "ew_9",
        section: "Part VII: Co-Curriculars, Sports, CSR & Value",
        label: "Q7.1: Co-Curricular Arts & Drama Integration",
        text: "How actively are visual arts, performing ensembles, drama, and public speaking integrated into school life?",
        options: [
          { val: 1, label: "Level 1: Co-curriculars are treated as filler periods and frequently cancelled for test prep" },
          { val: 2, label: "Level 2: Basic annual day performance; limited weekly club choices" },
          { val: 3, label: "Level 3: Structured weekly art/music/drama periods with annual school showcases" },
          { val: 4, label: "Level 4: Specialized instructors, active debate clubs, and state-level competition entries" },
          { val: 5, label: "Level 5: Dedicated performing arts academy, national MUN accolades, and student-produced publications" }
        ]
      },
      {
        id: "ew_10_teacher_q1",
        id_actual: "ew_10",
        section: "Part VII: Co-Curriculars, Sports, CSR & Value",
        label: "Q7.2: Physical Education & Sports Integration",
        text: "Does the school provide dedicated PE time, certified coaches, and physical fitness tracking for students?",
        options: [
          { val: 1, label: "Level 1: Irregular sports periods; no certified physical education coaches" },
          { val: 2, label: "Level 2: Standard playground time; basic sports equipment for recess" },
          { val: 3, label: "Level 3: Structured weekly PE timetable with dedicated coaches for core sports" },
          { val: 4, label: "Level 4: Multi-sport facilities, health/BMI tracking, and district tournament entries" },
          { val: 5, label: "Level 5: Professional sports academy partnerships, floodlit turfs, and national athletic achievements" }
        ]
      },
      {
        id: "ew_11_teacher_q1",
        id_actual: "ew_11",
        section: "Part VII: Co-Curriculars, Sports, CSR & Value",
        label: "Q7.3: Community Service & Environmental CSR Engagement",
        text: "To what extent do students engage in community service projects, recycling drives, or social outreach programs?",
        options: [
          { val: 1, label: "Level 1: No community service or social outreach initiatives" },
          { val: 2, label: "Level 2: Occasional annual donation drive or festive charity collection" },
          { val: 3, label: "Level 3: Scheduled community service projects (10–20 hours/year requirement)" },
          { val: 4, label: "Level 4: Active environmental campaigns, zero-waste campus drives, and local NGO ties" },
          { val: 5, label: "Level 5: Student-led social innovation enterprises, village adoption programs, and recognized community impact" }
        ]
      },
      {
        id: "ew_4_teacher_q1",
        id_actual: "ew_4",
        section: "Part VII: Co-Curriculars, Sports, CSR & Value",
        label: "Q7.4: Alumni Guidance & Career Pipeline Involvement",
        text: "How actively do teachers collaborate with alumni networks to guide graduating cohorts on higher education?",
        options: [
          { val: 1, label: "Level 1: No alumni interaction or higher education career counseling" },
          { val: 2, label: "Level 2: Ad-hoc career talks by guest speakers once a year" },
          { val: 3, label: "Level 3: Structured university counseling pipeline and annual alumni interaction day" },
          { val: 4, label: "Level 4: Dedicated career guidance center with active alumni mentorship pairings" },
          { val: 5, label: "Level 5: Global alumni placement network, university application mentorship, and scholarship guidance" }
        ]
      },
      {
        id: "ew_14_teacher_q1",
        id_actual: "ew_14",
        section: "Part VII: Co-Curriculars, Sports, CSR & Value",
        label: "Q7.5: Reinvestment in Classroom Resources & Educational Value",
        text: "Do you feel school management reinvests tuition revenues adequately into classroom teaching materials, software, and lab consumables?",
        options: [
          { val: 1, label: "Level 1: Strict budget caps on basic stationery, paper, and lab supplies" },
          { val: 2, label: "Level 2: Essential supplies provided; delays in purchasing new equipment" },
          { val: 3, label: "Level 3: Adequate teaching budget for standard classroom needs" },
          { val: 4, label: "Level 4: Generous departmental budgets for experimental kits, books, and software" },
          { val: 5, label: "Level 5: Continuous capital reinvestment in cutting-edge classroom tech, digital subscriptions, and premium resources" }
        ]
      }
    ]
  },
  parent: {
    title: "Parental Experience, Transparency & Academic Value Survey",
    desc: "Comprehensive diagnostic evaluating academic outcome satisfaction, campus safety, communication responsiveness, holistic development, and overall value.",
    questions: [
      // Part I: Academic Excellence & Faculty Quality
      {
        id: "ew_3_parent_q1",
        id_actual: "ew_3",
        section: "Part I: Academic Excellence & Faculty Quality",
        label: "Q1.1: Academic Rigor & Exam Preparedness",
        text: "How satisfied are you with the academic rigor, board exam results, and competitive exam preparation provided by the school?",
        options: [
          { val: 1, label: "Level 1: Unfavorable; child requires extensive external tuition to keep up with standard board exams" },
          { val: 2, label: "Level 2: Average; standard textbook coverage but lacks competitive exam depth" },
          { val: 3, label: "Level 3: Satisfactory; solid board exam preparation and regular assessment feedback" },
          { val: 4, label: "Level 4: High quality; strong academic percentile rank in district with mock test support" },
          { val: 5, label: "Level 5: Top tier; top 5% board distinction rates, olympiad training, and zero need for private tuition" }
        ]
      },
      {
        id: "ew_1_parent_q1",
        id_actual: "ew_1",
        section: "Part I: Academic Excellence & Faculty Quality",
        label: "Q1.2: Perception of Teacher Knowledge & Pedagogy",
        text: "Do you feel your child's teachers are highly knowledgeable, approachable, and effective at explaining complex concepts?",
        options: [
          { val: 1, label: "Level 1: Poor; teachers struggle with subject clarity or lack professional teaching credentials" },
          { val: 2, label: "Level 2: Fair; teachers cover syllabus but communication is rigid or transactional" },
          { val: 3, label: "Level 3: Good; teachers are qualified and respond adequately to student doubts" },
          { val: 4, label: "Level 4: Very Good; energetic teachers who use engaging examples and encourage curiosity" },
          { val: 5, label: "Level 5: Exceptional; master educators who inspire lifelong learning and provide personalized academic guidance" }
        ]
      },
      {
        id: "ew_2_parent_q1",
        id_actual: "ew_2",
        section: "Part I: Academic Excellence & Faculty Quality",
        label: "Q1.3: Quality of Homework, Digital Portals & STEM Curriculum",
        text: "How well balanced and engaging are the homework assignments, digital learning apps, and STEM/project units assigned to your child?",
        options: [
          { val: 1, label: "Level 1: Overwhelming repetitive worksheets or complete lack of digital learning materials" },
          { val: 2, label: "Level 2: Routine textbook exercises; basic homework notices on app" },
          { val: 3, label: "Level 3: Meaningful homework assignments with structured project units once per term" },
          { val: 4, label: "Level 4: Interactive digital portal, blended STEM projects, and balanced weekend workloads" },
          { val: 5, label: "Level 5: Innovative NEP 2020 project-based learning, adaptive learning app, and zero mechanical homework" }
        ]
      },
      // Part II: Child Well-being, Safety & Individual Attention
      {
        id: "ew_8_parent_q1",
        id_actual: "ew_8",
        section: "Part II: Child Well-being, Safety & Individual Attention",
        label: "Q2.1: Individualized Academic Attention & Progress Feedback",
        text: "Does your child receive personal attention when struggling, and are learning gaps addressed proactively by teachers?",
        options: [
          { val: 1, label: "Level 1: No individual attention; slower learners are ignored in large classes" },
          { val: 2, label: "Level 2: Reactive help only after child fails a major term examination" },
          { val: 3, label: "Level 3: Regular PTM updates with remedial recommendations for core subjects" },
          { val: 4, label: "Level 4: Proactive early-gap alerts and dedicated after-school doubt sessions" },
          { val: 5, label: "Level 5: Fully customized learning paths, low student-teacher ratio, and 1-on-1 academic coaching" }
        ]
      },
      {
        id: "ew_6_parent_q1",
        id_actual: "ew_6",
        section: "Part II: Child Well-being, Safety & Individual Attention",
        label: "Q2.2: Emotional Safety, Counseling & Anti-Bullying Vigilance",
        text: "How confident are you in the school's emotional safety nets, counselor accessibility, and zero-tolerance policy for bullying?",
        options: [
          { val: 1, label: "Level 1: High concern; unaddressed bullying incidents and no counselor support" },
          { val: 2, label: "Level 2: Basic discipline rules; counselor available on request" },
          { val: 3, label: "Level 3: Full-time counselor on campus with structured anti-bullying awareness workshops" },
          { val: 4, label: "Level 4: Proactive mental health programs, peer support networks, and transparent incident handling" },
          { val: 5, label: "Level 5: World-class psychological safety, daily circle time, anonymous complaint app, and total peace of mind" }
        ]
      },
      {
        id: "ew_7_parent_q1",
        id_actual: "ew_7",
        section: "Part II: Child Well-being, Safety & Individual Attention",
        label: "Q2.3: Physical Campus Security, CCTV, Transport & Sanitation",
        text: "How would you rate physical campus security, gate access control, school bus live GPS tracking, and restroom hygiene?",
        options: [
          { val: 1, label: "Level 1: Safety concerns; lax gate security, unhygienic washrooms, or unmonitored bus transport" },
          { val: 2, label: "Level 2: Standard security guards and basic bus attendants" },
          { val: 3, label: "Level 3: Perimeter CCTV monitoring, verified bus attendants, and clean sanitation facilities" },
          { val: 4, label: "Level 4: Parent live bus GPS tracking, biometric gate access, and sanitized campus amenities" },
          { val: 5, label: "Level 5: 100% CCTV coverage, automated parent entry alerts, pristine hygiene standards, and emergency response protocols" }
        ]
      },
      // Part III: Parent-School Communication & Governance
      {
        id: "ew_12_parent_q1",
        id_actual: "ew_12",
        section: "Part III: Parent-School Communication & Governance",
        label: "Q3.1: Query SLA & Helpdesk Ticket Resolution Speed",
        text: "What is your experience regarding responsiveness when submitting administrative or academic inquiries to the school?",
        options: [
          { val: 1, label: "Level 1: Unresponsive (>48 hours delay); calls ignored or uncoordinated WhatsApp groups" },
          { val: 2, label: "Level 2: 24–48 hours turnaround; physical diary notes or basic helpdesk" },
          { val: 3, label: "Level 3: 12–24 hours turnaround via official Parent App with ticket tracking" },
          { val: 4, label: "Level 4: 4–12 hours turnaround; dedicated parent relationship executive" },
          { val: 5, label: "Level 5: Guaranteed < 4 hours SLA resolution with executive escalation matrix and high transparency" }
        ]
      },
      {
        id: "ew_13_parent_q1",
        id_actual: "ew_13",
        section: "Part III: Parent-School Communication & Governance",
        label: "Q3.2: Principal Accessibility & Leadership Vision",
        text: "Do you trust the principal's vision, administrative leadership, and open accessibility to parents?",
        options: [
          { val: 1, label: "Level 1: Distant or non-accessible leadership; decisions communicated arbitrarily" },
          { val: 2, label: "Level 2: Standard administrative updates sent via circulars; principal accessible only during annual PTM" },
          { val: 3, label: "Level 3: Clear leadership vision shared at start of year; regular parent feedback surveys" },
          { val: 4, label: "Level 4: Open-door principal hours, active PTA association, and transparent policy changes" },
          { val: 5, label: "Level 5: Visionary, inspiring leadership with monthly townhalls, active parent advisory board, and complete trust" }
        ]
      },
      // Part IV: Holistic Growth, Sports & Co-Curriculars
      {
        id: "ew_9_parent_q1",
        id_actual: "ew_9",
        section: "Part IV: Holistic Growth, Sports & Co-Curriculars",
        label: "Q4.1: Visual Arts, Performing Ensembles & Drama",
        text: "How satisfied are you with the quality of music, art, theater, debate, and cultural exposure offered to students?",
        options: [
          { val: 1, label: "Level 1: Minimal or non-existent co-curricular exposure" },
          { val: 2, label: "Level 2: Basic annual cultural event; limited choice of clubs" },
          { val: 3, label: "Level 3: Regular weekly art/music periods and active public speaking clubs" },
          { val: 4, label: "Level 4: Specialized music studios, professional theater coaches, and state-level accolades" },
          { val: 5, label: "Level 5: World-class performing arts center, national MUN representation, and rich holistic exposure" }
        ]
      },
      {
        id: "ew_10_parent_q1",
        id_actual: "ew_10",
        section: "Part IV: Holistic Growth, Sports & Co-Curriculars",
        label: "Q4.2: Sports Infrastructure, Turf Quality & Professional Coaching",
        text: "How would you rate the sports grounds, certified coaching faculty, and physical fitness tracking provided by the school?",
        options: [
          { val: 1, label: "Level 1: Poor; cramped or unsafe playground with no specialized sports coaches" },
          { val: 2, label: "Level 2: Standard multi-purpose playground with basic sports equipment" },
          { val: 3, label: "Level 3: Dedicated sports courts, certified PE staff, and annual sports day competitions" },
          { val: 4, label: "Level 4: Synthetic turfs, indoor sports arena, certified coaches for 3+ sports, and health/BMI logs" },
          { val: 5, label: "Level 5: Olympic-standard facilities, elite sports academy partnerships, and national tournament records" }
        ]
      },
      {
        id: "ew_11_parent_q1",
        id_actual: "ew_11",
        section: "Part IV: Holistic Growth, Sports & Co-Curriculars",
        label: "Q4.3: Character Building, Values & Community CSR",
        text: "Does the school instill strong moral values, civic empathy, and environmental consciousness in your child?",
        options: [
          { val: 1, label: "Level 1: No noticeable emphasis on value education or community service" },
          { val: 2, label: "Level 2: Basic moral science textbook lectures once a week" },
          { val: 3, label: "Level 3: Active community donation drives and environmental awareness projects" },
          { val: 4, label: "Level 4: Mandatory community service hours and active student-led sustainability campaigns" },
          { val: 5, label: "Level 5: Deeply embedded ethical culture, zero-waste green campus, and recognized social impact" }
        ]
      },
      // Part V: Alumni Outcomes, Turnover & Value for Money
      {
        id: "ew_4_parent_q1",
        id_actual: "ew_4",
        section: "Part V: Alumni Outcomes, Turnover & Value for Money",
        label: "Q5.1: Alumni Higher Education Placement & Career Guidance",
        text: "How confident are you that the school's brand and career guidance pipeline will help your child enter top universities?",
        options: [
          { val: 1, label: "Level 1: Low confidence; no university counseling or alumni placement records available" },
          { val: 2, label: "Level 2: Basic college guidance seminars for Grade 12 students" },
          { val: 3, label: "Level 3: Active university admissions counselor and visible alumni admissions tracking" },
          { val: 4, label: "Level 4: Structured university counseling, SAT/JEE/NEET test prep support, and alumni mentoring" },
          { val: 5, label: "Level 5: Outstanding alumni network with guaranteed placements in tier-1 global universities and scholarship endowments" }
        ]
      },
      {
        id: "ew_5_parent_q1",
        id_actual: "ew_5",
        section: "Part V: Alumni Outcomes, Turnover & Value for Money",
        label: "Q5.2: Faculty Stability & Absence of Mid-Year Turnover",
        text: "How stable is the teaching staff in your child's grade, and do teachers remain with the school for long tenures?",
        options: [
          { val: 1, label: "Level 1: High teacher turnover; frequent mid-term resignations causing subject disruptions" },
          { val: 2, label: "Level 2: Occasional mid-term replacements with temporary substitute teachers" },
          { val: 3, label: "Level 3: Stable faculty cohort; minimal teacher changes during academic year" },
          { val: 4, label: "Level 4: High faculty retention; key subject teachers remain for 3+ consecutive years" },
          { val: 5, label: "Level 5: Long-tenured master teachers (5+ years average tenure) ensuring seamless continuity and warmth" }
        ]
      },
      {
        id: "ew_14_parent_q1",
        id_actual: "ew_14",
        section: "Part V: Alumni Outcomes, Turnover & Value for Money",
        label: "Q5.3: Overall Value for Money & Fee Transparency",
        text: "How would you rate the overall educational value, facilities, and child development received relative to the fee structure?",
        options: [
          { val: 1, label: "Level 1: Overpriced; high fee structure with hidden charges and unsatisfactory facilities" },
          { val: 2, label: "Level 2: Average value; fees match standard private school expectations" },
          { val: 3, label: "Level 3: Good value; fair fee structure with well-maintained facilities and reliable teaching" },
          { val: 4, label: "Level 4: High value; excellent return on fee investment with premium tech, sports, and academics" },
          { val: 5, label: "Level 5: Outstanding value for money; elite holistic outcomes, zero hidden costs, and exceptional quality" }
        ]
      }
    ]
  },
  student: {
    title: "Student Learning Experience, Campus Climate & Wellbeing Pulse",
    desc: "Direct feedback from students on classroom engagement, teacher support, physical safety, peer relationships, sports, and future readiness.",
    questions: [
      // Part I: Classroom Learning & Teaching Quality
      {
        id: "ew_1_student_q1",
        id_actual: "ew_1",
        section: "Part I: Classroom Learning & Teaching Quality",
        label: "Q1.1: Teacher Support, Clarity & Encouragement",
        text: "Do your teachers explain difficult subjects clearly and help you patiently when you are confused?",
        options: [
          { val: 1, label: "Level 1: Teachers rush through lessons and scold students who ask questions" },
          { val: 2, label: "Level 2: Teachers cover the textbook but rarely check if everyone understood" },
          { val: 3, label: "Level 3: Teachers explain concepts well and answer questions during class" },
          { val: 4, label: "Level 4: Teachers make learning exciting with real-life examples and encourage curiosity" },
          { val: 5, label: "Level 5: Teachers are amazing mentors who give personal feedback and make every student feel valued" }
        ]
      },
      {
        id: "ew_2_student_q1",
        id_actual: "ew_2",
        section: "Part I: Classroom Learning & Teaching Quality",
        label: "Q1.2: Smart Classes, Experiments & Engaging Lessons",
        text: "How often do you use smart screens, conduct lab experiments, or work on group projects in your classes?",
        options: [
          { val: 1, label: "Level 1: Almost never; classes consist only of copying notes from the board" },
          { val: 2, label: "Level 2: Occasional smart board videos; science experiments demonstrated by teacher only" },
          { val: 3, label: "Level 3: Regular interactive smart lessons and hands-on science/computer lab sessions" },
          { val: 4, label: "Level 4: Fun project-based learning, digital quizzes, and collaborative group presentations" },
          { val: 5, label: "Level 5: Full digital learning environment with 3D simulations, robotics, and creative design projects" }
        ]
      },
      {
        id: "ew_8_student_q1",
        id_actual: "ew_8",
        section: "Part I: Classroom Learning & Teaching Quality",
        label: "Q1.3: Help for Slower Learners & Personalized Homework",
        text: "If you get a low grade or struggle with a concept, do your teachers offer extra help or personalized support?",
        options: [
          { val: 1, label: "Level 1: No extra help offered; students are left to figure it out on their own" },
          { val: 2, label: "Level 2: Advised to read textbook again or take external coaching" },
          { val: 3, label: "Level 3: Teachers offer short doubt-clearing sessions before exams" },
          { val: 4, label: "Level 4: Dedicated remedial help sessions and customized practice worksheets" },
          { val: 5, label: "Level 5: Personalized academic guidance track ensuring no student ever gets left behind" }
        ]
      },
      // Part II: School Safety, Wellbeing & Cleanliness
      {
        id: "ew_6_student_q1",
        id_actual: "ew_6",
        section: "Part II: School Safety, Wellbeing & Cleanliness",
        label: "Q2.1: Emotional Safety, Trusted Counselors & Anti-Bullying",
        text: "Do you feel safe from bullying at school, and do you know a trusted teacher or counselor you can talk to?",
        options: [
          { val: 1, label: "Level 1: Bullying happens often and teachers rarely intervene; I feel unsafe" },
          { val: 2, label: "Level 2: Bullying rules exist on paper, but students hesitate to report issues" },
          { val: 3, label: "Level 3: School has clear anti-bullying rules and a counselor available if needed" },
          { val: 4, label: "Level 4: Friendly school culture with weekly circle time and accessible student counselors" },
          { val: 5, label: "Level 5: Total emotional safety, peer support ambassadors, anonymous grievance box, and zero bullying" }
        ]
      },
      {
        id: "ew_7_student_q1",
        id_actual: "ew_7",
        section: "Part II: School Safety, Wellbeing & Cleanliness",
        label: "Q2.2: Cleanliness of Washrooms, Desks & Campus Facilities",
        text: "Are the school washrooms, drinking water stations, sports grounds, and classrooms clean and well-maintained?",
        options: [
          { val: 1, label: "Level 1: Dirty washrooms, broken desks, or non-functional drinking water filters" },
          { val: 2, label: "Level 2: Basic cleanliness; washrooms run out of soap or water occasionally" },
          { val: 3, label: "Level 3: Clean washrooms, well-maintained desks, and hygienic drinking water" },
          { val: 4, label: "Level 4: Very clean facilities, modern furniture, and well-kept green campus grounds" },
          { val: 5, label: "Level 5: Pristine hygiene, automated water purifiers, air-conditioned smart labs, and spotless campus" }
        ]
      },
      // Part III: Sports, Arts, Clubs & Community
      {
        id: "ew_9_student_q1",
        id_actual: "ew_9",
        section: "Part III: Sports, Arts, Clubs & Community",
        label: "Q3.1: School Clubs, Drama, Music & Public Speaking",
        text: "Are there exciting school clubs, theater, music, art, and debate activities that you enjoy participating in?",
        options: [
          { val: 1, label: "Level 1: No active clubs or art/music activities; periods are converted to extra study time" },
          { val: 2, label: "Level 2: Few basic clubs with rare events; art/music periods are very limited" },
          { val: 3, label: "Level 3: Regular weekly club activities and opportunities to perform in annual day functions" },
          { val: 4, label: "Level 4: Vibrant debate clubs, music bands, theater workshops, and inter-school competitions" },
          { val: 5, label: "Level 5: Student-led clubs, national MUN conferences, music recording studio, and art exhibitions" }
        ]
      },
      {
        id: "ew_10_student_q1",
        id_actual: "ew_10",
        section: "Part III: Sports, Arts, Clubs & Community",
        label: "Q3.2: Sports Facilities, Playground Time & Coaching",
        text: "Do you get regular sports periods on a good field with encouraging coaches and real equipment?",
        options: [
          { val: 1, label: "Level 1: Cramped or broken playground; sports periods are rarely given" },
          { val: 2, label: "Level 2: Basic playground time for free play; limited sports gear available" },
          { val: 3, label: "Level 3: Dedicated sports periods every week with trained PE coaches for core games" },
          { val: 4, label: "Level 4: Synthetic turfs, basketball courts, swimming pool, and active sports teams" },
          { val: 5, label: "Level 5: Elite sports infrastructure, professional tournament coaching, and national sports representation" }
        ]
      },
      {
        id: "ew_11_student_q1",
        id_actual: "ew_11",
        section: "Part III: Sports, Arts, Clubs & Community",
        label: "Q3.3: Community Service, Recycling & Social Impact",
        text: "Have you participated in tree planting, charity drives, cleanups, or helping nearby communities through school?",
        options: [
          { val: 1, label: "Level 1: Never participated in any community service or social projects" },
          { val: 2, label: "Level 2: Donated items during an annual festive charity drive" },
          { val: 3, label: "Level 3: Participated in local tree planting, recycling drives, or community cleanups" },
          { val: 4, label: "Level 4: Active member of eco-club or community service project with regular outreach" },
          { val: 5, label: "Level 5: Led a student social initiative or community improvement campaign recognized locally" }
        ]
      },
      // Part IV: Board Exam Confidence, Leadership & Future Vision
      {
        id: "ew_3_student_q1",
        id_actual: "ew_3",
        section: "Part IV: Exam Confidence, Leadership & Future Vision",
        label: "Q4.1: Board Exam Confidence & Academic Pride",
        text: "How confident do you feel about scoring high in board exams or competitive tests compared to students from other schools?",
        options: [
          { val: 1, label: "Level 1: Low confidence; feel unprepared and worried about exam syllabus coverage" },
          { val: 2, label: "Level 2: Moderately confident; rely heavily on external tuition guides" },
          { val: 3, label: "Level 3: Confident; school revision tests and sample papers prepare us well" },
          { val: 4, label: "Level 4: Very confident; consistently perform well in mock exams and Olympiads" },
          { val: 5, label: "Level 5: Top tier confidence; school training targets top district ranks and competitive success" }
        ]
      },
      {
        id: "ew_13_student_q1",
        id_actual: "ew_13",
        section: "Part IV: Exam Confidence, Leadership & Future Vision",
        label: "Q4.2: Fair Rules, School Pride & Student Council Voice",
        text: "Are school rules fair, and does the principal and student council listen to student ideas and feedback?",
        options: [
          { val: 1, label: "Level 1: Rules feel overly strict or unfair; student opinions are completely ignored" },
          { val: 2, label: "Level 2: Student council exists in name only; little change comes from student ideas" },
          { val: 3, label: "Level 3: Student council represents student views and meets regularly with school leaders" },
          { val: 4, label: "Level 4: Principals actively listen to student council and implement popular student suggestions" },
          { val: 5, label: "Level 5: High student empowerment, active student leadership in school events, and immense school pride" }
        ]
      },
      {
        id: "ew_4_student_q1",
        id_actual: "ew_4",
        section: "Part IV: Exam Confidence, Leadership & Future Vision",
        label: "Q4.3: Inspiration from Alumni & Career Mentors",
        text: "Do you know successful school alumni who inspire you, or have you attended alumni career guidance sessions?",
        options: [
          { val: 1, label: "Level 1: Never heard about school alumni or university career guidance" },
          { val: 2, label: "Level 2: Saw alumni names on an honor board at school" },
          { val: 3, label: "Level 3: Attended an annual career talk by guest alumni speakers" },
          { val: 4, label: "Level 4: Regular career guidance sessions with alumni studying in top universities" },
          { val: 5, label: "Level 5: Active alumni mentorship network guiding us on college applications, entrance tests, and career paths" }
        ]
      },
      {
        id: "ew_12_student_q1",
        id_actual: "ew_12",
        section: "Part IV: Exam Confidence, Leadership & Future Vision",
        label: "Q4.4: Teacher-Parent Partnership Harmony",
        text: "Do your parents and teachers communicate smoothly and work together to support your progress?",
        options: [
          { val: 1, label: "Level 1: Communication only happens when there is a complaint or disciplinary issue" },
          { val: 2, label: "Level 2: Brief updates given during formal PTMs twice a year" },
          { val: 3, label: "Level 3: Regular progress reports shared on parent app with balanced feedback" },
          { val: 4, label: "Level 4: Positive collaboration where teachers and parents celebrate my progress together" },
          { val: 5, label: "Level 5: Strong supportive triangle between child, teacher, and parent fostering joy in learning" }
        ]
      },
      {
        id: "ew_5_student_q1",
        id_actual: "ew_5",
        section: "Part IV: Exam Confidence, Leadership & Future Vision",
        label: "Q4.5: Teacher Energy & Classroom Enthusiasm",
        text: "Do your teachers seem happy, energetic, and excited to teach you every day?",
        options: [
          { val: 1, label: "Level 1: Teachers look exhausted, stressed, or frequently absent" },
          { val: 2, label: "Level 2: Teachers perform duties standardly but lack enthusiasm" },
          { val: 3, label: "Level 3: Teachers are energetic, punctual, and keep the classroom positive" },
          { val: 4, label: "Level 4: Teachers bring high enthusiasm and creative activities to daily lessons" },
          { val: 5, label: "Level 5: Vibrant, passionate educators who make school a joy to attend every day" }
        ]
      },
      {
        id: "ew_14_student_q1",
        id_actual: "ew_14",
        section: "Part IV: Exam Confidence, Leadership & Future Vision",
        label: "Q4.6: Quality of Books, Tech & Lab Resources",
        text: "Do you have access to modern textbooks, library books, computers, and science lab materials whenever needed?",
        options: [
          { val: 1, label: "Level 1: Missing textbooks, outdated library, or broken computers in the lab" },
          { val: 2, label: "Level 2: Basic library and shared computers during designated class slots" },
          { val: 3, label: "Level 3: Well-stocked library, working computers, and complete lab equipment" },
          { val: 4, label: "Level 4: High-speed internet, e-library access, and modern STEM equipment" },
          { val: 5, label: "Level 5: World-class digital library, 1:1 tablets, advanced robotics kits, and unlimited learning resources" }
        ]
      }
    ]
  },
  admin: {
    title: "Administrative & Operational Infrastructure Efficiency Audit",
    desc: "Internal assessment of facility upkeep, regulatory safety compliance, technology infrastructure, procurement speed, and operational workflow.",
    questions: [
      // Part I: Infrastructure Maintenance & Facility Management
      {
        id: "ew_7_admin_q1",
        id_actual: "ew_7",
        section: "Part I: Infrastructure Maintenance & Facility Management",
        label: "Q1.1: Physical Campus Upkeep, Utilities & Sanitation",
        text: "How reliably are electrical utilities, water supply, air conditioning, and washroom sanitation maintained across campus?",
        options: [
          { val: 1, label: "Level 1: Frequent utility disruptions, delayed repair work, or sanitation complaints" },
          { val: 2, label: "Level 2: Reactive maintenance; repairs fixed only after staff log written complaints" },
          { val: 3, label: "Level 3: Scheduled maintenance logs; clean washrooms and functional campus utilities" },
          { val: 4, label: "Level 4: Preventive maintenance software, rapid 2-hour facility repair SLA, and spotless hygiene" },
          { val: 5, label: "Level 5: Smart building management system, 100% utility uptime, green energy, and zero-defect maintenance" }
        ]
      },
      {
        id: "ew_7_admin_q2",
        id_actual: "ew_7",
        section: "Part I: Infrastructure Maintenance & Facility Management",
        label: "Q1.2: Safety Certification Audits (Fire, Transport, CCTV)",
        text: "Are all mandatory municipal and board safety certificates (Fire Safety, Structural Stability, Transport GPS, CCTV) up to date?",
        options: [
          { val: 1, label: "Level 1: Compliance lapses or expired safety certificates awaiting renewal" },
          { val: 2, label: "Level 2: Valid safety clearances with manual record-keeping" },
          { val: 3, label: "Level 3: Annual fire safety drills, complete perimeter CCTV, and verified bus speed governors" },
          { val: 4, label: "Level 4: Bi-annual third-party safety audits, live bus GPS tracking, and HD CCTV logging" },
          { val: 5, label: "Level 5: Podar network grade safety clearance, 100% zero-blindspot campus, and biometric gate security" }
        ]
      },
      // Part II: Administrative Technology, Data Privacy & SLA
      {
        id: "ew_12_admin_q1",
        id_actual: "ew_12",
        section: "Part II: Administrative Technology & SLA",
        label: "Q2.1: Parent Ticketing Helpdesk SLA & Inquiry Resolution",
        text: "What is the average turnaround time for administrative staff to resolve parent billing, fee queries, or transport tickets?",
        options: [
          { val: 1, label: "Level 1: Slow turnaround (>48 hours); manual paper receipts and long office queues" },
          { val: 2, label: "Level 2: 24–48 hours turnaround; basic email or phone query logging" },
          { val: 3, label: "Level 3: 12–24 hours turnaround; integrated ERP ticketing system" },
          { val: 4, label: "Level 4: 4–12 hours turnaround; automated online fee payment portal and instant SMS receipts" },
          { val: 5, label: "Level 5: Strict < 4 hours helpdesk SLA resolution with automated escalation matrix" }
        ]
      },
      {
        id: "ew_13_admin_q1",
        id_actual: "ew_13",
        section: "Part II: Administrative Technology & SLA",
        label: "Q2.2: CBSE SQAAF Compliance & DPDP Act Data Privacy",
        text: "How systematically are school records, student health data, and staff logs secured in compliance with data protection laws?",
        options: [
          { val: 1, label: "Level 1: Physical paper registers with no digital backup or data privacy controls" },
          { val: 2, label: "Level 2: Basic password-protected Excel sheets on individual admin desktop computers" },
          { val: 3, label: "Level 3: Centralized school ERP with role-based user access controls" },
          { val: 4, label: "Level 4: Cloud ERP compliant with CBSE SQAAF standards and encrypted backups" },
          { val: 5, label: "Level 5: Full DPDP Act 2023 compliance, end-to-end encrypted database, and automated regulatory audit trails" }
        ]
      },
      // Part III: Operational Support & Financial Efficiency
      {
        id: "ew_5_admin_q1",
        id_actual: "ew_5",
        section: "Part III: Operational Support & Financial Efficiency",
        label: "Q3.1: Timely Payroll, HR Benefits & Teacher Support",
        text: "How smoothly are faculty payroll, provident fund, medical insurance claims, and staff leave requests processed?",
        options: [
          { val: 1, label: "Level 1: Payroll delays, manual leave calculations, or unresolved HR grievances" },
          { val: 2, label: "Level 2: Standard monthly salary dispatches with occasional paperwork delays" },
          { val: 3, label: "Level 3: On-time salary disbursement via direct bank transfer and automated leave tracking" },
          { val: 4, label: "Level 4: Digital HR self-service portal, automated tax filings, and prompt medical claim processing" },
          { val: 5, label: "Level 5: Flawless HR operations, performance bonus dispatches, and outstanding faculty welfare support" }
        ]
      },
      {
        id: "ew_14_admin_q1",
        id_actual: "ew_14",
        section: "Part III: Operational Support & Financial Efficiency",
        label: "Q3.2: Procurement Speed for Classroom & Lab Supplies",
        text: "How quickly are departmental requisitions for science chemicals, computer hardware, stationery, and sports equipment fulfilled?",
        options: [
          { val: 1, label: "Level 1: Severe procurement delays (>4 weeks); classrooms frequently lack basic supplies" },
          { val: 2, label: "Level 2: 2–3 weeks turnaround; multi-layered manual approval paperwork" },
          { val: 3, label: "Level 3: 1–2 weeks turnaround; structured annual vendor contracts" },
          { val: 4, label: "Level 4: 3–5 days turnaround; digital procurement portal with pre-approved departmental budgets" },
          { val: 5, label: "Level 5: 24–48 hours rapid fulfillment SLA with vendor quality rating and bulk cost savings" }
        ]
      },
      // Part IV: Resource Utilization & Special Needs Infrastructure
      {
        id: "ew_10_admin_q1",
        id_actual: "ew_10",
        section: "Part IV: Resource Utilization & Inclusion Infrastructure",
        label: "Q4.1: Sports Field & Auditorium Facility Utilization",
        text: "How effectively are sports fields, indoor courts, computer labs, and auditoriums scheduled and utilized?",
        options: [
          { val: 1, label: "Level 1: Facilities remain locked or underutilized due to lack of scheduling software" },
          { val: 2, label: "Level 2: Basic timetable allocation; occasional double-booking conflicts" },
          { val: 3, label: "Level 3: Structured weekly facility allocation schedule covering all grade levels" },
          { val: 4, label: "Level 4: Optimized digital facility booking calendar including after-school sports academies" },
          { val: 5, label: "Level 5: Maximum capacity utilization with community events, sports leagues, and revenue-generating weekend hubs" }
        ]
      },
      {
        id: "ew_8_admin_q1",
        id_actual: "ew_8",
        section: "Part IV: Resource Utilization & Inclusion Infrastructure",
        label: "Q4.2: Special Needs Accessibility (Ramps, Lifts, Restrooms)",
        text: "Is the physical campus fully accessible for students or visitors with physical disabilities (wheelchair ramps, elevators, sensory rooms)?",
        options: [
          { val: 1, label: "Level 1: No wheelchair ramps, elevators, or accessible washrooms on campus" },
          { val: 2, label: "Level 2: Ramps available at main entrance only; upper floors inaccessible" },
          { val: 3, label: "Level 3: Elevator access to key academic floors and accessible ground-floor washrooms" },
          { val: 4, label: "Level 4: Complete barrier-free campus with tactile paths, elevators, and sensory integration rooms" },
          { val: 5, label: "Level 5: Benchmark inclusive infrastructure meeting international accessibility standards" }
        ]
      },
      {
        id: "ew_11_admin_q1",
        id_actual: "ew_11",
        section: "Part IV: Resource Utilization & Inclusion Infrastructure",
        label: "Q4.3: Campus Environmental Sustainability (Solar, Zero-Waste)",
        text: "What administrative systems exist for solar power generation, rainwater harvesting, and waste segregation on campus?",
        options: [
          { val: 1, label: "Level 1: No environmental sustainability measures in place" },
          { val: 2, label: "Level 2: Basic trash bin segregation; high electricity grid consumption" },
          { val: 3, label: "Level 3: Rainwater harvesting pits and active paper recycling drives" },
          { val: 4, label: "Level 4: Rooftop solar panel grid, composting unit, and LED campus lighting" },
          { val: 5, label: "Level 5: Certified zero-waste green campus, net-zero carbon footprint, and automated energy management" }
        ]
      }
    ]
  },
  other: {
    title: "Alumni & External Stakeholder Diagnostic Evaluation",
    desc: "Perceptions from school alumni, local community leaders, and partner organizations on institutional reputation, graduate trajectory, and social impact.",
    questions: [
      {
        id: "ew_4_other_q1",
        id_actual: "ew_4",
        section: "Part I: Graduate Impact & Academic Legacy",
        label: "Q1.1: Alumni Higher Education & Career Success Trajectory",
        text: "How successfully do graduates from this school transition into top universities and prominent professional careers?",
        options: [
          { val: 1, label: "Level 1: Low visibility; alumni struggle to secure admission in tier-1 higher education institutions" },
          { val: 2, label: "Level 2: Moderate success; graduates enter regional colleges with average career outcomes" },
          { val: 3, label: "Level 3: Strong trajectory; consistent alumni admissions in leading national universities" },
          { val: 4, label: "Level 4: High distinction; alumni excel in premier national and international universities and corporate roles" },
          { val: 5, label: "Level 5: Elite global network; alumni hold leadership positions, found startups, and actively mentor students" }
        ]
      },
      {
        id: "ew_3_other_q1",
        id_actual: "ew_3",
        section: "Part I: Graduate Impact & Academic Legacy",
        label: "Q1.2: Institutional Brand Reputation & Academic Prestige",
        text: "What is the overall academic standing and public brand prestige of the school in the local and national community?",
        options: [
          { val: 1, label: "Level 1: Poor reputation; perceived as lagging in academic standards and discipline" },
          { val: 2, label: "Level 2: Average local standing; considered an ordinary neighborhood school" },
          { val: 3, label: "Level 3: Well-respected institution with reliable academic results and good community standing" },
          { val: 4, label: "Level 4: Highly prestigious school; top choice for admissions in the district" },
          { val: 5, label: "Level 5: Nationally benchmarked flagship institution renowned for academic innovation and leadership" }
        ]
      },
      {
        id: "ew_11_other_q1",
        id_actual: "ew_11",
        section: "Part II: Community Engagement & CSR",
        label: "Q2.1: Local Community Social Impact & Environmental CSR",
        text: "How actively does the school contribute to local community welfare, neighborhood cleanups, and social causes?",
        options: [
          { val: 1, label: "Level 1: Insular institution with zero interaction or benefit to the local community" },
          { val: 2, label: "Level 2: Occasional charitable events or holiday donation drives" },
          { val: 3, label: "Level 3: Regular community outreach programs, health camps, and neighborhood awareness drives" },
          { val: 4, label: "Level 4: Active NGO partnerships, village adoption programs, and environmental restoration projects" },
          { val: 5, label: "Level 5: Exemplary community pillar driving measurable local social transformation and sustainability" }
        ]
      },
      {
        id: "ew_13_other_q1",
        id_actual: "ew_13",
        section: "Part II: Community Engagement & CSR",
        label: "Q2.2: Visionary Leadership & Governance Ethics",
        text: "How would you rate the ethical integrity, governance standards, and long-term vision of the school management?",
        options: [
          { val: 1, label: "Level 1: Governance concerns, frequent administrative conflicts, or unethical practices" },
          { val: 2, label: "Level 2: Standard commercial school administration with routine operational focus" },
          { val: 3, label: "Level 3: Ethical management team with transparent policies and stable governance" },
          { val: 4, label: "Level 4: Visionary leadership team actively innovating and expanding educational standards" },
          { val: 5, label: "Level 5: Industry benchmark for ethical governance, visionary leadership, and institutional integrity" }
        ]
      },
      {
        id: "ew_14_other_q1",
        id_actual: "ew_14",
        section: "Part II: Community Engagement & CSR",
        label: "Q2.3: Educational Value & Community ROI",
        text: "Do you consider the institution to deliver exceptional educational value and holistic return on investment for families?",
        options: [
          { val: 1, label: "Level 1: Mismatched return; high cost with mediocre educational outcomes" },
          { val: 2, label: "Level 2: Standard value corresponding to baseline tuition costs" },
          { val: 3, label: "Level 3: Solid value for money with dependable academic and co-curricular outcomes" },
          { val: 4, label: "Level 4: Outstanding educational value creating strong student competitive advantages" },
          { val: 5, label: "Level 5: Benchmark return on educational investment, producing well-rounded global leaders" }
        ]
      }
    ]
  }
};

export const DeepDiveAssessment = ({
  isStep3Wizard = false,
  onCompleteStep3,
  initialDimensions,
  initialAnswers,
}: {
  isStep3Wizard?: boolean;
  onCompleteStep3?: (dimensions: EWISRDimension[], answers: Record<string, number>) => void;
  initialDimensions?: EWISRDimension[];
  initialAnswers?: Record<string, number>;
}) => {
  const { activeSchool, addCommunication } = useAppStore();
  const [temporaryAnswers, setTemporaryAnswers] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'capture' | 'compare' | 'simulate'>(
    isStep3Wizard ? 'capture' : 'compare'
  );
  const [dimensions, setDimensions] = useState<EWISRDimension[]>(initialDimensions || INITIAL_14_DIMENSIONS);
  const [selectedDimensionId, setSelectedDimensionId] = useState<string>('ew_12'); // Default to Parental Involvement to showcase gaps
  const [activeStakeholder, setActiveStakeholder] = useState<'leader' | 'teacher' | 'parent' | 'student'>('leader');
  
  // Dynamic parameters state for manual entry override (Stage 1: Capture)
  const [inputStudentTeacherRatio, setInputStudentTeacherRatio] = useState<number>(28);
  const [inputParentResponseHours, setInputParentResponseHours] = useState<number>(34);
  const [inputRetrainingHours, setInputRetrainingHours] = useState<number>(12);
  const [inputPlanningHours, setInputPlanningHours] = useState<number>(4);
  const [inputProjectUnits, setInputProjectUnits] = useState<number>(1);

  // Questionnaire responses state
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers || {
    'ew_1_leader': 3, 'ew_1_teacher': 3, 'ew_1_parent': 3, 'ew_1_student': 3,
    'ew_2_leader': 4, 'ew_2_teacher': 4, 'ew_2_parent': 3, 'ew_2_student': 4,
    'ew_3_leader': 3, 'ew_3_teacher': 3, 'ew_3_parent': 2, 'ew_3_student': 3,
    'ew_4_leader': 3, 'ew_4_teacher': 3, 'ew_4_parent': 3, 'ew_4_student': 3,
    'ew_5_leader': 2, 'ew_5_teacher': 2, 'ew_5_parent': 3, 'ew_5_student': 3,
    'ew_6_leader': 4, 'ew_6_teacher': 4, 'ew_6_parent': 4, 'ew_6_student': 4,
    'ew_7_leader': 4, 'ew_7_teacher': 4, 'ew_7_parent': 4, 'ew_7_student': 5,
    'ew_8_leader': 3, 'ew_8_teacher': 3, 'ew_8_parent': 3, 'ew_8_student': 3,
    'ew_9_leader': 4, 'ew_9_teacher': 4, 'ew_9_parent': 3, 'ew_9_student': 4,
    'ew_10_leader': 3, 'ew_10_teacher': 3, 'ew_10_parent': 3, 'ew_10_student': 3,
    'ew_11_leader': 3, 'ew_11_teacher': 3, 'ew_11_parent': 3, 'ew_11_student': 3,
    'ew_12_leader': 2, 'ew_12_teacher': 2, 'ew_12_parent': 2, 'ew_12_student': 3,
    'ew_13_leader': 4, 'ew_13_teacher': 4, 'ew_13_parent': 4, 'ew_13_student': 4,
    'ew_14_leader': 3, 'ew_14_teacher': 3, 'ew_14_parent': 3, 'ew_14_student': 4,
  });

  // Track simulated stakeholders
  const [answeredStakeholders, setAnsweredStakeholders] = useState<{
    leader: boolean;
    teacher: boolean;
    parent: boolean;
    student: boolean;
    admin: boolean;
    other: boolean;
  }>({
    leader: !!initialAnswers,
    teacher: !!initialAnswers,
    parent: !!initialAnswers,
    student: !!initialAnswers,
    admin: !!initialAnswers,
    other: !!initialAnswers,
  });

  const markStakeholderAnswered = (st: 'leader' | 'teacher' | 'parent' | 'student' | 'admin' | 'other') => {
    setAnsweredStakeholders(prev => ({ ...prev, [st]: true }));
  };

  // Track deployment and collection workflow for Step 3 Wizard
  const [isAssessmentDeployed, setIsAssessmentDeployed] = useState<boolean>(!isStep3Wizard);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  
  // Data checkpoints checklist
  const [confirmedCheckpoints, setConfirmedCheckpoints] = useState<{
    boardAffiliation: boolean;
    teacherAttendance: boolean;
    academicResults: boolean;
    infrastructureSafety: boolean;
  }>({
    boardAffiliation: !!initialAnswers,
    teacherAttendance: !!initialAnswers,
    academicResults: !!initialAnswers,
    infrastructureSafety: !!initialAnswers,
  });

  // Active Stakeholder survey being manually completed
  const [activeSurveyStakeholder, setActiveSurveyStakeholder] = useState<'leader' | 'teacher' | 'parent' | 'student' | 'admin' | 'other' | null>(null);
  const [surveyExpressMode, setSurveyExpressMode] = useState<boolean>(false);
  const [surveyBilingualMode, setSurveyBilingualMode] = useState<boolean>(false);
  const [surveyQualitativeFeedback, setSurveyQualitativeFeedback] = useState<string>('');
  const [surveyReadingQId, setSurveyReadingQId] = useState<string | null>(null);
  const [manualRespondent, setManualRespondent] = useState({
    fullName: '',
    contactNumber: '',
    email: '',
    schoolName: '',
    board: '',
    city: '',
    classGrade: '',
    sectionDept: ''
  });
  const [manualDpdpConsent, setManualDpdpConsent] = useState<boolean>(true);

  const areAllStakeholdersAnswered = answeredStakeholders.leader && answeredStakeholders.teacher && answeredStakeholders.parent && answeredStakeholders.student && answeredStakeholders.admin && answeredStakeholders.other;
  const areCheckpointsVerified = confirmedCheckpoints.boardAffiliation && confirmedCheckpoints.teacherAttendance && confirmedCheckpoints.academicResults && confirmedCheckpoints.infrastructureSafety;

  useEffect(() => {
    if (!activeSchool?.id) return;
    const unsub = onSnapshot(collection(db, `surveys_${activeSchool.id}`), (snap) => {
      snap.docChanges().forEach(change => {
        if (change.type === 'added' || change.type === 'modified') {
           const st = change.doc.id as 'leader' | 'teacher' | 'parent' | 'student' | 'admin' | 'other';
           const data = change.doc.data();
           if (data.answers) {
              setAnswers(prev => {
                const newAns = { ...prev };
                Object.keys(data.answers).forEach(k => {
                  newAns[`${k}_${st}`] = data.answers[k];
                });
                return newAns;
              });
              setAnsweredStakeholders(prev => ({ ...prev, [st]: true }));
           }
        }
      });
    });
    return () => unsub();
  }, [activeSchool?.id]);



  useEffect(() => {
    if (activeSurveyStakeholder) {
      const currentQuestions = SURVEY_QUESTIONS[activeSurveyStakeholder].questions;
      const initialTemps: Record<string, number> = {};
      currentQuestions.forEach(q => {
        initialTemps[q.id] = answers[q.id] || 4;
      });
      setTemporaryAnswers(initialTemps);
      setManualRespondent({
        fullName: '',
        contactNumber: '',
        email: '',
        schoolName: activeSchool?.name || '',
        board: activeSchool?.board || 'CBSE',
        city: activeSchool?.city || '',
        classGrade: '',
        sectionDept: ''
      });
      setManualDpdpConsent(true);
    }
  }, [activeSurveyStakeholder, activeSchool]);

  const handleDeployAssessment = () => {
    setIsDeploying(true);
    setDeploymentLogs([]);
    
    const logs = [
      "Initializing secure DPDP Act 2023 compliance framing...",
      "Generating secure, unique questionnaire dispatch URLs...",
      "Mapping 14 EWISR parameters with school's regional baselines...",
      "Configuring passive sentiment crawler for competitive benchmarks...",
      "Deploying digital student, teacher, and parent portal instances...",
      "Assessment System successfully deployed! Channels online."
    ];
    
    let currentLog = 0;
    const interval = setInterval(() => {
      if (currentLog < logs.length) {
        setDeploymentLogs(prev => [...prev, logs[currentLog]]);
        currentLog++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsDeploying(false);
          setIsAssessmentDeployed(true);
        }, 600);
      }
    }, 450);
  };

  const handleSurveySubmit = async (st: 'leader' | 'teacher' | 'parent' | 'student' | 'admin' | 'other', ratings: Record<string, number>) => {
    const newAnswers = { ...answers };
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};

    Object.entries(ratings).forEach(([key, val]) => {
      const qConfig = SURVEY_QUESTIONS[st].questions.find(q => q.id === key) as any;
      const actualId = (qConfig && qConfig.id_actual) ? qConfig.id_actual : key;
      if (!sums[actualId]) {
        sums[actualId] = 0;
        counts[actualId] = 0;
      }
      sums[actualId] += val;
      counts[actualId] += 1;
    });

    const avgMap: Record<string, number> = {};
    Object.keys(sums).forEach(actualId => {
      const avgScore = Math.round((sums[actualId] / counts[actualId]) * 10) / 10;
      newAnswers[`${actualId}_${st}`] = avgScore;
      avgMap[actualId] = avgScore;
    });

    setAnswers(newAnswers);
    dimensions.forEach(dim => {
      updateDimensionScore(dim.id, newAnswers);
    });

    // Save to Firestore if school ID is present
    if (activeSchool?.id) {
      try {
        await setDoc(doc(db, `surveys_${activeSchool.id}`, st), {
          answers: avgMap,
          rawAnswers: ratings,
          qualitativeFeedback: surveyQualitativeFeedback.trim(),
          respondent: {
            fullName: manualRespondent.fullName.trim() || 'Internal School Assessor',
            contactNumber: manualRespondent.contactNumber.trim() || 'N/A',
            email: manualRespondent.email.trim() || 'N/A',
            schoolName: manualRespondent.schoolName.trim() || activeSchool.name,
            board: manualRespondent.board.trim() || activeSchool.board || 'CBSE',
            city: manualRespondent.city.trim() || activeSchool.city,
            classGrade: manualRespondent.classGrade.trim(),
            sectionDept: manualRespondent.sectionDept.trim()
          },
          dpdpConsent: manualDpdpConsent,
          dpdpConsentTimestamp: new Date().toISOString(),
          modeUsed: surveyExpressMode ? 'express' : 'full_diagnostic',
          submittedAt: new Date().toISOString()
        }, { merge: true });

        const subId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const subRecord = {
          id: subId,
          schoolId: activeSchool.id,
          schoolName: manualRespondent.schoolName.trim() || activeSchool.name,
          board: manualRespondent.board.trim() || activeSchool.board || 'CBSE',
          city: manualRespondent.city.trim() || activeSchool.city,
          stakeholder: st,
          stakeholderLabel: SURVEY_QUESTIONS[st]?.title || st,
          respondent: {
            fullName: manualRespondent.fullName.trim() || 'Internal School Assessor',
            contactNumber: manualRespondent.contactNumber.trim() || 'N/A',
            email: manualRespondent.email.trim() || 'N/A',
            schoolName: manualRespondent.schoolName.trim() || activeSchool.name,
            board: manualRespondent.board.trim() || activeSchool.board || 'CBSE',
            city: manualRespondent.city.trim() || activeSchool.city,
            classGrade: manualRespondent.classGrade.trim(),
            sectionDept: manualRespondent.sectionDept.trim()
          },
          rawAnswers: ratings,
          calculatedScores: avgMap,
          qualitativeFeedback: surveyQualitativeFeedback.trim(),
          dpdpConsent: manualDpdpConsent,
          dpdpConsentTimestamp: new Date().toISOString(),
          modeUsed: surveyExpressMode ? 'express' : 'full_diagnostic',
          submittedAt: new Date().toISOString()
        };

        await setDoc(doc(db, `surveys_${activeSchool.id}_submissions`, subId), subRecord);

        // Local cache write
        try {
          const lKey = `disha_submissions_${activeSchool.id}`;
          const current = JSON.parse(localStorage.getItem(lKey) || '[]');
          localStorage.setItem(lKey, JSON.stringify([subRecord, ...current]));
        } catch (e) {}

      } catch (err) {
        console.warn("Could not save survey doc to firestore:", err);
      }
    }
    
    markStakeholderAnswered(st);
    setActiveSurveyStakeholder(null);
  };

  // Website latency scanner simulation state
  const [websiteUrl, setWebsiteUrl] = useState<string>('https://vasantvihar.edu.in');
  const [webScanProgress, setWebScanProgress] = useState<string[]>([]);
  const [isScanningWeb, setIsScanningWeb] = useState<boolean>(false);
  const [webScanResult, setWebScanResult] = useState<{
    speedIndex: number;
    fcp: string;
    seoScore: number;
    mobileFriendly: boolean;
    brokenLinks: number;
    infoPresence: 'Excellent' | 'Incomplete' | 'Poor';
    verdict: string;
  } | null>(null);

  // Google Maps Sentiment Scraper state
  const [googleBusinessName, setGoogleBusinessName] = useState<string>('Vasant Vihar Public School, Mumbai');
  const [isScrapingMaps, setIsScrapingMaps] = useState<boolean>(false);
  const [scrapingProgress, setScrapingProgress] = useState<string[]>([]);
  const [mapsResult, setMapsResult] = useState<{
    rating: number;
    totalReviews: number;
    positiveSentiment: number; // %
    negativeSentiment: number; // %
    keywordsPositive: string[];
    keywordsNegative: string[];
    sampleReviews: { author: string; rating: number; text: string; date: string; sentiment: 'positive' | 'negative' }[];
  } | null>(null);

  // Document scanning simulation state
  const [scanningDocType, setScanningDocType] = useState<string | null>(null);
  const [isScanningDoc, setIsScanningDoc] = useState<boolean>(false);
  const [docScanProgress, setDocScanProgress] = useState<string[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<{
    type: string;
    fileName: string;
    extractedMetrics: string;
    verifiedOn: string;
    scoreBoost: number;
    impactedDimension: string;
  }[]>([]);

  // Simulation parameters
  const [selectedSimDimensionId, setSelectedSimDimensionId] = useState<string>('ew_12');
  const [simulationTarget, setSimulationTarget] = useState<number>(85);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [solverResult, setSolverResult] = useState<{
    success: boolean;
    confidenceTier: 'Tier A' | 'Tier B' | 'Tier C';
    precedentSchool: string;
    precedentDetails: string;
    requiredInputs: { factor: string; current: string; required: string; sensitivity: 'High' | 'Medium' }[];
    honestWarning: string;
  } | null>(null);

  // General state
  const [isSavingScorecard, setIsSavingScorecard] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Multi-stakeholder dispatch link state
  const [dispatchStatus, setDispatchStatus] = useState<{ [key: string]: boolean }>({});
  const [simulateStakeholderLoading, setSimulateStakeholderLoading] = useState<string | null>(null);

  // Active Dimension Object
  const activeDim = dimensions.find(d => d.id === selectedDimensionId) || dimensions[0];

  // Recalculate dimension score based on stakeholder survey and manual metrics overrides
  const handleAnswerChange = (dimId: string, stakeholder: string, val: number) => {
    const key = `${dimId}_${stakeholder}`;
    const newAnswers = { ...answers, [key]: val };
    setAnswers(newAnswers);
    updateDimensionScore(dimId, newAnswers);
    if (['leader', 'teacher', 'parent', 'student'].includes(stakeholder)) {
      markStakeholderAnswered(stakeholder as any);
    }
  };

  const updateDimensionScore = (dimId: string, currentAnswers = answers) => {
    const allStakeholders = ['leader', 'teacher', 'parent', 'student', 'admin', 'other'];
    const validRatings = allStakeholders
      .map(st => currentAnswers[`${dimId}_${st}`])
      .filter(rating => rating !== undefined && rating !== null) as number[];

    const sum = validRatings.reduce((acc, r) => acc + r, 0);
    // Default to a middle rating if no one has answered
    const averageRating = validRatings.length > 0 ? sum / validRatings.length : 3;
    let baseScore = Math.round(50 + (averageRating - 1) * 12.5); // 50 to 100 range

    // Merge manual operational metric inputs to the specific dimensions
    if (dimId === 'ew_8') { // Individualized Attention
      // Ideal student-teacher ratio is 11. Over 30 is poor.
      const ratioScore = Math.max(40, 100 - (inputStudentTeacherRatio - 11) * 2.5);
      baseScore = Math.round((baseScore + ratioScore) / 2);
    } else if (dimId === 'ew_12') { // Parental Involvement
      // Ideal response lag is 12 hours. 48 hours is poor.
      const responseScore = Math.max(45, 100 - (inputParentResponseHours - 12) * 1.5);
      baseScore = Math.round((baseScore + responseScore) / 2);
    } else if (dimId === 'ew_1') { // Competence of Faculty
      // Ideal retrain is 24 hours.
      const retrainScore = Math.min(100, 60 + (inputRetrainingHours / 24) * 40);
      baseScore = Math.round((baseScore + retrainScore) / 2);
    } else if (dimId === 'ew_5') { // Teacher Welfare
      // Ideal planning time is 8 hours.
      const planningScore = Math.min(100, 50 + (inputPlanningHours / 8) * 50);
      baseScore = Math.round((baseScore + planningScore) / 2);
    } else if (dimId === 'ew_2') { // Curriculum & Pedagogy
      // Ideal projects per term is 3.
      const projectScore = Math.min(100, 60 + (inputProjectUnits / 3) * 40);
      baseScore = Math.round((baseScore + projectScore) / 2);
    }

    // Apply document boosts if any exist for this dimension
    const docBoost = uploadedDocs
      .filter(doc => doc.impactedDimension === dimId)
      .reduce((acc, doc) => acc + doc.scoreBoost, 0);

    const finalScore = Math.min(100, baseScore + docBoost);

    setDimensions(prev => prev.map(d => {
      if (d.id === dimId) {
        // Return updated dimension scores
        let currentMetricValue = d.associatedInputMetricValue;
        if (dimId === 'ew_8') currentMetricValue = `1:${inputStudentTeacherRatio}`;
        else if (dimId === 'ew_12') currentMetricValue = `${inputParentResponseHours} Hours`;
        else if (dimId === 'ew_1') currentMetricValue = `${inputRetrainingHours} Hours`;
        else if (dimId === 'ew_5') currentMetricValue = `${inputPlanningHours} Hours`;
        else if (dimId === 'ew_2') currentMetricValue = `${inputProjectUnits} Units`;

        return { 
          ...d, 
          baselineScore: finalScore,
          associatedInputMetricValue: currentMetricValue,
          dataLevel: docBoost > 0 ? 'Tier A (Hard Verified)' : d.dataLevel 
        };
      }
      return d;
    }));
  };

  // Run Website Speed Crawl
  const runWebsiteCrawl = () => {
    setIsScanningWeb(true);
    setWebScanResult(null);
    setWebScanProgress([]);

    const logSteps = [
      `Resolving DNS record for ${websiteUrl.replace('https://', '')}...`,
      `Pinging global CDNs & caching structures...`,
      `Measuring First Contentful Paint (FCP) over simulated 4G mobile carrier...`,
      `Crawling meta headers, robots.txt, and SEO descriptions...`,
      `Analyzing mobile layout safety, typography sizes, and viewport scale...`,
      `Audit completed! Formulating Lighthouse score and digital reputation impact...`
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < logSteps.length) {
        setWebScanProgress(prev => [...prev, logSteps[stepIdx]]);
        stepIdx++;
      } else {
        clearInterval(interval);
        setIsScanningWeb(false);
        const isVasant = websiteUrl.toLowerCase().includes('vasant');
        const results = {
          speedIndex: isVasant ? 4.8 : 1.9,
          fcp: isVasant ? '3.2s' : '1.1s',
          seoScore: isVasant ? 72 : 94,
          mobileFriendly: isVasant ? false : true,
          brokenLinks: isVasant ? 8 : 0,
          infoPresence: (isVasant ? 'Incomplete' : 'Excellent') as 'Incomplete' | 'Excellent',
          verdict: isVasant 
            ? 'Slow mobile load speed (3.2s FCP) & missing syllabus pages are causing parent frustration, which drags down Parental Involvement and Reputation scores.'
            : 'Excellent modern performance! Fast mobile loading (1.1s FCP) & visible syllabus maps raise Parent Trust.'
        };
        setWebScanResult(results);

        // Adjust Curriculum & Pedagogy + Reputation scores based on web scan
        setDimensions(prev => prev.map(d => {
          if (d.id === 'ew_2') {
            const mod = isVasant ? -5 : 4;
            return { ...d, baselineScore: Math.min(100, Math.max(50, d.baselineScore + mod)) };
          }
          if (d.id === 'ew_3') {
            const mod = isVasant ? -4 : 5;
            return { ...d, baselineScore: Math.min(100, Math.max(50, d.baselineScore + mod)) };
          }
          return d;
        }));
      }
    }, 600);
  };

  // Run Google Maps sentiment scraper
  const runGoogleScraper = () => {
    setIsScrapingMaps(true);
    setMapsResult(null);
    setScrapingProgress([]);

    const logSteps = [
      `Initializing headless scraper for Google Maps API...`,
      `Retrieving CID matching "${googleBusinessName}"...`,
      `Scraping 54 active review headers and text bodies...`,
      `Running NLP sentiment clustering on review corpus...`,
      `Classifying feedback categories: Faculty, Facilities, Fees, Unresponsiveness...`,
      `Scrape successful! Parent Sentiment Model generated.`
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < logSteps.length) {
        setScrapingProgress(prev => [...prev, logSteps[stepIdx]]);
        stepIdx++;
      } else {
        clearInterval(interval);
        setIsScrapingMaps(false);

        const ratingVal = googleBusinessName.toLowerCase().includes('vasant') ? 3.4 : 4.6;
        const results = {
          rating: ratingVal,
          totalReviews: 54,
          positiveSentiment: ratingVal < 4 ? 62 : 91,
          negativeSentiment: ratingVal < 4 ? 38 : 9,
          keywordsPositive: ratingVal < 4 
            ? ['Dedicated teachers', 'Safe school bus', 'Spacious ground']
            : ['Outstanding board scores', 'Brilliant sports coaches', 'Extremely professional management', 'Supportive principal'],
          keywordsNegative: ratingVal < 4 
            ? ['Unresponsive administration desk', 'High transport extra charges', 'Too many physical diaries', 'Math syllabus lagging']
            : ['Strict uniform compliance', 'PTM queues'],
          sampleReviews: ratingVal < 4 ? [
            { author: 'Meenakshi Sharma', rating: 2, text: 'The teachers are very good, but the administrative desk never answers our questions. We keep getting conflicting information regarding fee dues.', date: '3 weeks ago', sentiment: 'negative' as const },
            { author: 'Ramesh Chawla', rating: 4, text: 'Classroom infrastructure is top-notch. Science labs are well equipped. Good sports program.', date: '1 month ago', sentiment: 'positive' as const },
            { author: 'Vikram Joshi', rating: 2, text: 'Math and science portions are lagging, and communication on WhatsApp is overwhelming! Hard to get structured answers.', date: '2 months ago', sentiment: 'negative' as const }
          ] : [
            { author: 'Amit Saxena', rating: 5, text: 'Absolute premium school. My daughter is studying here and the care they take of individual academic retention is commendable.', date: '2 days ago', sentiment: 'positive' as const },
            { author: 'Priyanka Sen', rating: 5, text: 'Great alumni mentoring and wonderful sports fields. Highly recommended.', date: '2 weeks ago', sentiment: 'positive' as const }
          ]
        };
        setMapsResult(results);

        // Adjust Parental Involvement & Reputation scores
        setDimensions(prev => prev.map(d => {
          if (d.id === 'ew_12') { // parental involvement
            const updatedScore = ratingVal < 4 ? Math.max(50, d.baselineScore - 6) : Math.min(100, d.baselineScore + 6);
            return { ...d, baselineScore: updatedScore };
          }
          if (d.id === 'ew_3') { // academic reputation
            const updatedScore = ratingVal < 4 ? Math.max(50, d.baselineScore - 4) : Math.min(100, d.baselineScore + 5);
            return { ...d, baselineScore: updatedScore };
          }
          return d;
        }));
      }
    }, 600);
  };

  // Simulate Document Scans
  const handleDocScan = (type: string) => {
    setScanningDocType(type);
    setIsScanningDoc(true);
    setDocScanProgress([]);

    const docMetaMap: Record<string, { fileName: string; dimensionId: string; boost: number; metrics: string }> = {
      'faculty': { 
        fileName: 'Faculty_Registrations_CBSE_2026.pdf', 
        dimensionId: 'ew_1', 
        boost: 8, 
        metrics: '94.2% certified post-graduate teachers, 12 years avg tenure, 1:28 student-to-teacher ratio' 
      },
      'safety': { 
        fileName: 'Fire_Safety_License_MGC_Mumbai.pdf', 
        dimensionId: 'ew_7', 
        boost: 10, 
        metrics: 'Municipal Corporation certified fire exits, functional digital CCTV logging, quarterly safety drills approved' 
      },
      'lesson': { 
        fileName: 'Syllabus_Progress_Cohort_Grade10_12.pdf', 
        dimensionId: 'ew_2', 
        boost: 6, 
        metrics: 'Grade 10 math & physics portions completely synchronized with national boards, zero remedial delay logs' 
      },
      'finance': { 
        fileName: 'Annual_Surplus_Financial_Audit_2025_26.xlsx', 
        dimensionId: 'ew_14', 
        boost: 7, 
        metrics: '42% tuition fee reinvested directly in classroom smart boards, average teacher salary exceeds district scale by 15%' 
      }
    };

    const activeDoc = docMetaMap[type];
    const steps = [
      `Uploading file "${activeDoc.fileName}" to secure diagnostic bucket...`,
      `Checking digital signatures and official authority watermarks...`,
      `Scanning text fields & structures with OCR parsing agent...`,
      `Extracting verified parameters: ${activeDoc.metrics}...`,
      `Document verification successful! Score boosted.`
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < steps.length) {
        setDocScanProgress(prev => [...prev, steps[idx]]);
        idx++;
      } else {
        clearInterval(interval);
        setIsScanningDoc(false);
        setScanningDocType(null);

        // Add to uploaded docs listing
        const newDoc = {
          type,
          fileName: activeDoc.fileName,
          extractedMetrics: activeDoc.metrics,
          verifiedOn: new Date().toLocaleDateString(),
          scoreBoost: activeDoc.boost,
          impactedDimension: activeDoc.dimensionId
        };
        
        // Prevent duplicate boosts
        if (!uploadedDocs.some(d => d.type === type)) {
          setUploadedDocs(prev => [...prev, newDoc]);
          setDimensions(prev => prev.map(d => {
            if (d.id === activeDoc.dimensionId) {
              return {
                ...d,
                baselineScore: Math.min(100, d.baselineScore + activeDoc.boost),
                dataLevel: 'Tier A (Hard Verified)'
              };
            }
            return d;
          }));
        }
      }
    }, 600);
  };

  // Dispatch survey to stakeholders
  const dispatchSurvey = (stakeholder: string) => {
    setDispatchStatus(prev => ({ ...prev, [stakeholder]: true }));
    setTimeout(() => {
      setDispatchStatus(prev => ({ ...prev, [stakeholder]: false }));
      alert(`DPDP Act 2023 Consent Flow Triggered: Survey link securely dispatched to ${stakeholder} database contacts via encrypted SMS & WhatsApp channels.`);
    }, 800);
  };

  // Simulated stakeholder response entry
  const simulateStakeholderResponse = (stakeholder: 'leader' | 'teacher' | 'parent' | 'student' | 'admin' | 'other') => {
    setSimulateStakeholderLoading(stakeholder);
    setTimeout(() => {
      const newAnswers = { ...answers };
      const sums: Record<string, number> = {};
      const counts: Record<string, number> = {};

      SURVEY_QUESTIONS[stakeholder].questions.forEach(q => {
        const actualId = q.id_actual || q.id;
        const score = Math.floor(Math.random() * 2) + 4; // 4 or 5
        if (!sums[actualId]) {
          sums[actualId] = 0;
          counts[actualId] = 0;
        }
        sums[actualId] += score;
        counts[actualId] += 1;
      });

      Object.keys(sums).forEach(actualId => {
        newAnswers[`${actualId}_${stakeholder}`] = Math.round((sums[actualId] / counts[actualId]) * 10) / 10;
      });

      setAnswers(newAnswers);
      dimensions.forEach(dim => {
        updateDimensionScore(dim.id, newAnswers);
      });
      markStakeholderAnswered(stakeholder);
      setSimulateStakeholderLoading(null);
    }, 750);
  };

  const bulkSimulateAll = () => {
    setSimulateStakeholderLoading('leader');
    setTimeout(() => {
      const newAnswers = { ...answers };
      const stakeholders: ('leader' | 'teacher' | 'parent' | 'student' | 'admin' | 'other')[] = ['leader', 'teacher', 'parent', 'student', 'admin', 'other'];

      stakeholders.forEach(st => {
        const sums: Record<string, number> = {};
        const counts: Record<string, number> = {};
        SURVEY_QUESTIONS[st].questions.forEach(q => {
          const actualId = q.id_actual || q.id;
          const score = Math.floor(Math.random() * 2) + 4;
          if (!sums[actualId]) {
            sums[actualId] = 0;
            counts[actualId] = 0;
          }
          sums[actualId] += score;
          counts[actualId] += 1;
        });
        Object.keys(sums).forEach(actualId => {
          newAnswers[`${actualId}_${st}`] = Math.round((sums[actualId] / counts[actualId]) * 10) / 10;
        });
      });

      setAnswers(newAnswers);
      dimensions.forEach(dim => {
        updateDimensionScore(dim.id, newAnswers);
      });
      setAnsweredStakeholders({
        leader: true,
        teacher: true,
        parent: true,
        student: true,
        admin: true,
        other: true
      });
      setConfirmedCheckpoints({
        boardAffiliation: true,
        teacherAttendance: true,
        academicResults: true,
        infrastructureSafety: true
      });
      setSimulateStakeholderLoading(null);
    }, 800);
  };

  // Stage 3 Solver: Reverse Outcome Engine
  const runReverseSolver = () => {
    setIsSolving(true);
    setSolverResult(null);

    setTimeout(() => {
      setIsSolving(false);
      
      const currentDim = dimensions.find(d => d.id === selectedSimDimensionId);
      if (!currentDim) return;

      let result: {
        success: boolean;
        confidenceTier: 'Tier A' | 'Tier B' | 'Tier C';
        precedentSchool: string;
        precedentDetails: string;
        requiredInputs: { factor: string; current: string; required: string; sensitivity: 'High' | 'Medium' }[];
        honestWarning: string;
      } = {
        success: true,
        confidenceTier: 'Tier A',
        precedentSchool: 'The Riverside School, Ahmedabad',
        precedentDetails: 'Achieved top 1% national ratings by establishing tight parent SLA and student-led circle congloms.',
        requiredInputs: [],
        honestWarning: ''
      };

      if (selectedSimDimensionId === 'ew_12') { // Parental Involvement
        result.requiredInputs = [
          { factor: 'Average Parent Response Time', current: `${inputParentResponseHours} Hours`, required: 'Under 10–12 Hours', sensitivity: 'High' },
          { factor: 'PTA Communication Channels', current: 'Split across 3 channels (Diaries, SMS, unofficial groups)', required: 'Unified Single Primary Channel (e.g. Dedicated Portal / WhatsApp SLA)', sensitivity: 'High' },
          { factor: 'Weekly Student Performance Updates', current: 'Monthly report cards only', required: 'Active automated weekly pulse updates', sensitivity: 'Medium' }
        ];
        result.precedentSchool = 'The Riverside School (Ahmedabad)';
        result.precedentDetails = 'Runs active Parent Partnership as one of its 6 main pillars, ensuring response times under 12 hours.';
        result.confidenceTier = 'Tier A';
        result.honestWarning = 'Disconfirming Case Alert: Nearby School X established a fast response-time SLA but neglected actual complaint resolution, resulting in continued parent dissatisfaction. Ensure communication speed is paired with executive grievance resolution.';
      } else if (selectedSimDimensionId === 'ew_8') { // Individual Attention
        result.requiredInputs = [
          { factor: 'Student-to-Teacher Ratio', current: `1:${inputStudentTeacherRatio}`, required: 'Between 1:11 to 1:15', sensitivity: 'High' },
          { factor: 'Special Needs Department Support', current: 'Informal coaching after hours', required: 'Formal, certified Special Needs department integration', sensitivity: 'High' },
          { factor: 'Customized Remedial Pacing Tracks', current: 'Standard single-pace lectures', required: 'Structured early academic gap flag triggers', sensitivity: 'Medium' }
        ];
        result.precedentSchool = 'The Shri Ram School, Delhi';
        result.precedentDetails = 'Runs a low 11:1 ratio with an inclusion department active since 1997, ensuring no child falls behind.';
        result.confidenceTier = 'Tier A';
        result.honestWarning = 'Disconfirming Case Alert: School Y lowered its ratio to 15:1 but did not train teachers in early differentiation strategies, yielding no change in baseline remedial tracking. Ratio reduction requires pedagogical retraining.';
      } else if (selectedSimDimensionId === 'ew_5') { // Teacher Welfare
        result.requiredInputs = [
          { factor: 'Uninterrupted Weekly Planning Time', current: `${inputPlanningHours} Hours`, required: 'At least 8 Hours uninterrupted', sensitivity: 'High' },
          { factor: 'Professional Retraining Retargeting', current: `${inputRetrainingHours} Hours/Yr`, required: 'Minimum 24–30 Hours/Yr retrained', sensitivity: 'High' },
          { factor: 'Administrative Task Overload', current: 'Manual attendance and diary updates', required: '100% automated school operational dashboards', sensitivity: 'Medium' }
        ];
        result.precedentSchool = 'Rishi Valley School, AP';
        result.precedentDetails = 'Treats teacher retention as a core product, offering 10+ hours weekly planning time and dedicated housing welfare.';
        result.confidenceTier = 'Tier B';
        result.honestWarning = 'Disconfirming Case Alert: School Z increased planning hours but did not audit the admin workload, leading teachers to use planning slots for basic data entry. Automate admin chores first.';
      } else {
        // Generic dynamic solver
        result.requiredInputs = [
          { factor: `${currentDim.associatedMetricName}`, current: `${currentDim.associatedInputMetricValue}`, required: `Optimized Range: ${currentDim.associatedIdealValue}`, sensitivity: 'High' },
          { factor: 'Strategic Audits Alignment', current: '1 manual audit per year', required: 'Bi-annual formal audits matching Indian reference schools', sensitivity: 'High' },
          { factor: 'Stakeholder Feedback Loop', current: 'Passive collection', required: 'Active automated pulse-triggers on secure database', sensitivity: 'Medium' }
        ];
        result.precedentSchool = 'Podar Education Network';
        result.precedentDetails = 'Employs a rigorous centralized review board matching high national compliance norms before any scaling occurs.';
        result.confidenceTier = 'Tier C';
        result.honestWarning = 'Disconfirming Case Alert: General sector trends show adjusting isolated parameters without committing to the centralized 14-dimension operating framework leads to localized failure.';
      }

      setSolverResult(result);
    }, 1200);
  };

  // Trigger spreadsheet CSV export
  const downloadSpreadsheet = () => {
    // Generate valid CSV payload
    const headers = ['Dimension ID', 'EWISR Dimension Name', 'Category Quadrant', 'School Local Score', 'National Ideal Benchmark', 'District Best Performer', 'Local Operational Metric', 'Target Ideal Metric Value', 'Validation Tier'];
    const rows = dimensions.map(d => [
      d.id,
      `"${d.name}"`,
      d.quadrant,
      d.baselineScore,
      d.benchmark,
      d.districtBest,
      `"${d.associatedInputMetricValue} ${d.associatedMetricName}"`,
      `"${d.associatedIdealValue}"`,
      d.dataLevel
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Disha_14_Dimension_EWISR_Audit_${activeSchool?.name || 'School'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Commit dimensions results to Firestore
  const saveCompleteScorecard = async () => {
    setIsSavingScorecard(true);
    setSaveStatus(null);
    try {
      const targetDocId = activeSchool?.id || 'sch_1';
      const timestamp = new Date().toISOString();
      const scorecardData = {
        schoolId: targetDocId,
        schoolName: activeSchool?.name || 'Vasant Vihar Public',
        updatedAt: timestamp,
        dimensions: dimensions.map(d => ({
          id: d.id,
          name: d.name,
          quadrant: d.quadrant,
          score: d.baselineScore,
          benchmark: d.benchmark,
          districtBest: d.districtBest,
          dataLevel: d.dataLevel,
          currentInputMetric: d.associatedInputMetricValue
        })),
        answers,
        reputationRating: mapsResult?.rating || 3.4,
        websiteFcp: webScanResult?.fcp || 'Unknown',
        verifiedDocsCount: uploadedDocs.length,
        complianceStatus: 'DPDP Act 2023 Compliant'
      };

      const docRef = doc(db, 'deep_dive_assessments', targetDocId);
      await setDoc(docRef, scorecardData);

      await addCommunication({
        title: `14-Dimension EWISR Health Audit Complete`,
        content: `RYL Global Academy has successfully completed its multilateral deep-dive health audit across all 14 parameters of the EWISR Framework. High-fidelity verification files and Google sentiment indices are stored in the secure database.`,
        sender: 'Disha Diagnostic Suite',
        timestamp: timestamp,
        recipientGroup: 'All Stakeholders'
      });

      setSaveStatus('Success! Full 14-dimension scorecard has been compiled and saved persistently to Firestore. Digital Quiet Watch is updated.');
      setTimeout(() => setActiveTab('compare'), 1500);
    } catch (e) {
      console.error(e);
      setSaveStatus('Error saving scorecard to Firestore.');
    } finally {
      setIsSavingScorecard(false);
    }
  };

  const getQuadrantAvg = (quad: 'Academic' | 'Welfare' | 'Individual' | 'Social') => {
    const quadDims = dimensions.filter(d => d.quadrant === quad);
    const sum = quadDims.reduce((acc, curr) => acc + curr.baselineScore, 0);
    return Math.round(sum / quadDims.length);
  };

  return (
    <div id="deep-dive-assessment-container" className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-16">
      
      {/* HEADER TITLE */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Cpu className="w-56 h-56 text-indigo-400 animate-pulse" />
        </div>
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full w-fit border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>3-STAGE SCHOOL HEALTH CHECK ENGINE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white">
            Disha Health Diagnostic Control Console
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
            Validate all <strong>14 EWISR dimensions</strong> modeled against India's elite academic benchmarks (The Shri Ram, Riverside, Rishi Valley, Podar). Use the tabs below to proceed in sequence.
          </p>
        </div>
      </div>

      {!isAssessmentDeployed ? (
        <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-sm space-y-8 animate-in fade-in zoom-in-95 duration-350">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-gray-100 pb-6">
            <div className="space-y-2 max-w-xl text-left">
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-indigo-150 uppercase tracking-widest flex items-center gap-1.5 w-fit">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                Deployment Pending
              </span>
              <h3 className="text-2xl font-black text-gray-900">🚀 Deploy 14-Dimension Assessment System</h3>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                To unlock the complete whole-school diagnostic report, you must first deploy the multilateral assessment engines. This will generate dynamic questionnaire links for all 4 stakeholder groups under DPDP Act 2023 compliance, enabling structured collection of verified inputs.
              </p>
            </div>
            
            <button
              onClick={handleDeployAssessment}
              disabled={isDeploying}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-8 py-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isDeploying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  Deploying Assessment System...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
                  Deploy Assessment System
                </>
              )}
            </button>
          </div>

          {isDeploying && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs text-indigo-300 space-y-2 h-[220px] overflow-y-auto flex flex-col justify-end text-left">
              <p className="text-[10px] text-gray-500 font-bold mb-auto border-b border-slate-800 pb-1.5">// SECURE DEPLOYMENT PROTOCOL ACTIVE</p>
              {deploymentLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-1.5 animate-in slide-in-from-left-2 duration-200">
                  <span className="text-indigo-500 font-bold">&gt;</span>
                  <p className="leading-relaxed font-semibold">{log}</p>
                </div>
              ))}
              <div className="flex items-center gap-1.5 pt-1 text-slate-500 text-[11px] font-bold">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                <span>Establishing pipeline links...</span>
              </div>
            </div>
          )}

          {!isDeploying && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "School Leader Questionnaire", desc: "Compliance, strategic academic audits, and teacher turnover parameters.", icon: Building, color: "text-purple-600 bg-purple-50" },
                { label: "Teacher Well-being & Stress", desc: "Weekly lesson planning allocations and professional retraining logs.", icon: Users, color: "text-emerald-600 bg-emerald-50" },
                { label: "Parent SLA & Communication", desc: "Query resolution times and satisfaction index monitoring.", icon: HeartPulse, color: "text-blue-600 bg-blue-50" },
                { label: "Student Digital Hygiene", desc: "Psychological well-being and safe tech adoption audits.", icon: GraduationCap, color: "text-amber-600 bg-amber-50" }
              ].map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div key={idx} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl shrink-0 ${item.color}`}>
                      <ItemIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left space-y-0.5">
                      <p className="text-xs font-black text-slate-900">{item.label}</p>
                      <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* THREE ENGINE STAGE TABS */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {[
              { id: 'capture', label: 'Stage 1: Capture', desc: 'Stakeholder Dispatch & Inputs', icon: Download },
              { id: 'compare', label: 'Stage 2: Compare', desc: 'Dual Benchmark Diagnostics', icon: Scale },
              { id: 'simulate', label: 'Stage 3: Simulate', desc: 'Reverse Outcome Engine', icon: Sliders }
            ].map(stage => {
              const isLocked = isStep3Wizard && stage.id !== 'capture';
              const isActive = activeTab === stage.id;
              const StageIcon = stage.icon;
              return (
                <button
                  id={`stage-tab-btn-${stage.id}`}
                  key={stage.id}
                  disabled={isLocked}
                  onClick={() => {
                    if (isLocked) return;
                    setActiveTab(stage.id as any);
                  }}
                  className={`p-3 rounded-xl transition-all text-left flex flex-col md:flex-row items-center gap-3 border ${
                    isActive 
                      ? 'bg-white text-indigo-950 border-indigo-200 shadow-sm font-black' 
                      : isLocked
                      ? 'border-transparent text-gray-300 cursor-not-allowed bg-gray-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    isActive 
                      ? 'bg-indigo-600 text-white' 
                      : isLocked
                      ? 'bg-gray-200 text-gray-400'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isLocked ? <Lock className="w-4 h-4 text-gray-400" /> : <StageIcon className="w-4 h-4" />}
                  </div>
                  <div className="text-center md:text-left">
                    <p className={`text-xs font-black uppercase tracking-wider ${isLocked ? 'text-gray-400' : ''}`}>
                      {stage.label} {isLocked && '🔒'}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold hidden md:block">
                      {isLocked ? 'Unlocked after Step 3 completion' : stage.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* CORE QUADRANTS OVERVIEW STATS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Academic Excellence', score: getQuadrantAvg('Academic'), color: 'text-indigo-600 border-indigo-100 bg-indigo-50/30' },
              { label: 'Welfare & Support', score: getQuadrantAvg('Welfare'), color: 'text-emerald-600 border-emerald-100 bg-emerald-50/30' },
              { label: 'Individual Attention', score: getQuadrantAvg('Individual'), color: 'text-amber-600 border-amber-100 bg-amber-50/30' },
              { label: 'Governance & Value', score: getQuadrantAvg('Social'), color: 'text-sky-600 border-sky-100 bg-sky-50/30' },
            ].map((q, idx) => {
              const isLocked = isStep3Wizard && !areAllStakeholdersAnswered;
              return (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs text-center sm:text-left space-y-1 relative overflow-hidden">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{q.label}</p>
                  <div className="flex items-baseline justify-center sm:justify-start gap-1">
                    <span className="text-3xl font-black text-slate-900">
                      {isLocked ? (
                        <span className="flex items-center gap-1 text-slate-400 text-xl font-bold">
                          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                          --
                        </span>
                      ) : (
                        q.score
                      )}
                    </span>
                    {!isLocked && <span className="text-gray-400 text-xs font-bold">/100</span>}
                  </div>
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full rounded-full ${isLocked ? 'bg-slate-200' : q.score < 70 ? 'bg-rose-500' : q.score < 82 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${isLocked ? 0 : q.score}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>

      {/* STAGE 1: CAPTURE PANEL */}
      {activeTab === 'capture' && (
        <div id="stage-capture-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
          
          {/* Left Side: Parameters dispatcher & inputs */}
          <div className="lg:col-span-8 space-y-6">

            {isStep3Wizard && (
              <div className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white p-5 rounded-2xl border border-indigo-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-300">
                    <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">14-Dimension Multilateral Survey Deployment Portal</h4>
                    <p className="text-[11px] text-slate-300 font-medium">Stage 1 of the 14-dimension EWISR diagnostic engine. All 4 stakeholder profiles must respond before building the final scorecard.</p>
                  </div>
                </div>

                {/* Stakeholders status indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-indigo-900/30 p-3 rounded-xl border border-indigo-800/40 text-center">
                  {[
                    { key: 'leader', label: 'School Leaders' },
                    { key: 'teacher', label: 'Teachers' },
                    { key: 'parent', label: 'Parents' },
                    { key: 'student', label: 'Students' }
                  ].map(sh => {
                    const isDone = answeredStakeholders[sh.key as 'leader' | 'teacher' | 'parent' | 'student'];
                    return (
                      <div key={sh.key} className="space-y-1 border-r border-indigo-800/20 last:border-0">
                        <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">{sh.label}</p>
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isDone ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-pulse'}`}></span>
                          <span className="text-[10px] font-black">{isDone ? 'COMPLETED' : 'PENDING'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <p className="text-[11px] text-slate-350 leading-normal max-w-md font-medium">
                    💡 <strong>Simulate in 1-Click:</strong> Use the <strong>"Bulk Simulate All Surveys"</strong> button to instantly generate high-fidelity mock responses for all stakeholders across all 14 dimensions.
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      onClick={bulkSimulateAll}
                      className="bg-indigo-600/10 hover:bg-indigo-650/20 text-indigo-300 text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all border border-indigo-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Bulk Simulate All Surveys
                    </button>
                    
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        disabled={!(areAllStakeholdersAnswered && areCheckpointsVerified)}
                        onClick={() => onCompleteStep3?.(dimensions, answers)}
                        className={`w-full sm:w-auto text-xs font-black px-6 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                          (areAllStakeholdersAnswered && areCheckpointsVerified)
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer animate-pulse"
                            : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 text-white" />
                        Compile & Lock Report
                      </button>
                      <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                        <span className="flex items-center gap-0.5">
                          {areAllStakeholdersAnswered ? "🟢" : "🔴"} Feedback: {Object.values(answeredStakeholders).filter(Boolean).length}/4
                        </span>
                        <span className="flex items-center gap-0.5">
                          {areCheckpointsVerified ? "🟢" : "🔴"} Checkpoints: {Object.values(confirmedCheckpoints).filter(Boolean).length}/4
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stakeholder Centralized Dispatch Link Box */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-5">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-indigo-600" />
                    Centralized Multilateral Dispatch Console
                  </h3>
                  <p className="text-[11px] text-gray-400 font-semibold">Deploy and distribute standard diagnostic questionnaires to all stakeholders under DPDP Act 2023.</p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded border border-emerald-100 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" /> Secure
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'leader', label: 'School Leaders', desc: 'Strategic compliance & CV audits', color: 'border-purple-100 bg-purple-50/10' },
                  { id: 'teacher', label: 'Teachers', desc: 'Retraining hours & workload stress', color: 'border-emerald-100 bg-emerald-50/10' },
                  { id: 'parent', label: 'Parents', desc: 'Response SLA & community feedback', color: 'border-blue-100 bg-blue-50/10' },
                  { id: 'student', label: 'Students', desc: 'Class ratio & digital safety hygiene', color: 'border-amber-100 bg-amber-50/10' },
                  { id: 'admin', label: 'Admin Staff', desc: 'Infrastructure SLA & budget', color: 'border-rose-100 bg-rose-50/10' },
                  { id: 'other', label: 'Others (Alumni)', desc: 'Community sentiment & integration', color: 'border-teal-100 bg-teal-50/10' }
                ].map(p => {
                  const isDone = answeredStakeholders[p.id as 'leader' | 'teacher' | 'parent' | 'student' | 'admin' | 'other'];
                  const isLoading = simulateStakeholderLoading === p.id;
                  return (
                    <div key={p.id} className={`p-3 rounded-xl border flex flex-col justify-between space-y-3 text-xs transition-all ${
                      isDone ? 'border-emerald-200 bg-emerald-50/10' : 'border-gray-200 bg-slate-50'
                    }`}>
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <p className="font-black text-gray-900 leading-tight">{p.label}</p>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                            isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {isDone ? 'COMPLETED' : 'AWAITING'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium leading-snug mt-1">{p.desc}</p>
                      </div>

                      <div className="space-y-1">
                        {isDone ? (
                          <button
                            onClick={() => {
                              setActiveSurveyStakeholder(p.id as any);
                              // Clear previously submitted state to re-answer
                              setAnsweredStakeholders(prev => ({ ...prev, [p.id]: false }));
                            }}
                            className="w-full bg-white hover:bg-slate-50 border border-gray-200 text-gray-700 py-1 rounded font-bold text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            ✏️ Re-Answer Survey
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setActiveSurveyStakeholder(p.id as any)}
                              className="w-full bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 py-1.5 rounded font-black text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              🗳️ Answer Survey
                            </button>
                            <div className="grid grid-cols-3 gap-1 pt-0.5">
                              <button 
                                onClick={() => {
                                  const url = `${window.location.origin}?survey=${p.id}&aid=${activeSchool?.id}`;
                                  window.open(`https://wa.me/?text=Please%20complete%20the%20${p.label}%20survey%20here:%20${encodeURIComponent(url)}`, '_blank');
                                }}
                                className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-1.5 rounded flex items-center justify-center cursor-pointer transition-colors" title="Share via WhatsApp">
                                <MessageCircle className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => {
                                  const url = `${window.location.origin}?survey=${p.id}&aid=${activeSchool?.id}`;
                                  window.open(`mailto:?subject=${p.label}%20Survey&body=Please%20complete%20the%20survey%20here:%20${encodeURIComponent(url)}`, '_blank');
                                }}
                                className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 py-1.5 rounded flex items-center justify-center cursor-pointer transition-colors" title="Share via Email">
                                <Mail className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => {
                                  const url = `${window.location.origin}?survey=${p.id}&aid=${activeSchool?.id}`;
                                  navigator.clipboard.writeText(url);
                                  alert(`Copied share link for ${p.label}: \n${url}`);
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 py-1.5 rounded flex items-center justify-center cursor-pointer transition-colors" title="Copy Link">
                                <Link2 className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => simulateStakeholderResponse(p.id as any)}
                              disabled={simulateStakeholderLoading !== null}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded font-black text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 mt-1"
                            >
                              {isLoading ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                "⚡ Auto-Simulate"
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Survey Questionnaire Form Card */}
              {activeSurveyStakeholder && (() => {
                const currentConfig = SURVEY_QUESTIONS[activeSurveyStakeholder];
                const allQs = currentConfig.questions;
                const questionsToRender = surveyExpressMode
                  ? allQs.filter((q: any, idx: number) => {
                      if (idx === 0) return true;
                      const prevQ = allQs[idx - 1];
                      return q.section && prevQ.section !== q.section;
                    })
                  : allQs;

                const tempVals = Object.values(temporaryAnswers);
                const isStraightLining = tempVals.length >= 5 && tempVals.every(v => v === tempVals[0]);

                const handleSpeakQuestion = (q: any) => {
                  if (!('speechSynthesis' in window)) {
                    alert("Text-to-speech is not supported in this browser.");
                    return;
                  }
                  window.speechSynthesis.cancel();
                  if (surveyReadingQId === q.id) {
                    setSurveyReadingQId(null);
                    return;
                  }
                  const textToRead = `${q.label || ''}. ${q.text}. Options are: ${q.options.map((o: any) => o.label).join('. ')}`;
                  const utterance = new SpeechSynthesisUtterance(textToRead);
                  utterance.rate = 0.95;
                  utterance.onend = () => setSurveyReadingQId(null);
                  utterance.onerror = () => setSurveyReadingQId(null);
                  setSurveyReadingQId(q.id);
                  window.speechSynthesis.speak(utterance);
                };

                let lastSectionName = '';

                return (
                  <div className="p-5 bg-slate-50 rounded-2xl border border-indigo-150 space-y-4 animate-in fade-in slide-in-from-top-3 duration-350 text-left">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div className="space-y-0.5">
                        <span className="bg-indigo-100 text-indigo-800 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded">
                          Active Diagnostic Questionnaire Form
                        </span>
                        <h4 className="font-extrabold text-sm text-gray-900">{currentConfig.title}</h4>
                        <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">{currentConfig.desc}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSurveyBilingualMode(!surveyBilingualMode)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            surveyBilingualMode 
                              ? 'bg-amber-400 text-indigo-950 shadow-xs' 
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                          title="Toggle Hindi Guidance"
                        >
                          <Languages className="w-3 h-3" />
                          <span>{surveyBilingualMode ? 'Hindi Help ON' : 'Bilingual'}</span>
                        </button>

                        <button
                          onClick={() => setSurveyExpressMode(!surveyExpressMode)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            surveyExpressMode 
                              ? 'bg-emerald-500 text-white shadow-xs' 
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                          title="Toggle Express Core vs Full Diagnostic"
                        >
                          <Zap className="w-3 h-3" />
                          <span>{surveyExpressMode ? 'Express 5-Q' : 'Full Diagnostic'}</span>
                        </button>

                        <button
                          onClick={() => setActiveSurveyStakeholder(null)}
                          className="text-gray-400 hover:text-gray-600 text-xs font-black p-1 ml-1"
                        >
                          ✕ Close
                        </button>
                      </div>
                    </div>

                    {/* STRAIGHTLINING BIAS NUDGE */}
                    {isStraightLining && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-[11px] text-amber-900">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-amber-950">Diagnostic Quality Alert</span>
                          Identical levels selected across all questions. Differentiating scores across operational areas ensures higher diagnostic report precision.
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {questionsToRender.map((q: any, idx: number) => {
                        const showSectionHeader = q.section && q.section !== lastSectionName;
                        if (q.section) lastSectionName = q.section;

                        return (
                          <div key={q.id} className="space-y-2">
                            {showSectionHeader && (
                              <div className="bg-slate-900 text-white px-3 py-2 rounded-xl flex items-center justify-between mt-4">
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
                                  {q.section}
                                </span>
                              </div>
                            )}

                            <div className="flex items-start justify-between gap-2 pt-1">
                              <div>
                                <p className="text-xs font-black text-gray-800 leading-tight">
                                  <span className="text-indigo-600 font-black mr-1">{q.label || `Q${idx + 1}`}:</span>
                                  {q.text}
                                </p>
                                {surveyBilingualMode && (
                                  <p className="text-[10px] text-indigo-700 font-medium bg-indigo-50/60 p-1.5 rounded-lg italic mt-1">
                                    हिंदी मार्गदर्शन: अपने स्कूल के व्यावहारिक अनुभव के आधार पर सही स्तर का चयन करें।
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={() => handleSpeakQuestion(q)}
                                className={`p-1.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
                                  surveyReadingQId === q.id 
                                    ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' 
                                    : 'bg-white hover:bg-indigo-50 text-slate-500 border-slate-200'
                                }`}
                                title="Read question aloud"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                              {q.options.map((opt: any) => {
                                const isSelected = temporaryAnswers[q.id] === opt.val;
                                return (
                                  <button
                                    key={opt.val}
                                    onClick={() => setTemporaryAnswers(prev => ({ ...prev, [q.id]: opt.val }))}
                                    className={`p-2.5 rounded-xl border text-left text-[11px] leading-relaxed transition-all flex items-center justify-between font-semibold cursor-pointer ${
                                      isSelected 
                                        ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 font-bold shadow-xs' 
                                        : 'border-gray-200 bg-white hover:bg-slate-50 text-gray-600'
                                    }`}
                                  >
                                    <span>{opt.label}</span>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                                      isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-150 text-gray-500'
                                    }`}>
                                      Score Value: {opt.val}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* QUALITATIVE FEEDBACK FIELD */}
                    <div className="pt-3 border-t border-slate-200 space-y-1">
                      <label className="block text-[11px] font-bold text-slate-800">
                        Optional Strategic Comments / Specific Observations
                      </label>
                      <textarea
                        value={surveyQualitativeFeedback}
                        onChange={(e) => setSurveyQualitativeFeedback(e.target.value)}
                        placeholder="Share any key highlight, concern, or priority improvement area for school management..."
                        className="w-full p-2.5 border border-slate-200 bg-white rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[60px]"
                      />
                    </div>

                    {/* RESPONDENT PERSONAL DETAILS & DPDP COMPLIANCE (MANUAL ASSESSOR ENTRY) */}
                    <div className="pt-3 border-t border-slate-200 space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-600" />
                          Respondent Profile & DPDP Compliance
                        </span>
                        <span className="text-[9px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150">
                          DPDP Act 2023 Verified
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div className="space-y-0.5">
                          <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" /> Full Name
                          </label>
                          <input
                            type="text"
                            value={manualRespondent.fullName}
                            onChange={(e) => setManualRespondent(prev => ({ ...prev, fullName: e.target.value }))}
                            placeholder="e.g. Dr. Sunita Sharma"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> Contact Number
                          </label>
                          <input
                            type="tel"
                            value={manualRespondent.contactNumber}
                            onChange={(e) => setManualRespondent(prev => ({ ...prev, contactNumber: e.target.value }))}
                            placeholder="e.g. +91 98765 00000"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> Email Address
                          </label>
                          <input
                            type="email"
                            value={manualRespondent.email}
                            onChange={(e) => setManualRespondent(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="e.g. contact@school.edu.in"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>

                        {/* School Name Auto-filled */}
                        <div className="space-y-0.5 sm:col-span-2 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-150">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-indigo-950 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-indigo-600" /> School Official Name
                            </label>
                            <span className="text-[9px] font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                              Auto-filled from Registration
                            </span>
                          </div>
                          <input
                            type="text"
                            readOnly
                            value={manualRespondent.schoolName || activeSchool?.name || ''}
                            className="w-full p-1.5 bg-white border border-indigo-200 rounded-lg text-xs font-bold text-indigo-950"
                          />
                        </div>

                        {/* Board & City */}
                        <div className="space-y-0.5 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100">
                          <label className="text-[10px] font-extrabold text-indigo-900 flex items-center gap-1">
                            <Award className="w-3 h-3 text-indigo-600" /> Board / Affiliation
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={manualRespondent.board || activeSchool?.board || 'CBSE'}
                            className="w-full p-1.5 bg-white border border-indigo-200 rounded-lg text-xs font-bold text-indigo-950"
                          />
                        </div>

                        <div className="space-y-0.5 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100">
                          <label className="text-[10px] font-extrabold text-indigo-900 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-indigo-600" /> City / Location
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={manualRespondent.city || activeSchool?.city || ''}
                            className="w-full p-1.5 bg-white border border-indigo-200 rounded-lg text-xs font-bold text-indigo-950"
                          />
                        </div>

                        {/* Stakeholder Specific Details: Class / Grade & Section / Department */}
                        <div className="space-y-0.5 bg-amber-50/60 p-2 rounded-xl border border-amber-200">
                          <label className="text-[10px] font-extrabold text-amber-950 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-amber-600" /> Class / Grade Level
                          </label>
                          <input
                            type="text"
                            value={manualRespondent.classGrade}
                            onChange={(e) => setManualRespondent(prev => ({ ...prev, classGrade: e.target.value }))}
                            placeholder="e.g. Grade 10 / Class 8"
                            className="w-full p-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-0.5 bg-amber-50/60 p-2 rounded-xl border border-amber-200">
                          <label className="text-[10px] font-extrabold text-amber-950 flex items-center gap-1">
                            <Layers className="w-3 h-3 text-amber-600" /> Section / Department
                          </label>
                          <input
                            type="text"
                            value={manualRespondent.sectionDept}
                            onChange={(e) => setManualRespondent(prev => ({ ...prev, sectionDept: e.target.value }))}
                            placeholder="e.g. Section A / Physics Dept"
                            className="w-full p-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="manualDpdpConsent"
                          checked={manualDpdpConsent}
                          onChange={(e) => setManualDpdpConsent(e.target.checked)}
                          className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <label htmlFor="manualDpdpConsent" className="text-[10px] font-bold text-slate-700 cursor-pointer select-none">
                          DPDP Act 2023 Consent Verified: Respondent agreed to collection for educational diagnostic analysis.
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 text-xs">
                      <button
                        onClick={() => setActiveSurveyStakeholder(null)}
                        className="bg-gray-150 hover:bg-gray-200 text-gray-700 font-extrabold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSurveySubmit(activeSurveyStakeholder, temporaryAnswers)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Submit Verified Answers
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* SCHOOL DATA HUB & SUB-COMPONENT DATABASE EXPLORER */}
            <SchoolDataHub activeSchool={activeSchool} />

            {/* Digital Data Online Collection */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="space-y-0.5 text-left">
                  <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-4.5 h-4.5 text-blue-600" />
                    Digital Data Online Collection
                  </h3>
                  <p className="text-[11px] text-gray-400 font-semibold">Provide public footprint links to ingest market sentiment, parent reviews, and brand presence.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-gray-700">
                <div className="space-y-1.5 text-left">
                  <label className="flex items-center gap-1">Official Website Link</label>
                  <div className="relative">
                    <input 
                      type="url" 
                      placeholder="https://www.yourschool.edu" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400 font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="flex items-center gap-1">Google Business Review Link</label>
                  <div className="relative">
                    <input 
                      type="url" 
                      placeholder="https://g.page/r/..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400 font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="flex items-center gap-1">Social Media Profile (FB/Insta)</label>
                  <div className="relative">
                    <input 
                      type="url" 
                      placeholder="https://instagram.com/yourschool" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Core Metrics Local Input Form */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Sliders className="w-4.5 h-4.5 text-indigo-600" />
                <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider">
                  Core School Operational Inputs
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1">
                    <span>Student-Teacher Ratio (Core Subject)</span>
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400" title="Shri Ram standard is 11:1" />
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={inputStudentTeacherRatio}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 20;
                        setInputStudentTeacherRatio(val);
                        setTimeout(() => updateDimensionScore('ew_8'), 100);
                      }}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 font-bold text-gray-800"
                    />
                    <span className="text-gray-400 shrink-0 font-extrabold">Students/Staff</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1">
                    <span>Parent Query Response SLA (Hours)</span>
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400" title="Riverside standard is <12 hours" />
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={inputParentResponseHours}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 24;
                        setInputParentResponseHours(val);
                        setTimeout(() => updateDimensionScore('ew_12'), 100);
                      }}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 font-bold text-gray-800"
                    />
                    <span className="text-gray-400 shrink-0 font-extrabold">Hours</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1">
                    <span>Annual Pedagogy Retraining Hours per Teacher</span>
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400" title="Rishi Valley standard is 24 hours" />
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={inputRetrainingHours}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 12;
                        setInputRetrainingHours(val);
                        setTimeout(() => updateDimensionScore('ew_1'), 100);
                      }}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 font-bold text-gray-800"
                    />
                    <span className="text-gray-400 shrink-0 font-extrabold">Hours/Yr</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1">
                    <span>Weekly Uninterrupted Lesson Planning Hours</span>
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400" title="Shri Ram standard is >8 hours" />
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={inputPlanningHours}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 4;
                        setInputPlanningHours(val);
                        setTimeout(() => updateDimensionScore('ew_5'), 100);
                      }}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 font-bold text-gray-800"
                    />
                    <span className="text-gray-400 shrink-0 font-extrabold">Hours/Wk</span>
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="flex items-center gap-1">
                    <span>Project-Based Learning Units per Grade per Term</span>
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400" title="Riverside standard is 2-3 units minimum" />
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="0"
                      max="5"
                      value={inputProjectUnits}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setInputProjectUnits(val);
                        setTimeout(() => updateDimensionScore('ew_2'), 100);
                      }}
                      className="w-full accent-indigo-600"
                    />
                    <span className="bg-indigo-50 border border-indigo-150 text-indigo-700 px-3 py-1.5 rounded-lg text-xs shrink-0 font-black">
                      {inputProjectUnits} Units / Term
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Crawlers and Sentiment scrapers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">Website speed crawler</h4>
                </div>
                <div className="flex gap-2 text-xs">
                  <input 
                    type="text" 
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="flex-1 bg-slate-50 border border-gray-200 rounded-lg p-2 text-gray-800"
                  />
                  <button onClick={runWebsiteCrawl} disabled={isScanningWeb} className="bg-indigo-600 text-white font-extrabold px-3 py-1.5 rounded-lg">
                    {isScanningWeb ? 'Crawl...' : 'Crawl'}
                  </button>
                </div>

                {isScanningWeb && (
                  <div className="p-3 bg-slate-900 text-[10px] text-indigo-300 font-mono rounded-lg h-[90px] overflow-y-auto space-y-1">
                    {webScanProgress.map((step, idx) => (
                      <div key={idx}>&gt; {step}</div>
                    ))}
                  </div>
                )}

                {webScanResult && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs leading-normal">
                    <div className="flex justify-between font-black">
                      <span className="text-gray-500">First Contentful Paint:</span>
                      <span className="text-indigo-600">{webScanResult.fcp}</span>
                    </div>
                    <p className="text-[10px] text-gray-600 italic">" {webScanResult.verdict} "</p>
                  </div>
                )}
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <HeartPulse className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">Google Maps Review Scraper</h4>
                </div>
                <div className="flex gap-2 text-xs">
                  <input 
                    type="text" 
                    value={googleBusinessName}
                    onChange={(e) => setGoogleBusinessName(e.target.value)}
                    className="flex-1 bg-slate-50 border border-gray-200 rounded-lg p-2 text-gray-800"
                  />
                  <button onClick={runGoogleScraper} disabled={isScrapingMaps} className="bg-indigo-600 text-white font-extrabold px-3 py-1.5 rounded-lg">
                    {isScrapingMaps ? 'Scrape...' : 'Scrape'}
                  </button>
                </div>

                {isScrapingMaps && (
                  <div className="p-3 bg-slate-900 text-[10px] text-indigo-300 font-mono rounded-lg h-[90px] overflow-y-auto space-y-1">
                    {scrapingProgress.map((step, idx) => (
                      <div key={idx}>&gt; {step}</div>
                    ))}
                  </div>
                )}

                {mapsResult && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs leading-normal">
                    <div className="flex justify-between font-black">
                      <span className="text-gray-500">Maps Rating:</span>
                      <span className="text-indigo-600">{mapsResult.rating} Stars ({mapsResult.totalReviews} reviews)</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-emerald-600">Positive: {mapsResult.positiveSentiment}%</span>
                      <span className="text-rose-600">Negative: {mapsResult.negativeSentiment}%</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Right Side: Dimension Checklist and Document Uploads */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Lenses Checklist */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-3">
              <h3 className="font-black text-xs text-gray-900 uppercase tracking-wider">Lenses checklist</h3>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {dimensions.map(d => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDimensionId(d.id);
                      setSelectedSimDimensionId(d.id);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      d.id === selectedDimensionId ? 'border-indigo-600 bg-indigo-50/20' : 'border-gray-100 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-extrabold text-gray-700 truncate">{d.name}</span>
                    <span className="bg-slate-100 text-slate-700 font-black px-1.5 py-0.5 rounded text-[10px]">{d.baselineScore}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Document Verification box */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4">
              <div className="border-b border-gray-100 pb-2">
                <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">Hard Document Verification</h4>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">Scan official licensing reports to verify accuracy & earn score boosts.</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                {[
                  { id: 'faculty', label: 'Faculty roster', ext: '.PDF' },
                  { id: 'safety', label: 'Fire Safety', ext: '.PDF' },
                  { id: 'lesson', label: 'Lesson Maps', ext: '.PDF' },
                  { id: 'finance', label: 'Financial Audit', ext: '.XLS' }
                ].map(opt => {
                  const verified = uploadedDocs.some(d => d.type === opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleDocScan(opt.id)}
                      disabled={isScanningDoc}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                        verified ? 'border-emerald-600 bg-emerald-50/20 text-emerald-800' : 'border-dashed border-gray-200 hover:bg-slate-50'
                      }`}
                    >
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="font-extrabold truncate w-full">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {isScanningDoc && (
                <div className="p-3 bg-slate-900 rounded-lg text-[9px] font-mono text-indigo-300 space-y-0.5">
                  {docScanProgress.map((step, idx) => (
                    <div key={idx}>&gt; {step}</div>
                  ))}
                </div>
              )}

              {uploadedDocs.length > 0 && (
                <div className="space-y-1 pt-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Verified Documents</p>
                  {uploadedDocs.map((doc, idx) => (
                    <div key={idx} className="p-2 bg-emerald-50 text-emerald-800 rounded border border-emerald-100 text-[10px] leading-tight flex justify-between">
                      <span className="font-bold truncate max-w-[150px]">{doc.fileName}</span>
                      <span className="text-emerald-600 font-extrabold shrink-0">+{doc.scoreBoost} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* STAGE 2: COMPARE & DIAGNOSE PANEL */}
      {activeTab === 'compare' && (
        <div id="stage-compare-panel" className="space-y-6 animate-in fade-in">
          
          {/* Radar Chart Overall Comparison */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs">
            <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-1.5 mb-4 border-b border-gray-100 pb-3">
              <Activity className="w-4.5 h-4.5 text-indigo-600" />
              14-Dimension Radar Comparison
            </h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={dimensions.map(d => ({
                  subject: d.name,
                  School: d.baselineScore,
                  Ideal: d.benchmark,
                  District: d.districtBest,
                  fullMark: 100
                }))}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar name="Your School" dataKey="School" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
                  <Radar name="Ideal Standard" dataKey="Ideal" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  <Radar name="District Best" dataKey="District" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                  <RechartsTooltip wrapperStyle={{ fontSize: '11px', fontWeight: 600, borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Side: 14 Dimensions Selector */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4">
              <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-600" />
                14-Lens Comparison Matrix
              </h3>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {dimensions.map(d => {
                const isGapCritical = d.baselineScore < d.benchmark;
                const gapVal = d.baselineScore - d.benchmark;
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDimensionId(d.id);
                      setSelectedSimDimensionId(d.id);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      d.id === selectedDimensionId ? 'border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-500/5' : 'border-gray-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{d.name}</p>
                      <p className="text-[9px] text-gray-400 font-bold">{d.quadrant} Quadrant</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-[10px] font-black">
                      <div className="text-right">
                        <p className="text-slate-900">Score: {d.baselineScore}</p>
                        <p className={gapVal < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          Gap: {gapVal > 0 ? `+${gapVal}` : gapVal}
                        </p>
                      </div>
                      {isGapCritical && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side: Dual Benchmarking Cards & Explanation Narrative */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <span className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold uppercase tracking-widest border border-indigo-100 px-2 py-0.5 rounded">
                  {activeDim.quadrant} Quadrant Lens
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2">{activeDim.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed font-medium">{activeDim.description}</p>
              </div>

              {/* DUAL BENCHMARK DISPLAY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Benchmark 1: Ideal Standard */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">National Ideal Standard</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">{activeDim.benchmark}</span>
                    <span className="text-gray-400 text-xs font-bold">/100</span>
                  </div>
                  <div className="pt-2 text-[10px] text-gray-500 font-medium leading-normal border-t border-slate-200/50">
                    <p className="font-extrabold text-slate-700">Model Precedent:</p>
                    <p className="italic mt-0.5">"{activeDim.modelPrecedent}"</p>
                  </div>
                </div>

                {/* Benchmark 2: District Best */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">District Best Performer</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">{activeDim.districtBest}</span>
                    <span className="text-gray-400 text-xs font-bold">/100</span>
                  </div>
                  <div className="pt-2 text-[10px] text-gray-500 font-medium leading-normal border-t border-slate-200/50">
                    <p className="font-extrabold text-slate-700">District Feasibility:</p>
                    <p className="mt-0.5 font-bold text-slate-600">Top quartile schools in local city tier.</p>
                  </div>
                </div>

              </div>

              {/* TRACE GAP WHY NARRATIVE GENERATOR */}
              <div className="p-5 bg-amber-50/40 border border-amber-100 rounded-2xl space-y-2 text-xs leading-relaxed">
                <p className="font-black text-amber-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Activity className="w-4 h-4 text-amber-500" />
                  Plain-Language Gap Diagnosis narrative
                </p>

                <p className="text-gray-700 font-semibold">
                  Your local parameter is scored at <strong className="text-slate-900">{activeDim.baselineScore}/100</strong>. 
                  This creates a gap of <strong className="text-rose-600">{activeDim.baselineScore - activeDim.benchmark} points</strong> against the National standard 
                  and <strong className="text-rose-700">{activeDim.baselineScore - activeDim.districtBest} points</strong> compared to the District's Best Performer.
                </p>

                <div className="bg-white p-3 rounded-lg border border-amber-100 mt-2 text-[11px] space-y-1.5 font-medium text-gray-600">
                  <p className="font-black text-slate-800 uppercase tracking-widest text-[9px]">Root Operational Driver Traced:</p>
                  {activeDim.id === 'ew_12' && (
                    <p>
                      🚨 <strong>Why the gap exists:</strong> Your average Parent Query response time is <strong>{inputParentResponseHours} Hours</strong>. 
                      Elite models like Riverside Ahmedabad mandate <strong className="text-slate-900">under 12 hours response resolution</strong> managed on a single 
                      unified WhatsApp platform. Split communications across physical diaries and unofficial groups generate structural latency and drop parental trust.
                    </p>
                  )}
                  {activeDim.id === 'ew_8' && (
                    <p>
                      🚨 <strong>Why the gap exists:</strong> Your student-teacher ratio is <strong>1:{inputStudentTeacherRatio}</strong>. 
                      National benchmark precedents (such as The Shri Ram School Delhi) maintain an average ratio of <strong className="text-slate-900">11:1</strong> 
                      paired with dedicated Special Needs Departments to ensure high academic retention. High class size limits differentiated support velocities.
                    </p>
                  )}
                  {activeDim.id === 'ew_5' && (
                    <p>
                      🚨 <strong>Why the gap exists:</strong> Teachers are allocated only <strong>{inputPlanningHours} Hours</strong> of uninterrupted planning time. 
                      Rishi Valley and Riverside mandate <strong className="text-slate-900">at least 8 hours</strong>, letting staff retrain and prevent cognitive fatigue. 
                      Low preparation time leads to high faculty exit rates.
                    </p>
                  )}
                  {activeDim.id === 'ew_1' && (
                    <p>
                      🚨 <strong>Why the gap exists:</strong> Retraining hours average <strong>{inputRetrainingHours} hours annually</strong>, falling 50% below the Rishi Valley reference program target of 24 hours. Under-trained faculty limit modern digital blended tool adoptions.
                    </p>
                  )}
                  {activeDim.id === 'ew_2' && (
                    <p>
                      🚨 <strong>Why the gap exists:</strong> School runs only <strong>{inputProjectUnits} project-based learning units</strong> per grade per term. 
                      Riverside Ahmedabad operates a core FIDS curriculum framework with 3 active student-led projects per term, boosting ASSET exam percentile records.
                    </p>
                  )}
                  {!['ew_12', 'ew_8', 'ew_5', 'ew_1', 'ew_2'].includes(activeDim.id) && (
                    <p>
                      🚨 <strong>Why the gap exists:</strong> General assessment responses indicate standard manual tracking is deployed instead of secure digital systems. 
                      Centralizing stakeholder data check-ins on a recurring calendar is recommended to minimize localized outcome variances.
                    </p>
                  )}
                </div>
              </div>

            </div>

          </div>
          </div>
        </div>
      )}

      {/* STAGE 3: SIMULATE (THE REVERSE OUTCOME ENGINE) PANEL */}
      {activeTab === 'simulate' && (
        <div id="stage-simulate-panel" className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-md space-y-8 animate-in fade-in">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-black uppercase tracking-widest">
                <Sliders className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>Reverse Optimization Workspace</span>
              </div>
              <h3 className="text-xl font-black text-white">The Reverse-Parameter Simulation Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Set a desired target outcome dimension score. The solver will work backward to calculate required parameters.
              </p>
            </div>

            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-black px-3 py-1.5 rounded-full border border-indigo-500/30">
              Honest Predictive Logic
            </span>
          </div>

          {/* PANEL NOTE */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-indigo-900/35 text-xs text-indigo-200 leading-relaxed font-medium space-y-2">
            <p className="font-extrabold text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-indigo-400">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              Panel Note: Reverse-Parameter Simulation Mechanics
            </p>
            <p className="text-slate-350">
              This simulation engine back-tests constraints across multiple stakeholder parameters. Standard forward dashboards merely record trailing failure metrics. The <strong>Reverse-Parameter Simulation Engine</strong> maps desired performance targets to specific, operational-level adjustments (like class sizes, planning hours, and inquiry response caps), letting you pre-empt compliance and capacity bottlenecks before committing capital or staffing resources.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Simulation controls */}
            <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-6">
              
              <div className="space-y-2 text-xs font-bold text-slate-300">
                <label className="uppercase tracking-widest text-indigo-400">1. Select Target Outcome Lens</label>
                <select 
                  value={selectedSimDimensionId}
                  onChange={(e) => {
                    setSelectedSimDimensionId(e.target.value);
                    setSolverResult(null);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white font-extrabold"
                >
                  <option value="ew_12">Parental Involvement & Satisfaction</option>
                  <option value="ew_8">Individualized Attention Ratio</option>
                  <option value="ew_5">Teacher Welfare & Retainment</option>
                  <option value="ew_1">Competence of Faculty Retraining</option>
                  <option value="ew_2">Curriculum & Pedagogy Units</option>
                </select>
              </div>

              <div className="space-y-2 text-xs font-bold text-slate-300">
                <div className="flex justify-between uppercase tracking-widest text-indigo-400">
                  <span>2. Set Desired Score Goal</span>
                  <span className="text-white text-sm font-black">{simulationTarget} / 100</span>
                </div>
                <input 
                  type="range" 
                  min="60" 
                  max="100" 
                  value={simulationTarget}
                  onChange={(e) => {
                    setSimulationTarget(parseInt(e.target.value));
                    setSolverResult(null);
                  }}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>60 (Passing)</span>
                  <span>100 (Elite Class)</span>
                </div>
              </div>

              <button
                onClick={runReverseSolver}
                disabled={isSolving}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                {isSolving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running Constrained Solver...
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    Run Reverse Solver Engine
                  </>
                )}
              </button>

            </div>

            {/* Simulation outputs */}
            <div className="lg:col-span-7 space-y-6">
              
              {!solverResult && !isSolving && (
                <div className="h-full border-2 border-dashed border-slate-800 rounded-2xl flex flex-col justify-center items-center text-center p-8 space-y-2">
                  <Sliders className="w-10 h-10 text-slate-700" />
                  <p className="text-sm font-black text-slate-500">Solver Output Pending</p>
                  <p className="text-xs text-slate-600 max-w-xs font-medium">Select a target dimension on the left and run the solver to check sensitivity parameters.</p>
                </div>
              )}

              {isSolving && (
                <div className="h-full border border-slate-800 bg-slate-950/40 rounded-2xl flex flex-col justify-center items-center text-center p-8 space-y-4">
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-indigo-400">&gt; Constraining optimization variables...</p>
                    <p className="text-xs font-mono text-indigo-400">&gt; Mapping sensitivities back to stakeholder metrics...</p>
                  </div>
                </div>
              )}

              {solverResult && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  
                  {/* Results list */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border border-indigo-500/30">
                          Solver Confidence: {solverResult.confidenceTier}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Feasible District Trend
                      </span>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated Parameter Targets required:</p>
                      
                      <div className="space-y-2.5">
                        {solverResult.requiredInputs.map((input, idx) => (
                          <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center text-xs leading-normal">
                            <div className="space-y-0.5 max-w-[70%]">
                              <p className="font-extrabold text-slate-100">{input.factor}</p>
                              <p className="text-[10px] text-slate-500">Current Local Baseline: {input.current}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-1 rounded font-black">
                                {input.required}
                              </span>
                              <p className="text-[9px] text-slate-500 mt-1">Sensitivity: {input.sensitivity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Precedent School reference card */}
                    <div className="p-3 bg-indigo-950/40 border border-indigo-900/40 rounded-xl space-y-1 text-[11px] leading-relaxed">
                      <p className="font-extrabold text-indigo-300">District Existential Proof:</p>
                      <p className="text-slate-200">
                        "Your simulated goal matches <strong>{solverResult.precedentSchool}</strong>. {solverResult.precedentDetails}"
                      </p>
                    </div>

                  </div>

                  {/* Keeping the Engine Honest Disclaimer warning */}
                  <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl space-y-2 text-[11px] text-amber-300 leading-relaxed font-medium">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Keeping the Engine Honest</span>
                    </div>
                    <p className="italic font-semibold text-slate-300">
                      {solverResult.honestWarning}
                    </p>
                    <p className="text-[10px] text-slate-500 border-t border-slate-800 pt-1.5">
                      Disclaimer: These results represent data-informed hypotheses "worth testing" based on schools with a "likely" similar profile. A true diagnostic checking system does not "guarantee" outcomes.
                    </p>
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      )}
        </>
      )}

      {/* FOOTER INTERACTIVE SAVING AND DATA EXPORT PANEL */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1">
            <Shield className="w-4 h-4 text-indigo-600" />
            Security & DPDP Act 2023 Compliant Storage
          </h4>
          <p className="text-[11px] text-gray-400 font-semibold max-w-lg">
            Persisting your scorecard synchronizes multiple stakeholder audits, hard verified uploads, and public crawled records into the encrypted Firestore server instance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={downloadSpreadsheet}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-gray-200"
          >
            <Download className="w-4 h-4 text-slate-600" />
            Download Excel CSV Report
          </button>

          <button
            onClick={saveCompleteScorecard}
            disabled={isSavingScorecard}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black px-5 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {isSavingScorecard ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                Saving to Firestore...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-white" />
                Commit Scorecard & Sync
              </>
            )}
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className={`p-4 rounded-xl text-xs font-bold border leading-relaxed text-center ${
          saveStatus.includes('Success') 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {saveStatus}
        </div>
      )}

    </div>
  );
};

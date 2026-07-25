import React, { useState, useEffect } from 'react';
import { 
  Building, Users, Shield, GraduationCap, Trophy, Globe, HeartPulse, Sliders, 
  Upload, Search, FileText, CheckCircle2, AlertTriangle, RefreshCw, Star, 
  Check, ArrowRight, Activity, Cpu, Sparkles, BookOpen, Compass, ChevronRight, Play, Info,
  Download, Send, Lock, Scale, FileSpreadsheet, Eye, HelpCircle, Mail, MessageCircle, Link2
} from 'lucide-react';
import { useAppStore } from '../store';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
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
    desc: "Verification of compliance cycles, pedagogy audits, and CBSE structural alignments.",
    questions: [
      {
        id: "ew_8_leader",
        id_actual: "ew_8",
        label: "Q1: Leadership / Management",
        text: "How would you rate the school's performance in Leadership / Management?",
        options: [
          { val: 2, label: "Reactive, disorganized, poor vision" },
          { val: 4, label: "Stable, standard operational management" },
          { val: 5, label: "Visionary, proactive, and highly effective leadership" }
        ]
      },
      {
        id: "ew_1_leader",
        id_actual: "ew_1",
        label: "Q2: Competence of Faculty",
        text: "How would you rate the school's performance in Competence of Faculty?",
        options: [
          { val: 2, label: "Poorly qualified/No ongoing training" },
          { val: 4, label: "Adequately qualified with basic training" },
          { val: 5, label: "Highly qualified with continuous professional development" }
        ]
      },
      {
        id: "ew_2_leader",
        id_actual: "ew_2",
        label: "Q3: Teacher Welfare & Dev",
        text: "How would you rate the school's performance in Teacher Welfare & Dev?",
        options: [
          { val: 2, label: "High stress, low pay, poor benefits" },
          { val: 4, label: "Average pay, standard benefits, acceptable workload" },
          { val: 5, label: "Competitive pay, excellent benefits, well-managed workload" }
        ]
      },
      {
        id: "ew_11_leader",
        id_actual: "ew_11",
        label: "Q4: Internationalism",
        text: "How would you rate the school's performance in Internationalism?",
        options: [
          { val: 2, label: "No global exposure or partnerships" },
          { val: 4, label: "Occasional international events or basic partnerships" },
          { val: 5, label: "Strong international exchange programs and global curriculum integration" }
        ]
      },
      {
        id: "ew_13_leader",
        id_actual: "ew_13",
        label: "Q5: Value for Money",
        text: "How would you rate the school's performance in Value for Money?",
        options: [
          { val: 2, label: "High fees with mismatched facilities/outcomes" },
          { val: 4, label: "Fair fees for the services provided" },
          { val: 5, label: "Exceptional educational outcomes and facilities relative to the fee" }
        ]
      },
      {
        id: "ew_10_leader",
        id_actual: "ew_10",
        label: "Q6: Infrastructure Provision",
        text: "How would you rate the school's performance in Infrastructure Provision?",
        options: [
          { val: 2, label: "Aging facilities, basic amenities" },
          { val: 4, label: "Well-maintained standard classrooms and labs" },
          { val: 5, label: "World-class, modern, and highly equipped campus" }
        ]
      }
    ]
  },
  teacher: {
    title: "Teacher Assessment & Workplace Audit",
    desc: "Feedback on professional development, student attention, and inclusion.",
    questions: [
      {
        id: "ew_1_teacher",
        id_actual: "ew_1",
        label: "Q1: Competence of Faculty",
        text: "How would you rate the school's performance in Competence of Faculty?",
        options: [
          { val: 2, label: "Poorly qualified/No ongoing training" },
          { val: 4, label: "Adequately qualified with basic training" },
          { val: 5, label: "Highly qualified with continuous professional development" }
        ]
      },
      {
        id: "ew_2_teacher",
        id_actual: "ew_2",
        label: "Q2: Teacher Welfare & Dev",
        text: "How would you rate the school's performance in Teacher Welfare & Dev?",
        options: [
          { val: 2, label: "High stress, low pay, poor benefits" },
          { val: 4, label: "Average pay, standard benefits, acceptable workload" },
          { val: 5, label: "Competitive pay, excellent benefits, well-managed workload" }
        ]
      },
      {
        id: "ew_6_teacher",
        id_actual: "ew_6",
        label: "Q3: Life Skills Education",
        text: "How would you rate the school's performance in Life Skills Education?",
        options: [
          { val: 2, label: "Not included in the curriculum" },
          { val: 4, label: "Some basic life skills taught occasionally" },
          { val: 5, label: "Integrated comprehensively into daily learning and activities" }
        ]
      },
      {
        id: "ew_7_teacher",
        id_actual: "ew_7",
        label: "Q4: Individual Attention",
        text: "How would you rate the school's performance in Individual Attention?",
        options: [
          { val: 2, label: "High student-teacher ratio, generic teaching" },
          { val: 4, label: "Average class sizes, some differentiation" },
          { val: 5, label: "Low student-teacher ratio, highly personalized learning plans" }
        ]
      },
      {
        id: "ew_12_teacher",
        id_actual: "ew_12",
        label: "Q5: Special Needs Education",
        text: "How would you rate the school's performance in Special Needs Education?",
        options: [
          { val: 2, label: "No support for SEN students" },
          { val: 4, label: "Basic SEN support and some trained staff" },
          { val: 5, label: "Comprehensive inclusion policies, dedicated SEN department and resources" }
        ]
      },
      {
        id: "ew_3_teacher",
        id_actual: "ew_3",
        label: "Q6: Academic Reputation",
        text: "How would you rate the school's performance in Academic Reputation?",
        options: [
          { val: 2, label: "Below average results, poor local perception" },
          { val: 4, label: "Average results, acceptable perception" },
          { val: 5, label: "Consistently excellent results, highly prestigious" }
        ]
      }
    ]
  },
  parent: {
    title: "Parental Sentiment & Satisfaction Tracker",
    desc: "Evaluating academic reputation, involvement, and holistic education.",
    questions: [
      {
        id: "ew_3_parent",
        id_actual: "ew_3",
        label: "Q1: Academic Reputation",
        text: "How would you rate the school's performance in Academic Reputation?",
        options: [
          { val: 2, label: "Below average results, poor local perception" },
          { val: 4, label: "Average results, acceptable perception" },
          { val: 5, label: "Consistently excellent results, highly prestigious" }
        ]
      },
      {
        id: "ew_9_parent",
        id_actual: "ew_9",
        label: "Q2: Parents Involvement",
        text: "How would you rate the school's performance in Parents Involvement?",
        options: [
          { val: 2, label: "Minimal communication, parents feel disconnected" },
          { val: 4, label: "Regular PTMs, standard communication" },
          { val: 5, label: "Deep partnership, transparent communication, active parent body" }
        ]
      },
      {
        id: "ew_13_parent",
        id_actual: "ew_13",
        label: "Q3: Value for Money",
        text: "How would you rate the school's performance in Value for Money?",
        options: [
          { val: 2, label: "High fees with mismatched facilities/outcomes" },
          { val: 4, label: "Fair fees for the services provided" },
          { val: 5, label: "Exceptional educational outcomes and facilities relative to the fee" }
        ]
      },
      {
        id: "ew_7_parent",
        id_actual: "ew_7",
        label: "Q4: Individual Attention",
        text: "How would you rate the school's performance in Individual Attention?",
        options: [
          { val: 2, label: "High student-teacher ratio, generic teaching" },
          { val: 4, label: "Average class sizes, some differentiation" },
          { val: 5, label: "Low student-teacher ratio, highly personalized learning plans" }
        ]
      },
      {
        id: "ew_4_parent",
        id_actual: "ew_4",
        label: "Q5: Co-curricular Education",
        text: "How would you rate the school's performance in Co-curricular Education?",
        options: [
          { val: 2, label: "Minimal activities outside academics" },
          { val: 4, label: "Standard clubs and activities available" },
          { val: 5, label: "Rich, diverse, and nationally recognized co-curricular programs" }
        ]
      },
      {
        id: "ew_5_parent",
        id_actual: "ew_5",
        label: "Q6: Sports Education",
        text: "How would you rate the school's performance in Sports Education?",
        options: [
          { val: 2, label: "Limited facilities and no structured training" },
          { val: 4, label: "Standard playground with basic sports programs" },
          { val: 5, label: "State-of-the-art facilities with professional coaching" }
        ]
      }
    ]
  },
  student: {
    title: "Student Experience & Engagement",
    desc: "Feedback on co-curriculars, infrastructure, and life skills.",
    questions: [
      {
        id: "ew_4_student",
        id_actual: "ew_4",
        label: "Q1: Co-curricular Education",
        text: "How would you rate the school's performance in Co-curricular Education?",
        options: [
          { val: 2, label: "Minimal activities outside academics" },
          { val: 4, label: "Standard clubs and activities available" },
          { val: 5, label: "Rich, diverse, and nationally recognized co-curricular programs" }
        ]
      },
      {
        id: "ew_5_student",
        id_actual: "ew_5",
        label: "Q2: Sports Education",
        text: "How would you rate the school's performance in Sports Education?",
        options: [
          { val: 2, label: "Limited facilities and no structured training" },
          { val: 4, label: "Standard playground with basic sports programs" },
          { val: 5, label: "State-of-the-art facilities with professional coaching" }
        ]
      },
      {
        id: "ew_6_student",
        id_actual: "ew_6",
        label: "Q3: Life Skills Education",
        text: "How would you rate the school's performance in Life Skills Education?",
        options: [
          { val: 2, label: "Not included in the curriculum" },
          { val: 4, label: "Some basic life skills taught occasionally" },
          { val: 5, label: "Integrated comprehensively into daily learning and activities" }
        ]
      },
      {
        id: "ew_14_student",
        id_actual: "ew_14",
        label: "Q4: Community Service",
        text: "How would you rate the school's performance in Community Service?",
        options: [
          { val: 2, label: "No structured community service programs" },
          { val: 4, label: "Occasional local community initiatives" },
          { val: 5, label: "Deeply embedded service programs driving significant local impact" }
        ]
      },
      {
        id: "ew_10_student",
        id_actual: "ew_10",
        label: "Q5: Infrastructure Provision",
        text: "How would you rate the school's performance in Infrastructure Provision?",
        options: [
          { val: 2, label: "Aging facilities, basic amenities" },
          { val: 4, label: "Well-maintained standard classrooms and labs" },
          { val: 5, label: "World-class, modern, and highly equipped campus" }
        ]
      }
    ]
  },
  admin: {
    title: "Admin Staff & Operations",
    desc: "Infrastructure maintenance, support workflows, and operational efficiency.",
    questions: [
      {
        id: "ew_10_admin",
        id_actual: "ew_10",
        label: "Q1: Infrastructure Provision",
        text: "How would you rate the school's performance in Infrastructure Provision?",
        options: [
          { val: 2, label: "Aging facilities, basic amenities" },
          { val: 4, label: "Well-maintained standard classrooms and labs" },
          { val: 5, label: "World-class, modern, and highly equipped campus" }
        ]
      },
      {
        id: "ew_2_admin",
        id_actual: "ew_2",
        label: "Q2: Teacher Welfare & Dev",
        text: "How would you rate the school's performance in Teacher Welfare & Dev?",
        options: [
          { val: 2, label: "High stress, low pay, poor benefits" },
          { val: 4, label: "Average pay, standard benefits, acceptable workload" },
          { val: 5, label: "Competitive pay, excellent benefits, well-managed workload" }
        ]
      },
      {
        id: "ew_8_admin",
        id_actual: "ew_8",
        label: "Q3: Leadership / Management",
        text: "How would you rate the school's performance in Leadership / Management?",
        options: [
          { val: 2, label: "Reactive, disorganized, poor vision" },
          { val: 4, label: "Stable, standard operational management" },
          { val: 5, label: "Visionary, proactive, and highly effective leadership" }
        ]
      },
      {
        id: "ew_13_admin",
        id_actual: "ew_13",
        label: "Q4: Value for Money",
        text: "How would you rate the school's performance in Value for Money?",
        options: [
          { val: 2, label: "High fees with mismatched facilities/outcomes" },
          { val: 4, label: "Fair fees for the services provided" },
          { val: 5, label: "Exceptional educational outcomes and facilities relative to the fee" }
        ]
      }
    ]
  },
  other: {
    title: "Others (Alumni & Partners)",
    desc: "Feedback from alumni, local community, and partners.",
    questions: [
      {
        id: "ew_14_other",
        id_actual: "ew_14",
        label: "Q1: Community Service",
        text: "How would you rate the school's performance in Community Service?",
        options: [
          { val: 2, label: "No structured community service programs" },
          { val: 4, label: "Occasional local community initiatives" },
          { val: 5, label: "Deeply embedded service programs driving significant local impact" }
        ]
      },
      {
        id: "ew_11_other",
        id_actual: "ew_11",
        label: "Q2: Internationalism",
        text: "How would you rate the school's performance in Internationalism?",
        options: [
          { val: 2, label: "No global exposure or partnerships" },
          { val: 4, label: "Occasional international events or basic partnerships" },
          { val: 5, label: "Strong international exchange programs and global curriculum integration" }
        ]
      },
      {
        id: "ew_3_other",
        id_actual: "ew_3",
        label: "Q3: Academic Reputation",
        text: "How would you rate the school's performance in Academic Reputation?",
        options: [
          { val: 2, label: "Below average results, poor local perception" },
          { val: 4, label: "Average results, acceptable perception" },
          { val: 5, label: "Consistently excellent results, highly prestigious" }
        ]
      },
      {
        id: "ew_8_other",
        id_actual: "ew_8",
        label: "Q4: Leadership / Management",
        text: "How would you rate the school's performance in Leadership / Management?",
        options: [
          { val: 2, label: "Reactive, disorganized, poor vision" },
          { val: 4, label: "Stable, standard operational management" },
          { val: 5, label: "Visionary, proactive, and highly effective leadership" }
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
    }
  }, [activeSurveyStakeholder]);

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

  const handleSurveySubmit = (st: 'leader' | 'teacher' | 'parent' | 'student' | 'admin' | 'other', ratings: Record<string, number>) => {
    const newAnswers = { ...answers };
    Object.entries(ratings).forEach(([key, val]) => {
      const qConfig = SURVEY_QUESTIONS[st].questions.find(q => q.id === key) as any;
      const actualId = (qConfig && qConfig.id_actual) ? qConfig.id_actual : key;
      newAnswers[`${actualId}_${st}`] = val;
    });
    setAnswers(newAnswers);
    
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
      // Randomly adjust answers for all dimensions of that stakeholder
      SURVEY_QUESTIONS[stakeholder].questions.forEach(q => {
        const actualId = q.id_actual || q.id;
        newAnswers[`${actualId}_${stakeholder}`] = Math.floor(Math.random() * 2) + 4; // 4 or 5
      });
      setAnswers(newAnswers);
      // Update all dimensions
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
      // Randomly fill answers for all 14 dimensions and all 4 stakeholders
      dimensions.forEach(dim => {
        newAnswers[`${dim.id}_leader`] = Math.floor(Math.random() * 2) + 4;
        newAnswers[`${dim.id}_teacher`] = Math.floor(Math.random() * 2) + 4;
        newAnswers[`${dim.id}_parent`] = Math.floor(Math.random() * 2) + 4;
        newAnswers[`${dim.id}_student`] = Math.floor(Math.random() * 2) + 4;
      });
      setAnswers(newAnswers);
      // Update all dimensions
      dimensions.forEach(dim => {
        updateDimensionScore(dim.id, newAnswers);
      });
      setAnsweredStakeholders({
        leader: true,
        teacher: true,
        parent: true,
        student: true
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
              {activeSurveyStakeholder && (
                <div className="p-5 bg-slate-50 rounded-2xl border border-indigo-150 space-y-4 animate-in fade-in slide-in-from-top-3 duration-350">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                    <div className="space-y-0.5 text-left">
                      <span className="bg-indigo-100 text-indigo-800 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded">
                        Active Multilateral Channel Input Form
                      </span>
                      <h4 className="font-extrabold text-sm text-gray-900">{SURVEY_QUESTIONS[activeSurveyStakeholder].title}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">{SURVEY_QUESTIONS[activeSurveyStakeholder].desc}</p>
                    </div>
                    <button
                      onClick={() => setActiveSurveyStakeholder(null)}
                      className="text-gray-400 hover:text-gray-600 text-xs font-black p-1"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div className="space-y-4 text-left">
                    {SURVEY_QUESTIONS[activeSurveyStakeholder].questions.map((q) => (
                      <div key={q.id} className="space-y-2">
                        <p className="text-xs font-black text-gray-800 leading-tight">{q.label}: {q.text}</p>
                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((opt) => {
                            const isSelected = temporaryAnswers[q.id] === opt.val;
                            return (
                              <button
                                key={opt.val}
                                onClick={() => setTemporaryAnswers(prev => ({ ...prev, [q.id]: opt.val }))}
                                className={`p-2.5 rounded-xl border text-left text-[11px] leading-relaxed transition-all flex items-center justify-between font-semibold cursor-pointer ${
                                  isSelected 
                                    ? 'border-indigo-600 bg-indigo-50/20 text-indigo-950 font-bold shadow-xs' 
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
                    ))}
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
              )}
            </div>

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

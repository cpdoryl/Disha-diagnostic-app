/**
 * 14-Dimension Diagnostic Framework v2 — Dimension Metadata
 * All 14 dimensions with their metrics and perception questions
 * Authority: DISHA_14D_DIAGNOSTIC_FRAMEWORK_V2_REFERENCE.md
 */

import { PerceptionQuestionMap, MetricFormula, StakeholderType } from './types14D';

// ============================================================================
// DIMENSION 1: Academic Performance & Learning Outcomes
// ============================================================================

export const DIMENSION_1 = {
  id: 1,
  name: 'Academic Performance & Learning Outcomes',
  definition: 'Whether students are genuinely learning and progressing against grade-level benchmarks',

  metrics: [
    {
      id: '1a',
      name: 'Board exam pass % and average grade, by subject/section',
      formula: '(Students passed ÷ Students appeared) × 100, per subject/section',
      dataSource: 'CBSE Portal / Board exam result sheets',
      fallback: 'Request from exam cell (3-year history)',
      unit: '%',
      respondents: ['admin', 'teacher']
    },
    {
      id: '1b',
      name: 'Internal formative assessment average, term-on-term',
      formula: 'Sum of all students\' formative scores ÷ Number assessed',
      dataSource: 'Teacher gradebooks (LMS or paper)',
      fallback: 'Audit mark registers',
      unit: '/100',
      respondents: ['admin', 'teacher']
    },
    {
      id: '1c',
      name: '% students below grade-level benchmark on diagnostics',
      formula: '(Students below cutoff ÷ Total tested) × 100',
      dataSource: 'Diagnostic test results (school or third-party)',
      fallback: 'NCERT diagnostic or % below 50% internal formative',
      unit: '%',
      respondents: ['admin', 'teacher']
    },
    {
      id: '1d',
      name: 'Year-on-year value-added growth per student',
      formula: 'Current-year score − Previous-year score (per student); School avg = Sum ÷ N',
      dataSource: 'Two consecutive years of same student\'s scores (linked by ID)',
      fallback: 'Cohort pass-rate change until longitudinal data available',
      unit: 'points',
      respondents: ['admin', 'teacher']
    },
    {
      id: '1e',
      name: 'Subject/topic-wise item analysis (most-failed concepts)',
      formula: '% incorrect = Incorrect responses ÷ Total × 100, ranked by topic',
      dataSource: 'Question-wise marks from exam sheets or OMR',
      fallback: 'Subject teachers tag marks by topic during correction',
      unit: '%',
      respondents: ['teacher']
    },
    {
      id: '1f',
      name: 'Homework/assignment completion rate',
      formula: '(Submitted ÷ Assigned) × 100, per term',
      dataSource: 'LMS submission logs or homework register',
      fallback: 'Simple homework register per class',
      unit: '%',
      respondents: ['teacher', 'student']
    }
  ],

  perceptionQuestions: [
    {
      metricId: '1a',
      question: 'Overall, I would rate the school\'s academic/board exam results as strong',
      respondent: 'parent',
      followUp: 'What specific change would most improve your confidence in academic results?',
      displayOrder: 1
    },
    {
      metricId: '1b',
      question: 'Regular class tests/assessments reflect real understanding, not just rote memorization',
      respondent: 'student',
      followUp: 'What would make class assessments feel more meaningful to you?',
      displayOrder: 2
    },
    {
      metricId: '1c',
      question: 'I am confident every student, not just top performers, is supported to reach grade-level expectations',
      respondent: 'teacher',
      followUp: 'What additional support would help you reach students below grade level?',
      displayOrder: 3
    },
    {
      metricId: '1d',
      question: 'My child is genuinely improving year over year, not just staying the same',
      respondent: 'parent',
      followUp: 'What evidence would convince you of real year-on-year improvement?',
      displayOrder: 4
    },
    {
      metricId: '1e',
      question: 'Teachers identify and address the specific topics/concepts I personally struggle with',
      respondent: 'student',
      followUp: 'Which topic or concept do you wish got more follow-up attention?',
      displayOrder: 5
    },
    {
      metricId: '1f',
      question: 'The homework/assignment load feels appropriately paced — not overwhelming, not too light',
      respondent: 'student',
      followUp: 'What would make the homework load feel better calibrated?',
      displayOrder: 6
    }
  ]
};

// ============================================================================
// DIMENSION 2: Curriculum & Pedagogy Quality
// ============================================================================

export const DIMENSION_2 = {
  id: 2,
  name: 'Curriculum & Pedagogy Quality',
  definition: 'Whether teaching methods are effective, engaging, and aligned to NEP 2020/NCF',

  metrics: [
    {
      id: '2a',
      name: '% of observed lessons rated \'effective\' on shared rubric',
      formula: '(Lessons rated \'effective\'+) ÷ Total observed) × 100',
      dataSource: 'Lesson observation forms (academic coordinators/HODs)',
      fallback: 'Start minimum cadence (1 observed lesson/teacher/month) using simple rubric',
      unit: '%',
      respondents: ['admin']
    },
    {
      id: '2b',
      name: 'CPD hours completed per teacher per year',
      formula: 'Total CPD hours ÷ Number of teachers',
      dataSource: 'Training attendance registers/HR logs',
      fallback: 'Reconstruct from certificates/attendance; mandate sign-in for future',
      unit: 'hours',
      respondents: ['admin', 'teacher']
    },
    {
      id: '2c',
      name: 'Ratio of activity-based to lecture-based sessions',
      formula: 'Activity-tagged lessons ÷ Lecture-tagged lessons',
      dataSource: 'Lesson plans/observation tags',
      fallback: 'Add \'primary mode\' field to lesson-plan template',
      unit: 'ratio',
      respondents: ['teacher']
    },
    {
      id: '2d',
      name: 'Curriculum pacing adherence',
      formula: '(Topics covered by checkpoint ÷ Topics planned by checkpoint) × 100',
      dataSource: 'Curriculum map vs. actual teacher progress logs',
      fallback: 'Create term-wise curriculum map per subject',
      unit: '%',
      respondents: ['teacher']
    },
    {
      id: '2e',
      name: 'Project-based learning instances per term, per grade',
      formula: 'Count of documented cross-curricular/project-based activities per term/grade',
      dataSource: 'Academic calendar/event records, teacher logs',
      fallback: 'Start shared log where teachers record project activities',
      unit: '#',
      respondents: ['teacher']
    }
  ],

  perceptionQuestions: [
    {
      metricId: '2a',
      question: 'Classes are interesting and easy to follow',
      respondent: 'student',
      followUp: 'What would make classes more engaging for you specifically?',
      displayOrder: 7
    },
    {
      metricId: '2b',
      question: 'I receive enough training/support to keep improving my teaching',
      respondent: 'teacher',
      followUp: 'What specific training would most improve your ability to teach the current syllabus?',
      displayOrder: 8
    },
    {
      metricId: '2c',
      question: 'Lessons include activities and discussion, not just lecture and copying notes',
      respondent: 'student',
      followUp: 'What kind of activity would make a lesson click better for you?',
      displayOrder: 9
    },
    {
      metricId: '2d',
      question: 'The pace of teaching matches what I can actually absorb — not rushed, not too slow',
      respondent: 'student',
      followUp: 'Which subject/topic feels most rushed or most dragged-out to you?',
      displayOrder: 10
    },
    {
      metricId: '2e',
      question: 'My child gets meaningful project/hands-on learning, not just textbook work',
      respondent: 'parent',
      followUp: 'What kind of project or hands-on activity would you like to see more of?',
      displayOrder: 11
    }
  ]
};

// ============================================================================
// DIMENSION 3: Teacher Quality, Development & Retention
// ============================================================================

export const DIMENSION_3 = {
  id: 3,
  name: 'Teacher Quality, Development & Retention',
  definition: 'Teacher effectiveness, professional growth, and whether the school is retaining good teachers',

  metrics: [
    {
      id: '3a',
      name: 'Annual teacher attrition rate',
      formula: '(Teachers left ÷ Avg teachers employed during year) × 100',
      dataSource: 'HR employee master records (joining/exit dates)',
      fallback: 'Reconstruct from payroll or appointment/relieving letters',
      unit: '%',
      respondents: ['admin']
    },
    {
      id: '3b',
      name: 'Average teacher tenure',
      formula: 'Sum of (Current date − Joining date) ÷ Number of current teachers',
      dataSource: 'HR joining-date records',
      fallback: 'Approximate from appointment letters/service certificates',
      unit: 'years',
      respondents: ['admin']
    },
    {
      id: '3c',
      name: '% teachers with required qualifications/certifications',
      formula: '(Teachers with verified qualification ÷ Total teachers) × 100',
      dataSource: 'HR personnel files/qualification documents',
      fallback: 'One-time verification drive collecting copies',
      unit: '%',
      respondents: ['admin']
    },
    {
      id: '3d',
      name: 'Teacher absenteeism rate',
      formula: '(Total teacher-days absent ÷ Total possible teacher-days) × 100',
      dataSource: 'Staff attendance/biometric logs',
      fallback: 'Use manual registers or simple sign-in sheet',
      unit: '%',
      respondents: ['admin']
    },
    {
      id: '3e',
      name: 'Teacher:student ratio, by grade/section',
      formula: 'Total enrolled students ÷ Total teaching staff (FTE), by grade/section',
      dataSource: 'Enrollment records + staffing records',
      fallback: 'Manual count if not centralized',
      unit: 'ratio',
      respondents: ['admin']
    },
    {
      id: '3f',
      name: 'Substitute-teacher dependency rate',
      formula: '(Periods covered by substitutes ÷ Total periods) × 100',
      dataSource: 'Daily substitution/arrangement register',
      fallback: 'Start simple substitution register if not tracked',
      unit: '%',
      respondents: ['admin']
    }
  ],

  perceptionQuestions: [
    {
      metricId: '3a',
      question: 'I don\'t see myself needing to leave this school in the next 1-2 years',
      respondent: 'teacher',
      followUp: 'What would most reduce any urge you have to consider leaving?',
      displayOrder: 12
    },
    {
      metricId: '3b',
      question: 'My child has consistent, experienced teachers year over year, not constant change',
      respondent: 'parent',
      followUp: 'What would improve teacher continuity for your child?',
      displayOrder: 13
    },
    {
      metricId: '3c',
      question: 'I\'m confident my child\'s teachers are well-qualified and know their subjects deeply',
      respondent: 'parent',
      followUp: 'What would increase your confidence in teacher qualifications?',
      displayOrder: 14
    },
    {
      metricId: '3d',
      question: 'My classes are rarely cancelled or disrupted because a teacher is absent',
      respondent: 'student',
      followUp: 'How often has teacher absence disrupted your learning, and what would help?',
      displayOrder: 15
    },
    {
      metricId: '3e',
      question: 'Class sizes are small enough for me/my child to get individual attention',
      respondent: 'parent',
      followUp: 'What class-size change would most benefit your child\'s learning?',
      displayOrder: 16
    },
    {
      metricId: '3f',
      question: 'When my regular teacher is absent, the substitute arrangement still lets me learn well',
      respondent: 'student',
      followUp: 'What would make substitute-covered classes more effective for you?',
      displayOrder: 17
    }
  ]
};

// ============================================================================
// DIMENSION 4: Student Wellbeing & Mental Health
// ============================================================================

export const DIMENSION_4 = {
  id: 4,
  name: 'Student Wellbeing & Mental Health',
  definition: 'The emotional, psychological, and social wellbeing of students',

  metrics: [
    {
      id: '4a',
      name: 'Counsellor caseload and average session frequency',
      formula: 'Avg sessions/month = Total sessions ÷ Months; Caseload = Distinct students ÷ Counsellors',
      dataSource: 'Counsellor session-count log (aggregate only, privacy-protected)',
      fallback: 'Introduce confidential log immediately',
      unit: 'sessions/month',
      respondents: ['admin']
    },
    {
      id: '4b',
      name: 'Documented bullying/harassment incidents & resolution time',
      formula: 'Avg resolution time = Sum of (Closed date − Reported date) ÷ Number of cases',
      dataSource: 'Anti-bullying committee incident register',
      fallback: 'PRIORITY: Institute confidential register immediately',
      unit: 'days',
      respondents: ['admin']
    },
    {
      id: '4c',
      name: 'Absenteeism patterns linked to stress',
      formula: '(Absences with health-office/counsellor-flagged stress reason ÷ Total absences) × 100',
      dataSource: 'Health office/nurse visit log cross-referenced with attendance',
      fallback: 'Add reason-category field to visit log',
      unit: '%',
      respondents: ['admin']
    },
    {
      id: '4d',
      name: 'SEL program participation rate',
      formula: '(Students attending scheduled SEL ÷ Total enrolled) × 100',
      dataSource: 'SEL session attendance records',
      fallback: 'Pilot basic SEL curriculum before measuring',
      unit: '%',
      respondents: ['admin', 'teacher']
    },
    {
      id: '4e',
      name: 'Anonymous wellbeing pulse-survey completion rate',
      formula: '(Responses received ÷ Total invited) × 100',
      dataSource: 'Survey platform response logs',
      fallback: 'Launch first cycle as part of assessment',
      unit: '%',
      respondents: ['admin']
    }
  ],

  perceptionQuestions: [
    {
      metricId: '4a',
      question: 'If I needed to see the counsellor, I could get an appointment without a long wait',
      respondent: 'student',
      followUp: 'What would make counselling more accessible to you?',
      displayOrder: 18
    },
    {
      metricId: '4b',
      question: 'When bullying or conflict is reported, it gets resolved reasonably quickly',
      respondent: 'student',
      followUp: 'Describe a case where resolution felt too slow, and what would have sped it up',
      displayOrder: 19
    },
    {
      metricId: '4c',
      question: 'I don\'t believe my child avoids school due to stress or anxiety',
      respondent: 'parent',
      followUp: 'What signs of school-related stress have you noticed, and what would help address them?',
      displayOrder: 20
    },
    {
      metricId: '4d',
      question: 'The SEL/life-skills sessions genuinely help me manage emotions and relationships',
      respondent: 'student',
      followUp: 'What would make these sessions more useful to you?',
      displayOrder: 21
    },
    {
      metricId: '4e',
      question: 'I feel comfortable honestly answering wellbeing surveys/check-ins at school',
      respondent: 'student',
      followUp: 'What would make you more willing to answer honestly?',
      displayOrder: 22
    }
  ]
};

// ============================================================================
// EXPORT DIMENSIONS ARRAY
// ============================================================================

export const ALL_DIMENSIONS = [
  DIMENSION_1,
  DIMENSION_2,
  DIMENSION_3,
  DIMENSION_4,
  // NOTE: Dimensions 5-14 to be added in subsequent files for modularity
  // This keeps each file manageable while maintaining the complete framework
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getDimensionById(id: number) {
  return ALL_DIMENSIONS.find(d => d.id === id);
}

export function getMetricById(metricId: string) {
  const dimensionId = parseInt(metricId[0]);
  const dimension = getDimensionById(dimensionId);
  return dimension?.metrics.find(m => m.id === metricId);
}

export function getPerceptionQuestion(metricId: string, respondent: StakeholderType) {
  const dimension = ALL_DIMENSIONS.find(d =>
    d.metrics.some(m => m.id === metricId)
  );
  return dimension?.perceptionQuestions.find(q =>
    q.metricId === metricId && q.respondent === respondent
  );
}

export function getRespondentTypesForMetric(metricId: string) {
  const metric = getMetricById(metricId);
  return metric?.respondents || [];
}

export function getDimensionMetrics(dimensionId: number) {
  return getDimensionById(dimensionId)?.metrics || [];
}

export function getDimensionPerceptionQuestions(dimensionId: number) {
  return getDimensionById(dimensionId)?.perceptionQuestions || [];
}

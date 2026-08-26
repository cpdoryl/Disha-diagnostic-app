/**
 * Phase 5: Perception Questions Bank
 * 79 perception questions mapped 1:1 to Reality metrics
 * Based on DISHA 14-Dimension Diagnostic Framework v2
 */

import { SurveyQuestion } from './types';

// Helper to create questions consistently
const createQuestion = (
  id: string,
  dimensionId: number,
  dimensionName: string,
  metricId: string,
  question: string,
  respondentTypes: ('TEACHER' | 'PARENT' | 'STUDENT' | 'ADMIN' | 'OTHER')[],
  rootCauseFollowUp: string,
  order: number
): SurveyQuestion => ({
  id,
  dimensionId,
  dimensionName,
  metricId,
  question,
  respondentTypes,
  scale: 'LIKERT_1_10',
  rootCauseFollowUp,
  category: 'PERCEPTION',
  createdAt: new Date(),
  order,
});

export const PERCEPTION_QUESTIONS_BANK: SurveyQuestion[] = [
  // ============================================================================
  // DIMENSION 1: Academic Performance & Learning Outcomes (6 questions)
  // ============================================================================

  createQuestion(
    'Q1',
    1,
    'Academic Performance & Learning Outcomes',
    '1a',
    "Overall, I would rate the school's academic/board exam results as strong.",
    ['PARENT', 'ADMIN'],
    'What specific change would most improve your confidence in academic results?',
    1
  ),

  createQuestion(
    'Q2',
    1,
    'Academic Performance & Learning Outcomes',
    '1b',
    'Regular class tests/assessments reflect real understanding, not just rote memorization.',
    ['STUDENT', 'TEACHER'],
    'What would make class assessments feel more meaningful to you?',
    2
  ),

  createQuestion(
    'Q3',
    1,
    'Academic Performance & Learning Outcomes',
    '1c',
    'I am confident every student, not just top performers, is supported to reach grade-level expectations.',
    ['TEACHER', 'ADMIN'],
    'What additional support would help you reach students below grade level?',
    3
  ),

  createQuestion(
    'Q4',
    1,
    'Academic Performance & Learning Outcomes',
    '1d',
    'My child is genuinely improving year over year, not just staying the same.',
    ['PARENT'],
    'What evidence would convince you of real year-on-year improvement?',
    4
  ),

  createQuestion(
    'Q5',
    1,
    'Academic Performance & Learning Outcomes',
    '1e',
    'Teachers identify and address the specific topics/concepts I personally struggle with.',
    ['STUDENT'],
    'Which topic or concept do you wish got more follow-up attention?',
    5
  ),

  createQuestion(
    'Q6',
    1,
    'Academic Performance & Learning Outcomes',
    '1f',
    'The homework/assignment load feels appropriately paced — not overwhelming, not too light.',
    ['STUDENT', 'PARENT'],
    'What would make the homework load feel better calibrated?',
    6
  ),

  // ============================================================================
  // DIMENSION 2: Curriculum & Pedagogy Quality (5 questions)
  // ============================================================================

  createQuestion(
    'Q7',
    2,
    'Curriculum & Pedagogy Quality',
    '2a',
    'Teaching in the school emphasizes activity-based learning, not just lecture-based instruction.',
    ['PARENT', 'STUDENT', 'TEACHER'],
    'How could teaching methods be more engaging for students?',
    7
  ),

  createQuestion(
    'Q8',
    2,
    'Curriculum & Pedagogy Quality',
    '2b',
    'Teachers here receive regular professional development to improve their teaching skills.',
    ['TEACHER', 'ADMIN'],
    'What type of professional development would be most valuable?',
    8
  ),

  createQuestion(
    'Q9',
    2,
    'Curriculum & Pedagogy Quality',
    '2c',
    'The curriculum covers the expected learning outcomes and topics for each grade level.',
    ['TEACHER', 'ADMIN'],
    'Which topics or skills need more emphasis in the curriculum?',
    9
  ),

  createQuestion(
    'Q10',
    2,
    'Curriculum & Pedagogy Quality',
    '2d',
    'Teachers plan lessons carefully and adjust pace based on student understanding.',
    ['STUDENT', 'PARENT', 'TEACHER'],
    'What would improve how lessons are paced and adapted?',
    10
  ),

  createQuestion(
    'Q11',
    2,
    'Curriculum & Pedagogy Quality',
    '2e',
    'Students engage in projects and applied learning, not just textbook-based study.',
    ['STUDENT', 'PARENT'],
    'What types of projects or real-world learning would be most valuable?',
    11
  ),

  // ============================================================================
  // DIMENSION 3: Teacher Quality, Development & Retention (6 questions)
  // ============================================================================

  createQuestion(
    'Q12',
    3,
    'Teacher Quality, Development & Retention',
    '3a',
    'The school successfully retains experienced teachers over multiple years.',
    ['ADMIN', 'PARENT'],
    'What could make the school a better place for teachers to stay?',
    12
  ),

  createQuestion(
    'Q13',
    3,
    'Teacher Quality, Development & Retention',
    '3b',
    'Teachers in this school have significant experience and expertise.',
    ['PARENT', 'STUDENT'],
    'What evidence of teacher expertise matters most to you?',
    13
  ),

  createQuestion(
    'Q14',
    3,
    'Teacher Quality, Development & Retention',
    '3c',
    'The school prioritizes hiring fully qualified, trained teachers.',
    ['ADMIN', 'PARENT'],
    'What qualifications/credentials are most important?',
    14
  ),

  createQuestion(
    'Q15',
    3,
    'Teacher Quality, Development & Retention',
    '3d',
    'Teachers are engaged and committed to their work (not just present in classrooms).',
    ['STUDENT', 'PARENT'],
    'What would you notice about a highly engaged teacher?',
    15
  ),

  createQuestion(
    'Q16',
    3,
    'Teacher Quality, Development & Retention',
    '3e',
    'The student-to-teacher ratio is manageable, allowing for personalized attention.',
    ['TEACHER', 'PARENT', 'STUDENT'],
    'How would smaller class sizes improve learning?',
    16
  ),

  createQuestion(
    'Q17',
    3,
    'Teacher Quality, Development & Retention',
    '3f',
    'Teachers are replaced quickly when absent (not left understaffed).',
    ['PARENT', 'STUDENT'],
    'How do last-minute teacher absences affect your experience?',
    17
  ),

  // ============================================================================
  // DIMENSION 4: Student Wellbeing & Mental Health (5 questions)
  // ============================================================================

  createQuestion(
    'Q18',
    4,
    'Student Wellbeing & Mental Health',
    '4a',
    'The school provides counseling/mental health support when students need it.',
    ['STUDENT', 'PARENT', 'ADMIN'],
    'What kind of mental health support would help most?',
    18
  ),

  createQuestion(
    'Q19',
    4,
    'Student Wellbeing & Mental Health',
    '4b',
    'When bullying or harassment occurs, the school acts quickly and fairly to resolve it.',
    ['STUDENT', 'PARENT', 'TEACHER'],
    'What would make students feel safer reporting bullying?',
    19
  ),

  createQuestion(
    'Q20',
    4,
    'Student Wellbeing & Mental Health',
    '4c',
    'Students who are anxious or stressed have a trusted adult to talk to.',
    ['STUDENT', 'PARENT'],
    'Who do you trust to talk to about stress at school?',
    20
  ),

  createQuestion(
    'Q21',
    4,
    'Student Wellbeing & Mental Health',
    '4d',
    'The school teaches social-emotional skills (managing emotions, relationships, decision-making).',
    ['STUDENT', 'PARENT', 'TEACHER'],
    'Which life skills should the school focus on?',
    21
  ),

  createQuestion(
    'Q22',
    4,
    'Student Wellbeing & Mental Health',
    '4e',
    'Students feel the school cares about their overall wellbeing, not just academics.',
    ['STUDENT', 'PARENT'],
    'How would you know the school cares about your wellbeing?',
    22
  ),

  // ============================================================================
  // DIMENSION 5: Student Discipline & Behavior (5 questions)
  // ============================================================================

  createQuestion(
    'Q23',
    5,
    'Student Discipline & Behavior',
    '5a',
    'Discipline policies are fair and applied consistently across all students.',
    ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN'],
    'What would make discipline policies feel more fair?',
    23
  ),

  createQuestion(
    'Q24',
    5,
    'Student Discipline & Behavior',
    '5b',
    'Students understand the rules and why they matter.',
    ['STUDENT', 'TEACHER'],
    'How could school rules be explained better?',
    24
  ),

  createQuestion(
    'Q25',
    5,
    'Student Discipline & Behavior',
    '5c',
    'Teachers focus on teaching better behavior, not just punishing misbehavior.',
    ['STUDENT', 'PARENT', 'TEACHER'],
    'What would help students improve their behavior?',
    25
  ),

  createQuestion(
    'Q26',
    5,
    'Student Discipline & Behavior',
    '5d',
    'Serious behavioral incidents are handled with parent involvement and support.',
    ['PARENT', 'ADMIN'],
    'How should the school involve parents in discipline matters?',
    26
  ),

  createQuestion(
    'Q27',
    5,
    'Student Discipline & Behavior',
    '5e',
    'Most students follow school rules consistently.',
    ['TEACHER', 'ADMIN'],
    'What factors influence whether students follow rules?',
    27
  ),

  // ============================================================================
  // DIMENSION 6: Infrastructure & Facilities (4 questions)
  // ============================================================================

  createQuestion(
    'Q28',
    6,
    'Infrastructure & Facilities',
    '6a',
    'School buildings, classrooms, and facilities are clean, safe, and well-maintained.',
    ['PARENT', 'STUDENT', 'TEACHER'],
    'What facilities improvements would help most?',
    28
  ),

  createQuestion(
    'Q29',
    6,
    'Infrastructure & Facilities',
    '6b',
    'Classrooms have adequate resources (furniture, boards, technology) to support learning.',
    ['TEACHER', 'STUDENT'],
    'What classroom resources are missing or outdated?',
    29
  ),

  createQuestion(
    'Q30',
    6,
    'Infrastructure & Facilities',
    '6c',
    'The school has dedicated spaces for sports, art, music, and special programs.',
    ['STUDENT', 'PARENT'],
    'Which specialized spaces or facilities would you add?',
    30
  ),

  createQuestion(
    'Q31',
    6,
    'Infrastructure & Facilities',
    '6d',
    'Toilets, water, and sanitation facilities meet basic hygiene standards.',
    ['STUDENT', 'PARENT', 'TEACHER'],
    'What sanitation or water issues need to be fixed?',
    31
  ),

  // ============================================================================
  // DIMENSION 7: Safety & Security (5 questions)
  // ============================================================================

  createQuestion(
    'Q32',
    7,
    'Safety & Security',
    '7a',
    'Students feel physically safe at school (risk of injury is low).',
    ['STUDENT', 'PARENT'],
    'What specific safety concerns do you have?',
    32
  ),

  createQuestion(
    'Q33',
    7,
    'Safety & Security',
    '7b',
    'The school protects children from inappropriate behavior by adults.',
    ['PARENT', 'ADMIN'],
    'How does the school demonstrate this protection?',
    33
  ),

  createQuestion(
    'Q34',
    7,
    'Safety & Security',
    '7c',
    'Entry/exit is monitored, and only authorized people can access the campus.',
    ['PARENT', 'TEACHER', 'ADMIN'],
    'What security measures are visible and working?',
    34
  ),

  createQuestion(
    'Q35',
    7,
    'Safety & Security',
    '7d',
    'First aid, fire safety, and emergency procedures are in place and practiced.',
    ['PARENT', 'TEACHER', 'ADMIN'],
    'How often are safety drills practiced?',
    35
  ),

  createQuestion(
    'Q36',
    7,
    'Safety & Security',
    '7e',
    'The school communicates safety measures to parents and keeps them informed of incidents.',
    ['PARENT', 'ADMIN'],
    'What safety information would you like more regularly?',
    36
  ),

  // ============================================================================
  // DIMENSION 8: Parent Satisfaction & Engagement (5 questions)
  // ============================================================================

  createQuestion(
    'Q37',
    8,
    'Parent Satisfaction & Engagement',
    '8a',
    'Parents have regular communication from teachers about their child\'s progress.',
    ['PARENT'],
    'How often and how would you like to hear from teachers?',
    37
  ),

  createQuestion(
    'Q38',
    8,
    'Parent Satisfaction & Engagement',
    '8b',
    'The school welcomes parent involvement (volunteering, feedback, partnerships).',
    ['PARENT'],
    'In what ways would you like to get involved?',
    38
  ),

  createQuestion(
    'Q39',
    8,
    'Parent Satisfaction & Engagement',
    '8c',
    'School events and meetings are scheduled at times that work for working parents.',
    ['PARENT'],
    'What timing works best for you to attend events?',
    39
  ),

  createQuestion(
    'Q40',
    8,
    'Parent Satisfaction & Engagement',
    '8d',
    'Parents feel heard when they have concerns or suggestions.',
    ['PARENT'],
    'How should the school handle parent concerns?',
    40
  ),

  createQuestion(
    'Q41',
    8,
    'Parent Satisfaction & Engagement',
    '8e',
    'Overall, parents are satisfied with the school experience.',
    ['PARENT'],
    'What would increase your satisfaction with the school?',
    41
  ),

  // ============================================================================
  // DIMENSION 9: Student Satisfaction & Engagement (5 questions)
  // ============================================================================

  createQuestion(
    'Q42',
    9,
    'Student Satisfaction & Engagement',
    '9a',
    'Students enjoy coming to school and feel connected to it.',
    ['STUDENT'],
    'What would make school more enjoyable for you?',
    42
  ),

  createQuestion(
    'Q43',
    9,
    'Student Satisfaction & Engagement',
    '9b',
    'Students have opportunities to pursue their interests (clubs, activities, sports).',
    ['STUDENT', 'PARENT'],
    'What clubs or activities would you like to see?',
    43
  ),

  createQuestion(
    'Q44',
    9,
    'Student Satisfaction & Engagement',
    '9c',
    'Students feel their opinions matter at school.',
    ['STUDENT'],
    'How should the school listen to student voices?',
    44
  ),

  createQuestion(
    'Q45',
    9,
    'Student Satisfaction & Engagement',
    '9d',
    'Students have friends and feel socially connected at school.',
    ['STUDENT'],
    'What helps you feel connected to other students?',
    45
  ),

  createQuestion(
    'Q46',
    9,
    'Student Satisfaction & Engagement',
    '9e',
    'Overall, students are satisfied with their school experience.',
    ['STUDENT'],
    'What single change would improve your school experience?',
    46
  ),

  // ============================================================================
  // DIMENSION 10: Leadership & Governance (5 questions)
  // ============================================================================

  createQuestion(
    'Q47',
    10,
    'Leadership & Governance',
    '10a',
    'School leadership has a clear vision and direction for school improvement.',
    ['ADMIN', 'TEACHER'],
    'What should the school\'s vision focus on?',
    47
  ),

  createQuestion(
    'Q48',
    10,
    'Leadership & Governance',
    '10b',
    'The leadership team makes decisions fairly and with input from stakeholders.',
    ['ADMIN', 'TEACHER', 'PARENT'],
    'How should major decisions be made at the school?',
    48
  ),

  createQuestion(
    'Q49',
    10,
    'Leadership & Governance',
    '10c',
    'The school board provides oversight without micro-managing school operations.',
    ['ADMIN'],
    'What is the appropriate level of board involvement?',
    49
  ),

  createQuestion(
    'Q50',
    10,
    'Leadership & Governance',
    '10d',
    'School leadership is accessible and responsive to staff concerns.',
    ['TEACHER', 'ADMIN'],
    'How should leaders be more accessible?',
    50
  ),

  createQuestion(
    'Q51',
    10,
    'Leadership & Governance',
    '10e',
    'Professional development and growth opportunities are available for teachers.',
    ['TEACHER', 'ADMIN'],
    'What development opportunities would help you most?',
    51
  ),

  // ============================================================================
  // DIMENSION 11: Financial Health & Sustainability (4 questions)
  // ============================================================================

  createQuestion(
    'Q52',
    11,
    'Financial Health & Sustainability',
    '11a',
    'School fees are transparent and reasonable for the services provided.',
    ['PARENT', 'ADMIN'],
    'What fee transparency would help you understand value?',
    52
  ),

  createQuestion(
    'Q53',
    11,
    'Financial Health & Sustainability',
    '11b',
    'Teachers are paid fairly and on time, reducing staff turnover.',
    ['ADMIN'],
    'How should teacher compensation be determined?',
    53
  ),

  createQuestion(
    'Q54',
    11,
    'Financial Health & Sustainability',
    '11c',
    'The school invests in infrastructure and technology improvements regularly.',
    ['ADMIN', 'PARENT'],
    'Where should the school invest resources?',
    54
  ),

  createQuestion(
    'Q55',
    11,
    'Financial Health & Sustainability',
    '11d',
    'Financial resources are used efficiently to maximize impact on student learning.',
    ['ADMIN'],
    'How could resources be used more efficiently?',
    55
  ),

  // ============================================================================
  // DIMENSION 12: Admissions, Enrollment & Market Position (5 questions)
  // ============================================================================

  createQuestion(
    'Q56',
    12,
    'Admissions, Enrollment & Market Position',
    '12a',
    'The school attracts qualified students with good academic foundations.',
    ['ADMIN', 'PARENT'],
    'What draws you to this school?',
    56
  ),

  createQuestion(
    'Q57',
    12,
    'Admissions, Enrollment & Market Position',
    '12b',
    'Admissions processes are fair and transparent.',
    ['PARENT', 'ADMIN'],
    'What admissions information would be helpful?',
    57
  ),

  createQuestion(
    'Q58',
    12,
    'Admissions, Enrollment & Market Position',
    '12c',
    'The school\'s reputation for academic excellence is growing.',
    ['ADMIN', 'PARENT'],
    'How should the school build its reputation?',
    58
  ),

  createQuestion(
    'Q59',
    12,
    'Admissions, Enrollment & Market Position',
    '12d',
    'Most families who start at this school continue through upper grades.',
    ['ADMIN', 'PARENT'],
    'What would make families want to stay longer?',
    59
  ),

  createQuestion(
    'Q60',
    12,
    'Admissions, Enrollment & Market Position',
    '12e',
    'Alumni of this school become successful and maintain connections.',
    ['ADMIN'],
    'How should the school track alumni success?',
    60
  ),

  // ============================================================================
  // DIMENSION 13: Technology & Digital Readiness (5 questions)
  // ============================================================================

  createQuestion(
    'Q61',
    13,
    'Technology & Digital Readiness',
    '13a',
    'Students have access to technology (computers, internet) for learning.',
    ['STUDENT', 'PARENT', 'TEACHER'],
    'What technology improvements are needed?',
    61
  ),

  createQuestion(
    'Q62',
    13,
    'Technology & Digital Readiness',
    '13b',
    'Teachers are trained to use technology effectively in teaching.',
    ['TEACHER', 'ADMIN'],
    'What technology training would help most?',
    62
  ),

  createQuestion(
    'Q63',
    13,
    'Technology & Digital Readiness',
    '13c',
    'The school uses digital systems for learning management and communication.',
    ['TEACHER', 'PARENT', 'STUDENT'],
    'What digital systems work well? What needs improvement?',
    63
  ),

  createQuestion(
    'Q64',
    13,
    'Technology & Digital Readiness',
    '13d',
    'Students are taught digital literacy and online safety.',
    ['STUDENT', 'PARENT', 'TEACHER'],
    'What digital skills should students learn?',
    64
  ),

  createQuestion(
    'Q65',
    13,
    'Technology & Digital Readiness',
    '13e',
    'Technology infrastructure is reliable and secure.',
    ['ADMIN', 'TEACHER'],
    'What technology reliability issues exist?',
    65
  ),

  // ============================================================================
  // DIMENSION 14: Co-curricular, Extracurricular & Holistic Development (4 questions)
  // ============================================================================

  createQuestion(
    'Q66',
    14,
    'Co-curricular, Extracurricular & Holistic Development',
    '14a',
    'Students have diverse opportunities beyond academics (sports, arts, clubs).',
    ['STUDENT', 'PARENT'],
    'What activities would you like to see?',
    66
  ),

  createQuestion(
    'Q67',
    14,
    'Co-curricular, Extracurricular & Holistic Development',
    '14b',
    'Students develop life skills like leadership, teamwork, and creativity.',
    ['STUDENT', 'PARENT', 'TEACHER'],
    'How can the school better develop these skills?',
    67
  ),

  createQuestion(
    'Q68',
    14,
    'Co-curricular, Extracurricular & Holistic Development',
    '14c',
    'The school celebrates student achievements in all areas, not just academics.',
    ['STUDENT', 'PARENT'],
    'Which achievements should be celebrated?',
    68
  ),

  createQuestion(
    'Q69',
    14,
    'Co-curricular, Extracurricular & Holistic Development',
    '14d',
    'Students have community service and social responsibility opportunities.',
    ['STUDENT', 'PARENT'],
    'What community service would be meaningful?',
    69
  ),

  // ============================================================================
  // ADDITIONAL VALIDATION QUESTIONS (for data quality)
  // ============================================================================

  createQuestion(
    'Q70',
    0,
    'Data Quality',
    'VALIDATION_1',
    'How long have you been associated with this school?',
    ['TEACHER', 'PARENT', 'STUDENT', 'ADMIN'],
    '',
    70
  ),

  createQuestion(
    'Q71',
    0,
    'Data Quality',
    'VALIDATION_2',
    'Is this your first time responding to this survey?',
    ['TEACHER', 'PARENT', 'STUDENT', 'ADMIN'],
    '',
    71
  ),
];

export const PERCEPTION_QUESTIONS_BY_DIMENSION = PERCEPTION_QUESTIONS_BANK.reduce(
  (acc, q) => {
    if (q.dimensionId !== 0) {
      if (!acc[q.dimensionId]) {
        acc[q.dimensionId] = [];
      }
      acc[q.dimensionId].push(q);
    }
    return acc;
  },
  {} as Record<number, SurveyQuestion[]>
);

export const PERCEPTION_QUESTIONS_BY_RESPONDENT_TYPE = PERCEPTION_QUESTIONS_BANK.reduce(
  (acc, q) => {
    q.respondentTypes.forEach((type) => {
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(q);
    });
    return acc;
  },
  {} as Record<string, SurveyQuestion[]>
);

export const getTotalQuestionCount = () => {
  const uniqueQuestions = PERCEPTION_QUESTIONS_BANK.filter((q) => q.dimensionId !== 0);
  return uniqueQuestions.length;
};

export const getQuestionsByDimension = (dimensionId: number) => {
  return PERCEPTION_QUESTIONS_BY_DIMENSION[dimensionId] || [];
};

export const getQuestionsByRespondentType = (respondentType: string) => {
  return PERCEPTION_QUESTIONS_BY_RESPONDENT_TYPE[respondentType] || [];
};

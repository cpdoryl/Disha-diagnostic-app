/**
 * DISHA 14-Dimension EWISR Complete Assessment Framework
 * Version: 2.0 (Complete - Per PDF Guide)
 * Last Updated: 2026-08-05
 *
 * This file contains the complete 14-Dimension Educational Worth Institutional
 * Strength Rating (EWISR) framework with all dimensions, questions, scoring, and benchmarks.
 *
 * Framework Structure:
 * - 14 dimensions across 4 tiers
 * - 4 assessment questions per dimension
 * - 5-6 response options per question with weights (1-10 scale)
 * - Comprehensive benchmarks for each dimension
 */

export interface DimensionOption {
  label: string;
  description?: string;
  value: number;
  weight: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

export interface AssessmentQuestion {
  id: string;
  questionId: string;
  label: string;
  options: DimensionOption[];
}

export interface DimensionBenchmark {
  excellent: number;
  good: number;
  average: number;
  poor: number;
}

export interface Dimension {
  id: string;
  dimensionId: string;
  label: string;
  weight: number;
  tier: 'Tier 1: Critical' | 'Tier 2: Major Drivers' | 'Tier 3: Supporting' | 'Tier 4: Specialization';
  definition: string;
  whyItMatters: string[];
  keyMetrics: string[];
  questions: AssessmentQuestion[];
  benchmarks: DimensionBenchmark;
  weightReasoning: string[];
}

// ============================================================================
// TIER 1: CRITICAL SUCCESS FACTORS (10% each - Total: 30%)
// These dimensions MUST be strong or school faces serious problems
// ============================================================================

export const TIER_1_DIMENSIONS: Dimension[] = [
  {
    id: 'd01_academic_reputation',
    dimensionId: 'D01',
    label: 'Academic Reputation & Rigour',
    weight: 10,
    tier: 'Tier 1: Critical',
    definition:
      'Perception and reality of academic quality, board exam performance, curriculum rigor, and institutional brand in academics.',
    whyItMatters: [
      'Core mission of educational institution',
      'Directly impacts parent choice and enrollment',
      'Foundation for everything else school does',
      'Board exam results are visible proof of quality'
    ],
    keyMetrics: [
      'Board exam pass rate vs national average',
      'Curriculum rigor vs peer schools',
      '% of high achievers (>70% aggregate)',
      'Community perception of academic standing'
    ],
    questions: [
      {
        id: 'q1_1',
        questionId: 'Q1.1',
        label: 'What is your board exam pass rate compared to national average?',
        options: [
          {
            label: '>85% pass rate, 15-25%+ above national average',
            value: 1,
            weight: 1,
            description: 'Excellent - Top tier performance'
          },
          {
            label: '75-85% pass rate, competitive with peers',
            value: 2,
            weight: 2,
            description: 'Good - Above average'
          },
          {
            label: '65-75% pass rate, at par with national average',
            value: 3,
            weight: 3,
            description: 'Average - Meets baseline'
          },
          {
            label: '55-65% pass rate, below national average',
            value: 4,
            weight: 4,
            description: 'Below Average - Needs improvement'
          },
          {
            label: '<55% pass rate, significant gap to national',
            value: 5,
            weight: 5,
            description: 'Poor - Urgent attention'
          }
        ]
      },
      {
        id: 'q1_2',
        questionId: 'Q1.2',
        label: 'How does your curriculum rigor compare to peer schools?',
        options: [
          {
            label: 'Highly rigorous, clearly differentiates us',
            value: 1,
            weight: 1,
            description: 'Excellent - Competitive edge'
          },
          {
            label: 'Above average rigor, competitive edge',
            value: 2,
            weight: 2,
            description: 'Good - Strong positioning'
          },
          {
            label: 'Comparable to peer schools',
            value: 3,
            weight: 3,
            description: 'Average - At par'
          },
          {
            label: 'Below peer schools, needs strengthening',
            value: 4,
            weight: 4,
            description: 'Below Average - Lagging'
          },
          {
            label: 'Significantly weaker than peers',
            value: 5,
            weight: 5,
            description: 'Poor - Major gap'
          }
        ]
      },
      {
        id: 'q1_3',
        questionId: 'Q1.3',
        label: 'What percentage of students score 70%+ aggregate?',
        options: [
          {
            label: '>85% of students score 70%+ aggregate',
            value: 1,
            weight: 1,
            description: 'Excellent - Exceptional achievement'
          },
          {
            label: '70-85% of students score 70%+',
            value: 2,
            weight: 2,
            description: 'Good - Strong performance'
          },
          {
            label: '50-70% of students score 70%+',
            value: 3,
            weight: 3,
            description: 'Average - Adequate'
          },
          {
            label: '30-50% of students score 70%+',
            value: 4,
            weight: 4,
            description: 'Below Average - Concerning'
          },
          {
            label: '<30% of students score 70%+',
            value: 5,
            weight: 5,
            description: 'Poor - Critical issue'
          }
        ]
      },
      {
        id: 'q1_4',
        questionId: 'Q1.4',
        label: 'What is the community perception of your academic standing?',
        options: [
          {
            label: 'Top-of-mind for academic excellence',
            value: 1,
            weight: 1,
            description: 'Excellent - Strong brand'
          },
          {
            label: 'Well-known for good academics',
            value: 2,
            weight: 2,
            description: 'Good - Positive perception'
          },
          {
            label: 'Reasonably known for acceptable academics',
            value: 3,
            weight: 3,
            description: 'Average - Neutral'
          },
          {
            label: 'Less known, questions about quality',
            value: 4,
            weight: 4,
            description: 'Below Average - Uncertain'
          },
          {
            label: 'Negative perception or weak reputation',
            value: 5,
            weight: 5,
            description: 'Poor - Damaged reputation'
          }
        ]
      }
    ],
    benchmarks: {
      excellent: 85,
      good: 60,
      average: 40,
      poor: 20
    },
    weightReasoning: [
      '10% reflects that academics is core mission',
      'Not 20% because other factors also matter',
      'Research shows academic quality is #1 parent decision factor',
      'Directly linked to institutional brand and sustainability'
    ]
  },

  {
    id: 'd03_leadership_governance',
    dimensionId: 'D03',
    label: 'Leadership & Governance Quality',
    weight: 10,
    tier: 'Tier 1: Critical',
    definition:
      'Leadership competence, vision clarity, governance structure, decision-making effectiveness, and institutional direction.',
    whyItMatters: [
      'Leadership sets direction and culture',
      'Governance determines resource allocation',
      'Decision-making effectiveness impacts all operations',
      'Vision clarity aligns everyone toward goals'
    ],
    keyMetrics: [
      'Clarity and communication of vision',
      'Decision-making speed and quality',
      'Leadership experience in education',
      'Succession planning strength'
    ],
    questions: [
      {
        id: 'q3_1',
        questionId: 'Q3.1',
        label: 'How clear and inspiring is your institutional vision?',
        options: [
          {
            label: 'Crystal clear, highly inspiring, widely known',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Clear vision, well communicated, understood by most',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Somewhat clear, basic understanding by staff/parents',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Unclear or poorly communicated',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'No clear vision or mission statement',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q3_2',
        questionId: 'Q3.2',
        label: 'How effective is your decision-making process?',
        options: [
          {
            label: 'Excellent - Quick, data-driven, inclusive',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Good - Timely decisions, generally sound',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Adequate - Slow but generally sound',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Slow or inconsistent decision-making',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Dysfunctional - Slow, reactive, poor outcomes',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q3_3',
        questionId: 'Q3.3',
        label: 'How much education leadership experience does the top leader have?',
        options: [
          {
            label: '15+ years in educational leadership',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '10-15 years in educational leadership',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '7-10 years in educational leadership',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '3-7 years in educational leadership',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '<3 years or non-education background',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q3_4',
        questionId: 'Q3.4',
        label: 'How strong is your succession planning?',
        options: [
          {
            label: 'Strong pipeline, clear development plans',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Identified successors with some development',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Basic succession plan exists',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Informal or incomplete succession planning',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'No formal succession plan',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      }
    ],
    benchmarks: {
      excellent: 85,
      good: 60,
      average: 40,
      poor: 20
    },
    weightReasoning: [
      '10% reflects that leadership affects all institutional outcomes',
      'Good leadership multiplies impact of resources',
      'Vision clarity prevents drift and inconsistency',
      'Succession planning ensures institutional continuity'
    ]
  },

  {
    id: 'd05_student_safety_wellness',
    dimensionId: 'D05',
    label: 'Student Safety & Wellness',
    weight: 10,
    tier: 'Tier 1: Critical',
    definition:
      'Physical safety, mental health support, anti-bullying measures, counseling services, and overall student wellbeing programs.',
    whyItMatters: [
      'Safety is legal and moral requirement',
      'Safe students learn better',
      'Mental health crisis growing in schools',
      'Bullying damages learning environment',
      'Non-negotiable for parent trust'
    ],
    keyMetrics: [
      'Student perception of safety',
      'Bullying/harassment prevention effectiveness',
      'Mental health support availability',
      'Mental health issues reported'
    ],
    questions: [
      {
        id: 'q5_1',
        questionId: 'Q5.1',
        label: 'How safe do students feel in your school?',
        options: [
          {
            label: 'Extremely safe - comprehensive security measures',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Very safe - good security and monitoring',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Safe - adequate measures in place',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Somewhat unsafe - some gaps in security',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Unsafe - significant security gaps',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q5_2',
        questionId: 'Q5.2',
        label: 'How effective is your bullying/harassment prevention?',
        options: [
          {
            label: 'Excellent prevention - proactive programs',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Good - reported and addressed quickly',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Adequate - some prevention, referral services',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Weak prevention, delayed response',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Systemic bullying, no prevention',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q5_3',
        questionId: 'Q5.3',
        label: 'What mental health support is available?',
        options: [
          {
            label: 'Comprehensive - counselor, programs, referrals',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Good - counselor present, some programs',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Adequate - basic support and referrals',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Minimal - very limited support',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'No formal mental health support',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q5_4',
        questionId: 'Q5.4',
        label: 'What percentage of students report mental health issues?',
        options: [
          {
            label: 'Very few - <2% report issues',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Low - 2-5% report issues',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Moderate - 5-10% report issues',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'High - 10-15% report issues',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Very high - >15% report issues',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      }
    ],
    benchmarks: {
      excellent: 85,
      good: 60,
      average: 40,
      poor: 20
    },
    weightReasoning: [
      '10% reflects that safety is fundamental requirement',
      "Can't learn if not safe",
      'Mental health increasingly critical issue',
      'Legal liability for schools that don\'t protect students',
      'Parent #2 concern (after academics)'
    ]
  }
];

// ============================================================================
// TIER 2: MAJOR PERFORMANCE DRIVERS (8-9% each - Total: 43%)
// Strong performance here drives reputation and retention
// ============================================================================

export const TIER_2_DIMENSIONS: Dimension[] = [
  {
    id: 'd02_teacher_welfare',
    dimensionId: 'D02',
    label: 'Teacher Welfare & Development',
    weight: 9,
    tier: 'Tier 2: Major Drivers',
    definition:
      'Teacher satisfaction, professional development, work-life balance, compensation, and growth opportunities.',
    whyItMatters: [
      'Happy teachers deliver better teaching',
      'Teacher turnover disrupts learning',
      'Professional development improves instructional quality',
      'Compensation drives retention and morale'
    ],
    keyMetrics: [
      'Annual teacher attrition rate',
      'Annual professional development hours',
      'Teacher satisfaction with compensation',
      'Career growth pathways available'
    ],
    questions: [
      {
        id: 'q2_1',
        questionId: 'Q2.1',
        label: 'What is your annual teacher attrition rate?',
        options: [
          {
            label: '<5% turnover - Excellent retention',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '5-10% turnover - Good retention',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '10-15% turnover - Average',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '15-25% turnover - High attrition',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '>25% turnover - Critical loss',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q2_2',
        questionId: 'Q2.2',
        label: 'How many professional development hours annually?',
        options: [
          {
            label: '≥30 hours/year - Excellent investment',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '20-30 hours/year - Good investment',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '15-20 hours/year - Adequate',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '10-15 hours/year - Minimal',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '<10 hours/year - Very limited',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q2_3',
        questionId: 'Q2.3',
        label: 'How satisfied are teachers with compensation?',
        options: [
          {
            label: 'Very satisfied - Competitive with market',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Adequately satisfied - At market rate',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Neutral - Fair but not exceptional',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Dissatisfied - Below market',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Very dissatisfied - Significantly below market',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q2_4',
        questionId: 'Q2.4',
        label: 'What career advancement opportunities exist?',
        options: [
          {
            label: 'Clear multiple advancement routes available',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Some advancement pathways exist',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Limited advancement opportunities',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Very limited career growth paths',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'No clear advancement opportunities',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      }
    ],
    benchmarks: {
      excellent: 85,
      good: 60,
      average: 40,
      poor: 20
    },
    weightReasoning: [
      '9% reflects that teacher quality drives all other outcomes',
      'Not 15% because external factors also influence outcomes',
      'Research shows teacher quality accounts for 30-40% of learning outcomes',
      'Wellbeing directly impacts retention and morale'
    ]
  },

  {
    id: 'd04_parent_engagement',
    dimensionId: 'D04',
    label: 'Parent Engagement & SLA',
    weight: 8,
    tier: 'Tier 2: Major Drivers',
    definition:
      'Parent satisfaction, communication effectiveness, response time, parent involvement in school activities, and value alignment.',
    whyItMatters: [
      'Parent satisfaction → Student retention',
      'Parent involvement → Better student outcomes',
      'Communication builds trust and loyalty',
      'Value alignment ensures family-school partnership'
    ],
    keyMetrics: [
      'Parent satisfaction score',
      'Average response time to queries',
      'Parent participation in activities',
      'Parent trust and feeling valued'
    ],
    questions: [
      {
        id: 'q4_1',
        questionId: 'Q4.1',
        label: 'What percentage of parents are satisfied with communication?',
        options: [
          {
            label: '90%+ satisfied - Excellent engagement',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '75-90% satisfied - Good engagement',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '50-75% satisfied - Adequate',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '25-50% satisfied - Low engagement',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '<25% satisfied - Critical dissatisfaction',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q4_2',
        questionId: 'Q4.2',
        label: 'What is your average response time to parent queries?',
        options: [
          {
            label: '<4 hours - Excellent responsiveness',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '<12 hours - Good responsiveness',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '<24 hours - Adequate',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '2-3 days - Slow response',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '>3 days - Poor responsiveness',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q4_3',
        questionId: 'Q4.3',
        label: 'What percentage of parents participate in school activities?',
        options: [
          {
            label: '80%+ participation - Excellent involvement',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '60-80% participation - Good involvement',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '40-60% participation - Adequate',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '20-40% participation - Low involvement',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '<20% participation - Minimal involvement',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q4_4',
        questionId: 'Q4.4',
        label: 'Do parents feel valued and listened to?',
        options: [
          {
            label: 'Strongly agree - High trust',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Agree - Good trust',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Neutral - Adequate trust',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Disagree - Low trust',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Strongly disagree - No trust',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      }
    ],
    benchmarks: {
      excellent: 85,
      good: 60,
      average: 40,
      poor: 20
    },
    weightReasoning: [
      '8% reflects that parents are key stakeholders',
      'Strong parent engagement improves retention',
      'Not 15% because academics ultimately drives perception',
      'Retention = revenue = sustainability'
    ]
  },

  {
    id: 'd08_individual_attention',
    dimensionId: 'D08',
    label: 'Individual Attention (PTR)',
    weight: 9,
    tier: 'Tier 2: Major Drivers',
    definition:
      'Pupil-teacher ratio, personalized learning, individual student attention, remedial support, and differentiated instruction.',
    whyItMatters: [
      'Class size directly impacts learning quality',
      'Personalized learning critical for diverse learners',
      'Remedial support prevents failures',
      'Individual attention builds confidence',
      'Differentiator for premium schools'
    ],
    keyMetrics: [
      'Average pupil-teacher ratio',
      '% students with personalized learning plans',
      'Remedial support system effectiveness',
      'Differentiated instruction implementation'
    ],
    questions: [
      {
        id: 'q8_1',
        questionId: 'Q8.1',
        label: 'What is your average pupil-teacher ratio (PTR)?',
        options: [
          {
            label: '≤15:1 - Excellent low class size',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '16-20:1 - Good class size',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '21-30:1 - Average class size',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '31-40:1 - High class size',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '>40:1 - Very high class size',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q8_2',
        questionId: 'Q8.2',
        label: 'What percentage of students have personalized learning plans?',
        options: [
          {
            label: '>80% with personalized plans',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '60-80% with personalized plans',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '40-60% with personalized plans',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '20-40% with personalized plans',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '<20% with personalized plans',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q8_3',
        questionId: 'Q8.3',
        label: 'How effective is your remedial support system?',
        options: [
          {
            label: '90%+ of struggling students improve',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '70-90% of struggling students improve',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '50-70% of struggling students improve',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '30-50% of struggling students improve',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '<30% of struggling students improve',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q8_4',
        questionId: 'Q8.4',
        label: 'How well is differentiated instruction implemented?',
        options: [
          {
            label: 'Highly differentiated across all subjects',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Well differentiated in most subjects',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Adequately differentiated',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Weakly differentiated',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'No differentiation - one-size-fits-all',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      }
    ],
    benchmarks: {
      excellent: 85,
      good: 60,
      average: 40,
      poor: 20
    },
    weightReasoning: [
      '9% reflects that teaching quality depends on class management',
      'Lower PTR enables better teaching',
      'Research shows diminishing returns after 25:1',
      'Economic trade-off (more teachers = higher costs)',
      'Directly impacts learning outcomes'
    ]
  },

  {
    id: 'd12_faculty_competence',
    dimensionId: 'D12',
    label: 'Faculty Competence & Retention',
    weight: 9,
    tier: 'Tier 2: Major Drivers',
    definition:
      'Teacher qualifications, subject expertise, teaching quality, continuous improvement, and faculty stability.',
    whyItMatters: [
      'Teacher quality is #1 determinant of student learning',
      'Expertise ensures accurate content delivery',
      'Turnover disrupts learning continuity',
      'Qualifications build credibility',
      'Professional growth sustains competence'
    ],
    keyMetrics: [
      '% teachers with subject specialization',
      '% with higher qualifications (MA/M.Ed)',
      'Average teacher tenure',
      'Teacher evaluation and improvement frequency'
    ],
    questions: [
      {
        id: 'q12_1',
        questionId: 'Q12.1',
        label: 'What percentage of teachers are subject specialists?',
        options: [
          {
            label: '>90% subject specialists - Excellent',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '80-90% subject specialists - Good',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '70-80% subject specialists - Average',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '50-70% subject specialists - Below avg',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '<50% subject specialists - Poor',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q12_2',
        questionId: 'Q12.2',
        label: 'What percentage have higher qualifications (MA/M.Ed)?',
        options: [
          {
            label: '>70% with higher qualifications',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '50-70% with higher qualifications',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '30-50% with higher qualifications',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '10-30% with higher qualifications',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '<10% with higher qualifications',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q12_3',
        questionId: 'Q12.3',
        label: 'What is the average teacher tenure?',
        options: [
          {
            label: '10+ years average tenure',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '7-10 years average tenure',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '5-7 years average tenure',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '3-5 years average tenure',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '<3 years average tenure',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q12_4',
        questionId: 'Q12.4',
        label: 'How frequently are teachers formally evaluated?',
        options: [
          {
            label: 'Quarterly or more frequently',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Bi-annual evaluation',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Annual evaluation',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Rare/informal evaluation',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'No formal evaluation',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      }
    ],
    benchmarks: {
      excellent: 85,
      good: 60,
      average: 40,
      poor: 20
    },
    weightReasoning: [
      '9% reflects that faculty quality drives all outcomes',
      'Highly qualified teachers = better student learning',
      'Tenure stability ensures knowledge preservation',
      'Regular evaluation drives improvement',
      'Complementary to D02 (Welfare) which focuses on satisfaction'
    ]
  },

  {
    id: 'd14_management_vision',
    dimensionId: 'D14',
    label: 'Management Vision & Growth Drive',
    weight: 8,
    tier: 'Tier 2: Major Drivers',
    definition:
      'Strategic planning, innovation initiatives, growth trajectory, market positioning, and future readiness.',
    whyItMatters: [
      'Vision provides direction and prevents drift',
      'Strategic planning ensures sustainability',
      'Growth trajectory indicates market confidence',
      'Innovation keeps school competitive',
      'Future readiness ensures longevity'
    ],
    keyMetrics: [
      'Existence and quality of 5-year strategic plan',
      '3-year enrollment growth trajectory',
      'Innovation in teaching methods',
      'Preparedness for future trends'
    ],
    questions: [
      {
        id: 'q14_1',
        questionId: 'Q14.1',
        label: 'Do you have a clear 5-year strategic plan?',
        options: [
          {
            label: 'Detailed plan with quarterly monitoring',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Documented plan reviewed annually',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Basic plan exists',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Informal planning',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'No formal plan',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q14_2',
        questionId: 'Q14.2',
        label: 'What is your 3-year enrollment growth trajectory?',
        options: [
          {
            label: '15%+ growth - Strong confidence',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '10-15% growth - Good confidence',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '5-10% growth - Adequate',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '<5% growth - Slow',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Negative growth - Declining',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q14_3',
        questionId: 'Q14.3',
        label: 'How strong is innovation in teaching methods?',
        options: [
          {
            label: 'Constant innovation and experimentation',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Regular new initiatives',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Some new methods adopted',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Traditional methods only',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'No innovation, stagnant',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q14_4',
        questionId: 'Q14.4',
        label: 'How prepared are you for future trends?',
        options: [
          {
            label: 'Very prepared - leading edge',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Good readiness',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Adequate readiness',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Lagging on some trends',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Unprepared for change',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      }
    ],
    benchmarks: {
      excellent: 85,
      good: 60,
      average: 40,
      poor: 20
    },
    weightReasoning: [
      '8% reflects that strategy drives sustainability',
      'Schools without vision drift and fail',
      'Growth trajectory shows market health',
      'Innovation keeps school from becoming obsolete',
      'Not as immediate as current operations (hence 8% not 12%)'
    ]
  }
];

// ============================================================================
// TIER 3: SUPPORTING FACTORS (5-7% each - Total: 19%)
// Important for competitive differentiation and long-term viability
// ============================================================================

export const TIER_3_DIMENSIONS: Dimension[] = [
  {
    id: 'd06_infrastructure',
    dimensionId: 'D06',
    label: 'Infrastructure & Facilities',
    weight: 7,
    tier: 'Tier 3: Supporting',
    definition:
      'Quality of buildings, classrooms, technology, labs, sports facilities, libraries, and overall maintenance standards.',
    whyItMatters: [
      'Environment impacts learning and morale',
      'Poor infrastructure signals poor institution',
      'Technology enables modern pedagogy',
      'Maintenance reflects institutional pride',
      'Affects school rankings and reputation'
    ],
    keyMetrics: [
      'Overall infrastructure quality rating',
      'Technology integration level',
      'Maintenance backlog status',
      'Specialized facilities adequacy (labs, library, sports)'
    ],
    questions: [
      {
        id: 'q6_1',
        questionId: 'Q6.1',
        label: 'What is your overall infrastructure quality?',
        options: [
          {
            label: 'Modern, well-maintained - Premium',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Mostly adequate, minor updates needed',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Functional but aging',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Significant deficits',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Major infrastructure issues',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q6_2',
        questionId: 'Q6.2',
        label: 'How well is technology integrated?',
        options: [
          {
            label: 'Advanced tech in all classrooms',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Most tech infrastructure in place',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Some tech available',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Minimal tech integration',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'No tech integration',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q6_3',
        questionId: 'Q6.3',
        label: 'What is your maintenance backlog status?',
        options: [
          {
            label: 'All facilities current and maintained',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Minor maintenance backlog',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Moderate maintenance issues',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Significant maintenance backlog',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Major unresolved maintenance issues',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q6_4',
        questionId: 'Q6.4',
        label: 'How adequate are specialized facilities?',
        options: [
          {
            label: 'Excellent facilities - labs, library, sports',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Good specialized facilities',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Adequate basic facilities',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Limited specialized facilities',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Major gaps in facilities',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      }
    ],
    benchmarks: {
      excellent: 85,
      good: 60,
      average: 40,
      poor: 20
    },
    weightReasoning: [
      '7% reflects importance but not primacy',
      'Infrastructure enables good teaching but doesn\'t guarantee it',
      'Parents notice and evaluate facilities',
      'Maintenance costs can strain finances',
      'First impression factor'
    ]
  },

  {
    id: 'd09_value_for_money',
    dimensionId: 'D09',
    label: 'Value for Money',
    weight: 7,
    tier: 'Tier 3: Supporting',
    definition:
      'Tuition affordability, fee structure value, scholarship/aid availability, financial sustainability, and cost-benefit perception.',
    whyItMatters: [
      'Affordability determines market reach',
      'Parent perception of value drives retention',
      'Financial sustainability ensures survival',
      'Scholarships enable access and diversity',
      'Fee collection health determines cashflow'
    ],
    keyMetrics: [
      'Fee competitiveness vs peers',
      '% students receiving scholarships',
      'Fee realization rate',
      'Parent perception of value'
    ],
    questions: [
      {
        id: 'q9_1',
        questionId: 'Q9.1',
        label: 'How does your fee structure compare to peer schools?',
        options: [
          {
            label: 'More affordable than peers',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'At par with peers',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Slightly expensive',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Expensive compared to peers',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Very expensive, uncompetitive',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q9_2',
        questionId: 'Q9.2',
        label: 'What percentage of students receive scholarships/aid?',
        options: [
          {
            label: '>20% receive aid',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '15-20% receive aid',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '10-15% receive aid',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '5-10% receive aid',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '<5% receive aid',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q9_3',
        questionId: 'Q9.3',
        label: 'What is your fee realization rate?',
        options: [
          {
            label: '95-100% collection rate',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '90-95% collection rate',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '85-90% collection rate',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '75-85% collection rate',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '<75% collection rate',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q9_4',
        questionId: 'Q9.4',
        label: 'Do parents perceive good value for fees?',
        options: [
          {
            label: 'Excellent value perception',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Good value perception',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Adequate value perception',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Poor value perception',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Very poor value perception',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      }
    ],
    benchmarks: {
      excellent: 85,
      good: 60,
      average: 40,
      poor: 20
    },
    weightReasoning: [
      '7% reflects that value is important but not primary',
      'Parents prioritize academics over affordability',
      'Financial stress can lead to closure',
      'Affects ability to invest in quality improvements',
      'Scholarship/aid enables access and brand building'
    ]
  },

  {
    id: 'd11_community_service',
    dimensionId: 'D11',
    label: 'Community Service & Social Responsibility',
    weight: 5,
    tier: 'Tier 3: Supporting',
    definition:
      'Community outreach programs, social responsibility initiatives, environmental awareness, and student social engagement.',
    whyItMatters: [
      'Develops social consciousness in students',
      'Community partnership strengthens school image',
      'Environmental sustainability increasingly important',
      'Values alignment builds parent loyalty',
      'NEP 2020 emphasizes social responsibility'
    ],
    keyMetrics: [
      'Number of active community programs',
      '% student participation in service',
      'Environmental sustainability focus strength',
      'Community partnership depth'
    ],
    questions: [
      {
        id: 'q11_1',
        questionId: 'Q11.1',
        label: 'How many active community service programs do you have?',
        options: [
          {
            label: '10+ programs - Excellent engagement',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '7-10 programs - Good engagement',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '4-7 programs - Adequate',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '1-4 programs - Limited',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'No community programs',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q11_2',
        questionId: 'Q11.2',
        label: 'What percentage of students participate in service?',
        options: [
          {
            label: '>80% participation - Excellent',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '60-80% participation - Good',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '40-60% participation - Adequate',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '20-40% participation - Low',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '<20% participation - Minimal',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q11_3',
        questionId: 'Q11.3',
        label: 'How strong is your environmental sustainability focus?',
        options: [
          {
            label: 'Very strong - Multiple initiatives',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Strong focus - Some initiatives',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Moderate focus',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Weak focus',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'No sustainability focus',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q11_4',
        questionId: 'Q11.4',
        label: 'How engaged is your community partnership?',
        options: [
          {
            label: 'Deeply engaged with active partnerships',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Good partnerships with community',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Some community engagement',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Limited community engagement',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'No community engagement',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      }
    ],
    benchmarks: {
      excellent: 85,
      good: 60,
      average: 40,
      poor: 20
    },
    weightReasoning: [
      '5% reflects importance for values but not core operations',
      'Lower than academics (which is primary mission)',
      'Growing importance in holistic education',
      'NEP 2020 and CSR requirements',
      'Student character development factor'
    ]
  }
];

// ============================================================================
// TIER 4: SPECIALIZATION & ENHANCEMENT (5-6% each - Total: 17%)
// Differentiators for premium positioning
// ============================================================================

export const TIER_4_DIMENSIONS: Dimension[] = [
  {
    id: 'd07_cocurricular',
    dimensionId: 'D07',
    label: 'Co-Curricular Education',
    weight: 6,
    tier: 'Tier 4: Specialization',
    definition:
      'Sports programs, arts and cultural activities, clubs, competitions, and development of non-academic skills.',
    whyItMatters: [
      'Holistic development of students',
      'Co-curricular builds confidence and skills',
      'Differentiation and brand building',
      'Engages different learner types',
      'College admissions value this'
    ],
    keyMetrics: [
      'Number of programs available',
      '% of students participating',
      'Track record in competitions',
      'Integration with academics'
    ],
    questions: [
      {
        id: 'q7_1',
        questionId: 'Q7.1',
        label: 'How many co-curricular programs do you offer?',
        options: [
          {
            label: '20+ programs - Excellent variety',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '15-20 programs - Good variety',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '10-15 programs - Adequate',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '5-10 programs - Limited',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '<5 programs - Very limited',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q7_2',
        questionId: 'Q7.2',
        label: 'What percentage of students participate?',
        options: [
          {
            label: '80%+ participation - Excellent',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '60-80% participation - Good',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '40-60% participation - Adequate',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '20-40% participation - Low',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '<20% participation - Minimal',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q7_3',
        questionId: 'Q7.3',
        label: 'What is your competition performance record?',
        options: [
          {
            label: 'Consistent winner - Excellence',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Regular medals and wins',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Occasional wins',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Minimal competition participation',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'No competitions',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q7_4',
        questionId: 'Q7.4',
        label: 'How integrated are co-curricular activities with academics?',
        options: [
          {
            label: 'Highly integrated - Complements learning',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Well integrated',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Somewhat integrated',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Weakly integrated',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Separate from academics',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      }
    ],
    benchmarks: {
      excellent: 85,
      good: 60,
      average: 40,
      poor: 20
    },
    weightReasoning: [
      '6% reflects importance for holistic development',
      'Lower than academics (core mission is academics)',
      'Growing importance in modern education',
      'Differentiator in competitive market',
      'Student wellbeing and engagement factor'
    ]
  },

  {
    id: 'd10_special_needs',
    dimensionId: 'D10',
    label: 'Special Needs Inclusivity',
    weight: 6,
    tier: 'Tier 4: Specialization',
    definition:
      'Support for students with special educational needs, disability inclusion, accessibility, trained staff, and individualized support.',
    whyItMatters: [
      'Inclusive education is legal and moral requirement',
      'Growing population of SEN students needs support',
      'Integration improves outcomes for all students',
      'Accessibility signals institutional values',
      'Emerging competitive differentiator'
    ],
    keyMetrics: [
      '% enrollment of SEN students',
      'Availability of SEN support systems',
      'Infrastructure accessibility',
      'SEN student retention/completion rate'
    ],
    questions: [
      {
        id: 'q10_1',
        questionId: 'Q10.1',
        label: 'What percentage of SEN students are enrolled?',
        options: [
          {
            label: '>5% SEN enrollment - Strong inclusion',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '3-5% SEN enrollment - Good inclusion',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '1-3% SEN enrollment - Adequate',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '<1% SEN enrollment - Limited',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'No SEN students - No inclusion',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q10_2',
        questionId: 'Q10.2',
        label: 'What SEN support systems are available?',
        options: [
          {
            label: 'Comprehensive support + specialist staff',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Good support with specialist + services',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Basic support available',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Minimal support',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'No support system',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q10_3',
        questionId: 'Q10.3',
        label: 'How accessible is your infrastructure?',
        options: [
          {
            label: 'Fully accessible - All facilities',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Mostly accessible',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Partially accessible',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Minimally accessible',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Not accessible',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q10_4',
        questionId: 'Q10.4',
        label: 'What is your SEN student retention/completion rate?',
        options: [
          {
            label: '90%+ completion rate',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '75-90% completion rate',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '50-75% completion rate',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '25-50% completion rate',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '<25% completion rate',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      }
    ],
    benchmarks: {
      excellent: 85,
      good: 60,
      average: 40,
      poor: 20
    },
    weightReasoning: [
      '6% reflects emerging importance',
      'Not a luxury but essential service',
      'Growing regulatory expectations',
      'NEP 2020 and UNCRPD emphasize inclusion',
      'Improves institutional culture'
    ]
  },

  {
    id: 'd13_internationalism',
    dimensionId: 'D13',
    label: 'Internationalism & Cultural Diversity',
    weight: 6,
    tier: 'Tier 4: Specialization',
    definition:
      'International curriculum/programs, cultural diversity embrace, global perspective teaching, and international partnerships.',
    whyItMatters: [
      'Global competence increasingly critical skill',
      'Cultural diversity enriches learning',
      'International programs attract discerning parents',
      'Global partnerships enhance learning',
      'NEP 2020 emphasizes internationalization'
    ],
    keyMetrics: [
      '% of curriculum with international content',
      'Availability of international exams (IB/A-Level)',
      'Cultural diversity in student body',
      'International partnerships and exchanges'
    ],
    questions: [
      {
        id: 'q13_1',
        questionId: 'Q13.1',
        label: 'What percentage of curriculum has international content?',
        options: [
          {
            label: '50%+ international content',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: '30-50% international content',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: '15-30% international content',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: '5-15% international content',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: '<5% international content',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q13_2',
        questionId: 'Q13.2',
        label: 'Do you offer international exam programs?',
        options: [
          {
            label: 'Full IB/A-Level curriculum',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Selective international programs',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Partial international programs',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'No international programs',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Not offered',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q13_3',
        questionId: 'Q13.3',
        label: 'How diverse is your student body culturally?',
        options: [
          {
            label: 'Highly diverse - 3-5+ communities',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Diverse - Multiple communities',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Moderate diversity',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'Low diversity',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Homogeneous',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      },
      {
        id: 'q13_4',
        questionId: 'Q13.4',
        label: 'Do you have international partnerships/exchanges?',
        options: [
          {
            label: 'Active partnerships with exchanges',
            value: 1,
            weight: 1,
            description: 'Excellent'
          },
          {
            label: 'Some partnerships',
            value: 2,
            weight: 2,
            description: 'Good'
          },
          {
            label: 'Minimal partnerships',
            value: 3,
            weight: 3,
            description: 'Average'
          },
          {
            label: 'No partnerships',
            value: 4,
            weight: 4,
            description: 'Below Average'
          },
          {
            label: 'Not offered',
            value: 5,
            weight: 5,
            description: 'Poor'
          }
        ]
      }
    ],
    benchmarks: {
      excellent: 85,
      good: 60,
      average: 40,
      poor: 20
    },
    weightReasoning: [
      '6% reflects growing but not primary importance',
      'Differentiator in premium market segment',
      'Global skills increasingly valued by employers',
      'Not relevant for all market segments',
      'NEP 2020 and globalization trends'
    ]
  }
];

// ============================================================================
// EXPORT ALL DIMENSIONS
// ============================================================================

export const ALL_DIMENSIONS: Dimension[] = [
  ...TIER_1_DIMENSIONS,
  ...TIER_2_DIMENSIONS,
  ...TIER_3_DIMENSIONS,
  ...TIER_4_DIMENSIONS
];

export const DIMENSIONS_BY_TIER = {
  tier1: TIER_1_DIMENSIONS,
  tier2: TIER_2_DIMENSIONS,
  tier3: TIER_3_DIMENSIONS,
  tier4: TIER_4_DIMENSIONS
};

// ============================================================================
// WEIGHT SYSTEM
// ============================================================================

export const WEIGHT_DISTRIBUTION = {
  tier1: { count: 3, percentEach: 10, total: 30 },
  tier2: { count: 5, percentEach: '8-9', total: 43 },
  tier3: { count: 3, percentEach: '5-7', total: 19 },
  tier4: { count: 3, percentEach: 6, total: 17 },
  grandTotal: 109 // normalized to 100 in calculation
};

// ============================================================================
// CONVERSION FORMULAS
// ============================================================================

export const SCORING_FORMULAS = {
  /**
   * Convert average question weight (1-10 scale) to dimension score (0-100 scale)
   * Formula: Dimension Score = 100 - (Average Weight × 10)
   *
   * Why this formula?
   * - Weight 1 → Score 90 (excellent)
   * - Weight 2 → Score 80 (very good)
   * - Weight 3 → Score 70 (good)
   * - Weight 4 → Score 60 (average)
   * - Weight 5+ → Score 50- (below average/poor)
   */
  dimensionScore: (averageWeight: number): number => {
    return Math.max(0, 100 - averageWeight * 10);
  },

  /**
   * Calculate weighted contribution of a dimension to overall score
   * Formula: Weighted Contribution = (Dimension Score / 100) × Dimension Weight
   */
  weightedContribution: (dimensionScore: number, weight: number): number => {
    return (dimensionScore / 100) * weight;
  },

  /**
   * Calculate Overall Health Index from all dimensions
   * Formula: Overall Health Index = (Sum of Weighted Contributions / Sum of Weights) × 100
   */
  overallHealthIndex: (weightedContributions: number[], totalWeights: number): number => {
    const sum = weightedContributions.reduce((a, b) => a + b, 0);
    return (sum / totalWeights) * 100;
  }
};

// ============================================================================
// BENCHMARKS & INTERPRETATION
// ============================================================================

export const HEALTH_STATUS_CLASSIFICATION = {
  'ELITE EXCELLENCE': { min: 90, max: 100, description: 'World-class institutional health' },
  'STRONG PERFORMER': { min: 80, max: 89, description: 'Well-managed institution' },
  'HEALTHY SCHOOL': { min: 70, max: 79, description: 'Good foundation, areas to develop' },
  'AVERAGE PERFORMER': { min: 60, max: 69, description: 'Mixed strengths and weaknesses' },
  'BELOW AVERAGE': { min: 50, max: 59, description: 'Multiple significant gaps' },
  'NEEDS SIGNIFICANT IMPROVEMENT': { min: 0, max: 49, description: 'Critical issues requiring urgent action' }
};

export const ACTION_PLANNING_THRESHOLDS = {
  'MAINTAIN & ENHANCE': { min: 80, description: 'Continue current practices, focus on incremental improvement' },
  DEVELOP: { min: 70, max: 79, description: 'Identify gaps, create 12-month improvement plan' },
  IMPROVE: { min: 60, max: 69, description: 'Root cause analysis, comprehensive improvement plan (6-12 months)' },
  'URGENT ACTION': { min: 0, max: 59, description: 'Address immediately, dedicated task force, monthly monitoring' }
};

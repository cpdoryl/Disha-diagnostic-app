/**
 * DISHA First Opinion Engine - Seed Data
 * Multiplier definitions and challenge catalog
 * Source: FIRST_OPINION_ENGINE_TECH_STACK.md §3-4
 */

export interface MultiplierThreshold {
  label: string
  min: number
  max: number
  score: number
}

export interface MultiplierDataCard {
  id: string
  name: string
  category: 'CORE' | 'EXPANDED'
  unit: string
  direction: 'higher_is_better' | 'lower_is_better'
  thresholds: MultiplierThreshold[]
  description: string
  sources: string[]
}

export interface Challenge {
  id: string
  title: string
  domain: string
  description: string
  severity: number
  weight: number
  affectedDimensions: string[]
}

/**
 * 8 Multipliers for the First Opinion Engine
 * 4 Core (M1-M4) + 4 Expanded (M5-M8)
 * Thresholds follow the pattern: Excellent > Good > Average > Critical
 */
export const MULTIPLIER_DATA_CARDS: MultiplierDataCard[] = [
  {
    id: 'M1',
    name: 'Student Teacher Ratio (STR)',
    category: 'CORE',
    unit: 'students_per_teacher',
    direction: 'lower_is_better',
    thresholds: [
      { label: 'Excellent', min: 0, max: 25, score: 1.0 },
      { label: 'Good', min: 25, max: 30, score: 0.8 },
      { label: 'Average', min: 30, max: 35, score: 0.6 },
      { label: 'Critical', min: 35, max: 999, score: 0.0 }
    ],
    description: 'Student-to-teacher ratio; lower ratios indicate more personalized attention',
    sources: ['HR System', 'Admissions']
  },
  {
    id: 'M2',
    name: 'Parent Response Service Level Agreement (SLA)',
    category: 'CORE',
    unit: 'hours',
    direction: 'lower_is_better',
    thresholds: [
      { label: 'Excellent', min: 0, max: 4, score: 1.0 },
      { label: 'Good', min: 4, max: 8, score: 0.8 },
      { label: 'Average', min: 8, max: 24, score: 0.6 },
      { label: 'Critical', min: 24, max: 999, score: 0.0 }
    ],
    description: 'Average response time to parent communication/queries',
    sources: ['Communication Log', 'Helpdesk']
  },
  {
    id: 'M3',
    name: 'Teacher Training Hours',
    category: 'CORE',
    unit: 'hours_per_year',
    direction: 'higher_is_better',
    thresholds: [
      { label: 'Critical', min: 0, max: 20, score: 0.0 },
      { label: 'Average', min: 20, max: 30, score: 0.6 },
      { label: 'Good', min: 30, max: 40, score: 0.8 },
      { label: 'Excellent', min: 40, max: 999, score: 1.0 }
    ],
    description: 'Annual professional development hours per teacher',
    sources: ['HR System', 'Learning Management System']
  },
  {
    id: 'M4',
    name: 'Weekly Planning Time',
    category: 'CORE',
    unit: 'percentage',
    direction: 'higher_is_better',
    thresholds: [
      { label: 'Critical', min: 0, max: 60, score: 0.0 },
      { label: 'Average', min: 60, max: 80, score: 0.6 },
      { label: 'Good', min: 80, max: 95, score: 0.8 },
      { label: 'Excellent', min: 95, max: 100, score: 1.0 }
    ],
    description: 'Percentage of teachers with dedicated weekly planning time',
    sources: ['Timetable', 'Attendance']
  },
  {
    id: 'M5',
    name: 'Fee Realization Rate',
    category: 'EXPANDED',
    unit: 'percentage',
    direction: 'higher_is_better',
    thresholds: [
      { label: 'Critical', min: 0, max: 90, score: 0.0 },
      { label: 'Average', min: 90, max: 95, score: 0.6 },
      { label: 'Good', min: 95, max: 98, score: 0.8 },
      { label: 'Excellent', min: 98, max: 100, score: 1.0 }
    ],
    description: 'Percentage of fees collected against total dues',
    sources: ['Finance', 'Accounts']
  },
  {
    id: 'M6',
    name: 'Safety & Compliance Score',
    category: 'EXPANDED',
    unit: 'percentage',
    direction: 'higher_is_better',
    thresholds: [
      { label: 'Critical', min: 0, max: 70, score: 0.0 },
      { label: 'Average', min: 70, max: 85, score: 0.6 },
      { label: 'Good', min: 85, max: 95, score: 0.8 },
      { label: 'Excellent', min: 95, max: 100, score: 1.0 }
    ],
    description: 'Compliance with safety regulations and audit findings',
    sources: ['Facilities', 'Compliance', 'Safety Audit']
  },
  {
    id: 'M7',
    name: 'Digital & LMS Usage',
    category: 'EXPANDED',
    unit: 'percentage',
    direction: 'higher_is_better',
    thresholds: [
      { label: 'Critical', min: 0, max: 50, score: 0.0 },
      { label: 'Average', min: 50, max: 70, score: 0.6 },
      { label: 'Good', min: 70, max: 85, score: 0.8 },
      { label: 'Excellent', min: 85, max: 100, score: 1.0 }
    ],
    description: 'Adoption and usage of digital tools and learning management systems',
    sources: ['IT/LMS Analytics', 'Digital Infrastructure']
  },
  {
    id: 'M8',
    name: 'Extracurricular Participation',
    category: 'EXPANDED',
    unit: 'percentage',
    direction: 'higher_is_better',
    thresholds: [
      { label: 'Critical', min: 0, max: 45, score: 0.0 },
      { label: 'Average', min: 45, max: 60, score: 0.6 },
      { label: 'Good', min: 60, max: 70, score: 0.8 },
      { label: 'Excellent', min: 70, max: 100, score: 1.0 }
    ],
    description: 'Percentage of students participating in extracurricular activities',
    sources: ['Activity/Co-Curricular', 'Student Information']
  }
]

/**
 * 15 Challenges across 5 domains
 * Default weight = 1/15 ≈ 0.0667 (configurable per cycle)
 */
export const CHALLENGE_CATALOG: Challenge[] = [
  // Domain 1: Growth & Enrollment (C1-C3)
  {
    id: 'C1',
    title: 'Admission Trend',
    domain: 'Growth & Enrollment',
    description: 'Trend in admissions, waitlist management, and market share',
    severity: 0.067,
    weight: 0.067,
    affectedDimensions: ['D1', 'D2']
  },
  {
    id: 'C2',
    title: 'Retention Rate',
    domain: 'Growth & Enrollment',
    description: 'Student retention from year to year; early exits',
    severity: 0.067,
    weight: 0.067,
    affectedDimensions: ['D1', 'D3']
  },
  {
    id: 'C3',
    title: 'Target vs Actual Enrollment',
    domain: 'Growth & Enrollment',
    description: 'Gap between target capacity and actual enrollment',
    severity: 0.067,
    weight: 0.067,
    affectedDimensions: ['D2']
  },
  // Domain 2: People & Staffing (C4-C6)
  {
    id: 'C4',
    title: 'Staff Stability & Turnover',
    domain: 'People & Staffing',
    description: 'Teacher retention, attrition rate, and key position vacancies',
    severity: 0.067,
    weight: 0.067,
    affectedDimensions: ['D4', 'D5']
  },
  {
    id: 'C5',
    title: 'Teacher Competency & Development',
    domain: 'People & Staffing',
    description: 'Qualifications, professional development, and performance ratings',
    severity: 0.067,
    weight: 0.067,
    affectedDimensions: ['D5', 'D6']
  },
  {
    id: 'C6',
    title: 'Leadership Pipeline',
    domain: 'People & Staffing',
    description: 'Depth of talent for future leadership positions',
    severity: 0.067,
    weight: 0.067,
    affectedDimensions: ['D1', 'D4']
  },
  // Domain 3: Academic & Wellbeing (C7-C9)
  {
    id: 'C7',
    title: 'Academic Performance Trend',
    domain: 'Academic & Wellbeing',
    description: 'Board exam results, internal assessments, and progression rates',
    severity: 0.067,
    weight: 0.067,
    affectedDimensions: ['D7', 'D8']
  },
  {
    id: 'C8',
    title: 'Student Wellbeing & Safety',
    domain: 'Academic & Wellbeing',
    description: 'Incidents, counseling cases, bullying reports, and mental health support',
    severity: 0.067,
    weight: 0.067,
    affectedDimensions: ['D9', 'D10']
  },
  {
    id: 'C9',
    title: 'Curriculum Relevance & Delivery',
    domain: 'Academic & Wellbeing',
    description: 'Alignment with NEP, skill-based learning, and digital integration',
    severity: 0.067,
    weight: 0.067,
    affectedDimensions: ['D7', 'D11']
  },
  // Domain 4: Reputation & Competition (C10-C12)
  {
    id: 'C10',
    title: 'Brand Perception',
    domain: 'Reputation & Competition',
    description: 'Parent satisfaction, online reviews, and brand equity',
    severity: 0.067,
    weight: 0.067,
    affectedDimensions: ['D12', 'D13']
  },
  {
    id: 'C11',
    title: 'Market Position vs Competition',
    domain: 'Reputation & Competition',
    description: 'Competitive positioning, market share, and benchmarking',
    severity: 0.067,
    weight: 0.067,
    affectedDimensions: ['D2', 'D12']
  },
  {
    id: 'C12',
    title: 'Alumni Engagement & Success',
    domain: 'Reputation & Competition',
    description: 'Alumni network strength, placement outcomes, and higher education',
    severity: 0.067,
    weight: 0.067,
    affectedDimensions: ['D1', 'D13']
  },
  // Domain 5: Operations & Finance (C13-C15)
  {
    id: 'C13',
    title: 'Financial Health',
    domain: 'Operations & Finance',
    description: 'Revenue trends, expense ratios, sustainability, and reserves',
    severity: 0.067,
    weight: 0.067,
    affectedDimensions: ['D14', 'D2']
  },
  {
    id: 'C14',
    title: 'Infrastructure & Facilities',
    domain: 'Operations & Finance',
    description: 'Building condition, maintenance, utilities, and space adequacy',
    severity: 0.067,
    weight: 0.067,
    affectedDimensions: ['D11', 'D14']
  },
  {
    id: 'C15',
    title: 'Operations & Systems Efficiency',
    domain: 'Operations & Finance',
    description: 'Technology infrastructure, processes, compliance, and data management',
    severity: 0.067,
    weight: 0.067,
    affectedDimensions: ['D11', 'D14']
  }
]

export default {
  MULTIPLIER_DATA_CARDS,
  CHALLENGE_CATALOG
}

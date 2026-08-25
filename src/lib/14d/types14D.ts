/**
 * 14-Dimension Diagnostic Framework v2 — Type Definitions
 * Single source of truth for all data structures
 * Authority: DISHA_14D_DIAGNOSTIC_FRAMEWORK_V2_REFERENCE.md
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// STAKEHOLDER TYPES
// ============================================================================

export type StakeholderType = 'teacher' | 'parent' | 'student' | 'admin' | 'other';

export interface StakeholderConfig {
  teachers: boolean;
  parents: boolean;
  students: boolean;
  admin: boolean;
  other: boolean;
}

// ============================================================================
// ASSESSMENT CYCLE
// ============================================================================

export interface Assessment14D {
  id: string;
  schoolId: string;

  // Cycle information
  cycleYear: number; // 2026
  cycleTerm: 'Annual' | 'Term1' | 'Term2' | 'Term3';
  cycleNumber: number; // For YoY tracking

  // Metadata
  title: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ANALYZED' | 'ARCHIVED';

  // Stakeholder configuration
  stakeholderConfig: StakeholderConfig;

  // Response tracking
  responseBudget: {
    expectedCount: number;
    targetedCount: number;
    collectedCount: number;
  };

  // Timestamps
  createdAt: Timestamp;
  activatedAt?: Timestamp;
  closedAt?: Timestamp;
  analyzedAt?: Timestamp;

  // Configuration
  anonymousResponses: boolean;
  allowEdits: boolean;
  autoCalculate: boolean;

  // Metadata
  createdBy: string;
  lastModifiedBy: string;
  lastModifiedAt: Timestamp;
}

// ============================================================================
// METRIC RESPONSE (1:1 per metric answer)
// ============================================================================

export interface MetricResponse {
  id: string;
  assessmentId: string;
  schoolId: string;

  // Respondent information
  stakeholderType: StakeholderType;
  respondentId?: string; // None if anonymous
  respondentName?: string;
  respondentEmail?: string;

  // What was answered
  dimensionId: number; // 1-14
  metricId: string; // e.g., '1a', '2c', '14f'

  // Response data
  metricType: 'reality' | 'perception';
  metricValue: number | string; // Formula result or 1-10 rating
  metricUnit?: string; // '%', '#', 'hours', '1-10', etc.

  // Perception root-cause
  followUpQuestion?: string;
  followUpResponse?: string;

  // Data quality
  dataQuality?: 'High' | 'Medium' | 'Low';
  dataSource?: string; // e.g., "CBSE Portal", "Teacher Input", "LMS"

  // Session metadata
  sessionId: string;
  timestamp: Timestamp;
  deviceType?: 'web' | 'mobile' | 'tablet';
  isAnonymous: boolean;

  // Validation
  isValid: boolean;
  validationErrors?: string[];
}

// ============================================================================
// DIMENSION SCORE (Aggregated by dimension)
// ============================================================================

export interface MetricDetail {
  metricId: string;
  metricName: string;
  value: number;
  unit?: string;
  dataQuality: 'High' | 'Medium' | 'Low';
  dataSource: string;
  respondentCount?: number;
  lastUpdated: Timestamp;
}

export interface DimensionScore {
  dimensionId: number; // 1-14
  dimensionName: string;

  // Reality metrics (6-7 per dimension)
  realityMetrics: MetricDetail[];
  realityScore: number; // 0-100 aggregate
  realityDataQuality: 'High' | 'Medium' | 'Low';

  // Perception metrics (6-7 per dimension)
  perceptionMetrics: MetricDetail[];
  perceptionScore: number; // 1-10 → 0-100 scaled
  perceptionRespondentCount: number;

  // Gap analysis
  gap: number; // Absolute difference
  gapDirection: 'reality_higher' | 'perception_higher' | 'aligned';
  gapSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  // Root causes
  rootCauseThemes: {
    theme: string;
    frequency: number;
    examples: string[]; // Direct quotes from follow-ups
  }[];

  // Trend
  trend?: {
    previousYearScore?: number;
    yearOverYearChange?: number;
    direction: 'improving' | 'declining' | 'stable';
  };

  // Metadata
  calculatedAt: Timestamp;
  respondentBreakdown: Record<StakeholderType, number>;
}

// ============================================================================
// GAP ANALYSIS RESULT
// ============================================================================

export interface GapAnalysisResult {
  assessmentId: string;
  schoolId: string;

  // Calculated gaps
  dimensionGaps: {
    dimensionId: number;
    dimensionName: string;
    realityScore: number;
    perceptionScore: number;
    gap: number;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    rootCauseTheme: string;
    affectedStakeholder: StakeholderType[];
    priority: number; // 1-14, lower = higher priority
  }[];

  // Blind spots (Perception high, Reality declining)
  blindSpots: {
    dimensionId: number;
    perceptionRating: number;
    realityTrend: 'declining';
    riskLevel: 'CRITICAL';
  }[];

  // Historical comparison
  trendComparison?: {
    dimensionId: number;
    previousYearScore: number;
    currentYearScore: number;
    change: number;
    percentChange: number;
    trend: 'improving' | 'declining' | 'stable';
  }[];

  // Overall assessment
  overallStability: number; // % of dimensions unchanged ±5pts
  improvingDimensions: number;
  decliningDimensions: number;
  stableDimensions: number;

  // Metadata
  generatedAt: Timestamp;
  generatedBy: string;
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

export interface Recommendation {
  id: string;
  assessmentId: string;
  dimensionId: number;
  dimensionName: string;

  // Action details
  actionTitle: string;
  actionDescription: string;
  rootCauseTheme: string;

  // Implementation
  ownerRole: string; // 'Principal', 'Academic Coordinator', 'Counsellor', etc.
  estimatedTimeframe: string; // '1 month', '2-3 months', 'Ongoing'
  estimatedImpact: string; // 'High', 'Medium', 'Low'
  estimatedResourceNeeded: string;

  // Tracking
  priority: number; // 1-5, lower = higher
  implementationStatus: 'Not Started' | 'In Progress' | 'Completed' | 'Deferred';

  // Success metrics
  successCriteria: string[];
  measurableOutcome: string;

  // Metadata
  createdAt: Timestamp;
  createdBy: string;
}

// ============================================================================
// METRIC CALCULATION FORMULAS
// ============================================================================

export interface MetricFormula {
  metricId: string;
  dimensionId: number;
  name: string;

  // Formula definition
  formula: string; // e.g., "Pass ÷ Appeared × 100"
  dataInputs: string[]; // Required data fields

  // Calculation
  calculate: (data: Record<string, any>) => number;
  fallbackValue?: number;

  // Constraints
  minValue?: number;
  maxValue?: number;
  unit?: string;

  // Data sources
  primaryDataSource: string;
  fallbackDataSource?: string;
}

// ============================================================================
// PERCEPTION QUESTION MAPPING
// ============================================================================

export interface PerceptionQuestionMap {
  metricId: string;
  dimensionId: number;

  // Question
  question: string;
  respondentType: StakeholderType;

  // Response options
  responseScale: 'likert-10' | 'likert-5' | 'yes-no' | 'open-text';

  // Root cause follow-up
  followUpQuestion: string;
  followUpResponseType: 'text';

  // Metadata
  isRequired: boolean;
  displayOrder: number;
}

// ============================================================================
// REPORT / EXPORT
// ============================================================================

export interface AssessmentReport {
  assessmentId: string;
  schoolId: string;
  schoolName: string;

  // Report metadata
  title: string;
  generatedDate: Timestamp;
  reportedBy: string;
  reportedTo: string; // Principal, Board, etc.

  // Content sections
  executiveSummary: string;
  dimensionScores: DimensionScore[];
  gapAnalysis: GapAnalysisResult;
  recommendations: Recommendation[];
  trendAnalysis?: string;

  // Appendices
  respondentSummary: {
    totalResponses: number;
    byStakeholder: Record<StakeholderType, number>;
    completionRate: number;
    averageTimePerResponse: number; // seconds
  };

  // Metadata
  confidentiality: 'Public' | 'Restricted' | 'Confidential';
  dataPrivacyCompliant: boolean;
  nextReviewDate: Timestamp;
}

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    validatedAt: Timestamp;
    validatedBy: string;
  };
}

export interface ResponseValidationRule {
  field: string;
  rule: (value: any) => boolean;
  errorMessage: string;
}

// ============================================================================
// HISTORICAL DATA (For trends)
// ============================================================================

export interface HistoricalScore {
  cycleId: string;
  cycleYear: number;
  cycleTerm: string;

  dimensionScores: Record<number, number>; // dimensionId → score
  recordedAt: Timestamp;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export const DIMENSION_NAMES: Record<number, string> = {
  1: 'Academic Performance & Learning Outcomes',
  2: 'Curriculum & Pedagogy Quality',
  3: 'Teacher Quality, Development & Retention',
  4: 'Student Wellbeing & Mental Health',
  5: 'School Infrastructure & Physical Environment',
  6: 'Technology Integration & Digital Learning',
  7: 'Parental Engagement & Communication',
  8: 'Financial Health & Sustainability',
  9: 'Leadership & Governance',
  10: 'Admissions & Enrollment Management',
  11: 'Alumni Engagement & Reputation',
  12: 'Operational Efficiency & Compliance',
  13: 'Diversity, Inclusion & Equity',
  14: 'Innovation & Future Readiness'
};

export const STAKEHOLDER_LABELS: Record<StakeholderType, string> = {
  teacher: 'Teaching Staff',
  parent: 'Parents',
  student: 'Students',
  admin: 'Administrative Staff',
  other: 'Other Stakeholders'
};

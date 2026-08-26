/**
 * Phase 5: Data Infrastructure & Perception Surveys
 * Core TypeScript types and interfaces
 */

// ============================================================================
// SURVEY QUESTION TYPES
// ============================================================================

export type RespondentType = 'TEACHER' | 'PARENT' | 'STUDENT' | 'ADMIN' | 'OTHER';
export type QuestionCategory = 'PERCEPTION' | 'REALITY';
export type LikertScale = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface SurveyQuestion {
  id: string; // Q1, Q2, ... Q90+
  dimensionId: number; // 1-14
  metricId: string; // 1a, 1b, 1c, etc
  question: string; // The question text
  respondentTypes: RespondentType[]; // Who answers this question
  scale: 'LIKERT_1_10'; // Always 1-10 for phase 5
  rootCauseFollowUp: string; // "What would improve [metric]?"
  category: QuestionCategory; // PERCEPTION or REALITY
  dimensionName: string; // e.g., "Academic Performance & Learning Outcomes"
  createdAt: Date;
  order: number; // Display order in survey
}

// ============================================================================
// SURVEY RESPONSE TYPES
// ============================================================================

export interface QuestionResponse {
  questionId: string;
  metricId: string;
  rating: LikertScale; // 1-10
  rootCauseText?: string; // Optional follow-up text
}

export interface PerceptionResponse {
  id: string;
  schoolId: string;
  cycleId: string;
  respondentId: string; // Email or unique identifier
  respondentType: RespondentType;
  email: string;
  phone?: string;
  responses: QuestionResponse[]; // Array of responses
  submittedAt: Date;
  updatedAt: Date;
  isDraft: boolean;
  isCompleted: boolean;
}

// ============================================================================
// METRIC DATA TYPES
// ============================================================================

export type MetricType =
  | 'PERCENTAGE'
  | 'AVERAGE'
  | 'COUNT'
  | 'RATIO'
  | 'DAYS'
  | 'TEXT';

export interface MetricValue {
  metricId: string; // 1a, 1b, etc
  dimensionId: number;
  value: number | string; // Actual metric value
  dataSource: string; // 'MANUAL' | 'LMS' | 'EXCEL' | 'API' | 'FALLBACK'
  sourceDetails?: string; // e.g., "Google Classroom - Math 10A"
  evidenceUrl?: string; // Firebase Storage path to supporting docs
  submittedBy: string; // Admin email
  submittedAt: Date;
  notes?: string; // Free-form notes
  isVerified: boolean;
}

export interface RealityMetricEntry {
  id: string;
  schoolId: string;
  cycleId: string;
  dimensionId: number;
  metrics: MetricValue[]; // All 60+ metrics
  lastUpdatedAt: Date;
  dataAuditFlags: DataAuditFlag[];
}

// ============================================================================
// DATA AUDIT TYPES
// ============================================================================

export type DataQualityFlag = 'STALE' | 'MISSING' | 'OUTLIER' | 'CONFLICT' | 'UNVERIFIED';

export interface DataAuditFlag {
  metricId: string;
  flagType: DataQualityFlag;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedAction: string;
}

export interface DataAuditStatus {
  schoolId: string;
  cycleId: string;
  metricsWithData: number; // Count of metrics with data
  totalMetrics: number; // 60
  coveragePercentage: number; // 0-100
  lastAuditDate: Date;
  flags: DataAuditFlag[];
  dimensionCoverage: {
    dimensionId: number;
    dimensionName: string;
    metricsCollected: number;
    totalMetrics: number;
    coveragePercentage: number;
    lastUpdated: Date;
  }[];
}

// ============================================================================
// DATA SOURCE CONNECTOR TYPES
// ============================================================================

export type DataSourceType = 'MANUAL' | 'LMS' | 'EXCEL' | 'API' | 'FALLBACK';

export interface DataSourceConnector {
  id: string;
  schoolId: string;
  type: DataSourceType;
  name: string; // "Google Classroom", "Excel Import", etc
  isActive: boolean;
  config: Record<string, string>; // e.g., { classroomId, apiKey }
  lastSyncAt?: Date;
  metricsSupported: string[]; // e.g., ["1b", "1f"]
  createdAt: Date;
}

export interface ImportMapping {
  sourceColumn: string; // CSV column or LMS field name
  targetMetricId: string; // 1a, 1b, etc
  transformFn?: string; // Optional transformation logic
}

// ============================================================================
// SURVEY CYCLE TYPES
// ============================================================================

export interface SurveyCycle {
  id: string;
  schoolId: string;
  cycleId: string; // Link to assessment cycle
  startDate: Date;
  endDate: Date;
  respondentTargets: {
    type: RespondentType;
    expectedCount: number;
    actualCount: number;
  }[];
  responseStatus: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ANALYZED';
  createdAt: Date;
}

// ============================================================================
// AGGREGATED SCORES (OUTPUT)
// ============================================================================

export interface AggregatedPerceptionScores {
  dimensionId: number;
  dimensionName: string;
  perceptionScore: number; // 0-100
  respondentBreakdown: {
    respondentType: RespondentType;
    averageRating: number; // 0-100
    responseCount: number;
  }[];
  respondentCount: number;
  calculatedAt: Date;
}

export interface AggregatedRealityScores {
  dimensionId: number;
  dimensionName: string;
  realityScore: number; // 0-100
  metricsBreakdown: {
    metricId: string;
    metricName: string;
    value: number; // 0-100 scaled
    dataSources: string[];
  }[];
  dataQuality: 'COMPLETE' | 'PARTIAL' | 'SPARSE';
  calculatedAt: Date;
}

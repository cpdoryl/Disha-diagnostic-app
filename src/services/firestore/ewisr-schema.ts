/**
 * DISHA EWISR Firestore Database Schema
 * Complete data structure for Firebase Firestore
 */

/**
 * COLLECTION: /ewisr_assessments
 * Stores all EWISR assessments
 */
export interface EWSIRAssessment {
  id: string; // Document ID
  schoolId: string; // Reference to school
  schoolName: string;
  assessmentDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
  status: 'draft' | 'submitted' | 'archived'; // Assessment status

  // Responses - keyed by dimensionId
  responses: {
    [dimensionId: string]: {
      [questionId: string]: number; // weight (1-10)
    };
  };

  // Calculated scores
  dimensionScores: {
    [dimensionId: string]: {
      score: number; // 0-100
      classification: string;
      weightedContribution: number;
    };
  };

  overallHealthIndex: number; // 0-100
  healthStatus: string;
  recommendation: string;

  // Metadata
  completionPercentage: number;
  assessmentVersion: string; // Framework version used
  notes?: string;
}

/**
 * COLLECTION: /schools
 * Stores school information
 */
export interface School {
  id: string; // Document ID
  name: string;
  location: string;
  state: string;
  district?: string;

  // Contact
  email: string;
  phone?: string;
  website?: string;

  // Organization
  principalName: string;
  principalEmail?: string;
  board: string; // CBSE, ICSE, IB, etc.
  affiliationNumber?: string;

  // Metrics
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  establishedYear: number;

  // Assessment history
  lastAssessmentDate?: Date;
  assessmentCount: number;
  averageHealthIndex?: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * COLLECTION: /users
 * Stores user information
 */
export interface User {
  id: string; // Firebase UID
  email: string;
  displayName: string;
  photoURL?: string;

  // Role-based access
  role: 'admin' | 'school_admin' | 'assessor' | 'viewer';
  schoolId?: string; // If role is school_admin

  // Preferences
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };

  // Timestamps
  createdAt: Date;
  lastLoginAt: Date;
}

/**
 * COLLECTION: /assessment_reports
 * Pre-calculated reports for quick access
 */
export interface AssessmentReport {
  id: string;
  assessmentId: string;
  schoolId: string;
  schoolName: string;

  // Overall metrics
  overallHealthIndex: number;
  healthStatus: string;
  assessmentDate: Date;

  // Tier breakdown
  tierScores: {
    tier1: number;
    tier2: number;
    tier3: number;
    tier4: number;
  };

  // Top performers and problem areas
  topDimensions: Array<{
    dimensionId: string;
    label: string;
    score: number;
  }>;

  bottomDimensions: Array<{
    dimensionId: string;
    label: string;
    score: number;
  }>;

  // Action plan summary
  actionItems: Array<{
    dimensionId: string;
    priority: string;
    scoreGap: number;
  }>;

  // Recommendations
  recommendations: string[];

  createdAt: Date;
}

/**
 * COLLECTION: /assessment_history
 * Historical data for trend analysis
 */
export interface AssessmentHistory {
  id: string;
  schoolId: string;
  assessmentId: string;

  // Timeline data
  assessmentDate: Date;
  overallHealthIndex: number;

  // Dimension changes (only if previous assessment exists)
  dimensionChanges?: {
    [dimensionId: string]: {
      previousScore: number;
      currentScore: number;
      change: number; // currentScore - previousScore
    };
  };

  // Trend indicators
  trend: 'improving' | 'stable' | 'declining';
}

/**
 * COLLECTION: /dimension_benchmarks
 * Reference data for all 14 dimensions
 */
export interface DimensionBenchmark {
  id: string;
  dimensionId: string;
  label: string;
  weight: number;
  tier: string;
  definition: string;
  whyItMatters: string[];
  keyMetrics: string[];

  questions: Array<{
    questionId: string;
    text: string;
    options: Array<{
      value: number;
      label: string;
      weight: number;
    }>;
  }>;

  benchmarks: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };

  weightReasoning: string[];
}

/**
 * COLLECTION: /audit_logs
 * Track all assessment-related activities
 */
export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  schoolId: string;
  action: string; // 'assessment_created', 'assessment_submitted', etc.
  details: Record<string, any>;
  ipAddress?: string;
}

// ============================================================================
// FIRESTORE PATH HELPERS
// ============================================================================

export const FIRESTORE_PATHS = {
  ASSESSMENTS: 'ewisr_assessments',
  SCHOOLS: 'schools',
  USERS: 'users',
  REPORTS: 'assessment_reports',
  HISTORY: 'assessment_history',
  BENCHMARKS: 'dimension_benchmarks',
  AUDIT_LOGS: 'audit_logs'
};

// ============================================================================
// FIRESTORE QUERY FILTERS
// ============================================================================

export interface AssessmentFilter {
  schoolId?: string;
  status?: 'draft' | 'submitted' | 'archived';
  startDate?: Date;
  endDate?: Date;
  minScore?: number;
  maxScore?: number;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type FirestoreDocument =
  | EWSIRAssessment
  | School
  | User
  | AssessmentReport
  | AssessmentHistory
  | DimensionBenchmark
  | AuditLog;

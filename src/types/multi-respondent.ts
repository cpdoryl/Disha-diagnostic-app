/**
 * Multi-Respondent Assessment System Types
 * Comprehensive TypeScript interfaces for multi-stakeholder assessment
 */

// ============================================================================
// ASSESSMENT TYPES
// ============================================================================

export interface Assessment {
  // Existing fields
  assessmentId: string;
  schoolId: string;
  schoolName: string;
  createdAt: Date;
  updatedAt: Date;

  // Type specification
  assessmentType: 'SINGLE_RESPONDENT' | 'MULTI_RESPONDENT';
  assessmentStatus: 'IN_PROGRESS' | 'COMPLETE' | 'ARCHIVED';

  // Target respondent counts (user-defined)
  targetCounts: {
    management: number;
    teachers: number;
    parents_students: number;
    operational_metrics: number;
  };

  // Actual respondent counts (who was invited)
  respondentCounts: {
    management: number;
    teachers: number;
    parents_students: number;
    operational_metrics: number;
    total: number;
  };

  // Completed respondent counts (who actually finished)
  completedCounts: {
    management: number;
    teachers: number;
    parents_students: number;
    operational_metrics: number;
    total: number;
  };

  // Respondent tracking
  respondentIds: string[];
  completionPercentage: number;  // 0-100%

  // Lock status for finalization
  lockStatus: 'ACTIVE' | 'LOCKED';
  lockedAt?: Date;
  lockedBy?: string;

  // Aggregated results
  aggregatedData?: AggregatedDimensionData;
  statistics?: AssessmentStatistics;
}

// ============================================================================
// RESPONDENT TYPES
// ============================================================================

export interface Respondent {
  // Identification
  respondentId: string;
  assessmentId: string;
  respondentNumber: number;

  // Personal information
  name: string;
  email?: string;
  role: string;
  department?: string;

  // Classification
  stakeholderGroup: StakeholderGroup;

  // Access control
  respondentLink: string;
  linkExpiresAt: Date;
  linkStatus: 'ACTIVE' | 'EXPIRED' | 'USED';

  // Status tracking
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETE';
  startedAt?: Date;
  completedAt?: Date;
  completionPercentage: number;
  lastActivityAt?: Date;

  // Response data
  responses: DimensionResponse[];
  dimensionScores: Record<string, number>;
  overallScore?: number;

  // Metadata
  sentimentScore?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  metadata?: RespondentMetadata;
}

export interface RespondentMetadata {
  ipAddress?: string;
  userAgent?: string;
  sessionDuration?: number;  // seconds
  deviceType?: 'DESKTOP' | 'MOBILE' | 'TABLET';
  timeZone?: string;
  language?: string;
}

export interface RespondentResponse {
  respondentId: string;
  assessmentId: string;
  dimensionId: string;

  questions: QuestionResponse[];
  dimensionScore: number;

  questionsAnswered: number;
  completionTime: number;
  averageTimePerQuestion: number;

  notes?: string;
}

export interface QuestionResponse {
  questionId: string;
  question: string;
  selectedWeight: number;  // 1-10
  selectedOption: string;
  timestamp: Date;
}

// ============================================================================
// AGGREGATED DATA TYPES
// ============================================================================

export interface AggregatedDimensionData {
  [dimensionId: string]: DimensionAggregation;
}

export interface DimensionAggregation {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  range: number;

  sampleSize: number;
  consensus: ConsensusLevel;
  consensusLevel: number;  // 0-1

  byStakeholder: Record<StakeholderGroup, StakeholderMetrics>;
}

export interface StakeholderMetrics {
  mean: number;
  median?: number;
  stdDev: number;
  min?: number;
  max?: number;
  n: number;
  respondents?: string[];
}

export interface AssessmentStatistics {
  totalRespondents: number;

  respondentsByCategory: Record<StakeholderGroup, number>;

  completionRate: number;

  consensusAnalysis: {
    highConsensus: string[];
    moderateConsensus: string[];
    lowConsensus: string[];
    highConflict: string[];
  };

  divergentDimensions: Record<string, DivergenceSummary>;

  strongAgreementDimensions: string[];

  outliers: OutlierSummary[];

  stakeholderComparison: Record<StakeholderGroup, StakeholderComparisonMetrics>;
}

export interface DivergenceSummary {
  dimension: string;
  stdDev: number;
  consensusLevel: number;
  gap: 'SMALL_GAP' | 'MODERATE_GAP' | 'LARGE_GAP';
  byStakeholder: Record<StakeholderGroup, number>;
  maxGap: number;
  maxGapBetween: [StakeholderGroup, StakeholderGroup];
  recommendation: string;
}

export interface OutlierSummary {
  respondentId: string;
  name: string;
  stakeholderGroup: StakeholderGroup;
  overallScore: number;
  groupAverage: number;
  deviation: number;
  percentile: number;  // 0-100
  type: 'HIGH_OUTLIER' | 'LOW_OUTLIER';
  anomalies: OutlierAnomaly[];
  likelyReason?: string;
  recommendation?: string;
}

export interface OutlierAnomaly {
  dimensionId: string;
  theirScore: number;
  groupAverage: number;
  deviation: number;
  zScore: number;
}

export interface StakeholderComparisonMetrics {
  mean: number;
  median?: number;
  stdDev: number;
  n: number;
  respondents?: string[];
}

// ============================================================================
// TREND ANALYSIS TYPES
// ============================================================================

export interface AssessmentTrend {
  schoolId: string;
  assessmentIds: string[];
  trends: TrendDataPoint[];
  improvements: Record<string, TrendImprovement>;
  consistencyMetrics: ConsistencyMetrics;
}

export interface TrendDataPoint {
  assessmentId: string;
  date: Date;
  scores: Record<string, number>;
  overallScore: number;
  respondentCount: number;
  consensusAverage: number;
}

export interface TrendImprovement {
  trend: 'UP' | 'DOWN' | 'STABLE';
  improvement: number;
  percentageChange: number;
  dataPoints: number;
}

export interface ConsistencyMetrics {
  averageConsensusStdDev: number;  // Lower = more consistent
  stabilityScore: number;  // 0-1, higher = more stable
  trendDirection: 'IMPROVING' | 'DECLINING' | 'STABLE';
  estimatedNextValue?: number;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface AssessmentReport {
  reportId: string;
  assessmentId: string;
  schoolId: string;

  reportType: 'EXECUTIVE' | 'DETAILED' | 'STAKEHOLDER_SPECIFIC';
  generatedAt: Date;

  executiveSummary: ExecutiveSummary;
  detailedAnalysis: DetailedAnalysis;
  recommendations: Recommendation[];
  trendAnalysis?: TrendAnalysis;

  distributionFiles?: DistributionFiles;
}

export interface ExecutiveSummary {
  overallScore: number;
  healthStatus: string;
  confidence: number;  // 0-100
  respondentCount: number;
  completionRate: number;

  topStrengths: string[];
  topConcerns: string[];
  keyInsights: string[];
}

export interface DetailedAnalysis {
  dimensionAnalysis: Record<string, DimensionAnalysisDetail>;
  stakeholderAnalysis: Record<StakeholderGroup, StakeholderAnalysisDetail>;
  outlierAnalysis: OutlierAnalysisDetail;
}

export interface DimensionAnalysisDetail {
  dimensionId: string;
  label: string;
  score: number;
  consensus: ConsensusLevel;
  trend: 'UP' | 'DOWN' | 'STABLE';
  byStakeholder: Record<StakeholderGroup, number>;
  interpretation: string;
}

export interface StakeholderAnalysisDetail {
  group: StakeholderGroup;
  avgScore: number;
  respondentCount: number;
  concerns: string[];
  strengths: string[];
  percentageAboveAverage: number;
}

export interface OutlierAnalysisDetail {
  totalOutliers: number;
  highOutliers: string[];
  lowOutliers: string[];
  outliersPercentage: number;
  recommendation: string;
}

export interface TrendAnalysis {
  direction: 'IMPROVING' | 'DECLINING' | 'STABLE';
  improvementRate: number;
  previousScore: number;
  scoreChange: number;
  dataPoints: number;
  forecast?: number;
}

export interface Recommendation {
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  dimensionId: string;
  dimensionLabel: string;
  issue: string;
  actionItems: string[];
  expectedImpact: string;
  estimatedTimeline: string;
  resourcesRequired?: string[];
}

export interface DistributionFiles {
  jsonUrl?: string;
  pdfUrl?: string;
  csvUrl?: string;
  excelUrl?: string;
}

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

export type StakeholderGroup = 'management' | 'teachers' | 'parents_students' | 'operational_metrics';

export type ConsensusLevel = 'HIGH' | 'GOOD' | 'MODERATE' | 'LOW' | 'HIGH_CONFLICT';

export const STAKEHOLDER_DISPLAY_NAMES: Record<StakeholderGroup, string> = {
  management: 'Management & Leadership',
  teachers: 'Faculty & Teaching Staff',
  parents_students: 'Parents & Students',
  operational_metrics: 'Operational & Metrics'
};

export const CONSENSUS_THRESHOLDS = {
  HIGH: 0.85,  // Std dev < 0.5
  GOOD: 0.70,  // Std dev < 1.0
  MODERATE: 0.50,  // Std dev < 1.5
  LOW: 0.30,  // Std dev < 2.0
  HIGH_CONFLICT: 0  // Std dev >= 2.0
};

export const OUTLIER_Z_SCORE_THRESHOLD = 2.0;  // 2 standard deviations

export const DEFAULT_TARGET_COUNTS = {
  management: 5,
  teachers: 8,
  parents_students: 10,
  operational_metrics: 5
};

// ============================================================================
// RESPONSE TYPES (From original assessment)
// ============================================================================

export interface DimensionResponse {
  dimensionId: string;
  questionId: string;
  selectedOptionWeight: number;  // 1-10
}

export interface DimensionScore {
  dimensionId: string;
  label: string;
  weight: number;
  tier: string;
  averageWeight: number;
  score: number;  // 0-100
  benchmark: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  classification: string;
}

// ============================================================================
// HELPER TYPES FOR CALCULATIONS
// ============================================================================

export interface CalculationState {
  respondentData: Respondent[];
  aggregatedData: AggregatedDimensionData;
  statistics: AssessmentStatistics;
  isCalculating: boolean;
  lastCalculatedAt: Date;
}

export interface AnalyticsMetrics {
  consensusMetrics: Record<string, ConsensusMetric>;
  divergenceMetrics: Record<string, DivergenceMetric>;
  outlierMetrics: OutlierMetrics;
  stakeholderMetrics: Record<StakeholderGroup, StakeholderMetric>;
}

export interface ConsensusMetric {
  stdDev: number;
  consensusLevel: ConsensusLevel;
  agreementPercentage: number;
}

export interface DivergenceMetric {
  maxGap: number;
  minGap: number;
  averageGap: number;
  stakeholdersInvolved: StakeholderGroup[];
}

export interface OutlierMetrics {
  totalOutliers: number;
  outliersPercentage: number;
  highOutlierCount: number;
  lowOutlierCount: number;
  maxZScore: number;
}

export interface StakeholderMetric {
  avgScore: number;
  respondentCount: number;
  participationRate: number;
  averageTimeToComplete: number;
}

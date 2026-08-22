/**
 * DISHA First Opinion Engine - Firestore Database Schema
 * Complete TypeScript type definitions for all 8 collections
 *
 * Collections:
 * 1. schools - School metadata & configuration
 * 2. assessmentCycles - Cycle container & aggregate scores
 * 3. challengeResponses - Individual respondent answers (subcollection)
 * 4. multipliers - 8 multiplier values per cycle (subcollection)
 * 5. multiplierDataCards - Multiplier definitions (global)
 * 6. reportSnapshot - Generated report data (subcollection)
 * 7. stakeholderVerifications - Role verification
 * 8. trendHistory - Multi-cycle archive
 */

import {
  collection,
  CollectionReference,
  DocumentReference,
  doc,
  Timestamp,
  Query,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { db } from './firebaseConfig'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * School Configuration
 */
export interface School {
  id: string
  name: string
  domain: string // e.g., "rylneuroacademy.com"
  established: Timestamp
  board: string // CBSE, ICSE, IB, State, etc.
  region: string
  studentCount: number
  teacherCount: number
  principalEmail: string
  apiKey: string // For data ingestion
  config: {
    selectedChallenges: string[] // C1-C15
    respondentRoles: ('TEACHER' | 'PARENT' | 'STUDENT' | 'ADMIN' | 'OTHER')[]
    expectedRespondents: Record<string, number> // By role
    multiplierSources: Record<string, string[]> // Source systems
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Assessment Cycle - Container for one diagnostic run
 */
export interface AssessmentCycle {
  id: string
  schoolId: string
  cycleNumber: number // 1, 2, 3, ...
  year: string // "2026", "2027", ...
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
  startDate: Timestamp
  endDate: Timestamp
  respondentDeadline: Timestamp
  submittedAt?: Timestamp // When locked/finalized
  config: {
    selectedChallenges: string[]
    expectedRespondents: Record<string, number>
    weights: Record<string, number> // Challenge weights
  }
  scores: {
    s_sub: number | null
    m_obj: number | null
    healthIndex: number | null
    gap: number | null
    quadrant: string | null
  }
  respondentCount: Record<string, number> // By role
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Challenge Response - Individual respondent answer
 */
export interface ChallengeResponse {
  id: string
  challengeId: string // C1-C15
  responderId: string
  role: 'TEACHER' | 'PARENT' | 'STUDENT' | 'ADMIN' | 'OTHER'
  email: string
  schoolId: string
  cycleId: string
  responses: Record<
    string,
    {
      text: string
      selectedOption: number
      maxOption: number
      isFact: boolean // Refinement 4
      factSource?: string
    }
  >
  challenge: {
    title: string
    domain: string
    weight: number
    description: string
  }
  submittedAt: Timestamp
  updatedAt: Timestamp
  deleted: boolean
}

/**
 * Multiplier - Objective metric value
 */
export interface Multiplier {
  id: string
  name: string // STR, ParentSLA, Training, Planning, Fee, Safety, Digital, Extracurricular
  category: 'CORE' | 'EXPANDED'
  value: number // 0.0-1.0
  rawData: {
    value: number
    unit: string
    threshold: Record<
      string,
      {
        min: number
        max: number
      }
    >
  }
  source: {
    system: string // HR, Finance, Timetable, etc.
    extractedAt: Timestamp
    dataCard: string // Reference to multiplier data card
  }
  calculation: {
    formula: string
    inputs: string[]
    appliedFormula: string
  }
  validationStatus: 'VALID' | 'MISSING' | 'OUTLIER' | 'PENDING'
  validationError?: string
  updatedAt: Timestamp
}

/**
 * Multiplier Data Card - Definition & thresholds
 */
export interface MultiplierDataCard {
  id: string
  name: string
  title: string
  domain: string
  description: string
  dataUnit: string // ratio, %, hours, etc.
  thresholds: {
    excellent: { min: number; max: number }
    good: { min: number; max: number }
    average: { min: number; max: number }
    poor: { min: number; max: number }
    critical: { min: number; max: number }
  }
  sourceSystem: string
  sourceMapping: {
    table: string
    fields: string[]
    joinCondition: string
  }
  calculationFormula: string
  benchmarks: {
    national: number
    state: number
    region: number
    category: number
  }
  benchmarkYear: string
  createdAt: Timestamp
}

/**
 * Report Snapshot - Generated First Opinion Report
 */
export interface ReportSnapshot {
  cycleId: string
  schoolId: string
  headline: {
    healthIndex: number
    trend: string // IMPROVING, STABLE, DECLINING
    trendValue: number
  }
  driverAnalysis: {
    challenges: Array<{
      challengeId: string
      rank: number
      severityScore: number
      weight: number
      contribution: number
      domain: string
      topQuestion: string
    }>
  }
  character: {
    gap: number
    quadrant: string
    interpretation: string
    communicationGap: boolean
    blindSpotRisk: boolean
  }
  engineRoom: {
    multipliers: Array<{
      name: string
      value: number
      trend: string
      benchmark: {
        national: number
        regional: number
      }
      status: string
    }>
    geometricMean: number
  }
  trajectory?: {
    cycles: Array<{
      cycleNumber: number
      dateRange: { start: Timestamp; end: Timestamp }
      scores: { s_sub: number; m_obj: number; h: number }
      highlights: string[]
    }>
    trends: {
      s_sub_trend: string
      m_obj_trend: string
      h_trend: string
    }
  }
  recommendations: {
    domain: string
    challenges: string[]
    mapped14Dimensions: string[]
    actionPriority: string
    actionItems: string[]
  }
  earlyWarnings?: {
    flags: Array<{
      flagId: string
      severity: string
      description: string
      evidenceChallenge: string
      recommendedAction: string
    }>
  }
  generatedAt: Timestamp
  generatedBy: string
}

/**
 * Stakeholder Verification
 */
export interface StakeholderVerification {
  id: string
  schoolId: string
  email: string
  role: 'TEACHER' | 'PARENT' | 'ADMIN' | 'OTHER'
  phone?: string
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  verification: {
    teacherId?: string
    parentName?: string
    studentId?: string
    adminVerificationCode?: string
    verifiedAt?: Timestamp
    verifiedBy?: string
  }
  invitedAt: Timestamp
  expiresAt: Timestamp
  respondedAt?: Timestamp
  deletedAt?: Timestamp
}

/**
 * Trend History - Multi-cycle archive
 */
export interface TrendHistoryEntry {
  schoolId: string
  cycleId: string
  cycleNumber: number
  year: string
  scores: {
    s_sub: number
    m_obj: number
    healthIndex: number
    gap: number
  }
  multipliers: Record<string, number>
  respondentCount: Record<string, number>
  createdAt: Timestamp
}

// ============================================================================
// COLLECTION REFERENCES
// ============================================================================

/**
 * Get reference to schools collection
 */
export const getSchoolsRef = (): CollectionReference<School> =>
  collection(db, 'schools') as CollectionReference<School>

/**
 * Get reference to specific school
 */
export const getSchoolRef = (schoolId: string): DocumentReference<School> =>
  doc(db, 'schools', schoolId) as DocumentReference<School>

/**
 * Get reference to assessment cycles for a school
 */
export const getAssessmentCyclesRef = (
  schoolId: string
): CollectionReference<AssessmentCycle> =>
  collection(
    db,
    `schools/${schoolId}/assessmentCycles`
  ) as CollectionReference<AssessmentCycle>

/**
 * Get reference to specific assessment cycle
 */
export const getAssessmentCycleRef = (
  schoolId: string,
  cycleId: string
): DocumentReference<AssessmentCycle> =>
  doc(
    db,
    `schools/${schoolId}/assessmentCycles/${cycleId}`
  ) as DocumentReference<AssessmentCycle>

/**
 * Get reference to challenge responses for a cycle
 */
export const getChallengeResponsesRef = (
  schoolId: string,
  cycleId: string
): CollectionReference<ChallengeResponse> =>
  collection(
    db,
    `schools/${schoolId}/assessmentCycles/${cycleId}/challengeResponses`
  ) as CollectionReference<ChallengeResponse>

/**
 * Get reference to multipliers for a cycle
 */
export const getMultipliersRef = (
  schoolId: string,
  cycleId: string
): CollectionReference<Multiplier> =>
  collection(
    db,
    `schools/${schoolId}/assessmentCycles/${cycleId}/multipliers`
  ) as CollectionReference<Multiplier>

/**
 * Get reference to multiplier data cards (global)
 */
export const getMultiplierDataCardsRef = (): CollectionReference<MultiplierDataCard> =>
  collection(db, 'multiplierDataCards') as CollectionReference<MultiplierDataCard>

/**
 * Get reference to report snapshot for a cycle
 */
export const getReportSnapshotRef = (
  schoolId: string,
  cycleId: string
): DocumentReference<ReportSnapshot> =>
  doc(
    db,
    `schools/${schoolId}/assessmentCycles/${cycleId}/reportSnapshot`
  ) as DocumentReference<ReportSnapshot>

/**
 * Get reference to stakeholder verifications
 */
export const getStakeholderVerificationsRef = (): CollectionReference<StakeholderVerification> =>
  collection(db, 'stakeholderVerifications') as CollectionReference<StakeholderVerification>

/**
 * Get reference to trend history
 */
export const getTrendHistoryRef = (
  schoolId: string
): CollectionReference<TrendHistoryEntry> =>
  collection(
    db,
    `schools/${schoolId}/trendHistory`
  ) as CollectionReference<TrendHistoryEntry>

// ============================================================================
// QUERY BUILDERS
// ============================================================================

/**
 * Query active assessment cycles for a school
 */
export const getActiveCyclesQuery = (schoolId: string): Query =>
  query(
    getAssessmentCyclesRef(schoolId),
    where('status', '==', 'ACTIVE'),
    orderBy('startDate', 'desc')
  )

/**
 * Query non-deleted challenge responses
 */
export const getNonDeletedResponsesQuery = (
  schoolId: string,
  cycleId: string
): Query =>
  query(
    getChallengeResponsesRef(schoolId, cycleId),
    where('deleted', '==', false),
    orderBy('submittedAt', 'desc')
  )

/**
 * Query responses for a specific challenge
 */
export const getChallengeResponsesForChallengeQuery = (
  schoolId: string,
  cycleId: string,
  challengeId: string
): Query =>
  query(
    getChallengeResponsesRef(schoolId, cycleId),
    where('challengeId', '==', challengeId),
    where('deleted', '==', false)
  )

/**
 * Query responses by role
 */
export const getResponsesByRoleQuery = (
  schoolId: string,
  cycleId: string,
  role: string
): Query =>
  query(
    getChallengeResponsesRef(schoolId, cycleId),
    where('role', '==', role),
    where('deleted', '==', false)
  )

/**
 * Query trend history for a school
 */
export const getTrendHistoryQuery = (schoolId: string): Query =>
  query(getTrendHistoryRef(schoolId), orderBy('cycleNumber', 'desc'))

/**
 * Query verified stakeholders
 */
export const getVerifiedStakeholdersQuery = (): Query =>
  query(
    getStakeholderVerificationsRef(),
    where('status', '==', 'VERIFIED'),
    orderBy('verifiedAt', 'desc')
  )

// ============================================================================
// SCHEMA INITIALIZATION
// ============================================================================

/**
 * Initialize Firestore collection indexes
 * Call this once during app setup
 */
export async function initializeFirstOpinionSchema(): Promise<void> {
  // Note: Composite indexes need to be created in Firebase Console
  // This is a reminder of what indexes to create:

  const requiredIndexes = [
    {
      collection: 'schools/{schoolId}/assessmentCycles',
      fields: [
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'startDate', order: 'DESCENDING' }
      ]
    },
    {
      collection: 'schools/{schoolId}/assessmentCycles/{cycleId}/challengeResponses',
      fields: [
        { fieldPath: 'deleted', order: 'ASCENDING' },
        { fieldPath: 'submittedAt', order: 'DESCENDING' }
      ]
    },
    {
      collection: 'schools/{schoolId}/assessmentCycles/{cycleId}/challengeResponses',
      fields: [
        { fieldPath: 'challengeId', order: 'ASCENDING' },
        { fieldPath: 'deleted', order: 'ASCENDING' }
      ]
    },
    {
      collection: 'schools/{schoolId}/assessmentCycles/{cycleId}/challengeResponses',
      fields: [
        { fieldPath: 'role', order: 'ASCENDING' },
        { fieldPath: 'deleted', order: 'ASCENDING' }
      ]
    },
    {
      collection: 'stakeholderVerifications',
      fields: [
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'verifiedAt', order: 'DESCENDING' }
      ]
    },
    {
      collection: 'schools/{schoolId}/trendHistory',
      fields: [{ fieldPath: 'cycleNumber', order: 'DESCENDING' }]
    }
  ]

  console.log(
    'First Opinion Engine Schema initialized.',
    'Create the following composite indexes in Firebase Console:',
    requiredIndexes
  )
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Safe version of School (without Firestore metadata)
 */
export type SchoolData = Omit<School, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

/**
 * Safe version of AssessmentCycle
 */
export type CycleData = Omit<AssessmentCycle, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

/**
 * Safe version of ChallengeResponse
 */
export type ResponseData = Omit<
  ChallengeResponse,
  'id' | 'schoolId' | 'cycleId' | 'submittedAt' | 'updatedAt'
> & {
  submittedAt?: Timestamp
  updatedAt?: Timestamp
}

/**
 * Score calculation intermediate result
 */
export interface ScoreCalculation {
  cycleId: string
  schoolId: string
  s_sub: number
  m_obj: number
  healthIndex: number
  gap: number
  quadrant: string
  calculatedAt: Timestamp
  respondentCount: Record<string, number>
}

export default {
  getSchoolsRef,
  getSchoolRef,
  getAssessmentCyclesRef,
  getAssessmentCycleRef,
  getChallengeResponsesRef,
  getMultipliersRef,
  getMultiplierDataCardsRef,
  getReportSnapshotRef,
  getStakeholderVerificationsRef,
  getTrendHistoryRef,
  initializeFirstOpinionSchema
}

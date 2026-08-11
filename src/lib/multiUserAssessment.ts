/**
 * Multi-User Stakeholder Assessment System
 * Manages multiple respondents per stakeholder type with tracking and locking
 */

export type StakeholderType = 'teacher' | 'parent' | 'student' | 'admin' | 'other';

export interface StakeholderConfig {
  type: StakeholderType;
  displayName: string;
  expectedCount: number;
  description: string;
  icon: string;
}

export interface StakeholderResponse {
  respondentId: string; // unique ID for this respondent
  stakeholderType: StakeholderType;
  respondentName?: string;
  respondentClass?: string; // for students
  respondentSection?: string; // for students
  responses: Record<string, number>; // dimension scores
  qualitativeFeedback?: string;
  submittedAt: Date;
  completionPercentage: number;
}

export interface AssessmentConfiguration {
  id: string;
  schoolId: string;
  schoolName: string;
  eventName: string;
  assessmentType: '14d-multilateral';
  createdAt: Date;

  // Expected respondent counts (manually configured)
  expectedRespondents: {
    teacher: number;
    parent: number;
    student: number;
    admin: number;
    other: number;
  };

  // Tracking
  totalExpected: number;

  // Status - persisted in Firestore, source of truth for whether this event
  // still accepts responses and whether analysis may proceed.
  status: 'active' | 'locked' | 'analyzed';
  configuredAt: Date;
  lockedAt?: Date;

  // Notes
  notes?: string;
}

export interface AssessmentProgress {
  configId: string;
  schoolId: string;

  // Actual respondents per type
  actualRespondents: {
    teacher: number;
    parent: number;
    student: number;
    admin: number;
    other: number;
  };

  totalActual: number;
  responseRate: number; // percentage

  // Response details per stakeholder
  responses: StakeholderResponse[];

  // Lock status
  isLocked: boolean;
  lockedAt?: Date;
  lockedBy?: string;

  // Metadata
  lastUpdated: Date;
}

/**
 * Create a new assessment configuration
 */
export function createAssessmentConfiguration(
  schoolId: string,
  schoolName: string,
  eventName: string,
  expectedCounts: Record<StakeholderType, number>
): AssessmentConfiguration {
  const totalExpected = Object.values(expectedCounts).reduce((a, b) => a + b, 0);

  return {
    id: `config_${schoolId}_${Date.now()}`,
    schoolId,
    schoolName,
    eventName,
    assessmentType: '14d-multilateral',
    createdAt: new Date(),
    expectedRespondents: {
      teacher: expectedCounts.teacher || 0,
      parent: expectedCounts.parent || 0,
      student: expectedCounts.student || 0,
      admin: expectedCounts.admin || 0,
      other: expectedCounts.other || 0,
    },
    totalExpected,
    status: 'active',
    configuredAt: new Date(),
  };
}

/**
 * Initialize progress tracking
 */
export function initializeAssessmentProgress(
  config: AssessmentConfiguration
): AssessmentProgress {
  return {
    configId: config.id,
    schoolId: config.schoolId,
    actualRespondents: {
      teacher: 0,
      parent: 0,
      student: 0,
      admin: 0,
      other: 0,
    },
    totalActual: 0,
    responseRate: 0,
    responses: [],
    isLocked: false,
    lastUpdated: new Date(),
  };
}

/**
 * Rebuild progress for an event reloaded from Firestore, carrying over its
 * persisted lock state instead of resetting to "unlocked" on every reload.
 */
export function hydrateAssessmentProgress(
  config: AssessmentConfiguration,
  persisted: { isLocked: boolean; lockedAt?: Date; lockedBy?: string }
): AssessmentProgress {
  return {
    ...initializeAssessmentProgress(config),
    isLocked: persisted.isLocked,
    lockedAt: persisted.lockedAt,
    lockedBy: persisted.lockedBy,
  };
}

/**
 * Add a response from a stakeholder
 */
export function addStakeholderResponse(
  progress: AssessmentProgress,
  response: StakeholderResponse
): AssessmentProgress {
  if (progress.isLocked) {
    throw new Error('Assessment is locked. No new responses can be added.');
  }

  const updated = { ...progress };

  // Add response
  updated.responses.push(response);

  // Update counts
  updated.actualRespondents[response.stakeholderType]++;
  updated.totalActual++;

  // Calculate response rate
  if (updated.configId) {
    // We'll calculate from config in the component layer
  }

  updated.lastUpdated = new Date();

  return updated;
}

/**
 * Lock assessment for analysis
 */
export function lockAssessment(
  progress: AssessmentProgress,
  lockedBy: string = 'admin'
): AssessmentProgress {
  return {
    ...progress,
    isLocked: true,
    lockedAt: new Date(),
    lockedBy,
  };
}

/**
 * Unlock assessment to allow more responses
 */
export function unlockAssessment(
  progress: AssessmentProgress
): AssessmentProgress {
  return {
    ...progress,
    isLocked: false,
    lockedAt: undefined,
    lockedBy: undefined,
  };
}

/**
 * Get response summary
 */
export function getResponseSummary(
  progress: AssessmentProgress,
  config: AssessmentConfiguration
) {
  const summary: Record<StakeholderType, {
    expected: number;
    actual: number;
    percentage: number;
    status: 'complete' | 'in-progress' | 'incomplete';
  }> = {
    teacher: {
      expected: config.expectedRespondents.teacher,
      actual: progress.actualRespondents.teacher,
      percentage: config.expectedRespondents.teacher > 0
        ? Math.round((progress.actualRespondents.teacher / config.expectedRespondents.teacher) * 100)
        : 0,
      status: progress.actualRespondents.teacher >= config.expectedRespondents.teacher ? 'complete' :
              progress.actualRespondents.teacher > 0 ? 'in-progress' : 'incomplete',
    },
    parent: {
      expected: config.expectedRespondents.parent,
      actual: progress.actualRespondents.parent,
      percentage: config.expectedRespondents.parent > 0
        ? Math.round((progress.actualRespondents.parent / config.expectedRespondents.parent) * 100)
        : 0,
      status: progress.actualRespondents.parent >= config.expectedRespondents.parent ? 'complete' :
              progress.actualRespondents.parent > 0 ? 'in-progress' : 'incomplete',
    },
    student: {
      expected: config.expectedRespondents.student,
      actual: progress.actualRespondents.student,
      percentage: config.expectedRespondents.student > 0
        ? Math.round((progress.actualRespondents.student / config.expectedRespondents.student) * 100)
        : 0,
      status: progress.actualRespondents.student >= config.expectedRespondents.student ? 'complete' :
              progress.actualRespondents.student > 0 ? 'in-progress' : 'incomplete',
    },
    admin: {
      expected: config.expectedRespondents.admin,
      actual: progress.actualRespondents.admin,
      percentage: config.expectedRespondents.admin > 0
        ? Math.round((progress.actualRespondents.admin / config.expectedRespondents.admin) * 100)
        : 0,
      status: progress.actualRespondents.admin >= config.expectedRespondents.admin ? 'complete' :
              progress.actualRespondents.admin > 0 ? 'in-progress' : 'incomplete',
    },
    other: {
      expected: config.expectedRespondents.other,
      actual: progress.actualRespondents.other,
      percentage: config.expectedRespondents.other > 0
        ? Math.round((progress.actualRespondents.other / config.expectedRespondents.other) * 100)
        : 0,
      status: progress.actualRespondents.other >= config.expectedRespondents.other ? 'complete' :
              progress.actualRespondents.other > 0 ? 'in-progress' : 'incomplete',
    },
  };

  return summary;
}

/**
 * Get overall progress percentage
 */
export function getOverallProgress(
  progress: AssessmentProgress,
  config: AssessmentConfiguration
): number {
  if (config.totalExpected === 0) return 0;
  return Math.round((progress.totalActual / config.totalExpected) * 100);
}

export default {
  createAssessmentConfiguration,
  initializeAssessmentProgress,
  hydrateAssessmentProgress,
  addStakeholderResponse,
  lockAssessment,
  unlockAssessment,
  getResponseSummary,
  getOverallProgress,
};

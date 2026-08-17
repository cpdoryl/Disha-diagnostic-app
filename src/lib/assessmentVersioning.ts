/**
 * Assessment Versioning & History System
 * Manages assessment versions with timestamps
 * Enables historical data retrieval and trend analysis
 */

export interface AssessmentVersion {
  id: string;
  versionNumber: number;
  timestamp: Date;
  dateCreated: string; // Format: "2026-08-08"
  dateFormatted: string; // Format: "August 8, 2026"

  // Survey data
  surveyData: {
    [stakeholderType: string]: {
      respondents: number;
      responses: Record<string, number>;
      qualitativeFeedback: string;
      submittedAt: Date;
    };
  };

  // Scores
  scores: {
    [dimensionId: string]: {
      dimensionName: string;
      score: number;
      benchmark: number;
      gap: number;
    };
  };

  // Metadata
  schoolId: string;
  schoolName: string;
  status: 'active' | 'archived' | 'draft';
  completionPercentage: number;
  totalRespondents: number;

  // Notes
  notes?: string;
  assessmentType: 'first-opinion' | '14d-multilateral';
}

export interface AssessmentTrend {
  dimensionId: string;
  dimensionName: string;
  versions: Array<{
    version: number;
    date: string;
    score: number;
    benchmark: number;
    trend: 'improving' | 'declining' | 'stable';
  }>;
  overallTrend: 'improving' | 'declining' | 'stable';
  scoreImprovement: number; // points change from first to last
  improvementPercentage: number;
}

export interface AssessmentHistory {
  schoolId: string;
  schoolName: string;
  totalAssessments: number;
  versions: AssessmentVersion[];
  trends: AssessmentTrend[];
  overallProgress: {
    startDate: string;
    endDate: string;
    averageScoreImprovement: number;
    dimensionsImproving: number;
    dimensionsDeclining: number;
    dimensionsStable: number;
  };
}

/**
 * Create a new assessment version
 */
export function createAssessmentVersion(
  schoolId: string,
  schoolName: string,
  versionNumber: number,
  assessmentType: 'first-opinion' | '14d-multilateral'
): AssessmentVersion {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    id: `assessment-${schoolId}-${Date.now()}`,
    versionNumber,
    timestamp: now,
    dateCreated: dateStr,
    dateFormatted: formatter.format(now),
    surveyData: {},
    scores: {},
    schoolId,
    schoolName,
    status: 'draft',
    completionPercentage: 0,
    totalRespondents: 0,
    assessmentType
  };
}

/**
 * Add survey response to assessment version
 */
export function addSurveyResponse(
  version: AssessmentVersion,
  stakeholderType: string,
  responses: Record<string, number>,
  qualitativeFeedback: string = ''
): AssessmentVersion {
  if (!version.surveyData[stakeholderType]) {
    version.surveyData[stakeholderType] = {
      respondents: 0,
      responses: {},
      qualitativeFeedback: '',
      submittedAt: new Date()
    };
  }

  version.surveyData[stakeholderType].respondents += 1;
  version.surveyData[stakeholderType].responses = {
    ...version.surveyData[stakeholderType].responses,
    ...responses
  };

  if (qualitativeFeedback) {
    version.surveyData[stakeholderType].qualitativeFeedback = qualitativeFeedback;
  }

  version.totalRespondents += 1;
  updateCompletionPercentage(version);

  return version;
}

/**
 * Update completion percentage
 */
export function updateCompletionPercentage(version: AssessmentVersion): void {
  const expectedStakeholders = 6; // leader, teacher, parent, student, admin, other
  const respondedStakeholders = Object.keys(version.surveyData).length;
  version.completionPercentage = Math.round((respondedStakeholders / expectedStakeholders) * 100);
}

/**
 * Mark assessment as complete
 */
export function completeAssessment(version: AssessmentVersion): AssessmentVersion {
  version.status = 'active';
  version.timestamp = new Date();
  return version;
}

/**
 * Archive assessment
 */
export function archiveAssessment(version: AssessmentVersion): AssessmentVersion {
  version.status = 'archived';
  return version;
}

/**
 * Calculate trends between versions
 */
export function calculateTrends(versions: AssessmentVersion[]): AssessmentTrend[] {
  const trends: AssessmentTrend[] = [];
  const sortedVersions = [...versions].sort((a, b) =>
    new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
  );

  // Collect all dimensions
  const allDimensions = new Set<string>();
  sortedVersions.forEach(v => {
    Object.keys(v.scores).forEach(dimId => allDimensions.add(dimId));
  });

  // Calculate trend for each dimension
  allDimensions.forEach(dimensionId => {
    const dimensionName =
      sortedVersions.find(v => v.scores[dimensionId]?.dimensionName)?.scores[dimensionId]?.dimensionName ||
      dimensionId;
    const versionScores = sortedVersions
      .map((v, idx) => ({
        version: v.versionNumber,
        date: v.dateCreated,
        score: v.scores[dimensionId]?.score || 0,
        benchmark: v.scores[dimensionId]?.benchmark || 0,
        trend: calculateScoreTrend(
          sortedVersions[Math.max(0, idx - 1)]?.scores[dimensionId]?.score || 0,
          v.scores[dimensionId]?.score || 0
        ) as 'improving' | 'declining' | 'stable'
      }))
      .filter(s => s.score > 0);

    if (versionScores.length > 0) {
      const firstScore = versionScores[0].score;
      const lastScore = versionScores[versionScores.length - 1].score;
      const improvement = lastScore - firstScore;
      const improvementPct = firstScore > 0 ? (improvement / firstScore) * 100 : 0;

      // Calculate overall trend
      const trends_count = versionScores.filter(s => s.trend === 'improving').length;
      const declines_count = versionScores.filter(s => s.trend === 'declining').length;
      let overallTrend: 'improving' | 'declining' | 'stable' = 'stable';
      if (trends_count > declines_count) {
        overallTrend = 'improving';
      } else if (declines_count > trends_count) {
        overallTrend = 'declining';
      }

      trends.push({
        dimensionId,
        dimensionName,
        versions: versionScores,
        overallTrend,
        scoreImprovement: improvement,
        improvementPercentage: improvementPct
      });
    }
  });

  return trends;
}

/**
 * Calculate score trend direction
 */
function calculateScoreTrend(previousScore: number, currentScore: number): string {
  const tolerance = 2; // within 2 points is stable
  const diff = currentScore - previousScore;

  if (Math.abs(diff) <= tolerance) return 'stable';
  return diff > 0 ? 'improving' : 'declining';
}

/**
 * Get assessment history summary
 */
export function getAssessmentHistorySummary(versions: AssessmentVersion[]): AssessmentHistory {
  const activeVersions = versions.filter(v => v.status === 'active');
  const trends = calculateTrends(activeVersions);

  const sortedVersions = [...activeVersions].sort((a, b) =>
    new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
  );

  const improvingDimensions = trends.filter(t => t.overallTrend === 'improving').length;
  const decliningDimensions = trends.filter(t => t.overallTrend === 'declining').length;
  const stableDimensions = trends.filter(t => t.overallTrend === 'stable').length;

  const firstVersion = sortedVersions[0];
  const lastVersion = sortedVersions[sortedVersions.length - 1];

  const overallImprovement = trends.reduce((sum, t) => sum + t.scoreImprovement, 0) /
    Math.max(trends.length, 1);

  return {
    schoolId: activeVersions[0]?.schoolId || '',
    schoolName: activeVersions[0]?.schoolName || '',
    totalAssessments: activeVersions.length,
    versions: activeVersions,
    trends,
    overallProgress: {
      startDate: firstVersion?.dateCreated || '',
      endDate: lastVersion?.dateCreated || '',
      averageScoreImprovement: Math.round(overallImprovement * 100) / 100,
      dimensionsImproving: improvingDimensions,
      dimensionsDeclining: decliningDimensions,
      dimensionsStable: stableDimensions
    }
  };
}

/**
 * Get assessment by date
 */
export function getAssessmentByDate(
  versions: AssessmentVersion[],
  date: string
): AssessmentVersion | null {
  return versions.find(v => v.dateCreated === date) || null;
}

/**
 * Get assessments for date range
 */
export function getAssessmentsInDateRange(
  versions: AssessmentVersion[],
  startDate: string,
  endDate: string
): AssessmentVersion[] {
  return versions.filter(v => {
    const vDate = new Date(v.dateCreated);
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    return vDate >= sDate && vDate <= eDate;
  });
}

/**
 * Export assessment history as JSON
 */
export function exportAssessmentHistory(history: AssessmentHistory): string {
  return JSON.stringify(history, null, 2);
}

/**
 * Compare two versions
 */
export function compareVersions(
  version1: AssessmentVersion,
  version2: AssessmentVersion
): {
  dimensionChanges: Array<{
    dimensionId: string;
    dimensionName: string;
    version1Score: number;
    version2Score: number;
    change: number;
    changePercentage: number;
    trend: 'improved' | 'declined' | 'stable';
  }>;
  respondentChange: number;
  completionChange: number;
} {
  const dimensionChanges = Object.keys({ ...version1.scores, ...version2.scores }).map(dimId => {
    const score1 = version1.scores[dimId]?.score || 0;
    const score2 = version2.scores[dimId]?.score || 0;
    const change = score2 - score1;
    const changePercentage = score1 > 0 ? (change / score1) * 100 : 0;

    let trend: 'improved' | 'declined' | 'stable' = 'stable';
    if (Math.abs(change) > 2) {
      trend = change > 0 ? 'improved' : 'declined';
    }

    return {
      dimensionId: dimId,
      dimensionName: version2.scores[dimId]?.dimensionName || dimId,
      version1Score: score1,
      version2Score: score2,
      change,
      changePercentage: Math.round(changePercentage * 100) / 100,
      trend
    };
  });

  return {
    dimensionChanges,
    respondentChange: version2.totalRespondents - version1.totalRespondents,
    completionChange: version2.completionPercentage - version1.completionPercentage
  };
}

export default {
  createAssessmentVersion,
  addSurveyResponse,
  completeAssessment,
  archiveAssessment,
  calculateTrends,
  getAssessmentHistorySummary,
  getAssessmentByDate,
  getAssessmentsInDateRange,
  exportAssessmentHistory,
  compareVersions
};

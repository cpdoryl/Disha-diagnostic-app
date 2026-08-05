/**
 * Multi-Respondent Analytics Service
 * Calculates consensus, outliers, trends, and aggregated metrics
 */

import {
  AggregatedDimensionData,
  AssessmentStatistics,
  Respondent,
  DimensionAggregation,
  StakeholderMetrics,
  DivergenceSummary,
  OutlierSummary,
  OutlierAnomaly,
  ConsensusLevel,
  CONSENSUS_THRESHOLDS,
  OUTLIER_Z_SCORE_THRESHOLD,
  StakeholderGroup,
  STAKEHOLDER_DISPLAY_NAMES
} from '@/types/multi-respondent';

// ============================================================================
// ANALYTICS CALCULATIONS
// ============================================================================

export class MultiRespondentAnalytics {
  /**
   * Calculate aggregated scores and statistics
   */
  static calculateAggregatedScores(
    respondents: Respondent[],
    dimensions: string[]  // ['D01', 'D02', ...]
  ): { aggregated: AggregatedDimensionData; statistics: AssessmentStatistics } {
    const aggregated: AggregatedDimensionData = {};
    const statistics: AssessmentStatistics = {
      totalRespondents: respondents.length,
      respondentsByCategory: {
        management: 0,
        teachers: 0,
        parents_students: 0,
        operational_metrics: 0
      },
      completionRate: 0,
      consensusAnalysis: {
        highConsensus: [],
        moderateConsensus: [],
        lowConsensus: [],
        highConflict: []
      },
      divergentDimensions: {},
      strongAgreementDimensions: [],
      outliers: [],
      stakeholderComparison: {}
    };

    // Count respondents by category
    const respondentsByCategory = {
      management: respondents.filter(r => r.stakeholderGroup === 'management').length,
      teachers: respondents.filter(r => r.stakeholderGroup === 'teachers').length,
      parents_students: respondents.filter(r => r.stakeholderGroup === 'parents_students').length,
      operational_metrics: respondents.filter(r => r.stakeholderGroup === 'operational_metrics').length
    };
    statistics.respondentsByCategory = respondentsByCategory;

    // Calculate completion rate
    const completedRespondents = respondents.filter(r => r.status === 'COMPLETE').length;
    statistics.completionRate = respondents.length > 0
      ? Math.round((completedRespondents / respondents.length) * 100)
      : 0;

    // Calculate metrics per dimension
    dimensions.forEach(dimensionId => {
      aggregated[dimensionId] = this.calculateDimensionAggregation(
        dimensionId,
        respondents,
        respondentsByCategory
      );

      // Classify consensus
      const consensusLevel = aggregated[dimensionId].consensus;
      if (consensusLevel === 'HIGH') {
        statistics.consensusAnalysis.highConsensus.push(dimensionId);
        statistics.strongAgreementDimensions.push(dimensionId);
      } else if (consensusLevel === 'GOOD' || consensusLevel === 'MODERATE') {
        statistics.consensusAnalysis.moderateConsensus.push(dimensionId);
      } else if (consensusLevel === 'LOW') {
        statistics.consensusAnalysis.lowConsensus.push(dimensionId);
      } else if (consensusLevel === 'HIGH_CONFLICT') {
        statistics.consensusAnalysis.highConflict.push(dimensionId);
        statistics.divergentDimensions[dimensionId] =
          this.analyzeDivergence(dimensionId, respondents, respondentsByCategory);
      }
    });

    // Calculate stakeholder comparison
    statistics.stakeholderComparison = this.calculateStakeholderComparison(
      respondents,
      dimensions
    );

    // Detect outliers
    statistics.outliers = this.detectOutliers(respondents, respondentsByCategory, dimensions);

    return { aggregated, statistics };
  }

  /**
   * Calculate aggregation for single dimension
   */
  private static calculateDimensionAggregation(
    dimensionId: string,
    respondents: Respondent[],
    respondentsByCategory: Record<StakeholderGroup, number>
  ): DimensionAggregation {
    // Get all scores for this dimension
    const scores = respondents
      .filter(r => r.dimensionScores[dimensionId] !== undefined)
      .map(r => r.dimensionScores[dimensionId]);

    if (scores.length === 0) {
      return {
        mean: 0,
        median: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        range: 0,
        sampleSize: 0,
        consensus: 'HIGH_CONFLICT',
        consensusLevel: 0,
        byStakeholder: {
          management: { mean: 0, stdDev: 0, n: 0 },
          teachers: { mean: 0, stdDev: 0, n: 0 },
          parents_students: { mean: 0, stdDev: 0, n: 0 },
          operational_metrics: { mean: 0, stdDev: 0, n: 0 }
        }
      };
    }

    // Calculate basic statistics
    const mean = scores.reduce((a, b) => a + b) / scores.length;
    const median = this.calculateMedian(scores);
    const stdDev = this.calculateStdDev(scores, mean);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const range = max - min;

    // Determine consensus level based on std dev
    const consensusLevel = this.determineConsensusLevel(stdDev);

    // Calculate by stakeholder
    const byStakeholder: Record<StakeholderGroup, StakeholderMetrics> = {
      management: this.calculateStakeholderMetrics(dimensionId, respondents, 'management'),
      teachers: this.calculateStakeholderMetrics(dimensionId, respondents, 'teachers'),
      parents_students: this.calculateStakeholderMetrics(dimensionId, respondents, 'parents_students'),
      operational_metrics: this.calculateStakeholderMetrics(dimensionId, respondents, 'operational_metrics')
    };

    // Calculate consensus value (0-1)
    const consensusValue = Math.max(0, 1 - (stdDev / 5));  // Normalize std dev

    return {
      mean,
      median,
      stdDev,
      min,
      max,
      range,
      sampleSize: scores.length,
      consensus: consensusLevel,
      consensusLevel: consensusValue,
      byStakeholder
    };
  }

  /**
   * Calculate metrics for specific stakeholder group
   */
  private static calculateStakeholderMetrics(
    dimensionId: string,
    respondents: Respondent[],
    stakeholder: StakeholderGroup
  ): StakeholderMetrics {
    const stakeholderRespondents = respondents.filter(r => r.stakeholderGroup === stakeholder);
    const scores = stakeholderRespondents
      .filter(r => r.dimensionScores[dimensionId] !== undefined)
      .map(r => r.dimensionScores[dimensionId]);

    if (scores.length === 0) {
      return {
        mean: 0,
        stdDev: 0,
        n: 0
      };
    }

    const mean = scores.reduce((a, b) => a + b) / scores.length;
    const median = this.calculateMedian(scores);
    const stdDev = this.calculateStdDev(scores, mean);

    return {
      mean,
      median,
      stdDev,
      n: scores.length,
      respondents: stakeholderRespondents.map(r => r.respondentId)
    };
  }

  /**
   * Analyze divergence between stakeholders
   */
  private static analyzeDivergence(
    dimensionId: string,
    respondents: Respondent[],
    respondentsByCategory: Record<StakeholderGroup, number>
  ): DivergenceSummary {
    const stakeholders: StakeholderGroup[] = [
      'management',
      'teachers',
      'parents_students',
      'operational_metrics'
    ];

    const byStakeholder: Record<StakeholderGroup, number> = {
      management: 0,
      teachers: 0,
      parents_students: 0,
      operational_metrics: 0
    };

    let maxScore = 0;
    let minScore = 100;
    let maxStakeholder: StakeholderGroup = 'management';
    let minStakeholder: StakeholderGroup = 'management';

    // Calculate average score per stakeholder
    stakeholders.forEach(stakeholder => {
      const stakeholderRespondents = respondents.filter(r => r.stakeholderGroup === stakeholder);
      const scores = stakeholderRespondents
        .filter(r => r.dimensionScores[dimensionId] !== undefined)
        .map(r => r.dimensionScores[dimensionId]);

      if (scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b) / scores.length;
        byStakeholder[stakeholder] = parseFloat(avg.toFixed(1));

        if (avg > maxScore) {
          maxScore = avg;
          maxStakeholder = stakeholder;
        }
        if (avg < minScore) {
          minScore = avg;
          minStakeholder = stakeholder;
        }
      }
    });

    const maxGap = maxScore - minScore;
    const stdDev = this.calculateStdDev(
      Object.values(byStakeholder).filter(v => v > 0),
      Object.values(byStakeholder).filter(v => v > 0).reduce((a, b) => a + b) /
      Object.values(byStakeholder).filter(v => v > 0).length
    );

    // Determine gap size
    let gap: 'SMALL_GAP' | 'MODERATE_GAP' | 'LARGE_GAP';
    if (maxGap < 5) gap = 'SMALL_GAP';
    else if (maxGap < 15) gap = 'MODERATE_GAP';
    else gap = 'LARGE_GAP';

    return {
      dimension: dimensionId,
      stdDev,
      consensusLevel: Math.max(0, 1 - (stdDev / 5)),
      gap,
      byStakeholder,
      maxGap,
      maxGapBetween: [maxStakeholder, minStakeholder],
      recommendation: gap === 'LARGE_GAP'
        ? `URGENT: Investigate why ${STAKEHOLDER_DISPLAY_NAMES[minStakeholder]} rate this ${minScore.toFixed(1)} while ${STAKEHOLDER_DISPLAY_NAMES[maxStakeholder]} rate it ${maxScore.toFixed(1)}`
        : `Review: ${STAKEHOLDER_DISPLAY_NAMES[minStakeholder]} have concerns about this area`
    };
  }

  /**
   * Calculate stakeholder comparison metrics
   */
  private static calculateStakeholderComparison(
    respondents: Respondent[],
    dimensions: string[]
  ): Record<StakeholderGroup, { mean: number; median?: number; stdDev: number; n: number }> {
    const stakeholders: StakeholderGroup[] = [
      'management',
      'teachers',
      'parents_students',
      'operational_metrics'
    ];

    const comparison: Record<StakeholderGroup, { mean: number; median?: number; stdDev: number; n: number }> = {
      management: { mean: 0, stdDev: 0, n: 0 },
      teachers: { mean: 0, stdDev: 0, n: 0 },
      parents_students: { mean: 0, stdDev: 0, n: 0 },
      operational_metrics: { mean: 0, stdDev: 0, n: 0 }
    };

    stakeholders.forEach(stakeholder => {
      const stakeholderRespondents = respondents.filter(r => r.stakeholderGroup === stakeholder);

      if (stakeholderRespondents.length > 0) {
        const allScores: number[] = [];

        stakeholderRespondents.forEach(respondent => {
          dimensions.forEach(dimensionId => {
            if (respondent.dimensionScores[dimensionId] !== undefined) {
              allScores.push(respondent.dimensionScores[dimensionId]);
            }
          });
        });

        if (allScores.length > 0) {
          const mean = allScores.reduce((a, b) => a + b) / allScores.length;
          const median = this.calculateMedian(allScores);
          const stdDev = this.calculateStdDev(allScores, mean);

          comparison[stakeholder] = {
            mean: parseFloat(mean.toFixed(1)),
            median: parseFloat(median.toFixed(1)),
            stdDev: parseFloat(stdDev.toFixed(2)),
            n: stakeholderRespondents.length
          };
        }
      }
    });

    return comparison;
  }

  /**
   * Detect outlier respondents
   */
  private static detectOutliers(
    respondents: Respondent[],
    respondentsByCategory: Record<StakeholderGroup, number>,
    dimensions: string[]
  ): OutlierSummary[] {
    const outliers: OutlierSummary[] = [];

    // Group respondents by stakeholder
    const stakeholders: StakeholderGroup[] = [
      'management',
      'teachers',
      'parents_students',
      'operational_metrics'
    ];

    stakeholders.forEach(stakeholder => {
      const stakeholderRespondents = respondents.filter(r => r.stakeholderGroup === stakeholder);

      if (stakeholderRespondents.length < 3) return;  // Need at least 3 for meaningful outlier detection

      // Calculate group statistics
      const groupOverallScores = stakeholderRespondents
        .filter(r => r.overallScore !== undefined)
        .map(r => r.overallScore as number);

      if (groupOverallScores.length < 3) return;

      const groupMean = groupOverallScores.reduce((a, b) => a + b) / groupOverallScores.length;
      const groupStdDev = this.calculateStdDev(groupOverallScores, groupMean);

      // Find outliers
      stakeholderRespondents.forEach(respondent => {
        if (respondent.overallScore === undefined) return;

        const zScore = (respondent.overallScore - groupMean) / (groupStdDev || 1);

        if (Math.abs(zScore) > OUTLIER_Z_SCORE_THRESHOLD) {
          // This is an outlier
          const isHighOutlier = respondent.overallScore > groupMean;
          const type = isHighOutlier ? 'HIGH_OUTLIER' : 'LOW_OUTLIER';
          const percentile = this.calculatePercentile(respondent.overallScore, groupOverallScores);

          // Find dimension-level anomalies
          const anomalies: OutlierAnomaly[] = [];
          dimensions.forEach(dimensionId => {
            if (respondent.dimensionScores[dimensionId] !== undefined) {
              const dimensionScores = stakeholderRespondents
                .filter(r => r.dimensionScores[dimensionId] !== undefined)
                .map(r => r.dimensionScores[dimensionId]);

              if (dimensionScores.length >= 2) {
                const dimMean = dimensionScores.reduce((a, b) => a + b) / dimensionScores.length;
                const dimStdDev = this.calculateStdDev(dimensionScores, dimMean);
                const dimZScore = (respondent.dimensionScores[dimensionId] - dimMean) / (dimStdDev || 1);

                if (Math.abs(dimZScore) > OUTLIER_Z_SCORE_THRESHOLD) {
                  anomalies.push({
                    dimensionId,
                    theirScore: respondent.dimensionScores[dimensionId],
                    groupAverage: parseFloat(dimMean.toFixed(1)),
                    deviation: parseFloat((respondent.dimensionScores[dimensionId] - dimMean).toFixed(1)),
                    zScore: parseFloat(dimZScore.toFixed(2))
                  });
                }
              }
            }
          });

          if (anomalies.length > 0) {
            outliers.push({
              respondentId: respondent.respondentId,
              name: respondent.name,
              stakeholderGroup: stakeholder,
              overallScore: respondent.overallScore,
              groupAverage: parseFloat(groupMean.toFixed(1)),
              deviation: parseFloat((respondent.overallScore - groupMean).toFixed(1)),
              percentile,
              type,
              anomalies,
              likelyReason: this.guesOutlierReason(type, anomalies.length),
              recommendation: isHighOutlier ? 'MENTOR_OTHER_RESPONDENTS' : 'INDIVIDUAL_COACHING_NEEDED'
            });
          }
        }
      });
    });

    return outliers;
  }

  /**
   * Guess reason for outlier behavior
   */
  private static guesOutlierReason(type: string, anomalyCount: number): string {
    if (type === 'HIGH_OUTLIER') {
      if (anomalyCount >= 5) return 'EXCEPTIONAL_PERFORMER_OR_BIAS';
      return 'OPTIMISTIC_PERSPECTIVE';
    } else {
      if (anomalyCount >= 5) return 'SYSTEMIC_CONCERNS';
      return 'ISOLATED_DISSATISFACTION';
    }
  }

  /**
   * Determine consensus level from std dev
   */
  private static determineConsensusLevel(stdDev: number): ConsensusLevel {
    if (stdDev < 0.5) return 'HIGH';
    if (stdDev < 1.0) return 'GOOD';
    if (stdDev < 1.5) return 'MODERATE';
    if (stdDev < 2.0) return 'LOW';
    return 'HIGH_CONFLICT';
  }

  /**
   * Calculate mean
   */
  static calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b) / values.length;
  }

  /**
   * Calculate median
   */
  static calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Calculate standard deviation
   */
  static calculateStdDev(values: number[], mean: number): number {
    if (values.length < 2) return 0;
    const squareDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b) / values.length;
    return Math.sqrt(avgSquareDiff);
  }

  /**
   * Calculate percentile
   */
  static calculatePercentile(value: number, values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const lesserCount = sorted.filter(v => v <= value).length;
    return Math.round((lesserCount / sorted.length) * 100);
  }
}

export default MultiRespondentAnalytics;

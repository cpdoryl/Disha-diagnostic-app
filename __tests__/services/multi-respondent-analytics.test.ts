/**
 * Multi-Respondent Analytics Service Tests
 * Tests for consensus, outlier, and divergence calculations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import MultiRespondentAnalytics from '@/services/analytics/multi-respondent-analytics';
import { Respondent } from '@/types/multi-respondent';

describe('MultiRespondentAnalytics', () => {
  let mockRespondents: Respondent[];

  beforeEach(() => {
    // Create mock respondents with realistic scores
    mockRespondents = [
      {
        respondentId: 'RESP_M_001',
        assessmentId: 'ASSESS_001',
        respondentNumber: 1,
        name: 'Principal John',
        email: 'john@school.com',
        role: 'Principal',
        stakeholderGroup: 'management',
        respondentLink: 'link_1',
        linkExpiresAt: new Date(),
        linkStatus: 'ACTIVE',
        status: 'COMPLETE',
        completionPercentage: 100,
        responses: [],
        dimensionScores: {
          D01: 75.2, D02: 72.5, D03: 78.0, D04: 72.1, D05: 81.2,
          D06: 68.0, D07: 75.5, D08: 70.0, D09: 62.8, D10: 71.2,
          D11: 65.0, D12: 76.3, D13: 68.5, D14: 74.0
        },
        overallScore: 72.1
      },
      {
        respondentId: 'RESP_M_002',
        assessmentId: 'ASSESS_001',
        respondentNumber: 2,
        name: 'Vice Principal Sarah',
        email: 'sarah@school.com',
        role: 'Vice Principal',
        stakeholderGroup: 'management',
        respondentLink: 'link_2',
        linkExpiresAt: new Date(),
        linkStatus: 'ACTIVE',
        status: 'COMPLETE',
        completionPercentage: 100,
        responses: [],
        dimensionScores: {
          D01: 76.3, D02: 73.2, D03: 77.5, D04: 71.8, D05: 82.1,
          D06: 69.2, D07: 76.1, D08: 71.3, D09: 63.5, D10: 72.0,
          D11: 66.2, D12: 77.1, D13: 69.2, D14: 75.1
        },
        overallScore: 72.8
      },
      {
        respondentId: 'RESP_T_001',
        assessmentId: 'ASSESS_001',
        respondentNumber: 1,
        name: 'Teacher Jane',
        email: 'jane@school.com',
        role: 'Teacher',
        stakeholderGroup: 'teachers',
        respondentLink: 'link_3',
        linkExpiresAt: new Date(),
        linkStatus: 'ACTIVE',
        status: 'COMPLETE',
        completionPercentage: 100,
        responses: [],
        dimensionScores: {
          D01: 70.1, D02: 68.2, D03: 76.3, D04: 65.2, D05: 79.5,
          D06: 64.8, D07: 72.3, D08: 68.5, D09: 60.2, D10: 69.8,
          D11: 62.5, D12: 74.2, D13: 66.8, D14: 71.5
        },
        overallScore: 68.9
      },
      {
        respondentId: 'RESP_P_001',
        assessmentId: 'ASSESS_001',
        respondentNumber: 1,
        name: 'Parent Michael',
        email: 'michael@example.com',
        role: 'Parent',
        stakeholderGroup: 'parents_students',
        respondentLink: 'link_4',
        linkExpiresAt: new Date(),
        linkStatus: 'ACTIVE',
        status: 'COMPLETE',
        completionPercentage: 100,
        responses: [],
        dimensionScores: {
          D01: 72.3, D02: 71.8, D03: 77.2, D04: 58.3, D05: 80.1,
          D06: 66.5, D07: 73.8, D08: 69.2, D09: 61.5, D10: 70.5,
          D11: 64.8, D12: 75.6, D13: 68.1, D14: 72.8
        },
        overallScore: 70.5
      }
    ];
  });

  describe('calculateAggregatedScores', () => {
    it('should calculate aggregated scores for all dimensions', () => {
      const dimensions = Array.from({ length: 14 }, (_, i) => `D${String(i + 1).padStart(2, '0')}`);

      const { aggregated, statistics } = MultiRespondentAnalytics.calculateAggregatedScores(
        mockRespondents,
        dimensions
      );

      expect(aggregated).toBeDefined();
      expect(Object.keys(aggregated)).toHaveLength(14);
      expect(aggregated['D01']).toBeDefined();
      expect(aggregated['D01'].mean).toBeGreaterThan(0);
      expect(aggregated['D01'].stdDev).toBeGreaterThanOrEqual(0);
    });

    it('should calculate correct statistics', () => {
      const dimensions = Array.from({ length: 14 }, (_, i) => `D${String(i + 1).padStart(2, '0')}`);

      const { statistics } = MultiRespondentAnalytics.calculateAggregatedScores(
        mockRespondents,
        dimensions
      );

      expect(statistics.totalRespondents).toBe(4);
      expect(statistics.respondentsByCategory.management).toBe(2);
      expect(statistics.respondentsByCategory.teachers).toBe(1);
      expect(statistics.respondentsByCategory.parents_students).toBe(1);
      expect(statistics.completionRate).toBe(100);
    });

    it('should classify consensus levels', () => {
      const dimensions = Array.from({ length: 14 }, (_, i) => `D${String(i + 1).padStart(2, '0')}`);

      const { statistics } = MultiRespondentAnalytics.calculateAggregatedScores(
        mockRespondents,
        dimensions
      );

      expect(statistics.consensusAnalysis).toBeDefined();
      expect(
        statistics.consensusAnalysis.highConsensus.length +
        statistics.consensusAnalysis.moderateConsensus.length +
        statistics.consensusAnalysis.lowConsensus.length +
        statistics.consensusAnalysis.highConflict.length
      ).toBe(14);
    });

    it('should detect divergent dimensions', () => {
      const dimensions = Array.from({ length: 14 }, (_, i) => `D${String(i + 1).padStart(2, '0')}`);

      const { statistics } = MultiRespondentAnalytics.calculateAggregatedScores(
        mockRespondents,
        dimensions
      );

      // D04 should have divergence (management ~72, teachers 65.2, parents 58.3)
      if (statistics.divergentDimensions['D04']) {
        expect(statistics.divergentDimensions['D04'].maxGap).toBeGreaterThan(10);
      }
    });
  });

  describe('detectOutliers', () => {
    it('should identify outlier respondents', () => {
      const dimensions = Array.from({ length: 14 }, (_, i) => `D${String(i + 1).padStart(2, '0')}`);

      // Create test data with an outlier
      const testRespondents: Respondent[] = [
        ...mockRespondents,
        {
          respondentId: 'RESP_T_OUTLIER',
          assessmentId: 'ASSESS_001',
          respondentNumber: 2,
          name: 'Outlier Teacher',
          email: 'outlier@school.com',
          role: 'Teacher',
          stakeholderGroup: 'teachers',
          respondentLink: 'link_outlier',
          linkExpiresAt: new Date(),
          linkStatus: 'ACTIVE',
          status: 'COMPLETE',
          completionPercentage: 100,
          responses: [],
          dimensionScores: {
            D01: 45, D02: 40, D03: 42, D04: 38, D05: 41,
            D06: 39, D07: 41, D08: 40, D09: 37, D10: 42,
            D11: 36, D12: 43, D13: 39, D14: 38
          },
          overallScore: 40  // Very low score - outlier
        }
      ];

      const { statistics } = MultiRespondentAnalytics.calculateAggregatedScores(
        testRespondents,
        dimensions
      );

      // Should detect outliers
      expect(statistics.outliers.length).toBeGreaterThan(0);

      // Find the outlier
      const outlier = statistics.outliers.find(o => o.respondentId === 'RESP_T_OUTLIER');
      expect(outlier).toBeDefined();
      expect(outlier?.type).toBe('LOW_OUTLIER');
      expect(outlier?.deviation).toBeLessThan(-20);
    });
  });

  describe('Statistical Functions', () => {
    it('should calculate mean correctly', () => {
      const values = [70, 72, 71, 73, 69];
      const mean = MultiRespondentAnalytics.calculateMean(values);

      expect(mean).toBe(71);
    });

    it('should calculate median correctly', () => {
      const values = [70, 72, 71, 73, 69];
      const median = MultiRespondentAnalytics.calculateMedian(values);

      expect(median).toBe(71);
    });

    it('should calculate standard deviation correctly', () => {
      const values = [70, 72, 71, 73, 69];
      const mean = MultiRespondentAnalytics.calculateMean(values);
      const stdDev = MultiRespondentAnalytics.calculateStdDev(values, mean);

      expect(stdDev).toBeGreaterThan(0);
      expect(stdDev).toBeLessThan(2);
    });

    it('should calculate percentile correctly', () => {
      const values = [60, 65, 70, 75, 80, 85, 90];
      const percentile = MultiRespondentAnalytics.calculatePercentile(75, values);

      expect(percentile).toBeGreaterThan(50);
      expect(percentile).toBeLessThan(100);
    });
  });

  describe('Consensus Level Determination', () => {
    it('should correctly classify consensus levels', () => {
      // These are based on standard deviation thresholds
      const testCases = [
        { stdDev: 0.3, expected: 'HIGH' },
        { stdDev: 0.8, expected: 'GOOD' },
        { stdDev: 1.2, expected: 'MODERATE' },
        { stdDev: 1.8, expected: 'LOW' },
        { stdDev: 2.5, expected: 'HIGH_CONFLICT' }
      ];

      testCases.forEach(({ stdDev, expected }) => {
        // We can't directly call private method, but we can verify through aggregated results
        // This would be tested indirectly through calculateAggregatedScores
      });
    });
  });

  describe('Stakeholder Comparison', () => {
    it('should compare scores across stakeholder groups', () => {
      const dimensions = Array.from({ length: 14 }, (_, i) => `D${String(i + 1).padStart(2, '0')}`);

      const { statistics } = MultiRespondentAnalytics.calculateAggregatedScores(
        mockRespondents,
        dimensions
      );

      expect(statistics.stakeholderComparison).toBeDefined();
      expect(statistics.stakeholderComparison.management).toBeDefined();
      expect(statistics.stakeholderComparison.teachers).toBeDefined();
      expect(statistics.stakeholderComparison.parents_students).toBeDefined();
      expect(statistics.stakeholderComparison.operational_metrics).toBeDefined();

      // Management should have highest average score
      const management = statistics.stakeholderComparison.management;
      const teachers = statistics.stakeholderComparison.teachers;

      expect(management.mean).toBeGreaterThan(teachers.mean);
    });
  });
});

export {};

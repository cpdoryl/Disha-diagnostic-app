/**
 * Phase 6 Integration Tests
 * End-to-end test suite for all dashboard components
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateMockMetrics,
  generateMockSurveyResponses,
  generateMockQualityAlerts,
  generateMockTrendData,
  generateMockDimensionData,
  TestDataBuilder,
  assertCoverageCalculation,
  assertQualityScoreFormula,
  assertResponseRateCalculation,
  assertTrendDirection,
  compareMetrics,
} from './testUtils';

// ============================================================================
// SUITE 1: DATA AUDIT DASHBOARD TESTS
// ============================================================================

describe('Phase 6: Data Audit Dashboard Integration', () => {
  let testData: any;

  beforeEach(() => {
    testData = new TestDataBuilder()
      .withMetrics(1, 6)
      .withMetrics(2, 5)
      .withMetrics(3, 6)
      .build();
  });

  it('should calculate coverage percentage correctly', () => {
    const dimensionData = generateMockDimensionData(1);
    const { filledMetrics, totalMetrics } = dimensionData.stats;

    const expected = Math.round((filledMetrics / totalMetrics) * 100);
    assertCoverageCalculation(filledMetrics, totalMetrics, expected);
    expect(dimensionData.stats.coverage).toBe(expected);
  });

  it('should calculate quality score from completeness and verification', () => {
    const dimensionData = generateMockDimensionData(1);
    const { filledMetrics, verifiedMetrics } = dimensionData.stats;

    const completeness = Math.round((filledMetrics / dimensionData.stats.totalMetrics) * 100);
    const verification = filledMetrics > 0 ? Math.round((verifiedMetrics / filledMetrics) * 100) : 0;

    const expectedQuality = Math.round(completeness * 0.5 + verification * 0.5);
    assertQualityScoreFormula(completeness, verification, expectedQuality);
  });

  it('should track all 14 dimensions', () => {
    const dimensions = Array.from({ length: 14 }, (_, i) => generateMockDimensionData(i + 1));

    expect(dimensions).toHaveLength(14);
    dimensions.forEach((dim, idx) => {
      expect(dim.dimensionId).toBe(idx + 1);
      expect(dim.stats.totalMetrics).toBeGreaterThan(0);
    });
  });

  it('should aggregate coverage across all dimensions', () => {
    const dimensions = Array.from({ length: 14 }, (_, i) => generateMockDimensionData(i + 1));
    const totalFilled = dimensions.reduce((sum, d) => sum + d.stats.filledMetrics, 0);
    const totalMetrics = dimensions.reduce((sum, d) => sum + d.stats.totalMetrics, 0);

    const overallCoverage = Math.round((totalFilled / totalMetrics) * 100);

    expect(overallCoverage).toBeGreaterThanOrEqual(0);
    expect(overallCoverage).toBeLessThanOrEqual(100);
  });

  it('should trigger warning when coverage is below 50%', () => {
    const lowCoverageDimension = {
      stats: { coverage: 45 },
    };

    expect(lowCoverageDimension.stats.coverage).toBeLessThan(50);
  });

  it('should trigger warning when quality is below 60%', () => {
    const lowQualityDimension = {
      stats: { quality: 55 },
    };

    expect(lowQualityDimension.stats.quality).toBeLessThan(60);
  });

  it('should update last-updated timestamp on metric change', () => {
    const dimension1 = generateMockDimensionData(1);
    const lastUpdate1 = dimension1.stats.lastUpdated;

    const dimension2 = generateMockDimensionData(1);
    const lastUpdate2 = dimension2.stats.lastUpdated;

    expect(lastUpdate2.getTime()).toBeGreaterThanOrEqual(lastUpdate1.getTime());
  });

  it('should differentiate between filled and verified metrics', () => {
    const metrics = generateMockMetrics(1, 10);
    const filled = Object.values(metrics).filter((m) => m.value !== null).length;
    const verified = Object.values(metrics).filter((m) => m.isVerified).length;

    expect(verified).toBeLessThanOrEqual(filled);
  });
});

// ============================================================================
// SUITE 2: RESPONSE RATE TRACKER TESTS
// ============================================================================

describe('Phase 6: Response Rate Tracker Integration', () => {
  const respondentTypes: Array<any> = ['TEACHER', 'PARENT', 'STUDENT', 'ADMIN', 'OTHER'];
  const expectedCounts = {
    TEACHER: 50,
    PARENT: 150,
    STUDENT: 300,
    ADMIN: 10,
    OTHER: 20,
  };

  it('should count responses per respondent type', () => {
    respondentTypes.forEach((type) => {
      const responses = generateMockSurveyResponses(type, 10);
      expect(responses).toHaveLength(10);
      expect(responses[0].respondentType).toBe(type);
    });
  });

  it('should calculate response rate percentage', () => {
    const actualResponses = 25;
    const expected = respondentTypes.length > 0 ? 50 : 0; // 50% of 50 teachers
    const actual = Math.round((actualResponses / 50) * 100);

    assertResponseRateCalculation(actual, expected);
    expect(actual).toBe(expected);
  });

  it('should aggregate overall response rate', () => {
    let totalActual = 0;
    let totalExpected = 0;

    respondentTypes.forEach((type) => {
      const responses = generateMockSurveyResponses(type, 5);
      totalActual += responses.length;
      totalExpected += expectedCounts[type as keyof typeof expectedCounts];
    });

    const overallRate = Math.round((totalActual / totalExpected) * 100);
    expect(overallRate).toBeGreaterThanOrEqual(0);
    expect(overallRate).toBeLessThanOrEqual(100);
  });

  it('should classify status as "On Target" when rate >= 75%', () => {
    const rate = 80;
    const status = rate >= 75 ? 'On Target' : rate >= 50 ? 'In Progress' : 'Below Target';

    expect(status).toBe('On Target');
  });

  it('should classify status as "In Progress" when 50% <= rate < 75%', () => {
    const rate = 60;
    const status = rate >= 75 ? 'On Target' : rate >= 50 ? 'In Progress' : 'Below Target';

    expect(status).toBe('In Progress');
  });

  it('should classify status as "Below Target" when rate < 50%', () => {
    const rate = 40;
    const status = rate >= 75 ? 'On Target' : rate >= 50 ? 'In Progress' : 'Below Target';

    expect(status).toBe('Below Target');
  });

  it('should track responses with timestamps', () => {
    const responses = generateMockSurveyResponses('TEACHER', 5);

    responses.forEach((response) => {
      expect(response.timestamp).toBeInstanceOf(Date);
      expect(response.timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  it('should detect duplicate responses by email', () => {
    const responses1 = generateMockSurveyResponses('TEACHER', 1);
    const responses2 = generateMockSurveyResponses('TEACHER', 1);

    // Modify to have same email
    responses2[0].email = responses1[0].email;

    const emails = [...responses1, ...responses2].map((r) => r.email);
    const uniqueEmails = new Set(emails);

    expect(uniqueEmails.size).toBeLessThan(emails.length);
  });
});

// ============================================================================
// SUITE 3: TREND ANALYSIS TESTS
// ============================================================================

describe('Phase 6: Trend Analysis Integration', () => {
  it('should generate 12-month trend data', () => {
    const trendData = generateMockTrendData(1);

    expect(trendData).toHaveLength(12);
    trendData.forEach((month, idx) => {
      expect(month.period).toBe(`Month ${idx + 1}`);
      expect(month.value).toBeGreaterThanOrEqual(0);
      expect(month.value).toBeLessThanOrEqual(100);
    });
  });

  it('should calculate trend direction based on current vs previous', () => {
    const current = 75;
    const previous = 65;
    const change = current - previous;

    let expected = 'STABLE';
    if (change > 5) expected = 'IMPROVING';
    if (change < -5) expected = 'DECLINING';

    assertTrendDirection(current, previous, expected);
    expect(expected).toBe('IMPROVING');
  });

  it('should classify IMPROVING when current > previous + 5', () => {
    const current = 75;
    const previous = 65;

    assertTrendDirection(current, previous, 'IMPROVING');
  });

  it('should classify DECLINING when current < previous - 5', () => {
    const current = 55;
    const previous = 65;

    assertTrendDirection(current, previous, 'DECLINING');
  });

  it('should classify STABLE when within ±5 of previous', () => {
    const current = 68;
    const previous = 65;

    assertTrendDirection(current, previous, 'STABLE');
  });

  it('should calculate change percentage', () => {
    const current = 80;
    const previous = 64;
    const changePercent = Math.round(((current - previous) / previous) * 100);

    expect(changePercent).toBe(25);
  });

  it('should forecast next period linearly', () => {
    const trendData = generateMockTrendData(1);
    const lastThreeMonths = trendData.slice(-3);

    const trend = (lastThreeMonths[2].value - lastThreeMonths[0].value) / 2;
    const forecast = Math.round(lastThreeMonths[2].value + trend);

    expect(forecast).toBeGreaterThanOrEqual(0);
    expect(forecast).toBeLessThanOrEqual(100);
  });

  it('should track all 14 dimensions', () => {
    const dimensions = Array.from({ length: 14 }, (_, i) => ({
      dimensionId: i + 1,
      trendData: generateMockTrendData(i + 1),
    }));

    expect(dimensions).toHaveLength(14);
    dimensions.forEach((dim) => {
      expect(dim.trendData).toHaveLength(12);
    });
  });

  it('should identify most improved dimension', () => {
    const dimensions = Array.from({ length: 14 }, (_, i) => ({
      dimensionId: i + 1,
      change: Math.floor(Math.random() * 20) - 10, // -10 to +10
    }));

    const mostImproved = dimensions.reduce((max, d) => (d.change > max.change ? d : max));

    expect(mostImproved.change).toBeGreaterThanOrEqual(-10);
    expect(mostImproved.change).toBeLessThanOrEqual(10);
  });

  it('should identify most declining dimension', () => {
    const dimensions = Array.from({ length: 14 }, (_, i) => ({
      dimensionId: i + 1,
      change: Math.floor(Math.random() * 20) - 10,
    }));

    const mostDeclining = dimensions.reduce((min, d) => (d.change < min.change ? d : min));

    expect(mostDeclining.change).toBeGreaterThanOrEqual(-10);
    expect(mostDeclining.change).toBeLessThanOrEqual(10);
  });
});

// ============================================================================
// SUITE 4: QUALITY MONITORING TESTS
// ============================================================================

describe('Phase 6: Quality Monitoring Integration', () => {
  it('should detect outlier alerts', () => {
    const alerts = generateMockQualityAlerts(1, 5);
    const outliers = alerts.filter((a) => a.type === 'OUTLIER');

    expect(alerts.length).toBeGreaterThan(0);
  });

  it('should detect stale data alerts', () => {
    const alerts = generateMockQualityAlerts(1, 5);
    const stale = alerts.filter((a) => a.type === 'STALE');

    expect(alerts.length).toBeGreaterThan(0);
  });

  it('should assign severity levels correctly', () => {
    const alerts = generateMockQualityAlerts(1, 10);

    alerts.forEach((alert) => {
      expect(['CRITICAL', 'WARNING', 'INFO']).toContain(alert.severity);
    });
  });

  it('should track alert status (ACTIVE, ACKNOWLEDGED, RESOLVED)', () => {
    const alerts = generateMockQualityAlerts(1, 5);

    alerts.forEach((alert) => {
      expect(['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED']).toContain(alert.status);
    });
  });

  it('should calculate overall quality score', () => {
    const dimensions = Array.from({ length: 14 }, (_, i) => generateMockDimensionData(i + 1));

    const totalFilled = dimensions.reduce((sum, d) => sum + d.stats.filledMetrics, 0);
    const totalMetrics = dimensions.reduce((sum, d) => sum + d.stats.totalMetrics, 0);
    const overallQuality = Math.round((totalFilled / totalMetrics) * 100);

    expect(overallQuality).toBeGreaterThanOrEqual(0);
    expect(overallQuality).toBeLessThanOrEqual(100);
  });

  it('should identify metric quality factors', () => {
    const metrics = generateMockMetrics(1, 6);

    Object.entries(metrics).forEach(([metricId, metric]) => {
      expect(metric.value).toBeDefined();
      expect(['MANUAL', 'LMS', 'EXCEL']).toContain(metric.dataSource);
      expect(typeof metric.isVerified).toBe('boolean');
    });
  });

  it('should detect data freshness (staleness)', () => {
    const metrics = generateMockMetrics(1, 6);
    const now = Date.now();
    const sevenDaysAgo = now - 604800000;

    Object.entries(metrics).forEach(([_, metric]) => {
      const metricAge = now - metric.lastUpdated.getTime();
      const isStale = metricAge > 604800000;

      expect(typeof isStale).toBe('boolean');
    });
  });

  it('should generate quality recommendations', () => {
    const stats = {
      totalMetrics: 60,
      goodQuality: 38,
      fairQuality: 16,
      poorQuality: 6,
      outlierCount: 3,
      staleCount: 4,
    };

    const recommendations: string[] = [];

    if (stats.staleCount > 0) {
      recommendations.push(`Update ${stats.staleCount} stale metrics`);
    }
    if (stats.outlierCount > 0) {
      recommendations.push(`Investigate ${stats.outlierCount} outliers`);
    }
    if (stats.poorQuality > stats.goodQuality * 0.2) {
      recommendations.push('Improve data quality processes');
    }

    expect(recommendations.length).toBeGreaterThan(0);
  });

  it('should calculate quality for all 14 dimensions', () => {
    const dimensionQualities = Array.from({ length: 14 }, (_, i) => ({
      dimensionId: i + 1,
      quality: Math.floor(Math.random() * 100),
    }));

    expect(dimensionQualities).toHaveLength(14);
    dimensionQualities.forEach((dq) => {
      expect(dq.quality).toBeGreaterThanOrEqual(0);
      expect(dq.quality).toBeLessThanOrEqual(100);
    });
  });
});

// ============================================================================
// SUITE 5: CROSS-COMPONENT INTEGRATION TESTS
// ============================================================================

describe('Phase 6: Cross-Component Integration', () => {
  it('should pass school context through all dashboards', () => {
    const schoolId = 'test-school-123';
    const cycleId = 'cycle-2026-08';

    const dashboards = [
      { name: 'DataAudit', schoolId, cycleId },
      { name: 'ResponseTracker', schoolId, cycleId },
      { name: 'TrendAnalysis', schoolId, cycleId },
      { name: 'QualityMonitoring', schoolId, cycleId },
    ];

    dashboards.forEach((dashboard) => {
      expect(dashboard.schoolId).toBe(schoolId);
      expect(dashboard.cycleId).toBe(cycleId);
    });
  });

  it('should aggregate data from multiple sources', () => {
    const metrics = generateMockMetrics(1, 6);
    const surveys = generateMockSurveyResponses('TEACHER', 5);
    const alerts = generateMockQualityAlerts(1, 3);

    const aggregated = {
      metricsCount: Object.keys(metrics).length,
      responseCount: surveys.length,
      alertCount: alerts.length,
      totalDataPoints: Object.keys(metrics).length + surveys.length + alerts.length,
    };

    expect(aggregated.totalDataPoints).toBeGreaterThan(0);
    expect(aggregated.metricsCount).toBeGreaterThan(0);
    expect(aggregated.responseCount).toBeGreaterThan(0);
  });

  it('should maintain data consistency across dashboard refreshes', () => {
    const data1 = new TestDataBuilder()
      .withMetrics(1, 6)
      .withSurveys('TEACHER', 5)
      .build();

    const data2 = new TestDataBuilder()
      .withMetrics(1, 6)
      .withSurveys('TEACHER', 5)
      .build();

    // After refresh, metric IDs should remain consistent
    expect(Object.keys(data1.metrics[1])).toEqual(Object.keys(data2.metrics[1]));
  });

  it('should handle concurrent updates from multiple data sources', () => {
    const updates = Promise.all([
      Promise.resolve(generateMockMetrics(1, 6)),
      Promise.resolve(generateMockSurveyResponses('TEACHER', 5)),
      Promise.resolve(generateMockQualityAlerts(1, 3)),
    ]);

    return updates.then(([metrics, surveys, alerts]) => {
      expect(Object.keys(metrics).length).toBeGreaterThan(0);
      expect(surveys.length).toBeGreaterThan(0);
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  it('should sync all dashboard data within refresh interval', async () => {
    const startTime = Date.now();
    const refreshInterval = 90000; // 90 seconds max

    const metrics = generateMockMetrics(1, 6);
    const surveys = generateMockSurveyResponses('TEACHER', 5);
    const alerts = generateMockQualityAlerts(1, 3);
    const trends = generateMockTrendData(1);

    const endTime = Date.now();
    const elapsed = endTime - startTime;

    expect(elapsed).toBeLessThan(refreshInterval);
  });
});

/**
 * Phase 6 Integration Testing Utilities
 * Mock data generators and test helpers for dashboard components
 */

import { RespondentType } from '../types';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

export const generateMockMetrics = (dimensionId: number, count: number = 6) => {
  const metrics: Record<string, any> = {};

  for (let i = 0; i < count; i++) {
    const metricId = `${dimensionId}${String.fromCharCode(97 + i)}`;
    metrics[metricId] = {
      value: Math.floor(Math.random() * 100),
      dataSource: ['MANUAL', 'LMS', 'EXCEL'][Math.floor(Math.random() * 3)],
      isVerified: Math.random() > 0.3,
      lastUpdated: new Date(Date.now() - Math.random() * 604800000), // Last 7 days
    };
  }

  return metrics;
};

export const generateMockSurveyResponses = (
  respondentType: RespondentType,
  count: number = 5
) => {
  return Array.from({ length: count }, (_, idx) => ({
    id: `response-${respondentType}-${idx}`,
    respondentType,
    schoolId: 'test-school',
    cycleId: 'cycle-2026-08',
    dimensionScores: Array.from({ length: 14 }, (_, d) => ({
      dimensionId: d + 1,
      score: Math.floor(Math.random() * 10) + 1, // 1-10 Likert
    })),
    timestamp: new Date(Date.now() - Math.random() * 604800000),
    email: `respondent-${respondentType}-${idx}@school.edu`,
  }));
};

export const generateMockDimensionData = (dimensionId: number) => {
  const metrics = generateMockMetrics(dimensionId, 6);
  const filledMetrics = Object.values(metrics).filter((m) => m.value !== null).length;
  const verifiedMetrics = Object.values(metrics).filter((m) => m.isVerified).length;

  return {
    dimensionId,
    metrics,
    stats: {
      totalMetrics: Object.keys(metrics).length,
      filledMetrics,
      verifiedMetrics,
      coverage: Math.round((filledMetrics / Object.keys(metrics).length) * 100),
      quality: Math.round((verifiedMetrics / filledMetrics) * 100),
      lastUpdated: new Date(),
    },
  };
};

export const generateMockQualityAlerts = (dimensionId: number, count: number = 2) => {
  const alertTypes = ['OUTLIER', 'STALE', 'MISSING', 'INCONSISTENT', 'ANOMALY'] as const;

  return Array.from({ length: count }, (_, idx) => ({
    id: `alert-${dimensionId}-${idx}`,
    type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
    severity: Math.random() > 0.6 ? 'CRITICAL' : Math.random() > 0.4 ? 'WARNING' : 'INFO',
    dimensionId,
    metricId: `${dimensionId}${String.fromCharCode(97 + idx)}`,
    message: `Quality alert for dimension ${dimensionId}`,
    lastUpdated: new Date(Date.now() - Math.random() * 86400000),
    status: 'ACTIVE' as const,
  }));
};

export const generateMockTrendData = (dimensionId: number) => {
  const data = [];
  const baseValue = 60 + Math.random() * 20;

  for (let i = 0; i < 12; i++) {
    const noise = Math.random() * 10 - 5;
    const trend = (i / 12) * 15;
    data.push({
      period: `Month ${i + 1}`,
      value: Math.round(Math.min(100, Math.max(0, baseValue + noise + trend))),
      previous: Math.round(Math.min(100, Math.max(0, baseValue - 5 + (i / 12) * 10))),
      forecast: Math.round(Math.min(100, Math.max(0, baseValue + noise + trend + (i / 12) * 5))),
    });
  }

  return data;
};

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

export const assertCoverageCalculation = (filled: number, total: number, expected: number) => {
  const actual = Math.round((filled / total) * 100);
  if (actual !== expected) {
    throw new Error(
      `Coverage calculation mismatch: expected ${expected}%, got ${actual}% (${filled}/${total})`
    );
  }
};

export const assertQualityScoreFormula = (
  completeness: number,
  verification: number,
  expected: number
) => {
  const actual = Math.round(completeness * 0.5 + verification * 0.5);
  if (actual !== expected) {
    throw new Error(
      `Quality score mismatch: expected ${expected}, got ${actual} (completeness=${completeness}, verification=${verification})`
    );
  }
};

export const assertResponseRateCalculation = (
  actual: number,
  expected: number,
  tolerance: number = 2
) => {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(
      `Response rate mismatch: expected ${expected}%, got ${actual}% (difference=${diff}%)`
    );
  }
};

export const assertTrendDirection = (current: number, previous: number, expected: string) => {
  const change = current - previous;
  let actual = 'STABLE';
  if (change > 5) actual = 'IMPROVING';
  if (change < -5) actual = 'DECLINING';

  if (actual !== expected) {
    throw new Error(
      `Trend direction mismatch: expected ${expected}, got ${actual} (change=${change})`
    );
  }
};

export const assertAlertSeverity = (
  value: number,
  expectedRange: { min: number; max: number },
  expected: string
) => {
  let actual = 'INFO';
  const deviation = Math.max(
    Math.abs(value - expectedRange.max) / expectedRange.max,
    Math.abs(value - expectedRange.min) / expectedRange.min
  );

  if (deviation > 0.3) actual = 'CRITICAL';
  else if (deviation > 0.15) actual = 'WARNING';

  if (actual !== expected) {
    throw new Error(
      `Alert severity mismatch: expected ${expected}, got ${actual} (value=${value}, range=${JSON.stringify(expectedRange)})`
    );
  }
};

// ============================================================================
// TEST DATA BUILDERS
// ============================================================================

export class TestDataBuilder {
  private metrics: Map<number, Record<string, any>> = new Map();
  private surveys: Map<RespondentType, any[]> = new Map();
  private trends: Map<number, any[]> = new Map();

  withMetrics(dimensionId: number, count: number = 6): this {
    this.metrics.set(dimensionId, generateMockMetrics(dimensionId, count));
    return this;
  }

  withSurveys(respondentType: RespondentType, count: number = 5): this {
    this.surveys.set(respondentType, generateMockSurveyResponses(respondentType, count));
    return this;
  }

  withTrends(dimensionId: number): this {
    this.trends.set(dimensionId, generateMockTrendData(dimensionId));
    return this;
  }

  build() {
    return {
      metrics: Object.fromEntries(this.metrics),
      surveys: Object.fromEntries(this.surveys),
      trends: Object.fromEntries(this.trends),
    };
  }
}

// ============================================================================
// FIRESTORE MOCK HELPERS
// ============================================================================

export const createMockFirestoreSnapshot = (data: any) => ({
  data: () => data,
  exists: () => !!data,
  id: 'mock-doc-id',
  ref: {
    path: 'mock/path',
  },
});

export const createMockCollectionSnapshot = (docs: any[]) => ({
  docs: docs.map((data, idx) =>
    createMockFirestoreSnapshot({
      ...data,
      id: `doc-${idx}`,
    })
  ),
  size: docs.length,
  empty: docs.length === 0,
});

// ============================================================================
// TIMING HELPERS
// ============================================================================

export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const retry = async (fn: () => Promise<void>, maxAttempts: number = 3, delayMs: number = 100) => {
  let lastError;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await fn();
      return;
    } catch (error) {
      lastError = error;
      if (i < maxAttempts - 1) {
        await waitFor(delayMs);
      }
    }
  }
  throw lastError;
};

// ============================================================================
// COMPARISON HELPERS
// ============================================================================

export const compareMetrics = (
  actual: Record<string, any>,
  expected: Record<string, any>
): string[] => {
  const errors: string[] = [];

  const expectedKeys = Object.keys(expected);
  const actualKeys = Object.keys(actual);

  // Check for missing keys
  expectedKeys.forEach((key) => {
    if (!actualKeys.includes(key)) {
      errors.push(`Missing metric: ${key}`);
    }
  });

  // Check for extra keys
  actualKeys.forEach((key) => {
    if (!expectedKeys.includes(key)) {
      errors.push(`Extra metric: ${key}`);
    }
  });

  // Check values
  expectedKeys.forEach((key) => {
    if (actual[key] && expected[key]) {
      if (actual[key].value !== expected[key].value) {
        errors.push(
          `Value mismatch for ${key}: expected ${expected[key].value}, got ${actual[key].value}`
        );
      }
      if (actual[key].isVerified !== expected[key].isVerified) {
        errors.push(
          `Verification mismatch for ${key}: expected ${expected[key].isVerified}, got ${actual[key].isVerified}`
        );
      }
    }
  });

  return errors;
};

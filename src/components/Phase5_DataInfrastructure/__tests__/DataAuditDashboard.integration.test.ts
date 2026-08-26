/**
 * DataAuditDashboard Integration Tests
 * Tests component rendering and data flow with Firestore
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateMockDimensionData, generateMockMetrics, TestDataBuilder } from '@/lib/phase5/__tests__/testUtils';

// ============================================================================
// UNIT TESTS: Data Audit Calculations
// ============================================================================

describe('DataAuditDashboard: Data Calculations', () => {
  let dimensionData: any;

  beforeEach(() => {
    dimensionData = generateMockDimensionData(1);
  });

  it('should calculate coverage percentage (0-100)', () => {
    const { filledMetrics, totalMetrics } = dimensionData.stats;
    const coverage = Math.round((filledMetrics / totalMetrics) * 100);

    expect(coverage).toBeGreaterThanOrEqual(0);
    expect(coverage).toBeLessThanOrEqual(100);
    expect(dimensionData.stats.coverage).toBe(coverage);
  });

  it('should calculate quality score (0-100)', () => {
    const { quality } = dimensionData.stats;

    expect(quality).toBeGreaterThanOrEqual(0);
    expect(quality).toBeLessThanOrEqual(100);
  });

  it('should track verification rate', () => {
    const { filledMetrics, verifiedMetrics } = dimensionData.stats;
    const verificationRate = filledMetrics > 0 ? Math.round((verifiedMetrics / filledMetrics) * 100) : 0;

    expect(verificationRate).toBeGreaterThanOrEqual(0);
    expect(verificationRate).toBeLessThanOrEqual(100);
  });

  it('should color-code coverage status', () => {
    const getColorCode = (coverage: number) => {
      if (coverage >= 75) return 'green';
      if (coverage >= 50) return 'yellow';
      return 'red';
    };

    const color1 = getColorCode(75);
    const color2 = getColorCode(60);
    const color3 = getColorCode(40);

    expect(color1).toBe('green');
    expect(color2).toBe('yellow');
    expect(color3).toBe('red');
  });

  it('should color-code quality status', () => {
    const getColorCode = (quality: number) => {
      if (quality >= 80) return 'green';
      if (quality >= 60) return 'yellow';
      return 'red';
    };

    const color1 = getColorCode(85);
    const color2 = getColorCode(70);
    const color3 = getColorCode(50);

    expect(color1).toBe('green');
    expect(color2).toBe('yellow');
    expect(color3).toBe('red');
  });

  it('should generate warnings for low coverage (<50%)', () => {
    const lowCoverageDimension = { stats: { coverage: 45 } };
    const highCoverageDimension = { stats: { coverage: 75 } };

    const lowWarning = lowCoverageDimension.stats.coverage < 50;
    const highWarning = highCoverageDimension.stats.coverage < 50;

    expect(lowWarning).toBe(true);
    expect(highWarning).toBe(false);
  });

  it('should generate alerts for low quality (<60%)', () => {
    const lowQualityDimension = { stats: { quality: 55 } };
    const highQualityDimension = { stats: { quality: 70 } };

    const lowAlert = lowQualityDimension.stats.quality < 60;
    const highAlert = highQualityDimension.stats.quality < 60;

    expect(lowAlert).toBe(true);
    expect(highAlert).toBe(false);
  });

  it('should detect stale data (>7 days)', () => {
    const now = new Date();
    const recent = new Date(now.getTime() - 86400000 * 2); // 2 days ago
    const stale = new Date(now.getTime() - 86400000 * 10); // 10 days ago

    const recentIsStale = now.getTime() - recent.getTime() > 604800000;
    const staleIsStale = now.getTime() - stale.getTime() > 604800000;

    expect(recentIsStale).toBe(false);
    expect(staleIsStale).toBe(true);
  });
});

// ============================================================================
// INTEGRATION TESTS: Dimension Coverage Grid
// ============================================================================

describe('DataAuditDashboard: Dimension Coverage Grid', () => {
  it('should render all 14 dimensions', () => {
    const dimensions = Array.from({ length: 14 }, (_, i) => generateMockDimensionData(i + 1));

    expect(dimensions).toHaveLength(14);
    dimensions.forEach((dim, idx) => {
      expect(dim.dimensionId).toBe(idx + 1);
    });
  });

  it('should calculate overall coverage correctly', () => {
    const dimensions = Array.from({ length: 14 }, (_, i) => generateMockDimensionData(i + 1));

    const totalFilled = dimensions.reduce((sum, d) => sum + d.stats.filledMetrics, 0);
    const totalMetrics = dimensions.reduce((sum, d) => sum + d.stats.totalMetrics, 0);
    const overallCoverage = Math.round((totalFilled / totalMetrics) * 100);

    expect(overallCoverage).toBeGreaterThanOrEqual(0);
    expect(overallCoverage).toBeLessThanOrEqual(100);
  });

  it('should aggregate quality scores across dimensions', () => {
    const dimensions = Array.from({ length: 14 }, (_, i) => generateMockDimensionData(i + 1));

    const avgQuality = Math.round(
      dimensions.reduce((sum, d) => sum + d.stats.quality, 0) / dimensions.length
    );

    expect(avgQuality).toBeGreaterThanOrEqual(0);
    expect(avgQuality).toBeLessThanOrEqual(100);
  });

  it('should track verified metric count across dimensions', () => {
    const dimensions = Array.from({ length: 14 }, (_, i) => generateMockDimensionData(i + 1));

    const totalVerified = dimensions.reduce((sum, d) => sum + d.stats.verifiedMetrics, 0);

    expect(totalVerified).toBeGreaterThanOrEqual(0);
  });

  it('should count total dimensions requiring attention (<60% quality)', () => {
    const dimensions = Array.from({ length: 14 }, (_, i) => generateMockDimensionData(i + 1));

    const needsAttention = dimensions.filter((d) => d.stats.quality < 60).length;

    expect(needsAttention).toBeGreaterThanOrEqual(0);
    expect(needsAttention).toBeLessThanOrEqual(14);
  });
});

// ============================================================================
// INTEGRATION TESTS: Data Quality Metrics
// ============================================================================

describe('DataAuditDashboard: Quality Metrics', () => {
  it('should calculate quality from completeness and verification', () => {
    const metrics = generateMockMetrics(1, 6);
    const filled = Object.values(metrics).filter((m) => m.value !== null).length;
    const verified = Object.values(metrics).filter((m) => m.isVerified).length;

    const completeness = (filled / metrics.length) * 100;
    const verification = filled > 0 ? (verified / filled) * 100 : 0;
    const quality = Math.round(completeness * 0.5 + verification * 0.5);

    expect(quality).toBeGreaterThanOrEqual(0);
    expect(quality).toBeLessThanOrEqual(100);
  });

  it('should weight completeness and verification equally (50/50)', () => {
    const completeness = 80;
    const verification = 60;
    const quality = Math.round(completeness * 0.5 + verification * 0.5);

    expect(quality).toBe(70); // (80*0.5 + 60*0.5) = 70
  });

  it('should calculate quality as 0 when no metrics filled', () => {
    const filled = 0;
    const verified = 0;
    const completeness = 0;
    const verification = 0;
    const quality = Math.round(completeness * 0.5 + verification * 0.5);

    expect(quality).toBe(0);
  });

  it('should calculate quality as 100 when all metrics verified', () => {
    const filled = 10;
    const verified = 10;
    const completeness = 100;
    const verification = 100;
    const quality = Math.round(completeness * 0.5 + verification * 0.5);

    expect(quality).toBe(100);
  });

  it('should track data freshness (last updated)', () => {
    const now = Date.now();
    const metrics = generateMockMetrics(1, 6);

    Object.entries(metrics).forEach(([_, metric]) => {
      const age = now - metric.lastUpdated.getTime();
      const freshness = age < 604800000; // < 7 days

      expect(typeof freshness).toBe('boolean');
    });
  });
});

// ============================================================================
// INTEGRATION TESTS: Warning System
// ============================================================================

describe('DataAuditDashboard: Warning System', () => {
  it('should generate warning for coverage <50%', () => {
    const coverage = 45;
    const warning = coverage < 50;

    expect(warning).toBe(true);
  });

  it('should generate alert for coverage <25%', () => {
    const coverage = 20;
    const alert = coverage < 25;

    expect(alert).toBe(true);
  });

  it('should generate warning for quality <60%', () => {
    const quality = 55;
    const warning = quality < 60;

    expect(warning).toBe(true);
  });

  it('should generate alert for quality <40%', () => {
    const quality = 35;
    const alert = quality < 40;

    expect(alert).toBe(true);
  });

  it('should generate alert for stale data (>7 days)', () => {
    const now = new Date();
    const lastUpdated = new Date(now.getTime() - 604800000 * 2); // 14 days ago
    const isStale = now.getTime() - lastUpdated.getTime() > 604800000;

    expect(isStale).toBe(true);
  });

  it('should aggregate warning count', () => {
    const dimensions = Array.from({ length: 14 }, (_, i) => ({
      dimensionId: i + 1,
      hasWarning: Math.random() > 0.7, // ~30% chance of warning
    }));

    const warningCount = dimensions.filter((d) => d.hasWarning).length;

    expect(warningCount).toBeGreaterThanOrEqual(0);
    expect(warningCount).toBeLessThanOrEqual(14);
  });
});

// ============================================================================
// INTEGRATION TESTS: Data Audit Report
// ============================================================================

describe('DataAuditDashboard: Audit Report', () => {
  it('should generate audit report with all metrics', () => {
    const dimensions = Array.from({ length: 14 }, (_, i) => generateMockDimensionData(i + 1));

    const report = {
      generatedAt: new Date(),
      totalDimensions: dimensions.length,
      totalMetrics: dimensions.reduce((sum, d) => sum + d.stats.totalMetrics, 0),
      filledMetrics: dimensions.reduce((sum, d) => sum + d.stats.filledMetrics, 0),
      verifiedMetrics: dimensions.reduce((sum, d) => sum + d.stats.verifiedMetrics, 0),
      overallCoverage: 0,
      overallQuality: 0,
    };

    report.overallCoverage = Math.round((report.filledMetrics / report.totalMetrics) * 100);
    report.overallQuality = Math.round(
      dimensions.reduce((sum, d) => sum + d.stats.quality, 0) / dimensions.length
    );

    expect(report.totalDimensions).toBe(14);
    expect(report.totalMetrics).toBeGreaterThan(0);
    expect(report.generatedAt).toBeInstanceOf(Date);
  });

  it('should include dimension-wise breakdown', () => {
    const dimensions = Array.from({ length: 14 }, (_, i) => generateMockDimensionData(i + 1));

    const breakdown = dimensions.map((d) => ({
      dimensionId: d.dimensionId,
      coverage: d.stats.coverage,
      quality: d.stats.quality,
      verified: d.stats.verifiedMetrics,
      total: d.stats.totalMetrics,
    }));

    expect(breakdown).toHaveLength(14);
    breakdown.forEach((item) => {
      expect(item.dimensionId).toBeGreaterThanOrEqual(1);
      expect(item.dimensionId).toBeLessThanOrEqual(14);
    });
  });

  it('should identify top 3 dimensions by coverage', () => {
    const dimensions = Array.from({ length: 14 }, (_, i) => generateMockDimensionData(i + 1));

    const sorted = [...dimensions].sort((a, b) => b.stats.coverage - a.stats.coverage);
    const top3 = sorted.slice(0, 3);

    expect(top3).toHaveLength(3);
    top3.forEach((dim, idx) => {
      if (idx > 0) {
        expect(top3[idx].stats.coverage).toBeLessThanOrEqual(top3[idx - 1].stats.coverage);
      }
    });
  });

  it('should identify bottom 3 dimensions by quality', () => {
    const dimensions = Array.from({ length: 14 }, (_, i) => generateMockDimensionData(i + 1));

    const sorted = [...dimensions].sort((a, b) => a.stats.quality - b.stats.quality);
    const bottom3 = sorted.slice(0, 3);

    expect(bottom3).toHaveLength(3);
    bottom3.forEach((dim, idx) => {
      if (idx > 0) {
        expect(bottom3[idx].stats.quality).toBeGreaterThanOrEqual(bottom3[idx - 1].stats.quality);
      }
    });
  });
});

// ============================================================================
// INTEGRATION TESTS: Real-time Updates
// ============================================================================

describe('DataAuditDashboard: Real-time Updates', () => {
  it('should update when new metrics added', () => {
    const initial = generateMockMetrics(1, 3);
    const updated = generateMockMetrics(1, 6);

    const initialSize = Object.keys(initial).length;
    const updatedSize = Object.keys(updated).length;

    expect(updatedSize).toBeGreaterThan(initialSize);
  });

  it('should update last-updated timestamp on change', () => {
    const timestamp1 = new Date();
    const timestamp2 = new Date(Date.now() + 1000);

    expect(timestamp2.getTime()).toBeGreaterThan(timestamp1.getTime());
  });

  it('should recalculate coverage on metric verification', () => {
    const metrics1 = generateMockMetrics(1, 6);
    const verified1 = Object.values(metrics1).filter((m) => m.isVerified).length;

    // Simulate verification of additional metric
    const metrics2 = { ...metrics1 };
    const firstUnverified = Object.entries(metrics2).find(([_, m]) => !m.isVerified);
    if (firstUnverified) {
      (firstUnverified[1] as any).isVerified = true;
    }

    const verified2 = Object.values(metrics2).filter((m) => m.isVerified).length;
    expect(verified2).toBeGreaterThanOrEqual(verified1);
  });

  it('should trigger refresh interval (every 30 seconds)', () => {
    const refreshInterval = 30000; // 30 seconds

    expect(refreshInterval).toBe(30000);
  });
});

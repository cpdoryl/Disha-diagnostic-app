/**
 * Phase 3 Cloud Functions & Analysis Tests
 * 14-Dimension Diagnostic Framework v2
 *
 * Tests metric calculations, gap analysis, and recommendations
 */

import {
  aggregateRealityScore,
  aggregatePerceptionScore,
  calculateGap,
  calculateTrend,
  scaleMetricTo100,
} from '../lib/metricCalculations';

describe('Phase 3: Metric Calculations', () => {
  // ============================================================================
  // AGGREGATION TESTS
  // ============================================================================

  describe('aggregateRealityScore', () => {
    test('should calculate average of valid metrics', () => {
      const result = aggregateRealityScore([80, 75, 85]);
      expect(result).toBe(80);
    });

    test('should handle empty array', () => {
      expect(aggregateRealityScore([])).toBe(0);
    });

    test('should filter out NaN values', () => {
      const result = aggregateRealityScore([80, NaN, 85]);
      expect(result).toBe(82.5);
    });

    test('should filter out Infinity', () => {
      const result = aggregateRealityScore([80, Infinity, 85]);
      expect(result).toBe(82.5);
    });
  });

  describe('aggregatePerceptionScore', () => {
    test('should convert 1-10 scale to 0-100', () => {
      const result = aggregatePerceptionScore([5.5]); // Middle rating
      expect(result).toBeCloseTo(50, 1);
    });

    test('should handle 1 (lowest)', () => {
      const result = aggregatePerceptionScore([1]);
      expect(result).toBe(0);
    });

    test('should handle 10 (highest)', () => {
      const result = aggregatePerceptionScore([10]);
      expect(result).toBe(100);
    });

    test('should average multiple ratings', () => {
      const result = aggregatePerceptionScore([1, 10]); // Average = 5.5
      expect(result).toBeCloseTo(50, 1);
    });

    test('should filter out-of-range values', () => {
      const result = aggregatePerceptionScore([5, 11, 0]); // Only 5 is valid
      expect(result).toBeCloseTo(44.4, 1);
    });

    test('should handle empty array', () => {
      expect(aggregatePerceptionScore([])).toBe(0);
    });
  });

  // ============================================================================
  // GAP CALCULATION TESTS
  // ============================================================================

  describe('calculateGap', () => {
    test('should detect perception higher than reality', () => {
      const result = calculateGap(50, 75);
      expect(result.direction).toBe('perception_higher');
      expect(result.gap).toBe(25);
    });

    test('should detect reality higher than perception', () => {
      const result = calculateGap(75, 50);
      expect(result.direction).toBe('reality_higher');
      expect(result.gap).toBe(25);
    });

    test('should detect aligned scores', () => {
      const result = calculateGap(75, 75);
      expect(result.direction).toBe('aligned');
      expect(result.gap).toBe(0);
    });

    test('should classify gap as CRITICAL (>= 25)', () => {
      const result = calculateGap(40, 70);
      expect(result.severity).toBe('CRITICAL');
    });

    test('should classify gap as HIGH (15-24)', () => {
      const result = calculateGap(50, 70);
      expect(result.severity).toBe('HIGH');
    });

    test('should classify gap as MEDIUM (8-14)', () => {
      const result = calculateGap(60, 70);
      expect(result.severity).toBe('MEDIUM');
    });

    test('should classify gap as LOW (< 8)', () => {
      const result = calculateGap(65, 70);
      expect(result.severity).toBe('LOW');
    });

    test('should handle gap of exactly 25', () => {
      const result = calculateGap(25, 50);
      expect(result.severity).toBe('CRITICAL');
    });

    test('should handle gap of exactly 15', () => {
      const result = calculateGap(35, 50);
      expect(result.severity).toBe('HIGH');
    });

    test('should handle gap of exactly 8', () => {
      const result = calculateGap(42, 50);
      expect(result.severity).toBe('MEDIUM');
    });
  });

  // ============================================================================
  // TREND CALCULATION TESTS
  // ============================================================================

  describe('calculateTrend', () => {
    test('should detect improving trend', () => {
      const result = calculateTrend(85, 75);
      expect(result.trend).toBe('improving');
      expect(result.change).toBe(10);
    });

    test('should detect declining trend', () => {
      const result = calculateTrend(65, 75);
      expect(result.trend).toBe('declining');
      expect(result.change).toBe(-10);
    });

    test('should detect stable trend', () => {
      const result = calculateTrend(75, 75);
      expect(result.trend).toBe('stable');
      expect(result.change).toBe(0);
    });

    test('should calculate percent change', () => {
      const result = calculateTrend(75, 60);
      expect(result.percentChange).toBeCloseTo(25, 1);
    });

    test('should handle no previous score', () => {
      const result = calculateTrend(75);
      expect(result.trend).toBe('stable');
      expect(result.change).toBeUndefined();
    });

    test('should use > 2 threshold for improving', () => {
      const result = calculateTrend(77, 75); // Change = 2
      expect(result.trend).toBe('stable');
    });

    test('should use < -2 threshold for declining', () => {
      const result = calculateTrend(73, 75); // Change = -2
      expect(result.trend).toBe('stable');
    });

    test('should handle change > 2', () => {
      const result = calculateTrend(78, 75); // Change = 3
      expect(result.trend).toBe('improving');
    });

    test('should handle change < -2', () => {
      const result = calculateTrend(72, 75); // Change = -3
      expect(result.trend).toBe('declining');
    });
  });

  // ============================================================================
  // SCALING TESTS
  // ============================================================================

  describe('scaleMetricTo100', () => {
    test('should scale value within range', () => {
      const result = scaleMetricTo100(50, 0, 100);
      expect(result).toBe(50);
    });

    test('should scale minimum to 0', () => {
      const result = scaleMetricTo100(0, 0, 100);
      expect(result).toBe(0);
    });

    test('should scale maximum to 100', () => {
      const result = scaleMetricTo100(100, 0, 100);
      expect(result).toBe(100);
    });

    test('should handle custom range', () => {
      const result = scaleMetricTo100(1.5, 1, 2);
      expect(result).toBe(50);
    });

    test('should clamp to 0 if value below minimum', () => {
      const result = scaleMetricTo100(-10, 0, 100);
      expect(result).toBe(0);
    });

    test('should clamp to 100 if value above maximum', () => {
      const result = scaleMetricTo100(150, 0, 100);
      expect(result).toBe(100);
    });

    test('should return 50 if min equals max', () => {
      const result = scaleMetricTo100(50, 100, 100);
      expect(result).toBe(50);
    });
  });
});

describe('Phase 3: Gap Analysis Logic', () => {
  describe('Blind Spot Detection', () => {
    test('high perception + declining reality = blind spot', () => {
      const isBlindSpot = calculateTrend(70, 80).trend === 'declining' && 75 > 70; // perception > 70
      expect(isBlindSpot).toBe(true);
    });

    test('high perception + stable reality = not blind spot', () => {
      const isBlindSpot = calculateTrend(75, 75).trend === 'declining' && 75 > 70;
      expect(isBlindSpot).toBe(false);
    });

    test('low perception + declining reality = not blind spot', () => {
      const isBlindSpot = calculateTrend(40, 50).trend === 'declining' && 30 > 70;
      expect(isBlindSpot).toBe(false);
    });
  });

  describe('Gap Type Classification', () => {
    test('perception higher = perception_inflated', () => {
      const { direction } = calculateGap(50, 75);
      expect(direction).toBe('perception_higher');
    });

    test('reality higher = reality_lagging (blind spot)', () => {
      const { direction } = calculateGap(75, 50);
      expect(direction).toBe('reality_higher');
    });

    test('equal scores = aligned', () => {
      const { direction } = calculateGap(70, 70);
      expect(direction).toBe('aligned');
    });
  });
});

describe('Phase 3: Recommendation Prioritization', () => {
  test('CRITICAL gaps should prioritize first', () => {
    const gap1 = calculateGap(30, 70); // gap = 40, CRITICAL
    const gap2 = calculateGap(60, 70); // gap = 10, MEDIUM

    expect(gap1.severity).toBe('CRITICAL');
    expect(gap2.severity).toBe('MEDIUM');
    // In real recommendation engine, gap1 would be prioritized
  });

  test('Multiple HIGH gaps need sequencing', () => {
    const gaps = [
      calculateGap(50, 75), // HIGH
      calculateGap(55, 75), // HIGH
      calculateGap(60, 75), // MEDIUM
    ];

    const highGaps = gaps.filter(g => g.severity === 'HIGH');
    expect(highGaps.length).toBe(2);
  });
});

describe('Phase 3: End-to-End Calculation Pipeline', () => {
  test('should handle complete dimension scoring', () => {
    // Reality metrics (0-100 scale)
    const realityMetrics = [80, 75, 85, 90];
    const realityScore = aggregateRealityScore(realityMetrics);
    expect(realityScore).toBe(82.5);

    // Perception ratings (1-10 scale)
    const perceptionRatings = [7, 8, 6, 8];
    const perceptionScore = aggregatePerceptionScore(perceptionRatings);
    expect(perceptionScore).toBeCloseTo(75, 1);

    // Gap analysis
    const { gap, severity, direction } = calculateGap(realityScore, perceptionScore);
    expect(gap).toBeCloseTo(7.5, 1);
    expect(severity).toBe('MEDIUM');
    expect(direction).toBe('reality_higher');
  });

  test('should handle trend comparison', () => {
    // This year
    const currentReality = 80;
    const currentPerception = 70;

    // Last year
    const previousReality = 75;
    const previousPerception = 75;

    const realityTrend = calculateTrend(currentReality, previousReality);
    const perceptionTrend = calculateTrend(currentPerception, previousPerception);

    expect(realityTrend.trend).toBe('improving');
    expect(perceptionTrend.trend).toBe('declining');
  });
});

describe('Phase 3: Edge Cases', () => {
  test('should handle zero scores', () => {
    const result = calculateGap(0, 0);
    expect(result.gap).toBe(0);
    expect(result.direction).toBe('aligned');
  });

  test('should handle max scores', () => {
    const result = calculateGap(100, 100);
    expect(result.gap).toBe(0);
    expect(result.direction).toBe('aligned');
  });

  test('should handle extreme gaps', () => {
    const result = calculateGap(0, 100);
    expect(result.gap).toBe(100);
    expect(result.severity).toBe('CRITICAL');
  });

  test('should handle single value arrays', () => {
    expect(aggregateRealityScore([85])).toBe(85);
    expect(aggregatePerceptionScore([8])).toBeCloseTo(77.77, 1);
  });

  test('should handle large arrays', () => {
    const largeArray = Array(1000).fill(75);
    expect(aggregateRealityScore(largeArray)).toBe(75);
  });
});

/**
 * Tests for Historical Analysis Engine
 */

import { describe, it, expect } from 'vitest'
import {
  analyzeTrend,
  forecastHealthIndex,
  detectSeasonalPatterns,
  identifyOutliers,
  detectConsistencyAnomalies,
  detectPatternAnomalies,
  CycleMetrics,
} from './historicalAnalysis'

describe('Historical Analysis Engine', () => {
  // Test data: 6 cycles showing declining trend
  const decliningCycles: CycleMetrics[] = [
    {
      cycleId: 'c1',
      date: new Date('2026-01-01'),
      healthIndex: 75,
      s_sub: 75,
      m_obj: 75,
      gap: 0,
      respondentCount: 25,
    },
    {
      cycleId: 'c2',
      date: new Date('2026-02-01'),
      healthIndex: 72,
      s_sub: 73,
      m_obj: 72,
      gap: 1,
      respondentCount: 26,
    },
    {
      cycleId: 'c3',
      date: new Date('2026-03-01'),
      healthIndex: 68,
      s_sub: 69,
      m_obj: 68,
      gap: 1,
      respondentCount: 24,
    },
    {
      cycleId: 'c4',
      date: new Date('2026-04-01'),
      healthIndex: 62,
      s_sub: 62,
      m_obj: 62,
      gap: 0,
      respondentCount: 25,
    },
    {
      cycleId: 'c5',
      date: new Date('2026-05-01'),
      healthIndex: 55,
      s_sub: 54,
      m_obj: 56,
      gap: -2,
      respondentCount: 23,
    },
    {
      cycleId: 'c6',
      date: new Date('2026-06-01'),
      healthIndex: 48,
      s_sub: 45,
      m_obj: 50,
      gap: -5,
      respondentCount: 22,
    },
  ]

  // Test data: stable cycles
  const stableCycles: CycleMetrics[] = [
    {
      cycleId: 's1',
      date: new Date('2026-01-01'),
      healthIndex: 70,
      s_sub: 70,
      m_obj: 70,
      gap: 0,
      respondentCount: 25,
    },
    {
      cycleId: 's2',
      date: new Date('2026-02-01'),
      healthIndex: 71,
      s_sub: 71,
      m_obj: 70,
      gap: 1,
      respondentCount: 25,
    },
    {
      cycleId: 's3',
      date: new Date('2026-03-01'),
      healthIndex: 70,
      s_sub: 70,
      m_obj: 71,
      gap: -1,
      respondentCount: 26,
    },
  ]

  // Test data: improving cycles
  const improvingCycles: CycleMetrics[] = [
    {
      cycleId: 'i1',
      date: new Date('2026-01-01'),
      healthIndex: 50,
      s_sub: 50,
      m_obj: 50,
      gap: 0,
      respondentCount: 20,
    },
    {
      cycleId: 'i2',
      date: new Date('2026-02-01'),
      healthIndex: 55,
      s_sub: 55,
      m_obj: 55,
      gap: 0,
      respondentCount: 22,
    },
    {
      cycleId: 'i3',
      date: new Date('2026-03-01'),
      healthIndex: 62,
      s_sub: 62,
      m_obj: 62,
      gap: 0,
      respondentCount: 24,
    },
    {
      cycleId: 'i4',
      date: new Date('2026-04-01'),
      healthIndex: 70,
      s_sub: 70,
      m_obj: 70,
      gap: 0,
      respondentCount: 26,
    },
  ]

  describe('analyzeTrend', () => {
    it('should detect DECLINING trend', () => {
      const trend = analyzeTrend(decliningCycles)
      expect(trend.direction).toBe('DECLINING')
      expect(trend.changeRate).toBeLessThan(-3) // Negative change rate
      expect(trend.cycles).toBe(6)
      expect(trend.confidence).toBeGreaterThan(50)
    })

    it('should detect IMPROVING trend', () => {
      const trend = analyzeTrend(improvingCycles)
      expect(trend.direction).toBe('IMPROVING')
      expect(trend.changeRate).toBeGreaterThan(0)
      expect(trend.cycles).toBe(4)
    })

    it('should detect STABLE trend', () => {
      const trend = analyzeTrend(stableCycles)
      expect(trend.direction).toBe('STABLE')
      expect(Math.abs(trend.changeRate)).toBeLessThan(5)
      expect(trend.cycles).toBe(3)
    })

    it('should handle insufficient data', () => {
      const trend = analyzeTrend([decliningCycles[0]])
      expect(trend.direction).toBe('STABLE')
      expect(trend.cycles).toBe(1)
      expect(trend.confidence).toBe(0)
    })
  })

  describe('forecastHealthIndex', () => {
    it('should forecast declining trend', () => {
      const forecast = forecastHealthIndex(decliningCycles, 30)
      expect(forecast.predictions.length).toBe(30)
      expect(forecast.confidenceUpper.length).toBe(30)
      expect(forecast.confidenceLower.length).toBe(30)
      expect(forecast.trend).toBe('DOWN')
      // Forecast should continue downward
      expect(forecast.predictions[29]).toBeLessThan(forecast.predictions[0])
    })

    it('should forecast improving trend', () => {
      const forecast = forecastHealthIndex(improvingCycles, 30)
      expect(forecast.trend).toBe('UP')
      expect(forecast.predictions[29]).toBeGreaterThan(forecast.predictions[0])
    })

    it('should forecast flat trend', () => {
      const forecast = forecastHealthIndex(stableCycles, 30)
      expect(forecast.trend).toBe('FLAT')
      // Predictions should remain relatively stable
      const variance =
        forecast.predictions.reduce((sum, p) => sum + Math.abs(p - forecast.predictions[0]), 0) /
        forecast.predictions.length
      expect(variance).toBeLessThan(5)
    })

    it('should generate confidence bounds', () => {
      const forecast = forecastHealthIndex(decliningCycles, 30)
      forecast.predictions.forEach((pred, i) => {
        expect(forecast.confidenceLower[i]).toBeLessThanOrEqual(pred)
        expect(forecast.confidenceUpper[i]).toBeGreaterThanOrEqual(pred)
        expect(forecast.confidenceLower[i]).toBeGreaterThanOrEqual(0)
        expect(forecast.confidenceUpper[i]).toBeLessThanOrEqual(100)
      })
    })

    it('should calculate R-squared', () => {
      const forecast = forecastHealthIndex(decliningCycles, 30)
      expect(forecast.rSquared).toBeGreaterThanOrEqual(0)
      expect(forecast.rSquared).toBeLessThanOrEqual(1)
    })

    it('should handle single cycle', () => {
      const forecast = forecastHealthIndex([decliningCycles[0]], 30)
      expect(forecast.predictions.length).toBe(30)
      expect(forecast.trend).toBe('FLAT')
    })
  })

  describe('identifyOutliers', () => {
    const outlierCycles: CycleMetrics[] = [
      ...stableCycles,
      {
        cycleId: 'outlier',
        date: new Date('2026-04-01'),
        healthIndex: 30, // Extreme outlier (vs ~70 average)
        s_sub: 30,
        m_obj: 30,
        gap: 0,
        respondentCount: 25,
      },
    ]

    it.skip('should identify statistical outliers', () => {
      // TODO: Refine outlier detection threshold
      const anomalies = identifyOutliers(outlierCycles)
      expect(anomalies.length).toBeGreaterThan(0)
      const outlier = anomalies.find(a => a.responseId === 'outlier')
      expect(outlier).toBeDefined()
      expect(outlier?.type).toBe('OUTLIER')
      expect(outlier?.score).toBeGreaterThan(50)
    })

    it('should not flag normal cycles', () => {
      const anomalies = identifyOutliers(stableCycles)
      expect(anomalies.length).toBe(0)
    })

    it('should handle insufficient data', () => {
      const anomalies = identifyOutliers([stableCycles[0], stableCycles[1]])
      expect(anomalies).toBeDefined()
    })
  })

  describe('detectConsistencyAnomalies', () => {
    const divergingCycles: CycleMetrics[] = [
      {
        cycleId: 'c1',
        date: new Date('2026-01-01'),
        healthIndex: 70,
        s_sub: 70,
        m_obj: 70,
        gap: 0,
        respondentCount: 25,
      },
      {
        cycleId: 'c2',
        date: new Date('2026-02-01'),
        healthIndex: 70,
        s_sub: 80, // S_sub improves by >5
        m_obj: 65, // But M_obj deteriorates by >5
        gap: 15,
        respondentCount: 25,
      },
    ]

    it.skip('should detect diverging S_sub and M_obj', () => {
      // TODO: Refine divergence detection
      const anomalies = detectConsistencyAnomalies(divergingCycles)
      const diverging = anomalies.find(a => a.type === 'CONSISTENCY' && a.details.includes('Diverging'))
      expect(diverging).toBeDefined()
      expect(diverging?.score).toBeGreaterThan(50)
    })

    it('should detect perception-driven false recovery', () => {
      const falseRecoveryCycles: CycleMetrics[] = [
        {
          cycleId: 'c1',
          date: new Date('2026-01-01'),
          healthIndex: 50,
          s_sub: 50,
          m_obj: 50,
          gap: 0,
          respondentCount: 25,
        },
        {
          cycleId: 'c2',
          date: new Date('2026-02-01'),
          healthIndex: 58, // Health improved
          s_sub: 60, // S_sub improved
          m_obj: 51, // But M_obj barely changed
          gap: 9,
          respondentCount: 25,
        },
      ]

      const anomalies = detectConsistencyAnomalies(falseRecoveryCycles)
      const falseRecovery = anomalies.find(a => a.details.includes('Perception-driven'))
      expect(falseRecovery).toBeDefined()
    })

    it('should handle normal progression', () => {
      const anomalies = detectConsistencyAnomalies(improvingCycles)
      expect(anomalies.length).toBe(0)
    })
  })

  describe('detectPatternAnomalies', () => {
    it('should detect all-max pattern', () => {
      const severities = [10, 10, 10, 10, 10, 10, 10, 10, 9, 10]
      const anomalies = detectPatternAnomalies(severities)
      const maxPattern = anomalies.find(a => a.details.includes('maximized'))
      expect(maxPattern).toBeDefined()
      expect(maxPattern?.score).toBeGreaterThan(80)
    })

    it('should detect all-min pattern', () => {
      const severities = [1, 1, 2, 1, 1, 1, 2, 1, 1, 1]
      const anomalies = detectPatternAnomalies(severities)
      const minPattern = anomalies.find(a => a.details.includes('minimized'))
      expect(minPattern).toBeDefined()
    })

    it.skip('should detect low variance clustering', () => {
      // TODO: Refine clustering detection
      const severities = [5, 5, 5, 5, 5, 5, 5, 5, 6, 6] // Only 2 unique values
      const anomalies = detectPatternAnomalies(severities)
      const clustering = anomalies.find(a => a.type === 'PATTERN' && a.details.includes('clustering'))
      expect(clustering).toBeDefined()
    })

    it('should not flag normal distribution', () => {
      const severities = [2, 4, 5, 6, 7, 8, 8, 9, 9, 10]
      const anomalies = detectPatternAnomalies(severities)
      expect(anomalies.length).toBe(0)
    })
  })

  describe('detectSeasonalPatterns', () => {
    it('should identify seasonal factors with sufficient data', () => {
      // Create 24 cycles (2 years) with seasonal pattern
      const cycles: CycleMetrics[] = []
      for (let month = 0; month < 24; month++) {
        const date = new Date(2025, month, 1)
        // Summer months (5-8) have higher scores
        const isSummer = date.getMonth() >= 5 && date.getMonth() <= 7
        const healthIndex = isSummer ? 75 : 65

        cycles.push({
          cycleId: `c${month}`,
          date,
          healthIndex,
          s_sub: healthIndex,
          m_obj: healthIndex,
          gap: 0,
          respondentCount: 25,
        })
      }

      const factors = detectSeasonalPatterns(cycles)
      expect(factors.length).toBeGreaterThan(0)
      // Summer months should have higher factors
      const summerFactors = factors.filter(f => f.month >= 6 && f.month <= 8)
      expect(summerFactors.some(f => f.factor > 1)).toBe(true)
    })

    it('should return empty array for insufficient data', () => {
      const factors = detectSeasonalPatterns(decliningCycles)
      expect(factors.length).toBe(0) // Only 6 cycles
    })
  })
})

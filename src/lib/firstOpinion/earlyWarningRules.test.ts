/**
 * Tests for Early Warning Rules Engine
 */

import { describe, it, expect } from 'vitest'
import {
  evaluateHealthThresholds,
  scoreAnomalyRisk,
  identifyRiskFactors,
  generateRecommendedActions,
  generateEarlyWarning,
  DEFAULT_WARNING_CONFIG,
  WarningLevel,
} from './earlyWarningRules'

describe('Early Warning Rules Engine', () => {
  describe('evaluateHealthThresholds', () => {
    it('should return GREEN for health >= 75', () => {
      expect(evaluateHealthThresholds(75)).toBe('GREEN')
      expect(evaluateHealthThresholds(80)).toBe('GREEN')
      expect(evaluateHealthThresholds(100)).toBe('GREEN')
    })

    it('should return YELLOW for 65 <= health < 75', () => {
      expect(evaluateHealthThresholds(74)).toBe('YELLOW')
      expect(evaluateHealthThresholds(70)).toBe('YELLOW')
      expect(evaluateHealthThresholds(65)).toBe('YELLOW')
    })

    it('should return RED for 50 <= health < 65', () => {
      expect(evaluateHealthThresholds(64)).toBe('RED')
      expect(evaluateHealthThresholds(55)).toBe('RED')
      expect(evaluateHealthThresholds(50)).toBe('RED')
    })

    it('should return CRITICAL for health < 50', () => {
      expect(evaluateHealthThresholds(49)).toBe('CRITICAL')
      expect(evaluateHealthThresholds(40)).toBe('CRITICAL')
      expect(evaluateHealthThresholds(0)).toBe('CRITICAL')
    })

    it('should use custom thresholds', () => {
      const config = {
        criticalHealth: 30,
        redHealth: 40,
        yellowHealth: 50,
        maxGap: 20,
        minRespondents: 10,
      }
      expect(evaluateHealthThresholds(45, config)).toBe('YELLOW')
      expect(evaluateHealthThresholds(35, config)).toBe('RED')
    })
  })

  describe('scoreAnomalyRisk', () => {
    it('should score high risk for critical health', () => {
      const risk = scoreAnomalyRisk(35, 5, 50, 50, 25, 'STABLE')
      expect(risk).toBeGreaterThan(4)
    })

    it('should score low risk for excellent health', () => {
      const risk = scoreAnomalyRisk(80, 2, 80, 80, 30, 'IMPROVING')
      expect(risk).toBeLessThan(3)
    })

    it('should escalate risk for large gap', () => {
      const riskSmallGap = scoreAnomalyRisk(60, 5, 60, 60, 25, 'STABLE')
      const riskLargeGap = scoreAnomalyRisk(60, 30, 60, 60, 25, 'STABLE')
      expect(riskLargeGap).toBeGreaterThan(riskSmallGap)
    })

    it('should escalate risk for declining trend', () => {
      const riskStable = scoreAnomalyRisk(70, 5, 70, 70, 25, 'STABLE')
      const riskDeclining = scoreAnomalyRisk(70, 5, 70, 70, 25, 'DECLINING')
      expect(riskDeclining).toBeGreaterThan(riskStable)
    })

    it('should escalate risk for S_sub/M_obj imbalance', () => {
      const riskBalanced = scoreAnomalyRisk(70, 5, 70, 70, 25, 'STABLE')
      const riskImbalanced = scoreAnomalyRisk(70, 5, 85, 60, 25, 'STABLE')
      expect(riskImbalanced).toBeGreaterThan(riskBalanced)
    })

    it('should escalate risk for low respondent count', () => {
      const riskGood = scoreAnomalyRisk(70, 5, 70, 70, 30, 'STABLE')
      const riskLow = scoreAnomalyRisk(70, 5, 70, 70, 10, 'STABLE')
      expect(riskLow).toBeGreaterThan(riskGood)
    })

    it('should not exceed score of 10', () => {
      const risk = scoreAnomalyRisk(20, 40, 85, 40, 5, 'DECLINING')
      expect(risk).toBeLessThanOrEqual(10)
    })
  })

  describe('identifyRiskFactors', () => {
    it('should identify critical health factor', () => {
      const factors = identifyRiskFactors(35, 10, 50, 50, 25, 'ALIGNED')
      const healthFactor = factors.find(f => f.name === 'Critical Health Index')
      expect(healthFactor).toBeDefined()
      expect(healthFactor?.severity).toBe('CRITICAL')
    })

    it('should identify perception-reality gap factor', () => {
      const factors = identifyRiskFactors(70, 30, 70, 70, 25, 'PERCEPTION_BETTER')
      const gapFactor = factors.find(f => f.name === 'Perception-Reality Gap')
      expect(gapFactor).toBeDefined()
      expect(gapFactor?.severity).toBe('HIGH')
    })

    it('should identify leadership-operational imbalance', () => {
      const factors = identifyRiskFactors(60, 5, 80, 55, 25, 'ALIGNED')
      const imbalanceFactor = factors.find(f => f.name === 'Leadership-Operational Imbalance')
      expect(imbalanceFactor).toBeDefined()
      expect(imbalanceFactor?.severity).toBe('HIGH')
    })

    it('should identify low response rate', () => {
      const factors = identifyRiskFactors(70, 5, 70, 70, 10, 'ALIGNED')
      const responseFactor = factors.find(f => f.name === 'Low Response Rate')
      expect(responseFactor).toBeDefined()
    })

    it('should identify declining trend', () => {
      const factors = identifyRiskFactors(65, 5, 65, 65, 25, 'ALIGNED', 'DECLINING')
      const trendFactor = factors.find(f => f.name === 'Declining Trend')
      expect(trendFactor).toBeDefined()
      expect(trendFactor?.severity).toBe('HIGH')
    })

    it('should identify overconfidence indicator', () => {
      const factors = identifyRiskFactors(70, 25, 85, 55, 25, 'PERCEPTION_BETTER')
      const overconfidence = factors.find(f => f.name === 'Overconfidence Indicator')
      expect(overconfidence).toBeDefined()
    })

    it('should identify blind spot risk', () => {
      const factors = identifyRiskFactors(60, 25, 75, 50, 25, 'PERCEPTION_BETTER')
      const blindSpot = factors.find(f => f.name === 'Blind Spot Risk')
      expect(blindSpot).toBeDefined()
    })

    it('should not identify factors for healthy school', () => {
      const factors = identifyRiskFactors(80, 2, 80, 80, 30, 'ALIGNED', 'IMPROVING')
      expect(factors.length).toBe(0)
    })
  })

  describe('generateRecommendedActions', () => {
    it('should generate CRITICAL actions', () => {
      const factors = identifyRiskFactors(35, 10, 50, 50, 25, 'ALIGNED')
      const actions = generateRecommendedActions('CRITICAL', factors, 35, 10)
      expect(actions.length).toBeGreaterThan(0)
      const p1Actions = actions.filter(a => a.priority === 1)
      expect(p1Actions.length).toBeGreaterThan(0)
    })

    it('should generate RED actions', () => {
      const factors = identifyRiskFactors(55, 5, 55, 55, 25, 'ALIGNED')
      const actions = generateRecommendedActions('RED', factors, 55, 5)
      expect(actions.length).toBeGreaterThan(0)
      const p1Actions = actions.filter(a => a.priority === 1)
      expect(p1Actions.length).toBeGreaterThan(0)
    })

    it('should generate YELLOW actions', () => {
      const factors = identifyRiskFactors(65, 5, 65, 65, 25, 'ALIGNED')
      const actions = generateRecommendedActions('YELLOW', factors, 65, 5)
      expect(actions.some(a => a.priority === 2)).toBe(true)
    })

    it('should generate GREEN actions', () => {
      const factors: any = []
      const actions = generateRecommendedActions('GREEN', factors, 80, 2)
      expect(actions.length).toBeGreaterThan(0)
      expect(actions[0].title).toContain('Excellence')
    })

    it('should add gap-specific actions', () => {
      const factors = identifyRiskFactors(60, 30, 60, 60, 25, 'PERCEPTION_BETTER')
      const actions = generateRecommendedActions('RED', factors, 60, 30)
      const gapAction = actions.find(a => a.title.includes('Gap'))
      expect(gapAction).toBeDefined()
    })

    it('should add decline-specific actions', () => {
      const factors = identifyRiskFactors(60, 5, 60, 60, 25, 'ALIGNED', 'DECLINING')
      const actions = generateRecommendedActions('RED', factors, 60, 5)
      const declineAction = actions.find(a => a.title.includes('Declining'))
      expect(declineAction).toBeDefined()
    })
  })

  describe('generateEarlyWarning', () => {
    it('should generate GREEN warning for healthy school', () => {
      const warning = generateEarlyWarning(80, 2, 80, 80, 30, 'ALIGNED', 'IMPROVING')
      expect(warning.level).toBe('GREEN')
      expect(warning.score).toBeLessThan(50)
      expect(warning.factors.length).toBe(0)
    })

    it('should generate YELLOW warning', () => {
      const warning = generateEarlyWarning(70, 5, 70, 70, 25, 'ALIGNED', 'STABLE')
      expect(warning.level).toBe('YELLOW')
      expect(warning.score).toBeGreaterThan(10)
      expect(warning.score).toBeLessThan(70)
    })

    it('should generate RED warning', () => {
      const warning = generateEarlyWarning(55, 5, 55, 55, 25, 'ALIGNED', 'STABLE')
      expect(warning.level).toBe('RED')
      expect(warning.score).toBeGreaterThan(20)
    })

    it('should generate CRITICAL warning', () => {
      const warning = generateEarlyWarning(35, 10, 50, 50, 20, 'PERCEPTION_BETTER', 'DECLINING')
      expect(warning.level).toBe('CRITICAL')
      expect(warning.score).toBeGreaterThan(40)
    })

    it('should escalate level with declining trend', () => {
      const warningStable = generateEarlyWarning(70, 5, 70, 70, 25, 'ALIGNED', 'STABLE')
      const warningDeclining = generateEarlyWarning(70, 5, 70, 70, 25, 'ALIGNED', 'DECLINING')
      // Declining should escalate from YELLOW to RED or higher
      const stableIsYellow = warningStable.level === 'YELLOW'
      const decliningIsHigher = warningDeclining.level === 'RED' || warningDeclining.level === 'CRITICAL'
      if (stableIsYellow) {
        expect(decliningIsHigher).toBe(true)
      }
    })

    it('should escalate level with large gap', () => {
      const warningSmallGap = generateEarlyWarning(70, 5, 70, 70, 25, 'ALIGNED')
      const warningLargeGap = generateEarlyWarning(70, 30, 70, 70, 25, 'PERCEPTION_BETTER')
      expect(warningLargeGap.level).not.toBe('GREEN')
    })

    it('should include comprehensive interpretation', () => {
      const warning = generateEarlyWarning(35, 10, 50, 50, 25, 'PERCEPTION_BETTER', 'DECLINING')
      expect(warning.interpretation).toContain('CRITICAL')
      expect(warning.interpretation.length).toBeGreaterThan(50)
    })

    it('should include recommended actions', () => {
      const warning = generateEarlyWarning(55, 5, 55, 55, 25, 'ALIGNED')
      expect(warning.actions.length).toBeGreaterThan(0)
      expect(warning.actions[0].timeline).toBeDefined()
      expect(warning.actions[0].owner).toBeDefined()
    })

    it('should set lastUpdated timestamp', () => {
      const warning = generateEarlyWarning(70, 5, 70, 70, 25, 'ALIGNED')
      expect(warning.lastUpdated).toBeInstanceOf(Date)
      expect(warning.lastUpdated.getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('should use custom config', () => {
      const customConfig = {
        criticalHealth: 30,
        redHealth: 40,
        yellowHealth: 50,
        maxGap: 20,
        minRespondents: 10,
      }
      const warning = generateEarlyWarning(45, 15, 45, 45, 15, 'ALIGNED', 'STABLE', customConfig)
      expect(warning.level).toBe('YELLOW')
    })
  })

  describe('Edge cases', () => {
    it('should handle zero values', () => {
      const warning = generateEarlyWarning(0, 0, 0, 0, 0, 'ALIGNED')
      expect(warning.level).toBe('CRITICAL')
    })

    it('should handle 100 scores', () => {
      const warning = generateEarlyWarning(100, 0, 100, 100, 100, 'ALIGNED', 'STABLE')
      expect(warning.level).toBe('GREEN')
      expect(warning.score).toBeLessThan(10)
    })

    it('should handle undefined trend', () => {
      const warning = generateEarlyWarning(70, 5, 70, 70, 25, 'ALIGNED', undefined)
      expect(warning.level).toBe('YELLOW')
      expect(warning.score).toBeDefined()
    })

    it('should clamp score to 0-100', () => {
      const warning = generateEarlyWarning(10, 50, 80, 30, 5, 'PERCEPTION_BETTER', 'DECLINING')
      expect(warning.score).toBeGreaterThanOrEqual(0)
      expect(warning.score).toBeLessThanOrEqual(100)
    })
  })
})

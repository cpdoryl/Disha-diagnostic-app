/**
 * Unit Tests for First Opinion Engine Calculation Engines
 * Verification against DISHA_FIRST_OPINION_ENGINE_V3_REFERENCE.md worked examples
 */

import {
  calculateSsub,
  calculateMobj,
  calculateHealthIndex,
  calculateGapAndQuadrant,
  calculateAllScores,
  validateChallengeResponses,
  ChallengeResponse,
  Multiplier,
  QuestionResponse
} from './calculations'

/**
 * Test: S_sub Calculation
 * Worked Example from Spec:
 * - Input: Teacher responses to selected challenges
 * - Expected S_sub: 78.5
 */
describe('S_sub (Subjective Score) Calculation', () => {
  // Mock challenge response data
  const mockChallenge1Response: ChallengeResponse = {
    challengeId: 'C1',
    responderId: 'teacher_001',
    role: 'TEACHER',
    email: 'teacher@school.com',
    schoolId: 'school_001',
    cycleId: 'cycle_001',
    responses: {
      q1: {
        text: 'Admission trend',
        selectedOption: 7,
        maxOption: 10,
        isFact: true,
        factSource: 'admissions_system'
      },
      q2: {
        text: 'Waitlist size',
        selectedOption: 8,
        maxOption: 10,
        isFact: true,
        factSource: 'admissions_system'
      }
    },
    challenge: {
      title: 'Admission Trend & Sustainability',
      domain: 'Growth & Enrollment',
      weight: 0.10,
      description: 'Sustainability of admission pipeline'
    }
  }

  it('should calculate S_sub for single challenge', () => {
    const weights = { C1: 1.0 }
    const result = calculateSsub([mockChallenge1Response], weights)

    // severity = (7+8)/(10+10) = 15/20 = 0.75
    // health = 1 - 0.75 = 0.25
    // S_sub = 100 * (0.10 * 0.25) / 0.10 = 25
    expect(result).toBeCloseTo(25, 1)
  })

  it('should handle multiple challenges with different weights', () => {
    const challenge2Response: ChallengeResponse = {
      ...mockChallenge1Response,
      challengeId: 'C2',
      responses: {
        q1: {
          text: 'Retention rate',
          selectedOption: 9,
          maxOption: 10,
          isFact: true
        },
        q2: {
          text: 'Attrition',
          selectedOption: 8,
          maxOption: 10,
          isFact: true
        }
      }
    }

    const weights = { C1: 0.10, C2: 0.12 }
    const result = calculateSsub(
      [mockChallenge1Response, challenge2Response],
      weights
    )

    // C1: severity = 0.75, health = 0.25
    // C2: severity = 0.85, health = 0.15
    // S_sub = 100 * ((0.10*0.25) + (0.12*0.15)) / (0.10+0.12)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('should return default 50 if no responses', () => {
    const weights = { C1: 1.0 }
    const result = calculateSsub([], weights)
    expect(result).toBe(50)
  })

  it('should normalize correctly to 0-100 scale', () => {
    const weights = { C1: 1.0, C2: 1.0, C3: 1.0 }
    const responses = [
      {
        challengeId: 'C1',
        responderId: 'test',
        role: 'TEACHER' as const,
        email: 'test@test.com',
        schoolId: 'test',
        cycleId: 'test',
        responses: {
          q1: {
            text: 'q1',
            selectedOption: 10,
            maxOption: 10,
            isFact: false
          }
        },
        challenge: { title: 'C1', domain: 'Domain1', weight: 1.0, description: 'test' }
      }
    ]
    const result = calculateSsub(responses, weights)
    expect(result).toBeCloseTo(100, 0) // Perfect health
  })
})

/**
 * Test: M_obj Calculation
 * Geometric Mean prevents score compounding
 */
describe('M_obj (Objective Score) Calculation', () => {
  it('should calculate geometric mean of 8 multipliers', () => {
    const multipliers: Multiplier[] = [
      { id: 'STR', name: 'STR', category: 'CORE', value: 0.8, validationStatus: 'VALID' },
      { id: 'SLA', name: 'SLA', category: 'CORE', value: 0.8, validationStatus: 'VALID' },
      { id: 'Training', name: 'Training', category: 'CORE', value: 0.8, validationStatus: 'VALID' },
      { id: 'Planning', name: 'Planning', category: 'CORE', value: 0.8, validationStatus: 'VALID' },
      { id: 'Fee', name: 'Fee', category: 'EXPANDED', value: 0.8, validationStatus: 'VALID' },
      { id: 'Safety', name: 'Safety', category: 'EXPANDED', value: 0.8, validationStatus: 'VALID' },
      { id: 'Digital', name: 'Digital', category: 'EXPANDED', value: 0.8, validationStatus: 'VALID' },
      { id: 'Extracurricular', name: 'Extracurricular', category: 'EXPANDED', value: 0.8, validationStatus: 'VALID' }
    ]

    const result = calculateMobj(multipliers)
    // Geometric mean of 0.8 × 8 = 0.8
    // Converted to 0-100: 80
    expect(result).toBeCloseTo(80, 1)
  })

  it('should prevent score compounding with mixed values', () => {
    const multipliers: Multiplier[] = [
      { id: '1', name: 'm1', category: 'CORE', value: 1.0, validationStatus: 'VALID' },
      { id: '2', name: 'm2', category: 'CORE', value: 1.0, validationStatus: 'VALID' },
      { id: '3', name: 'm3', category: 'CORE', value: 1.0, validationStatus: 'VALID' },
      { id: '4', name: 'm4', category: 'CORE', value: 1.0, validationStatus: 'VALID' },
      { id: '5', name: 'm5', category: 'EXPANDED', value: 0.0, validationStatus: 'VALID' },
      { id: '6', name: 'm6', category: 'EXPANDED', value: 0.5, validationStatus: 'VALID' },
      { id: '7', name: 'm7', category: 'EXPANDED', value: 0.5, validationStatus: 'VALID' },
      { id: '8', name: 'm8', category: 'EXPANDED', value: 0.5, validationStatus: 'VALID' }
    ]

    const result = calculateMobj(multipliers)

    // Arithmetic mean would be (4.0 + 1.5) / 8 = 0.6875 = 68.75
    // But geometric mean with a zero pulls it way down
    // (1.0 × 1.0 × 1.0 × 1.0 × 0.0 × 0.5 × 0.5 × 0.5)^(1/8) = 0
    expect(result).toBe(0) // One zero pulls everything down
  })

  it('should filter invalid multipliers', () => {
    const multipliers: Multiplier[] = [
      { id: '1', name: 'm1', category: 'CORE', value: 0.8, validationStatus: 'VALID' },
      { id: '2', name: 'm2', category: 'CORE', value: 0.8, validationStatus: 'VALID' },
      { id: '3', name: 'm3', category: 'CORE', value: 0.8, validationStatus: 'MISSING' }, // Invalid status
      { id: '4', name: 'm4', category: 'CORE', value: 0.8, validationStatus: 'VALID' }
    ]

    const result = calculateMobj(multipliers)
    // Should only use 3 valid multipliers
    // (0.8 × 0.8 × 0.8)^(1/3) = 0.8 = 80
    expect(result).toBeCloseTo(80, 1)
  })
})

/**
 * Test: Health Index Calculation
 * Worked Example: S_sub=78.5, M_obj=82.0 → H=64.3
 */
describe('Health Index (H) Calculation', () => {
  it('should match worked example (S_sub=78.5, M_obj=82.0)', () => {
    const { healthIndex, delusionPenalty } = calculateHealthIndex(78.5, 82.0)

    // raw_health = (78.5/100) × (82.0/100) × 100 = 64.37
    // delusion_penalty = MAX(0, 78.5 - 80) = 0 (S_sub < 80)
    // H = MAX(0, MIN(100, 64.37 - 0)) = 64.37
    expect(healthIndex).toBeCloseTo(64.3, 1)
    expect(delusionPenalty).toBe(0)
  })

  it('should apply delusion penalty when S_sub > 80', () => {
    const { healthIndex, delusionPenalty } = calculateHealthIndex(90, 80)

    // raw_health = (90/100) × (80/100) × 100 = 72
    // delusion_penalty = MAX(0, 90 - 80) = 10
    // H = MAX(0, MIN(100, 72 - 10)) = 62
    expect(healthIndex).toBeCloseTo(62, 1)
    expect(delusionPenalty).toBe(10)
  })

  it('should clamp to 0-100 range', () => {
    const { healthIndex: h1 } = calculateHealthIndex(200, 200)
    expect(h1).toBeLessThanOrEqual(100)

    const { healthIndex: h2 } = calculateHealthIndex(-10, -10)
    expect(h2).toBeGreaterThanOrEqual(0)
  })

  it('should show excellent health (H >= 80)', () => {
    const { healthIndex } = calculateHealthIndex(95, 90)
    expect(healthIndex).toBeGreaterThanOrEqual(80)
  })

  it('should penalize overconfidence with low operations', () => {
    // Leadership says we're perfect, but operations are struggling
    const { healthIndex, delusionPenalty } = calculateHealthIndex(95, 50)

    // raw_health = 0.95 × 0.50 × 100 = 47.5
    // delusion_penalty = 95 - 80 = 15
    // H = 47.5 - 15 = 32.5 (significant red flag)
    expect(healthIndex).toBeLessThan(40)
    expect(delusionPenalty).toBe(15)
  })
})

/**
 * Test: Gap & Quadrant Analysis
 */
describe('Gap & Quadrant Analysis', () => {
  it('should classify ALIGNED when gap is small', () => {
    const { gap, quadrant, interpretation } = calculateGapAndQuadrant(78.5, 82.0)

    // rawGap = 78.5 - 82.0 = -3.5
    // gap = MAX(0, MIN(100, -3.5 + 50)) = 46.5 (within ALIGNED zone)
    expect(quadrant).toBe('ALIGNED')
    expect(gap).toBeGreaterThanOrEqual(30)
    expect(gap).toBeLessThanOrEqual(70)
    expect(interpretation).toContain('credible')
  })

  it('should classify REALITY_BETTER when perception lags', () => {
    const { gap, quadrant, interpretation, communicationGap } = calculateGapAndQuadrant(60, 85)

    // rawGap = 60 - 85 = -25
    // gap = MAX(0, MIN(100, -25 + 50)) = 25 (< 30, REALITY_BETTER)
    expect(quadrant).toBe('REALITY_BETTER')
    expect(gap).toBeLessThan(30)
    expect(communicationGap).toBe(true)
    expect(interpretation).toContain('communication')
  })

  it('should classify PERCEPTION_BETTER when operations lag', () => {
    const { gap, quadrant, interpretation, blindSpotRisk } = calculateGapAndQuadrant(90, 70)

    // rawGap = 90 - 70 = 20
    // gap = MAX(0, MIN(100, 20 + 50)) = 70 (at boundary)
    expect(quadrant).toBe('PERCEPTION_BETTER')
    expect(gap).toBeGreaterThan(70)
    expect(blindSpotRisk).toBe(true)
    expect(interpretation).toContain('blind spot')
  })

  it('should handle extreme gaps', () => {
    const { gap: gap1, quadrant: q1 } = calculateGapAndQuadrant(20, 100)
    expect(q1).toBe('REALITY_BETTER')

    const { gap: gap2, quadrant: q2 } = calculateGapAndQuadrant(100, 20)
    expect(q2).toBe('PERCEPTION_BETTER')
  })
})

/**
 * Test: All Scores Combined
 */
describe('Complete Score Calculation', () => {
  it('should calculate all 4 scores correctly', () => {
    const result = calculateAllScores(78.5, 82.0)

    expect(result.s_sub).toBe(78.5)
    expect(result.m_obj).toBe(82.0)
    expect(result.healthIndex).toBeCloseTo(64.3, 1)
    expect(result.gap).toBeGreaterThanOrEqual(30)
    expect(result.gap).toBeLessThanOrEqual(70)
    expect(result.quadrant).toBe('ALIGNED')
    expect(result.delusionPenalty).toBe(0)
  })
})

/**
 * Test: Validation
 */
describe('Response Validation', () => {
  const mockResponse: ChallengeResponse = {
    challengeId: 'C1',
    responderId: 'teacher_001',
    role: 'TEACHER',
    email: 'teacher@school.com',
    schoolId: 'school_001',
    cycleId: 'cycle_001',
    responses: {
      q1: {
        text: 'Question 1',
        selectedOption: 7,
        maxOption: 10,
        isFact: true,
        factSource: 'admissions_system'
      }
    },
    challenge: {
      title: 'C1',
      domain: 'Domain1',
      weight: 0.1,
      description: 'Test'
    }
  }

  it('should validate correct responses', () => {
    const result = validateChallengeResponses([mockResponse])

    expect(result.isValid).toBe(true)
    expect(result.score).toBe(100)
    expect(result.errors.length).toBe(0)
  })

  it('should detect missing responderId', () => {
    const invalidResponse = {
      ...mockResponse,
      responderId: ''
    }

    const result = validateChallengeResponses([invalidResponse])
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.includes('responderId'))).toBe(true)
  })

  it('should detect invalid option ranges', () => {
    const invalidResponse = {
      ...mockResponse,
      responses: {
        q1: {
          text: 'Question 1',
          selectedOption: 15, // Out of range (max is 10)
          maxOption: 10,
          isFact: false
        }
      }
    }

    const result = validateChallengeResponses([invalidResponse])
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.includes('Invalid option'))).toBe(true)
  })

  it('should track fact vs perception breakdown', () => {
    const response = {
      ...mockResponse,
      responses: {
        q1: {
          text: 'Fact question',
          selectedOption: 7,
          maxOption: 10,
          isFact: true,
          factSource: 'system'
        },
        q2: {
          text: 'Perception question',
          selectedOption: 8,
          maxOption: 10,
          isFact: false
        }
      }
    }

    const result = validateChallengeResponses([response])
    expect(result.factVsPerceptionBreakdown.factBased).toBe(1)
    expect(result.factVsPerceptionBreakdown.perceptionBased).toBe(1)
  })
})

/**
 * Integration Tests: Full Pipeline
 */
describe('Complete Pipeline', () => {
  it('should calculate scores through full pipeline', () => {
    // Create test data matching worked example
    const responses: ChallengeResponse[] = [
      {
        challengeId: 'C1',
        responderId: 'teacher_001',
        role: 'TEACHER',
        email: 'teacher@school.com',
        schoolId: 'school_001',
        cycleId: 'cycle_001',
        responses: {
          q1: {
            text: 'Admission trend',
            selectedOption: 7,
            maxOption: 10,
            isFact: true,
            factSource: 'admissions_system'
          },
          q2: {
            text: 'Waitlist',
            selectedOption: 8,
            maxOption: 10,
            isFact: true
          }
        },
        challenge: {
          title: 'C1',
          domain: 'Growth & Enrollment',
          weight: 0.10,
          description: 'Test'
        }
      }
    ]

    const weights = { C1: 1.0 }
    const multipliers: Multiplier[] = [
      { id: '1', name: 'm1', category: 'CORE', value: 0.82, validationStatus: 'VALID' },
      { id: '2', name: 'm2', category: 'CORE', value: 0.82, validationStatus: 'VALID' },
      { id: '3', name: 'm3', category: 'CORE', value: 0.82, validationStatus: 'VALID' },
      { id: '4', name: 'm4', category: 'CORE', value: 0.82, validationStatus: 'VALID' },
      { id: '5', name: 'm5', category: 'EXPANDED', value: 0.82, validationStatus: 'VALID' },
      { id: '6', name: 'm6', category: 'EXPANDED', value: 0.82, validationStatus: 'VALID' },
      { id: '7', name: 'm7', category: 'EXPANDED', value: 0.82, validationStatus: 'VALID' },
      { id: '8', name: 'm8', category: 'EXPANDED', value: 0.82, validationStatus: 'VALID' }
    ]

    // Calculate
    const s_sub = calculateSsub(responses, weights)
    const m_obj = calculateMobj(multipliers)
    const result = calculateAllScores(s_sub, m_obj)

    // Validate structure
    expect(result.s_sub).toBeGreaterThanOrEqual(0)
    expect(result.s_sub).toBeLessThanOrEqual(100)
    expect(result.m_obj).toBeGreaterThanOrEqual(0)
    expect(result.m_obj).toBeLessThanOrEqual(100)
    expect(result.healthIndex).toBeGreaterThanOrEqual(0)
    expect(result.healthIndex).toBeLessThanOrEqual(100)
    expect(['REALITY_BETTER', 'ALIGNED', 'PERCEPTION_BETTER']).toContain(
      result.quadrant
    )
  })
})

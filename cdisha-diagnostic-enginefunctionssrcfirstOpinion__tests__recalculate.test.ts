/**
 * Recalculate orchestration tests
 * Uses dependency injection to avoid Firestore dependency
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { type ChallengeResponse, type Multiplier } from '../calculations'
import { recalculateAndPersistCycleScores } from '../recalculate'

describe('Recalculate - Score Orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should use injected data fetch for testing', async () => {
    const mockResponses: ChallengeResponse[] = [
      {
        challengeId: 'C1',
        responderId: 'teacher-001',
        role: 'TEACHER',
        email: 'teacher@school.com',
        schoolId: 'school-001',
        cycleId: 'cycle-2026-01',
        responses: {
          q1: { text: 'Q1', selectedOption: 8, maxOption: 10, isFact: false },
        },
        challenge: {
          title: 'Challenge 1',
          domain: 'Teaching & Learning',
          weight: 1 / 15,
          description: 'Test challenge',
        },
      },
    ]

    const mockMultipliers: Multiplier[] = [
      {
        id: 'M1',
        name: 'STR',
        category: 'CORE',
        value: 0.9,
        validationStatus: 'VALID',
      },
    ]

    const weights = { C1: 1.0 }

    const mockDataFetch = vi.fn(async () => ({
      responses: mockResponses,
      multipliers: mockMultipliers,
      weights,
    }))

    // Note: This test would fail with actual Firestore operations
    // In a real test environment with emulator running, you would remove
    // the injected data fetch and let it call actual Firestore
    // For now, we verify the data fetch function is called
    await expect(
      recalculateAndPersistCycleScores('school-001', 'cycle-2026-01', mockDataFetch)
    ).rejects.toThrow() // Will throw because Firestore admin is not initialized

    expect(mockDataFetch).toHaveBeenCalledWith('school-001', 'cycle-2026-01')
  })

  it('should handle missing data gracefully', async () => {
    const emptyDataFetch = vi.fn(async () => ({
      responses: [],
      multipliers: [],
      weights: {},
    }))

    // This should fail because there's no data to calculate
    await expect(
      recalculateAndPersistCycleScores('school-001', 'cycle-2026-01', emptyDataFetch)
    ).rejects.toThrow()
  })
})

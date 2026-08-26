/**
 * Adapter type conversion tests
 */

import { describe, it, expect } from 'vitest'
import { Timestamp } from 'firebase-admin/firestore'
import {
  firestoreTimestampToDate,
  toCalcChallengeResponse,
  toCalcMultiplier,
  validateChallengeResponse,
  validateMultiplier,
} from '../adapters'

describe('Adapters - Firestore Type Conversions', () => {
  it('should convert Firestore Timestamp to Date', () => {
    const now = new Date()
    const ts = Timestamp.fromDate(now)
    const result = firestoreTimestampToDate(ts)

    expect(result).toBeInstanceOf(Date)
    expect(result?.getTime()).toBe(now.getTime())
  })

  it('should return undefined for null Timestamp', () => {
    const result = firestoreTimestampToDate(undefined)
    expect(result).toBeUndefined()
  })

  it('should convert challenge response doc to calculation type', () => {
    const doc = {
      id: 'resp-001',
      challengeId: 'C1',
      responderId: 'teacher-001',
      role: 'TEACHER',
      email: 'teacher@school.com',
      schoolId: 'school-001',
      cycleId: 'cycle-2026-01',
      responses: { q1: { selectedOption: 8, maxOption: 10 } },
      challenge: {
        title: 'Teaching Quality',
        domain: 'Teaching & Learning',
        weight: 1 / 15,
        description: 'Assessment of teaching excellence',
      },
      submittedAt: Timestamp.now(),
    }

    const result = toCalcChallengeResponse(doc, 'C1')

    expect(result.id).toBe('resp-001')
    expect(result.challengeId).toBe('C1')
    expect(result.responderId).toBe('teacher-001')
    expect(result.role).toBe('TEACHER')
    expect(result.responses).toEqual(doc.responses)
    expect(result.submittedAt).toBeInstanceOf(Date)
  })

  it('should convert multiplier doc to calculation type', () => {
    const doc = {
      id: 'M1',
      name: 'STR',
      category: 'CORE',
      value: 0.85,
      validationStatus: 'VALID',
      updatedAt: Timestamp.now(),
    }

    const result = toCalcMultiplier(doc)

    expect(result.id).toBe('M1')
    expect(result.name).toBe('STR')
    expect(result.value).toBe(0.85)
    expect(result.validationStatus).toBe('VALID')
  })

  it('should validate challenge response', () => {
    const validResponse = {
      challengeId: 'C1',
      responderId: 'resp-001',
      schoolId: 'school-001',
      cycleId: 'cycle-2026-01',
      responses: { q1: { selectedOption: 8 } },
    }

    const result = validateChallengeResponse(validResponse)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject response with missing challengeId', () => {
    const invalidResponse = {
      responderId: 'resp-001',
      schoolId: 'school-001',
      cycleId: 'cycle-2026-01',
      responses: {},
    }

    const result = validateChallengeResponse(invalidResponse)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing challengeId')
  })

  it('should validate multiplier', () => {
    const validMultiplier = {
      id: 'M1',
      value: 0.85,
    }

    const result = validateMultiplier(validMultiplier)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject multiplier with out-of-range value', () => {
    const invalidMultiplier = {
      id: 'M1',
      value: 2.5, // > 1.5
    }

    const result = validateMultiplier(invalidMultiplier)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('out of range'))).toBe(true)
  })
})

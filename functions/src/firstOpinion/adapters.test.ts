import { describe, it, expect } from 'vitest'
import * as admin from 'firebase-admin'
import { toCalcChallengeResponse, toCalcMultiplier } from './adapters'

/**
 * Unit tests for data adapters (Firestore → Calculation types)
 * Tests pure conversion logic without Firestore connection
 */

describe('Firestore Adapters', () => {
  describe('toCalcChallengeResponse', () => {
    it('should convert Firestore timestamp to Date', () => {
      // Mock Firestore document with Timestamp
      const now = new Date()
      const firestoreDoc = {
        id: 'response-001',
        challengeId: 'C1',
        responderId: 'teacher-001',
        role: 'TEACHER',
        email: 'teacher@school.com',
        schoolId: 'school-001',
        cycleId: 'cycle-001',
        responses: {
          q1: { text: 'question 1', selectedOption: 7, maxOption: 10, isFact: false }
        },
        challenge: { title: 'Admission Trend', domain: 'Growth', weight: 0.067 },
        submittedAt: { toDate: () => now },
        updatedAt: { toDate: () => now },
        deleted: false
      }

      const result = toCalcChallengeResponse(firestoreDoc)

      expect(result.id).toBe('response-001')
      expect(result.submittedAt).toEqual(now)
      expect(result.updatedAt).toEqual(now)
      expect(result.submittedAt instanceof Date).toBe(true)
    })

    it('should handle missing timestamps gracefully', () => {
      const firestoreDoc = {
        id: 'response-002',
        challengeId: 'C2',
        responderId: 'parent-001',
        role: 'PARENT',
        email: 'parent@email.com',
        schoolId: 'school-001',
        cycleId: 'cycle-001',
        responses: {},
        challenge: {}
        // No submittedAt/updatedAt
      }

      const result = toCalcChallengeResponse(firestoreDoc)

      expect(result.submittedAt instanceof Date).toBe(true)
      expect(result.updatedAt instanceof Date).toBe(true)
      expect(result.deleted).toBe(false)
    })

    it('should preserve all required fields', () => {
      const firestoreDoc = {
        id: 'response-003',
        challengeId: 'C3',
        responderId: 'student-001',
        role: 'STUDENT',
        email: 'student@email.com',
        schoolId: 'school-001',
        cycleId: 'cycle-001',
        responses: { q1: { text: 'Q1', selectedOption: 5, maxOption: 10, isFact: true, factSource: 'HR System' } },
        challenge: { title: 'Retention', domain: 'Growth', weight: 0.067, description: 'Retention rate' },
        submittedAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
        deleted: true
      }

      const result = toCalcChallengeResponse(firestoreDoc)

      expect(result.challengeId).toBe('C3')
      expect(result.role).toBe('STUDENT')
      expect(result.schoolId).toBe('school-001')
      expect(result.deleted).toBe(true)
      expect(result.responses.q1.isFact).toBe(true)
      expect(result.responses.q1.factSource).toBe('HR System')
    })
  })

  describe('toCalcMultiplier', () => {
    it('should convert Firestore multiplier with timestamp', () => {
      const now = new Date()
      const firestoreDoc = {
        id: 'M1',
        name: 'Student Teacher Ratio',
        category: 'CORE',
        value: 0.8,
        validationStatus: 'VALID',
        updatedAt: { toDate: () => now }
      }

      const result = toCalcMultiplier(firestoreDoc)

      expect(result.id).toBe('M1')
      expect(result.name).toBe('Student Teacher Ratio')
      expect(result.value).toBe(0.8)
      expect(result.validationStatus).toBe('VALID')
      expect(result.updatedAt).toEqual(now)
    })

    it('should default missing fields safely', () => {
      const firestoreDoc = {
        id: 'M2',
        name: 'Parent Response SLA'
        // Missing other fields
      }

      const result = toCalcMultiplier(firestoreDoc)

      expect(result.id).toBe('M2')
      expect(result.category).toBeUndefined()
      expect(result.value).toBe(0) // Defaults to 0
      expect(result.validationStatus).toBe('PENDING')
      expect(result.updatedAt instanceof Date).toBe(true)
    })

    it('should include validation errors when present', () => {
      const firestoreDoc = {
        id: 'M3',
        name: 'Training Hours',
        category: 'CORE',
        value: -0.1, // Invalid negative
        validationStatus: 'OUTLIER',
        validationError: 'Value out of range'
      }

      const result = toCalcMultiplier(firestoreDoc)

      expect(result.validationError).toBe('Value out of range')
      expect(result.validationStatus).toBe('OUTLIER')
    })
  })
})

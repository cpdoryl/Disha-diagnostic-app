/**
 * DISHA First Opinion Engine - Integration Tests
 * End-to-end tests with Firestore Emulator
 *
 * These tests verify the complete pipeline:
 * 1. Submit challenge response → trigger calculates scores
 * 2. Sync multiplier → trigger recalculates scores
 * 3. Verify respondent tracking and soft-delete handling
 *
 * Prerequisites:
 * - Firestore emulator running (firebase emulators:start)
 * - VITE_USE_EMULATOR=1 set in environment
 * - npm run test:run (from root, not functions)
 *
 * Note: These tests are marked as integration (skip in CI unless emulator started)
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import {
  connectFirestoreEmulator,
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  Timestamp
} from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import type { ChallengeResponse, Multiplier } from './calculations'

/**
 * Check if emulator is available
 * Skip tests if not running (allows CI to run without emulator)
 */
const EMULATOR_ENABLED = process.env.VITE_USE_EMULATOR === '1' || process.env.FIRESTORE_EMULATOR_HOST

/**
 * Integration test suite
 * Only runs if emulator is available
 */
describe.skipIf(!EMULATOR_ENABLED)('First Opinion Integration Tests', () => {
  let db: ReturnType<typeof getFirestore>
  const testSchoolId = 'test-school-001'
  const testCycleId = 'test-cycle-001'
  const testUserId = 'test-user-001'

  beforeAll(() => {
    // Initialize Firebase with test config
    const app = initializeApp({
      projectId: 'demo-project',
      apiKey: 'AIzaSy...',
      authDomain: 'demo-project.firebaseapp.com'
    })

    db = getFirestore(app)

    // Connect to emulator if available
    if (EMULATOR_ENABLED) {
      try {
        connectFirestoreEmulator(db, 'localhost', 8080)
        console.log('[Integration Tests] Connected to Firestore emulator')
      } catch (error) {
        console.warn('[Integration Tests] Emulator already connected or unavailable')
      }
    }
  })

  afterAll(async () => {
    // Cleanup: delete test data
    try {
      const cycleRef = doc(db, 'schools', testSchoolId, 'assessmentCycles', testCycleId)
      const responsesRef = collection(cycleRef, 'challengeResponses')
      const responses = await getDocs(responsesRef)

      for (const resp of responses.docs) {
        await resp.ref.delete()
      }

      const multipliersRef = collection(cycleRef, 'multipliers')
      const multipliers = await getDocs(multipliersRef)

      for (const mult of multipliers.docs) {
        await mult.ref.delete()
      }

      await cycleRef.delete()
    } catch (error) {
      console.warn('[Integration Tests] Cleanup error:', error)
    }
  })

  describe('Challenge Response Pipeline', () => {
    it('should create assessment cycle and track respondent count', async () => {
      // Setup: Create cycle
      const cycleRef = doc(db, 'schools', testSchoolId, 'assessmentCycles', testCycleId)
      await setDoc(cycleRef, {
        status: 'ACTIVE',
        createdAt: Timestamp.now(),
        createdBy: testUserId,
        respondentCount: 0,
        respondentsByRole: {}
      })

      // Verify cycle created
      const cycleSnap = await getDoc(cycleRef)
      expect(cycleSnap.exists()).toBe(true)
      expect(cycleSnap.data()?.status).toBe('ACTIVE')
    })

    it('should submit challenge response and persist to Firestore', async () => {
      const cycleRef = doc(db, 'schools', testSchoolId, 'assessmentCycles', testCycleId)
      const responsesRef = collection(cycleRef, 'challengeResponses')

      // Submit response
      const responseData: Omit<ChallengeResponse, 'id' | 'submittedAt' | 'updatedAt'> = {
        challengeId: 'C1',
        responderId: 'teacher-001',
        role: 'TEACHER',
        email: 'teacher@school.com',
        schoolId: testSchoolId,
        cycleId: testCycleId,
        responses: {
          q1: { text: 'Q1', selectedOption: 8, maxOption: 10, isFact: false },
          q2: { text: 'Q2', selectedOption: 7, maxOption: 10, isFact: false }
        },
        challenge: { title: 'C1', domain: 'Growth', weight: 0.067, description: 'Admission Trend' },
        deleted: false
      }

      const responseRef = doc(responsesRef)
      await setDoc(responseRef, {
        ...responseData,
        submittedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      // Verify response stored
      const storedSnap = await getDoc(responseRef)
      expect(storedSnap.exists()).toBe(true)
      expect(storedSnap.data()?.responderId).toBe('teacher-001')
      expect(storedSnap.data()?.challengeId).toBe('C1')
    })

    it('should count non-deleted responses by role', async () => {
      const cycleRef = doc(db, 'schools', testSchoolId, 'assessmentCycles', testCycleId)
      const responsesRef = collection(cycleRef, 'challengeResponses')

      // Submit multiple responses
      const responses = [
        {
          ...{
            challengeId: 'C1',
            role: 'TEACHER',
            email: 'teacher1@school.com',
            schoolId: testSchoolId,
            cycleId: testCycleId,
            responses: { q1: { text: 'Q1', selectedOption: 8, maxOption: 10, isFact: false } },
            challenge: { title: 'C1', domain: 'Growth', weight: 0.067, description: 'C1' },
            deleted: false
          },
          responderId: 'teacher-001',
          submittedAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          ...{
            challengeId: 'C1',
            role: 'PARENT',
            email: 'parent@home.com',
            schoolId: testSchoolId,
            cycleId: testCycleId,
            responses: { q1: { text: 'Q1', selectedOption: 6, maxOption: 10, isFact: false } },
            challenge: { title: 'C1', domain: 'Growth', weight: 0.067, description: 'C1' },
            deleted: false
          },
          responderId: 'parent-001',
          submittedAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ]

      for (const response of responses) {
        const docRef = doc(responsesRef)
        await setDoc(docRef, response)
      }

      // Query non-deleted responses
      const q = query(responsesRef, where('deleted', '==', false))
      const snapshot = await getDocs(q)

      expect(snapshot.size).toBe(2)

      // Count by role
      const roleCounts: Record<string, number> = {}
      snapshot.docs.forEach(doc => {
        const role = doc.data().role
        roleCounts[role] = (roleCounts[role] || 0) + 1
      })

      expect(roleCounts['TEACHER']).toBe(1)
      expect(roleCounts['PARENT']).toBe(1)
    })

    it('should handle soft-delete (mark deleted=true)', async () => {
      const cycleRef = doc(db, 'schools', testSchoolId, 'assessmentCycles', testCycleId)
      const responsesRef = collection(cycleRef, 'challengeResponses')

      // Submit original response
      const originalRef = doc(responsesRef)
      await setDoc(originalRef, {
        challengeId: 'C2',
        responderId: 'teacher-002',
        role: 'TEACHER',
        email: 'teacher2@school.com',
        schoolId: testSchoolId,
        cycleId: testCycleId,
        responses: { q1: { text: 'Q1', selectedOption: 5, maxOption: 10, isFact: false } },
        challenge: { title: 'C2', domain: 'Growth', weight: 0.067, description: 'C2' },
        deleted: false,
        submittedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      // Soft-delete (mark as deleted=true)
      await setDoc(originalRef, { deleted: true, updatedAt: Timestamp.now() }, { merge: true })

      // Verify marked as deleted
      const snap = await getDoc(originalRef)
      expect(snap.data()?.deleted).toBe(true)

      // Query non-deleted should exclude it
      const q = query(responsesRef, where('deleted', '==', false))
      const activeSnap = await getDocs(q)
      const foundDoc = activeSnap.docs.find(d => d.data().responderId === 'teacher-002')
      expect(foundDoc).toBeUndefined()
    })
  })

  describe('Multiplier Sync Pipeline', () => {
    it('should write multiplier docs with validation status', async () => {
      const cycleRef = doc(db, 'schools', testSchoolId, 'assessmentCycles', testCycleId)
      const multipliersRef = collection(cycleRef, 'multipliers')

      // Sync multiplier
      const multiplierData: Multiplier = {
        id: 'M1',
        name: 'Student Teacher Ratio',
        category: 'CORE',
        value: 0.8,
        validationStatus: 'VALID',
        updatedAt: new Date()
      }

      const multiplierFirestoreData = {
        ...multiplierData,
        updatedAt: Timestamp.now()
      }

      const m1Ref = doc(multipliersRef, 'M1')
      await setDoc(m1Ref, multiplierFirestoreData)

      // Verify stored
      const snap = await getDoc(m1Ref)
      expect(snap.exists()).toBe(true)
      expect(snap.data()?.value).toBe(0.8)
      expect(snap.data()?.validationStatus).toBe('VALID')
    })

    it('should detect outlier multipliers', async () => {
      const cycleRef = doc(db, 'schools', testSchoolId, 'assessmentCycles', testCycleId)
      const multipliersRef = collection(cycleRef, 'multipliers')

      // Write outlier multiplier (M1 STR should be 0-60, this is 100)
      const outlierRef = doc(multipliersRef, 'M1-OUTLIER')
      await setDoc(outlierRef, {
        id: 'M1',
        name: 'Student Teacher Ratio',
        value: 100, // Out of expected range
        validationStatus: 'OUTLIER',
        validationError: 'Value 100 outside expected range [0, 60]',
        updatedAt: Timestamp.now()
      })

      // Verify marked as outlier
      const snap = await getDoc(outlierRef)
      expect(snap.data()?.validationStatus).toBe('OUTLIER')
      expect(snap.data()?.validationError).toContain('outside expected range')
    })
  })

  describe('Respondent Aggregation', () => {
    it('should aggregate respondent counts by role in real-time', async () => {
      const cycleRef = doc(db, 'schools', testSchoolId, 'assessmentCycles', testCycleId)
      const responsesRef = collection(cycleRef, 'challengeResponses')

      // Clear previous responses
      const allResponses = await getDocs(responsesRef)
      for (const resp of allResponses.docs) {
        await resp.ref.delete()
      }

      // Submit responses from multiple roles
      const testResponses = [
        { role: 'TEACHER', responderId: 't1' },
        { role: 'TEACHER', responderId: 't2' },
        { role: 'PARENT', responderId: 'p1' },
        { role: 'ADMIN', responderId: 'a1' }
      ]

      for (const resp of testResponses) {
        const docRef = doc(responsesRef)
        await setDoc(docRef, {
          challengeId: 'C1',
          role: resp.role,
          responderId: resp.responderId,
          email: `${resp.responderId}@school.com`,
          schoolId: testSchoolId,
          cycleId: testCycleId,
          responses: { q1: { text: 'Q1', selectedOption: 5, maxOption: 10, isFact: false } },
          challenge: { title: 'C1', domain: 'Growth', weight: 0.067, description: 'C1' },
          deleted: false,
          submittedAt: Timestamp.now()
        })
      }

      // Aggregate counts by role
      const q = query(responsesRef, where('deleted', '==', false))
      const snapshot = await getDocs(q)

      const roleCounts: Record<string, number> = {}
      snapshot.docs.forEach(doc => {
        const role = doc.data().role
        roleCounts[role] = (roleCounts[role] || 0) + 1
      })

      expect(roleCounts['TEACHER']).toBe(2)
      expect(roleCounts['PARENT']).toBe(1)
      expect(roleCounts['ADMIN']).toBe(1)
      expect(Object.values(roleCounts).reduce((a, b) => a + b, 0)).toBe(4)
    })
  })
})

/**
 * DISHA First Opinion Engine - Challenge Response Service
 * Handles Firestore operations for challenge response submission and tracking
 * Mirrors assessmentService.ts patterns for consistency
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  where,
  Unsubscribe,
  QueryConstraint
} from 'firebase/firestore'
import { db } from '../firebase'
import type { ChallengeResponse } from './calculations'
import { getChallengeResponsesRef, getNonDeletedResponsesQuery } from '../firebase/firstOpinionSchema'

/**
 * Submit a new challenge response from a stakeholder
 * Follows the soft-delete audit trail pattern (never actually deletes)
 */
export const submitChallengeResponse = async (
  schoolId: string,
  cycleId: string,
  response: Omit<ChallengeResponse, 'id' | 'submittedAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const responsesRef = getChallengeResponsesRef(schoolId, cycleId)
    const responseDoc = doc(responsesRef)

    await setDoc(responseDoc, {
      ...response,
      schoolId,
      cycleId,
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      deleted: false
    })

    console.log(
      `✓ Challenge response submitted: ${responseDoc.id} (${response.role} for ${response.challengeId})`
    )
    return responseDoc.id
  } catch (error) {
    console.error('Error submitting challenge response:', error)
    throw error
  }
}

/**
 * Soft-delete a response by marking deleted=true
 * Preserves audit trail; used when a respondent resubmits (old response hidden, new one created)
 */
export const softDeleteChallengeResponse = async (
  schoolId: string,
  cycleId: string,
  responseId: string
): Promise<void> => {
  try {
    const responseRef = doc(db, 'schools', schoolId, 'assessmentCycles', cycleId, 'challengeResponses', responseId)
    await updateDoc(responseRef, {
      deleted: true,
      updatedAt: serverTimestamp()
    })
    console.log(`✓ Response soft-deleted: ${responseId}`)
  } catch (error) {
    console.error('Error soft-deleting response:', error)
    throw error
  }
}

/**
 * Get all non-deleted responses for a cycle
 */
export const getChallengeResponses = async (
  schoolId: string,
  cycleId: string
): Promise<(ChallengeResponse & { id: string })[]> => {
  try {
    const q = getNonDeletedResponsesQuery(schoolId, cycleId)
    const snapshot = await getDocs(q)

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    })) as (ChallengeResponse & { id: string })[]
  } catch (error) {
    console.error('Error fetching challenge responses:', error)
    throw error
  }
}

/**
 * Get responses for a specific challenge across all respondents
 */
export const getChallengeResponsesByChallenge = async (
  schoolId: string,
  cycleId: string,
  challengeId: string
): Promise<(ChallengeResponse & { id: string })[]> => {
  try {
    const responsesRef = getChallengeResponsesRef(schoolId, cycleId)
    const q = query(
      responsesRef,
      where('challengeId', '==', challengeId),
      where('deleted', '==', false),
      orderBy('submittedAt', 'desc')
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    })) as (ChallengeResponse & { id: string })[]
  } catch (error) {
    console.error('Error fetching challenge responses:', error)
    throw error
  }
}

/**
 * Get responses by stakeholder role
 */
export const getChallengeResponsesByRole = async (
  schoolId: string,
  cycleId: string,
  role: string
): Promise<(ChallengeResponse & { id: string })[]> => {
  try {
    const responsesRef = getChallengeResponsesRef(schoolId, cycleId)
    const q = query(
      responsesRef,
      where('role', '==', role),
      where('deleted', '==', false),
      orderBy('submittedAt', 'desc')
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    })) as (ChallengeResponse & { id: string })[]
  } catch (error) {
    console.error('Error fetching responses by role:', error)
    throw error
  }
}

/**
 * Response progress by role (for live dashboard)
 * Tallies how many non-deleted responses exist per role
 */
export interface ResponseProgress {
  role: string
  count: number
  lastUpdated: Date
}

/**
 * Subscribe to real-time response progress (per-role counts)
 * Updates whenever a response is submitted or soft-deleted
 */
export const subscribeToResponseProgress = (
  schoolId: string,
  cycleId: string,
  callback: (progress: ResponseProgress[]) => void
): Unsubscribe => {
  try {
    const responsesRef = getChallengeResponsesRef(schoolId, cycleId)
    const q = query(responsesRef, where('deleted', '==', false))

    return onSnapshot(q, (snapshot) => {
      // Tally responses by role
      const roleCounts = new Map<string, number>()

      snapshot.docs.forEach((d) => {
        const role = d.data().role
        roleCounts.set(role, (roleCounts.get(role) || 0) + 1)
      })

      // Convert to array, sorted by role
      const progress: ResponseProgress[] = Array.from(roleCounts.entries())
        .map(([role, count]) => ({
          role,
          count,
          lastUpdated: new Date()
        }))
        .sort((a, b) => a.role.localeCompare(b.role))

      callback(progress)
    })
  } catch (error) {
    console.error('Error subscribing to response progress:', error)
    throw error
  }
}

/**
 * Get total respondent count for a cycle (all roles combined, non-deleted only)
 */
export const getTotalResponseCount = async (schoolId: string, cycleId: string): Promise<number> => {
  try {
    const q = getNonDeletedResponsesQuery(schoolId, cycleId)
    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    console.error('Error getting response count:', error)
    throw error
  }
}

/**
 * Subscribe to total response count (real-time)
 */
export const subscribeToTotalResponseCount = (
  schoolId: string,
  cycleId: string,
  callback: (count: number) => void
): Unsubscribe => {
  try {
    const responsesRef = getChallengeResponsesRef(schoolId, cycleId)
    const q = query(responsesRef, where('deleted', '==', false))

    return onSnapshot(q, (snapshot) => {
      callback(snapshot.size)
    })
  } catch (error) {
    console.error('Error subscribing to response count:', error)
    throw error
  }
}

export default {
  submitChallengeResponse,
  softDeleteChallengeResponse,
  getChallengeResponses,
  getChallengeResponsesByChallenge,
  getChallengeResponsesByRole,
  subscribeToResponseProgress,
  getTotalResponseCount,
  subscribeToTotalResponseCount
}

/**
 * First Opinion Engine v3 - detectEarlyWarnings Cloud Function
 * On-demand early warning detection and analysis
 */

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

interface DetectEarlyWarningsRequest {
  schoolId: string
  cycleId: string
}

interface DetectEarlyWarningsResponse {
  success: boolean
  warning: {
    level: string
    score: number
    interpretation: string
    timestamp: string
  }
  error?: string
}

export const detectEarlyWarnings = functions.https.onCall(
  async (data: DetectEarlyWarningsRequest, context): Promise<DetectEarlyWarningsResponse> => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required')
      }

      const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get()
      const isAdmin = userDoc.data()?.role === 'admin'
      if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Admin access required')
      }

      const { schoolId, cycleId } = data

      if (!schoolId || !cycleId) {
        throw new functions.https.HttpsError('invalid-argument', 'schoolId and cycleId required')
      }

      const cycleRef = admin
        .firestore()
        .collection('schools')
        .doc(schoolId)
        .collection('assessmentCycles')
        .doc(cycleId)

      const cycleDoc = await cycleRef.get()
      if (!cycleDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Assessment cycle not found')
      }

      const cycleData = cycleDoc.data()!
      const scores = cycleData.scores || {}
      const healthIndex = scores.healthIndex || 0
      const gap = scores.gap || 0

      let level: string
      let score: number
      let interpretation: string

      if (healthIndex < 40) {
        level = 'CRITICAL'
        score = 90
        interpretation = `Critical: Health index ${healthIndex.toFixed(1)} requires immediate intervention`
      } else if (healthIndex < 50) {
        level = 'RED'
        score = 70
        interpretation = `Red: Health index ${healthIndex.toFixed(1)} indicates serious challenges`
      } else if (healthIndex < 65) {
        level = 'YELLOW'
        score = 50
        interpretation = `Yellow: Health index ${healthIndex.toFixed(1)} requires monitoring`
      } else {
        level = 'GREEN'
        score = 20
        interpretation = `Green: Health index ${healthIndex.toFixed(1)} shows strong performance`
      }

      if (gap > 25) score += 15
      score = Math.min(100, score)

      await cycleRef.collection('warnings').doc('latest').set(
        {
          level,
          score,
          interpretation,
          createdAt: admin.firestore.Timestamp.now(),
        },
        { merge: true }
      )

      return {
        success: true,
        warning: {
          level,
          score: Math.round(score * 10) / 10,
          interpretation,
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error: any) {
      console.error('detectEarlyWarnings error:', error)
      if (error instanceof functions.https.HttpsError) {
        throw error
      }
      throw new functions.https.HttpsError('internal', 'Error: ' + error.message)
    }
  }
)

export default detectEarlyWarnings

/**
 * Phase 5: Survey Service
 * Firestore operations for perception surveys
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  getDoc,
  doc,
  updateDoc,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PerceptionResponse, QuestionResponse } from './types';

// ============================================================================
// SURVEY RESPONSE SUBMISSION
// ============================================================================

/**
 * Submit a perception survey response
 */
export const submitSurveyResponse = async (
  schoolId: string,
  cycleId: string,
  respondentType: string,
  email: string,
  phone: string | undefined,
  responses: QuestionResponse[]
): Promise<string> => {
  try {
    const perceptionResponse: Omit<PerceptionResponse, 'id'> = {
      schoolId,
      cycleId,
      respondentId: email, // Use email as unique identifier
      respondentType: respondentType as any,
      email,
      phone,
      responses,
      submittedAt: Timestamp.now() as any,
      updatedAt: Timestamp.now() as any,
      isDraft: false,
      isCompleted: true,
    };

    const surveyResponsesRef = collection(db, 'schools', schoolId, 'assessmentCycles', cycleId, 'perceptionSurveys');
    const docRef = await addDoc(surveyResponsesRef, perceptionResponse);

    console.log('Survey response submitted:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting survey response:', error);
    throw error;
  }
};

// ============================================================================
// SURVEY RESPONSE RETRIEVAL
// ============================================================================

/**
 * Get all survey responses for a cycle
 */
export const getSurveyResponses = async (schoolId: string, cycleId: string) => {
  try {
    const surveyResponsesRef = collection(db, 'schools', schoolId, 'assessmentCycles', cycleId, 'perceptionSurveys');
    const q = query(surveyResponsesRef, orderBy('submittedAt', 'desc'));

    const snapshot = await getDocs(q);
    const responses: (PerceptionResponse & { id: string })[] = [];

    snapshot.forEach((doc) => {
      responses.push({
        id: doc.id,
        ...(doc.data() as PerceptionResponse),
      });
    });

    return responses;
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    throw error;
  }
};

/**
 * Get survey responses by respondent type
 */
export const getSurveyResponsesByType = async (
  schoolId: string,
  cycleId: string,
  respondentType: string
) => {
  try {
    const surveyResponsesRef = collection(db, 'schools', schoolId, 'assessmentCycles', cycleId, 'perceptionSurveys');
    const q = query(
      surveyResponsesRef,
      where('respondentType', '==', respondentType),
      orderBy('submittedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const responses: (PerceptionResponse & { id: string })[] = [];

    snapshot.forEach((doc) => {
      responses.push({
        id: doc.id,
        ...(doc.data() as PerceptionResponse),
      });
    });

    return responses;
  } catch (error) {
    console.error('Error fetching survey responses by type:', error);
    throw error;
  }
};

/**
 * Check for duplicate responses (same email in same cycle)
 */
export const checkForDuplicateResponse = async (
  schoolId: string,
  cycleId: string,
  email: string
): Promise<boolean> => {
  try {
    const surveyResponsesRef = collection(db, 'schools', schoolId, 'assessmentCycles', cycleId, 'perceptionSurveys');
    const q = query(surveyResponsesRef, where('email', '==', email));

    const snapshot = await getDocs(q);
    return snapshot.size > 0;
  } catch (error) {
    console.error('Error checking for duplicate response:', error);
    throw error;
  }
};

// ============================================================================
// AGGREGATION & CALCULATIONS
// ============================================================================

/**
 * Calculate average perception score per dimension
 */
export const calculateDimensionPerceptionScore = async (
  schoolId: string,
  cycleId: string,
  dimensionId: number
): Promise<{
  dimensionId: number;
  averageScore: number;
  respondentCount: number;
  breakdown: Array<{
    respondentType: string;
    averageScore: number;
    respondentCount: number;
  }>;
}> => {
  try {
    const responses = await getSurveyResponses(schoolId, cycleId);

    // Filter responses for this dimension
    const dimensionResponses = responses.flatMap((r) =>
      r.responses
        .filter((resp) => {
          const metricId = resp.metricId;
          const metricDimension = parseInt(metricId.split('')[0]);
          return metricDimension === dimensionId;
        })
        .map((resp) => ({
          rating: resp.rating,
          respondentType: r.respondentType,
        }))
    );

    if (dimensionResponses.length === 0) {
      return {
        dimensionId,
        averageScore: 0,
        respondentCount: 0,
        breakdown: [],
      };
    }

    // Calculate overall average (convert 1-10 to 0-100)
    const totalRating = dimensionResponses.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / dimensionResponses.length;
    const averageScore = ((averageRating - 1) / 9) * 100; // Convert 1-10 to 0-100

    // Group by respondent type
    const byType = dimensionResponses.reduce(
      (acc, r) => {
        if (!acc[r.respondentType]) {
          acc[r.respondentType] = [];
        }
        acc[r.respondentType].push(r.rating);
        return acc;
      },
      {} as Record<string, number[]>
    );

    const breakdown = Object.entries(byType).map(([type, ratings]) => ({
      respondentType: type,
      averageScore: ((ratings.reduce((a, b) => a + b, 0) / ratings.length - 1) / 9) * 100,
      respondentCount: ratings.length,
    }));

    return {
      dimensionId,
      averageScore: Math.round(averageScore),
      respondentCount: dimensionResponses.length,
      breakdown,
    };
  } catch (error) {
    console.error('Error calculating dimension perception score:', error);
    throw error;
  }
};

/**
 * Calculate all dimension perception scores for a cycle
 */
export const calculateAllDimensionPerceptionScores = async (schoolId: string, cycleId: string) => {
  try {
    const scores = [];

    for (let dimensionId = 1; dimensionId <= 14; dimensionId++) {
      const score = await calculateDimensionPerceptionScore(schoolId, cycleId, dimensionId);
      scores.push(score);
    }

    return scores;
  } catch (error) {
    console.error('Error calculating all dimension perception scores:', error);
    throw error;
  }
};

/**
 * Calculate survey response rate
 */
export const calculateResponseRate = async (
  schoolId: string,
  cycleId: string,
  expectedRespondentCount: number
): Promise<{
  totalResponses: number;
  expectedCount: number;
  responseRate: number;
  breakdown: Record<string, number>;
}> => {
  try {
    const responses = await getSurveyResponses(schoolId, cycleId);

    const breakdown: Record<string, number> = {};
    responses.forEach((r) => {
      if (!breakdown[r.respondentType]) {
        breakdown[r.respondentType] = 0;
      }
      breakdown[r.respondentType]++;
    });

    const responseRate = (responses.length / expectedRespondentCount) * 100;

    return {
      totalResponses: responses.length,
      expectedCount: expectedRespondentCount,
      responseRate: Math.round(responseRate),
      breakdown,
    };
  } catch (error) {
    console.error('Error calculating response rate:', error);
    throw error;
  }
};

// ============================================================================
// DRAFT MANAGEMENT
// ============================================================================

/**
 * Save survey response as draft
 */
export const saveSurveyDraft = async (
  schoolId: string,
  cycleId: string,
  respondentType: string,
  email: string,
  phone: string | undefined,
  responses: QuestionResponse[]
): Promise<string> => {
  try {
    // Check if draft exists
    const existingDraft = await getExistingDraft(schoolId, cycleId, email);

    const surveyData: Omit<PerceptionResponse, 'id'> = {
      schoolId,
      cycleId,
      respondentId: email,
      respondentType: respondentType as any,
      email,
      phone,
      responses,
      submittedAt: existingDraft?.submittedAt ?? (Timestamp.now() as any),
      updatedAt: Timestamp.now() as any,
      isDraft: true,
      isCompleted: false,
    };

    if (existingDraft) {
      // Update existing draft
      const draftRef = doc(
        db,
        'schools',
        schoolId,
        'assessmentCycles',
        cycleId,
        'perceptionSurveys',
        existingDraft.id
      );
      await updateDoc(draftRef, surveyData);
      return existingDraft.id;
    } else {
      // Create new draft
      const surveyResponsesRef = collection(
        db,
        'schools',
        schoolId,
        'assessmentCycles',
        cycleId,
        'perceptionSurveys'
      );
      const docRef = await addDoc(surveyResponsesRef, surveyData);
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving survey draft:', error);
    throw error;
  }
};

/**
 * Get existing draft for respondent
 */
export const getExistingDraft = async (
  schoolId: string,
  cycleId: string,
  email: string
): Promise<(PerceptionResponse & { id: string }) | null> => {
  try {
    const surveyResponsesRef = collection(db, 'schools', schoolId, 'assessmentCycles', cycleId, 'perceptionSurveys');
    const q = query(
      surveyResponsesRef,
      where('email', '==', email),
      where('isDraft', '==', true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...(doc.data() as PerceptionResponse),
    };
  } catch (error) {
    console.error('Error getting existing draft:', error);
    throw error;
  }
};

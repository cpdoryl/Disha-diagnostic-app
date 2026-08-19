/**
 * Assessment Service - Stage 2: Comprehensive 14D Assessment
 * Handles all Firestore operations for assessments and responses
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
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { logAuditEvent } from './auditService';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export interface AssessmentMetadata {
  assessmentName: string;
  description?: string;
  createdBy: string;
  schoolId: string;
  expectedRespondents: {
    teacher?: number;
    parent?: number;
    student?: number;
    admin?: number;
    other?: number;
  };
  surveyEndDate?: Date;
}

export interface RespondentResponse {
  respondentType: 'teacher' | 'parent' | 'student' | 'admin' | 'other';
  respondentEmail: string;
  respondentName: string;
  respondentId?: string;
  answers: Record<string, number>; // D1-D14 scores
  feedback?: string;
  schoolId: string;
}

/**
 * Create assessment with metadata
 */
export const createAssessment = async (
  schoolId: string,
  assessmentData: AssessmentMetadata
): Promise<string> => {
  try {
    const assessmentRef = doc(collection(db, 'schools', schoolId, 'assessments'));

    // Generate unique survey link
    const surveyLink = `${window.location.origin}?assessment=${assessmentRef.id}&school=${schoolId}`;

    await setDoc(assessmentRef, {
      assessmentName: assessmentData.assessmentName,
      description: assessmentData.description || '',
      createdBy: assessmentData.createdBy,
      createdAt: serverTimestamp(),
      status: 'ACTIVE',
      expectedRespondents: assessmentData.expectedRespondents || {},
      surveyLink: surveyLink,
      surveyEndDate: assessmentData.surveyEndDate
        ? new Date(assessmentData.surveyEndDate)
        : null,
      responseCount: 0,
      responsesByType: {
        teacher: 0,
        parent: 0,
        student: 0,
        admin: 0,
        other: 0
      }
    });

    console.log(`✓ Assessment created: ${assessmentRef.id}`);

    // Log audit event
    await logAuditEvent(
      schoolId,
      'ASSESSMENT_CREATED',
      'assessment',
      assessmentRef.id,
      assessmentData.createdBy
    );

    return assessmentRef.id;
  } catch (error) {
    console.error('Error creating assessment:', error);
    throw error;
  }
};

/**
 * Get assessment metadata
 */
export const getAssessment = async (
  schoolId: string,
  assessmentId: string
): Promise<any> => {
  try {
    const assessmentRef = doc(db, 'schools', schoolId, 'assessments', assessmentId);
    const snapshot = await getDoc(assessmentRef);

    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching assessment:', error);
    throw error;
  }
};

/**
 * Save response from respondent
 */
export const saveAssessmentResponse = async (
  schoolId: string,
  assessmentId: string,
  response: RespondentResponse
): Promise<string> => {
  try {
    const responseRef = doc(
      collection(db, 'schools', schoolId, 'assessments', assessmentId, 'responses')
    );

    await setDoc(responseRef, {
      respondentType: response.respondentType,
      respondentEmail: response.respondentEmail,
      respondentName: response.respondentName,
      respondentId: response.respondentId || null,
      answers: response.answers,
      feedback: response.feedback || '',
      schoolId: schoolId,
      submittedAt: serverTimestamp(),
      status: 'SUBMITTED'
    });

    // Update response count in assessment
    await updateAssessmentResponseCount(schoolId, assessmentId, response.respondentType);

    console.log(`✓ Response saved: ${responseRef.id}`);

    // Log audit event
    await logAuditEvent(
      schoolId,
      'ASSESSMENT_RESPONSE_SUBMITTED',
      'response',
      responseRef.id,
      response.respondentEmail
    );

    return responseRef.id;
  } catch (error) {
    console.error('Error saving response:', error);
    throw error;
  }
};

/**
 * Get all responses for an assessment
 */
export const getAssessmentResponses = async (
  schoolId: string,
  assessmentId: string
): Promise<any[]> => {
  try {
    const responsesRef = collection(
      db,
      'schools',
      schoolId,
      'assessments',
      assessmentId,
      'responses'
    );
    const q = query(responsesRef, orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching responses:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time response updates
 */
export const subscribeToResponseUpdates = (
  schoolId: string,
  assessmentId: string,
  callback: (responses: any[]) => void
): Unsubscribe => {
  try {
    const responsesRef = collection(
      db,
      'schools',
      schoolId,
      'assessments',
      assessmentId,
      'responses'
    );

    return onSnapshot(responsesRef, (snapshot) => {
      const responses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(responses);
    });
  } catch (error) {
    console.error('Error subscribing to responses:', error);
    throw error;
  }
};

/**
 * Update response count after new submission
 */
const updateAssessmentResponseCount = async (
  schoolId: string,
  assessmentId: string,
  respondentType: string
): Promise<void> => {
  try {
    const assessmentRef = doc(db, 'schools', schoolId, 'assessments', assessmentId);

    const updateData: any = {
      responseCount: increment(1),
      updatedAt: serverTimestamp()
    };

    // Also increment count for this respondent type
    updateData[`responsesByType.${respondentType}`] = increment(1);

    await updateDoc(assessmentRef, updateData);
  } catch (error) {
    console.error('Error updating response count:', error);
    // Don't throw - this is secondary
  }
};

/**
 * Trigger 14D Report Generation
 * Calls Cloud Function: generate14DReport
 */
export const triggerReportGeneration = async (
  schoolId: string,
  assessmentId: string
): Promise<any> => {
  try {
    const generate14DReportFn = httpsCallable(functions, 'generate14DReport');

    const result = await generate14DReportFn({
      schoolId: schoolId,
      assessmentId: assessmentId
    });

    console.log('✓ Report generation triggered:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error triggering report generation:', error);
    throw error;
  }
};

/**
 * Close assessment (stop accepting responses)
 */
export const closeAssessment = async (
  schoolId: string,
  assessmentId: string,
  userId: string
): Promise<void> => {
  try {
    const assessmentRef = doc(db, 'schools', schoolId, 'assessments', assessmentId);

    await updateDoc(assessmentRef, {
      status: 'CLOSED',
      closedAt: serverTimestamp(),
      closedBy: userId
    });

    // Log audit event
    await logAuditEvent(
      schoolId,
      'ASSESSMENT_CLOSED',
      'assessment',
      assessmentId,
      userId
    );

    console.log(`✓ Assessment ${assessmentId} closed`);
  } catch (error) {
    console.error('Error closing assessment:', error);
    throw error;
  }
};

/**
 * Get assessment statistics
 */
export const getAssessmentStats = async (
  schoolId: string,
  assessmentId: string
): Promise<any> => {
  try {
    const assessment = await getAssessment(schoolId, assessmentId);
    const responses = await getAssessmentResponses(schoolId, assessmentId);

    const expectedTotal = Object.values(assessment.expectedRespondents || {}).reduce(
      (a: number, b: any) => a + (b as number),
      0
    );

    return {
      assessmentId,
      assessmentName: assessment.assessmentName,
      totalExpected: expectedTotal,
      totalReceived: responses.length,
      responseRate: expectedTotal > 0 ? (responses.length / expectedTotal) * 100 : 0,
      responsesByType: assessment.responsesByType || {},
      lastResponseAt: responses.length > 0 ? responses[0].submittedAt : null,
      status: assessment.status
    };
  } catch (error) {
    console.error('Error getting assessment stats:', error);
    throw error;
  }
};

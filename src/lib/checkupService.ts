/**
 * Checkup Service - Stage 1: First Opinion Checkup
 * Handles all Firestore operations for checkup data
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
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { logAuditEvent } from './auditService';

export interface CheckupData {
  surveyInput: Record<string, any>;
  operationalMetricsUploaded: Record<string, any>;
  createdBy: string;
  schoolId: string;
  selectedChallenges?: string[];
  board?: string;
  cityTier?: string;
  feeBand?: string;
  uploadedFileName?: string;
}

export interface CheckupAnalysis {
  layer1_SubjectiveScores: Record<string, any>;
  layer1_Summary: Record<string, any>;
  layer2_ObjectiveMetrics: Record<string, any>;
  layer2_AggregatedObjectiveIndex: Record<string, any>;
  layer3_HealthIndex: Record<string, any>;
  gapAnalysis: Record<string, any>;
  rootCauseAnalysis: Record<string, any>;
  professionalAnalysis: Record<string, any>;
  recommendations: Record<string, any>;
  impactProjections: Record<string, any>;
  generatedAt: any;
}

/**
 * Save checkup data to Firestore
 *
 * NOTE: this does NOT trigger any Cloud Function analysis. The
 * analyzeCheckup Cloud Function is a callable function
 * (functions.https.onCall) and nothing in this app currently invokes it -
 * the actual DISHA Score is always computed locally
 * (FirstOpinionPage.tsx's runLocalDiagnosticCalculation), immediately
 * after this save completes.
 */
export const saveCheckupToFirestore = async (
  schoolId: string,
  checkupData: CheckupData
): Promise<string> => {
  try {
    const checkupRef = doc(collection(db, 'schools', schoolId, 'checkups'));

    await setDoc(checkupRef, {
      checkupType: 'FirstOpinion',
      status: 'SUBMITTED',
      surveyInput: checkupData.surveyInput,
      operationalMetricsUploaded: checkupData.operationalMetricsUploaded,
      submittedBy: checkupData.createdBy,
      selectedChallenges: checkupData.selectedChallenges || [],
      board: checkupData.board || null,
      cityTier: checkupData.cityTier || null,
      feeBand: checkupData.feeBand || null,
      uploadedFileName: checkupData.uploadedFileName || null,
      submittedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log(`✓ Checkup saved: ${checkupRef.id}`);

    // Log audit event
    await logAuditEvent(
      schoolId,
      'CHECKUP_SUBMITTED',
      'checkup',
      checkupRef.id,
      checkupData.createdBy
    );

    return checkupRef.id;
  } catch (error) {
    console.error('Error saving checkup:', error);
    throw error;
  }
};

/**
 * Get all checkups for a school
 */
export const getSchoolCheckups = async (schoolId: string): Promise<any[]> => {
  try {
    const checkupsRef = collection(db, 'schools', schoolId, 'checkups');
    const q = query(checkupsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching checkups:', error);
    throw error;
  }
};

/**
 * Get specific checkup
 */
export const getCheckup = async (
  schoolId: string,
  checkupId: string
): Promise<any> => {
  try {
    const checkupRef = doc(db, 'schools', schoolId, 'checkups', checkupId);
    const snapshot = await getDoc(checkupRef);

    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching checkup:', error);
    throw error;
  }
};

/**
 * Get checkup analysis (real-time subscription)
 * Returns unsubscribe function
 */
export const subscribeToCheckupAnalysis = (
  schoolId: string,
  checkupId: string,
  callback: (analysis: CheckupAnalysis | null) => void
): Unsubscribe => {
  try {
    const analysisRef = doc(
      db,
      'schools',
      schoolId,
      'checkups',
      checkupId,
      'analysis',
      'current'
    );

    return onSnapshot(analysisRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as CheckupAnalysis);
      } else {
        callback(null);
      }
    });
  } catch (error) {
    console.error('Error subscribing to analysis:', error);
    throw error;
  }
};

/**
 * Update checkup status
 */
export const updateCheckupStatus = async (
  schoolId: string,
  checkupId: string,
  status: 'SUBMITTED' | 'ANALYZED' | 'PUBLISHED',
  userId: string
): Promise<void> => {
  try {
    const checkupRef = doc(db, 'schools', schoolId, 'checkups', checkupId);

    await updateDoc(checkupRef, {
      status,
      updatedAt: serverTimestamp()
    });

    // Log audit event
    await logAuditEvent(
      schoolId,
      `CHECKUP_STATUS_CHANGED_TO_${status}`,
      'checkup',
      checkupId,
      userId
    );

    console.log(`✓ Checkup ${checkupId} status updated to ${status}`);
  } catch (error) {
    console.error('Error updating checkup status:', error);
    throw error;
  }
};

/**
 * Get checkup analysis with retry logic (waits for Cloud Function to complete)
 */
export const waitForCheckupAnalysis = async (
  schoolId: string,
  checkupId: string,
  maxRetries: number = 30, // 30 seconds
  retryInterval: number = 1000 // 1 second
): Promise<CheckupAnalysis | null> => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const analysisRef = doc(
        db,
        'schools',
        schoolId,
        'checkups',
        checkupId,
        'analysis',
        'current'
      );
      const snapshot = await getDoc(analysisRef);

      if (snapshot.exists()) {
        console.log('✓ Analysis ready');
        return snapshot.data() as CheckupAnalysis;
      }

      retries++;
      if (retries < maxRetries) {
        console.log(`Waiting for analysis... (${retries}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    } catch (error) {
      console.error('Error checking analysis:', error);
      throw error;
    }
  }

  console.error('Checkup analysis timeout - Cloud Function may not have completed');
  return null;
};

/**
 * Delete checkup
 */
export const deleteCheckup = async (
  schoolId: string,
  checkupId: string,
  userId: string
): Promise<void> => {
  try {
    const checkupRef = doc(db, 'schools', schoolId, 'checkups', checkupId);

    // Soft delete - update status instead
    await updateDoc(checkupRef, {
      status: 'DELETED',
      deletedAt: serverTimestamp(),
      deletedBy: userId
    });

    // Log audit event
    await logAuditEvent(
      schoolId,
      'CHECKUP_DELETED',
      'checkup',
      checkupId,
      userId
    );

    console.log(`✓ Checkup ${checkupId} deleted`);
  } catch (error) {
    console.error('Error deleting checkup:', error);
    throw error;
  }
};

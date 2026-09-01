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
  runTransaction,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { logAuditEvent } from './auditService';
import { DISHAScore } from './dishaScoreCalculator';
import { DataAnalysisResult } from './insightGenerator';
import { PerceptionGapEntry } from './challengeObjectiveScoring';

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

/**
 * The actual computed First Opinion report (Health Index, quadrant,
 * Perception Gap, Data-Driven Insights), plus the exact inputs it was
 * computed from - saved so a past report can be reopened and re-rendered
 * exactly as it looked, without re-running the survey or re-uploading data.
 *
 * REPLACES an earlier interface (layer1_SubjectiveScores, layer2_ObjectiveMetrics,
 * etc.) that mirrored the analyzeCheckup Cloud Function's intended output -
 * that function is never invoked by this app (see saveCheckupToFirestore's
 * doc comment), so nothing ever wrote that shape; this one matches what
 * FirstOpinionPage.tsx's runLocalDiagnosticCalculation actually computes.
 */
export interface CheckupAnalysis {
  dishaScore: DISHAScore;
  realInsights: DataAnalysisResult;
  perceptionGap: PerceptionGapEntry[];
  selectedChallenges: string[];
  answers: Record<string, string>;
  extractedMetricsFound: Record<string, number | string>;
  extractedFileType: string;
  generatedAt: any;
}

/**
 * Generates a human-readable, unique, traceable reference number for a
 * checkup: FO-YYYYMMDD-NN, where NN is a per-school, per-day sequence
 * (01, 02, ...) so two reports submitted the same day for the same school
 * are distinguishable at a glance, instead of only by their opaque
 * Firestore document ID. Uses a Firestore transaction on a small counter
 * document so the sequence number is race-condition-safe even if two
 * submissions happen at the same moment.
 */
const generateCheckupReferenceId = async (schoolId: string): Promise<string> => {
  const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const counterRef = doc(db, 'schools', schoolId, 'checkupCounters', dateKey);

  const seq = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const next = (snap.exists() ? (snap.data().count as number) || 0 : 0) + 1;
    tx.set(counterRef, { count: next, updatedAt: serverTimestamp() }, { merge: true });
    return next;
  });

  return `FO-${dateKey}-${String(seq).padStart(2, '0')}`;
};

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
): Promise<{ id: string; referenceId: string }> => {
  try {
    const checkupRef = doc(collection(db, 'schools', schoolId, 'checkups'));

    // Never let a reference-number generation hiccup block the actual save -
    // fall back to a timestamp-based reference so this remains a secondary,
    // best-effort feature rather than a new point of failure.
    let referenceId: string;
    try {
      referenceId = await generateCheckupReferenceId(schoolId);
    } catch (refError) {
      console.error('Error generating checkup reference ID, using fallback:', refError);
      referenceId = `FO-${Date.now()}`;
    }

    await setDoc(checkupRef, {
      checkupType: 'FirstOpinion',
      referenceId,
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

    console.log(`✓ Checkup saved: ${checkupRef.id} (${referenceId})`);

    // Log audit event
    await logAuditEvent(
      schoolId,
      'CHECKUP_SUBMITTED',
      'checkup',
      checkupRef.id,
      checkupData.createdBy
    );

    return { id: checkupRef.id, referenceId };
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
 * Save the computed First Opinion report for a checkup, so it can be
 * reopened later ("Past Reports") instead of only existing in this
 * browser tab's memory until it's closed. Writes to the same
 * schools/{schoolId}/checkups/{checkupId}/analysis/current path
 * subscribeToCheckupAnalysis already listens on, so any open tab
 * for this checkup updates in real time too.
 */
export const saveCheckupAnalysis = async (
  schoolId: string,
  checkupId: string,
  analysis: Omit<CheckupAnalysis, 'generatedAt'>
): Promise<void> => {
  try {
    const analysisRef = doc(db, 'schools', schoolId, 'checkups', checkupId, 'analysis', 'current');
    await setDoc(analysisRef, {
      ...analysis,
      generatedAt: serverTimestamp()
    });
    console.log(`✓ Checkup analysis saved for ${checkupId}`);
  } catch (error) {
    console.error('Error saving checkup analysis:', error);
    throw error;
  }
};

/**
 * One-shot fetch of a checkup's saved analysis (for reopening a past
 * report). Returns null if this checkup was submitted before this feature
 * existed, or its analysis save failed.
 */
export const getCheckupAnalysisOnce = async (
  schoolId: string,
  checkupId: string
): Promise<CheckupAnalysis | null> => {
  try {
    const analysisRef = doc(db, 'schools', schoolId, 'checkups', checkupId, 'analysis', 'current');
    const snapshot = await getDoc(analysisRef);
    return snapshot.exists() ? (snapshot.data() as CheckupAnalysis) : null;
  } catch (error) {
    console.error('Error fetching checkup analysis:', error);
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

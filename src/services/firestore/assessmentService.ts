/**
 * DISHA EWISR Assessment Service
 * Handles all Firestore operations for assessments
 */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  Query,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type {
  EWSIRAssessment,
  School,
  AssessmentReport,
  AssessmentHistory,
  AssessmentFilter
} from './ewisr-schema';
import type { OverallAssessment } from '@/hooks/useEWSIRAssessment';

// ============================================================================
// CREATE ASSESSMENT
// ============================================================================

export const createAssessment = async (
  schoolId: string,
  schoolName: string,
  userId: string,
  data?: Partial<EWSIRAssessment>
): Promise<string> => {
  try {
    const assessmentData: Partial<EWSIRAssessment> = {
      schoolId,
      schoolName,
      createdBy: userId,
      createdAt: Timestamp.now() as any,
      updatedAt: Timestamp.now() as any,
      status: 'draft',
      responses: {},
      dimensionScores: {},
      overallHealthIndex: 0,
      completionPercentage: 0,
      assessmentVersion: '2.0',
      ...data
    };

    const docRef = await addDoc(collection(db, 'ewisr_assessments'), assessmentData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating assessment:', error);
    throw error;
  }
};

// ============================================================================
// GET ASSESSMENT
// ============================================================================

export const getAssessment = async (assessmentId: string): Promise<EWSIRAssessment | null> => {
  try {
    const docRef = doc(db, 'ewisr_assessments', assessmentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return { ...docSnap.data(), id: docSnap.id } as EWSIRAssessment;
  } catch (error) {
    console.error('Error fetching assessment:', error);
    throw error;
  }
};

// ============================================================================
// UPDATE ASSESSMENT
// ============================================================================

export const updateAssessment = async (
  assessmentId: string,
  data: Partial<EWSIRAssessment>
): Promise<void> => {
  try {
    const docRef = doc(db, 'ewisr_assessments', assessmentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating assessment:', error);
    throw error;
  }
};

// ============================================================================
// SAVE ASSESSMENT RESPONSE
// ============================================================================

export const saveAssessmentResponse = async (
  assessmentId: string,
  dimensionId: string,
  questionId: string,
  weight: number
): Promise<void> => {
  try {
    const docRef = doc(db, 'ewisr_assessments', assessmentId);
    const fieldPath = `responses.${dimensionId}.${questionId}`;

    await updateDoc(docRef, {
      [fieldPath]: weight,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error saving response:', error);
    throw error;
  }
};

// ============================================================================
// SUBMIT ASSESSMENT WITH RESULTS
// ============================================================================

export const submitAssessment = async (
  assessmentId: string,
  assessment: OverallAssessment
): Promise<void> => {
  try {
    const batch = writeBatch(db);

    // Update main assessment document
    const assessmentRef = doc(db, 'ewisr_assessments', assessmentId);
    batch.update(assessmentRef, {
      status: 'submitted',
      overallHealthIndex: assessment.overallHealthIndex,
      healthStatus: assessment.healthStatus,
      recommendation: assessment.recommendation,
      assessmentDate: Timestamp.fromDate(assessment.assessmentDate),
      updatedAt: Timestamp.now(),
      dimensionScores: assessment.dimensionScores.reduce(
        (acc, ds) => ({
          ...acc,
          [ds.dimensionId]: {
            score: ds.score,
            classification: ds.classification,
            weightedContribution: assessment.weightedContributions[
              assessment.dimensionScores.indexOf(ds)
            ]
          }
        }),
        {}
      )
    });

    // Create assessment report
    const reportData: Partial<AssessmentReport> = {
      assessmentId,
      schoolId: assessment.schoolName,
      schoolName: assessment.schoolName,
      overallHealthIndex: assessment.overallHealthIndex,
      healthStatus: assessment.healthStatus,
      assessmentDate: new Date(),
      tierScores: {
        tier1: calculateTierScore(assessment, 'Tier 1'),
        tier2: calculateTierScore(assessment, 'Tier 2'),
        tier3: calculateTierScore(assessment, 'Tier 3'),
        tier4: calculateTierScore(assessment, 'Tier 4')
      },
      topDimensions: assessment.dimensionScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((d) => ({
          dimensionId: d.dimensionId,
          label: d.label,
          score: d.score
        })),
      bottomDimensions: assessment.dimensionScores
        .sort((a, b) => a.score - b.score)
        .slice(0, 5)
        .map((d) => ({
          dimensionId: d.dimensionId,
          label: d.label,
          score: d.score
        })),
      actionItems: assessment.actionPlan.map((a) => ({
        dimensionId: a.dimensionId,
        priority: a.priority,
        scoreGap: a.targetScore - a.currentScore
      })),
      recommendations: assessment.actionPlan
        .filter((a) => a.priority === 'URGENT')
        .map((a) => `${a.dimensionLabel}: ${a.recommendations[0]}`),
      createdAt: Timestamp.now() as any
    };

    const reportRef = doc(collection(db, 'assessment_reports'));
    batch.set(reportRef, reportData);

    // Commit batch
    await batch.commit();
  } catch (error) {
    console.error('Error submitting assessment:', error);
    throw error;
  }
};

// ============================================================================
// GET SCHOOL ASSESSMENTS
// ============================================================================

export const getSchoolAssessments = async (
  schoolId: string,
  filters?: AssessmentFilter,
  pageSize: number = 20,
  startAfterDoc?: any
): Promise<{ assessments: EWSIRAssessment[]; lastDoc: any }> => {
  try {
    const constraints: QueryConstraint[] = [where('schoolId', '==', schoolId)];

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }

    if (filters?.startDate) {
      constraints.push(where('assessmentDate', '>=', Timestamp.fromDate(filters.startDate)));
    }

    if (filters?.endDate) {
      constraints.push(where('assessmentDate', '<=', Timestamp.fromDate(filters.endDate)));
    }

    constraints.push(orderBy('assessmentDate', 'desc'));
    constraints.push(limit(pageSize + 1));

    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }

    const q = query(collection(db, 'ewisr_assessments'), ...constraints);
    const querySnapshot = await getDocs(q);

    const assessments = querySnapshot.docs
      .slice(0, pageSize)
      .map((doc) => ({ ...doc.data(), id: doc.id } as EWSIRAssessment));

    const lastDoc = querySnapshot.docs[pageSize - 1] || null;

    return { assessments, lastDoc };
  } catch (error) {
    console.error('Error fetching school assessments:', error);
    throw error;
  }
};

// ============================================================================
// GET ASSESSMENT REPORT
// ============================================================================

export const getAssessmentReport = async (
  assessmentId: string
): Promise<AssessmentReport | null> => {
  try {
    const q = query(
      collection(db, 'assessment_reports'),
      where('assessmentId', '==', assessmentId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return {
      ...querySnapshot.docs[0].data(),
      id: querySnapshot.docs[0].id
    } as AssessmentReport;
  } catch (error) {
    console.error('Error fetching assessment report:', error);
    throw error;
  }
};

// ============================================================================
// DELETE ASSESSMENT
// ============================================================================

export const deleteAssessment = async (assessmentId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);

    // Delete assessment
    const assessmentRef = doc(db, 'ewisr_assessments', assessmentId);
    batch.delete(assessmentRef);

    // Delete associated report
    const reportQuery = query(
      collection(db, 'assessment_reports'),
      where('assessmentId', '==', assessmentId)
    );
    const reportDocs = await getDocs(reportQuery);
    reportDocs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error deleting assessment:', error);
    throw error;
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const calculateTierScore = (assessment: OverallAssessment, tier: string): number => {
  const tierDimensions = assessment.dimensionScores.filter((d) => d.tier.includes(tier));
  if (tierDimensions.length === 0) return 0;

  const totalScore = tierDimensions.reduce((sum, d) => sum + d.score, 0);
  return totalScore / tierDimensions.length;
};

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

export const assessmentService = {
  createAssessment,
  getAssessment,
  updateAssessment,
  saveAssessmentResponse,
  submitAssessment,
  getSchoolAssessments,
  getAssessmentReport,
  deleteAssessment
};

export default assessmentService;

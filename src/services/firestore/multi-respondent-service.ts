/**
 * Multi-Respondent Assessment Service
 * Handles all respondent-related operations and data management
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  batch,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  Assessment,
  Respondent,
  RespondentResponse,
  StakeholderGroup,
  DEFAULT_TARGET_COUNTS
} from '@/types/multi-respondent';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// RESPONDENT MANAGEMENT SERVICE
// ============================================================================

export class MultiRespondentService {
  /**
   * Create a new multi-respondent assessment
   */
  static async createMultiRespondentAssessment(
    schoolId: string,
    schoolName: string,
    targetCounts: Record<StakeholderGroup, number> = DEFAULT_TARGET_COUNTS
  ): Promise<Assessment> {
    try {
      const assessmentId = `ASSESS_${Date.now()}_${uuidv4().slice(0, 8)}`;

      const assessment: Assessment = {
        assessmentId,
        schoolId,
        schoolName,
        assessmentType: 'MULTI_RESPONDENT',
        assessmentStatus: 'IN_PROGRESS',
        createdAt: new Date(),
        updatedAt: new Date(),

        targetCounts,
        respondentCounts: {
          management: 0,
          teachers: 0,
          parents_students: 0,
          operational_metrics: 0,
          total: 0
        },

        respondentIds: [],
        completionPercentage: 0
      };

      await setDoc(doc(db, 'assessments', assessmentId), {
        ...assessment,
        createdAt: Timestamp.fromDate(assessment.createdAt),
        updatedAt: Timestamp.fromDate(assessment.updatedAt)
      });

      return assessment;
    } catch (error) {
      console.error('Error creating multi-respondent assessment:', error);
      throw new Error('Failed to create assessment');
    }
  }

  /**
   * Add a new respondent to assessment
   */
  static async addRespondent(
    assessmentId: string,
    name: string,
    email: string,
    role: string,
    stakeholderGroup: StakeholderGroup,
    department?: string
  ): Promise<Respondent> {
    try {
      // Verify assessment exists
      const assessmentDoc = await getDoc(doc(db, 'assessments', assessmentId));
      if (!assessmentDoc.exists()) {
        throw new Error('Assessment not found');
      }

      const assessment = assessmentDoc.data() as Assessment;
      const respondentNumber = assessment.respondentIds.length + 1;
      const respondentId = `RESP_${stakeholderGroup.slice(0, 1).toUpperCase()}_${respondentNumber.toString().padStart(3, '0')}`;
      const respondentLink = this.generateRespondentLink();

      const respondent: Respondent = {
        respondentId,
        assessmentId,
        respondentNumber,
        name,
        email,
        role,
        department,
        stakeholderGroup,

        respondentLink,
        linkExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        linkStatus: 'ACTIVE',

        status: 'PENDING',
        completionPercentage: 0,
        responses: [],
        dimensionScores: {}
      };

      // Save respondent
      await setDoc(doc(db, 'respondents', respondentId), {
        ...respondent,
        linkExpiresAt: Timestamp.fromDate(respondent.linkExpiresAt)
      });

      // Update assessment
      const newRespondentIds = [...assessment.respondentIds, respondentId];
      const newCounts = {
        ...assessment.respondentCounts,
        [stakeholderGroup]: assessment.respondentCounts[stakeholderGroup] + 1,
        total: assessment.respondentCounts.total + 1
      };

      await updateDoc(doc(db, 'assessments', assessmentId), {
        respondentIds: newRespondentIds,
        respondentCounts: newCounts,
        updatedAt: Timestamp.now()
      });

      return respondent;
    } catch (error) {
      console.error('Error adding respondent:', error);
      throw error;
    }
  }

  /**
   * Get respondent by ID
   */
  static async getRespondent(respondentId: string): Promise<Respondent | null> {
    try {
      const doc_ref = doc(db, 'respondents', respondentId);
      const docSnap = await getDoc(doc_ref);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        ...data,
        linkExpiresAt: data.linkExpiresAt?.toDate() || new Date(),
        startedAt: data.startedAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        lastActivityAt: data.lastActivityAt?.toDate()
      } as Respondent;
    } catch (error) {
      console.error('Error getting respondent:', error);
      return null;
    }
  }

  /**
   * Get all respondents for assessment
   */
  static async getAssessmentRespondents(assessmentId: string): Promise<Respondent[]> {
    try {
      const q = query(
        collection(db, 'respondents'),
        where('assessmentId', '==', assessmentId),
        orderBy('respondentNumber')
      );

      const querySnapshot = await getDocs(q);
      const respondents: Respondent[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        respondents.push({
          ...data,
          linkExpiresAt: data.linkExpiresAt?.toDate() || new Date(),
          startedAt: data.startedAt?.toDate(),
          completedAt: data.completedAt?.toDate(),
          lastActivityAt: data.lastActivityAt?.toDate()
        } as Respondent);
      });

      return respondents;
    } catch (error) {
      console.error('Error getting assessment respondents:', error);
      return [];
    }
  }

  /**
   * Get respondents by stakeholder group
   */
  static async getRespondentsByGroup(
    assessmentId: string,
    stakeholderGroup: StakeholderGroup
  ): Promise<Respondent[]> {
    try {
      const q = query(
        collection(db, 'respondents'),
        where('assessmentId', '==', assessmentId),
        where('stakeholderGroup', '==', stakeholderGroup),
        orderBy('respondentNumber')
      );

      const querySnapshot = await getDocs(q);
      const respondents: Respondent[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        respondents.push({
          ...data,
          linkExpiresAt: data.linkExpiresAt?.toDate() || new Date(),
          startedAt: data.startedAt?.toDate(),
          completedAt: data.completedAt?.toDate(),
          lastActivityAt: data.lastActivityAt?.toDate()
        } as Respondent);
      });

      return respondents;
    } catch (error) {
      console.error('Error getting respondents by group:', error);
      return [];
    }
  }

  /**
   * Update respondent response
   */
  static async recordRespondentResponse(
    respondentId: string,
    assessmentId: string,
    dimensionId: string,
    questionId: string,
    selectedWeight: number
  ): Promise<void> {
    try {
      const respondent = await this.getRespondent(respondentId);
      if (!respondent) {
        throw new Error('Respondent not found');
      }

      // Update responses array
      const updatedResponses = [
        ...respondent.responses.filter(
          r => !(r.dimensionId === dimensionId && r.questionId === questionId)
        ),
        { dimensionId, questionId, selectedOptionWeight: selectedWeight }
      ];

      // Calculate completion percentage
      const totalQuestions = 168; // For 14 dimensions × ~12 questions
      const completionPercentage = Math.round((updatedResponses.length / totalQuestions) * 100);

      // Update respondent
      await updateDoc(doc(db, 'respondents', respondentId), {
        responses: updatedResponses,
        completionPercentage,
        lastActivityAt: Timestamp.now(),
        status: completionPercentage === 100 ? 'COMPLETE' : 'IN_PROGRESS',
        ...(completionPercentage === 100 && { completedAt: Timestamp.now() }),
        ...(completionPercentage > 0 && !respondent.startedAt && { startedAt: Timestamp.now() })
      });

      // Update assessment's overall completion
      await this.updateAssessmentCompletion(assessmentId);
    } catch (error) {
      console.error('Error recording response:', error);
      throw error;
    }
  }

  /**
   * Update respondent completion status
   */
  static async updateRespondentCompletion(
    respondentId: string,
    completionPercentage: number,
    scores: Record<string, number>,
    overallScore: number
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'respondents', respondentId), {
        completionPercentage,
        dimensionScores: scores,
        overallScore,
        status: completionPercentage === 100 ? 'COMPLETE' : 'IN_PROGRESS',
        ...(completionPercentage === 100 && { completedAt: Timestamp.now() })
      });
    } catch (error) {
      console.error('Error updating respondent completion:', error);
      throw error;
    }
  }

  /**
   * Update overall assessment completion
   */
  static async updateAssessmentCompletion(assessmentId: string): Promise<void> {
    try {
      const respondents = await this.getAssessmentRespondents(assessmentId);

      if (respondents.length === 0) return;

      // Count completed respondents
      const completedCount = respondents.filter(r => r.status === 'COMPLETE').length;
      const completionPercentage = Math.round((completedCount / respondents.length) * 100);

      // Count by stakeholder group
      const respondentCounts = {
        management: respondents.filter(r => r.stakeholderGroup === 'management').length,
        teachers: respondents.filter(r => r.stakeholderGroup === 'teachers').length,
        parents_students: respondents.filter(r => r.stakeholderGroup === 'parents_students').length,
        operational_metrics: respondents.filter(r => r.stakeholderGroup === 'operational_metrics').length,
        total: respondents.length
      };

      // Update assessment
      await updateDoc(doc(db, 'assessments', assessmentId), {
        completionPercentage,
        respondentCounts,
        assessmentStatus: completedCount === respondents.length ? 'COMPLETE' : 'IN_PROGRESS',
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating assessment completion:', error);
      throw error;
    }
  }

  /**
   * Get respondent invite link
   */
  static async getRespondentLink(respondentId: string): Promise<string | null> {
    try {
      const respondent = await this.getRespondent(respondentId);
      if (!respondent) return null;

      // Check if link is still valid
      if (
        respondent.linkStatus === 'EXPIRED' ||
        new Date() > respondent.linkExpiresAt
      ) {
        // Regenerate link
        const newLink = this.generateRespondentLink();
        await updateDoc(doc(db, 'respondents', respondentId), {
          respondentLink: newLink,
          linkExpiresAt: Timestamp.fromDate(
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          ),
          linkStatus: 'ACTIVE'
        });
        return newLink;
      }

      return respondent.respondentLink;
    } catch (error) {
      console.error('Error getting respondent link:', error);
      return null;
    }
  }

  /**
   * Delete respondent
   */
  static async deleteRespondent(
    respondentId: string,
    assessmentId: string
  ): Promise<void> {
    try {
      const assessmentDoc = await getDoc(doc(db, 'assessments', assessmentId));
      const assessment = assessmentDoc.data() as Assessment;

      // Remove from respondent list
      const updatedRespondentIds = assessment.respondentIds.filter(id => id !== respondentId);

      // Update assessment
      await updateDoc(doc(db, 'assessments', assessmentId), {
        respondentIds: updatedRespondentIds,
        updatedAt: Timestamp.now()
      });

      // Delete respondent
      await deleteDoc(doc(db, 'respondents', respondentId));
    } catch (error) {
      console.error('Error deleting respondent:', error);
      throw error;
    }
  }

  /**
   * Generate unique respondent link
   */
  private static generateRespondentLink(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `link_${timestamp}_${randomStr}`;
  }

  /**
   * Mark assessment as complete
   */
  static async completeAssessment(assessmentId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'assessments', assessmentId), {
        assessmentStatus: 'COMPLETE',
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error completing assessment:', error);
      throw error;
    }
  }

  /**
   * Archive assessment
   */
  static async archiveAssessment(assessmentId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'assessments', assessmentId), {
        assessmentStatus: 'ARCHIVED',
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error archiving assessment:', error);
      throw error;
    }
  }

  /**
   * Get assessment by ID
   */
  static async getAssessment(assessmentId: string): Promise<Assessment | null> {
    try {
      const docSnap = await getDoc(doc(db, 'assessments', assessmentId));

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Assessment;
    } catch (error) {
      console.error('Error getting assessment:', error);
      return null;
    }
  }

  /**
   * Bulk add respondents
   */
  static async bulkAddRespondents(
    assessmentId: string,
    respondentsData: Array<{
      name: string;
      email: string;
      role: string;
      stakeholderGroup: StakeholderGroup;
      department?: string;
    }>
  ): Promise<Respondent[]> {
    try {
      const assessment = await this.getAssessment(assessmentId);
      if (!assessment) throw new Error('Assessment not found');

      const createdRespondents: Respondent[] = [];
      const batch_write = writeBatch(db);

      respondentsData.forEach((data, index) => {
        const respondentNumber = assessment.respondentIds.length + index + 1;
        const respondentId = `RESP_${data.stakeholderGroup.slice(0, 1).toUpperCase()}_${respondentNumber.toString().padStart(3, '0')}`;
        const respondentLink = this.generateRespondentLink();

        const respondent: Respondent = {
          respondentId,
          assessmentId,
          respondentNumber,
          ...data,

          respondentLink,
          linkExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          linkStatus: 'ACTIVE',

          status: 'PENDING',
          completionPercentage: 0,
          responses: [],
          dimensionScores: {}
        };

        batch_write.set(doc(db, 'respondents', respondentId), {
          ...respondent,
          linkExpiresAt: Timestamp.fromDate(respondent.linkExpiresAt)
        });

        createdRespondents.push(respondent);
      });

      await batch_write.commit();

      // Update assessment
      await this.updateAssessmentCompletion(assessmentId);

      return createdRespondents;
    } catch (error) {
      console.error('Error bulk adding respondents:', error);
      throw error;
    }
  }
}

export default MultiRespondentService;

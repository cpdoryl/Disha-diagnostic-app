/**
 * 14-Dimension Assessment Wizard — Response Service
 * Handles saving responses to Firestore and real-time progress tracking
 * Phase 2: Frontend Assessment Wizard
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  writeBatch,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import { MetricResponse, Assessment14D } from './types14D';

export class ResponseService14D {
  constructor(private db: Firestore) {}

  // ============================================================================
  // SAVE SINGLE RESPONSE
  // ============================================================================

  async saveResponse(
    schoolId: string,
    assessmentId: string,
    response: MetricResponse
  ): Promise<void> {
    try {
      const responseRef = doc(
        this.db,
        'schools',
        schoolId,
        'assessments14D',
        assessmentId,
        'responses',
        response.id
      );

      await setDoc(responseRef, {
        ...response,
        timestamp: Timestamp.now(),
        lastModified: Timestamp.now(),
      });

      console.log(`✅ Response saved: ${response.metricId}`);
    } catch (error) {
      console.error('❌ Failed to save response:', error);
      throw error;
    }
  }

  // ============================================================================
  // BATCH SAVE RESPONSES (Efficient)
  // ============================================================================

  async batchSaveResponses(
    schoolId: string,
    assessmentId: string,
    responses: MetricResponse[]
  ): Promise<void> {
    try {
      const batch = writeBatch(this.db);

      responses.forEach(response => {
        const responseRef = doc(
          this.db,
          'schools',
          schoolId,
          'assessments14D',
          assessmentId,
          'responses',
          response.id
        );

        batch.set(responseRef, {
          ...response,
          timestamp: Timestamp.now(),
          lastModified: Timestamp.now(),
        });
      });

      await batch.commit();
      console.log(`✅ Batch saved: ${responses.length} responses`);
    } catch (error) {
      console.error('❌ Batch save failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // LOAD SAVED DRAFT (Resume Assessment)
  // ============================================================================

  async loadDraftResponses(
    schoolId: string,
    assessmentId: string,
    respondentId?: string
  ): Promise<MetricResponse[]> {
    try {
      let q;

      if (respondentId) {
        q = query(
          collection(this.db, 'schools', schoolId, 'assessments14D', assessmentId, 'responses'),
          where('respondentId', '==', respondentId)
        );
      } else {
        // For anonymous, load all for this session
        q = collection(
          this.db,
          'schools',
          schoolId,
          'assessments14D',
          assessmentId,
          'responses'
        );
      }

      const snapshot = await getDocs(q);
      const responses = snapshot.docs.map(doc => doc.data() as MetricResponse);

      console.log(`✅ Loaded ${responses.length} draft responses`);
      return responses;
    } catch (error) {
      console.error('❌ Failed to load draft:', error);
      return [];
    }
  }

  // ============================================================================
  // SUBMIT ASSESSMENT (Mark as complete)
  // ============================================================================

  async submitAssessment(
    schoolId: string,
    assessmentId: string,
    respondentId?: string
  ): Promise<void> {
    try {
      const assessmentRef = doc(
        this.db,
        'schools',
        schoolId,
        'assessments14D',
        assessmentId
      );

      // Update response count
      const snapshot = await getDocs(
        respondentId
          ? query(
            collection(this.db, 'schools', schoolId, 'assessments14D', assessmentId, 'responses'),
            where('respondentId', '==', respondentId)
          )
          : collection(this.db, 'schools', schoolId, 'assessments14D', assessmentId, 'responses')
      );

      const responseCount = snapshot.size;

      await updateDoc(assessmentRef, {
        'responseBudget.collectedCount': responseCount,
        lastModified: Timestamp.now(),
      });

      console.log(`✅ Assessment submitted with ${responseCount} responses`);
    } catch (error) {
      console.error('❌ Failed to submit assessment:', error);
      throw error;
    }
  }

  // ============================================================================
  // REAL-TIME PROGRESS LISTENER
  // ============================================================================

  subscribeToResponseProgress(
    schoolId: string,
    assessmentId: string,
    onUpdate: (count: number, respondents: string[]) => void
  ): () => void {
    try {
      const unsubscribe = onSnapshot(
        collection(this.db, 'schools', schoolId, 'assessments14D', assessmentId, 'responses'),
        snapshot => {
          const count = snapshot.size;
          const respondents = Array.from(
            new Set(
              snapshot.docs
                .map(doc => (doc.data() as MetricResponse).respondentId)
                .filter((id): id is string => !!id)
            )
          );

          onUpdate(count, respondents);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Failed to subscribe to progress:', error);
      return () => {}; // No-op unsubscribe
    }
  }

  // ============================================================================
  // GET ASSESSMENT DETAILS
  // ============================================================================

  async getAssessment(
    schoolId: string,
    assessmentId: string
  ): Promise<Assessment14D | null> {
    try {
      const assessmentRef = doc(
        this.db,
        'schools',
        schoolId,
        'assessments14D',
        assessmentId
      );

      const snapshot = await getDoc(assessmentRef);

      if (!snapshot.exists()) {
        console.warn(`⚠️ Assessment not found: ${assessmentId}`);
        return null;
      }

      return snapshot.data() as Assessment14D;
    } catch (error) {
      console.error('❌ Failed to get assessment:', error);
      return null;
    }
  }

  // ============================================================================
  // GET RESPONSE STATISTICS
  // ============================================================================

  async getResponseStats(
    schoolId: string,
    assessmentId: string
  ): Promise<{
    totalResponses: number;
    byStakeholder: Record<string, number>;
    completionRate: number;
  } | null> {
    try {
      const snapshot = await getDocs(
        collection(this.db, 'schools', schoolId, 'assessments14D', assessmentId, 'responses')
      );

      const byStakeholder: Record<string, number> = {};
      let totalResponses = 0;

      snapshot.docs.forEach(doc => {
        const response = doc.data() as MetricResponse;
        byStakeholder[response.stakeholderType] = (byStakeholder[response.stakeholderType] || 0) + 1;
        totalResponses++;
      });

      const assessment = await this.getAssessment(schoolId, assessmentId);
      const completionRate = assessment
        ? (totalResponses / (assessment.responseBudget.expectedCount || 1)) * 100
        : 0;

      return {
        totalResponses,
        byStakeholder,
        completionRate,
      };
    } catch (error) {
      console.error('❌ Failed to get response stats:', error);
      return null;
    }
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  validateResponse(response: MetricResponse): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!response.stakeholderType) {
      errors.push('Stakeholder type is required');
    }

    if (!response.metricId) {
      errors.push('Metric ID is required');
    }

    if (response.metricType === 'perception' && (response.metricValue < 1 || response.metricValue > 10)) {
      errors.push('Perception score must be between 1 and 10');
    }

    if (response.metricType === 'perception' && !response.followUpResponse) {
      errors.push('Follow-up response is required for perception questions');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ============================================================================
  // ANONYMOUS TRACKING
  // ============================================================================

  /**
   * For anonymous responses, use sessionId to track progress
   * Session ID is generated client-side and never stored server-side
   */
  async getResponsesBySession(
    schoolId: string,
    assessmentId: string,
    sessionId: string
  ): Promise<MetricResponse[]> {
    try {
      // Note: sessionId is stored in response but not indexed
      // This is a full scan for demonstration; in production, store sessionId in separate index
      const allResponses = await getDocs(
        collection(this.db, 'schools', schoolId, 'assessments14D', assessmentId, 'responses')
      );

      const sessionResponses = allResponses.docs
        .map(doc => doc.data() as MetricResponse)
        .filter(r => r.sessionId === sessionId);

      return sessionResponses;
    } catch (error) {
      console.error('❌ Failed to get session responses:', error);
      return [];
    }
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

import { db } from './firebase';

export const responseService = new ResponseService14D(db);

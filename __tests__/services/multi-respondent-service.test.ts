/**
 * Multi-Respondent Service Tests
 * Comprehensive test suite for all service methods
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MultiRespondentService from '@/services/firestore/multi-respondent-service';
import { Assessment, Respondent } from '@/types/multi-respondent';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  Timestamp: {
    fromDate: vi.fn((date) => ({ toDate: () => date })),
    now: vi.fn(() => ({ toDate: () => new Date() }))
  },
  writeBatch: vi.fn()
}));

describe('MultiRespondentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createMultiRespondentAssessment', () => {
    it('should create a new multi-respondent assessment', async () => {
      const result = await MultiRespondentService.createMultiRespondentAssessment(
        'SCHOOL_001',
        'Test School',
        {
          management: 5,
          teachers: 8,
          parents_students: 10,
          operational_metrics: 5
        }
      );

      expect(result).toBeDefined();
      expect(result.schoolId).toBe('SCHOOL_001');
      expect(result.schoolName).toBe('Test School');
      expect(result.assessmentType).toBe('MULTI_RESPONDENT');
      expect(result.assessmentStatus).toBe('IN_PROGRESS');
      expect(result.respondentIds).toEqual([]);
      expect(result.completionPercentage).toBe(0);
    });

    it('should use default target counts if not provided', async () => {
      const result = await MultiRespondentService.createMultiRespondentAssessment(
        'SCHOOL_001',
        'Test School'
      );

      expect(result.targetCounts).toBeDefined();
      expect(result.targetCounts.management).toBe(5);
      expect(result.targetCounts.teachers).toBe(8);
    });
  });

  describe('addRespondent', () => {
    it('should add a new respondent to assessment', async () => {
      const mockAssessment: Assessment = {
        assessmentId: 'ASSESS_001',
        schoolId: 'SCHOOL_001',
        schoolName: 'Test School',
        assessmentType: 'MULTI_RESPONDENT',
        assessmentStatus: 'IN_PROGRESS',
        createdAt: new Date(),
        updatedAt: new Date(),
        targetCounts: { management: 5, teachers: 8, parents_students: 10, operational_metrics: 5 },
        respondentCounts: { management: 0, teachers: 0, parents_students: 0, operational_metrics: 0, total: 0 },
        respondentIds: [],
        completionPercentage: 0
      };

      // Mock getDoc to return the assessment
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockAssessment
      } as any);

      const respondent = await MultiRespondentService.addRespondent(
        'ASSESS_001',
        'Principal John',
        'john@school.com',
        'Principal',
        'management'
      );

      expect(respondent).toBeDefined();
      expect(respondent.name).toBe('Principal John');
      expect(respondent.email).toBe('john@school.com');
      expect(respondent.stakeholderGroup).toBe('management');
      expect(respondent.status).toBe('PENDING');
      expect(respondent.completionPercentage).toBe(0);
    });

    it('should throw error if assessment not found', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      await expect(
        MultiRespondentService.addRespondent(
          'INVALID_ID',
          'Test User',
          'test@example.com',
          'Teacher',
          'teachers'
        )
      ).rejects.toThrow('Assessment not found');
    });
  });

  describe('getRespondent', () => {
    it('should retrieve a respondent by ID', async () => {
      const mockRespondent: Respondent = {
        respondentId: 'RESP_M_001',
        assessmentId: 'ASSESS_001',
        respondentNumber: 1,
        name: 'Principal John',
        email: 'john@school.com',
        role: 'Principal',
        stakeholderGroup: 'management',
        respondentLink: 'link_xyz',
        linkExpiresAt: new Date(),
        linkStatus: 'ACTIVE',
        status: 'PENDING',
        completionPercentage: 0,
        responses: [],
        dimensionScores: {}
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockRespondent
      } as any);

      const result = await MultiRespondentService.getRespondent('RESP_M_001');

      expect(result).toBeDefined();
      expect(result?.name).toBe('Principal John');
      expect(result?.stakeholderGroup).toBe('management');
    });

    it('should return null if respondent not found', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      const result = await MultiRespondentService.getRespondent('INVALID_ID');

      expect(result).toBeNull();
    });
  });

  describe('getAssessmentRespondents', () => {
    it('should retrieve all respondents for an assessment', async () => {
      const mockRespondents = [
        {
          respondentId: 'RESP_M_001',
          assessmentId: 'ASSESS_001',
          respondentNumber: 1,
          name: 'Principal John',
          stakeholderGroup: 'management',
          status: 'PENDING',
          completionPercentage: 0
        },
        {
          respondentId: 'RESP_T_001',
          assessmentId: 'ASSESS_001',
          respondentNumber: 1,
          name: 'Teacher Jane',
          stakeholderGroup: 'teachers',
          status: 'COMPLETE',
          completionPercentage: 100
        }
      ];

      const mockQuerySnapshot = {
        forEach: (callback: any) => {
          mockRespondents.forEach((r, idx) => {
            callback({
              data: () => r
            });
          });
        }
      };

      vi.mocked(getDocs).mockResolvedValueOnce(mockQuerySnapshot as any);

      const result = await MultiRespondentService.getAssessmentRespondents('ASSESS_001');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Principal John');
      expect(result[1].name).toBe('Teacher Jane');
    });

    it('should return empty array if no respondents found', async () => {
      vi.mocked(getDocs).mockResolvedValueOnce({
        forEach: () => {}
      } as any);

      const result = await MultiRespondentService.getAssessmentRespondents('ASSESS_001');

      expect(result).toEqual([]);
    });
  });

  describe('recordRespondentResponse', () => {
    it('should record a respondent response', async () => {
      const mockRespondent: Respondent = {
        respondentId: 'RESP_M_001',
        assessmentId: 'ASSESS_001',
        respondentNumber: 1,
        name: 'Principal John',
        email: 'john@school.com',
        role: 'Principal',
        stakeholderGroup: 'management',
        respondentLink: 'link_xyz',
        linkExpiresAt: new Date(),
        linkStatus: 'ACTIVE',
        status: 'PENDING',
        completionPercentage: 0,
        responses: [],
        dimensionScores: {}
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockRespondent
      } as any);

      await MultiRespondentService.recordRespondentResponse(
        'RESP_M_001',
        'ASSESS_001',
        'D01',
        'q1_m_1',
        2
      );

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('bulkAddRespondents', () => {
    it('should add multiple respondents at once', async () => {
      const mockAssessment: Assessment = {
        assessmentId: 'ASSESS_001',
        schoolId: 'SCHOOL_001',
        schoolName: 'Test School',
        assessmentType: 'MULTI_RESPONDENT',
        assessmentStatus: 'IN_PROGRESS',
        createdAt: new Date(),
        updatedAt: new Date(),
        targetCounts: { management: 5, teachers: 8, parents_students: 10, operational_metrics: 5 },
        respondentCounts: { management: 0, teachers: 0, parents_students: 0, operational_metrics: 0, total: 0 },
        respondentIds: [],
        completionPercentage: 0
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockAssessment
      } as any);

      const respondentsData = [
        {
          name: 'Principal John',
          email: 'john@school.com',
          role: 'Principal',
          stakeholderGroup: 'management' as const,
          department: 'Administration'
        },
        {
          name: 'Teacher Jane',
          email: 'jane@school.com',
          role: 'Teacher',
          stakeholderGroup: 'teachers' as const,
          department: 'Science'
        }
      ];

      const result = await MultiRespondentService.bulkAddRespondents(
        'ASSESS_001',
        respondentsData
      );

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Principal John');
      expect(result[1].name).toBe('Teacher Jane');
    });
  });

  describe('completeAssessment', () => {
    it('should mark assessment as complete', async () => {
      await MultiRespondentService.completeAssessment('ASSESS_001');

      expect(updateDoc).toHaveBeenCalled();
    });
  });
});

// Export for running
export {};

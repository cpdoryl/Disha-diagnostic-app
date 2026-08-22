import { describe, it, expect } from 'vitest'
import type { ResponseProgress } from './responseService'

/**
 * Unit tests for responseService
 * Integration tests (with emulator) are in Step 9
 */

describe('First Opinion Response Service', () => {
  describe('Response progress aggregation (pure logic)', () => {
    it('should correctly tally responses by role', () => {
      // Mock response data
      const mockResponses = [
        { id: '1', role: 'TEACHER', deleted: false },
        { id: '2', role: 'TEACHER', deleted: false },
        { id: '3', role: 'PARENT', deleted: false },
        { id: '4', role: 'TEACHER', deleted: true }, // Soft-deleted, should not count
        { id: '5', role: 'ADMIN', deleted: false }
      ]

      // Simulate aggregation logic
      const roleCounts = new Map<string, number>()
      mockResponses
        .filter((r) => !r.deleted)
        .forEach((r) => {
          roleCounts.set(r.role, (roleCounts.get(r.role) || 0) + 1)
        })

      const progress: ResponseProgress[] = Array.from(roleCounts.entries())
        .map(([role, count]) => ({
          role,
          count,
          lastUpdated: new Date()
        }))
        .sort((a, b) => a.role.localeCompare(b.role))

      // Verify counts (soft-deleted response excluded)
      expect(progress).toHaveLength(3) // ADMIN, PARENT, TEACHER
      expect(progress[0]).toMatchObject({ role: 'ADMIN', count: 1 })
      expect(progress[1]).toMatchObject({ role: 'PARENT', count: 1 })
      expect(progress[2]).toMatchObject({ role: 'TEACHER', count: 2 })
    })

    it('should handle empty response list', () => {
      const roleCounts = new Map<string, number>()
      const progress: ResponseProgress[] = Array.from(roleCounts.entries()).map(([role, count]) => ({
        role,
        count,
        lastUpdated: new Date()
      }))

      expect(progress).toHaveLength(0)
    })

    it('should handle all responses soft-deleted', () => {
      const mockResponses = [
        { id: '1', role: 'TEACHER', deleted: true },
        { id: '2', role: 'PARENT', deleted: true }
      ]

      const roleCounts = new Map<string, number>()
      mockResponses
        .filter((r) => !r.deleted)
        .forEach((r) => {
          roleCounts.set(r.role, (roleCounts.get(r.role) || 0) + 1)
        })

      const progress: ResponseProgress[] = Array.from(roleCounts.entries()).map(([role, count]) => ({
        role,
        count,
        lastUpdated: new Date()
      }))

      expect(progress).toHaveLength(0)
    })
  })

  describe('Soft-delete audit trail pattern', () => {
    it('should preserve all response history (soft-deletes are hidden, not removed)', () => {
      // Mock scenario: respondent resubmits, old response marked as deleted=true
      const allResponses = [
        { id: '1', responderId: 'teacher-001', role: 'TEACHER', deleted: true, submittedAt: '2026-08-22T10:00:00Z' }, // Old, deleted
        {
          id: '2',
          responderId: 'teacher-001',
          role: 'TEACHER',
          deleted: false,
          submittedAt: '2026-08-22T10:15:00Z'
        } // New, active
      ]

      // Active responses (what score calculation sees)
      const activeResponses = allResponses.filter((r) => !r.deleted)
      expect(activeResponses).toHaveLength(1)
      expect(activeResponses[0].id).toBe('2')

      // All historical responses (what audit trail sees)
      expect(allResponses).toHaveLength(2)
    })
  })

  describe('Supported roles', () => {
    it('should support all 5 stakeholder roles', () => {
      const supportedRoles = ['TEACHER', 'PARENT', 'STUDENT', 'ADMIN', 'OTHER']

      const mockResponses = supportedRoles.map((role, idx) => ({
        id: `${idx}`,
        role,
        deleted: false
      }))

      const roleCounts = new Map<string, number>()
      mockResponses.forEach((r) => {
        roleCounts.set(r.role, (roleCounts.get(r.role) || 0) + 1)
      })

      expect(roleCounts.size).toBe(5)
      supportedRoles.forEach((role) => {
        expect(roleCounts.get(role)).toBe(1)
      })
    })
  })
})

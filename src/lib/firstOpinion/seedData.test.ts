import { describe, it, expect } from 'vitest'
import { MULTIPLIER_DATA_CARDS, CHALLENGE_CATALOG } from './seedData'

describe('FirstOpinion Seed Data', () => {
  describe('Multipliers', () => {
    it('should have exactly 8 multipliers', () => {
      expect(MULTIPLIER_DATA_CARDS).toHaveLength(8)
    })

    it('should have 4 core and 4 expanded multipliers', () => {
      const core = MULTIPLIER_DATA_CARDS.filter(m => m.category === 'CORE')
      const expanded = MULTIPLIER_DATA_CARDS.filter(m => m.category === 'EXPANDED')
      expect(core).toHaveLength(4)
      expect(expanded).toHaveLength(4)
    })

    it('should have IDs M1 through M8', () => {
      const ids = MULTIPLIER_DATA_CARDS.map(m => m.id).sort()
      expect(ids).toEqual(['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'])
    })

    it('should have 4 thresholds per multiplier with labels Critical, Average, Good, Excellent', () => {
      MULTIPLIER_DATA_CARDS.forEach(multiplier => {
        expect(multiplier.thresholds).toHaveLength(4)
        const labels = new Set(multiplier.thresholds.map(t => t.label))
        expect(labels).toEqual(new Set(['Excellent', 'Good', 'Average', 'Critical']))
      })
    })

    it('should have monotonic decreasing scores for lower_is_better', () => {
      MULTIPLIER_DATA_CARDS.filter(m => m.direction === 'lower_is_better').forEach(
        multiplier => {
          const scores = multiplier.thresholds.map(t => t.score)
          for (let i = 0; i < scores.length - 1; i++) {
            expect(scores[i]).toBeGreaterThan(scores[i + 1])
          }
        }
      )
    })

    it('should have monotonic increasing scores for higher_is_better', () => {
      MULTIPLIER_DATA_CARDS.filter(m => m.direction === 'higher_is_better').forEach(
        multiplier => {
          const scores = multiplier.thresholds.map(t => t.score)
          for (let i = 0; i < scores.length - 1; i++) {
            expect(scores[i]).toBeLessThan(scores[i + 1])
          }
        }
      )
    })

    it('should have non-overlapping, sequential threshold ranges', () => {
      MULTIPLIER_DATA_CARDS.forEach(multiplier => {
        const thresholds = multiplier.thresholds
        for (let i = 0; i < thresholds.length - 1; i++) {
          expect(thresholds[i].max).toBeLessThanOrEqual(thresholds[i + 1].min)
        }
      })
    })

    it('should have consistent score bounds (0 to 1)', () => {
      MULTIPLIER_DATA_CARDS.forEach(multiplier => {
        multiplier.thresholds.forEach(threshold => {
          expect(threshold.score).toBeGreaterThanOrEqual(0)
          expect(threshold.score).toBeLessThanOrEqual(1)
        })
      })
    })
  })

  describe('Challenges', () => {
    it('should have exactly 15 challenges', () => {
      expect(CHALLENGE_CATALOG).toHaveLength(15)
    })

    it('should have IDs C1 through C15', () => {
      const ids = CHALLENGE_CATALOG.map(c => c.id).sort(
        (a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))
      )
      expect(ids).toEqual([
        'C1',
        'C2',
        'C3',
        'C4',
        'C5',
        'C6',
        'C7',
        'C8',
        'C9',
        'C10',
        'C11',
        'C12',
        'C13',
        'C14',
        'C15'
      ])
    })

    it('should be distributed across 5 domains (3 per domain)', () => {
      const domainGroups = CHALLENGE_CATALOG.reduce(
        (acc, challenge) => {
          if (!acc[challenge.domain]) acc[challenge.domain] = []
          acc[challenge.domain].push(challenge)
          return acc
        },
        {} as Record<string, typeof CHALLENGE_CATALOG>
      )

      expect(Object.keys(domainGroups)).toHaveLength(5)
      Object.values(domainGroups).forEach(challenges => {
        expect(challenges).toHaveLength(3)
      })
    })

    it('should have the correct domain assignments', () => {
      const domainMap: Record<string, string> = {
        C1: 'Growth & Enrollment',
        C2: 'Growth & Enrollment',
        C3: 'Growth & Enrollment',
        C4: 'People & Staffing',
        C5: 'People & Staffing',
        C6: 'People & Staffing',
        C7: 'Academic & Wellbeing',
        C8: 'Academic & Wellbeing',
        C9: 'Academic & Wellbeing',
        C10: 'Reputation & Competition',
        C11: 'Reputation & Competition',
        C12: 'Reputation & Competition',
        C13: 'Operations & Finance',
        C14: 'Operations & Finance',
        C15: 'Operations & Finance'
      }

      CHALLENGE_CATALOG.forEach(challenge => {
        expect(challenge.domain).toBe(domainMap[challenge.id])
      })
    })

    it('should have equal weight per challenge (1/15)', () => {
      CHALLENGE_CATALOG.forEach(challenge => {
        expect(challenge.weight).toBeCloseTo(1 / 15, 3)
      })
    })

    it('should have weights summing to approximately 1.0', () => {
      const totalWeight = CHALLENGE_CATALOG.reduce((sum, c) => sum + c.weight, 0)
      expect(totalWeight).toBeCloseTo(1.0, 2)
    })

    it('should reference 14 dimensions (D1-D14)', () => {
      const allDims = new Set<string>()
      CHALLENGE_CATALOG.forEach(challenge => {
        challenge.affectedDimensions.forEach(dim => allDims.add(dim))
      })

      const expectedDims = Array.from({ length: 14 }, (_, i) => `D${i + 1}`)
      expect(
        Array.from(allDims).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
      ).toEqual(expectedDims)
    })
  })
})

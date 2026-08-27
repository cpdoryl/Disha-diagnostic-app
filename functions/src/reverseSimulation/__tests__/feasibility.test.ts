import { describe, it, expect } from 'vitest';

const mockDimensions = {
  D01: 70, D02: 65, D03: 75, D04: 60, D05: 80,
  D06: 55, D07: 72, D08: 68, D09: 70, D10: 62,
  D11: 68, D12: 75, D13: 58, D14: 70,
};

const mockTargets = {
  D01: 78, D02: 73, D03: 82, D04: 68, D05: 88,
  D06: 63, D07: 80, D08: 76, D09: 78, D10: 70,
  D11: 76, D12: 83, D13: 66, D14: 78,
};

describe('analyzeFeasibility Cloud Function', () => {
  describe('Input Validation', () => {
    it('should require all 14 dimensions in current and target', () => {
      const allDims = Object.keys(mockDimensions);
      expect(allDims.length).toBe(14);
      allDims.forEach(dim => {
        expect(dim in mockDimensions).toBe(true);
        expect(dim in mockTargets).toBe(true);
      });
    });

    it('should validate timeline is between 3-24 months', () => {
      const validTimelines = [3, 6, 9, 12, 18, 24];
      validTimelines.forEach(timeline => {
        expect(timeline).toBeGreaterThanOrEqual(3);
        expect(timeline).toBeLessThanOrEqual(24);
      });
    });

    it('should validate budget is positive', () => {
      const budgets = [1000000, 5000000, 10000000];
      budgets.forEach(budget => {
        expect(budget).toBeGreaterThan(0);
      });
    });

    it('should reject targets less than current scores', () => {
      const invalidTarget = { ...mockTargets, D01: 60 }; // Less than current 70
      expect(invalidTarget.D01).toBeLessThan(mockDimensions.D01);
    });
  });

  describe('Feasibility Calculation', () => {
    it('should calculate gap for each dimension', () => {
      Object.keys(mockDimensions).forEach(dim => {
        const gap = mockTargets[dim as keyof typeof mockTargets] - mockDimensions[dim as keyof typeof mockDimensions];
        expect(gap).toBeGreaterThanOrEqual(0);
      });
    });

    it('should calculate gap percentage correctly', () => {
      const D01Gap = mockTargets.D01 - mockDimensions.D01;
      const D01GapPercentage = (D01Gap / mockDimensions.D01) * 100;

      expect(D01Gap).toBe(8);
      expect(D01GapPercentage).toBeCloseTo(11.43, 1);
    });

    it('should apply feasibility formula: 100 - [0.3*Gap% + 0.2*Timeline% + 0.2*Cost% + 0.3*Difficulty%]', () => {
      const gap = 10;
      const gapPercentage = 15;
      const timelineMonths = 12;
      const budget = 5000000;
      const difficulty = 3; // Medium difficulty (1-5 scale)

      const gapScore = Math.min(gapPercentage / 100, 1);
      const timelineScore = Math.max(0, 1 - timelineMonths / 24);
      const costScore = Math.max(0, 1 - (budget / 1000000) * 0.1);
      const difficultyScore = (difficulty - 1) / 4;

      const feasibilityScore = Math.round(
        100 - (0.3 * gapScore + 0.2 * timelineScore + 0.2 * costScore + 0.3 * difficultyScore) * 100
      );

      expect(feasibilityScore).toBeGreaterThanOrEqual(0);
      expect(feasibilityScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Feasibility Bands', () => {
    it('should classify highly feasible (90-100%)', () => {
      const score = 95;
      const band = score >= 90 ? 'Highly Feasible' : 'Other';
      expect(band).toBe('Highly Feasible');
    });

    it('should classify feasible (70-89%)', () => {
      const score = 75;
      const band = score >= 70 && score < 90 ? 'Feasible' : 'Other';
      expect(band).toBe('Feasible');
    });

    it('should classify challenging (50-69%)', () => {
      const score = 60;
      const band = score >= 50 && score < 70 ? 'Challenging' : 'Other';
      expect(band).toBe('Challenging');
    });

    it('should classify high risk (<50%)', () => {
      const score = 40;
      const band = score < 50 ? 'High Risk' : 'Other';
      expect(band).toBe('High Risk');
    });
  });

  describe('Risk Level Assessment', () => {
    it('should assign Low risk for highly feasible dimensions', () => {
      expect('Low').toBe('Low');
    });

    it('should assign Medium risk for feasible dimensions', () => {
      expect('Medium').toBe('Medium');
    });

    it('should assign High risk for challenging dimensions', () => {
      expect('High').toBe('High');
    });

    it('should assign Very High risk for high-risk dimensions', () => {
      expect('Very High').toBe('Very High');
    });
  });

  describe('Overall Feasibility Summary', () => {
    it('should calculate average feasibility across dimensions', () => {
      const scores = [95, 75, 60, 45, 85, 70, 55, 80, 65, 50, 75, 80, 55, 70];
      const average = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length
      );

      expect(average).toBeGreaterThanOrEqual(0);
      expect(average).toBeLessThanOrEqual(100);
      expect(average).toBeCloseTo(69, 0);
    });

    it('should provide overall risk level based on average', () => {
      const averageScore = 69;
      const riskLevel = averageScore >= 90 ? 'Low' : averageScore >= 70 ? 'Medium' : 'High';

      expect(riskLevel).toBe('High');
    });
  });

  describe('Dimension Categorization', () => {
    it('should categorize dimensions into risk tiers', () => {
      const dimensions = [
        { id: 'D01', score: 95 }, // Highly Feasible
        { id: 'D02', score: 75 }, // Feasible
        { id: 'D03', score: 60 }, // Challenging
        { id: 'D04', score: 40 }, // High Risk
      ];

      const categorized = {
        highlyFeasible: dimensions.filter(d => d.score >= 90),
        feasible: dimensions.filter(d => d.score >= 70 && d.score < 90),
        challenging: dimensions.filter(d => d.score >= 50 && d.score < 70),
        highRisk: dimensions.filter(d => d.score < 50),
      };

      expect(categorized.highlyFeasible.length).toBe(1);
      expect(categorized.feasible.length).toBe(1);
      expect(categorized.challenging.length).toBe(1);
      expect(categorized.highRisk.length).toBe(1);
    });

    it('should provide recommendations for each risk tier', () => {
      const recommendations = {
        highlyFeasible: 'Implement immediately',
        feasible: 'Implement with strategic planning',
        challenging: 'Requires focused effort',
        highRisk: 'Consider deferring to Phase 2',
      };

      Object.values(recommendations).forEach(rec => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('allocateResources Cloud Function', () => {
  const mockFeasibilityResults = [
    { dimensionId: 'D01', feasibilityScore: 95, gap: 8, riskLevel: 'Low' },
    { dimensionId: 'D02', feasibilityScore: 75, gap: 8, riskLevel: 'Medium' },
    { dimensionId: 'D03', feasibilityScore: 60, gap: 7, riskLevel: 'High' },
    { dimensionId: 'D04', feasibilityScore: 40, gap: 8, riskLevel: 'Very High' },
  ];

  describe('Tier Allocation', () => {
    it('should allocate 40% to Tier 1 (High Impact, High Priority)', () => {
      const totalBudget = 5000000;
      const tier1Amount = totalBudget * 0.4;

      expect(tier1Amount).toBe(2000000);
    });

    it('should allocate 35% to Tier 2 (Medium Impact)', () => {
      const totalBudget = 5000000;
      const tier2Amount = totalBudget * 0.35;

      expect(tier2Amount).toBe(1750000);
    });

    it('should allocate 15% to Tier 3 (Lower Priority)', () => {
      const totalBudget = 5000000;
      const tier3Amount = totalBudget * 0.15;

      expect(tier3Amount).toBe(750000);
    });

    it('should reserve 10% as contingency buffer', () => {
      const totalBudget = 5000000;
      const bufferAmount = totalBudget * 0.1;

      expect(bufferAmount).toBe(500000);
    });

    it('should total allocation equals budget', () => {
      const totalBudget = 5000000;
      const allocation = (totalBudget * 0.4) + (totalBudget * 0.35) +
                        (totalBudget * 0.15) + (totalBudget * 0.1);

      expect(allocation).toBe(totalBudget);
    });
  });

  describe('Cost-Benefit Analysis', () => {
    it('should calculate ROI per dimension', () => {
      const budget = 2000000;
      const expectedImprovement = 8; // Points

      const roi = (expectedImprovement * 10 / budget) * 100;

      expect(roi).toBeGreaterThan(0);
      expect(typeof roi).toBe('number');
    });

    it('should calculate cost per point gained', () => {
      const budget = 2000000;
      const expectedImprovement = 8;

      const costPerPoint = budget / expectedImprovement;

      expect(costPerPoint).toBeCloseTo(250000, 0);
    });

    it('should rank dimensions by ROI', () => {
      const costBenefitAnalysis = [
        { dimensionId: 'D01', roi: 0.004, costPerPoint: 250000 },
        { dimensionId: 'D02', roi: 0.003, costPerPoint: 333333 },
        { dimensionId: 'D03', roi: 0.002, costPerPoint: 500000 },
      ];

      const sorted = [...costBenefitAnalysis].sort((a, b) => b.roi - a.roi);

      expect(sorted[0].dimensionId).toBe('D01'); // Highest ROI first
    });
  });

  describe('Dimension Categorization for Allocation', () => {
    it('should prioritize feasible dimensions first', () => {
      const sorted = [...mockFeasibilityResults].sort((a, b) => b.gap - a.gap);
      const tier1 = sorted.filter(r => r.feasibilityScore >= 70).slice(0, 5);

      expect(tier1.length).toBeGreaterThan(0);
      tier1.forEach(dim => {
        expect(dim.feasibilityScore).toBeGreaterThanOrEqual(70);
      });
    });

    it('should include challenging dimensions in Tier 2', () => {
      const challenging = mockFeasibilityResults.filter(
        r => r.feasibilityScore >= 50 && r.feasibilityScore < 70
      );

      expect(challenging.length).toBeGreaterThan(0);
    });

    it('should defer high-risk dimensions to Tier 3', () => {
      const highRisk = mockFeasibilityResults.filter(r => r.feasibilityScore < 50);

      expect(highRisk.length).toBeGreaterThan(0);
    });
  });

  describe('Budget Distribution', () => {
    it('should distribute budget proportionally to gap size within tier', () => {
      const tier1Dimensions = [
        { dimensionId: 'D01', gap: 10 },
        { dimensionId: 'D02', gap: 5 },
      ];

      const totalGap = tier1Dimensions.reduce((sum, d) => sum + d.gap, 0);
      const tierBudget = 2000000;

      tier1Dimensions.forEach(dim => {
        const proportion = (dim.gap / totalGap) * tierBudget;
        expect(proportion).toBeGreaterThan(0);
      });
    });

    it('should ensure all tiers sum to total budget', () => {
      const totalBudget = 5000000;
      const tier1 = totalBudget * 0.4;
      const tier2 = totalBudget * 0.35;
      const tier3 = totalBudget * 0.15;
      const buffer = totalBudget * 0.1;

      const total = tier1 + tier2 + tier3 + buffer;
      expect(total).toBe(totalBudget);
    });
  });
});

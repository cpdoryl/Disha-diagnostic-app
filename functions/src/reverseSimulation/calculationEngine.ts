// CalculationEngine.ts - Core reverse simulation logic

interface DimensionData {
  [key: string]: number;
}

interface ReverseCalculationResult {
  requiredPoints: number;
  currentPoints: number;
  gap: number;
  gapPercentage: number;
  dimensionTargets: DimensionData;
  allocationByDimension: DimensionData;
  estimatedOutcome: number;
}

interface AllocationResult {
  tier1: number;
  tier2: number;
  tier3: number;
  buffer: number;
  total: number;
  tierPercentages: {
    tier1: number;
    tier2: number;
    tier3: number;
    buffer: number;
  };
}

interface FeasibilityResult {
  dimensionId: string;
  currentScore: number;
  targetScore: number;
  gap: number;
  gapPercentage: number;
  feasibilityScore: number;
  feasibilityBand: string;
  riskLevel: string;
  recommendations: string[];
}

export class CalculationEngine {
  // 14 Dimensions with weights (totaling 109%)
  private dimensionWeights: DimensionData = {
    D01: 10, // Academic
    D02: 9,  // Teacher Welfare
    D03: 10, // Leadership
    D04: 8,  // Parent Engagement
    D05: 10, // Safety
    D06: 7,  // Infrastructure
    D07: 6,  // Co-Curricular
    D08: 9,  // Individual Attention
    D09: 7,  // Value for Money
    D10: 6,  // Special Needs
    D11: 5,  // Community Service
    D12: 9,  // Faculty Competence
    D13: 6,  // Internationalism
    D14: 8,  // Management Vision
  };

  private totalWeight = 109;

  // Dimension difficulty ratings (1-5, where 5 is hardest to improve)
  private dimensionDifficulty: DimensionData = {
    D01: 4, // Academic - medium-high
    D02: 3, // Teacher Welfare - medium
    D03: 3, // Leadership - medium
    D04: 2, // Parent Engagement - low
    D05: 4, // Safety - medium-high
    D06: 5, // Infrastructure - very high (capital intensive)
    D07: 2, // Co-Curricular - low
    D08: 3, // Individual Attention - medium
    D09: 4, // Value for Money - medium-high
    D10: 4, // Special Needs - medium-high
    D11: 2, // Community Service - low
    D12: 3, // Faculty Competence - medium
    D13: 5, // Internationalism - very high
    D14: 2, // Management Vision - low
  };

  /**
   * Perform reverse calculation to determine dimension targets
   * Working backwards from overall goal to specific dimension targets
   */
  performReverseCalculation(
    currentHealth: number,
    currentDimensions: DimensionData,
    targetHealth: number,
    timelineMonths: number,
    budget: number,
    allocationStrategy: string = 'strategic'
  ): ReverseCalculationResult {
    // Step 1: Calculate required and current points
    const requiredPoints = (targetHealth / 100) * this.totalWeight;
    const currentPoints = (currentHealth / 100) * this.totalWeight;
    const gap = requiredPoints - currentPoints;
    const gapPercentage = (gap / currentPoints) * 100;

    // Step 2: Calculate dimension targets based on gap distribution
    const dimensionTargets = this.calculateDimensionTargets(
      currentDimensions,
      gap,
      timelineMonths,
      budget
    );

    // Step 3: Allocate budget to dimensions
    const allocationByDimension = this.allocateBudgetByDimension(
      dimensionTargets,
      currentDimensions,
      budget,
      allocationStrategy
    );

    // Step 4: Estimate outcome based on allocations
    const estimatedOutcome = this.estimateOutcome(
      currentDimensions,
      allocationByDimension,
      timelineMonths
    );

    return {
      requiredPoints,
      currentPoints,
      gap,
      gapPercentage,
      dimensionTargets,
      allocationByDimension,
      estimatedOutcome,
    };
  }

  /**
   * Calculate dimension-specific targets based on gap distribution
   */
  private calculateDimensionTargets(
    currentDimensions: DimensionData,
    totalGap: number,
    timelineMonths: number,
    budget: number
  ): DimensionData {
    const targets: DimensionData = {};
    const feasibilityScores: DimensionData = {};

    // Calculate feasibility for each dimension
    Object.keys(currentDimensions).forEach((dimId) => {
      const current = currentDimensions[dimId];
      const weight = this.dimensionWeights[dimId] || 1;
      const difficulty = this.dimensionDifficulty[dimId] || 3;

      // Calculate how much this dimension can realistically improve
      const maxImprovement = 40 - (current * 0.3); // Higher current = less room to improve
      const timelineMultiplier = Math.min(timelineMonths / 12, 1.5); // More time = more improvement possible
      const budgetPerDimension = budget / 14; // Simple division by dimensions
      const budgetMultiplier = Math.min((budgetPerDimension / 1000000) * 0.5, 1.5); // More budget = more improvement
      const difficultyMultiplier = 1 / difficulty; // Higher difficulty = less improvement

      const feasibilityScore =
        maxImprovement *
        timelineMultiplier *
        budgetMultiplier *
        difficultyMultiplier;

      feasibilityScores[dimId] = feasibilityScore;
    });

    // Normalize and distribute gap based on feasibility
    const totalFeasibility = Object.values(feasibilityScores).reduce(
      (a, b) => a + b,
      0
    );

    Object.keys(currentDimensions).forEach((dimId) => {
      const current = currentDimensions[dimId];
      const feasibility = feasibilityScores[dimId];
      const proportionalGap = (feasibility / totalFeasibility) * totalGap;

      // Cap target at 100
      targets[dimId] = Math.min(100, current + proportionalGap);
    });

    return targets;
  }

  /**
   * Allocate budget across dimensions based on impact and priority
   */
  private allocateBudgetByDimension(
    targets: DimensionData,
    current: DimensionData,
    totalBudget: number,
    strategy: string
  ): DimensionData {
    const allocation: DimensionData = {};

    // Calculate gap percentage for each dimension (impact metric)
    const dimensionImpact: DimensionData = {};
    const gaps: DimensionData = {};

    Object.keys(targets).forEach((dimId) => {
      const gap = targets[dimId] - current[dimId];
      gaps[dimId] = gap;
      const weight = this.dimensionWeights[dimId] || 1;
      dimensionImpact[dimId] = (gap * weight) / 100;
    });

    const totalImpact = Object.values(dimensionImpact).reduce((a, b) => a + b, 0);

    // Allocate based on strategy
    Object.keys(targets).forEach((dimId) => {
      let proportion: number;

      if (strategy === 'uniform') {
        // Equal distribution
        proportion = 1 / 14;
      } else if (strategy === 'aggressive') {
        // Focus on highest impact
        const impact = dimensionImpact[dimId];
        proportion = (impact / totalImpact) * 1.2; // Weight impact by 120%
      } else {
        // Strategic (default) - balanced approach
        const impact = dimensionImpact[dimId];
        const weight = this.dimensionWeights[dimId] || 1;
        proportion =
          ((impact / totalImpact) * 0.6 + (weight / 109) * 0.4) / 14 * 14;
      }

      allocation[dimId] = Math.max(0, totalBudget * proportion);
    });

    return allocation;
  }

  /**
   * Estimate outcome health score based on allocations and timeline
   */
  private estimateOutcome(
    currentDimensions: DimensionData,
    allocation: DimensionData,
    timelineMonths: number
  ): number {
    let estimatedPoints = 0;

    Object.keys(currentDimensions).forEach((dimId) => {
      const current = currentDimensions[dimId];
      const budget = allocation[dimId];
      const difficulty = this.dimensionDifficulty[dimId] || 3;
      const weight = this.dimensionWeights[dimId] || 1;

      // Calculate improvement: more budget, less difficulty, more months = more improvement
      const baseImprovement = (budget / 1000000) * (timelineMonths / 12) * (5 / difficulty);
      const cappedImprovement = Math.min(baseImprovement, 40 - current * 0.3);

      estimatedPoints += ((current + cappedImprovement) * weight) / 100;
    });

    return Math.round((estimatedPoints / this.totalWeight) * 100);
  }

  /**
   * Analyze feasibility of targets given timeline and budget
   */
  analyzeFeasibility(
    currentDimensions: DimensionData,
    targetDimensions: DimensionData,
    timelineMonths: number,
    budget: number
  ): FeasibilityResult[] {
    const results: FeasibilityResult[] = [];

    Object.keys(targetDimensions).forEach((dimId) => {
      const current = currentDimensions[dimId] || 0;
      const target = targetDimensions[dimId];
      const gap = target - current;
      const gapPercentage = (gap / current) * 100;
      const difficulty = this.dimensionDifficulty[dimId] || 3;

      // Feasibility calculation: 100 - [0.3×Gap% + 0.2×Timeline% + 0.2×Cost% + 0.3×Difficulty%]
      const gapScore = Math.min(gapPercentage / 100, 1); // Normalize to 0-1
      const timelineScore = Math.max(0, 1 - timelineMonths / 24); // Tighter timeline = higher risk
      const costScore = Math.max(0, 1 - (budget / 1000000) * 0.1); // Lower budget = higher risk
      const difficultyScore = (difficulty - 1) / 4; // Normalize to 0-1

      const feasibilityScore = Math.round(
        100 - [0.3 * gapScore + 0.2 * timelineScore + 0.2 * costScore + 0.3 * difficultyScore]
          .reduce((a, b) => a + b, 0) * 100
      );

      // Determine band and risk
      let feasibilityBand: string;
      let riskLevel: string;
      const recommendations: string[] = [];

      if (feasibilityScore >= 90) {
        feasibilityBand = 'Highly Feasible';
        riskLevel = 'Low';
        recommendations.push('Implement immediately');
      } else if (feasibilityScore >= 70) {
        feasibilityBand = 'Feasible';
        riskLevel = 'Medium';
        recommendations.push('Implement with strategic planning');
      } else if (feasibilityScore >= 50) {
        feasibilityBand = 'Challenging';
        riskLevel = 'High';
        recommendations.push('Requires focused effort and resources');
        recommendations.push('Consider phased approach');
      } else {
        feasibilityBand = 'High Risk';
        riskLevel = 'Very High';
        recommendations.push('May need to defer to Phase 2');
        recommendations.push('Requires external support or funding');
      }

      results.push({
        dimensionId: dimId,
        currentScore: current,
        targetScore: target,
        gap,
        gapPercentage,
        feasibilityScore,
        feasibilityBand,
        riskLevel,
        recommendations,
      });
    });

    return results;
  }

  /**
   * Allocate budget using tiered strategy
   */
  allocateResourcesByTier(
    feasibilityResults: FeasibilityResult[],
    totalBudget: number
  ): AllocationResult {
    // Sort by feasibility and priority
    const tier1Dims = feasibilityResults
      .filter((r) => r.feasibilityScore >= 70)
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 4); // Top 4 dimensions

    const tier2Dims = feasibilityResults
      .filter(
        (r) => r.feasibilityScore >= 50 && r.feasibilityScore < 70
      )
      .slice(0, 5); // Next 5 dimensions

    const tier3Dims = feasibilityResults
      .filter((r) => r.feasibilityScore < 50)
      .slice(0, 3); // Remaining dimensions, phased

    const tier1Amount = totalBudget * 0.4;
    const tier2Amount = totalBudget * 0.35;
    const tier3Amount = totalBudget * 0.15;
    const bufferAmount = totalBudget * 0.1;

    return {
      tier1: tier1Amount,
      tier2: tier2Amount,
      tier3: tier3Amount,
      buffer: bufferAmount,
      total: totalBudget,
      tierPercentages: {
        tier1: 40,
        tier2: 35,
        tier3: 15,
        buffer: 10,
      },
    };
  }

  /**
   * Generate timeline with milestones
   */
  generateTimeline(
    targets: DimensionData,
    current: DimensionData,
    timelineMonths: number
  ): any {
    const timeline: any = {
      totalMonths: timelineMonths,
      phases: [],
      milestones: [],
    };

    // Phase 1: Foundation (Months 1-3) - 25% of gap
    const phase1Target = 0.25;
    timeline.phases.push({
      phase: 1,
      name: 'Foundation',
      months: 3,
      description: 'Quick wins + setup',
      targetImprovement: phase1Target,
    });

    timeline.milestones.push({
      month: 0,
      name: 'Kickoff',
      description: 'Plan approved, team aligned',
    });

    timeline.milestones.push({
      month: 3,
      name: 'Phase 1 Complete',
      description: 'Quick wins visible',
      targetScore: phase1Target,
    });

    // Phase 2: Build (Months 4-9) - 50% of gap
    timeline.phases.push({
      phase: 2,
      name: 'Build',
      months: 6,
      description: 'Major implementations',
      targetImprovement: 0.5,
    });

    timeline.milestones.push({
      month: 6,
      name: 'Mid-Year Review',
      description: 'Major projects 50% done',
    });

    timeline.milestones.push({
      month: 9,
      name: 'Phase 2 Complete',
      description: 'Major improvements realized',
      targetScore: 0.75,
    });

    // Phase 3: Optimize (Months 10-12) - 25% of gap + fine-tuning
    timeline.phases.push({
      phase: 3,
      name: 'Optimize',
      months: Math.max(3, timelineMonths - 9),
      description: 'Fine-tune & assess',
      targetImprovement: 1.0,
    });

    timeline.milestones.push({
      month: timelineMonths,
      name: 'Final Assessment',
      description: 'Target achieved',
      targetScore: 1.0,
    });

    return timeline;
  }

  /**
   * Get dimension weight
   */
  getDimensionWeight(dimensionId: string): number {
    return this.dimensionWeights[dimensionId] || 1;
  }

  /**
   * Get total weight
   */
  getTotalWeight(): number {
    return this.totalWeight;
  }

  /**
   * Get all dimensions
   */
  getAllDimensions(): string[] {
    return Object.keys(this.dimensionWeights);
  }
}

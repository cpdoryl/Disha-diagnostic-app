/**
 * DISHA Stage 3: Reverse Calculation Engine
 * Core mathematical engine for reverse outcome modeling
 *
 * Responsible for:
 * - Calculating required targets based on goal
 * - Strategic allocation across dimensions
 * - Feasibility adjustments
 * - ROI and cost calculations
 */

import { logger } from '../utils/logger';

// Type definitions
interface DimensionWeights {
  [key: string]: number;
}

interface DimensionScore {
  current: number;
  weight: number;
}

interface DimensionTarget {
  current: number;
  target: number;
  gap: number;
  weight: number;
  contribution: number;
  gainPoints: number;
  difficulty: number;
  priority: 'TIER1' | 'TIER2' | 'TIER3' | 'DEFERRED';
  allocationReason: string;
  expectedImpact: number;
  confidence: number;
}

interface ReverseCalculationResult {
  requiredPoints: number;
  currentPoints: number;
  gap: number;
  dimensionTargets: Record<string, DimensionTarget>;
  allocationStrategy: string;
  feasibilityAdjustments: Record<string, number>;
  calculationMetadata: {
    calculatedAt: Date;
    algorithm: string;
    version: string;
  };
}

/**
 * CalculationEngine: Core reverse calculation logic
 */
class CalculationEngine {
  /**
   * 14-Dimension weights (totaling 109%)
   * These define the relative importance of each dimension
   */
  private readonly dimensionWeights: DimensionWeights = {
    D01: 10,  // Academic
    D02: 9,   // Teacher Welfare
    D03: 10,  // Leadership
    D04: 8,   // Parent Engagement
    D05: 10,  // Safety
    D06: 7,   // Infrastructure
    D07: 6,   // Co-Curricular
    D08: 9,   // Individual Attention
    D09: 7,   // Value for Money
    D10: 6,   // Special Needs
    D11: 5,   // Community Service
    D12: 9,   // Faculty Competence
    D13: 6,   // Internationalism
    D14: 8,   // Management Vision
  };

  /**
   * Difficulty ratings for each dimension
   * Scale: 1 (easy to improve) to 10 (hard to improve)
   */
  private readonly difficultyRatings: Record<string, number> = {
    D01: 7,   // Academic - requires curriculum change
    D02: 6,   // Teacher Welfare - requires salary commitment
    D03: 5,   // Leadership - process change
    D04: 2,   // Parent Engagement - communication
    D05: 7,   // Safety - requires infrastructure + training
    D06: 9,   // Infrastructure - capital intensive
    D07: 3,   // Co-Curricular - program launch
    D08: 9,   // Individual Attention - class size constraint
    D09: 5,   // Value for Money - pricing perception
    D10: 7,   // Special Needs - staff + facilities
    D11: 2,   // Community Service - partnership-based
    D12: 6,   // Faculty Competence - hiring + training
    D13: 7,   // Internationalism - curriculum + training
    D14: 1,   // Management Vision - planning process
  };

  constructor() {
    logger.info('CalculationEngine initialized');
  }

  /**
   * Perform complete reverse calculation
   *
   * @param currentHealth Current health index (0-100)
   * @param currentDimensions Current scores for all 14 dimensions
   * @param targetHealth Target health index (0-100)
   * @param timeline Timeline in months (3, 6, 12, 18, 24)
   * @param budget Total budget available (rupees)
   * @param allocationStrategy Strategy to use: 'uniform', 'strategic', or 'aggressive'
   * @returns Complete reverse calculation result
   */
  async performReverseCalculation(
    currentHealth: number,
    currentDimensions: Record<string, number>,
    targetHealth: number,
    timeline: number,
    budget: number,
    allocationStrategy: string = 'strategic'
  ): Promise<ReverseCalculationResult> {
    try {
      logger.info('Starting reverse calculation', {
        currentHealth,
        targetHealth,
        timeline,
        budget,
        allocationStrategy,
      });

      // Step 1: Calculate total weights
      const totalWeight = this.calculateTotalWeight();

      // Step 2: Calculate required and current points
      const requiredPoints = this.calculateRequiredPoints(targetHealth, totalWeight);
      const currentPoints = this.calculateCurrentPoints(currentDimensions, totalWeight);
      const gap = requiredPoints - currentPoints;

      logger.info('Points calculation', {
        requiredPoints,
        currentPoints,
        gap,
        totalWeight,
      });

      // Step 3: Validate feasibility
      if (gap < 0) {
        throw new Error('Target health must be greater than or equal to current health');
      }

      // Step 4: Allocate dimension targets based on strategy
      let dimensionTargets: Record<string, DimensionTarget>;

      switch (allocationStrategy) {
        case 'uniform':
          dimensionTargets = this.allocateUniform(
            currentDimensions,
            gap,
            totalWeight
          );
          break;

        case 'aggressive':
          dimensionTargets = this.allocateAggressive(
            currentDimensions,
            gap,
            totalWeight,
            timeline,
            budget
          );
          break;

        case 'strategic':
        default:
          dimensionTargets = this.allocateStrategic(
            currentDimensions,
            gap,
            totalWeight,
            timeline,
            budget
          );
          break;
      }

      // Step 5: Validate allocation adds up correctly
      this.validateAllocation(dimensionTargets, requiredPoints, totalWeight);

      // Step 6: Calculate feasibility adjustments
      const feasibilityAdjustments = this.calculateFeasibilityAdjustments(
        dimensionTargets,
        timeline,
        budget
      );

      // Step 7: Apply adjustments if needed
      const adjustedTargets = this.applyFeasibilityAdjustments(
        dimensionTargets,
        feasibilityAdjustments
      );

      logger.info('Reverse calculation completed successfully', {
        totalDimensions: Object.keys(adjustedTargets).length,
        allocationStrategy,
      });

      return {
        requiredPoints,
        currentPoints,
        gap,
        dimensionTargets: adjustedTargets,
        allocationStrategy,
        feasibilityAdjustments,
        calculationMetadata: {
          calculatedAt: new Date(),
          algorithm: 'ReverseCalculation_v1',
          version: '1.0',
        },
      };
    } catch (error) {
      logger.error('Reverse calculation failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Calculate total weight across all dimensions
   * Should equal 109%
   */
  private calculateTotalWeight(): number {
    return Object.values(this.dimensionWeights).reduce((sum, weight) => sum + weight, 0);
  }

  /**
   * Formula 1: Calculate required points to reach target health
   * Required_Points = (Target_Index / 100) × Total_Weight
   */
  private calculateRequiredPoints(targetHealth: number, totalWeight: number): number {
    return (targetHealth / 100) * totalWeight;
  }

  /**
   * Formula 2: Calculate current total points
   * Current_Points = (Current_Index / 100) × Total_Weight
   */
  private calculateCurrentPoints(
    currentDimensions: Record<string, number>,
    totalWeight: number
  ): number {
    let totalPoints = 0;

    for (const [dimension, score] of Object.entries(currentDimensions)) {
      const weight = this.dimensionWeights[dimension];
      const pointsFromDimension = (score / 100) * weight;
      totalPoints += pointsFromDimension;
    }

    return totalPoints;
  }

  /**
   * Uniform Allocation Strategy
   * Each dimension improves proportionally by (Gap / 14)
   *
   * ISSUE: Ignores starting positions and difficulty
   * Use case: Quick baseline allocation
   */
  private allocateUniform(
    currentDimensions: Record<string, number>,
    gap: number,
    totalWeight: number
  ): Record<string, DimensionTarget> {
    const perDimensionGain = gap / 14; // 14 dimensions
    const targets: Record<string, DimensionTarget> = {};

    for (const [dimension, currentScore] of Object.entries(currentDimensions)) {
      const weight = this.dimensionWeights[dimension];
      const targetScore = Math.min(100, currentScore + (perDimensionGain / weight) * 100);

      targets[dimension] = {
        current: currentScore,
        target: Math.round(targetScore * 100) / 100,
        gap: Math.round((targetScore - currentScore) * 100) / 100,
        weight,
        contribution: (targetScore / 100) * weight,
        gainPoints: (targetScore / 100) * weight - (currentScore / 100) * weight,
        difficulty: this.difficultyRatings[dimension],
        priority: this.determinePriority(currentScore, this.difficultyRatings[dimension]),
        allocationReason: 'Uniform allocation - all dimensions improve equally',
        expectedImpact: (targetScore - currentScore) / 100,
        confidence: 60,
      };
    }

    return targets;
  }

  /**
   * Strategic Allocation Strategy (RECOMMENDED)
   * Allocate based on:
   * 1. Current Strength (maintain advantage)
   * 2. Improvement Difficulty
   * 3. Weight Importance
   * 4. Strategic Priority
   *
   * Most balanced approach for realistic improvement
   */
  private allocateStrategic(
    currentDimensions: Record<string, number>,
    gap: number,
    totalWeight: number,
    timeline: number,
    budget: number
  ): Record<string, DimensionTarget> {
    const targets: Record<string, DimensionTarget> = {};

    // Calculate allocation for each dimension based on multiple factors
    const allocations = this.calculateStrategicAllocations(
      currentDimensions,
      gap,
      timeline,
      budget
    );

    for (const [dimension, allocatedGap] of Object.entries(allocations)) {
      const currentScore = currentDimensions[dimension];
      const weight = this.dimensionWeights[dimension];
      const difficulty = this.difficultyRatings[dimension];

      // Convert allocated gap points back to score
      const allocatedScoreGap = (allocatedGap / weight) * 100;
      const targetScore = Math.min(100, currentScore + allocatedScoreGap);

      targets[dimension] = {
        current: currentScore,
        target: Math.round(targetScore * 100) / 100,
        gap: Math.round(allocatedScoreGap * 100) / 100,
        weight,
        contribution: (targetScore / 100) * weight,
        gainPoints: allocatedGap,
        difficulty,
        priority: this.determinePriority(currentScore, difficulty),
        allocationReason: this.getStrategicReason(currentScore, difficulty, weight),
        expectedImpact: (targetScore - currentScore) / 100,
        confidence: this.calculateConfidence(difficulty, timeline),
      };
    }

    return targets;
  }

  /**
   * Aggressive Allocation Strategy
   * Push for maximum gains within constraints
   */
  private allocateAggressive(
    currentDimensions: Record<string, number>,
    gap: number,
    totalWeight: number,
    timeline: number,
    budget: number
  ): Record<string, DimensionTarget> {
    const targets = this.allocateStrategic(
      currentDimensions,
      gap,
      totalWeight,
      timeline,
      budget
    );

    // Increase targets for easy improvements
    for (const [dimension, target] of Object.entries(targets)) {
      if (target.difficulty <= 3) {
        // Easy to improve - push higher
        const additionalGap = target.gap * 0.2; // 20% boost
        target.target = Math.min(100, target.target + (additionalGap / target.weight) * 100);
        target.gap = target.target - target.current;
        target.priority = 'TIER1';
        target.confidence = Math.min(100, target.confidence + 10);
      }
    }

    return targets;
  }

  /**
   * Calculate strategic allocations based on multiple factors
   */
  private calculateStrategicAllocations(
    currentDimensions: Record<string, number>,
    gap: number,
    timeline: number,
    budget: number
  ): Record<string, number> {
    const allocations: Record<string, number> = {};
    let allocatedSoFar = 0;

    // Tier 1: Critical dimensions that need focus
    const tier1Dimensions = this.getTier1Dimensions(currentDimensions);
    const tier1Gap = gap * 0.50; // 50% of total gap

    for (const dimension of tier1Dimensions) {
      const weight = this.dimensionWeights[dimension];
      allocations[dimension] = (tier1Gap / tier1Dimensions.length);
      allocatedSoFar += allocations[dimension];
    }

    // Tier 2: Important dimensions
    const tier2Dimensions = this.getTier2Dimensions(currentDimensions);
    const tier2Gap = gap * 0.40; // 40% of total gap

    for (const dimension of tier2Dimensions) {
      allocations[dimension] = (tier2Gap / tier2Dimensions.length);
      allocatedSoFar += allocations[dimension];
    }

    // Tier 3: Supporting dimensions
    const tier3Dimensions = this.getTier3Dimensions(currentDimensions);
    const tier3Gap = gap - allocatedSoFar; // Remaining gap

    for (const dimension of tier3Dimensions) {
      allocations[dimension] = (tier3Gap / tier3Dimensions.length);
    }

    return allocations;
  }

  /**
   * Get Tier 1 dimensions (critical, weak)
   */
  private getTier1Dimensions(currentDimensions: Record<string, number>): string[] {
    return Object.entries(currentDimensions)
      .filter(([_, score]) => score < 70) // Weak dimensions
      .map(([dimension, _]) => dimension);
  }

  /**
   * Get Tier 2 dimensions (important)
   */
  private getTier2Dimensions(currentDimensions: Record<string, number>): string[] {
    return Object.entries(currentDimensions)
      .filter(([_, score]) => score >= 70 && score < 80)
      .map(([dimension, _]) => dimension);
  }

  /**
   * Get Tier 3 dimensions (supporting)
   */
  private getTier3Dimensions(currentDimensions: Record<string, number>): string[] {
    return Object.entries(currentDimensions)
      .filter(([_, score]) => score >= 80)
      .map(([dimension, _]) => dimension);
  }

  /**
   * Determine priority tier based on current score and difficulty
   */
  private determinePriority(
    currentScore: number,
    difficulty: number
  ): 'TIER1' | 'TIER2' | 'TIER3' | 'DEFERRED' {
    if (currentScore < 70 && difficulty <= 6) return 'TIER1';
    if (currentScore < 70 && difficulty > 6) return 'TIER2';
    if (currentScore >= 70 && currentScore < 80) return 'TIER2';
    if (currentScore >= 80 && difficulty <= 5) return 'TIER2';
    if (currentScore >= 80 && difficulty > 5) return 'TIER3';
    if (difficulty >= 8 && currentScore >= 80) return 'DEFERRED';
    return 'TIER3';
  }

  /**
   * Get strategic reason for allocation
   */
  private getStrategicReason(
    currentScore: number,
    difficulty: number,
    weight: number
  ): string {
    if (currentScore < 70) {
      return 'Critical weakness - prioritize fixing';
    }
    if (difficulty > 7) {
      return 'High difficulty - allocate resources carefully';
    }
    if (weight >= 9) {
      return 'High weight - significant impact on overall health';
    }
    return 'Strategic focus area for improvement';
  }

  /**
   * Calculate confidence level based on difficulty and timeline
   */
  private calculateConfidence(difficulty: number, timeline: number): number {
    // More time + less difficulty = higher confidence
    let confidence = 100;

    // Difficulty factor (1-10)
    confidence -= difficulty * 3;

    // Timeline factor
    if (timeline >= 12) {
      confidence += 10;
    } else if (timeline >= 6) {
      confidence += 5;
    }

    return Math.max(30, Math.min(100, confidence));
  }

  /**
   * Calculate feasibility adjustments
   */
  private calculateFeasibilityAdjustments(
    dimensionTargets: Record<string, DimensionTarget>,
    timeline: number,
    budget: number
  ): Record<string, number> {
    const adjustments: Record<string, number> = {};

    for (const [dimension, target] of Object.entries(dimensionTargets)) {
      const difficulty = target.difficulty;

      // Calculate adjustment factor based on constraints
      let adjustmentFactor = 1.0;

      // Difficulty-based adjustment
      if (difficulty > 8) {
        adjustmentFactor *= 0.8; // Reduce target by 20%
      }

      // Timeline-based adjustment
      if (timeline < 6 && difficulty > 5) {
        adjustmentFactor *= 0.9; // Reduce target by 10%
      }

      // Budget-based adjustment (placeholder)
      // Would need cost data to implement properly

      adjustments[dimension] = adjustmentFactor;
    }

    return adjustments;
  }

  /**
   * Apply feasibility adjustments to targets
   */
  private applyFeasibilityAdjustments(
    dimensionTargets: Record<string, DimensionTarget>,
    feasibilityAdjustments: Record<string, number>
  ): Record<string, DimensionTarget> {
    const adjustedTargets = { ...dimensionTargets };

    for (const [dimension, adjustment] of Object.entries(feasibilityAdjustments)) {
      if (adjustment < 1.0) {
        // Need to reduce target
        const target = adjustedTargets[dimension];
        const currentScore = target.current;
        const originalTarget = target.target;

        // Calculate adjusted target
        const gap = originalTarget - currentScore;
        const adjustedGap = gap * adjustment;
        const adjustedTarget = currentScore + adjustedGap;

        adjustedTargets[dimension] = {
          ...target,
          target: Math.round(adjustedTarget * 100) / 100,
          gap: Math.round(adjustedGap * 100) / 100,
          gainPoints: (adjustedTarget / 100) * target.weight - (currentScore / 100) * target.weight,
          confidence: Math.max(50, target.confidence - 10),
        };
      }
    }

    return adjustedTargets;
  }

  /**
   * Validate that allocation adds up correctly
   */
  private validateAllocation(
    dimensionTargets: Record<string, DimensionTarget>,
    requiredPoints: number,
    totalWeight: number
  ): void {
    let totalContribution = 0;

    for (const target of Object.values(dimensionTargets)) {
      totalContribution += target.contribution;
    }

    const difference = Math.abs(totalContribution - requiredPoints);

    // Allow small rounding differences
    if (difference > 0.5) {
      logger.warn('Allocation validation warning', {
        expected: requiredPoints,
        actual: totalContribution,
        difference,
      });
    }
  }
}

export { CalculationEngine, ReverseCalculationResult, DimensionTarget };

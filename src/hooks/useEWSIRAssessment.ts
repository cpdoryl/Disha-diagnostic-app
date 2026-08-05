/**
 * DISHA 14-Dimension EWISR Assessment Hook
 * Manages assessment state, calculations, and persistence
 */

import { useState, useCallback, useMemo } from 'react';
import {
  ALL_DIMENSIONS,
  SCORING_FORMULAS,
  HEALTH_STATUS_CLASSIFICATION,
  ACTION_PLANNING_THRESHOLDS
} from '@/data/dimensionalAssessmentData';
import type { Dimension } from '@/data/dimensionalAssessmentData';

// ============================================================================
// TYPES
// ============================================================================

export interface DimensionResponse {
  dimensionId: string;
  questionId: string;
  selectedOptionWeight: number;
}

export interface AssessmentState {
  schoolName: string;
  assessmentDate: Date;
  responses: DimensionResponse[];
}

export interface DimensionScore {
  dimensionId: string;
  label: string;
  weight: number;
  tier: string;
  averageWeight: number;
  score: number; // 0-100
  benchmark: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  classification: 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Below Average' | 'Critical';
}

export interface OverallAssessment {
  schoolName: string;
  assessmentDate: Date;
  dimensionScores: DimensionScore[];
  weightedContributions: number[];
  overallHealthIndex: number;
  healthStatus: string;
  recommendation: string;
  actionPlan: ActionItem[];
}

export interface ActionItem {
  dimensionId: string;
  dimensionLabel: string;
  currentScore: number;
  targetScore: number;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendations: string[];
  timeline: string;
}

// ============================================================================
// HOOK
// ============================================================================

export const useEWSIRAssessment = (schoolName: string = 'My School') => {
  const [assessmentState, setAssessmentState] = useState<AssessmentState>({
    schoolName,
    assessmentDate: new Date(),
    responses: []
  });

  // Record a response for a question
  const recordResponse = useCallback(
    (dimensionId: string, questionId: string, selectedWeight: number) => {
      setAssessmentState((prev) => {
        const newResponses = [...prev.responses];

        // Remove existing response for this question if present
        const existingIndex = newResponses.findIndex(
          (r) => r.dimensionId === dimensionId && r.questionId === questionId
        );

        if (existingIndex >= 0) {
          newResponses[existingIndex].selectedOptionWeight = selectedWeight;
        } else {
          newResponses.push({
            dimensionId,
            questionId,
            selectedOptionWeight: selectedWeight
          });
        }

        return { ...prev, responses: newResponses };
      });
    },
    []
  );

  // Calculate dimension scores
  const calculateDimensionScores = useCallback((): DimensionScore[] => {
    return ALL_DIMENSIONS.map((dimension: Dimension) => {
      // Get all responses for this dimension
      const dimensionResponses = assessmentState.responses.filter(
        (r) => r.dimensionId === dimension.dimensionId
      );

      if (dimensionResponses.length === 0) {
        return {
          dimensionId: dimension.dimensionId,
          label: dimension.label,
          weight: dimension.weight,
          tier: dimension.tier,
          averageWeight: 0,
          score: 0,
          benchmark: dimension.benchmarks,
          classification: 'Critical'
        };
      }

      // Calculate average weight
      const totalWeight = dimensionResponses.reduce(
        (sum, r) => sum + r.selectedOptionWeight,
        0
      );
      const averageWeight = totalWeight / dimensionResponses.length;

      // Convert to 0-100 scale
      const score = SCORING_FORMULAS.dimensionScore(averageWeight);

      // Classify based on benchmark
      let classification: 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Below Average' | 'Critical' =
        'Critical';

      if (score >= dimension.benchmarks.excellent) {
        classification = 'Excellent';
      } else if (score >= dimension.benchmarks.good) {
        classification = 'Good';
      } else if (score >= dimension.benchmarks.average) {
        classification = 'Average';
      } else if (score >= dimension.benchmarks.poor) {
        classification = 'Poor';
      } else {
        classification = 'Below Average';
      }

      return {
        dimensionId: dimension.dimensionId,
        label: dimension.label,
        weight: dimension.weight,
        tier: dimension.tier,
        averageWeight,
        score,
        benchmark: dimension.benchmarks,
        classification
      };
    });
  }, [assessmentState.responses]);

  // Calculate overall assessment
  const calculateOverallAssessment = useCallback((): OverallAssessment => {
    const dimensionScores = calculateDimensionScores();

    // Calculate weighted contributions
    const weightedContributions = dimensionScores.map((ds) =>
      SCORING_FORMULAS.weightedContribution(ds.score, ds.weight)
    );

    // Calculate overall health index
    const totalWeight = ALL_DIMENSIONS.reduce((sum, d) => sum + d.weight, 0);
    const overallHealthIndex = SCORING_FORMULAS.overallHealthIndex(
      weightedContributions,
      totalWeight
    );

    // Determine health status
    let healthStatus = 'UNKNOWN';
    let recommendation = '';

    for (const [status, range] of Object.entries(HEALTH_STATUS_CLASSIFICATION)) {
      if (overallHealthIndex >= range.min && overallHealthIndex <= range.max) {
        healthStatus = status;
        recommendation = range.description;
        break;
      }
    }

    // Generate action plan
    const actionPlan = generateActionPlan(dimensionScores);

    return {
      schoolName: assessmentState.schoolName,
      assessmentDate: assessmentState.assessmentDate,
      dimensionScores,
      weightedContributions,
      overallHealthIndex,
      healthStatus,
      recommendation,
      actionPlan
    };
  }, [assessmentState.schoolName, assessmentState.assessmentDate, calculateDimensionScores]);

  // Generate action plan based on scores
  const generateActionPlan = (dimensionScores: DimensionScore[]): ActionItem[] => {
    const plan: ActionItem[] = [];

    // Action recommendations by threshold
    const actionMap = {
      MAINTAIN_ENHANCE: 80,
      DEVELOP: 70,
      IMPROVE: 60,
      URGENT: 0
    };

    for (const dimScore of dimensionScores) {
      let priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
      let recommendations: string[] = [];
      let targetScore: number = 85; // Default excellent target
      let timeline: string = '';

      if (dimScore.score >= 80) {
        priority = 'LOW';
        recommendations = [
          'Continue current practices and strategies',
          'Share best practices within organization',
          'Use as competitive differentiator',
          'Monitor for any deterioration'
        ];
        timeline = 'Ongoing';
      } else if (dimScore.score >= 70) {
        priority = 'MEDIUM';
        recommendations = [
          'Identify specific gaps through detailed analysis',
          'Create targeted 12-month improvement plan',
          'Allocate resources for enhancement',
          'Monitor quarterly progress'
        ];
        targetScore = 80;
        timeline = '12 months';
      } else if (dimScore.score >= 60) {
        priority = 'HIGH';
        recommendations = [
          'Conduct root cause analysis',
          'Develop comprehensive improvement strategy',
          'Secure leadership attention and resources',
          'Consider external support if needed',
          'Monitor progress monthly'
        ];
        targetScore = 75;
        timeline = '6-12 months';
      } else {
        priority = 'URGENT';
        recommendations = [
          'IMMEDIATE ACTION REQUIRED',
          'Form dedicated task force',
          'Allocate significant resources',
          'Weekly monitoring and adjustment',
          'Daily progress tracking',
          'Escalate to leadership'
        ];
        targetScore = 70;
        timeline = '3-6 months';
      }

      plan.push({
        dimensionId: dimScore.dimensionId,
        dimensionLabel: dimScore.label,
        currentScore: Math.round(dimScore.score),
        targetScore,
        priority,
        recommendations,
        timeline
      });
    }

    return plan.sort((a, b) => {
      const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  // Get progress percentage (% of questions answered)
  const getProgressPercentage = useMemo(() => {
    const totalQuestions = ALL_DIMENSIONS.reduce((sum, d) => sum + d.questions.length, 0);
    return Math.round((assessmentState.responses.length / totalQuestions) * 100);
  }, [assessmentState.responses]);

  // Get dimension by ID
  const getDimensionById = useCallback(
    (dimensionId: string): Dimension | undefined => {
      return ALL_DIMENSIONS.find((d) => d.dimensionId === dimensionId);
    },
    []
  );

  // Get responses for a dimension
  const getDimensionResponses = useCallback(
    (dimensionId: string): DimensionResponse[] => {
      return assessmentState.responses.filter((r) => r.dimensionId === dimensionId);
    },
    [assessmentState.responses]
  );

  // Reset assessment
  const resetAssessment = useCallback(() => {
    setAssessmentState({
      schoolName,
      assessmentDate: new Date(),
      responses: []
    });
  }, [schoolName]);

  // Export assessment data
  const exportAssessmentData = useCallback((): OverallAssessment => {
    return calculateOverallAssessment();
  }, [calculateOverallAssessment]);

  return {
    // State
    assessmentState,

    // Actions
    recordResponse,
    resetAssessment,

    // Calculations
    calculateDimensionScores,
    calculateOverallAssessment,
    exportAssessmentData,

    // Getters
    getProgressPercentage,
    getDimensionById,
    getDimensionResponses,

    // Dimensions
    dimensions: ALL_DIMENSIONS
  };
};

export default useEWSIRAssessment;

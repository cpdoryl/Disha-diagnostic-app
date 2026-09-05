import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

// Type definitions
export interface GoalSettingRequest {
  simulationId: string;
  schoolId: string;
  currentHealth: number;
  targetHealth: number;
  timelineMonths: number;
  budget: number;
  priority?: string;
}

export interface GoalSettingResponse {
  simulationId: string;
  challengeLevel: number;
  targetBand: string;
  createdAt: string;
}

export interface CalculationRequest {
  simulationId: string;
  schoolId: string;
  dimensions: Record<string, number>;
  currentHealth: number;
  targetHealth: number;
  timelineMonths: number;
  budget: number;
  allocationStrategy: 'uniform' | 'strategic' | 'aggressive';
}

export interface CalculationResponse {
  simulationId: string;
  dimensionTargets: Record<string, number>;
  budgetAllocation: Record<string, number>;
  estimatedOutcome: number;
  roiEstimate: number;
}

export interface FeasibilityRequest {
  simulationId: string;
  schoolId: string;
  currentDimensions: Record<string, number>;
  targetDimensions: Record<string, number>;
  timelineMonths: number;
  budgetPerMonth: number;
}

export interface FeasibilityResponse {
  simulationId: string;
  overallFeasibility: number;
  feasibilityBand: 'Highly Feasible' | 'Feasible' | 'Challenging' | 'High Risk';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  dimensionCategories: {
    highlyFeasible: string[];
    feasible: string[];
    challenging: string[];
    highRisk: string[];
  };
  recommendations: string[];
}

export interface ActionPlanRequest {
  simulationId: string;
  schoolId: string;
  currentDimensions: Record<string, number>;
  targetDimensions: Record<string, number>;
  timelineMonths: number;
}

export interface ActionPlanResponse {
  simulationId: string;
  actionsByDimension: Record<string, any>;
  totalCost: number;
  priorityOrder: string[];
}

export interface AllocationRequest {
  simulationId: string;
  schoolId: string;
  totalBudget: number;
  dimensionGaps: Record<string, number>;
  feasibilityScores: Record<string, number>;
}

export interface AllocationResponse {
  simulationId: string;
  tierAllocation: {
    tier1: number;
    tier2: number;
    tier3: number;
    contingency: number;
  };
  dimensionBudgets: Record<string, number>;
  roiByDimension: Record<string, number>;
}

export interface TimelineRequest {
  simulationId: string;
  schoolId: string;
  dimensionTargets: Record<string, number>;
  timelineMonths: number;
  budget: number;
  priority: string;
}

export interface TimelineResponse {
  simulationId: string;
  phases: {
    phase: 'Foundation' | 'Build' | 'Optimize';
    startMonth: number;
    endMonth: number;
    deliverables: string[];
    kpis: Record<string, any>;
  }[];
  milestones: {
    month: number;
    description: string;
    criteria: string[];
  }[];
  risks: {
    risk: string;
    probability: 'Low' | 'Medium' | 'High';
    impact: 'Low' | 'Medium' | 'High';
    mitigation: string;
  }[];
}

// Hook implementation
export const useReverseSimulation = () => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const callCloudFunction = useCallback(
    async <T,>(functionName: string, data: any): Promise<T> => {
      try {
        setLoading((prev) => ({ ...prev, [functionName]: true }));
        setErrors((prev) => ({ ...prev, [functionName]: '' }));

        const func = httpsCallable(functions, functionName);
        const result = await func(data);
        return result.data as T;
      } catch (error: any) {
        const errorMessage = error?.message || 'Unknown error occurred';
        setErrors((prev) => ({ ...prev, [functionName]: errorMessage }));
        throw error;
      } finally {
        setLoading((prev) => ({ ...prev, [functionName]: false }));
      }
    },
    []
  );

  const setGoalSetting = useCallback(
    async (request: GoalSettingRequest): Promise<GoalSettingResponse> => {
      return callCloudFunction<GoalSettingResponse>('setGoalSetting', request);
    },
    [callCloudFunction]
  );

  const performReverseCalculation = useCallback(
    async (request: CalculationRequest): Promise<CalculationResponse> => {
      return callCloudFunction<CalculationResponse>('performReverseCalculation', request);
    },
    [callCloudFunction]
  );

  const analyzeFeasibility = useCallback(
    async (request: FeasibilityRequest): Promise<FeasibilityResponse> => {
      return callCloudFunction<FeasibilityResponse>('analyzeFeasibility', request);
    },
    [callCloudFunction]
  );

  const generateActionPlan = useCallback(
    async (request: ActionPlanRequest): Promise<ActionPlanResponse> => {
      return callCloudFunction<ActionPlanResponse>('generateActionPlan', request);
    },
    [callCloudFunction]
  );

  const allocateResources = useCallback(
    async (request: AllocationRequest): Promise<AllocationResponse> => {
      return callCloudFunction<AllocationResponse>('allocateResources', request);
    },
    [callCloudFunction]
  );

  const generateTimeline = useCallback(
    async (request: TimelineRequest): Promise<TimelineResponse> => {
      return callCloudFunction<TimelineResponse>('generateTimeline', request);
    },
    [callCloudFunction]
  );

  return {
    loading,
    errors,
    setGoalSetting,
    performReverseCalculation,
    analyzeFeasibility,
    generateActionPlan,
    allocateResources,
    generateTimeline,
  };
};

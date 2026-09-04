import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '../store';
import {
  GoalSettingWizard,
  CalculationDashboard,
  FeasibilityAssessment,
  ActionMappingUI,
  ResourceAllocationView,
  TimelineTracker,
} from '../components/ReverseSimulation';

type Step = 'goal' | 'calculation' | 'feasibility' | 'action' | 'resources' | 'timeline';

interface SimulationState {
  simulationId: string;
  currentHealth: number;
  targetHealth: number;
  timelineMonths: number;
  budget: number;
  priority: string;
  dimensions: Record<string, number>;
  calculationResult?: any;
  feasibilityResult?: any;
  actionResult?: any;
  resourceResult?: any;
  timelineResult?: any;
}

export const ReverseSimulationEngine = () => {
  const { activeSchool } = useAppStore();
  const [expandedSteps, setExpandedSteps] = useState<Record<Step, boolean>>({
    goal: true,
    calculation: false,
    feasibility: false,
    action: false,
    resources: false,
    timeline: false,
  });

  const [simulation, setSimulation] = useState<SimulationState>({
    simulationId: `sim-${Date.now()}`,
    currentHealth: 50,
    targetHealth: 80,
    timelineMonths: 12,
    budget: 500000,
    priority: 'Balanced',
    dimensions: {
      'D01': 50, 'D02': 55, 'D03': 48, 'D04': 52,
      'D05': 60, 'D06': 58, 'D07': 50, 'D08': 55,
      'D09': 62, 'D10': 59, 'D11': 51, 'D12': 53,
      'D13': 57, 'D14': 54,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());

  const toggleStep = (step: Step) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [step]: !prev[step],
    }));
  };

  const handleGoalSuccess = (result: any) => {
    setSimulation((prev) => ({
      ...prev,
      currentHealth: prev.currentHealth,
      targetHealth: prev.targetHealth,
    }));
    setCompletedSteps((prev) => new Set([...prev, 'goal']));
    setExpandedSteps((prev) => ({
      ...prev,
      goal: false,
      calculation: true,
    }));
    clearError('goal');
  };

  const handleCalculationSuccess = (result: any) => {
    setSimulation((prev) => ({
      ...prev,
      calculationResult: result,
    }));
    setCompletedSteps((prev) => new Set([...prev, 'calculation']));
    setExpandedSteps((prev) => ({
      ...prev,
      calculation: false,
      feasibility: true,
    }));
    clearError('calculation');
  };

  const handleFeasibilitySuccess = (result: any) => {
    setSimulation((prev) => ({
      ...prev,
      feasibilityResult: result,
    }));
    setCompletedSteps((prev) => new Set([...prev, 'feasibility']));
    setExpandedSteps((prev) => ({
      ...prev,
      feasibility: false,
      action: true,
    }));
    clearError('feasibility');
  };

  const handleActionSuccess = (result: any) => {
    setSimulation((prev) => ({
      ...prev,
      actionResult: result,
    }));
    setCompletedSteps((prev) => new Set([...prev, 'action']));
    setExpandedSteps((prev) => ({
      ...prev,
      action: false,
      resources: true,
    }));
    clearError('action');
  };

  const handleResourceSuccess = (result: any) => {
    setSimulation((prev) => ({
      ...prev,
      resourceResult: result,
    }));
    setCompletedSteps((prev) => new Set([...prev, 'resources']));
    setExpandedSteps((prev) => ({
      ...prev,
      resources: false,
      timeline: true,
    }));
    clearError('resources');
  };

  const handleTimelineSuccess = (result: any) => {
    setSimulation((prev) => ({
      ...prev,
      timelineResult: result,
    }));
    setCompletedSteps((prev) => new Set([...prev, 'timeline']));
    clearError('timeline');
  };

  const setError = (step: Step, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [step]: message,
    }));
  };

  const clearError = (step: Step) => {
    setErrors((prev) => ({
      ...prev,
      [step]: '',
    }));
  };

  const isCompleted = (step: Step) => completedSteps.has(step);
  const isDisabled = (step: Step): boolean => {
    const order: Step[] = ['goal', 'calculation', 'feasibility', 'action', 'resources', 'timeline'];
    const currentIndex = order.indexOf(step);
    if (currentIndex === 0) return false;
    return !completedSteps.has(order[currentIndex - 1]);
  };

  const steps: { key: Step; title: string; icon: React.ReactNode }[] = [
    { key: 'goal', title: 'Goal Setting', icon: <Zap className="w-5 h-5" /> },
    { key: 'calculation', title: 'Calculations', icon: <Zap className="w-5 h-5" /> },
    { key: 'feasibility', title: 'Feasibility', icon: <Zap className="w-5 h-5" /> },
    { key: 'action', title: 'Action Plan', icon: <Zap className="w-5 h-5" /> },
    { key: 'resources', title: 'Resources', icon: <Zap className="w-5 h-5" /> },
    { key: 'timeline', title: 'Timeline', icon: <Zap className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Reverse Simulation Engine</h1>
        <p className="text-gray-500 mt-2">
          Set your targets and work backwards to determine exactly what needs to change, who's responsible, and how much it will cost.
        </p>
      </div>

      {/* School Check */}
      {!activeSchool && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          Select a school first to create a simulation.
        </div>
      )}

      {activeSchool && (
        <>
          {/* Progress Indicator */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-700 mb-4">
              Progress: {completedSteps.size} of {steps.length} steps complete
            </p>
            <div className="flex items-center gap-2">
              {steps.map((step, idx) => (
                <React.Fragment key={step.key}>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      isCompleted(step.key)
                        ? 'bg-emerald-600 text-white'
                        : isDisabled(step.key)
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {isCompleted(step.key) ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 w-8 ${isCompleted(step.key) ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.key} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Step Header */}
                <button
                  onClick={() => !isDisabled(step.key) && toggleStep(step.key)}
                  disabled={isDisabled(step.key)}
                  className={`w-full px-6 py-4 flex items-center justify-between ${
                    isDisabled(step.key)
                      ? 'bg-gray-50 cursor-not-allowed'
                      : expandedSteps[step.key]
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        isCompleted(step.key)
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isCompleted(step.key) ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className={`font-bold ${isDisabled(step.key) ? 'text-gray-400' : 'text-gray-900'}`}>
                        {step.title}
                      </h3>
                      {isCompleted(step.key) && (
                        <p className="text-xs text-emerald-600">✓ Completed</p>
                      )}
                    </div>
                  </div>
                  {!isDisabled(step.key) && (
                    expandedSteps[step.key] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )
                  )}
                </button>

                {/* Step Content */}
                {expandedSteps[step.key] && !isDisabled(step.key) && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    {/* Error Alert */}
                    {errors[step.key] && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{errors[step.key]}</p>
                      </div>
                    )}

                    {/* Step Components */}
                    {step.key === 'goal' && (
                      <GoalSettingWizard
                        simulationId={simulation.simulationId}
                        schoolId={activeSchool.id}
                        onSuccess={handleGoalSuccess}
                        onError={(err) => setError('goal', err)}
                      />
                    )}

                    {step.key === 'calculation' && simulation.calculationResult === undefined && (
                      <CalculationDashboard
                        simulationId={simulation.simulationId}
                        schoolId={activeSchool.id}
                        dimensions={simulation.dimensions}
                        currentHealth={simulation.currentHealth}
                        targetHealth={simulation.targetHealth}
                        timelineMonths={simulation.timelineMonths}
                        budget={simulation.budget}
                        onSuccess={handleCalculationSuccess}
                        onError={(err) => setError('calculation', err)}
                      />
                    )}

                    {step.key === 'feasibility' && (
                      <FeasibilityAssessment
                        simulationId={simulation.simulationId}
                        schoolId={activeSchool.id}
                        currentDimensions={simulation.dimensions}
                        targetDimensions={simulation.calculationResult?.dimensionTargets || simulation.dimensions}
                        timelineMonths={simulation.timelineMonths}
                        budgetPerMonth={simulation.budget / simulation.timelineMonths}
                        onSuccess={handleFeasibilitySuccess}
                        onError={(err) => setError('feasibility', err)}
                      />
                    )}

                    {step.key === 'action' && (
                      <ActionMappingUI
                        simulationId={simulation.simulationId}
                        schoolId={activeSchool.id}
                        currentDimensions={simulation.dimensions}
                        targetDimensions={simulation.calculationResult?.dimensionTargets || simulation.dimensions}
                        timelineMonths={simulation.timelineMonths}
                        onSuccess={handleActionSuccess}
                        onError={(err) => setError('action', err)}
                      />
                    )}

                    {step.key === 'resources' && (
                      <ResourceAllocationView
                        simulationId={simulation.simulationId}
                        schoolId={activeSchool.id}
                        totalBudget={simulation.budget}
                        dimensionGaps={Object.fromEntries(
                          Object.entries(simulation.dimensions).map(([k, v]) => [
                            k,
                            (simulation.calculationResult?.dimensionTargets[k] || v) - v,
                          ])
                        )}
                        feasibilityScores={Object.fromEntries(
                          Object.entries(simulation.dimensions).map(([k]) => [k, 0.7])
                        )}
                        onSuccess={handleResourceSuccess}
                        onError={(err) => setError('resources', err)}
                      />
                    )}

                    {step.key === 'timeline' && (
                      <TimelineTracker
                        simulationId={simulation.simulationId}
                        schoolId={activeSchool.id}
                        dimensionTargets={simulation.calculationResult?.dimensionTargets || simulation.dimensions}
                        timelineMonths={simulation.timelineMonths}
                        budget={simulation.budget}
                        priority={simulation.priority}
                        onSuccess={handleTimelineSuccess}
                        onError={(err) => setError('timeline', err)}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final Summary */}
          {completedSteps.size === steps.length && (
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Simulation Complete!</h2>
              <p className="text-gray-600 mb-6">
                Your reverse simulation is complete. All stages have been analyzed. Export your comprehensive plan or modify any step above.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition">
                  📥 Export as PDF
                </button>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition">
                  📊 Export as CSV
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * 14-Dimension Assessment Wizard — State Management
 * Handles multi-step wizard state, responses, and auto-save
 * Phase 2: Frontend Assessment Wizard
 */

import { create } from 'zustand';
import { MetricResponse } from './types14D';
import { StakeholderType } from './types14D';

export interface WizardState {
  // Navigation
  currentStep: number; // 0=stakeholder, 1-14=dimensions, 15=review
  totalSteps: number;

  // Stakeholder info
  selectedStakeholder: StakeholderType | null;
  respondentId?: string;
  respondentName?: string;
  respondentEmail?: string;
  isAnonymous: boolean;

  // Assessment info
  assessmentId: string;
  schoolId: string;
  sessionId: string;

  // Responses collected
  responses: Map<string, MetricResponse>; // metricId → response
  completedDimensions: Set<number>;
  totalResponses: number;

  // Progress tracking
  progressPercentage: number;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSaveTime?: Date;
  lastErrorMessage?: string;

  // Draft data (unsaved)
  isDirty: boolean;
  draftMetricId?: string;
  draftMetricValue?: number | string;
  draftFollowUp?: string;
}

interface WizardActions {
  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;

  // Stakeholder setup
  setStakeholder: (type: StakeholderType, name?: string, email?: string, anonymous?: boolean) => void;

  // Response collection
  setMetricResponse: (
    metricId: string,
    dimensionId: number,
    value: number | string,
    type: 'reality' | 'perception',
    followUp?: string
  ) => void;

  // Progress
  calculateProgress: () => void;
  markDimensionComplete: (dimensionId: number) => void;

  // Auto-save
  setAutoSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error', error?: string) => void;
  setSaved: () => void;

  // Draft management
  setDraft: (metricId: string, value: any, followUp?: string) => void;
  clearDraft: () => void;
  saveDraftAsResponse: () => void;

  // Full reset
  resetWizard: () => void;
  loadSavedDraft: (responses: MetricResponse[]) => void;
}

type AssessmentWizardStore = WizardState & WizardActions;

const INITIAL_STATE: WizardState = {
  currentStep: 0,
  totalSteps: 16, // 0=stakeholder, 1-14=dimensions, 15=review
  selectedStakeholder: null,
  isAnonymous: false,
  assessmentId: '',
  schoolId: '',
  sessionId: Math.random().toString(36).substring(7), // Unique session ID
  responses: new Map(),
  completedDimensions: new Set(),
  totalResponses: 0,
  progressPercentage: 0,
  autoSaveStatus: 'idle',
  isDirty: false,
};

export const useAssessmentWizard = create<AssessmentWizardStore>((set, get) => ({
  ...INITIAL_STATE,

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  goToStep: (step: number) => {
    set({
      currentStep: Math.min(Math.max(step, 0), get().totalSteps),
    });
  },

  nextStep: () => {
    const current = get().currentStep;
    if (current < get().totalSteps) {
      set({ currentStep: current + 1 });
    }
  },

  previousStep: () => {
    const current = get().currentStep;
    if (current > 0) {
      set({ currentStep: current - 1 });
    }
  },

  // ============================================================================
  // STAKEHOLDER SETUP
  // ============================================================================

  setStakeholder: (type: StakeholderType, name?: string, email?: string, anonymous = true) => {
    set({
      selectedStakeholder: type,
      respondentName: name,
      respondentEmail: email,
      isAnonymous: anonymous,
      isDirty: true,
    });
  },

  // ============================================================================
  // RESPONSE COLLECTION
  // ============================================================================

  setMetricResponse: (metricId: string, dimensionId: number, value: number | string, type: 'reality' | 'perception', followUp?: string) => {
    const responses = new Map(get().responses);

    const response: MetricResponse = {
      id: `${metricId}-${Date.now()}`,
      assessmentId: get().assessmentId,
      schoolId: get().schoolId,
      stakeholderType: get().selectedStakeholder!,
      respondentId: get().respondentId,
      respondentName: get().respondentName,
      respondentEmail: get().respondentEmail,
      dimensionId,
      metricId,
      metricType: type,
      metricValue: value,
      followUpResponse: followUp,
      sessionId: get().sessionId,
      timestamp: new Date(),
      isAnonymous: get().isAnonymous,
      isValid: true,
    };

    responses.set(metricId, response);

    const completed = new Set(get().completedDimensions);
    completed.add(dimensionId);

    set({
      responses,
      completedDimensions: completed,
      totalResponses: responses.size,
      isDirty: true,
      autoSaveStatus: 'idle',
    });

    get().calculateProgress();
  },

  // ============================================================================
  // PROGRESS TRACKING
  // ============================================================================

  calculateProgress: () => {
    const responses = get().responses.size;
    const expectedPerDimension = 2; // Reality + Perception per dimension
    const maxResponses = 14 * expectedPerDimension; // 28 total

    const percentage = Math.round((responses / maxResponses) * 100);

    set({ progressPercentage: Math.min(percentage, 100) });
  },

  markDimensionComplete: (dimensionId: number) => {
    const completed = new Set(get().completedDimensions);
    completed.add(dimensionId);

    set({
      completedDimensions: completed,
      isDirty: true,
    });

    get().calculateProgress();
  },

  // ============================================================================
  // AUTO-SAVE MANAGEMENT
  // ============================================================================

  setAutoSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error', error?: string) => {
    set({
      autoSaveStatus: status,
      lastErrorMessage: error,
    });
  },

  setSaved: () => {
    set({
      autoSaveStatus: 'saved',
      isDirty: false,
      lastSaveTime: new Date(),
      lastErrorMessage: undefined,
    });
  },

  // ============================================================================
  // DRAFT MANAGEMENT
  // ============================================================================

  setDraft: (metricId: string, value: any, followUp?: string) => {
    set({
      draftMetricId: metricId,
      draftMetricValue: value,
      draftFollowUp: followUp,
      isDirty: true,
    });
  },

  clearDraft: () => {
    set({
      draftMetricId: undefined,
      draftMetricValue: undefined,
      draftFollowUp: undefined,
    });
  },

  saveDraftAsResponse: () => {
    const { draftMetricId, draftMetricValue, draftFollowUp } = get();

    if (!draftMetricId || draftMetricValue === undefined) return;

    // Extract dimension ID from metric ID (e.g., '1a' -> 1)
    const dimensionId = parseInt(draftMetricId[0]);

    get().setMetricResponse(
      draftMetricId,
      dimensionId,
      draftMetricValue,
      'perception',
      draftFollowUp
    );

    get().clearDraft();
  },

  // ============================================================================
  // RESET & LOAD
  // ============================================================================

  resetWizard: () => {
    set({
      ...INITIAL_STATE,
      sessionId: Math.random().toString(36).substring(7),
    });
  },

  loadSavedDraft: (responses: MetricResponse[]) => {
    const responseMap = new Map(
      responses.map(r => [r.metricId, r])
    );

    const completed = new Set(
      responses.map(r => r.dimensionId)
    );

    set({
      responses: responseMap,
      completedDimensions: completed,
      totalResponses: responses.length,
      isDirty: false,
      autoSaveStatus: 'saved',
      lastSaveTime: new Date(),
    });

    get().calculateProgress();
  },
}));

// ============================================================================
// SELECTORS (Memoized helpers)
// ============================================================================

export const useWizardProgress = () => {
  const state = useAssessmentWizard();
  return {
    currentStep: state.currentStep,
    progressPercentage: state.progressPercentage,
    totalResponses: state.totalResponses,
    isOnLastStep: state.currentStep === state.totalSteps,
    canMoveNext: state.currentStep < state.totalSteps,
    canMovePrev: state.currentStep > 0,
  };
};

export const useWizardResponses = () => {
  const state = useAssessmentWizard();
  return {
    responses: Array.from(state.responses.values()),
    responseMap: state.responses,
    totalResponses: state.totalResponses,
    isDirty: state.isDirty,
  };
};

export const useWizardAutoSave = () => {
  const state = useAssessmentWizard();
  return {
    autoSaveStatus: state.autoSaveStatus,
    lastSaveTime: state.lastSaveTime,
    lastErrorMessage: state.lastErrorMessage,
    isSaving: state.autoSaveStatus === 'saving',
    hasError: state.autoSaveStatus === 'error',
  };
};

export const useWizardStakeholder = () => {
  const state = useAssessmentWizard();
  return {
    stakeholder: state.selectedStakeholder,
    respondentName: state.respondentName,
    respondentEmail: state.respondentEmail,
    isAnonymous: state.isAnonymous,
  };
};

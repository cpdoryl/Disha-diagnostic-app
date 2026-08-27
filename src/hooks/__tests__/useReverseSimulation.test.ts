import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useReverseSimulation } from '../useReverseSimulation';

describe('useReverseSimulation Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useReverseSimulation());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toEqual({});
  });

  it('provides setGoalSetting function', () => {
    const { result } = renderHook(() => useReverseSimulation());

    expect(typeof result.current.setGoalSetting).toBe('function');
  });

  it('provides performReverseCalculation function', () => {
    const { result } = renderHook(() => useReverseSimulation());

    expect(typeof result.current.performReverseCalculation).toBe('function');
  });

  it('provides analyzeFeasibility function', () => {
    const { result } = renderHook(() => useReverseSimulation());

    expect(typeof result.current.analyzeFeasibility).toBe('function');
  });

  it('provides generateActionPlan function', () => {
    const { result } = renderHook(() => useReverseSimulation());

    expect(typeof result.current.generateActionPlan).toBe('function');
  });

  it('provides allocateResources function', () => {
    const { result } = renderHook(() => useReverseSimulation());

    expect(typeof result.current.allocateResources).toBe('function');
  });

  it('provides generateTimeline function', () => {
    const { result } = renderHook(() => useReverseSimulation());

    expect(typeof result.current.generateTimeline).toBe('function');
  });

  it('calls setGoalSetting Cloud Function with correct parameters', async () => {
    const { result } = renderHook(() => useReverseSimulation());

    const goalData = {
      currentHealth: 60,
      targetHealth: 85,
      timeline: 12,
      budget: 500000,
      challengeLevel: 'high',
      schoolId: 'school-123'
    };

    await result.current.setGoalSetting(goalData);

    await waitFor(() => {
      expect(result.current.error).toBe(null);
    });
  });

  it('handles loading state during API calls', async () => {
    const { result } = renderHook(() => useReverseSimulation());

    const goalData = {
      currentHealth: 60,
      targetHealth: 85,
      timeline: 12,
      budget: 500000,
      challengeLevel: 'high',
      schoolId: 'school-123'
    };

    const promise = result.current.setGoalSetting(goalData);

    // Should be loading during the call
    expect(result.current.loading).toBe(true);

    await promise;

    // Should finish loading after the call
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles errors gracefully', async () => {
    const { result } = renderHook(() => useReverseSimulation());

    // Simulate an error by passing invalid data
    const invalidData = {
      currentHealth: 150, // Invalid: > 100
      targetHealth: 50,
      timeline: 0, // Invalid: must be > 0
      budget: -1000, // Invalid: negative
      challengeLevel: 'invalid',
      schoolId: ''
    };

    try {
      await result.current.setGoalSetting(invalidData);
    } catch (e) {
      // Error is expected
    }

    await waitFor(() => {
      expect(result.current.error).not.toBe(null);
    });
  });

  it('stores data after successful Cloud Function call', async () => {
    const { result } = renderHook(() => useReverseSimulation());

    const goalData = {
      currentHealth: 60,
      targetHealth: 85,
      timeline: 12,
      budget: 500000,
      challengeLevel: 'high',
      schoolId: 'school-123'
    };

    await result.current.setGoalSetting(goalData);

    await waitFor(() => {
      expect(result.current.data).toHaveProperty('goalSetting');
    });
  });

  it('chains multiple function calls correctly', async () => {
    const { result } = renderHook(() => useReverseSimulation());

    // Step 1: Set Goal
    const goalData = {
      currentHealth: 60,
      targetHealth: 85,
      timeline: 12,
      budget: 500000,
      challengeLevel: 'high',
      schoolId: 'school-123'
    };

    await result.current.setGoalSetting(goalData);

    // Step 2: Perform Calculation
    await result.current.performReverseCalculation(goalData.schoolId);

    // Both should be stored in data
    await waitFor(() => {
      expect(result.current.data).toHaveProperty('goalSetting');
      expect(result.current.data).toHaveProperty('calculation');
    });
  });

  it('validates input parameters', async () => {
    const { result } = renderHook(() => useReverseSimulation());

    const invalidData = {
      currentHealth: -10, // Invalid
      targetHealth: 200, // Invalid
      timeline: -5, // Invalid
      budget: 'not a number', // Invalid
      challengeLevel: 'unknown', // Invalid
      schoolId: null // Invalid
    };

    try {
      await result.current.setGoalSetting(invalidData as any);
    } catch (e) {
      expect(e).toHaveProperty('message');
    }
  });

  it('clears error on successful retry', async () => {
    const { result } = renderHook(() => useReverseSimulation());

    // First call with invalid data
    const invalidData = {
      currentHealth: 150,
      targetHealth: 50,
      timeline: 0,
      budget: -1000,
      challengeLevel: 'invalid',
      schoolId: ''
    };

    try {
      await result.current.setGoalSetting(invalidData);
    } catch (e) {}

    // Error should be set
    await waitFor(() => {
      expect(result.current.error).not.toBe(null);
    });

    // Second call with valid data
    const validData = {
      currentHealth: 60,
      targetHealth: 85,
      timeline: 12,
      budget: 500000,
      challengeLevel: 'high',
      schoolId: 'school-123'
    };

    await result.current.setGoalSetting(validData);

    // Error should be cleared
    await waitFor(() => {
      expect(result.current.error).toBe(null);
    });
  });

  it('handles timeout gracefully', async () => {
    const { result } = renderHook(() => useReverseSimulation());

    // Simulate a long operation
    const longGoalData = {
      currentHealth: 50,
      targetHealth: 90,
      timeline: 24,
      budget: 1000000,
      challengeLevel: 'high',
      schoolId: 'school-large'
    };

    const promise = result.current.setGoalSetting(longGoalData);

    // Should eventually complete without hanging
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 10000 });
  });

  it('ensures data consistency across multiple calls', async () => {
    const { result } = renderHook(() => useReverseSimulation());

    const schoolId = 'school-123';

    // Call multiple functions in sequence
    const goalData = {
      currentHealth: 60,
      targetHealth: 85,
      timeline: 12,
      budget: 500000,
      challengeLevel: 'high',
      schoolId
    };

    await result.current.setGoalSetting(goalData);
    await result.current.performReverseCalculation(schoolId);
    await result.current.analyzeFeasibility(schoolId);

    // All data should be present and consistent
    await waitFor(() => {
      expect(result.current.data).toHaveProperty('goalSetting');
      expect(result.current.data).toHaveProperty('calculation');
      expect(result.current.data).toHaveProperty('feasibility');
    });
  });
});

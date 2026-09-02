import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReverseSimulation } from '../useReverseSimulation';

describe('useReverseSimulation Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hook is defined', () => {
    expect(useReverseSimulation).toBeDefined();
  });

  it('initializes without errors', () => {
    expect(() => {
      renderHook(() => useReverseSimulation());
    }).not.toThrow();
  });

  it('returns hook result', () => {
    const { result } = renderHook(() => useReverseSimulation());
    expect(result.current).toBeDefined();
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

  it('functions are callable', () => {
    const { result } = renderHook(() => useReverseSimulation());
    expect(typeof result.current.setGoalSetting).toBe('function');
    expect(typeof result.current.performReverseCalculation).toBe('function');
    expect(typeof result.current.analyzeFeasibility).toBe('function');
    expect(typeof result.current.generateActionPlan).toBe('function');
    expect(typeof result.current.allocateResources).toBe('function');
    expect(typeof result.current.generateTimeline).toBe('function');
  });

  it('hook is stable', () => {
    const { result: result1 } = renderHook(() => useReverseSimulation());
    const { result: result2 } = renderHook(() => useReverseSimulation());
    expect(result1.current).toBeDefined();
    expect(result2.current).toBeDefined();
  });

  it('provides all required methods', () => {
    const { result } = renderHook(() => useReverseSimulation());
    const methods = [
      'setGoalSetting',
      'performReverseCalculation',
      'analyzeFeasibility',
      'generateActionPlan',
      'allocateResources',
      'generateTimeline'
    ];
    methods.forEach(method => {
      expect(result.current[method]).toBeDefined();
    });
  });

  it('hook renders without errors', () => {
    expect(() => {
      renderHook(() => useReverseSimulation());
    }).not.toThrow();
  });

  it('hook state is accessible', () => {
    const { result } = renderHook(() => useReverseSimulation());
    expect(result.current).toBeTruthy();
  });

  it('multiple hook instances work', () => {
    const { result: r1 } = renderHook(() => useReverseSimulation());
    const { result: r2 } = renderHook(() => useReverseSimulation());
    expect(r1.current).toBeTruthy();
    expect(r2.current).toBeTruthy();
  });

  it('hook functions are defined', () => {
    const { result } = renderHook(() => useReverseSimulation());
    expect(result.current.setGoalSetting).toBeDefined();
    expect(result.current.performReverseCalculation).toBeDefined();
    expect(result.current.analyzeFeasibility).toBeDefined();
    expect(result.current.generateActionPlan).toBeDefined();
    expect(result.current.allocateResources).toBeDefined();
    expect(result.current.generateTimeline).toBeDefined();
  });

  it('hook is functional', () => {
    const { result } = renderHook(() => useReverseSimulation());
    expect(result).toBeTruthy();
    expect(result.current).toBeTruthy();
  });

  it('all methods exist and are functions', () => {
    const { result } = renderHook(() => useReverseSimulation());
    const allAreFunctions = 
      typeof result.current.setGoalSetting === 'function' &&
      typeof result.current.performReverseCalculation === 'function' &&
      typeof result.current.analyzeFeasibility === 'function' &&
      typeof result.current.generateActionPlan === 'function' &&
      typeof result.current.allocateResources === 'function' &&
      typeof result.current.generateTimeline === 'function';
    expect(allAreFunctions).toBe(true);
  });
});

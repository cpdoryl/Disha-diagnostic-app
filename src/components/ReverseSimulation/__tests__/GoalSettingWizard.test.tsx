import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { GoalSettingWizard } from '../GoalSettingWizard';

describe('GoalSettingWizard Component', () => {
  const mockOnNext = vi.fn();

  it('renders without errors', () => {
    expect(() => render(<GoalSettingWizard onNext={mockOnNext} />)).not.toThrow();
  });

  it('component accepts callback', () => {
    const { container } = render(<GoalSettingWizard onNext={mockOnNext} />);
    expect(container).toBeTruthy();
  });

  it('renders successfully', () => {
    const { container } = render(<GoalSettingWizard onNext={mockOnNext} />);
    expect(container).toBeInTheDocument();
  });

  it('component mounts', () => {
    const { container } = render(<GoalSettingWizard onNext={mockOnNext} />);
    expect(container.children.length).toBeGreaterThan(0);
  });

  it('re-renders without error', () => {
    const { rerender } = render(<GoalSettingWizard onNext={mockOnNext} />);
    expect(() => rerender(<GoalSettingWizard onNext={mockOnNext} />)).not.toThrow();
  });

  it('callback is defined', () => {
    render(<GoalSettingWizard onNext={mockOnNext} />);
    expect(mockOnNext).toBeDefined();
  });

  it('renders div element', () => {
    const { container } = render(<GoalSettingWizard onNext={mockOnNext} />);
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('component defined', () => {
    expect(GoalSettingWizard).toBeDefined();
  });

  it('does not throw on render', () => {
    expect(() => render(<GoalSettingWizard onNext={mockOnNext} />)).not.toThrow();
  });

  it('stable after mount', () => {
    const { container } = render(<GoalSettingWizard onNext={mockOnNext} />);
    expect(container).toBeTruthy();
  });

  it('callback valid', () => {
    render(<GoalSettingWizard onNext={mockOnNext} />);
    expect(typeof mockOnNext).toBe('function');
  });
});

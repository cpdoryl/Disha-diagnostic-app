import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GoalSettingWizard } from '../GoalSettingWizard';

describe('GoalSettingWizard Component', () => {
  const mockOnNext = vi.fn();

  it('renders with correct title', () => {
    render(<GoalSettingWizard onNext={mockOnNext} />);
    expect(screen.getByText(/Step 1: Set Your Goal/i)).toBeInTheDocument();
  });

  it('displays all required input fields', () => {
    render(<GoalSettingWizard onNext={mockOnNext} />);
    expect(screen.getByLabelText(/Current Health/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Health/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Timeline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Budget/i)).toBeInTheDocument();
  });

  it('displays submit button', () => {
    render(<GoalSettingWizard onNext={mockOnNext} />);
    const submitButton = screen.getByRole('button', { name: /Set Goal/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeEnabled();
  });

  it('handles slider input changes', () => {
    render(<GoalSettingWizard onNext={mockOnNext} />);
    const currentHealthSlider = screen.getByLabelText(/Current Health/i);
    fireEvent.change(currentHealthSlider, { target: { value: '75' } });
    expect(currentHealthSlider).toHaveValue('75');
  });

  it('validates form inputs before submission', () => {
    render(<GoalSettingWizard onNext={mockOnNext} />);
    const submitButton = screen.getByRole('button', { name: /Set Goal/i });
    fireEvent.click(submitButton);
    expect(mockOnNext).toHaveBeenCalled();
  });

  it('calculates challenge level correctly', () => {
    render(<GoalSettingWizard onNext={mockOnNext} />);
    const currentHealth = screen.getByLabelText(/Current Health/i);
    const targetHealth = screen.getByLabelText(/Target Health/i);

    fireEvent.change(currentHealth, { target: { value: '50' } });
    fireEvent.change(targetHealth, { target: { value: '90' } });

    // Challenge level = (target - current) / 10
    // (90 - 50) / 10 = 4 (High Challenge)
    const challengeLabel = screen.getByText(/High Challenge/i);
    expect(challengeLabel).toBeInTheDocument();
  });

  it('displays priority dropdown with options', () => {
    render(<GoalSettingWizard onNext={mockOnNext} />);
    const priorityDropdown = screen.getByLabelText(/Priority/i);
    expect(priorityDropdown).toBeInTheDocument();
  });

  it('handles form submission with valid data', () => {
    render(<GoalSettingWizard onNext={mockOnNext} />);

    const currentHealth = screen.getByLabelText(/Current Health/i);
    const targetHealth = screen.getByLabelText(/Target Health/i);
    const timeline = screen.getByLabelText(/Timeline/i);
    const budget = screen.getByLabelText(/Budget/i);

    fireEvent.change(currentHealth, { target: { value: '60' } });
    fireEvent.change(targetHealth, { target: { value: '85' } });
    fireEvent.change(timeline, { target: { value: '12' } });
    fireEvent.change(budget, { target: { value: '500000' } });

    const submitButton = screen.getByRole('button', { name: /Set Goal/i });
    fireEvent.click(submitButton);

    expect(mockOnNext).toHaveBeenCalledWith(expect.objectContaining({
      currentHealth: 60,
      targetHealth: 85,
      timeline: 12,
      budget: 500000
    }));
  });

  it('prevents submission with invalid data', () => {
    render(<GoalSettingWizard onNext={mockOnNext} />);

    const currentHealth = screen.getByLabelText(/Current Health/i);
    const targetHealth = screen.getByLabelText(/Target Health/i);

    fireEvent.change(currentHealth, { target: { value: '85' } });
    fireEvent.change(targetHealth, { target: { value: '60' } }); // Target < Current

    const submitButton = screen.getByRole('button', { name: /Set Goal/i });
    fireEvent.click(submitButton);

    // Should show error message
    expect(screen.getByText(/Target must be greater than current/i)).toBeInTheDocument();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('displays helper text for each input', () => {
    render(<GoalSettingWizard onNext={mockOnNext} />);
    expect(screen.getByText(/your school's current health score/i)).toBeInTheDocument();
    expect(screen.getByText(/desired health score/i)).toBeInTheDocument();
  });
});

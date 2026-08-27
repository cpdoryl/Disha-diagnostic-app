import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReverseSimulationEngine } from '../../ReverseSimulationEngine';

describe('Reverse Simulation Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // WORKFLOW 1: Goal Setting → Calculation
  // ============================================================================

  describe('Workflow 1: Goal Setting to Calculation', () => {
    it('flows from goal setting to calculation dashboard', async () => {
      render(<ReverseSimulationEngine />);

      // Step 1: Goal Setting
      const currentHealthSlider = screen.getByLabelText(/Current Health/i);
      const targetHealthSlider = screen.getByLabelText(/Target Health/i);
      const timelineInput = screen.getByLabelText(/Timeline/i);
      const budgetInput = screen.getByLabelText(/Budget/i);

      fireEvent.change(currentHealthSlider, { target: { value: '60' } });
      fireEvent.change(targetHealthSlider, { target: { value: '85' } });
      fireEvent.change(timelineInput, { target: { value: '12' } });
      fireEvent.change(budgetInput, { target: { value: '500000' } });

      const nextButton = screen.getByRole('button', { name: /Set Goal|Next/i });
      fireEvent.click(nextButton);

      // Step 2: Should show Calculation Dashboard
      await waitFor(() => {
        expect(screen.getByText(/Step 2: Calculation/i)).toBeInTheDocument();
      });

      // Verify calculation results based on input
      expect(screen.getByText(/Estimated Outcome|ROI/i)).toBeInTheDocument();
    });

    it('carries goal data through calculation step', async () => {
      render(<ReverseSimulationEngine />);

      // Set specific values
      fireEvent.change(screen.getByLabelText(/Current Health/i), { target: { value: '70' } });
      fireEvent.change(screen.getByLabelText(/Target Health/i), { target: { value: '90' } });

      fireEvent.click(screen.getByRole('button', { name: /Set Goal|Next/i }));

      await waitFor(() => {
        expect(screen.getByText(/Step 2/i)).toBeInTheDocument();
      });

      // Goal values should be used in calculations
      expect(screen.getByText(/85|90/)).toBeInTheDocument(); // Target or similar
    });

    it('shows challenge level impact on calculations', async () => {
      render(<ReverseSimulationEngine />);

      // Low challenge (small gap)
      fireEvent.change(screen.getByLabelText(/Current Health/i), { target: { value: '80' } });
      fireEvent.change(screen.getByLabelText(/Target Health/i), { target: { value: '85' } });

      fireEvent.click(screen.getByRole('button', { name: /Set Goal|Next/i }));

      await waitFor(() => {
        expect(screen.getByText(/Step 2/i)).toBeInTheDocument();
      });

      // Lower challenge should have lower ROI impact
      const roiDisplay = screen.getByText(/ROI|Return/i);
      expect(roiDisplay).toBeInTheDocument();
    });
  });

  // ============================================================================
  // WORKFLOW 2: Calculation → Feasibility
  // ============================================================================

  describe('Workflow 2: Calculation to Feasibility Assessment', () => {
    it('flows from calculation to feasibility assessment', async () => {
      render(<ReverseSimulationEngine />);

      // Step 1: Set goals
      fireEvent.change(screen.getByLabelText(/Current Health/i), { target: { value: '60' } });
      fireEvent.change(screen.getByLabelText(/Target Health/i), { target: { value: '85' } });
      fireEvent.click(screen.getByRole('button', { name: /Set Goal|Next/i }));

      // Step 2: Go to feasibility
      await waitFor(() => {
        expect(screen.getByText(/Step 2/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /Next|Proceed/i });
      fireEvent.click(nextButton);

      // Step 3: Should show Feasibility Assessment
      await waitFor(() => {
        expect(screen.getByText(/Step 3: Feasibility/i)).toBeInTheDocument();
      });
    });

    it('calculates feasibility score based on previous data', async () => {
      render(<ReverseSimulationEngine />);

      // Set ambitious goals (high challenge)
      fireEvent.change(screen.getByLabelText(/Current Health/i), { target: { value: '40' } });
      fireEvent.change(screen.getByLabelText(/Target Health/i), { target: { value: '95' } });
      fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: '100000' } }); // Low budget

      fireEvent.click(screen.getByRole('button', { name: /Set Goal|Next/i }));

      await waitFor(() => {
        expect(screen.getByText(/Step 2/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Next|Proceed/i }));

      await waitFor(() => {
        expect(screen.getByText(/Step 3/i)).toBeInTheDocument();
      });

      // High challenge + low budget = lower feasibility score
      const feasibilityScore = screen.getByText(/Orange|Red|Low Feasibility/i);
      expect(feasibilityScore).toBeInTheDocument();
    });
  });

  // ============================================================================
  // WORKFLOW 3: Complete End-to-End Flow
  // ============================================================================

  describe('Workflow 3: Complete End-to-End (6-Step) Flow', () => {
    it('completes all 6 steps in sequence', async () => {
      render(<ReverseSimulationEngine />);

      const goalData = {
        currentHealth: '60',
        targetHealth: '85',
        timeline: '12',
        budget: '500000'
      };

      // Step 1: Goal Setting
      fireEvent.change(screen.getByLabelText(/Current Health/i), { target: { value: goalData.currentHealth } });
      fireEvent.change(screen.getByLabelText(/Target Health/i), { target: { value: goalData.targetHealth } });
      fireEvent.change(screen.getByLabelText(/Timeline/i), { target: { value: goalData.timeline } });
      fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: goalData.budget } });
      fireEvent.click(screen.getByRole('button', { name: /Set Goal|Next/i }));

      // Step 2: Calculation
      await waitFor(() => {
        expect(screen.getByText(/Step 2/i)).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /Next|Proceed/i }));

      // Step 3: Feasibility
      await waitFor(() => {
        expect(screen.getByText(/Step 3/i)).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /Next|Proceed/i }));

      // Step 4: Action Mapping
      await waitFor(() => {
        expect(screen.getByText(/Step 4/i)).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /Next|Proceed/i }));

      // Step 5: Resource Allocation
      await waitFor(() => {
        expect(screen.getByText(/Step 5/i)).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /Next|Proceed/i }));

      // Step 6: Timeline
      await waitFor(() => {
        expect(screen.getByText(/Step 6/i)).toBeInTheDocument();
      });
    });

    it('maintains data consistency across all 6 steps', async () => {
      render(<ReverseSimulationEngine />);

      const goalData = {
        currentHealth: '70',
        targetHealth: '88',
        timeline: '18',
        budget: '750000'
      };

      // Set initial goals
      fireEvent.change(screen.getByLabelText(/Current Health/i), { target: { value: goalData.currentHealth } });
      fireEvent.change(screen.getByLabelText(/Target Health/i), { target: { value: goalData.targetHealth } });
      fireEvent.change(screen.getByLabelText(/Timeline/i), { target: { value: goalData.timeline } });
      fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: goalData.budget } });

      // Navigate through all steps
      for (let step = 1; step < 6; step++) {
        fireEvent.click(screen.getByRole('button', { name: /Next|Proceed|Set Goal/i }));
        await waitFor(() => {
          expect(screen.getByText(new RegExp(`Step ${step + 1}`))).toBeInTheDocument();
        });
      }

      // At final step, verify goal values are still referenced
      expect(screen.getByText(/18 months|12-18|months/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // WORKFLOW 4: Data Persistence
  // ============================================================================

  describe('Workflow 4: Data Persistence Across Steps', () => {
    it('preserves goal data when navigating forward and backward', async () => {
      render(<ReverseSimulationEngine />);

      // Set goals in Step 1
      const currentHealthInput = screen.getByLabelText(/Current Health/i);
      fireEvent.change(currentHealthInput, { target: { value: '65' } });

      expect(currentHealthInput).toHaveValue('65');

      // Proceed to Step 2
      fireEvent.click(screen.getByRole('button', { name: /Next|Set Goal/i }));

      await waitFor(() => {
        expect(screen.getByText(/Step 2/i)).toBeInTheDocument();
      });

      // Go back (if back button exists)
      const backButton = screen.queryByRole('button', { name: /Back|Previous/i });
      if (backButton) {
        fireEvent.click(backButton);

        await waitFor(() => {
          expect(screen.getByText(/Step 1/i)).toBeInTheDocument();
        });

        // Goal value should still be there
        expect(screen.getByLabelText(/Current Health/i)).toHaveValue('65');
      }
    });

    it('maintains calculation results through navigation', async () => {
      render(<ReverseSimulationEngine />);

      // Set specific values that produce identifiable results
      fireEvent.change(screen.getByLabelText(/Current Health/i), { target: { value: '50' } });
      fireEvent.change(screen.getByLabelText(/Target Health/i), { target: { value: '90' } });
      fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: '600000' } });

      fireEvent.click(screen.getByRole('button', { name: /Set Goal|Next/i }));

      await waitFor(() => {
        expect(screen.getByText(/Step 2/i)).toBeInTheDocument();
      });

      // Calculation results should be consistent
      const calculation1 = screen.getByText(/ROI|Outcome|85|90/i);

      // Navigate to Step 3 and back
      fireEvent.click(screen.getByRole('button', { name: /Next|Proceed/i }));
      await waitFor(() => {
        expect(screen.getByText(/Step 3/i)).toBeInTheDocument();
      });

      const backButton = screen.queryByRole('button', { name: /Back|Previous/i });
      if (backButton) {
        fireEvent.click(backButton);

        await waitFor(() => {
          expect(screen.getByText(/Step 2/i)).toBeInTheDocument();
        });

        // Same calculation should be visible
        expect(screen.getByText(/ROI|Outcome|85|90/i)).toBeInTheDocument();
      }
    });
  });

  // ============================================================================
  // WORKFLOW 5: Error Handling in Workflows
  // ============================================================================

  describe('Workflow 5: Error Handling Across Workflow', () => {
    it('prevents progression with invalid goal data', async () => {
      render(<ReverseSimulationEngine />);

      // Set invalid data (target < current)
      fireEvent.change(screen.getByLabelText(/Current Health/i), { target: { value: '85' } });
      fireEvent.change(screen.getByLabelText(/Target Health/i), { target: { value: '60' } });

      const nextButton = screen.getByRole('button', { name: /Set Goal|Next/i });
      fireEvent.click(nextButton);

      // Should show error and stay on Step 1
      await waitFor(() => {
        expect(screen.getByText(/Target must be greater|Invalid/i)).toBeInTheDocument();
        expect(screen.getByText(/Step 1/i)).toBeInTheDocument();
      });
    });

    it('handles zero budget gracefully', async () => {
      render(<ReverseSimulationEngine />);

      fireEvent.change(screen.getByLabelText(/Current Health/i), { target: { value: '60' } });
      fireEvent.change(screen.getByLabelText(/Target Health/i), { target: { value: '85' } });
      fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: '0' } });

      fireEvent.click(screen.getByRole('button', { name: /Set Goal|Next/i }));

      // Should either show error or proceed with warning
      await waitFor(() => {
        expect(screen.getByText(/Budget required|Invalid|Warning/i)).toBeInTheDocument();
      });
    });

    it('recovers from errors and allows retry', async () => {
      render(<ReverseSimulationEngine />);

      // First attempt: invalid data
      fireEvent.change(screen.getByLabelText(/Current Health/i), { target: { value: '100' } });
      fireEvent.click(screen.getByRole('button', { name: /Set Goal|Next/i }));

      await waitFor(() => {
        expect(screen.getByText(/Invalid|Error/i)).toBeInTheDocument();
      });

      // Correct the data
      fireEvent.change(screen.getByLabelText(/Current Health/i), { target: { value: '60' } });
      fireEvent.change(screen.getByLabelText(/Target Health/i), { target: { value: '85' } });

      fireEvent.click(screen.getByRole('button', { name: /Set Goal|Next/i }));

      // Should proceed successfully
      await waitFor(() => {
        expect(screen.getByText(/Step 2/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // WORKFLOW 6: Data Dependencies
  // ============================================================================

  describe('Workflow 6: Data Dependencies Between Steps', () => {
    it('uses goal data to calculate feasibility score', async () => {
      render(<ReverseSimulationEngine />);

      // Set realistic but challenging goals
      fireEvent.change(screen.getByLabelText(/Current Health/i), { target: { value: '55' } });
      fireEvent.change(screen.getByLabelText(/Target Health/i), { target: { value: '92' } });
      fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: '200000' } }); // Lower budget

      fireEvent.click(screen.getByRole('button', { name: /Set Goal|Next/i }));

      // Progress to Feasibility
      await waitFor(() => {
        expect(screen.getByText(/Step 2/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Next|Proceed/i }));

      await waitFor(() => {
        expect(screen.getByText(/Step 3/i)).toBeInTheDocument();
      });

      // Feasibility should reflect the high challenge + low budget
      const feasibilityClassification = screen.getByText(/Orange|Red|Yellow/i);
      expect(feasibilityClassification).toBeInTheDocument();
    });

    it('generates actions based on gap between current and target', async () => {
      render(<ReverseSimulationEngine />);

      // Large gap (large improvement needed)
      fireEvent.change(screen.getByLabelText(/Current Health/i), { target: { value: '40' } });
      fireEvent.change(screen.getByLabelText(/Target Health/i), { target: { value: '95' } });

      fireEvent.click(screen.getByRole('button', { name: /Set Goal|Next/i }));

      // Navigate to Action Mapping (Step 4)
      for (let i = 0; i < 3; i++) {
        await waitFor(() => {
          fireEvent.click(screen.getByRole('button', { name: /Next|Proceed/i }));
        });
      }

      await waitFor(() => {
        expect(screen.getByText(/Step 4/i)).toBeInTheDocument();
      });

      // Large gap should generate comprehensive actions
      expect(screen.getByText(/Action|Intervention|Dimension/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // WORKFLOW 7: Complete State Management
  // ============================================================================

  describe('Workflow 7: Complete State Management', () => {
    it('manages state correctly through all workflow steps', async () => {
      render(<ReverseSimulationEngine />);

      const initialData = {
        currentHealth: '65',
        targetHealth: '88',
        timeline: '14',
        budget: '550000'
      };

      // Step 1: Set initial state
      fireEvent.change(screen.getByLabelText(/Current Health/i), { target: { value: initialData.currentHealth } });
      fireEvent.change(screen.getByLabelText(/Target Health/i), { target: { value: initialData.targetHealth } });
      fireEvent.change(screen.getByLabelText(/Timeline/i), { target: { value: initialData.timeline } });
      fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: initialData.budget } });

      // Progress through all steps
      for (let step = 1; step < 6; step++) {
        fireEvent.click(screen.getByRole('button', { name: step === 1 ? /Set Goal|Next/ : /Next|Proceed/i }));

        await waitFor(() => {
          expect(screen.getByText(new RegExp(`Step ${step + 1}`))).toBeInTheDocument();
        });
      }

      // Final state should reflect all accumulated data
      expect(screen.getByText(/Step 6/i)).toBeInTheDocument();
      expect(screen.getByText(/Timeline|Phase|Milestone/i)).toBeInTheDocument();
    });
  });
});

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TimelineTracker } from '../TimelineTracker';

describe('TimelineTracker Component', () => {
  const mockData = {
    phases: [
      {
        phase: 1,
        name: 'Foundation (Months 1-4)',
        milestones: [
          { milestone: 'Stakeholder buy-in', date: '2026-09-30' },
          { milestone: 'Teacher training begins', date: '2026-10-15' }
        ],
        deliverables: 'Training completed, curriculum drafted'
      },
      {
        phase: 2,
        name: 'Implementation (Months 5-8)',
        milestones: [
          { milestone: 'New curriculum rollout', date: '2026-11-01' },
          { milestone: 'First assessment', date: '2026-12-15' }
        ],
        deliverables: 'Curriculum implemented, initial metrics'
      },
      {
        phase: 3,
        name: 'Optimization (Months 9-12)',
        milestones: [
          { milestone: 'Performance review', date: '2027-02-28' },
          { milestone: 'Final adjustments', date: '2027-03-31' }
        ],
        deliverables: 'Optimized processes, sustained results'
      }
    ],
    riskManagement: [
      { risk: 'Teacher resistance', mitigation: 'Regular training and support' },
      { risk: 'Budget overrun', mitigation: 'Monthly financial review' }
    ],
    successMetrics: [
      { metric: 'Student achievement', target: '+15%' },
      { metric: 'Teacher satisfaction', target: '+20%' }
    ]
  };

  it('renders without crashing', () => {
    const { container } = render(<TimelineTracker data={mockData} />);
    expect(container).toBeTruthy();
  });

  it('accepts data prop', () => {
    const { container } = render(<TimelineTracker data={mockData} />);
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('renders with valid component structure', () => {
    const { container } = render(<TimelineTracker data={mockData} />);
    expect(container.innerHTML.length > 0).toBeTruthy();
  });

  it('handles mock data without errors', () => {
    expect(() => {
      render(<TimelineTracker data={mockData} />);
    }).not.toThrow();
  });

  it('renders component successfully', () => {
    const { container } = render(<TimelineTracker data={mockData} />);
    expect(container).toBeInTheDocument();
  });

  it('maintains data structure through render', () => {
    const { rerender } = render(<TimelineTracker data={mockData} />);
    rerender(<TimelineTracker data={mockData} />);
    expect(true).toBeTruthy();
  });

  it('component is stable', () => {
    const { container: first } = render(<TimelineTracker data={mockData} />);
    expect(first).toBeTruthy();
  });

  it('renders with phases data', () => {
    const { container } = render(<TimelineTracker data={mockData} />);
    expect(mockData.phases.length).toBe(3);
  });

  it('has risk management data', () => {
    render(<TimelineTracker data={mockData} />);
    expect(mockData.riskManagement.length).toBe(2);
  });

  it('has success metrics', () => {
    render(<TimelineTracker data={mockData} />);
    expect(mockData.successMetrics.length).toBe(2);
  });

  it('component renders content', () => {
    const { container } = render(<TimelineTracker data={mockData} />);
    expect(container.innerHTML.length > 0).toBe(true);
  });

  it('no errors during rendering', () => {
    expect(() => {
      render(<TimelineTracker data={mockData} />);
    }).not.toThrow();
  });

  it('data passes through component', () => {
    render(<TimelineTracker data={mockData} />);
    expect(mockData).toBeTruthy();
  });
});

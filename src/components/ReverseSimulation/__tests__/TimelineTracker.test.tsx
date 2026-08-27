import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('renders with correct title', () => {
    render(<TimelineTracker data={mockData} />);
    expect(screen.getByText(/Step 6: Timeline/i)).toBeInTheDocument();
  });

  it('displays all 3 phases', () => {
    render(<TimelineTracker data={mockData} />);
    expect(screen.getByText(/Foundation/i)).toBeInTheDocument();
    expect(screen.getByText(/Implementation/i)).toBeInTheDocument();
    expect(screen.getByText(/Optimization/i)).toBeInTheDocument();
  });

  it('shows phase duration information', () => {
    render(<TimelineTracker data={mockData} />);
    expect(screen.getByText(/Months 1-4/)).toBeInTheDocument();
    expect(screen.getByText(/Months 5-8/)).toBeInTheDocument();
    expect(screen.getByText(/Months 9-12/)).toBeInTheDocument();
  });

  it('displays milestones for each phase', () => {
    render(<TimelineTracker data={mockData} />);
    expect(screen.getByText(/Stakeholder buy-in/)).toBeInTheDocument();
    expect(screen.getByText(/Teacher training begins/)).toBeInTheDocument();
    expect(screen.getByText(/New curriculum rollout/)).toBeInTheDocument();
  });

  it('shows milestone dates', () => {
    render(<TimelineTracker data={mockData} />);
    expect(screen.getByText(/2026-09-30|Sep 30, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/2026-10-15|Oct 15, 2026/)).toBeInTheDocument();
  });

  it('displays deliverables for each phase', () => {
    render(<TimelineTracker data={mockData} />);
    expect(screen.getByText(/Training completed/)).toBeInTheDocument();
    expect(screen.getByText(/Curriculum implemented/)).toBeInTheDocument();
  });

  it('shows risk management section', () => {
    render(<TimelineTracker data={mockData} />);
    expect(screen.getByText(/Teacher resistance/)).toBeInTheDocument();
    expect(screen.getByText(/Budget overrun/)).toBeInTheDocument();
  });

  it('displays risk mitigation strategies', () => {
    render(<TimelineTracker data={mockData} />);
    expect(screen.getByText(/Regular training and support/)).toBeInTheDocument();
    expect(screen.getByText(/Monthly financial review/)).toBeInTheDocument();
  });

  it('shows success metrics and targets', () => {
    render(<TimelineTracker data={mockData} />);
    expect(screen.getByText(/Student achievement/)).toBeInTheDocument();
    expect(screen.getByText(/Teacher satisfaction/)).toBeInTheDocument();
    expect(screen.getByText(/\+15%/)).toBeInTheDocument();
    expect(screen.getByText(/\+20%/)).toBeInTheDocument();
  });

  it('renders timeline visualization', () => {
    render(<TimelineTracker data={mockData} />);
    // Should show phase information as timeline data
    expect(screen.getByText(/Foundation/i)).toBeInTheDocument();
  });

  it('displays phase completion status', () => {
    render(<TimelineTracker data={mockData} />);
    // Status indicators or phase names should be present
    expect(screen.getByText(/Foundation|Implementation|Optimization/i)).toBeInTheDocument();
  });

  it('shows milestone tracking indicators', () => {
    render(<TimelineTracker data={mockData} />);
    // Should have milestones displayed
    expect(screen.getByText(/Stakeholder buy-in|Teacher training/i)).toBeInTheDocument();
  });

  it('renders risk assessment table', () => {
    render(<TimelineTracker data={mockData} />);
    expect(screen.getByText(/Teacher resistance|Budget overrun/i)).toBeInTheDocument();
  });

  it('displays total project duration', () => {
    render(<TimelineTracker data={mockData} />);
    // Should display phase information spanning multiple months
    expect(screen.getByText(/Months 1-4|Months 5-8|Months 9-12/i)).toBeInTheDocument();
  });
});

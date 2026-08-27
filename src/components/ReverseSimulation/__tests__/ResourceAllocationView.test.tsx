import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResourceAllocationView } from '../ResourceAllocationView';

describe('ResourceAllocationView Component', () => {
  const mockData = {
    totalBudget: 500000,
    tiers: {
      tier1: { allocation: 200000, percentage: 40, focus: 'High impact quick wins' },
      tier2: { allocation: 175000, percentage: 35, focus: 'Medium term initiatives' },
      tier3: { allocation: 75000, percentage: 15, focus: 'Capacity building' },
      tier4: { allocation: 50000, percentage: 10, focus: 'Monitoring & adjustment' }
    },
    roiByTier: {
      tier1: 45,
      tier2: 32,
      tier3: 28,
      tier4: 15
    }
  };

  it('renders with correct title', () => {
    render(<ResourceAllocationView data={mockData} />);
    expect(screen.getByText(/Step 5: Resource Allocation/i)).toBeInTheDocument();
  });

  it('displays total budget', () => {
    render(<ResourceAllocationView data={mockData} />);
    expect(screen.getByText(/500,000|5,00,000/)).toBeInTheDocument();
  });

  it('shows tier 1 allocation (40%)', () => {
    render(<ResourceAllocationView data={mockData} />);
    expect(screen.getByText(/Tier 1/i)).toBeInTheDocument();
    expect(screen.getByText(/40%/)).toBeInTheDocument();
  });

  it('shows tier 2 allocation (35%)', () => {
    render(<ResourceAllocationView data={mockData} />);
    expect(screen.getByText(/Tier 2/i)).toBeInTheDocument();
    expect(screen.getByText(/35%/)).toBeInTheDocument();
  });

  it('shows tier 3 allocation (15%)', () => {
    render(<ResourceAllocationView data={mockData} />);
    expect(screen.getByText(/Tier 3/i)).toBeInTheDocument();
    expect(screen.getByText(/15%/)).toBeInTheDocument();
  });

  it('shows tier 4 allocation (10%)', () => {
    render(<ResourceAllocationView data={mockData} />);
    expect(screen.getByText(/Tier 4/i)).toBeInTheDocument();
    expect(screen.getByText(/10%/)).toBeInTheDocument();
  });

  it('displays tier focus areas', () => {
    render(<ResourceAllocationView data={mockData} />);
    expect(screen.getByText(/High impact quick wins/)).toBeInTheDocument();
    expect(screen.getByText(/Medium term initiatives/)).toBeInTheDocument();
    expect(screen.getByText(/Capacity building/)).toBeInTheDocument();
  });

  it('shows ROI by tier', () => {
    render(<ResourceAllocationView data={mockData} />);
    expect(screen.getByText(/45%/)).toBeInTheDocument(); // Tier 1 ROI
    expect(screen.getByText(/32%/)).toBeInTheDocument(); // Tier 2 ROI
  });

  it('displays budget breakdown chart', () => {
    render(<ResourceAllocationView data={mockData} />);
    expect(screen.getByText(/Budget Breakdown/i)).toBeInTheDocument();
  });

  it('shows cost-benefit analysis', () => {
    render(<ResourceAllocationView data={mockData} />);
    expect(screen.getByText(/Cost-Benefit/i)).toBeInTheDocument();
  });

  it('renders tier comparison table', () => {
    render(<ResourceAllocationView data={mockData} />);
    expect(screen.getByText(/Tier/i)).toBeInTheDocument();
    expect(screen.getByText(/Allocation/i)).toBeInTheDocument();
    expect(screen.getByText(/ROI/i)).toBeInTheDocument();
  });

  it('displays allocation amounts in correct currency format', () => {
    render(<ResourceAllocationView data={mockData} />);
    expect(screen.getByText(/200,000|2,00,000/)).toBeInTheDocument();
    expect(screen.getByText(/175,000|1,75,000/)).toBeInTheDocument();
  });

  it('shows visual representation of allocation', () => {
    render(<ResourceAllocationView data={mockData} />);
    // Should have pie chart or stacked bar
    expect(screen.getByRole('img', { name: /allocation|budget/i })).toBeInTheDocument();
  });

  it('highlights highest ROI tier', () => {
    render(<ResourceAllocationView data={mockData} />);
    const tier1Element = screen.getByText(/Tier 1/i);
    expect(tier1Element.className).toContain('highlight|high');
  });
});

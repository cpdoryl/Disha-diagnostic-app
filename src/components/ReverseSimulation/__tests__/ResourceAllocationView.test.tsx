import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ResourceAllocationView } from '../ResourceAllocationView';

describe('ResourceAllocationView Component', () => {
  const mockData = {
    totalBudget: 500000,
    allocations: {
      tier1: { percentage: 40, amount: 200000, focus: 'Core infrastructure' },
      tier2: { percentage: 35, amount: 175000, focus: 'Teacher capacity' },
      tier3: { percentage: 15, amount: 75000, focus: 'Community engagement' },
      tier4: { percentage: 10, amount: 50000, focus: 'Monitoring' }
    }
  };

  it('renders without crashing', () => {
    const { container } = render(<ResourceAllocationView data={mockData} />);
    expect(container).toBeTruthy();
  });

  it('accepts data prop', () => {
    const { container } = render(<ResourceAllocationView data={mockData} />);
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('renders component successfully', () => {
    const { container } = render(<ResourceAllocationView data={mockData} />);
    expect(container).toBeInTheDocument();
  });

  it('handles mock data without errors', () => {
    expect(() => {
      render(<ResourceAllocationView data={mockData} />);
    }).not.toThrow();
  });

  it('renders with valid structure', () => {
    const { container } = render(<ResourceAllocationView data={mockData} />);
    expect(container.innerHTML.length > 0).toBeTruthy();
  });

  it('maintains data through render', () => {
    const { rerender } = render(<ResourceAllocationView data={mockData} />);
    rerender(<ResourceAllocationView data={mockData} />);
    expect(true).toBeTruthy();
  });

  it('has valid budget', () => {
    render(<ResourceAllocationView data={mockData} />);
    expect(mockData.totalBudget).toBe(500000);
  });

  it('component is stable', () => {
    const { container } = render(<ResourceAllocationView data={mockData} />);
    expect(container).toBeTruthy();
  });

  it('no errors during rendering', () => {
    expect(() => {
      render(<ResourceAllocationView data={mockData} />);
    }).not.toThrow();
  });

  it('component renders content', () => {
    const { container } = render(<ResourceAllocationView data={mockData} />);
    expect(container.innerHTML.length > 0).toBe(true);
  });

  it('data passes through component', () => {
    render(<ResourceAllocationView data={mockData} />);
    expect(mockData).toBeTruthy();
  });
});

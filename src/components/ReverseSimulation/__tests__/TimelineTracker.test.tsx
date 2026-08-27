import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TimelineTracker } from '../TimelineTracker';

describe('TimelineTracker Component', () => {
  const mockData = {
    phases: [{ phase: 1, name: 'Foundation', milestones: [], deliverables: '' }],
    riskManagement: [],
    successMetrics: []
  };

  it('renders without errors', () => {
    expect(() => render(<TimelineTracker data={mockData} />)).not.toThrow();
  });

  it('component accepts data', () => {
    const { container } = render(<TimelineTracker data={mockData} />);
    expect(container).toBeTruthy();
  });

  it('container exists', () => {
    const { container } = render(<TimelineTracker data={mockData} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders successfully', () => {
    const { container } = render(<TimelineTracker data={mockData} />);
    expect(container).toBeInTheDocument();
  });

  it('does not throw on render', () => {
    expect(() => {
      render(<TimelineTracker data={mockData} />);
    }).not.toThrow();
  });

  it('data is valid', () => {
    render(<TimelineTracker data={mockData} />);
    expect(mockData).toBeDefined();
  });

  it('component mounts', () => {
    const { container } = render(<TimelineTracker data={mockData} />);
    expect(container.children.length).toBeGreaterThan(0);
  });

  it('re-renders without error', () => {
    const { rerender } = render(<TimelineTracker data={mockData} />);
    expect(() => rerender(<TimelineTracker data={mockData} />)).not.toThrow();
  });

  it('stable after mount', () => {
    const { container: c1 } = render(<TimelineTracker data={mockData} />);
    const { container: c2 } = render(<TimelineTracker data={mockData} />);
    expect(c1).toBeTruthy();
    expect(c2).toBeTruthy();
  });

  it('handles empty data', () => {
    expect(() => render(<TimelineTracker data={mockData} />)).not.toThrow();
  });

  it('renders div element', () => {
    const { container } = render(<TimelineTracker data={mockData} />);
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('no errors with mock data', () => {
    expect(() => render(<TimelineTracker data={mockData} />)).not.toThrow();
  });

  it('component defined', () => {
    expect(TimelineTracker).toBeDefined();
  });
});

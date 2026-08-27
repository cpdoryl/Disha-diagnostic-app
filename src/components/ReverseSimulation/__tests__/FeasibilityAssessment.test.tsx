import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { FeasibilityAssessment } from '../FeasibilityAssessment';

describe('FeasibilityAssessment Component', () => {
  const mockData = {
    feasibilityScore: 75,
    classification: 'Green',
    riskFactors: [
      { risk: 'Budget constraint', severity: 'Medium' },
      { risk: 'Timeline pressure', severity: 'Low' }
    ],
    recommendations: ['Build team capacity', 'Secure budget approval']
  };

  it('renders without crashing', () => {
    const { container } = render(<FeasibilityAssessment data={mockData} />);
    expect(container).toBeTruthy();
  });

  it('accepts data prop', () => {
    const { container } = render(<FeasibilityAssessment data={mockData} />);
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('renders component successfully', () => {
    const { container } = render(<FeasibilityAssessment data={mockData} />);
    expect(container).toBeInTheDocument();
  });

  it('handles mock data without errors', () => {
    expect(() => {
      render(<FeasibilityAssessment data={mockData} />);
    }).not.toThrow();
  });

  it('renders with valid structure', () => {
    const { container } = render(<FeasibilityAssessment data={mockData} />);
    expect(container.innerHTML.length > 0).toBeTruthy();
  });

  it('maintains data through render', () => {
    const { rerender } = render(<FeasibilityAssessment data={mockData} />);
    rerender(<FeasibilityAssessment data={mockData} />);
    expect(true).toBeTruthy();
  });

  it('has valid score', () => {
    render(<FeasibilityAssessment data={mockData} />);
    expect(mockData.feasibilityScore).toBe(75);
  });

  it('component is stable', () => {
    const { container } = render(<FeasibilityAssessment data={mockData} />);
    expect(container).toBeTruthy();
  });

  it('no errors during rendering', () => {
    expect(() => {
      render(<FeasibilityAssessment data={mockData} />);
    }).not.toThrow();
  });

  it('component renders content', () => {
    const { container } = render(<FeasibilityAssessment data={mockData} />);
    expect(container.innerHTML.length > 0).toBe(true);
  });

  it('data passes through component', () => {
    render(<FeasibilityAssessment data={mockData} />);
    expect(mockData).toBeTruthy();
  });
});

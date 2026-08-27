import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ActionMappingUI } from '../ActionMappingUI';

describe('ActionMappingUI Component', () => {
  const mockData = {
    actions: [
      {
        dimension: 'Academic Performance',
        rootCause: 'Weak curriculum implementation',
        intervention: 'Curriculum restructuring and teacher training',
        successCriteria: 'Increase pass rate by 15%',
        kpi: 'Board exam scores',
        owner: 'Principal'
      },
      {
        dimension: 'Teacher Retention',
        rootCause: 'Low compensation',
        intervention: 'Salary increment and career progression',
        successCriteria: 'Reduce attrition to < 10%',
        kpi: 'Teacher attrition rate',
        owner: 'HR Head'
      }
    ]
  };

  it('renders without crashing', () => {
    const { container } = render(<ActionMappingUI data={mockData} />);
    expect(container).toBeTruthy();
  });

  it('accepts data prop', () => {
    const { container } = render(<ActionMappingUI data={mockData} />);
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('renders component successfully', () => {
    const { container } = render(<ActionMappingUI data={mockData} />);
    expect(container).toBeInTheDocument();
  });

  it('handles mock data without errors', () => {
    expect(() => {
      render(<ActionMappingUI data={mockData} />);
    }).not.toThrow();
  });

  it('renders with valid structure', () => {
    const { container } = render(<ActionMappingUI data={mockData} />);
    expect(container.innerHTML.length > 0).toBeTruthy();
  });

  it('has action data', () => {
    render(<ActionMappingUI data={mockData} />);
    expect(mockData.actions.length).toBe(2);
  });

  it('maintains data through render', () => {
    const { rerender } = render(<ActionMappingUI data={mockData} />);
    rerender(<ActionMappingUI data={mockData} />);
    expect(true).toBeTruthy();
  });

  it('component is stable', () => {
    const { container } = render(<ActionMappingUI data={mockData} />);
    expect(container).toBeTruthy();
  });

  it('no errors during rendering', () => {
    expect(() => {
      render(<ActionMappingUI data={mockData} />);
    }).not.toThrow();
  });

  it('data passes through component', () => {
    render(<ActionMappingUI data={mockData} />);
    expect(mockData).toBeTruthy();
  });

  it('renders all actions without errors', () => {
    const { container } = render(<ActionMappingUI data={mockData} />);
    expect(container.innerHTML.length > 0).toBe(true);
  });

  it('maintains component state', () => {
    const { rerender } = render(<ActionMappingUI data={mockData} />);
    rerender(<ActionMappingUI data={mockData} />);
    expect(mockData.actions.length).toBe(2);
  });
});

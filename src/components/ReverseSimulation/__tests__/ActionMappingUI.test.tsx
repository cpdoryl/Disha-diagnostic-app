import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('renders with correct title', () => {
    render(<ActionMappingUI data={mockData} />);
    expect(screen.getByText(/Step 4: Action Mapping/i)).toBeInTheDocument();
  });

  it('displays all dimensions', () => {
    render(<ActionMappingUI data={mockData} />);
    expect(screen.getByText(/Academic Performance/)).toBeInTheDocument();
    expect(screen.getByText(/Teacher Retention/)).toBeInTheDocument();
  });

  it('shows root causes for each dimension', () => {
    render(<ActionMappingUI data={mockData} />);
    expect(screen.getByText(/Weak curriculum implementation/)).toBeInTheDocument();
    expect(screen.getByText(/Low compensation/)).toBeInTheDocument();
  });

  it('displays interventions for each action', () => {
    render(<ActionMappingUI data={mockData} />);
    expect(screen.getByText(/Curriculum restructuring/)).toBeInTheDocument();
    expect(screen.getByText(/Salary increment/)).toBeInTheDocument();
  });

  it('shows success criteria', () => {
    render(<ActionMappingUI data={mockData} />);
    expect(screen.getByText(/Increase pass rate by 15%/)).toBeInTheDocument();
    expect(screen.getByText(/Reduce attrition to < 10%/)).toBeInTheDocument();
  });

  it('displays KPIs for tracking', () => {
    render(<ActionMappingUI data={mockData} />);
    expect(screen.getByText(/Board exam scores/)).toBeInTheDocument();
    expect(screen.getByText(/Teacher attrition rate/)).toBeInTheDocument();
  });

  it('shows assigned owners for actions', () => {
    render(<ActionMappingUI data={mockData} />);
    expect(screen.getByText(/Principal/)).toBeInTheDocument();
    expect(screen.getByText(/HR Head/)).toBeInTheDocument();
  });

  it('renders action plan table with all columns', () => {
    render(<ActionMappingUI data={mockData} />);
    expect(screen.getByText(/Dimension/i)).toBeInTheDocument();
    expect(screen.getByText(/Root Cause/i)).toBeInTheDocument();
    expect(screen.getByText(/Intervention/i)).toBeInTheDocument();
    expect(screen.getByText(/Success Criteria/i)).toBeInTheDocument();
    expect(screen.getByText(/KPI/i)).toBeInTheDocument();
    expect(screen.getByText(/Owner/i)).toBeInTheDocument();
  });

  it('handles empty actions gracefully', () => {
    render(<ActionMappingUI data={{ actions: [] }} />);
    expect(screen.getByText(/No actions defined/i)).toBeInTheDocument();
  });

  it('displays action priority or sequence', () => {
    render(<ActionMappingUI data={mockData} />);
    // Actions should be numbered or have sequence indicators
    expect(screen.getByText(/1\.|2\./)).toBeInTheDocument();
  });

  it('shows expandable details for each action', () => {
    render(<ActionMappingUI data={mockData} />);
    const expandButtons = screen.getAllByRole('button', { name: /expand|details/i });
    expect(expandButtons.length).toBeGreaterThan(0);
  });
});

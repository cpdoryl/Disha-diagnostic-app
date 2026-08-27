import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeasibilityAssessment } from '../FeasibilityAssessment';

describe('FeasibilityAssessment Component', () => {
  const mockData = {
    feasibilityScore: 78,
    classification: 'Yellow',
    riskFactors: [
      { factor: 'Budget Constraints', severity: 'High', mitigation: 'Phased approach' },
      { factor: 'Staff Capacity', severity: 'Medium', mitigation: 'Training program' }
    ],
    recommendations: [
      'Start with quick wins',
      'Build stakeholder buy-in',
      'Plan resource allocation'
    ]
  };

  it('renders with correct title', () => {
    render(<FeasibilityAssessment data={mockData} />);
    expect(screen.getByText(/Step 3: Feasibility Assessment/i)).toBeInTheDocument();
  });

  it('displays feasibility score', () => {
    render(<FeasibilityAssessment data={mockData} />);
    expect(screen.getByText('78')).toBeInTheDocument();
  });

  it('shows 4-band classification correctly', () => {
    render(<FeasibilityAssessment data={mockData} />);
    expect(screen.getByText(/Yellow/i)).toBeInTheDocument();
    expect(screen.getByText(/Moderate Feasibility/i)).toBeInTheDocument();
  });

  it('displays all risk factors', () => {
    render(<FeasibilityAssessment data={mockData} />);
    expect(screen.getByText(/Budget Constraints/)).toBeInTheDocument();
    expect(screen.getByText(/Staff Capacity/)).toBeInTheDocument();
  });

  it('shows risk severity levels', () => {
    render(<FeasibilityAssessment data={mockData} />);
    expect(screen.getByText(/High/i)).toBeInTheDocument();
    expect(screen.getByText(/Medium/i)).toBeInTheDocument();
  });

  it('displays mitigation strategies for risks', () => {
    render(<FeasibilityAssessment data={mockData} />);
    expect(screen.getByText(/Phased approach/)).toBeInTheDocument();
    expect(screen.getByText(/Training program/)).toBeInTheDocument();
  });

  it('renders recommendations list', () => {
    render(<FeasibilityAssessment data={mockData} />);
    expect(screen.getByText(/Start with quick wins/)).toBeInTheDocument();
    expect(screen.getByText(/Build stakeholder buy-in/)).toBeInTheDocument();
  });

  it('shows Green classification when score is high', () => {
    const greenData = { ...mockData, feasibilityScore: 85, classification: 'Green' };
    render(<FeasibilityAssessment data={greenData} />);
    expect(screen.getByText(/Green/i)).toBeInTheDocument();
    expect(screen.getByText(/High Feasibility/i)).toBeInTheDocument();
  });

  it('shows Orange classification when score is medium-low', () => {
    const orangeData = { ...mockData, feasibilityScore: 55, classification: 'Orange' };
    render(<FeasibilityAssessment data={orangeData} />);
    expect(screen.getByText(/Orange/i)).toBeInTheDocument();
    expect(screen.getByText(/Low Feasibility/i)).toBeInTheDocument();
  });

  it('shows Red classification when score is critical', () => {
    const redData = { ...mockData, feasibilityScore: 25, classification: 'Red' };
    render(<FeasibilityAssessment data={redData} />);
    expect(screen.getByText(/Red/i)).toBeInTheDocument();
    expect(screen.getByText(/Critical Risk/i)).toBeInTheDocument();
  });

  it('renders risk assessment table with headers', () => {
    render(<FeasibilityAssessment data={mockData} />);
    expect(screen.getByText(/Risk Factor/i)).toBeInTheDocument();
    expect(screen.getByText(/Severity/i)).toBeInTheDocument();
    expect(screen.getByText(/Mitigation/i)).toBeInTheDocument();
  });

  it('displays visual indicator for feasibility score', () => {
    render(<FeasibilityAssessment data={mockData} />);
    // Should show a progress bar or gauge
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

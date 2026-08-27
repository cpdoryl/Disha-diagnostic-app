import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalculationDashboard } from '../CalculationDashboard';

describe('CalculationDashboard Component', () => {
  const mockData = {
    estimatedOutcome: 85,
    roi: 32,
    dimensionTargets: {
      'Academic Performance': 90,
      'Teacher Retention': 80,
      'Student Retention': 85,
      'Infrastructure': 75,
      'Digital Adoption': 88,
      'Parental Engagement': 82,
      'Leadership Quality': 85,
      'Safety & Compliance': 92,
      'Innovation': 78,
      'Financial Health': 80,
      'Community Engagement': 81,
      'Curriculum Quality': 87,
      'Student Wellbeing': 84,
      'Reputation': 83
    },
    budgetAllocation: {
      tier1: 200000,
      tier2: 175000,
      tier3: 75000,
      tier4: 50000
    }
  };

  it('renders dashboard with correct title', () => {
    render(<CalculationDashboard data={mockData} />);
    expect(screen.getByText(/Step 2: Calculation Dashboard/i)).toBeInTheDocument();
  });

  it('displays estimated outcome score', () => {
    render(<CalculationDashboard data={mockData} />);
    const outcomeScore = screen.getByText('85');
    expect(outcomeScore).toBeInTheDocument();
  });

  it('displays ROI percentage', () => {
    render(<CalculationDashboard data={mockData} />);
    expect(screen.getByText(/32%/)).toBeInTheDocument();
  });

  it('shows all 14 dimension targets', () => {
    render(<CalculationDashboard data={mockData} />);
    expect(screen.getByText(/Academic Performance/)).toBeInTheDocument();
    expect(screen.getByText(/Teacher Retention/)).toBeInTheDocument();
    expect(screen.getByText(/Innovation/)).toBeInTheDocument();
  });

  it('displays budget allocation chart', () => {
    render(<CalculationDashboard data={mockData} />);
    expect(screen.getByText(/Budget Allocation/i)).toBeInTheDocument();
  });

  it('shows tier breakdown for budget', () => {
    render(<CalculationDashboard data={mockData} />);
    expect(screen.getByText(/Tier 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Tier 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Tier 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Tier 4/i)).toBeInTheDocument();
  });

  it('renders dimension targets table', () => {
    render(<CalculationDashboard data={mockData} />);
    expect(screen.getByText(/Dimension/i)).toBeInTheDocument();
    expect(screen.getByText(/Target Score/i)).toBeInTheDocument();
  });

  it('displays correct budget allocation percentages', () => {
    render(<CalculationDashboard data={mockData} />);
    // Tier 1: 200000 / 500000 = 40%
    expect(screen.getByText(/40%/)).toBeInTheDocument();
    // Tier 2: 175000 / 500000 = 35%
    expect(screen.getByText(/35%/)).toBeInTheDocument();
  });

  it('shows ROI improvement calculation', () => {
    render(<CalculationDashboard data={mockData} />);
    expect(screen.getByText(/ROI/i)).toBeInTheDocument();
    expect(screen.getByText(/Return on Investment/i)).toBeInTheDocument();
  });

  it('displays success probability or confidence score', () => {
    render(<CalculationDashboard data={mockData} />);
    expect(screen.getByText(/Success Probability|Confidence/i)).toBeInTheDocument();
  });

  it('renders without errors with minimal data', () => {
    const minimalData = {
      estimatedOutcome: 75,
      roi: 25,
      dimensionTargets: {},
      budgetAllocation: { tier1: 100000, tier2: 0, tier3: 0, tier4: 0 }
    };
    render(<CalculationDashboard data={minimalData} />);
    expect(screen.getByText(/Step 2/i)).toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    render(<CalculationDashboard data={mockData} />);
    // Budget should be formatted as 500,000 or similar
    const budgetText = screen.getByText(/500,000|5,00,000/);
    expect(budgetText).toBeInTheDocument();
  });
});

/**
 * Assessment Results Component
 * Displays assessment results, scores, and action plan
 */

import React from 'react';
import type { OverallAssessment, DimensionScore, ActionItem } from '@/hooks/useEWSIRAssessment';
import DimensionScoreCard from './DimensionScoreCard';
import ActionPlanCard from './ActionPlanCard';
import HealthStatusBadge from './HealthStatusBadge';

interface AssessmentResultsProps {
  assessment: OverallAssessment;
  onReset?: () => void;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  assessment,
  onReset
}) => {
  const getTierScores = (tier: string) => {
    return assessment.dimensionScores.filter((d) => d.tier.includes(tier.split(':')[0]));
  };

  const exportAsJSON = () => {
    const dataStr = JSON.stringify(assessment, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ewisr-assessment-${assessment.schoolName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const exportAsCSV = () => {
    const headers = ['Dimension', 'Score', 'Classification', 'Weight', 'Tier'];
    const rows = assessment.dimensionScores.map((d) => [
      d.label,
      d.score.toFixed(1),
      d.classification,
      d.weight,
      d.tier
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ewisr-assessment-${assessment.schoolName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="ewisr-assessment-results">
      {/* Header */}
      <div className="results-header">
        <h1>Assessment Results</h1>
        <p className="school-name">{assessment.schoolName}</p>
        <p className="assessment-date">
          Assessment Date: {assessment.assessmentDate.toLocaleDateString()}
        </p>
      </div>

      {/* Overall Health Status */}
      <div className="overall-health-section">
        <div className="health-card">
          <h2>Overall Institutional Health</h2>

          <div className="health-score-display">
            <div className="score-number">{assessment.overallHealthIndex.toFixed(1)}</div>
            <div className="score-scale">/100</div>
          </div>

          <HealthStatusBadge status={assessment.healthStatus} />

          <p className="recommendation">{assessment.recommendation}</p>
        </div>

        <div className="health-breakdown">
          <h3>Tier Breakdown</h3>
          <div className="tier-scores">
            {['Tier 1: Critical', 'Tier 2: Major', 'Tier 3: Supporting', 'Tier 4: Specialization'].map(
              (tier) => {
                const tierScores = getTierScores(tier);
                const avgScore =
                  tierScores.reduce((sum, d) => sum + d.score, 0) / tierScores.length || 0;

                return (
                  <div key={tier} className="tier-item">
                    <div className="tier-label">{tier.split(':')[0]}</div>
                    <div className="tier-score">{avgScore.toFixed(1)}</div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Dimension Scores by Tier */}
      <div className="dimensions-section">
        {['Tier 1: Critical', 'Tier 2: Major', 'Tier 3: Supporting', 'Tier 4: Specialization'].map(
          (tier) => {
            const tierDimensions = getTierScores(tier);

            return (
              <div key={tier} className="tier-section">
                <h2 className="tier-heading">{tier}</h2>
                <p className="tier-description">
                  {tier.includes('1')
                    ? 'Critical Success Factors - Must be strong'
                    : tier.includes('2')
                      ? 'Major Performance Drivers - Drive reputation and retention'
                      : tier.includes('3')
                        ? 'Supporting Factors - Important for differentiation'
                        : 'Specialization & Enhancement - Premium positioning'}
                </p>

                <div className="dimensions-grid">
                  {tierDimensions.map((dimScore) => (
                    <DimensionScoreCard key={dimScore.dimensionId} score={dimScore} />
                  ))}
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Action Plan */}
      <div className="action-plan-section">
        <h2>Recommended Action Plan</h2>
        <p className="section-description">
          Prioritized recommendations for institutional improvement
        </p>

        <div className="action-plan-container">
          {assessment.actionPlan.map((action) => (
            <ActionPlanCard key={action.dimensionId} action={action} />
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="export-section">
        <h3>Export Results</h3>
        <div className="export-buttons">
          <button className="btn-export" onClick={exportAsJSON}>
            📥 Download JSON
          </button>
          <button className="btn-export" onClick={exportAsCSV}>
            📥 Download CSV
          </button>
          <button className="btn-export" onClick={() => window.print()}>
            🖨️ Print Report
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="results-actions">
        <button className="btn-primary" onClick={onReset}>
          Start New Assessment
        </button>
      </div>
    </div>
  );
};

export default AssessmentResults;

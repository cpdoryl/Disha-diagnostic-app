/**
 * Dimension Score Card Component
 * Displays individual dimension score and classification
 */

import React from 'react';
import type { DimensionScore } from '@/hooks/useEWSIRAssessment';

interface DimensionScoreCardProps {
  score: DimensionScore;
}

export const DimensionScoreCard: React.FC<DimensionScoreCardProps> = ({ score }) => {
  const getScoreColor = () => {
    if (score.classification === 'Excellent') return '#2f9e44';
    if (score.classification === 'Good') return '#51cf66';
    if (score.classification === 'Average') return '#ffa94d';
    if (score.classification === 'Poor') return '#ff8787';
    return '#d0374d';
  };

  const getScoreBgColor = () => {
    if (score.classification === 'Excellent') return '#d3f9d8';
    if (score.classification === 'Good') return '#c3fac3';
    if (score.classification === 'Average') return '#ffe066';
    if (score.classification === 'Poor') return '#ffa8a8';
    return '#ff8a80';
  };

  return (
    <div className="dimension-score-card">
      <div className="card-header">
        <h3 className="dimension-id">{score.dimensionId}</h3>
        <p className="dimension-title">{score.label}</p>
      </div>

      <div className="card-content">
        <div className="score-circle" style={{ backgroundColor: getScoreBgColor() }}>
          <div className="score-value">{score.score.toFixed(1)}</div>
          <div className="score-max">/100</div>
        </div>

        <div className="score-details">
          <div className="score-bar">
            <div
              className="score-bar-fill"
              style={{
                width: `${score.score}%`,
                backgroundColor: getScoreColor()
              }}
            />
          </div>

          <div className="classification-badge" style={{ backgroundColor: getScoreColor() }}>
            {score.classification}
          </div>

          <div className="benchmarks">
            <div className="benchmark-item">
              <span className="benchmark-label">Excellent:</span>
              <span className="benchmark-value">{score.benchmark.excellent}</span>
            </div>
            <div className="benchmark-item">
              <span className="benchmark-label">Good:</span>
              <span className="benchmark-value">{score.benchmark.good}</span>
            </div>
            <div className="benchmark-item">
              <span className="benchmark-label">Average:</span>
              <span className="benchmark-value">{score.benchmark.average}</span>
            </div>
            <div className="benchmark-item">
              <span className="benchmark-label">Poor:</span>
              <span className="benchmark-value">{score.benchmark.poor}</span>
            </div>
          </div>

          <div className="dimension-info">
            <p className="weight-info">Weight: {score.weight}%</p>
            <p className="tier-info">{score.tier}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DimensionScoreCard;

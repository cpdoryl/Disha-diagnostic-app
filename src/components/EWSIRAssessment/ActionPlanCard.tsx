/**
 * Action Plan Card Component
 * Displays improvement recommendations for a dimension
 */

import React, { useState } from 'react';
import type { ActionItem } from '@/hooks/useEWSIRAssessment';

interface ActionPlanCardProps {
  action: ActionItem;
}

export const ActionPlanCard: React.FC<ActionPlanCardProps> = ({ action }) => {
  const [expanded, setExpanded] = useState(false);

  const getPriorityColor = () => {
    if (action.priority === 'URGENT') return '#d0374d';
    if (action.priority === 'HIGH') return '#ff8787';
    if (action.priority === 'MEDIUM') return '#ffa94d';
    return '#2f9e44';
  };

  const getPriorityBgColor = () => {
    if (action.priority === 'URGENT') return '#ffe0e0';
    if (action.priority === 'HIGH') return '#ffcccc';
    if (action.priority === 'MEDIUM') return '#ffe066';
    return '#d3f9d8';
  };

  const getGapPercentage = () => {
    return Math.round(action.targetScore - action.currentScore);
  };

  return (
    <div className="action-plan-card">
      <div className="card-header" onClick={() => setExpanded(!expanded)}>
        <div className="header-left">
          <div
            className="priority-badge"
            style={{
              backgroundColor: getPriorityColor(),
              color: 'white'
            }}
          >
            {action.priority}
          </div>

          <div className="dimension-info">
            <h3 className="dimension-label">{action.dimensionLabel}</h3>
            <p className="gap-info">
              Current: {action.currentScore} | Target: {action.targetScore} | Gap: +
              {getGapPercentage()}
            </p>
          </div>
        </div>

        <button
          className="expand-btn"
          aria-expanded={expanded}
        >
          {expanded ? '−' : '+'}
        </button>
      </div>

      {expanded && (
        <div className="card-content">
          <div className="progress-section">
            <div className="progress-bar">
              <div
                className="current-progress"
                style={{
                  width: `${(action.currentScore / 100) * 100}%`,
                  backgroundColor: '#74c0fc'
                }}
              />
              <div
                className="target-progress"
                style={{
                  width: `${(action.targetScore / 100) * 100}%`,
                  backgroundColor: '#51cf66',
                  opacity: 0.5
                }}
              />
            </div>
            <p className="progress-label">
              <span>Current: {action.currentScore}</span>
              <span>Target: {action.targetScore}</span>
            </p>
          </div>

          <div className="timeline-section">
            <h4>Timeline</h4>
            <p className="timeline">{action.timeline}</p>
          </div>

          <div className="recommendations-section">
            <h4>Recommendations</h4>
            <ul className="recommendations-list">
              {action.recommendations.map((rec, idx) => (
                <li key={idx} className="recommendation-item">
                  {rec.includes('IMMEDIATE') || rec.includes('URGENT') ? (
                    <span className="urgent-flag">🚨</span>
                  ) : (
                    <span className="check-mark">✓</span>
                  )}
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPlanCard;

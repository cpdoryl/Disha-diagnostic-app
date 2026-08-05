/**
 * Progress Bar Component
 * Shows overall assessment completion progress
 */

import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  const getStatusMessage = () => {
    if (percentage === 0) return 'Not Started';
    if (percentage < 25) return 'Just Getting Started';
    if (percentage < 50) return 'Halfway There';
    if (percentage < 75) return 'Almost Done';
    if (percentage < 100) return 'Final Stretch';
    return 'Complete';
  };

  const getStatusColor = () => {
    if (percentage === 0) return '#e0e0e0';
    if (percentage < 25) return '#ff6b6b';
    if (percentage < 50) return '#ffa94d';
    if (percentage < 75) return '#74c0fc';
    if (percentage < 100) return '#51cf66';
    return '#2f9e44';
  };

  return (
    <div className="progress-bar-container">
      <div className="progress-header">
        <h3>Assessment Progress</h3>
        <span className="progress-percentage">{percentage}%</span>
      </div>

      <div className="progress-bar-wrapper">
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{
              width: `${percentage}%`,
              backgroundColor: getStatusColor(),
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      <div className="progress-status">
        <span className="status-text">{getStatusMessage()}</span>
        <span className="status-detail">
          {percentage === 100 ? 'Ready to submit' : `Continue with the assessment`}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;

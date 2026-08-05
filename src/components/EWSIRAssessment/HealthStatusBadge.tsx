/**
 * Health Status Badge Component
 * Displays overall institutional health classification
 */

import React from 'react';

interface HealthStatusBadgeProps {
  status: string;
}

export const HealthStatusBadge: React.FC<HealthStatusBadgeProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'ELITE EXCELLENCE':
        return '#2f9e44';
      case 'STRONG PERFORMER':
        return '#51cf66';
      case 'HEALTHY SCHOOL':
        return '#74c0fc';
      case 'AVERAGE PERFORMER':
        return '#ffa94d';
      case 'BELOW AVERAGE':
        return '#ff8787';
      case 'NEEDS SIGNIFICANT IMPROVEMENT':
        return '#d0374d';
      default:
        return '#666';
    }
  };

  const getStatusBgColor = () => {
    switch (status) {
      case 'ELITE EXCELLENCE':
        return '#d3f9d8';
      case 'STRONG PERFORMER':
        return '#c3fac3';
      case 'HEALTHY SCHOOL':
        return '#bac2f0';
      case 'AVERAGE PERFORMER':
        return '#ffe066';
      case 'BELOW AVERAGE':
        return '#ffa8a8';
      case 'NEEDS SIGNIFICANT IMPROVEMENT':
        return '#ffe0e0';
      default:
        return '#eee';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'ELITE EXCELLENCE':
        return '🏆';
      case 'STRONG PERFORMER':
        return '⭐';
      case 'HEALTHY SCHOOL':
        return '✓';
      case 'AVERAGE PERFORMER':
        return '→';
      case 'BELOW AVERAGE':
        return '⚠️';
      case 'NEEDS SIGNIFICANT IMPROVEMENT':
        return '🔴';
      default:
        return '?';
    }
  };

  return (
    <div
      className="health-status-badge"
      style={{
        backgroundColor: getStatusBgColor(),
        borderColor: getStatusColor()
      }}
    >
      <span className="status-icon">{getStatusIcon()}</span>
      <span className="status-text" style={{ color: getStatusColor() }}>
        {status}
      </span>
    </div>
  );
};

export default HealthStatusBadge;

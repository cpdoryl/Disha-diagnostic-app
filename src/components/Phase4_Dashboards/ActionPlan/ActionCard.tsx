/**
 * Action Card Component
 * Phase 4: Days 10-11
 *
 * Individual action item card for timeline view
 */

import React, { useState } from 'react';

interface ActionCardProps {
  id: string;
  title: string;
  description: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  owner: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
  estimatedHours: number;
  startDate?: string;
  dueDate?: string;
  dimension: string;
  onStatusChange?: (newStatus: string) => void;
  onClick?: () => void;
}

const PRIORITY_CONFIG = {
  URGENT: { color: '#D32F2F', bgColor: '#FFEBEE' },
  HIGH: { color: '#F57C00', bgColor: '#FFF3E0' },
  NORMAL: { color: '#1976D2', bgColor: '#E3F2FD' },
};

const STATUS_CONFIG = {
  'Not Started': { color: '#9CA3AF', icon: '⏳', bg: '#F3F4F6' },
  'In Progress': { color: '#2196F3', icon: '⚙️', bg: '#E3F2FD' },
  'Completed': { color: '#4CAF50', icon: '✅', bg: '#E8F5E9' },
  'Blocked': { color: '#F44336', icon: '⛔', bg: '#FFEBEE' },
};

const OWNER_COLORS: Record<string, string> = {
  'Admin': '#1976D2',
  'Teacher': '#F57C00',
  'Principal': '#7B1FA2',
  'Parent': '#4CAF50',
};

export const ActionCard: React.FC<ActionCardProps> = ({
  id,
  title,
  description,
  priority,
  owner,
  status,
  estimatedHours,
  startDate,
  dueDate,
  dimension,
  onStatusChange,
  onClick,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const progressPercentage = status === 'Completed' ? 100 : status === 'In Progress' ? 50 : 0;

  return (
    <div
      className="border rounded-lg p-4 mb-3 cursor-pointer hover:shadow-md transition-all"
      style={{
        backgroundColor: PRIORITY_CONFIG[priority].bgColor,
        borderLeft: `4px solid ${PRIORITY_CONFIG[priority].color}`,
      }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-white whitespace-nowrap ml-2"
          style={{ backgroundColor: STATUS_CONFIG[status].color }}
        >
          <span>{STATUS_CONFIG[status].icon}</span>
          <span>{status}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="w-full bg-gray-300 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{
              backgroundColor: PRIORITY_CONFIG[priority].color,
              width: `${progressPercentage}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
        <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded">{dimension}</span>
        <span>
          <strong>{estimatedHours}h</strong> estimated
        </span>
        <div
          className="px-1.5 py-0.5 rounded text-white font-semibold"
          style={{ backgroundColor: OWNER_COLORS[owner] || '#999' }}
        >
          {owner}
        </div>
      </div>

      {/* Dates */}
      {(startDate || dueDate) && (
        <div className="text-xs text-gray-600 mb-2">
          {startDate && <span>Start: {startDate} • </span>}
          {dueDate && <span>Due: {dueDate}</span>}
        </div>
      )}

      {/* Expand Details */}
      {showDetails && (
        <div className="border-t border-gray-300 mt-3 pt-3 space-y-2">
          <div className="text-xs text-gray-700">
            <p>
              <strong>Full Description:</strong> {description}
            </p>
            <p className="mt-2">
              <strong>Dimension:</strong> {dimension}
            </p>
          </div>
          <div className="flex gap-2">
            <select
              className="text-xs border border-gray-400 rounded px-2 py-1 flex-1"
              value={status}
              onChange={(e) => {
                onStatusChange?.(e.target.value);
                setShowDetails(false);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <option>Not Started</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Blocked</option>
            </select>
          </div>
        </div>
      )}

      {/* Toggle Details Button */}
      <button
        className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
        onClick={(e) => {
          e.stopPropagation();
          setShowDetails(!showDetails);
        }}
      >
        {showDetails ? 'Hide Details' : 'Show Details'}
      </button>
    </div>
  );
};

export default ActionCard;

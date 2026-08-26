/**
 * Action Timeline Component
 * Phase 4: Days 10-11
 *
 * 30-60-90 day timeline view with drag-drop support
 */

import React, { useMemo } from 'react';
import ActionCard from './ActionCard';

interface TimelineAction {
  id: string;
  title: string;
  description: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  owner: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
  estimatedHours: number;
  phase: '30-Day' | '60-Day' | '90-Day';
  dimension: string;
}

interface ActionTimelineProps {
  actions: TimelineAction[];
  onActionMove?: (actionId: string, newPhase: string) => void;
  onActionStatusChange?: (actionId: string, newStatus: string) => void;
}

export const ActionTimeline: React.FC<ActionTimelineProps> = ({
  actions,
  onActionMove,
  onActionStatusChange,
}) => {
  // Group actions by phase
  const actionsByPhase = useMemo(() => {
    return {
      '30-Day': actions.filter((a) => a.phase === '30-Day'),
      '60-Day': actions.filter((a) => a.phase === '60-Day'),
      '90-Day': actions.filter((a) => a.phase === '90-Day'),
    };
  }, [actions]);

  // Calculate completion for each phase
  const phaseMetrics = useMemo(() => {
    return {
      '30-Day': {
        total: actionsByPhase['30-Day'].length,
        completed: actionsByPhase['30-Day'].filter((a) => a.status === 'Completed').length,
        inProgress: actionsByPhase['30-Day'].filter((a) => a.status === 'In Progress').length,
      },
      '60-Day': {
        total: actionsByPhase['60-Day'].length,
        completed: actionsByPhase['60-Day'].filter((a) => a.status === 'Completed').length,
        inProgress: actionsByPhase['60-Day'].filter((a) => a.status === 'In Progress').length,
      },
      '90-Day': {
        total: actionsByPhase['90-Day'].length,
        completed: actionsByPhase['90-Day'].filter((a) => a.status === 'Completed').length,
        inProgress: actionsByPhase['90-Day'].filter((a) => a.status === 'In Progress').length,
      },
    };
  }, [actionsByPhase]);

  const renderPhaseColumn = (
    phase: '30-Day' | '60-Day' | '90-Day',
    dayRange: string
  ) => {
    const phaseActions = actionsByPhase[phase];
    const metrics = phaseMetrics[phase];
    const percentage =
      metrics.total > 0 ? ((metrics.completed / metrics.total) * 100).toFixed(0) : '0';

    return (
      <div
        key={phase}
        className="flex-1 bg-white rounded-lg shadow p-6 min-h-96"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const actionId = e.dataTransfer.getData('actionId');
          if (actionId) {
            onActionMove?.(actionId, phase);
          }
        }}
      >
        {/* Phase Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">{phase}</h3>
            <span className="text-xs text-gray-500 font-medium">{dayRange}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              {metrics.completed}/{metrics.total} Complete
            </span>
            <span className="text-sm font-bold text-gray-900">{percentage}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          {/* Status Breakdown */}
          <div className="flex gap-3 mt-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              Completed: {metrics.completed}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              In Progress: {metrics.inProgress}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {phaseActions.length > 0 ? (
            phaseActions.map((action) => (
              <div
                key={action.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('actionId', action.id)}
              >
                <ActionCard
                  {...action}
                  onStatusChange={(newStatus) => {
                    onActionStatusChange?.(action.id, newStatus);
                  }}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No actions in this phase</p>
              <p className="text-xs mt-1">Drag actions here to add them</p>
            </div>
          )}
        </div>

        {/* Add Action Button */}
        <button className="w-full mt-3 py-2 border-2 border-dashed border-gray-300 rounded text-sm text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-colors font-medium">
          + Add Action
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Timeline Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Implementation Roadmap</h2>
        <p className="text-gray-600 text-sm">
          Drag actions between phases to reorganize. Click actions to update status.
        </p>
      </div>

      {/* Timeline View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderPhaseColumn('30-Day', 'Days 0-30')}
        {renderPhaseColumn('60-Day', 'Days 31-60')}
        {renderPhaseColumn('90-Day', 'Days 61-90')}
      </div>

      {/* Summary Stats */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-3">Overall Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Actions</p>
            <p className="text-2xl font-bold text-gray-900">
              {actions.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {actions.filter((a) => a.status === 'Completed').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">
              {actions.filter((a) => a.status === 'In Progress').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Blocked</p>
            <p className="text-2xl font-bold text-red-600">
              {actions.filter((a) => a.status === 'Blocked').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionTimeline;

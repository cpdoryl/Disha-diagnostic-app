/**
 * Action Plan Dashboard
 * Phase 4: Days 10-11
 *
 * 30-60-90 day action roadmap and implementation tracking
 */

import React, { useMemo, useState } from 'react';
import { RecommendationResult } from 'src/lib/phase4/useRealTimePhase3Data';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  dimension: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  owner: string;
  estimatedHours: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
  startDate?: string;
  dueDate?: string;
  phase: '30-Day' | '60-Day' | '90-Day';
  dependencies?: string[];
}

interface ActionPlanDashboardProps {
  recommendations?: RecommendationResult;
  loading?: boolean;
}

const PRIORITY_CONFIG = {
  URGENT: { color: '#D32F2F', bgColor: '#FFEBEE', label: 'Urgent' },
  HIGH: { color: '#F57C00', bgColor: '#FFF3E0', label: 'High' },
  NORMAL: { color: '#1976D2', bgColor: '#E3F2FD', label: 'Normal' },
};

const STATUS_CONFIG = {
  'Not Started': { color: '#9CA3AF', icon: '⏳' },
  'In Progress': { color: '#2196F3', icon: '⚙️' },
  'Completed': { color: '#4CAF50', icon: '✅' },
  'Blocked': { color: '#F44336', icon: '⛔' },
};

export const ActionPlanDashboard: React.FC<ActionPlanDashboardProps> = ({
  recommendations,
  loading = false,
}) => {
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterOwner, setFilterOwner] = useState<string | null>(null);

  // Generate action items from recommendations
  const allActions = useMemo((): ActionItem[] => {
    if (!recommendations?.recommendations) return [];

    return recommendations.recommendations.flatMap((rec, idx) => [
      {
        id: `action-${idx}-1`,
        title: `Implement: ${rec.recommendation}`,
        description: rec.rationale,
        dimension: rec.dimensionId,
        priority: rec.tier === 1 ? 'URGENT' : rec.tier === 2 ? 'HIGH' : 'NORMAL',
        owner: 'Admin',
        estimatedHours: Math.round(rec.timelineWeeks * 40),
        status: 'Not Started' as const,
        dueDate: new Date(Date.now() + rec.timelineWeeks * 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        phase: rec.timelineWeeks <= 4 ? '30-Day' : rec.timelineWeeks <= 8 ? '60-Day' : '90-Day',
      },
    ]);
  }, [recommendations]);

  // Filter actions
  const filteredActions = useMemo(() => {
    return allActions.filter((action) => {
      if (filterPriority && action.priority !== filterPriority) return false;
      if (filterOwner && action.owner !== filterOwner) return false;
      return true;
    });
  }, [allActions, filterPriority, filterOwner]);

  // Group by phase
  const actionsByPhase = useMemo(() => {
    return {
      '30-Day': filteredActions.filter((a) => a.phase === '30-Day'),
      '60-Day': filteredActions.filter((a) => a.phase === '60-Day'),
      '90-Day': filteredActions.filter((a) => a.phase === '90-Day'),
    };
  }, [filteredActions]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = allActions.length;
    const completed = allActions.filter((a) => a.status === 'Completed').length;
    const inProgress = allActions.filter((a) => a.status === 'In Progress').length;
    const blocked = allActions.filter((a) => a.status === 'Blocked').length;

    return {
      total,
      completed,
      inProgress,
      blocked,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(0) : '0',
    };
  }, [allActions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading action plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Action Plan</h1>
        <p className="text-gray-600 mt-2">30-60-90 Day Implementation Roadmap</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total Actions</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm font-medium">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{metrics.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-medium">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{metrics.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
          <p className="text-gray-600 text-sm font-medium">Blocked</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{metrics.blocked}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Completion Rate</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.completionRate}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${metrics.completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4 flex-wrap items-center">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Priority:</label>
          <select
            className="border border-gray-300 rounded px-3 py-1 text-sm"
            value={filterPriority || ''}
            onChange={(e) => setFilterPriority(e.target.value || null)}
          >
            <option value="">All</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Owner:</label>
          <select
            className="border border-gray-300 rounded px-3 py-1 text-sm"
            value={filterOwner || ''}
            onChange={(e) => setFilterOwner(e.target.value || null)}
          >
            <option value="">All</option>
            <option value="Admin">Admin</option>
            <option value="Teacher">Teacher</option>
            <option value="Principal">Principal</option>
          </select>
        </div>
        <div className="ml-auto text-sm text-gray-600">
          Showing {filteredActions.length} of {allActions.length} actions
        </div>
      </div>

      {/* Timeline Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(actionsByPhase).map(([phase, actions]) => (
          <div key={phase} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{phase}</h3>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {actions.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-1">Progress</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${actions.length > 0 ? ((actions.filter((a) => a.status === 'Completed').length / actions.length) * 100).toFixed(0) : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Action Summary */}
            <div className="space-y-2 text-sm">
              {actions.slice(0, 3).map((action) => (
                <div
                  key={action.id}
                  className="p-2 rounded border-l-4"
                  style={{
                    borderColor: PRIORITY_CONFIG[action.priority].color,
                    backgroundColor: PRIORITY_CONFIG[action.priority].bgColor,
                  }}
                >
                  <p className="font-medium text-gray-900 truncate">{action.title}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-gray-600">
                      {STATUS_CONFIG[action.status].icon} {action.status}
                    </span>
                    <span className="text-xs text-gray-600">• {action.estimatedHours}h</span>
                  </div>
                </div>
              ))}
              {actions.length > 3 && (
                <p className="text-xs text-gray-500 text-center py-2">
                  +{actions.length - 3} more actions
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Actions</h2>
        {filteredActions.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredActions.map((action) => (
              <div
                key={action.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                style={{
                  borderLeft: `4px solid ${PRIORITY_CONFIG[action.priority].color}`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      <span>📌 {action.dimension}</span>
                      <span>⏱️ {action.estimatedHours}h</span>
                      <span>👤 {action.owner}</span>
                      {action.dueDate && <span>📅 Due: {action.dueDate}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <span
                      className="px-3 py-1 rounded text-xs font-semibold text-white whitespace-nowrap"
                      style={{ backgroundColor: PRIORITY_CONFIG[action.priority].color }}
                    >
                      {PRIORITY_CONFIG[action.priority].label}
                    </span>
                    <span
                      className="px-3 py-1 rounded text-xs font-semibold text-white whitespace-nowrap"
                      style={{ backgroundColor: STATUS_CONFIG[action.status].color }}
                    >
                      {STATUS_CONFIG[action.status].icon} {action.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No actions match the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionPlanDashboard;

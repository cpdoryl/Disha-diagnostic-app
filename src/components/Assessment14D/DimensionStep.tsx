/**
 * 14-Dimension Assessment Wizard — Dimension Step
 * Orchestrates metric collection for a single dimension (1-14)
 * Phase 2: Frontend Assessment Wizard
 */

import React, { useMemo, useEffect, useState } from 'react';
import { useAssessmentWizard } from '@/lib/14d/assessmentWizardState';
import { getDimensionById, getMetricsForDimension } from '@/lib/14d/dimensionMetadata';
import { MetricCard } from './MetricCard';
import { PerceptionScale } from './PerceptionScale';
import { RootCauseInput } from './RootCauseInput';
import type { Metric } from '@/lib/14d/types14D';

interface DimensionStepProps {
  dimensionId: number; // 1-14
}

interface MetricState {
  metricId: string;
  realityValue?: number | string;
  perceptionValue?: number;
  followUpResponse?: string;
  isComplete: boolean;
}

export const DimensionStep: React.FC<DimensionStepProps> = ({ dimensionId }) => {
  const wizard = useAssessmentWizard();
  const [metricStates, setMetricStates] = useState<Record<string, MetricState>>({});
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  const dimension = useMemo(() => getDimensionById(dimensionId), [dimensionId]);
  const metrics = useMemo(() => getMetricsForDimension(dimensionId), [dimensionId]);

  // Initialize metric states from existing responses
  useEffect(() => {
    const states: Record<string, MetricState> = {};
    metrics.forEach(metric => {
      const existing = wizard.responses.get(metric.id);
      states[metric.id] = {
        metricId: metric.id,
        realityValue: existing?.metricValue,
        perceptionValue:
          existing?.metricType === 'perception'
            ? (existing.metricValue as number)
            : undefined,
        followUpResponse: existing?.followUpResponse,
        isComplete:
          existing?.metricType === 'perception' && existing.followUpResponse
            ? true
            : false,
      };
    });
    setMetricStates(states);
  }, [dimensionId, metrics, wizard.responses]);

  // Trigger auto-save on metric change
  const triggerAutoSave = () => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    wizard.setAutoSaveStatus('saving');

    const timer = setTimeout(() => {
      saveMetricBatch();
    }, 10000); // Save after 10 seconds idle

    setAutoSaveTimer(timer);
  };

  const saveMetricBatch = async () => {
    try {
      wizard.setAutoSaveStatus('saving');

      // Collect all completed metrics for this dimension
      const completedMetrics = Object.values(metricStates).filter(
        state => state.isComplete && state.realityValue !== undefined && state.perceptionValue
      );

      if (completedMetrics.length === 0) {
        wizard.setAutoSaveStatus('idle');
        return;
      }

      // Update wizard state with all responses
      completedMetrics.forEach(state => {
        wizard.setMetricResponse(
          state.metricId,
          dimensionId,
          state.realityValue!,
          'reality'
        );

        wizard.setMetricResponse(
          state.metricId,
          dimensionId,
          state.perceptionValue!,
          'perception',
          state.followUpResponse
        );
      });

      wizard.setSaved();
      console.log(`✅ Auto-saved ${completedMetrics.length} metrics for dimension ${dimensionId}`);
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
      wizard.setAutoSaveStatus('error', error instanceof Error ? error.message : 'Save failed');
    }
  };

  const handleRealityChange = (metricId: string, value: number | string) => {
    setMetricStates(prev => ({
      ...prev,
      [metricId]: { ...prev[metricId], realityValue: value },
    }));
    triggerAutoSave();
  };

  const handlePerceptionChange = (metricId: string, value: number) => {
    setMetricStates(prev => ({
      ...prev,
      [metricId]: { ...prev[metricId], perceptionValue: value },
    }));
    triggerAutoSave();
  };

  const handleFollowUpChange = (metricId: string, value: string) => {
    setMetricStates(prev => ({
      ...prev,
      [metricId]: {
        ...prev[metricId],
        followUpResponse: value,
        isComplete: value.length > 0 && prev[metricId].perceptionValue !== undefined,
      },
    }));
    triggerAutoSave();
  };

  const completedCount = Object.values(metricStates).filter(s => s.isComplete).length;
  const totalCount = metrics.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);
  const allComplete = completedCount === totalCount;

  // Auto-mark dimension complete
  useEffect(() => {
    if (allComplete && completedCount > 0) {
      wizard.markDimensionComplete(dimensionId);
    }
  }, [allComplete, completedCount, dimensionId, wizard]);

  if (!dimension) {
    return (
      <div className="dimension-step error">
        <p>❌ Dimension {dimensionId} not found</p>
      </div>
    );
  }

  return (
    <div className="dimension-step">
      <div className="dimension-header">
        <div className="header-content">
          <h2 className="dimension-title">
            Dimension {dimensionId}: {dimension.name}
          </h2>
          <p className="dimension-description">{dimension.description}</p>
        </div>

        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionPercentage}%` }} />
          </div>
          <div className="progress-text">
            {completedCount} of {totalCount} metrics complete
          </div>
        </div>
      </div>

      <div className="metrics-container">
        {metrics.map(metric => (
          <div key={metric.id} className="metric-section">
            <div className="metric-group">
              <MetricCard
                metric={metric}
                dimensionId={dimensionId}
                stakeholderType={wizard.selectedStakeholder || undefined}
                value={metricStates[metric.id]?.realityValue}
                onChange={value => handleRealityChange(metric.id, value)}
                disabled={false}
              />
            </div>

            <div className="perception-group">
              <PerceptionScale
                metric={metric}
                value={metricStates[metric.id]?.perceptionValue}
                onChange={value => handlePerceptionChange(metric.id, value)}
                disabled={!metricStates[metric.id]?.realityValue}
                showLabel={true}
              />
            </div>

            <div className="followup-group">
              {metricStates[metric.id]?.perceptionValue && (
                <RootCauseInput
                  metric={metric}
                  perceptionValue={metricStates[metric.id]?.perceptionValue || 5}
                  value={metricStates[metric.id]?.followUpResponse}
                  onChange={value => handleFollowUpChange(metric.id, value)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="auto-save-indicator">
        {wizard.autoSaveStatus === 'saving' && (
          <span className="status saving">💾 Saving...</span>
        )}
        {wizard.autoSaveStatus === 'saved' && (
          <span className="status saved">✅ Saved</span>
        )}
        {wizard.autoSaveStatus === 'error' && (
          <span className="status error">⚠️ {wizard.lastErrorMessage || 'Save failed'}</span>
        )}
        {wizard.autoSaveStatus === 'idle' && completedCount > 0 && (
          <span className="status idle">Saving on idle...</span>
        )}
      </div>

      <div className="wizard-footer">
        <button
          className="btn-secondary"
          onClick={() => wizard.previousStep()}
          disabled={wizard.currentStep === 0}
        >
          ← Previous Dimension
        </button>

        <button
          className="btn-primary"
          onClick={() => wizard.nextStep()}
          disabled={!allComplete}
          title={!allComplete ? `Complete all ${totalCount} metrics to continue` : ''}
        >
          Next Dimension →
        </button>
      </div>

      <style>{`
        .dimension-step {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 24px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .dimension-step.error {
          padding: 40px;
          text-align: center;
          color: var(--status-error);
        }

        .dimension-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .header-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dimension-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }

        .dimension-description {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        .progress-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-bar {
          height: 6px;
          background: var(--bg-primary);
          border-radius: 3px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          transition: width 0.3s ease;
          border-radius: 3px;
        }

        .progress-text {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .metrics-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .metric-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .metric-group {
          display: flex;
          flex-direction: column;
        }

        .perception-group {
          display: flex;
          flex-direction: column;
        }

        .followup-group {
          display: flex;
          flex-direction: column;
        }

        .auto-save-indicator {
          display: flex;
          justify-content: center;
          min-height: 24px;
        }

        .status {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .status.saving {
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
        }

        .status.saved {
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .status.error {
          color: #dc2626;
          background: rgba(220, 38, 38, 0.1);
        }

        .status.idle {
          color: var(--text-tertiary);
          background: transparent;
        }

        .wizard-footer {
          display: flex;
          gap: 12px;
          justify-content: space-between;
          padding: 20px;
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .btn-secondary,
        .btn-primary {
          padding: 10px 24px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          font-family: inherit;
        }

        .btn-secondary {
          background: var(--bg-primary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--bg-tertiary);
          border-color: var(--text-secondary);
        }

        .btn-primary {
          background: var(--brand-primary);
          color: white;
          flex: 1;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--brand-dark);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Theme-aware colors */
        :root {
          --text-primary: #1f2937;
          --text-secondary: #6b7280;
          --text-tertiary: #9ca3af;
          --bg-primary: #ffffff;
          --bg-secondary: #f9fafb;
          --bg-tertiary: #f3f4f6;
          --border-color: #e5e7eb;
          --brand-primary: #3b82f6;
          --brand-dark: #1e40af;
          --status-error: #dc2626;
        }

        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) {
            --text-primary: #f9fafb;
            --text-secondary: #d1d5db;
            --text-tertiary: #9ca3af;
            --bg-primary: #111827;
            --bg-secondary: #1f2937;
            --bg-tertiary: #374151;
            --border-color: #4b5563;
            --brand-primary: #60a5fa;
            --brand-dark: #3b82f6;
          }
        }

        :root[data-theme="dark"] {
          --text-primary: #f9fafb;
          --text-secondary: #d1d5db;
          --text-tertiary: #9ca3af;
          --bg-primary: #111827;
          --bg-secondary: #1f2937;
          --bg-tertiary: #374151;
          --border-color: #4b5563;
          --brand-primary: #60a5fa;
          --brand-dark: #3b82f6;
        }

        @media (max-width: 640px) {
          .dimension-step {
            padding: 16px;
            gap: 20px;
          }

          .dimension-title {
            font-size: 20px;
          }

          .dimension-header {
            padding: 16px;
          }

          .metric-section {
            padding: 16px;
            gap: 12px;
          }

          .wizard-footer {
            flex-direction: column-reverse;
            gap: 8px;
          }

          .btn-secondary,
          .btn-primary {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

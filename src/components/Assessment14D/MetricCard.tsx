/**
 * 14-Dimension Assessment Wizard — Metric Card
 * Displays a single reality metric question with appropriate input
 * Phase 2: Frontend Assessment Wizard
 */

import React, { useMemo } from 'react';
import type { Metric, StakeholderType } from '@/lib/14d/types14D';

interface MetricCardProps {
  metric: Metric;
  dimensionId: number;
  stakeholderType?: StakeholderType;
  value?: number | string;
  onChange: (value: number | string) => void;
  error?: string;
  disabled?: boolean;
}

const DIMENSION_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#14b8a6', // teal
  '#0ea5e9', // cyan
  '#6366f1', // indigo
  '#d946ef', // fuchsia
  '#f97316', // orange
  '#06b6d4', // cyan-alt
  '#a855f7', // violet
  '#22c55e', // lime
  '#ef4444', // red
];

const getDimensionColor = (dimensionId: number): string => {
  return DIMENSION_COLORS[(dimensionId - 1) % DIMENSION_COLORS.length];
};

const renderInput = (
  metric: Metric,
  value: number | string | undefined,
  onChange: (v: number | string) => void,
  disabled: boolean,
  error?: string
) => {
  const baseInputProps = {
    value: value || '',
    onChange: (e: React.ChangeEvent<any>) => onChange(e.target.value),
    disabled,
    className: `metric-input ${error ? 'error' : ''}`,
  };

  const metricType = metric.dataType || 'number';

  switch (metricType) {
    case 'percentage':
      return (
        <div className="input-group number-group">
          <input
            type="number"
            min="0"
            max="100"
            placeholder="0-100"
            {...baseInputProps}
            onChange={(e) => {
              const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
              onChange(val);
            }}
          />
          <span className="input-suffix">%</span>
        </div>
      );

    case 'count':
      return (
        <div className="input-group number-group">
          <input
            type="number"
            min="0"
            placeholder="Enter count"
            {...baseInputProps}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          />
        </div>
      );

    case 'ratio':
      return (
        <div className="input-group number-group">
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter ratio"
            {...baseInputProps}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          />
        </div>
      );

    case 'enum':
      return (
        <div className="input-group select-group">
          <select {...baseInputProps}>
            <option value="">Select an option</option>
            {metric.options?.map(opt => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    case 'date':
      return (
        <div className="input-group date-group">
          <input
            type="date"
            {...baseInputProps}
          />
        </div>
      );

    case 'text':
    default:
      return (
        <div className="input-group text-group">
          <input
            type="text"
            placeholder="Enter value"
            {...baseInputProps}
          />
        </div>
      );
  }
};

export const MetricCard: React.FC<MetricCardProps> = ({
  metric,
  dimensionId,
  stakeholderType,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const dimensionColor = useMemo(() => getDimensionColor(dimensionId), [dimensionId]);

  const getApplicableStakeholders = (): string[] => {
    if (!metric.applicableStakeholders || metric.applicableStakeholders.length === 0) {
      return ['All'];
    }
    return metric.applicableStakeholders;
  };

  const applicableStakeholders = useMemo(() => getApplicableStakeholders(), [metric.applicableStakeholders]);

  return (
    <div className="metric-card" style={{ borderLeftColor: dimensionColor }}>
      <div className="metric-header">
        <div className="metric-id-label">
          <span className="metric-id" style={{ backgroundColor: dimensionColor }}>
            {metric.id}
          </span>
          <span className="metric-label">{metric.label}</span>
        </div>
      </div>

      <div className="metric-body">
        <p className="metric-question">{metric.question}</p>

        {metric.helpText && (
          <details className="metric-help">
            <summary>ℹ️ Data source & formula</summary>
            <div className="help-content">
              <p>{metric.helpText}</p>
              {metric.fallbackProcedure && (
                <p className="fallback-note">
                  <strong>Fallback:</strong> {metric.fallbackProcedure}
                </p>
              )}
            </div>
          </details>
        )}

        <div className="input-container">
          {renderInput(metric, value, onChange, disabled, error)}
          {error && <div className="field-error">{error}</div>}
        </div>

        {applicableStakeholders.length > 0 && applicableStakeholders[0] !== 'All' && (
          <div className="stakeholder-note">
            <span className="note-label">Respondent types:</span>
            <span className="note-value">{applicableStakeholders.join(', ')}</span>
          </div>
        )}
      </div>

      <style>{`
        .metric-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 8px;
          border: 1px solid var(--border-color);
          border-left: 4px solid;
          transition: all 0.2s ease;
        }

        .metric-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .metric-id-label {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .metric-id {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          color: white;
          font-size: 12px;
          font-weight: 700;
        }

        .metric-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .metric-question {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.5;
        }

        .metric-help {
          font-size: 13px;
          color: var(--text-tertiary);
          cursor: pointer;
        }

        .metric-help summary {
          user-select: none;
          padding: 6px 0;
          font-weight: 500;
        }

        .metric-help summary:hover {
          color: var(--text-secondary);
        }

        .help-content {
          margin-top: 8px;
          padding: 12px;
          background: var(--bg-primary);
          border-radius: 6px;
          border-left: 3px solid var(--brand-primary);
        }

        .help-content p {
          margin: 0 0 8px 0;
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .help-content p:last-child {
          margin-bottom: 0;
        }

        .fallback-note {
          color: var(--text-tertiary) !important;
          font-style: italic;
          font-size: 12px !important;
        }

        .input-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group {
          display: flex;
          align-items: center;
          gap: 0;
          position: relative;
        }

        .number-group input,
        .text-group input,
        .date-group input,
        .select-group select {
          padding: 10px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          background: var(--bg-primary);
          color: var(--text-primary);
          flex: 1;
          transition: border-color 0.2s ease;
        }

        .number-group input:focus,
        .text-group input:focus,
        .date-group input:focus,
        .select-group select:focus {
          outline: none;
          border-color: var(--brand-primary);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .number-group input.error,
        .text-group input.error,
        .date-group input.error,
        .select-group select.error {
          border-color: #dc2626;
        }

        .number-group input:disabled,
        .text-group input:disabled,
        .date-group input:disabled,
        .select-group select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: var(--bg-secondary);
        }

        .input-suffix {
          position: absolute;
          right: 12px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          pointer-events: none;
        }

        .field-error {
          font-size: 12px;
          color: #dc2626;
          padding: 4px 0;
        }

        .stakeholder-note {
          display: flex;
          gap: 8px;
          font-size: 12px;
          padding: 8px;
          background: var(--bg-primary);
          border-radius: 4px;
          border-left: 2px solid var(--text-tertiary);
        }

        .note-label {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .note-value {
          color: var(--text-tertiary);
        }

        /* Theme-aware colors */
        :root {
          --text-primary: #1f2937;
          --text-secondary: #6b7280;
          --text-tertiary: #9ca3af;
          --bg-primary: #ffffff;
          --bg-secondary: #f9fafb;
          --border-color: #e5e7eb;
          --brand-primary: #3b82f6;
        }

        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) {
            --text-primary: #f9fafb;
            --text-secondary: #d1d5db;
            --text-tertiary: #9ca3af;
            --bg-primary: #111827;
            --bg-secondary: #1f2937;
            --border-color: #4b5563;
            --brand-primary: #60a5fa;
          }
        }

        :root[data-theme="dark"] {
          --text-primary: #f9fafb;
          --text-secondary: #d1d5db;
          --text-tertiary: #9ca3af;
          --bg-primary: #111827;
          --bg-secondary: #1f2937;
          --border-color: #4b5563;
          --brand-primary: #60a5fa;
        }

        @media (max-width: 640px) {
          .metric-card {
            padding: 12px;
            gap: 10px;
          }

          .metric-id {
            width: 28px;
            height: 28px;
            font-size: 11px;
          }

          .metric-question {
            font-size: 14px;
          }

          .number-group input,
          .text-group input,
          .date-group input,
          .select-group select {
            font-size: 16px; /* Prevents iOS zoom */
          }
        }
      `}</style>
    </div>
  );
};

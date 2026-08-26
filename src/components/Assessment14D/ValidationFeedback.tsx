/**
 * 14-Dimension Assessment Wizard — Validation Feedback
 * Inline error messages and completion indicators
 * Phase 2: Frontend Assessment Wizard
 */

import React from 'react';

export interface ValidationError {
  fieldId: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

interface ValidationFeedbackProps {
  errors?: ValidationError[];
  isComplete?: boolean;
  showCompletionMessage?: boolean;
  customMessage?: string;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  errors = [],
  isComplete = false,
  showCompletionMessage = true,
  customMessage,
}) => {
  if (errors.length === 0 && !isComplete && !customMessage) {
    return null;
  }

  return (
    <div className="validation-feedback">
      {/* Completion Indicator */}
      {isComplete && showCompletionMessage && (
        <div className="feedback-item success">
          <span className="feedback-icon">✅</span>
          <div className="feedback-content">
            <p className="feedback-title">All metrics complete</p>
            <p className="feedback-description">Ready to move to the next dimension</p>
          </div>
        </div>
      )}

      {/* Custom Message */}
      {customMessage && (
        <div className="feedback-item info">
          <span className="feedback-icon">ℹ️</span>
          <p className="feedback-message">{customMessage}</p>
        </div>
      )}

      {/* Errors */}
      {errors.map(error => (
        <div key={error.fieldId} className={`feedback-item ${error.type}`}>
          <span className="feedback-icon">
            {error.type === 'error' && '❌'}
            {error.type === 'warning' && '⚠️'}
            {error.type === 'info' && 'ℹ️'}
          </span>
          <div className="feedback-content">
            <p className="feedback-message">{error.message}</p>
          </div>
        </div>
      ))}

      <style>{`
        .validation-feedback {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 8px;
          border-left: 4px solid;
        }

        .feedback-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px;
          border-radius: 6px;
          background: var(--bg-primary);
          border-left: 3px solid;
        }

        .feedback-item.error {
          background: rgba(220, 38, 38, 0.08);
          border-left-color: #dc2626;
        }

        .validation-feedback.error {
          border-left-color: #dc2626;
          background: rgba(220, 38, 38, 0.04);
        }

        .feedback-item.warning {
          background: rgba(245, 158, 11, 0.08);
          border-left-color: #f59e0b;
        }

        .validation-feedback.warning {
          border-left-color: #f59e0b;
          background: rgba(245, 158, 11, 0.04);
        }

        .feedback-item.info {
          background: rgba(59, 130, 246, 0.08);
          border-left-color: #3b82f6;
        }

        .validation-feedback.info {
          border-left-color: #3b82f6;
          background: rgba(59, 130, 246, 0.04);
        }

        .feedback-item.success {
          background: rgba(16, 185, 129, 0.08);
          border-left-color: #10b981;
        }

        .validation-feedback.success {
          border-left-color: #10b981;
          background: rgba(16, 185, 129, 0.04);
        }

        .feedback-icon {
          font-size: 18px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .feedback-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .feedback-title {
          font-size: 13px;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }

        .feedback-description {
          font-size: 12px;
          margin: 0;
          color: var(--text-secondary);
        }

        .feedback-message {
          font-size: 13px;
          margin: 0;
          line-height: 1.4;
          color: var(--text-primary);
        }

        .feedback-item.error .feedback-message,
        .feedback-item.error .feedback-title {
          color: #dc2626;
        }

        .feedback-item.warning .feedback-message,
        .feedback-item.warning .feedback-title {
          color: #d97706;
        }

        .feedback-item.info .feedback-message,
        .feedback-item.info .feedback-title {
          color: #3b82f6;
        }

        .feedback-item.success .feedback-message,
        .feedback-item.success .feedback-title {
          color: #10b981;
        }

        /* Theme-aware colors */
        :root {
          --text-primary: #1f2937;
          --text-secondary: #6b7280;
          --bg-primary: #ffffff;
          --bg-secondary: #f9fafb;
        }

        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) {
            --text-primary: #f9fafb;
            --text-secondary: #d1d5db;
            --bg-primary: #111827;
            --bg-secondary: #1f2937;
          }
        }

        :root[data-theme="dark"] {
          --text-primary: #f9fafb;
          --text-secondary: #d1d5db;
          --bg-primary: #111827;
          --bg-secondary: #1f2937;
        }

        @media (max-width: 640px) {
          .validation-feedback {
            padding: 12px;
            gap: 10px;
          }

          .feedback-item {
            padding: 10px;
            gap: 10px;
          }

          .feedback-icon {
            font-size: 16px;
          }

          .feedback-message {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Helper hook to validate dimension step completion
 */
export function useValidationFeedback(
  metrics: { id: string }[],
  metricStates: Record<string, { isComplete: boolean }>
) {
  const incompleteMetrics = metrics.filter(m => !metricStates[m.id]?.isComplete);

  return {
    errors: incompleteMetrics.map(m => ({
      fieldId: m.id,
      message: `Metric ${m.id} requires both reality and perception responses`,
      type: 'error' as const,
    })),
    isComplete: incompleteMetrics.length === 0,
    message:
      incompleteMetrics.length > 0
        ? `${incompleteMetrics.length} metrics incomplete`
        : 'All metrics complete',
  };
}

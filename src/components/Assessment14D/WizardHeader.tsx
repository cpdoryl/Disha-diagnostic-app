/**
 * 14-Dimension Assessment Wizard — Header Component
 * Displays progress bar, step counter, and title
 * Phase 2: Frontend Assessment Wizard
 */

import React, { useMemo } from 'react';
import { useAssessmentWizard } from '@/lib/14d/assessmentWizardState';

interface WizardHeaderProps {
  showBreadcrumb?: boolean;
  showCancel?: boolean;
  onCancel?: () => void;
}

const STEP_LABELS = [
  'Select Role',
  'Dimension 1',
  'Dimension 2',
  'Dimension 3',
  'Dimension 4',
  'Dimension 5',
  'Dimension 6',
  'Dimension 7',
  'Dimension 8',
  'Dimension 9',
  'Dimension 10',
  'Dimension 11',
  'Dimension 12',
  'Dimension 13',
  'Dimension 14',
  'Review & Submit',
];

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  showBreadcrumb = false,
  showCancel = true,
  onCancel,
}) => {
  const wizard = useAssessmentWizard();

  const stepLabel = useMemo(() => {
    return STEP_LABELS[wizard.currentStep] || 'Assessment';
  }, [wizard.currentStep]);

  const progressPercentage = useMemo(() => {
    return Math.round((wizard.currentStep / wizard.totalSteps) * 100);
  }, [wizard.currentStep, wizard.totalSteps]);

  const isFirstStep = wizard.currentStep === 0;
  const isLastStep = wizard.currentStep === wizard.totalSteps;

  return (
    <div className="wizard-header">
      <div className="header-top">
        <div className="header-left">
          <h1 className="wizard-title">14-Dimension School Assessment</h1>
          <p className="current-step">{stepLabel}</p>
        </div>

        {showCancel && (
          <button className="btn-close" onClick={onCancel} aria-label="Cancel assessment">
            ✕
          </button>
        )}
      </div>

      <div className="progress-section">
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progressPercentage}%`,
              }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <div className="progress-info">
          <span className="progress-text">
            Step {wizard.currentStep + 1} of {wizard.totalSteps + 1}
          </span>
          <span className="progress-percentage">{progressPercentage}%</span>
        </div>
      </div>

      {showBreadcrumb && (
        <div className="breadcrumb">
          {STEP_LABELS.slice(0, Math.min(5, wizard.totalSteps + 1)).map((label, idx) => (
            <React.Fragment key={idx}>
              <span
                className={`breadcrumb-item ${idx === wizard.currentStep ? 'active' : ''} ${
                  idx < wizard.currentStep ? 'completed' : ''
                }`}
              >
                {idx < wizard.currentStep ? '✓' : idx === wizard.currentStep ? '●' : `${idx + 1}`}
              </span>
              {idx < Math.min(4, wizard.totalSteps) && <span className="breadcrumb-divider">/</span>}
            </React.Fragment>
          ))}
          {wizard.totalSteps > 4 && <span className="breadcrumb-more">...</span>}
        </div>
      )}

      <style>{`
        .wizard-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .wizard-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }

        .current-step {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          margin: 0;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 24px;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .btn-close:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .progress-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-bar-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-bar {
          flex: 1;
          height: 4px;
          background: var(--bg-secondary);
          border-radius: 2px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          font-weight: 600;
        }

        .progress-text {
          color: var(--text-secondary);
        }

        .progress-percentage {
          color: var(--brand-primary);
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .breadcrumb-item {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--bg-secondary);
          color: var(--text-tertiary);
          transition: all 0.2s ease;
        }

        .breadcrumb-item.active {
          background: var(--brand-primary);
          color: white;
          box-shadow: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--brand-primary);
        }

        .breadcrumb-item.completed {
          background: #10b981;
          color: white;
        }

        .breadcrumb-divider {
          color: var(--border-color);
          margin: 0 2px;
        }

        .breadcrumb-more {
          color: var(--text-tertiary);
          margin: 0 2px;
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
          .wizard-header {
            padding: 16px;
            gap: 12px;
          }

          .wizard-title {
            font-size: 16px;
          }

          .breadcrumb {
            display: none;
          }

          .progress-info {
            font-size: 11px;
          }

          .btn-close {
            width: 28px;
            height: 28px;
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

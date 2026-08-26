/**
 * 14-Dimension Assessment Wizard — Main Orchestrator
 * Coordinates all steps, navigation, and submission
 * Phase 2: Frontend Assessment Wizard
 */

import React, { useEffect, useState } from 'react';
import { useAssessmentWizard } from '@/lib/14d/assessmentWizardState';
import { responseService } from '@/lib/14d/responseService14D';
import { WizardHeader } from './WizardHeader';
import { StakeholderSelector } from './StakeholderSelector';
import { DimensionStep } from './DimensionStep';
import { ReviewSubmit } from './ReviewSubmit';

interface AssessmentWizardProps {
  schoolId: string;
  assessmentId: string;
  onSubmitComplete?: (sessionId: string) => void;
  onCancel?: () => void;
  autoSaveIntervalMs?: number;
}

export const AssessmentWizard: React.FC<AssessmentWizardProps> = ({
  schoolId,
  assessmentId,
  onSubmitComplete,
  onCancel,
  autoSaveIntervalMs = 10000,
}) => {
  const wizard = useAssessmentWizard();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Initialize assessment on mount
  useEffect(() => {
    const initAssessment = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        // Set assessment IDs
        wizard.goToStep(0);

        // Update wizard state with assessment context
        // (In a real scenario, would load assessment config from Firestore here)

        console.log(`✅ Assessment initialized: ${schoolId}/${assessmentId}`);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Assessment initialization failed:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to load assessment');
        setIsLoading(false);
      }
    };

    initAssessment();
  }, [schoolId, assessmentId, wizard]);

  // Save draft on beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (wizard.isDirty && wizard.totalResponses > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [wizard.isDirty, wizard.totalResponses]);

  const handleStepCancel = () => {
    if (window.confirm('Are you sure? Any unsaved changes will be lost.')) {
      if (onCancel) {
        onCancel();
      } else {
        window.history.back();
      }
    }
  };

  const handleSubmitComplete = async (sessionId: string) => {
    try {
      // Trigger final submission
      await responseService.submitAssessment(schoolId, assessmentId);
      console.log(`✅ Assessment submitted: ${sessionId}`);

      if (onSubmitComplete) {
        onSubmitComplete(sessionId);
      }
    } catch (error) {
      console.error('❌ Submission failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="wizard-loading">
        <div className="loading-spinner"></div>
        <p>Loading assessment...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="wizard-error">
        <h2>❌ Error Loading Assessment</h2>
        <p>{loadError}</p>
        <button onClick={() => window.history.back()}>← Go Back</button>
      </div>
    );
  }

  return (
    <div className="assessment-wizard">
      <WizardHeader showCancel showBreadcrumb onCancel={handleStepCancel} />

      <div className="wizard-content">
        {/* Step 0: Stakeholder Selection */}
        {wizard.currentStep === 0 && <StakeholderSelector />}

        {/* Steps 1-14: Dimension Steps */}
        {wizard.currentStep >= 1 && wizard.currentStep <= 14 && (
          <DimensionStep dimensionId={wizard.currentStep} />
        )}

        {/* Step 15: Review & Submit */}
        {wizard.currentStep === 15 && (
          <ReviewSubmit
            schoolId={schoolId}
            assessmentId={assessmentId}
            onSubmitComplete={handleSubmitComplete}
          />
        )}
      </div>

      <style>{`
        .assessment-wizard {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--bg-primary);
        }

        .wizard-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .wizard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 16px;
          background: var(--bg-primary);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--bg-secondary);
          border-top-color: var(--brand-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .wizard-loading p {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .wizard-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 16px;
          padding: 40px 20px;
          text-align: center;
          background: var(--bg-primary);
        }

        .wizard-error h2 {
          color: var(--status-error);
          margin: 0;
        }

        .wizard-error p {
          color: var(--text-secondary);
          margin: 0;
          max-width: 400px;
        }

        .wizard-error button {
          padding: 10px 20px;
          background: var(--brand-primary);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        .wizard-error button:hover {
          background: var(--brand-dark);
        }

        /* Theme-aware colors */
        :root {
          --text-primary: #1f2937;
          --text-secondary: #6b7280;
          --bg-primary: #ffffff;
          --bg-secondary: #f9fafb;
          --brand-primary: #3b82f6;
          --brand-dark: #1e40af;
          --status-error: #dc2626;
        }

        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) {
            --text-primary: #f9fafb;
            --text-secondary: #d1d5db;
            --bg-primary: #111827;
            --bg-secondary: #1f2937;
            --brand-primary: #60a5fa;
            --brand-dark: #3b82f6;
          }
        }

        :root[data-theme="dark"] {
          --text-primary: #f9fafb;
          --text-secondary: #d1d5db;
          --bg-primary: #111827;
          --bg-secondary: #1f2937;
          --brand-primary: #60a5fa;
          --brand-dark: #3b82f6;
        }
      `}</style>
    </div>
  );
};

/**
 * 14-Dimension Assessment Wizard — Review & Submit
 * Final step: Review responses and submit assessment
 * Phase 2: Frontend Assessment Wizard
 */

import React, { useState } from 'react';
import { useAssessmentWizard, useWizardResponses } from '@/lib/14d/assessmentWizardState';
import { getDimensionById } from '@/lib/14d/dimensionMetadata';

interface ReviewSubmitProps {
  schoolId: string;
  assessmentId: string;
  onSubmitComplete?: (sessionId: string) => void;
}

export const ReviewSubmit: React.FC<ReviewSubmitProps> = ({
  schoolId,
  assessmentId,
  onSubmitComplete,
}) => {
  const wizard = useAssessmentWizard();
  const { responses, totalResponses } = useWizardResponses();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewDetails, setShowReviewDetails] = useState(false);
  const [submitConfirmed, setSubmitConfirmed] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const completionPercentage = Math.round((totalResponses / 28) * 100); // 28 = 14 dimensions * 2 (reality + perception)
  const isComplete = wizard.completedDimensions.size === 14;

  const handleSaveAndExit = () => {
    if (window.confirm('Save your progress and exit? You can resume later.')) {
      window.history.back();
    }
  };

  const handleSubmit = async () => {
    if (!submitConfirmed) {
      setSubmitConfirmed(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Call the completion callback
      if (onSubmitComplete) {
        onSubmitComplete(wizard.sessionId);
      }

      // Show success page
      setSubmitSuccess(true);
      console.log(`✅ Assessment submitted successfully: ${wizard.sessionId}`);

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        window.location.href = '/assessments';
      }, 3000);
    } catch (error) {
      setIsSubmitting(false);
      setSubmitError(error instanceof Error ? error.message : 'Submission failed');
      console.error('❌ Submission error:', error);
    }
  };

  // Success page
  if (submitSuccess) {
    return (
      <div className="review-submit">
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h2>Assessment Submitted Successfully</h2>
          <p className="success-message">Thank you for completing the 14-Dimension School Assessment.</p>

          <div className="success-details">
            <p>
              <strong>Session ID:</strong> {wizard.sessionId}
            </p>
            <p>
              <strong>Responses Submitted:</strong> {totalResponses}
            </p>
            <p>
              <strong>Stakeholder:</strong> {wizard.selectedStakeholder || 'Anonymous'}
            </p>
          </div>

          <p className="redirect-message">Redirecting in 3 seconds...</p>

          <button className="btn-primary" onClick={() => (window.location.href = '/assessments')}>
            Go to Dashboard
          </button>
        </div>

        <style>{`
          .review-submit {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 40px 20px;
            background: var(--bg-primary);
          }

          .success-container {
            text-align: center;
            max-width: 500px;
          }

          .success-icon {
            font-size: 80px;
            margin-bottom: 20px;
            animation: bounce 0.6s ease-in-out;
          }

          @keyframes bounce {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }

          .success-container h2 {
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 12px 0;
            color: var(--text-primary);
          }

          .success-message {
            font-size: 16px;
            color: var(--text-secondary);
            margin: 0 0 24px 0;
          }

          .success-details {
            background: var(--bg-secondary);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
            text-align: left;
          }

          .success-details p {
            font-size: 13px;
            margin: 8px 0;
            color: var(--text-secondary);
          }

          .success-details strong {
            color: var(--text-primary);
          }

          .redirect-message {
            font-size: 12px;
            color: var(--text-tertiary);
            margin: 16px 0;
          }

          .btn-primary {
            padding: 12px 24px;
            background: var(--brand-primary);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .btn-primary:hover {
            background: var(--brand-dark);
          }

          :root {
            --text-primary: #1f2937;
            --text-secondary: #6b7280;
            --text-tertiary: #9ca3af;
            --bg-primary: #ffffff;
            --bg-secondary: #f9fafb;
            --brand-primary: #3b82f6;
            --brand-dark: #1e40af;
          }

          @media (prefers-color-scheme: dark) {
            :root:not([data-theme="light"]) {
              --text-primary: #f9fafb;
              --text-secondary: #d1d5db;
              --text-tertiary: #9ca3af;
              --bg-primary: #111827;
              --bg-secondary: #1f2937;
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
            --brand-primary: #60a5fa;
            --brand-dark: #3b82f6;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="review-submit">
      <div className="review-container">
        <div className="review-header">
          <h2>Review & Submit Assessment</h2>
          <p>Please review your responses before submitting</p>
        </div>

        {/* Progress Summary */}
        <div className="progress-summary">
          <div className="summary-section">
            <div className="summary-label">Overall Progress</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${completionPercentage}%` }} />
            </div>
            <div className="progress-text">
              {totalResponses} of 28 responses ({completionPercentage}%)
            </div>
          </div>

          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Dimensions Completed</span>
              <span className="stat-value">{wizard.completedDimensions.size}/14</span>
            </div>
            <div className="stat">
              <span className="stat-label">Respondent Type</span>
              <span className="stat-value">
                {wizard.selectedStakeholder ? wizard.selectedStakeholder.charAt(0).toUpperCase() + wizard.selectedStakeholder.slice(1) : 'Anonymous'}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Session ID</span>
              <span className="stat-value" style={{ fontSize: '11px' }}>
                {wizard.sessionId.substring(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        {/* Respondent Info */}
        <div className="respondent-info">
          <h3>Your Information</h3>
          <div className="info-grid">
            <div className="info-row">
              <span className="info-label">Type:</span>
              <span className="info-value">
                {wizard.selectedStakeholder ? wizard.selectedStakeholder.charAt(0).toUpperCase() + wizard.selectedStakeholder.slice(1) : 'Anonymous'}
              </span>
            </div>
            {wizard.respondentName && (
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{wizard.respondentName}</span>
              </div>
            )}
            {wizard.respondentEmail && (
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{wizard.respondentEmail}</span>
              </div>
            )}
            <div className="info-row">
              <span className="info-label">Anonymous:</span>
              <span className="info-value">{wizard.isAnonymous ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Dimension Completion Checklist */}
        <div className="dimensions-checklist">
          <h3>Dimensions Status</h3>
          <div className="checklist">
            {Array.from({ length: 14 }, (_, i) => {
              const dimensionId = i + 1;
              const dimension = getDimensionById(dimensionId);
              const isComplete = wizard.completedDimensions.has(dimensionId);

              return (
                <div key={dimensionId} className={`checklist-item ${isComplete ? 'complete' : ''}`}>
                  <span className="checklist-icon">{isComplete ? '✓' : '○'}</span>
                  <span className="checklist-label">
                    {dimensionId}. {dimension?.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review Details */}
        <details className="review-details">
          <summary>View All Responses</summary>
          <div className="responses-list">
            {responses.length > 0 ? (
              responses.map(response => (
                <div key={response.id} className="response-item">
                  <span className="response-metric">{response.metricId}</span>
                  <span className="response-value">
                    {response.metricType === 'reality' ? `Reality: ${response.metricValue}` : `Perception: ${response.metricValue}/10`}
                  </span>
                </div>
              ))
            ) : (
              <p>No responses recorded</p>
            )}
          </div>
        </details>

        {/* Submit Confirmation Modal */}
        {submitConfirmed && (
          <div className="confirmation-modal">
            <div className="modal-content">
              <h3>Confirm Submission</h3>
              <p>You are about to submit your assessment. This action cannot be undone.</p>
              <div className="modal-buttons">
                <button
                  className="btn-secondary"
                  onClick={() => setSubmitConfirmed(false)}
                  disabled={isSubmitting}
                >
                  ← Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '⏳ Submitting...' : '✓ Confirm & Submit'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="error-banner">
            <span className="error-icon">❌</span>
            <span className="error-message">{submitError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-secondary" onClick={handleSaveAndExit}>
            ↩️ Save & Exit
          </button>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
            title={!isComplete ? 'Complete all 14 dimensions to submit' : ''}
          >
            {isSubmitting ? '⏳ Submitting...' : '✓ Submit Assessment'}
          </button>
        </div>
      </div>

      <style>{`
        .review-submit {
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
        }

        .review-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .review-header {
          text-align: center;
        }

        .review-header h2 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: var(--text-primary);
        }

        .review-header p {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
        }

        .progress-summary {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .summary-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .summary-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .progress-bar {
          height: 8px;
          background: var(--bg-primary);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px;
          background: var(--bg-primary);
          border-radius: 6px;
        }

        .stat-label {
          font-size: 11px;
          color: var(--text-tertiary);
          font-weight: 600;
        }

        .stat-value {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .respondent-info {
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .respondent-info h3 {
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: var(--text-primary);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          background: var(--bg-primary);
          border-radius: 4px;
          font-size: 13px;
        }

        .info-label {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .info-value {
          color: var(--text-primary);
        }

        .dimensions-checklist {
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .dimensions-checklist h3 {
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: var(--text-primary);
        }

        .checklist {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 8px;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          background: var(--bg-primary);
          border-radius: 4px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .checklist-item.complete {
          color: #10b981;
          background: rgba(16, 185, 129, 0.08);
        }

        .checklist-icon {
          font-weight: 700;
        }

        .review-details {
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
          cursor: pointer;
        }

        .review-details summary {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .responses-list {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: 300px;
          overflow-y: auto;
        }

        .response-item {
          display: flex;
          gap: 12px;
          padding: 8px;
          background: var(--bg-primary);
          border-radius: 4px;
          font-size: 12px;
        }

        .response-metric {
          font-weight: 600;
          color: var(--brand-primary);
          min-width: 40px;
        }

        .response-value {
          color: var(--text-secondary);
        }

        .confirmation-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--bg-primary);
          border-radius: 8px;
          padding: 24px;
          max-width: 400px;
          text-align: center;
        }

        .modal-content h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: var(--text-primary);
        }

        .modal-content p {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0 0 20px 0;
        }

        .modal-buttons {
          display: flex;
          gap: 12px;
        }

        .error-banner {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 12px;
          background: rgba(220, 38, 38, 0.1);
          border-left: 3px solid #dc2626;
          border-radius: 4px;
          color: #dc2626;
        }

        .error-icon {
          font-size: 16px;
        }

        .error-message {
          font-size: 13px;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
        }

        .btn-secondary,
        .btn-primary {
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          font-family: inherit;
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--bg-tertiary);
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

        .btn-primary:disabled,
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
          .review-submit {
            padding: 16px;
          }

          .review-header h2 {
            font-size: 22px;
          }

          .checklist {
            grid-template-columns: 1fr;
          }

          .summary-stats {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column-reverse;
          }

          .modal-content {
            margin: 20px;
          }
        }
      `}</style>
    </div>
  );
};

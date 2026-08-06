import React, { useState } from 'react';
import { StakeholderGroup, STAKEHOLDER_DISPLAY_NAMES, DEFAULT_TARGET_COUNTS } from '../../types/multi-respondent';

interface CustomizeTargetsFormProps {
  onSubmit: (targets: Record<StakeholderGroup, number>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CustomizeTargetsForm: React.FC<CustomizeTargetsFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [targets, setTargets] = useState<Record<StakeholderGroup, number>>({
    management: DEFAULT_TARGET_COUNTS.management,
    teachers: DEFAULT_TARGET_COUNTS.teachers,
    parents_students: DEFAULT_TARGET_COUNTS.parents_students,
    operational_metrics: DEFAULT_TARGET_COUNTS.operational_metrics
  });

  const stakeholderGroups: StakeholderGroup[] = ['management', 'teachers', 'parents_students', 'operational_metrics'];

  const handleChange = (group: StakeholderGroup, value: number) => {
    setTargets(prev => ({
      ...prev,
      [group]: Math.max(0, value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const totalTargets = Object.values(targets).reduce((sum, val) => sum + val, 0);
    if (totalTargets === 0) {
      alert('Please set at least 1 target respondent');
      return;
    }

    onSubmit(targets);
  };

  const totalTargets = Object.values(targets).reduce((sum, val) => sum + val, 0);

  return (
    <div className="customize-targets-form">
      <h2>Customize Target Respondent Counts</h2>
      <p className="form-description">
        Set the target number of respondents for each stakeholder group. You can adjust these numbers anytime before locking the assessment.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {stakeholderGroups.map((group) => (
            <div key={group} className="form-group">
              <label htmlFor={group} className="form-label">
                {STAKEHOLDER_DISPLAY_NAMES[group]}
              </label>
              <div className="input-wrapper">
                <input
                  id={group}
                  type="number"
                  min="0"
                  max="100"
                  value={targets[group]}
                  onChange={(e) => handleChange(group, parseInt(e.target.value) || 0)}
                  disabled={isLoading}
                  className="form-input"
                />
                <span className="input-hint">respondents</span>
              </div>
            </div>
          ))}
        </div>

        <div className="summary-section">
          <div className="summary-item">
            <span className="summary-label">Total Target Respondents:</span>
            <span className="summary-value">{totalTargets}</span>
          </div>
          <p className="summary-note">
            This is your target. Actual participation may differ.
          </p>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || totalTargets === 0}
            className="btn btn-primary"
          >
            {isLoading ? 'Creating Assessment...' : 'Create Assessment'}
          </button>
        </div>
      </form>

      <style>{`
        .customize-targets-form {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          background: var(--bg-primary);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .customize-targets-form h2 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
          font-size: 1.5rem;
          font-weight: 600;
        }

        .form-description {
          margin: 0 0 1.5rem 0;
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          font-size: 0.95rem;
          font-weight: 500;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          font-size: 1rem;
          background: var(--input-bg);
          color: var(--text-primary);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--accent-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-hint {
          color: var(--text-secondary);
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .summary-section {
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 6px;
          margin-bottom: 2rem;
          border-left: 4px solid var(--accent-color);
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .summary-label {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .summary-value {
          color: var(--text-primary);
          font-size: 1.5rem;
          font-weight: 600;
        }

        .summary-note {
          margin: 0.75rem 0 0 0;
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-style: italic;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: var(--accent-color);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--accent-dark);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--bg-tertiary);
        }

        @media (max-width: 768px) {
          .customize-targets-form {
            margin: 1rem;
            padding: 1.5rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

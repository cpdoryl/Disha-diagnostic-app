/**
 * 14-Dimension Assessment Wizard — Stakeholder Selector
 * Step 0: Let respondent choose stakeholder type and optionally provide identity
 * Phase 2: Frontend Assessment Wizard
 */

import React, { useState } from 'react';
import { useAssessmentWizard } from '@/lib/14d/assessmentWizardState';
import { StakeholderType, STAKEHOLDER_LABELS } from '@/lib/14d/types14D';

interface StakeholderOption {
  type: StakeholderType;
  label: string;
  description: string;
  icon: string;
  requiresIdentity: boolean;
}

const STAKEHOLDER_OPTIONS: StakeholderOption[] = [
  {
    type: 'teacher',
    label: 'Teacher',
    description: 'Teaching staff member',
    icon: '👨‍🏫',
    requiresIdentity: true,
  },
  {
    type: 'parent',
    label: 'Parent',
    description: 'Student guardian or parent',
    icon: '👨‍👩‍👧',
    requiresIdentity: true,
  },
  {
    type: 'student',
    label: 'Student',
    description: 'Current student',
    icon: '🎓',
    requiresIdentity: false,
  },
  {
    type: 'admin',
    label: 'Administrator',
    description: 'School leadership or admin staff',
    icon: '👔',
    requiresIdentity: true,
  },
  {
    type: 'other',
    label: 'Other',
    description: 'Other stakeholder',
    icon: '👤',
    requiresIdentity: false,
  },
];

export const StakeholderSelector: React.FC = () => {
  const wizard = useAssessmentWizard();
  const [selectedType, setSelectedType] = useState<StakeholderType | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedOption = STAKEHOLDER_OPTIONS.find(opt => opt.type === selectedType);
  const requiresIdentity = selectedOption?.requiresIdentity ?? false;

  const validateAndContinue = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedType) {
      newErrors.stakeholder = 'Please select a stakeholder type';
    }

    if (!isAnonymous) {
      if (requiresIdentity) {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          newErrors.email = 'Valid email address is required';
        }
        if (!identifier) {
          const idLabel = selectedType === 'teacher' ? 'Teacher ID' :
                          selectedType === 'parent' ? 'Student/Class' :
                          'Admin ID';
          newErrors.identifier = `${idLabel} is required`;
        }
      } else if (!name && selectedType !== 'student') {
        newErrors.name = 'Name is required';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    wizard.setStakeholder(
      selectedType!,
      name || email || identifier,
      email || undefined,
      isAnonymous
    );

    wizard.nextStep();
  };

  const getIdFieldLabel = (): string => {
    if (!selectedType) return 'ID/Identifier';
    if (selectedType === 'teacher') return 'Teacher ID';
    if (selectedType === 'parent') return 'Student/Class';
    if (selectedType === 'admin') return 'Admin ID';
    return 'Name';
  };

  return (
    <div className="stakeholder-selector">
      <div className="selector-header">
        <h1>Welcome to the 14-Dimension School Assessment</h1>
        <p className="subtitle">
          Your perspective helps us understand how our school is doing.
          This assessment takes about 20 minutes.
        </p>
      </div>

      {/* Stakeholder Type Selection */}
      <div className="stakeholder-grid">
        <h2>Who are you?</h2>
        <div className="options-grid">
          {STAKEHOLDER_OPTIONS.map(option => (
            <button
              key={option.type}
              className={`stakeholder-card ${selectedType === option.type ? 'selected' : ''}`}
              onClick={() => {
                setSelectedType(option.type);
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.stakeholder;
                  return newErrors;
                });
              }}
            >
              <div className="card-icon">{option.icon}</div>
              <h3>{option.label}</h3>
              <p>{option.description}</p>
            </button>
          ))}
        </div>
        {errors.stakeholder && <div className="error-message">{errors.stakeholder}</div>}
      </div>

      {/* Identity Form (Conditional) */}
      {selectedType && (
        <div className="identity-section">
          <div className="anonymous-toggle">
            <label>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={e => {
                  setIsAnonymous(e.target.checked);
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.email;
                    delete newErrors.identifier;
                    delete newErrors.name;
                    return newErrors;
                  });
                }}
              />
              <span>Keep me anonymous</span>
            </label>
            <p className="help-text">
              Your response will not be attributed to you personally
            </p>
          </div>

          {!isAnonymous && (
            <div className="identity-form">
              <h3>Your Information</h3>

              {requiresIdentity && (
                <>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          if (!e.target.value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
                            delete newErrors.email;
                          }
                          return newErrors;
                        });
                      }}
                      placeholder="your.email@school.com"
                      className={errors.email ? 'error' : ''}
                      autoFocus
                    />
                    {errors.email && <div className="field-error">{errors.email}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="identifier">{getIdFieldLabel()} *</label>
                    <input
                      id="identifier"
                      type="text"
                      value={identifier}
                      onChange={e => {
                        setIdentifier(e.target.value);
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          if (e.target.value) {
                            delete newErrors.identifier;
                          }
                          return newErrors;
                        });
                      }}
                      placeholder={`Enter your ${getIdFieldLabel().toLowerCase()}`}
                      className={errors.identifier ? 'error' : ''}
                    />
                    {errors.identifier && <div className="field-error">{errors.identifier}</div>}
                  </div>
                </>
              )}

              {!requiresIdentity && selectedType !== 'student' && (
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        if (e.target.value) {
                          delete newErrors.name;
                        }
                        return newErrors;
                      });
                    }}
                    placeholder="Your name (optional)"
                    className={errors.name ? 'error' : ''}
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="wizard-footer">
        <button
          className="btn-cancel"
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
        <button
          className="btn-primary"
          onClick={validateAndContinue}
          disabled={!selectedType}
        >
          Continue to Assessment
        </button>
      </div>

      <style>{`
        .stakeholder-selector {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .selector-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .selector-header h1 {
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: var(--text-primary);
        }

        .selector-header .subtitle {
          font-size: 16px;
          color: var(--text-secondary);
          max-width: 500px;
          margin: 0 auto;
        }

        .stakeholder-grid h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 20px 0;
          color: var(--text-primary);
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .stakeholder-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 20px 16px;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .stakeholder-card:hover {
          border-color: var(--brand-primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .stakeholder-card.selected {
          border-color: var(--brand-primary);
          background: var(--bg-primary);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .stakeholder-card h3 {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }

        .stakeholder-card p {
          font-size: 12px;
          color: var(--text-tertiary);
          text-align: center;
          margin: 0;
        }

        .card-icon {
          font-size: 32px;
        }

        .error-message {
          color: var(--status-error);
          font-size: 14px;
          margin-top: 8px;
        }

        .identity-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 24px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .anonymous-toggle {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .anonymous-toggle label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .anonymous-toggle input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--brand-primary);
        }

        .anonymous-toggle span {
          font-weight: 500;
          color: var(--text-primary);
        }

        .help-text {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
        }

        .identity-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .identity-form h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .form-group input {
          padding: 10px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          background: var(--bg-primary);
          color: var(--text-primary);
          transition: border-color 0.2s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--brand-primary);
          box-shadow: 0 0 0 2px rgba(59,130,246,0.1);
        }

        .form-group input.error {
          border-color: var(--status-error);
        }

        .field-error {
          font-size: 12px;
          color: var(--status-error);
        }

        .wizard-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
        }

        .btn-cancel,
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

        .btn-cancel {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .btn-cancel:hover {
          background: var(--bg-tertiary);
        }

        .btn-primary {
          background: var(--brand-primary);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--brand-dark);
          box-shadow: 0 2px 8px rgba(59,130,246,0.2);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .stakeholder-selector {
            padding: 24px 16px;
            gap: 32px;
          }

          .selector-header h1 {
            font-size: 24px;
          }

          .options-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }

          .wizard-footer {
            flex-direction: column-reverse;
          }

          .btn-cancel,
          .btn-primary {
            width: 100%;
          }
        }

        /* Theme-aware color system */
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
            --status-error: #ef4444;
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
          --status-error: #ef4444;
        }
      `}</style>
    </div>
  );
};

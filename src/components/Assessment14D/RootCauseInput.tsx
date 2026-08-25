/**
 * 14-Dimension Assessment Wizard — Root Cause Input
 * Collects open-text follow-up explaining perception rating
 * Phase 2: Frontend Assessment Wizard
 */

import React, { useEffect, useState } from 'react';
import type { Metric } from '@/lib/14d/types14D';

interface RootCauseInputProps {
  metric: Metric;
  perceptionValue: number;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

const MAX_CHARACTERS = 500;

export const RootCauseInput: React.FC<RootCauseInputProps> = ({
  metric,
  perceptionValue,
  value = '',
  onChange,
  placeholder,
  maxLength = MAX_CHARACTERS,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const characterCount = value.length;
  const percentCapacity = (characterCount / maxLength) * 100;
  const isWarning = percentCapacity >= 80;
  const isError = percentCapacity >= 100;

  const getRatingLabel = (): string => {
    if (perceptionValue <= 2) return 'Poor';
    if (perceptionValue <= 4) return 'Below Average';
    if (perceptionValue <= 6) return 'Average';
    if (perceptionValue <= 8) return 'Good';
    return 'Excellent';
  };

  const getPromptText = (): string => {
    return `You rated this as "${getRatingLabel()} (${perceptionValue}/10)". Why?`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (characterCount < maxLength || e.target.value.length <= characterCount) {
      onChange(e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (characterCount >= maxLength && e.key !== 'Backspace' && e.key !== 'Delete') {
      if (e.key !== 'Tab' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
      }
    }
  };

  useEffect(() => {
    const textarea = document.getElementById(`root-cause-${metric.id}`) as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [value, metric.id]);

  return (
    <div className="root-cause-input">
      <div className="input-header">
        <label htmlFor={`root-cause-${metric.id}`} className="input-label">
          {getPromptText()}
        </label>
        <span className="character-count" data-warning={isWarning} data-error={isError}>
          {characterCount} / {maxLength}
        </span>
      </div>

      <textarea
        id={`root-cause-${metric.id}`}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder || 'Please explain your reasoning...'}
        className="textarea"
        data-focused={isFocused}
        rows={3}
        aria-label={getPromptText()}
        aria-describedby={`char-count-${metric.id}`}
      />

      <div className="character-indicator">
        <div className="indicator-bar">
          <div
            className="indicator-fill"
            style={{
              width: `${Math.min(percentCapacity, 100)}%`,
            }}
            data-warning={isWarning}
            data-error={isError}
          />
        </div>
      </div>

      {isError && (
        <div className="error-message">
          Character limit reached. Delete some text to add more.
        </div>
      )}

      {isWarning && !isError && (
        <div className="warning-message">
          You're getting close to the limit. Consider being more concise.
        </div>
      )}

      <style>{`
        .root-cause-input {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .input-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .input-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          flex: 1;
          line-height: 1.4;
        }

        .character-count {
          font-size: 12px;
          color: var(--text-tertiary);
          font-weight: 500;
          white-space: nowrap;
          padding: 2px 8px;
          background: var(--bg-primary);
          border-radius: 4px;
        }

        .character-count[data-warning="true"] {
          color: #d97706;
          background: rgba(217, 119, 6, 0.1);
        }

        .character-count[data-error="true"] {
          color: #dc2626;
          background: rgba(220, 38, 38, 0.1);
          font-weight: 600;
        }

        .textarea {
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          background: var(--bg-primary);
          color: var(--text-primary);
          resize: vertical;
          min-height: 80px;
          max-height: 150px;
          overflow-y: auto;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .textarea:focus {
          outline: none;
          border-color: var(--brand-primary);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .textarea:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .character-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .indicator-bar {
          flex: 1;
          height: 4px;
          background: var(--bg-primary);
          border-radius: 2px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .indicator-fill {
          height: 100%;
          background: var(--brand-primary);
          transition: all 0.2s ease;
          border-radius: 2px;
        }

        .indicator-fill[data-warning="true"] {
          background: #d97706;
        }

        .indicator-fill[data-error="true"] {
          background: #dc2626;
        }

        .error-message {
          font-size: 12px;
          color: #dc2626;
          padding: 8px 12px;
          background: rgba(220, 38, 38, 0.1);
          border-radius: 4px;
          border-left: 3px solid #dc2626;
        }

        .warning-message {
          font-size: 12px;
          color: #d97706;
          padding: 8px 12px;
          background: rgba(217, 119, 6, 0.1);
          border-radius: 4px;
          border-left: 3px solid #d97706;
        }

        /* Theme-aware colors */
        :root {
          --text-primary: #1f2937;
          --text-tertiary: #9ca3af;
          --bg-primary: #ffffff;
          --bg-secondary: #f9fafb;
          --border-color: #e5e7eb;
          --brand-primary: #3b82f6;
        }

        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) {
            --text-primary: #f9fafb;
            --text-tertiary: #9ca3af;
            --bg-primary: #111827;
            --bg-secondary: #1f2937;
            --border-color: #4b5563;
            --brand-primary: #60a5fa;
          }
        }

        :root[data-theme="dark"] {
          --text-primary: #f9fafb;
          --text-tertiary: #9ca3af;
          --bg-primary: #111827;
          --bg-secondary: #1f2937;
          --border-color: #4b5563;
          --brand-primary: #60a5fa;
        }

        @media (max-width: 640px) {
          .input-header {
            flex-direction: column;
          }

          .character-count {
            align-self: flex-end;
          }

          .textarea {
            font-size: 16px; /* Prevents zoom on iOS */
          }
        }
      `}</style>
    </div>
  );
};

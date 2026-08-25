/**
 * 14-Dimension Assessment Wizard — Perception Scale (1-10 Slider)
 * Collects perception ratings on a 1-10 scale with visual feedback
 * Phase 2: Frontend Assessment Wizard
 */

import React, { useMemo } from 'react';
import type { Metric } from '@/lib/14d/types14D';

interface PerceptionScaleProps {
  metric: Metric;
  value?: number; // 1-10
  onChange: (value: number) => void;
  disabled?: boolean;
  showLabel?: boolean;
}

const PERCEPTION_LABELS = {
  1: 'Poor',
  2: 'Poor',
  3: 'Below Average',
  4: 'Below Average',
  5: 'Average',
  6: 'Average',
  7: 'Good',
  8: 'Good',
  9: 'Excellent',
  10: 'Excellent',
};

const getColorForValue = (value: number): string => {
  if (value <= 2) return '#dc2626'; // red
  if (value <= 4) return '#f97316'; // orange
  if (value <= 6) return '#eab308'; // yellow
  if (value <= 8) return '#84cc16'; // lime
  return '#16a34a'; // green
};

const getBackgroundForValue = (value: number): string => {
  if (value <= 2) return 'rgba(220,38,38,0.1)';
  if (value <= 4) return 'rgba(249,115,22,0.1)';
  if (value <= 6) return 'rgba(234,179,8,0.1)';
  if (value <= 8) return 'rgba(132,204,22,0.1)';
  return 'rgba(22,163,74,0.1)';
};

export const PerceptionScale: React.FC<PerceptionScaleProps> = ({
  metric,
  value = 5,
  onChange,
  disabled = false,
  showLabel = true,
}) => {
  const label = useMemo(() => PERCEPTION_LABELS[value as keyof typeof PERCEPTION_LABELS], [value]);
  const color = useMemo(() => getColorForValue(value), [value]);
  const background = useMemo(() => getBackgroundForValue(value), [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (value > 1) onChange(value - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (value < 10) onChange(value + 1);
    }
  };

  return (
    <div className="perception-scale">
      <div className="scale-header">
        <label className="scale-label">
          How would you rate this aspect?
        </label>
        {showLabel && (
          <div className="scale-description">
            Rate from 1 (Poor) to 10 (Excellent)
          </div>
        )}
      </div>

      <div className="scale-container">
        <div className="scale-value" style={{ color, background }}>
          <span className="value-number">{value}</span>
          <span className="value-label">{label}</span>
        </div>

        <div className="slider-wrapper">
          <input
            type="range"
            min="1"
            max="10"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="slider"
            aria-label={`Rate ${metric.label || 'this aspect'} from 1 to 10`}
            aria-valuenow={value}
            aria-valuemin={1}
            aria-valuemax={10}
            style={{
              background: `linear-gradient(to right, #dc2626 0%, #f97316 20%, #eab308 40%, #84cc16 60%, #16a34a 100%)`
            }}
          />
          <div className="slider-labels">
            <span className="label-left">Poor</span>
            <span className="label-center">Average</span>
            <span className="label-right">Excellent</span>
          </div>
        </div>
      </div>

      <div className="scale-tooltip">
        <span className="tooltip-value">{value}/10</span>
        <span className="tooltip-text">{label}</span>
      </div>

      <style>{`
        .perception-scale {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .scale-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .scale-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .scale-description {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .scale-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .scale-value {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .value-number {
          font-size: 48px;
          font-weight: 700;
          line-height: 1;
          color: inherit;
        }

        .value-label {
          font-size: 14px;
          font-weight: 600;
          color: inherit;
        }

        .slider-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          cursor: pointer;
          transition: box-shadow 0.2s ease;
        }

        .slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .slider:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        /* Webkit browsers (Chrome, Safari, Edge) */
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid var(--brand-primary);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        }

        .slider::-webkit-slider-thumb:active {
          transform: scale(1.1);
        }

        /* Firefox */
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 3px solid var(--brand-primary);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        }

        .slider::-moz-range-thumb:active {
          transform: scale(1.1);
        }

        .slider-labels {
          display: flex;
          justify-content: space-between;
          padding: 0 2px;
        }

        .slider-labels span {
          font-size: 12px;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .label-left {
          text-align: left;
        }

        .label-center {
          text-align: center;
        }

        .label-right {
          text-align: right;
        }

        .scale-tooltip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 12px;
        }

        .tooltip-value {
          font-weight: 700;
          color: var(--text-primary);
        }

        .tooltip-text {
          color: var(--text-secondary);
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
          .perception-scale {
            padding: 16px;
            gap: 12px;
          }

          .value-number {
            font-size: 40px;
          }

          .value-label {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

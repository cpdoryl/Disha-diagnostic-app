/**
 * Dimension Section Component
 * Displays a single dimension with all its questions
 */

import React, { useState } from 'react';
import type { Dimension, DimensionResponse } from '@/data/dimensionalAssessmentData';

interface DimensionSectionProps {
  dimension: Dimension;
  onResponseChange: (questionId: string, selectedWeight: number) => void;
  responses: DimensionResponse[];
}

export const DimensionSection: React.FC<DimensionSectionProps> = ({
  dimension,
  onResponseChange,
  responses
}) => {
  const [expanded, setExpanded] = useState(true);

  const getProgressForDimension = () => {
    const answered = responses.length;
    const total = dimension.questions.length;
    return Math.round((answered / total) * 100);
  };

  const getResponseForQuestion = (questionId: string) => {
    return responses.find((r) => r.questionId === questionId);
  };

  return (
    <div className={`dimension-section ${dimension.tier.toLowerCase().replace(/\s+/g, '-')}`}>
      <div
        className="dimension-header"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
      >
        <div className="dimension-title">
          <h2 className="dimension-label">
            {dimension.dimensionId}. {dimension.label}
          </h2>
          <p className="dimension-tier">{dimension.tier}</p>
          <p className="dimension-weight">Weight: {dimension.weight}%</p>
        </div>

        <div className="dimension-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${getProgressForDimension()}%` }}
            />
          </div>
          <span className="progress-text">{getProgressForDimension()}%</span>
        </div>

        <button
          className="expand-toggle"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? '−' : '+'}
        </button>
      </div>

      {expanded && (
        <div className="dimension-content">
          <div className="dimension-info">
            <div className="info-section">
              <h3>Definition</h3>
              <p>{dimension.definition}</p>
            </div>

            <div className="info-section">
              <h3>Why It Matters</h3>
              <ul>
                {dimension.whyItMatters.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>

            <div className="info-section">
              <h3>Key Metrics</h3>
              <ul>
                {dimension.keyMetrics.map((metric, idx) => (
                  <li key={idx}>{metric}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="questions-container">
            {dimension.questions.map((question, qIdx) => {
              const response = getResponseForQuestion(question.id);

              return (
                <div key={question.id} className="question-block">
                  <div className="question-number">{qIdx + 1}</div>

                  <div className="question-content">
                    <label className="question-label">{question.label}</label>

                    <div className="options-grid">
                      {question.options.map((option) => (
                        <div key={option.value} className="option-item">
                          <input
                            type="radio"
                            id={`${question.id}-${option.value}`}
                            name={question.id}
                            value={option.weight}
                            checked={response?.selectedOptionWeight === option.weight}
                            onChange={(e) => {
                              onResponseChange(question.id, parseInt(e.target.value, 10));
                            }}
                            className="option-input"
                          />
                          <label
                            htmlFor={`${question.id}-${option.value}`}
                            className="option-label"
                          >
                            <span className="option-title">{option.label}</span>
                            {option.description && (
                              <span className="option-description">{option.description}</span>
                            )}
                            <span className="option-weight">
                              Weight: {option.weight}/10
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>

                    {response && (
                      <div className="option-selected">
                        ✓ Response recorded (Weight: {response.selectedOptionWeight}/10)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DimensionSection;

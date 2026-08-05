/**
 * DISHA 14-Dimension EWISR Assessment Form Component
 * Main assessment interface for collecting responses
 */

import React, { useState } from 'react';
import { useEWSIRAssessment } from '@/hooks/useEWSIRAssessment';
import DimensionSection from './DimensionSection';
import ProgressBar from './ProgressBar';
import AssessmentResults from './AssessmentResults';
import type { OverallAssessment } from '@/hooks/useEWSIRAssessment';

interface AssessmentFormProps {
  schoolName?: string;
  onComplete?: (assessment: OverallAssessment) => void;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  schoolName = 'School Assessment',
  onComplete
}) => {
  const assessment = useEWSIRAssessment(schoolName);
  const [showResults, setShowResults] = useState(false);

  const handleComplete = () => {
    const results = assessment.exportAssessmentData();
    setShowResults(true);
    onComplete?.(results);
  };

  if (showResults) {
    return (
      <AssessmentResults
        assessment={assessment.exportAssessmentData()}
        onReset={() => {
          assessment.resetAssessment();
          setShowResults(false);
        }}
      />
    );
  }

  return (
    <div className="ewisr-assessment-form">
      <div className="assessment-header">
        <h1>DISHA 14-Dimension EWISR Assessment</h1>
        <p className="subtitle">Educational Worth Institutional Strength Rating</p>
        <p className="school-name">School: {schoolName}</p>
      </div>

      <ProgressBar percentage={assessment.getProgressPercentage} />

      <div className="dimensions-container">
        {assessment.dimensions.map((dimension) => (
          <DimensionSection
            key={dimension.dimensionId}
            dimension={dimension}
            onResponseChange={(questionId, weight) => {
              assessment.recordResponse(dimension.dimensionId, questionId, weight);
            }}
            responses={assessment.getDimensionResponses(dimension.dimensionId)}
          />
        ))}
      </div>

      <div className="assessment-actions">
        <button
          className="btn-primary"
          onClick={handleComplete}
          disabled={assessment.getProgressPercentage < 100}
        >
          {assessment.getProgressPercentage === 100
            ? 'View Results'
            : `Complete Assessment (${assessment.getProgressPercentage}%)`}
        </button>
        <button className="btn-secondary" onClick={() => assessment.resetAssessment()}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default AssessmentForm;

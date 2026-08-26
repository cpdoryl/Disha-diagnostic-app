/**
 * Phase 5: Perception Survey Page
 * Public-facing page for respondents to submit surveys
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PerceptionSurveyForm } from '@/components/Phase5_DataInfrastructure/PerceptionSurveyForm';
import { submitSurveyResponse, checkForDuplicateResponse } from '@/lib/phase5/surveyService';
import { RespondentType } from '@/lib/phase5/types';

export const Phase5Survey: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Get parameters from URL
  const schoolId = searchParams.get('schoolId') || 'default-school';
  const cycleId = searchParams.get('cycleId') || 'cycle-2026-08';
  const respondentType = searchParams.get('respondentType') as RespondentType | null;

  // Verify parameters
  useEffect(() => {
    if (!schoolId || !cycleId) {
      setErrorMessage('Missing required parameters: schoolId and cycleId');
    }
  }, [schoolId, cycleId]);

  // Handle form submission
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Check for duplicate
      const isDuplicate = await checkForDuplicateResponse(schoolId, cycleId, data.email);

      if (isDuplicate) {
        setSubmitStatus('error');
        setErrorMessage(
          'A response from this email address already exists for this survey cycle. Please use a different email or contact the administrator.'
        );
        setIsLoading(false);
        return;
      }

      // Submit survey
      const responseId = await submitSurveyResponse(
        schoolId,
        cycleId,
        data.respondentType,
        data.email,
        data.phone,
        data.responses
      );

      setSubmitStatus('success');
      setErrorMessage('');

      // Show success message for 3 seconds, then reset
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to submit survey. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================================
  // ERROR STATE
  // ========================================================================

  if (errorMessage && !submitStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Survey Unavailable</h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  // ========================================================================
  // SUCCESS STATE
  // ========================================================================

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your survey response has been submitted successfully. Your feedback helps us improve.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              <span className="font-semibold">School:</span> {schoolId}
            </p>
            <p className="text-sm text-green-700">
              <span className="font-semibold">Cycle:</span> {cycleId}
            </p>
          </div>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  // ========================================================================
  // ERROR SUBMISSION STATE
  // ========================================================================

  if (submitStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex gap-4 mb-6">
              <div className="text-red-600 text-3xl">✕</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Submission Error</h2>
                <p className="text-red-600">{errorMessage}</p>
              </div>
            </div>

            <button
              onClick={() => setSubmitStatus('idle')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // NORMAL SURVEY STATE
  // ========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">DISHA School Diagnostic</h1>
          <p className="text-gray-600">
            Help us understand your perspective on school quality
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">69</div>
            <p className="text-sm text-gray-600">Questions</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">14</div>
            <p className="text-sm text-gray-600">Dimensions</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">5 min</div>
            <p className="text-sm text-gray-600">Est. Time</p>
          </div>
        </div>
      </div>

      {/* Survey Form */}
      <PerceptionSurveyForm
        schoolId={schoolId}
        cycleId={cycleId}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        defaultRespondentType={respondentType || undefined}
      />

      {/* Footer */}
      <div className="max-w-3xl mx-auto mt-8 text-center">
        <p className="text-sm text-gray-600">
          Your responses are confidential and will be used only for school improvement.
        </p>
      </div>
    </div>
  );
};

export default Phase5Survey;

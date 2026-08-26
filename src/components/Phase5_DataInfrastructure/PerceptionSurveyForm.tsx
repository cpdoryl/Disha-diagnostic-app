/**
 * Phase 5: Perception Survey Form
 * Component for respondents to submit perception survey responses
 */

import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  PERCEPTION_QUESTIONS_BANK,
  getQuestionsByRespondentType,
} from '@/lib/phase5/perceptionQuestionsBank';
import { RespondentType } from '@/lib/phase5/types';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const LikertResponseSchema = z.object({
  questionId: z.string(),
  rating: z.number().min(1).max(10),
  rootCauseText: z.string().optional(),
});

const PerceptionSurveyFormSchema = z.object({
  respondentType: z.enum(['TEACHER', 'PARENT', 'STUDENT', 'ADMIN', 'OTHER']),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  responses: z.array(LikertResponseSchema).min(1, 'Please answer at least one question'),
});

type PerceptionSurveyFormData = z.infer<typeof PerceptionSurveyFormSchema>;

// ============================================================================
// COMPONENT TYPES
// ============================================================================

interface PerceptionSurveyFormProps {
  schoolId: string;
  cycleId: string;
  onSubmit: (data: PerceptionSurveyFormData) => Promise<void>;
  isLoading?: boolean;
  defaultRespondentType?: RespondentType;
}

// ============================================================================
// LIKERT SCALE SLIDER COMPONENT
// ============================================================================

const LikertScaleSlider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled = false }) => {
  const labels = ['Strongly\nDisagree', 'Disagree', 'Neutral', 'Agree', 'Strongly\nAgree'];
  const colors = [
    'bg-red-600',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-green-700',
  ];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            disabled={disabled}
            className={`
              flex-1 py-2 px-1 text-xs font-semibold rounded transition-all
              ${value === num ? colors[Math.floor((num - 1) / 2)] + ' text-white shadow-lg' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-600 px-1">
        <span>1 (Disagree)</span>
        <span>10 (Agree)</span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN FORM COMPONENT
// ============================================================================

export const PerceptionSurveyForm: React.FC<PerceptionSurveyFormProps> = ({
  schoolId,
  cycleId,
  onSubmit,
  isLoading = false,
  defaultRespondentType,
}) => {
  const [currentStep, setCurrentStep] = useState<'respondent' | 'questions' | 'review'>('respondent');
  const [selectedRespondentType, setSelectedRespondentType] = useState<RespondentType | null>(
    defaultRespondentType || null
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PerceptionSurveyFormData>({
    resolver: zodResolver(PerceptionSurveyFormSchema),
    defaultValues: {
      respondentType: defaultRespondentType || undefined,
      email: '',
      phone: '',
      responses: [],
    },
  });

  const respondentType = watch('respondentType');
  const allResponses = watch('responses');
  const email = watch('email');

  // Get questions for selected respondent type
  const applicableQuestions = useMemo(() => {
    if (!selectedRespondentType) return [];
    return getQuestionsByRespondentType(selectedRespondentType);
  }, [selectedRespondentType]);

  // Calculate progress
  const answeredCount = allResponses.filter((r) => r.rating).length;
  const totalQuestions = applicableQuestions.length;
  const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Handle respondent type selection
  const handleSelectRespondentType = (type: RespondentType) => {
    setSelectedRespondentType(type);
    setCurrentStep('questions');
  };

  // Handle form submission
  const handleFormSubmit = async (data: PerceptionSurveyFormData) => {
    try {
      await onSubmit(data);
      reset();
      setSelectedRespondentType(null);
      setCurrentStep('respondent');
    } catch (error) {
      console.error('Failed to submit survey:', error);
    }
  };

  // ========================================================================
  // STEP 1: SELECT RESPONDENT TYPE
  // ========================================================================

  if (currentStep === 'respondent') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Perception Survey</h2>
          <p className="text-gray-600">
            Help us understand your perspective on school quality across 14 key dimensions.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Who are you?
          </label>

          {(['TEACHER', 'PARENT', 'STUDENT', 'ADMIN', 'OTHER'] as RespondentType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleSelectRespondentType(type)}
              className={`
                w-full p-4 rounded-lg border-2 text-left transition-all
                ${
                  selectedRespondentType === type
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }
              `}
            >
              <span className="font-semibold text-gray-800">{type.charAt(0) + type.slice(1).toLowerCase()}</span>
              <p className="text-sm text-gray-600 mt-1">
                {type === 'TEACHER' && 'I teach at this school'}
                {type === 'PARENT' && 'I have a child at this school'}
                {type === 'STUDENT' && 'I study at this school'}
                {type === 'ADMIN' && 'I work in school administration'}
                {type === 'OTHER' && 'Other stakeholder'}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ========================================================================
  // STEP 2: FILL SURVEY QUESTIONS
  // ========================================================================

  if (currentStep === 'questions') {
    return (
      <form
        onSubmit={handleSubmit((data) => {
          setCurrentStep('review');
        })}
        className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Survey Questions</h2>
              <p className="text-sm text-gray-600">
                {selectedRespondentType?.charAt(0) + selectedRespondentType?.slice(1).toLowerCase()} Survey
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep('respondent')}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Change Type
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {answeredCount} of {totalQuestions} questions answered ({Math.round(progressPercentage)}%)
          </p>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone (optional)</label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-8 mb-6">
          {applicableQuestions.map((question, index) => (
            <div key={question.id} className="border-b border-gray-200 pb-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-700">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 mb-3">{question.question}</p>
                  <Controller
                    name={`responses.${index}.rating` as any}
                    control={control}
                    defaultValue={0}
                    render={({ field }) => (
                      <LikertScaleSlider
                        value={field.value || 0}
                        onChange={field.onChange}
                        disabled={isLoading}
                      />
                    )}
                  />

                  {/* Root Cause Follow-up */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      {question.rootCauseFollowUp}
                    </label>
                    <Controller
                      name={`responses.${index}.rootCauseText` as any}
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          placeholder="Your thoughts here (optional)..."
                          rows={2}
                          disabled={isLoading}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setCurrentStep('respondent')}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading || answeredCount === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Review Answers'}
          </button>
        </div>
      </form>
    );
  }

  // ========================================================================
  // STEP 3: REVIEW & SUBMIT
  // ========================================================================

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Your Answers</h2>
        <p className="text-gray-600">Please review before submitting.</p>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Email:</span> {email}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Respondent Type:</span> {selectedRespondentType}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Questions Answered:</span> {answeredCount} of {totalQuestions}
        </p>
      </div>

      {/* Questions Summary */}
      <div className="space-y-3 mb-6">
        {applicableQuestions.map((question, index) => {
          const response = allResponses[index];
          return (
            <div key={question.id} className="border-l-4 border-blue-600 bg-gray-50 p-3 rounded">
              <p className="text-sm font-semibold text-gray-800">{question.question}</p>
              <div className="mt-1 flex gap-2">
                <span className="text-sm text-gray-600">Rating:</span>
                <span className="text-sm font-bold text-blue-600">{response?.rating || 'Not answered'}/10</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-xs text-gray-700">
          <span className="font-semibold">Note:</span> Your responses are confidential and will be used only for
          school improvement purposes.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setCurrentStep('questions')}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Back to Questions
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isLoading ? 'Submitting...' : 'Submit Survey'}
        </button>
      </div>
    </form>
  );
};

export default PerceptionSurveyForm;

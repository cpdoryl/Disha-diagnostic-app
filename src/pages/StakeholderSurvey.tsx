import React, { useState, useEffect } from 'react';
import { FOURTEEN_DIMENSIONS, getDimensionByIndex, getTotalDimensions, getTotalQuestions } from '../data/14DimensionsQuestions';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ChevronLeft, ChevronRight, Send, Check, AlertCircle } from 'lucide-react';

type SurveyStep = 'welcome' | 'info' | 'survey' | 'summary' | 'confirmation' | 'error';
type StakeholderType = 'teacher' | 'parent' | 'student' | 'admin' | 'other';

interface RespondentInfo {
  name: string;
  department: string;
}

interface SurveyResponse {
  [dimensionId: string]: {
    [questionId: string]: number; // 1-5 scale
  };
}

export function StakeholderSurvey() {
  // Parse URL params manually: /survey/:assessmentId/:stakeholderType
  const pathname = window.location.pathname;
  const match = pathname.match(/^\/survey\/([^/]+)\/([^/]+)$/);
  const assessmentId = match?.[1];
  const stakeholderType = match?.[2];

  const [currentStep, setCurrentStep] = useState<SurveyStep>('welcome');
  const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0);
  const [respondentInfo, setRespondentInfo] = useState<RespondentInfo>({ name: '', department: '' });
  const [responses, setResponses] = useState<SurveyResponse>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submissionId, setSubmissionId] = useState('');

  // Validate parameters
  useEffect(() => {
    if (!assessmentId || !stakeholderType || !['teacher', 'parent', 'student', 'admin', 'other'].includes(stakeholderType)) {
      setCurrentStep('error');
      setErrorMessage('Invalid survey link. Please check the URL and try again.');
    }
  }, [assessmentId, stakeholderType]);

  const totalDimensions = getTotalDimensions();
  const currentDimension = getDimensionByIndex(currentDimensionIndex);

  const handleStartSurvey = () => {
    setCurrentStep('info');
  };

  const handleProceedToSurvey = () => {
    setCurrentStep('survey');
    // Initialize responses structure
    const initialResponses: SurveyResponse = {};
    FOURTEEN_DIMENSIONS.forEach(dim => {
      initialResponses[dim.id] = {};
      dim.questions.forEach(q => {
        initialResponses[dim.id][q.id] = 0;
      });
    });
    setResponses(initialResponses);
  };

  const handleQuestionChange = (questionId: string, score: number) => {
    if (!currentDimension) return;
    setResponses(prev => ({
      ...prev,
      [currentDimension.id]: {
        ...prev[currentDimension.id],
        [questionId]: score
      }
    }));
  };

  const isCurrentDimensionComplete = (): boolean => {
    if (!currentDimension) return false;
    const dimensionResponses = responses[currentDimension.id] || {};
    return currentDimension.questions.every(q => dimensionResponses[q.id] > 0);
  };

  const handleNext = () => {
    if (!isCurrentDimensionComplete()) {
      setErrorMessage('Please answer all questions before proceeding.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (currentDimensionIndex < totalDimensions - 1) {
      setCurrentDimensionIndex(currentDimensionIndex + 1);
      setErrorMessage('');
    } else {
      setCurrentStep('summary');
    }
  };

  const handlePrevious = () => {
    if (currentDimensionIndex > 0) {
      setCurrentDimensionIndex(currentDimensionIndex - 1);
      setErrorMessage('');
    }
  };

  const handleSubmitSurvey = async () => {
    try {
      setIsSubmitting(true);

      // Prepare response data
      const submissionData = {
        assessmentId,
        stakeholderType: stakeholderType as StakeholderType,
        respondentName: respondentInfo.name || 'Anonymous',
        respondentDepartment: respondentInfo.department || 'Not specified',
        responses,
        submittedAt: serverTimestamp(),
        userAgent: navigator.userAgent,
      };

      // Save to Firebase
      const docRef = await addDoc(
        collection(db, 'assessments', assessmentId as string, 'responses'),
        submissionData
      );

      setSubmissionId(docRef.id);
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Error submitting survey:', error);
      setErrorMessage('Error submitting survey. Please try again.');
      setCurrentStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressPercentage = (): number => {
    if (currentStep === 'survey') {
      return Math.round(((currentDimensionIndex + 1) / totalDimensions) * 100);
    }
    return 0;
  };

  const getRemainingQuestions = (): number => {
    let answered = 0;
    Object.values(responses).forEach(dimResponses => {
      answered += Object.values(dimResponses).filter(score => score > 0).length;
    });
    return getTotalQuestions() - answered;
  };

  // ============ WELCOME PAGE ============
  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <span className="text-2xl font-bold text-blue-600">D</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">DISHA Assessment</h1>
            <p className="text-lg text-gray-600">14-Dimension School Diagnostic</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded">
            <p className="text-gray-700 leading-relaxed">
              Thank you for taking the time to participate in this comprehensive school assessment!
              Your honest feedback is valuable and will help us understand the school's strengths and areas for improvement.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">14 Dimensions</h3>
                <p className="text-sm text-gray-600">Comprehensive framework covering all aspects of school excellence</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">~60 Questions</h3>
                <p className="text-sm text-gray-600">Easy-to-answer questions rated on a simple 1-5 scale</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">15-20 Minutes</h3>
                <p className="text-sm text-gray-600">Estimated time to complete the full survey</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Privacy Protected</h3>
                <p className="text-sm text-gray-600">Your responses are confidential and used only for improvement</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <p className="text-sm text-gray-600 text-center">
              <strong>Your Role:</strong> <span className="text-gray-900 capitalize font-semibold">{stakeholderType}</span>
            </p>
          </div>

          <button
            onClick={handleStartSurvey}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Start Assessment
            <ChevronRight className="w-5 h-5" />
          </button>

          <p className="text-xs text-gray-500 text-center mt-6">
            Your honest feedback helps us improve the school. Thank you!
          </p>
        </div>
      </div>
    );
  }

  // ============ RESPONDENT INFO PAGE ============
  if (currentStep === 'info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Information</h2>
          <p className="text-gray-600 mb-8">Optional: Help us understand your perspective better</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name (Optional)
              </label>
              <input
                type="text"
                value={respondentInfo.name}
                onChange={(e) => setRespondentInfo({ ...respondentInfo, name: e.target.value })}
                placeholder="Your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department/Class (Optional)
              </label>
              <input
                type="text"
                value={respondentInfo.department}
                onChange={(e) => setRespondentInfo({ ...respondentInfo, department: e.target.value })}
                placeholder="E.g., English Department, Class 10A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                ℹ️ This information is optional. Your anonymity is protected if you prefer not to provide it.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setCurrentStep('welcome')}
              className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleProceedToSurvey}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ SURVEY QUESTIONS PAGE ============
  if (currentStep === 'survey' && currentDimension) {
    const dimensionResponses = responses[currentDimension.id] || {};

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentDimension.name}
              </h1>
              <span className="text-sm font-semibold text-gray-600">
                {currentDimensionIndex + 1} of {totalDimensions}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{getProgressPercentage()}% complete</p>
          </div>

          {/* Dimension Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <p className="text-gray-600 mb-8 italic">{currentDimension.description}</p>

            {/* Questions */}
            <div className="space-y-8">
              {currentDimension.questions.map((question, idx) => (
                <div key={question.id} className="border-b pb-8 last:border-b-0 last:pb-0">
                  <div className="mb-4">
                    <p className="font-semibold text-gray-900 mb-2">
                      {idx + 1}. {question.text}
                    </p>
                    {question.hint && (
                      <p className="text-sm text-gray-500 italic">{question.hint}</p>
                    )}
                  </div>

                  {/* Rating Scale */}
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">Strongly Disagree</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(score => (
                        <button
                          key={score}
                          onClick={() => handleQuestionChange(question.id, score)}
                          className={`w-10 h-10 rounded-lg font-bold transition-all ${
                            dimensionResponses[question.id] === score
                              ? 'bg-blue-600 text-white scale-110'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">Strongly Agree</span>
                  </div>
                </div>
              ))}
            </div>

            {errorMessage && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentDimensionIndex === 0}
              className={`flex-1 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                currentDimensionIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {currentDimensionIndex < totalDimensions - 1 ? (
              <button
                onClick={handleNext}
                disabled={!isCurrentDimensionComplete()}
                className={`flex-1 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  isCurrentDimensionComplete()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isCurrentDimensionComplete()}
                className={`flex-1 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  isCurrentDimensionComplete()
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Review Response
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============ SUMMARY PAGE ============
  if (currentStep === 'summary') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Review Your Responses</h2>
          <p className="text-gray-600 mb-8">Please review your responses before submitting</p>

          {/* Summary */}
          <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
            {FOURTEEN_DIMENSIONS.map((dim, idx) => {
              const dimResponses = responses[dim.id] || {};
              const answers = dim.questions.filter(q => dimResponses[q.id] > 0).length;

              return (
                <div key={dim.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{dim.name}</p>
                    <p className="text-sm text-gray-600">{answers}/{dim.questions.length} questions answered</p>
                  </div>
                  <div className={`text-lg font-bold ${answers === dim.questions.length ? 'text-green-600' : 'text-gray-400'}`}>
                    {answers === dim.questions.length ? '✓' : '○'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Respondent Info Summary */}
          <div className="bg-blue-50 p-4 rounded-lg mb-8">
            <p className="text-sm text-gray-700">
              <strong>Role:</strong> <span className="capitalize">{stakeholderType}</span>
            </p>
            {respondentInfo.name && (
              <p className="text-sm text-gray-700">
                <strong>Name:</strong> {respondentInfo.name}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep('survey')}
              className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Edit Responses
            </button>
            <button
              onClick={handleSubmitSurvey}
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Survey'}
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ CONFIRMATION PAGE ============
  if (currentStep === 'confirmation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-xl text-gray-600 mb-8">Your response has been recorded successfully</p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <p className="text-gray-700 mb-2">
              <strong>Reference ID:</strong>
            </p>
            <p className="font-mono text-sm text-gray-900 break-all bg-white p-3 rounded border border-green-200">
              {submissionId}
            </p>
          </div>

          <div className="space-y-4 mb-8 text-left bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-3">Your contribution helps:</h3>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Identify school's core strengths</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Recognize areas for improvement</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Plan strategic initiatives</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Achieve excellence in education</span>
              </li>
            </ul>
          </div>

          <p className="text-gray-600 mb-6">
            The assessment team will analyze your responses and share findings with the school.
          </p>

          <button
            onClick={() => window.close()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Close This Page
          </button>

          <p className="text-xs text-gray-500 mt-6">
            Your feedback is confidential and used only for school improvement
          </p>
        </div>
      </div>
    );
  }

  // ============ ERROR PAGE ============
  if (currentStep === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-lg text-gray-600 mb-8">{errorMessage}</p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-left">
            <p className="text-gray-700 mb-3">
              <strong>Possible reasons:</strong>
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• The survey link may have expired</li>
              <li>• The assessment ID may be incorrect</li>
              <li>• Your stakeholder type may not be valid</li>
            </ul>
          </div>

          <p className="text-gray-600 mb-6">
            Please contact the school administrator to request a new survey link.
          </p>

          <button
            onClick={() => window.close()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Close This Page
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default StakeholderSurvey;

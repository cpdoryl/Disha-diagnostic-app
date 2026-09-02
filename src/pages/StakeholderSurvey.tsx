import React, { useState, useEffect } from 'react';
import { FOURTEEN_DIMENSIONS, getDimensionByIndex, getTotalDimensions, getTotalQuestions } from '../data/14DimensionsQuestions';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { isAssessmentEventOpen } from '../lib/assessmentEventService';
import { ChevronLeft, ChevronRight, Send, Check, AlertCircle } from 'lucide-react';
import { logAuditEvent } from '../lib/auditService';
import { useAppStore } from '../store';

type SurveyStep = 'welcome' | 'info' | 'survey' | 'summary' | 'confirmation' | 'error';
type StakeholderType = 'teacher' | 'parent' | 'student' | 'admin' | 'other';

interface RespondentInfo {
  name: string;
  department: string;
  email?: string;
  phone?: string;
  schoolName?: string;
  // Teacher fields
  subject?: string;
  class?: string;
  teacherId?: string;
  // Parent fields
  studentName?: string;
  section?: string;
  // Admin fields
  adminId?: string;
}

interface SurveyResponse {
  [dimensionId: string]: {
    [questionId: string]: number; // 1-5 scale
  };
}

export function StakeholderSurvey() {
  const { activeSchool } = useAppStore();
  const schoolId = activeSchool?.id || 'default-school';

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

  // Validate parameters, then confirm the assessment event is still open
  useEffect(() => {
    if (!assessmentId || !stakeholderType || !['teacher', 'parent', 'student', 'admin', 'other'].includes(stakeholderType)) {
      setCurrentStep('error');
      setErrorMessage('Invalid survey link. Please check the URL and try again.');
      return;
    }

    isAssessmentEventOpen(assessmentId.trim())
      .then((isOpen) => {
        if (!isOpen) {
          setCurrentStep('error');
          setErrorMessage('This assessment window has closed and is no longer accepting responses. Please contact the school administrator.');
        }
      })
      .catch((error) => {
        console.error('Failed to check assessment status:', error);
        setCurrentStep('error');
        setErrorMessage('Could not verify this survey link. Please try again later.');
      });
  }, [assessmentId, stakeholderType]);

  const totalDimensions = getTotalDimensions();
  const currentDimension = getDimensionByIndex(currentDimensionIndex);

  const handleStartSurvey = () => {
    setCurrentStep('info');
  };

  // Check if personal info is complete based on stakeholder type
  const isPersonalInfoComplete = (): boolean => {
    const typeStr = stakeholderType as StakeholderType;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;

    switch (typeStr) {
      case 'teacher':
        // Teachers: name, email, phone, subject, class, teacherId are required
        return (
          respondentInfo.name.trim().length > 0 &&
          respondentInfo.email && emailRegex.test(respondentInfo.email) &&
          respondentInfo.phone && phoneRegex.test(respondentInfo.phone) &&
          respondentInfo.subject?.trim().length > 0 &&
          respondentInfo.class?.trim().length > 0 &&
          respondentInfo.teacherId?.trim().length > 0
        );
      case 'parent':
        // Parents: name, email, phone, studentName, class, section are required
        return (
          respondentInfo.name.trim().length > 0 &&
          respondentInfo.email && emailRegex.test(respondentInfo.email) &&
          respondentInfo.phone && phoneRegex.test(respondentInfo.phone) &&
          respondentInfo.studentName?.trim().length > 0 &&
          respondentInfo.class?.trim().length > 0 &&
          respondentInfo.section?.trim().length > 0
        );
      case 'student':
        // Students: name and class/section required (no email/phone)
        return (
          respondentInfo.name.trim().length > 0 &&
          respondentInfo.department.trim().length > 0
        );
      case 'admin':
        // Admin: name, email, phone, adminId are required
        return (
          respondentInfo.name.trim().length > 0 &&
          respondentInfo.email && emailRegex.test(respondentInfo.email) &&
          respondentInfo.phone && phoneRegex.test(respondentInfo.phone) &&
          respondentInfo.adminId?.trim().length > 0
        );
      case 'other':
        // Other: any personal info helps
        return respondentInfo.name.trim().length > 0 || respondentInfo.department.trim().length > 0;
      default:
        return true;
    }
  };

  const getPersonalInfoLabel = (): { name: string; dept: string; namePlaceholder: string; deptPlaceholder: string } => {
    const typeStr = stakeholderType as StakeholderType;

    switch (typeStr) {
      case 'teacher':
        return {
          name: 'Name (Required)',
          dept: 'Subject/Department (Optional)',
          namePlaceholder: 'Your full name',
          deptPlaceholder: 'E.g., Mathematics, Science'
        };
      case 'parent':
        return {
          name: 'Name (Required)',
          dept: 'Child\'s Class/Section (Optional)',
          namePlaceholder: 'Your full name',
          deptPlaceholder: 'E.g., Class 10-A'
        };
      case 'student':
        return {
          name: 'Name (Required)',
          dept: 'Class/Section (Required)',
          namePlaceholder: 'Your full name',
          deptPlaceholder: 'E.g., Class 10-A'
        };
      case 'admin':
        return {
          name: 'Name (Optional)',
          dept: 'Position/Role (Optional)',
          namePlaceholder: 'Your name (optional)',
          deptPlaceholder: 'E.g., Principal, Coordinator'
        };
      case 'other':
        return {
          name: 'Name (Optional)',
          dept: 'Your Role (Optional)',
          namePlaceholder: 'Your name (optional)',
          deptPlaceholder: 'E.g., Vendor, Consultant'
        };
      default:
        return {
          name: 'Name',
          dept: 'Department',
          namePlaceholder: 'Your name',
          deptPlaceholder: 'Your department'
        };
    }
  };

  const handleProceedToSurvey = () => {
    // Validate personal info is complete
    if (!isPersonalInfoComplete()) {
      setErrorMessage('Please provide required personal information before proceeding.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setCurrentStep('survey');
    setErrorMessage('');

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
      setErrorMessage('');

      // Validate assessment ID
      if (!assessmentId || assessmentId.trim() === '') {
        throw new Error('Assessment ID is missing or invalid');
      }

      // Validate stakeholder type
      if (!stakeholderType || !['teacher', 'parent', 'student', 'admin', 'other'].includes(stakeholderType)) {
        throw new Error('Stakeholder type is invalid');
      }

      // Re-check in case the assessment was locked after this page loaded
      const isOpen = await isAssessmentEventOpen(assessmentId.trim());
      if (!isOpen) {
        throw new Error('This assessment window has closed and is no longer accepting responses.');
      }

      // Validate we have responses
      if (!responses || Object.keys(responses).length === 0) {
        throw new Error('No survey responses recorded');
      }

      console.log('📋 Submitting assessment response:', {
        assessmentId: assessmentId.trim(),
        stakeholderType,
        respondentName: respondentInfo.name.trim(),
        dimensionsAnswered: Object.keys(responses).length,
      });

      // Write to the same assessments/{id}/responses collection (and field
      // shape: stakeholderType + nested responses[dimensionId][questionId])
      // that the admin's live ResponseTracker, the "Simulate" test-data
      // button, and the diagnostic report engine (dimensionScoring.ts) all
      // already read - see
      // 14-Dimension-Diagnostic-Testing/02-Critical-Defects-Found.md
      // (Defect #1) for why routing this through assessmentService.ts's
      // schools/{schoolId}/assessments/{id} path never reached any of them,
      // and was rejected by the deployed Firestore rules outright.
      const responseRef = await addDoc(collection(db, 'assessments', assessmentId.trim(), 'responses'), {
        assessmentId: assessmentId.trim(),
        stakeholderType,
        responses,
        submittedAt: serverTimestamp(),
        submittedTimestamp: new Date().toISOString(),
        isSimulated: false,
        respondentName: respondentInfo.name.trim() || 'Anonymous',
        respondentId: getRespondentId(),
        ...buildRespondentContactFields(),
      });
      const responseId = responseRef.id;

      console.log('✓ Response saved to Firestore:', responseId);

      // Log audit event (best-effort; anonymous respondents can't write
      // audit logs under the current security rules, but logAuditEvent
      // already swallows its own errors so this never blocks confirmation)
      await logAuditEvent(
        schoolId,
        'ASSESSMENT_RESPONSE_SUBMITTED',
        'assessment_response',
        responseId,
        respondentInfo.email || respondentInfo.name
      );

      setSubmissionId(responseId);
      setCurrentStep('confirmation');
    } catch (error: any) {
      console.error('Error submitting survey:', error);

      let userFriendlyMessage = 'Error submitting survey. Please try again.';

      if (error.message?.includes('Assessment ID')) {
        userFriendlyMessage = 'Invalid assessment link. Please contact the school administrator.';
      } else if (error.message?.includes('Stakeholder type')) {
        userFriendlyMessage = 'Invalid stakeholder type. Please access the survey via the correct link.';
      } else if (error.message?.includes('No survey responses')) {
        userFriendlyMessage = 'No survey responses were recorded. Please complete the assessment.';
      } else if (error.message?.includes('window has closed')) {
        userFriendlyMessage = 'This assessment window has closed and is no longer accepting responses. Please contact the school administrator.';
      } else if (error.code === 'permission-denied') {
        userFriendlyMessage = 'Access denied. The assessment link may have expired.';
      } else if (error.code === 'not-found') {
        userFriendlyMessage = 'Assessment not found. Please check your survey link.';
      }

      setErrorMessage(userFriendlyMessage);
      setCurrentStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to extract respondent ID based on stakeholder type
  const getRespondentId = (): string => {
    const typeStr = stakeholderType as StakeholderType;
    if (typeStr === 'teacher') return respondentInfo.teacherId || '';
    if (typeStr === 'parent') return respondentInfo.studentName || '';
    if (typeStr === 'admin') return respondentInfo.adminId || '';
    return respondentInfo.name || '';
  };

  // Map the role-specific respondent fields into the same field names
  // lib/simulateResponses.ts uses, so admin-side displays/exports treat real
  // and simulated responses identically.
  const buildRespondentContactFields = (): Record<string, any> => {
    const typeStr = stakeholderType as StakeholderType;
    switch (typeStr) {
      case 'teacher':
        return {
          respondentEmail: respondentInfo.email,
          respondentPhone: respondentInfo.phone,
          respondentSubject: respondentInfo.subject,
          respondentClass: respondentInfo.class,
          respondentTeacherId: respondentInfo.teacherId,
        };
      case 'parent':
        return {
          respondentEmail: respondentInfo.email,
          respondentPhone: respondentInfo.phone,
          respondentStudentName: respondentInfo.studentName,
          respondentStudentClass: respondentInfo.class,
          respondentStudentSection: respondentInfo.section,
        };
      case 'admin':
        return {
          respondentEmail: respondentInfo.email,
          respondentPhone: respondentInfo.phone,
          respondentDepartment: respondentInfo.department,
          respondentAdminId: respondentInfo.adminId,
        };
      case 'student':
      case 'other':
      default:
        return {
          respondentDepartment: respondentInfo.department,
        };
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
    const isComplete = isPersonalInfoComplete();
    const typeStr = stakeholderType as StakeholderType;

    const renderFormFields = () => {
      switch (typeStr) {
        case 'teacher':
          return (
            <>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Full Name (Required)</label>
              <input type="text" value={respondentInfo.name} onChange={(e) => setRespondentInfo({ ...respondentInfo, name: e.target.value })} placeholder="Your full name" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${!respondentInfo.name.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>

              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Email (Required)</label>
              <input type="email" value={respondentInfo.email || ''} onChange={(e) => setRespondentInfo({ ...respondentInfo, email: e.target.value })} placeholder="your.email@domain.com" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${respondentInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(respondentInfo.email) ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>

              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number (Required)</label>
              <input type="tel" value={respondentInfo.phone || ''} onChange={(e) => setRespondentInfo({ ...respondentInfo, phone: e.target.value })} placeholder="10-digit phone number" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${respondentInfo.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(respondentInfo.phone) ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>

              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Subject (Required)</label>
              <input type="text" value={respondentInfo.subject || ''} onChange={(e) => setRespondentInfo({ ...respondentInfo, subject: e.target.value })} placeholder="E.g., Mathematics, Science" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${!respondentInfo.subject?.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>

              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Class (Required)</label>
              <input type="text" value={respondentInfo.class || ''} onChange={(e) => setRespondentInfo({ ...respondentInfo, class: e.target.value })} placeholder="E.g., 10-A, 12-B" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${!respondentInfo.class?.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>

              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Teacher ID (Required)</label>
              <input type="text" value={respondentInfo.teacherId || ''} onChange={(e) => setRespondentInfo({ ...respondentInfo, teacherId: e.target.value })} placeholder="Your employee/teacher ID" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${!respondentInfo.teacherId?.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>
            </>
          );

        case 'parent':
          return (
            <>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Full Name (Required)</label>
              <input type="text" value={respondentInfo.name} onChange={(e) => setRespondentInfo({ ...respondentInfo, name: e.target.value })} placeholder="Your full name" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${!respondentInfo.name.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>

              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Email (Required)</label>
              <input type="email" value={respondentInfo.email || ''} onChange={(e) => setRespondentInfo({ ...respondentInfo, email: e.target.value })} placeholder="your.email@domain.com" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${respondentInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(respondentInfo.email) ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>

              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number (Required)</label>
              <input type="tel" value={respondentInfo.phone || ''} onChange={(e) => setRespondentInfo({ ...respondentInfo, phone: e.target.value })} placeholder="10-digit phone number" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${respondentInfo.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(respondentInfo.phone) ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>

              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Student Name (Required)</label>
              <input type="text" value={respondentInfo.studentName || ''} onChange={(e) => setRespondentInfo({ ...respondentInfo, studentName: e.target.value })} placeholder="Your child's name" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${!respondentInfo.studentName?.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>

              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Class (Required)</label>
              <input type="text" value={respondentInfo.class || ''} onChange={(e) => setRespondentInfo({ ...respondentInfo, class: e.target.value })} placeholder="E.g., 10-A, 12-B" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${!respondentInfo.class?.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>

              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Section (Required)</label>
              <input type="text" value={respondentInfo.section || ''} onChange={(e) => setRespondentInfo({ ...respondentInfo, section: e.target.value })} placeholder="E.g., A, B, C" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${!respondentInfo.section?.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>
            </>
          );

        case 'admin':
          return (
            <>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Full Name (Required)</label>
              <input type="text" value={respondentInfo.name} onChange={(e) => setRespondentInfo({ ...respondentInfo, name: e.target.value })} placeholder="Your full name" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${!respondentInfo.name.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>

              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Email (Required)</label>
              <input type="email" value={respondentInfo.email || ''} onChange={(e) => setRespondentInfo({ ...respondentInfo, email: e.target.value })} placeholder="your.email@domain.com" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${respondentInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(respondentInfo.email) ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>

              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number (Required)</label>
              <input type="tel" value={respondentInfo.phone || ''} onChange={(e) => setRespondentInfo({ ...respondentInfo, phone: e.target.value })} placeholder="10-digit phone number" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${respondentInfo.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(respondentInfo.phone) ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>

              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Department/Subject (Required)</label>
              <input type="text" value={respondentInfo.department} onChange={(e) => setRespondentInfo({ ...respondentInfo, department: e.target.value })} placeholder="E.g., Admin, Operations" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${!respondentInfo.department.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>

              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Admin ID (Required)</label>
              <input type="text" value={respondentInfo.adminId || ''} onChange={(e) => setRespondentInfo({ ...respondentInfo, adminId: e.target.value })} placeholder="Your admin/employee ID" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${!respondentInfo.adminId?.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>
            </>
          );

        case 'student':
        default:
          return (
            <>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Full Name (Required)</label>
              <input type="text" value={respondentInfo.name} onChange={(e) => setRespondentInfo({ ...respondentInfo, name: e.target.value })} placeholder="Your full name" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${!respondentInfo.name.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>

              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Class/Section (Required)</label>
              <input type="text" value={respondentInfo.department} onChange={(e) => setRespondentInfo({ ...respondentInfo, department: e.target.value })} placeholder="E.g., 10-A, 12-B" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${!respondentInfo.department.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} /></div>
            </>
          );
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Information</h2>
          <p className="text-gray-600 mb-8">
            {isComplete
              ? '✓ Ready to proceed to the assessment'
              : 'Please provide the required information to continue'}
          </p>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errorMessage}</p>
            </div>
          )}

          <div className="space-y-4">
            {renderFormFields()}

            <div className={`p-4 rounded-lg ${isComplete ? 'bg-green-50 border border-green-200' : 'bg-blue-50'}`}>
              <p className={`text-sm ${isComplete ? 'text-green-800' : 'text-gray-700'}`}>
                {isComplete
                  ? '✓ All required information provided. You can now proceed.'
                  : 'ℹ️ All fields marked as "Required" must be completed to continue.'}
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
              disabled={!isComplete}
              className={`flex-1 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isComplete
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
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

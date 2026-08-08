import React, { useState } from 'react';
import { Users, BookOpen, Users2, Shield, UserPlus, Plus, Minus, Play, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  createAssessmentConfiguration,
  initializeAssessmentProgress,
  StakeholderType,
} from '../../lib/multiUserAssessment';

interface AssessmentConfigurationProps {
  schoolId: string;
  schoolName: string;
  onConfigComplete: (config: any, progress: any) => void;
  onCancel: () => void;
}

const STAKEHOLDER_TYPES = [
  {
    type: 'teacher' as StakeholderType,
    label: 'Teachers',
    description: 'Faculty members & instructors',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-700',
  },
  {
    type: 'parent' as StakeholderType,
    label: 'Parents/Guardians',
    description: 'Parent and guardian respondents',
    icon: <Users2 className="w-6 h-6" />,
    color: 'bg-green-50 border-green-200',
    textColor: 'text-green-700',
  },
  {
    type: 'student' as StakeholderType,
    label: 'Students (Grade 8+)',
    description: 'Student feedback (secondary & senior)',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-purple-50 border-purple-200',
    textColor: 'text-purple-700',
  },
  {
    type: 'admin' as StakeholderType,
    label: 'Admin Staff',
    description: 'Administrative & support staff',
    icon: <Shield className="w-6 h-6" />,
    color: 'bg-orange-50 border-orange-200',
    textColor: 'text-orange-700',
  },
  {
    type: 'other' as StakeholderType,
    label: 'Other',
    description: 'Other stakeholders (optional)',
    icon: <UserPlus className="w-6 h-6" />,
    color: 'bg-gray-50 border-gray-200',
    textColor: 'text-gray-700',
  },
];

export function AssessmentConfiguration({
  schoolId,
  schoolName,
  onConfigComplete,
  onCancel,
}: AssessmentConfigurationProps) {
  const [respondentCounts, setRespondentCounts] = useState<Record<StakeholderType, number>>({
    teacher: 15,
    parent: 20,
    student: 50,
    admin: 5,
    other: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCountChange = (type: StakeholderType, value: number) => {
    if (value < 0) return;
    setRespondentCounts((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleIncrement = (type: StakeholderType) => {
    handleCountChange(type, respondentCounts[type] + 1);
  };

  const handleDecrement = (type: StakeholderType) => {
    handleCountChange(type, Math.max(0, respondentCounts[type] - 1));
  };

  const totalExpected = Object.values(respondentCounts).reduce((a, b) => a + b, 0);
  const hasRequiredStakeholders = respondentCounts.teacher > 0 || respondentCounts.parent > 0 || respondentCounts.student > 0;

  const handleProceed = async () => {
    if (!hasRequiredStakeholders) {
      alert('Please set at least one expected respondent count');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create configuration
      const config = createAssessmentConfiguration(schoolId, schoolName, respondentCounts);

      // Initialize progress
      const progress = initializeAssessmentProgress(config);

      // Callback
      onConfigComplete(config, progress);
    } catch (error) {
      console.error('Error creating assessment configuration:', error);
      alert('Failed to create assessment configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg mb-8 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Assessment Configuration</h2>
        <p className="text-gray-600">
          Set the expected number of respondents for each stakeholder type.
          These counts will track your assessment progress.
        </p>
      </div>

      {/* School Info */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h3 className="font-semibold text-gray-800 mb-2">School Information</h3>
        <p className="text-gray-600">{schoolName}</p>
      </div>

      {/* Respondent Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-6">Expected Respondents</h3>

        <div className="space-y-4">
          {STAKEHOLDER_TYPES.map((stakeholder) => (
            <div key={stakeholder.type} className={`border rounded-lg p-4 ${stakeholder.color}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={stakeholder.textColor}>{stakeholder.icon}</div>
                  <div>
                    <h4 className={`font-semibold ${stakeholder.textColor}`}>{stakeholder.label}</h4>
                    <p className="text-sm text-gray-600">{stakeholder.description}</p>
                  </div>
                </div>
              </div>

              {/* Counter */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDecrement(stakeholder.type)}
                  className={`p-2 rounded hover:bg-white transition ${stakeholder.textColor}`}
                  disabled={respondentCounts[stakeholder.type] === 0}
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="number"
                  min="0"
                  value={respondentCounts[stakeholder.type]}
                  onChange={(e) => handleCountChange(stakeholder.type, parseInt(e.target.value) || 0)}
                  className={`w-16 px-3 py-2 text-center border-2 rounded font-bold text-lg ${stakeholder.textColor}`}
                />

                <button
                  onClick={() => handleIncrement(stakeholder.type)}
                  className={`p-2 rounded hover:bg-white transition ${stakeholder.textColor}`}
                >
                  <Plus className="w-4 h-4" />
                </button>

                <span className="text-sm text-gray-600 ml-2">expected respondents</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Assessment Summary</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Expected Respondents</p>
            <p className="text-2xl font-bold text-blue-600">{totalExpected}</p>
          </div>

          <div>
            <p className="text-gray-600">Stakeholder Types</p>
            <p className="text-2xl font-bold text-blue-600">
              {[
                respondentCounts.teacher > 0,
                respondentCounts.parent > 0,
                respondentCounts.student > 0,
                respondentCounts.admin > 0,
                respondentCounts.other > 0,
              ].filter(Boolean).length} of 5
            </p>
          </div>
        </div>
      </div>

      {/* Validation Warning */}
      {!hasRequiredStakeholders && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900">At least one respondent required</h4>
            <p className="text-sm text-yellow-800">
              Please set an expected count for at least one stakeholder type (Teacher, Parent, or Student)
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>

        <button
          onClick={handleProceed}
          disabled={!hasRequiredStakeholders || isSubmitting}
          className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
            hasRequiredStakeholders && !isSubmitting
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Play className="w-4 h-4" />
          {isSubmitting ? 'Creating...' : 'Proceed to Assessment'}
        </button>
      </div>
    </div>
  );
}

export default AssessmentConfiguration;
